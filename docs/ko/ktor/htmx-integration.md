[//]: # (title: HTMX 연동)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:ktor-htmx</code>, <code>io.ktor:ktor-htmx-html</code>,
<code>io.ktor:ktor-server-htmx</code>
</p>
<var name="example_name" value="htmx-integration"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[HTMX](https://htmx.org/)는 HTML 속성을 사용하여 동적인 클라이언트 측 동작을 가능하게 해주는 가벼운 JavaScript 라이브러리입니다. JavaScript를 직접 작성하지 않고도 AJAX, CSS 트랜지션, WebSocket, Server-Sent Events와 같은 기능을 지원합니다.

Ktor는 서버와 클라이언트 환경 모두에서 연동을 간소화하는 공유 모듈 세트를 통해 HTMX에 대한 실험적인 일급(first-class) 지원을 제공합니다. 이 모듈들은 HTMX 헤더 작업, Kotlin DSL을 사용한 HTML 속성 정의, 서버에서의 HTMX 전용 라우팅 로직 처리를 위한 도구를 제공합니다.

## 모듈 개요 {id="modules-overview"}

Ktor의 HTMX 지원은 다음 세 가지 실험적 모듈을 통해 제공됩니다.

| 모듈                 | 설명                                         |
|--------------------|--------------------------------------------|
| `ktor-htmx`        | 핵심 정의 및 헤더 상수                               |
| `ktor-htmx-html`   | Kotlin HTML DSL과의 연동                      |
| `ktor-server-htmx` | HTMX 전용 요청을 위한 라우팅 지원                       |

모든 API는 `@ExperimentalKtorApi`로 표시되어 있으며, `@OptIn(ExperimentalKtorApi::class)`를 통한 사용 설정(opt-in)이 필요합니다.

## HTMX 헤더 {id="htmx-headers"}

핵심 `ktor-htmx` 모듈에서 미리 정의된 상수를 사용하여 타입 세이프한 방식으로 HTMX 헤더에 접근하거나 설정할 수 있습니다. 이러한 상수는 트리거, 히스토리 복원 또는 콘텐츠 스와핑과 같은 HTMX 동작을 감지할 때 매직 스트링(magic string)을 방지하는 데 도움이 됩니다.

### 요청 헤더 {id="request-headers"}

애플리케이션에서 HTMX 요청 헤더를 읽거나 매칭하려면 `HxRequestHeaders` 객체를 사용합니다.

<deflist type="wide">
<def title="HxRequestHeaders.Request">HTMX 요청인 경우 항상 <code>true</code></def>
<def title="HxRequestHeaders.Target">대상 요소의 ID</def>
<def title="HxRequestHeaders.Trigger">트리거된 요소의 ID</def>
<def title="HxRequestHeaders.TriggerName">트리거된 요소의 이름</def>
<def title="HxRequestHeaders.Boosted">hx-boost를 통한 요청임을 나타냄</def>
<def title="HxRequestHeaders.CurrentUrl">현재 브라우저 URL</def>
<def title="HxRequestHeaders.HistoryRestoreRequest">히스토리 복원용</def>
<def title="HxRequestHeaders.Prompt">hx-prompt에 대한 사용자 응답</def>
</deflist>

### 응답 헤더 {id="response-headers"}

`HxResponseHeaders` 객체를 사용하여 HTMX 응답 헤더 상수에 접근할 수 있습니다.

<deflist type="wide">
<def title="HxResponseHeaders.Location">페이지 새로고침 없는 클라이언트 측 리디렉션</def>
<def title="HxResponseHeaders.PushUrl">히스토리 스택에 URL 푸시</def>
<def title="HxResponseHeaders.Redirect">클라이언트 측 리디렉션</def>
<def title="HxResponseHeaders.Refresh">전체 페이지 새로고침 강제 실행</def>
<def title="HxResponseHeaders.ReplaceUrl">현재 URL 대체</def>
<def title="HxResponseHeaders.Reswap">응답이 스왑되는 방식 제어</def>
<def title="HxResponseHeaders.Retarget">콘텐츠 업데이트 대상 변경</def>
<def title="HxResponseHeaders.Reselect">스왑할 응답의 일부 선택</def>
<def title="HxResponseHeaders.Trigger">클라이언트 측 이벤트 트리거</def>
<def title="HxResponseHeaders.TriggerAfterSettle">settle 이후 이벤트 트리거</def>
<def title="HxResponseHeaders.TriggerAfterSwap">스왑 이후 이벤트 트리거</def>
</deflist>

## 스왑 모드 {id="swap-modes"}

핵심 `ktor-htmx` 모듈의 `HxSwap` 객체를 사용하여 다양한 HTMX 스왑 모드에 대한 상수에 접근할 수 있습니다.

<deflist type="medium">
<def title="HxSwap.innerHtml">내부 HTML 대체 (기본값)</def>
<def title="HxSwap.outerHtml ">전체 요소 대체</def>
<def title="HxSwap.textContent">텍스트 콘텐츠만 대체</def>
<def title="HxSwap.beforeBegin">대상 요소 앞에 삽입</def>
<def title="HxSwap.afterBegin">첫 번째 자식으로 삽입</def>
<def title="HxSwap.beforeEnd">마지막 자식으로 삽입</def>
<def title="HxSwap.afterEnd">대상 요소 뒤에 삽입</def>
<def title="HxSwap.delete">대상 요소 삭제</def>
<def title="HxSwap.none">콘텐츠를 추가하지 않음</def>
</deflist>

## HTML DSL 확장 {id="html-dsl-extensions"}

`ktor-htmx-html` 모듈은 Kotlin의 HTML DSL에 확장 함수를 추가하여 HTML 요소에 HTMX 속성을 직접 추가할 수 있도록 해줍니다.

```kotlin
@OptIn(ExperimentalKtorApi::class)
html {
    body {
        button {
            attributes.hx {
                get = "/data"
                target = "#result"
                swap = HxSwap.outerHtml
                trigger = "click"
            }
            +"Load Data"
        }
    }
}
```

위 예제는 HTMX 속성이 포함된 HTML을 생성합니다.

```html
<button hx-get="/api/data" hx-target="#result-div" hx-swap="outerHTML" hx-trigger="click">Load Data</button>
```

## 서버 측 라우팅 {id="server-side-routing"}

`ktor-server-htmx` 모듈은 `hx` DSL 블록을 통해 HTMX를 인식하는 라우팅 기능을 제공합니다.

```kotlin
@OptIn(ExperimentalKtorApi::class)
routing {
    route("api") {
        // 일반 라우트 (HTMX 및 비 HTMX 요청 모두)
        get {
            call.respondText("Regular response")
        }
        
        // HTMX 요청만 일치 (HX-Request 헤더가 있는 경우)
        hx.get {
            call.respondText("HTMX response")
        }
        
        // 특정 타깃(target)을 가진 HTMX 요청과 일치
        hx {
            target("#result-div") {
                get {
                    call.respondText("Response for #result-div")
                }
            }
            
            // 특정 트리거(trigger)를 가진 HTMX 요청과 일치
            trigger("#load-button") {
                get {
                    call.respondText("Response for #load-button clicks")
                }
            }
        }
    }
}
```

이러한 기능을 사용하면 클라이언트가 전송한 HTMX 헤더에 따라 애플리케이션이 다르게 응답하도록 구현할 수 있습니다.