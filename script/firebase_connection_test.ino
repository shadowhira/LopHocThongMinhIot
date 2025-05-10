#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

// Cấu hình WiFi
const char* ssid = "Xuantruong";
const char* password = "1234567890";

// Cấu hình Firebase
#define API_KEY "AIzaSyAxAR_UUEaXdJl7SMo8vhbPcDcLvvGSM0w"
#define DATABASE_URL "https://doantotnghiep-ae0f8-default-rtdb.asia-southeast1.firebasedatabase.app"
#define USER_EMAIL "phucdoantotnghiep@gmail.com"
#define USER_PASSWORD "Doantotnghiep123@"

// Biến Firebase
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// Biến kiểm soát
bool testEmailAuth = true;  // true: xác thực email/password, false: xác thực API key
unsigned long dataMillis = 0;
int testCounter = 0;

void setup() {
  Serial.begin(115200);
  Serial.println("\n----- Bắt đầu kiểm tra kết nối Firebase -----");

  // Kết nối WiFi
  WiFi.begin(ssid, password);
  Serial.print("Đang kết nối WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Đã kết nối WiFi, IP: ");
  Serial.println(WiFi.localIP());

  // Cấu hình Firebase
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  config.token_status_callback = tokenStatusCallback;

  if (testEmailAuth) {
    // Phương pháp 1: Xác thực bằng email/password
    Serial.println("\n----- Phương pháp 1: Xác thực bằng email/password -----");
    auth.user.email = USER_EMAIL;
    auth.user.password = USER_PASSWORD;

    Serial.println("Email: " + String(USER_EMAIL));
    Serial.println("Password: " + String(USER_PASSWORD));

    Firebase.begin(&config, &auth);
  } else {
    // Phương pháp 2: Xác thực bằng API key (ẩn danh)
    Serial.println("\n----- Phương pháp 2: Xác thực bằng API key (ẩn danh) -----");
    // Trong phiên bản mới của thư viện, không thể gọi Firebase.begin(DATABASE_URL, API_KEY) trực tiếp
    // Thay vào đó, chúng ta vẫn sử dụng config và auth, nhưng không đặt thông tin đăng nhập
    Firebase.begin(&config, &auth);
  }

  Firebase.reconnectWiFi(true);

  // Đặt thời gian chờ cho các hoạt động Firebase
  fbdo.setResponseSize(4096);
  Firebase.RTDB.setReadTimeout(&fbdo, 1000 * 60);
  Firebase.RTDB.setwriteSizeLimit(&fbdo, "tiny");

  // In thông tin cấu hình
  Serial.println("\n----- Thông tin cấu hình Firebase -----");
  Serial.println("API Key: " + String(API_KEY));
  Serial.println("Database URL: " + String(DATABASE_URL));
  Serial.println("Phương thức xác thực: " + String(testEmailAuth ? "Email/Password" : "API Key (ẩn danh)"));
  Serial.println("----- Kết thúc thông tin cấu hình -----\n");
}

void loop() {
  // Kiểm tra kết nối Firebase mỗi 10 giây
  if (millis() - dataMillis > 10000 || dataMillis == 0) {
    dataMillis = millis();
    testCounter++;

    Serial.println("\n----- Kiểm tra kết nối Firebase lần " + String(testCounter) + " -----");

    // Kiểm tra trạng thái Firebase
    if (Firebase.ready()) {
      Serial.println("✅ Firebase đã sẵn sàng!");

      // Thử đọc dữ liệu
      if (Firebase.RTDB.getString(&fbdo, "/test")) {
        Serial.println("✅ Đọc dữ liệu thành công!");
        Serial.println("Giá trị đọc được: " + fbdo.stringData());
      } else {
        Serial.println("❌ Lỗi đọc dữ liệu: " + fbdo.errorReason());
      }

      // Thử ghi dữ liệu
      String testValue = "ESP32 Test " + String(testCounter);
      if (Firebase.RTDB.setString(&fbdo, "/test", testValue)) {
        Serial.println("✅ Ghi dữ liệu thành công: " + testValue);
      } else {
        Serial.println("❌ Lỗi ghi dữ liệu: " + fbdo.errorReason());
        Serial.println("Mã lỗi: " + String(fbdo.errorCode()) + ", Thông báo: " + fbdo.errorReason());

        // Kiểm tra lỗi cụ thể
        if (fbdo.errorCode() == -127) {
          Serial.println("Lỗi -127: Thiếu thông tin xác thực cần thiết");
          Serial.println("Kiểm tra lại DATABASE_URL và API_KEY");

          // Thử sửa DATABASE_URL (thêm dấu / ở cuối nếu chưa có)
          if (!String(DATABASE_URL).endsWith("/")) {
            Serial.println("Thử thêm dấu / vào cuối DATABASE_URL...");
            String newUrl = String(DATABASE_URL) + "/";
            Serial.println("URL mới: " + newUrl);

            // Khởi tạo lại kết nối Firebase
            config.database_url = newUrl.c_str();
            Firebase.begin(&config, &auth);
          }
        } else if (fbdo.errorCode() == 400) {
          Serial.println("Lỗi 400: Thông tin xác thực không hợp lệ");
          Serial.println("Kiểm tra lại USER_EMAIL và USER_PASSWORD");

          // Thử chuyển sang phương thức xác thực API key
          Serial.println("Thử chuyển sang phương thức xác thực API key...");
          // Xóa thông tin đăng nhập
          auth.user.email = "";
          auth.user.password = "";
          Firebase.begin(&config, &auth);
        }
      }
    } else {
      Serial.println("❌ Firebase chưa sẵn sàng!");

      // In thông tin trạng thái
      Serial.println("Trạng thái kết nối: " + getTokenStatus());

      // Thử kết nối lại
      Serial.println("Đang thử kết nối lại...");
      Firebase.begin(&config, &auth);
      Firebase.reconnectWiFi(true);
    }

    Serial.println("----- Kết thúc kiểm tra -----");
  }
}

// Hàm lấy trạng thái token
String getTokenStatus() {
  // Trong phiên bản mới của thư viện Firebase, cấu trúc token đã thay đổi
  // Trả về thông tin đơn giản hơn
  if (Firebase.ready()) {
    return "Sẵn sàng";
  } else {
    return "Chưa sẵn sàng";
  }
}
