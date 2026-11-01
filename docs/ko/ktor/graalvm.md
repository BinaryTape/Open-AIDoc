[//]: # (title: GraalVM)

[//]: # (title: GraalVM)

<tldr>
<p>
<control>샘플 프로젝트</control>: <a href="https://github.com/ktorio/ktor-samples/tree/main/graalvm">graalvm</a>
</p>
</tldr>

<web-summary>
Ktor 서버 애플리케이션은 다양한 플랫폼을 위한 네이티브 이미지를 생성하기 위해 GraalVM을 활용할 수 있습니다.
</web-summary>
<link-summary>
다양한 플랫폼용 네이티브 이미지를 위해 GraalVM을 사용하는 방법을 알아봅니다.
</link-summary>

Ktor 서버 애플리케이션은 다양한 플랫폼을 위한 네이티브 이미지를 생성하기 위해 [GraalVM](https://graalvm.org)을 활용할 수 있으며, 물론 GraalVM이 제공하는 더 빠른 시작 시간 및 기타 이점들을 누릴 수 있습니다.

현재 GraalVM을 활용하려는 Ktor 서버 애플리케이션은 [애플리케이션 엔진](server-engines.md)으로 CIO를 사용해야 합니다.

## GraalVM 준비 {id="prepare-for-graalvm"}

GraalVM을 설치하고 시스템 경로(PATH)에 설치 디렉터리를 포함하는 것 외에도, 모든 종속성이 번들링되도록 애플리케이션을 준비해야 합니다. 즉, fat jar를 생성해야 합니다.

### 리플렉션 설정 {id="reflection-configuration"}

GraalVM은 Ktor와 같이 리플렉션을 사용하는 애플리케이션에 대해 [몇 가지 요구 사항](https://www.graalvm.org/22.1/reference-manual/native-image/Reflection/)을 두고 있습니다. 
특정 타입 정보가 포함된 [JSON 파일](https://github.com/ktorio/ktor-samples/blob/main/graalvm/src/main/resources/META-INF/native-image/reflect-config.json)을 제공해야 합니다. 이 설정 파일은 `native-image` 도구의 인수로 전달됩니다.

## `native-image` 도구 실행 {id="execute-the-native-image-tool"}

fat jar가 준비되면 `native-image` CLI 도구를 사용하여 네이티브 이미지를 생성하기만 하면 됩니다. 
이 작업은 [Gradle 플러그인](https://graalvm.github.io/native-build-tools/0.9.8/gradle-plugin.html)을 통해서도 수행할 수 있습니다. 
`build.gradle.kts` 파일의 예시는 [여기](https://github.com/ktorio/ktor-samples/blob/main/graalvm/build.gradle.kts)에서 확인할 수 있습니다.
단, 사용하는 종속성, 프로젝트의 패키지 이름 등에 따라 일부 옵션이 달라질 수 있습니다.

## 생성된 바이너리 실행 {id="run-the-resulting-binary"}

셸 스크립트가 오류 없이 실행되면 네이티브 애플리케이션을 얻을 수 있으며, 샘플의 경우 `graal-server`라는 이름으로 생성됩니다. 이를 실행하면 Ktor 서버가 시작되고 `https://0.0.0.0:8080`에서 응답합니다.

[//]: # (<tldr>)

[//]: # (<var name="example_name" value="deployment-ktor-plugin"/>)

[//]: # (<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>)

[//]: # (</tldr>)

[//]: # ()
[//]: # (<link-summary>)

[//]: # (Ktor 서버 애플리케이션은 다양한 플랫폼을 위한 네이티브 이미지를 생성하기 위해 GraalVM을 활용할 수 있습니다.)

[//]: # (</link-summary>)

[//]: # ()
[//]: # (Ktor 서버 애플리케이션은 다양한 플랫폼을 위한 네이티브 이미지를 생성하기 위해 [GraalVM]&#40;https://graalvm.org&#41;을 활용할 수 있으며, 물론 GraalVM이 제공하는 더 빠른 시작 시간 및 기타 이점들을 누릴 수 있습니다. [Ktor Gradle 플러그인]&#40;https://github.com/ktorio/ktor-build-plugins&#41;을 사용하면 프로젝트의 GraalVM 네이티브 이미지를 빌드할 수 있습니다.)

[//]: # ()
[//]: # (> 현재 GraalVM을 활용하려는 Ktor 서버 애플리케이션은 [애플리케이션 엔진]&#40;Engines.md&#41;으로 CIO를 사용해야 합니다.)

[//]: # ()
[//]: # (## GraalVM 준비)

[//]: # ()
[//]: # (프로젝트의 GraalVM 네이티브 이미지를 빌드하기 전에 다음 필수 조건이 충족되었는지 확인하세요:)

[//]: # (- [GraalVM]&#40;https://www.graalvm.org/docs/getting-started/&#41; 및 [Native Image]&#40;https://www.graalvm.org/reference-manual/native-image/&#41;가 설치되어 있어야 합니다.)

[//]: # (- `GRAALVM_HOME` 및 `JAVA_HOME` 환경 변수가 설정되어 있어야 합니다.)

[//]: # ()
[//]: # (## Ktor 플러그인 설정 {id="configure-plugin"})

[//]: # (네이티브 실행 파일을 빌드하려면 먼저 Ktor 플러그인을 설정해야 합니다:)

[//]: # (1. `build.gradle.kts` 파일을 열고 `plugins` 블록에 플러그인을 추가합니다:)

[//]: # (   ```kotlin)

[//]: # (   ```)

[//]: # (   {src="snippets/deployment-ktor-plugin/build.gradle.kts" include-lines="1,4-5"})

[//]: # ()
[//]: # (2. [메인 애플리케이션 클래스]&#40;server-dependencies.xml#create-entry-point&#41;가 설정되어 있는지 확인합니다:)

[//]: # (   ```kotlin)

[//]: # (   ```)

[//]: # (   {src="snippets/deployment-ktor-plugin/build.gradle.kts" include-lines="7-9"})

[//]: # ()
[//]: # (## 네이티브 실행 파일 빌드 및 실행 {id="build"})

[//]: # ()
[//]: # (Ktor 플러그인에서 제공하는 `buildNativeImage` 태스크는 `build/native/nativeCompile` 디렉터리에 애플리케이션의 네이티브 실행 파일을 생성합니다.)

[//]: # (이를 실행하면 Ktor 서버가 시작되고 기본적으로 `https://0.0.0.0:8080`에서 응답합니다.)