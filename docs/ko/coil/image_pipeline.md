# 이미지 파이프라인 확장하기

안드로이드는 다양한 [이미지 형식](https://developer.android.com/guide/topics/media/media-formats#image-formats)을 기본적으로 지원하지만, 지원하지 않는 형식도 많이 있습니다 (예: GIF, SVG, MP4 등).

다행히 [ImageLoader](image_loaders.md)는 새로운 캐시 레이어, 새로운 데이터 타입, 새로운 페칭(fetching) 동작, 새로운 이미지 인코딩을 추가하거나 기본 이미지 로딩 동작을 덮어쓸 수 있는 플러그형 컴포넌트를 지원합니다. Coil의 이미지 파이프라인은 [Interceptors](/coil/api/coil-core/coil3.intercept/-interceptor), [Mappers](/coil/api/coil-core/coil3.map/-mapper), [Keyers](/coil/api/coil-core/coil3.key/-keyer), [Fetchers](/coil/api/coil-core/coil3.fetch/-fetcher), [Decoders](/coil/api/coil-core/coil3.decode/-decoder)의 다섯 가지 주요 부분으로 구성되며 다음 순서대로 실행됩니다.

커스텀 컴포넌트는 `ImageLoader`를 생성할 때 [ComponentRegistry](/coil/api/coil-core/coil3/-component-registry)를 통해 추가해야 합니다.

```kotlin
val imageLoader = ImageLoader.Builder(context)
    .components {
        add(CustomCacheInterceptor())
        add(ItemMapper())
        add(HttpUrlKeyer())
        add(CronetFetcher.Factory())
        add(GifDecoder.Factory())
    }
    .build()
```

## 인터셉터 (Interceptors)

인터셉터(Interceptors)를 사용하면 `ImageLoader` 이미지 엔진에 대한 요청을 관찰, 변환, 중단(short circuit) 또는 재시도할 수 있습니다. 예를 들어, 다음과 같이 커스텀 캐시 레이어를 추가할 수 있습니다.

```kotlin
class CustomCacheInterceptor(
    private val context: Context,
    private val cache: LruCache<String, Image>,
) : Interceptor {

    override suspend fun intercept(chain: Interceptor.Chain): ImageResult {
        val value = cache.get(chain.request.data.toString())
        if (value != null) {
            return SuccessResult(
                image = value.bitmap.asImage(),
                request = chain.request,
                dataSource = DataSource.MEMORY_CACHE,
            )
        }
        return chain.proceed()
    }
}
```

인터셉터는 `ImageLoader`의 이미지 파이프라인을 커스텀 로직으로 감쌀 수 있게 해주는 고급 기능입니다. 이 디자인은 [OkHttp의 `Interceptor` 인터페이스](https://square.github.io/okhttp/interceptors/#interceptors)를 기반으로 합니다.

자세한 내용은 [Interceptor](/coil/api/coil-core/coil3.intercept/-interceptor)를 참고하세요.

## 매퍼 (Mappers)

매퍼(Mappers)를 사용하면 커스텀 데이터 타입에 대한 지원을 추가할 수 있습니다. 예를 들어, 서버로부터 다음과 같은 모델을 받는다고 가정해 보겠습니다.

```kotlin
data class Item(
    val id: Int,
    val imageUrl: String,
    val price: Int,
    val weight: Double
)
```

이 모델을 파이프라인의 뒷부분에서 처리할 URL로 매핑하는 커스텀 매퍼를 작성할 수 있습니다.

```kotlin
class ItemMapper : Mapper<Item, String> {
    override fun map(data: Item, options: Options) = data.imageUrl
}
```

`ImageLoader`를 빌드할 때 이를 등록하면(위 내용 참고), 안전하게 `Item`을 로드할 수 있습니다.

```kotlin
val request = ImageRequest.Builder(context)
    .data(item)
    .target(imageView)
    .build()
imageLoader.enqueue(request)
```

자세한 내용은 [Mapper](/coil/api/coil-core/coil3.map/-mapper)를 참고하세요.

## 키어 (Keyers)

키어(Keyers)는 데이터를 캐시 키의 일부로 변환합니다. 이 값은 해당 요청의 결과가 `MemoryCache`에 기록될 때 `MemoryCache.Key.key`로 사용됩니다.

자세한 내용은 [Keyers](/coil/api/coil-core/coil3.key/-keyer)를 참고하세요.

## 페처 (Fetchers)

페처(Fetchers)는 데이터(예: URL, URI, File 등)를 `ImageSource` 또는 `Image`로 변환합니다. 일반적으로 입력 데이터를 `Decoder`가 사용할 수 있는 형식으로 변환합니다. 이 인터페이스를 사용하여 커스텀 페칭 메커니즘(예: Cronet, 커스텀 URI 스킴 등)에 대한 지원을 추가할 수 있습니다.

자세한 내용은 [Fetcher](/coil/api/coil-core/coil3.fetch/-fetcher)를 참고하세요.

!!! Note
    커스텀 데이터 타입을 사용하는 `Fetcher`를 추가하는 경우, 해당 데이터를 사용하는 요청 결과가 메모리에 캐싱될 수 있도록 커스텀 `Keyer`도 함께 제공해야 합니다. 예를 들어, `Fetcher.Factory<MyDataType>`을 추가한다면 `Keyer<MyDataType>`도 추가해야 합니다.

## 디코더 (Decoders)

디코더(Decoders)는 `ImageSource`를 읽고 `Image`를 반환합니다. 이 인터페이스를 사용하여 커스텀 파일 형식(예: GIF, SVG, TIFF 등)에 대한 지원을 추가할 수 있습니다.

자세한 내용은 [Decoder](/coil/api/coil-core/coil3.decode/-decoder)를 참고하세요.

## 커스텀 ImageLoader 및 ImageRequest 속성

Coil은 `Extras`를 통해 `ImageRequest`와 `ImageLoader`에 커스텀 데이터를 첨부하는 것을 지원합니다. `Extras`는 `Extras.Key`를 통해 참조되는 추가 속성들의 맵(map)입니다.

예를 들어, 각 `ImageRequest`에 대해 커스텀 타임아웃(timeout)을 지원하고 싶다고 가정해 보겠습니다. 다음과 같이 커스텀 확장 함수를 추가할 수 있습니다.

```kotlin
fun ImageRequest.Builder.timeout(timeout: Duration) = apply {
    extras[timeoutKey] = timeout
}

fun ImageLoader.Builder.timeout(timeout: Duration) = apply {
    extras[timeoutKey] = timeout
}

val ImageRequest.timeout: Duration
    get() = getExtra(timeoutKey)

val Options.timeout: Duration
    get() = getExtra(timeoutKey)

// 참고: Extras.Key 인스턴스는 인스턴스 동일성(equality)으로 비교되므로 정적으로 선언해야 합니다.
private val timeoutKey = Extras.Key(default = Duration.INFINITE)
```

그런 다음 `ImageLoader`에 등록할 커스텀 `Interceptor` 내부에서 해당 속성을 읽을 수 있습니다.

```kotlin
class TimeoutInterceptor : Interceptor {
    override suspend fun intercept(chain: Interceptor.Chain): ImageResult {
        val timeout = chain.request.timeout
        if (timeout.isFinite()) {
            return withTimeout(timeout) {
                chain.proceed()
            }
        } else {
            return chain.proceed()
        }
    }
}
```

마지막으로, `ImageRequest`를 생성할 때 속성을 설정할 수 있습니다.

```kotlin
AsyncImage(
    model = ImageRequest.Builder(LocalPlatformContext.current)
        .data("https://example.com/image.jpg")
        .timeout(10.seconds)
        .build(),
    contentDescription = null,
)
```

추가로:

- 우리가 정의한 `ImageLoader.Builder.timeout` 확장 함수를 통해 기본 타임아웃 값을 설정할 수 있습니다.
- 우리가 정의한 `Options.timeout` 확장 함수를 통해 `Mapper`, `Fetcher`, `Decoder` 내부에서 타임아웃을 읽을 수 있습니다.

[Coil 자체도 이 패턴을 사용](https://github.com/coil-kt/coil/blob/main/coil-gif/src/main/java/coil3/gif/imageRequests.kt)하여 `coil-gif` 및 기타 확장 라이브러리에서 GIF용 커스텀 요청 속성 등을 지원합니다.

## 컴포넌트 체이닝 (Chaining components)

Coil의 이미지 로더 컴포넌트의 유용한 특징 중 하나는 내부적으로 체이닝(chaining)이 가능하다는 점입니다. 예를 들어, 로드할 이미지 URL을 가져오기 위해 네트워크 요청을 수행해야 하는 경우를 생각해 보겠습니다.

먼저, 페처만 처리할 커스텀 데이터 타입을 만듭니다.

```kotlin
data class PartialUrl(
    val baseUrl: String,
)
```

그런 다음 이미지 URL을 가져와서 내부 네트워크 페처에 위임하는 커스텀 `Fetcher`를 만듭니다.

```kotlin
class PartialUrlFetcher(
    private val callFactory: Call.Factory,
    private val partialUrl: PartialUrl,
    private val options: Options,
    private val imageLoader: ImageLoader,
) : Fetcher {

    override suspend fun fetch(): FetchResult? {
        val request = Request.Builder()
            .url(partialUrl.baseUrl)
            .build()
        val response = callFactory.newCall(request).await()

        // 이미지 URL을 읽습니다.
        val imageUrl: String = readImageUrl(response.body)

        // 내부 네트워크 페처에 위임합니다.
        val data = imageLoader.components.map(imageUrl, options)
        val output = imageLoader.components.newFetcher(data, options, imageLoader)
        val (fetcher) = checkNotNull(output) { "no supported fetcher" }
        return fetcher.fetch()
    }

    class Factory(
        private val callFactory: Call.Factory = OkHttpClient(),
    ) : Fetcher.Factory<PartialUrl> {
        override fun create(data: PartialUrl, options: Options, imageLoader: ImageLoader): Fetcher {
            return PartialUrlFetcher(callFactory, data, options, imageLoader)
        }
    }
}
```

마지막으로 할 일은 `ComponentRegistry`에 이 `Fetcher`를 등록하고 `model`/`data`로 `PartialUrl`을 전달하는 것입니다.

```kotlin
AsyncImage(
    model = PartialUrl("https://example.com/image.jpg"),
    contentDescription = null,
)
```

이 패턴은 `Mapper`, `Keyer`, `Decoder`에도 비슷하게 적용될 수 있습니다.