[//]: # (title: AGP 9를 사용하기 위한 Android 앱 포함 멀티플랫폼 프로젝트 업데이트)
<show-structure for="chapter,procedure" depth="3"/>

Android Gradle 플러그인(AGP) 9.0 이상과 함께 사용할 때,
Kotlin 멀티플랫폼 Gradle 플러그인은 `com.android.application` 및 `com.android.library` 플러그인과 더 이상 호환되지 않습니다.

프로젝트를 업데이트하려면 다음을 수행하세요:
* 현재 Android 진입점(entry point)이 공용 코드 모듈에 구현되어 있다면, Gradle 플러그인 충돌을 피하기 위해 이를 별도의 모듈로 추출하세요.
* 공용 코드 모듈을 멀티플랫폼 프로젝트를 위해 특별히 제작된 새로운 [Android-KMP 라이브러리 플러그인](https://developer.android.com/kotlin/multiplatform/plugin)을 사용하도록 마이그레이션하세요.

<video src="https://www.youtube.com/v/m0Cq6J-V_RY" title="Kotlin 프로젝트를 Android Gradle 플러그인 9.0으로 마이그레이션하기"/>

> Android Studio는 Otter 3 Feature Drop 2025.2.3부터 AGP 9.0.0을 지원합니다.
> IntelliJ IDEA의 AGP 9.0.0 지원은 2026년 1분기로 예정되어 있습니다.
> 
{style="note"}

## Android-KMP 라이브러리 플러그인으로 마이그레이션

이전에는 멀티플랫폼 모듈에서 Android 타겟을 구성하기 위해 KMP 플러그인(`org.jetbrains.kotlin.multiplatform`)을
Android 애플리케이션 플러그인(`com.android.application`) 또는 Android 라이브러리 플러그인(`com.android.library`)과 함께 사용해야 했습니다.

AGP 9.0부터 이러한 플러그인들은 KMP와 더 이상 호환되지 않으므로, KMP를 위해 특별히 제작된 새로운 Android-KMP 라이브러리 플러그인으로 마이그레이션해야 합니다.

### 마이그레이션 방법

라이브러리 마이그레이션 단계는 [Android 문서의 가이드](https://developer.android.com/kotlin/multiplatform/plugin#migrate)를 참조하세요.

Android 앱 프로젝트를 마이그레이션하려면 Android 진입점과 공용 코드가 적절히 구성된 별도의 모듈에 있어야 합니다.
다음은 샘플 앱 마이그레이션을 위한 일반적인 튜토리얼로, 다음 내용을 확인할 수 있습니다:
* [Android 앱 진입점을 별도의 모듈로 추출하는 방법](#android-app)
* [공용 모듈의 구성을 업데이트하는 방법](#configure-the-shared-module-to-use-the-android-kmp-library-plugin)

> [준비된 스킬(skill)](https://github.com/Kotlin/kotlin-agent-skills/blob/main/skills/kotlin-tooling-agp9-migration/SKILL.md)을 사용하여 원하는 AI 에이전트에게 마이그레이션을 맡길 수 있습니다. 
> AI 처리 결과는 완전히 예측 가능하지 않을 수 있다는 점에 유의하세요.
>
{style="note"}

### AGP 10 전까지 레거시 API 활성화

단기적으로 AGP 9.0에서 프로젝트를 작동시키려면 지원 중단된(deprecated) API를 수동으로 활성화할 수 있습니다.
이를 위해 프로젝트의 `gradle.properties` 파일에 다음 프로퍼티를 추가하세요:
`android.enableLegacyVariantApi=true`.

레거시 API는 2026년 하반기에 출시될 예정인 [AGP 10에서 완전히 제거](https://developer.android.com/build/releases/gradle-plugin-roadmap#agp-10)될 예정입니다.
그전에 마이그레이션을 완료하시기 바랍니다.

## 샘플 앱 마이그레이션

마이그레이션을 위해 준비할 예제 프로젝트는 [나만의 애플리케이션 만들기](compose-multiplatform-new-project.md) 튜토리얼의 결과물인 Compose Multiplatform 앱입니다.
* 업데이트가 필요한 앱의 예제가 포함된 샘플은 샘플 저장소의 [main](https://github.com/kotlin-hands-on/get-started-with-cm/tree/main) 브랜치에 있습니다.
* `androidApp`이 분리된 앱의 최종 상태는 [new-project-structure](https://github.com/kotlin-hands-on/get-started-with-cm/tree/new-project-structure) 브랜치에서 확인할 수 있습니다.
이 브랜치에는 다른 플랫폼을 위해 분리된 앱 모듈의 예제도 포함되어 있습니다.

<!-- When the new structure is implemented in the wizard, this is going to change: 
     following the tutorial will bring you to the new structure already.
     So when the update hits we update with the following:

The sample with an example of older structure is in the [old-project-structure](https://github.com/kotlin-hands-on/get-started-with-cm/tree/old-project-structure)
branch of the sample repository. -->

이 샘플은 모든 공용 코드와 KMP 진입점을 포함하는 단일 Gradle 모듈(`composeApp`)과 iOS 전용 코드 및 구성이 포함된 `iosApp` 프로젝트로 구성되어 있습니다.

AGP 9.0 마이그레이션을 준비하려면 다음을 수행합니다:

* [Android 앱 진입점을 추출](#android-app)하여 별도의 `androidApp` 모듈로 만듭니다.
* 공용 코드가 포함된 모듈(`composeApp`)이 Android-KMP 라이브러리 플러그인을 사용하도록 [재구성](#configure-the-shared-module-to-use-the-android-kmp-library-plugin)합니다.

### Android 앱 진입점을 위한 모듈 {id="android-app"}

#### Android 앱 모듈 생성 및 구성

Android 앱 모듈(`androidApp`)을 생성하려면 다음을 수행하세요:

1. 프로젝트 루트에 `androidApp` 디렉토리를 생성합니다.
2. 해당 디렉토리 안에 빈 `build.gradle.kts` 파일과 `src` 디렉토리를 생성합니다.
3. `settings.gradle.kts` 파일의 끝에 다음 줄을 추가하여 프로젝트 설정에 새 모듈을 추가합니다:

    ```kotlin
    include(":androidApp")
    ```
4. 메인 메뉴에서 **Build | Sync Project with Gradle Files**를 선택하거나 에디터에서 Gradle 새로고침 버튼을 클릭합니다.

#### Android 앱의 빌드 스크립트 구성

새 모듈의 Gradle 빌드 스크립트를 구성합니다:

1. `gradle/libs.versions.toml` 파일의 버전 카탈로그에 Kotlin Android Gradle 플러그인을 추가합니다:

    ```text
    [plugins]
    kotlinAndroid = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
    ```

2. `androidApp/build.gradle.kts` 파일에 Android 앱 모듈에 필요한 플러그인을 지정합니다:

    ```kotlin
    plugins {
       alias(libs.plugins.kotlinAndroid)
       alias(libs.plugins.androidApplication)
       alias(libs.plugins.composeMultiplatform)
       alias(libs.plugins.composeCompiler)
    }
    ```

3. **루트** `build.gradle.kts` 파일에 이러한 플러그인들이 모두 명시되어 있는지 확인하세요:

    ```kotlin
    plugins {
        alias(libs.plugins.kotlinAndroid) apply false
        alias(libs.plugins.androidApplication) apply false
        alias(libs.plugins.composeMultiplatform) apply false
        alias(libs.plugins.composeCompiler) apply false
        // ...
    }
    ```

4. 필요한 의존성을 추가하기 위해 `composeApp` 빌드 스크립트의 `androidMain.dependencies {}` 블록에서 기존 의존성을 복사하고, `composeApp` 모듈 자체에 대한 의존성을 추가합니다. 
   이 예제에서 결과는 다음과 같아야 합니다:

   ```kotlin
   kotlin {
       dependencies { 
           implementation(projects.composeApp)
           implementation(libs.androidx.activity.compose)
           implementation(libs.compose.uiToolingPreview)
       }
   }
   ```

5. `composeApp/build.gradle.kts` 파일에서 Android 전용 구성이 포함된 `android {}` 블록 전체를 `androidApp/build.gradle.kts` 파일로 복사합니다. 

6. `composeApp/build.gradle.kts` 파일의 `androidTarget {}` 블록에서 컴파일러 옵션을 `androidApp/build.gradle.kts` 파일의 `target {}` 블록으로 복사합니다:

    ```kotlin
    target {
        compilerOptions {
            jvmTarget.set(JvmTarget.JVM_11)
        }
    }
    ```

   > `composeApp` 빌드 스크립트에 설정된 다른 플러그인이나 프로퍼티가 있다면, 그것들도 `androidApp` 빌드 스크립트로 마이그레이션해야 합니다.
   >
   {style="note"}

7. `composeApp` 모듈의 구성을 Android 애플리케이션에서 Android 라이브러리로 변경합니다. 이것이 실제로 해당 모듈이 수행하게 될 역할이기 때문입니다. `composeApp/build.gradle.kts`에서 다음을 수행하세요:
   * Gradle 플러그인 참조를 변경합니다:

       <compare type="top-bottom">
          <code-block lang="kotlin" code="              alias(libs.plugins.androidApplication)"></code-block>
          <code-block lang="kotlin" code="              alias(libs.plugins.androidLibrary)"></code-block>
       </compare>
   
    * `android.defaultConfig {}` 블록에서 애플리케이션 프로퍼티 라인을 제거합니다:

      <compare type="top-bottom">
          <code-block lang="kotlin" code="              defaultConfig {&#10;                  applicationId = &quot;com.jetbrains.demo&quot;&#10;                  minSdk = libs.versions.android.minSdk.get().toInt()&#10;                  targetSdk = libs.versions.android.targetSdk.get().toInt()&#10;                  versionCode = 1&#10;                  versionName = &quot;1.0&quot;&#10;              }"></code-block>
          <code-block lang="kotlin" code="              defaultConfig {&#10;                  minSdk = libs.versions.android.minSdk.get().toInt()&#10;              }"></code-block>
       </compare>
   
8. 메인 메뉴에서 **Build | Sync Project with Gradle Files**를 선택하거나 에디터에서 Gradle 새로고침 버튼을 클릭합니다.

#### 코드 이동 및 Android 앱 실행

1. `composeApp/src/androidMain` 디렉토리를 `androidApp/src/` 디렉토리로 이동시키되, 멀티플랫폼으로 유지되어야 하는 코드를 유의하세요:
   
   * 우리 샘플의 `MainActivity.kt`와 같은 진입점 코드는 Android 앱을 올바르게 빌드하기 위해 `androidApp` 모듈에 있어야 합니다.
   * 모든 [기대 선언 및 실제 구현(expected and actual declarations)](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)은 모든 플랫폼에서 사용할 수 있도록 공용 모듈(예제의 `composeApp`)의 소스 세트에 남아 있어야 합니다.
     `androidApp`이 `composeApp`을 의존하도록 설정했으므로, 해당 선언들은 진입점 코드에서도 사용할 수 있게 됩니다.
   
2. `androidApp/src/androidMain` 디렉토리의 이름을 `main`으로 바꿉니다.
3. 모든 것이 올바르게 구성되었다면, `androidApp/src/main/.../MainActivity.kt` 파일의 임포트가 작동하고 코드가 컴파일됩니다.
4. IntelliJ IDEA 또는 Android Studio를 사용하는 경우, IDE가 새 모듈을 인식하고 자동으로 새로운 실행 구성인 **androidApp**을 생성합니다.
   만약 생성되지 않는다면, **composeApp** Android 실행 구성을 수동으로 수정하세요:
   1. 실행 구성 드롭다운에서 **Edit Configurations**를 선택합니다.
   2. **Android** 카테고리에서 **composeApp** 구성을 찾습니다.
   3. **General | Module** 필드에서 `demo.composeApp`을 `demo.androidApp`으로 변경합니다.
5. 앱이 예상대로 실행되는지 확인하기 위해 새 실행 구성을 시작합니다.
6. 모든 것이 올바르게 작동한다면, `composeApp/build.gradle.kts` 파일에서 `kotlin.sourceSets.androidMain.dependencies {}` 블록을 제거합니다.

이제 Android 진입점을 별도의 모듈로 추출했습니다. 이제 공용 코드 모듈이 새로운 Android-KMP 라이브러리 플러그인을 사용하도록 업데이트하세요.

### 공용 모듈이 Android-KMP 라이브러리 플러그인을 사용하도록 구성

단순히 Android 진입점을 추출하기 위해 공용 `composeApp` 모듈에 `com.android.library` 플러그인을 적용했습니다. 이제 새로운 멀티플랫폼 라이브러리 플러그인으로 마이그레이션합니다:

1. `gradle/libs.versions.toml`의 버전 카탈로그에 Android-KMP 라이브러리 플러그인을 추가합니다:

    ```text
    [plugins]
    androidMultiplatformLibrary = { id = "com.android.kotlin.multiplatform.library", version.ref = "agp" }
    ```

2. `composeApp/build.gradle.kts` 파일에서 기존 Android 라이브러리 플러그인을 새 플러그인으로 교체합니다:

    <compare type="top-bottom">
        <code-block lang="kotlin" code="            alias(libs.plugins.androidLibrary)"></code-block>
        <code-block lang="kotlin" code="            alias(libs.plugins.androidMultiplatformLibrary)"></code-block>
    </compare>
3. 루트 `build.gradle.kts` 파일에 다음 줄을 추가하여 플러그인 적용 시 충돌을 방지합니다:

    ```kotlin
    alias(libs.plugins.androidMultiplatformLibrary) apply false
    ```
4. `composeApp/build.gradle.kts` 파일에서 `kotlin.androidTarget {}` 블록 대신 `kotlin.androidLibrary {}` 블록을 추가합니다:

    ```kotlin
    androidLibrary {
        namespace = "compose.project.demo.composedemo"
        compileSdk = libs.versions.android.compileSdk.get().toInt()
    
        compilerOptions {
            jvmTarget.set(JvmTarget.JVM_11)
        }
    
        androidResources {
            enable = true
        }
    }
    ```
5. `composeApp/build.gradle.kts` 파일에서 `android {}` 블록을 제거합니다. 이는 이제 `kotlin.androidLibrary {}` 구성으로 대체되었습니다.
6. 새로운 Android KMP 라이브러리 플러그인은 빌드 변형(build variants)을 지원하지 않으므로, `dependencies {}` 블록에서 `debugImplementation(libs.compose.uiTooling)` 줄을 `androidRuntimeClasspath(libs.compose.uiTooling)`으로 교체합니다.
7. 메인 메뉴에서 **Build | Sync Project with Gradle Files**를 선택하거나 에디터에서 Gradle 새로고침 버튼을 클릭합니다.
8. Android 앱이 예상대로 실행되는지 확인합니다.

### Android Gradle 플러그인 버전 업데이트

모든 코드가 새 구성에서 작동할 때:

1. 지침을 따랐다면 새 앱 모듈에 대해 작동하는 실행 구성이 있을 것입니다.
      `composeApp` 모듈과 관련된 더 이상 필요 없는 실행 구성은 삭제해도 됩니다.
2. `gradle/libs.versions.toml` 파일에서 AGP를 9.* 버전으로 업데이트합니다. 예:

    ```text
    [versions]
    agp = "9.0.0"
    ```
3. `gradle/wrapper/gradle-wrapper.properties` 파일의 Gradle 버전을 최소 9.1.0으로 업데이트합니다:

    ```text
    distributionUrl=https\://services.gradle.org/distributions/gradle-9.1.0-bin.zip
    ```
4. [AGP 9.0부터 Kotlin 지원이 내장](https://developer.android.com/build/migrate-to-built-in-kotlin)되어 Kotlin Android 플러그인을 적용할 필요가 없으므로, `androidApp/build.gradle.kts` 파일에서 다음 줄을 제거합니다:

    ```kotlin
    alias(libs.plugins.kotlinAndroid)
    ```
5. `composeApp/build.gradle.kts` 파일의 `kotlin.androidLibrary {}` 블록에 있는 네임스페이스가 앱의 네임스페이스와 충돌하지 않도록 업데이트합니다. 예를 들어:

    ```kotlin
    kotlin {
        androidLibrary {
            namespace = "compose.project.demo.composedemolibrary"
            // ...
    ```
   
6. 빌드 스크립트 에디터에서 메인 메뉴의 **Build | Sync Project with Gradle Files**를 선택하거나 Gradle 새로고침 버튼을 클릭합니다.

7. 앱이 새 AGP 버전으로 빌드되고 실행되는지 확인합니다.

축하합니다! 프로젝트를 AGP 9.0과 호환되도록 업그레이드했습니다.

<!-- Commented out for now
## What's next

Check out the [recommended project structure](multiplatform-project-recommended-structure.md)
which follows the logic of separating entry points for any app target you might have. -->