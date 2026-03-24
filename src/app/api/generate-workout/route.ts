import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { feeling, type, distance, duration, notes } = await req.json()

  const prompt = `You are Strides, a thoughtful AI running coach. Generate a personalized workout based on these inputs:

- How the runner feels today: ${feeling}
- Run type desired: ${type}
- Target distance: ${distance} miles
- Target duration: ${duration} minutes
- Additional notes: ${notes || 'None'}

Respond ONLY with a valid JSON object, no markdown, no explanation, exactly this shape:
{
  "name": "A poetic 2-3 word run name (e.g. 'Autumn Threshold', 'Dusk Tempo')",
  "insight": "2-3 sentences of personalized coaching insight about this specific workout and why it fits the runner today. Be warm, specific, and encouraging. Mention the feeling state and type.",
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
  const workout = JSON.parse(text)

  return NextResponse.json(workout)
}
