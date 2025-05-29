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
#include "time.h"
#include <SPIFFS.h>  // Thêm thư viện SPIFFS

// --- Khai báo chân kết nối ---
#define SS_PIN 5
#define RST_PIN 4
#define BUZZER_PIN 27
#define LED_PIN 14
#define BUTTON_PIN 13
#define MQ2_PIN 32
#define DHT_PIN 26
#define FLAME_PIN 25
#define SERVO_PIN 2      // Chân điều khiển servo
#define PIR_PIN 33        // Chân cảm biến chuyển động PIR SR501

// Firebase & WiFi
#define API_KEY "AIzaSyAxAR_UUEaXdJl7SMo8vhbPcDcLvvGSM0w"
#define DATABASE_URL "https://doantotnghiep-ae0f8-default-rtdb.asia-southeast1.firebasedatabase.app"
#define FIREBASE_PROJECT_ID "doantotnghiep-ae0f8"
#define FIREBASE_AUTH_DOMAIN "doantotnghiep-ae0f8.firebaseapp.com"
#define FIREBASE_STORAGE_BUCKET "doantotnghiep-ae0f8.firebasestorage.app"
#define FIREBASE_MESSAGING_SENDER_ID "701901349885"
#define FIREBASE_APP_ID "1:701901349885:web:ccb77f635d55f6bdb6af94"
#define USER_EMAIL "phucdoantotnghiep@gmail.com"
#define USER_PASSWORD "Doantotnghiep123@"
const char* ssid = "Xuantruong";
const char* password = "1234567890";

// Google Apps Script Web App URL (thay thế bằng URL thực tế sau khi deploy)
const char* GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyj_hMUvuswBBZfenYf_9shRFoEThyyoQrMb03gmD97Z1BSS7-xR8fCl5GoFHnPDjwd/exec";

// Cấu hình NTP
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 25200;      // GMT+7 (7 giờ * 3600 giây)
const int daylightOffset_sec = 0;      // Không sử dụng giờ mùa hè

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
int rfidRetryCount = 0;
const int MAX_RFID_RETRIES = 10; // Tăng lên 10 lần trước khi reset

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

// Cấu hình SPIFFS
#define SENSORS_FILE "/pending_sensors.json"
#define ATTENDANCE_FILE "/pending_attendance.json"
#define ALERTS_FILE "/pending_alerts.json"

// Khai báo hàm (function prototypes)
void syncNtpTime();
void resetRFID();
void displayCheckInSuccess();
void displayCheckInFailed();
void updateDisplay();
void displayDefaultValues(String errorMessage);
void checkAlerts();
void createAlert(String type, float value, float threshold, String message);
unsigned long getCurrentTimestamp();
String getCurrentDateString();
bool sendToFirebase(String cardID, bool manualCheckOut);
float readMQ2(int analogPin);
void saveSensorDataToSPIFFS(float temp, float humi, float gas, bool flame, String status, unsigned long timestamp);
void sendPendingSensorData();
bool checkSPIFFSSpace();
void removeOldestSensorData();
void checkFirebaseConnection();
bool sendToGoogleSheets(String dataType, String data);
void notifyGoogleSheets();
void buzzerSuccess();
void buzzerFailed();
void buzzerBeep(int times, int duration, int pause);

// Thời gian
unsigned long lastSensorUpdate = 0;
unsigned long lastAlertCheck = 0;
unsigned long lastDeviceCheck = 0;
unsigned long lastMotionCheck = 0;
unsigned long lastMotionDetected = 0;
unsigned long lastDoorOpened = 0;
unsigned long lastNtpSync = 0;
unsigned long lastThresholdCheck = 0;
unsigned long lastOfflineSave = 0;
const unsigned long SENSOR_UPDATE_INTERVAL = 5000; // 5 giây
const unsigned long ALERT_CHECK_INTERVAL = 10000; // 10 giây
const unsigned long DEVICE_CHECK_INTERVAL = 1000; // 1 giây
const unsigned long MOTION_CHECK_INTERVAL = 500; // 0.5 giây
const unsigned long AUTO_OFF_DELAY = 10000; // 10 giây
const unsigned long NTP_SYNC_INTERVAL = 3600000; // 1 giờ
const unsigned long THRESHOLD_CHECK_INTERVAL = 5000; // 5 giây
const unsigned long OFFLINE_UPDATE_INTERVAL = 60000; // 1 phút khi offline

void IRAM_ATTR buttonPressed() {
  checkOut = !checkOut;
}

void setup() {
  Serial.begin(115200);
  Serial.println("Khởi động hệ thống lớp học thông minh...");

  // Khởi tạo SPIFFS
  if (!SPIFFS.begin(true)) {
    Serial.println("Lỗi khởi tạo SPIFFS!");
    return;
  }
  Serial.println("SPIFFS đã khởi tạo thành công");

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

  // Cấu hình xác thực email/password
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;

  // In thông tin cấu hình Firebase để kiểm tra
  Serial.println("\n----- Thông tin cấu hình Firebase -----");
  Serial.println("API Key: " + String(API_KEY));
  Serial.println("Database URL: " + String(DATABASE_URL));
  Serial.println("Project ID: " + String(FIREBASE_PROJECT_ID));
  Serial.println("Auth Domain: " + String(FIREBASE_AUTH_DOMAIN));
  Serial.println("Storage Bucket: " + String(FIREBASE_STORAGE_BUCKET));
  Serial.println("Messaging Sender ID: " + String(FIREBASE_MESSAGING_SENDER_ID));
  Serial.println("App ID: " + String(FIREBASE_APP_ID));
  Serial.println("Email: " + String(USER_EMAIL));
  Serial.println("Password: " + String(USER_PASSWORD));
  Serial.println("----- Kết thúc thông tin cấu hình -----\n");

  // Bắt đầu kết nối với Firebase
  Serial.println("Bắt đầu kết nối với Firebase...");

  // Sử dụng xác thực email/password
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  // Đặt thời gian chờ cho các hoạt động Firebase
  fbdo.setResponseSize(4096);
  Firebase.RTDB.setReadTimeout(&fbdo, 1000 * 60);
  Firebase.RTDB.setwriteSizeLimit(&fbdo, "tiny");

  // Khởi tạo các cảm biến và thiết bị
  SPI.begin();
  SPI.setFrequency(1000000);  // Giảm tần số xuống 1MHz để tăng độ ổn định
  mfrc522.PCD_Init();

  // Tăng gain ăng-ten lên mức tối đa để cải thiện độ nhạy
  mfrc522.PCD_SetAntennaGain(mfrc522.RxGain_max);

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
  Serial.println("Khởi tạo servo...");
  ESP32PWM::allocateTimer(0);
  doorServo.setPeriodHertz(50);    // Tần số PWM cho servo (50Hz)
  doorServo.attach(SERVO_PIN, 500, 2400); // Chân, min pulse width, max pulse width

  // Kiểm tra servo bằng cách di chuyển qua lại
  Serial.println("Kiểm tra servo...");
  doorServo.write(servoOpenPosition);
  delay(1000);
  doorServo.write(servoClosedPosition);
  delay(1000);
  Serial.println("Kiểm tra servo hoàn tất");

  // Đọc ngưỡng cảnh báo từ Firebase
  readThresholds();

  // Khởi tạo trạng thái thiết bị trên Firebase
  initDeviceStatus();

  // Khởi tạo chế độ tự động
  initAutoMode();

  Serial.println("Hệ thống đã sẵn sàng!");

  // Test buzzer khi khởi động
  Serial.println("🔊 Test buzzer khi khởi động...");
  buzzerBeep(1, 500, 0); // 1 tiếng kêu dài 500ms để test
  delay(500);

  // Đồng bộ thời gian NTP
  Serial.println("Đang đồng bộ thời gian NTP khi khởi động...");
  syncNtpTime();

  // Kiểm tra lại thời gian sau khi đồng bộ
  struct tm timeinfo;
  if(getLocalTime(&timeinfo)) {
    char timeStr[30];
    strftime(timeStr, sizeof(timeStr), "%Y-%m-%d %H:%M:%S", &timeinfo);

    Serial.println("Thời gian hiện tại sau khi đồng bộ:");
    Serial.println(timeStr);

    // Kiểm tra timestamp
    time_t now;
    time(&now);
    Serial.print("Timestamp hiện tại: ");
    Serial.println((unsigned long)now);

    // Kiểm tra ngày
    char dateStr[9];
    strftime(dateStr, sizeof(dateStr), "%Y%m%d", &timeinfo);
    Serial.print("Ngày hiện tại (YYYYMMDD): ");
    Serial.println(dateStr);
  } else {
    Serial.println("⚠️ Không thể lấy thời gian sau khi đồng bộ!");
  }

  // Đặt thời gian đồng bộ NTP cuối cùng
  lastNtpSync = millis();

  // Kiểm tra kết nối Firebase
  checkFirebaseConnection();

  // Kiểm tra và gửi dữ liệu offline từ SPIFFS
  if (SPIFFS.exists(SENSORS_FILE)) {
    Serial.println("\n----- Kiểm tra dữ liệu offline trong SPIFFS -----");
    Serial.println("✅ Phát hiện dữ liệu offline trong SPIFFS");

    // Đọc thông tin file để hiển thị kích thước
    File dataFile = SPIFFS.open(SENSORS_FILE, FILE_READ);
    if (dataFile) {
      size_t fileSize = dataFile.size();
      Serial.printf("📊 Kích thước file dữ liệu: %d bytes\n", fileSize);
      dataFile.close();
    }

    if (WiFi.status() == WL_CONNECTED && Firebase.ready()) {
      Serial.println("🔄 Đang gửi dữ liệu offline lên Firebase sau khi khởi động...");
      sendPendingSensorData();
    } else {
      Serial.println("⚠️ Không thể gửi dữ liệu offline, WiFi hoặc Firebase chưa sẵn sàng");
      Serial.println("💾 Dữ liệu sẽ được giữ lại trong SPIFFS để gửi sau");

      // Kiểm tra trạng thái WiFi và Firebase
      Serial.printf("📶 Trạng thái WiFi: %s\n", WiFi.status() == WL_CONNECTED ? "Đã kết nối" : "Chưa kết nối");
      Serial.printf("🔥 Trạng thái Firebase: %s\n", Firebase.ready() ? "Sẵn sàng" : "Chưa sẵn sàng");
    }
    Serial.println("----- Kết thúc kiểm tra dữ liệu offline -----\n");
  } else {
    Serial.println("ℹ️ Không có dữ liệu offline trong SPIFFS");
  }
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

  // Đồng bộ thời gian NTP định kỳ
  if (currentMillis - lastNtpSync >= NTP_SYNC_INTERVAL) {
    syncNtpTime();
    lastNtpSync = currentMillis;
  }

  // Kiểm tra và cập nhật ngưỡng cảnh báo định kỳ
  if (currentMillis - lastThresholdCheck >= THRESHOLD_CHECK_INTERVAL) {
    readThresholds();
    lastThresholdCheck = currentMillis;
  }

  // Kiểm tra chế độ tự động
  checkAutoMode(currentMillis);

  // Đọc thẻ RFID với cơ chế thử lại
  if (!mfrc522.PICC_IsNewCardPresent()) {
    delay(100); // Thêm delay lớn hơn
    if (!isDisplayingMessage) updateDisplay();
    return;
  }

  if (!mfrc522.PICC_ReadCardSerial()) {
    rfidRetryCount++;
    Serial.print("Không đọc được thẻ, thử lại lần ");
    Serial.println(rfidRetryCount);

    if (rfidRetryCount >= MAX_RFID_RETRIES) {
      Serial.println("Đã thử nhiều lần không thành công, reset module RFID...");
      resetRFID();
      rfidRetryCount = 0;
    }

    delay(300); // Thêm delay lớn hơn khi đọc thất bại
    if (!isDisplayingMessage) updateDisplay();
    return;
  }

  // Đọc thành công, reset số lần thử
  rfidRetryCount = 0;

  String cardID = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) cardID += String(mfrc522.uid.uidByte[i], HEX);
  cardID.toUpperCase();
  Serial.println("\n📌 Mã thẻ: " + cardID);

  // Kiểm tra xem sinh viên có tồn tại không
  bool studentExists = false;
  if (Firebase.RTDB.getString(&fbdo, "students/" + cardID + "/name")) {
    studentExists = true;
  }

  // Lưu trữ kết quả điểm danh và thông tin sinh viên
  bool firebaseSuccess = sendToFirebase(cardID, checkOut);
  delay(500); // Giảm delay xuống để tăng tốc độ phản hồi

  // Hiển thị thông báo dựa trên kết quả xử lý
  if (firebaseSuccess) {
    // Hiển thị thông báo thành công trước
    displayCheckInSuccess();
    Serial.println("✅ Điểm danh thành công");

    // Kêu buzzer 2 lần cho điểm danh thành công
    buzzerSuccess();

    // Sau khi hiển thị thông báo, mở cửa nếu chế độ tự động được bật
    if (doorAutoMode && studentExists) {
      Serial.println("🚪 Mở cửa tự động khi quẹt thẻ đã đăng ký");
      controlDoor(true);
      lastDoorOpened = millis();
    }
  } else {
    displayCheckInFailed();

    // Kêu buzzer 3 lần cho điểm danh thất bại
    buzzerFailed();

    if (!studentExists) {
      Serial.println("❌ Thẻ không được đăng ký trong hệ thống");
    } else {
      Serial.println("❌ Lỗi xử lý");
    }
  }

  // Dừng PICC và ngừng mã hóa PCD để chuẩn bị cho lần đọc tiếp theo
  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();
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
      Serial.println("Tự động đóng cửa sau thời gian chờ");
      controlDoor(false);
    }
  }

  // Kiểm tra trạng thái chế độ tự động từ Firebase
  if (currentMillis - lastDeviceCheck >= DEVICE_CHECK_INTERVAL * 10) {
    if (Firebase.ready()) {
      // Kiểm tra chế độ tự động cho cửa
      if (Firebase.RTDB.getBool(&fbdo, "devices/auto/door")) {
        bool newDoorAutoMode = fbdo.boolData();
        if (newDoorAutoMode != doorAutoMode) {
          doorAutoMode = newDoorAutoMode;
          Serial.print("Cập nhật chế độ tự động cửa: ");
          Serial.println(doorAutoMode ? "BẬT" : "TẮT");
        }
      }
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

  // Thêm debug để kiểm tra servo
  Serial.print("Điều khiển servo đến vị trí: ");
  Serial.println(position);

  // Đảm bảo servo đã được khởi tạo đúng
  if (!doorServo.attached()) {
    Serial.println("⚠️ Servo chưa được khởi tạo, đang khởi tạo lại...");
    doorServo.attach(SERVO_PIN, 500, 2400);
  }

  // Di chuyển servo
  doorServo.write(position);
  doorState = state;
  Serial.println(state ? "Cửa: MỞ" : "Cửa: ĐÓNG");

  // Thêm delay nhỏ để đảm bảo servo có thời gian di chuyển
  delay(100);

  // Cập nhật trạng thái thực tế lên Firebase
  if (Firebase.RTDB.setBool(&fbdo, "devices/status/door1", state)) {
    Serial.println("✅ Cập nhật trạng thái cửa thành công");
  } else {
    Serial.println("❌ Lỗi cập nhật trạng thái cửa: " + fbdo.errorReason());
  }

  // Cập nhật trạng thái cửa trên Firebase
  if (Firebase.RTDB.setBool(&fbdo, "devices/doors/door1", state)) {
    Serial.println("✅ Cập nhật lệnh điều khiển cửa thành công");
  }
}

void readThresholds() {
  if (Firebase.ready()) {
    bool hasChanges = false;
    float oldTempMin = tempMin;
    float oldTempMax = tempMax;
    float oldHumidMin = humidMin;
    float oldHumidMax = humidMax;
    float oldGasThreshold = gasThreshold;
    int oldCheckInHour = checkInHour;
    int oldCheckInMinute = checkInMinute;
    int oldCheckOutHour = checkOutHour;
    int oldCheckOutMinute = checkOutMinute;

    // Đọc ngưỡng nhiệt độ
    if (Firebase.RTDB.getFloat(&fbdo, "settings/thresholds/temperature/min")) {
      float newValue = fbdo.floatData();
      if (newValue != tempMin) {
        Serial.printf("Cập nhật ngưỡng nhiệt độ tối thiểu: %.1f -> %.1f\n", tempMin, newValue);
        tempMin = newValue;
        hasChanges = true;
      }
    }

    if (Firebase.RTDB.getFloat(&fbdo, "settings/thresholds/temperature/max")) {
      float newValue = fbdo.floatData();
      if (newValue != tempMax) {
        Serial.printf("Cập nhật ngưỡng nhiệt độ tối đa: %.1f -> %.1f\n", tempMax, newValue);
        tempMax = newValue;
        hasChanges = true;
      }
    }

    // Đọc ngưỡng độ ẩm
    if (Firebase.RTDB.getFloat(&fbdo, "settings/thresholds/humidity/min")) {
      float newValue = fbdo.floatData();
      if (newValue != humidMin) {
        Serial.printf("Cập nhật ngưỡng độ ẩm tối thiểu: %.1f -> %.1f\n", humidMin, newValue);
        humidMin = newValue;
        hasChanges = true;
      }
    }

    if (Firebase.RTDB.getFloat(&fbdo, "settings/thresholds/humidity/max")) {
      float newValue = fbdo.floatData();
      if (newValue != humidMax) {
        Serial.printf("Cập nhật ngưỡng độ ẩm tối đa: %.1f -> %.1f\n", humidMax, newValue);
        humidMax = newValue;
        hasChanges = true;
      }
    }

    // Đọc ngưỡng khí gas
    if (Firebase.RTDB.getFloat(&fbdo, "settings/thresholds/gas")) {
      float newValue = fbdo.floatData();
      if (newValue != gasThreshold) {
        Serial.printf("Cập nhật ngưỡng khí gas: %.1f -> %.1f\n", gasThreshold, newValue);
        gasThreshold = newValue;
        hasChanges = true;
      }
    }

    // Đọc ngưỡng thời gian điểm danh
    if (Firebase.RTDB.getInt(&fbdo, "settings/attendance/checkInHour")) {
      int newValue = fbdo.intData();
      if (newValue != checkInHour) {
        Serial.printf("Cập nhật giờ điểm danh vào: %d -> %d\n", checkInHour, newValue);
        checkInHour = newValue;
        hasChanges = true;
      }
    }

    if (Firebase.RTDB.getInt(&fbdo, "settings/attendance/checkInMinute")) {
      int newValue = fbdo.intData();
      if (newValue != checkInMinute) {
        Serial.printf("Cập nhật phút điểm danh vào: %d -> %d\n", checkInMinute, newValue);
        checkInMinute = newValue;
        hasChanges = true;
      }
    }

    if (Firebase.RTDB.getInt(&fbdo, "settings/attendance/checkOutHour")) {
      int newValue = fbdo.intData();
      if (newValue != checkOutHour) {
        Serial.printf("Cập nhật giờ điểm danh ra: %d -> %d\n", checkOutHour, newValue);
        checkOutHour = newValue;
        hasChanges = true;
      }
    }

    if (Firebase.RTDB.getInt(&fbdo, "settings/attendance/checkOutMinute")) {
      int newValue = fbdo.intData();
      if (newValue != checkOutMinute) {
        Serial.printf("Cập nhật phút điểm danh ra: %d -> %d\n", checkOutMinute, newValue);
        checkOutMinute = newValue;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      Serial.println("✅ Đã cập nhật ngưỡng cảnh báo và thời gian điểm danh từ Firebase");

      // Hiển thị tất cả các ngưỡng hiện tại
      Serial.println("\n----- Ngưỡng cảnh báo hiện tại -----");
      Serial.printf("Nhiệt độ: %.1f°C - %.1f°C\n", tempMin, tempMax);
      Serial.printf("Độ ẩm: %.1f%% - %.1f%%\n", humidMin, humidMax);
      Serial.printf("Khí gas: %.1f ppm\n", gasThreshold);
      Serial.printf("Thời gian điểm danh vào: %02d:%02d\n", checkInHour, checkInMinute);
      Serial.printf("Thời gian điểm danh ra: %02d:%02d\n", checkOutHour, checkOutMinute);
      Serial.println("----------------------------------\n");
    }
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
  unsigned long timestamp = getCurrentTimestamp();

  // Kiểm tra kết nối WiFi và Firebase
  if (WiFi.status() == WL_CONNECTED && Firebase.ready()) {
    // Cập nhật dữ liệu cảm biến hiện tại
    FirebaseJson json;
    json.set("temperature", temp);
    json.set("humidity", humi);
    json.set("gas", gas_ppm);
    json.set("flame", fireDetected);
    json.set("status", status);
    json.set("updatedAt", timestamp);

    if (Firebase.RTDB.updateNode(&fbdo, "sensors/current", &json)) {
      Serial.println("✅ Cập nhật dữ liệu cảm biến thành công");

      // Thông báo Google Apps Script để đồng bộ dữ liệu cảm biến
      notifyGoogleSheets();
    } else {
      Serial.println("❌ Lỗi cập nhật dữ liệu cảm biến: " + fbdo.errorReason());
      // Lưu vào SPIFFS khi không thể gửi lên Firebase
      saveSensorDataToSPIFFS(temp, humi, gas_ppm, fireDetected, status, timestamp);
    }

    // Lưu lịch sử dữ liệu cảm biến
    String historyPath = "sensors/history/" + String(timestamp);
    if (Firebase.RTDB.setJSON(&fbdo, historyPath, &json)) {
      Serial.println("✅ Lưu lịch sử cảm biến thành công");
    } else {
      Serial.println("❌ Lỗi lưu lịch sử cảm biến: " + fbdo.errorReason());
    }
  } else {
    // Không có kết nối WiFi hoặc Firebase, lưu vào SPIFFS
    // Chỉ lưu mỗi OFFLINE_UPDATE_INTERVAL để tiết kiệm bộ nhớ
    if (millis() - lastOfflineSave >= OFFLINE_UPDATE_INTERVAL) {
      saveSensorDataToSPIFFS(temp, humi, gas_ppm, fireDetected, status, timestamp);
      lastOfflineSave = millis();
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
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SH110X_WHITE);

  // Kiểm tra kết nối Firebase và WiFi
  if (WiFi.status() == WL_CONNECTED && Firebase.ready()) {
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

      // Kiểm tra xem dữ liệu có hợp lệ không
      bool validData = temperature.success && humidity.success && gas.success && flame.success && status.success;

      if (validData) {
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
      } else {
        // Hiển thị thông báo lỗi dữ liệu
        displayDefaultValues("Loi du lieu");
      }
    } else {
      // Hiển thị thông báo lỗi đọc dữ liệu
      displayDefaultValues("Loi doc du lieu");
    }
  } else {
    // Hiển thị thông báo mất kết nối
    displayDefaultValues("Mat ket noi");
  }

  // Hiển thị trạng thái thiết bị (luôn hiển thị)
  display.setCursor(0, 50);
  display.printf("Den: %s | Cua: %s",
                lightState ? "ON" : "OFF",
                doorState ? "MO" : "DONG");

  display.display();
}

// Hiển thị giá trị mặc định khi không có dữ liệu
void displayDefaultValues(String errorMessage) {
  display.setCursor(0, 0);
  display.printf("Gas: -- ppm");

  display.setCursor(0, 10);
  display.printf("Nhiet do: -- C");

  display.setCursor(0, 20);
  display.printf("Do am: -- %%");

  display.setCursor(0, 30);
  display.printf("Flame: --");

  display.setCursor(0, 40);
  display.printf("Status: %s", errorMessage.c_str());
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
  struct tm timeinfo;
  if(!getLocalTime(&timeinfo)) {
    Serial.println("Không thể lấy thời gian từ NTP, đang thử đồng bộ lại...");

    // Thử đồng bộ lại thời gian NTP
    configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
    delay(500);

    // Thử lấy thời gian lần nữa
    if(!getLocalTime(&timeinfo)) {
      Serial.println("Vẫn không thể lấy thời gian từ NTP, sử dụng thời gian ước tính!");

      // Nếu vẫn không lấy được thời gian, tạo một timestamp ước tính
      // Giả sử ngày 2024-05-10 và thời gian hiện tại dựa trên millis()
      time_t estimatedTime = 1715299200; // 2024-05-10 00:00:00 GMT

      // Thêm số giây trong ngày dựa trên millis()
      unsigned long secondsInDay = (millis() / 1000) % 86400;
      estimatedTime += secondsInDay;

      return (unsigned long)estimatedTime;
    }
  }

  time_t now;
  time(&now);

  // In thông tin timestamp để debug
  Serial.print("Timestamp hiện tại: ");
  Serial.println((unsigned long)now);

  return (unsigned long)now;
}

// Hàm lấy ngày hiện tại theo định dạng YYYYMMDD
String getCurrentDateString() {
  // Lấy timestamp hiện tại
  unsigned long timestamp = getCurrentTimestamp();

  // Chuyển đổi timestamp thành struct tm
  struct tm timeinfo;
  time_t now = timestamp;
  localtime_r(&now, &timeinfo);

  // Định dạng ngày tháng
  char dateStr[9];
  strftime(dateStr, sizeof(dateStr), "%Y%m%d", &timeinfo);

  // In thông tin ngày tháng để debug
  Serial.print("Ngày hiện tại (YYYYMMDD): ");
  Serial.println(dateStr);

  return String(dateStr);
}

// Hàm sendToGoogleSheets đã được loại bỏ

bool sendToFirebase(String cardID, bool manualCheckOut) {
  if (Firebase.ready()) {
    // Lấy ngày hiện tại theo định dạng YYYYMMDD
    String date = getCurrentDateString(); // Sử dụng hàm lấy ngày hiện tại

    // Kiểm tra trạng thái chế độ tự động cửa
    if (Firebase.RTDB.getBool(&fbdo, "devices/auto/door")) {
      doorAutoMode = fbdo.boolData();
      Serial.print("Chế độ tự động cửa: ");
      Serial.println(doorAutoMode ? "BẬT" : "TẮT");
    }

    // Lấy thông tin sinh viên
    String studentName = "Unknown";
    bool studentExists = false;
    if (Firebase.RTDB.getString(&fbdo, "students/" + cardID + "/name")) {
      studentName = fbdo.stringData();
      studentExists = true;
    } else {
      Serial.println("❌ Không tìm thấy sinh viên với RFID: " + cardID);

      // Ghi lại thông tin về lần quẹt thẻ không hợp lệ
      FirebaseJson unregisteredJson;
      unsigned long currentTime = getCurrentTimestamp();

      // Tạo ID duy nhất cho lần quẹt thẻ này
      String swipeId = String(currentTime);

      // Đường dẫn để lưu thông tin quẹt thẻ không hợp lệ
      String unregisteredPath = "unregistered_swipes/" + date + "/" + cardID;

      // Thêm thông tin về lần quẹt thẻ
      unregisteredJson.set("timestamp", currentTime);
      unregisteredJson.set("cardId", cardID);
      unregisteredJson.set("doorAutoMode", doorAutoMode);

      // Lấy thời gian đầy đủ để ghi log
      struct tm timeinfo;
      time_t now = currentTime;
      localtime_r(&now, &timeinfo);
      char timeStr[30];
      strftime(timeStr, sizeof(timeStr), "%H:%M:%S", &timeinfo);
      unregisteredJson.set("time", String(timeStr));

      // Gửi dữ liệu lên Firebase
      if (Firebase.RTDB.updateNode(&fbdo, unregisteredPath, &unregisteredJson)) {
        Serial.println("✅ Đã ghi lại thông tin quẹt thẻ không hợp lệ");
      } else {
        Serial.println("❌ Lỗi ghi thông tin quẹt thẻ không hợp lệ: " + fbdo.errorReason());
      }

      // Nếu sinh viên không tồn tại, vẫn trả về false vì không cho phép mở cửa
      return false;
    }

    // Nếu sinh viên không tồn tại, không xử lý điểm danh
    if (!studentExists) {
      return false;
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

    // Xác định thời điểm hiện tại từ NTP
    unsigned long currentTime = getCurrentTimestamp();

    // Lấy giờ và phút từ thời gian NTP
    struct tm timeinfo;
    time_t now = currentTime;
    localtime_r(&now, &timeinfo);

    int currentHour = timeinfo.tm_hour;
    int currentMinute = timeinfo.tm_min;

    // Tính toán thời điểm ngưỡng điểm danh ra
    int checkOutTimeInMinutes = checkOutHour * 60 + checkOutMinute;
    int currentTimeInMinutes = currentHour * 60 + currentMinute;

    // In thời gian đầy đủ để debug
    char timeStr[30];
    strftime(timeStr, sizeof(timeStr), "%Y-%m-%d %H:%M:%S", &timeinfo);
    Serial.print("Thời gian NTP đầy đủ: ");
    Serial.println(timeStr);

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

    bool attendanceSuccess = false;

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
          attendanceSuccess = true; // Vẫn coi là thành công vì không phải lỗi
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
      } else {
        Serial.println("⚠️ Sinh viên đã điểm danh vào rồi");
        attendanceSuccess = true; // Vẫn coi là thành công vì không phải lỗi
      }
    }

    // Nếu đã điểm danh trước đó, không cần cập nhật lại
    if (!attendanceSuccess) {
      if (Firebase.RTDB.updateNode(&fbdo, attendancePath, &json)) {
        Serial.println("✅ Cập nhật điểm danh thành công");
        attendanceSuccess = true;

        // Thông báo Google Apps Script để đồng bộ dữ liệu điểm danh
        notifyGoogleSheets();
      } else {
        Serial.println("❌ Lỗi cập nhật điểm danh: " + fbdo.errorReason());
        attendanceSuccess = false;
      }
    }

    // Không mở cửa ở đây, sẽ mở cửa sau khi hiển thị thông báo thành công

    return attendanceSuccess;
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
  display.setCursor(0, 15);
  display.println("✅ Thanh cong");

  // Hiển thị thông tin về buzzer và chế độ tự động
  display.setTextSize(1);
  display.setCursor(0, 35);
  display.println("🔊 Buzzer: 2 tieng keu");

  if (doorAutoMode) {
    display.setCursor(0, 50);
    display.println("Che do tu dong: BAT");
  }

  display.display();
  delay(2000);
  isDisplayingMessage = false;
}

void displayCheckInFailed() {
  isDisplayingMessage = true;
  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(SH110X_WHITE);
  display.setCursor(0, 10);
  display.println("❌ That bai");

  // Hiển thị thông tin về buzzer và lỗi
  display.setTextSize(1);
  display.setCursor(0, 30);
  display.println("🔊 Buzzer: 3 tieng keu");

  display.setCursor(0, 45);
  display.println("The khong duoc dang ky");

  display.display();
  delay(2000);
  isDisplayingMessage = false;
}

// Hàm reset RFID
void resetRFID() {
  Serial.println("\n----- Bắt đầu quá trình reset module RFID -----");
  Serial.println("⚠️ Đang reset module RFID sau nhiều lần đọc thất bại...");

  // Hard reset - tắt và bật lại SPI
  Serial.println("1️⃣ Thực hiện Hard Reset: Tắt SPI");
  SPI.end();
  delay(100);

  Serial.println("2️⃣ Khởi động lại SPI với tần số thấp hơn");
  SPI.begin();
  SPI.setFrequency(1000000);  // Giảm tần số xuống 1MHz
  Serial.println("✅ Đã khởi động lại SPI với tần số 1MHz");

  // Soft reset
  Serial.println("3️⃣ Thực hiện Soft Reset cho MFRC522");
  mfrc522.PCD_Reset();
  delay(100);
  Serial.println("✅ Đã reset chip MFRC522");

  // Khởi tạo lại
  Serial.println("4️⃣ Khởi tạo lại module MFRC522");
  mfrc522.PCD_Init();
  Serial.println("✅ Đã khởi tạo lại module MFRC522");

  // Cấu hình lại
  Serial.println("5️⃣ Cấu hình lại ăng-ten với độ nhạy tối đa");
  mfrc522.PCD_SetAntennaGain(mfrc522.RxGain_max);
  Serial.println("✅ Đã cấu hình lại ăng-ten với độ nhạy tối đa");

  // Kiểm tra trạng thái
  byte v = mfrc522.PCD_ReadRegister(mfrc522.VersionReg);
  Serial.print("📊 Phiên bản chip MFRC522: 0x");
  Serial.println(v, HEX);

  if (v == 0x91 || v == 0x92) {
    Serial.println("✅ Module RFID hoạt động bình thường");
  } else {
    Serial.println("⚠️ Phiên bản chip không xác định, có thể gặp vấn đề");
  }

  Serial.println("✅ Quá trình reset RFID hoàn tất");
  Serial.println("----- Kết thúc quá trình reset module RFID -----\n");
}

// Hàm đồng bộ thời gian NTP
void syncNtpTime() {
  Serial.println("\n----- Bắt đầu đồng bộ thời gian NTP -----");
  Serial.println("🕒 Đang đồng bộ thời gian với máy chủ NTP...");

  // Hiển thị thông tin cấu hình NTP
  Serial.printf("📡 Máy chủ NTP: %s\n", ntpServer);
  Serial.printf("🌐 Múi giờ: GMT+%d giây (%d giờ)\n", gmtOffset_sec, gmtOffset_sec / 3600);

  // Đặt múi giờ và máy chủ NTP
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);

  // Đợi đến khi đồng bộ được thời gian
  int retry = 0;
  const int maxRetries = 5;
  struct tm timeinfo;

  Serial.print("⏳ Đang chờ phản hồi từ máy chủ NTP");
  while (!getLocalTime(&timeinfo) && retry < maxRetries) {
    Serial.print(".");
    delay(1000);
    retry++;
  }
  Serial.println();

  if (getLocalTime(&timeinfo)) {
    char timeStr[30];
    char dateStr[30];
    strftime(timeStr, sizeof(timeStr), "%H:%M:%S", &timeinfo);
    strftime(dateStr, sizeof(dateStr), "%A, %B %d %Y", &timeinfo);

    Serial.println("✅ Đã đồng bộ thời gian NTP thành công!");
    Serial.printf("📅 Ngày: %s\n", dateStr);
    Serial.printf("🕒 Giờ: %s\n", timeStr);

    // Kiểm tra timestamp
    time_t now;
    time(&now);
    Serial.printf("🔢 Timestamp hiện tại: %lu\n", (unsigned long)now);

    // Hiển thị ngày theo định dạng YYYYMMDD
    char yyyymmdd[9];
    strftime(yyyymmdd, sizeof(yyyymmdd), "%Y%m%d", &timeinfo);
    Serial.printf("📊 Ngày theo định dạng YYYYMMDD: %s\n", yyyymmdd);

    // Kiểm tra xem timestamp có hợp lệ không (phải lớn hơn 1/1/2020)
    if (now < 1577836800) { // 1/1/2020 00:00:00 GMT
      Serial.println("⚠️ Timestamp không hợp lệ! Đang thử đồng bộ lại...");

      // Thử đồng bộ lại với máy chủ NTP khác
      const char* backupNtpServer = "time.google.com";
      Serial.printf("🔄 Đang thử với máy chủ NTP dự phòng: %s\n", backupNtpServer);

      configTime(gmtOffset_sec, daylightOffset_sec, backupNtpServer);

      Serial.print("⏳ Đang chờ phản hồi từ máy chủ NTP dự phòng");
      retry = 0;
      while (!getLocalTime(&timeinfo) && retry < maxRetries) {
        Serial.print(".");
        delay(1000);
        retry++;
      }
      Serial.println();

      if (getLocalTime(&timeinfo)) {
        strftime(timeStr, sizeof(timeStr), "%H:%M:%S", &timeinfo);
        strftime(dateStr, sizeof(dateStr), "%A, %B %d %Y", &timeinfo);

        Serial.println("✅ Đã đồng bộ thời gian NTP với máy chủ dự phòng!");
        Serial.printf("📅 Ngày: %s\n", dateStr);
        Serial.printf("🕒 Giờ: %s\n", timeStr);

        time(&now);
        Serial.printf("🔢 Timestamp mới: %lu\n", (unsigned long)now);

        // Hiển thị ngày theo định dạng YYYYMMDD
        strftime(yyyymmdd, sizeof(yyyymmdd), "%Y%m%d", &timeinfo);
        Serial.printf("📊 Ngày theo định dạng YYYYMMDD: %s\n", yyyymmdd);
      } else {
        Serial.println("❌ Không thể đồng bộ với máy chủ NTP dự phòng!");
      }
    }
  } else {
    Serial.println("❌ Không thể đồng bộ thời gian NTP sau nhiều lần thử!");
    Serial.println("⚠️ Hệ thống sẽ sử dụng thời gian ước tính dựa trên millis()");
  }

  Serial.println("----- Kết thúc đồng bộ thời gian NTP -----\n");
}

// Lưu dữ liệu cảm biến vào SPIFFS
void saveSensorDataToSPIFFS(float temp, float humi, float gas, bool flame, String status, unsigned long timestamp) {
  Serial.println("\n----- Bắt đầu lưu dữ liệu vào SPIFFS -----");
  Serial.println("💾 Đang lưu dữ liệu cảm biến vào bộ nhớ SPIFFS...");

  // Hiển thị thông tin dữ liệu sẽ lưu
  Serial.printf("🌡️ Nhiệt độ: %.1f°C | 💧 Độ ẩm: %.1f%% | 🔥 Gas: %.0f ppm | 🔥 Lửa: %s\n",
                temp, humi, gas, flame ? "CÓ" : "KHÔNG");
  Serial.printf("⏱️ Timestamp: %lu | 📊 Trạng thái: %s\n", timestamp, status.c_str());

  // Kiểm tra dung lượng SPIFFS
  if (!checkSPIFFSSpace()) {
    Serial.println("⚠️ SPIFFS gần đầy, đang xóa dữ liệu cũ nhất để giải phóng bộ nhớ");
    removeOldestSensorData();
  }

  // Đọc dữ liệu hiện có
  DynamicJsonDocument doc(8192);
  bool fileExists = SPIFFS.exists(SENSORS_FILE);

  if (fileExists) {
    Serial.println("📂 File dữ liệu đã tồn tại, đang đọc dữ liệu hiện có...");
    File file = SPIFFS.open(SENSORS_FILE, FILE_READ);
    if (file) {
      size_t fileSize = file.size();
      Serial.printf("📊 Kích thước file hiện tại: %d bytes\n", fileSize);

      DeserializationError error = deserializeJson(doc, file);
      file.close();

      if (error) {
        Serial.printf("❌ Lỗi đọc file JSON: %s\n", error.c_str());
        Serial.println("🔄 Tạo mới cấu trúc dữ liệu");
        doc.clear();
        doc.to<JsonArray>();
      } else {
        JsonArray array = doc.as<JsonArray>();
        Serial.printf("✅ Đọc thành công, có %d bản ghi hiện có\n", array.size());
      }
    }
  } else {
    // Tạo mảng mới nếu file không tồn tại
    Serial.println("📂 File dữ liệu chưa tồn tại, tạo mới cấu trúc dữ liệu");
    doc.to<JsonArray>();
  }

  // Thêm dữ liệu mới
  Serial.println("➕ Đang thêm bản ghi mới vào danh sách...");
  JsonArray array = doc.as<JsonArray>();
  JsonObject obj = array.createNestedObject();
  obj["temperature"] = temp;
  obj["humidity"] = humi;
  obj["gas"] = gas;
  obj["flame"] = flame;
  obj["status"] = status;
  obj["timestamp"] = timestamp;

  // Hiển thị số lượng bản ghi sau khi thêm
  Serial.printf("📊 Tổng số bản ghi sau khi thêm: %d\n", array.size());

  // Lưu lại vào file
  Serial.println("💾 Đang ghi dữ liệu vào SPIFFS...");
  File file = SPIFFS.open(SENSORS_FILE, FILE_WRITE);
  if (file) {
    size_t bytesWritten = serializeJson(doc, file);
    file.close();
    Serial.printf("✅ Đã lưu thành công %d bytes dữ liệu vào SPIFFS\n", bytesWritten);

    // Kiểm tra lại dung lượng SPIFFS sau khi lưu
    unsigned long totalBytes = SPIFFS.totalBytes();
    unsigned long usedBytes = SPIFFS.usedBytes();
    float usedPercentage = (float)usedBytes / totalBytes * 100;
    Serial.printf("📊 SPIFFS sau khi lưu: %u/%u bytes (%.1f%%)\n",
                 usedBytes, totalBytes, usedPercentage);
  } else {
    Serial.println("❌ Lỗi mở file để ghi dữ liệu");
  }

  Serial.println("----- Kết thúc lưu dữ liệu vào SPIFFS -----\n");
}

// Gửi dữ liệu cảm biến đang chờ
void sendPendingSensorData() {
  Serial.println("\n----- Bắt đầu gửi dữ liệu từ SPIFFS lên Firebase -----");

  if (!SPIFFS.exists(SENSORS_FILE)) {
    Serial.println("ℹ️ Không có dữ liệu đang chờ để gửi trong SPIFFS");
    Serial.println("----- Kết thúc quá trình gửi dữ liệu -----\n");
    return;
  }

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ Không thể gửi dữ liệu: Không có kết nối WiFi");
    Serial.println("💾 Dữ liệu sẽ được giữ lại trong SPIFFS để gửi sau");
    Serial.println("----- Kết thúc quá trình gửi dữ liệu -----\n");
    return;
  }

  if (!Firebase.ready()) {
    Serial.println("⚠️ Firebase chưa sẵn sàng, đang thử làm mới token...");

    // Đặt lại cấu hình Firebase
    config.api_key = API_KEY;
    config.database_url = DATABASE_URL;

    // Đặt lại thông tin xác thực
    auth.user.email = USER_EMAIL;
    auth.user.password = USER_PASSWORD;

    // Khởi tạo lại Firebase
    Firebase.begin(&config, &auth);

    // Đợi token được cấp
    unsigned long startTime = millis();
    Serial.print("Đang chờ token Firebase");
    while (!Firebase.ready() && millis() - startTime < 10000) {
      delay(500);
      Serial.print(".");
    }
    Serial.println();

    if (!Firebase.ready()) {
      Serial.println("❌ Không thể làm mới token Firebase, sẽ thử lại sau");
      Serial.println("💾 Dữ liệu vẫn được giữ lại trong SPIFFS");
      Serial.println("----- Kết thúc quá trình gửi dữ liệu -----\n");
      return;
    }

    Serial.println("✅ Token Firebase đã được làm mới thành công");
  }

  Serial.println("🔄 Đang đọc dữ liệu từ SPIFFS...");

  File file = SPIFFS.open(SENSORS_FILE, FILE_READ);
  if (!file) {
    Serial.println("❌ Lỗi mở file SPIFFS để đọc");
    Serial.println("----- Kết thúc quá trình gửi dữ liệu -----\n");
    return;
  }

  size_t fileSize = file.size();
  Serial.printf("📊 Kích thước file: %d bytes\n", fileSize);

  String fileContent = file.readString();
  file.close();

  // Kiểm tra nội dung file (chỉ hiển thị 100 ký tự đầu tiên để tránh log quá dài)
  if (fileContent.length() > 100) {
    Serial.println("📄 Nội dung file (100 ký tự đầu):");
    Serial.println(fileContent.substring(0, 100) + "...");
  } else {
    Serial.println("📄 Nội dung file:");
    Serial.println(fileContent);
  }

  DynamicJsonDocument doc(8192);
  DeserializationError error = deserializeJson(doc, fileContent);

  if (error) {
    Serial.println("❌ Lỗi đọc file JSON: " + String(error.c_str()));
    Serial.println("🗑️ Xóa file JSON không hợp lệ");
    SPIFFS.remove(SENSORS_FILE);
    Serial.println("----- Kết thúc quá trình gửi dữ liệu -----\n");
    return;
  }

  JsonArray array = doc.as<JsonArray>();
  Serial.printf("📦 Có %d bản ghi cần gửi lên Firebase\n", array.size());

  if (array.size() == 0) {
    Serial.println("ℹ️ Không có bản ghi nào, xóa file");
    SPIFFS.remove(SENSORS_FILE);
    Serial.println("----- Kết thúc quá trình gửi dữ liệu -----\n");
    return;
  }

  bool allSent = true;
  int sentCount = 0;

  // Lưu lại bản ghi cuối cùng để cập nhật dữ liệu hiện tại
  FirebaseJson lastJson;

  Serial.println("🔄 Bắt đầu gửi từng bản ghi lên Firebase...");

  for (size_t i = 0; i < array.size(); i++) {
    JsonObject obj = array[i];

    // Tạo JSON để gửi lên Firebase
    FirebaseJson json;
    json.set("temperature", obj["temperature"].as<float>());
    json.set("humidity", obj["humidity"].as<float>());
    json.set("gas", obj["gas"].as<float>());
    json.set("flame", obj["flame"].as<bool>());
    json.set("status", obj["status"].as<String>());
    json.set("updatedAt", obj["timestamp"].as<unsigned long>());

    // Lưu lại JSON cuối cùng
    if (i == array.size() - 1) {
      lastJson = json;
    }

    // Lưu vào lịch sử
    String historyPath = "sensors/history/" + String(obj["timestamp"].as<unsigned long>());

    // Hiển thị thông tin bản ghi đang gửi
    Serial.printf("🔄 Đang gửi bản ghi %d/%d - Timestamp: %lu\n",
                 (int)i + 1, (int)array.size(), obj["timestamp"].as<unsigned long>());

    if (!Firebase.RTDB.setJSON(&fbdo, historyPath.c_str(), &json)) {
      Serial.printf("❌ Lỗi gửi bản ghi %d: %s\n", (int)i + 1, fbdo.errorReason().c_str());
      allSent = false;
      break;
    }

    sentCount++;
    Serial.printf("✅ Đã gửi thành công bản ghi %d/%d\n", sentCount, (int)array.size());

    delay(500); // Tăng delay để tránh quá tải Firebase
  }

  // Cập nhật dữ liệu hiện tại với bản ghi cuối cùng
  if (sentCount > 0) {
    Serial.println("🔄 Cập nhật dữ liệu cảm biến hiện tại với bản ghi mới nhất...");
    if (!Firebase.RTDB.updateNode(&fbdo, "sensors/current", &lastJson)) {
      Serial.println("❌ Lỗi cập nhật dữ liệu hiện tại: " + fbdo.errorReason());
    } else {
      Serial.println("✅ Cập nhật dữ liệu hiện tại thành công");
    }
  }

  if (allSent) {
    // Xóa file nếu tất cả dữ liệu đã được gửi
    SPIFFS.remove(SENSORS_FILE);
    Serial.printf("✅ Đã gửi thành công tất cả %d bản ghi và xóa file SPIFFS\n", sentCount);
  } else {
    Serial.printf("⚠️ Chỉ gửi được %d/%d bản ghi, còn lại sẽ được gửi sau\n",
                 sentCount, (int)array.size());

    // Xóa các bản ghi đã gửi thành công
    if (sentCount > 0) {
      Serial.println("🔄 Đang lưu lại các bản ghi chưa gửi...");
      DynamicJsonDocument newDoc(8192);
      JsonArray newArray = newDoc.to<JsonArray>();

      // Chỉ giữ lại các bản ghi chưa gửi
      for (size_t i = sentCount; i < array.size(); i++) {
        newArray.add(array[i]);
      }

      // Lưu lại vào file
      File file = SPIFFS.open(SENSORS_FILE, FILE_WRITE);
      if (file) {
        serializeJson(newDoc, file);
        file.close();
        Serial.printf("✅ Đã lưu lại %d bản ghi chưa gửi vào SPIFFS\n", (int)(array.size() - sentCount));
      } else {
        Serial.println("❌ Lỗi mở file để lưu các bản ghi còn lại");
      }
    }
  }

  Serial.println("----- Kết thúc quá trình gửi dữ liệu -----\n");
}

// Kiểm tra dung lượng SPIFFS
bool checkSPIFFSSpace() {
  unsigned long totalBytes = SPIFFS.totalBytes();
  unsigned long usedBytes = SPIFFS.usedBytes();
  float usedPercentage = (float)usedBytes / totalBytes * 100;

  Serial.printf("SPIFFS: %u bytes used of %u bytes (%.2f%%)\n",
                usedBytes, totalBytes, usedPercentage);

  // Nếu sử dụng hơn 90% dung lượng
  return (usedPercentage <= 90);
}

// Xóa dữ liệu cảm biến cũ nhất
void removeOldestSensorData() {
  if (!SPIFFS.exists(SENSORS_FILE)) {
    return;
  }

  File file = SPIFFS.open(SENSORS_FILE, FILE_READ);
  if (!file) {
    return;
  }

  DynamicJsonDocument doc(8192);
  DeserializationError error = deserializeJson(doc, file);
  file.close();

  if (error) {
    return;
  }

  JsonArray array = doc.as<JsonArray>();
  if (array.size() <= 1) {
    return;
  }

  // Xóa 20% dữ liệu cũ nhất
  size_t removeCount = max((size_t)1, array.size() / 5);
  DynamicJsonDocument newDoc(8192);
  JsonArray newArray = newDoc.to<JsonArray>();

  // Chỉ giữ lại dữ liệu mới
  for (size_t i = removeCount; i < array.size(); i++) {
    newArray.add(array[i]);
  }

  // Lưu lại vào file
  File newFile = SPIFFS.open(SENSORS_FILE, FILE_WRITE);
  if (newFile) {
    serializeJson(newDoc, newFile);
    newFile.close();
    Serial.printf("✅ Đã xóa %d bản ghi cũ nhất\n", removeCount);
  }
}

void checkFirebaseConnection() {
  Serial.println("\n----- Bắt đầu kiểm tra kết nối Firebase -----");
  Serial.println("🔍 Đang kiểm tra trạng thái kết nối Firebase...");

  // Kiểm tra trạng thái WiFi trước
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi chưa kết nối, không thể kiểm tra Firebase");
    Serial.println("📶 Trạng thái WiFi: " + String(WiFi.status()));
    Serial.println("🔄 Hãy đảm bảo ESP32 đã kết nối WiFi trước khi kiểm tra Firebase");
    Serial.println("----- Kết thúc kiểm tra kết nối Firebase -----\n");
    return;
  }

  Serial.println("✅ WiFi đã kết nối");
  Serial.printf("📶 Địa chỉ IP: %s\n", WiFi.localIP().toString().c_str());
  Serial.printf("📶 Cường độ tín hiệu: %d dBm\n", WiFi.RSSI());

  if (Firebase.ready()) {
    Serial.println("✅ Firebase đã sẵn sàng!");
    Serial.println("🔑 Đã xác thực thành công với Firebase");

    // Kiểm tra kết nối bằng cách đọc một giá trị đơn giản
    Serial.println("🔍 Đang kiểm tra kết nối bằng cách đọc dữ liệu từ '/test'...");
    if (Firebase.RTDB.getString(&fbdo, "/test")) {
      Serial.println("✅ Kết nối Firebase hoạt động tốt!");
      Serial.println("📄 Giá trị đọc được: " + fbdo.stringData());
    } else {
      Serial.println("⚠️ Lỗi đọc dữ liệu từ Firebase: " + fbdo.errorReason());

      // Thử ghi một giá trị đơn giản
      Serial.println("🔄 Đang thử ghi dữ liệu vào '/test'...");
      if (Firebase.RTDB.setString(&fbdo, "/test", "ESP32 Connected at " + String(millis()))) {
        Serial.println("✅ Ghi dữ liệu thành công! Kết nối Firebase hoạt động tốt");
      } else {
        Serial.println("❌ Lỗi ghi dữ liệu: " + fbdo.errorReason());
        Serial.printf("❌ Mã lỗi: %d, Thông báo: %s\n", fbdo.errorCode(), fbdo.errorReason().c_str());

        // Kiểm tra lỗi cụ thể
        if (fbdo.errorCode() == -127) {
          Serial.println("⚠️ Lỗi -127: Thiếu thông tin xác thực cần thiết");
          Serial.println("🔍 Kiểm tra lại DATABASE_URL và API_KEY");

          // Thử sửa DATABASE_URL (thêm dấu / ở cuối nếu chưa có)
          if (!String(DATABASE_URL).endsWith("/")) {
            Serial.println("🔄 Thử thêm dấu / vào cuối DATABASE_URL...");
            String newUrl = String(DATABASE_URL) + "/";
            Serial.println("🔗 URL mới: " + newUrl);

            // Cập nhật URL trong cấu hình
            config.database_url = newUrl.c_str();

            // Khởi tạo lại kết nối Firebase
            Serial.println("🔄 Đang thử kết nối lại với URL mới...");
            Firebase.begin(&config, &auth);
          } else {
            // Thử kết nối lại
            Serial.println("🔄 Đang thử kết nối lại...");
            Firebase.begin(&config, &auth);
          }
        } else if (fbdo.errorCode() == 400) {
          Serial.println("⚠️ Lỗi 400: Thông tin xác thực không hợp lệ");
          Serial.println("🔍 Kiểm tra lại USER_EMAIL và USER_PASSWORD");

          // In thông tin xác thực hiện tại (che một phần mật khẩu)
          String maskedPassword = String(USER_PASSWORD);
          if (maskedPassword.length() > 4) {
            maskedPassword = maskedPassword.substring(0, 2) + "****" +
                            maskedPassword.substring(maskedPassword.length() - 2);
          } else {
            maskedPassword = "****";
          }

          Serial.println("📧 Email: " + String(USER_EMAIL));
          Serial.println("🔑 Password: " + maskedPassword);

          // Thử kết nối lại
          Serial.println("🔄 Đang thử kết nối lại...");
          Firebase.begin(&config, &auth);
        }
      }
    }
  } else {
    Serial.println("❌ Firebase chưa sẵn sàng!");
    Serial.println("⚠️ Chưa xác thực thành công với Firebase");

    // In thông tin cấu hình (che một phần mật khẩu)
    String maskedPassword = String(USER_PASSWORD);
    if (maskedPassword.length() > 4) {
      maskedPassword = maskedPassword.substring(0, 2) + "****" +
                      maskedPassword.substring(maskedPassword.length() - 2);
    } else {
      maskedPassword = "****";
    }

    Serial.println("\n----- Thông tin cấu hình Firebase -----");
    Serial.println("🔑 API Key: " + String(API_KEY));
    Serial.println("🔗 Database URL: " + String(DATABASE_URL));
    Serial.println("📋 Project ID: " + String(FIREBASE_PROJECT_ID));
    Serial.println("📧 Email: " + String(USER_EMAIL));
    Serial.println("🔑 Password: " + maskedPassword);
    Serial.println("----- Kết thúc thông tin cấu hình -----\n");

    // Thử kết nối lại bằng cách khởi tạo lại Firebase
    Serial.println("🔄 Đang thử khởi tạo lại kết nối Firebase...");
    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true);

    // Kiểm tra lại sau khi khởi tạo lại
    Serial.println("⏳ Đợi 2 giây để khởi tạo kết nối...");
    delay(2000);
    if (Firebase.ready()) {
      Serial.println("✅ Kết nối lại thành công!");

      // Thử ghi dữ liệu để xác nhận kết nối
      if (Firebase.RTDB.setString(&fbdo, "/test", "ESP32 Reconnected at " + String(millis()))) {
        Serial.println("✅ Ghi dữ liệu thành công sau khi kết nối lại!");
      }
    } else {
      Serial.println("❌ Kết nối lại thất bại!");
      Serial.println("⚠️ Sẽ thử lại trong lần kiểm tra tiếp theo");
    }
  }

  Serial.println("----- Kết thúc kiểm tra kết nối Firebase -----\n");
}

// Hàm gửi dữ liệu lên Google Sheets thông qua Google Apps Script
bool sendToGoogleSheets(String dataType, String data) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ Không có kết nối WiFi để gửi Google Sheets");
    return false;
  }

  Serial.println("\n----- Bắt đầu gửi dữ liệu lên Google Sheets -----");
  Serial.println("📊 Loại dữ liệu: " + dataType);
  Serial.println("📄 Dữ liệu: " + data);

  HTTPClient http;
  http.begin(GOOGLE_SCRIPT_URL);
  http.addHeader("Content-Type", "application/json");

  // Tạo JSON payload
  String payload = "{\"type\":\"" + dataType + "\",\"data\":" + data + ",\"timestamp\":" + String(getCurrentTimestamp()) + "}";
  Serial.println("📤 Payload: " + payload);

  int httpResponseCode = http.POST(payload);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("✅ Phản hồi từ Google Apps Script:");
    Serial.println("📋 Mã phản hồi: " + String(httpResponseCode));
    Serial.println("📄 Nội dung: " + response);

    http.end();
    Serial.println("----- Kết thúc gửi dữ liệu lên Google Sheets -----\n");
    return httpResponseCode == 200;
  } else {
    Serial.println("❌ Lỗi gửi dữ liệu lên Google Sheets:");
    Serial.println("📋 Mã lỗi: " + String(httpResponseCode));
    Serial.println("📄 Lỗi: " + http.errorToString(httpResponseCode));

    http.end();
    Serial.println("----- Kết thúc gửi dữ liệu lên Google Sheets -----\n");
    return false;
  }
}

// Hàm thông báo Google Apps Script để đồng bộ dữ liệu
void notifyGoogleSheets() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ Không có kết nối WiFi để thông báo Google Sheets");
    return;
  }

  Serial.println("\n🔔 Thông báo Google Apps Script để đồng bộ dữ liệu...");

  HTTPClient http;
  http.begin(GOOGLE_SCRIPT_URL);
  http.addHeader("Content-Type", "application/json");

  // Gửi thông báo đơn giản để trigger đồng bộ
  String payload = "{\"action\":\"sync\",\"timestamp\":" + String(getCurrentTimestamp()) + "}";

  int httpResponseCode = http.POST(payload);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("✅ Đã thông báo Google Apps Script thành công");
    Serial.println("📋 Mã phản hồi: " + String(httpResponseCode));
  } else {
    Serial.println("❌ Lỗi thông báo Google Apps Script:");
    Serial.println("📋 Mã lỗi: " + String(httpResponseCode));
  }

  http.end();
}

// Hàm buzzer cho điểm danh thành công (kêu 2 lần)
void buzzerSuccess() {
  Serial.println("🔊 Buzzer: Điểm danh thành công (2 tiếng kêu)");
  buzzerBeep(2, 200, 150); // 2 lần, mỗi lần 200ms, nghỉ 150ms
}

// Hàm buzzer cho điểm danh thất bại (kêu 3 lần)
void buzzerFailed() {
  Serial.println("🔊 Buzzer: Điểm danh thất bại (3 tiếng kêu)");
  buzzerBeep(3, 300, 200); // 3 lần, mỗi lần 300ms, nghỉ 200ms
}

// Hàm buzzer tổng quát
void buzzerBeep(int times, int duration, int pause) {
  for (int i = 0; i < times; i++) {
    // Bật buzzer
    digitalWrite(BUZZER_PIN, HIGH);
    delay(duration);

    // Tắt buzzer
    digitalWrite(BUZZER_PIN, LOW);

    // Nghỉ giữa các tiếng kêu (trừ lần cuối)
    if (i < times - 1) {
      delay(pause);
    }
  }

  // Đảm bảo buzzer tắt hoàn toàn
  digitalWrite(BUZZER_PIN, LOW);
}
