[//]: # (title: クライアントの依存関係の追加)

<show-structure for="chapter" depth="2"/>

<link-summary>既存のプロジェクトにクライアントの依存関係を追加する方法を学びます。</link-summary>

プロジェクトで Ktor HTTP クライアントを使用するには、[リポジトリを構成](#repositories)し、以下の依存関係を追加する必要があります：

- **[ktor-client-core](#client-dependency)**

  `ktor-client-core` には Ktor クライアントのコア機能が含まれています。
- **[エンジン依存関係](#engine-dependency)**

  エンジンはネットワークリクエストの処理に使用されます。
  [特定のプラットフォーム](client-supported-platforms.md)では、ネットワークリクエストを処理するために特定のエンジンが必要になる場合があることに注意してください。
- (オプション) **[ロギング依存関係](#logging-dependency)**

  構造化され、柔軟なロギング機能を実現するためのロギングフレームワークを提供します。

- (オプション) **[プラグイン依存関係](#plugin-dependency)**

  プラグインは、特定の機能でクライアントを拡張するために使用されます。

<p>
    Ktor の依存関係を追加する前に、このプロジェクトのリポジトリを構成する必要があります：
</p>
<list>
    <li>
        <p>
            <control>Production</control>
        </p>
        <p>
            Ktor の製品リリース（Production releases）は、Maven Central リポジトリで入手可能です。
            ビルドスクリプトで次のようにこのリポジトリを宣言できます：
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
                        プロジェクトは <a href="https://maven.apache.org/guides/introduction/introduction-to-the-pom.html#super-pom">Super POM</a> からセントラルリポジトリを継承しているため、<path>pom.xml</path> ファイルに Maven Central リポジトリを追加する必要はありません。
                    </p>
                </note>
            </TabItem>
        </Tabs>
    </li>
    <li>
        <p>
            <control>Early Access Program (EAP)</control>
        </p>
        <p>
            Ktor の <a href="https://ktor.io/eap/">EAP</a> バージョンにアクセスするには、<a href="https://redirector.kotlinlang.org/maven/ktor-eap/io/ktor/">Space リポジトリ</a>を参照する必要があります：
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
            Ktor EAP には <a href="https://redirector.kotlinlang.org/maven/dev">Kotlin dev リポジトリ</a>が必要な場合があることに注意してください：
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

## 依存関係の追加 {id="add-ktor-dependencies"}

> [異なるプラットフォーム](client-supported-platforms.md)に対して、Ktor は `-jvm` や `-js` などのサフィックスが付いたプラットフォーム固有のアーティファクト（例：`ktor-client-core-jvm`）を提供しています。Gradle は特定のプラットフォームに適したアーティファクトを自動的に解決しますが、Maven はこの機能をサポートしていません。つまり、Maven の場合は、プラットフォーム固有のサフィックスを手動で追加する必要があります。
>
{type="tip"}

### クライアント依存関係 {id="client-dependency"}

メインのクライアント機能は `ktor-client-core` アーティファクトで利用できます。ビルドシステムに応じて、次のように追加できます：

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

`$ktor_version` は、必要な Ktor バージョン（例：`%ktor_version%`）に置き換えることができます。

#### マルチプラットフォーム {id="client-dependency-multiplatform"}

マルチプラットフォームプロジェクトの場合、`gradle/libs.versions.toml` ファイルで Ktor バージョンと `ktor-client-core` アーティファクトを定義できます：

```kotlin
[versions]
ktor = "3.4.0"

[libraries]
ktor-client-core = { module = "io.ktor:ktor-client-core", version.ref = "ktor" }
```

次に、`ktor-client-core` を `commonMain` ソースセットに依存関係として追加します：

```kotlin
sourceSets {
    commonMain.dependencies {
        implementation(libs.ktor.client.core)
    }
}
```

### エンジン依存関係 {id="engine-dependency"}

[エンジン](client-engines.md)はネットワークリクエストの処理を担当します。Apache、CIO、Android、iOS など、さまざまなプラットフォームで利用可能な異なるクライアントエンジンがあります。たとえば、次のように `CIO` エンジンの依存関係を追加できます：

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

#### マルチプラットフォーム {id="engine-dependency-multiplatform"}

マルチプラットフォームプロジェクトの場合、必要なエンジンの依存関係を対応するソースセットに追加する必要があります。

たとえば、Android 用の `OkHttp` エンジンの依存関係を追加するには、まず `gradle/libs.versions.toml` ファイルで Ktor バージョンと `ktor-client-okhttp` アーティファクトを定義します：

```kotlin
[versions]
ktor = "3.4.0"

[libraries]
ktor-client-okhttp = { module = "io.ktor:ktor-client-okhttp", version.ref = "ktor" }
```

次に、`ktor-client-okhttp` を `androidMain` ソースセットに依存関係として追加します：

```kotlin
sourceSets {
    androidMain.dependencies {
        implementation(libs.ktor.client.okhttp)
    }
}
```

特定のエンジンに必要な依存関係の全リストについては、[エンジンの依存関係を追加する](client-engines.md#dependencies)を参照してください。

### ロギング依存関係

  <p>
    <a href="#jvm">JVM</a> 上では、Ktor はロギングの抽象化レイヤーとして Simple Logging Facade for Java (<a href="http://www.slf4j.org/">SLF4J</a>) を使用します。SLF4J はロギング API を基盤となるロギング実装から分離し、アプリケーションの要件に最適なロギングフレームワークを統合できるようにします。
    一般的な選択肢には <a href="https://logback.qos.ch/">Logback</a> や <a href="https://logging.apache.org/log4j">Log4j</a> が含まれます。
    フレームワークが提供されない場合、SLF4J はデフォルトで no-operation (NOP) 実装になり、実質的にロギングが無効になります。
  </p>

  <p>
    ロギングを有効にするには、<a href="https://logback.qos.ch/">Logback</a> などの必要な SLF4J 実装を含むアーティファクトを含めます：
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

Ktor でのロギングの詳細については、[Ktor Client でのロギング](client-logging.md)を参照してください。

### プラグイン依存関係 {id="plugin-dependency"}

Ktor では、認可やシリアライゼーションなど、デフォルトでは利用できない追加のクライアント機能（[プラグイン](client-plugins.md)）を使用できます。その一部は個別のアーティファクトで提供されています。必要なプラグインのトピックから、どの依存関係が必要かを確認できます。

> マルチプラットフォームプロジェクトの場合、プラグインの依存関係は `commonMain` ソースセットに追加する必要があります。一部のプラグインには特定のプラットフォームに対する[制限](client-engines.md#limitations)がある場合があることに注意してください。

## Ktor バージョンの一貫性の確保

<chapter title="Ktor BOM 依存関係の使用">

Ktor BOM を使用すると、依存関係ごとにバージョンを個別に指定することなく、すべての Ktor モジュールが同じ一貫したバージョンを使用することを保証できます。

Ktor BOM の依存関係を追加するには、ビルドスクリプトで次のように宣言します：

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
    公開されているバージョンカタログを使用して、Ktor の依存関係の宣言を一元化することもできます。
    このアプローチには以下の利点があります：
</p>
<list id="published-version-catalog-benefits">
    <li>
        独自のカタログで Ktor のバージョンを手動で宣言する必要がなくなります。
    </li>
    <li>
        すべての Ktor モジュールを単一のネームスペースの下で公開します。
    </li>
</list>
<p>
    カタログを宣言するには、
    <path>settings.gradle.kts</path>
    で任意の名前のバージョンカタログを作成します：
</p>
<code-block lang="kotlin" code="    dependencyResolutionManagement {&#10;        versionCatalogs {&#10;            create(&quot;ktorLibs&quot;) {&#10;                from(&quot;io.ktor:ktor-version-catalog:%ktor_version%&quot;)&#10;            }&#10;        }&#10;    }"></code-block>
<p>
    その後、カタログ名を参照することで、モジュールの
    <path>build.gradle.kts</path>
    に依存関係を追加できます：
</p>
<code-block lang="kotlin" code="    dependencies {&#10;        implementation(ktorLibs.%target_module%.core)&#10;        // ...&#10;    }"></code-block>