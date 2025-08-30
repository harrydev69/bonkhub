"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTab } from "./overview-tab";
import { SocialTab } from "./social-tab";
import { NewsTab } from "./news-tab";

import { useMetaSearchStore } from "./store";

export function ResultsTabs() {
  const {
    activeTab,
    setActiveTab,
    // Overview props
    tokenStats,
    creators,
    aiSummaryData,
    aiSummaryLoading,
    aiSummaryError,
    priceChartData,
    priceChartLoading,
    priceChartError,
    loading, // General loading state that covers creators loading
    // Social props
    socialPostsLoading,
    socialPostsQueryError,
    filteredSocialPosts,
    currentSocialPage,
    totalSocialPages,
    setCurrentSocialPage,
    // News props
    newsLoading,
    newsQueryError,
    filteredNews,
    currentNewsPage,
    totalNewsPages,
    setCurrentNewsPage,
    newsIsFallback,
  } = useMetaSearchStore();

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="space-y-6"
    >
      <div className="flex justify-center">
        <TabsList className="group/tabs bg-gray-900 border-gray-800 hover:shadow-[0_0_10px_rgba(255,107,53,0.2)] transition-all duration-500">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all duration-500 hover:scale-105"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="social"
            className="data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all duration-500 hover:scale-105"
          >
            Social
          </TabsTrigger>
          <TabsTrigger
            value="news"
            className="data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all duration-500 hover:scale-105"
          >
            News
          </TabsTrigger>

        </TabsList>
      </div>

      <TabsContent value="overview" className="space-y-6">
        <OverviewTab
          tokenStats={tokenStats}
          creators={creators}
          aiInsight={null} // TODO: Add AI insight data
          aiSummaryData={aiSummaryData}
          aiSummaryLoading={aiSummaryLoading}
          aiSummaryError={aiSummaryError}
          priceChartData={priceChartData}
          priceChartLoading={priceChartLoading}
          priceChartError={priceChartError}
          creatorsLoading={loading}
        />
      </TabsContent>

      <TabsContent value="social" className="space-y-6">
        <SocialTab
          socialPostsLoading={socialPostsLoading}
          socialPostsQueryError={socialPostsQueryError}
          filteredSocialPosts={filteredSocialPosts}
          currentPage={currentSocialPage}
          totalPages={totalSocialPages}
          onPageChange={setCurrentSocialPage}
        />
      </TabsContent>

      <TabsContent value="news" className="space-y-6">
        <NewsTab
          newsLoading={newsLoading}
          newsQueryError={newsQueryError}
          filteredNews={filteredNews}
          currentPage={currentNewsPage}
          totalPages={totalNewsPages}
          onPageChange={setCurrentNewsPage}
          isFallback={newsIsFallback}
        />
      </TabsContent>
    </Tabs>
  );
}