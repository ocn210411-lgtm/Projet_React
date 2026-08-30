import type { User } from "./user";

export interface LoginResponse { // Interface pour la reponse de la requete de connexion
    message: string;
    token: string;
    must_change_password: boolean;
    user: User;
}
