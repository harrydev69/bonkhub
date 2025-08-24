import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function SocialFeed() {
  const feedItems = [
    {
      user: "@bonk_trader",
      content: "BONK is showing strong momentum! 🚀",
      time: "2m ago",
      sentiment: "Bullish",
    },
    {
      user: "@crypto_analyst",
      content: "Ecosystem growth looking promising with new partnerships",
      time: "5m ago",
      sentiment: "Positive",
    },
    {
      user: "@defi_degen",
      content: "Volume spike detected across BONK ecosystem tokens",
      time: "8m ago",
      sentiment: "Neutral",
    },
    {
      user: "@bonk_whale",
      content: "Major accumulation phase incoming? 👀",
      time: "12m ago",
      sentiment: "Bullish",
    },
  ]

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Live BONK Social Feed</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {feedItems.map((item, index) => (
          <div key={index} className="border-b border-border last:border-b-0 pb-3 last:pb-0">
            <div className="flex items-start justify-between mb-2">
              <span className="font-medium text-primary">{item.user}</span>
              <div className="flex items-center space-x-2">
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    item.sentiment === "Bullish"
                      ? "border-green-500 text-green-500"
                      : item.sentiment === "Positive"
                        ? "border-blue-500 text-blue-500"
                        : "border-yellow-500 text-yellow-500"
                  }`}
                >
                  {item.sentiment}
                </Badge>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            </div>
            <p className="text-sm text-foreground">{item.content}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
