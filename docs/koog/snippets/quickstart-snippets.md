---
search:
exclude: true
---

# --8<-- [start:prerequisites]
确保您的环境和项目符合以下要求：

- JDK 17+
- Kotlin 2.2.0+
- Gradle 8.0+ 或 Maven 3.8+
# --8<-- [end:prerequisites]

# --8<-- [start:dependencies]
将 [Koog 软件包](https://central.sonatype.com/artifact/ai.koog/koog-agents/) 添加为依赖项：

=== "Gradle (Kotlin)"

    ``` kotlin title="build.gradle.kts"
    dependencies {
        // 稳定版
        implementation("ai.koog:koog-agents:1.1.1")

        // Beta 版
        implementation("ai.koog:koog-agents-additions:1.1.1-beta")
    }
    ```

=== "Gradle (Groovy)"

    ``` groovy title="build.gradle"
    dependencies {
        // 稳定版
        implementation 'ai.koog:koog-agents:1.1.1'

        // Beta 版
        implementation 'ai.koog:koog-agents-additions:1.1.1-beta'
    }
    ```

=== "Maven"

    ```xml title="pom.xml"
    <dependency>
        <!-- 稳定版 -->
        <dependency>
            <groupId>ai.koog</groupId>
            <artifactId>koog-agents-jvm</artifactId>
            <version>1.1.1</version>
        </dependency>

        <!-- Beta 版 -->
        <dependency>
            <groupId>ai.koog</groupId>
            <artifactId>koog-agents-additions-jvm</artifactId>
            <version>1.1.1-beta</version>
        </dependency>
    </dependency>
    ```
# --8<-- [end:dependencies]

# --8<-- [start:api-key]
从 LLM 提供商处获取 API 密钥，或者通过 Ollama 运行本地 LLM。
要了解更多信息，请参阅 [快速入门](../quickstart.md)。
# --8<-- [end:api-key]