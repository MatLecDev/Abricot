import {ProfileResponse, ProjectsResponse, AssignedTasksResponse, ProjectTasksResponse, Task} from "@/types";
import Cookies from "js-cookie";

const BASE_URL = "http://localhost:8000"

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

export async function getProfile(): Promise<ProfileResponse> {
    return fetchWithAuth<ProfileResponse>("/auth/profile", "GET")
}

export async function updateProfile(body: object): Promise<ProfileResponse> {
    return fetchWithAuth<ProfileResponse>("/auth/profile", "PUT", body);
}

export async function updatePassword(currentPassword: string, newPassword: string): Promise<ProfileResponse> {
    const body = {
        currentPassword: currentPassword,
        newPassword: newPassword,
    }
    return fetchWithAuth<ProfileResponse>("/auth/password", "PUT", body);
}

export async function getProjects(): Promise<ProjectsResponse> {
    const response: ProjectsResponse = await fetchWithAuth<ProjectsResponse>("/projects", "GET");

    await Promise.all(response.projects.map(async project => {
        if (project._count.tasks > 0){
            const tasks = await getProjectTasks(project.id);
            project.tasks = tasks;
        }
    }))

    return response;
}

export async function getAssignedTasks(): Promise<AssignedTasksResponse> {
    return fetchWithAuth<AssignedTasksResponse>("/dashboard/assigned-tasks", "GET");
}

export async function getProjectTasks(id: string): Promise<Task[]> {
    const response = await fetchWithAuth<ProjectTasksResponse>(`/projects/${id}/tasks`, "GET");
    return response.tasks;
}
