
'use client'
import { type JSX } from "react";
import { useUserContext } from "@/context/UserContext";
import ProfileForm from "@/ui/ProfileForm";

export default function Profile(): JSX.Element | null {
    const { user } = useUserContext()

    if (!user) return null

    return (
        <section className="userProfile">
            <h1>Mon compte</h1>
            <p>{user.name}</p>
            <ProfileForm user={user}/>
        </section>
    )
}