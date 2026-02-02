'use client'

import { useState } from 'react'
import { IoClose } from 'react-icons/io5'
import MarkdownViewer from './MarkdownViewer'

interface AdminModalProps {
  onClose: () => void
}

export default function AdminModal({ onClose }: AdminModalProps) {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [date, setDate] = useState('')
  const [tags, setTags] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [content, setContent] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [viewMode, setViewMode] = useState<'write' | 'preview'>('write')
  const [loadLoading, setLoadLoading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  const availableCategories = ['Agent', 'Cloud', 'LLM', 'Vision']

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (data.valid) {
        setIsAuthenticated(true)
      } else {
        setError('Invalid password')
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handlePostSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitLoading(true)
    setError('')
    setSubmitSuccess(false)

    try {
      const tagArray = tags.split(',').map((t: string) => t.trim()).filter((t: string) => t)

      const response = await fetch('/api/admin/create-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
          title,
          slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
          date: date || undefined,
          tags: tagArray,
          categories: categories,
          content,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSubmitSuccess(true)
        setIsEditMode(false)
        // 폼 초기화
        setTitle('')
        setSlug('')
        setDate('')
        setTags('')
        setCategories([])
        setContent('')
        setTimeout(() => {
          setSubmitSuccess(false)
        }, 3000)
      } else {
        setError(data.error || 'Failed to create post')
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Admin Panel
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <IoClose size={24} />
          </button>
        </div>

        <div className="p-6">
          {!isAuthenticated ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              {error && (
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePostSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <div className="flex items-end gap-2 mb-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Slug (optional, auto-generated from title if empty)
                    </label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="my-post-title"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!slug) {
                        setError('Please enter a slug to load post')
                        return
                      }
                      setLoadLoading(true)
                      setError('')
                      try {
                        const response = await fetch('/api/admin/load-post', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ password, slug }),
                        })
                        const data = await response.json()
                        if (response.ok && data.success) {
                          setTitle(data.post.title)
                          setSlug(data.post.slug)
                          setDate(data.post.date || new Date().toISOString().split('T')[0])
                          setTags(data.post.tags)
                          setCategories(data.post.categories)
                          setContent(data.post.content)
                          setIsEditMode(true)
                          setError('')
                        } else {
                          setError(data.error || 'Failed to load post')
                        }
                      } catch (err) {
                        setError('An error occurred')
                      } finally {
                        setLoadLoading(false)
                      }
                    }}
                    disabled={loadLoading || !slug}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                  >
                    {loadLoading ? 'Loading...' : 'Load Post'}
                  </button>
                </div>
                {isEditMode && (
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Editing existing post. Changes will update the post.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date (optional, defaults to today)
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {availableCategories.map((category) => (
                    <label
                      key={category}
                      className="flex items-center space-x-2 cursor-pointer p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={categories.includes(category)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCategories([...categories, category])
                          } else {
                            setCategories(categories.filter((c) => c !== category))
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="react, nextjs, typescript"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Content (Markdown) *
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setViewMode('write')}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        viewMode === 'write'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('preview')}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        viewMode === 'preview'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      Preview
                    </button>
                  </div>
                </div>
                
                {viewMode === 'write' ? (
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={15}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
                    required
                  />
                ) : (
                  <div className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 min-h-[400px] max-h-[600px] overflow-y-auto">
                    {content ? (
                      <MarkdownViewer content={content} />
                    ) : (
                      <p className="text-gray-400 dark:text-gray-500 italic">
                        미리보기를 보려면 마크다운을 작성해주세요.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {error && (
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              )}

              {submitSuccess && (
                <p className="text-green-600 dark:text-green-400 text-sm">
                  Post created successfully!
                </p>
              )}

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitLoading 
                  ? (isEditMode ? 'Updating...' : 'Creating...') 
                  : (isEditMode ? 'Update Post' : 'Create Post')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

