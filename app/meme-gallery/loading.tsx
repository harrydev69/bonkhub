export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">Loading BONK Meme Gallery...</p>
        <p className="text-gray-400 text-sm">Preparing the ultimate meme collection</p>
      </div>
    </div>
  )
}
