# Strides — AI Running Coach

A minimalist AI-powered running app built with Next.js and Claude.

## Features
- Step-by-step workout builder (feeling → type → distance/duration → notes)
- AI-generated personalized workout with session structure and coaching tips
- AI-generated weekly training plan based on your goals
- Clean, mobile-first design

---

## Local Development

### 1. Install dependencies
```bash
npm install
```

### 2. Add your Anthropic API key
```bash
cp .env.local.example .env.local
```
Then edit `.env.local` and paste your API key from https://console.anthropic.com

### 3. Run the dev server
```bash
npm run dev
```
Open http://localhost:3000

---

## Deploy to Vercel

### One-time setup
1. Push this project to a GitHub repository
2. Go to https://vercel.com and sign in with GitHub
3. Click **"Add New Project"** → import your repository
4. In the **Environment Variables** section, add:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your key from console.anthropic.com
5. Click **Deploy**

Your app will be live at `your-project.vercel.app` within ~60 seconds.

### Subsequent deploys
Every `git push` to your main branch auto-deploys — no action needed.

---

## Tech Stack
- **Next.js 14** (App Router)
- **TypeScript**
- **Anthropic Claude** (claude-sonnet-4) for workout + plan generation
- **CSS Modules** for styling
- Hosted on **Vercel**
