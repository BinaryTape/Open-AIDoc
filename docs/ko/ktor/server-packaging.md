[//]: # (title: 애플리케이션 배포본 생성하기)

<tldr>
<var name="example_name" value="deployment-ktor-plugin"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[Ktor Gradle 플러그인](https://github.com/ktorio/ktor-build-plugins)은 코드 의존성과 생성된 시작 스크립트를 포함하여 애플리케이션을 패키징하는 기능을 제공하는 Gradle [Application 플러그인](https://docs.gradle.org/current/userguide/application_plugin.html)을 자동으로 적용합니다. 이 주제에서는 Ktor 애플리케이션을 패키징하고 실행하는 방법을 보여줍니다.

## Ktor 플러그인 설정 {id="configure-plugin"}
애플리케이션 배포본을 생성하려면 먼저 Ktor 플러그인을 적용해야 합니다.
1. `build.gradle.kts` 파일을 열고 `plugins` 블록에 플러그인을 추가합니다:
   ```kotlin
   plugins {
       id("io.ktor.plugin") version "3.4.0"
   }
   ```

2. [메인 애플리케이션 클래스](server-dependencies.topic#create-entry-point)가 구성되어 있는지 확인합니다:
   ```kotlin
   application {
       mainClass.set("com.example.ApplicationKt")
   }
   ```

## 애플리케이션 패키징 {id="package"}
Application 플러그인은 애플리케이션을 패키징하는 다양한 방법을 제공합니다. 예를 들어, `installDist` 태스크는 모든 런타임 의존성과 시작 스크립트와 함께 애플리케이션을 설치합니다. 전체 배포 아카이브를 생성하려면 `distZip` 및 `distTar` 태스크를 사용할 수 있습니다.

이 주제에서는 `installDist`를 사용합니다:
1. 터미널을 엽니다.
2. 운영 체제에 따라 다음 방법 중 하나로 `installDist` 태스크를 실행합니다:
   
   <Tabs group="os">
   <TabItem title="Linux/macOS" group-key="unix">
   <code-block code="./gradlew installDist"></code-block>
   </TabItem>
   <TabItem title="Windows" group-key="windows">
   <code-block code="gradlew.bat installDist"></code-block>
   </TabItem>
   </Tabs>

   Application 플러그인은 `build/install/<project_name>` 폴더에 애플리케이션 이미지를 생성합니다. 

## 애플리케이션 실행 {id="run"}
[패키징된 애플리케이션](#package)을 실행하려면:
1. 터미널에서 `build/install/<project_name>/bin` 폴더로 이동합니다.
2. 운영 체제에 따라 `<project_name>` 또는 `<project_name>.bat` 실행 파일을 실행합니다. 예를 들어:

   <snippet id="run_executable">
   <Tabs group="os">
   <TabItem title="Linux/macOS" group-key="unix">
   <code-block code="./ktor-sample"></code-block>
   </TabItem>
   <TabItem title="Windows" group-key="windows">
   <code-block code="ktor-sample.bat"></code-block>
   </TabItem>
   </Tabs>
   </snippet>
   
3. 다음 메시지가 표시될 때까지 기다립니다:
   ```Bash
   [main] INFO  Application - Responding at http://0.0.0.0:8080
   ```
   브라우저에서 링크를 열어 실행 중인 애플리케이션을 확인합니다:

   <img src="ktor_idea_new_project_browser.png" alt="브라우저에서의 Ktor 앱" width="430"/>