import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPostBySlug, getAllPosts } from '@/lib/markdown'
import MarkdownViewer from '@/components/MarkdownViewer'

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function TechPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/tech"
          className="text-blue-600 dark:text-blue-400 hover:underline mb-6 inline-block"
        >
          ← Back to Tech Posts
        </Link>
        <article>
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            {post.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {post.date}
          </p>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <MarkdownViewer content={post.content} />
        </article>
      </div>
    </div>
  )
}

