import {Project, Task} from "@/types";

/**
 * Calcule le nombre de tâches terminées dans un projet.
 * Retourne 0 si le projet n'a pas de tâches ou si la liste est vide.
 */
export function getTasksDone(project: Project): number {
    if (project._count.tasks === 0 || !project.tasks) return 0

    return project.tasks.filter((task: Task) => task.status === "DONE").length
}

/**
 * Calcule le pourcentage de complétion d'un projet.
 * Retourne 0 si le total est nul pour éviter une division par zéro.
 *
 * @param done - Nombre de tâches terminées
 * @param total - Nombre total de tâches
 */
export function getProgression(done: number, total: number): number {
    if (total === 0) return 0
    return Math.round((done / total) * 100)
}

/**
 * Convertit un rôle de projet en libellé français lisible.
 *
 * @param role - Rôle technique ("OWNER", "ADMIN", "CONTRIBUTOR")
 * @returns Libellé français correspondant, ou chaîne vide si rôle inconnu
 */
export function convertUserRole(role: string | undefined): string {
    switch (role) {
        case "OWNER": return "Propriétaire"
        case "ADMIN": return "Administrateur"
        case "CONTRIBUTOR": return "Contributeur"
        default: return ""
    }
}