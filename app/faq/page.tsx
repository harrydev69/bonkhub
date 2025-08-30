"use client"

import Link from "next/link"
import { ArrowLeft, HelpCircle, BarChart3, Search, MessageSquare, TrendingUp, Users, Bell, Calendar, Headphones, Brain, Target, Activity, PieChart, LineChart, Globe, Zap } from "lucide-react"

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center justify-center w-10 h-10 bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-[#ff6b35] transition-all duration-200 rounded-lg border border-gray-700/50 hover:border-gray-600/50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          <div className="mt-4">
            <Link href="/dashboard" className="inline-block hover:opacity-80 transition-all">
              <span className="text-white text-3xl font-bold">Bonk</span>
              <span className="bg-[#ff6b35] text-black text-3xl font-bold px-3 py-1 rounded-lg ml-2">hub</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="relative">
          {/* Glowing border container */}
          <div className="absolute inset-0 border border-gray-700/50 rounded-lg shadow-[0_0_20px_rgba(255,107,53,0.3)] bg-gradient-to-br from-gray-900/20 to-black/40"></div>
          
          <div className="relative p-8">
            {/* Page Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#ff6b35] rounded-full mb-4">
                <HelpCircle className="w-8 h-8 text-black" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">Platform Guide & FAQ</h1>
              <p className="text-gray-400 text-lg">Everything you need to know about Bonkhub's analytics platform</p>
            </div>

            {/* Content */}
            <div className="space-y-8 text-gray-300 leading-relaxed">
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <BarChart3 className="w-6 h-6 mr-3 text-[#ff6b35]" />
                  Dashboard Overview
                </h2>
                <div className="space-y-3">
                  <p>
                    <strong className="text-white">Main Analytics Hub:</strong> The dashboard is your central command center for all 
                    cryptocurrency analytics. It provides real-time market data, performance metrics, and quick access to all platform features.
                  </p>
                  <p>
                    <strong className="text-white">Live Data Feed:</strong> Get instant updates on BONK and other cryptocurrency prices, 
                    trading volumes, and market movements with our live data integration.
                  </p>
                  <p>
                    <strong className="text-white">Customizable Widgets:</strong> Arrange and customize your dashboard with the analytics 
                    widgets that matter most to your trading strategy and research needs.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <Search className="w-6 h-6 mr-3 text-[#ff6b35]" />
                  Meta Search & Discovery
                </h2>
                <div className="space-y-3">
                  <p>
                    <strong className="text-white">Token Discovery:</strong> Search for any cryptocurrency by name, symbol, or contract address. 
                    Our platform supports both Solana and other blockchain tokens for comprehensive analysis.
                  </p>
                  <p>
                    <strong className="text-white">Social Sentiment Analysis:</strong> Discover what the community is saying about any token 
                    with real-time social media sentiment tracking and influencer analysis.
                  </p>
                  <p>
                    <strong className="text-white">Creator Insights:</strong> Find top influencers and creators discussing specific tokens, 
                    with detailed metrics on their reach, engagement, and influence scores.
                  </p>
                  <p>
                    <strong className="text-white">Live Social Feed:</strong> Monitor real-time social media posts and discussions about 
                    any cryptocurrency, filtered by relevance and influencer status.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <Brain className="w-6 h-6 mr-3 text-[#ff6b35]" />
                  AI Chat & Insights
                </h2>
                <div className="space-y-3">
                  <p>
                    <strong className="text-white">AI-Powered Analysis:</strong> Get intelligent insights and analysis on any cryptocurrency 
                    through our advanced AI chat interface. Ask questions about market trends, token performance, or trading strategies.
                  </p>
                  <p>
                    <strong className="text-white">Natural Language Queries:</strong> Ask questions in plain English like "What's driving 
                    BONK's price today?" or "Show me the top performing meme coins this week."
                  </p>
                  <p>
                    <strong className="text-white">Real-Time Intelligence:</strong> Our AI processes live market data, social sentiment, 
                    and technical indicators to provide comprehensive, up-to-date analysis.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <TrendingUp className="w-6 h-6 mr-3 text-[#ff6b35]" />
                  Sentiment Analysis
                </h2>
                <div className="space-y-3">
                  <p>
                    <strong className="text-white">Market Sentiment Tracking:</strong> Monitor the overall market mood and community 
                    sentiment for any cryptocurrency with our advanced sentiment analysis tools.
                  </p>
                  <p>
                    <strong className="text-white">Social Media Monitoring:</strong> Track mentions, discussions, and sentiment across 
                    Twitter, Reddit, Telegram, and other social platforms in real-time.
                  </p>
                  <p>
                    <strong className="text-white">Influencer Impact:</strong> See how top creators and influencers are affecting 
                    market sentiment and driving discussions around specific tokens.
                  </p>
                  <p>
                    <strong className="text-white">Sentiment Trends:</strong> Analyze how sentiment changes over time and correlate 
                    it with price movements and market events.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <Target className="w-6 h-6 mr-3 text-[#ff6b35]" />
                  Mindshare Tracking
                </h2>
                <div className="space-y-3">
                  <p>
                    <strong className="text-white">Community Mindshare:</strong> Measure how much attention and discussion any 
                    cryptocurrency is generating across the crypto community and social media.
                  </p>
                  <p>
                    <strong className="text-white">Trending Topics:</strong> Discover what's hot in the crypto space with our 
                    mindshare radar that tracks emerging trends and viral discussions.
                  </p>
                  <p>
                    <strong className="text-white">Comparative Analysis:</strong> Compare the mindshare of different tokens 
                    to understand which ones are gaining or losing community attention.
                  </p>
                  <p>
                    <strong className="text-white">Viral Content Detection:</strong> Identify content that's going viral 
                    and driving significant engagement around specific cryptocurrencies.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <Bell className="w-6 h-6 mr-3 text-[#ff6b35]" />
                  Alerts & Notifications
                </h2>
                <div className="space-y-3">
                  <p>
                    <strong className="text-white">Price Alerts:</strong> Set custom price alerts for any cryptocurrency 
                    to get notified when prices reach your target levels or experience significant movements.
                  </p>
                  <p>
                    <strong className="text-white">Social Media Alerts:</strong> Get notified when top influencers mention 
                    specific tokens or when viral content emerges around cryptocurrencies you're tracking.
                  </p>
                  <p>
                    <strong className="text-white">Market Event Alerts:</strong> Stay informed about major market events, 
                    regulatory changes, or significant developments that could impact your portfolio.
                  </p>
                  <p>
                    <strong className="text-white">Customizable Notifications:</strong> Choose how and when you want to 
                    be notified through email, push notifications, or SMS alerts.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <Activity className="w-6 h-6 mr-3 text-[#ff6b35]" />
                  Performance Analytics
                </h2>
                <div className="space-y-3">
                  <p>
                    <strong className="text-white">Token Performance Tracking:</strong> Monitor the performance of any 
                    cryptocurrency with detailed charts, metrics, and historical data analysis.
                  </p>
                  <p>
                    <strong className="text-white">Portfolio Analytics:</strong> Track your portfolio performance with 
                    advanced analytics including risk metrics, correlation analysis, and performance attribution.
                  </p>
                  <p>
                    <strong className="text-white">Market Comparison:</strong> Compare the performance of different 
                    tokens, sectors, or time periods to identify trends and opportunities.
                  </p>
                  <p>
                    <strong className="text-white">Technical Indicators:</strong> Access a comprehensive suite of 
                    technical analysis tools and indicators for informed trading decisions.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <PieChart className="w-6 h-6 mr-3 text-[#ff6b35]" />
                  Advanced Analytics
                </h2>
                <div className="space-y-3">
                  <p>
                    <strong className="text-white">Whale Tracking:</strong> Monitor large wallet movements and 
                    identify significant transactions that could impact market prices and sentiment.
                  </p>
                  <p>
                    <strong className="text-white">Correlation Analysis:</strong> Understand how different 
                    cryptocurrencies move in relation to each other and to broader market indices.
                  </p>
                  <p>
                    <strong className="text-white">Volume Analysis:</strong> Analyze trading volumes, liquidity 
                    patterns, and market depth to identify potential market manipulation or organic growth.
                  </p>
                  <p>
                    <strong className="text-white">Supply Metrics:</strong> Track token supply dynamics, 
                    including circulating supply, total supply, and supply distribution patterns.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <Calendar className="w-6 h-6 mr-3 text-[#ff6b35]" />
                  Calendar & Events
                </h2>
                <div className="space-y-3">
                  <p>
                    <strong className="text-white">Market Events Calendar:</strong> Stay ahead of important 
                    market events, token launches, network upgrades, and regulatory announcements.
                  </p>
                  <p>
                    <strong className="text-white">Earnings & Reports:</strong> Track upcoming earnings reports, 
                    token burns, staking rewards, and other significant events that could impact prices.
                  </p>
                  <p>
                    <strong className="text-white">Community Events:</strong> Discover upcoming AMAs, 
                    community calls, developer updates, and other events from the projects you follow.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <Headphones className="w-6 h-6 mr-3 text-[#ff6b35]" />
                  Audio Library
                </h2>
                <div className="space-y-3">
                  <p>
                    <strong className="text-white">Podcast Collection:</strong> Access a curated library of 
                    cryptocurrency podcasts, interviews, and educational content from industry experts.
                  </p>
                  <p>
                    <strong className="text-white">Audio Insights:</strong> Listen to market analysis, 
                    project reviews, and trading strategies in audio format for learning on the go.
                  </p>
                  <p>
                    <strong className="text-white">Community Content:</strong> Discover user-generated 
                    audio content, including community discussions, project reviews, and market commentary.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <Globe className="w-6 h-6 mr-3 text-[#ff6b35]" />
                  Ecosystem & News
                </h2>
                <div className="space-y-3">
                  <p>
                    <strong className="text-white">BONK Ecosystem Tracking:</strong> Monitor the entire 
                    BONK ecosystem including related tokens, projects, and community developments.
                  </p>
                  <p>
                    <strong className="text-white">News Aggregation:</strong> Stay informed with curated 
                    news from multiple sources, filtered by relevance and importance to your interests.
                  </p>
                  <p>
                    <strong className="text-white">Project Discovery:</strong> Discover new projects, 
                    partnerships, and developments within the broader cryptocurrency ecosystem.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <Zap className="w-6 h-6 mr-3 text-[#ff6b35]" />
                  Platform Features
                </h2>
                <div className="space-y-3">
                  <p>
                    <strong className="text-white">Real-Time Data:</strong> All data on our platform is 
                    updated in real-time, ensuring you have the most current information for your analysis.
                  </p>
                  <p>
                    <strong className="text-white">Mobile Optimized:</strong> Access all platform features 
                    on any device with our fully responsive, mobile-optimized interface.
                  </p>
                  <p>
                    <strong className="text-white">API Access:</strong> Developers can access our data 
                    through our comprehensive API for building custom applications and integrations.
                  </p>
                  <p>
                    <strong className="text-white">Export Capabilities:</strong> Download charts, data, 
                    and reports in multiple formats for offline analysis and sharing.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Getting Started</h2>
                <div className="space-y-3">
                  <p>To get the most out of Bonkhub:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Start with the Dashboard to get an overview of current market conditions</li>
                    <li>Use Meta Search to discover new tokens and analyze their social sentiment</li>
                    <li>Set up alerts for tokens you're interested in to stay informed</li>
                    <li>Explore the AI Chat for intelligent insights and analysis</li>
                    <li>Customize your dashboard with the analytics widgets you use most</li>
                    <li>Join our community to connect with other traders and analysts</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Need More Help?</h2>
                <p>
                  If you have specific questions about our platform features or need help getting started, 
                  please contact our support team at{" "}
                  <span className="text-[#ff6b35]">team@bonkhub.net</span> or join our community channels.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
