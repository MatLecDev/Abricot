import Link from 'next/link';
import "@/styles/notFound.css"

export default function NotFound() {
    return (
        <section className="not-found">
            <h2>Erreur 404 - Page introuvable</h2>
            <p>La page que vous essayez d&#39;atteindre n&#39;existe pas :/</p>
            <Link href="/dashboard">Return Home</Link>
        </section>
    )
}