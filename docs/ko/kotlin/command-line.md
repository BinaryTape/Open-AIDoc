[//]: # (title: Kotlin 커맨드 라인 컴파일러)

모든 Kotlin 릴리스에는 독립형 버전의 컴파일러가 포함되어 있습니다. 최신 버전을 수동으로 다운로드하거나 패키지 관리자를 통해 설치할 수 있습니다.

> 커맨드 라인 컴파일러를 설치하는 것이 Kotlin을 사용하기 위한 필수 단계는 아닙니다.
> 일반적인 방법은 [IntelliJ IDEA](https://www.jetbrains.com/idea/) 또는 [Android Studio](https://developer.android.com/studio)와 같이 공식적으로 Kotlin을 지원하는 IDE나 코드 에디터를 사용하여 Kotlin 애플리케이션을 작성하는 것입니다.
> 이러한 도구들은 설치 즉시 완전한 Kotlin 지원을 제공합니다.
> 
> [IDE에서 Kotlin 시작하기](getting-started.md) 방법을 알아보세요.
> 
{style="note"}

## 컴파일러 설치

### 수동 설치

Kotlin 컴파일러를 수동으로 설치하려면 다음 단계를 따르세요:

1. [GitHub Releases](%kotlinLatestUrl%)에서 최신 버전(`kotlin-compiler-%kotlinVersion%.zip`)을 다운로드합니다.
2. 독립형 컴파일러의 압축을 특정 디렉터리에 풀고, 필요에 따라 `kotlinc/bin` 디렉터리를 시스템 경로(system path)에 추가합니다.
`bin` 디렉터리에는 Windows, macOS 및 Linux에서 Kotlin을 컴파일하고 실행하는 데 필요한 스크립트가 포함되어 있습니다.

> Windows에서 Kotlin 커맨드 라인 컴파일러를 사용하려는 경우, 수동으로 설치하는 것을 권장합니다.
> 
{style="note"}

### SDKMAN!

macOS, Linux, Cygwin, FreeBSD, Solaris와 같은 UNIX 기반 시스템에서 Kotlin을 설치하는 더 쉬운 방법은 [SDKMAN!](https://sdkman.io)을 사용하는 것입니다. 이는 Bash 및 ZSH 셸에서도 작동합니다. [SDKMAN! 설치 방법](https://sdkman.io/install)을 확인해 보세요.

SDKMAN!을 통해 Kotlin 컴파일러를 설치하려면 터미널에서 다음 명령을 실행하세요:

```bash
sdk install kotlin
```

### Homebrew

또는 macOS에서 [Homebrew](https://brew.sh/)를 통해 컴파일러를 설치할 수 있습니다:

```bash
brew update
brew install kotlin
```

### Snap 패키지

Ubuntu 16.04 이상에서 [Snap](https://snapcraft.io/)을 사용하는 경우, 커맨드 라인에서 컴파일러를 설치할 수 있습니다:

```bash
sudo snap install --classic kotlin
```

## 애플리케이션 생성 및 실행

1. `"Hello, World!"`를 출력하는 간단한 콘솔 JVM 애플리케이션을 Kotlin으로 작성합니다. 
   코드 에디터에서 다음 코드를 포함하는 `hello.kt`라는 새 파일을 만듭니다:

   ```kotlin
   fun main() {
       println("Hello, World!")
   }
   ```

2. Kotlin 컴파일러를 사용하여 애플리케이션을 컴파일합니다:

   ```bash
   kotlinc hello.kt -include-runtime -d hello.jar
   ```

   * `-d` 옵션은 생성된 클래스 파일의 출력 경로를 나타내며, 디렉터리나 **.jar** 파일일 수 있습니다.
   * `-include-runtime` 옵션은 Kotlin 런타임 라이브러리를 결과물에 포함시켜 **.jar** 파일을 자체 포함(self-contained) 및 실행 가능하게 만듭니다.

   사용 가능한 모든 옵션을 보려면 다음을 실행하세요:

   ```bash
   kotlinc -help
   ```

3. 애플리케이션을 실행합니다:

   ```bash
   java -jar hello.jar
   ```

> Kotlin/Native 애플리케이션을 컴파일하려면 [Kotlin/Native 컴파일러](native-get-started.md#using-the-command-line-compiler)를 사용하세요.
> 
{style="note"}

## 라이브러리 컴파일

다른 Kotlin 애플리케이션에서 사용할 라이브러리를 개발하는 경우, Kotlin 런타임을 포함하지 않고 **.jar** 파일을 빌드할 수 있습니다:

```bash
kotlinc hello.kt -d hello.jar
```

이 방식으로 컴파일된 바이너리는 Kotlin 런타임에 의존하므로, 컴파일된 라이브러리가 사용될 때마다 클래스패스(classpath)에 런타임이 존재하는지 확인해야 합니다.

`kotlinr` 스크립트를 사용하여 Kotlin 컴파일러가 생성한 바이너리를 실행할 수도 있습니다:

```bash
kotlinr -classpath hello.jar HelloKt
```

`HelloKt`는 `hello.kt`라는 파일에 대해 Kotlin 컴파일러가 생성하는 메인 클래스 이름입니다.

> Kotlin/Native 라이브러리를 컴파일하려면 [Kotlin/Native 컴파일러](native-libraries.md#using-kotlin-native-compiler)를 사용하세요.
>
{style="note"}

## REPL 실행

대화형 셸을 사용하려면 [`-Xrepl` 컴파일러 옵션](compiler-reference.md#xrepl)과 함께 컴파일러를 실행하세요. 이 셸에서는 유효한 모든 Kotlin 코드를 입력하고 그 결과를 즉시 확인할 수 있습니다.

## 스크립트 실행

Kotlin을 스크립팅 언어로 사용할 수 있습니다.
Kotlin 스크립트는 최상위 수준의 실행 코드가 포함된 Kotlin 소스 파일(`.kts`)입니다.

```kotlin
import java.io.File

// 전달된 경로를 가져오거나(예: "-d some/path"), 현재 경로를 사용합니다.
val path = if (args.contains("-d")) args[1 + args.indexOf("-d")]
           else "."

val folders = File(path).listFiles { file -> file.isDirectory() }
folders?.forEach { folder -> println(folder) }
```

스크립트를 실행하려면 컴파일러에 `-script` 옵션과 함께 해당 스크립트 파일을 전달하세요:

```bash
kotlinc -script list_folders.kts -- -d <path_to_folder_to_inspect>
```

Kotlin은 외부 속성 추가, 정적 또는 동적 종속성 제공 등과 같은 스크립트 커스터마이징에 대한 실험적 지원을 제공합니다.
커스터마이징은 소위 *스크립트 정의(script definitions)*, 즉 적절한 지원 코드가 포함된 어노테이션이 달린 Kotlin 클래스에 의해 정의됩니다.
스크립트 파일 확장자는 적절한 정의를 선택하는 데 사용됩니다.
[Kotlin 커스텀 스크립팅](custom-script-deps-tutorial.md)에 대해 자세히 알아보세요.

적절하게 준비된 스크립트 정의는 적절한 jar가 컴파일 클래스패스에 포함되어 있을 때 자동으로 감지되고 적용됩니다. 또는 컴파일러에 `-script-templates` 옵션을 전달하여 수동으로 정의를 지정할 수 있습니다:

```bash
kotlinc -script-templates org.example.CustomScriptDefinition -script custom.script1.kts
```

추가적인 세부 사항은 [KEEP-75](https://github.com/Kotlin/KEEP/blob/master/proposals/scripting-support.md)를 참조하세요.

## 다음 단계

[Kotlin/JVM 기반 콘솔 애플리케이션 생성하기](jvm-get-started.md).