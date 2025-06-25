import { useAppSelector } from "@/hooks/redux"
import { useFonts } from "expo-font"
import { StatusBar } from "expo-status-bar"
import "react-native-reanimated"
import AuthPage from "./AuthPage"
import MainPage from "./MainPage"

export default function RootLayout() {
  const [loaded] = useFonts({
    AnonymousPro: require("../assets/fonts/AnonymousPro-Regular.ttf"),
    AnonymousProBold: require("../assets/fonts/AnonymousPro-Bold.ttf"),
    AnonymousProItalic: require("../assets/fonts/AnonymousPro-Italic.ttf"),
    AnonymousProBoldItalic: require("../assets/fonts/AnonymousPro-BoldItalic.ttf"),
  })

  const isAuth = useAppSelector((state) => state.user.isAuth)

  if (!loaded) return null

  return (
    <>
      {isAuth ? <MainPage /> : <AuthPage />}
      <StatusBar style="auto" />
    </>
  )
}
