'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Post } from '@/lib/markdown'

const CATEGORIES = [
  { id: 'all', name: 'All', display: '전체' },
  { id: 'agent', name: 'Agent', display: 'Agent' },
  { id: 'cloud', name: 'Cloud', display: 'Cloud' },
  { id: 'llm', name: 'LLM', display: 'LLM' },
  { id: 'vision', name: 'Vision', display: 'Vision' },
]

interface TechPostListProps {
  posts: Post[]
}

export default function TechPostList({ posts }: TechPostListProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter((post) => 
        post.categories?.some((cat) => 
          cat.toLowerCase() === selectedCategory.toLowerCase() || 
          cat.toLowerCase().includes(selectedCategory.toLowerCase())
        )
      )

  return (
    <>
      {/* 카테고리 탭 */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {category.display}
          </button>
        ))}
      </div>

      {filteredPosts.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">
          {selectedCategory === 'all' 
            ? 'No posts yet. Check back soon!'
            : `${CATEGORIES.find(c => c.id === selectedCategory)?.display} 카테고리에 포스트가 없습니다.`}
        </p>
      ) : (
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/tech/${post.slug}`}
              className="block p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {post.title}
                </h2>
                {post.categories && post.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 ml-4">
                    {post.categories.map((category) => (
                      <span
                        key={category}
                        className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded font-medium"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {post.date}
              </p>
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </>
  )
}

