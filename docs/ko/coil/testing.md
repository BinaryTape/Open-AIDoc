# 테스트

테스트 지원 클래스를 사용하려면 익스텐션 라이브러리를 임포트하세요:

```kotlin
testImplementation("io.coil-kt.coil3:coil-test:3.6.3")
```

`coil-test`에는 `FakeImageLoaderEngine`이 포함되어 있으며, 이를 `ImageLoader`에 추가하여 들어오는 모든 `ImageRequest`를 가로채고 커스텀 `ImageResult`를 반환할 수 있습니다. 이는 이미지 로딩을 (메인 스레드에서) 동기식으로 만들고 일관되게 유지해 주므로 테스트에 유용합니다. `FakeImageLoaderEngine`을 사용하면 `ImageLoader`는 이미지를 로드할 때 일반적으로 발생하는 모든 메모리 캐싱, 스레드 점핑(thread jumping), 디스크/네트워크 I/O 페칭(fetching) 및 이미지 디코딩을 수행하지 않습니다. 사용 예시는 다음과 같습니다:

```kotlin
val engine = FakeImageLoaderEngine.Builder()
    .intercept("https://example.com/image.jpg", ColorImage(Color.Red.toArgb()))
    .intercept({ it is String && it.endsWith("test.png") }, ColorImage(Color.Green.toArgb()))
    .default(ColorImage(Color.Blue.toArgb()))
    .build()
val imageLoader = ImageLoader.Builder(context)
    .components { add(engine) }
    .build()
```

`ColorImage`는 너비/높이에 따라 색상이 지정된 박스를 그리거나 캔버스를 색상으로 채울 수 있으며 모든 플랫폼에서 지원되므로 테스트에 유용합니다.

이 전략은 실제 기기나 에뮬레이터 없이 UI 스크린샷 테스트를 수행할 수 있는 [Paparazzi](https://github.com/cashapp/paparazzi)와 함께 사용하면 매우 효과적입니다:

```kotlin
class PaparazziTest {
    @get:Rule
    val paparazzi = Paparazzi()

    @Before
    fun before() {
        val engine = FakeImageLoaderEngine.Builder()
            .intercept("https://example.com/image.jpg", ColorImage(Color.Red.toArgb()))
            .intercept({ it is String && it.endsWith("test.png") }, ColorImage(Color.Green.toArgb()))
            .default(ColorImage(Color.Blue.toArgb()))
            .build()
        val imageLoader = ImageLoader.Builder(paparazzi.context)
            .components { add(engine) }
            .build()
        SingletonImageLoader.setUnsafe(imageLoader)
    }

    @Test
    fun testContentComposeRed() {
        // 빨간색 박스가 표시됩니다.
        paparazzi.snapshot {
            AsyncImage(
                model = "https://example.com/image.jpg",
                contentDescription = null,
            )
        }
    }

    @Test
    fun testContentComposeGreen() {
        // 초록색 박스가 표시됩니다.
        paparazzi.snapshot {
            AsyncImage(
                model = "https://www.example.com/test.png",
                contentDescription = null,
            )
        }
    }

    @Test
    fun testContentComposeBlue() {
        // 파란색 박스가 표시됩니다.
        paparazzi.snapshot {
            AsyncImage(
                model = "https://www.example.com/default.png",
                contentDescription = null,
            )
        }
    }
}