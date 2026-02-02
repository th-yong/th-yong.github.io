import { getAllTags, getAllPosts } from '@/lib/markdown'
import TagsList from '@/components/TagsList'

export default function TagsPage() {
  const tags = getAllTags()
  const allPosts = getAllPosts()

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
          Tags
        </h1>
        {tags.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            No tags yet. Check back soon!
          </p>
        ) : (
          <TagsList tags={tags} allPosts={allPosts} />
        )}
      </div>
    </div>
  )
}

