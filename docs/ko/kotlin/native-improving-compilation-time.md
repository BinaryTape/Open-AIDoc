[//]: # (title: 컴파일 시간 개선을 위한 팁)

<show-structure depth="1"/>

Kotlin/Native 컴파일러는 성능 향상을 위해 지속적으로 업데이트되고 있습니다. 최신 Kotlin/Native 컴파일러와 적절하게 구성된 빌드 환경을 사용하면, Kotlin/Native 타겟이 포함된 프로젝트의 컴파일 시간을 크게 단축할 수 있습니다.

Kotlin/Native 컴파일 프로세스의 속도를 높이는 방법은 아래 팁을 참고하세요.

## 일반 권장 사항 {id="general-recommendations"}

### 최신 버전의 Kotlin 사용 {id="use-the-latest-version-of-kotlin"}

최신 버전을 사용하면 항상 최신 성능 개선 사항을 적용받을 수 있습니다. 현재 최신 Kotlin 버전은 %kotlinVersion%입니다.

### 거대한 클래스 생성 피하기 {id="avoid-creating-huge-classes"}

컴파일 시간이 오래 걸리고 실행 중에 로드하는 데 시간이 많이 소요되는 거대한 클래스는 생성하지 않는 것이 좋습니다.

### 빌드 간 다운로드 및 캐시된 컴포넌트 보존 {id="preserve-downloaded-and-cached-components-between-builds"}

프로젝트를 컴파일할 때 Kotlin/Native는 필요한 컴포넌트를 다운로드하고 작업 결과의 일부를 `$USER_HOME/.konan` 디렉토리에 캐싱합니다. 컴파일러는 이후 컴파일에서 이 디렉토리를 사용하여 완료 시간을 단축합니다.

컨테이너(Docker 등)나 지속적 통합(CI) 시스템에서 빌드할 때, 컴파일러가 매 빌드마다 `~/.konan` 디렉토리를 처음부터 다시 생성해야 할 수도 있습니다. 이 단계를 피하려면 빌드 간에 `~/.konan`이 유지되도록 환경을 구성하세요. 예를 들어, `konan.data.dir` Gradle 속성을 사용하여 위치를 재정의할 수 있습니다.

또는 `cinterop` 및 `konanc` 도구를 통해 `-Xkonan-data-dir` 컴파일러 옵션을 사용하여 디렉토리에 대한 커스텀 경로를 구성할 수 있습니다.

## Gradle 구성 {id="gradle-configuration"}

Gradle을 사용한 첫 번째 컴파일은 의존성 다운로드, 캐시 구축 및 추가 단계 수행이 필요하기 때문에 일반적으로 이후 컴파일보다 시간이 더 오래 걸립니다. 실제 컴파일 시간을 정확하게 측정하려면 프로젝트를 최소 두 번 이상 빌드해야 합니다.

더 나은 컴파일 성능을 위한 Gradle 구성 권장 사항은 다음과 같습니다.

### Gradle 힙 크기 늘리기 {id="increase-gradle-heap-size"}

[Gradle 힙 크기](https://docs.gradle.org/current/userguide/performance.html#adjust_the_daemons_heap_size)를 늘리려면 `gradle.properties` 파일에 `org.gradle.jvmargs=-Xmx3g`를 추가하세요.

[병렬 빌드](https://docs.gradle.org/current/userguide/performance.html#parallel_execution)를 사용하는 경우, `org.gradle.workers.max` 속성이나 `--max-workers` 명령줄 옵션을 사용하여 적절한 워커(worker) 수를 선택해야 할 수도 있습니다. 기본값은 CPU 프로세서 수입니다.

### 필요한 바이너리만 빌드 {id="build-only-necessary-binaries"}

꼭 필요한 경우가 아니면 `build`나 `assemble`과 같이 프로젝트 전체를 빌드하는 Gradle 태스크를 실행하지 마세요. 이러한 태스크는 동일한 코드를 한 번 이상 빌드하여 컴파일 시간을 늘립니다. IntelliJ IDEA에서 테스트를 실행하거나 Xcode에서 앱을 시작하는 것과 같은 일반적인 상황에서는 Kotlin 툴링이 불필요한 태스크 실행을 피합니다.

일반적이지 않은 사례나 빌드 구성인 경우, 직접 태스크를 선택해야 할 수도 있습니다.

* `linkDebug*`. 개발 중에 코드를 실행하려면 대개 하나의 바이너리만 필요하므로, 해당되는 `linkDebug*` 태스크만 실행해도 충분합니다.
* `embedAndSignAppleFrameworkForXcode`. iOS 시뮬레이터와 디바이스는 서로 다른 프로세서 아키텍처를 가지기 때문에 Kotlin/Native 바이너리를 유니버설(fat) 프레임워크로 배포하는 것이 일반적인 방식입니다.

  하지만 로컬 개발 중에는 사용 중인 플랫폼에 대해서만 `.framework` 파일을 빌드하는 것이 더 빠릅니다. 특정 플랫폼용 프레임워크를 빌드하려면 [embedAndSignAppleFrameworkForXcode](https://kotlinlang.org/docs/multiplatform/multiplatform-direct-integration.html#connect-the-framework-to-your-project) 태스크를 사용하세요.

### 필요한 타겟에 대해서만 빌드 {id="build-only-for-necessary-targets"}

위의 권장 사항과 마찬가지로, 모든 네이티브 플랫폼에 대한 바이너리를 한 번에 빌드하지 마세요. 예를 들어, [XCFramework](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html#build-xcframeworks)를 컴파일하면(`*XCFramework` 태스크 사용) 모든 타겟에 대해 동일한 코드를 빌드하므로 단일 타겟을 빌드하는 것보다 비례하여 더 많은 시간이 소요됩니다.

설정상 XCFramework가 꼭 필요한 경우 타겟 수를 줄일 수 있습니다. 예를 들어, 인텔 기반 Mac의 iOS 시뮬레이터에서 프로젝트를 실행하지 않는다면 `iosX64`는 필요하지 않습니다.

> 서로 다른 타겟에 대한 바이너리는 `linkDebug*$Target` 및 `linkRelease*$Target` Gradle 태스크로 빌드됩니다.
> `--scan` 옵션과 함께 Gradle 빌드를 실행하여 빌드 로그나 [Gradle build scan](https://docs.gradle.org/current/userguide/build_scans.html)에서 실행된 태스크를 확인할 수 있습니다.
>
{style="tip"}

### 불필요한 릴리스 바이너리를 빌드하지 마세요 {id="don-t-build-unnecessary-release-binaries"}

Kotlin/Native는 [디버그(debug)와 릴리스(release)](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html#declare-binaries) 두 가지 빌드 모드를 지원합니다. 릴리스 모드는 고도로 최적화되며 많은 시간이 소요됩니다. 릴리스 바이너리의 컴파일은 디버그 바이너리보다 훨씬 더 많은 시간이 걸립니다.

실제 출시를 제외하고, 일반적인 개발 사이클에서 이러한 모든 최적화는 불필요할 수 있습니다. 개발 프로세스 중에 이름에 `Release`가 포함된 태스크를 사용하고 있다면 이를 `Debug`로 바꾸는 것을 고려해 보세요. 예를 들어, `assembleXCFramework`를 실행하는 대신 `assembleSharedDebugXCFramework`를 실행할 수 있습니다.

> 릴리스 바이너리는 `linkRelease*` Gradle 태스크로 빌드됩니다. `--scan` 옵션과 함께 Gradle 빌드를 실행하여 빌드 로그나 [Gradle build scan](https://docs.gradle.org/current/userguide/build_scans.html)에서 해당 태스크를 확인할 수 있습니다.
>
{style="tip"}

### 릴리스 바이너리 캐시 활성화하기 {id="enable-caches-for-release-binaries"}
<primary-label ref="experimental-opt-in"/>

기본적으로 Kotlin/Native는 링크 타임 최적화(LTO) 모드로 릴리스 바이너리를 컴파일합니다. 즉, 모든 모듈이 함께 컴파일되고 최적화됩니다. 이를 통해 런타임 시 릴리스 바이너리가 더 빨라지지만, 컴파일 시간이 크게 증가합니다.

일부 컴파일러 최적화보다 빠른 컴파일을 우선시하고 싶다면 릴리스 모드에서 캐싱을 활성화할 수 있습니다. 캐싱을 활성화하려면 `gradle.properties` 파일에 다음 두 옵션을 모두 추가하세요.

```properties
# Enables the compiler to use caches in release mode
kotlin.native.binary.enableReleaseBinaryCache=true
# Makes the Kotlin Gradle plugin invoke the compiler with `-Xauto-cache-from` and related options
kotlin.internal.native.enableReleaseBinaryCache=true
```

> 이 기능은 활발히 개발 중이므로 런타임 성능에 아직 개선의 여지가 있습니다.
> 향후 Kotlin 릴리스에서 성능 개선이 예정되어 있습니다.
> 
{style="warning"}

### 릴리스 바이너리 크기 줄이기 {id="reduce-the-size-of-release-binaries"}
<primary-label ref="experimental-opt-in"/>

릴리스 바이너리의 크기를 줄이고 빌드 시간을 개선하려면, `smallBinary` [바이너리 옵션을 활성화](native-binary-options.md#how-to-enable)해 보세요.

이는 LLVM 컴파일 단계에서 컴파일러의 기본 최적화 인자로 `-Oz`를 효과적으로 설정합니다. 이 옵션은 아직 [실험적(Experimental)](components-stability.md#stability-levels-explained) 단계이며, 일부 경우에 런타임 성능에 영향을 줄 수 있습니다.

### 전이적 익스포트를 사용하지 마세요 {id="don-t-use-transitive-export"}

[`transitiveExport = true`](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html#export-dependencies-to-binaries)를 사용하면 많은 경우 데드 코드 제거(dead code elimination)가 비활성화되어 컴파일러가 사용되지 않는 많은 코드를 처리해야 합니다. 이는 컴파일 시간을 증가시킵니다. 대신 필요한 프로젝트와 의존성을 내보낼 때는 `export` 메서드를 명시적으로 사용하세요.

### 모듈을 과도하게 익스포트하지 마세요 {id="don-t-export-modules-too-much"}

불필요한 [모듈 익스포트(module export)](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html#export-dependencies-to-binaries)를 피하세요. 익스포트된 각 모듈은 컴파일 시간과 바이너리 크기에 부정적인 영향을 미칩니다.

### Gradle 빌드 캐싱 사용 {id="use-gradle-build-caching"}

Gradle [빌드 캐시(build cache)](https://docs.gradle.org/current/userguide/build_cache.html) 기능을 활성화하세요.

* **로컬 빌드 캐시**. 로컬 캐싱을 위해 `gradle.properties` 파일에 `org.gradle.caching=true`를 추가하거나 명령줄에서 `--build-cache` 옵션으로 빌드를 실행하세요.
* **원격 빌드 캐시**. 지속적 통합(CI) 환경을 위해 [원격 빌드 캐시를 구성](https://docs.gradle.org/current/userguide/build_cache.html#sec:build_cache_configure_remote)하는 방법을 알아보세요.

### Gradle 구성 캐시 사용 {id="use-gradle-configuration-cache"}

Gradle [구성 캐시(configuration cache)](https://docs.gradle.org/current/userguide/configuration_cache.html)는 구성 단계의 결과를 캐싱하여 빌드 성능을 향상시킵니다. 또한 단일 프로젝트 내에서 독립적인 태스크의 병렬 실행을 가능하게 하며, `org.gradle.parallel` 속성을 암시적으로 활성화하여 서로 다른 프로젝트 간의 태스크를 [병렬로 실행](https://docs.gradle.org/current/userguide/performance.html#sec:enable_parallel_execution)할 수 있게 합니다.

Gradle 구성 캐시를 사용하려면 `gradle.properties` 파일에 `org.gradle.configuration-cache=true` 속성을 추가하세요.

> 구성 캐시는 `link*` 태스크의 병렬 실행도 활성화하는데, 이는 특히 많은 CPU 코어를 가진 머신에서 부하를 크게 줄 수 있습니다. 이 문제는 [KT-70915](https://youtrack.jetbrains.com/issue/KT-70915)에서 해결될 예정입니다.
>
{style="note"}

### 이전에 비활성화했던 기능 활성화하기 {id="enable-previously-disabled-features"}

과거에 빌드 문제를 우회하기 위해 일부 Kotlin/Native 기능을 비활성화했을 수 있습니다. 예를 들면 다음과 같습니다.

* `kotlin.native.disableCompilerDaemon=true`: [Gradle 데몬(daemon)](https://docs.gradle.org/current/userguide/gradle_daemon.html)을 비활성화합니다.
* `disableNativeCache`: [컴파일 캐시](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#binaries)를 비활성화합니다.

원래 이러한 우회책을 필요로 했던 문제들이 이미 해결되었을 수 있습니다. `gradle.properties` 파일이나 Gradle 빌드 파일에 이러한 라인이 포함되어 있다면, 이를 제거하고 빌드가 성공적으로 완료되는지 확인해 보세요.

### klib 아티팩트의 증분 컴파일 시도 {id="try-incremental-compilation-of-klib-artifacts"}
<primary-label ref="beta"/>

증분 컴파일(incremental compilation)을 사용하면 프로젝트 모듈에서 생성된 `klib` 아티팩트의 일부만 변경된 경우, `klib`의 해당 부분만 바이너리로 다시 컴파일됩니다.

이 기능은 [베타(Beta)](components-stability.md#stability-levels-explained) 단계입니다. 이를 활성화하려면 `gradle.properties` 파일에 다음 옵션을 추가하세요.

```properties
kotlin.incremental.native=true
```

문제가 발생하면 [YouTrack에 이슈](https://kotl.in/issue)를 생성해 주세요.

## Windows 구성 {id="windows-configuration"}

Windows 보안(Windows Security)이 Kotlin/Native 컴파일러 속도를 늦출 수 있습니다. 기본적으로 `%\USERPROFILE%`에 위치한 `.konan` 디렉토리를 Windows 보안 제외 사항에 추가하면 이를 방지할 수 있습니다. [Windows 보안에 제외 사항을 추가](https://support.microsoft.com/en-us/windows/add-an-exclusion-to-windows-security-811816c0-4dfd-af4a-47e4-c301afe13b26)하는 방법을 알아보세요.

## LLVM 구성 {id="llvm-configuration"}
<primary-label ref="advanced"/>

위의 팁들이 컴파일 시간 개선에 도움이 되지 않는다면, [LLVM 백엔드 커스터마이징](native-llvm-passes.md)을 고려해 보세요.