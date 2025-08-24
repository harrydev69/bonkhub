import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export function DashboardSidebar() {
  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", badge: "Live", active: true },
    { name: "AI Chat", href: "/ai-chat", badge: "AI" },
    { name: "Meta Search", href: "/meta-search", badge: "1.2K" },
    { name: "Sentiment", href: "/sentiment", badge: "Bullish" },
    { name: "Mindshare", href: "/mindshare", badge: "83" },
    { name: "Alerts", href: "/alerts", badge: "3" },
    { name: "Narrative", href: "/narrative", badge: "Hot" },
    { name: "Analytics", href: "/analytics", badge: "Pro" },
    { name: "Calendar", href: "/calendar" },
    { name: "Audio Library", href: "/audio-library" },
  ]

  const quickLinks = [
    { name: "Buy nBONK", href: "/buy-nbonk" },
    { name: "Buy BONK", href: "/buy-bonk" },
    { name: "BONK Website", href: "/bonk-website" },
    { name: "LetsBonk.fun Ecosystem", href: "/letsbonk-ecosystem" },
    { name: "BONK on CoinGecko", href: "/bonk-coingecko" },
    { name: "Take Tour", href: "/tour" },
    { name: "Profile", href: "/profile" },
    { name: "Settings", href: "/settings" },
  ]

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-sidebar-primary">
            <span className="text-lg font-bold text-sidebar-primary-foreground">B</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-sidebar-foreground">
              <span className="text-sidebar-primary">BONK</span>hub
            </div>
            <div className="text-xs text-sidebar-foreground/60">Analytics Platform</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          <div className="text-xs font-medium text-sidebar-foreground/60 mb-3">Navigation</div>
          <nav className="space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                  item.active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                }`}
              >
                <span>{item.name}</span>
                {item.badge && (
                  <Badge
                    variant={item.badge === "Live" ? "default" : "secondary"}
                    className={`text-xs ${
                      item.badge === "Live"
                        ? "bg-green-500 text-white"
                        : item.badge === "AI"
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : item.badge === "Bullish"
                            ? "bg-green-500 text-white"
                            : item.badge === "Hot"
                              ? "bg-red-500 text-white"
                              : item.badge === "Pro"
                                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                : "bg-sidebar-accent text-sidebar-accent-foreground"
                    }`}
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Quick Links */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs font-medium text-sidebar-foreground/60 mb-3">Quick Links</div>
          <nav className="space-y-1">
            {quickLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
