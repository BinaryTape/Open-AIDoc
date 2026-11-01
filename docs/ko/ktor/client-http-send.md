[//]: # (title: HttpSend를 사용한 요청 가로채기)

<primary-label ref="client-plugin"/>

<tldr>
<var name="example_name" value="client-http-send"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[HttpSend](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins/-http-send/index.html) 플러그인을 사용하면 응답에 따라 HTTP 호출을 모니터링하고 재시도할 수 있습니다. 예를 들어, 호출 로깅을 구현하거나 서버가 오류 응답(4xx 또는 5xx 상태 코드)을 반환할 때 요청을 재시도할 수 있습니다.

`HttpSend` 플러그인은 별도의 설치가 필요하지 않습니다. 사용하려면 `HttpClient.plugin` 함수에 `HttpSend`를 전달하고 `intercept` 메서드를 호출하면 됩니다. 아래 예제는 응답 상태 코드에 따라 요청을 재시도하는 방법을 보여줍니다:

```kotlin
val client = HttpClient(Apache5)
client.plugin(HttpSend).intercept { request ->
    val originalCall = execute(request)
    if (originalCall.response.status.value !in 100..399) {
        execute(request)
    } else {
        originalCall
    }
}
```

전체 예제는 여기에서 확인할 수 있습니다: [client-http-send](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-http-send).