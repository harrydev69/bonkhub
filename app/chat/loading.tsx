import { UnifiedLoading } from "@/components/loading"

export default function Loading() {
  return (
    <UnifiedLoading 
      title="Loading Chat"
      description="Connecting to BONK community chat..."
      icon="activity"
      variant="page"
      size="lg"
    />
  )
}
