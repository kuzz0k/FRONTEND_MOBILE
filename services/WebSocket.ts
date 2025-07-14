import { ALL_TOPICS, TopicCallback } from "@/types/types";
import { getUrl } from "./globals";

type MessageHandler = (message: MessageEvent) => void;

class WebSocketAuth {
  private WS_URL: string = getUrl();
  private socket: WebSocket | null = null;
  private reconnectInterval = 7000;
  private shouldReconnect: boolean = true;
  private messageHandler: MessageHandler | null = null;
  private maxReconnectAttempts: number = 5;
  private currentReconnectAttempts: number = 0;
  private isConnecting: boolean = false;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private accessToken: string | null = null;
  private subscribers: Record<string, TopicCallback[]> = {};

  subscribe(topic: ALL_TOPICS, callback: TopicCallback) {
    if (!this.subscribers[topic]) {
      this.subscribers[topic] = [];
    }
    this.subscribers[topic].push(callback);
  }

  unsubscribe(topic: ALL_TOPICS, callback: TopicCallback) {
    this.subscribers[topic] = this.subscribers[topic]?.filter(cb => cb !== callback) || [];
  }

  private dispatchToSubscribers(topic: string, payload: any) {
    const callbacks = this.subscribers[topic];
    if (callbacks) {
      callbacks.forEach(cb => cb(payload));
    }
  }
  updateToken(token: string) {
    this.accessToken = token;
  }

  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  connect() {
    if (this.isConnecting || this.isConnected) {
      console.warn("WebSocket уже подключен или подключается");
      return;
    }

    this.isConnecting = true;
    this.cleanupSocket();

    try {
      const encodedToken = encodeURIComponent(`Bearer ${this.accessToken}`);
      this.socket = new WebSocket(`${this.WS_URL}?token=${encodedToken}`);

      this.socket.onopen = () => {
        console.log("Соединение с сервером установлено");
        this.currentReconnectAttempts = 0;
        this.isConnecting = false;
        this.clearReconnectTimeout();
      };

      this.socket.onmessage = (event) => {
        console.log("Получено сообщение от сервера:", event.data);
        this.messageHandler?.(event);
        
        // Парсим сообщение и отправляем в подписчики
        try {
          const message = JSON.parse(event.data);
          if (message.topic && message.payload) {
            this.dispatchToSubscribers(message.topic, message.payload);
          }
        } catch (error) {
          console.error("Ошибка при парсинге WebSocket сообщения:", error);
        }
      };

      this.socket.onclose = (event: CloseEvent) => {
        console.warn(`Соединение закрыто: [${event.code}] ${event.reason}`);
        this.handleDisconnection();
      };

      this.socket.onerror = (event: Event) => {
        console.error("Ошибка WebSocket:", event);
        this.handleDisconnection();
      };
    } catch (error) {
      console.error("Ошибка при создании WebSocket:", error);
      this.handleDisconnection();
    }
  }

  private handleDisconnection() {
    this.isConnecting = false;
    this.cleanupSocket();
    
    if (this.shouldReconnect) {
      this.attemptReconnect();
    }
  }

  private cleanupSocket() {
    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onclose = null;
      this.socket.onerror = null;
      
      if (this.socket.readyState === WebSocket.OPEN || 
          this.socket.readyState === WebSocket.CONNECTING) {
        this.socket.close();
      }
      
      this.socket = null;
    }
  }

  private clearReconnectTimeout() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private attemptReconnect() {
    this.clearReconnectTimeout();

    if (this.currentReconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Превышено максимальное количество попыток переподключения");
      return;
    }

    this.currentReconnectAttempts++;
    // console.log(`Попытка переподключения ${this.currentReconnectAttempts}/${this.maxReconnectAttempts}`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }

  disconnect() {
    this.shouldReconnect = false;
    this.isConnecting = false;
    this.clearReconnectTimeout();
    this.cleanupSocket();
    console.log("Соединение отключено вручную");
  }

  sendMessage(message: string) {
    if (this.isConnected) {
      this.socket?.send(message);
    } else {
      console.warn("Невозможно отправить сообщение: сокет не подключён");
      // Можно добавить очередь сообщений для отправки после подключения
    }
  }

  onMessage(handler: MessageHandler) {
    this.messageHandler = handler;
  }
}

export const WebSocketService = new WebSocketAuth();