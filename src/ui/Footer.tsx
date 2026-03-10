import {type JSX} from "react";
import Image from "next/image";
import "@/styles/footer.css"

export default function Footer() : JSX.Element{
    return (
        <footer className="footer">
            <Image
                src="/logo/logo-black.svg"
                alt="Logo noir"
                width={150}
                height={25}
            />
            <p>Abricot 2025-2026</p>
        </footer>
    )
}