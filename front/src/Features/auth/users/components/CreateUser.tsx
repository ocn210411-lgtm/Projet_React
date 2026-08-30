import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUser } from "../service/userService";
import { getApiErrorMessage } from "../../../utils/tools";

function CreateUser() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<'lead_developer'|'developer'>('developer');
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null); 
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name || !email || !password) return setError('Veuillez renseigner le nom, l\'email et le mot de passe');

    try {
      await createUser({ name, email, role, password });
      setSuccess('Utilisateur créé avec succès');
      navigate('/home/dashboard', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : getApiErrorMessage(err));
    }
  };

  return (
    <div>
      <h2>Créer un utilisateur</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nom</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label>Email</label>
          <input type="email" onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label>Mot de passe</label>
          <input type="password" onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
          <label>Rôle</label>
          <select value={role} onChange={(e) => setRole(e.target.value as any)}>
            <option value="lead_developer">lead_developer</option>
            <option value="developer">developer</option>
          </select>
        </div>
        <button type="submit">Créer</button>
        <br></br> <br></br>
        <Link to="/home/dashboard">Retour</Link>
      </form>
    </div>
  );
}

export default CreateUser;
