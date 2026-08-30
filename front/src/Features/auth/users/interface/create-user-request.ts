export interface CreateUserRequest { // Interface creation user 
    name: string;
    email: string;
    password: string;
    role: 'lead_developer' | 'developer';
}

