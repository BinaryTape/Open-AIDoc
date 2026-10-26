[//]: # (title: Kotlin Multiplatform 빠른 시작)

<web-summary>JetBrains는 IntelliJ IDEA 및 Android Studio에 대한 공식 Kotlin IDE 지원을 제공합니다.</web-summary>

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

이 튜토리얼에서는 Compose Multiplatform UI를 사용하는 간단한 Kotlin Multiplatform 앱을 빌드하고 실행하는 방법을 배웁니다.

## 빌드 도구 선택하기 {id="choose-a-build-tool"}

이 빠른 시작 가이드에서는 Gradle을 사용하여 IDE에서 새 Kotlin Multiplatform 프로젝트를 생성하고 실행합니다.
Gradle은 새 프로젝트뿐만 아니라 이미 Gradle을 사용 중인 프로젝트도 지원합니다.
이 빠른 시작 가이드는 기존 프로젝트에 Kotlin Multiplatform을 도입하고자 하거나 익숙한 환경을 사용하고자 하는 Gradle 사용자를 위해 구성되었습니다.

완전히 새로운 프로젝트의 경우, JetBrains에서 Kotlin Multiplatform을 염두에 두고 개발한 도구인 Kotlin Toolchain을 사용해 볼 수도 있습니다.
Kotlin Toolchain은 CLI와 투명한 설정 형식을 제공하므로 AI 워크플로에 매우 적합합니다.

<Links href="kotlin-toolchain.md" summary="">Kotlin Toolchain을 사용하여 KMP 시작하기</Links>

## 환경 설정하기 {id="set-up-the-environment"}

IntelliJ IDEA 또는 Android Studio, `ANDROID_HOME` 환경 변수, 그리고 Xcode를 설정합니다.

1. IDE 선택 및 설치: KMP는 IntelliJ IDEA와 Android Studio에서 완벽하게 지원됩니다.
    
    [JetBrains Toolbox 앱](https://www.jetbrains.com/toolbox/app/)을 사용하여 IDE를 설치하는 것을 권장합니다.
    독립 실행형 설치를 원하는 경우 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 또는 [Android Studio](https://developer.android.com/studio) 설치 프로그램을 다운로드하세요.

    최상의 결과를 위해 최신 안정화 버전을 사용하세요.

2. Kotlin Multiplatform IDE 플러그인을 설치합니다.
   플러그인 마켓플레이스(**Settings | Plugins | Marketplace**)에서 찾거나 [플러그인 웹 페이지](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)에서 직접 설치할 수 있습니다.
    
3. `ANDROID_HOME` 환경 변수가 설정되어 있지 않다면, 시스템에서 이를 인식할 수 있도록 설정하세요.

    <Tabs>
    <TabItem title= "Bash or Zsh">
   
    `.profile` 또는 `.zprofile`에 다음 명령을 추가합니다.
        
    ```shell
    export ANDROID_HOME=~/Library/Android/sdk
    ```
   
    </TabItem>
    <TabItem title= "Windows PowerShell or CMD">

    PowerShell의 경우 다음 명령을 사용하여 영구 환경 변수를 추가할 수 있습니다
    (자세한 내용은 [PowerShell 문서](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_environment_variables)를 참조하세요).

    ```shell
    [Environment]::SetEnvironmentVariable('ANDROID_HOME', '<path to the SDK>', 'Machine')
    ```

    CMD의 경우 [`setx`](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/setx) 명령을 사용합니다.
    
    ```shell
    setx ANDROID_HOME "<path to the SDK>"
    ```
    </TabItem>
    </Tabs>

4. iOS 애플리케이션을 생성하려면 [Xcode](https://apps.apple.com/us/app/xcode/id497799835)가 설치된 macOS 머신이 필요합니다.
    IDE는 내부적으로 Xcode를 실행하여 iOS 프레임워크를 빌드합니다.

    KMP 프로젝트 작업을 시작하기 전에 Xcode를 최소 한 번은 실행하여 초기 설정 과정을 거치도록 하세요.

    > Xcode가 업데이트될 때마다 직접 수동으로 실행하고 업데이트된 도구를 다운로드해야 합니다.
    > Kotlin Multiplatform IDE 플러그인은 사전 점검(preflight checks)을 수행하여 Xcode가 올바르게 구성되지 않았을 때 알림을 제공합니다.
    >
    {style="note"}

## 프로젝트 생성하기 {id="create-a-project"}

<Tabs>
<TabItem title= "IntelliJ IDEA">

Kotlin Multiplatform 생성기를 사용하여 프로젝트를 생성합니다.

1. 메인 메뉴에서 **File** | **New** | **Project**를 선택합니다.
2. 왼쪽 목록에서 **Kotlin Multiplatform**을 선택합니다.
   **Name**과 **Location**을 적절히 설정합니다.
   **Project ID**는 이름을 기반으로 자동 생성됩니다.
3. 이 페이지의 나머지 내용은 **Gradle** 프로젝트를 기준으로 설명합니다. 진행하기 전에 **Build system** 스위치에서 Gradle이 선택되어 있는지 확인하세요.
4. 지원되는 모든 플랫폼을 사용해 보려면 Android, iOS, Desktop, Web, Server를 선택합니다.
   **UI implementation** 옵션에서는 해당 타깃의 UI 프레임워크로 Compose Multiplatform을 사용할 수 있도록 **Share UI**를 선택된 상태로 둡니다.

   > 데스크톱 타깃에는 코드 변경 사항을 저장하자마자 UI 변경을 확인할 수 있는 [Compose Hot Reload](compose-hot-reload.md) 기능이 자동으로 포함됩니다.
   > 데스크톱 앱을 만들 계획이 없더라도 UI 코드 작업 속도를 높이기 위해 프로젝트에 데스크톱 타깃을 추가할 수 있습니다.
   > 
   {style="note"}

5. **Create** 버튼을 클릭하고 IDE가 프로젝트를 생성하고 임포트할 때까지 기다립니다.

![기본 설정과 Android, iOS, desktop, web 플랫폼이 선택된 IntelliJ IDEA 마법사](idea-wizard-1step.png){width=600}

</TabItem>
<TabItem title= "Android Studio">

마법사를 사용하여 새 프로젝트를 생성합니다.

1. 메인 메뉴에서 **File** | **New** | **New project**를 선택합니다.
2. 기본 **Phone and Tablet** 템플릿 카테고리에서 **Kotlin Multiplatform**을 선택합니다.

    ![Android Studio의 첫 번째 새 프로젝트 단계](as-wizard-1.png){width="400"}

3. 프로젝트 이름, 패키지 이름, 저장 위치를 필요에 맞게 설정한 다음 **Next**를 클릭합니다.
   **Build configuration language**는 Kotlin DSL로 설정된 상태를 유지해야 합니다.
4. 전체 데모를 생성하려면 사용 가능한 모든 플랫폼인 Android, iOS, Desktop, Web, Server를 선택합니다.
   해당 타깃의 UI 프레임워크로 Compose Multiplatform을 사용할 수 있도록 가능한 곳에서는 **Share UI** 옵션을 선택된 상태로 둡니다.

   > 데스크톱 타깃에는 코드 변경 사항을 저장하자마자 UI 변경을 확인할 수 있는 [Compose Hot Reload](compose-hot-reload.md) 기능이 자동으로 포함됩니다.
   > 데스크톱 앱을 만들 계획이 없더라도 UI 코드 작업 속도를 높이기 위해 프로젝트에 데스크톱 타깃을 추가할 수 있습니다.
   >
   {style="note"}

5. **Finish** 버튼을 클릭하고 IDE가 프로젝트를 생성하고 임포트할 때까지 기다립니다.

![Android, iOS, desktop, web 플랫폼이 선택된 Android Studio 마법사의 마지막 단계](as-wizard-3step.png){width=600}

</TabItem>
</Tabs>

플랫폼 간에 공유되는 코드는 `shared` 모듈에서 확인할 수 있습니다.
`Platform.kt` 파일에는 플랫폼 이름을 가져오기 위한 [`expect`](multiplatform-expect-actual.md) 선언이 포함되어 있습니다.

서로 다른 플랫폼용 앱을 실행하면 네이티브 호출을 통해 전달된 서로 다른 플랫폼 이름과 함께 동일한 UI 레이아웃을 볼 수 있습니다.

## 사전 점검(preflight checks) 확인하기 {id="consult-the-preflight-checks"}

프로젝트 설정에 환경 문제가 없는지 확인하려면 **Project Environment Preflight Checks** 도구 창을 엽니다.
오른쪽 사이드바 또는 하단 바에서 사전 점검 아이콘 ![비행기 모양의 Project Environment Preflight Checks 아이콘](ide-preflight-checks.png){width="20"}을 클릭하세요.

이 도구 창에서 통과된 점검 항목을 확인하거나, 다시 실행하거나, 설정을 변경할 수 있습니다.
일반적으로 이 창은 문제가 감지되었을 때 자동으로 열리며, 그렇지 않은 경우에는 숨겨져 있습니다.

사전 점검 명령은 **Search Everywhere** 대화 상자에서도 사용할 수 있습니다.
<shortcut>Shift</shortcut> 키를 두 번 누르고 "preflight"라는 단어가 포함된 명령을 검색하세요.

!["preflight" 단어가 입력된 Search Everywhere 메뉴](double-shift-preflight-checks.png){width=600}

## 생성된 프로젝트의 모듈 구조 {id="modules-in-the-generated-project"}

Kotlin Multiplatform 마법사에서 선택한 플랫폼 구성에 따라 IDE가 프로젝트를 임포트한 후 다음과 같은 모듈이 표시됩니다.

* **androidApp**: Android 애플리케이션을 빌드하는 모듈입니다.
* **desktopApp**: 데스크톱 JVM 애플리케이션을 빌드하는 모듈입니다.
* **iosApp**: iOS 애플리케이션을 빌드하는 Xcode 프로젝트입니다. 이 모듈은 **shared** 모듈에 의존하며 이를 iOS 프레임워크로 사용합니다.
* **shared**: Android, 데스크톱, iOS, 웹 애플리케이션을 위한 공통 코드가 포함된 Kotlin Multiplatform 모듈입니다.
* **webApp**: Kotlin/JS 및 Kotlin/Wasm 웹 애플리케이션을 모두 빌드하는 모듈입니다.
* **server** 및 **core**: 서버 플랫폼을 선택했을 때만 생성되는 모듈입니다.
  **core**는 서버와 클라이언트 앱 간에 공유되는 코드를 보관하며,
  **server**는 엔드포인트를 구성합니다.

  > 서버 플랫폼을 선택하면 IDE는 애플리케이션 진입점들을 `app` 디렉터리 아래로 그룹화합니다.
  > 그렇지 않은 경우 앱 모듈은 프로젝트 루트에 생성됩니다.
  >
  {style="tip"} 

`shared` 모듈은 각 타깃별로 컴파일됩니다.
예를 들어 Android 앱을 빌드할 때는 Kotlin/JVM 모듈로 처리되고, iOS 앱을 빌드할 때는 Kotlin/Native로 처리됩니다.

## 샘플 앱 실행하기 {id="run-the-sample-apps"}

IDE 마법사로 생성된 프로젝트에는 iOS, Android, 데스크톱, 웹 애플리케이션을 위한 생성된 실행 구성(run configuration)과 서버 앱을 실행하기 위한 Gradle 태스크가 포함되어 있습니다.

실행 구성을 시작하려면 IDE 오른쪽 상단의 드롭다운 메뉴를 찾아 **Run** 버튼을 클릭합니다.

<Tabs>
<TabItem title="Android">

Android 앱을 실행하려면 **androidApp** 실행 구성을 시작합니다.

![Android 실행 구성이 강조 표시된 드롭다운](run-android-configuration.png){width=250}

기본적으로 사용 가능한 첫 번째 가상 기기에서 실행됩니다.

![가상 기기에서 실행된 Android 앱](run-android-app.png){width=300}

Android 실행 구성을 수동으로 생성하려면(**Run | Edit Configurations**), 실행 구성 템플릿으로 **Android App**을 선택하고 **[프로젝트 이름].androidApp** 모듈을 선택합니다.

</TabItem>
<TabItem title="iOS">

> iOS 앱을 빌드하려면 Xcode가 설치된 macOS 머신이 필요합니다.
>
{style="note"}

**iosApp** 실행 구성과 시뮬레이션할 기기를 선택합니다.

![iOS 실행 구성이 강조 표시된 드롭다운](run-ios-configuration.png){width=250}

이 실행 구성은 내부적으로 Xcode를 사용하여 iOS 앱을 빌드하고 iOS 시뮬레이터를 사용하여 실행합니다.
첫 번째 빌드에서는 네이티브 의존성을 수집하고 빌드 데이터를 캐시하여 이후 실행 속도를 높입니다.

![가상 기기에서 실행된 iOS 앱](run-ios-app.png){width=350}

</TabItem>
<TabItem title="Desktop">

데스크톱 앱의 기본 실행 구성은 **desktopApp [hot] 🔥**로 생성됩니다.

![기본 데스크톱 실행 구성이 강조 표시된 드롭다운](run-desktop-configuration.png){width=250}

이 구성을 사용하여 JVM 데스크톱 앱을 실행할 수 있습니다.

![JVM 앱](run-desktop-app.png){width=600}

Hot Reload가 포함된 데스크톱 실행 구성을 수동으로 생성하려면(**Run | Edit Configurations**), **Gradle** 실행 구성 템플릿을 선택하고 다음 명령을 사용하여 **[앱 이름]:desktopApp** Gradle 프로젝트를 지정합니다.

```shell
hotRun --mainClass "com.example.demo.MainKt"
```

</TabItem>
<TabItem title="Web">

기본적으로 웹용으로는 **webApp [wasmJs]** 및 **webApp [js]** 두 가지 실행 구성이 생성됩니다.
두 구성 모두 각각 Kotlin/Wasm 또는 Kotlin/JS로 빌드된 동일한 앱을 실행합니다.

![기본 Wasm 실행 구성이 강조 표시된 드롭다운](run-wasm-configuration.png){width=250}

이 구성을 실행하면 IDE가 Kotlin/Wasm 앱을 빌드하고 기본 브라우저에서 엽니다.

![브라우저에서 실행된 웹 앱](run-wasm-app.png){width=600}

웹 실행 구성을 수동으로 생성하려면 **Gradle** 실행 구성 템플릿을 선택하고 `wasmJsBrowserDevelopmentRun` 태스크와 함께 **[앱 이름]:webApp** Gradle 프로젝트를 지정하거나, Kotlin/JS 버전의 경우 `jsBrowserDevelopmentRun` 태스크를 지정합니다.

</TabItem>
</Tabs>

## 문제 해결 {id="troubleshooting"}

Kotlin Multiplatform 설정 문제는 대개 Java, Android SDK 또는 Xcode가 올바르게 구성되지 않았을 때 발생합니다.

### Java 및 JDK {id="java-and-jdk"}

Java 설정과 관련된 가장 일반적인 문제는 다음과 같습니다.

* 일부 도구에서 Java 설치를 찾지 못하거나 잘못된 버전을 사용할 수 있습니다.
  이를 해결하려면 적절한 JDK가 설치된 디렉터리로 `JAVA_HOME` 환경 변수를 설정하고([JetBrains Runtime](https://github.com/JetBrains/JetBrainsRuntime) 사용 권장), `JAVA_HOME` 내부의 `bin` 폴더 경로를 `PATH` 변수에 추가합니다.
* Android Studio에서 Gradle JDK와 관련된 문제가 발생하면 올바르게 구성되었는지 확인하세요.
  **Settings** | **Build, Execution, Deployment** | **Build Tools** | **Gradle**을 선택합니다.

### Android 도구 {id="android-tools"}

`adb`와 같은 Android 도구를 실행하는 데 문제가 있는 경우, `ANDROID_HOME/tools`, `ANDROID_HOME/tools/bin`, `ANDROID_HOME/platform-tools` 경로가 `PATH` 환경 변수에 추가되어 있는지 확인하세요.

### Xcode {id="xcode"}

iOS 실행 구성에서 실행할 가상 기기가 없다고 보고하거나 사전 점검이 실패하는 경우, Xcode를 직접 실행하여 iOS SDK 업데이트가 있는지 확인하세요.

### 도움 받기 {id="get-help"}

* **Kotlin Slack**: [초대 링크](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)를 받아 [#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU) 채널에 참여하세요.
* **Kotlin Multiplatform Tooling 이슈 트래커**: [새 이슈 보고하기](https://youtrack.jetbrains.com/newIssue?project=KMT).

## 다음 단계 {id="what-s-next"}

KMP 프로젝트의 구조와 공통 코드 작성에 대해 자세히 알아보세요.

* [완전한 코드 공유: 시간대 선택기 앱](compose-multiplatform-new-project.md): Compose Multiplatform을 사용하여 공유 UI 코드를 다루는 방법을 알려주는 초급 튜토리얼입니다.
* [네이티브 UI: REST API 요청을 위한 공통 로직](multiplatform-upgrade-app.md): 네이티브 UI 코드가 포함된 멀티플랫폼 프로젝트에서 공통 코드를 다루는 방법을 알려주는 초급 튜토리얼입니다.

특정 Kotlin Multiplatform 사용 사례를 자세히 살펴보세요.

* [멀티플랫폼 의존성 다루기](multiplatform-add-dependencies.md)
* [멀티플랫폼 아티팩트를 중심으로 코드 및 아티팩트 구성하기](multiplatform-project-configuration.md)
* Compose Multiplatform UI 프레임워크와 Compose 에코시스템에서의 위치 알아보기: [Compose Multiplatform과 Jetpack Compose의 관계](compose-multiplatform-and-jetpack-compose.md)

KMP용으로 이미 작성된 코드를 살펴보세요.

* [샘플](multiplatform-samples.md): JetBrains 공식 샘플 및 KMP 기능을 보여주는 엄선된 프로젝트 목록입니다.
* GitHub 토픽:
  * [kotlin-multiplatform](https://github.com/topics/kotlin-multiplatform): Kotlin Multiplatform으로 구현된 프로젝트입니다.
  * [kotlin-multiplatform-sample](https://github.com/topics/kotlin-multiplatform-sample): KMP로 작성된 샘플 프로젝트 목록입니다.
* [klibs.io](https://klibs.io): KMP 라이브러리 검색 플랫폼입니다.
  GitHub의 프로젝트와 Maven Central의 아티팩트를 색인화하며, 검색 결과에 대한 세부 필터링 및 [AI 워크플로 지원](https://klibs.io/ai)을 제공합니다.