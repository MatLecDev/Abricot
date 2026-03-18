import { useEffect, RefObject } from "react"

/**
 * Hook personnalisé gérant le comportement clavier des modales :
 * - Fermeture par la touche Echap
 * - Focus trap avec Tab et Shift+Tab pour maintenir le focus dans la modale
 * - Focus initial sur le premier élément interactif au montage
 *
 * @param modalRef - Référence vers l'élément racine de la modale
 * @param onClose - Callback de fermeture de la modale
 * @param focusableSelector - Sélecteur CSS des éléments focusables (optionnel)
 */
export function useModalKeyboard(
    modalRef: RefObject<HTMLElement | null>,
    onClose: () => void,
    focusableSelector: string = 'button:not([disabled]), input, textarea, [tabindex]:not([tabindex="-1"])'
) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose()
                return
            }
            if (e.key === "Tab") {
                const focusable = modalRef.current?.querySelectorAll<HTMLElement>(focusableSelector)
                if (!focusable || focusable.length === 0) return

                const first = focusable[0]
                const last = focusable[focusable.length - 1]

                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault()
                    last.focus()
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault()
                    first.focus()
                }
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        // Focus initial sur le premier input de la modale
        modalRef.current?.querySelector<HTMLElement>("input")?.focus()

        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [onClose, modalRef, focusableSelector])
}