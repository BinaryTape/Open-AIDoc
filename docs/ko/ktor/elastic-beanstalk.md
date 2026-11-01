[//]: # (title: AWS Elastic Beanstalk에 Ktor 애플리케이션 배포하기)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<control>시작 프로젝트</control>: <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server">embedded-server</a> 또는 
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main">engine-main</a>
</p>
<p>
<control>최종 프로젝트</control>: <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/aws-elastic-beanstalk">aws-elastic-beanstalk</a>
</p>
</tldr>

이 튜토리얼에서는 Ktor 애플리케이션을 준비하고 Amazon Web Services(AWS) Elastic Beanstalk에 배포하는 방법을 알아봅니다.
[Ktor 서버를 생성](server-create-and-configure.topic)한 방식에 따라 다음 시작 프로젝트 중 하나를 사용할 수 있습니다.
* [embedded-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server)
* [engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main)

> AWS Elastic Beanstalk에 Java 애플리케이션을 배포하는 방법에 대한 자세한 내용은 [Elastic Beanstalk 문서](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create_deploy_Java.html)를 참조하세요.
>
{style="tip"}

## 사전 준비 사항 {id="prerequisites"}

이 튜토리얼을 시작하기 전에 AWS 계정을 생성해야 합니다.

## 샘플 애플리케이션 복제하기 {id="clone"}
샘플 애플리케이션을 열려면 다음 단계를 따르세요.

1. Ktor 문서 저장소를 복제(clone)하고 [codeSnippets](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets) 프로젝트를 엽니다.
2. [embedded-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server) 또는 [engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main) 샘플을 엽니다. 이 샘플들은 코드에서 직접 설정하거나 구성 파일을 사용하는 등 [Ktor 서버를 생성하고 구성](server-create-and-configure.topic)하는 서로 다른 방식을 보여줍니다. 이 프로젝트들을 배포할 때의 유일한 차이점은 들어오는 요청을 수신 대기하는 데 사용되는 [포트를 지정](#port)하는 방법뿐입니다.

## 애플리케이션 준비하기 {id="prepare-app"}

### 1단계: 포트 구성하기 {id="port"}

먼저 들어오는 요청을 수신 대기할 포트를 지정해야 합니다. Elastic Beanstalk은 요청을 애플리케이션의 5000번 포트로 전달합니다. 필요한 경우 `PORT` 환경 변수를 설정하여 기본 포트를 재정의할 수 있습니다. [Ktor 서버를 구성](server-create-and-configure.topic)한 방식에 따라 다음 방법 중 하나로 포트를 구성할 수 있습니다.
* 서버 구성이 코드에 지정된 [embedded-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server) 샘플을 선택한 경우, `System.getenv`를 사용하여 환경 변수 값을 가져오거나 환경 변수가 지정되지 않은 경우 기본값인 _5000_을 사용할 수 있습니다. `src/main/kotlin/com/example` 폴더에 있는 `Application.kt` 파일을 열고 아래와 같이 `embeddedServer` 함수의 `port` 매개변수 값을 변경합니다.
   ```kotlin
   fun main() {
      embeddedServer(Netty, port = (System.getenv("PORT")?:"5000").toInt()) {
      // ...
      }.start(wait = true)
   }
    ```

* `application.conf` 파일에 서버 구성이 지정된 [engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main) 샘플을 선택한 경우, `${ENV}` 구문을 사용하여 `port` 매개변수에 환경 변수를 할당할 수 있습니다. `src/main/resources`에 있는 `application.conf` 파일을 열고 아래와 같이 업데이트합니다.
   ```
   ktor {
       deployment {
           port = 5000
           port = ${?PORT}
       }
   }
   ```

### 2단계: Ktor 플러그인 적용하기 {id="configure-ktor-plugin"}

이 튜토리얼에서는 [fat JAR](server-fatjar.md)를 사용하여 AWS Elastic Beanstalk에 애플리케이션을 배포하는 방법을 보여줍니다.
fat JAR를 생성하려면 Ktor 플러그인을 적용해야 합니다.

<Path>build.gradle.kts</Path> 파일을 열고 `plugins {}` 블록에 플러그인을 추가합니다.
```groovy
plugins {
    alias(ktorLibs.plugins.ktor)
}
```

<note>
    위의 코드 스니펫은 Ktor 의존성을 지정하기 위해 <a href="server-dependencies.topic#using-version-catalog">Ktor 버전 카탈로그</a>를 사용합니다.
</note>

그런 다음 [메인 애플리케이션 클래스](server-dependencies.topic#create-entry-point)가 구성되어 있는지 확인합니다.
```kotlin
application {
    mainClass.set("io.ktor.server.netty.EngineMain")
}
```

## Fat JAR 빌드하기 {id="build"}

Fat JAR를 빌드하려면 터미널을 열고 [Ktor 플러그인](#configure-ktor-plugin)에서 제공하는 `buildFatJar` 작업을 실행합니다.

<Tabs group="os">
<TabItem title="Linux/macOS" group-key="unix">
<code-block code="./gradlew :aws-elastic-beanstalk:buildFatJar"/>
</TabItem>
<TabItem title="Windows" group-key="windows">
<code-block code="gradlew.bat :aws-elastic-beanstalk:buildFatJar"/>
</TabItem>
</Tabs>

이 빌드가 완료되면 <Path>build/libs</Path> 디렉터리에 `aws-elastic-beanstalk-all.jar` 파일이 생성된 것을 확인할 수 있습니다.

## 애플리케이션 배포하기 {id="deploy-app"}
애플리케이션을 배포하려면 [AWS Management Console](https://aws.amazon.com/console/)에 로그인하고 다음 단계를 진행하세요.
1. **AWS services** 그룹에서 **Elastic Beanstalk** 서비스를 엽니다.
2. 열린 페이지에서 **Create Application**을 클릭합니다.
3. 다음과 같이 애플리케이션 설정을 지정합니다.
   * **Application name**: 애플리케이션 이름을 지정합니다(예: _Sample Ktor app_).
   * **Platform**: 목록에서 _Java_를 선택합니다.
   * **Platform branch**: _Corretto 11 running on 64bit Amazon Linux 2_를 선택합니다.
   * **Application code**: _Upload your code_를 선택합니다.
   * **Source code origin**: _Local file_을 선택합니다. 그런 다음 **Choose file** 버튼을 클릭하고 [이전 단계](#build)에서 생성된 Fat JAR를 선택합니다. 파일이 업로드될 때까지 기다립니다.
4. **Create application** 버튼을 클릭하고 Beanstalk가 환경을 생성하고 애플리케이션을 배포할 때까지 몇 분 정도 기다립니다.
   ```
   INFO    Instance deployment completed successfully.
   INFO    Application available at Samplektorapp-env.eba-bnye2kpu.us-east-2.elasticbeanstalk.com.
   INFO    Successfully launched environment: Samplektorapp-env
   ```
   {style="block"}