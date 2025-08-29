import { UnifiedLoading } from "@/components/loading"

export default function Loading() {
  return (
    <UnifiedLoading 
      title="Loading Calendar"
      description="Fetching BONK ecosystem events..."
      icon="calendar"
      variant="page"
      size="lg"
    />
  )
}
