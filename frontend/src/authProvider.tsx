import { AuthProvider } from "@pankod/refine-core";
import * as constants from "./constants";
import jwt_decode from "jwt-decode";


export const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    // const authReq = new Request(`${constants.API_ROOT}/auth/login`, {
    //   method: 'POST',
    //   body: JSON.stringify({ 'email': username, password }),
    //   headers: new Headers({ 'Content-Type': 'application/json' })
    // });

    // const accessToken = await fetchTokensAndStore(authReq);

    const profleReq = new Request(`${constants.API_ROOT}/users?email=${username}`, {
      method: 'GET',
      // headers: new Headers({ 'Authorization': `Bearer ${accessToken}` })
    });

    const profileRes = await fetch(profleReq);

    if (profileRes.status < 200 || profileRes.status >= 300) {
      throw new Error("Error: fetching profile!");
    }
    const profileData = await profileRes.json();
    if (!profileData && !Array.isArray(profileData)) {
      throw new Error("Error: parsing profile!");
    }

    if (profileData.length === 0 || password !== 'issart') {
      throw new Error("Error: incorrect username or password!");
    }
    localStorage.setItem(constants.PROFILE, JSON.stringify(profileData[0]));
  },
  logout: () => {
    // localStorage.removeItem(constants.ACCESS_TOKEN_KEY);
    // localStorage.removeItem(constants.REFRESH_TOKEN_KEY);
    localStorage.removeItem(constants.PROFILE);
    // localStorage.removeItem(constants.ACCESS_TOKEN_EXPIRES_AT);
    // localStorage.removeItem(constants.REFRESH_TOKEN_EXPIRES_AT);
    return Promise.resolve();
  },
  checkError: () => Promise.resolve(),
  checkAuth: async () => {
    // const accessTokenExpiresAt = localStorage.getItem(constants.ACCESS_TOKEN_EXPIRES_AT);
    // const refreshToken = localStorage.getItem(constants.REFRESH_TOKEN_KEY);
    // const refreshTokenExpiresAt = localStorage.getItem(constants.REFRESH_TOKEN_EXPIRES_AT);
    // const isAccessTokenActive = accessTokenExpiresAt && (new Date().getTime() < +accessTokenExpiresAt);
    // const isRefreshTokenActive = refreshTokenExpiresAt && (new Date().getTime() < +refreshTokenExpiresAt);

    // if (isAccessTokenActive) {
    //   return Promise.resolve();
    // }
    // if (refreshToken && isRefreshTokenActive) {
    //   const authReq = new Request(`${constants.API_ROOT}/auth/refresh`, {
    //     method: 'GET',
    //     headers: new Headers({ 'Authorization': `Bearer ${refreshToken}` })
    //   });
    //   const accessToken = await fetchTokensAndStore(authReq) as any;
    //   return (accessToken) ? Promise.resolve() : Promise.reject();
    // }
    // return Promise.reject();

    const profile = localStorage.getItem(constants.PROFILE);
    if (profile) {
      return Promise.resolve();
    }
    return Promise.reject();
  },
  getPermissions: () => {
    const profile = localStorage.getItem(constants.PROFILE);
    if (profile) {
      const data = JSON.parse(profile);
      return Promise.resolve(data.role);
    }
    return Promise.reject();
  },
  getUserIdentity: async () => {
    const profile = localStorage.getItem(constants.PROFILE);
    if (profile) {
      const data = JSON.parse(profile);
      const user = {
        id: data.id,
        name: `${data.firstName} ${data.lastName}`,
        avatar: "https://i.pravatar.cc/150?u=refine",
      };
      return Promise.resolve(user);
    }
    return Promise.reject();
  },
};

// const getDecodedJwtToken: any = (token: string) => {
//   try {
//     return jwt_decode(token);
//   } catch (Error) {
//     return null;
//   }
// }

// const fetchTokensAndStore = async (authReq: Request): Promise<string> => {
//   const authRes = await fetch(authReq);
//   if (authRes.status < 200 || authRes.status >= 300) {
//     throw new Error(authRes.statusText);
//   }
//   const data = await authRes.json();
//   if (!data) {
//     throw new Error("Error!");
//   }
//   const accessToken = data.accessToken;
//   const refreshToken = data.refreshToken;

//   localStorage.setItem(constants.ACCESS_TOKEN_KEY, data.accessToken);
//   if (refreshToken) {
//     localStorage.setItem(constants.REFRESH_TOKEN_KEY, data.refreshToken);
//   }

//   const accessTokenExpiresAt = getDecodedJwtToken(accessToken)?.exp;
//   const refreshTokenExpiresAt = getDecodedJwtToken(refreshToken)?.exp;

//   if (accessTokenExpiresAt) {
//     localStorage.setItem(constants.ACCESS_TOKEN_EXPIRES_AT, String((+accessTokenExpiresAt - 60) * 1000));
//   } else {
//     localStorage.removeItem(constants.ACCESS_TOKEN_KEY);
//   }
//   if (refreshTokenExpiresAt) {
//     localStorage.setItem(constants.REFRESH_TOKEN_EXPIRES_AT, String((+refreshTokenExpiresAt - 60) * 1000));
//   }

//   return accessToken;
// }
