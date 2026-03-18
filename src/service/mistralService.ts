/** Structure d'une tâche générée par l'IA */
interface AITask {
    title: string
    description: string
}

/** Structure d'un message dans l'historique de conversation Mistral */
interface MistralMessage {
    role: "user" | "assistant" | "system"
    content: string
}

/**
 * Génère une liste de tâches via l'API Mistral en passant par
 * la route proxy Next.js pour ne pas exposer la clé API côté client.
 *
 * @param userMessage - La demande de l'utilisateur en langage naturel
 * @param existingTasks - Titres des tâches existantes pour éviter les doublons
 * @param history - Historique de la conversation pour le contexte multi-tours
 */
export async function generateTasks(userMessage: string, existingTasks: string[], history: MistralMessage[]): Promise<AITask[]> {
    // Prompt système définissant le rôle et les contraintes de l'IA
    const systemPrompt = `Tu es un gestionnaire de projets expérimenté. 
Ton rôle est d'analyser les demandes des utilisateurs et de proposer une liste de tâches pertinentes et actionables.
Les tâches existantes dans ce projet sont les suivantes (ne pas créer de doublons) : ${existingTasks.length > 0 ? existingTasks.join(", ") : "Aucune tâche pour l'instant"}.
Tu dois TOUJOURS répondre UNIQUEMENT avec un JSON valide sous ce format exact, sans texte avant ou après :
{"tasks": [{"title": "string", "description": "string"}]}`

    // Construction des messages avec le système, l'historique et le nouveau message
    const messages: MistralMessage[] = [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: userMessage }
    ]

    // Appel à la route proxy Next.js qui fait la requête à Mistral côté serveur
    const response = await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "mistral-small-latest",
            messages,
            response_format: { type: "json_object" }
        })
    })

    if (!response.ok) throw new Error("Erreur lors de la génération des tâches")

    const data = await response.json()
    // Parsing de la réponse JSON retournée par Mistral
    const content = JSON.parse(data.choices[0].message.content)
    return content.tasks
}