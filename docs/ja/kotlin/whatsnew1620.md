[//]: # (title: Kotlin 1.6.20 の新機能)

<web-summary>新しい言語機能、Kotlin Multiplatform、JVM、Native、JS へのアップデート、Gradle および Maven のビルドツールサポートを網羅した Kotlin 1.6.20 のリリースノートをお読みください。</web-summary>

_[公開日: 2022年4月4日](releases.md#release-history)_

Kotlin 1.6.20 では、将来の言語機能のプレビューが公開され、マルチプラットフォームプロジェクトで階層構造がデフォルトになり、その他のコンポーネントにも進化的な改善がもたらされています。

変更点の簡単な概要は、こちらの動画でもご確認いただけます:

<video src="https://www.youtube.com/v/8F19ds109-o" title="What's new in Kotlin 1.6.20"/>

> Kotlin のリリースサイクルに関する情報は、[Kotlin のリリースプロセス](releases.md) を参照してください。
>
{style="tip"}

## 言語 (Language) {id="language"}

Kotlin 1.6.20 では、2つの新しい言語機能を試すことができます:

* [Kotlin/JVM 向けコンテキストレシーバーのプロトタイプ](#prototype-of-context-receivers-for-kotlin-jvm)
* [確定的非 null 許容型 (Definitely non-nullable types)](#definitely-non-nullable-types)

### Kotlin/JVM 向けコンテキストレシーバーのプロトタイプ {id="prototype-of-context-receivers-for-kotlin-jvm"}

> この機能は Kotlin/JVM でのみ利用可能なプロトタイプです。`-Xcontext-receivers` を有効にすると、
> コンパイラは製品コード（プロダクション）では使用できないプレリリースバイナリを生成します。
> コンテキストレシーバーはトイプロジェクトでのみ使用してください。
> フィードバックは [YouTrack](https://youtrack.jetbrains.com/issues/KT) までお寄せください。
>
{style="warning"}

Kotlin 1.6.20 により、レシーバーを1つしか持てないという制限がなくなりました。さらに多くのレシーバーが必要な場合は、関数、プロパティ、クラスの宣言にコンテキストレシーバーを追加することで、それらをコンテキスト依存（または_コンテキスト的_）にできます。コンテキスト宣言は以下の動作を行います:

* 宣言されたすべてのコンテキストレシーバーが、呼び出し元のスコープ内に暗黙のレシーバーとして存在することを要求します。
* 宣言されたコンテキストレシーバーを、自身のボディスコープに暗黙のレシーバーとして取り込みます。

```kotlin
interface LoggingContext {
    val log: Logger // このコンテキストはロガーへの参照を提供します 
}

context(LoggingContext)
fun startBusinessOperation() {
    // LoggingContext が暗黙のレシーバーであるため、log プロパティにアクセスできます
    log.info("Operation has started")
}

fun test(loggingContext: LoggingContext) {
    with(loggingContext) {
        // startBusinessOperation() を呼び出すには、
        // スコープ内に暗黙のレシーバーとして LoggingContext が必要です
        startBusinessOperation()
    }
}
```

プロジェクトでコンテキストレシーバーを有効にするには、`-Xcontext-receivers` コンパイラオプションを使用します。
機能とその構文の詳細な説明は、[KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/context-receivers.md#detailed-design) に記載されています。

この実装はプロトタイプであることにご注意ください:

* `-Xcontext-receivers` を有効にすると、コンパイラは製品コードでは使用できないプレリリースバイナリを生成します
* 現時点でのコンテキストレシーバーに対する IDE のサポートは最小限です

ぜひトイプロジェクトでこの機能を試し、[こちらの YouTrack イシュー](https://youtrack.jetbrains.com/issue/KT-42435) でご意見や感想を共有してください。
問題が発生した場合は、[新しいイシューを作成](https://kotl.in/issue) してください。

### 確定的非 null 許容型 (Definitely non-nullable types) {id="definitely-non-nullable-types"}

> 確定的非 null 許容型は [Beta](components-stability.md) です。ほぼ安定していますが、
> 将来的に移行手順が必要になる可能性があります。
> 変更が必要となる場合でも、影響を最小限に抑えるよう努めます。
>
{style="warning"}

ジェネリックな Java クラスやインターフェースを拡張する際の相互運用性を向上させるため、Kotlin 1.6.20 では新しい構文 `T & Any` を使用して、使用箇所（use-site）でジェネリック型パラメータを確定的非 null 許容（definitely non-nullable）としてマークできるようになりました。
この構文形式は [交差型（intersection types）](https://en.wikipedia.org/wiki/Intersection_type) の表記に由来しており、現在は `&` の左側に null 許容の上限境界を持つ型パラメータ、右側に非 null 許容の `Any` を置く形に限定されています:

```kotlin
fun <T> elvisLike(x: T, y: T & Any): T & Any = x ?: y

fun main() {
    // OK
    elvisLike<String>("", "").length
    // エラー: 'null' cannot be a value of a non-null type
    elvisLike<String>("", null).length

    // OK
    elvisLike<String?>(null, "").length
    // エラー: 'null' cannot be a value of a non-null type
    elvisLike<String?>(null, null).length
}
```
{validate="false"}

この機能を有効にするには、言語バージョンを `1.7` に設定します:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets.all {
        languageSettings.apply {
            languageVersion = "1.7"
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets.all {
        languageSettings {
            languageVersion = '1.7'
        }
    }
}
```

</tab>
</tabs>

確定的非 null 許容型の詳細については、[KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/definitely-non-nullable-types.md) を参照してください。

## Kotlin/JVM {id="kotlin-jvm"}

Kotlin 1.6.20 では以下が導入されています:

* JVM インターフェースのデフォルトメソッドに関する互換性の改善: [インターフェース用の新しい `@JvmDefaultWithCompatibility` アノテーション](#new-jvmdefaultwithcompatibility-annotation-for-interfaces) および [`-Xjvm-default` モードにおける互換性の変更](#compatibility-changes-in-the-xjvm-default-modes)
* [JVM バックエンドにおける単一モジュールの並列コンパイルのサポート](#support-for-parallel-compilation-of-a-single-module-in-the-jvm-backend)
* [関数型インターフェースコンストラクタへの呼び出し可能参照のサポート](#support-for-callable-references-to-functional-interface-constructors)

### インターフェース用の新しい @JvmDefaultWithCompatibility アノテーション {id="new-jvmdefaultwithcompatibility-annotation-for-interfaces"}

Kotlin 1.6.20 では、新しいアノテーション [`@JvmDefaultWithCompatibility`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-default-with-compatibility/) が導入されました。これを `-Xjvm-default=all` コンパイラオプションとともに使用すると、任意の Kotlin インターフェース内の任意の非抽象メンバーに対して [JVM インターフェースのデフォルトメソッドを作成](java-to-kotlin-interop.md#default-methods-in-interfaces) できます。

`-Xjvm-default=all` オプションなしでコンパイルされた Kotlin インターフェースを使用しているクライアントが存在する場合、このオプション付きでコンパイルされたコードとはバイナリ非互換になる可能性があります。
Kotlin 1.6.20 より前は、この互換性の問題を回避するための [推奨アプローチ](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-m3-generating-default-methods-in-interfaces/#JvmDefaultWithoutCompatibility) として、`-Xjvm-default=all-compatibility` モードを使用し、この種の互換性を必要としないインターフェースには `@JvmDefaultWithoutCompatibility` アノテーションを付与する方法が取られていました。

しかし、このアプローチにはいくつかの欠点がありました:

* 新しいインターフェースを追加した際に、アノテーションの付与を忘れがちになる。
* 通常、公開 API よりも非公開部分のインターフェースの方が多いため、結果としてコード内の多くの場所にこのアノテーションを記述することになる。

現在は、`-Xjvm-default=all` モードを使用し、インターフェースに `@JvmDefaultWithCompatibility` アノテーションを付けることができます。
これにより、公開 API 内のすべてのインターフェースに対して一度だけこのアノテーションを追加すれば済み、新しい非公開コードにはアノテーションを使用する必要がなくなります。

この新しいアノテーションに関するフィードバックは、[こちらの YouTrack チケット](https://youtrack.jetbrains.com/issue/KT-48217) にお寄せください。

### -Xjvm-default モードにおける互換性の変更 {id="compatibility-changes-in-the-xjvm-default-modes"}

Kotlin 1.6.20 では、デフォルトモード（`-Xjvm-default=disable` コンパイラオプション）のモジュールを、`-Xjvm-default=all` または `-Xjvm-default=all-compatibility` モードでコンパイルされたモジュールに対してコンパイルするオプションが追加されました。
従来どおり、すべてのモジュールが `-Xjvm-default=all` または `-Xjvm-default=all-compatibility` モードである場合もコンパイルは成功します。
フィードバックは [こちらの YouTrack イシュー](https://youtrack.jetbrains.com/issue/KT-47000) までお寄せください。

Kotlin 1.6.20 では、コンパイラオプション `-Xjvm-default` の `compatibility` モードおよび `enable` モードが非推奨になりました。
互換性に関して他のモードの説明に変更がありますが、全体的なロジックは同じままです。
[更新された説明](java-to-kotlin-interop.md#compatibility-modes-for-default-methods) を確認できます。

Java 相互運用におけるデフォルトメソッドの詳細については、[相互運用性のドキュメント](java-to-kotlin-interop.md#default-methods-in-interfaces) および [こちらのブログ記事](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-m3-generating-default-methods-in-interfaces/) を参照してください。

### JVM バックエンドにおける単一モジュールの並列コンパイルのサポート {id="support-for-parallel-compilation-of-a-single-module-in-the-jvm-backend"}

> JVM バックエンドにおける単一モジュールの並列コンパイルのサポートは [実験的（Experimental）](components-stability.md) です。
> いつでも削除または変更される可能性があります。オプトインが必要です（詳細は以下を参照）。評価目的でのみ使用してください。
> フィードバックは [YouTrack](https://youtrack.jetbrains.com/issue/KT-46085) までお寄せください。
>
{style="warning"}

私たちは、[新しい JVM IR バックエンドのコンパイル時間を改善する](https://youtrack.jetbrains.com/issue/KT-46768) ための作業を継続しています。
Kotlin 1.6.20 では、モジュール内のすべてのファイルを並列にコンパイルする実験的な JVM IR バックエンドモードを追加しました。
並列コンパイルにより、合計コンパイル時間を最大 15% 短縮できます。

実験的な並列バックエンドモードを有効にするには、[コンパイラオプション](compiler-reference.md#compiler-options) `-Xbackend-threads` を使用します。
このオプションには以下の引数を使用します:

* `N`: 使用したいスレッド数。CPU コア数を超えないようにしてください。超えるとスレッド間のコンテキストスイッチにより並列化の効果が失われます。
* `0`: CPU コアごとに個別のスレッドを使用します。

[Gradle](gradle.md) はタスクを並列に実行できますが、Gradle から見てプロジェクト（またはプロジェクトの大部分）が1つの大きなタスクである場合、この種の並列化はあまり役に立ちません。
非常に大きなモノリシックなモジュールがある場合は、並列コンパイルを使用してより高速にコンパイルしてください。
プロジェクトが多数の小さなモジュールで構成され、Gradle によってビルドが並列化されている場合、別の層で並列化を追加すると、コンテキストスイッチによってパフォーマンスが低下する可能性があります。

> 並列コンパイルにはいくつかの制約があります:
> * kapt は IR バックエンドを無効にするため、[kapt](kapt.md) とは併用できません
> * 設計上、より多くの JVM ヒープを必要とします。ヒープの量はスレッド数に比例します
>
{style="note"}

### 関数型インターフェースコンストラクタへの呼び出し可能参照のサポート {id="support-for-callable-references-to-functional-interface-constructors"}

> 関数型インターフェースコンストラクタへの呼び出し可能参照のサポートは [実験的（Experimental）](components-stability.md) です。
> いつでも削除または変更される可能性があります。オプトインが必要です（詳細は以下を参照）。評価目的でのみ使用してください。
> フィードバックは [YouTrack](https://youtrack.jetbrains.com/issue/KT-47939) までお寄せください。
>
{style="warning"}

関数型インターフェースコンストラクタへの [呼び出し可能参照（callable references）](fun-interfaces.md#migration-from-an-interface-with-constructor-function-to-a-functional-interface) のサポートにより、コンストラクタ関数を持つインターフェースから [関数型インターフェース (functional interface)](fun-interfaces.md) へのソース互換性のある移行方法が追加されます。

次のコードを考えてみましょう:

```kotlin
interface Printer {
    fun print()
}

fun Printer(block: () -> Unit): Printer = object : Printer { override fun print() = block() }
```

関数型インターフェースコンストラクタへの呼び出し可能参照を有効にすると、このコードを単なる関数型インターフェースの宣言に置き換えることができます:

```kotlin
fun interface Printer {
    fun print()
}
```

そのコンストラクタは暗黙的に作成され、`::Printer` 関数参照を使用するコードはすべてコンパイルされます。例えば:

```kotlin
documentsStorage.addPrinter(::Printer)
```
{validate="false"}

レガシーな関数 `Printer` に `DeprecationLevel.HIDDEN` を指定した [`@Deprecated`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-deprecated/) アノテーションを付与することで、バイナリ互換性を維持します:

```kotlin
@Deprecated(message = "Your message about the deprecation", level = DeprecationLevel.HIDDEN)
fun Printer(...) {...}
```
{validate="false"}

この機能を有効にするには、コンパイラオプション `-XXLanguage:+KotlinFunInterfaceConstructorReference` を使用してください。

## Kotlin/Native {id="kotlin-native"}

Kotlin/Native 1.6.20 は、新しいコンポーネントの継続的な開発を示しています。他のプラットフォームの Kotlin との一貫した体験に向けて、さらなる一歩を踏み出しました:

* [新しいメモリマネージャーに関するアップデート](#an-update-on-the-new-memory-manager)
* [新メモリマネージャーにおけるスイープフェーズの並行実装](#concurrent-implementation-for-the-sweep-phase-in-new-memory-manager)
* [アノテーションクラスのインスタンス化](#instantiation-of-annotation-classes)
* [Swift async/await との相互運用: KotlinUnit の代わりに Swift の Void を返す](#interop-with-swift-async-await-returning-void-instead-of-kotlinunit)
* [libbacktrace によるスタックトレースの改善](#better-stack-traces-with-libbacktrace)
* [スタンドアロン Android 実行可能ファイルのサポート](#support-for-standalone-android-executables)
* [パフォーマンスの向上](#performance-improvements)
* [cinterop モジュールインポート時のエラーハンドリングの改善](#improved-error-handling-during-cinterop-modules-import)
* [Xcode 13 ライブラリのサポート](#support-for-xcode-13-libraries)

### 新しいメモリマネージャーに関するアップデート {id="an-update-on-the-new-memory-manager"}

> 新しい Kotlin/Native メモリマネージャーは [Alpha](components-stability.md) です。
> 将来、非互換の変更が行われ、手動での移行が必要になる可能性があります。
> フィードバックは [YouTrack](https://youtrack.jetbrains.com/issue/KT-48525) までお寄せください。
>
{style="note"}

Kotlin 1.6.20 では、新しい Kotlin/Native メモリマネージャーの Alpha バージョンを試すことができます。
これにより JVM プラットフォームと Native プラットフォームの違いが解消され、マルチプラットフォームプロジェクトで一貫した開発者体験が提供されます。
例えば、Android と iOS の両方で動作する新しいクロスプラットフォームモバイルアプリケーションの作成がはるかに容易になります。

新しい Kotlin/Native メモリマネージャーは、スレッド間でのオブジェクト共有に関する制限を解除します。
また、特別な管理やアノテーションを必要とせず、安全でリークのない並行プログラミングのプリミティブを提供します。

新しいメモリマネージャーは将来のバージョンでデフォルトになる予定ですので、ぜひ今すぐお試しください。
詳細やデモプロジェクトについては [ブログ記事](https://blog.jetbrains.com/kotlin/2021/08/try-the-new-kotlin-native-memory-manager-development-preview/) を確認するか、[移行手順](https://github.com/JetBrains/kotlin/blob/master/kotlin-native/NEW_MM.md) に直接進んでご自身でお試しください。

ご自身のプロジェクトで新しいメモリマネージャーを試して動作を確認し、課題トラッカーの [YouTrack](https://youtrack.jetbrains.com/issue/KT-48525) でフィードバックを共有してください。

### 新メモリマネージャーにおけるスイープフェーズの並行実装 {id="concurrent-implementation-for-the-sweep-phase-in-new-memory-manager"}

[Kotlin 1.6 で発表された](whatsnew16.md#preview-of-the-new-memory-manager) 新しいメモリマネージャーにすでに移行している場合は、実行時間が大幅に改善されていることに気づくかもしれません。ベンチマークでは平均 35% の改善が示されています。
1.6.20 からは、新しいメモリマネージャー向けにスイープフェーズの並行（concurrent）実装も利用可能になりました。
これにより、パフォーマンスがさらに向上し、ガベージコレクターの一時停止時間（pause）が短縮されるはずです。

新しい Kotlin/Native メモリマネージャーでこの機能を有効にするには、次のコンパイラオプションを渡します:

```bash
-Xgc=cms 
```

新しいメモリマネージャーのパフォーマンスに関するフィードバックは、[こちらの YouTrack イシュー](https://youtrack.jetbrains.com/issue/KT-48526) でお気軽にお寄せください。

### アノテーションクラスのインスタンス化 {id="instantiation-of-annotation-classes"}

Kotlin 1.6.0 では、アノテーションクラスのインスタンス化が Kotlin/JVM および Kotlin/JS で [Stable](components-stability.md) になりました。
1.6.20 バージョンでは、Kotlin/Native に対するサポートが提供されます。

詳細については、[アノテーションクラスのインスタンス化](annotations.md#instantiation) を参照してください。

### Swift async/await との相互運用: KotlinUnit の代わりに Void を返す {id="interop-with-swift-async-await-returning-void-instead-of-kotlinunit"}

> Swift async/await との並行性相互運用は [実験的（Experimental）](components-stability.md) です。いつでも削除または変更される可能性があります。
> 評価目的でのみ使用してください。フィードバックは [YouTrack](https://youtrack.jetbrains.com/issue/KT-47610) までお寄せください。
>
{style="warning"}

[Swift の async/await との実験的な相互運用](whatsnew1530.md#experimental-interoperability-with-swift-5-5-async-await)（Swift 5.5 以降で利用可能）の作業を継続しています。
Kotlin 1.6.20 では、戻り値の型が `Unit` である `suspend` 関数の処理方法が以前のバージョンと異なります。

以前は、そのような関数は Swift では `KotlinUnit` を返す `async` 関数として提示されていました。しかし、非 suspend 関数と同様に、それらの適切な戻り値の型は `Void` です。

既存のコードの破損を防ぐため、`Unit` を返す suspend 関数を `Void` 戻り値の型の `async` Swift 関数にコンパイラが変換するように設定できる Gradle プロパティを導入します:

```none
# gradle.properties
kotlin.native.binary.unitSuspendFunctionObjCExport=proper
```

将来の Kotlin リリースでは、この動作をデフォルトにする予定です。

### libbacktrace によるスタックトレースの改善 {id="better-stack-traces-with-libbacktrace"}

> ソース位置の解決に libbacktrace を使用する機能は [実験的（Experimental）](components-stability.md) です。いつでも削除または変更される可能性があります。
> 評価目的でのみ使用してください。フィードバックは [YouTrack](https://youtrack.jetbrains.com/issue/KT-48424) までお寄せください。
>
{style="warning"}

Kotlin/Native で、`linux*`（`linuxMips32` および `linuxMipsel32` を除く）および `androidNative*` ターゲットのデバッグを改善するために、ファイルの位置と行番号を含む詳細なスタックトレースを生成できるようになりました。

この機能は、内部で [libbacktrace](https://github.com/ianlancetaylor/libbacktrace) ライブラリを使用しています。
違いの例を確認するには、次のコードをご覧ください:

```kotlin
fun main() = bar()
fun bar() = baz()
inline fun baz() {
    error("")
}
```

* **1.6.20 より前:**

```text
Uncaught Kotlin exception: kotlin.IllegalStateException:
   at 0   example.kexe        0x227190       kfun:kotlin.Throwable#<init>(kotlin.String?){} + 96
   at 1   example.kexe        0x221e4c       kfun:kotlin.Exception#<init>(kotlin.String?){} + 92
   at 2   example.kexe        0x221f4c       kfun:kotlin.RuntimeException#<init>(kotlin.String?){} + 92
   at 3   example.kexe        0x22234c       kfun:kotlin.IllegalStateException#<init>(kotlin.String?){} + 92
   at 4   example.kexe        0x25d708       kfun:#bar(){} + 104
   at 5   example.kexe        0x25d68c       kfun:#main(){} + 12
```
{initial-collapse-state="collapsed" collapsible="true"}

* **libbacktrace を使用した 1.6.20:**

```text
Uncaught Kotlin exception: kotlin.IllegalStateException:
   at 0   example.kexe        0x229550    kfun:kotlin.Throwable#<init>(kotlin.String?){} + 96 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Throwable.kt:24:37)
   at 1   example.kexe        0x22420c    kfun:kotlin.Exception#<init>(kotlin.String?){} + 92 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Exceptions.kt:23:44)
   at 2   example.kexe        0x22430c    kfun:kotlin.RuntimeException#<init>(kotlin.String?){} + 92 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Exceptions.kt:34:44)
   at 3   example.kexe        0x22470c    kfun:kotlin.IllegalStateException#<init>(kotlin.String?){} + 92 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Exceptions.kt:70:44)
   at 4   example.kexe        0x25fac8    kfun:#bar(){} + 104 [inlined] (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/libraries/stdlib/src/kotlin/util/Preconditions.kt:143:56)
   at 5   example.kexe        0x25fac8    kfun:#bar(){} + 104 [inlined] (/private/tmp/backtrace/src/commonMain/kotlin/app.kt:4:5)
   at 6   example.kexe        0x25fac8    kfun:#bar(){} + 104 (/private/tmp/backtrace/src/commonMain/kotlin/app.kt:2:13)
   at 7   example.kexe        0x25fa4c    kfun:#main(){} + 12 (/private/tmp/backtrace/src/commonMain/kotlin/app.kt:1:14)
```
{initial-collapse-state="collapsed" collapsible="true"}

スタックトレースにファイルの位置と行番号がすでに含まれていた Apple ターゲットでは、libbacktrace によりインライン関数呼び出しの詳細がさらに多く提供されます:

* **1.6.20 より前:**

```text
Uncaught Kotlin exception: kotlin.IllegalStateException:
   at 0   example.kexe    0x10a85a8f8    kfun:kotlin.Throwable#<init>(kotlin.String?){} + 88 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Throwable.kt:24:37)
   at 1   example.kexe    0x10a855846    kfun:kotlin.Exception#<init>(kotlin.String?){} + 86 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Exceptions.kt:23:44)
   at 2   example.kexe    0x10a855936    kfun:kotlin.RuntimeException#<init>(kotlin.String?){} + 86 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Exceptions.kt:34:44)
   at 3   example.kexe    0x10a855c86    kfun:kotlin.IllegalStateException#<init>(kotlin.String?){} + 86 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Exceptions.kt:70:44)
   at 4   example.kexe    0x10a8489a5    kfun:#bar(){} + 117 (/private/tmp/backtrace/src/commonMain/kotlin/app.kt:2:1)
   at 5   example.kexe    0x10a84891c    kfun:#main(){} + 12 (/private/tmp/backtrace/src/commonMain/kotlin/app.kt:1:14)
...
```
{initial-collapse-state="collapsed" collapsible="true"}

* **libbacktrace を使用した 1.6.20:**

```text
Uncaught Kotlin exception: kotlin.IllegalStateException:
   at 0   example.kexe    0x10669bc88    kfun:kotlin.Throwable#<init>(kotlin.String?){} + 88 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Throwable.kt:24:37)
   at 1   example.kexe    0x106696bd6    kfun:kotlin.Exception#<init>(kotlin.String?){} + 86 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Exceptions.kt:23:44)
   at 2   example.kexe    0x106696cc6    kfun:kotlin.RuntimeException#<init>(kotlin.String?){} + 86 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Exceptions.kt:34:44)
   at 3   example.kexe    0x106697016    kfun:kotlin.IllegalStateException#<init>(kotlin.String?){} + 86 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Exceptions.kt:70:44)
   at 4   example.kexe    0x106689d35    kfun:#bar(){} + 117 [inlined] (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/libraries/stdlib/src/kotlin/util/Preconditions.kt:143:56)
>>  at 5   example.kexe    0x106689d35    kfun:#bar(){} + 117 [inlined] (/private/tmp/backtrace/src/commonMain/kotlin/app.kt:4:5)
   at 6   example.kexe    0x106689d35    kfun:#bar(){} + 117 (/private/tmp/backtrace/src/commonMain/kotlin/app.kt:2:13)
   at 7   example.kexe    0x106689cac    kfun:#main(){} + 12 (/private/tmp/backtrace/src/commonMain/kotlin/app.kt:1:14)
...
```
{initial-collapse-state="collapsed" collapsible="true"}

libbacktrace を使用してより優れたスタックトレースを生成するには、`gradle.properties` に次の行を追加します:

```none
# gradle.properties
kotlin.native.binary.sourceInfoType=libbacktrace
```

libbacktrace を使用した Kotlin/Native のデバッグの使用感について、[こちらの YouTrack イシュー](https://youtrack.jetbrains.com/issue/KT-48424) でぜひお知らせください。

### スタンドアロン Android 実行可能ファイルのサポート {id="support-for-standalone-android-executables"}

従来、Kotlin/Native における Android Native 実行可能ファイルは、実際には実行可能ファイルではなく、NativeActivity として使用できる共有ライブラリでした。現在は、Android Native ターゲット向けに標準の実行可能ファイルを生成するオプションが用意されています。

そのためには、プロジェクトの `build.gradle(.kts)` で、`androidNative` ターゲットの executable ブロックを設定します。
次のバイナリオプションを追加してください:

```kotlin
kotlin {
    androidNativeX64("android") {
        binaries {
            executable {
                binaryOptions["androidProgramType"] = "standalone"
            }
        }
    }
}
```

この機能は Kotlin 1.7.0 でデフォルトになる予定ですのでご注意ください。
現在の動作を維持したい場合は、次の設定を使用してください:

```kotlin
binaryOptions["androidProgramType"] = "nativeActivity"
```

この[実装](https://github.com/jetbrains/kotlin/pull/4624)を提供してくれた Mattia Iavarone 氏に感謝します！

### パフォーマンスの向上 {id="performance-improvements"}

私たちは Kotlin/Native の[コンパイルプロセスの高速化](https://youtrack.jetbrains.com/issue/KT-42294)と開発体験の向上に懸命に取り組んでいます。

Kotlin 1.6.20 では、Kotlin が生成する LLVM IR に影響を与えるいくつかのパフォーマンスアップデートとバグ修正が行われました。
社内プロジェクトのベンチマークによると、平均して以下のパフォーマンス向上が達成されました:

* 実行時間を 15% 削減
* リリースバイナリとデバッグバイナリの両方のコードサイズを 20% 削減
* リリースバイナリのコンパイル時間を 26% 削減

これらの変更により、大規模な社内プロジェクトにおいて、デバッグバイナリのコンパイル時間も 10% 短縮されました。

これを実現するために、コンパイラが生成する一部の合成オブジェクト（synthetic objects）の静的初期化を実装し、各関数の LLVM IR の構造化方法を改善し、コンパイラキャッシュを最適化しました。

### cinterop モジュールインポート時のエラーハンドリングの改善 {id="improved-error-handling-during-cinterop-modules-import"}

本リリースでは、（CocoaPods の Pod で典型的なように）`cinterop` ツールを使用して Objective-C モジュールをインポートする場合のエラーハンドリングが改善されました。
以前は、Objective-C モジュールを処理しようとしてエラーが発生した場合（例えば、ヘッダー内のコンパイルエラーを処理する場合）、`fatal error: could not build module $name` のような情報量の少ないエラーメッセージが表示されていました。
`cinterop` ツールのこの部分を拡張したため、詳細な説明を含むエラーメッセージが表示されるようになります。

### Xcode 13 ライブラリのサポート {id="support-for-xcode-13-libraries"}

本リリースより、Xcode 13 に付属するライブラリが完全にサポートされます。
Kotlin コード内のどこからでも自由に使用できます。

## Kotlin Multiplatform {id="kotlin-multiplatform"}

1.6.20 では、Kotlin Multiplatform に以下の注目すべきアップデートがもたらされます:

* [すべての新しいマルチプラットフォームプロジェクトで階層構造のサポートがデフォルトに](#hierarchical-structure-support-for-multiplatform-projects)
* [Kotlin CocoaPods Gradle プラグインに CocoaPods 統合のための便利な機能を複数追加](#kotlin-cocoapods-gradle-plugin)

### マルチプラットフォームプロジェクトにおける階層構造のサポート {id="hierarchical-structure-support-for-multiplatform-projects"}

Kotlin 1.6.20 では、階層構造のサポートがデフォルトで有効になっています。[Kotlin 1.4.0 で導入](whatsnew14.md#sharing-code-in-several-targets-with-the-hierarchical-project-structure) されて以来、フロントエンドを大幅に改善し、IDE のインポートを安定させました。

従来、マルチプラットフォームプロジェクトにコードを追加する方法は2つありました。1つ目はプラットフォーム固有のソースセットに挿入する方法で、これは1つのターゲットに限定され、他のプラットフォームで再利用することはできません。
2つ目は、Kotlin が現在サポートしているすべてのプラットフォーム間で共有される共通ソースセットを使用する方法です。

今回の変更により、共通のロジックやサードパーティ API を多く再利用する複数の類似した Native ターゲット間で [ソースコードを共有](#better-code-sharing-in-your-project) できるようになりました。
この技術により、適切なデフォルトの依存関係が提供され、共有コードで利用可能な正確な API が検出されます。
これにより、複雑なビルド設定や、Native ターゲット間でソースセットを共有するための IDE サポートを得るための回避策を使用する必要がなくなります。
また、別のターゲット向けに意図された安全でない API の使用を防ぐのにも役立ちます。

階層型プロジェクト構造を使用すると、ターゲットのサブセット向けの共通 API を持つライブラリを公開および使用できるようになるため、この技術は [ライブラリの作成者](#more-opportunities-for-library-authors) にとっても重宝します。

デフォルトでは、階層型プロジェクト構造で公開されたライブラリは、階層構造を持つプロジェクトとのみ互換性があります。

#### プロジェクトでのより優れたコード共有 {id="better-code-sharing-in-your-project"}

階層構造のサポートがない場合、_一部_ の [Kotlin ターゲット](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#targets) 間でのみコードを共有し、_すべて_ のターゲット間では共有しないという簡単な方法はありませんでした。
よくある例としては、すべての iOS ターゲット間でコードを共有し、Foundation などの iOS 固有の [依存関係](https://kotlinlang.org/docs/multiplatform/multiplatform-share-on-platforms.html#connect-platform-specific-libraries) にアクセスしたい場合などです。

階層型プロジェクト構造のサポートのおかげで、設定なしですぐにこれが実現できるようになりました。
新しい構造では、ソースセットが階層を形成します。
特定のソースセットがコンパイルされる各ターゲットで利用可能な、プラットフォーム固有の言語機能や依存関係を使用できます。

例えば、iOS デバイスとシミュレーター用の2つのターゲット（`iosArm64` と `iosX64`）を持つ典型的なマルチプラットフォームプロジェクトを考えてみましょう。
Kotlin ツール群は両方のターゲットに同じ関数があることを認識し、中間ソースセットである `iosMain` からその関数にアクセスできるようにします。

![iOS の階層の例](ios-hierarchy-example.jpg){width=700}

Kotlin ツールチェーンは、Kotlin/Native 標準ライブラリや Native ライブラリなどの適切なデフォルトの依存関係を提供します。
さらに、Kotlin ツール群は、共有コードで利用可能な API の領域を正確に見つけ出すよう最善を尽くします。
これにより、例えば Windows 向けに共有されているコードで macOS 固有の関数を使用するといった事態を防ぐことができます。

#### ライブラリ作成者向けのさらなる機会 {id="more-opportunities-for-library-authors"}

マルチプラットフォームライブラリが公開されると、その中間ソースセットの API も一緒に適切に公開され、利用者がアクセスできるようになります。
ここでも、Kotlin ツールチェーンは利用側のソースセットで利用可能な API を自動的に把握し、JS コードで JVM 向けの API を使用するような危険な使用法を慎重に防止します。
詳細については、[ライブラリでのコード共有](https://kotlinlang.org/docs/multiplatform/multiplatform-share-on-platforms.html#share-code-in-libraries) を参照してください。

#### 設定とセットアップ {id="configuration-and-setup"}

Kotlin 1.6.20 以降、すべての新しいマルチプラットフォームプロジェクトは階層型プロジェクト構造を持ちます。追加のセットアップは不要です。

* すでに [手動で有効にしている](https://kotlinlang.org/docs/multiplatform/multiplatform-share-on-platforms.html#share-code-on-similar-platforms) 場合は、`gradle.properties` から非推奨のオプションを削除できます:

  ```none
  # gradle.properties
  kotlin.mpp.enableGranularSourceSetsMetadata=true
  kotlin.native.enableDependencyPropagation=false // 以前の設定に応じて 'true' の場合もあります
  ```

* Kotlin 1.6.20 では、最高のエクスペリエンスを得るために [Android Studio 2021.1.1](https://developer.android.com/studio) (Bumblebee) 以降を使用することをお勧めします。

* オプトアウトすることも可能です。階層構造のサポートを無効にするには、`gradle.properties` で次のオプションを設定します:

  ```none
  # gradle.properties
  kotlin.mpp.hierarchicalStructureSupport=false
  ```

#### フィードバックのお願い {id="leave-your-feedback"}

これはエコシステム全体に対する重要な変更です。さらに良いものにするために、皆様からのフィードバックをお待ちしております。

今すぐ試してみて、遭遇した問題があれば [課題トラッカー](https://kotl.in/issue) までご報告ください。

### Kotlin CocoaPods Gradle プラグイン {id="kotlin-cocoapods-gradle-plugin"}

CocoaPods の統合を簡素化するため、Kotlin 1.6.20 では以下の機能が提供されます:

* CocoaPods プラグインに、登録されたすべてのターゲットを含む XCFrameworks をビルドし、Podspec ファイルを生成するタスクが追加されました。これは、Xcode と直接統合せず、アーティファクトをビルドしてローカルの CocoaPods リポジトリにデプロイしたい場合に役立ちます。
  
  詳細については、[XCFrameworks のビルド](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html#build-xcframeworks) を参照してください。

* プロジェクトで [CocoaPods 統合](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-overview.html) を使用している場合、これまでは Gradle プロジェクト全体に対して必要な Pod バージョンを指定することに慣れていたかもしれません。現在はより多くのオプションがあります:
  * `cocoapods` ブロックで Pod バージョンを直接指定する
  * 引き続き Gradle プロジェクトのバージョンを使用する
  
  これらのプロパティのいずれも設定されていない場合は、エラーが発生します。

* Gradle プロジェクト全体の名前を変更する代わりに、`cocoapods` ブロックで CocoaPod 名を設定できるようになりました。

* CocoaPods プラグインに新しい `extraSpecAttributes` プロパティが導入され、これを使用して、以前はハードコードされていた `libraries` や `vendored_frameworks` などの Podspec ファイル内のプロパティを設定できるようになりました。

```kotlin
kotlin {
    cocoapods {
        version = "1.0"
        name = "MyCocoaPod"
        extraSpecAttributes["social_media_url"] = 'https://twitter.com/kotlin'
        extraSpecAttributes["vendored_frameworks"] = 'CustomFramework.xcframework'
        extraSpecAttributes["libraries"] = 'xml'
    }
}
```

完全な Kotlin CocoaPods Gradle プラグインの [DSL リファレンス](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-dsl-reference.html) を参照してください。

## Kotlin/JS {id="kotlin-js"}

1.6.20 における Kotlin/JS の改善は、主に IR コンパイラに影響を与えます:

* [開発用バイナリのインクリメンタルコンパイル (IR)](#incremental-compilation-for-development-binaries-with-ir-compiler)
* [デフォルトでのトップレベルプロパティの遅延初期化 (IR)](#lazy-initialization-of-top-level-properties-by-default-with-ir-compiler)
* [デフォルトでプロジェクトモジュールごとに分割された JS ファイル (IR)](#separate-js-files-for-project-modules-by-default-with-ir-compiler)
* [Char クラスの最適化 (IR)](#char-class-optimization)
* [エクスポートの改善（IR バックエンドおよびレガシーバックエンドの両方）](#improvements-to-export-and-typescript-declaration-generation)
* [非同期テストに対する @AfterTest の保証](#aftertest-guarantees-for-asynchronous-tests)

### IR コンパイラによる開発用バイナリのインクリメンタルコンパイル {id="incremental-compilation-for-development-binaries-with-ir-compiler"}

IR コンパイラを使用した Kotlin/JS の開発をより効率的にするため、新しい_インクリメンタルコンパイル（差分コンパイル）_モードを導入します。

このモードで `compileDevelopmentExecutableKotlinJs` Gradle タスクを使用して**開発用バイナリ**をビルドする場合、コンパイラは以前のコンパイル結果をモジュールレベルでキャッシュします。
以降のコンパイルでは、変更されていないソースファイルに対してキャッシュされたコンパイル結果が使用されるため、特に小さな変更の場合にコンパイルがより迅速に完了します。
この改善は開発プロセス（編集・ビルド・デバッグサイクルの短縮）のみを対象としており、本番用アーティファクトのビルドには影響しないことに注意してください。

開発用バイナリのインクリメンタルコンパイルを有効にするには、プロジェクトの `gradle.properties` に次の行を追加します:

```none
# gradle.properties
kotlin.incremental.js.ir=true // デフォルトは false
```

テストプロジェクトでは、新しいモードによりインクリメンタルコンパイルが最大 30% 高速化しました。ただし、このモードでのクリーンビルドは、キャッシュを作成して配置する必要があるため遅くなります。

Kotlin/JS プロジェクトでのインクリメンタルコンパイルの使用について、[こちらの YouTrack イシュー](https://youtrack.jetbrains.com/issue/KT-50203) でご意見をお聞かせください。

### IR コンパイラにおけるトップレベルプロパティのデフォルトでの遅延初期化 {id="lazy-initialization-of-top-level-properties-by-default-with-ir-compiler"}

Kotlin 1.4.30 では、JS IR コンパイラにおける [トップレベルプロパティの遅延初期化（lazy initialization）](whatsnew1430.md#lazy-initialization-of-top-level-properties) のプロトタイプを発表しました。
遅延初期化は、アプリケーション起動時にすべてのプロパティを初期化する必要性をなくすことで、起動時間を短縮します。
実際の Kotlin/JS アプリケーションでの測定では、約 10% の高速化が示されました。

この仕組みをブラッシュアップし適切にテストした結果、IR コンパイラにおけるトップレベルプロパティの初期化がデフォルトで遅延初期化されるようになりました。

```kotlin
// 遅延初期化
val a = run {
    val result = // 重い計算処理
        println(result)
    result
} // run は変数が最初に使用されたときに実行されます
```

何らかの理由でプロパティを先行して（アプリケーション起動時に）初期化する必要がある場合は、[`@EagerInitialization`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.native/-eager-initialization/) アノテーションでマークしてください。

### IR コンパイラにおけるモジュールごとの JS ファイル分割がデフォルトに {id="separate-js-files-for-project-modules-by-default-with-ir-compiler"}

以前、JS IR コンパイラにはプロジェクトモジュールごとに [個別の `.js` ファイルを生成する機能](https://youtrack.jetbrains.com/issue/KT-44319) がありました。
これは、プロジェクト全体で単一の `.js` ファイルを出力するデフォルトオプションの代替手段でした。
単一のファイルは大きすぎて使用しにくい場合があります。プロジェクトの関数を使用したい場合は常に、JS ファイル全体を依存関係として含める必要があるためです。
複数のファイルに分割することで柔軟性が高まり、そのような依存関係のサイズを小さくすることができます。この機能は、`-Xir-per-module` コンパイラオプションで利用可能でした。

1.6.20 からは、JS IR コンパイラはデフォルトでプロジェクトモジュールごとに個別の `.js` ファイルを生成します。

プロジェクトを単一の `.js` ファイルにコンパイルする設定は、次の Gradle プロパティで引き続き利用可能です:

```none
# gradle.properties
kotlin.js.ir.output.granularity=whole-program // デフォルトは `per-module`
```

以前のリリースでは、実験的なモジュール単位モード（`-Xir-per-module=true` フラグで利用可能）では各モジュールの `main()` 関数が呼び出されていました。これは通常の単一 `.js` モードと一貫性がありませんでした。1.6.20 以降は、どちらの場合もメインモジュールでのみ `main()` 関数が呼び出されます。モジュールの読み込み時にコードを実行する必要がある場合は、`@EagerInitialization` アノテーションが付いたトップレベルプロパティを使用できます。[デフォルトでのトップレベルプロパティの遅延初期化 (IR)](#lazy-initialization-of-top-level-properties-by-default-with-ir-compiler) を参照してください。

### Char クラスの最適化 {id="char-class-optimization"}

`Char` クラスは、ボクシングを発生させることなく Kotlin/JS コンパイラによって処理されるようになりました（[インラインクラス](inline-classes.md) と同様）。
これにより、Kotlin/JS コードにおける文字操作が高速化されます。

パフォーマンスの向上とは別に、これにより `Char` が JavaScript にエクスポートされる方法が変わり、`Number` に変換されるようになります。

### エクスポートおよび TypeScript 型定義生成の改善 {id="improvements-to-export-and-typescript-declaration-generation"}

Kotlin 1.6.20 では、[TypeScript 型定義ファイル（`.d.ts`）の生成](js-project-setup.md#generation-of-typescript-declaration-files-d-ts) を含むエクスポート機能（[`@JsExport`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/-js-export/) アノテーション）に対して複数の修正と改善がもたらされています。
インターフェースと enum をエクスポートする機能が追加され、以前報告されていた一部のエッジケースにおけるエクスポート動作が修正されました。
詳細については、[YouTrack のエクスポート改善リスト](https://youtrack.jetbrains.com/issues?q=Project:%20Kotlin%20issue%20id:%20KT-45434,%20KT-44494,%20KT-37916,%20KT-43191,%20KT-46961,%20KT-40236) を参照してください。

詳細については、[JavaScript からの Kotlin コードの使用](js-to-kotlin-interop.md) を参照してください。

### 非同期テストに対する @AfterTest の保証 {id="aftertest-guarantees-for-asynchronous-tests"}

Kotlin 1.6.20 により、Kotlin/JS 上の非同期テストで [`@AfterTest`](https://kotlinlang.org/api/latest/kotlin.test/kotlin.test/-after-test/) 関数が適切に動作するようになりました。
テスト関数の戻り値の型が静的に [`Promise`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/-promise/) に解決される場合、コンパイラは対応する [`then()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/-promise/then.html) コールバックで `@AfterTest` 関数の実行をスケジュールするようになりました。

## セキュリティ {id="security"}

Kotlin 1.6.20 では、コードのセキュリティを向上させるための機能がいくつか導入されています:

* [klib での相対パスの使用](#using-relative-paths-in-klibs)
* [Kotlin/JS Gradle プロジェクトでの yarn.lock の永続化](#persisting-yarn-lock-for-kotlin-js-gradle-projects)
* [デフォルトでの `--ignore-scripts` による npm 依存関係のインストール](#installation-of-npm-dependencies-with-ignore-scripts-by-default)

### klib での相対パスの使用 {id="using-relative-paths-in-klibs"}

`klib` 形式のライブラリには、ソースファイルのシリアライズされた IR 表現が [含まれており](native-libraries.md#library-format)、適切なデバッグ情報を生成するためのパスも含まれています。
Kotlin 1.6.20 より前は、保存されるファイルパスは絶対パスでした。ライブラリの作成者は絶対パスを共有したくない場合があるため、1.6.20 バージョンでは代替オプションが用意されました。

`klib` を公開する際に、アーティファクト内でソースファイルの相対パスのみを使用したい場合は、ソースファイルの1つまたは複数のベースパスを指定して `-Xklib-relative-path-base` コンパイラオプションを渡すことができるようになりました:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.withType(org.jetbrains.kotlin.gradle.dsl.KotlinCompile::class).configureEach {
    // $base はソースファイルのベースパスです
    kotlinOptions.freeCompilerArgs += "-Xklib-relative-path-base=$base"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
tasks.withType(org.jetbrains.kotlin.gradle.dsl.KotlinCompile).configureEach {
    kotlinOptions {
        // $base はソースファイルのベースパスです
        freeCompilerArgs += "-Xklib-relative-path-base=$base"
    }
}
``` 

</tab>
</tabs>

### Kotlin/JS Gradle プロジェクトでの yarn.lock の永続化 {id="persisting-yarn-lock-for-kotlin-js-gradle-projects"}

> この機能は Kotlin 1.6.10 にバックポートされました。
>
{style="note"}

Kotlin/JS Gradle プラグインで `yarn.lock` ファイルを永続化（保持）できるようになり、追加の Gradle 設定なしでプロジェクトの npm 依存関係のバージョンをロックできるようになりました。
この機能により、自動生成される `kotlin-js-store` ディレクトリがプロジェクトルートに追加され、デフォルトのプロジェクト構造に変更が加わります。
このディレクトリ内に `yarn.lock` ファイルが保持されます。

`kotlin-js-store` ディレクトリとその内容をバージョン管理システムにコミットすることを強くお勧めします。
ロックファイルをバージョン管理システムにコミットすることは [推奨されるプラクティス](https://classic.yarnpkg.com/blog/2016/11/24/lockfiles-for-all/) です。他のマシンの開発環境であれ CI/CD サービスであれ、すべてのマシンでまったく同じ依存関係ツリーを使用してアプリケーションがビルドされることが保証されるためです。
また、ロックファイルは、新しいマシンでプロジェクトがチェックアウトされたときに npm 依存関係が知らぬ間に更新されるのを防ぐため、セキュリティの面でも重要です。

[Dependabot](https://github.com/dependabot) などのツールは、Kotlin/JS プロジェクトの `yarn.lock` ファイルを解析し、依存している npm パッケージに脆弱性がある場合に警告を発することもできます。

必要に応じて、ビルドスクリプトでディレクトリ名とロックファイル名の両方を変更できます:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
rootProject.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin> {
    rootProject.the<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension>().lockFileDirectory =
        project.rootDir.resolve("my-kotlin-js-store")
    rootProject.the<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension>().lockFileName = "my-yarn.lock"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
rootProject.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin) {
    rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension).lockFileDirectory =
        file("my-kotlin-js-store")
    rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension).lockFileName = 'my-yarn.lock'
}
``` 

</tab>
</tabs>

> ロックファイルの名前を変更すると、依存関係検査ツールがファイルを認識しなくなる場合があります。
> 
{style="warning"}

### デフォルトでの --ignore-scripts による npm 依存関係のインストール {id="installation-of-npm-dependencies-with-ignore-scripts-by-default"}

> この機能は Kotlin 1.6.10 にバックポートされました。
>
{style="note"}

Kotlin/JS Gradle プラグインは、npm 依存関係のインストール中にデフォルトで [ライフサイクルスクリプト](https://docs.npmjs.com/cli/v8/using-npm/scripts#life-cycle-scripts) の実行をブロックするようになりました。
この変更は、侵害された npm パッケージから悪意のあるコードが実行される可能性を減らすことを目的としています。

以前の設定に戻すには、`build.gradle(.kts)` に次の行を追加して、ライフサイクルスクリプトの実行を明示的に有効にすることができます:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
rootProject.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin> {
    rootProject.the<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension>().ignoreScripts = false
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
rootProject.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin) {
    rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension).ignoreScripts = false
}
``` 

</tab>
</tabs>

詳細については、[Kotlin/JS Gradle プロジェクトの npm 依存関係](js-project-setup.md#npm-dependencies) を参照してください。

## Gradle {id="gradle"}

Kotlin 1.6.20 では、Kotlin Gradle プラグインに以下の変更がもたらされます:

* Kotlin コンパイラの実行戦略を定義するための新しい [プロパティ `kotlin.compiler.execution.strategy` および `compilerExecutionStrategy`](#properties-for-defining-kotlin-compiler-execution-strategy)
* [オプション `kapt.use.worker.api`、`kotlin.experimental.coroutines`、`kotlin.coroutines` の非推奨化](#deprecation-of-build-options-for-kapt-and-coroutines)
* [`kotlin.parallel.tasks.in.project` ビルドオプションの削除](#removal-of-the-kotlin-parallel-tasks-in-project-build-option)

### Kotlin コンパイラの実行戦略を定義するプロパティ {id="properties-for-defining-kotlin-compiler-execution-strategy"}

Kotlin 1.6.20 より前は、システムプロパティ `-Dkotlin.compiler.execution.strategy` を使用して Kotlin コンパイラの実行戦略を定義していました。
このプロパティは、場合によっては不便なことがありました。
Kotlin 1.6.20 では、同じ名前の Gradle プロパティ `kotlin.compiler.execution.strategy` と、コンパイルタスクプロパティ `compilerExecutionStrategy` が導入されました。

システムプロパティは引き続き動作しますが、将来のリリースで削除される予定です。

プロパティの現在の優先順位は次のとおりです:

* タスクプロパティ `compilerExecutionStrategy` は、システムプロパティおよび Gradle プロパティ `kotlin.compiler.execution.strategy` よりも優先されます。
* Gradle プロパティはシステムプロパティよりも優先されます。

これらのプロパティに割り当てることができるコンパイラ実行戦略は 3 つあります:

| 戦略 | Kotlin コンパイラが実行される場所 | インクリメンタルコンパイル | その他の特徴 |
|---|---|---|---|
| Daemon | 独自のデーモンプロセス内 | あり | *デフォルトの戦略*。異なる Gradle デーモン間で共有可能 |
| In process | Gradle デーモンプロセス内 | なし | Gradle デーモンとヒープを共有する可能性がある |
| Out of process | 呼び出しごとの個別のプロセス内 | なし | — |

したがって、`kotlin.compiler.execution.strategy` プロパティ（システムと Gradle の両方）で使用可能な値は次のとおりです:
1. `daemon`（デフォルト）
2. `in-process`
3. `out-of-process`

`gradle.properties` で Gradle プロパティ `kotlin.compiler.execution.strategy` を使用します:

```none
# gradle.properties
kotlin.compiler.execution.strategy=out-of-process
```

`compilerExecutionStrategy` タスクプロパティで使用可能な値は次のとおりです:

1. `org.jetbrains.kotlin.gradle.tasks.KotlinCompilerExecutionStrategy.DAEMON`（デフォルト）
2. `org.jetbrains.kotlin.gradle.tasks.KotlinCompilerExecutionStrategy.IN_PROCESS`
3. `org.jetbrains.kotlin.gradle.tasks.KotlinCompilerExecutionStrategy.OUT_OF_PROCESS`

`build.gradle.kts` ビルドスクリプトでタスクプロパティ `compilerExecutionStrategy` を使用します:

```kotlin
import org.jetbrains.kotlin.gradle.dsl.KotlinCompile
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilerExecutionStrategy

// ...

tasks.withType<KotlinCompile>().configureEach {
    compilerExecutionStrategy.set(KotlinCompilerExecutionStrategy.IN_PROCESS)
}
```

フィードバックは [こちらの YouTrack タスク](https://youtrack.jetbrains.com/issue/KT-49299) にお寄せください。

### kapt およびコルーチン用ビルドオプションの非推奨化 {id="deprecation-of-build-options-for-kapt-and-coroutines"}

Kotlin 1.6.20 では、プロパティの非推奨レベルを変更しました:

* `kapt.use.worker.api` を使用して Kotlin デーモン経由で [kapt](kapt.md) を実行する機能を非推奨にしました。現在は Gradle の出力に警告が表示されます。
  デフォルトでは、1.3.70 リリース以降 [kapt は Gradle ワーカーを使用しています](kapt.md#run-kapt-tasks-in-parallel)。この方法を使い続けることをお勧めします。

  将来のリリースで `kapt.use.worker.api` オプションを削除する予定です。

* `kotlin.experimental.coroutines` Gradle DSL オプションと、`gradle.properties` で使用される `kotlin.coroutines` プロパティを非推奨にしました。
  単に _suspend 関数_ を使用するか、`build.gradle(.kts)` ファイルに [`kotlinx.coroutines` の依存関係を追加](gradle-configure-project.md#set-a-dependency-on-a-kotlinx-library) してください。
  
  コルーチンの詳細については、[コルーチンガイド](coroutines-guide.md) を参照してください。

### kotlin.parallel.tasks.in.project ビルドオプションの削除 {id="removal-of-the-kotlin-parallel-tasks-in-project-build-option"}

Kotlin 1.5.20 で、[ビルドオプション `kotlin.parallel.tasks.in.project` の非推奨化](whatsnew1520.md#deprecation-of-the-kotlin-parallel-tasks-in-project-build-property) を発表しました。
このオプションは Kotlin 1.6.20 で削除されました。

プロジェクトによっては、Kotlin デーモンでの並列コンパイルにより多くのメモリが必要になる場合があります。
メモリ消費を抑えるには、[Kotlin デーモンのヒープサイズを増やして](gradle-compilation-and-caches.md#setting-kotlin-daemon-s-jvm-arguments) ください。

Kotlin Gradle プラグインで [現在サポートされているコンパイラオプション](gradle-compiler-options.md) の詳細をご覧ください。