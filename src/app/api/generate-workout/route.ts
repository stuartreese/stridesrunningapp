import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { feeling, type, distance, duration, notes } = await req.json()

    const prompt = `You are Strides, a thoughtful AI running coach. Generate a personalized workout based on these inputs:

- How the runner feels today: ${feeling}
- Run type desired: ${type}
- Target distance: ${distance} miles
- Target duration: ${duration} minutes
- Additional notes: ${notes && notes.trim() !== '' ? notes : 'None'}

Respond ONLY with a valid JSON object. No markdown fences, no explanation, no text before or after. Exactly this shape:
{
  "name": "A poetic 2-3 word run name (e.g. 'Autumn Threshold', 'Dusk Tempo')",
  "insight": "2-3 sentences of personalized coaching insight about this specific workout and why it fits the runner today. Be warm, specific, and encouraging.",
  "pace": "Suggested pace in min:sec per mile format (e.g. '9:30')",
  "steps": [
    {
      "name": "Phase name",
      "description": "1-2 sentences of specific instruction",
      "duration": "X min",
      "isKey": false
    }
  ],
  "tips": ["One short actionable tip", "Another tip", "A third tip"]
}

Steps should include warm-up, 1-2 main phases (matching the run type), and cool-down. The key phase (isKey: true) is the main effort. Keep descriptions vivid but concise.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    // Strip any accidental markdown fences before parsing
    const cleaned = text.replace(/```json|```/g, '').trim()
    const workout = JSON.parse(cleaned)

    return NextResponse.json(workout)
  } catch (err) {
    console.error('generate-workout error:', err)
    return NextResponse.json({ error: 'Failed to generate workout' }, { status: 500 })
  }
}
