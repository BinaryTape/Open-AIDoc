[//]: # (title: Android 애플리케이션을 iOS에서 동작하게 만들기 – 튜토리얼)

<secondary-label ref="Android Studio"/>

이 튜토리얼에서는 기존 Android 애플리케이션을 크로스 플랫폼으로 만들어 Android와 iOS 모두에서 작동하도록 하는 방법을 보여줍니다. Android와 iOS용 코드를 한 곳에서 동시에 작성할 수 있게 됩니다.

이 튜토리얼은 사용자 이름과 비밀번호를 입력하는 단일 화면이 있는 [샘플 Android 애플리케이션](https://github.com/Kotlin/kmp-integration-sample)을 사용합니다. 자격 증명은 유효성 검사를 거쳐 인메모리 데이터베이스에 저장됩니다.

애플리케이션이 iOS와 Android 모두에서 작동하도록 하려면, 먼저 코드 일부를 공유 모듈(shared module)로 이동하여 코드를 크로스 플랫폼으로 만들어야 합니다. 그 후 Android 애플리케이션에서 크로스 플랫폼 코드를 사용하고, 새로운 iOS 애플리케이션에서도 동일한 코드를 사용하게 됩니다.

> Kotlin 멀티플랫폼이 익숙하지 않다면, 먼저 [처음부터 크로스 플랫폼 애플리케이션 만들기](quickstart.md)를 통해 기본 개념을 익히는 것이 좋습니다.
>
{style="tip"}

## 개발 환경 준비하기

1. 퀵스타트 가이드의 지침에 따라 [Kotlin 멀티플랫폼 개발을 위한 환경 설정](quickstart.md#set-up-the-environment)을 완료하세요.

   > iOS 애플리케이션 실행 등 이 튜토리얼의 특정 단계를 완료하려면 Apple의 요구 사항에 따라 macOS가 설치된 Mac이 필요합니다.
   >
   {style="note"}

2. Android Studio에서 버전 제어(Version Control)를 통해 새 프로젝트를 생성합니다.

   ```text
   https://github.com/Kotlin/kmp-integration-sample
   ```

   `master` 브랜치에는 단순한 Android 애플리케이션인 프로젝트의 초기 상태가 포함되어 있습니다. iOS 애플리케이션과 공유 모듈이 포함된 최종 상태를 보려면 `final` 브랜치로 전환하세요.
   
3. **Project** 뷰로 전환합니다.

   ![Project 뷰](switch-to-project.png){width="513"}

## 코드를 크로스 플랫폼으로 만들기

코드를 크로스 플랫폼으로 만들기 위해 다음 단계를 따릅니다.

1. [크로스 플랫폼으로 만들 코드 결정하기](#decide-what-code-to-make-cross-platform)
2. [크로스 플랫폼 코드를 위한 공유 모듈 생성하기](#create-a-shared-module-for-cross-platform-code)
3. [코드 공유 테스트하기](#add-code-to-the-shared-module)
4. [Android 애플리케이션에 공유 모듈 의존성 추가하기](#add-a-dependency-on-the-shared-module-to-your-android-application)
5. [비즈니스 로직을 크로스 플랫폼으로 만들기](#make-the-business-logic-cross-platform)
6. [Android에서 크로스 플랫폼 애플리케이션 실행하기](#run-your-cross-platform-application-on-android)

### 크로스 플랫폼으로 만들 코드 결정하기

Android 애플리케이션의 코드 중 어떤 코드를 iOS와 공유하고 어떤 코드를 네이티브로 유지할지 결정합니다. 간단한 규칙은 다음과 같습니다: 가능한 한 많이 재사용하고 싶은 부분을 공유하세요. 비즈니스 로직은 Android와 iOS 모두에서 동일한 경우가 많으므로 재사용하기에 아주 좋은 후보입니다.

샘플 Android 애플리케이션에서 비즈니스 로직은 `com.jetbrains.simplelogin.androidapp.data` 패키지에 저장되어 있습니다. 향후 만들 iOS 애플리케이션에서도 동일한 로직을 사용할 것이므로, 이 부분을 크로스 플랫폼으로 만들어야 합니다.

![공유할 비즈니스 로직](business-logic-to-share.png){width=366}

### 크로스 플랫폼 코드를 위한 공유 모듈 생성하기

iOS와 Android 모두에서 사용되는 크로스 플랫폼 코드는 공유 모듈에 저장됩니다. Android Studio와 IntelliJ IDEA는 모두 Kotlin 멀티플랫폼을 위한 공유 모듈 생성 마법사(wizard)를 제공합니다.

기존 Android 애플리케이션과 향후 생성할 iOS 애플리케이션을 모두 연결할 공유 모듈을 생성합니다.

1. Android Studio의 메인 메뉴에서 **File** | **New** | **New Module**을 선택합니다.
2. 템플릿 목록에서 **Kotlin Multiplatform Shared Module**을 선택합니다. 모듈 이름은 `shared`로 두고 패키지 이름을 입력합니다.
   
   ```text
   com.jetbrains.simplelogin.shared
   ```
   
3. **Finish**를 클릭합니다. 마법사가 공유 모듈을 생성하고, 빌드 스크립트를 적절하게 변경한 후 Gradle 동기화(sync)를 시작합니다.
4. 동기화가 완료될 때까지 기다립니다. `shared` 디렉터리에서 다음과 같은 파일 구조를 볼 수 있습니다.

   ![공유 디렉터리 내부의 최종 파일 구조](shared-directory-structure.png){width="341"}

   결과 프로젝트의 레이아웃을 더 잘 이해하고 싶다면, [Kotlin 멀티플랫폼 프로젝트 구조의 기초](multiplatform-discover-project.md)를 참조하세요.

5. `shared` 모듈은 Android 애플리케이션의 라이브러리로 사용될 것이므로, `shared/build.gradle.kts` 파일의 `kotlin.android {}` 블록을 다음 `androidLibrary {}` 블록으로 교체합니다.

    ```kotlin
    import org.jetbrains.kotlin.gradle.dsl.JvmTarget

    kotlin {
        androidLibrary {
            namespace = "com.jetbrains.simplelogin.shared"
            compileSdk = libs.versions.android.compileSdk.get().toInt()
            compilerOptions {
                jvmTarget = JvmTarget.JVM_11
            }
        
            androidResources {
                enable = true
            }
        
            withHostTestBuilder {
            }
        
            withDeviceTestBuilder {
                sourceSetTreeName = "test"
            }.configure {
                instrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
            }
        }
        //...
    }
    ```
   
### 공유 모듈에 코드 추가하기

이제 공유 모듈이 생겼으므로, `shared/src/commonMain/kotlin/com.jetbrains.simplelogin.shared` 디렉터리에 공유할 공통 코드를 추가합니다.

1. 다음 코드로 새로운 `Greeting` 클래스를 생성합니다.

    ```kotlin
    package com.jetbrains.simplelogin.shared

    class Greeting {
        private val platform = getPlatform()

        fun greet(): String {
            return "Hello, ${platform.name}!"
        }
    }
    ```

2. 기존 파일의 코드를 다음과 같이 교체합니다.

     * `commonMain/Platform.kt`:

         ```kotlin
         package com.jetbrains.simplelogin.shared
       
         interface Platform {
             val name: String
         }
        
         expect fun getPlatform(): Platform
         ```
     
     * `androidMain/Platform.android.kt`:

         ```kotlin
         package com.jetbrains.simplelogin.shared
         
         import android.os.Build

         class AndroidPlatform : Platform {
             override val name: String = "Android ${Build.VERSION.SDK_INT}"
         }

         actual fun getPlatform(): Platform = AndroidPlatform()
         ```
     * `iosMain/Platform.ios.kt`:

         ```kotlin
         package com.jetbrains.simplelogin.shared
       
         import platform.UIKit.UIDevice

         class IOSPlatform: Platform {
             override val name: String = UIDevice.currentDevice.systemName() + " " + UIDevice.currentDevice.systemVersion
         }

         actual fun getPlatform(): Platform = IOSPlatform()
         ```

이제 플랫폼 이름 속성을 가진 플랫폼별 객체를 반환하는 공통 `getPlatform()` 함수가 준비되었습니다.

### Android 애플리케이션에 공유 모듈 의존성 추가하기

Android 애플리케이션에서 크로스 플랫폼 코드를 사용하려면, 공유 모듈을 애플리케이션에 연결하고 비즈니스 로직 코드를 그곳으로 이동시킨 후 해당 코드를 크로스 플랫폼으로 만들어야 합니다.

1. `app/build.gradle.kts` 파일에 공유 모듈에 대한 의존성을 추가합니다.

    ```kotlin
    dependencies {
        // ...
        implementation(project(":shared"))
    }
    ```

2. IDE에서 제안하는 대로 또는 **File** | **Sync Project with Gradle Files** 메뉴 항목을 사용하여 Gradle 파일을 동기화합니다.
3. `app/src/main/java/` 디렉터리의 `com.jetbrains.simplelogin.androidapp.ui.login` 패키지에 있는 `LoginActivity.kt` 파일을 엽니다.
4. 공유 모듈이 애플리케이션에 성공적으로 연결되었는지 확인하기 위해, `onCreate()` 메서드에 `Log.i()` 호출을 추가하여 `greet()` 함수의 결과를 로그에 출력합니다.

    ```kotlin
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)

        Log.i("Login Activity", "Hello from shared module: " + (Greeting().greet()))
   
        // ...
    }
    ```
5. IDE의 제안에 따라 누락된 클래스를 임포트합니다.
6. 툴바의 실행 구성 드롭다운 옆에 있는 디버그 아이콘을 클릭합니다.

   ![디버그할 목록의 앱](app-list-android.png){width="300"}

7. **Logcat** 도구 창에서 로그에 "Hello"를 검색하면 공유 모듈로부터의 인사말을 찾을 수 있습니다.

   ![공유 모듈의 인사말](shared-module-greeting.png){width="700"}

### 비즈니스 로직을 크로스 플랫폼으로 만들기

이제 비즈니스 로직 코드를 Kotlin 멀티플랫폼 공유 모듈의 `commonMain` 소스 세트로 추출할 수 있습니다. 이를 통해 Android와 iOS 모두에서 코드를 사용할 수 있게 됩니다.

1. 비즈니스 로직 코드인 `com.jetbrains.simplelogin.androidapp.data`를 `app` 디렉터리에서 `shared/src/commonMain` 디렉터리의 `com.jetbrains.simplelogin.shared` 패키지로 이동합니다.

   ![비즈니스 로직 코드가 포함된 패키지를 드래그 앤 드롭](moving-business-logic.png){width=300}

2. Android Studio에서 수행할 작업을 묻는 메시지가 나타나면 패키지를 이동하도록 선택하고 리팩터링을 승인합니다.

   ![비즈니스 로직 패키지 리팩터링](refactor-business-logic-package.png){width=300}

3. 플랫폼 종속 코드에 대한 모든 경고를 무시하고 **Refactor Anyway**를 클릭합니다.

   ![플랫폼 종속 코드에 대한 경고](warnings-android-specific-code.png){width=450}

4. Android 전용 코드를 크로스 플랫폼 Kotlin 코드로 교체하거나, [expected 및 actual 선언](multiplatform-connect-to-apis.md)을 사용하여 Android 전용 API에 연결함으로써 이를 제거합니다. 자세한 내용은 다음 섹션을 참조하세요.

   #### Android 전용 코드를 크로스 플랫폼 코드로 교체 {initial-collapse-state="collapsed" collapsible="true"}
   
   코드가 Android와 iOS 모두에서 잘 작동하도록 하려면, 이동된 `data` 디렉터리 내의 모든 JVM 의존성을 가능한 한 Kotlin 의존성으로 교체합니다.

   1. `LoginDataValidator` 클래스에서 `android.utils` 패키지의 `Patterns` 클래스를 이메일 유효성 검사 패턴과 일치하는 Kotlin 정규식으로 교체합니다.
   
       ```kotlin
       // 수정 전
       private fun isEmailValid(email: String) = Patterns.EMAIL_ADDRESS.matcher(email).matches()
       ```
   
       ```kotlin
       // 수정 후
       private fun isEmailValid(email: String) = emailRegex.matches(email)
       
       companion object {
           private val emailRegex = 
               ("[a-zA-Z0-9\\+\\.\\_\\%\\-\\+]{1,256}" +
                   "\\@" +
                   "[a-zA-Z0-9][a-zA-Z0-9\\-]{0,64}" +
                   "(" +
                   "\\." +
                   "[a-zA-Z0-9][a-zA-Z0-9\\-]{0,25}" +
                   ")+").toRegex()
       }
       ```
   
   2. `Patterns` 클래스에 대한 임포트 문을 제거합니다.
   
       ```kotlin
       import android.util.Patterns
       ```

   3. `LoginDataSource` 클래스에서 `login()` 함수의 `IOException`을 `RuntimeException`으로 교체합니다. `IOException`은 Kotlin/JVM 외부에서는 사용할 수 없습니다.

          ```kotlin
          // 수정 전
          return Result.Error(IOException("Error logging in", e))
          ```

          ```kotlin
          // 수정 후
          return Result.Error(RuntimeException("Error logging in", e))
          ```

   4. `IOException`에 대한 임포트 문도 제거합니다.

       ```kotlin
       import java.io.IOException
       ```

   #### 플랫폼별 UUID 생성 구현 {initial-collapse-state="collapsed" collapsible="true"}
   
   `LoginDataSource` 클래스에서 `fakeUser`를 위한 범용 고유 식별자(UUID)는 iOS에서 사용할 수 없는 `java.util.UUID` 클래스를 사용하여 생성됩니다.
   
   ```kotlin
   val fakeUser = LoggedInUser(java.util.UUID.randomUUID().toString(), "Jane Doe")
   ```
   
   Kotlin 표준 라이브러리에서 [UUID 생성을 위한 클래스](https://kotlinlang.org/docs/uuids.html)를 제공하지만, 이 연습을 위해 플랫폼별 기능을 사용해 보겠습니다.
   
   공통 코드에서 `randomUUID()` 함수에 대한 `expect` 선언을 제공하고, 해당 소스 세트의 각 플랫폼(Android 및 iOS)에 대한 `actual` 구현을 제공합니다. [플랫폼별 API 연결](multiplatform-connect-to-apis.md)에 대해 자세히 알아볼 수 있습니다.
   
   1. `login()` 함수의 `java.util.UUID.randomUUID()` 호출을 각 플랫폼별로 구현할 `randomUUID()` 호출로 변경합니다.
   
       ```kotlin
       val fakeUser = LoggedInUser(randomUUID(), "Jane Doe")
       ```
   
   2. `shared/src/commonMain` 디렉터리의 `com.jetbrains.simplelogin.shared` 패키지에 `Utils.kt` 파일을 생성하고 `expect` 선언을 추가합니다.
   
       ```kotlin
       package com.jetbrains.simplelogin.shared
       
       expect fun randomUUID(): String
       ```
   
   3. `shared/src/androidMain` 디렉터리의 `com.jetbrains.simplelogin.shared` 패키지에 `Utils.android.kt` 파일을 생성하고 Android용 `randomUUID()`의 `actual` 구현을 추가합니다.
   
       ```kotlin
       package com.jetbrains.simplelogin.shared
       
       import java.util.*
      
       actual fun randomUUID() = UUID.randomUUID().toString()
       ```
   
   4. `shared/src/iosMain` 디렉터리의 `com.jetbrains.simplelogin.shared` 패키지에 `Utils.ios.kt` 파일을 생성하고 iOS용 `randomUUID()`의 `actual` 구현을 추가합니다.
   
       ```kotlin
       package com.jetbrains.simplelogin.shared
       
       import platform.Foundation.NSUUID
      
       actual fun randomUUID(): String = NSUUID().UUIDString()
       ```
   
   5. `shared/src/commonMain` 디렉터리의 `LoginDataSource.kt` 파일에서 `randomUUID` 함수를 임포트합니다.
   
      ```kotlin
      import com.jetbrains.simplelogin.shared.randomUUID
      ```
   
이제 Kotlin은 Android와 iOS에서 각 플랫폼별 UUID 구현을 사용하게 됩니다.

### Android에서 크로스 플랫폼 애플리케이션 실행하기

`app` 실행 구성을 실행하여 Android 앱이 이전처럼 잘 작동하는지 확인합니다.

![Android 로그인 애플리케이션](android-login.png){width=300}

## 크로스 플랫폼 애플리케이션을 iOS에서 동작하게 만들기

Android 애플리케이션을 크로스 플랫폼으로 만들었으므로, 이제 iOS 애플리케이션을 생성하고 그 안에서 공유 비즈니스 로직을 재사용할 수 있습니다.

1. [Xcode에서 iOS 프로젝트 생성하기](#create-an-ios-project-in-xcode)
2. [KMP 프레임워크를 사용하도록 iOS 프로젝트 구성하기](#configure-the-ios-project-to-use-a-kmp-framework)
3. [Android Studio에서 iOS 실행 구성 설정하기](#set-up-an-ios-run-configuration-in-android-studio)
4. [iOS 프로젝트에서 공유 모듈 사용하기](#use-the-shared-module-in-the-ios-project)

### Xcode에서 iOS 프로젝트 생성하기

1. Xcode에서 **File** | **New** | **Project**를 클릭합니다.
2. 대화 상자에서 **iOS** 탭으로 전환합니다.

   ![iOS 프로젝트 템플릿](ios-project-wizard-1.png){width=700}

3. **App** 템플릿을 선택하고 **Next**를 클릭합니다.

4. 제품 이름(Product Name)에 "simpleLoginIOS"를 지정하고 **Next**를 클릭합니다.

   ![iOS 프로젝트 설정](ios-project-wizard-2.png){width=700}

5. 프로젝트 위치로 크로스 플랫폼 애플리케이션이 저장된 디렉터리(예: `kmp-integration-sample`)를 선택합니다.

    Android Studio에서는 다음과 같은 구조를 갖게 됩니다.
    
    ![Android Studio의 iOS 프로젝트](ios-project-in-as.png){width=194}

6. 크로스 플랫폼 프로젝트의 다른 최상위 디렉터리와 일관성을 유지하기 위해 Xcode를 닫고 `simpleLoginIOS` 디렉터리의 이름을 `iosApp`으로 변경합니다.

   > Xcode가 열려 있는 상태에서 폴더 이름을 변경하면 경고가 발생하고 프로젝트가 손상될 수 있습니다.
   >
   {style="warning"}

   ![Android Studio에서 이름이 변경된 iOS 프로젝트 디렉터리](ios-directory-renamed-in-as.png){width=194}

### KMP 프레임워크를 사용하도록 iOS 프로젝트 구성하기

iOS 앱과 Kotlin 멀티플랫폼에 의해 빌드된 프레임워크 간의 통합을 직접 설정할 수 있습니다.

> 이 방법의 대안(SwiftPM 및 CocoaPods)은 [iOS 통합 방법 개요](multiplatform-ios-integration-overview.md)에서 다루고 있습니다.
> 
{style="note"}

1. Android Studio에서 `iosApp/simpleLoginIOS.xcodeproj` 디렉터리를 우클릭하고 **Open In** | **Open In Associated Application**을 선택하여 Xcode에서 iOS 프로젝트를 엽니다.
2. Xcode의 **Project** 네비게이터에서 프로젝트 이름을 클릭하여 iOS 프로젝트 설정을 엽니다.

3. 왼쪽의 **Targets** 섹션에서 **simpleLoginIOS**를 선택한 다음 **Build Phases** 탭을 클릭합니다.

4. **+** 아이콘을 클릭하고 **New Run Script Phase**를 선택합니다.

    ![Run Script Phase 추가](xcode-run-script-phase-1.png){width=700}

5. Run Script 필드에 다음 스크립트를 붙여넣습니다.

    ```bash
    if [ "YES" = "$OVERRIDE_KOTLIN_BUILD_IDE_SUPPORTED" ]; then
        echo "Skipping Gradle build task invocation due to OVERRIDE_KOTLIN_BUILD_IDE_SUPPORTED environment variable set to \"YES\""
        exit 0
    fi
    cd "$SRCROOT/.."
    ./gradlew :shared:embedAndSignAppleFrameworkForXcode
    ```

6. **Based on dependency analysis** 옵션을 비활성화합니다.
   이렇게 하면 Xcode가 빌드할 때마다 스크립트를 실행하고, 출력 의존성 누락에 대해 매번 경고하지 않도록 보장합니다.

   ![스크립트 추가](xcode-run-script-phase-2.png){width=700}

7. **Run Script** 단계를 위로 이동하여 **Compile Sources** 단계 앞에 배치합니다.

   ![Run Script 단계 이동](xcode-run-script-phase-3.png){width=700}

8. **Build Settings** 탭의 **Build Options** 아래에서 **User Script Sandboxing** 옵션을 비활성화합니다.

   ![User Script Sandboxing](disable-sandboxing-in-xcode-project-settings.png){width=700}

   > 기본값인 `Debug` 또는 `Release`와 다른 커스텀 빌드 구성을 사용하는 경우, **Build Settings** 탭의 **User-Defined** 아래에 `KOTLIN_FRAMEWORK_BUILD_TYPE` 설정을 추가하고 `Debug` 또는 `Release`로 설정하세요.
   >
   {style="note"}

9. **Info** 탭에서 커스텀 `CADisableMinimumFrameDurationOnPhone` 속성을 추가하고 `YES`로 설정하여 iOS에서 높은 화면 재생률(high refresh rate)을 활성화합니다.

10. **Signing & Capabilities** 탭에서 개발 팀(development team)을 선택하거나 아직 없다면 생성합니다. 이를 통해 KMP 모듈에서 생성된 `shared` 프레임워크를 서명할 수 있습니다.

    여기에서 **Bundle Identifier**가 고유한 값으로 설정되어 있는지 확인해야 합니다. 그렇지 않으면 Xcode 빌드가 실패할 수 있습니다.

11. Xcode에서 프로젝트를 빌드합니다(메인 메뉴의 **Product** | **Build**). 모든 설정이 올바르면 프로젝트가 성공적으로 빌드되어야 합니다 ("build phase will be run during every build" 경고는 무시해도 됩니다).
   
    > **User Script Sandboxing** 옵션을 비활성화하기 전에 프로젝트를 빌드했다면 빌드가 실패할 수 있습니다. Gradle 데몬 프로세스가 샌드박스에 갇혀 있을 수 있으므로 재시작해야 합니다. 프로젝트 디렉터리(이 예제에서는 `kmp-integration-sample`)에서 다음 명령을 실행하여 프로세스를 중지한 후 다시 빌드하세요.
    > 
    > ```shell
    > ./gradlew --stop
    > ```
    > 
    {style="note"}

### Android Studio에서 iOS 실행 구성 설정하기

Xcode 설정이 올바른지 확인했다면 Android Studio로 돌아갑니다.

1. 메인 메뉴에서 **File | Sync Project with Gradle Files**를 선택합니다. Android Studio가 자동으로 **simpleLoginIOS**라는 실행 구성을 생성합니다.

   Android Studio는 자동으로 **simpleLoginIOS**라는 실행 구성을 생성하고 `iosApp` 디렉터리를 연결된 Xcode 프로젝트로 표시합니다.

2. 실행 구성 목록에서 **simpleLoginIOS**를 선택합니다. iOS 에뮬레이터를 선택한 다음 **Run**을 클릭하여 iOS 실행 구성이 올바르게 작동하는지 확인합니다.

   ![실행 구성 목록의 iOS 실행 구성](ios-run-configuration-simplelogin.png)

### iOS 프로젝트에서 공유 모듈 사용하기

`shared/build.gradle.kts` 파일은 각 iOS 타겟에 대한 `binaries.framework.baseName` 속성을 `sharedKit`으로 정의합니다. 이것이 iOS 앱에서 사용할 수 있도록 Kotlin 멀티플랫폼이 빌드하는 프레임워크의 이름입니다.

통합을 테스트하기 위해 Swift 코드에서 공통 코드를 호출해 보겠습니다.

1. Android Studio에서 `iosApp/simpleloginIOS/ContentView.swift` 파일을 열고 프레임워크를 임포트합니다.

   ```swift
   import sharedKit
   ```

2. 제대로 연결되었는지 확인하기 위해, `shared` 모듈의 `greet()` 함수를 사용하도록 `ContentView` 구조체의 코드를 업데이트합니다.

   ```swift
   struct ContentView: View {
       var body: some View {
           Text(Greeting().greet())
           .padding()
       }
   }
   ```

3. Android Studio의 iOS 실행 구성을 사용하여 앱을 실행하고 결과를 확인합니다.

   ![공유 모듈의 인사말](xcode-iphone-hello.png){width=300}

4. `ContentView.swift` 파일의 코드를 다시 업데이트하여 공유 모듈의 비즈니스 로직을 사용해 애플리케이션 UI를 렌더링하도록 합니다.

   ```kotlin
   
   ```

5. `simpleLoginIOSApp.swift` 파일에서 `sharedKit` 모듈을 임포트하고 `ContentView()` 함수의 인수를 지정합니다.

    ```swift
    import SwiftUI
    import sharedKit
    
    @main
    struct SimpleLoginIOSApp: App {
        var body: some Scene {
            WindowGroup {
                ContentView(viewModel: .init(loginRepository: LoginRepository(dataSource: LoginDataSource()), loginValidator: LoginDataValidator()))
            }
        }
    }
    ```

6. iOS 실행 구성을 다시 실행하여 iOS 앱에 로그인 양식이 나타나는지 확인합니다.
7. 사용자 이름으로 "Jane"을, 비밀번호로 "password"를 입력합니다.
8. [앞서 통합을 설정](#configure-the-ios-project-to-use-a-kmp-framework)했으므로, iOS 앱은 공통 코드를 사용하여 입력을 검증합니다.

   ![간단한 로그인 애플리케이션](xcode-iphone-login.png){width=300}

## 결과 확인 – 로직을 한 번만 업데이트하세요

이제 애플리케이션이 크로스 플랫폼이 되었습니다. `shared` 모듈에서 비즈니스 로직을 업데이트하면 Android와 iOS 모두에서 결과를 볼 수 있습니다.

1. 사용자 비밀번호에 대한 유효성 검사 로직을 변경합니다. "password"는 유효한 옵션이 아니어야 합니다. 이를 위해 `LoginDataValidator` 클래스의 `checkPassword()` 함수를 업데이트합니다 (빨리 찾으려면 <shortcut>Shift</shortcut>를 두 번 누르고 클래스 이름을 붙여넣은 다음 **Classes** 탭으로 전환하세요).

   ```kotlin
   package com.jetbrains.simplelogin.shared.data
   
   class LoginDataValidator {
   //...
       fun checkPassword(password: String): Result {
           return when {
               password.length < 5 -> Result.Error("Password must be >5 characters")
               password.lowercase() == "password" -> Result.Error("Password shouldn't be \"password\"")
               else -> Result.Success
           }
       }
   //...
   }
   ```

2. Android Studio에서 iOS와 Android 애플리케이션을 모두 실행하여 변경 사항을 확인합니다 (iOS 오류 메시지는 빨간색 경고 삼각형을 누르면 나타납니다).

   ![Android 및 iOS 애플리케이션 비밀번호 오류](android-iphone-password-error.png){width=600}

이 [튜토리얼의 최종 코드](https://github.com/Kotlin/kmp-integration-sample/tree/final)를 검토할 수 있습니다.

## 그 외 무엇을 공유할 수 있을까요?

애플리케이션의 비즈니스 로직을 공유했지만, 애플리케이션의 다른 레이어도 공유하도록 결정할 수 있습니다. 예를 들어, `ViewModel` 클래스 코드는 [Android](https://github.com/Kotlin/kmp-integration-sample/blob/final/app/src/main/java/com/jetbrains/simplelogin/androidapp/ui/login/LoginViewModel.kt)와 [iOS 애플리케이션](https://github.com/Kotlin/kmp-integration-sample/blob/final/iosApp/SimpleLoginIOS/ContentView.swift#L84)에서 거의 동일하며, 모바일 애플리케이션이 동일한 프레젠테이션 레이어를 가져야 한다면 이를 공유할 수 있습니다.

## 다음 단계는?

Android 애플리케이션을 크로스 플랫폼으로 만들었다면 다음 단계로 진행할 수 있습니다.

* [멀티플랫폼 라이브러리에 대한 의존성 추가하기](multiplatform-add-dependencies.md)
* [Android 의존성 추가하기](multiplatform-android-dependencies.md)
* [iOS 의존성 추가하기](multiplatform-ios-dependencies.md)

Compose Multiplatform을 사용하여 모든 플랫폼에서 통합된 UI를 만들 수 있습니다.

* [Compose Multiplatform 및 Jetpack Compose에 대해 알아보기](compose-multiplatform-and-jetpack-compose.md)
* [Compose Multiplatform 가용 리소스 탐색하기](compose-multiplatform-resources.md)
* [공유 로직과 UI가 있는 앱 만들기](compose-multiplatform-create-first-app.md)

커뮤니티 리소스도 확인해 보세요.

* [비디오: Android 프로젝트를 Kotlin 멀티플랫폼으로 마이그레이션하는 방법](https://www.youtube.com/watch?v=vb-Pt8SdfEE&t=1s)
* [비디오: Kotlin JVM 코드를 Kotlin 멀티플랫폼에 맞게 준비하는 3가지 방법](https://www.youtube.com/watch?v=X6ckI1JWjqo)