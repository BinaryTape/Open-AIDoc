# 레시피

이 페이지는 Coil을 사용하여 몇 가지 일반적인 사용 사례를 처리하는 방법에 대한 가이드를 제공합니다. 정확한 요구 사항에 맞게 이 코드를 수정해야 할 수도 있지만, 올바른 방향을 잡는 데 도움이 될 것입니다!

여기에 포함되지 않은 일반적인 사용 사례가 있나요? 새로운 섹션과 함께 PR을 자유롭게 제출해 주세요.

## Palette

[Palette](https://developer.android.com/training/material/palette-colors?hl=en)를 사용하면 이미지에서 주요 색상을 추출할 수 있습니다. `Palette`를 생성하려면 이미지의 `Bitmap`에 접근해야 합니다. 이는 다음과 같은 방법으로 수행할 수 있습니다.

`ImageRequest.Listener`를 설정하고 `ImageRequest`를 큐에 추가(enqueue)하여 이미지의 비트맵에 접근할 수 있습니다:

```kotlin
imageView.load("https://example.com/image.jpg") {
    // Palette는 이미지의 픽셀을 읽어야 하므로 하드웨어 비트맵을 비활성화합니다.
    allowHardware(false)
    listener(
        onSuccess = { _, result ->
            // 백그라운드 스레드에서 팔레트를 생성합니다.
            Palette.Builder(result.image.toBitmap()).generate { palette ->
                // 팔레트를 사용합니다.
            }
        }
    )
}
```

## 메모리 캐시 키를 플레이스홀더로 사용하기

이전 요청의 `MemoryCache.Key`를 후속 요청의 플레이스홀더(placeholder)로 사용하는 것은, 두 이미지는 동일하지만 서로 다른 크기로 로드되는 경우 유용할 수 있습니다. 예를 들어, 첫 번째 요청에서 이미지를 100x100으로 로드하고 두 번째 요청에서 500x500으로 로드한다면, 첫 번째 이미지를 두 번째 요청의 동기식 플레이스홀더로 사용할 수 있습니다.

샘플 앱에서 이 효과가 어떻게 보이는지 확인해 보세요:

<p style="text-align: center;">
    <video width="360" height="640" autoplay loop muted playsinline>
        <source src="../images/crossfade.mp4" type="video/mp4">
    </video>
</p>

*목록의 이미지는 시각적 효과를 강조하기 위해 의도적으로 매우 낮은 디테일로 로드되었으며 크로스페이드 속도가 느려졌습니다.*

이 효과를 구현하려면 첫 번째 요청의 `MemoryCache.Key`를 두 번째 요청의 `ImageRequest.placeholderMemoryCacheKey`로 사용하세요. 예시는 다음과 같습니다:

```kotlin
// 첫 번째 요청
listImageView.load("https://example.com/image.jpg")

// 두 번째 요청 (첫 번째 요청이 완료된 후)
detailImageView.load("https://example.com/image.jpg") {
    placeholderMemoryCacheKey(listImageView.result.memoryCacheKey)
}
```

## Compose AnimatedContent

`rememberAsyncImagePainter`와 `AnimatedContent`를 사용하여 플레이스홀더와 로드된 이미지 사이의 애니메이션을 적용할 수 있습니다.

```kotlin
val sizeResolver = rememberConstraintsSizeResolver()
val painter = rememberAsyncImagePainter(
    model = ImageRequest.Builder(LocalPlatformContext.current)
        .data("https://example.com/image.jpg")
        .size(sizeResolver)
        .build(),
)
val state by painter.state.collectAsState()

AnimatedContent(
    modifier = Modifier.then(sizeResolver),
    targetState = state,
    contentKey = { it::class },
    transitionSpec = { fadeIn() togetherWith fadeOut() },
) { targetState ->
    when (targetState) {
        is AsyncImagePainter.State.Empty,
        is AsyncImagePainter.State.Loading -> PlaceholderContent()
        is AsyncImagePainter.State.Success -> {
            // 모델이 변경된 후 이전 이미지가 애니메이션과 함께 사라지는 동안 계속 표시되도록 합니다.
            Image(
                painter = targetState.painter,
                contentDescription = stringResource(R.string.description),
            )
        }
        is AsyncImagePainter.State.Error -> ErrorContent()
    }
}
```

`targetState.painter`를 `Image`에 전달하면 모델이 변경된 후 이전 이미지가 애니메이션을 통해 사라질 때까지 계속 표시됩니다.

최종 이미지 크기는 로딩이 완료될 때까지 알 수 없습니다. 공간을 미리 확보하려면 고정된 제약 조건(constraints)이나 미리 알고 있는 가로세로 비율(aspect ratio)을 사용하세요.

`rememberAsyncImagePainter`는 이미지가 메모리 캐시에 있는 경우에도 `State.Empty`로 시작합니다. 필요한 경우 `state.result.dataSource`를 사용하여 메모리 캐시된 이미지에 대한 애니메이션을 건너뛰도록 처리하세요.

참고: `AnimatedContent`는 Painter 크로스페이드보다 훨씬 비용이 많이 들며 애니메이션이 끝날 때까지 이전 이미지를 메모리에 유지합니다. 지연 목록(lazy lists)이나 단순한 페이드 효과에는 `ImageRequest.Builder.crossfade`를 사용하는 것이 좋습니다.

## 공유 요소 전환 (Shared Element Transitions)

[공유 요소 전환(Shared element transitions)](https://developer.android.com/training/transitions/start-activity)을 사용하면 `Activity`와 `Fragment` 간에 애니메이션을 적용할 수 있습니다. Coil과 함께 작동하도록 하기 위한 몇 가지 권장 사항은 다음과 같습니다:

- **공유 요소 전환은 하드웨어 비트맵과 호환되지 않습니다.** 애니메이션을 시작하는 `ImageView`와 애니메이션 대상이 되는 뷰 모두에 대해 하드웨어 비트맵을 비활성화하도록 `allowHardware(false)`를 설정해야 합니다. 그렇지 않으면 전환 시 `java.lang.IllegalArgumentException: Software rendering doesn't support hardware bitmaps` 예외가 발생합니다.

- 시작 이미지의 `MemoryCache.Key`를 종료 이미지의 [`placeholderMemoryCacheKey`](/coil/api/coil-core/coil3.request/-image-request/-builder/placeholder-memory-cache-key)로 사용하세요. 이렇게 하면 시작 이미지가 종료 이미지의 플레이스홀더로 사용되어, 이미지가 메모리 캐시에 있는 경우 흰색 깜빡임 없이 매끄러운 전환이 보장됩니다.

- 최적의 결과를 얻으려면 [`ChangeImageTransform`](https://developer.android.com/reference/android/transition/ChangeImageTransform)과 [`ChangeBounds`](https://developer.android.com/reference/android/transition/ChangeBounds)를 함께 사용하세요.

Compose를 사용하시나요? [`AsyncImage`로 공유 요소 전환을 수행하는 방법은 이 문서](https://www.tunjid.com/articles/animating-contentscale-during-image-shared-element-transitions-65fba03537c67f8df0161c31)를 확인하세요.

## 리모트 뷰 (Remote Views)

Coil은 [`RemoteViews`](https://developer.android.com/reference/android/widget/RemoteViews)를 위한 `Target`을 기본적으로 제공하지 않지만, 다음과 같이 직접 만들 수 있습니다:

```kotlin
class RemoteViewsTarget(
    private val context: Context,
    private val componentName: ComponentName,
    private val remoteViews: RemoteViews,
    @IdRes private val imageViewResId: Int
) : Target {

    override fun onStart(placeholder: Image?) = setImage(placeholder)

    override fun onError(error: Image?) = setImage(error)

    override fun onSuccess(result: Image) = setImage(result)

    private fun setImage(image: Image?) {
        remoteViews.setImageViewBitmap(imageViewResId, image?.toBitmap())
        AppWidgetManager.getInstance(context).updateAppWidget(componentName, remoteViews)
    }
}
```

그런 다음 평소와 같이 요청을 `enqueue`/`execute` 합니다:

```kotlin
val request = ImageRequest.Builder(context)
    .data("https://example.com/image.jpg")
    .target(RemoteViewsTarget(context, componentName, remoteViews, imageViewResId))
    .build()
imageLoader.enqueue(request)
```

## Painter 변형하기 (Transforming Painters)

`AsyncImage`와 `AsyncImagePainter` 모두 `Painter`를 허용하는 `placeholder`/`error`/`fallback` 인수를 가지고 있습니다. Painter는 컴포저블을 사용하는 것보다 유연성은 떨어지지만, Coil이 서브컴포지션(subcomposition)을 사용할 필요가 없기 때문에 더 빠릅니다. 하지만 원하는 UI를 얻기 위해 painter에 인셋(inset), 스트레치(stretch), 틴트(tint)를 적용하거나 변형해야 할 수도 있습니다. 이를 구현하려면 [이 Gist를 프로젝트에 복사](https://gist.github.com/colinrtwhite/c2966e0b8584b4cdf0a5b05786b20ae1)하고 다음과 같이 painter를 감싸세요:

```kotlin
AsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = null,
    placeholder = forwardingPainter(
        painter = painterResource(R.drawable.placeholder),
        colorFilter = ColorFilter(Color.Red),
        alpha = 0.5f,
    ),
)
```

`onDraw`는 후행 람다(trailing lambda)를 사용하여 덮어쓸 수 있습니다:

```kotlin
AsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = null,
    placeholder = forwardingPainter(painterResource(R.drawable.placeholder)) { info ->
        inset(50f, 50f) {
            with(info.painter) {
                draw(size, info.alpha, info.colorFilter)
            }
        }
    },
)
```

## 요청 변형하기 (Transforming Requests)

이미지를 가져오는 데 사용되는 HTTP 요청을 변형해야 할 수도 있습니다. 이 예제에서는 [인터셉터(Interceptor)](https://coil-kt.github.io/coil/api/coil-core/coil3.intercept/-interceptor)를 사용하여 요청 URL에 `width` 및 `height` 쿼리 파라미터를 추가해 보겠습니다.

```kotlin
class UrlSizeInterceptor : Interceptor {

    override suspend fun intercept(chain: Chain): ImageResult {
        val request = chain.request
        val uri = request.uri

        if (uri == null || uri.scheme !in setOf("https", "http")) {
            // HTTP가 아닌 요청은 무시합니다.
            return chain.proceed()
        }

        val (width, height) = chain.size
        return if (width is Pixels && height is Pixels) {
            val transformUri = uri.newBuilder()
                .query("width=${width.px}&height=${height.px}")
                .build()

            val transformedRequest = request.newBuilder()
                .data(transformUri)
                .build()
            return chain.withRequest(transformedRequest).proceed()
        } else {
            // 무한 제약 조건 등으로 인해 너비와 높이를 사용할 수 없는 경우입니다.
            chain.proceed()
        }
    }

    private val ImageRequest.uri: Uri?
        get() = when (val data = data) {
            is Uri -> data
            is coil3.Uri -> data.toAndroidUri()
            is String -> data.toUri()
            else -> null
        }
}
```

`ImageLoader`에 인터셉터를 추가하는 것을 잊지 마세요!

```kotlin
ImageLoader.Builder(context)
    .components {
        add(UrlSizeInterceptor())
    }
    .build()