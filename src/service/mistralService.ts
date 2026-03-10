const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"
const MISTRAL_API_KEY = process.env.NEXT_PUBLIC_MISTRAL_API_KEY

interface AITask {
    title: string
    description: string
}

interface MistralMessage {
    role: "user" | "assistant" | "system"
    content: string
}

export async function generateTasks(userMessage: string, existingTasks: string[], history: MistralMessage[]): Promise<AITask[]> {
    const systemPrompt = `Tu es un gestionnaire de projets expérimenté. 
Ton rôle est d'analyser les demandes des utilisateurs et de proposer une liste de tâches pertinentes et actionables.
Les tâches existantes dans ce projet sont les suivantes (ne pas créer de doublons) : ${existingTasks.length > 0 ? existingTasks.join(", ") : "Aucune tâche pour l'instant"}.
Tu dois TOUJOURS répondre UNIQUEMENT avec un JSON valide sous ce format exact, sans texte avant ou après :
{"tasks": [{"title": "string", "description": "string"}]}`

    const messages: MistralMessage[] = [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: userMessage }
    ]

    const response = await fetch(MISTRAL_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${MISTRAL_API_KEY}`
        },
        body: JSON.stringify({
            model: "mistral-small-latest",
            messages,
            response_format: { type: "json_object" }
        })
    })

    if (!response.ok) throw new Error("Erreur lors de la génération des tâches")

    const data = await response.json()
    const content = JSON.parse(data.choices[0].message.content)
    return content.tasks
}