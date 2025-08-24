import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export function EcosystemTable() {
  const ecosystemTokens = [
    {
      rank: 1,
      name: "Bonk",
      symbol: "BONK",
      price: "$0.000034",
      change: "+15.70%",
      marketCap: "$2.34B",
      volume: "$145.00M",
      positive: true,
    },
    {
      rank: 2,
      name: "Useless",
      symbol: "USELESS",
      price: "$0.000000234",
      change: "+23.40%",
      marketCap: "$45.00M",
      volume: "$2.30M",
      positive: true,
    },
    {
      rank: 3,
      name: "Hosico",
      symbol: "HOSICO",
      price: "$0.000006",
      change: "-8.20%",
      marketCap: "$12.00M",
      volume: "$890.00K",
      positive: false,
    },
    {
      rank: 4,
      name: "Samoyedcoin",
      symbol: "SAMO",
      price: "$0.0234",
      change: "+12.10%",
      marketCap: "$78.00M",
      volume: "$4.50M",
      positive: true,
    },
    {
      rank: 5,
      name: "Cope",
      symbol: "COPE",
      price: "$0.0456",
      change: "-5.70%",
      marketCap: "$34.00M",
      volume: "$1.20M",
      positive: false,
    },
    {
      rank: 6,
      name: "Rope",
      symbol: "ROPE",
      price: "$0.000123",
      change: "+18.90%",
      marketCap: "$23.00M",
      volume: "$890.00K",
      positive: true,
    },
    {
      rank: 7,
      name: "Cheems",
      symbol: "CHEEMS",
      price: "$0.007890",
      change: "+7.30%",
      marketCap: "$56.00M",
      volume: "$2.10M",
      positive: true,
    },
    {
      rank: 8,
      name: "Doge Killer",
      symbol: "LEASH",
      price: "$234.5600",
      change: "-3.40%",
      marketCap: "$89.00M",
      volume: "$3.40M",
      positive: false,
    },
    {
      rank: 9,
      name: "FLOKI",
      symbol: "FLOKI",
      price: "$0.000234",
      change: "+9.80%",
      marketCap: "$67.00M",
      volume: "$2.80M",
      positive: true,
    },
    {
      rank: 10,
      name: "Shiba Predator",
      symbol: "QOM",
      price: "$0.000000890",
      change: "+14.20%",
      marketCap: "$15.00M",
      volume: "$670.00K",
      positive: true,
    },
  ]

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>BONK Fun Ecosystem</span>
          <Badge variant="outline" className="text-primary border-primary">
            Top 10 tokens from CoinMarketCap BONK Fun ecosystem
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Token</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>24h Change</TableHead>
              <TableHead>Market Cap</TableHead>
              <TableHead>24h Volume</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ecosystemTokens.map((token) => (
              <TableRow key={token.rank} className="hover:bg-muted/50">
                <TableCell>
                  <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                    #{token.rank}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{token.symbol[0]}</span>
                    </div>
                    <div>
                      <div className="font-medium">{token.name}</div>
                      <div className="text-sm text-muted-foreground">{token.symbol}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono">{token.price}</TableCell>
                <TableCell>
                  <Badge
                    variant={token.positive ? "default" : "destructive"}
                    className={token.positive ? "bg-green-500 text-white" : "bg-red-500 text-white"}
                  >
                    {token.change}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono">{token.marketCap}</TableCell>
                <TableCell className="font-mono">{token.volume}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
