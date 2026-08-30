const TOKEN_KEY = "token";
const getToken = (): string | null => localStorage.getItem(TOKEN_KEY); // Recuperation du token 

const setToken = (token: string): void => // Stockage du token 
    localStorage.setItem(TOKEN_KEY, token);
const removeToken = (): void => localStorage.removeItem(TOKEN_KEY); // Suppression du token 

export { getToken, setToken, removeToken }