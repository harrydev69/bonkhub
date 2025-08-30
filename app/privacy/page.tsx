"use client"

import Link from "next/link"
import { ArrowLeft, Shield, Eye, Database, Lock, Users } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link 
            href="/" 
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
                <Shield className="w-8 h-8 text-black" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
              <p className="text-gray-400 text-lg">Last updated: January 2025</p>
            </div>

            {/* Content */}
            <div className="space-y-8 text-gray-300 leading-relaxed">
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <Eye className="w-6 h-6 mr-3 text-[#ff6b35]" />
                  Information We Collect
                </h2>
                <div className="space-y-3">
                  <p>
                    <strong className="text-white">Analytics Data:</strong> BonkHub collects and processes cryptocurrency market data, 
                    trading analytics, and blockchain information to provide comprehensive insights for our users.
                  </p>
                  <p>
                    <strong className="text-white">User Account Information:</strong> When you create an account, we collect your email address, 
                    password (encrypted), and basic profile information to provide personalized analytics services.
                  </p>
                  <p>
                    <strong className="text-white">Usage Analytics:</strong> We collect information about how you interact with our platform, 
                    including which analytics you view, search queries, and feature usage to improve our services.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <Database className="w-6 h-6 mr-3 text-[#ff6b35]" />
                  How We Use Your Information
                </h2>
                <div className="space-y-3">
                  <p>
                    <strong className="text-white">Analytics Platform:</strong> Your information helps us provide real-time cryptocurrency 
                    analytics, market insights, and trading data visualization through our advanced platform.
                  </p>
                  <p>
                    <strong className="text-white">Service Improvement:</strong> We analyze usage patterns to enhance our analytics tools, 
                    add new features, and optimize the user experience for cryptocurrency traders and analysts.
                  </p>
                  <p>
                    <strong className="text-white">Personalization:</strong> We use your preferences to customize your dashboard, 
                    recommend relevant analytics, and provide tailored market insights.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <Lock className="w-6 h-6 mr-3 text-[#ff6b35]" />
                  Data Security
                </h2>
                <div className="space-y-3">
                  <p>
                    <strong className="text-white">Encryption:</strong> All sensitive data is encrypted using industry-standard protocols 
                    to protect your personal information and trading preferences.
                  </p>
                  <p>
                    <strong className="text-white">Secure Infrastructure:</strong> BonkHub operates on secure cloud infrastructure with 
                    regular security audits and monitoring to ensure data protection.
                  </p>
                  <p>
                    <strong className="text-white">Access Control:</strong> We implement strict access controls and authentication 
                    measures to prevent unauthorized access to your analytics data and account information.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <Users className="w-6 h-6 mr-3 text-[#ff6b35]" />
                  Data Sharing
                </h2>
                <div className="space-y-3">
                  <p>
                    <strong className="text-white">Third-Party Services:</strong> We may share data with trusted third-party services 
                    that help us provide analytics, market data, and platform functionality.
                  </p>
                  <p>
                    <strong className="text-white">Legal Requirements:</strong> We may disclose information if required by law or to 
                    protect the rights and safety of BonkHub users and the platform.
                  </p>
                  <p>
                    <strong className="text-white">No Sale of Personal Data:</strong> BonkHub does not sell, trade, or rent your 
                    personal information to third parties for marketing purposes.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Your Rights</h2>
                <div className="space-y-3">
                  <p>You have the right to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Access and review your personal data</li>
                    <li>Update or correct your account information</li>
                    <li>Delete your account and associated data</li>
                    <li>Opt-out of certain data collection practices</li>
                    <li>Export your analytics data and preferences</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
                <p>
                  If you have questions about this Privacy Policy or our data practices, please contact us at{" "}
                  <span className="text-[#ff6b35]">team@bonkhub.net</span>
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
