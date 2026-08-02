<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       id="kmp-for-ios" title="iOS용 Kotlin Multiplatform: 통합, 성능 및 워크플로에 대한 오해">
<show-structure for="chapter,procedure" depth="1"/>
<web-summary>Kotlin Multiplatform이 iOS에서도 잘 작동할까요? Swift와의 통합 방식, 성능에 미치는 영향, 그리고 실제 iOS 개발 워크플로에 어떻게 적용되는지 알아보세요.</web-summary>
<p>수년간 iOS 앱을 개발해 오셨다면 다음과 같은 의문이 들 수 있습니다. "Kotlin Multiplatform을 사용하면 성능이 저하되지는 않을까?", "Swift의 강력함과 우아함을 포기해야 하는 걸까?", "개발자 경험이 마치 2류 개발 방식처럼 느껴지지는 않을까?"
    이는 KMP 도입을 고려할 때 대부분의 숙련된 iOS 엔지니어들이 던지는 질문입니다.</p>
<p>이 기사에서는 실제 사용 사례를 바탕으로 iOS 개발자들이 Kotlin Multiplatform에 대해 갖는 가장 일반적인 우려 사항들을 분석하여, Kotlin Multiplatform iOS 개발이 실제로 어떤 느낌인지 실무적인 통찰력을 제공합니다.</p>
<chapter title="iOS 개발자에게 Kotlin Multiplatform이 갖는 의미" id="what-kotlin-multiplatform-means-for-ios-developers">
    <p>Kotlin Multiplatform(KMP)은 단일 모듈부터 대부분의 비즈니스 로직, 그리고 적절한 경우 <a href="https://kotlinlang.org/compose-multiplatform/">Compose Multiplatform</a>을 통한 UI에 이르기까지, 필요한 만큼 코드를 공유할 수 있게 해주는 기술입니다.</p>
    <p>이는 네이티브 개발을 대체하려는 시도가 아닙니다. 대신, KMP는 무엇을 네이티브로 유지할지에 대한 완전한 제어권을 유지하면서 플랫폼 간에 코드를 공유할 수 있게 해줍니다.</p>
    <p>가장 높은 수준에서 KMP는 팀이 다음과 같은 작업을 수행할 수 있도록 지원합니다.</p>
    <list>
        <li>비즈니스 로직을 원활하게 공유합니다.</li>
        <li>Kotlin 코드를 Swift에서 호출할 수 있게 만듭니다.</li>
        <li>Kotlin 코드에서 iOS API의 모든 기능을 사용합니다.</li>
        <li>Compose Multiplatform을 사용하여 SwiftUI에 임베드할 수 있는 화면을 만들거나, 전체 사용자 인터페이스를 Kotlin으로 빌드합니다.</li>
        <li>Kotlin 코드에서 직접 MapKit이나 AVFoundation과 같은 플랫폼 전용 프레임워크를 사용합니다.</li>
    </list>
    <p><a as="button" href="https://kotlinlang.org/multiplatform/" mode="rock" icon="arrow-right" icon-position="right">Kotlin Multiplatform 알아보기</a></p>
    <chapter title="KMP는 단지 또 다른 크로스 플랫폼 추상화 레이어일 뿐인가요?" id="is-kmp-merely-another-cross-platform-abstraction-layer">
        <p>그렇지 않습니다. KMP는 SwiftUI나 UIKit을 대체하지 않습니다. 대신 네이티브 개발을 보완합니다.</p>
        <p>실제로 이는 다음을 의미합니다.</p>
        <list>
            <li>네이티브 Swift 코드를 활용하여 SwiftUI 또는 UIKit으로 UI를 생성할 수 있습니다.</li>
            <li>래퍼(wrapper)나 간접 참조 없이 iOS API에 직접 액세스할 수 있습니다.</li>
            <li>기본적으로 모든 곳이 아닌, 가치가 있는 곳에만 공유 코드를 통합할 수 있습니다.</li>
        </list>
    </chapter>
    <chapter id="is-kmp-useful-for-ios-developers" title="KMP가 iOS 개발자에게 정말로 유용한가요?">
        <p>KMP는 Kotlin 생태계의 일부이지만 안드로이드에만 국한되지 않습니다. 이는 iOS 팀이 자신들의 조건에 맞춰 플랫폼 간에 기능을 공유할 수 있는 범용적인 접근 방식입니다.</p>
        <p>특히 로직 중복, 플랫폼 간 일관되지 않은 동작, 급증하는 유지보수 비용 문제에 직면한 팀에 유용합니다. 공유 레이어를 사용하면 네이티브 제어권을 완벽하게 유지하면서 중복을 제거할 수 있습니다.</p>
        <p>핵심 원칙은 간단합니다.</p>
        <list>
            <li>비즈니스 로직, 데이터, 네트워킹 등 공유가 타당한 부분을 공유합니다.</li>
            <li>플랫폼 전용 기능과 같이 네이티브로 유지해야 할 부분은 네이티브로 유지하며, UI를 공유할지 네이티브로 할지는 프로젝트별로 선택합니다.</li>
            <li>필요에 따라 시간이 지남에 따라 그 균형을 조정합니다.</li>
        </list>
    </chapter>
    <p>Kotlin Multiplatform은 안드로이드 중심의 솔루션이 아닙니다. 이는 개발 팀이 네이티브 경험을 잃지 않으면서도 일관성을 높일 수 있도록 돕는 다재다능한 기술입니다.</p>
    <p>KMP는 흔히 성능, 복잡성, 네이티브 제어권 상실에 대한 오해에 둘러싸여 있지만, 이는 실제 작동 방식을 정확히 반영하지 못합니다. 경험에 기반한 답변을 통해 이러한 오해들을 풀어보겠습니다.</p>
</chapter>
<chapter title="오해: 크로스 플랫폼 프레임워크는 iOS의 성능과 경험을 저하시킨다" id="myth-cross-platform-frameworks-compromise-ios-performance-and-experience">
    <p>일반적인 우려는 Kotlin Multiplatform이 iOS 앱의 성능이나 경험을 해칠 것이라는 점입니다. 이러한 가정은 대개 React Native와 같이 브릿지나 독점 런타임을 사용하는 프레임워크를 사용했던 이전 경험에 근거합니다.</p>
    <p>KMP는 다르게 작동합니다. Swift와 동일한 툴체인 제품군인 LLVM을 사용하여 iOS용 공유 코드를 생성합니다. 자바스크립트 브릿지도, 통합된 런타임 레이어도 없으며, 코드와 iOS 사이에 추상화도 존재하지 않습니다. 즉, 앱은 일반적인 iOS 개발과 일관된 성능 특성을 가진 완전한 네이티브 바이너리로 계속 작동합니다.</p>
</chapter>
<chapter title="오해: Kotlin Multiplatform은 틈새 시장을 겨냥하거나 위험한 기술이다" id="myth-kotlin-multiplatform-is-a-niche-or-risky-technology">
    <p>여러분은 여전히 Kotlin Multiplatform을 초기 실험 단계로 생각할 수도 있습니다. 하지만 Kotlin Multiplatform은 2023년 11월에 공식적으로 Stable(안정) 단계에 도달했으며, 지원되는 모든 플랫폼에서 프로덕션 준비가 완료되었습니다. KMP는 이미 <a href="https://kotlinlang.org/case-studies/?type=multiplatform&amp;platforms=ios">Google</a>, <a href="https://2025.kotlinconf.com/talks/812400/">Duolingo</a>, <a href="https://medium.com/booking-com-development/kotlin-multiplatform-in-production-two-real-world-use-cases-from-booking-com-46ffe13a773d">Booking.com</a>, <a href="https://youtu.be/VVf6txPZk3Y?si=6PVoeS8Pa0-QHUsT">Sony</a>, <a href="https://www.youtube.com/watch?v=hZPL8QqiLi8">Philips</a>, <a href="https://www.youtube.com/watch?v=HSIhkB5bGJs">McDonald's</a>와 같은 유명 기업들의 실제 대규모 iOS 애플리케이션에서 <a href="https://kotlinlang.org/case-studies/?type=multiplatform&amp;platforms=ios">사용되고 있습니다</a>.</p>
    <p>생태계 또한 계속해서 성숙해 왔습니다. 2025년 iOS용 Compose Multiplatform이 Stable 단계에 도달하여, 공유 비즈니스 로직뿐만 아니라 프로덕션급의 공유 UI도 빌드할 수 있게 되었습니다. 2025년 Kotlin Multiplatform 설문 조사에 따르면, KMP는 이제 프로덕션 환경에서 실용적인 것으로 간주되며, 플러그인 사용자의 약 70%가 만족하거나 매우 만족하고 있고, 약 80%가 Compose Multiplatform을 사용하고 있습니다.</p>
    <p><a as="button" href="https://kotlinlang.org/case-studies/?type=multiplatform&amp;platforms=ios" mode="rock" icon="arrow-right" icon-position="right">실제 KMP 활용 사례 살펴보기</a></p>
    <p>KMP는 Kotlin의 개발사인 JetBrains의 지원을 받습니다. 이는 단순한 사이드 프로젝트가 아니라, 강력한 툴링, 정기적인 업데이트 및 성장하는 생태계 지원과 함께 계속 발전할 전략적 투자입니다.</p>
    <chapter title="그렇다면 KMP를 도입하는 것이 안전할까요?" id="is-it-safe-to-adopt-kmp">
        <p>KMP는 핀테크, 이커머스, 모빌리티뿐만 아니라 의료, 미디어 및 엔터테인먼트, 여행, 물류 등 다양한 산업 분야의 프로덕션 환경에서 검증되었습니다. 또한 활발하게 유지보수 및 업그레이드되고 있습니다. 무엇보다도 점진적인 도입이 가능하여 리스크를 줄여줍니다.</p>
        <p>가장 중요한 점은 다음과 같습니다.</p>
        <list>
            <li>특정 기술에 갇히지(locked-in) 않으며, 사용 규모를 자유롭게 늘리거나 줄일 수 있습니다.</li>
            <li>공유 코드 사용을 중단하더라도 iOS 앱은 완전히 네이티브 상태로 유지됩니다.</li>
        </list>
        <p>Kotlin Multiplatform은 팀이 전체 아키텍처를 위험에 빠뜨리지 않고 실제 크로스 플랫폼 과제를 해결하기 위해 현재 사용하고 있는 성숙한 프로덕션용 솔루션입니다.</p>
    </chapter>
</chapter>
<chapter title="오해: Kotlin Multiplatform은 안드로이드 개발자만을 위한 것이다" id="myth-kotlin-multiplatform-is-only-for-android-developers">
    <p>Kotlin Multiplatform은 종종 "안드로이드 우선"으로 인식되어, iOS 개발자는 그저 곁다리로 참여하는 것처럼 여겨지기도 합니다.</p>
    <p>Kotlin은 범용 언어이며, KMP의 공유 코드는 단일 플랫폼의 소유가 아닌 코드베이스의 또 다른 측면일 뿐입니다. iOS 개발자도 이를 읽고 기여하며, API를 설계하고 크로스 플랫폼 디자인에 영향을 미칠 수 있습니다.</p>
    <p>실제로 팀들은 다양한 모델을 채택합니다. 많은 iOS 개발자가 특히 UI 중심 기능에서 주로 Swift로 작업을 계속하는 반면, 공유 비즈니스 로직은 협업을 통해 개발하거나 크로스 플랫폼 코드에 집중하는 엔지니어가 개발합니다.</p>
    <p>이는 더 나은 협업으로 이어집니다. 팀이 로직의 소유권을 공유하고, 불일치를 줄이며, 노력을 중복하지 않고 문제를 한 번에 해결할 수 있습니다.</p>
    <chapter title="iOS 개발자로서 소외되지는 않을까요?" id="will-you-be-sidelined-as-an-ios-developer">
        <p>KMP는 iOS 엔지니어의 지위를 낮추지 않습니다. 오히려 네이티브 경험의 소유권을 유지하면서도 동일한 영향력을 행사할 수 있는 공유 레이어로 그들의 역할을 확장합니다. 원한다면 iOS UI를 네이티브로 유지할 수 있고, Swift는 여전히 필수적이며, iOS 개발자는 플랫폼 결정에 대한 통제권을 유지합니다.</p>
    </chapter>
</chapter>
<chapter title="오해: 내 iOS 워크플로가 더 복잡해질 것이다" id="myth-my-ios-workflow-will-become-more-complicated">
    <p>KMP에 대한 주요 우려 중 하나는 기존의 iOS 워크플로를 방해할 수 있다는 점입니다. 이미 Objective-C → Swift → SwiftUI와 같은 변화와 지속적인 툴체인의 변화를 겪었다면, "하나 더" 추가한다는 생각이 피곤하게 느껴질 수 있습니다. 이러한 우려는 타당하며, 이것이 바로 Kotlin Multiplatform이 한꺼번에 도입하는 대신 점진적으로 도입할 수 있도록 설계된 이유입니다.</p>
    <p>하룻밤 사이에 완전히 새로운 툴체인을 수용할 필요는 없습니다. 많은 iOS 개발자에게 KMP는 단순히 공유 모듈을 사용하는 것부터 시작할 수 있습니다. 즉, 유용성을 평가하는 동안 일상적인 워크플로는 상대적으로 영향을 받지 않을 수 있습니다.</p>
    <p>더 깊이 들어감에 따라 학습 곡선은 완만하며, 전부 아니면 전무(all-or-nothing) 식이 아닙니다.</p>
    <list>
        <li>공유된 Kotlin API를 사용하는 것부터 시작하세요.</li>
        <li>공유 코드를 읽고 문제를 해결할 수 있을 정도로 Kotlin을 이해합니다.</li>
        <li>타당할 때마다 공유 로직에 기여합니다.</li>
    </list>
    <chapter title="KMP를 도입하면 속도가 느려질까요?" id="will-adopting-kmp-slow-you-down">
        <p>설정을 이해하는 데 약간의 초기 오버헤드는 있습니다. 하지만 공유 로직을 사용하고 병렬 구현을 피함으로써 시간을 절약할 수 있으며, 툴링은 생각보다 가볍습니다.</p>
        <list>
            <li>주요 환경으로 Xcode를 대체할 필요가 없습니다.</li>
            <li>외부 UI 프레임워크로 반드시 이동할 필요도 없습니다.</li>
            <li>빌드 시퀀스의 복잡성은 일반적으로 메인 iOS 워크플로 외부에서 관리됩니다.</li>
        </list>
        <p>여러분은 항상 해왔던 것과 같은 방식으로 iOS 앱을 계속 개발할 수 있습니다. KMP는 단지 공유 레이어를 추가하여 전체 리셋을 요구하지 않고 추가적인 자유를 제공할 뿐입니다.</p>
    </chapter>
</chapter>
<chapter title="오해: Kotlin Multiplatform은 관용적이지 않은 Swift API를 생성한다" id="myth-kotlin-multiplatform-produces-non-idiomatic-swift-apis">
    <p>Kotlin Multiplatform에서의 Swift 상호 운용성은 여전히 유효한 우려 사항입니다. 현재 Kotlin 코드는 Objective-C 브릿지를 통해 iOS에 제공되므로, 특히 명명 규칙, Null 허용 여부(nullability), 제네릭 또는 비동기 패턴에서 Swift API가 덜 자연스럽게 느껴질 수 있습니다.</p>
    <p>네, 제대로 관리하지 않으면 Swift답지 않게 느껴질 수 있습니다. 하지만 iOS를 염두에 두고 공유 코드를 개발하면 좋은 Swift API를 만들 수 있습니다. 몇 가지 권장 사례는 다음과 같습니다.</p>
    <list>
        <li>API를 단순하고 의도적으로 유지하세요.</li>
        <li>제대로 번역되지 않는 Kotlin 패턴은 피하세요.</li>
        <li>필요에 따라 얇은 Swift 래퍼를 추가하세요.</li>
        <li>Xcode에서 직접 API를 검증하세요.</li>
    </list>
    <p>"<a href="https://youtu.be/P_5ZEtK05kc?si=qgnAPV5_MwAEn0RJ">Kotlin Multiplatform Alchemy: Making Gold out of Your Swift Interop</a>" 강연 녹화본을 시청해 보시는 것도 좋습니다.</p>
    <p>Kotlin의 새로운 툴링, 특히 <a href="https://kotlinlang.org/docs/native-swift-export.html">Swift Export</a>는 Kotlin API가 Swift와 더 직접적이고 관용적으로(idiomatically) 통합되어 마찰을 더욱 줄여주는 미래를 향해 나아가고 있습니다.</p>
    <p>Swift Export는 Objective-C 레이어를 제거하는 것을 목표로 하며, <a href="https://github.com/kotlin-hands-on/kotlin-swift-interopedia">Interopedia</a>는 Kotlin 코드가 Swift에 어떻게 노출되는지, 어떤 패턴을 기대할 수 있는지 개발자가 이해하도록 돕는 실무 문서 역할을 합니다. <a href="https://github.com/rickclephas/KMP-NativeCoroutines">KMP-NativeCoroutines</a> 및 <a href="https://github.com/touchlab/SKIE">SKIE</a>와 같은 라이브러리는 현재 상호 운용 모델의 거친 부분을 매끄럽게 다듬어 코루틴이 Swift의 async/await에 매핑되는 방식을 개선하고 생성된 API를 더 Swift 친화적으로 만들어 줍니다.</p>
</chapter>
<chapter title="오해: UI를 공유하면 네이티브 iOS 경험을 잃게 된다" id="myth-sharing-ui-means-losing-native-ios-experience">
    <p>널리 퍼진 오해 중 하나는 Kotlin Multiplatform을 사용하려면 완전한 네이티브 iOS UI를 포기해야 한다는 것입니다. 그렇지 않습니다.</p>
    <p>KMP는 공유 UI를 전혀 요구하지 않습니다. 기본 기능만 공유하고 나머지는 네이티브로 유지할 수 있습니다.</p>
    <list>
        <li>UI는 네이티브 Swift 코드를 활용하여 SwiftUI 또는 UIKit으로 작성할 수 있습니다.</li>
        <li>애니메이션과 상호 작용은 완전히 네이티브 상태를 유지할 수 있습니다.</li>
        <li>플랫폼 API는 래퍼 없이 직접 액세스됩니다.</li>
    </list>
</chapter>
    <chapter title="그렇다면 더 이상 iOS 앱처럼 느껴지지 않게 될까요?" id="so-will-your-app-no-longer-feel-like-an-ios-app">
    <p>아니요, 네이티브 UI를 포기할 필요가 없기 때문입니다.</p>
    </chapter>
    <chapter title="공유 UI를 꼭 사용해야 하나요?" id="do-you-have-to-use-a-shared-ui">
    <p>이 전략은 전적으로 선택 사항이며 각 팀에서 정의합니다. 핵심 전제는 간단합니다. Kotlin Multiplatform은 인터페이스 설계 방식을 제한하지 않습니다. SwiftUI나 UIKit으로 완전히 네이티브한 UI를 유지할 수도 있고, Compose Multiplatform으로 공유 UI를 도입할 수도 있으며, 필요에 따라 두 가지 방식을 결합할 수도 있습니다.</p>
    <p>대시보드나 핵심 제품 흐름과 같이 가장 자주 사용되는 화면은 최대한의 성능과 플랫폼 고유의 완성도를 끌어낼 수 있는 완전한 네이티브 UI로 구현하는 것이 더 나은 경우가 많습니다. 영향도가 낮은 영역에는 Compose Multiplatform이 아주 적합합니다. 설정 페이지나 인증과 같이 가끔 발생하는 흐름과 같은 화면은 깊은 네이티브 최적화보다 개발 속도와 코드 재사용이 더 중요한 공유 Compose UI의 이상적인 후보입니다.</p>
    <p>중요한 점은 Compose Multiplatform과 기존 iOS UI 간에 상호 운용성이 있어, 네이티브 뷰와 함께 공유 컴포넌트를 임베드하거나 시간이 지남에 따라 점진적으로 도입할 수 있다는 것입니다. 이를 통해 팀은 미리 하나의 방식에만 얽매이지 않고 UI 전략을 발전시킬 수 있습니다.</p>
    </chapter>
<p><a as="button" href="https://kotlinlang.org/compose-multiplatform/" mode="rock" icon="arrow-right" icon-position="right">Compose Multiplatform 살펴보기</a>
    </p>
<chapter title="오해: Kotlin Multiplatform을 도입하면 더 이상 Swift를 사용하지 않게 된다" id="myth-adopting-kotlin-multiplatform-means-no-more-swift">
    <p>일반적인 두려움 중 하나는 Kotlin Multiplatform을 도입하면 Swift가 쓸모없게 될 것이라는 점입니다. 하지만 KMP는 Swift를 대체하기 위해 존재하는 것이 아닙니다. Swift는 여전히 iOS 개발의 필수 요소입니다.</p>
    <p>iOS 앱을 iOS답게 만드는 모든 작업에는 계속해서 Swift를 사용합니다.</p>
    <list>
        <li>SwiftUI 또는 UIKit을 사용한 UI.</li>
        <li>내비게이션, 애니메이션 및 사용자 상호 작용.</li>
        <li>플랫폼 전용 기능 및 통합.</li>
        <li>앱 수명 주기 및 시스템 API.</li>
    </list>
    <p>KMP는 그 옆에 공유 레이어를 추가할 뿐입니다. 이는 iOS 개발자가 네이티브 경험을 계속 소유하고, 공유 비즈니스 로직은 종종 플랫폼 간의 공동 노력이 되며, 일부 iOS 엔지니어는 Kotlin 코드에 기여하고 다른 이들은 주로 Swift에 집중한다는 것을 의미합니다.</p>
    <chapter title="그렇다면 Swift 작성을 중단하게 될까요?" id="will-you-stop-writing-swift">
    <p>아니요, 여전히 대부분의 시간을 Swift에 할애하게 될 것입니다. 그리고 크로스 플랫폼 로직에 대한 새로운 통찰력을 얻고 공유 아키텍처 결정에 영향을 미치면서 여러분의 역할은 더욱 확장될 것입니다.</p>
</chapter>
</chapter>
<chapter title="기존 프로젝트에서의 Kotlin Multiplatform iOS 통합" id="kotlin-multiplatform-ios-integration-in-an-existing-project">
    <p>기존 앱에 Kotlin Multiplatform iOS 통합을 접근하는 가장 좋은 방법은 작게 시작하는 것입니다. 앱을 재발명하거나, 모든 것을 재구성하거나, 첫날부터 완전한 크로스 플랫폼 방식을 고수할 필요가 없습니다.</p>
    <p>실제로 공유 모듈은 대개 다음과 같이 iOS에 제공됩니다.</p>
    <list>
        <li>공통 코드에서 생성된 프레임워크.</li>
        <li>빌드 타겟 간 배포를 위한 XCFramework.</li>
        <li>팀의 워크플로에 따라 Swift Package Manager를 사용하거나 맞춤형 설정으로 통합된 의존성.</li>
    </list>
    <p>핵심은 통합이 본질적으로 침습적이지 않다는 것입니다. 앱의 아키텍처, UI 레이어 또는 기존 Swift 코드를 대체하는 것이 아닙니다. iOS 코드가 필요한 곳이면 어디서든 사용할 수 있는 공유 모듈을 만드는 것입니다.</p>
    <p>그렇기 때문에 실무적인 시작점은 대개 다음과 같이 위험 부담이 적은 작은 영역입니다.</p>
    <list>
        <li>데이터 모델</li>
        <li>유효성 검사 로직</li>
        <li>네트워킹</li>
        <li>단일 기능 모듈</li>
    </list>
    <p>이를 통해 팀은 원래의 iOS 경험을 보존하면서 KMP가 코드베이스에 어떻게 들어맞는지 확인할 수 있습니다. 대부분의 팀은 점진적인 도입을 선택합니다. 특정 문제를 해결하기 위해 공통 코드를 도입한 다음, 이점이 확실할 때만 확장합니다. 이렇게 하면 소유권을 쉽게 유지할 수 있습니다.</p>
    <chapter title="어떻게 KMP를 안전하게 시작할 수 있나요?" id="how-do-you-start-safely-with-kmp">
        <p>하나의 고립된 문제를 선택하고 범위를 제한하며, KMP를 프로젝트의 리셋이 아닌 추가 사항으로 간주하세요.</p>
    </chapter>
</chapter>
<p>
    <a as="button" href="get-started.topic" mode="rock" icon="arrow-right" icon-position="right">Kotlin Multiplatform 시작하기</a>
    </p>
<chapter title="Kotlin Multiplatform이 적합한 경우 (그리고 그렇지 않은 경우)" id="when-kotlin-multiplatform-makes-sense-and-when-it-doesnt">
    <p>Kotlin Multiplatform은 iOS와 안드로이드 로직 사이에 겹치는 부분이 있고, 이러한 중복이 문제를 일으키기 시작할 때 적합합니다. 특히 비즈니스 규칙, 네트워킹, 데이터 처리 또는 도메인 로직을 플랫폼 간에 공유하면서 네이티브 iOS 경험을 유지하려는 팀에 가치가 있습니다.</p>
    <p>KMP는 대개 다음과 같은 경우에 <b>좋은 선택</b>입니다.</p>
    <list>
        <li>iOS와 안드로이드 앱이 동일한 기본 제품 로직을 사용하는 경우.</li>
        <li>팀이 동일한 버그를 두 번 해결하고 있는 경우.</li>
        <li>플랫폼 간 동작의 동기화가 계속 어긋나는 경우.</li>
    </list>
    <p>다음과 같은 경우에는 <b>적합하지 않을 수</b> 있습니다.</p>
    <list>
        <li>애플리케이션이 매우 플랫폼 중심적인 경우.</li>
        <li>대부분의 복잡성이 UI 레이어에 있는 경우.</li>
        <li>추가적인 설정과 조율을 정당화할 만큼 로직이 충분하지 않은 경우.</li>
    </list>
</chapter>
<chapter title="결론" id="conclusion">
    <p>KMP를 사용하면 중복을 줄이는 동시에 관리할 공유 레이어를 추가하게 됩니다. 팀 간의 협업을 도입하면서 일관성을 달성하고 네이티브 UI를 유지하지만, 어느 정도의 상호 운용성 및 툴링 복잡성을 수용해야 합니다.</p>
    <p>Kotlin Multiplatform은 공유 코드가 플랫폼에서 더 잘 처리되는 영역을 침범하지 않으면서, 작고 집중된 로직이든 더 큰 도메인 레이어든 명확한 가치를 제공할 때 가장 효과적입니다.</p>
</chapter>
<chapter title="자주 묻는 질문" id="frequently-asked-questions">
    <deflist >
        <def title="안드로이드와 iOS 간에 실제로 얼마나 많은 코드를 공유할 수 있나요?">
            정해진 비율은 없습니다. 대부분의 팀은 비즈니스 로직, 네트워킹 및 데이터 레이어를 공유합니다. 정확한 양은 앱과 플랫폼 간의 중복 수준에 따라 다릅니다. 어떤 경우에는 팀이 Compose Multiplatform을 사용하여 UI의 일부를 공유하기로 선택하기도 하며, 이 과정에서도 iOS에서 네이티브한 룩앤필을 구현하거나 SwiftUI 또는 UIKit과 원활하게 결합할 수 있습니다.
        </def>
        <def title="Kotlin Multiplatform이 iOS 앱 성능에 영향을 미치나요?">
            본질적인 영향은 없습니다. 공유 코드는 네이티브로 컴파일되므로 성능은 일반적인 iOS 코드와 비슷합니다. 문제는 KMP 자체에서 발생하는 것이 아니라 코드가 작성된 방식에서만 발생합니다.
        </def>
    </deflist>
    <p><b>안드로이드와 iOS 간에 실제로 얼마나 많은 코드를 공유할 수 있나요?</b></p>
    <p>정해진 비율은 없습니다. 대부분의 팀은 비즈니스 로직, 네트워킹 및 데이터 레이어를 공유합니다. 정확한 양은 앱과 플랫폼 간의 중복 수준에 따라 다릅니다. Compose Multiplatform이 포함된 Kotlin Multiplatform을 사용하면 UI를 포함하여 앱 코드의 최대 100%를 공유하면서도 네이티브 API와 통합할 수 있습니다.</p>
    <p><b>Kotlin Multiplatform이 iOS 앱 성능에 영향을 미치나요?</b></p>
    <p>본질적인 영향은 없습니다. 공유 코드는 네이티브로 컴파일되므로 성능은 일반적인 iOS 코드와 비슷합니다.</p>
    <p><b>Kotlin Multiplatform은 Swift와 어떻게 작동하나요?</b></p>
    <p>공유된 Kotlin 코드는 Swift에서 사용할 수 있는 네이티브 프레임워크로 변환됩니다. 현재 모델에서는 상호 운용성이 Objective-C 브릿지에 의존하므로 약간의 마찰이 있을 수 있습니다. 앞으로 이 방식은 진화할 것입니다. JetBrains의 Swift Export는 Objective-C 레이어를 완전히 제거하여 Swift와의 더 직접적이고 관용적인 통합을 가능하게 하는 것을 목표로 합니다.</p>
    <p><b>iOS 개발자가 KMP를 사용하려면 Kotlin을 배워야 하나요?</b></p>
    <p>반드시 그런 것은 아닙니다. 공유된 Kotlin 코드를 사용하는 것부터 시작하여 디버깅이나 기여에 필요할 때 점진적으로 Kotlin을 배울 수 있습니다.</p>
    <p><b>Kotlin Multiplatform에서 UI를 반드시 공유해야 하나요?</b></p>
    <p>아니요, UI 공유는 선택 사항입니다. 많은 팀이 iOS UI를 완전히 네이티브로 유지하고 기본 기능만 공유합니다. 하지만 결과물이 iOS에서 네이티브처럼 느껴지기 때문에 점점 더 많은 회사가 UI 코드 공유를 선택하고 있습니다.</p>
</chapter>
</topic>