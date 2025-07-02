import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { WebSocketService } from '../services/WebSocket';

interface WebSocketMessage {
  timestamp: string;
  message: string;
}

export default function WebSocketDebugPanel() {
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Подписываемся на сообщения WebSocket
    const handleMessage = (event: MessageEvent) => {
      const newMessage: WebSocketMessage = {
        timestamp: new Date().toLocaleTimeString(),
        message: event.data,
      };
      
      setMessages(prev => [...prev.slice(-9), newMessage]); // Храним только последние 10 сообщений
    };

    WebSocketService.onMessage(handleMessage);

    // Проверяем статус подключения каждую секунду
    const intervalId = setInterval(() => {
      setIsConnected(WebSocketService.isConnected);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WebSocket отладка</Text>
      
      <View style={styles.statusRow}>
        <View style={[
          styles.indicator,
          { backgroundColor: isConnected ? '#4CAF50' : '#f44336' }
        ]} />
        <Text style={styles.statusText}>
          {isConnected ? 'Подключен' : 'Отключен'}
        </Text>
      </View>

      <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
        {messages.length === 0 ? (
          <Text style={styles.noMessagesText}>Сообщений пока нет</Text>
        ) : (
          messages.map((msg, index) => (
            <View key={index} style={styles.messageItem}>
              <Text style={styles.timestampText}>{msg.timestamp}</Text>
              <Text style={styles.messageText}>{msg.message}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 20,
    width: 300,
    height: 400,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 10,
    padding: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#fff',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  messagesContainer: {
    flex: 1,
  },
  noMessagesText: {
    color: '#ccc',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
  messageItem: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  timestampText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'monospace',
  },
});
