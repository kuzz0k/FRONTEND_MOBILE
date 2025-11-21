import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useRefreshTokenMutation, useValidateTokenMutation } from "@/services/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from "expo-font";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { Provider } from 'react-redux';
import LogOverlay from '../components/LogOverlay';
import { login } from "../store/reducers/authSlice";
import { store } from '../store/store';
import AuthPage from './AuthPage';
import MainPage from './MainPage';

function RootLayoutContent() {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [validateToken] = useValidateTokenMutation();
  const [refreshToken] = useRefreshTokenMutation();
  const isAuth = useAppSelector((state) => state.user.isAuth);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
  }, []);

  const [loaded] = useFonts({
    AnonymousPro: require("../assets/fonts/AnonymousPro-Regular.ttf"),
    AnonymousProBold: require("../assets/fonts/AnonymousPro-Bold.ttf"),
    AnonymousProItalic: require("../assets/fonts/AnonymousPro-Italic.ttf"),
    AnonymousProBoldItalic: require("../assets/fonts/AnonymousPro-BoldItalic.ttf"),
  });

  const checkTokenValidity = useCallback(async () => {
    try {
      const accessToken = await AsyncStorage.getItem("accessToken");
      const refreshTokenValue = await AsyncStorage.getItem("refreshToken");
      const storedUsername = await AsyncStorage.getItem("username");
      const storedCallSign = await AsyncStorage.getItem("callSign");

      if (!accessToken || !refreshTokenValue) {
        setIsLoading(false);
        return;
      }

      try {
        // Пытаемся валидировать текущий токен
        await validateToken().unwrap();
        
        // Если валидация прошла успешно, логиним пользователя
        dispatch(login({
          access_token: accessToken,
          refresh_token: refreshTokenValue,
          expires_in: 0,
          username: storedUsername || "",
          callSign: storedCallSign || "",
        }));
      } catch {
        // Если валидация не прошла, пытаемся обновить токен
        try {
          const refreshResult = await refreshToken({ refreshToken: refreshTokenValue }).unwrap();
          
          if (refreshResult?.access_token && refreshResult?.refresh_token) {
            // Сохраняем новые токены
            await AsyncStorage.setItem("accessToken", refreshResult.access_token);
            await AsyncStorage.setItem("refreshToken", refreshResult.refresh_token);
            
            dispatch(login({
              access_token: refreshResult.access_token,
              refresh_token: refreshResult.refresh_token,
              expires_in: refreshResult.expires_in || 0,
              username: storedUsername || "",
              callSign: storedCallSign || "",
            }));
          } else {
            // Если обновление токена не удалось, очищаем хранилище
            await AsyncStorage.multiRemove(["accessToken", "refreshToken", "username", "callSign"]);
          }
        } catch (refreshError) {
          // Если обновление токена не удалось, очищаем хранилище
          console.error("Token refresh error:", refreshError);
          await AsyncStorage.multiRemove(["accessToken", "refreshToken", "username", "callSign"]);
        }
      }
    } catch (error) {
      console.error("Token validation error:", error);
      // В случае любой другой ошибки, очищаем хранилище
      await AsyncStorage.multiRemove(["accessToken", "refreshToken", "username", "callSign"]);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, validateToken, refreshToken]);

  useEffect(() => {
    checkTokenValidity();
  }, [checkTokenValidity]);

  if (!loaded || isLoading) return null;

  return (
    <>
  {isAuth ? <MainPage /> : <AuthPage />}
  {/* <LogOverlay /> */}
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <RootLayoutContent />
    </Provider>
  );
}