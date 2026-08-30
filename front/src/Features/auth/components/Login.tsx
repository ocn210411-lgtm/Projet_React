import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../../commons/components/Icon";
import { setToken } from "../../../commons/services/tokenService";
import { apiError } from "../../managementService";
import type { LoginResponse } from "../Interface/login-response";
import { login } from "../Services/AuthService";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response: LoginResponse = await login({ email, password });
      setToken(response.token);
      localStorage.setItem("currentUser", JSON.stringify(response.user));
      navigate(response.must_change_password ? "/auth/change-password" : "/home/dashboard", { replace: true });
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <br /> <br />
      <section className="auth-card" aria-labelledby="login-title">
        <div className="auth-card__heading">
          <h2 id="login-title">Connexion</h2>
          <p>Entrez vos identifiants pour continuer</p>
        </div>

        {error && <div className="alert alert--error" role="alert">{error}</div>}

        <form onSubmit={handleLogin} className="auth-form">
          <label htmlFor="email">Adresse e-mail</label>
          <div className="input-shell">
            <Icon name="mail" />
            <input id="email" type="email" autoComplete="email" placeholder="manager@entreprise.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>

          <div className="label-row">
            <label htmlFor="password">Mot de passe</label>
            <span>Accès sécurisé</span>
          </div>
          <div className="input-shell">
            <Icon name="lock" />
            <input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Votre mot de passe" value={password} onChange={(event) => setPassword(event.target.value)} required />
            <button type="button" className="icon-button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}>
              <Icon name="eye" />
            </button>
          </div>

          <button className="primary-button auth-submit" type="submit" disabled={loading}>
            <span>{loading ? "Connexion…" : "Se connecter à TaskFlow"}</span>
            {!loading && <Icon name="arrow" />}
          </button>
        </form>

        <div className="auth-divider"><span>ESPACE DE GESTION CENTRALISÉ</span></div>
        <p className="auth-note"><span className="status-dot" /> Données protégées par authentification sécurisée</p>
      </section>
    </main>
  );
}

export default Login;
