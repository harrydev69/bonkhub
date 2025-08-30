import { PornhubNavigation } from "@/components/pornhub-navigation"
import { PornhubHeader } from "@/components/pornhub-header"
import { SupplyChart } from "@/components/supply-chart"
import { VolumeHeatmap } from "@/components/volume-heatmap"
import { SentimentTrendAnalysis } from "@/components/sentiment-trend-analysis"
import { SocialMentionWordCloud } from "@/components/social-mention-word-cloud"
import { WhaleMovementTracker } from "@/components/whale-movement-tracker"
import { WhalePortfolioTracker } from "@/components/whale-portfolio-tracker"

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <PornhubNavigation />
      <PornhubHeader />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Supply Analysis */}
          <SupplyChart />

          {/* Volume Heatmap */}
          <VolumeHeatmap />

          {/* Sentiment Trend Analysis */}
          <SentimentTrendAnalysis />

          {/* Social Mention Word Cloud */}
          <SocialMentionWordCloud />

          {/* Whale Movement Tracker */}
          <WhaleMovementTracker />

          {/* Whale Portfolio Tracker */}
          <WhalePortfolioTracker />
        </div>
      </main>
    </div>
  )
}
