[//]: # (title: 네이티브 UI: REST API 요청을 위한 로직 공유)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

이 튜토리얼에서는 네이티브 코드로 개별 UI를 구현하면서 특정 비즈니스 로직 코드를 공유하는 방법을 보여줍니다.
로직과 UI를 모두 공유하는 예제는 [완전 공유 코드: 시간대 선택기 앱](compose-multiplatform-new-project.md)을 참조하세요.

여기에서는 [Launch Library 2](https://lldev.thespacedevs.com/docs) REST API에서 가장 최근에 성공한 우주 발사 정보를 가져와 그 결과를 표시하는 애플리케이션을 만듭니다.
네트워킹 및 데이터 직렬화 코드는 iOS와 Android 간에 공유됩니다.

Kotlin Multiplatform IDE 마법사로 생성된 프로젝트에서 최종 결과물까지 완성하기 위해 다음 단계를 진행합니다:

1. [공통 및 플랫폼별 종속성 구성](#add-dependencies)
2. [API 요청 및 응답 저장을 위한 데이터 모델 설정](#set-up-api-requests)
3. 네이티브 UI에서 데이터를 소비하고 표시:
   * [Android UI 업데이트](#update-native-android-ui) 
   * [iOS UI 업데이트](#update-native-ios-ui).
     Kotlin 코루틴을 Swift 코드에 통합하기 위해 두 가지 라이브러리를 사용해 볼 수 있습니다.

> 프로젝트의 최종 상태는 iOS 코루틴 솔루션에 따라 GitHub 저장소의 두 브랜치에서 확인할 수 있습니다.
> * [`main`](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main) 브랜치에는 KMP-NativeCoroutines 구현이 포함되어 있습니다.
> * [`main-skie`](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main-skie) 브랜치에는 SKIE(Kotlin-Swift 상호 운용성 라이브러리) 구현이 포함되어 있습니다.
>
{style="tip"}

## 프로젝트 생성 {id="create-a-project"}

IDE와 Kotlin Multiplatform IDE 플러그인이 설치된 상태에서 새 Kotlin Multiplatform 프로젝트를 생성합니다.

1. IntelliJ IDEA에서 **File** | **New** | **Project**를 선택합니다.
2. 왼쪽 패널에서 **Kotlin Multiplatform**을 선택합니다.
3. **New Project** 창에서 다음 필드를 지정합니다.

    * **Name**: GreetingKMP
    * **Project ID** (패키지 이름으로 사용됨): com.jetbrains.greetingkmp

4. **Android** 및 **iOS** 타깃을 선택합니다.
   iOS의 경우 네이티브 UI를 유지하기 위해 **Do not share UI** 옵션을 선택합니다.
5. **Create**를 클릭합니다.

   ![Kotlin Multiplatform 프로젝트 생성](create-first-multiplatform-app.png){width=700}

첫 임포트에는 몇 분 정도 걸립니다.
완료된 후 모든 사전 점검(preflight checks)이 통과(초록색)되었는지 확인하세요(**View | Tool Windows | Projects Environment Preflight Checks**).

## 프로젝트 구조 살펴보기 {id="examine-the-project-structure"}

IntelliJ IDEA에서 `GreetingKMP` 폴더를 확장합니다.

Kotlin Multiplatform 프로젝트에는 다음 모듈이 포함되어 있습니다.

* **androidApp**: Android 애플리케이션을 빌드하는 Kotlin 모듈입니다. 빌드 시스템으로 Gradle을 사용합니다.
  **androidApp** 모듈은 일반 Android 라이브러리처럼 **sharedLogic** 모듈에 의존하고 이를 사용합니다.
* **iosApp**: iOS 애플리케이션을 빌드하는 Xcode 프로젝트입니다.
* **sharedLogic**: Android와 iOS 애플리케이션 간에 공유되는 로직이 포함된 멀티플랫폼 모듈입니다.
* **sharedUI**: Compose Multiplatform으로 구현된 UI 코드가 있는 모듈입니다.
  이 프로젝트에서 **sharedUI**는 Android 앱에서만 사용되지만 필요할 때 언제든지 다른 타깃으로 확장할 수 있습니다.
  Android에서 [Compose Multiplatform 호출은 Jetpack Compose로 직접 변환](compose-multiplatform-jetpack-libraries.md)되므로,
  이 특정 구성에서는 오버헤드가 발생하지 않습니다.

**iosApp**을 제외한 모든 모듈은 Gradle을 빌드 시스템으로 사용합니다.
**iosApp** 모듈은 **sharedLogic** 모듈로부터 iOS 프레임워크를 생성하기 위해 Kotlin Gradle 빌드를 호출하는 Xcode로 빌드됩니다.
이는 Kotlin Multiplatform에서 _직접 iOS 통합(direct iOS integration)_의 한 예입니다.

> iOS용 Kotlin 빌드에 대한 자세한 내용은 [iOS 통합 방법](multiplatform-ios-integration-overview.md)을 참조하세요.
> 
{style="tip"}

## 종속성 추가 {id="add-dependencies"}

프로젝트에는 다음과 같은 멀티플랫폼 라이브러리가 필요합니다.

* [`kotlinx-datetime`](https://github.com/Kotlin/kotlinx-datetime): 타임스탬프를 처리하고 포맷팅합니다.
* [Ktor](https://ktor.io/): HTTP를 통해 데이터를 전송하고 가져오는 프레임워크입니다.
* [`kotlinx.coroutines`](https://github.com/Kotlin/kotlinx.coroutines): 코루틴 Flow를 사용하여 네트워크 호출을 비동기식으로 처리합니다.
* [`kotlinx.serialization`](https://github.com/Kotlin/kotlinx.serialization): API의 JSON 응답을 Kotlin 객체로 역직렬화합니다.

모든 플랫폼별 코드는 라이브러리의 플랫폼 아티팩트에 래핑되어 있으므로,
플랫폼별 호출을 직접 구현할 필요가 없습니다.

네이티브 iOS UI에서는 Swift와 Kotlin 간의 비동기 코드를 연결하기 위한 추가 라이브러리가 필요합니다.
이 설정은 공통 API를 사용할 준비가 된 후 [iOS UI 업데이트](#update-native-ios-ui) 섹션에서 다룹니다.

### Gradle 버전 카탈로그 업데이트 {id="update-the-gradle-version-catalog"}

`gradle/libs.versions.toml`에 다음 항목을 추가한 다음, 빌드 구성 코드에서 참조를 사용할 수 있도록 Gradle 파일을 동기화합니다.

```toml
[versions]
# ...
kotlinx-coroutines = "%coroutinesVersion%"
kotlinx-datetime = "%dateTimeVersion%"
ktor = "%ktorVersion%"

[libraries]
# ...
kotlinx-coroutines = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-core", version.ref = "kotlinx-coroutines" }
kotlinx-datetime = { module = "org.jetbrains.kotlinx:kotlinx-datetime", version.ref = "kotlinx-datetime" }
ktor-client-core = { module = "io.ktor:ktor-client-core", version.ref = "ktor" }
ktor-client-content-negotiation = { module = "io.ktor:ktor-client-content-negotiation", version.ref = "ktor" }
ktor-serialization-kotlinx-json = { module = "io.ktor:ktor-serialization-kotlinx-json", version.ref = "ktor" }
ktor-client-darwin = { module = "io.ktor:ktor-client-darwin", version.ref = "ktor" }
ktor-client-android = { module = "io.ktor:ktor-client-android", version.ref = "ktor" }

[plugins]
# ...
kotlinSerialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
```

### 해당 소스 세트에 종속성 추가 {id="add-dependencies-to-corresponding-source-sets"}

`sharedLogic/build.gradle.kts` 파일의 해당 소스 세트(source sets)에 라이브러리 참조를 추가합니다.

```kotlin
plugins {
    // ...
    alias(libs.plugins.kotlinSerialization)
}

kotlin {
    sourceSets {
        commonMain.dependencies {
            // ...
            // Kotlin Multiplatform Gradle 플러그인이 코루틴과 datetime의
            // 플랫폼별 아티팩트를 자동으로 추가합니다.
            implementation(libs.kotlinx.coroutines)
            implementation(libs.kotlinx.datetime)
            // 메인 Ktor 종속성
            implementation(libs.ktor.client.core)
            // Ktor가 특정 형식의 직렬화를 사용할 수 있도록
            // 해주는 종속성
            implementation(libs.ktor.client.content.negotiation)
            implementation(libs.ktor.serialization.kotlinx.json)
        }
        androidMain.dependencies {
            // Ktor용 Android 엔진 제공
            implementation(libs.ktor.client.android)
        }
        iosMain.dependencies {
            // Ktor용 Darwin 엔진 제공
            implementation(libs.ktor.client.darwin)
        }
    }
}
```

Gradle 파일을 동기화합니다. **Shift** 키를 두 번 누른 후 **Sync Project with Gradle Files** 명령을 찾아 실행합니다.

> 멀티플랫폼 종속성을 관리하는 방법에 대한 자세한 내용은
> [멀티플랫폼 라이브러리 종속성 추가](multiplatform-add-dependencies.md)를 참조하세요.
>
{style="tip"}

## API 요청 설정 {id="set-up-api-requests"}

[Launch Library API](https://lldev.thespacedevs.com/docs)를 사용하여 데이터를 가져옵니다.
구체적으로는 **/2.3.0/launches** 엔드포인트에서 발사 목록을 가져옵니다.

### 데이터 모델 생성 {id="create-a-data-model"}

`sharedLogic/src/commonMain/.../greetingkmp` 디렉터리에 새 `RocketLaunch.kt` 파일을 만들고
Launch Library API의 데이터를 저장하는 데이터 클래스를 추가합니다.

```kotlin
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

// @Serializable은 kotlinx.serialization 플러그인에
// 클래스의 기본 직렬 변환기를 자동으로 생성하도록 지시합니다.
@Serializable
data class RocketLaunch(
    // @SerialName은 필드 이름을 재정의하여 직렬화된 형식에서
    // 프로퍼티 이름을 더 읽기 쉽게 만듭니다.
    @SerialName("id")
    val id: String,
    @SerialName("name")
    val missionName: String,
    @SerialName("net")
    val launchDateUTC: String,
    @SerialName("status")
    val status: LaunchStatus,
)

@Serializable
data class LaunchStatus(
    @SerialName("id")
    val id: Int,
    @SerialName("name")
    val name: String,
)

@Serializable
data class LaunchListResponse(
    @SerialName("results")
    val results: List<RocketLaunch>,
)
```

### HTTP 클라이언트 연결 {id="connect-http-client"}

1. `sharedLogic/src/commonMain/.../greetingkmp` 디렉터리에 새 `RocketComponent` 클래스를 만듭니다.
2. `httpClient` 프로퍼티를 추가하고 이를 사용하여 HTTP GET 요청 결과로부터 최종 문자열을 구성합니다.

    ```kotlin
    import io.ktor.client.HttpClient
    import io.ktor.client.call.body
    import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
    import io.ktor.client.request.get
    import io.ktor.serialization.kotlinx.json.json
    import kotlinx.datetime.TimeZone
    import kotlinx.datetime.toLocalDateTime
    import kotlinx.serialization.json.Json
    import kotlin.time.Instant
    
    class RocketComponent {
        private val httpClient = HttpClient {
            // ContentNegotiation Ktor 플러그인과 JSON serializer가
            // GET 요청의 결과를 역직렬화합니다.
            install(ContentNegotiation) {
                json(Json {
                    // 더 읽기 쉬운 JSON 생성
                    prettyPrint = true
                    // 따옴표가 없는 키나 문자열 값과 같은
                    // 비표준 JSON 입력 허용
                    isLenient = true
                    // 모델에 선언되지 않은 키 무시
                    ignoreUnknownKeys = true
                })
            }
        }

        // 가장 최근에 성공한 발사의 날짜 문자열을 반환합니다.
        // 중단 함수인 httpClient.get()을 호출하므로
        // suspend 키워드로 표시됩니다.
        private suspend fun getDateOfLastSuccessfulLaunch(): String {
            // 로켓 발사에 대한 정보를 비동기식으로 가져옵니다.
            val response: LaunchListResponse =
                httpClient.get("https://lldev.thespacedevs.com/2.3.0/launches/previous/?mode=list&limit=10&format=json").body()
            // 가장 최근에 성공한 발사를 가져옵니다.
            // 응답에서 발사는 최신순에서 오래된 순으로 정렬되며,
            // 성공한 발사는 'status.id'가 3으로 표시됩니다.
            val lastSuccessLaunch = response.results.first { it.status.id == 3 }
            // 발사 타임스탬프를 로컬 시간으로 변환합니다.
            val date = Instant.parse(lastSuccessLaunch.launchDateUTC)
                .toLocalDateTime(TimeZone.currentSystemDefault())

            // 날짜는 "MMMM D, YYYY" 형식으로 표시됩니다(예: "JULY 15, 2026").
            return "${date.month} ${date.day}, ${date.year}"
        }

        // 중단 함수인 getDateOfLastSuccessfulLaunch()를 사용하여
        // UI를 위한 최종 문자열을 빌드합니다.
        suspend fun launchPhrase(): String =
            try {
                "The last successful launch was on ${getDateOfLastSuccessfulLaunch()} 🚀"
            } catch (e: Exception) {
                println("Exception during getting the date of the last successful launch $e")
                "Error occurred"
            }
    }
    ```

   중단 함수(suspending functions)는 코루틴이나 다른 중단 함수에서만 호출할 수 있습니다.
   예를 들어, `httpClient.get()`은 스레드를 차단하지 않고 네트워크를 통해 비동기식으로 데이터를 검색해야 하므로 중단 함수입니다.
   `getDateOfLastSuccessfulLaunch()` 함수는 `httpClient.get()`을 호출하므로 이 함수 역시 `suspend` 키워드로 지정되어 있습니다.

### 코루틴 Flow 생성 {id="create-a-coroutine-flow"}

단순히 중단 함수를 호출하는 대신, 일련의 값 시퀀스를 생성해야 할 때는 [Flow](https://kotlinlang.org/docs/flow.html)를 사용할 수 있습니다.
Flow는 중단 함수처럼 단일 값을 반환하는 대신 값이 생성될 때마다 값의 시퀀스를 방출(emit)할 수 있습니다.

1. `sharedLogic/src/commonMain/kotlin` 디렉터리의 `Greeting.kt` 파일을 엽니다.
2. 주로 네트워크 요청을 수용하기 위해 `Greeting` 클래스의 `greet()` 함수를 문자열의 `Flow`를 반환하도록 업데이트합니다.
   `Flow` 내에서 `RocketComponent` 프로퍼티를 사용하여 발사 날짜를 방출합니다.

    ```kotlin
    import kotlinx.coroutines.delay
    import kotlinx.coroutines.flow.Flow
    import kotlinx.coroutines.flow.flow
    import kotlin.random.Random
    import kotlin.time.Duration.Companion.seconds
    
    class Greeting {
        private val platform = getPlatform()
   
        // 가장 최근에 성공한 발사 날짜를 저장합니다.
        private val rocketComponent = RocketComponent()
        // 인사말 문자열을 하나씩 빌드하고 비동기식으로 방출합니다.
        fun greet(): Flow<String> = flow {
            emit(if (Random.nextBoolean()) "Hi!" else "Hello!")
            delay(1.seconds)
            emit("Guess what this is! > ${platform.name.reversed()}")
            emit(rocketComponent.launchPhrase())
        }
    }
    ```

    `Flow`는 중단 가능한 블록을 래핑하는 [`flow()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flow.html) 빌더 함수로 생성됩니다.

이제 `greet()` 함수는 단일 `String` 대신 `Flow<String>`을 반환합니다.
네이티브 UI 코드는 `Greeting` 클래스를 가져와 `greet()` 함수에서 방출된 문자열을 수집(collect)합니다.

다음 섹션에 나온 대로 네이티브 UI에 해당 변경 사항을 구현하세요.

## 네이티브 Android UI 업데이트 {id="update-native-android-ui"}

공유 모듈과 Android 애플리케이션이 모두 Kotlin으로 작성되어 있으므로, Android에서 공유 코드를 사용하는 것은 간단합니다.

### 뷰 모델 도입 {id="introduce-a-view-model"}

뷰 모델은 [Android 액티비티](https://developer.android.com/guide/components/activities/intro-activities)의 수명 주기 전반에 걸쳐 UI 관련 데이터를 관리하기 위해 Android 개발에서 흔히 사용됩니다.
애플리케이션이 점점 복잡해지고 있으므로 뷰 모델을 사용하면 이점이 있습니다.
뷰 모델은 Launch Library API에서 수신한 데이터를 저장하고 이를 UI에서 사용할 수 있도록 합니다.

`sharedUI/src/commonMain/.../greetingkmp` 디렉터리에 멀티플랫폼 AndroidX 라이브러리의 `[ViewModel](https://developer.android.com/reference/kotlin/androidx/lifecycle/ViewModel)`을 상속하는 새로운 `MainViewModel` 클래스를 만들어 Android의 수명 주기 메커니즘과 구성 추적을 활용합니다.

```kotlin
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class MainViewModel: ViewModel() {
    // StateFlow는 단일 현재 상태 값을 보유하는 Flow입니다.
    val greetingList: StateFlow<List<String>>
        // 명시적 뒷받침 필드(backing field)는 클래스 외부에서는 읽기 전용이며
        // 내부에서는 변경 가능합니다.
        field = MutableStateFlow<List<String>>(listOf())

    // Greeting().greet() 호출에 의해 방출된 모든 문자열을 수집합니다.
    init {
        // 이 ViewModel이 소유한 코루틴에서 수집을 시작합니다.
        // ViewModel이 유지되는 동안 활성 상태를 유지하며
        // ViewModel이 지워질 때 자동으로 취소됩니다.
        viewModelScope.launch {
            // 각 새 문구를 greetingList에 추가합니다.
            Greeting().greet().collect { phrase ->
                greetingList.update { list -> list + phrase }
            }
        }
    }
}
```

### 뷰 모델의 Flow 사용 {id="use-the-view-model-s-flow"}

`sharedUI/src/commonMain/.../greetingkmp`에서 `App.kt` 파일을 열고 새로 구현된 뷰 모델을 사용하도록 기존 구현을 바꿉니다.

Flow가 새 값을 방출함에 따라 컴포지션이 업데이트되어 인사말 문구가 하나씩 표시됩니다.

```kotlin
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.compose.runtime.getValue
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.compose.material3.HorizontalDivider
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.ui.unit.dp

@Composable
@Preview
fun App(mainViewModel: MainViewModel = viewModel()) {
    MaterialTheme {
        // ViewModel의 Flow에서 greetingList의 값을 수집하고
        // 수명 주기를 인식하는 방식으로 컴포저블 상태로 표현합니다.
        val greetings by mainViewModel.greetingList.collectAsStateWithLifecycle()

        // 구분선으로 구분된 열(Column)로 인사말 문구를 표시합니다.
        Column(
            modifier = Modifier
                .safeContentPadding()
                .fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            greetings.forEach { greeting ->
                Text(greeting)
                HorizontalDivider()
            }
        }
    }
}
```

### 인터넷 액세스 권한 추가 {id="add-internet-access-permission"}

Android 애플리케이션이 인터넷에 액세스할 수 있도록 `androidApp/src/main/AndroidManifest.xml` 파일에 다음 권한을 추가합니다.

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET"/>
    <!-- The rest of the manifest -->
</manifest>
```

### 앱 실행 {id="run-the-app"}

최종 결과를 확인하려면 **androidApp** 실행 구성을 실행하세요.

> 새 에뮬레이터를 생성하거나 실제 기기에서 앱을 실행하는 방법에 대한 자세한 내용은 [Kotlin Multiplatform 애플리케이션 빌드 및 실행](build-and-run-kmp.md)을 참조하세요.
>
{style="note"}

![Android 최종 결과](multiplatform-mobile-upgrade-android.png){width=350}

## 네이티브 iOS UI 업데이트 {id="update-native-ios-ui"}

프로젝트의 iOS 부분에서는 Android 앱에서 했던 것처럼 UI를 `sharedLogic` 모듈에 연결하기 위해 뷰 모델 패턴을 활용합니다.
이 모듈은 `ContentView.swift` 파일에 `import SharedLogic` 선언으로 이미 임포트되어 있습니다.

iOS 앱의 코드는 `iosApp/iosApp` 디렉터리에 있습니다.
`ContentView.swift`에는 대부분의 로직이 포함되어 있고, `iOSApp.swift`에는 앱의 진입점이 있습니다.

### `ViewModel` 도입 {id="introduce-a-viewmodel"}

`iosApp/ContentView.swift` 파일에서 `ContentView`를 위한 데이터를 준비하고 관리할 `ViewModel` 클래스를 만듭니다.
전체 파일을 다음 코드로 바꿉니다.

```swift
import SwiftUI
import SharedLogic

struct ContentView: View {
    // 뷰를 아래에 ObservableObject로 선언된
    // 뷰 모델에 구독시킵니다.
    @ObservedObject private(set) var viewModel: ViewModel

    var body: some View {
        ListView(phrases: viewModel.greetings)
            // 동시성을 지원하기 위해 .task 수정자와 함께
            // startObserving() 함수를 호출합니다.
            .task { await self.viewModel.startObserving() }
    }
}

// ViewModel은 밀접하게 연결되어 있으므로
// ContentView의 익스텐션으로 선언됩니다.
extension ContentView {
    @MainActor
    class ViewModel: ObservableObject {
        // 이 프로퍼티는 ViewModel의 Flow에서 방출된
        // 인사말 문구를 저장하기 위한 것입니다.
        @Published var greetings: [String] = []
        
        func startObserving() {
            // 구현은 선택한 iOS 코루틴 라이브러리에
            // 따라 달라집니다(아래 참조).
        }
    }
}

struct ListView: View {
    let phrases: Array<String>

    var body: some View {
        List(phrases, id: \.self) {
            Text($0)
        }
    }
}
```

SwiftUI는 뷰 모델(`ContentView.ViewModel`)을 뷰(`ContentView`)와 연결합니다.

* `ContentView.ViewModel` 클래스는 변경 사항을 알릴 수 있도록 `ObservableObject`로 선언됩니다.
  `ContentView`에 있는 `viewModel` 프로퍼티의 `@ObservedObject` 래퍼는 뷰가 이러한 변경 사항을 구독하도록 합니다.
* `@Published` 래퍼가 있는 `greetings` 프로퍼티의 변경 사항은 SwiftUI가 `ContentView`를 업데이트하도록 트리거합니다.

이제 Swift에서 Kotlin Flow를 사용할 수 있는 KMP 라이브러리 중 하나를 사용하여 `startObserving()` 함수를 구현해야 합니다.

### Swift에서 Kotlin Flow를 사용하기 위한 라이브러리 선택 {id="choose-a-library-for-consuming-kotlin-flows-in-swift"}

이 튜토리얼에서는 iOS에서 Flow를 사용하는 데 도움을 주는 [SKIE](https://skie.touchlab.co/) 또는 [KMP-NativeCoroutines](https://github.com/rickclephas/KMP-NativeCoroutines) 라이브러리를 사용할 수 있습니다.
둘 다 Kotlin/Native 컴파일러가 아직 기본적으로 제공하지 않는 Flow의 취소 및 제네릭을 지원하는 오픈 소스 솔루션입니다.

* KMP-NativeCoroutines 라이브러리는 필요한 래퍼를 생성하여 iOS에서 중단 함수와 Flow를 사용할 수 있도록 돕습니다.
  KMP-NativeCoroutines는 Swift의 `async`/`await` 기능뿐만 아니라 Combine 및 RxSwift도 지원합니다.
  KMP-NativeCoroutines를 사용하려면 iOS 프로젝트에 SwiftPM 또는 CocoaPod 종속성을 추가해야 합니다.
* SKIE 라이브러리는 Kotlin 컴파일러가 생성한 Objective-C API를 보강합니다. SKIE는 Flow를 Swift의 `AsyncSequence`에 상응하는 것으로 변환합니다. SKIE는 스레드 제한 없이, 자동 양방향 취소 기능과 함께 Swift의 `async`/`await`를 직접 지원합니다(Combine 및 RxSwift에는 어댑터가 필요함). SKIE는 다양한 Kotlin 타입을 Swift에 상응하는 타입으로 브릿징하는 것을 포함하여 Kotlin에서 Swift 친화적인 API를 생성하기 위한 다른 기능도 제공합니다. 또한 iOS 프로젝트에 추가 종속성을 추가할 필요가 없습니다.

  > 최신 SKIE는 최신 안정 버전의 Kotlin을 지원하지 않을 수 있습니다.
  > 어떤 Kotlin 버전으로 다운그레이드해야 하는지 확인하려면 [최신 버전 변경 로그](https://skie.touchlab.co/category/changelog)를 확인하세요.

### 옵션 1. KMP-NativeCoroutines 구성 {initial-collapse-state="collapsed" collapsible="true" id="option-1-configure-kmp-nativecoroutines"}

KMP-NativeCoroutines 종속성을 포함하도록 빌드 스크립트를 업데이트합니다.

1. Gradle [버전 카탈로그](https://docs.gradle.org/current/userguide/version_catalogs.html)에 KMP-NativeCoroutines 버전과 플러그인 참조를 추가합니다.

    ```toml
    [versions]
    kmpNativeCoroutines = "%kmpncVersion%"
    
    [plugins]
    kmpNativeCoroutines = { id = "com.rickclephas.kmp.nativecoroutines", version.ref = "kmpNativeCoroutines" }
    ```

2. 프로젝트의 루트 `build.gradle.kts` 파일(`sharedLogic/build.gradle.kts` 파일이 **아님**)에서 `plugins {}` 블록에 KMP-NativeCoroutines 플러그인을 추가합니다.

    ```kotlin
    plugins {
        // ...
        alias(libs.plugins.kmpNativeCoroutines) apply false
    }
    ```

3. `sharedLogic/build.gradle.kts` 파일의 `plugins {}` 블록에 KMP-NativeCoroutines 플러그인을 추가합니다.

    ```kotlin
    plugins {
        // ...
        alias(libs.plugins.kmpNativeCoroutines)
    }
    ```

4. 동일한 `sharedLogic/build.gradle.kts` 파일에서 실험적 `@ObjCName` 어노테이션을 옵트인(opt-in)합니다.

    ```kotlin
    kotlin {
        // ...
        sourceSets {
            all {
                languageSettings {
                    optIn("kotlin.experimental.ExperimentalObjCName")
                }
            }
            // ...
        }
    }
    ```

5. **Shift** 키를 두 번 누른 후 **Sync Project with Gradle Files** 명령을 찾아 실행합니다.

#### KMP-NativeCoroutines로 Flow 표시 {id="mark-the-flow-with-kmp-nativecoroutines"}

1. `sharedLogic/src/commonMain/kotlin` 디렉터리의 `Greeting.kt` 파일을 엽니다.
2. `greet()` 함수에 `@NativeCoroutines` 어노테이션을 추가합니다.
   이렇게 하면 플러그인이 iOS에서 올바른 Flow 처리를 지원하기 위한 코드를 생성합니다.

   ```kotlin
    import com.rickclephas.kmp.nativecoroutines.NativeCoroutines
    
    class Greeting {
        // ...
       
        @NativeCoroutines
        fun greet(): Flow<String> = flow {
            // ...
        }
    }
    ```

#### Xcode에서 SwiftPM을 사용하여 라이브러리 임포트

`async/await` 메커니즘을 사용하는 데 필요한 KMP-NativeCoroutines Swift 패키지 구성 요소를 설치합니다.

1. **File | Open Project in Xcode**로 이동합니다.
2. Xcode의 왼쪽 메뉴에서 `iosApp` 프로젝트를 마우스 오른쪽 버튼으로 클릭하고 **Add Package Dependencies**를 선택합니다.
3. 검색 창에 패키지 이름을 입력합니다.

     ```none
    https://github.com/rickclephas/KMP-NativeCoroutines.git
    ```

   ![KMP-NativeCoroutines 임포트](multiplatform-import-kmp-nativecoroutines.png){width=700}

4. **Dependency Rule** 드롭다운에서 **Exact Version** 항목을 선택하고 인접한 필드에 `%kmpncVersion%` 버전을 입력합니다.
5. **Add Package** 버튼을 클릭합니다. Xcode가 GitHub에서 패키지를 가져오고 패키지 프로덕트를 선택할 수 있는 다른 창을 엽니다.
6. 그림과 같이 앱에 **KMPNativeCoroutinesAsync** 및 **KMPNativeCoroutinesCore**를 추가한 다음 **Add Package**를 클릭합니다.

   ![KMP-NativeCoroutines 패키지 추가](multiplatform-add-package.png){width=500}
7. IntelliJ IDEA로 돌아가 **Tools | Swift Package Manager | Resolve Dependencies**를 선택합니다.
   이렇게 하면 Kotlin Multiplatform 빌드 태스크에서 사용되며 Swift 패키지의 버전을 일관되게 유지하기 위해 저장소에 커밋할 수 있는 `Package.resolved` 락 파일이 생성됩니다.

#### KMP-NativeCoroutines 라이브러리를 사용하여 Flow 소비

1. `iosApp/ContentView.swift`에서 KMP-NativeCoroutines의 `asyncSequence()` 함수를 사용하여 Flow를 소비하도록 `startObserving()` 함수를 업데이트합니다.

    ```swift
    func startObserving() async {
        do {
            // Kotlin의 Greeting().greet()에서 방출된 Flow를 소비합니다.
            let sequence = asyncSequence(for: Greeting().greet())
            for try await phrase in sequence {
                self.greetings.append(phrase)
            }
        } catch {
            print("Failed with error: \(error)")
        }
    }
    ```

   여기서는 Flow를 순회하고 Flow가 값을 방출할 때마다 `greetings` 프로퍼티를 업데이트하기 위해 루프와 `await` 메커니즘이 사용됩니다.

2. `ViewModel`이 `@MainActor` 어노테이션으로 표시되어 있는지 확인합니다.

    ```Swift
    // ...
    import KMPNativeCoroutinesAsync
    import KMPNativeCoroutinesCore
    
    // ...
    extension ContentView {
        // ViewModel 내의 모든 비동기 작업이 앱의 메인 UI 컨텍스트 내에서
        // 실행되도록 보장합니다.
        // 이를 통해 UI에 반영되지 않는 `@Published` 프로퍼티의 업데이트를 방지합니다.
        @MainActor
        class ViewModel: ObservableObject {
            @Published var greetings: [String] = []
    
            func startObserving() async {
                do {
                    let sequence = asyncSequence(for: Greeting().greet())
                    for try await phrase in sequence {
                        self.greetings.append(phrase)
                    }
                } catch {
                    print("Failed with error: \(error)")
                }
            }
        }
    }
    ```

여기서 `@MainActor`는 프로젝트를 빌드하여 Kotlin 심볼(특히 `greet()`)이 iOS 프로젝트 종속성과 동기화될 때까지 unresolved reference 에러를 발생시킬 수 있습니다.

> 빌드 에러가 발생하는 경우 Kotlin과 KMP-NativeCoroutines의 버전이 호환되는지 확인하세요.
> Gradle 플러그인 버전과 Swift 패키지 버전 모두 [호환성 매트릭스](https://github.com/rickclephas/KMP-NativeCoroutines#compatibility)에 따라 설정되어야 합니다.
>
{style="warning"}

### 옵션 2. SKIE 구성 {initial-collapse-state="collapsed" collapsible="true"}

라이브러리를 설정하려면 Gradle 버전 카탈로그에 SKIE 버전과 플러그인 참조를 추가합니다.

```toml
[versions]
skie = "%skieVersion%"

[plugins]
skie = { id = "co.touchlab.skie", version.ref = "skie" }
```

> SKIE는 최신 안정 버전의 Kotlin을 지원하지 않을 수 있습니다.
> Kotlin 버전이 너무 최신인 경우 Gradle 동기화 중에 안전하게 다운그레이드할 수 있는 버전 목록과 함께 보고됩니다.
> 
{style="note"}

그런 다음 `sharedLogic/build.gradle.kts` 파일의 플러그인 목록에 추가합니다.

```kotlin
plugins {
    //...
    alias(libs.plugins.skie)
}
```

**Shift** 키를 두 번 누른 후 **Sync Project with Gradle Files** 명령을 찾아 실행합니다.

#### SKIE를 사용하여 Flow 소비 {id="consume-the-flow-using-skie"}

루프와 `await` 메커니즘을 사용하여 `Greeting().greet()` Flow를 순회하고 Flow가 값을 방출할 때마다 `greetings` 프로퍼티를 업데이트합니다.

`ViewModel`이 `@MainActor` 어노테이션으로 표시되어 있는지 확인하세요.
이 어노테이션은 Kotlin/Native 요구 사항을 준수하기 위해 `ViewModel` 내의 모든 비동기 작업이 메인 스레드에서 실행되도록 보장합니다.

```Swift
// ...
extension ContentView {
    @MainActor
    class ViewModel: ObservableObject {
        @Published var greetings: [String] = []

        func startObserving() async {
            for await phrase in Greeting().greet() {
                self.greetings.append(phrase)
            }
        }
    }
}
```

### ViewModel 사용 및 iOS 앱 실행 {id="consume-the-viewmodel-and-run-the-ios-app"}

`iosApp/iOSApp.swift`에서 앱의 진입점을 업데이트합니다.

```swift
import SwiftUI

@main
struct iOSApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView(viewModel: ContentView.ViewModel())
        }
    }
}
```

IntelliJ IDEA에서 **iosApp** 구성을 실행하여 앱의 로직이 동기화되었는지 확인합니다.

> 새 에뮬레이터를 생성하거나 실제 기기에서 앱을 실행하는 방법에 대한 자세한 내용은 [Kotlin Multiplatform 애플리케이션 빌드 및 실행](build-and-run-kmp.md)을 참조하세요.
>
{style="note"}

![최종 결과](multiplatform-mobile-upgrade-ios.png){width=350}

## 프로젝트의 최종 상태 {id="final-state-of-the-project"}

코루틴 솔루션에 따라 GitHub 저장소의 두 브랜치에서 프로젝트의 최종 상태를 확인할 수 있습니다.
* [`main`](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main) 브랜치에는 KMP-NativeCoroutines 구현이 포함되어 있습니다.
* [`main-skie`](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main-skie) 브랜치에는 SKIE 구현이 포함되어 있습니다.

## 발생 가능한 문제 및 해결 방법 {id="possible-issues-and-solutions"}

### Xcode에서 공유 프레임워크를 호출하는 코드에 에러가 보고되는 경우 {id="xcode-reports-errors-in-the-code-calling-the-shared-framework"}

Xcode에서 작업하는 경우 Xcode 프로젝트가 이전 버전의 프레임워크를 사용하고 있을 수 있습니다.
이를 해결하려면 IntelliJ IDEA 또는 Android Studio로 돌아가 프로젝트를 다시 빌드하거나 iOS 실행 구성을 시작하세요.

### 공유 프레임워크를 임포트할 때 Xcode에서 에러가 보고되는 경우 {id="xcode-reports-an-error-when-importing-the-shared-framework"}

Xcode를 사용하는 경우 캐시된 바이너리를 지워야 할 수 있습니다. 메인 메뉴에서 **Product | Clean Build Folder**를 선택하여 환경을 초기화해 보세요.

## 다음 단계 {id="what-s-next"}

* UI 코드도 공유되는 [대체 튜토리얼](compose-multiplatform-new-project.md)을 확인해 보세요.
* Kotlin Multiplatform이 지원하는 다양한 코드 공유 접근 방식에 대해 알아보려면 [플랫폼 간 코드 공유](multiplatform-share-on-platforms.md)를 참조하세요.
* [Kotlin Multiplatform 프로젝트 구조의 기본 원리](multiplatform-discover-project.md)에 대해 알아보세요.
* 멀티플랫폼 종속성을 관리하는 방법에 대한 자세한 내용은 [멀티플랫폼 라이브러리 종속성 추가](multiplatform-add-dependencies.md)를 참조하세요.
* Kotlin Multiplatform 프로젝트가 [iOS 앱과 통합되는 방식](multiplatform-ios-integration-overview.md)을 확인해 보세요.
* [네트워킹 및 데이터 저장](multiplatform-ktor-sqldelight.md)에 관한 튜토리얼을 따라 더 복잡한 KMP 앱을 만들어 보세요.
* [엄선된 샘플 멀티플랫폼 프로젝트 목록](multiplatform-samples.md)을 살펴보세요.
* [중단 함수의 조합](https://kotlinlang.org/docs/coroutines-basics.html)에 대한 다양한 접근 방식을 살펴보세요.

## 도움 받기 {id="get-help"}

* ![Slack](slack.svg){width=25}{type="joined"} **Kotlin Slack**: 도움을 받고 KMP 및 Compose Multiplatform에 대한 토론에 참여하세요.
  [초대장](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)을 요청하고
  [#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU) 채널에 참여하세요.
* **Kotlin 이슈 트래커**: [새 이슈 보고하기](https://youtrack.jetbrains.com/newIssue?project=KT).