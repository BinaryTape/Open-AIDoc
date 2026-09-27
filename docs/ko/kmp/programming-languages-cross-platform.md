<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
   id="programming-languages-cross-platform"
   title="크로스 플랫폼 애플리케이션 개발을 위한 인기 프로그래밍 언어">
<title>
    크로스 플랫폼 애플리케이션 개발을 위한 인기 프로그래밍 언어
</title>
<web-summary>크로스 플랫폼 개발을 위한 언어 선택 시 주요 고려 사항, 인기 기술 비교 및 실제 사례 연구를 살펴봅니다.
</web-summary>
<p>최근 <a href="cross-platform-mobile-development.topic">크로스 플랫폼 개발(cross-platform development)</a>이라는 용어가 점점 더 자주 등장하고 있다는 사실을 느끼셨을 것입니다. 실제로 소프트웨어 개발 분야에서 크로스 플랫폼 프로그래밍은 점점 더 인기를 얻고 있습니다. 특히 모바일 앱 분야에서 매우 널리 퍼져 있지만, 그 용도가 모바일 애플리케이션에만 국한되는 것은 결코 아닙니다. 기업들이 여러 기기와 운영 체제에서 더 넓은 고객층에게 다가가기 위해 노력함에 따라, 개발자들은 플랫폼 간의 장벽을 허무는 다재다능한 언어와 프레임워크로 눈을 돌리고 있습니다.</p>
<p>크로스 플랫폼 개발을 시작하는 데 어떤 프로그래밍 언어가 가장 적합할지 고민 중이라면, 이 개요 문서가 통찰력 있는 정보와 실제 사용 사례 예시를 통해 올바른 방향을 제시해 줄 것입니다.</p>
<chapter title="크로스 플랫폼 개발의 이해" id="understanding-cross-platform-development">
    <p>크로스 플랫폼 애플리케이션 개발이란 단일 코드베이스를 사용하여 iOS, Android, Windows, macOS, 웹 브라우저 등 여러 플랫폼에서 실행되는 소프트웨어를 만드는 개발 방식을 의미합니다. 이 방식은 최근 몇 년 동안 모바일 앱에 대한 수요가 급증하면서 큰 인기를 얻었습니다. 모바일 엔지니어는 각 플랫폼용 애플리케이션을 따로 개발하는 대신 iOS와 Android 간에 소스 코드의 일부 또는 전부를 공유할 수 있습니다.</p>
    <p><a href="native-and-cross-platform.topic">네이티브 및 크로스 플랫폼 개발의 장단점</a>과 두 방식 중 하나를 선택하는 방법에 대해 더 자세히 읽어볼 수 있는 전용 가이드가 마련되어 있습니다. 크로스 플랫폼 개발의 주요 장점은 다음과 같습니다.</p>
    <list type="decimal">
        <li>
            <p>
                <control>비용 효율성.</control>
                각 플랫폼마다 별도의 앱을 구축하는 것은 시간과 리소스 측면에서 비용이 많이 들 수 있습니다. 크로스 플랫폼 개발을 사용하면 개발자가 코드를 한 번 작성하여 여러 플랫폼에 배포할 수 있으므로 개발 비용이 절감됩니다.
            </p>
        </li>
        <li>
            <p>
                <control>빠른 개발 속도.</control>
                이 방식은 개발자가 단일 코드베이스만 작성하고 유지 관리하면 되므로 개발 프로세스를 가속화하는 데 도움이 됩니다.
            </p>
        </li>
        <li>
            <p>
                <control>효율적이고 유연한 코드 공유.</control>
                현대적인 크로스 플랫폼 기술을 통해 개발자는 네이티브 프로그래밍의 장점을 유지하면서 여러 플랫폼에서 코드를 재사용할 수 있습니다.
            </p>
        </li>
        <li>
            <p>
                <control>플랫폼 간 일관된 사용자 경험.</control>
                크로스 플랫폼 개발을 사용하면 계산이나 워크플로와 같은 핵심 동작이 필요한 경우 서로 다른 플랫폼에서도 동일한 결과를 제공할 수 있습니다. 이는 일관성을 유지하는 데 도움이 되어 사용자가 어떤 기기나 운영 체제를 사용하든 동일한 경험을 제공합니다.
            </p>
        </li>
    </list>
    <p>이 문서에서는 크로스 플랫폼 개발을 위한 가장 인기 있는 프로그래밍 언어 몇 가지를 살펴보겠습니다.</p>
</chapter>
<chapter title="인기 있는 크로스 플랫폼 프로그래밍 언어, 프레임워크 및 기술"
         id="popular-cross-platform-programming-languages-frameworks-and-technologies">
    <p>이 문서에서는 크로스 플랫폼 개발에 적합한 잘 알려진 프로그래밍 언어에 초점을 맞춥니다. 다양한 용도로 설계된 언어가 많지만, 이 섹션에서는 관련 통계 및 이를 지원하는 프레임워크와 함께 크로스 플랫폼 개발을 위한 가장 인기 있는 프로그래밍 언어 몇 가지를 간략하게 소개합니다.</p>
    <p>
        <control>개요 및 인기 지표</control>
    </p>
    <table style="header-row">
        <tr>
            <td>언어</td>
            <td>최초 등장</td>
            <td>인기 지표 (<a href="https://survey.stackoverflow.co/2025/technology/">Stack
                Overflow, 2025</a>)</td>
            <td>인기 지표 (<a href="https://devecosystem-2025.jetbrains.com/">DevEco
                Report 2025</a>)</td>
        </tr>
        <tr>
            <td>JavaScript</td>
            <td>1995년</td>
            <td>1위 (66%)</td>
            <td>1위 (61%)</td>
        </tr>
        <tr>
            <td>Dart</td>
            <td>2011년</td>
            <td>19위 (5.9%)</td>
            <td>16위 (8%)</td>
        </tr>
        <tr>
            <td>Kotlin</td>
            <td>2011년</td>
            <td>15위 (10.08%)</td>
            <td>12위 (18%)</td>
        </tr>
        <tr>
            <td>C#</td>
            <td>2000년</td>
            <td>8위 (27.8%)</td>
            <td>9위 (21%)</td>
        </tr>
        <tr>
            <td>C++</td>
            <td>1985년</td>
            <td>9위 (23.5%)</td>
            <td>8위 (25%)</td>
        </tr>
    </table>
    <p>
        <control>생태계 및 기술</control>
    </p>
    <table style="header-row">
        <tr>
            <td>언어</td>
            <td>생태계/도구</td>
            <td>기술/프레임워크</td>
        </tr>
        <tr>
            <td>JavaScript</td>
            <td>풍부한 생태계, 많은 라이브러리, 활발한 커뮤니티</td>
            <td>React Native, Ionic</td>
        </tr>
        <tr>
            <td>Dart</td>
            <td>성장 중인 생태계, Google의 지원</td>
            <td>Flutter</td>
        </tr>
        <tr>
            <td>Kotlin</td>
            <td>확장 중인 생태계, JetBrains의 강력한 지원</td>
            <td>Kotlin Multiplatform</td>
        </tr>
        <tr>
            <td>C#</td>
            <td>Microsoft의 강력한 지원, 거대한 생태계</td>
            <td>.NET MAUI</td>
        </tr>
        <tr>
            <td>C++</td>
            <td>성숙한 생태계, 상대적으로 적은 서드파티 라이브러리</td>
            <td>Qt</td>
        </tr>
    </table>
    <p>
        <control>JavaScript</control>
    </p>
    <p>JavaScript는 개발자가 웹 페이지에 복잡한 기능을 추가할 수 있도록 널리 사용되는 프로그래밍 언어입니다. React Native 및 Ionic과 같은 프레임워크의 도입으로 크로스 플랫폼 앱 개발을 위한 인기 있는 선택지가 되었습니다. JetBrains가 실시한 최신 <a href="https://devecosystem-2025.jetbrains.com/">Developer
            Ecosystem Survey</a>에 따르면 개발자의 61%가 JavaScript를 사용하고 있으며, 이는 가장 인기 있는 프로그래밍 언어입니다.</p>
    <p>
        <control>Dart</control>
    </p>
    <p>Dart는 2011년 Google에서 도입한 객체 지향 클래스 기반 프로그래밍 언어입니다. Dart는 단일 코드베이스에서 멀티플랫폼 애플리케이션을 구축하기 위해 Google에서 만든 오픈 소스 프레임워크인 Flutter의 기반이 됩니다. Dart는 Flutter 앱을 구동하는 언어와 런타임을 제공합니다.</p>
    <p>
        <control>Kotlin</control>
    </p>
    <p>Kotlin은 JetBrains에서 개발한 현대적이고 성숙한 멀티플랫폼 프로그래밍 언어입니다. <a
            href="https://github.blog/news-insights/octoverse/octoverse-2024/#the-most-popular-programming-languages">Octoverse
        보고서</a>에 따르면 2024년에 다섯 번째로 빠르게 성장하는 언어였습니다. 간결하고 안전하며 Java 및 기타 언어와 상호 운용이 가능하며, Google이 권장하는 Android 앱 개발용 언어이기도 합니다.</p>
    <p><a href="https://www.jetbrains.com/kotlin-multiplatform/">Kotlin Multiplatform (KMP)</a>은 네이티브 프로그래밍의 이점을 유지하면서 다양한 플랫폼용 애플리케이션을 만들고 플랫폼 간에 Kotlin 코드를 재사용할 수 있게 해주는 JetBrains의 기술입니다. 또한 JetBrains는 KMP와 Jetpack Compose를 기반으로 여러 플랫폼에서 UI를 공유하기 위한 선언적 프레임워크인 Compose Multiplatform을 제공합니다. 2024년 5월, Google은 Android와 iOS 간에 비즈니스 로직을 공유하기 위한 <a
                href="https://android-developers.googleblog.com/2024/05/android-support-for-kotlin-multiplatform-to-share-business-logic-across-mobile-web-server-desktop.html">Kotlin Multiplatform에 대한 공식 지원</a>을 발표했습니다.</p>
    <p><a href="https://www.jetbrains.com/kotlin-multiplatform/"><img src="discover-kmp.svg"
                                                                      alt="Kotlin Multiplatform 살펴보기"
                                                                      width="500" style="block"/></a></p>
    <p>
        <control>C#</control>
    </p>
    <p>C#은 Microsoft에서 개발한 크로스 플랫폼 범용 프로그래밍 언어입니다. C#은 .NET Framework에서 가장 인기 있는 언어입니다. .NET MAUI는 Android, iOS, Mac 및 Windows용 단일 C# 코드베이스에서 네이티브 크로스 플랫폼 데스크톱 및 모바일 앱을 구축하기 위한 프레임워크입니다.</p>
    <p>
        <control>C++</control>
    </p>
    <p>C++은 1985년 C 프로그래밍 언어의 확장으로 처음 출시된 범용 프로그래밍 언어입니다. Qt는 모듈화된 C++ 라이브러리 클래스 세트를 포함하고 애플리케이션 개발을 위한 다양한 API를 제공하는 크로스 플랫폼 소프트웨어 개발 프레임워크입니다.</p>
</chapter>
<chapter title="크로스 플랫폼 프로그래밍 언어 선택 시 주요 요인"
         id="key-factors-in-selecting-a-cross-platform-programming-language">
    <p>오늘날 사용 가능한 모든 언어, 기술 및 도구를 고려할 때, 특히 크로스 플랫폼 개발의 세계에 막 발을 들여놓은 경우 적절한 것을 선택하는 것이 벅찰 수 있습니다. 다양한 크로스 플랫폼 기술에는 고유한 장단점이 있지만, 궁극적으로는 구축하려는 소프트웨어의 목표와 요구 사항에 따라 결정됩니다.</p>
    <p>프로젝트를 위한 언어나 프레임워크를 선택할 때는 몇 가지 중요한 요소를 염두에 두어야 합니다. 여기에는 애플리케이션 유형, 성능 및 UX 요구 사항, 관련 도구 및 아래에 자세히 설명된 기타 다양한 고려 사항이 포함됩니다.</p>
    <p>
        <control>1. 애플리케이션 유형</control>
    </p>
    <p>프로그래밍 언어와 프레임워크마다 Windows, macOS, Linux, iOS, Android 및 웹 브라우저와 같은 다양한 플랫폼에서 지원되는 정도가 다릅니다. 특정 언어는 본질적으로 특정 플랫폼 및 프로젝트에 더 적합합니다.</p>
    <p>
        <control>2. 성능 및 UX 요구 사항</control>
    </p>
    <p>특정 유형의 애플리케이션은 속도, 응답성, 메모리 사용량, CPU 및 GPU 소비량과 같은 다양한 기준으로 측정할 수 있는 특정 성능 및 사용자 경험(UX) 요구 사항을 가집니다. 미래의 애플리케이션이 수행해야 할 기능과 위 기준에 대해 원하는 매개변수를 고려하세요.</p>
    <tip>
        <p>예를 들어, 그래픽 집약적인 게임 앱은 GPU를 효율적으로 활용할 수 있는 언어로부터 이점을 얻을 수 있습니다. 반면, 비즈니스 앱은 데이터베이스 통합 및 네트워크 통신의 용이성을 우선시할 수 있습니다.</p>
    </tip>
    <p>
        <control>3. 기존 기술 수준 및 학습 곡선</control>
    </p>
    <p>다음 프로젝트를 위한 기술을 선택할 때 개발 팀은 이전 경험을 고려해야 합니다. 새로운 언어나 도구를 도입하려면 교육 시간이 필요하며, 이는 때때로 프로젝트를 지연시킬 수 있습니다. 학습 곡선이 가파를수록 팀이 숙련되는 데 더 오랜 시간이 걸립니다.</p>
    <tip>
        <p>예를 들어, 팀이 숙련된 JavaScript 개발자로 구성되어 있고 새로운 기술을 채택할 리소스가 부족하다면 React Native와 같이 JavaScript를 활용하는 프레임워크를 선택하는 것이 유리할 수 있습니다.</p>
    </tip>
    <p>
        <control>4. 기존 사용 사례</control>
    </p>
    <p>고려해야 할 또 다른 중요한 요소는 기술의 실제 활용 사례입니다. 특정 크로스 플랫폼 언어나 프레임워크를 성공적으로 구현한 기업의 사례 연구를 검토하면 이러한 기술이 실제 운영 환경에서 어떻게 작동하는지에 대한 귀중한 통찰력을 얻을 수 있습니다. 이는 특정 기술이 프로젝트 목표에 적합한지 평가하는 데 도움이 될 수 있습니다. Kotlin Multiplatform을 활용하여 다양한 플랫폼에서 운영 환경에 바로 적용 가능한 애플리케이션을 개발하는 기업들의 <a
                href="https://kotlinlang.org/case-studies/?type=multiplatform">사례 연구</a>를 살펴보세요.</p>
    <p>예를 들어, <a href="https://kotlinlang.org/case-studies/#mcdonalds-umain">McDonald’s 앱을 개발한 Umain 팀</a>은 iOS와 Android 간에 Kotlin 코드베이스를 공유하여 더욱 통합된 모바일 개발 방식으로 전환했습니다. <a
                href="https://blog.jetbrains.com/kotlin/2021/01/philips-case-study-building-connectivity-platform-with-kotlin-multiplatform/">Philips는 KMP를 적용</a>하여 커넥티드 기기용 크로스 플랫폼 SDK를 구축함으로써 Android와 iOS 전반에서 일관된 기능을 제공하며, <a href="https://kotlinlang.org/case-studies/#9gag">9GAG</a>와 같은 미디어 플랫폼은 핵심 콘텐츠 및 데이터 로직을 공유하는 데 이를 사용하여 기능적 동등성을 보장하고 빠른 이터레이션을 가능하게 합니다.</p>
    <p><a href="https://kotlinlang.org/case-studies/?type=multiplatform"><img src="kmp-use-cases-1.svg"
                                                                              alt="실제 Kotlin Multiplatform 사용 사례 살펴보기"
                                                                              width="500" style="block"/></a></p>
    <p>
        <control>5. 언어 생태계</control>
    </p>
    <p>언어 생태계의 성숙도 또한 큰 역할을 할 수 있습니다. 멀티플랫폼 개발을 지원하는 도구와 라이브러리의 가용성 및 품질에 주의를 기울이세요. 예를 들어, JavaScript는 프런트엔드 프레임워크(React, Angular, Vue.js), 백엔드 개발(Express, NestJS) 및 기타 광범위한 기능을 지원하는 방대한 수의 라이브러리를 보유하고 있습니다.</p>
    <p>마찬가지로 Flutter는 패키지 또는 플러그인이라고도 불리는 상당하고 빠르게 성장하는 라이브러리 수를 보유하고 있습니다. Kotlin Multiplatform은 현재 라이브러리 수가 더 적지만, 그 생태계는 빠르게 성장하고 있으며 전 세계의 많은 Kotlin 개발자에 의해 언어가 향상되고 있습니다. <a href="https://klibs.io/">klibs.io</a>에서 이미 사용 가능한 수천 개의 멀티플랫폼 라이브러리를 검색해 볼 수 있습니다.
    </p>
    <p>
        <control>6. 인기 및 커뮤니티 지원</control>
    </p>
    <p>프로그래밍 언어 및 관련 기술의 인기와 커뮤니티 지원을 살펴볼 가치가 있습니다. 이는 단순히 사용자 및 라이브러리 수에 국한되지 않습니다. 사용자 및 기여자를 포함하여 해당 언어의 커뮤니티가 얼마나 활발하고 협조적인지 주의를 기울이세요. 이용 가능한 블로그, 팟캐스트, 포럼 및 기타 리소스를 찾아보세요.</p>
    <p>
        <control>7. 라이선싱 및 벤더의 지속성</control>
    </p>
    <p>개발자들은 종종 대규모 커뮤니티나 평판이 좋은 조직에서 지원하는 오픈 소스 및 벤더 중립적인 언어와 프레임워크를 찾습니다. 오픈 소스 생태계(Kotlin, JavaScript, Dart 등)는 종속성(lock-in) 위험을 줄이고 팀이 필요에 따라 독립적으로 도구를 유지 관리하거나 개선할 수 있도록 합니다.</p>
    <p>동시에 벤더의 지원도 여전히 중요합니다. Google, JetBrains 또는 Meta에서 지원하는 프레임워크는 더 빠르게 발전하고 더 빈번한 업그레이드를 받습니다. 이러한 측면의 균형을 맞추는 것이 중요합니다. 강력한 프로젝트는 일반적으로 투명한 거버넌스, 활발한 커뮤니티 기여, 메인테이너의 장기적인 의지를 결합하여 팀이 선택한 기술이 향후 수년 동안 유효할 것임을 보장합니다.</p>
</chapter>
<chapter title="크로스 플랫폼 개발의 미래" id="the-future-of-cross-platform-development">
    <p>크로스 플랫폼 개발이 발전함에 따라 몇 가지 신흥 트렌드가 미래에 영향을 미치고 있으며, 이를 단순한 코드 공유를 넘어 더 스마트하고 유연한 솔루션으로 밀어붙이고 있습니다.</p>
    <p>
        <control>WebAssembly 및 서버 주도 UI</control>
    </p>
    <p>한 가지 중요한 트렌드는 WebAssembly(Wasm)의 부상으로, 이를 통해 고성능 코드(Rust나 C++와 같은 언어로 작성됨)를 JavaScript와 함께 브라우저에서 실행할 수 있습니다. 이는 플랫폼 전용 코드에 크게 의존하지 않고도 플랫폼 전반에서 네이티브에 가까운 성능을 제공하는 진정한 이식성 있는 애플리케이션을 가능하게 합니다. 동시에 서버 주도 UI(server-driven UI)가 인기를 얻고 있어 개발자가 백엔드에서 앱 인터페이스를 맞춤 설정할 수 있게 함으로써 빈번한 클라이언트 업데이트의 필요성을 줄이고 여러 기기 간의 일관성을 높이고 있습니다.</p>
    <p>
        <control>AI 지원 코드 생성</control>
    </p>
    <p>또 다른 중요한 트렌드는 AI 지원 코드 생성입니다. 대규모 언어 모델 기반 도구는 상용구 코드를 생성하고, 크로스 플랫폼 추상화를 추천하며, 심지어 언어 간 코드 변환을 지원함으로써 개발 속도를 높입니다. 이는 진입 장벽을 낮추고 특히 다양한 플랫폼에서 작업하는 팀의 배포 속도를 가속화합니다.</p>
    <p>
        <control>크로스 플랫폼 시스템을 위한 Rust 및 Go의 부상</control>
    </p>
    <p>Rust 및 Go와 같은 언어는 크로스 플랫폼 백엔드 서비스 및 성능이 중요한 구성 요소를 위해 점점 더 인기를 얻고 있습니다. 특히 Rust는 메모리 안전성과 WebAssembly 호환성으로 찬사를 받고 있으며, Go의 단순성과 동시성 모델은 대규모 크로스 플랫폼 애플리케이션에 탁월합니다.</p>
    <p>
        <control>로우코드 및 노코드 가속화</control>
    </p>
    <p>현재 많은 기업이 로우코드(low-code) 및 노코드(no-code) 플랫폼을 사용하여 엔지니어링 개입을 최소화하면서 크로스 플랫폼 애플리케이션을 신속하게 프로토타이핑하거나 배포하고 있습니다. 대규모 프로그램의 전체 개발을 대체할 수는 없지만, 단순한 사용 사례의 경우 시장 출시 기간을 획기적으로 단축합니다.</p>
    <p>전반적으로 크로스 플랫폼 개발의 미래는 고성능, 자동화 및 다재다능함의 조합으로 이동하고 있습니다. 이러한 기술이 발전함에 따라 개발자는 플랫폼별 복잡성을 처리하는 데 시간을 덜 소비하면서도 플랫폼 전반에서 더욱 풍부하고 빠르며 일관된 경험을 만들 수 있게 될 것입니다.</p>
    <p><a href="https://www.jetbrains.com/kotlin-multiplatform/"><img src="see-kmp-in-action.svg"
                                                                      alt="실제 작동하는 Kotlin Multiplatform 보기"
                                                                      width="500" style="block"/></a></p>
    </chapter>
    <chapter title="자주 묻는 질문(FAQ)" id="frequently-asked-questions">
    <p>
        <control>Q: 가장 인기 있는 크로스 플랫폼 프로그래밍 언어는 무엇인가요?</control>
    </p>
    <p>A: Kotlin, JavaScript, Python, Java, C#, C++, Dart 등이 가장 인기 있는 크로스 플랫폼 개발 언어에 속합니다. 이들의 매력은 강력한 생태계, 성숙한 도구 및 광범위한 커뮤니티 지원에서 비롯되며, 웹, 모바일 및 데스크톱 앱 개발을 위한 신뢰할 수 있는 선택지가 됩니다.</p>
    <p>
        <control>Q: Python은 크로스 플랫폼 개발에 적합한가요?</control>
    </p>
    <p>네, Python은 다재다능하며 크로스 플랫폼 데스크톱 애플리케이션 및 스크립팅에 이상적입니다. Kivy와 같은 프레임워크를 사용하면 개발자가 단일 코드베이스로 여러 플랫폼에서 실행되는 앱을 만들 수 있습니다. 그러나 Kotlin, Swift, Dart와 같은 언어가 더 널리 사용되는 네이티브 모바일 앱 개발에서는 상대적으로 덜 사용됩니다.</p>
    <p>
        <control>Q: Kotlin, Flutter(Dart), React Native(JavaScript) 중 어떻게 선택해야 하나요?</control>
    </p>
    <p>가장 적합한 옵션은 몇 가지 중요한 요인에 따라 달라집니다.</p>
    <list>
        <li><p>팀의 전문성 – 팀원들이 이미 이해하고 있는 기술을 활용하여 램프업(ramp-up) 시간을 단축하세요.</p></li>
        <li><p>UI 접근 방식 – Flutter는 고도로 맞춤 설정 가능한 UI를 제공하지만, React Native는 네이티브 구성 요소에 의존합니다. Kotlin Multiplatform은 이에 비해 더 많은 유연성을 제공합니다. 개발자는 UI를 각 플랫폼에 대해 완전히 네이티브로 유지하면서 비즈니스 로직만 공유할 수도 있고, Compose Multiplatform을 사용하여 로직과 UI를 모두 공유할 수도 있습니다.</p></li>
        <li><p>성능 요구 사항 – Kotlin(네이티브 Android용)이 최고의 성능을 발휘하며, Kotlin Multiplatform은 성능 저하 없이 크로스 플랫폼 개발을 가능하게 합니다. Flutter는 자체 렌더링 엔진으로 높은 성능을 제공하는 반면, React Native 성능은 브릿징 및 앱 복잡성에 따라 달라질 수 있습니다.</p></li>
        <li><p>커뮤니티 및 생태계 – React Native가 가장 큰 생태계를 보유하고 있지만, Kotlin Multiplatform과 Flutter도 빠르게 확장되고 있습니다.</p></li>
        <li><p>장기 지원 – JavaScript가 가장 큰 생태계를 가지고 있으며, Kotlin Multiplatform과 Flutter는 각각 JetBrains와 Google의 강력한 지원 하에 빠르게 진화하고 있습니다.</p></li>
    </list>
    <p>
        <control>Q: 단일 언어를 사용하여 여러 플랫폼에서 코드를 재사용하는 것이 가능한가요?</control>
    </p>
    <p>A: 네. 예를 들어 Kotlin Multiplatform을 사용하면 네이티브 개발의 장점을 유지하면서 Android, iOS, 데스크톱, 웹 및 서버 전반에서 코드를 공유할 수 있습니다. Compose Multiplatform을 사용하면 UI 코드도 여러 플랫폼에서 공유하여 코드 재사용을 극대화할 수 있습니다. 하드웨어 액세스, 시스템 API 또는 깊은 OS 통합과 같은 일부 플랫폼 종속적 기능은 여전히 네이티브 구현 또는 커스텀 expect/actual 모듈이 필요할 수 있습니다.</p>
    </chapter>
</topic>