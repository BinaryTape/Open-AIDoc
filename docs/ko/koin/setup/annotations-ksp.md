---
title: KSP 프로세서 설정 (지원 중단됨)
---

# KSP 프로세서 설정 (지원 중단됨)

이 문서는 이전에 Koin 어노테이션을 처리하는 데 사용되었던 KSP 프로세서인 `koin-ksp-compiler`의 Gradle 설정에 대해 설명합니다. 이 문서는 아직 해당 프로세서를 사용 중인 프로젝트를 위해 유지되고 있습니다. 새로운 프로젝트는 [Koin 컴파일러 플러그인](/docs/setup/compiler-plugin)을 사용하세요.

:::warning
`koin-ksp-compiler`는 지원 중단되었으며(deprecated) 향후 Koin 버전에서 제거될 예정입니다. 어노테이션 자체가 지원 중단된 것은 아닙니다. `koin-annotations`는 메인 Koin 프로젝트의 일부이며 Koin 컴파일러 플러그인을 통해 처리됩니다. 프로세서만 변경되는 것입니다. 자세한 내용은 [KSP에서 컴파일러 플러그인으로 마이그레이션하기](/docs/migration/from-ksp-to-compiler-plugin)를 참조하세요.
:::

## KSP 프로세서를 계속 사용해야 하는 경우 {id="when-to-keep-the-ksp-processor"}

다음과 같은 경우에만 일시적으로 유지하세요:

- **Kotlin 버전**: 프로젝트를 컴파일러 플러그인이 요구하는 Kotlin 2.3.20 이상으로 아직 업그레이드할 수 없는 경우.
- **마이그레이션 진행 중**: 빌드 설정을 전환하기 전에 먼저 배포를 완료해야 하는 경우.

컴파일러 플러그인과 비교했을 때, KSP 프로세서는 눈에 보이는 소스 파일을 생성하고, Kotlin Multiplatform 타깃별로 KSP 설정이 필요하며, Koin을 시작하기 위해 `AppModule().module`과 같이 생성된 확장 프로퍼티를 사용합니다.

## Gradle 설정 {id="gradle-setup"}

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

KSP를 사용할 때 `koin-annotations` 및 `koin-ksp-compiler`는 Koin 버전이 아닌 Koin Annotations 버전(`$koin_ksp_version`)을 따릅니다. 컴파일러 플러그인을 사용할 때는 `koin-annotations`가 Koin 버전을 따릅니다.

### 버전 호환성 {id="version-compatibility"}

| Koin Annotations | KSP | Kotlin |
|------------------|-----|--------|
| 1.4 | 1.9 | 1.9 |
| 2.0 | 2.0 | 2.0 |
| 2.1, 2.2 | 2.1, 2.2 | 2.1, 2.2 |
| 2.3 | 2.3 | 독립적 (Independent) |

## 생성된 모듈로 Koin 시작하기 {id="starting-koin-with-generated-modules"}

KSP는 각 `@Module` 클래스에 대해 `.module` 확장 프로퍼티를 생성합니다:

```kotlin
import org.koin.ksp.generated.*

@Single
class MyComponent

@Module
@ComponentScan
class MyModule

fun main() {
    startKoin {
        modules(MyModule().module)
    }
}
```

## 컴파일 타임 검증 {id="compile-time-check"}

KSP 프로세서에는 KSP 인수를 통해 활성화할 수 있는 자체 구성 검증(configuration check) 기능이 있습니다:

```kotlin
// build.gradle.kts
ksp {
    arg("KOIN_CONFIG_CHECK", "true")
}
```

컴파일러 플러그인은 이를 전체 그래프 및 모든 `get()` 호출 위치에 대한 검증으로 대체합니다. 자세한 내용은 [컴파일 타임 안전성](/docs/reference/koin-compiler/compile-safety)을 참조하세요.

## Kotlin Multiplatform {id="kotlin-multiplatform"}

KSP는 타깃당 하나의 설정이 필요합니다:

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
    add("kspAndroid", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
    add("kspIosX64", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
    add("kspIosArm64", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
    add("kspIosSimulatorArm64", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
}
```

컴파일러 플러그인을 사용할 때는 플러그인을 한 번만 적용하고 `commonMain`에 `koin-annotations`를 추가하기만 하면 됩니다.

## 컴파일러 플러그인으로 전환하기 {id="moving-to-the-compiler-plugin"}

전환 시 기존의 어노테이션이 지정된 클래스는 그대로 유지됩니다. KSP 및 `koin-ksp-compiler`를 제거하고, 컴파일러 플러그인을 적용한 뒤 생성된 소스를 삭제하고, `modules(MyModule().module)`을 `startKoin<MyApp>()`으로 대체하면 됩니다. 단계별 가이드는 [KSP에서 컴파일러 플러그인으로 마이그레이션하기](/docs/migration/from-ksp-to-compiler-plugin)를 참조하세요.

진행 중 문제가 발생하면 [Kotlin Slack #koin 채널](https://kotlinlang.slack.com/messages/koin/)에 문의하거나 [InsertKoinIO/koin-annotations](https://github.com/InsertKoinIO/koin-annotations)에 이슈를 등록해 주세요.

## 관련 문서 {id="related"}

- [KSP에서 마이그레이션하기](/docs/migration/from-ksp-to-compiler-plugin): 단계별 마이그레이션 가이드.
- [컴파일러 플러그인 설정](/docs/setup/compiler-plugin): 대체 플러그인 설치 방법.
- [스타일 선택하기](/docs/intro/choosing-your-style): 어노테이션 및 기타 스타일 비교.
- [어노테이션 레퍼런스](/docs/reference/koin-annotations/annotations-inventory): 모든 어노테이션 모음.