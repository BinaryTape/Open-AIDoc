```xml
<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd" id="build-ios-android-app" title="Android 및 iOS 앱 구축 방법 (그리고 Kotlin Multiplatform을 사용해야 하는 경우)">
  <web-summary>Android 및 iOS 앱 구축 방법을 탐색하고, 아키텍처와 프레임워크를 비교하며, Kotlin Multiplatform이 적합한 위치를 확인해 보세요.</web-summary>
  <p>iOS와 Android를 동시에 개발할 때 가장 먼저 내려야 할 주요 결정은 아키텍처에 관한 것입니다. 완전한 네이티브로 갈 것인가, 아니면 크로스 플랫폼 접근 방식을 사용하여 코드를 공유할 것인가? 이 선택은 시장 출시 시간(time-to-market), 비용, 그리고 팀이 시간이 지남에 따라 직면하게 될 복잡성 수준에 영향을 미칩니다. 네이티브 개발은 플랫폼 제어력과 완성도를 극대화하지만, 두 개의 코드베이스를 유지 관리해야 합니다. <a href="cross-platform-mobile-development.topic">크로스 플랫폼</a>은 공유 로직을 통해 더 빠른 전달과 비용 절감을 약속하지만, 성능, 유연성 및 장기적인 유지 관리 가능성에 대한 타당한 우려를 불러일으키기도 합니다.</p>
  <p>이는 단순히 이론적인 논쟁이 아닙니다. <a href="https://devecosystem-2025.jetbrains.com/">2025년 개발자 생태계 현황(State of Developer Ecosystem 2025)</a>에 따르면, 크로스 플랫폼 및 코드 공유 기술의 사용이 2024년에서 2025년 사이에 두 배 이상 증가했습니다. 이는 더 많은 팀이 네이티브 품질의 경험을 유지하면서 코드를 재사용할 수 있는 방법을 찾고 있음을 시사합니다.</p>
  <!--![지난 두 차례의 개발자 생태계 설문 조사 응답자 중 KMP 사용률이 2024년 7%에서 2025년 18%로 증가했습니다](kmp-growth-deveco.svg){width=700}-->
  <img src="kmp-growth-deveco.svg" alt="지난 두 차례의 개발자 생태계 설문 조사 응답자 중 KMP 사용률이 2024년 7%에서 2025년 18%로 증가했습니다" width="700"/>
  <p>이 문서에서는 네이티브 및 크로스 플랫폼 접근 방식을 실무적인 관점에서 살펴보겠습니다. 모든 상황에 맞는 정답을 제시하기보다는, 팀이 계획, 아키텍처 및 전달 과정에서 직면하게 되는 트레이드오프(trade-offs)를 짚어볼 것입니다. 이를 통해 여러분의 제품, 팀, 제약 사항에 가장 적합한 옵션을 선택할 수 있는 더 명확한 비교 근거를 얻게 될 것입니다.</p>
  <chapter title="Android 및 iOS 앱 구축 방법: 세 가지 주요 아키텍처 옵션"
           id="main-architecture-options">
    <p>iOS와 Android 모두에 앱을 출시하기로 결정했다면, 다음 전략적 고려 사항은 플랫폼 전반에 걸쳐 개발 구조를 어떻게 잡을 것인가 하는 점입니다. 이 결정은 앱을 구축하고, 배포하고, 발전시키는 방식에 영향을 미칩니다.</p>
    <chapter title="완전 네이티브 개발(Fully native development)" id="fully-native-development">
      <p>완전 네이티브 개발은 iOS와 Android를 서로 다른 제품으로 취급합니다. Apple의 도구와 프레임워크를 사용하여 하나의 앱을 만들고, Google의 도구를 사용하여 또 다른 앱을 만들며, 각 플랫폼의 네이티브 언어, UI 시스템 및 SDK를 사용합니다. 두 코드베이스는 아이디어와 디자인을 공유할 수 있지만 기술적으로는 별개로 유지되며, 각 플랫폼은 고유한 생태계와 릴리스 주기 내에서 발전합니다.</p>
    </chapter>
    <chapter title="크로스 플랫폼 프레임워크 (Flutter, React Native 등)" id="cross-platform-frameworks">
      <p><a href="cross-platform-frameworks.topic">크로스 플랫폼 프레임워크</a>인 Flutter 및 React Native는 단일 코드베이스를 중심으로 개발을 통합하는 것을 목표로 합니다. 이 접근 방식을 사용하면 팀은 비즈니스 로직과 UI 코드를 모두 공유할 수 있으며, 크로스 플랫폼 레이어가 운영 체제 전반에 걸쳐 앱을 렌더링합니다. 그 약속은 명확합니다. 하나의 코드베이스, 두 개의 플랫폼, 그리고 아이디어에서 출시까지의 더 효율적인 경로입니다.</p>
    </chapter>
    <chapter title="유연한 코드 공유 (Kotlin Multiplatform)" id="flexible-code-sharing">
      <p><a href="https://kotlinlang.org/multiplatform/">Kotlin Multiplatform (KMP)</a>은 더 넓은 범위의 코드 공유 옵션을 제공합니다. '전부 아니면 전무(all-or-nothing)'식의 결정을 요구하는 대신, 팀이 제품에 관련된 부분만 공유하면서도 완전한 네이티브 경험을 구축할 수 있는 유연성을 유지할 수 있게 해줍니다.</p>
      <!--![KMP의 점진적 도입 예시: 로직의 일부를 공유하고 UI는 공유하지 않음, UI 없이 모든 로직 공유, 로직과 UI 모두 공유](kmp-graphic.png){width="700"}-->
      <img src="kmp-graphic.png" alt="KMP의 점진적 도입 예시: 로직의 일부를 공유하고 UI는 공유하지 않음, UI 없이 모든 로직 공유, 로직과 UI 모두 공유" width="700"/>
      <a href="https://kotlinlang.org/multiplatform/"><img src="discover-kmp.svg" alt="Kotlin Multiplatform 살펴보기" width="600" style="block"/></a>
      <!--[![Discover Kotlin Multiplatform](discover-kmp.svg){width="600" style="block"}](https://www.jetbrains.com/kotlin-multiplatform/)-->
      <p>다음 섹션에서는 실제 프로젝트에서 이러한 세 가지 접근 방식이 어떻게 작동하는지, 그리고 일상적인 개발에 어떤 의미가 있는지 살펴보겠습니다.</p>
    </chapter>
  </chapter>
  <chapter title="Android 및 iOS를 위한 완전 네이티브 개발" id="fully-native-development-for-android-and-ios">
    <p>완전 네이티브 개발은 두 개의 별개 애플리케이션을 만드는 것을 포함합니다. 하나는 Apple의 도구를 사용한 iOS용이고, 다른 하나는 Google의 도구를 사용한 Android용입니다. 각 플랫폼은 고유한 코드베이스, 개발 파이프라인 및 릴리스 프로세스를 갖습니다. 실제로 여러분은 동일한 문제를 해결하지만 서로 다른 생태계 내에서 존재하는 두 개의 제품을 구축하게 됩니다.</p>
    <p>이 접근 방식의 주요 이점은 <b>플랫폼 충실도(platform fidelity)</b>입니다. 네이티브 앱은 플랫폼의 UI 프레임워크, 상호작용 패턴 및 접근성 기술을 직접 사용하므로 각 기기에서 자연스럽게 느껴지는 경험을 개발하기가 더 쉽습니다. 중간에 추상화 레이어가 없기 때문에 애니메이션, 제스처 및 탐색 기능이 성능 저하 없이 예상대로 작동합니다.</p>
    <p>또 다른 큰 장점은 <b>플랫폼 API에 대한 빠른 액세스</b>입니다. Apple이나 Google이 새로운 시스템 기능, SDK 또는 하드웨어 기능을 도입할 때 네이티브 앱은 이를 즉시 통합할 수 있습니다. 크로스 플랫폼 레이어가 해당 API를 따라잡고 노출할 때까지 기다릴 필요가 없으며, 이는 최첨단 OS 기능이나 깊은 시스템 통합이 필요한 제품에 중요합니다.</p>
    <chapter title="고려 사항" id="native-considerations">
      <p>트레이드오프 중 하나는 <b>유지 관리 비용의 증가</b>입니다. 두 개의 코드베이스는 필연적으로 기능 개발, 버그 수정, 테스트 및 장기적인 발전 과정에서 중복된 노력을 초래합니다. 또한 두 개의 코드베이스를 유지하려면 각 플랫폼의 전문가를 고용해야 하므로 비용이 증가하고, 모든 곳에서 동시에 구현되어야 하는 개선 사항의 속도가 느려집니다.</p>
      <p>네이티브 개발은 플랫폼별 UX가 주요 차별화 요소이거나, OS 기능에 대한 조기 또는 깊은 액세스를 원하거나, 이미 성숙하고 독립적인 iOS 및 Android 팀을 보유하고 있는 경우 강력한 선택입니다. 또한 공유 로직은 제한적이지만 UI, 성능 또는 하드웨어 통합 요구 사항이 높은 제품에도 좋은 솔루션입니다.</p>
    </chapter>
  </chapter>
  <chapter title="크로스 플랫폼 모바일 개발을 위한 프레임워크" id="frameworks-for-cross-platform-mobile-development">
    <p>크로스 플랫폼 프레임워크는 크로스 플랫폼 개발에 대해 간단한 접근 방식을 취합니다. 두 개의 서로 다른 인터페이스를 만드는 대신, 단일 렌더링 레이어를 사용하여 iOS와 Android 모두에서 앱을 구동합니다. 팀은 단일 UI 컴포넌트 세트와 일반적으로 일관된 애플리케이션 레이어를 생성하며, 프레임워크는 이를 각 플랫폼이 표시하고 상호작용할 수 있는 형태로 변환합니다. 실제로 사용자 인터페이스는 비즈니스 로직만큼이나 재사용 가능합니다.</p>
    <p>가장 분명한 장점은 <b>UI 코드 재사용의 증가</b>입니다. 코드의 큰 부분, 때로는 대부분을 단일 코드베이스에 포함할 수 있습니다. 이를 통해 기능을 일치시키고 두 플랫폼에 업데이트를 동시에 배포하는 것이 훨씬 쉬워집니다. 결과적으로 팀은 새로운 기능, 수정 사항 및 UI 업그레이드가 일반적으로 한 번만 구현되기 때문에 iOS와 Android 간의 패리티(parity, 동등성)를 더 빨리 달성하는 경우가 많습니다.</p>
    <p>이 패러다임은 <b>미세한 플랫폼별 세부 사항보다 일관성과 전달 속도가 더 중요할 때</b> 특히 매력적입니다. 통합된 UI 레이어는 플랫폼 팀 간의 협업 오버헤드를 제거하는 동시에 계획, 테스트 및 릴리스 관리를 단순화합니다. 제품 관점에서는 한 플랫폼이 기능이나 시각적 디자인 면에서 다른 플랫폼보다 뒤처질 위험을 줄여줍니다.</p>
    <chapter title="고려 사항" id="cross-platform-considerations">
      <p>하지만 크로스 플랫폼 프레임워크에는 <b>추상화에 따른 트레이드오프</b>가 따릅니다. 렌더링 레이어가 코드와 운영 체제 사이에 존재하므로 플랫폼 UI 프레임워크와 직접 작업하지 않습니다. 이 추상화가 많은 차이점을 완화해 주지만, 특정 네이티브 동작, 상호작용 또는 예외 상황(edge cases)을 정의하거나 조정하는 것을 더 어렵게 만들 수 있습니다. 추상화가 제공하는 범위를 넘어서야 할 때는 플랫폼별 코드로 내려가야 하는 경우가 자주 발생합니다.</p>
      <p>또한 <b>생태계 및 플러그인 의존성</b>이 있습니다. 프레임워크와 그에 수반되는 도구들이 새로운 OS 기능, 기기 기능 및 서드파티 SDK를 지원해야 합니다. 필요한 기능을 아직 사용할 수 없는 경우 팀은 기다리거나, 맞춤형 커넥터를 구축하거나, 로드맵을 조정해야 할 수도 있습니다.</p>
      <p>요약하자면, 크로스 플랫폼 프레임워크는 구조적 한계뿐만 아니라 명확한 이점을 바탕으로 크로스 플랫폼 재사용 및 동기화에 최적화되어 있습니다.</p>
    </chapter>
  </chapter>
  <chapter title="Kotlin Multiplatform: 유연한 코드 공유" id="kotlin-multiplatform-flexible-code-sharing">
    <p>Kotlin Multiplatform은 단일 아키텍처 선택이라기보다 일련의 옵션처럼 작동합니다. 공유 코드베이스에 대해 '전부 아니면 전무'식의 약속을 요구하지 않습니다. 팀은 코드의 어느 부분을 공유할지, 그리고 언제 공유할지 결정할 수 있습니다.</p>
    <p>이 범위의 한쪽 끝에는 Kotlin Multiplatform 생태계 내의 선언형 UI 프레임워크인 <a href="https://kotlinlang.org/compose-multiplatform/">Compose Multiplatform</a>이 있어 팀이 여러 플랫폼에서 사용자 인터페이스를 공유할 수 있게 해줍니다. 이는 프로젝트가 통합된 디자인 시스템, 일관된 상호작용 패턴 및 iOS와 Android 전반의 단일 프레젠테이션 레이어로부터 이득을 얻으면서도 네이티브 타겟으로 컴파일되기를 원할 때 유용할 수 있습니다. 이 설정에서 화면, 탐색 및 UI 상태는 공유 코드에 상주하며, 각 플랫폼은 애플리케이션 진입점과 OS 전용 통합을 유지합니다.</p>
    <a href="https://kotlinlang.org/compose-multiplatform/"><img src="explore-compose.svg" alt="Compose Multiplatform 살펴보기" width="500"/></a>
    <p>공유 범위를 가격 엔진, 유효성 검사 모듈 또는 동기화 정책과 같이 두 플랫폼에서 동일한 동작이 필요한 작고 명확하게 정의된 시스템 부분으로 제한할 수도 있습니다. 이를 통해 점진적 도입이 가능합니다. 팀은 단일 공유 모듈로 시작하여 그 영향을 측정하고 시간이 지남에 따라 확장할 수 있습니다. 공유 코드와 플랫폼별 코드 사이의 경계는 요구 사항이 변함에 따라 유연하게 바뀔 수 있습니다.</p>
    <p>이는 Kotlin 경험이 있는 팀에게 논리적인 선택입니다. Android는 Kotlin으로 유지되고, iOS는 Swift나 SwiftUI를 사용하여 네이티브로 유지됩니다. 목표는 코드 재사용을 극대화하는 것이 아니라, 제품 결정을 제약하지 않으면서 비용이나 위험을 낮추기 위해 필요한 만큼 코드를 공유하는 것입니다.</p>
    <p>실제 프로젝트에서 Kotlin Multiplatform은 네이티브와 크로스 플랫폼 중 하나를 선택하는 문제가 아닙니다. 아키텍처를 유연하게 유지하고 명확하고 실질적인 가치를 제공하는 곳에서만 코드를 공유하는 것에 관한 것입니다.</p>
    <a href="https://kotlinlang.org/case-studies/?type=multiplatform"><img src="kmp-success-stories.svg" alt="Kotlin Multiplatform 성공 사례에서 배우기" width="500"/></a>
    <chapter title="고려 사항" id="flexible-considerations">
      <list>
        <li><b>명확한 아키텍처 경계 필요:</b> 공유 코드와 플랫폼 코드에 무엇이 포함될지 결정해야 하며, 이는 아키텍처 설계 단계의 노력을 추가합니다.</li>
        <li><b>크로스 플랫폼 조정:</b> 공유 모듈을 사용한다는 것은 Android 및 iOS 팀이 릴리스와 공유 로직의 변경 사항에 대해 서로 보조를 맞춰야 함을 의미합니다.</li>
        <li><b>생태계 및 사용 사례에 따라 성숙도가 다름:</b> 일부 라이브러리나 통합은 여전히 플랫폼별 구현이 필요할 수 있습니다.</li>
      </list>
    </chapter>
  </chapter>
  <chapter title="네이티브, 크로스 플랫폼 프레임워크 및 Kotlin Multiplatform 비교" id="comparing-native-cross-platform-frameworks-and-kotlin-multiplatform">
    <p>다음 표는 네이티브 개발, 크로스 플랫폼 프레임워크 및 Kotlin Multiplatform 간의 주요 차이점을 요약합니다.</p>
    <table style="both">
      <tr>
        <td></td>
        <td>완전 네이티브 개발</td>
        <td>크로스 플랫폼 프레임워크 (Flutter, React Native)</td>
        <td>유연한 코드 공유 (Kotlin Multiplatform)</td>
      </tr>
      <tr>
        <td>코드 공유</td>
        <td width="250">없음</td>
        <td width="250">코드 대부분 또는 전부 공유</td>
        <td width="250">선택적: 작은 모듈부터 앱의 대부분까지</td>
      </tr>
      <tr>
        <td>UI 전략</td>
        <td>각 플랫폼별 완전 네이티브 (SwiftUI/UIKit, Compose/Views)</td>
        <td>네이티브로 렌더링되거나 브리지되는 단일 공유 UI 레이어</td>
        <td>완전 네이티브 UI 또는 Compose Multiplatform을 통한 공유 UI 중 선택</td>
      </tr>
      <tr>
        <td>API 액세스</td>
        <td>모든 플랫폼 API에 즉각적이고 완전한 액세스</td>
        <td>플러그인/브리지를 통한 간접 액세스</td>
        <td>플랫폼 레이어를 통한 완전한 액세스; 공유 코드는 플랫폼에 독립적 유지</td>
      </tr>
      <tr>
        <td>적합한 경우</td>
        <td>플랫폼별 UX, 성능 또는 깊은 OS 기능이 중요한 앱</td>
        <td>단일 코드베이스와 플랫폼 간 빠른 기능 패리티를 우선시하는 팀</td>
        <td>네이티브 UX를 원하면서도 비즈니스 로직의 중복을 줄이고 싶은 팀</td>
      </tr>
      <tr>
        <td>주요 트레이드오프</td>
        <td>비즈니스 로직 중복, 높은 개발 및 유지 관리 비용</td>
        <td>네이티브 UX에 대한 제어력 부족 및 프레임워크/플러그인 생태계 의존</td>
        <td>명확한 아키텍처 경계와 플랫폼 간의 조정이 필요함</td>
      </tr>
    </table>
    <p>Kotlin Multiplatform을 사용하면 팀은 무엇을 언제 공유할지 선택합니다. 비즈니스 로직이나 UI의 일부와 같이 작게 시작한 다음, 시간이 지남에 따라 점진적으로 더 많이 통합할 수 있습니다. 이를 통해 공유는 단 한 번의 도박이 아니라 점진적이고 되돌릴 수 있는 과정이 되며, 아키텍처를 고정된 약속이 아닌 유연하고 진화하는 결정으로 바꿔줍니다.</p>
    <p>이 비교 문서들을 통해 Kotlin Multiplatform에 대해 더 자세히 알아볼 수 있습니다: <a href="https://kotlinlang.org/docs/multiplatform/kotlin-multiplatform-flutter.html">Kotlin Multiplatform과 Flutter</a>, 그리고 <a href="https://kotlinlang.org/docs/multiplatform/kotlin-multiplatform-react-native.html">Kotlin Multiplatform vs. React Native</a>.</p>
  </chapter>
  <chapter title="Android 및 iOS 앱에 적합한 접근 방식을 선택하는 방법"
           id="how-to-choose-the-right-approach">
    <p>완전 네이티브 개발과 다양한 크로스 플랫폼 솔루션 사이의 선택은 핵심적인 아키텍처 결정입니다.</p>
    <chapter title="플랫폼 네이티브 UX의 중요성" id="importance-of-platform-native-ux">
      <p>고려해야 할 첫 번째 차원은 플랫폼 네이티브 UX의 중요성입니다. 제품이 플랫폼 규범, 특수화된 상호작용 또는 깊은 OS 통합에 대한 엄격한 준수에 의존하는 경우, 완전한 네이티브 UI 제어력을 유지하는 접근 방식이 장기적인 위험을 줄여줍니다. 플랫폼 간의 시각적 및 상호작용 차이가 덜 중요하다면 공유 UI 레이어는 재사용성을 높이기 위한 합리적인 트레이드오프가 될 수 있습니다.</p>
    </chapter>
    <chapter title="필요한 로직 공유의 정도" id="degree-of-logic-sharing-required">
      <p>또 다른 고려 사항은 필요한 로직 공유의 수준입니다. 어떤 제품은 플랫폼 전반에 걸쳐 유사한 비즈니스 규칙, 데이터 모델 및 워크플로가 필요한 반면, 어떤 제품은 UI 레이어의 상당 부분을 공유함으로써 이득을 얻습니다. 여러분과 여러분의 팀은 시스템의 어떤 컴포넌트가 동일하게 작동해야 하고 어떤 것이 달라야 하는지 명확히 해야 합니다. 이는 과소 공유(중요 로직의 중복)와 과잉 공유(잘못된 동질성 강요)를 모두 방지하는 데 도움이 됩니다.</p>
    </chapter>
    <chapter title="아키텍처 결정의 가역성" id="reversibility-of-architectural-decisions">
      <p>아키텍처 결정의 가역성(reversibility) 또한 중요한 고려 사항입니다. 일부 옵션은 나중에 변경하기 위해 막대한 비용이 드는 특정 구조에 여러분을 가둡니다. 특히 UI와 기본 기능이 뗄 수 없이 연결되어 있는 경우가 그렇습니다. 공통 코드와 플랫폼별 코드 사이의 경계를 점진적으로 이동할 수 있는 아키텍처는 향후 피벗(pivot) 및 리팩터링 비용을 낮춰줍니다.</p>
    </chapter>
    <chapter title="예상되는 제품 수명 및 진화" id="expected-product-lifespan-and-evolution">
      <p>마지막으로, 제품의 예상 수명과 진화 과정을 고려하십시오. 상당한 변화를 겪거나, 기능을 추가하거나, 새로운 플랫폼 기능에 적응해야 하는 제품은 책임이 명확히 분리되고 의존성이 제한된 설계로부터 이득을 얻습니다. 목표는 당장 재사용을 극대화하는 것이 아니라, 제품이 성장하고 변화함에 따라 변화를 관리 가능하게 만드는 방법을 선택하는 것입니다.</p>
    </chapter>
  </chapter>
  <chapter title="듀얼 플랫폼 개발 시 흔히 발생하는 실수" id="common-mistakes-in-dual-platform-development">
    <chapter title="모든 플랫폼을 동일하게 취급함" id="treating-platforms-as-identical">
      <p>가장 흔한 실수 중 하나는 모든 플랫폼을 동일하게 취급하는 것입니다. iOS와 Android는 사용자 기대치, 시스템 동작 및 기술적 한계가 서로 다릅니다. 두 플랫폼에서 동일한 상호작용 패턴이나 흐름을 사용하면 기능 패리티를 달성하더라도 모든 곳에서 경험이 약간 어색하게 느껴질 수 있습니다. 기능적 일관성이 시각적 또는 행동적 동질성보다 더 중요합니다.</p>
    </chapter>
    <chapter title="UX 고려 없이 UI를 과도하게 공유함" id="oversharing-ui-without-ux-consideration">
      <p>또 다른 공통적인 문제는 UX 영향을 고려하지 않고 UI를 과도하게 공유하는 것입니다. 화면과 컴포넌트를 공유하면 개발 시간은 단축될 수 있지만, 플랫폼 규범을 무너뜨리고 네이티브 상호작용 패턴의 사용을 제한할 수도 있습니다. 사용자 인터페이스가 지나치게 일반화되면 사용성, 접근성 및 장기적인 완성도 측면에서 제품이 손해를 입게 됩니다.</p>
    </chapter>
    <chapter title="유지 관리 비용을 과소평가함" id="underestimating-maintenance-costs">
      <p>팀들은 종종 유지 관리 비용을 과소평가합니다. 듀얼 플랫폼 앱은 단순히 테스트와 출시 작업을 두 배로 늘리는 것 이상의 일을 합니다. 조정 오버헤드를 추가하고, 더 많은 예외 상황을 노출하며, 지원해야 하는 OS 버전 및 기기의 범위를 넓힙니다. 이러한 현실을 무시하면 릴리스 프로세스가 약해지고 기술 부채가 증가하는 결과를 초래합니다.</p>
    </chapter>
    <chapter title="되돌릴 수 없는 아키텍처에 갇힘" id="locking-into-irreversible-architecture">
      <p>되돌릴 수 없는 아키텍처에 전념하는 것도 또 다른 구조적 실수입니다. 선택한 접근 방식에 따라 무엇을 공유하고 무엇을 플랫폼 전용으로 할지에 대해 나중에 마음을 바꾸는 것은 큰 비용이 들 수 있습니다. 제품 방향이나 플랫폼 요구 사항이 바뀌면 이러한 경직된 경계는 일상적인 발전을 대규모 리팩터링 작업으로 바꿔버립니다.</p>
    </chapter>
    <chapter title="팀의 전문성을 무시함" id="ignoring-team-expertise">
      <p>마지막으로, 팀의 전문성을 소홀히 하면 불필요한 마찰이 발생합니다. 서류상으로는 훌륭해 보이는 아키텍처라도 이를 구축하는 사람들의 기술, 경험 및 워크플로와 맞지 않는다면 실제로는 실패할 수 있습니다. 지속 가능한 속도는 대개 기술 선택을 팀의 실제 워크플로와 대립시키는 것이 아니라 그에 맞춤으로써 달성됩니다.</p>
    </chapter>
  </chapter>
  <chapter title="자주 묻는 질문(FAQ)" id="faq">
    <p><b>하나의 코드베이스로 Android 및 iOS 앱을 만들 수 있나요?</b></p>
    <p>네, 선택하는 접근 방식에 따라 동일한 코드베이스에서 두 플랫폼 모두를 위해 구축할 수 있습니다. Kotlin Multiplatform을 사용하면 무엇을 공유할지 선택할 수 있습니다. 로직과 UI를 모두 공유할 수도 있고, UI는 완전 네이티브로 유지하면서 로직만 공유하거나, 로직의 일부만 공유할 수도 있습니다.</p>
    <p><b>크로스 플랫폼이 네이티브보다 나은가요?</b></p>
    <p>어느 한쪽이 보편적으로 더 낫다고 할 수 없으며, 서로 다른 목표에 최적화되어 있습니다. 크로스 플랫폼 솔루션은 종종 중복을 줄이고 기능 패리티를 가속화하지만, 네이티브 개발은 플랫폼 동작과 사용자 경험에 대한 완전한 제어권을 제공합니다. 올바른 선택은 네이티브 UX, 성능 특성 및 플랫폼별 통합이 프로젝트에 얼마나 중요한지에 따라 달라집니다.</p>
    <p><b>Kotlin Multiplatform으로 무엇을 공유할 수 있나요?</b></p>
    <p>Kotlin Multiplatform을 사용하면 무엇을 공유할지 선택할 수 있습니다. Compose Multiplatform과 함께 Kotlin을 사용하면 UI를 포함하여 앱 코드의 최대 100%를 공유하면서도 네이티브 API와 통합할 수 있습니다. 또는 로직은 공유하되 UI는 네이티브로 유지할 수도 있습니다. Kotlin Multiplatform은 작고 특정한 모듈부터 전체 애플리케이션 컴포넌트까지 모든 것을 공유할 수 있게 해줍니다. 도메인 모델, 비즈니스 규칙, 네트워킹, 캐싱 및 상태 관리가 공유할 수 있는 코드의 예입니다.</p>
    <p><b>Kotlin Multiplatform은 프로덕션 환경에서 사용할 수 있나요?</b></p>
    <p>네, Kotlin Multiplatform은 수많은 팀에서 비즈니스 로직과 특정 경우 UI를 공유하기 위해 프로덕션 환경에서 사용되고 있습니다. 핵심 도구 및 언어 지원은 안정적으로 유지되고 있으며, 특화된 라이브러리와 사용 사례의 성숙도는 다양합니다. 다른 아키텍처 결정과 마찬가지로, 여러분의 제품의 기술적 및 조직적 요구 사항에 맞춰 테스트해보는 것이 중요합니다.</p>
    <a href="get-started.topic"><img src="get-started-with-kmp.svg" alt="Kotlin Multiplatform 시작하기" width="500"/></a>
  </chapter>
  <chapter title="결론" id="conclusion">
    <p>Android 및 iOS 앱을 구축하는 단 하나의 정답은 없습니다. 핵심은 이를 도구 선호도가 아닌 아키텍처 결정으로 취급하는 것입니다. 플랫폼 네이티브 UX 요구 사항, 일관된 비즈니스 로직의 필요성, 그리고 미래 변화에 따른 비용이 공유 코드와 플랫폼별 코드 사이의 경계를 정하는 기준이 되어야 합니다.</p>
    <p>최대 재사용을 위해 최적화하기보다 적응성을 위해 최적화하십시오. 시간이 지남에 따라 공유 대상을 조정할 수 있는 Kotlin Multiplatform과 같은 접근 방식은 제품이 진화함에 따라 더 잘 유지되는 경향이 있습니다. 올바른 선택은 오늘날의 목표를 지원하는 동시에 내일의 변화를 관리 가능하게 유지하는 것입니다.</p>
  </chapter>
</topic>