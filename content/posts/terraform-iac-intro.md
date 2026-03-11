---
title: "Terraform이란: 코드로 인프라를 구축·운영하는 IaC 도구"
date: 2026-03-11
categories: [Cloud]
tags: [Terraform, IaC, HashiCorp, HCL, State, Azure, Multi-Cloud, DevOps]
---

## 1. 개요

Terraform은 **프로그램 코드로 인프라(Infrastructure)를 구축·변경·운영**할 수 있게 해주는 오픈소스 **IaC(Infrastructure as Code)** 도구입니다. 콘솔에서 클릭(ClickOps)으로 서버/네트워크/보안 정책을 관리하는 대신, **선언형(Declarative) 코드**로 “원하는 인프라 상태(Desired State)”를 정의하고 CLI로 실행해 **일관되게 재현**합니다.

- **개발 주체**: HashiCorp  
- **핵심 목표**: 반복 가능한 프로비저닝(Provisioning), 변경 이력/형상 관리, 멀티/하이브리드 클라우드에서의 일관된 운영  
- **기술적 기반**: Terraform CLI + HCL(HashiCorp Configuration Language) + Provider 플러그인

> 팀 세미나(15분) 슬라이드: https://docs.google.com/presentation/d/1-5sna0yG8WuQ6WU8pS-aGucLcKs7eMQsmQgmg8zaQw0/edit?usp=sharing  
> 한 줄 요약: **AI 엔지니어도 Azure 인프라를 블랙박스로 두지 말고, Terraform 코드 기준으로 읽고 이해하자.**

---

## 2. 차별성

### 기존 방식의 한계 (기존 vs 새로운 방식)

| 구분 | 기존 방식(수동/콘솔/스크립트 위주) | Terraform(IaC) |
|---|---|---|
| 인프라 생성 | 콘솔 클릭, 티켓 기반 요청, 사람 의존 | HCL로 선언 후 CLI로 자동 생성 |
| 재현성 | 환경마다 설정 편차 발생(드리프트, Drift) | 코드 기반으로 동일 구성 재현 가능 |
| 변경 관리 | 누가/언제/왜 바꿨는지 추적 어려움 | 코드 리뷰 + Git 이력으로 추적 용이 |
| 검증 | 적용 후 문제 발견(사후 대응) | `plan`으로 변경 내용을 사전 확인 |
| 확장성 | 서버 수 증가 시 운영 부담 급증 | 대규모 리소스도 동일 패턴으로 관리 |
| 멀티 클라우드 | 벤더별 도구/콘솔 학습 필요 | Provider로 다양한 CSP를 일관된 방식으로 관리 |

### 핵심 역량 (Key Capabilities)

- **IaC 기반 자동화**: 인프라를 코드로 정의하고 반복 실행 가능
- **Plan/Apply 워크플로우**: 적용 전에 변경 사항을 미리 검증(`terraform plan`)
- **멀티 클라우드 지원**: AWS/Azure/GCP 등 다양한 CSP를 Provider로 통합 관리
- **형상(State) 기반 운영**: 리소스의 현재 상태를 State로 추적하여 변경을 안전하게 수행
- **모듈(Module)화**: 재사용 가능한 인프라 구성 단위를 만들어 표준화/확장

---

## 3. 시스템 구성 요소

### 주요 컴포넌트

| 구성 요소 | 역할 | 상세 내용 |
|---|---|---|
| Terraform CLI | 실행 인터페이스 | `init/plan/apply/destroy` 등 명령으로 동작 |
| HCL(.tf) | 인프라 정의 언어 | 리소스/변수/출력/모듈 등을 선언형으로 기술 |
| Provider | 리소스 제공자 연결 | AWS/Azure/GCP 등 API와 통신하는 플러그인 |
| Module | 재사용 단위 | 네트워크, 서버, 보안그룹 등 표준 템플릿화 |
| Backend | State 저장소 | 로컬/원격(S3 등) 저장 및 협업/잠금(Lock) 지원 |
| State(.tfstate) | 현재 상태 기록 | 실제 인프라와 코드 간 매핑 정보(민감정보 포함 가능) |
| Variables/Outputs | 입력/출력 인터페이스 | 환경별 값 주입, 결과 값 노출(예: IP, DNS) |

### 작동 원리(Workflow) 순서

```text
[작성(Write)]
  └─ HCL(.tf)로 원하는 인프라 상태(Desired State) 정의
        |
        v
[초기화(Init)]
  └─ Provider/Module 다운로드, Backend 설정 초기화
        |
        v
[계획(Plan)]
  └─ 현재 상태(State/실제 인프라) vs 원하는 상태 비교
  └─ 생성/변경/삭제될 리소스 목록을 "적용 전" 미리 출력
        |
        v
[적용(Apply)]
  └─ Plan 결과대로 Provider API 호출하여 실제 인프라 반영
        |
        v
[상태 기록(State)]
  └─ 결과를 .tfstate(로컬 또는 원격 Backend)에 저장/갱신
```

### 핵심 컴포넌트 상세

#### (1) Provider
- “어디의 리소스를 만들 것인가?”를 결정하는 연결 계층입니다.
- 예: AWS Provider를 쓰면 Terraform이 AWS API를 호출해 VPC/EC2/IAM 등을 생성합니다.
- **버전 고정(version pinning)** 이 중요합니다(업그레이드로 동작이 바뀔 수 있음).

#### (2) State(.tfstate)와 Backend
- Terraform은 적용 결과를 **State 파일**로 관리합니다.
- 협업 시 충돌 위험이 있어, 실무에서는 보통 **원격 Backend**(예: S3 + Locking)를 사용합니다.
- State에는 민감 정보가 포함될 수 있어 **접근 제어/암호화/권한 분리**가 중요합니다.

#### (3) Module
- 인프라 구성의 재사용 단위입니다(개발에서 “클래스/라이브러리”처럼).
- 표준 네트워크, 표준 보안 정책, 표준 서버 구성 등을 모듈화하면 팀 단위 운영이 쉬워집니다.

---

## 4. 주요 기능

### (1) Plan 기반 사전 검증
- `terraform plan`은 “이 코드가 실제로 무엇을 만들/바꿀지”를 **적용 전에** 보여줍니다.
- 불필요한 리소스 생성, 사용 중 리소스 삭제 같은 사고를 줄이는 데 유용합니다.

### (2) 선언형(Declarative) 인프라 정의
- “어떻게 만들지(절차)”보다 “어떤 상태가 되어야 하는지(목표 상태)”를 정의합니다.
- 코드가 간결해지고, 운영 표준을 강제하기 쉬워집니다.

### (3) 멀티 클라우드/벤더 종속(Vendor Lock-in) 완화
- CSP별 콘솔/도구에 종속되지 않고 Terraform이라는 공통 인터페이스로 관리할 수 있습니다.
- 조직 내에서 AWS/Azure/GCP를 혼용해도 운영 모델을 통합하기 좋습니다.

---

## 5. 사용 방법

### 설치(Install)

운영체제별 설치는 공식 문서를 따르는 것이 가장 안전합니다. 설치 후 버전 확인:

```bash
terraform version
```

명령어가 길어 `tf`로 alias를 두기도 합니다.

```bash
alias tf=terraform
tf version
```

### 기본 사용 예시(Write → Plan → Apply)

```bash
# 1) 초기화: provider/module/backend 준비
terraform init

# 2) 계획: 실제 반영 전 변경사항 미리보기
terraform plan

# 3) 적용: 인프라 생성/변경 반영
terraform apply
```

---

## 6. 적용 시나리오

### 적합한 사용 사례

- VM/네트워크/보안그룹/IAM 등 **클라우드 인프라 프로비저닝 자동화**
- 개발/스테이징/운영 환경을 **동일한 코드로 반복 생성**
- 팀 단위로 인프라를 표준화하고, 모듈로 재사용하며 확장
- 멀티 클라우드 환경에서 인프라 정의/운영 방식을 통합

### 제한사항(주의점)

- **State 관리가 핵심**: 협업 환경에서는 원격 Backend 및 Locking 전략이 사실상 필수입니다.
- **코드/프로젝트 구조가 중요**: 처음 구조를 대충 잡으면 규모가 커질수록 리팩토링 비용이 커집니다.
- IaC 도입은 “도구 설치”가 아니라 **운영 방식의 변화**(코드 리뷰, 표준화, 배포 프로세스)가 동반됩니다.

---

## (추가) Azure에서 Terraform 코드를 “읽는 법” 요약

세미나에서 강조한 포인트를 Azure 관점으로 압축하면 아래 흐름입니다.

- 파일/구성요소 역할
  - `main.tf`: 리소스/모듈 조합의 엔트리 포인트
  - `modules/*`: 재사용 가능한 구성 단위
  - `variables.tf`: 입력 인터페이스(환경별 값)
  - `outputs.tf`: 결과 인터페이스(다른 모듈/스크립트/파이프라인에서 사용)
  - `terraform.tfstate`: 실제 인프라와 코드 간 매핑(민감정보 포함 가능)

- 값이 흘러가는 전형적인 경로
  - `terraform.tfvars` → `variable` → `module input` → `resource` → `output`

- 운영 관점 체크리스트
  - `init / plan / apply` 3단계 라이프사이클을 파이프라인(GitHub Actions 등)과 결합해 **셀프서비스형(Self-service) 프로비저닝**으로 확장
  - State 파일은 원격 저장 + 잠금(Locking) 없이는 팀 협업에서 사고 확률이 급증
  - 멀티 리전/대규모 운영에서는 Terragrunt, OpenTofu 등도 함께 검토 대상(조직/규모/정책에 따라)

---

## (예시) Azure Durable Functions Skeleton: Terraform 샘플 코드

실제 Azure 리소스를 Terraform으로 구성한 샘플(모듈 구조 포함):

- GitHub: https://github.com/th-yong/azure_durable_function_skeleton/tree/dev/terraform

### 생성되는 리소스(요약)

> 특징: **리소스 그룹(Resource Group)은 생성하지 않고**, `resource_group_name` 변수로 지정한 **기존 RG**에 리소스만 배포합니다.

| 리소스 | 설명 |
|--------|------|
| Storage Account | Durable Functions 상태 + Blob (컨테이너 `documents`) |
| Application Insights + Log Analytics | 로그/메트릭 |
| Azure Container Registry (ACR) | Docker 이미지 저장소 |
| App Service Plan (Elastic Premium EP1) | Linux Docker 호스팅 |
| Function App | Linux Function App (ACR 이미지 사용, Managed Identity로 ACR Pull, VNet 통합) |
| VNet + 서브넷 | Function App VNet 통합용 (아웃바운드가 서브넷으로 나가 Storage 접근) |
| Key Vault | Function App 민감 환경변수 저장/참조 |
| Azure AI Search | 항상 생성 (Function App 환경변수 자동 주입) |
| Azure OpenAI | *(선택)* `create_openai = true` 시 계정 + 채팅/임베딩 배포 생성 |

### 모듈 구조

- `modules/network`: VNet + Function App 통합 서브넷 + Private Endpoint 전용 서브넷
- `modules/storage`: Storage Account + Blob 컨테이너
- `modules/monitoring`: Log Analytics + Application Insights
- `modules/key_vault`: 환경변수 비밀 저장(Key Vault Secret)
- `modules/search`: Azure AI Search
- `modules/openai`: (옵션) Azure OpenAI + 배포
- `modules/acr`: Azure Container Registry
- `modules/compute`: App Service Plan
- `modules/function_app`: Linux Function App + VNet 통합 + AcrPull 역할 할당

루트에는 모듈 조합과 `azurerm_storage_account_network_rules.storage_lockdown`(Function App/VNet 통합 이후 적용)만 남겨 둔 구조입니다.

### 사용 방법(샘플)

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# terraform.tfvars에서 최소 다음을 수정:
# - resource_group_name: 사용할 기존 리소스 그룹 이름
# - acr_name: 전역 고유, 5–50자 영숫자
```

```bash
terraform init
terraform plan
terraform apply
```

### 출력값(Outputs) 활용 예시

```bash
terraform output -raw function_app_name
terraform output -raw acr_login_server
terraform output -raw storage_account_connection_string              # sensitive
terraform output -raw application_insights_connection_string         # sensitive
```

- Docker 배포 스크립트는 `terraform output`을 읽어 ACR/Function App 이름을 자동으로 채웁니다.
- 로컬 Docker 테스트 스크립트도 Storage/OpenAI/Search/App Insights 값을 `terraform output`으로 주입합니다.

---

## 7. 결론

Terraform은 IaC(Infrastructure as Code)로 인프라를 코드로 표준화·자동화해, 클라우드 전환과 규모 확장 과정에서의 운영 복잡도를 낮춥니다. 특히 `plan` 기반 사전 검증, State 기반 변경 관리, 모듈화를 통한 재사용성은 실무 안정성과 생산성을 동시에 끌어올리는 핵심 장점입니다.

---

## 8. 참고 자료

- Terraform 공식 문서: https://developer.hashicorp.com/terraform/docs
- HashiCorp 공식 사이트: https://www.hashicorp.com/
- 참고 글(추가 컨텍스트): https://kim-dragon.tistory.com/49
- 팀 세미나 슬라이드: https://docs.google.com/presentation/d/1-5sna0yG8WuQ6WU8pS-aGucLcKs7eMQsmQgmg8zaQw0/edit?usp=sharing
- Azure Terraform 샘플 코드: https://github.com/th-yong/azure_durable_function_skeleton/tree/dev/terraform