"use client"
import { type JSX, useState } from "react";
import "@/styles/header.css";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useUserContext } from "@/context/UserContext";
import { getInitials } from "@/utils/stringUtils";

export default function Header(): JSX.Element | null {
    const pathname = usePathname();
    const isLogin: boolean = pathname == "/";
    const { user, isLoading } = useUserContext();
    const [menuOpen, setMenuOpen] = useState(false);

    if (isLogin) return null
    if (isLoading) return null

    return (
        <>
            <header className="header">
                <Image src="/logo/logo-orange.svg" width={200} height={30} className="logo" alt="logo" />

                <nav className="desktopNav">
                    <Link href="/dashboard">
                        <div className={pathname == "/dashboard" ? "active" : ""}>
                            <Image
                                src={pathname == "/dashboard" ? "/icons/dashboard-white.svg" : "/icons/dashboard.svg"}
                                alt="dashboard icon" width={25} height={25}
                            />
                            <p>Tableau de bord</p>
                        </div>
                    </Link>
                    <Link href="/projects">
                        <div className={pathname.startsWith("/projects") ? "active" : ""}>
                            <Image
                                src={pathname.startsWith("/projects") ? "/icons/projects-white.svg" : "/icons/projects.svg"}
                                alt="projects icon" width={25} height={25}
                            />
                            <p>Projets</p>
                        </div>
                    </Link>
                </nav>

                <Link href="/profile" className="desktopProfile">
                    <div className={"profile " + (pathname == "/profile" ? "profileActive" : "")}>
                        {user && <p>{getInitials(user.name)}</p>}
                    </div>
                </Link>

                <button className="burgerBtn" onClick={() => setMenuOpen(prev => !prev)}>
                    <Image src="/icons/burger.svg" alt="menu" width={50} height={50} />
                </button>
            </header>

            {menuOpen && (
                <nav className="burgerMenu">
                    <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                        <div className={pathname == "/dashboard" ? "active" : ""}>
                            <Image
                                src={pathname == "/dashboard" ? "/icons/dashboard-white.svg" : "/icons/dashboard.svg"}
                                alt="dashboard icon" width={25} height={25}
                            />
                            <p>Tableau de bord</p>
                        </div>
                    </Link>
                    <Link href="/projects" onClick={() => setMenuOpen(false)}>
                        <div className={pathname.startsWith("/projects") ? "active" : ""}>
                            <Image
                                src={pathname.startsWith("/projects") ? "/icons/projects-white.svg" : "/icons/projects.svg"}
                                alt="projects icon" width={25} height={25}
                            />
                            <p>Projets</p>
                        </div>
                    </Link>
                    <Link href="/profile" onClick={() => setMenuOpen(false)}>
                        <div className={"profile " + (pathname == "/profile" ? "profileActive" : "")}>
                            {user && <p>{getInitials(user.name)}</p>}
                        </div>
                    </Link>
                </nav>
            )}
        </>
    )
}