"use client"

import Link from "next/link"
import { ArrowLeft, AlertTriangle, TrendingDown, DollarSign, Clock, Shield, Info } from "lucide-react"

export default function RiskDisclosurePage() {
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
            <Link href="/" className="inline-block hover:opacity-80 transition-all">
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
                <AlertTriangle className="w-8 h-8 text-black" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">Risk Disclosure</h1>
              <p className="text-gray-400 text-lg">Understanding the risks of cryptocurrency trading</p>
            </div>

            {/* Content */}
            <div className="space-y-8 text-gray-300 leading-relaxed">
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <AlertTriangle className="w-6 h-6 mr-3 text-[#ff6b35]" />
                  Important Disclaimer
                </h2>
                <div className="space-y-3">
                  <p>
                    <strong className="text-white">Not Financial Advice:</strong> BonkHub is an analytics platform that provides 
                    cryptocurrency market data, trading analytics, and blockchain insights. We are not financial advisors, 
                    and our platform does not constitute financial advice.
                  </p>
                  <p>
                    <strong className="text-white">Information Only:</strong> All data, charts, and analysis presented on our 
                    platform are for informational purposes only. They should not be considered as recommendations to buy, 
                    sell, or hold any cryptocurrency.
                  </p>
                  <p>
                    <strong className="text-white">Do Your Own Research:</strong> Always conduct thorough research and consider 
                    consulting with qualified financial professionals before making any investment decisions.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <TrendingDown className="w-6 h-6 mr-3 text-[#ff6b35]" />
                  Cryptocurrency Trading Risks
                </h2>
                <div className="space-y-3">
                  <p>
                    <strong className="text-white">High Volatility:</strong> Cryptocurrency markets are extremely volatile 
                    and can experience significant price swings in short periods. Prices can rise or fall dramatically, 
                    potentially resulting in substantial losses.
                  </p>
                  <p>
                    <strong className="text-white">Market Risk:</strong> The value of cryptocurrencies can be affected by 
                    various factors including market sentiment, regulatory changes, technological developments, and global 
                    economic conditions.
                  </p>
                  <p>
                    <strong className="text-white">Liquidity Risk:</strong> Some cryptocurrencies may have limited trading 
                    volume, making it difficult to buy or sell large amounts without significantly affecting the price.
                  </p>
                  <p>
                    <strong className="text-white">Regulatory Risk:</strong> Cryptocurrency regulations vary by jurisdiction 
                    and can change rapidly, potentially affecting the value and legality of certain digital assets.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <DollarSign className="w-6 h-6 mr-3 text-[#ff6b35]" />
                  Investment Considerations
                </h2>
                <div className="space-y-3">
                  <p>
                    <strong className="text-white">Capital Loss:</strong> You can lose some or all of your invested capital. 
                    Never invest more than you can afford to lose.
                  </p>
                  <p>
                    <strong className="text-white">Past Performance:</strong> Historical performance does not guarantee future 
                    results. Market conditions change, and past trends may not continue.
                  </p>
                  <p>
                    <strong className="text-white">Diversification:</strong> Consider diversifying your investments across 
                    different asset classes to manage risk effectively.
                  </p>
                  <p>
                    <strong className="text-white">Time Horizon:</strong> Cryptocurrency investments may require a long-term 
                    perspective to weather market volatility and achieve potential returns.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <Clock className="w-6 h-6 mr-3 text-[#ff6b35]" />
                  Platform-Specific Risks
                </h2>
                <div className="space-y-3">
                  <p>
                    <strong className="text-white">Data Accuracy:</strong> While we strive for accuracy, market data may 
                    have delays or inaccuracies. Always verify information from multiple sources.
                  </p>
                  <p>
                    <strong className="text-white">Technical Issues:</strong> Platform availability and performance may be 
                    affected by technical issues, maintenance, or external factors beyond our control.
                  </p>
                  <p>
                    <strong className="text-white">AI Analysis Limitations:</strong> Our AI-powered insights are based on 
                    historical data and patterns, but they cannot predict future market movements with certainty.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <Shield className="w-6 h-6 mr-3 text-[#ff6b35]" />
                  Risk Management
                </h2>
                <div className="space-y-3">
                  <p>To manage your trading risks effectively:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Set clear investment goals and risk tolerance levels</li>
                    <li>Use stop-loss orders to limit potential losses</li>
                    <li>Monitor your positions regularly</li>
                    <li>Keep emotions in check and avoid impulsive decisions</li>
                    <li>Consider using only a small portion of your portfolio for crypto</li>
                    <li>Stay informed about market developments and regulatory changes</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <Info className="w-6 h-6 mr-3 text-[#ff6b35]" />
                  Your Responsibility
                </h2>
                <div className="space-y-3">
                  <p>
                    By using BonkHub, you acknowledge that you understand these risks and accept full responsibility 
                    for your investment decisions. You agree that BonkHub, its employees, and affiliates are not 
                    liable for any losses or damages resulting from your use of our platform or reliance on our data.
                  </p>
                  <p>
                    <strong className="text-white">Seek Professional Advice:</strong> If you are unsure about any 
                    investment decision, consult with a qualified financial advisor, accountant, or legal professional.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Contact Information</h2>
                <p>
                  If you have questions about this risk disclosure or need clarification on any risks, please contact us at{" "}
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
