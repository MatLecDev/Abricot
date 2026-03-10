import {Project, Task} from "@/types";

export function getTasksDone(project: Project){
    if (project._count.tasks === 0 || !project.tasks){
        return 0
    }

    const tasks: Task[] = project.tasks;
    let totalTasksDone: number = 0;

    tasks.forEach((task) => {
        if (task.status === "DONE"){
            totalTasksDone++;
        }
    })

    return totalTasksDone;
}

export function getProgression(done: number, total:number){
    if (total === 0){ return 0; }

    return Math.round((done/total)*100);
}

export function convertUserRole(role: string | undefined){
    switch (role){
        case "OWNER":
            return "Propriétaire";
        case "ADMIN":
            return "Administrateur";
        case "CONTRIBUTOR":
            return "Contributeur";
        default:
            return "";
    }
}