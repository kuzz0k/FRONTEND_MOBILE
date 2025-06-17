type MessageHandler = (message: MessageEvent) => void;

class WebSocketAuth {
  private WS_URL: string;
  private socket: WebSocket | null = null;
  private reconnectInterval = 5000;
  private shouldReconnect: boolean = true;
  private messageHandler: MessageHandler | null = null;
  private maxReconnectAttempts: number = 5;
  private currentReconnectAttempts: number = 0;
  private isConnecting: boolean = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor(URL: string) {
    this.WS_URL = URL;
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
      this.socket = new WebSocket(`${this.WS_URL}?privet=testtoken123`);

      this.socket.onopen = () => {
        console.log("Соединение с сервером установлено");
        this.currentReconnectAttempts = 0;
        this.isConnecting = false;
        this.clearReconnectTimeout();
      };

      this.socket.onmessage = (event) => {
        console.log("Получено сообщение от сервера:", event.data);
        this.messageHandler?.(event);
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
    console.log(`Попытка переподключения ${this.currentReconnectAttempts}/${this.maxReconnectAttempts}`);

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

export const WebSocketService = new WebSocketAuth('ws://192.168.31.50:8079/ws');