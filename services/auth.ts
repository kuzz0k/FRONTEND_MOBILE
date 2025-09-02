import { LoginRequest, LoginResponse } from "@/types/types";
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

export const api = createApi({
  reducerPath: "apiQuery",
  baseQuery: baseQueryWithReauth,
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
    validateToken: builder.mutation<any, void>({
      query: () => ({
        url: "/api/auth/test",
        method: "GET",
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
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/api/auth/logout",
        method: "POST",
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
