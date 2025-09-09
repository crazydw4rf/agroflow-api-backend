export const BASE_PATH = "/v1";

export const RouterPaths = {
  USER: `${BASE_PATH}/users`,
  AUTH: `${BASE_PATH}/auth`,
  PROJECT: `${BASE_PATH}/project`,
} as const;

export default RouterPaths;
