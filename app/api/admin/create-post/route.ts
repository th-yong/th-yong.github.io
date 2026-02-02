import { NextRequest, NextResponse } from 'next/server'
import { createPostOnGitHub } from '@/lib/github'
import { verifyPassword } from '@/lib/auth'
import {
  validateTitle,
  validateContent,
  validateAndSanitizeSlug,
  validateAndSanitizeTags,
  validateCategories,
} from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const { password, title, content, tags, categories, slug, date } = await request.json()
    
    // 패스워드 확인
    if (!verifyPassword(password)) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    // 입력 검증
    try {
      validateTitle(title)
      validateContent(content)
      
      const sanitizedSlug = validateAndSanitizeSlug(slug || title.toLowerCase().replace(/\s+/g, '-'))
      const sanitizedTags = validateAndSanitizeTags(tags || [])
      const validatedCategories = validateCategories(categories || [])
      
      // GitHub에 포스트 생성
      const success = await createPostOnGitHub({
        title: title.trim(),
        content: content.trim(),
        tags: sanitizedTags,
        categories: validatedCategories,
        slug: sanitizedSlug,
        date: date || undefined,
      })
      
      if (success) {
        return NextResponse.json({ success: true })
      } else {
        return NextResponse.json(
          { error: 'Failed to create post' },
          { status: 500 }
        )
      }
    } catch (validationError: any) {
      return NextResponse.json(
        { error: validationError.message || 'Validation failed' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Error in create-post API:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

