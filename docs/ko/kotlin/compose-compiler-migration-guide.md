[//]: # (title: Compose 컴파일러 마이그레이션 가이드)

Compose 컴파일러는 Gradle 플러그인에 의해 보완되어, 설정을 단순화하고 컴파일러 옵션에 더 쉽게 접근할 수 있도록 합니다.
Android Gradle 플러그인(AGP)과 함께 적용하면, 이 Compose 컴파일러 플러그인은 AGP에 의해 자동으로 제공되는 Compose 컴파일러의 좌표(coordinates)를 재정의합니다.

Compose 컴파일러는 Kotlin 2.0.0부터 Kotlin 레포지토리에 병합되었습니다.
이는 프로젝트의 Kotlin 2.0.0 이상으로의 마이그레이션을 원활하게 합니다. Compose 컴파일러가 Kotlin과 동시에 출시되며 항상 동일한 버전의 Kotlin과 호환되기 때문입니다.

프로젝트에서 새로운 Compose 컴파일러 플러그인을 사용하려면, Compose를 사용하는 각 모듈에 이를 적용하세요.
[Jetpack Compose 프로젝트 마이그레이션하기](#migrating-a-jetpack-compose-project)에서 자세한 내용을 확인하세요. Compose 멀티플랫폼 프로젝트의 경우, [멀티플랫폼 마이그레이션 가이드](https://kotlinlang.org/docs/multiplatform/compose-compiler.html#migrating-a-compose-multiplatform-project)를 참고하세요.

## Jetpack Compose 프로젝트 마이그레이션하기 {id="migrating-a-jetpack-compose-project"}

1.9에서 Kotlin 2.0.0 이상으로 마이그레이션할 때는 Compose 컴파일러를 처리하는 방식에 따라 프로젝트 설정을 조정해야 합니다. 설정 관리를 자동화하기 위해 Kotlin Gradle 플러그인과 Compose 컴파일러 Gradle 플러그인을 사용하는 것을 권장합니다.

### Gradle 플러그인으로 Compose 컴파일러 관리하기 {id="managing-the-compose-compiler-with-gradle-plugins"}

Android 모듈의 경우:

1. Compose 컴파일러 Gradle 플러그인을 [Gradle 버전 카탈로그](https://docs.gradle.org/current/userguide/platforms.html#sub:conventional-dependencies-toml)에 추가합니다:

     ```toml
     [versions]
     # ...
     kotlin = "%kotlinVersion%"
     
     [plugins]
     # ...
     org-jetbrains-kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
     compose-compiler = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
     ```
    
    > AGP 9.0.0 이상을 사용하는 경우, AGP에 Kotlin 지원이 내장되어 있으므로 `org-jetbrains-kotlin-android` 플러그인이 더 이상 필요하지 않습니다.
    > 
    {style ="note"}

2. 루트 `build.gradle.kts` 파일에 Gradle 플러그인을 추가합니다:

     ```kotlin
     plugins {
         // ...
         alias(libs.plugins.compose.compiler) apply false
     }
     ```

3. Jetpack Compose를 사용하는 모든 모듈에 플러그인을 적용합니다:

     ```kotlin
     plugins {
         // ...
         alias(libs.plugins.compose.compiler)
     }
     ```

4. Jetpack Compose 컴파일러용 컴파일러 옵션을 사용 중이라면, `composeCompiler {}` 블록에서 설정하세요. 참고를 위해 [컴파일러 옵션 목록](compose-compiler-options.md)을 확인하세요.

5. Compose 컴파일러 아티팩트를 직접 참조하는 경우, 해당 참조를 제거하고 Gradle 플러그인이 이를 처리하도록 할 수 있습니다.

### Gradle 플러그인 없이 Compose 컴파일러 사용하기 {id="using-compose-compiler-without-gradle-plugins"}

Compose 컴파일러를 관리하기 위해 Gradle 플러그인을 사용하지 않는 경우, 프로젝트의 이전 Maven 아티팩트에 대한 모든 직접 참조를 업데이트하세요:

* `androidx.compose.compiler:compiler`를 `org.jetbrains.kotlin:kotlin-compose-compiler-plugin-embeddable`로 변경
* `androidx.compose.compiler:compiler-hosted`를 `org.jetbrains.kotlin:kotlin-compose-compiler-plugin`으로 변경

## 다음 단계 {id="what-s-next"}

* Compose 컴파일러가 Kotlin 레포지토리로 이동한다는 [Google의 공지](https://android-developers.googleblog.com/2024/04/jetpack-compose-compiler-moving-to-kotlin-repository.html)를 확인해 보세요.
* Jetpack Compose를 사용하여 Android 앱을 빌드하고 있다면, [멀티플랫폼으로 만드는 방법에 대한 가이드](https://kotlinlang.org/docs/multiplatform/multiplatform-integrate-in-existing-app.html)를 확인해 보세요.