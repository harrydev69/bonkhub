import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function QuickActions() {
  const actions = [
    { name: "AI Chat", icon: "🤖", description: "Access key features and tools" },
    { name: "Sentiment", icon: "📊", description: "Market sentiment analysis" },
    { name: "Mindshare", icon: "🧠", description: "Community insights" },
  ]

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>⚡</span>
          <span>Quick Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {actions.map((action) => (
          <Button
            key={action.name}
            variant="outline"
            className="w-full justify-start h-auto p-4 border-border hover:border-primary/50 hover:bg-primary/5 bg-transparent"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{action.icon}</span>
              <div className="text-left">
                <div className="font-medium">{action.name}</div>
                <div className="text-sm text-muted-foreground">{action.description}</div>
              </div>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
