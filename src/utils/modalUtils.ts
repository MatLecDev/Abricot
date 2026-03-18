import React from "react"

/**
 * Génère un handler de clic sur le backdrop d'une modale.
 * Ferme la modale uniquement si le clic est sur le backdrop lui-même
 * et non sur son contenu.
 *
 * @param onClose - Callback de fermeture de la modale
 */
export function createBackdropClickHandler(onClose: () => void) {
    return (e: React.MouseEvent<HTMLDialogElement>) => {
        if (e.target === e.currentTarget) onClose()
    }
}