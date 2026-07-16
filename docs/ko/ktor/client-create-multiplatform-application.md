[//]: # (title: 크로스 플랫폼 모바일 애플리케이션 만들기)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="tutorial-client-kmp"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
Kotlin Multiplatform Mobile 애플리케이션에서 Ktor 클라이언트를 사용하는 방법을 알아봅니다.
</link-summary>

Ktor HTTP 클라이언트는 멀티플랫폼 프로젝트에서 사용할 수 있습니다. 이 튜토리얼에서는 요청을 보내고 응답 본문을 일반 HTML 텍스트로 받는 간단한 Kotlin Multiplatform Mobile 애플리케이션을 만들어 보겠습니다.

## 사전 준비 {id="prerequisites"}

먼저, 적합한 운영 체제에 필요한 도구를 설치하여 크로스 플랫폼 모바일 개발 환경을 설정해야 합니다. [환경 설정](https://kotlinlang.org/docs/multiplatform-mobile-setup.html) 섹션에서 방법을 알아보세요.

> 이 튜토리얼의 특정 단계(iOS 전용 코드 작성 및 iOS 애플리케이션 실행 포함)를 완료하려면 macOS가 설치된 Mac이 필요합니다.
>
{style="note"}

## 새 프로젝트 만들기 {id="new-project"}

새 프로젝트를 만들려면 IntelliJ IDEA의 Kotlin Multiplatform 프로젝트 마법사를 사용할 수 있습니다. 이 마법사는 클라이언트와 서비스로 확장할 수 있는 기본 멀티플랫폼 프로젝트를 생성합니다.

<procedure>

1. IntelliJ IDEA를 실행합니다.
2. IntelliJ IDEA에서 **File | New | Project**를 선택합니다.
3. 왼쪽 패널에서 **Kotlin Multiplatform**을 선택합니다.
4. **New Project** 창에서 다음 필드를 지정합니다.
    * **Name**: KmpKtor
    * **Group**: com.example.ktor
      ![Kotlin Multiplatform 마법사 설정](tutorial_client_kmp_create_project.png){ width="706" border-effect="rounded" style="block" }
5. **Android** 및 **iOS** 타겟을 선택합니다.
6. iOS의 경우, UI를 네이티브로 유지하기 위해 **Do not share UI** 옵션을 선택합니다.
7. **Create** 버튼을 클릭하고 IDE가 프로젝트를 생성하고 임포트할 때까지 기다립니다.

</procedure>

## 빌드 스크립트 구성 {id="build-script"}

### Ktor 의존성 추가 {id="ktor-dependencies"}

프로젝트에서 Ktor HTTP 클라이언트를 사용하려면 최소 두 개의 의존성, 즉 클라이언트 의존성과 [엔진](client-engines.md) 의존성을 추가해야 합니다.

1. <Path>gradle/libs.versions.toml</Path> 파일을 열고 Ktor 버전을 추가합니다:
    
    ```kotlin
    [versions]
    ktor = "3.4.0"
    ```

2. 동일한 <Path>gradle/libs.versions.toml</Path> 파일에서 Ktor 클라이언트 및 엔진 라이브러리를 정의합니다:
    
    ```kotlin
    [libraries]
    ktor-client-core = { module = "io.ktor:ktor-client-core", version.ref = "ktor" }
    ktor-client-okhttp = { module = "io.ktor:ktor-client-okhttp", version.ref = "ktor" }
    ktor-client-darwin = { module = "io.ktor:ktor-client-darwin", version.ref = "ktor" }
    ```

3. <Path>shared/build.gradle.kts</Path> 파일을 열고 다음 의존성을 추가합니다:
    
    ```kotlin
    sourceSets {
        commonMain.dependencies {
            implementation(libs.ktor.client.core)
        }
        androidMain.dependencies {
            implementation(libs.ktor.client.okhttp)
        }
        iosMain.dependencies {
            implementation(libs.ktor.client.darwin)
        }
    }
    ```
    
    - 공통 코드에서 Ktor 클라이언트 기능을 사용할 수 있도록 `commonMain` 소스 세트에 `ktor-client-core`를 추가합니다.
    - `androidMain` 소스 세트에는 Android에서 `OkHttp` 엔진을 사용하기 위해 `ktor-client-okhttp` 의존성을 포함합니다. 또는 [사용 가능한 다른 Android/JVM 엔진](client-engines.md#jvm-android) 중에서 선택할 수 있습니다.
    - `iosMain` 소스 세트에는 iOS에서 Darwin 엔진을 사용하기 위해 `ktor-client-darwin` 의존성을 추가합니다.

### 코루틴 추가 {id="coroutines"}

[Android 코드](#android-activity)에서 코루틴을 사용하려면 프로젝트에 `kotlinx.coroutines`를 추가해야 합니다:

1. <Path>gradle/libs.versions.toml</Path> 파일을 열고 코루틴 버전과 라이브러리를 지정합니다:

    ```kotlin
    [versions]
    kotlinx-coroutines = "1.10.2"
    
    [libraries]
    kotlinx-coroutines-core = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-core", version.ref = "kotlinx-coroutines" }
    kotlinx-coroutines-android = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-android", version.ref = "kotlinx-coroutines" }
    ```

2. <Path>shared/build.gradle.kts</Path> 파일을 열고 `commonMain` 소스 세트에 `kotlinx-coroutines-core` 의존성을 추가합니다:

    ```kotlin
    sourceSets {
        commonMain.dependencies {
            implementation(libs.ktor.client.core)
            implementation(libs.kotlinx.coroutines.core)
        }
    }
    ```

3. 그런 다음 <Path>composeApp/build.gradle.kts</Path> 파일을 열고 `androidMain` 소스 세트에 `kotlinx-coroutines-android` 의존성을 추가합니다:

   ```kotlin
   sourceSets {
       androidMain.dependencies {
           // ...
           implementation(libs.kotlinx.coroutines.android)
       }
   }
   ```

4. **Build | Sync Project with Gradle Files**를 선택하여 추가된 의존성을 설치합니다.

## 애플리케이션 업데이트 {id="code"}

### 공통 코드 (Shared code) {id="shared-code"}

Android와 iOS 간에 공유되는 코드를 업데이트하려면 <Path>shared/src/commonMain/kotlin/com/example/ktor/kmpktor/Greeting.kt</Path> 파일을 열고 `Greeting` 클래스에 다음 코드를 추가합니다:

```kotlin
package com.example.ktor.kmpktor

import io.ktor.client.HttpClient
import io.ktor.client.request.get
import io.ktor.client.statement.bodyAsText

class Greeting {
    private val client = HttpClient()

    suspend fun greet(): String {
        val response = client.get("https://ktor.io/docs/")
        return response.bodyAsText()
    }
}
```

- `HttpClient` 생성자는 HTTP 클라이언트를 생성합니다.
- 일시 중단 함수(suspending function)인 `greet()`는 [요청(request)](client-requests.md)을 보내고 [응답(response)](client-responses.md)의 본문을 문자열 값으로 받습니다.

### Android 코드 {id="android-activity"}

<Path>composeApp/src/androidMain/kotlin/com/example/ktor/kmpktor/App.kt</Path> 파일을 열고 다음과 같이 코드를 업데이트합니다:

```kotlin
package com.example.ktor.kmpktor

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.safeContentPadding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import org.jetbrains.compose.ui.tooling.preview.Preview

@Composable
@Preview
fun App() {
    MaterialTheme {
        Column(
            modifier = Modifier
                .background(MaterialTheme.colorScheme.primaryContainer)
                .safeContentPadding()
                .fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            var text by remember { mutableStateOf("Loading") }
            LaunchedEffect(true) {
                text = try {
                    Greeting().greet()
                } catch (e: Exception) {
                    e.message ?: "error"
                }
            }
            GreetingView(text)
        }
    }
}

@Composable
fun GreetingView(text: String) {
    Text(text = text)
}

@Preview
@Composable
fun DefaultPreview() {
    MaterialTheme {
        GreetingView("Hello, Android!")
    }
}
```

`LaunchedEffect()`는 컴포저블의 생명주기에 연결된 코루틴을 실행합니다. 이 코루틴 내에서 공유 `greet()` 함수가 호출되고, 그 결과가 `text`에 할당되며, 모든 예외가 포착되어 처리됩니다.

### iOS 코드 {id="ios-view"}

<Path>iosApp/iosApp/ContentView.swift</Path> 파일을 열고 다음과 같이 코드를 업데이트합니다:

```Swift
import SwiftUI
import Shared

struct ContentView: View {
    @StateObject private var viewModel = ViewModel()

    var body: some View {
        Text(viewModel.text)
    }
}

extension ContentView {
    @MainActor
    class ViewModel: ObservableObject {
        @Published var text = "Loading..."
        init() {
            Greeting().greet { greeting, error in
                if let greeting = greeting {
                    self.text = greeting
                } else {
                    self.text = error?.localizedDescription ?? "error"
                }
            }
        }
    }
}
```

iOS에서 `greet()` 일시 중단 함수는 콜백이 있는 함수로 제공됩니다.

## Android에서 인터넷 액세스 허용 {id="android-internet"}

마지막 단계는 Android 애플리케이션에 대해 인터넷 액세스를 허용하는 것입니다.
<Path>composeApp/src/androidMain/AndroidManifest.xml</Path> 파일을 열고 `&lt;uses-permission&gt;` 요소를 사용하여 필요한 권한을 추가합니다:

```xml
<manifest>
    <uses-permission android:name="android.permission.INTERNET" />
    <application>
        ...
    </application>
</manifest> 
```

## Android에서 애플리케이션 실행 {id="run-android"}

1. IntelliJ IDEA의 실행 구성 목록에서 **composeApp**을 선택합니다.
2. 구성 목록 옆에서 Android 가상 장치를 선택하고 **Run**을 클릭합니다.
   ![Pixel 8 API 장치가 선택된 composeApp](tutorial_client_kmp_run_android.png){width="381" style="block"}

   목록에 장치가 없는 경우, [새 Android 가상 장치](https://developer.android.com/studio/run/managing-avds#createavd)를 생성하세요.
3. 로드가 완료되면 시뮬레이터에 수신된 HTML 문서가 일반 텍스트로 표시되어야 합니다.
   ![Android 시뮬레이터](tutorial_client_kmp_android.png){width="381" style="block"}

> Android 에뮬레이터가 인터넷에 연결되지 않는 경우, 콜드 부팅(cold boot)을 시도해 보세요.
> **Device Manager** 도구 창에서 중지된 장치 옆의 **⋮** (점 세 개)를 클릭하고 메뉴에서 **Cold Boot**를 선택합니다. 이는 종종 연결 문제를 일으킬 수 있는 손상된 에뮬레이터 캐시를 지우는 데 도움이 됩니다.
>
{style="tip"}

## iOS에서 애플리케이션 실행 {id="run-ios"}

1. IntelliJ IDEA의 실행 구성 목록에서 **iosApp**을 선택합니다.
2. 구성 목록 옆에서 iOS 시뮬레이션 장치를 선택하고 **Run**을 클릭합니다.
   ![iPhone 16 장치가 선택된 iosApp](tutorial_client_kmp_run_ios.png){width="381" style="block"}

   목록에 사용 가능한 iOS 구성이 없는 경우, [새 실행 구성](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-create-first-app.html#run-on-a-new-ios-simulated-device)을 추가하세요.
3. 로드가 완료되면 시뮬레이터에 수신된 HTML 문서가 일반 텍스트로 표시되어야 합니다.
   ![iOS 시뮬레이터](tutorial_client_kmp_ios.png){width="381" style="block"}