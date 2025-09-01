// Вместо импорта store, используем константы
export const API_BASE_URL = "http://91.204.178.227:8000/";
export const WS_URL = "ws://91.204.178.227:8000/ws/mog";

export const getUrl = () => {
  return WS_URL;
}

export const getLoginUrl = () => {
  return API_BASE_URL;
}
