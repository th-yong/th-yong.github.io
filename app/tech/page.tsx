import { getAllPosts } from '@/lib/markdown'
import TechPostList from '@/components/TechPostList'

export default function TechPage() {
  const posts = getAllPosts()

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
          Tech Posts
        </h1>
        <TechPostList posts={posts} />
      </div>
    </div>
  )
}

