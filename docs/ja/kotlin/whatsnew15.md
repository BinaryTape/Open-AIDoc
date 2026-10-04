[//]: # (title: Kotlin 1.5.0 の新機能)

<web-summary>新しい言語機能、Kotlin Multiplatform、JVM、Native、JS のアップデート、Gradle および Maven のビルドツールサポートなどを網羅した Kotlin 1.5.0 のリリースノートをご覧ください。</web-summary>

_[リリース日: 2021年5月5日](releases.md#release-history)_

Kotlin 1.5.0 では、新しい言語機能、安定版となった IR ベースの JVM コンパイラバックエンド、パフォーマンスの改善、そして実験的機能の安定化や古い機能の非推奨化といった発展的な変更が導入されています。

変更の概要については、[リリースのブログ記事](https://blog.jetbrains.com/kotlin/2021/05/kotlin-1-5-0-released/)でも確認できます。

> Kotlin のリリースサイクルに関する詳細については、[Kotlin のリリースプロセス](releases.md)を参照してください。
>
{style="tip"}

## 言語機能 {id="language-features"}

Kotlin 1.5.0 では、[1.4.30 でプレビュー](whatsnew1430.md#language-features)として提供されていた新しい言語機能の安定版（Stable）が導入されました。
* [JVM Record のサポート](#jvm-records-support)
* [シールドインターフェース](#sealed-interfaces)と[シールドクラスの改善](#package-wide-sealed-class-hierarchies)
* [インラインクラス](#inline-classes)

これらの機能の詳細な説明は、[こちらのブログ記事](https://blog.jetbrains.com/kotlin/2021/02/new-language-features-preview-in-kotlin-1-4-30/)および Kotlin ドキュメントの該当ページで確認できます。

### JVM Record のサポート {id="jvm-records-support"}

Java は急速に進化しており、Kotlin が Java との相互運用性を維持できるようにするために、Java の最新機能の1つである [Record クラス](https://openjdk.java.net/jeps/395)のサポートを導入しました。

Kotlin による JVM Record のサポートには、双方向の相互運用性が含まれます。
* Kotlin コードでは、プロパティを持つ通常のクラスと同じように Java の Record クラスを使用できます。
* Java コードで Kotlin のクラスを Record として使用するには、そのクラスを `data` クラスにして `@JvmRecord` アノテーションを付与します。

```kotlin
@JvmRecord
data class User(val name: String, val age: Int)
```

[Kotlin での JVM Record の使用について詳細を見る](jvm-records.md)。

<video src="https://www.youtube.com/v/iyEWXyuuseU" title="Kotlin 1.5.0 での JVM Record のサポート"/>

### シールドインターフェース {id="sealed-interfaces"}

Kotlin のインターフェースで `sealed` 修飾子が使用できるようになりました。これはクラスの場合と同様に動作し、シールドインターフェースのすべての実装はコンパイル時に既知となります。

```kotlin
sealed interface Polygon
```

この仕様を利用して、たとえば網羅的な `when` 式を記述できます。

```kotlin
fun draw(polygon: Polygon) = when (polygon) {
   is Rectangle -> // ...
   is Triangle -> // ...
   // すべての可能な実装がカバーされているため else は不要
}

```

さらに、クラスは複数のシールドインターフェースを直接継承できるため、シールドインターフェースによって、より柔軟に制限されたクラス階層を構築できます。

```kotlin
class FilledRectangle: Polygon, Fillable
```

[シールドインターフェースについて詳細を見る](sealed-classes.md)。

<video src="https://www.youtube.com/v/d_Mor21W_60" title="シールドインターフェースとシールドクラスの改善"/>

### パッケージ全体のシールドクラス階層 {id="package-wide-sealed-class-hierarchies"}

シールドクラスは、同一のコンパイルユニットかつ同一のパッケージ内にあるすべてのファイルでサブクラスを持てるようになりました。これまでは、すべてのサブクラスが同じファイル内に存在する必要がありました。

直接のサブクラスは、トップレベルに配置することも、任意の数の他の名前付きクラス、名前付きインターフェース、または名前付きオブジェクトの内部にネストすることもできます。

シールドクラスのサブクラスには、適切に修飾された名前が必要です。ローカルオブジェクトや匿名オブジェクトにすることはできません。

[シールドクラスの階層について詳細を見る](sealed-classes.md#inheritance)。

### インラインクラス {id="inline-classes"}

インラインクラスは、値のみを保持する[値ベース（Value-based）](https://github.com/Kotlin/KEEP/blob/master/notes/value-classes.md)クラスのサブセットです。メモリ割り当てによる追加のオーバーヘッドを発生させることなく、特定の値のラッパーとして使用できます。

インラインクラスは、クラス名の前に `value` 修飾子を付けて宣言できます。

```kotlin
value class Password(val s: String)
```

JVM バックエンドでは、さらに特別な `@JvmInline` アノテーションも必要です。

```kotlin
@JvmInline
value class Password(val s: String)
```

従来の `inline` 修飾子は非推奨となり、警告が表示されるようになりました。

[インラインクラスについて詳細を見る](inline-classes.md)。

<video src="https://www.youtube.com/v/LpqvtgibbsQ" title="インラインクラスから値クラスへ"/>

## Kotlin/JVM {id="kotlin-jvm"}

Kotlin/JVM には、内部的な改善とユーザー向けの改善の両方が多数施されました。主な変更点は以下のとおりです。

* [安定版となった JVM IR バックエンド](#stable-jvm-ir-backend)
* [新しいデフォルト JVM ターゲット: 1.8](#new-default-jvm-target-1-8)
* [invokedynamic 経由の SAM アダプター](#sam-adapters-via-invokedynamic)
* [invokedynamic 経由のラムダ式](#lambdas-via-invokedynamic)
* [@JvmDefault および古い Xjvm-default モードの非推奨化](#deprecation-of-jvmdefault-and-old-xjvm-default-modes)
* [Null 許容性アノテーションの処理の改善](#improvements-to-handling-nullability-annotations)

### 安定版となった JVM IR バックエンド {id="stable-jvm-ir-backend"}

Kotlin/JVM コンパイラの [IR ベースのバックエンド](whatsnew14.md#new-jvm-ir-backend)が[安定版（Stable）](components-stability.md)となり、デフォルトで有効になりました。

[Kotlin 1.4.0](whatsnew14.md) から、IR ベースのバックエンドの初期バージョンがプレビューとして利用可能でしたが、言語バージョン `1.5` からこれがデフォルトになりました。以前の言語バージョンでは、引き続き古いバックエンドがデフォルトで使用されます。

IR バックエンドの利点と今後の開発に関する詳細は、[こちらのブログ記事](https://blog.jetbrains.com/kotlin/2021/02/the-jvm-backend-is-in-beta-let-s-make-it-stable-together/)で確認できます。

Kotlin 1.5.0 で古いバックエンドを使用する必要がある場合は、プロジェクトの設定ファイルに以下の記述を追加できます。

* Gradle の場合:

 <tabs group="build-script">
 <tab title="Kotlin" group-key="kotlin">

 ```kotlin
 tasks.withType<org.jetbrains.kotlin.gradle.dsl.KotlinJvmCompile> {
   kotlinOptions.useOldBackend = true
 }
 ```

 </tab>
 <tab title="Groovy" group-key="groovy">

 ```groovy
 tasks.withType(org.jetbrains.kotlin.gradle.dsl.KotlinJvmCompile) {
  kotlinOptions.useOldBackend = true
 }
 ```

 </tab>
 </tabs>

* Maven の場合:

 ```xml
 <configuration>
     <args>
         <arg>-Xuse-old-backend</arg>
     </args>
 </configuration>
 ```

### 新しいデフォルト JVM ターゲット: 1.8 {id="new-default-jvm-target-1-8"}

Kotlin/JVM コンパイルのデフォルトのターゲットバージョンが `1.8` になりました。ターゲット `1.6` は非推奨です。

JVM 1.6 向けのビルドが必要な場合は、引き続きこのターゲットに切り替えることができます。切り替え方法については以下を参照してください。

* [Gradle での設定](gradle-compiler-options.md#attributes-specific-to-jvm)
* [Maven での設定](maven-kotlin-compiler.md#attributes-specific-to-jvm)
* [コマンドラインコンパイラでの設定](compiler-reference.md#jvm-target-version)

### invokedynamic 経由の SAM アダプター {id="sam-adapters-via-invokedynamic"}

Kotlin 1.5.0 では、SAM（Single Abstract Method）変換のコンパイルに動的呼び出し（`invokedynamic`）が使用されるようになりました。
* SAM 型が [Java インターフェース](java-interop.md#sam-conversions)である場合、任意の式に対して適用されます
* SAM 型が [Kotlin ファンクショナルインターフェース](fun-interfaces.md#sam-conversions)である場合、ラムダ式に対して適用されます

新しい実装では [`LambdaMetafactory.metafactory()`](https://docs.oracle.com/javase/8/docs/api/java/lang/invoke/LambdaMetafactory.html#metafactory-java.lang.invoke.MethodHandles.Lookup-java.lang.String-java.lang.invoke.MethodType-java.lang.invoke.MethodType-java.lang.invoke.MethodHandle-java.lang.invoke.MethodType-) が使用され、コンパイル時に補助的なラッパークラスが生成されなくなります。これによりアプリケーションの JAR ファイルのサイズが削減され、JVM の起動パフォーマンスが向上します。

匿名クラスの生成に基づく古い実装方式に戻すには、コンパイラオプション `-Xsam-conversions=class` を追加します。

コンパイラオプションの追加方法については、[Gradle](gradle-compiler-options.md)、[Maven](maven-kotlin-compiler.md#specify-compiler-options)、および[コマンドラインコンパイラ](compiler-reference.md#compiler-options)を参照してください。

### invokedynamic 経由のラムダ式 {id="lambdas-via-invokedynamic"}

> 通常の Kotlin ラムダ式の invokedynamic へのコンパイルは[実験的（Experimental）](components-stability.md)です。いつでも廃止または変更される可能性があります。
> オプトインが必要です（詳細は下記を参照）。評価目的でのみ使用してください。ご意見やフィードバックは [YouTrack](https://youtrack.jetbrains.com/issue/KT-45375) でお待ちしています。
>
{style="warning"}

Kotlin 1.5.0 では、通常の Kotlin ラムダ式（ファンクショナルインターフェースのインスタンスに変換されないもの）を動的呼び出し（`invokedynamic`）にコンパイルする実験的サポートが導入されています。この実装では [`LambdaMetafactory.metafactory()`](https://docs.oracle.com/javase/8/docs/api/java/lang/invoke/LambdaMetafactory.html#metafactory-java.lang.invoke.MethodHandles.Lookup-java.lang.String-java.lang.invoke.MethodType-java.lang.invoke.MethodType-java.lang.invoke.MethodHandle-java.lang.invoke.MethodType-) を使用し、実行時に必要なクラスを効率的に生成することで、より軽量なバイナリを生成します。現在のところ、通常のラムダ式のコンパイルと比較して以下の3つの制限があります。

* invokedynamic にコンパイルされたラムダ式はシリアライズ（直列化）できません。
* そのようなラムダ式に対して `toString()` を呼び出すと、可読性の低い文字列形式が生成されます。
* 実験的な [`reflect`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect.jvm/reflect.html) API は、`LambdaMetafactory` で作成されたラムダ式をサポートしていません。

この機能を試すには、`-Xlambdas=indy` コンパイラオプションを追加してください。フィードバックがある場合は、この [YouTrack チケット](https://youtrack.jetbrains.com/issue/KT-45375) で共有していただけると幸いです。

コンパイラオプションの追加方法については、[Gradle](gradle-compiler-options.md)、[Maven](maven-kotlin-compiler.md#specify-compiler-options)、および[コマンドラインコンパイラ](compiler-reference.md#compiler-options)を参照してください。

### @JvmDefault および古い Xjvm-default モードの非推奨化 {id="deprecation-of-jvmdefault-and-old-xjvm-default-modes"}

Kotlin 1.4.0 より前には、`@JvmDefault` アノテーションと、`-Xjvm-default=enable` および `-Xjvm-default=compatibility` モードが存在していました。これらは、Kotlin インターフェース内の特定の非抽象メンバーに対して JVM デフォルトメソッドを作成する役割を果たしていました。

Kotlin 1.4.0 では、プロジェクト全体でデフォルトメソッドの生成を有効にする[新しい `Xjvm-default` モードを導入しました](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-m3-generating-default-methods-in-interfaces/)。

Kotlin 1.5.0 では、`@JvmDefault` と古い Xjvm-default モード（`-Xjvm-default=enable` および `-Xjvm-default=compatibility`）を非推奨とします。

[Java 相互運用におけるデフォルトメソッドの詳細を見る](java-to-kotlin-interop.md#default-methods-in-interfaces)。

### Null 許容性アノテーションの処理の改善 {id="improvements-to-handling-nullability-annotations"}

Kotlin は、[Null 許容性（Nullability）アノテーション](java-interop.md#nullability-annotations)による Java からの型の Null 許容性情報の処理をサポートしています。Kotlin 1.5.0 では、この機能に関して多くの改善が導入されています。

* 依存関係として使用されている、コンパイル済み Java ライブラリ内の型引数に対する Null 許容性アノテーションを読み取ります。
* 以下の対象について、ターゲットが `TYPE_USE` である Null 許容性アノテーションをサポートします。
  * 配列
  * 可変長引数（Varargs）
  * フィールド
  * 型パラメータとその境界
  * 基本クラスおよびインターフェースの型引数
* Null 許容性アノテーションが型に適用可能な複数のターゲットを持っており、そのターゲットの1つが `TYPE_USE` である場合、`TYPE_USE` が優先されます。
  たとえば、`@Nullable` が `TYPE_USE` と `METHOD` の両方をターゲットとしてサポートしている場合、メソッドシグネチャ `@Nullable String[] f()` は `fun f(): Array<String?>!` になります。

これら新しくサポートされたケースにおいて、Kotlin から Java を呼び出す際に誤った型の Null 許容性を使用すると警告が発生します。
これらのケースで厳格モード（エラー報告を伴う）を有効にするには、`-Xtype-enhancement-improvements-strict-mode` コンパイラオプションを使用してください。

[Null 安全性とプラットフォーム型の詳細を見る](java-interop.md#null-safety-and-platform-types)。

## Kotlin/Native {id="kotlin-native"}

Kotlin/Native のパフォーマンスと安定性が向上しました。主な変更点は以下のとおりです。
* [パフォーマンスの改善](#performance-improvements)
* [メモリリークチェッカーの無効化](#deactivation-of-the-memory-leak-checker)

### パフォーマンスの改善 {id="performance-improvements"}

1.5.0 において、Kotlin/Native はコンパイルと実行の両方を高速化する一連のパフォーマンス改善を受けました。

`linuxX64`（Linux ホスト上のみ）および `iosArm64` ターゲットのデバッグモードで、[コンパイラキャッシュ](https://blog.jetbrains.com/kotlin/2020/03/kotlin-1-3-70-released/#kotlin-native)がサポートされるようになりました。コンパイラキャッシュを有効にすると、初回を除き、ほとんどのデバッグコンパイルが大幅に高速化されます。テストプロジェクトでの測定では、約200%の速度向上が見られました。

新しいターゲットでコンパイラキャッシュを使用するには、プロジェクトの `gradle.properties` に以下の行を追加してオプトインします。
* `linuxX64` の場合: `kotlin.native.cacheKind.linuxX64=static`
* `iosArm64` の場合: `kotlin.native.cacheKind.iosArm64=static`

コンパイラキャッシュを有効にした後に問題が発生した場合は、課題トラッカー [YouTrack](https://kotl.in/issue) までご報告ください。

その他の改善により、Kotlin/Native コードの実行も高速化されています。
* 単純なプロパティアクセサーがインライン化されます。
* 文字列リテラルに対する `trimIndent()` がコンパイル時に評価されるようになります。

### メモリリークチェッカーの無効化 {id="deactivation-of-the-memory-leak-checker"}

Kotlin/Native に組み込まれていたメモリリークチェッカーが、デフォルトで無効になりました。

これはもともと内部利用のために設計されたものであり、リークを発見できるのは限定されたケースのみで、すべてを検出できるわけではありませんでした。さらに、後になってアプリケーションのクラッシュを引き起こす可能性のある問題があることが判明しました。そのため、メモリリークチェッカーを無効にすることを決定しました。

メモリリークチェッカーは、単体テストなどの特定のケースでは依然として有用な場合があります。そのような場合は、以下のコード行を追加することで有効にできます。

```kotlin
Platform.isMemoryLeakCheckerActive = true
```

なお、アプリケーションのランタイム向けにこのチェッカーを有効にすることは推奨されません。

## Kotlin/JS {id="kotlin-js"}

Kotlin/JS は 1.5.0 で進化的な変化を遂げています。[JS IR コンパイラバックエンド](js-ir-compiler.md)の安定化に向けた作業を継続しつつ、その他のアップデートも提供しています。

* [webpack バージョン 5 へのアップグレード](#upgrade-to-webpack-5)
* [IR コンパイラ向けフレームワークとライブラリ](#frameworks-and-libraries-for-the-ir-compiler)

### webpack 5 へのアップグレード {id="upgrade-to-webpack-5"}

Kotlin/JS Gradle プラグインは、ブラウザターゲットにおいて webpack 4 の代わりに webpack 5 を使用するようになりました。これは非互換な変更を伴うメジャーな webpack のアップグレードです。カスタムの webpack 設定を使用している場合は、必ず [webpack 5 リリースノート](https://webpack.js.org/blog/2020-10-10-webpack-5-release/)を確認してください。

[webpack を使用した Kotlin/JS プロジェクトのバンドルについて詳細を見る](js-project-setup.md#webpack-bundling)。

### IR コンパイラ向けフレームワークとライブラリ {id="frameworks-and-libraries-for-the-ir-compiler"}

> Kotlin/JS IR コンパイラは [Alpha](components-stability.md) です。将来的に互換性のない変更が行われ、手動での移行が必要になる可能性があります。フィードバックは [YouTrack](https://youtrack.jetbrains.com/issues/KT) でお待ちしています。
>
{style="warning"}

Kotlin/JS コンパイラの IR ベースバックエンドの開発と並行して、ライブラリの作者がプロジェクトを `both` モードでビルドすることを推奨し、支援しています。これにより、両方の Kotlin/JS コンパイラ向けにアーティファクトを生成できるようになり、新しいコンパイラ向けのエコシステムが拡大します。

[KVision](https://kvision.io/)、[fritz2](https://www.fritz2.dev/)、[doodle](https://github.com/nacular/doodle) など、多くの著名なフレームワークやライブラリがすでに IR バックエンドに対応しています。プロジェクトでこれらを使用している場合は、すでに IR バックエンドでビルドして、そのメリットを体験できます。

独自のライブラリを作成している場合は、クライアントが新しいコンパイラでも利用できるように、'both' モードでコンパイルしてください。

## Kotlin Multiplatform {id="kotlin-multiplatform"}

Kotlin 1.5.0 では、[プラットフォームごとのテスト依存関係の選択が簡素化され](#simplified-test-dependencies-usage-in-multiplatform-projects)、Gradle プラグインによって自動的に処理されるようになりました。

マルチプラットフォームプロジェクトで[文字のカテゴリを取得するための新しい API も利用可能になりました](#new-api-for-getting-a-char-category-now-available-in-multiplatform-code)。

## 標準ライブラリ {id="standard-library"}

標準ライブラリには、実験的パーツの安定化から新機能の追加まで、さまざまな変更と改善が加えられました。

* [安定版となった符号なし整数型](#stable-unsigned-integer-types)
* [安定版となったロケール非依存の大文字/小文字変換 API](#stable-locale-agnostic-api-for-upper-lowercasing-text)
* [安定版となった Char から整数への変換 API](#stable-char-to-integer-conversion-api)
* [安定版となった Path API](#stable-path-api)
* [切り捨て除算と mod 演算子](#floored-division-and-the-mod-operator)
* [Duration API の変更](#duration-api-changes)
* [マルチプラットフォームコードで利用可能になった文字カテゴリ取得の新 API](#new-api-for-getting-a-char-category-now-available-in-multiplatform-code)
* [新しいコレクション関数 firstNotNullOf()](#new-collections-function-firstnotnullof)
* [String?.toBoolean() の厳格バージョン](#strict-version-of-string-toboolean)

標準ライブラリの変更点についての詳細は、[こちらのブログ記事](https://blog.jetbrains.com/kotlin/2021/04/kotlin-1-5-0-rc-released)で確認できます。

<video src="https://www.youtube.com/v/MyTkiT2I6-8" title="新しい標準ライブラリの機能"/>

### 安定版となった符号なし整数型 {id="stable-unsigned-integer-types"}

`UInt`、`ULong`、`UByte`、`UShort` の符号なし整数型が[安定版（Stable）](components-stability.md)になりました。これらの型に対する演算、範囲（range）、プログレッション（progression）も同様に安定版となりました。符号なし配列およびそれらに対する操作は Beta のままです。

[符号なし整数型の詳細を見る](unsigned-integer-types.md)。

### 安定版となったロケール非依存の大文字/小文字変換 API {id="stable-locale-agnostic-api-for-upper-lowercasing-text"}

本リリースでは、大文字/小文字テキスト変換用のロケール非依存（locale-agnostic）な新しい API が導入されました。これは、ロケールに影響される `toLowerCase()`、`toUpperCase()`、`capitalize()`、`decapitalize()` API 関数の代替手段を提供します。新しい API は、ロケール設定の違いによるエラーを回避するのに役立ちます。

Kotlin 1.5.0 では、完全に[安定版（Stable）](components-stability.md)となった以下の代替手段を提供します。

* `String` 関数の場合:

  |**以前のバージョン**|**1.5.0 の代替**|
  | --- | --- |
  |`String.toUpperCase()`|`String.uppercase()`|
  |`String.toLowerCase()`|`String.lowercase()`|
  |`String.capitalize()`|`String.replaceFirstChar { it.uppercase() }`|
  |`String.decapitalize()`|`String.replaceFirstChar { it.lowercase() }`|

* `Char` 関数の場合:

  |**以前のバージョン**|**1.5.0 の代替**|
  | --- | --- |
  |`Char.toUpperCase()`|`Char.uppercaseChar(): Char`<br/>`Char.uppercase(): String`|
  |`Char.toLowerCase()`|`Char.lowercaseChar(): Char`<br/>`Char.lowercase(): String`|
  |`Char.toTitleCase()`|`Char.titlecaseChar(): Char`<br/>`Char.titlecase(): String`|

> Kotlin/JVM には、明示的な `Locale` パラメータを持つオーバーロードされた `uppercase()`、`lowercase()`、`titlecase()` 関数もあります。
>
{style="note"}

古い API 関数には非推奨のマークが付けられ、将来のリリースで削除される予定です。

テキスト処理関数の変更点の一覧については、[KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/stdlib/locale-agnostic-case-conversions.md) を参照してください。

### 安定版となった Char から整数への変換 API {id="stable-char-to-integer-conversion-api"}

Kotlin 1.5.0 から、新しい文字からコード（文字コード）および文字から数字（桁）への変換関数が[安定版（Stable）](components-stability.md)になりました。これらの関数は、類似した文字列から Int への変換と混同されがちだった従来の API 関数を置き換えるものです。

新しい API ではこの名前の混乱が解消され、コードの挙動がより明確で曖昧さのないものになります。

本リリースでは、明確に命名された以下の関数セットに分割された `Char` 変換が導入されます。

* `Char` の整数コードを取得する関数、および指定されたコードから `Char` を構築する関数:

 ```kotlin
 fun Char(code: Int): Char
 fun Char(code: UShort): Char
 val Char.code: Int
 ```

* `Char` をそれが表す数字の数値に変換する関数:

 ```kotlin
 fun Char.digitToInt(radix: Int): Int
 fun Char.digitToIntOrNull(radix: Int): Int?
 ```

* `Int` が表す非負の1桁の数値を、対応する `Char` 表現に変換する拡張関数:

 ```kotlin
 fun Int.digitToChar(radix: Int): Char
 ```

`Int.toChar()` を除くすべての実装を含む `Number.toChar()` や、`Char.toInt()` のような数値型への変換のための `Char` 拡張関数を含む古い変換 API は非推奨になりました。

[KEEP での Char から整数への変換 API の詳細を見る](https://github.com/Kotlin/KEEP/blob/master/proposals/stdlib/char-int-conversions.md)。

### 安定版となった Path API {id="stable-path-api"}

`java.nio.file.Path` の拡張関数を含む[実験的だった Path API](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.io.path/java.nio.file.-path/) が[安定版（Stable）](components-stability.md)になりました。

```kotlin
// div (/) 演算子を使用してパスを構築
val baseDir = Path("/base")
val subDir = baseDir / "subdirectory"

// ディレクトリ内のファイルを一覧表示
val kotlinFiles: List<Path> = Path("/home/user").listDirectoryEntries("*.kt")
```

[Path API について詳細を見る](whatsnew1420.md#extensions-for-java-nio-file-path)。

### 切り捨て除算と mod 演算子 {id="floored-division-and-the-mod-operator"}

剰余演算のための新しい演算が標準ライブラリに追加されました。
* `floorDiv()` は[切り捨て除算（floored division）](https://en.wikipedia.org/wiki/Floor_and_ceiling_functions)の結果を返します。整数型で利用可能です。
* `mod()` は切り捨て除算の余り（_modulus_）を返します。すべての数値型で利用可能です。

これらの操作は、既存の[整数の除算](numbers.md#integer-division)や [rem()](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-int/rem.html) 関数（または `%` 演算子）とよく似ていますが、負の数に対する動作が異なります。
* `a.floorDiv(b)` は通常の `/` と異なり、結果を切り捨てます（より小さい整数に向かって丸めます）。一方 `/` は 0 に近いほうの整数へ切り捨てます（truncate）。
* `a.mod(b)` は `a` と `a.floorDiv(b) * b` の差です。結果はゼロになるか、`b` と同じ符号を持ちます。一方 `a % b` は異なる符号になることがあります。

```kotlin
fun main() {
//sampleStart
    println("Floored division -5/3: ${(-5).floorDiv(3)}")
    println( "Modulus: ${(-5).mod(3)}")
    
    println("Truncated division -5/3: ${-5 / 3}")
    println( "Remainder: ${-5 % 3}")
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5"}

### Duration API の変更 {id="duration-api-changes"}

> Duration API は[実験的（Experimental）](components-stability.md)です。いつでも廃止または変更される可能性があります。
> 評価目的でのみ使用してください。ご意見やフィードバックは [YouTrack](https://youtrack.jetbrains.com/issues/KT) でお待ちしています。
>
{style="warning"}

さまざまな時間単位で期間の量を表す実験的な [Duration](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/) クラスがあります。1.5.0 では、Duration API に以下の変更が加えられました。

* 精度を向上させるため、内部の値の表現に `Double` ではなく `Long` を使用するようになりました。
* `Long` で特定の時間単位に変換するための新しい API が用意されました。これは `Double` 値を操作していた古い API（非推奨となりました）を置き換えるものです。たとえば、[`Duration.inWholeMinutes`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/in-whole-minutes.html) は期間の値を `Long` として返し、`Duration.inMinutes` を置き換えます。
* 数値から `Duration` を構築するための新しいコンパニオン関数が追加されました。たとえば、[`Duration.seconds(Int)`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/seconds.html) は整数の秒数を表す `Duration` オブジェクトを作成します。`Int.seconds` などの古い拡張プロパティは非推奨になりました。

```kotlin
import kotlin.time.Duration
import kotlin.time.ExperimentalTime

@ExperimentalTime
fun main() {
//sampleStart
    val duration = Duration.milliseconds(120000)
    println("There are ${duration.inWholeSeconds} seconds in ${duration.inWholeMinutes} minutes")
//sampleEnd
}
```
{validate="false"}

### マルチプラットフォームコードで利用可能になった文字カテゴリ取得の新 API {id="new-api-for-getting-a-char-category-now-available-in-multiplatform-code"}

Kotlin 1.5.0 では、マルチプラットフォームプロジェクトにおいて、Unicode に準拠した文字のカテゴリを取得するための新しい API が導入されました。すべてのプラットフォームおよび共通コードでいくつかの関数が利用可能になりました。

文字が文字（letter）か数字（digit）かを判定する関数:
* [`Char.isDigit()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/is-digit.html)
* [`Char.isLetter()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/is-letter.html)
* [`Char.isLetterOrDigit()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/is-letter-or-digit.html)

```kotlin
fun main() {
//sampleStart
    val chars = listOf('a', '1', '+')
    val (letterOrDigitList, notLetterOrDigitList) = chars.partition { it.isLetterOrDigit() }
    println(letterOrDigitList) // [a, 1]
    println(notLetterOrDigitList) // [+]
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5"}

文字の大文字/小文字を判定する関数:
* [`Char.isLowerCase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/is-lower-case.html)
* [`Char.isUpperCase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/is-upper-case.html)
* [`Char.isTitleCase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/is-title-case.html)

```kotlin
fun main() {
//sampleStart
    val chars = listOf('ǅ', 'ǈ', 'ǋ', 'ǲ', '1', 'A', 'a', '+')
    val (titleCases, notTitleCases) = chars.partition { it.isTitleCase() }
    println(titleCases) // [ǅ, ǈ, ǋ, ǲ]
    println(notTitleCases) // [1, A, a, +]
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5"}

その他の関数:
* [`Char.isDefined()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/is-defined.html)
* [`Char.isISOControl()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/is-i-s-o-control.html)

プロパティ [`Char.category`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/category.html) およびその戻り値の型である enum クラス [`CharCategory`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-char-category/)（Unicode に準拠した文字の一般的なカテゴリを示します）も、マルチプラットフォームプロジェクトで利用できるようになりました。

[文字について詳細を見る](characters.md)。

### 新しいコレクション関数 firstNotNullOf() {id="new-collections-function-firstnotnullof"}

新しい [`firstNotNullOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-not-null-of.html) および [`firstNotNullOfOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-not-null-of-or-null.html) 関数は、[`mapNotNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-not-null.html) を [`first()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first.html) または [`firstOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-or-null.html) と組み合わせたものです。
これらは元のコレクションをカスタムセレクター関数でマッピングし、最初の null ではない値を返します。該当する値が存在しない場合、`firstNotNullOf()` は例外をスローし、`firstNotNullOfOrNull()` は null を返します。

```kotlin
fun main() {
//sampleStart
    val data = listOf("Kotlin", "1.5")
    println(data.firstNotNullOf(String::toDoubleOrNull))
    println(data.firstNotNullOfOrNull(String::toIntOrNull))
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5"}

### String?.toBoolean() の厳格バージョン {id="strict-version-of-string-toboolean"}

既存の [String?.toBoolean()](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/to-boolean.html) に対して、大文字と小文字を区別する厳格なバージョンとして2つの新しい関数が導入されました。
* [`String.toBooleanStrict()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/to-boolean-strict.html) は、リテラル `true` および `false` 以外のすべての入力に対して例外をスローします。
* [`String.toBooleanStrictOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/to-boolean-strict-or-null.html) は、リテラル `true` および `false` 以外のすべての入力に対して null を返します。

```kotlin
fun main() {
//sampleStart
    println("true".toBooleanStrict())
    println("1".toBooleanStrictOrNull())
    // println("1".toBooleanStrict()) // 例外が発生
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5"}

## kotlin-test ライブラリ {id="kotlin-test-library"}
[kotlin-test](https://kotlinlang.org/api/latest/kotlin.test/) ライブラリにいくつかの新機能が導入されました。
* [マルチプラットフォームプロジェクトにおけるテスト依存関係の使用の簡素化](#simplified-test-dependencies-usage-in-multiplatform-projects)
* [Kotlin/JVM ソースセット向けテストフレームワークの自動選択](#automatic-selection-of-a-testing-framework-for-kotlin-jvm-source-sets)
* [アサーション関数のアップデート](#assertion-function-updates)

### マルチプラットフォームプロジェクトにおけるテスト依存関係の使用の簡素化 {id="simplified-test-dependencies-usage-in-multiplatform-projects"}

`commonTest` ソースセットにテスト用依存関係を追加する際、`kotlin-test` 依存関係を使用できるようになりました。Gradle プラグインが各テストソースセットに対応するプラットフォーム依存関係を自動的に推論します。
* JVM ソースセット向けには `kotlin-test-junit`（[Kotlin/JVM ソースセット向けテストフレームワークの自動選択](#automatic-selection-of-a-testing-framework-for-kotlin-jvm-source-sets) を参照）
* Kotlin/JS ソースセット向けには `kotlin-test-js`
* 共通ソースセット向けには `kotlin-test-common` および `kotlin-test-annotations-common`
* Kotlin/Native ソースセット向けには追加のアーティファクトなし

さらに、任意の共有ソースセットまたはプラットフォーム固有のソースセットで `kotlin-test` 依存関係を使用できます。

明示的な依存関係を使用した既存の kotlin-test の設定も、Gradle と Maven の両方で引き続き機能します。

[テストライブラリの依存関係設定に関する詳細を見る](gradle-configure-project.md#set-dependencies-on-test-libraries)。

### Kotlin/JVM ソースセット向けテストフレームワークの自動選択 {id="automatic-selection-of-a-testing-framework-for-kotlin-jvm-source-sets"}

Gradle プラグインがテストフレームワークへの依存関係を自動的に選択・追加するようになりました。共通ソースセットに依存関係 `kotlin-test` を追加するだけで利用できます。

Gradle はデフォルトで JUnit 4 を使用します。したがって、`kotlin("test")` 依存関係は JUnit 4 向けのバリアント、すなわち `kotlin-test-junit` に解決されます。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        val commonTest by getting {
            dependencies {
                implementation(kotlin("test")) // これにより推移的に JUnit 4 への
                                               // 依存関係が取り込まれます
            }
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets {
        commonTest {
            dependencies {
                implementation kotlin("test") // これにより推移的に JUnit 4 への
                                              // 依存関係が取り込まれます
            }
        }
    }
}
```

</tab>
</tabs>

テストタスクで [`useJUnitPlatform()`](https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/testing/Test.html#useJUnitPlatform) または [`useTestNG()`](https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/testing/Test.html#useTestNG) を呼び出すことで、JUnit 5 または TestNG を選択できます。

```groovy
tasks {
    test {
        // TestNG サポートを有効化
        useTestNG()
        // または
        // JUnit Platform（別名 JUnit 5）サポートを有効化
        useJUnitPlatform()
    }
}
```

テストフレームワークの自動選択を無効にするには、プロジェクトの `gradle.properties` に `kotlin.test.infer.jvm.variant=false` という行を追加します。

[テストライブラリの依存関係設定に関する詳細を見る](gradle-configure-project.md#set-dependencies-on-test-libraries)。

### アサーション関数のアップデート {id="assertion-function-updates"}

本リリースでは新しいアサーション関数が導入され、既存の関数も改善されました。

`kotlin-test` ライブラリに以下の機能が追加されました。

* **値の型のチェック**

  新しい `assertIs<T>` および `assertIsNot<T>` を使用して、値の型をチェックできます。

  ```kotlin
  @Test
  fun testFunction() {
      val s: Any = "test"
      assertIs<String>(s)  // アサーションが失敗した場合、s の実際の型を示す AssertionError をスロー
      // assertIs のコントラクトにより、s.length を出力できるようになる
      println("${s.length}")
  }
  ```

  型の消去（type erasure）のため、たとえば `assertIs<List<String>>(value)` の場合、このアサーション関数は `value` が `List` 型であるかどうかのみをチェックし、特定の `String` 要素型のリストであるかどうかまではチェックしません。

* **配列、シーケンス、任意の反復可能オブジェクト（Iterable）のコンテナ内容の比較**

  [構造的同値性（Structural equality）](equality.md#structural-equality)を実装していないさまざまなコレクションの内容を比較するための、オーバーロードされた `assertContentEquals()` 関数の新しいセットが追加されました。

  ```kotlin
  @Test
  fun test() {
      val expectedArray = arrayOf(1, 2, 3)
      val actualArray = Array(3) { it + 1 }
      assertContentEquals(expectedArray, actualArray)
  }
  ```

* **`Double` および `Float` 数値に対する `assertEquals()` と `assertNotEquals()` の新しいオーバーロード**

  2つの `Double` または `Float` の数値を絶対的な精度で比較できるようにする、`assertEquals()` 関数の新しいオーバーロードが追加されました。精度の値は関数の第3引数として指定します。

  ```kotlin
   @Test
  fun test() {
      val x = sin(PI)

      // 精度パラメータ
      val tolerance = 0.000001

      assertEquals(0.0, x, tolerance)
  }
  ```

* **コレクションと要素の内容をチェックする新しい関数**

  `assertContains()` 関数を使用して、コレクションまたは要素に何かが含まれているかどうかをチェックできるようになりました。
  `IntRange` や `String` など、`contains()` 演算子を持つ Kotlin のコレクションや要素で使用できます。

  ```kotlin
  @Test
  fun test() {
      val sampleList = listOf<String>("sample", "sample2")
      val sampleString = "sample"
      assertContains(sampleList, sampleString)  // コレクション内の要素
      assertContains(sampleString, "amp")       // 文字列内の部分文字列
  }
  ```

* **`assertTrue()`、`assertFalse()`、`expect()` 関数がインライン化**

  今後これらはインライン関数として使用できるため、ラムダ式内で[サスペンド関数（suspend functions）](composing-suspending-functions.md)を呼び出すことが可能になります。

  ```kotlin
  @Test
  fun test() = runBlocking<Unit> {
      val deferred = async { "Kotlin is nice" }
      assertTrue("Kotlin substring should be present") {
          deferred.await() .contains("Kotlin")
      }
  }
  ```

## kotlinx ライブラリ {id="kotlinx-libraries"}

Kotlin 1.5.0 のリリースに合わせて、kotlinx ライブラリの新しいバージョンもリリースされます。
* `kotlinx.coroutines` [1.5.0-RC](#coroutines-1-5-0-rc)
* `kotlinx.serialization` [1.2.1](#serialization-1-2-1)
* `kotlinx-datetime` [0.2.0](#datetime-0-2-0)

### Coroutines 1.5.0-RC {id="coroutines-1-5-0-rc"}

`kotlinx.coroutines` [1.5.0-RC](https://github.com/Kotlin/kotlinx.coroutines/releases/tag/1.5.0-RC) がリリースされ、以下の内容が含まれています。
* [新しい Channels API](channels.md)
* リアクティブ統合の安定化
* その他多数

Kotlin 1.5.0 以降、[実験的なコルーチン](whatsnew14.md#exclusion-of-the-deprecated-experimental-coroutines)は無効化され、`-Xcoroutines=experimental` フラグはサポートされなくなりました。

詳細については、[変更履歴（Changelog）](https://github.com/Kotlin/kotlinx.coroutines/releases/tag/1.5.0-RC)および [`kotlinx.coroutines` 1.5.0 リリースのブログ記事](https://blog.jetbrains.com/kotlin/2021/05/kotlin-coroutines-1-5-0-released/)を参照してください。

<video src="https://www.youtube.com/v/EVLnWOcR0is" title="kotlinx.coroutines 1.5.0"/>

### Serialization 1.2.1 {id="serialization-1-2-1"}

`kotlinx.serialization` [1.2.1](https://github.com/Kotlin/kotlinx.serialization/releases/tag/v1.2.1) がリリースされ、以下の内容が含まれています。
* JSON シリアライズのパフォーマンス向上
* JSON シリアライズにおける複数の名前（複数キー）のサポート
* `@Serializable` クラスからの実験的な .proto スキーマ生成
* その他多数

詳細については、[変更履歴（Changelog）](https://github.com/Kotlin/kotlinx.serialization/releases/tag/v1.2.1)および [`kotlinx.serialization` 1.2.1 リリースのブログ記事](https://blog.jetbrains.com/kotlin/2021/05/kotlinx-serialization-1-2-released/)を参照してください。

<video src="https://www.youtube.com/v/698I_AH8h6s" title="kotlinx.serialization 1.2.1"/>

### dateTime 0.2.0 {id="datetime-0-2-0"}

`kotlinx-datetime` [0.2.0](https://github.com/Kotlin/kotlinx-datetime/releases/tag/v0.2.0) がリリースされ、以下の内容が含まれています。
* `@Serializable` な Datetime オブジェクト
* `DateTimePeriod` および `DatePeriod` の正規化された API
* その他多数

詳細については、[変更履歴（Changelog）](https://github.com/Kotlin/kotlinx-datetime/releases/tag/v0.2.0)および [`kotlinx-datetime` 0.2.0 リリースのブログ記事](https://blog.jetbrains.com/kotlin/2021/05/kotlinx-datetime-0-2-0-is-out/)を参照してください。

## Kotlin 1.5.0 への移行 {id="migrating-to-kotlin-1-5-0"}

IntelliJ IDEA および Android Studio では、利用可能になり次第 Kotlin プラグインの 1.5.0 へのアップデートが提案されます。

既存のプロジェクトを Kotlin 1.5.0 に移行するには、Kotlin のバージョンを `1.5.0` に変更して、Gradle または Maven プロジェクトを再インポートするだけです。[Kotlin 1.5.0 へのアップデート方法についての詳細を見る](releases.md#update-to-a-new-kotlin-version)。

Kotlin 1.5.0 で新規プロジェクトを開始するには、Kotlin プラグインをアップデートし、**File** | **New** | **Project** からプロジェクトウィザードを実行してください。

新しいコマンドラインコンパイラは、[GitHub のリリースページ](https://github.com/JetBrains/kotlin/releases/tag/v1.5.0)からダウンロード可能です。

Kotlin 1.5.0 は機能リリース（Feature release）であるため、言語に互換性のない変更をもたらす可能性があります。そのような変更の詳細なリストについては、[Kotlin 1.5 互換性ガイド](compatibility-guide-15.md)を参照してください。