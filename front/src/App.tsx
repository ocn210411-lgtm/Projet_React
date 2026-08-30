import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import ProtectedRoute from "./commons/components/ProtectedRoute";
import { getToken } from "./commons/services/tokenService";
import ChangePassword from "./Features/auth/components/change_passowrd";
import Login from "./Features/auth/components/Login";
import Dashboard from "./Features/auth/home/dashboard";

function StartRoute() {
  return <Navigate to={getToken() ? "/home/dashboard" : "/auth/login"} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StartRoute />} />
        <Route path="/auth/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/auth/change-password" element={<ChangePassword />} />
          <Route path="/home/dashboard" element={<Dashboard />} />
          <Route path="/users/*" element={<Navigate to="/home/dashboard?view=team" replace />} />
        </Route>

        <Route path="*" element={<StartRoute />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;
