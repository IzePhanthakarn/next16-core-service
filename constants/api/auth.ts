const AUTH_BASE_PATH = "/auth";

const AUTH_API = {
  ROOT: AUTH_BASE_PATH,
  REGISTER: `${AUTH_BASE_PATH}/register`,
  LOGIN: `${AUTH_BASE_PATH}/login`,
  LOGOUT: `${AUTH_BASE_PATH}/logout`,
} as const;

export default AUTH_API;
