[//]: # (title: 웹 리소스 처리)

여기에서는 브라우저 기능과 `preload` API를 사용한 리소스 프리로딩(preloading), 웹 리소스 캐싱, 그리고 자동 폰트 폴백(fallback)에 대한 정보를 확인할 수 있습니다.
  
## 웹 타겟을 위한 리소스 프리로딩

폰트나 이미지와 같은 웹 리소스는 [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)를 사용하여 비동기적으로 로드됩니다.
초기 로드 시 또는 네트워크 연결이 느린 경우, 리소스 페칭(fetching)으로 인해 [FOUT](https://fonts.google.com/knowledge/glossary/fout)이 발생하거나 이미지 대신 플레이스홀더(placeholder)가 표시되는 등의 시각적 결함이 발생할 수 있습니다.

이 문제의 대표적인 예는 `Text()` 컴포넌트에 커스텀 폰트가 포함되어 있지만, 필요한 글리프(glyph)가 포함된 폰트가 여전히 로드 중인 경우입니다. 이 경우 사용자는 일시적으로 기본 폰트로 된 텍스트를 보거나, 심지어 글자 대신 빈 박스나 물음표를 보게 될 수 있습니다. 마찬가지로 이미지나 드로어블(drawable)의 경우, 리소스가 완전히 로드될 때까지 빈 박스나 검은색 박스와 같은 플레이스홀더가 보일 수 있습니다.

시각적 결함을 방지하기 위해 브라우저의 내장 리소스 프리로딩 기능, Compose Multiplatform의 프리로드(preload) API 또는 두 가지의 조합을 사용할 수 있습니다.

### 브라우저 기능을 사용하여 리소스 프리로딩하기

최신 브라우저에서는 [`rel="preload"` 속성](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload)이 있는 `<link>` 태그를 사용하여 리소스를 프리로딩할 수 있습니다.
이 속성은 애플리케이션이 시작되기 전에 폰트 및 이미지와 같은 리소스의 다운로드 및 캐싱을 우선적으로 처리하도록 브라우저에 지시하여, 해당 리소스를 조기에 사용할 수 있도록 보장합니다.

예를 들어, 브라우저 내에서 폰트 프리로딩을 활성화하려면 다음과 같이 하세요.

1. 애플리케이션의 웹 배포판을 빌드합니다.

```console
   ./gradlew :shared:wasmJsBrowserDistribution
```

2. 생성된 `dist` 디렉토리에서 필요한 리소스를 찾아 경로를 저장합니다.
3. `wasmJsMain/resources/index.html` 파일을 열고 `<head>` 요소 안에 `<link>` 태그를 추가합니다.
4. `href` 속성을 리소스 경로로 설정합니다.

```html
<link rel="preload" href="./composeResources/username.shared.generated.resources/font/FiraMono-Regular.ttf" as="fetch" type="font/ttf" crossorigin/>
```

### Compose Multiplatform 프리로드 API를 사용하여 리소스 프리로딩하기
<primary-label ref="Experimental"/>

브라우저에서 리소스를 프리로딩했더라도, 해당 리소스는 로우 바이트(raw bytes)로 캐싱되어 있으므로 여전히 `FontResource`나 `DrawableResource`와 같이 렌더링에 적합한 형식으로 변환되어야 합니다. 애플리케이션이 리소스를 처음 요청할 때 변환이 비동기적으로 수행되며, 이로 인해 다시 깜빡임 현상이 발생할 수 있습니다. 이러한 경험을 더욱 최적화하기 위해 Compose Multiplatform 리소스에는 더 높은 수준의 리소스 표현을 위한 자체 내부 캐시가 있으며, 이 역시 프리로딩할 수 있습니다.

Compose Multiplatform 1.8.0에서는 웹 타겟에서 폰트 및 이미지 리소스를 프리로딩하기 위한 실험적 API인 `preloadFont()`, `preloadImageBitmap()`, `preloadImageVector()`를 도입했습니다.

렌더링 중에 확인되지 않은 문자가 발견되면, 누락된 문자가 포함된 폴백 폰트가 [자동으로 다운로드되므로](#automatic-font-fallback) 이모지와 같은 특수 문자가 기본적으로 지원됩니다.

자동 폴백에 의존하는 대신 어떤 폴백 폰트를 사용할지 직접 제어하고 싶다면, `FontFamily.Resolver.preload()` 메서드를 사용하여 수동으로 지정하세요.
웹 타겟은 TTF, OTF, TTC, 가변(variable) 및 WOFF/WOFF2 폰트 형식을 지원합니다.

다음 예제는 벡터 이미지의 프리로딩을 사용하는 방법을 보여줍니다.

```kotlin
@OptIn(ExperimentalComposeUiApi::class, ExperimentalResourceApi::class)
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

## 자동 폰트 폴백
<primary-label ref="Experimental"/>

기본적으로 애플리케이션에 로드된 폰트에서 지원하지 않는 문자는 대체 글리프(□, "[토푸(tofu)](https://fonts.google.com/knowledge/glossary/tofu)"라고도 함)로 표시됩니다.

[//]: # (TODO update version for stable release)

버전 1.12.0-beta01부터 Compose Multiplatform은 렌더링 중에 확인되지 않은 문자를 모니터링하고 필요한 Noto 폰트 서브셋을 필요에 따라 다운로드합니다. Noto라는 이름은 "no tofu"의 약자로, 이 폰트들은 토푸 글리프를 없애기 위해 설계되었습니다.

폰트를 사용할 수 있게 되면 해당 텍스트는 리컴포지션(recomposition)됩니다. 다운로드 중에 토푸가 잠시 나타날 수 있습니다.

CJK(한중일: 중국어, 일본어, 한국어) 문자의 경우, 브라우저의 언어 설정에 따라 올바른 폰트 변체가 자동으로 선택됩니다.

## 웹 리소스 캐싱
<primary-label ref="Experimental"/>

Compose Multiplatform은 [Web Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache)를 사용하여 성공적인 응답을 캐싱하고, 브라우저의 기본 캐싱 메커니즘에 의해 일반적으로 수행되는 중복 HTTP 재검증(revalidation)을 방지합니다.

캐시는 앱을 실행할 때마다 그리고 페이지를 새로고침할 때마다 전역적으로 지워집니다. 이 단계에서 캐시를 초기화하면 리소스의 일관성이 보장됩니다. 여러 세션에 걸쳐 캐시를 재사용할 경우 리소스가 오래되거나 호환되지 않아 애플리케이션 충돌 또는 논리적 불일치가 발생할 수 있기 때문입니다.

동일한 리소스에 대한 중복된 동시 페칭을 방지하기 위해, 구현 시 리소스별 락(lock)을 사용합니다. 각 요청은 리소스별 뮤텍스(mutex)에 의해 보호되며, 서로 다른 리소스에 대한 병렬 요청을 허용하는 동시에 동일한 경로에 대한 중복 요청은 직렬화합니다. 이 설계는 불필요한 네트워크 트래픽을 최소화하고 캐시 생성 중 발생하는 레이스 컨디션(race condition)을 제거합니다.

## 다음 단계

* [리소스 설정](compose-multiplatform-resources-setup.md) 및 [앱에서 리소스 사용](compose-multiplatform-resources-usage.md)에 대해 자세히 알아보세요.
* 인앱 테마 및 언어와 같은 애플리케이션의 [리소스 환경](compose-resource-environment.md)을 관리하는 방법을 알아보세요.