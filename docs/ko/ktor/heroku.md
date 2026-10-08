[//]: # (title: Heroku)

<show-structure for="chapter" depth="2"/>

<link-summary>Ktor 애플리케이션을 준비하여 Heroku에 배포하는 방법을 알아봅니다.</link-summary>

이 튜토리얼에서는 Ktor 애플리케이션을 Heroku에 배포하기 위해 준비하고 배포하는 방법을 설명합니다.

## 사전 준비 사항 {id="prerequisites"}

이 튜토리얼을 시작하기 전에 다음 사항이 충족되었는지 확인하세요:
* Heroku 계정이 있어야 합니다.
* 로컬 머신에 [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)가 설치되어 있어야 합니다.

## 샘플 애플리케이션 생성 {id="create-sample-app"}

[새 Ktor 프로젝트 생성, 열기 및 실행](server-create-a-new-project.topic)에 설명된 대로 샘플 애플리케이션을 생성합니다.

> Ktor는 [서버를 생성하고 설정](server-create-and-configure.topic)하는 두 가지 방식(코드 사용 또는 설정 파일 사용)을 제공합니다. 배포 시 유일한 차이점은 들어오는 요청을 수신하는 데 사용되는 [포트(port)를 지정](#port)하는 방법입니다.
> 
{style="note"}

## 애플리케이션 준비 {id="prepare-app"}

### 1단계: 포트 설정 {id="port"}

먼저, 들어오는 요청을 수신하는 데 사용할 포트를 지정해야 합니다. Heroku는 `PORT` 환경 변수(environment variable)를 사용하므로, 이 변수의 값을 사용하도록 애플리케이션을 설정해야 합니다. [Ktor 서버를 설정](server-create-and-configure.topic)하는 방식에 따라 다음 중 하나를 수행하세요:
* 서버 설정이 코드에 명시된 경우, `System.getenv`를 사용하여 환경 변수 값을 가져올 수 있습니다. <Path>src/main/kotlin/com/example</Path> 폴더에 있는 <Path>Application.kt</Path> 파일을 열고 `embeddedServer()` 함수의 `port` 파라미터 값을 아래와 같이 변경하세요:

   ```kotlin
   fun main() {
      embeddedServer(Netty, port = System.getenv("PORT")?.toIntOrNull() ?: 8080) {
          // ...
      }.start(wait = true)
   }
    ```

* 서버 설정이 <Path>application.conf</Path> 파일에 명시된 경우, `${ENV}` 구문을 사용하여 `port` 파라미터에 환경 변수를 할당할 수 있습니다. <Path>src/main/resources</Path>에 있는 <Path>application.conf</Path> 파일을 열고 아래와 같이 업데이트하세요:

   ```
   ktor {
       deployment {
           port = 8080
           port = ${?PORT}
       }
   }
   ```

### 2단계: stage 태스크 추가 {id="stage"}

<Path>build.gradle.kts</Path> 파일을 열고 커스텀 `stage` 태스크를 추가합니다. Heroku는 Heroku 플랫폼에서 실행되는 실행 파일을 만들기 위해 `stage` 태스크를 사용합니다:

```kotlin
tasks {
    create("stage").dependsOn("installDist")
}
``` 

> `installDist` 태스크는 Gradle [application 플러그인](https://docs.gradle.org/current/userguide/application_plugin.html)과 함께 제공되며, 샘플 프로젝트에는 이미 추가되어 있습니다.
>
{style="note"}

### 3단계: Procfile 생성 {id="procfile"}

프로젝트 루트에 [Procfile](https://devcenter.heroku.com/articles/procfile)을 생성하고 다음 내용을 추가합니다:

```
web: ./build/install/ktor-get-started-sample/bin/ktor-get-started-sample
```

이 파일은 [`stage`](#stage) 태스크에 의해 생성된 애플리케이션 실행 파일의 경로를 지정하며, Heroku가 애플리케이션을 시작할 수 있게 해줍니다.
`ktor-get-started-sample` 부분을 본인의 프로젝트 이름으로 변경해야 할 수도 있습니다.

### 4단계: Java 버전 지정(선택 사항) {id="java-version"}

기본적으로 Heroku는 애플리케이션을 실행하는 데 Java 25를 사용합니다. 만약 Ktor 애플리케이션이 다른 Java 버전으로 컴파일되었다면, 배포 실패를 방지하기 위해 이를 명시적으로 지정해야 합니다.

Java 버전을 지정하려면 프로젝트의 루트 폴더에 다음 내용을 포함하는 <Path>system.properties</Path> 파일을 생성하세요:

```bash
java.runtime.version=21
```

`21`을 원하는 Java 버전으로 변경하세요.

> 자세한 내용은 [Java 버전 지정에 관한 Heroku 문서](https://devcenter.heroku.com/articles/java-support#specifying-a-java-version)를 참조하세요.
>
{style="tip"}

## 애플리케이션 배포 {id="deploy-app"}

Git을 사용하여 Heroku에 애플리케이션을 배포하려면 새 터미널 창을 열고 다음 단계를 따르세요:

1. [이전 섹션](#prepare-app)에서 변경한 내용을 로컬에 커밋합니다:
   ```Bash
   git add .
   git commit -m "Prepare app for deploying"
   ```
2. Heroku CLI에 로그인합니다:
   ```Bash
   heroku login
   ```
3. `heroku create` 명령어를 사용하여 Heroku 애플리케이션을 생성합니다.
   `ktor-sample-heroku`를 본인의 애플리케이션 이름으로 변경하세요:
   ```Bash
   heroku create ktor-sample-heroku
   ```
   이 명령어는 다음 두 가지 작업을 수행합니다:
   * 새로운 Heroku 애플리케이션을 생성하며, 이는 [웹 대시보드](https://dashboard.heroku.com/apps/)에서 확인할 수 있습니다.
   * 로컬 저장소에 `heroku`라는 이름의 새로운 Git 원격 저장소(remote)를 추가합니다.

4. 애플리케이션을 배포하려면 변경 사항을 `heroku main`으로 푸시합니다:
   ```Bash
   git push heroku main
   ```
5. Heroku가 애플리케이션을 빌드하고 게시할 때까지 기다립니다. 완료되면 다음과 같은 출력이 표시됩니다:
   ```bash
   ...
   remote: https://ktor-sample-heroku.herokuapp.com/ deployed to Heroku
   remote:
   remote: Verifying deploy... done.
   ```
