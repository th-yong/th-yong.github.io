---
title: "automem: AI 에이전트에 지속적(Relational) 장기 메모리를 제공하는 그래프+벡터 하이브리드 메모리"
date: 2026-02-06
categories: [LLM, Agent]
tags: [automem, Long-Term Memory, Graph Database, Vector Database, FalkorDB, Qdrant, Flask, RAG, LoCoMo]
---

## 1. 개요

**automem은 AI 에이전트에게 세션 간에도 유지되는 지속적(durable)이며 관계형(relational) 장기 메모리를 제공하는 오픈소스 메모리 시스템**입니다. 단순히 “비슷한 문장”을 찾는 수준을 넘어, 대화/결정에서 추출된 **개체(Entity)**와 **관계(Relationship)**를 구조화해 “무엇이 무엇과 어떻게 연결되는지”까지 기억하도록 설계되었습니다.

GitHub 공개 프로젝트(verygoodplugins/automem)로, **Python 중심 코드베이스**를 기반으로 **Flask REST API 서버**, **그래프 DB(FalkorDB)**, **벡터 DB(Qdrant)**를 결합해 구현됩니다. 핵심 목표는 어시스턴트가 장기적으로 사용자/업무 맥락을 유지하고, 기억 간 의미적 연결과 시간적 변화까지 반영해 더 정확한 회상(recall)과 추론(reasoning)을 수행하게 하는 것입니다.

---

## 2. 차별성

### 기존 방식의 한계 (기존 vs 새로운 방식)

| 구분 | 전통적 RAG/벡터 메모리(Vector-only) | automem(그래프+벡터 하이브리드) |
|---|---|---|
| 검색 방식 | 임베딩 유사도 중심(kNN) | **벡터 검색 + 그래프 탐색** 결합 |
| 기억 구조 | 문서/청크 중심, 관계 표현 약함 | **Entity + Typed Relationship**로 구조화 |
| 관계/인과 | 표현/질의 어려움 | **관계형 쿼리**, 멀티홉 탐색 지원 |
| 시간/변화 | 최신/중요도 반영이 제한적 | 시간/중요도/태그/콘텐츠 등 **멀티 신호** 반영 가능 |
| 장기 대화 적합성 | 세션 간 일관성 유지 어려움 | 세션 간 **지속적 메모리**에 최적화 |

### 핵심 역량

- 대화/결정 내용에서 **개체(Entity) 추출 → 관계 그래프 모델링**
- **Typed relationship(11종)** 기반의 의미 연결(예: `RELATES_TO`, `PREFERS_OVER`, `EVOLVED_INTO` 등)
- **Hybrid retrieval**: 벡터 유사도 + 그래프 멀티홉 탐색으로 회상 정확도 향상
- 시간/중요도/태그/콘텐츠 기반의 **멀티 신호 검색(multi-signal retrieval)**

---

## 3. 시스템 구성 요소

### 주요 컴포넌트

| 구성 요소 | 역할 | 상세 내용 |
|---|---|---|
| Graph Database (FalkorDB) | 관계형 메모리 저장/추론 | 기억 사이 **typed relationship** 저장, 관계형 쿼리 및 **멀티홉(reasoning)** 지원 |
| Vector Database (Qdrant) | 의미 기반 검색 | 임베딩 기반 유사도 검색(kNN), 콘텐츠 기반 recall 강화 |
| REST API Server (Flask) | 외부 연동 인터페이스 | 메모리 **저장/조회/업데이트** 엔드포인트 제공, 에이전트/클라이언트가 호출 |
| (내부) Entity/Relation 추출 로직 | 구조화 파이프라인 | 대화/결정에서 엔티티를 식별하고 관계를 생성/갱신 |
| (내부) 하이브리드 검색 로직 | 검색 오케스트레이션 | 벡터 후보군 생성 후 그래프 확장/필터링 등 결합 전략 수행 |

### 작동 원리(흐름)

```text
[Client/Agent]
   |
   | 1) 대화/사실/결정 저장 요청 (REST)
   v
[Flask API Server]
   |
   | 2) Entity 추출 + Relationship 생성/갱신
   v
+-------------------+        +-------------------+
| FalkorDB (Graph)  |        | Qdrant (Vector)    |
| - Entities        |        | - Embeddings       |
| - Typed edges     |        | - Similarity search|
+-------------------+        +-------------------+
   ^                               ^
   | 3) 관계 쿼리/멀티홉 탐색        | 3) 벡터 후보 검색(kNN)
   +---------------+---------------+
                   |
                   | 4) Hybrid retrieval 결합/랭킹
                   v
            [Relevant Memories]
                   |
                   | 5) 응답/컨텍스트로 반환
                   v
              [Client/Agent]
```

### 핵심 컴포넌트 상세

#### 3.1 FalkorDB(그래프 메모리)의 의미
- 기억을 “문장 덩어리”가 아니라 **개체(Entity)**와 **관계(Edge)**로 저장합니다.
- `PREFERS_OVER` 같은 **선호 관계**, `EVOLVED_INTO` 같은 **변화/진화 관계**를 통해 시간에 따른 맥락 변화도 표현할 수 있습니다.
- 그래프 탐색은 “A와 관련된 B, 그리고 B와 연결된 C” 같은 **멀티홉 질의**에 유리합니다.

#### 3.2 Qdrant(벡터 메모리)의 의미
- 텍스트/콘텐츠를 임베딩으로 저장해 **의미 유사도 기반 recall**을 제공합니다.
- 그래프만으로는 놓치기 쉬운 “표현이 달라도 의미가 유사한 기억”을 빠르게 후보로 찾는 데 강점이 있습니다.

#### 3.3 Flask REST API 서버의 의미
- 에이전트 프레임워크/외부 서비스가 언어/런타임에 상관없이 메모리 기능을 사용할 수 있도록 **HTTP 엔드포인트**로 추상화합니다.
- 저장/조회/업데이트를 표준화해, “메모리 시스템”을 독립 서비스로 운영하기 쉽습니다.

---

## 4. 검증된 성능

### LoCoMo(ACL 2024) 기준 장기 대화 기억 성능
automem은 **LoCoMo(Long-Term Conversational Memory)** 벤치마크에서 **90.53% 정확도**를 기록했습니다.

| 시스템 | 정확도(Accuracy) | 비고 |
|---|---:|---|
| OpenAI 기본 메모리(베이스라인) | 39% | 비교 기준 |
| CORE(Core) | 88.24% | 이전 최고 |
| **automem** | **90.53%** | 최고 성능 |

- CORE 대비: **+2.29%p** (90.53 - 88.24)
- 베이스라인 대비: **+51.53%p** (90.53 - 39)

> 요약: 그래프-벡터 하이브리드 구조를 통해 “오래 기억”할 뿐 아니라 “관계를 이해하는” 방향으로 장기 대화 기억 성능을 크게 끌어올린 사례로 볼 수 있습니다.

---

## 5. 사용 방법 (개요 수준)

> 프로젝트의 실제 설치/실행 명령은 저장소 README 및 배포 형태(Docker/로컬 실행 등)에 따라 달라질 수 있습니다. 아래는 **구성 요소 관점의 대표 흐름**입니다.

### 설치/구성(예시)

```bash
# 1) 저장소 클론
git clone https://github.com/verygoodplugins/automem.git
cd automem

# 2) (권장) 가상환경 생성
python -m venv .venv
source .venv/bin/activate

# 3) 의존성 설치 (프로젝트 설정에 따라 requirements/pyproject 사용)
pip install -r requirements.txt
```

### 기본 사용 예시(REST 호출 형태)

```bash
# 메모리 저장(예시)
curl -X POST http://localhost:5000/memory \
  -H "Content-Type: application/json" \
  -d '{
    "content": "사용자는 다크 모드를 선호한다.",
    "tags": ["preference", "ui"],
    "importance": 0.8
  }'

# 메모리 조회(예시: 질의 기반)
curl -X POST http://localhost:5000/memory/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "사용자 UI 선호도",
    "top_k": 5,
    "signals": ["vector", "graph", "time", "importance", "tags"]
  }'
```

---

## 6. 적용 시나리오

### 적합한 사용 사례
- **개인화 어시스턴트**: 사용자 선호/금기/업무 맥락을 장기간 유지(예: `PREFERS_OVER`)
- **업무 에이전트(Ops/Dev/PM)**: 결정 사항과 근거, 변경 이력의 관계를 추적(예: `EVOLVED_INTO`)
- **지식 관리/CRM**: 인물/조직/프로젝트 간 관계를 그래프로 축적하고 필요 시 멀티홉으로 회상
- **멀티 에이전트 협업**: 에이전트 간 공유 가능한 “관계형 메모리 레이어”로 활용

### 제한사항(설계/운영 관점)
- **스키마/관계 타입 설계**가 품질을 좌우: 어떤 엔티티를 뽑고 어떤 관계를 생성할지에 따라 성능 변동
- 그래프+벡터 **운영 복잡도 증가**: DB 2종 운영, 백업/마이그레이션/관측(Observability) 필요
- 개인정보/민감정보를 장기 저장할 수 있으므로 **보안/거버넌스(PII, retention policy)** 설계가 필수

---

## 7. 결론

automem은 **벡터 검색의 recall**과 **그래프 관계 추론의 구조적 강점**을 결합해, AI 에이전트가 세션 간에도 기억을 유지하고 기억 간 관계까지 이해하도록 만든 **관계형 장기 메모리 시스템**입니다. LoCoMo 기준 최고 수준의 정확도를 통해, “장기 대화 기억”을 실제 제품/에이전트에 적용 가능한 형태로 끌어올린 접근으로 평가할 수 있습니다.

---

## 8. 참고 자료

- GitHub: https://github.com/verygoodplugins/automem
- FalkorDB: https://www.falkordb.com/
- Qdrant: https://qdrant.tech/