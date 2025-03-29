import type React from "react"
export const metadata = {
  title: "Foragidos da academia",
  description: "Acompanhe sua jornada fitness",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}



import './globals.css'