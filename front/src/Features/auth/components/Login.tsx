import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Brand from "../../../commons/components/Brand";
import Icon from "../../../commons/components/Icon";
import { setToken } from "../../../commons/services/tokenService";
import { apiError } from "../../managementService";
import type { LoginResponse } from "../Interface/login-response";
import { login } from "../Services/AuthService";

const highlights = [
  { icon: "folder", title: "Projets pilotés", text: "Chaque projet a un lead developer identifié dès sa création." },
  { icon: "tasks", title: "Tâches cadrées", text: "Délais, priorités et statuts suivis en temps réel par toute l'équipe." },
  { icon: "users", title: "Rôles clairs", text: "Manager, lead developer, développeur : chacun voit ce qui le concerne." },
] as const;

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
    <main className="auth-page auth-page--split">
      <section className="auth-showcase">
        <Brand size={40} />
        <h1>Pilotez les projets et les tâches de votre équipe, du cadrage à la livraison.</h1>
        <p>Une plateforme unique pour le manager, les leads developers et les développeurs.</p>
        <ul className="auth-showcase__list">
          {highlights.map((item) => (
            <li key={item.title}>
              <span className="auth-showcase__icon"><Icon name={item.icon} /></span>
              <div><strong>{item.title}</strong><p>{item.text}</p></div>
            </li>
          ))}
        </ul>
        <div className="auth-showcase__glow" aria-hidden="true" />
      </section>

      <section className="auth-panel">
        <div className="auth-card" aria-labelledby="login-title">
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
              <span>{loading ? "Connexion…" : "Se connecter"}</span>
              {!loading && <Icon name="arrow" />}
            </button>
          </form>

          <div className="auth-divider"><span>ESPACE DE GESTION CENTRALISÉ</span></div>
          <p className="auth-note"><span className="status-dot" /> Données protégées par authentification sécurisée</p>
        </div>
      </section>
    </main>
  );
}

export default Login;
