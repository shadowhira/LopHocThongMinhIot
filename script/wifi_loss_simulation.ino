#include <WiFi.h>
#include <SPIFFS.h>
#include <ArduinoJson.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"
#include <DHT.h>

// Cấu hình WiFi
const char* ssid = "Xuantruong";
const char* password = "1234567890";

// Cấu hình Firebase
#define API_KEY "AIzaSyAxAR_UUEaXdJl7SMo8vhbPcDcLvvGSM0w"
#define DATABASE_URL "https://doantotnghiep-ae0f8-default-rtdb.asia-southeast1.firebasedatabase.app"
#define USER_EMAIL "phucdoantotnghiep@gmail.com"
#define USER_PASSWORD "Doantotnghiep123@"

// Cấu hình chân cảm biến
#define DHT_PIN 26
#define DHT_TYPE DHT11
#define MQ2_PIN 32
#define FLAME_PIN 25

// Cấu hình SPIFFS
#define SENSORS_FILE "/pending_sensors.json"

// Cấu hình thời gian
#define SENSOR_UPDATE_INTERVAL 5000  // 5 giây khi online
#define OFFLINE_UPDATE_INTERVAL 60000 // 1 phút khi offline

// Biến Firebase
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// Biến DHT
DHT dht(DHT_PIN, DHT_TYPE);

// Biến theo dõi thời gian
unsigned long lastSensorUpdate = 0;
unsigned long lastOfflineSave = 0;

// Biến theo dõi trạng thái WiFi
bool wasConnected = false;

// Cấu trúc dữ liệu cảm biến
struct SensorData {
  float temperature;
  float humidity;
  float gas;
  bool flame;
  String status;
  unsigned long timestamp;
};

// Ngưỡng cảnh báo
float tempMin = 18.0;
float tempMax = 30.0;
float humidMin = 40.0;
float humidMax = 80.0;
float gasThreshold = 1000.0;

void setup() {
  Serial.begin(115200);
  Serial.println("Khởi động chương trình mô phỏng mất WiFi...");

  // Khởi tạo SPIFFS
  if (!SPIFFS.begin(true)) {
    Serial.println("Lỗi khởi tạo SPIFFS!");
    return;
  }

  // Khởi tạo cảm biến
  dht.begin();
  pinMode(FLAME_PIN, INPUT);

  // Kết nối WiFi
  connectWiFi();

  // Cấu hình Firebase
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  config.token_status_callback = tokenStatusCallback;

  // Cấu hình xác thực email/password
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;

  // Khởi tạo Firebase
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  // Kiểm tra dung lượng SPIFFS
  checkSPIFFSSpace();

  // Kiểm tra xem có dữ liệu trong SPIFFS không
  if (SPIFFS.exists(SENSORS_FILE)) {
    Serial.println("Phát hiện dữ liệu offline trong SPIFFS!");

    // Đợi Firebase sẵn sàng
    Serial.println("Đợi Firebase sẵn sàng...");
    unsigned long startTime = millis();
    while (!Firebase.ready() && millis() - startTime < 10000) {
      delay(500);
      Serial.print(".");
    }
    Serial.println();

    if (Firebase.ready() && WiFi.status() == WL_CONNECTED) {
      Serial.println("Đang gửi dữ liệu offline lên Firebase...");
      sendPendingSensorData();
    } else {
      Serial.println("Firebase chưa sẵn sàng, dữ liệu offline sẽ được giữ lại.");
    }
  } else {
    Serial.println("Không có dữ liệu offline trong SPIFFS.");
  }
}

void loop() {
  unsigned long currentMillis = millis();

  // Kiểm tra kết nối WiFi
  bool isConnected = (WiFi.status() == WL_CONNECTED);

  // Phát hiện thay đổi trạng thái kết nối
  if (isConnected != wasConnected) {
    if (isConnected) {
      Serial.println("WiFi đã được kết nối lại!");
      Serial.println("Dữ liệu đã lưu trong SPIFFS sẽ được gửi khi khởi động lại ESP32");
      Serial.println("Vui lòng nhấn nút RESET để gửi dữ liệu");
    } else {
      Serial.println("WiFi đã mất kết nối!");
    }
    wasConnected = isConnected;
  }

  // Cập nhật dữ liệu cảm biến theo định kỳ
  if (currentMillis - lastSensorUpdate >= SENSOR_UPDATE_INTERVAL) {
    updateSensors(isConnected);
    lastSensorUpdate = currentMillis;
  }

  // Thêm delay nhỏ để giảm tải CPU
  delay(100);
}

// Kết nối WiFi
void connectWiFi() {
  Serial.println("Đang kết nối WiFi...");
  WiFi.begin(ssid, password);

  unsigned long startAttemptTime = millis();
  while (WiFi.status() != WL_CONNECTED &&
         millis() - startAttemptTime < 10000) {
    delay(100);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi đã kết nối!");
    Serial.print("Địa chỉ IP: ");
    Serial.println(WiFi.localIP());
    wasConnected = true;
  } else {
    Serial.println("\nKhông thể kết nối WiFi!");
    wasConnected = false;
  }
}

// Đọc dữ liệu cảm biến
SensorData readSensorData() {
  SensorData data;

  // Đọc nhiệt độ và độ ẩm
  data.temperature = dht.readTemperature();
  data.humidity = dht.readHumidity();

  // Đọc giá trị khí gas (mô phỏng)
  data.gas = analogRead(MQ2_PIN) / 4095.0 * 1000.0;

  // Đọc cảm biến lửa
  data.flame = digitalRead(FLAME_PIN) == LOW;

  // Kiểm tra giá trị hợp lệ
  if (isnan(data.temperature) || isnan(data.humidity)) {
    data.temperature = random(20, 30);
    data.humidity = random(40, 80);
    Serial.println("Lỗi đọc DHT, sử dụng giá trị ngẫu nhiên!");
  }

  // Xác định trạng thái
  data.status = "AN TOAN";
  if (data.temperature > tempMax || data.temperature < tempMin ||
      data.humidity > humidMax || data.humidity < humidMin ||
      data.gas > gasThreshold || data.flame) {
    data.status = "NGUY HIEM";
  }

  // Thêm timestamp
  data.timestamp = millis();

  return data;
}

// Cập nhật dữ liệu cảm biến
void updateSensors(bool isConnected) {
  // Đọc dữ liệu cảm biến
  SensorData data = readSensorData();

  // In thông tin cảm biến
  Serial.printf("Nhiệt độ: %.1f°C, Độ ẩm: %.1f%%, Gas: %.0f ppm, Lửa: %s, Trạng thái: %s\n",
                data.temperature, data.humidity, data.gas,
                data.flame ? "CÓ" : "KHÔNG", data.status.c_str());

  if (isConnected && Firebase.ready()) {
    // Gửi dữ liệu lên Firebase
    if (updateSensorsToFirebase(data)) {
      Serial.println("✅ Dữ liệu đã được gửi lên Firebase thành công");
    } else {
      Serial.println("⚠️ Không thể gửi lên Firebase, lưu vào SPIFFS");
      saveSensorDataToSPIFFS(data);
    }
  } else {
    // Lưu vào SPIFFS nếu không có kết nối
    // Chỉ lưu mỗi OFFLINE_UPDATE_INTERVAL
    if (millis() - lastOfflineSave >= OFFLINE_UPDATE_INTERVAL) {
      saveSensorDataToSPIFFS(data);
      lastOfflineSave = millis();
    }
  }
}

// Gửi dữ liệu cảm biến lên Firebase
bool updateSensorsToFirebase(SensorData data) {
  // Tạo JSON
  FirebaseJson json;
  json.set("temperature", data.temperature);
  json.set("humidity", data.humidity);
  json.set("gas", data.gas);
  json.set("flame", data.flame);
  json.set("status", data.status);
  json.set("updatedAt", data.timestamp);

  bool success = true;

  // Cập nhật dữ liệu hiện tại
  if (Firebase.RTDB.updateNode(&fbdo, "sensors/current", &json)) {
    Serial.println("✅ Cập nhật dữ liệu cảm biến thành công");
  } else {
    Serial.println("❌ Lỗi cập nhật dữ liệu cảm biến: " + fbdo.errorReason());
    success = false;
  }

  // Lưu vào lịch sử
  String historyPath = "sensors/history/" + String(data.timestamp);
  if (Firebase.RTDB.setJSON(&fbdo, historyPath.c_str(), &json)) {
    Serial.println("✅ Lưu lịch sử cảm biến thành công");
  } else {
    Serial.println("❌ Lỗi lưu lịch sử cảm biến: " + fbdo.errorReason());
    success = false;
  }

  return success;
}

// Lưu dữ liệu cảm biến vào SPIFFS
void saveSensorDataToSPIFFS(SensorData data) {
  // Kiểm tra dung lượng SPIFFS
  if (!checkSPIFFSSpace()) {
    Serial.println("⚠️ SPIFFS gần đầy, xóa dữ liệu cũ nhất");
    removeOldestSensorData();
  }

  // Đọc dữ liệu hiện có
  DynamicJsonDocument doc(8192);

  if (SPIFFS.exists(SENSORS_FILE)) {
    File file = SPIFFS.open(SENSORS_FILE, FILE_READ);
    if (file) {
      DeserializationError error = deserializeJson(doc, file);
      file.close();

      if (error) {
        Serial.println("Lỗi đọc file, tạo mới");
        doc.clear();
        doc.to<JsonArray>();
      }
    }
  } else {
    // Tạo mảng mới nếu file không tồn tại
    doc.to<JsonArray>();
  }

  // Thêm dữ liệu mới
  JsonArray array = doc.as<JsonArray>();
  JsonObject obj = array.createNestedObject();
  obj["temperature"] = data.temperature;
  obj["humidity"] = data.humidity;
  obj["gas"] = data.gas;
  obj["flame"] = data.flame;
  obj["status"] = data.status;
  obj["timestamp"] = data.timestamp;

  // Lưu lại vào file
  File file = SPIFFS.open(SENSORS_FILE, FILE_WRITE);
  if (file) {
    serializeJson(doc, file);
    file.close();
    Serial.println("✅ Dữ liệu cảm biến đã lưu vào SPIFFS");
  } else {
    Serial.println("❌ Lỗi mở file để ghi");
  }
}

// Gửi dữ liệu cảm biến đang chờ
void sendPendingSensorData() {
  if (!SPIFFS.exists(SENSORS_FILE)) {
    Serial.println("Không có dữ liệu đang chờ để gửi");
    return;
  }

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Không thể gửi dữ liệu: Không có kết nối WiFi");
    return;
  }

  if (!Firebase.ready()) {
    Serial.println("Firebase chưa sẵn sàng, thử làm mới token...");

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
    while (!Firebase.ready() && millis() - startTime < 10000) {
      delay(500);
      Serial.print(".");
    }
    Serial.println();

    if (!Firebase.ready()) {
      Serial.println("Không thể làm mới token Firebase, thử lại sau");
      return;
    }

    Serial.println("Token Firebase đã được làm mới thành công");
  }

  Serial.println("Đang gửi dữ liệu cảm biến đang chờ...");

  File file = SPIFFS.open(SENSORS_FILE, FILE_READ);
  if (!file) {
    Serial.println("❌ Lỗi mở file để đọc");
    return;
  }

  String fileContent = file.readString();
  file.close();

  // Kiểm tra nội dung file
  Serial.println("Nội dung file:");
  Serial.println(fileContent);

  DynamicJsonDocument doc(8192);
  DeserializationError error = deserializeJson(doc, fileContent);

  if (error) {
    Serial.println("❌ Lỗi đọc file JSON: " + String(error.c_str()));
    // Xóa file nếu JSON không hợp lệ
    SPIFFS.remove(SENSORS_FILE);
    return;
  }

  JsonArray array = doc.as<JsonArray>();
  Serial.printf("Có %d bản ghi cần gửi\n", array.size());

  if (array.size() == 0) {
    SPIFFS.remove(SENSORS_FILE);
    return;
  }

  bool allSent = true;
  int sentCount = 0;

  // Lưu lại bản ghi cuối cùng để cập nhật dữ liệu hiện tại
  FirebaseJson lastJson;

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

    if (!Firebase.RTDB.setJSON(&fbdo, historyPath.c_str(), &json)) {
      Serial.println("❌ Lỗi gửi dữ liệu lên Firebase: " + fbdo.errorReason());
      allSent = false;
      break;
    }

    sentCount++;
    Serial.printf("Đã gửi bản ghi %d/%d\n", sentCount, (int)array.size());

    delay(500); // Tăng delay để tránh quá tải Firebase
  }

  // Cập nhật dữ liệu hiện tại với bản ghi cuối cùng
  if (sentCount > 0) {
    Serial.println("Cập nhật dữ liệu hiện tại...");
    if (!Firebase.RTDB.updateNode(&fbdo, "sensors/current", &lastJson)) {
      Serial.println("❌ Lỗi cập nhật dữ liệu hiện tại: " + fbdo.errorReason());
    } else {
      Serial.println("✅ Cập nhật dữ liệu hiện tại thành công");
    }
  }

  if (allSent) {
    // Xóa file nếu tất cả dữ liệu đã được gửi
    SPIFFS.remove(SENSORS_FILE);
    Serial.printf("✅ Đã gửi thành công %d bản ghi\n", sentCount);
  } else {
    Serial.printf("⚠️ Đã gửi %d/%d bản ghi, còn lại sẽ được gửi sau\n",
                 sentCount, (int)array.size());

    // Xóa các bản ghi đã gửi thành công
    if (sentCount > 0) {
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
        Serial.println("✅ Đã lưu lại các bản ghi chưa gửi");
      }
    }
  }
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
