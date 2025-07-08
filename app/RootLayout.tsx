import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import { useRefreshTokenMutation, useValidateTokenMutation } from "@/services/auth"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useFonts } from "expo-font"
import { StatusBar } from "expo-status-bar"
import { useCallback, useEffect, useState } from "react"
import "react-native-reanimated"
import { userSlice } from "../store/reducers/authSlice"
import AuthPage from "./AuthPage"
import MainPage from "./MainPage"

import * as ScreenOrientation from "expo-screen-orientation"

export default function RootLayout() {
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState(true)
  const [validateToken] = useValidateTokenMutation()
  const [refreshToken] = useRefreshTokenMutation()

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
  }, []);

  const [loaded] = useFonts({
    AnonymousPro: require("../assets/fonts/AnonymousPro-Regular.ttf"),
    AnonymousProBold: require("../assets/fonts/AnonymousPro-Bold.ttf"),
    AnonymousProItalic: require("../assets/fonts/AnonymousPro-Italic.ttf"),
    AnonymousProBoldItalic: require("../assets/fonts/AnonymousPro-BoldItalic.ttf"),
  })

  const isAuth = useAppSelector((state) => state.user.isAuth)

  const checkTokenValidity = useCallback(async () => {
    try {
      const accessToken = await AsyncStorage.getItem("accessToken")
      const refreshTokenValue = await AsyncStorage.getItem("refreshToken")
      const storedUsername = await AsyncStorage.getItem("username")
      const storedCallSign = await AsyncStorage.getItem("callSign")

      if (!accessToken || !refreshTokenValue) {
        return
      }

      const tokenValidationResult = await validateToken(accessToken)
        .unwrap()
        .catch((error) => {
          return error
        })

      if (!tokenValidationResult?.status) {
        dispatch(
          userSlice.actions.login({
            access_token: accessToken,
            refresh_token: refreshTokenValue,
            expires_in: 0,
            username: storedUsername || "mobile_user", // Берем из AsyncStorage
            callSign: storedCallSign || "мобильный", // Значение по умолчанию если нет
          })
        )
        return
      }

      if (tokenValidationResult?.status === 401) {
        const refreshResult = await refreshToken({
          refreshToken: refreshTokenValue,
        })
          .unwrap()
          .catch((_) => {
            return null
          })

        if (refreshResult) {
          dispatch(
            userSlice.actions.login({
              access_token: refreshResult.access_token,
              refresh_token: refreshResult.refresh_token,
              expires_in: refreshResult.expires_in,
              username: storedUsername || "mobile_user",
              callSign: storedCallSign || "мобильный",
            })
          )
          return
        } else {
        }
      }
    } catch {
      // Игнорируем ошибки валидации токена
    } finally {
      setIsLoading(false)
    }
  }, [dispatch, validateToken, refreshToken])

  useEffect(() => {
    checkTokenValidity()
  }, [checkTokenValidity])

  if (!loaded || isLoading) return null

  return (
    <>
      {isAuth ? <MainPage /> : <AuthPage />}
      <StatusBar style="auto" />
    </>
  )
}
