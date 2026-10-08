[//]: # (title: CLI)

何らかの理由で [Gradle](dokka-gradle.md) や [Maven](dokka-maven.md) などのビルドツールを使用できない場合、Dokka にはドキュメント生成用のコマンドライン（CLI）ランナーが用意されています。

比較すると、Dokka の Gradle プラグインと同等、あるいはそれ以上の機能を備えています。ただし、特にマルチプラットフォームやマルチモジュールの環境では自動設定が行われないため、セットアップはかなり難しくなります。

## はじめに {id="get-started"}

CLI ランナーは、個別の実行可能アーティファクトとして Maven Central に公開されています。

[Maven Central](https://central.sonatype.com/artifact/org.jetbrains.dokka/dokka-cli) で見つけるか、[直接ダウンロード](https://repo1.maven.org/maven2/org/jetbrains/dokka/dokka-cli/%dokkaVersion%/dokka-cli-%dokkaVersion%.jar) することができます。

`dokka-cli-%dokkaVersion%.jar` ファイルをコンピュータに保存した状態で、`-help` オプションを付けて実行すると、利用可能なすべての設定オプションとその説明を確認できます。

```Bash
java -jar dokka-cli-%dokkaVersion%.jar -help
```

これは `-sourceSet` などの一部のネストされたオプションでも機能します。

```Bash
java -jar dokka-cli-%dokkaVersion%.jar -sourceSet -help
```

## ドキュメントの生成 {id="generate-documentation"}

### 前提条件 {id="prerequisites"}

依存関係を管理するビルドツールがないため、依存関係の `.jar` ファイルを自分で用意する必要があります。

以下は、どの出力形式でも必要となる依存関係のリストです。

| **グループ**             | **アーティファクト**                  | **バージョン**    | **リンク**                                                                                                                                                 |
|-----------------------|-------------------------------|----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| `org.jetbrains.dokka` | `dokka-base`                  | %dokkaVersion% | [download](https://repo1.maven.org/maven2/org/jetbrains/dokka/dokka-base/%dokkaVersion%/dokka-base-%dokkaVersion%.jar)                                   |
| `org.jetbrains.dokka` | `analysis-kotlin-symbols` | %dokkaVersion% | [download](https://repo1.maven.org/maven2/org/jetbrains/dokka/analysis-kotlin-symbols/%dokkaVersion%/analysis-kotlin-symbols-%dokkaVersion%.jar) |

以下は、[HTML](dokka-html.md) 出力形式で必要となる追加の依存関係です。

| **グループ**               | **アーティファクト**       | **バージョン** | **リンク**                                                                                                           |
|-------------------------|--------------------|-------------|--------------------------------------------------------------------------------------------------------------------|
| `org.jetbrains.kotlinx` | `kotlinx-html-jvm` | 0.8.0       | [download](https://repo1.maven.org/maven2/org/jetbrains/kotlinx/kotlinx-html-jvm/0.8.0/kotlinx-html-jvm-0.8.0.jar) |
| `org.freemarker`        | `freemarker`       | 2.3.31      | [download](https://repo1.maven.org/maven2/org/freemarker/freemarker/2.3.31/freemarker-2.3.31.jar)                  |

### コマンドラインオプションによる実行 {id="run-with-command-line-options"}

コマンドラインオプションを渡して CLI ランナーを設定できます。

最低限、以下のオプションを指定する必要があります。

* `-pluginsClasspath` - ダウンロードした依存関係への絶対パスまたは相対パスのリスト。セミコロン `;` で区切ります。
* `-sourceSet` - ドキュメントを生成するソースコードへの絶対パス。
* `-outputDir` - ドキュメント出力ディレクトリの絶対パスまたは相対パス。

```Bash
java -jar dokka-cli-%dokkaVersion%.jar \
     -pluginsClasspath "./dokka-base-%dokkaVersion%.jar;./analysis-kotlin-symbols-%dokkaVersion%.jar;./kotlinx-html-jvm-0.8.0.jar;./freemarker-2.3.31.jar" \
     -sourceSet "-src /home/myCoolProject/src/main/kotlin" \
     -outputDir "./dokka/html"
```

この例を実行すると、[HTML](dokka-html.md) 形式でドキュメントが生成されます。

設定の詳細については、[コマンドラインオプション](#コマンドラインオプション)を参照してください。

### JSON 設定による実行 {id="run-with-json-configuration"}

JSON を使用して CLI ランナーを設定することも可能です。この場合、最初で唯一の引数として JSON 設定ファイルへの絶対パスまたは相対パスを指定する必要があります。他のすべての設定オプションは、そのファイルから解析されます。

```Bash
java -jar dokka-cli-%dokkaVersion%.jar dokka-configuration.json
```

最低限、以下の JSON 設定ファイルが必要です。

```json
{
  "outputDir": "./dokka/html",
  "sourceSets": [
    {
      "sourceSetID": {
        "scopeId": "moduleName",
        "sourceSetName": "main"
      },
      "sourceRoots": [
        "/home/myCoolProject/src/main/kotlin"
      ]
    }
  ],
  "pluginsClasspath": [
    "./dokka-base-%dokkaVersion%.jar",
    "./kotlinx-html-jvm-0.8.0.jar",
    "./analysis-kotlin-symbols-%dokkaVersion%.jar",
    "./freemarker-2.3.31.jar"
  ]
}
```

詳細は [JSON 設定オプション](#json-設定)を参照してください。

### その他の出力形式 {id="other-output-formats"}

デフォルトでは、`dokka-base` アーティファクトには [HTML](dokka-html.md) 出力形式のみが含まれています。

他のすべての出力形式は [Dokka プラグイン](dokka-plugins.md)として実装されています。それらを使用するには、プラグインのクラスパス（plugins classpath）に含める必要があります。

例えば、実験的な [GFM](https://github.com/Kotlin/dokka/blob/8e5c63d035ef44a269b8c43430f43f5c8eebfb63/dokka-subprojects/plugin-gfm/README.md) 出力形式でドキュメントを生成したい場合は、gfm-plugin の JAR（[ダウンロード](https://repo1.maven.org/maven2/org/jetbrains/dokka/gfm-plugin/%dokkaVersion%/gfm-plugin-%dokkaVersion%.jar)）をダウンロードし、`pluginsClasspath` 設定オプションに渡す必要があります。

コマンドラインオプション経由：

```Shell
java -jar dokka-cli-%dokkaVersion%.jar \
     -pluginsClasspath "./dokka-base-%dokkaVersion%.jar;...;./gfm-plugin-%dokkaVersion%.jar" \
     ...
```

JSON 設定経由：

```json
{
  ...
  "pluginsClasspath": [
    "./dokka-base-%dokkaVersion%.jar",
    "...",
    "./gfm-plugin-%dokkaVersion%.jar"
  ],
  ...
}
```

`pluginsClasspath` に GFM プラグインを渡すと、CLI ランナーは GFM 出力形式でドキュメントを生成します。

詳細については、[GFM](https://github.com/Kotlin/dokka/blob/8e5c63d035ef44a269b8c43430f43f5c8eebfb63/dokka-subprojects/plugin-gfm/README.md) および [Javadoc](dokka-javadoc.md#generate-javadoc-documentation) のページを参照してください。

## コマンドラインオプション {id="command-line-options"}

可能なすべてのコマンドラインオプションのリストと詳細な説明を表示するには、以下を実行してください。

```Bash
java -jar dokka-cli-%dokkaVersion%.jar -help
```

簡潔なまとめ：

| オプション | 説明 |
|------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `moduleName` | プロジェクト/モジュールの名前。 |
| `moduleVersion` | ドキュメント化されるバージョン。 |
| `outputDir` | 出力ディレクトリのパス。デフォルトは `./dokka`。 |
| `sourceSet` | Dokka ソースセットの設定。ネストされた設定オプションを含みます。 |
| `pluginsConfiguration` | Dokka プラグインの設定。 |
| `pluginsClasspath` | Dokka プラグインとその依存関係を含む JAR のリスト。セミコロンで区切られた複数のパスを受け入れます。 |
| `offlineMode` | ネットワーク経由でリモートファイル/リンクを解決するかどうか。 |
| `failOnWarning` | Dokka が警告またはエラーを出力した場合にドキュメント生成を失敗させるかどうか。 |
| `delayTemplateSubstitution` | 一部の要素の置換を遅らせるかどうか。マルチモジュールプロジェクトのインクリメンタルビルドで使用されます。 |
| `noSuppressObviousFunctions` | `kotlin.Any` や `java.lang.Object` から継承されたものなど、明らかな関数（obvious functions）を抑制しないかどうか。 |
| `includes` | モジュールおよびパッケージのドキュメントを含む Markdown ファイル。セミコロンで区切られた複数の値を受け入れます。 |
| `suppressInheritedMembers` | 指定されたクラスで明示的にオーバーライドされていない継承メンバーを抑制するかどうか。 |
| `globalPackageOptions` | `"matchingRegex,-deprecated,-privateApi,+warnUndocumented,+suppress;+visibility:PUBLIC;..."` 形式のパッケージ設定オプションのグローバルリスト。セミコロンで区切られた複数の値を受け入れます。 |
| `globalLinks` | `{url}^{packageListUrl}` 形式のグローバルな外部ドキュメントリンク。`^^` で区切られた複数の値を受け入れます。 |
| `globalSrcLink` | ソースディレクトリとコード閲覧用 Web サービス間のグローバルなマッピング。セミコロンで区切られた複数のパスを受け入れます。 |
| `helpSourceSet` | ネストされた `-sourceSet` 設定のヘルプを表示します。 |
| `loggingLevel` | ロギングレベル。指定可能な値： `DEBUG, PROGRESS, INFO, WARN, ERROR`。 |
| `help, h` | 使用方法の情報を表示します。 |

#### ソースセットのオプション {id="source-set-options"}

ネストされた `-sourceSet` 設定のコマンドラインオプション一覧を表示するには、以下を実行してください。

```Bash
java -jar dokka-cli-%dokkaVersion%.jar -sourceSet -help
```

簡潔なまとめ：

| オプション | 説明 |
|------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `sourceSetName` | ソースセットの名前。 |
| `displayName` | 内部および外部の両方で使用されるソースセットの表示名。 |
| `classpath` | 解析およびインタラクティブなサンプルのためのクラスパス。セミコロンで区切られた複数のパスを受け入れます。 |
| `src` | 解析およびドキュメント化されるソースコードのルート。セミコロンで区切られた複数のパスを受け入れます。 |
| `dependentSourceSets` | `moduleName/sourceSetName` 形式の依存ソースセットの名前。セミコロンで区切られた複数の値を受け入れます。 |
| `samples` | サンプル関数を含むディレクトリまたはファイルのリスト。セミコロンで区切られた複数のパスを受け入れます。<anchor name="includes-cli"/> |
| `includes` | [モジュールおよびパッケージのドキュメント](dokka-module-and-package-docs.md)を含む Markdown ファイル。セミコロンで区切られた複数のパスを受け入れます。 |
| `documentedVisibilities` | ドキュメント化される可視性。セミコロンで区切られた複数の値を受け入れます。指定可能な値： `PUBLIC`, `PRIVATE`, `PROTECTED`, `INTERNAL`, `PACKAGE`。 |
| `reportUndocumented` | ドキュメント化されていない宣言を報告するかどうか。 | 
| `noSkipEmptyPackages` | 空のパッケージのページを作成するかどうか。 | 
| `skipDeprecated` | 非推奨（deprecated）の宣言をスキップするかどうか。 | 
| `jdkVersion` | JDK の Javadoc へのリンクに使用する JDK のバージョン。 |
| `languageVersion` | 解析とセットアップに使用される言語バージョン。 |
| `apiVersion` | 解析とセットアップに使用される Kotlin API バージョン。 |
| `noStdlibLink` | Kotlin 標準ライブラリへのリンクを生成するかどうか。 | 
| `noJdkLink` | JDK の Javadoc へのリンクを生成するかどうか。 | 
| `suppressedFiles` | 抑制するファイルへのパス。セミコロンで区切られた複数のパスを受け入れます。 |
| `suppressAnnotatedWith` | 指定されたアノテーションが付加された宣言を抑制するための、アノテーションの完全修飾名（FQN）。セミコロンで区切られた複数の値を受け入れます。 |
| `analysisPlatform` | 解析のセットアップに使用されるプラットフォーム。 |
| `perPackageOptions` | `matchingRegexp,-deprecated,-privateApi,+warnUndocumented,+suppress;...` 形式のパッケージソースセット設定のリスト。セミコロンで区切られた複数の値を受け入れます。 |
| `externalDocumentationLinks` | `{url}^{packageListUrl}` 形式の外部ドキュメントリンク。`^^` で区切られた複数の値を受け入れます。 |
| `srcLink` | ソースディレクトリとコード閲覧用 Web サービス間のマッピング。セミコロンで区切られた複数のパスを受け入れます。 |

## JSON 設定 {id="json-configuration"}

以下に、各設定セクションの例と詳細な説明を示します。ページの最後には、[すべての設定オプション](#完全な設定)を適用した例もあります。

### 一般設定 {id="general-configuration"}

```json
{
  "moduleName": "Dokka Example",
  "moduleVersion": null,
  "outputDir": "./build/dokka/html",
  "failOnWarning": false,
  "suppressObviousFunctions": true,
  "suppressInheritedMembers": false,
  "offlineMode": false,
  "includes": [
    "module.md"
  ],
  "sourceLinks":  [
    { "_comment": "オプションについては別セクションで説明します" }
  ],
  "perPackageOptions": [
    { "_comment": "オプションについては別セクションで説明します" }
  ],
  "externalDocumentationLinks":  [
    { "_comment": "オプションについては別セクションで説明します" }
  ],
  "sourceSets": [
    { "_comment": "オプションについては別セクションで説明します" }
  ],
  "pluginsClasspath": [
    "./dokka-base-%dokkaVersion%.jar",
    "./kotlinx-html-jvm-0.8.0.jar",
    "./analysis-kotlin-symbols-%dokkaVersion%.jar",
    "./freemarker-2.3.31.jar"
  ]
}
```

<deflist collapsible="true">
    <def title="moduleName">
        <p>モジュールを参照するために使用される表示名です。目次、ナビゲーション、ロギングなどで使用されます。</p>
        <p>デフォルト： <code>root</code></p>
    </def>
    <def title="moduleVersion">
        <p>モジュールのバージョンです。</p>
        <p>デフォルト： 空</p>
    </def>
    <def title="outputDirectory">
        <p>出力形式に関係なく、ドキュメントが生成されるディレクトリです。</p>
        <p>デフォルト： <code>./dokka</code></p>
    </def>
    <def title="failOnWarning">
        <p>
            Dokka が警告またはエラーを出力した場合にドキュメント生成を失敗させるかどうかを指定します。
            プロセスは、すべてのエラーと警告が出力されるまで待機してから終了します。
        </p>
        <p>この設定は <code>reportUndocumented</code> と組み合わせて使うと効果的です。</p>
        <p>デフォルト： <code>false</code></p>
    </def>
    <def title="suppressObviousFunctions">
        <p>明らかな関数（obvious functions）を抑制するかどうかを指定します。</p>
            関数が以下の場合、明らかな関数と見なされます：
            <list>
                <li>
                    <code>kotlin.Any</code>, <code>Kotlin.Enum</code>, <code>java.lang.Object</code> または
                    <code>java.lang.Enum</code> から継承されたもの（<code>equals</code>, <code>hashCode</code>, <code>toString</code> など）。
                </li>
                <li>
                    合成されたもの（コンパイラによって生成されたもの）で、ドキュメントがないもの（<code>dataClass.componentN</code> や <code>dataClass.copy</code> など）。
                </li>
            </list>
        <p>デフォルト： <code>true</code></p>
    </def>
    <def title="suppressInheritedMembers">
        <p>指定されたクラスで明示的にオーバーライドされていない継承メンバーを抑制するかどうかを指定します。</p>
        <p>
            注意： これにより <code>equals</code> / <code>hashCode</code> / <code>toString</code> などの関数は抑制できますが、
            <code>dataClass.componentN</code> や <code>dataClass.copy</code> などの合成関数は抑制できません。
            それらには <code>suppressObviousFunctions</code> を使用してください。
        </p>
        <p>デフォルト： <code>false</code></p>
    </def>
    <def title="offlineMode">
        <anchor name="includes-json"/>
        <p>ネットワーク経由でリモートファイル/リンクを解決するかどうかを指定します。</p>
        <p>
            これには、外部ドキュメントリンクの生成に使用される package-lists が含まれます。
            例えば、標準ライブラリのクラスをクリック可能にするために使用されます。
        </p>
        <p>
            これを <code>true</code> に設定すると、場合によってはビルド時間を大幅に短縮できますが、
            ドキュメントの品質やユーザーエクスペリエンスが低下する可能性もあります。例えば、標準ライブラリを含む依存関係からのクラス/メンバーのリンクが解決されなくなります。
        </p>
        <p>
            注意： 取得したファイルをローカルにキャッシュし、ローカルパスとして Dokka に提供することもできます。 
            <code>externalDocumentationLinks</code> セクションを参照してください。
        </p>
        <p>デフォルト： <code>false</code></p>
    </def>
    <def title="includes">
        <p>
            <a href="dokka-module-and-package-docs.md">モジュールおよびパッケージのドキュメント</a>を含む Markdown ファイルのリストです。
        </p>
        <p>指定されたファイルの内容が解析され、モジュールおよびパッケージの説明としてドキュメントに埋め込まれます。</p>
        <p>これはパッケージ単位で設定することも可能です。</p>
    </def>
    <def title="sourceSets">
        <p>
          Kotlin <a href="https://kotlinlang.org/docs/multiplatform-discover-project.html#source-sets">ソースセット</a>の個別および追加設定です。
        </p>
        <p>指定可能なオプションのリストについては、<a href="#ソースセットの設定">ソースセットの設定</a>を参照してください。</p>
    </def>
    <def title="sourceLinks">
        <p>すべてのソースセットに適用されるソースリンクのグローバル設定です。</p>
        <p>指定可能なオプションのリストについては、<a href="#ソースリンクの設定">ソースリンクの設定</a>を参照してください。</p>
    </def>
    <def title="perPackageOptions">
        <p>ソースセットに関係なく、一致するパッケージに適用されるグローバル設定です。</p>
        <p>指定可能なオプションのリストについては、<a href="#パッケージごとの設定">パッケージごとの設定</a>を参照してください。</p>
    </def>
    <def title="externalDocumentationLinks">
        <p>ソースセットに関係なく、使用される外部ドキュメントリンクのグローバル設定です。</p>
        <p>指定可能なオプションのリストについては、<a href="#外部ドキュメントリンクの設定">外部ドキュメントリンクの設定</a>を参照してください。</p>
    </def>
    <def title="pluginsClasspath">
        <p>Dokka プラグインとその依存関係を含む JAR ファイルのリストです。</p>
    </def>
</deflist>

### ソースセットの設定 {id="source-set-configuration"}

Kotlin [ソースセット](https://kotlinlang.org/docs/multiplatform-discover-project.html#source-sets)の設定方法：

```json
{
  "sourceSets": [
    {
      "displayName": "jvm",
      "sourceSetID": {
        "scopeId": "moduleName",
        "sourceSetName": "main"
      },
      "dependentSourceSets": [
        {
          "scopeId": "dependentSourceSetScopeId",
          "sourceSetName": "dependentSourceSetName"
        }
      ],
      "documentedVisibilities": ["PUBLIC", "PRIVATE", "PROTECTED", "INTERNAL", "PACKAGE"],
      "reportUndocumented": false,
      "skipEmptyPackages": true,
      "skipDeprecated": false,
      "jdkVersion": 8,
      "languageVersion": "1.7",
      "apiVersion": "1.7",
      "noStdlibLink": false,
      "noJdkLink": false,
      "includes": [
        "module.md"
      ],
      "analysisPlatform": "jvm",
      "sourceRoots": [
        "/home/ignat/IdeaProjects/dokka-debug-mvn/src/main/kotlin"
      ],
      "classpath": [
        "libs/kotlin-stdlib-%kotlinVersion%.jar",
        "libs/kotlin-stdlib-common-%kotlinVersion%.jar"
      ],
      "samples": [
        "samples/basic.kt"
      ],
      "suppressedFiles": [
        "src/main/kotlin/org/jetbrains/dokka/Suppressed.kt"
      ],
      "sourceLinks":  [
        { "_comment": "オプションについては別セクションで説明します" }
      ],
      "perPackageOptions": [
        { "_comment": "オプションについては別セクションで説明します" }
      ],
      "externalDocumentationLinks":  [
        { "_comment": "オプションについては別セクションで説明します" }
      ]
    }
  ]
}
```

<deflist collapsible="true">
    <def title="displayName">
        <p>このソースセットを参照するために使用される表示名です。</p>
        <p>
            この名前は、外部（ドキュメントの読者にソースセット名が表示されるなど）と内部（<code>reportUndocumented</code> のログメッセージなど）の両方で使用されます。
        </p>
        <p>より適切な代替案がない場合は、プラットフォーム名を使用できます。</p>
    </def>
    <def title="sourceSetID">
        <p>ソースセットの技術的な ID です。</p>
    </def>
    <def title="documentedVisibilities">
        <p>ドキュメント化すべき可視性修飾子のセットです。</p>
        <p>
            これは、<code>protected</code>/<code>internal</code>/<code>private</code> 宣言をドキュメント化したい場合や、
            <code>public</code> 宣言を除外して内部 API のみをドキュメント化したい場合に使用できます。
        </p>
        <p>これはパッケージ単位で設定することも可能です。</p>
        <p>
            指定可能な値：</p>
            <list>
                <li><code>PUBLIC</code></li>
                <li><code>PRIVATE</code></li>
                <li><code>PROTECTED</code></li>
                <li><code>INTERNAL</code></li>
                <li><code>PACKAGE</code></li>
            </list>
        <p>デフォルト： <code>PUBLIC</code></p>
    </def>
    <def title="reportUndocumented">
        <p>
            可視性があるもののドキュメント化されていない宣言（<code>documentedVisibilities</code> や他のフィルタでフィルタリングされた後に KDoc がない宣言）について警告を出すかどうかを指定します。
        </p>
        <p>この設定は <code>failOnWarning</code> と組み合わせて使うと効果的です。</p>
        <p>これはパッケージ単位で設定することも可能です。</p>
        <p>デフォルト： <code>false</code></p>
    </def>
    <def title="skipEmptyPackages">
        <p>
            各種フィルタを適用した後に、可視宣言が含まれていないパッケージをスキップするかどうかを指定します。
        </p>
        <p>
            例えば、<code>skipDeprecated</code> が <code>true</code> に設定されており、パッケージに非推奨の宣言しか含まれていない場合、そのパッケージは空と見なされます。
        </p>
        <p>CLI ランナーのデフォルトは <code>false</code> です。</p>
    </def>
    <def title="skipDeprecated">
        <p><code>@Deprecated</code> アノテーションが付いた宣言をドキュメント化するかどうかを指定します。</p>
        <p>これはパッケージ単位で設定することも可能です。</p>
        <p>デフォルト： <code>false</code></p>
    </def>
    <def title="jdkVersion">
        <p>Java 型の外部ドキュメントリンクを生成する際に使用する JDK バージョンです。</p>
        <p>
            例えば、公開宣言のシグネチャで <code>java.util.UUID</code> を使用しており、このオプションが <code>8</code> に設定されている場合、
            Dokka はそれに対して <a href="https://docs.oracle.com/javase/8/docs/api/java/util/UUID.html">JDK 8 Javadoc</a> への外部ドキュメントリンクを生成します。
        </p>
    </def>
    <def title="languageVersion">
        <p>
            解析および <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a> 環境の設定に使用される 
            <a href="https://kotlinlang.org/docs/compatibility-modes.html">Kotlin 言語バージョン</a>です。
        </p>
    </def>
    <def title="apiVersion">
        <p>
            解析および <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a> 環境の設定に使用される 
            <a href="https://kotlinlang.org/docs/compatibility-modes.html">Kotlin API バージョン</a>です。
        </p>
    </def>
    <def title="noStdlibLink">
        <p>
            Kotlin 標準ライブラリの API リファレンスドキュメントへの外部ドキュメントリンクを生成するかどうかを指定します。
        </p>
        <p>注意： リンクは <code>noStdLibLink</code> が <code>false</code> に設定されている場合に生成<b>されます</b>。</p>
        <p>デフォルト： <code>false</code></p>
    </def>
    <def title="noJdkLink">
        <p>JDK の Javadoc への外部ドキュメントリンクを生成するかどうかを指定します。</p>
        <p>JDK Javadoc のバージョンは <code>jdkVersion</code> オプションによって決定されます。</p>
        <p>注意： リンクは <code>noJdkLink</code> が <code>false</code> に設定されている場合に生成<b>されます</b>。</p>
        <p>デフォルト： <code>false</code></p>
    </def>
    <def title="includes">
        <p>
            <a href="dokka-module-and-package-docs.md">モジュールおよびパッケージのドキュメント</a>を含む Markdown ファイルのリストです。
        </p>
        <p>指定されたファイルの内容が解析され、モジュールおよびパッケージの説明としてドキュメントに埋め込まれます。</p>
    </def>
    <def title="analysisPlatform">
        <p>
            コード解析および <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a> 環境の設定に使用されるプラットフォームです。
        </p>
        <p>
            指定可能な値：</p>
            <list>
                <li><code>jvm</code></li>
                <li><code>common</code></li>
                <li><code>js</code></li>
                <li><code>native</code></li>
            </list>
    </def>
    <def title="sourceRoots">
        <p>
            解析およびドキュメント化されるソースコードのルートです。
            ディレクトリまたは個別の <code>.kt</code> / <code>.java</code> ファイルを入力として受け付けます。
        </p>
    </def>
    <def title="classpath">
        <p>解析およびインタラクティブなサンプルのためのクラスパスです。</p>
        <p>これは、依存関係に含まれる一部の型が自動的に解決/認識されない場合に便利です。</p>
        <p>このオプションは <code>.jar</code> と <code>.klib</code> の両方のファイルを受け付けます。</p>
    </def>
    <def title="samples">
        <p>
            <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a> KDoc タグを介して参照されるサンプル関数を含むディレクトリまたはファイルのリストです。
        </p>
    </def>
    <def title="suppressedFiles">
        <p>ドキュメント生成時に抑制（除外）するファイルです。</p>
    </def>
    <def title="suppressAnnotatedWith">
        <p>指定されたアノテーションが付加された宣言を抑制するための、アノテーションの完全修飾名（FQN）のリストです。</p>
        <p>
            これらのアノテーションのいずれかが付加された宣言は、生成されるドキュメントから除外されます。
        </p>
    </def>
    <def title="sourceLinks">
        <p>このソースセットにのみ適用されるソースリンクのパラメータセットです。</p>
        <p>指定可能なオプションのリストについては、<a href="#ソースリンクの設定">ソースリンクの設定</a>を参照してください。</p>
    </def>
    <def title="perPackageOptions">
        <p>このソースセット内の一致するパッケージに特有のパラメータセットです。</p>
        <p>指定可能なオプションのリストについては、<a href="#パッケージごとの設定">パッケージごとの設定</a>を参照してください。</p>
    </def>
    <def title="externalDocumentationLinks">
        <p>このソースセットにのみ適用される外部ドキュメントリンクのパラメータセットです。</p>
        <p>指定可能なオプションのリストについては、<a href="#外部ドキュメントリンクの設定">外部ドキュメントリンクの設定</a>を参照してください。</p>
    </def>
</deflist>

### ソースリンクの設定 {id="source-link-configuration"}

`sourceLinks` 設定ブロックを使用すると、各シグネチャに特定の行番号付きの `remoteUrl` へ導く `source` リンクを追加できます（行番号は `remoteLineSuffix` を設定することで構成可能です）。

これにより、読者は各宣言のソースコードを簡単に見つけることができます。

例については、`kotlinx.coroutines` の [`count()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/count.html) 関数のドキュメントを参照してください。

すべてのソースセットに対して一括でソースリンクを設定することも、[個別に](#ソースセットの設定)設定することも可能です。

```json
{
  "sourceLinks": [
    {
      "localDirectory": "src/main/kotlin",
      "remoteUrl": "https://github.com/Kotlin/dokka/tree/master/src/main/kotlin",
      "remoteLineSuffix": "#L"
    }
  ]
}
```

<deflist collapsible="true">
    <def title="localDirectory">
        <p>ローカルソースディレクトリへのパスです。</p>
    </def>
    <def title="remoteUrl">
        <p>
            GitHub、GitLab、Bitbucket など、ドキュメントの読者がアクセスできるソースコードホスティングサービスの URL です。
            この URL は宣言のソースコードリンクを生成するために使用されます。
        </p>
    </def>
    <def title="remoteLineSuffix">
        <p>
            URL にソースコードの行番号を付加するために使用されるサフィックスです。これにより、読者はファイルだけでなく、宣言の特定の行番号に直接移動できるようになります。
        </p>
        <p>
            番号自体は指定されたサフィックスの後に追加されます。例えば、このオプションが <code>#L</code> に設定されており、行番号が 10 の場合、結果の URL サフィックスは <code>#L10</code> になります。
        </p>
        <p>
            一般的なサービスで使用されるサフィックス：</p>
            <list>
                <li>GitHub: <code>#L</code></li>
                <li>GitLab: <code>#L</code></li>
                <li>Bitbucket: <code>#lines-</code></li>
            </list>
        <p>デフォルト： 空（サフィックスなし）</p>
    </def>
</deflist>

### パッケージごとの設定 {id="per-package-configuration"}

`perPackageOptions` 設定ブロックを使用すると、`matchingRegex` に一致する特定のパッケージに対してオプションを設定できます。

すべてのソースセットに対して一括でパッケージ設定を追加することも、[個別に](#ソースセットの設定)追加することも可能です。

```json
{
  "perPackageOptions": [
    {
      "matchingRegex": ".*internal.*",
      "suppress": false,
      "skipDeprecated": false,
      "reportUndocumented": false,
      "documentedVisibilities": ["PUBLIC", "PRIVATE", "PROTECTED", "INTERNAL", "PACKAGE"]
    }
  ]
}
```

<deflist collapsible="true">
    <def title="matchingRegex">
        <p>パッケージの照合に使用される正規表現です。</p>
    </def>
    <def title="suppress">
        <p>ドキュメント生成時にこのパッケージをスキップするかどうかを指定します。</p>
        <p>デフォルト： <code>false</code></p>
    </def>
    <def title="skipDeprecated">
        <p><code>@Deprecated</code> アノテーションが付いた宣言をドキュメント化するかどうかを指定します。</p>
        <p>これはプロジェクト/モジュールレベルでも設定可能です。</p>
        <p>デフォルト： <code>false</code></p>
    </def>
    <def title="reportUndocumented">
        <p>
            可視性があるもののドキュメント化されていない宣言（<code>documentedVisibilities</code> や他のフィルタでフィルタリングされた後に KDoc がない宣言）について警告を出すかどうかを指定します。
        </p>
        <p>この設定は <code>failOnWarning</code> と組み合わせて使うと効果的です。</p>
        <p>これはソースセットレベルで設定することも可能です。</p>
        <p>デフォルト： <code>false</code></p>
    </def>
    <def title="documentedVisibilities">
        <p>ドキュメント化すべき可視性修飾子のセットです。</p>
        <p>
            これは、このパッケージ内の <code>protected</code>/<code>internal</code>/<code>private</code> 宣言をドキュメント化したい場合や、
            <code>public</code> 宣言を除外して内部 API のみをドキュメント化したい場合に指定できます。
        </p>
        <p>ソースセットレベルで設定することも可能です。</p>
        <p>デフォルト： <code>PUBLIC</code></p>
    </def>
</deflist>

### 外部ドキュメントリンクの設定 {id="external-documentation-links-configuration"}

`externalDocumentationLinks` ブロックを使用すると、依存関係にある外部でホストされているドキュメントへのリンクを作成できます。

例えば、`kotlinx.serialization` の型を使用している場合、デフォルトではそれらは解決されていないかのように、ドキュメント内でクリックできません。しかし、`kotlinx.serialization` の API リファレンスドキュメントは Dokka によって構築され、[kotlinlang.org で公開](https://kotlinlang.org/api/kotlinx.serialization/)されているため、それに対する外部ドキュメントリンクを設定できます。これにより、Dokka はそのライブラリの型に対するリンクを生成し、正常に解決されてクリック可能になります。

すべてのソースセットに対して一括で外部ドキュメントリンクを設定することも、[個別に](#ソースセットの設定)設定することも可能です。

```json
{
  "externalDocumentationLinks": [
    {
      "url": "https://kotlinlang.org/api/kotlinx.serialization/",
      "packageListUrl": "https://kotlinlang.org/api/kotlinx.serialization/package-list"
    }
  ]
}
```

<deflist collapsible="true">
    <def title="url">
        <p>リンク先ドキュメントのルート URL です。末尾には必ずスラッシュ（<code>/</code>）を含める<b>必要があります</b>。</p>
        <p>
            Dokka は指定された URL に対して <code>package-list</code> を自動的に探し、宣言をリンクさせるよう最善を尽くします。
        </p>
        <p>
            自動解決が失敗する場合や、代わりにローカルにキャッシュされたファイルを使用したい場合は、<code>packageListUrl</code> オプションの設定を検討してください。
        </p>
    </def>
    <def title="packageListUrl">
        <p>
            <code>package-list</code> の正確な場所です。これは Dokka の自動解決に頼る代わりの方法です。
        </p>
        <p>
            パッケージリストには、モジュール名やパッケージ名など、ドキュメントおよびプロジェクト自体に関する情報が含まれています。
        </p>
        <p>ネットワーク呼び出しを避けるために、ローカルにキャッシュされたファイルを指定することも可能です。</p>
    </def>
</deflist>

### 完全な設定 {id="complete-configuration"}

以下は、可能なすべての設定オプションを一度に適用した例です。

```json
{
  "moduleName": "Dokka Example",
  "moduleVersion": null,
  "outputDir": "./build/dokka/html",
  "failOnWarning": false,
  "suppressObviousFunctions": true,
  "suppressInheritedMembers": false,
  "offlineMode": false,
  "suppressAnnotatedWith": [
    "com.example.SuppressMe"
  ],
  "sourceLinks": [
    {
      "localDirectory": "src/main/kotlin",
      "remoteUrl": "https://github.com/Kotlin/dokka/tree/master/src/main/kotlin",
      "remoteLineSuffix": "#L"
    }
  ],
  "externalDocumentationLinks": [
    {
      "url": "https://docs.oracle.com/javase/8/docs/api/",
      "packageListUrl": "https://docs.oracle.com/javase/8/docs/api/package-list"
    },
    {
      "url": "https://kotlinlang.org/api/core/kotlin-stdlib/",
      "packageListUrl": "https://kotlinlang.org/api/core/kotlin-stdlib/package-list"
    }
  ],
  "perPackageOptions": [
    {
      "matchingRegex": ".*internal.*",
      "suppress": false,
      "reportUndocumented": false,
      "skipDeprecated": false,
      "documentedVisibilities": ["PUBLIC", "PRIVATE", "PROTECTED", "INTERNAL", "PACKAGE"]
    }
  ],
  "sourceSets": [
    {
      "displayName": "jvm",
      "sourceSetID": {
        "scopeId": "moduleName",
        "sourceSetName": "main"
      },
      "dependentSourceSets": [
        {
          "scopeId": "dependentSourceSetScopeId",
          "sourceSetName": "dependentSourceSetName"
        }
      ],
      "documentedVisibilities": ["PUBLIC", "PRIVATE", "PROTECTED", "INTERNAL", "PACKAGE"],
      "reportUndocumented": false,
      "skipEmptyPackages": true,
      "skipDeprecated": false,
      "jdkVersion": 8,
      "languageVersion": "1.7",
      "apiVersion": "1.7",
      "noStdlibLink": false,
      "noJdkLink": false,
      "includes": [
        "module.md"
      ],
      "analysisPlatform": "jvm",
      "sourceRoots": [
        "/home/ignat/IdeaProjects/dokka-debug-mvn/src/main/kotlin"
      ],
      "classpath": [
        "libs/kotlin-stdlib-%kotlinVersion%.jar",
        "libs/kotlin-stdlib-common-%kotlinVersion%.jar"
      ],
      "samples": [
        "samples/basic.kt"
      ],
      "suppressedFiles": [
        "src/main/kotlin/org/jetbrains/dokka/Suppressed.kt"
      ],
      "suppressAnnotatedWith": [
        "com.example.SuppressMe"
      ],
      "sourceLinks": [
        {
          "localDirectory": "src/main/kotlin",
          "remoteUrl": "https://github.com/Kotlin/dokka/tree/master/src/main/kotlin",
          "remoteLineSuffix": "#L"
        }
      ],
      "externalDocumentationLinks": [
        {
          "url": "https://docs.oracle.com/javase/8/docs/api/",
          "packageListUrl": "https://docs.oracle.com/javase/8/docs/api/package-list"
        },
        {
          "url": "https://kotlinlang.org/api/core/kotlin-stdlib/",
          "packageListUrl": "https://kotlinlang.org/api/core/kotlin-stdlib/package-list"
        }
      ],
      "perPackageOptions": [
        {
          "matchingRegex": ".*internal.*",
          "suppress": false,
          "reportUndocumented": false,
          "skipDeprecated": false,
          "documentedVisibilities": ["PUBLIC", "PRIVATE", "PROTECTED", "INTERNAL", "PACKAGE"]
        }
      ]
    }
  ],
  "pluginsClasspath": [
    "./dokka-base-%dokkaVersion%.jar",
    "./kotlinx-html-jvm-0.8.0.jar",
    "./analysis-kotlin-symbols-%dokkaVersion%.jar",
    "./freemarker-2.3.31.jar"
  ],
  "pluginsConfiguration": [
    {
      "fqPluginName": "org.jetbrains.dokka.base.DokkaBase",
      "serializationFormat": "JSON",
      "values": "{\"separateInheritedMembers\":false,\"footerMessage\":\"© 2021 pretty good Copyright\"}"
    }
  ],
  "includes": [
    "module.md"
  ]
}
```
