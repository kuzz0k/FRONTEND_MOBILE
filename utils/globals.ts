// Store reference will be set by the store module to avoid circular dependency
let storeRef: any = null;

export function setStoreRef(store: any) {
  storeRef = store;
}

export function getToken(): string | null {
  if (!storeRef) {
    return null;
  }
  const state = storeRef.getState();
  return state.user.accessToken;
}