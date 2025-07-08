import AuthForm from "@/components/ui/AuthForm"
import { authSchema } from "@/constants/consts"
import { useAppDispatch } from "@/hooks/redux"
import { useLoginMutation } from "@/services/auth"
import { userSlice } from "@/store/reducers/authSlice"
import { AuthType, LoginRequest } from "@/types/types"
import { zodResolver } from "@hookform/resolvers/zod"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native"

const AuthPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const [login] = useLoginMutation()
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthType>({
    resolver: zodResolver(authSchema),
  })

  const onSubmit = async (formData: AuthType) => {
    try {
      // Отправляем на сервер только username и password
      const loginRequest: LoginRequest = {
        username: formData.username,
        password: formData.password
      };
      const result = await login(loginRequest).unwrap();
      setIsLoading(true);

      // Сохраняем в Redux все данные включая callSign
      dispatch(userSlice.actions.login({
        ...result, 
        username: formData.username,
        callSign: formData.callSign // Обязательное поле, всегда есть
      }));
    } catch (err) {
      console.error("Ошибка логина:", err);
      setIsLoading(false);
      //@ts-ignore
      toast.error(`Ошибка авторизации. ${err.data.ошибка}`);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <AuthForm
        control={control}
        errors={errors}
        onSubmit={handleSubmit(onSubmit)}
        isLoading={isLoading}
      />
    </KeyboardAvoidingView>
  )
}

export default AuthPage

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "grey",
  },
})
