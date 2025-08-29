import { UnifiedLoading } from "@/components/loading"

export default function Loading() {
  return (
    <UnifiedLoading 
      title="Loading Mindshare Analytics"
      description="Processing BONK mindshare data..."
      icon="brain"
      variant="page"
      size="lg"
    />
  )
}
