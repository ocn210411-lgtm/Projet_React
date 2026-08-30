import { AxiosError } from "axios"

const isApiUrlWhiteListed = (url?: string | null): boolean => {
    const WHITELISTED_URL = ['/login']
    if (!url) return false
    return WHITELISTED_URL.includes(url)
}

const getApiErrorMessage = (error: unknown): string => {

    if (error instanceof AxiosError) {
        return error?.response?.data?.message || "Une erreur HTTP est survenue"
    }

    return "Une erreur est survenue"
}

export { isApiUrlWhiteListed, getApiErrorMessage }