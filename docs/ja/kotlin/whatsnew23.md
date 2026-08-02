[//]: # (title: Kotlin 2.3.0 の新機能)

<web-summary>Kotlin 2.3.0 のリリースノート。新しい言語機能、Kotlin Multiplatform、JVM、Native、JS、Wasm のアップデート、Gradle および Maven のビルドツールサポートについて説明します。</web-summary>

_[リリース日: 2025年12月16日](releases.md#release-history)_

<tldr>
    <p>バグ修正リリース 2.3.10 の詳細については、<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.10">変更ログ（changelog）</a>を参照してください。</p>
</tldr>

Kotlin 2.3.0 がリリースされました！主なハイライトは以下の通りです。

* **言語**: [より多くの機能が安定化しデフォルトに。未使用戻り値チェッカー、明示的なバッキングフィールド、コンテキストに依存した名前解決の変更](#language)。
* **Kotlin/JVM**: [Java 25 のサポート](#kotlin-jvm-support-for-java-25)。
* **Kotlin/Native**: [Swift エクスポートによる相互運用性の向上、リリース用タスクのビルド時間短縮、C および Objective-C ライブラリのインポートが Beta に](#kotlin-native)。
* **Kotlin/Wasm**: [完全修飾名と新しい例外処理プロポーザルをデフォルトで有効化。Latin-1 文字用の新しいコンパクトストレージを導入](#kotlin-wasm)。
* **Kotlin/JS**: [新しい実験的な suspend 関数のエクスポート、`LongArray` の表現、コンパニオンオブジェクトへの統一されたアクセスなど](#kotlin-js)。
* **Gradle**: [Gradle 9.0 との互換性、生成されたソースを登録するための新しい API](#gradle)。
* **Compose コンパイラ**: [難読化された Android アプリケーションのスタックトレース](#compose-compiler-stack-traces-for-minified-android-applications)。
* **標準ライブラリ**: [時間計測機能（Time tracking）が Stable に。UUID の生成と解析を改善](#standard-library)。

アップデートの概要については、こちらの動画でもご確認いただけます：

<video src="https://www.youtube.com/v/_6PSSkqwbp8" title="Hands-on with Kotlin 2.3"/>

> Kotlin のリリースサイクルに関する情報は、[Kotlin のリリースプロセス](releases.md)を参照してください。
> 
{style="tip"}

## IDE サポート

Kotlin 2.3.0 をサポートする Kotlin プラグインは、IntelliJ IDEA および Android Studio の最新バージョンに同梱されています。
IDE の Kotlin プラグインを個別に更新する必要はありません。
ビルドスクリプト内の [Kotlin バージョンを 2.3.0 に変更](releases.md#update-to-a-new-kotlin-version) するだけで利用可能です。

詳細は [新リリースへのアップデート](releases.md#update-to-a-new-kotlin-version) を参照してください。

## 言語 (Language)

Kotlin 2.3.0 では機能の安定化に重点を置き、未使用の戻り値を検出する新しいメカニズムの導入や、コンテキストに依存した名前解決の改善が行われました。

### 安定化した機能 (Stable features)

以前の Kotlin リリースで実験的（Experimental）またはベータ（Beta）として導入されたいくつかの言語機能が、Kotlin 2.3.0 で [Stable (安定)](components-stability.md#stability-levels-explained) になりました。

* [ネストされた型エイリアスのサポート](whatsnew22.md#support-for-nested-type-aliases)
* [`when` 式におけるデータフローに基づいた網羅性チェック](whatsnew2220.md#data-flow-based-exhaustiveness-checks-for-when-expressions)

### デフォルトで有効になった機能 (Features enabled by default)

Kotlin 2.3.0 では、[明示的な戻り値の型を持つ式本体での `return` 文のサポート](whatsnew2220.md#support-for-return-statements-in-expression-bodies-with-explicit-return-types) がデフォルトで有効になりました。

[Kotlin の言語機能とプロポーザルの一覧を見る](kotlin-language-features-and-proposals.md)。

### 未使用戻り値チェッカー (Unused return value checker)
<primary-label ref="experimental-general"/>

Kotlin 2.3.0 では、結果が無視されるのを防ぐために、未使用戻り値チェッカー（unused return value checker）が導入されました。
式が `Unit` または `Nothing` 以外の値を返し、それが関数に渡されたり、条件でチェックされたり、その他の用途で使用されていない場合に警告が表示されます。

このチェッカーは、関数呼び出しが意味のある結果を生成しているにもかかわらず、それが黙って破棄されているバグをキャッチするのに役立ちます。これにより、予期しない動作や追跡が困難な問題を防ぐことができます。

> このチェッカーは、`++` や `--` などのインクリメント/デクリメント操作から返される値は無視します。
>
{style="note"}

以下の例を考えてみましょう。

```kotlin
fun formatGreeting(name: String): String {
    if (name.isBlank()) return "Hello, anonymous user!"
    if (!name.contains(' ')) {
        // チェッカーはこの結果が無視されているという警告を報告します
        "Hello, " + name.replaceFirstChar(Char::titlecase) + "!"
    }
    val (first, last) = name.split(' ')
    return "Hello, $first! Or should I call you Dr. $last?"
}
```

この例では、文字列が作成されていますが一度も使用されていないため、チェッカーは無視された結果として報告します。

この機能は [実験的 (Experimental)](components-stability.md#stability-levels-explained) です。オプトインするには、ビルドファイルに以下のコンパイラオプションを追加してください。

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xreturn-value-checker=check")
    }
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xreturn-value-checker=check</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

このオプションを使用すると、チェッカーは Kotlin 標準ライブラリのほとんどの関数のよう、明示的にマークされた式からの無視された結果のみを報告します。

独自の関数をマークするには、`@MustUseReturnValues` アノテーションを使用して、チェッカーに無視された戻り値を報告させたいスコープを指定します。

たとえば、ファイル全体をマークできます。

```kotlin
// このファイル内のすべての関数とクラスをマークし、チェッカーが未使用の戻り値を報告するようにします
@file:MustUseReturnValues

package my.project

fun someFunction(): String
```

あるいは、特定のクラスをマークすることもできます。

```kotlin
// このクラス内のすべての関数をマークし、チェッカーが未使用の戻り値を報告するようにします
@MustUseReturnValues
class Greeter {
    fun greet(name: String): String = "Hello, $name"
}

fun someFunction(): Int = ...
```
{validate="false"}

また、ビルドファイルに以下のコンパイラオプションを追加することで、プロジェクト全体をマークすることもできます。

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xreturn-value-checker=full")
    }
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xreturn-value-checker=full</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

この設定では、Kotlin はコンパイルされたファイルがあたかも `@MustUseReturnValues` でアノテーションされているかのように自動的に扱い、チェッカーはプロジェクト内の全関数の戻り値を報告します。

特定の関数の警告を抑制するには、その関数を `@IgnorableReturnValue` アノテーションでマークします。
`MutableList.add` のように、戻り値を無視することが一般的で期待されている関数にアノテーションを付けます。

```kotlin
@IgnorableReturnValue
fun <T> MutableList<T>.addAndIgnoreResult(element: T): Boolean {
    return add(element)
}
```

関数自体を無視可能としてマークすることなく、警告を抑制することもできます。
その場合は、結果をアンダースコア（`_`）を使用した特別な無名変数に代入します。

```kotlin
// 無視可能ではない関数
fun computeValue(): Int = 42

fun main() {
    // 警告が報告される：結果が無視されている
    computeValue()

    // 特別な未使用変数を使用することで、この呼び出し箇所のみ警告を抑制する
    val _ = computeValue()
}
```

詳細については、この機能の [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0412-unused-return-value-checker.md) を参照してください。

[YouTrack](https://youtrack.jetbrains.com/issue/KT-12719) でのフィードバックをお待ちしております。

### 明示的なバッキングフィールド (Explicit backing fields)
<primary-label ref="experimental-opt-in"/>

Kotlin 2.3.0 では、明示的なバッキングフィールド（explicit backing fields）が導入されました。これは、既存の暗黙的なバッキングフィールドとは対照的に、プロパティの値を保持する基盤となるフィールドを明示的に宣言するための新しい構文です。

この機能の概要については、こちらの動画でもご確認いただけます：

<video src="https://www.youtube.com/v/PU-VdH8HhVA" title="Explicit Backing Fields are experimental in Kotlin 2.3"/>

新しい明示的な構文は、プロパティの内部型が公開 API の型と異なる場合に、一般的な「バッキングプロパティ（backing properties）」パターンを簡素化します。たとえば、内部的には `ArrayList` を使用しつつ、外部には読み取り専用の `List` や `MutableList` として公開したい場合があります。以前は、これには追加のプライベートプロパティが必要でした。

明示的なバッキングフィールドを使用すると、`field` の実装型がプロパティのスコープ内で直接定義されます。これにより、別途プライベートプロパティを用意する必要がなくなり、同じプライベートスコープ内でバッキングフィールドの型へのスマートキャストをコンパイラが自動的に行えるようになります。

以前（Before）：

```kotlin
private val _city = MutableStateFlow<String>("")
val city: StateFlow<String> get() = _city

fun updateCity(newCity: String) {
    _city.value = newCity
}
```

以後（After）：

```kotlin
val city: StateFlow<String>
    field = MutableStateFlow("")

fun updateCity(newCity: String) {
    // スマートキャストが自動的に機能する
    city.value = newCity
}
```

この機能は [実験的 (Experimental)](components-stability.md#stability-levels-explained) です。オプトインするには、ビルドファイルに以下のコンパイラオプションを追加してください。

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xexplicit-backing-fields")
    }
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xexplicit-backing-fields</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

詳細については、この機能の [KEEP](https://github.com/Kotlin/KEEP/blob/explicit-backing-fields/proposals/explicit-backing-fields.md) を参照してください。

[YouTrack](https://youtrack.jetbrains.com/issue/KT-14663) でのフィードバックをお待ちしております。

### コンテキストに依存した名前解決の変更 (Changes to context-sensitive resolution)
<primary-label ref="experimental-general"/>

コンテキストに依存した名前解決（context-sensitive resolution）は依然として [実験的 (Experimental)](components-stability.md#stability-levels-explained) ですが、ユーザーのフィードバックに基づいて継続的に改善されています。

* 現在の型の sealed および外包する（enclosing）スーパータイプが、検索のコンテキストスコープの一部として考慮されるようになりました。それ以外のスーパータイプのスコープは考慮されません。動機と例については、YouTrack イシュー [KT-77823](https://youtrack.jetbrains.com/issue/KT-77823) を参照してください。
* 型演算子や等価性が関与する場合、コンテキストに依存した名前解決を使用することで解決が曖昧になる場合に、コンパイラが警告を報告するようになりました。これは、たとえばクラスの衝突する宣言がインポートされている場合などに発生する可能性があります。動機と例については、YouTrack イシュー [KT-77821](https://youtrack.jetbrains.com/issue/KT-77821) を参照してください。

現在のプロポーザルの全文については、[KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0379-context-sensitive-resolution.md) を参照してください。

## Kotlin/JVM: Java 25 のサポート

Kotlin 2.3.0 以降、コンパイラは Java 25 バイトコードを含むクラスを生成できるようになりました。

## Kotlin/Native

Kotlin 2.3.0 では、Swift エクスポートのサポートと C および Objective-C ライブラリのインポートの改善に加え、リリース用タスクのビルド時間短縮が行われました。

### Swift エクスポートによる相互運用性の向上 (Improved interop through Swift export)
<primary-label ref="experimental-general"/>

Kotlin 2.3.0 では Swift エクスポートを通じた Swift との相互運用性がさらに向上し、ネイティブ enum クラスと可変長引数（variadic）関数パラメータのサポートが追加されました。

以前は、Kotlin の enum は通常の Swift クラスとしてエクスポートされていました。今回、マッピングが直接行われるようになり、通常のネイティブ Swift enum を使用できるようになりました。例：

```kotlin
// Kotlin
enum class Color(val rgb: Int) {
    RED(0xFF0000),
    GREEN(0x00FF00),
    BLUE(0x0000FF)
}

val color = Color.RED
```

```Swift
// Swift
public enum Color: Swift.CaseIterable, Swift.LosslessStringConvertible, Swift.RawRepresentable {
    case RED, GREEN, BLUE

    var rgb: Int { get }
}
```

さらに、Kotlin の [`vararg`](functions.md#variable-number-of-arguments-varargs) 関数が Swift の可変長引数パラメータに直接マッピングされるようになりました。

これにより、引数の数を渡すことができます。引数の数が事前にはわからない場合や、型を指定せずにコレクションを作成・渡したい場合に便利です。例：

```kotlin
// Kotlin
fun log(vararg messages: String)
```

```Swift
// Swift
public func log(messages: Swift.String...)
```

> 可変長引数パラメータにおけるジェネリック型はまだサポートされていません。
>
{style="note"}

### C および Objective-C ライブラリのインポートが Beta に (C and Objective-C library import is in Beta)
<primary-label ref="beta"/>

[C ライブラリ](native-c-interop.md) および [Objective-C ライブラリ](native-objc-interop.md) を Kotlin/Native プロジェクトへインポートする機能が [Beta](components-stability.md#stability-levels-explained) になりました。

Kotlin の異なるバージョン、依存関係、および Xcode との完全な互換性はまだ保証されていませんが、バイナリ互換性の問題が発生した際にコンパイラがより適切な診断情報を出力するようになりました。

このインポートはまだ安定していません。C および Objective-C の相互運用性に関連する特定の事項（以下を含む）については、プロジェクトで引き続き `@ExperimentalForeignApi` オプトインアノテーションが必要です。

* ネイティブライブラリやメモリを扱う際に必要な `kotlinx.cinterop.*` パッケージ内の一部の API。
* [プラットフォームライブラリ](native-platform-libs.md) を除く、ネイティブライブラリ内のすべての宣言。

互換性を維持し、ソースコードの変更を強いないために、新しい安定化ステータスはアノテーション名には反映されていません。

詳細については、[C および Objective-C ライブラリインポートの安定性](native-lib-import-stability.md) を参照してください。

### Objective-C ヘッダーにおけるブロック型の明示的な名前のデフォルト化

[Kotlin 2.2.20 で導入された](whatsnew2220.md#explicit-names-in-block-types-for-objective-c-headers) Kotlin 関数型の明示的なパラメータ名が、Kotlin/Native プロジェクトからエクスポートされる Objective-C ヘッダーでデフォルトになりました。これらのパラメータ名により、Xcode でのオートコンプリートの提案が改善され、Clang の警告を回避するのに役立ちます。

以下の Kotlin コードを考えてみましょう。

```kotlin
// Kotlin:
fun greetUser(block: (name: String) -> Unit) = block("John")
```

Kotlin は Kotlin の関数型から Objective-C のブロック型へパラメータ名を転送し、Xcode が提案でそれらを使用できるようにします。

```ObjC
// Objective-C:
greetUserBlock:^(NSString *name) {
    // ...
};
```

問題が発生した場合は、明示的なパラメータ名を無効にできます。そのためには、`gradle.properties` ファイルに以下の [バイナリオプション](native-binary-options.md) を追加してください。

```none
kotlin.native.binary.objcExportBlockExplicitParameterNames=false
```

問題がある場合は [YouTrack](https://kotl.in/issue) に報告してください。

### リリース用タスクのビルド時間短縮

Kotlin/Native 2.3.0 ではいくつかのパフォーマンス改善が行われました。その結果、`linkRelease*`（例：`linkReleaseFrameworkIosArm64`）などのリリース用タスク의 ビルド時間が短縮されました。

ベンチマークによると、プロジェクトの規模にもよりますが、リリースビルドは最大 40% 高速化されています。これらの改善は、iOS をターゲットとした Kotlin Multiplatform プロジェクトで最も顕著です。

プロジェクトのコンパイル時間を改善するためのその他のヒントについては、[ドキュメント](native-improving-compilation-time.md) を参照してください。

### Apple ターゲットサポートの変更

Kotlin 2.3.0 では、Apple ターゲットの最小サポートバージョンが引き上げられました。

* iOS および tvOS: 12.0 から 14.0 へ
* watchOS: 5.0 から 7.0 へ

公開データによると、古いバージョンの利用はすでに非常に限られています。この変更により、Apple ターゲット全体のメンテナンスが簡素化され、Kotlin/Native での [Mac Catalyst](https://developer.apple.com/documentation/uikit/mac-catalyst) サポートの道が開かれます。

プロジェクトで古いバージョンを維持する必要がある場合は、ビルドファイルに以下の行を追加してください。

```kotlin
kotlin {
    targets.withType<org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget>().configureEach {
        binaries.configureEach {
            freeCompilerArgs += "-Xoverride-konan-properties=minVersion.ios=12.0"
            freeCompilerArgs += "-Xoverride-konan-properties=minVersion.tvos=12.0"
        }
    }
}
```

このようなセットアップは、コンパイラの成功が保証されるわけではなく、ビルド中または実行時にアプリが壊れる可能性があることに注意してください。

今回のリリースでは、[Intel チップベース Apple ターゲットの非推奨サイクル](whatsnew2220.md#deprecation-of-x86-64-apple-targets) も次のステップに進みます。

Kotlin 2.3.0 以降、`macosX64`、`iosX64`、`tvosX64`、`watchosX64` ターゲットはサポートティア 3 に降格されました。これは、CI でのテストが保証されず、異なるコンパイラリリース間でのソースおよびバイナリの互換性が提供されない可能性があることを意味します。Kotlin 2.4.0 では `x86_64` Apple ターゲットのサポートを完全に削除する予定です。

詳細については、[Kotlin/Native のターゲットサポート](native-target-support.md) を参照してください。

## Kotlin/Wasm

Kotlin 2.3.0 では、Kotlin/Wasm ターゲットでの完全修飾名のデフォルト有効化、`wasmWasi` ターゲットでの新しい例外処理プロポーザルのデフォルト有効化、および Latin-1 文字用のコンパクトストレージの導入が行われました。

### 完全修飾名のデフォルト有効化 (Fully qualified names enabled by default)

Kotlin/Wasm ターゲットでは、実行時の完全修飾名（FQNs）はデフォルトで有効ではありませんでした。`KClass.qualifiedName` プロパティを使用するには、手動でサポートを有効にする必要がありました。

クラス名（パッケージなし）のみにアクセス可能だったため、JVM から Wasm ターゲットに移植されたコードや、実行時に完全修飾名を期待するライブラリで問題が発生していました。

Kotlin 2.3.0 では、`KClass.qualifiedName` プロパティが Kotlin/Wasm ターゲットでデフォルトで有効になりました。つまり、追加の設定なしで実行時に FQN が利用可能です。

FQN をデフォルトで有効にすることで、コードのポータビリティが向上し、完全修飾名が表示されることで実行時エラーがより情報豊かになります。

この変更は、コンパイラの最適化により Latin-1 文字列リテラルにコンパクトストレージを使用し、メタデータを削減しているため、コンパイル後の Wasm バイナリサイズを増加させることはありません。

### Latin-1 文字用のコンパクトストレージ (Compact storage for Latin-1 characters)

以前の Kotlin/Wasm では、文字列リテラルデータをそのまま保存していたため、すべての文字が UTF-16 でエンコードされていました。これは、Latin-1 文字のみ、または主に Latin-1 文字を含むテキストにとって最適ではありませんでした。

Kotlin 2.3.0 以降、Kotlin/Wasm コンパイラは Latin-1 文字のみを含む文字列リテラルを UTF-8 形式で保存します。

この最適化により、JetBrains の [KotlinConf アプリケーション](https://github.com/JetBrains/kotlinconf-app) での実験が示すように、メタデータが大幅に削減されます。その結果：

* 最適化なしのビルドと比較して、Wasm バイナリが最大 13% 縮小。
* 完全修飾名が有効な場合でも、それらを保存しなかった以前のバージョンと比較して、Wasm バイナリが最大 8% 縮小。

このコンパクトストレージは、ダウンロード時間と起動時間が重要な Web 環境において重要です。さらに、この最適化により、以前は [クラスの完全修飾名の保存と `KClass.qualifiedName` のデフォルト有効化](#fully-qualified-names-enabled-by-default) を妨げていたサイズの壁が取り除かれました。

この変更はデフォルトで有効になっており、追加のアクションは不要です。

### `wasmWasi` で新しい例外処理プロポーザルをデフォルト有効化

以前、Kotlin/Wasm は [`wasmWasi`](wasm-overview.md#kotlin-wasm-and-wasi) を含むすべてのターゲットで [レガシーな例外処理プロポーザル](https://github.com/WebAssembly/exception-handling/blob/master/proposals/exception-handling/legacy/Exceptions.md) を使用していました。しかし、ほとんどのスタンドアロン WebAssembly 仮想マシン（VM）は、[新しいバージョンの例外処理プロポーザル](https://github.com/WebAssembly/exception-handling/blob/main/proposals/exception-handling/Exceptions.md) に準拠しつつあります。

Kotlin 2.3.0 以降、`wasmWasi` ターゲットでは新しい WebAssembly 例外処理プロポーザルがデフォルトで有効になり、最新の WebAssembly ランタイムとの互換性が向上しました。

`wasmWasi` ターゲットの場合、これをターゲットとするアプリケーションは通常、ユーザーによって制御される単一の特定の VM など、多様性の低いランタイム環境で動作するため、互換性のリスクが低く、早期の導入が安全であると判断されました。

新しい例外処理プロポーザルは、[`wasmJs` ターゲット](wasm-overview.md#kotlin-wasm-and-compose-multiplatform) では引き続きデフォルトでオフになっています。`-Xwasm-use-new-exception-proposal` コンパイラオプションを使用することで、手動で有効にできます。

## Kotlin/JS

Kotlin 2.3.0 では、suspend 関数を JavaScript にエクスポートする実験的サポートと、Kotlin の `LongArray` 型を表現する `BigInt64Array` 型が導入されました。

このリリースにより、インターフェース内のコンパニオンオブジェクトへの統一されたアクセス、コンパニオンオブジェクトを持つインターフェースでの `@JsStatic` アノテーションの使用、個別の関数やクラスでの `@JsQualifier` アノテーションの使用、および新しいアノテーション `@JsExport.Default` によるデフォルトエクスポートが可能になりました。

### `JsExport` による suspend 関数の新しいエクスポート (New export of suspend function with `JsExport`)
<primary-label ref="experimental-opt-in"/>

以前は、`@JsExport` アノテーションを使用して suspend 関数（またはそのような関数を含むクラスやインターフェース）を JavaScript にエクスポートすることはできませんでした。各 suspend 関数を手動でラップする必要があり、手間がかかりエラーも発生しやすいものでした。

Kotlin 2.3.0 以降、suspend 関数を `@JsExport` アノテーションを使用して JavaScript に直接エクスポートできるようになりました。

suspend 関数のエクスポートを有効にすることで、ボイラープレートが削減され、Kotlin/JS と JavaScript/TypeScript (JS/TS) 間の相互運用性が向上します。Kotlin の async 関数を余分なコードなしで JS/TS から直接呼び出せるようになります。

この機能を有効にするには、`build.gradle.kts` ファイルに以下のコンパイラオプションを追加してください。

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xenable-suspend-function-exporting")
    }
}
```

有効にすると、`@JsExport` アノテーションが付けられたクラスや関数は、追加のラッパーなしで suspend 関数を含めることができるようになります。

これらは通常の JavaScript async 関数として利用でき、async 関数としてオーバーライドすることも可能です。

```kotlin
@JsExport
open class Foo {
    suspend fun foo() = "Foo"
}
```

```typescript
class Bar extends Foo {
    override async foo(): Promise<string> {
        return "Bar"
    }
}
```

この機能は [実験的 (Experimental)](components-stability.md#stability-levels-explained) です。イシュートラッカー [YouTrack](https://youtrack.jetbrains.com/issue/KT-56281/KJS-Cant-export-suspend-functions) でのフィードバックをお待ちしております。

### `BigInt64Array` 型による Kotlin `LongArray` 型の表現
<primary-label ref="experimental-opt-in"/>

以前の Kotlin/JS は、`LongArray` を JavaScript の `Array<bigint>` として表現していました。このアプローチは機能していましたが、型付き配列（Typed Arrays）を期待する JavaScript API との相互運用性としては理想的ではありませんでした。

今回のリリースから、Kotlin/JS は JavaScript コンパイル時に Kotlin の `LongArray` 値を表現するために、JavaScript 組み込みの `BigInt64Array` 型を使用するようになりました。

`BigInt64Array` を使用することで、型付き配列を使用する JavaScript API との相互運用性が簡素化されます。また、`LongArray` を受け取ったり返したりする API を、Kotlin から JavaScript へより自然にエクスポートできるようになります。

この機能を有効にするには、`build.gradle.kts` ファイルに以下のコンパイラオプションを追加してください。

```kotlin
kotlin {
    js {
        // ...
        compilerOptions {
            freeCompilerArgs.add("-Xes-long-as-bigint")
        }
    }
}
```

この機能は [実験적 (Experimental)](components-stability.md#stability-levels-explained) です。イシュートラッカー [YouTrack](https://youtrack.jetbrains.com/issue/KT-79284/Use-BigInt64Array-for-LongArray) でのフィードバックをお待ちしております。

### JS モジュールシステム間での統一されたコンパニオンオブジェクトアクセス

以前は、`@JsExport` アノテーションを使用してコンパニオンオブジェクトを持つ Kotlin インターフェースを JavaScript/TypeScript にエクスポートした場合、TypeScript でのインターフェースの使用方法は ES モジュールと他のモジュールシステムで異なっていました。

その結果、モジュールシステムに応じて、TypeScript 側の出力の利用方法を調整する必要がありました。

以下の Kotlin コードを考えてみましょう。

```kotlin
@JsExport
interface Foo {
    companion object {
        fun bar() = "OK"
    }
}
```

モジュールシステムによって呼び出し方が異なっていました。

```kotlin
// CommonJS, AMD, UMD, およびモジュールなしで機能
Foo.bar()

// ES モジュールで機能
Foo.getInstance().bar() 
```

今回のリリースで、Kotlin はすべての JavaScript モジュールシステムにおいてコンパニオンオブジェクトのエクスポートを統一しました。

今後、すべてのモジュールシステム（ES モジュール、CommonJS、AMD、UMD、モジュールなし）において、インターフェース内のコンパニオンオブジェクトは（クラス内のコンパニオンと同様に）常に同じ方法でアクセスされます。

```kotlin
// すべてのモジュールシステムで機能
Foo.Companion.bar()
```

この改善により、コレクションの相互運用性も修正されました。以前は、コレクションのファクトリ関数へのアクセス方法がモジュールシステムによって異なっていました。

```kotlin
// CommonJS, AMD, UMD, およびモジュールなしで機能
KtList.fromJsArray([1, 2, 3])

// ES モジュールで機能
KtList.getInstance().fromJsArray([1, 2, 3])
```

現在は、すべてのモジュールシステムでコレクションファクトリ関数へのアクセスが同様になりました。

```kotlin
// すべてのモジュールシステムで機能
KtList.fromJsArray([1, 2, 3])
```

この変更により、モジュールシステム間での一貫性のない動作が解消され、バグや相互運用性の問題を回避できます。

この機能はデフォルトで有効になっています。

### コンパニオンオブジェクトを持つインターフェースでの `@JsStatic` アノテーションのサポート

以前は、エクスポートされたコンパニオンオブジェクトを持つインターフェース内では、`@JsStatic` アノテーションの使用が許可されていませんでした。

たとえば、以下のコードは、クラスのコンパニオンオブジェクトのメンバのみが `@JsStatic` でアノテーションできるため、エラーになっていました。

```kotlin
@JsExport
interface Foo {
    companion object {
        @JsStatic // エラー
        fun bar() = "OK"
    }
}
```

この場合、`@JsStatic` アノテーションを諦め、JavaScript (JS) からは以下のようにコンパニオンにアクセスする必要がありました。

```kotlin
// すべてのモジュールシステムで共通
Foo.Companion.bar()
```

今後、コンパニオンオブジェクトを持つインターフェースにおいて `@JsStatic` アノテーションがサポートされます。
これらのコンパニオンにこのアノテーションを使用し、クラスの場合と同様に JS から直接関数を呼び出すことができます。

```kotlin
// すべてのモジュールシステムで共通
Foo.bar()
```

この変更により、JS での API 利用が簡素化され、インターフェース上の静的ファクトリメソッドが可能になり、クラスとインターフェース間の一貫性のなさが解消されます。

この機能はデフォルトで有効になっています。

### 個別の関数およびクラスでの `@JsQualifier` アノテーションの使用許可

以前は、`@JsQualifier` アノテーションはファイルレベルでしか適用できなかったため、すべての外部 JavaScript (JS) 宣言を別々のファイルに配置する必要がありました。

Kotlin 2.3.0 からは、`@JsModule` や `@JsNonModule` アノテーションと同様に、`@JsQualifier` アノテーションを個別の関数やクラスに直接適用できるようになりました。

たとえば、同じファイル内の通常の Kotlin 宣言の隣に、以下のような外部関数のコードを書くことができます。

```kotlin
@JsQualifier("jsPackage")
private external fun jsFun()
```

この変更により Kotlin/JS の相互運用性が簡素化され、プロジェクト構造をよりクリーンに保つことができ、他のプラットフォームの外部宣言の扱いに Kotlin/JS を合わせることができます。

この機能はデフォルトで有効になっています。

### JavaScript デフォルトエクスポートのサポート

以前の Kotlin/JS では、Kotlin コードから JavaScript のデフォルトエクスポート（default export）を生成することができませんでした。代わりに、名前付きエクスポートのみが生成されていました。例：

```javascript
export { SomeDeclaration };
```

デフォルトエクスポートが必要な場合は、コンパイラ内の回避策（`@JsName` アノテーションに `default` とスペースを引数として指定するなど）を使用する必要がありました。

```kotlin
@JsExport
@JsName("default ")
class SomeDeclaration
```

Kotlin/JS は、新しいアノテーションを通じてデフォルトエクスポートを直接サポートするようになりました。

```kotlin
@JsExport.Default
```

このアノテーションを Kotlin の宣言（クラス、オブジェクト、関数、またはプロパティ）に適用すると、生成された JavaScript に ES モジュール用の `export default` 文が自動的に含まれます。

```javascript
export default HelloWorker;
```

> ES モジュール以外のモジュールシステムの場合、新しい `@JsExport.Default` アノテーションは通常の `@JsExport` アノテーションと同様に機能します。
>
{style="note"}

この変更により、Kotlin コードを JavaScript の慣習に合わせることが可能になり、特に Cloudflare Workers のようなプラットフォームや `React.lazy` のようなフレームワークにおいて重要です。

この機能はデフォルトで有効になっています。`@JsExport.Default` アノテーションを使用するだけです。

## Gradle

Kotlin 2.3.0 は Gradle 7.6.3 から 9.0.0 までと完全に互換性があります。最新の Gradle リリースまで使用することも可能ですが、その場合は非推奨の警告が表示されたり、一部の新しい Gradle 機能が動作しなかったりする可能性があることに注意してください。

さらに、サポートされる最小の Android Gradle Plugin バージョンは 8.2.2 になり、最大のサポートバージョンは 8.13.0 になりました。

Kotlin 2.3.0 では、Gradle プロジェクトで生成されたソースを登録するための新しい API も導入されています。

### Gradle プロジェクトで生成されたソースを登録するための新しい API
<primary-label ref="experimental-general"/>

Kotlin 2.3.0 では、[`KotlinSourceSet`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/) インターフェースに、Gradle プロジェクトで生成されたソースを登録するために使用できる新しい [実験的 (Experimental)](components-stability.md#stability-levels-explained) API が導入されました。

この新しい API は、IDE が生成されたコードと通常のソースファイルを区別しやすくするための利便性向上を目的としています。この API を使用すると、IDE は UI 上で生成されたコードを異なる方法でハイライトしたり、プロジェクトのインポート時に生成タスクをトリガーしたりできます。現在、IntelliJ IDEA でのこのサポート追加に取り組んでいます。また、この API は [KSP](ksp-overview.md) (Kotlin Symbol Processing) のようなコードを生成するサードパーティのプラグインやツールにとっても特に有用です。

詳細については、[生成されたソースの登録 (Register generated sources)](gradle-configure-project.md#register-generated-sources) を参照してください。

## 標準ライブラリ (Standard library)

Kotlin 2.3.0 では、新しい時間計測機能である [`kotlin.time.Clock` と `kotlin.time.Instant`](whatsnew2120.md#new-time-tracking-functionality) が Stable になり、実験的な UUID API にいくつかの改善が加えられました。

### UUID の生成と解析の改善 (Improved UUID generation and parsing)
<primary-label ref="experimental-opt-in"/>

Kotlin 2.3.0 では、以下を含む UUID API のいくつかの改善が導入されました。

* [無効な UUID を解析する際に `null` を返すサポート](#support-for-returning-null-when-parsing-invalid-uuids)
* [v4 および v7 UUID を生成するための新しい関数](#new-functions-to-generate-v4-and-v7-uuids)
* [特定のタイムスタンプに対する v7 UUID 生成のサポート](#support-for-generating-v7-uuids-for-specific-timestamps)

標準ライブラリにおける UUID サポートは [実験的 (Experimental)](components-stability.md#stability-levels-explained) ですが、[将来的に Stable 化される予定](https://youtrack.jetbrains.com/issue/KT-81395) です。オプトインするには、`@OptIn(ExperimentalUuidApi::class)` アノテーションを使用するか、ビルドファイルに以下のコンパイラオプションを追加してください。

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-opt-in=kotlin.uuid.ExperimentalUuidApi")
    }
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-opt-in=kotlin.uuid.ExperimentalUuidApi</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

[YouTrack](https://youtrack.jetbrains.com/issue/KT-81395) や [関連する Slack チャンネル](https://slack-chats.kotlinlang.org/c/uuid) でのフィードバックをお待ちしております。

#### 無効な UUID を解析する際に `null` を返すサポート

Kotlin 2.3.0 では、文字列から `Uuid` インスタンスを作成するための新しい関数が導入されました。これらの関数は、文字列が有効な UUID でない場合に例外をスローする代わりに `null` を返します。

これには以下の関数が含まれます。

* `Uuid.parseOrNull()` – ハイフンあり、または 16 Hex（16進数）形式の UUID を解析します。
* `Uuid.parseHexDashOrNull()` – ハイフンあり形式の UUID のみを解析し、それ以外の場合は `null` を返します。
* `Uuid.parseHexOrNull()` – 単純な 16 進数形式の UUID のみを解析し、それ以外の場合は `null` を返します。

例を以下に示します。

```kotlin
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

@OptIn(ExperimentalUuidApi::class)
fun main() {
    val valid = Uuid.parseOrNull("550e8400-e29b-41d4-a716-446655440000")
    println(valid)
    // 550e8400-e29b-41d4-a716-446655440000

    val invalid = Uuid.parseOrNull("not-a-uuid")
    println(invalid)
    // null

    val hexDashValid = Uuid.parseHexDashOrNull("550e8400-e29b-41d4-a716-446655440000")
    println(hexDashValid)
    // 550e8400-e29b-41d4-a716-446655440000

    val hexDashInvalid = Uuid.parseHexDashOrNull("550e8400e29b41d4a716446655440000")
    println(hexDashInvalid)
    // null
}
```
{kotlin-runnable="true"}

#### v4 および v7 UUID を生成するための新しい関数

Kotlin 2.3.0 では、UUID を生成するための 2 つの新しい関数 `Uuid.generateV4()` と `Uuid.generateV7()` が導入されました。

バージョン 4 の UUID を生成するには `Uuid.generateV4()` 関数を、バージョン 7 の UUID を生成するには `Uuid.generateV7()` 関数を使用してください。

> `Uuid.random()` 関数は変更されておらず、`Uuid.generateV4()` と同様にバージョン 4 の UUID を生成します。
>
{style="note"}

例を以下に示します。

```kotlin
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

@OptIn(ExperimentalUuidApi::class)
fun main() {
    // v4 UUID を生成
    val v4 = Uuid.generateV4()
    println(v4)

    // v7 UUID を生成
    val v7 = Uuid.generateV7()
    println(v7)

    // v4 UUID を生成
    val random = Uuid.random()
    println(random)
}
```
{kotlin-runnable="true"}

#### 特定のタイムスタンプに対する v7 UUID 生成のサポート

Kotlin 2.3.0 では新しい `Uuid.generateV7NonMonotonicAt()` 関数が導入されました。これを使用すると、特定の時点に対するバージョン 7 の UUID を生成できます。

> `Uuid.generateV7()` とは異なり、`Uuid.generateV7NonMonotonicAt()` は単調増加（monotonic ordering）を保証しません。そのため、同じタイムスタンプに対して作成された複数の UUID は連続していない可能性があります。
>
{style="note"}

イベント ID の再現や、本来の発生時刻を反映したデータベースエントリの生成など、既知のタイムスタンプに紐付けられた識別子が必要な場合にこの関数を使用してください。

たとえば、特定のインスタント（Instant）に対してバージョン 7 の UUID を作成するには、以下のコードを使用します。

```kotlin
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid
import kotlin.time.ExperimentalTime
import kotlin.time.Instant

@OptIn(ExperimentalUuidApi::class, ExperimentalTime::class)
fun main() {
    val timestamp = Instant.fromEpochMilliseconds(1577836800000) // 2020-01-01T00:00:00Z

    // 指定されたタイムスタンプに対して v7 UUID を生成（単調性の保証なし）
    val v7AtTimestamp = Uuid.generateV7NonMonotonicAt(timestamp)
    println(v7AtTimestamp)
}
```
{kotlin-runnable="true"}

## Compose コンパイラ: 難読化された Android アプリケーションのスタックトレース

Kotlin 2.3.0 から、アプリケーションが R8 によって難読化・縮小化されている場合、コンパイラは Compose スタックトレース用の ProGuard マッピングを出力します。これにより、以前はデバッグ可能なバリアントでのみ利用可能だった実験的なスタックトレース機能が拡張されます。

リリースバリアントのスタックトレースには、実行時にソース情報を記録するオーバーヘッドなしに、難読化されたアプリケーション内の Composable 関数を特定するために使用できるグループキーが含まれます。グループキー形式のスタックトレースを使用するには、アプリケーションを Compose ランタイム 1.10 以降でビルドする必要があります。

グループキーのスタックトレースを有効にするには、`@Composable` コンテンツを初期化する前に以下の行を追加してください。

```kotlin
Composer.setDiagnosticStackTraceMode(ComposeStackTraceMode.GroupKeys)
```

これらのスタックトレースを有効にすると、Compose ランタイムは、たとえアプリが難読化されていても、コンポジション、計測（measure）、または描画（draw）パス中にクラッシュがキャプチャされた後、独自のスタックトレースを付加します。

```text
java.lang.IllegalStateException: <message>
        at <original trace>
    Suppressed: androidx.compose.runtime.DiagnosticComposeException: Composition stack when thrown:
        at $compose.m$123(SourceFile:1)
        at $compose.m$234(SourceFile:1)
        ...
```

Jetバック Compose 1.10 によってこのモードで生成されるスタックトレースには、まだデオブスキュレート（復元）が必要なグループキーのみが含まれています。これは、Kotlin 2.3.0 リリースの Compose コンパイラ Gradle プラグインによって対処されており、R8 によって生成される ProGuard マッピングファイルにグループキーのエントリが付加されるようになりました。コンパイラが一部の関数のマッピング作成に失敗した場合に新しい警告が表示される場合は、[Google IssueTracker](https://issuetracker.google.com/issues/new?component=610764&template=1424126) に報告してください。

> Compose コンパイラ Gradle プラグインは、R8 マッピングファイルに依存しているため、ビルドで R8 が有効な場合にのみグループキー・スタックトレース用のデオブスキュレーションマッピングを作成します。
>
{style="note"}

デフォルトでは、トレースを有効にしているかどうかに関わらず、マッピングファイル生成用の Gradle タスクが実行されます。ビルドで問題が発生した場合は、この機能を完全に無効にすることができます。Gradle 設定の `composeCompiler {}` ブロックに以下のプロパティを追加してください。

```kotlin
composeCompiler {
    includeComposeMappingFile.set(false)
}
```

> Android Gradle プラグインによって提供されるプロジェクトファイルで、一部のコードがスタックトレースに表示されない既知の問題があります: [KT-83099](https://youtrack.jetbrains.com/issue/KT-83099)。
>
{style="warning"}

問題が発生した場合は、[Google IssueTracker](https://issuetracker.google.com/issues/new?component=610764&template=1424126) に報告してください。

## 破壊的変更と非推奨

このセクションでは、重要な破壊的変更と非推奨事項について説明します。
完全な概要については、[互換性ガイド](compatibility-guide-23.md) を参照してください。

* Kotlin 2.3.0 以降、コンパイラは [`-language-version=1.8` をサポートしなくなりました](compatibility-guide-23.md#drop-support-in-language-version-for-1-8-and-1-9)。
  また、JVM 以外のプラットフォームでは `-language-version=1.9` のサポートも終了しました。
* 2.0 より古い言語機能セット（JVM プラットフォーム用の 1.9 を除く）はサポートされませんが、言語自体は Kotlin 1.0 との完全な後方互換性を維持しています。

  Gradle プロジェクトで `kotlin-dsl` **および** `kotlin("jvm")` プラグインの両方を使用している場合、サポートされていない Kotlin プラグインバージョンに関する Gradle 警告が表示されることがあります。移行手順のガイダンスについては、[互換性ガイド](compatibility-guide-23.md#unsupported-kgp-version-warning-when-using-kotlin-dsl-and-kotlin-jvm-plugins) を参照してください。

* Kotlin Multiplatform において、Android ターゲットのサポートは Google の [`com.android.kotlin.multiplatform.library` プラグイン](https://developer.android.com/kotlin/multiplatform/plugin) を通じて利用可能になりました。
  Android ターゲットを持つプロジェクトを新しいプラグインに移行し、`androidTarget` ブロックの名前を `android` に変更してください。

* Kotlin Multiplatform Gradle プラグインを Android Gradle Plugin (AGP) 9.0.0 以降で Android ターゲットに対して使い続けると、`androidTarget` ブロックの使用時に設定エラーが表示され、移行方法をガイドする診断メッセージが表示されます。このエラーは、AGP 8.x を使用して Kotlin 2.3.10 にアップデートするか、[Google の Android ターゲット用プラグイン](https://kotlinlang.org/docs/multiplatform/multiplatform-compatibility-guide.html#migrate-to-google-s-plugin-for-android-targets) に移行することで回避できます。

* AGP 9.0.0 には [Kotlin の組み込みサポート](https://developer.android.com/build/releases/agp-preview#android-gradle-plugin-built-in-kotlin) が含まれています。
  Kotlin 2.3.0 以降、[このバージョンの AGP を `kotlin-android` プラグインと一緒に使用すると設定エラーが表示されます](compatibility-guide-23.md#deprecate-kotlin-android-plugin-for-agp-versions-9-0-0-and-later)、このプラグインが不要になったためです。移行を支援するための新しい診断メッセージが用意されています。
  古い AGP バージョンを使用している場合は、非推奨の警告が表示されます。

* Ant ビルドシステムのサポートは終了しました。

## ドキュメントの更新

Kotlin Multiplatform のドキュメントが kotlinlang.org に移動しました。これにより、Kotlin と KMP のドキュメントを一箇所で切り替えられるようになりました。
また、言語ガイドの目次を刷新し、新しいナビゲーションを導入しました。

前回の Kotlin リリース以降のその他の注目すべき変更点：

* [KMP 概要 (KMP overview)](https://kotlinlang.org/docs/multiplatform/kmp-overview.html) – Kotlin Multiplatform エコシステムを 1 ページで探索できます。
* [Kotlin Multiplatform クイックスタート (Kotlin Multiplatform quickstart)](https://kotlinlang.org/docs/multiplatform/quickstart.html) – KMP IDE プラグインを使用した環境構築方法を学べます。
* [Compose Multiplatform 1.9.3 の新機能](https://kotlinlang.org/docs/multiplatform/whats-new-compose-190.html) – 
  最新リリースのハイライトについて学べます。
* [Kotlin/JS を始める (Get started with Kotlin/JS)](js-get-started.md) – Kotlin/JavaScript を使用してブラウザ用の Web アプリケーションを作成します。
* [クラス (Classes)](classes.md) – Kotlin におけるクラス使用の基本とベストプラクティスを学べます。
* [拡張 (Extensions)](extensions.md) – Kotlin でクラスやインターフェースを拡張する方法を学べます。
* [コルーチンの基本 (Coroutines basics)](coroutines-basics.md) – コルーチンの主要な概念を探索し、最初のコルーチンを作成する方法を学びます。
* [キャンセルとタイムアウト (Cancellation and timeouts)](coroutines-cancellation.md) – コルーチンのキャンセルがどのように動作し、コルーチンをキャンセルに対応させる方法を学べます。
* [Kotlin/Native ライブラリ (Kotlin/Native libraries)](native-libraries.md) – `klib` ライブラリアーティファクトを生成する方法を確認できます。
* [Kotlin Notebook 概要 (Kotlin Notebook overview)](kotlin-notebook-overview.md) – Kotlin Notebook プラグインを使用して、インタラクティブなノートブックドキュメントを作成できます。
* [Java プロジェクトに Kotlin を追加する](mixing-java-kotlin-intellij.md) – Kotlin と Java の両方を使用するように Java プロジェクトを構成します。
* [Kotlin で Java コードをテストする](jvm-test-using-junit.md) – JUnit を使用して Java と Kotlin が混在したプロジェクトをテストします。
* [新しい事例紹介（Case Studies）ページ](https://kotlinlang.org/case-studies/) – さまざまな企業がどのように Kotlin を活用しているかをご覧いただけます。

## Kotlin 2.3.0 へのアップデート方法

Kotlin プラグインは、IntelliJ IDEA および Android Studio にバンドルされたプラグインとして配布されます。

新しい Kotlin バージョンにアップデートするには、ビルドスクリプト内の [Kotlin バージョンを 2.3.0 に変更](releases.md#update-to-a-new-kotlin-version) してください。