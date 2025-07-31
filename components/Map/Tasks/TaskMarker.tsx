import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { STATUS, TASK_DOT } from '../../../types/types';

interface TaskMarkerProps {
  task: TASK_DOT;
  onPress?: (task: TASK_DOT) => void;
}

const TaskMarker: React.FC<TaskMarkerProps> = ({ task, onPress }) => {
  const getMarkerColor = (status: STATUS) => {
    switch (status) {
      case STATUS.PENDING:
        return '#FFA726'; // Оранжевый для ожидающих
      case STATUS.ACCEPTED:
        return '#42A5F5'; // Синий для принятых
      case STATUS.COMPLETED:
        return '#66BB6A'; // Зеленый для завершенных
      case STATUS.REJECTED:
        return '#EF5350'; // Красный для отклоненных
      default:
        return '#757575'; // Серый по умолчанию
    }
  };

  const getStatusText = (status: STATUS) => {
    switch (status) {
      case STATUS.PENDING:
        return 'О'; // Ожидает
      case STATUS.ACCEPTED:
        return 'П'; // Принята
      case STATUS.COMPLETED:
        return 'З'; // Завершена
      case STATUS.REJECTED:
        return 'О'; // Отклонена
      default:
        return '?';
    }
  };

  const getStatusDescription = (status: STATUS) => {
    switch (status) {
      case STATUS.PENDING:
        return 'Ожидает выполнения';
      case STATUS.ACCEPTED:
        return 'Принята к выполнению';
      case STATUS.COMPLETED:
        return 'Завершена';
      case STATUS.REJECTED:
        return 'Отклонена';
      default:
        return 'Неизвестный статус';
    }
  };

  return (
    <Marker
      coordinate={{
        latitude: task.coordinates.lat,
        longitude: task.coordinates.lng,
      }}
      onPress={() => onPress?.(task)}
      anchor={{ x: 0.5, y: 0.5 }}
      identifier={`task-${task.id}`}
      title={`Задача: ${getStatusDescription(task.status)}`}
      description={task.message}
    >
      <View style={[styles.markerContainer, { backgroundColor: getMarkerColor(task.status) }]}>
        <Text style={styles.markerText}>{getStatusText(task.status)}</Text>
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default TaskMarker;
