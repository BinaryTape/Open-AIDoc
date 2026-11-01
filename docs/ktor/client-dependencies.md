[//]: # (title: 添加客户端依赖项)

<show-structure for="chapter" depth="2"/>

<link-summary>了解如何向现有项目添加客户端依赖项。</link-summary>

要在项目中使用 Ktor HTTP 客户端，你需要[配置仓库](#repositories)并添加以下依赖项：

- **[ktor-client-core](#client-dependency)**

  `ktor-client-core` 包含核心 Ktor 客户端功能。
- **[引擎依赖项](#engine-dependency)**

  引擎用于处理网络请求。
  请注意，[特定平台](client-supported-platforms.md)可能需要特定的引擎来处理网络请求。
- (可选) **[日志依赖项](#logging-dependency)**

  提供日志框架以启用结构化且灵活的日志记录功能。

- (可选) **[插件依赖项](#plugin-dependency)**

  插件用于通过特定功能扩展客户端。

<chapter title="配置仓库" id="repositories">
        <p>
            在添加 Ktor 依赖项之前，你需要为该项目配置仓库：
        </p>
        <list>
            <li>
                <p>
                    <control>正式版 (Production)</control>
                </p>
                <p>
                    Ktor 的正式发布版本可在 Maven 中央仓库中获取。
                    你可以在构建脚本中按如下方式声明此仓库：
                </p>
                <Tabs group="languages">
                    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
                        <code-block lang="Kotlin" code="                            repositories {&#10;                                mavenCentral()&#10;                            }"/>
                    </TabItem>
                    <TabItem title="Gradle (Groovy)" group-key="groovy">
                        <code-block lang="Groovy" code="                            repositories {&#10;                                mavenCentral()&#10;                            }"/>
                    </TabItem>
                    <TabItem title="Maven" group-key="maven">
                        <note>
                            <p>
                                你不需要在 <Path>pom.xml</Path> 文件中添加 Maven 中央仓库，因为你的项目已从
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
                    要访问 Ktor 的 <a href="https://ktor.io/eap/">EAP</a> 版本，你需要引用 <a href="https://redirector.kotlinlang.org/maven/ktor-eap/io/ktor/">Space 仓库</a>：
                </p>
                <Tabs group="languages">
                    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
                        <code-block lang="Kotlin" code="                            repositories {&#10;                                maven {&#10;                                    url = uri(&quot;https://redirector.kotlinlang.org/maven/ktor-eap&quot;)&#10;                                }&#10;                            }"/>
                    </TabItem>
                    <TabItem title="Gradle (Groovy)" group-key="groovy">
                        <code-block lang="Groovy" code="                            repositories {&#10;                                maven {&#10;                                    url &quot;https://redirector.kotlinlang.org/maven/ktor-eap&quot;&#10;                                }&#10;                            }"/>
                    </TabItem>
                    <TabItem title="Maven" group-key="maven">
                        <code-block lang="XML" code="                            &lt;repositories&gt;&#10;                                &lt;repository&gt;&#10;                                    &lt;id&gt;ktor-eap&lt;/id&gt;&#10;                                    &lt;url&gt;https://redirector.kotlinlang.org/maven/ktor-eap&lt;/url&gt;&#10;                                &lt;/repository&gt;&#10;                            &lt;/repositories&gt;"/>
                    </TabItem>
                </Tabs>
                <p>
                    请注意，Ktor EAP 版本可能需要 <a href="https://redirector.kotlinlang.org/maven/dev">Kotlin dev 仓库</a>：
                </p>
                <Tabs group="languages">
                    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
                        <code-block lang="Kotlin" code="                            repositories {&#10;                                maven {&#10;                                    url = uri(&quot;https://redirector.kotlinlang.org/maven/dev&quot;)&#10;                                }&#10;                            }"/>
                    </TabItem>
                    <TabItem title="Gradle (Groovy)" group-key="groovy">
                        <code-block lang="Groovy" code="                            repositories {&#10;                                maven {&#10;                                    url &quot;https://redirector.kotlinlang.org/maven/dev&quot;&#10;                                }&#10;                            }"/>
                    </TabItem>
                    <TabItem title="Maven" group-key="maven">
                        <code-block lang="XML" code="                            &lt;repositories&gt;&#10;                                &lt;repository&gt;&#10;                                    &lt;id&gt;ktor-eap&lt;/id&gt;&#10;                                    &lt;url&gt;https://redirector.kotlinlang.org/maven/dev&lt;/url&gt;&#10;                                &lt;/repository&gt;&#10;                            &lt;/repositories&gt;"/>
                    </TabItem>
                </Tabs>
            </li>
        </list>
    </chapter>

## 添加依赖项 {id="add-ktor-dependencies"}

> 针对[不同的平台](client-supported-platforms.md)，Ktor 提供了带有诸如 `-jvm` 或 `-js` 等后缀的平台专用构件，例如 `ktor-client-core-jvm`。请注意，Gradle 会自动解析适用于给定平台的构件，而 Maven 不支持此功能。这意味着对于 Maven，你需要手动添加平台专用后缀。
>
{type="tip"}

### 客户端依赖项 {id="client-dependency"}

客户端的核心功能可在 `ktor-client-core` 构件中获取。根据你使用的构建系统，可以通过以下方式添加它：

<var name="artifact_name" value="ktor-client-core"/>
<var name="ktor_version_catalog_name" value="ktorLibs.client.core"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor version catalog</a> 来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor version catalog</a> 来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

#### 多平台 {id="client-dependency-multiplatform"}

对于多平台项目，请在 <Path>settings.gradle.kts</Path> 文件中导入 Ktor version catalog：

```kotlin
dependencyResolutionManagement {
    versionCatalogs {
        create("ktorLibs").from("io.ktor:ktor-version-catalog:3.6.1")
    }
}
```

然后，将 `ktor-client-core` 作为依赖项添加到 `commonMain` 源集：

```kotlin
kotlin {
    sourceSets {
        commonMain {
            dependencies {
              implementation(ktorLibs.client.core)
            }
        }
    }
}
```

### 引擎依赖项 {id="engine-dependency"}

[引擎](client-engines.md)负责处理网络请求。Ktor 为不同平台提供了不同的客户端引擎。

例如，你可以按如下方式添加 `CIO` 引擎：

<var name="artifact_name" value="ktor-client-cio"/>
<var name="ktor_version_catalog_name" value="ktorLibs.client.cio"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor version catalog</a> 来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor version catalog</a> 来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

#### 多平台 {id="engine-dependency-multiplatform"}

##### 使用默认引擎 {id="use-default-engines"}

对于多平台项目，你可以使用 `ktor-client-engine-defaults` 构件为每个目标平台提供精选的客户端引擎。

将该构件依赖项添加到 `commonMain` 源集：

```kotlin
kotlin {
    sourceSets {
        commonMain {
            dependencies {
                api(ktorLibs.client.engineDefaults)
            }
        }
    }
}
```
<note>
    上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
    Ktor version catalog</a> 来指定 Ktor 依赖项。
</note>

##### 使用特定引擎 {id="kmp-specific-engine"}

如果你需要特定的引擎，请改为将其依赖项添加到对应的平台源集中。例如，要在 Android 上使用 `OkHttp`，请将 `ktorLibs.client.okhttp` 添加到 `androidMain` 源集：

```kotlin
sourceSets {
    androidMain.dependencies {
        implementation(ktorLibs.client.okhttp)
    }
}
```

<note>
    上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
    Ktor version catalog</a> 来指定 Ktor 依赖项。
</note>

> 有关每个引擎所需的依赖项，请参阅[添加引擎依赖项](client-engines.md#dependencies)。
> 
{style="tip"}

### 日志依赖项 {id="logging-dependency"}

<p>
  在 <a href="client-engines.md#jvm">JVM</a> 上，Ktor 使用 Java 简单日志门面
  （<a href="http://www.slf4j.org/">SLF4J</a>）作为日志记录的抽象层。SLF4J 将日志 API 与底层日志实现解耦，
  允许你集成最适合应用程序需求的日志框架。
  常见的选择包括 <a href="https://logback.qos.ch/">Logback</a> 或 
  <a href="https://logging.apache.org/log4j">Log4j</a>。如果未提供任何框架，SLF4J 将默认使用无操作（NOP）实现，这实际上会禁用日志记录。
</p>

<p>
  要启用日志记录，请包含具有所需 SLF4J 实现的构件，例如 <a href="https://logback.qos.ch/">Logback</a>：
</p>
<var name="group_id" value="ch.qos.logback"/>
<var name="artifact_name" value="logback-classic"/>
<var name="version" value="logback_version"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;%group_id%:%artifact_name%:$%version%&quot;)"/>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;%group_id%:%artifact_name%:$%version%&quot;"/>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;%group_id%&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%&lt;/artifactId&gt;&#10;                &lt;version&gt;${%version%}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

有关 Ktor 中日志记录的更多信息，请参阅 [Ktor Client 中的日志记录](client-logging.md)。

### 插件依赖项 {id="plugin-dependency"}

Ktor 允许你使用默认情况下不可用的附加客户端功能（[插件](client-plugins.md)），例如授权和序列化。其中一些功能在单独的构件中提供。你可以从所需插件的主题中了解需要哪些依赖项。

> 对于多平台项目，应将插件依赖项添加到 `commonMain` 源集中。请注意，某些插件在特定平台上可能存在[限制](client-engines.md#limitations)。

## 确保 Ktor 版本一致性 {id="ensure-ktor-version-consistency"}

<chapter title="使用 Ktor BOM 依赖项">

Ktor BOM 允许你确保所有 Ktor 模块使用相同的统一版本，而无需单独为每个依赖项指定版本。

要添加 Ktor BOM 依赖项，请在构建脚本中按如下方式声明：

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(platform(&quot;io.ktor:ktor-bom:$ktor_version&quot;))"/>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation platform &quot;io.ktor:ktor-bom:$ktor_version&quot;"/>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependencyManagement&gt;&#10;              &lt;dependencies&gt;&#10;                  &lt;dependency&gt;&#10;                      &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                      &lt;artifactId&gt;ktor-bom&lt;/artifactId&gt;&#10;                      &lt;version&gt;%ktor_version%&lt;/version&gt;&#10;                      &lt;type&gt;pom&lt;/type&gt;&#10;                      &lt;scope&gt;import&lt;/scope&gt;&#10;                  &lt;/dependency&gt;&#10;              &lt;/dependencies&gt;&#10;          &lt;/dependencyManagement&gt;"/>
    </TabItem>
</Tabs>
</chapter>

<var name="target_module" value="client"/>
<chapter id="using-version-catalog" title="使用已发布的版本目录 (version catalog)">
            <p>
                你还可以通过使用已发布的版本目录 (version catalog) 来集中管理 Ktor 依赖项声明。
                该方法具有以下优势：
            </p>
            <list id="published-version-catalog-benefits">
                <li>
                    无需在自己的 catalog 中手动声明 Ktor 版本。
                </li>
                <li>
                    在单个命名空间下公开所有 Ktor 模块。
                </li>
            </list>
            <p>
                要声明此 catalog，请在
                <Path>settings.gradle.kts</Path>
                中使用你选择的名称创建一个版本目录：
            </p>
            <code-block lang="kotlin" code="                dependencyResolutionManagement {&#10;                    versionCatalogs {&#10;                        create(&quot;ktorLibs&quot;) {&#10;                            from(&quot;io.ktor:ktor-version-catalog:%ktor_version%&quot;)&#10;                        }&#10;                    }&#10;                }"/>
            <p>
                然后，你可以通过引用该 catalog 名称在模块的
                <Path>build.gradle.kts</Path>
                中添加依赖项：
            </p>
            <code-block lang="kotlin" code="                dependencies {&#10;                    implementation(ktorLibs.%target_module%.core)&#10;                    // ...&#10;                }"/>
        </chapter>