'use client'
import { type JSX, useState } from "react";
import { User } from "@/types";
import {updatePassword, updateProfile} from "@/service/userDataService";
import {useUserContext} from "@/context/UserContext";
import "@/styles/profile.css"

interface ProfileValues {
    name: string
    email: string
}

/**
 * Formulaire de modification du profil utilisateur.
 * Reçoit user en props (depuis le composant parent Profile qui attend
 * que le contexte soit chargé) pour initialiser les champs via lazy initializer.
 */
export default function ProfileForm({ user }: { user: User }): JSX.Element {
    const { loadUserData } = useUserContext()

    // Initialisation avec les données actuelles de l'utilisateur
    const [formValues, setFormValues] = useState(() => ({
        prenom: user.name.split(" ")[0],
        nom: user.name.split(" ")[1] ?? "",
        email: user.email,
        currentPassword: "",
        newPassword: ""
    }))

    /**
     * Soumet uniquement les champs qui ont réellement été modifiés.
     * Gère séparément la mise à jour du profil et du mot de passe.
     */
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        // Construction du body avec uniquement les champs modifiés
        const body: Partial<ProfileValues> = {}
        if (formValues.prenom !== user.name.split(" ")[0] || formValues.nom !== user.name.split(" ")[1]) {
            body.name = `${formValues.prenom} ${formValues.nom}`
        }
        if (formValues.email !== user.email) body.email = formValues.email

        const hasPasswordChange = formValues.currentPassword !== "" && formValues.newPassword !== ""

        // Aucun changement détecté : on ne fait rien
        if (Object.keys(body).length === 0 && !hasPasswordChange) return

        try {
            if (Object.keys(body).length > 0) await updateProfile(body)
            if (hasPasswordChange) {
                await updatePassword(formValues.currentPassword, formValues.newPassword)
                // Réinitialisation des champs mot de passe après modification
                setFormValues({...formValues, currentPassword: "", newPassword: ""})
            }
            await loadUserData()
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <form className="form" onSubmit={handleSubmit} aria-label="Modifier mon profil">
            <label htmlFor="prenom">Prénom</label>
            <input
                id="prenom"
                type="text"
                value={formValues.prenom}
                autoComplete="given-name"
                onChange={(e) => setFormValues({ ...formValues, prenom: e.target.value })}
            />

            <label htmlFor="nom">Nom</label>
            <input
                id="nom"
                type="text"
                value={formValues.nom}
                autoComplete="family-name"
                onChange={(e) => setFormValues({ ...formValues, nom: e.target.value })}
            />

            <label htmlFor="email">Email</label>
            <input
                id="email"
                type="email"
                value={formValues.email}
                autoComplete="email"
                onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
            />

            <label htmlFor="currentPassword">Ancien mot de passe</label>
            <input
                id="currentPassword"
                type="password"
                value={formValues.currentPassword}
                autoComplete="current-password"
                onChange={(e) => setFormValues({ ...formValues, currentPassword: e.target.value })}
            />

            <label htmlFor="newPassword">Nouveau mot de passe</label>
            <input
                id="newPassword"
                type="password"
                value={formValues.newPassword}
                autoComplete="new-password"
                onChange={(e) => setFormValues({ ...formValues, newPassword: e.target.value })}
            />

            <button type="submit">Modifier les informations</button>
        </form>
    )
}