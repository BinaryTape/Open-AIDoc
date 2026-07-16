[//]: # (title: 앱에서 멀티플랫폼 리소스 사용하기)

<show-structure depth="2"/>

[프로젝트의 리소스를 설정](compose-multiplatform-resources-setup.md)한 후, 프로젝트를 빌드하면 리소스에 액세스할 수 있는 특별한 `Res` 클래스가 생성됩니다. `Res` 클래스와 모든 리소스 접근자(accessor)를 다시 생성하려면 프로젝트를 다시 빌드하거나 IDE에서 프로젝트를 다시 임포트(re-import)하세요.

그 후, 생성된 클래스를 사용하여 코드나 외부 라이브러리에서 구성된 멀티플랫폼 리소스에 액세스할 수 있습니다.

다음 주제들에 대한 자세한 내용을 읽어보세요:

* [생성된 `Res` 클래스 및 접근자 임포트하기](#importing-the-generated-class).
* [접근자 클래스 생성 커스터마이징](#customizing-accessor-class-generation): 공개(public)로 설정하거나, 패키지를 할당하거나, 무조건 생성하도록 만드는 방법.
* 특정 리소스 유형 작업하기: 
  * 단순 이미지, 래스터화된 이미지 또는 XML 벡터와 같은 [드로어블(Drawable) 리소스](#images),
  * Material Symbols 라이브러리의 [벡터 Android XML 아이콘](#icons), 
  * 단순 문자열, 템플릿, 배열 및 복수형(plurals)을 포함한 [문자열(Strings)](#strings),
  * [커스텀 폰트 저장 및 로드하기](#fonts),
  * [원시 파일(Raw files)](#raw-files) 및 바이트 배열을 이미지로 변환하기. 
* [문자열 ID로 매핑된 리소스에 액세스하기](#generated-maps-for-resources-and-string-ids).
* [멀티플랫폼 리소스를 Android 에셋(assets)으로 사용하기](#compose-multiplatform-resources-as-android-assets).
* 웹 전용 리소스 처리:
  * 브라우저 기능과 preload API를 사용한 [리소스 프리로딩(Preloading)](compose-web-resources.md#preloading-of-resources-for-web-targets),
  * [웹 리소스 캐싱](compose-web-resources.md#caching-web-resources).
* 외부 리소스 작업: 
  [외부 라이브러리에서](#accessing-multiplatform-resources-from-external-libraries), 
  [원격 파일](#remote-files), 그리고 [Java 리소스](#using-java-resources).

## 생성된 클래스 임포트하기

준비된 리소스를 사용하려면 생성된 클래스를 임포트하세요. 예를 들면 다음과 같습니다:

```kotlin
import project.composeapp.generated.resources.Res
import project.composeapp.generated.resources.example_image
```

여기서:
* `project`는 프로젝트의 이름입니다.
* `composeapp`은 리소스 디렉터리를 배치한 모듈입니다.
* `Res`는 생성된 클래스의 기본 이름입니다.
* `example_image`는 `composeResources/drawable` 디렉터리에 있는 이미지 파일의 이름입니다 (예: `example_image.png`).

## 접근자 클래스 생성 커스터마이징

Gradle 설정을 사용하여 생성된 `Res` 클래스를 필요에 맞게 커스터마이징할 수 있습니다.

`build.gradle.kts` 파일의 `compose.resources {}` 블록에서 프로젝트에 대한 `Res` 클래스가 생성되는 방식에 영향을 주는 몇 가지 설정을 지정할 수 있습니다.
구성 예시는 다음과 같습니다:

```kotlin
compose.resources {
    publicResClass = false
    packageOfResClass = "me.sample.library.resources"
    generateResClass = auto
}
```

* `publicResClass`를 `true`로 설정하면 생성된 `Res` 클래스가 public이 됩니다. 기본적으로 생성된 클래스는 [internal](https://kotlinlang.org/docs/visibility-modifiers.html)입니다.
* `packageOfResClass`를 사용하면 생성된 `Res` 클래스를 특정 패키지에 할당할 수 있습니다(코드 내 액세스 및 최종 아티팩트에서의 격리 목적). 기본적으로 Compose Multiplatform은 클래스에 `{group name}.{module name}.generated.resources` 패키지를 할당합니다.
* `generateResClass`를 `always`로 설정하면 프로젝트가 무조건 `Res` 클래스를 생성하도록 합니다. 이는 리소스 라이브러리가 전이적(transitively)으로만 사용 가능할 때 유용할 수 있습니다. 기본적으로 Compose Multiplatform은 현재 프로젝트가 리소스 라이브러리에 대해 명시적인 `implementation` 또는 `api` 의존성을 가질 때만 `Res` 클래스를 생성하는 `auto` 값을 사용합니다.

## 리소스 사용법

### 이미지 (Images)

드로어블 리소스에 단순 이미지, 래스터화된 이미지 또는 XML 벡터로 액세스할 수 있습니다.
SVG 이미지는 Android를 **제외한** 모든 플랫폼에서 지원됩니다.

* 드로어블 리소스에 `Painter` 이미지로 액세스하려면 `painterResource()` 함수를 사용하세요:

  ```kotlin
  @Composable
  fun painterResource(resource: DrawableResource): Painter {...}
  ```

  `painterResource()` 함수는 리소스 경로를 인자로 받아 `Painter` 값을 반환합니다. 이 함수는 웹을 제외한 모든 타겟에서 동기적으로 작동합니다. 웹 타겟의 경우, 첫 번째 재구성(recomposition)에서 빈 `Painter`를 반환하고 이후 재구성에서 로드된 이미지로 교체됩니다.

  * `painterResource()`는 `.png`, `.jpg`, `.bmp`, `.webp`와 같은 래스터화된 이미지 형식의 경우 `BitmapPainter`를 로드하거나, Android XML 벡터 드로어블 형식의 경우 `VectorPainter`를 로드합니다.
  * XML 벡터 드로어블은 Android 리소스에 대한 외부 참조를 지원하지 않는다는 점을 제외하면 [Android](https://developer.android.com/reference/android/graphics/drawable/VectorDrawable)와 동일한 형식을 가집니다.

* 드로어블 리소스에 `ImageBitmap` 래스터화된 이미지로 액세스하려면 `imageResource()` 함수를 사용하세요:

  ```kotlin
  @Composable
  fun imageResource(resource: DrawableResource): ImageBitmap {...}
  ```

* 드로어블 리소스에 `ImageVector` XML 벡터로 액세스하려면 `vectorResource()` 함수를 사용하세요:

  ```kotlin
  @Composable
  fun vectorResource(resource: DrawableResource): ImageVector {...}
  ```

다음은 Compose Multiplatform 코드에서 이미지에 액세스하는 방법의 예입니다:

```kotlin
Image(
    painter = painterResource(Res.drawable.my_image),
    contentDescription = null
)
```

### 아이콘 (Icons)

Material Symbols 라이브러리의 벡터 Android XML 아이콘을 사용할 수 있습니다:

1. [Google Fonts Icons](https://fonts.google.com/icons) 갤러리를 열고 아이콘을 선택한 다음, Android 탭으로 이동하여 **Download**를 클릭합니다.

2. 다운로드한 XML 아이콘 파일을 멀티플랫폼 리소스의 `drawable` 디렉터리에 추가합니다.

3. XML 아이콘 파일을 열고 `android:fillColor`를 `#000000`으로 설정합니다.
   `android:tint`와 같은 색상 조정을 위한 다른 Android 전용 속성은 제거합니다.

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
   
4. 리소스 접근자를 생성하기 위해 프로젝트를 빌드하거나, [Kotlin Multiplatform IDE 플러그인](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)이 자동으로 처리하도록 둡니다.

다음은 Compose Multiplatform 코드에서 아이콘에 액세스하고 `colorFilter` 매개변수를 사용하여 색상을 조정하는 방법의 예입니다:

```kotlin
Image(
    painter = painterResource(Res.drawable.ic_sample_icon),
    contentDescription = "Sample icon",
    modifier = Modifier.size(24.dp),
    colorFilter = ColorFilter.tint(Color.Blue)
)
```

### 문자열 (Strings)

모든 문자열 리소스를 `composeResources/values` 디렉터리의 XML 파일에 저장하세요.
각 파일의 각 항목에 대해 정적 접근자가 생성됩니다.

Compose Multiplatform은 XML 파일에 직접 문자열 리소스, 문자열 배열 및 복수형을 추가하기 위한 Emmet 스타일의 단축 구문을 지원합니다.
예를 들어, `strings.xml`에서 `test{Example}` 또는 `s.test{Example}`를 입력하고 **Tab**을 누르면 자동으로 `<string name="test">Example</string>`으로 확장됩니다.

다양한 로케일에 대해 문자열을 현지화하는 방법에 대한 자세한 내용은 [문자열 현지화 가이드](compose-localize-strings.md)를 참조하세요.

#### 단순 문자열 (Simple strings)

단순 문자열을 저장하려면 XML에 `<string>` 요소를 추가하세요:

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

예를 들어:

```kotlin
Text(stringResource(Res.string.app_name))
```

</TabItem>
<TabItem title= "비-컴포저블(non-composable) 코드에서">

```kotlin
suspend fun getString(resource: StringResource): String

suspend fun getString(resource: StringResource, vararg formatArgs: Any): String
```

예를 들어:

```kotlin
coroutineScope.launch {
    val appName = getString(Res.string.app_name)
}
```

</TabItem>
</Tabs>

문자열 리소스에서 특수 기호를 사용할 수 있습니다:

* `
` – 줄 바꿈
* `\t` – 탭 기호
* `\uXXXX` – 특정 유니코드 문자

[Android 문자열의 경우](https://developer.android.com/guide/topics/resources/string-resource#escaping_quotes)와 달리 "@"나 "?"와 같은 특수 XML 문자를 이스케이프할 필요가 없습니다.

> Emmet 스타일의 구문을 사용하고 **Tab**을 눌러 약어를 문자열 태그로 확장할 수 있습니다:
> * `test` → `<string name="test"></string>`
> * `test{Example}` → `<string name="test">Example</string>`
>
{style="note"}

#### 문자열 템플릿 (String templates)

현재 문자열 리소스의 인자에 대해서는 기본적인 지원을 제공합니다.
템플릿을 만들 때 `%<number>` 형식을 사용하여 문자열 내에 인자를 배치하고, `$d` 또는 `$s` 접미사를 포함하여 그것이 단순 텍스트가 아닌 변수 자리표시자(placeholder)임을 나타내세요.
예를 들어:

```XML
<resources>
    <string name="str_template">Hello, %2$s! You have %1$d new messages.</string>
</resources>
```

문자열 템플릿 리소스를 생성하고 임포트한 후, 자리표시자에 대한 인자를 올바른 순서로 전달하면서 참조할 수 있습니다:

```kotlin
Text(stringResource(Res.string.str_template, 100, "User_name"))
```

`$s`와 `$d` 접미사 사이에는 차이가 없으며, 다른 접미사는 지원되지 않습니다.
리소스 문자열에 `%1$s` 자리표시자를 넣고 이를 사용하여 소수점 숫자를 표시할 수도 있습니다:

```kotlin
Text(stringResource(Res.string.str_template, "User_name", 100.1f))
```

> 자리표시자를 위해 `%1$s`나 `%2$d`를 직접 입력하는 대신, 인라인 숫자 단축키를 사용할 수 있습니다.
> 예를 들어, 문자열 값 내에서 `1` 또는 `1s`를 입력하면 `%1$s`로 확장됩니다.
> 마찬가지로 `2d`를 입력하면 `%2$d`로 확장됩니다.
> 
{style="note"}

#### 문자열 배열 (String arrays)

관련된 문자열들을 배열로 그룹화하고 `List<String>` 객체로 자동 액세스할 수 있습니다:

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

해당 리스트를 가져오려면 다음 코드를 사용하세요:

<Tabs>
<TabItem title= "컴포저블 코드에서">

```kotlin
@Composable
fun stringArrayResource(resource: StringArrayResource): `List<String>` {...}
```

예를 들어:

```kotlin
val arr = stringArrayResource(Res.array.str_arr)
if (arr.isNotEmpty()) Text(arr[0])
```

</TabItem>
<TabItem title= "비-컴포저블 코드에서">

```kotlin
suspend fun getStringArray(resource: StringArrayResource): List<String>
```

예를 들어:

```kotlin
coroutineScope.launch {
    val appName = getStringArray(Res.array.str_arr)
}
```

</TabItem>
</Tabs>

> Emmet 스타일의 구문을 사용하여 문자열 배열을 빠르게 정의할 수 있습니다.
> `string-array`, `sa`, 또는 `>` 연산자를 사용하여 빈 배열 템플릿을 생성하세요.
> 미리 정의된 항목 수와 시작 텍스트가 있는 명명된 배열의 경우, `test>2{Hello}`를 입력하고 **Tab**을 누르세요:
> ```xml
> <string-array name="test">
>    <item>Hello</item>
>    <item>Hello</item>
> </string-array>
> ```
>
{style="note"}

#### 복수형 (Plurals)

UI에서 수량을 표시할 때, 프로그램적으로 연관 없는 문자열을 여러 개 만들지 않고도 동일한 항목의 수에 따른 문법적 일치(한 권의 _책(book)_, 여러 권의 _책들(books)_ 등)를 지원하고 싶을 수 있습니다.

Compose Multiplatform의 개념과 기본 구현은 Android의 수량 문자열(quantity strings)과 동일합니다.
프로젝트에서 복수형을 사용하는 최선의 방법과 뉘앙스에 대한 자세한 내용은 [Android 문서](https://developer.android.com/guide/topics/resources/string-resource#Plurals)를 참조하세요.

* 지원되는 변형은 `zero`, `one`, `two`, `few`, `many`, `other`입니다. 모든 언어에서 모든 변형을 고려하는 것은 아닙니다. 예를 들어, 영어에서 `zero`는 1을 제외한 다른 복수형과 동일하므로 무시됩니다. 해당 언어가 실제로 요구하는 구분이 무엇인지 알기 위해 언어 전문가의 도움을 받으세요.
* 종종 "Books: 1"과 같이 수량 중립적인 표현을 사용하여 수량 문자열을 피할 수 있습니다. 이것이 사용자 경험을 악화시키지 않는다면 권장되는 방법입니다.

복수형을 정의하려면 `composeResources/values` 디렉터리의 `.xml` 파일에 `<plurals>` 요소를 추가하세요.
`plurals` 컬렉션은 (XML 파일의 이름이 아닌) name 속성을 사용하여 참조되는 단순 리소스입니다.
따라서 하나의 `<resources>` 요소 아래 하나의 XML 파일에 `plurals` 리소스를 다른 단순 리소스와 함께 구성할 수 있습니다:

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

복수형을 `String`으로 가져오려면 다음 코드를 사용하세요:

<Tabs>
<TabItem title= "컴포저블 코드에서">

```kotlin
@Composable
fun pluralStringResource(resource: PluralStringResource, quantity: Int): String {...}

@Composable
fun pluralStringResource(resource: PluralStringResource, quantity: Int, vararg formatArgs: Any): String {...}
```

예를 들어:

```kotlin
Text(pluralStringResource(Res.plurals.new_message, 1, 1))
```

</TabItem>
<TabItem title= "비-컴포저블 코드에서">

```kotlin
suspend fun getPluralString(resource: PluralStringResource, quantity: Int): String

suspend fun getPluralString(resource: PluralStringResource, quantity: Int, vararg formatArgs: Any): String
```

예를 들어:

```kotlin
coroutineScope.launch {
    val appName = getPluralString(Res.plurals.new_message, 1, 1)
}
```

</TabItem>
</Tabs>

> Emmet 스타일 구문을 사용하여 복수형 리소스를 생성할 수 있습니다.
> 예를 들어, `plurals`, `p`, 또는 `:`를 사용하여 기본 빈 문자열 템플릿을 생성하세요.
> `values-en/strings.xml`에서 작업하는 경우, IDE는 자동으로 로케일과 필요한 수량을 감지하며, 영어가 `one`과 `other`만 필요하다는 것을 인식합니다.
> `p.test` 또는 `plurals.test`를 입력하고 **Tab**을 누르면 해당 약어가 `plurals` 블록으로 확장됩니다:
> ```xml
> <plurals name="test">
>     <item quantity="one"></item>
>     <item quantity="other"></item>
> </plurals>
> ```
>
{style="note"}

### 폰트 (Fonts)

커스텀 폰트를 `composeResources/font` 디렉터리에 `*.ttf` 또는 `*.otf` 파일로 저장하세요.

폰트를 `Font` 타입으로 로드하려면 `Font()` 컴포저블 함수를 사용하세요:

```kotlin
@Composable
fun Font(
    resource: FontResource,
    weight: FontWeight = FontWeight.Normal,
    style: FontStyle = FontStyle.Normal
): Font
```

예를 들어:

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

> `Font`가 컴포저블인 경우, `TextStyle` 및 `Typography`와 같은 의존 컴포넌트들도 컴포저블인지 확인하세요.
>
{style="note"}

웹 타겟에서 이모지나 아랍어 스크립트와 같은 특수 문자를 지원하려면 해당 폰트를 리소스에 추가하고 [폴백(fallback) 폰트를 프리로드](compose-web-resources.md#preload-resources-using-the-compose-multiplatform-preload-api)해야 합니다.

### 원시 파일 (Raw files)

원시 파일을 바이트 배열로 로드하려면 `Res.readBytes(path)` 함수를 사용하세요:

```kotlin
suspend fun readBytes(path: String): ByteArray
```

원시 파일을 `composeResources/files` 디렉터리에 배치할 수 있으며 그 내부에 어떠한 계층 구조도 만들 수 있습니다.

예를 들어, 원시 파일에 액세스하려면 다음 코드를 사용하세요:

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
<TabItem title= "비-컴포저블 코드에서">

```kotlin
coroutineScope.launch {
    val bytes = Res.readBytes("files/myDir/someFile.bin")
}
```

</TabItem>
</Tabs>

#### 바이트 배열을 이미지로 변환하기

읽고 있는 파일이 비트맵(JPEG, PNG, BMP, WEBP) 또는 XML 벡터 이미지인 경우, 다음 함수를 사용하여 `Image()` 컴포저블에 적합한 `ImageBitmap` 또는 `ImageVector` 객체로 변환할 수 있습니다.

[원시 파일](#raw-files) 섹션에서 보여준 것처럼 원시 파일에 액세스한 다음 결과를 컴포저블에 전달합니다:

```kotlin
// bytes = Res.readBytes("files/example.png")
Image(bytes.decodeToImageBitmap(), null)

// bytes = Res.readBytes("files/example.xml")
Image(bytes.decodeToImageVector(LocalDensity.current), null)
```

Android를 제외한 모든 플랫폼에서 SVG 파일을 `Painter` 객체로 변환할 수도 있습니다:

```kotlin
// bytes = Res.readBytes("files/example.svg")
Image(bytes.decodeToSvgPainter(LocalDensity.current), null)
```

### 리소스 및 문자열 ID를 위한 생성된 맵

액세스 편의를 위해 Compose Multiplatform은 리소스를 문자열 ID와 매핑합니다. 파일 이름을 키로 사용하여 액세스할 수 있습니다:

```kotlin
val Res.allDrawableResources: Map<String, DrawableResource>
val Res.allStringResources: Map<String, StringResource>
val Res.allStringArrayResources: Map<String, StringArrayResource>
val Res.allPluralStringResources: Map<String, PluralStringResource>
val Res.allFontResources: Map<String, FontResource>
```

매핑된 리소스를 컴포저블에 전달하는 예:

```kotlin
Image(painterResource(Res.allDrawableResources["compose_multiplatform"]!!), null)
```

### Compose Multiplatform 리소스를 Android 에셋으로 사용하기

Compose Multiplatform 1.7.0부터 모든 멀티플랫폼 리소스는 Android 에셋(assets)으로 패키징됩니다. 이를 통해 Android Studio가 Android 소스 세트의 Compose Multiplatform 컴포저블에 대한 프리뷰를 생성할 수 있습니다.

> Android Studio 프리뷰는 Android 소스 세트의 컴포저블에서만 사용할 수 있습니다.
> 또한 최신 버전의 AGP(8.5.2, 8.6.0-rc01 또는 8.7.0-alpha04 중 하나)가 필요합니다.
>
{style="warning"}

멀티플랫폼 리소스를 Android 에셋으로 사용하면 Android의 WebView 및 미디어 플레이어 컴포넌트에서 직접 액세스하는 것도 가능해집니다. 리소스는 `Res.getUri("files/index.html")`와 같은 간단한 경로로 접근할 수 있기 때문입니다.

리소스 이미지에 대한 링크가 포함된 리소스 HTML 페이지를 표시하는 Android 컴포저블의 예:

```kotlin
// androidMain/kotlin/com/example/webview/App.kt
@OptIn(ExperimentalResourceApi::class)
@Composable
@Preview
fun App() {
    MaterialTheme {
        val uri = Res.getUri("files/webview/index.html")

        // 레이아웃을 전체 화면으로 하여 AndroidView 내부에 WebView 추가
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

이 예제는 다음과 같은 간단한 HTML 파일과 함께 작동합니다:

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

이 예제의 두 리소스 파일은 모두 `commonMain` 소스 세트에 위치합니다:

![composeResources 디렉터리의 파일 구조](compose-resources-android-webview.png){width="230"}

## 다른 라이브러리 및 리소스와의 상호작용

### 외부 라이브러리에서 멀티플랫폼 리소스에 액세스하기

프로젝트에 포함된 다른 라이브러리를 사용하여 멀티플랫폼 리소스를 처리하려는 경우, 플랫폼별 파일 경로를 이러한 다른 API에 전달할 수 있습니다.
플랫폼별 경로를 얻으려면 리소스에 대한 프로젝트 경로와 함께 `Res.getUri()` 함수를 호출하세요:

```kotlin
val uri = Res.getUri("files/my_video.mp4")
```

이제 `uri` 변수에 파일의 절대 경로가 포함되었으므로, 모든 외부 라이브러리는 해당 경로를 사용하여 적절한 방식으로 파일에 액세스할 수 있습니다.

Android 전용 용도의 경우, 멀티플랫폼 리소스는 [Android 에셋으로도 패키징됩니다](#compose-multiplatform-resources-as-android-assets).

### 원격 파일 (Remote files)

리소스 라이브러리의 맥락에서, 애플리케이션의 일부인 파일만 리소스로 간주됩니다.

특화된 라이브러리를 사용하여 URL을 통해 인터넷에서 원격 파일을 로드할 수 있습니다:

* [Compose ImageLoader](https://github.com/qdsfdhvh/compose-imageloader)
* [Kamel](https://github.com/Kamel-Media/Kamel)
* [Ktor client](https://ktor.io/)

### Java 리소스 사용하기

Compose Multiplatform에서 Java 리소스를 사용할 수 있지만, 프레임워크에서 제공하는 확장 기능(생성된 접근자, 멀티모듈 지원, 현지화 등)의 혜택을 받을 수 없습니다. 이러한 잠재력을 활용하려면 멀티플랫폼 리소스 라이브러리로 완전히 전환하는 것을 고려해 보세요.

Compose Multiplatform 1.7.0부터 `compose.ui` 패키지에서 제공되던 리소스 API는 더 이상 사용되지 않습니다(deprecated). 여전히 Java 리소스로 작업해야 하는 경우, Compose Multiplatform 1.7.0 이상으로 업그레이드한 후에도 코드가 작동하도록 다음 구현을 프로젝트에 복사하세요:

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

## 다음 단계는?

* iOS, Android 및 데스크톱을 타겟으로 하는 Compose Multiplatform 프로젝트에서 리소스를 처리하는 방법을 보여주는 공식 [데모 프로젝트](https://github.com/JetBrains/compose-multiplatform/tree/master/components/resources/demo)를 확인해 보세요.
* 인앱 테마 및 언어와 같은 애플리케이션의 [리소스 환경(resource environment)](compose-resource-environment.md)을 관리하는 방법을 알아보세요.