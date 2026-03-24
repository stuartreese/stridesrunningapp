import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { goal, daysAvailable, currentFitness, notes } = await req.json()

  const prompt = `You are Strides, a thoughtful AI running coach. Generate a personalized weekly training plan.

Runner inputs:
- Weekly distance goal: ${goal} miles
- Days available to run: ${daysAvailable} days
- Current fitness level: ${currentFitness}
- Notes / goals: ${notes || 'None'}

Respond ONLY with valid JSON, no markdown, no explanation, exactly this shape:
{
  "weekInsight": "2 sentences summarizing the week's training philosophy and what the runner should focus on.",
  "weeklyGoalKm": ${Math.round(goal * 1.609)},
  "days": [
    {
      "dayShort": "MON",
      "dayFull": "Monday",
      "type": "run" | "rest" | "peak",
      "title": "Workout name",
      "detail": "One line description of the session",
      "badge": "Run" | "Rest" | "Peak"
    }
  ]
}

Generate exactly 7 days (Mon–Sun). Distribute runs across the ${daysAvailable} available days. Include at least 1 rest day. If daysAvailable >= 5, mark the longest run as type "peak". Keep it progressive — easy days before hard days, rest after peak. Badge should match type (Run/Rest/Peak).`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const plan = JSON.parse(text)

  return NextResponse.json(plan)
}
