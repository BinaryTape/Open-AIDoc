---
title: API 안정성 및 릴리스 유형
---

# API 안정성 및 릴리스 유형

이 페이지에서는 Koin API의 안정성 규약(stability contract)을 설명합니다. 새로운 API가 도입되는 방식, 이전 API가 제거되는 방식, 그리고 각 릴리스 유형이 보장하는 바를 다룹니다. 각 버전의 변경 사항은 [릴리스 및 업그레이드 가이드](/docs/support/releases)를 참조하세요.

## 버전 간 호환성 {id="compatibility-between-versions"}

Koin은 기존 애플리케이션이 버전이 바뀌어도 계속해서 동작하도록 유지하는 것을 목표로 합니다. Kotzilla 팀과 메인테이너들은 새로운 릴리스의 변경 사항, 개선 사항 및 최적화가 기존 코드를 손상시키지 않는지 검증합니다. 부득이하게 API를 변경해야 하는 경우에는 아래의 실험적 기능 및 지원 중단 단계를 거치므로, 미리 업그레이드를 계획할 수 있습니다.

## 실험적 API (Experimental APIs) {id="experimental-apis"}

새로운 기능은 먼저 `@KoinExperimentalAPI` 어노테이션과 함께 공개됩니다. 실험적 API의 특징은 다음과 같습니다.

- **활발히 개발 중**: 아직 설계가 확정되지 않았으며 변경될 수 있습니다.
- **피드백 수렴**: 기능을 사용해 보고 잘 동작하는 부분과 그렇지 않은 부분을 공유해 주시면 최종 설계를 완성하는 데 도움이 됩니다.
- **보장되지 않음**: 피드백에 따라 이후 릴리스에서 변경되거나 제거될 수 있습니다.

옵트인(opt-in) 없이 실험적 API를 사용하면 컴파일러 경고가 발생합니다. Kotlin의 `@OptIn`을 사용하여 옵트인할 수 있습니다.

```kotlin
@OptIn(KoinExperimentalAPI::class)
fun setupKoin() { ... }
```

옵트인을 사용하면 코드에서 불안정한 API에 의존하고 있음을 명시적으로 드러낼 수 있습니다.

## 주의가 필요한 API (Delicate APIs) {id="delicate-apis"}

`@KoinDelicateAPI`는 안정적이지만 주의해서 다뤄야 하는 API를 나타냅니다. 이러한 API는 특정 고급 사용 사례를 대상으로 하며, 잘못 사용할 경우 런타임에 예기치 않은 동작을 유발할 수 있습니다. 실험적 API와 마찬가지로 `@OptIn(KoinDelicateAPI::class)`를 통해 옵트인하기 전까지는 컴파일러 경고가 발생합니다. 옵트인하기 전에 API 문서를 반드시 확인하세요.

## 지원 중단된 API (Deprecated APIs) {id="deprecated-apis"}

단계적으로 폐지될 예정인 API에는 Kotlin의 `@Deprecated`가 지정됩니다. 메시지를 통해 대체할 기능이나 중단 이유를 안내합니다. 간단한 업데이트의 경우 `ReplaceWith`가 제공되어 IDE에서 자동으로 적용할 수 있습니다.

지원 중단은 다음 두 단계를 거칩니다.

- **Warning**: API가 여전히 동작하지만, 조만간 대체해야 합니다.
- **Error**: API가 더 이상 컴파일되지 않습니다. 업그레이드하기 전에 반드시 대체해야 합니다.

Error 수준으로 지원 중단된 API는 일반적으로 이후 릴리스에서 제거됩니다. [릴리스 노트](/docs/support/releases)에서 각 버전별 지원 중단 및 제거 항목 목록을 확인할 수 있습니다.

## 내부 API (Internal APIs) {id="internal-apis"}

`@KoinInternalApi`는 Koin 자체 메커니즘을 위해 존재하는 함수와 클래스를 나타냅니다. 이들은 공개 계약(public contract)의 일부가 아닙니다.

- **내부 전용**: 애플리케이션 코드가 아닌 Koin의 자체 구현을 위한 것입니다.
- **변경 가능성 있음**: 예고 없이 어떤 릴리스에서든 변경되거나 사라질 수 있습니다.

옵트인 없이 사용하면 컴파일 에러가 발생합니다. 애플리케이션 코드에서는 옵트인하지 마세요.

## 릴리스 유형 {id="release-types"}

Koin은 시맨틱 버저닝(Semantic Versioning, `Major.Minor.Patch`, [버전, 로드맵 및 지원](/docs/support/) 참조)을 따릅니다. 프리릴리스(Pre-release) 버전에는 완성도를 나타내는 접미사가 붙습니다.

- **Alpha 및 Beta**: 테스트 및 피드백 수렴을 위해 배포됩니다. 실험적 기능이 포함되어 있는 경우가 많으며 안정적인 API 보장을 완전히 따르지 않습니다. 비프로덕션 환경에서 사용하세요.
- **Release Candidate (RC)**: 안정 버전의 기능 구현이 완료된 후보 버전으로, 최종 테스트 단계에 있습니다. 최종 릴리스와 호환될 것으로 예상되지만, 피드백에 따라 사소한 변경이 발생할 수 있습니다.

## 관련 문서 {id="related"}

- [릴리스 및 업그레이드 가이드](/docs/support/releases): 각 버전의 변경 사항, 지원 중단 및 제거된 항목.
- [버전, 로드맵 및 지원](/docs/support/): 릴리스 주기 및 지원 옵션.
- [KSP에서 컴파일러 플러그인으로 마이그레이션](/docs/migration/from-ksp-to-compiler-plugin): 지원 중단된 KSP 프로세서 이전 가이드.