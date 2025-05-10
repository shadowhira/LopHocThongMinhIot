#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <ESP32Servo.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

// --- Khai báo chân kết nối ---
#define LED_PIN 14        // Chân điều khiển đèn (có thể thay đổi)
#define SERVO_PIN 12      // Chân điều khiển servo (có thể thay đổi)

// Firebase & WiFi
#define API_KEY "AIzaSyAxAR_UUEaXdJl7SMo8vhbPcDcLvvGSM0w"
#define USER_EMAIL "admin@example.com"
#define USER_PASSWORD "password123"
const char* ssid = "Xuantruong";
const char* password = "1234567890";

// Firebase
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// Servo
Servo doorServo;
int servoClosedPosition = 0;    // Vị trí đóng cửa (0 độ)
int servoOpenPosition = 90;     // Vị trí mở cửa (90 độ)

// Biến lưu trạng thái thiết bị
bool lightState = false;
bool doorState = false;

// Thời gian
unsigned long lastDeviceCheck = 0;
const unsigned long DEVICE_CHECK_INTERVAL = 1000; // 1 giây

void setup() {
  Serial.begin(115200);
  Serial.println("Khởi động hệ thống điều khiển thiết bị...");

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
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;
  config.token_status_callback = tokenStatusCallback;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  // Khởi tạo chân điều khiển thiết bị
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);  // Mặc định tắt đèn

  // Khởi tạo servo
  ESP32PWM::allocateTimer(0);
  doorServo.setPeriodHertz(50);    // Tần số PWM cho servo (50Hz)
  doorServo.attach(SERVO_PIN, 500, 2400); // Chân, min pulse width, max pulse width
  doorServo.write(servoClosedPosition); // Mặc định đóng cửa

  // Khởi tạo trạng thái thiết bị trên Firebase
  initDeviceStatus();
}

void loop() {
  // Kiểm tra điều khiển thiết bị mỗi 1 giây
  if (millis() - lastDeviceCheck > DEVICE_CHECK_INTERVAL) {
    lastDeviceCheck = millis();
    checkDeviceControls();
  }
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
    
    if (Firebase.RTDB.updateNode(&fbdo, "devices", &json)) {
      Serial.println("✅ Khởi tạo trạng thái thiết bị thành công");
    } else {
      Serial.println("❌ Lỗi khởi tạo trạng thái thiết bị: " + fbdo.errorReason());
    }
  }
}

// Hàm kiểm tra và cập nhật trạng thái thiết bị
void checkDeviceControls() {
  if (Firebase.ready()) {
    // Kiểm tra trạng thái đèn
    if (Firebase.RTDB.getBool(&fbdo, "devices/lights/light1")) {
      bool newLightState = fbdo.boolData();
      if (newLightState != lightState) {
        lightState = newLightState;
        controlLight(lightState);
      }
    }
    
    // Kiểm tra trạng thái cửa
    if (Firebase.RTDB.getBool(&fbdo, "devices/doors/door1")) {
      bool newDoorState = fbdo.boolData();
      if (newDoorState != doorState) {
        doorState = newDoorState;
        controlDoor(doorState);
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
  doorServo.write(position);
  Serial.println(state ? "Cửa: MỞ" : "Cửa: ĐÓNG");
  
  // Cập nhật trạng thái thực tế lên Firebase
  if (Firebase.RTDB.setBool(&fbdo, "devices/status/door1", state)) {
    Serial.println("✅ Cập nhật trạng thái cửa thành công");
  } else {
    Serial.println("❌ Lỗi cập nhật trạng thái cửa: " + fbdo.errorReason());
  }
}
