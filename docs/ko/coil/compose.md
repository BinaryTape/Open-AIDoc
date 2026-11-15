# Compose

[Compose UI](https://www.jetbrains.com/compose-multiplatform/) 지원을 추가하려면 다음 확장 라이브러리를 추가합니다:

```kotlin
implementation("io.coil-kt.coil3:coil-compose:3.6.3")
```

그런 다음 `AsyncImage` 컴포저블을 사용하여 이미지를 로드하고 표시합니다:

```kotlin
AsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = null,
)
```

`model`은 `ImageRequest.data` 값이거나 `ImageRequest` 자체일 수 있습니다. `contentDescription`은 접근성 서비스에서 이 이미지가 나타내는 바를 설명하는 데 사용되는 텍스트를 설정합니다.

## AsyncImage {id="asyncimage"}

`AsyncImage`는 이미지 요청을 비동기식으로 실행하고 그 결과를 렌더링하는 컴포저블입니다. 표준 `Image` 컴포저블과 동일한 인수를 지원하며, 추가로 `placeholder`/`error`/`fallback` 페인터(painter) 및 `onLoading`/`onSuccess`/`onError` 콜백 설정을 지원합니다. 다음은 원형 크롭(circle crop), 크로스페이드(crossfade)를 적용하고 플레이스홀더를 설정하여 이미지를 로드하는 예제입니다:

```kotlin
AsyncImage(
    model = ImageRequest.Builder(LocalContext.current)
        .data("https://example.com/image.jpg")
        .crossfade(true)
        .build(),
    placeholder = painterResource(R.drawable.placeholder),
    contentDescription = stringResource(R.string.description),
    contentScale = ContentScale.Crop,
    modifier = Modifier.clip(CircleShape),
)
```

**이 함수를 사용해야 하는 경우:**

대부분의 경우 `AsyncImage`를 사용하는 것이 좋습니다. 이 함수는 컴포저블의 제약 조건(constraints)과 제공된 `ContentScale`을 기반으로 이미지를 로드해야 하는 크기를 올바르게 결정합니다.

## rememberAsyncImagePainter {id="rememberasyncimagepainter"}

내부적으로 `AsyncImage`와 `SubcomposeAsyncImage`는 `model`을 로드하기 위해 `rememberAsyncImagePainter`를 사용합니다. 컴포저블이 아닌 `Painter`가 필요한 경우 `rememberAsyncImagePainter`를 사용하여 이미지를 로드할 수 있습니다:

```kotlin
val painter = rememberAsyncImagePainter("https://example.com/image.jpg")
```

`rememberAsyncImagePainter`는 `AsyncImage` 및 `SubcomposeAsyncImage`보다 유연하지만 몇 가지 단점이 있습니다(아래 참조).

**이 함수를 사용해야 하는 경우:**

컴포저블 대신 `Painter`가 필요하거나, `AsyncImagePainter.state`를 관찰하여 이에 따라 다른 컴포저블을 그려야 하거나, `AsyncImagePainter.restart`를 사용하여 이미지 요청을 수동으로 다시 시작해야 할 때 유용합니다.

이 함수의 주요 단점은 화면에 로드될 이미지의 크기를 감지하지 못하고 항상 원본 크기로 이미지를 로드한다는 점입니다. 사용자 지정 `SizeResolver`를 전달하거나 `rememberConstraintsSizeResolver`(`AsyncImage`가 내부적으로 사용하는 방식)를 사용하여 이 문제를 해결할 수 있습니다. 예제:

```kotlin
val sizeResolver = rememberConstraintsSizeResolver()
val painter = rememberAsyncImagePainter(
    model = ImageRequest.Builder(LocalPlatformContext.current)
        .data("https://example.com/image.jpg")
        .size(sizeResolver)
        .build(),
)

Image(
    painter = painter,
    contentDescription = null,
    modifier = Modifier.then(sizeResolver),
)
```

또 다른 단점은 `rememberAsyncImagePainter`를 사용할 때 첫 번째 컴포지션(composition)에서 `AsyncImagePainter.state`가 항상 `AsyncImagePainter.State.Empty`가 된다는 점입니다. 이는 이미지가 메모리 캐시에 존재하여 첫 번째 프레임에 그려지는 경우에도 마찬가지입니다.

## SubcomposeAsyncImage {id="subcomposeasyncimage"}

`SubcomposeAsyncImage`는 `Painter`를 사용하는 대신 서브컴포지션(subcomposition)을 사용하여 `AsyncImagePainter`의 상태에 대한 슬롯(slot) API를 제공하는 `AsyncImage`의 변형입니다. 다음은 예제입니다:

```kotlin
SubcomposeAsyncImage(
    model = "https://example.com/image.jpg",
    loading = {
        CircularProgressIndicator()
    },
    contentDescription = stringResource(R.string.description),
)
```

또한 `content` 인수와 현재 상태를 렌더링하는 `SubcomposeAsyncImageContent`를 사용하여 더 복잡한 로직을 구현할 수 있습니다:

```kotlin
SubcomposeAsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = stringResource(R.string.description)
) {
    val state by painter.state.collectAsState()
    if (state is AsyncImagePainter.State.Success) {
        SubcomposeAsyncImageContent()
    } else {
        CircularProgressIndicator()
    }
}
```

!!! Note
    서브컴포지션은 일반 컴포지션보다 느리므로 성능이 중요한 UI 부분(예: `LazyList`)에는 이 컴포저블이 적합하지 않을 수 있습니다.

**이 함수를 사용해야 하는 경우:**

서브컴포지션을 사용하지 않으므로, `AsyncImagePainter.state`를 관찰해야 하는 경우 일반적으로 이 함수 대신 `rememberAsyncImagePainter`를 사용하는 것이 좋습니다.

구체적으로 이 함수는 `AsyncImagePainter.state`를 관찰해야 하면서도 `rememberAsyncImagePainter`처럼 첫 번째 컴포지션과 첫 번째 프레임에서 `Empty` 상태가 되어서는 안 되는 경우에만 유용합니다. `SubcomposeAsyncImage`는 서브컴포지션을 사용하여 이미지의 제약 조건을 가져오므로 `AsyncImagePainter.state`가 즉시 최신 상태로 유지됩니다.

## AsyncImagePainter.state 관찰하기 {id="observing-asyncimagepainter-state"}

```kotlin
val painter = rememberAsyncImagePainter("https://example.com/image.jpg")
val state by painter.state.collectAsState()

when (state) {
    is AsyncImagePainter.State.Empty,
    is AsyncImagePainter.State.Loading -> {
        CircularProgressIndicator()
    }
    is AsyncImagePainter.State.Success -> {
        Image(
            painter = painter,
            contentDescription = stringResource(R.string.description)
        )
    }
    is AsyncImagePainter.State.Error -> {
        // 오류 UI 표시.
    }
}
```

## 트랜지션 {id="transitions"}

`ImageRequest.Builder.crossfade`를 사용하여 내장된 크로스페이드 트랜지션을 활성화할 수 있습니다:

```kotlin
AsyncImage(
    model = ImageRequest.Builder(LocalContext.current)
        .data("https://example.com/image.jpg")
        .crossfade(true)
        .build(),
    contentDescription = null,
)
```

커스텀 [`Transition`](/coil/api/coil-core/coil3.transition/-transition)은 `View` 참조가 필요하므로 `AsyncImage`, `SubcomposeAsyncImage` 또는 `rememberAsyncImagePainter`와 함께 작동하지 않습니다. `CrossfadeTransition`은 특별한 내부 지원 덕분에 작동합니다.

그렇더라도 Compose에서는 `AsyncImagePainter.state`를 관찰하여 커스텀 트랜지션을 만들 수 있습니다:

```kotlin
val painter = rememberAsyncImagePainter("https://example.com/image.jpg")

val state = painter.state.collectAsState().value
if (state is AsyncImagePainter.State.Success && state.result.dataSource != DataSource.MEMORY_CACHE) {
    // 트랜지션 애니메이션 수행.
}

Image(
    painter = painter,
    contentDescription = stringResource(R.string.description),
)
```

완전한 `AnimatedContent` 예제는 [Compose AnimatedContent](/coil/recipes#compose-animatedcontent)를 참고하세요.

## 프리뷰 {id="previews"}

`AsyncImage`/`rememberAsyncImagePainter`/`SubcomposeAsyncImage`의 Android Studio 프리뷰 동작은 `LocalAsyncImagePreviewHandler`에 의해 제어됩니다. 기본적으로 프리뷰 환경 내에서 정상적으로 요청을 수행하려고 시도합니다. 프리뷰 환경에서는 네트워크 액세스가 비활성화되어 있으므로 네트워크 URL 요청은 항상 실패합니다.

다음과 같이 프리뷰 동작을 재정의(override)할 수 있습니다:

```kotlin
val previewHandler = AsyncImagePreviewHandler {
    ColorImage(Color.Red.toArgb())
}

CompositionLocalProvider(LocalAsyncImagePreviewHandler provides previewHandler) {
    AsyncImage(
        model = "https://example.com/image.jpg",
        contentDescription = null,
    )
}
```

이는 동일한 프리뷰 환경에서 실행되는 [AndroidX의 Compose Preview Screenshot Testing 라이브러리](https://developer.android.com/studio/preview/compose-screenshot-testing)에서도 유용합니다.

## Compose Multiplatform Resources {id="compose-multiplatform-resources"}

Coil은 `model` 매개변수에 `Res.getUri`를 사용하여 [Compose Multiplatform Resources](https://www.jetbrains.com/help/kotlin-multiplatform-dev/compose-multiplatform-resources.html) 로드를 지원합니다. 예제:

```kotlin
AsyncImage(
    model = Res.getUri("drawable/sample.jpg"),
    contentDescription = null,
)
```

!!! Note
    Coil에서는 `Res.drawable.image` 및 기타 컴파일 안전(compile-safe) 참조를 지원하지 않습니다. 대신 `Res.getUri("drawable/image")`를 사용해야 합니다. [업데이트는 이 이슈를 참고하세요](https://github.com/coil-kt/coil/issues/2812).