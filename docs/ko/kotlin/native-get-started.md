[//]: # (title: Kotlin/Native 시작하기)

이 튜토리얼에서는 Kotlin/Native 애플리케이션을 만드는 방법을 배웁니다. 자신에게 가장 잘 맞는 도구를 선택하고 다음 중 하나를 사용하여 앱을 만들어 보세요:

* **[IDE](#in-ide)**: 버전 관리 시스템에서 프로젝트 템플릿을 클론하여 IntelliJ IDEA에서 사용할 수 있습니다.
* **[Gradle 빌드 시스템](#using-gradle)**: 내부 동작 방식을 더 잘 이해할 수 있도록 프로젝트의 빌드 파일을 직접 작성합니다.
* **[명령줄 도구](#using-the-command-line-compiler)**: 표준 Kotlin 배포판의 일부로 제공되는 Kotlin/Native 컴파일러를 사용하여 명령줄 도구에서 직접 앱을 만들 수 있습니다.

  콘솔 컴파일은 쉽고 직관적으로 보일 수 있지만, 수백 개의 파일과 라이브러리가 포함된 대규모 프로젝트에는 적합하지 않습니다. 이러한 프로젝트에는 IDE나 빌드 시스템을 사용하는 것을 권장합니다.

Kotlin/Native를 사용하면 Linux, macOS, Windows를 포함한 [다양한 타깃](native-target-support.md)으로 컴파일할 수 있습니다.
한 플랫폼을 사용하여 다른 플랫폼용으로 컴파일하는 크로스 플랫폼 컴파일(cross-platform compilation)도 가능하지만, 이 튜토리얼에서는 컴파일을 수행하는 플랫폼과 동일한 플랫폼을 타깃으로 합니다.

> Mac을 사용 중이고 macOS 또는 기타 Apple 타깃용 애플리케이션을 만들고 실행하려면 먼저 [Xcode Command Line Tools](https://developer.apple.com/download/)를 설치하고 실행하여 라이선스 약관에 동의해야 합니다.
>
{style="note"}

## IDE 사용하기 {id="in-ide"}

이 섹션에서는 IntelliJ IDEA를 사용하여 Kotlin/Native 애플리케이션을 만드는 방법을 알아봅니다.

### 프로젝트 생성 {id="create-the-project"}

1. 최신 버전의 [IntelliJ IDEA](https://www.jetbrains.com/idea/)를 다운로드하여 설치합니다.
2. IntelliJ IDEA에서 **File** | **New** | **Project from Version Control**을 선택하고 다음 URL을 입력하여 [프로젝트 템플릿](https://github.com/Kotlin/kmp-native-wizard)을 클론합니다:

   ```none
   https://github.com/Kotlin/kmp-native-wizard
   ```   

3. 프로젝트 의존성의 버전 카탈로그인 `gradle/libs.versions.toml` 파일을 엽니다. Kotlin/Native 애플리케이션을 생성하려면 Kotlin과 버전이 동일한 Kotlin Multiplatform Gradle 플러그인이 필요합니다. 최신 Kotlin 버전을 사용하고 있는지 확인하세요:

   ```toml
   [versions]
   kotlin = "%kotlinVersion%"
   ```

4. 제안에 따라 Gradle 파일을 다시 로드(reload)합니다:

   ![Gradle 변경 사항 불러오기 버튼](load-gradle-changes.png){width=295}

이러한 설정에 대한 자세한 내용은 [Multiplatform Gradle DSL 레퍼런스](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html)를 참조하세요.

### 애플리케이션 빌드 및 실행 {id="build-and-run-the-application"}

`src/nativeMain/kotlin/` 디렉터리에 있는 `Main.kt` 파일을 엽니다:

* `src` 디렉터리에는 Kotlin 소스 파일이 들어 있습니다.
* `Main.kt` 파일에는 [`println()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.io/println.html) 함수를 사용하여 "Hello, Kotlin/Native!"를 출력하는 코드가 포함되어 있습니다.

거터(gutter)에 있는 녹색 아이콘을 눌러 코드를 실행합니다:

![애플리케이션 실행](native-run-gutter.png){width=450}

IntelliJ IDEA는 Gradle 태스크를 사용하여 코드를 실행하고 **Run** 탭에 결과를 출력합니다:

![애플리케이션 출력](native-output-gutter-1.png){width=450}

첫 실행 후, IDE 상단에 해당하는 실행 구성(run configuration)이 생성됩니다:

![Gradle 실행 구성](native-run-config.png){width=500}

> Ultimate 구독을 보유한 IntelliJ IDEA 사용자는 [Native Debugging Support](https://plugins.jetbrains.com/plugin/12775-native-debugging-support) 플러그인을 설치할 수 있습니다. 이 플러그인은 컴파일된 네이티브 실행 파일의 디버깅을 지원하며, 가져온(imported) Kotlin/Native 프로젝트에 대한 실행 구성을 자동으로 생성해 줍니다.

IntelliJ IDEA가 프로젝트를 자동으로 빌드하도록 [설정](https://www.jetbrains.com/help/idea/compiling-applications.html#auto-build)할 수 있습니다:

1. **Settings | Build, Execution, Deployment | Compiler**로 이동합니다.
2. **Compiler** 페이지에서 **Build project automatically**를 선택합니다.
3. 변경 사항을 적용합니다.

이제 클래스 파일을 변경하거나 파일을 저장할 때마다(<shortcut>Ctrl + S</shortcut>/<shortcut>Cmd + S</shortcut>) IntelliJ IDEA가 프로젝트의 증분 빌드(incremental build)를 자동으로 수행합니다.

### 애플리케이션 업데이트 {id="update-the-application"}

이름의 글자 수를 세는 기능을 애플리케이션에 추가해 보겠습니다:

1. `Main.kt` 파일에 입력을 읽는 코드를 추가합니다. [`readln()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.io/readln.html) 함수를 사용하여 입력값을 읽고 `name` 변수에 할당합니다:

   ```kotlin
   fun main() {
       // 입력값을 읽습니다.
       println("Hello, enter your name:")
       val name = readln()
   }
   ```

2. Gradle을 사용하여 이 앱을 실행하려면 `build.gradle.kts` 파일에 사용할 입력으로 `System.in`을 지정하고 Gradle 변경 사항을 다시 로드합니다:

   ```kotlin
   kotlin {
       //...
       targets.withType<KotlinNativeTarget>().configureEach {
           binaries {
               executable {
                   entryPoint = "main"
                   runTaskProvider?.configure { standardInput = System.`in` }
               }
           }
       }
       //...
   }
   ```
   {initial-collapse-state="collapsed" collapsible="true" collapsed-title="runTaskProvider?.configure { standardInput = System.`in` }"}

3. 공백을 제거하고 글자 수를 셉니다:

   * [`replace()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/replace.html) 함수를 사용하여 이름에서 공백을 제거합니다.
   * 범위 지정 함수 [`let`](scope-functions.md#let)을 사용하여 객체 컨텍스트 내에서 함수를 실행합니다.
   * [문자열 템플릿(string template)](strings.md#string-templates)을 사용하여 달러 기호 `$`와 중괄호로 감싼 `${it.length}`를 추가해 이름의 길이를 문자열에 삽입합니다. `it`은 [람다 파라미터](coding-conventions.md#lambda-parameters)의 기본 이름입니다.

   ```kotlin
   fun main() {
       // 입력값을 읽습니다.
       println("Hello, enter your name:")
       val name = readln()
       // 이름의 글자 수를 셉니다.
       name.replace(" ", "").let {
           println("Your name contains ${it.length} letters")
       }
   }
   ```

4. 애플리케이션을 실행합니다.
5. 이름을 입력하고 결과를 확인합니다:

   ![애플리케이션 출력](native-output-gutter-2.png){width=500}

이제 이름에서 중복되지 않는 고유한 글자 수만 세어보겠습니다:

1. `Main.kt` 파일에서 `String`에 대한 새로운 [확장 함수(extension function)](extensions.md#extension-functions) `.countDistinctCharacters()`를 선언합니다:

   * [`.lowercase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/lowercase.html) 함수를 사용하여 이름을 소문자로 변환합니다.
   * [`toList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/to-list.html) 함수를 사용하여 입력 문자열을 문자 리스트로 변환합니다.
   * [`distinct()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/distinct.html) 함수를 사용하여 이름에서 중복되지 않는 고유한 문자만 선택합니다.
   * [`count()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/count.html) 함수를 사용하여 고유한 문자 수를 셉니다.

   ```kotlin
   fun String.countDistinctCharacters() = lowercase().toList().distinct().count()
   ```

2. `.countDistinctCharacters()` 함수를 사용하여 이름의 고유한 글자 수를 셉니다:

   ```kotlin
   fun String.countDistinctCharacters() = lowercase().toList().distinct().count()

   fun main() {
       // 입력값을 읽습니다.
       println("Hello, enter your name:")
       val name = readln()
       // 이름의 글자 수를 셉니다.
       name.replace(" ", "").let {
           println("Your name contains ${it.length} letters")
           // 고유한 글자 수를 출력합니다.
           println("Your name contains ${it.countDistinctCharacters()} unique letters")
       }
   }
   ```

3. 애플리케이션을 실행합니다.
4. 이름을 입력하고 결과를 확인합니다:

   ![애플리케이션 출력](native-output-gutter-3.png){width=500}

## Gradle 사용하기 {id="using-gradle"}

이 섹션에서는 [Gradle](https://gradle.org)을 사용하여 Kotlin/Native 애플리케이션을 직접 생성하는 방법을 알아봅니다.
Gradle은 Kotlin/Native 및 Kotlin Multiplatform 프로젝트의 기본 빌드 시스템이며, Java, Android 및 기타 생태계에서도 널리 사용됩니다.

Kotlin/Native 프로젝트를 빌드할 때 Kotlin Gradle 플러그인은 다음 아티팩트를 다운로드합니다:

* `konanc`, `cinterop`, `jsinterop`과 같은 다양한 도구가 포함된 메인 Kotlin/Native 번들. 기본적으로 Kotlin/Native 번들은 일반 Gradle 의존성으로서 [Maven Central](https://repo1.maven.org/maven2/org/jetbrains/kotlin/kotlin-native-prebuilt/) 저장소에서 다운로드됩니다.
* `llvm`과 같이 `konanc` 자체에 필요한 의존성. 이는 커스텀 로직을 통해 JetBrains CDN에서 다운로드됩니다.

Gradle 빌드 스크립트의 `repositories {}` 블록에서 메인 번들 다운로드 소스를 변경할 수 있습니다.

### 프로젝트 파일 생성 {id="create-project-files"}

1. 시작하기 전에 호환되는 버전의 [Gradle](https://gradle.org/install/)을 설치합니다. 사용 가능한 Gradle 버전과 Kotlin Gradle 플러그인(KGP)의 호환성은 [호환성 표](gradle-configure-project.md#apply-the-plugin)를 확인하세요.
2. 빈 프로젝트 디렉터리를 만듭니다. 그 안에 다음 내용으로 `build.gradle(.kts)` 파일을 생성합니다:

   <tabs group="build-script">
   <tab title="Kotlin" group-key="kotlin">

   ```kotlin
   // build.gradle.kts
   import org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget

   plugins {
       kotlin("multiplatform") version "%kotlinVersion%"
   }

   repositories {
       // 메인 번들을 다운로드할 소스를 지정합니다.
       // 기본적으로 Maven Central이 사용됩니다.
       mavenCentral()
   }

   kotlin {
       macosArm64()    // macOS의 경우
       // linuxArm64() // Linux의 경우
       // mingwX64()   // Windows의 경우
   
       targets.withType<KotlinNativeTarget>().configureEach {
           binaries {
               executable()
           }
       }
   }

   tasks.withType<Wrapper> {
       gradleVersion = "%gradleVersion%"
       distributionType = Wrapper.DistributionType.BIN
   }
   ```

   </tab>
   <tab title="Groovy" group-key="groovy">

   ```groovy
   // build.gradle
   import org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget

   plugins {
       id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
   }

   repositories {
       // 메인 번들을 다운로드할 소스를 지정합니다.
       // 기본적으로 Maven Central이 사용됩니다.
       mavenCentral()
   }

   kotlin {
       macosArm64()    // macOS의 경우
       // linuxArm64() // Linux의 경우
       // mingwX64()   // Windows의 경우
   
       targets.withType(KotlinNativeTarget).configureEach {
           binaries {
               executable()
           }
       }
   }

   wrapper {
       gradleVersion = '%gradleVersion%'
       distributionType = 'BIN'
   }
   ```

   </tab>
   </tabs>

   `macosArm64`, `iosArm64`, `linuxArm64`, `mingwX64`와 같은 다양한 [타깃 이름](native-target-support.md)을 사용하여 코드를 컴파일할 타깃을 정의할 수 있습니다.
   타깃 이름은 프로젝트에서 소스 경로와 태스크 이름을 생성하는 데 사용됩니다.

3. 프로젝트 디렉터리에 빈 `settings.gradle(.kts)` 파일을 만듭니다.
4. `src/nativeMain/kotlin` 디렉터리를 생성하고 그 안에 다음 내용으로 `hello.kt` 파일을 배치합니다:

   ```kotlin
   fun main() {
       println("Hello, Kotlin/Native!")
   }
   ```

규칙에 따라 모든 소스는 `src/<platform name>[Main|Test]/kotlin` 디렉터리에 위치하며, 여기서 `Main`은 소스 코드용이고 `Test`는 테스트용입니다. 이 경우 `<platform name>`은 `native`가 됩니다.

### 프로젝트 빌드 및 실행 {id="build-and-run-the-project"}

1. 루트 프로젝트 디렉터리에서 해당 타깃에 맞는 `<yourTargetName>Binaries` 빌드 명령을 실행합니다. 예를 들면 다음과 같습니다:

   ```bash
   ./gradlew macosArm64Binaries
   ```

   이 명령은 내부에 `debugExecutable` 및 `releaseExecutable`이라는 두 개의 디렉터리가 포함된 `build/bin/<yourTargetName>` 디렉터리를 생성합니다. 여기에는 해당하는 바이너리 파일이 포함됩니다.

   기본적으로 바이너리 파일의 이름은 프로젝트 디렉터리 이름과 동일합니다.

2. 프로젝트를 실행하려면 타깃에 해당하는 `build/bin/<yourTargetName>/debugExecutable/<project_name>.kexe` 명령을 실행합니다. 예를 들면 다음과 같습니다:

   ```bash
   build/bin/macosArm64/DebugExecutable/hello.kexe
   ```

터미널에 "Hello, Kotlin/Native!"가 출력됩니다.

### IDE에서 프로젝트 열기 {id="open-the-project-in-ide"}

이제 Gradle을 지원하는 모든 IDE에서 프로젝트를 열 수 있습니다. IntelliJ IDEA를 사용하는 경우:

1. **File** | **Open**을 선택합니다.
2. 프로젝트 디렉터리를 선택하고 **Open**을 클릭합니다.
   IntelliJ IDEA가 Kotlin/Native 프로젝트인지 자동으로 감지합니다.

프로젝트에 문제가 발생하면 IntelliJ IDEA의 **Build** 탭에 오류 메시지가 표시됩니다.

## 명령줄 컴파일러 사용하기 {id="using-the-command-line-compiler"}

이 섹션에서는 명령줄 도구에서 Kotlin 컴파일러를 사용하여 Kotlin/Native 애플리케이션을 만드는 방법을 알아봅니다.

### 컴파일러 다운로드 및 설치 {id="download-and-install-the-compiler"}

컴파일러를 설치하려면 다음 단계를 따르세요:

1. Kotlin의 [GitHub 릴리스](%kotlinLatestUrl%) 페이지로 이동하여 **Assets** 섹션으로 스크롤합니다.
2. 파일 이름에 `kotlin-native`가 포함된 파일을 찾아 운영체제에 적합한 것을 다운로드합니다(예: `kotlin-native-prebuilt-linux-x86_64-%kotlinVersion%.tar.gz`).
3. 원하는 디렉터리에 압축을 풉니다.
4. 셸 프로필을 열고 컴파일러의 `/bin` 디렉터리 경로를 `PATH` 환경 변수에 추가합니다:

   ```bash
   export PATH="/<path to the compiler>/kotlin-native/bin:$PATH"
   ```

> 컴파일러의 출력물에는 어떠한 의존성이나 가상 머신도 필요하지 않지만, 컴파일러 자체는 Java 1.8 이상의 런타임을 요구합니다. 이는 [JDK 8(JAVA SE 8) 이상 버전](https://www.oracle.com/java/technologies/downloads/)에서 지원됩니다.
>
{style="note"}

### 프로그램 작성 {id="create-the-program"}

작업 디렉터리를 선택하고 `hello.kt`라는 이름의 파일을 만듭니다. 다음 코드로 내용을 작성합니다:

```kotlin
fun main() {
    println("Hello, Kotlin/Native!")
}
```

### 콘솔에서 코드 컴파일하기 {id="compile-the-code-from-the-console"}

애플리케이션을 컴파일하려면 다운로드한 컴파일러로 다음 명령을 실행합니다:

```bash
kotlinc-native hello.kt -o hello
```

`-o` 옵션의 값은 출력 파일의 이름을 지정하므로, 이 호출은 macOS 및 Linux에서는 `hello.kexe` 바이너리 파일을 생성합니다(Windows에서는 `hello.exe`).

사용 가능한 전체 옵션 목록은 [Kotlin 컴파일러 옵션](compiler-reference.md)을 참조하세요.

### 프로그램 실행 {id="run-the-program"}

프로그램을 실행하려면 명령줄 도구에서 바이너리 파일이 포함된 디렉터리로 이동하여 다음 명령을 실행합니다:

<tabs>
<tab title="macOS 및 Linux">

```none
./hello.kexe
```

</tab>
<tab title="Windows">

```none
./hello.exe
```

</tab>
</tabs>

애플리케이션이 표준 출력으로 "Hello, Kotlin/Native"를 출력합니다.

## 다음 단계 {id="what-s-next"}

* C 라이브러리와 상호 운용하고 네이티브 HTTP 클라이언트를 만드는 방법을 설명하는 [C interop 및 libcurl을 사용한 앱 만들기](native-app-with-c-and-libcurl.md) 튜토리얼을 완료해 보세요.
* [실제 Kotlin/Native 프로젝트를 위한 Gradle 빌드 스크립트 작성법](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html)을 알아보세요.
* Gradle 빌드 시스템에 대한 자세한 내용은 [문서](gradle.md)를 참조하세요.