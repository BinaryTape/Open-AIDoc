[//]: # (title: Kotlin/Native FAQ)

## 프로그램을 어떻게 실행하나요?

최상위 함수(top-level function)인 `fun main(args: Array<String>)`을 정의하거나, 전달된 인자에 관심이 없다면 `fun main()`을 정의하세요. 이때 해당 함수가 패키지 안에 포함되지 않도록 주의하십시오.
또한, 컴파일러 스위치 `-entry`를 사용하여 `Array<String>`을 인자로 받거나 인자가 없으며 `Unit`을 반환하는 모든 함수를 진입점(entry point)으로 만들 수 있습니다.

## Kotlin/Native의 메모리 관리 모델은 무엇인가요?

Kotlin/Native는 Java나 Swift에서 제공하는 것과 유사한 자동 메모리 관리 방식을 사용합니다.

[Kotlin/Native 메모리 매니저에 대해 알아보기](native-memory-manager.md)

## 공유 라이브러리(shared library)는 어떻게 만드나요?

컴파일러 옵션 `-produce dynamic`을 사용하거나 Gradle 빌드 파일에서 `binaries.sharedLib()`을 사용하세요:

```kotlin
kotlin {
    iosArm64("mylib") {
        binaries.sharedLib()
    }
}
```

이 옵션은 플랫폼별 공유 객체(Linux의 `.so`, macOS의 `.dylib`, Windows 타겟의 `.dll`)와 C 언어 헤더를 생성하며, C/C++ 코드에서 Kotlin/Native 프로그램의 모든 공개(public) API를 사용할 수 있게 해줍니다.

[Kotlin/Native 동적 라이브러리 튜토리얼 완료하기](native-dynamic-libraries.md)

## 정적 라이브러리(static library)나 오브젝트 파일은 어떻게 만드나요?

컴파일러 옵션 `-produce static`을 사용하거나 Gradle 빌드 파일에서 `binaries.staticLib()`을 사용하세요:

```kotlin
kotlin {
    iosArm64("mylib") {
        binaries.staticLib()
    }
}
```

이 옵션은 플랫폼별 정적 객체(`.a` 라이브러리 형식)와 C 언어 헤더를 생성하며, C/C++ 코드에서 Kotlin/Native 프로그램의 모든 공개(public) API를 사용할 수 있게 해줍니다.

## 기업용 프록시 뒤에서 Kotlin/Native를 어떻게 실행하나요?

Kotlin/Native는 플랫폼별 툴체인을 다운로드해야 하므로, 컴파일러나 `gradlew` 인자로 `-Dhttp.proxyHost=xxx -Dhttp.proxyPort=xxx`를 지정하거나 `JAVA_OPTS` 환경 변수를 통해 설정해야 합니다.

## Kotlin 프레임워크에 커스텀 Objective-C 접두사/이름을 어떻게 지정하나요?

`-module-name` 컴파일러 옵션이나 그에 해당하는 Gradle DSL 문을 사용하세요.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    iosArm64("myapp") {
        binaries.framework {
            freeCompilerArgs += listOf("-module-name", "TheName")
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    iosArm64("myapp") {
        binaries.framework {
            freeCompilerArgs += ["-module-name", "TheName"]
        }
    }
}
```

</tab>
</tabs>

## iOS 프레임워크의 이름을 어떻게 변경하나요?

iOS 프레임워크의 기본 이름은 `<project name>.framework`입니다.
커스텀 이름을 설정하려면 `baseName` 옵션을 사용하세요. 이 옵션은 모듈 이름도 함께 설정합니다.

```kotlin
kotlin {
    iosArm64("myapp") {
       binaries {
          framework {
              baseName = "TheName"
          }
       }
    }
}
```

## Kotlin 프레임워크에서 비트코드(bitcode)를 어떻게 활성화하나요?

비트코드 임베딩은 Xcode 14에서 지원 중단(deprecated)되었으며, Xcode 15부터는 모든 Apple 타겟에서 제거되었습니다.
Kotlin/Native 컴파일러는 Kotlin 2.0.20부터 비트코드 임베딩을 지원하지 않습니다.

이전 버전의 Xcode를 사용 중이지만 Kotlin 2.0.20 이상 버전으로 업그레이드하려는 경우, Xcode 프로젝트에서 비트코드 임베딩을 비활성화하십시오.

## iOS에서 더 나은 크래시 리포트(crash report)를 받으려면 어떻게 해야 하나요?

처리되지 않은(unhandled) Kotlin 예외가 iOS 코드에 도달하면, 크래시 리포팅 도구는 예외가 발생한 실제 코드 줄 대신 Kotlin/Native 내부 문제임을 나타내는 모호한 리포트를 표시할 수 있습니다. 이는 크래시가 기록될 시점에 원래의 Kotlin 스택 트레이스(stack trace)가 유실되기 때문에 발생합니다.

[NSExceptionKt](https://github.com/rickclephas/NSExceptionKt)와 같은 서드파티 솔루션을 사용하여 이 문제를 해결할 수 있습니다. 이 솔루션은 잡히지 않은(uncaught) Kotlin 예외를 `NSException` 인스턴스로 변환하여 크래시 리포팅 도구가 정확한 스택 트레이스를 캡처할 수 있도록 합니다. 다음과 같은 인기 있는 크래시 리포팅 도구에 대해 전용 통합 기능을 제공합니다:

* [Bugsnag](https://github.com/rickclephas/NSExceptionKt/blob/master/NSExceptionKtBugsnag/README.md)
* [Firebase Crashlytics](https://github.com/rickclephas/NSExceptionKt/blob/master/NSExceptionKtCrashlytics/README.md)

## 서로 다른 코루틴에서 객체를 안전하게 참조하려면 어떻게 해야 하나요?

Kotlin/Native의 여러 코루틴에서 객체에 안전하게 접근하거나 업데이트하려면 `@Volatile` 및 `AtomicReference`와 같은 동시성 안전 구성 요소(concurrency-safe constructs)를 사용하는 것이 좋습니다.

`var` 프로퍼티에 [`@Volatile`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent/-volatile/) 어노테이션을 사용하세요.
이렇게 하면 프로퍼티의 지원 필드(backing field)에 대한 모든 읽기 및 쓰기가 원자적(atomic)으로 수행됩니다. 또한, 쓰기 작업이 다른 스레드에 즉시 표시됩니다. 다른 스레드가 이 프로퍼티에 접근할 때 업데이트된 값뿐만 아니라 업데이트 이전에 발생한 변경 사항도 관찰할 수 있습니다.

또는 원자적 읽기 및 업데이트를 지원하는 [AtomicReference](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent.atomics/-atomic-reference/)를 사용하세요. Kotlin/Native에서 이는 휘발성(volatile) 변수를 감싸고 원자적 연산을 수행합니다.
Kotlin은 또한 특정 데이터 유형에 맞춤화된 원자적 연산을 위한 일련의 타입을 제공합니다. `AtomicInt`, `AtomicLong`, `AtomicBoolean`, `AtomicArray`뿐만 아니라 `AtomicIntArray` 및 `AtomicLongArray`를 사용할 수 있습니다.

공유 가변 상태(shared mutable state) 접근에 대한 자세한 내용은 [코루틴 문서](shared-mutable-state-and-concurrency.md)를 참조하세요.

## 아직 출시되지 않은 버전의 Kotlin/Native로 프로젝트를 컴파일하려면 어떻게 해야 하나요?

먼저, [미리보기 버전(preview versions)](eap.md)을 사용해 보는 것을 고려해 보세요.

더 최신의 개발 버전이 필요한 경우, 소스 코드에서 Kotlin/Native를 빌드할 수 있습니다.
[Kotlin 저장소](https://github.com/JetBrains/kotlin)를 클론하고 [이 단계들](https://github.com/JetBrains/kotlin/blob/master/kotlin-native/README.md#building-from-source)을 따르세요.