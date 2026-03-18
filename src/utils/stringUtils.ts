/**
 * Génère les initiales d'un nom complet (prénom + nom).
 * Exemple : "Jean Dupont" → "JD"
 *
 * @param name - Nom complet de l'utilisateur
 */
export const getInitials = (name: string): string => {
    const splitName = name.split(" ")
    return `${splitName[0].charAt(0)}${splitName[1].charAt(0)}`
}

/**
 * Génère un slug URL à partir d'un nom et d'un identifiant unique.
 * Le nom est mis en minuscules et les espaces remplacés par des tirets.
 * L'id est ajouté en suffixe pour garantir l'unicité même si deux projets ont le même nom.
 * Exemple : "Mon Projet", "abc123" → "mon-projet-abc123"
 *
 * @param name - Nom du projet
 * @param id - Identifiant unique du projet
 */
export function toSlug(name: string, id: string): string {
    return `${name.toLowerCase().replace(/\s+/g, "-")}-${id}`
}