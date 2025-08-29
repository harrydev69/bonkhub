import { UnifiedLoading } from "@/components/loading"

export default function Loading() {
  return (
    <UnifiedLoading 
      title="Loading Profile"
      description="Fetching user profile information..."
      icon="activity"
      variant="page"
      size="md"
    />
  )
}
