---
aside: false
---
<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="시작하기"
       id="welcome">
    <section-starting-page>
        <title>Ktor 문서</title>
        <description>
            Ktor는 비동기 서버 및 클라이언트 애플리케이션을 쉽게 구축할 수 있는 프레임워크입니다.
        </description>
        <spotlight>
            <card href="server-create-a-new-project.topic" summary="Ktor로 서버 애플리케이션을 생성, 실행 및 테스트하는 방법을 알아봅니다.">
                Ktor Server 시작하기
            </card>
            <card href="client-create-new-application.topic" summary="Ktor로 클라이언트 애플리케이션을 생성, 실행 및 테스트하는 방법을 알아봅니다.">
                Ktor Client 시작하기
            </card>
        </spotlight>
        <primary>
            <title>Ktor Server</title>
            <card href="server-requests-and-responses.topic" summary="작업 관리자(Task Manager) 애플리케이션을 만들어 보며 Ktor에서 라우팅과 요청이 작동하는 방식을 알아봅니다.">
                요청 처리 및 응답 생성
            </card>
            <card href="server-create-restful-apis.topic" summary="Ktor로 RESTful API를 구축하는 방법을 알아봅니다. 이 튜토리얼에서는 실사례를 바탕으로 설정, 라우팅 및 테스트를 다룹니다.">RESTful API 만들기</card>
            <card href="server-create-website.topic" summary="Ktor와 Thymeleaf 템플릿을 사용하여 Kotlin으로 웹사이트를 구축하는 방법을 알아봅니다.">웹사이트 만들기</card>
            <card href="server-create-websocket-application.topic" summary="WebSocket을 활용하여 콘텐츠를 주고받는 방법을 알아봅니다.">
                WebSocket 애플리케이션 만들기
            </card>
            <card href="server-integrate-database.md" summary="Exposed SQL 라이브러리를 사용하여 Ktor 서비스를 데이터베이스 리포지토리에 연결하는 과정을 알아봅니다.">데이터베이스 연동</card>
        </primary>
        <misc>
            <links narrow="true">
                <group>
                    <title>서버 구성</title>
                    <Links href="server-create-a-new-project.topic" summary="Ktor로 서버 애플리케이션을 열고 실행하며 테스트하는 방법을 알아봅니다.">새 Ktor 프로젝트 생성, 열기 및 실행</Links>
                    <Links href="server-dependencies.topic" summary="기존 Gradle/Maven 프로젝트에 Ktor Server 의존성을 추가하는 방법을 알아봅니다.">서버 의존성 추가</Links>
                    <Links href="server-create-and-configure.topic" summary="애플리케이션 배포 요구 사항에 맞춰 서버를 생성하는 방법을 알아봅니다.">서버 생성</Links>
                    <Links href="server-configuration-code.topic" summary="코드 내에서 다양한 서버 매개변수를 구성하는 방법을 알아봅니다.">코드에서 구성</Links>
                    <Links href="server-configuration-file.topic" summary="구성 파일에서 다양한 서버 매개변수를 구성하는 방법을 알아봅니다.">파일에서 구성</Links>
                    <Links href="server-plugins.md" summary="플러그인은 직렬화, 콘텐츠 인코딩, 압축 등의 공통 기능을 제공합니다.">서버 플러그인</Links>
                </group>
                <group>
                    <title>라우팅</title>
                    <Links href="server-routing.md" summary="라우팅은 서버 애플리케이션에서 들어오는 요청을 처리하기 위한 핵심 플러그인입니다.">라우팅</Links>
                    <Links href="server-resources.md" summary="Resources 플러그인을 사용하면 타입 세이프(type-safe) 라우팅을 구현할 수 있습니다.">타입 세이프 라우팅</Links>
                    <Links href="server-routing-organization.md" summary="Ktor 애플리케이션이 성장함에 따라 라우팅 로직을 구조화하고 정리하는 방법을 알아봅니다.">라우팅 구조화</Links>
                    <Links href="server-requests.md" summary="경로 핸들러 내부에서 들어오는 요청을 처리하는 방법을 알아봅니다.">요청 처리</Links>
                    <Links href="server-responses.md" summary="다양한 유형의 응답을 전송하는 방법을 알아봅니다.">응답 전송</Links>
                    <Links href="server-static-content.md" summary="스타일시트, 스크립트, 이미지 등의 정적 콘텐츠를 제공하는 방법을 알아봅니다.">정적 콘텐츠 제공</Links>
                </group>
                <group>
                    <title>플러그인</title>
                    <Links href="server-serialization.md" summary="ContentNegotiation 플러그인은 클라이언트와 서버 간 미디어 타입 협상과 특정 형식으로 콘텐츠를 직렬화/역직렬화하는 두 가지 주요 목적을 수행합니다.">Ktor Server의 콘텐츠 협상 및 직렬화</Links>
                    <Links href="server-templating.md" summary="HTML/CSS 또는 JVM 템플릿 엔진으로 구축된 뷰를 다루는 방법을 알아봅니다.">템플릿</Links>
                    <Links href="server-auth.md" summary="Authentication 플러그인은 Ktor에서 인증 및 인가를 처리합니다.">Ktor Server의 인증 및 인가</Links>
                    <Links href="server-sessions.md" summary="Sessions 플러그인은 서로 다른 HTTP 요청 간에 데이터를 유지할 수 있는 메커니즘을 제공합니다.">세션</Links>
                    <Links href="server-websockets.md" summary="Websockets 플러그인을 사용하면 서버와 클라이언트 간에 다방향 통신 세션을 만들 수 있습니다.">Ktor Server의 WebSocket</Links>
                    <Links href="server-server-sent-events.topic" summary="SSE 플러그인을 사용하면 서버가 HTTP 연결을 통해 클라이언트에 이벤트 기반 업데이트를 전송할 수 있습니다.">Ktor Server의 Server-Sent Events</Links>
                    <Links href="server-swagger-ui.md" summary="SwaggerUI 플러그인을 사용하면 프로젝트용 Swagger UI를 생성할 수 있습니다.">Swagger UI</Links> / <Links href="server-openapi.md" summary="OpenAPI 플러그인을 사용하면 프로젝트용 OpenAPI 문서를 생성할 수 있습니다.">OpenAPI</Links>
                    <Links href="server-custom-plugins.md" summary="자신만의 커스텀 플러그인을 만드는 방법을 알아봅니다.">커스텀 서버 플러그인</Links>
                </group>
                <group>
                    <title>실행, 디버그 및 테스트</title>
                    <Links href="server-run.md" summary="Ktor 서버 애플리케이션을 실행하는 방법을 알아봅니다.">실행</Links>
                    <Links href="server-auto-reload.topic" summary="코드 변경 시 애플리케이션 클래스를 다시 로드하는 Auto-reload 사용법을 알아봅니다.">Auto-reload</Links>
                    <Links href="server-testing.md" summary="전용 테스팅 엔진을 사용하여 서버 애플리케이션을 테스트하는 방법을 알아봅니다.">Ktor Server 테스트</Links>
                </group>
                <group>
                    <title>배포</title>
                    <Links href="server-fatjar.md" summary="Ktor Gradle 플러그인을 사용하여 실행 가능한 fat JAR을 생성하고 실행하는 방법을 알아봅니다.">Fat JAR 생성</Links>
                    <Links href="server-war.md" summary="WAR 아카이브를 사용하여 서블릿 컨테이너 내에서 Ktor 애플리케이션을 실행하고 배포하는 방법을 알아봅니다.">WAR</Links>
                    <Links href="graalvm.md" summary="다양한 플랫폼에서 네이티브 이미지를 위해 GraalVM을 사용하는 방법을 알아봅니다.">GraalVM</Links>
                    <Links href="docker.md" summary="Docker 컨테이너에 애플리케이션을 배포하는 방법을 알아봅니다.">Docker</Links>
                    <Links href="google-app-engine.md" summary="Google App Engine 표준 환경에 프로젝트를 배포하는 방법을 알아봅니다.">Google App Engine에 Ktor 앱 배포</Links>
                    <Links href="heroku.md" summary="Heroku에 Ktor 애플리케이션을 준비하고 배포하는 방법을 알아봅니다.">Heroku</Links>
                    <Links href="sevalla.md" summary="Sevalla에 Ktor 애플리케이션을 준비하고 배포하는 방법을 알아봅니다.">Sevalla</Links>
                </group>
            </links>
            <cards>
                <title>Ktor Client</title>
                <card href="client-create-new-application.topic" summary="Ktor로 클라이언트 애플리케이션을 만듭니다.">
                    클라이언트 애플리케이션 만들기
                </card>
                <card href="client-create-multiplatform-application.md" summary="Kotlin Multiplatform Mobile 애플리케이션을 만들고 Ktor Client를 사용하여 요청을 보내고 응답을 받는 방법을 알아봅니다.">
                    크로스 플랫폼 모바일 애플리케이션 만들기
                </card>
            </cards>
            <links narrow="true">
                <group>
                    <title>클라이언트 설정</title>
                    <Links href="client-create-new-application.topic" summary="요청을 보내고 응답을 받기 위한 첫 번째 클라이언트 애플리케이션을 만듭니다.">클라이언트 애플리케이션 만들기</Links>
                    <Links href="client-dependencies.md" summary="기존 프로젝트에 클라이언트 의존성을 추가하는 방법을 알아봅니다.">클라이언트 의존성 추가</Links>
                    <Links href="client-create-and-configure.md" summary="Ktor 클라이언트를 생성하고 구성하는 방법을 알아봅니다.">클라이언트 생성 및 구성</Links>
                    <Links href="client-engines.md" summary="네트워크 요청을 처리하는 엔진에 대해 알아봅니다.">클라이언트 엔진</Links>
                    <Links href="client-plugins.md" summary="클라이언트 플러그인을 사용하여 로깅, 직렬화, 권한 부여와 같은 공통 기능을 추가하는 방법을 알아봅니다.">클라이언트 플러그인</Links>
                </group>
                <group>
                    <title>요청</title>
                    <Links href="client-requests.md" summary="요청을 생성하고 요청 URL, HTTP 메서드, 헤더, 요청 본문 등의 다양한 요청 매개변수를 지정하는 방법을 알아봅니다.">요청 만들기</Links>
                    <Links href="client-resources.md" summary="Resources 플러그인을 사용하여 타입 세이프한 요청을 만드는 방법을 알아봅니다.">타입 세이프 요청</Links>
                    <Links href="client-default-request.md" summary="DefaultRequest 플러그인을 사용하면 모든 요청에 대한 기본 매개변수를 구성할 수 있습니다.">기본 요청</Links>
                    <Links href="client-request-retry.md" summary="HttpRequestRetry 플러그인을 사용하면 실패한 요청에 대한 재시도 정책을 구성할 수 있습니다.">실패한 요청 재시도</Links>
                </group>
                <group>
                    <title>응답</title>
                    <Links href="client-responses.md" summary="응답을 수신하고 응답 본문 및 응답 매개변수를 가져오는 방법을 알아봅니다.">응답 수신</Links>
                    <Links href="client-response-validation.md" summary="상태 코드에 따라 응답을 검증하는 방법을 알아봅니다.">응답 검증</Links>
                </group>
                <group>
                    <title>플러그인</title>
                    <Links href="client-auth.md" summary="Auth 플러그인은 클라이언트 애플리케이션에서 인증 및 인가를 처리합니다.">Ktor Client의 인증 및 인가</Links>
                    <Links href="client-cookies.md" summary="HttpCookies 플러그인은 쿠키를 자동으로 처리하고 요청 간에 저장소에 보관합니다.">쿠키</Links>
                    <Links href="client-content-encoding.md" summary="ContentEncoding 플러그인을 사용하면 지정된 압축 알고리즘('gzip' 및 'deflate' 등)을 활성화하고 관련 설정을 구성할 수 있습니다.">콘텐츠 인코딩</Links>
                    <Links href="client-bom-remover.md" summary="BOMRemover 플러그인을 사용하면 응답 본문에서 바이트 순서 표식(BOM)을 제거할 수 있습니다.">BOM 제거기</Links>
                    <Links href="client-caching.md" summary="HttpCache 플러그인을 사용하면 이전에 가져온 리소스를 인메모리 또는 영구 캐시에 저장할 수 있습니다.">캐싱</Links>
                    <Links href="client-websockets.topic" summary="Websockets 플러그인을 사용하면 서버와 클라이언트 간에 다방향 통신 세션을 만들 수 있습니다.">Ktor Client의 WebSocket</Links>
                    <Links href="client-server-sent-events.topic" summary="SSE 플러그인을 사용하면 클라이언트가 HTTP 연결을 통해 서버로부터 이벤트 기반 업데이트를 받을 수 있습니다.">Ktor Client의 Server-Sent Events</Links>
                    <Links href="client-custom-plugins.md" summary="자신만의 커스텀 클라이언트 플러그인을 만드는 방법을 알아봅니다.">커스텀 클라이언트 플러그인</Links>
                </group>
                <group>
                    <title>테스트</title>
                    <Links href="client-testing.md" summary="MockEngine을 사용하여 HTTP 호출을 시뮬레이션함으로써 클라이언트를 테스트하는 방법을 알아봅니다.">Ktor Client 테스트</Links>
                </group>
            </links>
            <cards>
                <title>통합</title>
                <card href="full-stack-development-with-kotlin-multiplatform.topic" summary="Kotlin과 Ktor로 크로스 플랫폼 풀스택 애플리케이션을 개발하는 방법을 알아봅니다.">Kotlin Multiplatform으로 풀스택 애플리케이션 구축하기</card>
                <card href="tutorial-first-steps-with-kotlin-rpc.md" summary="Kotlin RPC와 Ktor로 첫 애플리케이션을 만드는 방법을 알아봅니다.">Kotlin RPC 시작하기</card>
            </cards>
        </misc>
    </section-starting-page>
</topic>