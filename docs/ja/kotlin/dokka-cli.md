[//]: # (title: CLI)

何らかの理由で[Gradle](dokka-gradle.md)または[Maven](dokka-maven.md)ビルドツールを使用できない場合、Dokkaにはドキュメント生成用のコマンドライン（CLI）ランナーが用意されています。

比較すると、DokkaのGradleプラグインと同等、あるいはそれ以上の機能を備えています。ただし、自動設定がないため、特にマルチプラットフォーム環境やマルチモジュール環境ではセットアップがかなり難しくなります。

## はじめに {id="get-started"}

CLIランナーは、実行可能な個別アーティファクトとしてMaven Centralに公開されています。

[Maven Central](https://central.sonatype.com/artifact/org.jetbrains.dokka/dokka-cli)で見つけるか、[直接ダウンロード](https://repo1.maven.org/maven2/org/jetbrains/dokka/dokka-cli/%dokkaVersion%/dokka-cli-%dokkaVersion%.jar)できます。

コンピュータに保存した `dokka-cli-%dokkaVersion%.jar` ファイルで、`-help` オプションを指定して実行すると、利用可能なすべての設定オプションとその説明が表示されます。

```Bash
java -jar dokka-cli-%dokkaVersion%.jar -help
```

これは、`-sourceSet` などの一部のネストされたオプションでも機能します。

```Bash
java -jar dokka-cli-%dokkaVersion%.jar -sourceSet -help
```

## ドキュメントの生成 {id="generate-documentation"}

### 前提条件 {id="prerequisites"}

依存関係を管理するビルドツールがないため、依存関係の `.jar` ファイルを自身で用意する必要があります。

任意の出力フォーマットで必要となる依存関係は以下のとおりです。

| **Group**             | **Artifact**                  | **Version**    | **Link**                                                                                                                                                 |
|-----------------------|-------------------------------|----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| `org.jetbrains.dokka` | `dokka-base`                  | %dokkaVersion% | [download](https://repo1.maven.org/maven2/org/jetbrains/dokka/dokka-base/%dokkaVersion%/dokka-base-%dokkaVersion%.jar)                                   |
| `org.jetbrains.dokka` | `analysis-kotlin-symbols` | %dokkaVersion% | [download](https://repo1.maven.org/maven2/org/jetbrains/dokka/analysis-kotlin-symbols/%dokkaVersion%/analysis-kotlin-symbols-%dokkaVersion%.jar) |

[HTML](dokka-html.md)出力フォーマットで追加で必要となる依存関係は以下のとおりです。

| **Group**               | **Artifact**       | **Version** | **Link**                                                                                                           |
|-------------------------|--------------------|-------------|--------------------------------------------------------------------------------------------------------------------|
| `org.jetbrains.kotlinx` | `kotlinx-html-jvm` | 0.8.0       | [download](https://repo1.maven.org/maven2/org/jetbrains/kotlinx/kotlinx-html-jvm/0.8.0/kotlinx-html-jvm-0.8.0.jar) |
| `org.freemarker`        | `freemarker`       | 2.3.31      | [download](https://repo1.maven.org/maven2/org/freemarker/freemarker/2.3.31/freemarker-2.3.31.jar)                  |

### コマンドラインオプションを指定して実行する {id="run-with-command-line-options"}

コマンドラインオプションを渡してCLIランナーを設定できます。

最低限、以下のオプションを指定する必要があります。

* `-pluginsClasspath` - セミコロン `;` で区切られた、ダウンロードした依存関係への絶対パス/相対パスのリスト
* `-sourceSet` - ドキュメントを生成するソースコードへの絶対パス
* `-outputDir` - ドキュメント出力ディレクトリの絶対パス/相対パス

```Bash
java -jar dokka-cli-%dokkaVersion%.jar \
     -pluginsClasspath "./dokka-base-%dokkaVersion%.jar;./analysis-kotlin-symbols-%dokkaVersion%.jar;./kotlinx-html-jvm-0.8.0.jar;./freemarker-2.3.31.jar" \
     -sourceSet "-src /home/myCoolProject/src/main/kotlin" \
     -outputDir "./dokka/html"
```

この例を実行すると、[HTML](dokka-html.md)出力フォーマットでドキュメントが生成されます。

設定の詳細については、[コマンドラインオプション](#command-line-options)を参照してください。

### JSON設定ファイルを使用して実行する {id="run-with-json-configuration"}

CLIランナーはJSONで設定することも可能です。この場合、最初で唯一の引数としてJSON設定ファイルへの絶対パスまたは相対パスを指定する必要があります。その他のすべての設定オプションは、そこからパース（解析）されます。

```Bash
java -jar dokka-cli-%dokkaVersion%.jar dokka-configuration.json
```

最低限、以下のようなJSON設定ファイルが必要です。

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

詳細については、[JSON設定オプション](#json-configuration)を参照してください。

### その他の出力フォーマット {id="other-output-formats"}

デフォルトでは、`dokka-base` アーティファクトには[HTML](dokka-html.md)出力フォーマットのみが含まれています。

その他の出力フォーマットはすべて[Dokkaプラグイン](dokka-plugins.md)として実装されています。これらを使用するには、プラグインのクラスパスに配置する必要があります。

たとえば、実験的な[GFM](https://github.com/Kotlin/dokka/blob/master/dokka-subprojects/plugin-gfm/README.md)出力フォーマットでドキュメントを生成したい場合は、gfm-pluginのJAR（[ダウンロード](https://repo1.maven.org/maven2/org/jetbrains/dokka/gfm-plugin/%dokkaVersion%/gfm-plugin-%dokkaVersion%.jar)）をダウンロードし、`pluginsClasspath` 設定オプションに渡す必要があります。

コマンドラインオプションの場合：

```Shell
java -jar dokka-cli-%dokkaVersion%.jar \
     -pluginsClasspath "./dokka-base-%dokkaVersion%.jar;...;./gfm-plugin-%dokkaVersion%.jar" \
     ...
```

JSON設定の場合：

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

GFMプラグインを `pluginsClasspath` に渡すことで、CLIランナーはGFM出力フォーマットでドキュメントを生成します。

詳細については、[GFM](https://github.com/Kotlin/dokka/blob/8e5c63d035ef44a269b8c43430f43f5c8eebfb63/dokka-subprojects/plugin-gfm/README.md)および[Javadoc](dokka-javadoc.md#generate-javadoc-documentation)のページを参照してください。

## コマンドラインオプション {id="command-line-options"}

指定可能なすべてのコマンドラインオプションのリストと詳細な説明を表示するには、以下を実行します。

```Bash
java -jar dokka-cli-%dokkaVersion%.jar -help
```

簡単な概要：

| Option                       | Description                                                                                                                                                                                           |
|------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `moduleName`                 | プロジェクト/モジュールの名前。                                                                                                                                                                       |
| `moduleVersion`              | ドキュメント化するバージョン。                                                                                                                                                                       |
| `outputDir`                  | 出力ディレクトリパス。デフォルトは `./dokka`。                                                                                                                                                       |
| `sourceSet`                  | Dokkaソースセットの設定。ネストされた設定オプションを含みます。                                                                                                                                      |
| `pluginsConfiguration`       | Dokkaプラグインの設定。                                                                                                                                                                               |
| `pluginsClasspath`           | Dokkaプラグインとその依存関係を含むjarのリスト。セミコロン区切りで複数のパスを受け入れます。                                                                                                           |
| `offlineMode`                | ネットワーク経由でリモートファイル/リンクを解決するかどうか。                                                                                                                                         |
| `failOnWarning`              | Dokkaが警告またはエラーを出力した場合に、ドキュメント生成を失敗させるかどうか。                                                                                                                       |
| `delayTemplateSubstitution`  | 一部の要素の置換を遅延させるかどうか。マルチモジュールプロジェクトのインクリメンタルビルドで使用されます。                                                                                           |
| `noSuppressObviousFunctions` | `kotlin.Any` や `java.lang.Object` から継承された関数など、自明な関数（obvious functions）の抑制を行わないかどうか。                                                                                  |
| `includes`                   | モジュールおよびパッケージのドキュメントを含むMarkdownファイル。セミコロン区切りで複数の値を受け入れます。                                                                                           |
| `suppressInheritedMembers`   | 特定のクラスで明示的にオーバーライドされていない継承メンバーを抑制するかどうか。                                                                                                                      |
| `globalPackageOptions`       | `"matchingRegex,-deprecated,-privateApi,+warnUndocumented,+suppress;+visibility:PUBLIC;..."` 形式のパッケージ設定オプションのグローバルリスト。セミコロン区切りで複数の値を受け入れます。           |
| `globalLinks`                | `{url}^{packageListUrl}` 形式のグローバルな外部ドキュメントリンク。`^^` 区切りで複数の値を受け入れます。                                                                                              |
| `globalSrcLink`              | ソースディレクトリとコードを閲覧するためのWebサービス間のグローバルなマッピング。セミコロン区切りで複数のパスを受け入れます。                                                                       |
| `helpSourceSet`              | ネストされた `-sourceSet` 設定のヘルプを出力します。                                                                                                                                                 |
| `loggingLevel`               | ロギングレベル。指定可能な値: `DEBUG, PROGRESS, INFO, WARN, ERROR`。                                                                                                                                  |
| `help, h`                    | 使用方法（ヘルプ情報）。                                                                                                                                                                              |

#### ソースセットのオプション {id="source-set-options"}

ネストされた `-sourceSet` 設定のコマンドラインオプションのリストを表示するには、以下を実行します。

```Bash
java -jar dokka-cli-%dokkaVersion%.jar -sourceSet -help
```

簡単な概要：

| Option                       | Description                                                                                                                                                                    |
|------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `sourceSetName`              | ソースセットの名前。                                                                                                                                                           |
| `displayName`                | 内部および外部の両方で使用される、ソースセットの表示名。                                                                                                                       |
| `classpath`                  | 解析およびインタラクティブなサンプルのためのクラスパス。セミコロン区切りで複数のパスを受け入れます。                                                                           |
| `src`                        | 解析およびドキュメント化の対象となるソースコードのルート。セミコロン区切りで複数のパスを受け入れます。                                                                          |
| `dependentSourceSets`        | `moduleName/sourceSetName` 形式の依存ソースセットの名前。セミコロン区切りで複数の値を受け入れます。                                                                           |
| `samples`                    | サンプル関数を含むディレクトリまたはファイルのリスト。セミコロン区切りで複数のパスを受け入れます。<anchor name="includes-cli"/>                                                 |
| `includes`                   | [モジュールおよびパッケージドキュメント](dokka-module-and-package-docs.md)を含むMarkdownファイル。セミコロン区切りで複数のパスを受け入れます。                                 |
| `documentedVisibilities`     | ドキュメント化する可視性（Visibility）。セミコロン区切りで複数の値を受け入れます。指定可能な値: `PUBLIC`、`PRIVATE`、`PROTECTED`、`INTERNAL`、`PACKAGE`。                       |
| `reportUndocumented`         | ドキュメント化されていない宣言を報告するかどうか。                                                                                                                             | 
| `noSkipEmptyPackages`        | 空のパッケージに対してもページを作成するかどうか。                                                                                                                             | 
| `skipDeprecated`             | 非推奨（deprecated）の宣言をスキップするかどうか。                                                                                                                             | 
| `jdkVersion`                 | JDK Javadocへのリンクに使用するJDKのバージョン。                                                                                                                               |
| `languageVersion`            | 解析およびサンプルのセットアップに使用される言語バージョン。                                                                                                                  |
| `apiVersion`                 | 解析およびサンプルのセットアップに使用されるKotlin APIバージョン。                                                                                                            |
| `noStdlibLink`               | Kotlin標準ライブラリへのリンクを生成しないかどうか。                                                                                                                           | 
| `noJdkLink`                  | JDK Javadocへのリンクを生成しないかどうか。                                                                                                                                    | 
| `suppressedFiles`            | 抑制するファイルのパス。セミコロン区切りで複数のパスを受け入れます。                                                                                                          |
| `suppressAnnotatedWith`      | アノテーションが付与された宣言を抑制するための、アノテーションの完全修飾名（FQN）。セミコロン区切りで複数の値を受け入れます。                                                 |
| `analysisPlatform`           | 解析のセットアップに使用されるプラットフォーム。                                                                                                                               |
| `perPackageOptions`          | `matchingRegexp,-deprecated,-privateApi,+warnUndocumented,+suppress;...` 形式のパッケージソースセット設定のリスト。セミコロン区切りで複数の値を受け入れます。                    |
| `externalDocumentationLinks` | `{url}^{packageListUrl}` 形式の外部ドキュメントリンク。`^^` 区切りで複数の値を受け入れます。                                                                                   |
| `srcLink`                    | ソースディレクトリとコードを閲覧するためのWebサービス間のマッピング。セミコロン区切りで複数のパスを受け入れます。                                                               |

## JSON設定 {id="json-configuration"}

以下に、各設定セクションの例と詳細な説明を示します。また、ページ下部には[すべての設定オプション](#complete-configuration)を適用した例も掲載しています。

### 全般設定 {id="general-configuration"}

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
    { "_comment": "Options are described in a separate section" }
  ],
  "perPackageOptions": [
    { "_comment": "Options are described in a separate section" }
  ],
  "externalDocumentationLinks":  [
    { "_comment": "Options are described in a separate section" }
  ],
  "sourceSets": [
    { "_comment": "Options are described in a separate section" }
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
        <p>モジュールを参照するために使用される表示名です。目次、ナビゲーション、ロギングなどに使用されます。</p>
        <p>デフォルト: <code>root</code></p>
    </def>
    <def title="moduleVersion">
        <p>モジュールのバージョンです。</p>
        <p>デフォルト: 空</p>
    </def>
    <def title="outputDirectory">
        <p>出力フォーマットに関係なく、ドキュメントが生成されるディレクトリです。</p>
        <p>デフォルト: <code>./dokka</code></p>
    </def>
    <def title="failOnWarning">
        <p>
            Dokkaが警告またはエラーを出力した場合に、ドキュメント生成を失敗させるかどうかです。
            処理は、まずすべてのエラーと警告が出力されるまで待機します。
        </p>
        <p>この設定は <code>reportUndocumented</code> と相性が良いです。</p>
        <p>デフォルト: <code>false</code></p>
    </def>
    <def title="suppressObviousFunctions">
        <p>自明な関数を抑制するかどうかです。</p>
            次のいずれかに該当する場合、関数は自明であるとみなされます。
            <list>
                <li>
                    <code>equals</code>、<code>hashCode</code>、<code>toString</code> など、<code>kotlin.Any</code>、<code>Kotlin.Enum</code>、<code>java.lang.Object</code>、
                    または <code>java.lang.Enum</code> から継承されたもの。
                </li>
                <li>
                    <code>dataClass.componentN</code> や <code>dataClass.copy</code> など、合成（コンパイラによって生成）され、ドキュメントを持たないもの。
                </li>
            </list>
        <p>デフォルト: <code>true</code></p>
    </def>
    <def title="suppressInheritedMembers">
        <p>特定のクラスで明示的にオーバーライドされていない継承メンバーを抑制するかどうかです。</p>
        <p>
            注意: これは <code>equals</code> / <code>hashCode</code> / <code>toString</code> などの関数を抑制できますが、
            <code>dataClass.componentN</code> や <code>dataClass.copy</code> などの合成関数は抑制できません。
            それらには <code>suppressObviousFunctions</code> を使用してください。
        </p>
        <p>デフォルト: <code>false</code></p>
    </def>
    <def title="offlineMode">
        <anchor name="includes-json"/>
        <p>ネットワーク経由でリモートファイル/リンクを解決するかどうかです。</p>
        <p>
            これには、外部ドキュメントリンクの生成に使用される package-list が含まれます（たとえば標準ライブラリのクラスをクリック可能にするためなど）。
        </p>
        <p>
            これを <code>true</code> に設定すると、場合によってはビルド時間を大幅に短縮できますが、
            標準ライブラリを含む依存関係のクラス/メンバーリンクが解決されなくなるなど、ドキュメントの品質やユーザー体験が低下する可能性もあります。
        </p>
        <p>
            注意: 取得したファイルをローカルにキャッシュし、ローカルパスとしてDokkaに提供することができます。
            <code>externalDocumentationLinks</code> セクションを参照してください。
        </p>
        <p>デフォルト: <code>false</code></p>
    </def>
    <def title="includes">
        <p>
            <a href="dokka-module-and-package-docs.md">モジュールおよびパッケージドキュメント</a>を含むMarkdownファイルのリストです。
        </p>
        <p>指定されたファイルの内容はパースされ、モジュールおよびパッケージの説明としてドキュメントに埋め込まれます。</p>
        <p>これはパッケージ単位で設定できます。</p>
    </def>
    <def title="sourceSets">
        <p>
          Kotlin <a href="https://kotlinlang.org/docs/multiplatform-discover-project.html#source-sets">ソースセット</a>の個別および追加の設定です。
        </p>
        <p>指定可能なオプションのリストについては、<a href="#source-set-configuration">ソースセット設定</a>を参照してください。</p>
    </def>
    <def title="sourceLinks">
        <p>すべてのソースセットに適用されるソースリンクのグローバル設定です。</p>
        <p>指定可能なオプションのリストについては、<a href="#source-link-configuration">ソースリンク設定</a>を参照してください。</p>
    </def>
    <def title="perPackageOptions">
        <p>属するソースセットに関係なく、一致するパッケージに対するグローバル設定です。</p>
        <p>指定可能なオプションのリストについては、<a href="#per-package-configuration">パッケージごとの設定</a>を参照してください。</p>
    </def>
    <def title="externalDocumentationLinks">
        <p>使用されているソースセットに関係なく、外部ドキュメントリンクに対するグローバル設定です。</p>
        <p>指定可能なオプションのリストについては、<a href="#external-documentation-links-configuration">外部ドキュメントリンク設定</a>を参照してください。</p>
    </def>
    <def title="pluginsClasspath">
        <p>Dokkaプラグインとその依存関係を含むJARファイルのリストです。</p>
    </def>
</deflist>

### ソースセット設定 {id="source-set-configuration"}

Kotlinの[ソースセット](https://kotlinlang.org/docs/multiplatform-discover-project.html#source-sets)を設定する方法:

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
      "suppressAnnotatedWith": [
        "com.example.SuppressMe"
      ],
      "sourceLinks":  [
        { "_comment": "Options are described in a separate section" }
      ],
      "perPackageOptions": [
        { "_comment": "Options are described in a separate section" }
      ],
      "externalDocumentationLinks":  [
        { "_comment": "Options are described in a separate section" }
      ]
    }
  ]
}
```

<deflist collapsible="true">
    <def title="displayName">
        <p>このソースセットを参照するために使用される表示名です。</p>
        <p>
            この名前は外部（ドキュメントの閲覧者にソースセット名が表示されるなど）と
            内部（<code>reportUndocumented</code> のログメッセージなど）の両方で使用されます。
        </p>
        <p>より適切な代替案がない場合は、プラットフォーム名を使用できます。</p>
    </def>
    <def title="sourceSetID">
        <p>ソースセットの技術的なIDです。</p>
    </def>
    <def title="documentedVisibilities">
        <p>ドキュメント化すべき可視性修飾子のセットです。</p>
        <p>
            これは、<code>protected</code>/<code>internal</code>/<code>private</code> の宣言をドキュメント化したい場合や、
            <code>public</code> の宣言を除外して内部APIのみをドキュメント化したい場合に使用できます。
        </p>
        <p>パッケージ単位で設定可能です。</p>
        <p>
            指定可能な値:</p>
            <list>
                <li><code>PUBLIC</code></li>
                <li><code>PRIVATE</code></li>
                <li><code>PROTECTED</code></li>
                <li><code>INTERNAL</code></li>
                <li><code>PACKAGE</code></li>
            </list>
        <p>デフォルト: <code>PUBLIC</code></p>
    </def>
    <def title="reportUndocumented">
        <p>
            <code>documentedVisibilities</code> やその他のフィルターによってフィルタリングされた後、可視であるにもかかわらずドキュメント化されていない宣言（KDocがない宣言）について警告を出力するかどうかです。
        </p>
        <p>この設定は <code>failOnWarning</code> と相性が良いです。</p>
        <p>パッケージ単位で設定可能です。</p>
        <p>デフォルト: <code>false</code></p>
    </def>
    <def title="skipEmptyPackages">
        <p>
            さまざまなフィルターが適用された後に、可視な宣言が含まれていないパッケージをスキップするかどうかです。
        </p>
        <p>
            たとえば、<code>skipDeprecated</code> が <code>true</code> に設定されており、パッケージに非推奨の宣言しか含まれていない場合、そのパッケージは空であるとみなされます。
        </p>
        <p>CLIランナーのデフォルトは <code>false</code> です。</p>
    </def>
    <def title="skipDeprecated">
        <p><code>@Deprecated</code> が付与された宣言をドキュメント化するかどうかです。</p>
        <p>パッケージ単位で設定可能です。</p>
        <p>デフォルト: <code>false</code></p>
    </def>
    <def title="jdkVersion">
        <p>Java型の外部ドキュメントリンクを生成する際に使用するJDKバージョンです。</p>
        <p>
            たとえば、公開宣言のシグネチャで <code>java.util.UUID</code> を使用しており、このオプションが <code>8</code> に設定されている場合、Dokkaはその宣言に対して <a href="https://docs.oracle.com/javase/8/docs/api/java/util/UUID.html">JDK 8 Javadoc</a> への外部ドキュメントリンクを生成します。
        </p>
    </def>
    <def title="languageVersion">
        <p>
            解析および <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a> 環境のセットアップに使用される<a href="https://kotlinlang.org/docs/compatibility-modes.html">Kotlin言語バージョン</a>です。
        </p>
    </def>
    <def title="apiVersion">
        <p>
            解析および <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a> 環境のセットアップに使用される<a href="https://kotlinlang.org/docs/compatibility-modes.html">Kotlin APIバージョン</a>です。
        </p>
    </def>
    <def title="noStdlibLink">
        <p>
            Kotlin標準ライブラリのAPIリファレンスドキュメントへ導く外部ドキュメントリンクを生成するかどうかです。
        </p>
        <p>注意: <code>noStdLibLink</code> が <code>false</code> に設定されている場合、リンク<b>は生成されます</b>。</p>
        <p>デフォルト: <code>false</code></p>
    </def>
    <def title="noJdkLink">
        <p>JDKのJavadocへの外部ドキュメントリンクを生成するかどうかです。</p>
        <p>JDK Javadocのバージョンは <code>jdkVersion</code> オプションによって決定されます。</p>
        <p>注意: <code>noJdkLink</code> が <code>false</code> に設定されている場合、リンク<b>は生成されます</b>。</p>
        <p>デフォルト: <code>false</code></p>
    </def>
    <def title="includes">
        <p>
            <a href="dokka-module-and-package-docs.md">モジュールおよびパッケージドキュメント</a>を含むMarkdownファイルのリストです。
        </p>
        <p>指定されたファイルの内容はパースされ、モジュールおよびパッケージの説明としてドキュメントに埋め込まれます。</p>
    </def>
    <def title="analysisPlatform">
        <p>
            コード解析および <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a> 環境のセットアップに使用されるプラットフォームです。
        </p>
        <p>
            指定可能な値:</p>
            <list>
                <li><code>jvm</code></li>
                <li><code>common</code></li>
                <li><code>js</code></li>
                <li><code>native</code></li>
            </list>
    </def>
    <def title="sourceRoots">
        <p>
            解析およびドキュメント化の対象となるソースコードのルートです。
            有効な入力はディレクトリおよび個別の <code>.kt</code> / <code>.java</code> ファイルです。
        </p>
    </def>
    <def title="classpath">
        <p>解析およびインタラクティブなサンプルのためのクラスパスです。</p>
        <p>依存関係に由来する一部の型が自動的に解決/検出されない場合に便利です。</p>
        <p>このオプションは <code>.jar</code> と <code>.klib</code> の両方のファイルを受け入れます。</p>
    </def>
    <def title="samples">
        <p>
            <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a> KDocタグを介して参照されるサンプル関数を含むディレクトリまたはファイルのリストです。
        </p>
    </def>
    <def title="suppressedFiles">
        <p>ドキュメント生成時に抑制するファイルです。</p>
    </def>
    <def title="suppressAnnotatedWith">
        <p>アノテーションが付与された宣言を抑制するための、アノテーションの完全修飾名（FQN）のリストです。</p>
        <p>
            これらのアノテーションのいずれかが付与されている宣言は、生成されるドキュメントから除外されます。
        </p>
    </def>
    <def title="sourceLinks">
        <p>このソースセットにのみ適用されるソースリンクのパラメータセットです。</p>
        <p>指定可能なオプションのリストについては、<a href="#source-link-configuration">ソースリンク設定</a>を参照してください。</p>
    </def>
    <def title="perPackageOptions">
        <p>このソースセット内の一致するパッケージに固有のパラメータセットです。</p>
        <p>指定可能なオプションのリストについては、<a href="#per-package-configuration">パッケージごとの設定</a>を参照してください。</p>
    </def>
    <def title="externalDocumentationLinks">
        <p>このソースセットにのみ適用される外部ドキュメントリンクのパラメータセットです。</p>
        <p>指定可能なオプションのリストについては、<a href="#external-documentation-links-configuration">外部ドキュメントリンク設定</a>を参照してください。</p>
    </def>
</deflist>

### ソースリンク設定 {id="source-link-configuration"}

`sourceLinks` 設定ブロックを使用すると、各シグネチャに特定の行番号付きの `remoteUrl` へ導く `source` リンクを追加できます（行番号は `remoteLineSuffix` を設定して構成可能です）。

これにより、読者は各宣言のソースコードを見つけやすくなります。

例については、`kotlinx.coroutines` の [`count()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/count.html) 関数のドキュメントを参照してください。

ソースリンクはすべてのソースセットに対して一度にまとめて設定することも、[個別](#source-set-configuration)に設定することもできます。

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
        <p>ローカルのソースディレクトリへのパスです。</p>
    </def>
    <def title="remoteUrl">
        <p>
            GitHub、GitLab、Bitbucketなど、ドキュメントの閲覧者がアクセスできるソースコードホスティングサービスのURLです。このURLは、宣言のソースコードリンクを生成するために使用されます。
        </p>
    </def>
    <def title="remoteLineSuffix">
        <p>
            ソースコードの行番号をURLに追加するために使用されるサフィックスです。これにより、読者はファイルだけでなく、宣言の特定の行番号に移動できるようになります。
        </p>
        <p>
            指定されたサフィックスの後ろに行番号自体が付加されます。たとえば、このオプションが <code>#L</code> に設定されており、行番号が 10 の場合、生成されるURLサフィックスは <code>#L10</code> になります。
        </p>
        <p>
            代表的なサービスで使用されるサフィックス:</p>
            <list>
                <li>GitHub: <code>#L</code></li>
                <li>GitLab: <code>#L</code></li>
                <li>Bitbucket: <code>#lines-</code></li>
            </list>
        <p>デフォルト: 空（サフィックスなし）</p>
    </def>
</deflist>

### パッケージごとの設定 {id="per-package-configuration"}

`perPackageOptions` 設定ブロックを使用すると、`matchingRegex` に一致する特定のパッケージに対していくつかのオプションを設定できます。

パッケージ設定はすべてのソースセットに対して一度にまとめて追加することも、[個別](#source-set-configuration)に追加することもできます。

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
        <p>パッケージのマッチングに使用される正規表現です。</p>
    </def>
    <def title="suppress">
        <p>ドキュメント生成時にこのパッケージをスキップするかどうかです。</p>
        <p>デフォルト: <code>false</code></p>
    </def>
    <def title="skipDeprecated">
        <p><code>@Deprecated</code> が付与された宣言をドキュメント化するかどうかです。</p>
        <p>プロジェクト/モジュールレベルで設定可能です。</p>
        <p>デフォルト: <code>false</code></p>
    </def>
    <def title="reportUndocumented">
        <p>
            <code>documentedVisibilities</code> やその他のフィルターによってフィルタリングされた後、可視であるにもかかわらずドキュメント化されていない宣言（KDocがない宣言）について警告を出力するかどうかです。
        </p>
        <p>この設定は <code>failOnWarning</code> と相性が良いです。</p>
        <p>ソースセットレベルで設定可能です。</p>
        <p>デフォルト: <code>false</code></p>
    </def>
    <def title="documentedVisibilities">
        <p>ドキュメント化すべき可視性修飾子のセットです。</p>
        <p>
            これは、このパッケージ内の <code>protected</code>/<code>internal</code>/<code>private</code> の宣言をドキュメント化したい場合や、<code>public</code> の宣言を除外して内部APIのみをドキュメント化したい場合に使用できます。
        </p>
        <p>ソースセットレベルで設定可能です。</p>
        <p>デフォルト: <code>PUBLIC</code></p>
    </def>
</deflist>

### 外部ドキュメントリンク設定 {id="external-documentation-links-configuration"}

`externalDocumentationLinks` ブロックを使用すると、依存関係の外部でホストされているドキュメントへのリンクを作成できます。

たとえば、`kotlinx.serialization` の型を使用している場合、デフォルトでは未解決であるかのようにドキュメント内でクリックできません。しかし、`kotlinx.serialization` のAPIリファレンスドキュメントはDokkaによって構築され、[kotlinlang.orgで公開](https://kotlinlang.org/api/kotlinx.serialization/)されているため、その外部ドキュメントリンクを設定できます。これにより、Dokkaはそのライブラリの型に対するリンクを生成できるようになり、正常に解決されてクリック可能になります。

外部ドキュメントリンクはすべてのソースセットに対して一度にまとめて設定することも、[個別](#source-set-configuration)に設定することもできます。

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
        <p>リンク先ドキュメントのルートURLです。末尾にスラッシュ（<code>/</code>）が<b>必須</b>です。</p>
        <p>
            Dokkaは指定されたURLから <code>package-list</code> を自動的に検出し、宣言同士をリンクしようと試みます。
        </p>
        <p>
            自動解決に失敗した場合や、代わりにローカルにキャッシュされたファイルを使用したい場合は、<code>packageListUrl</code> オプションの設定を検討してください。
        </p>
    </def>
    <def title="packageListUrl">
        <p>
            <code>package-list</code> の正確な場所です。Dokkaによる自動解決に依存する代わりの手段となります。
        </p>
        <p>
            パッケージリストには、モジュール名やパッケージ名など、ドキュメントおよびプロジェクト自体に関する情報が含まれています。
        </p>
        <p>ネットワーク呼び出しを回避するために、ローカルにキャッシュされたファイルを指定することもできます。</p>
    </def>
</deflist>

### 完全な設定例 {id="complete-configuration"}

以下は、指定可能なすべての設定オプションを同時に適用した例です。

```json
{
  "moduleName": "Dokka Example",
  "moduleVersion": null,
  "outputDir": "./build/dokka/html",
  "failOnWarning": false,
  "suppressObviousFunctions": true,
  "suppressInheritedMembers": false,
  "offlineMode": false,
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