export const ACCESS_TOKEN_COOKIE_NAME = "accessToken";
export const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

export type AuthTokenResponse = {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
};

export const getBrowserCookie = (name: string) => {
  if (typeof document === "undefined") {
    return "";
  }

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));

  if (!cookie) {
    return "";
  }

  return decodeURIComponent(cookie.slice(name.length + 1));
};

export const setBrowserCookie = (
  name: string,
  value: string,
  maxAge: number
) => {
  if (typeof document === "undefined") {
    return;
  }

  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
};

export const deleteBrowserCookie = (name: string) => {
  setBrowserCookie(name, "", 0);
};

export const setAuthCookies = (data: AuthTokenResponse) => {
  setBrowserCookie(
    ACCESS_TOKEN_COOKIE_NAME,
    data.access_token,
    data.expires_in
  );

  if (data.refresh_token) {
    setBrowserCookie(
      REFRESH_TOKEN_COOKIE_NAME,
      data.refresh_token,
      60 * 60 * 24 * 7
    );
  }
};

export const clearAuthCookies = () => {
  deleteBrowserCookie(ACCESS_TOKEN_COOKIE_NAME);
  deleteBrowserCookie(REFRESH_TOKEN_COOKIE_NAME);
};
