[//]: # (title: Kotlin 1.5.0 の新機能)

<web-summary>新しい言語機能、Kotlin マルチプラットフォーム、JVM、Native、JS への更新、および Gradle と Maven のビルドツールサポートをカバーする Kotlin 1.5.0 のリリースノートをお読みください。</web-summary>

_[リリース日: 2021年5月5日](releases.md#release-history)_

Kotlin 1.5.0 では、新しい言語機能、安定版となった IR ベースの JVM コンパイラバックエンド、パフォーマンスの向上、および実験的機能の安定化や古い機能の非推奨化といった発展的な変更が導入されています。

変更内容の概要については、[リリースブログの投稿](https://blog.jetbrains.com/kotlin/2021/05/kotlin-1-5-0-released/)でもご確認いただけます。

> Kotlin のリリースサイクルに関する情報は、[Kotlin のリリースプロセス](releases.md)を参照してください。
>
{style="tip"}

## 言語機能

Kotlin 1.5.0 では、[1.4.30 でプレビュー](whatsnew1430.md#language-features)として提供された新しい言語機能の安定版が導入されました。
* [JVM レコードのサポート](#jvm-records-support)
* [Sealed インターフェース](#sealed-interfaces) と [sealed クラスの改善](#package-wide-sealed-class-hierarchies)
* [インラインクラス (Inline classes)](#inline-classes)

これらの機能の詳細は、[こちらのブログ投稿](https://blog.jetbrains.com/kotlin/2021/02/new-language-features-preview-in-kotlin-1-4-30/)および Kotlin ドキュメントの該当ページで確認できます。

### JVM レコードのサポート

Java は急速に進化しており、Kotlin が Java との相互運用性を維持できるように、Java の最新機能の一つである [レコードクラス (record classes)](https://openjdk.java.net/jeps/395) のサポートを導入しました。

Kotlin による JVM レコードのサポートには、双方向の相互運用性が含まれます。
* Kotlin コード内では、プロパティを持つ典型的なクラスと同じように Java のレコードクラスを使用できます。
* Kotlin クラスを Java コードでレコードとして使用するには、そのクラスを `data` クラスにし、`@JvmRecord` アノテーションを付けます。

```kotlin
@JvmRecord
data class User(val name: String, val age: Int)
```

[Kotlin での JVM レコードの使用について詳しく学ぶ](jvm-records.md)。

<video src="https://www.youtube.com/v/iyEWXyuuseU" title="Support for JVM Records in Kotlin 1.5.0"/>

### Sealed インターフェース

Kotlin のインターフェースに `sealed` 修飾子を付けられるようになりました。これはクラスの場合と同様に機能します。sealed インターフェースのすべての実装は、コンパイル時に既知となります。

```kotlin
sealed interface Polygon
```

この事実を利用して、例えば網羅的な `when` 式を書くことができます。

```kotlin
fun draw(polygon: Polygon) = when (polygon) {
   is Rectangle -> // ...
   is Triangle -> // ...
   // else は不要 - すべての可能な実装がカバーされているため
}

```

さらに、クラスは複数の sealed インターフェースを直接継承できるため、sealed インターフェースによって、より柔軟に制限されたクラス階層を構築できます。

```kotlin
class FilledRectangle: Polygon, Fillable
```

[Sealed インターフェースについて詳しく学ぶ](sealed-classes.md)。

<video src="https://www.youtube.com/v/d_Mor21W_60" title="Sealed Interfaces and Sealed Classes Improvements"/>

### パッケージ全体の sealed クラス階層

Sealed クラスは、同じコンパイル単位かつ同じパッケージ内のすべてのファイルにサブクラスを持てるようになりました。以前は、すべてのサブクラスを同じファイル内に記述する必要がありました。

直接のサブクラスは、トップレベルに配置することも、他の任意の数の名前付きクラス、名前付きインターフェース、または名前付きオブジェクトの中にネストすることもできます。

Sealed クラスのサブクラスは、適切に修飾された名前（qualified name）を持つ必要があり、ローカルオブジェクトや匿名オブジェクトにすることはできません。

[Sealed クラスの階層について詳しく学ぶ](sealed-classes.md#inheritance)。

### インラインクラス (Inline classes)

インラインクラスは、値のみを保持する[値ベース (value-based)](https://github.com/Kotlin/KEEP/blob/master/notes/value-classes.md)のクラスのサブセットです。メモリ割り当てによる追加のオーバーヘッドなしに、特定の型の値のラッパーとして使用できます。

インラインクラスは、クラス名の前に `value` 修飾子を付けて宣言できます。

```kotlin
value class Password(val s: String)
```

JVM バックエンドでは、特別な `@JvmInline` アノテーションも必要です。

```kotlin
@JvmInline
value class Password(val s: String)
```

`inline` 修飾子は非推奨となり、警告が表示されるようになりました。

[インラインクラスについて詳しく学ぶ](inline-classes.md)。

<video src="https://www.youtube.com/v/LpqvtgibbsQ" title="From Inline to Value Classes"/>

## Kotlin/JVM

Kotlin/JVM には、内部的な改善とユーザー向けの改善の両方が多数導入されました。主なものは以下の通りです。

* [安定版 JVM IR バックエンド](#stable-jvm-ir-backend)
* [新しいデフォルト JVM ターゲット: 1.8](#new-default-jvm-target-1-8)
* [invokedynamic を介した SAM アダプター](#sam-adapters-via-invokedynamic)
* [invokedynamic を介したラムダ](#lambdas-via-invokedynamic)
* [@JvmDefault および古い Xjvm-default モードの非推奨化](#deprecation-of-jvmdefault-and-old-xjvm-default-modes)
* [Nullability アノテーションの処理の改善](#improvements-to-handling-nullability-annotations)

### 安定版 JVM IR バックエンド

Kotlin/JVM コンパイラの [IR ベースのバックエンド](whatsnew14.md#new-jvm-ir-backend)が[安定版（Stable）](components-stability.md)となり、デフォルトで有効になりました。

[Kotlin 1.4.0](whatsnew14.md) から、IR ベースのバックエンドの早期バージョンがプレビューとして利用可能でしたが、言語バージョン `1.5` からはこれがデフォルトになりました。以前の言語バージョンでは、引き続き古いバックエンドがデフォルトで使用されます。

IR バックエンドの利点とその将来の開発に関する詳細は、[こちらのブログ投稿](https://blog.jetbrains.com/kotlin/2021/02/the-jvm-backend-is-in-beta-let-s-make-it-stable-together/)で確認できます。

Kotlin 1.5.0 で古いバックエンドを使用する必要がある場合は、プロジェクトの構成ファイルに以下の行を追加してください。

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

### 新しいデフォルト JVM ターゲット: 1.8

Kotlin/JVM コンパイルのデフォルトターゲットバージョンが `1.8` になりました。`1.6` ターゲットは非推奨です。

JVM 1.6 用のビルドが必要な場合は、引き続きそのターゲットに切り替えることができます。方法については以下を参照してください。

* [Gradle の場合](gradle-compiler-options.md#attributes-specific-to-jvm)
* [Maven の場合](maven-kotlin-compiler.md#attributes-specific-to-jvm)
* [コマンドラインコンパイラの場合](compiler-reference.md#jvm-target-version)

### invokedynamic を介した SAM アダプター

Kotlin 1.5.0 では、SAM (Single Abstract Method) 変換のコンパイルに動的呼び出し (`invokedynamic`) を使用するようになりました。
* SAM 型が [Java インターフェース](java-interop.md#sam-conversions) である場合の任意の式
* SAM 型が [Kotlin 関数型インターフェース](fun-interfaces.md#sam-conversions) である場合のラムダ

新しい実装では [`LambdaMetafactory.metafactory()`](https://docs.oracle.com/javase/8/docs/api/java/lang/invoke/LambdaMetafactory.html#metafactory-java.lang.invoke.MethodHandles.Lookup-java.lang.String-java.lang.invoke.MethodType-java.lang.invoke.MethodType-java.lang.invoke.MethodHandle-java.lang.invoke.MethodType-) を使用し、コンパイル中に補助的なラッパークラスが生成されなくなります。これによりアプリケーションの JAR サイズが削減され、JVM の起動パフォーマンスが向上します。

匿名クラスの生成に基づいた古い実装スキームに戻すには、コンパイラオプション `-Xsam-conversions=class` を追加してください。

Gradle、Maven、およびコマンドラインコンパイラでのコンパイラオプションの追加方法は、[Gradle](gradle-compiler-options.md)、[Maven](maven-kotlin-compiler.md#specify-compiler-options)、および[コマンドラインコンパイラ](compiler-reference.md#compiler-options)を参照してください。

### invokedynamic を介したラムダ

> 純粋な Kotlin ラムダを `invokedynamic` にコンパイルする機能は[実験的（Experimental）](components-stability.md)です。これはいつでも削除または変更される可能性があります。使用にはオプトインが必要であり（詳細は下記参照）、評価目的でのみ使用してください。[YouTrack](https://youtrack.jetbrains.com/issue/KT-45375) でのフィードバックをお待ちしております。
>
{style="warning"}

Kotlin 1.5.0 では、純粋な Kotlin ラムダ（関数型インターフェースのインスタンスに変換されないもの）を動的呼び出し (`invokedynamic`) にコンパイルする実験的サポートを導入しています。この実装は、[`LambdaMetafactory.metafactory()`](https://docs.oracle.com/javase/8/docs/api/java/lang/invoke/LambdaMetafactory.html#metafactory-java.lang.invoke.MethodHandles.Lookup-java.lang.String-java.lang.invoke.MethodType-java.lang.invoke.MethodType-java.lang.invoke.MethodHandle-java.lang.invoke.MethodType-) を使用することで実行時に必要なクラスを効果的に生成し、より軽量なバイナリを生成します。現在、通常のラムダコンパイルと比較して 3 つの制限があります。

* `invokedynamic` にコンパイルされたラムダはシリアライズできません。
* そのようなラムダに対して `toString()` を呼び出すと、可読性の低い文字列が返されます。
* 実験的な [`reflect`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect.jvm/reflect.html) API は、`LambdaMetafactory` で作成されたラムダをサポートしていません。

この機能を試すには、`-Xlambdas=indy` コンパイラオプションを追加してください。この [YouTrack チケット](https://youtrack.jetbrains.com/issue/KT-45375) を使用してフィードバックを共有していただければ幸いです。

Gradle、Maven、およびコマンドラインコンパイラでのコンパイラオプションの追加方法は、[Gradle](gradle-compiler-options.md)、[Maven](maven-kotlin-compiler.md#specify-compiler-options)、および[コマンドラインコンパイラ](compiler-reference.md#compiler-options)を参照してください。

### @JvmDefault および古い Xjvm-default モードの非推奨化

Kotlin 1.4.0 以前は、`-Xjvm-default=enable` および `-Xjvm-default=compatibility` モードとともに `@JvmDefault` アノテーションが存在していました。これらは、Kotlin インターフェース内の特定の非抽象メンバに対して JVM デフォルトメソッドを作成するために使用されていました。

Kotlin 1.4.0 では、プロジェクト全体でデフォルトメソッド生成をオンにする[新しい `Xjvm-default` モードを導入しました](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-m3-generating-default-methods-in-interfaces/)。

Kotlin 1.5.0 では、`@JvmDefault` および古い Xjvm-default モード（`-Xjvm-default=enable` および `-Xjvm-default=compatibility`）を非推奨にします。

[Java 相互運用におけるデフォルトメソッドについて詳しく学ぶ](java-to-kotlin-interop.md#default-methods-in-interfaces)。

### Nullability アノテーションの処理の改善

Kotlin は、[nullability アノテーション](java-interop.md#nullability-annotations) を使用して Java からの型の null 許容情報を取り扱うことをサポートしています。Kotlin 1.5.0 では、この機能にいくつかの改善が導入されました。

* 依存関係として使用されるコンパイル済みの Java ライブラリの型引数にある nullability アノテーションを読み取ります。
* 以下の `TYPE_USE` ターゲットを持つ nullability アノテーションをサポートします：
  * 配列
  * 可変長引数 (Varargs)
  * フィールド
  * 型パラメータとその境界 (bounds)
  * ベースクラスおよびインターフェースの型引数
* nullability アノテーションに型に適用可能な複数のターゲットがあり、そのターゲットの一つが `TYPE_USE` である場合、`TYPE_USE` が優先されます。
  例えば、`@Nullable` が `TYPE_USE` と `METHOD` の両方のターゲットをサポートしている場合、メソッドのシグネチャ `@Nullable String[] f()` は `fun f(): Array<String?>!` となります。

これらの新しくサポートされたケースにおいて、Kotlin から Java を呼び出す際に誤った型の null 許容を使用すると警告が生成されます。これらのケースで厳密モード（エラー報告あり）を有効にするには、`-Xtype-enhancement-improvements-strict-mode` コンパイラオプションを使用してください。

[Null 安全性とプラットフォーム型について詳しく学ぶ](java-interop.md#null-safety-and-platform-types)。

## Kotlin/Native

Kotlin/Native はよりパフォーマンスが高く、安定しました。主な変更点は以下の通りです。
* [パフォーマンスの向上](#performance-improvements)
* [メモリリークチェッカーの無効化](#deactivation-of-the-memory-leak-checker)

### パフォーマンスの向上

1.5.0 では、Kotlin/Native においてコンパイルと実行の両方を高速化する一連のパフォーマンスの改善が行われました。

[コンパイラキャッシュ](https://blog.jetbrains.com/kotlin/2020/03/kotlin-1-3-70-released/#kotlin-native) が、`linuxX64`（Linux ホスト上のみ）および `iosArm64` ターゲットのデバッグモードでサポートされるようになりました。コンパイラキャッシュを有効にすると、初回のコンパイルを除き、ほとんどのデバッグコンパイルが大幅に高速化されます。テストプロジェクトの測定では、約 200% の速度向上が確認されました。

新しいターゲットでコンパイラキャッシュを使用するには、プロジェクトの `gradle.properties` に以下の行を追加してオプトインしてください。
* `linuxX64` の場合 : `kotlin.native.cacheKind.linuxX64=static`
* `iosArm64` の場合 : `kotlin.native.cacheKind.iosArm64=static`

コンパイラキャッシュを有効にした後に問題が発生した場合は、イシュートラッカー [YouTrack](https://kotl.in/issue) に報告してください。

その他の改善により、Kotlin/Native コードの実行速度も向上しました。
* 些細な（Trivial）プロパティアクセサがインライン化されます。
* 文字列リテラルの `trimIndent()` がコンパイル中に評価されます。

### メモリリークチェッカーの無効化

組み込みの Kotlin/Native メモリリークチェッカーがデフォルトで無効になりました。

これはもともと内部向けに設計されたもので、限られたケースでしかリークを検出できず、すべてをカバーしているわけではありませんでした。さらに、後にアプリケーションのクラッシュを引き起こす可能性のある問題があることが判明しました。そのため、メモリリークチェッカーをオフにすることに決定しました。

メモリリークチェッカーは、ユニットテストなどの特定のケースでは依然として有用な場合があります。そのような場合は、以下のコード行を追加することで有効にできます。

```kotlin
Platform.isMemoryLeakCheckerActive = true
```

なお、アプリケーションのランタイムでチェッカーを有効にすることは推奨されません。

## Kotlin/JS

Kotlin/JS は 1.5.0 で発展的な変更を受けています。[JS IR コンパイラバックエンド](js-ir-compiler.md)の安定化に向けた作業を継続しており、その他のアップデートも提供しています。

* [webpack バージョン 5 へのアップグレード](#upgrade-to-webpack-5)
* [IR コンパイラ向けのフレームワークとライブラリ](#frameworks-and-libraries-for-the-ir-compiler)

### webpack 5 へのアップグレード

Kotlin/JS Gradle プラグインは、ブラウザターゲットにおいて webpack 4 の代わりに webpack 5 を使用するようになりました。これは webpack のメジャーアップグレードであり、互換性のない変更が含まれています。カスタムの webpack 構成を使用している場合は、[webpack 5 のリリースノート](https://webpack.js.org/blog/2020-10-10-webpack-5-release/)を必ず確認してください。

[webpack を使用した Kotlin/JS プロジェクトのバンドルについて詳しく学ぶ](js-project-setup.md#webpack-bundling)。

### IR コンパイラ向けのフレームワークとライブラリ

> Kotlin/JS IR コンパイラは [アルファ版 (Alpha)](components-stability.md) です。将来的に互換性のない変更が行われ、手動での移行が必要になる可能性があります。[YouTrack](https://youtrack.jetbrains.com/issues/KT) でのフィードバックをお待ちしております。
>
{style="warning"}

Kotlin/JS コンパイラの IR ベースのバックエンドの作業とともに、ライブラリの作者がプロジェクトを `both` モードでビルドすることを奨励・支援しています。これにより、両方の Kotlin/JS コンパイラ向けのアーティファクトを生成でき、新しいコンパイラのエコシステムを拡大できます。

多くの有名なフレームワークやライブラリがすでに IR バックエンドで利用可能です：[KVision](https://kvision.io/)、[fritz2](https://www.fritz2.dev/)、[doodle](https://github.com/nacular/doodle) など。これらをプロジェクトで使用している場合、すでに IR バックエンドでビルドして、その利点を確認することができます。

自身のライブラリを執筆している場合は、クライアントが新しいコンパイラでも使用できるように、'both' モードでコンパイルしてください。

## Kotlin マルチプラットフォーム

Kotlin 1.5.0 では、[各プラットフォームのテスト依存関係の選択が簡素化され](#simplified-test-dependencies-usage-in-multiplatform-projects)、Gradle プラグインによって自動的に行われるようになりました。

[マルチプラットフォームプロジェクトで文字（char）のカテゴリを取得するための新しい API も利用可能になりました](#new-api-for-getting-a-char-category-now-available-in-multiplatform-code)。

## 標準ライブラリ

標準ライブラリは、実験的機能の安定化から新機能の追加まで、多岐にわたる変更と改善を受けました。

* [安定版 符号なし整数型](#stable-unsigned-integer-types)
* [安定版 ロケールに依存しない大文字/小文字変換 API](#stable-locale-agnostic-api-for-upper-lowercasing-text)
* [安定版 Char から整数への変換 API](#stable-char-to-integer-conversion-api)
* [安定版 Path API](#stable-path-api)
* [床関数除算 (Floored division) と mod 演算子](#floored-division-and-the-mod-operator)
* [Duration API の変更](#duration-api-changes)
* [マルチプラットフォームコードで利用可能になった文字カテゴリ取得用 API](#new-api-for-getting-a-char-category-now-available-in-multiplatform-code)
* [新しいコレクション関数 firstNotNullOf()](#new-collections-function-firstnotnullof)
* [String?.toBoolean() の厳密版](#strict-version-of-string-toboolean)

標準ライブラリの変更についての詳細は、[こちらのブログ投稿](https://blog.jetbrains.com/kotlin/2021/04/kotlin-1-5-0-rc-released)で確認できます。

<video src="https://www.youtube.com/v/MyTkiT2I6-8" title="New Standard Library Features"/>

### 安定版 符号なし整数型

`UInt`、`ULong`、`UByte`、`UShort` の符号なし整数型が[安定版（Stable）](components-stability.md)となりました。これらの型に対する演算、レンジ、プログレッションも同様です。符号なし配列とその演算は Beta のままです。

[符号なし整数型について詳しく学ぶ](unsigned-integer-types.md)。

### 安定版 ロケールに依存しない大文字/小文字変換 API

このリリースでは、ロケールに依存しない新しい大文字/小文字テキスト変換 API が導入されました。これは、ロケールに依存する `toLowerCase()`、`toUpperCase()`、`capitalize()`、および `decapitalize()` API 関数の代替を提供します。新しい API は、異なるロケール設定によるエラーを回避するのに役立ちます。

Kotlin 1.5.0 は、以下の完全に[安定した（Stable）](components-stability.md)代替手段を提供します。

* `String` 関数の場合：

  |**以前のバージョン**|**1.5.0 の代替手段**|
  | --- | --- |
  |`String.toUpperCase()`|`String.uppercase()`|
  |`String.toLowerCase()`|`String.lowercase()`|
  |`String.capitalize()`|`String.replaceFirstChar { it.uppercase() }`|
  |`String.decapitalize()`|`String.replaceFirstChar { it.lowercase() }`|

* `Char` 関数の場合：

  |**以前のバージョン**|**1.5.0 の代替手段**|
  | --- | --- |
  |`Char.toUpperCase()`|`Char.uppercaseChar(): Char`<br/>`Char.uppercase(): String`|
  |`Char.toLowerCase()`|`Char.lowercaseChar(): Char`<br/>`Char.lowercase(): String`|
  |`Char.toTitleCase()`|`Char.titlecaseChar(): Char`<br/>`Char.titlecase(): String`|

> Kotlin/JVM の場合、明示的な `Locale` パラメータを持つオーバーロードされた `uppercase()`、`lowercase()`、および `titlecase()` 関数も存在します。
>
{style="note"}

古い API 関数は非推奨としてマークされており、将来のリリースで削除される予定です。

テキスト処理機能への変更の全リストは [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/stdlib/locale-agnostic-case-conversions.md) を参照してください。

### 安定版 Char から整数への変換 API

Kotlin 1.5.0 から、新しい char-to-code（文字からコードへ）および char-to-digit（文字から数字へ）変換関数が[安定版（Stable）](components-stability.md)となりました。これらの関数は、同様の string-to-Int（文字列から整数へ）変換と混同されやすかった現在の API 関数を置き換えます。

新しい API はこの命名の混乱を解消し、コードの振る舞いをより透明かつ明確にします。

このリリースでは、以下の明確に命名された関数セットに分かれた `Char` 変換が導入されています。

* `Char` の整数コードを取得し、与えられたコードから `Char` を構築する関数：

 ```kotlin
 fun Char(code: Int): Char
 fun Char(code: UShort): Char
 val Char.code: Int
 ```

* `Char` をそれが表す数字の数値に変換する関数：

 ```kotlin
 fun Char.digitToInt(radix: Int): Int
 fun Char.digitToIntOrNull(radix: Int): Int?
 ```

* 非負の 1 桁の数値を対応する `Char` 表現に変換するための `Int` の拡張関数：

 ```kotlin
 fun Int.digitToChar(radix: Int): Char
 ```

`Number.toChar()` とその実装（`Int.toChar()` 以外すべて）や、`Char.toInt()` のような数値型への変換のための `Char` 拡張機能を含む古い変換 API は、現在非推奨となっています。

[KEEP で char から整数への変換 API について詳しく学ぶ](https://github.com/Kotlin/KEEP/blob/master/proposals/stdlib/char-int-conversions.md)。

### 安定版 Path API

`java.nio.file.Path` の拡張機能を備えた[実験的な Path API](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.io.path/java.nio.file.-path/) が[安定版（Stable）](components-stability.md)となりました。

```kotlin
// div (/) 演算子を使用してパスを構築
val baseDir = Path("/base")
val subDir = baseDir / "subdirectory"

// ディレクトリ内のファイルをリストアップ
val kotlinFiles: `List<Path>` = Path("/home/user").listDirectoryEntries("*.kt")
```

[Path API について詳しく学ぶ](whatsnew1420.md#extensions-for-java-nio-file-path)。

### 床関数除算 (Floored division) と mod 演算子

モジュロ演算（modular arithmetics）のための新しい演算が標準ライブラリに追加されました。
* `floorDiv()` は[床関数除算 (floored division)](https://en.wikipedia.org/wiki/Floor_and_ceiling_functions) の結果を返します。整数型で利用可能です。
* `mod()` は床関数除算の余り（*modulus*）を返します。すべての数値型で利用可能です。

これらの演算は既存の[整数の除算](numbers.md#integer-division)や [rem()](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-int/rem.html) 関数（または `%` 演算子）とよく似ていますが、負の数に対して異なる動作をします。
* `a.floorDiv(b)` は通常の `/` と異なり、`floorDiv` は結果を切り下げ（より小さい整数に向かって）ますが、`/` は結果を 0 に近い方の整数に切り捨てます。
* `a.mod(b)` は `a` と `a.floorDiv(b) * b` の差です。これは 0 か、`b` と同じ符号になりますが、`a % b` は異なる符号になることがあります。

```kotlin
fun main() {
//sampleStart
    println("床関数除算 -5/3: ${(-5).floorDiv(3)}")
    println( "剰余 (Modulus): ${(-5).mod(3)}")
    
    println("切り捨て除算 -5/3: ${-5 / 3}")
    println( "余り (Remainder): ${-5 % 3}")
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5"}

### Duration API の変更

> Duration API は[実験的（Experimental）](components-stability.md)です。これはいつでも削除または変更される可能性があります。評価目的でのみ使用してください。[YouTrack](https://youtrack.jetbrains.com/issues/KT) でのフィードバックをお待ちしております。
>
{style="warning"}

異なる時間単位で期間の量を表すための実験的な [Duration](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/) クラスがあります。1.5.0 では、Duration API に以下の変更が行われました。

* 内部の数値表現が精度向上のため `Double` ではなく `Long` を使用するようになりました。
* `Long` で特定の時間単位に変換するための新しい API が導入されました。これは `Double` 値で動作していた古い API（現在は非推奨）を置き換えるものです。例えば、[`Duration.inWholeMinutes`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/in-whole-minutes.html) は期間の値を `Long` として返し、`Duration.inMinutes` を置き換えます。
* 数値から `Duration` を構築するための新しいコンパニオン関数が追加されました。例えば、[`Duration.seconds(Int)`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/seconds.html) は、秒の整数を表す `Duration` オブジェクトを作成します。`Int.seconds` のような古い拡張プロパティは現在非推奨です。

```kotlin
import kotlin.time.Duration
import kotlin.time.ExperimentalTime

@ExperimentalTime
fun main() {
//sampleStart
    val duration = Duration.milliseconds(120000)
    println("${duration.inWholeMinutes} 分には、${duration.inWholeSeconds} 秒あります")
//sampleEnd
}
```
{validate="false"}

### マルチプラットフォームコードで利用可能になった文字カテゴリ取得用 API

Kotlin 1.5.0 では、マルチプラットフォームプロジェクトにおいて Unicode に準拠した文字のカテゴリを取得するための新しい API を導入しました。いくつかの関数がすべてのプラットフォームおよび共通コードで利用可能になりました。

文字が文字か数字かをチェックする関数：
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

文字の大文字・小文字をチェックする関数：
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

その他の関数：
* [`Char.isDefined()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/is-defined.html)
* [`Char.isISOControl()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/is-i-s-o-control.html)

プロパティ [`Char.category`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/category.html) とその戻り値の型である列挙型クラス [`CharCategory`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-char-category/)（Unicode に基づく文字の一般カテゴリを示す）も、マルチプラットフォームプロジェクトで利用可能になりました。

[文字 (Characters) について詳しく学ぶ](characters.md)。

### 新しいコレクション関数 firstNotNullOf()

新しい [`firstNotNullOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-not-null-of.html) および [`firstNotNullOfOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-not-null-of-or-null.html) 関数は、[`mapNotNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-not-null.html) を [`first()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first.html) または [`firstOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-or-null.html) と組み合わせたものです。これらは元のコレクションをカスタムセレクター関数でマップし、最初の非 null 値を返します。そのような値がない場合、`firstNotNullOf()` は例外をスローし、`firstNotNullOfOrNull()` は null を返します。

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

### String?.toBoolean() の厳密版

既存の [String?.toBoolean()](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/to-boolean.html) に対し、大文字小文字を区別する厳密版として 2 つの新しい関数が導入されました：
* [`String.toBooleanStrict()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/to-boolean-strict.html) は、リテラルの `true` および `false` 以外のすべての入力に対して例外をスローします。
* [`String.toBooleanStrictOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/to-boolean-strict-or-null.html) は、リテラルの `true` および `false` 以外のすべての入力に対して null を返します。

```kotlin
fun main() {
//sampleStart
    println("true".toBooleanStrict())
    println("1".toBooleanStrictOrNull())
    // println("1".toBooleanStrict()) // 例外が発生します
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5"}

## kotlin-test ライブラリ
[kotlin-test](https://kotlinlang.org/api/latest/kotlin.test/) ライブラリにいくつかの新機能が導入されました：
* [マルチプラットフォームプロジェクトにおけるテスト依存関係の使用の簡素化](#simplified-test-dependencies-usage-in-multiplatform-projects)
* [Kotlin/JVM ソースセットにおけるテストフレームワークの自動選択](#automatic-selection-of-a-testing-framework-for-kotlin-jvm-source-sets)
* [アサーション関数のアップデート](#assertion-function-updates)

### マルチプラットフォームプロジェクトにおけるテスト依存関係の使用の簡素化

`kotlin-test` 依存関係を使用して `commonTest` ソースセットにテスト用の依存関係を追加できるようになりました。Gradle プラグインが各テストソースセットに対応するプラットフォーム依存関係を推論します：
* JVM ソースセット用の `kotlin-test-junit`（[Kotlin/JVM ソースセット用テストフレームワークの自動選択](#automatic-selection-of-a-testing-framework-for-kotlin-jvm-source-sets)を参照）
* Kotlin/JS ソースセット用の `kotlin-test-js`
* 共通ソースセット用の `kotlin-test-common` および `kotlin-test-annotations-common`
* Kotlin/Native ソースセット用の追加アーティファクトなし

さらに、共有ソースセットやプラットフォーム固有のソースセットでも `kotlin-test` 依存関係を使用できます。

明示的な依存関係を持つ既存の kotlin-test 設定は、Gradle と Maven の両方で引き続き機能します。

[テストライブラリへの依存関係の設定](gradle-configure-project.md#set-dependencies-on-test-libraries)について詳しく学ぶ。

### Kotlin/JVM ソースセットにおけるテストフレームワークの自動選択

Gradle プラグインが、テストフレームワークへの依存関係を自動的に選択して追加するようになりました。共通ソースセットに `kotlin-test` の依存関係を追加するだけで済みます。

Gradle はデフォルトで JUnit 4 を使用します。そのため、`kotlin("test")` 依存関係は JUnit 4 用のバリアント、すなわち `kotlin-test-junit` に解決されます。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        val commonTest by getting {
            dependencies {
                implementation(kotlin("test")) // これにより JUnit 4 への依存関係が
                                               // 推移的に取り込まれます
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
                implementation kotlin("test") // これにより JUnit 4 への依存関係が
                                              // 推移的に取り込まれます
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
        // TestNG サポートを有効にする
        useTestNG()
        // または
        // JUnit Platform (別名 JUnit 5) サポートを有効にする
        useJUnitPlatform()
    }
}
```

プロジェクトの `gradle.properties` に `kotlin.test.infer.jvm.variant=false` という行を追加することで、テストフレームワークの自動選択を無効にできます。

[テストライブラリへの依存関係の設定](gradle-configure-project.md#set-dependencies-on-test-libraries)について詳しく学ぶ。

### アサーション関数のアップデート

このリリースでは、新しいアサーション関数が導入され、既存の関数も改善されました。

`kotlin-test` ライブラリには以下の機能が追加されました：

* **値の型のチェック**

  値の型をチェックするために、新しい `assertIs<T>` および `assertIsNot<T>` を使用できます：

  ```kotlin
  @Test
  fun testFunction() {
      val s: Any = "test"
      assertIs<String>(s)  // アサーションが失敗した場合、s の実際の型を明記した AssertionError をスローします
      // assertIs 内のコントラクトにより、s.length を出力できるようになります
      println("${s.length}")
  }
  ```

  型消去 (Type erasure) のため、次の例の `assertIs<List<String>>(value)` は、`value` が `List` 型であるかどうかのみをチェックし、特定の `String` 要素型のリレーショナルリストであるかどうかはチェックしません。

* **配列、シーケンス、および任意のイテラブルのコンテナ内容の比較**

  [構造的な等価性 (Structural equality)](equality.md#structural-equality) を実装していない異なるコレクションの内容を比較するための、オーバーロードされた `assertContentEquals()` 関数セットが追加されました：

  ```kotlin
  @Test
  fun test() {
      val expectedArray = arrayOf(1, 2, 3)
      val actualArray = Array(3) { it + 1 }
      assertContentEquals(expectedArray, actualArray)
  }
  ```

* **`Double` および `Float` 数値に対する `assertEquals()` および `assertNotEquals()` の新しいオーバーロード**

  2 つの `Double` または `Float` 数値を絶対精度で比較できる `assertEquals()` 関数の新しいオーバーロードが追加されました。精度値は関数の第 3 パラメータとして指定します：

  ```kotlin
   @Test
  fun test() {
      val x = sin(PI)

      // 精度パラメータ
      val tolerance = 0.000001

      assertEquals(0.0, x, tolerance)
  }
  ```

* **コレクションと要素の内容をチェックするための新しい関数**

  `assertContains()` 関数を使用して、コレクションや要素に何かが含まれているかどうかをチェックできるようになりました。`IntRange`、`String` など、`contains()` 演算子を持つ Kotlin のコレクションや要素で使用できます：

  ```kotlin
  @Test
  fun test() {
      val sampleList = listOf<String>("sample", "sample2")
      val sampleString = "sample"
      assertContains(sampleList, sampleString)  // コレクション内の要素
      assertContains(sampleString, "amp")       // 文字列内の部分文字列
  }
  ```

* **`assertTrue()`、`assertFalse()`、`expect()` 関数がインライン化されました**

  今後はこれらをインライン関数として使用できるため、ラムダ式内で [サスペンド関数](composing-suspending-functions.md) を呼び出すことが可能になります：

  ```kotlin
  @Test
  fun test() = runBlocking<Unit> {
      val deferred = async { "Kotlin is nice" }
      assertTrue("Kotlin substring should be present") {
          deferred.await() .contains("Kotlin")
      }
  }
  ```

## kotlinx ライブラリ

Kotlin 1.5.0 とともに、kotlinx ライブラリの新バージョンをリリースしています：
* `kotlinx.coroutines` [1.5.0-RC](#coroutines-1-5-0-rc)
* `kotlinx.serialization` [1.2.1](#serialization-1-2-1)
* `kotlinx-datetime` [0.2.0](#datetime-0-2-0)

### Coroutines 1.5.0-RC

`kotlinx.coroutines` [1.5.0-RC](https://github.com/Kotlin/kotlinx.coroutines/releases/tag/1.5.0-RC) が登場しました：
* [新しいチャネル API](channels.md)
* 安定版 [リアクティブ統合](async-programming.md#reactive-extensions)
* その他

Kotlin 1.5.0 以降、[実験的なコルーチン](whatsnew14.md#exclusion-of-the-deprecated-experimental-coroutines) は無効になり、`-Xcoroutines=experimental` フラグはサポートされなくなりました。

詳細は [チェンジログ](https://github.com/Kotlin/kotlinx.coroutines/releases/tag/1.5.0-RC) および [`kotlinx.coroutines` 1.5.0 リリースブログ投稿](https://blog.jetbrains.com/kotlin/2021/05/kotlin-coroutines-1-5-0-released/) を参照してください。

<video src="https://www.youtube.com/v/EVLnWOcR0is" title="kotlinx.coroutines 1.5.0"/>

### Serialization 1.2.1

`kotlinx.serialization` [1.2.1](https://github.com/Kotlin/kotlinx.serialization/releases/tag/v1.2.1) が登場しました：
* JSON シリアライゼーションのパフォーマンス向上
* JSON シリアライゼーションにおける複数名のサポート
* `@Serializable` クラスからの実験的な .proto スキーマ生成
* その他

詳細は [チェンジログ](https://github.com/Kotlin/kotlinx.serialization/releases/tag/v1.2.1) および [`kotlinx.serialization` 1.2.1 リリースブログ投稿](https://blog.jetbrains.com/kotlin/2021/05/kotlinx-serialization-1-2-released/) を参照してください。

<video src="https://www.youtube.com/v/698I_AH8h6s" title="kotlinx.serialization 1.2.1"/>

### dateTime 0.2.0

`kotlinx-datetime` [0.2.0](https://github.com/Kotlin/kotlinx-datetime/releases/tag/v0.2.0) が登場しました：
* `@Serializable` な Datetime オブジェクト
* `DateTimePeriod` と `DatePeriod` の API の正規化
* その他

詳細は [チェンジログ](https://github.com/Kotlin/kotlinx-datetime/releases/tag/v0.2.0) および [`kotlinx-datetime` 0.2.0 リリースブログ投稿](https://blog.jetbrains.com/kotlin/2021/05/kotlinx-datetime-0-2-0-is-out/) を参照してください。

## Kotlin 1.5.0 への移行

IntelliJ IDEA と Android Studio は、Kotlin プラグインが利用可能になり次第、1.5.0 へのアップデートを提案します。

既存のプロジェクトを Kotlin 1.5.0 に移行するには、Kotlin のバージョンを `1.5.0` に変更し、Gradle または Maven プロジェクトを再インポートするだけです。[Kotlin 1.5.0 へのアップデート方法を学ぶ](releases.md#update-to-a-new-kotlin-version)。

Kotlin 1.5.0 で新しいプロジェクトを開始するには、Kotlin プラグインをアップデートし、**File** | **New** | **Project** からプロジェクトウィザードを実行します。

新しいコマンドラインコンパイラは、[GitHub のリリースページ](https://github.com/JetBrains/kotlin/releases/tag/v1.5.0)からダウンロード可能です。

Kotlin 1.5.0 は[フィーチャーリリース (feature release)](kotlin-evolution-principles.md#language-and-tooling-releases) であるため、言語に互換性のない変更をもたらす可能性があります。そのような変更の詳細なリストは、[Kotlin 1.5 互換性ガイド](compatibility-guide-15.md)で見つけることができます。