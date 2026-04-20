import SocialLinks from '@/components/SocialLinks'
import Robot3DLazy from '@/components/Robot3DLazy'

export default function Home() {
  return (
    <div className="min-h-screen pt-16 flex flex-col items-center justify-center px-6">
      <div
        className="w-full max-w-[480px] aspect-square"
        aria-hidden="true"
      >
        <Robot3DLazy />
      </div>
      <div className="text-center -mt-4 sm:-mt-6">
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
