import { useState, useEffect } from 'react';
import { ref, onValue, update, get, query, orderByChild, limitToLast } from 'firebase/database';
import { db } from '../config/firebase';
import { scheduleLocalNotification } from '../utils/notificationUtils';

export const useAlerts = () => {
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [alertHistory, setAlertHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lắng nghe cảnh báo đang hoạt động
  useEffect(() => {
    setLoading(true);
    
    try {
      // Đăng ký lắng nghe thay đổi cảnh báo
      const alertsRef = ref(db, 'alerts/active');
      const unsubscribe = onValue(alertsRef, (snapshot) => {
        if (snapshot.exists()) {
          const alertsData = snapshot.val();
          const alertsList = Object.keys(alertsData).map(key => ({
            id: key,
            ...alertsData[key]
          }));
          
          // Sắp xếp theo thời gian giảm dần (mới nhất lên đầu)
          alertsList.sort((a, b) => b.timestamp - a.timestamp);
          
          // Hiển thị thông báo cho cảnh báo mới
          const newAlerts = alertsList.filter(alert => alert.status === 'new');
          newAlerts.forEach(alert => {
            scheduleLocalNotification(
              'Cảnh báo lớp học thông minh',
              alert.message,
              { alertId: alert.id }
            );
            
            // Cập nhật trạng thái cảnh báo thành 'seen'
            update(ref(db, `alerts/active/${alert.id}`), { status: 'seen' });
          });
          
          setActiveAlerts(alertsList);
        } else {
          setActiveAlerts([]);
        }
        setLoading(false);
        setError(null);
      }, (error) => {
        console.error('Error reading alerts data:', error);
        setError('Không thể đọc dữ liệu cảnh báo');
        setLoading(false);
      });
      
      // Hủy đăng ký khi component unmount
      return () => unsubscribe();
    } catch (err) {
      console.error('Error subscribing to alerts data:', err);
      setError('Không thể kết nối với dữ liệu cảnh báo');
      setLoading(false);
      return () => {};
    }
  }, []);

  // Lấy lịch sử cảnh báo
  useEffect(() => {
    setHistoryLoading(true);
    
    try {
      // Lấy 20 cảnh báo gần nhất từ lịch sử
      const historyRef = query(
        ref(db, 'alerts/history'),
        orderByChild('timestamp'),
        limitToLast(20)
      );
      
      const unsubscribe = onValue(historyRef, (snapshot) => {
        if (snapshot.exists()) {
          const historyData = snapshot.val();
          const historyList = Object.keys(historyData).map(key => ({
            id: key,
            ...historyData[key]
          }));
          
          // Sắp xếp theo thời gian giảm dần (mới nhất lên đầu)
          historyList.sort((a, b) => b.timestamp - a.timestamp);
          
          setAlertHistory(historyList);
        } else {
          setAlertHistory([]);
        }
        setHistoryLoading(false);
      }, (error) => {
        console.error('Error reading alert history:', error);
        setHistoryLoading(false);
      });
      
      return () => unsubscribe();
    } catch (err) {
      console.error('Error subscribing to alert history:', err);
      setHistoryLoading(false);
      return () => {};
    }
  }, []);

  // Hàm đánh dấu cảnh báo đã giải quyết
  const resolveAlert = async (alertId) => {
    try {
      // Lấy thông tin cảnh báo
      const alertRef = ref(db, `alerts/active/${alertId}`);
      const snapshot = await get(alertRef);
      
      if (snapshot.exists()) {
        const alertData = snapshot.val();
        
        // Thêm thời gian giải quyết
        alertData.resolvedAt = Date.now();
        
        // Chuyển cảnh báo vào lịch sử
        const historyRef = ref(db, `alerts/history/${alertId}`);
        await update(historyRef, alertData);
        
        // Cập nhật trạng thái cảnh báo thành 'resolved'
        await update(alertRef, {
          status: 'resolved',
          resolvedAt: alertData.resolvedAt
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error resolving alert:', error);
      return false;
    }
  };

  return { 
    activeAlerts, 
    alertHistory, 
    loading, 
    historyLoading, 
    error, 
    resolveAlert 
  };
};
