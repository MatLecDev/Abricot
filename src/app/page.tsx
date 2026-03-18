"use client"

import {FormEvent, useState} from "react";
import Image from "next/image";
import "@/styles/logForm.css";
import {login, register} from "@/service/userAuthService";
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';
import { useUserContext } from "@/context/UserContext"

export default function Home(){
    const { loadUserData } = useUserContext()
    const router = useRouter()

    // Gestion du type de formulaire affiché : "Connexion" ou "Inscription"
    const [formType, setFormType] = useState<string>("Connexion");
    const [switchFormValue, setSwitchFormValue] = useState<string>("Créer un compte");

    /** Bascule entre les formulaires de connexion et d'inscription */
    const handleFormTypeChange = (type: string, value: string): void => {
        setFormType(type);
        setSwitchFormValue(value);
    }

    /** Gère la soumission du formulaire : connexion ou inscription selon le mode actif */
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)

        try {
            // Appel au service correspondant selon le type de formulaire
            const response = await (formType === "Connexion" ? login(formData) : register(formData))

            // Stockage du token JWT dans un cookie sécurisé
            Cookies.set('token', response.data.token, {
                secure: true,
                sameSite: 'strict'
            })

            // Chargement des données utilisateur dans le contexte puis redirection
            await loadUserData()
            router.push('/dashboard')
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <>
            <section className="logFormWrapper">
                <Image
                    src="/logo/logo-orange.svg"
                    alt="Logo de l'application"
                    width={300}
                    height={40}
                    className="logo"
                />

                {/* Formulaire de connexion ou d'inscription selon formType */}
                <form
                    onSubmit={handleSubmit}
                    className="form"
                    aria-label={formType === "Connexion" ? "Formulaire de connexion" : "Formulaire d'inscription"}
                >
                    <h1 className="title">{formType}</h1>

                    <label htmlFor="email">Email</label>
                    <input
                        type="text"
                        name="email"
                        id="email"
                        autoComplete="email"
                        aria-required="true"
                    />

                    <label htmlFor="password">Mot de passe</label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        autoComplete={formType === "Connexion" ? "current-password" : "new-password"}
                        aria-required="true"
                    />

                    {/* Champs supplémentaires affichés uniquement à l'inscription */}
                    {formType === "Inscription" && (
                        <div className="formNameElement">
                            <div>
                                <label htmlFor="prenom">Prénom</label>
                                <input
                                    type="text"
                                    name="prenom"
                                    id="prenom"
                                    autoComplete="given-name"
                                    aria-required="true"
                                />
                            </div>
                            <div>
                                <label htmlFor="nom">Nom</label>
                                <input
                                    type="text"
                                    name="nom"
                                    id="nom"
                                    autoComplete="family-name"
                                    aria-required="true"
                                />
                            </div>
                        </div>
                    )}

                    <button type="submit">
                        {formType == "Connexion" ? "Se connecter" : "S'inscrire"}
                    </button>

                    {formType == "Connexion" && (
                        <p className="resetPassword" tabIndex={0}>Mot de passe oublié ?</p>
                    )}
                </form>

                {/* Lien de basculement entre connexion et inscription */}
                <p>
                    {formType == "Connexion" ? "Pas encore de compte ?" : "Déjà inscrit ?"}
                    {formType == "Connexion" ? (
                        <button
                            className="switchFormBtn"
                            onClick={() => handleFormTypeChange("Inscription", "Se connecter")}
                            aria-label="Passer au formulaire d'inscription"
                        >
                            {switchFormValue}
                        </button>
                    ) : (
                        <button
                            className="switchFormBtn"
                            onClick={() => handleFormTypeChange("Connexion", "Créer un compte")}
                            aria-label="Passer au formulaire de connexion"
                        >
                            {switchFormValue}
                        </button>
                    )}
                </p>
            </section>

            {/* Image de fond qui change selon le type de formulaire */}
            <section className='backgroundImage' aria-hidden="true">
                <Image
                    alt=""
                    src={formType == "Connexion" ? '/background/background-connexion.jpg' : '/background/background-inscription.jpg'}
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                />
            </section>
        </>
    )
}