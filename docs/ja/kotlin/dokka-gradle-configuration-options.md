[//]: # (title: DokkaのGradle設定オプション)

Dokkaには、作成者と読者の体験をカスタマイズするための多くの設定オプションがあります。

以下に、各設定セクションの詳細な説明といくつかの例を示します。[すべての設定オプション](#complete-configuration)を適用した例も確認できます。

単一プロジェクトおよびマルチプロジェクトのビルドで設定ブロックを適用する方法の詳細については、[設定例](dokka-gradle.md#configuration-examples)を参照してください。

### 一般設定 {id="general-configuration"}

Dokka Gradleプラグインの一般的な設定例は以下のとおりです。

* トップレベルの `dokka {}` DSL設定を使用します。
* DGPでは、Dokka publication（公開）設定を `dokkaPublications{}` ブロックで宣言します。
* デフォルトのpublicationは [`html`](dokka-html.md) と [`javadoc`](dokka-javadoc.md) です。

* GradleのKotlin DSLはタイプセーフアクセサー（type-safe accessors）を使用するため、`build.gradle.kts` ファイルの構文は通常の `.kt` ファイル（Kotlinカスタムプラグインなどで使用されるものなど）とは異なります。

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
plugins {
    id("org.jetbrains.dokka") version "%dokkaVersion%"
}

dokka {
    dokkaPublications.html {
        moduleName.set(project.name)
        moduleVersion.set(project.version.toString())
        // HTMLドキュメントの標準出力ディレクトリ
        outputDirectory.set(layout.buildDirectory.dir("dokka/html"))
        failOnWarning.set(false)
        suppressInheritedMembers.set(false)
        suppressObviousFunctions.set(true)
        offlineMode.set(false)
        includes.from("packages.md", "extra.md")
        
        // 追加ファイルの出力ディレクトリ
        // 出力ディレクトリを変更して追加ファイルを含めたい場合は、
        // 標準ブロックの代わりにこれを使用します
        outputDirectory.set(rootDir.resolve("docs/api/0.x"))
        
        // 複数のファイルを追加するにはfileTreeを使用します
        includes.from(
            fileTree("docs") {
                include("**/*.md")
            }
        )
    }
}
```

ファイルの操作に関する詳細については、[Gradleドキュメント](https://docs.gradle.org/current/userguide/working_with_files.html#sec:file_trees)を参照してください。

</tab>
<tab title="Kotlin custom plugin" group-key="kotlin custom">

```kotlin
// CustomPlugin.kt

import org.gradle.api.Plugin
import org.gradle.api.Project
import org.jetbrains.dokka.gradle.DokkaExtension

abstract class CustomPlugin : Plugin<Project> {
    override fun apply(project: Project) {
        project.plugins.apply("org.jetbrains.dokka")

        project.extensions.configure(DokkaExtension::class.java) { dokka ->
            
            dokka.moduleName.set(project.name)
            dokka.moduleVersion.set(project.version.toString())

            dokka.dokkaPublications.named("html") { publication ->
                // HTMLドキュメントの標準出力ディレクトリ
                publication.outputDirectory.set(project.layout.buildDirectory.dir("dokka/html"))
                publication.failOnWarning.set(true)
                publication.suppressInheritedMembers.set(true)
                publication.offlineMode.set(false)
                publication.suppressObviousFunctions.set(true)
                publication.includes.from("packages.md", "extra.md")

                // 追加ファイルの出力ディレクトリ
                // 出力ディレクトリを変更して追加ファイルを含めたい場合は、
                // 標準ブロックの代わりにこれを使用します
                html.outputDirectory.set(project.rootDir.resolve("docs/api/0.x"))
            }
        }
    }
}
```

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.dokka' version '%dokkaVersion%'
}

dokka {
    dokkaPublications {
        html {
            // モジュールの基本情報を設定
            moduleName.set(project.name)
            moduleVersion.set(project.version.toString())

            // HTMLドキュメントの標準出力ディレクトリ
            outputDirectory.set(layout.buildDirectory.dir("dokka/html"))

            // Dokkaのコアオプション
            failOnWarning.set(false)
            suppressInheritedMembers.set(false)
            suppressObviousFunctions.set(true)
            offlineMode.set(false)
            includes.from(files("packages.md", "extra.md"))

            // 追加ファイルの出力ディレクトリ
            // 出力ディレクトリを変更して追加ファイルを含めたい場合は、
            // 標準ブロックの代わりにこれを使用します
            outputDirectory.set(file("$rootDir/docs/api/0.x"))
        }
    }
}
```

</tab>
</tabs>

<deflist collapsible="true">
    <def title="moduleName">
        <p>
           プロジェクトドキュメントの表示名です。目次、ナビゲーション、ヘッダー、ログメッセージに表示されます。マルチプロジェクトビルドでは、各サブプロジェクトの <code>moduleName</code> が集約ドキュメント内のセクションタイトルとして使用されます。
        </p>
        <p>デフォルト: Gradleプロジェクト名</p>
    </def>
    <def title="moduleVersion">
        <p>
            生成されたドキュメントに表示されるサブプロジェクトのバージョンです。単一プロジェクトビルドでは、プロジェクトのバージョンとして使用されます。マルチプロジェクトビルドでは、ドキュメントを集約する際に各サブプロジェクトの <code>moduleVersion</code> が使用されます。
        </p>
        <p>デフォルト: Gradleプロジェクトのバージョン</p>
    </def>
    <def title="outputDirectory">
        <p>生成されたドキュメントが保存されるディレクトリです。</p>
        <p>この設定は、<code>dokkaGenerate</code> タスクによって生成されるすべてのドキュメント形式（HTML、Javadocなど）に適用されます。</p>
        <p>デフォルト: <code>build/dokka/html</code></p>
        <p><b>追加ファイルの出力ディレクトリ</b></p>
        <p>単一プロジェクトおよびマルチプロジェクトビルドの両方で、出力ディレクトリを指定して追加ファイルを含めることができます。マルチプロジェクトビルドの場合は、ルートプロジェクトの設定で出力ディレクトリを設定し、追加ファイルを含めてください。
        </p>
    </def>
    <def title="failOnWarning">
        <p>
            ドキュメント生成中に警告が発生した際に、Dokkaがビルドを失敗させるかどうかを決定します。処理はまずすべてのエラーと警告が出力されるまで待機します。
        </p>
        <p>この設定は <code>reportUndocumented</code> と併用すると効果的です。</p>
        <p>デフォルト: <code>false</code></p>
    </def>
    <def title="suppressInheritedMembers">
        <p>特定のクラスで明示的にオーバーライドされていない継承メンバーを除外するかどうか。</p>
        <p>
            注意: これにより <code>equals</code>、<code>hashCode</code>、<code>toString</code> などの関数は除外されますが、<code>dataClass.componentN</code> や <code>dataClass.copy</code> などの合成（synthetic）関数は除外されません。それらを除外するには <code>suppressObviousFunctions</code> を使用してください。
        </p>
        <p>デフォルト: <code>false</code></p>
    </def>
    <def title="suppressObviousFunctions">
        <p>自明な（obvious）関数を除外するかどうか。</p>
        <p>
            関数が以下のいずれかに該当する場合、自明であるとみなされます:</p>
            <list>
                <li>
                    <code>equals</code>、<code>hashCode</code>、<code>toString</code> のように、<code>kotlin.Any</code>、<code>Kotlin.Enum</code>、<code>java.lang.Object</code>、または <code>java.lang.Enum</code> から継承されている。
                </li>
                <li>
                    <code>dataClass.componentN</code> や <code>dataClass.copy</code> のように、合成された（コンパイラによって生成された）ものであり、ドキュメントが存在しない。
                </li>
            </list>
        <p>デフォルト: <code>true</code></p>
    </def>
    <def title="offlineMode">
        <p>ネットワーク経由でリモートファイルやリンクを解決するかどうか。</p>
        <p>
            これには、外部ドキュメントへのリンク生成に使用される package-list が含まれます。たとえば、これにより標準ライブラリのクラスをドキュメント内でクリック可能にできます。
        </p>
        <p>
            これを <code>true</code> に設定すると、場合によってはビルド時間を大幅に短縮できますが、標準ライブラリを含む依存関係のクラスやメンバーへのリンクが解決されなくなるなど、ユーザー体験が悪化する可能性もあります。
        </p>
        <p>注意: 取得したファイルをローカルにキャッシュし、ローカルパスとしてDokkaに提供することができます。<code>&lt;a href="#external-documentation-links-configuration"&gt;externalDocumentationLinks&lt;/a&gt;</code> セクションを参照してください。</p>
        <p>デフォルト: <code>false</code></p>
    </def>
     <def title="includes">
        <p>
            <a href="dokka-module-and-package-docs.md">サブプロジェクトおよびパッケージのドキュメント</a>を含むMarkdownファイルのリストです。Markdownファイルは<a href="dokka-module-and-package-docs.md#file-format">必要な形式</a>に一致している必要があります。
        </p>
        <p>指定されたファイルの内容が解析され、サブプロジェクトやパッケージの説明としてドキュメントに埋め込まれます。</p>
        <p>
            外観や使用方法の例については、<a href="https://github.com/Kotlin/dokka/blob/master/examples/gradle-v2/basic-gradle-example/build.gradle.kts">Dokka Gradleの例</a>を参照してください。
        </p>
    </def>
</deflist>

### ソースセット設定 {id="source-set-configuration"}

Dokkaでは、[Kotlinソースセット](https://kotlinlang.org/docs/multiplatform-discover-project.html#source-sets)のいくつかのオプションを設定できます。

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
import org.jetbrains.dokka.gradle.engine.parameters.VisibilityModifier

dokka {
    // ..
    // 一般設定セクション
    // ..

    // ソースセット設定
    dokkaSourceSets {
        // 例: 'linux' ソースセット専用の設定
        named("linux") {
            dependentSourceSets{named("native")}
            sourceRoots.from(file("linux/src"))
        }

        configureEach {
            suppress.set(false)
            displayName.set(name)
            documentedVisibilities.set(setOf(VisibilityModifier.Public)) // または documentedVisibilities(VisibilityModifier.Public)
            reportUndocumented.set(false)
            skipEmptyPackages.set(true)
            skipDeprecated.set(false)
            suppressGeneratedFiles.set(true)
            jdkVersion.set(8)
            languageVersion.set("1.7")
            apiVersion.set("1.7")
            sourceRoots.from(file("src"))
            classpath.from(file("libs/dependency.jar"))
            samples.from("samples/Basic.kt", "samples/Advanced.kt")
           
            sourceLink {
                // ソースリンクセクション
            }
            perPackageOption {
                // パッケージオプションセクション
            }
            externalDocumentationLinks {
                // 外部ドキュメントリンクセクション
            }
        }
    }
}
```

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

```groovy
import org.jetbrains.dokka.gradle.engine.parameters.VisibilityModifier

dokka {
    // ..
    // 一般設定セクション
    // ..

    // ソースセット設定
    dokkaSourceSets {
        // 例: 'linux' ソースセット専用の設定
        named("linux") {
            dependentSourceSets { named("native") }
            sourceRoots.from(file("linux/src"))
        }

        configureEach {
            suppress.set(false)
            displayName.set(name)
            documentedVisibilities.set([VisibilityModifier.Public] as Set) // または documentedVisibilities(VisibilityModifier.Public)
            reportUndocumented.set(false)
            skipEmptyPackages.set(true)
            skipDeprecated.set(false)
            suppressGeneratedFiles.set(true)
            jdkVersion.set(8)
            languageVersion.set("1.7")
            apiVersion.set("1.7")
            sourceRoots.from(file("src"))
            classpath.from(file("libs/dependency.jar"))
            samples.from("samples/Basic.kt", "samples/Advanced.kt")

            sourceLink {
                // ソースリンクセクション
            }
            perPackageOption {
                // パッケージオプションセクション
            }
            externalDocumentationLinks {
                // 外部ドキュメントリンクセクション
            }
        }
    }
}
```

</tab>
</tabs>

<deflist collapsible="true">
    <def title="suppress">
        <p>ドキュメント生成時にこのソースセットをスキップするかどうか。</p>
        <p>デフォルト: <code>false</code></p>
    </def>
    <def title="displayName">
        <p>このソースセットを参照するために使用される表示名。</p>
        <p>
            この名前は、外部向け（ドキュメントの読者に表示されるソースセット名など）と内部向け（<code>reportUndocumented</code> のログメッセージなど）の両方で使用されます。
        </p>
        <p>デフォルトでは、Kotlin Gradleプラグインから提供される情報に基づいて推測されます。</p>
    </def>
    <def title="documentedVisibilities">
        <p>生成されるドキュメントにDokkaが含める可視性修飾子を定義します。</p>
        <p>
            <code>protected</code>、<code>internal</code>、<code>private</code> の宣言をドキュメント化したい場合や、<code>public</code> 宣言を除外して内部APIのみをドキュメント化したい場合に使用します。
        </p>
        <p>
            さらに、Dokkaの 
            <a href="https://github.com/Kotlin/dokka/blob/v2.3.0/dokka-runners/dokka-gradle-plugin/src/main/kotlin/engine/parameters/HasConfigurableVisibilityModifiers.kt"><code>documentedVisibilities()</code> 関数</a> 
            を使用して、ドキュメント対象の可視性を追加することもできます。
        </p>
        <p>これは個々のパッケージごとに設定できます。</p>
        <p>デフォルト: <code>VisibilityModifier.Public</code></p>
    </def>
    <def title="reportUndocumented">
        <p>
            <code>documentedVisibilities</code> やその他のフィルターでフィルタリングされた後、ドキュメントのない（KDocがない）可視宣言について警告を出力するかどうか。
        </p>
        <p>この設定は <code>failOnWarning</code> と併用すると効果的です。</p>
        <p>これは個々のパッケージごとに設定できます。</p>
        <p>デフォルト: <code>false</code></p>
    </def>
    <def title="skipEmptyPackages">
        <p>
            各種フィルターが適用された後に、可視宣言を含まないパッケージをスキップするかどうか。
        </p>
        <p>
            たとえば、<code>skipDeprecated</code> が <code>true</code> に設定されており、パッケージに非推奨の宣言しか含まれていない場合、そのパッケージは空であるとみなされます。
        </p>
        <p>デフォルト: <code>true</code></p>
    </def>
    <def title="skipDeprecated">
        <p><code>@Deprecated</code> でアノテーションが付けられた宣言をドキュメント化するかどうか。</p>
        <p>これは個々のパッケージごとに設定できます。</p>
        <p>デフォルト: <code>false</code></p>
    </def>
    <def title="suppressGeneratedFiles">
        <p>生成されたファイルをドキュメント化するかどうか。</p>
        <p>
            生成されたファイルは <code>{project}/{buildDir}/generated</code> ディレクトリの下に存在することが想定されています。
        </p>
        <p>
            <code>true</code> に設定すると、そのディレクトリのすべてのファイルが事実上 <code>suppressedFiles</code> オプションに追加されるため、手動で設定することも可能です。
        </p>
        <p>デフォルト: <code>true</code></p>
    </def>
    <def title="suppressAnnotatedWith">
        <p>宣言を除外するためのアノテーションの完全修飾名（FQN）のセット。</p>
        <p>
            これらのアノテーションのいずれかが付与されている宣言は、生成されるドキュメントから除外されます。
        </p>
    </def>
    <def title="jdkVersion">
        <p>Java型に対する外部ドキュメントリンクを生成する際に使用するJDKバージョン。</p>
        <p>
            たとえば、公開宣言のシグネチャで <code>java.util.UUID</code> を使用しており、このオプションが <code>8</code> に設定されている場合、Dokkaはそれに対して <a href="https://docs.oracle.com/javase/8/docs/api/java/util/UUID.html">JDK 8 Javadocs</a> への外部ドキュメントリンクを生成します。
        </p>
        <p>デフォルト: `8`</p>
    </def>
    <def title="languageVersion">
        <p>
            解析および <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a>
            環境のセットアップに使用される <a href="https://kotlinlang.org/docs/compatibility-modes.html">Kotlin言語バージョン</a>。
        </p>
        <p>デフォルトでは、Dokkaの組み込みコンパイラで利用可能な最新の言語バージョンが使用されます。</p>
    </def>
    <def title="apiVersion">
        <p>
            解析および <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a>
            環境のセットアップに使用される <a href="https://kotlinlang.org/docs/compatibility-modes.html">Kotlin APIバージョン</a>。
        </p>
        <p>デフォルトでは、<code>languageVersion</code> から推測されます。</p>
    </def>
    <def title="sourceRoots">
        <p>
            解析およびドキュメント化の対象となるソースコードのルート。
            受け入れ可能な入力は、ディレクトリならびに個別の <code>.kt</code> および <code>.java</code> ファイルです。
        </p>
        <p>デフォルトでは、ソースルートはKotlin Gradleプラグインから提供される情報に基づいて推測されます。</p>
    </def>
    <def title="classpath">
        <p>解析およびインタラクティブなサンプルのためのクラスパス。</p>
        <p>依存関係に由来する一部の型が自動的に解決または検出されない場合に役立ちます。</p>
        <p>このオプションは <code>.jar</code> ファイルと <code>.klib</code> ファイルの両方を受け入れます。</p>
        <p>デフォルトでは、クラスパスはKotlin Gradleプラグインから提供される情報に基づいて推測されます。</p>
    </def>
    <def title="samples">
        <p>
            <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a> KDocタグを通じて参照されるサンプル関数を含むディレクトリまたはファイルのリスト。
        </p>
    </def>
</deflist>

### ソースリンク設定 {id="source-link-configuration"}

読者がリモートリポジトリ内の各宣言のソースを見つけられるように、ソースリンクを設定します。
この設定には `dokkaSourceSets.main {}` ブロックを使用します。

`sourceLinks {}` 設定ブロックを使用すると、各シグネチャに特定の行番号付きで `remoteUrl` にリンクする `source` リンクを追加できます。
行番号は `remoteLineSuffix` を設定することで構成可能です。

例については、`kotlinx.coroutines` の
[`count()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/count.html)
関数のドキュメントを参照してください。

GradleのKotlin DSLはタイプセーフアクセサーを使用するため、`build.gradle.kts` ファイルの構文は通常の `.kt` ファイル（カスタムGradleプラグインなどで使用されるものなど）とは異なります。

<tabs group="dokka-configuration">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
// build.gradle.kts

dokka {
    dokkaSourceSets.main {
        sourceLink {
            localDirectory.set(file("src/main/kotlin"))
            remoteUrl("https://github.com/your-repo")
            remoteLineSuffix.set("#L")
        }
    }
}
```

</tab>
<tab title="Kotlin custom plugin" group-key="kotlin custom">

```kotlin
// CustomPlugin.kt

import org.gradle.api.Plugin
import org.gradle.api.Project
import org.jetbrains.dokka.gradle.DokkaExtension

abstract class CustomPlugin : Plugin<Project> {
    override fun apply(project: Project) {
        project.plugins.apply("org.jetbrains.dokka")
        project.extensions.configure(DokkaExtension::class.java) { dokka ->
            dokka.dokkaSourceSets.named("main") { dss ->
                dss.includes.from("README.md")
                dss.sourceLink {
                    it.localDirectory.set(project.file("src/main/kotlin"))
                    it.remoteUrl("https://example.com/src")
                    it.remoteLineSuffix.set("#L")
                }
            }
        }
    }
}
```

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

```groovy
dokka {
    dokkaSourceSets {
        main {
            sourceLink {
                localDirectory.set(file("src/main/kotlin"))
                remoteUrl.set(new URI("https://github.com/your-repo"))
                remoteLineSuffix.set("#L")
            }
        }
    }
}
```

</tab>
</tabs>

<deflist collapsible="true">
    <def title="localDirectory">
        <p>
            ローカルのソースディレクトリへのパス。パスは現在のプロジェクトのルートからの相対パスである必要があります。
        </p>
    </def>
    <def title="remoteUrl">
        <p>
            GitHub、GitLab、Bitbucket、またはソースファイルに対して安定したURLを提供するホスティングサービスなど、ドキュメントの読者がアクセスできるソースコードホスティングサービスのURL。このURLは、宣言のソースコードリンクを生成するために使用されます。
        </p>
    </def>
    <def title="remoteLineSuffix">
        <p>
            URLにソースコードの行番号を追加するために使用されるサフィックス。これにより、読者はファイルだけでなく、宣言の特定の行番号に移動できます。
        </p>
        <p>
            番号自体は指定されたサフィックスに追加されます。たとえば、このオプションが <code>#L</code> に設定されており、行番号が 10 の場合、結果のURLサフィックスは <code>#L10</code> になります。
        </p>
        <p>
            一般的なサービスで使用されるサフィックス:</p>
            <list>
                <li>GitHub: <code>#L</code></li>
                <li>GitLab: <code>#L</code></li>
                <li>Bitbucket: <code>#lines-</code></li>
            </list>
        <p>デフォルト: <code>#L</code></p>
    </def>
</deflist>

### パッケージオプション {id="package-options"}

`perPackageOption` 設定ブロックを使用すると、`matchingRegex` に一致する特定のパッケージに対していくつかのオプションを設定できます。

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
import org.jetbrains.dokka.gradle.engine.parameters.VisibilityModifier

dokka {
    dokkaPublications.html {
        dokkaSourceSets.configureEach {
            perPackageOption {
                matchingRegex.set(".*api.*")
                suppress.set(false)
                skipDeprecated.set(false)
                reportUndocumented.set(false)
                documentedVisibilities.set(setOf(VisibilityModifier.Public)) // または documentedVisibilities(VisibilityModifier.Public)
            }
        }
    }
}
```

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

```groovy
import org.jetbrains.dokka.gradle.engine.parameters.VisibilityModifier

dokka {
    dokkaPublications {
        html {
            dokkaSourceSets.configureEach {
                perPackageOption {
                    matchingRegex.set(".*api.*")
                    suppress.set(false)
                    skipDeprecated.set(false)
                    reportUndocumented.set(false)
                    documentedVisibilities.set([VisibilityModifier.Public] as Set)
                }
            }
        }
    }
}
```

</tab>
</tabs>

<deflist collapsible="true">
    <def title="matchingRegex">
        <p>パッケージの一致判定に使用される正規表現。</p>
        <p>デフォルト: <code>.&#42;</code></p>
    </def>
    <def title="suppress">
        <p>ドキュメント生成時にパッケージをスキップするかどうか。</p>
        <p>デフォルト: <code>false</code></p>
    </def>
    <def title="skipDeprecated">
        <p><code>@Deprecated</code> でアノテーションが付けられた宣言をドキュメント化するかどうか。</p>
        <p>これはソースセットレベルで設定できます。</p>
        <p>デフォルト: <code>false</code></p>
    </def>
    <def title="reportUndocumented">
        <p>
            <code>documentedVisibilities</code> やその他のフィルターでフィルタリングされた後、ドキュメントのない（KDocがない）可視宣言について警告を出力するかどうか。
        </p>
        <p>この設定は <code>failOnWarning</code> と併用すると効果的です。</p>
        <p>これはソースセットレベルで設定できます。</p>
        <p>デフォルト: <code>false</code></p>
    </def>
    <def title="documentedVisibilities">
        <p>生成されるドキュメントにDokkaが含める可視性修飾子を定義します。</p>
        <p>
            このパッケージ内の <code>protected</code>、<code>internal</code>、<code>private</code> の宣言をドキュメント化したい場合や、<code>public</code> 宣言を除外して内部APIのみをドキュメント化したい場合に使用します。
        </p>
        <p>
            さらに、Dokkaの 
            <a href="https://github.com/Kotlin/dokka/blob/v2.0.0/dokka-runners/dokka-gradle-plugin/src/main/kotlin/engine/parameters/HasConfigurableVisibilityModifiers.kt#L14-L16"><code>documentedVisibilities()</code> 関数</a> 
            を使用して、ドキュメント対象の可視性を追加することもできます。
        </p>
        <p>これはソースセットレベルで設定できます。</p>
        <p>デフォルト: <code>VisibilityModifier.Public</code></p>
    </def>
</deflist>

### 外部ドキュメントリンク設定 {id="external-documentation-links-configuration"}

`externalDocumentationLinks {}`
ブロックを使用すると、依存関係の外部ホストされているドキュメントへのリンクを作成できます。

たとえば、`kotlinx.serialization` の型を使用している場合、デフォルトでは未解決であるかのようにドキュメント内でクリックできません。しかし、`kotlinx.serialization` のAPIリファレンスドキュメントはDokkaによって構築され、[kotlinlang.orgで公開](https://kotlinlang.org/api/kotlinx.serialization/)されているため、それに対する外部ドキュメントリンクを設定できます。これにより、Dokkaはそのライブラリの型に対するリンクを生成し、正常に解決されてクリック可能になります。

デフォルトでは、Kotlin標準ライブラリ、JDK、Android SDK、およびAndroidXの外部ドキュメントリンクが設定されています。

各リンクを定義するには、`register()` メソッドを使用して外部ドキュメントリンクを登録します。
`externalDocumentationLinks` APIは、Gradle DSLの規則に合わせてこのメソッドを使用します。

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
dokka {
    dokkaSourceSets.configureEach {
        externalDocumentationLinks.register("example-docs") {
            url("https://example.com/docs/")
            packageListUrl("https://example.com/docs/package-list")
        }
    }
}
```

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

```groovy
dokka {
    dokkaSourceSets.configureEach {
        externalDocumentationLinks.register("example-docs") {
            url.set(new URI("https://example.com/docs/"))
            packageListUrl.set(new URI("https://example.com/docs/package-list"))
        }
    }
}
```

</tab>
</tabs>

<deflist collapsible="true">
    <def title="url">
        <p>リンク先となるドキュメントのルートURL。末尾にスラッシュを含める<b>必要があります</b>。</p>
        <p>
            Dokkaは、指定されたURLの <code>package-list</code> を自動的に見つけて宣言同士をリンクしようと試みます。
        </p>
        <p>
            自動解決に失敗した場合や、代わりにローカルにキャッシュされたファイルを使用したい場合は、<code>packageListUrl</code> オプションの設定を検討してください。
        </p>
    </def>
    <def title="packageListUrl">
        <p>
            <code>package-list</code> の正確な場所。これはDokkaによる自動解決に依存する代替手段です。
        </p>
        <p>
            パッケージリストには、サブプロジェクト名やパッケージ名など、ドキュメントおよびプロジェクト自体に関する情報が含まれています。
        </p>
        <p>ネットワーク呼び出しを回避するために、ローカルにキャッシュされたファイルにすることもできます。</p>
    </def>
</deflist>

### 完全な設定 {id="complete-configuration"}

以下は、可能なすべての設定オプションを同時に適用した例です。

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
import org.jetbrains.dokka.gradle.engine.parameters.VisibilityModifier

plugins {
    id("org.jetbrains.dokka") version "%dokkaVersion%"
}

dokka {
    dokkaPublications.html {
        moduleName.set(project.name)
        moduleVersion.set(project.version.toString())
        outputDirectory.set(layout.buildDirectory.dir("dokka/html"))
        failOnWarning.set(false)
        suppressInheritedMembers.set(false)
        suppressObviousFunctions.set(true)
        offlineMode.set(false)
        includes.from("packages.md", "extra.md")
   }

    dokkaSourceSets {
        // 例: 'linux' ソースセット専用の設定
        named("linux") {
            dependentSourceSets{named("native")}
            sourceRoots.from(file("linux/src"))
        }

        configureEach {
            suppress.set(false)
            displayName.set(name)
            documentedVisibilities.set(setOf(VisibilityModifier.Public)) // または documentedVisibilities(VisibilityModifier.Public)
            reportUndocumented.set(false)
            skipEmptyPackages.set(true)
            skipDeprecated.set(false)
            suppressGeneratedFiles.set(true)
            jdkVersion.set(8)
            languageVersion.set("1.7")
            apiVersion.set("1.7")
            sourceRoots.from(file("src"))
            classpath.from(file("libs/dependency.jar"))
            samples.from("samples/Basic.kt", "samples/Advanced.kt")

            sourceLink {
                localDirectory.set(file("src/main/kotlin"))
                remoteUrl("https://example.com/src")
                remoteLineSuffix.set("#L")
            }

            externalDocumentationLinks {
                url = URL("https://example.com/docs/")
                packageListUrl = File("/path/to/package-list").toURI().toURL()
            }

            perPackageOption {
                matchingRegex.set(".*api.*")
                suppress.set(false)
                skipDeprecated.set(false)
                reportUndocumented.set(false)
                documentedVisibilities.set(
                    setOf(
                        VisibilityModifier.Public,
                        VisibilityModifier.Private,
                        VisibilityModifier.Protected,
                        VisibilityModifier.Internal,
                        VisibilityModifier.Package
                    )
                )
            }
        }
    }
}
```

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

```groovy
import org.jetbrains.dokka.gradle.engine.parameters.VisibilityModifier

plugins {
    id 'org.jetbrains.dokka' version '%dokkaVersion%'
}

dokka {
    dokkaPublications {
        html {
            moduleName.set(project.name)
            moduleVersion.set(project.version.toString())
            outputDirectory.set(layout.buildDirectory.dir("dokka/html"))
            failOnWarning.set(false)
            suppressInheritedMembers.set(false)
            suppressObviousFunctions.set(true)
            offlineMode.set(false)
            includes.from("packages.md", "extra.md")
        }
    }

    dokkaSourceSets {
        // 例: 'linux' ソースセット専用の設定
        named("linux") {
            dependentSourceSets { named("native") }
            sourceRoots.from(file("linux/src"))
        }

        configureEach {
            suppress.set(false)
            displayName.set(name)
            documentedVisibilities.set([VisibilityModifier.Public] as Set)
            reportUndocumented.set(false)
            skipEmptyPackages.set(true)
            skipDeprecated.set(false)
            suppressGeneratedFiles.set(true)
            jdkVersion.set(8)
            languageVersion.set("1.7")
            apiVersion.set("1.7")
            sourceRoots.from(file("src"))
            classpath.from(file("libs/dependency.jar"))
            samples.from("samples/Basic.kt", "samples/Advanced.kt")

            sourceLink {
                localDirectory.set(file("src/main/kotlin"))
                remoteUrl.set(new URI("https://example.com/src"))
                remoteLineSuffix.set("#L")
            }

            externalDocumentationLinks {
                url.set(new URI("https://example.com/docs/"))
                packageListUrl.set(new File("/path/to/package-list").toURI().toURL())
            }

            perPackageOption {
                matchingRegex.set(".*api.*")
                suppress.set(false)
                skipDeprecated.set(false)
                reportUndocumented.set(false)
                documentedVisibilities.set([
                        VisibilityModifier.Public,
                        VisibilityModifier.Private,
                        VisibilityModifier.Protected,
                        VisibilityModifier.Internal,
                        VisibilityModifier.Package
                ] as Set)
            }
        }
    }
}
```

</tab>
</tabs>