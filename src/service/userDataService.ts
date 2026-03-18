import {ProfileResponse, ProjectsResponse, AssignedTasksResponse, ProjectTasksResponse, Task} from "@/types";
import Cookies from "js-cookie";

const BASE_URL = "http://localhost:8000"

/**
 * Fonction utilitaire pour effectuer des requêtes HTTP authentifiées.
 * Ajoute automatiquement le token JWT depuis les cookies dans le header Authorization.
 */
async function fetchWithAuth<T>(endpoint: string, method: string, body?: object): Promise<T> {
    const token = Cookies.get("token")
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
        method: method
    })

    if (!response.ok) throw new Error(`Erreur lors de la récupération de ${endpoint}`)

    const json = await response.json()
    return json.data
}

/** Récupère le profil de l'utilisateur connecté */
export async function getProfile(): Promise<ProfileResponse> {
    return fetchWithAuth<ProfileResponse>("/auth/profile", "GET")
}

/** Met à jour les informations du profil (nom, email) */
export async function updateProfile(body: object): Promise<ProfileResponse> {
    return fetchWithAuth<ProfileResponse>("/auth/profile", "PUT", body);
}

/** Met à jour le mot de passe de l'utilisateur connecté */
export async function updatePassword(currentPassword: string, newPassword: string): Promise<ProfileResponse> {
    return fetchWithAuth<ProfileResponse>("/auth/password", "PUT", { currentPassword, newPassword });
}

/**
 * Récupère tous les projets de l'utilisateur connecté.
 * Pour chaque projet ayant des tâches, récupère également les tâches associées
 * en parallèle via Promise.all pour optimiser les performances.
 */
export async function getProjects(): Promise<ProjectsResponse> {
    const response = await fetchWithAuth<ProjectsResponse>("/projects", "GET");

    await Promise.all(response.projects.map(async project => {
        if (project._count.tasks > 0){
            project.tasks = await getProjectTasks(project.id);
        }
    }))

    return response;
}

/** Récupère les tâches assignées à l'utilisateur connecté */
export async function getAssignedTasks(): Promise<AssignedTasksResponse> {
    return fetchWithAuth<AssignedTasksResponse>("/dashboard/assigned-tasks", "GET");
}

/** Récupère toutes les tâches d'un projet spécifique */
export async function getProjectTasks(id: string): Promise<Task[]> {
    const response = await fetchWithAuth<ProjectTasksResponse>(`/projects/${id}/tasks`, "GET");
    return response.tasks;
}