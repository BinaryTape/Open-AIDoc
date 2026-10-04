[//]: # (title: Kotlin Toolchain을 사용하여 Kotlin Multiplatform 애플리케이션 생성 및 빌드하기)

[Kotlin Toolchain](https://kotlin-toolchain.org/)은 Kotlin 프로젝트를 생성, 빌드, 테스트 및 실행하기 위해 JetBrains에서 개발한 도구입니다.
CLI와 선언적 구성을 제공하므로 터미널, IDE 또는 AI 지원 개발 도구에서 작업할 수 있습니다.

이 페이지에서는 Kotlin Toolchain을 사용하여 처음부터 Kotlin Multiplatform 프로젝트를 설정하는 방법을 안내합니다.

> Kotlin Toolchain은 [Alpha](supported-platforms.md#general-kotlin-stability-levels) 단계에 있습니다.
> Kotlin Multiplatform 프로젝트에서 사용해 보시는 것을 환영합니다.
> 의견이나 피드백이 있으시다면 [YouTrack](https://youtrack.jetbrains.com/issues/KTC)에 남겨 주시면 감사하겠습니다.
>
{style="note"}

## 사전 요구 사항 {id="prerequisites"}

### Kotlin Toolchain CLI 설치 {id="toolchain-script-install"}

[SDKMAN!](https://sdkman.io/)을 사용하여 Kotlin Toolchain CLI를 설치할 수 있습니다.

```shell
sdk install kotlintoolchain
```

또는 설치 스크립트를 통해 설치할 수도 있습니다.

<Tabs>
<TabItem title="macOS or Linux">

```shell
curl -fsSL https://kotl.in/install.sh | sh

# 터미널을 다시 시작하거나 다음 명령을 실행하여
# 'kotlin' 명령어를 사용할 수 있도록 설정합니다.
exec $SHELL
```

</TabItem>

<TabItem title="Windows">

```shell
powershell -ExecutionPolicy ByPass -c "irm 'https://kotl.in/install.ps1' | iex"
```

</TabItem>
</Tabs>

`kotlin --version`을 실행하여 CLI를 사용할 수 있는지 확인합니다.

### iOS 앱 빌드 {id="building-ios-apps"}

iOS 애플리케이션을 빌드하고 실행하려면 [Xcode](https://apps.apple.com/us/app/xcode/id497799835)와 필요한 SDK를 설치하세요.

모듈을 빌드하거나 실행하는 데 실제로 Xcode가 필요한 경우, Kotlin Toolchain CLI가 Xcode 설정 방법에 대한 안내를 표시합니다.

## 프로젝트 생성 {id="create-a-project"}

Kotlin Toolchain을 사용하여 새 프로젝트를 생성하려면:

1. 프로젝트 디렉터리를 생성할 위치로 이동합니다.
2. 다음 명령을 실행합니다.

   ```shell
   kotlin new
   ```

3. 프로젝트 경로를 묻는 메시지가 나타나면 디렉터리 이름(예: `ktc-kmp`)을 입력합니다.
4. 템플릿 선택 화면이 나타나면 **Compose Multiplatform application**을 선택합니다.
5. **Enter** 키를 눌러 타깃의 기본 선택 항목을 확정합니다.
6. 프로젝트 전반에서 앱을 식별하는 데 사용할 프로젝트 ID를 입력합니다(디렉터리 이름을 기반으로 기본값이 생성됩니다).
   이 ID는 Kotlin 패키지 이름, Android 네임스페이스 및 애플리케이션 ID, iOS 번들 ID로 사용됩니다.

Kotlin Toolchain이 구성 파일, 소스 코드 및 래퍼(wrapper) 스크립트를 포함한 프로젝트를 생성합니다.
기본적으로 Git 저장소도 함께 초기화됩니다.

생성된 프로젝트에는 각 플랫폼의 애플리케이션 진입점(entry point)이 포함된 여러 `*App` 모듈과 공통 코드가 포함된 `shared` 모듈이 있습니다.
각 모듈은 전체 `project.yaml` 파일에 나열되며, 모듈 자체의 `module.yaml` 파일로 구성됩니다.
모든 애플리케이션 모듈은 다음과 같이 shared 모듈을 명시적으로 의존합니다.

```yaml
# androidApp/module.yaml
product: android/app

dependencies:
  # Shared module dependency
  - //shared
  # Android-specific dependency
  - $libs.androidx.activity.compose

settings:
  compose: enabled
  android:
    namespace: org.example.toolchainfirst
    applicationId: org.example.toolchainfirst
```

각 모듈의 기본 구조는 [KMP 소스 세트 모델](multiplatform-discover-project.md#source-sets)을 따르지만, `androidMain` 대신 `src@android`와 같은 형태로 구성됩니다.

## 프로젝트 실행 {id="run-the-project"}

프로젝트를 실행하려면:

1. 프로젝트 디렉터리(위 예제의 경우 `ktc-kmp`)로 이동합니다.
2. `kotlin run`을 실행하여 실행 가능한 애플리케이션 목록을 표시합니다.
   사용 가능한 모듈은 프로젝트를 생성할 때 선택한 타깃에 해당합니다.

    ```shell
    $ kotlin run
    
    Multiple modules are available to run, please choose:
    ❯ desktopApp (with Hot Reload 🔥)
    androidApp
    iosApp    
    webApp
    ```

3. `-m`(`--module`) 옵션을 사용하여 모듈을 직접 실행할 수도 있습니다. 예를 들면 다음과 같습니다.

    ```shell
    # 데스크톱 JVM 앱 빌드 및 실행
    kotlin run -m desktopApp
    ```

## IntelliJ IDEA 또는 Android Studio에서 프로젝트 작업 {id="work-on-a-project-in-intellij-idea-or-android-studio"}

IntelliJ IDEA 또는 Android Studio에서 프로젝트를 작업하고 실행할 수 있습니다.
IDE에서 Kotlin Toolchain 및 Kotlin Multiplatform 프로젝트를 인식할 수 있도록 다음 플러그인을 설치하세요.

* [Kotlin Multiplatform 플러그인](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform): KMP 프로젝트를 올바르게 지원하기 위해 필요합니다.
* [Kotlin Toolchain 플러그인](https://plugins.jetbrains.com/plugin/31850-kotlin-toolchain): IDE가 Kotlin Toolchain 프로젝트 구조를 인식하고 실행 구성(Run Configuration)을 생성하는 등의 작업을 지원합니다.

### IDE에서 직접 프로젝트 생성 {id="create-a-project-directly-in-the-ide"}

Kotlin Multiplatform 및 Kotlin Toolchain 플러그인이 설치되어 있다면 IDE에서 직접 새 프로젝트를 생성할 수도 있습니다.

1. IntelliJ IDEA 또는 Android Studio를 엽니다.
2. **File** | **New** | **Project**를 선택합니다.
3. **Kotlin Multiplatform**을 선택하고 **Build system** 스위치에서 **Kotlin Toolchain**을 선택합니다.
4. 나머지 프로젝트 세부 정보를 입력하고 **Create**를 클릭합니다.

프로젝트가 생성되고 임포트되면 IDE가 선언된 모든 모듈에 대한 실행 구성을 자동으로 등록하므로, IDE 툴바에서 해당 애플리케이션을 바로 실행할 수 있습니다.

## 애플리케이션 배포 {id="publish-the-applications"}

앱 동작에 만족한다면 애플리케이션을 배포(publish)할 수 있습니다.

아티팩트 생성에 대한 전체 안내는 Kotlin Toolchain 문서를 참조하세요.

* [Android 앱 배포](https://kotlin-toolchain.org/latest/user-guide/product-types/android-app/#publishing)
* [iOS 앱 배포](https://kotlin-toolchain.org/latest/user-guide/product-types/ios-app/#publishing)

JVM 앱이나 Wasm 앱도 패키징할 수 있지만, 이러한 타깃에 대한 배포는 아직 완전히 지원되지 않습니다.

## 다음 단계 {id="what-s-next"}

* Kotlin Toolchain의 정의와 용도에 대한 자세한 내용은 [제품 FAQ](https://kotlin-toolchain.org/dev/faq/)를 확인하세요.
* [처음부터 시작하는 튜토리얼](https://kotlin-toolchain.org/dev/getting-started/tutorial/)에서는 Kotlin Toolchain "Hello, World!"를 만들고 복잡한 템플릿 구성이 적용된 멀티플랫폼 프로젝트로 점진적으로 전환하는 방법을 보여줍니다.
* Kotlin Toolchain에 대해 더 자세히 알아보려면 [사용자 가이드](https://kotlin-toolchain.org/latest/user-guide/)를 확인하세요.