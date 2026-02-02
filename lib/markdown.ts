import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'content/posts')

export interface PostMetadata {
  title: string
  date: string
  tags?: string[]
  categories?: string[]
  slug: string
}

export interface Post extends PostMetadata {
  content: string
}

export function getPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return []
  }
  return fs.readdirSync(postsDirectory)
    .filter((file: string) => file.endsWith('.md'))
    .map((file: string) => file.replace(/\.md$/, ''))
}

export function getPostBySlug(slug: string): Post | null {
  try {
    // 경로 탐색 공격 방지
    if (slug.includes('..') || slug.includes('/') || slug.includes('\\')) {
      return null
    }
    
    // .md 확장자 제거 (이미 제거되어 있을 수 있음)
    const cleanSlug = slug.replace(/\.md$/, '')
    
    const fullPath = path.join(postsDirectory, `${cleanSlug}.md`)
    
    // 경로가 postsDirectory 밖으로 나가는지 확인
    const resolvedPath = path.resolve(fullPath)
    const resolvedPostsDir = path.resolve(postsDirectory)
    if (!resolvedPath.startsWith(resolvedPostsDir)) {
      return null
    }
    
    if (!fs.existsSync(fullPath)) {
      return null
    }
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    // date가 Date 객체인 경우 문자열로 변환
    let dateString = ''
    if (data.date) {
      if (data.date instanceof Date) {
        dateString = data.date.toISOString().split('T')[0]
      } else if (typeof data.date === 'string') {
        dateString = data.date
      } else {
        dateString = String(data.date)
      }
    }

    return {
      slug,
      title: data.title || slug,
      date: dateString,
      tags: data.tags || [],
      categories: data.categories || [],
      content,
    }
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error)
    return null
  }
}

export function getAllPosts(): Post[] {
  const slugs = getPostSlugs()
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is Post => post !== null)
    .sort((a, b) => {
      // 날짜 문자열을 비교 (내림차순: 최신순)
      const dateA = a.date || ''
      const dateB = b.date || ''
      if (dateA < dateB) {
        return 1
      } else if (dateA > dateB) {
        return -1
      } else {
        return 0
      }
    })
  return posts
}

export function getPostsByTag(tag: string): Post[] {
  return getAllPosts().filter((post) => post.tags?.includes(tag))
}

export function getAllTags(): string[] {
  const posts = getAllPosts()
  const tags = new Set<string>()
  posts.forEach((post) => {
    post.tags?.forEach((tag) => tags.add(tag))
  })
  return Array.from(tags).sort()
}
