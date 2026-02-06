## 소개

Next.js 14와 TypeScript로 구축된 정적 블로그입니다. 마크다운 기반 포스트 작성 및 GitHub Pages를 통한 자동 배포를 지원합니다.

## 시작하기

### 설치

```bash
npm install
```

### 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
ADMIN_PASSWORD=your-admin-password-here

# GitHub Personal Access Token (repo 권한). 설정 시 Admin 패널에 자동 입력됨. 비워두면 패널에서 수동 입력.
REPO_TOKEN=

REPO_OWNER=th-yong
REPO_NAME=th-yong.github.io
REPO_BRANCH=main
```

**환경 변수 설명:**
- `ADMIN_PASSWORD`: Admin 패널 접근을 위한 패스워드
- `REPO_TOKEN`: GitHub Personal Access Token (repo 권한). 설정하면 Admin 패널에 자동 입력되며, 비워두면 패널에서 직접 입력
- `REPO_OWNER`: GitHub 사용자명 또는 조직명
- `REPO_NAME`: GitHub 리포지토리 이름
- `REPO_BRANCH`: 기본 브랜치 (보통 `main`)

**참고:** 
- `GITHUB_` 접두사는 GitHub Actions에서 예약어이므로 `REPO_` 접두사를 사용합니다.
- 토큰 생성: GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)

### GitHub Actions 배포 설정

GitHub Pages 자동 배포를 사용하는 경우, 다음 Secrets를 설정해야 합니다:

1. Repository Settings > Secrets and variables > Actions로 이동
2. 다음 Secrets를 추가:
   - `ADMIN_PASSWORD`: Admin 패널 접근 패스워드
   - `REPO_TOKEN`: (선택) GitHub Personal Access Token. 설정 시 빌드 시점에 Admin 패널 기본값으로 사용
   - `REPO_OWNER`: GitHub 사용자명 또는 조직명 (예: `th-yong`)
   - `REPO_NAME`: GitHub 리포지토리 이름 (예: `th-yong.github.io`)
   - `REPO_BRANCH`: 기본 브랜치 (예: `main`)

**중요:** Secrets를 설정한 후에는 반드시 워크플로우를 다시 실행해야 합니다 (Actions 탭에서 "Re-run jobs" 또는 새로운 커밋 푸시).

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 기능

### 페이지

- **홈페이지**: 이름, 직업, 소셜 링크 표시
- **About**: 소개 및 관심 분야
- **Tech**: 기술 포스트 목록 및 상세 페이지 (카테고리: Agent, Cloud, LLM, Vision)
- **Tags**: 태그별 포스트 그룹화
- **Projects**: 프로젝트 목록

### Admin 기능

웹에서 직접 포스트를 작성하고 GitHub에 업로드할 수 있습니다.

**사용 방법:**
1. 상단의 "Tae-Hoon's blog" 텍스트를 5번 연속 클릭
2. 패스워드 입력
3. 마크다운으로 포스트 작성 (미리보기 지원)
4. GitHub에 자동 업로드

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Markdown**: react-markdown, remark, rehype
- **Code Highlighting**: react-syntax-highlighter
- **Deployment**: GitHub Pages

## 프로젝트 구조

```
my-tech-blog/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 홈페이지
│   ├── about/             # About 페이지
│   ├── tech/              # Tech 페이지
│   ├── tags/              # Tags 페이지
│   └── projects/          # Projects 페이지
├── components/            # React 컴포넌트
│   ├── Navigation.tsx     # 네비게이션
│   ├── MarkdownViewer.tsx # 마크다운 렌더러
│   └── AdminModal.tsx    # Admin 모달
├── lib/                   # 유틸리티
│   ├── markdown.ts        # 마크다운 파싱
│   ├── github.ts          # GitHub API
│   └── auth.ts            # 인증
└── content/               # 콘텐츠
    ├── posts/             # 마크다운 포스트
    ├── about.md           # About 내용
    └── projects.md        # Projects 내용
```

