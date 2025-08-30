import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
            <span className="text-lg font-bold text-primary-foreground">B</span>
          </div>
          <span className="text-xl font-bold">
            <span className="text-primary">BONK</span>hub
          </span>
          <span className="text-sm text-muted-foreground">powered by Analytics Network</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
            Dashboard
          </Link>
          <a 
            href="https://jup.ag/tokens/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            BUY BONK
          </a>
          <a 
            href="https://jup.ag/tokens/AKytoLENhxBLssBFPwGnpYnsY5kpKz328GU6pbGudaos" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            BUY NBONK
          </a>
          <a 
            href="https://bonk.fun/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            BONK.FUN
          </a>
          <Link href="/faq" className="text-sm font-medium hover:text-primary transition-colors">
            FAQ
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90" asChild>
            <Link href="/dashboard">Launch Dashboard →</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
