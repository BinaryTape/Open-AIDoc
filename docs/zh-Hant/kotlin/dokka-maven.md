[//]: # (title: Maven)

若要為基於 Maven 的專案產生文件，您可以使用 Dokka 的 Maven 外掛程式。

> 與 [Dokka 的 Gradle 外掛程式](dokka-gradle.md)相比，Maven 外掛程式僅具備基本功能，且不支援多模組組建。
> 
{style="note"}

您可以透過造訪我們的 [Maven 範例](https://github.com/Kotlin/dokka/tree/%dokkaVersion%/examples/maven)專案，來動手實踐 Dokka 並了解如何為 Maven 專案進行配置。

## 套用 Dokka {id="apply-dokka"}

要套用 Dokka，您需要將 `dokka-maven-plugin` 新增到 POM 檔案的 `plugins` 區段中：

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.dokka</groupId>
            <artifactId>dokka-maven-plugin</artifactId>
            <version>%dokkaVersion%</version>
            <executions>
                <execution>
                    <phase>pre-site</phase>
                    <goals>
                        <goal>dokka</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

## 產生文件 {id="generate-documentation"}

Maven 外掛程式提供了以下目標 (goals)：

| **目標** | **說明** |
|---------------|----------------------------------------------------------------------------------------|
| `dokka:dokka` | 產生已套用 Dokka 外掛程式的文件。預設為 [HTML](dokka-html.md) 格式。 |

### 實驗性 {id="experimental"}

| **目標** | **說明** |
|--------------------|---------------------------------------------------------------------------------------------|
| `dokka:javadoc`    | 產生 [Javadoc](dokka-javadoc.md) 格式的文件。 |
| `dokka:javadocJar` | 產生包含 [Javadoc](dokka-javadoc.md) 格式文件的 `javadoc.jar` 檔案。 |

### 其他輸出格式 {id="other-output-formats"}

預設情況下，Dokka 的 Maven 外掛程式會以 [HTML](dokka-html.md) 輸出格式建置文件。

所有其他輸出格式皆以 [Dokka 外掛程式](dokka-plugins.md)的形式實作。為了以所需的格式產生文件，您必須將其作為 Dokka 外掛程式新增到配置中。

例如，要使用實驗性的 [GFM](https://github.com/Kotlin/dokka/tree/master/dokka-subprojects/plugin-gfm#readme) 格式，您必須新增 `gfm-plugin` 構件：

```xml
<plugin>
    <groupId>org.jetbrains.dokka</groupId>
    <artifactId>dokka-maven-plugin</artifactId>
    ...
    <configuration>
        <dokkaPlugins>
            <plugin>
                <groupId>org.jetbrains.dokka</groupId>
                <artifactId>gfm-plugin</artifactId>
                <version>%dokkaVersion%</version>
            </plugin>
        </dokkaPlugins>
    </configuration>
</plugin>
```

使用此配置後，執行 `dokka:dokka` 目標即可產生 GFM 格式的文件。

若要進一步了解 Dokka 外掛程式，請參閱 [Dokka 外掛程式](dokka-plugins.md)。

## 建置 javadoc.jar {id="build-javadoc-jar"}

如果您想將程式庫發布到存儲庫，您可能需要提供一個包含程式庫 API 參考文件的 `javadoc.jar` 檔案。

例如，如果您想發布到 [Maven Central](https://central.sonatype.org/)，您[必須](https://central.sonatype.org/publish/requirements/)隨專案提供 `javadoc.jar`。然而，並非所有存儲庫都有此規定。

與 [Dokka 的 Gradle 外掛程式](dokka-gradle.md#build-javadoc-jar)不同，Maven 外掛程式附帶了一個開箱即用的 `dokka:javadocJar` 目標。預設情況下，它會在 `target` 資料夾中產生 [Javadoc](dokka-javadoc.md) 輸出格式的文件。

如果您對內建目標不滿意或想要自訂輸出（例如，您想產生 [HTML](dokka-html.md) 格式而非 Javadoc 格式的文件），可以透過新增具有以下配置的 Maven JAR 外掛程式來實現類似行為：

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-jar-plugin</artifactId>
    <version>3.3.0</version>
    <executions>
        <execution>
            <goals>
                <goal>test-jar</goal>
            </goals>
        </execution>
        <execution>
            <id>dokka-jar</id>
            <phase>package</phase>
            <goals>
                <goal>jar</goal>
            </goals>
            <configuration>
                <classifier>dokka</classifier>
                <classesDirectory>${project.build.directory}/dokka</classesDirectory>
                <skipIfEmpty>true</skipIfEmpty>
            </configuration>
        </execution>
    </executions>
</plugin>
```

隨後透過執行 `dokka:dokka` 和 `jar:jar@dokka-jar` 目標來產生文件及其 `.jar` 封存檔：

```Bash
mvn dokka:dokka jar:jar@dokka-jar
```

> 如果您將程式庫發布到 Maven Central，您可以使用像 [javadoc.io](https://javadoc.io/) 這樣的服務來免費託管程式庫的 API 文件，無需任何設定。它直接從 `javadoc.jar` 中獲取文件頁面。如[此範例](https://javadoc.io/doc/com.trib3/server/latest/index.html)所示，它與 HTML 格式配合良好。
>
{style="tip"}

## 配置範例 {id="configuration-example"}

Maven 的外掛程式配置區塊可用於配置 Dokka。

以下是一個僅更改文件輸出位置的基本配置範例：

```xml
<plugin>
    <groupId>org.jetbrains.dokka</groupId>
    <artifactId>dokka-maven-plugin</artifactId>
    ...
    <configuration>
        <outputDir>${project.basedir}/target/documentation/dokka</outputDir>
    </configuration>
</plugin>
```

## 配置選項 {id="configuration-options"}

Dokka 具有許多配置選項，可量身打造您和讀者的體驗。

以下是一些範例以及每個配置區段的詳細說明。您也可以在頁面底部找到套用了[所有配置選項](#complete-configuration)的範例。

### 一般配置 {id="general-configuration"}

```xml
<plugin>
    <groupId>org.jetbrains.dokka</groupId>
    <artifactId>dokka-maven-plugin</artifactId>
    <!--  ...  -->
    <configuration>
        <skip>false</skip>
        <moduleName>${project.artifactId}</moduleName>
        <outputDir>${project.basedir}/target/documentation</outputDir>
        <failOnWarning>false</failOnWarning>
        <suppressObviousFunctions>true</suppressObviousFunctions>
        <suppressInheritedMembers>false</suppressInheritedMembers>
        <offlineMode>false</offlineMode>
        <sourceDirectories>
            <dir>${project.basedir}/src</dir>
        </sourceDirectories>
        <documentedVisibilities>
            <visibility>PUBLIC</visibility>
            <visibility>PROTECTED</visibility>
        </documentedVisibilities>
        <reportUndocumented>false</reportUndocumented>
        <skipDeprecated>false</skipDeprecated>
        <skipEmptyPackages>true</skipEmptyPackages>
        <suppressedFiles>
            <file>/path/to/dir</file>
            <file>/path/to/file</file>
        </suppressedFiles>
        <suppressAnnotatedWith>
            <annotation>com.example.SuppressMe</annotation>
        </suppressAnnotatedWith>
        <jdkVersion>8</jdkVersion>
        <languageVersion>1.7</languageVersion>
        <apiVersion>1.7</apiVersion>
        <noStdlibLink>false</noStdlibLink>
        <noJdkLink>false</noJdkLink>
        <includes>
            <include>packages.md</include>
            <include>extra.md</include>
        </includes>
        <classpath>${project.compileClasspathElements}</classpath>
        <samples>
            <dir>${project.basedir}/samples</dir>
        </samples>
        <sourceLinks>
            <!-- 個別區段 -->
        </sourceLinks>
        <externalDocumentationLinks>
            <!-- 個別區段 -->
        </externalDocumentationLinks>
        <perPackageOptions>
            <!-- 個別區段 -->
        </perPackageOptions>
    </configuration>
</plugin>
```

<deflist collapsible="true">
    <def title="skip">
        <p>是否跳過文件產生。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="moduleName">
        <p>用於指代專案/模組的顯示名稱。它用於目錄、導覽、記錄等。</p>
        <p>預設值：<code>{project.artifactId}</code></p>
    </def>
    <def title="outputDir">
        <p>產生文件的目錄，與格式無關。</p>
        <p>預設值：<code>{project.basedir}/target/dokka</code></p>
    </def>
    <def title="failOnWarning">
        <p>
            如果 Dokka 發出了警告或錯誤，是否使文件產生失敗。該程序會先等待所有錯誤—和警告都發出後再結束。
        </p>
        <p>此設定與 <code>reportUndocumented</code> 配合良好。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="suppressObviousFunctions">
        <p>是否隱藏顯而易見的函式。</p>
        <p>
            如果函式符合以下情況，則被視為顯而易見的：</p>
            <list>
                <li>
                    繼承自 <code>kotlin.Any</code>、<code>Kotlin.Enum</code>、<code>java.lang.Object</code> 或 
                    <code>java.lang.Enum</code>，例如 <code>equals</code>、<code>hashCode</code>、<code>toString</code>。
                </li>
                <li>
                    合成的（由編譯器產生）且沒有任何文件，例如 
                    <code>dataClass.componentN</code> 或 <code>dataClass.copy</code>。
                </li>
            </list>
        <p>預設值：<code>true</code></p>
    </def>
    <def title="suppressInheritedMembers">
        <p>是否隱藏在給定類別中未被明確覆寫的繼承成員。</p>
        <p>
            注意：這可以隱藏 <code>equals</code>/<code>hashCode</code>/<code>toString</code> 等函式，
            但無法隱藏 <code>dataClass.componentN</code> 和 <code>dataClass.copy</code> 等合成函式。請使用 <code>suppressObviousFunctions</code> 來處理。
        </p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="offlineMode">
        <p>是否透過網路解析遠端檔案/連結。</p>
        <p>
            這包括用於產生外部文件連結的 package-lists（套件清單）。 
            例如，為了使標準程式庫中的類別可點擊。 
        </p>
        <p>
            在某些情況下，將此項設定為 <code>true</code> 可以顯著加快建置速度，
            但也可能降低文件品質和使用者體驗。例如，
            無法解析來自相依項（包括標準程式庫）的類別/成員連結。
        </p>
        <p>
            注意：您可以將抓取的檔案快取到本機，並將本機路徑提供給 Dokka。
            請參閱 <code>externalDocumentationLinks</code> 區段。
        </p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="sourceDirectories">
        <p>
            要分析和記錄的原始碼根目錄。
            可接受的輸入包括目錄和個別的 <code>.kt</code> / <code>.java</code> 檔案。
        </p>
        <p>預設值：<code>{project.compileSourceRoots}</code></p>
    </def>
    <def title="documentedVisibilities">
        <p>應記錄的可見性修飾符集合。</p>
        <p>
            如果您想記錄 <code>protected</code>/<code>internal</code>/<code>private</code> 宣告，
            或者如果您想排除 <code>public</code> 宣告並僅記錄內部 API，則可以使用此項。
        </p>
        <p>可以針對每個套件進行配置。</p>
        <p>預設值：<code>PUBLIC</code></p>
    </def>
    <def title="reportUndocumented">
        <p>
            是否對可見且未記錄的宣告發出警告，即在經過 <code>documentedVisibilities</code> 和其他篩選器過濾後，
            沒有 KDoc 的宣告。
        </p>
        <p>此設定與 <code>failOnWarning</code> 配合良好。</p>
        <p>這可以在套件層級覆寫。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="skipDeprecated">
        <p>是否記錄標註有 <code>@Deprecated</code> 的宣告。</p>
        <p>這可以在套件層級覆寫。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="skipEmptyPackages">
        <p>
            在套用各種篩選器後，是否跳過不含任何可見宣告的套件。
        </p>
        <p>
            例如，如果 <code>skipDeprecated</code> 設定為 <code>true</code>，且您的套件僅包含
            已棄用的宣告，則該套件被視為空套件。
        </p>
        <p>預設值：<code>true</code></p>
    </def>
    <def title="suppressedFiles">
        <p>
            應隱藏的目錄或個別檔案，這意味著這些檔案中的宣告將不被記錄。
        </p>
    </def>
    <def title="suppressAnnotatedWith">
        <p>用於隱藏標註有特定註解之宣告的註解完全限定名稱 (FQN) 列表。</p>
        <p>
            任何標註有這些註解之一的宣告都將從產生的文件中排除。
        </p>
    </def>
    <def title="jdkVersion">
        <p>為 Java 型別產生外部文件連結時要使用的 JDK 版本。</p>
        <p>
            例如，如果您在某些公開宣告簽章中使用 <code>java.util.UUID</code>，
            且此選項設定為 <code>8</code>，Dokka 會為其產生指向 <a href="https://docs.oracle.com/javase/8/docs/api/java/util/UUID.html">JDK 8 Javadocs</a> 的外部文件連結。
        </p>
        <p>預設值：JDK 8</p>
    </def>
    <def title="languageVersion">
        <p>
            用於設定分析和 <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a>
            環境的 <a href="https://kotlinlang.org/docs/compatibility-modes.html">Kotlin 語言版本</a>。
        </p>
        <p>預設情況下，使用 Dokka 內嵌編譯器可用的最新語言版本。</p>
    </def>
    <def title="apiVersion">
        <p>
            用於設定分析和 <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a>
            環境的 <a href="https://kotlinlang.org/docs/compatibility-modes.html">Kotlin API 版本</a>。
        </p>
        <p>預設情況下，它是從 <code>languageVersion</code> 推導出來的。</p>
    </def>
    <def title="noStdlibLink">
        <p>
            是否產生指向 Kotlin 標準程式庫 API 參考文件的外部文件連結。
        </p>
        <p>注意：當 <code>noStdLibLink</code> 設定為 <code>false</code> 時，<b>會</b>產生連結。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="noJdkLink">
    <anchor name="includes"/>
        <p>是否產生指向 JDK Javadocs 的外部文件連結。</p>
        <p>JDK Javadocs 的版本由 <code>jdkVersion</code> 選項決定。</p>
        <p>注意：當 <code>noJdkLink</code> 設定為 <code>false</code> 時，<b>會</b>產生連結。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="includes">
        <p>
            包含 <a href="dokka-module-and-package-docs.md">模組和套件文件</a> 的 Markdown 檔案列表。
        </p>
        <p>指定檔案的內容會被剖析並作為模組和套件說明嵌入到文件中。</p>
    </def>
    <def title="classpath">
        <p>用於分析和互動式範例的 Classpath。</p>
        <p>
            如果某些來自相依項的型別未能被自動解析/識別，則此選項很有用。
            此選項接受 <code>.jar</code> 和 <code>.klib</code> 檔案。
        </p>
        <p>預設值：<code>{project.compileClasspathElements}</code></p>
    </def>
    <def title="samples">
        <p>
            包含範例函式的目錄或檔案列表，這些函式透過 
            <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample KDoc 標籤</a>引用。
        </p>
    </def>
</deflist>

### 原始碼連結配置 {id="source-link-configuration"}

`sourceLinks` 配置區塊允許您為每個簽章新增一個 `source` 連結，
該連結指向具有特定行號的 `url`。（行號可以透過設定 `lineSuffix` 來配置）。

這有助於讀者找到每個宣告的原始碼。

有關範例，請參閱 `kotlinx.coroutines` 中
[`count()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/count.html)
函式的文件。

```xml
<plugin>
    <groupId>org.jetbrains.dokka</groupId>
    <artifactId>dokka-maven-plugin</artifactId>
    <!--  ...  -->
    <configuration>
        <sourceLinks>
            <link>
                <path>src</path>
                <url>https://github.com/kotlin/dokka/tree/master/src</url>
                <lineSuffix>#L</lineSuffix>
            </link>
        </sourceLinks>
    </configuration>
</plugin>
```

<deflist collapsible="true">
    <def title="path">
        <p>
            本機原始碼目錄的路徑。路徑必須相對於當前模組的根目錄。
        </p>
        <p>
            注意：僅允許使用基於 Unix 的路徑，Windows 風格的路徑將會拋出錯誤。
        </p>
    </def>
    <def title="url">
        <p>
            文件讀者可以造訪的原始碼託管服務 URL，
            例如 GitHub、GitLab、Bitbucket 等。此 URL 用於產生宣告的原始碼連結。
        </p>
    </def>
    <def title="lineSuffix">
        <p>
            用於將原始碼行號附加到 URL 的後綴。這有助於讀者不僅導覽到檔案，還能導覽到宣告的特定行號。
        </p>
        <p>
            行號本身會附加到指定的後綴。例如，如果此選項設定為 <code>#L</code> 且行號為 10，則生成的 URL 後綴為 <code>#L10</code>。
        </p>
        <p>
            熱門服務所使用的後綴：</p>
            <list>
            <li>GitHub: <code>#L</code></li>
            <li>GitLab: <code>#L</code></li>
            <li>Bitbucket: <code>#lines-</code></li>
            </list>
    </def>
</deflist>

### 外部文件連結配置 {id="external-documentation-links-configuration"}

`externalDocumentationLinks` 區塊允許建立指向相依項外部託管文件的連結。

例如，如果您正在使用來自 `kotlinx.serialization` 的型別，預設情況下它們在您的文件中是不可點擊的，就好像它們未被解析一樣。然而，由於 `kotlinx.serialization` 的 API 參考文件是由 Dokka 建置並[發布在 kotlinlang.org 上](https://kotlinlang.org/api/kotlinx.serialization/)，您可以為其配置外部文件連結。這讓 Dokka 能夠為該程式庫中的型別產生連結，使其成功解析並可供點擊。

預設情況下，已配置了 Kotlin 標準程式庫和 JDK 的外部文件連結。

```xml
<plugin>
    <groupId>org.jetbrains.dokka</groupId>
    <artifactId>dokka-maven-plugin</artifactId>
    <!--  ...  -->
    <configuration>
        <externalDocumentationLinks>
            <link>
                <url>https://kotlinlang.org/api/kotlinx.serialization/</url>
                <packageListUrl>file:/${project.basedir}/serialization.package.list</packageListUrl>
            </link>
        </externalDocumentationLinks>
    </configuration>
</plugin>
```

<deflist collapsible="true">
    <def title="url">
        <p>要連結到的文件根 URL。它<b>必須</b>包含尾隨斜線。</p>
        <p>
            Dokka 會盡力自動尋找給定 URL 的 <code>package-list</code>（套件清單），並將宣告連結在一起。
        </p>
        <p>
            如果自動解析失敗，或者如果您想改用本機快取檔案，請考慮設定 <code>packageListUrl</code> 選項。
        </p>
    </def>
    <def title="packageListUrl">
        <p>
            <code>package-list</code> 的精確位置。這是除了依賴 Dokka 自動解析之外的另一種選擇。
        </p>
        <p>
            套件清單包含有關文件和專案本身的資訊，例如模組和套件名稱。
        </p>
        <p>這也可以是本機快取檔案，以避免網路呼叫。</p>
    </def>
</deflist>

### 套件選項 {id="package-options"}

`perPackageOptions` 配置區塊允許為由 `matchingRegex` 匹配的特定套件設定一些選項。

```xml
<plugin>
    <groupId>org.jetbrains.dokka</groupId>
    <artifactId>dokka-maven-plugin</artifactId>
    <!--  ...  -->
    <configuration>
        <perPackageOptions>
            <packageOptions>
                <matchingRegex>.*api.*</matchingRegex>
                <suppress>false</suppress>
                <reportUndocumented>false</reportUndocumented>
                <skipDeprecated>false</skipDeprecated>
                <documentedVisibilities>
                    <visibility>PUBLIC</visibility>
                    <visibility>PRIVATE</visibility>
                    <visibility>PROTECTED</visibility>
                    <visibility>INTERNAL</visibility>
                    <visibility>PACKAGE</visibility>
                </documentedVisibilities>
            </packageOptions>
        </perPackageOptions>
    </configuration>
</plugin>
```

<deflist collapsible="true">
    <def title="matchingRegex">
        <p>用於匹配套件的正規表示式。</p>
        <p>預設值：<code>.*</code></p>
 </def>
    <def title="suppress">
        <p>產生文件時是否應跳過此套件。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="documentedVisibilities">
        <p>應記錄的可見性修飾符集合。</p>
        <p>
            如果您想記錄此套件內的 <code>protected</code>/<code>internal</code>/<code>private</code> 宣告，
            或者如果您想排除 <code>public</code> 宣告並僅記錄內部 API，則可以使用此項。
        </p>
        <p>預設值：<code>PUBLIC</code></p>
    </def>
    <def title="skipDeprecated">
        <p>是否記錄標註有 <code>@Deprecated</code> 的宣告。</p>
        <p>這可以在專案/模組層級設定。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="reportUndocumented">
        <p>
            是否對可見且未記錄的宣告發出警告，即在經過 <code>documentedVisibilities</code> 和其他篩選器過濾後，
            沒有 KDoc 的宣告。
        </p>
        <p>此設定與 <code>failOnWarning</code> 配合良好。</p>
        <p>預設值：<code>false</code></p>
    </def>
</deflist>

### 完整配置 {id="complete-configuration"}

在下方您可以看到同時套用了所有可能的配置選項。

```xml
<plugin>
    <groupId>org.jetbrains.dokka</groupId>
    <artifactId>dokka-maven-plugin</artifactId>
    <!--  ...  -->
    <configuration>
        <skip>false</skip>
        <moduleName>${project.artifactId}</moduleName>
        <outputDir>${project.basedir}/target/documentation</outputDir>
        <failOnWarning>false</failOnWarning>
        <suppressObviousFunctions>true</suppressObviousFunctions>
        <suppressInheritedMembers>false</suppressInheritedMembers>
        <offlineMode>false</offlineMode>
        <sourceDirectories>
            <dir>${project.basedir}/src</dir>
        </sourceDirectories>
        <documentedVisibilities>
            <visibility>PUBLIC</visibility>
            <visibility>PRIVATE</visibility>
            <visibility>PROTECTED</visibility>
            <visibility>INTERNAL</visibility>
            <visibility>PACKAGE</visibility>
        </documentedVisibilities>
        <reportUndocumented>false</reportUndocumented>
        <skipDeprecated>false</skipDeprecated>
        <skipEmptyPackages>true</skipEmptyPackages>
        <suppressedFiles>
            <file>/path/to/dir</file>
            <file>/path/to/file</file>
        </suppressedFiles>
        <jdkVersion>8</jdkVersion>
        <languageVersion>1.7</languageVersion>
        <apiVersion>1.7</apiVersion>
        <noStdlibLink>false</noStdlibLink>
        <noJdkLink>false</noJdkLink>
        <includes>
            <include>packages.md</include>
            <include>extra.md</include>
        </includes>
        <classpath>${project.compileClasspathElements}</classpath>
        <samples>
            <dir>${project.basedir}/samples</dir>
        </samples>
        <sourceLinks>
            <link>
                <path>src</path>
                <url>https://github.com/kotlin/dokka/tree/master/src</url>
                <lineSuffix>#L</lineSuffix>
            </link>
        </sourceLinks>
        <externalDocumentationLinks>
            <link>
                <url>https://kotlinlang.org/api/core/kotlin-stdlib/</url>
                <packageListUrl>file:/${project.basedir}/stdlib.package.list</packageListUrl>
            </link>
        </externalDocumentationLinks>
        <perPackageOptions>
            <packageOptions>
                <matchingRegex>.*api.*</matchingRegex>
                <suppress>false</suppress>
                <reportUndocumented>false</reportUndocumented>
                <skipDeprecated>false</skipDeprecated>
                <documentedVisibilities>
                    <visibility>PUBLIC</visibility>
                    <visibility>PRIVATE</visibility>
                    <visibility>PROTECTED</visibility>
                    <visibility>INTERNAL</visibility>
                    <visibility>PACKAGE</visibility>
                </documentedVisibilities>
            </packageOptions>
        </perPackageOptions>
    </configuration>
</plugin>
```
