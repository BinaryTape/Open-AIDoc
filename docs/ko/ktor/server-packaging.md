[//]: # (title: 애플리케이션 배포본 생성)

<tldr>
<var name="example_name" value="deployment-ktor-plugin"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[Ktor Gradle 플러그인](https://github.com/ktorio/ktor-build-plugins)은 코드 의존성과 생성된 시작 스크립트를 포함하여 애플리케이션을 패키징하는 기능을 제공하는 Gradle [Application 플러그인](https://docs.gradle.org/current/userguide/application_plugin.html)을 자동으로 적용합니다.

이 문서에서는 Ktor 애플리케이션을 패키징하고 실행하는 방법을 배웁니다.

## Ktor 플러그인 구성 {id="configure-plugin"}

애플리케이션 배포본을 생성하려면 먼저 Ktor 플러그인을 적용해야 합니다:
1. <Path>build.gradle.kts</Path> 파일을 열고 `plugins {}` 블록에 플러그인을 추가합니다:
   ```kotlin
   plugins {
       alias(ktorLibs.plugins.ktor)
   }
   ```

   <note>
       위 코드 스니펫은 <a href="server-dependencies.topic#using-version-catalog">
       Ktor 버전 카탈로그</a>를 사용하여 Ktor 의존성을 지정합니다.
   </note>

2. [메인 애플리케이션 클래스](server-dependencies.topic#create-entry-point)가 구성되어 있는지 확인합니다:
   ```kotlin
   application {
       mainClass.set("com.example.ApplicationKt")
   }
   ```

## 애플리케이션 패키징 {id="package"}

Application 플러그인은 애플리케이션을 패키징하기 위한 다양한 방법을 제공합니다. 예를 들어 `installDist` 태스크는 모든 런타임 의존성 및 시작 스크립트와 함께 애플리케이션을 설치합니다. 완전한 배포 아카이브를 생성하려면 `distZip` 및 `distTar` 태스크를 사용할 수 있습니다.

모든 런타임 의존성 및 시작 스크립트와 함께 애플리케이션을 설치하려면 새 터미널 창을 열고 `installDist` 태스크를 실행합니다:
   
<Tabs group="os">
<TabItem title="Linux/macOS" group-key="unix">
<code-block code="./gradlew installDist"/>
</TabItem>
<TabItem title="Windows" group-key="windows">
<code-block code="gradlew.bat installDist"/>
</TabItem>
</Tabs>

Application 플러그인은 <Path>build/install/<project_name></Path> 폴더에 애플리케이션 이미지를 생성합니다. 

## 애플리케이션 실행 {id="run"}

[패키징된 애플리케이션](#package)을 실행하려면 다음 단계를 따르세요:

1. 터미널에서 <Path>build/install/<project_name>/bin</Path> 폴더로 이동합니다.
2. 운영체제에 따라 `<project_name>` 또는 `<project_name>.bat` 실행 파일을 실행합니다. 예:

   <snippet id="run_executable">
   <Tabs group="os">
   <TabItem title="Linux/macOS" group-key="unix">
   <code-block code="./ktor-sample"/>
   </TabItem>
   <TabItem title="Windows" group-key="windows">
   <code-block code="ktor-sample.bat"/>
   </TabItem>
   </Tabs>
   </snippet>
   
3. 다음 메시지가 표시될 때까지 기다립니다:
   ```Bash
   [main] INFO  Application - Responding at http://0.0.0.0:8080
   ```
   브라우저에서 해당 링크를 열어 실행 중인 애플리케이션을 확인합니다:

   <img src="ktor_idea_new_project_browser.png" alt="브라우저에서 실행 중인 Ktor 앱" width="430"/>