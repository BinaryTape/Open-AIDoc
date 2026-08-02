# 멀티플랫폼 Jetpack 라이브러리의 패키징 방식

Compose Multiplatform은 Jetpack Compose와 관련 AndroidX 라이브러리의 모든 기능을 Android 이외의 다른 플랫폼으로 확장합니다.
[Android 개발자 웹사이트](https://developer.android.com/kotlin/multiplatform)에 나와 있듯이,
`androidx.annotation`과 같은 많은 Jetpack 라이브러리는 Android 팀에서 완전한 멀티플랫폼 라이브러리로 배포하며 KMP 프로젝트에서 그대로 사용할 수 있습니다.
반면 Compose 자체, Navigation, Lifecycle, ViewModel과 같은 다른 라이브러리들은 공통 코드(common code)에서 작동하기 위해 추가적인 지원이 필요합니다.

JetBrains의 Compose Multiplatform 팀은 이러한 라이브러리에 대해 Android 이외의 플랫폼용 아티팩트(artifact)를 제작하고, 이를 원본 Android 아티팩트와 함께 단일 그룹 ID로 묶어 배포합니다.
이렇게 하면 공통 소스 세트(common source set)에 이러한 멀티플랫폼 의존성을 추가했을 때, 앱의 Android 배포판은 Android 아티팩트를 사용하게 됩니다.
동시에 다른 타겟의 배포판은 해당 플랫폼에 맞춰 빌드된 아티팩트를 사용합니다.

프로세스의 개요는 다음과 같습니다:

![](androidx-cmp-artifacts.svg)

예를 들어, "iOS용 Navigation 아티팩트"는 다음 멀티플랫폼 아티팩트들의 모음을 의미합니다:
* `org.jetbrains.androidx.navigation.navigation-compose-uikitarm64`
* `org.jetbrains.androidx.navigation.navigation-compose-uikitsimarm64`
* `org.jetbrains.androidx.navigation.navigation-common-iosarm64`
* `org.jetbrains.androidx.navigation.navigation-runtime-iossimulatorarm64`
* 기타 등등.

이러한 모든 아티팩트는 다른 플랫폼용 아티팩트 및 원본 Android 라이브러리(`androidx.navigation.navigation-compose`)에 대한 참조와 함께 하나의 그룹으로 배포됩니다. 이들은 통합된 
`org.jetbrains.androidx.navigation.navigation-compose` 의존성을 통해 접근할 수 있습니다.
Compose Multiplatform Gradle 플러그인은 플랫폼별 아티팩트를 각 배포판에 매핑하는 작업을 처리합니다.

이 접근 방식을 통해, 해당 의존성을 가진 Kotlin Multiplatform(KMP) 프로젝트에서 생성된 Android 앱은 원본 Android Navigation 라이브러리를 사용합니다.
반면, iOS 앱은 JetBrains에서 빌드한 해당 iOS 라이브러리를 사용합니다.

## 멀티플랫폼 프로젝트에서 사용 가능한 Compose 패키지

기본 Compose 라이브러리 중 핵심인 `androidx.compose.runtime`은 완전한 멀티플랫폼을 지원합니다.
  ([이전에 사용되었던](whats-new-compose-190.md#multiplatform-targets-in-androidx-compose-runtime-runtime)
  `org.jetbrains.compose.runtime` 아티팩트는 이제 에일리어스(alias) 역할을 합니다.)
또한, Compose Multiplatform은 다음을 구현합니다:
   * `androidx.compose.ui`와 `androidx.compose.foundation`의 멀티플랫폼 버전은 Compose Multiplatform 프로젝트에서 `org.jetbrains.compose.ui` 및 `org.jetbrains.compose.foundation`으로 사용할 수 있습니다.
   * `androidx.compose.material3`와 `androidx.compose.material`의 멀티플랫폼 버전도 유사하게 패키징됩니다 (`org.jetbrains.compose.material3` 및 `org.jetbrains.compose.material`).
     다른 라이브러리와 달리, Material 3 라이브러리는 Compose Multiplatform 버전과 결합되어 있지 않습니다.
     따라서 `material3` 에일리어스 대신 직접적인 의존성을 제공할 수 있습니다. 예를 들어, EAP 버전을 사용할 수 있습니다.
   * 독립형 아티팩트 형태의 Material 3 adaptive 라이브러리 (`org.jetbrains.compose.material3.adaptive:adaptive*`)

## 추가 멀티플랫폼 라이브러리

Compose 앱 빌드에 필요한 일부 기능은 AndroidX의 범위를 벗어나므로, JetBrains는 이를 다음과 같이 Compose Multiplatform에 포함된 멀티플랫폼 라이브러리로 구현합니다:

* Compose Multiplatform Gradle 플러그인:
    * Compose Multiplatform 프로젝트 구성을 위한 Gradle DSL을 제공합니다.
    * 데스크톱 및 웹 타겟을 위한 배포 패키지 생성을 돕습니다.
    * 멀티플랫폼 리소스 라이브러리가 각 타겟에 맞게 리소스를 올바르게 사용할 수 있도록 지원합니다.
* `org.jetbrains.compose.components.resources`: [크로스 플랫폼 리소스](compose-multiplatform-resources.md) 지원을 제공합니다.
* `org.jetbrains.compose.components.uiToolingPreview`: IntelliJ IDEA 및 Android Studio에서 공통 코드에 대한 Compose UI 미리보기(preview)를 지원합니다.
* `org.jetbrains.compose.components.animatedimage`: 애니메이션 이미지 표시를 지원합니다.
* `org.jetbrains.compose.components.splitpane`: Swing의 [JSplitPane](https://docs.oracle.com/javase/8/docs/api/javax/swing/JSplitPane.html)과 유사한 기능을 구현합니다.