"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface FloatingBackButtonProps {
  href?: string
  label?: string
}

export function FloatingBackButton({ href = "/indicadores", label = "Volver" }: FloatingBackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <Button
      onClick={handleClick}
      className="fixed bottom-6 left-6 z-50 shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-4 py-2 flex items-center gap-2 transition-all duration-300 hover:scale-105"
      size="lg"
    >
      <ArrowLeft className="h-5 w-5" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  )
}
