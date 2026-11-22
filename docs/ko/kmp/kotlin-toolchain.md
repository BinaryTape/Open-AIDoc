[//]: # (title: Kotlin Toolchain으로 Kotlin Multiplatform 애플리케이션 생성 및 배포하기)

[Kotlin Toolchain](https://kotlin-toolchain.org/)은 Kotlin 프로젝트의 빌드, 테스트, 실행 및 배포를 지원하는 JetBrains의 도구입니다.
CLI와 선언적 설정(declarative configuration)을 제공하므로 터미널, IDE 또는 AI 지원 개발 도구와 함께 작업할 수 있습니다.
Kotlin Toolchain을 사용하면 코딩 에이전트가 최소한의 설정과 구성만으로 새 프로젝트 생성부터 앱 배포까지 전 과정을 진행할 수 있습니다.

[Kotlin AI 스킬 공식 저장소](https://github.com/Kotlin/kotlin-agent-skills/tree/main)에는 Kotlin Toolchain 전용 스킬이 포함되어 있습니다.

이 페이지에서는 Kotlin Toolchain을 사용하여 기초부터 Kotlin Multiplatform 프로젝트를 설정하는 방법을 안내합니다.

에이전트에게 간단히 다음과 같이 요청할 수도 있습니다.

```text
Create a new Kotlin Multiplatform app for Android, iOS, desktop, and web with the Kotlin Toolchain CLI (https://kotlin-toolchain.org/latest).
```

> Kotlin Toolchain은 현재 [Alpha](supported-platforms.md#general-kotlin-stability-levels) 단계입니다.
> 여러분의 Kotlin Multiplatform 프로젝트에서 자유롭게 사용해 보세요.
> 피드백은 [YouTrack](https://youtrack.jetbrains.com/issues/KTC) 및 [전용 Slack 채널](https://kotlinlang.slack.com/archives/C062WG3A7T8)을 통해 남겨주시면 감사하겠습니다.
>
{style="note"}

## 사전 요구 사항 {id="prerequisites"}

### Kotlin Toolchain CLI 설치하기 {id="toolchain-script-install"}

에이전트가 Kotlin Toolchain을 직접 설치할 수도 있지만, 설치 스크립트를 사용하여 수동으로 설치할 수도 있습니다.

<Tabs>
<TabItem title="macOS or Linux">

```shell
curl -fsSL https://kotl.in/install.sh | sh
```

</TabItem>

<TabItem title="Windows">

```shell
powershell -ExecutionPolicy ByPass -c "irm 'https://kotl.in/install.ps1' | iex"
```

</TabItem>
</Tabs>

설치 스크립트는 Kotlin Toolchain CLI를 다운로드하여 `~/.local/bin`에 배치하고, `PATH`에 등록되도록 보장합니다.
`sudo` 명령은 필요하지 않습니다.

`kotlin --version`을 실행하여 CLI를 사용할 수 있는지 확인하세요.

### iOS 앱 빌드하기 {id="building-ios-apps"}

Kotlin Toolchain을 사용하면 Xcode를 열지 않고도 CLI나 IDE에서 직접 앱을 빌드, 실행, 배포하는 등 iOS 개발 워크플로의 대부분을 처리할 수 있습니다.

Xcode가 필요한 경우 Kotlin Toolchain이 설치를 요청하고 설정 방법을 안내합니다.
권장하는 방법은 [App Store](https://apps.apple.com/us/app/xcode/id497799835)에서 Xcode를 설치하는 것입니다.

Kotlin Toolchain에 iOS 빌드용 CLI를 제공하고 때때로 프로젝트별 워크플로를 처리하기 위해 Xcode 설치가 필요합니다.

## 프로젝트 생성하기 {id="create-a-project"}

Kotlin Toolchain을 사용하여 새 프로젝트를 생성하려면 다음 단계를 따르세요.

1. Kotlin Toolchain이 프로젝트를 생성할 디렉터리(예: **Projects**)로 이동합니다.
2. 다음 명령을 실행합니다.

   ```shell
   kotlin new
   ```

3. 프로젝트 경로 입력 프롬프트가 표시되면 디렉터리 이름(예: `ktc-kmp`)을 입력합니다.
4. 템플릿 목록에서 **Kotlin Multiplatform application**을 선택합니다.
5. **스페이스바** 키를 사용하여 타겟 플랫폼을 선택하거나 선택 해제합니다. 확인하려면 **Enter** 키를 누릅니다.

   > 최종 앱이 Android와 iOS만을 타겟으로 하더라도 데스크톱 타겟을 추가하는 것을 고려해 보세요.
   > 데스크톱 타겟을 사용하면 더 빠른 개발 및 반복 주기가 가능해지며, 앱을 다시 시작하지 않고도 UI 변경 사항을 확인할 수 있는 [Compose Hot Reload](compose-hot-reload.md)를 지원합니다.
   >
   {style="tip"}

6. 프로젝트 ID를 입력하거나, 비워 두어 디렉터리 이름을 기반으로 기본 ID를 생성합니다.

   이 ID는 Kotlin 패키지 이름, Android 네임스페이스 및 애플리케이션 ID, iOS 번들 ID 등 프로젝트 전반에서 앱을 식별하는 데 사용됩니다.

7. AI 에이전트 설정 설치를 확인합니다. 일반적인 권장 사항과 MCP 서버 설정이 포함된 프로젝트 전용 AGENTS.md가 생성됩니다.
8. **스페이스바** 키를 사용하여 선호하는 AI 에이전트를 선택합니다. 확인하려면 **Enter** 키를 누릅니다.

Kotlin Toolchain이 구성 파일, 소스 코드, 래퍼 스크립트를 포함한 프로젝트를 생성합니다.
기본적으로 Git 저장소도 함께 초기화됩니다.

생성된 프로젝트에는 각 플랫폼의 애플리케이션 진입점 역할을 하는 여러 `*App` 모듈과 공통 코드가 포함된 `shared` 모듈이 있습니다. 각 모듈은 전체 `project.yaml` 파일에 나열되며 고유한 `module.yaml` 파일로 구성됩니다.
각 애플리케이션 모듈은 `shared` 모듈에 명시적으로 의존합니다. 예를 들어 Android 모듈의 경우는 다음과 같습니다.

```yaml
# androidApp/module.yaml
product: android/app

dependencies:
  # Shared module dependency
  - //shared
  # Android-specific dependency
  - $libs.androidx.activity.compose
  - $compose.preview
  - $compose.uiTooling

settings:
  compose: enabled
  android:
    namespace: org.example.ktckmp
    applicationId: org.example.ktckmp
```

각 모듈의 기본 구조는 [KMP 소스 세트 모델](multiplatform-discover-project.md#source-sets)을 따르지만, 예를 들어 `androidMain` 대신 `src@android`와 같은 형태를 사용합니다.

## 프로젝트 실행하기 {id="run-the-project"}

프로젝트를 실행하려면 다음 단계를 따르세요.

1. 프로젝트 디렉터리(위 예제의 경우 `ktc-kmp`)로 이동합니다.
2. `kotlin run`을 실행하여 실행 가능한 애플리케이션 목록을 표시합니다.
   사용 가능한 모듈은 프로젝트 생성 시 선택한 타겟 플랫폼에 해당합니다.

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

## 애플리케이션 배포하기 {id="publish-the-applications"}

앱의 동작에 만족한다면 애플리케이션을 배포할 수 있습니다.

### iOS의 경우 {id="for-ios"}

Kotlin Toolchain은 [TestFlight](https://developer.apple.com/testflight/) 배포 설정 과정을 간소화해 줍니다.
iOS 앱을 배포하려면 다음 명령을 실행하세요.

```shell
kotlin publish testflight
```

이 명령은 자세한 안내가 포함된 마법사를 시작합니다. 최소한의 수동 작업만으로 [App Store Connect](https://appstoreconnect.apple.com/login) API 키를 사용해 배포 프로세스를 설정할 수 있도록 안내합니다.
이후의 릴리스에서는 동일한 명령으로 배포가 자동으로 수행됩니다.

수동 설정 및 배포에 대한 지침은 [Kotlin Toolchain 문서](https://kotlin-toolchain.org/latest/user-guide/publishing/ios-application)를 참조하세요.

### Android의 경우 {id="for-android"}

Android 앱을 설정하고 배포하려면 [Kotlin Toolchain 문서](https://kotlin-toolchain.org/latest/user-guide/publishing/android-application)의 지침을 따르세요.

### 기타 타겟 플랫폼 {id="other-target-platforms"}

[JVM 앱](https://kotlin-toolchain.org/latest/user-guide/product-types/jvm-app/#packaging)이나 [Wasm 앱](https://kotlin-toolchain.org/latest/user-guide/product-types/wasm-js-app/#packaging)을 패키징할 수도 있지만, 이러한 플랫폼에 대한 배포는 아직 완벽하게 지원되지 않습니다.

## IntelliJ IDEA 또는 Android Studio에서 프로젝트 작업하기 {id="work-on-a-project-in-intellij-idea-or-android-studio"}

IntelliJ IDEA 또는 Android Studio에서 프로젝트를 작업하고 실행할 수 있습니다.

> Android Studio에서 Kotlin Toolchain의 모든 기능을 활용하려면 최소 Android Studio Rabbit 이상의 [최신 안정 버전](https://developer.android.com/studio/releases)을 사용하세요.
>
{style="tip"}

[Kotlin Multiplatform 플러그인](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)을 설치하면 Kotlin Multiplatform 프로젝트에 대한 IDE 지원뿐만 아니라 Kotlin Toolchain 프로젝트 구조 및 실행 구성에 대한 지원이 추가됩니다.

### IDE에서 직접 프로젝트 생성하기 {id="create-a-project-directly-in-the-ide"}

Kotlin Multiplatform 및 Kotlin Toolchain 플러그인이 설치되어 있으면 IDE에서 직접 새 프로젝트를 생성할 수도 있습니다.

1. IntelliJ IDEA 또는 Android Studio를 엽니다.
2. **File** | **New** | **Project**를 선택합니다.
3. **Kotlin Multiplatform**을 선택하고 **Build system** 스위치에서 **Kotlin Toolchain**을 선택합니다.
4. 나머지 프로젝트 세부 정보를 입력하고 **Create**를 클릭합니다.

프로젝트가 생성되고 임포트되면 IDE가 선언된 모든 모듈에 대한 실행 구성을 자동으로 등록하므로, IDE 툴바에서 해당하는 애플리케이션을 바로 실행할 수 있습니다.

## 다음 단계 {id="what-s-next"}

* Kotlin Toolchain이 무엇이며 어떤 용도로 사용되는지에 대한 자세한 내용은 [제품 FAQ](https://kotlin-toolchain.org/latest/faq/)를 확인하세요.
* [기초 튜토리얼](https://kotlin-toolchain.org/latest/getting-started/tutorial/)에서는
  Kotlin Toolchain "Hello, World!"를 만들고 복잡한 템플릿 구성을 갖춘 멀티플랫폼 프로젝트로 점진적으로 발전시키는 방법을 보여줍니다.
* Kotlin Toolchain에 대해 자세히 알아보려면 [사용자 가이드](https://kotlin-toolchain.org/latest/user-guide/)를 확인하세요.