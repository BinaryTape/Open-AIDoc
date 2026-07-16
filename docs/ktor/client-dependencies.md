[//]: # (title: 添加客户端依赖项)

<show-structure for="chapter" depth="2"/>

<link-summary>了解如何向现有项目添加客户端依赖项。</link-summary>

要在项目中使用 Ktor HTTP 客户端，您需要[配置仓库](#repositories)并添加以下依赖项：

- **[ktor-client-core](#client-dependency)**

  `ktor-client-core` 包含 Ktor 客户端核心功能。
- **[引擎依赖项](#engine-dependency)**

  引擎用于处理网络请求。
  请注意，[特定平台](client-supported-platforms.md)可能需要特定的引擎来处理网络请求。
- (可选) **[日志依赖项](#logging-dependency)**

  提供日志框架以启用结构化且灵活的日志记录能力。

- (可选) **[插件依赖项](#plugin-dependency)**

  插件用于为客户端扩展特定功能。

<p>
    在添加 Ktor 依赖项之前，您需要为该项目配置仓库：
</p>
<list>
    <li>
        <p>
            <control>生产环境</control>
        </p>
        <p>
            Ktor 的生产版本在 Maven 中央仓库中提供。
            您可以按如下方式在构建脚本中声明此仓库：
        </p>
        <Tabs group="languages">
            <TabItem title="Gradle (Kotlin)" group-key="kotlin">
                <code-block lang="Kotlin" code="                    repositories {&#10;                        mavenCentral()&#10;                    }"></code-block>
            </TabItem>
            <TabItem title="Gradle (Groovy)" group-key="groovy">
                <code-block lang="Groovy" code="                    repositories {&#10;                        mavenCentral()&#10;                    }"></code-block>
            </TabItem>
            <TabItem title="Maven" group-key="maven">
                <note>
                    <p>
                        您不需要在 <path>pom.xml</path> 文件中添加 Maven 中央仓库，因为您的项目从 
                        <a href="https://maven.apache.org/guides/introduction/introduction-to-the-pom.html#super-pom">Super POM</a> 继承了中央仓库。
                    </p>
                </note>
            </TabItem>
        </Tabs>
    </li>
    <li>
        <p>
            <control>抢先体验计划 (EAP)</control>
        </p>
        <p>
            要访问 Ktor 的 <a href="https://ktor.io/eap/">EAP</a> 版本，您需要引用 <a href="https://redirector.kotlinlang.org/maven/ktor-eap/io/ktor/">Space 仓库</a>：
        </p>
        <Tabs group="languages">
            <TabItem title="Gradle (Kotlin)" group-key="kotlin">
                <code-block lang="Kotlin" code="                    repositories {&#10;                        maven {&#10;                            url = uri(&quot;https://redirector.kotlinlang.org/maven/ktor-eap&quot;)&#10;                        }&#10;                    }"></code-block>
            </TabItem>
            <TabItem title="Gradle (Groovy)" group-key="groovy">
                <code-block lang="Groovy" code="                    repositories {&#10;                        maven {&#10;                            url &quot;https://redirector.kotlinlang.org/maven/ktor-eap&quot;&#10;                        }&#10;                    }"></code-block>
            </TabItem>
            <TabItem title="Maven" group-key="maven">
                <code-block lang="XML" code="                    &lt;repositories&gt;&#10;                        &lt;repository&gt;&#10;                            &lt;id&gt;ktor-eap&lt;/id&gt;&#10;                            &lt;url&gt;https://redirector.kotlinlang.org/maven/ktor-eap&lt;/url&gt;&#10;                        &lt;/repository&gt;&#10;                    &lt;/repositories&gt;"></code-block>
            </TabItem>
        </Tabs>
        <p>
            请注意，Ktor EAP 可能需要 <a href="https://redirector.kotlinlang.org/maven/dev">Kotlin dev 仓库</a>：
        </p>
        <Tabs group="languages">
            <TabItem title="Gradle (Kotlin)" group-key="kotlin">
                <code-block lang="Kotlin" code="                    repositories {&#10;                        maven {&#10;                            url = uri(&quot;https://redirector.kotlinlang.org/maven/dev&quot;)&#10;                        }&#10;                    }"></code-block>
            </TabItem>
            <TabItem title="Gradle (Groovy)" group-key="groovy">
                <code-block lang="Groovy" code="                    repositories {&#10;                        maven {&#10;                            url &quot;https://redirector.kotlinlang.org/maven/dev&quot;&#10;                        }&#10;                    }"></code-block>
            </TabItem>
            <TabItem title="Maven" group-key="maven">
                <code-block lang="XML" code="                    &lt;repositories&gt;&#10;                        &lt;repository&gt;&#10;                            &lt;id&gt;ktor-eap&lt;/id&gt;&#10;                            &lt;url&gt;https://redirector.kotlinlang.org/maven/dev&lt;/url&gt;&#10;                        &lt;/repository&gt;&#10;                    &lt;/repositories&gt;"></code-block>
            </TabItem>
        </Tabs>
    </li>
</list>

## 添加依赖项 {id="add-ktor-dependencies"}

> 对于[不同的平台](client-supported-platforms.md)，Ktor 提供了带有 `-jvm` 或 `-js` 等后缀的平台特定工件，例如 `ktor-client-core-jvm`。请注意，Gradle 会自动解析适用于给定平台的工件，而 Maven 不支持此功能。这意味着对于 Maven，您需要手动添加平台特定后缀。
>
{type="tip"}

### 客户端依赖项 {id="client-dependency"}

主要客户端功能在 `ktor-client-core` 工件中提供。根据您的构建系统，您可以按以下方式添加它：

<var name="artifact_name" value="ktor-client-core"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"></code-block>
    </TabItem>
</Tabs>

您可以将 `$ktor_version` 替换为所需的 Ktor 版本，例如 `%ktor_version%`。

#### 多平台 {id="client-dependency-multiplatform"}

对于多平台项目，您可以在 `gradle/libs.versions.toml` 文件中定义 Ktor 版本和 `ktor-client-core` 工件：

```kotlin
[versions]
ktor = "3.4.0"

[libraries]
ktor-client-core = { module = "io.ktor:ktor-client-core", version.ref = "ktor" }
```

然后，将 `ktor-client-core` 作为依赖项添加到 `commonMain` 源集中：

```kotlin
sourceSets {
    commonMain.dependencies {
        implementation(libs.ktor.client.core)
    }
}
```

### 引擎依赖项 {id="engine-dependency"}

[引擎](client-engines.md)负责处理网络请求。有适用于各种平台的不同客户端引擎，例如 Apache、CIO、Android、iOS 等。例如，您可以按如下方式添加 `CIO` 引擎依赖项：

<var name="artifact_name" value="ktor-client-cio"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"></code-block>
    </TabItem>
</Tabs>

#### 多平台 {id="engine-dependency-multiplatform"}

对于多平台项目，您需要将所需引擎的依赖项添加到相应的源集中。

例如，要为 Android 添加 `OkHttp` 引擎依赖项，您可以先在 `gradle/libs.versions.toml` 文件中定义 Ktor 版本和 `ktor-client-okhttp` 工件：

```kotlin
[versions]
ktor = "3.4.0"

[libraries]
ktor-client-okhttp = { module = "io.ktor:ktor-client-okhttp", version.ref = "ktor" }
```

然后，将 `ktor-client-okhttp` 作为依赖项添加到 `androidMain` 源集中：

```kotlin
sourceSets {
    androidMain.dependencies {
        implementation(libs.ktor.client.okhttp)
    }
}
```

有关特定引擎所需依赖项的完整列表，请参阅[添加引擎依赖项](client-engines.md#dependencies)。

### 日志依赖项

  <p>
    在 JVM 上，Ktor 使用 Simple Logging Facade for Java
    (<a href="http://www.slf4j.org/">SLF4J</a>) 作为日志记录的抽象层。SLF4J 将日志记录 API 与底层的日志记录实现解耦，
    允许您集成最适合应用程序要求的日志框架。
    常见的选择包括 <a href="https://logback.qos.ch/">Logback</a> 或 
    <a href="https://logging.apache.org/log4j">Log4j</a>。如果不提供框架，SLF4J 将默认使用无操作 (NOP) 实现，
    这实际上会禁用日志记录。
  </p>

  <p>
    要启用日志记录，请包含包含所需 SLF4J 实现的工件，例如
    <a href="https://logback.qos.ch/">Logback</a>：
  </p>
  <var name="group_id" value="ch.qos.logback"/>
  <var name="artifact_name" value="logback-classic"/>
  <var name="version" value="logback_version"/>
  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(&quot;%group_id%:%artifact_name%:$%version%&quot;)"></code-block>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation &quot;%group_id%:%artifact_name%:$%version%&quot;"></code-block>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;%group_id%&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%&lt;/artifactId&gt;&#10;                  &lt;version&gt;${%version%}&lt;/version&gt;&#10;              &lt;/dependency&gt;"></code-block>
      </TabItem>
  </Tabs>

有关 Ktor 中日志记录的更多信息，请参阅 [Ktor Client 中的日志记录](client-logging.md)。

### 插件依赖项 {id="plugin-dependency"}

Ktor 允许您使用默认情况下不可用的附加客户端功能（[插件](client-plugins.md)），例如授权和序列化。其中一些插件在单独的工件中提供。您可以从所需插件的主题中了解所需的依赖项。

> 对于多平台项目，应将插件依赖项添加到 `commonMain` 源集中。请注意，某些插件可能对特定平台有[限制](client-engines.md#limitations)。

## 确保 Ktor 版本一致性

<chapter title="使用 Ktor BOM 依赖项">

Ktor BOM 允许您确保所有 Ktor 模块使用相同的、一致的版本，而无需为每个依赖项单独指定版本。

要添加 Ktor BOM 依赖项，请在构建脚本中按如下方式声明：

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(platform(&quot;io.ktor:ktor-bom:$ktor_version&quot;))"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation platform &quot;io.ktor:ktor-bom:$ktor_version&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependencyManagement&gt;&#10;              &lt;dependencies&gt;&#10;                  &lt;dependency&gt;&#10;                      &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                      &lt;artifactId&gt;ktor-bom&lt;/artifactId&gt;&#10;                      &lt;version&gt;%ktor_version%&lt;/version&gt;&#10;                      &lt;type&gt;pom&lt;/type&gt;&#10;                      &lt;scope&gt;import&lt;/scope&gt;&#10;                  &lt;/dependency&gt;&#10;              &lt;/dependencies&gt;&#10;          &lt;/dependencyManagement&gt;"></code-block>
    </TabItem>
</Tabs>
</chapter>

<var name="target_module" value="client"/>
<p>
    您还可以通过使用发布的版本目录来集中化 Ktor 依赖项声明。
    这种方法具有以下好处：
</p>
<list id="published-version-catalog-benefits">
    <li>
        无需在您自己的目录中手动声明 Ktor 版本。
    </li>
    <li>
        在单个命名空间下公开每个 Ktor 模块。
    </li>
</list>
<p>
    要声明目录，请在
    <path>settings.gradle.kts</path>
    中创建具有您选择名称的版本目录：
</p>
<code-block lang="kotlin" code="    dependencyResolutionManagement {&#10;        versionCatalogs {&#10;            create(&quot;ktorLibs&quot;) {&#10;                from(&quot;io.ktor:ktor-version-catalog:%ktor_version%&quot;)&#10;            }&#10;        }&#10;    }"></code-block>
<p>
    然后，您可以通过引用目录名称，在模块的
    <path>build.gradle.kts</path>
    中添加依赖项：
</p>
<code-block lang="kotlin" code="    dependencies {&#10;        implementation(ktorLibs.%target_module%.core)&#10;        // ...&#10;    }"></code-block>