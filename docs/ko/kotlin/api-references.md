[//]: # (title: API 레퍼런스)

<web-summary>표준 라이브러리, 코루틴, 직렬화 등을 포함한 공식 Kotlin 라이브러리 및 도구의 API 문서를 살펴보세요.</web-summary>

Kotlin API 레퍼런스 페이지에 오신 것을 환영합니다. 여기에서 공식 Kotlin 라이브러리 및 도구에 대한 API 문서 링크를 확인할 수 있습니다.

> Kotlin 멀티플랫폼 라이브러리를 찾고 계신다면, [**klibs.io**](https://klibs.io)에서 찾아보세요.
>
{style="tip"}

<p></p> <!-- workaround for MRK057: Paragraph can only contain inline elements -->
<panels columns="2">
    <panel>
        <title>표준 라이브러리 (stdlib)</title>
        <p>Kotlin 표준 라이브러리는 컬렉션, 텍스트 및 문자열 처리, 범위(range), 시퀀스 등 필수적인 API를 포함하여 Kotlin 프로그래밍을 위한 핵심 기능을 제공합니다. 이 라이브러리는 플랫폼별 API를 확장하고, 이를 다루기 위한 Kotlin 중심의 API를 제공합니다.</p>
        <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/JetBrains/kotlin">GitHub에서 보기</a><br/><br/>
        <a href="https://kotlinlang.org/api/core/kotlin-stdlib/" as="button" icon="arrow-right" icon-position="right">API 둘러보기</a>
    </panel>
    <panel>
        <title>테스트 라이브러리 (kotlin.test)</title>
        <p>공통 테스트 어노테이션과 유틸리티 함수를 제공하는 멀티플랫폼 테스트 라이브러리입니다. 각 플랫폼의 인기 있는 테스트 프레임워크와의 통합을 지원하며, Kotlin 생태계 전반에 걸쳐 통합된 테스트 경험을 제공합니다.</p>
        <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/JetBrains/kotlin">GitHub에서 보기</a><br/><br/>
        <a href="https://kotlinlang.org/api/core/kotlin-test/" as="button" icon="arrow-right" icon-position="right">API 둘러보기</a>
    </panel>
    <panel>
        <title>코루틴 (kotlinx.coroutines)</title>
        <p>Kotlin 코루틴을 사용한 비동기 프로그래밍을 위한 강력한 라이브러리입니다. 구조화된 동시성(structured concurrency), 비동기 스트림, 뮤텍스(mutex) 및 세마포어(semaphore)와 같은 동기화 프리미티브, 테스트 등을 지원하는 도구를 제공합니다.</p>
        <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/Kotlin/kotlinx.coroutines">GitHub에서 보기</a><br/><br/>
        <a href="https://kotlinlang.org/api/kotlinx.coroutines/" as="button" icon="arrow-right" icon-position="right">API 둘러보기</a>
    </panel>
    <panel>
        <title>직렬화 (kotlinx.serialization)</title>
        <p>멀티플랫폼 직렬화 라이브러리입니다. Kotlin 객체를 JSON, CBOR, Protocol Buffers와 같은 다양한 형식으로 상호 변환할 수 있는 타입 안전하고 컴파일 타임에 작동하는 메커니즘을 제공합니다.</p>
        <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/Kotlin/kotlinx.serialization">GitHub에서 보기</a><br/><br/>
        <a href="https://kotlinlang.org/api/kotlinx.serialization/" as="button" icon="arrow-right" icon-position="right">API 둘러보기</a>
    </panel>
    <panel>
        <title>Kotlin I/O 라이브러리 (kotlinx-io)</title>
        <p>저수준 I/O 작업을 위한 멀티플랫폼 라이브러리입니다. 바이너리 스트림 및 버퍼를 읽고 쓰기 위한 추상화를 정의하며, 모든 Kotlin 플랫폼에서 효율적이고 이식 가능하도록 설계되었습니다.</p>
        <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/Kotlin/kotlinx-io">GitHub에서 보기</a><br/><br/>
        <a href="https://kotlinlang.org/api/kotlinx-io/" as="button" icon="arrow-right" icon-position="right">API 둘러보기</a>
    </panel>
    <panel>
        <title>날짜 및 시간 (kotlinx-datetime)</title>
        <p>캘린더 기반 계산을 위한 멀티플랫폼 라이브러리입니다. 날짜 값의 표현을 제공하며 시간대(timezone)별 작업을 지원합니다.</p>
        <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/Kotlin/kotlinx-datetime">GitHub에서 보기</a><br/><br/>
        <a href="https://kotlinlang.org/api/kotlinx-datetime/" as="button" icon="arrow-right" icon-position="right">API 둘러보기</a>
    </panel>
    <panel>
        <title>불변 컬렉션 (kotlinx.collections.immutable)</title>
        <p>불변 및 영속적(persistent) 컬렉션 인터페이스와 구현을 제공하는 멀티플랫폼 라이브러리입니다. 버전 간에 구조를 공유하는 효율적인 copy-on-write 연산을 제공하므로, 컬렉션을 업데이트할 때 전체를 복사하지 않습니다.</p>
        <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/Kotlin/kotlinx.collections.immutable">GitHub에서 보기</a><br/><br/>
        <a href="https://kotlinlang.org/api/kotlinx.collections.immutable/" as="button" icon="arrow-right" icon-position="right">API 둘러보기</a>
    </panel>
    <panel>
        <title>Kotlin Gradle 플러그인 (kotlin-gradle-plugin)</title>
        <p>Kotlin 코드의 컴파일, 테스트 및 패키징을 위한 Kotlin Gradle 플러그인입니다. 이 플러그인들은 JVM 및 멀티플랫폼 빌드를 간소화하고, 의존성을 관리하며, IDE 및 CI 시스템과 통합됩니다.</p>
        <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/JetBrains/kotlin/tree/master/libraries/tools/kotlin-gradle-plugin">GitHub에서 보기</a><br/><br/>
        <a href="https://kotlinlang.org/api/kotlin-gradle-plugin/" as="button" icon="arrow-right" icon-position="right">API 둘러보기</a>
    </panel>
    <panel>
        <title>Ktor</title>
        <p>Kotlin을 사용하여 연결된 시스템에서 비동기 클라이언트 및 서버를 구축하기 위한 프레임워크입니다. Ktor는 확장성과 유연성을 고려하여 설계되었으며, 논블로킹(non-blocking) I/O 및 구조화된 동시성을 위해 코루틴과 깊이 통합되어 있습니다.</p>
        <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/ktorio/ktor">GitHub에서 보기</a><br/><br/>
        <a href="https://api.ktor.io/" as="button" icon="arrow-right" icon-position="right">API 둘러보기</a>
    </panel>
    <panel>
        <title>JVM 메타데이터 (kotlin-metadata-jvm)</title>
        <p>JVM 클래스 파일에 저장된 Kotlin 메타데이터를 읽고 쓰기 위한 라이브러리입니다. 주로 어노테이션 프로세서, 정적 분석기, 컴파일러 플러그인과 같은 도구에서 사용됩니다.</p>
        <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/JetBrains/kotlin/tree/master/libraries/kotlinx-metadata">GitHub에서 보기</a><br/><br/>
        <a href="https://kotlinlang.org/api/kotlinx-metadata-jvm/" as="button" icon="arrow-right" icon-position="right">API 둘러보기</a>
    </panel>
    <panel>
        <title>Compose Multiplatform Material3</title>
        <p>Material Design 3 컴포넌트를 사용하여 사용자 인터페이스를 구축하기 위한 멀티플랫폼 라이브러리입니다. API 레퍼런스에는 컴포저블(composable)을 미리 볼 수 있는 Material 3 컴포넌트 갤러리가 포함되어 있습니다.</p>
        <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/JetBrains/compose-multiplatform-core/tree/jb-main/compose/material3">GitHub에서 보기</a><br/><br/>
        <a href="https://kotlinlang.org/api/compose-multiplatform/material3/" as="button" icon="arrow-right" icon-position="right">API 둘러보기</a>
    </panel>
</panels>