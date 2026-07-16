[//]: # (title: 新增用戶端相依性)

<show-structure for="chapter" depth="2"/>

<link-summary>了解如何將用戶端相依性新增至現有專案。</link-summary>

要在專案中使用 Ktor HTTP 用戶端，您需要[設定存儲庫](#repositories)並新增以下相依性：

- **[ktor-client-core](#client-dependency)**

  `ktor-client-core` 包含核心 Ktor 用戶端功能。
- **[引擎相依性](#engine-dependency)**

  引擎用於處理網路請求。
  請注意，[特定平台](client-supported-platforms.md)可能需要特定的引擎來處理網路請求。
- （選用）**[記錄相依性](#logging-dependency)**

  提供記錄架構以啟用結構化且靈活的記錄功能。

- （選用）**[外掛程式相依性](#plugin-dependency)**

  外掛程式用於為用戶端擴充特定功能。

<p>
    在新增 Ktor 相依性之前，您需要為此專案配置存儲庫：
</p>
<list>
    <li>
        <p>
            <control>正式版 (Production)</control>
        </p>
        <p>
            Ktor 的正式版本可在 Maven 中央存儲庫中取得。
            您可以在建置指令碼中宣告此存儲庫，如下所示：
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
                        您不需要在 <path>pom.xml</path> 檔案中新增 Maven 中央存儲庫，因為您的專案會從
                        <a href="https://maven.apache.org/guides/introduction/introduction-to-the-pom.html#super-pom">Super POM</a> 繼承中央存儲庫。
                    </p>
                </note>
            </TabItem>
        </Tabs>
    </li>
    <li>
        <p>
            <control>早期體驗計劃 (EAP)</control>
        </p>
        <p>
            要存取 Ktor 的 <a href="https://ktor.io/eap/">EAP</a> 版本，您需要參照 <a href="https://redirector.kotlinlang.org/maven/ktor-eap/io/ktor/">Space 存儲庫</a>：
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
            請注意，Ktor EAP 可能需要 <a href="https://redirector.kotlinlang.org/maven/dev">Kotlin 開發存儲庫</a>：
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

## 新增相依性 {id="add-ktor-dependencies"}

> 對於[不同的平台](client-supported-platforms.md)，Ktor 提供帶有 `-jvm` 或 `-js` 等後綴的特定平台構件，例如 `ktor-client-core-jvm`。請注意，Gradle 會自動解析適用於指定平台的構件，而 Maven 則不支援此功能。這意味著對於 Maven，您需要手動新增特定平台後綴。
>
{type="tip"}

### 用戶端相依性 {id="client-dependency"}

主要用戶端功能可在 `ktor-client-core` 構件中取得。根據您的建置系統，您可以透過以下方式新增它：

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

您可以將 `$ktor_version` 替換為所需的 Ktor 版本，例如 `%ktor_version%`。

#### 多平台 {id="client-dependency-multiplatform"}

對於多平台專案，您可以在 `gradle/libs.versions.toml` 檔案中定義 Ktor 版本和 `ktor-client-core` 構件：

```kotlin
[versions]
ktor = "3.4.0"

[libraries]
ktor-client-core = { module = "io.ktor:ktor-client-core", version.ref = "ktor" }
```

然後，將 `ktor-client-core` 作為相依性新增至 `commonMain` 原始碼集：

```kotlin
sourceSets {
    commonMain.dependencies {
        implementation(libs.ktor.client.core)
    }
}
```

### 引擎相依性 {id="engine-dependency"}

[引擎](client-engines.md)負責處理網路請求。有各種適用於不同平台的用戶端引擎，例如 Apache、CIO、Android、iOS 等。例如，您可以按如下方式新增 `CIO` 引擎相依性：

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

對於多平台專案，您需要將所需引擎的相依性新增至對應的原始碼集。

例如，要為 Android 新增 `OkHttp` 引擎相依性，您可以先在 `gradle/libs.versions.toml` 檔案中定義 Ktor 版本和 `ktor-client-okhttp` 構件：

```kotlin
[versions]
ktor = "3.4.0"

[libraries]
ktor-client-okhttp = { module = "io.ktor:ktor-client-okhttp", version.ref = "ktor" }
```

然後，將 `ktor-client-okhttp` 作為相依性新增至 `androidMain` 原始碼集：

```kotlin
sourceSets {
    androidMain.dependencies {
        implementation(libs.ktor.client.okhttp)
    }
}
```

如需特定引擎所需相依性的完整列表，請參閱[新增引擎相依性](client-engines.md#dependencies)。

### 記錄相依性

  <p>
    在 <a href="#jvm">JVM</a> 上，Ktor 使用 Simple Logging Facade for Java
    (<a href="http://www.slf4j.org/">SLF4J</a>) 作為記錄的抽象層。SLF4J 將記錄 API 與底層記錄實作解耦，讓您可以整合最符合應用程式需求的記錄架構。
    常見的選擇包括 <a href="https://logback.qos.ch/">Logback</a> 或 
    <a href="https://logging.apache.org/log4j">Log4j</a>。如果未提供架構，SLF4J 將預設為無操作 (NOP) 實作，這基本上會停用記錄功能。
  </p>

  <p>
    要啟用記錄功能，請包含包含所需 SLF4J 實作的構件，例如 <a href="https://logback.qos.ch/">Logback</a>：
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

有關 Ktor 中記錄的更多資訊，請參閱 [Ktor 用戶端中的記錄](client-logging.md)。

### 外掛程式相依性 {id="plugin-dependency"}

Ktor 允許您使用預設情況下無法使用的額外用戶端功能（[外掛程式](client-plugins.md)），例如驗證與序列化。其中一些功能是在單獨的構件中提供的。您可以從所需外掛程式的主題中了解需要哪些相依性。

> 對於多平台專案，外掛程式相依性應新增至 `commonMain` 原始碼集。請注意，某些外掛程式對於特定平台可能會有 [限制](client-engines.md#limitations)。

## 確保 Ktor 版本一致性

<chapter title="使用 Ktor BOM 相依性">

Ktor BOM 讓您可以確保所有 Ktor 模組都使用相同且一致的版本，而無需為每個相依性分別指定版本。

要新增 Ktor BOM 相依性，請在建置指令碼中按如下方式宣告：

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
    您還可以透過使用發佈的版本目錄 (version catalog) 來集中管理 Ktor 相依性宣告。
    這種方法提供以下好處：
</p>
<list id="published-version-catalog-benefits">
    <li>
        消除在您自己的目錄中手動宣告 Ktor 版本的需求。
    </li>
    <li>
        在單一命名空間下公開每個 Ktor 模組。
    </li>
</list>
<p>
    要宣告目錄，請在
    <path>settings.gradle.kts</path>
    中建立一個您選擇名稱的版本目錄：
</p>
<code-block lang="kotlin" code="    dependencyResolutionManagement {&#10;        versionCatalogs {&#10;            create(&quot;ktorLibs&quot;) {&#10;                from(&quot;io.ktor:ktor-version-catalog:%ktor_version%&quot;)&#10;            }&#10;        }&#10;    }"></code-block>
<p>
    然後，您可以透過引用目錄名稱在模組的
    <path>build.gradle.kts</path>
    中新增相依性：
</p>
<code-block lang="kotlin" code="    dependencies {&#10;        implementation(ktorLibs.%target_module%.core)&#10;        // ...&#10;    }"></code-block>