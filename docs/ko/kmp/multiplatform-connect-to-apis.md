[//]: # (title: 플랫폼별 API 사용하기)

이 문서에서는 멀티플랫폼 애플리케이션 및 라이브러리를 개발할 때 플랫폼별 API를 사용하는 방법을 알아봅니다.

<video src="https://www.youtube.com/v/bSNumV04y_w" title="Using Platform-Specific APIs in KMP Apps"/>

## 코틀린 멀티플랫폼 라이브러리

플랫폼별 API를 사용하는 코드를 작성하기 전에, 대신 사용할 수 있는 멀티플랫폼 라이브러리가 있는지 확인해 보세요.
이러한 유형의 라이브러리는 플랫폼마다 구현이 다르더라도 공통된 코틀린 API를 제공합니다.

네트워킹, 로깅, 분석뿐만 아니라 기기 기능 액세스 등을 구현하는 데 사용할 수 있는 많은 라이브러리가 이미 존재합니다. 코틀린 멀티플랫폼 라이브러리 검색 플랫폼인 [klibs.io](https://klibs.io)에서 라이브러리를 찾아보세요.

## expect 및 actual 함수와 프로퍼티

코틀린은 공통 로직을 개발하면서 플랫폼별 API에 액세스할 수 있는 언어 메커니즘인 [expect 및 actual 선언(expected and actual declarations)](multiplatform-expect-actual.md)을 제공합니다.

이 메커니즘을 사용하면 멀티플랫폼 모듈의 공통 소스 세트(common source set)에서 예상 선언(expected declaration)을 정의하고, 모든 플랫폼 소스 세트(platform source set)에서 해당 예상 선언에 대응하는 실제 선언(actual declaration)을 제공해야 합니다. 컴파일러는 공통 소스 세트에서 `expect` 키워드가 붙은 모든 선언이 대상 플랫폼 소스 세트에서 `actual` 키워드가 붙은 대응하는 선언을 갖도록 보장합니다.

이는 함수, 클래스, 인터페이스, 열거형(enumerations), 프로퍼티, 어노테이션과 같은 대부분의 코틀린 선언에 적용됩니다. 이 섹션에서는 `expect` 및 `actual` 함수와 프로퍼티를 사용하는 데 중점을 둡니다.

![expect 및 actual 함수와 프로퍼티 사용](expect-functions-properties.svg){width=700}

이 예제에서는 공통 소스 세트에 예상되는 `platform()` 함수를 정의하고, 플랫폼 소스 세트에서 실제 구현을 제공합니다. 특정 플랫폼을 위한 코드를 생성하는 동안, 코틀린 컴파일러는 예상 선언과 실제 선언을 병합합니다. 컴파일러는 실제 구현을 가진 하나의 `platform()` 함수를 생성합니다. 예상 선언과 실제 선언은 동일한 패키지에 정의되어야 하며, 결과 플랫폼 코드에서는 *하나의 선언*으로 병합됩니다. 생성된 플랫폼 코드에서 예상되는 `platform()` 함수를 호출하면 올바른 실제 구현이 호출됩니다.

### 예제: UUID 생성하기

코틀린 멀티플랫폼을 사용하여 iOS 및 Android 애플리케이션을 개발하고 있으며, 범용 고유 식별자(UUID)를 생성하고 싶다고 가정해 보겠습니다.

이를 위해 코틀린 멀티플랫폼 모듈의 공통 소스 세트에서 `expect` 키워드를 사용하여 예상 함수 `randomUUID()`를 선언합니다. 이때 어떠한 구현 코드도 포함하지 **않습니다**.

```kotlin
// 공통 소스 세트에서:
expect fun randomUUID(): String
```

각 플랫폼별 소스 세트(iOS 및 Android)에서 공통 모듈에서 예상한 `randomUUID()` 함수에 대한 실제 구현을 제공합니다. 이러한 실제 구현을 표시하려면 `actual` 키워드를 사용합니다.

![expect 및 actual 선언으로 UUID 생성하기](expect-generate-uuid.svg){width=700}

다음 스니펫은 Android 및 iOS용 구현을 보여줍니다. 플랫폼별 코드에서는 `actual` 키워드와 함수에 동일한 이름을 사용합니다.

```kotlin
// android 소스 세트에서:
import java.util.*

actual fun randomUUID() = UUID.randomUUID().toString()
```

```kotlin
// iOS 소스 세트에서:
import platform.Foundation.NSUUID

actual fun randomUUID(): String = NSUUID().UUIDString()
```

Android 구현은 Android에서 사용 가능한 API를 사용하는 반면, iOS 구현은 iOS에서 사용 가능한 API를 사용합니다. 코틀린/네이티브(Kotlin/Native) 코드에서 iOS API에 액세스할 수 있습니다.

Android용 결과 플랫폼 코드를 생성하는 동안 코틀린 컴파일러는 예상 선언과 실제 선언을 자동으로 병합하고 Android 전용 실제 구현을 가진 단일 `randomUUID()` 함수를 생성합니다. iOS에 대해서도 동일한 프로세스가 반복됩니다.

단순화를 위해 이 예제와 다음 예제에서는 "common", "ios", "android"라는 단순화된 소스 세트 이름을 사용합니다. 일반적으로 이는 `commonMain`, `iosMain`, `androidMain`을 의미하며, `commonTest`, `iosTest`, `androidTest`와 같은 테스트 소스 세트에서도 유사한 로직을 정의할 수 있습니다.

`expect` 및 `actual` 함수와 마찬가지로, `expect` 및 `actual` 프로퍼티를 사용하면 플랫폼마다 서로 다른 값을 사용할 수 있습니다. `expect` 및 `actual` 함수와 프로퍼티는 간단한 경우에 가장 유용합니다.

## 공통 코드의 인터페이스

플랫폼별 로직이 너무 크고 복잡하다면, 공통 코드에서 이를 나타내는 인터페이스를 정의한 다음 플랫폼 소스 세트에서 서로 다른 구현을 제공하여 코드를 간소화할 수 있습니다.

![인터페이스 사용](expect-interfaces.svg){width=700}

플랫폼 소스 세트의 구현은 해당 플랫폼의 의존성을 사용합니다.

```kotlin
// commonMain 소스 세트에서:
interface Platform {
    val name: String
}
```

```kotlin
// androidMain 소스 세트에서:
import android.os.Build

class AndroidPlatform : Platform {
    override val name: String = "Android ${Build.VERSION.SDK_INT}"
}
```

```kotlin
// iosMain 소스 세트에서:
import platform.UIKit.UIDevice

class IOSPlatform : Platform {
    override val name: String = UIDevice.currentDevice.systemName() + " " + UIDevice.currentDevice.systemVersion
}
```

공통 인터페이스가 필요할 때 적절한 플랫폼 구현을 주입하려면 다음 옵션 중 하나를 선택할 수 있으며, 각 옵션은 아래에서 더 자세히 설명합니다.

* [`expect` 및 `actual` 함수 사용](#expect-및-actual-함수)
* [서로 다른 진입점을 통한 구현 제공](#서로-다른-진입점)
* [의존성 주입 프레임워크 사용](#의존성-주입-프레임워크)

### expect 및 actual 함수

이 인터페이스의 값을 반환하는 예상 함수를 정의한 다음, 해당 서브클래스를 반환하는 실제 함수를 정의합니다.

```kotlin
// commonMain 소스 세트에서:
interface Platform

expect fun platform(): Platform
```

```kotlin
// androidMain 소스 세트에서:
class AndroidPlatform : Platform

actual fun platform() = AndroidPlatform()
```

```kotlin
// iosMain 소스 세트에서:
class IOSPlatform : Platform

actual fun platform() = IOSPlatform()
```

공통 코드에서 `platform()` 함수를 호출하면 `Platform` 타입의 객체로 작업할 수 있습니다. 이 공통 코드를 Android에서 실행하면 `platform()` 호출은 `AndroidPlatform` 클래스의 인스턴스를 반환합니다. iOS에서 실행하면 `platform()`은 `IOSPlatform` 클래스의 인스턴스를 반환합니다.

### 서로 다른 진입점

진입점(entry points)을 제어할 수 있는 경우 `expect` 및 `actual` 선언을 사용하지 않고 각 플랫폼 아티팩트의 구현을 구성할 수 있습니다. 이를 위해 공유 코틀린 멀티플랫폼 모듈에 플랫폼 구현을 정의하되, 플랫폼 모듈에서 인스턴스화합니다.

```kotlin
// 공유 코틀린 멀티플랫폼 모듈
// commonMain 소스 세트에서:
interface Platform

fun application(p: Platform) {
    // 애플리케이션 로직
}
```

```kotlin
// androidMain 소스 세트에서:
class AndroidPlatform : Platform
```

```kotlin
// iosMain 소스 세트에서:
class IOSPlatform : Platform
```

```kotlin
// androidApp 플랫폼 모듈에서:
import android.app.Application
import mysharedpackage.*

class MyApp : Application() {
    override fun onCreate() {
        super.onCreate()
        application(AndroidPlatform())
    }
}
```

```Swift
// iosApp 플랫폼 모듈(Swift)에서:
import shared

@main
struct iOSApp : App {
    init() {
        application(IOSPlatform())
    }
}
```

Android에서는 `AndroidPlatform`의 인스턴스를 생성하여 `application()` 함수에 전달해야 하며, iOS에서도 마찬가지로 `IOSPlatform`의 인스턴스를 생성하여 전달해야 합니다. 이러한 진입점이 반드시 애플리케이션의 진입점일 필요는 없으며, 공유 모듈의 특정 기능을 호출할 수 있는 위치면 됩니다.

`expect` 및 `actual` 함수를 사용하거나 진입점을 통해 직접 적절한 구현을 제공하는 방식은 간단한 시나리오에서 잘 작동합니다. 하지만 프로젝트에서 의존성 주입(DI) 프레임워크를 사용하고 있다면, 일관성을 위해 간단한 경우에도 DI 프레임워크를 사용하는 것을 권장합니다.

### 의존성 주입 프레임워크

현대적인 애플리케이션은 일반적으로 느슨하게 결합된 아키텍처(loosely coupled architecture)를 만들기 위해 의존성 주입(DI) 프레임워크를 사용합니다. DI 프레임워크를 사용하면 현재 환경에 따라 컴포넌트에 의존성을 주입할 수 있습니다.

코틀린 멀티플랫폼을 지원하는 모든 DI 프레임워크는 플랫폼마다 서로 다른 의존성을 주입하는 데 도움이 될 수 있습니다.

예를 들어, [Koin](https://insert-koin.io/)은 코틀린 멀티플랫폼을 지원하는 의존성 주입 프레임워크입니다.

```kotlin
// 공통 소스 세트에서:
import org.koin.dsl.module

interface Platform

expect val platformModule: Module
```

```kotlin
// androidMain 소스 세트에서:
class AndroidPlatform : Platform

actual val platformModule: Module = module {
    single<Platform> {
        AndroidPlatform()
    }
}
```

```kotlin
// iosMain 소스 세트에서:
class IOSPlatform : Platform

actual val platformModule = module {
    single<Platform> { IOSPlatform() }
}
```

여기서 Koin DSL은 주입할 컴포넌트를 정의하는 모듈을 생성합니다. 공통 코드에서 `expect` 키워드로 모듈을 선언한 다음, `actual` 키워드를 사용하여 각 플랫폼에 맞는 플랫폼별 구현을 제공합니다. 프레임워크가 런타임에 올바른 구현을 선택하도록 처리합니다.

DI 프레임워크를 사용할 때는 이 프레임워크를 통해 모든 의존성을 주입합니다. 플랫폼 의존성을 처리할 때도 동일한 로직이 적용됩니다. 프로젝트에 이미 DI가 있다면 `expect` 및 `actual` 함수를 수동으로 사용하는 대신 DI를 계속 사용하는 것이 좋습니다. 이렇게 하면 의존성을 주입하는 두 가지 서로 다른 방식이 섞이는 것을 피할 수 있습니다.

또한 항상 코틀린으로 공통 인터페이스를 구현해야 하는 것은 아닙니다. 다른 _플랫폼 모듈_에서 Swift와 같은 다른 언어로 구현할 수도 있습니다. 이 방식을 선택하는 경우, DI 프레임워크를 사용하여 iOS 플랫폼 모듈에서 구현을 제공해야 합니다.

![의존성 주입 프레임워크 사용](expect-di-framework.svg){width=700}

이 접근 방식은 플랫폼 모듈에 구현을 넣을 때만 작동합니다. 코틀린 멀티플랫폼 모듈이 자립적일 수 없고 다른 모듈에서 공통 인터페이스를 구현해야 하므로 확장성이 그리 좋지는 않습니다.

<!-- 이 기능이 공유 모듈로 확장되는 데 관심이 있다면 YouTrack의 이 이슈에 투표하고 사용 사례를 설명해 주세요. -->

## 다음 단계는 무엇인가요?

expect/actual 메커니즘에 대한 더 많은 예제와 정보는 [expect 및 actual 선언(Expected and actual declarations)](multiplatform-expect-actual.md)을 참고하세요.