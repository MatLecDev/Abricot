import { Project } from "@/types"
import { fetchWithAuth } from "@/service/fetchWithAuth"

/** Structure de la réponse API pour un projet unique */
interface ProjectResponse {
    project: Project
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