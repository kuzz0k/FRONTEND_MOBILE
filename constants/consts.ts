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

// Map types and configurations
export type MapType = 'hybrid' | 'standard' | 'satellite';

export const MAP_PROVIDERS = {
    GOOGLE: {
        hybrid: "http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}",
        satellite: "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        standard: "https://{s}.google.com/vt/lyrs=m&hl=ru&x={x}&y={y}&z={z}"
    },
    // Стилизованная схема как в вашем веб-проекте
    STYLED: {
        standard: "https://{s}.google.com/vt/lyrs=m&hl=ru&x={x}&y={y}&z={z}&apistyle=s.e%3Ag%7Cp.c%3A%23ff242f3e%2Cs.e%3Al.t.f%7Cp.c%3A%23ff746855%2Cs.e%3Al.t.s%7Cp.c%3A%23ff242f3e%2Cs.t%3A1%7Cs.e%3Ag%7Cp.v%3Aoff%2Cs.t%3A19%7Cs.e%3Al.t.f%7Cp.c%3A%23ffd59563%2Cs.t%3A2%7Cp.v%3Aoff%2Cs.t%3A2%7Cs.e%3Al.t.f%7Cp.c%3A%23ffd59563%2Cs.t%3A40%7Cs.e%3Ag%7Cp.c%3A%23ff263c3f%2Cs.t%3A40%7Cs.e%3Al.t.f%7Cp.c%3A%23ff6b9a76%2Cs.t%3A3%7Cs.e%3Ag%7Cp.c%3A%23ff38414e%2Cs.t%3A3%7Cs.e%3Ag.s%7Cp.c%3A%23ff212a37%2Cs.t%3A3%7Cs.e%3Al.i%7Cp.v%3Aoff%2Cs.t%3A3%7Cs.e%3Al.t.f%7Cp.c%3A%23ff9ca5b3%2Cs.t%3A49%7Cs.e%3Ag%7Cp.c%3A%23ff746855%2Cs.t%3A49%7Cs.e%3Ag.s%7Cp.c%3A%23ff1f2835%2Cs.t%3A49%7Cs.e%3Al.t.f%7Cp.c%3A%23fff3d19c%2Cs.t%3A4%7Cp.v%3Aoff%2Cs.t%3A4%7Cs.e%3Ag%7Cp.c%3A%23ff2f3948%2Cs.t%3A66%7Cs.e%3Al.t.f%7Cp.c%3A%23ffd59563%2Cs.t%3A6%7Cs.e%3Ag%7Cp.c%3A%23ff17263c%2Cs.t%3A6%7Cs.e%3Al.t.f%7Cp.c%3A%23ff515c6d%2Cs.t%3A6%7Cs.e%3Al.t.s%7Cp.c%3A%23ff17263c"
    }
} as const;

// Настройка URL для тайлов карт (аналог вашего веб-проекта)
export const mapLayers: Record<MapType, string> = {
    hybrid: MAP_PROVIDERS.GOOGLE.hybrid,
    satellite: MAP_PROVIDERS.GOOGLE.satellite,
    standard: MAP_PROVIDERS.STYLED.standard, // Используем стилизованную версию
};

export const MAP_LABELS: Record<MapType, string> = {
    hybrid: 'Гибридная',
    standard: 'Схема', 
    satellite: 'Спутник',
};

export const authSchema = z.object({
    username: z.string().min(1,'Логин должен содержать минимум 1 символ'),
    password: z.string().min(1, 'Пароль должен содержать минимум 1 символ'),
    callSign: z.string()
        .min(1, 'Позывной должен содержать минимум 1 символ')
        .regex(/^[a-zA-Z]+$/, 'Позывной может содержать только латинские буквы и должен быть одним словом')
});