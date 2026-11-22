[//]: # (title: Dokka 플러그인)

> 이 가이드는 Dokka Gradle 플러그인(DGP) v2 모드에 적용됩니다. DGP v1 모드는 더 이상 지원되지 않습니다.
> v1에서 v2 모드로 업그레이드하려면 [마이그레이션 가이드](dokka-migration.md)를 따르세요.
>
{style="note"}

Dokka는 초기 설계부터 손쉽게 확장하고 유연하게 커스터마이징할 수 있도록 제작되었으며, 덕분에 커뮤니티에서는 기본으로 제공되지 않는 누락된 기능이나 특화된 기능을 지원하는 플러그인을 구현할 수 있습니다.

Dokka 플러그인은 다른 프로그래밍 언어 소스 지원부터 독특한 출력 형식에 이르기까지 폭넓게 활용됩니다. 자체 KDoc 태그나 애너테이션(annotation) 지원을 추가하거나, KDoc 설명에 포함된 다양한 DSL을 렌더링하는 방법을 Dokka에 학습시키거나, 회사 웹사이트에 매끄럽게 통합되도록 Dokka 페이지를 시각적으로 리디자인하거나, 다른 도구와 연동하는 등 수많은 작업을 수행할 수 있습니다.

Dokka 플러그인을 만드는 방법을 배우려면 [개발자 가이드](https://kotlin.github.io/dokka/%dokkaVersion%/developer_guide/introduction/)를 참조하세요.

## Dokka 플러그인 적용하기 {id="apply-dokka-plugins"}

Dokka 플러그인은 별도의 아티팩트로 배포되므로, Dokka 플러그인을 적용하려면 의존성(dependency)으로 추가하기만 하면 됩니다. 그 후 플러그인이 자체적으로 Dokka를 확장하므로 추가 조치가 필요하지 않습니다.

> 동일한 확장 지점(extension points)을 사용하거나 유사한 방식으로 작동하는 플러그인은 서로 간섭할 수 있습니다.
> 이로 인해 시각적 버그, 일반적인 예기치 않은 동작 또는 빌드 실패가 발생할 수 있습니다. 그러나 Dokka는 어떠한 가변 데이터 구조나 객체도 외부에 노출하지 않으므로 동시성 문제를 일으키지는 않습니다.
>
> 이와 같은 문제가 발생하면 어떤 플러그인이 적용되어 있고 해당 플러그인이 어떤 작업을 수행하는지 확인하는 것이 좋습니다.
> 
{style="note"}

프로젝트에 [mathjax 플러그인](https://github.com/Kotlin/dokka/tree/%dokkaVersion%/dokka-subprojects/plugin-mathjax)을 적용하는 방법을 살펴보겠습니다.

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
plugins {
    id("org.jetbrains.dokka") version "%dokkaVersion%"
}

dependencies {
    dokkaPlugin("org.jetbrains.dokka:mathjax-plugin")
}
```

> * 기본 내장 플러그인(HTML 및 Javadoc 등)은 항상 자동으로 적용됩니다. 이들은 설정만 하면 되며 의존성을 선언할 필요가 없습니다.
>
> * 멀티 모듈 프로젝트(멀티 프로젝트 빌드)를 문서화할 때는 [서브프로젝트 간에 Dokka 설정과 플러그인을 공유](dokka-gradle.md#multi-project-configuration)해야 합니다.
> 
{style="note"}

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.dokka' version '%dokkaVersion%'
}

dependencies {
    dokkaPlugin 'org.jetbrains.dokka:mathjax-plugin'
}
```

> [멀티 프로젝트](dokka-gradle.md#multi-project-configuration) 빌드를 문서화할 때는 
> [서브프로젝트 간에 Dokka 설정과 플러그인을 공유](dokka-gradle.md#multi-project-configuration)해야 합니다.
>
{style="note"}

</tab>
<tab title="Maven" group-key="mvn">

```xml
<plugin>
    <groupId>org.jetbrains.dokka</groupId>
    <artifactId>dokka-maven-plugin</artifactId>
    ...
    <configuration>
        <dokkaPlugins>
            <plugin>
                <groupId>org.jetbrains.dokka</groupId>
                <artifactId>mathjax-plugin</artifactId>
                <version>%dokkaVersion%</version>
            </plugin>
        </dokkaPlugins>
    </configuration>
</plugin>
```

</tab>
<tab title="CLI" group-key="cli">

[CLI](dokka-cli.md) 러너를 [명령줄 옵션](dokka-cli.md#run-with-command-line-options)과 함께 사용하는 경우, Dokka 플러그인을 `.jar` 파일 형태로 `-pluginsClasspath`에 전달해야 합니다.

```Shell
java -jar dokka-cli-%dokkaVersion%.jar \
     -pluginsClasspath "./dokka-base-%dokkaVersion%.jar;...;./mathjax-plugin-%dokkaVersion%.jar" \
     ...
```

[JSON 설정](dokka-cli.md#run-with-json-configuration)을 사용하는 경우 Dokka 플러그인은 `pluginsClasspath` 아래에 지정해야 합니다.

```json
{
  ...
  "pluginsClasspath": [
    "./dokka-base-%dokkaVersion%.jar",
    "...",
    "./mathjax-plugin-%dokkaVersion%.jar"
  ],
  ...
}
```

</tab>
</tabs>

## Dokka 플러그인 설정하기 {id="configure-dokka-plugins"}

Dokka 플러그인은 고유한 설정 옵션을 가질 수도 있습니다. 사용 가능한 옵션을 확인하려면 사용 중인 플러그인의 문서를 참조하세요.

에셋에 사용자 지정 이미지 추가(`customAssets` 옵션), 사용자 지정 스타일시트 추가(`customStyleSheets` 옵션), 그리고 수정된 푸터 메시지 추가(`footerMessage` 옵션)를 통해 기본 내장 HTML 플러그인을 설정하는 방법을 살펴보겠습니다.

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

타입 안전(type-safe)한 방식으로 Dokka 플러그인을 설정하려면 `dokka.pluginsConfiguration {}` 블록을 사용합니다.

```kotlin
dokka {
    pluginsConfiguration.html {
        customAssets.from("logo.png")
        customStyleSheets.from("styles.css")
        footerMessage.set("(c) Your Company")
    }
}
```

Dokka 플러그인 설정의 예는 [Dokka 버전 관리 플러그인](https://github.com/Kotlin/dokka/tree/master/examples/gradle-v2/versioning-multimodule-example)을 참조하세요.

Dokka에서는 [커스텀 플러그인을 설정](https://github.com/Kotlin/dokka/blob/v2.3.0/examples/gradle-v2/custom-dokka-plugin-example/demo-library/build.gradle.kts)하여 기능을 확장하고 문서 생성 프로세스를 수정할 수 있습니다.

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

```groovy
dokka {
    pluginsConfiguration {
        html {
            customAssets.from("logo.png")
            customStyleSheets.from("styles.css")
            footerMessage.set("(c) Your Company")
        }
    }
}
```

</tab>
<tab title="Maven" group-key="mvn">

```xml
<plugin>
    <groupId>org.jetbrains.dokka</groupId>
    <artifactId>dokka-maven-plugin</artifactId>
    ...
    <configuration>
        <pluginsConfiguration>
            <!-- 정규화된 플러그인 이름 (Fully qualified plugin name) -->
            <org.jetbrains.dokka.base.DokkaBase>
                <!-- 이름별 옵션 -->
                <customAssets>
                    <asset>${project.basedir}/my-image.png</asset>
                </customAssets>
                <customStyleSheets>
                    <stylesheet>${project.basedir}/my-styles.css</stylesheet>
                </customStyleSheets>
                <footerMessage>(c) MyOrg 2022 Maven</footerMessage>
            </org.jetbrains.dokka.base.DokkaBase>
        </pluginsConfiguration>
    </configuration>
</plugin>
```

</tab>
<tab title="CLI" group-key="cli">

[CLI](dokka-cli.md) 러너를 [명령줄 옵션](dokka-cli.md#run-with-command-line-options)과 함께 사용하는 경우, `fullyQualifiedPluginName=json` 형태의 JSON 설정을 받는 `-pluginsConfiguration` 옵션을 사용합니다.

여러 플러그인을 설정해야 하는 경우 `^^`로 구분하여 여러 값을 전달할 수 있습니다.

```Bash
java -jar dokka-cli-%dokkaVersion%.jar \
     ...
     -pluginsConfiguration "org.jetbrains.dokka.base.DokkaBase={\"customAssets\": [\"my-image.png\"], \"customStyleSheets\": [\"my-styles.css\"], \"footerMessage\": \"(c) 2022 MyOrg CLI\"}"
```

[JSON 설정](dokka-cli.md#run-with-json-configuration)을 사용하는 경우, `values`에 JSON 설정을 받는 유사한 `pluginsConfiguration` 배열이 있습니다.

```json
{
  "moduleName": "Dokka Example",
  "pluginsConfiguration": [
    {
      "fqPluginName": "org.jetbrains.dokka.base.DokkaBase",
      "serializationFormat": "JSON",
      "values": "{\"customAssets\": [\"my-image.png\"], \"customStyleSheets\": [\"my-styles.css\"], \"footerMessage\": \"(c) 2022 MyOrg\"}"
    }
  ]
}
```

</tab>
</tabs>

## 주요 플러그인 {id="notable-plugins"}

유용하게 사용할 수 있는 주요 Dokka 플러그인은 다음과 같습니다.

| **이름** | **설명** |
|---|---|
| [Android documentation plugin](https://github.com/Kotlin/dokka/tree/%dokkaVersion%/dokka-subprojects/plugin-android-documentation) | Android에서의 문서화 환경을 개선합니다. |
| [Versioning plugin](https://github.com/Kotlin/dokka/tree/%dokkaVersion%/dokka-subprojects/plugin-versioning) | 버전 선택기를 추가하고 애플리케이션/라이브러리의 다양한 버전에 대한 문서를 정리하는 데 도움을 줍니다. |
| [MermaidJS HTML plugin](https://github.com/glureau/dokka-mermaid) | KDoc에 포함된 [MermaidJS](https://mermaid-js.github.io/mermaid/#/) 다이어그램 및 시각화 요소를 렌더링합니다. |
| [Mathjax HTML plugin](https://github.com/Kotlin/dokka/tree/%dokkaVersion%/dokka-subprojects/plugin-mathjax) | KDoc에 포함된 수학 공식을 보기 좋게 출력(pretty print)합니다. |
| [Kotlin as Java plugin](https://github.com/Kotlin/dokka/tree/%dokkaVersion%/dokka-subprojects/plugin-kotlin-as-java) | Java의 관점에서 보이는 형태로 Kotlin 시그니처를 렌더링합니다. |
| [GFM plugin](https://github.com/Kotlin/dokka/tree/master/dokka-subprojects/plugin-gfm) | GitHub Flavoured Markdown 형식으로 문서를 생성하는 기능을 추가합니다. |
| [Jekyll plugin](https://github.com/Kotlin/dokka/tree/master/dokka-subprojects/plugin-jekyll) | Jekyll Flavoured Markdown 형식으로 문서를 생성하는 기능을 추가합니다. |

Dokka 플러그인 제작자로서 이 목록에 플러그인을 추가하고 싶다면 [Slack](dokka-introduction.md#community) 또는 [GitHub](https://github.com/Kotlin/dokka/)을 통해 메인테이너에게 문의하세요.