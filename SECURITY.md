# 보안 정책

## 보고된 보안 취약점

보안 취약점을 발견하셨다면, 이슈를 생성하기 전에 먼저 이메일로 연락해주세요: yongtaehoon@gmail.com

## 보안 조치

### 입력 검증

- 모든 사용자 입력은 검증 및 정규화됩니다
- Slug는 경로 탐색 공격을 방지하기 위해 검증됩니다
- YAML injection을 방지하기 위해 frontmatter 값이 이스케이프됩니다

### 인증

- Admin 기능은 패스워드로 보호됩니다
- 패스워드는 환경 변수로 관리됩니다

### 환경 변수

- 민감한 정보는 `.env.local`에 저장되며 Git에 커밋되지 않습니다
- GitHub Actions에서는 GitHub Secrets를 사용합니다

### 제한 사항

- Title: 최대 200자
- Content: 최대 100,000자
- Slug: 최대 100자
- Tags: 최대 20개, 각 태그 최대 50자
- Categories: 최대 4개, 허용된 카테고리만 선택 가능

## 권장 사항

1. 강력한 패스워드 사용
2. GitHub Personal Access Token은 최소한의 권한만 부여 (repo 권한)
3. 정기적으로 의존성 업데이트
4. 환경 변수는 절대 공유하지 않기

