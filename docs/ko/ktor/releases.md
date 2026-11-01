[//]: # (title: Ktor 릴리스)

<show-structure for="chapter" depth="2"/>

Ktor는 [시맨틱 버저닝(Semantic Versioning)](https://semver.org/)을 따릅니다.

- _메이저 버전_ (x.0.0)은 호환되지 않는 API 변경 사항을 포함합니다.
- _마이너 버전_ (x.y.0)은 하위 호환성을 유지하는 새로운 기능을 제공합니다.
- _패치 버전_ (x.y.z)은 하위 호환성을 유지하는 버그 수정을 포함합니다.

메이저 및 마이너 릴리스마다 새로운 기능이 정식 출시되기 전에 사용해 볼 수 있도록 여러 프리뷰(EAP) 버전도 함께 제공됩니다. 자세한 내용은 [Early Access Program](https://ktor.io/eap/)을 참조하세요.

## Gradle 플러그인 {id="gradle"}

[Gradle Ktor 플러그인](https://github.com/ktorio/ktor-build-plugins)과 프레임워크는 동일한 릴리스 주기를 갖습니다.
모든 플러그인 릴리스는 [Gradle Plugin Portal](https://plugins.gradle.org/plugin/io.ktor.plugin)에서 확인할 수 있습니다.

## IntelliJ Ultimate 플러그인 {id="intellij"}

[IntelliJ Ktor 플러그인](https://www.jetbrains.com/help/idea/ktor.html)은 Ktor 프레임워크와 독립적으로 릴리스되며,
[IntelliJ IDEA Ultimate](https://www.jetbrains.com/idea/download/other.html)와 동일한 릴리스 주기를 따릅니다.

### 새 릴리스로 업데이트 {id="update"}

IntelliJ Ktor 플러그인을 사용하면 Ktor 프로젝트를 최신 버전으로 마이그레이션할 수 있습니다.
자세한 내용은 [프로젝트 마이그레이션](https://www.jetbrains.com/help/idea/ktor.html#migrate) 섹션에서 확인할 수 있습니다.

## 릴리스 상세 정보 {id="release-details"}

다음 표에는 최신 Ktor 릴리스의 상세 정보가 나열되어 있습니다.

<table>

<tr>
<td>버전</td><td>릴리스 날짜</td><td>주요 변경 사항</td>
</tr>

<tr>
<td>3.6.1</td><td>2026년 10월 30일</td><td>
<p>
연결 관리, 요청 취소, 스트리밍, WebSocket 및 플랫폼별 엔진과 관련된 다양한 문제를 해결하고, 라우팅, HTTP 표준 준수 및 리소스 처리를 개선한 패치 릴리스입니다.
</p>
<var name="version" value="3.6.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>3.6.0</td><td>2026년 9월 17일</td><td>
<p>
Netty용 실험적 HTTP/3 지원, Kotlin Multiplatform용 기본 클라이언트 엔진, JVM WebRTC 지원을 추가하고 클라이언트와 서버 전반에 걸쳐 다양한 기능과 개선 사항을 도입한 마이너 릴리스입니다.
</p>
자세한 내용은 <Links href="whats-new-360.md" summary="">Ktor 3.6.0의 새로운 기능</Links>을 참조하세요.
<var name="version" value="3.6.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>3.5.2</td><td>2026년 8월 4일</td><td>
<p>
안정성과 성능에 중점을 둔 패치 릴리스로, 향상된 속도 제한(rate limiting) 지원, 텍스트 처리 성능 복원, I/O 처리, OpenAPI 및 구성 문제 수정을 포함합니다.
</p>
<var name="version" value="3.5.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>3.5.1</td><td>2026년 6월 26일</td><td>
<p>
OpenAPI 플러그인 개선, 인증 KDoc 문서 확장, Kotlin 2.4 컴파일러 호환성, HTTP 및 캐싱 동작, 인증, WebRTC 안정성, JVM/Darwin/Android/Windows 전반의 플랫폼별 문제를 아우르는 광범위한 버그 수정을 포함한 패치 릴리스입니다.
</p>
<var name="version" value="3.5.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>3.5.0</td><td>2026년 5월 15일</td><td>
<p>
RFC 7616 다이제스트 인증(Digest authentication) 지원, OkHttp 및 Apache5를 위한 커스텀 DNS 리졸버 구성, 요청 파라미터 헬퍼 함수를 도입하고 구성, 세션, JavaScript 호환성 전반을 개선한 마이너 릴리스입니다.
자세한 내용은 <Links href="whats-new-350.md" summary="">Ktor 3.5.0의 새로운 기능</Links>을 참조하세요.
</p>
<var name="version" value="3.5.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>3.4.3</td><td>2026년 4월 22일</td><td>
<p>
안정성에 중점을 둔 패치 릴리스로, OpenAPI 스키마 추론, 클라이언트 엔진 수명 주기 문제 및 여러 동시성 및 플랫폼별 버그를 수정했습니다.
</p>
<var name="version" value="3.4.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>3.4.2</td><td>2026년 3월 27일</td><td>
<p>
할당 최적화와 WebSocket 수정을 통해 클라이언트 및 엔진 성능을 개선하고, OpenAPI, 로깅, GraalVM 호환성, Netty, Darwin, 의존성 주입, 압축, 인증서 고정(certificate pinning), Kotlin/Native 전반의 광범위한 문제를 해결한 패치 릴리스입니다.
</p>
<var name="version" value="3.4.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>3.4.1</td><td>2026년 3월 4일</td><td>
<p>
<a href="whats-new-340.md#use-engine-dispatcher">3.4.0에서 발생한 Flow 불변성 오류(Flow invariant error)</a> 해결 및 올바른 <code>StreamResetException</code> 전파 복구를 포함한 중요한 회귀 버그 수정 패치 릴리스입니다. 또한 성능 개선, OpenAPI 기능 강화 및 여러 엔진과 플랫폼에 걸친 안정성 수정이 포함되어 있습니다.
</p>
<var name="version" value="3.4.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>3.4.0</td><td>2026년 1월 23일</td><td>
<p>
런타임 생성 OpenAPI 사양, Zstd 및 Jackson 3 지원, OkHttp용 전이중 스트리밍(duplex streaming)을 도입하고 프레임워크 전반의 신뢰성을 강화하는 수십 가지 버그를 수정한 마이너 릴리스입니다.
</p>
<var name="version" value="3.4.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>3.3.3</td><td>2025년 11월 26일</td><td>
<p>
Jetty Client에서 HTTP/2 over cleartext(h2c) 지원을 추가하고 로깅 및 OpenAPI 생성을 개선했으며 엔진, SSE 처리, 중복 응답, HTTP/2 헤더 및 클라이언트 캐싱의 버그를 수정한 패치 릴리스입니다.
</p>
<var name="version" value="3.3.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>3.3.2</td><td>2025년 11월 5일</td><td>
<p>
Darwin용 SOCKS 프록시 지원을 추가하고 WebRTC 클라이언트 타깃 및 Java 프록시 처리를 개선했으며 HTTP 재시도, OpenAPI, 캐싱 및 Android 기반 Netty의 여러 문제를 수정한 패치 릴리스입니다.
</p>
<var name="version" value="3.3.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>3.3.1</td><td>2025년 10월 8일</td><td>
<p>
Kotlin을 2.2.20으로 업데이트하고 Content-Length 파싱 오류, <code>ClientSSESession</code>의 직렬화 도구 누락, Netty 구성 및 종료 버그를 포함한 여러 문제를 수정했으며 bootJar 내 정적 리소스 제공 지원을 추가한 패치 릴리스입니다.
</p>
<var name="version" value="3.3.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>3.3.0</td><td>2025년 9월 11일</td><td>
<p>
실험적 OpenAPI 생성 프리뷰, 개선된 정적 콘텐츠 처리, Android 및 JS/Wasm용 WebRTC 클라이언트, Jetty, OkHttp 및 Kotlin 2.2 업그레이드와 같은 주요 기능을 도입한 마이너 릴리스입니다. 자세한 내용은 <Links href="whats-new-330.md" summary="">Ktor 3.3.0의 새로운 기능</Links>을 참조하세요.
</p>
<var name="version" value="3.3.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>3.2.3</td><td>2025년 7월 29일</td><td>
<p>
YAML 구성 처리, DI 해결(resolution), Wasm/JS 안정성 개선 사항과 함께 멀티파트 파싱, CIO <code>100 Continue</code> 응답 포맷팅, <code>ByteReadChannel</code>의 무한 읽기 루프 및 서버 종료 문제 수정을 포함한 패치 릴리스입니다.
</p>
<var name="version" value="3.2.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>3.2.2</td><td>2025년 7월 14일</td><td>
<p>
SSE 필드 직렬화 순서를 개선하고 CORS 프리플라이트 처리, 테스트 애플리케이션 스트리밍, 구성 역직렬화 버그, 여러 플랫폼에 걸친 헤더 누락(wasmJs 및 Darwin 타깃에 영향을 미친 3.2.1의 회귀 버그 포함) 문제를 해결한 패치 릴리스입니다.
</p>
<var name="version" value="3.2.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>3.2.1</td><td>2025년 7월 4일</td><td>
<p>
시간 API, 템플릿 처리, 게시(publishing) 기능 개선과 함께 플러그인 동작, Netty, OkHttp 및 3.2.0에서 발생한 시작(startup) 관련 중요 버그 수정을 포함한 패치 릴리스입니다.
</p>
<var name="version" value="3.2.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>3.2.0</td><td>2025년 6월 12일</td><td>
<p>
타입 지정 구성 역직렬화(typed configuration deserialization), 새로운 의존성 주입 및 HTMX 모듈, Gradle 버전 카탈로그 지원, suspend 모듈 지원을 도입한 마이너 릴리스입니다. 자세한 내용은 <Links href="whats-new-320.md" summary="">Ktor 3.2.0의 새로운 기능</Links>을 참조하세요.
</p>
<var name="version" value="3.2.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>3.1.3</td><td>2025년 5월 5일</td><td><p>
더 빠른 바이트 연산 및 멀티파트 처리, 안전한 토큰 갱신 처리와 같은 성능 개선을 포함한 패치 릴리스입니다. 또한 메트릭의 메모리 문제를 수정하고, 헤더 동작을 개선했으며, WebSocket, OkHttp, Apache5, Netty 전반의 버그를 해결하고 Kotlin 2.1.0 지원을 위해 JTE를 업데이트했습니다.
</p>
<var name="version" value="3.1.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>3.1.2</td><td>2025년 3월 27일</td><td><p>
Kotlin을 2.1.20으로 업데이트하고 Base64 디코딩, 인증 토큰 초기화, Android 서버 시작 오류, WebSocket 헤더 포맷팅, SSE 세션 취소를 비롯한 다양한 문제를 수정한 패치 릴리스입니다.
</p>
<var name="version" value="3.1.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>3.1.1</td><td>2025년 2월 24일</td><td><p>
로깅을 개선하고 WebSocket 타임아웃 처리를 수정한 패치 릴리스입니다. HTTP 캐시 불일치, 폼 데이터 복사 오류, gzip 처리 크래시 및 세그먼트 풀 손상을 일으키는 동시성 문제를 포함한 여러 버그를 해결했습니다.
</p>
<var name="version" value="3.1.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>3.1.0</td><td>2025년 2월 11일</td><td><p>
다양한 SSE 기능과 확장된 CIO 엔진 및 WebSocket 지원을 도입한 마이너 릴리스입니다. 플랫폼 호환성, 로깅, 인증을 강화하는 동시에 바이트 채널 처리, HTTP 요청 실패, 동시성 문제와 관련된 주요 버그를 수정했습니다.
</p>
<var name="version" value="3.1.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>3.0.3</td><td>2024년 12월 18일</td><td><p>
<code>browserProductionWebpack</code>의 빌드 오류, gzip 압축 콘텐츠 처리, <code>FormFieldLimit</code> 구성 덮어쓰기 문제 수정을 포함하여 다양한 버그를 수정한 패치 릴리스입니다. 또한 코어 성능 개선과 적절한 테스트 애플리케이션 종료 처리도 포함되어 있습니다.
</p>
<var name="version" value="3.0.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>3.0.2</td><td>2024년 12월 4일</td><td><p>
응답 손상, 잘린 본문(truncated body), 연결 처리 및 잘못된 헤더와 관련된 여러 버그를 해결하고 Android를 위한 확장된 바이너리 인코딩 지원 및 성능 향상을 포함한 패치 릴리스입니다.
</p>
<var name="version" value="3.0.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>2.3.13</td><td>2024년 11월 20일</td><td><p>
<code>watchosDeviceArm64</code> 타깃 지원 추가를 포함하여 버그 수정, 보안 패치 및 개선 사항이 적용된 패치 릴리스입니다.
</p>
<var name="version" value="2.3.13"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>3.0.1</td><td>2024년 10월 29일</td><td><p>
클라이언트 및 서버 로깅 개선과 다양한 버그 수정을 포함한 패치 릴리스입니다.
</p>
<var name="version" value="3.0.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0</td><td>2024년 10월 9일</td><td><p>
Android Native 타깃 지원 추가를 비롯한 다양한 개선 사항과 버그 수정이 포함된 메이저 릴리스입니다. 호환성을 깨뜨리는 주요 변경 사항(breaking changes)에 대한 자세한 내용은 <Links href="migrating-3.md" summary="">마이그레이션 가이드</Links>를 참조하세요.
</p>
<var name="version" value="3.0.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-rc-2</td><td>2024년 10월 2일</td><td><p>
주요 변경 사항(breaking changes)을 동반한 다양한 개선 사항, 버그 수정 및 XML 멀티플랫폼 지원과 같은 기능을 포함한 메이저 릴리스 후보(RC) 버전입니다.
</p>
<var name="version" value="3.0.0-rc-2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-rc-1</td><td>2024년 9월 9일</td><td><p>
중요한 개선 사항과 버그 수정이 포함된 메이저 릴리스 후보(RC) 버전입니다. 이번 업데이트에서는 하위 호환성이 향상되었으며 확장된 <code>staticZip</code> 지원이 제공됩니다.
</p>
<var name="version" value="3.0.0-rc-1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-beta-2</td><td>2024년 7월 15일</td><td><p>
SSE 지원 개선 및 Kotlin/Wasm용 Ktor 클라이언트를 포함하여 다양한 개선 사항과 버그 수정이 적용된 메이저 시험판(pre-release) 버전입니다.
</p>
<var name="version" value="3.0.0-beta-2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>2.3.12</td><td>2024년 6월 20일</td><td><p>
Ktor Core 및 Ktor Server의 버그 수정뿐 아니라 Netty 및 OpenAPI 버전 업데이트를 포함한 패치 릴리스입니다.
</p>
<var name="version" value="2.3.12"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>2.3.11</td><td>2024년 5월 9일</td><td><p>
Test Client의 엔진에 소켓 타임아웃을 적용하기 위한 버그 수정을 포함한 패치 릴리스입니다.
</p>
<var name="version" value="2.3.11"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>2.3.10</td><td>2024년 4월 8일</td><td><p>
CallLogging 및 SSE 서버 플러그인에 대한 다양한 버그 수정, Android 클라이언트 로깅 개선 등을 포함한 패치 릴리스입니다.
</p>
<var name="version" value="2.3.10"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>2.3.9</td><td>2024년 3월 4일</td><td><p>
ContentNegotiation 클라이언트 플러그인의 버그 수정 및 HTTP를 통한 보안 쿠키 전송 지원이 추가된 패치 릴리스입니다.
</p>
<var name="version" value="2.3.9"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>2.3.8</td><td>2024년 1월 31일</td><td><p>
URLBuilder, CORS 및 WebSocket 플러그인에 대한 다양한 버그 수정을 포함한 패치 릴리스입니다.
</p>
<var name="version" value="2.3.8"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>2.3.7</td><td>2023년 12월 7일</td><td>
<p>
ContentNegotiation, WebSockets 및 Native Server의 메모리 사용량에 대한 버그 수정을 포함한 패치 릴리스입니다.
</p>
<var name="version" value="2.3.7"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-beta-1</td><td>2023년 11월 23일</td><td>
<p>
클라이언트 및 서버 SSE 지원을 포함하여 다양한 개선 사항과 버그 수정이 적용된 메이저 시험판(pre-release) 버전입니다.
</p>
<var name="version" value="3.0.0-beta-1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>2.3.6</td><td>2023년 11월 7일</td><td>
<p>
2.3.5에서 발생한 주요 변경 사항(breaking change)에 대한 수정 및 기타 다양한 버그 수정을 포함한 패치 릴리스입니다.
</p>
<var name="version" value="2.3.6"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>2.3.5</td><td>2023년 10월 5일</td><td>
<p>
Darwin 및 Apache5 엔진 구성 관련 수정을 포함한 패치 릴리스입니다.
</p>
<var name="version" value="2.3.5"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>2.3.4</td><td>2023년 8월 31일</td><td>
<p>
HTTP Cookie 헤더 및 NoTransformationFoundException 오류에 대한 버그 수정을 포함한 패치 릴리스입니다.
</p>
<var name="version" value="2.3.4"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>2.3.3</td><td>2023년 8월 1일</td><td>
<p>
<code>linuxArm64</code>에 대한 클라이언트 및 서버 지원 추가와 다양한 버그 수정을 포함한 패치 릴리스입니다.
</p>
<var name="version" value="2.3.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>2.3.2</td><td>2023년 6월 28일</td><td>
<p>
Kotlin 버전을 <code>1.8.22</code>로 업그레이드하고 다양한 버그를 수정한 패치 릴리스입니다.
</p>
<var name="version" value="2.3.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>2.3.1</td><td>2023년 5월 31일</td><td>
<p>
서버 구성 개선 및 다양한 버그 수정을 포함한 패치 릴리스입니다.
</p>
<var name="version" value="2.3.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>2.3.0</td><td>2023년 4월 19일</td><td>
<p>
다중 구성 파일 지원, 라우팅의 정규식 패턴 지원 등을 추가한 기능 릴리스입니다.
</p>
<var name="version" value="2.3.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>2.2.4</td><td>2023년 2월 28일</td><td>
<p>
HTTP 클라이언트, 라우팅 및 ContentNegotiation의 다양한 버그 수정을 포함한 패치 릴리스입니다.
</p>
<var name="version" value="2.2.4"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>2.2.3</td><td>2023년 1월 31일</td><td>
<p>
OAuth2 멀티플랫폼 기능 및 다양한 버그 수정을 포함한 패치 릴리스입니다.
</p>
<var name="version" value="2.2.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>2.2.2</td><td>2023년 1월 3일</td><td>
<p>
<code>2.2.1</code>에 대한 버그 수정, Swagger 플러그인 개선 및 수정 사항 등을 포함한 패치 릴리스입니다.
</p>
<var name="version" value="2.2.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>2.2.1</td><td>2022년 12월 7일</td><td>
<p>
<code>2.2.0</code>의 <code>java.lang.NoClassDefFoundError: kotlinx/atomicfu/AtomicFU</code> 오류를 수정한 패치 릴리스입니다.
</p>
<var name="version" value="2.2.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>2.2.0</td><td>2022년 12월 7일</td><td>
<p>
Swagger UI 호스팅, 새 플러그인 API, 세션용 멀티플랫폼 지원 등을 포함한 복합 기능 릴리스입니다.
자세한 내용은 <Links href="migration-to-22x.md" summary="">2.0.x에서 2.2.x로 마이그레이션</Links> 가이드를 참조하세요.
</p>
<var name="version" value="2.2.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>2.1.3</td><td>2022년 10월 26일</td><td>
<p>
다양한 버그 수정을 포함한 패치 릴리스입니다.
</p>
<var name="version" value="2.1.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>2.1.2</td><td>2022년 9월 29일</td><td>
<p>
라우팅, 테스팅 엔진 및 Ktor 클라이언트의 버그 수정을 포함한 패치 릴리스입니다.
</p>
<var name="version" value="2.1.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>2.1.1</td><td>2022년 9월 6일</td><td>
<p>
Ktor 클라이언트 및 서버의 다양한 버그 수정을 포함한 패치 릴리스입니다.
</p>
<var name="version" value="2.1.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>2.1.0</td><td>2022년 8월 11일</td><td>
<p>
YAML 구성 지원 및 다양한 개선 사항과 버그 수정을 추가한 마이너 릴리스입니다.
</p>
<var name="version" value="2.1.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>2.0.3</td><td>2022년 6월 28일</td><td>
<p>
버그 수정 및 <code>kotlinx.coroutines</code> 버전을 <code>1.6.2</code>로 업그레이드한 패치 릴리스입니다.
</p>
<var name="version" value="2.0.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>2.0.2</td><td>2022년 5월 27일</td><td>
<p>
다양한 개선 사항, 버그 수정 및 의존성 버전 업그레이드를 포함한 패치 릴리스입니다.
</p>
<var name="version" value="2.0.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>2.0.1</td><td>2022년 4월 28일</td><td>
<p>
다양한 버그 수정과 Kotlin 버전을 <code>1.6.21</code>로 업데이트한 패치 릴리스입니다.
</p>
<var name="version" value="2.0.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>2.0.0</td><td>2022년 4월 11일</td><td>
<p>
업데이트된 API 문서와 다양한 새로운 기능을 포함한 메이저 릴리스입니다. 주요 변경 사항과 <code>1.x.x</code>에서
마이그레이션하는 방법에 대한 자세한 내용은 <Links href="migration-to-20x.md" summary="">마이그레이션 가이드</Links>를 참조하세요.
</p>
<var name="version" value="2.0.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

<tr>
<td>1.6.8</td><td>2022년 3월 15일</td><td>
<p>
의존성 버전 업그레이드를 포함한 패치 릴리스입니다.
</p>
<var name="version" value="1.6.8"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 보기</a>
</p>
</td>
</tr>

</table>