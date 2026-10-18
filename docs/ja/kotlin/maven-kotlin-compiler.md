[//]: # (title: Maven プロジェクト向け Kotlin コンパイラーの設定)

`kotlin-maven-plugin` を使用すると、Maven プロジェクトの Kotlin コンパイラーを設定できます。
コンパイラーオプションの指定、実行戦略の選択、インクリメンタルコンパイルの有効化などが可能です。

## コンパイラーオプションの指定 {id="specify-compiler-options"}

Kotlin Maven プラグインノードの `<configuration>` セクション内の要素として、コンパイラー用の追加オプションや引数を指定できます。

```xml
<plugin>
    <groupId>org.jetbrains.kotlin</groupId>
    <artifactId>kotlin-maven-plugin</artifactId>
    <version>${kotlin.version}</version>
    <extensions>true</extensions> <!-- ビルドへの実行（executions）の自動追加を有効にしたい場合 -->
    <executions>...</executions>
    <configuration>
        <nowarn>true</nowarn> <!-- 警告を無効化 -->
        <args>
            <arg>-Xjsr305=strict</arg> <!-- JSR-305 アノテーションの strict モードを有効化 -->
            ...
        </args>
    </configuration>
</plugin>
```

オプションの多くは、プロパティを介して設定することもできます。

```xml
<project>
    <properties>
        <kotlin.compiler.languageVersion>%languageVersion%</kotlin.compiler.languageVersion>
    </properties>
</project>
```

以下の属性がサポートされています：

### JVM 固有の属性 {id="attributes-specific-to-jvm"}

| 名前              | プロパティ名                     | 説明                                                                                                                                                                                             | 設定可能な値                                                          | デフォルト値               |
|-------------------|-----------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------|-----------------------------|
| `nowarn`          |                                   | 警告を生成しない                                                                                                                                                                                    | true, false                                                              | false                       |
| `languageVersion` | `kotlin.compiler.languageVersion` | 指定されたバージョンの Kotlin とのソース互換性を提供する                                                                                                                                       | "2.0", "2.1", "2.2", "2.3", "2.4", "2.5" (EXPERIMENTAL)                  |                             |
| `apiVersion`      | `kotlin.compiler.apiVersion`      | バンドルされたライブラリのうち、指定されたバージョンの宣言のみを使用できるようにする                                                                                                                           | "2.0", "2.1", "2.2", "2.3", "2.4", "2.5" (EXPERIMENTAL)                  |                             |
| `sourceDirs`      |                                   | コンパイル対象のソースファイルを含むディレクトリ                                                                                                                                                  |                                                                          | プロジェクトのソースルート    |
| `compilerPlugins` |                                   | 有効にするコンパイラープラグイン                                                                                                                                                                                |                                                                          | []                          |
| `pluginOptions`   |                                   | コンパイラープラグインのオプション                                                                                                                                                                            |                                                                          | []                          |
| `args`            |                                   | 追加のコンパイラー引数                                                                                                                                                                           |                                                                          | []                          |
| `jvmTarget`       | `kotlin.compiler.jvmTarget`       | 生成されるバイトコードのターゲット JVM バージョン。出力のバイトコードバージョンのみを制御し、コードが使用できる JDK API は制限しません。                                                  | "1.8", "9", "10", ..., "26"                                              | "%defaultJvmTargetVersion%" |
| `jdkRelease`      | `kotlin.compiler.jdkRelease`      | ターゲット JVM バージョン。バイトコードバージョンを制御し、利用可能な API を指定された JDK バージョンに制限して、新しい API の意図しない使用を防ぎます。Java の `--release` コンパイラーオプションと同等です。 | "1.8", "9", "10", ..., "26"                                              |                             |
| `jdkHome`         | `kotlin.compiler.jdkHome`         | デフォルトの `JAVA_HOME` の代わりに、指定された場所にあるカスタム JDK をクラスパスに含める                                                                                                  |                                                                          |                             |
| `jdkToolchain`    | `kotlin.compiler.jdkToolchain`    | ツールチェーンから使用する JDK バージョンを設定する。Kotlin のコンパイルにのみ影響します                                                                                                                          |                                                                          |                             |
| `-Xadd-modules`   |                                   | （実験的）初期モジュールに加えて、指定されたルートモジュールを解決する。モジュールパス上のすべてのモジュールに解決するには、値に `ALL-MODULE-PATH` を設定します。                                     | カンマ区切りのモジュール名、または `<arg>` 経由で渡される `ALL-MODULE-PATH` |                             |

## 実行戦略の選択 {id="choose-execution-strategy"}

<snippet id="maven-configure-execution-strategy">

デフォルトでは、Maven は Kotlin デーモンコンパイラー実行戦略を使用します。「in process」戦略に切り替えるには、`pom.xml` ファイルで次のプロパティを設定します。

```xml
<properties>
    <kotlin.compiler.daemon>false</kotlin.compiler.daemon>
</properties>
```

</snippet>

さまざまな戦略の詳細については、[コンパイラー実行戦略](compiler-execution-strategy.md)を参照してください。

## インクリメンタルコンパイルの有効化 {id="enable-incremental-compilation"}

ビルドを高速化するために、`kotlin.compiler.incremental` プロパティを追加してインクリメンタルコンパイルを有効にすることができます。

```xml
<properties>
    <kotlin.compiler.incremental>true</kotlin.compiler.incremental>
</properties>
```

または、`-Dkotlin.compiler.incremental=true` オプションを指定してビルドを実行します。

## 利用可能なゴールとパラメーターの確認 {id="explore-available-goals-and-parameters"}

IDE では、`pom.xml` ファイル内の Kotlin Maven プラグイン宣言から、利用可能なゴールとそのパラメーターに関する情報が含まれている生成されたプラグイン記述子（plugin descriptor）へ移動できます。

また、コマンドラインから標準の Maven Help プラグインを使用してこの情報を取得することもできます。
プロジェクトの `pom.xml` ファイルがあるディレクトリから、次を実行します。

```bash
mvn help:describe \
  -Dplugin=org.jetbrains.kotlin:kotlin-maven-plugin \
  -Ddetail=true
```

出力には、利用可能なすべてのゴールと、そのパラメーターに関する詳細情報が一覧表示されます。

特定のゴールの説明を取得するには、`-Dgoal` オプションを追加します。たとえば、`compile` ゴールの場合は次を実行します。

```bash
mvn help:describe \
  -Dplugin=org.jetbrains.kotlin:kotlin-maven-plugin \
  -Ddetail=true \
  -Dgoal=compile
```

## 次のステップ {id="what-s-next"}

[プロジェクトのパッケージ化](maven-compile-package.md)