import axios from "axios";
import { getToken, removeToken } from "../../commons/services/tokenService";
import { apiBaseUrl } from "../api";

const axiosInstance = axios.create({ // Creation de l'instanc e
  baseURL: apiBaseUrl,
  timeout: 15000, // delai de la requete 
  headers: { Accept: "application/json", "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use((config) => { // Envoie du token 
  const token = getToken();
  if (token && config.url !== "/login") config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use( // Interception de la reponse 
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !String(error.config?.url).includes("/login")) {
      removeToken();
      localStorage.removeItem("currentUser");
      window.location.replace("/auth/login");
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
