import { AuthType } from "@/types/types"
import { validateResponse } from "@/utils/validateResponse"


export const login = (url: string, userData: AuthType): Promise<Response> => {
  return fetch(`${url}/login`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    credentials: 'include',
    body: JSON.stringify({
      login: userData.username,
      password: userData.password
    })
  })
  .then(validateResponse)
  .then(res => res.json())
}
