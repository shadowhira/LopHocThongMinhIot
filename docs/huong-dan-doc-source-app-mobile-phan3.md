# Hướng dẫn đọc source code ứng dụng di động (Phần 3)

> **Lưu ý**: Tài liệu này được chia thành 3 phần:
> - [Phần 1: Cấu trúc thư mục và các file chính](huong-dan-doc-source-app-mobile.md)
> - [Phần 2: Các màn hình chính và hooks](huong-dan-doc-source-app-mobile-phan2.md)
> - [Phần 3: Phân tích chi tiết luồng hoạt động](huong-dan-doc-source-app-mobile-phan3.md) (tài liệu hiện tại)

Tài liệu này phân tích chi tiết các luồng hoạt động cụ thể trong ứng dụng di động "Lớp học thông minh" để giúp bạn hiểu rõ hơn cách code hoạt động.

## 1. Luồng điều khiển đèn từ ứng dụng đến ESP32

Chúng ta sẽ phân tích chi tiết luồng điều khiển đèn từ khi người dùng nhấn nút trong ứng dụng cho đến khi đèn thực tế được bật/tắt trên ESP32.

### 1.1. Người dùng tương tác với giao diện

Khi người dùng nhấn vào công tắc đèn trong màn hình Thiết bị:

```javascript
// Trong DevicesScreen.js
<Switch
  value={devices.lights?.light1 || false}
  onValueChange={() => toggleLight('light1')}
  trackColor={{ false: '#767577', true: theme.colors.primary }}
  thumbColor={devices.lights?.light1 ? '#f5dd4b' : '#f4f3f4'}
/>
```

Khi người dùng nhấn vào công tắc, hàm `toggleLight('light1')` được gọi với tham số là ID của đèn cần điều khiển.

### 1.2. Xử lý trong ứng dụng

Hàm `toggleLight` thực hiện các bước sau:

```javascript
// Trong DevicesScreen.js
const toggleLight = async (lightId) => {
  try {
    // Hiển thị trạng thái đang cập nhật
    setUpdating(prev => ({ ...prev, [lightId]: true }));

    // Lấy trạng thái hiện tại của đèn
    const currentValue = devices.lights?.[lightId] || false;

    // Cập nhật trạng thái mới lên Firebase (đảo ngược trạng thái hiện tại)
    await update(ref(db, `devices/lights`), {
      [lightId]: !currentValue
    });
  } catch (error) {
    console.error('Error toggling light:', error);
  } finally {
    // Ẩn trạng thái đang cập nhật
    setUpdating(prev => ({ ...prev, [lightId]: false }));
  }
};
```

Giải thích từng bước:
1. Đặt trạng thái `updating[lightId]` thành `true` để hiển thị loading indicator
2. Lấy trạng thái hiện tại của đèn từ state `devices.lights`
3. Sử dụng hàm `update()` từ Firebase để cập nhật trạng thái mới (đảo ngược trạng thái hiện tại)
4. Đường dẫn cập nhật là `devices/lights` và giá trị cập nhật là `{ [lightId]: !currentValue }`
5. Xử lý lỗi nếu có
6. Cuối cùng, đặt lại trạng thái `updating[lightId]` thành `false`

### 1.3. Dữ liệu được cập nhật trên Firebase

Sau khi hàm `update()` thực thi thành công, dữ liệu trên Firebase Realtime Database được cập nhật:

```
devices/
  lights/
    light1: true  // hoặc false, tùy thuộc vào trạng thái mới
```

### 1.4. ESP32 lắng nghe thay đổi từ Firebase

Trong code ESP32 (file `esp32_smart_classroom.ino`), có đoạn code lắng nghe thay đổi từ Firebase:

```cpp
// Trong hàm checkDeviceControls()
void checkDeviceControls() {
  if (Firebase.ready()) {
    // Kiểm tra chế độ tự động cho đèn
    if (Firebase.RTDB.getBool(&fbdo, "devices/auto/light")) {
      lightAutoMode = fbdo.boolData();
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

    // Các đoạn code khác...
  }
}
```

Giải thích từng bước:
1. Kiểm tra xem Firebase đã sẵn sàng chưa
2. Đọc trạng thái chế độ tự động cho đèn từ `devices/auto/light`
3. Nếu không ở chế độ tự động, đọc trạng thái đèn từ `devices/lights/light1`
4. Nếu trạng thái mới khác với trạng thái hiện tại, cập nhật trạng thái và gọi hàm `controlLight()`

### 1.5. ESP32 điều khiển đèn thực tế

Hàm `controlLight()` trong ESP32 thực hiện việc điều khiển đèn thực tế:

```cpp
// Trong hàm controlLight()
void controlLight(bool state) {
  // Điều khiển đèn thông qua chân GPIO
  digitalWrite(LED_PIN, state ? HIGH : LOW);
  Serial.println(state ? "Đèn: BẬT" : "Đèn: TẮT");

  // Cập nhật trạng thái thực tế lên Firebase
  if (Firebase.RTDB.setBool(&fbdo, "devices/status/light1", state)) {
    Serial.println("✅ Cập nhật trạng thái đèn thành công");
  } else {
    Serial.println("❌ Lỗi cập nhật trạng thái đèn: " + fbdo.errorReason());
  }
}
```

Giải thích từng bước:
1. Sử dụng `digitalWrite()` để điều khiển chân GPIO kết nối với đèn
2. In thông báo trạng thái đèn ra Serial Monitor
3. Cập nhật trạng thái thực tế của đèn lên Firebase tại đường dẫn `devices/status/light1`

### 1.6. Ứng dụng cập nhật giao diện theo trạng thái thực tế

Trong ứng dụng, chúng ta đã thiết lập lắng nghe thay đổi từ Firebase:

```javascript
// Trong DevicesScreen.js
useEffect(() => {
  // Đọc trạng thái thiết bị từ Firebase
  const devicesRef = ref(db, 'devices');
  const unsubscribe = onValue(devicesRef, (snapshot) => {
    if (snapshot.exists()) {
      setDevices(snapshot.val() || {});
    }
    setLoading(false);
  });

  return () => unsubscribe();
}, []);
```

Khi ESP32 cập nhật trạng thái thực tế lên `devices/status/light1`, ứng dụng sẽ nhận được thông báo thay đổi và cập nhật state `devices`. Giao diện sẽ hiển thị trạng thái thực tế của đèn:

```javascript
// Trong DevicesScreen.js
<Text style={[styles.statusText, {
  color: devices.status?.light1 ? theme.colors.success : theme.colors.text
}]}>
  {devices.status?.light1 ? 'BẬT' : 'TẮT'}
</Text>
```

### 1.7. Tóm tắt luồng hoạt động

1. **Người dùng tương tác**: Nhấn công tắc đèn trong ứng dụng
2. **Ứng dụng xử lý**: Gọi hàm `toggleLight()` để đảo ngược trạng thái đèn
3. **Cập nhật Firebase**: Trạng thái mới được cập nhật lên `devices/lights/light1`
4. **ESP32 lắng nghe**: Phát hiện thay đổi trong `devices/lights/light1`
5. **ESP32 điều khiển**: Bật/tắt đèn thực tế thông qua chân GPIO
6. **ESP32 phản hồi**: Cập nhật trạng thái thực tế lên `devices/status/light1`
7. **Ứng dụng cập nhật**: Nhận thông báo thay đổi và cập nhật giao diện

## 2. Luồng nhận và hiển thị cảnh báo

Chúng ta sẽ phân tích chi tiết luồng nhận và hiển thị cảnh báo từ khi ESP32 phát hiện điều kiện cảnh báo cho đến khi ứng dụng hiển thị thông báo.

### 2.1. ESP32 phát hiện điều kiện cảnh báo

Trong code ESP32, hàm `checkAlerts()` kiểm tra các điều kiện cảnh báo:

```cpp
// Trong hàm checkAlerts()
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

    // Các đoạn code kiểm tra cảnh báo khác...
  }
}
```

Khi phát hiện điều kiện cảnh báo (ví dụ: nhiệt độ vượt ngưỡng), ESP32 gọi hàm `createAlert()` để tạo cảnh báo.

### 2.2. ESP32 tạo cảnh báo trên Firebase

Hàm `createAlert()` tạo cảnh báo trên Firebase:

```cpp
// Trong hàm createAlert()
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
```

Cảnh báo được lưu vào đường dẫn `alerts/active/{alertId}` trong Firebase với các thông tin:
- `type`: Loại cảnh báo (temperature_high, temperature_low, humidity_high, v.v.)
- `value`: Giá trị hiện tại
- `threshold`: Ngưỡng cảnh báo
- `timestamp`: Thời gian tạo cảnh báo
- `status`: Trạng thái cảnh báo ("new")
- `message`: Thông điệp cảnh báo

### 2.3. Ứng dụng lắng nghe cảnh báo mới

Trong ứng dụng, hook `useAlerts` lắng nghe cảnh báo từ Firebase:

```javascript
// Trong useAlerts.js
useEffect(() => {
  // Lấy cảnh báo đang hoạt động
  const activeAlertsRef = ref(db, 'alerts/active');
  const unsubscribeActive = onValue(activeAlertsRef, (snapshot) => {
    if (snapshot.exists()) {
      const alertsData = snapshot.val();
      const alertsList = Object.keys(alertsData).map(key => ({
        id: key,
        ...alertsData[key]
      }));
      setActiveAlerts(alertsList);

      // Kiểm tra cảnh báo mới
      const newAlerts = alertsList.filter(alert => alert.status === 'new');
      if (newAlerts.length > 0 && !initialLoad) {
        // Hiển thị thông báo cho cảnh báo mới nhất
        showNotification(newAlerts[0]);
      }
      initialLoad = false;
    } else {
      setActiveAlerts([]);
    }
    setLoading(false);
  });

  // Các đoạn code khác...

  return () => {
    unsubscribeActive();
    // Các đoạn code khác...
  };
}, []);
```

Khi phát hiện cảnh báo mới (có `status` là "new"), ứng dụng gọi hàm `showNotification()` để hiển thị thông báo.

### 2.4. Hiển thị thông báo trong ứng dụng

Hàm `showNotification()` hiển thị thông báo bằng cách sử dụng NotificationContext:

```javascript
// Trong AlertsScreen.js hoặc useAlerts.js
const showNotification = (alert) => {
  // Sử dụng NotificationContext để hiển thị banner
  if (notificationContext) {
    notificationContext.showNotificationBanner(
      alert.message,
      alert.type
    );
  }

  // Gửi thông báo đẩy nếu ứng dụng đang ở nền
  if (AppState.currentState !== 'active') {
    sendPushNotification({
      title: 'Cảnh báo: ' + getAlertTypeText(alert.type),
      body: alert.message,
      data: { type: alert.type, id: alert.id }
    });
  }
};
```

### 2.5. Hiển thị banner thông báo

Trong NotificationContext, hàm `showNotificationBanner()` hiển thị banner thông báo:

```javascript
// Trong NotificationContext.js
const showNotificationBanner = (message, type = 'info') => {
  setBannerMessage(message);
  setBannerType(type);
  setShowBanner(true);
};

// Trong phần render
{showBanner && (
  <AlertBanner
    message={bannerMessage}
    type={bannerType}
    onDismiss={hideNotificationBanner}
  />
)}
```

Component `AlertBanner` hiển thị banner thông báo với màu sắc tương ứng với loại cảnh báo.

### 2.6. Tóm tắt luồng hoạt động

1. **ESP32 phát hiện**: Phát hiện điều kiện cảnh báo (ví dụ: nhiệt độ vượt ngưỡng)
2. **ESP32 tạo cảnh báo**: Tạo cảnh báo trên Firebase tại `alerts/active/{alertId}`
3. **Ứng dụng lắng nghe**: Phát hiện cảnh báo mới từ Firebase
4. **Ứng dụng xử lý**: Gọi hàm `showNotification()` để hiển thị thông báo
5. **Hiển thị banner**: Hiển thị banner thông báo trong ứng dụng
6. **Gửi thông báo đẩy**: Nếu ứng dụng đang ở nền, gửi thông báo đẩy
