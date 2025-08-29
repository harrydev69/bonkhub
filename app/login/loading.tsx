import { UnifiedLoading } from "@/components/loading"

export default function Loading() {
  return (
    <UnifiedLoading 
      title="Loading Login"
      description="Preparing secure login interface..."
      icon="activity"
      variant="page"
      size="md"
    />
  )
}
