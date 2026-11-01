[//]: # (title: Mavenプロジェクト用のKotlinコンパイラを設定する)

`kotlin-maven-plugin` を使用すると、Mavenプロジェクト用にKotlinコンパイラを設定できます。
コンパイラオプションの指定、実行戦略の選択、インクリメンタルコンパイルの有効化が可能です。

## コンパイラオプションを指定する {id="specify-compiler-options"}

Kotlin Mavenプラグインノードの `<configuration>` セクション内の要素として、コンパイラの追加オプションや引数を指定できます。

```xml
<plugin>
    <groupId>org.jetbrains.kotlin</groupId>
    <artifactId>kotlin-maven-plugin</artifactId>
    <version>${kotlin.version}</version>
    <extensions>true</extensions> <!-- ビルドへの実行の自動追加を有効にしたい場合 -->
    <executions>...</executions>
    <configuration>
        <nowarn>true</nowarn> <!-- 警告を無効化 -->
        <args>
            <arg>-Xjsr305=strict</arg> <!-- JSR-305アノテーションの厳格モードを有効化 -->
            ...
        </args>
    </configuration>
</plugin>
```

多くのオプションはプロパティ経由で設定することもできます。

```xml
<project>
    <properties>
        <kotlin.compiler.languageVersion>%languageVersion%</kotlin.compiler.languageVersion>
    </properties>
</project>
```

以下の属性がサポートされています：

### JVM固有の属性 {id="attributes-specific-to-jvm"}

| 名前 | プロパティ名 | 説明 | 指定可能な値 | デフォルト値 |
|---|---|---|---|---|
| `nowarn` | | 警告を生成しない | true, false | false |
| `languageVersion` | `kotlin.compiler.languageVersion` | 指定されたバージョンのKotlinとのソース互換性を提供する | "2.0", "2.1", "2.2", "2.3", "2.4", "2.5" (EXPERIMENTAL) | |
| `apiVersion` | `kotlin.compiler.apiVersion` | バンドルされたライブラリの指定されたバージョンからの宣言のみを使用できるようにする | "2.0", "2.1", "2.2", "2.3", "2.4", "2.5" (EXPERIMENTAL) | |
| `sourceDirs` | | コンパイルするソースファイルを含むディレクトリ | | プロジェクトのソースルート |
| `compilerPlugins` | | 有効にするコンパイラプラグイン | | [] |
| `pluginOptions` | | コンパイラプラグイン用のオプション | | [] |
| `args` | | 追加のコンパイラ引数 | | [] |
| `jvmTarget` | `kotlin.compiler.jvmTarget` | 生成されるバイトコードのターゲットJVMバージョン。出力のバイトコードバージョンのみを制御し、コードが使用できるJDK APIは制限しません。 | "1.8", "9", "10", ..., "26" | "%defaultJvmTargetVersion%" |
| `jdkRelease` | `kotlin.compiler.jdkRelease` | ターゲットJVMバージョン。バイトコードバージョンを制御し、利用可能なAPIを指定されたJDKバージョンに制限することで、新しいAPIの誤用を防ぎます。Javaの `--release` コンパイラオプションと同等です。 | "1.8", "9", "10", ..., "26" | |
| `jdkHome` | `kotlin.compiler.jdkHome` | デフォルトの `JAVA_HOME` の代わりに、指定された場所のカスタムJDKをクラスパスに含める | | |
| `jdkToolchain` | `kotlin.compiler.jdkToolchain` | ツールチェーンから使用するJDKバージョンを設定する。Kotlinのコンパイルにのみ影響します | | |
| `-Xadd-modules` | | (実験的) 初期モジュールに加えて、指定されたルートモジュールを解決する。モジュールパス上のすべてのモジュールに解決するには `ALL-MODULE-PATH` の値を設定します。 | カンマ区切りのモジュール名、または `<arg>` 経由で渡される `ALL-MODULE-PATH` | |

JVM固有のオプションが相互にどのように影響し合うかに注意してください：

* `jvmTarget` を明示的に設定しない場合、Kotlin Mavenプラグインは `jdkRelease` の値を使用します。`jdkRelease` も設定されていない場合は、デフォルトの `%defaultJvmTargetVersion%` バージョンを使用します。
* コンパイラが使用するJDKは `jdkHome` オプションによって定義されます。`jdkHome` を明示的に設定しない場合、Kotlin MavenプラグインはツールチェーンのJDKを `jdkHome` としてコンパイラに渡します。[ツールチェーンのJDK](maven-configure-project.md#set-jdk-version) は `maven-toolchains-plugin` または `jdkToolchain` オプションで指定できます。明示的な `jdkHome` の値は常にツールチェーンよりも優先されます。
* `jdkHome` オプションもツールチェーンも、`jvmTarget` オプションには影響しません。

## 実行戦略を選択する {id="choose-execution-strategy"}

<snippet id="maven-configure-execution-strategy">

デフォルトでは、MavenはKotlinデーモンコンパイラ実行戦略を使用します。「in process」戦略に切り替えるには、`pom.xml` ファイルで次のプロパティを設定します：

```xml
<properties>
    <kotlin.compiler.daemon>false</kotlin.compiler.daemon>
</properties>
```

</snippet>

さまざまな戦略の詳細については、[コンパイラ実行戦略](compiler-execution-strategy.md) を参照してください。

## インクリメンタルコンパイルを有効にする {id="enable-incremental-compilation"}

ビルドを高速化するために、`kotlin.compiler.incremental` プロパティを追加してインクリメンタルコンパイルを有効にすることができます：

```xml
<properties>
    <kotlin.compiler.incremental>true</kotlin.compiler.incremental>
</properties>
```

または、`-Dkotlin.compiler.incremental=true` オプションを指定してビルドを実行します。

## 利用可能なゴールとパラメータを確認する {id="explore-available-goals-and-parameters"}

IDEでは、`pom.xml` ファイル内のKotlin Mavenプラグイン宣言から、利用可能なゴールとそのパラメータに関する情報が含まれている生成されたプラグイン記述子へと移動できます。

また、コマンドラインから標準のMaven Helpプラグインを使用してこの情報を取得することもできます。
プロジェクトの `pom.xml` ファイルが含まれているディレクトリから、以下を実行します：

```bash
mvn help:describe \
  -Dplugin=org.jetbrains.kotlin:kotlin-maven-plugin \
  -Ddetail=true
```

出力には、利用可能なすべてのゴールと、そのパラメータに関する詳細情報が一覧表示されます。

特定のゴールの説明を取得するには、`-Dgoal` オプションを追加します。たとえば、`compile` ゴールの場合は次を実行します：

```bash
mvn help:describe \
  -Dplugin=org.jetbrains.kotlin:kotlin-maven-plugin \
  -Ddetail=true \
  -Dgoal=compile
```

## 次のステップ {id="what-s-next"}

[プロジェクトをパッケージ化する](maven-compile-package.md)