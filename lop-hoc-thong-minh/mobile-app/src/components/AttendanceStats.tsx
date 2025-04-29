import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Title } from 'react-native-paper';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { AttendanceStats as AttendanceStatsType } from '../types';

interface AttendanceStatsProps {
  stats: AttendanceStatsType;
}

const AttendanceStats: React.FC<AttendanceStatsProps> = ({ stats }) => {
  const { totalStudents, presentToday, absentToday, lateToday } = stats;
  
  // Dữ liệu cho biểu đồ tròn
  const chartData = [
    {
      name: 'Có mặt',
      population: presentToday,
      color: '#4CAF50',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    },
    {
      name: 'Vắng mặt',
      population: absentToday,
      color: '#F44336',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    },
    {
      name: 'Đi trễ',
      population: lateToday,
      color: '#FF9800',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    }
  ];
  
  // Tính tỷ lệ phần trăm
  const presentPercent = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0;
  const absentPercent = totalStudents > 0 ? Math.round((absentToday / totalStudents) * 100) : 0;
  const latePercent = totalStudents > 0 ? Math.round((lateToday / totalStudents) * 100) : 0;
  
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.title}>Thống kê điểm danh hôm nay</Title>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalStudents}</Text>
            <Text style={styles.statLabel}>Tổng số</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#4CAF50' }]}>{presentToday}</Text>
            <Text style={styles.statLabel}>Có mặt</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#F44336' }]}>{absentToday}</Text>
            <Text style={styles.statLabel}>Vắng mặt</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#FF9800' }]}>{lateToday}</Text>
            <Text style={styles.statLabel}>Đi trễ</Text>
          </View>
        </View>
        
        <View style={styles.percentContainer}>
          <View style={styles.percentItem}>
            <View style={[styles.percentBar, { backgroundColor: '#4CAF50', width: `${presentPercent}%` }]} />
            <Text style={styles.percentText}>{presentPercent}% có mặt</Text>
          </View>
          
          <View style={styles.percentItem}>
            <View style={[styles.percentBar, { backgroundColor: '#F44336', width: `${absentPercent}%` }]} />
            <Text style={styles.percentText}>{absentPercent}% vắng mặt</Text>
          </View>
          
          <View style={styles.percentItem}>
            <View style={[styles.percentBar, { backgroundColor: '#FF9800', width: `${latePercent}%` }]} />
            <Text style={styles.percentText}>{latePercent}% đi trễ</Text>
          </View>
        </View>
        
        {totalStudents > 0 && (
          <View style={styles.chartContainer}>
            <PieChart
              data={chartData}
              width={Dimensions.get('window').width - 60}
              height={180}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 10,
    marginHorizontal: 16,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
  },
  percentContainer: {
    marginBottom: 20,
  },
  percentItem: {
    marginBottom: 10,
  },
  percentBar: {
    height: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  percentText: {
    fontSize: 12,
    color: '#757575',
  },
  chartContainer: {
    alignItems: 'center',
  },
});

export default AttendanceStats;
