export interface UpdateUserRequest { // Interface pour la mise à jour d'un utilisateur 
    name?: string; // les ? pour dire que c'est optionnel 
    email?: string;
    role?: 'lead_developer' | 'developer';
    password?: string;
}
