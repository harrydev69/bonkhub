import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/5" />

      <div className="container relative px-4">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-6 bg-primary/10 text-primary border-primary/20">
            🚀 Now with AI-Powered Insights
          </Badge>

          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            The Ultimate
            <br />
            <span className="text-primary font-black">BONK</span>
            <br />
            Intelligence Platform
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Advanced analytics, real-time insights, and AI-powered predictions for the BONK ecosystem. Make smarter
            trading decisions with comprehensive market intelligence trusted by{" "}
            <span className="text-primary font-semibold">thousands of Bonkers</span>.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6">
              Launch Dashboard →
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 border-primary/20 hover:bg-primary/10 bg-transparent"
            >
              ▶ Watch Demo
            </Button>
          </div>
        </div>

        {/* Floating stats */}
        <div className="absolute right-8 top-1/4 hidden lg:block">
          <div className="rounded-lg bg-card border border-border p-4 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium">BONK +15.7%</span>
            </div>
          </div>
        </div>

        <div className="absolute left-8 top-2/3 hidden lg:block">
          <div className="rounded-lg bg-card border border-border p-4 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-sm font-medium">Bullish Signal</span>
            </div>
          </div>
        </div>

        <div className="absolute right-16 bottom-1/4 hidden lg:block">
          <div className="rounded-lg bg-card border border-border p-4 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-secondary" />
              <span className="text-sm font-medium">Alert Triggered</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
