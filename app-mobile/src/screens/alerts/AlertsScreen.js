import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAlerts } from '../../hooks/useAlerts';

const AlertsScreen = () => {
  // Sử dụng giá trị mặc định cho theme để tránh lỗi
  const themeContext = useTheme();
  const theme = themeContext?.theme || {
    colors: {
      primary: '#4CAF50',
      background: '#FFFFFF',
      card: '#F5F5F5',
      text: '#212121',
      success: '#4CAF50',
      error: '#F44336',
    }
  };
  const {
    activeAlerts,
    alertHistory,
    loading,
    historyLoading,
    resolveAlert
  } = useAlerts();
  const [activeTab, setActiveTab] = useState('active'); // 'active' hoặc 'history'

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleTimeString() + ' ' + date.toLocaleDateString();
  };

  const getAlertTypeColor = (type) => {
    switch (type) {
      case 'temperature':
      case 'temperature_high':
      case 'temperature_low':
        return '#F44336'; // Đỏ
      case 'humidity':
      case 'humidity_high':
      case 'humidity_low':
        return '#2196F3'; // Xanh dương
      case 'gas':
        return '#FF9800'; // Cam
      case 'flame':
        return '#FF5722'; // Đỏ cam
      default:
        return theme.colors.primary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'new':
        return 'Mới';
      case 'seen':
        return 'Đã xem';
      case 'resolved':
        return 'Đã giải quyết';
      default:
        return status;
    }
  };

  const renderAlertItem = ({ item }) => (
    <View style={[styles.alertCard, { backgroundColor: theme.colors.card }]}>
      <View style={[styles.alertTypeIndicator, { backgroundColor: getAlertTypeColor(item.type) }]} />
      <View style={styles.alertContent}>
        <Text style={[styles.alertMessage, { color: theme.colors.text }]}>
          {item.message}
        </Text>
        <Text style={[styles.alertTime, { color: theme.colors.text }]}>
          {formatTime(item.timestamp)}
        </Text>
        {item.resolvedAt && (
          <Text style={[styles.alertTime, { color: theme.colors.text }]}>
            Giải quyết: {formatTime(item.resolvedAt)}
          </Text>
        )}
        <View style={styles.alertFooter}>
          <Text style={[styles.alertStatus, { color: theme.colors.text }]}>
            Trạng thái: {getStatusText(item.status)}
          </Text>
          {activeTab === 'active' && item.status !== 'resolved' && (
            <TouchableOpacity
              style={[styles.resolveButton, { backgroundColor: theme.colors.success }]}
              onPress={() => resolveAlert(item.id)}
            >
              <Text style={styles.resolveButtonText}>Đã giải quyết</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: theme.colors.primary }]}>
          Cảnh báo
        </Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'active' && { backgroundColor: theme.colors.primary }
          ]}
          onPress={() => setActiveTab('active')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'active' ? 'white' : theme.colors.text }
            ]}
          >
            Đang hoạt động
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'history' && { backgroundColor: theme.colors.primary }
          ]}
          onPress={() => setActiveTab('history')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'history' ? 'white' : theme.colors.text }
            ]}
          >
            Lịch sử
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'active' ? (
        loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>Đang tải dữ liệu...</Text>
          </View>
        ) : activeAlerts.length > 0 ? (
          <FlatList
            data={activeAlerts}
            renderItem={renderAlertItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.text }]}>
              Không có cảnh báo đang hoạt động
            </Text>
          </View>
        )
      ) : (
        historyLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>Đang tải dữ liệu...</Text>
          </View>
        ) : alertHistory.length > 0 ? (
          <FlatList
            data={alertHistory}
            renderItem={renderAlertItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.text }]}>
              Không có lịch sử cảnh báo
            </Text>
          </View>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 8,
    marginBottom: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tabText: {
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
  },
  listContainer: {
    padding: 8,
  },
  alertCard: {
    flexDirection: 'row',
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  alertTypeIndicator: {
    width: 8,
  },
  alertContent: {
    flex: 1,
    padding: 16,
  },
  alertMessage: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 14,
    marginBottom: 8,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertStatus: {
    fontSize: 14,
  },
  resolveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  resolveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AlertsScreen;
