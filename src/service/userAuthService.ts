import { Success, ApiError } from "@/types";

const BASE_URL = "http://localhost:8000"

/**
 * Fonction générique pour les requêtes d'authentification (POST).
 * Gère la réponse et lance une erreur avec le message de l'API si la requête échoue.
 */
async function authRequest(endpoint: string, body: object) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })

    const data: Success | ApiError = await response.json()

    if (!response.ok) {
        throw new Error((data as ApiError).message)
    }

    return data as Success
}

/** Connecte un utilisateur avec son email et mot de passe */
export async function login(formData: FormData): Promise<Success> {
    return authRequest('/auth/login', {
        email: formData.get('email'),
        password: formData.get('password'),
    })
}

/** Inscrit un nouvel utilisateur avec son email, mot de passe et nom complet */
export async function register(formData: FormData): Promise<Success> {
    return authRequest('/auth/register', {
        email: formData.get('email'),
        password: formData.get('password'),
        name: `${formData.get('prenom')} ${formData.get('nom')}`,
    })
}