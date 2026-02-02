import { Octokit } from '@octokit/rest'
import { escapeYamlString } from './validation'

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

const owner = process.env.GITHUB_OWNER || 'thyong'
const repo = process.env.GITHUB_REPO || 'my-tech-blog'
const branch = process.env.GITHUB_BRANCH || 'main'

export interface CreatePostParams {
  title: string
  content: string
  tags: string[]
  categories: string[]
  slug: string
  date?: string
}

export async function createPostOnGitHub(params: CreatePostParams): Promise<boolean> {
  try {
    const { title, content, tags, categories, slug, date } = params
    
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

    const contentBase64 = Buffer.from(frontmatter).toString('base64')
    const message = sha ? `Update post: ${title}` : `Create post: ${title}`

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

