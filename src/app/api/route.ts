import { NextRequest, NextResponse } from "next/server"

// URL de l'API Mistral pour la génération de texte
const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"

/**
 * Route handler Next.js servant de proxy vers l'API Mistral.
 * Permet de ne pas exposer la clé API côté client en faisant transiter
 * les requêtes par le serveur Next.js.
 */
export async function POST(request: NextRequest) {
    // Récupération du body envoyé par le client
    const body = await request.json()

    // Appel à l'API Mistral avec la clé secrète côté serveur uniquement
    const response = await fetch(MISTRAL_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.MISTRAL_API_KEY}`
        },
        body: JSON.stringify(body)
    })

    if (!response.ok) {
        return NextResponse.json({ error: "Erreur lors de la génération des tâches" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
}