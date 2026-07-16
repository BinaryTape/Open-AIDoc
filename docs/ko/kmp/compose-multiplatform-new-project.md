[//]: # (title: 나만의 애플리케이션 만들기)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

<tldr>
    <p>이 튜토리얼은 IntelliJ IDEA를 사용하지만, Android Studio에서도 동일하게 진행할 수 있습니다. 두 IDE는 핵심 기능과 Kotlin Multiplatform 지원을 공유합니다.</p>
    <br/>   
    <p>이 문서는 <strong>공통 로직 및 UI를 사용한 Compose Multiplatform 앱 만들기</strong> 튜토리얼의 마지막 부분입니다. 진행하기 전에 이전 단계를 모두 완료했는지 확인하세요.</p>
    <p><img src="icon-1-done.svg" width="20" alt="First step"/> <Links href="/kmp/compose-multiplatform-create-first-app" summary="This tutorial uses IntelliJ IDEA, but you can also follow it in Android Studio – both IDEs share the same core functionality and Kotlin Multiplatform support. This is the first part of the Create a Compose Multiplatform app with shared logic and UI tutorial. Create your Compose Multiplatform app Explore composable code Modify the project Create your own application">첫 번째 Compose Multiplatform 앱 만들기</Links><br/>
       <img src="icon-2-done.svg" width="20" alt="Second step"/> <Links href="/kmp/compose-multiplatform-explore-composables" summary="This tutorial uses IntelliJ IDEA, but you can also follow it in Android Studio – both IDEs share the same core functionality and Kotlin Multiplatform support. This is the second part of the Create a Compose Multiplatform app with shared logic and UI tutorial. Before proceeding, make sure you've completed previous steps. Create your Compose Multiplatform app Explore composable code Modify the project Create your own application">컴포저블 코드 살펴보기</Links><br/>
       <img src="icon-3-done.svg" width="20" alt="Third step"/> <Links href="/kmp/compose-multiplatform-modify-project" summary="This tutorial uses IntelliJ IDEA, but you can also follow it in Android Studio – both IDEs share the same core functionality and Kotlin Multiplatform support. This is the third part of the Create a Compose Multiplatform app with shared logic and UI tutorial. Before proceeding, make sure you've completed previous steps. Create your Compose Multiplatform app Explore composable code Modify the project Create your own application">프로젝트 수정하기</Links><br/>
       <img src="icon-4.svg" width="20" alt="Fourth step"/> <strong>나만의 애플리케이션 만들기</strong><br/>
    </p>
</tldr>

이제 마법사(Wizard)가 생성한 샘플 프로젝트를 살펴보고 기능을 확장해 보았으니, 이미 알고 있는 개념과 몇 가지 새로운 개념을 도입하여 처음부터 나만의 애플리케이션을 만들 수 있습니다.

사용자가 국가와 도시를 입력하면 해당 국가의 수도 시간을 표시하는 "현지 시간 애플리케이션"을 만들 것입니다. Compose Multiplatform 앱의 모든 기능은 멀티플랫폼 라이브러리를 사용하여 공통 코드(common code)로 구현됩니다. 드롭다운 메뉴 내에 이미지를 로드하여 표시하고, 이벤트, 스타일, 테마, 수정자(modifiers) 및 레이아웃을 사용하게 됩니다.

각 단계에서 세 가지 플랫폼(iOS, Android, 데스크톱) 모두에서 애플리케이션을 실행하거나, 필요에 맞는 특정 플랫폼에 집중하여 진행할 수 있습니다.

> 프로젝트의 최종 상태는 [GitHub 저장소](https://github.com/kotlin-hands-on/get-started-with-cm/)에서 확인할 수 있습니다.
>
{style="note"}

## 기반 다지기

시작하기 위해 새로운 `App` 컴포저블을 구현합니다.

1. `composeApp/src/commonMain/kotlin` 폴더에서 `App.kt` 파일을 열고 코드를 다음 `App` 컴포저블로 교체합니다.

    ```kotlin
    @Composable
    @Preview
    fun App() {
        MaterialTheme {
            var timeAtLocation by remember { mutableStateOf("No location selected") }
   
            Column(
                modifier = Modifier
                    .safeContentPadding()
                    .fillMaxSize(),
            ) {
                Text(timeAtLocation)
                Button(onClick = { timeAtLocation = "13:30" }) {
                    Text("Show Time At Location")
                }
            }
        }
    }
    ```

   * 레이아웃은 두 개의 컴포저블을 포함하는 컬럼(Column)입니다. 첫 번째는 `Text` 컴포저블이고, 두 번째는 `Button`입니다.
   * 두 컴포저블은 `timeAtLocation` 속성이라는 단일 공유 상태로 연결됩니다. `Text` 컴포저블은 이 상태를 관찰(observe)합니다.
   * `Button` 컴포저블은 `onClick` 이벤트 핸들러를 사용하여 상태를 변경합니다.

2. Android 및 iOS에서 애플리케이션을 실행합니다.

   ![Android 및 iOS에서의 새로운 Compose Multiplatform 앱](first-compose-project-on-android-ios-3.png){width=500}

   애플리케이션을 실행하고 버튼을 클릭하면 하드코딩된 시간이 표시됩니다.

3. [Compose Hot Reload](compose-hot-reload.md)를 사용하여 데스크톱에서 애플리케이션을 실행합니다.
   1. `composeApp/src/jvmMain/kotlin/main.kt` 파일의 거터(gutter)에 있는 **Run** 아이콘을 클릭합니다.
   2. **Run 'composeApp [jvm]' with Compose Hot Reload**를 선택합니다.
   ![거터에서 Compose Hot Reload 실행](compose-hot-reload-gutter-run.png){width=350 style="block"}

   앱은 작동하지만 창 크기가 UI에 비해 너무 큽니다.

   ![데스크톱에서의 새로운 Compose Multiplatform 앱](first-compose-project-on-desktop-3.png){width=400}

4. 이를 해결하기 위해 `main.kt` 파일을 다음과 같이 업데이트합니다.

    ```kotlin
   fun main() = application {
       val state = rememberWindowState(
           size = DpSize(400.dp, 350.dp),
           position = WindowPosition(300.dp, 300.dp)
       )
       Window(
           title = "Local Time App", 
           onCloseRequest = ::exitApplication, 
           state = state,
           alwaysOnTop = true
       ) {
           App()
       }
   }
    ```

    여기서는 창의 제목을 설정하고 `WindowState` 타입을 사용하여 창의 초기 크기와 화면 위치를 지정했습니다.

5. IDE의 안내에 따라 누락된 의존성(dependencies)을 임포트합니다.

6. 앱이 자동으로 업데이트되는 것을 확인하려면 수정된 파일을 저장(<shortcut>⌘ S</shortcut> / <shortcut>Ctrl+S</shortcut>)하세요. 모양이 개선된 것을 볼 수 있습니다.

   ![데스크톱에서 개선된 Compose Multiplatform 앱의 모습](first-compose-project-on-desktop-4.png){width=350}

   ![Compose Hot Reload](compose-hot-reload-resize.gif)

## 사용자 입력 지원

이제 사용자가 도시 이름을 입력하여 해당 위치의 시간을 확인할 수 있도록 합니다. 이를 구현하는 가장 간단한 방법은 `TextField` 컴포저블을 추가하는 것입니다.

1. `commonMain/kotlin/compose.project.demo/App.kt`의 기존 `App()` 구현을 아래 코드로 교체합니다.

    ```kotlin
    @Composable
    @Preview
    fun App() {
        MaterialTheme {
            var location by remember { mutableStateOf("Europe/Paris") }
            var timeAtLocation by remember { mutableStateOf("No location selected") }
    
            Column(
                modifier = Modifier
                    .safeContentPadding()
                    .fillMaxSize(),
            ) {
                Text(timeAtLocation)
                TextField(value = location, onValueChange = { location = it })
                Button(onClick = { timeAtLocation = "13:30" }) {
                    Text("Show Time At Location")
                }
            }
        }
    }
    ```

    새 코드에는 `TextField`와 `location` 속성이 추가되었습니다. 사용자가 텍스트 필드에 입력함에 따라 `onValueChange` 이벤트 핸들러를 통해 속성 값이 점진적으로 업데이트됩니다.

2. IDE의 안내에 따라 누락된 의존성을 임포트합니다.
3. 타겟팅하는 각 플랫폼에서 애플리케이션을 실행합니다.

<Tabs>
    <TabItem id="mobile-user-input" title="Android 및 iOS">
        <img src="first-compose-project-on-android-ios-4.png" alt="Android 및 iOS용 Compose Multiplatform 앱의 사용자 입력" width="500"/>
    </TabItem>
    <TabItem id="desktop-user-input" title="데스크톱">
        <img src="first-compose-project-on-desktop-5.png" alt="데스크톱용 Compose Multiplatform 앱의 사용자 입력" width="350"/>
    </TabItem>
</Tabs>

## 시간 계산하기

다음 단계는 입력된 값을 사용하여 시간을 계산하는 것입니다. 이를 위해 `currentTimeAt()` 함수를 만듭니다.

1. `App.kt` 파일로 돌아가 다음 함수를 추가합니다.

    ```kotlin
   fun currentTimeAt(location: String): String? {
        fun LocalTime.formatted() = "$hour:$minute:$second"

        return try {
            val time = Clock.System.now()
            val zone = TimeZone.of(location)
            val localTime = time.toLocalDateTime(zone).time
            "The time in $location is ${localTime.formatted()}"
        } catch (ex: IllegalTimeZoneException) {
            null
        }
    }
    ```

    이 함수는 이전에 만들었던(더 이상 필요하지 않은) `todaysDate()`와 유사합니다.
    프로젝트에 [kotlinx-datetime](https://github.com/Kotlin/kotlinx-datetime) 라이브러리가 아직 추가되지 않았다면 `composeApp/build.gradle.kts` 파일을 열고 공통 코드 소스 세트를 구성하는 섹션에 `kotlinx-datetime` 의존성을 추가합니다.
    편의상 버전 카탈로그에 추가하는 대신 버전 번호를 직접 포함할 수 있습니다.

    ```kotlin
    kotlin {
        // ...
        sourceSets {
            // ...
            commonMain.dependencies {
                // ...
                implementation("org.jetbrains.kotlinx:kotlinx-datetime:%dateTimeVersion%")
            }
        }
    }
    ```
   {initial-collapse-state="collapsed" collapsible="true" collapsed-title='implementation("org.jetbrains.kotlinx:kotlinx-datetime:%dateTimeVersion%")'}
   
2. IDE의 안내에 따라 누락된 의존성을 임포트합니다.
   `Clock` 클래스는 `kotlinx.datetime`이 아닌 `kotlin.time`에서 임포트해야 합니다.
3. `App` 컴포저블을 수정하여 `currentTimeAt()`을 호출하도록 합니다.

    ```kotlin
   @Composable
   @Preview
   fun App() {
   MaterialTheme { 
       var location by remember { mutableStateOf("Europe/Paris") }
       var timeAtLocation by remember { mutableStateOf("No location selected") }
   
       Column(
           modifier = Modifier
               .safeContentPadding()
               .fillMaxSize()
           ) {
               Text(timeAtLocation)
               TextField(value = location, onValueChange = { location = it })
               Button(onClick = { timeAtLocation = currentTimeAt(location) ?: "Invalid Location" }) {
                   Text("Show Time At Location")
               }
           }
       }
   }
    ```

4. 애플리케이션을 다시 실행하고 유효한 타임존을 입력합니다.
5. 버튼을 클릭하면 올바른 시간이 표시되어야 합니다.

<Tabs>
    <TabItem id="mobile-time-display" title="Android 및 iOS">
        <img src="first-compose-project-on-android-ios-5.png" alt="Android 및 iOS용 Compose Multiplatform 앱의 시간 표시" width="500"/>
    </TabItem>
    <TabItem id="desktop-time-display" title="데스크톱">
        <img src="first-compose-project-on-desktop-6.png" alt="데스크톱용 Compose Multiplatform 앱의 시간 표시" width="350"/>
    </TabItem>
</Tabs>

## 스타일 개선하기

애플리케이션이 작동은 하지만 외관에 문제가 있습니다. 컴포저블 사이의 간격이 더 필요하며 시간 메시지가 더 눈에 띄게 렌더링되어야 합니다.

1. 이러한 문제를 해결하기 위해 다음 버전의 `App` 컴포저블을 사용합니다.

    ```kotlin
    @Composable
    @Preview
    fun App() {
        MaterialTheme {
            var location by remember { mutableStateOf("Europe/Paris") }
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
                    modifier = Modifier.fillMaxWidth().align(Alignment.CenterHorizontally)
                )
                TextField(
                    value = location,
                    onValueChange = { location = it },
                    modifier = Modifier.padding(top = 10.dp)
                )
                Button(
                    onClick = { timeAtLocation = currentTimeAt(location) ?: "Invalid Location" },
                    modifier = Modifier.padding(top = 10.dp)
                ) {
                    Text("Show Time")
                }
            }
        }
    }
    ```

    * `modifier` 파라미터는 `Column` 주변뿐만 아니라 `Button`과 `TextField` 상단에도 패딩을 추가합니다.
    * `Text` 컴포저블은 가로 공간을 모두 채우고 콘텐츠를 중앙에 정렬합니다.
    * `style` 파라미터는 `Text`의 외관을 커스터마이징합니다.

2. IDE의 안내에 따라 누락된 의존성을 임포트합니다.
    `Alignment`의 경우 `androidx.compose.ui` 버전을 사용하세요.

3. 애플리케이션을 실행하여 외관이 어떻게 개선되었는지 확인합니다.

<Tabs>
    <TabItem id="mobile-improved-style" title="Android 및 iOS">
        <img src="first-compose-project-on-android-ios-6.png" alt="Android 및 iOS용 Compose Multiplatform 앱의 개선된 스타일" width="500"/>
    </TabItem>
    <TabItem id="desktop-improved-style" title="데스크톱">
        <img src="first-compose-project-on-desktop-7.png" alt="데스크톱용 Compose Multiplatform 앱의 개선된 스타일" width="350"/>
    </TabItem>
</Tabs>

<!--
> 이 단계의 프로젝트 상태는 [GitHub 저장소](https://github.com/kotlin-hands-on/get-started-with-cm/tree/main/ComposeDemoStage2)에서 확인할 수 있습니다.
>
{style="tip"}
-->

## 디자인 리팩터링하기

애플리케이션은 잘 작동하지만 오타에 취약합니다. 예를 들어 사용자가 "France" 대신 "Franse"를 입력하면 앱이 이를 처리할 수 없습니다. 미리 정의된 목록에서 국가를 선택하도록 요청하는 것이 더 좋습니다.

1. 이를 위해 `App` 컴포저블의 디자인을 변경합니다.

    ```kotlin
    data class Country(val name: String, val zone: TimeZone)
    
    fun currentTimeAt(location: String, zone: TimeZone): String {
        fun LocalTime.formatted() = "$hour:$minute:$second"
    
        val time = Clock.System.now()
        val localTime = time.toLocalDateTime(zone).time
    
        return "The time in $location is ${localTime.formatted()}"
    }
    
    fun countries() = listOf(
        Country("Japan", TimeZone.of("Asia/Tokyo")),
        Country("France", TimeZone.of("Europe/Paris")),
        Country("Mexico", TimeZone.of("America/Mexico_City")),
        Country("Indonesia", TimeZone.of("Asia/Jakarta")),
        Country("Egypt", TimeZone.of("Africa/Cairo")),
    )
    
    @Composable
    @Preview
    fun App(countries: `List<Country>` = countries()) {
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
                    modifier = Modifier.fillMaxWidth().align(Alignment.CenterHorizontally)
                )
                Row(modifier = Modifier.padding(start = 20.dp, top = 10.dp)) {
                    DropdownMenu(
                        expanded = showCountries,
                        onDismissRequest = { showCountries = false }
                    ) {
                        countries().forEach { (name, zone) ->
                            DropdownMenuItem(
                                text = {   Text(name)},
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

   * 이름과 타임존으로 구성된 `Country` 타입이 추가되었습니다.
   * `currentTimeAt()` 함수는 두 번째 파라미터로 `TimeZone`을 받습니다.
   * `App`은 이제 파라미터로 국가 목록을 요구합니다. `countries()` 함수가 이 목록을 제공합니다.
   * `TextField`가 `DropdownMenu`로 대체되었습니다. `showCountries` 속성 값이 `DropdownMenu`의 가시성을 결정합니다. 각 국가에 대해 `DropdownMenuItem`이 생성됩니다.

2. IDE의 안내에 따라 누락된 의존성을 임포트합니다.
3. 애플리케이션을 실행하여 디자인이 변경된 버전을 확인합니다.

<Tabs>
    <TabItem id="mobile-country-list" title="Android 및 iOS">
        <img src="first-compose-project-on-android-ios-7.png" alt="Android 및 iOS용 Compose Multiplatform 앱의 국가 목록" width="500"/>
    </TabItem>
    <TabItem id="desktop-country-list" title="데스크톱">
        <img src="first-compose-project-on-desktop-8.png" alt="데스크톱용 Compose Multiplatform 앱의 국가 목록" width="350"/>
    </TabItem>
</Tabs>

<!--
> 이 단계의 프로젝트 상태는 [GitHub 저장소](https://github.com/kotlin-hands-on/get-started-with-cm/tree/main/ComposeDemoStage3)에서 확인할 수 있습니다.
>
{style="tip"}
-->

> [Koin](https://insert-koin.io/)과 같은 의존성 주입 프레임워크를 사용하여 위치 테이블을 구축하고 주입하면 디자인을 더욱 개선할 수 있습니다. 데이터가 외부에 저장되어 있다면 [Ktor](https://ktor.io/docs/create-client.html) 라이브러리를 사용하여 네트워크를 통해 가져오거나 [SQLDelight](https://github.com/cashapp/sqldelight) 라이브러리를 사용하여 데이터베이스에서 가져올 수 있습니다.
>
{style="note"}

## 이미지 도입하기

국가 이름 목록도 작동하지만 시각적으로 매력적이지는 않습니다. 이름을 국기 이미지로 교체하여 개선할 수 있습니다.

Compose Multiplatform은 모든 플랫폼의 공통 코드를 통해 리소스에 접근할 수 있는 라이브러리를 제공합니다. Kotlin Multiplatform 마법사가 이미 이 라이브러리를 추가하고 구성했으므로, 빌드 파일을 수정하지 않고도 바로 리소스를 로드할 수 있습니다.

프로젝트에서 이미지를 지원하려면 이미지 파일을 다운로드하여 올바른 디렉토리에 저장하고, 이를 로드하여 표시하는 코드를 추가해야 합니다.

1. 이미 생성한 국가 목록에 맞춰 [Flag CDN](https://flagcdn.com/)에서 국기 이미지를 다운로드합니다. 이 경우 [일본](https://flagcdn.com/w320/jp.png), [프랑스](https://flagcdn.com/w320/fr.png), [멕시코](https://flagcdn.com/w320/mx.png), [인도네시아](https://flagcdn.com/w320/id.png), [이집트](https://flagcdn.com/w320/eg.png) 국기가 필요합니다.

2. 모든 플랫폼에서 동일한 국기를 사용할 수 있도록 이미지를 `composeApp/src/commonMain/composeResources/drawable` 디렉토리로 이동합니다.

   ![Compose Multiplatform 리소스 프로젝트 구조](compose-resources-project-structure.png){width=300}

3. 애플리케이션을 빌드하거나 실행하여 추가된 리소스에 대한 접근자가 포함된 `Res` 클래스를 생성합니다.

4. `commonMain/kotlin/.../App.kt` 파일의 코드를 업데이트하여 이미지를 지원하도록 합니다.

    ```kotlin
    import demo.composeapp.generated.resources.jp
    import demo.composeapp.generated.resources.mx
    import demo.composeapp.generated.resources.eg
    import demo.composeapp.generated.resources.fr
    import demo.composeapp.generated.resources.id
   
    data class Country(val name: String, val zone: TimeZone, val image: DrawableResource)

    fun currentTimeAt(location: String, zone: TimeZone): String {
        fun LocalTime.formatted() = "$hour:$minute:$second"

        val time = Clock.System.now()
        val localTime = time.toLocalDateTime(zone).time

        return "The time in $location is ${localTime.formatted()}"
    }

    val defaultCountries = listOf(
        Country("Japan", TimeZone.of("Asia/Tokyo"), Res.drawable.jp),
        Country("France", TimeZone.of("Europe/Paris"), Res.drawable.fr),
        Country("Mexico", TimeZone.of("America/Mexico_City"), Res.drawable.mx),
        Country("Indonesia", TimeZone.of("Asia/Jakarta"), Res.drawable.id),
        Country("Egypt", TimeZone.of("Africa/Cairo"), Res.drawable.eg)
    )

    @Composable
    @Preview
    fun App(countries: `List<Country>` = defaultCountries) {
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
                    modifier = Modifier.fillMaxWidth().align(Alignment.CenterHorizontally)
                )
                Row(modifier = Modifier.padding(start = 20.dp, top = 10.dp)) {
                    DropdownMenu(
                        expanded = showCountries,
                        onDismissRequest = { showCountries = false }
                    ) {
                        countries.forEach { (name, zone, image) ->
                            DropdownMenuItem(
                                text = { Row(verticalAlignment = Alignment.CenterVertically) {
                                    Image(
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
    {initial-collapse-state="collapsed" collapsible="true" collapsed-title="data class Country(val name: String, val zone: TimeZone, val image: DrawableResource)"}

    * `Country` 타입은 연결된 이미지의 경로를 저장합니다.
    * `App`에 전달되는 국가 목록에 이러한 경로가 포함됩니다.
    * `App`은 각 `DropdownMenuItem`에 `Image`를 표시하고, 그 뒤에 국가 이름이 포함된 `Text` 컴포저블을 표시합니다.
    * 각 `Image`는 데이터를 가져오기 위해 `Painter` 객체가 필요합니다.

5. IDE의 안내에 따라 누락된 의존성을 임포트합니다.
6. 애플리케이션을 실행하여 새로운 동작을 확인합니다.

<Tabs>
    <TabItem id="mobile-flags" title="Android 및 iOS">
        <img src="first-compose-project-on-android-ios-8.png" alt="Android 및 iOS용 Compose Multiplatform 앱의 국기 표시" width="500"/>
    </TabItem>
    <TabItem id="desktop-flags" title="데스크톱">
        <img src="first-compose-project-on-desktop-9.png" alt="데스크톱용 Compose Multiplatform 앱의 국기 표시" width="350"/>
    </TabItem>
</Tabs>

> 프로젝트의 최종 상태는 [GitHub 저장소](https://github.com/kotlin-hands-on/get-started-with-cm/)에서 확인할 수 있습니다.
>
{style="note"}

## 다음 단계

멀티플랫폼 개발을 더 자세히 살펴보고 더 많은 프로젝트를 시도해 보시기 바랍니다.

* [기존 Android 앱을 크로스 플랫폼으로 만들기](multiplatform-integrate-in-existing-app.md)
* [Ktor 및 SQLDelight를 사용하여 멀티플랫폼 앱 만들기](multiplatform-ktor-sqldelight.md)
* [UI는 네이티브로 유지하면서 iOS와 Android 간에 비즈니스 로직 공유하기](multiplatform-create-first-app.md)
* [Kotlin/Wasm을 사용하여 Compose Multiplatform 앱 만들기](https://kotlinlang.org/docs/wasm-get-started.html)
* [엄선된 샘플 프로젝트 목록 확인하기](multiplatform-samples.md)

커뮤니티에 참여하세요:

* ![GitHub](git-hub.svg){width=25}{type="joined"} **Compose Multiplatform GitHub**: [저장소](https://github.com/JetBrains/compose-multiplatform)에 스타를 누르고 기여해 보세요.
* ![Slack](slack.svg){width=25}{type="joined"} **Kotlin Slack**: [초대](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)를 받고 [#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU) 채널에 참여하세요.
* ![Stack Overflow](stackoverflow.svg){width=25}{type="joined"} **Stack Overflow**: ["kotlin-multiplatform" 태그](https://stackoverflow.com/questions/tagged/kotlin-multiplatform)를 구독하세요.
* ![YouTube](youtube.svg){width=25}{type="joined"} **Kotlin YouTube 채널**: 구독하고 [Kotlin Multiplatform 관련 영상](https://www.youtube.com/playlist?list=PLlFc5cFwUnmy_oVc9YQzjasSNoAk4hk_C)을 시청하세요.