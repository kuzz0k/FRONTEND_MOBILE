import { z } from "zod";

export type RoutePaths =
    | "/login"
    | "/main"

export const ROUTES: Record<
    "LOGIN" | "MAIN",
    RoutePaths
> = {
    LOGIN: "/login",
    MAIN: "/main",
}


export const authSchema = z.object({
    username: z.string().min(1,'Логин должен содержать минимум 1 символ'),
    password: z.string().min(1, 'Пароль должен содержать минимум 1 символ')
});