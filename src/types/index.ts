export interface User{
    id: string
    email: string
    name: string
}

export interface Project{
    id: string
    name: string
    description: string
    createdAt: string
    updatedAt: string
    ownerId: string
    owner: User
    members : ProjectMember[]
    _count: {"tasks": number}
    tasks: Task[]
    userRole: "OWNER" | "ADMIN" | "CONTRIBUTOR"
}

export interface ProjectMember{
    id: string
    role: "OWNER" | "ADMIN" | "CONTRIBUTOR"
    joinedAt: string
    userId: string
    projectId: string
    user: User
}

export interface Task{
    id: string
    title: string
    description: string
    status: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED"
    priority: "LOW" | "MEDIUM" | "HARD" | "URGENT"
    dueDate: string
    createdAt: string
    updatedAt: string
    projectId: string
    creatorId: string
    creator?: User
    project: Project
    assignees: AssignedTask[]
    comments: Comment[]
}


export interface AssignedTask{
    id: string
    assignedAt: string
    taskId: string
    userId?: string
    user?: User
}

export interface Comment{
    id: string
    content: string
    createdAt: string
    updatedAt: string
    taskId: string
    authorId: string
    author: User
}

export interface ApiError{
    success: boolean
    message: string
    error: string
    details: [{
        field: string
        message: string
    }]
}

export interface Success{
    success: boolean
    message: string
    data: {
        token: string
    }
}

export interface ProfileResponse {
    user: User
}

export interface ProjectsResponse {
    projects: Project[]
}

export interface AssignedTasksResponse {
    tasks: Task[]
}

export interface ProjectTasksResponse {
    tasks: Task[]
}
