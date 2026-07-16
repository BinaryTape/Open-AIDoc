[//]: # (title: Azure App Service)

<show-structure for="chapter" depth="2"/>

<link-summary>이 튜토리얼에서는 Ktor 애플리케이션을 빌드, 설정하고 [Azure App Service](https://azure.microsoft.com/products/app-service/)에 배포하는 방법을 보여줍니다.</link-summary>

이 튜토리얼에서는 Ktor 애플리케이션을 빌드, 설정하고 [Azure App Service](https://azure.microsoft.com/products/app-service/)에 배포하는 방법을 보여줍니다.

## 사전 요구 사항 {id="prerequisites"}
이 튜토리얼을 시작하기 전에 다음 사항이 필요합니다:
* Azure 계정 ([여기에서 무료 체험 가능](https://azure.microsoft.com/en-us/free/)).
* 로컬 머신에 설치된 [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli).

## 샘플 애플리케이션 생성 {id="create-sample-app"}

[새 Ktor 프로젝트 생성, 열기 및 실행](server-create-a-new-project.topic)에 설명된 대로 샘플 애플리케이션을 생성합니다. 이 예제는 [embedded-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server) 및 [engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main) 프로젝트를 기반으로 코드와 명령어를 보여줍니다.

> 위 튜토리얼은 애플리케이션을 설정하는 두 가지 방법을 제공합니다. 코드에서 직접 값을 지정하거나 설정 파일을 사용하는 방법입니다. 두 경우 모두 핵심 설정은 서버가 들어오는 요청을 대기하는 포트(port)입니다.

## 애플리케이션 설정 {id="setup-app"}

### 1단계: 포트 설정 {id="port"}

Azure App Service에서 환경 변수 `PORT`에는 들어오는 요청에 대해 열려 있는 포트 번호가 포함되어 있습니다. [Ktor 서버 설정](server-create-and-configure.topic)에서 앱을 생성한 방식에 따라, 다음 두 곳 중 하나에서 이 환경 변수를 읽도록 코드를 업데이트해야 합니다:

* **코드에서** 포트 설정을 사용하는 예제를 선택했다면, `System.getenv()`로 `PORT` 환경 변수를 읽고 `.toIntOrNull()`을 사용하여 정수로 파싱할 수 있습니다. `Application.kt` 파일을 열고 아래와 같이 포트 번호를 변경하세요:

   ```kotlin
   fun runBasicServer() {
      val port = System.getenv("PORT")?.toIntOrNull() ?: 8080
      embeddedServer(Netty, port = port) {
          // ...
      }.start(wait = true)
   }
    ```
* 서버 설정이 **설정 파일** `application.conf`에 정의되어 있다면, 다음 예제와 같이 `PORT` 환경 변수를 읽도록 업데이트하세요:

   ```
   ktor {
       deployment {
           port = ${PORT:8080}
       }
   }
   ```
   {style="block"}

### 2단계: 플러그인 추가 {id="plugins"}
`build.gradle.kts` 파일을 열고 `plugins` 섹션에 다음 라인을 추가합니다:
```kotlin
plugins {
    application
    kotlin("jvm")
    id("io.ktor.plugin") version "%ktor_version%" // 추가됨
    id("com.microsoft.azure.azurewebapp") version "1.10.0" // 추가됨
}
```

`io.ktor.plugin`은 [Fat JAR](server-fatjar.md)를 생성하는 데 사용되는 태스크를 제공하며, [Gradle용 Azure WebApp 플러그인](https://github.com/microsoft/azure-gradle-plugins)은 Azure에서 필요한 모든 리소스를 쉽게 생성하는 데 사용됩니다.

Fat JAR의 진입점(entry point)이 명확하게 정의되도록 `application` 섹션에 `mainClass`가 정의되어 있는지 확인하세요:

```kotlin
application {
    mainClass.set("com.example.ApplicationKt")
}
```
`engine-main` 템플릿으로 프로젝트를 생성했다면, 메인 클래스는 다음과 같을 것입니다:

```kotlin
application {
    mainClass.set("io.ktor.server.netty.EngineMain")
}
```

### 3단계: 구성 {id="configuration"}

배포하려는 Java 웹 앱이 App Service에 이미 생성되어 있다면 이 단계를 건너뛸 수 있습니다.

그렇지 않은 경우, Azure Webapp 플러그인이 앱을 생성할 수 있도록 `build.gradle.kts` 파일 끝에 다음 항목들을 추가하세요:

```kotlin
 // Fat JAR의 이름을 배포 태스크가 기대하는 이름으로 변경합니다.
ktor {
    fatJar {
        archiveFileName.set("embedded-server.jar")
    }
}

// Azure 플러그인이 평소에 실행하는 `jar` 태스크를 비활성화하고,
// 대신 `fatJar` 태스크가 생성한 아카이브를 배포하도록 합니다.
tasks.named("jar") {
    enabled = false
}

// 배포 태스크가 실행되기 전에 먼저 Fat JAR를 빌드하도록 보장합니다.
tasks.named("azureWebAppDeploy") {
    dependsOn("buildFatJar")
}

// Azure Webapp 플러그인 설정
azurewebapp {
  subscription = "YOUR-SUBSCRIPTION-ID"
  resourceGroup = "RESOURCE-GROUP-NAME"
  appName = "WEBAPP-NAME"
  pricingTier = "YOUR-PLAN" // 예: "F1", "B1", "P0v3" 등
  region = "YOUR-REGION" // 예: "westus2"
  setRuntime(closureOf<com.microsoft.azure.gradle.configuration.GradleRuntimeConfig> {
    os("Linux") // 또는 "Windows"
    webContainer("Java SE")
    javaVersion("Java 21")
  })
  setAuth(closureOf<com.microsoft.azure.gradle.auth.GradleAuthConfig> {
    type = "azure_cli"
  })
}
```

사용 가능한 구성 속성에 대한 자세한 설명은 [Webapp 구성 문서](https://github.com/microsoft/azure-gradle-plugins/wiki/Webapp-Configuration)를 참조하세요.

* `pricingTier`(서비스 플랜) 값은 [Linux용](https://azure.microsoft.com/en-us/pricing/details/app-service/linux/) 및 [Windows용](https://azure.microsoft.com/en-us/pricing/details/app-service/windows/)에서 확인할 수 있습니다.
* `region` 값 목록은 Azure CLI 명령 `az account list-locations --query "[].name" --output tsv`를 실행하거나 [제품 가용성 테이블](https://go.microsoft.com/fwlink/?linkid=2300348&clcid=0x409)에서 "App Service"를 검색하여 얻을 수 있습니다.

## 애플리케이션 배포 {id="deploy-app"}

### 새로운 웹 앱으로 배포하기

Azure Web App Deploy 플러그인에서 사용하는 인증 방식은 Azure CLI를 사용합니다. 아직 로그인하지 않았다면 `az login`을 한 번 실행하고 지침을 따르세요.

마지막으로, Fat JAR를 먼저 빌드하고 배포하도록 설정된 `azureWebAppDeploy` 태스크를 실행하여 애플리케이션을 배포합니다:

<Tabs group="os">
<TabItem title="Linux/macOS" group-key="unix">
<code-block code="./gradlew :embedded-server:azureWebAppDeploy"></code-block>
</TabItem>
<TabItem title="Windows" group-key="windows">
<code-block code="gradlew.bat :embedded-server:azureWebAppDeploy"></code-block>
</TabItem>
</Tabs>

이 태스크는 리소스 그룹, 플랜, 웹 앱을 생성한 다음 Fat JAR를 배포합니다. 배포가 성공하면 다음과 같은 출력이 표시됩니다:

```text
> Task: :embedded-server:azureWebAppDeploy
Auth type: AZURE_CLI
Username: some.username@example.com
Subscription: Some Subscription(13936cf1-cc18-40be-a0d4-177fe532b3dd)
Start creation Resource Group(resource-group) in region (Some Region)
Resource Group (resource-group) is successfully created.
Start creating App Service plan (asp-your-webapp-name)...
App Service plan (asp-your-webapp-name) is successfully created
Start creating Web App(your-webapp-name)...
Web App(your-webapp-name) is successfully created
Trying to deploy artifact to your-webapp-name...
Deploying (C:\docs\ktor-documentation\codeSnippets\snippets\embedded-server\build\libs\embedded-server.jar)[jar] ...
Application url: https://your-webapp-name.azurewebsites.net
```

배포가 완료되면 위에 표시된 URL에서 새 웹 앱이 실행되는 것을 확인할 수 있습니다.

### 기존 웹 앱으로 배포하기

Azure App Service에 기존 Java 웹 앱이 이미 있는 경우, 먼저 [Ktor 플러그인](#plugins)에서 제공하는 `buildFatJar` 태스크를 실행하여 Fat JAR를 빌드합니다:

<Tabs group="os">
<TabItem title="Linux/macOS" group-key="unix">
<code-block code="./gradlew :embedded-server:buildFatJar"></code-block>
</TabItem>
<TabItem title="Windows" group-key="windows">
<code-block code="gradlew.bat :embedded-server:buildFatJar"></code-block>
</TabItem>
</Tabs>

그런 다음, Azure CLI의 다음 명령을 사용하여 이전에 생성된 Fat JAR를 배포합니다:

```bash
az webapp deploy -g RESOURCE-GROUP-NAME -n WEBAPP-NAME --src-path ./path/to/embedded-server.jar --restart true
```

이 명령은 JAR 파일을 업로드하고 웹 앱을 다시 시작합니다. 잠시 후 배포 결과가 표시됩니다:

```text
Deployment type: jar. To override deployment type, please specify the --type parameter. Possible values: war, jar, ear, zip, startup, script, static
Initiating deployment
Deploying from local path: ./snippets/embedded-server/build/libs/embedded-server.jar
Warming up Kudu before deployment.
Warmed up Kudu instance successfully.
Polling the status of sync deployment. Start Time: 2025-09-07 00:07:14.729383+00:00 UTC
Status: Build successful. Time: 5(s)
Status: Starting the site... Time: 23(s)
Status: Starting the site... Time: 41(s)
Status: Site started successfully. Time: 44(s)
Deployment has completed successfully
You can visit your app at: http://your-app-name.some-region.azurewebsites.net