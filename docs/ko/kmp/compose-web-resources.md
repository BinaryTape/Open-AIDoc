[//]: # (title: 웹 리소스 처리)

여기에서는 브라우저 기능 및 `preload` API를 사용한 리소스 프리로드, 웹 리소스 캐싱, 자동 폰트 폴백(Font fallback)에 대해 알아봅니다.
  
## 웹 타깃을 위한 리소스 프리로드 {id="preloading-of-resources-for-web-targets"}

폰트나 이미지와 같은 웹 리소스는 [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)를 사용하여 비동기적으로 로드됩니다.
초기 로드 중이거나 네트워크 연결이 느린 경우, 리소스를 가져오는 과정에서 [FOUT](https://fonts.google.com/knowledge/glossary/fout)가 발생하거나 이미지 대신 플레이스홀더가 표시되는 등의 시각적 결함(visual glitch)이 발생할 수 있습니다.

이 문제의 전형적인 예는 `Text()` 컴포넌트에 커스텀 폰트가 적용된 텍스트가 포함되어 있지만, 필요한 글리프(glyph)가 있는 폰트가 아직 로드 중인 경우입니다. 이 경우 사용자는 일시적으로 기본 폰트로 된 텍스트를 보거나 글자 대신 빈 상자 및 물음표를 보게 될 수 있습니다. 마찬가지로 이미지나 drawable의 경우, 리소스가 완전히 로드될 때까지 빈 상자나 검은색 상자와 같은 플레이스홀더를 보게 될 수 있습니다.

이러한 시각적 결함을 방지하기 위해 리소스 프리로드를 지원하는 브라우저 내장 기능, Compose Multiplatform 프리로드 API 또는 이 둘의 조합을 사용할 수 있습니다.

### 브라우저 기능을 사용한 리소스 프리로드 {id="preload-resources-using-browser-features"}

최신 브라우저에서는 [`rel="preload"` 속성](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload)이 적용된 `<link>` 태그를 사용하여 리소스를 미리 로드할 수 있습니다.
이 속성은 브라우저가 애플리케이션 시작 전에 폰트 및 이미지와 같은 리소스의 다운로드 및 캐싱을 우선적으로 처리하도록 지시하여, 해당 리소스를 조기에 사용할 수 있도록 보장합니다.

예를 들어, 브라우저에서 폰트 프리로드를 활성화하려면 다음과 같이 합니다.

1. 애플리케이션의 웹 배포본을 빌드합니다:

    ```console
       ./gradlew :shared:wasmJsBrowserDistribution
    ```

2. 생성된 `dist` 디렉터리에서 필요한 리소스를 찾아 경로를 저장합니다.
3. `wasmJsMain/resources/index.html` 파일을 열고 `<head>` 요소 내에 `<link>` 태그를 추가합니다.
4. `href` 속성을 해당 리소스 경로로 설정합니다:

```html
<link rel="preload" href="./composeResources/username.shared.generated.resources/font/FiraMono-Regular.ttf" as="fetch" type="font/ttf" crossorigin/>
```

### Compose Multiplatform 프리로드 API를 사용한 리소스 프리로드 {id="preload-resources-using-the-compose-multiplatform-preload-api"}

브라우저에서 리소스를 미리 로드했더라도 원시 바이트(raw bytes) 형태로 캐시되므로 `FontResource` 및 `DrawableResource`와 같이 렌더링에 적합한 형식으로 변환해야 합니다. 애플리케이션이 처음으로 리소스를 요청할 때 비동기적으로 변환이 수행되므로 다시 깜빡임이 발생할 수 있습니다. 사용자 경험을 더욱 최적화하기 위해, Compose Multiplatform 리소스에는 상위 수준 표현(higher-level representation)을 위한 자체 내부 캐시가 있으며 이 역시 미리 로드할 수 있습니다.

Compose Multiplatform 1.8.0에서는 웹 타깃에서 폰트 및 이미지 리소스를 프리로드할 수 있는 API인 `preloadFont()`, `preloadImageBitmap()`, `preloadImageVector()`를 도입했습니다.

렌더링 중에 매핑되지 않은(unresolved) 문자가 발견되면 누락된 문자가 포함된 폴백 폰트가 [자동으로 다운로드](#automatic-font-fallback)되므로, 이모지와 같은 특수 문자도 별도 설정 없이 바로 지원됩니다.

자동 폴백 폰트에 의존하는 대신 어떤 폴백 폰트를 사용할지 직접 제어하고 싶다면 `FontFamily.Resolver.preload()` 메서드를 사용하여 수동으로 지정하세요.
웹 타깃은 TTF, OTF, TTC, 가변(variable), WOFF/WOFF2 폰트 형식을 지원합니다.

다음 예제는 벡터 이미지를 프리로드하는 방법을 보여줍니다:

```kotlin
@Composable
fun App() {
    val icon by preloadImageVector(Res.drawable.heavy_vector_icon)

    if (icon != null) {
        MainScreen()
    } else {
        Box(modifier = Modifier.fillMaxSize()) {
            CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
        }
    }
}

@Composable
fun MainScreen() {
    // 아이콘이 캐시에서 로드됩니다
    Image(painter = painterResource(Res.drawable.heavy_vector_icon), contentDescription = null)
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="val icon by preloadImageVector(Res.drawable.heavy_vector_icon)"}

## 자동 폰트 폴백 {id="automatic-font-fallback"}
<primary-label ref="Experimental"/>

기본적으로 애플리케이션에 로드된 폰트에서 지원하지 않는 문자는 대체 글리프(□, 일명 "[두부(tofu)](https://fonts.google.com/knowledge/glossary/tofu)")로 표시됩니다.

1.12.0 버전부터 Compose Multiplatform은 렌더링 중에 해결되지 않은 문자를 모니터링하고 필요한 Noto 폰트 서브셋을 온디맨드로 다운로드합니다.
Noto라는 이름은 이러한 폰트가 두부(tofu) 글리프를 없애기 위해 고안되었기 때문에 "no tofu"에서 유래되었습니다.

폰트를 사용할 수 있게 되면 해당 텍스트가 재구성(recompose)됩니다.
다운로드 중에는 일시적으로 두부가 나타날 수 있습니다.

CJK(한중일) 문자의 경우, 브라우저의 언어 설정에 따라 올바른 폰트 변형(variant)이 자동으로 선택됩니다.

## 웹 리소스 캐싱 {id="caching-web-resources"}
<primary-label ref="Experimental"/>

Compose Multiplatform은 [Web Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache)를 사용하여 성공한 응답을 캐시하고, 브라우저의 기본 캐싱 메커니즘에서 일반적으로 수행하는 불필요한 HTTP 재검증을 방지합니다.

캐시는 앱이 실행되거나 페이지가 새로고침될 때마다 전역적으로 지워집니다.
여러 세션에 걸쳐 캐시를 재사용하면 애플리케이션 충돌이나 논리적 불일치를 유발할 수 있는 오래되거나 호환되지 않는 리소스가 남을 수 있으므로, 이 단계에서 캐시를 재설정하여 리소스 일관성을 보장합니다.

동일한 리소스에 대한 중복된 동시 요청을 방지하기 위해, 이 구현에서는 리소스별 락(resource-specific lock)을 사용합니다.
각 요청은 리소스별 뮤텍스(mutex)로 보호되므로, 서로 다른 리소스에 대한 병렬 요청을 허용하면서 동일한 경로에 대한 중복 요청은 직렬화합니다.
이러한 설계를 통해 불필요한 네트워크 트래픽을 최소화하고 캐시를 채우는 과정에서 발생할 수 있는 경쟁 상태(race condition)를 방지합니다.

## 다음 단계 {id="what-s-next"}

* [리소스 설정](compose-multiplatform-resources-setup.md) 및 [앱에서 리소스 사용](compose-multiplatform-resources-usage.md)에 대해 자세히 알아보세요.
* 인앱 테마나 언어와 같은 애플리케이션의 [리소스 환경](compose-resource-environment.md)을 관리하는 방법을 알아보세요.