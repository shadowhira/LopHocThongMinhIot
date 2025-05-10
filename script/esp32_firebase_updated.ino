#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"
#include <SPI.h>
#include <MFRC522.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SH110X.h>
#include <DHT.h>
#include <math.h>

// --- Khai báo chân kết nối ---
#define SS_PIN 5
#define RST_PIN 4
#define BUZZER_PIN 27
#define LED_PIN 14
#define BUTTON_PIN 13
#define MQ2_PIN 32
#define DHT_PIN 26
#define FLAME_PIN 25

// Firebase & WiFi
// Firebase config
#define API_KEY "AIzaSyDUxUmjO2IpXlttgYnGtogv6DRbXE8Aqm8"
#define FIREBASE_PROJECT_ID "phucdu-b1fb2"
#define USER_EMAIL "phucdu@gmail.com"
#define USER_PASSWORD "banbanhmy"
const char* ssid = "Xuantruong";
const char* password = "1234567890";
const char* scriptUrl = "https://script.google.com/macros/s/AKfycbxzjxuyfTwyfeiC58acN-kOGSL5VbzS_I5SfgOAM77Jc8hmagMKqLHdpygwcuxNc_0s/exec";

// DHT & OLED
#define DHT_TYPE DHT11
DHT dht(DHT_PIN, DHT_TYPE);
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SH1106G display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// MQ2 thông số
#define RL 5.0
#define VCC 5.0
float Ro = 10.0;
float A = 1000;
float B = -2.2;

// Firebase
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// RFID và trạng thái
MFRC522 mfrc522(SS_PIN, RST_PIN);
bool checkOut = false;
bool checkInSuccess = false;
bool isDisplayingMessage = false;

// Ngưỡng cảnh báo
float tempMin = 18.0;
float tempMax = 30.0;
float humidMin = 40.0;
float humidMax = 80.0;
float gasThreshold = 1000.0;

// Biến theo dõi cảnh báo
bool tempAlert = false;
bool humidAlert = false;
bool gasAlert = false;
bool flameAlert = false;

// Thời gian
unsigned long lastSensorUpdate = 0;
unsigned long lastAlertCheck = 0;
const unsigned long SENSOR_UPDATE_INTERVAL = 5000; // 5 giây
const unsigned long ALERT_CHECK_INTERVAL = 10000; // 10 giây

void IRAM_ATTR buttonPressed() {
  checkOut = !checkOut;
}

void setup() {
  Serial.begin(115200);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(500);
  Serial.println("WiFi connected");

  // Khởi tạo Firebase
  config.api_key = API_KEY;
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;
  config.token_status_callback = tokenStatusCallback;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  SPI.begin();
  mfrc522.PCD_Init();
  dht.begin();
  pinMode(FLAME_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(BUTTON_PIN), buttonPressed, FALLING);

  if (!display.begin(0x3C, true))
    while (1)
      ;
  display.display();
  delay(2000);
  display.clearDisplay();
  
  // Đọc ngưỡng cảnh báo từ Firebase
  readThresholds();
}

void loop() {
  unsigned long currentMillis = millis();
  
  // Cập nhật dữ liệu cảm biến theo định kỳ
  if (currentMillis - lastSensorUpdate >= SENSOR_UPDATE_INTERVAL) {
    updateSensors();
    lastSensorUpdate = currentMillis;
  }
  
  // Kiểm tra cảnh báo theo định kỳ
  if (currentMillis - lastAlertCheck >= ALERT_CHECK_INTERVAL) {
    checkAlerts();
    lastAlertCheck = currentMillis;
  }
  
  // Đọc thẻ RFID
  if (!mfrc522.PICC_IsNewCardPresent() || !mfrc522.PICC_ReadCardSerial()) {
    if (!isDisplayingMessage) updateDisplay();
    return;
  }

  String cardID = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) cardID += String(mfrc522.uid.uidByte[i], HEX);
  cardID.toUpperCase();
  Serial.println("\n📌 Mã thẻ: " + cardID);

  bool checkInSuccess = sendToGoogleSheets(cardID, checkOut);
  bool firebaseSuccess = sendToFirebase(cardID, checkOut);
  delay(2000);

  if (checkInSuccess) displayCheckInSuccess();
  else displayCheckInFailed();

  if (firebaseSuccess) Serial.println("✅ Firebase OK");
  else Serial.println("❌ Firebase lỗi");
}

void readThresholds() {
  if (Firebase.ready()) {
    // Đọc ngưỡng nhiệt độ
    if (Firebase.RTDB.getFloat(&fbdo, "settings/thresholds/temperature/min")) {
      tempMin = fbdo.floatData();
    }
    if (Firebase.RTDB.getFloat(&fbdo, "settings/thresholds/temperature/max")) {
      tempMax = fbdo.floatData();
    }
    
    // Đọc ngưỡng độ ẩm
    if (Firebase.RTDB.getFloat(&fbdo, "settings/thresholds/humidity/min")) {
      humidMin = fbdo.floatData();
    }
    if (Firebase.RTDB.getFloat(&fbdo, "settings/thresholds/humidity/max")) {
      humidMax = fbdo.floatData();
    }
    
    // Đọc ngưỡng khí gas
    if (Firebase.RTDB.getFloat(&fbdo, "settings/thresholds/gas")) {
      gasThreshold = fbdo.floatData();
    }
    
    Serial.println("Đã đọc ngưỡng cảnh báo từ Firebase");
  }
}

void updateSensors() {
  float gas_ppm = readMQ2(MQ2_PIN);
  float temp = dht.readTemperature();
  float humi = dht.readHumidity();
  int flame_status = digitalRead(FLAME_PIN);
  bool fireDetected = (flame_status == 0);
  bool gasDanger = (gas_ppm > gasThreshold);
  bool tempDanger = (temp < tempMin || temp > tempMax);
  bool humidDanger = (humi < humidMin || humi > humidMax);
  String status = (fireDetected || gasDanger || tempDanger || humidDanger) ? "NGUY HIEM" : "AN TOAN";
  
  // Cập nhật dữ liệu cảm biến hiện tại
  if (Firebase.ready()) {
    FirebaseJson json;
    json.set("temperature", temp);
    json.set("humidity", humi);
    json.set("gas", gas_ppm);
    json.set("flame", fireDetected);
    json.set("status", status);
    json.set("updatedAt", getCurrentTimestamp());
    
    if (Firebase.RTDB.updateNode(&fbdo, "sensors/current", &json)) {
      Serial.println("✅ Cập nhật dữ liệu cảm biến thành công");
    } else {
      Serial.println("❌ Lỗi cập nhật dữ liệu cảm biến: " + fbdo.errorReason());
    }
    
    // Lưu lịch sử dữ liệu cảm biến
    String historyPath = "sensors/history/" + String(getCurrentTimestamp());
    if (Firebase.RTDB.setJSON(&fbdo, historyPath, &json)) {
      Serial.println("✅ Lưu lịch sử cảm biến thành công");
    }
  }
  
  // Cập nhật trạng thái cảnh báo
  tempAlert = tempDanger;
  humidAlert = humidDanger;
  gasAlert = gasDanger;
  flameAlert = fireDetected;
  
  // Bật buzzer nếu có cảnh báo
  digitalWrite(BUZZER_PIN, (fireDetected || gasDanger || tempDanger || humidDanger) ? HIGH : LOW);
  
  Serial.printf("Gas: %.0f ppm | Temp: %.1f C | Humi: %.1f %% | %s\n",
                gas_ppm, temp, humi, status.c_str());
}

void updateDisplay() {
  if (Firebase.ready()) {
    FirebaseJson json;
    FirebaseData fbdo;
    
    if (Firebase.RTDB.getJSON(&fbdo, "sensors/current")) {
      FirebaseJson &json = fbdo.jsonObject();
      FirebaseJsonData temperature;
      FirebaseJsonData humidity;
      FirebaseJsonData gas;
      FirebaseJsonData flame;
      FirebaseJsonData status;
      
      json.get(temperature, "temperature");
      json.get(humidity, "humidity");
      json.get(gas, "gas");
      json.get(flame, "flame");
      json.get(status, "status");
      
      display.clearDisplay();
      display.setTextSize(1);
      display.setTextColor(SH110X_WHITE);
      
      display.setCursor(0, 0);
      display.printf("Gas: %.0f ppm\n", gas.floatValue);
      
      display.setCursor(0, 10);
      display.printf("Nhiet do: %.1f C\n", temperature.floatValue);
      
      display.setCursor(0, 20);
      display.printf("Do am: %.1f %%\n", humidity.floatValue);
      
      display.setCursor(0, 30);
      display.printf("Flame: %s\n", flame.boolValue ? "FIRE!" : "Safe");
      
      display.setCursor(0, 40);
      display.printf("Status: %s\n", status.stringValue.c_str());
      
      display.display();
    }
  }
}

void checkAlerts() {
  if (Firebase.ready()) {
    // Kiểm tra cảnh báo nhiệt độ
    if (tempAlert) {
      float temp = 0;
      if (Firebase.RTDB.getFloat(&fbdo, "sensors/current/temperature")) {
        temp = fbdo.floatData();
      }
      
      String alertType = (temp < tempMin) ? "temperature_low" : "temperature_high";
      String alertMessage = (temp < tempMin) 
        ? "Nhiệt độ quá thấp: " + String(temp, 1) + "°C (ngưỡng: " + String(tempMin, 1) + "°C)"
        : "Nhiệt độ quá cao: " + String(temp, 1) + "°C (ngưỡng: " + String(tempMax, 1) + "°C)";
      
      createAlert(alertType, temp, (temp < tempMin) ? tempMin : tempMax, alertMessage);
    }
    
    // Kiểm tra cảnh báo độ ẩm
    if (humidAlert) {
      float humid = 0;
      if (Firebase.RTDB.getFloat(&fbdo, "sensors/current/humidity")) {
        humid = fbdo.floatData();
      }
      
      String alertType = (humid < humidMin) ? "humidity_low" : "humidity_high";
      String alertMessage = (humid < humidMin) 
        ? "Độ ẩm quá thấp: " + String(humid, 1) + "% (ngưỡng: " + String(humidMin, 1) + "%)"
        : "Độ ẩm quá cao: " + String(humid, 1) + "% (ngưỡng: " + String(humidMax, 1) + "%)";
      
      createAlert(alertType, humid, (humid < humidMin) ? humidMin : humidMax, alertMessage);
    }
    
    // Kiểm tra cảnh báo khí gas
    if (gasAlert) {
      float gas = 0;
      if (Firebase.RTDB.getFloat(&fbdo, "sensors/current/gas")) {
        gas = fbdo.floatData();
      }
      
      String alertMessage = "Nồng độ khí gas cao: " + String(gas, 0) + " ppm (ngưỡng: " + String(gasThreshold, 0) + " ppm)";
      createAlert("gas", gas, gasThreshold, alertMessage);
    }
    
    // Kiểm tra cảnh báo lửa
    if (flameAlert) {
      String alertMessage = "PHÁT HIỆN LỬA!";
      createAlert("flame", 1, 0, alertMessage);
    }
  }
}

void createAlert(String type, float value, float threshold, String message) {
  if (Firebase.ready()) {
    // Tạo ID cảnh báo dựa trên timestamp
    String alertId = String(getCurrentTimestamp());
    
    FirebaseJson json;
    json.set("type", type);
    json.set("value", value);
    json.set("threshold", threshold);
    json.set("timestamp", getCurrentTimestamp());
    json.set("status", "new");
    json.set("message", message);
    
    String alertPath = "alerts/active/" + alertId;
    if (Firebase.RTDB.setJSON(&fbdo, alertPath, &json)) {
      Serial.println("✅ Tạo cảnh báo thành công: " + message);
    } else {
      Serial.println("❌ Lỗi tạo cảnh báo: " + fbdo.errorReason());
    }
  }
}

unsigned long getCurrentTimestamp() {
  return millis(); // Trong thực tế, nên sử dụng NTP để lấy thời gian chính xác
}

bool sendToGoogleSheets(String cardID, bool isCheckOut) {
  if (WiFi.status() != WL_CONNECTED) return false;
  HTTPClient http;
  String action = isCheckOut ? "checkout" : "checkin";
  String url = String(scriptUrl) + "?action=" + action + "&rfid=" + cardID;
  http.begin(url);
  http.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);
  int httpResponseCode = http.GET();
  if (httpResponseCode > 0) {
    String response = http.getString();
    DynamicJsonDocument doc(1024);
    if (deserializeJson(doc, response) == DeserializationError::Ok) {
      String status = doc["status"].as<String>();
      String message = doc["message"].as<String>();
      Serial.println(message);
      if (status == "success") {
        digitalWrite(BUZZER_PIN, HIGH);
        delay(500);
        digitalWrite(BUZZER_PIN, LOW);
        if (!isCheckOut) digitalWrite(LED_PIN, HIGH);
        return true;
      }
    }
  }
  http.end();
  return false;
}

bool sendToFirebase(String cardID, bool isCheckOut) {
  if (Firebase.ready()) {
    // Lấy ngày hiện tại theo định dạng YYYYMMDD
    String date = "20230501"; // Trong thực tế, nên sử dụng NTP để lấy ngày chính xác
    
    // Lấy thông tin sinh viên
    String studentName = "Unknown";
    if (Firebase.RTDB.getString(&fbdo, "students/" + cardID + "/name")) {
      studentName = fbdo.stringData();
    }
    
    // Cập nhật dữ liệu điểm danh
    FirebaseJson json;
    String attendancePath = "attendance/" + date + "/" + cardID;
    
    if (isCheckOut) {
      json.set("out", getCurrentTimestamp());
      json.set("status", "present");
    } else {
      json.set("in", getCurrentTimestamp());
      json.set("status", "present");
    }
    
    if (Firebase.RTDB.updateNode(&fbdo, attendancePath, &json)) {
      Serial.println("✅ Cập nhật điểm danh thành công");
      return true;
    } else {
      Serial.println("❌ Lỗi cập nhật điểm danh: " + fbdo.errorReason());
      return false;
    }
  }
  return false;
}

float readMQ2(int analogPin) {
  int adcValue = analogRead(analogPin);
  float voltage = adcValue * (VCC / 4095.0);
  float Rs = (VCC - voltage) / voltage * RL;
  float ratio = Rs / Ro;
  return A * pow(ratio, B);
}

void displayCheckInSuccess() {
  isDisplayingMessage = true;
  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(SH110X_WHITE);
  display.setCursor(0, 20);
  display.println("✅ Thanh cong");
  display.display();
  delay(2000);
  isDisplayingMessage = false;
}

void displayCheckInFailed() {
  isDisplayingMessage = true;
  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(SH110X_WHITE);
  display.setCursor(0, 20);
  display.println("❌ That bai");
  display.display();
  delay(2000);
  isDisplayingMessage = false;
}
