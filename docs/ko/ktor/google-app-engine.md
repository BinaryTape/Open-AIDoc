[//]: # (title: Google App Engine에 Ktor 앱 배포하기)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<control>시작 프로젝트</control>: <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main">engine-main</a>
</p>
<p>
<control>최종 프로젝트</control>: <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/google-appengine-standard">google-appengine-standard</a>
</p>
</tldr>

<web-summary>
이 튜토리얼에서는 Ktor 프로젝트를 준비하고 Google App Engine 표준 환경(standard environment)에 배포하는 방법을 설명합니다.
</web-summary>

<link-summary>
Google App Engine 표준 환경에 프로젝트를 배포하는 방법을 알아보세요.
</link-summary>

이 튜토리얼에서는 Ktor 프로젝트를 준비하고 Google App Engine 표준 환경에 배포하는 방법을 알아봅니다. 
이 튜토리얼은 [engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main) 샘플 프로젝트를 시작점으로 사용합니다.

## 사전 준비 작업 {id="prerequisites"}

이 튜토리얼을 시작하기 전에 다음 단계를 완료하세요.
* [Google Cloud Platform](https://console.cloud.google.com/)에 가입합니다.
* [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)를 설치하고 초기화합니다.
* 다음 명령어를 실행하여 App Engine Java 확장 프로그램을 설치합니다.
   ```Bash
   gcloud components install app-engine-java
   ```

## 샘플 애플리케이션 클론하기 {id="clone"}

샘플 애플리케이션을 열려면 다음 단계를 따르세요.

1. Ktor 문서 저장소를 클론하고 [`codeSnippets`](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets) 프로젝트를 엽니다.
2. [engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main) 모듈을 엽니다.
   > Ktor는 코드에서 직접 설정하거나 설정 파일을 사용하는 두 가지 [서버 생성 및 구성 방식](server-create-and-configure.topic)을 제공합니다. 이 튜토리얼의 배포 프로세스는 두 방식 모두 동일하게 적용됩니다.
   >
   {style="note"}

## 애플리케이션 준비하기 {id="prepare-app"}

### 1단계: Shadow 플러그인 적용하기 {id="configure-shadow-plugin"}

이 튜토리얼에서는 [fat JAR](server-fatjar.md)를 사용하여 애플리케이션을 Google App Engine에 배포하는 방법을 보여줍니다. fat JAR를 생성하려면 Shadow 플러그인을 적용해야 합니다.

먼저 <Path>gradle/libs.versions.toml</Path> 파일을 열고 Shadow 플러그인 버전과 별칭(alias)을 정의합니다.

```toml
[versions]
shadow = "8.3.10"

[plugins]
shadow = { id = "com.gradleup.shadow", version.ref = "shadow" }
```

그런 다음 <Path>build.gradle.kts</Path> 파일을 열고 `plugins` 블록에 플러그인을 추가합니다.
```kotlin
plugins {
    alias(libs.plugins.shadow)
}
```

### 2단계: App Engine 플러그인 구성하기 {id="configure-app-engine-plugin"}

[Google App Engine Gradle 플러그인](https://github.com/GoogleCloudPlatform/app-gradle-plugin)은 Google App Engine 애플리케이션을 빌드하고 배포하기 위한 작업을 제공합니다. 이 플러그인을 사용하려면 다음 단계를 따르세요.

1. <Path>settings.gradle.kt</Path> 파일을 열고 다음 코드를 사용하여 Maven Central 저장소의 플러그인을 참조하도록 설정합니다.
   ```kotlin
   pluginManagement {
       repositories {
           if (!providers.gradleProperty("build_snapshot_train").orNull.isNullOrEmpty()) {
               mavenLocal()
               maven("https://redirector.kotlinlang.org/maven/dev")
           }
           gradlePluginPortal()
           mavenCentral()
           maven("https://redirector.kotlinlang.org/maven/ktor-eap")
       }
       resolutionStrategy {
           eachPlugin {
               if (requested.id.id.startsWith("com.google.cloud.tools.appengine")) {
                   useModule("com.google.cloud.tools:appengine-gradle-plugin:${requested.version}")
   ```

2. <Path>build.gradle.kts</Path> 파일을 열고 `plugins` 블록에 플러그인을 적용합니다.
   ```kotlin
   plugins {
       alias(libs.plugins.appengine)
   }
   ```

3. 동일한 <Path>build.gradle.kts</Path> 파일에 다음과 같은 설정으로 `appengine` 블록을 추가합니다.
   ```kotlin
   import com.google.cloud.tools.gradle.appengine.appyaml.AppEngineAppYamlExtension
   configure<AppEngineAppYamlExtension> {
       stage {
           setArtifact("build/libs/${project.name}-all.jar")
       }
       deploy {
           version = "GCLOUD_CONFIG"
           projectId = "GCLOUD_CONFIG"
       }
   }
   ```

### 3단계: App Engine 설정 구성하기 {id="configure-app-engine-settings"}

애플리케이션의 App Engine 설정은 [<Path>app.yaml</Path>](https://cloud.google.com/appengine/docs/standard/python/config/appref) 파일에서 구성합니다.
1. <Path>src/main</Path> 내에 <Path>appengine</Path> 디렉터리를 생성합니다.
2. 이 디렉터리 안에 <Path>app.yaml</Path> 파일을 생성하고 다음 내용을 추가합니다.
   ```yaml
   runtime: java21
   entrypoint: 'java -jar google-appengine-standard-all.jar'
   
   ```

   `google-appengine-standard` 부분을 실제 프로젝트 이름으로 변경하세요.

   `entrypoint` 옵션에는 애플리케이션용으로 생성된 fat JAR를 실행하는 데 사용되는 명령어가 포함됩니다.

   > 지원되는 구성 옵션에 대한 자세한 내용은 [Google App Engine 문서](https://cloud.google.com/appengine/docs/standard/reference/app-yaml?tab=java)를 참조하세요.
   >
   {style="tip"}

## 애플리케이션 배포하기 {id="deploy-app"}

애플리케이션을 배포하려면 새 터미널 창을 열고 다음 단계를 따르세요.

1. 먼저 애플리케이션 리소스를 담는 최상위 컨테이너인 Google Cloud 프로젝트를 생성합니다. 예를 들어 아래 명령어는 `ktor-sample-app-engine`이라는 이름의 프로젝트를 생성합니다.
   ```Bash
   gcloud projects create ktor-sample-app-engine --set-as-default
   ```
   
2. 해당 Cloud 프로젝트에 대한 App Engine 애플리케이션을 생성합니다.
   ```Bash
   gcloud app create
   ```

3. 애플리케이션을 배포하려면 `appengineDeploy` Gradle 작업을 실행합니다.
   ```Bash
   ./gradlew appengineDeploy
   ```
4. Google Cloud가 애플리케이션을 빌드하고 게시할 때까지 기다립니다.
   ```
   ...done.
   Deployed service [default] to [https://ktor-sample-app-engine.ew.r.appspot.com]
   ```
   {style="block"}
   > 빌드 도중 `Cloud Build has not been used in project` 오류가 발생하는 경우 오류 보고서의 안내에 따라 Cloud Build를 활성화하세요.
   >
   {style="note"}

   > 전체 코드 예제는 [google-appengine-standard](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/google-appengine-standard)에서 확인할 수 있습니다.
   > 
   {style="tip"}