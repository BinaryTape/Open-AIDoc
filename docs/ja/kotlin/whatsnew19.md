[//]: # (title: Kotlin 1.9.0 の新機能)

<web-summary>新しい言語機能、Kotlin Multiplatform、JVM、Native、JS、Wasm のアップデート、Gradle および Maven のビルドツールサポートを網羅した Kotlin 1.9.0 リリースノートをお読みください。</web-summary>

_[リリース日: 2023年7月6日](releases.md#release-history)_

Kotlin 1.9.0 リリースが公開され、JVM 向けの K2 コンパイラが **Beta** になりました。さらに、主なハイライトは以下のとおりです。

* [Kotlin K2 コンパイラの新しいアップデート](#new-kotlin-k2-compiler-updates)
* [enum クラスの values 関数の安定版の代替](#stable-replacement-of-the-enum-class-values-function)
* [オープンエンド範囲のための安定版 `..<` 演算子](#stable-operator-for-open-ended-ranges)
* [名前で正規表現キャプチャグループを取得する新しい共通関数](#new-common-function-to-get-regex-capture-group-by-name)
* [親ディレクトリを作成する新しいパスクラスのユーティリティ](#new-path-utility-to-create-parent-directories)
* [Kotlin Multiplatform における Gradle 構成キャッシュのプレビュー](#preview-of-the-gradle-configuration-cache)
* [Kotlin Multiplatform での Android ターゲットサポートの変更](#changes-to-android-target-support)
* [Kotlin/Native でのカスタムメモリアロケータのプレビュー](#preview-of-custom-memory-allocator)
* [Kotlin/Native でのライブラリリンケージ](#library-linkage-in-kotlin-native)
* [Kotlin/Wasm でのサイズ関連の最適化](#size-related-optimizations)

この動画でもアップデートの概要を簡単に確認できます。

<video src="https://www.youtube.com/v/fvwTZc-dxsM" title="Kotlin 1.9.0 の新機能"/>

> Kotlin のリリースサイクルの詳細については、[Kotlin のリリースプロセス](releases.md)を参照してください。
>
{style="tip"}

## IDE サポート {id="ide-support"}

1.9.0 をサポートする Kotlin プラグインは以下で利用可能です。

| IDE | サポートバージョン |
|--|--|
| IntelliJ IDEA | 2022.3.x, 2023.1.x |
| Android Studio | Giraffe (223), Hedgehog (231)* |

*Kotlin 1.9.0 プラグインは、今後のリリースで Android Studio Giraffe (223) および Hedgehog (231) に同梱される予定です。

Kotlin 1.9.0 プラグインは、今後のリリースで IntelliJ IDEA 2023.2 に同梱される予定です。

> Kotlin のアーティファクトと依存関係をダウンロードするには、Maven Central リポジトリを使用するように [Gradle の設定を構成](#configure-gradle-settings) してください。
>
{style="warning"}

## Kotlin K2 コンパイラの新しいアップデート {id="new-kotlin-k2-compiler-updates"}

JetBrains の Kotlin チームは K2 コンパイラの安定化を進めており、1.9.0 リリースではさらなる進展がもたらされました。
JVM 向けの K2 コンパイラは現在 **Beta** です。

Kotlin/Native およびマルチプラットフォームプロジェクトの基本的なサポートも追加されました。

### kapt コンパイラプラグインと K2 コンパイラの互換性 {id="compatibility-of-the-kapt-compiler-plugin-with-the-k2-compiler"}

いくつかの制限はありますが、K2 コンパイラとともにプロジェクトで [kapt プラグイン](kapt.md) を使用できます。
`languageVersion` を `2.0` に設定しても、kapt コンパイラプラグインは引き続き古いコンパイラを利用します。

`languageVersion` が `2.0` に設定されているプロジェクト内で kapt コンパイラプラグインを実行すると、kapt は自動的に `1.9` に切り替わり、特定のバージョン互換性チェックを無効にします。この動作は、以下のコマンド引数を含めることと同等です。
* `-Xskip-metadata-version-check`
* `-Xskip-prerelease-check`
* `-Xallow-unstable-dependencies`

これらのチェックは、kapt タスクに対してのみ無効化されます。他のすべてのコンパイルタスクは引き続き新しい K2 コンパイラを利用します。

K2 コンパイラで kapt を使用する際に問題が発生した場合は、弊社の[課題トラッカー](http://kotl.in/issue)に報告してください。

### プロジェクトで K2 コンパイラを試す {id="try-the-k2-compiler-in-your-project"}

1.9.0 から Kotlin 2.0 のリリースまでの間、`gradle.properties` ファイルに `kotlin.experimental.tryK2=true` Gradle プロパティを追加することで、K2 コンパイラを簡単にテストできます。また、次のコマンドを実行することもできます。

```shell
./gradlew assemble -Pkotlin.experimental.tryK2=true
```

この Gradle プロパティは自動的に言語バージョンを 2.0 に設定し、現在のコンパイラと比較して K2 コンパイラを使用してコンパイルされた Kotlin タスクの数でビルドレポートを更新します。

```none
##### 'kotlin.experimental.tryK2' results (Kotlin/Native not checked) #####
:lib:compileKotlin: 2.0 language version
:app:compileKotlin: 2.0 language version
##### 100% (2/2) tasks have been compiled with Kotlin 2.0 #####
```

### Gradle ビルドレポート {id="gradle-build-reports"}

[Gradle ビルドレポート](gradle-compilation-and-caches.md#build-reports) で、コードのコンパイルに現在のコンパイラと K2 コンパイラのどちらが使用されたかが表示されるようになりました。Kotlin 1.9.0 では、この情報を [Gradle ビルドスキャン](https://scans.gradle.com/) で確認できます。

![Gradle ビルドスキャン - K1](gradle-build-scan-k1.png){width=700}

![Gradle ビルドスキャン - K2](gradle-build-scan-k2.png){width=700}

また、プロジェクトで使用されている Kotlin バージョンもビルドレポート内で直接確認できます。

```none
Task info:
  Kotlin language version: 1.9
```

> Gradle 8.0 を使用している場合、特に Gradle 構成キャッシュが有効になっていると、ビルドレポートでいくつかの問題が発生する可能性があります。これは既知の問題であり、Gradle 8.1 以降で修正されています。
>
{style="note"}

### 現在の K2 コンパイラの制限事項 {id="current-k2-compiler-limitations"}

Gradle プロジェクトで K2 を有効にすると、以下の場合に Gradle 8.3 未満のバージョンを使用しているプロジェクトに影響を与える可能性がある一定の制限があります。

* `buildSrc` からのソースコードのコンパイル。
* 包含ビルド（included builds）内の Gradle プラグインのコンパイル。
* Gradle 8.3 未満のバージョンを使用するプロジェクトで使われている場合の、その他の Gradle プラグインのコンパイル。
* Gradle プラグインの依存関係のビルド。

上記の問題が発生した場合は、次の手順を実行して対処できます。

* `buildSrc`、Gradle プラグイン、およびその依存関係の言語バージョンを設定します。

```kotlin
kotlin {
    compilerOptions {
        languageVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_1_9)
        apiVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_1_9)
    }
}
```

* プロジェクトの Gradle バージョンが利用可能になり次第、8.3 にアップデートします。

### 新しい K2 コンパイラへのフィードバック {id="leave-your-feedback-on-the-new-k2-compiler"}

フィードバックをお待ちしております！

* Kotlin の Slack で K2 開発者に直接フィードバックを提供してください – [招待を受け取り](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)、[#k2-early-adopters](https://kotlinlang.slack.com/archives/C03PK0PE257) チャンネルに参加してください。
* 新しい K2 コンパイラで直面した問題は、[弊社の課題トラッカー](https://kotl.in/issue) に報告してください。
* [**Send usage statistics**（使用状況統計の送信）オプションを有効化](https://www.jetbrains.com/help/idea/settings-usage-statistics.html) して、JetBrains が K2 の使用状況に関する匿名データを収集できるようにしてください。

## 言語機能 {id="language"}

Kotlin 1.9.0 では、以前に導入された一部の新しい言語機能が安定化（Stable）されました。
* [enum クラスの values 関数の代替](#stable-replacement-of-the-enum-class-values-function)
* [データクラスとの対称性のためのデータオブジェクト](#stable-data-objects-for-symmetry-with-data-classes)
* [インライン値クラスでの本体を持つセカンダリコンストラクタのサポート](#support-for-secondary-constructors-with-bodies-in-inline-value-classes)

### enum クラスの values 関数の安定版の代替 {id="stable-replacement-of-the-enum-class-values-function"}

1.8.20 では、enum クラスの `entries` プロパティが試験的（Experimental）機能として導入されました。`entries` プロパティは、合成関数である `values()` のモダンで高パフォーマンスな代替手段です。1.9.0 では、`entries` プロパティが安定版（Stable）になりました。

> `values()` 関数も引き続きサポートされますが、代わりに `entries` プロパティを使用することをお勧めします。
>
{style="tip"}

```kotlin
enum class Color(val colorName: String, val rgb: String) {
    RED("Red", "#FF0000"),
    ORANGE("Orange", "#FF7F00"),
    YELLOW("Yellow", "#FFFF00")
}

fun findByRgb(rgb: String): Color? = Color.entries.find { it.rgb == rgb }
```
{validate="false"}

enum クラスの `entries` プロパティの詳細については、[Kotlin 1.8.20 の新機能](whatsnew1820.md#a-modern-and-performant-replacement-of-the-enum-class-values-function) を参照してください。

### データクラスとの対称性のためのデータオブジェクトの安定化 {id="stable-data-objects-for-symmetry-with-data-classes"}

[Kotlin 1.8.20](whatsnew1820.md#preview-of-data-objects-for-symmetry-with-data-classes) で導入されたデータオブジェクト宣言が、安定版（Stable）になりました。これには、データクラスとの対称性のために追加された `toString()`、`equals()`、`hashCode()` 関数が含まれます。

この機能は、`sealed` 階層（`sealed class` や `sealed interface` の階層など）で特に役立ちます。`data object` 宣言を `data class` 宣言と一緒に便利に使用できるためです。この例では、`EndOfFile` を通常の `object` ではなく `data object` として宣言することで、手動でオーバーライドしなくても自動的に `toString()` 関数が備わります。これにより、付随するデータクラスの定義との対称性が維持されます。

```kotlin
sealed interface ReadResult
data class Number(val number: Int) : ReadResult
data class Text(val text: String) : ReadResult
data object EndOfFile : ReadResult

fun main() {
    println(Number(7)) // Number(number=7)
    println(EndOfFile) // EndOfFile
}
```
{validate="false"}

詳細については、[Kotlin 1.8.20 の新機能](whatsnew1820.md#preview-of-data-objects-for-symmetry-with-data-classes) を参照してください。

### インライン値クラスでの本体を持つセカンダリコンストラクタのサポート {id="support-for-secondary-constructors-with-bodies-in-inline-value-classes"}

Kotlin 1.9.0 から、[インライン値クラス（inline value classes）](inline-classes.md) において本体を持つセカンダリコンストラクタの使用がデフォルトで利用可能になりました。

```kotlin
@JvmInline
value class Person(private val fullName: String) {
    // Kotlin 1.4.30 以降許可:
    init {
        check(fullName.isNotBlank()) {
            "Full name shouldn't be empty"
        }
    }
    // Kotlin 1.9.0 以降デフォルトで許可:
    constructor(name: String, lastName: String) : this("$name $lastName") {
        check(lastName.isNotBlank()) {
            "Last name shouldn't be empty"
        }
    }
}
```
{validate="false"}

以前は、Kotlin ではインラインクラスで public なプライマリコンストラクタのみが許可されていました。その結果、基礎となる値をカプセル化したり、制約付きの値を表すインラインクラスを作成したりすることができませんでした。

Kotlin の発展に伴い、これらの問題は修正されました。Kotlin 1.4.30 で `init` ブロックの制限が解除され、Kotlin 1.8.20 で本体を持つセカンダリコンストラクタのプレビューが導入されました。これらが現在、デフォルトで使用できるようになっています。Kotlin のインラインクラスの開発の詳細については、[こちらの KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/inline-classes.md) を参照してください。

## Kotlin/JVM {id="kotlin-jvm"}

バージョン 1.9.0 以降、コンパイラは JVM 20 に対応するバイトコードバージョンを持つクラスを生成できるようになりました。さらに、`JvmDefault` アノテーションおよびレガシーな `-Xjvm-default` モードの非推奨化プロセスも継続しています。

### JvmDefault アノテーションとレガシーな -Xjvm-default モードの非推奨化 {id="deprecation-of-jvmdefault-annotation-and-legacy-xjvm-default-modes"}

Kotlin 1.5 以降、新しい `-Xjvm-default` モードである `all` および `all-compatibility` の導入に伴い、`JvmDefault` アノテーションの使用は非推奨となりました。Kotlin 1.4 での `JvmDefaultWithoutCompatibility`、および Kotlin 1.6 での `JvmDefaultWithCompatibility` の導入により、これらのモードは `DefaultImpls` クラスの生成を包括的に制御し、古い Kotlin コードとのシームレスな互換性を確保します。

その結果、Kotlin 1.9.0 では `JvmDefault` アノテーションは意味を持たなくなり、エラーを伴う非推奨（deprecated with error）としてマークされました。将来的に Kotlin から完全に削除される予定です。

## Kotlin/Native {id="kotlin-native"}

このリリースでは、その他の改善点に加え、堅牢性とパフォーマンスを向上させる [Kotlin/Native メモリマネージャ](native-memory-manager.md) のさらなる進化が含まれています。

* [カスタムメモリアロケータのプレビュー](#preview-of-custom-memory-allocator)
* [メインスレッドでの Objective-C または Swift オブジェクトの解放フック](#objective-c-or-swift-object-deallocation-hook-on-the-main-thread)
* [Kotlin/Native での定数値アクセス時にオブジェクトの初期化を行わないように変更](#no-object-initialization-when-accessing-constant-values-in-kotlin-native)
* [iOS シミュレータテストのスタンドアロンモードを設定する機能](#ability-to-configure-standalone-mode-for-ios-simulator-tests-in-kotlin-native)
* [Kotlin/Native でのライブラリリンケージ](#library-linkage-in-kotlin-native)

### カスタムメモリアロケータのプレビュー {id="preview-of-custom-memory-allocator"}

Kotlin 1.9.0 では、カスタムメモリアロケータのプレビューが導入されました。その割り当てシステムにより、[Kotlin/Native メモリマネージャ](native-memory-manager.md) のランタイムパフォーマンスが向上します。

Kotlin/Native の現在のオブジェクト割り当てシステムは、効率的なガベージコレクションのための機能を備えていない汎用アロケータを使用しています。これを補うため、ガベージコレクタ（GC）がそれらを単一のリストにマージする前に、割り当てられたすべてのオブジェクトのスレッドローカルな連結リストを保持し、スイープ中に反復処理できるようにしています。このアプローチには、パフォーマンス上のいくつかの欠点があります。

* スイープ順序のメモリ局所性が低く、分散したメモリアクセスパターンになることが多く、パフォーマンスの問題を引き起こす可能性がある。
* 連結リストはオブジェクトごとに追加のメモリを必要とし、特に多数の小さなオブジェクトを扱う場合にメモリ使用量が増加する。
* 割り当てられたオブジェクトの単一リストにより、スイープの並列化が困難になり、ミューテータースレッドが GC スレッドの回収速度よりも速くオブジェクトを割り当てた場合にメモリ使用量の問題が発生する可能性がある。

これらの問題に対処するため、Kotlin 1.9.0 ではカスタムアロケータのプレビューが導入されました。システムメモリをページに分割し、連続した順序で独立してスイープできるようにします。各割り当てはページ内のメモリブロックとなり、ページはブロックサイズを追跡します。さまざまな割り当てサイズに合わせて最適化された異なるページタイプがあります。メモリブロックが連続して配置されているため、割り当てられたすべてのブロックを効率的に反復処理できます。

スレッドがメモリを割り当てるとき、割り当てサイズに基づいて適切なページを検索します。スレッドは、異なるサイズカテゴリ用のページのセットを保持します。通常、特定のサイズの現在のページで割り当てに対応できます。対応できない場合、スレッドは共有割り当てスペースから別のページを要求します。このページはすでに利用可能であるか、スイープが必要であるか、または最初に作成される必要があります。

新しいアロケータにより、複数の独立した割り当てスペースを同時に持つことができるようになり、Kotlin チームはパフォーマンスをさらに向上させるためにさまざまなページレイアウトを実験できるようになります。

新しいアロケータの設計の詳細については、こちらの [README](https://github.com/JetBrains/kotlin/blob/master/kotlin-native/runtime/src/alloc/custom/README.md) を参照してください。

#### 有効化する方法 {id="how-to-enable"}

`-Xallocator=custom` コンパイラオプションを追加します。

```kotlin
kotlin {
    macosX64("native") {
        binaries.executable()

        compilations.configureEach {
            compilerOptions.configure {
                freeCompilerArgs.add("-Xallocator=custom")
            }
        }
    }
}
```
{validate="false"}

#### フィードバックの送信 {id="leave-feedback"}

カスタムアロケータを改善するために、[YouTrack](https://youtrack.jetbrains.com/issue/KT-55364/Implement-custom-allocator-for-Kotlin-Native) でのフィードバックをお待ちしております。

### メインスレッドでの Objective-C または Swift オブジェクトの解放フック {id="objective-c-or-swift-object-deallocation-hook-on-the-main-thread"}

Kotlin 1.9.0 以降、オブジェクトがメインスレッドで Kotlin に渡された場合、Objective-C または Swift オブジェクトの解放（deallocation）フックはメインスレッドで呼び出されるようになりました。[Kotlin/Native メモリマネージャ](native-memory-manager.md) が以前に Objective-C オブジェクトへの参照を処理していた方法では、メモリリークが発生する可能性がありました。新しい動作により、メモリマネージャの堅牢性が向上すると期待されます。

Kotlin コードで参照される Objective-C オブジェクトを考えてみましょう（例えば、引数として渡されたり、関数から返されたり、コレクションから取得されたりした場合）。この場合、Kotlin は Objective-C オブジェクトへの参照を保持する独自のオブジェクトを作成します。Kotlin オブジェクトが解放されると、Kotlin/Native ランタイムはその Objective-C 参照を解放する `objc_release` 関数を呼び出します。

以前は、Kotlin/Native メモリマネージャは特別な GC スレッドで `objc_release` を実行していました。それが最後のオブジェクト参照である場合、オブジェクトは解放されます。Objective-C オブジェクトにカスタムの解放フック（Objective-C の `dealloc` メソッドや Swift の `deinit` ブロックなど）があり、それらのフックが特定のスレッドで呼び出されることを期待している場合に問題が発生する可能性がありました。

メインスレッド上のオブジェクトのフックは通常メインスレッドで呼び出されることを期待しているため、Kotlin/Native ランタイムもメインスレッドで `objc_release` を呼び出すようになりました。これにより、Objective-C オブジェクトがメインスレッドで Kotlin に渡され、そこで Kotlin ピアオブジェクトが作成されたケースがカバーされます。これは、通常の UI アプリケーションのようにメインディスパッチキューが処理されている場合にのみ機能します。メインキューではない場合や、オブジェクトがメイン以外のスレッドで Kotlin に渡された場合、`objc_release` は以前と同様に特別な GC スレッドで呼び出されます。

#### オプトアウトする方法 {id="how-to-opt-out"}

問題が発生した場合は、`gradle.properties` ファイルで次のオプションを使用してこの動作を無効にできます。

```none
kotlin.native.binary.objcDisposeOnMain=false
```

そのようなケースが発生した場合は、遠慮なく[弊社の課題トラッカー](https://kotl.in/issue)に報告してください。

### Kotlin/Native での定数値アクセス時にオブジェクトの初期化を行わないように変更 {id="no-object-initialization-when-accessing-constant-values-in-kotlin-native"}

Kotlin 1.9.0 以降、Kotlin/Native バックエンドは `const val` フィールドにアクセスする際にオブジェクトを初期化しなくなりました。

```kotlin
object MyObject {
    init {
        println("side effect!")
    }

    const val y = 1
}

fun main() {
    println(MyObject.y) // 最初は初期化されない
    val x = MyObject    // ここで初期化が発生する
    println(x.y)
}
```
{validate="false"}

この動作は Kotlin/JVM と統一されました。Kotlin/JVM では実装が Java と一貫しており、この場合にオブジェクトが初期化されることはありません。この変更のおかげで、Kotlin/Native プロジェクトのパフォーマンス向上も期待できます。

### Kotlin/Native で iOS シミュレータテストのスタンドアロンモードを設定する機能 {id="ability-to-configure-standalone-mode-for-ios-simulator-tests-in-kotlin-native"}

デフォルトでは、Kotlin/Native の iOS シミュレータテストを実行する際、手動でのシミュレータの起動とシャットダウンを避けるために `--standalone` フラグが使用されます。1.9.0 では、Gradle タスクで `standalone` プロパティを使用してこのフラグを使用するかどうかを設定できるようになりました。デフォルトでは、`--standalone` フラグが使用されるためスタンドアロンモードが有効になっています。

以下は、`build.gradle.kts` ファイルでスタンドアロンモードを無効にする方法の例です。

```kotlin
tasks.withType<org.jetbrains.kotlin.gradle.targets.native.tasks.KotlinNativeSimulatorTest>().configureEach {
    standalone.set(false)
}
```
{validate="false"}

> スタンドアロンモードを無効にした場合は、シミュレータを手動で起動する必要があります。CLI からシミュレータを起動するには、次のコマンドを使用できます。
>
> ```shell
> /usr/bin/xcrun simctl boot <DeviceId>
>```
>
{style="warning"}

### Kotlin/Native でのライブラリリンケージ {id="library-linkage-in-kotlin-native"}

Kotlin 1.9.0 以降、Kotlin/Native コンパイラは Kotlin ライブラリのリンケージ問題を Kotlin/JVM と同じ方法で処理します。あるサードパーティ製 Kotlin ライブラリの作者が、別のサードパーティ製 Kotlin ライブラリが使用している実験的 API に互換性のない変更を加えた場合、このような問題が発生することがあります。

サードパーティ製 Kotlin ライブラリ間でリンケージの問題が発生しても、コンパイル時にビルドが失敗することはなくなりました。代わりに、JVM とまったく同様に実行時にのみこれらのエラーが発生します。

Kotlin/Native コンパイラは、ライブラリリンケージの問題を検出するたびに警告を報告します。このような警告は、例えば以下のようにコンパイルログで見つけることができます。

```text
No function found for symbol 'org.samples/MyRemovedClass.doSomething|3657632771909858561[0]'

Can not get instance of singleton 'MyEnumClass.REMOVED_ENTRY': No enum entry found for symbol 'org.samples/MyEnumClass.REMOVED_ENTRY|null[0]'

Function 'getMyRemovedClass' can not be called: Function uses unlinked class symbol 'org.samples/MyRemovedClass|null[0]'
```

プロジェクト内でこの動作をさらに設定したり、無効にしたりすることもできます。

* これらの警告をコンパイルログに表示したくない場合は、`-Xpartial-linkage-loglevel=INFO` コンパイラオプションで抑制します。
* `-Xpartial-linkage-loglevel=ERROR` を使用して、報告された警告の重要度をコンパイルエラーに引き上げることも可能です。この場合、コンパイルは失敗し、コンパイルログにすべてのエラーが表示されます。このオプションを使用して、リンケージの問題をより詳細に調査できます。
* この機能で予期しない問題が発生した場合は、`-Xpartial-linkage=disable` コンパイラオプションでいつでもオプトアウトできます。そのようなケースは、遠慮なく[弊社の課題トラッカー](https://kotl.in/issue)に報告してください。

```kotlin
// Gradle ビルドファイルを介してコンパイラオプションを渡す例
kotlin {
    macosX64("native") {
        binaries.executable()

        compilations.configureEach {
            compilerOptions.configure {
                // リンケージ警告を抑制する場合:
                freeCompilerArgs.add("-Xpartial-linkage-loglevel=INFO")

                // リンケージ警告をエラーに引き上げる場合:
                freeCompilerArgs.add("-Xpartial-linkage-loglevel=ERROR")

                // 機能を完全に無効にする場合:
                freeCompilerArgs.add("-Xpartial-linkage=disable")
            }
        }
    }
}
```
{validate="false"}

### C 相互運用機能の暗黙的な整数変換のためのコンパイラオプション {id="compiler-option-for-c-interop-implicit-integer-conversions"}

C 相互運用（C interop）において暗黙的な整数変換を使用できるようにするコンパイラオプションを導入しました。慎重に検討した結果、この機能にはまだ改善の余地があり、最高品質の API を提供することを目指しているため、意図しない使用を防ぐためにこのコンパイラオプションを導入しました。

次のコードサンプルでは、[`options`](https://developer.apple.com/documentation/foundation/nscalendar/options) が符号なし型 `UInt` であり `0` が符号付きであるにもかかわらず、暗黙的な整数変換によって `options = 0` が許可されています。

```kotlin
val today = NSDate()
val tomorrow = NSCalendar.currentCalendar.dateByAddingUnit(
    unit = NSCalendarUnitDay,
    value = 1,
    toDate = today,
    options = 0
)
```
{validate="false"}

ネイティブ相互運用ライブラリで暗黙的な変換を使用するには、`-XXLanguage:+ImplicitSignedToUnsignedIntegerConversion` コンパイラオプションを使用します。

Gradle の `build.gradle.kts` ファイルで次のように設定できます。
```kotlin
tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinNativeCompile>().configureEach {
    compilerOptions.freeCompilerArgs.addAll(
        "-XXLanguage:+ImplicitSignedToUnsignedIntegerConversion"
    )
}
```
{validate="false"}

## Kotlin Multiplatform {id="kotlin-multiplatform"}

Kotlin Multiplatform には、開発者エクスペリエンスを向上させるために設計されたいくつかの注目すべきアップデートが 1.9.0 で行われました。

* [Android ターゲットサポートの変更](#changes-to-android-target-support)
* [新しい Android ソースセットレイアウトがデフォルトで有効化](#new-android-source-set-layout-enabled-by-default)
* [マルチプラットフォームプロジェクトでの Gradle 構成キャッシュのプレビュー](#preview-of-the-gradle-configuration-cache)

### Android ターゲットサポートの変更 {id="changes-to-android-target-support"}

私たちは Kotlin Multiplatform の安定化に向けた取り組みを継続しています。重要なステップは、Android ターゲットに対するファーストクラスのサポートを提供することです。将来的に Google の Android チームが Kotlin Multiplatform で Android をサポートするための独自の Gradle プラグインを提供することを発表できることを嬉しく思います。

Google からのこの新しいソリューションへの道を開くため、1.9.0 では現在の Kotlin DSL の `android` ブロックの名前を変更します。ビルドスクリプト内の `android` ブロックのすべての出現箇所を `androidTarget` に変更してください。これは、Google から提供される今後の DSL のために `android` という名前を解放するために必要な一時的な変更です。

Google のプラグインは、マルチプラットフォームプロジェクトで Android を扱うための推奨される方法になります。準備が整い次第、以前と同じように短い `android` という名前を使用できるように必要な移行手順を提供します。

### 新しい Android ソースセットレイアウトがデフォルトで有効化 {id="new-android-source-set-layout-enabled-by-default"}

Kotlin 1.9.0 以降、新しい Android ソースセットレイアウトがデフォルトになります。これは、さまざまな点で混乱を招いていた以前のディレクトリ命名スキーマを置き換えるものです。新しいレイアウトには多くの利点があります。

* 簡素化されたタイプセマンティクス – 新しい Android ソースレイアウトは、明確で一貫した命名規則を提供し、さまざまなタイプのソースセットを区別するのに役立ちます。
* ソースディレクトリレイアウトの改善 – 新しいレイアウトにより、`SourceDirectories` の配置がより一貫性のあるものになり、コードの整理やソースファイルの配置場所の把握が容易になります。
* Gradle 構成の明確な命名スキーマ – `KotlinSourceSets` と `AndroidSourceSets` の両方で、スキーマの一貫性と予測可能性が向上しました。

新しいレイアウトには Android Gradle プラグイン バージョン 7.0 以降が必要であり、Android Studio 2022.3 以降でサポートされています。`build.gradle(.kts)` ファイルで必要な変更を行うには、弊社の[移行ガイド](https://kotlinlang.org/docs/multiplatform/multiplatform-android-layout.html)を参照してください。

### Gradle 構成キャッシュのプレビュー {id="preview-of-the-gradle-configuration-cache"}

<p id="preview-of-gradle-configuration-cache">Kotlin 1.9.0 では、マルチプラットフォームライブラリにおける <a href="https://docs.gradle.org/current/userguide/configuration_cache.html">Gradle 構成キャッシュ</a> のサポートが導入されました。ライブラリの作者であれば、ビルドパフォーマンスの向上をすでに享受できます。</p>

Gradle 構成キャッシュは、後続のビルドで構成フェーズの結果を再利用することでビルドプロセスを高速化します。この機能は Gradle 8.1 以降で安定版（Stable）になりました。有効にするには、[Gradle ドキュメント](https://docs.gradle.org/current/userguide/configuration_cache.html#config_cache:usage) の手順に従ってください。

> Kotlin Multiplatform プラグインは、Xcode 連携タスクや [Kotlin CocoaPods Gradle プラグイン](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-dsl-reference.html) での Gradle 構成キャッシュをまだサポートしていません。将来の Kotlin リリースでこの機能を追加する予定です。
>
{style="note"}

## Kotlin/Wasm {id="kotlin-wasm"}

Kotlin チームは、新しい Kotlin/Wasm ターゲットの実験を続けています。このリリースでは、いくつかのパフォーマンスと[サイズ関連の最適化](#size-related-optimizations)、および [JavaScript 相互運用のアップデート](#updates-in-javascript-interop) が導入されています。

### サイズ関連の最適化 {id="size-related-optimizations"}

Kotlin 1.9.0 では、WebAssembly（Wasm）プロジェクト向けに大幅なサイズ改善が導入されています。2 つの「Hello World」プロジェクトを比較すると、Kotlin 1.9.0 の Wasm のコードフットプリントは Kotlin 1.8.20 よりも 10 倍以上小さくなっています。

![Kotlin/Wasm サイズ関連の最適化](wasm-1-9-0-size-improvements.png){width=700}

これらのサイズ最適化により、Kotlin コードで Wasm プラットフォームをターゲットとする際のリソース利用がより効率的になり、パフォーマンスが向上します。

### JavaScript 相互運用のアップデート {id="updates-in-javascript-interop"}

この Kotlin アップデートでは、Kotlin/Wasm における Kotlin と JavaScript 間の相互運用性に変更が導入されています。Kotlin/Wasm は[試験的（Experimental）](components-stability.md#stability-levels-explained) な機能であるため、その相互運用性には一定の制限が適用されます。

#### Dynamic 型の制限 {id="restriction-of-dynamic-types"}

バージョン 1.9.0 以降、Kotlin は Kotlin/Wasm での `Dynamic` 型の使用をサポートしなくなりました。これは、JavaScript の相互運用性を促進する新しい汎用的な `JsAny` 型に置き換わる形で非推奨となりました。

詳細については、[Kotlin/Wasm と JavaScript の相互運用性](wasm-js-interop.md) のドキュメントを参照してください。

#### 非 external 型の制限 {id="restriction-of-non-external-types"}

Kotlin/Wasm は、JavaScript との間で値をやり取りする際に、特定の Kotlin 静的型の変換をサポートしています。これらのサポートされている型には以下が含まれます。

* 符号付き数値、`Boolean`、`Char` などのプリミティブ型。
* `String`。
* 関数型。

その他の型は不透明な参照（opaque references）として変換なしで渡されていたため、JavaScript と Kotlin のサブタイピングの間で不整合が生じていました。

これに対処するため、Kotlin は JavaScript の相互運用を十分にサポートされた型のセットに制限します。Kotlin 1.9.0 以降、Kotlin/Wasm の JavaScript 相互運用では external 型、プリミティブ型、文字列型、関数型のみがサポートされます。さらに、JavaScript 相互運用で使用できる Kotlin/Wasm オブジェクトへのハンドルを表すために、`JsReference` という別の明示的な型が導入されました。

詳細については、[Kotlin/Wasm と JavaScript の相互運用性](wasm-js-interop.md) のドキュメントを参照してください。

### Kotlin Playground での Kotlin/Wasm {id="kotlin-wasm-in-kotlin-playground"}

Kotlin Playground が Kotlin/Wasm ターゲットをサポートしました。
Kotlin/Wasm をターゲットとする Kotlin コードを作成、実行、共有できます。[ぜひお試しください！](https://pl.kotl.in/HDFAvimga)

> Kotlin/Wasm を使用するには、ブラウザで実験的機能を有効にする必要があります。
>
> [これらの機能を有効にする方法の詳細](wasm-configuration.md)。
>
{style="note"}

```kotlin
import kotlin.time.*
import kotlin.time.measureTime

fun main() {
    println("Hello from Kotlin/Wasm!")
    computeAck(3, 10)
}

tailrec fun ack(m: Int, n: Int): Int = when {
    m == 0 -> n + 1
    n == 0 -> ack(m - 1, 1)
    else -> ack(m - 1, ack(m, n - 1))
}

fun computeAck(m: Int, n: Int) {
    var res = 0
    val t = measureTime {
        res = ack(m, n)
    }
    println()
    println("ack($m, $n) = ${res}")
    println("duration: ${t.inWholeNanoseconds / 1e6} ms")
}
```
{kotlin-runnable="true" id="kotlin-whats-new-1-9-0-kotlin-wasm-playground"}

## Kotlin/JS {id="kotlin-js"}

このリリースでは、古い Kotlin/JS コンパイラの削除、Kotlin/JS Gradle プラグインの非推奨化、ES2015 の試験的サポートなど、Kotlin/JS に関するアップデートが導入されています。

* [古い Kotlin/JS コンパイラの削除](#removal-of-the-old-kotlin-js-compiler)
* [Kotlin/JS Gradle プラグインの非推奨化](#deprecation-of-the-kotlin-js-gradle-plugin)
* [external enum の非推奨化](#deprecation-of-external-enum)
* [ES2015 クラスおよびモジュールの試験的サポート](#experimental-support-for-es2015-classes-and-modules)
* [JS 本番配布物のデフォルト出力先の変更](#changed-default-destination-of-js-production-distribution)
* [stdlib-js からの org.w3c 宣言の切り離し](#extract-org-w3c-declarations-from-stdlib-js)

> バージョン 1.9.0 以降、Kotlin/JS でも [ライブラリの部分リンケージ（partial library linkage）](#library-linkage-in-kotlin-native) が有効になっています。
>
{style="note"}

### 古い Kotlin/JS コンパイラの削除 {id="removal-of-the-old-kotlin-js-compiler"}

Kotlin 1.8.0 で、IR ベースのバックエンドが[安定版（Stable）](components-stability.md)になったことを[発表](whatsnew18.md#stable-js-ir-compiler-backend)しました。それ以降、コンパイラを指定しないことはエラーとなり、古いコンパイラを使用すると警告が表示されるようになっていました。

Kotlin 1.9.0 では、古いバックエンドを使用するとエラーになります。IR コンパイラに移行してください。

### Kotlin/JS Gradle プラグインの非推奨化 {id="deprecation-of-the-kotlin-js-gradle-plugin"}

Kotlin 1.9.0 以降、`kotlin-js` Gradle プラグインは非推奨となります。代わりに `js()` ターゲットを指定した `kotlin-multiplatform` Gradle プラグインを使用することをお勧めします。

Kotlin/JS Gradle プラグインの機能は、基本的に `kotlin-multiplatform` プラグインと重複しており、内部で同じ実装を共有していました。この重複が混乱を生み、Kotlin チームのメンテナンス負荷を増大させていました。

移行手順については、弊社の [Kotlin Multiplatform 互換性ガイド](https://kotlinlang.org/docs/multiplatform/multiplatform-compatibility-guide.html#migration-from-kotlin-js-gradle-plugin-to-kotlin-multiplatform-gradle-plugin) を参照してください。ガイドでカバーされていない問題が見つかった場合は、[課題トラッカー](http://kotl.in/issue) に報告してください。

### external enum の非推奨化 {id="deprecation-of-external-enum"}

Kotlin 1.9.0 では、Kotlin の外部には存在できない `entries` などの静的 enum メンバーの問題により、external enum の使用が非推奨になります。代わりに、object サブクラスを持つ external sealed class を使用することをお勧めします。

```kotlin
// 変更前
external enum class ExternalEnum { A, B }

// 変更後
external sealed class ExternalEnum {
    object A: ExternalEnum
    object B: ExternalEnum
}
```
{validate="false"}

object サブクラスを持つ external sealed class に切り替えることで、デフォルトメソッドに関連する問題を回避しながら、external enum と同様の機能を実現できます。

Kotlin 1.9.0 から、external enum の使用は非推奨としてマークされます。互換性と将来のメンテナンスのために、提案された external sealed class の実装を利用するようにコードを更新することをお勧めします。

### ES2015 クラスおよびモジュールの試験的サポート {id="experimental-support-for-es2015-classes-and-modules"}

このリリースでは、ES2015 モジュールおよび ES2015 クラス生成の[試験的（Experimental）](components-stability.md#stability-levels-explained) サポートが導入されています。
* モジュールは、コードベースを簡素化し保守性を向上させる方法を提供します。
* クラスを使用すると、オブジェクト指向プログラミング（OOP）の原則を取り入れることができ、よりクリーンで直感的なコードになります。

これらの機能を有効にするには、`build.gradle.kts` ファイルを適宜更新します。

```kotlin
// build.gradle.kts
kotlin {
    js(IR) {
        useEsModules() // ES2015 モジュールを有効化
        browser()
    }
}

// ES2015 クラス生成を有効化
tasks.withType<KotlinJsCompile>().configureEach {
    kotlinOptions {
        useEsClasses = true
    }
}
```
{validate="false"}

[ES2015（ECMAScript 2015、ES6）の詳細については、公式ドキュメントを参照してください](https://262.ecma-international.org/6.0/)。

### JS 本番配布物のデフォルト出力先の変更 {id="changed-default-destination-of-js-production-distribution"}

Kotlin 1.9.0 より前は、配布物のターゲットディレクトリは `build/distributions` でした。しかし、これは Gradle アーカイブ共通のディレクトリです。この問題を解決するため、Kotlin 1.9.0 ではデフォルトの配布物ターゲットディレクトリを `build/dist/<targetName>/<binaryName>` に変更しました。

例えば、`productionExecutable` は以前は `build/distributions` にありました。Kotlin 1.9.0 では、`build/dist/js/productionExecutable` に配置されます。

> これらのビルド結果を使用するパイプラインが導入されている場合は、必ずディレクトリを更新してください。
>
{style="warning"}

### stdlib-js からの org.w3c 宣言の切り離し {id="extract-org-w3c-declarations-from-stdlib-js"}

Kotlin 1.9.0 以降、`stdlib-js` には `org.w3c` 宣言が含まれなくなりました。代わりに、これらの宣言は独立した Gradle 依存関係に移動されました。`build.gradle.kts` ファイルに Kotlin Multiplatform Gradle プラグインを追加すると、標準ライブラリと同様に、これらの宣言が自動的にプロジェクトに含まれます。

手動での対応や移行は不要です。必要な調整は自動的に処理されます。

## Gradle {id="gradle"}

Kotlin 1.9.0 には、新しい Gradle コンパイラオプションをはじめ、多くの改善が含まれています。

* [削除された classpath プロパティ](#removed-classpath-property)
* [新しい Gradle コンパイラオプション](#new-compiler-options)
* [Kotlin/JVM 向けのプロジェクトレベルのコンパイラオプション](#project-level-compiler-options-for-kotlin-jvm)
* [Kotlin/Native モジュール名用のコンパイラオプション](#compiler-option-for-kotlin-native-module-name)
* [公式 Kotlin ライブラリ用の独立したコンパイラプラグイン](#separate-compiler-plugins-for-official-kotlin-libraries)
* [最小サポートバージョンの引き上げ](#incremented-minimum-supported-version)
* [kapt が Gradle でタスクを早期生成（eager creation）しないように改善](#kapt-doesn-t-cause-eager-task-creation-in-gradle)
* [JVM ターゲット検証モードのプログラムによる設定](#programmatic-configuration-of-the-jvm-target-validation-mode)

### 削除された classpath プロパティ {id="removed-classpath-property"}

Kotlin 1.7.0 で、`KotlinCompile` タスクのプロパティである `classpath` の非推奨化サイクルを開始することを発表しました。Kotlin 1.8.0 で非推奨レベルが `ERROR` に引き上げられました。このリリースで、ついに `classpath` プロパティが削除されました。すべてのコンパイルタスクは、コンパイルに必要なライブラリのリストとして `libraries` 入力を使用するようになりました。

### 新しいコンパイラオプション {id="new-compiler-options"}

Kotlin Gradle プラグインは、オプトインおよびコンパイラのプログレッシブモード（progressive mode）用の新しいプロパティを提供するようになりました。

* 新しい API にオプトインするには、`optIn` プロパティを使用して `optIn.set(listOf(a, b, c))` のように文字列のリストを渡すことができるようになりました。
* プログレッシブモードを有効にするには、`progressiveMode.set(true)` を使用します。

### Kotlin/JVM 向けのプロジェクトレベルのコンパイラオプション {id="project-level-compiler-options-for-kotlin-jvm"}

Kotlin 1.9.0 以降、`kotlin` 設定ブロック内で新しい `compilerOptions` ブロックが使用できるようになりました。

```kotlin
kotlin {
    compilerOptions {
        jvmTarget.set(JVM.Target_11)
    }
}
```
{validate="false"}

これにより、コンパイラオプションの設定がはるかに簡単になります。ただし、いくつかの重要な点に注意が必要です。

* この設定はプロジェクトレベルでのみ機能します。
* Android プラグインの場合、このブロックは以下と同じオブジェクトを設定します。

```kotlin
android {
    kotlinOptions {}
}
```
{validate="false"}

* `android.kotlinOptions` と `kotlin.compilerOptions` の設定ブロックは互いに上書きし合います。ビルドファイル内で最後（最も下）にあるブロックが常に有効になります。
* プロジェクトレベルで `moduleName` が設定されている場合、コンパイラに渡される際にその値が変更される可能性があります。`main` コンパイルの場合は変更されませんが、テストソースなどの他のタイプの場合、Kotlin Gradle プラグインによって `_test` サフィックスが追加されます。
* `tasks.withType<KotlinJvmCompile>().configureEach {}`（または `tasks.named<KotlinJvmCompile>("compileKotlin") { }`）内の設定は、`kotlin.compilerOptions` と `android.kotlinOptions` の両方を上書きします。

### Kotlin/Native モジュール名用のコンパイラオプション {id="compiler-option-for-kotlin-native-module-name"}

Kotlin/Native の [`module-name`](compiler-reference.md#module-name-name-native) コンパイラオプションが、Kotlin Gradle プラグインで簡単に利用できるようになりました。

このオプションはコンパイルモジュールの名前を指定し、Objective-C にエクスポートされる宣言の名前プレフィックスを追加するためにも使用できます。

Gradle ビルドファイルの `compilerOptions` ブロックで直接モジュール名を設定できるようになりました。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.named<org.jetbrains.kotlin.gradle.tasks.KotlinNativeCompile>("compileKotlinLinuxX64") {
    compilerOptions {
        moduleName.set("my-module-name")
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
tasks.named("compileKotlinLinuxX64", org.jetbrains.kotlin.gradle.tasks.KotlinNativeCompile.class) {
    compilerOptions {
        moduleName = "my-module-name"
    }
}
```

</tab>
</tabs>

### 公式 Kotlin ライブラリ用の独立したコンパイラプラグイン {id="separate-compiler-plugins-for-official-kotlin-libraries"}

Kotlin 1.9.0 では、公式ライブラリ用のコンパイラプラグインが独立して提供されるようになりました。以前は、コンパイラプラグインは対応する Gradle プラグインに組み込まれていました。そのため、コンパイラプラグインが Gradle ビルドの Kotlin ランタイムバージョンよりも高い Kotlin バージョンでコンパイルされていた場合に、互換性の問題が発生することがありました。

現在、コンパイラプラグインは個別の依存関係として追加されるため、古い Gradle バージョンとの互換性の問題に直面することはなくなりました。新しいアプローチのもう 1 つの大きな利点は、新しいコンパイラプラグインを [Bazel](https://bazel.build/) などの他のビルドシステムでも使用できることです。

Maven Central に現在公開されている新しいコンパイラプラグインのリストは以下のとおりです。

* kotlin-atomicfu-compiler-plugin
* kotlin-allopen-compiler-plugin
* kotlin-lombok-compiler-plugin
* kotlin-noarg-compiler-plugin
* kotlin-sam-with-receiver-compiler-plugin
* kotlinx-serialization-compiler-plugin

すべてのプラグインに対応する `-embeddable` 版があります。例えば、`kotlin-allopen-compiler-plugin-embeddable` は、スクリプトアーティファクトのデフォルトオプションである `kotlin-compiler-embeddable` アーティファクトと連携するように設計されています。

Gradle はこれらのプラグインをコンパイラ引数として追加します。既存のプロジェクトに変更を加える必要はありません。

### 最小サポートバージョンの引き上げ {id="incremented-minimum-supported-version"}

Kotlin 1.9.0 以降、サポートされる最小の Android Gradle プラグインのバージョンは 4.2.2 です。

利用可能な Gradle バージョンに対する [Kotlin Gradle プラグインの互換性についてはドキュメント](gradle-configure-project.md#apply-the-plugin) を参照してください。

### kapt が Gradle でタスクを早期生成しないように改善 {id="kapt-doesn-t-cause-eager-task-creation-in-gradle"}

1.9.0 より前は、[kapt コンパイラプラグイン](kapt.md) が Kotlin コンパイルタスクの設定済みインスタンスを要求することにより、タスクが即座に生成（eager creation）されていました。この動作は Kotlin 1.9.0 で修正されました。`build.gradle.kts` ファイルにデフォルトの設定を使用している場合、この変更による影響はありません。

> カスタム構成を使用している場合、セットアップが悪影響を受ける可能性があります。
> 例えば、Gradle の tasks API を使用して `KotlinJvmCompile` タスクを変更している場合は、ビルドスクリプト内の `KaptGenerateStubs` タスクも同様に変更する必要があります。
>
> 例えば、スクリプトに `KotlinJvmCompile` タスクに対する以下の設定がある場合:
> ```kotlin
> tasks.named<KotlinJvmCompile>("compileKotlin") { // カスタム設定 }
> ```
> {validate="false"}
>
> この場合、`KaptGenerateStubs` タスクの一部としても同じ変更が含まれていることを確認する必要があります。
> ```kotlin
> tasks.named<KaptGenerateStubs>("kaptGenerateStubs") { // カスタム設定 }
>```
> {validate="false"}
> 
{style="warning"}

詳細については、[YouTrack のチケット](https://youtrack.jetbrains.com/issue/KT-54468/KAPT-Gradle-plugin-causes-eager-task-creation) を参照してください。

### JVM ターゲット検証モードのプログラムによる設定 {id="programmatic-configuration-of-the-jvm-target-validation-mode"}

Kotlin 1.9.0 より前は、Kotlin と Java 間の JVM ターゲットの非互換性の検出を調整する方法は 1 つしかありませんでした。プロジェクト全体に対して `gradle.properties` で `kotlin.jvm.target.validation.mode=ERROR` を設定する必要がありました。

`build.gradle.kts` ファイル内のタスクレベルでも設定できるようになりました。

```kotlin
tasks.named<org.jetbrains.kotlin.gradle.tasks.KotlinJvmCompile>("compileKotlin") {
    jvmTargetValidationMode.set(org.jetbrains.kotlin.gradle.dsl.jvm.JvmTargetValidationMode.WARNING)
}
```
{validate="false"}

## 標準ライブラリ {id="standard-library"}

Kotlin 1.9.0 には、標準ライブラリに関する優れた改善がいくつか含まれています。
* [`..<` 演算子](#stable-operator-for-open-ended-ranges) と [time API](#stable-time-api) が安定版（Stable）になりました。
* [Kotlin/Native 標準ライブラリが徹底的に見直され、更新されました](#the-kotlin-native-standard-library-s-journey-towards-stabilization)
* [`@Volatile` アノテーションがより多くのプラットフォームで使用できるようになりました](#stable-volatile-annotation)
* [名前で正規表現キャプチャグループを取得する**共通**関数が追加されました](#new-common-function-to-get-regex-capture-group-by-name)
* [16進数をフォーマットおよびパースするための `HexFormat` クラスが導入されました](#new-hexformat-class-to-format-and-parse-hexadecimals)

### オープンエンド範囲のための安定版 ..< 演算子 {id="stable-operator-for-open-ended-ranges"}

[Kotlin 1.7.20](whatsnew1720.md#preview-of-the-operator-for-creating-open-ended-ranges) で導入され、1.8.0 で安定化したオープンエンド範囲（open-ended ranges）用の新しい `..<` 演算子ですが、1.9.0 では、オープンエンド範囲を操作するための標準ライブラリ API も安定版（Stable）になりました。

調査によると、新しい `..<` 演算子を使用すると、オープンエンド範囲が宣言されていることが理解しやすくなります。[`until`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/until.html) 中置関数を使用すると、上限が含まれていると誤解しがちです。

以下は `until` 関数を使用した例です。

```kotlin
fun main() {
    for (number in 2 until 10) {
        if (number % 2 == 0) {
            print("$number ")
        }
    }
    // 2 4 6 8
}
```
{validate="false"}

そして、以下が新しい `..<` 演算子を使用した例です。

```kotlin
fun main() {
    for (number in 2..<10) {
        if (number % 2 == 0) {
            print("$number ")
        }
    }
    // 2 4 6 8
}
```
{validate="false"}

> IntelliJ IDEA バージョン 2023.1.1 以降では、`..<` 演算子を使用できる箇所をハイライトする新しいコードインスペクションが利用可能です。
>
{style="note"}

この演算子で何ができるかの詳細については、[Kotlin 1.7.20 の新機能](whatsnew1720.md#preview-of-the-operator-for-creating-open-ended-ranges) を参照してください。

### 安定版 time API {id="stable-time-api"}

1.3.50 以降、新しい時間計測 API のプレビューを提供してきました。API の期間（duration）部分は 1.6.0 で安定版になりました。1.9.0 では、残りの時間計測 API も安定版（Stable）になりました。

以前の time API では `measureTimeMillis` 関数と `measureNanoTime` 関数が提供されていましたが、これらは直感的に使用できるものではありませんでした。どちらも異なる単位で時間を測定することは明確ですが、`measureTimeMillis` が時間の測定に[実時間（wall clock）](https://en.wikipedia.org/wiki/Elapsed_real_time) を使用しているのに対し、`measureNanoTime` は単調増加時間ソース（monotonic time source）を使用していることが明確ではありませんでした。新しい time API は、これらやその他の問題を解決し、API をよりユーザーフレンドリーにしています。

新しい time API を使用すると、以下が簡単に実行できます。
* 単調増加時間ソースを使用して、目的の時間単位でコードの実行にかかった時間を測定する。
* ある時点をマークする。
* 2 つの時点を比較し、その差を求める。
* 特定の時点からどれだけの時間が経過したかを確認する。
* 現在時刻が特定の時点を過ぎたかどうかを確認する。

#### コード実行時間の測定 {id="measure-code-execution-time"}

コードブロックの実行にかかった時間を測定するには、[`measureTime`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/measure-time.html) インライン関数を使用します。

コードブロックの実行にかかった時間を測定し、**かつ**そのコードブロックの結果を返すには、[`measureTimedValue`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/measure-timed-value.html) インライン関数を使用します。

デフォルトでは、両方の関数とも単調増加時間ソースを使用します。ただし、経過実時間（elapsed real-time）ソースを使用したい場合は、それも可能です。
例えば、Android ではデフォルトの時間ソース `System.nanoTime()` はデバイスがアクティブな間のみ時間をカウントします。デバイスがディープスリープに入ると時間の追跡が失われます。デバイスがディープスリープ中も時間を追跡するには、代わりに [`SystemClock.elapsedRealtimeNanos()`](https://developer.android.com/reference/android/os/SystemClock#elapsedRealtimeNanos()) を使用する時間ソースを作成できます。

```kotlin
object RealtimeMonotonicTimeSource : AbstractLongTimeSource(DurationUnit.NANOSECONDS) {
    override fun read(): Long = SystemClock.elapsedRealtimeNanos()
}
```
{validate="false"}

#### 時間差のマークと測定 {id="mark-and-measure-differences-in-time"}

特定の時点をマークするには、[`TimeSource`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-source/) インターフェースと [`markNow()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-source/mark-now.html) 関数を使用して [`TimeMark`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-mark/) を作成します。同じ時間ソースからの `TimeMark` 間の差を測定するには、減算演算子（`-`）を使用します。

```kotlin
import kotlin.time.*

fun main() {
    val timeSource = TimeSource.Monotonic
    val mark1 = timeSource.markNow()
    Thread.sleep(500) // 0.5秒スリープ
    val mark2 = timeSource.markNow()

    repeat(4) { n ->
        val mark3 = timeSource.markNow()
        val elapsed1 = mark3 - mark1
        val elapsed2 = mark3 - mark2

        println("Measurement 1.${n + 1}: elapsed1=$elapsed1, elapsed2=$elapsed2, diff=${elapsed1 - elapsed2}")
    }
    // タイムマーク同士を比較することも可能です。
    println(mark2 > mark1) // mark2 は mark1 より後に取得されたため true になります。
}
```
{kotlin-runnable="true" id="kotlin-whats-new-time-elapsed"}

期限が過ぎたか、またはタイムアウトに達したかを確認するには、[`hasPassedNow()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-mark/has-passed-now.html) および [`hasNotPassedNow()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-mark/has-not-passed-now.html) 拡張関数を使用します。

```kotlin
import kotlin.time.*
import kotlin.time.Duration.Companion.seconds

fun main() {
    val timeSource = TimeSource.Monotonic
    val mark1 = timeSource.markNow()
    val fiveSeconds: Duration = 5.seconds
    val mark2 = mark1 + fiveSeconds

    // まだ5秒経過していません
    println(mark2.hasPassedNow())
    // false

    // 6秒待機
    Thread.sleep(6000)
    println(mark2.hasPassedNow())
    // true
}
```
{kotlin-runnable="true" id="kotlin-whats-new-time-passednow"}

### Kotlin/Native 標準ライブラリの安定化への歩み {id="the-kotlin-native-standard-library-s-journey-towards-stabilization"}

Kotlin/Native の標準ライブラリが成長を続ける中、高い基準を満たしていることを確認するために完全な見直しを行う時期が来たと判断しました。この一環として、既存の**すべての**パブリックシグネチャを慎重にレビューしました。各シグネチャについて、以下の観点を検討しました。

* 独自の目的を持っているか。
* 他の Kotlin API と一貫性があるか。
* JVM 向けの対応するものと同様の動作をするか。
* 将来性があるか。

これらの考慮事項に基づき、以下の決定のいずれかを下しました。
* 安定版（Stable）にする。
* 試験的（Experimental）にする。
* `private` としてマークする。
* その動作を変更する。
* 別の場所に移動する。
* 非推奨にする。
* 廃止予定（obsolete）としてマークする。

> 既存のシグネチャが以下のようになった場合:
> * 別のパッケージに移動された場合、そのシグネチャは元のパッケージにも残りますが、非推奨レベル `WARNING` で非推奨になります。IntelliJ IDEA はコードインスペクション時に代替案を自動的に提案します。
> * 非推奨にされた場合、非推奨レベル `WARNING` で非推奨になります。
> * 廃止予定（obsolete）としてマークされた場合、引き続き使用できますが、将来置き換えられる予定です。
>
{style="note"}

レビューの結果をすべてここに記載することはしませんが、主なハイライトは以下のとおりです。
* Atomics API を安定化しました。
* [`kotlinx.cinterop`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlinx.cinterop/) を試験的（Experimental）にし、パッケージを使用するために異なるオプトインを要求するようにしました。詳細については、[明示的な C 相互運用の安定性保証](#explicit-c-interoperability-stability-guarantees) を参照してください。
* [`Worker`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.native.concurrent/-worker/) クラスおよびその関連 API を廃止予定としてマークしました。
* [`BitSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.native/-bit-set/) クラスを廃止予定としてマークしました。
* `kotlin.native.internal` パッケージ内のすべての `public` API を `private` としてマークするか、他のパッケージに移動しました。

#### 明示的な C 相互運用の安定性保証 {id="explicit-c-interoperability-stability-guarantees"}

API の高品質を維持するため、[`kotlinx.cinterop`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlinx.cinterop/) を試験的（Experimental）にすることにしました。`kotlinx.cinterop` は徹底的に試用およびテストされてきましたが、安定版にするにはまだ改善の余地があります。相互運用にはこの API を使用することをお勧めしますが、プロジェクト内の特定の領域にその使用を限定することをお勧めします。そうすることで、この API を安定版へと進化させ始めた際の移行が容易になります。

ポインタなどの C 言語風の外部 API を使用する場合は、`@OptIn(ExperimentalForeignApi)` でオプトインする必要があります。そうしないとコードがコンパイルされません。

Objective-C/Swift の相互運用性をカバーする `kotlinx.cinterop` の残りの部分を使用するには、`@OptIn(BetaInteropApi)` でオプトインする必要があります。オプトインなしでこの API を使用しようとすると、コードはコンパイルされますが、期待される動作を明確に説明する警告がコンパイラから出力されます。

これらのアノテーションの詳細については、[`Annotations.kt` のソースコード](https://github.com/JetBrains/kotlin/blob/master/kotlin-native/Interop/Runtime/src/main/kotlin/kotlinx/cinterop/Annotations.kt) を参照してください。

このレビューに伴う**すべての**変更の詳細については、弊社の [YouTrack チケット](https://youtrack.jetbrains.com/issue/KT-55765) を参照してください。

フィードバックをお待ちしております！[チケット](https://youtrack.jetbrains.com/issue/KT-57728) にコメントすることで、直接フィードバックを提供できます。

### 安定版 @Volatile アノテーション {id="stable-volatile-annotation"}

`var` プロパティに `@Volatile` アノテーションを付加すると、バッキングフィールドがマークされ、このフィールドへの読み書きがアトミックになり、書き込みは常に他のスレッドから見えるようになります。

1.8.20 より前は、共通の標準ライブラリで [`kotlin.jvm.Volatile` アノテーション](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-volatile/) が利用可能でした。ただし、このアノテーションは JVM 上でのみ有効でした。他のプラットフォームで使用すると無視され、エラーにつながっていました。

1.8.20 では、試験的な共通アノテーションである `kotlin.concurrent.Volatile` を導入し、JVM と Kotlin/Native の両方でプレビューできるようにしました。

1.9.0 では、`kotlin.concurrent.Volatile` が安定版（Stable）になりました。マルチプラットフォームプロジェクトで `kotlin.jvm.Volatile` を使用している場合は、`kotlin.concurrent.Volatile` への移行をお勧めします。

### 名前で正規表現キャプチャグループを取得する新しい共通関数 {id="new-common-function-to-get-regex-capture-group-by-name"}

1.9.0 より前は、正規表現マッチから名前で正規表現キャプチャグループを取得するための拡張機能が各プラットフォームごとに存在していました。しかし、共通の関数はありませんでした。Kotlin 1.8.0 より前は、標準ライブラリがまだ JVM ターゲット 1.6 および 1.7 をサポートしていたため、共通関数を用意することができませんでした。

Kotlin 1.8.0 以降、標準ライブラリは JVM ターゲット 1.8 でコンパイルされるようになりました。そのため 1.9.0 では、正規表現マッチにおいて名前でグループの内容を取得するために使用できる**共通**の [`groups`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-match-result/groups.html) 関数が利用可能になりました。これは、特定のキャプチャグループに属する正規表現マッチの結果にアクセスしたい場合に便利です。

以下は、`city`、`state`、`areaCode` という 3 つのキャプチャグループを含む正規表現の例です。これらのグループ名を使用して、マッチした値にアクセスできます。

```kotlin
fun main() {
    val regex = """\b(?<city>[A-Za-z\s]+),\s(?<state>[A-Z]{2}):\s(?<areaCode>[0-9]{3})\b""".toRegex()
    val input = "Coordinates: Austin, TX: 123"
    
    val match = regex.find(input)!!
    println(match.groups["city"]?.value)
    // Austin
    println(match.groups["state"]?.value)
    // TX
    println(match.groups["areaCode"]?.value)
    // 123
}
```
{validate="false"}

### 親ディレクトリを作成する新しいパスクラスのユーティリティ {id="new-path-utility-to-create-parent-directories"}

1.9.0 では、必要なすべての親ディレクトリとともに新しいファイルを作成するために使用できる新しい `createParentDirectories()` 拡張関数が追加されました。`createParentDirectories()` にファイルパスを渡すと、親ディレクトリがすでに存在するかどうかを確認します。存在する場合は何もしません。しかし、存在しない場合は自動的に作成します。

`createParentDirectories()` は、ファイルをコピーする際に特に便利です。例えば、`copyToRecursively()` 関数と組み合わせて使用できます。

 ```kotlin
sourcePath.copyToRecursively(
    destinationPath.createParentDirectories(), 
    followLinks = false
 )
 ```
{validate="false"}

### 16進数をフォーマットおよびパースするための新しい HexFormat クラス {id="new-hexformat-class-to-format-and-parse-hexadecimals"}

> 新しい `HexFormat` クラスおよびその関連拡張関数は[試験的（Experimental）](components-stability.md#stability-levels-explained) であり、使用するには `@OptIn(ExperimentalStdlibApi::class)` またはコンパイラ引数 `-opt-in=kotlin.ExperimentalStdlibApi` でオプトインできます。
>
{style="warning"}

1.9.0 では、数値と16進数文字列の間で相互変換できるようにする試験的機能として、[`HexFormat`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-hex-format/) クラスおよびその関連拡張関数が提供されています。具体的には、拡張関数を使用して、16進数文字列と `ByteArray` またはその他の数値型（`Int`、`Short`、`Long`）との間で変換を行うことができます。

例:

```kotlin
println(93.toHexString()) // "0000005d"
```
{validate="false"}

`HexFormat` クラスには、`HexFormat{}` ビルダーで設定できるフォーマットオプションが含まれています。

`ByteArray` を扱う場合、プロパティによって設定可能な以下のオプションがあります。

| オプション | 説明 |
|--|--|
| `upperCase` | 16進数の文字を大文字にするか小文字にするか。デフォルトでは小文字とみなされます。`upperCase = false`。 |
| `bytes.bytesPerLine` | 1行あたりの最大バイト数。 |
| `bytes.bytesPerGroup` | 1グループあたりの最大バイト数。 |
| `bytes.bytesSeparator` | バイト間の区切り文字。デフォルトではなし。 |
| `bytes.bytesPrefix` | 各バイトの2桁の16進数表現の直前に置く文字列。デフォルトではなし。 |
| `bytes.bytesSuffix` | 各バイトの2桁の16進数表現の直後に置く文字列。デフォルトではなし。 |

例:

```kotlin
val macAddress = "001b638445e6".hexToByteArray()

// HexFormat{} ビルダーを使用して16進数文字列をコロンで区切る
println(macAddress.toHexString(HexFormat { bytes.byteSeparator = ":" }))
// "00:1b:63:84:45:e6"

// HexFormat{} ビルダーを使用して以下を行う:
// * 16進数文字列を大文字にする
// * バイトを2つずつのペアにグループ化する
// * ピリオドで区切る
val threeGroupFormat = HexFormat { upperCase = true; bytes.bytesPerGroup = 2; bytes.groupSeparator = "." }

println(macAddress.toHexString(threeGroupFormat))
// "001B.6384.45E6"
```
{validate="false"}

数値型を扱う場合、プロパティによって設定可能な以下のオプションがあります。

| オプション | 説明 |
|--|--|
| `number.prefix` | 16進数文字列のプレフィックス。デフォルトではなし。 |
| `number.suffix` | 16進数文字列のサフィックス。デフォルトではなし。 |
| `number.removeLeadingZeros` | 16進数文字列内の先頭のゼロを削除するかどうか。デフォルトでは先頭のゼロは削除されません。`number.removeLeadingZeros = false` |

例:

```kotlin
// HexFormat{} ビルダーを使用してプレフィックス "0x" を持つ16進数をパースする
println("0x3a".hexToInt(HexFormat { number.prefix = "0x" })) // "58"
```
{validate="false"}

## ドキュメントの更新 {id="documentation-updates"}

Kotlin のドキュメントにいくつかの注目すべき変更が加えられました。
* [Kotlin ツアー](kotlin-tour-welcome.md) – 理論と実践の両方を含むチャプターで Kotlin プログラミング言語の基礎を学びます。
* [Android ソースセットレイアウト](https://kotlinlang.org/docs/multiplatform/multiplatform-android-layout.html) – 新しい Android ソースセットレイアウトについて学びます。
* [Kotlin Multiplatform 互換性ガイド](https://kotlinlang.org/docs/multiplatform/multiplatform-compatibility-guide.html) – Kotlin Multiplatform でプロジェクトを開発する際に遭遇する可能性のある、互換性のない変更について学びます。
* [Kotlin Wasm](wasm-overview.md) – Kotlin/Wasm と、それを Kotlin Multiplatform プロジェクトで使用する方法について学びます。

## Kotlin 1.9.0 のインストール {id="install-kotlin-1-9-0"}

### IDE バージョンの確認 {id="check-the-ide-version"}

[IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 2022.3.3 および 2023.1.1 では、Kotlin プラグインをバージョン 1.9.0 に更新することが自動的に提案されます。IntelliJ IDEA 2023.2 には Kotlin 1.9.0 プラグインが含まれる予定です。

Android Studio Giraffe (223) および Hedgehog (231) は、今後のリリースで Kotlin 1.9.0 をサポートする予定です。

新しいコマンドラインコンパイラは、[GitHub のリリースページ](https://github.com/JetBrains/kotlin/releases/tag/v1.9.0) からダウンロードできます。

### Gradle 設定の構成 {id="configure-gradle-settings"}

Kotlin のアーティファクトと依存関係をダウンロードするには、Maven Central リポジトリを使用するように `settings.gradle(.kts)` ファイルを更新します。

```kotlin
pluginManagement {
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
}
```
{validate="false"}

リポジトリが指定されていない場合、Gradle はサービス終了（sunset）となった JCenter リポジトリを使用するため、Kotlin アーティファクトで問題が発生する可能性があります。

## Kotlin 1.9.0 互換性ガイド {id="compatibility-guide-for-kotlin-1-9-0"}

Kotlin 1.9.0 は機能リリースであるため、以前の言語バージョン向けに書かれたコードと互換性のない変更がもたらされる可能性があります。これらの変更の詳細なリストについては、[Kotlin 1.9.0 互換性ガイド](compatibility-guide-19.md) を参照してください。