import Cookies from "js-cookie"

export const BASE_URL = "http://localhost:8000"

/**
 * Fonction utilitaire partagée pour effectuer des requêtes HTTP authentifiées.
 * Récupère le token JWT depuis les cookies et l'ajoute au header Authorization.
 * Gère les réponses vides (ex: DELETE) en retournant null.
 *
 * @param endpoint - Route API relative (ex: "/projects")
 * @param method - Méthode HTTP ("GET", "POST", "PUT", "DELETE")
 * @param body - Corps de la requête (optionnel, ignoré pour GET et DELETE)
 */
export async function fetchWithAuth<T>(endpoint: string, method: string, body?: object): Promise<T | null> {
    const token = Cookies.get("token")
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        // Body uniquement si fourni pour éviter d'envoyer un body vide sur les DELETE
        ...(body ? { body: JSON.stringify(body) } : {}),
        method
    })

    if (!response.ok) throw new Error(`Erreur lors de la requête ${endpoint}`)

    // Gestion des réponses vides (ex: suppression réussie sans contenu retourné)
    const text = await response.text()
    return text ? JSON.parse(text).data : null
}