export interface ChangePasswordRequest { // Interface de requete pour le changement de mot de passe 
    old_password: string;
    password: string;
    password_confirmation: string;
}