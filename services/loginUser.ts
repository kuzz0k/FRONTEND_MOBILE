import { AuthType, LoginResponse } from '@/types/types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';


export const api = createApi({
  reducerPath: 'apiQuery',
  baseQuery: fetchBaseQuery({
    baseUrl: "http://192.168.31.50:8000/",
  }),
  endpoints: (builder) => ({
    loginUser: builder.mutation<LoginResponse, AuthType>({
      query: (userData) => ({
        url: '/auth/api/login',
        method: 'POST',
        body: {
          username: userData.username,
          password: userData.password,
        },
      }),
    }),
  }),
});

export const { useLoginUserMutation } = api;
