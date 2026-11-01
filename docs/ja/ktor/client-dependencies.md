[//]: # (title: クライアントの依存関係の追加)

<show-structure for="chapter" depth="2"/>

<link-summary>既存のプロジェクトにクライアントの依存関係を追加する方法を学びます。</link-summary>

プロジェクトで Ktor HTTP クライアントを使用するには、[リポジトリを設定](#repositories)し、以下の依存関係を追加する必要があります:

- **[ktor-client-core](#client-dependency)**

  `ktor-client-core` には Ktor クライアントのコア機能が含まれています。
- **[エンジンの依存関係](#engine-dependency)**

  エンジンはネットワークリクエストを処理するために使用されます。[特定のプラットフォーム](client-supported-platforms.md)では、ネットワークリクエストを処理するために特定のエンジンが必要になる場合があることに注意してください。
- (任意) **[ロギングの依存関係](#logging-dependency)**

  構造化された柔軟なロギング機能を実現するためのロギングフレームワークを提供します。

- (任意) **[プラグインの依存関係](#plugin-dependency)**

  プラグインは、特定の機能でクライアントを拡張するために使用されます。

<chapter title="リポジトリの設定" id="repositories">
        <p>
            Ktor の依存関係を追加する前に、このプロジェクト用のリポジトリを設定する必要があります:
        </p>
        <list>
            <li>
                <p>
                    <control>プロダクション</control>
                </p>
                <p>
                    Ktor のプロダクションリリースは Maven Central リポジトリで提供されています。ビルドスクリプトでこのリポジトリを次のように宣言できます:
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
                                プロジェクトは <a href="https://maven.apache.org/guides/introduction/introduction-to-the-pom.html#super-pom">Super POM</a> から Central リポジトリを継承するため、<Path>pom.xml</Path> ファイルに Maven Central リポジトリを追加する必要はありません。
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
                    Ktor の <a href="https://ktor.io/eap/">EAP</a> バージョンにアクセスするには、<a href="https://redirector.kotlinlang.org/maven/ktor-eap/io/ktor/">Space リポジトリ</a>を参照する必要があります:
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
                    Ktor の EAP では <a href="https://redirector.kotlinlang.org/maven/dev">Kotlin dev リポジトリ</a>が必要になる場合があることに注意してください:
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

## 依存関係の追加 {id="add-ktor-dependencies"}

> Ktor は[さまざまなプラットフォーム](client-supported-platforms.md)向けに、`-jvm` や `-js` などのサフィックスが付いたプラットフォーム固有のアーティファクト（例: `ktor-client-core-jvm`）を提供しています。Gradle は特定のプラットフォームに適したアーティファクトを自動的に解決しますが、Maven はこの機能をサポートしていないことに注意してください。これは、Maven の場合はプラットフォーム固有のサフィックスを手動で追加する必要があることを意味します。
>
{type="tip"}

### クライアントの依存関係 {id="client-dependency"}

メインのクライアント機能は `ktor-client-core` アーティファクトで提供されています。ビルドシステムに応じて、次のように追加できます:

<var name="artifact_name" value="ktor-client-core"/>
<var name="ktor_version_catalog_name" value="ktorLibs.client.core"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a>を使用しています。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a>を使用しています。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

#### マルチプラットフォーム {id="client-dependency-multiplatform"}

マルチプラットフォームプロジェクトの場合は、<Path>settings.gradle.kts</Path> ファイルに Ktor バージョンカタログをインポートします:

```kotlin
dependencyResolutionManagement {
    versionCatalogs {
        create("ktorLibs").from("io.ktor:ktor-version-catalog:3.6.1")
    }
}
```

次に、`ktor-client-core` を依存関係として `commonMain` ソースセットに追加します:

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

### エンジンの依存関係 {id="engine-dependency"}

[エンジン](client-engines.md)はネットワークリクエストの処理を担当します。Ktor はプラットフォームごとに異なるクライアントエンジンを提供しています。

例えば、`CIO` エンジンは次のように追加できます:

<var name="artifact_name" value="ktor-client-cio"/>
<var name="ktor_version_catalog_name" value="ktorLibs.client.cio"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a>を使用しています。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a>を使用しています。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

#### マルチプラットフォーム {id="engine-dependency-multiplatform"}

##### デフォルトエンジンの使用 {id="use-default-engines"}

マルチプラットフォームプロジェクトでは、`ktor-client-engine-defaults` アーティファクトを使用して、各ターゲットプラットフォームに適したクライアントエンジンを提供できます。

このアーティファクトの依存関係を `commonMain` ソースセットに追加します:

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
    上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
    Ktor バージョンカタログ</a>を使用しています。
</note>

##### 特定のエンジンの使用 {id="kmp-specific-engine"}

特定のエンジンが必要な場合は、代わりに該当するプラットフォームのソースセットにその依存関係を追加します。例えば、Android で `OkHttp` を使用するには、`androidMain` ソースセットに `ktorLibs.client.okhttp` を追加します:

```kotlin
sourceSets {
    androidMain.dependencies {
        implementation(ktorLibs.client.okhttp)
    }
}
```

<note>
    上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
    Ktor バージョンカタログ</a>を使用しています。
</note>

> 各エンジンに必要な依存関係については、[エンジンの依存関係の追加](client-engines.md#dependencies)を参照してください。
> 
{style="tip"}

### ロギングの依存関係 {id="logging-dependency"}

<p>
  <a href="client-engines.md#jvm">JVM</a> では、Ktor はロギングの抽象化レイヤーとして Simple Logging Facade for Java
  (<a href="http://www.slf4j.org/">SLF4J</a>) を使用します。SLF4J はロギング API を基盤となるロギング実装から切り離すため、アプリケーションの要件に最も適したロギングフレームワークを統合できます。一般的な選択肢には <a href="https://logback.qos.ch/">Logback</a> や 
  <a href="https://logging.apache.org/log4j">Log4j</a> があります。フレームワークが提供されていない場合、SLF4J はデフォルトで無操作 (NOP) 実装になり、実質的にロギングが無効になります。
</p>

<p>
  ロギングを有効にするには、<a href="https://logback.qos.ch/">Logback</a> などの必要な SLF4J 実装を含むアーティファクトを追加します:
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

Ktor でのロギングの詳細については、[Ktor Client のロギング](client-logging.md)を参照してください。

### プラグインの依存関係 {id="plugin-dependency"}

Ktor では、認証やシリアライズなど、デフォルトでは利用できない追加のクライアント機能（[プラグイン](client-plugins.md)）を使用できます。一部のプラグインは個別のアーティファクトで提供されています。必要な依存関係については、該当するプラグインのトピックで確認できます。

> マルチプラットフォームプロジェクトの場合、プラグインの依存関係は `commonMain` ソースセットに追加する必要があります。一部のプラグインには特定のプラットフォームに対する[制限事項](client-engines.md#limitations)がある場合があることに注意してください。

## Ktor のバージョンの一貫性を確保する {id="ensure-ktor-version-consistency"}

<chapter title="Ktor BOM の依存関係を使用する">

Ktor BOM を使用すると、依存関係ごとにバージョンを個別に指定することなく、すべての Ktor モジュールで同一の一貫したバージョンを使用できるようになります。

Ktor BOM の依存関係を追加するには、ビルドスクリプトで次のように宣言します:

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
<chapter id="using-version-catalog" title="公開されているバージョンカタログを使用する">
            <p>
                公開されているバージョンカタログを使用して、Ktor の依存関係宣言を一元化することもできます。このアプローチには以下の利点があります:
            </p>
            <list id="published-version-catalog-benefits">
                <li>
                    独自のカタログで Ktor のバージョンを手動で宣言する必要がなくなります。
                </li>
                <li>
                    すべての Ktor モジュールが単一の名前空間の下に公開されます。
                </li>
            </list>
            <p>
                カタログを宣言するには、<Path>settings.gradle.kts</Path> で任意の名前を付けてバージョンカタログを作成します:
            </p>
            <code-block lang="kotlin" code="                dependencyResolutionManagement {&#10;                    versionCatalogs {&#10;                        create(&quot;ktorLibs&quot;) {&#10;                            from(&quot;io.ktor:ktor-version-catalog:%ktor_version%&quot;)&#10;                        }&#10;                    }&#10;                }"/>
            <p>
                その後、カタログ名を参照してモジュールの <Path>build.gradle.kts</Path> に依存関係を追加できます:
            </p>
            <code-block lang="kotlin" code="                dependencies {&#10;                    implementation(ktorLibs.%target_module%.core)&#10;                    // ...&#10;                }"/>
        </chapter>