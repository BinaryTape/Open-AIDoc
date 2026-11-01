[//]: # (title: 텍스트 및 문자셋)

<tip>
    이 도움말 항목은 현재 작성 중이며 향후 업데이트될 예정입니다.
</tip>
<primary-label ref="client-plugin"/>

이 플러그인을 사용하면 요청 및 응답의 일반 텍스트(plain text) 콘텐츠를 처리할 수 있습니다. 등록된 문자셋으로 `Accept` 헤더를 채우고, `ContentType`의 문자셋에 따라 요청 본문을 인코딩하며 응답 본문을 디코딩합니다.

## 설정 {id="configuration"}

설정이나 HTTP 호출 속성에 별도의 설정이 지정되지 않은 경우, 기본적으로 `Charsets.UTF_8`이 사용됩니다.

```kotlin
val client = HttpClient(HttpClientEngine) {
    Charsets {
        // `UTF_8` 사용을 허용합니다.
        register(Charsets.UTF_8)

        // quality를 0.1로 지정하여 `ISO_8859_1` 사용을 허용합니다.
        register(Charsets.ISO_8859_1, quality=0.1f)
        
        // 요청을 보낼 때 사용할 Charset을 지정합니다(요청 헤더에 문자셋이 없는 경우).
        sendCharset = ...

        // 응답을 받을 때 사용할 Charset을 지정합니다(응답 헤더에 문자셋이 없는 경우).
        responseCharsetFallback = ...
    }
}
```