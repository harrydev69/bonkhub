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

  return (
    <nav className="bg-black border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-12 text-sm">
          <div className="flex items-center space-x-8">
            {["BONK DATA", "MEME CENTRO", "CRYPTO WELLNESS", "INSIGHTS", "SITES", "SHOP", "TRUST & SAFETY"].map(
              (item) => (
                <a key={item} href="#" className="text-gray-300 hover:text-white transition-colors">
                  {item}
                </a>
              ),
            )}
          </div>
          <div className="text-gray-300">EN</div>
        </div>
      </div>
    </nav>
  )
}
