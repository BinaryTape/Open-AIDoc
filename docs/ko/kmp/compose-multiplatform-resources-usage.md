[//]: # (title: 앱에서 멀티플랫폼 리소스 사용하기)

<show-structure depth="2"/>

[프로젝트 리소스 설정](compose-multiplatform-resources-setup.md)을 완료한 후,
프로젝트를 빌드하면 리소스에 대한 접근을 제공하는 특수 클래스 `Res`가 생성됩니다.
`Res` 클래스와 모든 리소스 접근자(accessor)를 다시 생성하려면 프로젝트를 다시 빌드하거나 IDE에서 프로젝트를 다시 임포트하세요.

그 후, 생성된 클래스를 사용하여 코드나 외부 라이브러리에서 설정된 멀티플랫폼 리소스에 접근할 수 있습니다.

다음 주제에 대한 자세한 내용을 계속 읽어보세요:

* [생성된 `Res` 클래스 및 접근자 임포트](#생성된-클래스-임포트하기)
* [접근자 클래스 생성 커스터마이징](#접근자-클래스-생성-커스터마이징): public으로 설정하는 방법, 패키지 할당, 무조건 생성하도록 하는 방법
* 특정 리소스 유형 다루기: 
  * 단순 이미지, 래스터화된 이미지 또는 XML 벡터와 같은 [드로어블(Drawable) 리소스](#이미지)
  * Material Symbols 라이브러리의 [벡터 Android XML 아이콘](#아이콘)
  * 단순 문자열, 템플릿, 배열, 복수형(plurals)을 포함한 [문자열](#문자열)
  * [커스텀 폰트 저장 및 로드](#폰트)
  * [Raw 파일](#raw-파일) 및 바이트 배열을 이미지로 변환
* [문자열 ID로 매핑된 리소스 접근](#리소스-및-문자열-id에-대해-생성된-맵)
* [멀티플랫폼 리소스를 Android 에셋으로 사용](#android-에셋으로-compose-multiplatform-리소스-사용하기)
* 웹 전용 리소스 처리:
  * 브라우저 기능 및 프리로드 API를 사용한 [리소스 프리로드](compose-web-resources.md#preloading-of-resources-for-web-targets)
  * 누락된 문자에 대한 [자동 폰트 대체(fallback)](compose-web-resources.md#automatic-font-fallback)
  * [웹 리소스 캐싱](compose-web-resources.md#caching-web-resources)
* 외부 리소스 다루기: 
  [외부 라이브러리 리소스](#외부-라이브러리의-멀티플랫폼-리소스-접근하기),
  [원격 파일](#원격-파일), [Java 리소스](#java-리소스-사용하기)

## 생성된 클래스 임포트하기 {id="importing-the-generated-class"}

준비된 리소스를 사용하려면 다음과 같이 생성된 클래스를 임포트합니다:

```kotlin
import project.shared.generated.resources.Res
import project.shared.generated.resources.example_image
```

여기서:
* `project`는 프로젝트의 이름입니다.
* `shared`는 리소스 디렉터리가 위치한 모듈입니다.
* `Res`는 생성된 클래스의 기본 이름입니다.
* `example_image`는 `composeResources/drawable` 디렉터리에 있는 이미지 파일의 이름입니다(예: `example_image.png`).

## 접근자 클래스 생성 커스터마이징 {id="customizing-accessor-class-generation"}

Gradle 설정을 사용하여 필요에 맞게 생성되는 `Res` 클래스를 커스터마이징할 수 있습니다.

`build.gradle.kts` 파일의 `compose.resources {}` 블록에서 프로젝트에 맞게
`Res` 클래스가 생성되는 방식에 영향을 주는 여러 설정을 지정할 수 있습니다.
설정 예시는 다음과 같습니다:

```kotlin
compose.resources {
    publicResClass = false
    packageOfResClass = "me.sample.library.resources"
    generateResClass = auto
}
```

* `publicResClass`를 `true`로 설정하면 생성된 `Res` 클래스가 public이 됩니다. 기본적으로 생성된 클래스는 [internal](https://kotlinlang.org/docs/visibility-modifiers.html)입니다.
* `packageOfResClass`를 사용하면 생성된 `Res` 클래스를 특정 패키지에 할당할 수 있습니다(코드 내에서의 접근뿐만 아니라 최종 아티팩트에서의 격리를 위해). 기본적으로 Compose Multiplatform은 클래스에 `{group name}.{module name}.generated.resources` 패키지를 할당합니다.
* `generateResClass`를 `always`로 설정하면 프로젝트에서 `Res` 클래스를 무조건 생성합니다. 이는 리소스 라이브러리를 전이적으로(transitively)만 사용할 수 있는 경우에 유용할 수 있습니다. 기본적으로 Compose Multiplatform은 `auto` 값을 사용하여 현재 프로젝트에 리소스 라이브러리에 대한 명시적인 `implementation` 또는 `api` 의존성이 있는 경우에만 `Res` 클래스를 생성합니다.

## 리소스 사용법 {id="resource-usage"}

### 이미지 {id="images"}

드로어블 리소스는 단순 이미지, 래스터화된 이미지 또는 XML 벡터로 접근할 수 있습니다.
SVG 이미지는 Android를 **제외한** 모든 플랫폼에서 지원됩니다.

* 드로어블 리소스에 `Painter` 이미지로 접근하려면 `painterResource()` 함수를 사용하세요:

  ```kotlin
  @Composable
  fun painterResource(resource: DrawableResource): Painter {...}
  ```

  `painterResource()` 함수는 리소스 경로를 받아 `Painter` 값을 반환합니다. 이 함수는 웹을 제외한 모든 타깃에서 동기적으로 작동합니다. 웹 타깃의 경우 첫 번째 리컴포지션에서는 빈 `Painter`를 반환하고, 후속 리컴포지션에서 로드된 이미지로 대체됩니다.

  * `painterResource()`는 `.png`, `.jpg`, `.bmp`, `.webp`와 같은 래스터 이미지 형식의 경우 `BitmapPainter`를 로드하고, Android XML 벡터 드로어블 형식의 경우 `VectorPainter`를 로드합니다.
  * XML 벡터 드로어블은 Android 리소스에 대한 외부 참조를 지원하지 않는다는 점을 제외하고는 [Android](https://developer.android.com/reference/android/graphics/drawable/VectorDrawable)와 동일한 형식을 가집니다.

* 드로어블 리소스에 `ImageBitmap` 래스터 이미지로 접근하려면 `imageResource()` 함수를 사용하세요:

  ```kotlin
  @Composable
  fun imageResource(resource: DrawableResource): ImageBitmap {...}
  ```

* 드로어블 리소스에 `ImageVector` XML 벡터로 접근하려면 `vectorResource()` 함수를 사용하세요:

  ```kotlin
  @Composable
  fun vectorResource(resource: DrawableResource): ImageVector {...}
  ```

다음은 Compose Multiplatform 코드에서 이미지에 접근하는 방법에 대한 예시입니다:

```kotlin
Image(
    painter = painterResource(Res.drawable.my_image),
    contentDescription = null
)
```

#### 캔버스에 이미지 그리기 {id="drawing-images-on-a-canvas"}

리소스 이미지를 `Image()` 컴포저블로 표시하는 대신 직접 그리려면 `ImageBitmap` 또는 `ImageVector`로 로드하여 `DrawScope`에서 사용하세요:

* `ImageBitmap`을 그리려면 `DrawScope.drawImage()`를 사용하세요.
* `ImageVector`를 그리려면 `rememberVectorPainter()`로 `Painter`를 생성한 후 `Painter.draw()`를 사용하세요.

`DrawScope`의 오프셋과 크기는 픽셀 단위로 지정합니다:

```kotlin
val myImageRaster = imageResource(Res.drawable.my_image_raster)
val myImageVectorPainter = rememberVectorPainter(vectorResource(Res.drawable.my_image_vector))

Canvas(modifier = Modifier.fillMaxSize()) {
    // 람다 내부에서 `this`는 `drawImage()` 및 `translate()`를 제공하는 `DrawScope`의 인스턴스입니다.
    drawImage(image = myImageRaster, topLeft = Offset(20f, 20f))
    translate(left = 20f, top = myImageRaster.height + 40f) {
        // `Painter.draw()` 함수는 `DrawScope`와 `Painter` 모두를 수신 객체(receiver)로 사용합니다.
        with(myImageVectorPainter) {
            draw(Size(200f, 200f))
        }
    }
}
```

### 아이콘 {id="icons"}

Material Symbols 라이브러리의 벡터 Android XML 아이콘을 사용할 수 있습니다:

1. [Google Fonts Icons](https://fonts.google.com/icons) 갤러리를 열고, 아이콘을 선택한 다음 Android 탭으로 이동하여 **Download**를 클릭합니다.

2. 다운로드한 XML 아이콘 파일을 멀티플랫폼 리소스의 `drawable` 디렉터리에 추가합니다.

3. XML 아이콘 파일을 열고 `android:fillColor`를 `#000000`으로 설정합니다.
   색상 조정을 위한 `android:tint`와 같은 기타 Android 전용 속성은 모두 제거합니다.

   수정 전:

   ```xml
   <vector xmlns:android="http://schemas.android.com/apk/res/android"
        android:width="24dp"
        android:height="24dp"
        android:viewportWidth="960"
        android:viewportHeight="960"
        android:tint="?attr/colorControlNormal">
        <path
            android:fillColor="@android:color/white"
            android:pathData="..."/>
    </vector>
   ```
   
   수정 후:

   ```xml
   <vector xmlns:android="http://schemas.android.com/apk/res/android"
        android:width="24dp"
        android:height="24dp"
        android:viewportWidth="960"
        android:viewportHeight="960">
        <path
            android:fillColor="#000000"
            android:pathData="..."/>
   </vector>
   ```
   
4. 프로젝트를 빌드하여 리소스 접근자를 생성하거나,
   [Kotlin Multiplatform IDE 플러그인](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)이 이를 자동으로 처리하도록 합니다.

다음은 Compose Multiplatform 코드에서 아이콘에 접근하고 `colorFilter` 매개변수를 사용하여 색상을 조정하는 방법의 예시입니다:

```kotlin
Image(
    painter = painterResource(Res.drawable.ic_sample_icon),
    contentDescription = "Sample icon",
    modifier = Modifier.size(24.dp),
    colorFilter = ColorFilter.tint(Color.Blue)
)
```

### 문자열 {id="strings"}

모든 문자열 리소스는 `composeResources/values` 디렉터리의 XML 파일에 저장합니다.
각 파일의 각 항목에 대해 정적 접근자가 생성됩니다.

[Kotlin Multiplatform IDE 플러그인](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)은 XML 파일에서 직접 문자열 리소스, 문자열 배열 및 복수형을 추가할 수 있는 Emmet 스타일의 단축 문법을 지원합니다.
예를 들어 `strings.xml`에서 `test{Example}` 또는 `s.test{Example}`을 입력하고 **Tab** 키를 누르면
자동으로 `<string name="test">Example</string>`으로 확장됩니다.

다양한 언어에 맞춰 문자열을 현지화(로컬라이즈)하는 방법은 
[문자열 현지화 가이드](compose-localize-strings.md)를 참조하세요.

#### 단순 문자열 {id="simple-strings"}

단순 문자열을 저장하려면 XML에 `<string>` 요소를 추가합니다:

```XML
<resources>
    <string name="app_name">My awesome app</string>
    <string name="title">Some title</string>
</resources>
```

문자열 리소스를 `String`으로 가져오려면 다음 코드를 사용하세요:

<Tabs>
<TabItem title= "컴포저블 코드에서">

```kotlin
@Composable
fun stringResource(resource: StringResource): String {...}

@Composable
fun stringResource(resource: StringResource, vararg formatArgs: Any): String {...}
```

예시:

```kotlin
Text(stringResource(Res.string.app_name))
```

</TabItem>
<TabItem title= "비컴포저블 코드에서">

```kotlin
suspend fun getString(resource: StringResource): String

suspend fun getString(resource: StringResource, vararg formatArgs: Any): String
```

예시:

```kotlin
coroutineScope.launch {
    val appName = getString(Res.string.app_name)
}
```

</TabItem>
</Tabs>

문자열 리소스에는 다음과 같은 특수 기호를 사용할 수 있습니다:

* `\n` – 줄 바꿈
* `\t` – 탭 기호
* `\uXXXX` – 특정 유니코드 문자

[Android 문자열](https://developer.android.com/guide/topics/resources/string-resource#escaping_quotes)에서처럼
"@" 또는 "?"와 같은 특수 XML 문자를 이스케이프할 필요가 없습니다.

> [Kotlin Multiplatform 플러그인](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)이 설치된 IDE에서는
> **Tab** 키를 눌러 Emmet 스타일의 약어를 문자열 태그로 확장할 수 있습니다:
> * `test` → `<string name="test"></string>`
> * `test{Example}` → `<string name="test">Example</string>`
>
{style="tip"}

#### 문자열 템플릿 {id="string-templates"}

현재 문자열 리소스의 인자는 기본적인 수준으로 지원됩니다.
템플릿을 생성할 때는 `%<number>` 형식을 사용하여 문자열 내에 인자를 배치하고,
단순한 텍스트가 아닌 변수 플레이스홀더임을 나타내기 위해 `$d` 또는 `$s` 접미사를 포함하세요.
예시:

```XML
<resources>
    <string name="str_template">Hello, %2$s! You have %1$d new messages.</string>
</resources>
```

문자열 템플릿 리소스를 생성하고 임포트한 후에는 올바른 순서로 플레이스홀더에 대한 인자를 전달하면서
해당 리소스를 참조할 수 있습니다:

```kotlin
Text(stringResource(Res.string.str_template, 100, "User_name"))
```

`$s`와 `$d` 접미사 사이에는 차이가 없으며, 다른 접미사는 지원되지 않습니다.
리소스 문자열에 `%1$s` 플레이스홀더를 배치하고 이를 사용하여 소수를 표시할 수도 있습니다. 예:

```kotlin
Text(stringResource(Res.string.str_template, "User_name", 100.1f))
```

> [Kotlin Multiplatform 플러그인](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)이 설치된 IDE에서는
> 플레이스홀더를 위해 `%1$s`나 `%2$d`를 직접 입력하는 대신 인라인 숫자 단축키를 사용할 수 있습니다.
> 예를 들어 문자열 값 내에서 `1` 또는 `1s`를 입력하면 `%1$s`로 확장됩니다.
> 마찬가지로 `2d`를 입력하면 `%2$d`로 확장됩니다.
> 
{style="tip"}

#### 문자열 배열 {id="string-arrays"}

관련된 문자열들을 배열로 묶어 `List<String>` 객체로 자동 접근할 수 있습니다:

```XML
<resources>
    <string name="app_name">My awesome app</string>
    <string name="title">Some title</string>
    <string-array name="str_arr">
        <item>item \u2605</item>
        <item>item \u2318</item>
        <item>item \u00BD</item>
    </string-array>
</resources>
```

해당 목록을 가져오려면 다음 코드를 사용하세요:

<Tabs>
<TabItem title= "컴포저블 코드에서">

```kotlin
@Composable
fun stringArrayResource(resource: StringArrayResource): List<String> {...}
```

예시:

```kotlin
val arr = stringArrayResource(Res.array.str_arr)
if (arr.isNotEmpty()) Text(arr[0])
```

</TabItem>
<TabItem title= "비컴포저블 코드에서">

```kotlin
suspend fun getStringArray(resource: StringArrayResource): List<String>
```

예시:

```kotlin
coroutineScope.launch {
    val appName = getStringArray(Res.array.str_arr)
}
```

</TabItem>
</Tabs>

> [Kotlin Multiplatform 플러그인](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)이 설치된 IDE에서는
> Emmet 스타일의 문법을 사용하여 문자열 배열을 빠르게 정의할 수 있습니다.
> `string-array`, `sa` 또는 `>` 연산자를 사용하여 빈 배열 템플릿을 생성할 수 있습니다.
> 미리 정의된 항목 수와 시작 텍스트를 가진 이름 있는 배열의 경우, `test>2{Hello}`를 입력하고 **Tab** 키를 누릅니다:
> ```xml
> <string-array name="test">
>    <item>Hello</item>
>    <item>Hello</item>
> </string-array>
> ```
>
{style="tip"}

#### 복수형 (Plurals) {id="plurals"}

UI에서 항목의 수량을 표시할 때, 프로그래밍 방식으로 별개의 문자열을 일일이 만들지 않고도
동일한 대상의 수량 차이에 따른 문법적 일치(예: 한 권의 _book_, 여러 권의 _books_ 등)를 지원하고 싶을 수 있습니다.

Compose Multiplatform의 개념과 기본 구현은 Android의 수량 문자열(quantity strings)과 동일합니다.
프로젝트에서 복수형을 사용할 때의 모범 사례와 세부 사항에 대한 자세한 내용은
[Android 공식 문서](https://developer.android.com/guide/topics/resources/string-resource#Plurals)를 참조하세요.

* 지원되는 변형은 `zero`, `one`, `two`, `few`, `many`, `other`입니다. 모든 언어에서 모든 변형이 고려되는 것은 아닙니다. 예를 들어 영어의 경우 1을 제외한 다른 모든 복수형과 동일하므로 `zero`는 무시됩니다. 해당 언어가 실제로 요구하는 구분이 무엇인지 파악하려면 언어 전문가의 도움을 받으세요.
* 사용자 경험을 저해하지 않는다면 "도서: 1"과 같이 수량 중립적인 표현을 사용하여 수량 문자열 자체를 피하는 것도 좋은 방법입니다.

복수형을 정의하려면 `composeResources/values` 디렉터리의 임의의 `.xml` 파일에 `<plurals>` 요소를 추가하세요.
`plurals` 컬렉션은 XML 파일명이 아닌 name 속성을 사용하여 참조되는 단순 리소스입니다.
따라서 하나의 XML 파일에서 하나의 `<resources>` 요소 아래에 `plurals` 리소스를 다른 단순 리소스와 결합할 수 있습니다:

```xml
<resources>
    <string name="app_name">My awesome app</string>
    <string name="title">Some title</string>
    <plurals name="new_message">
        <item quantity="one">%1$d new message</item>
        <item quantity="other">%1$d new messages</item>
    </plurals>
</resources>
```

복수형에 `String`으로 접근하려면 다음 코드를 사용하세요:

<Tabs>
<TabItem title= "컴포저블 코드에서">

```kotlin
@Composable
fun pluralStringResource(resource: PluralStringResource, quantity: Int): String {...}

@Composable
fun pluralStringResource(resource: PluralStringResource, quantity: Int, vararg formatArgs: Any): String {...}
```

예시:

```kotlin
Text(pluralStringResource(Res.plurals.new_message, 1, 1))
```

</TabItem>
<TabItem title= "비컴포저블 코드에서">

```kotlin
suspend fun getPluralString(resource: PluralStringResource, quantity: Int): String

suspend fun getPluralString(resource: PluralStringResource, quantity: Int, vararg formatArgs: Any): String
```

예시:

```kotlin
coroutineScope.launch {
    val appName = getPluralString(Res.plurals.new_message, 1, 1)
}
```

</TabItem>
</Tabs>

> [Kotlin Multiplatform 플러그인](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)이 설치된 IDE에서는
> Emmet 스타일 문법을 사용하여 복수형 리소스를 생성할 수 있습니다.
> 예를 들어 `plurals`, `p` 또는 `:`를 사용하여 기본 빈 문자열 템플릿을 생성합니다.
> `values-en/strings.xml`에서 작업하는 경우, IDE는 로캘, 필수 수량 및 영어가 `one`과 `other`만 필요하다는 점을 자동으로 감지합니다.
> `p.test` 또는 `plurals.test`를 입력하고 **Tab** 키를 누르면 약어가 `plurals` 블록으로 확장됩니다:
> ```xml
> <plurals name="test">
>     <item quantity="one"></item>
>     <item quantity="other"></item>
> </plurals>
> ```
>
{style="tip"}

### 폰트 {id="fonts"}

커스텀 폰트는 `composeResources/font` 디렉터리에 저장합니다.
Compose Multiplatform은 모든 플랫폼에서 TTF, OTF, TTC 및 가변(variable) 폰트 형식을 지원합니다.
WOFF 및 WOFF2는 웹과 macOS에서만 사용할 수 있습니다.

폰트를 `Font` 타입으로 로드하려면 `Font()` 컴포저블 함수를 사용하세요:

```kotlin
@Composable
fun Font(
    resource: FontResource,
    weight: FontWeight = FontWeight.Normal,
    style: FontStyle = FontStyle.Normal
): Font
```

예시:

```kotlin
@Composable
private fun InterTypography(): Typography {
    val interFont = FontFamily(
        Font(Res.font.Inter_24pt_Regular, FontWeight.Normal),
        Font(Res.font.Inter_24pt_SemiBold, FontWeight.Bold),
    )

    return with(MaterialTheme.typography) {
        copy(
            displayLarge = displayLarge.copy(fontFamily = interFont, fontWeight = FontWeight.Bold),
            displayMedium = displayMedium.copy(fontFamily = interFont, fontWeight = FontWeight.Bold),
            displaySmall = displaySmall.copy(fontFamily = interFont, fontWeight = FontWeight.Bold),
            headlineLarge = headlineLarge.copy(fontFamily = interFont, fontWeight = FontWeight.Bold),
            headlineMedium = headlineMedium.copy(fontFamily = interFont, fontWeight = FontWeight.Bold),
            headlineSmall = headlineSmall.copy(fontFamily = interFont, fontWeight = FontWeight.Bold),
            titleLarge = titleLarge.copy(fontFamily = interFont, fontWeight = FontWeight.Bold),
            titleMedium = titleMedium.copy(fontFamily = interFont, fontWeight = FontWeight.Bold),
            titleSmall = titleSmall.copy(fontFamily = interFont, fontWeight = FontWeight.Bold),
            labelLarge = labelLarge.copy(fontFamily = interFont, fontWeight = FontWeight.Normal),
            labelMedium = labelMedium.copy(fontFamily = interFont, fontWeight = FontWeight.Normal),
            labelSmall = labelSmall.copy(fontFamily = interFont, fontWeight = FontWeight.Normal),
            bodyLarge = bodyLarge.copy(fontFamily = interFont, fontWeight = FontWeight.Normal),
            bodyMedium = bodyMedium.copy(fontFamily = interFont, fontWeight = FontWeight.Normal),
            bodySmall = bodySmall.copy(fontFamily = interFont, fontWeight = FontWeight.Normal),
        )
    }
}
```

{initial-collapse-state="collapsed" collapsible="true" collapsed-title="@Composable private fun InterTypography(): Typography { val interFont = FontFamily("}

> `Font`가 컴포저블인 경우, `TextStyle` 및 `Typography`와 같이 의존하는 컴포넌트도 컴포저블인지 확인하세요.
>
{style="note"}

이모지 및 아랍어 문자와 같은 특수 문자는 필요에 따라 필수 Noto 폰트를 다운로드하는
[자동 폰트 대체(fallback)](compose-web-resources.md#automatic-font-fallback)를 통해 웹 타깃에서 자동으로 지원됩니다.

어떤 폰트를 사용할지 완벽하게 제어해야 하는 경우, 특정 폰트를 번들로 묶어
[프리로드 API](compose-web-resources.md#preload-resources-using-the-compose-multiplatform-preload-api)를 사용해 수동으로 등록하세요.

### Raw 파일 {id="raw-files"}

임의의 raw 파일을 바이트 배열로 로드하려면 `Res.readBytes(path)` 함수를 사용하세요:

```kotlin
suspend fun readBytes(path: String): ByteArray
```

`composeResources/files` 디렉터리에 raw 파일을 배치할 수 있으며, 그 안에 어떤 계층 구조든 생성할 수 있습니다.

예를 들어 raw 파일에 접근하려면 다음 코드를 사용하세요:

<Tabs>
<TabItem title= "컴포저블 코드에서">

```kotlin
var bytes by remember {
    mutableStateOf(ByteArray(0))
}
LaunchedEffect(Unit) {
    bytes = Res.readBytes("files/myDir/someFile.bin")
}
Text(bytes.decodeToString())
```

</TabItem>
<TabItem title= "비컴포저블 코드에서">

```kotlin
coroutineScope.launch {
    val bytes = Res.readBytes("files/myDir/someFile.bin")
}
```

</TabItem>
</Tabs>

#### 바이트 배열을 이미지로 변환 {id="convert-byte-arrays-into-images"}

읽어온 파일이 비트맵(JPEG, PNG, BMP, WEBP) 또는 XML 벡터 이미지인 경우, 다음 함수들을 사용하여
`Image()` 컴포저블에 적합한 `ImageBitmap` 또는 `ImageVector` 객체로 변환할 수 있습니다.

[Raw 파일](#raw-파일) 섹션에 나와 있는 대로 raw 파일에 접근한 다음 결과를 컴포저블에 전달합니다:

```kotlin
// bytes = Res.readBytes("files/example.png")
Image(bytes.decodeToImageBitmap(), null)

// bytes = Res.readBytes("files/example.xml")
Image(bytes.decodeToImageVector(LocalDensity.current), null)
```

Android를 제외한 모든 플랫폼에서는 SVG 파일을 `Painter` 객체로 변환할 수도 있습니다:

```kotlin
// bytes = Res.readBytes("files/example.svg")
Image(bytes.decodeToSvgPainter(LocalDensity.current), null)
```

### 리소스 및 문자열 ID에 대해 생성된 맵 {id="generated-maps-for-resources-and-string-ids"}

접근을 용이하게 하기 위해 Compose Multiplatform은 문자열 ID를 사용하여 리소스를 매핑하기도 합니다.
파일 이름을 키로 사용하여 접근할 수 있습니다:

```kotlin
val Res.allDrawableResources: Map<String, DrawableResource>
val Res.allStringResources: Map<String, StringResource>
val Res.allStringArrayResources: Map<String, StringArrayResource>
val Res.allPluralStringResources: Map<String, PluralStringResource>
val Res.allFontResources: Map<String, FontResource>
```

매핑된 리소스를 컴포저블에 전달하는 예시:

```kotlin
Image(painterResource(Res.allDrawableResources["compose_multiplatform"]!!), null)
```

### Android 에셋으로 Compose Multiplatform 리소스 사용하기 {id="compose-multiplatform-resources-as-android-assets"}

Compose Multiplatform 1.7.0부터 모든 멀티플랫폼 리소스는 Android 에셋(assets)으로 패키징됩니다.
이를 통해 Android Studio는 Android 소스 세트의 Compose Multiplatform 컴포저블에 대한 미리보기를 생성할 수 있습니다.

> Android Studio 미리보기는 Android 소스 세트의 컴포저블에서만 사용할 수 있습니다.
> 또한 최신 AGP 버전 중 하나(8.5.2, 8.6.0-rc01 또는 8.7.0-alpha04)가 필요합니다.
>
{style="warning"}

멀티플랫폼 리소스를 Android 에셋으로 사용하면 리소스가 `Res.getUri("files/index.html")`과 같은 단순한 경로로 접근 가능하므로,
Android의 WebView 및 미디어 플레이어 컴포넌트에서 직접 접근하는 것도 가능해집니다.

리소스 이미지에 대한 링크가 포함된 리소스 HTML 페이지를 표시하는 Android 컴포저블의 예시:

```kotlin
// androidMain/kotlin/com/example/webview/App.kt
@OptIn(ExperimentalResourceApi::class)
@Composable
@Preview
fun App() {
    MaterialTheme {
        val uri = Res.getUri("files/webview/index.html")

        // 레이아웃을 전체 화면으로 설정하여 AndroidView 내에 WebView 추가
        AndroidView(factory = {
            WebView(it).apply {
                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )
            }
        }, update = {
            it.loadUrl(uri)
        })
    }
}
```
{initial-collapse-state="collapsed" collapsible="true"  collapsed-title="AndroidView(factory = { WebView(it).apply"}

이 예시는 다음의 간단한 HTML 파일과 함께 작동합니다:

```html
<html>
<header>
    <title>
        Cat Resource
    </title>
</header>
<body>
    <img src="cat.jpg">
</body>
</html>
```
{initial-collapse-state="collapsed" collapsible="true"  collapsed-title="<title>Cat Resource</title>"}

이 예시의 두 리소스 파일은 모두 `commonMain` 소스 세트에 위치합니다:

![composeResources 디렉터리의 파일 구조](compose-resources-android-webview.png){width="230"}

## 다른 라이브러리 및 리소스와의 상호작용 {id="interaction-with-other-libraries-and-resources"}

### 외부 라이브러리의 멀티플랫폼 리소스 접근하기 {id="accessing-multiplatform-resources-from-external-libraries"}

프로젝트에 포함된 다른 라이브러리를 사용하여 멀티플랫폼 리소스를 처리하려는 경우, 해당 API에 플랫폼별
파일 경로를 전달할 수 있습니다.
플랫폼별 경로를 가져오려면 리소스에 대한 프로젝트 경로와 함께 `Res.getUri()` 함수를 호출합니다:

```kotlin
val uri = Res.getUri("files/my_video.mp4")
```

이제 `uri` 변수에 파일의 절대 경로가 포함되어 있으므로, 모든 외부 라이브러리는 해당 경로를 사용하여
자신에게 맞는 방식으로 파일에 접근할 수 있습니다.

Android 전용 사용의 경우 멀티플랫폼 리소스는 [Android 에셋으로도 패키징됩니다](#android-에셋으로-compose-multiplatform-리소스-사용하기).

### 원격 파일 {id="remote-files"}

리소스 라이브러리의 관점에서는 애플리케이션의 일부인 파일만 리소스로 간주됩니다.

다음과 같은 특화된 라이브러리를 사용하여 URL을 통해 인터넷에서 원격 파일을 로드할 수 있습니다:

* [Compose ImageLoader](https://github.com/qdsfdhvh/compose-imageloader)
* [Kamel](https://github.com/Kamel-Media/Kamel)
* [Ktor client](https://ktor.io/)

이미지를 수동으로 다운로드하거나 바이트를 직접 읽는 경우, 리소스 라이브러리의 [디코딩 함수](#바이트-배열을-이미지로-변환)를
사용하여 변환하세요. 데스크톱 앱에서 네트워크 이미지를 로드하는 예시는
[데스크톱용 Compose Multiplatform에서 이미지 사용하기](compose-desktop-images.md#loading-images-from-the-file-system-or-the-network)를 참조하세요.

이미지를 직접 다운로드하거나 바이트를 읽은 경우 리소스 라이브러리의
[디코딩 함수](#바이트-배열을-이미지로-변환)를 사용하여 이미지로 변환하세요.
데스크톱 애플리케이션에서 네트워크로부터 이미지를 로드하는 예시는
[데스크톱용 Compose Multiplatform에서 이미지 사용하기](compose-desktop-images.md#loading-images-from-the-file-system-or-the-network) 튜토리얼을 참조하세요.

### Java 리소스 사용하기 {id="using-java-resources"}

Compose Multiplatform에서 Java 리소스를 사용할 수는 있지만, 프레임워크에서 제공하는 확장 기능인
생성된 접근자, 다중 모듈 지원, 현지화 등의 이점을 누릴 수 없습니다.
이러한 잠재력을 활용하려면 멀티플랫폼 리소스 라이브러리로 완전히 전환하는 것을 고려해 보세요.

Compose Multiplatform 1.7.0부터 `compose.ui` 패키지에서 제공되던 리소스 API는 더 이상 사용되지 않습니다(deprecated).
여전히 Java 리소스를 다루어야 하는 경우, Compose Multiplatform 1.7.0 이상으로 업그레이드한 후에도 코드가
정상 작동하도록 다음 구현을 프로젝트에 복사하여 사용하세요:

```kotlin
@Composable
internal fun painterResource(
    resourcePath: String
): Painter = when (resourcePath.substringAfterLast(".")) {
    "svg" -> rememberSvgResource(resourcePath)
    "xml" -> rememberVectorXmlResource(resourcePath)
    else -> rememberBitmapResource(resourcePath)
}

@Composable
internal fun rememberBitmapResource(path: String): Painter {
    return remember(path) { BitmapPainter(readResourceBytes(path).decodeToImageBitmap()) }
}

@Composable
internal fun rememberVectorXmlResource(path: String): Painter {
    val density = LocalDensity.current
    val imageVector = remember(density, path) { readResourceBytes(path).decodeToImageVector(density) }
    return rememberVectorPainter(imageVector)
}

@Composable
internal fun rememberSvgResource(path: String): Painter {
    val density = LocalDensity.current
    return remember(density, path) { readResourceBytes(path).decodeToSvgPainter(density) }
}

private object ResourceLoader
private fun readResourceBytes(resourcePath: String) =
    ResourceLoader.javaClass.classLoader.getResourceAsStream(resourcePath).readAllBytes()
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="internal fun painterResource(resourcePath: String): Painter"}

## 다음 단계 {id="what-s-next"}

* iOS, Android 및 데스크톱을 대상으로 하는 Compose Multiplatform 프로젝트에서 리소스를 처리하는 방법을 보여주는 공식 [데모 프로젝트](https://github.com/JetBrains/compose-multiplatform/tree/master/components/resources/demo)를 확인해 보세요.
* 인앱 테마 및 언어와 같은 애플리케이션의 [리소스 환경](compose-resource-environment.md)을 관리하는 방법을 알아보세요.