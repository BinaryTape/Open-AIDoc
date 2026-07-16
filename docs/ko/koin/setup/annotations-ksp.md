---
title: KSP 어노테이션 설정 (사용 중단됨)
---

# KSP 어노테이션 설정

:::warning
**사용 중단됨(Deprecated)**: KSP 기반의 어노테이션 프로세싱 방식은 더 이상 사용되지 않습니다. 모든 새 프로젝트에서는 [Koin 컴파일러 플러그인](/docs/setup/compiler-plugin)으로 마이그레이션해 주세요.
:::

:::info
**어노테이션은 그대로 유지됩니다** - 빌드 설정만 변경됩니다. 아래의 [마이그레이션 가이드](#migration-to-compiler-plugin)를 참조하세요.
:::

## 왜 마이그레이션해야 하나요?

| 항목 | KSP 어노테이션 | 컴파일러 플러그인 |
|--------|-----------------|-----------------|
| **생성된 파일** | build/ 폴더에서 보임 | 없음 |
| **빌드 속도** | ⚠️ 더 느림 | 더 빠름 |
| **KMP 설정** | ⚠️ 복잡함 | 단순함 |
| **향후 지원** | ⚠️ 사용 중단됨 | ✅ 활발히 개발 중 |
| **사용자 코드** | ⚠️ 생성된 확장 함수 사용 | Kotlin 컴파일러 플러그인 전용 API 사용 |

## KSP를 사용하는 경우 (임시)

다음과 같은 경우에만 제한적으로 KSP를 사용하세요:
- Kotlin 1.x 버전에 머물러 있는 경우 (업그레이드 권장)
- 마이그레이션 중간 단계라 아직 전환할 수 없는 경우
- 특정 KSP 요구 사항이 있는 경우

## 현재 KSP 설정 (참조용)

KSP를 반드시 사용해야 하는 경우의 설정 방법은 다음과 같습니다:

### Gradle 설정

```kotlin
// build.gradle.kts
plugins {
    id("com.google.devtools.ksp") version "$ksp_version"
}

dependencies {
    implementation(platform("io.insert-koin:koin-bom:$koin_version"))
    implementation("io.insert-koin:koin-core")
    implementation("io.insert-koin:koin-annotations:$koin_ksp_version")
    ksp("io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
}
```

### 버전 호환성

| Koin Annotations | KSP 버전 | Kotlin 버전 |
|------------------|-------------|----------------|
| 1.4 | 1.9 | 1.9 |
| 2.0 | 2.0 | 2.0 |
| 2.1/2.2 | 2.1/2.2 | 2.1/2.2 |
| 2.3 | 2.3 | 버전 무관 |

### 기본 사용법

```kotlin
@Single
class MyComponent

@Module
class MyModule

// 생성된 확장 함수 임포트
import org.koin.ksp.generated.*

fun main() {
    startKoin {
        modules(MyModule().module)
    }
}
```

### KSP 옵션

```kotlin
// build.gradle.kts
ksp {
    arg("KOIN_CONFIG_CHECK", "true")  // 컴파일 타임 검증 활성화
}
```

:::note
이 KSP 기반 컴파일 타임 체크는 **Koin 컴파일러 플러그인**의 네이티브 컴파일 타임 안정성으로 대체될 예정입니다. [컴파일러 플러그인](/docs/setup/compiler-plugin)을 참조하세요.
:::

### KMP 설정 (복잡함)

```kotlin
// shared/build.gradle.kts
plugins {
    id("com.google.devtools.ksp")
}

kotlin {
    sourceSets {
        commonMain.dependencies {
            implementation("io.insert-koin:koin-core:$koin_version")
            implementation("io.insert-koin:koin-annotations:$koin_ksp_version")
        }
    }
}

dependencies {
    // 플랫폼별 KSP 설정이 필요함
    add("kspAndroid", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
    add("kspIosX64", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
    add("kspIosArm64", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
    add("kspIosSimulatorArm64", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
}
```

## Koin 컴파일러 플러그인으로 마이그레이션

### 1단계: Kotlin 업데이트

Kotlin 2.3.20+ 버전을 사용 중인지 확인하세요:

```kotlin
// build.gradle.kts
plugins {
    kotlin("jvm") version "2.3.20-Beta1" // 또는 그 이상
}
```

### 2단계: KSP 제거

KSP 플러그인 및 의존성을 제거합니다:

```kotlin
// 다음 항목들을 제거하세요:
plugins {
    // id("com.google.devtools.ksp")  // 제거
}

dependencies {
    // ksp("io.insert-koin:koin-ksp-compiler:...")  // 제거
}
```

### 3단계: 컴파일러 플러그인 추가

자세한 지침은 **[컴파일러 플러그인 설정 가이드](/docs/setup/compiler-plugin)**를 참조하세요.

### 4단계: 기존 코드 유지

**사용 중인 어노테이션은 정확히 그대로 유지됩니다 👍**

```kotlin
// 이 코드는 변경되지 않습니다!
@Singleton
class MyService(val repository: MyRepository)

@Factory
class MyRepository

@KoinViewModel
class MyViewModel(val service: MyService)

@Module
@ComponentScan("com.myapp")
class AppModule
```

### 5단계: Koin 시작 코드 업데이트

컴파일러 플러그인을 사용하면 **생성된 코드가 사용되지 않습니다**. 생성된 확장 함수를 타입 지정(typed) API로 교체하세요:

**변경 전 (KSP):**
```kotlin
import org.koin.ksp.generated.*

startKoin {
    modules(AppModule().module)  // 생성된 확장 함수 사용
}
```

**변경 후 (컴파일러 플러그인):**
```kotlin
@KoinApplication
@ComponentScan("com.myapp")
class MyApp

// 타입 지정 API 사용 - 생성된 코드 없음!
startKoin<MyApp>()

// 또는 설정을 포함하는 경우
startKoin<MyApp> {
    androidContext(this@MyApplication)
}
```

사용 가능한 타입 지정 API:
- `startKoin<T>()` - 애플리케이션 T를 사용하여 Koin을 전역적으로 시작
- `koinApplication<T>()` - T를 사용하여 독립된 KoinApplication 생성
- `koinConfiguration<T>()` - T로부터 KoinConfiguration 생성 (Compose KoinApplication, Ktor 등에서 사용)

여기서 `T`는 `@KoinApplication` 어노테이션이 달린 클래스입니다.

### 6단계: 정리

생성된 파일들을 삭제합니다:

```bash
rm -rf build/generated/ksp
```

프로젝트를 다시 빌드(Rebuild)하세요.

### 그대로 유지되는 항목

| 어노테이션 | 상태 |
|------------|--------|
| `@Singleton` / `@Single` | ✅ 동일 |
| `@Factory` | ✅ 동일 |
| `@Scoped` | ✅ 동일 |
| `@KoinViewModel` | ✅ 동일 |
| `@KoinWorker` | ✅ 동일 |
| `@Named` | ✅ 동일 |
| `@InjectedParam` | ✅ 동일 |
| `@Property` | ✅ 동일 |
| `@Module` | ✅ 동일 |
| `@ComponentScan` | ✅ 동일 |
| `@Configuration` | ✅ 동일 |

### 변경되는 항목

| 항목 | KSP | 컴파일러 플러그인 |
|--------|-----|-----------------|
| 빌드 플러그인 | `com.google.devtools.ksp` | `io.insert-koin.compiler.plugin` |
| 의존성 | `ksp()` 설정 | 필요 없음 |
| 생성된 파일 | `build/` 폴더에서 보임 | 없음 |
| Koin 시작 방식 | `modules(AppModule().module)` | `startKoin<MyApp>()` |
| KMP 설정 | 플랫폼별 KSP 설정 | 플러그인 설정만으로 가능 |

## 타임라인

:::warning
KSP 어노테이션은 향후 Koin 버전에서 삭제될 예정입니다. 가능한 한 빨리 마이그레이션하는 것을 권장합니다.
:::

## 도움말

마이그레이션 중 문제에 부딪히면 다음을 확인하세요:
- [트러블슈팅](/docs/reference/koin-core/troubleshooting) 확인
- [Slack](https://kotlinlang.slack.com/messages/koin/)에서 질문하기
- [GitHub](https://github.com/InsertKoinIO/koin)에 이슈 등록

## 다음 단계

- **[마이그레이션 가이드](/docs/migration/from-ksp-to-compiler-plugin)** - 컴파일러 플러그인으로의 단계별 마이그레이션
- **[컴파일러 플러그인 설정](/docs/setup/compiler-plugin)** - 전체 설정 가이드