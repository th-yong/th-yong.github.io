import SocialLinks from '@/components/SocialLinks'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Tae-Hoon Yong
        </h1>
        <p className="text-2xl text-gray-600 dark:text-gray-400 mb-8">
          AI Engineer
        </p>
        <SocialLinks />
      </div>
    </div>
  )
}

