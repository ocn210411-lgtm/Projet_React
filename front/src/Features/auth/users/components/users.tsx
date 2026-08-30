import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../../config/axios/axiosinstance";
import { deleteUser } from "../service/userService";

function users() {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get("/users");
      const payload = response.data;

      const normalizeUsers = (value: unknown): any[] => {
        if (Array.isArray(value)) return value;
        if (!value || typeof value !== 'object') return [];

        const obj = value as Record<string, unknown>;
        if (Array.isArray(obj.data)) return obj.data;
        if (Array.isArray(obj.users)) return obj.users;
        if (Array.isArray(obj.result)) return obj.result;
        if (obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)) return [obj.data];
        if (obj.users && typeof obj.users === 'object' && !Array.isArray(obj.users)) return [obj.users];
        if (obj.id || obj.email || obj.name) return [obj];

        return [];
      };

      const users = normalizeUsers(payload);

      const currentUserRaw = localStorage.getItem('currentUser');
      const currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;

      const filtered = currentUser && users.length > 1
        ? users.filter((u: any) => !(u?.id && currentUser?.id && Number(u.id) === Number(currentUser.id)))
        : users;

      setData(filtered);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Erreur lors de la récupération des données");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      setLoading(true);
      try {
        await deleteUser(id);
        setData(data.filter(u => u.id !== id));
        setError(null);
      } catch (err: any) {
        setError(err?.message || "Erreur lors de la suppression");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!error && !data && <p>Chargement...</p>}
      {data && (
        <div>
          {Array.isArray(data) && data.length === 0 && <p>Aucun utilisateur trouvé.</p>}
          {Array.isArray(data) && data.length > 0 && (
            <ul>
              {data.map((u: any) => (
                <li key={u.id}>
                  <strong>{u.name}</strong> — {u.email} {u.role && (<span>({u.role})</span>)} &nbsp; &nbsp;
                  <button onClick={() => navigate(`/users/edit/${u.id}`)} disabled={loading}>
                    Modifier
                  </button>
                  &nbsp; 
                  | &nbsp; 
                  <button onClick={() => handleDelete(u.id)} disabled={loading}>
                    Supprimer
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default users