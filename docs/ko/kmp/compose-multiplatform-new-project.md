[//]: # (title: 완전한 코드 공유: 시간대 선택기 앱)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

이 튜토리얼은 플랫폼 간에 가능한 한 많은 코드를 공유하는 데 중점을 둡니다.
UI는 Compose Multiplatform을 사용하여 공통 코드에서 구현하고, 기능은 멀티플랫폼 라이브러리를 기반으로 합니다.
로직만 공유하고 UI는 네이티브로 유지하는 예제는 [네이티브 UI: REST API 요청을 위한 로직 공유](multiplatform-upgrade-app.md)를 참고하세요.

여기서는 사용자가 국가를 선택하여 해당 국가 수도의 현재 시각을 확인할 수 있는 애플리케이션을 만듭니다.
이 앱은 드롭다운 메뉴에서 이미지를 불러와 표시하며, 이벤트, 스타일, 테마, Modifier를 사용하는 전형적인 Compose 레이아웃을 사용합니다.

마법사로 생성된 프로젝트에서 최종 결과물까지 완성하기 위해 다음 단계를 진행합니다.

1. [기본 Compose UI 레이아웃 구현](#기본-레이아웃-구현)
2. [Compose Hot Reload 체험](#compose-hot-reload를-사용하여-빠르게-ui-반복-작업하기)
3. [시간 계산을 위한 멀티플랫폼 라이브러리 의존성 추가](#kotlinx-datetime-의존성-추가)
4. 앱 완성하기:
   * [사용자 입력 지원](#사용자-입력-지원)
   * [이미지 리소스 추가 및 임포트](#이미지-도입하기)

거의 모든 코드가 공유되므로, 이 튜토리얼을 통해 지원되는 모든 플랫폼용 데모 애플리케이션을 동시에 만들 수 있습니다.
동일한 이유로 관심 있는 특정 플랫폼만 자유롭게 선택하여 작업할 수도 있습니다.

> 완성된 최종 프로젝트 코드는 [GitHub 저장소](https://github.com/kotlin-hands-on/get-started-with-cm/)에서 확인할 수 있습니다.
>
{style="tip"}
<!-- TODO the project will be a bit different, but can be synced later -->

## 프로젝트 생성 {id="create-a-project"}

IDE와 Kotlin Multiplatform IDE 플러그인이 설치된 상태에서 새 Compose Multiplatform 프로젝트를 생성합니다.

1. IntelliJ IDEA에서 **File | New | Project**를 선택합니다.
2. 왼쪽 패널에서 **Kotlin Multiplatform**을 선택합니다.
3. **New Project** 창에서 다음 필드를 지정합니다.

    * **Name**: ComposeDemo
    * **Project ID** (패키지 이름으로 사용됨): compose.project.demo

4. **Android**, **iOS**, **Desktop**, **Web** 타깃을 선택합니다.
   iOS와 Web에서 **Share UI** 옵션이 선택되어 있는지 확인하세요.
5. 모든 필드와 타깃을 지정했으면 **Create**를 클릭합니다.

   ![Compose Multiplatform 프로젝트 생성](create-compose-multiplatform-project.png){width=800}

첫 번째 프로젝트 임포트에는 몇 분 정도 걸립니다.
임포트가 완료되면 모든 사전 검사(preflight check)가 성공적으로 완료되었는지 확인합니다(**View | Tool Windows | Project Environment Preflight Checks**).

## 기본 레이아웃 구현 {id="implement-the-basic-layout"}

생성된 Compose Multiplatform 프로젝트는 플랫폼별 앱 모듈과 공통 UI 모듈로 구성됩니다.
각 애플리케이션 모듈은 공통 `App()` 컴포저블을 호출하는 진입점(entry point)을 정의합니다.

> 공유 UI 코드가 다양한 플랫폼의 시스템 진입점에 어떻게 연결되는지 알아보려면 [네이티브 애플리케이션 진입점](compose-multiplatform-entry-points.md)을 참고하세요.
>
{style="tip"}

이 튜토리얼에서는 공통 UI 코드의 모든 기능적 변경 사항이 각 앱에 매끄럽게 반영되지만, 각 플랫폼 설정을 정상적으로 작동시키기 위해 몇 가지 변경이 필요한 부분도 확인하게 됩니다.

시작하려면 공통 `App()` 컴포저블에 기본 레이아웃을 구현합니다.

1. `shared/src/commonMain/kotlin` 디렉터리에서 `compose.project.demo/App.kt` 파일을 열고 `App()` 컴포저블을 새 구현으로 대체합니다.

    ```kotlin
    // @Composable은 컴포저블 함수를 나타냅니다:
    // Compose에서 UI 요소를 방출(emit)하는 함수입니다
    @Composable
    @Preview
    fun App() {
        MaterialTheme {
            var timeAtLocation by remember { mutableStateOf("No location selected") }
   
            // 버튼 위에 텍스트 레이블을 배치하는
            // Column으로 UI를 선언합니다
            Column(
                // Column()이 시스템 바와 겹치지 않고
                // 사용 가능한 모든 공간을 채우도록 하는 기본 레이아웃 개선 사항
                modifier = Modifier
                    .safeContentPadding()
                    .fillMaxSize(),
            ) {
                // timeAtLocation 상태를 관찰하는 Text()를 선언합니다
                Text(timeAtLocation)
                // timeAtLocation 상태도 관찰하지만
                // 지금은 하드코딩된 시간을 표시하는 Button()을 선언합니다
                Button(onClick = { timeAtLocation = "13:30" }) {
                    Text("Show Time At Location")
                }
            }
        }
    }
    ```
   
    > `remember` API는 Compose 전용 상태 관리를 구현합니다.
    > 상태 객체는 상태를 한 번 생성한 다음 recomposition 전반에 걸쳐 유지하기 위해 `remember()` 호출로 감쌉니다.
    > 상태 값이 변경되면 이를 관찰하는 모든 컴포저블이 다시 호출되고 다시 그려집니다.
    > 이를 _리컴포지션(recomposition)_이라고 합니다.
    >
    > 자세한 소개는 Jetpack Compose 문서의 [상태 관리](https://developer.android.com/develop/ui/compose/state)를 참고하세요.
   
2. Android 및 iOS에서 애플리케이션을 실행합니다.

   ![Android 및 iOS에서의 새 Compose Multiplatform 앱](first-compose-project-on-android-ios-3.png){width=500}

   애플리케이션을 실행하고 버튼을 클릭하면 앱에 하드코딩된 시간인 13:30이 표시됩니다.

3. **desktopApp [hot] 🔥** 실행 구성을 시작하여 [Compose Hot Reload](compose-hot-reload.md)를 사용해 데스크톱에서 애플리케이션을 실행합니다.
   앱은 작동하지만, 창 크기가 UI와 잘 맞지 않아 보입니다.

   ![데스크톱에서의 새 Compose Multiplatform 앱](first-compose-project-on-desktop-3.png){width=400}

   다행히 Compose Hot Reload 덕분에 전체 앱을 다시 시작하지 않고도 이를 수정할 수 있습니다.

### Compose Hot Reload를 사용하여 빠르게 UI 반복 작업하기 {id="use-compose-hot-reload-to-quickly-iterate-on-the-ui"}

앱을 다시 시작하지 않고도 데스크톱 UI를 수정하고 수정 사항을 확인할 수 있습니다.

1. `desktopApp/src/` 디렉터리 아래의 `main.kt` 파일을 다음과 같이 업데이트합니다.

    ```kotlin
    fun main() = application {
        // 화면에서 창의 초기 크기와
        // 위치를 설정합니다
        val state = rememberWindowState(
            size = DpSize(400.dp, 350.dp),
            position = WindowPosition(300.dp, 300.dp)
        )
        // 애플리케이션 창의 제목을 설정하고
        // 위에서 초기화한 윈도우 상태를 사용합니다
        Window(
            title = "Local Time App", 
            onCloseRequest = ::exitApplication, 
            state = state,
            // 디버깅과 UI 반복 작업을 쉽게 만들기 위해
            // 창이 항상 위에 표시되도록 설정합니다
            alwaysOnTop = true
        ) {
            App()
        }
    }
    ```

2. IDE의 제안에 따라 누락된 심볼을 임포트합니다.
   `rememberWindowState()` 함수의 경우 `androidx.compose.ui.window` 버전을 선택합니다.

3. 앱이 자동으로 업데이트되는 것을 확인하려면 수정한 파일을 저장합니다(<shortcut>⌘ S</shortcut> / <shortcut>Ctrl+S</shortcut>).
   창 크기가 알맞게 조정됩니다.

   ![Compose Hot Reload](compose-hot-reload-resize.gif)

## `kotlinx-datetime` 의존성 추가 {id="add-the-kotlinx-datetime-dependency"}

시간대(time zone) 처리 및 시간 계산 작업을 위해 멀티플랫폼 [`kotlinx-datetime`](https://github.com/Kotlin/kotlinx-datetime) 라이브러리와 함께 [`kotlin.time`](https://kotlinlang.org/docs/time-measurement.html) 클래스를 사용합니다.

`kotlin.time`은 항상 표준 라이브러리의 일부로 제공되지만, `kotlinx-datetime`은 명시적인 의존성으로 구성해야 합니다.
이 라이브러리는 멀티플랫폼 라이브러리이며 공통 코드에서만 사용합니다.
따라서 [웹에만 필요한 추가 구성](#웹-앱을-위한-kotlinx-datetime-의존성-추가)을 제외하면 의존성을 한 번만 지정하면 됩니다.

[라이브러리 저장소의 안내](https://github.com/Kotlin/kotlinx-datetime#gradle)를 따릅니다.

1. `gradle/libs.versions.toml` 파일을 열고 [버전 카탈로그(Version Catalog)](https://docs.gradle.org/current/userguide/version_catalogs.html)에 `kotlinx-datetime` 의존성을 추가합니다.

    ```toml
    [versions]
    kotlinx-datetime = "%dateTimeVersion%"

    [libraries]
    kotlinx-datetime = { module = "org.jetbrains.kotlinx:kotlinx-datetime", version.ref = "kotlinx-datetime" }
    ```

2. `shared/build.gradle.kts` 파일을 열고 `commonMain` 소스 세트 구성에 버전 카탈로그 항목에 대한 참조를 추가합니다.

    ```kotlin
    kotlin {
        // ... 
        sourceSets {
            commonMain.dependencies {
                // ...
                implementation(libs.kotlinx.datetime)
            } 
        }
    }
    ```

3. **Shift** 키를 두 번 누른 다음, **Sync Project with Gradle Files** 명령을 찾아 실행합니다.

이제 공통 코드에서 `kotlinx-datetime` API를 사용할 수 있습니다.
웹 타깃의 경우 [아래 섹션](#웹-앱을-위한-kotlinx-datetime-의존성-추가)에 설명된 대로 JavaScript 및 Wasm/JS의 시간대 지원 제한 사항을 해결해야 합니다.

> 멀티플랫폼 의존성을 관리하는 방법에 대한 일반적인 정보는 [멀티플랫폼 라이브러리 의존성 추가](multiplatform-add-dependencies.md)를 참고하세요.
>
{style="tip"}

### 웹 앱을 위한 `kotlinx-datetime` 의존성 추가 {id="add-the-kotlinx-datetime-dependency-for-the-web-app"}

웹 타깃의 경우 시간대 지원을 위해 [`js-joda`](https://js-joda.github.io/js-joda/) npm 패키지도 필요합니다.

1. `webApp/build.gradle.kts` 파일에 해당 패키지에 대한 참조를 추가합니다.

    ```kotlin
    kotlin {
        // ...
        sourceSets {
            // ...
            webMain.dependencies {
                implementation(npm("@js-joda/timezone", "%js-joda-timezone%"))
            }
        }
    }
    
    ```

   `webMain` 소스 세트에 의존성을 추가하면 `wasmJs`와 `js` 타깃 모두에서 해당 라이브러리를 사용할 수 있게 됩니다.

2. **Shift** 키를 두 번 누른 다음, **Sync Project with Gradle Files** 명령을 찾아 실행합니다.

3. **Terminal** 도구 창에서 다음 명령을 실행하여 최신 의존성 버전으로 `yarn.lock` 파일을 업데이트합니다.

    ```shell
    ./gradlew kotlinUpgradeYarnLock kotlinWasmUpgradeYarnLock
    ```

4. `webApp/src/webMain/kotlin/.../main.kt` 파일에서 `@JsModule` 애너테이션을 사용하여 `js-joda` npm 패키지를 임포트합니다.
   `main()` 함수를 다음 코드로 교체합니다.

    ```kotlin
    import kotlin.js.ExperimentalWasmJsInterop
    import kotlin.js.JsModule

    @OptIn(ExperimentalWasmJsInterop::class)
    @JsModule("@js-joda/timezone")
    external object JsJodaTimeZoneModule
    
    private val jsJodaTz = JsJodaTimeZoneModule
    
    @OptIn(ExperimentalComposeUiApi::class)
    fun main() {
        ComposeViewport {
            App()
        }
    }
    ```
   {initial-collapse-state="collapsed" collapsible="true" collapsed-title='@JsModule("@js-joda/timezone")'}

> 프로젝트를 버전 관리에 커밋할 때 `kotlin-js-store` 디렉터리에 생성된 `yarn.lock` 파일을 포함하세요.
> 동기화된 `yarn.lock`은 프로젝트를 빌드하는 모든 사람이 동일한 버전의 JavaScript 의존성을 사용하도록 보장합니다.
>
{style="note"}

## 사용자 입력 지원 {id="support-user-input"}

간단한 예제를 위해 시간대를 지정하고 유효성을 검사하는 복잡한 로직은 구현하지 않습니다.
앱에서는 선택할 수 있는 몇 가지 국가를 제공하고, 선택한 국가 수도의 현재 시각을 표시합니다.

1. `shared/src/commonMain/kotlin` 디렉터리에서 `compose.project.demo/App.kt` 파일을 열고,
   `App()` 컴포저블 위에 국가 정보를 담을 데이터 클래스를 추가합니다.

    ```kotlin
    // 이 예제를 위한 시간대의 단순화된 표현 
    data class Country(val name: String, val zone: TimeZone)
    
    // 특정 시간대와 연결된
    // 지원 국가 목록을 하드코딩합니다
    fun defaultCountries() = listOf(
        Country("Japan", TimeZone.of("Asia/Tokyo")),
        Country("France", TimeZone.of("Europe/Paris")),
        Country("Mexico", TimeZone.of("America/Mexico_City")),
        Country("Indonesia", TimeZone.of("Asia/Jakarta")),
        Country("Egypt", TimeZone.of("Africa/Cairo")),
    )
    ```

2. 동일한 `App.kt` 파일에 주어진 시간대의 현지 시간을 계산하는 `currentTimeAt()` 함수를 추가합니다.
   시간을 `HH:MM:SS` 형식으로 표시하기 위해 이 함수는 각 구성 요소를 0으로 채워 두 자리 숫자로 패딩하는 `kotlinx-datetime` [포맷 빌더](https://github.com/Kotlin/kotlinx-datetime#working-with-other-string-formats)로 형식을 정의합니다.

    ```kotlin
    // 시간을 계산하기 위해 TimeZone 매개변수를 받습니다
    fun currentTimeAt(location: String, zone: TimeZone): String {
        // 시간 형식을 정의합니다: 시, 분, 초는 각각
        // 0으로 채워진 두 자리 숫자이며 콜론으로 구분됩니다
        val timeFormat = LocalTime.Format {
            hour()
            char(':')
            minute()
            char(':')
            second()
        }

        val time = Clock.System.now()
        val localTime = time.toLocalDateTime(zone).time

        return "The time in $location is ${localTime.format(timeFormat)}"
    }
    ```

3. 추가된 기능을 사용하도록 `App()` 컴포저블을 업데이트합니다.
   국가 목록을 드롭다운 형태로 표시하고, 시간을 하드코딩하는 대신 직접 계산합니다.
   `App()` 함수 전체를 다음 코드로 교체합니다.

    ```kotlin
    // 이제 드롭다운 메뉴에 표시할 국가 목록이 필요합니다
    @Composable
    @Preview
    fun App(countries: List<Country> = defaultCountries()) {
      MaterialTheme {
          var showCountries by remember { mutableStateOf(false) }
          var timeAtLocation by remember { mutableStateOf("No location selected") }
    
    
          // 컴포저블은 컨트롤 사이 및 주변에 여백을 주기 위해
          // .padding() modifier를 받습니다
          Column(
              modifier = Modifier
                  .padding(20.dp)
                  .safeContentPadding()
                  .fillMaxSize(),
          ) {
              Text(
                  timeAtLocation,
                  style = TextStyle(fontSize = 20.sp),
                  textAlign = TextAlign.Center,
                  modifier = Modifier.fillMaxWidth().align(Alignment.CenterHorizontally),
              )
              Row(modifier = Modifier.padding(start = 20.dp, top = 10.dp)) {
                  DropdownMenu(
                      // 드롭다운 메뉴의 가시성을 제어하기 위해
                      // remember 값을 사용합니다
                      expanded = showCountries,
                      onDismissRequest = { showCountries = false }
                  ) {
                      // 각 국가에 대한 드롭다운 메뉴 항목을 생성합니다
                      countries.forEach { (name, zone) ->
                          DropdownMenuItem(
                              text = { Text(name) },
                              onClick = {
                                  timeAtLocation = currentTimeAt(name, zone)
                                  showCountries = false
                              }
                          )
                      }
                  }
              }
    
              Button(modifier = Modifier.padding(start = 20.dp, top = 10.dp),
                  onClick = { showCountries = !showCountries }) {
                  Text("Select Location")
              }
          }
      }
    }
    ```
    {initial-collapse-state="collapsed" collapsible="true" collapsed-title="countries.forEach { (name, zone) ->"}
   
4. IDE의 제안에 따라 누락된 심볼을 임포트합니다.
   * `Row()`를 임포트할 때는 `@Composable` 버전을 선택합니다.
   * `Clock`을 임포트할 때는 `kotlin.time` 패키지의 버전을 선택합니다.

애플리케이션을 실행하여 새롭게 변경된 버전을 확인합니다.

<Tabs>
    <TabItem id="mobile-country-list" title="Android 및 iOS">
        <img src="first-compose-project-on-android-ios-7.png" alt="Android 및 iOS의 Compose Multiplatform 앱 내 국가 목록" width="500"/>
    </TabItem>
    <TabItem id="desktop-country-list" title="데스크톱">
        <img src="first-compose-project-on-desktop-8.png" alt="데스크톱의 Compose Multiplatform 앱 내 국가 목록" width="350"/>
    </TabItem>
   <TabItem id="web-country-list" title="웹">
        <img src="first-compose-project-on-web-6.png" alt="웹의 Compose Multiplatform 앱 내 국가 목록" width="500"/>
    </TabItem>
</Tabs>

> 새 에뮬레이터를 생성하거나 실제 기기에서 앱을 실행하는 방법에 대한 자세한 내용은 [Kotlin Multiplatform 애플리케이션 빌드 및 실행](build-and-run-kmp.md)을 참고하세요.
>
{style="note"}

## 이미지 도입하기 {id="introduce-images"}

여러 국가를 더 잘 보여주기 위해 드롭다운의 국가 이름 옆에 국기 이미지를 추가합니다.

이를 위해 올바른 디렉터리에 이미지를 배치한 다음, 이미지를 불러와 표시하는 코드를 추가합니다.

1. 이미 생성한 국가 목록에 맞춰 [Flag CDN](https://flagcdn.com/)에서 국기 이미지를 다운로드합니다. 이 경우 [일본](https://flagcdn.com/w320/jp.png), [프랑스](https://flagcdn.com/w320/fr.png), [멕시코](https://flagcdn.com/w320/mx.png), [인도네시아](https://flagcdn.com/w320/id.png), [이집트](https://flagcdn.com/w320/eg.png)가 해당됩니다.

2. 모든 플랫폼에서 동일한 국기를 사용할 수 있도록 이미지를 `shared/src/commonMain/composeResources/drawable` 디렉터리로 이동합니다.

   ![Compose Multiplatform 리소스 프로젝트 구조](compose-resources-project-structure.png){width=300}

3. 이미지 파일 이름이 위에서 표시된 것과 정확히 일치하는지 확인합니다. Compose Multiplatform은 파일 이름을 기반으로 접근자(accessor)를 생성합니다.

4. 이미지를 사용하도록 UI 코드를 업데이트합니다.
   `commonMain/kotlin/.../App.kt` 파일의 전체 코드를 다음 내용으로 교체합니다.

    ```kotlin
    package compose.project.demo

    import androidx.compose.foundation.Image
    import androidx.compose.foundation.layout.Column
    import androidx.compose.foundation.layout.Row
    import androidx.compose.foundation.layout.fillMaxSize
    import androidx.compose.foundation.layout.fillMaxWidth
    import androidx.compose.foundation.layout.padding
    import androidx.compose.foundation.layout.safeContentPadding
    import androidx.compose.foundation.layout.size
    import androidx.compose.material3.Button
    import androidx.compose.material3.DropdownMenu
    import androidx.compose.material3.DropdownMenuItem
    import androidx.compose.material3.MaterialTheme
    import androidx.compose.material3.Text
    import androidx.compose.runtime.*
    import androidx.compose.ui.Alignment
    import androidx.compose.ui.Modifier
    import androidx.compose.ui.text.TextStyle
    import androidx.compose.ui.text.style.TextAlign
    import androidx.compose.ui.tooling.preview.Preview
    import androidx.compose.ui.unit.dp
    import androidx.compose.ui.unit.sp
    import kotlinx.datetime.LocalTime
    import kotlinx.datetime.TimeZone
    import kotlinx.datetime.format
    import kotlinx.datetime.format.char
    import kotlinx.datetime.toLocalDateTime
    import kotlin.time.Clock
    import composedemo.shared.generated.resources.Res
    import composedemo.shared.generated.resources.eg
    import composedemo.shared.generated.resources.fr
    import composedemo.shared.generated.resources.id
    import composedemo.shared.generated.resources.jp
    import composedemo.shared.generated.resources.mx
    import org.jetbrains.compose.resources.DrawableResource
    import org.jetbrains.compose.resources.painterResource
    
    // 이제 타입에 국기 이미지에 대한 참조도 포함됩니다
    data class Country(val name: String, val zone: TimeZone, val image: DrawableResource)

    fun currentTimeAt(location: String, zone: TimeZone): String {
        val timeFormat = LocalTime.Format {
            hour()
            char(':')
            minute()
            char(':')
            second()
        }

        val time = Clock.System.now()
        val localTime = time.toLocalDateTime(zone).time

        return "The time in $location is ${localTime.format(timeFormat)}"
    }

    // 임포트된 Compose Multiplatform 리소스로 목록을 초기화하고
    // 반환합니다
    fun defaultCountries() = listOf(
        Country("Japan", TimeZone.of("Asia/Tokyo"), Res.drawable.jp),
        Country("France", TimeZone.of("Europe/Paris"), Res.drawable.fr),
        Country("Mexico", TimeZone.of("America/Mexico_City"), Res.drawable.mx),
        Country("Indonesia", TimeZone.of("Asia/Jakarta"), Res.drawable.id),
        Country("Egypt", TimeZone.of("Africa/Cairo"), Res.drawable.eg)
    )

    @Composable
    @Preview
    fun App(countries: List<Country> = defaultCountries()) {
        MaterialTheme {
            var showCountries by remember { mutableStateOf(false) }
            var timeAtLocation by remember { mutableStateOf("No location selected") }

            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .safeContentPadding()
                    .fillMaxSize(),
            ) {
                Text(
                    timeAtLocation,
                    style = TextStyle(fontSize = 20.sp),
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth().align(Alignment.CenterHorizontally),
                )
                Row(modifier = Modifier.padding(start = 20.dp, top = 10.dp)) {
                    DropdownMenu(
                        expanded = showCountries,
                        onDismissRequest = { showCountries = false }
                    ) {
                        countries.forEach { (name, zone, image) ->
                            // 각 국가는 'DropdownMenuItem'에
                            // 국기('Image()')와 이름('Text()')으로 표시됩니다
                            DropdownMenuItem(
                                text = { Row(verticalAlignment = Alignment.CenterVertically) {
                                    Image(
                                        // 'painterResource()'는 'Image()'에 필요한
                                        // Painter 객체를 제공합니다
                                        painterResource(image),
                                        modifier = Modifier.size(50.dp).padding(end = 10.dp),
                                        contentDescription = "$name flag"
                                    )
                                    Text(name)
                                } },
                                onClick = {
                                    timeAtLocation = currentTimeAt(name, zone)
                                    showCountries = false
                                }
                            )
                        }
                    }
                }

                Button(modifier = Modifier.padding(start = 20.dp, top = 10.dp),
                    onClick = { showCountries = !showCountries }) {
                    Text("Select Location")
                }
            }
        }
    }
    ```
    {initial-collapse-state="collapsed" collapsible="true" collapsed-title="import composedemo.shared.generated.resources.Res"}

5. 애플리케이션을 실행하여 새로 추가된 동작을 확인합니다.

<Tabs>
    <TabItem id="mobile-flags" title="Android 및 iOS">
        <img src="first-compose-project-on-android-ios-8.png" alt="Android 및 iOS의 Compose Multiplatform 앱 내 국기" width="500"/>
    </TabItem>
    <TabItem id="desktop-flags" title="데스크톱">
        <img src="first-compose-project-on-desktop-9.png" alt="데스크톱의 Compose Multiplatform 앱 내 국기" width="350"/>
    </TabItem>
   <TabItem id="web-flags" title="웹">
        <img src="first-compose-project-on-web-7.png" alt="웹의 Compose Multiplatform 앱 내 국기" width="500"/>
    </TabItem>
</Tabs>

> 프로젝트의 최종 상태는 [GitHub 저장소](https://github.com/kotlin-hands-on/get-started-with-cm/)에서 확인할 수 있습니다.
>
{style="note"}

## 다음 단계 {id="what-s-next"}

이 튜토리얼에서는 멀티플랫폼 프로젝트의 기본 구성 요소를 다루었습니다.
자세한 내용을 더 깊이 살펴보려면 다음을 참고하세요.
* **Kotlin Multiplatform**
  * 애플리케이션 UI는 네이티브로 두고 비즈니스 로직만 공유하는 [대체 튜토리얼](multiplatform-upgrade-app.md)을 확인해 보세요.
  * [Kotlin Multiplatform에서 제공하는 코드 공유 메커니즘](multiplatform-share-on-platforms.md)에 대해 자세히 알아보세요.
  * [Kotlin Multiplatform 프로젝트 구조의 원리](multiplatform-discover-project.md)에 대해 알아보세요.
  * 멀티플랫폼 의존성 관리에 대한 자세한 내용은 [멀티플랫폼 라이브러리 의존성 추가](multiplatform-add-dependencies.md)를 참고하세요.
* **Compose Multiplatform**
  * [Compose 레이아웃의 기초](compose-layout.md) 및 [Compose Modifier 사용법](compose-layout-modifiers.md)에 대해 알아보세요.
  * [Compose에서의 멀티플랫폼 리소스 활용 가능성과 과제](compose-multiplatform-resources.md)에 대해 알아보세요.
* **고급 프로젝트 튜토리얼**
  * [Ktor와 SQLDelight를 사용한 데이터 및 네트워크 로직 공유](multiplatform-ktor-sqldelight.md).
  * [고급 Android 앱을 KMP로 마이그레이션하기](migrate-from-android.md).
* [엄선된 샘플 멀티플랫폼 프로젝트 목록](multiplatform-samples.md)을 둘러보세요.

커뮤니티에 참여하세요:

* ![Slack](slack.svg){width=25}{type="joined"} **Kotlin Slack**: 도움을 받고 KMP 및 Compose Multiplatform에 관한 토론에 참여하세요.
  [초대 요청](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)을 제출하고
  [#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU) 및
  [#compose](https://kotlinlang.slack.com/archives/CJLTWPH7S) 채널에 가입하세요.
* ![GitHub](git-hub.svg){width=25}{type="joined"} **Compose Multiplatform GitHub**: [저장소](https://github.com/JetBrains/compose-multiplatform)에 스타를 누르고 기여해 보세요.
* ![Stack Overflow](stackoverflow.svg){width=25}{type="joined"} **Stack Overflow**:
  ["kotlin-multiplatform" 태그](https://stackoverflow.com/questions/tagged/kotlin-multiplatform)를 구독하세요.
* ![YouTube](youtube.svg){width=25}{type="joined"} **Kotlin YouTube 채널**: 구독하고 [Kotlin Multiplatform](https://www.youtube.com/playlist?list=PLlFc5cFwUnmy_oVc9YQzjasSNoAk4hk_C) 관련 동영상을 시청해 보세요.