export function PornhubNavigation() {
  const navItems = [
    "ANALYTICS",
    "TOKENOMICS", 
    "SENTIMENT",
    "LIVE DATA",
    "INSIGHTS",
    "DEFI NOW",
    "COMMUNITY",
    "CHARTS & GRAPHS",
  ]

  const topNavItems = [
    { text: "BUY BONK", href: "https://jup.ag/tokens/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" },
    { text: "BUY NBONK", href: "https://jup.ag/tokens/AKytoLENhxBLssBFPwGnpYnsY5kpKz328GU6pbGudaos" },
    { text: "BONK WELLNESS", href: "https://x.com/moonwalkfitness" },
    { text: "BONK.FUN", href: "https://bonk.fun/" },
    { text: "BONK Website", href: "https://bonkcoin.com/" },
    { text: "nBONK DAO", href: "https://t.me/nbonkdao" },
    { text: "FAQ", href: "/faq" },
  ]

  return (
    <nav className="bg-black border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center h-12 text-sm">
          <div className="flex items-center space-x-8 -ml-16">
            {topNavItems.map((item) => (
              <a 
                key={item.text} 
                href={item.href} 
                target={item.href.startsWith('http') ? "_blank" : "_self"}
                rel={item.href.startsWith('http') ? "noopener noreferrer" : ""}
                className="text-gray-300 hover:text-[#ff6b35] transition-colors duration-200 hover:scale-105 transform"
              >
                {item.text}
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
