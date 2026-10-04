[//]: # (title: Maven プロジェクト用の Kotlin コンパイラを設定する)

`kotlin-maven-plugin` を使用すると、Maven プロジェクト用の Kotlin コンパイラを設定できます。
コンパイラオプションの指定、実行戦略の選択、インクリメンタルコンパイル（増分コンパイル）の有効化が可能です。

## コンパイラオプションの指定 {id="specify-compiler-options"}

Kotlin Maven プラグインノードの `<configuration>` セクション内の要素として、コンパイラの追加オプションや引数を指定できます。

```xml
<plugin>
    <groupId>org.jetbrains.kotlin</groupId>
    <artifactId>kotlin-maven-plugin</artifactId>
    <version>${kotlin.version}</version>
    <extensions>true</extensions> <!-- ビルドへの実行（executions）の自動追加を有効にする場合 -->
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

多くのオプションはプロパティを介して設定することも可能です。

```xml
<project>
    <properties>
        <kotlin.compiler.languageVersion>%languageVersion%</kotlin.compiler.languageVersion>
    </properties>
</project>
```

以下の属性がサポートされています。

### JVM 固有の属性 {id="attributes-specific-to-jvm"}

| 名前 | プロパティ名 | 説明 | 指定可能な値 | デフォルト値 |
|-------------------|-----------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------|-----------------------------|
| `nowarn`          |                                   | 警告を生成しない | true, false                                                              | false                       |
| `languageVersion` | `kotlin.compiler.languageVersion` | 指定されたバージョンの Kotlin とのソース互換性を提供する | "2.0", "2.1", "2.2", "2.3", "2.4", "2.5" (EXPERIMENTAL)                  |                             |
| `apiVersion`      | `kotlin.compiler.apiVersion`      | バンドルされたライブラリの指定されたバージョンからの宣言のみを使用可能にする | "2.0", "2.1", "2.2", "2.3", "2.4", "2.5" (EXPERIMENTAL)                  |                             |
| `sourceDirs`      |                                   | コンパイル対象のソースファイルを含むディレクトリ |                                                                          | プロジェクトのソースルート |
| `compilerPlugins` |                                   | 有効化されたコンパイラプラグイン |                                                                          | []                          |
| `pluginOptions`   |                                   | コンパイラプラグインのオプション |                                                                          | []                          |
| `args`            |                                   | 追加のコンパイラ引数 |                                                                          | []                          |
| `jvmTarget`       | `kotlin.compiler.jvmTarget`       | 生成されるバイトコードのターゲット JVM バージョン。出力のバイトコードバージョンのみを制御し、コードで使用できる JDK API は制限しません。 | "1.8", "9", "10", ..., "26"                                              | "%defaultJvmTargetVersion%" |
| `jdkRelease`      | `kotlin.compiler.jdkRelease`      | ターゲット JVM バージョン。バイトコードバージョンを制御し、利用可能な API を指定された JDK バージョンに制限することで、新しい API の誤用を防ぎます。Java の `--release` コンパイラオプションと同等です。 | "1.8", "9", "10", ..., "26"                                              |                             |
| `jdkHome`         | `kotlin.compiler.jdkHome`         | デフォルトの `JAVA_HOME` の代わりに、指定した場所のカスタム JDK をクラスパスに含める |                                                                          |                             |
| `jdkToolchain`    | `kotlin.compiler.jdkToolchain`    | ツールチェーンから使用する JDK バージョンを設定します。Kotlin のコンパイルにのみ影響します |                                                                          |                             |
| `-Xadd-modules`   |                                   | (実験的) 初期モジュールに加えて、指定されたルートモジュールを解決します。モジュールパス上のすべてのモジュールに解決するには `ALL-MODULE-PATH` 値を設定します。 | `<arg>` を介して渡されるカンマ区切りのモジュール名または `ALL-MODULE-PATH` |                             |

## 実行戦略の選択 {id="choose-execution-strategy"}

<snippet id="maven-configure-execution-strategy">

デフォルトでは、Maven は Kotlin デーモンコンパイラ実行戦略を使用します。「インプロセス（in process）」戦略に切り替えるには、`pom.xml` ファイルで次のプロパティを設定します。

```xml
<properties>
    <kotlin.compiler.daemon>false</kotlin.compiler.daemon>
</properties>
```

</snippet>

さまざまな戦略の詳細については、[コンパイラ実行戦略](compiler-execution-strategy.md)を参照してください。

## インクリメンタルコンパイルの有効化 {id="enable-incremental-compilation"}

ビルドを高速化するために、`kotlin.compiler.incremental` プロパティを追加してインクリメンタルコンパイルを有効にすることができます。

```xml
<properties>
    <kotlin.compiler.incremental>true</kotlin.compiler.incremental>
</properties>
```

または、`-Dkotlin.compiler.incremental=true` オプションを指定してビルドを実行します。

## 次のステップ {id="what-s-next"}

[プロジェクトのパッケージ化](maven-compile-package.md)