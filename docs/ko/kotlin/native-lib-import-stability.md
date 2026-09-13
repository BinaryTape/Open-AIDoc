[//]: # (title: C, Objective-C, 및 Swift 라이브러리 임포트)

Kotlin/Native는 [C](native-c-interop.md) 및 [Objective-C](native-objc-interop.md) 라이브러리를 임포트(import)하는 기능을 제공합니다.
또한 Kotlin/Native 프로젝트에서 순수 [Swift 라이브러리](#swift-library-import)를 임포트하기 위한 우회 방법도 사용할 수 있습니다.

## C 및 Objective-C 라이브러리 임포트의 안정성 {id="stability-of-c-and-objective-c-library-import"}
<primary-label ref="beta"/>

C 및 Objective-C 라이브러리 임포트 지원은 현재 [베타(Beta)](components-stability.md#kotlin-native) 단계입니다.

베타 상태인 주요 이유 중 하나는 C 및 Objective-C 라이브러리를 사용하면 코드와 다양한 버전의 Kotlin, 의존성 및 Xcode 간의 호환성에 영향을 미칠 수 있기 때문입니다. 이 가이드에서는 실무에서 자주 발생하는 호환성 문제, 특정 상황에서만 발생하는 문제, 그리고 가상의 잠재적 이슈들을 나열합니다.

단순화를 위해 여기에서는 C 및 Objective-C 라이브러리, 즉 *네이티브 라이브러리*를 다음과 같이 구분합니다:

* [플랫폼 라이브러리](#platform-libraries): 각 플랫폼의 "시스템" 네이티브 라이브러리에 액세스하기 위해 Kotlin에서 기본적으로 제공하는 라이브러리입니다.
* [서드파티 라이브러리](#third-party-libraries): Kotlin에서 사용하기 위해 추가 구성이 필요한 그 외 모든 네이티브 라이브러리입니다.

이 두 종류의 네이티브 라이브러리는 서로 다른 호환성 특성을 가집니다.

### 플랫폼 라이브러리 {id="platform-libraries"}

[_플랫폼 라이브러리_](native-platform-libs.md)는 Kotlin/Native 컴파일러와 함께 제공됩니다.
따라서 프로젝트에서 다른 버전의 Kotlin을 사용하면 다른 버전의 플랫폼 라이브러리를 사용하게 됩니다. Apple 타겟(예: iOS)의 경우, 플랫폼 라이브러리는 특정 컴파일러 버전이 지원하는 Xcode 버전을 기준으로 생성됩니다.

Xcode SDK와 함께 제공되는 네이티브 라이브러리 API는 Xcode 버전마다 변경됩니다.
이러한 변경 사항이 네이티브 언어 내에서는 소스 및 바이너리 호환성을 유지하더라도, 상호 운용성(interoperability) 구현 방식으로 인해 Kotlin에서는 브레이킹 체인지(breaking change)가 될 수 있습니다.

결과적으로 프로젝트의 Kotlin 버전을 업데이트하면 플랫폼 라이브러리에 브레이킹 체인지가 발생할 수 있습니다. 이는 다음 두 가지 경우에 문제가 될 수 있습니다:

* 프로젝트의 소스 코드 컴파일에 영향을 미치는 플랫폼 라이브러리의 소스 브레이킹 체인지가 있는 경우입니다. 일반적으로 이는 수정하기 쉽습니다.
* 일부 의존성에 영향을 미치는 플랫폼 라이브러리의 바이너리 브레이킹 체인지가 있는 경우입니다. 일반적으로 쉬운 해결 방법이 없으며, 라이브러리 개발자가 Kotlin 버전을 업데이트하는 등의 조치를 통해 이 문제를 해결할 때까지 기다려야 합니다.

  > 이러한 바이너리 부적합성은 링킹(linkage) 경고 및 런타임 예외로 나타납니다.
  > 컴파일 시점에 이를 감지하고 싶다면, [`-Xpartial-linkage-loglevel=ERROR`](whatsnew19.md#library-linkage-in-kotlin-native) 컴파일러 옵션을 사용하여 경고를 에러로 격상시키세요.
  >
  {style="note"}

JetBrains 팀은 플랫폼 라이브러리를 생성하는 데 사용되는 Xcode 버전을 업데이트할 때, 플랫폼 라이브러리의 브레이킹 체인지를 피하기 위해 합리적인 노력을 기울입니다. 브레이킹 체인지가 발생할 가능성이 있을 때마다 팀은 영향 분석을 수행하고, 특정 변경 사항을 무시하기로 결정하거나(영향을 받는 API가 일반적으로 사용되지 않기 때문), 애드혹(ad hoc) 수정을 적용합니다.

플랫폼 라이브러리에서 브레이킹 체인지가 발생하는 또 다른 잠재적 이유는 네이티브 API를 Kotlin으로 번역하는 알고리즘의 변경입니다. JetBrains 팀은 이러한 경우에도 브레이킹 체인지를 피하기 위해 합리적인 노력을 기울입니다.

#### 플랫폼 라이브러리의 새로운 Objective-C 클래스 사용 {id="using-new-objective-c-classes-from-platform-libraries"}

Kotlin 컴파일러는 배포 대상(deployment target)에서 사용할 수 없는 Objective-C 클래스를 사용하는 것을 방지하지 않습니다.

예를 들어 배포 대상이 iOS 17.0인데 iOS 18.0에서만 등장한 클래스를 사용하는 경우, 컴파일러는 경고를 표시하지 않으며 iOS 17.0 기기에서 애플리케이션 실행 중 크래시가 발생할 수 있습니다.
심지어 해당 코드가 실행되지 않더라도 크래시가 발생할 수 있으므로, 버전 체크로 감싸는 것만으로는 충분하지 않습니다.

자세한 내용은 [강한 연결(Strong linking)](native-objc-interop.md#strong-linking)을 참조하세요.

### 서드파티 라이브러리 {id="third-party-libraries"}

시스템 플랫폼 라이브러리 외에도 Kotlin/Native는 서드파티 네이티브 라이브러리 임포트를 허용합니다.
예를 들어, [CocoaPods 통합](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-overview.html)을 사용하거나 [cinterops 설정](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#cinterops)을 구성할 수 있습니다.

#### 일치하지 않는 Xcode 버전으로 라이브러리 임포트 {id="importing-libraries-with-mismatched-xcode-version"}

서드파티 네이티브 라이브러리를 임포트하면 다른 Xcode 버전과의 호환성 문제가 발생할 수 있습니다.

네이티브 라이브러리를 처리할 때 컴파일러는 일반적으로 로컬에 설치된 Xcode의 헤더 파일을 사용합니다. 거의 모든 네이티브 라이브러리 헤더가 Xcode에서 제공하는 "표준" 헤더(예: `stdint.h`)를 임포트하기 때문입니다.

이것이 Xcode 버전이 Kotlin으로의 네이티브 라이브러리 임포트에 영향을 미치는 이유입니다. 또한 서드파티 네이티브 라이브러리를 사용할 때 [Mac이 아닌 호스트에서 Apple 타겟을 크로스 컴파일](https://kotlinlang.org/docs/multiplatform/multiplatform-publish-lib-setup.html#compilation-for-apple-targets)하는 것이 여전히 불가능한 이유 중 하나이기도 합니다.

각 Kotlin 버전은 특정 단일 Xcode 버전과 가장 잘 호환됩니다. 이는 권장 버전이며, 해당 Kotlin 버전에 대해 가장 많이 테스트된 버전입니다. 특정 Xcode 버전과의 호환성은 [호환성 테이블](https://kotlinlang.org/docs/multiplatform/multiplatform-compatibility-guide.html#version-compatibility)에서 확인하세요.

더 새롭거나 오래된 Xcode 버전을 사용하는 것이 가능한 경우가 많지만, 대개 서드파티 네이티브 라이브러리 임포트에 영향을 미치는 문제가 발생할 수 있습니다.

##### Xcode 버전이 권장 버전보다 최신인 경우 {id="xcode-version-is-newer-than-recommended"}

권장 버전보다 최신인 Xcode 버전을 사용하면 일부 Kotlin 기능이 작동하지 않을 수 있습니다. 서드파티 네이티브 라이브러리 임포트가 이에 가장 큰 영향을 받습니다. 지원되지 않는 Xcode 버전에서는 아예 작동하지 않는 경우가 많습니다.

##### Xcode 버전이 권장 버전보다 오래된 경우 {id="xcode-version-is-older-than-recommended"}

일반적으로 Kotlin은 이전 Xcode 버전과 잘 작동합니다. 간혹 다음과 같은 문제가 발생할 수 있습니다:

* [KT-71694](https://youtrack.jetbrains.com/issue/KT-71694)와 같이 Kotlin API가 존재하지 않는 타입을 참조하는 경우.
* 시스템 라이브러리의 타입이 네이티브 라이브러리의 Kotlin API에 포함되는 경우.
  이 경우 프로젝트는 성공적으로 컴파일되지만, 시스템 네이티브 타입이 네이티브 라이브러리 패키지에 추가됩니다. 예를 들어 IDE 자동 완성에서 이 타입이 예기치 않게 표시될 수 있습니다.

이전 Xcode 버전에서 Kotlin 라이브러리가 성공적으로 컴파일된다면, [Kotlin 라이브러리 API에서 서드파티 라이브러리의 타입을 사용](#using-native-types-in-library-api)하지 않는 한 안전하게 배포할 수 있습니다.

#### 전이적 서드파티 네이티브 의존성 사용 {id="using-a-transitive-third-party-native-dependency"}

프로젝트의 Kotlin 라이브러리가 구현의 일부로 서드파티 네이티브 라이브러리를 임포트하면, 해당 프로젝트도 해당 네이티브 라이브러리에 접근할 수 있게 됩니다.
이는 Kotlin/Native가 `api`와 `implementation` 의존성 유형을 구분하지 않기 때문에 발생하며, 네이티브 라이브러리는 항상 `api` 의존성이 됩니다.

이러한 전이적(transitive) 네이티브 의존성을 사용하면 더 많은 호환성 문제가 발생하기 쉽습니다.
예를 들어, Kotlin 라이브러리 개발자가 변경한 사항으로 인해 네이티브 라이브러리의 Kotlin 표현이 호환되지 않게 되어, Kotlin 라이브러리를 업데이트할 때 호환성 문제가 발생할 수 있습니다.

따라서 전이적 의존성에 의존하는 대신, 동일한 네이티브 라이브러리와 직접 상호 운용성을 구성하세요. 이를 위해 호환성 문제를 방지하기 위해 [커스텀 패키지 이름 사용](#use-custom-package-name)과 유사하게 네이티브 라이브러리에 다른 패키지 이름을 사용하세요.

#### 라이브러리 API에서 네이티브 타입 사용 {id="using-native-types-in-library-api"}

Kotlin 라이브러리를 배포하는 경우 라이브러리 API에서 네이티브 타입을 사용하는 데 주의해야 합니다. 이러한 사용은 향후 호환성 및 기타 문제를 해결하기 위해 변경될 가능성이 있으며, 이는 라이브러리 사용자에게 영향을 미칩니다.

라이브러리의 목적상 라이브러리 API에서 네이티브 타입을 사용하는 것이 필요한 경우가 있습니다. 예를 들어 Kotlin 라이브러리가 기본적으로 네이티브 라이브러리에 대한 확장을 제공하는 경우입니다. 그런 경우가 아니라면 라이브러리 API에서 네이티브 타입을 사용하지 않거나 제한적으로 사용하세요.

이 권장 사항은 라이브러리 API에서의 네이티브 타입 사용에만 적용되며 애플리케이션 코드와는 관련이 없습니다. 또한 다음과 같이 라이브러리 구현에는 적용되지 않습니다:

```kotlin
// 주의하세요! 네이티브 타입이 라이브러리 API에 사용되었습니다:
public fun createUIView(): UIView
public fun handleThirdPartyNativeType(c: ThirdPartyNativeType)

// 일반적인 경우와 같습니다. 네이티브 타입이 라이브러리 API에 사용되지 않았습니다:
internal fun createUIViewController(): UIViewController
public fun getDate(): String = NSDate().toString()
```

#### 서드파티 라이브러리를 사용하는 라이브러리 배포 {id="publishing-a-library-that-uses-third-party-library"}

서드파티 네이티브 라이브러리를 사용하는 Kotlin 라이브러리를 배포할 때 호환성 문제를 피하기 위해 할 수 있는 몇 가지 작업이 있습니다.

##### 커스텀 패키지 이름 사용 {id="use-custom-package-name"}

서드파티 네이티브 라이브러리에 커스텀 패키지 이름을 사용하면 호환성 문제를 예방하는 데 도움이 될 수 있습니다.

네이티브 라이브러리가 Kotlin으로 임포트되면 Kotlin 패키지 이름을 갖게 됩니다. 이 이름이 고유하지 않으면 라이브러리 사용자에게 충돌이 발생할 수 있습니다. 예를 들어 사용자의 프로젝트나 다른 의존성의 다른 곳에서 동일한 패키지 이름으로 네이티브 라이브러리를 임포트하면 두 사용 사례가 충돌합니다.

이러한 경우 컴파일이 `Linking globals named '...': symbol multiply defined!` 오류와 함께 실패할 수 있습니다. 그러나 다른 오류가 발생하거나 심지어 컴파일에 성공할 수도 있습니다.

서드파티 네이티브 라이브러리에 커스텀 이름을 사용하려면:

* CocoaPods 통합을 통해 네이티브 라이브러리를 임포트할 때, Gradle 빌드 스크립트의 `pod {}` 블록에서 [`packageName`](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-dsl-reference.html#pod-function) 속성을 사용하세요.
* `cinterops` 구성으로 네이티브 라이브러리를 임포트할 때, 구성 블록에서 [`packageName`](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#cinterops) 속성을 사용하세요.

##### 이전 Kotlin 버전과의 호환성 확인 {id="check-compatibility-with-older-kotlin-versions"}

Kotlin 라이브러리를 배포할 때 서드파티 네이티브 라이브러리를 사용하면 다른 Kotlin 버전과의 라이브러리 호환성에 영향을 미칠 수 있습니다. 구체적으로 다음과 같습니다:

* Kotlin Multiplatform 라이브러리는 전방 호환성(forward compatibility, 이전 버전의 컴파일러가 최신 버전의 컴파일러로 컴파일된 라이브러리를 사용할 수 있는 경우)을 보장하지 않습니다.

  실제로는 일부 경우에 작동하지만, 네이티브 라이브러리를 사용하면 전방 호환성이 더욱 제한될 수 있습니다.

* Kotlin Multiplatform 라이브러리는 후방 호환성(backward compatibility, 최신 버전의 컴파일러가 이전 버전으로 생성된 라이브러리를 사용할 수 있는 경우)을 제공합니다.

  Kotlin 라이브러리에서 네이티브 라이브러리를 사용하는 것은 일반적으로 후방 호환성에 영향을 미치지 않아야 합니다. 하지만 호환성에 영향을 미치는 컴파일러 버그가 발생할 가능성이 높아집니다.

##### 정적 라이브러리 임베딩 지양 {id="avoid-embedding-static-libraries"}

네이티브 라이브러리를 임포트할 때 `-staticLibrary` 컴파일러 옵션이나 `.def` 파일의 `staticLibraries` 속성을 사용하여 관련 [정적 라이브러리](native-definition-file.md#include-a-static-library)(`.a` 파일)를 포함할 수 있습니다. 이 경우 라이브러리 사용자는 네이티브 의존성 및 링커 옵션을 직접 다룰 필요가 없습니다.

하지만 포함된 정적 라이브러리의 사용을 어떤 방식으로도 구성할 수 없습니다. 즉, 제외하거나 교체(대체)할 수 없습니다. 따라서 사용자는 동일한 정적 라이브러리를 포함하는 다른 Kotlin 라이브러리와의 잠재적인 충돌을 해결하거나 버전을 조정할 수 없게 됩니다.

### 네이티브 라이브러리 지원의 진화 {id="evolution-of-native-library-support"}

현재 Kotlin 프로젝트에서 C 및 Objective-C를 사용하면 호환성 문제가 발생할 수 있으며, 그중 일부는 이 가이드에 나열되어 있습니다. 이를 해결하기 위해 향후 일부 브레이킹 체인지가 필요할 수 있으며, 이는 그 자체로 호환성 문제의 원인이 될 수 있습니다.

## Swift 라이브러리 임포트 {id="swift-library-import"}

Kotlin/Native는 순수 Swift 라이브러리의 직접 임포트를 지원하지 않습니다. 하지만 이를 우회할 수 있는 몇 가지 옵션이 있습니다.

한 가지 방법은 수동 Objective-C 브릿징(bridging)을 사용하는 것입니다. 이 접근 방식에서는 커스텀 Objective-C 래퍼와 `.def` 파일을 작성하고 cinterop을 통해 해당 래퍼를 사용해야 합니다.

그러나 대부분의 경우 *역방향 임포트(reverse import)* 방식을 권장합니다. Kotlin 쪽에서 예상되는 동작을 정의하고, Swift 쪽에서 실제 기능을 구현한 다음, 이를 다시 Kotlin으로 전달하는 방식입니다.

예상되는 부분은 다음 세 가지 방법 중 하나로 정의할 수 있습니다:

* 인터페이스 생성. 인터페이스 기반 방식은 다수의 함수를 다루거나 테스트 용이성 면에서 더 확장성이 좋습니다.
* Swift 클로저 사용. 빠른 프로토타입 제작에는 좋지만, 상태를 유지하지 못하는 등의 한계가 있습니다.
* [Swift export](native-swift-export.md) 사용. Objective-C 브릿징 없이도 Swift에서 Kotlin 인터페이스를 직접 구현하고 해당 Swift 객체를 다시 Kotlin으로 전달할 수 있습니다.

순수 Swift 라이브러리인 [CryptoKit](https://developer.apple.com/documentation/cryptokit/)을 Kotlin 프로젝트로 역방향 임포트하는 예제를 살펴보겠습니다:

<tabs>
<tab title="인터페이스">

1. Kotlin 쪽에서 Kotlin이 Swift에 기대하는 바를 설명하는 인터페이스를 만듭니다:

   ```kotlin
   // CryptoProvider.kt
   interface CryptoProvider {
       fun hashMD5(input: String): String
   }
   ```

2. Kotlin 쪽에서 `MainViewController`로부터 플랫폼별 구현체를 전달받은 다음, `App` 컴포저블에서 이를 파라미터로 받아 필요한 곳에서 사용합니다:

   ```kotlin
   // App.kt
   @Composable
   fun App(cryptoProvider: CryptoProvider) {
       // UI 내부에서의 사용 예시
       val hashed = cryptoProvider.hashMD5("Hello, world!")
       androidx.compose.material3.Text("Compose: $hashed")
   }
   ```

   ```kotlin
   // MainViewController.kt
   fun MainViewController(cryptoProvider: CryptoProvider) = ComposeUIViewController {
       App(cryptoProvider)
   }
   ```

3. Swift 쪽에서 순수 Swift 라이브러리인 CryptoKit을 사용하여 MD5 해싱 기능을 구현합니다:

   ```swift
   // iosApp/ContentView.swift
   import CryptoKit
  
   class IosCryptoProvider: CryptoProvider {
       func hashMD5(input: String) -> String {
           guard let data = input.data(using: .utf8) else { return "failed" }
           return Insecure.MD5.hash(data: data).description
       }
   }
   ```

4. Swift 구현체를 Kotlin 컴포넌트에 전달합니다:

   ```swift
   // iosApp/ContentView.swift
   struct ComposeView: UIViewControllerRepresentable {
       func makeUIViewController(context: Context) -> UIViewController {
           // Kotlin UI 진입점에 Swift 구현체 주입
           MainViewControllerKt.MainViewController(cryptoProvider: IosCryptoProvider())
       }

       func updateUIViewController(_ uiViewController: UIViewController, context: Context) {}
   }
   ```

</tab>
<tab title="Swift 클로저">

1. Kotlin 쪽에서 함수 파라미터를 선언하고 필요한 곳에서 사용합니다:

    ```kotlin
    // App.kt
    @Composable
    fun App(md5Hasher: (String) -> String) {
        // UI 내부에서의 사용 예시
        val hashed = md5Hasher("Hello, world!")
        androidx.compose.material3.Text("Compose: $hashed")
    }
    ```

    ```kotlin
    // MainViewController.kt
    fun MainViewController(md5Hasher: (String) -> String) = ComposeUIViewController {
        App(md5Hasher)
    }
    ```

2. Swift 쪽에서 CryptoKit 라이브러리로 MD5 해시 함수를 빌드하고 이를 클로저로 전달합니다:

    ```swift
    // iosApp/ContentView.swift
    import CryptoKit
    import SwiftUI

    struct ComposeView: UIViewControllerRepresentable {
        func makeUIViewController(context: Context) -> UIViewController {
            MainViewControllerKt.MainViewController(md5Hasher: { input in
                guard let data = input.data(using: .utf8) else { return "failed" }
                return Insecure.MD5.hash(data: data).description
            })
        }

        func updateUIViewController(_ uiViewController: UIViewController, context: Context) {}
    }
    ```

</tab>
<tab title="Swift export">

1. Kotlin 쪽에서 인터페이스, 이 인터페이스를 받는 함수, 그리고 Swift 구현체에서 상속할 수 있는 `open` 베이스 클래스를 선언합니다:

   ```kotlin
   // CryptoProvider.kt
   interface CryptoProvider {
       fun hashMD5(input: String): String
   }

   fun processHash(provider: CryptoProvider, input: String): String = provider.hashMD5(input)

   open class SwiftBase
   ```

2. Swift 쪽에서 익스포트된 `SwiftBase` 클래스를 상속하고, 순수 Swift CryptoKit 라이브러리를 사용하여 인터페이스를 구현한 후, 해당 객체를 다시 Kotlin으로 전달합니다:

   ```swift
   // iosApp/ContentView.swift
   import CryptoKit

   final class IosCryptoProvider: SwiftBase, CryptoProvider {
       func hashMD5(input: String) -> String {
           guard let data = input.data(using: .utf8) else { return "failed" }
           return Insecure.MD5.hash(data: data).description
       }
   }

   let provider = IosCryptoProvider()

   // Kotlin 함수를 호출하며, 이 함수는 다시 Swift의 hashMD5()를 호출합니다
   print(processHash(provider: provider, input: "Hello, world!"))
   ```

Kotlin이 Swift 객체를 받으면 이를 일반적인 Kotlin 인터페이스의 구현체처럼 취급하여 Swift 코드를 직접 호출합니다.

</tab>
</tabs>

더 복잡한 프로젝트에서는 의존성 주입(dependency injection)을 사용하여 Swift 구현체를 Kotlin으로 다시 전달하는 것이 더 편리합니다. 자세한 내용은 [의존성 주입 프레임워크](https://kotlinlang.org/docs/multiplatform/multiplatform-connect-to-apis.html#dependency-injection-framework)를 참조하거나 [Koin 프레임워크](https://insert-koin.io/docs/reference/koin-mp/kmp/) 문서를 확인하세요.