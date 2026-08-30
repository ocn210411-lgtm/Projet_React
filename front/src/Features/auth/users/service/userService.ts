import axios from "axios"
import axiosInstance from "../../../../config/axios/axiosinstance"
import type { CreateUserRequest } from "../interface/create-user-request"
import type { UpdateUserRequest } from "../interface/update-user-request"

const createUser = async (createUserRequest: CreateUserRequest) => { // Fonction pour la creation d'un utilisateur 
    try {
        const response = await axiosInstance.post("/users", createUserRequest)
        return response.data
    } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response) {
            const data = err.response.data as { errors?: Record<string, string[]>; message?: string }
            if (data.errors) {
                const messages = Object.values(data.errors).flat().join(' ')
                throw new Error(messages)
            }
            if (data.message) throw new Error(String(data.message))
        }
        throw new Error(err instanceof Error ? err.message : String(err))
    }
}

const deleteUser = async (id: number | string) => {
    try {
        const response = await axiosInstance.delete(`/users/${id}`)
        return response.data
    } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response) {
            const data = err.response.data as { errors?: Record<string, string[]>; message?: string }
            if (data.errors) {
                const messages = Object.values(data.errors).flat().join(' ')
                throw new Error(messages)
            }
            if (data.message) throw new Error(String(data.message))
        }
        throw new Error(err instanceof Error ? err.message : String(err))
    }
}

const updateUser = async (id: number | string, updateUserRequest: UpdateUserRequest) => { 
    try {
        const response = await axiosInstance.put(`/users/${id}`, updateUserRequest)
        return response.data
    } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response) {
            const data = err.response.data as { errors?: Record<string, string[]>; message?: string }
            if (data.errors) {
                const messages = Object.values(data.errors).flat().join(' ')
                throw new Error(messages)
            }
            if (data.message) throw new Error(String(data.message))
        }
        throw new Error(err instanceof Error ? err.message : String(err))
    }
}

export { createUser, deleteUser, updateUser }
