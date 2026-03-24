import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Strides — Your AI Running Coach',
  description: 'Personalized AI-generated workouts for every run.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
