[//]: # (title: Kotlin/Native 지원 타겟 및 호스트)

이 문서는 Kotlin/Native 컴파일러가 지원하는 타겟과 호스트에 대해 설명합니다.

> 지원되는 타겟 및 호스트 목록, 티어(tier) 수 및 해당 기능은 진행 상황에 따라 조정될 수 있습니다.
>
{style="tip"}

## 타겟 티어 {id="target-tiers"}

Kotlin/Native 컴파일러는 다양한 타겟을 지원하지만, 지원 수준은 각기 다릅니다. 이러한 수준을 명확히 하기 위해 컴파일러의 지원 정도에 따라 타겟을 여러 티어로 나누었습니다.

티어 표는 다음과 같은 열로 구성됩니다:

* **Gradle 타겟 이름**은 Kotlin 멀티플랫폼 Gradle 플러그인에서 타겟을 활성화하는 데 사용되는 [타겟 이름](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#targets)입니다.
* **타겟 트리플(Target triple)**은 [컴파일러가 일반적으로 사용](https://clang.llvm.org/docs/CrossCompilation.html#target-triple)하는 `<architecture>-<vendor>-<system>-<abi>` 구조에 따른 타겟 이름입니다.
* **테스트 실행(Running tests)**은 사용자가 타겟에 대해 Gradle 및 IDE에서 별도의 설정 없이(out of the box) 테스트를 실행할 수 있는지 여부를 나타냅니다 (타겟 자체를 위해 실행되는 CI 테스트와 혼동하지 마세요).
  
  이는 특정 타겟에 대한 네이티브 호스트에서만 가능합니다. 예를 들어, `macosArm64` 및 `iosArm64` 테스트는 macOS ARM64 호스트에서만 실행할 수 있습니다.

### 티어 1 {id="tier-1"}

* 타겟이 컴파일 및 실행 가능한지 CI에서 정기적으로 테스트됩니다.
* 컴파일러 릴리스 간에 소스 및 [바이너리 호환성](https://youtrack.jetbrains.com/issue/KT-42293)을 제공합니다.

| Gradle 타겟 이름 | 타겟 트리플 | 테스트 실행 | 설명 |
|-------------------------|-------------------------------|---------------|---------------------------------------------------------------|
| Apple macOS 호스트 전용: |                               |               |                                                               |
| `macosArm64`            | `aarch64-apple-macos`         | ✅            | Apple Silicon 플랫폼의 Apple macOS 12.0 이상 |
| `iosSimulatorArm64`     | `aarch64-apple-ios-simulator` | ✅            | Apple Silicon 플랫폼의 Apple iOS 시뮬레이터 15.0 이상 |
| `iosArm64`              | `aarch64-apple-ios`           |               | ARM64 플랫폼의 Apple iOS 및 iPadOS 15.0 이상 |

### 티어 2 {id="tier-2"}

* 타겟이 컴파일 가능한지 CI에서 정기적으로 테스트되지만, 실행 가능 여부는 자동으로 테스트되지 않을 수 있습니다.
* 컴파일러 릴리스 간의 소스 및 [바이너리 호환성](https://youtrack.jetbrains.com/issue/KT-42293)을 제공하기 위해 최선을 다하고 있습니다.

| Gradle 타겟 이름 | 타겟 트리플 | 테스트 실행 | 설명 |
|-------------------------|-----------------------------------|---------------|------------------------------------------------------------------|
| `linuxX64`              | `x86_64-unknown-linux-gnu`        | ✅            | x86_64 플랫폼의 Linux |
| `linuxArm64`            | `aarch64-unknown-linux-gnu`       |               | ARM64 플랫폼의 Linux |
| Apple macOS 호스트 전용: |                                   |               |                                                                  |
| `watchosSimulatorArm64` | `aarch64-apple-watchos-simulator` | ✅            | Apple Silicon 플랫폼의 Apple watchOS 시뮬레이터 8.0 이상 |
| `watchosArm64`          | `arm64_32-apple-watchos`          |               | ILP32를 사용하는 ARM64 플랫폼의 Apple watchOS 8.0 이상 |
| `tvosSimulatorArm64`    | `aarch64-apple-tvos-simulator`    | ✅            | Apple Silicon 플랫폼의 Apple tvOS 시뮬레이터 15.0 이상 |
| `tvosArm64`             | `aarch64-apple-tvos`              |               | ARM64 플랫폼의 Apple tvOS 15.0 이상 |

### 티어 3 {id="tier-3"}

* 타겟이 CI에서 테스트되는 것을 보장하지 않습니다.
* 서로 다른 컴파일러 릴리스 간의 소스 및 바이너리 호환성을 약속할 수 없지만, 이러한 타겟에 대한 변경 사항은 매우 드뭅니다.

> 티어 3 타겟은 활발히 개발 중이지 않으며 중대한 문제가 발생할 수 있습니다.
> 주의해서 사용하세요.
> 
{style="warning"}

| Gradle 타겟 이름 | 타겟 트리플 | 테스트 실행 | 설명 |
|-------------------------|----------------------------------|---------------|------------------------------------------------------------------------------------------|
| `androidNativeArm32`    | `arm-unknown-linux-androideabi`  |               | ARM32 플랫폼의 [Android NDK](https://developer.android.com/ndk) |
| `androidNativeArm64`    | `aarch64-unknown-linux-android`  |               | ARM64 플랫폼의 [Android NDK](https://developer.android.com/ndk) |
| `androidNativeX86`      | `i686-unknown-linux-android`     |               | x86 플랫폼의 [Android NDK](https://developer.android.com/ndk) |
| `androidNativeX64`      | `x86_64-unknown-linux-android`   |               | x86_64 플랫폼의 [Android NDK](https://developer.android.com/ndk) |
| `mingwX64`              | `x86_64-pc-windows-gnu`          | ✅            | [MinGW](https://www.mingw-w64.org) 호환 레이어를 사용하는 64비트 Windows 10 이상 |
| Apple macOS 호스트 전용: |                                  |               |                                                                                          |
| `watchosDeviceArm64`    | `aarch64-apple-watchos`          |               | ARM64 플랫폼의 Apple watchOS 8.0 이상 |
| `iosX64`                | `x86_64-apple-ios-simulator`     |               | x86-64 플랫폼의 Apple iOS 시뮬레이터 15.0 이상 |

### 더 이상 사용되지 않는 타겟(Deprecated targets) {id="deprecated-targets"}

다음 타겟은 더 이상 사용되지 않으며(deprecated) 향후 제거될 예정입니다:

| 타겟 | 지원 중단 시작 | 설명 |
|-----------------|-------------------|----------------------------------------------------|
| `watchosArm32`  | Kotlin 2.4.20     | ARM32 플랫폼의 Apple watchOS 기기 |
| `macosX64`      | Kotlin 2.3.20     | x86_64 플랫폼의 Apple macOS |
| `watchosX64`    | Kotlin 2.3.20     | x86_64 플랫폼의 Apple watchOS 64비트 시뮬레이터 | 
| `tvosX64`       | Kotlin 2.3.20     | x86_64 플랫폼의 Apple tvOS 시뮬레이터 | 
| `linuxArm32Hfp` | Kotlin 1.8.20     | ARM32 플랫폼의 Linux |

### 더 낮은 버전의 Apple 타겟 지원 {id="supporting-lower-apple-target-versions"}

현재 기본적으로 지원되는 Apple 타겟의 최소 버전은 다음과 같습니다:

* iOS 및 tvOS: 15.0.
* macOS: 12.0.
* watchOS: 8.0.

프로젝트에서 기본 버전보다 낮은 버전을 지원해야 하는 경우, 빌드 파일에서 `freeCompilerArgs` 옵션을 사용하세요:

```kotlin
kotlin {
    targets.withType<org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget>().configureEach {
        binaries.configureEach {
            freeCompilerArgs += "-Xoverride-konan-properties=minVersion.ios=14.0"
            freeCompilerArgs += "-Xoverride-konan-properties=minVersion.macos=11.0"
            freeCompilerArgs += "-Xoverride-konan-properties=minVersion.tvos=14.0"
            freeCompilerArgs += "-Xoverride-konan-properties=minVersion.watchos=7.0"
        }
    }
}
```

### 라이브러리 작성자 가이드 {id="for-library-authors"}

라이브러리 작성자가 Kotlin/Native 컴파일러보다 더 많은 타겟을 테스트하거나 더 엄격한 보장을 제공하는 것은 권장하지 않습니다. 네이티브 타겟 지원을 고려할 때 다음 접근 방식을 사용할 수 있습니다:

* 티어 1, 2, 3의 모든 타겟을 지원합니다.
* 테스트 실행을 기본적으로 지원하는 티어 1 및 2의 타겟을 정기적으로 테스트합니다.

Kotlin 팀은 [kotlinx.coroutines](coroutines-guide.md) 및 [kotlinx.serialization](serialization.md)과 같은 공식 Kotlin 라이브러리에서 이 접근 방식을 사용합니다.

## 호스트 {id="hosts"}

Kotlin/Native 컴파일러는 다음 호스트를 지원합니다:

| 호스트 OS | 최종 바이너리 빌드 | `.klib` 아티팩트 생성 |
|----------------------------------------------------|------------------------------------------------|------------------------------------------------------------------------|
| Apple Silicon 기반 macOS (ARM64) | 모든 지원되는 타겟 | 모든 지원되는 타겟 |
| Intel 칩 기반 macOS (x86_64) | 모든 지원되는 타겟 | 모든 지원되는 타겟 |
| x86_64 아키텍처 기반 Linux | Apple 타겟을 제외한 모든 지원되는 타겟 | 모든 지원되는 타겟, Apple 타겟은 cinterop 의존성이 없는 경우만 |
| x86_64 아키텍처 기반 Windows (MinGW 툴체인) | Apple 타겟을 제외한 모든 지원되는 타겟 | 모든 지원되는 타겟, Apple 타겟은 cinterop 의존성이 없는 경우만 |

### 최종 바이너리 빌드 {id="building-final-binaries"}

최종 바이너리를 생성하려면 _지원되는 호스트_에서만 [지원되는 타겟](#target-tiers)에 대해 컴파일할 수 있습니다. 예를 들어, FreeBSD나 ARM64 아키텍처에서 실행되는 Linux 머신에서는 이 작업을 수행할 수 없습니다.

Linux 및 Windows에서 Apple 타겟용 최종 바이너리를 빌드하는 것도 불가능합니다.

### `.klib` 아티팩트 생성 {id="producing-klib-artifacts"}

일반적으로 Kotlin/Native는 _지원되는 모든 호스트_에서 지원되는 타겟을 위한 `.klib` 아티팩트를 생성할 수 있도록 허용합니다.

하지만 Linux 및 Windows에서 Apple 타겟에 대한 아티팩트 생성에는 여전히 몇 가지 제한 사항이 있습니다. 프로젝트에서 [cinterop 의존성](native-c-interop.md)([CocoaPods](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-overview.html) 포함)을 사용하는 경우 macOS 호스트를 사용해야 합니다.

예를 들어, x86_64 아키텍처에서 실행되는 Windows 머신에서 `macosArm64` 타겟용 `.klib`를 생성하려면 cinterop 의존성이 없어야 합니다.

## 다음 단계 {id="what-s-next"}

* [최종 네이티브 바이너리 빌드](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html)
* [Apple 타겟용 컴파일](https://kotlinlang.org/docs/multiplatform/multiplatform-publish-lib-setup.html#compilation-for-apple-targets)