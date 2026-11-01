---
title: 버전, 로드맵 및 지원
---

# 버전, 로드맵 및 지원

이 페이지에서는 Koin의 버전 번호 체계와 릴리스 방식, 그리고 각 버전에 제공되는 지원 범위를 설명합니다. Koin은 오픈 소스이며 커뮤니티 중심으로 운영됩니다. Koin을 개발하는 기업인 Kotzilla는 지원이 필요한 팀을 위해 상용 장기 지원(LTS)도 제공하고 있습니다.

## 릴리스 주기 {id="release-cycle"}

Koin은 Kotlin 언어 및 라이브러리 업데이트에 발맞추기 위해 약 6개월의 릴리스 주기를 따릅니다. 각 릴리스는 피드백을 수집하기 위해 6주 이상의 베타 기간을 거칩니다.

버전이 릴리스되면 커뮤니티 지원 단계는 최소 6개월 동안 지속됩니다. 이 기간 동안 팀은 피드백을 수집하고 Kotlin, Android, Ktor 및 기타 라이브러리와 같이 Koin에 영향을 주는 업데이트를 추적합니다.

각 버전의 변경 사항은 [릴리스 및 업그레이드 가이드](/docs/support/releases)를 참조하세요.

## 버전 번호 {id="version-numbers"}

Koin 버전은 `Major.Minor.Patch` 형식을 따릅니다.

- **Patch**: 버그 수정 및 의존성 라이브러리의 마이너 업데이트만 포함됩니다.
- **Minor**: 새로운 기능 추가 및 지원 중단(deprecation)이 포함됩니다.
- **Major**: 영향도가 큰 새로운 기능, 지원 중단 및 브레이킹 체인지(breaking changes)가 포함됩니다.

프리릴리스 접미사(alpha, beta, RC)와 `@KoinExperimentalAPI` 및 `@Deprecated`의 의미는 [API 안정성](/docs/support/api-stability)에 설명되어 있습니다.

## 커뮤니티 지원 {id="community-support"}

커뮤니티 지원은 현재 릴리스 라인을 사용하는 모든 사용자에게 제공됩니다.

- **GitHub Issues**: [github.com/InsertKoinIO/koin](https://github.com/InsertKoinIO/koin)의 버그 리포트 및 기능 요청.
- **문서**: 공식 사이트 [insert-koin.io](https://insert-koin.io).
- **Slack**: [Kotlin Slack #koin](https://kotlinlang.slack.com/messages/koin/)의 커뮤니티 토론.
- **Stack Overflow**: [koin](https://stackoverflow.com/questions/tagged/koin) 태그가 지정된 질문.
- **릴리스 노트**: [릴리스](/docs/support/releases)의 업그레이드 가이드.

## Kotzilla의 엔터프라이즈 지원 {id="enterprise-support-by-kotzilla"}

일부 기업은 법적, 비즈니스적 또는 기술적 이유로 Koin의 릴리스 주기를 따르기 어려울 수 있습니다. 또한 기업 차원의 기술 지원과 명확한 오픈 소스 라이선스 보증이 필요할 수도 있습니다.

Kotzilla는 이를 위해 두 가지 엔터프라이즈 구독 상품을 제공합니다. 두 상품 모두 동일한 방식으로 작동합니다. 즉, 직접 제어할 수 있는 특정 버전에 고정되어 비공개로 유지 관리되는 Koin 빌드를 제공받으며, 수정 사항은 최신 공개 릴리스뿐만 아니라 해당 빌드에도 반영되어 제공됩니다.

- **[Koin LTS](#long-term-support-lts)**: 고정 버전을 유지해야 하는 애플리케이션을 위해 `org.koin.*` 네임스페이스로 배포되는 유지 관리 Koin 라인입니다.
- **[Koin Embedded LTS](#koin-embedded-lts)**: SDK 및 라이브러리 벤더를 위한 상품입니다. 자체 전용 네임스페이스로 재배치(relocate)된 Koin LTS 전용 버전을 제공합니다.

전문적인 Koin 기술 지원 계약은 LTS 또는 Embedded LTS 구독 형태로 체결됩니다. 그 이상의 별도 상위 등급은 없습니다. SLA, 아키텍처 리뷰, 교육과 같은 약정은 해당 구독에 대한 [부가 서비스](#add-on-services)로 제공됩니다.

### 장기 지원 (LTS) {id="long-term-support-lts"}

LTS 라인은 커뮤니티 지원 단계가 종료된 후에도 Kotzilla가 지속적으로 유지 관리하는 Koin 버전입니다. 보안 패치와 고객이 보고한 버그 수정 사항이 백포트되어 구독자에게 배포되므로, 알려진 결함 없이 해당 버전을 계속 사용할 수 있습니다.

지원 정책:

- **최소 기간**: 각 LTS 라인은 지정된 시점부터 최소 18개월 동안 보장됩니다. 이는 최소 보장 기간(floor)이며, 지원 종료 일정이 아닙니다.
- **적용 범위**: 사용 중인 버전에 대해 해당 기간 이후에도 구독이 활성 상태인 한 지원이 지속됩니다. 18개월은 특정 라인을 지정하고 유지 관리하겠다는 약정의 하한선입니다. 실제 보장 범위는 여기에 게시된 날짜가 아닌 계약 내용에 따라 결정됩니다.
- **신규 라인**: 주요 Kotlin 베이스라인마다 새로운 LTS 라인이 지정되며, 이전 라인으로부터의 단계별 안내 업그레이드가 제공되어 지원 공백이 발생하지 않습니다. 마이그레이션 중에 지원을 받지 못하는 상황은 발생하지 않습니다.

이 페이지에는 지원 종료 날짜가 게시되지 않습니다. 지원 범위는 구독 상태 및 실행 중인 버전에 따라 달라지며, 계약서에 명시됩니다.

#### 제공되는 LTS 라인 {id="available-lts-lines"}

두 라인은 순차적이 아니라 병렬로 유지 관리됩니다. 프로젝트의 Kotlin 베이스라인에 맞는 라인을 선택하세요. 지원을 받기 위해 굳이 `3.5.6`에서 다른 버전으로 마이그레이션할 필요는 없습니다.

| LTS 라인 | Kotlin 베이스라인 | 대상 환경 |
|----------|-----------------|--------------|
| Koin 3.5.6 LTS | Kotlin 1.x | Kotlin 2.x로 이전할 수 없는 프로젝트: 레거시 툴체인, 장기 운영 엔터프라이즈 앱, 제약이 있는 빌드 환경 |
| Koin 4.2.x LTS | Kotlin 2.x | 매 릴리스를 따라가는 대신 고정되고 유지 관리되는 Koin 버전을 원하는 Kotlin 2.x 툴체인 기반 프로젝트 |

:::note
LTS 라인은 특정 패치 레벨에서 지정되며, 해당 패치 레벨이 최소 요구 사양이 됩니다. 즉, `3.5.6`은 Kotlin 1.x 라인에서 지원되는 가장 낮은 버전입니다. 그보다 낮은 버전은 지원되지 않습니다. 현재 이전 패치를 사용 중이라면 LTS 패치 레벨로 업그레이드하는 것이 온보딩 과정에 포함됩니다.
:::

Kotlin 1.x 라인에서 Kotlin 2.x 라인으로의 업그레이드는 서비스 구성에 포함되어 있습니다. Koin 팀이 마이그레이션을 가이드하며, 전환 작업 중에도 현재 사용 중인 라인의 지원이 유지됩니다.

#### 포함 사항 {id="what-s-included"}

- **유지 관리 및 호환성**: 사용 중인 LTS 라인에서 Android 및 Kotlin 생태계와의 기능 호환성이 유지됩니다.
- **지원**: Slack 및 전용 이메일을 통한 Koin 팀으로의 우선 지원 채널 제공.
- **법적 규정 준수**: 감사(audited)된 Apache 2.0 라이선스를 제공하며, Kotzilla가 라이선스 준수에 대한 책임을 집니다.
- **투명성**: 코드베이스에 대한 전체 접근 권한 제공 및 커뮤니티에서 확인된 수정 사항의 라인 통합.

### Koin Embedded LTS {id="koin-embedded-lts"}

Koin을 내부적으로 사용하는 SDK나 라이브러리를 배포할 때, `org.koin.*` 네임스페이스로 배포하면 호스트 애플리케이션의 Koin 버전이나 동일한 앱 내에서 Koin을 내장하고 있는 다른 SDK와 충돌이 발생할 수 있습니다.

Koin Embedded LTS는 이 문제를 해결합니다. 최소 18개월 동안 유지 관리되는 충돌 없는 자체 전용 Koin LTS 버전을 제공합니다. Kotzilla는 유지 관리되는 [LTS 라인](#available-lts-lines)을 고객 전용 네임스페이스로 재배치(relocate)한 후, 고객을 위해 직접 빌드, 서명, 호스팅 및 유지 관리를 수행합니다. `koin-core` 및 `koin-android`가 지원 대상입니다.

또한 서로 다른 트레이드오프를 가진 무료 셀프 서비스 방식의 Koin 재배치 방법도 있습니다. [SDK 및 라이브러리용 Koin](/docs/support/embedded) 문서에서 충돌 케이스, 셀프 서비스 옵션 및 [전체 Embedded LTS 상품](/docs/support/embedded#koin-embedded-lts)에 대해 자세히 다룹니다.

### 지원 등급 {id="support-tiers"}

| | 커뮤니티 | Koin LTS | Koin Embedded LTS |
|---|---|---|---|
| 대상 | 일반 사용자: 앱, 오픈 소스 프로젝트, 최신 릴리스를 사용하는 팀 | 특정 Koin 버전을 고정하여 유지해야 하는 기업 | 아티팩트 내에 Koin을 포함하여 배포하는 SDK 및 라이브러리 벤더 |
| 제공 버전 | 최신 공개 릴리스 | 지정된 LTS 라인 (비공개로 유지 관리) | 지정된 LTS 라인 (고객 네임스페이스로 재배치) |
| 네임스페이스 | `org.koin.*` | `org.koin.*` | `acme.koin.*`과 같은 고객 전용 네임스페이스 |
| 배포 방식 | Maven Central | Kotzilla 저장소 (고객 자격 증명을 통한 비공개 접근) | Kotzilla 저장소 (해당 조직을 위한 비공개 저장소) |
| 보안 패치 | 현재 릴리스 라인에만 제공 | 고객의 LTS 라인에 백포트 | 고객의 빌드에 백포트 및 재배치 적용 |
| 고객 이슈 수정 | 공개 GitHub 이슈를 통한 최선 노력 원칙(Best effort) 지원 | 고객의 LTS 빌드에 수정 사항 반영 및 제공 | 고객 빌드에 수정 사항 반영 및 제공 |
| Koin 팀 직접 소통 채널 | 미제공 (공개 Slack 및 GitHub만 가능) | Slack 및 전용 이메일을 통한 우선 지원 접근 권한 | Slack 및 전용 이메일을 통한 우선 지원 접근 권한 |
| 업그레이드 지원 | 공개 마이그레이션 가이드 | LTS 라인 간 안내형 업그레이드 지원 | 안내형 업그레이드 지원 및 대상 버전에 맞춘 재배치 재빌드 |

### 부가 서비스 {id="add-on-services"}

다음 서비스는 Koin LTS 또는 Koin Embedded LTS 구독 외에 추가로 계약할 수 있습니다. 별도의 상위 등급이 아닙니다.

- **서비스 수준 계약 (SLA)**: 계약에 명시된 응답 시간 보장 약정.
- **아키텍처 리뷰**: Koin 팀이 직접 진행하는 Koin 설정 및 모듈 구조 검토.
- **교육 및 워크숍**: Koin 활용 모범 사례에 대한 팀 대상 교육.

세부 조건은 계약별로 합의됩니다. 적용 범위에 대해서는 [팀에 문의](#contact)하세요.

### 등급 선택 {id="choosing-a-tier"}

- **커뮤니티**: 최신 Koin 릴리스를 지속적으로 따라가며 공개 지원만으로 충분한 경우.
- **Koin LTS**: 특정 버전을 유지해야 하며, 해당 버전에 대한 버그 수정 지원이 필요한 경우.
- **Koin Embedded LTS**: 자체 아티팩트 내에 Koin을 재배포하며 최종 사용자와의 네임스페이스 충돌 위험을 방지해야 하는 경우.

## 문의 {id="contact"}

- **Koin LTS 및 Koin Embedded LTS**: [Koin 장기 지원(LTS)](https://kotzilla.io/koin-lts)
- **Kotzilla 플랫폼**: [kotzilla.io](https://kotzilla.io)
- **일반 문의**: [koin@kotzilla.io](mailto:koin@kotzilla.io)
- **커뮤니티 Slack**: [Kotlin Slack #koin](https://kotlinlang.slack.com/messages/koin/)

## 관련 문서 {id="related"}

- [릴리스 및 업그레이드 가이드](/docs/support/releases): 각 버전의 변경 사항 및 업그레이드 방법.
- [API 안정성](/docs/support/api-stability): 실험적(experimental), 지원 중단(deprecated), 내부(internal) API 및 릴리스 유형.
- [SDK 및 라이브러리용 Koin](/docs/support/embedded): SDK 내에서 Koin 재배치하기.
- [프로덕션 및 툴링](/docs/tooling): IDE 플러그인 및 프로덕션 모니터링.