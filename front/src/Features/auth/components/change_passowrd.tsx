import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../../commons/components/Icon";
import { apiError } from "../../managementService";
import { changePassword } from "../Services/AuthService";

function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); 
    if (password !== confirmation) return setError("Les nouveaux mots de passe ne correspondent pas.");
    setLoading(true);
    setError(null);
    try {
      await changePassword({ old_password: oldPassword, password, password_confirmation: confirmation });
      navigate("/home/dashboard", { replace: true });
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page auth-page--compact">
      <section className="auth-card">
        <div className="auth-icon"><Icon name="lock" /></div>
        <div className="auth-card__heading">
          <h1>Nouveau mot de passe</h1>
          <p>Pour sécuriser votre compte, choisissez un mot de passe personnel.</p>
        </div>
        {error && <div className="alert alert--error">{error}</div>}
        <form className="auth-form" onSubmit={submit}>
          <label htmlFor="old-password">Mot de passe temporaire</label>
          <input id="old-password" className="field" type="password" value={oldPassword} onChange={(event) => setOldPassword(event.target.value)} required />
          <label htmlFor="new-password">Nouveau mot de passe</label>
          <input id="new-password" className="field" type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
          <label htmlFor="confirmation">Confirmer le mot de passe</label>
          <input id="confirmation" className="field" type="password" minLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required />
          <button className="primary-button auth-submit" type="submit" disabled={loading}>{loading ? "Enregistrement…" : "Enregistrer et continuer"}</button>
        </form>
      </section>
    </main>
  );
}

export default ChangePassword;
