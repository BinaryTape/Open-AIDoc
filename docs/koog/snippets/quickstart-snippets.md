---
search:
exclude: true
---

# --8<-- [start:prerequisites]
确保您的环境和项目满足以下要求：

- JDK 17+
- Kotlin 2.2.0+
- Gradle 8.0+ 或 Maven 3.8+
# --8<-- [end:prerequisites]

# --8<-- [start:dependencies]
添加 [Koog 软件包](https://central.sonatype.com/artifact/ai.koog/koog-agents/)作为依赖项：

=== "Gradle (Kotlin)"

    ``` kotlin title="build.gradle.kts"
    dependencies {
        // 稳定版
        implementation("ai.koog:koog-agents:1.3.0")

        // Beta 版
        implementation("ai.koog:koog-agents-additions:1.3.0-beta")
    }
    ```

=== "Gradle (Groovy)"

    ``` groovy title="build.gradle"
    dependencies {
        // 稳定版
        implementation 'ai.koog:koog-agents:1.3.0'

        // Beta 版
        implementation 'ai.koog:koog-agents-additions:1.3.0-beta'
    }
    ```

=== "Maven"

    ```xml title="pom.xml"
    <dependency>
        <!-- 稳定版 -->
        <dependency>
            <groupId>ai.koog</groupId>
            <artifactId>koog-agents-jvm</artifactId>
            <version>1.3.0</version>
        </dependency>

        <!-- Beta 版 -->
        <dependency>
            <groupId>ai.koog</groupId>
            <artifactId>koog-agents-additions-jvm</artifactId>
            <version>1.3.0-beta</version>
        </dependency>
    </dependency>
    ```
# --8<-- [end:dependencies]

# --8<-- [start:api-key]
从 LLM 提供商处获取 API 密钥，或者通过 Ollama 在本地运行 LLM。
有关详细信息，请参阅[快速入门](../quickstart.md)。
# --8<-- [end:api-key]