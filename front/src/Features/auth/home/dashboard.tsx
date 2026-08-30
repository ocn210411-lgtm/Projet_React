import { useCallback, useEffect, useState, type FormEvent, type PropsWithChildren } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Icon from "../../../commons/components/Icon";
import { removeToken } from "../../../commons/services/tokenService";
import {
  apiError,
  createProject,
  createTask,
  createUser,
  deleteProject,
  deleteTask,
  deleteUser,
  fetchProjects,
  fetchTasks,
  fetchUsers,
  logout,
  taskAction,
  toggleUser,
  updateTask,
  updateUser,
} from "../../managementService";
import type { Project, Task, TaskPayload, TaskStatus, User, UserPayload } from "../../../types";

type Section = "overview" | "tasks" | "team" | "projects";
type ModalState = { type: "task"; item?: Task } | { type: "user"; item?: User } | { type: "project" } | null;

const statusLabels: Record<TaskStatus, string> = {
  pending: "À planifier",
  assigned: "Assignée",
  in_progress: "En cours",
  completed: "Terminée",
  expired: "En retard",
};

const roleLabels = { manager: "Manager", lead_developer: "Lead developer", developer: "Développeur" };
const cardColors = ["blue", "violet", "sand", "pink", "mint"];

function readCurrentUser(): User {
  try {
    return JSON.parse(localStorage.getItem("currentUser") ?? "{}") as User;
  } catch {
    return {} as User;
  }
}

function initials(name = "Utilisateur") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

function formatDay(value?: string | null) {
  if (!value) return "Sans date";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

function Modal({ children, title, onClose }: PropsWithChildren<{ title: string; onClose: () => void }>) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <header className="modal__header">
          <div><span className="eyebrow">TaskFlow</span><h2>{title}</h2></div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Fermer"><Icon name="close" /></button>
        </header>
        {children}
      </section>
    </div>
  );
}

function TaskForm({ task, projects, users, busy, onClose, onSubmit }: { task?: Task; projects: Project[]; users: User[]; busy: boolean; onClose: () => void; onSubmit: (payload: TaskPayload) => Promise<void> }) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    return onSubmit({
      title: String(values.get("title") ?? ""),
      description: String(values.get("description") ?? ""),
      project_id: Number(values.get("project_id")),
      assigned_to: values.get("assigned_to") ? Number(values.get("assigned_to")) : null,
      start_date: String(values.get("start_date") ?? "") || null,
      status: (values.get("status") as TaskStatus) || "pending",
    });
  };

  return (
    <form className="form-grid" onSubmit={submit}>
      <label className="form-field form-field--wide">Titre de la tâche<input name="title" defaultValue={task?.title} placeholder="Ex. Préparer la maquette mobile" required /></label>
      <label className="form-field form-field--wide">Description<textarea name="description" defaultValue={task?.description ?? ""} rows={4} placeholder="Décrivez le résultat attendu…" /></label>
      <label className="form-field">Projet<select name="project_id" defaultValue={task?.project_id ?? projects[0]?.id} required><option value="" disabled>Choisir un projet</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
      <label className="form-field">Responsable<select name="assigned_to" defaultValue={task?.assigned_to ?? ""}><option value="">Non assignée</option>{users.filter((user) => user.is_active !== false).map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></label>
      <label className="form-field">Date prévue<input name="start_date" type="date" defaultValue={task?.start_date ?? new Date().toISOString().slice(0, 10)} /></label>
      {task && <label className="form-field">Statut<select name="status" defaultValue={task.status}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>}
      <footer className="modal__actions"><button type="button" className="secondary-button" onClick={onClose}>Annuler</button><button className="primary-button" disabled={busy || projects.length === 0}>{busy ? "Enregistrement…" : task ? "Enregistrer" : "Créer la tâche"}</button></footer>
    </form>
  );
}

function UserForm({ user, busy, onClose, onSubmit }: { user?: User; busy: boolean; onClose: () => void; onSubmit: (payload: UserPayload) => Promise<void> }) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    return onSubmit({
      name: String(values.get("name")),
      email: String(values.get("email")),
      role: values.get("role") as UserPayload["role"],
      password: String(values.get("password") ?? "") || undefined,
    });
  };
  return (
    <form className="form-grid" onSubmit={submit}>
      <label className="form-field form-field--wide">Nom complet<input name="name" defaultValue={user?.name} placeholder="Prénom et nom" required /></label>
      <label className="form-field form-field--wide">Adresse e-mail<input name="email" type="email" defaultValue={user?.email} placeholder="nom@entreprise.com" required /></label>
      <label className="form-field">Rôle<select name="role" defaultValue={user?.role ?? "developer"}><option value="developer">Développeur</option><option value="lead_developer">Lead developer</option></select></label>
      <label className="form-field">{user ? "Nouveau mot de passe (optionnel)" : "Mot de passe temporaire"}<input name="password" type="password" minLength={8} required={!user} placeholder="8 caractères minimum" /></label>
      <footer className="modal__actions"><button type="button" className="secondary-button" onClick={onClose}>Annuler</button><button className="primary-button" disabled={busy}>{busy ? "Enregistrement…" : user ? "Mettre à jour" : "Créer l’utilisateur"}</button></footer>
    </form>
  );
}

function ProjectForm({ leads, busy, onClose, onSubmit }: { leads: User[]; busy: boolean; onClose: () => void; onSubmit: (payload: { name: string; description?: string; lead_developer_id?: number | null }) => Promise<void> }) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    return onSubmit({ name: String(values.get("name")), description: String(values.get("description")), lead_developer_id: values.get("lead_developer_id") ? Number(values.get("lead_developer_id")) : null });
  };
  return (
    <form className="form-grid" onSubmit={submit}>
      <label className="form-field form-field--wide">Nom du projet<input name="name" placeholder="Ex. Refonte de l’espace client" required /></label>
      <label className="form-field form-field--wide">Description<textarea name="description" rows={4} placeholder="Objectif et périmètre du projet…" /></label>
      <label className="form-field form-field--wide">Lead developer<select name="lead_developer_id"><option value="">À définir plus tard</option>{leads.map((lead) => <option value={lead.id} key={lead.id}>{lead.name}</option>)}</select></label>
      <footer className="modal__actions"><button type="button" className="secondary-button" onClick={onClose}>Annuler</button><button className="primary-button" disabled={busy}>{busy ? "Création…" : "Créer le projet"}</button></footer>
    </form>
  );
}

function Dashboard() {
  const [currentUser] = useState(readCurrentUser);
  const isManager = currentUser.role === "manager";
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const requestedView = params.get("view") as Section | null;
  const section: Section = ["overview", "tasks", "team", "projects"].includes(requestedView ?? "") ? requestedView! : "tasks";
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [taskFilter, setTaskFilter] = useState<"active" | "completed">("active");
  const [modal, setModal] = useState<ModalState>(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isManager) {
        const [taskData, userData, projectData] = await Promise.all([fetchTasks(), fetchUsers(), fetchProjects()]);
        setTasks(taskData); setUsers(userData); setProjects(projectData);
      } else {
        const taskData = await fetchTasks();
        const visibleTasks = taskData.filter((task) => !task.assigned_to || Number(task.assigned_to) === Number(currentUser.id));
        setTasks(visibleTasks);
        setProjects(Array.from(new Map(visibleTasks.filter((task) => task.project).map((task) => [task.project!.id, task.project!])).values()));
      }
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  }, [currentUser.id, isManager]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load]);
  useEffect(() => { if (!isManager && (section === "team" || section === "projects" || section === "overview")) setParams({ view: "tasks" }, { replace: true }); }, [isManager, section, setParams]);

  const selectSection = (value: Section) => { setParams({ view: value }); setMobileMenu(false); };
  const showNotice = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(null), 2600); };
  const run = async (action: () => Promise<void>, success: string) => {
    setBusy(true); setError(null);
    try { await action(); await load(); setModal(null); showNotice(success); }
    catch (err) { setError(apiError(err)); }
    finally { setBusy(false); }
  };

  const handleLogout = async () => {
    try { await logout(); } catch { /* The local session must still be cleared. */ }
    removeToken(); localStorage.removeItem("currentUser"); navigate("/auth/login", { replace: true });
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesTab = taskFilter === "completed" ? task.status === "completed" : task.status !== "completed";
    const haystack = `${task.title} ${task.description ?? ""} ${task.project?.name ?? ""} ${task.developer?.name ?? ""}`.toLowerCase();
    return matchesTab && haystack.includes(search.toLowerCase());
  });
  const developers = users.filter((user) => user.role !== "manager");
  const leads = users.filter((user) => user.role === "lead_developer" && user.is_active !== false);
  const completed = tasks.filter((task) => task.status === "completed").length;
  const inProgress = tasks.filter((task) => task.status === "in_progress").length;

  const navigation: { id: Section; label: string; icon: "grid" | "tasks" | "users" | "folder"; managerOnly?: boolean }[] = [
    { id: "overview", label: "Vue d’ensemble", icon: "grid", managerOnly: true },
    { id: "tasks", label: "Tâches", icon: "tasks" },
    { id: "team", label: "Équipe", icon: "users", managerOnly: true },
    { id: "projects", label: "Projets", icon: "folder", managerOnly: true },
  ];

  const renderTaskCard = (task: Task) => {
    const mine = Number(task.assigned_to) === Number(currentUser.id);
    let action: "take" | "start" | "complete" | null = null;
    let actionLabel = "";
    if (!isManager && !task.assigned_to && task.status === "pending") { action = "take"; actionLabel = "Prendre"; }
    if (!isManager && mine && task.status === "assigned") { action = "start"; actionLabel = "Démarrer"; }
    if (!isManager && mine && task.status === "in_progress") { action = "complete"; actionLabel = "Terminer"; }
    return (
      <article className={`task-card task-card--${cardColors[task.id % cardColors.length]}`} key={task.id}>
        <div className="task-card__top">
          <button className={`task-check ${task.status === "completed" ? "is-checked" : ""}`} aria-label={task.status === "completed" ? "Marquer active" : "Marquer terminée"} onClick={() => isManager && void run(() => updateTask(task.id, { status: task.status === "completed" ? "pending" : "completed" }).then(() => undefined), "Statut mis à jour")} disabled={!isManager}>
            {task.status === "completed" && <Icon name="check" />}
          </button>
          <span className={`status-pill status-pill--${task.status}`}>{statusLabels[task.status]}</span>
          {isManager && <div className="card-actions"><button className="icon-button" aria-label="Modifier" onClick={() => setModal({ type: "task", item: task })}><Icon name="edit" /></button><button className="icon-button icon-button--danger" aria-label="Supprimer" onClick={() => window.confirm(`Supprimer la tâche « ${task.title} » ?`) && void run(() => deleteTask(task.id), "Tâche supprimée")}><Icon name="trash" /></button></div>}
        </div>
        <div className="task-card__content"><span className="task-card__project">{task.project?.name ?? "Projet"}</span><h3>{task.title}</h3><p>{task.description || "Aucune description ajoutée."}</p></div>
        <footer className="task-card__footer">
          <span><Icon name="calendar" /> {formatDay(task.start_date)}</span>
          {task.developer ? <span className="mini-person"><i>{initials(task.developer.name)}</i>{task.developer.name}</span> : <span className="unassigned">Non assignée</span>}
          {action && <button className="task-action" onClick={() => void run(() => taskAction(task.id, action!), `Tâche : ${actionLabel.toLowerCase()}`)}>{actionLabel}<Icon name="chevron" /></button>}
        </footer>
      </article>
    );
  };

  return (
    <div className="dashboard-shell">
      <aside className={`sidebar ${mobileMenu ? "is-open" : ""}`}>
        <div className="brand"><span className="brand__mark"><i /><i /><i /><i /></span><span>TaskFlow</span></div>
        <nav className="sidebar__nav" aria-label="Navigation principale">
          <span className="sidebar__label">ESPACE DE TRAVAIL</span>
          {navigation.filter((item) => !item.managerOnly || isManager).map((item) => <button key={item.id} className={section === item.id ? "is-active" : ""} onClick={() => selectSection(item.id)}><Icon name={item.icon} /><span>{item.label}</span>{item.id === "tasks" && <b>{tasks.filter((task) => task.status !== "completed").length}</b>}</button>)}
        </nav>
        {isManager && developers.length > 0 && <div className="sidebar__team"><span className="sidebar__label">MEMBRES DE L’ÉQUIPE</span>{developers.slice(0, 4).map((user) => <div key={user.id}><span className="avatar avatar--small">{initials(user.name)}</span><span>{user.name}</span><i className={user.is_active ? "online" : ""} /></div>)}</div>}
        <div className="sidebar__profile"><span className="avatar">{initials(currentUser.name)}</span><div><strong>{currentUser.name || "Utilisateur"}</strong><span>{roleLabels[currentUser.role] ?? currentUser.role}</span></div><button className="icon-button" onClick={() => void handleLogout()} aria-label="Se déconnecter"><Icon name="logout" /></button></div>
      </aside>
      {mobileMenu && <button className="sidebar-overlay" aria-label="Fermer le menu" onClick={() => setMobileMenu(false)} />}

      <main className="dashboard-main">
        <header className="topbar">
          <button className="mobile-menu icon-button" onClick={() => setMobileMenu(true)} aria-label="Ouvrir le menu"><Icon name="menu" /></button>
          <div><span className="topbar__date"><Icon name="calendar" />{new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date())}</span></div>
          <div className="topbar__actions"><button className="notification-button" aria-label="Notifications"><Icon name="bell" /><i /></button><span className="avatar avatar--small">{initials(currentUser.name)}</span></div>
        </header>

        <div className="workspace">
          {notice && <div className="toast"><Icon name="check" />{notice}</div>}
          {error && <div className="alert alert--error alert--page"><span>{error}</span><button onClick={() => setError(null)} aria-label="Fermer"><Icon name="close" /></button></div>}

          {section === "overview" && isManager && <>
            <header className="page-heading"><div><span className="eyebrow">TABLEAU DE BORD</span><h1>Bonjour, {currentUser.name?.split(" ")[0]}</h1><p>Voici où en est votre équipe aujourd’hui.</p></div><button className="primary-button" onClick={() => setModal({ type: "task" })}><Icon name="plus" />Nouvelle tâche</button></header>
            <section className="stats-grid">
              <article><span className="stat-icon stat-icon--blue"><Icon name="tasks" /></span><div><strong>{tasks.length}</strong><span>Tâches au total</span></div></article>
              <article><span className="stat-icon stat-icon--violet"><Icon name="clock" /></span><div><strong>{inProgress}</strong><span>En cours</span></div></article>
              <article><span className="stat-icon stat-icon--mint"><Icon name="check" /></span><div><strong>{completed}</strong><span>Terminées</span></div></article>
              <article><span className="stat-icon stat-icon--sand"><Icon name="users" /></span><div><strong>{developers.filter((user) => user.is_active !== false).length}</strong><span>Membres actifs</span></div></article>
            </section>
            <section className="panel"><header className="panel__header"><div><h2>Tâches récentes</h2><p>Les dernières activités de l’équipe</p></div><button className="text-button" onClick={() => selectSection("tasks")}>Tout afficher <Icon name="arrow" /></button></header><div className="task-grid task-grid--compact">{tasks.slice(0, 3).map(renderTaskCard)}{tasks.length === 0 && <EmptyState type="tasks" />}</div></section>
          </>}

          {section === "tasks" && <>
            <header className="page-heading"><div><span className="eyebrow">PLANIFICATION</span><h1>{isManager ? "Gestion des tâches" : "Mes tâches"}</h1><p>{isManager ? "Planifiez le travail et suivez l’avancement de l’équipe." : "Retrouvez les tâches disponibles et celles qui vous sont assignées."}</p></div>{isManager && <button className="primary-button" onClick={() => setModal({ type: "task" })} disabled={projects.length === 0}><Icon name="plus" />Nouvelle tâche</button>}</header>
            {isManager && projects.length === 0 && !loading && <div className="alert alert--info">Créez d’abord un projet pour pouvoir ajouter une tâche. <button onClick={() => { selectSection("projects"); setModal({ type: "project" }); }}>Créer un projet</button></div>}
            <div className="task-toolbar"><div className="tabs"><button className={taskFilter === "active" ? "is-active" : ""} onClick={() => setTaskFilter("active")}>Tâches actives <span>{tasks.length - completed}</span></button><button className={taskFilter === "completed" ? "is-active" : ""} onClick={() => setTaskFilter("completed")}>Terminées <span>{completed}</span></button></div><label className="search-box"><Icon name="search" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une tâche" /></label></div>
            {loading ? <LoadingCards /> : <div className="task-grid">{filteredTasks.map(renderTaskCard)}{filteredTasks.length === 0 && <EmptyState type="tasks" />}</div>}
          </>}

          {section === "team" && isManager && <>
            <header className="page-heading"><div><span className="eyebrow">COLLABORATEURS</span><h1>Membres de l’équipe</h1><p>Créez les comptes, attribuez les rôles et gérez les accès.</p></div><button className="primary-button" onClick={() => setModal({ type: "user" })}><Icon name="plus" />Nouvel utilisateur</button></header>
            <section className="panel table-panel"><div className="table-toolbar"><label className="search-box"><Icon name="search" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un membre" /></label><span>{developers.length} membre{developers.length > 1 ? "s" : ""}</span></div><div className="data-table"><div className="data-table__head"><span>Collaborateur</span><span>Rôle</span><span>Statut</span><span>Actions</span></div>{developers.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(search.toLowerCase())).map((user) => <div className="data-table__row" key={user.id}><div className="person-cell"><span className="avatar">{initials(user.name)}</span><div><strong>{user.name}</strong><span>{user.email}</span></div></div><span className="role-badge">{roleLabels[user.role]}</span><button className={`status-toggle ${user.is_active !== false ? "is-active" : ""}`} onClick={() => void run(() => toggleUser(user.id, user.is_active === false), user.is_active === false ? "Compte activé" : "Compte désactivé")}><i />{user.is_active !== false ? "Actif" : "Inactif"}</button><div className="row-actions"><button className="icon-button" onClick={() => setModal({ type: "user", item: user })} aria-label="Modifier"><Icon name="edit" /></button><button className="icon-button icon-button--danger" onClick={() => window.confirm(`Supprimer ${user.name} ?`) && void run(() => deleteUser(user.id), "Utilisateur supprimé")} aria-label="Supprimer"><Icon name="trash" /></button></div></div>)}{developers.length === 0 && <EmptyState type="team" />}</div></section>
          </>}

          {section === "projects" && isManager && <>
            <header className="page-heading"><div><span className="eyebrow">ORGANISATION</span><h1>Projets</h1><p>Regroupez les tâches et désignez un lead pour chaque projet.</p></div><button className="primary-button" onClick={() => setModal({ type: "project" })}><Icon name="plus" />Nouveau projet</button></header>
            {loading ? <LoadingCards /> : <div className="project-grid">{projects.map((project) => <article className="project-card" key={project.id}><div className="project-card__top"><span className="project-icon"><Icon name="folder" /></span><button className="icon-button icon-button--danger" onClick={() => window.confirm(`Supprimer le projet « ${project.name} » et ses tâches ?`) && void run(() => deleteProject(project.id), "Projet supprimé")} aria-label="Supprimer"><Icon name="trash" /></button></div><h3>{project.name}</h3><p>{project.description || "Aucune description."}</p><div className="project-progress"><div><span>Progression</span><strong>{project.tasks?.length ? Math.round((project.tasks.filter((task) => task.status === "completed").length / project.tasks.length) * 100) : 0}%</strong></div><i><b style={{ width: `${project.tasks?.length ? Math.round((project.tasks.filter((task) => task.status === "completed").length / project.tasks.length) * 100) : 0}%` }} /></i></div><footer><span>{project.tasks?.length ?? 0} tâche{(project.tasks?.length ?? 0) > 1 ? "s" : ""}</span><span>{project.lead_developer ? <><i className="avatar avatar--tiny">{initials(project.lead_developer.name)}</i>{project.lead_developer.name}</> : "Lead à définir"}</span></footer></article>)}{projects.length === 0 && <EmptyState type="projects" />}</div>}
          </>}
        </div>
      </main>

      {modal?.type === "task" && <Modal title={modal.item ? "Modifier la tâche" : "Créer une nouvelle tâche"} onClose={() => setModal(null)}><TaskForm task={modal.item} projects={projects} users={developers} busy={busy} onClose={() => setModal(null)} onSubmit={(payload) => run(() => modal.item ? updateTask(modal.item.id, payload).then(() => undefined) : createTask(payload).then(() => undefined), modal.item ? "Tâche mise à jour" : "Tâche créée")} /></Modal>}
      {modal?.type === "user" && <Modal title={modal.item ? "Modifier l’utilisateur" : "Créer un utilisateur"} onClose={() => setModal(null)}><UserForm user={modal.item} busy={busy} onClose={() => setModal(null)} onSubmit={(payload) => run(() => modal.item ? updateUser(modal.item.id, payload).then(() => undefined) : createUser(payload).then(() => undefined), modal.item ? "Utilisateur mis à jour" : "Utilisateur créé")} /></Modal>}
      {modal?.type === "project" && <Modal title="Créer un projet" onClose={() => setModal(null)}><ProjectForm leads={leads} busy={busy} onClose={() => setModal(null)} onSubmit={(payload) => run(() => createProject(payload).then(() => undefined), "Projet créé")} /></Modal>}
    </div>
  );
}

function LoadingCards() { return <div className="task-grid"><i className="skeleton-card" /><i className="skeleton-card" /><i className="skeleton-card" /></div>; }
function EmptyState({ type }: { type: "tasks" | "team" | "projects" }) { const copy = { tasks: ["tasks", "Aucune tâche ici", "Les nouvelles tâches apparaîtront dans cette liste."], team: ["users", "Aucun membre", "Créez le premier compte de votre équipe."], projects: ["folder", "Aucun projet", "Créez votre premier projet pour organiser les tâches."] } as const; const [icon, title, text] = copy[type]; return <div className="empty-state"><span><Icon name={icon} /></span><h3>{title}</h3><p>{text}</p></div>; }

export default Dashboard;
