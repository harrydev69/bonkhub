"use client"

import Link from "next/link"
import { ArrowLeft, FileText, BarChart3, Shield, Users, AlertTriangle, CheckCircle } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-gray-400 hover:text-[#ff6b35] transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
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
                <FileText className="w-8 h-8 text-black" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
              <p className="text-gray-400 text-lg">Last updated: January 2025</p>
            </div>

            {/* Content */}
            <div className="space-y-8 text-gray-300 leading-relaxed">
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <BarChart3 className="w-6 h-6 mr-3 text-[#ff6b35]" />
                  About BonkHub
                </h2>
                <div className="space-y-3">
                  <p>
                    <strong className="text-white">Platform Overview:</strong> BonkHub is an advanced analytics intelligence platform 
                    designed to provide comprehensive cryptocurrency market insights, trading analytics, and blockchain data visualization.
                  </p>
                  <p>
                    <strong className="text-white">Core Features:</strong> Our platform offers real-time market data, sentiment analysis, 
                    whale activity tracking, DeFi metrics, and comprehensive BONK ecosystem analytics to empower informed trading decisions.
                  </p>
                  <p>
                    <strong className="text-white">Target Users:</strong> BonkHub serves cryptocurrency traders, analysts, researchers, 
                    and enthusiasts who require professional-grade analytics tools and market intelligence.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <CheckCircle className="w-6 h-6 mr-3 text-[#ff6b35]" />
                  Acceptable Use
                </h2>
                <div className="space-y-3">
                  <p>You may use BonkHub to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Access real-time cryptocurrency market analytics and data</li>
                    <li>Analyze trading patterns and market sentiment</li>
                    <li>Track whale movements and large transactions</li>
                    <li>Monitor DeFi protocols and liquidity metrics</li>
                    <li>Research BONK ecosystem projects and tokens</li>
                    <li>Create personalized dashboards and watchlists</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <AlertTriangle className="w-6 h-6 mr-3 text-[#ff6b35]" />
                  Prohibited Activities
                </h2>
                <div className="space-y-3">
                  <p>You may NOT use BonkHub to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Manipulate market data or analytics</li>
                    <li>Attempt to reverse engineer our platform</li>
                    <li>Distribute false or misleading market information</li>
                    <li>Use automated tools to scrape or overload our services</li>
                    <li>Violate any applicable laws or regulations</li>
                    <li>Infringe on intellectual property rights</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <Shield className="w-6 h-6 mr-3 text-[#ff6b35]" />
                  Data and Analytics
                </h2>
                <div className="space-y-3">
                  <p>
                    <strong className="text-white">Market Data:</strong> BonkHub provides real-time cryptocurrency market data, 
                    including price charts, volume analysis, and trading metrics from reliable sources.
                  </p>
                  <p>
                    <strong className="text-white">Analytics Tools:</strong> Our platform offers advanced analytics including 
                    sentiment analysis, whale tracking, DeFi metrics, and ecosystem insights.
                  </p>
                  <p>
                    <strong className="text-white">Data Accuracy:</strong> While we strive for accuracy, cryptocurrency markets 
                    are volatile and data may have delays. Always verify information before making trading decisions.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <Users className="w-6 h-6 mr-3 text-[#ff6b35]" />
                  User Accounts
                </h2>
                <div className="space-y-3">
                  <p>
                    <strong className="text-white">Account Creation:</strong> You must provide accurate information when creating 
                    your BonkHub account and maintain the security of your login credentials.
                  </p>
                  <p>
                    <strong className="text-white">Account Responsibility:</strong> You are responsible for all activities 
                    conducted through your account and must notify us immediately of any unauthorized access.
                  </p>
                  <p>
                    <strong className="text-white">Account Termination:</strong> We reserve the right to suspend or terminate 
                    accounts that violate these terms or engage in fraudulent activities.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Intellectual Property</h2>
                <div className="space-y-3">
                  <p>
                    <strong className="text-white">Platform Rights:</strong> BonkHub and its content, including analytics tools, 
                    data visualizations, and platform design, are protected by intellectual property laws.
                  </p>
                  <p>
                    <strong className="text-white">User Content:</strong> You retain rights to your personal data and analytics 
                    preferences, while we maintain rights to aggregated, anonymized usage data.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Limitation of Liability</h2>
                <div className="space-y-3">
                  <p>
                    <strong className="text-white">Trading Decisions:</strong> BonkHub provides analytics and market data for 
                    informational purposes only. We are not responsible for trading decisions or financial losses.
                  </p>
                  <p>
                    <strong className="text-white">Service Availability:</strong> While we strive for 99.9% uptime, we cannot 
                    guarantee uninterrupted access to our analytics platform.
                  </p>
                  <p>
                    <strong className="text-white">Data Reliability:</strong> Market data and analytics are subject to market 
                    conditions and may not always reflect current market realities.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Contact Information</h2>
                <p>
                  For questions about these Terms of Service or our platform, please contact us at{" "}
                  <span className="text-[#ff6b35]">legal@bonkhub.com</span>
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
