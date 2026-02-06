---
title: "HMLR: Agentic AI를 위한 장기 기억 시스템"
date: 2026-01-26
categories: [Agent]
tags: ["\"Memory\"", "\"RAG\"", "\"LLM\"", "\"Agent\"", "\"Long-term-Memory\"", "\"Multi-hop-Reasoning\""]
---

HMLR(Hierarchical Memory Lookup & Routing)은 AI 에이전트를 위한 상태 인식 장기 기억 시스템이다. 기존의 단순 벡터 RAG 방식이 처리하지 못하는 시간적 충돌, 다중 홉 추론, 교차 토픽 기억 문제를 해결하기 위해 설계되었다.

---

## 1. 개요

HMLR은 기존 토큰 기반 컨텍스트 윈도우나 단순 벡터 RAG 방식의 한계를 극복하기 위한 메모리 엔진이다.

- 개발 주체: Sean-V-Dev (오픈소스)
- 핵심 목표: 시간 연속성, 다중 토픽, 충돌 상태 해결이 가능한 장기 기억 시스템 구현
- 기술적 기반: Python 기반, PyPI 패키지(`hmlr`) 제공, SQL 저장소 + LLM 연동
- 검증 모델: gpt-4.1-mini (공식 테스트 완료)

## 2. 차별성

기존 RAG/벡터 스토어 방식은 단순 유사도 검색에만 의존하여 복잡한 기억 논리 처리에 취약하다.

### 기존 RAG의 한계

| 문제 유형 | 기존 RAG | HMLR |
| :--- | :--- | :--- |
| 충돌하는 사실(conflicting facts) | 최신 정보 구분 불가 | 시간 순서 기반 해결 |
| 시간적 순서 추론 | 단순 유사도만 고려 | 상태 변경 이력 유지 |
| 다중 홉 추론(multi-hop reasoning) | 단일 검색 결과에 의존 | 계층적 기억 탐색 |
| 교차 토픽 추론 | 토픽 간 연결 불가 | 크로스 토픽 기억 라우팅 |
| 사용자/정책 제약 조건 | 세션 종료 시 소실 | 지속적 보존 |

### HMLR의 핵심 역량

- **다중 홉 추론**: 여러 기억 조각을 연결하여 복잡한 질의에 답변
- **시간적 순서 유지**: 상태 변경 이력을 추적하여 최신 정보 식별
- **사용자/정책 제약 보존**: 세션이 바뀌어도 사용자 설정과 정책 유지
- **상태 인식 메모리 라우팅**: 벡터 검색을 구조화된 라우팅으로 대체

---

## 3. 시스템 구성 요소

HMLR은 여러 모듈이 병렬로 협력하는 구조로 설계되어 있다.

| 구성 요소 | 역할 | 상세 내용 |
| :--- | :--- | :--- |
| ChunkEngine | 입력 처리 | 메시지 청킹 및 임베딩 생성 |
| Scribe Agent | 프로필 관리 | 사용자 프로필 JSON 업데이트 (Fire-and-Forget) |
| FactScrubber | 사실 추출 | 키-값 형태로 사실 저장소(SQL)에 저장 |
| LatticeCrawler | 기억 검색 | 벡터 검색으로 기억 후보 추출 |
| Governor | 라우터/필터 | 컨텍스트 필터링 및 라우팅 결정 |
| ContextHydrator | 프롬프트 조립 | 기억 + 프로필 + 사실을 결합하여 최종 프롬프트 생성 |

### 3.1 작동 원리

```
사용자 쿼리 → ChunkEngine → 병렬 태스크 실행
                              ├─ Scribe (프로필 업데이트)
                              ├─ FactScrubber (사실 추출)
                              ├─ LatticeCrawler (기억 검색)
                              └─ Governor (라우팅 결정)
                                    ↓
                              ContextHydrator → 최종 프롬프트 → LLM 응답
```

1. **입력 처리**: ChunkEngine이 사용자 메시지를 청킹하고 임베딩 생성
2. **병렬 실행**: 프로필 업데이트, 사실 추출, 기억 검색이 동시에 실행
3. **라우팅 결정**: Governor가 기억 후보를 필터링하고 적절한 기억 조합 선택
4. **프롬프트 조립**: ContextHydrator가 모든 소스를 결합하여 최종 프롬프트 생성
5. **응답 생성**: LLM이 하이드레이션된 프롬프트로 응답 생성

### 3.2 Governor의 역할

Governor는 HMLR의 핵심 두뇌 역할을 한다:

- **컨텍스트 필터링**: 벡터 검색 결과에서 실제로 관련 있는 기억만 선별
- **라우팅 결정**: 활성 토픽이면 기존 Bridge Block 재개, 새 토픽이면 새 Block 생성
- **상태 인식**: 현재 대화 상태와 과거 기억의 관계를 파악

---

## 4. Dossier 기반 장기 기억 시스템

HMLR v0.1.2에서 도입된 Dossier 시스템은 장기 기억 검색의 핵심이다.

### 4.1 Dossier란?

Dossier는 일별 또는 이벤트 단위로 저장되는 구조화된 기억 데이터셋이다:

- 단기 기억(Bridge Block)에서 장기 기억으로 전환 시 생성
- 토픽과 날짜를 넘어 지속되는 핵심 정보 저장
- 과거 사건의 인과적 연쇄(causal chain) 재구성에 활용

### 4.2 Gardener 기능

`run_gardener.py` 스크립트를 통해 단기 기억을 장기 기억으로 이전한다:

- **단기 → 장기 전환**: Bridge Block의 기억을 Dossier로 변환
- **기억 품질 개선**: 주기적/조건부 업그레이드로 검색 품질 향상
- **인과 연쇄 보존**: 과거 사실 간의 관계를 유지하며 저장

### 4.3 장기 기억 검색 흐름

```
새 쿼리 → Dossier 검색 + 장기 기억 검색
              ↓
        인과 연쇄 재구성
              ↓
        과거 정보를 현재 컨텍스트에 통합
```

---

## 5. 검증된 벤치마크 성능

HMLR은 RAGAS 평가 프레임워크를 통해 검증되었다.

### 5.1 RAGAS 벤치마크 결과

| 테스트 시나리오 | Faithfulness | Context Recall | Precision | 결과 |
| :--- | :---: | :---: | :---: | :---: |
| API 키 로테이션 (상태 충돌) | 1.00 | 1.00 | 0.50 | ✅ |
| 채식주의자 제약 트랩 (사용자 불변 조건) | 1.00 | 1.00 | 0.88 | ✅ |
| 5회 타임스탬프 업데이트 (시간 순서) | 1.00 | 1.00 | 0.64 | ✅ |
| 30일 폐기 트랩 (정책 + 다중 홉) | 1.00 | 1.00 | 0.27 | ✅ |
| 10턴 모호한 비밀 검색 (제로 키워드 리콜) | 1.00 | 1.00 | 0.80 | ✅ |
| 50턴 장기 대화 (30일 시간 간격, 11개 토픽) | 1.00 | 1.00 | 1.00 | ✅ |
| **Hydra of Nine Heads (업계 표준 치명적 RAG)** | **1.00** | **1.00** | **0.23** | **✅** |

### 5.2 Hydra Hard Mode 테스트

Hydra Hard Mode는 HMLR의 가장 엄격한 검증 테스트다:

- **21회 독립 메시지**: 30일에 걸쳐 서로 다른 세션에서 전송
- **완전 격리**: 각 턴은 새 세션에서 실행, 이전 턴이 컨텍스트에 없음
- **순수 장기 기억 검색**: 최종 쿼리 시 모든 컨텍스트는 오직 장기 기억에서만 검색

테스트 통과 예시:
```
Response: NON-COMPLIANT

1) Project Cerberus 암호화 시스템의 완전한 이름 연쇄:
   - Legacy-Phi → Phoenix → Aether → K-12 → Styx → River-9 → Charon → Tartarus-v3

2) 현재 제약을 결정하는 정책 변경 순서:
   - Policy v3 → v4 → v5(무시) → v6 → v7 → v8(v7 취소, v6 복원)

결론: Project Cerberus의 예상 암호화 볼륨(470~485만 건/일)이
      Policy v6의 현재 제한(40만 건/일)을 초과하므로 NON-COMPLIANT
```

---

## 6. 주요 기능 및 장점

### 6.1 핵심 기능

| 기능 | 설명 |
| :--- | :--- |
| 상태 인식 메모리 구조 | 시간·상태·토픽 변화에 따른 정확한 기억 검색/추론 |
| 계층적 라우팅 | 대규모 기억 히스토리에서 핵심 메모리 필터링 |
| 장기 기억 유지(Dossier) | 중기/장기 정보 저장소로 과거 사실 재현/활용 |
| 병렬 메모리 태스크 | 프로필/사실/기억 검색 병렬 실행으로 성능 향상 |
| LangGraph 통합 | v0.1.2부터 LangGraph 드롭인 지원 |

### 6.2 검증된 7가지 역량

HMLR은 다음 7가지를 동시에 달성한다고 주장한다:

1. ✅ 완벽한 충실도(Faithfulness)
2. ✅ 완벽한 리콜(Recall)
3. ✅ 시간적 충돌 해결
4. ✅ 교차 토픽 정체성 및 규칙 지속
5. ✅ 다중 홉 정책 추론
6. ✅ 적대적 프롬프팅 하의 이진 제약 답변
7. ✅ 제로 키워드 시맨틱 리콜

---

## 7. 사용 방법

### 7.1 설치

```bash
# PyPI에서 설치
pip install hmlr

# 또는 소스에서 설치
git clone https://github.com/Sean-V-Dev/HMLR-Agentic-AI-Memory-System.git
cd HMLR-Agentic-AI-Memory-System
pip install -e .
```

### 7.2 기본 사용 예시

```python
from hmlr import HMLRClient
import asyncio

async def main():
    # 클라이언트 초기화
    client = HMLRClient(
        api_key="your-openai-api-key",
        db_path="memory.db",
        model="gpt-4.1-mini"  # 유일하게 테스트된 모델
    )
    
    # 영구 기억과 함께 대화
    response = await client.chat("내 이름은 Alice이고 피자를 좋아해")
    print(response)
    
    # HMLR은 메시지 간 기억을 유지
    response = await client.chat("내가 좋아하는 음식이 뭐야?")
    print(response)  # "피자"를 기억함

asyncio.run(main())
```

### 7.3 LangGraph 통합

```python
# hmlr/integrations/langgraph 모듈 사용
# 전체 예제: examples/simple_agent.py
```

---

## 8. 적용 시나리오

### 8.1 적합한 사용 사례

- **영구 채팅 기억**: 토큰 비대화 없이 "영원한 채팅" 기억 유지
- **거버넌스급 정책 적용**: 에이전트 시스템의 정책 규칙 지속적 적용
- **보안 장기 비밀 저장**: 민감 정보의 안전한 저장 및 검색
- **크로스 에피소드 에이전트 추론**: 세션 간 연속적인 추론
- **상태 인식 시뮬레이션**: 세계 모델링 및 상태 관리
- **비용 효율적 미니 모델 오케스트레이션**: 소형 LLM으로도 프로급 동작

### 8.2 제한사항

- **테스트된 모델**: gpt-4.1-mini만 공식 테스트 완료
- **Gardener 수동 실행**: 현재 단기→장기 기억 전환은 수동 실행 필요 (향후 자동화 예정)
- **초기 설정**: 메모리 DB 및 환경 설정 필요

---

## 9. 향후 계획

### Million Token Haystack 테스트 (예정)

100만 토큰 규모의 종합 테스트 스위트:

- Hydra Hard Mode 포함
- 단순 리콜 Hard Mode
- 포이즌 필 환각 테스트
- 사용자 제약 적용 테스트
- 실제 문서 테스트 (75~100k 토큰)
- Battery Test: 모든 실패 모드를 동시에 스트레스 테스트

### Battery Test 설계

- 다중 홉 연결
- 시간 추론 (순서 + 간격)
- 정책 취소 및 "현재 규칙" 식별
- 엔티티 별칭 드리프트
- 핫 메모리 업데이트가 무관한 질문을 하이재킹하지 않도록 방어
- 최근성 편향 방어
- 제로 모호성 스코어링

---

## 10. 결론

HMLR은 기존 RAG 시스템의 근본적인 한계를 해결하기 위한 구조적 접근을 제시한다. 단순 벡터 유사도 검색 대신 상태 인식 메모리 라우팅을 통해 시간적 충돌, 다중 홉 추론, 교차 토픽 기억 문제를 해결한다.

특히 Hydra Hard Mode 테스트에서 21회의 완전 격리된 세션에서도 과거 기억만으로 복잡한 인과 연쇄를 재구성하는 능력을 입증했다. 이는 기존 RAG 시스템에서는 달성하기 어려운 수준이다.

오픈소스로 공개되어 있어 직접 테스트하고 검증할 수 있다는 점도 장점이다. 에이전트 시스템에서 장기 기억이 필요한 경우 고려해볼 만한 아키텍처다.

---

## 11. 참고 자료

- [HMLR GitHub Repository](https://github.com/Sean-V-Dev/HMLR-Agentic-AI-Memory-System)
- [PyPI Package](https://pypi.org/project/hmlr/)
- [LangSmith RAGAS 검증 결과](https://smith.langchain.com/public/4b3ee453-a530-49c1-abbf-8b85561e6beb/d)
