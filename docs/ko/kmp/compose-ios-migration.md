[//]: # (title: iOS 마이그레이션 가이드)

이 페이지에서는 1.7.0 버전을 시작으로 프로젝트의 Compose Multiplatform 라이브러리를 최신 버전으로 업그레이드할 때 고려해야 할 iOS 관련 사항을 안내합니다.

## Compose Multiplatform 1.6.11에서 1.7.0으로 {id="compose-multiplatform-1-6-11-to-1-7-0"}

### UIKitView 및 UIKitViewController에서 background 파라미터 제거 {id="removed-background-parameter-in-uikitview-and-uikitviewcontroller"}

더 이상 사용되지 않는(deprecated) `UIKitView` 및 `UIKitViewController` API에는 `background` 파라미터가 있었으나, 새로운 API에는 포함되지 않습니다.
해당 파라미터는 불필요한 것으로 판단되어 제거되었습니다:

* 새 인스턴스의 interop 뷰 배경을 설정해야 하는 경우 `factory` 파라미터를 사용할 수 있습니다.
* 배경을 업데이트할 수 있어야 하는 경우 해당 코드를 `update` 람다에 추가하세요.

### 터치 또는 제스처가 예상대로 작동하지 않을 수 있음 {id="touches-or-gestures-may-stop-working-as-expected"}

새로운 기본 [터치 동작](compose-ios-touch.md)은 터치가 interop 뷰를 위한 것인지, 아니면 해당 뷰의 Compose 컨테이너를 위한 것인지 판단하기 위해 지연(delay)을 사용합니다. 즉, interop 뷰가 터치를 전달받으려면 사용자가 최소 150ms 동안 터치 상태를 유지해야 합니다.

Compose Multiplatform이 이전처럼 터치를 처리하도록 해야 한다면 새로운 실험적(experimental) `UIKitInteropProperties` 생성자 사용을 고려해 보세요.
이 생성자에는 `interactionMode` 파라미터가 있으며, 이를 `UIKitInteropInteractionMode.NonCooperative`로 설정하면 Compose가 터치를 interop 뷰로 직접 전달하도록 할 수 있습니다.

궁극적으로 interop 뷰의 상호작용 가능 여부를 단일 부울(bool) 플래그로 기술하도록 유지하고자 하므로 이 생성자는 실험적인 것으로 표시되었습니다.
`interactionMode` 파라미터에 명시적으로 기술된 동작은 향후 자동으로 유도될 가능성이 높습니다.

### accessibilityEnabled가 isNativeAccessibilityEnabled로 대체되고 기본적으로 비활성화됨 {id="accessibilityenabled-replaced-by-isnativeaccessibilityenabled-and-turned-off-by-default"}

기존 `UIKitView` 및 `UIKitViewController` 생성자의 `accessibilityEnabled` 파라미터는 위치가 이동되고 이름이 변경되어 이제 `UIKitInteropProperties.isNativeAccessibilityEnabled` 프로퍼티로 사용할 수 있습니다.
또한 기본값은 `false`로 설정됩니다.

`isNativeAccessibilityEnabled` 프로퍼티는 병합된 Compose 하위 트리를 네이티브 접근성 해석(resolution)으로 오염시킵니다.
따라서 interop 뷰의 다양한 접근성 기능(예: 웹 뷰)이 필요한 경우가 아니라면 true로 설정하지 않는 것을 권장합니다.

이 프로퍼티와 기본값에 대한 배경 및 이유는 [`UIKitInteropProperties` 클래스의 코드 내 문서](https://github.com/JetBrains/compose-multiplatform-core/blob/jb-main/compose/ui/ui/src/uikitMain/kotlin/androidx/compose/ui/viewinterop/UIKitInteropProperties.uikit.kt)를 참조하세요.

### onResize 파라미터 제거 {id="onresize-parameter-removed"}

기존 `UIKitView` 및 `UIKitViewController` 생성자의 `onResize` 파라미터는 `rect` 인수를 기반으로 커스텀 프레임을 설정했지만 Compose 레이아웃 자체에는 영향을 주지 않아 사용하기에 직관적이지 않았습니다.
게다가 `onResize` 파라미터의 기본 구현은 interop 뷰의 프레임을 올바르게 설정해야 했으며, 뷰를 적절하게 클리핑하기 위한 몇 가지 구현 세부 사항을 포함하고 있었습니다.

`onResize` 없이 대처하는 방법:

* interop 뷰의 프레임 변경에 대응해야 하는 경우 다음과 같이 할 수 있습니다:
    * interop `UIView`의 [`layoutSubviews`](https://developer.apple.com/documentation/uikit/uiview/1622482-layoutsubviews) 오버라이드
    * interop `UIViewController`의 [`viewDidLayoutSubviews`](https://developer.apple.com/documentation/uikit/uiviewcontroller/1621398-viewdidlayoutsubviews) 오버라이드
    * 또는 `Modifier` 체인에 `onGloballyPositioned` 추가
* interop 뷰의 프레임을 설정해야 하는 경우 `size`, `fillMaxSize` 등 해당하는 Compose modifier를 사용하세요.

### 일부 onReset 사용 패턴이 유효하지 않게 됨 {id="some-onreset-usage-patterns-were-invalidated"}

`remember { UIView() }`와 함께 null이 아닌 `onReset` 람다를 사용하는 것은 올바르지 않습니다.

다음 코드를 살펴보겠습니다:

```kotlin
val view = remember { UIView() }

UIKitView(factory = { view }, onReset = { /* ... */ })
```

`UIKitView`가 컴포지션(composition)에 진입할 때 `factory` 또는 `onReset` 중 하나만 호출되며, 둘 다 호출되지는 않습니다.
따라서 `onReset`이 null이 아니면 `remember`된 `view`가 화면에 표시되는 뷰와 달라질 수 있습니다.
컴포저블이 컴포지션을 벗어나면서 뷰의 인스턴스를 남겨둘 수 있으며, 이 인스턴스는 `factory`를 사용해 새로 할당되는 대신 `onReset`에서 재설정된 후 재사용됩니다.

이러한 실수를 방지하려면 생성자에서 `onReset` 값을 지정하지 마세요.
해당 뷰를 방출(emit)하는 함수가 컴포지션에 진입한 컨텍스트에 따라 interop 뷰 내부에서 콜백을 실행해야 할 수도 있습니다.
이러한 경우에는 `onReset` 시 `update`를 사용하여 콜백을 뷰 내부에 저장하는 것을 고려해 보세요.