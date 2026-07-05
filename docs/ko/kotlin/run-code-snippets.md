[//]: # (title: 코드 스니펫 실행하기)

코틀린 코드는 보통 IDE, 텍스트 에디터 또는 다른 도구에서 작업하는 프로젝트로 구성됩니다. 하지만 함수의 작동 방식을 빠르게 확인하거나 표현식의 값을 찾고 싶을 때, 굳이 새 프로젝트를 생성하고 빌드할 필요는 없습니다. 다양한 환경에서 코틀린 코드를 즉석에서 실행할 수 있는 세 가지 유용한 방법을 확인해 보세요:

* IDE의 [스크래치 파일(Scratch files)](#ide-scratches-and-worksheets).
* 브라우저의 [Kotlin Playground](#browser-kotlin-playground).
* 커맨드라인의 [ki 셸(ki shell)](#command-line-ki-shell).

## IDE: 스크래치(Scratches) {id="ide-scratches-and-worksheets"}

IntelliJ IDEA와 Android Studio는 코틀린 [스크래치 파일(Scratch files)](https://www.jetbrains.com/help/idea/kotlin-repl.html#efb8fb32)을 지원합니다.

_스크래치 파일_(또는 간단히 _스크래치_)을 사용하면 프로젝트와 동일한 IDE 창에서 코드 초안을 작성하고 즉석에서 실행할 수 있습니다. 스크래치는 프로젝트에 종속되지 않으므로, OS의 어떤 IntelliJ IDEA 창에서도 모든 스크래치에 액세스하고 실행할 수 있습니다.

코틀린 스크래치를 생성하려면 **File** | **New** | **Scratch File**을 클릭하고 **Kotlin** 타입을 선택하세요.

스크래치에서는 구문 강조(Syntax highlighting), 자동 완성(Auto-completion) 및 기타 IntelliJ IDEA 코드 편집 기능을 지원합니다. `main()` 함수를 선언할 필요가 없으며, 작성하는 모든 코드는 `main()` 본문에 있는 것처럼 실행됩니다.

스크래치에서 코드 작성을 마친 후 **Run**을 클릭하세요. 실행 결과는 코드 옆의 라인에 표시됩니다.

![Run scratch](scratch-run.png){width=700}

### 대화형 모드(Interactive mode)

IDE는 스크래치의 코드를 자동으로 실행할 수 있습니다. 타이핑을 멈추자마자 실행 결과를 확인하려면 **Interactive mode**를 켜세요.

![Scratch interactive mode](scratch-interactive.png){width=700}

### 모듈 사용하기

스크래치에서 코틀린 프로젝트의 클래스나 함수를 사용할 수 있습니다.

프로젝트의 클래스나 함수를 스크래치에서 사용하려면 평소와 같이 `import` 문을 사용하여 스크래치 파일로 가져오세요. 그런 다음 코드를 작성하고 **Use classpath of module** 목록에서 적절한 모듈을 선택한 후 실행하세요.

스크래치는 연결된 모듈의 컴파일된 버전을 사용합니다. 따라서 모듈의 소스 파일을 수정하면 모듈을 다시 빌드할 때 변경 사항이 스크래치에 반영됩니다. 스크래치를 실행하기 전에 매번 모듈을 자동으로 다시 빌드하려면 **Make module before Run**을 선택하세요.

![Scratch select module](scratch-select-module.png){width=700}

## 브라우저: Kotlin Playground

[Kotlin Playground](https://play.kotlinlang.org/)는 브라우저에서 코틀린 코드를 작성, 실행 및 공유할 수 있는 온라인 애플리케이션입니다.

### 코드 작성 및 편집

Playground의 에디터 영역에서는 소스 파일에서와 마찬가지로 코드를 작성할 수 있습니다:
* 사용자 정의 클래스, 함수 및 최상위 선언을 임의의 순서로 추가할 수 있습니다.
* 실행 가능한 부분은 `main()` 함수의 본문에 작성합니다.

일반적인 코틀린 프로젝트와 마찬가지로 Playground의 `main()` 함수는 `args` 파라미터를 가질 수도 있고 파라미터가 없을 수도 있습니다. 실행 시 프로그램 인자를 전달하려면 **Program arguments** field에 작성하세요.

![Playground: code completion](playground-completion.png){width=700}

Playground는 타이핑할 때 코드를 강조 표시하고 자동 완성 옵션을 보여줍니다. 표준 라이브러리와 [`kotlinx.coroutines`](coroutines-overview.md)의 선언을 자동으로 임포트합니다.

### 실행 환경 선택

Playground는 실행 환경을 사용자 정의할 수 있는 방법을 제공합니다:
* 사용 가능한 [향후 버전의 프리뷰](eap.md)를 포함한 여러 코틀린 버전.
* 코드를 실행할 여러 백엔드: JVM, JS(레거시 또는 [IR 컴파일러](js-ir-compiler.md), 또는 Canvas), 또는 JUnit.

![Playground: environment setup](playground-env-setup.png){width=700}

JS 백엔드의 경우 생성된 JS 코드도 확인할 수 있습니다.

![Playground: generated JS](playground-generated-js.png){width=700}

### 온라인으로 코드 공유

Playground를 사용하여 코드를 다른 사람과 공유하세요. **Copy link**를 클릭하고 코드를 보여주고 싶은 사람에게 보내면 됩니다.

Playground의 코드 스니펫을 다른 웹사이트에 삽입하고 실행 가능하게 만들 수도 있습니다. **Share code**를 클릭하여 샘플을 웹 페이지나 [Medium](https://medium.com/) 아티클에 삽입해 보세요.

![Playground: share code](playground-share.png){width=700}

## 커맨드라인: ki 셸(ki shell)

[ki 셸](https://github.com/Kotlin/kotlin-interactive-shell)(_Kotlin Interactive Shell_)은 터미널에서 코틀린 코드를 실행하기 위한 커맨드라인 유틸리티입니다. Linux, macOS, Windows에서 사용할 수 있습니다.

ki 셸은 기본적인 코드 평가(Evaluation) 기능과 함께 다음과 같은 고급 기능을 제공합니다:
* 코드 완성
* 타입 체크
* 외부 의존성 지원
* 코드 스니펫을 위한 붙여넣기 모드(Paste mode)
* 스크립팅 지원

자세한 내용은 [ki 셸 GitHub 저장소](https://github.com/Kotlin/kotlin-interactive-shell)를 참조하세요.

### ki 셸 설치 및 실행

ki 셸을 설치하려면 [GitHub](https://github.com/Kotlin/kotlin-interactive-shell)에서 최신 버전을 다운로드하고 원하는 디렉토리에 압축을 푸세요.

macOS에서는 다음 명령을 실행하여 Homebrew로 ki 셸을 설치할 수도 있습니다:

```shell
brew install ki
```

ki 셸을 시작하려면 Linux 및 macOS에서는 `bin/ki.sh`를(Homebrew로 설치한 경우 간단히 `ki`), Windows에서는 `bin\ki.bat`을 실행하세요.

셸이 실행되면 즉시 터미널에서 코틀린 코드를 작성하기 시작할 수 있습니다. ki 셸에서 사용할 수 있는 명령어를 보려면 `:help`(또는 `:h`)를 입력하세요.

### 코드 완성 및 강조 표시

ki 셸은 **Tab**을 누를 때 코드 완성 옵션을 보여줍니다. 또한 타이핑하는 동안 구문 강조를 제공합니다. `:syntax off`를 입력하여 이 기능을 끌 수 있습니다.

![ki shell highlighting and completion](ki-shell-highlight-completion.png){width=700}

**Enter**를 누르면 ki 셸은 입력된 라인을 평가하고 결과를 출력합니다. 표현식의 값은 `res*`와 같이 자동 생성된 이름의 변수로 출력됩니다. 나중에 실행하는 코드에서 이러한 변수를 사용할 수 있습니다. 입력된 구조가 미완성인 경우(예: 본문이 없는 조건문 `if`), 셸은 점 세 개를 출력하고 남은 부분을 기다립니다.

![ki shell results](ki-shell-results.png){width=700}

### 표현식 타입 확인

잘 모르는 복잡한 표현식이나 API의 경우, ki 셸은 표현식의 타입을 보여주는 `:type`(또는 `:t`) 명령어를 제공합니다:

![ki shell type](ki-shell-type.png){width=700}

### 코드 로드

필요한 코드가 다른 곳에 저장되어 있는 경우, ki 셸로 로드하여 사용하는 두 가지 방법이 있습니다:
* `:load`(또는 `:l`) 명령어로 소스 파일을 로드합니다.
* `:paste`(또는 `:p`) 명령어를 사용하여 붙여넣기 모드에서 코드 스니펫을 복사하여 붙여넣습니다.

![ki shell load file](ki-shell-load.png){width=700}

`ls` 명령어는 사용 가능한 심볼(변수 및 함수)을 보여줍니다.

### 외부 의존성 추가

표준 라이브러리와 함께 ki 셸은 외부 의존성도 지원합니다. 이를 통해 전체 프로젝트를 생성하지 않고도 서드파티 라이브러리를 사용해 볼 수 있습니다.

ki 셸에서 서드파티 라이브러리를 추가하려면 `:dependsOn` 명령어를 사용하세요. 기본적으로 ki 셸은 Maven Central에서 작동하지만, `:repository` 명령어를 사용하여 다른 저장소를 연결할 수도 있습니다:

![ki shell external dependency](ki-shell-dependency.png){width=700}