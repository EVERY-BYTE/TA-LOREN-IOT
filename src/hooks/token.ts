export const useToken = () => {
  const TOKEN_KEY = "Sds";

  const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  };

  const setToken = (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  };

  const removeToken = (): void => {
    localStorage.removeItem(TOKEN_KEY);
  };

  return {
    getToken,
    setToken,
    removeToken,
  };
};
