[//]: # (title: 권장되는 Kotlin Multiplatform 프로젝트 구조)
<show-structure for="chapter,procedure" depth="3"/>

[기본](multiplatform-discover-project.md) 및 [심화](multiplatform-advanced-project-structure.md) 프로젝트 구조 개념에 대한 개요를 통해 소스 세트와 의존성 관리에 대해 이해하셨을 것입니다.
그렇다면 소스 세트를 구성하고 의존성을 사용하는 모듈은 어떻게 관리해야 할까요?

> 이 문서는 특히 KMP 프로젝트에 대해 설명합니다.
> 모듈화 의사 결정에 대한 일반적인 이해를 원하시면 [Android의 모듈화 소개](https://developer.android.com/topic/modularization)를 참조하세요.

## 최적의 모듈 구조

최적의 모듈 구조는 목표와 필요한 타겟에 따라 달라질 수 있습니다.
다양한 구성과 타겟 세트를 사용하여 [KMP IDE 플러그인 마법사]()의 결과물을 분석해 보며 프로젝트가 기본적으로 어떻게 구성되는지 확인할 수 있습니다.

일반적인 접근 방식은 다음과 같습니다:
* 앱의 진입점(Entry point)은 별도의 모듈에 포함되어야 하며, 각 모듈은 필요한 공유 코드 모듈에 의존합니다.
* 공유 코드는 일반적으로 비즈니스 로직과 UI로 나뉘며, 불필요한 의존성을 피하는 전략을 사용합니다:
  * KMP 프로젝트에서 생성된 모든 앱이 공유 UI 코드와 공유 비즈니스 로직을 모두 사용하는 경우, 모든 공유 코드를 위한 단일 `shared` 모듈로 충분할 수 있습니다.
  * 앱 중 하나의 UI가 네이티브 코드(예: iOS UI를 순수 Swift로 구현한 경우)로 작성된 경우, UI 코드를 비즈니스 로직에서 분리하여 Compose Multiplatform 의존성이 필요 없는 곳에 포함되지 않도록 하는 것이 좋습니다.
    따라서 `sharedLogic`과 `sharedUI` 모듈을 따로 두고, 필요에 따라 진입점 모듈에 의존성으로 추가할 수 있습니다.
* 프로젝트에 클라이언트 앱과 로직을 공유해야 하는 서버 코드가 포함된 경우, 다음과 같은 구조를 권장합니다:
  * 위에서 설명한 대로 구성된 진입점 모듈과 클라이언트 공통 코드 모듈이 포함된 `app` 폴더.
  * 서버 전용 코드가 포함된 `server` 모듈.
  * 모델 및 유효성 검사와 같이 서버와 클라이언트 간에 공유되는 코드를 위한 `core` 모듈.

프로젝트가 앱 진입점과 공유 코드가 단일 모듈에 포함된 이전 구조를 사용하는 경우, 아래 가이드를 따라 진입점을 별도의 모듈로 추출할 수 있습니다.

> Android Gradle Plugin 9 이상을 사용하려면 Android 앱 진입점을 공통 코드에서 분리하는 것이 필수입니다.
> 자세한 내용은 [AGP 9 마이그레이션 문서](multiplatform-project-agp-9-migration.md)를 참조하세요.
> 
{style="note"}

## 앱 진입점을 위한 별도 모듈 생성

권장 구조로의 전환을 설명하기 위해 사용할 예제 프로젝트는 [old-project-structure](https://github.com/kotlin-hands-on/get-started-with-cm/tree/old-project-structure) 브랜치에서 찾을 수 있는 이전 Compose Multiplatform 샘플입니다.

이 예제는 모든 공유 코드와 KMP 진입점을 포함하는 단일 Gradle 모듈(`composeApp`)과 iOS 프로젝트 코드 및 설정이 포함된 `iosApp` 폴더로 구성되어 있습니다.

진입점을 자체 모듈로 추출하려면 모듈을 생성하고, 코드를 이동하고, 새 모듈과 공통 코드 모듈 모두에 대해 설정을 적절히 조정해야 합니다.

### 데스크톱 JVM 앱

#### 데스크톱 앱 모듈 생성 및 설정

데스크톱 앱 모듈(`desktopApp`)을 생성하려면 다음을 수행하세요:

1. 프로젝트 루트에 `desktopApp` 디렉토리를 생성합니다.
2. 해당 디렉토리 안에 빈 `build.gradle.kts` 파일과 `src` 디렉토리를 생성합니다.
3. `settings.gradle.kts` 파일에 다음 라인을 추가하여 새 모듈을 프로젝트 설정에 추가합니다:

    ```kotlin
    include(":desktopApp")
    ```

#### 데스크톱 앱용 빌드 스크립트 구성

데스크톱 앱 빌드 스크립트가 작동하도록 하려면 다음을 수행하세요:

1. `gradle/libs.versions.toml` 파일의 버전 카탈로그에 Kotlin JVM Gradle 플러그인을 추가합니다:

    ```text
    [plugins]
    kotlinJvm = { id = "org.jetbrains.kotlin.jvm", version.ref = "kotlin" }
    ```

2. `desktopApp/build.gradle.kts` 파일에 공유 UI 모듈에 필요한 플러그인을 지정합니다:

    ```kotlin
    plugins {
       alias(libs.plugins.kotlinJvm)
       alias(libs.plugins.composeMultiplatform)
       alias(libs.plugins.composeCompiler)
    }
    ```

3. 이러한 모든 플러그인이 **루트** `build.gradle.kts` 파일에 언급되어 있는지 확인합니다:

    ```kotlin
    plugins {
        alias(libs.plugins.kotlinJvm) apply false
        alias(libs.plugins.composeMultiplatform) apply false
        alias(libs.plugins.composeCompiler) apply false
        // ...
    }
    ```

4. 다른 모듈에 필요한 의존성을 추가하려면 `composeApp` 빌드 스크립트의 `commonMain.dependencies {}` 및 `jvmMain.dependencies {}` 블록에서 기존 의존성을 복사합니다. 이 예제에서 최종 결과는 다음과 같아야 합니다:

   ```kotlin
   kotlin {
       dependencies { 
           implementation(projects.sharedLogic)
           implementation(projects.sharedUI)
           implementation(compose.desktop.currentOs)
           implementation(libs.kotlinx.coroutinesSwing)
       }
   }
   ```

5. `composeApp/build.gradle.kts` 파일에서 데스크톱 전용 설정이 포함된 `compose.desktop {}` 블록을 `desktopApp/build.gradle.kts` 파일로 복사합니다:

    ```kotlin
    compose.desktop {
        application {
            mainClass = "compose.project.demo.MainKt"

            nativeDistributions {
                targetFormats(TargetFormat.Dmg, TargetFormat.Msi, TargetFormat.Deb)
                packageName = "compose.project.demo"
                packageVersion = "1.0.0"
            }
        }
    }
    ```
6. 메인 메뉴에서 **Build | Sync Project with Gradle Files**를 선택하거나 에디터에서 Gradle 새로고침 버튼을 클릭합니다.

#### 코드 이동 및 데스크톱 앱 실행

설정이 완료되면 데스크톱 앱의 코드를 새 디렉토리로 이동합니다:

1. `desktopApp/src` 디렉토리에 새 `main` 디렉토리를 생성합니다.
2. `composeApp/src/jvmMain/kotlin` 디렉토리를 `desktopApp/src/main/` 디렉토리로 이동합니다.
   패키지 좌표가 `compose.desktop {}` 설정과 일치하는지 확인하는 것이 중요합니다.
3. 모든 것이 올바르게 구성되었다면 `desktopApp/src/main/.../main.kt` 파일의 import가 작동하고 코드가 컴파일됩니다.
4. 데스크톱 앱을 실행하려면 **composeApp [jvm]** 실행 구성을 수정합니다:
   1. 실행 구성 드롭다운에서 **Edit Configurations**를 선택합니다.
   2. **Gradle** 카테고리에서 **composeApp [jvm]** 구성을 찾습니다.
   3. **Gradle project** 필드에서 `ComposeDemo:composeApp`을 `ComposeDemo:desktopApp`으로 변경합니다.
5. 업데이트된 구성을 시작하여 앱이 예상대로 실행되는지 확인합니다.
6. 모든 것이 올바르게 작동한다면:
   * `composeApp/src/jvmMain` 디렉토리를 삭제합니다.
   * `composeApp/build.gradle.kts` 파일에서 데스크톱 관련 코드를 제거합니다:
       * `compose.desktop {}` 블록,
       * Kotlin `sourceSets {}` 블록 내부의 `jvmMain.dependencies {}` 블록,
       * `kotlin {}` 블록 내부의 `jvm()` 타겟 선언.

### 웹 앱

#### 웹 앱 모듈 생성 및 설정

웹 앱 모듈(`webApp`)을 생성하려면 다음을 수행하세요:

1. 프로젝트 루트에 `webApp` 디렉토리를 생성합니다.
2. 해당 디렉토리 안에 빈 `build.gradle.kts` 파일과 `src` 디렉토리를 생성합니다.
3. 파일 끝에 다음 라인을 추가하여 새 모듈을 `settings.gradle.kts` 프로젝트 설정에 추가합니다:

    ```kotlin
    include(":webApp")
    ```

#### 웹 앱용 빌드 스크립트 구성

웹 앱 빌드 스크립트가 작동하도록 하려면 다음을 수행하세요:

1. `webApp/build.gradle.kts` 파일에 공유 UI 모듈에 필요한 플러그인을 지정합니다:

        ```kotlin
        plugins {
           alias(libs.plugins.kotlinMultiplatform)
           alias(libs.plugins.composeMultiplatform)
           alias(libs.plugins.composeCompiler)
        }
        ```

2. 이러한 모든 플러그인이 **루트** `build.gradle.kts` 파일에 언급되어 있는지 확인합니다:

    ```kotlin
    plugins {
        alias(libs.plugins.kotlinMultiplatform) apply false
        alias(libs.plugins.composeMultiplatform) apply false
        alias(libs.plugins.composeCompiler) apply false
        // ...
    }
    ```

3. `composeApp/build.gradle.kts` 파일의 JavaScript 및 Wasm 타겟 선언을 `webApp/build.gradle.kts` 파일의 `kotlin {}` 블록으로 복사합니다:

    ```kotlin
    kotlin {
        js {
            browser()
            binaries.executable()
        }

        @OptIn(ExperimentalWasmDsl::class)
        wasmJs {
            browser()
            binaries.executable()
        }
    }
    ```

4. 다른 모듈에 필요한 의존성을 추가합니다:

   ```kotlin
   kotlin {
       sourceSets {
           commonMain.dependencies { 
               implementation(projects.sharedLogic)
               // 필요한 진입점 API를 제공합니다.
               implementation(compose.ui)
           }
       }
   }
   ```

5. 메인 메뉴에서 **Build | Sync Project with Gradle Files**를 선택하거나 에디터에서 Gradle 새로고침 버튼을 클릭합니다.

#### 코드 이동 및 웹 앱 실행

설정이 완료되면 웹 앱의 코드를 새 디렉토리로 이동합니다:

1. 전체 `composeApp/src/webMain` 디렉토리를 `webApp/src` 디렉토리로 이동합니다.
   모든 것이 올바르게 구성되었다면 `webApp/src/webMain/.../main.kt` 파일의 import가 작동하고 코드가 컴파일됩니다.
2. `webApp/src/webMain/resources/index.html` 파일에서 스크립트 이름을 `composeApp.js`에서 `webApp.js`로 업데이트합니다.
3. 웹 앱을 실행하려면 **composeApp [wasmJs]** 실행 구성을 수정합니다:
    1. 실행 구성 드롭다운에서 **Edit Configurations**를 선택합니다.
    2. **Gradle** 카테고리에서 **composeApp [wasmJs]** 구성을 찾습니다.
    3. **Gradle project** 필드에서 `ComposeDemo:composeApp`을 `ComposeDemo:webApp`으로 변경합니다.
4. **composeApp [js]**에 대해서도 반복하여 JavaScript 버전도 실행할 수 있도록 합니다.
5. 실행 구성을 시작하여 앱이 예상대로 실행되는지 확인합니다.
6. 모든 것이 올바르게 작동한다면:
    * `composeApp/src/webMain` 디렉토리를 삭제합니다.
    * `composeApp/build.gradle.kts` 파일에서 웹 관련 코드를 제거합니다:
        * Kotlin `sourceSets {}` 블록 내부의 `webMain.dependencies {}` 블록,
        * `kotlin {}` 블록 내부의 `js {}` 및 `wasmJs {}` 타겟 선언.

### 공유 모듈 구성

예제 앱에서는 UI와 비즈니스 로직 코드가 모두 공유되므로 모든 공통 코드를 보유할 단일 공유 모듈만 있으면 됩니다. 단순히 `composeApp`을 공통 코드 모듈로 용도를 변경할 수 있습니다.

[//]: # (TODO For an overview of other project configurations and ways of dealing with them, see our blogpost about the new recommended project structure [link])

진입점 모듈과의 연결과 관련되지 않은 Gradle 구성에서 조정해야 할 유일한 사항은 새로운 Android Library Gradle 플러그인입니다.
이 새 플러그인은 멀티플랫폼 프로젝트를 위해 특별히 제작되었으며 AGP 9 이상을 사용하는 데 필수적입니다.

필요한 변경 사항은 다음과 같습니다:

1. `gradle/libs.versions.toml`에서 버전 카탈로그에 Android-KMP 라이브러리 플러그인을 추가합니다:

    ```text
    [plugins]
    androidMultiplatformLibrary = { id = "com.android.kotlin.multiplatform.library", version.ref = "agp" }
    ```

2. `composeApp/build.gradle.kts` 파일에 공유 UI 모듈에 필요한 플러그인을 추가합니다:

    ```kotlin
    plugins {
       alias(libs.plugins.kotlinMultiplatform)
       alias(libs.plugins.androidMultiplatformLibrary)
       alias(libs.plugins.composeMultiplatform)
       alias(libs.plugins.composeCompiler)
    }
    ```
3. 루트 `build.gradle.kts` 파일에 플러그인 적용 시 충돌을 피하기 위해 다음 라인을 추가합니다:

    ```kotlin
    alias(libs.plugins.androidMultiplatformLibrary) apply false
    ```
4. `composeApp/build.gradle.kts` 파일에서 `kotlin.androidTarget {}` 블록 대신 `kotlin.androidLibrary {}` 블록을 추가합니다:

    ```kotlin
    androidLibrary {
        namespace = "compose.project.demo.composedemo"
        compileSdk = libs.versions.android.compileSdk.get().toInt()
    
        compilerOptions {
            jvmTarget = JvmTarget.JVM_11
        }
    
        androidResources {
            enable = true
        }
    }
    ```
5. `composeApp/build.gradle.kts` 파일에서 루트 `android {}` 블록을 제거합니다.
6. 모든 코드가 앱 모듈로 이동되었으므로 `androidMain` 의존성을 제거합니다:
   `kotlin.sourceSets.androidMain.dependencies {}` 블록을 삭제합니다.
7. Android 앱이 예상대로 실행되는지 확인합니다.

### (선택 사항) 공유 로직 및 공유 UI 분리 {collapsible="true"}

프로젝트의 일부 타겟이 네이티브 UI를 구현하는 경우 공통 코드를 `sharedLogic`과 `sharedUI` 모듈로 분리하여 네이티브 UI가 있는 앱 모듈이 공유 코드를 사용하기 위해 Compose Multiplatform에 의존할 필요가 없도록 하는 것이 좋습니다.

다음은 동일한 샘플 앱을 기반으로 이에 접근하는 방법의 예입니다.

#### 공유 로직 모듈 생성

실제로 모듈을 생성하기 전에 무엇이 비즈니스 로직인지, 즉 UI와 플랫폼 모두에 독립적인 코드가 무엇인지 결정해야 합니다.
이 예제에서 유일한 후보는 위치와 시간대 쌍에 대한 정확한 시간을 반환하는 `currentTimeAt()` 함수입니다.
반면 `Country` 데이터 클래스는 Compose Multiplatform의 `DrawableResource`에 의존하므로 UI 코드에서 분리할 수 없습니다.

> 예를 들어 모든 UI 코드를 공유하지 않기 때문에 프로젝트에 이미 `shared` 모듈이 있는 경우, `sharedLogic` 대신 이 모듈을 사용할 수 있습니다.
> 공유 로직과 UI를 더 명확하게 구분하기 위해 이름을 변경하는 것이 좋을 수 있습니다.
> 
{style="note"}

해당 코드를 `sharedLogic` 모듈로 격리합니다:

1. 프로젝트 루트에 `sharedLogic` 디렉토리를 생성합니다.
2. 해당 디렉토리 안에 빈 `build.gradle.kts` 파일과 `src` 디렉토리를 생성합니다.
3. 파일 끝에 다음 라인을 추가하여 새 모듈을 `settings.gradle.kts`에 추가합니다:

    ```kotlin
    include(":sharedLogic")
    ```
4. 새 모듈에 대한 Gradle 빌드 스크립트를 구성합니다.

    1. `gradle/libs.versions.toml` 파일의 버전 카탈로그에 Android-KMP 라이브러리 플러그인을 추가합니다:

        ```text
        [plugins]
        androidMultiplatformLibrary = { id = "com.android.kotlin.multiplatform.library", version.ref = "agp" }
        ```

    2. `sharedLogic/build.gradle.kts` 파일에 공유 로직 모듈에 필요한 플러그인을 지정합니다:

       ```kotlin
       plugins {
           alias(libs.plugins.kotlinMultiplatform)
           alias(libs.plugins.androidMultiplatformLibrary)
       }
       ```
    3. 이러한 플러그인이 **루트** `build.gradle.kts` 파일에 언급되어 있는지 확인합니다:

       ```kotlin
       plugins {
         alias(libs.plugins.androidMultiplatformLibrary) apply false
         alias(libs.plugins.kotlinMultiplatform) apply false
         // ...
       }
       ```
    4. `sharedLogic/build.gradle.kts` 파일에서 이 예제의 공통 모듈이 지원해야 하는 타겟을 지정합니다:

        ```kotlin
        kotlin {
            // sharedLogic은 프레임워크로 내보내지지 않고 'sharedUI'만 내보내질 것이므로
            // iOS 프레임워크 설정은 필요하지 않습니다.
            iosArm64()
            iosSimulatorArm64()
     
            jvm()
     
            js {
                browser()
            }
     
            @OptIn(ExperimentalWasmDsl::class)
            wasmJs {
                browser()
            }
        }
        ```
    5. Android의 경우 `androidTarget {}` 블록 대신 `androidLibrary {}` 설정을 `kotlin {}` 블록에 추가합니다:

        ```kotlin
        kotlin {
            // ...
            androidLibrary {
                namespace = "com.jetbrains.greeting.demo.sharedLogic"
                compileSdk = libs.versions.android.compileSdk.get().toInt()
                minSdk = libs.versions.android.minSdk.get().toInt()
        
                compilerOptions {
                    jvmTarget = JvmTarget.JVM_11
                }
            }
        }
        ```
    6. `composeApp`에 선언된 것과 동일한 방식으로 공통 및 JavaScript 소스 세트에 필요한 시간 관련 의존성을 추가합니다:

        ```kotlin
        kotlin {
            sourceSets {
                commonMain.dependencies {
                    implementation("org.jetbrains.kotlinx:kotlinx-datetime:%dateTimeVersion%")
                }
                webMain.dependencies {
                    implementation(npm("@js-joda/timezone", "2.22.0"))
                }
            }
        }
        ```
    7. 메인 메뉴에서 **Build | Sync Project with Gradle Files**를 선택하거나 에디터에서 Gradle 새로고침 버튼을 클릭합니다.

5. 처음에 식별한 비즈니스 로직 코드를 이동합니다:
    1. `sharedLogic/src` 내부에 `commonMain/kotlin` 디렉토리를 생성합니다.
    2. `commonMain/kotlin` 내부에 `CurrentTime.kt` 파일을 생성합니다.
    3. 기존 `App.kt`에서 `currentTimeAt` 함수를 `CurrentTime.kt`로 이동합니다.
6. 새 위치에서 `App()` 컴포저블이 함수를 사용할 수 있도록 합니다.
   이를 위해 `composeApp/build.gradle.kts` 파일에서 `composeApp`과 `sharedLogic` 간의 의존성을 선언합니다:

    ```kotlin
    commonMain.dependencies {
        implementation(projects.sharedLogic)
    }
    ```
7. 변경 사항을 적용하기 위해 **Build | Sync Project with Gradle Files**를 다시 실행합니다.
8. `composeApp/commonMain/.../App.kt` 파일에서 `currentTimeAt()` 함수를 가져와 코드를 수정합니다.
9. 애플리케이션을 실행하여 새 모듈이 제대로 작동하는지 확인합니다.

성공적으로 공유 로직을 별도의 모듈로 격리하고 교차 플랫폼에서 사용했습니다.
다음 단계는 공유 UI 모듈을 생성하는 것입니다.

#### 공유 UI 모듈 생성

공통 UI 요소를 구현하는 공유 코드를 `sharedUI` 모듈로 추출합니다:

1. 프로젝트 루트에 `sharedUI` 디렉토리를 생성합니다.
2. 해당 디렉토리 안에 빈 `build.gradle.kts` 파일과 `src` 디렉토리를 생성합니다.
3. 파일 끝에 다음 라인을 추가하여 새 모듈을 `settings.gradle.kts`에 추가합니다:

    ```kotlin
    include(":sharedUI")
    ```
4. 새 모듈에 대한 Gradle 빌드 스크립트를 구성합니다:

    1. `sharedLogic` 모듈에서 수행하지 않은 경우, `gradle/libs.versions.toml`의 버전 카탈로그에 Android-KMP 라이브러리 플러그인을 추가합니다:

        ```text
        [plugins]
        androidMultiplatformLibrary = { id = "com.android.kotlin.multiplatform.library", version.ref = "agp" }
        ```

    2. `sharedUI/build.gradle.kts` 파일에 공유 UI 모듈에 필요한 플러그인을 지정합니다:

        ```kotlin
        plugins {
           alias(libs.plugins.kotlinMultiplatform)
           alias(libs.plugins.androidMultiplatformLibrary)
           alias(libs.plugins.composeMultiplatform)
           alias(libs.plugins.composeCompiler)
        }
        ```

    3. 이러한 모든 플러그인이 **루트** `build.gradle.kts` 파일에 언급되어 있는지 확인합니다:

        ```kotlin
        plugins {
            alias(libs.plugins.androidMultiplatformLibrary) apply false
            alias(libs.plugins.composeMultiplatform) apply false
            alias(libs.plugins.composeCompiler) apply false
            alias(libs.plugins.kotlinMultiplatform) apply false
            // ...
        }
        ```

    4. `kotlin {}` 블록에서 이 예제의 공유 UI 모듈이 지원해야 하는 타겟을 지정합니다:

        ```kotlin
        kotlin {
            listOf(
                iosArm64(),
                iosSimulatorArm64()
            ).forEach { iosTarget ->
                iosTarget.binaries.framework {
                    // Swift 코드에서 가져올 iOS 프레임워크의 이름입니다.
                    baseName = "sharedUI"
                    isStatic = true
                }
            }
     
            jvm()
     
            js {
                browser()
                binaries.executable()
            }
     
            @OptIn(ExperimentalWasmDsl::class)
            wasmJs {
                browser()
                binaries.executable()
            }
        }
        ```

    5. Android의 경우 `androidTarget {}` 블록 대신 `androidLibrary {}` 설정을 `kotlin {}` 블록에 추가합니다:

        ```kotlin
        kotlin {
            // ...
            androidLibrary {
                namespace = "com.jetbrains.greeting.demo.sharedUI"
                compileSdk = libs.versions.android.compileSdk.get().toInt()
                minSdk = libs.versions.android.minSdk.get().toInt()
         
                compilerOptions {
                    jvmTarget = JvmTarget.JVM_11
                }
       
                // Android 앱에서 Compose Multiplatform 리소스를 사용할 수 있게 합니다.
                androidResources {
                    enable = true
                }
            }
        }
        ```

    6. `composeApp`에 선언된 것과 동일한 방식으로 공유 UI에 필요한 의존성을 추가합니다:

       ```kotlin
       kotlin {
           sourceSets {
               commonMain.dependencies { 
                   implementation(projects.sharedLogic)
                   implementation(compose.runtime)
                   implementation(compose.foundation)
                   implementation(compose.material3)
                   implementation(compose.ui)
                   implementation(compose.components.resources)
                   implementation(compose.components.uiToolingPreview)
                   implementation(libs.androidx.lifecycle.viewmodelCompose)
                   implementation(libs.androidx.lifecycle.runtimeCompose)
                   implementation("org.jetbrains.kotlinx:kotlinx-datetime:%dateTimeVersion%")
               }
           }
       }
       ```
    7. 메인 메뉴에서 **Build | Sync Project with Gradle Files**를 선택하거나 에디터에서 Gradle 새로고침 버튼을 클릭합니다.
5. `sharedUI/src` 내부에 새 `commonMain/kotlin` 디렉토리를 생성합니다.
6. 리소스 파일을 `sharedUI` 모듈로 이동합니다: `composeApp/commonMain/composeResources` 디렉토리 전체를 `sharedUI/commonMain/composeResources`로 재배치해야 합니다.
7. `sharedUI/src/commonMain/kotlin` 디렉토리에 새 `App.kt` 파일을 생성합니다.
8. 기존 `composeApp/src/commonMain/.../App.kt`의 모든 내용을 새 `App.kt` 파일로 복사합니다.
9. 이전 `App.kt` 파일의 모든 코드를 임시로 주석 처리합니다.
   이렇게 하면 이전 코드를 완전히 제거하기 전에 공유 UI 모듈이 작동하는지 테스트할 수 있습니다.
10. 새 `App.kt` 파일은 이제 다른 패키지에 위치한 리소스 import를 제외하고 예상대로 작동해야 합니다.
    `Res` 객체와 모든 drawable 리소스를 올바른 경로로 다시 가져옵니다. 예:

    <compare type="top-bottom">
    <code-block lang="kotlin" code="        import demo.composeapp.generated.resources.mx"></code-block>
    <code-block lang="kotlin" code="        import demo.sharedui.generated.resources.mx"></code-block>
    </compare>
11. 이에 의존하는 앱 모듈의 진입점에서 새 `App()` 컴포저블을 사용할 수 있도록 해당 `build.gradle.kts` 파일에 의존성을 추가합니다:

    ```kotlin
    kotlin {
        sourceSets {
            commonMain.dependencies {
                implementation(projects.sharedUI)
                // ...
            }
        }
    }
    ```
12. 앱을 실행하여 새 모듈이 앱 진입점에 공유 UI 코드를 제대로 공급하는지 확인합니다.
13. `composeApp/src/commonMain/.../App.kt` 파일을 제거합니다.

성공적으로 크로스 플랫폼 UI 코드를 전용 모듈로 이동했습니다.

### iOS 통합 업데이트

iOS 앱 진입점은 별도의 Gradle 모듈로 빌드되지 않으므로 소스 코드를 모든 모듈에 포함할 수 있습니다. 이 예제에서는 `shared` 내부에 남겨둘 수 있습니다:

1. `composeApp/src/iosMain` 디렉토리를 `shared/src` 디렉토리로 이동합니다.
2. `shared` 모듈에서 생성된 프레임워크를 사용하도록 Xcode 프로젝트를 구성합니다:
    1. **File | Open Project in Xcode** 메뉴 항목을 선택합니다.
    2. **Project navigator** 도구 창에서 **iosApp** 프로젝트를 클릭한 다음 **Build Phases** 탭을 선택합니다.
    3. **Compile Kotlin Framework** 단계를 찾습니다.
    4. `./gradlew`로 시작하는 줄을 찾아 `composeApp`을 `sharedUi`로 바꿉니다:

        ```text
        ./gradlew :shared:embedAndSignAppleFrameworkForXcode
        ```
   
    5. `ContentView.swift` 파일의 import는 모듈의 실제 이름이 아니라 iOS 타겟의 Gradle 구성에 있는 `baseName` 매개변수와 일치하므로 그대로 유지해야 합니다.
       `shared/build.gradle.kts` 파일에서 프레임워크 이름을 변경하는 경우 import 지시문도 그에 따라 변경해야 합니다.

3. Xcode에서 앱을 실행하거나 IntelliJ IDEA의 **iosApp** 실행 구성을 사용하여 실행합니다.

[//]: # (TODO ## What's next: up for suggestions here — the first thought is to link platform-specific guidance)