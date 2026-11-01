[//]: # (title: Compose Multiplatform UI 테스트)

Compose Multiplatform의 UI 테스트는 Jetpack Compose 테스트 API와 동일한 파인더(finder), 단언(assertion), 액션(action) 및 매처(matcher)를 사용하여 구현됩니다. 이러한 개념에 익숙하지 않다면 이 문서를 계속 읽기 전에 [Jetpack Compose 가이드](https://developer.android.com/jetpack/compose/testing)를 먼저 확인하세요.

> 이 API는 [실험적(Experimental)](supported-platforms.md#compose-multiplatform-ui-framework-stability-levels)입니다.
> 향후 변경될 수 있습니다.
>
{style="warning"}

## Compose Multiplatform 테스트와 Jetpack Compose의 차이점 {id="how-compose-multiplatform-testing-is-different-from-jetpack-compose"}

Compose Multiplatform 공통 테스트 API는 JUnit의 `TestRule` 클래스에 의존하지 않습니다. 대신 `runComposeUiTest` 함수를 호출하고 `ComposeUiTest` 수신 객체(receiver)에서 테스트 함수를 호출합니다.

하지만 [데스크톱 타깃](compose-desktop-ui-testing.md)에서는 JUnit 기반 API를 사용할 수 있습니다.

## Compose Multiplatform으로 테스트 작성 및 실행 {id="writing-and-running-tests-with-compose-multiplatform"}

먼저 모듈에 테스트용 소스 세트와 필요한 의존성을 추가합니다. 그런 다음 예제 테스트를 작성하여 실행해 보고, 필요에 맞게 커스텀해 보세요.

### 테스트 소스 세트 생성 및 테스트 라이브러리 의존성 추가 {id="create-the-test-source-set-and-add-the-testing-library-to-dependencies"}

구체적인 예를 제공하기 위해 이 페이지의 지침은 [Kotlin Multiplatform 마법사](https://kmp.jetbrains.com/)로 생성된 프로젝트 구조를 따릅니다.
기존 프로젝트에 테스트를 추가하는 경우 경로와 명령어의 `shared`를 테스트하려는 모듈 이름으로 바꾸어야 할 수 있습니다.

Kotlin Multiplatform 마법사에서 **Include tests** 옵션을 선택하면 `*Test` 소스 세트를 포함한 테스트용 기본 구조가 생성됩니다.

UI 테스트 라이브러리 설정:
`shared/build.gradle.kts` 파일에서 `commonTest` 소스 세트의 의존성에 UI 테스트 라이브러리를 추가합니다.

```kotlin
kotlin {
    //...
    sourceSets {
        // 공통 테스트 의존성 추가
        commonTest.dependencies {
            //...
            implementation("org.jetbrains.compose.ui:ui-test:%org.jetbrains.compose%")
        }

        // 데스크톱 테스트 의존성 추가
        jvmTest.dependencies { 
            implementation(compose.desktop.currentOs)
        }
    }
}
```

Android용 계측(에뮬레이터) 테스트를 실행해야 하는 경우 다음과 같이 Gradle 구성을 수정합니다.
   
1. `shared/build.gradle.kts` 파일의 `androidLibrary {}` 블록에 다음 코드를 추가하여 계측 테스트 소스 세트가 공통 테스트 소스 세트에 의존하도록 구성합니다.

   ```kotlin
   kotlin {
       //...
       androidLibrary {
           withDeviceTestBuilder { 
               sourceSetTreeName = "test"
           }
       } 
   }
   ```
   
2. `androidApp/build.gradle.kts` 파일의 `android.defaultConfig {}` 블록에 다음 코드를 추가하여 Android 테스트 계측 러너(instrumentation runner)를 구성합니다.

   ```kotlin
   android {
       //...
       defaultConfig {
           //...
           testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
       }
   }
   ```

3. `androidApp/build.gradle.kts` 파일의 루트 `dependencies {}` 블록에 필요한 의존성을 추가합니다.

    ```kotlin
    dependencies { 
        androidTestImplementation("androidx.compose.ui:ui-test-junit4-android:%androidx.compose%")
        debugImplementation("androidx.compose.ui:ui-test-manifest:%androidx.compose%")
    }
    ```
4. 메인 메뉴에서 **Build | Sync Project with Gradle Files**를 선택하거나 빌드 스크립트 에디터에서 Gradle 새로고침 버튼을 클릭합니다.

5. 계측 테스트를 위한 `shared/src/androidDeviceTest` 소스 세트를 생성해야 합니다.
   대부분의 테스트가 `commonTest`에 있더라도 `androidDeviceTest` 디렉터리에는 테스트에서 사용할 일반 액티비티를 가리키는 `AndroidManifest.xml` 파일이 최소한 하나는 있어야 합니다.

    ```xml
    <?xml version="1.0" encoding="utf-8"?>
    <manifest xmlns:android="http://schemas.android.com/apk/res/android">
        <application>
            <activity
                    android:name="androidx.activity.ComponentActivity"
                    android:exported="true">
                <intent-filter>
                    <action android:name="android.intent.action.MAIN" />
                    <category android:name="android.intent.category.LAUNCHER" />
                </intent-filter>
            </activity>
        </application>
    </manifest>
    ```
    {collapsible="true" collapsed-title-line-number="5"}

이제 Compose Multiplatform UI를 위한 공통 테스트를 작성하고 실행할 준비가 되었습니다.

### 공통 테스트 작성 및 실행 {id="write-and-run-common-tests"}

`shared/src/commonTest/kotlin/<package>` 디렉터리에 `ExampleTest.kt`라는 파일을 생성하고 다음 코드를 복사해 넣습니다.

```kotlin
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.test.ExperimentalTestApi
import androidx.compose.ui.test.assertTextEquals
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.v2.runComposeUiTest
import kotlin.test.Test

class ExampleTest {

    @OptIn(ExperimentalTestApi::class)
    @Test
    fun myTest() = runComposeUiTest {
        // API 호출을 시연하기 위한 목(Mock) UI 선언
        //
        // 프로젝트 코드를 테스트하려면 자체 선언으로 대체하세요
        setContent {
            var text by remember { mutableStateOf("Hello") }
            Text(
                text = text,
                modifier = Modifier.testTag("text")
            )
            Button(
                onClick = { text = "Compose" },
                modifier = Modifier.testTag("button")
            ) {
                Text("Click me")
            }
        }

        // Compose Multiplatform 테스트 API의 단언과 액션을 사용하여 선언된 UI 테스트
        onNodeWithTag("text").assertTextEquals("Hello")
        onNodeWithTag("button").performClick()
        onNodeWithTag("text").assertTextEquals("Compose")
    }
}
```

테스트를 실행하는 방법:

<Tabs>
<TabItem title="iOS Simulator">

두 가지 옵션이 있습니다.
* IntelliJ IDEA에서 `myTest()` 함수 옆 여백(gutter)에 있는 녹색 실행 아이콘을 클릭하고 **Run | ExampleTest.myTest**를 선택한 다음 테스트할 iOS 타깃을 선택합니다.
* 터미널에서 다음 명령을 실행합니다.

   ```shell
   ./gradlew :shared:iosSimulatorArm64Test
   ```

</TabItem>
<TabItem title="Android Emulator">

터미널에서 다음 명령을 실행합니다.

```shell
./gradlew :shared:connectedAndroidTest
```

현재는 `android (local)` 테스트 구성을 사용하여 공통 Compose Multiplatform 테스트를 실행할 수 없으므로, 예를 들어 Android Studio의 거터(gutter) 아이콘은 작동하지 않습니다.

</TabItem>
<TabItem title="Desktop">

두 가지 옵션이 있습니다.
* `myTest()` 함수 옆 여백(gutter)에 있는 녹색 실행 아이콘을 클릭하고 **Run | ExampleTest.myTest**를 선택한 다음 JVM 타깃을 선택합니다.
* 터미널에서 다음 명령을 실행합니다.

   ```shell
   ./gradlew :shared:jvmTest
   ```

</TabItem>
<TabItem title="Wasm (headless browser)">

터미널에서 다음 명령을 실행합니다.

```shell
./gradlew :shared:wasmJsTest
```

</TabItem>
</Tabs>

## 다음 단계 {id="what-s-next"}

Compose Multiplatform UI 테스트에 익숙해졌다면 다음 테스트 관련 리소스도 살펴보세요.
* Kotlin Multiplatform 프로젝트에서의 전반적인 테스트 개요는 [기본 프로젝트 구조 이해](multiplatform-discover-project.md#integration-with-tests) 및 [멀티플랫폼 앱 테스트](multiplatform-run-tests.md) 튜토리얼을 참조하세요.
* 데스크톱 타깃을 위한 JUnit 기반 테스트 설정 및 실행에 대한 자세한 내용은 [JUnit을 사용한 Compose Multiplatform UI 테스트](compose-desktop-ui-testing.md)를 참조하세요.
* 현지화(Localization) 테스트는 [다양한 플랫폼에서의 로케일 테스트](compose-localization-tests.md#testing-locales-on-different-platforms)를 참조하세요.
* 자동화를 포함한 Android Studio에서의 고급 테스트는 Android Studio 문서의 [앱 테스트](https://developer.android.com/studio/test) 문서를 참조하세요.