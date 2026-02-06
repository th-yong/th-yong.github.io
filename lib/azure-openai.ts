/**
 * Azure OpenAI를 사용한 기술 블로그 글 자동 생성
 * 시스템 프롬프트 템플릿에 맞춰 사용자 입력을 바탕으로 완성된 마크다운 글을 생성합니다.
 */

export interface AzureOpenAIConfig {
  endpoint: string
  apiKey: string
  deployment: string
  apiVersion: string
}

export interface GeneratePostInput {
  techName: string
  description: string
  additionalContext?: string
}

const SYSTEM_PROMPT = `당신은 기술 문서 분석 전문가입니다. 주어진 기술 논문, 프레임워크, 또는 시스템에 대한 정보를 다음 구조로 체계적으로 정리해주세요.

## 출력 형식

### Frontmatter (YAML)
---
title: "[기술명]: [핵심 설명 한 줄]"
slug: my-post-title
date: YYYY-MM-DD
categories: [관련 카테고리]
tags: ["태그1", "태그2", ...]
---

### 본문 구조

1. **개요** (1-2문단)
   - 기술의 핵심 목적을 한 문장으로 요약
   - 개발 주체, 핵심 목표, 기술적 기반 정리

2. **차별성**
   - 기존 방식의 한계를 표로 정리 (기존 vs 새로운 방식)
   - 핵심 역량을 불릿 포인트로 나열

3. **시스템 구성 요소**
   - 주요 컴포넌트를 표로 정리 (구성 요소 | 역할 | 상세 내용)
   - 작동 원리를 순서대로 설명 (다이어그램 형태의 코드 블록 활용)
   - 핵심 컴포넌트의 역할을 별도 섹션으로 상세 설명

4. **주요 기능** 또는 **검증된 성능**
   - 기능별로 소제목과 설명
   - 벤치마크 결과가 있으면 표로 정리

5. **사용 방법** (해당되는 경우)
   - 설치 방법 (코드 블록)
   - 기본 사용 예시 (코드 블록)

6. **적용 시나리오**
   - 적합한 사용 사례
   - 제한사항

7. **결론**
   - 핵심 가치 요약 (2-3문장)
   - 향후 전망 (해당되는 경우)

8. **참고 자료**
   - GitHub, 공식 문서 등 링크

## 작성 원칙

- 기술적 정확성을 최우선으로 함
- 표(table)를 적극 활용하여 비교/정리
- 코드 블록으로 아키텍처 흐름을 시각화
- 불필요한 수식어 없이 간결하게 작성
- 한국어로 작성하되, 기술 용어는 영문 병기
- 각 섹션은 "---"로 구분`

function buildUserMessage(input: GeneratePostInput): string {
  let message = `다음 기술에 대한 블로그 글을 작성해주세요.\n\n**기술명:** ${input.techName}\n\n**핵심 설명/정보:**\n${input.description}`
  if (input.additionalContext?.trim()) {
    message += `\n\n**추가 컨텍스트:**\n${input.additionalContext.trim()}`
  }
  message += `\n\n위 형식(Frontmatter + 본문)에 맞춰 완성된 마크다운 문서 하나만 출력해주세요. 코드 블록으로 감싸지 말고 순수 마크다운만 출력하세요.`
  return message
}

/**
 * Azure OpenAI Chat Completions API를 호출하여 템플릿에 맞춘 블로그 글을 생성합니다.
 * @returns 생성된 마크다운 전체( frontmatter + 본문 ) 또는 에러 시 메시지
 */
export async function generateBlogPost(
  input: GeneratePostInput,
  config: AzureOpenAIConfig
): Promise<{ success: true; content: string } | { success: false; error: string }> {
  const { endpoint, apiKey, deployment, apiVersion } = config

  if (!endpoint?.trim() || !apiKey?.trim() || !deployment?.trim()) {
    return {
      success: false,
      error: 'Azure OpenAI 설정이 누락되었습니다. (endpoint, apiKey, deployment 확인)',
    }
  }

  const baseUrl = endpoint.replace(/\/$/, '')
  const url = `${baseUrl}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`

  const body = {
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserMessage(input) },
    ],
    max_completion_tokens: 16384,
    temperature: 0.5,
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errText = await res.text()
      let errMessage = `API 오류 (${res.status})`
      try {
        const errJson = JSON.parse(errText)
        errMessage = errJson.error?.message || errJson.message || errMessage
      } catch {
        if (errText) errMessage = errText.slice(0, 200)
      }
      return { success: false, error: errMessage }
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content

    if (typeof content !== 'string' || !content.trim()) {
      return { success: false, error: '생성된 내용이 없습니다.' }
    }

    return { success: true, content: content.trim() }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return { success: false, error: `요청 실패: ${message}` }
  }
}
