// 입력 검증 유틸리티

const MAX_TITLE_LENGTH = 200
const MAX_CONTENT_LENGTH = 100000
const MAX_SLUG_LENGTH = 100
const MAX_TAG_LENGTH = 50
const MAX_TAGS_COUNT = 20
const MAX_CATEGORIES_COUNT = 4

const ALLOWED_CATEGORIES = ['Agent', 'Cloud', 'LLM', 'Vision']

// YAML 안전한 문자열로 이스케이프
export function escapeYamlString(str: string): string {
  // YAML에서 특수 문자 이스케이프
  if (str.includes(':') || str.includes('"') || str.includes("'") || str.includes('\n')) {
    // 따옴표로 감싸고 내부 따옴표 이스케이프
    return `"${str.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`
  }
  return str
}

// Slug 검증 및 정규화
export function validateAndSanitizeSlug(slug: string): string {
  // 경로 탐색 공격 방지
  if (slug.includes('..') || slug.includes('/') || slug.includes('\\')) {
    throw new Error('Invalid slug: path traversal detected')
  }
  
  // 특수 문자 제거, 소문자 변환, 하이픈으로 변환
  const sanitized = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  
  if (sanitized.length === 0) {
    throw new Error('Invalid slug: empty after sanitization')
  }
  
  if (sanitized.length > MAX_SLUG_LENGTH) {
    throw new Error(`Invalid slug: too long (max ${MAX_SLUG_LENGTH} characters)`)
  }
  
  return sanitized
}

// Title 검증
export function validateTitle(title: string): void {
  if (!title || typeof title !== 'string') {
    throw new Error('Title is required')
  }
  
  if (title.trim().length === 0) {
    throw new Error('Title cannot be empty')
  }
  
  if (title.length > MAX_TITLE_LENGTH) {
    throw new Error(`Title too long (max ${MAX_TITLE_LENGTH} characters)`)
  }
}

// Content 검증
export function validateContent(content: string): void {
  if (!content || typeof content !== 'string') {
    throw new Error('Content is required')
  }
  
  if (content.trim().length === 0) {
    throw new Error('Content cannot be empty')
  }
  
  if (content.length > MAX_CONTENT_LENGTH) {
    throw new Error(`Content too long (max ${MAX_CONTENT_LENGTH} characters)`)
  }
}

// Tags 검증 및 정규화
export function validateAndSanitizeTags(tags: string[]): string[] {
  if (!Array.isArray(tags)) {
    return []
  }
  
  if (tags.length > MAX_TAGS_COUNT) {
    throw new Error(`Too many tags (max ${MAX_TAGS_COUNT})`)
  }
  
  return tags
    .map(tag => {
      if (typeof tag !== 'string') {
        return null
      }
      const trimmed = tag.trim()
      if (trimmed.length === 0 || trimmed.length > MAX_TAG_LENGTH) {
        return null
      }
      return trimmed
    })
    .filter((tag): tag is string => tag !== null)
}

// Categories 검증
export function validateCategories(categories: string[]): string[] {
  if (!Array.isArray(categories)) {
    throw new Error('Categories must be an array')
  }
  
  if (categories.length === 0) {
    throw new Error('At least one category is required')
  }
  
  if (categories.length > MAX_CATEGORIES_COUNT) {
    throw new Error(`Too many categories (max ${MAX_CATEGORIES_COUNT})`)
  }
  
  // 허용된 카테고리만 허용
  const validCategories = categories.filter(cat => 
    typeof cat === 'string' && ALLOWED_CATEGORIES.includes(cat)
  )
  
  if (validCategories.length === 0) {
    throw new Error(`Invalid categories. Allowed: ${ALLOWED_CATEGORIES.join(', ')}`)
  }
  
  // 중복 제거
  return Array.from(new Set(validCategories))
}

