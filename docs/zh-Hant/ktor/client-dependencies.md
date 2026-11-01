[//]: # (title: 新增用戶端相依性)

<show-structure for="chapter" depth="2"/>

<link-summary>了解如何將用戶端相依性新增至現有專案中。</link-summary>

若要在專案中使用 Ktor HTTP 用戶端，你需要[設定存儲庫](#repositories)並新增以下相依性：

- **[ktor-client-core](#client-dependency)**

  `ktor-client-core` 包含 Ktor 用戶端核心功能。
- **[引擎相依性](#engine-dependency)**

  引擎用於處理網路請求。
  請注意，[特定平台](client-supported-platforms.md)可能需要特定的引擎來處理網路請求。
- (選填) **[記錄相依性](#logging-dependency)**

  提供記錄架構以啟用結構化且彈性的記錄功能。

- (選填) **[外掛程式相依性](#plugin-dependency)**

  外掛程式用於為用戶端擴充特定功能。

<chapter title="設定存儲庫" id="repositories">
        <p>
            在新增 Ktor 相依性之前，你需要為此專案設定存儲庫：
        </p>
        <list>
            <li>
                <p>
                    <control>正式發佈版 (Production)</control>
                </p>
                <p>
                    Ktor 的正式發佈版本可在 Maven Central 存儲庫取得。
                    你可以依以下方式在組建指令碼中宣告此存儲庫：
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
                                你不需要在 <Path>pom.xml</Path> 檔案中新增 Maven Central 存儲庫，因為你的專案已繼承來自
                                <a href="https://maven.apache.org/guides/introduction/introduction-to-the-pom.html#super-pom">Super POM</a> 的 Central 存儲庫。
                            </p>
                        </note>
                    </TabItem>
                </Tabs>
            </li>
            <li>
                <p>
                    <control>早期體驗體計劃 (EAP)</control>
                </p>
                <p>
                    若要取得 Ktor 的 <a href="https://ktor.io/eap/">EAP</a> 版本，你需要參照 <a href="https://redirector.kotlinlang.org/maven/ktor-eap/io/ktor/">Space 存儲庫</a>：
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
                    請注意，Ktor EAP 可能需要 <a href="https://redirector.kotlinlang.org/maven/dev">Kotlin dev 存儲庫</a>：
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

## 新增相依性 {id="add-ktor-dependencies"}

> 對於[不同的平台](client-supported-platforms.md)，Ktor 提供了帶有後綴（例如 `-jvm` 或 `-js`）的平台專屬構件，例如 `ktor-client-core-jvm`。請注意，Gradle 會自動解析適用於指定平台的構件，而 Maven 則不支援此功能。這代表在使用 Maven 時，你需要手動新增特定平台的後綴。
>
{type="tip"}

### 用戶端相依性 {id="client-dependency"}

主要的用戶端功能位於 `ktor-client-core` 構件中。根據你使用的建構系統，你可以透過以下方式新增它：

<var name="artifact_name" value="ktor-client-core"/>
<var name="ktor_version_catalog_name" value="ktorLibs.client.core"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor version catalog</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor version catalog</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

#### 多平台 {id="client-dependency-multiplatform"}

對於多平台專案，請在你的 <Path>settings.gradle.kts</Path> 檔案中匯入 Ktor version catalog：

```kotlin
dependencyResolutionManagement {
    versionCatalogs {
        create("ktorLibs").from("io.ktor:ktor-version-catalog:3.6.1")
    }
}
```

接著，將 `ktor-client-core` 作為相依性新增至 `commonMain` 原始碼集中：

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

### 引擎相依性 {id="engine-dependency"}

[引擎](client-engines.md)負責處理網路請求。Ktor 為不同的平台提供了不同的用戶端引擎。

例如，你可以依以下方式新增 `CIO` 引擎：

<var name="artifact_name" value="ktor-client-cio"/>
<var name="ktor_version_catalog_name" value="ktorLibs.client.cio"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor version catalog</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor version catalog</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

#### 多平台 {id="engine-dependency-multiplatform"}

##### 使用預設引擎 {id="use-default-engines"}

對於多平台專案，你可以使用 `ktor-client-engine-defaults` 構件為每個目標平台提供經過精選的用戶端引擎。

將該構件相依性新增至 `commonMain` 原始碼集中：

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
    上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
    Ktor version catalog</a> 來指定 Ktor 相依性。
</note>

##### 使用特定引擎 {id="kmp-specific-engine"}

如果你需要特定引擎，請改為將其相依性新增至對應的平台原始碼集中。例如，若要在 Android 上使用 `OkHttp`，請將 `ktorLibs.client.okhttp` 新增至 `androidMain` 原始碼集中：

```kotlin
sourceSets {
    androidMain.dependencies {
        implementation(ktorLibs.client.okhttp)
    }
}
```

<note>
    上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
    Ktor version catalog</a> 來指定 Ktor 相依性。
</note>

> 關於各引擎所需的相依性，請參閱[新增引擎相依性](client-engines.md#dependencies)。
> 
{style="tip"}

### 記錄相依性 {id="logging-dependency"}

<p>
  在 <a href="client-engines.md#jvm">JVM</a> 上，Ktor 使用 Simple Logging Facade for Java
  （<a href="http://www.slf4j.org/">SLF4J</a>）作為記錄的抽象層。SLF4J 將記錄 API 與底層的記錄實作分離，讓你能夠整合最符合應用程式需求的記錄架構。常見選擇包括 <a href="https://logback.qos.ch/">Logback</a> 或 <a href="https://logging.apache.org/log4j">Log4j</a>。如果未提供架構，SLF4J 將預設使用無操作（NOP）實作，實質上會停用記錄功能。
</p>

<p>
  若要啟用記錄，請加入包含所需 SLF4J 實作的構件，例如 <a href="https://logback.qos.ch/">Logback</a>：
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

如需更多關於 Ktor 中記錄的資訊，請參閱 [Ktor 用戶端中的記錄](client-logging.md)。

### 外掛程式相依性 {id="plugin-dependency"}

Ktor 允許你使用預設未提供的額外用戶端功能（[外掛程式](client-plugins.md)），例如授權（authorization）與序列化。其中部分功能是在獨立的構件中提供。你可以從所需外掛程式的主題文件中了解需要哪些相依性。

> 對於多平台專案，外掛程式相依性應新增至 `commonMain` 原始碼集中。請注意，某些外掛程式可能對特定平台有[限制](client-engines.md#limitations)。

## 確保 Ktor 版本一致性 {id="ensure-ktor-version-consistency"}

<chapter title="使用 Ktor BOM 相依性">

Ktor BOM 讓你能夠確保所有 Ktor 模組都使用相同且一致的版本，而無需單獨為每個相依性指定版本。

若要新增 Ktor BOM 相依性，請在組建指令碼中依以下方式宣告：

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
<chapter id="using-version-catalog" title="使用已發佈的 version catalog">
            <p>
                你也可以透過使用已發佈的 version catalog 來集中管理 Ktor 相依性宣告。這種方法具有以下優點：
            </p>
            <list id="published-version-catalog-benefits">
                <li>
                    無需在自己的 catalog 中手動宣告 Ktor 版本。
                </li>
                <li>
                    在單一命名空間下公開每個 Ktor 模組。
                </li>
            </list>
            <p>
                若要宣告 catalog，請在
                <Path>settings.gradle.kts</Path>
                中以你自訂的名稱建立 version catalog：
            </p>
            <code-block lang="kotlin" code="                dependencyResolutionManagement {&#10;                    versionCatalogs {&#10;                        create(&quot;ktorLibs&quot;) {&#10;                            from(&quot;io.ktor:ktor-version-catalog:%ktor_version%&quot;)&#10;                        }&#10;                    }&#10;                }"/>
            <p>
                接著，你就可以在模組的
                <Path>build.gradle.kts</Path>
                中透過參照該 catalog 名稱來新增相依性：
            </p>
            <code-block lang="kotlin" code="                dependencies {&#10;                    implementation(ktorLibs.%target_module%.core)&#10;                    // ...&#10;                }"/>
        </chapter>