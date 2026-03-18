"use client"
import { type JSX, useState } from "react";
import "@/styles/header.css";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useUserContext } from "@/context/UserContext";
import { getInitials } from "@/utils/stringUtils";

/** Header principal de l'application avec navigation desktop et menu burger mobile */
export default function Header(): JSX.Element | null {
    const pathname = usePathname();
    const isLogin: boolean = pathname == "/";
    const { user, isLoading } = useUserContext();
    const [menuOpen, setMenuOpen] = useState(false);

    // Le header ne s'affiche pas sur la page de login ni pendant le chargement
    if (isLogin) return null
    if (isLoading) return null

    return (
        <>
            <header className="header" role="banner">
                <Image
                    src="/logo/logo-orange.svg"
                    width={200}
                    height={30}
                    className="logo"
                    alt="Logo de l'application, retour à l'accueil"
                />

                {/* Navigation principale — visible uniquement en desktop */}
                <nav className="desktopNav" aria-label="Navigation principale">
                    <Link href="/dashboard" aria-current={pathname == "/dashboard" ? "page" : undefined}>
                        <div className={pathname == "/dashboard" ? "active" : ""}>
                            <Image
                                src={pathname == "/dashboard" ? "/icons/dashboard-white.svg" : "/icons/dashboard.svg"}
                                alt=""
                                aria-hidden="true"
                                width={25}
                                height={25}
                            />
                            <p>Tableau de bord</p>
                        </div>
                    </Link>
                    <Link href="/projects" aria-current={pathname.startsWith("/projects") ? "page" : undefined}>
                        <div className={pathname.startsWith("/projects") ? "active" : ""}>
                            <Image
                                src={pathname.startsWith("/projects") ? "/icons/projects-white.svg" : "/icons/projects.svg"}
                                alt=""
                                aria-hidden="true"
                                width={25}
                                height={25}
                            />
                            <p>Projets</p>
                        </div>
                    </Link>
                </nav>

                {/* Lien vers le profil utilisateur — visible uniquement en desktop */}
                <Link href="/profile" className="desktopProfile" aria-label="Accéder à mon profil">
                    <div className={"profile " + (pathname == "/profile" ? "profileActive" : "")}>
                        {user && <p aria-hidden="true">{getInitials(user.name)}</p>}
                    </div>
                </Link>

                {/* Bouton menu burger — visible uniquement en mobile */}
                <button
                    className="burgerBtn"
                    onClick={() => setMenuOpen(prev => !prev)}
                    aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                    aria-expanded={menuOpen}
                    aria-controls="burger-menu"
                >
                    <Image src="/icons/burger.svg" alt="" aria-hidden="true" width={50} height={50} />
                </button>
            </header>

            {/* Menu burger mobile — affiché sous le header quand menuOpen est true */}
            {menuOpen && (
                <nav id="burger-menu" className="burgerMenu" aria-label="Menu mobile">
                    <Link href="/dashboard" onClick={() => setMenuOpen(false)} aria-current={pathname == "/dashboard" ? "page" : undefined}>
                        <div className={pathname == "/dashboard" ? "active" : ""}>
                            <Image src={pathname == "/dashboard" ? "/icons/dashboard-white.svg" : "/icons/dashboard.svg"} alt="" aria-hidden="true" width={25} height={25} />
                            <p>Tableau de bord</p>
                        </div>
                    </Link>
                    <Link href="/projects" onClick={() => setMenuOpen(false)} aria-current={pathname.startsWith("/projects") ? "page" : undefined}>
                        <div className={pathname.startsWith("/projects") ? "active" : ""}>
                            <Image src={pathname.startsWith("/projects") ? "/icons/projects-white.svg" : "/icons/projects.svg"} alt="" aria-hidden="true" width={25} height={25} />
                            <p>Projets</p>
                        </div>
                    </Link>
                    <Link href="/profile" onClick={() => setMenuOpen(false)} aria-label="Accéder à mon profil">
                        <div className={"profile " + (pathname == "/profile" ? "profileActive" : "")}>
                            {user && <p aria-hidden="true">{getInitials(user.name)}</p>}
                        </div>
                    </Link>
                </nav>
            )}
        </>
    )
}