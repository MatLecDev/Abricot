'use client'
import { type JSX } from "react";
import { useUserContext } from "@/context/UserContext";
import ProfileForm from "@/ui/ProfileForm";

/**
 * Page de profil utilisateur.
 * Attend que le contexte soit chargé avant de rendre le formulaire,
 * ce qui garantit que ProfileForm reçoit toujours un user non null.
 */
export default function Profile(): JSX.Element | null {
    const { user } = useUserContext()

    // Ne rend rien tant que l'utilisateur n'est pas chargé
    if (!user) return null

    return (
        <section className="userProfile" aria-labelledby="profile-title">
            <h1 id="profile-title">Mon compte</h1>
            {/* Nom affiché en lecture seule à titre informatif */}
            <p aria-label={`Connecté en tant que : ${user.name}`}>{user.name}</p>
            {/* Formulaire enfant qui reçoit user en props pour initialiser ses champs */}
            <ProfileForm user={user}/>
        </section>
    )
}