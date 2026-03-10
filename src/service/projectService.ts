import Cookies from "js-cookie"
import { Project } from "@/types"

const BASE_URL = "http://localhost:8000"

interface ProjectResponse {
    project: Project
}

async function fetchWithAuth<T>(endpoint: string, method: string, body?: object): Promise<T | null> {
    const token = Cookies.get("token")
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
        method: method
    })

    if (!response.ok) throw new Error(`Erreur lors de la requête ${endpoint}`)

    const text = await response.text()
    return text ? JSON.parse(text).data : null
}

export async function createProject(name: string, description: string): Promise<Project> {
    const response = await fetchWithAuth<Project>("/projects", "POST", {
        name: name,
        description: description,
    })
    if (!response) throw new Error("Erreur lors de la création du projet")
    return response
}

export async function updateProject(id: string, name: string, description: string): Promise<Project> {
    const response = await fetchWithAuth<ProjectResponse>(`/projects/${id}`, "PUT", {
        name: name,
        description: description,
    })
    if (!response) throw new Error("Erreur lors de la modification du projet")
    return response.project
}

export async function deleteProject(id: string) {
    const reponse = await fetchWithAuth(`/projects/${id}`, "DELETE")

    return reponse;
}