---
title: 컴파일러 플러그인 옵션
---

# 컴파일러 플러그인 옵션

이 페이지에서는 `build.gradle.kts`의 `koinCompiler { }` 블록에서 설정할 수 있는 Koin 컴파일러 플러그인의 모든 옵션을 소개합니다. 플러그인이 이미 설치되어 있다고 가정합니다([컴파일러 플러그인 설정](/docs/setup/compiler-plugin) 참조). 이 옵션들은 컴파일러 플러그인 DSL과 애너테이션 모두에 동일하게 적용됩니다.

## 전체 옵션 {id="all-options"}

```kotlin
// build.gradle.kts
plugins {
    alias(libs.plugins.koin.compiler)
}

koinCompiler {
    compileSafety = true
    skipDefaultValues = true
    unsafeDslChecks = true
    userLogs = false
    debugLogs = false
}
```

| 옵션 | 타입 | 기본값 | 설명 |
|--------|------|---------|--------|
| `compileSafety` | Boolean | `true` | 빌드 시점에 의존성 그래프의 유효성을 검사합니다. |
| `strictSafety` | Boolean | 자동 감지 | 어그리게이터(aggregator) 모듈을 빌드할 때마다 전체 그래프 검사를 다시 실행합니다. |
| `strictSafetyForceOff` | Boolean | `false` | `strictSafety` 자동 감지가 잘못되었음을 확인하고 비활성화합니다. |
| `skipDefaultValues` | Boolean | `true` | 해당 파라미터를 해결(resolve)하는 대신 Kotlin 기본값을 사용합니다. |
| `unsafeDslChecks` | Boolean | `true` | `create()`가 해당 람다의 유일한 명령문이어야 하도록 제한합니다. |
| `userLogs` | Boolean | `false` | 플러그인이 감지한 컴포넌트를 로그로 출력합니다. |
| `debugLogs` | Boolean | `false` | 플러그인 내부 동작 로그를 출력합니다. |
| `logSeverity` | String | `"warning"` | 플러그인의 정보성 출력에 대한 심각도(Severity)를 설정합니다. |
| `versionCheckSeverity` | String | `"warning"` | Kotlin 버전 호환성 경고에 대한 심각도를 설정합니다. |
| `aiAssist` | Boolean | `true` | Koin 진단 결과가 있는 빌드의 마지막에 도움말 안내 문구를 추가합니다. |

## compileSafety {id="compilesafety"}

활성화하면 플러그인이 빌드 시점에 그래프 내의 모든 의존성을 해결(resolve)할 수 있는지 검사합니다. 누락된 정의, 한정자(qualifier) 불일치, 순환 의존성, 일치하는 정의가 없는 `get()` 또는 `inject()` 호출 위치 등을 확인합니다. 문제가 발생하면 런타임에 크래시가 발생하는 대신 빌드가 실패합니다.

```kotlin
koinCompiler {
    compileSafety = false
}
```

이 옵션은 활성화된 상태로 유지하는 것이 좋습니다. 비활성화하면 모든 컴파일 타임 검사가 제거되며 `strictSafety`도 효과가 없어집니다. 검사되는 세부 항목은 [컴파일 타임 안전성](/docs/reference/koin-compiler/compile-safety)에 설명되어 있습니다.

## strictSafety {id="strictsafety"}

전체 그래프 검사는 Koin을 시작하는 모듈(어그리게이터: `startKoin`, `koinApplication` 또는 `@KoinApplication`이 포함된 Gradle 모듈)에서 실행됩니다. Kotlin 증분 컴파일(incremental compilation)은 `module { }` 람다 본문 내부를 편집하는 등 다른 위치에서 그래프가 변경되었을 때도 해당 모듈을 최신 상태(up-to-date)로 표시할 수 있습니다. 이 경우 검사가 다시 실행되지 않아 런타임에 오류가 나타나게 됩니다.

`strictSafety`를 활성화하면 빌드 캐시나 up-to-date 건너뛰기 없이 매 빌드마다 어그리게이터의 `compileKotlin` 태스크가 재실행됩니다. 라이브러리 및 피처 모듈은 증분 컴파일 상태를 유지합니다.

직접 설정할 필요는 없습니다. 이 옵션을 설정하지 않으면 Gradle 플러그인이 모듈 소스에서 `startKoin`, `koinApplication` 또는 `@KoinApplication`을 검색하여 해당 모듈에 대해 자동으로 활성화합니다. 결정 사항은 수명 주기 로그로 출력됩니다.

```
[Koin] Auto-enabling strictSafety on :app (detected startKoin / @KoinApplication / koinApplication).
```

감지되지 않은 모듈에 강제로 적용하려면 `strictSafety = true`로 설정합니다.

```kotlin
koinCompiler {
    strictSafety = true
}
```

진입점(entry point)이 감지된 모듈에서는 `strictSafety = false`로 설정해도 아무런 영향을 주지 않습니다(컴파일러 플러그인 1.1.0부터 적용). 이 옵션은 감지된 진입점이 없는 모듈에서만 유효합니다. `compileSafety = false`인 경우 이 옵션은 아무런 영향을 주지 않습니다.

이로 인해 빌드당 어그리게이터 모듈의 전체 재컴파일이 1회 발생합니다. 증분 컴파일 차이에 대한 배경 설명은 [koin-compiler-plugin issue #32](https://github.com/InsertKoinIO/koin-compiler-plugin/issues/32)에서 확인할 수 있습니다.

## strictSafetyForceOff {id="strictsafetyforceoff"}

감지 방식은 텍스트 매칭을 기반으로 합니다. 따라서 주석이나 문자열 리터럴에 포함된 `startKoin`도 감지하여 어그리게이터가 아닌 모듈에서 `strictSafety`를 활성화할 수 있습니다. 매칭이 잘못되었음을 확인했다면 두 옵션을 모두 설정하십시오.

```kotlin
koinCompiler {
    strictSafety = false
    strictSafetyForceOff = true
}
```

두 옵션이 모두 필요합니다. `strictSafetyForceOff`는 `strictSafety = false`와 함께 설정할 때만 적용됩니다. 잘못 감지된 것이 확실한 경우에만 사용하십시오. 실제 진입점이 있는 모듈에 사용하면 재실행이 비활성화되어 증분 빌드 이후 런타임에 그래프 오류가 발생할 수 있습니다.

## skipDefaultValues {id="skipdefaultvalues"}

활성화하면 Kotlin 기본값이 있는 널 불가(non-nullable) 파라미터는 기본값을 유지하며 Koin에서 해결(resolve)하지 않습니다.

```kotlin
@Singleton
class ApiClient(
    val repository: UserRepository,                         // Koin에서 주입됨
    val timeout: Int = 30_000,                              // Kotlin 기본값 사용
    @Property("api_url") val url: String = "https://...",   // 애너테이션이 지정되어 있으므로 주입됨
    val logger: Logger? = null,                             // getOrNull()로 주입됨
)
```

널 가능(nullable) 파라미터는 여전히 `getOrNull()`을 통해 해결됩니다. `@Named`, `@Qualifier`, `@InjectedParam` 또는 `@Property`가 지정된 파라미터는 기본값 유무와 상관없이 항상 해결됩니다. 모든 파라미터를 Koin에서 해결하려면 `skipDefaultValues = false`로 설정하십시오.

## unsafeDslChecks {id="unsafedslchecks"}

활성화하면 `create(::T)` 호출이 정의 람다 내의 유일한 명령문이어야 합니다. 이를 통해 플러그인이 람다를 분석하고 유효성을 검사할 수 있는 상태로 유지합니다. 이를 위반하면 빌드가 실패합니다.

```
[Koin][KOIN-S001] create(::UserRepository) must be the only instruction in the lambda. Other statements are not allowed when using create(). To disable this check, set koinCompiler { unsafeDslChecks = false } in your build.gradle.kts
```

`create()` 람다 내에서 다른 구문을 실행하는 클래식 DSL(Classic DSL) 코드를 마이그레이션하는 동안에는 이 값을 `false`로 설정했다가, 마이그레이션이 끝나면 다시 켜십시오.

## userLogs 및 debugLogs {id="userlogs-and-debuglogs"}

`userLogs = true`는 플러그인이 감지하고 처리하는 대상(가로챈 DSL 정의(`single<T>()`, `factory<T>()`), 애너테이션이 지정된 클래스(`@Singleton`, `@Module`), 생성된 모듈)을 출력합니다. 특정 정의가 감지되지 않을 때 사용하십시오.

`debugLogs = true`는 플러그인 내부 동작(FIR 및 IR 단계, 모듈 검색)을 출력합니다. 플러그인 버그를 리포트할 때 사용하십시오.

두 옵션 모두 `logSeverity`에 설정된 심각도로 `[Koin]` 접두사가 붙은 로그 라인을 출력합니다.

## logSeverity 및 versionCheckSeverity {id="logseverity-and-versioncheckseverity"}

두 옵션 모두 `"warning"`(기본값) 또는 `"info"`를 값으로 받습니다.

```kotlin
koinCompiler {
    logSeverity = "info"
    versionCheckSeverity = "info"
}
```

- **logSeverity**: 정보성 출력(`userLogs`, `debugLogs`, "Koin 진입점 없음" 알림, `@Monitor` 요약)의 심각도입니다. 빌드에서 `allWarningsAsErrors`를 사용하는 경우, 이러한 출력이 빌드 실패로 이어지지 않도록 `"info"`로 설정하십시오.
- **versionCheckSeverity**: 플러그인에서 검증되지 않은 Kotlin 버전으로 빌드할 때 표시되는 경고의 심각도입니다. 로그 출력을 숨기더라도 호환성 위험까지 가려지지 않도록 별도로 분리되어 있습니다. 사용 중인 Kotlin 버전이 정상 작동함을 확인한 후에만 `"info"`로 설정하십시오.

두 옵션 모두 실제 진단 메시지(`KOIN-D001`, `KOIN-W003` 등)를 변경하지는 않으며, 해당 진단 메시지는 고유한 심각도를 유지합니다.

## aiAssist {id="aiassist"}

빌드에서 하나 이상의 Koin 진단 결과가 보고되면, 플러그인은 컴파일 종료 시 Kotzilla MCP Server를 가리키는 한 줄의 안내를 추가합니다. AI 코딩 어시스턴트는 이를 활용해 오류를 분류하고 수정 방안을 제안할 수 있습니다.

```
[Koin] → Fix with AI: set up Kotzilla MCP at https://kotzilla.io/koin-mcp
```

이 안내 문구는 오류당 한 번이 아니라 빌드당 한 번만 출력됩니다. 숨기려면 `aiAssist = false`로 설정하십시오.

## 관련 문서 {id="related"}

- [컴파일 타임 안전성](/docs/reference/koin-compiler/compile-safety): `compileSafety`가 검사하는 항목 및 보고되는 진단 메시지.
- [컴파일러 플러그인 설정](/docs/setup/compiler-plugin): 플러그인 및 관련 의존성 설치 방법.
- [Koin 컴파일러 플러그인](/docs/intro/koin-compiler-plugin): 플러그인의 역할과 동작 방식.
- [문제 해결](/docs/reference/koin-core/troubleshooting): 런타임 오류 및 디버깅.