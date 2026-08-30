import axiosInstance from "../../../config/axios/axiosinstance"
import axios from "axios"
import type { ChangePasswordRequest } from "../Interface/change-password-request"
import type { LoginRequest } from "../Interface/login-request"

const login = async (loginRequest: LoginRequest) => { // Requete de connexion 
    // Premiere methode avec fetch 
    // const response = await fetch(${apiBaseUrl}/login, {
    //     method: "POST",
    //     headers: {
    //         "Content-Type": "application:json",
    //     },
    //     body: JSON.stringify(loginRequest)
    // })

    // Deuxieme methode avec axiosInstance 
    const response = await axiosInstance({url: '/login', method: "POST", data: loginRequest}) 
    return response.data
}

const changePassword = async (changePasswordRequest: ChangePasswordRequest) => { 
    try {
        // Affichage des requete 
        console.debug('changePassword request', {
            url: `${axiosInstance.defaults.baseURL || ''}/change-password`,
            data: changePasswordRequest,
        })

        const response = await axiosInstance.post('/change-password', changePasswordRequest)
        return response.data // Retourne de la reponse 
    } catch (err: unknown) {
        
        const extractMessageFromData = (data: unknown): string => {
            if (typeof data === 'object' && data !== null) {
                const d = data as { message?: unknown }
                if (typeof d.message === 'string') return d.message
                try { return JSON.stringify(data) } catch { return String(data) }
            }
            return String(data)
        }

        if (axios.isAxiosError(err) && err.response) {
            const message = extractMessageFromData(err.response.data)
            throw new Error(message, { cause: err })
        }
        throw new Error(String(err), { cause: err }) 
    }
}

export { login, changePassword }