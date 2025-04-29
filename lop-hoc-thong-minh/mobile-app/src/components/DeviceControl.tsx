import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { Card, Title } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Devices } from '../types';
import { useTheme } from '../theme/ThemeContext';

interface DeviceControlProps {
  devices: Devices;
  onDoorControl: (action: 'open' | 'closed') => Promise<boolean>;
  onLightControl: (action: 'on' | 'off') => Promise<boolean>;
  onAutoModeToggle: (device: 'door' | 'light', autoMode: boolean) => Promise<boolean>;
}

const DeviceControl: React.FC<DeviceControlProps> = ({
  devices,
  onDoorControl,
  onLightControl,
  onAutoModeToggle,
}) => {
  // Sử dụng theme từ context
  const { theme } = useTheme();

  const { door, light } = devices;

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
        }}>Điều khiển thiết bị</Title>

        {/* Điều khiển cửa */}
        <View style={{
          marginBottom: 20,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
          }}>
            <MaterialCommunityIcons
              name="door"
              size={24}
              color={theme.door}
            />
            <Text style={{
              fontSize: 16,
              fontWeight: 'bold',
              marginLeft: 10,
              color: theme.text.primary,
            }}>Cửa</Text>
            <View style={{
              flex: 1,
              alignItems: 'flex-end',
            }}>
              <Text style={{
                fontWeight: 'bold',
                color: door.status === 'open' ? theme.success : theme.error,
              }}>
                {door.status === 'open' ? 'Đang mở' : 'Đang đóng'}
              </Text>
            </View>
          </View>

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}>
            <Text style={{
              fontSize: 14,
              color: theme.text.primary,
            }}>Chế độ tự động:</Text>
            <Switch
              value={door.auto}
              onValueChange={(value) => onAutoModeToggle('door', value)}
              trackColor={{ false: theme.switch.track.inactive, true: theme.switch.track.active }}
              thumbColor={door.auto ? theme.switch.thumb.active : theme.switch.thumb.inactive}
            />
          </View>

          {!door.auto && (
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 5,
                  alignItems: 'center',
                  marginHorizontal: 5,
                  backgroundColor: theme.success,
                  opacity: door.status === 'open' ? 0.5 : 1,
                }}
                onPress={() => onDoorControl('open')}
                disabled={door.status === 'open'}
              >
                <Text style={{
                  color: 'white',
                  fontWeight: 'bold',
                }}>Mở cửa</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 5,
                  alignItems: 'center',
                  marginHorizontal: 5,
                  backgroundColor: theme.error,
                  opacity: door.status === 'closed' ? 0.5 : 1,
                }}
                onPress={() => onDoorControl('closed')}
                disabled={door.status === 'closed'}
              >
                <Text style={{
                  color: 'white',
                  fontWeight: 'bold',
                }}>Đóng cửa</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Điều khiển đèn */}
        <View style={{
          marginBottom: 20,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
          }}>
            <MaterialCommunityIcons
              name="lightbulb"
              size={24}
              color={light.status === 'on' ? theme.light.on : theme.light.off}
            />
            <Text style={{
              fontSize: 16,
              fontWeight: 'bold',
              marginLeft: 10,
              color: theme.text.primary,
            }}>Đèn</Text>
            <View style={{
              flex: 1,
              alignItems: 'flex-end',
            }}>
              <Text style={{
                fontWeight: 'bold',
                color: light.status === 'on' ? theme.success : theme.error,
              }}>
                {light.status === 'on' ? 'Đang bật' : 'Đang tắt'}
              </Text>
            </View>
          </View>

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}>
            <Text style={{
              fontSize: 14,
              color: theme.text.primary,
            }}>Chế độ tự động:</Text>
            <Switch
              value={light.auto}
              onValueChange={(value) => onAutoModeToggle('light', value)}
              trackColor={{ false: theme.switch.track.inactive, true: theme.switch.track.active }}
              thumbColor={light.auto ? theme.switch.thumb.active : theme.switch.thumb.inactive}
            />
          </View>

          {!light.auto && (
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 5,
                  alignItems: 'center',
                  marginHorizontal: 5,
                  backgroundColor: theme.success,
                  opacity: light.status === 'on' ? 0.5 : 1,
                }}
                onPress={() => onLightControl('on')}
                disabled={light.status === 'on'}
              >
                <Text style={{
                  color: 'white',
                  fontWeight: 'bold',
                }}>Bật đèn</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 5,
                  alignItems: 'center',
                  marginHorizontal: 5,
                  backgroundColor: theme.error,
                  opacity: light.status === 'off' ? 0.5 : 1,
                }}
                onPress={() => onLightControl('off')}
                disabled={light.status === 'off'}
              >
                <Text style={{
                  color: 'white',
                  fontWeight: 'bold',
                }}>Tắt đèn</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

// Styles đã được chuyển sang inline styles với theme

export default DeviceControl;
