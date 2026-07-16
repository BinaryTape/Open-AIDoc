[//]: # (title: Kotlin 1.4.20 の新機能)

<web-summary>新しい言語機能、Kotlin マルチプラットフォーム、JVM、Native、JS への更新、および Gradle と Maven のビルドツールサポートを含む Kotlin 1.4.20 のリリースノートをお読みください。</web-summary>

_[リリース日: 2020 年 11 月 23 日](releases.md#release-history)_

Kotlin 1.4.20 では、多くの新しい実験的な機能が導入され、1.4.0 で追加されたものを含む既存の機能の修正と改善が行われています。

新機能の詳細な例については、[こちらのブログ記事](https://blog.jetbrains.com/kotlin/2020/11/kotlin-1-4-20-released/)でもご確認いただけます。

> Kotlin のリリースサイクルに関する情報は、[Kotlin のリリースプロセス](releases.md)をご覧ください。
>
{style="tip"}

## Kotlin/JVM

Kotlin/JVM の改善は、最新の Java バージョンの機能に対応することを目的としています。

- [Java 15 ターゲット](#java-15-target)
- [invokedynamic による文字列連結](#invokedynamic-string-concatenation)

### Java 15 ターゲット

Java 15 が Kotlin/JVM のターゲットとして利用可能になりました。

### invokedynamic による文字列連結

> `invokedynamic` による文字列連結は[実験的](components-stability.md)な機能です。予告なく変更または削除される可能性があります。使用するにはオプトインが必要です（詳細は以下を参照）。評価目的でのみ使用してください。 [YouTrack](https://youtrack.jetbrains.com/issues/KT) へのフィードバックをお待ちしております。
>
{style="warning"}

Kotlin 1.4.20 では、JVM 9+ ターゲットにおいて文字列連結を [dynamic invocations](https://docs.oracle.com/javase/7/docs/technotes/guides/vm/multiple-language-support.html#invokedynamic) にコンパイルできるようになり、パフォーマンスが向上します。

現在、この機能は実験的であり、以下のケースをカバーしています：
- 演算子形式 (`a + b`)、明示的呼び出し (`a.plus(b)`)、およびリファレンス形式 (`(a::plus)(b)`) での `String.plus`。
- インラインクラスおよびデータクラスの `toString`。
- 単一の非定数引数を持つものを除く文字列テンプレート（[KT-42457](https://youtrack.jetbrains.com/issue/KT-42457) を参照）。

`invokedynamic` による文字列連結を有効にするには、`-Xstring-concat` コンパイラオプションを追加し、以下の値のいずれかを指定します。
- `indy-with-constants`: [StringConcatFactory.makeConcatWithConstants()](https://docs.oracle.com/javase/9/docs/api/java/lang/invoke/StringConcatFactory.html#makeConcatWithConstants-java.lang.invoke.MethodHandles.Lookup-java.lang.String-java.lang.invoke.MethodType-java.lang.String-java.lang.Object...-) を使用して文字列の `invokedynamic` 連結を行います。
- `indy`: [StringConcatFactory.makeConcat()](https://docs.oracle.com/javase/9/docs/api/java/lang/invoke/StringConcatFactory.html#makeConcat-java.lang.invoke.MethodHandles.Lookup-java.lang.String-java.lang.invoke.MethodType-) を使用して文字列の `invokedynamic` 連結を行います。
- `inline`: `StringBuilder.append()` による従来の連結に戻します。

## Kotlin/JS

Kotlin/JS は急速に進化を続けており、1.4.20 ではいくつかの実験的な機能と改善が行われています。

- [Gradle DSL の変更](#gradle-dsl-changes)
- [新しいウィザードテンプレート](#new-wizard-templates)
- [IR コンパイラでのコンパイルエラーの無視](#ignoring-compilation-errors-with-ir-compiler)

### Gradle DSL の変更

Kotlin/JS の Gradle DSL には、プロジェクトのセットアップとカスタマイズを簡素化するいくつかのアップデートが行われました。これには、webpack 設定の調整、自動生成される `package.json` ファイルの変更、および推移的依存関係の制御の向上が含まれます。

#### webpack 設定の単一ポイント

ブラウザターゲット向けに、新しい設定ブロック `commonWebpackConfig` が利用可能になりました。この中で、`webpackTask`、`runTask`、`testTask` の設定を重複させることなく、1 か所から共通の設定を調整できます。

3 つのタスクすべてでデフォルトで CSS サポートを有効にするには、プロジェクトの `build.gradle(.kts)` に以下のスニペットを追加します。

```groovy
browser {
    commonWebpackConfig {
        cssSupport.enabled = true
    }
    binaries.executable()
}
```

[webpack バンドリングの設定](js-project-setup.md#webpack-bundling)についての詳細はこちらをご覧ください。

#### Gradle からの package.json カスタマイズ

Kotlin/JS のパッケージ管理と配布をより詳細に制御するために、Gradle DSL を介してプロジェクトファイル [`package.json`](https://nodejs.dev/learn/the-package-json-guide) にプロパティを追加できるようになりました。

`package.json` にカスタムフィールドを追加するには、コンパイルの `packageJson` ブロック内で `customField` 関数を使用します。

```kotlin
kotlin {
    js(BOTH) {
        compilations["main"].packageJson {
            customField("hello", mapOf("one" to 1, "two" to 2))
        }
    }
}
```

[`package.json` のカスタマイズ](js-project-setup.md#package-json-customization)についての詳細はこちらをご覧ください。

#### Yarn の選択的依存関係解決

> Yarn の選択的依存関係解決のサポートは[実験的](components-stability.md)です。予告なく変更または削除される可能性があります。評価目的でのみ使用してください。[YouTrack](https://youtrack.jetbrains.com/issues/KT) へのフィードバックをお待ちしております。
>
{style="warning"}

Kotlin 1.4.20 では、依存しているパッケージの依存関係を上書きする仕組みである Yarn の[選択的依存関係解決 (selective dependency resolutions)](https://classic.yarnpkg.com/en/docs/selective-version-resolutions/) を設定する方法が提供されます。

これは、Gradle の `YarnPlugin` 内にある `YarnRootExtension` を通じて使用できます。プロジェクトで解決されるパッケージのバージョンに影響を与えるには、`resolution` 関数を使用し、パッケージ名セレクター（Yarn で指定されているもの）と解決先のバージョンを渡します。

```kotlin
rootProject.plugins.withType<YarnPlugin> {
    rootProject.the<YarnRootExtension>().apply {
        resolution("react", "16.0.0")
        resolution("processor/decamelize", "3.0.0")
    }
}
```

ここでは、`react` を必要とする *すべて* の npm 依存関係がバージョン `16.0.0` を受け取り、`processor` はその依存関係である `decamelize` をバージョン `3.0.0` として受け取ります。

#### きめ細かなワークスペースの無効化

> きめ細かな（granular）ワークスペースの無効化は[実験的](components-stability.md)です。予告なく変更または削除される可能性があります。評価目的でのみ使用してください。[YouTrack](https://youtrack.jetbrains.com/issues/KT) へのフィードバックをお待ちしております。
>
{style="warning"}

ビルド時間を短縮するため、Kotlin/JS Gradle プラグインは特定の Gradle タスクに必要な依存関係のみをインストールします。たとえば、`webpack-dev-server` パッケージは、`*Run` タスクのいずれかを実行したときにのみインストールされ、assemble タスクを実行したときにはインストールされません。このような動作は、複数の Gradle プロセスを並行して実行する場合に問題を引き起こす可能性があります。依存関係の要件が衝突すると、2 つの npm パッケージのインストールがエラーの原因になることがあります。

この問題を解決するために、Kotlin 1.4.20 には、これら「きめ細かなワークスペース（granular workspaces）」を無効にするオプションが含まれています。この機能は現在、Gradle の `YarnPlugin` 内の `YarnRootExtension` を通じて利用可能です。これを使用するには、`build.gradle.kts` ファイルに以下のスニペットを追加します。

```kotlin
rootProject.plugins.withType<YarnPlugin> {
    rootProject.the<YarnRootExtension>().disableGranularWorkspaces()
}
```

### 新しいウィザードテンプレート

プロジェクト作成時により便利なカスタマイズ方法を提供するため、Kotlin プロジェクトウィザードに Kotlin/JS アプリケーション用の新しいテンプレートが追加されました。
- **Browser Application** - ブラウザで動作する最小限の Kotlin/JS Gradle プロジェクト。
- **React Application** - 適切な `kotlin-wrappers` を使用する React アプリ。スタイルシート、ナビゲーションコンポーネント、または状態コンテナの統合を有効にするオプションを提供します。
- **Node.js Application** - Node.js ランタイムで動作する最小限のプロジェクト。実験的な `kotlinx-nodejs` パッケージを直接含めるオプションが付属しています。

### IR コンパイラでのコンパイルエラーの無視

> 「コンパイルエラーを無視する」モードは[実験的](components-stability.md)です。予告なく変更または削除される可能性があります。使用するにはオプトインが必要です（詳細は以下を参照）。評価目的でのみ使用してください。[YouTrack](https://youtrack.jetbrains.com/issues/KT) へのフィードバックをお待ちしております。
>
{style="warning"}

Kotlin/JS 用の [IR コンパイラ](js-ir-compiler.md)に、新しい実験的モード「エラーありでのコンパイル」が導入されました。このモードでは、コードにエラーが含まれていても実行することができます。たとえば、アプリケーション全体がまだ完成していない状態で、特定の部分を試したい場合などに便利です。

このモードには 2 つの許容ポリシーがあります。
- `SEMANTIC`: コンパイラは、構文的には正しいが意味的に正しくないコード（例: `val x: String = 3`）を受け入れます。
- `SYNTAX`: コンパイラは、構文エラーを含むコードであっても、あらゆるコードを受け入れます。

エラーありでのコンパイルを許可するには、`-Xerror-tolerance-policy=` コンパイラオプションに上記の値のいずれかを追加します。

[Kotlin/JS IR コンパイラの詳細はこちら](js-ir-compiler.md)。

## Kotlin/Native

1.4.20 における Kotlin/Native の優先事項は、パフォーマンスと既存機能のブラッシュアップです。主な改善点は以下の通りです。

- [エスケープ解析](#escape-analysis)
- [パフォーマンスの向上とバグ修正](#performance-improvements-and-bug-fixes)
- [Objective-C 例外のラッピングのオプトイン](#opt-in-wrapping-of-objective-c-exceptions)
- [CocoaPods プラグインの改善](#cocoapods-plugin-improvements)
- [Xcode 12 ライブラリのサポート](#support-for-xcode-12-libraries)

### エスケープ解析

> エスケープ解析の仕組みは[実験的](components-stability.md)です。予告なく変更または削除される可能性があります。評価目的でのみ使用してください。[YouTrack](https://youtrack.jetbrains.com/issues/KT) へのフィードバックをお待ちしております。
>
{style="warning"}

Kotlin/Native に新しい[エスケープ解析 (escape analysis)](https://ja.wikipedia.org/wiki/%E3%82%A8%E3%82%B9%E3%82%B1%E3%83%BC%E3%83%97%E8%A7%A3%E6%9E%90) メカニズムのプロトタイプが導入されました。これにより、特定のオブジェクトをヒープではなくスタックに割り当てることで、ランタイムパフォーマンスが向上します。このメカニズムは、ベンチマークで平均 10% のパフォーマンス向上を示しており、プログラムをさらに高速化できるよう改善を続けています。

エスケープ解析は、リリースビルド（`-opt` コンパイラオプションを使用）の個別のコンパイルフェーズとして実行されます。

エスケープ解析フェーズを無効にしたい場合は、`-Xdisable-phases=EscapeAnalysis` コンパイラオプションを使用してください。

### パフォーマンスの向上とバグ修正

Kotlin/Native は、1.4.0 で追加された[コード共有メカニズム](https://kotlinlang.org/docs/multiplatform/multiplatform-share-on-platforms.html#share-code-on-similar-platforms)を含む、さまざまなコンポーネントでパフォーマンスの向上とバグ修正が行われました。

### Objective-C 例外のラッピングのオプトイン

> Objective-C 例外のラッピングメカニズムは[実験的](components-stability.md)です。予告なく変更または削除される可能性があります。使用するにはオプトインが必要です（詳細は以下を参照）。評価目的でのみ使用してください。[YouTrack](https://youtrack.jetbrains.com/issues/KT) へのフィードバックをお待ちしております。
>
{style="warning"}

Kotlin/Native で、プログラムのクラッシュを避けるために、実行時に Objective-C コードからスローされた例外を処理できるようになりました。

`NSException` を `ForeignException` 型の Kotlin 例外にラップするようにオプトインできます。これらは元の `NSException` への参照を保持しているため、根本原因に関する情報を取得し、適切に処理することができます。

Objective-C 例外のラッピングを有効にするには、`cinterop` 呼び出しで `-Xforeign-exception-mode objc-wrap` オプションを指定するか、`.def` ファイルに `foreignExceptionMode = objc-wrap` プロパティを追加します。[CocoaPods 統合](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-overview.html)を使用している場合は、依存関係の `pod {}` ビルドスクリプトブロックで次のようにオプションを指定します。

```kotlin
pod("foo") {
    extraOpts = listOf("-Xforeign-exception-mode", "objc-wrap")
}
```

デフォルトの動作は変更されません。Objective-C コードから例外がスローされるとプログラムは終了します。

### CocoaPods プラグインの改善

Kotlin 1.4.20 では、CocoaPods 統合の一連の改善が続けられています。具体的には、以下の新機能を試すことができます。

- [タスク実行の改善](#improved-task-execution)
- [DSL の拡張](#extended-dsl)
- [Xcode との統合の更新](#updated-integration-with-xcode)

#### タスク実行の改善

CocoaPods プラグインのタスク実行フローが改善されました。たとえば、新しい CocoaPods 依存関係を追加しても、既存の依存関係は再ビルドされません。ターゲットを追加しても、既存ターゲットの依存関係の再ビルドには影響しません。

#### DSL の拡張

Kotlin プロジェクトに [CocoaPods](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-overview.html) 依存関係を追加するための DSL に新しい機能が追加されました。

ローカル Pod や CocoaPods リポジトリの Pod に加えて、以下の種類のライブラリへの依存関係を追加できるようになりました。
* カスタム spec リポジトリのライブラリ。
* Git リポジトリのリモートライブラリ。
* アーカイブからのライブラリ（任意の HTTP アドレスからも利用可能）。
* スタティックライブラリ。
* カスタム cinterop オプションを持つライブラリ。

Kotlin プロジェクトでの [CocoaPods 依存関係の追加](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-libraries.html)についての詳細はこちらをご覧ください。
例については、[Kotlin with CocoaPods サンプル](https://github.com/Kotlin/kmm-with-cocoapods-sample)を参照してください。

#### Xcode との統合の更新

Xcode で正しく動作させるために、Kotlin はいくつかの Podfile の変更を必要とします。

* Kotlin Pod に Git、HTTP、または specRepo Pod の依存関係がある場合は、それらを Podfile にも指定する必要があります。
* カスタム spec からライブラリを追加する場合、Podfile の冒頭に specs の[場所 (location)](https://guides.cocoapods.org/syntax/podfile.html#source) も指定する必要があります。

統合エラーの詳細な説明が IntelliJ IDEA に表示されるようになりました。Podfile に問題がある場合、すぐに修正方法を知ることができます。

[Kotlin Pod の作成](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-xcode.html)についての詳細はこちらをご覧ください。

### Xcode 12 ライブラリのサポート

Xcode 12 に同梱されている新しいライブラリのサポートを追加しました。Kotlin コードからこれらを使用できるようになりました。

## Kotlin マルチプラットフォーム

### マルチプラットフォームライブラリ公開構造の更新

Kotlin 1.4.20 から、個別のメタデータ公開は行われなくなりました。メタデータアーティファクトは、ライブラリ全体を表す *ルート（root）* 公開に含まれるようになり、共通ソースセット（common source set）への依存関係として追加されたときに、適切なプラットフォーム固有のアーティファクトに自動的に解決されます。

[マルチプラットフォームライブラリの公開](https://kotlinlang.org/docs/multiplatform/multiplatform-publish-lib-setup.html)についての詳細はこちらをご覧ください。

#### 旧バージョンとの互換性

この構造の変更により、[階層的プロジェクト構造 (hierarchical project structure)](https://kotlinlang.org/docs/multiplatform/multiplatform-share-on-platforms.html#share-code-on-similar-platforms) を持つプロジェクト間の互換性が失われます。マルチプラットフォームプロジェクトとそれが依存するライブラリの両方が階層的プロジェクト構造を持っている場合、それらを同時に Kotlin 1.4.20 以降に更新する必要があります。Kotlin 1.4.20 で公開されたライブラリは、以前のバージョンで公開されたプロジェクトからは利用できません。

階層的プロジェクト構造を持たないプロジェクトとライブラリについては、互換性が維持されます。

## 標準ライブラリ

Kotlin 1.4.20 の標準ライブラリでは、ファイルを操作するための新しい拡張機能とパフォーマンスの向上が提供されています。

- [java.nio.file.Path の拡張関数](#extensions-for-java-nio-file-path)
- [String.replace 関数のパフォーマンス向上](#improved-string-replace-function-performance)

### java.nio.file.Path の拡張関数

> `java.nio.file.Path` の拡張関数は[実験的](components-stability.md)です。予告なく変更または削除される可能性があります。使用するにはオプトインが必要です（詳細は以下を参照）。評価目的でのみ使用してください。[YouTrack](https://youtrack.jetbrains.com/issues/KT) へのフィードバックをお待ちしております。
>
{style="warning"}

標準ライブラリで `java.nio.file.Path` の実験的な拡張関数が提供されるようになりました。モダンな JVM ファイル API を Kotlin らしい方法で扱うことができ、`kotlin.io` パッケージの `java.io.File` 拡張関数の使用感に似ています。

```kotlin
// div (/) 演算子でパスを構築
val baseDir = Path("/base")
val subDir = baseDir / "subdirectory" 

// ディレクトリ内のファイルをリストアップ
val kotlinFiles: `List<Path>` = Path("/home/user").listDirectoryEntries("*.kt")
```

これらの拡張関数は、`kotlin-stdlib-jdk7` モジュールの `kotlin.io.path` パッケージで利用可能です。拡張関数を使用するには、実験的アノテーション `@ExperimentalPathApi` に[オプトイン](opt-in-requirements.md)してください。

### String.replace 関数のパフォーマンス向上

`String.replace()` の新しい実装により、関数の実行が高速化されました。
大文字小文字を区別するバリアントは `indexOf` に基づく手動の置換ループを使用し、大文字小文字を区別しないバリアントは正規表現マッチングを使用します。

## Kotlin Android Extensions

1.4.20 では、Kotlin Android Extensions プラグインが非推奨（deprecated）となり、`Parcelable` 実装ジェネレーターは別のプラグインに移動しました。

- [シンセティックビューの非推奨化](#deprecation-of-synthetic-views)
- [Parcelable 実装ジェネレーター用の新しいプラグイン](#new-plugin-for-parcelable-implementation-generator)

### シンセティックビューの非推奨化

UI 要素とのやり取りを簡素化しボイラープレートを削減するために、少し前に Kotlin Android Extensions プラグインで「シンセティックビュー (Synthetic views)」が導入されました。現在、Google は同様のことを行うネイティブな仕組みである Android Jetpack の[ビューバインディング (view bindings)](https://developer.android.com/topic/libraries/view-binding) を提供しており、それに伴いシンセティックビューを非推奨にします。

`kotlin-android-extensions` から Parcelable 実装ジェネレーターを抽出し、残りの部分であるシンセティックビューの非推奨化サイクルを開始します。現時点では、非推奨の警告とともに動作し続けます。将来的に、プロジェクトを別のソリューションに切り替える必要があります。Android プロジェクトをシンセティックからビューバインディングに移行するのに役立つ[ガイドライン](https://goo.gle/kotlin-android-extensions-deprecation)はこちらです。

### Parcelable 実装ジェネレーター用の新しいプラグイン

`Parcelable` 実装ジェネレーターは、新しい `kotlin-parcelize` プラグインで利用可能になりました。`kotlin-android-extensions` の代わりにこのプラグインを適用してください。

>`kotlin-parcelize` と `kotlin-android-extensions` を 1 つのモジュールに同時に適用することはできません。
>
{style="note"}

`@Parcelize` アノテーションは `kotlinx.parcelize` パッケージに移動しました。

`Parcelable` 実装ジェネレーターについての詳細は [Android のドキュメント](https://developer.android.com/kotlin/parcelize)をご覧ください。