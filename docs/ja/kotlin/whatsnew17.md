[//]: # (title: Kotlin 1.7.0 の新機能)

<web-summary>新しい言語機能、Kotlin Multiplatform、JVM、Native、JS へのアップデート、および Gradle と Maven のビルドツールサポートを含む Kotlin 1.7.0 のリリースノートをお読みください。</web-summary>

<tldr>
   <p>Kotlin 1.7.0 の IDE サポートは、IntelliJ IDEA 2021.2、2021.3、および 2022.1 で利用可能です。</p>
</tldr>

_[リリース日: 2022年6月9日](releases.md#release-history)_

Kotlin 1.7.0 がリリースされました。このバージョンでは、新しい Kotlin/JVM K2 コンパイラの Alpha 版が公開され、言語機能が安定化し、JVM、JS、および Native プラットフォームにパフォーマンスの向上がもたらされます。

このバージョンの主なアップデートは以下の通りです。

* [新しい Kotlin K2 コンパイラが Alpha になりました](#new-kotlin-k2-compiler-for-the-jvm-in-alpha)。大幅なパフォーマンス向上が期待できます。現在は JVM のみで利用可能で、kapt を含むコンパイラプラグインは動作しません。
* [Gradle におけるインクリメンタルコンパイルへの新しいアプローチ](#a-new-approach-to-incremental-compilation)。依存する非 Kotlin モジュール内で行われた変更に対してもインクリメンタルコンパイルがサポートされるようになり、Gradle との互換性も向上しました。
* [オプトイン要求アノテーション](#stable-opt-in-requirements)、[絶対非ヌル型](#stable-definitely-non-nullable-types)、[ビルダー推論](#stable-builder-inference)を安定化しました。
* [型引数のアンダースコア演算子](#underscore-operator-for-type-arguments)が導入されました。他の型が指定されている場合に、引数の型を自動的に推論させるために使用できます。
* [インラインクラスのインライン化された値への委譲による実装（implementation by delegation）が可能になりました](#allow-implementation-by-delegation-to-an-inlined-value-of-an-inline-class)。ほとんどの場合でメモリ割り当てを行わない軽量なラッパーを作成できるようになります。

これらの変更の概要については、以下のビデオでもご確認いただけます。

<video src="https://www.youtube.com/v/54WEfLKtCGk" title="What's new in Kotlin 1.7.0"/>

> Kotlin のリリースサイクルに関する情報は、[Kotlin のリリースプロセス](releases.md)をご覧ください。
>
{style="tip"}

## JVM 用の新しい Kotlin K2 コンパイラが Alpha に

この Kotlin リリースでは、新しい Kotlin K2 コンパイラの **Alpha** バージョンが導入されます。新しいコンパイラは、新しい言語機能の開発を加速させ、Kotlin がサポートするすべてのプラットフォームを統合し、パフォーマンスを向上させ、コンパイラ拡張のための API を提供することを目的としています。

新しいコンパイラとその利点についての詳細な説明は、既にいくつか公開されています。

* [The Road to the New Kotlin Compiler](https://www.youtube.com/watch?v=iTdJJq_LyoY)
* [K2 Compiler: a Top-Down View](https://www.youtube.com/watch?v=db19VFLZqJM)

新しい K2 コンパイラの Alpha 版については、主にパフォーマンスの向上に焦点を当てており、JVM プロジェクトでのみ動作することを指摘しておくことが重要です。Kotlin/JS、Kotlin/Native、その他のマルチプラットフォームプロジェクトはサポートしておらず、[kapt](kapt.md) を含むコンパイラプラグインも動作しません。

弊社の内部プロジェクトにおけるベンチマークでは、顕著な結果が出ています。

| プロジェクト | 現在の Kotlin コンパイラのパフォーマンス | 新しい K2 Kotlin コンパイラのパフォーマンス | パフォーマンス向上 |
|---------------|-------------------------------------|------------------------------------|-------------------|
| Kotlin        | 2.2 KLOC/s                          | 4.8 KLOC/s                         | ~ x2.2            |
| YouTrack      | 1.8 KLOC/s                          | 4.2 KLOC/s                         | ~ x2.3            |
| IntelliJ IDEA | 1.8 KLOC/s                          | 3.9 KLOC/s                         | ~ x2.2            |
| Space         | 1.2 KLOC/s                          | 2.8 KLOC/s                         | ~ x2.3            |

> KLOC/s というパフォーマンス数値は、コンパイラが 1 秒間に処理するコードの行数（千行単位）を表します。
>
> {style="tip"}

お手元の JVM プロジェクトでパフォーマンスの向上を確認し、古いコンパイラの結果と比較することができます。Kotlin K2 コンパイラを有効にするには、以下のコンパイラオプションを使用します。

```bash
-Xuse-k2
```

また、K2 コンパイラには[多数のバグ修正が含まれています](https://youtrack.jetbrains.com/issues/KT?q=tag:%20FIR-preview-qa%20%23Resolved)。このリストにある **State: Open** の課題であっても、実際には K2 で修正されていることに注意してください。

今後の Kotlin リリースでは、K2 コンパイラの安定性が向上し、より多くの機能が提供される予定ですので、ご期待ください。

Kotlin K2 コンパイラでパフォーマンスに関する問題が発生した場合は、[弊社の課題トラッカーに報告](https://kotl.in/issue)をお願いします。

## 言語

Kotlin 1.7.0 では、委譲による実装（implementation by delegation）のサポートと、型引数用の新しいアンダースコア演算子が導入されました。また、以前のリリースでプレビューとして導入されたいくつかの言語機能が安定化されました。

* [インラインクラスのインライン化された値への委譲による実装](#allow-implementation-by-delegation-to-an-inlined-value-of-an-inline-class)
* [型引数のアンダースコア演算子](#underscore-operator-for-type-arguments)
* [安定版のビルダー推論](#stable-builder-inference)
* [安定版のオプトイン要求](#stable-opt-in-requirements)
* [安定版の絶対非ヌル型](#stable-definitely-non-nullable-types)

### インラインクラスのインライン化された値への委譲による実装を許可

値やクラスインスタンスの軽量なラッパーを作成したい場合、すべてのインターフェースメソッドを手動で実装する必要があります。委譲による実装はこの問題を解決しますが、1.7.0 より前はインラインクラスでは動作しませんでした。この制限が解除されたため、ほとんどの場合でメモリ割り当てを行わない軽量なラッパーを作成できるようになりました。

```kotlin
interface Bar {
    fun foo() = "foo"
}

@JvmInline
value class BarWrapper(val bar: Bar): Bar by bar

fun main() {
    val bw = BarWrapper(object: Bar {})
    println(bw.foo())
}
```

### 型引数のアンダースコア演算子

Kotlin 1.7.0 では、型引数用のアンダースコア演算子 `_` が導入されました。他の型が指定されている場合に、型引数を自動的に推論させるために使用できます。

```kotlin
abstract class SomeClass<T> {
    abstract fun execute(): T
}

class SomeImplementation : SomeClass<String>() {
    override fun execute(): String = "Test"
}

class OtherImplementation : SomeClass<Int>() {
    override fun execute(): Int = 42
}

object Runner {
    inline fun <reified S: SomeClass<T>, T> run(): T {
        return S::class.java.getDeclaredConstructor().newInstance().execute()
    }
}

fun main() {
    // SomeImplementation が SomeClass<String> から派生しているため、T は String と推論されます
    val s = Runner.run<SomeImplementation, _>()
    assert(s == "Test")

    // OtherImplementation が SomeClass<Int> から派生しているため、T は Int と推論されます
    val n = Runner.run<OtherImplementation, _>()
    assert(n == 42)
}
```

> 変数リストのどの位置でもアンダースコア演算子を使用して、型引数を推論させることができます。
>
{style="note"}

### 安定版のビルダー推論

ビルダー推論は、ジェネリックなビルダー関数を呼び出す際に役立つ特殊な型の推論です。ラムダ引数内の他の呼び出しに関する型情報を使用して、呼び出しの型引数をコンパイラが推論するのを助けます。

1.7.0 以降、通常の型推論で十分な情報が得られない場合、[1.6.0 で導入された](whatsnew16.md#changes-to-builder-inference) `-Xenable-builder-inference` コンパイラオプションを指定しなくても、ビルダー推論が自動的に有効になります。

[カスタムジェネリックビルダーの書き方を学ぶ](using-builders-with-builder-inference.md)。

### 安定版のオプトイン要求

[オプトイン要求](opt-in-requirements.md)が[安定版（Stable）](components-stability.md)となり、追加のコンパイラ設定が不要になりました。

1.7.0 より前は、警告を避けるためにオプトイン機能自体に `-opt-in=kotlin.RequiresOptIn` 引数が必要でした。現在は不要ですが、他のアノテーションや[モジュール](opt-in-requirements.md#opt-in-a-module)をオプトインするために引き続きコンパイラ引数 `-opt-in` を使用できます。

### 安定版の絶対非ヌル型

Kotlin 1.7.0 では、絶対非ヌル型（definitely non-nullable types）が[安定版（Stable）](components-stability.md)に昇格しました。これにより、ジェネリックな Java クラスやインターフェースを拡張する際の相互運用性が向上します。

新しい構文 `T & Any` を使用して、使用箇所でジェネリック型パラメータを「絶対に非ヌル」としてマークできます。この構文形式は[交差型（intersection types）](https://en.wikipedia.org/wiki/Intersection_type)の表記に由来しており、現在は `&` の左側にヌル許容の上限を持つ型パラメータ、右側に非ヌルの `Any` を持つ場合に限定されています。

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

絶対非ヌル型の詳細については、[この KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/definitely-non-nullable-types.md) を参照してください。

## Kotlin/JVM

このリリースでは、Kotlin/JVM コンパイラのパフォーマンス向上と新しいコンパイラオプションが導入されました。また、関数型インターフェースのコンストラクタに対する呼び出し可能参照が安定版になりました。なお、1.7.0 以降、Kotlin/JVM コンパイルのデフォルトのターゲットバージョンは `1.8` になっています。

* [コンパイラのパフォーマンス最適化](#compiler-performance-optimizations)
* [新しいコンパイラオプション `-Xjdk-release`](#new-compiler-option-xjdk-release)
* [安定版の関数型インターフェースコンストラクタへの呼び出し可能参照](#stable-callable-references-to-functional-interface-constructors)
* [JVM ターゲットバージョン 1.6 の削除](#removed-jvm-target-version-1-6)

### コンパイラのパフォーマンス最適化

Kotlin 1.7.0 では、Kotlin/JVM コンパイラのパフォーマンスが向上しました。弊社のベンチマークによると、コンパイル時間は Kotlin 1.6.0 と比較して[平均で 10% 短縮されました](https://youtrack.jetbrains.com/issue/KT-48233/Switching-to-JVM-IR-backend-increases-compilation-time-by-more-t#focus=Comments-27-6114542.0-0)。インライン関数の使用箇所が多いプロジェクト（例: [`kotlinx.html` を使用しているプロジェクト](https://youtrack.jetbrains.com/issue/KT-51416/Compilation-of-kotlinx-html-DSL-should-still-be-faster)）では、バイトコードの後処理の改善により、コンパイルがより高速になります。

### 新しいコンパイラオプション: -Xjdk-release

Kotlin 1.7.0 では、新しいコンパイラオプション `-Xjdk-release` が導入されました。このオプションは、[javac のコマンドラインオプション `--release`](http://openjdk.java.net/jeps/247) に似ています。`-Xjdk-release` オプションは、ターゲットのバイトコードバージョンを制御し、クラスパス内の JDK の API を指定された Java バージョンに制限します。例えば、`kotlinc -Xjdk-release=1.8` と指定すると、依存関係にある JDK がバージョン 9 以上であっても、`java.lang.Module` を参照できなくなります。

> このオプションは、すべての JDK ディストリビューションに対して効果があることが[保証されているわけではありません](https://youtrack.jetbrains.com/issue/KT-29974)。
>
{style="note"}

フィードバックは[こちらの YouTrack チケット](https://youtrack.jetbrains.com/issue/KT-29974/Add-a-compiler-option-Xjdk-release-similar-to-javac-s-release-to)にお寄せください。

### 安定版の関数型インターフェースコンストラクタへの呼び出し可能参照

関数型インターフェースのコンストラクタへの[呼び出し可能参照](reflection.md#callable-references)が[安定版（Stable）](components-stability.md)になりました。コンストラクタ関数を持つインターフェースから、呼び出し可能参照を使用した関数型インターフェースへの[移行方法](fun-interfaces.md#migration-from-an-interface-with-constructor-function-to-a-functional-interface)をご確認ください。

問題が見つかった場合は、[YouTrack](https://youtrack.jetbrains.com/newissue?project=kt) に報告してください。

### JVM ターゲットバージョン 1.6 の削除

Kotlin/JVM コンパイルのデフォルトのターゲットバージョンは `1.8` です。`1.6` ターゲットは削除されました。

JVM ターゲット 1.8 以上に移行してください。各ツールの JVM ターゲットバージョンの更新方法は以下をご覧ください。

* [Gradle](gradle-compiler-options.md#attributes-specific-to-jvm)
* [Maven](maven-kotlin-compiler.md#attributes-specific-to-jvm)
* [コマンドラインコンパイラ](compiler-reference.md#jvm-target-version)

## Kotlin/Native

Kotlin 1.7.0 には、Objective-C および Swift との相互運用性に関する変更が含まれており、以前のリリースで導入された機能が安定化されました。また、新しいメモリマネージャのパフォーマンス向上やその他のアップデートも含まれています。

* [新しいメモリマネージャのパフォーマンス向上](#performance-improvements-for-the-new-memory-manager)
* [JVM および JS IR バックエンドと統一されたコンパイラプラグイン ABI](#unified-compiler-plugin-abi-with-jvm-and-js-ir-backends)
* [スタンドアロン Android 実行ファイルのサポート](#support-for-standalone-android-executables)
* [Swift async/await との相互運用: KotlinUnit の代わりに Void を返す](#interop-with-swift-async-await-returning-void-instead-of-kotlinunit)
* [Objective-C ブリッジを介した未宣言の例外の禁止](#prohibited-undeclared-exceptions-through-objective-c-bridges)
* [CocoaPods 統合の改善](#improved-cocoapods-integration)
* [Kotlin/Native コンパイラのダウンロード URL のオーバーライド](#overriding-the-kotlin-native-compiler-download-url)

### 新しいメモリマネージャのパフォーマンス向上

> 新しい Kotlin/Native メモリマネージャは [Alpha](components-stability.md) 段階です。
> 今後、互換性のない変更が行われたり、手動での移行が必要になったりする可能性があります。
> [YouTrack](https://youtrack.jetbrains.com/issue/KT-48525) でのフィードバックをお待ちしております。
>
{style="note"}

新しいメモリマネージャはまだ Alpha 段階ですが、[安定版（Stable）](components-stability.md)に向けて着実に進んでいます。このリリースでは、新しいメモリマネージャ、特にガベージコレクション（GC）において大幅なパフォーマンス向上が実現されました。特に、[1.6.20 で導入された](whatsnew1620.md)スイープフェーズのコンカレント実装がデフォルトで有効になりました。これにより、GC によるアプリケーションの中断時間が短縮されます。新しい GC スケジューラは、特に大きなヒープに対して GC 頻度をより適切に選択できるようになりました。

また、デバッグバイナリを特別に最適化し、メモリマネージャの実装コードで適切な最適化レベルとリンク時最適化が使用されるようにしました。これにより、弊社のベンチマークにおいて、デバッグバイナリの実行時間が約 30% 改善されました。

プロジェクトで新しいメモリマネージャを試して動作を確認し、フィードバックを [YouTrack](https://youtrack.jetbrains.com/issue/KT-48525) で共有してください。

### JVM および JS IR バックエンドと統一されたコンパイラプラグイン ABI

Kotlin 1.7.0 以降、Kotlin Multiplatform Gradle プラグインは、Kotlin/Native 用に埋め込み可能なコンパイラ jar をデフォルトで使用します。この[機能は 1.6.0 で試験的機能（Experimental）として発表されました](whatsnew16.md#unified-compiler-plugin-abi-with-jvm-and-js-ir-backends)が、現在は安定版となり、すぐに使用できます。

この改善は、ライブラリの作成者にとって非常に便利で、コンパイラプラグインの開発体験を向上させます。これまでのリリースでは Kotlin/Native 用に別個のアーティファクトを提供する必要がありましたが、現在は Native と他のサポートされているプラットフォームで同じコンパイラプラグインアーティファクトを使用できます。

> この機能により、プラグイン開発者は既存のプラグインに対して移行ステップが必要になる場合があります。
>
> アップデートに向けたプラグインの準備方法については、こちらの [YouTrack 課題](https://youtrack.jetbrains.com/issue/KT-48595)をご覧ください。
>
{style="warning"}

### スタンドアロン Android 実行ファイルのサポート

Kotlin 1.7.0 は、Android Native ターゲット向けの標準実行ファイルの生成を完全にサポートしています。[1.6.20 で導入されました](whatsnew1620.md#support-for-standalone-android-executables)が、現在はデフォルトで有効になっています。

Kotlin/Native が共有ライブラリを生成していた以前の動作に戻したい場合は、以下の設定を使用してください。

```kotlin
binaryOptions["androidProgramType"] = "nativeActivity"
```

### Swift async/await との相互運用: KotlinUnit の代わりに Void を返す

Kotlin の `suspend` 関数は、Swift で `KotlinUnit` の代わりに `Void` 型を返すようになりました。これは Swift の `async`/`await` との相互運用性が向上した結果です。この機能は [1.6.20 で導入されました](whatsnew1620.md#interop-with-swift-async-await-returning-void-instead-of-kotlinunit)が、今回のリリースでこの動作がデフォルトになりました。

このような関数に対して適切な型を返すために、`kotlin.native.binary.unitSuspendFunctionObjCExport=proper` プロパティを使用する必要はもうありません。

### Objective-C ブリッジを介した未宣言の例外の禁止

Swift/Objective-C コードから Kotlin コードを呼び出す（またはその逆）際に例外が発生した場合、適切な変換を伴う言語間の例外転送を明示的に許可していない限り（例: `@Throws` アノテーションを使用するなど）、例外が発生したコード側で処理されるべきです。

以前の Kotlin には、意図しない動作として、未宣言の例外が特定のケースで一方の言語からもう一方の言語へと「漏れ出す」ことがありました。Kotlin 1.7.0 ではこの問題が修正され、現在はそのようなケースではプログラムが終了するようになります。

例えば、Kotlin で `{ throw Exception() }` というラムダがあり、それを Swift から呼び出す場合、Kotlin 1.7.0 では例外が Swift コードに到達した瞬間に終了します。以前の Kotlin バージョンでは、このような例外が Swift コードに漏れ出す可能性がありました。

`@Throws` アノテーションはこれまで通り機能します。

### CocoaPods 統合の改善

Kotlin 1.7.0 以降、プロジェクトに CocoaPods を統合する際に `cocoapods-generate` プラグインをインストールする必要がなくなりました。

以前は、Kotlin Multiplatform Mobile プロジェクトなどで [iOS の依存関係](https://kotlinlang.org/docs/multiplatform/multiplatform-ios-dependencies.html#with-cocoapods)を処理するために、CocoaPods 依存関係マネージャと `cocoapods-generate` プラグインの両方をインストールする必要がありました。

現在は CocoaPods の統合設定がより簡単になり、Ruby 3 以降で `cocoapods-generate` がインストールできなかった問題も解決されました。Apple M1 でより快適に動作する最新の Ruby バージョンもサポートされています。

[CocoaPods 統合の初期セットアップ](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-overview.html#set-up-an-environment-to-work-with-cocoapods)方法をご確認ください。

### Kotlin/Native コンパイラのダウンロード URL のオーバーライド

Kotlin 1.7.0 以降、Kotlin/Native コンパイラのダウンロード URL をカスタマイズできるようになりました。これは、CI 上で外部リンクが禁止されている場合に便利です。

デフォルトのベース URL `https://download.jetbrains.com/kotlin/native/builds` を上書きするには、以下の Gradle プロパティを使用します。

```none
kotlin.native.distribution.baseDownloadUrl=https://example.com
```

> ダウンローダーは、実際のコンパイラディストリビューションを確実にダウンロードするために、このベース URL にネイティブバージョンとターゲット OS を追加します。
>
{style="note"}

## Kotlin/JS

Kotlin/JS は、[JS IR コンパイラバックエンド](js-ir-compiler.md)のさらなる改善や、開発体験を向上させるその他のアップデートが行われています。

* [新しい IR バックエンドのパフォーマンス向上](#performance-improvements-for-the-new-ir-backend)
* [IR 使用時のメンバー名の難読化（Minification）](#minification-for-member-names-when-using-ir)
* [IR バックエンドにおけるポリフィルによる古いブラウザのサポート](#support-for-older-browsers-via-polyfills-in-the-ir-backend)
* [js 式からの JavaScript モジュールの動的ロード](#dynamically-load-javascript-modules-from-js-expressions)
* [JavaScript テストランナーへの環境変数の指定](#specify-environment-variables-for-javascript-test-runners)

### 新しい IR バックエンドのパフォーマンス向上

このリリースには、開発体験を向上させるいくつかの大きなアップデートが含まれています。

* Kotlin/JS のインクリメンタルコンパイルのパフォーマンスが大幅に向上しました。JS プロジェクトのビルド時間が短縮されます。多くの場合、インクリメンタルな再ビルドはレガシーバックエンドとほぼ同等になりました。
* 最終的なアーティファクトのサイズを大幅に削減したため、Kotlin/JS のファイナルバンドルに必要な容量が少なくなりました。一部の大規模なプロジェクトでは、レガシーバックエンドと比較してプロダクションバンドルのサイズが最大 20% 削減されたことを確認しています。
* インターフェースの型チェックが桁違いに改善されました。
* Kotlin がより高品質な JS コードを生成するようになりました。

### IR 使用時のメンバー名の難読化（Minification）

Kotlin/JS IR コンパイラは、Kotlin のクラスや関数の関係に関する内部情報を使用して、より効率的な難読化（minification）を適用し、関数、プロパティ、およびクラスの名前を短縮するようになりました。これにより、結果として得られるバンドルされたアプリケーションのサイズが縮小されます。

このタイプの難読化は、Kotlin/JS アプリケーションをプロダクションモードでビルドする際に自動的に適用され、デフォルトで有効になっています。メンバー名の難読化を無効にするには、`-Xir-minimized-member-names` コンパイラフラグを使用します。

```kotlin
kotlin {
    js(IR) {
        compilations.all {
            compileKotlinTask.kotlinOptions.freeCompilerArgs += listOf("-Xir-minimized-member-names=false")
        }
    }
}
```

### IR バックエンドにおけるポリフィルによる古いブラウザのサポート

Kotlin/JS の IR コンパイラバックエンドに、レガシーバックエンドと同じポリフィルが含まれるようになりました。これにより、新しいコンパイラでコンパイルされたコードを、Kotlin 標準ライブラリで使用されている ES2015 のすべてのメソッドをサポートしていない古いブラウザで実行できるようになります。プロジェクトで実際に使用されているポリフィルのみが最終的なバンドルに含まれるため、バンドルサイズへの影響は最小限に抑えられます。

この機能は IR コンパイラを使用する場合にデフォルトで有効になっており、設定の必要はありません。

### js 式からの JavaScript モジュールの動的ロード

JavaScript モジュールを扱う際、ほとんどのアプリケーションは静的なインポートを使用し、その使用方法は [JavaScript モジュールの統合](js-modules.md)でカバーされています。しかし、Kotlin/JS には、アプリケーションの実行時に JavaScript モジュールを動的にロードするメカズムが欠けていました。

Kotlin 1.7.0 以降、JavaScript の `import` ステートメントが `js` ブロック内でサポートされ、実行時にパッケージをアプリケーションに動的に取り込むことができるようになりました。

```kotlin
val myPackage = js("import('my-package')")
```

### JavaScript テストランナーへの環境変数の指定

Node.js のパッケージ解決を調整したり、外部情報を Node.js のテストに渡したりするために、JavaScript テストランナーが使用する環境変数を指定できるようになりました。環境変数を定義するには、ビルドスクリプトの `testTask` ブロック内で `environment()` 関数をキーと値のペアで使用します。

```kotlin
kotlin {
    js {
        nodejs {
            testTask {
                environment("key", "value")
            }
        }
    }
}
```

## 標準ライブラリ

Kotlin 1.7.0 では、標準ライブラリにさまざまな変更と改善が行われました。新しい機能の導入、試験的機能の安定化、および Native、JS、および JVM における名前付きキャプチャグループのサポートの統一が行われています。

* [min() および max() コレクション関数が非ヌル型を返すように変更](#min-and-max-collection-functions-return-as-non-nullable)
* [特定のインデックスでの正規表現マッチング](#regular-expression-matching-at-specific-indices)
* [以前の言語および API バージョンのサポート拡張](#extended-support-for-previous-language-and-api-versions)
* [リフレクション経由のアノテーションへのアクセス](#access-to-annotations-via-reflection)
* [安定版の深層再帰関数](#stable-deep-recursive-functions)
* [デフォルトの時間ソース向けのインラインクラスに基づいたタイムマーク](#time-marks-based-on-inline-classes-for-default-time-source)
* [Java Optional 向けの新しい試験的拡張関数](#new-experimental-extension-functions-for-java-optionals)
* [JS および Native における名前付きキャプチャグループのサポート](#support-for-named-capturing-groups-in-js-and-native)

### min() および max() コレクション関数が非ヌル型を返すように変更

[Kotlin 1.4.0](whatsnew14.md) では、`min()` および `max()` コレクション関数を `minOrNull()` および `maxOrNull()` に改名しました。これらの新しい名前は、レシーバーコレクションが空の場合に null を返すという動作をより適切に反映しています。また、Kotlin コレクション API 全体で使用されている命名規則とも一致させることができました。

`minBy()`、`maxBy()`、`minWith()`、および `maxWith()` についても同様で、1.4.0 でそれぞれの *OrNull() シノニムが導入されました。この変更の影響を受ける古い関数は、徐々に非推奨（deprecated）となりました。

Kotlin 1.7.0 では、元の関数名を再導入しますが、戻り値の型は非ヌル（non-nullable）になります。新しい `min()`、`max()`、`minBy()`、`maxBy()`、`minWith()`、および `maxWith()` 関数は、厳密にコレクション要素を返すか、例外をスローします。

```kotlin
fun main() {
    val numbers = listOf<Int>()
    println(numbers.maxOrNull()) // "null"
    println(numbers.max()) // "Exception in... Collection is empty."
}
```

### 特定のインデックスでの正規表現マッチング

[1.5.30 で導入された](whatsnew1530.md#matching-with-regex-at-a-particular-position) `Regex.matchAt()` および `Regex.matchesAt()` 関数が安定版になりました。これらは、`String` または `CharSequence` の特定の箇所に正規表現が正確に一致するかどうかを確認する手段を提供します。

`matchesAt()` は一致するかどうかを確認し、ブール値の結果を返します。

```kotlin
fun main() {
    val releaseText = "Kotlin 1.7.0 is on its way!"
    // 正規表現: 1つの数字、ドット、1つの数字、ドット、1つ以上の数字
    val versionRegex = "\\d[.]\\d[.]\\d+".toRegex()

    println(versionRegex.matchesAt(releaseText, 0)) // "false"
    println(versionRegex.matchesAt(releaseText, 7)) // "true"
}
```

`matchAt()` は、一致が見つかった場合はその一致を返し、見つからない場合は `null` を返します。

```kotlin
fun main() {
    val releaseText = "Kotlin 1.7.0 is on its way!"
    val versionRegex = "\\d[.]\\d[.]\\d+".toRegex()

    println(versionRegex.matchAt(releaseText, 0)) // "null"
    println(versionRegex.matchAt(releaseText, 7)?.value) // "1.7.0"
}
```

この [YouTrack 課題](https://youtrack.jetbrains.com/issue/KT-34021) へのフィードバックをお待ちしております。

### 以前の言語および API バージョンのサポート拡張

幅広い旧バージョンの Kotlin で利用可能なライブラリを開発するライブラリ作成者をサポートし、Kotlin のメジャーリリースの頻度が高まっていることに対応するため、以前の言語および API バージョンのサポートを拡張しました。

Kotlin 1.7.0 では、以前の 2 つではなく 3 つ前までの言語および API バージョンをサポートします。つまり、Kotlin 1.7.0 は、1.4.0 までの Kotlin バージョンをターゲットとしたライブラリの開発をサポートします。後方互換性の詳細については、[互換性オプション](kotlin-evolution-principles.md#compatibility-options)をご覧ください。

### リフレクション経由のアノテーションへのアクセス

[1.6.0 で初めて導入された](whatsnew16.md#repeatable-annotations-with-runtime-retention-for-1-8-jvm-target) [`KAnnotatedElement.findAnnotations()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect.full/find-annotations.html) 拡張関数が[安定版（Stable）](components-stability.md)になりました。この[リフレクション](reflection.md)関数は、個別に適用されたアノテーションや繰り返されたアノテーションを含め、要素上の指定された型のすべてのアノテーションを返します。

```kotlin
@Repeatable
annotation class Tag(val name: String)

@Tag("First Tag")
@Tag("Second Tag")
fun taggedFunction() {
    println("I'm a tagged function!")
}

fun main() {
    val x = ::taggedFunction
    val foo = x as KAnnotatedElement
    println(foo.findAnnotations<Tag>()) // [@Tag(name=First Tag), @Tag(name=Second Tag)]
}
```

### 安定版の深層再帰関数

深層再帰関数（Deep recursive functions）は [Kotlin 1.4.0](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-rc-debugging-coroutines/#Defining_deep_recursive_functions_using_coroutines) から試験的機能として利用可能でしたが、Kotlin 1.7.0 で[安定版（Stable）](components-stability.md)になりました。`DeepRecursiveFunction` を使用すると、実際のコールスタックを使用する代わりにヒープ上にスタックを保持する関数を定義できます。これにより、非常に深い再帰計算を実行できます。深層再帰関数を呼び出すには、それを `invoke` します。

この例では、深層再帰関数を使用してバイナリツリーの深さを再帰的に計算しています。このサンプル関数は自身を 100,000 回再帰的に呼び出していますが、`StackOverflowError` はスローされません。

```kotlin
class Tree(val left: Tree?, val right: Tree?)

val calculateDepth = DeepRecursiveFunction<Tree?, Int> { t ->
    if (t == null) 0 else maxOf(
        callRecursive(t.left),
        callRecursive(t.right)
    ) + 1
}

fun main() {
    // 100,000 の深さを持つツリーを生成
    val deepTree = generateSequence(Tree(null, null)) { prev ->
        Tree(prev, null)
    }.take(100_000).last()

    println(calculateDepth(deepTree)) // 100000
}
```

再帰の深さが 1000 回を超えるようなコードでは、深層再帰関数の使用を検討してください。

### デフォルトの時間ソース向けのインラインクラスに基づいたタイムマーク

Kotlin 1.7.0 では、`TimeSource.Monotonic` によって返されるタイムマークをインライン値クラスに変更することで、時間計測機能のパフォーマンスが向上しました。つまり、`markNow()`、`elapsedNow()`、`measureTime()`、および `measureTimedValue()` などの関数を呼び出しても、その `TimeMark` インスタンスのためのラッパークラスが割り当てられません。特にホットパスの一部であるコードを計測する場合、計測によるパフォーマンスへの影響を最小限に抑えることができます。

```kotlin
@OptIn(ExperimentalTime::class)
fun main() {
    val mark = TimeSource.Monotonic.markNow() // 返される `TimeMark` はインラインクラス
    val elapsedDuration = mark.elapsedNow()
}
```

> この最適化は、`TimeMark` を取得する時間ソースが静的に `TimeSource.Monotonic` であると分かっている場合にのみ利用可能です。
>
{style="note"}

### Java Optional 向けの新しい試験的拡張関数

Kotlin 1.7.0 には、Java の `Optional` クラスの操作を簡素化する新しい便利な関数が含まれています。これらの新しい関数は、JVM 上でオプショナルオブジェクトをアンラップして変換するために使用でき、Java API をより簡潔に扱うのに役立ちます。

`getOrNull()`、`getOrDefault()`、および `getOrElse()` 拡張関数を使用すると、`Optional` の値が存在する場合にその値を取得できます。そうでない場合は、それぞれ `null`、デフォルト値、または関数によって返される値を取得します。

```kotlin
val presentOptional = Optional.of("I'm here!")

println(presentOptional.getOrNull())
// "I'm here!"

val absentOptional = Optional.empty<String>()

println(absentOptional.getOrNull())
// null
println(absentOptional.getOrDefault("Nobody here!"))
// "Nobody here!"
println(absentOptional.getOrElse {
    println("Optional was absent!")
    "Default value!"
})
// "Optional was absent!"
// "Default value!"
```

`toList()`、`toSet()`、および `asSequence()` 拡張関数は、存在する `Optional` の値をリスト、セット、またはシーケンスに変換し、存在しない場合は空のコレクションを返します。`toCollection()` 拡張関数は、`Optional` の値を既存の送信先コレクションに追加します。

```kotlin
val presentOptional = Optional.of("I'm here!")
val absentOptional = Optional.empty<String>()
println(presentOptional.toList() + "," + absentOptional.toList())
// ["I'm here!"], []
println(presentOptional.toSet() + "," + absentOptional.toSet())
// ["I'm here!"], []
val myCollection = mutableListOf<String>()
absentOptional.toCollection(myCollection)
println(myCollection)
// []
presentOptional.toCollection(myCollection)
println(myCollection)
// ["I'm here!"]
val list = listOf(presentOptional, absentOptional).flatMap { it.asSequence() }
println(list)
// ["I'm here!"]
```

これらの拡張関数は、Kotlin 1.7.0 で試験的機能（Experimental）として導入されています。`Optional` 拡張の詳細については、[この KEEP](https://github.com/Kotlin/KEEP/pull/291) をご覧ください。いつものように、[Kotlin 課題トラッカー](https://kotl.in/issue) でのフィードバックをお待ちしております。

### JS および Native における名前付きキャプチャグループのサポート

Kotlin 1.7.0 以降、名前付きキャプチャグループが JVM だけでなく、JS および Native プラットフォームでもサポートされるようになりました。

キャプチャグループに名前を付けるには、正規表現で `(?<name>group)` 構文を使用します。グループに一致したテキストを取得するには、新しく導入された [`MatchGroupCollection.get()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/get.html) 関数を呼び出し、グループ名を渡します。

#### 名前による一致したグループ値の取得

都市の座標を照合するこの例を考えてみましょう。正規表現に一致したグループのコレクションを取得するには、[`groups`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-match-result/groups.html) を使用します。`value` を使用して、グループの内容を番号（インデックス）で取得する場合と名前で取得する場合を比較してください。

```kotlin
fun main() {
    val regex = "\\b(?<city>[A-Za-z\\s]+),\\s(?<state>[A-Z]{2}):\\s(?<areaCode>[0-9]{3})\\b".toRegex()
    val input = "Coordinates: Austin, TX: 123"
    val match = regex.find(input)!!
    println(match.groups["city"]?.value) // "Austin" — 名前で取得
    println(match.groups[2]?.value) // "TX" — 番号で取得
}
```

#### 名前付き後方参照

グループを参照（バックリファレンス）する際にも、グループ名を使用できるようになりました。後方参照は、以前にキャプチャグループによって一致したのと同じテキストに一致します。これには、正規表現で `\k<name>` 構文を使用します。

```kotlin
fun backRef() {
    val regex = "(?<title>\\w+), yes \\k<title>".toRegex()
    val match = regex.find("Do you copy? Sir, yes Sir!")!!
    println(match.value) // "Sir, yes Sir"
    println(match.groups["title"]?.value) // "Sir"
}
```

#### 置換式での名前付きグループ

名前付きグループの参照は、置換式（replacement expressions）でも使用できます。入力内の指定された正規表現のすべての出現箇所を置換式で置き換える [`replace()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-regex/replace.html) 関数と、最初の一致のみを置き換える [`replaceFirst()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-regex/replace-first.html) 関数を考えてみましょう。

置換文字列内の `${name}` は、指定された名前のキャプチャグループに対応する部分文字列に置き換えられます。名前とインデックスによるグループ参照の置換を比較できます。

```kotlin
fun dateReplace() {
    val dateRegex = Regex("(?<dd>\\d{2})-(?<mm>\\d{2})-(?<yyyy>\\d{4})")
    val input = "Date of birth: 27-04-2022"
    println(dateRegex.replace(input, "\${yyyy}-\${mm}-\${dd}")) // "Date of birth: 2022-04-27" — 名前で置換
    println(dateRegex.replace(input, "\$3-\$2-\$1")) // "Date of birth: 2022-04-27" — 番号で置換
}
```

## Gradle

このリリースでは、新しいビルドレポート、Gradle プラグインバリアントのサポート、kapt の新しい統計情報などが導入されました。

* [インクリメンタルコンパイルへの新しいアプローチ](#a-new-approach-to-incremental-compilation)
* [コンパイラのパフォーマンスを追跡するための新しいビルドレポート](#build-reports-for-kotlin-compiler-tasks)
* [Gradle および Android Gradle プラグインの最小サポートバージョンの変更](#bumping-minimum-supported-versions)
* [Gradle プラグインバリアントのサポート](#support-for-gradle-plugin-variants)
* [Kotlin Gradle プラグイン API のアップデート](#updates-in-the-kotlin-gradle-plugin-api)
* [plugins API 経由での sam-with-receiver プラグインの利用](#the-sam-with-receiver-plugin-is-available-via-the-plugins-api)
* [コンパイルタスクの変更](#changes-in-compile-tasks)
* [kapt における各アノテーションプロセッサによる生成ファイルの新しい統計情報](#statistics-of-generated-files-by-each-annotation-processor-in-kapt)
* [kotlin.compiler.execution.strategy システムプロパティの非推奨化](#deprecation-of-the-kotlin-compiler-execution-strategy-system-property)
* [非推奨のオプション、メソッド、およびプラグインの削除](#removal-of-deprecated-options-methods-and-plugins)

### インクリメンタルコンパイルへの新しいアプローチ

> インクリメンタルコンパイルへの新しいアプローチは[試験的（Experimental）](components-stability.md)です。いつでも廃止または変更される可能性があります。
> 利用にはオプトインが必要です（詳細は以下を参照）。評価目的でのみ使用することをお勧めします。フィードバックは [YouTrack](https://youtrack.jetbrains.com/issues/KT) でお待ちしております。
>
{style="warning"}

Kotlin 1.7.0 では、モジュールをまたぐ変更に対するインクリメンタルコンパイルを刷新しました。現在は、依存する非 Kotlin モジュール内で行われた変更に対してもインクリメンタルコンパイルがサポートされるようになり、[Gradle ビルドキャッシュ](https://docs.gradle.org/current/userguide/build_cache.html)との互換性も確保されました。コンパイル回避（compilation avoidance）のサポートも改善されています。

ビルドキャッシュを使用している場合や、非 Kotlin Gradle モジュールで頻繁に変更を行う場合に、この新しいアプローチの大きな恩恵を受けられると考えています。Kotlin プロジェクトの `kotlin-gradle-plugin` モジュールに対するテストでは、キャッシュヒット後の変更に対して 80% 以上の改善が見られました。

この新しいアプローチを試すには、`gradle.properties` で以下のオプションを設定してください。

```none
kotlin.incremental.useClasspathSnapshot=true
```

> 現在、インクリメンタルコンパイルの新しいアプローチは、Gradle ビルドシステムの JVM バックエンドでのみ利用可能です。
>
{style="note"}

新しいインクリメンタルコンパイルのアプローチが内部でどのように実装されているかについては、[こちらのブログ投稿](https://blog.jetbrains.com/kotlin/2022/07/a-new-approach-to-incremental-compilation-in-kotlin/)をご覧ください。

弊社の計画では、この技術を安定させ、他のバックエンド（JS など）やビルドシステムへのサポートを追加する予定です。このコンパイルスキームで発生した問題や奇妙な動作については、[YouTrack](https://youtrack.jetbrains.com/issues/KT) への報告をお待ちしております。ありがとうございます！

Kotlin チームは、[Ivan Gavrilovic](https://github.com/gavra0) 氏、[Hung Nguyen](https://github.com/hungvietnguyen) 氏、[Cédric Champeau](https://github.com/melix) 氏、およびその他の外部貢献者の協力に深く感謝いたします。

### Kotlin コンパイラタスクのビルドレポート

> Kotlin ビルドレポートは[試験的（Experimental）](components-stability.md)です。いつでも廃止または変更される可能性があります。
> 利用にはオプトインが必要です（詳細は以下を参照）。評価目的でのみ使用してください。フィードバックは [YouTrack](https://youtrack.jetbrains.com/issues/KT) でお待ちしております。
>
{style="warning"}

Kotlin 1.7.0 では、コンパイラのパフォーマンスを追跡するのに役立つビルドレポートを導入しました。レポートには、さまざまなコンパイルフェーズの所要時間や、コンパイルがインクリメンタルにできなかった理由が含まれます。

ビルドレポートは、コンパイラタスクの問題を調査したい場合に役立ちます。例えば：

* Gradle ビルドに時間がかかりすぎており、パフォーマンス低下の根本原因を特定したい場合。
* 同じプロジェクトのコンパイル時間が異なり、数秒で終わることもあれば数分かかることもある場合。

ビルドレポートを有効にするには、`gradle.properties` でビルドレポートの出力保存先を宣言します。

```none
kotlin.build.report.output=file
```

以下の値（およびそれらの組み合わせ）が利用可能です。

* `file`：ビルドレポートをローカルファイルに保存します。
* `build_scan`：ビルドレポートを [build scan](https://scans.gradle.com/) の `custom values` セクションに保存します。

  > Gradle Enterprise プラグインは、カスタム値の数とその長さを制限しています。大規模なプロジェクトでは、一部の値が失われる可能性があります。
  >
  {style="note"}

* `http`：HTTP(S) を使用してビルドレポートを投稿します。POST メソッドはメトリクスを JSON 形式で送信します。データはバージョンごとに変更される可能性があります。送信されるデータの現在のバージョンは、[Kotlin リポジトリ](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-plugin/src/common/kotlin/org/jetbrains/kotlin/gradle/report/data/GradleCompileStatisticsData.kt)で確認できます。

長時間かかるコンパイルのビルドレポートを分析することで解決できる、一般的な 2 つのケースがあります。

* ビルドがインクリメンタルではなかった。原因を分析し、根本的な問題を修正してください。
* ビルドはインクリメンタルだったが、時間がかかりすぎた。ソースファイルの再構成を試みてください（大きなファイルを分割する、別々のクラスを異なるファイルに保存する、大きなクラスをリファクタリングする、トップレベル関数を異なるファイルで宣言するなど）。

新しいビルドレポートの詳細については、[こちらのブログ投稿](https://blog.jetbrains.com/kotlin/2022/06/introducing-kotlin-build-reports/)をご覧ください。

ぜひお客様のインフラでビルドレポートをお試しください。フィードバック、問題の発見、または改善の提案がある場合は、遠慮なく [弊社課題トラッカー](https://youtrack.jetbrains.com/newIssue) に報告してください。ありがとうございます！

### サポート対象最小バージョンの引き上げ

Kotlin 1.7.0 以降、サポートされる最小の Gradle バージョンは 6.7.1 になりました。[Gradle プラグインバリアント](#support-for-gradle-plugin-variants)と新しい Gradle API をサポートするために、[バージョンを引き上げる](https://youtrack.jetbrains.com/issue/KT-49733/Bump-minimal-supported-Gradle-version-to-6-7-1)必要がありました。将来的には、Gradle プラグインバリアント機能のおかげで、最小サポートバージョンをそれほど頻繁に引き上げる必要はなくなるはずです。

また、サポートされる最小の Android Gradle プラグイン（AGP）バージョンは 3.6.4 になりました。

### Gradle プラグインバリアントのサポート

Gradle 7.0 では、Gradle プラグイン作成者向けの新しい機能である [variants を持つプラグイン（plugins with variants）](https://docs.gradle.org/7.0/userguide/implementing_gradle_plugins.html#plugin-with-variants)が導入されました。この機能により、7.1 未満の Gradle バージョンとの互換性を維持しながら、新しい Gradle 機能のサポートを簡単に追加できるようになります。[Gradle におけるバリアント選択（variant selection）](https://docs.gradle.org/current/userguide/variant_model.html)についての詳細をご覧ください。

Gradle プラグインバリアントを使用すると、異なる Gradle バージョンに対して異なる Kotlin Gradle プラグインバリアントを提供できます。目標は、サポートされる最も古い Gradle バージョンに対応する `main` バリアントでベースの Kotlin コンパイルをサポートすることです。各バリアントは、対応するリリースからの Gradle 機能の実装を持ちます。最新のバリアントは、最も広範な Gradle 機能セットをサポートします。このアプローチにより、機能は制限されますが、より古い Gradle バージョンのサポートを拡張できます。

現在、Kotlin Gradle プラグインには以下の 2 つのバリアントのみが存在します。

* `main`：Gradle バージョン 6.7.1–6.9.3 用
* `gradle70`：Gradle バージョン 7.0 以上用

今後の Kotlin リリースでは、さらに追加される可能性があります。

ビルドがどのバリアントを使用しているかを確認するには、[`--info` ログレベル](https://docs.gradle.org/current/userguide/logging.html#sec:choosing_a_log_level)を有効にし、出力から `Using Kotlin Gradle plugin` で始まる文字列（例: `Using Kotlin Gradle plugin main variant`）を探してください。

> Gradle におけるバリアント選択に関する既知の問題の回避策は以下の通りです。
> * [ResolutionStrategy in pluginManagement is not working for plugins with multivariants](https://github.com/gradle/gradle/issues/20545)
> * [Plugin variants are ignored when a plugin is added as the `buildSrc` common dependency](https://github.com/gradle/gradle/issues/20847)
>
{style="note"}

フィードバックは[こちらの YouTrack チケット](https://youtrack.jetbrains.com/issue/KT-49227/Support-Gradle-plugins-variants)にお寄せください。

### Kotlin Gradle プラグイン API のアップデート

Kotlin Gradle プラグイン API アーティファクトに、いくつかの改善が行われました。

* ユーザーが設定可能な入力を持つ、Kotlin/JVM および Kotlin/kapt タスク用の新しいインターフェースが追加されました。
* すべての Kotlin プラグインが継承する新しい `KotlinBasePlugin` インターフェースが追加されました。Kotlin Gradle プラグイン（JVM、JS、Multiplatform、Native、その他のプラットフォーム）のいずれかが適用されたときに、何らかの設定アクションをトリガーしたい場合は、このインターフェースを使用してください。

  ```kotlin
  project.plugins.withType<org.jetbrains.kotlin.gradle.plugin.KotlinBasePlugin>() {
      // ここにアクションを設定
  }
  ```
  `KotlinBasePlugin` に関するフィードバックは、[こちらの YouTrack チケット](https://youtrack.jetbrains.com/issue/KT-48008/Consider-offering-a-KotlinBasePlugin)にお寄せください。

* Android Gradle プラグインが、それ自体の中で Kotlin コンパイルを設定できるようにするための基礎を整えました。つまり、ビルドに Kotlin Android Gradle プラグインを追加する必要がなくなります。追加されたサポートの詳細については、[Android Gradle Plugin のリリース告知](https://developer.android.com/studio/releases/gradle-plugin)をフォローして確認し、試してみてください！

### plugins API 経由での sam-with-receiver プラグインの利用

[sam-with-receiver コンパイラプラグイン](sam-with-receiver-plugin.md)が、[Gradle plugins DSL](https://docs.gradle.org/current/userguide/plugins.html#sec:plugins_block) 経由で利用可能になりました。

```kotlin
plugins {
    id("org.jetbrains.kotlin.plugin.sam.with.receiver") version "$kotlin_version"
}
```

### コンパイルタスクの変更

このリリースでは、コンパイルタスクに多くの変更が行われました。

* Kotlin コンパイルタスクは、Gradle の `AbstractCompile` タスクを継承しなくなりました。`DefaultTask` のみを継承します。
* `AbstractCompile` タスクには `sourceCompatibility` および `targetCompatibility` 入力があります。`AbstractCompile` タスクを継承しなくなったため、これらの入力は Kotlin ユーザーのスクリプトでは利用できなくなりました。
* `SourceTask.stableSources` 入力は利用できなくなり、`sources` 入力を使用する必要があります。`setSource(...)` メソッドは引き続き利用可能です。
* すべてのコンパイルタスクは、コンパイルに必要なライブラリのリストとして `libraries` 入力を使用するようになりました。`KotlinCompile` タスクには引き続き非推奨の Kotlin プロパティ `classpath` がありますが、これは将来のリリースで削除される予定です。
* コンパイルタスクは引き続き `PatternFilterable` インターフェースを実装しており、Kotlin ソースのフィルタリングが可能です。`sourceFilesExtensions` 入力は削除され、代わりに `PatternFilterable` メソッドを使用するようになりました。
* 非推奨の `Gradle destinationDir: File` 出力は、`destinationDirectory: DirectoryProperty` 出力に置き換えられました。
* Kotlin/Native の `AbstractNativeCompile` タスクは、`AbstractKotlinCompileTool` 基底クラスを継承するようになりました。これは、Kotlin/Native ビルドツールを他のすべてのツールに統合するための第一歩です。

フィードバックは[こちらの YouTrack チケット](https://youtrack.jetbrains.com/issue/KT-32805)にお寄せください。

### kapt における各アノテーションプロセッサによる生成ファイルの統計情報

`kotlin-kapt` Gradle プラグインは、既に[各プロセッサのパフォーマンス統計を報告しています](https://github.com/JetBrains/kotlin/pull/4280)。Kotlin 1.7.0 以降、各アノテーションプロセッサによって生成されたファイルの数に関する統計も報告できるようになりました。

これは、ビルドの一部として未使用のアノテーションプロセッサがあるかどうかを追跡するのに役立ちます。生成されたレポートを使用して、不要なアノテーションプロセッサをトリガーしているモジュールを特定し、それを防ぐようにモジュールを更新できます。

統計を有効にするには、以下の 2 つのステップを実行します。

* `build.gradle.kts` で `showProcessorStats` フラグを `true` に設定します。

  ```kotlin
  kapt {
      showProcessorStats = true
  }
  ```

* `gradle.properties` で `kapt.verbose` Gradle プロパティを `true` に設定します。
  
  ```none
  kapt.verbose=true
  ```

> [コマンドラインオプション `verbose`](kapt.md#cli) を介して詳細出力を有効にすることもできます。
>
{style="note"}

統計は `info` レベルのログに表示されます。`Annotation processor stats:` という行に続いて、各アノテーションプロセッサの実行時間に関する統計が表示されます。これらの行の後に `Generated files report:` という行があり、各アノテーションプロセッサによる生成ファイル数に関する統計が表示されます。例：

```text
[INFO] Annotation processor stats:
[INFO] org.mapstruct.ap.MappingProcessor: total: 290 ms, init: 1 ms, 3 round(s): 289 ms, 0 ms, 0 ms
[INFO] Generated files report:
[INFO] org.mapstruct.ap.MappingProcessor: total sources: 2, sources per round: 2, 0, 0
```

フィードバックは[こちらの YouTrack チケット](https://youtrack.jetbrains.com/issue/KT-51132/KAPT-Support-reporting-the-number-of-generated-files-by-each-ann)にお寄せください。

### kotlin.compiler.execution.strategy システムプロパティの非推奨化

Kotlin 1.6.20 では、[Kotlin コンパイラの実行戦略を定義するための新しいプロパティ](whatsnew1620.md#properties-for-defining-kotlin-compiler-execution-strategy)が導入されました。Kotlin 1.7.0 では、新しいプロパティの使用を推奨し、古いシステムプロパティ `kotlin.compiler.execution.strategy` の非推奨サイクルが始まりました。

`kotlin.compiler.execution.strategy` システムプロパティを使用すると警告が表示されます。このプロパティは将来のリリースで削除される予定です。以前の動作を維持するには、システムプロパティを同じ名前の Gradle プロパティに置き換えてください。例えば `gradle.properties` で以下のように設定できます。

```none
kotlin.compiler.execution.strategy=out-of-process
```

また、コンパイルタスクプロパティ `compilerExecutionStrategy` を使用することもできます。詳細については、[コンパイラ実行戦略のページ](compiler-execution-strategy.md)をご覧ください。

### 非推奨のオプション、メソッド、およびプラグインの削除

#### useExperimentalAnnotation メソッドの削除

Kotlin 1.7.0 では、`useExperimentalAnnotation` Gradle メソッドの非推奨サイクルを完了しました。モジュール内で API の使用をオプトインするには、代わりに `optIn()` を使用してください。

例えば、Gradle モジュールがマルチプラットフォームの場合：

```kotlin
sourceSets {
    all {
        languageSettings.optIn("org.mylibrary.OptInAnnotation")
    }
}
```

Kotlin における[オプトイン要求](opt-in-requirements.md)の詳細をご覧ください。

#### 非推奨のコンパイラオプションの削除

いくつかのコンパイラオプションの非推奨サイクルを完了しました。

* `kotlinOptions.jdkHome` コンパイラオプションは 1.5.30 で非推奨となり、現在のリリースで削除されました。このオプションが含まれている Gradle ビルドは失敗するようになります。Kotlin 1.5.30 以降でサポートされている [Java ツールチェーン](whatsnew1530.md#support-for-java-toolchains)を使用することをお勧めします。
* 非推奨の `noStdlib` コンパイラオプションも削除されました。Gradle プラグインは `kotlin.stdlib.default.dependency=true` プロパティを使用して、Kotlin 標準ライブラリの有無を制御します。

> コンパイラ引数 `-jdkHome` および `-no-stdlib` は引き続き利用可能です。
>
{style="note"}

#### 非推奨のプラグインの削除

Kotlin 1.4.0 で非推奨となった `kotlin2js` および `kotlin-dce-plugin` プラグインは、このリリースで削除されました。`kotlin2js` の代わりに、新しい `org.jetbrains.kotlin.js` プラグインを使用してください。デッドコード削除（DCE）は、Kotlin/JS Gradle プラグインが適切に設定されていれば動作します。

Kotlin 1.6.0 では、`KotlinGradleSubplugin` クラスの非推奨レベルを `ERROR` に変更しました。開発者はコンパイラプラグインの作成にこのクラスを使用していました。このリリースでは、[このクラスが削除されました](https://youtrack.jetbrains.com/issue/KT-48831/)。代わりに `KotlinCompilerPluginSupportPlugin` クラスを使用してください。

> プロジェクト全体でバージョン 1.7.0 以降の Kotlin プラグインを使用することをお勧めします。
>
{style="tip"}

#### 非推奨の coroutines DSL オプションおよびプロパティの削除

非推奨の `kotlin.experimental.coroutines` Gradle DSL オプションと、`gradle.properties` で使用されていた `kotlin.coroutines` プロパティを削除しました。現在は、単に _[サスペンド関数](coroutines-basics.md)_を使用するか、ビルドスクリプトに [`kotlinx.coroutines` 依存関係を追加](gradle-configure-project.md#set-a-dependency-on-a-kotlinx-library)するだけで済みます。

コルーチンの詳細については、[コルーチンガイド](coroutines-guide.md)をご覧ください。

#### ツールチェーン拡張メソッドにおける型キャストの削除

Kotlin 1.7.0 より前は、Kotlin DSL で Gradle ツールチェーンを設定する際、`JavaToolchainSpec` クラスへの型キャストが必要でした。

```kotlin
kotlin {
    jvmToolchain {
        (this as JavaToolchainSpec).languageVersion.set(JavaLanguageVersion.of(<MAJOR_JDK_VERSION>)
    }
}
```

現在は、`(this as JavaToolchainSpec)` の部分を省略できます。

```kotlin
kotlin {
    jvmToolchain {
        languageVersion.set(JavaLanguageVersion.of(<MAJOR_JDK_VERSION>)
    }
}
```

## Kotlin 1.7.0 への移行

### Kotlin 1.7.0 のインストール

IntelliJ IDEA 2022.1 および Android Studio Chipmunk (212) は、Kotlin プラグインを 1.7.0 に更新するように自動的に提案します。

> IntelliJ IDEA 2022.2、および Android Studio Dolphin (213) または Android Studio Electric Eel (221) の場合、Kotlin プラグイン 1.7.0 は、今後の IntelliJ IDEA および Android Studio のアップデートとともに提供されます。
> 
{style="note"}

新しいコマンドラインコンパイラは、[GitHub リリースページ](https://github.com/JetBrains/kotlin/releases/tag/v1.7.0)からダウンロードできます。

### 既存のプロジェクトの移行、または Kotlin 1.7.0 での新しいプロジェクトの開始

* 既存のプロジェクトを Kotlin 1.7.0 に移行するには、Kotlin のバージョンを `1.7.0` に変更し、Gradle または Maven プロジェクトを再インポートしてください。[Kotlin 1.7.0 へのアップデート方法を学ぶ](releases.md#update-to-a-new-kotlin-version)。

* Kotlin 1.7.0 で新しいプロジェクトを開始するには、Kotlin プラグインを更新し、**File** | **New** | **Project** からプロジェクトウィザードを実行します。

### Kotlin 1.7.0 互換性ガイド

Kotlin 1.7.0 は[フィーチャーリリース](kotlin-evolution-principles.md#language-and-tooling-releases)であるため、以前のバージョンの言語で書かれたコードと互換性のない変更が含まれる可能性があります。そのような変更の詳細なリストについては、[Kotlin 1.7.0 互換性ガイド](compatibility-guide-17.md)をご覧ください。