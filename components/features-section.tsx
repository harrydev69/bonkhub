import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function FeaturesSection() {
  const features = [
    {
      title: "Real-Time Analytics",
      description: "Live market data and instant insights for BONK and ecosystem tokens",
      icon: "📊",
    },
    {
      title: "AI-Powered Predictions",
      description: "Advanced machine learning algorithms for market trend analysis",
      icon: "🤖",
    },
    {
      title: "Social Sentiment",
      description: "Track community sentiment and social media buzz in real-time",
      icon: "💬",
    },
    {
      title: "Portfolio Tracking",
      description: "Comprehensive portfolio management with performance analytics",
      icon: "💼",
    },
    {
      title: "Custom Alerts",
      description: "Set personalized alerts for price movements and market events",
      icon: "🔔",
    },
    {
      title: "Advanced Charts",
      description: "Professional-grade charting tools with technical indicators",
      icon: "📈",
    },
  ]

  return (
    <section id="features" className="py-20">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Powerful Features for <span className="text-primary">BONK</span> Traders
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to make informed decisions in the BONK ecosystem
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card border-border hover:border-primary/50 transition-colors group">
              <CardHeader>
                <div className="text-3xl mb-2">{feature.icon}</div>
                <CardTitle className="group-hover:text-primary transition-colors">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
