[//]: # (title: 프로젝트에 의존성 추가하기)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

<tldr>
    <p>이 튜토리얼은 IntelliJ IDEA를 사용하지만, Android Studio에서도 따라 할 수 있습니다. 두 IDE 모두 동일한 핵심 기능과 Kotlin Multiplatform 지원을 공유합니다.</p>
    <br/>   
    <p>이 문서는 <strong>공유 로직과 네이티브 UI를 갖춘 Kotlin Multiplatform 앱 만들기</strong> 튜토리얼의 세 번째 파트입니다. 계속 진행하기 전에 이전 단계를 완료했는지 확인하세요.</p>
    <p><img src="icon-1-done.svg" width="20" alt="First step"/> <Links href="/kmp/multiplatform-create-first-app" summary="이 튜토리얼은 IntelliJ IDEA를 사용하지만, Android Studio에서도 따라 할 수 있습니다. 두 IDE 모두 동일한 핵심 기능과 Kotlin Multiplatform 지원을 공유합니다. 이 문서는 공유 로직과 네이티브 UI를 갖춘 Kotlin Multiplatform 앱 만들기 튜토리얼의 첫 번째 파트입니다. Kotlin Multiplatform 앱 만들기, 사용자 인터페이스 업데이트, 의존성 추가, 더 많은 로직 공유, 프로젝트 마무리">Kotlin Multiplatform 앱 만들기</Links><br/>
        <img src="icon-2-done.svg" width="20" alt="Second step"/> <Links href="/kmp/multiplatform-update-ui" summary="이 튜토리얼은 IntelliJ IDEA를 사용하지만, Android Studio에서도 따라 할 수 있습니다. 두 IDE 모두 동일한 핵심 기능과 Kotlin Multiplatform 지원을 공유합니다. 이 문서는 공유 로직과 네이티브 UI를 갖춘 Kotlin Multiplatform 앱 만들기 튜토리얼의 두 번째 파트입니다. 계속 진행하기 전에 이전 단계를 완료했는지 확인하세요. Kotlin Multiplatform 앱 만들기, 사용자 인터페이스 업데이트, 의존성 추가, 더 많은 로직 공유, 프로젝트 마무리">사용자 인터페이스 업데이트</Links><br/>
        <img src="icon-3.svg" width="20" alt="Third step"/> <strong>의존성 추가</strong><br/>
        <img src="icon-4-todo.svg" width="20" alt="Fourth step"/> 더 많은 로직 공유<br/>
        <img src="icon-5-todo.svg" width="20" alt="Fifth step"/> 프로젝트 마무리<br/>
    </p>
</tldr>

이미 첫 번째 크로스 플랫폼 Kotlin Multiplatform 프로젝트를 만드셨군요! 이제 성공적인 크로스 플랫폼 애플리케이션을 구축하는 데 필수적인 서드파티 라이브러리 의존성(dependency)을 추가하는 방법을 배워보겠습니다.

## 의존성 유형

Kotlin Multiplatform 프로젝트에서 사용할 수 있는 의존성 유형은 두 가지입니다:

* _멀티플랫폼 의존성 (Multiplatform dependencies)_. 여러 타겟을 지원하며 공통 소스 세트인 `commonMain`에서 사용할 수 있는 멀티플랫폼 라이브러리입니다.

  [Koin](https://insert-koin.io/), [Apollo](https://www.apollographql.com/), [Okio](https://square.github.io/okio/)와 같은 많은 최신 Android 라이브러리들이 이미 멀티플랫폼을 지원합니다. JetBrains에서 제공하는 Kotlin Multiplatform 라이브러리 검색 서비스인 [klibs.io](https://klibs.io/)에서 더 많은 멀티플랫폼 라이브러리를 찾아보세요.

* _네이티브 의존성 (Native dependencies)_. 관련 생태계의 일반적인 라이브러리입니다. 네이티브 프로젝트에서 Android는 Gradle을, iOS는 CocoaPods나 다른 의존성 관리 도구를 사용하여 작업하는 것과 같습니다.
  
  공유 모듈(shared module)로 작업할 때, 보안 저장소(security storage)와 같은 플랫폼 API를 사용하려는 경우 여전히 네이티브 의존성이 필요합니다. 이러한 네이티브 의존성은 네이티브 소스 세트인 `androidMain` 및 `iosMain`에 추가할 수 있습니다.

두 유형의 의존성 모두 로컬 및 외부 저장소를 사용할 수 있습니다.

## 멀티플랫폼 의존성 추가하기

> Android 앱 개발 경험이 있다면, 멀티플랫폼 의존성을 추가하는 과정은 일반적인 Android 프로젝트에서 Gradle 의존성을 추가하는 것과 매우 유사합니다. 유일한 차이점은 소스 세트(source set)를 지정해야 한다는 것입니다.
>
{style="tip"}

이제 앱으로 돌아가서 인사말을 좀 더 화기애애하게 만들어 봅시다. 기기 정보 외에 새해까지 남은 일수를 표시하는 기능을 추가하겠습니다. `kotlinx-datetime` 라이브러리는 완전한 멀티플랫폼을 지원하며, 공유 코드에서 날짜를 다루는 가장 편리한 방법입니다.

1. `shared` 디렉토리에 있는 `build.gradle.kts` 파일을 엽니다.
2. `commonMain` 소스 세트 의존성에 다음 의존성과 Kotlin time opt-in 설정을 추가합니다:

    ```kotlin
    kotlin {
        //... 
        sourceSets {
            all { languageSettings.optIn("kotlin.time.ExperimentalTime") }
   
            commonMain.dependencies {
                implementation("org.jetbrains.kotlinx:kotlinx-datetime:%dateTimeVersion%")
            } 
        }
    }
    ```

3. **Build | Sync Project with Gradle Files** 메뉴 항목을 선택하거나 빌드 스크립트 에디터에서 **Sync Gradle Changes** 버튼을 클릭하여 Gradle 파일을 동기화합니다: ![Gradle 파일 동기화](gradle-sync.png){width=50}
4. `shared/src/commonMain/.../greetingkmp` 디렉토리를 우클릭하고 **New | Kotlin Class/File**을 선택하여 새 파일 `NewYear.kt`를 생성합니다.
5. `datetime` 날짜 연산을 사용하여 오늘부터 새해까지의 일수를 계산하는 간단한 함수로 파일을 업데이트합니다:
   
   ```kotlin
   fun daysUntilNewYear(): Int {
       val today = Clock.System.todayIn(TimeZone.currentSystemDefault())
       val closestNewYear = LocalDate(today.year + 1, 1, 1)
       return today.daysUntil(closestNewYear)
   }
   
   fun daysPhrase(): String = "There are only ${daysUntilNewYear()} days left until New Year! 🎆"
   ```
6. IDE의 안내에 따라 필요한 모든 import를 추가합니다. `Clock` 클래스는 `kotlin.time` 패키지에서 임포트해야 합니다.
7. `Greeting.kt` 파일에서 결과를 확인할 수 있도록 `Greeting` 클래스를 업데이트합니다:
    
    ```kotlin
    class Greeting {
        private val platform: Platform = getPlatform()
   
        fun greet(): `List<String>` = buildList {
            add(if (Random.nextBoolean()) "Hi!" else "Hello!")
            add("Guess what this is! > ${platform.name.reversed()}!")
            add(daysPhrase())
        }
    }
    ```

8. 결과를 확인하려면 IntelliJ IDEA에서 **composeApp** 및 **iosApp** 구성을 다시 실행하세요:

![외부 의존성이 추가된 모바일 멀티플랫폼 앱](first-multiplatform-project-3.png){width=500}

## 다음 단계

튜토리얼의 다음 파트에서는 프로젝트에 더 많은 의존성과 더 복잡한 로직을 추가해 보겠습니다.

**[다음 파트로 진행하기](multiplatform-upgrade-app.md)**

### 참고 항목

* 다양한 종류의 멀티플랫폼 의존성 활용법을 알아보세요: [Kotlin 라이브러리, Kotlin Multiplatform 라이브러리 및 기타 멀티플랫폼 프로젝트](multiplatform-add-dependencies.md).
* 플랫폼별 소스 세트에서 사용하기 위한 [Android 의존성 추가](multiplatform-android-dependencies.md) 및 [CocoaPods 유무에 따른 iOS 의존성 추가](multiplatform-ios-dependencies.md) 방법을 배워보세요.
* 샘플 프로젝트에서 [Android 및 iOS 라이브러리 사용 방법](multiplatform-samples.md) 예제를 확인해 보세요.

## 도움 받기

* **Kotlin Slack**: [초대](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)를 받고 [#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU) 채널에 참여하세요.
* **Kotlin 이슈 트래커**: [새로운 이슈를 보고](https://youtrack.jetbrains.com/newIssue?project=KT)하세요.