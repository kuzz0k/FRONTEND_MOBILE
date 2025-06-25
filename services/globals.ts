import { store } from "@/store/store";

export const getUrl = () => {
  const state = store.getState();

  return state.api.wsUrl;
}

export const getLoginUrl = () => {
  const state = store.getState();

  return state.api.loginUrl;
}
