import Cookies from "js-cookie"
import { Project } from "@/types"

const BASE_URL = "http://localhost:8000"

/** Structure de la réponse API pour un projet unique */
interface ProjectResponse {
    project: Project
}

/**
 * Fonction utilitaire pour effectuer des requêtes HTTP authentifiées.
 * Récupère le token JWT depuis les cookies et l'ajoute au header Authorization.
 * Gère les réponses vides (ex: DELETE) en retournant null.
 */
async function fetchWithAuth<T>(endpoint: string, method: string, body?: object): Promise<T | null> {
    const token = Cookies.get("token")
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        // Body uniquement si fourni pour éviter d'envoyer un body vide sur les DELETE
        ...(body ? { body: JSON.stringify(body) } : {}),
        method: method
    })

    if (!response.ok) throw new Error(`Erreur lors de la requête ${endpoint}`)

    // Gestion des réponses vides (ex: suppression)
    const text = await response.text()
    return text ? JSON.parse(text).data : null
}

/** Crée un nouveau projet */
export async function createProject(name: string, description: string): Promise<Project> {
    const response = await fetchWithAuth<Project>("/projects", "POST", { name, description })
    if (!response) throw new Error("Erreur lors de la création du projet")
    return response
}

/** Met à jour le titre et la description d'un projet existant */
export async function updateProject(id: string, name: string, description: string): Promise<Project> {
    const response = await fetchWithAuth<ProjectResponse>(`/projects/${id}`, "PUT", { name, description })
    if (!response) throw new Error("Erreur lors de la modification du projet")
    return response.project
}

/** Supprime définitivement un projet */
export async function deleteProject(id: string) {
    return fetchWithAuth(`/projects/${id}`, "DELETE")
}