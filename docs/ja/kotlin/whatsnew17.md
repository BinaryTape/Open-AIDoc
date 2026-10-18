[//]: # (title: Kotlin 1.7.0 の新機能)

<web-summary>新しい言語機能、Kotlin Multiplatform、JVM、Native、JS へのアップデート、Gradle および Maven のビルドツールサポートなどを網羅した Kotlin 1.7.0 リリースノートをお読みください。</web-summary>

<tldr>
   <p>Kotlin 1.7.0 の IDE サポートは、IntelliJ IDEA 2021.2、2021.3、および 2022.1 で利用可能です。</p>
</tldr>

_[リリース日: 2022年6月9日](releases.md#release-history)_

Kotlin 1.7.0 がリリースされました。新しい Kotlin/JVM K2 コンパイラの Alpha バージョンが公開され、言語機能の安定化が行われたほか、JVM、JS、Native プラットフォームにおけるパフォーマンスが向上しています。

このバージョンの主なアップデートは以下のとおりです。

* [新しい Kotlin K2 コンパイラが Alpha に](#new-kotlin-k2-compiler-for-the-jvm-in-alpha)なり、大幅なパフォーマンス向上をもたらします。これは JVM のみで利用可能であり、kapt を含むコンパイラプラグインはいずれも動作しません。
* [Gradle におけるインクリメンタルコンパイルへの新しいアプローチ](#a-new-approach-to-incremental-compilation)。依存する非 Kotlin モジュール内で行われた変更に対してもインクリメンタルコンパイルがサポートされるようになり、Gradle との互換性も確保されました。
* [オプトイン要求アノテーション](#stable-opt-in-requirements)、[厳格に非 null な型（definitely non-nullable types）](#stable-definitely-non-nullable-types)、[ビルダー推論](#stable-builder-inference)が安定化（Stable）しました。
* [型引数用のアンダースコア演算子が導入](#underscore-operator-for-type-arguments)されました。他の型が指定されている場合に、特定の型引数を自動的に推論させるために使用できます。
* [インラインクラスのインライン化された値への委譲による実装が可能に](#allow-implementation-by-delegation-to-an-inlined-value-of-an-inline-class)なりました。ほとんどのケースでメモリ割り当てを伴わない軽量なラッパーを作成できるようになります。

この動画でも変更の概要を簡単に確認できます。

<video src="https://www.youtube.com/v/54WEfLKtCGk" title="What's new in Kotlin 1.7.0"/>

> Kotlin のリリースサイクルの詳細については、[Kotlin リリースプロセス](releases.md)を参照してください。
>
{style="tip"}

## JVM 向けの新しい Kotlin K2 コンパイラが Alpha に {id="new-kotlin-k2-compiler-for-the-jvm-in-alpha"}

この Kotlin リリースでは、新しい Kotlin K2 コンパイラの **Alpha** バージョンが導入されました。新しいコンパイラは、新言語機能の開発スピードの向上、Kotlin がサポートする全プラットフォームの統一、パフォーマンスの向上、およびコンパイラ拡張用 API の提供を目指しています。

新しいコンパイラとその利点についての詳細な解説は、すでに公開されています。

* [The Road to the New Kotlin Compiler](https://www.youtube.com/watch?v=iTdJJq_LyoY)
* [K2 Compiler: a Top-Down View](https://www.youtube.com/watch?v=db19VFLZqJM)

重要な点として、新しい K2 コンパイラの Alpha バージョンでは主にパフォーマンスの向上に焦点を当てており、JVM プロジェクトでのみ動作します。Kotlin/JS、Kotlin/Native、その他のマルチプラットフォームプロジェクトはサポートされておらず、[kapt](kapt.md) を含むコンパイラプラグインも動作しません。

内部プロジェクトにおけるベンチマークでは、以下のような優れた結果が得られています。

| プロジェクト | 現行 Kotlin コンパイラのパフォーマンス | 新しい K2 Kotlin コンパイラのパフォーマンス | パフォーマンス向上 |
|---------------|-------------------------------------|------------------------------------|-------------------|
| Kotlin        | 2.2 KLOC/s                          | 4.8 KLOC/s                         | 約 2.2 倍         |
| YouTrack      | 1.8 KLOC/s                          | 4.2 KLOC/s                         | 約 2.3 倍         |
| IntelliJ IDEA | 1.8 KLOC/s                          | 3.9 KLOC/s                         | 約 2.2 倍         |
| Space         | 1.2 KLOC/s                          | 2.8 KLOC/s                         | 約 2.3 倍         |

> KLOC/s のパフォーマンス数値は、コンパイラが1秒あたりに処理するコード行数（千行単位）を表しています。
>
> {style="tip"}

ご自身の JVM プロジェクトでパフォーマンスの向上を確認し、旧コンパイラの結果と比較することができます。Kotlin K2 コンパイラを有効にするには、以下のコンパイラオプションを使用します。

```bash
-Xuse-k2
```

また、K2 コンパイラには[多くのバグ修正が含まれています](https://youtrack.jetbrains.com/issues/KT?q=tag:%20FIR-preview-qa%20%23Resolved)。このリスト内で **State: Open** になっている課題であっても、実際には K2 で修正されている点にご注意ください。

今後の Kotlin リリースでは、K2 コンパイラの安定性が向上し、さらに多くの機能が提供される予定です。どうぞご期待ください！

Kotlin K2 コンパイラでパフォーマンス上の問題が発生した場合は、[課題トラッカーにご報告ください](https://kotl.in/issue)。

## 言語 {id="language"}

Kotlin 1.7.0 では、委譲による実装のサポートと、型引数用の新しいアンダースコア演算子が導入されました。また、過去のリリースでプレビューとして導入されていたいくつかの言語機能が安定化しました。

* [インラインクラスのインライン化された値への委譲による実装](#allow-implementation-by-delegation-to-an-inlined-value-of-an-inline-class)
* [型引数用のアンダースコア演算子](#underscore-operator-for-type-arguments)
* [ビルダー推論の安定化](#stable-builder-inference)
* [オプトイン要求の安定化](#stable-opt-in-requirements)
* [厳格に非 null な型の安定化](#stable-definitely-non-nullable-types)

### インラインクラスのインライン化された値への委譲による実装の許可 {id="allow-implementation-by-delegation-to-an-inlined-value-of-an-inline-class"}

値やクラスインスタンスの軽量ラッパーを作成したい場合、すべてのインターフェースメソッドを手作業で実装する必要がありました。委譲による実装（implementation by delegation）はこの問題を解決しますが、1.7.0 より前はインラインクラスでは機能しませんでした。この制限が撤廃されたため、ほとんどの場合でメモリ割り当てが発生しない軽量ラッパーを作成できるようになりました。

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

### 型引数用のアンダースコア演算子 {id="underscore-operator-for-type-arguments"}

Kotlin 1.7.0 では、型引数用のアンダースコア演算子 `_` が導入されました。これを使用すると、他の型が指定されている場合に型引数を自動的に推論させることができます。

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
    // SomeImplementation が SomeClass<String> を継承しているため、T は String と推論される
    val s = Runner.run<SomeImplementation, _>()
    assert(s == "Test")

    // OtherImplementation が SomeClass<Int> を継承しているため、T は Int と推論される
    val n = Runner.run<OtherImplementation, _>()
    assert(n == 42)
}
```

> アンダースコア演算子は、型引数を推論させるために型引数リストの任意の位置で使用できます。
>
{style="note"}

### ビルダー推論の安定化 {id="stable-builder-inference"}

ビルダー推論（Builder inference）は、ジェネリックなビルダー関数を呼び出す際に役立つ特別な型の推論です。ラムダ引数内にある他の呼び出しの型情報を使用して、呼び出しの型引数をコンパイラが推論するのを助けます。

1.7.0 以降、通常の型推論で十分な型情報が得られない場合、[1.6.0 で導入された](whatsnew16.md#changes-to-builder-inference) `-Xenable-builder-inference` コンパイラオプションを指定しなくても、ビルダー推論が自動的に有効になります。

[カスタムのジェネリックビルダーの作成方法についてはこちら](using-builders-with-builder-inference.md)。

### オプトイン要求の安定化 {id="stable-opt-in-requirements"}

[オプトイン要求](opt-in-requirements.md)が[安定版（Stable）](components-stability.md)となり、追加のコンパイラ設定が不要になりました。

1.7.0 より前は、警告を回避するためにオプトイン機能自体に `-opt-in=kotlin.RequiresOptIn` 引数が必要でした。これは不要になりましたが、他のアノテーションに対してオプトインするため、あるいは[モジュール全体でオプトイン](opt-in-requirements.md#opt-in-a-module)するために、引き続きコンパイラ引数 `-opt-in` を使用できます。

### 厳格に非 null な型の安定化 {id="stable-definitely-non-nullable-types"}

Kotlin 1.7.0 では、厳格に非 null な型（definitely non-nullable types）が[安定版（Stable）](components-stability.md)に昇格しました。これにより、ジェネリックな Java クラスやインターフェースを拡張する際の相互運用性が向上します。

新しい構文 `T & Any` を使用して、使用箇所（use-site）でジェネリック型パラメータを厳格に非 null としてマークできます。この構文形式は[交差型（intersection types）](https://en.wikipedia.org/wiki/Intersection_type)の表記に由来しており、現在は `&` の左側に null 許容の上限境界を持つ型パラメータ、右側に非 null の `Any` を持つ形に制限されています。

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

definitely non-nullable types の詳細については、[こちらの KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/definitely-non-nullable-types.md) を参照してください。

## Kotlin/JVM {id="kotlin-jvm"}

このリリースでは、Kotlin/JVM コンパイラのパフォーマンス向上と新しいコンパイラオプションがもたらされました。さらに、関数型インターフェースのコンストラクタへの呼び出し可能参照（callable reference）が Stable になりました。なお、1.7.0 以降、Kotlin/JVM コンパイルのデフォルトのターゲットバージョンは `1.8` となっています。

* [コンパイラのパフォーマンス最適化](#compiler-performance-optimizations)
* [新しいコンパイラオプション `-Xjdk-release`](#new-compiler-option-xjdk-release)
* [関数型インターフェースコンストラクタへの呼び出し可能参照の安定化](#stable-callable-references-to-functional-interface-constructors)
* [JVM ターゲットバージョン 1.6 の廃止](#removed-jvm-target-version-1-6)

### コンパイラのパフォーマンス最適化 {id="compiler-performance-optimizations"}

Kotlin 1.7.0 では、Kotlin/JVM コンパイラのパフォーマンスが改善されました。ベンチマークによると、コンパイル時間は Kotlin 1.6.0 と比較して[平均で 10% 短縮](https://youtrack.jetbrains.com/issue/KT-48233/Switching-to-JVM-IR-backend-increases-compilation-time-by-more-t#focus=Comments-27-6114542.0-0)されました。インライン関数が多用されているプロジェクト（例えば [`kotlinx.html` を使用しているプロジェクト](https://youtrack.jetbrains.com/issue/KT-51416/Compilation-of-kotlinx-html-DSL-should-still-be-faster)など）では、バイトコードの後処理の改善によりコンパイルがさらに高速化されます。

### 新しいコンパイラオプション: -Xjdk-release {id="new-compiler-option-xjdk-release"}

Kotlin 1.7.0 では、新しいコンパイラオプション `-Xjdk-release` が導入されました。このオプションは [javac のコマンドラインオプション `--release`](http://openjdk.java.net/jeps/247) と同様のものです。`-Xjdk-release` オプションは、ターゲットバイトコードのバージョンを制御し、クラスパス内の JDK の API を指定した Java バージョンに制限します。例えば、`kotlinc -Xjdk-release=1.8` は、依存関係にある JDK がバージョン 9 以上であっても `java.lang.Module` の参照を許可しません。

> このオプションは、すべての JDK ディストリビューションで効果があることが[保証されているわけではありません](https://youtrack.jetbrains.com/issue/KT-29974)。
>
{style="note"}

フィードバックは[こちらの YouTrack チケット](https://youtrack.jetbrains.com/issue/KT-29974/Add-a-compiler-option-Xjdk-release-similar-to-javac-s-release-to)にお寄せください。

### 関数型インターフェースコンストラクタへの呼び出し可能参照の安定化 {id="stable-callable-references-to-functional-interface-constructors"}

関数型インターフェースのコンストラクタへの[呼び出し可能参照（callable references）](fun-interfaces.md#pass-callable-references-to-sam-parameters)が [Stable](components-stability.md) になりました。呼び出し可能参照を使用してコンストラクタ関数を持つインターフェースから関数型インターフェースへ[移行する方法](fun-interfaces.md#migration-from-an-interface-with-constructor-function-to-a-functional-interface)をご確認ください。

問題を見つけた場合は、[YouTrack](https://youtrack.jetbrains.com/newissue?project=kt) にご報告ください。

### JVM ターゲットバージョン 1.6 の廃止 {id="removed-jvm-target-version-1-6"}

Kotlin/JVM コンパイルのデフォルトのターゲットバージョンは `1.8` です。ターゲット `1.6` は削除されました。

JVM ターゲット 1.8 以上への移行をお願いします。各ツールでの JVM ターゲットバージョンの更新方法については、以下を参照してください。

* [Gradle](gradle-compiler-options.md#attributes-specific-to-jvm)
* [Maven](maven-kotlin-compiler.md#attributes-specific-to-jvm)
* [コマンドラインコンパイラ](compiler-reference.md#jvm-target-version)

## Kotlin/Native {id="kotlin-native"}

Kotlin 1.7.0 には、Objective-C および Swift との相互運用性に関する変更が含まれ、以前のリリースで導入された機能が安定化しました。また、新しいメモリマネージャーのパフォーマンス改善をはじめとする以下のアップデートが含まれています。

* [新しいメモリマネージャーのパフォーマンス改善](#performance-improvements-for-the-new-memory-manager)
* [JVM および JS IR バックエンドと統一されたコンパイラプラグイン ABI](#unified-compiler-plugin-abi-with-jvm-and-js-ir-backends)
* [スタンドアロン Android 実行可能ファイルのサポート](#support-for-standalone-android-executables)
* [Swift async/await との相互運用: `KotlinUnit` の代わりに `Void` を返す](#interop-with-swift-async-await-returning-void-instead-of-kotlinunit)
* [Objective-C ブリッジを介した未宣言の例外の禁止](#prohibited-undeclared-exceptions-through-objective-c-bridges)
* [CocoaPods 連携の改善](#improved-cocoapods-integration)
* [Kotlin/Native コンパイラのダウンロード URL の上書き](#overriding-the-kotlin-native-compiler-download-url)

### 新しいメモリマネージャーのパフォーマンス改善 {id="performance-improvements-for-the-new-memory-manager"}

> 新しい Kotlin/Native メモリマネージャーは [Alpha](components-stability.md) です。
> 将来的に互換性のない変更が行われ、手動での移行が必要になる可能性があります。
> [YouTrack](https://youtrack.jetbrains.com/issue/KT-48525) でのフィードバックをお待ちしております。
>
{style="note"}

新しいメモリマネージャーはまだ Alpha ですが、[Stable](components-stability.md) に向けて順調に進んでいます。このリリースでは、特にガベージコレクション（GC）において、新しいメモリマネージャーの大幅なパフォーマンス改善が施されました。特に、[1.6.20 で導入された](whatsnew1620.md)スイープ（sweep）フェーズの並行実装がデフォルトで有効になりました。これにより、GC によるアプリケーションの一時停止時間を短縮できます。新しい GC スケジューラは、特に大きなヒープに対して GC の頻度をより適切に選択できるようになりました。

また、デバッグバイナリを特別に最適化し、メモリマネージャーの実装コードで適切な最適化レベルとリンク時最適化（LTO）が使用されるようにしました。これにより、ベンチマークにおけるデバッグバイナリの実行時間を約 30% 改善できました。

プロジェクトで新しいメモリマネージャーを試して動作を確認し、[YouTrack](https://youtrack.jetbrains.com/issue/KT-48525) でフィードバックを共有してください。

### JVM および JS IR バックエンドと統一されたコンパイラプラグイン ABI {id="unified-compiler-plugin-abi-with-jvm-and-js-ir-backends"}

Kotlin 1.7.0 より、Kotlin Multiplatform Gradle プラグインはデフォルトで Kotlin/Native 用の embeddable コンパイラ jar を使用するようになりました。この[機能は 1.6.0 で発表](whatsnew16.md#unified-compiler-plugin-abi-with-jvm-and-js-ir-backends)され、Experimental でしたが、今回 Stable となり利用可能になりました。

この改善はライブラリ作成者にとって非常に便利であり、コンパイラプラグインの開発体験が向上します。これまでは Kotlin/Native 用に個別のアーティファクトを提供する必要がありましたが、Native と他のサポートされているプラットフォームで同じコンパイラプラグインアーティファクトを使用できるようになりました。

> この機能により、プラグイン開発者は既存のプラグインに対して移行手順が必要になる場合があります。
>
> プラグインをアップデートに対応させる方法については、こちらの [YouTrack 課題](https://youtrack.jetbrains.com/issue/KT-48595) を参照してください。
>
{style="warning"}

### スタンドアロン Android 実行可能ファイルのサポート {id="support-for-standalone-android-executables"}

Kotlin 1.7.0 は、Android Native ターゲット用の標準的な実行可能ファイルの生成を完全にサポートします。[1.6.20 で導入](whatsnew1620.md#support-for-standalone-android-executables)された機能ですが、デフォルトで有効になりました。

Kotlin/Native が共有ライブラリを生成していた以前の動作に戻したい場合は、次の設定を使用してください。

```kotlin
binaryOptions["androidProgramType"] = "nativeActivity"
```

### Swift async/await との相互運用: KotlinUnit の代わりに Void を返す {id="interop-with-swift-async-await-returning-void-instead-of-kotlinunit"}

Kotlin の `suspend` 関数が、Swift において `KotlinUnit` ではなく `Void` 型を返すようになりました。これは、Swift の `async`/`await` との相互運用性が向上した結果です。この機能は [1.6.20 で導入](whatsnew1620.md#interop-with-swift-async-await-returning-void-instead-of-kotlinunit)され、本リリースでデフォルトの挙動となりました。

このような関数に対して適切な型を返させるために、`kotlin.native.binary.unitSuspendFunctionObjCExport=proper` プロパティを使用する必要はもうありません。

### Objective-C ブリッジを介した未宣言の例外の禁止 {id="prohibited-undeclared-exceptions-through-objective-c-bridges"}

Swift/Objective-C コードから Kotlin コードを呼び出す場合（またはその逆）、そのコードが例外をスローしたときは、適切な変換を伴って言語間での例外の転送を明示的に許可していない限り（例えば `@Throws` アノテーションを使用するなど）、例外が発生したコード内で処理される必要があります。

以前は、特定のケースで未宣言の例外がある言語から別の言語へと「漏れ出る（leak）」という意図しない動作がありました。Kotlin 1.7.0 ではその問題が修正され、そのようなケースではプログラムが終了（terminate）するようになりました。

したがって、例えば Kotlin に `{ throw Exception() }` ラムダがあり、それを Swift から呼び出す場合、Kotlin 1.7.0 では例外が Swift コードに到達した瞬間に終了します。以前の Kotlin バージョンでは、そのような例外が Swift コードへ漏れ出ることがありました。

`@Throws` アノテーションは以前と同様に動作し続けます。

### CocoaPods 連携の改善 {id="improved-cocoapods-integration"}

Kotlin 1.7.0 以降、プロジェクトに CocoaPods を統合する際に `cocoapods-generate` プラグインをインストールする必要がなくなりました。

以前は、CocoaPods を使用して Kotlin Multiplatform Mobile プロジェクトで [iOS の依存関係](https://kotlinlang.org/docs/multiplatform/multiplatform-ios-dependencies.html#with-cocoapods)などを処理する場合、CocoaPods 依存関係マネージャーと `cocoapods-generate` プラグインの両方をインストールする必要がありました。

現在では CocoaPods 連携のセットアップがより簡単になり、Ruby 3 以降で `cocoapods-generate` がインストールできなかった問題も解決されました。Apple M1 でより快適に動作する最新の Ruby バージョンもサポートされています。

初期のセットアップ方法については、[CocoaPods 連携の初期設定](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-overview.html#set-up-an-environment-to-work-with-cocoapods)を参照してください。

### Kotlin/Native コンパイラのダウンロード URL の上書き {id="overriding-the-kotlin-native-compiler-download-url"}

Kotlin 1.7.0 より、Kotlin/Native コンパイラのダウンロード URL をカスタマイズできるようになりました。これは、CI 上で外部リンクへのアクセスが禁止されている場合に便利です。

デフォルトのベース URL である `https://download.jetbrains.com/kotlin/native/builds` を上書きするには、以下の Gradle プロパティを使用します。

```none
kotlin.native.distribution.baseDownloadUrl=https://example.com
```

> ダウンローダーは、実際のコンパイラディストリビューションを確実にダウンロードするため、このベース URL にネイティブのバージョンとターゲット OS を追加します。
>
{style="note"}

## Kotlin/JS {id="kotlin-js"}

Kotlin/JS では、[JS IR コンパイラバックエンド](js-ir-compiler.md)のさらなる改善や、開発体験を向上させるその他のアップデートが行われています。

* [新しい IR バックエンドのパフォーマンス改善](#performance-improvements-for-the-new-ir-backend)
* [IR 使用時におけるメンバー名の難読化・短縮化（ミニフィケーション）](#minification-for-member-names-when-using-ir)
* [IR バックエンドにおけるポリフィルによる古いブラウザのサポート](#support-for-older-browsers-via-polyfills-in-the-ir-backend)
* [js 式からの JavaScript モジュールの動的ロード](#dynamically-load-javascript-modules-from-js-expressions)
* [JavaScript テストランナー用の環境変数の指定](#specify-environment-variables-for-javascript-test-runners)

### 新しい IR バックエンドのパフォーマンス改善 {id="performance-improvements-for-the-new-ir-backend"}

このリリースには、開発体験を向上させるいくつかの大きなアップデートが含まれています。

* Kotlin/JS のインクリメンタルコンパイルのパフォーマンスが大幅に改善されました。JS プロジェクトのビルドにかかる時間が短縮されます。多くの場合、インクリメンタルな再ビルドはレガシーバックエンドとほぼ同等になりました。
* 最終成果物のサイズが大幅に削減されたため、Kotlin/JS の最終バンドルに必要な容量が少なくなりました。一部の大規模プロジェクトでは、レガシーバックエンドと比較して本番用バンドルサイズが最大 20% 削減されたことが確認されています。
* インターフェースの型チェックが桁違いに改善されました。
* Kotlin が生成する JS コードの品質が向上しました。

### IR 使用時におけるメンバー名の難読化・短縮化（ミニフィケーション） {id="minification-for-member-names-when-using-ir"}

Kotlin/JS IR コンパイラは、Kotlin のクラスや関数の関係性に関する内部情報を活用してより効率的なミニフィケーション（難読化・短縮化）を適用し、関数、プロパティ、クラスの名前を短縮するようになりました。これにより、結果として生成されるバンドルアプリケーションのサイズが縮小されます。

このミニフィケーションは、Kotlin/JS アプリケーションを本番モードでビルドする際に自動的に適用され、デフォルトで有効になっています。メンバー名のミニフィケーションを無効にするには、`-Xir-minimized-member-names` コンパイラフラグを使用します。

```kotlin
kotlin {
    js(IR) {
        compilations.all {
            compileKotlinTask.kotlinOptions.freeCompilerArgs += listOf("-Xir-minimized-member-names=false")
        }
    }
}
```

### IR バックエンドにおけるポリフィルによる古いブラウザのサポート {id="support-for-older-browsers-via-polyfills-in-the-ir-backend"}

Kotlin/JS の IR コンパイラバックエンドに、レガシーバックエンドと同じポリフィルが含まれるようになりました。これにより、新しいコンパイラでコンパイルされたコードを、Kotlin 標準ライブラリが使用している ES2015 のすべてのメソッドをサポートしていない古いブラウザでも実行できるようになります。プロジェクトで実際に使用されているポリフィルのみが最終バンドルに含まれるため、バンドルサイズへの影響は最小限に抑えられます。

この機能は IR コンパイラを使用する際にデフォルトで有効になっており、特別な設定は不要です。

### js 式からの JavaScript モジュールの動的ロード {id="dynamically-load-javascript-modules-from-js-expressions"}

JavaScript モジュールを扱う際、ほとんどのアプリケーションは静的インポートを使用しており、その利用法は [JavaScript モジュールの統合](js-modules.md)で説明されています。しかし、Kotlin/JS にはアプリケーションの実行時に動的に JavaScript モジュールをロードする仕組みがありませんでした。

Kotlin 1.7.0 以降、JavaScript の `import` 文が `js` ブロック内でサポートされ、実行時にパッケージを動的にアプリケーションへ読み込めるようになりました。

```kotlin
val myPackage = js("import('my-package')")
```

### JavaScript テストランナー用の環境変数の指定 {id="specify-environment-variables-for-javascript-test-runners"}

Node.js のパッケージ解決を調整したり、Node.js テストに外部情報を渡したりするために、JavaScript テストランナーが使用する環境変数を指定できるようになりました。環境変数を定義するには、ビルドスクリプトの `testTask` ブロック内で、キーと値のペアを指定して `environment()` 関数を使用します。

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

## 標準ライブラリ {id="standard-library"}

Kotlin 1.7.0 では、標準ライブラリにさまざまな変更と改善が行われました。新機能の導入、実験的機能の安定化、そして Native、JS、JVM における名前付きキャプチャグループのサポートの統一などが行われています。

* [min() および max() コレクション関数が非 null を返すように変更](#min-and-max-collection-functions-return-as-non-nullable)
* [特定のインデックスでの正規表現マッチング](#regular-expression-matching-at-specific-indices)
* [以前の言語バージョンおよび API バージョンのサポート拡張](#extended-support-for-previous-language-and-api-versions)
* [リフレクション経由でのアノテーションへのアクセス](#access-to-annotations-via-reflection)
* [ディープ再帰関数の安定化](#stable-deep-recursive-functions)
* [デフォルトのタイムソース用のインラインクラスに基づくタイムマーク](#time-marks-based-on-inline-classes-for-default-time-source)
* [Java Optional 用の新しい実験的拡張関数](#new-experimental-extension-functions-for-java-optionals)
* [JS および Native における名前付きキャプチャグループのサポート](#support-for-named-capturing-groups-in-js-and-native)

### min() および max() コレクション関数が非 null を返すように変更 {id="min-and-max-collection-functions-return-as-non-nullable"}

[Kotlin 1.4.0](whatsnew14.md) では、`min()` および `max()` コレクション関数の名前が `minOrNull()` および `maxOrNull()` に変更されました。これらの新しい名前は、レシーバーコレクションが空の場合に null を返すという挙動をより正確に反映しています。また、Kotlin コレクション API 全体で使用されている命名規則に関数の挙動を合わせるのにも役立ちました。

`minBy()`、`maxBy()`、`minWith()`、`maxWith()` についても同様で、Kotlin 1.4.0 ですべて `*OrNull()` のシノニムが用意されました。この変更の影響を受けた古い関数は徐々に非推奨（deprecated）となりました。

Kotlin 1.7.0 では、元の関数名が非 null の戻り値の型で再導入されました。新しい `min()`、`max()`、`minBy()`、`maxBy()`、`minWith()`、`maxWith()` 関数は、厳密にコレクションの要素を返すか、コレクションが空の場合は例外をスローします。

```kotlin
fun main() {
    val numbers = listOf<Int>()
    println(numbers.maxOrNull()) // "null"
    println(numbers.max()) // "Exception in... Collection is empty."
}
```

### 特定のインデックスでの正規表現マッチング {id="regular-expression-matching-at-specific-indices"}

[1.5.30 で導入された](whatsnew1530.md#matching-with-regex-at-a-particular-position) `Regex.matchAt()` および `Regex.matchesAt()` 関数が Stable になりました。これらは、`String` または `CharSequence` の特定の位置で正規表現が完全に一致するかどうかを確認する手段を提供します。

`matchesAt()` は一致するかどうかをチェックし、ブール値の結果を返します。

```kotlin
fun main() {
    val releaseText = "Kotlin 1.7.0 is on its way!"
    // 正規表現: 数字1桁、ドット、数字1桁、ドット、1桁以上の数字
    val versionRegex = "\\d[.]\\d[.]\\d+".toRegex()

    println(versionRegex.matchesAt(releaseText, 0)) // "false"
    println(versionRegex.matchesAt(releaseText, 7)) // "true"
}
```

`matchAt()` は一致が見つかった場合はそのマッチを返し、見つからない場合は `null` を返します。

```kotlin
fun main() {
    val releaseText = "Kotlin 1.7.0 is on its way!"
    val versionRegex = "\\d[.]\\d[.]\\d+".toRegex()

    println(versionRegex.matchAt(releaseText, 0)) // "null"
    println(versionRegex.matchAt(releaseText, 7)?.value) // "1.7.0"
}
```

フィードバックは、こちらの [YouTrack 課題](https://youtrack.jetbrains.com/issue/KT-34021) にお寄せください。

### 以前の言語バージョンおよび API バージョンのサポート拡張 {id="extended-support-for-previous-language-and-api-versions"}

幅広い過去の Kotlin バージョンで利用できるライブラリを開発しているライブラリ作成者をサポートし、また Kotlin のメジャーリリースの頻度が増加したことに対応するため、以前の言語および API バージョンのサポート期間を拡張しました。

Kotlin 1.7.0 では、以前の2世代ではなく、過去3世代の言語および API バージョンをサポートします。つまり、Kotlin 1.7.0 は Kotlin 1.4.0 まで遡ったバージョンをターゲットとするライブラリの開発をサポートします。後方互換性の詳細については、[互換性オプション](kotlin-evolution-principles.md#compatibility-options)を参照してください。

### リフレクション経由でのアノテーションへのアクセス {id="access-to-annotations-via-reflection"}

[1.6.0 で初めて導入された](whatsnew16.md#repeatable-annotations-with-runtime-retention-for-1-8-jvm-target) [`KAnnotatedElement.findAnnotations()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect.full/find-annotations.html) 拡張関数が [Stable](components-stability.md) になりました。この[リフレクション](reflection.md)関数は、個別に適用されたアノテーションや反復適用された（repeated）アノテーションを含め、要素に指定された型のすべてのアノテーションを返します。

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

### ディープ再帰関数の安定化 {id="stable-deep-recursive-functions"}

ディープ再帰関数（Deep recursive functions）は [Kotlin 1.4.0](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-rc-debugging-coroutines/#Defining_deep_recursive_functions_using_coroutines) から実験的機能として利用可能でしたが、Kotlin 1.7.0 で [Stable](components-stability.md) になりました。`DeepRecursiveFunction` を使用すると、実際のコールスタックを使用する代わりにヒープ上にスタックを保持する関数を定義できます。これにより、非常に深い再帰計算を実行することが可能になります。ディープ再帰関数を呼び出すには、それを `invoke` します。

この例では、二分木の深さを再帰的に計算するためにディープ再帰関数が使用されています。このサンプル関数は自身を 100,000 回再帰呼び出ししますが、`StackOverflowError` はスローされません。

```kotlin
class Tree(val left: Tree?, val right: Tree?)

val calculateDepth = DeepRecursiveFunction<Tree?, Int> { t ->
    if (t == null) 0 else maxOf(
        callRecursive(t.left),
        callRecursive(t.right)
    ) + 1
}

fun main() {
    // 深さ 100_000 の木を生成
    val deepTree = generateSequence(Tree(null, null)) { prev ->
        Tree(prev, null)
    }.take(100_000).last()

    println(calculateDepth(deepTree)) // 100000
}
```

コード内で再帰の深さが 1000 回を超えるような場合は、ディープ再帰関数の使用を検討してください。

### デフォルトのタイムソース用のインラインクラスに基づくタイムマーク {id="time-marks-based-on-inline-classes-for-default-time-source"}

Kotlin 1.7.0 では、`TimeSource.Monotonic` によって返されるタイムマークをインライン値クラス（inline value class）に変更することにより、時間計測機能のパフォーマンスを向上させました。つまり、`markNow()`、`elapsedNow()`、`measureTime()`、`measureTimedValue()` などの関数を呼び出しても、その `TimeMark` インスタンス用のラッパークラスが割り当てられなくなります。特にホットパス（頻繁に実行される処理）の一部であるコードを計測する場合、計測によるパフォーマンスへの影響を最小限に抑えることができます。

```kotlin
@OptIn(ExperimentalTime::class)
fun main() {
    val mark = TimeSource.Monotonic.markNow() // 返される `TimeMark` はインラインクラス
    val elapsedDuration = mark.elapsedNow()
}
```

> この最適化は、`TimeMark` を取得したタイムソースが静的に `TimeSource.Monotonic` であると判明している場合にのみ有効です。
>
{style="note"}

### Java Optional 用の新しい実験的拡張関数 {id="new-experimental-extension-functions-for-java-optionals"}

Kotlin 1.7.0 には、Java の `Optional` クラスの扱いを簡素化する新しい便利な関数が導入されています。これらの新しい関数は、JVM 上でオプショナルオブジェクトのアンラップや変換を行うために使用でき、Java API との連携をより簡潔に記述するのに役立ちます。

`getOrNull()`、`getOrDefault()`、`getOrElse()` 拡張関数を使用すると、値が存在する場合に `Optional` の値を取得できます。値が存在しない場合は、それぞれ `null`、デフォルト値、または関数によって返された値を取得します。

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

`toList()`、`toSet()`、`asSequence()` 拡張関数は、値が存在する `Optional` の値をリスト、セット、またはシーケンスに変換し、存在しない場合は空のコレクションを返します。`toCollection()` 拡張関数は、`Optional` の値をすでに存在する対象のコレクションに追加します。

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

これらの拡張関数は、Kotlin 1.7.0 では Experimental（実験的）として導入されています。`Optional` の拡張関数の詳細については、[こちらの KEEP](https://github.com/Kotlin/KEEP/pull/291) を参照してください。ご意見やフィードバックは、いつでも [Kotlin 課題トラッカー](https://kotl.in/issue) に歓迎いたします。

### JS および Native における名前付きキャプチャグループのサポート {id="support-for-named-capturing-groups-in-js-and-native"}

Kotlin 1.7.0 以降、名前付きキャプチャグループ（named capturing groups）が JVM だけでなく、JS および Native プラットフォームでもサポートされるようになりました。

キャプチャグループに名前を付けるには、正規表現内で `(?<name>group)` 構文を使用します。グループによって一致したテキストを取得するには、新しく導入された [`MatchGroupCollection.get()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/get.html) 関数を呼び出し、グループ名を渡します。

#### 一致したグループの値を名前で取得する {id="retrieve-matched-group-value-by-name"}

都市の座標を照合する以下の例を考えてみましょう。正規表現によって一致したグループのコレクションを取得するには、[`groups`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-match-result/groups.html) を使用します。グループの内容を番号（インデックス）で取得する場合と、`value` を使用して名前で取得する場合を比較してみてください。

```kotlin
fun main() {
    val regex = "\\b(?<city>[A-Za-z\\s]+),\\s(?<state>[A-Z]{2}):\\s(?<areaCode>[0-9]{3})\\b".toRegex()
    val input = "Coordinates: Austin, TX: 123"
    val match = regex.find(input)!!
    println(match.groups["city"]?.value) // "Austin" — 名前による取得
    println(match.groups[2]?.value) // "TX" — 番号による取得
}
```

#### 名前付き後方参照 {id="named-backreferencing"}

グループを後方参照（backreference）する際にもグループ名を使用できるようになりました。後方参照は、以前にキャプチャグループによって一致したのと同じテキストに一致します。これを行うには、正規表現で `\k<name>` 構文を使用します。

```kotlin
fun backRef() {
    val regex = "(?<title>\\w+), yes \\k<title>".toRegex()
    val match = regex.find("Do you copy? Sir, yes Sir!")!!
    println(match.value) // "Sir, yes Sir"
    println(match.groups["title"]?.value) // "Sir"
}
```

#### 置換式での名前付きグループ {id="named-groups-in-replacement-expressions"}

名前付きグループ参照は、置換式でも使用できます。入力内の指定された正規表現のすべての一致を置換式で置き換える [`replace()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-regex/replace.html) 関数と、最初の一致のみを置き換える [`replaceFirst()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-regex/replace-first.html) 関数の例を考えてみましょう。

置換文字列内の `${name}` は、指定された名前を持つキャプチャグループに対応する部分シーケンスに置き換えられます。名前によるグループ参照の置換とインデックスによる置換を比較できます。

```kotlin
fun dateReplace() {
    val dateRegex = Regex("(?<dd>\\d{2})-(?<mm>\\d{2})-(?<yyyy>\\d{4})")
    val input = "Date of birth: 27-04-2022"
    println(dateRegex.replace(input, "\${yyyy}-\${mm}-\${dd}")) // "Date of birth: 2022-04-27" — 名前による置換
    println(dateRegex.replace(input, "\$3-\$2-\$1")) // "Date of birth: 2022-04-27" — 番号による置換
}
```

## Gradle {id="gradle"}

このリリースでは、新しいビルドレポート、Gradle プラグインバリアントのサポート、kapt の新しい統計情報などが導入されています。

* [インクリメンタルコンパイルへの新しいアプローチ](#a-new-approach-to-incremental-compilation)
* [コンパイラパフォーマンス追跡のための新しいビルドレポート](#build-reports-for-kotlin-compiler-tasks)
* [Gradle および Android Gradle プラグインの最小サポートバージョンの変更](#bumping-minimum-supported-versions)
* [Gradle プラグインバリアントのサポート](#support-for-gradle-plugin-variants)
* [Kotlin Gradle プラグイン API のアップデート](#updates-in-the-kotlin-gradle-plugin-api)
* [plugins API 経由での sam-with-receiver プラグインの提供](#the-sam-with-receiver-plugin-is-available-via-the-plugins-api)
* [コンパイルタスクの変更](#changes-in-compile-tasks)
* [kapt における各アノテーションプロセッサによる生成ファイル数の新しい統計情報](#statistics-of-generated-files-by-each-annotation-processor-in-kapt)
* [システムプロパティ kotlin.compiler.execution.strategy の非推奨化](#deprecation-of-the-kotlin-compiler-execution-strategy-system-property)
* [非推奨のオプション、メソッド、プラグインの削除](#removal-of-deprecated-options-methods-and-plugins)

### インクリメンタルコンパイルへの新しいアプローチ {id="a-new-approach-to-incremental-compilation"}

> インクリメンタルコンパイルへの新しいアプローチは [Experimental（実験的）](components-stability.md) です。いつでも変更または削除される可能性があります。
> オプトインが必要です（詳細は下記参照）。評価目的でのみ使用することをお勧めします。フィードバックは [YouTrack](https://youtrack.jetbrains.com/issues/KT) にお寄せください。
>
{style="warning"}

Kotlin 1.7.0 では、モジュール間の変更に対するインクリメンタルコンパイルが再設計されました。依存する非 Kotlin モジュール内で行われた変更に対してもインクリメンタルコンパイルがサポートされるようになり、[Gradle ビルドキャッシュ](https://docs.gradle.org/current/userguide/build_cache.html)との互換性も確保されました。また、コンパイル回避（compilation avoidance）のサポートも改善されています。

ビルドキャッシュを使用している場合や、非 Kotlin の Gradle モジュールを頻繁に変更する場合に、この新しいアプローチの最大の利点を実感できるはずです。`kotlin-gradle-plugin` モジュールに対する Kotlin プロジェクトのテストでは、キャッシュヒット後の変更に対して 80% 以上の改善が見られました。

この新しいアプローチを試すには、`gradle.properties` に以下のオプションを設定します。

```none
kotlin.incremental.useClasspathSnapshot=true
```

> インクリメンタルコンパイルへの新しいアプローチは、現在 Gradle ビルドシステムの JVM バックエンドでのみ利用可能です。
>
{style="note"}

インクリメンタルコンパイルへの新しいアプローチの内部実装の詳細については、[こちらのブログ記事](https://blog.jetbrains.com/kotlin/2022/07/a-new-approach-to-incremental-compilation-in-kotlin/)を参照してください。

私たちの計画は、この技術を安定化させ、他のバックエンド（JS など）やビルドシステムのサポートを追加することです。このコンパイル方式で発生した問題や予期しない挙動については、[YouTrack](https://youtrack.jetbrains.com/issues/KT) へ報告していただけると幸いです。ご協力ありがとうございます！

Kotlin チームは、サポートを提供してくださった [Ivan Gavrilovic](https://github.com/gavra0) 氏、[Hung Nguyen](https://github.com/hungvietnguyen) 氏、[Cédric Champeau](https://github.com/melix) 氏、およびその他の外部コントリビューターに深く感謝いたします。

### コンパイラパフォーマンス追跡のための新しいビルドレポート {id="build-reports-for-kotlin-compiler-tasks"}

> Kotlin ビルドレポートは [Experimental（実験的）](components-stability.md) です。いつでも変更または削除される可能性があります。
> オプトインが必要です（詳細は下記参照）。評価目的でのみ使用してください。[YouTrack](https://youtrack.jetbrains.com/issues/KT) へのフィードバックをお待ちしています。
>
{style="warning"}

Kotlin 1.7.0 では、コンパイラのパフォーマンスを追跡するのに役立つビルドレポートが導入されました。レポートには、さまざまなコンパイルフェーズの所要時間や、コンパイルがインクリメンタルに行えなかった理由が含まれています。

ビルドレポートは、コンパイラタスクに関する問題を調査したい場合に便利です。例えば、以下のようなケースです。

* Gradle のビルドに時間がかかりすぎており、パフォーマンス低下の根本原因を理解したい場合。
* 同じプロジェクトのコンパイル時間がまちまちで、数秒で終わることもあれば数分かかることもある場合。

ビルドレポートを有効にするには、ビルドレポートの出力先を `gradle.properties` で宣言します。

```none
kotlin.build.report.output=file
```

以下の値（およびそれらの組み合わせ）が使用可能です。

* `file`: ビルドレポートをローカルファイルに保存します。
* `build_scan`: [ビルドスキャン](https://scans.gradle.com/)の `custom values` セクションにビルドレポートを保存します。

  > Gradle Enterprise プラグインはカスタム値の数とその長さを制限しています。大規模なプロジェクトでは、一部の値が失われる可能性があります。
  >
  {style="note"}

* `http`: HTTP(S) を使用してビルドレポートを POST 送信します。POST メソッドは JSON 形式でメトリクスを送信します。データはバージョンによって変更される可能性があります。送信されるデータの現在のバージョンは [Kotlin リポジトリ](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-plugin/src/common/kotlin/org/jetbrains/kotlin/gradle/report/data/GradleCompileStatisticsData.kt) で確認できます。

長時間かかるコンパイルのビルドレポートを分析することで解決できる、一般的な2つのケースがあります。

* ビルドがインクリメンタルでなかった場合: 理由を分析し、根本的な問題を修正します。
* ビルドはインクリメンタルだったが、時間がかかりすぎた場合: ソースファイルの再編成を試みます（大きなファイルを分割する、別々のクラスを異なるファイルに保存する、大きなクラスをリファクタリングする、トップレベル関数を異なるファイルに宣言するなど）。

新しいビルドレポートの詳細については、[こちらのブログ記事](https://blog.jetbrains.com/kotlin/2022/06/introducing-kotlin-build-reports/)を参照してください。

インフラ環境でビルドレポートをぜひお試しください。フィードバックや問題の報告、改善の提案がある場合は、[課題トラッカー](https://youtrack.jetbrains.com/newIssue) へお気軽にご報告ください。

### 最小サポートバージョンの引き上げ {id="bumping-minimum-supported-versions"}

Kotlin 1.7.0 より、サポートされる Gradle の最小バージョンは 6.7.1 になりました。[Gradle プラグインバリアント](#support-for-gradle-plugin-variants)と新しい Gradle API をサポートするために、[バージョンを引き上げる必要がありました](https://youtrack.jetbrains.com/issue/KT-49733/Bump-minimal-supported-Gradle-version-to-6-7-1)。今後は Gradle プラグインバリアント機能のおかげで、最小サポートバージョンを頻繁に引き上げる必要はなくなる見込みです。

また、Android Gradle プラグインの最小サポートバージョンは 3.6.4 になりました。

### Gradle プラグインバリアントのサポート {id="support-for-gradle-plugin-variants"}

Gradle 7.0 では、Gradle プラグイン作成者向けの新機能である[バリアント付きプラグイン（plugins with variants）](https://docs.gradle.org/7.0/userguide/implementing_gradle_plugins.html#plugin-with-variants)が導入されました。この機能により、7.1 未満の Gradle バージョンとの互換性を維持しながら、新しい Gradle 機能のサポートを簡単に追加できるようになります。[Gradle におけるバリアント選択](https://docs.gradle.org/current/userguide/variant_model.html)の詳細をご確認ください。

Gradle プラグインバリアントを使用することで、異なる Gradle バージョン向けに異なる Kotlin Gradle プラグインのバリアントを提供できます。その目標は、サポートされる最も古いバージョンの Gradle に対応する `main` バリアントでベースとなる Kotlin コンパイルをサポートすることです。各バリアントには、対応するリリースの Gradle 機能の実装が含まれます。最新のバリアントは最も幅広い Gradle 機能セットをサポートします。このアプローチにより、機能は制限されるものの、古い Gradle バージョンのサポート期間を延ばすことができます。

現在、Kotlin Gradle プラグインには次の2つのバリアントのみが存在します。

* Gradle バージョン 6.7.1〜6.9.3 向けの `main`
* Gradle バージョン 7.0 以上向けの `gradle70`

今後の Kotlin リリースでは、さらに追加される可能性があります。

ビルドがどのバリアントを使用しているかを確認するには、[`--info` ログレベル](https://docs.gradle.org/current/userguide/logging.html#sec:choosing_a_log_level)を有効にして、出力内の `Using Kotlin Gradle plugin` で始まる文字列（例: `Using Kotlin Gradle plugin main variant`）を探してください。

> Gradle におけるバリアント選択に関する既知の問題の回避策は以下のとおりです。
> * [pluginManagement 内の ResolutionStrategy がマルチバリアントを持つプラグインに対して機能しない](https://github.com/gradle/gradle/issues/20545)
> * [プラグインが `buildSrc` の共通依存関係として追加された場合にプラグインバリアントが無視される](https://github.com/gradle/gradle/issues/20847)
>
{style="note"}

フィードバックは[こちらの YouTrack チケット](https://youtrack.jetbrains.com/issue/KT-49227/Support-Gradle-plugins-variants)にお寄せください。

### Kotlin Gradle プラグイン API のアップデート {id="updates-in-the-kotlin-gradle-plugin-api"}

Kotlin Gradle プラグイン API アーティファクトにいくつかの改善が行われました。

* Kotlin/JVM および Kotlin/kapt タスク向けに、ユーザーが設定可能な新しい input 用インターフェースが用意されました。
* すべての Kotlin プラグインが継承する新しい `KotlinBasePlugin` インターフェースが追加されました。Kotlin Gradle プラグイン（JVM、JS、Multiplatform、Native、その他のプラットフォーム）のいずれかが適用されたときに何らかの設定アクションをトリガーしたい場合は、このインターフェースを使用します。

  ```kotlin
  project.plugins.withType<org.jetbrains.kotlin.gradle.plugin.KotlinBasePlugin>() {
      // ここでアクションを設定
  }
  ```
  `KotlinBasePlugin` に関するフィードバックは、[こちらの YouTrack チケット](https://youtrack.jetbrains.com/issue/KT-48008/Consider-offering-a-KotlinBasePlugin)にお寄せください。

* Android Gradle プラグインが自身の中で Kotlin のコンパイルを設定できるようにするための基礎を築きました。これにより、ビルドに Kotlin Android Gradle プラグインを追加する必要がなくなります。
  追加されたサポートの詳細を知り、試してみたい場合は、[Android Gradle プラグインのリリースアナウンス](https://developer.android.com/studio/releases/gradle-plugin)をフォローしてください！

### plugins API 経由での sam-with-receiver プラグインの提供 {id="the-sam-with-receiver-plugin-is-available-via-the-plugins-api"}

[sam-with-receiver コンパイラプラグイン](sam-with-receiver-plugin.md)が、[Gradle plugins DSL](https://docs.gradle.org/current/userguide/plugins.html#sec:plugins_block) 経由で利用できるようになりました。

```kotlin
plugins {
    id("org.jetbrains.kotlin.plugin.sam.with.receiver") version "$kotlin_version"
}
```

### コンパイルタスクの変更 {id="changes-in-compile-tasks"}

このリリースでは、コンパイルタスクに多くの変更が加えられました。

* Kotlin コンパイルタスクは、Gradle の `AbstractCompile` タスクを継承しなくなりました。`DefaultTask` のみを継承します。
* `AbstractCompile` タスクには `sourceCompatibility` および `targetCompatibility` という input がありました。`AbstractCompile` タスクを継承しなくなったため、これらの input は Kotlin ユーザーのスクリプトで利用できなくなりました。
* `SourceTask.stableSources` input は利用できなくなりました。代わりに `sources` input を使用してください。`setSource(...)` メソッドは引き続き利用可能です。
* すべてのコンパイルタスクで、コンパイルに必要なライブラリのリストとして `libraries` input が使用されるようになりました。`KotlinCompile` タスクには非推奨の Kotlin プロパティ `classpath` がまだ残っていますが、今後のリリースで削除される予定です。
* コンパイルタスクは引き続き `PatternFilterable` インターフェースを実装しており、Kotlin ソースのフィルタリングが可能です。`sourceFilesExtensions` input は削除され、`PatternFilterable` のメソッドを使用する形に置き換えられました。
* 非推奨の `Gradle destinationDir: File` output は、`destinationDirectory: DirectoryProperty` output に置き換えられました。
* Kotlin/Native の `AbstractNativeCompile` タスクが `AbstractKotlinCompileTool` 基底クラスを継承するようになりました。これは、Kotlin/Native ビルドツールを他のすべてのツールに統合するための第一歩です。

フィードバックは[こちらの YouTrack チケット](https://youtrack.jetbrains.com/issue/KT-32805)にお寄せください。

### kapt における各アノテーションプロセッサによる生成ファイル数の新しい統計情報 {id="statistics-of-generated-files-by-each-annotation-processor-in-kapt"}

`kotlin-kapt` Gradle プラグインは、すでに[各プロセッサのパフォーマンス統計をレポート](https://github.com/JetBrains/kotlin/pull/4280)しています。Kotlin 1.7.0 以降、アノテーションプロセッサごとに生成されたファイル数の統計もレポートできるようになりました。

これは、ビルドの一部として未使用のアノテーションプロセッサが存在するかどうかを追跡するのに役立ちます。生成されたレポートを使用して不要なアノテーションプロセッサをトリガーしているモジュールを見つけ、それを防止するようにモジュールを更新できます。

統計を有効にするには、以下の2つのステップを実行します。

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

> [コマンドラインオプション `verbose`](kapt.md#cli) を使用して詳細な出力を有効にすることもできます。
>
{style="note"}

統計情報はログに `info` レベルで表示されます。`Annotation processor stats:` という行に続いて、各アノテーションプロセッサの実行時間に関する統計が表示されます。これらの行の後に `Generated files report:` という行が表示され、続いて各アノテーションプロセッサによって生成されたファイル数に関する統計が表示されます。例:

```text
[INFO] Annotation processor stats:
[INFO] org.mapstruct.ap.MappingProcessor: total: 290 ms, init: 1 ms, 3 round(s): 289 ms, 0 ms, 0 ms
[INFO] Generated files report:
[INFO] org.mapstruct.ap.MappingProcessor: total sources: 2, sources per round: 2, 0, 0
```

フィードバックは[こちらの YouTrack チケット](https://youtrack.jetbrains.com/issue/KT-51132/KAPT-Support-reporting-the-number-of-generated-files-by-each-ann)にお寄せください。

### システムプロパティ kotlin.compiler.execution.strategy の非推奨化 {id="deprecation-of-the-kotlin-compiler-execution-strategy-system-property"}

Kotlin 1.6.20 では、[Kotlin コンパイラの実行戦略を定義するための新しいプロパティ](whatsnew1620.md#properties-for-defining-kotlin-compiler-execution-strategy)が導入されました。Kotlin 1.7.0 では、新しいプロパティへの移行に伴い、古いシステムプロパティ `kotlin.compiler.execution.strategy` の非推奨化サイクルが開始されました。

`kotlin.compiler.execution.strategy` システムプロパティを使用すると、警告が表示されます。このプロパティは将来のリリースで削除される予定です。以前の動作を維持するには、このシステムプロパティを同名の Gradle プロパティに置き換えてください。これは例えば `gradle.properties` で行うことができます。

```none
kotlin.compiler.execution.strategy=out-of-process
```

コンパイルタスクプロパティ `compilerExecutionStrategy` を使用することもできます。詳細については、[コンパイラ実行戦略のページ](compiler-execution-strategy.md)を参照してください。

### 非推奨のオプション、メソッド、プラグインの削除 {id="removal-of-deprecated-options-methods-and-plugins"}

#### useExperimentalAnnotation メソッドの削除 {id="removal-of-the-useexperimentalannotation-method"}

Kotlin 1.7.0 では、`useExperimentalAnnotation` Gradle メソッドの非推奨化サイクルが完了しました。モジュール内で API の使用をオプトインするには、代わりに `optIn()` を使用してください。

例えば、Gradle モジュールがマルチプラットフォームの場合:

```kotlin
sourceSets {
    all {
        languageSettings.optIn("org.mylibrary.OptInAnnotation")
    }
}
```

Kotlin の[オプトイン要求](opt-in-requirements.md)の詳細をご確認ください。

#### 非推奨のコンパイラオプションの削除 {id="removal-of-deprecated-compiler-options"}

いくつかのコンパイラオプションの非推奨化サイクルが完了しました。

* `kotlinOptions.jdkHome` コンパイラオプションは 1.5.30 で非推奨となり、本リリースで削除されました。このオプションが含まれている場合、Gradle ビルドは失敗するようになります。Kotlin 1.5.30 からサポートされている [Java ツールチェーン](whatsnew1530.md#support-for-java-toolchains) の使用をお勧めします。
* 非推奨だった `noStdlib` コンパイラオプションも削除されました。Gradle プラグインは `kotlin.stdlib.default.dependency=true` プロパティを使用して、Kotlin 標準ライブラリが存在するかどうかを制御します。

> コンパイラ引数の `-jdkHome` および `-no-stdlib` は引き続き利用可能です。
>
{style="note"}

#### 非推奨のプラグインの削除 {id="removal-of-deprecated-plugins"}

Kotlin 1.4.0 で非推奨となった `kotlin2js` および `kotlin-dce-plugin` プラグインが、本リリースで削除されました。`kotlin2js` の代わりに、新しい `org.jetbrains.kotlin.js` プラグインを使用してください。デッドコード削除（DCE）は、Kotlin/JS Gradle プラグインが適切に設定されている場合に動作します。

Kotlin 1.6.0 では、`KotlinGradleSubplugin` クラスの非推奨レベルを `ERROR` に変更しました。開発者はコンパイラプラグインを作成するためにこのクラスを使用していました。本リリースでは、[このクラスが削除されました](https://youtrack.jetbrains.com/issue/KT-48831/)。代わりに `KotlinCompilerPluginSupportPlugin` クラスを使用してください。

> プロジェクト全体でバージョン 1.7.0 以上の Kotlin プラグインを使用することがベストプラクティスです。
>
{style="tip"}

#### 非推奨のコルーチン DSL オプションおよびプロパティの削除 {id="removal-of-the-deprecated-coroutines-dsl-option-and-property"}

非推奨だった `kotlin.experimental.coroutines` Gradle DSL オプションと、`gradle.properties` で使用されていた `kotlin.coroutines` プロパティを削除しました。今後は、単に_[サスペンド関数](coroutines-basics.md)_を使用するか、ビルドスクリプトに [`kotlinx.coroutines` の依存関係を追加](gradle-configure-project.md#set-a-dependency-on-a-kotlinx-library)してください。

コルーチンの詳細については、[コルーチンガイド](coroutines-guide.md)を参照してください。

#### ツールチェーン拡張メソッドにおける型キャストの削除 {id="removal-of-the-type-cast-in-the-toolchain-extension-method"}

Kotlin 1.7.0 より前は、Kotlin DSL を使用して Gradle ツールチェーンを設定する際に、`JavaToolchainSpec` クラスへの型キャストを行う必要がありました。

```kotlin
kotlin {
    jvmToolchain {
        (this as JavaToolchainSpec).languageVersion.set(JavaLanguageVersion.of(<MAJOR_JDK_VERSION>)
    }
}
```

今後は、`(this as JavaToolchainSpec)` の部分を省略できます。

```kotlin
kotlin {
    jvmToolchain {
        languageVersion.set(JavaLanguageVersion.of(<MAJOR_JDK_VERSION>)
    }
}
```

## Kotlin 1.7.0 への移行 {id="migrating-to-kotlin-1-7-0"}

### Kotlin 1.7.0 のインストール {id="install-kotlin-1-7-0"}

IntelliJ IDEA 2022.1 および Android Studio Chipmunk (212) は、Kotlin プラグインを 1.7.0 にアップデートするよう自動的に提案します。

> IntelliJ IDEA 2022.2、および Android Studio Dolphin (213) または Android Studio Electric Eel (221) については、Kotlin プラグイン 1.7.0 は今後の IntelliJ IDEA および Android Studio のアップデートとともに提供されます。
> 
{style="note"}

新しいコマンドラインコンパイラは、[GitHub のリリースページ](https://github.com/JetBrains/kotlin/releases/tag/v1.7.0)からダウンロードできます。

### 既存プロジェクトの移行または Kotlin 1.7.0 での新規プロジェクトの開始 {id="migrate-existing-or-start-a-new-project-with-kotlin-1-7-0"}

* 既存のプロジェクトを Kotlin 1.7.0 に移行するには、Kotlin のバージョンを `1.7.0` に変更し、Gradle または Maven プロジェクトを再インポートします。[Kotlin 1.7.0 へのアップデート方法](releases.md#update-to-a-new-kotlin-version)をご確認ください。

* Kotlin 1.7.0 で新しいプロジェクトを開始するには、Kotlin プラグインをアップデートし、**File** | **New** | **Project** からプロジェクトウィザードを実行します。

### Kotlin 1.7.0 互換性ガイド {id="compatibility-guide-for-kotlin-1-7-0"}

Kotlin 1.7.0 は機能リリース（フィーチャーリリース）であるため、言語の以前のバージョン向けに記述されたコードと互換性のない変更が含まれている可能性があります。
そのような変更の詳細なリストについては、[Kotlin 1.7.0 互換性ガイド](compatibility-guide-17.md)を参照してください。