import { LoginRequest, LoginResponse } from "@/types/types";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "./globals";

export const api = createApi({
  reducerPath: "apiQuery",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL
  }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (userData) => ({
        url: "/api/auth/login",
        method: "POST",
        body: {
          username: userData.username,
          password: userData.password
        }
      })
    }),
    validateToken: builder.mutation<any, string>({
      query: (accessToken) => ({
        url: "/api/auth/test",
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
    }),
    refreshToken: builder.mutation<LoginResponse, { refreshToken: string }>({
      query: ({ refreshToken }) => ({
        url: "/api/auth/refresh",
        method: "POST",
        body: {
          refresh_token: refreshToken
        }
      })
    }),
    logout: builder.mutation<void, string>({
      query: (accessToken) => ({
        url: "/api/auth/logout",
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
    })
  })
});

export const {
  useLoginMutation,
  useValidateTokenMutation,
  useRefreshTokenMutation,
  useLogoutMutation
} = api;
