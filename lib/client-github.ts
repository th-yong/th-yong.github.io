import { Octokit } from '@octokit/rest'
import { escapeYamlString } from './validation'

export interface CreatePostParams {
  title: string
  content: string
  tags: string[]
  categories: string[]
  slug: string
  date?: string
  skipCi?: boolean
}

export async function createPostOnGitHubClient(
  params: CreatePostParams,
  token: string,
  owner: string,
  repo: string,
  branch: string = 'main'
): Promise<boolean> {
  try {
    const { title, content, tags, categories, slug, date, skipCi } = params
    
    const octokit = new Octokit({
      auth: token,
    })
    
    // YAML 안전하게 이스케이프
    const safeTitle = escapeYamlString(title)
    const safeCategories = categories.map(c => escapeYamlString(c))
    const safeTags = tags.map(t => escapeYamlString(t))
    
    // 날짜가 제공되면 사용하고, 없으면 오늘 날짜 사용
    const postDate = date || new Date().toISOString().split('T')[0]
    
    const frontmatter = `---
title: ${safeTitle}
date: ${postDate}
categories: [${safeCategories.join(', ')}]
tags: [${safeTags.join(', ')}]
---

${content}`

    const filePath = `content/posts/${slug}.md`

    // 파일이 이미 존재하는지 확인
    let sha: string | undefined
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path: filePath,
        ref: branch,
      })
      if ('sha' in data && data.sha) {
        sha = data.sha
      }
    } catch (error: any) {
      if (error.status !== 404) {
        throw error
      }
    }

    // 브라우저에서 base64 인코딩
    const contentBase64 = btoa(unescape(encodeURIComponent(frontmatter)))
    const ciSuffix = skipCi ? ' [skip ci]' : ''
    const message = sha ? `Update post: ${title}${ciSuffix}` : `Create post: ${title}${ciSuffix}`

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message,
      content: contentBase64,
      ...(sha && { sha }),
      branch,
    })

    return true
  } catch (error) {
    console.error('Error creating post on GitHub:', error)
    return false
  }
}

export async function getPostFromGitHubClient(
  slug: string,
  token: string,
  owner: string,
  repo: string,
  branch: string = 'main'
): Promise<any> {
  try {
    const octokit = new Octokit({
      auth: token,
    })

    const filePath = `content/posts/${slug}.md`

    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: filePath,
      ref: branch,
    })

    if ('content' in data && data.content) {
      // 브라우저에서 base64 디코딩
      const content = decodeURIComponent(escape(atob(data.content.replace(/\s/g, ''))))
      return { success: true, content }
    }

    return { success: false, error: 'File not found' }
  } catch (error: any) {
    if (error.status === 404) {
      return { success: false, error: 'Post not found' }
    }
    console.error('Error loading post from GitHub:', error)
    return { success: false, error: 'An error occurred' }
  }
}

