[//]: # (title: iOS와 Android 간에 더 많은 로직 공유하기)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

<tldr>
    <p>이 튜토리얼은 IntelliJ IDEA를 사용하지만, Android Studio에서도 따라 할 수 있습니다. 두 IDE는 동일한 핵심 기능과 Kotlin Multiplatform 지원을 공유합니다.</p>
    <br/>
    <p>이것은 <strong>공유 로직 및 네이티브 UI를 사용한 Kotlin Multiplatform 앱 만들기</strong> 튜토리얼의 네 번째 부분입니다. 계속하기 전에 이전 단계를 완료했는지 확인하세요.</p>
    <p><img src="icon-1-done.svg" width="20" alt="First step"/> <Links href="/kmp/multiplatform-create-first-app" summary="이 튜토리얼은 IntelliJ IDEA를 사용하지만, Android Studio에서도 따라 할 수 있습니다. 두 IDE는 동일한 핵심 기능과 Kotlin Multiplatform 지원을 공유합니다. 이것은 공유 로직 및 네이티브 UI를 사용한 Kotlin Multiplatform 앱 만들기 튜토리얼의 첫 번째 부분입니다. Kotlin Multiplatform 앱 만들기, 사용자 인터페이스 업데이트, 종속성 추가, 더 많은 로직 공유, 프로젝트 마무리">Kotlin Multiplatform 앱 만들기</Links><br/>
      <img src="icon-2-done.svg" width="20" alt="Second step"/> <Links href="/kmp/multiplatform-update-ui" summary="이 튜토리얼은 IntelliJ IDEA를 사용하지만, Android Studio에서도 따라 할 수 있습니다. 두 IDE는 동일한 핵심 기능과 Kotlin Multiplatform 지원을 공유합니다. 이것은 공유 로직 및 네이티브 UI를 사용한 Kotlin Multiplatform 앱 만들기 튜토리얼의 두 번째 부분입니다. 계속하기 전에 이전 단계를 완료했는지 확인하세요. Kotlin Multiplatform 앱 만들기, 사용자 인터페이스 업데이트, 종속성 추가, 더 많은 로직 공유, 프로젝트 마무리">사용자 인터페이스 업데이트</Links><br/>
      <img src="icon-3-done.svg" width="20" alt="Third step"/> <Links href="/kmp/multiplatform-dependencies" summary="이 튜토리얼은 IntelliJ IDEA를 사용하지만, Android Studio에서도 따라 할 수 있습니다. 두 IDE는 동일한 핵심 기능과 Kotlin Multiplatform 지원을 공유합니다. 이것은 공유 로직 및 네이티브 UI를 사용한 Kotlin Multiplatform 앱 만들기 튜토리얼의 세 번째 부분입니다. 계속하기 전에 이전 단계를 완료했는지 확인하세요. Kotlin Multiplatform 앱 만들기, 사용자 인터페이스 업데이트, 종속성 추가, 더 많은 로직 공유, 프로젝트 마무리">종속성 추가</Links><br/>
      <img src="icon-4.svg" width="20" alt="Fourth step"/> <strong>더 많은 로직 공유</strong><br/>
      <img src="icon-5-todo.svg" width="20" alt="Fifth step"/> 프로젝트 마무리<br/>
    </p>
</tldr>

이제 외부 종속성을 사용하여 공통 로직을 구현했으므로, 더 복잡한 로직을 추가하기 시작할 수 있습니다. 네트워크 요청과 데이터 직렬화(serialization)는 Kotlin Multiplatform을 사용하여 코드를 공유하는 [가장 인기 있는 사례](https://kotlinlang.org/lp/multiplatform/)입니다. 첫 번째 애플리케이션에서 이를 구현하는 방법을 배워, 이 온보딩 과정을 마친 후 미래의 프로젝트에서도 활용할 수 있도록 해보세요.

업데이트된 앱은 인터넷을 통해 [LaunchLibrary 2](https://lldev.thespacedevs.com/docs) API로부터 데이터를 가져와 최신 우주 발사에 대한 설명을 표시합니다.

> 서로 다른 코루틴(coroutine) 솔루션이 적용된 프로젝트의 최종 상태를 GitHub 리포지토리의 두 브랜치에서 확인할 수 있습니다.
> * [`main`](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main) 브랜치는 KMP-NativeCoroutines 구현을 포함합니다.
> * [`main-skie`](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main-skie) 브랜치는 SKIE 구현을 포함합니다.
>
{style="note"}

## 더 많은 종속성 추가

프로젝트에 다음 멀티플랫폼 라이브러리를 추가해야 합니다.

* [`kotlinx.coroutines`](https://github.com/Kotlin/kotlinx.coroutines): 동시 작업을 위해 코루틴을 사용합니다.
* [`kotlinx.serialization`](https://github.com/Kotlin/kotlinx.serialization): 네트워크 작업을 처리하는 데 사용되는 엔티티 클래스 객체로 SpaceX API의 JSON 응답을 역직렬화(deserialize)하기 위해 사용합니다.
* [Ktor](https://ktor.io/): HTTP를 통해 데이터를 전송하고 가져오기 위한 프레임워크입니다.

### Gradle 버전 카탈로그 업데이트

`gradle/libs.versions.toml` 파일에 다음 항목들을 추가한 다음, 빌드 구성 코드에서 참조를 사용할 수 있도록 Gradle 파일을 동기화하세요.

```toml
[versions]
coroutinesVersion = "%coroutinesVersion%"
ktorVersion = "%ktorVersion%"
# 카탈로그에 Kotlin 버전이 이미 설정되어 있어야 합니다.
kotlin = "%kotlinVersion%"

[libraries]
kotlinx-coroutines = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-core", version.ref = "coroutinesVersion" }
ktor-client-core = { module = "io.ktor:ktor-client-core", version.ref = "ktorVersion" }
ktor-client-content-negotiation = { module = "io.ktor:ktor-client-content-negotiation", version.ref = "ktorVersion" }
ktor-serialization-kotlinx-json = { module = "io.ktor:ktor-serialization-kotlinx-json", version.ref = "ktorVersion" }
ktor-client-darwin = { module = "io.ktor:ktor-client-darwin", version.ref = "ktorVersion" }
ktor-client-android = { module = "io.ktor:ktor-client-android", version.ref = "ktorVersion" }

[plugins]
kotlinSerialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
```

### 해당 소스 세트에 종속성 추가

`sharedLogic/build.gradle.kts` 파일의 해당 소스 세트에 라이브러리 참조를 추가합니다.

```kotlin
plugins {
    // ...
    alias(libs.plugins.kotlinSerialization)
}

kotlin {
    sourceSets {
        commonMain.dependencies {
            // ...
            // Kotlin Multiplatform Gradle 플러그인이
            // 플랫폼별 코루틴 아티팩트를 자동으로 추가합니다.
            implementation(libs.kotlinx.coroutines)
            // 메인 Ktor 종속성
            implementation(libs.ktor.client.core)
            // Ktor가 특정 형식의 직렬화를
            // 사용할 수 있도록 하는 종속성
            implementation(libs.ktor.client.content.negotiation)
            implementation(libs.ktor.serialization.kotlinx.json)
        }
        androidMain.dependencies {
            // Ktor를 위한 Android 엔진 제공
            implementation(libs.ktor.client.android)
        }
        iosMain.dependencies {
            // Ktor를 위한 Darwin 엔진 제공
            implementation(libs.ktor.client.darwin)
        }
    }
}
```

**Sync Gradle Changes** 버튼을 클릭하여 Gradle 파일을 동기화합니다.

## API 요청 설정

데이터를 가져오기 위해 [Launch Library API](https://github.com/r-spacex/SpaceX-API/tree/master/docs#rspacex-api-docs)를 사용하며, 특히 **/2.3.0/launches** 엔드포인트에서 모든 발사 목록을 가져옵니다.

### 데이터 모델 생성

`sharedLogic/src/commonMain/.../greetingkmp` 디렉터리에 새로운 `RocketLaunch.kt` 파일을 생성하고 SpaceX API의 데이터를 저장하는 데이터 클래스를 추가합니다.

```kotlin
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class RocketLaunch(
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

* `RocketLaunch` 클래스는 `@Serializable` 어노테이션이 지정되어 있어, `kotlinx.serialization` 플러그인이 자동으로 기본 직렬화 도구(serializer)를 생성할 수 있습니다.
* `@SerialName` 어노테이션을 사용하면 필드 이름을 재정의할 수 있어, 데이터 클래스에서 프로퍼티를 더 읽기 쉬운 이름으로 선언할 수 있습니다.

### HTTP 클라이언트 연결

1. `sharedLogic/src/commonMain/.../greetingkmp` 디렉터리에 새로운 `RocketComponent` 클래스를 생성합니다.
2. HTTP GET 요청을 통해 로켓 발사 정보를 가져오도록 `httpClient` 프로퍼티를 추가합니다.

    ```kotlin
    import io.ktor.client.HttpClient
    import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
    import io.ktor.serialization.kotlinx.json.json
    import kotlinx.serialization.json.Json
    
    class RocketComponent {
        private val httpClient = HttpClient {
            install(ContentNegotiation) {
                json(Json {
                    prettyPrint = true
                    isLenient = true
                    ignoreUnknownKeys = true
                })
            }
        }
    }
    ```

   * Ktor의 [`ContentNegotiation`](https://ktor.io/docs/serialization-client.html#register_json) 플러그인과 JSON 직렬화 도구는 GET 요청의 결과를 역직렬화합니다.
   * 여기서 JSON 직렬화 도구는 `prettyPrint` 프로퍼티를 통해 JSON을 더 읽기 쉬운 방식으로 출력하도록 구성되었습니다. `isLenient`를 사용하여 형식이 잘못된 JSON을 읽을 때 더 유연하게 대처하며, `ignoreUnknownKeys`를 사용하여 로켓 발사 모델에 선언되지 않은 키를 무시합니다.

3. 로켓 발사 정보를 비동기적으로 가져오는 `getDateOfLastSuccessfulLaunch()` [일시 중단 함수(suspending function)](https://kotlinlang.org/docs/coroutines-basics.html)를 `RocketComponent`에 추가합니다.

   ```kotlin
   import io.ktor.client.request.get
   import io.ktor.client.call.body
   
   class RocketComponent {
       // ...
       
       private suspend fun getDateOfLastSuccessfulLaunch(): String {
           val rockets: List<RocketLaunch> = httpClient.get("https://api.spacexdata.com/v4/launches").body()
   
           // 현재는 스텁(stub) 날짜로 초기화합니다.
           val date: String = "October 5, 2026"
        
           return "$date"
       }
   }
   ```

   * `httpClient.get()` 또한 스레드를 차단하지 않고 비동기적으로 네트워크를 통해 데이터를 가져와야 하므로 일시 중단 함수입니다.
   * 일시 중단 함수는 코루틴이나 다른 일시 중단 함수 내에서만 호출할 수 있습니다. 이것이 `getDateOfLastSuccessfulLaunch()`에 `suspend` 키워드가 붙은 이유입니다. 네트워크 요청은 HTTP 클라이언트의 스레드 풀에서 실행됩니다.

4. HTTP 요청 호출 후, 목록에서 마지막으로 성공한 발사를 가져오도록 호출을 추가합니다 (발사 목록은 날짜순으로 과거부터 최신순으로 정렬되어 있습니다).

   ```kotlin
   class RocketComponent {
       // ...
       
       private suspend fun getDateOfLastSuccessfulLaunch(): String {
           val response: LaunchListResponse =
               httpClient.get("https://lldev.thespacedevs.com/2.3.0/launches/previous/?mode=list&limit=10&format=json").body()
           val lastSuccessLaunch = response.results.first { it.status.id == 3 }
           val date: String = "October 5, 2026"
           
           return "$date"
       }
   }
   ```

5. 발사의 UTC 날짜와 시간을 현지 날짜로 변환하고 그 결과를 `date`에 할당합니다. 그런 다음 형식이 지정된 출력을 반환합니다.

   ```kotlin
   import kotlinx.datetime.TimeZone
   import kotlinx.datetime.toLocalDateTime
   import kotlin.time.ExperimentalTime
   import kotlin.time.Instant

   class RocketComponent {
       // ...
       
       private suspend fun getDateOfLastSuccessfulLaunch(): String {
           val response: LaunchListResponse =
               httpClient.get("https://lldev.thespacedevs.com/2.3.0/launches/previous/?mode=list&limit=10&format=json").body()
           val lastSuccessLaunch = response.results.first { it.status.id == 3 }
           val date = Instant.parse(lastSuccessLaunch.launchDateUTC)
               .toLocalDateTime(TimeZone.currentSystemDefault())
       
           return "${date.month} ${date.day}, ${date.year}"
       }
   }
   ```

   날짜는 "MMMM DD, YYYY" 형식(예: "OCTOBER 5, 2022")으로 표시됩니다.

6. 동일한 클래스에 `getDateOfLastSuccessfulLaunch()` 함수를 사용하여 메시지를 생성하는 또 다른 일시 중단 함수 `launchPhrase()`를 추가합니다.

    ```kotlin
    class RocketComponent {
        // ...
    
        suspend fun launchPhrase(): String =
            try {
                "The last successful launch was on ${getDateOfLastSuccessfulLaunch()} 🚀"
            } catch (e: Exception) {
                println("Exception during getting the date of the last successful launch $e")
                "Error occurred"
            }
    }
    ```

### 코루틴 플로우 생성

단순히 일시 중단 함수를 호출하는 대신, 일련의 값들을 생성해야 할 때는 [플로우(Flow)](https://kotlinlang.org/docs/flow.html)를 사용할 수 있습니다. 플로우는 일시 중단 함수가 단일 값을 반환하는 것과 달리, 값이 생성될 때마다 일련의 값들을 방출(emit)할 수 있습니다.

1. `shared/src/commonMain/kotlin` 디렉터리에 있는 `Greeting.kt` 파일을 엽니다.
2. `Greeting` 클래스에 `rocketComponent` 프로퍼티를 추가합니다. 이 프로퍼티는 마지막 성공 발사 날짜가 포함된 메시지를 저장합니다.

   ```kotlin
   class Greeting {
       private val rocketComponent = RocketComponent()
       //...
   }
   ```

3. `greet()` 함수가 `Flow`를 반환하도록 변경합니다.

    ```kotlin
    import kotlinx.coroutines.delay
    import kotlinx.coroutines.flow.Flow
    import kotlinx.coroutines.flow.flow
    import kotlin.time.Duration.Companion.seconds
    
    class Greeting {
        // ...
        fun greet(): Flow<String> = flow {
            emit(if (Random.nextBoolean()) "Hi!" else "Hello!")
            delay(1.seconds)
            emit("Guess what this is! > ${platform.name.reversed()}")
            delay(1.seconds)
            emit(daysPhrase())
            emit(rocketComponent.launchPhrase())
        }
    }
    ```

   * 여기서 `Flow`는 모든 구문을 감싸는 `flow()` 빌더 함수로 생성됩니다.
   * `Flow`는 각 방출 사이에 1초의 지연을 두고 문자열을 방출합니다. 마지막 요소는 네트워크 응답이 반환된 후에만 방출되므로, 정확한 지연 시간은 네트워크 상태에 따라 달라집니다.

`greet()` 함수의 반환 타입을 `Flow`로 변경하여 공유 모듈의 API를 업데이트했습니다. 이제 네이티브 프로젝트 부분이 `greet()` 함수 호출 결과를 적절히 처리할 수 있도록 업데이트해야 합니다.

## 네이티브 Android UI 업데이트

공유 모듈과 Android 애플리케이션 모두 Kotlin으로 작성되었으므로, Android에서 공유 코드를 사용하는 것은 매우 간단합니다.

### 뷰 모델 도입

뷰 모델(View model)은 Android 개발에서 널리 사용되는 패턴으로, [Android 액티비티](https://developer.android.com/guide/components/activities/intro-activities) 수명 주기 동안 유지되어야 하는 데이터 및 기타 앱 구성 요소를 관리하는 데 도움이 됩니다. 애플리케이션이 더 복잡해지고 있으므로, 이제 우리 앱에도 뷰 모델을 도입할 때입니다. 뷰 모델은 SpaceX API로부터 받은 데이터를 저장하고 이를 UI에서 사용할 수 있게 합니다.

Android 플랫폼 코드에 뷰 모델 클래스를 생성합니다.

1. `sharedUI/src/commonMain/.../greetingkmp` 디렉터리에 새로운 `MainViewModel` Kotlin 클래스를 생성합니다.

    ```kotlin
    import androidx.lifecycle.ViewModel
    
    class MainViewModel : ViewModel() {
        // ...
    }
    ```

   이 클래스는 수명 주기 및 구성 변경(configuration changes)에 대한 플랫폼의 기대에 맞추기 위해 Android의 `ViewModel` 클래스를 상속합니다.

2. [StateFlow](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-state-flow/) 타입의 `greetingList` 값과 그에 대한 백킹 프로퍼티(backing property)를 생성합니다.

    ```kotlin
    import kotlinx.coroutines.flow.MutableStateFlow
    import kotlinx.coroutines.flow.StateFlow
    
    class MainViewModel : ViewModel() {
        private val _greetingList = MutableStateFlow<List<String>>(listOf())
        val greetingList: StateFlow<List<String>> get() = _greetingList
    }
    ```

   * 여기서 `StateFlow`는 `Flow` 인터페이스를 확장하지만 단일 값이나 상태를 가집니다.
   * private 백킹 프로퍼티인 `_greetingList`는 이 클래스의 클라이언트가 읽기 전용 `greetingList` 프로퍼티에만 접근할 수 있도록 보장합니다.

3. 뷰 모델의 `init` 함수에서 `Greeting().greet()` 플로우의 모든 문자열을 수집(collect)합니다.

    ```kotlin
   import androidx.lifecycle.viewModelScope
   import kotlinx.coroutines.launch
   
   class MainViewModel : ViewModel() {
       private val _greetingList = MutableStateFlow<List<String>>(listOf())
       val greetingList: StateFlow<List<String>> get() = _greetingList
       
       init {
           viewModelScope.launch {
               Greeting().greet().collect { phrase ->
                    //...
               }
           }
       }
    }
    ```

   `Flow.collect()` 함수는 일시 중단 함수이므로 뷰 모델의 스코프 내에서 `launch` 코루틴이 사용됩니다. 이는 launch 코루틴이 뷰 모델 수명 주기의 올바른 단계에서만 실행됨을 의미합니다.

4. `collect` 트레일링 람다(trailing lambda) 내부에서, `update()` 함수를 사용하여 수집된 `phrase`를 `_greetingList`의 문구 목록에 추가합니다.

    ```kotlin
    import kotlinx.coroutines.flow.update
   
    class MainViewModel : ViewModel() {
        //...
   
        init {
            viewModelScope.launch {
                Greeting().greet().collect { phrase ->
                    _greetingList.update { list -> list + phrase }
                }
            }
        }
    }
    ```

### 뷰 모델의 플로우 사용

1. `sharedUI/src/commonMain/.../greetingkmp`에서 `App.kt` 파일을 열고, 새로 구현된 뷰 모델을 사용하도록 이전 구현을 대체하여 업데이트합니다.

    ```kotlin
    import androidx.lifecycle.compose.collectAsStateWithLifecycle
    import androidx.compose.runtime.getValue
    import androidx.lifecycle.viewmodel.compose.viewModel
    
    @Composable
    @Preview
    fun App(mainViewModel: MainViewModel = viewModel()) {
        MaterialTheme {
            val greetings by mainViewModel.greetingList.collectAsStateWithLifecycle()
    
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

   * `collectAsStateWithLifecycle()` 함수는 `greetingList`를 호출하여 뷰 모델의 플로우에서 값을 수집하고, 이를 수명 주기를 인식하는 방식으로 컴포저블 상태(composable state)로 나타냅니다.
   * 새로운 플로우가 생성되면 컴포지션 상태가 변경되어 인사말 문구가 수직으로 배열되고 구분선으로 분리된 스크롤 가능한 `Column`을 표시합니다.

### 인터넷 액세스 권한 추가

인터넷에 접속하려면 Android 애플리케이션에 적절한 권한이 필요합니다. 모든 네트워크 요청은 공유 모듈에서 이루어지므로, 공유 모듈의 매니페스트에 인터넷 액세스 권한을 추가하는 것이 합리적입니다.

`androidApp/src/main/AndroidManifest.xml` 파일을 다음 액세스 권한으로 업데이트하세요.

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET"/>
    ...
</manifest>
```

### 앱 실행

최종 결과를 확인하려면 **androidApp** 실행 구성을 다시 실행하세요.

![Android용 최종 결과](multiplatform-mobile-upgrade-android.png){width=350}

## 네이티브 iOS UI 업데이트

프로젝트의 iOS 부분에서도 Android 앱과 마찬가지로 [Model–view–viewmodel (MVVM)](https://en.wikipedia.org/wiki/Model–view–viewmodel) 패턴을 사용하여 UI를 `sharedLogic` 모듈에 연결합니다.

모듈은 이미 `ContentView.swift` 파일의 `import SharedLogic` 선언을 통해 임포트되어 있습니다.

### ViewModel 도입

`iosApp/ContentView.swift`에서 `ContentView`를 위한 `ViewModel` 클래스를 생성하여 데이터를 준비하고 관리하도록 합니다. 동시성을 지원하기 위해 `task()` 호출 내에서 `startObserving()` 함수를 호출합니다.

```swift
import SwiftUI
import SharedLogic

struct ContentView: View {
    @ObservedObject private(set) var viewModel: ViewModel

    var body: some View {
        ListView(phrases: viewModel.greetings)
            .task { await self.viewModel.startObserving() }
    }
}

extension ContentView {
    @MainActor
    class ViewModel: ObservableObject {
        @Published var greetings: Array<String> = []
        
        func startObserving() {
            // ...
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

* `ViewModel`은 `ContentView`와 밀접하게 연결되어 있으므로 `ContentView`의 extension으로 선언되었습니다.
* `ViewModel`은 `String` 문구 배열인 `greetings` 프로퍼티를 가집니다.

SwiftUI는 뷰 모델(`ContentView.ViewModel`)과 뷰(`ContentView`)를 연결합니다.

* `ContentView.ViewModel`은 `ObservableObject`로 선언됩니다. `ContentView`에 있는 `viewModel` 프로퍼티의 `@ObservedObject` 래퍼는 뷰가 뷰 모델을 구독하게 합니다.
* 뷰 모델의 `greetings` 프로퍼티에는 `@Published` 래퍼가 사용됩니다. 이는 해당 프로퍼티가 변경될 때 SwiftUI가 자동으로 뷰를 업데이트할 수 있게 해줍니다.

이제 플로우를 소비(consume)하기 위해 `startObserving()` 함수를 구현해야 합니다.

### iOS에서 플로우를 소비하기 위한 라이브러리 선택

이 튜토리얼에서는 iOS에서 플로우 작업을 돕는 [SKIE](https://skie.touchlab.co/) 또는 [KMP-NativeCoroutines](https://github.com/rickclephas/KMP-NativeCoroutines) 라이브러리를 사용할 수 있습니다. 두 솔루션 모두 오픈 소스이며, Kotlin/Native 컴파일러가 아직 기본적으로 제공하지 않는 플로우의 취소 및 제네릭 지원 기능을 제공합니다.

* KMP-NativeCoroutines 라이브러리는 필요한 래퍼를 생성하여 iOS에서 일시 중단 함수와 플로우를 소비할 수 있도록 도와줍니다. KMP-NativeCoroutines는 Swift의 `async`/`await` 기능뿐만 아니라 Combine 및 RxSwift도 지원합니다. KMP-NativeCoroutines를 사용하려면 iOS 프로젝트에 SwiftPM 또는 CocoaPod 종속성을 추가해야 합니다.
* SKIE 라이브러리는 Kotlin 컴파일러가 생성한 Objective-C API를 강화합니다. SKIE는 플로우를 Swift의 `AsyncSequence`와 동등한 것으로 변환합니다. SKIE는 스레드 제한 없이 Swift의 `async`/`await`를 직접 지원하며, 자동 양방향 취소 기능을 제공합니다 (Combine 및 RxSwift에는 어댑터가 필요함). SKIE는 다양한 Kotlin 타입을 Swift에 상응하는 타입으로 브릿징하는 등 Kotlin에서 Swift 친화적인 API를 생성하기 위한 다른 기능들도 제공합니다. 또한 iOS 프로젝트에 추가 종속성을 더할 필요가 없습니다.

### 옵션 1. KMP-NativeCoroutines 설정 {initial-collapse-state="collapsed" collapsible="true"}

> 라이브러리의 최신 버전을 사용하는 것을 권장합니다. [KMP-NativeCoroutines 리포지토리](https://github.com/rickclephas/KMP-NativeCoroutines/releases)를 확인하여 플러그인의 더 최신 버전이 있는지, 그리고 사용 중인 Kotlin 버전과 호환되는지 확인하세요.
>
{style="note"}

1. Gradle 버전 카탈로그에 KMP-NativeCoroutines 버전과 플러그인 참조를 추가합니다.

    ```toml
    [versions]
    kmpNativeCoroutines = "%kmpncVersion%"
    
    [plugins]
    kmpNativeCoroutines = { id = "com.rickclephas.kmp.nativecoroutines", version.ref = "kmpNativeCoroutines" }
    ```

2. 프로젝트의 루트 `build.gradle.kts` 파일(`shared/build.gradle.kts` 파일이 **아님**)에서 `plugins {}` 블록에 KMP-NativeCoroutines 플러그인을 추가합니다.

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

4. 동일한 `sharedLogic/build.gradle.kts` 파일에서 실험적인 `@ObjCName` 어노테이션 사용을 허용(opt-in)합니다.

    ```kotlin
    kotlin {
        // ...
        sourceSets{
            all {
                languageSettings {
                    optIn("kotlin.experimental.ExperimentalObjCName")
                }
            }
            // ...
        }
    }
    ```

5. **Sync Gradle Changes** 버튼을 클릭하여 Gradle 파일을 동기화합니다.

#### KMP-NativeCoroutines로 플로우 표시

1. `sharedLogic/src/commonMain/kotlin` 디렉터리에 있는 `Greeting.kt` 파일을 엽니다.
2. `greet()` 함수에 `@NativeCoroutines` 어노테이션을 추가합니다. 이는 플러그인이 iOS에서 올바른 플로우 처리를 지원하기 위해 적절한 코드를 생성하도록 보장합니다.

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

#### XCode에서 SwiftPM을 사용하여 라이브러리 임포트

`async/await` 메커니즘과 함께 작동하는 데 필요한 KMP-NativeCoroutines Swift 패키지의 일부를 설치합니다.

1. **File | Open Project in Xcode**로 이동합니다.
2. Xcode의 왼쪽 메뉴에서 `iosApp` 프로젝트를 우클릭하고 **Add Package Dependencies**를 선택합니다.
3. 검색창에 패키지 이름을 입력합니다.

     ```none
    https://github.com/rickclephas/KMP-NativeCoroutines.git
    ```

   ![KMP-NativeCoroutines 임포트](multiplatform-import-kmp-nativecoroutines.png){width=700}

4. **Dependency Rule** 드롭다운에서 **Exact Version** 항목을 선택하고 인접한 필드에 `%kmpncVersion%` 버전을 입력합니다.
5. **Add Package** 버튼을 클릭합니다. Xcode가 GitHub에서 패키지를 가져오고 패키지 제품을 선택할 수 있는 다른 창을 엽니다.
6. 그림과 같이 "KMPNativeCoroutinesAsync" 및 "KMPNativeCoroutinesCore"를 앱에 추가한 다음 **Add Package**를 클릭합니다.

   ![KMP-NativeCoroutines 패키지 추가](multiplatform-add-package.png){width=500}
7. IntelliJ IDEA로 돌아가 **Tools | Swift Package Manager | Resolve Dependencies** 메뉴 항목을 선택합니다. 이는 Kotlin 빌드에서 사용되는 `Package.resolved` 잠금 파일을 생성하며, Swift 패키지의 버전을 일관되게 유지하기 위해 리포지토리에 커밋할 수 있습니다.

#### KMP-NativeCoroutines 라이브러리를 사용하여 플로우 소비

1. `iosApp/ContentView.swift`에서 `Greeting().greet()` 함수에 대해 KMP-NativeCoroutine's `asyncSequence()` 함수를 사용하여 플로우를 소비하도록 `startObserving()` 함수를 업데이트합니다.

    ```Swift
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
    ```

   여기서 루프와 `await` 메커니즘은 플로우를 반복하며 플로우가 값을 방출할 때마다 `greetings` 프로퍼티를 업데이트하는 데 사용됩니다.

2. `ViewModel`이 `@MainActor` 어노테이션으로 표시되어 있는지 확인하세요. 이 어노테이션은 `ViewModel` 내의 모든 비동기 작업이 메인 스레드에서 실행되도록 보장하여 Kotlin/Native 요구 사항을 준수합니다.

    ```Swift
    // ...
    import KMPNativeCoroutinesAsync
    import KMPNativeCoroutinesCore
    
    // ...
    extension ContentView {
        @MainActor
        class ViewModel: ObservableObject {
            @Published var greetings: Array<String> = []
    
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

### 옵션 2. SKIE 설정 {initial-collapse-state="collapsed" collapsible="true"}

라이브러리를 설정하려면 Gradle 버전 카탈로그에 SKIE 버전과 플러그인 참조를 추가하세요.

```toml
[versions]
skie = "%skieVersion%"

[plugins]
skie = { id = "co.touchlab.skie", version.ref = "skie" }
```

> SKIE는 최신 Kotlin 버전을 지원하지 않을 수 있습니다. 만약 Kotlin 버전이 너무 최신인 경우, Gradle 동기화 중에 안전하게 다운그레이드할 수 있는 버전 목록과 함께 보고됩니다.
> 
{style="note"}

그런 다음 `sharedLogic/build.gradle.kts` 파일의 플러그인 목록에 추가하고 **Sync Gradle Changes** 버튼을 클릭합니다.

```kotlin
plugins {
    //...
    alias(libs.plugins.skie)
}
```

#### SKIE를 사용하여 플로우 소비

루프와 `await` 메커니즘을 사용하여 `Greeting().greet()` 플로우를 반복하고 플로우가 값을 방출할 때마다 `greetings` 프로퍼티를 업데이트합니다.

> IntelliJ IDEA와 Android Studio는 SKIE를 사용하는 동안 Kotlin 코드를 호출할 때 Swift 오류를 잘못 보고할 수 있습니다. 이는 라이브러리의 알려진 이슈이며, 앱의 빌드 및 실행에는 영향을 미치지 않습니다.
>
{style="warning"}

`ViewModel`이 `@MainActor` 어노테이션으로 표시되어 있는지 확인하세요. 이 어노테이션은 `ViewModel` 내의 모든 비동기 작업이 메인 스레드에서 실행되도록 보장하여 Kotlin/Native 요구 사항을 준수합니다.

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

### ViewModel 소비 및 iOS 앱 실행

`iosApp/iOSApp.swift`에서 앱의 진입점을 업데이트합니다.

```swift
@main
struct iOSApp: App {
   var body: some Scene {
       WindowGroup {
           ContentView(viewModel: ContentView.ViewModel())
       }
   }
}
```

IntelliJ IDEA에서 **iosApp** 구성을 실행하여 앱의 로직이 동기화되었는지 확인하세요.

![최종 결과](multiplatform-mobile-upgrade-ios.png){width=350}

> 서로 다른 코루틴 솔루션이 적용된 프로젝트의 최종 상태를 GitHub 리포지토리의 두 브랜치에서 확인할 수 있습니다.
> * [`main`](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main) 브랜치는 KMP-NativeCoroutines 구현을 포함합니다.
> * [`main-skie`](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main-skie) 브랜치는 SKIE 구현을 포함합니다.
>
{style="note"}

## 다음 단계

튜토리얼의 마지막 부분에서는 프로젝트를 마무리하고 다음에 어떤 단계를 밟아야 할지 알아봅니다.

**[다음 부분으로 진행하기](multiplatform-wrap-up.md)**

### 참고 항목

* 다양한 [일시 중단 함수 구성(composition)](https://kotlinlang.org/docs/composing-suspending-functions.html) 방식을 살펴보세요.
* [Objective-C 프레임워크 및 라이브러리와의 상호 운용성](https://kotlinlang.org/docs/native-objc-interop.html)에 대해 자세히 알아보세요.
* [네트워킹 및 데이터 저장](multiplatform-ktor-sqldelight.md)에 대한 이 튜토리얼을 완료하세요.

## 도움받기

* **Kotlin Slack**: [초대](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)를 받고 [#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU) 채널에 참여하세요.
* **Kotlin issue tracker**: [새로운 이슈를 보고](https://youtrack.jetbrains.com/newIssue?project=KT)하세요.