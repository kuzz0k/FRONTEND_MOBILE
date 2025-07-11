import React from "react"
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { TASK, TYPE_TO } from "../types/types"

/**
 * TaskModal Component
 * Props:
 * - visible: boolean to control modal visibility
 * - tasks: array of TASK objects
 * - onClose: function to call when closing the modal
 * - onIncrement: function(taskId) called when + is pressed
 * - onDecrement: function(taskId) called when - is pressed
 */

interface TaskModalProps {
  visible: boolean
  tasks: TASK[]
  onClose: () => void
  onIncrement?: (taskId: string) => void
  onDecrement?: (taskId: string) => void
}

const TaskModal = ({
  visible,
  tasks = [],
  onClose,
  onIncrement,
  onDecrement,
}: TaskModalProps) => {
  const renderItem = ({ item }: { item: TASK }) => {
    const { id, message } = item

    // Получаем координаты в зависимости от типа задачи
    let lat: number | undefined
    let lon: number | undefined

    if (item.type === TYPE_TO.TO_POINT) {
      lat = item.coordinates.lat
      lon = item.coordinates.lng
    }

    return (
      <View style={styles.card} key={id}>
        <Text style={styles.header}>ПОЛУЧЕНА ЗАДАЧА</Text>
        {lat != null && lon != null && (
          <View style={styles.coordsRow}>
            <Text style={styles.coordText}>Ш: {lat}</Text>
            <Text style={styles.coordText}>Д: {lon}</Text>
          </View>
        )}
        <Text style={styles.label}>Примечание:</Text>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={[styles.button, styles.decrement]}
            onPress={() => onDecrement?.(id)}
          >
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.increment]}
            onPress={() => onIncrement?.(id)}
          >
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.listWrapper}>
            <FlatList
              data={tasks}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            />
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Закрыть</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  listWrapper: {
    flex: 1,
    maxHeight: "80%",
  },
  container: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    // maxHeight: "60%",
  },

  list: {
    paddingBottom: 16,
  },
  card: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  coordsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  coordText: {
    fontSize: 12,
    color: "#555",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: "#444",
    marginBottom: 8,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  decrement: {
    backgroundColor: "#e57373",
  },
  increment: {
    backgroundColor: "#81c784",
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  closeBtn: {
    alignSelf: "center",
    marginTop: 8,
  },
  closeText: {
    fontSize: 16,
    color: "#1976d2",
  },
})

export default TaskModal
