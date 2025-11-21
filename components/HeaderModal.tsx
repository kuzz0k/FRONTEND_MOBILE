import { useAppSelector } from "@/hooks/redux";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Feather"; // or appropriate icon library
import { STATUS, TYPE_TO } from "../types/types";
import { selectPointTasks } from "@/store/reducers/tasksSlice";

// Full-width header: no need to calculate window width manually

interface HeaderModalProps {
  isVisible: boolean
  coords: { latitude: number; longitude: number }
  timestamp: Date | string
  onReadyToggle: () => void
  isReady: boolean
  notifications: number
  userName: string
  mapType: "hybrid" | "standard" | "satellite"
  onMapTypeChange: (mapType: "hybrid" | "standard" | "satellite") => void
  onMapSettingsToggle?: (isOpen: boolean) => void
  onLogout?: () => void
  isLocationServiceRunning?: boolean
  locationError?: string | null
  onTaskAccept?: (taskId: string) => void
  onTaskReject?: (taskId: string) => void
  onTaskComplete?: (taskId: string) => void
  isTasksLoading?: boolean
  onGpsToggle?: () => void
  isDragMode?: boolean
  onTasksModalToggle?: (isOpen: boolean) => void
  onUserMenuToggle?: (isOpen: boolean) => void
}

export default function HeaderModal({
  isVisible,
  coords,
  timestamp,
  onReadyToggle,
  isReady,
  notifications,
  userName,
  mapType,
  onMapTypeChange,
  onMapSettingsToggle,
  onLogout,
  isLocationServiceRunning = false,
  locationError,
  onTaskAccept,
  onTaskReject,
  onTaskComplete,
  isTasksLoading = false,
  onGpsToggle,
  isDragMode = false,
  onTasksModalToggle,
  onUserMenuToggle,
}: HeaderModalProps) {
  // isMapSettingsOpen removed (подложка отключена)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false)
  const tasks = useAppSelector(selectPointTasks)

  const formatCoords = (lat: number, lon: number) => {
    if (lat === 0 && lon === 0) {
      return "Определение местоположения..."
    }
    return `Ш: ${lat.toFixed(6)}  Д: ${lon.toFixed(6)}`
  }
  const formatTime = (date: Date | string) => {
    const d = new Date(date)
    const pad = (n: number) => (n < 10 ? "0" + n : n)
    return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(
      d.getDate()
    )}.${pad(d.getMonth() + 1)}.${d.getFullYear().toString().slice(-2)}`
  }

  // Логика смены подложки отключена

  const toggleUserMenu = () => {
    const newState = !isUserMenuOpen
    setIsUserMenuOpen(newState)
    onUserMenuToggle?.(newState)
  }

  const toggleTasksModal = () => {
    const newState = !isTasksModalOpen
    setIsTasksModalOpen(newState)
    onTasksModalToggle?.(newState)
  }

  const handleTasksPress = () => {
    toggleTasksModal()
  }

  return isVisible ? (
    <View style={styles.modalContainer} pointerEvents="box-none">
      <View 
        style={styles.container} 
        pointerEvents="auto"
        onStartShouldSetResponder={() => true}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        <View style={styles.coordsBlock}>
          <Text style={styles.coordsText} numberOfLines={1}>
            {formatCoords(coords.latitude, coords.longitude)}
          </Text>
          <Text style={styles.timeText}>{formatTime(timestamp)}</Text>
          {locationError && (
            <Text style={styles.errorText}>{locationError}</Text>
          )}
        </View>
        <View style={styles.statusBlock}>
          <TouchableOpacity
            style={styles.routeButton}
            onPress={handleTasksPress}
          >
            <Text style={styles.routeText}>Задачи</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.gpsButton}
            onPress={onGpsToggle}
            activeOpacity={0.8}
          >
            <View style={[styles.gpsIndicator, { backgroundColor: isDragMode ? '#FF9800' : (isLocationServiceRunning ? '#4CAF50' : '#f44336') }]} />
            <Icon name={isDragMode ? 'move' : (isLocationServiceRunning ? 'navigation' : 'slash')} size={16} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onReadyToggle} style={styles.statusButton}>
            <Icon
              name={isReady ? "check-circle" : "circle"}
              size={20}
              color={isReady ? "#4CAF50" : "#999"}
            />
            <Text style={styles.statusText}>
              {isReady ? "Готов" : "Не готов"}
            </Text>
          </TouchableOpacity>

          {/* Кнопка смены подложки убрана по требованию */}

          <TouchableOpacity style={styles.userButton} onPress={toggleUserMenu}>
            <Icon name="user" size={20} color="#333" />
            <Text style={styles.userText}>{userName}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Выпадающее меню настроек карты */}
  {/* Выпадающее меню смены подложки отключено */}

      {/* Выпадающее меню пользователя */}
      {isUserMenuOpen && (
        <View 
          style={styles.userMenuDropdown}
          onStartShouldSetResponder={() => true}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <TouchableOpacity
            style={styles.userMenuOption}
            onPress={() => {
              onLogout?.()
              setIsUserMenuOpen(false)
              onUserMenuToggle?.(false)
            }}
          >
            <Icon name="log-out" size={16} color="#f44336" />
            <Text style={styles.userMenuText}>Выйти</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tasks Modal */}
      {isTasksModalOpen && (
        <View 
          style={styles.tasksDropdown} 
          pointerEvents="auto"
          onStartShouldSetResponder={() => true}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <View style={styles.tasksContainer}>
            <Text style={styles.tasksTitle}>Задачи</Text>
            <ScrollView 
              style={styles.tasksScrollView}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {isTasksLoading ? (
                <Text style={styles.noTasksText}>Загрузка задач...</Text>
              ) : tasks.length === 0 ? (
                <Text style={styles.noTasksText}>Нет активных задач</Text>
              ) : (
                tasks.map((task) => (
                  <View key={task.id} style={styles.taskItem}>
                    <Text style={styles.taskMessage}>{task.message}</Text>
                    {task.type === TYPE_TO.TO_POINT && "coordinates" in task && (
                      <Text style={styles.taskCoords}>
                        Ш: {task.coordinates.lat.toFixed(6)} Д:{" "}
                        {task.coordinates.lng.toFixed(6)}
                      </Text>
                    )}
                    <View style={styles.taskButtons}>
                      {task.status === STATUS.PENDING && (
                        <>
                          <TouchableOpacity
                            style={[styles.taskButton, styles.rejectButton]}
                            onPress={() => {
                              onTaskReject?.(task.id)
                              setIsTasksModalOpen(false)
                              onTasksModalToggle?.(false)
                            }}
                          >
                            <Text style={styles.taskButtonText}>Отклонить</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.taskButton, styles.acceptButton]}
                            onPress={() => {
                              onTaskAccept?.(task.id)
                              setIsTasksModalOpen(false)
                              onTasksModalToggle?.(false)
                            }}
                          >
                            <Text style={styles.taskButtonText}>Принять</Text>
                          </TouchableOpacity>
                        </>
                      )}
                      {task.status === STATUS.ACCEPTED && (
                        <TouchableOpacity
                          style={[styles.taskButton, styles.completeButton]}
                          onPress={() => {
                            onTaskComplete?.(task.id)
                            setIsTasksModalOpen(false)
                            onTasksModalToggle?.(false)
                          }}
                        >
                          <Text style={styles.taskButtonText}>Завершить</Text>
                        </TouchableOpacity>
                      )}
                      {task.status === STATUS.REJECTED && (
                        <View style={styles.statusContainer}>
                          <Text style={styles.rejectedText}>Отклонено</Text>
                        </View>
                      )}
                      {task.status === STATUS.COMPLETED && (
                        <View style={styles.statusContainer}>
                          <Text style={styles.completedText}>Завершено</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeTasksButton}
              onPress={() => {
                setIsTasksModalOpen(false)
                onTasksModalToggle?.(false)
              }}
            >
              <Text style={styles.closeTasksText}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  ) : null
}

const styles = StyleSheet.create({
  modalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    margin: 12,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
  backgroundColor: "white",
  paddingVertical: 6,
  paddingHorizontal: 10,
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
  elevation: 4,
  width: '100%',
  minHeight: 52,
  },
  coordsBlock: {
    flex: 2,
  },
  coordsText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
  },
  timeText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  routeButton: {
    backgroundColor: "#555",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginHorizontal: 8,
  },
  routeText: {
    color: "#fff",
    fontSize: 12,
  },
  statusBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  statusButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  statusText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#333",
  },
  mapSettingsButton: {
    marginRight: 12,
  },
  notificationButton: {
    marginRight: 12,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#F00",
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  userButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  userText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#333",
  },
  mapSettingsDropdown: {
    position: "absolute",
    top: 60,
    right: 80,
    backgroundColor: "white",
    borderRadius: 8,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    paddingVertical: 8,
    minWidth: 120,
  },
  mapTypeOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  mapTypeOptionSelected: {
    backgroundColor: "#f0f0f0",
  },
  mapTypeText: {
    fontSize: 14,
    color: "#333",
  },
  mapTypeTextSelected: {
    color: "#4CAF50",
    fontWeight: "500",
  },
  coordsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationStatusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  locationStatusText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#333",
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f2f2f2',
    marginRight: 8,
  },
  gpsIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  errorText: {
    fontSize: 10,
    color: "#f44336",
    marginTop: 2,
  },
  userMenuDropdown: {
    position: "absolute",
    top: 60,
    right: 12,
    backgroundColor: "white",
    borderRadius: 8,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    paddingVertical: 8,
    minWidth: 120,
  },
  userMenuOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  userMenuText: {
    fontSize: 14,
    color: "#f44336",
    marginLeft: 8,
  },
  tasksDropdown: {
    position: "absolute",
    top: 60,
    right: 220,
    backgroundColor: "transparent",
    zIndex: 1001,
    width: 200,
  },
  tasksContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    padding: 12,
    maxHeight: 1200,
  },
  tasksScrollView: {
    maxHeight: 1200,
  },
  tasksTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  noTasksText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  taskItem: {
    backgroundColor: "#f9f9f9",
    borderRadius: 6,
    padding: 8,
    marginBottom: 6,
  },
  taskMessage: {
    fontSize: 12,
    color: "#333",
    marginBottom: 3,
  },
  taskCoords: {
    fontSize: 10,
    color: "#666",
    marginBottom: 6,
  },
  taskButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  taskButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  rejectButton: {
    backgroundColor: "#f44336",
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
  },
  completeButton: {
    backgroundColor: "#2196F3",
  },
  statusContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  rejectedText: {
    fontSize: 10,
    color: "#f44336",
    fontWeight: "bold",
  },
  completedText: {
    fontSize: 10,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  taskButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 10,
    fontWeight: "bold",
  },
  closeTasksButton: {
    alignSelf: "center",
    marginTop: 8,
  },
  closeTasksText: {
    fontSize: 12,
    color: "#1976d2",
    fontWeight: "500",
  },
})
