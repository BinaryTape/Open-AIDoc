[//]: # (title: 자주 묻는 질문(FAQ))

<web-summary>Kotlin은 JetBrains에서 개발한 간결한 멀티플랫폼 프로그래밍 언어입니다.</web-summary>

### Kotlin은 무엇인가요? {id="what-is-kotlin"}

Kotlin은 JVM, Android, JavaScript, Wasm 및 Native를 타깃으로 하는 오픈 소스 정적 타입 지정 프로그래밍 언어입니다. 
[JetBrains](https://www.jetbrains.com)에서 개발하고 있습니다. 프로젝트는 2010년에 시작되었으며 초기부터 오픈 소스로 공개되었습니다. 
첫 번째 공식 1.0 릴리스는 2016년 2월이었습니다.

### Kotlin의 최신 버전은 무엇인가요? {id="what-is-the-current-version-of-kotlin"}

현재 릴리스된 최신 버전은 %kotlinVersion%이며, %kotlinReleaseDate%에 출시되었습니다.  
자세한 정보는 [GitHub](https://github.com/jetbrains/kotlin)에서 확인할 수 있습니다.

### Kotlin은 무료인가요? {id="is-kotlin-free"}

네. Kotlin은 무료이며, 지금까지도 무료였고, 앞으로도 무료로 유지됩니다. Apache 2.0 라이선스 하에 개발되고 있으며, 소스 코드는 [GitHub](https://github.com/jetbrains/kotlin)에서 공개되어 있습니다.

### Kotlin은 객체 지향 언어인가요, 함수형 언어인가요? {id="is-kotlin-an-object-oriented-language-or-a-functional-one"}

Kotlin은 객체 지향과 함수형 언어의 구조를 모두 갖추고 있습니다. 객체 지향(OO) 스타일과 함수형 프로그래밍(FP) 스타일 모두로 사용할 수 있으며, 두 스타일의 요소를 혼합해서 사용할 수도 있습니다. 
고차 함수, 함수 타입, 람다 등의 기능을 일급 지원(first-class support)하므로, 함수형 프로그래밍을 활용하거나 배우고자 할 때 Kotlin은 훌륭한 선택입니다.

### Java 프로그래밍 언어에 비해 Kotlin이 갖는 장점은 무엇인가요? {id="what-advantages-does-kotlin-give-me-over-the-java-programming-language"}

Kotlin은 훨씬 더 간결합니다. 대략적인 추정에 따르면 코드 라인 수가 약 40% 줄어듭니다. 
또한 타입 안정성이 더 뛰어납니다. 예를 들어, null을 허용하지 않는 타입(non-nullable types)을 지원하여 애플리케이션에서 NPE(NullPointerException)가 발생할 가능성을 줄여줍니다. 
그 밖에도 스마트 캐스트(smart casting), 고차 함수, 확장 함수, 수신 객체 지정 람다(lambdas with receivers)와 같은 기능을 통해 표현력 높은 코드를 작성할 수 있으며, DSL 제작도 수월해집니다.
 
### Kotlin은 Java 프로그래밍 언어와 호환되나요? {id="is-kotlin-compatible-with-the-java-programming-language"}

네. Kotlin은 Java 프로그래밍 언어와 100% 상호 운용(interoperable)이 가능하며, 기존 코드베이스가 Kotlin과 매끄럽게 연동될 수 있도록 하는 데 많은 중점을 두었습니다. [Java에서 Kotlin 코드를 호출](java-to-kotlin-interop.md)하거나 [Kotlin에서 Java 코드를 호출](java-interop.md)하는 작업 모두 손쉽게 할 수 있습니다. 덕분에 언어 도입이 훨씬 쉽고 위험 부담도 적습니다. 또한 [IDE에 내장된 자동 Java-to-Kotlin 변환기](mixing-java-kotlin-intellij.md#convert-java-files-to-kotlin)를 통해 기존 코드를 간편하게 이전할 수 있습니다.

### Kotlin을 어디에 사용할 수 있나요? {id="what-can-i-use-kotlin-for"}

Kotlin은 백엔드, 클라이언트 사이드 웹, Android 또는 멀티플랫폼 라이브러리 등 어떤 종류의 개발에도 사용할 수 있습니다. 
Kotlin/Native를 통해 임베디드 시스템, macOS, iOS 등 다양한 플랫폼 또한 지원합니다. 
많은 개발자들이 모바일 및 서버 사이드 애플리케이션, JavaScript나 JavaFX를 활용한 클라이언트 사이드 개발, 데이터 사이언스 등 수많은 분야에서 Kotlin을 활발히 사용하고 있습니다.

### Android 개발에 Kotlin을 사용할 수 있나요? {id="can-i-use-kotlin-for-android-development"}

네. Kotlin은 Android에서 공식 언어(first-class language)로 지원됩니다. Basecamp, Pinterest 등 이미 수백 개의 애플리케이션이 Android 개발에 Kotlin을 사용하고 있습니다. 자세한 내용은 [Android 개발 리소스](android-overview.md)를 확인하세요.

### 백엔드 개발에 Kotlin을 사용할 수 있나요? {id="can-i-use-kotlin-for-backend-development"}

네. Kotlin은 JVM과 100% 호환되므로 Spring Boot, Vert.x, JSF와 같은 기존 프레임워크를 모두 사용할 수 있습니다. 또한 [Ktor](https://github.com/kotlin/ktor)와 같이 Kotlin으로 작성된 전용 프레임워크도 있습니다. 자세한 내용은 [백엔드 개발 개요](server-overview.md)를 확인하세요.

### 웹 개발에 Kotlin을 사용할 수 있나요? {id="can-i-use-kotlin-for-web-development"}

네. 백엔드 웹 개발의 경우 Kotlin은 [Ktor](https://ktor.io/) 및 [Spring](https://spring.io/)과 같은 프레임워크와 원활히 작동하여 서버 사이드 애플리케이션을 효율적으로 구축할 수 있습니다. 또한 클라이언트 사이드 웹 개발에는 Kotlin/Wasm을 사용할 수 있습니다. 
자세한 방법은 [Kotlin/Wasm 시작하기](wasm-get-started.md)를 참고하세요.

### 데스크톱 개발에 Kotlin을 사용할 수 있나요? {id="can-i-use-kotlin-for-desktop-development"}

네. JavaFX, Swing 등 기존의 모든 Java UI 프레임워크를 사용할 수 있습니다. 
또한 [TornadoFX](https://github.com/edvin/tornadofx)와 같은 Kotlin 전용 프레임워크도 제공됩니다.

### 네이티브 개발에 Kotlin을 사용할 수 있나요? {id="can-i-use-kotlin-for-native-development"}

네. Kotlin의 일부로 Kotlin/Native를 사용할 수 있습니다. 이는 Kotlin 코드를 가상 머신(VM) 없이 실행 가능한 네이티브 코드로 컴파일해 줍니다. 
주요 데스크톱 및 모바일 플랫폼은 물론 일부 IoT 기기에서도 사용해 볼 수 있습니다. 
자세한 내용은 [Kotlin/Native 문서](native-overview.md)를 확인하세요.

### 어떤 IDE가 Kotlin을 지원하나요? {id="what-ides-support-kotlin"}

Kotlin은 JetBrains가 개발한 공식 Kotlin 플러그인을 통해 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/)와 [Android Studio](https://developer.android.com/kotlin/get-started)에서 기본적으로 완벽하게 지원됩니다. 
또한 [알파(Alpha)](components-stability.md#stability-levels-explained) 단계인 Kotlin Language Server 기반의 공식 [Visual Studio Code용 Kotlin by JetBrains 확장 프로그램](kotlin-lsp.md#kotlin-in-visual-studio-code)을 설치할 수도 있습니다.

그 외의 IDE 및 코드 편집기에서는 커뮤니티에서 지원하는 플러그인을 통해 지원됩니다.

브라우저에서 Kotlin 코드를 작성, 실행, 공유할 수 있는 [Kotlin Playground](https://play.kotlinlang.org)도 이용할 수 있습니다. 
또한 애플리케이션 컴파일 및 실행을 직관적으로 지원하는 [명령줄 컴파일러](command-line.md)도 제공됩니다.
  
### 어떤 빌드 도구가 Kotlin을 지원하나요? {id="what-build-tools-support-kotlin"}

JVM 환경의 주요 빌드 도구로는 [Gradle](gradle.md)과 [Maven](maven.md)이 있습니다. 
클라이언트 사이드 JavaScript를 타깃으로 하는 일부 빌드 도구도 지원됩니다.

### Kotlin은 무엇으로 컴파일되나요? {id="what-does-kotlin-compile-down-to"}

JVM을 타깃으로 할 때 Kotlin은 Java와 호환되는 바이트코드를 생성합니다.

JavaScript를 타깃으로 할 때는 구성된 타깃에 따라 ES5, ES2015 또는 ES2020 코드를 생성할 수 있습니다. 
이 코드는 AMD 및 CommonJS를 포함한 모듈 시스템과 호환됩니다.

Native를 타깃으로 할 때는 (LLVM을 통해) 플랫폼별 고유 코드를 생성합니다.

### Kotlin은 어떤 버전의 JVM을 타깃으로 하나요? {id="which-versions-of-jvm-does-kotlin-target"}

Kotlin에서는 실행할 JVM 버전을 선택할 수 있습니다. 기본적으로 Kotlin/JVM 컴파일러는 Java 8과 호환되는 바이트코드를 생성합니다. 
최신 버전의 Java에서 제공하는 최적화 기능을 활용하려면 대상 Java 버전을 9부터 26까지 명시적으로 지정할 수 있습니다. 단, 이 경우 생성된 바이트코드가 하위 버전에서는 실행되지 않을 수 있습니다. 
[Kotlin 1.5](whatsnew15.md#new-default-jvm-target-1-8)부터는 컴파일러가 Java 8 미만 버전과 호환되는 바이트코드 생성을 지원하지 않습니다.

### Kotlin은 어렵나요? {id="is-kotlin-hard"}

Kotlin은 Java, C#, JavaScript, Scala, Groovy 등 기존 언어들에서 영감을 받았습니다. 누구나 쉽게 시작하여 며칠 만에 Kotlin 코드를 읽고 쓸 수 있도록 학습 난이도를 낮추기 위해 노력했습니다. 
Kotlin다운(idiomatic) 코드를 작성하고 고급 기능을 능숙하게 다루려면 조금 더 시간이 걸릴 수 있지만, 전반적으로 복잡한 언어는 아닙니다.  
자세한 정보는 [학습 자료](learning-materials-overview.md)를 확인하세요.
 
### 어떤 기업들이 Kotlin을 사용하고 있나요? {id="what-companies-are-using-kotlin"}

Kotlin을 사용하는 기업은 일일이 나열하기 어려울 정도로 많습니다. 블로그 게시물, GitHub 저장소, 기술 발표 등을 통해 Kotlin 사용 사실을 공개적으로 밝힌 대표적인 기업으로는 
[Square](https://medium.com/square-corner-blog/square-open-source-loves-kotlin-c57c21710a17), [Pinterest](https://www.youtube.com/watch?v=mDpnc45WwlI), 
[Basecamp](https://signalvnoise.com/svn3/using-kotlin-to-make-android-apis-fun-again/) 등이 있습니다.
 
### Kotlin은 누가 개발하나요? {id="who-develops-kotlin"}

Kotlin은 [JetBrains(현재 100명 이상의 팀 규모)](https://www.jetbrains.com/)의 엔지니어 팀이 개발하고 있습니다. 
언어의 수석 디자이너는 Michail Zarečenskij입니다. 코어 팀 외에도 GitHub에서 활동하는 250명 이상의 외부 기여자가 함께하고 있습니다.

### Kotlin에 대해 더 알아보려면 어떻게 해야 하나요? {id="where-can-i-learn-more-about-kotlin"}

가장 좋은 시작점은 [공식 웹사이트](https://kotlinlang.org)입니다. 
Kotlin을 시작하려면 [공식 IDE](kotlin-ide.md) 중 하나를 설치하거나 [온라인 플레이그라운드](https://play.kotlinlang.org)에서 직접 사용해 보세요.

### Kotlin 관련 서적이 있나요? {id="are-there-any-books-on-kotlin"}

Kotlin 관련 도서가 다양하게 출간되어 있습니다. 그중 검토를 거쳐 입문용으로 추천할 만한 도서 목록을 [도서 목록(Books)](books.md) 페이지에서 확인할 수 있습니다. 더 많은 서적은 [kotlin.link](https://kotlin.link/)의 커뮤니티 관리 목록을 참고하세요.

### Kotlin을 배울 수 있는 온라인 강좌가 있나요? {id="are-any-online-courses-available-for-kotlin"}

JetBrains Academy의 [Kotlin Core 트랙](https://hyperskill.org/tracks?category=4&utm_source=jbkotlin_hs&utm_medium=referral&utm_campaign=kotlinlang-docs&utm_content=button_1&utm_term=22.03.23)을 통해 실제로 작동하는 애플리케이션을 만들며 Kotlin의 핵심 요소를 모두 배울 수 있습니다.

그 외 추천 강좌:
* [Pluralsight 강좌: Getting Started with Kotlin](https://www.pluralsight.com/courses/kotlin-getting-started) (Kevin Jones 진행)
* [O'Reilly 강좌: Introduction to Kotlin Programming](https://www.oreilly.com/library/view/introduction-to-kotlin/9781491964125/) (Hadi Hariri 진행)

공식 [YouTube 채널](https://www.youtube.com/c/Kotlin)에서도 튜토리얼과 다양한 콘텐츠를 확인할 수 있습니다.

### Kotlin 커뮤니티가 있나요? {id="does-kotlin-have-a-community"}

네! Kotlin은 매우 활발한 커뮤니티를 보유하고 있습니다. Kotlin 개발자들은 [Kotlin 포럼](https://discuss.kotlinlang.org), 
[StackOverflow](https://stackoverflow.com/questions/tagged/kotlin), 그리고 더욱 활발하게 운영되는 [Kotlin Slack](https://slack.kotlinlang.org)(2020년 4월 기준 회원 수 약 30,000명) 등에서 활동하고 있습니다.

### Kotlin 관련 이벤트가 있나요? {id="are-there-kotlin-events"}
 
네! 현재 Kotlin만을 주제로 하는 사용자 그룹(User Group)과 밋업(Meetup)이 다수 운영되고 있습니다. [웹사이트의 목록](https://kotlinlang.org/user-groups/user-group-list.html)에서 확인하실 수 있습니다. 
또한 전 세계 곳곳에서 커뮤니티 주최로 [Kotlin Nights](kotlin-night-guidelines.md) 행사가 열립니다.

### Kotlin 콘퍼런스가 있나요? {id="is-there-a-kotlin-conference"}

네! [KotlinConf](https://kotlinconf.com/)는 JetBrains가 주최하는 연례 콘퍼런스로, 전 세계의 개발자, 애호가, 전문가들이 한자리에 모여 Kotlin에 대한 지식과 경험을 공유하는 자리입니다.

기술 세션과 워크숍뿐만 아니라 네트워킹 기회, 커뮤니티 교류, 소셜 이벤트 등이 마련되어 참가자들이 동료 코틀리너(Kotliner)들과 소통하고 아이디어를 나눌 수 있습니다. 
KotlinConf는 Kotlin 생태계 내 협업을 촉진하고 커뮤니티를 구축하는 플랫폼 역할을 합니다.

또한 전 세계의 다양한 콘퍼런스에서도 Kotlin 관련 세션이 진행되고 있습니다. [웹사이트의 발표 일정 목록](https://kotlinlang.org/community/talks.html?time=upcoming)에서 예정된 강연들을 확인할 수 있습니다.

### Kotlin 공식 소셜 미디어 계정이 있나요? {id="is-kotlin-on-social-media"}

네. 
[Kotlin YouTube 채널](https://www.youtube.com/c/Kotlin)을 구독하고, [Twitter](https://twitter.com/kotlin) 또는 [Bluesky](https://bsky.app/profile/kotlinlang.org)에서 Kotlin을 팔로우하세요.

### 그 외 다른 온라인 Kotlin 리소스가 있나요? {id="any-other-online-kotlin-resources"}

공식 웹사이트에서 커뮤니티 구성원들이 발행하는 [Kotlin Digests](https://kotlin.link), [뉴스레터](http://kotlinweekly.net), [팟캐스트](https://talkingkotlin.com) 등 다양한 [온라인 리소스](https://kotlinlang.org/community/)를 확인하실 수 있습니다.

### 고해상도 Kotlin 로고는 어디서 다운로드할 수 있나요? {id="where-can-i-get-an-hd-kotlin-logo"}

로고는 [여기](https://resources.jetbrains.com/storage/products/kotlin/docs/kotlin_logos.zip)에서 다운로드할 수 있습니다. 
로고를 사용할 때는 압축 파일 내부의 `guidelines.pdf`에 명시된 간단한 규칙과 [Kotlin 브랜드 사용 가이드라인](https://kotlinfoundation.org/guidelines/)을 준수해 주세요.

자세한 내용은 [Kotlin 브랜드 애셋](kotlin-brand-assets.md) 페이지를 참고하세요.