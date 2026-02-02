'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Post } from '@/lib/markdown'

interface TagsListProps {
  tags: string[]
  allPosts: Post[]
}

export default function TagsList({ tags, allPosts }: TagsListProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const postsByTag = selectedTag
    ? allPosts.filter((post) => post.tags?.includes(selectedTag))
    : []

  return (
    <>
      {selectedTag ? (
        <>
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setSelectedTag(null)}
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
            >
              ← Back to Tags
            </button>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              #{selectedTag} ({postsByTag.length})
            </h2>
          </div>
          {postsByTag.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">
              No posts found for this tag.
            </p>
          ) : (
            <div className="space-y-3">
              {postsByTag.map((post) => (
                <Link
                  key={post.slug}
                  href={`/tech/${post.slug}`}
                  className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                >
                  <h3 className="text-xl font-medium mb-1 text-gray-900 dark:text-white">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {post.date}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => {
            const postCount = allPosts.filter((post) => post.tags?.includes(tag)).length
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors text-sm font-medium"
              >
                #{tag} ({postCount})
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}

