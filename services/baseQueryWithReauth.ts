import { logout, updateTokens } from '@/store/reducers/authSlice';
import { RootState } from '@/store/store';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from './globals';

// Базовый query с установкой Authorization
const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.user.accessToken;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }
});

// Универсальный reauth-обёртка
export const baseQueryWithReauth: BaseQueryFn<FetchArgs | string, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const state = api.getState() as RootState;
    const refreshToken = state.user.refreshToken;
    if (!refreshToken) {
      api.dispatch(logout());
      return result;
    }

    const refreshResult = await rawBaseQuery({
      url: '/api/auth/refresh',
      method: 'POST',
      body: { refresh_token: refreshToken }
    }, api, extraOptions);

    if (refreshResult.data && (refreshResult.data as any).access_token) {
      const data: any = refreshResult.data;
      api.dispatch(updateTokens({
        access_token: data.access_token,
        refresh_token: data.refresh_token || refreshToken
      }));

      // повтор исходного запроса с новым токеном
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

// Хелпер для динамических baseUrl (tasks, globalState) с поддержкой refresh
export function buildDynamicBaseQueryWithReauth(resolveBaseUrl: (state: RootState) => string): BaseQueryFn<FetchArgs | string, unknown, FetchBaseQueryError> {
  const dynamic = fetchBaseQuery({ baseUrl: '/' });

  const wrapped: BaseQueryFn<FetchArgs | string, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
    const state = api.getState() as RootState;
    const baseUrl = resolveBaseUrl(state);
    let modified: FetchArgs;
    if (typeof args === 'string') {
      modified = { url: baseUrl + args } as FetchArgs;
    } else {
      modified = { ...args, url: baseUrl + (args as FetchArgs).url } as FetchArgs;
    }

    // гарантируем токен
    const token = state.user.accessToken;
    if (token) {
      const headersObj: Record<string, string> = {};
      if (modified.headers) {
        if (modified.headers instanceof Headers) {
          modified.headers.forEach((v, k) => { headersObj[k] = v; });
        } else if (Array.isArray(modified.headers)) {
          modified.headers.forEach(([k, v]) => { headersObj[k] = v; });
        } else {
          Object.assign(headersObj, modified.headers as Record<string, string>);
        }
      }
      if (!headersObj['Authorization']) headersObj['Authorization'] = `Bearer ${token}`;
      modified.headers = headersObj;
    }

  let result = await dynamic(modified, api, extraOptions);
    if (result.error && result.error.status === 401) {
      const refreshToken = (api.getState() as RootState).user.refreshToken;
      if (!refreshToken) {
        api.dispatch(logout());
        return result;
      }
      const refreshResp = await dynamic({
        url: baseUrl + '/api/auth/refresh',
        method: 'POST',
        body: { refresh_token: refreshToken }
      }, api, extraOptions) as { data?: any; error?: FetchBaseQueryError };
      if (refreshResp.data && refreshResp.data.access_token) {
        const newAccess = refreshResp.data.access_token as string;
        const newRefresh = (refreshResp.data.refresh_token || refreshToken) as string;
        api.dispatch(updateTokens({
          access_token: newAccess,
          refresh_token: newRefresh
        }));
        const headersObj: Record<string, string> = {};
        if (modified.headers) {
          if (modified.headers instanceof Headers) {
            modified.headers.forEach((v, k) => { headersObj[k] = v; });
          } else if (Array.isArray(modified.headers)) {
            modified.headers.forEach(([k, v]) => { headersObj[k] = v; });
          } else {
            Object.assign(headersObj, modified.headers as Record<string, string>);
          }
        }
        headersObj['Authorization'] = `Bearer ${newAccess}`;
        modified.headers = headersObj;
        result = await dynamic(modified, api, extraOptions);
      } else {
        api.dispatch(logout());
      }
    }
    return result;
  };

  return wrapped;
}
