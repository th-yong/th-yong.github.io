'use client'

import { useState } from 'react'
import { IoClose } from 'react-icons/io5'
import MarkdownViewer from './MarkdownViewer'
import { createPostOnGitHubClient, getPostFromGitHubClient } from '@/lib/client-github'
import { generateBlogPost, type AzureOpenAIConfig } from '@/lib/azure-openai'

interface AdminModalProps {
  onClose: () => void
}

export default function AdminModal({ onClose }: AdminModalProps) {
  const [password, setPassword] = useState('')
  const [githubToken, setGithubToken] = useState(
    process.env.NEXT_PUBLIC_REPO_TOKEN || ''
  )
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
  const [skipCi, setSkipCi] = useState(false)

  const [aiGenerateMode, setAiGenerateMode] = useState(false)
  const [techName, setTechName] = useState('')
  const [techDescription, setTechDescription] = useState('')
  const [techAdditionalContext, setTechAdditionalContext] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const availableCategories = ['Agent', 'Cloud', 'LLM', 'Vision']

  const azureOpenAIConfig: AzureOpenAIConfig = {
    endpoint: process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT || '',
    apiKey: process.env.NEXT_PUBLIC_AZURE_OPENAI_API_KEY || '',
    deployment: process.env.NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT || '',
    apiVersion: process.env.NEXT_PUBLIC_AZURE_OPENAI_API_VERSION || '2024-02-15-preview',
  }
  const hasAzureOpenAIConfig =
    !!azureOpenAIConfig.endpoint?.trim() &&
    !!azureOpenAIConfig.apiKey?.trim() &&
    !!azureOpenAIConfig.deployment?.trim()
  
  // 환경 변수에서 가져오기 (빌드 타임에 주입됨)
  // Next.js는 빌드 타임에 NEXT_PUBLIC_* 환경 변수를 코드에 직접 리터럴 값으로 주입합니다
  // next.config.js의 env 섹션에서 ADMIN_PASSWORD가 NEXT_PUBLIC_ADMIN_PASSWORD로 변환됩니다
  // 정적 빌드 후에는 이 값들이 리터럴로 대체되므로 직접 사용 가능
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || ''
  const githubOwner = process.env.NEXT_PUBLIC_REPO_OWNER || 'th-yong'
  const githubRepo = process.env.NEXT_PUBLIC_REPO_NAME || 'th-yong.github.io'
  const githubBranch = process.env.NEXT_PUBLIC_REPO_BRANCH || 'main'

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 클라이언트에서 직접 패스워드 검증
      if (!adminPassword) {
        setError('Admin password not configured. Please check GitHub Secrets (ADMIN_PASSWORD) and rebuild. See README.md for setup instructions.')
        return
      }
      
      if (password === adminPassword) {
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

    if (!githubToken) {
      setError('GitHub Token is required')
      setSubmitLoading(false)
      return
    }

    try {
      const tagArray = tags.split(',').map((t: string) => t.trim()).filter((t: string) => t)
      const finalSlug = slug || title.toLowerCase().replace(/\s+/g, '-')

      // 클라이언트에서 직접 GitHub API 호출
      const success = await createPostOnGitHubClient(
        {
          title,
          slug: finalSlug,
          date: date || undefined,
          tags: tagArray,
          categories: categories,
          content,
          skipCi,
        },
        githubToken,
        githubOwner,
        githubRepo,
        githubBranch
      )

      if (success) {
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
        setError('Failed to create post. Please check your GitHub Token.')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setSubmitLoading(false)
    }
  }

  function parseGeneratedPost(fullMarkdown: string): void {
    const frontmatterMatch = fullMarkdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1]
      const body = frontmatterMatch[2].trim()
      const titleMatch = frontmatter.match(/title:\s*(.+)/)
      const slugMatch = frontmatter.match(/slug:\s*(.+)/)
      const dateMatch = frontmatter.match(/date:\s*(.+)/)
      const tagsMatch = frontmatter.match(/tags:\s*\[(.*?)\]/)
      const categoriesMatch = frontmatter.match(/categories:\s*\[(.*?)\]/)
      if (titleMatch) setTitle(titleMatch[1].trim().replace(/^["']|["']$/g, ''))
      if (slugMatch) setSlug(slugMatch[1].trim().replace(/^["']|["']$/g, ''))
      if (dateMatch) {
        const d = dateMatch[1].trim().replace(/^["']|["']$/g, '').split('T')[0]
        if (d) setDate(d)
      }
      if (tagsMatch) {
        const tagList = tagsMatch[1].split(',').map((t: string) => t.trim().replace(/^["']|["']$/g, ''))
        setTags(tagList.join(', '))
      }
      if (categoriesMatch) {
        const catList = categoriesMatch[1].split(',').map((c: string) => c.trim().replace(/^["']|["']$/g, ''))
        setCategories(catList.filter((c) => availableCategories.includes(c)))
      }
      setContent(body)
    } else {
      setContent(fullMarkdown.trim())
    }
  }

  const handleAiGenerate = async () => {
    if (!techName.trim() || !techDescription.trim()) {
      setError('기술명과 핵심 설명을 입력해주세요.')
      return
    }
    setAiLoading(true)
    setError('')
    try {
      const result = await generateBlogPost(
        {
          techName: techName.trim(),
          description: techDescription.trim(),
          additionalContext: techAdditionalContext.trim() || undefined,
        },
        azureOpenAIConfig
      )
      if (result.success) {
        parseGeneratedPost(result.content)
        setError('')
      } else {
        setError(result.error || '글 생성에 실패했습니다.')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setAiLoading(false)
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
                  GitHub Personal Access Token *
                </label>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="ghp_..."
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  GitHub Personal Access Token with repo permissions is required to create/update posts.
                </p>
              </div>

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
                      if (!githubToken) {
                        setError('GitHub Token is required to load post')
                        return
                      }
                      setLoadLoading(true)
                      setError('')
                      try {
                        // GitHub에서 가져오기
                        const result = await getPostFromGitHubClient(
                          slug,
                          githubToken,
                          githubOwner,
                          githubRepo,
                          githubBranch
                        )
                        
                        if (result.success && result.content) {
                          // 마크다운 파싱 (간단한 버전)
                          const content = result.content
                          const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
                          if (frontmatterMatch) {
                            const frontmatter = frontmatterMatch[1]
                            const body = frontmatterMatch[2]
                            
                            // 간단한 파싱
                            const titleMatch = frontmatter.match(/title:\s*(.+)/)
                            const dateMatch = frontmatter.match(/date:\s*(.+)/)
                            const tagsMatch = frontmatter.match(/tags:\s*\[(.*?)\]/)
                            const categoriesMatch = frontmatter.match(/categories:\s*\[(.*?)\]/)
                            
                            setTitle(titleMatch ? titleMatch[1].trim().replace(/^["']|["']$/g, '') : slug)
                            setDate(dateMatch ? dateMatch[1].trim().split('T')[0] : new Date().toISOString().split('T')[0])
                            setTags(tagsMatch ? tagsMatch[1].split(',').map((t: string) => t.trim().replace(/^["']|["']$/g, '')).join(', ') : '')
                            setCategories(categoriesMatch ? categoriesMatch[1].split(',').map((c: string) => c.trim().replace(/^["']|["']$/g, '')) : [])
                            setContent(body)
                            setIsEditMode(true)
                            setError('')
                          } else {
                            setError('Failed to parse post content')
                          }
                        } else {
                          setError(result.error || 'Failed to load post')
                        }
                      } catch (err: any) {
                        setError(err.message || 'An error occurred')
                      } finally {
                        setLoadLoading(false)
                      }
                    }}
                    disabled={loadLoading || !slug || !githubToken}
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
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setAiGenerateMode(!aiGenerateMode)}
                    className={`px-3 py-1.5 text-sm rounded transition-colors ${
                      aiGenerateMode
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    AI로 생성
                  </button>
                  {!hasAzureOpenAIConfig && (
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      Azure OpenAI 환경변수가 없으면 AI 생성이 비활성화됩니다.
                    </span>
                  )}
                </div>
                {aiGenerateMode && (
                  <div className="mb-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        기술명 *
                      </label>
                      <input
                        type="text"
                        value={techName}
                        onChange={(e) => setTechName(e.target.value)}
                        placeholder="예: Agent-Lightning"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        핵심 설명/정보 *
                      </label>
                      <textarea
                        value={techDescription}
                        onChange={(e) => setTechDescription(e.target.value)}
                        rows={4}
                        placeholder="기술의 목적, 개발 주체, 핵심 특징, 참고 링크 등을 간단히 입력하세요."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        추가 컨텍스트 (선택)
                      </label>
                      <textarea
                        value={techAdditionalContext}
                        onChange={(e) => setTechAdditionalContext(e.target.value)}
                        rows={2}
                        placeholder="추가로 참고할 문서, 요구사항 등"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAiGenerate}
                      disabled={aiLoading || !hasAzureOpenAIConfig || !techName.trim() || !techDescription.trim()}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {aiLoading ? '생성 중...' : '글 생성'}
                    </button>
                  </div>
                )}
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

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="skipCi"
                  checked={skipCi}
                  onChange={(e) => setSkipCi(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="skipCi" className="text-sm text-gray-700 dark:text-gray-300">
                  Skip CI (GitHub Actions 실행 안 함)
                </label>
              </div>

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

