[//]: # (title: 플랫폼별 API 사용하기)

이 문서에서는 멀티플랫폼 애플리케이션 및 라이브러리를 개발할 때 플랫폼별 API를 사용하는 방법을 배웁니다.

<video src="https://www.youtube.com/v/bSNumV04y_w" title="Using Platform-Specific APIs in KMP Apps"/>

## Kotlin Multiplatform 라이브러리 {id="kotlin-multiplatform-libraries"}

플랫폼별 API를 사용하는 코드를 작성하기 전에, 멀티플랫폼 라이브러리를 대신 사용할 수 있는지 먼저 확인해 보세요.
이러한 유형의 라이브러리는 플랫폼마다 서로 다른 구현을 갖는 공통 Kotlin API를 제공합니다.

네트워킹, 로깅, 애널리틱스 구현은 물론 기기 기능 접근 등에 사용할 수 있는 라이브러리가 이미 많이 나와 있습니다. Kotlin Multiplatform 라이브러리 검색 플랫폼인 [klibs.io](https://klibs.io)에서 다양한 라이브러리를 둘러보세요.

## expect 및 actual 함수와 프로퍼티 {id="expected-and-actual-functions-and-properties"}

Kotlin은 공통 로직을 개발하면서 플랫폼별 API에 접근할 수 있는 언어 메커니즘인 [expect 및 actual 선언(expected and actual declarations)](multiplatform-expect-actual.md)을 제공합니다.

이 메커니즘을 사용하면 멀티플랫폼 모듈의 공통 소스 세트(common source set)에서 expected 선언을 정의하고, 각 플랫폼 소스 세트에서 이 expected 선언에 해당하는 actual 선언을 제공해야 합니다. 컴파일러는 공통 소스 세트에서 `expect` 키워드로 표시된 모든 선언이 대상이 되는 모든 플랫폼 소스 세트에서 `actual` 키워드로 표시된 대응 선언을 가지고 있는지 확인합니다.

이 방식은 함수, 클래스, 인터페이스, 열거형(enumeration), 프로퍼티, 애너테이션 등 대부분의 Kotlin 선언에서 작동합니다. 이 섹션에서는 expect 및 actual 함수와 프로퍼티를 사용하는 데 집중합니다.

![expect 및 actual 함수와 프로퍼티 사용](expect-functions-properties.svg){width=700}

이 예제에서는 공통 소스 세트에 expected `platform()` 함수가 정의되어 있고, 플랫폼 소스 세트에 actual 구현이 있습니다.
특정 플랫폼을 위한 코드를 생성하는 동안 Kotlin 컴파일러는 expected 선언과 actual 선언을 병합합니다.
그 결과 대상 플랫폼에 맞는 구현을 가진 하나의 `platform()` 함수가 만들어집니다.

결과 플랫폼 코드에서 _하나의 선언_으로 병합되려면 expected 선언과 actual 선언이 동일한 패키지에 정의되어 있어야 합니다.
이렇게 하면 공통 코드에서 expected `platform()` 함수를 호출할 때 올바른 actual 구현과 연결됩니다.

expect 및 actual 함수와 마찬가지로, expect 및 actual 프로퍼티를 사용하면 플랫폼마다 서로 다른 값을 사용할 수 있습니다. expect 및 actual 함수와 프로퍼티는 단순한 케이스에 가장 유용합니다.

### 예제: UUID 생성 {id="example-generate-a-uuid"}

Kotlin Multiplatform을 사용하여 iOS 및 Android 애플리케이션을 개발 중이며, 범용 고유 식별자(UUID)를 생성하는 메커니즘이 필요하다고 가정해 보겠습니다.

이를 위해 Kotlin Multiplatform 모듈의 공통 소스 세트에서 `expect` 키워드를 사용하여 expected 함수 `randomUUID()`를 선언합니다.
`expect` 선언에는 어떠한 구현 코드도 포함해서는 **안 됩니다**.

```kotlin
// 공통 소스 세트:
expect fun randomUUID(): String
```

각 플랫폼별 소스 세트(iOS 및 Android)에서는 공통 모듈에서 선언된 `randomUUID()` 함수에 대한 실제 구현을 제공합니다. 이러한 실제 구현에는 `actual` 키워드를 붙여 표시합니다.

![expect 및 actual 선언을 사용한 UUID 생성](expect-generate-uuid.svg){width=700}

다음 코드 스니펫은 Android와 iOS용 구현을 보여줍니다. 플랫폼별 코드는 `actual` 키워드와 함수에 동일한 이름을 사용합니다.

```kotlin
// Android 소스 세트:
import java.util.*

actual fun randomUUID() = UUID.randomUUID().toString()
```

```kotlin
// iOS 소스 세트:
import platform.Foundation.NSUUID

actual fun randomUUID(): String = NSUUID().UUIDString()
```

Android 구현에서는 Android에서 사용 가능한 API를 사용하고, iOS 구현에서는 iOS에서 사용 가능한 API를 사용합니다.
Kotlin/Native 코드에서 iOS API에 직접 접근할 수 있습니다.

Android용 최종 플랫폼 코드를 생성할 때 Kotlin 컴파일러는 expected 선언과 actual 선언을 자동으로 병합하여 Android 전용 actual 구현이 포함된 단일 `randomUUID()` 함수를 생성합니다. iOS에서도 동일한 과정이 반복됩니다.

### `expect`/`actual` 선언에 대해 더 읽어보기 {id="further-reading-on-expect-actual-declarations"}

* `expect`/`actual` 선언의 실제 동작을 확인하려면 각 타깃의 플랫폼 이름을 반환하는 함수가 포함된 [기본 KMP 앱 예제](quickstart.md#create-a-project)를 확인하세요.
* `expect`/`actual` 메커니즘에 대해 자세히 알아보려면 [Expected and actual declarations](multiplatform-expect-actual.md)를 참조하세요.

## 공통 코드의 인터페이스 {id="interfaces-in-common-code"}

[Kotlin의 상속 메커니즘](https://kotlinlang.org/docs/inheritance.html)을 활용하면 더욱 유연하게 코드를 공유할 수 있습니다.
예를 들어, 공통 코드에 플랫폼 독립적인 추상 선언이 포함된 인터페이스를 정의한 다음, 플랫폼 소스 세트에서 해당 인터페이스의 구현체를 제공할 수 있습니다.

![인터페이스 사용](expect-interfaces.svg){width=700}

플랫폼 이름은 플랫폼에 관계없이 `String`으로 저장됩니다.

```kotlin
// commonMain 소스 세트:
interface Platform {
    val name: String
}
```

그런 다음 선언을 오버라이드하여 Android API 호출을 통해 해당 `String`에 값을 할당할 수 있습니다.

```kotlin
// androidMain 소스 세트:
import android.os.Build

class AndroidPlatform : Platform {
    override val name: String = "Android ${Build.VERSION.SDK_INT}"
}
```

또는 iOS 시스템 호출을 사용할 수도 있습니다.

```kotlin
// iosMain 소스 세트:
import platform.UIKit.UIDevice

class IOSPlatform : Platform {
    override val name: String = UIDevice.currentDevice.systemName() + " " + UIDevice.currentDevice.systemVersion
}
```

공통 인터페이스를 사용할 때 적절한 플랫폼 구현을 주입하기 위해 다음 옵션 중 하나를 선택할 수 있습니다.

* [expect 및 actual 함수 사용](#expected-and-actual-functions)
* [서로 다른 진입점을 통한 구현 제공](#different-entry-points)
* [의존성 주입(DI) 프레임워크 사용](#dependency-injection-framework)

### expect 및 actual 함수 {id="expected-and-actual-functions"}

공통 인터페이스를 [expect/actual 선언](#expected-and-actual-functions-and-properties)과 결합할 수 있습니다.  
이 인터페이스 타입의 값을 반환하는 `expect` 함수를 정의한 다음, 인터페이스를 구현하는 플랫폼별 클래스를 반환하는 `actual` 함수를 정의합니다.

```kotlin
// commonMain 소스 세트:
interface Platform

expect fun platform(): Platform
```

```kotlin
// androidMain 소스 세트:
class AndroidPlatform : Platform

actual fun platform() = AndroidPlatform()
```

```kotlin
// iosMain 소스 세트:
class IOSPlatform : Platform

actual fun platform() = IOSPlatform()
```

공통 코드에서 `platform()` 함수를 호출하면 `Platform` 타입의 객체를 다루게 됩니다.
컴파일러가 expected 선언과 actual 선언을 병합하면, `platform()` 호출 시 Android에서는 `AndroidPlatform` 클래스의 인스턴스를 반환하고 iOS에서는 `IOSPlatform` 클래스의 인스턴스를 반환합니다.

> 이 방식은 Kotlin Multiplatform IDE 마법사([웹 버전](https://kmp.jetbrains.com/)도 제공됨)에서 생성된 프로젝트에서 사용하는 방식입니다.
> [KMP 빠른 시작](quickstart.md#create-a-project)을 실행하여 간단한 프로젝트를 만들고 구현이 어떻게 동작하는지 확인해 보세요.
> 
{style="tip"}

### 서로 다른 진입점 {id="different-entry-points"}

진입점(entry point)을 직접 제어할 수 있다면 expect 및 actual 선언을 사용하지 않고도 각 플랫폼 아티팩트의 구현체를 구성할 수 있습니다. 이를 위해 공유 Kotlin Multiplatform 모듈에서 플랫폼 구현을 정의하되, 플랫폼 모듈에서 인스턴스화합니다.

```kotlin
// 공유 Kotlin Multiplatform 모듈
// commonMain 소스 세트:
interface Platform

fun application(p: Platform) {
    // 애플리케이션 로직
}
```

```kotlin
// androidMain 소스 세트:
class AndroidPlatform : Platform
```

```kotlin
// iosMain 소스 세트:
class IOSPlatform : Platform
```

```kotlin
// androidApp 플랫폼 모듈:
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
// iOS 앱의 Swift 코드:
import shared

@main
struct iOSApp : App {
    init() {
        application(IOSPlatform())
    }
}
```

Android에서는 `AndroidPlatform` 인스턴스를 생성하여 `application()` 함수에 전달하고, iOS에서는 마찬가지로 `IOSPlatform` 인스턴스를 생성하여 전달해야 합니다. 이러한 진입점이 반드시 애플리케이션의 진입점일 필요는 없지만, 공유 모듈의 특정 기능을 호출할 수 있는 지점이 됩니다.

expect 및 actual 함수를 사용하거나 진입점을 통해 직접 적절한 구현을 제공하는 방법은 단순한 시나리오에 적합합니다.
그러나 프로젝트에서 의존성 주입(DI) 프레임워크를 사용하고 있다면, 일관성을 유지하기 위해 단순한 케이스에서도 DI 프레임워크를 사용하는 것을 권장합니다.

### 의존성 주입(DI) 프레임워크 {id="dependency-injection-framework"}

현대적인 애플리케이션은 의존성 주입(Dependency Injection, DI) 프레임워크를 사용하여 런타임에 사용할 구현을 동적으로 결정하고 느슨하게 결합된 아키텍처를 구축할 수 있습니다.
Kotlin Multiplatform을 지원하는 모든 DI 프레임워크는 플랫폼에 따라 런타임에 컴포넌트에 서로 다른 의존성을 주입하도록 도와줍니다.

예를 들어, [Koin](https://insert-koin.io/)은 Kotlin Multiplatform을 지원하는 의존성 주입 프레임워크입니다.
다음과 같이 Koin을 사용하여 `Platform` 예제를 구현할 수 있습니다.

```kotlin
// 공통 소스 세트:
import org.koin.dsl.module

interface Platform

expect val platformModule: Module
```

```kotlin
// androidMain 소스 세트:
class AndroidPlatform : Platform

actual val platformModule: Module = module {
    single<Platform> {
        AndroidPlatform()
    }
}
```

```kotlin
// iosMain 소스 세트:
class IOSPlatform : Platform

actual val platformModule = module {
    single<Platform> { IOSPlatform() }
}
```

여기서 Koin DSL은 주입할 컴포넌트를 정의하는 모듈을 생성합니다. 공통 코드에서 `expect` 키워드로 모듈을 선언한 다음, `actual` 키워드를 사용하여 각 플랫폼에 맞는 플랫폼별 구현을 제공합니다.
프레임워크가 런타임에 올바른 구현을 선택하는 작업을 처리합니다.

DI 프레임워크를 사용할 때는 모든 의존성을 이 프레임워크를 통해 주입합니다. 플랫폼 의존성을 처리할 때도 동일한 로직이 적용됩니다. 프로젝트에 이미 DI가 적용되어 있다면, expect 및 actual 함수를 수동으로 사용하는 대신 DI를 계속 사용하는 것이 좋습니다. 이렇게 하면 의존성을 주입하는 두 가지 서로 다른 방식이 혼재되는 것을 방지할 수 있습니다.

또한 공통 인터페이스를 항상 Kotlin으로만 구현해야 하는 것은 아닙니다. 다른 _플랫폼 모듈_에서 Swift와 같은 다른 언어로 구현할 수도 있습니다. 이 접근 방식을 선택하는 경우, DI 프레임워크를 사용하여 iOS 플랫폼 모듈에서 구현체를 제공해야 합니다.

![의존성 주입 프레임워크 사용](expect-di-framework.svg){width=700}

이 접근 방식은 플랫폼 모듈에 구현체를 둘 때만 동작합니다. Kotlin Multiplatform 모듈이 자체적으로 완결될 수 없고 다른 모듈에서 공통 인터페이스를 구현해야 하므로 확장성 측면에서 그리 좋지 않습니다.

<!-- If you're interested in having this functionality expanded to a shared module, please vote for this issue in Youtrack and describe your use case. -->