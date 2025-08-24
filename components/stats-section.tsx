import { Card, CardContent } from "@/components/ui/card"

export function StatsSection() {
  const stats = [
    { label: "Active Users", value: "50K+", change: "+12%" },
    { label: "Data Points", value: "2.5M", change: "+8%" },
    { label: "Predictions Made", value: "100K+", change: "+25%" },
    { label: "Accuracy Rate", value: "94.2%", change: "+2%" },
  ]

  return (
    <section className="py-16 bg-card/50">
      <div className="container px-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-card/80 border-border/50 hover:bg-card transition-colors">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground mb-2">{stat.label}</div>
                <div className="text-xs text-green-400">{stat.change}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
