import { UnifiedLoading } from "@/components/loading"

export default function Loading() {
  return (
    <UnifiedLoading 
      title="Loading Search"
      description="Preparing BONK search interface..."
      icon="search"
      variant="page"
      size="lg"
    />
  )
}
