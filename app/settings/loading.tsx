import { UnifiedLoading } from "@/components/loading"

export default function Loading() {
  return (
    <UnifiedLoading 
      title="Loading Settings"
      description="Preparing user settings interface..."
      icon="activity"
      variant="page"
      size="md"
    />
  )
}
