[//]: # (title: Maven)

Mavenベースのプロジェクトのドキュメントを生成するには、Dokka用のMavenプラグインを使用できます。

> [Gradle用のDokkaプラグイン](dokka-gradle.md)と比較して、Mavenプラグインは基本的な機能のみを備えており、マルチモジュールビルドはサポートしていません。
> 
{style="note"}

[Mavenサンプル](https://github.com/Kotlin/dokka/tree/%dokkaVersion%/examples/maven)プロジェクトを参照して、Dokkaの設定方法を試すことができます。

## Dokkaの適用 {id="apply-dokka"}

Dokkaを適用するには、POMファイルの `plugins` セクションに `dokka-maven-plugin` を追加する必要があります。

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

## ドキュメントの生成 {id="generate-documentation"}

Mavenプラグインでは、以下のゴール（goal）が提供されています。

| **ゴール**      | **説明**                                                                        |
|---------------|----------------------------------------------------------------------------------------|
| `dokka:dokka` | Dokkaプラグインを適用してドキュメントを生成します。デフォルトは [HTML](dokka-html.md) 形式です。 |

### 実験的機能 {id="experimental"}

| **ゴール**           | **説明**                                                                             |
|--------------------|---------------------------------------------------------------------------------------------|
| `dokka:javadoc`    | [Javadoc](dokka-javadoc.md) 形式でドキュメントを生成します。                                    |
| `dokka:javadocJar` | [Javadoc](dokka-javadoc.md) 形式のドキュメントを含む `javadoc.jar` ファイルを生成します。 |

### その他の出力形式 {id="other-output-formats"}

デフォルトでは、DokkaのMavenプラグインは [HTML](dokka-html.md) 出力形式でドキュメントをビルドします。

他のすべての出力形式は [Dokkaプラグイン](dokka-plugins.md) として実装されています。目的の形式でドキュメントを生成するには、それをDokkaプラグインとして設定に追加する必要があります。

例えば、実験的な [GFM](https://github.com/Kotlin/dokka/tree/master/dokka-subprojects/plugin-gfm#readme) 形式を使用するには、`gfm-plugin` アーティファクトを追加する必要があります。

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

この設定で `dokka:dokka` ゴールを実行すると、GFM形式でドキュメントが生成されます。

Dokkaプラグインの詳細については、[Dokkaプラグイン](dokka-plugins.md) を参照してください。

## javadoc.jar のビルド {id="build-javadoc-jar"}

ライブラリをリポジトリに公開する場合、ライブラリのAPIリファレンスドキュメントを含む `javadoc.jar` ファイルの提供が必要になることがあります。

例えば、[Maven Central](https://central.sonatype.org/) に公開する場合、プロジェクトと一緒に `javadoc.jar` を提供することが[必須](https://central.sonatype.org/publish/requirements/)です。ただし、すべてのリポジトリにこのルールがあるわけではありません。

[Gradle用のDokkaプラグイン](dokka-gradle.md#build-javadoc-jar)とは異なり、Mavenプラグインにはすぐに使用できる `dokka:javadocJar` ゴールが用意されています。デフォルトでは、`target` フォルダに [Javadoc](dokka-javadoc.md) 出力形式でドキュメントが生成されます。

組み込みのゴールに満足できない場合や、出力をカスタマイズしたい場合（例えば、Javadocの代わりに [HTML](dokka-html.md) 形式でドキュメントを生成したい場合など）は、Maven JARプラグインを以下の設定で追加することで同様の動作を実現できます。

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

その後、`dokka:dokka` と `jar:jar@dokka-jar` ゴールを実行することで、ドキュメントとそのための `.jar` アーカイブが生成されます。

```Bash
mvn dokka:dokka jar:jar@dokka-jar
```

> Maven Centralにライブラリを公開する場合、[javadoc.io](https://javadoc.io/) などのサービスを利用して、セットアップなしで無料でライブラリのAPIドキュメントをホストできます。これは `javadoc.jar` から直接ドキュメントページを取得します。[この例](https://javadoc.io/doc/com.trib3/server/latest/index.html)のように、HTML形式でもうまく機能します。
>
{style="tip"}

## 設定例 {id="configuration-example"}

Mavenのプラグイン設定ブロックを使用して、Dokkaを設定できます。

以下は、ドキュメントの出力場所のみを変更する基本的な設定例です。

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

## 設定オプション {id="configuration-options"}

Dokkaには、あなたや読者の体験をカスタマイズするための多くの設定オプションがあります。

以下に、各設定セクションの例と詳細な説明を示します。また、ページの下部には[すべての設定オプション](#complete-configuration)を適用した例もあります。

### 一般設定 {id="general-configuration"}

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
            <!-- Separate section -->
        </sourceLinks>
        <externalDocumentationLinks>
            <!-- Separate section -->
        </externalDocumentationLinks>
        <perPackageOptions>
            <!-- Separate section -->
        </perPackageOptions>
    </configuration>
</plugin>
```

<deflist collapsible="true">
    <def title="skip">
        <p>ドキュメントの生成をスキップするかどうか。</p>
        <p>デフォルト: <code>false</code></p>
    </def>
    <def title="moduleName">
        <p>プロジェクト/モジュールを指すために使用される表示名。目次、ナビゲーション、ロギングなどに使用されます。</p>
        <p>デフォルト: <code>{project.artifactId}</code></p>
    </def>
    <def title="outputDir">
        <p>形式に関わらず、ドキュメントが生成されるディレクトリ。</p>
        <p>デフォルト: <code>{project.basedir}/target/dokka</code></p>
    </def>
    <def title="failOnWarning">
        <p>
            Dokkaが警告またはエラーを出力した場合に、ドキュメントの生成を失敗させるかどうか。プロセスは、すべてのエラーと警告が出力されるまで待機してから終了します。
        </p>
        <p>この設定は <code>reportUndocumented</code> と組み合わせて使用すると効果的です。</p>
        <p>デフォルト: <code>false</code></p>
    </def>
    <def title="suppressObviousFunctions">
        <p>自明な（obvious）関数を除外するかどうか。</p>
        <p>
            以下の場合、関数は自明であると見なされます：</p>
            <list>
                <li>
                    <code>kotlin.Any</code>, <code>Kotlin.Enum</code>, <code>java.lang.Object</code> または 
                    <code>java.lang.Enum</code> から継承され、<code>equals</code>, <code>hashCode</code>, <code>toString</code> のようなものである場合。
                </li>
                <li>
                    合成（コンパイラによって生成）され、ドキュメントがない場合。例えば 
                    <code>dataClass.componentN</code> や <code>dataClass.copy</code> など。
                </li>
            </list>
        <p>デフォルト: <code>true</code></p>
    </def>
    <def title="suppressInheritedMembers">
        <p>指定されたクラスで明示的にオーバーライドされていない継承メンバーを除外するかどうか。</p>
        <p>
            注意: これにより <code>equals</code>/<code>hashCode</code>/<code>toString</code> などの関数は除外できますが、<code>dataClass.componentN</code> や 
            <code>dataClass.copy</code> などの合成関数は除外できません。それらには <code>suppressObviousFunctions</code> を使用してください。
        </p>
        <p>デフォルト: <code>false</code></p>
    </def>
    <def title="offlineMode">
        <p>ネットワーク経由でリモートファイル/リンクを解決するかどうか。</p>
        <p>
            これには、外部リンクを生成するために使用される package-lists が含まれます。
            例えば、標準ライブラリのクラスをクリック可能にするために使用されます。
        </p>
        <p>
            これを <code>true</code> に設定すると、特定の場合にビルド時間を大幅に短縮できますが、
            ドキュメントの品質やユーザーエクスペリエンスが低下する可能性があります。例えば、
            標準ライブラリを含む依存関係からのクラス/メンバーのリンクが解決されなくなります。
        </p>
        <p>
            注意: 取得したファイルをローカルにキャッシュし、ローカルパスとしてDokkaに提供することができます。
            <code>externalDocumentationLinks</code> セクションを参照してください。
        </p>
        <p>デフォルト: <code>false</code></p>
    </def>
    <def title="sourceDirectories">
        <p>
            解析およびドキュメント化されるソースコードのルート。
            ディレクトリまたは個別の <code>.kt</code> / <code>.java</code> ファイルを指定できます。
        </p>
        <p>デフォルト: <code>{project.compileSourceRoots}</code></p>
    </def>
    <def title="documentedVisibilities">
        <p>ドキュメント化する可視性修飾子のセット。</p>
        <p>
            <code>protected</code>/<code>internal</code>/<code>private</code> 宣言をドキュメント化したい場合や、
            <code>public</code> 宣言を除外して内部APIのみをドキュメント化したい場合に使用できます。
        </p>
        <p>パッケージごとに設定することも可能です。</p>
        <p>デフォルト: <code>PUBLIC</code></p>
    </def>
    <def title="reportUndocumented">
        <p>
            <code>documentedVisibilities</code> やその他のフィルタによってフィルタリングされた後、
            KDocがない可視宣言（ドキュメント化されていない宣言）について警告を出すかどうか。
        </p>
        <p>この設定は <code>failOnWarning</code> と組み合わせて使用すると効果的です。</p>
        <p>これはパッケージレベルで上書きできます。</p>
        <p>デフォルト: <code>false</code></p>
    </def>
    <def title="skipDeprecated">
        <p><code>@Deprecated</code> アノテーションが付いた宣言をドキュメント化するかどうか。</p>
        <p>これはパッケージレベルで上書きできます。</p>
        <p>デフォルト: <code>false</code></p>
    </def>
    <def title="skipEmptyPackages">
        <p>
            さまざまなフィルタが適用された後、表示可能な宣言を含まないパッケージをスキップするかどうか。
        </p>
        <p>
            例えば、<code>skipDeprecated</code> が <code>true</code> に設定されており、パッケージに非推奨の宣言しか含まれていない場合、そのパッケージは空であると見なされます。
        </p>
        <p>デフォルト: <code>true</code></p>
    </def>
    <def title="suppressedFiles">
        <p>
            除外（抑制）するディレクトリまたは個別のファイル。これらの宣言はドキュメント化されません。
        </p>
    </def>
    <def title="suppressAnnotatedWith">
        <p>指定されたアノテーションが付加された宣言を除外するための、アノテーション完全修飾名（FQN）のリスト。</p>
        <p>
            これらのアノテーションのいずれかが付加された宣言は、生成されるドキュメントから除外されます。
        </p>
    </def>
    <def title="jdkVersion">
        <p>Java型の外部リンクを生成する際に使用するJDKバージョン。</p>
        <p>
            例えば、公開宣言のシグネチャで <code>java.util.UUID</code> を使用しており、
            このオプションが <code>8</code> に設定されている場合、Dokkaは
            <a href="https://docs.oracle.com/javase/8/docs/api/java/util/UUID.html">JDK 8 Javadocs</a> への外部リンクを生成します。
        </p>
        <p>デフォルト: JDK 8</p>
    </def>
    <def title="languageVersion">
        <p>
            解析および <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a>
            環境の設定に使用される <a href="https://kotlinlang.org/docs/compatibility-modes.html">Kotlin言語バージョン</a>。
        </p>
        <p>デフォルトでは、Dokka의 組み込みコンパイラで使用可能な最新の言語バージョンが使用されます。</p>
    </def>
    <def title="apiVersion">
        <p>
            解析および <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a>
            環境の設定に使用される <a href="https://kotlinlang.org/docs/compatibility-modes.html">Kotlin APIバージョン</a>。
        </p>
        <p>デフォルトでは、<code>languageVersion</code> から推論されます。</p>
    </def>
    <def title="noStdlibLink">
        <p>
            Kotlin標準ライブラリのAPIリファレンスドキュメントへの外部リンクを生成するかどうか。
        </p>
        <p>注意: <code>noStdLibLink</code> が <code>false</code> に設定されている場合、リンクは生成<b>されます</b>。</p>
        <p>デフォルト: <code>false</code></p>
    </def>
    <def title="noJdkLink">
    <anchor name="includes"/>
        <p>JDKのJavadocへの外部リンクを生成するかどうか。</p>
        <p>JDK Javadocsのバージョンは <code>jdkVersion</code> オプションによって決定されます。</p>
        <p>注意: <code>noJdkLink</code> が <code>false</code> に設定されている場合、リンクは生成<b>されます</b>。</p>
        <p>デフォルト: <code>false</code></p>
    </def>
    <def title="includes">
        <p>
            <a href="dokka-module-and-package-docs.md">モジュールおよびパッケージのドキュメント</a> を含む 
            Markdownファイルのリスト。
        </p>
        <p>指定されたファイルの内容が解析され、モジュールおよびパッケージの説明としてドキュメントに埋め込まれます。</p>
    </def>
    <def title="classpath">
        <p>解析およびインタラクティブサンプルのためのクラスパス。</p>
        <p>
            依存関係にある一部の型が自動的に解決/取得されない場合に便利です。
            このオプションは <code>.jar</code> と <code>.klib</code> の両方のファイルを受け入れます。
        </p>
        <p>デフォルト: <code>{project.compileClasspathElements}</code></p>
    </def>
    <def title="samples">
        <p>
            <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample KDocタグ</a> 
            を介して参照されるサンプル関数を含むディレクトリまたはファイルのリスト。
        </p>
    </def>
</deflist>

### ソースリンク設定 {id="source-link-configuration"}

`sourceLinks` 設定ブロックを使用すると、各シグネチャに特定の行番号を持つ `url` への `source` リンクを追加できます。（行番号は `lineSuffix` を設定することでカスタマイズ可能です）。

これにより、読者が各宣言のソースコードを見つけやすくなります。

例については、`kotlinx.coroutines` の [`count()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/count.html) 関数のドキュメントを参照してください。

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
            ローカルソースディレクトリへのパス。パスは現在のモジュールのルートからの相対パスである必要があります。
        </p>
        <p>
            注意: Unixベースのパスのみが許可されます。Windowsスタイルのパスはエラーをスローします。
        </p>
    </def>
    <def title="url">
        <p>
            GitHub、GitLab、Bitbucketなど、ドキュメントの読者がアクセスできるソースコードホスティングサービスのURL。このURLは、宣言のソースコードリンクを生成するために使用されます。
        </p>
    </def>
    <def title="lineSuffix">
        <p>
            URLにソースコードの行番号を追加するために使用されるサフィックス。これにより、読者はファイルだけでなく、宣言の特定の行番号に移動できるようになります。
        </p>
        <p>
            番号自体は、指定されたサフィックスの後に追加されます。例えば、このオプションが <code>#L</code> に設定され、行番号が 10 の場合、結果のURLサフィックスは <code>#L10</code> になります。
        </p>
        <p>
            主要なサービスで使用されるサフィックス:</p>
            <list>
            <li>GitHub: <code>#L</code></li>
            <li>GitLab: <code>#L</code></li>
            <li>Bitbucket: <code>#lines-</code></li>
            </list>
    </def>
</deflist>

### 外部ドキュメントリンク設定 {id="external-documentation-links-configuration"}

`externalDocumentationLinks` ブロックを使用すると、依存関係の外部でホストされているドキュメントへのリンクを作成できます。

例えば、`kotlinx.serialization` の型を使用している場合、デフォルトではドキュメント内でそれらは解決されず、クリックできない状態になります。しかし、`kotlinx.serialization` の API リファレンスドキュメントは Dokka でビルドされ、[kotlinlang.org で公開](https://kotlinlang.org/api/kotlinx.serialization/)されているため、それに対する外部ドキュメントリンクを設定できます。これにより、Dokka はそのライブラリの型のリンクを生成し、正常に解決してクリック可能にすることができます。

デフォルトでは、Kotlin 標準ライブラリと JDK の外部ドキュメントリンクが設定されています。

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
        <p>リンク先のドキュメントのルートURL。末尾にスラッシュ（<code>/</code>）を含める<b>必要があります</b>。</p>
        <p>
            Dokka は、指定された URL に対して <code>package-list</code> を自動的に探し、宣言をリンクさせるために最善を尽くします。
        </p>
        <p>
            自動解決が失敗する場合や、代わりにローカルにキャッシュされたファイルを使用したい場合は、<code>packageListUrl</code> オプションの設定を検討してください。
        </p>
    </def>
    <def title="packageListUrl">
        <p>
            <code>package-list</code> の正確な場所。これは Dokka による自動解決に頼る代わりの方法です。
        </p>
        <p>
            パッケージリストには、モジュール名やパッケージ名など、ドキュメントやプロジェクト自体に関する情報が含まれています。
        </p>
        <p>ネットワーク通信を避けるために、ローカルにキャッシュされたファイルを指定することも可能です。</p>
    </def>
</deflist>

### パッケージオプション {id="package-options"}

`perPackageOptions` 設定ブロックでは、`matchingRegex` に一致する特定のパッケージに対してオプションを設定できます。

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
        <p>パッケージのマッチングに使用される正規表現。</p>
        <p>デフォルト: <code>.*</code></p>
 </def>
    <def title="suppress">
        <p>ドキュメント生成時にこのパッケージをスキップするかどうか。</p>
        <p>デフォルト: <code>false</code></p>
    </def>
    <def title="documentedVisibilities">
        <p>ドキュメント化する可視性修飾子のセット。</p>
        <p>
            このパッケージ内の <code>protected</code>/<code>internal</code>/<code>private</code> 宣言をドキュメント化したい場合や、
            <code>public</code> 宣言を除外して内部APIのみをドキュメント化したい場合に使用できます。
        </p>
        <p>デフォルト: <code>PUBLIC</code></p>
    </def>
    <def title="skipDeprecated">
        <p><code>@Deprecated</code> アノテーションが付いた宣言をドキュメント化するかどうか。</p>
        <p>これはプロジェクト/モジュールレベルで設定できます。</p>
        <p>デフォルト: <code>false</code></p>
    </def>
    <def title="reportUndocumented">
        <p>
            <code>documentedVisibilities</code> やその他のフィルタによってフィルタリングされた後、
            KDocがない可視宣言（ドキュメント化されていない宣言）について警告を出すかどうか。
        </p>
        <p>この設定は <code>failOnWarning</code> と組み合わせて使用すると効果的です。</p>
        <p>デフォルト: <code>false</code></p>
    </def>
</deflist>

### すべての設定を適用した例 {id="complete-configuration"}

以下に、可能なすべての設定オプションを同時に適用した例を示します。

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
