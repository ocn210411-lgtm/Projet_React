import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "../services/tokenService";

function ProtectedRoute() { // C'est une fonction qui permet de protéger les routes
  // Si le token n'est pas trouvé, on redirige vers la page de connexion
  return getToken() ? <Outlet /> : <Navigate to="/auth/login" replace />; 
}

export default ProtectedRoute;
