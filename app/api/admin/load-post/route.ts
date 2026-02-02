import { NextRequest, NextResponse } from 'next/server'
import { getPostBySlug } from '@/lib/markdown'
import { verifyPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { password, slug } = await request.json()
    
    // 패스워드 확인
    if (!verifyPassword(password)) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      )
    }

    const post = getPostBySlug(slug)

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      post: {
        title: post.title,
        slug: post.slug,
        date: post.date || '',
        tags: post.tags?.join(', ') || '',
        categories: post.categories || [],
        content: post.content,
      },
    })
  } catch (error) {
    console.error('Error in load-post API:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

