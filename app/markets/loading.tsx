import { UnifiedLoading } from "@/components/loading"

export default function Loading() {
  return (
    <UnifiedLoading 
      title="Loading Markets"
      description="Fetching BONK market data and trading pairs..."
      icon="trending"
      variant="page"
      size="lg"
    />
  )
}
