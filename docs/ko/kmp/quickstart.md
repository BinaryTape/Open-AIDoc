[//]: # (title: Kotlin Multiplatform 빠른 시작 가이드)

<web-summary>JetBrains는 IntelliJ IDEA 및 Android Studio에 대해 공식적인 Kotlin IDE 지원을 제공합니다.</web-summary>

이 튜토리얼에서는 Compose Multiplatform UI를 사용하여 간단한 Kotlin Multiplatform 앱을 빌드하고 실행하는 방법을 배웁니다.

## 환경 설정

IDE 및 필요한 플러그인 설치부터 시작하세요:

1. IDE를 선택하고 설치합니다. Kotlin Multiplatform은 IntelliJ IDEA와 Android Studio에서 완전히 지원됩니다.
    
    IDE를 설치할 때는 [JetBrains Toolbox App](https://www.jetbrains.com/toolbox/app/)을 사용하는 것을 권장합니다.
    이 앱을 사용하면 [Early Access Program](https://www.jetbrains.com/resources/eap/) (EAP) 및 Nightly 릴릴스를 포함하여 여러 제품이나 버전을 관리할 수 있습니다.

    독립형 설치의 경우, [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 또는 [Android Studio](https://developer.android.com/studio)용 설치 프로그램을 다운로드하세요.

    Kotlin Multiplatform에 필요한 플러그인을 사용하려면 최소 **IntelliJ IDEA 2025.2.2** 또는 **Android Studio Otter 2025.2.1** 버전이 필요합니다.

2. [Kotlin Multiplatform IDE 플러그인](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)을 설치합니다.
    
   IDE 플러그인을 설치하면 IDE에 아직 없는 필요한 종속성도 함께 설치됩니다.
    
3. `ANDROID_HOME` 환경 변수가 설정되어 있지 않다면, 시스템이 이를 인식하도록 구성하세요:

    <Tabs>
    <TabItem title= "Bash or Zsh">
   
    `.profile` 또는 `.zprofile`에 다음 명령을 추가합니다:
        
    ```shell
    export ANDROID_HOME=~/Library/Android/sdk
    ```
   
    </TabItem>
    <TabItem title= "Windows PowerShell or CMD">

    PowerShell의 경우, 다음 명령을 사용하여 영구 환경 변수를 추가할 수 있습니다.
    (자세한 내용은 [PowerShell 문서](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_environment_variables)를 참조하세요):

    ```shell
    [Environment]::SetEnvironmentVariable('ANDROID_HOME', '<path to the SDK>', 'Machine')
    ```

    CMD의 경우, [`setx`](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/setx) 명령을 사용합니다:
    
    ```shell
    setx ANDROID_HOME "<path to the SDK>"
    ```
    </TabItem>
    </Tabs>

4. iOS 애플리케이션을 만들려면 [Xcode](https://apps.apple.com/us/app/xcode/id497799835)가 설치된 macOS 호스트가 필요합니다.
    IDE는 내부적으로 Xcode를 실행하여 iOS 프레임워크를 빌드합니다.

    KMP 프로젝트 작업을 시작하기 전에 Xcode를 최소 한 번은 실행하여 초기 설정이 완료되었는지 확인하세요.

    > Xcode가 업데이트될 때마다 수동으로 실행하여 업데이트된 도구를 다운로드해야 합니다.
    > Kotlin Multiplatform IDE 플러그인은 사전 점검(preflight checks)을 수행하여 Xcode가 작업하기에 적합한 상태가 아닐 때마다 알림을 제공합니다.
    >
    {style="note"}

## 프로젝트 생성

<Tabs>
<TabItem title= "IntelliJ IDEA">

IDE 마법사를 사용하여 새 KMP 프로젝트를 만듭니다:

1. 메인 메뉴에서 **File** | **New** | **Project**를 선택합니다.
2. 왼쪽 목록에서 **Kotlin Multiplatform**을 선택합니다.
3. 필요에 따라 프로젝트의 이름, 위치 및 기타 기본 속성을 설정합니다.
4. 프로젝트의 JDK로 [JetBrains Runtime](https://github.com/JetBrains/JetBrainsRuntime) (JBR) 버전을 선택하는 것을 권장합니다. JBR은 특히 데스크톱 KMP 앱의 호환성을 개선하기 위한 중요한 수정 사항을 제공하기 때문입니다.
   관련 JBR 버전은 모든 IntelliJ IDEA 배포판에 포함되어 있으므로 추가 설정이 필요하지 않습니다.
5. 전체 데모를 만들려면 사용 가능한 모든 플랫폼(Android, iOS, Desktop, Web, Server)을 선택합니다.
   해당 타겟에 대해 Compose Multiplatform을 UI 프레임워크로 사용하려면 **Share UI** 옵션이 있는 경우 이를 선택된 상태로 둡니다.

   > 데스크톱 타겟에는 코드 변경 사항을 저장하자마자 UI 변경 사항을 볼 수 있는 [Compose Hot Reload](compose-hot-reload.md) 기능이 자동으로 포함됩니다.
   > 데스크톱 앱을 만들 계획이 없더라도 UI 코드 작성 속도를 높이기 위해 프로젝트에 데스크톱 타겟을 추가하고 싶을 수 있습니다.
   > 
   {style="note"}

6. 플랫폼 선택을 마치면 **Create** 버튼을 클릭하고 IDE가 프로젝트를 생성하고 가져올 때까지 기다립니다.

![기본 설정으로 Android, iOS, 데스크톱, 웹 플랫폼이 선택된 IntelliJ IDEA 마법사](idea-wizard-1step.png){width=600}

</TabItem>
<TabItem title= "Android Studio">

IDE 마법사를 사용하여 새 KMP 프로젝트를 만듭니다:

1. 메인 메뉴에서 **File** | **New** | **New project**를 선택합니다.
2. 기본 **Phone and Tablet** 템플릿 카테고리에서 **Kotlin Multiplatform**을 선택합니다.

    ![Android Studio의 프로젝트 생성 첫 단계](as-wizard-1.png){width="400"}

3. 필요에 따라 프로젝트의 이름, 위치 및 기타 기본 속성을 설정한 다음 **Next**를 클릭합니다.
4. 전체 데모를 만들려면 사용 가능한 모든 플랫폼(Android, iOS, Desktop, Web, Server)을 선택합니다.
   해당 타겟에 대해 Compose Multiplatform을 UI 프레임워크로 사용하려면 **Share UI** 옵션이 있는 경우 이를 선택된 상태로 둡니다.

   > 데스크톱 타겟에는 코드 변경 사항을 저장하자마자 UI 변경 사항을 볼 수 있는 [Compose Hot Reload](compose-hot-reload.md) 기능이 자동으로 포함됩니다.
   > 데스크톱 앱을 만들 계획이 없더라도 UI 코드 작성 속도를 높이기 위해 프로젝트에 데스크톱 타겟을 추가하고 싶을 수 있습니다.
   >
   {style="note"}

5. 플랫폼 선택을 마치면 **Finish** 버튼을 클릭하고 IDE가 프로젝트를 생성하고 가져올 때까지 기다립니다.

![Android, iOS, 데스크톱, 웹 플랫폼이 선택된 Android Studio 마법사의 마지막 단계](as-wizard-3step.png){width=600}

</TabItem>
</Tabs>

## 사전 점검 확인

**Project Environment Preflight Checks** 도구 창을 열어 프로젝트 설정에 환경 문제가 없는지 확인할 수 있습니다:
오른쪽 사이드바 또는 하단 바에 있는 사전 점검 아이콘을 클릭하세요. ![비행기 모양의 사전 점검 아이콘](ide-preflight-checks.png){width="20"}

이 도구 창에서 이러한 점검과 관련된 메시지를 확인하거나, 다시 실행하거나, 설정을 변경할 수 있습니다. 

사전 점검 명령은 **Search Everywhere(전체 검색)** 대화 상자에서도 사용할 수 있습니다.
<shortcut>Shift</shortcut>를 두 번 누르고 "preflight"라는 단어가 포함된 명령을 검색하세요:

![단어 "preflight"가 입력된 Search Everywhere 메뉴](double-shift-preflight-checks.png){width=600}

## 샘플 앱 실행

IDE 마법사로 생성된 프로젝트에는 iOS, Android, 데스크톱 및 웹 애플리케이션을 위해 생성된 실행 구성(run configurations)과 서버 앱을 실행하기 위한 Gradle 태스크가 포함되어 있습니다. 각 플랫폼에 대한 특정 Gradle 명령은 아래에 나열되어 있습니다.

<Tabs>
<TabItem title="Android">

Android 앱을 실행하려면 **androidApp** 실행 구성을 시작하세요:

![Android 실행 구성이 강조된 드롭다운](run-android-configuration.png){width=250}

Android 실행 구성을 수동으로 만들려면 실행 구성 템플릿으로 **Android App**을 선택하고 모듈로 **[프로젝트 이름].androidApp**을 선택합니다.

기본적으로 첫 번째 사용 가능한 가상 디바이스에서 실행됩니다:

![가상 디바이스에서 실행된 Android 앱](run-android-app.png){width=300}

</TabItem>
<TabItem title="iOS">

> iOS 앱을 빌드하려면 macOS 호스트와 Xcode 설치가 필요합니다.
>
{style="note"}

프로젝트에서 iOS 타겟을 선택하고 Xcode가 설치된 macOS 머신을 설정했다면, **iosApp** 실행 구성을 선택하고 시뮬레이션된 디바이스를 선택할 수 있습니다:

![iOS 실행 구성이 강조된 드롭다운](run-ios-configuration.png){width=250}

iOS 앱을 실행하면 내부적으로 Xcode로 빌드되어 iOS 시뮬레이터에서 실행됩니다.
가장 처음 빌드할 때는 컴파일을 위한 네이티브 종속성을 수집하고 이후 실행을 위해 빌드 속도를 예열합니다:

![가상 디바이스에서 실행된 iOS 앱](run-ios-app.png){width=350}

</TabItem>
<TabItem title="Desktop">

데스크톱 앱의 기본 실행 구성은 **desktopApp [hot] 🔥**으로 생성됩니다:

![기본 데스크톱 실행 구성이 강조된 드롭다운](run-desktop-configuration.png){width=250}

Hot Reload가 포함된 데스크톱 실행 구성을 수동으로 만들려면 **Gradle** 실행 구성 템플릿을 선택하고 다음 명령을 사용하여 **[앱 이름]:desktopApp** Gradle 프로젝트를 지정합니다:

```shell
hotRun --mainClass "com.example.demo.MainKt"
```

이 구성을 사용하면 JVM 데스크톱 앱을 실행할 수 있습니다:

![가상 디바이스에서 실행된 JVM 앱](run-desktop-app.png){width=600}

</TabItem>
<TabItem title="Web">

웹 앱의 기본 실행 구성은 **webApp [wasmJs]**로 생성됩니다:

![기본 Wasm 실행 구성이 강조된 드롭다운](run-wasm-configuration.png){width=250}

웹 실행 구성을 수동으로 만들려면 **Gradle** 실행 구성 템플릿을 선택하고 다음 명령을 사용하여 **[앱 이름]:webApp** Gradle 프로젝트를 지정합니다:

```shell
wasmJsBrowserDevelopmentRun
```

이 구성을 실행하면 IDE가 Kotlin/Wasm 앱을 빌드하고 기본 브라우저에서 엽니다:

![가상 디바이스에서 실행된 웹 앱](run-wasm-app.png){width=600}

</TabItem>
</Tabs>

## 트러블슈팅

### Java 및 JDK

Java와 관련된 일반적인 문제:

* 일부 도구가 실행할 Java 버전을 찾지 못하거나 잘못된 버전을 사용할 수 있습니다.
  이 문제를 해결하려면:
    * `JAVA_HOME` 환경 변수를 적절한 JDK가 설치된 디렉터리로 설정합니다.
  
      > 클래스 재정의(class redefinition)를 지원하는 OpenJDK 포크인 [JetBrains Runtime](https://github.com/JetBrains/JetBrainsRuntime)을 사용하는 것을 권장합니다.
      >
      {style="note"}
  
    * `JAVA_HOME` 내부의 `bin` 폴더 경로를 `PATH` 변수에 추가하여 JDK에 포함된 도구를 터미널에서 사용할 수 있도록 합니다.
* Android Studio에서 Gradle JDK와 관련된 문제가 발생하면 설정이 올바른지 확인하세요:
  **Settings** | **Build, Execution, Deployment** | **Build Tools** | **Gradle**을 선택합니다.

### Android 도구

JDK와 마찬가지로 `adb`와 같은 Android 도구를 실행하는 데 문제가 있는 경우, `ANDROID_HOME/tools`, `ANDROID_HOME/tools/bin`, `ANDROID_HOME/platform-tools` 경로가 `PATH` 환경 변수에 추가되어 있는지 확인하세요.

### Xcode

iOS 실행 구성에서 실행할 가상 디바이스가 없다고 보고하거나 사전 점검이 실패하는 경우, Xcode를 실행하여 iOS 시뮬레이터에 대한 업데이트가 있는지 확인하세요.

### 도움 받기

* **Kotlin Slack**: [초대](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)를 받고 [#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU) 채널에 참여하세요.
* **Kotlin Multiplatform Tooling 이슈 트래커**: [새 이슈를 보고하세요](https://youtrack.jetbrains.com/newIssue?project=KMT).

## 다음 단계

KMP 프로젝트의 구조와 공유 코드 작성에 대해 자세히 알아보세요:
* Compose Multiplatform을 사용한 공유 UI 코드 작업에 대한 튜토리얼 시리즈: [Compose Multiplatform 앱 만들기](compose-multiplatform-create-first-app.md)
* 네이티브 UI가 있는 프로젝트에서 공유 코드를 사용하는 튜토리얼 시리즈: [Kotlin Multiplatform 앱 만들기](multiplatform-create-first-app.md)
* Kotlin Multiplatform 문서를 심도 있게 살펴보세요:
  * [프로젝트 구성](multiplatform-project-configuration.md)
  * [멀티플랫폼 종속성 작업](https://kotlinlang.org/docs/multiplatform-add-dependencies.html)
* Compose Multiplatform UI 프레임워크, 기본 사항 및 플랫폼별 기능에 대해 알아보세요:
    [Compose Multiplatform과 Jetpack Compose의 관계](compose-multiplatform-and-jetpack-compose.md).

KMP를 위해 이미 작성된 코드를 찾아보세요:
* [Samples](multiplatform-samples.md) 페이지에서는 JetBrains의 공식 샘플과 KMP 기능을 보여주는 선별된 프로젝트 목록을 제공합니다.
* GitHub 토픽:
  * [kotlin-multiplatform](https://github.com/topics/kotlin-multiplatform), Kotlin Multiplatform으로 구현된 프로젝트.
  * [kotlin-multiplatform-sample](https://github.com/topics/kotlin-multiplatform-sample), KMP로 작성된 샘플 프로젝트 목록.
* [klibs.io](https://klibs.io) – 현재까지 2000개 이상의 라이브러리가 인덱싱된 KMP 라이브러리 검색 플랫폼으로, OkHttp, Ktor, Coil, Koin, SQLDelight 등을 포함합니다.