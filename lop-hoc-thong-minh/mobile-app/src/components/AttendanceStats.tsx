import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Title } from 'react-native-paper';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { AttendanceStats as AttendanceStatsType } from '../types';
import { useTheme } from '../theme/ThemeContext';

interface AttendanceStatsProps {
  stats: AttendanceStatsType;
}

const AttendanceStats: React.FC<AttendanceStatsProps> = ({ stats }) => {
  // Sử dụng theme từ context
  const { theme, isDarkMode } = useTheme();

  const { totalStudents, presentToday, absentToday, lateToday } = stats;

  // Dữ liệu cho biểu đồ tròn
  const chartData = [
    {
      name: 'Có mặt',
      population: presentToday,
      color: theme.success,
      legendFontColor: isDarkMode ? theme.text.secondary : '#7F7F7F',
      legendFontSize: 12
    },
    {
      name: 'Vắng mặt',
      population: absentToday,
      color: theme.error,
      legendFontColor: isDarkMode ? theme.text.secondary : '#7F7F7F',
      legendFontSize: 12
    },
    {
      name: 'Đi trễ',
      population: lateToday,
      color: theme.warning,
      legendFontColor: isDarkMode ? theme.text.secondary : '#7F7F7F',
      legendFontSize: 12
    }
  ];

  // Tính tỷ lệ phần trăm
  const presentPercent = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0;
  const absentPercent = totalStudents > 0 ? Math.round((absentToday / totalStudents) * 100) : 0;
  const latePercent = totalStudents > 0 ? Math.round((lateToday / totalStudents) * 100) : 0;

  return (
    <Card style={{
      marginVertical: 10,
      marginHorizontal: 16,
      elevation: 4,
      backgroundColor: theme.card,
    }}>
      <Card.Content>
        <Title style={{
          fontSize: 18,
          fontWeight: 'bold',
          marginBottom: 15,
          color: theme.text.primary,
        }}>Thống kê điểm danh hôm nay</Title>

        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}>
          <View style={{
            alignItems: 'center',
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: theme.text.primary,
            }}>{totalStudents}</Text>
            <Text style={{
              fontSize: 12,
              color: theme.text.secondary,
            }}>Tổng số</Text>
          </View>

          <View style={{
            alignItems: 'center',
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: theme.success,
            }}>{presentToday}</Text>
            <Text style={{
              fontSize: 12,
              color: theme.text.secondary,
            }}>Có mặt</Text>
          </View>

          <View style={{
            alignItems: 'center',
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: theme.error,
            }}>{absentToday}</Text>
            <Text style={{
              fontSize: 12,
              color: theme.text.secondary,
            }}>Vắng mặt</Text>
          </View>

          <View style={{
            alignItems: 'center',
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: theme.warning,
            }}>{lateToday}</Text>
            <Text style={{
              fontSize: 12,
              color: theme.text.secondary,
            }}>Đi trễ</Text>
          </View>
        </View>

        <View style={{
          marginBottom: 20,
        }}>
          <View style={{
            marginBottom: 10,
          }}>
            <View style={{
              height: 10,
              borderRadius: 5,
              marginBottom: 5,
              backgroundColor: theme.success,
              width: `${presentPercent}%`,
            }} />
            <Text style={{
              fontSize: 12,
              color: theme.text.secondary,
            }}>{presentPercent}% có mặt</Text>
          </View>

          <View style={{
            marginBottom: 10,
          }}>
            <View style={{
              height: 10,
              borderRadius: 5,
              marginBottom: 5,
              backgroundColor: theme.error,
              width: `${absentPercent}%`,
            }} />
            <Text style={{
              fontSize: 12,
              color: theme.text.secondary,
            }}>{absentPercent}% vắng mặt</Text>
          </View>

          <View style={{
            marginBottom: 10,
          }}>
            <View style={{
              height: 10,
              borderRadius: 5,
              marginBottom: 5,
              backgroundColor: theme.warning,
              width: `${latePercent}%`,
            }} />
            <Text style={{
              fontSize: 12,
              color: theme.text.secondary,
            }}>{latePercent}% đi trễ</Text>
          </View>
        </View>

        {totalStudents > 0 && (
          <View style={{
            alignItems: 'center',
          }}>
            <PieChart
              data={chartData}
              width={Dimensions.get('window').width - 60}
              height={180}
              chartConfig={{
                backgroundColor: isDarkMode ? theme.card : '#ffffff',
                backgroundGradientFrom: isDarkMode ? theme.card : '#ffffff',
                backgroundGradientTo: isDarkMode ? theme.card : '#ffffff',
                color: (opacity = 1) => isDarkMode
                  ? `rgba(255, 255, 255, ${opacity})`
                  : `rgba(0, 0, 0, ${opacity})`,
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

// Styles đã được chuyển sang inline styles với theme

export default AttendanceStats;
