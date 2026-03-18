/**
 * Convertit un statut technique de tâche en libellé français lisible.
 *
 * @param status - Statut technique ("TODO", "IN_PROGRESS", "DONE", "CANCELLED")
 * @returns Libellé français correspondant, ou chaîne vide si statut inconnu
 */
export function convertStatus(status: string): string {
    switch (status) {
        case "TODO": return "À faire"
        case "IN_PROGRESS": return "En cours"
        case "DONE": return "Terminée"
        case "CANCELLED": return "Annulée"
        default: return ""
    }
}

/**
 * Formate une date ISO en libellé français court.
 * Exemple : "2026-04-09T00:00:00.000Z" → "09 avril"
 *
 * @param date - Date au format ISO 8601
 */
export function convertDate(date: string): string {
    return new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "long" })
}

/**
 * Convertit une date ISO au format attendu par un input type="date" (YYYY-MM-DD).
 * Exemple : "2026-04-09T00:00:00.000Z" → "2026-04-09"
 *
 * @param date - Date au format ISO 8601
 */
export function toInputDate(date: string): string {
    return new Date(date).toISOString().split("T")[0]
}