[//]: # (title: Ktor 릴리스)

<show-structure for="chapter" depth="2"/>

Ktor는 [유의적 버전(Semantic Versioning)](https://semver.org/)을 따릅니다:

- _메이저 버전_ (x.0.0)은 호환되지 않는 API 변경 사항을 포함합니다.
- _마이너 버전_ (x.y.0)은 하위 호환되는 새로운 기능을 제공합니다.
- _패치 버전_ (x.y.z)은 하위 호환되는 수정 사항을 포함합니다.

각 메이저 및 마이너 릴리스에 대해, 새로운 기능이 정식 출시되기 전에 미리 사용해 볼 수 있도록 여러 프리뷰(EAP) 버전도 배포합니다. 자세한 내용은 [조기 액세스 프로그램(Early Access Program)](https://ktor.io/eap/)을 참조하세요.

## Gradle 플러그인 {id="gradle"}

[Gradle Ktor 플러그인](https://github.com/ktorio/ktor-build-plugins)과 프레임워크는 동일한 릴리스 주기를 가집니다.
모든 플러그인 릴리스는 [Gradle 플러그인 포털](https://plugins.gradle.org/plugin/io.ktor.plugin)에서 확인할 수 있습니다.

## IntelliJ Ultimate 플러그인 {id="intellij"}

[IntelliJ Ktor 플러그인](https://www.jetbrains.com/help/idea/ktor.html)은 Ktor 프레임워크와 독립적으로 릴리스되며,
[IntelliJ IDEA Ultimate](https://www.jetbrains.com/idea/download/other.html)과 동일한 릴리스 주기를 따릅니다.

### 새 릴리스로 업데이트 {id="update"}

IntelliJ Ktor 플러그인을 사용하여 Ktor 프로젝트를 최신 버전으로 마이그레이션할 수 있습니다.
자세한 내용은 [프로젝트 마이그레이션(Migrate projects)](https://www.jetbrains.com/help/idea/ktor.html#migrate) 섹션에서 확인할 수 있습니다.

## 릴리스 세부 정보 {id="release-details"}

다음 표는 최신 Ktor 릴리스의 세부 정보를 나열합니다.

<table>

<tr>
<td>버전</td><td>릴리스 날짜</td><td>주요 내용</td>
</tr>

<tr>
<td>3.5.1</td><td>2026년 6월 26일</td><td>
<p>
OpenAPI 플러그인 개선 사항, 확장된 인증 KDoc 문서, 그리고 Kotlin 2.4 컴파일러 호환성, HTTP 및 캐싱 동작, 인증, WebRTC 안정성, JVM, Darwin, Android 및 Windows 전반의 플랫폼 특정 문제를 해결한 광범위한 버그 수정을 포함한 패치 릴리스입니다.
</p>
<var name="version" value="3.5.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>3.5.0</td><td>2026년 5월 15일</td><td>
<p>
RFC 7616 다이제스트 인증(Digest authentication) 지원, OkHttp 및 Apache5를 위한 커스텀 DNS 리졸버 구성, 요청 파라미터 헬퍼 함수, 그리고 구성, 세션 및 JavaScript 호환성 전반의 기타 개선 사항을 도입한 마이너 릴리스입니다.
자세한 내용은 <Links href="/ktor/whats-new-350" summary="undefined">Ktor 3.5.0의 새로운 기능</Links>을 참조하세요.
</p>
<var name="version" value="3.5.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>3.4.3</td><td>2026년 4월 22일</td><td>
<p>
OpenAPI 스키마 추론, 클라이언트 엔진 생명주기 문제, 그리고 여러 동시성 및 플랫폼 특정 버그 수정을 포함하여 안정성에 집중한 패치 릴리스입니다.
</p>
<var name="version" value="3.4.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>3.4.2</td><td>2026년 3월 27일</td><td>
<p>
할당 최적화 및 WebSocket 수정을 통해 클라이언트 및 엔진 성능을 개선하고, OpenAPI, 로깅, GraalVM 호환성, Netty, Darwin, 의존성 주입(dependency injection), 압축, 인증서 핀닝(certificate pinning) 및 Kotlin/Native 전반의 광범위한 문제를 해결한 패치 릴리스입니다.
</p>
<var name="version" value="3.4.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>3.4.1</td><td>2026년 3월 4일</td><td>
<p>
<a href="whats-new-340.md#use-engine-dispatcher">엔진 디스패처를 사용한 HttpStatement 실행</a> 문제를 해결하고 적절한 <code>StreamResetException</code> 전파를 복구하는 등 중요한 회귀 문제 수정을 포함한 패치 릴리스입니다. 또한 성능 개선, OpenAPI 강화, 그리고 엔진 및 플랫폼 전반의 여러 안정성 수정을 포함합니다.
</p>
<var name="version" value="3.4.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>3.4.0</td><td>2026년 1월 23일</td><td>
<p>
런타임 생성 OpenAPI 사양, Zstd 및 Jackson 3 지원, OkHttp를 위한 이중 스트리밍(duplex streaming), 그리고 프레임워크 전반의 안정성을 강화하는 수십 가지 버그 수정을 도입한 마이너 릴리스입니다.
</p>
<var name="version" value="3.4.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>3.3.3</td><td>2025년 11월 26일</td><td>
<p>
Jetty Client에서 일반 텍스트 기반 HTTP/2(h2c) 지원을 추가하고, 로깅 및 OpenAPI 생성을 개선하며, 엔진, SSE 처리, 이중 응답(double responses), HTTP/2 헤더 및 클라이언트 캐싱의 버그를 수정한 패치 릴리스입니다.
</p>
<var name="version" value="3.3.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>3.3.2</td><td>2025년 11월 5일</td><td>
<p>
Darwin을 위한 SOCKS 프록시 지원을 추가하고, WebRTC 클라이언트 타겟 및 Java 프록시 처리를 정교화하며, HTTP 재시도, OpenAPI, 캐싱 및 Android 기반 Netty의 여러 문제를 수정한 패치 릴리스입니다.
</p>
<var name="version" value="3.3.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>3.3.1</td><td>2025년 10월 8일</td><td>
<p>
Kotlin을 2.2.20으로 업데이트하고 Content-Length 파싱 오류, <code>ClientSSESession</code>의 누락된 직렬화기(serializer), Netty 구성 및 종료 버그를 포함한 여러 문제를 수정했으며, bootJar 내 정적 리소스 제공 지원을 추가한 패치 릴리스입니다.
</p>
<var name="version" value="3.3.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>3.3.0</td><td>2025년 9월 11일</td><td>
<p>
실험적 OpenAPI 생성 프리뷰, 개선된 정적 콘텐츠 처리, Android 및 JS/Wasm용 WebRTC 클라이언트, Jetty, OkHttp 및 Kotlin 2.2 업그레이드와 같은 주요 기능을 도입한 마이너 릴리스입니다. 자세한 내용은 <Links href="/ktor/whats-new-330" summary="undefined">Ktor 3.3.0의 새로운 기능</Links>을 참조하세요.
</p>
<var name="version" value="3.3.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>3.2.3</td><td>2025년 7월 29일</td><td>
<p>
YAML 구성 처리, DI 해결 및 Wasm/JS 안정성 개선과 더불어 멀티파트 파싱, CIO <code>100 Continue</code> 응답 포맷팅, <code>ByteReadChannel</code>의 무한 읽기 루프 및 서버 종료 문제를 수정한 패치 릴리스입니다.
</p>
<var name="version" value="3.2.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>3.2.2</td><td>2025년 7월 14일</td><td>
<p>
SSE 필드 직렬화 순서를 개선하고 CORS 프리플라이트 처리, 테스트 애플리케이션 스트리밍, 구성 역직렬화 버그, 그리고 wasmJs 및 Darwin 타겟에 영향을 미쳤던 3.2.1의 회귀 문제를 포함하여 여러 플랫폼의 헤더 누락 문제를 해결한 패치 릴리스입니다.
</p>
<var name="version" value="3.2.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>3.2.1</td><td>2025년 7월 4일</td><td>
<p>
시간(time) API, 템플릿 제작 및 발행 기능 개선과 함께 플러그인 동작, Netty, OkHttp 및 3.2.0에서 도입된 시작 관련 문제에 대한 크리티컬 버그 수정을 포함한 패치 릴리스입니다.
</p>
<var name="version" value="3.2.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>3.2.0</td><td>2025년 6월 12일</td><td>
<p>
타입 기반 구성 역직렬화, 새로운 의존성 주입(DI) 및 HTMX 모듈, Gradle 버전 카탈로그 지원, suspend 모듈 지원을 도입한 마이너 릴리스입니다. 자세한 내용은 <Links href="/ktor/whats-new-320" summary="undefined">Ktor 3.2.0의 새로운 기능</Links>을 참조하세요.
</p>
<var name="version" value="3.2.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>3.1.3</td><td>2025년 5월 5일</td><td><p>
더 빠른 바이트 연산 및 멀티파트 처리와 같은 성능 개선, 그리고 더 안전한 토큰 갱신 처리를 포함한 패치 릴리스입니다. 또한 메트릭의 메모리 문제를 수정하고 헤더 동작을 개선했으며 WebSockets, OkHttp, Apache5 및 Netty의 버그를 해결하고, Kotlin 2.1.0 지원을 위해 JTE를 업데이트했습니다.
</p>
<var name="version" value="3.1.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>3.1.2</td><td>2025년 3월 27일</td><td><p>
Kotlin을 2.1.20으로 업데이트하고 Base64 디코딩, 인증 토큰 초기화, Android 서버 시작 오류, WebSocket 헤더 포맷팅 및 SSE 세션 취소를 포함한 다양한 문제를 수정한 패치 릴리스입니다. 
</p>
<var name="version" value="3.1.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>3.1.1</td><td>2025년 2월 24일</td><td><p>
로깅을 개선하고 WebSocket 타임아웃 처리를 수정한 패치 릴리스입니다. HTTP 캐시 불일치, 폼 데이터 복사 오류, gzip 처리 크래시 및 세그먼트 풀 손상을 일으키는 동시성 문제를 포함한 여러 버그를 수정했습니다.
</p>
<var name="version" value="3.1.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>3.1.0</td><td>2025년 2월 11일</td><td><p>
다양한 SSE 기능과 확장된 CIO 엔진 및 WebSocket 지원을 도입한 마이너 릴리스입니다. 플랫폼 호환성, 로깅 및 인증을 강화하는 동시에 바이트 채널 처리, HTTP 요청 실패 및 동시성 문제와 관련된 크리티컬 버그를 수정했습니다.
</p>
<var name="version" value="3.1.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>3.0.3</td><td>2024년 12월 18일</td><td><p>
<code>browserProductionWebpack</code>의 빌드 오류, gzip 콘텐츠 처리 및 <code>FormFieldLimit</code> 구성 덮어쓰기 수정을 포함한 다양한 버그 수정을 담은 패치 릴리스입니다. 이 릴리스에는 코어 성능 개선 및 적절한 테스트 애플리케이션 종료 기능도 포함되어 있습니다.
</p>
<var name="version" value="3.0.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>3.0.2</td><td>2024년 12월 4일</td><td><p>
응답 손상, 본문 잘림, 연결 처리 및 잘못된 헤더와 관련된 여러 버그 수정을 처리하고, 바이너리 인코딩 지원 확장 및 Android 성능 향상을 포함한 패치 릴리스입니다. 
</p>
<var name="version" value="3.0.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>2.3.13</td><td>2024년 11월 20일</td><td><p>
버그 수정, 보안 패치 및 <code>watchosDeviceArm64</code> 타겟 지원 추가를 포함한 개선 사항이 담긴 패치 릴리스입니다.  
</p>
<var name="version" value="2.3.13"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>3.0.1</td><td>2024년 10월 29일</td><td><p>
클라이언트 및 서버 로깅 개선과 다양한 버그 수정을 포함한 패치 릴리스입니다.  
</p>
<var name="version" value="3.0.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0</td><td>2024년 10월 9일</td><td><p>
Android Native 타겟 지원 추가를 포함하여 여러 개선 사항과 버그 수정을 담은 메이저 릴리스입니다. 주요 변경 사항에 대한 자세한 내용은 <Links href="/ktor/migrating-3" summary="undefined">마이그레이션 가이드</Links>를 참조하세요.
</p>
<var name="version" value="3.0.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-rc-2</td><td>2024년 10월 2일</td><td><p>
XML 멀티플랫폼 지원과 같은 기능, 버그 수정 및 주요 변경 사항(breaking changes)을 포함한 다양한 개선 사항이 담긴 메이저 릴리스 후보(RC)입니다.
</p>
<var name="version" value="3.0.0-rc-2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-rc-1</td><td>2024년 9월 9일</td><td><p>
중요한 개선 사항과 버그 수정을 담은 메이저 릴리스 후보(RC)입니다. 이 업데이트는 하위 호환성을 강화하고 확장된 <code>staticZip</code> 지원을 제공합니다.
</p>
<var name="version" value="3.0.0-rc-1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-beta-2</td><td>2024년 7월 15일</td><td><p>
SSE 지원 개선 및 Kotlin/Wasm용 Ktor 클라이언트를 포함하여 다양한 개선 사항과 버그 수정을 담은 메이저 프리릴리스 버전입니다.
</p>
<var name="version" value="3.0.0-beta-2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>2.3.12</td><td>2024년 6월 20일</td><td><p>
Ktor Core 및 Ktor Server의 버그 수정과 Netty 및 OpenAPI의 버전 업데이트를 포함한 패치 릴리스입니다.
</p>
<var name="version" value="2.3.12"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>2.3.11</td><td>2024년 5월 9일</td><td><p>
테스트 클라이언트 엔진에 소켓 타임아웃을 적용하는 버그 수정을 포함한 패치 릴리스입니다.
</p>
<var name="version" value="2.3.11"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>2.3.10</td><td>2024년 4월 8일</td><td><p>
CallLogging 및 SSE 서버 플러그인에 대한 다양한 버그 수정, 개선된 Android 클라이언트 로깅 등을 포함한 패치 릴리스입니다.
</p>
<var name="version" value="2.3.10"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>2.3.9</td><td>2024년 3월 4일</td><td><p>
ContentNegotiation 클라이언트 플러그인의 버그 수정 및 HTTP를 통한 보안 쿠키 전송 지원 추가를 포함한 패치 릴리스입니다.
</p>
<var name="version" value="2.3.9"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>2.3.8</td><td>2024년 1월 31일</td><td><p>
URLBuilder, CORS 및 WebSocket 플러그인에 대한 다양한 버그 수정을 포함한 패치 릴리스입니다.
</p>
<var name="version" value="2.3.8"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
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
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-beta-1</td><td>2023년 11월 23일</td><td>
<p>
클라이언트 및 서버 SSE 지원을 포함하여 다양한 개선 사항과 버그 수정을 담은 메이저 프리릴리스 버전입니다.
</p>
<var name="version" value="3.0.0-beta-1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>2.3.6</td><td>2023년 11월 7일</td><td>
<p>
2.3.5의 주요 변경 사항에 대한 수정 및 기타 다양한 버그 수정을 포함한 패치 릴리스입니다.
</p>
<var name="version" value="2.3.6"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>2.3.5</td><td>2023년 10월 5일</td><td>
<p>
Darwin 및 Apache5 엔진 구성의 수정을 포함한 패치 릴리스입니다.
</p>
<var name="version" value="2.3.5"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
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
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>2.3.3</td><td>2023년 8월 1일</td><td>
<p>
<code>linuxArm64</code>에 대한 클라이언트 및 서버 지원과 다양한 버그 수정을 포함한 패치 릴리스입니다.
</p>
<var name="version" value="2.3.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>2.3.2</td><td>2023년 6월 28일</td><td>
<p>
Kotlin 버전을 <code>1.8.22</code>로 업그레이드하고 다양한 버그 수정을 포함한 패치 릴리스입니다.
</p>
<var name="version" value="2.3.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
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
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>2.3.0</td><td>2023년 4월 19일</td><td>
<p>
복수 구성 파일 지원, 라우팅에서의 정규식 패턴 지원 등을 추가한 기능 릴리스입니다.
</p>
<var name="version" value="2.3.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>2.2.4</td><td>2023년 2월 28일</td><td>
<p>
HTTP 클라이언트, 라우팅 및 ContentNegotiation에서의 다양한 버그 수정을 포함한 패치 릴리스입니다.
</p>
<var name="version" value="2.2.4"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>2.2.3</td><td>2023년 1월 31일</td><td>
<p>
OAuth2에 대한 멀티플랫폼 기능 및 다양한 버그 수정을 포함한 패치 릴리스입니다.
</p>
<var name="version" value="2.2.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>2.2.2</td><td>2023년 1월 3일</td><td>
<p>
<code>2.2.1</code>에 대한 버그 수정, Swagger 플러그인의 개선 및 수정 사항 등을 포함한 패치 릴리스입니다.
</p>
<var name="version" value="2.2.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>2.2.1</td><td>2022년 12월 7일</td><td>
<p>
<code>2.2.0</code>에서 발생한 <code>java.lang.NoClassDefFoundError: kotlinx/atomicfu/AtomicFU</code> 오류를 해결하기 위한 패치 릴리스입니다.
</p>
<var name="version" value="2.2.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>2.2.0</td><td>2022년 12월 7일</td><td>
<p>
Swagger UI 호스팅, 새로운 플러그인 API, 세션(Sessions)에 대한 멀티플랫폼 지원 등을 포함한 다중 기능 릴리스입니다.
자세한 내용은 <Links href="/ktor/migration-to-22x" summary="undefined">2.0.x에서 2.2.x로 마이그레이션하기</Links> 가이드를 참조하세요.
</p>
<var name="version" value="2.2.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
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
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>2.1.2</td><td>2022년 9월 29일</td><td>
<p>
라우팅, 테스팅 엔진 및 Ktor 클라이언트에서의 버그 수정을 포함한 패치 릴리스입니다.
</p>
<var name="version" value="2.1.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>2.1.1</td><td>2022년 9월 6일</td><td>
<p>
Ktor 클라이언트 및 서버에서의 다양한 버그 수정을 포함한 패치 릴리스입니다.
</p>
<var name="version" value="2.1.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>2.1.0</td><td>2022년 8월 11일</td><td>
<p>
YAML 구성을 위한 지원과 기타 다양한 개선 사항 및 버그 수정을 추가한 마이너 릴리스입니다.
</p>
<var name="version" value="2.1.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
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
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
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
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>2.0.1</td><td>2022년 4월 28일</td><td>
<p>
다양한 버그 수정 및 Kotlin 버전을 <code>1.6.21</code>로 업데이트한 패치 릴리스입니다.
</p>
<var name="version" value="2.0.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

<tr>
<td>2.0.0</td><td>2022년 4월 11일</td><td>
<p>
업데이트된 API 문서와 다양한 새로운 기능을 담은 메이저 릴리스입니다. 주요 변경 사항 및 <code>1.x.x</code>에서 마이그레이션하는 방법에 대한 자세한 내용은 <Links href="/ktor/migration-to-20x" summary="undefined">마이그레이션 가이드</Links>를 참조하세요.
</p>
<var name="version" value="2.0.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
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
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">GitHub에서 변경 로그 확인</a>
</p>
</td>
</tr>

</table>