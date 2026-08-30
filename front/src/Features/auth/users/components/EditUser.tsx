import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../../config/axios/axiosinstance";
import { updateUser } from "../service/userService";
import { getApiErrorMessage } from "../../../utils/tools";

function EditUser() {
  const { id } = useParams(); // Le useParams permet 
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<'lead_developer' | 'developer'>('developer');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get(`/users/${id}`); 
        const user = response.data.data || response.data;
        setName(user.name); 
        setEmail(user.email);
        setRole(user.role || 'developer');
        setLoading(false);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : getApiErrorMessage(err));
        setLoading(false);
      }
    };

    if (id) {
      fetchUser(); // Fetchuser permet de recuperer les donnees de l'utilisateur a modifier 
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name || !email) return setError('Le nom et l\'email sont requis');
    if (!id) return setError('Identifiant utilisateur manquant');

    try {
      await updateUser(id, { name, email, role });
      setSuccess('Utilisateur modifié avec succès');
      setTimeout(() => {
        navigate('/home/dashboard', { replace: true });
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : getApiErrorMessage(err));
    }
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div>
      <h2>Modifier utilisateur</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nom</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Rôle</label>
          <select value={role} onChange={(e) => setRole(e.target.value as any)}>
            <option value="lead_developer">lead_developer</option>
            <option value="developer">developer</option>
          </select>
        </div>
        <button type="submit">Enregistrer</button>
        <button type="button" onClick={() => navigate('/home/dashboard')}>Annuler</button>
      </form>
    </div>
  );
}

export default EditUser;
