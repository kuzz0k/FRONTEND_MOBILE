import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useRefreshTokenMutation, useValidateTokenMutation } from "@/services/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from "expo-font";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { Provider } from 'react-redux';
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

      const tokenValidationResult = await validateToken(accessToken)
        .unwrap()
        .catch((error) => {
          return error;
        });

      if (!tokenValidationResult?.status) {
        const refreshResult = await refreshToken({ refreshToken: refreshTokenValue })
          .unwrap()
          .catch((error) => {
            return error;
          });

        if (refreshResult?.data?.tokens) {
          await AsyncStorage.setItem("accessToken", refreshResult.data.tokens.accessToken);
          await AsyncStorage.setItem("refreshToken", refreshResult.data.tokens.refreshToken);
          
          dispatch(login({
            access_token: refreshResult.data.tokens.accessToken,
            refresh_token: refreshResult.data.tokens.refreshToken,
            expires_in: 0, // You might want to get this from the response
            username: storedUsername || "",
            callSign: storedCallSign || "",
          }));
        } else {
          await AsyncStorage.multiRemove(["accessToken", "refreshToken", "username", "callSign"]);
        }
      } else {
        dispatch(login({
          access_token: accessToken,
          refresh_token: refreshTokenValue,
          expires_in: 0, // You might want to get this from the response
          username: storedUsername || "",
          callSign: storedCallSign || "",
        }));
      }
    } catch (error) {
      console.error("Token validation error:", error);
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