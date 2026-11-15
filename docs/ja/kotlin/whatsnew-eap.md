[//]: # (title: Kotlin %kotlinEapVersion% の新機能)

<primary-label ref="eap"/>

<show-structure depth="1"/>

<web-summary>Kotlin Early Access Preview（EAP）のリリースノートを読み、正式リリース前に最新の実験的Kotlin機能をお試しください。</web-summary>

_[リリース日: %kotlinEapReleaseDate%](eap.md#build-details)_

> このドキュメントは Early Access Preview（EAP）リリースのすべての機能を網羅しているわけではありませんが、
> 主要な改善点をいくつかハイライトしています。
>
> 変更の完全なリストについては、[GitHub のチェンジログ](https://github.com/JetBrains/kotlin/releases/tag/v%kotlinEapVersion%)を参照してください。
>
{style="note"}

Kotlin %kotlinEapVersion% がリリースされました！ この EAP リリースの詳細は以下のとおりです：

* **言語**: [`only-syntax` モードでの安定した名前ベースの分割代入、未使用の戻り値チェッカー、改善されたコンパイル時定数](#stable-language-features)。
* **標準ライブラリ**: [`if` 式を用いた一般的なパターンを簡潔にする新しい実験的関数](#new-functions-for-simplifying-common-patterns-with-if-expressions)、および [Unicode コードポイントの実験的サポート](#support-for-unicode-code-points)。
* **Kotlin/JVM**: [Java 28 のサポート](#kotlin-jvm)。
* **Kotlin/Native**: [新しい DSL を備えた Swift エクスポートの Beta 版](#swift-export-goes-beta-with-a-new-gradle-dsl)。
* **Kotlin Multiplatform**: [Kotlin Multiplatform 向けの新しい実験的コンパイルスキーム](#new-experimental-compilation-scheme-for-kotlin-multiplatform)、および [マルチプラットフォームライブラリ向けの新しいパブリケーション形式](#new-publication-format-for-kotlin-multiplatform-libraries)。
* **Kotlin/JS**: [`es2020` ターゲットのサポート](#kotlin-js)。
* **Kotlin コンパイラ**: [`klib` コンパイル時におけるインライン関数の挙動のさらなる一貫性向上](#consistent-cross-module-function-inlining-during-klib-compilation)。

> Kotlin のリリースサイクルの詳細については、[Kotlin のリリースプロセス](releases.md)を参照してください。
>
{style="tip"}

## Kotlin %kotlinEapVersion% へのアップデート {id="update-to-kotlin-kotlineapversion"}

Kotlin の最新バージョンは、最新バージョンの [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) および [Android Studio](https://developer.android.com/studio) に含まれています。

新しい Kotlin バージョンにアップデートするには、IDE が最新バージョンに更新されていることを確認し、ビルドスクリプトで [Kotlin のバージョンを %kotlinEapVersion% に変更](releases.md#update-to-a-new-kotlin-version) してください。

## 言語 (Language) {id="language"}

Kotlin %kotlinEapVersion% では、以前のリリースで導入された複数の言語機能が安定化（Stable）しました。また、実験的（Experimental）なコンパニオン拡張（companion extensions）やコンパニオンブロック（companion blocks）、フルバリュークラス（full value classes）も導入されています。

### 安定化した言語機能 {id="stable-language-features"}

<secondary-label ref="language"/>

Kotlin 2.3.0〜2.4.0 では、いくつかの言語機能が[実験的（Experimental）](components-stability.md#stability-levels-explained)として導入されました。今回のリリースでは、以下の言語機能が[安定（Stable）](components-stability.md#stability-levels-explained)となったことをお知らせします：

* [改善されたコンパイル時定数](whatsnew24.md#improved-compile-time-constants)。

* オプショナルパラメータに対してバージョンベースのオーバーロードを生成する [`@IntroducedAt` アノテーション](whatsnew24.md#new-introducedat-annotation-to-generate-version-based-overloads-for-optional-parameters)。

* デフォルトで有効化された[未使用の戻り値チェッカー](whatsnew23.md#unused-return-value-checker)。

* デフォルトとなった `only-syntax` モードでの[名前ベースの分割代入（Name-based destructuring）](destructuring-declarations.md#name-based-destructuring)。

  このモードでは、従来の分割代入構文 `val (x, y)` は位置ベースの挙動を維持し、新しい構文 `(val x, val y)` は名前ベースの分割代入を実行します。この機能の概要は以下の動画で確認できます：

  <video src="https://www.youtube.com/v/He8J34KHEY4" title="Kotlin's Name-Based Destructuring"/>

### コンパニオン拡張とコンパニオンブロック {id="companion-extensions-and-blocks"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="language"/>

Kotlin %kotlinEapVersion% では、コンパニオン拡張（companion extensions）とコンパニオンブロック（companion blocks）が導入されました。

以前は、型の名前を通じてアクセスできる拡張、関数、プロパティを宣言するには、その型がコンパニオンオブジェクト（companion object）を持っている必要がありました。コンパニオン拡張とブロックによりこの要件が不要になり、以下のことが可能になります：

* 拡張元の型にコンパニオンオブジェクトが存在しない場合でも、トップレベルの拡張に `companion` 修飾子を追加してコンパニオン拡張を宣言する。
* クラスやインターフェース内の `companion {}` ブロックで、オブジェクトインスタンスを作成することなく関数やプロパティを宣言する。静的メンバーをサポートするプラットフォームでは、コンパイラはこれらの宣言を静的メンバーとして生成します。その結果、JVM 上で `@JvmStatic` を付与する必要がなくなります。

以下は、`UnitX` をコンパニオン拡張として宣言し、`Zero` をコンパニオンブロック内で宣言する例です：

```kotlin
// UnitX をコンパニオン拡張として宣言
companion val Vector.UnitX get() = Vector(1.0, 0.0)

data class Vector(val x: Double, val y: Double) {
    companion {
        // Zero をコンパニオンブロック内で宣言
        val Zero: Vector get() = Vector(0.0, 0.0)
    }
}

fun main() {
    println(Vector.UnitX)
    // Vector(x=1.0, y=0.0)

    println(Vector.Zero)
    // Vector(x=0.0, y=0.0)
}
```

設計の詳細については、この機能の [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0449-companions-block-extension.md) を参照してください。また、[ブログ記事](https://blog.jetbrains.com/kotlin/2026/09/the-companions-to-come/)でもこの機能について確認できます。

コンパニオン拡張とブロックは[実験的（Experimental）](components-stability.md#stability-levels-explained)です。オプトインするには、ビルドファイルに以下のコンパイラオプションを追加してください：

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xcompanion-blocks-and-extensions")
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
                    <arg>-Xcompanion-blocks-and-extensions</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

フィードバックは [YouTrack](https://youtrack.jetbrains.com/issue/KT-11968) にお寄せください。

### フルバリュークラス {id="full-value-classes"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="language"/>

Kotlin %kotlinEapVersion% より前は、[インラインバリュークラス](inline-classes.md)によって単一の値をラップするカスタム型を作成できました。型に複数のプロパティが必要な場合は、通常のクラスやデータクラス（data class）を使用する必要がありました。しかしそれらのクラスでは、同じデータを保持する2つのインスタンスであっても参照によって区別されてしまいます（その型にとってその区別に意味がない場合であっても）。これにより、ランタイムの最適化が制限され、同じオブジェクト参照が保持されているかどうかにコードが不必要に依存してしまう可能性がありました。

Kotlin %kotlinEapVersion% では、プロパティの組み合わせ自体が値を構成し、個々のインスタンスの同一性（identity）が問題とならない型を定義できる、実験的なフルバリュークラス（full value classes）が導入されました。例えば、実部と虚部のプロパティを持つ複素数を表すフルバリュークラス `Complex` を宣言できます：

```kotlin
value class Complex(val real: Double, val imaginary: Double)
```

コンパイラは、データクラスと同様にフルバリュークラスに対して `equals()`、`hashCode()`、`toString()` 関数を自動生成します。ただし、以下の違いがあります：

* `componentN()` 関数はありません。代わりに[名前ベースの分割代入](destructuring-declarations.md#name-based-destructuring)を使用できます（オプトインは不要です）。
* `copy()` 関数はありません。将来的には、代わりに `copy vars` を使用できるようになります。詳細については [KT-44653](https://youtrack.jetbrains.com/issue/KT-44653) を参照してください。

データクラスとの違いについての詳細は、KEEP の[継承に関するセクション](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0454-better-immutability-value-classes-MFVC.md#mfvc-and-inheritance)を参照してください。

#### 抽象バリュークラス {id="abstract-value-classes"}

フルバリュークラスは抽象（abstract）にすることができます。[インターフェース](interfaces.md)とは異なり、構築時にすべてのサブクラスで実行される初期化ロジックを定義できます。

例えば、`OrderedInterval` バリュークラスはコンストラクタパラメータとして `start` と `end` を受け取ります。`IntInterval` バリュークラスは、その値を `start` プロパティと `end` プロパティに格納します。

```kotlin
sealed value class OrderedInterval<T : Comparable<T>> protected constructor(
    start: T,
    end: T,
) {
    init {
        require(start <= end)
    }
}

value class IntInterval(
    val start: Int,
    val end: Int
) : OrderedInterval<Int>(start, end)
```

詳細については、KEEP の[継承に関するセクション](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0454-better-immutability-value-classes-MFVC.md#mfvc-and-inheritance)を参照してください。

#### バリューオブジェクト {id="value-objects"}

フルバリュークラスはプロパティを持たないことも可能です。これらは*バリューオブジェクト（value objects）*と呼ばれ、状態やトークンなど、同一性を持たず値が1つしか存在し得ない型を表すのに役立ちます。例えば以下のようになります：

```kotlin
sealed interface UserResponse

value class UserFound(val user: User) : UserResponse
value object UserUnknown : UserResponse
```

詳細については、KEEP の[バリューオブジェクトに関するセクション](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0454-better-immutability-value-classes-MFVC.md#value-objects)を参照してください。

#### 有効化する方法 {id="how-to-enable"}

この機能は[実験的（Experimental）](components-stability.md#stability-levels-explained)です。オプトインするには、ビルドファイルに以下のコンパイラオプションを追加してください：

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xfull-value-classes")
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
                    <arg>-Xfull-value-classes</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

### 構造クラスにおける等価性比較のチェック改善 {id="improved-checks-for-equality-comparisons-on-structural-classes"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="language"/>

Kotlin %kotlinEapVersion% では、データクラス、データオブジェクト、final なバリュークラス、enum クラス（これらを総称して*構造クラス（structural classes）*と呼びます）が関与する等価性比較の追加分析が導入されました。

コンパイラはこれらのクラスに対して厳格な等価性チェックを行い、オペランドの既知の型に基づいて、`==` で常に `false` を返すか、`!=` で常に `true` を返す比較を報告します。これらのチェックは、両方のクラスが同じプロパティを持っている場合であっても、ベクトルとポイントを比較してしまうような間違いを検出するのに役立ちます：

```kotlin
data class Point(val x: Double, val y: Double) {
    companion object {
        val ZERO: Point = Point(0.0, 0.0)
    }
}

data class Vector(val x: Double, val y: Double)

fun normalize(v: Vector) {
    if (v == Point.ZERO) {
        // 診断: この比較は常に false です。
        // Vector と Point が比較されています。
    }
    // ...
}
```

コンパイラは等価性チェックを使用して、右辺のオペランドをスマートキャストすることもできます。

この機能を有効にするには、ビルドファイルに以下のコンパイラオプションを追加してください：

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xstrict-equality-for-structural-classes")
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
                    <arg>-Xstrict-equality-for-structural-classes</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

詳細については、この機能の [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0456-equals.md) を参照してください。

## 標準ライブラリ (Standard library) {id="standard-library"}

本リリースでは、Kotlin 標準ライブラリに `if` 式を簡略化する新しい実験的関数と、Unicode コードポイントの実験的サポートが追加されました。

### if 式を用いた一般的なパターンを簡略化する新関数 {id="new-functions-for-simplifying-common-patterns-with-if-expressions"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin %kotlinEapVersion% では、`Boolean` 値を返す前にその値を検査したり、その値に応じて null 許容の結果を返したりできる新しい標準ライブラリ関数が導入されました。

以前は、これらのパターンには `else` 分岐を伴う明示的な `if` 式が必要でした。今後は、以下の関数を使ってシンプルに記述できます：

* `onTrue()` は、`Boolean` 値が `true` の場合に指定されたコードブロックを実行し、元の Boolean 値を返します。
* `onFalse()` は、`Boolean` 値が `false` の場合に指定されたコードブロックを実行し、元の Boolean 値を返します。
* `ifOrNull()` は、`Boolean` 値が `true` の場合に指定されたコードブロックを実行してその結果を返します。値が `false` の場合、ブロックを実行せずに `null` を返します。

これらの関数は[実験的（Experimental）](components-stability.md#stability-levels-explained)であり、`@OptIn(ExperimentalStdlibApi::class)` アノテーションまたは `-opt-in=kotlin.ExperimentalStdlibApi` コンパイラオプションによるオプトインが必要です。

以下に例を示します：

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
    val tags = mutableSetOf("kotlin", "jvm")

    // onTrue() 関数を使用して、add() が true を返したときにメッセージを出力
    val added = tags.add("wasm").onTrue {
        println("Tag added")
    }
    println(added)
    // Tag added
    // true

    // onFalse() 関数を使用して、remove() が false を返したときにメッセージを出力
    val removed = tags.remove("native").onFalse {
        println("Tag not found")
    }
    println(removed)
    // Tag not found
    // false

    // ifOrNull() 関数を使用して、tags に "wasm" が含まれている場合にメッセージを返す
    val message = ifOrNull("wasm" in tags) {
        "Wasm tag is available"
    }
    println(message)
    // Wasm tag is available
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.5.0-Beta1" validate="false"}

フィードバックは [YouTrack](https://youtrack.jetbrains.com/issue/KT-6938) にお寄せください。

### Unicode コードポイントのサポート {id="support-for-unicode-code-points"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin %kotlinEapVersion% では、`CodePoint` インラインバリュークラスと `kotlin.text.unicode` パッケージ内の関連 API が導入されました。これにより、プラットフォームを越えて Unicode コードポイントを扱えるようになります。

`Char` は1つの UTF-16 コードユニットを表します。しかし、一部の Unicode コードポイントにはサロゲートペアと呼ばれる2つの `Char` 値が必要です。プログラムが文字列を `Char` 値として反復処理すると、サロゲートペアの各半分が別々の要素として処理されてしまいます。

`CodePoint` バリュークラスは Unicode コードポイントを表し、その整数値を保持する基底の型として `Int` を使用します。これを表すのに必要な UTF-16 コードユニットの数、Unicode カテゴリ、文字・数字・空白のいずれであるかといったプロパティへのアクセスを提供します。

新しい API を使用すると、コードポイントのカウントや反復処理、大文字・小文字の変換、テキスト内での追加、挿入、置換、削除が可能になります。また、コードポイントの比較、算術演算の実行、範囲の作成、テキストの双方向トラバースも行えます。テキスト API は、位置の表現に引き続き UTF-16 コードユニットのオフセットを使用します。

これらの API は[実験的（Experimental）](components-stability.md#stability-levels-explained)であり、`@OptIn(ExperimentalUnicodeApi::class)` アノテーションまたは `-opt-in=kotlin.text.unicode.ExperimentalUnicodeApi` コンパイラオプションによるオプトインが必要です。

詳細については、この機能の [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/stdlib/KEEP-0400-unicode-codepoints.md) を参照してください。

## Kotlin/JVM {id="kotlin-jvm"}
<secondary-label ref="jvm"/>

Kotlin %kotlinEapVersion% より、コンパイラは Java 28 バイトコードを含むクラスを生成できるようになりました。

## Kotlin/Native {id="kotlin-native"}

Kotlin %kotlinEapVersion% では、新しい Gradle DSL とともに Swift エクスポートが Beta に昇格しました。

### 新しい Gradle DSL とともに Swift エクスポートが Beta に {id="swift-export-goes-beta-with-a-new-gradle-dsl"}

<primary-label ref="beta"/>
<secondary-label ref="native"/>

Kotlin %kotlinEapVersion% では、Swift エクスポートが [Beta](components-stability.md#stability-levels-explained) に昇格し、よりエルゴノミック（扱いやすい）な Gradle DSL が導入されました。新しい DSL は重複を減らし、設定の再利用性を高めることで、Kotlin コードを Swift に公開しやすくします。

主な変更点は以下のとおりです：

| 機能 | 変更前 | 変更後 |
|---|---|---|
| エントリポイント | `swiftExport {}` | `export { swift {} }` |
| 折りたたみルール（Collapse rule）プロパティ | `flattenPackage = "com.example.sandbox"` | `rootPackage = "com.example.sandbox"` |
| 宣言された依存関係のエクスポート | `export(project(":subproject")) {}` | 自動的にエクスポート。明示的な `export()` は不要 |
| 依存関係の設定の上書き | `export(libs.utils) {}` | `xcodeIntegration { configure(libs.utils) {} }` |
| コンパイラ引数 | `configure { freeCompilerArgs.add("-Xexpect-actual-classes") }` | 削除 |

以下は、新しい Swift エクスポート DSL を使用した完全なビルド設定の例です：

```kotlin
// subproject/build.gradle.kts
kotlin {

    iosArm64()
    iosSimulatorArm64()

    // この設定は ":subproject" が ":shared" の
    // 依存関係としてエクスポートされる際に使用されます
    export {
        swift {
            // ルートモジュール名を設定
            moduleName = "Subproject"

            // 折りたたみルールを設定
            // 生成された Swift コードからパッケージプレフィックスを削除します
            rootPackage = "com.subproject.library"
        }
    }
}

// shared/build.gradle.kts
kotlin {

    iosArm64()
    iosSimulatorArm64()

    export {
        swift {
            // ルートモジュール名を設定
            moduleName = "Shared"

            // 折りたたみルールを設定
            // 生成された Swift コードからパッケージプレフィックスを削除します
            rootPackage = "com.example.sandbox"

            // このモジュールの Xcode 統合を有効化
            xcodeIntegration {
                // 外部モジュールのエクスポートを設定
                configure(libs.utils) {
                    // 任意: エクスポートされるモジュール名を上書き
                    moduleName = "Utils"
                    // 任意: エクスポートされる依存関係の折りたたみルールを上書き
                    rootPackage = "com.example.utils"
                }
            }
        }
    }

    sourceSets {
        commonMain {
            dependencies {
                // これらの依存関係は自動的に
                // Swift エクスポートに含まれます
                api(project(":subproject"))
                api(libs.utils)
            }
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="完全な DSL の例"}

さらに、Swift エクスポートの設定がパブリッシュ可能になりました。ライブラリの作者がオプションの上書きを提供している場合、Gradle は Swift エクスポート時にそれらを自動的に取得して適用します。

問題が発生した場合は、[YouTrack](https://kotl.in/issue) に報告するか、[招待を受け取って](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up?_gl=1*ju6cbn*_ga*MTA3MTk5NDkzMC4xNjQ2MDY3MDU4*_ga_9J976DJZ68*MTY1ODMzNzA3OS4xMDAuMS4xNjU4MzQwODEwLjYw) Slack の [#swift-export](https://kotlinlang.slack.com/archives/C073GUW6WN9) チャンネルに参加してください。

## Kotlin Multiplatform {id="kotlin-multiplatform"}

Kotlin %kotlinEapVersion% では、Kotlin Multiplatform 向けの新しい実験的コンパイルスキームと、パブリッシュされるマルチプラットフォームライブラリのサイズを大幅に削減する新しいパブリケーション形式が導入されました。

### Kotlin Multiplatform 向けの新しい実験的コンパイルスキーム {id="new-experimental-compilation-scheme-for-kotlin-multiplatform"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="multiplatform"/>

Kotlin %kotlinEapVersion% では、Kotlin Multiplatform（KMP）向けの新しい実験的コンパイルスキームが導入され、コンパイラが共通ソースセット（common source sets）を IDE とより一貫して処理するようになりました。この変更により、共通コードが誤ってプラットフォーム固有の宣言に解決されるのを防ぎ、オーバーロードの解決や型推論の一貫性を向上させ、共通ソースセットのインクリメンタルコンパイルの実装を可能にします。KMP 分離コンパイル（separate compilation）の詳細や試用方法については、[ブログ記事](https://blog.jetbrains.com/kotlin/2026/09/a-more-reliable-compilation-scheme-for-kotlin-multiplatform-modules/)をご覧ください。

### Kotlin Multiplatform ライブラリ向けの新しいパブリケーション形式 {id="new-publication-format-for-kotlin-multiplatform-libraries"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="multiplatform"/>

Kotlin %kotlinEapVersion% では、パブリッシュされるライブラリのサイズを大幅に削減する、Kotlin Multiplatform ライブラリ向けの新しいパブリケーション形式が導入されました。この新形式では、（JVM と Android を除く）プラットフォームアーティファクトが、XZ で追加圧縮された ZIP アーカイブである単一の `.kar` アーカイブとしてパブリッシュされます。

この変更は、Maven Central に最近導入された[パブリケーションサイズ制限](https://central.sonatype.org/publish/maven-central-publishing-limits/)に対応するものです。新しい形式により、新しいターゲットを追加しても新しいファイルが作成されなくなるため、パブリケーションサイズが過度に増加することがなくなります。場合によっては、全体のパブリケーションが以前の単一ターゲットのものよりも小さくなることもあります。例えば、[cryptography-kotlin](https://github.com/whyoleg/cryptography-kotlin) ライブラリでは、マルチモジュールプロジェクト全体でパブリッシュされるアーティファクトセットが 7,539 ファイル・91 MB から、1,036 ファイル・23 MB に減少しました。

特定のモジュールでこの新形式を有効にするには、モジュールのビルドスクリプトで以下のように設定します：

```kotlin
kotlin {
    publishing {
        publicationFormat.set(KotlinPublicationFormat.KOTLIN_ARCHIVE)
    }
}
```

または、プロジェクト内のすべてのモジュールで有効にするには、`gradle.properties` ファイルに以下のプロパティを追加します：

```properties
kotlin.publicationFormat=KOTLIN_ARCHIVE
```

新しい形式でのパブリッシュはまだ[実験的（Experimental）](components-stability.md#stability-levels-explained)ですが、そのようなアーティファクトの消費（利用）はすでにすべてのプロジェクトで利用可能です。この変更はライブラリの作成者にのみ関係し、最終アプリケーションの開発者には影響しません。

フィードバックや問題の報告は [YouTrack](https://kotl.in/issue) にお寄せください。

## Kotlin/JS {id="kotlin-js"}
<secondary-label ref="js"/>

Kotlin %kotlinEapVersion% では、Kotlin/JS コンパイラおよび Gradle プラグインに `es2020` ターゲットが追加されました。以前は `es5` および `es2015` ターゲットのみが利用可能であり、`BigInt` などの新しい JavaScript 機能のサポートは、ES2015 をターゲットにした上で個別に有効にする必要がありました。ES2020 をターゲットにすることで、追加の設定なしで `BigInt` を含む ECMAScript 2020 までのサポート対象 JavaScript 機能をすべて使用できるようになります。

新しいターゲットを有効にするには、`compilerOptions {}` ブロックで `target` を `es2020` に設定します：

```kotlin
kotlin {
    js {
        compilerOptions {
            target.set("es2020")
        }
    }
}
```

## Kotlin コンパイラ (Kotlin compiler) {id="kotlin-compiler"}

Kotlin %kotlinEapVersion% では、`klib` コンパイル時の関数インライン化にさらなる改善が施され、型推論のパフォーマンスが向上しました。

### klib コンパイル時における一貫したモジュール間関数インライン化 {id="consistent-cross-module-function-inlining-during-klib-compilation"}

<secondary-label ref="compiler"/>

Kotlin 2.4.0 では、`klib` コンパイル時における [Kotlin/Native、Kotlin/JS、Kotlin/Wasm での一貫したモジュール内（intra-module）関数インライン化](whatsnew24.md#consistent-intra-module-function-inlining-during-klib-compilation) が有効化されました。異なる Kotlin プラットフォーム間での関数インライン化の一貫性により、互換性の保証がより容易になります。

また、Kotlin 2.4.0 では、`klib` コンパイル時に**モジュール間（cross-module）**のインライン化を有効にする機能も導入され、プロジェクト内のすべてのインライン関数が一貫してインライン化されるようになりました。Kotlin %kotlinEapVersion% では、モジュール間インライン化がデフォルトで有効になっています。

この機能で予期しない問題が発生した場合は、以下のコマンドラインコンパイラオプションを使用して無効化できます：

```bash
-Xklib-ir-inliner=disabled
```

フィードバックや問題の報告は [YouTrack](https://kotl.in/issue) にお寄せください。

### 型推論パフォーマンスの向上 {id="improved-type-inference-performance"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="compiler"/>

Kotlin %kotlinEapVersion% では、型推論中に生成される制約の数を減らすことで、コンパイラのパフォーマンスが向上しました。以前は、複雑なジェネリックコードによって過剰な制約が生成され、コンパイルや IDE の解析が停止（ハング）することがありました。この変更は、特にビルダー推論や異常な境界を持つ複雑なプラットフォーム型が関与する特定のコーナーケースにおいて、型推論に影響を与える可能性があります。その結果、コンパイラが異なる型を推論したり、異なるオーバーロードを選択したり、異なる診断を報告したりする場合があります。これらの違いは、改善による想定された結果である可能性があります。

この機能はデフォルトで有効になっています。以前の型推論の挙動に戻すには、`-XXLanguage:-EliminateSecondKindIncorporation` オプションを使用してください。

フィードバックは [YouTrack](https://youtrack.jetbrains.com/issue/KT-85879) にお寄せください。

## 破壊的変更と非推奨化 (Breaking changes and deprecations) {id="breaking-changes-and-deprecations"}

Kotlin %kotlinEapVersion% では、Kotlin コンパイラの実行に必要な最小 JDK バージョンを JDK 8 から JDK 17 に引き上げる次のステップとして、エラーが導入されました。開発を加速させ、より新しい Java バージョンを必要とする新しいライブラリへのアクセスをコンパイラに提供するために、最小要件となる JDK を引き上げています。JDK 17 はサポート期間が長く、Gradle や Maven の新しいバージョンとの互換性を維持するのにも役立ちます。このエラーは、`-Xallow-pre-17-runtime-jdk` コンパイラオプションを使用することでオプトアウトできます。このオプションは、JDK 17 が必須となる Kotlin 2.5.20 または 2.6.0 で削除される予定です。

プロジェクトのアップグレードに問題がある場合は、[YouTrack](https://kotl.in/issue) でご意見・ご経験を共有いただくか、Kotlin Slack の開発者に直接お問い合わせください。[招待を受け取って](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up?_gl=1*ju6cbn*_ga*MTA3MTk5NDkzMC4xNjQ2MDY3MDU4*_ga_9J976DJZ68*MTY1ODMzNzA3OS4xMDAuMS4xNjU4MzQwODEwLjYw) [#compiler](https://kotlinlang.slack.com/archives/C7L3JB43G) チャンネルに参加してください。