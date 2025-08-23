export const BASE_PATH = "/v1";

export const RouterPaths = {
  USER: `${BASE_PATH}/users`,
  AUTH: `${BASE_PATH}/auth`,
  FARM: `${BASE_PATH}/farm`,
} as const;

export default RouterPaths;
