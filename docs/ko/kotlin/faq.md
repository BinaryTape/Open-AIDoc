[//]: # (title: FAQ)

<web-summary>Kotlin은 JetBrains에서 개발한 간결한 멀티플랫폼 프로그래밍 언어입니다.</web-summary>

### Kotlin이란 무엇인가요? {id="what-is-kotlin"}

Kotlin은 JVM, Android, JavaScript, Wasm 및 Native를 대상으로 하는 오픈 소스 정적 타입(statically typed) 프로그래밍 언어입니다. 
[JetBrains](https://www.jetbrains.com)에서 개발했습니다. 이 프로젝트는 2010년에 시작되었으며 초기부터 오픈 소스로 공개되었습니다. 
공식적인 첫 1.0 릴리스는 2016년 2월이었습니다. 

### Kotlin의 현재 버전은 무엇인가요? {id="what-is-the-current-version-of-kotlin"}

현재 릴리스된 버전은 %kotlinVersion%이며, %kotlinReleaseDate%에 게시되었습니다.  
더 자세한 정보는 [GitHub](https://github.com/jetbrains/kotlin)에서 확인하실 수 있습니다.

### Kotlin은 무료인가요? {id="is-kotlin-free"}

네. Kotlin은 무료이며, 지금까지 그래왔고 앞으로도 무료일 것입니다. Apache 2.0 라이선스 하에 개발되었으며, 소스 코드는 [GitHub](https://github.com/jetbrains/kotlin)에서 제공됩니다.

### Kotlin은 객체 지향 언어인가요, 아니면 함수형 언어인가요? {id="is-kotlin-an-object-oriented-language-or-a-functional-one"}

Kotlin은 객체 지향 및 함수형 구문을 모두 포함하고 있습니다. OO(객체 지향)와 FP(함수형 프로그래밍) 스타일을 모두 사용할 수 있으며 두 요소의 혼합도 가능합니다. 고차 함수(higher-order functions), 함수 타입(function types), 람다(lambdas)와 같은 기능에 대한 최고 수준의 지원(first-class support)을 제공하므로, 함수형 프로그래밍을 하거나 탐구하고 있다면 Kotlin은 훌륭한 선택입니다.

### Java 프로그래밍 언어보다 Kotlin을 사용했을 때 어떤 장점이 있나요? {id="what-advantages-does-kotlin-give-me-over-the-java-programming-language"}

Kotlin은 더 간결합니다. 대략적으로 코드 줄 수를 약 40% 정도 줄여주는 것으로 추정됩니다. 또한 더 타입 안전(type-safe)합니다. 예를 들어, 널 불허용 타입(non-nullable types) 지원은 애플리케이션이 NPE(NullPointerException)에 노출될 가능성을 줄여줍니다. 스마트 캐스팅(smart casting), 고차 함수(higher-order functions), 확장 함수(extension functions), 수신 객체 지정 람다(lambdas with receivers)를 포함한 다른 기능들은 표현력 있는 코드 작성을 가능하게 할 뿐만 아니라 DSL 생성을 용이하게 합니다.
 
### Kotlin은 Java 프로그래밍 언어와 호환되나요? {id="is-kotlin-compatible-with-the-java-programming-language"}

네. Kotlin은 Java 프로그래밍 언어와 100% 상호운용(interoperable) 가능하며, 기존 코드베이스가 Kotlin과 원활하게 상호작용할 수 있도록 하는 데 중점을 두었습니다. [Java에서 Kotlin 코드를 호출](java-to-kotlin-interop.md)하거나 [Kotlin에서 Java 코드를 호출](java-interop.md)하는 것이 쉽습니다. 이는 도입을 훨씬 쉽고 위험 부담이 적게 만들어 줍니다. 또한 기존 코드의 마이그레이션을 단순화해주는 [IDE 내장 자동 Java-to-Kotlin 변환기](mixing-java-kotlin-intellij.md#convert-java-files-to-kotlin)도 제공됩니다.

### Kotlin을 어디에 사용할 수 있나요? {id="what-can-i-use-kotlin-for"}

Kotlin은 백엔드, 클라이언트 측 웹, Android 또는 멀티플랫폼 라이브러리 등 모든 종류의 개발에 사용할 수 있습니다. 현재 개발 중인 Kotlin/Native를 통해 임베디드 시스템, macOS 및 iOS와 같은 다른 플랫폼도 지원합니다. 사람들은 모바일 및 서버 측 애플리케이션, JavaScript 또는 JavaFX를 사용한 클라이언트 측 개발, 데이터 과학 등 다양한 분야에서 Kotlin을 사용하고 있습니다.

### Android 개발에 Kotlin을 사용할 수 있나요? {id="can-i-use-kotlin-for-android-development"}

네. Kotlin은 Android에서 최우선 지원 언어(first-class language)로 지원됩니다. Basecamp, Pinterest 등 이미 수백 개의 애플리케이션이 Android용 Kotlin을 사용하고 있습니다. 자세한 내용은 [Android 개발 관련 자료](android-overview.md)를 확인하세요.

### 백엔드 개발에 Kotlin을 사용할 수 있나요? {id="can-i-use-kotlin-for-backend-development"}

네. Kotlin은 JVM과 100% 호환되므로 Spring Boot, vert.x 또는 JSF와 같은 기존 프레임워크를 모두 사용할 수 있습니다. 또한 [Ktor](https://github.com/kotlin/ktor)와 같이 Kotlin으로 작성된 전용 프레임워크도 있습니다. 자세한 내용은 [백엔드 개발 개요](server-overview.md)를 확인하세요.

### 웹 개발에 Kotlin을 사용할 수 있나요? {id="can-i-use-kotlin-for-web-development"}

네. 백엔드 웹 개발을 위해 Kotlin은 [Ktor](https://ktor.io/) 및 [Spring](https://spring.io/)과 같은 프레임워크와 잘 작동하여 서버 측 애플리케이션을 효율적으로 구축할 수 있게 해줍니다. 또한 클라이언트 측 웹 개발을 위해 Kotlin/Wasm을 사용할 수 있습니다. [Kotlin/Wasm 시작하기](wasm-get-started.md)를 통해 자세히 알아보세요.

### 데스크톱 개발에 Kotlin을 사용할 수 있나요? {id="can-i-use-kotlin-for-desktop-development"}

네. JavaFX, Swing 등 모든 Java UI 프레임워크를 사용할 수 있습니다. 또한 [TornadoFX](https://github.com/edvin/tornadofx)와 같은 Kotlin 전용 프레임워크도 있습니다. 

### 네이티브 개발에 Kotlin을 사용할 수 있나요? {id="can-i-use-kotlin-for-native-development"}

네. Kotlin의 일부로 Kotlin/Native를 사용할 수 있습니다. 이는 Kotlin을 VM 없이 실행 가능한 네이티브 코드로 컴파일합니다. 대중적인 데스크톱 및 모바일 플랫폼은 물론 일부 IoT 기기에서도 사용해 볼 수 있습니다. 자세한 내용은 [Kotlin/Native 문서](native-overview.md)를 확인하세요.

### 어떤 IDE가 Kotlin을 지원하나요? {id="what-ides-support-kotlin"}

Kotlin은 JetBrains에서 개발한 공식 Kotlin 플러그인을 통해 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/)와 [Android Studio](https://developer.android.com/kotlin/get-started)에서 완벽한 기본(out-of-the-box) 지원을 제공합니다.
또한 [Alpha](components-stability.md#stability-levels-explained) 단계인 Kotlin Language Server를 기반으로 하는 공식 [Visual Studio Code용 Kotlin by JetBrains 확장 프로그램](kotlin-lsp.md#kotlin-in-visual-studio-code)을 설치할 수도 있습니다.

다른 IDE 및 코드 에디터는 커뮤니티에서 지원하는 Kotlin 플러그인만 제공됩니다.

브라우저에서 Kotlin 코드를 작성, 실행 및 공유하려면 [Kotlin Playground](https://play.kotlinlang.org)를 사용해 볼 수도 있습니다.
또한 애플리케이션 컴파일 및 실행을 위한 간단한 지원을 제공하는 [명령줄 컴파일러](command-line.md)도 사용할 수 있습니다.
  
### 어떤 빌드 도구가 Kotlin을 지원하나요? {id="what-build-tools-support-kotlin"}

JVM 측면에서 주요 빌드 도구로는 [Gradle](gradle.md)과 [Maven](maven.md)이 있습니다. 클라이언트 측 JavaScript를 대상으로 하는 일부 빌드 도구도 사용할 수 있습니다. 

### Kotlin은 무엇으로 컴파일되나요? {id="what-does-kotlin-compile-down-to"}

JVM을 대상으로 할 때 Kotlin은 Java와 호환되는 바이트코드를 생성합니다.

JavaScript를 대상으로 할 때 Kotlin은 설정된 타깃에 따라 ES5, ES2015 또는 ES2020 코드를 생성할 수 있습니다. 코드는 AMD 및 CommonJS를 포함한 모듈 시스템과 호환됩니다. 

네이티브를 대상으로 할 때 Kotlin은 (LLVM을 통해) 플랫폼별 코드를 생성합니다. 

### Kotlin은 어떤 버전의 JVM을 대상으로 하나요? {id="which-versions-of-jvm-does-kotlin-target"}

Kotlin은 실행을 위한 JVM 버전을 선택할 수 있게 해줍니다. 기본적으로 Kotlin/JVM 컴파일러는 Java 8 호환 바이트코드를 생성합니다. 최신 버전의 Java에서 제공되는 최적화 기능을 사용하려면 대상 Java 버전을 9에서 26까지 명시적으로 지정할 수 있습니다. 이 경우 결과 바이트코드가 하위 버전에서 실행되지 않을 수 있음에 유의하십시오. [Kotlin 1.5](whatsnew15.md#new-default-jvm-target-1-8)부터 컴파일러는 Java 8 미만 버전과 호환되는 바이트코드 생성 기능을 지원하지 않습니다.

### Kotlin은 어렵나요? {id="is-kotlin-hard"}

Kotlin은 Java, C#, JavaScript, Scala, Groovy와 같은 기존 언어에서 영감을 얻었습니다. 우리는 사람들이 며칠 내로 Kotlin을 읽고 쓸 수 있도록 쉽게 배울 수 있게 만드는 데 주력했습니다. 관용적인(idiomatic) Kotlin을 배우고 고급 기능을 사용하는 데는 시간이 조금 더 걸릴 수 있지만, 전반적으로 복잡한 언어는 아닙니다.  
자세한 정보는 [학습 자료](learning-materials-overview.md)를 확인하세요.
 
### 어떤 회사들이 Kotlin을 사용하고 있나요? {id="what-companies-are-using-kotlin"}
 
Kotlin을 사용하는 회사는 나열하기에 너무 많지만, 블로그 게시물, GitHub 저장소 또는 강연을 통해 Kotlin 사용을 공개적으로 선언한 대표적인 회사로는 [Square](https://medium.com/square-corner-blog/square-open-source-loves-kotlin-c57c21710a17), [Pinterest](https://www.youtube.com/watch?v=mDpnc45WwlI), [Basecamp](https://signalvnoise.com/svn3/using-kotlin-to-make-android-apis-fun-again/) 등이 있습니다.
 
### 누가 Kotlin을 개발하나요? {id="who-develops-kotlin"}

Kotlin은 [JetBrains의 엔지니어 팀(현재 팀 규모 100명 이상)](https://www.jetbrains.com/)에서 개발하고 있습니다. 리드 언어 디자이너는 Michail Zarečenskij입니다. 핵심 팀 외에도 GitHub에 250명 이상의 외부 기여자가 있습니다. 

### Kotlin에 대해 어디서 더 배울 수 있나요? {id="where-can-i-learn-more-about-kotlin"}

시작하기 가장 좋은 곳은 [공식 웹사이트](https://kotlinlang.org)입니다. Kotlin을 시작하려면 [공식 IDE](kotlin-ide.md) 중 하나를 설치하거나 [온라인에서 사용](https://play.kotlinlang.org)해 볼 수 있습니다.

### Kotlin에 관한 책이 있나요? {id="are-there-any-books-on-kotlin"}

Kotlin에 관한 여러 책이 출간되어 있습니다. 그중 일부는 우리가 검토했으며 입문용으로 추천할 만한 목록이 [도서(Books)](books.md) 페이지에 나열되어 있습니다. 더 많은 책을 보려면 커뮤니티에서 관리하는 [kotlin.link](https://kotlin.link/)의 목록을 확인하세요. 

### Kotlin 온라인 강의가 있나요? {id="are-any-online-courses-available-for-kotlin"}

JetBrains Academy의 [Kotlin Core 트랙](https://hyperskill.org/tracks?category=4&utm_source=jbkotlin_hs&utm_medium=referral&utm_campaign=kotlinlang-docs&utm_content=button_1&utm_term=22.03.23)을 통해 실제 작동하는 애플리케이션을 만들면서 Kotlin의 모든 핵심 요소를 배울 수 있습니다.

수강할 수 있는 다른 강의들은 다음과 같습니다:
* [Pluralsight 강의: Getting Started with Kotlin](https://www.pluralsight.com/courses/kotlin-getting-started) (Kevin Jones)
* [O'Reilly 강의: Introduction to Kotlin Programming](https://www.oreilly.com/library/view/introduction-to-kotlin/9781491964125/) (Hadi Hariri)

또한 [YouTube 채널](https://www.youtube.com/c/Kotlin)에서 다른 튜토리얼과 콘텐츠도 확인하실 수 있습니다.

### Kotlin 커뮤니티가 있나요? {id="does-kotlin-have-a-community"}

네! Kotlin은 매우 활발한 커뮤니티를 가지고 있습니다. Kotlin 개발자들은 [Kotlin 포럼](https://discuss.kotlinlang.org), [StackOverflow](https://stackoverflow.com/questions/tagged/kotlin)에서 활동하며, 특히 [Kotlin Slack](https://slack.kotlinlang.org)(2020년 4월 기준 약 30,000명의 회원)에서 활발하게 교류하고 있습니다. 

### Kotlin 관련 이벤트가 있나요? {id="are-there-kotlin-events"}
 
네! 현재 Kotlin에만 집중하는 많은 사용자 그룹(User Groups)과 미트업(Meetups)이 있습니다. [웹사이트에서 목록](https://kotlinlang.org/user-groups/user-group-list.html)을 확인할 수 있습니다. 또한 전 세계적으로 커뮤니티가 주도하는 [Kotlin Nights](https://kotlinlang.org/community/events.html) 행사가 열리고 있습니다.

### Kotlin 컨퍼런스가 있나요? {id="is-there-a-kotlin-conference"}

네! [KotlinConf](https://kotlinconf.com/)는 JetBrains가 주최하는 연례 컨퍼런스로, 전 세계의 개발자, 애호가 및 전문가들이 모여 Kotlin에 대한 지식과 경험을 공유합니다.

기술 세션과 워크숍 외에도 KotlinConf는 참석자들이 동료 Kotliner들과 교류하고 아이디어를 나눌 수 있는 네트워킹 기회, 커뮤니티 상호작용 및 소셜 이벤트를 제공합니다. 이는 Kotlin 생태계 내에서 협업과 커뮤니티 구축을 촉진하는 플랫폼 역할을 합니다.

Kotlin은 전 세계의 다양한 컨퍼런스에서도 다뤄지고 있습니다. [예정된 강연 목록](https://kotlinlang.org/community/talks.html?time=upcoming)을 웹사이트에서 확인할 수 있습니다.

### Kotlin 소셜 미디어가 있나요? {id="is-kotlin-on-social-media"}

네. 
[Kotlin YouTube 채널](https://www.youtube.com/c/Kotlin)을 구독하고 [Twitter](https://twitter.com/kotlin) 또는 [Bluesky](https://bsky.app/profile/kotlinlang.org)에서 Kotlin을 팔로우하세요.

### 다른 온라인 Kotlin 리소스가 있나요? {id="any-other-online-kotlin-resources"}

웹사이트에는 커뮤니티 멤버들이 작성한 [Kotlin Digests](https://kotlin.link), [뉴스레터](http://kotlinweekly.net), [팟캐스트](https://talkingkotlin.com) 등을 포함한 다양한 [온라인 리소스](https://kotlinlang.org/community/)가 있습니다.

### HD Kotlin 로고는 어디서 구할 수 있나요? {id="where-can-i-get-an-hd-kotlin-logo"}

로고는 [여기](https://resources.jetbrains.com/storage/products/kotlin/docs/kotlin_logos.zip)에서 다운로드할 수 있습니다. 로고를 사용할 때는 아카이브 내의 `guidelines.pdf`에 있는 간단한 규칙과 [Kotlin 브랜드 사용 가이드라인](https://kotlinfoundation.org/guidelines/)을 준수해 주세요.

더 자세한 정보는 [Kotlin 브랜드 자산](kotlin-brand-assets.md) 페이지를 확인하세요.