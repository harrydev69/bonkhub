import { UnifiedLoading } from "@/components/loading"

export default function Loading() {
  return (
    <UnifiedLoading 
      title="Loading Registration"
      description="Preparing account registration..."
      icon="activity"
      variant="page"
      size="md"
    />
  )
}
