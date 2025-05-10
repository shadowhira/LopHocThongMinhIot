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
#include <ESP32Servo.h>

// --- Khai báo chân kết nối ---
#define SS_PIN 5
#define RST_PIN 4
#define BUZZER_PIN 27
#define LED_PIN 14
#define BUTTON_PIN 13
#define MQ2_PIN 32
#define DHT_PIN 26
#define FLAME_PIN 25
#define SERVO_PIN 12      // Chân điều khiển servo
#define PIR_PIN 33        // Chân cảm biến chuyển động PIR SR501

// Firebase & WiFi
#define API_KEY "AIzaSyAxAR_UUEaXdJl7SMo8vhbPcDcLvvGSM0w"
#define DATABASE_URL "https://doantotnghiep-ae0f8-default-rtdb.asia-southeast1.firebasedatabase.app/"
#define FIREBASE_PROJECT_ID "doantotnghiep-ae0f8"
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

// Ngưỡng thời gian điểm danh
int checkInHour = 7;   // Giờ bắt đầu điểm danh vào (7:00)
int checkInMinute = 0;
int checkOutHour = 11;  // Giờ bắt đầu điểm danh ra (11:00)
int checkOutMinute = 0;

// Biến theo dõi cảnh báo
bool tempAlert = false;
bool humidAlert = false;
bool gasAlert = false;
bool flameAlert = false;

// Servo
Servo doorServo;
int servoClosedPosition = 0;    // Vị trí đóng cửa (0 độ)
int servoOpenPosition = 90;     // Vị trí mở cửa (90 độ)

// Biến lưu trạng thái thiết bị
bool lightState = false;
bool doorState = false;
bool lightAutoMode = false;
bool doorAutoMode = false;
bool motionDetected = false;

// Thời gian
unsigned long lastSensorUpdate = 0;
unsigned long lastAlertCheck = 0;
unsigned long lastDeviceCheck = 0;
unsigned long lastMotionCheck = 0;
unsigned long lastMotionDetected = 0;
unsigned long lastDoorOpened = 0;
const unsigned long SENSOR_UPDATE_INTERVAL = 5000; // 5 giây
const unsigned long ALERT_CHECK_INTERVAL = 10000; // 10 giây
const unsigned long DEVICE_CHECK_INTERVAL = 1000; // 1 giây
const unsigned long MOTION_CHECK_INTERVAL = 500; // 0.5 giây
const unsigned long AUTO_OFF_DELAY = 10000; // 10 giây

void IRAM_ATTR buttonPressed() {
  checkOut = !checkOut;
}

void setup() {
  Serial.begin(115200);
  Serial.println("Khởi động hệ thống lớp học thông minh...");

  // Kết nối WiFi
  WiFi.begin(ssid, password);
  Serial.print("Đang kết nối WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Đã kết nối WiFi, IP: ");
  Serial.println(WiFi.localIP());

  // Khởi tạo Firebase
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  config.token_status_callback = tokenStatusCallback;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  // Khởi tạo các cảm biến và thiết bị
  SPI.begin();
  mfrc522.PCD_Init();
  dht.begin();
  pinMode(FLAME_PIN, INPUT);
  pinMode(PIR_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(BUTTON_PIN), buttonPressed, FALLING);

  // Khởi tạo màn hình OLED
  if (!display.begin(0x3C, true)) {
    Serial.println("Không thể kết nối với màn hình OLED!");
    while (1);
  }
  display.display();
  delay(2000);
  display.clearDisplay();

  // Khởi tạo servo
  ESP32PWM::allocateTimer(0);
  doorServo.setPeriodHertz(50);    // Tần số PWM cho servo (50Hz)
  doorServo.attach(SERVO_PIN, 500, 2400); // Chân, min pulse width, max pulse width
  doorServo.write(servoClosedPosition); // Mặc định đóng cửa

  // Đọc ngưỡng cảnh báo từ Firebase
  readThresholds();

  // Khởi tạo trạng thái thiết bị trên Firebase
  initDeviceStatus();

  // Khởi tạo chế độ tự động
  initAutoMode();

  Serial.println("Hệ thống đã sẵn sàng!");
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

  // Kiểm tra điều khiển thiết bị theo định kỳ
  if (currentMillis - lastDeviceCheck >= DEVICE_CHECK_INTERVAL) {
    checkDeviceControls();
    lastDeviceCheck = currentMillis;
  }

  // Kiểm tra cảm biến chuyển động theo định kỳ
  if (currentMillis - lastMotionCheck >= MOTION_CHECK_INTERVAL) {
    checkMotion();
    lastMotionCheck = currentMillis;
  }

  // Kiểm tra chế độ tự động
  checkAutoMode(currentMillis);

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

// Khởi tạo trạng thái thiết bị trên Firebase
void initDeviceStatus() {
  if (Firebase.ready()) {
    // Khởi tạo nút devices nếu chưa tồn tại
    FirebaseJson json;

    // Khởi tạo trạng thái đèn
    json.set("lights/light1", false);
    json.set("status/light1", false);

    // Khởi tạo trạng thái cửa
    json.set("doors/door1", false);
    json.set("status/door1", false);

    // Khởi tạo trạng thái chuyển động
    json.set("motion/detected", false);
    json.set("motion/lastDetected", 0);

    if (Firebase.RTDB.updateNode(&fbdo, "devices", &json)) {
      Serial.println("✅ Khởi tạo trạng thái thiết bị thành công");
    } else {
      Serial.println("❌ Lỗi khởi tạo trạng thái thiết bị: " + fbdo.errorReason());
    }
  }
}

// Khởi tạo chế độ tự động
void initAutoMode() {
  if (Firebase.ready()) {
    FirebaseJson json;

    // Khởi tạo chế độ tự động
    json.set("auto/light", false);
    json.set("auto/door", false);

    if (Firebase.RTDB.updateNode(&fbdo, "devices", &json)) {
      Serial.println("✅ Khởi tạo chế độ tự động thành công");
    } else {
      Serial.println("❌ Lỗi khởi tạo chế độ tự động: " + fbdo.errorReason());
    }
  }
}

// Hàm kiểm tra và cập nhật trạng thái thiết bị
void checkDeviceControls() {
  if (Firebase.ready()) {
    // Kiểm tra chế độ tự động cho đèn
    if (Firebase.RTDB.getBool(&fbdo, "devices/auto/light")) {
      lightAutoMode = fbdo.boolData();
    }

    // Kiểm tra chế độ tự động cho cửa
    if (Firebase.RTDB.getBool(&fbdo, "devices/auto/door")) {
      doorAutoMode = fbdo.boolData();
    }

    // Kiểm tra trạng thái đèn (chỉ khi không ở chế độ tự động)
    if (!lightAutoMode) {
      if (Firebase.RTDB.getBool(&fbdo, "devices/lights/light1")) {
        bool newLightState = fbdo.boolData();
        if (newLightState != lightState) {
          lightState = newLightState;
          controlLight(lightState);
        }
      }
    }

    // Kiểm tra trạng thái cửa (chỉ khi không ở chế độ tự động)
    if (!doorAutoMode) {
      if (Firebase.RTDB.getBool(&fbdo, "devices/doors/door1")) {
        bool newDoorState = fbdo.boolData();
        if (newDoorState != doorState) {
          doorState = newDoorState;
          controlDoor(doorState);
        }
      }
    }
  }
}

// Kiểm tra cảm biến chuyển động
void checkMotion() {
  bool currentMotion = digitalRead(PIR_PIN) == HIGH;

  // Nếu phát hiện chuyển động và trạng thái thay đổi
  if (currentMotion && !motionDetected) {
    motionDetected = true;
    lastMotionDetected = millis();

    // Cập nhật trạng thái chuyển động lên Firebase
    if (Firebase.ready()) {
      FirebaseJson json;
      json.set("detected", true);
      json.set("lastDetected", getCurrentTimestamp());

      if (Firebase.RTDB.updateNode(&fbdo, "devices/motion", &json)) {
        Serial.println("✅ Cập nhật trạng thái chuyển động thành công");
      } else {
        Serial.println("❌ Lỗi cập nhật trạng thái chuyển động: " + fbdo.errorReason());
      }
    }

    // Nếu đang ở chế độ tự động, bật đèn
    if (lightAutoMode) {
      controlLight(true);
    }
  }
  // Nếu không phát hiện chuyển động nhưng trạng thái vẫn là đang phát hiện
  else if (!currentMotion && motionDetected) {
    // Chỉ cập nhật trạng thái sau khi đã hết thời gian delay
    if (millis() - lastMotionDetected >= AUTO_OFF_DELAY) {
      motionDetected = false;

      // Cập nhật trạng thái chuyển động lên Firebase
      if (Firebase.ready()) {
        FirebaseJson json;
        json.set("detected", false);

        if (Firebase.RTDB.updateNode(&fbdo, "devices/motion", &json)) {
          Serial.println("✅ Cập nhật trạng thái chuyển động thành công");
        } else {
          Serial.println("❌ Lỗi cập nhật trạng thái chuyển động: " + fbdo.errorReason());
        }
      }

      // Nếu đang ở chế độ tự động, tắt đèn
      if (lightAutoMode) {
        controlLight(false);
      }
    }
  }
}

// Kiểm tra chế độ tự động
void checkAutoMode(unsigned long currentMillis) {
  // Chế độ tự động cho cửa
  if (doorAutoMode && doorState) {
    // Nếu cửa đang mở và đã qua thời gian delay
    if (currentMillis - lastDoorOpened >= AUTO_OFF_DELAY) {
      // Tự động đóng cửa
      controlDoor(false);
    }
  }
}

// Điều khiển đèn
void controlLight(bool state) {
  digitalWrite(LED_PIN, state ? HIGH : LOW);
  Serial.println(state ? "Đèn: BẬT" : "Đèn: TẮT");

  // Cập nhật trạng thái thực tế lên Firebase
  if (Firebase.RTDB.setBool(&fbdo, "devices/status/light1", state)) {
    Serial.println("✅ Cập nhật trạng thái đèn thành công");
  } else {
    Serial.println("❌ Lỗi cập nhật trạng thái đèn: " + fbdo.errorReason());
  }
}

// Điều khiển cửa (servo)
void controlDoor(bool state) {
  int position = state ? servoOpenPosition : servoClosedPosition;
  doorServo.write(position);
  Serial.println(state ? "Cửa: MỞ" : "Cửa: ĐÓNG");

  // Cập nhật trạng thái thực tế lên Firebase
  if (Firebase.RTDB.setBool(&fbdo, "devices/status/door1", state)) {
    Serial.println("✅ Cập nhật trạng thái cửa thành công");
  } else {
    Serial.println("❌ Lỗi cập nhật trạng thái cửa: " + fbdo.errorReason());
  }
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

    // Đọc ngưỡng thời gian điểm danh
    if (Firebase.RTDB.getInt(&fbdo, "settings/attendance/checkInHour")) {
      checkInHour = fbdo.intData();
    }
    if (Firebase.RTDB.getInt(&fbdo, "settings/attendance/checkInMinute")) {
      checkInMinute = fbdo.intData();
    }
    if (Firebase.RTDB.getInt(&fbdo, "settings/attendance/checkOutHour")) {
      checkOutHour = fbdo.intData();
    }
    if (Firebase.RTDB.getInt(&fbdo, "settings/attendance/checkOutMinute")) {
      checkOutMinute = fbdo.intData();
    }

    Serial.println("Đã đọc ngưỡng cảnh báo và thời gian điểm danh từ Firebase");
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

      // Hiển thị trạng thái thiết bị
      display.setCursor(0, 50);
      display.printf("Den: %s | Cua: %s",
                    lightState ? "ON" : "OFF",
                    doorState ? "MO" : "DONG");

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

bool sendToFirebase(String cardID, bool manualCheckOut) {
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

    // Kiểm tra xem sinh viên đã điểm danh vào chưa
    bool hasCheckedIn = false;
    unsigned long inTimestamp = 0;

    if (Firebase.RTDB.get(&fbdo, attendancePath)) {
      if (fbdo.dataType() == "json") {
        FirebaseJson &jsonData = fbdo.jsonObject();
        FirebaseJsonData inData;
        jsonData.get(inData, "in");

        if (inData.success) {
          hasCheckedIn = true;
          inTimestamp = inData.intValue;
        }
      }
    }

    // Xác định thời điểm hiện tại
    unsigned long currentTime = getCurrentTimestamp();

    // Giả lập thời gian hiện tại (giờ và phút) từ millis()
    // Trong thực tế, nên sử dụng NTP để lấy thời gian chính xác
    unsigned long millisInDay = millis() % 86400000; // Số milli giây trong ngày hiện tại
    int currentHour = (millisInDay / 3600000) % 24;
    int currentMinute = (millisInDay / 60000) % 60;

    // Tính toán thời điểm ngưỡng điểm danh ra
    int checkOutTimeInMinutes = checkOutHour * 60 + checkOutMinute;
    int currentTimeInMinutes = currentHour * 60 + currentMinute;

    // Xác định xem đây là điểm danh vào hay ra
    bool isCheckOut = manualCheckOut || (currentTimeInMinutes >= checkOutTimeInMinutes);

    Serial.print("Thời gian hiện tại: ");
    Serial.print(currentHour);
    Serial.print(":");
    Serial.print(currentMinute);
    Serial.print(" | Ngưỡng điểm danh ra: ");
    Serial.print(checkOutHour);
    Serial.print(":");
    Serial.println(checkOutMinute);

    if (isCheckOut) {
      // Nếu là điểm danh ra
      if (hasCheckedIn) {
        // Chỉ cập nhật giờ ra nếu chưa có
        if (!Firebase.RTDB.get(&fbdo, attendancePath + "/out") || fbdo.dataType() == "null") {
          json.set("out", currentTime);
          json.set("status", "present");
          Serial.println("📝 Điểm danh ra");
        } else {
          Serial.println("⚠️ Sinh viên đã điểm danh ra rồi");
          return true; // Vẫn trả về true vì không phải lỗi
        }
      } else {
        // Nếu chưa điểm danh vào, tạo cả giờ vào và giờ ra
        json.set("in", currentTime);
        json.set("out", currentTime);
        json.set("status", "present");
        Serial.println("📝 Tạo cả điểm danh vào và ra");
      }
    } else {
      // Nếu là điểm danh vào
      if (!hasCheckedIn) {
        // Chỉ tạo điểm danh vào nếu chưa có
        json.set("in", currentTime);
        json.set("status", "present");
        Serial.println("📝 Điểm danh vào");

        // Nếu đang ở chế độ tự động, mở cửa
        if (doorAutoMode) {
          controlDoor(true);
          lastDoorOpened = millis();
        }
      } else {
        Serial.println("⚠️ Sinh viên đã điểm danh vào rồi");

        // Vẫn mở cửa nếu đang ở chế độ tự động
        if (doorAutoMode) {
          controlDoor(true);
          lastDoorOpened = millis();
        }

        return true; // Vẫn trả về true vì không phải lỗi
      }
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
