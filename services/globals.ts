// Вместо импорта store, используем константы
export const API_BASE_URL = "http://192.168.31.50:8000/";
export const WS_URL = "ws://192.168.31.50:8000/livestream/mog";

export const getUrl = () => {
  return WS_URL;
}

export const getLoginUrl = () => {
  return API_BASE_URL;
}
