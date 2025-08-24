import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-primary/10 via-background to-secondary/10">
      <div className="container px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Join the <span className="text-primary">BONK</span> Revolution?
        </h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Get started with Bonkhub today and unlock the power of advanced analytics for your trading journey.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-primary hover:bg-primary/90 px-8 py-6">
            Start Free Trial
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-primary/20 hover:bg-primary/10 px-8 py-6 bg-transparent"
          >
            View Pricing
          </Button>
        </div>
      </div>
    </section>
  )
}
