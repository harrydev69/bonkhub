// Unified Loading System for BonkHub
// Standardized loading components across all pages

export { UnifiedLoading, BonkLoadingStates } from './unified-loading'
export { CardSkeleton, CardSkeletonGrid } from './card-skeleton'  
export { ChartLoading, ChartLoadingVariants } from './chart-loading'

// Usage examples:
/*
// Page loading
import { BonkLoadingStates } from '@/components/loading'
return BonkLoadingStates.performance

// Chart loading  
import { ChartLoadingVariants } from '@/components/loading'
return ChartLoadingVariants.priceChart

// Custom loading
import { UnifiedLoading } from '@/components/loading'
return <UnifiedLoading title="Custom Title" variant="chart" />

// Card skeletons
import { CardSkeletonGrid } from '@/components/loading'
return <CardSkeletonGrid count={8} showTrend={true} />
*/
