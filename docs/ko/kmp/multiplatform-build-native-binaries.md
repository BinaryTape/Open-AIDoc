[//]: # (title: 최종 네이티브 바이너리 빌드)

기본적으로 Kotlin/Native 타겟은 `*.klib` 라이브러리 아티팩트로 컴파일됩니다. 이는 Kotlin/Native 자체에서 의존성으로 사용할 수는 있지만, 실행하거나 네이티브 라이브러리로 사용할 수는 없습니다.

실행 파일(executable)이나 공유 라이브러리(shared library)와 같은 최종 네이티브 바이너리를 선언하려면 네이티브 타겟의 `binaries` 프로퍼티를 사용하세요. 이 프로퍼티는 기본 `*.klib` 아티팩트 외에 이 타겟을 위해 빌드된 네이티브 바이너리 컬렉션을 나타내며, 이를 선언하고 설정하기 위한 일련의 메서드를 제공합니다.

> `kotlin-multiplatform` 플러그인은 기본적으로 어떠한 프로덕션 바이너리도 생성하지 않습니다. 기본적으로 사용 가능한 유일한 바이너리는 `test` 컴파일에서 유닛 테스트를 실행할 수 있게 해주는 디버그 테스트 실행 파일입니다.
>
{style="note"}

Kotlin/Native 컴파일러가 생성하는 바이너리에는 서드파티 코드, 데이터 또는 파생 저작물이 포함될 수 있습니다. 즉, Kotlin/Native로 컴파일된 최종 바이너리를 배포하는 경우, 바이너리 배포판에 필요한 [라이선스 파일](https://kotlinlang.org/docs/native-binary-licenses.html)을 항상 포함해야 합니다.

## 바이너리 선언 {id="declare-binaries"}

`binaries` 컬렉션의 요소를 선언하려면 다음 팩토리 메서드(factory method)를 사용하세요.

| 팩토리 메서드 | 바이너리 종류 | 사용 가능한 타겟 |
|----------------|-----------------------|--------------------------------------------|
| `executable`   | 제품 실행 파일 (Product executable) | 모든 네이티브 타겟 |
| `test`         | 테스트 실행 파일 (Test executable) | 모든 네이티브 타겟 |
| `sharedLib`    | 공유 네이티브 라이브러리 (Shared native library) | 모든 네이티브 타겟 |
| `staticLib`    | 정적 네이티브 라이브러리 (Static native library) | 모든 네이티브 타겟 |
| `framework`    | Objective-C 프레임워크 (Objective-C framework) | macOS, iOS, watchOS, tvOS 타겟 전용 |

가장 간단한 버전은 추가 파라미터가 필요하지 않으며 각 빌드 유형(build type)에 대해 하나의 바이너리를 생성합니다. 현재 두 가지 빌드 유형을 사용할 수 있습니다.

* `DEBUG` – [디버거 도구](https://kotlinlang.org/docs/native-debugging.html)를 사용할 때 유용한 추가 메타데이터가 포함된 최적화되지 않은 바이너리를 생성합니다.
* `RELEASE` – 디버그 정보가 없는 최적화된 바이너리를 생성합니다.

다음 스니펫은 디버그와 릴리스라는 두 개의 실행 바이너리를 생성합니다.

```kotlin
kotlin {
    linuxX64 { // 대신 사용자의 타겟을 정의하세요.
        binaries {
            executable {
                // 바이너리 설정.
            }
        }
    }
}
```

[추가 설정](multiplatform-dsl-reference.md#native-targets)이 필요하지 않은 경우 람다를 생략할 수 있습니다.

```kotlin
binaries {
    executable()
}
```

바이너리를 생성할 빌드 유형을 지정할 수 있습니다. 다음 예제에서는 `debug` 실행 파일만 생성됩니다.

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
binaries {
    executable(listOf(DEBUG)) {
        // 바이너리 설정.
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
binaries {
    executable([DEBUG]) {
        // 바이너리 설정.
    }
}
```

</TabItem>
</Tabs>

커스텀 이름을 가진 바이너리를 선언할 수도 있습니다.

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
binaries {
    executable("foo", listOf(DEBUG)) {
        // 바이너리 설정.
    }

    // 빌드 유형 리스트를 생략할 수 있습니다.
    // (이 경우 사용 가능한 모든 빌드 유형이 사용됩니다).
    executable("bar") {
        // 바이너리 설정.
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
binaries {
    executable('foo', [DEBUG]) {
        // 바이너리 설정.
    }

    // 빌드 유형 리스트를 생략할 수 있습니다.
    // (이 경우 사용 가능한 모든 빌드 유형이 사용됩니다).
    executable('bar') {
        // 바이너리 설정.
    }
}
```

</TabItem>
</Tabs>

첫 번째 인자는 이름 접두사(name prefix)를 설정하며, 이는 바이너리 파일의 기본 이름이 됩니다. 예를 들어, Windows의 경우 위 코드는 `foo.exe` 및 `bar.exe` 파일을 생성합니다. 또한 이름 접두사를 사용하여 [빌드 스크립트에서 바이너리에 접근](#바이너리-접근)할 수도 있습니다.

## 바이너리 접근 {id="access-binaries"}

바이너리를 [설정](multiplatform-dsl-reference.md#native-targets)하거나 프로퍼티(예: 출력 파일 경로)를 가져오기 위해 바이너리에 접근할 수 있습니다.

고유한 이름으로 바이너리를 가져올 수 있습니다. 이 이름은 이름 접두사(지정된 경우), 빌드 유형 및 바이너리 종류를 기반으로 하며, `<선택적-이름-접두사><빌드-유형><바이너리-종류>` 패턴을 따릅니다. 예를 들어 `releaseFramework` 또는 `testDebugExecutable`과 같습니다.

> 정적 및 공유 라이브러리는 각각 static과 shared 접미사를 가집니다. 예를 들어 `fooDebugStatic` 또는 `barReleaseShared`와 같습니다.
>
{style="note"}

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
// 해당 바이너리가 없으면 실패합니다.
binaries["fooDebugExecutable"]
binaries.getByName("fooDebugExecutable")

// 해당 바이너리가 없으면 null을 반환합니다.
binaries.findByName("fooDebugExecutable")
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
// 해당 바이너리가 없으면 실패합니다.
binaries['fooDebugExecutable']
binaries.fooDebugExecutable
binaries.getByName('fooDebugExecutable')

// 해당 바이너리가 없으면 null을 반환합니다.
binaries.findByName('fooDebugExecutable')
```

</TabItem>
</Tabs>

또는 타입이 지정된 게터(getter)를 사용하여 이름 접두사와 빌드 유형으로 바이너리에 접근할 수 있습니다.

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
// 해당 바이너리가 없으면 실패합니다.
binaries.getExecutable("foo", DEBUG)
binaries.getExecutable(DEBUG)          // 이름 접두사가 설정되지 않은 경우 첫 번째 인자를 생략합니다.
binaries.getExecutable("bar", "DEBUG") // 빌드 유형에 문자열을 사용할 수도 있습니다.

// 다른 바이너리 종류에 대해서도 유사한 게터를 사용할 수 있습니다:
// getFramework, getStaticLib 및 getSharedLib.

// 해당 바이너리가 없으면 null을 반환합니다.
binaries.findExecutable("foo", DEBUG)

// 다른 바이너리 종류에 대해서도 유사한 게터를 사용할 수 있습니다:
// findFramework, findStaticLib 및 findSharedLib.
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
// 해당 바이너리가 없으면 실패합니다.
binaries.getExecutable('foo', DEBUG)
binaries.getExecutable(DEBUG)          // 이름 접두사가 설정되지 않은 경우 첫 번째 인자를 생략합니다.
binaries.getExecutable('bar', 'DEBUG') // 빌드 유형에 문자열을 사용할 수도 있습니다.

// 다른 바이너리 종류에 대해서도 유사한 게터를 사용할 수 있습니다:
// getFramework, getStaticLib 및 getSharedLib.

// 해당 바이너리가 없으면 null을 반환합니다.
binaries.findExecutable('foo', DEBUG)

// 다른 바이너리 종류에 대해서도 유사한 게터를 사용할 수 있습니다:
// findFramework, findStaticLib 및 findSharedLib.
```

</TabItem>
</Tabs>

## 바이너리에 의존성 익스포트하기 {id="export-dependencies-to-binaries"}

Objective-C 프레임워크나 네이티브 라이브러리(공유 또는 정적)를 빌드할 때, 현재 프로젝트의 클래스뿐만 아니라 의존성의 클래스도 패키징해야 할 수 있습니다. `export` 메서드를 사용하여 바이너리에 익스포트(export)할 의존성을 지정하세요.

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        macosMain.dependencies {
            // 익스포트됩니다.
            api(project(":dependency"))
            api("org.example:exported-library:1.0")
            // 익스포트되지 않습니다.
            api("org.example:not-exported-library:1.0")
        }
    }
    macosArm64("macos").binaries {
        framework {
            export(project(":dependency"))
            export("org.example:exported-library:1.0")
        }
        sharedLib {
            // 서로 다른 바이너리에 서로 다른 의존성 세트를 익스포트할 수 있습니다.
            export(project(':dependency'))
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets {
        macosMain.dependencies {
            // 익스포트됩니다.
            api project(':dependency')
            api 'org.example:exported-library:1.0'
            // 익스포트되지 않습니다.
            api 'org.example:not-exported-library:1.0'
        }
    }
    macosArm64("macos").binaries {
        framework {
            export project(':dependency')
            export 'org.example:exported-library:1.0'
        }
        sharedLib {
            // 서로 다른 바이너리에 서로 다른 의존성 세트를 익스포트할 수 있습니다.
            export project(':dependency')
        }
    }
}
```

</TabItem>
</Tabs>

예를 들어, Kotlin으로 여러 모듈을 구현하고 Swift에서 접근하려는 경우를 가정해 보겠습니다. Swift 애플리케이션에서 여러 개의 Kotlin/Native 프레임워크를 사용하는 것에는 제한이 있지만, 엄브렐러 프레임워크(umbrella framework)를 생성하고 이러한 모든 모듈을 해당 프레임워크로 익스포트할 수 있습니다.

> 해당 소스 세트의 [`api` 의존성](https://kotlinlang.org/docs/gradle-configure-project.html#dependency-types)만 익스포트할 수 있습니다.
>
{style="note"}

의존성을 익스포트하면 해당 의존성의 모든 API가 프레임워크 API에 포함됩니다. 컴파일러는 이 의존성의 극히 일부만 사용하더라도 해당 의존성의 코드를 프레임워크에 추가합니다. 이로 인해 익스포트된 의존성(및 어느 정도 그 의존성의 의존성들)에 대한 데드 코드 제거(dead code elimination)가 비활성화됩니다.

기본적으로 익스포트는 비전이적(non-transitively)으로 작동합니다. 즉, 라이브러리 `bar`에 의존하는 라이브러리 `foo`를 익스포트하는 경우, `foo`의 메서드만 출력 프레임워크에 추가됩니다.

`transitiveExport` 옵션을 사용하여 이 동작을 변경할 수 있습니다. `true`로 설정하면 라이브러리 `bar`의 선언도 함께 익스포트됩니다.

> `transitiveExport`를 사용하는 것은 권장되지 않습니다. 이는 익스포트된 의존성의 모든 전이적 의존성을 프레임워크에 추가하기 때문입니다. 이는 컴파일 시간과 바이너리 크기를 모두 증가시킬 수 있습니다.
>
> 대부분의 경우, 이러한 모든 의존성을 프레임워크 API에 추가할 필요는 없습니다. Swift 또는 Objective-C 코드에서 직접 접근해야 하는 의존성에 대해서만 명시적으로 `export`를 사용하세요.
>
{style="warning"}

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
binaries {
    framework {
        export(project(":dependency"))
        // 전이적으로 익스포트합니다.
        transitiveExport = true
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
binaries {
    framework {
        export project(':dependency')
        // 전이적으로 익스포트합니다.
        transitiveExport = true
    }
}
```

</TabItem>
</Tabs>

## 유니버설 프레임워크 빌드 {id="build-universal-frameworks"}

기본적으로 Kotlin/Native에서 생성된 Objective-C 프레임워크는 하나의 플랫폼만 지원합니다. 하지만 [`lipo` 도구](https://llvm.org/docs/CommandGuide/llvm-lipo.html)를 사용하여 이러한 프레임워크를 단일 유니버설(fat) 바이너리로 병합할 수 있습니다. 이 작업은 특히 32비트 및 64비트 iOS 프레임워크에 유용합니다. 이 경우 결과물인 유니버설 프레임워크를 32비트와 64비트 장치 모두에서 사용할 수 있습니다.

> 팻(fat) 프레임워크는 초기 프레임워크와 동일한 기본 이름(base name)을 가져야 합니다. 그렇지 않으면 오류가 발생합니다.
>
{style="warning"}

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.tasks.FatFrameworkTask

kotlin {
    // 타겟 생성 및 설정.
    val watchos32 = watchosArm32("watchos32")
    val watchos64 = watchosArm64("watchos64")
    configure(listOf(watchos32, watchos64)) {
        binaries.framework {
            baseName = "MyFramework"
        }
    }
    // 팻 프레임워크를 빌드하기 위한 태스크를 생성합니다.
    tasks.register<FatFrameworkTask>("debugFatFramework") {
        // 팻 프레임워크는 초기 프레임워크와 동일한 기본 이름을 가져야 합니다.
        baseName = "MyFramework"
        // 기본 대상 디렉토리는 "<build directory>/fat-framework"입니다.
        destinationDirProperty.set(layout.buildDirectory.dir("fat-framework/debug"))
        // 병합할 프레임워크를 지정합니다.
        from(
            watchos32.binaries.getFramework("DEBUG"),
            watchos64.binaries.getFramework("DEBUG")
        )
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.tasks.FatFrameworkTask

kotlin {
    // 타겟 생성 및 설정.
    targets {
        watchosArm32("watchos32")
        watchosArm64("watchos64")
        configure([watchos32, watchos64]) {
            binaries.framework {
                baseName = "MyFramework"
            }
        }
    }
    // 팻 프레임워크를 빌드하는 태스크를 생성합니다.
    tasks.register("debugFatFramework", FatFrameworkTask) {
        // 팻 프레임워크는 초기 프레임워크와 동일한 기본 이름을 가져야 합니다.
        baseName = "MyFramework"
        // 기본 대상 디렉토리는 "<build directory>/fat-framework"입니다.
        destinationDirProperty.set(layout.buildDirectory.dir("fat-framework/debug"))
        // 병합할 프레임워크를 지정합니다.
        from(
            targets.watchos32.binaries.getFramework("DEBUG"),
            targets.watchos64.binaries.getFramework("DEBUG")
        )
    }
}
```

</TabItem>
</Tabs>

## XCFramework 빌드 {id="build-xcframeworks"}

모든 Kotlin 멀티플랫폼 프로젝트는 XCFramework를 출력으로 사용하여 모든 타겟 플랫폼과 아키텍처에 대한 로직을 단일 번들에 모을 수 있습니다. [유니버설(fat) 프레임워크](#유니버설-프레임워크-빌드)와 달리, App Store에 애플리케이션을 배포하기 전에 모든 불필요한 아키텍처를 제거할 필요가 없습니다.

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.plugin.mpp.apple.XCFramework

plugins {
    kotlin("multiplatform") version "%kotlinVersion%"
}

kotlin {
    val xcf = XCFramework()
    val iosTargets = listOf(iosArm64(), iosSimulatorArm64())
    
    iosTargets.forEach {
        it.binaries.framework {
            baseName = "shared"
            xcf.add(this)
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.plugin.mpp.apple.XCFrameworkConfig

plugins {
    id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
}

kotlin {
    def xcf = new XCFrameworkConfig(project)
    def iosTargets = [iosArm64(), iosSimulatorArm64()]
    
    iosTargets.forEach {
        it.binaries.framework {
            baseName = 'shared'
            xcf.add(it)
        }
    }
}
```

</TabItem>
</Tabs>

XCFramework를 선언하면 Kotlin Gradle 플러그인이 다음과 같은 여러 Gradle 태스크를 등록합니다.

* `assembleXCFramework`
* `assemble<Framework name>DebugXCFramework`
* `assemble<Framework name>ReleaseXCFramework`

프로젝트에서 [CocoaPods 통합](multiplatform-cocoapods-overview.md)을 사용하는 경우, Kotlin CocoaPods Gradle 플러그인으로 XCFramework를 빌드할 수 있습니다. 여기에는 등록된 모든 타겟으로 XCFramework를 빌드하고 podspec 파일을 생성하는 다음 태스크들이 포함됩니다.

* `podPublishReleaseXCFramework`: podspec 파일과 함께 릴리스 XCFramework를 생성합니다.
* `podPublishDebugXCFramework`: podspec 파일과 함께 디버그 XCFramework를 생성합니다.
* `podPublishXCFramework`: podspec 파일과 함께 디버그 및 릴리스 XCFramework를 모두 생성합니다.

이를 통해 프로젝트의 공유 부분을 모바일 앱과 분리하여 CocoaPods를 통해 배포할 수 있습니다. 또한 비공개 또는 공개 podspec 저장소에 게시하기 위해 XCFramework를 사용할 수도 있습니다.

> 서로 다른 버전의 Kotlin으로 빌드된 경우 Kotlin 프레임워크를 공개 저장소에 게시하는 것은 권장되지 않습니다. 그렇게 하면 최종 사용자의 프로젝트에서 충돌이 발생할 수 있습니다.
>
{style="warning"}

## Info.plist 파일 사용자 정의 {id="customize-the-info-plist-file"}

프레임워크를 생성할 때 Kotlin/Native 컴파일러는 정보 프로퍼티 리스트 파일인 `Info.plist`를 생성합니다. 해당 바이너리 옵션을 사용하여 프로퍼티를 사용자 정의할 수 있습니다.

| 프로퍼티 | 바이너리 옵션 |
|------------------------------|----------------------------|
| `CFBundleIdentifier`         | `bundleId`                 |
| `CFBundleShortVersionString` | `bundleShortVersionString` |
| `CFBundleVersion`            | `bundleVersion`            |

이 기능을 활성화하려면 `-Xbinary=$option=$value` 컴파일러 플래그를 전달하거나 특정 프레임워크에 대해 `binaryOption("option", "value")` Gradle DSL을 설정하세요.

```kotlin
binaries {
    framework {
        binaryOption("bundleId", "com.example.app")
        binaryOption("bundleVersion", "2")
    }
}
```
