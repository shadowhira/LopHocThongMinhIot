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
#define API_KEY "AIzaSyAxAR_UUEaXdJl7SMo8vhbPcDcLvvGSM0w"
#define DATABASE_URL "https://doantotnghiep-ae0f8-default-rtdb.asia-southeast1.firebasedatabase.app/"
const char* ssid = "Tenda_189718";
const char* password = "88888888";
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
bool signupOK = false;

// Firebase
FirebaseData firebaseData;
FirebaseAuth auth;
FirebaseConfig config;

// RFID và trạng thái
MFRC522 mfrc522(SS_PIN, RST_PIN);
bool checkOut = false;
bool checkInSuccess = false;
bool isDisplayingMessage = false;

void IRAM_ATTR buttonPressed() {
  checkOut = !checkOut;
}

void setup() {
  Serial.begin(115200);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(500);

  // Khởi tạo Firebase
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  if (Firebase.signUp(&config, &auth, "", "")) {
      signupOK = true;
    }
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
}

void loop() {
  if (!mfrc522.PICC_IsNewCardPresent() || !mfrc522.PICC_ReadCardSerial()) {
    if (!isDisplayingMessage) updateSensors();
    return;
  }

  String cardID = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) cardID += String(mfrc522.uid.uidByte[i], HEX);
  cardID.toUpperCase();
  Serial.println("\n📌 Mã thẻ: " + cardID);

  checkInSuccess = sendToGoogleSheets(cardID, checkOut);
  bool firebaseSuccess = sendToFirebase(cardID, checkOut);
  delay(2000);

  if (checkInSuccess) displayCheckInSuccess();
  else displayCheckInFailed();

  if (firebaseSuccess) Serial.println("✅ Firebase OK");
  else Serial.println("❌ Firebase lỗi");
}

void updateSensors() {
  float gas_ppm = readMQ2(MQ2_PIN);
  float temp = dht.readTemperature();
  float humi = dht.readHumidity();
  int flame_status = digitalRead(FLAME_PIN);
  bool fireDetected = (flame_status == 0);
  bool gasDanger = (gas_ppm > 1000);
  String status = (fireDetected || gasDanger) ? "NGUY HIEM" : "AN TOAN";
  String flame= fireDetected ? "FIRE!" : "no fire";

  Serial.printf("Gas: %.0f ppm | Temp: %.1f C | Humi: %.1f %% | %s\n",
                gas_ppm, temp, humi, fireDetected ? "FIRE!" : "Safe");

  digitalWrite(BUZZER_PIN, fireDetected || gasDanger ? HIGH : LOW);
  Firebase.RTDB.setFloat(&firebaseData, "Gas", gas_ppm);
  Firebase.RTDB.setFloat(&firebaseData, "Temp", temp);
  Firebase.RTDB.setFloat(&firebaseData, "Humidity", humi);
  Firebase.RTDB.setString(&firebaseData, "Status",status);
  Firebase.RTDB.setString(&firebaseData, "Fire",flame);
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SH110X_WHITE);
  display.setCursor(0, 0);
  display.printf("Gas: %.0f ppm\n", gas_ppm);
  display.setCursor(0, 10);
  display.printf("Nhiet do: %.1f C\n", temp);
  display.setCursor(0, 20);
  display.printf("Do am: %.1f %%\n", humi);
  display.setCursor(0, 30);
  display.printf("Flame: %s\n", fireDetected ? "FIRE!" : "Safe");
  display.setCursor(0, 40);
  display.printf("Status: %s\n", (fireDetected || gasDanger) ? "NGUY HIEM" : "AN TOAN");
  display.display();
  delay(2000);
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
  String path = "/attendance/" + cardID;
  String state = isCheckOut ? "checkout" : "checkin";
  String timeStamp = String(millis());
  Firebase.RTDB.setString(&firebaseData, path + "/status", state);
  Firebase.RTDB.setString(&firebaseData, path + "/time", timeStamp);
  if (firebaseData.httpCode() == HTTP_CODE_OK) return true;
  else {
    Serial.println("Firebase error: " + firebaseData.errorReason());
    return false;
  }
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
