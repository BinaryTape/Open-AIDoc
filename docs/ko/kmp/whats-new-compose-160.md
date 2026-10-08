[//]: # (title: Compose Multiplatform 1.6.0의 새로운 기능)

Compose Multiplatform 1.6.0 릴리스의 주요 하이라이트는 다음과 같습니다.

* [중대한 변경 사항](#breaking-changes)
* [새롭고 개선된 Resources API](#improved-resources-api-all-platforms)
* [iOS 접근성 기능에 대한 기본 지원](#accessibility-support)
* [모든 플랫폼을 위한 UI 테스트 API](#ui-testing-api-experimental-all-platforms)
* [팝업, 다이얼로그, 드롭다운을 위한 별도의 플랫폼 뷰](#separate-platform-views-for-popups-dialogs-and-dropdowns-ios-desktop)
* [Jetpack Compose 및 Material 3의 변경 사항 반영](#changes-from-jetpack-compose-and-material-3-all-platforms)
* [안정 버전의 Kotlin/Wasm 아티팩트](#kotlin-wasm-artifacts-available-in-stable-versions-of-the-framework)
* [알려진 문제: 누락된 종속성](#known-issues-missing-dependencies)

## 종속성 (Dependencies) {id="dependencies"}

이번 버전의 Compose Multiplatform은 다음 Jetpack Compose 라이브러리를 기반으로 합니다.

* [Compiler 1.5.8](https://developer.android.com/jetpack/androidx/releases/compose-compiler#1.5.8)
* [Runtime 1.6.1](https://developer.android.com/jetpack/androidx/releases/compose-runtime#1.6.1)
* [UI 1.6.1](https://developer.android.com/jetpack/androidx/releases/compose-ui#1.6.1)
* [Foundation 1.6.1](https://developer.android.com/jetpack/androidx/releases/compose-foundation#1.6.1)
* [Material 1.6.1](https://developer.android.com/jetpack/androidx/releases/compose-material#1.6.1)
* [Material3 1.2.0](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.2.0)

## 중대한 변경 사항 (Breaking changes) {id="breaking-changes"}

### lineHeight가 설정된 텍스트의 패딩이 기본적으로 잘림 {id="padding-for-text-with-lineheight-set-trimmed-by-default"}

[LineHeightStyle.Trim](https://developer.android.com/reference/kotlin/androidx/compose/ui/text/style/LineHeightStyle.Trim)에 대한 지원이 추가됨에 따라, Compose Multiplatform은 텍스트 패딩이 잘리는 방식에서 Android와 일치하도록 변경되었습니다. 자세한 내용은 [풀 리퀘스트](https://github.com/JetBrains/compose-multiplatform-core/pull/897)를 참고하세요.

이는 [1.6.0-alpha01 릴리스](https://developer.android.com/jetpack/androidx/releases/compose-material#1.6.0-alpha01)부터 적용된 `compose.material`의 변경 사항과 일치합니다.
* Android에서 `includeFontPadding` 매개변수의 기본값이 `false`가 되었습니다. 이 변경 사항에 대한 더 깊은 이해를 위해 [Compose Multiplatform에서 이 플래그를 구현하지 않기로 한 논의](https://github.com/JetBrains/compose-multiplatform/issues/2477#issuecomment-1825716543)를 확인하세요.
* 기본 줄 높이 스타일(line height style)이 `Trim.None` 및 `Alignment.Center`로 변경되었습니다. 이제 Compose Multiplatform은 `LineHeightStyle.Trim`을 지원하며 `Trim.None`을 기본값으로 구현합니다.
* `Typography`의 `TextStyle`에 명시적인 `lineHeight`가 추가되었으며, 이는 [다음의 중대한 변경 사항](#using-fontsize-in-materialtheme-requires-lineheight)으로 이어졌습니다.

### MaterialTheme에서 fontSize를 사용할 때 lineHeight가 필요함 {id="using-fontsize-in-materialtheme-requires-lineheight"}

> 이 사항은 `material` 컴포넌트에만 영향을 미칩니다. `material3`에는 이미 이 제한이 적용되어 있었습니다.
>
{style="note"}

`MaterialTheme`에서 `Text` 컴포넌트의 `fontSize` 속성을 설정하면서 `lineHeight`를 포함하지 않으면, 실제 줄 높이가 폰트에 맞춰 수정되지 않습니다. 이제 해당 `fontSize`를 설정할 때마다 `lineHeight` 속성을 명시적으로 지정해야 합니다.

Jetpack Compose는 현재 폰트 크기를 직접 설정하지 않을 것을 [권장](https://issuetracker.google.com/issues/321872412)합니다:

> 표준이 아닌 텍스트 크기를 지원하려면, 폰트 크기를 직접 변경하기보다 Material 디자인 시스템을 따르고 다른 [타이포그래피 스케일(type scale)](https://m2.material.io/design/typography/the-type-system.html#type-scale)을 사용할 것을 권장합니다. 또는 다음과 같이 줄 높이를 덮어쓸 수도 있습니다:
> `style = LocalTextStyle.current.copy(lineHeight = TextUnit.Unspecified)`, 또는 아예 커스텀 `Typography`를 생성할 수 있습니다.
>
{style="tip"}

### 리소스 구성의 새로운 접근 방식 {id="new-approach-to-resource-organization"}

Compose Multiplatform 1.6.0 프리뷰 버전에서 리소스 API를 사용해 왔다면, [현재 버전의 문서](compose-multiplatform-resources.md)를 숙지하시기 바랍니다. 1.6.0-beta01부터 프로젝트 코드에서 리소스 파일을 사용할 수 있도록 프로젝트 폴더에 저장하는 방식이 변경되었습니다.

## 모든 플랫폼 공통 {id="across-platforms"}

### 개선된 리소스 API (모든 플랫폼) {id="improved-resources-api-all-platforms"}

새로운 실험적 API는 문자열(string) 및 폰트 지원을 추가하며, 공통(common) Kotlin 코드에서 리소스를 더 편리하게 공유하고 접근할 수 있게 해줍니다.

* 리소스는 설계된 특정 설정이나 제약 조건에 따라 구성될 수 있으며, 다음을 지원합니다:
  * 로케일 (Locales)
  * 이미지 해상도 (Image resolutions)
  * 다크 및 라이트 테마 (Dark and light themes)
* Compose Multiplatform은 이제 각 프로젝트에 대해 `Res` 객체를 생성하여 직관적인 리소스 접근을 제공합니다.

리소스 한정자(qualifiers)에 대한 자세한 내용과 새로운 리소스 API에 대한 심층적인 개요는 [이미지 및 리소스](compose-multiplatform-resources.md)를 참고하세요.

### UI 테스트 API (실험적, 모든 플랫폼) {id="ui-testing-api-experimental-all-platforms"}

데스크톱 및 Android에서 이미 사용 가능했던 Compose Multiplatform UI 테스트용 실험적 API가 이제 모든 플랫폼을 지원합니다. 프레임워크가 지원하는 여러 플랫폼에서 애플리케이션 UI의 동작을 검증하는 공통 테스트를 작성하고 실행할 수 있습니다. 이 API는 Jetpack Compose와 동일한 파인더(finder), 어설션(assertion), 액션(action), 매처(matcher)를 사용합니다.

> JUnit 기반 테스트는 데스크톱 프로젝트에서만 지원됩니다.
>
{style="note"}

설정 방법 및 테스트 예제는 [Compose Multiplatform UI 테스트](compose-test.md)를 참고하세요.

### Jetpack Compose 및 Material 3의 변경 사항 (모든 플랫폼) {id="changes-from-jetpack-compose-and-material-3-all-platforms"}

#### Jetpack Compose 1.6.1 {id="jetpack-compose-1-6-1"}

Jetpack Compose의 최신 릴리스를 병합함으로써 모든 플랫폼에서 성능에 긍정적인 영향을 미칩니다. 자세한 내용은 [Android 개발자 블로그의 발표 내용](https://android-developers.googleblog.com/2024/01/whats-new-in-jetpack-compose-january-24-release.html)을 참고하세요.

기타 주목할 만한 기능:
* 기본 폰트 패딩 변경은 Android 타겟에만 적용되었습니다. 다만, 이 변경으로 인한 [부작용](#using-fontsize-in-materialtheme-requires-lineheight)을 고려해야 합니다.
* 마우스 선택(Mouse selection)은 이미 다른 타겟의 Compose Multiplatform에서 지원되고 있었습니다. 1.6.0부터는 Android도 포함됩니다.

아직 Compose Multiplatform으로 포팅되지 않은 Jetpack Compose 기능들:
* [BasicTextField2](https://github.com/JetBrains/compose-multiplatform/issues/4218)
* [비선형 폰트 스케일링 지원](https://github.com/JetBrains/compose-multiplatform/issues/4305)
* [MultiParagraph.fillBoundingBoxes](https://github.com/JetBrains/compose-multiplatform/issues/4236)
* [멀티플랫폼 드래그 앤 드롭](https://github.com/JetBrains/compose-multiplatform/issues/4235). 현재는 Android에서만 작동합니다. 데스크톱에서는 기존 API인 `Modifier.onExternalDrag`를 사용할 수 있습니다.

JetBrains 팀은 향후 Compose Multiplatform 버전에서 이러한 기능들을 도입하기 위해 노력하고 있습니다.

#### Compose Material 3 1.2.0 {id="compose-material-3-1-2-0"}

릴리스 하이라이트:
* 단일 및 다중 선택이 가능한 새로운 실험적 컴포넌트 `Segmented Button`.
* UI에서 정보를 더 쉽게 강조할 수 있도록 더 많은 표면(surface) 옵션이 포함된 확장된 색상 세트.
  * 구현 참고 사항: `ColorScheme` 객체가 이제 불변(immutable)이 되었습니다. 현재 코드에서 `ColorScheme`의 색상을 직접 수정하고 있다면, 이제 색상을 변경하기 위해 [copy](https://developer.android.com/reference/kotlin/androidx/compose/material3/ColorScheme#copy(androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color)) 메서드를 사용해야 합니다.
  * 단일 surface 값 대신, 더 유연한 색상 관리를 위해 surface 색상 및 surface container에 대한 여러 옵션이 제공됩니다.

Material 3 변경 사항에 대한 자세한 내용은 [Material Design 블로그의 릴리스 포스트](https://material.io/blog/material-3-compose-1-2)를 참고하세요.

### 팝업, 다이얼로그, 드롭다운을 위한 별도의 플랫폼 뷰 (iOS, 데스크톱) {id="separate-platform-views-for-popups-dialogs-and-dropdowns-ios-desktop"}

때로는 팝업 요소(예: 툴팁 및 드롭다운 메뉴)가 초기 Composable 캔버스나 앱 창에 의해 제한되지 않는 것이 중요합니다. 특히 Composable 뷰가 전체 화면을 차지하지 않지만 경고 다이얼로그(alert dialog)를 띄워야 하는 경우 더욱 그렇습니다. 1.6.0에서는 이를 안정적으로 구현할 수 있는 방법이 제공됩니다.

단, 팝업과 다이얼로그는 여전히 자신의 경계 밖에는 아무것도 그릴 수 없습니다(예: 최상위 컨테이너의 그림자 등).

#### iOS (Stable) {id="ios-stable"}

iOS에서는 이 기능이 기본적으로 활성화되어 있습니다.
이전 동작으로 돌아가려면 `platformLayers` 매개변수를 `false`로 설정하세요.

```kotlin
ComposeUIViewController(
    configure = {
        platformLayers = false
    }
) {
    // Compose 코드
}
```

#### 데스크톱 (Experimental) {id="desktop-experimental"}

데스크톱에서 이 기능을 사용하려면 `compose.layers.type` 시스템 속성을 설정하세요. 지원되는 값은 다음과 같습니다.
* `WINDOW`: `Popup` 및 `Dialog` 컴포넌트를 별도의 장식 없는 창(undecorated window)으로 생성합니다.
* `COMPONENT`: `Popup` 또는 `Dialog`를 동일한 창 내에서 별도의 Swing 컴포넌트로 생성합니다. 이는 `compose.swing.render.on.graphics`가 `true`로 설정된 오프스크린 렌더링(offscreen rendering)에서만 작동합니다 (1.5.0 Compose Multiplatform 릴리스 노트의 [Enhanced Swing interop](https://blog.jetbrains.com/kotlin/2023/08/compose-multiplatform-1-5-0-release/#enhanced-swing-interop) 섹션 참고). 오프스크린 렌더링은 전체 창 애플리케이션이 아닌 `ComposePanel` 컴포넌트에서만 작동한다는 점에 유의하세요.

`COMPONENT` 속성을 사용하는 코드 예제:

```kotlin
@OptIn(ExperimentalComposeUiApi::class)
fun main() = SwingUtilities.invokeLater {
    System.setProperty("compose.swing.render.on.graphics", "true")
    System.setProperty("compose.layers.type", "COMPONENT")

    val window = JFrame()
    window.defaultCloseOperation = WindowConstants.EXIT_ON_CLOSE

    val contentPane = JLayeredPane()
    contentPane.layout = null

    val composePanel = ComposePanel()
    composePanel.setBounds(200, 200, 200, 200)
    composePanel.setContent {
      ComposeContent()
    }
    composePanel.windowContainer = contentPane  // 다이얼로그에 전체 창을 사용함
    contentPane.add(composePanel)

    window.contentPane.add(contentPane)
    window.setSize(800, 600)
    window.isVisible = true
  }

@Composable
fun ComposeContent() {
    Box(Modifier.fillMaxSize().background(Color.Green)) {
        Dialog(onDismissRequest = {}) {
            Box(Modifier.size(100.dp).background(Color.Yellow))
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true"  collapsed-title="val window = JFrame()"}

부모 `ComposePanel`(초록색)의 경계와 관계없이 `Dialog`(노란색)가 전체로 그려집니다.

![부모 패널의 경계를 벗어난 다이얼로그](compose-desktop-separate-dialog.png){width=700}

### 텍스트 장식 라인 스타일 지원 (iOS, 데스크톱, 웹) {id="support-for-text-decoration-line-styles-ios-desktop-web"}

Compose Multiplatform은 이제 `PlatformTextStyle` 클래스를 사용하여 텍스트에 밑줄 스타일을 설정할 수 있게 해줍니다.

> 이 클래스는 공통 소스 세트(common source set)에서는 사용할 수 없으며 플랫폼별 코드에서 사용해야 합니다.
>
{style="warning"}

점선 밑줄 스타일을 설정하는 예제:

```kotlin
Text(
  "Hello, Compose",
  style = TextStyle(
    textDecoration = TextDecoration.Underline,
    platformStyle = PlatformTextStyle (
      textDecorationLineStyle = TextDecorationLineStyle.Dotted
    )
  )
)
```

실선(solid), 이중 실선(double-width solid), 점선(dotted), 대시선(dashed), 물결선(wavy) 스타일을 사용할 수 있습니다. [소스 코드](https://github.com/JetBrains/compose-multiplatform-core/blob/jb-main/compose/ui/ui-text/src/skikoMain/kotlin/androidx/compose/ui/text/TextDecorationLineStyle.kt#L21)에서 사용 가능한 모든 옵션을 확인하세요.

### 시스템에 설치된 폰트 접근 (iOS, 데스크톱, 웹) {id="accessing-fonts-installed-on-the-system-ios-desktop-web"}

이제 Compose Multiplatform 앱에서 시스템에 설치된 폰트에 접근할 수 있습니다. `SystemFont` 클래스를 사용하여 적절한 폰트 스타일과 두께로 폰트를 로드하세요.

```kotlin
import androidx.compose.ui.text.platform.SystemFont

FontFamily(SystemFont("Menlo", weight = 700))
FontFamily(SystemFont("Times New Roman", FontWeight.Bold))
FontFamily(SystemFont("Webdings"))
```

데스크톱에서는 폰트 패밀리 이름만 지정하여 가능한 모든 폰트 스타일을 로드하는 `FontFamily` 함수를 사용할 수 있습니다 (상세 예제는 [코드 샘플](https://github.com/JetBrains/compose-multiplatform-core/blob/release/1.6.0/compose/desktop/desktop/samples/src/jvmMain/kotlin/androidx/compose/desktop/examples/fonts/Fonts.jvm.kt)을 참고하세요).

```kotlin
FontFamily("Menlo")
```

## iOS {id="ios"}

### 접근성 지원 (Accessibility support) {id="accessibility-support"}

iOS용 Compose Multiplatform은 이제 장애가 있는 사용자가 네이티브 iOS UI와 동일한 수준의 편의성으로 Compose UI와 상호 작용할 수 있도록 지원합니다.

* 스크린 리더 및 VoiceOver가 Compose UI의 콘텐츠에 접근할 수 있습니다.
* Compose UI는 탐색 및 상호 작용을 위해 네이티브 UI와 동일한 제스처를 지원합니다.

이는 Compose Multiplatform의 시맨틱 데이터를 접근성 서비스(Accessibility Services) 및 XCTest 프레임워크에서 사용할 수 있음을 의미하기도 합니다.

구현 및 커스텀 API에 대한 자세한 내용은 [iOS 접근성 기능 지원](compose-ios-accessibility.md)을 참고하세요.

### Composable 뷰의 불투명도 변경 {id="changing-opacity-for-composable-view"}

`ComposeUIViewController` 클래스에 뷰 배경의 불투명도를 투명하게 변경할 수 있는 설정 옵션이 하나 더 추가되었습니다.

> 투명한 배경은 추가적인 블렌딩 단계를 거치게 되어 성능에 부정적인 영향을 미칩니다.
>
{style="note"}

```kotlin
val appController = ComposeUIViewController(configure = {
      this.opaque = false
}) {
    App()
}
```

투명 배경을 통해 구현할 수 있는 예시:

![Compose opaque = false 데모](compose-opaque-property.png){width=700}

### SelectionContainer에서 더블 및 트리플 탭으로 텍스트 선택 {id="selecting-text-in-selectioncontainer-by-double-and-triple-tap"}

이전에는 iOS용 Compose Multiplatform에서 텍스트 입력 필드에서만 멀티 탭을 통한 텍스트 선택이 가능했습니다. 이제 `SelectionContainer` 내부의 `Text` 컴포넌트에 표시되는 텍스트를 선택할 때도 더블 및 트리플 탭 제스처가 작동합니다.

### UIViewController와의 상호 운용 (Interop) {id="interop-with-uiviewcontroller"}

`UITabBarController`나 `UINavigationController`와 같이 `UIView`로 구현되지 않은 일부 네이티브 API는 [기존 상호 운용 매커니즘](compose-uikit-integration.md)을 사용하여 Compose Multiplatform UI에 포함할 수 없었습니다.

이제 Compose Multiplatform은 네이티브 iOS 뷰 컨트롤러를 Compose UI에 포함할 수 있게 해주는 `UIKitViewController` 함수를 구현합니다.

### 텍스트 필드에서 롱 탭/싱글 탭을 통한 네이티브 방식의 캐럿 동작 {id="native-like-caret-behavior-by-long-single-taps-in-text-fields"}

Compose Multiplatform의 텍스트 필드 내 캐럿(caret) 동작이 네이티브 iOS 방식에 더 가까워졌습니다.
* 텍스트 필드를 싱글 탭한 후 캐럿의 위치가 더 정밀하게 결정됩니다.
* 텍스트 필드에서 롱 탭 후 드래그하면 Android처럼 선택 모드로 들어가는 대신 커서가 이동합니다.

## 데스크톱 {id="desktop"}

### 개선된 상호 운용 블렌딩 실험적 지원 {id="experimental-support-of-improved-interop-blending"}

과거에는 `SwingPanel` 래퍼를 사용하여 구현된 상호 운용 뷰가 항상 직사각형이었고, 항상 모든 Compose Multiplatform 컴포넌트의 최상단(foreground)에 위치했습니다. 이로 인해 팝업 요소(드롭다운 메뉴, 토스트 알림)를 사용하기가 어려웠습니다. 새로운 구현을 통해 이 문제가 해결되었으며, 이제 다음과 같은 사례에서 Swing을 안정적으로 사용할 수 있습니다.

* 클리핑(Clipping). 직사각형 모양에 국한되지 않습니다. 이제 `SwingPanel`에서 클립(clip) 및 그림자(shadow) 수정자가 올바르게 작동합니다.

    ```kotlin
    // 실험적 블렌딩을 활성화하는 데 필요한 플래그
    System.setProperty("compose.interop.blending", "true")
  
    SwingPanel(
        modifier = Modifier.clip(RoundedCornerShape(6.dp))
        //...
    )
    ```
  
  왼쪽은 이 기능 없이 `JButton`이 클리핑된 모습이고, 오른쪽은 실험적 블렌딩이 적용된 모습입니다.

  ![SwingPanel의 올바른 클리핑](compose-swingpanel-clipping.png)
* 오버래핑(Overlapping). `SwingPanel` 위에 Compose Multiplatform 콘텐츠를 그리고 평소와 같이 상호 작용할 수 있습니다. 아래 예시에서 "Snackbar"는 클릭 가능한 **OK** 버튼이 있는 Swing 패널 위에 위치합니다.

  ![SwingPanel과의 올바른 오버래핑](compose-swingpanel-overlapping.png)

알려진 제한 사항 및 추가 세부 정보는 [풀 리퀘스트 설명](https://github.com/JetBrains/compose-multiplatform-core/pull/915)을 참고하세요.

## 웹 {id="web"}

### 안정 버전의 프레임워크에서 Kotlin/Wasm 아티팩트 사용 가능 {id="kotlin-wasm-artifacts-available-in-stable-versions-of-the-framework"}

Compose Multiplatform 안정 버전에서 이제 Kotlin/Wasm 타겟을 지원합니다. 1.6.0으로 전환한 후에는 종속성 목록에서 `compose-ui` 라이브러리의 특정 `dev-wasm` 버전을 지정할 필요가 없습니다.

> Wasm 타겟으로 Compose Multiplatform 프로젝트를 빌드하려면 Kotlin 1.9.22 이상의 버전이 필요합니다.
>
{style="warning"}

## 알려진 문제: 누락된 종속성 {id="known-issues-missing-dependencies"}

기본 프로젝트 구성에서 누락될 수 있는 몇 가지 라이브러리가 있습니다.

* `org.jetbrains.compose.annotation-internal:annotation` 또는 `org.jetbrains.compose.collection-internal:collection`

  라이브러리가 1.6.0과 바이너리 호환되지 않는 Compose Multiplatform 1.6.0-beta02에 의존하는 경우 누락될 수 있습니다. 어떤 라이브러리인지 확인하려면 다음 명령을 실행하세요 (`shared`를 메인 모듈의 이름으로 바꾸세요).

  ```shell
  ./gradlew shared:dependencies
  ```

  해당 라이브러리를 Compose Multiplatform 1.5.12에 의존하는 버전으로 다운그레이드하거나, 라이브러리 제작자에게 Compose Multiplatform 1.6.0으로 업그레이드해 달라고 요청하세요.

* `androidx.annotation:annotation:...` 또는 `androidx.collection:collection:...`

  Compose Multiplatform 1.6.0은 Google Maven 저장소에서만 사용할 수 있는 [collection](https://developer.android.com/jetpack/androidx/releases/collection) 및 [annotation](https://developer.android.com/jetpack/androidx/releases/annotation) 라이브러리에 의존합니다.

  이 저장소를 프로젝트에서 사용할 수 있게 하려면 모듈의 `build.gradle.kts` 파일에 다음 라인을 추가하세요.

  ```kotlin
  repositories {
      //...
      google()
  }
  ```
