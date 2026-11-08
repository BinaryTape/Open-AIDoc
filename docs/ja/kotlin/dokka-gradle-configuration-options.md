[//]: # (title: Dokka Gradle の設定オプション)

Dokka には、あなた自身および読者のエクスペリエンスをカスタマイズするための多くの設定オプションが用意されています。

以下では、各設定セクションの詳細な説明といくつかの例を示します。
また、[すべての設定オプションを適用した例](#complete-configuration)も確認できます。

シングルプロジェクトおよびマルチプロジェクトのビルドに設定ブロックを適用する方法の詳細については、[設定例](dokka-gradle.md#configuration-examples)を参照してください。

### 一般設定 (General configuration) {id="general-configuration"}

以下は、一般的な Dokka Gradle プラグイン設定の例です：

* トップレベルの `dokka {}` DSL 設定を使用します。
* DGP では、`dokkaPublications{}` ブロックで Dokka パブリケーション設定を宣言します。
* デフォルトのパブリケーションは [`html`](dokka-html.md) および [`javadoc`](dokka-javadoc.md) です。
* Gradle の Kotlin DSL では型安全なアクセサ（type-safe accessors）が使用されるため、`build.gradle.kts` ファイルの構文は通常の `.kt` ファイル（Kotlin カスタムプラグインに使用されるファイルなど）とは異なります。

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
        // Standard output directory for HTML documentation
        outputDirectory.set(layout.buildDirectory.dir("dokka/html"))
        failOnWarning.set(false)
        suppressInheritedMembers.set(false)
        suppressObviousFunctions.set(true)
        offlineMode.set(false)
        includes.from("packages.md", "extra.md")
        
        // Output directory for additional files
        // Use this block instead of the standard when you 
        // want to change the output directory and include extra files
        outputDirectory.set(rootDir.resolve("docs/api/0.x"))
        
        // Use fileTree to add multiple files
        includes.from(
            fileTree("docs") {
                include("**/*.md")
            }
        )
    }
}
```

ファイルの操作に関する詳細については、[Gradle のドキュメント](https://docs.gradle.org/current/userguide/working_with_files.html#sec:file_trees)を参照してください。

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
                // Standard output directory for HTML documentation
                publication.outputDirectory.set(project.layout.buildDirectory.dir("dokka/html"))
                publication.failOnWarning.set(true)
                publication.suppressInheritedMembers.set(true)
                publication.offlineMode.set(false)
                publication.suppressObviousFunctions.set(true)
                publication.includes.from("packages.md", "extra.md")

                // Output directory for additional files
                // Use this instead of the standard block when you 
                // want to change the output directory and include extra files
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
            // Sets general module information
            moduleName.set(project.name)
            moduleVersion.set(project.version.toString())

            // Standard output directory for HTML documentation
            outputDirectory.set(layout.buildDirectory.dir("dokka/html"))

            // Core Dokka options
            failOnWarning.set(false)
            suppressInheritedMembers.set(false)
            suppressObviousFunctions.set(true)
            offlineMode.set(false)
            includes.from(files("packages.md", "extra.md"))

            // Output directory for additional files
            // Use this block instead of the standard when you want to 
            // change the output directory and include extra files
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
           プロジェクトドキュメントの表示名です。目次、ナビゲーション、ヘッダー、ログメッセージに表示されます。マルチプロジェクトビルドでは、集約されたドキュメント内で各サブプロジェクトの <code>moduleName</code> がセクションタイトルとして使用されます。
        </p>
        <p>デフォルト：Gradle プロジェクト名</p>
    </def>
    <def title="moduleVersion">
        <p>
            生成されたドキュメントに表示されるサブプロジェクトのバージョンです。
            シングルプロジェクトビルドでは、プロジェクトのバージョンとして使用されます。
            マルチプロジェクトビルドでは、ドキュメントを集約する際に各サブプロジェクトの <code>moduleVersion</code> が使用されます。
        </p>
        <p>デフォルト：Gradle プロジェクトのバージョン</p>
    </def>
    <def title="outputDirectory">
        <p>生成されたドキュメントが保存されるディレクトリです。</p>
        <p>この設定は、<code>dokkaGenerate</code> タスクによって生成されるすべてのドキュメントフォーマット（HTML、Javadoc など）に適用されます。</p>
        <p>デフォルト：<code>build/dokka/html</code></p>
        <p><b>追加ファイル用の出力ディレクトリ</b></p>
        <p>シングルプロジェクトビルドとマルチプロジェクトビルドの両方で、出力ディレクトリを指定し、追加ファイルを含めることができます。
           マルチプロジェクトビルドの場合は、ルートプロジェクトの設定で出力ディレクトリを設定し、追加ファイルを含めてください。
        </p>
    </def>
    <def title="failOnWarning">
        <p>
            ドキュメント生成中に警告が発生した場合に、Dokka がビルドを失敗させるかどうかを決定します。
            処理は、まずすべてのエラーと警告が出力されるまで待機します。
        </p>
        <p>この設定は <code>reportUndocumented</code> と併用すると効果的です。</p>
        <p>デフォルト：<code>false</code></p>
    </def>
    <def title="suppressInheritedMembers">
        <p>特定のクラスで明示的にオーバーライドされていない継承メンバーを除外（抑制）するかどうかを設定します。</p>
        <p>
            注意：
            これにより <code>equals</code>、<code>hashCode</code>、<code>toString</code> などの関数は除外されますが、<code>dataClass.componentN</code> や <code>dataClass.copy</code> などの合成関数（synthetic functions）は除外されません。
            これらを除外するには <code>suppressObviousFunctions</code> を使用してください。
        </p>
        <p>デフォルト：<code>false</code></p>
    </def>
    <def title="suppressObviousFunctions">
        <p>自明な関数（obvious functions）を除外（抑制）するかどうかを設定します。</p>
        <p>
            以下のいずれかに該当する場合、自明な関数とみなされます：</p>
            <list>
                <li>
                    <code>kotlin.Any</code>、<code>Kotlin.Enum</code>、<code>java.lang.Object</code>、または <code>java.lang.Enum</code> から継承されたもの（例：<code>equals</code>、<code>hashCode</code>、<code>toString</code>）。
                </li>
                <li>
                    合成されたもの（コンパイラによって生成されたもの）で、ドキュメントが存在しないもの（例：<code>dataClass.componentN</code>、<code>dataClass.copy</code>）。
                </li>
            </list>
        <p>デフォルト：<code>true</code></p>
    </def>
    <def title="offlineMode">
        <p>ネットワーク経由でリモートファイルやリンクを解決するかどうかを設定します。</p>
        <p>
            これには、外部ドキュメントへのリンク生成に使用される package-list が含まれます。
            たとえば、これによりドキュメント内で標準ライブラリのクラスをクリック可能にすることができます。
        </p>
        <p>
            これを <code>true</code> に設定すると、場合によってはビルド時間を大幅に短縮できますが、標準ライブラリを含む依存関係からのクラスやメンバーのリンクが解決されなくなるなど、ユーザーエクスペリエンスが低下する可能性もあります。
        </p>
        <p>注意：取得したファイルをローカルにキャッシュし、ローカルパスとして Dokka に指定することもできます。<code>&lt;a href="#external-documentation-links-configuration"&gt;externalDocumentationLinks&lt;/a&gt;</code> セクションを参照してください。</p>
        <p>デフォルト：<code>false</code></p>
    </def>
     <def title="includes">
        <p>
            <a href="dokka-module-and-package-docs.md">サブプロジェクトおよびパッケージのドキュメント</a>を含む Markdown ファイルのリストです。Markdown ファイルは<a href="dokka-module-and-package-docs.md#file-format">必要な形式</a>に一致している必要があります。
        </p>
        <p>指定されたファイルの内容は解析され、サブプロジェクトやパッケージの説明としてドキュメントに埋め込まれます。</p>
        <p>
            どのような形式でどのように使用するかの例については、<a href="https://github.com/Kotlin/dokka/blob/master/examples/gradle-v2/basic-gradle-example/build.gradle.kts">Dokka Gradle の例</a>を参照してください。
        </p>
    </def>
</deflist>

### ソースセット設定 (Source set configuration) {id="source-set-configuration"}

Dokka では、[Kotlin ソースセット](https://kotlinlang.org/docs/multiplatform-discover-project.html#source-sets)に対していくつかのオプションを設定できます：

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
import org.jetbrains.dokka.gradle.engine.parameters.VisibilityModifier

dokka {
    // ..
    // General configuration section
    // ..

    // Source sets configuration
    dokkaSourceSets {
        // Example: Configuration exclusive to the 'linux' source set
        named("linux") {
            dependentSourceSets{named("native")}
            sourceRoots.from(file("linux/src"))
        }

        configureEach {
            suppress.set(false)
            displayName.set(name)
            documentedVisibilities.set(setOf(VisibilityModifier.Public)) // OR documentedVisibilities(VisibilityModifier.Public)
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
                // Source link section
            }
            perPackageOption {
                // Package options section
            }
            externalDocumentationLinks {
                // External documentation links section
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
    // General configuration section
    // ..

    dokkaSourceSets {
        // Example: Configuration exclusive to the 'linux' source set
        named("linux") {
            dependentSourceSets { named("native") }
            sourceRoots.from(file("linux/src"))
        }

        configureEach {
            suppress.set(false)
            displayName.set(name)
            documentedVisibilities.set([VisibilityModifier.Public] as Set) // OR documentedVisibilities(VisibilityModifier.Public)
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
                // Source link section
            }
            perPackageOption {
                // Package options section
            }
            externalDocumentationLinks {
                // External documentation links section
            }
        }
    }
}
```

</tab>
</tabs>

<deflist collapsible="true">
    <def title="suppress">
        <p>ドキュメント生成時にこのソースセットをスキップするかどうかを設定します。</p>
        <p>デフォルト：<code>false</code></p>
    </def>
    <def title="displayName">
        <p>このソースセットを参照するために使用される表示名です。</p>
        <p>
            この名前は、外部向け（ドキュメントの読者に表示されるソースセット名など）と内部向け（<code>reportUndocumented</code> のログメッセージなど）の両方で使用されます。
        </p>
        <p>デフォルトでは、Kotlin Gradle プラグインから提供される情報に基づいて推測されます。</p>
    </def>
    <def title="documentedVisibilities">
        <p>生成されるドキュメントに Dokka が含めるべき可視性修飾子（visibility modifiers）を定義します。</p>
        <p>
            <code>protected</code>、<code>internal</code>、<code>private</code> の宣言をドキュメント化したい場合や、<code>public</code> の宣言を除外して内部 API のみをドキュメント化したい場合に使用します。
        </p>
        <p>
            さらに、Dokka の <a href="https://github.com/Kotlin/dokka/blob/v2.3.0/dokka-runners/dokka-gradle-plugin/src/main/kotlin/engine/parameters/HasConfigurableVisibilityModifiers.kt"><code>documentedVisibilities()</code> 関数</a>を使用して、ドキュメント化する可視性を追加することもできます。
        </p>
        <p>これは個々のパッケージごとに設定できます。</p>
        <p>デフォルト：<code>VisibilityModifier.Public</code></p>
    </def>
    <def title="reportUndocumented">
        <p>
            可視状態にあるドキュメント化されていない宣言（<code>documentedVisibilities</code> やその他のフィルタによってフィルタリングされた後、KDoc を持たない宣言）について警告を出力するかどうかを設定します。
        </p>
        <p>この設定は <code>failOnWarning</code> と併用すると効果的です。</p>
        <p>これは個々のパッケージごとに設定できます。</p>
        <p>デフォルト：<code>false</code></p>
    </def>
    <def title="skipEmptyPackages">
        <p>
            各種フィルタが適用された後に、可視状態の宣言が含まれていないパッケージをスキップするかどうかを設定します。
        </p>
        <p>
            たとえば、<code>skipDeprecated</code> が <code>true</code> に設定されており、パッケージに非推奨の宣言しか含まれていない場合、そのパッケージは空であるとみなされます。
        </p>
        <p>デフォルト：<code>true</code></p>
    </def>
    <def title="skipDeprecated">
        <p><code>@Deprecated</code> でアノテーションが付けられた宣言をドキュメント化するかどうかを設定します。</p>
        <p>これは個々のパッケージごとに設定できます。</p>
        <p>デフォルト：<code>false</code></p>
    </def>
    <def title="suppressGeneratedFiles">
        <p>生成されたファイルをドキュメント化するかどうかを設定します。</p>
        <p>
            生成されたファイルは、<code>{project}/{buildDir}/generated</code> ディレクトリ配下に存在することが想定されています。
        </p>
        <p>
            <code>true</code> に設定すると、そのディレクトリ内のすべてのファイルが事実上 <code>suppressedFiles</code> オプションに追加されるため、手動で設定することも可能です。
        </p>
        <p>デフォルト：<code>true</code></p>
    </def>
    <def title="suppressAnnotatedWith">
        <p>ドキュメントから除外する宣言に付けられたアノテーションの完全修飾名（FQN）のセットです。</p>
        <p>
            これらのアノテーションのいずれかが付与されている宣言は、生成されるドキュメントから除外されます。
        </p>
    </def>
    <def title="jdkVersion">
        <p>Java の型に対する外部ドキュメントリンクを生成する際に使用する JDK バージョンです。</p>
        <p>
            たとえば、公開宣言のシグネチャで <code>java.util.UUID</code> を使用しており、このオプションが <code>8</code> に設定されている場合、Dokka はそれに対して <a href="https://docs.oracle.com/javase/8/docs/api/java/util/UUID.html">JDK 8 Javadoc</a> への外部ドキュメントリンクを生成します。
        </p>
        <p>デフォルト：`8`</p>
    </def>
    <def title="languageVersion">
        <p>
            解析環境および <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a> 環境の設定に使用される <a href="https://kotlinlang.org/docs/compatibility-modes.html">Kotlin 言語バージョン</a>です。
        </p>
        <p>デフォルトでは、Dokka の組み込みコンパイラで利用可能な最新の言語バージョンが使用されます。</p>
    </def>
    <def title="apiVersion">
        <p>
            解析環境および <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a> 環境の設定に使用される <a href="https://kotlinlang.org/docs/compatibility-modes.html">Kotlin API バージョン</a>です。
        </p>
        <p>デフォルトでは、<code>languageVersion</code> から推測されます。</p>
    </def>
    <def title="sourceRoots">
        <p>
            解析およびドキュメント化の対象となるソースコードのルートです。
            ディレクトリ、および個別の <code>.kt</code> ファイルと <code>.java</code> ファイルを指定できます。
        </p>
        <p>デフォルトでは、Kotlin Gradle プラグインから提供される情報に基づいてソースルートが推測されます。</p>
    </def>
    <def title="classpath">
        <p>解析および対話型サンプルのためのクラスパスです。</p>
        <p>これは、依存関係から取得される一部の型が自動的に解決されない、または認識されない場合に役立ちます。</p>
        <p>このオプションは、<code>.jar</code> ファイルと <code>.klib</code> ファイルの両方を受け入れます。</p>
        <p>デフォルトでは、Kotlin Gradle プラグインから提供される情報に基づいてクラスパスが推測されます。</p>
    </def>
    <def title="samples">
        <p>
            <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a> KDoc タグを介して参照されるサンプル関数を含むディレクトリまたはファイルのリストです。
        </p>
    </def>
</deflist>

### ソースリンク設定 (Source link configuration) {id="source-link-configuration"}

読者がリモートリポジトリ内で各宣言のソースコードを見つけられるように、ソースリンクを設定します。
この設定には `dokkaSourceSets.main {}` ブロックを使用します。

`sourceLinks {}` 設定ブロックを使用すると、各シグネチャに特定の行番号が付いた `remoteUrl` への `source` リンクを追加できます。
行番号は `remoteLineSuffix` を設定することでカスタマイズ可能です。

例として、`kotlinx.coroutines` 内の [`count()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/count.html) 関数のドキュメントを参照してください。

Gradle の Kotlin DSL では型安全なアクセサが使用されるため、`build.gradle.kts` ファイルの構文は通常の `.kt` ファイル（カスタム Gradle プラグインに使用されるファイルなど）とは異なります：

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
            ローカルのソースディレクトリへのパスです。パスは現在のプロジェクトのルートからの相対パスである必要があります。
        </p>
    </def>
    <def title="remoteUrl">
        <p>
            ドキュメントの読者がアクセスできるソースコードホスティングサービス（GitHub、GitLab、Bitbucket、またはソースファイルの安定した URL を提供する任意のホスティングサービスなど）の URL です。この URL は、宣言のソースコードリンクを生成するために使用されます。
        </p>
    </def>
    <def title="remoteLineSuffix">
        <p>
            URL にソースコードの行番号を追加するために使用されるサフィックスです。これにより、読者はファイルだけでなく、宣言の特定の行番号へ直接移動できるようになります。
        </p>
        <p>
            番号自体は、指定されたサフィックスの後に追加されます。たとえば、このオプションが <code>#L</code> に設定されており、行番号が 10 の場合、生成される URL サフィックスは <code>#L10</code> になります。
        </p>
        <p>
            主要なサービスで使用されているサフィックス：</p>
            <list>
                <li>GitHub：<code>#L</code></li>
                <li>GitLab：<code>#L</code></li>
                <li>Bitbucket：<code>#lines-</code></li>
            </list>
        <p>デフォルト：<code>#L</code></p>
    </def>
</deflist>

### パッケージオプション (Package options) {id="package-options"}

`perPackageOption` 設定ブロックを使用すると、`matchingRegex` に一致する特定のパッケージに対してオプションを設定できます：

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
                documentedVisibilities.set(setOf(VisibilityModifier.Public)) // OR documentedVisibilities(VisibilityModifier.Public)
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
        <p>パッケージの一致判定に使用される正規表現です。</p>
        <p>デフォルト：<code>.&#42;</code></p>
    </def>
    <def title="suppress">
        <p>ドキュメント生成時にこのパッケージをスキップするかどうかを設定します。</p>
        <p>デフォルト：<code>false</code></p>
    </def>
    <def title="skipDeprecated">
        <p><code>@Deprecated</code> でアノテーションが付けられた宣言をドキュメント化するかどうかを設定します。</p>
        <p>これはソースセットレベルで設定できます。</p>
        <p>デフォルト：<code>false</code></p>
    </def>
    <def title="reportUndocumented">
        <p>
            可視状態にあるドキュメント化されていない宣言（<code>documentedVisibilities</code> やその他のフィルタによってフィルタリングされた後、KDoc を持たない宣言）について警告を出力するかどうかを設定します。
        </p>
        <p>この設定は <code>failOnWarning</code> と併用すると効果的です。</p>
        <p>これはソースセットレベルで設定できます。</p>
        <p>デフォルト：<code>false</code></p>
    </def>
    <def title="documentedVisibilities">
        <p>生成されるドキュメントに Dokka が含めるべき可視性修飾子を定義します。</p>
        <p>
            このパッケージ内の <code>protected</code>、<code>internal</code>、<code>private</code> の宣言をドキュメント化したい場合や、<code>public</code> の宣言を除外して内部 API のみをドキュメント化したい場合に使用します。
        </p>
        <p>
            さらに、Dokka の <a href="https://github.com/Kotlin/dokka/blob/v2.0.0/dokka-runners/dokka-gradle-plugin/src/main/kotlin/engine/parameters/HasConfigurableVisibilityModifiers.kt#L14-L16"><code>documentedVisibilities()</code> 関数</a>を使用して、ドキュメント化する可視性を追加することもできます。
        </p>
        <p>これはソースセットレベルで設定できます。</p>
        <p>デフォルト：<code>VisibilityModifier.Public</code></p>
    </def>
</deflist>

### 外部ドキュメントリンク設定 (External documentation links configuration) {id="external-documentation-links-configuration"}

`externalDocumentationLinks {}` ブロックを使用すると、依存関係の外部でホストされているドキュメントへのリンクを作成できます。

たとえば、`kotlinx.serialization` の型を使用している場合、デフォルトではドキュメント内でクリックできず、未解決であるかのように扱われます。しかし、`kotlinx.serialization` の API リファレンスドキュメントは Dokka によってビルドされ、[kotlinlang.org で公開](https://kotlinlang.org/api/kotlinx.serialization/)されているため、それに対する外部ドキュメントリンクを設定できます。これにより、Dokka はそのライブラリの型に対するリンクを生成し、正常に解決されてクリック可能になります。

デフォルトでは、Kotlin 標準ライブラリ、JDK、Android SDK、および AndroidX への外部ドキュメントリンクが設定されています。

各リンクを定義するには、`register()` メソッドを使用して外部ドキュメントリンクを登録します。
`externalDocumentationLinks` API は、Gradle DSL の慣例に沿ってこのメソッドを使用します：

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
        <p>リンク先ドキュメントのルート URL です。末尾にはスラッシュが<b>必須</b>です。</p>
        <p>
            Dokka は指定された URL に対して <code>package-list</code> を自動的に検索し、宣言同士をリンクしようと試みます。
        </p>
        <p>
            自動解決が失敗する場合や、代わりにローカルにキャッシュされたファイルを使用したい場合は、<code>packageListUrl</code> オプションの設定を検討してください。
        </p>
    </def>
    <def title="packageListUrl">
        <p>
            <code>package-list</code> の正確な場所です。これは、Dokka による自動解決に依存する代わりの方法です。
        </p>
        <p>
            パッケージリストには、サブプロジェクト名やパッケージ名など、ドキュメントおよびプロジェクト自体に関する情報が含まれています。
        </p>
        <p>ネットワーク呼び出しを回避するために、ローカルにキャッシュされたファイルを指定することもできます。</p>
    </def>
</deflist>

### 完全な設定例 (Complete configuration) {id="complete-configuration"}

以下は、設定可能なすべてのオプションを同時に適用した例です：

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
        // Example: Configuration exclusive to the 'linux' source set
        named("linux") {
            dependentSourceSets{named("native")}
            sourceRoots.from(file("linux/src"))
        }

        configureEach {
            suppress.set(false)
            displayName.set(name)
            documentedVisibilities.set(setOf(VisibilityModifier.Public)) // OR documentedVisibilities(VisibilityModifier.Public)
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
        // Example: Configuration exclusive to the 'linux' source set
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