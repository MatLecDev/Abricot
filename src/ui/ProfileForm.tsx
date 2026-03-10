// ProfileForm.tsx - composant enfant
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

export default function ProfileForm({ user }: { user: User }): JSX.Element {
    const { loadUserData } = useUserContext()

    const [formValues, setFormValues] = useState(() => ({
        prenom: user.name.split(" ")[0],
        nom: user.name.split(" ")[1] ?? "",
        email: user.email,
        currentPassword: "",
        newPassword: ""
    }))

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const body: Partial<ProfileValues> = {}
        if (formValues.prenom !== user.name.split(" ")[0] || formValues.nom !== user.name.split(" ")[1]) body.name = `${formValues.prenom} ${formValues.nom}`
        if (formValues.email !== user.email) body.email = formValues.email

        const hasPasswordChange = formValues.currentPassword !== "" && formValues.newPassword !== ""

        if (Object.keys(body).length === 0 && !hasPasswordChange) return

        try {
            if (Object.keys(body).length > 0) await updateProfile(body)
            if (hasPasswordChange) {
                await updatePassword(formValues.currentPassword, formValues.newPassword);
                setFormValues({...formValues, currentPassword: "", newPassword: ""})
            }

            await loadUserData()
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <form className="form" onSubmit={handleSubmit}>
            <label>Prénom</label>
            <input
                type="text"
                value={formValues.prenom}
                onChange={(e) => setFormValues({ ...formValues, prenom: e.target.value })}
            />
            <label>Nom</label>
            <input
                type="text"
                value={formValues.nom}
                onChange={(e) => setFormValues({ ...formValues, nom: e.target.value })}
            />
            <label>Email</label>
            <input
                type="text"
                value={formValues.email}
                onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
            />
            <label>Ancien mot de passe</label>
            <input
                type="password"
                value={formValues.currentPassword}
                onChange={(e) => setFormValues({ ...formValues, currentPassword: e.target.value })}
            />
            <label>Nouveau mot de passe</label>
            <input
                type="password"
                value={formValues.newPassword}
                onChange={(e) => setFormValues({ ...formValues, newPassword: e.target.value })}
            />
            <button type="submit">Modifier les informations</button>
        </form>
    )
}