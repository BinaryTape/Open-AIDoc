[//]: # (title: Ktor Gradle 플러그인을 사용하여 Fat JAR 생성하기)

<tldr>
<var name="example_name" value="deployment-ktor-plugin"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>Ktor Gradle 플러그인을 사용하여 실행 가능한 fat JAR를 생성하고 실행하는 방법을 알아봅니다.</link-summary>

[Ktor Gradle 플러그인](https://github.com/ktorio/ktor-build-plugins)을 사용하면 모든 코드 의존성을 포함하는 실행 가능한 JAR(fat JAR)를 생성하고 실행할 수 있습니다.

## Ktor 플러그인 설정 {id="configure-plugin"}

fat JAR를 빌드하려면 먼저 Ktor 플러그인을 설정해야 합니다:

1. <Path>build.gradle.kts</Path> 파일을 열고 `plugins {}` 블록에 Ktor 플러그인을 추가합니다:
   ```kotlin
   plugins {
       alias(ktorLibs.plugins.ktor)
   }
   ```

   <note>
       위 코드 스니펫은 Ktor 의존성을 지정하기 위해 <a href="server-dependencies.topic#using-version-catalog">
       Ktor 버전 카탈로그</a>를 사용합니다.
   </note>

2. [메인 애플리케이션 클래스](server-dependencies.topic#create-entry-point)가 설정되어 있는지 확인합니다:
   ```kotlin
   application {
       mainClass.set("com.example.ApplicationKt")
   }
   ```

3. 필요한 경우 `ktor.fatJar` 확장을 사용하여 생성될 fat JAR의 이름을 설정할 수 있습니다:
   ```kotlin
   ktor {
       fatJar {
           archiveFileName.set("fat.jar")
       }
   }
   ```

> Ktor Gradle 플러그인을 Kotlin Multiplatform Gradle 플러그인과 함께 적용하면 fat JAR 생성 기능이 자동으로 비활성화됩니다.
> 두 플러그인을 함께 사용하려면 다음과 같이 하세요:
> 1. 위와 같이 Ktor Gradle 플러그인이 적용된 JVM 전용 프로젝트를 생성합니다.
> 2. 해당 JVM 전용 프로젝트에 Kotlin Multiplatform 프로젝트를 의존성으로 추가합니다.
> 
> 이 해결 방법으로 문제가 해결되지 않는다면 [KTOR-8464](https://youtrack.jetbrains.com/issue/KTOR-8464)에 댓글을 남겨 알려주세요.
>
{style="warning"}

## Fat JAR 빌드 및 실행 {id="build"}

Ktor 플러그인은 fat JAR를 생성하고 실행하기 위한 다음과 같은 태스크를 제공합니다:
- `buildFatJar`: 프로젝트와 런타임 의존성이 결합된 JAR를 빌드합니다. 빌드가 완료되면 `build/libs` 디렉터리에 `***-all.jar` 파일이 생성됩니다.
- `runFatJar`: 프로젝트의 fat JAR를 빌드하고 실행합니다.

> ProGuard를 사용하여 생성된 JAR의 크기를 최소화하는 방법을 알아보려면 [proguard](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/proguard) 샘플을 참조하세요.