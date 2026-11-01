[//]: # (title: HTTP 요청 생명주기)

<primary-label ref="server-plugin"/>

<var name="plugin_name" value="HttpRequestLifecycle"/>
<var name="example_name" value="server-http-request-lifecycle"/>

<tldr>
<p>
<b>필요한 의존성</b>: <code>io.ktor:ktor-server-core</code>
</p>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
<b>지원되는 엔진</b>: <code>Netty</code>, <code>CIO</code>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor는 Kotlin/Native를 지원하므로 추가 런타임이나 가상 머신 없이 서버를 실행할 수 있습니다.">Native 서버</Links> 지원</b>: ✖️
</p>
</tldr>

기본적으로 Ktor는 클라이언트와의 연결이 끊어지더라도 요청 처리를 계속 진행합니다.
[`%plugin_name%`](https://api.ktor.io/ktor-http/io.ktor.http/-http-request-lifecycle.html)
플러그인을 사용하면 클라이언트 연결이 끊어지는 즉시 요청 처리를 취소할 수 있습니다.

이는 클라이언트가 더 이상 응답을 기다리지 않을 때 실행을 중단해야 하는, 오래 실행되거나 리소스를 많이 소모하는 요청을 처리할 때 유용합니다.

## %plugin_name% 설치 및 구성 {id="install_plugin"}

`HttpRequestLifecycle` 플러그인을 활성화하려면 `install` 함수를 사용하여 애플리케이션 모듈에 설치하고 `cancelCallOnClose` 프로퍼티를 설정합니다.

```kotlin
import io.ktor.server.application.*
import io.ktor.server.http.HttpRequestLifecycle

fun Application.module() {
    install(HttpRequestLifecycle) {
        cancelCallOnClose = true
    }
}
```

`cancelCallOnClose` 프로퍼티가 활성화되면 `%plugin_name%` 플러그인은 요청별로 취소 핸들러를 등록합니다. 클라이언트 연결이 끊어지면 해당 특정 라우트를 처리하는 코루틴만 취소됩니다.

취소는 구조화된 동시성(structured concurrency)을 통해 전파되므로, 요청 코루틴에서 시작된 모든 자식 코루틴(예: `launch` 또는 `async` 사용)도 함께 취소됩니다. 다음 중단 지점(suspension point)에서 `CancellationException`이 발생합니다.

## 취소 처리 {id="handle_cancellation"}

리소스 해제나 백그라운드 작업 중단과 같은 정리(cleanup) 작업을 수행하기 위해 `CancellationException`을 캐치할 수 있습니다.

```kotlin
fun Application.module() {
    install(HttpRequestLifecycle) {
        cancelCallOnClose = true
    }

    routing {
        get("/long-process") {
            try {
                while (isActive) {
                    delay(10_000)
                    log.info("Very important work.")
                }
                call.respond("Completed")
            } catch (e: CancellationException) {
                log.info("Cleaning up resources.")
            }
        }
    }
}
```

> 코루틴 취소는 협동적(cooperative)입니다. 블로킹 코드나 CPU 바운드 코드는 자동으로 중단되지 않습니다.
> 요청 처리에서 장시간 실행되는 작업을 수행하는 경우, 취소에 반응할 수 있도록
> `call.coroutineContext.ensureActive()`를 호출하세요.
>
> 자세한 내용은
> [코루틴 취소(Coroutine cancellation)](https://kotlinlang.org/docs/cancellation-and-timeouts.html)를 참조하세요.
{style="note"}

> 전체 예제는 [%example_name%](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%)에서 확인할 수 있습니다.

## 제한 사항 {id="limitations"}

이 플러그인은 `CIO` 및 `Netty` 엔진에서만 온전히 지원됩니다. 서블릿 기반 엔진(또는 지원되지 않는 기타 엔진)은 클라이언트 연결 해제를 안정적으로 감지할 수 없습니다. 취소는 서버가 응답 쓰기를 시도할 때만 감지될 수 있습니다.