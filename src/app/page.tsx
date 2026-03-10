"use client"

import {FormEvent, useState} from "react";
import Image from "next/image";
import "@/styles/logForm.css";
import {login, register} from "@/service/userAuthService";
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';;
import { useUserContext } from "@/context/UserContext"

export default function Home(){
    const { loadUserData } = useUserContext()

    const router = useRouter()

    const [formType, setFormType] = useState<string>("Connexion");
    const [switchFormValue, setSwitchFormValue] = useState<string>("Créer un compte");

    const handleFormTypeChange = (type: string, value: string): void => {
        setFormType(type);
        setSwitchFormValue(value);
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)

        try {
            const response = await (formType === "Connexion" ? login(formData) : register(formData))
            Cookies.set('token', response.data.token, {
                secure: true,
                sameSite: 'strict'
            })
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
                    alt="logo"
                    width={300}
                    height={40}
                    className="logo"
                />
                <form onSubmit={handleSubmit} className="form">
                    <h1 className="title">{formType}</h1>
                    <label htmlFor="email">Email</label>
                    <input type="text" name="email" id="email" />
                    <label htmlFor="password">Mot de passe</label>
                    <input type="password" name="password" id="password" />
                    {formType === "Inscription" && (
                        <div className="formNameElement">
                            <div>
                                <label htmlFor="prenom">Prénom</label>
                                <input type="text" name="prenom" id="prenom" />
                            </div>
                            <div>
                                <label htmlFor="nom">Nom</label>
                                <input type="text" name="nom" id="nom" />
                            </div>
                        </div>
                    )}
                    <button type="submit">{formType == "Connexion" ? "Se connecter" : "S'inscrire"}</button>
                    {formType == "Connexion" && (
                        <p className="resetPassword">Mot de passe oublié ?</p>
                    )}
                </form>
                <p>{formType == "Connexion" ?
                    "Pas encore de compte ?" :
                    "Déjà inscrit ?"}
                    {formType == "Connexion" && (
                            <span onClick={() => handleFormTypeChange("Inscription", "Se connecter")}>{switchFormValue}</span>
                        ) ||
                        (
                            <span onClick={() => handleFormTypeChange("Connexion", "Créer un compte")}>{switchFormValue}</span>
                        )}
                </p>
            </section>
            <div className='backgroundImage'>
                <Image
                    alt={'background image'}
                    src={formType == "Connexion" ? '/background/background-connexion.jpg' : '/background/background-inscription.jpg'}
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                />
            </div>
        </>
    )
}
