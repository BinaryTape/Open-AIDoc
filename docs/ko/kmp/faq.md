[//]: # (title: 자주 묻는 질문(FAQ))

## Kotlin Multiplatform {id="kotlin-multiplatform"}

### Kotlin Multiplatform이란 무엇인가요? {id="what-is-kotlin-multiplatform"}

[Kotlin Multiplatform](https://www.jetbrains.com/kotlin-multiplatform/)(KMP)은 유연한 크로스 플랫폼 개발을 위해 JetBrains가 개발한 오픈 소스 기술입니다. 다양한 플랫폼용 애플리케이션을 제작하고 네이티브 프로그래밍의 이점을 유지하면서 플랫폼 간에 코드를 효율적으로 재사용할 수 있게 해줍니다. Kotlin Multiplatform을 사용하면 Android, iOS, 데스크톱, 웹, 서버 측 및 기타 플랫폼용 앱을 개발할 수 있습니다.

### Kotlin Multiplatform을 사용하여 UI 코드를 공유할 수 있나요? {id="can-i-share-ui-code-using-kotlin-multiplatform"}

네, Kotlin과 [Jetpack Compose](https://developer.android.com/jetpack/compose)를 기반으로 하는 JetBrains의 선언형 UI 프레임워크인 [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/)을 사용하여 UI를 공유할 수 있습니다. 이 프레임워크를 사용하면 iOS, Android, 데스크톱 및 웹과 같은 플랫폼을 위한 공통 UI 컴포넌트를 제작할 수 있으므로, 서로 다른 기기와 플랫폼 전반에서 일관된 사용자 인터페이스를 유지하는 데 도움이 됩니다.

자세한 내용은 [Compose Multiplatform](#compose-multiplatform) 섹션을 참조하세요.

### Kotlin Multiplatform은 어떤 플랫폼을 지원하나요? {id="what-platforms-does-kotlin-multiplatform-support"}

Kotlin Multiplatform은 Android, iOS, 데스크톱, 웹, 서버 측 및 기타 플랫폼을 지원합니다. 자세한 내용은 [지원하는 플랫폼](supported-platforms.md)을 참조하세요.

### 어떤 IDE에서 크로스 플랫폼 앱을 개발해야 하나요? {id="in-which-ide-should-i-work-on-my-cross-platform-app"}

Kotlin Multiplatform 프로젝트 작업을 위해 IntelliJ IDEA 또는 Android Studio를 사용하는 것을 권장합니다.

Kotlin Multiplatform 프로젝트에서 iOS를 타깃으로 삼는 경우, iOS 전용 코드를 작성하고 iOS 애플리케이션을 실행하려면 머신에 [Xcode](https://developer.apple.com/xcode/)가 설치되어 있어야 합니다.

### 새 Kotlin Multiplatform 프로젝트는 어떻게 생성하나요? {id="how-do-i-create-a-new-kotlin-multiplatform-project"}

[Kotlin Multiplatform 앱 생성하기](get-started.topic) 튜토리얼에서 Kotlin Multiplatform 프로젝트를 생성하는 단계별 가이드를 제공합니다. 로직만 공유할지, 로직과 UI를 모두 공유할지 선택할 수 있습니다.

### 기존에 만든 Android 애플리케이션이 있습니다. Kotlin Multiplatform으로 어떻게 마이그레이션할 수 있나요? {id="i-have-an-existing-android-application-how-can-i-migrate-it-to-kotlin-multiplatform"}

[Android 애플리케이션을 iOS에서 동작하도록 만들기](multiplatform-integrate-in-existing-app.md) 단계별 튜토리얼에서는 Android 애플리케이션이 네이티브 UI를 사용하여 iOS에서 동작하도록 만드는 방법을 설명합니다.

[Jetpack Compose 앱을 Kotlin Multiplatform으로 마이그레이션하기](migrate-from-android.md)는 복잡한 Android 애플리케이션을 멀티플랫폼으로 전환하는 종합적인 과정(UI를 Compose Multiplatform으로 마이그레이션하는 과정 포함)을 보여주는 고급 튜토리얼입니다.

### 참고해 볼 수 있는 완성된 예제는 어디서 찾을 수 있나요? {id="where-can-i-get-complete-examples-to-play-with"}

[실제 사용 예제 목록](multiplatform-samples.md)을 확인해 보세요.

### 실제 Kotlin Multiplatform 애플리케이션 사례 목록은 어디에서 확인할 수 있나요? 어떤 기업들이 프로덕션에서 KMP를 사용하고 있나요? {id="where-can-i-find-a-list-of-real-life-kotlin-multiplatform-applications-what-companies-use-kmp-in-production"}

이미 프로덕션 환경에 Kotlin Multiplatform을 도입한 다른 기업들의 사례를 확인하려면 [사례 연구(Case Studies) 목록](https://kotlinlang.org/case-studies/?type=multiplatform)을 살펴보세요.

### Kotlin Multiplatform은 어떤 운영체제에서 작업할 수 있나요? {id="which-operating-systems-can-work-with-kotlin-multiplatform"}

공통 코드나 플랫폼 전용 코드(iOS 제외)를 다루는 경우, IDE가 지원하는 모든 운영체제에서 작업할 수 있습니다.

iOS 전용 코드를 작성하고 시뮬레이터나 실제 기기에서 iOS 애플리케이션을 실행하려면 macOS가 설치된 Mac을 사용해야 합니다. 이는 Apple의 요구사항에 따라 iOS 시뮬레이터가 macOS에서만 실행될 수 있고, Microsoft Windows나 Linux 등 다른 운영체제에서는 실행될 수 없기 때문입니다.

자세한 내용은 [권장 IDE](recommended-ides.md)를 참조하세요.

### Kotlin Multiplatform 프로젝트에서 동시성(Concurrent) 코드는 어떻게 작성하나요? {id="how-can-i-write-concurrent-code-in-kotlin-multiplatform-projects"}

Kotlin Multiplatform 프로젝트에서도 코루틴(coroutine)과 플로우(flow)를 사용하여 비동기 코드를 작성할 수 있습니다. 이 코드를 호출하는 방법은 코드를 어디에서 호출하느냐에 따라 달라집니다. Kotlin 코드에서 suspend 함수와 플로우를 호출하는 방법은 특히 Android를 중심으로 광범위하게 문서화되어 있습니다. [Swift 코드에서 호출하는 방법](https://kotlinlang.org/docs/native-arc-integration.html#completion-handlers)은 약간의 추가 작업이 필요합니다. 자세한 내용은 [KT-47610](https://youtrack.jetbrains.com/issue/KT-47610)을 참조하세요.

현재 Swift에서 suspend 함수와 플로우를 호출하는 가장 좋은 방법은 [KMP-NativeCoroutines](https://github.com/rickclephas/KMP-NativeCoroutines)와 같은 플러그인 및 라이브러리를 Swift의 `async`/`await` 또는 Combine, RxSwift와 같은 라이브러리와 함께 사용하는 것입니다.

현재 KMP-NativeCoroutines는 보다 검증된 솔루션이며 동시성에 대한 `async`/`await`, Combine, RxSwift 접근 방식을 지원합니다. SKIE는 설정이 더 간편하고 덜 장황할 수 있습니다. 예를 들어 Kotlin의 `Flow`를 Swift의 `AsyncSequence`로 직접 매핑해 줍니다. 두 라이브러리 모두 코루틴의 적절한 취소(cancellation)를 지원합니다.

사용 방법을 알아보려면 [네이티브 UI: REST API 요청을 위한 공통 로직](multiplatform-upgrade-app.md) 튜토리얼을 참조하세요.

### Kotlin/Native란 무엇이며, Kotlin Multiplatform과는 어떤 관계인가요? {id="what-is-kotlin-native-and-how-does-it-relate-to-kotlin-multiplatform"}

[Kotlin/Native](https://kotlinlang.org/docs/native-overview.html)는 Kotlin 코드를 가상 머신 없이 실행할 수 있는 네이티브 바이너리로 컴파일하는 기술입니다. 여기에는 Kotlin 컴파일러를 위한 [LLVM 기반](https://llvm.org/) 백엔드와 Kotlin 표준 라이브러리의 네이티브 구현이 포함되어 있습니다.

Kotlin/Native는 주로 임베디드 기기나 iOS처럼 가상 머신을 사용하기 어렵거나 불가능한 플랫폼을 위한 컴파일을 지원하도록 설계되었습니다. 추가적인 런타임이나 가상 머신이 필요 없는 독립형 프로그램을 제작해야 할 때 특히 유용합니다.

예를 들어 모바일 애플리케이션의 경우 Kotlin으로 작성된 공통 코드는 Android용으로는 Kotlin/JVM을 통해 JVM 바이트코드로 컴파일되고, iOS용으로는 Kotlin/Native를 통해 네이티브 바이너리로 컴파일됩니다. 덕분에 두 플랫폼 모두에서 Kotlin Multiplatform과의 매끄러운 연동이 가능합니다.

![Kotlin/Native 및 Kotlin/JVM 바이너리](kotlin-native-and-jvm-binaries.png){width=350}

### 네이티브 플랫폼(iOS, macOS, Linux)용 Kotlin Multiplatform 모듈 컴파일 속도를 어떻게 높일 수 있나요? {id="how-can-i-speed-up-my-kotlin-multiplatform-module-compilation-for-native-platforms-ios-macos-linux"}

[Kotlin/Native 컴파일 시간 단축을 위한 팁](https://kotlinlang.org/docs/native-improving-compilation-time.html)을 참조하세요.

## Compose Multiplatform {id="compose-multiplatform"}

### Compose Multiplatform이란 무엇인가요? {id="what-is-compose-multiplatform"}

[Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/)은 적은 양의 Kotlin 코드로 사용자 인터페이스를 간단하게 구축할 수 있는 방법을 제공하는, JetBrains에서 개발한 최신 선언형 및 반응형 UI 프레임워크입니다. 또한 UI를 한 번만 작성하면 지원되는 모든 플랫폼(iOS, Android, 데스크톱(Windows, macOS, Linux), 웹)에서 실행할 수 있습니다.

### Android용 Jetpack Compose와는 어떤 관계인가요? {id="how-does-it-relate-to-jetpack-compose-for-android"}

Compose Multiplatform은 Google이 개발한 Android UI 프레임워크인 [Jetpack Compose](https://developer.android.com/jetpack/compose)와 대부분의 API를 공유합니다. 실제로 Compose Multiplatform을 사용하여 Android를 타깃으로 삼는 경우, 앱은 단순히 Jetpack Compose 위에서 실행됩니다.
Compose Multiplatform이 타깃으로 하는 다른 플랫폼들은 내부적인 세부 구현이 Android의 Jetpack Compose와 다를 수 있지만, 개발자에게는 동일한 API를 제공합니다.

자세한 내용은 [프레임워크 간 상호 관계 개요](compose-multiplatform-and-jetpack-compose.md)를 참조하세요.

### 어떤 플랫폼 간에 UI를 공유할 수 있나요? {id="between-which-platforms-can-i-share-my-ui"}

Android, iOS, 데스크톱(Linux, macOS, Windows), 웹(Wasm 기반) 등 널리 사용되는 플랫폼의 모든 조합 간에 UI를 공유할 수 있도록 지원하고자 합니다. Compose Multiplatform은 현재 Android, iOS, 데스크톱에서 Stable 상태입니다. 자세한 내용은 [지원하는 플랫폼](supported-platforms.md)을 참조하세요.

### 프로덕션 환경에서 Compose Multiplatform을 사용할 수 있나요? {id="can-i-use-compose-multiplatform-in-production"}

Compose Multiplatform의 Android, iOS, 데스크톱 타깃은 Stable 단계입니다. 프로덕션 환경에서 사용하실 수 있습니다.

WebAssembly를 기반으로 하는 웹용 Compose Multiplatform 버전은 Beta 단계이며, 이는 거의 완성 단계에 이르렀음을 의미합니다. 사용할 수는 있지만 여전히 마이그레이션 관련 이슈가 발생할 수 있습니다.
iOS, Android, 데스크톱용 Compose Multiplatform과 동일한 UI를 제공합니다.

### 새 Compose Multiplatform 프로젝트는 어떻게 생성하나요? {id="how-do-i-create-a-new-compose-multiplatform-project"}

[공통 로직 및 UI가 포함된 Compose Multiplatform 앱 생성하기](compose-multiplatform-new-project.md) 튜토리얼에서 Android, iOS, 데스크톱용 Compose Multiplatform을 사용하는 Kotlin Multiplatform 프로젝트 생성 단계별 가이드를 제공합니다.
또한 Kotlin Developer Advocate인 Sebastian Aigner가 제작한 YouTube [비디오 튜토리얼](https://www.youtube.com/watch?v=5_W5YKPShZ4)도 시청하실 수 있습니다.

### Compose Multiplatform으로 앱을 빌드하려면 어떤 IDE를 사용해야 하나요? {id="what-ide-should-i-use-for-building-apps-with-compose-multiplatform"}

[KMP IDE 플러그인](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform/)이 설치된 IntelliJ IDEA 또는 Android Studio IDE를 사용하는 것을 권장합니다.

자세한 내용은 [권장 IDE 및 코드 에디터](recommended-ides.md)를 참조하세요.

### 데모 애플리케이션을 직접 실행해 볼 수 있나요? 어디서 찾을 수 있나요? {id="can-i-play-with-a-demo-application-where-can-i-find-it"}

JetBrains가 제공하는 [샘플 프로젝트](multiplatform-samples.md)를 직접 확인하고 사용해 보실 수 있습니다.

### Compose Multiplatform에 기본 위젯이 포함되어 있나요? {id="does-compose-multiplatform-come-with-widgets"}

네, Compose Multiplatform은 [Material 3](https://m3.material.io/) 위젯을 완벽하게 지원합니다.

### Material 위젯의 디자인을 어느 정도까지 커스텀할 수 있나요? {id="to-what-extent-can-i-customize-the-appearance-of-material-widgets"}

Material의 테마 기능을 사용하여 색상, 폰트, 패딩 등을 커스텀할 수 있습니다. 독창적인 디자인을 만들고 싶다면 커스텀 위젯과 레이아웃을 직접 제작할 수도 있습니다.

### 기존 Kotlin Multiplatform 앱에서 UI를 공유할 수 있나요? {id="can-i-share-the-ui-in-my-existing-kotlin-multiplatform-app"}

애플리케이션이 UI에 네이티브 API를 사용하는 경우(가장 일반적인 경우), Compose Multiplatform이 상호 운용성을 제공하므로 일부 파트를 점진적으로 Compose Multiplatform으로 다시 작성할 수 있습니다. 네이티브 UI를 Compose로 작성된 공통 UI를 감싸는 특수 상호 운용(interop) 뷰로 대체할 수 있습니다.

### Jetpack Compose를 사용하는 기존 Android 애플리케이션이 있습니다. 다른 플랫폼으로 마이그레이션하려면 어떻게 해야 하나요? {id="i-have-an-existing-android-application-that-uses-jetpack-compose-what-should-i-do-to-migrate-it-to-other-platforms"}

앱 마이그레이션은 UI 마이그레이션과 로직 마이그레이션의 두 부분으로 구성됩니다. 마이그레이션의 복잡도는 애플리케이션의 복잡성과 사용하는 Android 전용 라이브러리의 수에 따라 달라집니다.

복잡한 앱의 마이그레이션 예시는 [Jetpack Compose 앱을 Kotlin Multiplatform으로 마이그레이션하기](migrate-from-android.md) 가이드를 참조하세요.

대부분의 화면은 변경 없이 그대로 Compose Multiplatform으로 마이그레이션할 수 있습니다. 모든 Jetpack Compose 위젯이 지원됩니다. 그러나 일부 API는 Android 타깃에서만 동작합니다. 해당 API가 Android 전용이거나 아직 다른 플랫폼으로 이식되지 않았을 수 있습니다. 예를 들어 리소스 처리는 Android 전용이므로, [Compose Multiplatform 리소스 라이브러리](compose-multiplatform-resources.md)로 마이그레이션하거나 커뮤니티 솔루션을 사용해야 합니다.
Android에서만 사용할 수 있는 컴포넌트에 대한 자세한 내용은 현재 [Android 전용 API 목록](compose-android-only-components.md)을 참조하세요.

[비즈니스 로직을 Kotlin Multiplatform으로 마이그레이션](multiplatform-integrate-in-existing-app.md)해야 합니다. 코드를 공통 모듈로 이동하려고 할 때 Android 의존성을 사용하는 부분은 컴파일되지 않으므로 이를 다시 작성해야 합니다.

* Android 전용 의존성을 사용하는 코드를 멀티플랫폼 라이브러리를 사용하도록 다시 작성할 수 있습니다. 일부 라이브러리는 이미 Kotlin Multiplatform을 지원할 수 있으므로 변경이 필요하지 않습니다. [klibs.io](https://klibs.io/) 카탈로그나 [KMP-awesome](https://github.com/terrakok/kmp-awesome) 라이브러리 목록을 확인해 보세요.
* 또는 공통 코드와 플랫폼 전용 로직을 분리하고, 플랫폼에 따라 다르게 구현되는 [공통 인터페이스를 제공](multiplatform-connect-to-apis.md)할 수 있습니다. Android에서는 기존 기능을 그대로 활용하여 구현할 수 있으며, iOS와 같은 다른 플랫폼에서는 해당 공통 인터페이스에 대한 새로운 구현을 제공해야 합니다.

### 기존 iOS 앱에 Compose 화면을 통합할 수 있나요? {id="can-i-integrate-compose-screens-into-an-existing-ios-app"}

네. Compose Multiplatform은 다양한 통합 시나리오를 지원합니다. iOS UI 프레임워크와의 통합에 대한 자세한 내용은 [SwiftUI와의 통합](compose-swiftui-integration.md) 및 [UIKit과의 통합](compose-uikit-integration.md)을 참조하세요.

### Compose 화면에 UIKit이나 SwiftUI 컴포넌트를 통합할 수 있나요? {id="can-i-integrate-uikit-or-swiftui-components-into-a-compose-screen"}

네, 가능합니다. [SwiftUI와의 통합](compose-swiftui-integration.md) 및 [UIKit과의 통합](compose-uikit-integration.md)을 참조하세요.

<!-- Need to revise
### What happens when my mobile OS updates and introduces new platform capabilities? {id="what-happens-when-my-mobile-os-updates-and-introduces-new-platform-capabilities"}

You can use them in platform-specific parts of your codebase once Kotlin supports them. We do our best to support them
in the upcoming Kotlin version. All new Android capabilities provide Kotlin or Java APIs, and wrappers over iOS APIs are
generated automatically.
-->

### 모바일 OS가 업데이트되어 시스템 컴포넌트의 시각적 스타일이나 동작이 변경되면 어떻게 되나요? {id="what-happens-when-my-mobile-os-updates-and-changes-the-visual-style-of-the-system-components-or-their-behavior"}

모든 컴포넌트가 캔버스(canvas)에 그려지기 때문에 OS가 업데이트되어도 UI는 그대로 유지됩니다. 화면에 네이티브 iOS 컴포넌트를 삽입한 경우에는 업데이트로 인해 해당 컴포넌트의 외형에 영향이 있을 수 있습니다.

## 향후 계획 {id="future-plans"}

### Kotlin Multiplatform 발전 계획은 어떻게 되나요? {id="what-are-the-plans-for-the-kotlin-multiplatform-evolution"}

JetBrains는 멀티플랫폼 개발을 위한 최상의 경험을 제공하고 멀티플랫폼 사용자들의 기존 고충을 해소하기 위해 많은 투자를 하고 있습니다.
핵심 Kotlin Multiplatform 기술, Apple 에코시스템과의 연동, 툴링, 그리고 Compose Multiplatform UI 프레임워크를 개선할 계획을 가지고 있습니다.
[Kotlin 로드맵의 Multiplatform 섹션](https://kotlinlang.org/docs/roadmap.html#kotlin-roadmap-by-subsystem)을 확인해 보세요.

### Compose Multiplatform은 언제 Stable 단계가 되나요? {id="when-will-compose-multiplatform-become-stable"}

Compose Multiplatform은 Android, iOS, 데스크톱에서 Stable 상태이며, Wasm 기반의 웹 지원은 Beta 단계입니다.
웹 플랫폼의 안정화 릴리스를 위해 작업 중이며, 구체적인 일정은 추후 발표될 예정입니다.

안정성 상태에 대한 자세한 내용은 [지원하는 플랫폼](supported-platforms.md)을 참조하세요.

### Kotlin 및 Compose Multiplatform의 향후 웹 타깃 지원은 어떻게 되나요? {id="what-about-future-support-for-web-targets-in-kotlin-and-compose-multiplatform"}

현재 큰 잠재력을 지닌 WebAssembly(Wasm)에 리소스를 집중하고 있습니다. 새로운 [Kotlin/Wasm 백엔드](https://kotlinlang.org/docs/wasm-overview.html)와 Wasm 기반의 [웹용 Compose Multiplatform](https://kotl.in/wasm-compose-example)을 시험적으로 사용해 보실 수 있습니다.

JS 타깃의 경우 Kotlin/JS 백엔드는 이미 Stable 상태에 도달했습니다. Compose Multiplatform에서는 리소스의 제약으로 인해 JS Canvas에서 더 유망하다고 판단되는 Wasm으로 초점을 전환했습니다.

또한 이전에는 웹용 Compose Multiplatform으로 불렸던 Compose HTML도 제공합니다. 이는 Kotlin/JS에서 DOM을 다루기 위해 설계된 추가 라이브러리이며, 플랫폼 간 UI를 공유하기 위한 용도는 아닙니다.

### 멀티플랫폼 개발 툴링을 개선할 계획이 있나요? {id="are-there-any-plans-to-improve-tooling-for-multiplatform-development"}

네, 멀티플랫폼 툴링의 현재 과제들을 깊이 인식하고 있으며 여러 영역에서 개선 작업을 활발히 진행하고 있습니다.

### Swift 상호 운용성을 제공할 예정인가요? {id="are-you-going-to-provide-swift-interoperability"}

네. 현재 Kotlin 코드를 Swift로 내보내는(export) 것에 중점을 두고, Swift와의 직접적인 상호 운용성을 제공하기 위한 다양한 접근 방식을 검토하고 있습니다.