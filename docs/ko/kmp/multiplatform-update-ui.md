[//]: # (title: 사용자 인터페이스 업데이트)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

<tldr>
    <p>이 튜토리얼은 IntelliJ IDEA를 사용하지만, Android Studio에서도 따라 할 수 있습니다. 두 IDE는 핵심 기능과 Kotlin Multiplatform 지원을 공유합니다.</p>
    <br/>
    <p>이것은 <strong>공통 로직과 네이티브 UI를 갖춘 Kotlin Multiplatform 앱 만들기</strong> 튜토리얼의 두 번째 부분입니다. 계속하기 전에 이전 단계를 완료했는지 확인하세요.</p>
    <p><img src="icon-1-done.svg" width="20" alt="첫 번째 단계"/> <Links href="/kmp/multiplatform-create-first-app" summary="이 튜토리얼은 IntelliJ IDEA를 사용하지만, Android Studio에서도 따라 할 수 있습니다. 두 IDE는 핵심 기능과 Kotlin Multiplatform 지원을 공유합니다. 이것은 공통 로직과 네이티브 UI를 갖춘 Kotlin Multiplatform 앱 만들기 튜토리얼의 첫 번째 부분입니다. Kotlin Multiplatform 앱 만들기 사용자 인터페이스 업데이트 종속성 추가 더 많은 로직 공유 프로젝트 마무리">Kotlin Multiplatform 앱 만들기</Links><br/>
       <img src="icon-2.svg" width="20" alt="두 번째 단계"/> <strong>사용자 인터페이스 업데이트</strong><br/>
       <img src="icon-3-todo.svg" width="20" alt="세 번째 단계"/> 종속성 추가<br/>       
       <img src="icon-4-todo.svg" width="20" alt="네 번째 단계"/> 더 많은 로직 공유<br/>
       <img src="icon-5-todo.svg" width="20" alt="다섯 번째 단계"/> 프로젝트 마무리<br/>
    </p>
</tldr>

사용자 인터페이스를 빌드하기 위해, 프로젝트의 Android 부분에는 [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/) 툴킷을 사용하고 iOS 부분에는 [SwiftUI](https://developer.apple.com/xcode/swiftui/)를 사용합니다.
이들은 모두 선언형 UI 프레임워크이며, UI 구현에서 유사점을 발견할 수 있을 것입니다. 두 경우 모두 데이터를 `phrases` 변수에 저장한 다음, 이를 반복하여 `Text` 항목 리스트를 생성합니다.

## Android 부분 업데이트

`composeApp` 모듈은 Android 애플리케이션을 포함하며, 메인 액티비티(activity)와 UI 뷰를 정의하고 `shared` 모듈을 일반 Android 라이브러리처럼 사용합니다. 애플리케이션의 UI는 Compose Multiplatform 프레임워크를 사용합니다.

몇 가지를 변경하고 UI에 어떻게 반영되는지 확인해 보세요:

1. `composeApp/src/androidMain/.../greetingkmp` 디렉토리에 있는 `App.kt` 파일로 이동합니다.
2. `Greeting` 클래스 호출을 찾습니다. `greet()` 함수를 선택하고 마우스 오른쪽 버튼을 클릭한 다음 **Go To** | **Declaration or Usages**를 선택합니다. 이전 단계에서 편집한 `shared` 모듈의 동일한 클래스임을 알 수 있습니다.
3. `Greeting.kt` 파일에서 `Greeting` 클래스를 업데이트하여 `greet()` 함수가 문자열 리스트를 반환하도록 합니다:

   ```kotlin
   class Greeting {
   
       private val platform: Platform = getPlatform()
   
       fun greet(): `List<String>` = buildList {
           add(if (Random.nextBoolean()) "Hi!" else "Hello!")
           add("Guess what this is! > ${platform.name.reversed()}!")
       }
   }
   ```

4. `App.kt` 파일로 돌아가서 `App()` 구현을 업데이트합니다:

   ```kotlin
   @Composable
   @Preview
   fun App() {
       MaterialTheme {
           val greeting = remember { Greeting().greet() }
   
           Column(
               modifier = Modifier
                   .padding(all = 10.dp)
                   .safeContentPadding()
                   .fillMaxSize(),
               verticalArrangement = Arrangement.spacedBy(8.dp),
           ) {
               greeting.forEach { greeting ->
                   Text(greeting)
                   HorizontalDivider()
               }
           }
       }
   }
   ```

   여기서 `Column` 컴포저블(composable)은 각 `Text` 항목을 표시하며, 주변에 패딩을 추가하고 항목 사이에 간격을 둡니다.

5. 누락된 종속성을 임포트(import)하기 위해 IntelliJ IDEA의 제안을 따릅니다.
6. 이제 Android 앱을 실행하여 문자열 리스트가 어떻게 표시되는지 확인할 수 있습니다:

   ![업데이트된 Android 멀티플랫폼 앱의 UI](first-multiplatform-project-on-android-2.png){width=300}

## iOS 모듈 작업

`iosApp` 디렉토리는 iOS 애플리케이션으로 빌드됩니다. 이 모듈은 `shared` 모듈을 iOS 프레임워크로 의존하며 사용합니다. 앱의 UI는 Swift로 작성되었습니다.

Android 앱에서와 동일한 변경 사항을 구현해 보세요:

1. IntelliJ IDEA의 **Project** 도구 창에서 프로젝트 루트에 있는 `iosApp/iosApp` 폴더를 찾습니다.
2. `iosApp/ContentView.swift` 파일을 열고, `Greeting().greet()` 호출을 마우스 오른쪽 버튼으로 클릭한 후 **Go To** | **Definition**을 선택합니다.

    `shared` 모듈에 정의된 Kotlin 함수에 대한 Objective-C 선언을 볼 수 있습니다. Kotlin 타입은 Objective-C/Swift에서 사용될 때 Objective-C 타입으로 표현됩니다. 여기서 `greet()` 함수는 Kotlin에서 `List<String>`을 반환하며, Swift에서는 `NSArray<NSString>`을 반환하는 것으로 보입니다. 타입 매핑에 대한 자세한 내용은 [Swift/Objective-C 상호 운용성(Interoperability)](https://kotlinlang.org/docs/native-objc-interop.html)을 참고하세요.

3. Android 앱에서와 같은 방식으로 항목 리스트를 표시하도록 SwiftUI 코드를 업데이트합니다:

    ```Swift
    struct ContentView: View {
       let phrases = Greeting().greet()
    
       var body: some View {
           List(phrases, id: \.self) {
               Text($0)
           }
       }
    }
    ```

    * `greet()` 호출 결과는 `phrases` 변수에 저장됩니다(Swift의 `let`은 Kotlin의 `val`과 유사합니다).
    * `List` 함수는 `Text` 항목 리스트를 생성합니다.

4. 변경 사항을 확인하기 위해 iOS 실행 구성을 시작합니다:

    ![업데이트된 iOS 멀티플랫폼 앱의 UI](first-multiplatform-project-on-ios-2.png){width=300}

## 발생 가능한 문제 및 해결 방법

### Xcode가 공유 프레임워크를 호출하는 코드에서 오류를 보고하는 경우

Xcode를 사용 중이라면, Xcode 프로젝트가 여전히 이전 버전의 프레임워크를 사용하고 있을 수 있습니다. 이를 해결하려면 IntelliJ IDEA로 돌아가서 프로젝트를 다시 빌드하거나 iOS 실행 구성을 시작하세요.

### Xcode가 공유 프레임워크를 임포트할 때 오류를 보고하는 경우

Xcode를 사용 중이라면 캐시된 바이너리를 지워야 할 수도 있습니다. 메인 메뉴에서 **Product | Clean Build Folder**를 선택하여 환경을 초기화해 보세요.

## 다음 단계

튜토리얼의 다음 부분에서는 종속성에 대해 배우고 프로젝트의 기능을 확장하기 위해 서드파티 라이브러리를 추가해 보겠습니다.

**[다음 부분으로 진행하기](multiplatform-dependencies.md)**

## 도움 받기

* **Kotlin Slack**. [초대](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)를 받고 [#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU) 채널에 참여하세요.
* **Kotlin 이슈 트래커**. [새 이슈를 보고](https://youtrack.jetbrains.com/newIssue?project=KT)하세요.