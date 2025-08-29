import { UnifiedLoading } from "@/components/loading"

export default function Loading() {
  return (
    <UnifiedLoading 
      title="Loading Creator Profile"
      description="Fetching BONK creator information..."
      icon="activity"
      variant="page"
      size="lg"
    />
  )
}
