[//]: # (title: Kotlin 2.3.20 の新機能)

<show-structure depth="1"/>

<web-summary>新しい言語機能、Kotlin Multiplatform、JVM、Native、JS、Wasm のアップデート、Gradle および Maven のビルドツールサポートなどを網羅した Kotlin 2.3.20 リリースノートをご覧ください。</web-summary>

_[公開日: 2026年3月16日](releases.md#release-history)_

<tldr>
    <p>バグ修正リリース 2.3.21 の詳細については、<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.21">チェンジログ</a>を参照してください。</p>
</tldr>

Kotlin 2.3.20 がリリースされました！ 主なハイライトは以下のとおりです。

* **Gradle**: [Gradle 9.3.0 との互換性](#compatibility-with-gradle-9-3-0) および [Kotlin/JVM コンパイルでデフォルトで BTA を使用](#kotlin-jvm-compilation-uses-build-tools-api-by-default)
* **Maven**: [Kotlin プロジェクトのセットアップの簡素化](#simplified-setup-for-kotlin-projects)
* **Kotlin コンパイラープラグイン**: [Lombok が Alpha に昇格](#lombok-is-now-alpha) および [`kotlin.plugin.jpa` プラグインにおける JPA サポートの向上](#improved-jpa-support-in-the-kotlin-plugin-jpa-plugin)
* **言語**: [名前ベースの分割宣言のサポート](#name-based-destructuring)
* **標準ライブラリ**: [`Map.Entry` のイミュータブルなコピーを作成する新しい API](#new-api-for-creating-immutable-copies-of-map-entry)
* **Kotlin/Native**: [C および Objective-C ライブラリ向けの新しい相互運用モード](#new-interoperability-mode-for-c-or-objective-c-libraries)

> Kotlin のリリースサイクルの詳細については、[Kotlin のリリースプロセス](releases.md)を参照してください。
>
{style="tip"}

## Kotlin 2.3.20 へのアップデート {id="update-to-kotlin-2-3-20"}

Kotlin の最新バージョンは、[IntelliJ IDEA](https://www.jetbrains.com/idea/download/) および [Android Studio](https://developer.android.com/studio) の最新バージョンに含まれています。

新しい Kotlin バージョンにアップデートするには、IDE が最新バージョンに更新されていることを確認し、ビルドスクリプトで [Kotlin のバージョンを 2.3.20 に変更](releases.md#update-to-a-new-kotlin-version) してください。

## 新機能 {id=new-stable-features}
<primary-label ref="stable"/>

本リリースでは、以下の機能が[安定版（Stable）](components-stability.md#stability-levels-explained)となりました。

<snippet id="simplified-setup-for-kotlin-projects-content">

<var name="id1" value="simplified-setup-for-kotlin-projects"/>

<var name="id2" value="simplified-setup-for-kotlin-projects-how-to-enable"/>

### Kotlin プロジェクトのセットアップの簡素化 {id="%id1%"}
<secondary-label ref="maven"/>

Kotlin 2.3.20 では、Maven プロジェクトにおける Kotlin のセットアップが容易になりました。Kotlin でソースルートおよび Kotlin 標準ライブラリの自動構成がサポートされるようになりました。

この新しい構成により、Maven ビルドシステムを使用して新しい Kotlin プロジェクトを作成する場合や、既存の Java Maven プロジェクトに Kotlin を導入する場合に、POM ビルドファイル内でソースルートパスを手動で指定したり `kotlin-stdlib` 依存関係を追加したりする必要がなくなります。

#### 有効化する方法 {id="%id2%"}

`pom.xml` ファイル内の Kotlin Maven プラグインの `<build><plugins>` セクションに `<extensions>true</extensions>` を追加します。

```xml
<build>
    <plugins>
         <plugin>
             <groupId>org.jetbrains.kotlin</groupId>
             <artifactId>kotlin-maven-plugin</artifactId>
             <version>%kotlinVersion%</version>
             <extensions>true</extensions> <!-- この拡張を追加 -->
         </plugin>
    </plugins>
</build>
```

ここでの `<extensions>` オプションの新しい機能は以下のとおりです。

* `src/main/kotlin` および `src/test/kotlin` ディレクトリが既に存在しているもののプラグイン構成で指定されていない場合に、それらをソースルートとして登録します。
* `kotlin-stdlib` 依存関係がまだ明示的に定義されていない場合に自動で追加します。

また、Kotlin 標準ライブラリの自動追加を無効化（オプトアウト）することもできます。その場合は、`<properties>` セクションに以下を追加します。

```xml
<project>
    <properties>
        <!-- プロパティ経由でスマートデフォルトを無効化 -->
        <kotlin.smart.defaults.enabled>false</kotlin.smart.defaults.enabled>         
    </properties>
</project>
```

このプロパティは、標準ライブラリの自動追加だけでなく、ソースルートパスの登録も無効化することに注意してください。その他の `<extensions>` 機能には影響しません。

Kotlin Maven プロジェクトの構成に関する詳細については、[Maven プロジェクトの構成](maven-configure-project.md)を参照してください。

</snippet>

## 新機能 {id=new-experimental-features}
<primary-label ref="experimental-exp"/>

本リリースでは、以下のプレ安定版（Pre-stable）機能が利用可能です。これには [Beta](components-stability.md#stability-levels-explained)、[Alpha](components-stability.md#stability-levels-explained)、および [Experimental](components-stability.md#stability-levels-explained) ステータスの機能が含まれます。

* [コンパイラー: Lombok が Alpha に昇格](#lombok-is-now-alpha)
* [言語: 名前ベースの分割宣言](#name-based-destructuring)
* [標準ライブラリ: `Map.Entry` のイミュータブルなコピーを作成する新しい API](#new-api-for-creating-immutable-copies-of-map-entry)
* [Kotlin/Native: C または Objective-C ライブラリ向けの新しい相互運用モード](#new-interoperability-mode-for-c-or-objective-c-libraries)

<snippet id="lombok-is-now-alpha-content">

<var name="id3" value="lombok-is-now-alpha"/>

### Lombok が Alpha に昇格 {id="%id3%"}
<primary-label ref="alpha"/>
<secondary-label ref="compiler"/>

Kotlin 1.5.20 では実験的機能として [Lombok コンパイラープラグイン](lombok.md) が導入され、Kotlin と Java のコードが混在するモジュールで [Java の Lombok 宣言](https://projectlombok.org/) を生成および使用できるようになりました。

2.3.20 では、この機能をプロダクション対応にする計画に伴い、Lombok コンパイラープラグインが [Alpha](components-stability.md#stability-levels-explained) に昇格しました。ただし、現在も開発が進行中です。

</snippet>

<snippet id="name-based-destructuring-content">

<var name="id4" value="name-based-destructuring"/>

<var name="id5" value="name-based-destructuring-how-to-enable"/>

### 名前ベースの分割宣言 {id="%id4%"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="language"/>

Kotlin 2.3.20 では、位置ベースの `componentN()` 関数に依存するのではなく、変数をプロパティ名にマッピングする*名前ベースの分割宣言（name-based destructuring declarations）*が導入されました。

以前は、[分割宣言（destructuring declarations）](destructuring-declarations.md) は位置ベースの分割を使用していました。

```kotlin
data class User(val username: String, val email: String)

fun main() {
    val user = User("alice", "alice@example.com")

    val (email, username) = user

    println(email)
    // alice

    println(username)
    // alice@example.com
}
```
{kotlin-runnable="true"}

この例では、分割が `componentN()` 関数の順序に依存しているため、`email` には `username` の値が入り、`username` には `email` の値が入ります。

Kotlin 2.3.20 以降では、各変数が名前によってプロパティを参照する名前ベースの分割を使用できます。

```kotlin
fun main() {
    val user = User("alice", "alice@example.com")

    // 明示的な形式の名前ベースの分割を使用
    (val mail = email, val name = username) = user

    println(name)
    // alice

    println(mail)
    // alice@example.com
}
```

名前ベースの分割は[実験的（Experimental）](components-stability.md#stability-levels-explained)機能です。コンパイラーオプション `-Xname-based-destructuring` を使用して、コンパイラーが分割宣言をどのように解釈するかを制御できます。

以下のモードがあります。

* `only-syntax`: 既存の分割宣言の動作を変更することなく、明示的な形式の名前ベースの分割を有効にします。
* `name-mismatch`: データクラスでの位置ベースの分割において、プロパティ名と一致しない変数名が使用されている場合に警告を報告します。
* `complete`: 丸括弧を使用した省略形での名前ベースの分割を有効にし、角括弧構文による位置ベースの分割のサポートを継続します。

`complete` モードを使用する場合、丸括弧を使用した省略形の分割構文は、位置に依存するのではなくプロパティ名に変数を一致させます。

```kotlin
val (email, username) = user
```
#### 有効化する方法 {id="%id5%"}

プロジェクトで名前ベースの分割を使用するには、ビルド構成ファイルに以下のコンパイラーオプションを追加します。

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xname-based-destructuring=only-syntax")
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
                    <arg>-Xname-based-destructuring=only-syntax</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab> 
</tabs>

名前ベースの分割をオプトインすると、角括弧を使用した位置ベースの分割のための新しい構文も導入されます。

```kotlin
// 明示的な位置ベースの分割を使用
val [username, email] = user
```

今後は、新しい角括弧構文による位置ベースの分割を維持しつつ、デフォルトで名前ベースのマッチングを使用する分割宣言へと段階的に移行していく予定です。

詳細については、この機能の [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0438-name-based-destructuring.md) を参照してください。

フィードバックは [YouTrack](https://youtrack.jetbrains.com/issue/KT-19627) にお寄せください。

</snippet>

<snippet id="new-api-for-creating-immutable-copies-of-map-entry-content">

<var name="id6" value="new-api-for-creating-immutable-copies-of-map-entry"/>

### `Map.Entry` のイミュータブルなコピーを作成する新しい API {id="%id6%"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin 2.3.20 では、[`Map.Entry`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-map/-entry/) のイミュータブル（不変）なコピーを作成するための `Map.Entry.copy()` 拡張関数が導入されました。この関数を使用すると、[`Map.entries`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-map/entries.html) から取得したエントリをあらかじめコピーしておくことで、マップを変更した後でもそれらのエントリを再利用できます。

`Map.Entry.copy()` は[実験的（Experimental）](components-stability.md#stability-levels-explained)機能です。オプトインするには、`@OptIn(ExperimentalStdlibApi::class)` アノテーションまたは以下のコンパイラーオプションを使用してください。

```bash
-opt-in=kotlin.ExperimentalStdlibApi
```

以下は、ミュータブルなマップからエントリを削除するために `Map.Entry.copy()` を使用する例です。

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
    val map = mutableMapOf(1 to 1, 2 to 2, 3 to 3, 4 to 4)

    val toRemove = map.entries
        .filter { it.key % 2 == 0 }
        .map { it.copy() }

    map.entries.removeAll(toRemove)

    println("map = $map")
    // map = {1=1, 3=3}
}
```

</snippet>

<snippet id="new-interoperability-mode-for-c-or-objective-c-libraries-content">

<var name="id7" value="new-interoperability-mode-for-c-or-objective-c-libraries"/>

<var name="id8" value="new-interoperability-mode-for-c-or-objective-c-libraries-how-to-enable"/>

<var name="id9" value="new-interoperability-mode-for-c-or-objective-c-libraries-report-your-results"/>

### C または Objective-C ライブラリ向けの新しい相互運用モード {id="%id7%"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="native"/>

Kotlin Multiplatform (KMP) ライブラリまたはアプリケーションで C または Objective-C ライブラリを使用している場合は、新しい相互運用モードをテストし、その結果を共有してください。

一般に、Kotlin/Native では C および Objective-C ライブラリを Kotlin にインポートできます。しかし KMP ライブラリの場合、現在この機能は古いコンパイラーバージョンとの KMP 互換性の問題による[影響を受けています](native-lib-import-stability.md#stability-of-c-and-objective-c-library-import)。

言い換えると、ある Kotlin バージョンでコンパイルされた KMP ライブラリを公開した場合、C または Objective-C ライブラリのインポートによって、それより前の Kotlin バージョンのプロジェクトでその Kotlin ライブラリを使用できなくなる可能性があります。

この問題やその他の課題に対処するため、Kotlin チームは内部で使用されている相互運用メカニズムの見直しを進めてきました。Kotlin 2.3.20 以降では、コンパイラーオプションを介してこの新しいモードを試すことができます。

#### 有効化する方法 {id="%id8%"}

1. Gradle ビルドファイルで、`cinterops {}` ブロックまたは `pod()` 依存関係があるかどうかを確認します。これらが存在する場合、プロジェクトは C または Objective-C ライブラリを使用しています。
2. プロジェクトが `2.3.20` 以降のバージョンを使用していることを確認します。
3. 同じビルドファイル内で、cinterop ツールの呼び出しに `-Xccall-mode` コンパイラーオプションを追加します。

   ```kotlin
   kotlin {
       targets.withType<org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget>().configureEach {
           compilations.configureEach {
               cinterops.configureEach {
                   extraOpts += listOf("-Xccall-mode", "direct")
               }
           }
       }
   }
   ```

4. 通常通りにユニットテストやアプリケーションを実行して、プロジェクトをビルドおよびテストします。Gradle が失敗後もタスクの実行を継続できるように `--continue` オプションを使用することもできます。これにより、一度により多くの問題を検出できます。

> 新しい相互運用モードはまだ[実験的（Experimental）](components-stability.md#stability-levels-explained)であるため、このモードでコンパイルされたライブラリは**まだ公開しないでください**。
>
{style="warning"}

#### 結果の報告 {id="%id9%"}

新しい相互運用モードは、ほとんどのケースでそのまま置き換えて使用できる（ドロップインの代替となる）ことが意図されています。最終的にはデフォルトで有効にする予定です。しかし、それを実現するためには可能な限り正常に動作することを確認し、幅広いプロジェクトでテストする必要があります。理由は以下のとおりです。

* 一部の C および Objective-C の宣言は、新しいモードではまだサポートされていません（主に互換性の問題によるものです）。この実環境への影響をより深く理解し、それに応じて今後のステップの優先順位を決めたいと考えています。
* バグや考慮漏れが存在する可能性があります。相互作用する多数の機能を持つ単一言語のテストでさえ困難ですが、独自の機能群を持つ言語間の相互作用のテストはさらに困難を極めます。

実際のプロジェクトを検証し、課題となるケースを特定するためにご協力ください。問題が発生したかどうかに関わらず、[YouTrack](https://youtrack.jetbrains.com/issue/KT-83218) のコメントにて結果を共有してください。

</snippet>

## 言語 {id="language"}

Kotlin 2.3.20 では、位置に依存する代わりにプロパティ名に変数を一致させる名前ベースの分割宣言が追加されました。また、コンテキストパラメータを持つ宣言のオーバーロード解決に関する変更も導入されています。

### コンテキストパラメータのオーバーロード解決の変更 {id="changes-to-overload-resolution-for-context-parameters"}
<secondary-label ref="language"/>

Kotlin 2.3.20 では、コンテキストパラメータを持つ宣言に対するオーバーロード解決の変更が導入されました。

以前は、オーバーロード解決においてコンテキストパラメータを持つ宣言は、それらを持たない宣言よりも「より特定的（more specific）」として扱われていました。

Kotlin 2.3.20 以降はこのルールが適用されなくなり、オーバーロードの選択がより一貫したものになります。その結果、以前は解決されていた呼び出しがあいまい（ambiguous）になり、オーバーロードの違いがコンテキストパラメータのみである場合にコンパイルエラーが発生するようになります。このような場合、コンパイラーはあいまいさの可能性について警告を報告します。

以下に例を示します。

```kotlin
class Logger {
    fun info(msg: String) = println("INFO: $msg")
}

fun saveUser(id: Int) {
    println("Saving user $id (no logger)")
}

// 警告を報告: Contextual declaration is shadowed
context(logger: Logger)
fun saveUser(id: Int) {
    logger.info("Saving user $id")
}

fun main() {
    val logger = Logger()

    context(logger) {
        // 2.3.20 では曖昧性エラーを報告
        saveUser(1)
    }
}
```

さらに、Kotlin 2.3.20 では解決時およびコード補完時の過度なオーバーロード候補を減らすため、`kotlin.context` のオーバーロード数が 22 個から 6 個に削減されました。

### 名前ベースの分割宣言 {id="language-name-based-destructuring"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="language"/>

Kotlin 2.3.20 では、位置ベースの `componentN()` 関数に依存するのではなく、変数をプロパティ名にマッピングする*名前ベースの分割宣言*が導入されました。

以前は、[分割宣言](destructuring-declarations.md) は位置ベースの分割を使用していました。

```kotlin
data class User(val username: String, val email: String)

fun main() {
    val user = User("alice", "alice@example.com")

    val (email, username) = user

    println(email)
    // alice

    println(username)
    // alice@example.com
}
```
{kotlin-runnable="true"}

この例では、分割が `componentN()` 関数の順序に依存しているため、`email` には `username` の値が入り、`username` には `email` の値が入ります。

Kotlin 2.3.20 以降では、各変数が名前によってプロパティを参照する名前ベースの分割を使用できます。

```kotlin
fun main() {
    val user = User("alice", "alice@example.com")

    // 明示的な形式の名前ベースの分割を使用
    (val mail = email, val name = username) = user

    println(name)
    // alice

    println(mail)
    // alice@example.com
}
```

名前ベースの分割は[実験的（Experimental）](components-stability.md#stability-levels-explained)機能です。コンパイラーオプション `-Xname-based-destructuring` を使用して、コンパイラーが分割宣言をどのように解釈するかを制御できます。

以下のモードがあります。

* `only-syntax`: 既存の分割宣言の動作を変更することなく、明示的な形式の名前ベースの分割を有効にします。
* `name-mismatch`: データクラスでの位置ベースの分割において、プロパティ名と一致しない変数名が使用されている場合に警告を報告します。
* `complete`: 丸括弧を使用した省略形での名前ベースの分割を有効にし、角括弧構文による位置ベースの分割のサポートを継続します。

`complete` モードを使用する場合、丸括弧を使用した省略形の分割構文は、位置に依存するのではなくプロパティ名に変数を一致させます。

```kotlin
val (email, username) = user
```
#### 有効化する方法 {id="language-name-based-destructuring-how-to-enable"}

プロジェクトで名前ベースの分割を使用するには、ビルド構成ファイルに以下のコンパイラーオプションを追加します。

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xname-based-destructuring=only-syntax")
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
                    <arg>-Xname-based-destructuring=only-syntax</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab> 
</tabs>

名前ベースの分割をオプトインすると、角括弧を使用した位置ベースの分割のための新しい構文も導入されます。

```kotlin
// 明示的な位置ベースの分割を使用
val [username, email] = user
```

今後は、新しい角括弧構文による位置ベースの分割を維持しつつ、デフォルトで名前ベースのマッチングを使用する分割宣言へと段階的に移行していく予定です。

詳細については、この機能の [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0438-name-based-destructuring.md) を参照してください。

フィードバックは [YouTrack](https://youtrack.jetbrains.com/issue/KT-19627) にお寄せください。

## 標準ライブラリ {id="standard-library"}

Kotlin 2.3.20 には、標準ライブラリ向けの新しい実験的機能が含まれています。

### `Map.Entry` のイミュータブルなコピーを作成する新しい API {id="standard-library-new-api-for-creating-immutable-copies-of-map-entry"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin 2.3.20 では、[`Map.Entry`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-map/-entry/) のイミュータブルなコピーを作成するための `Map.Entry.copy()` 拡張関数が導入されました。この関数を使用すると、[`Map.entries`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-map/entries.html) から取得したエントリをあらかじめコピーしておくことで、マップを変更した後でもそれらのエントリを再利用できます。

`Map.Entry.copy()` は[実験的（Experimental）](components-stability.md#stability-levels-explained)機能です。オプトインするには、`@OptIn(ExperimentalStdlibApi::class)` アノテーションまたは以下のコンパイラーオプションを使用してください。

```bash
-opt-in=kotlin.ExperimentalStdlibApi
```

以下は、ミュータブルなマップからエントリを削除するために `Map.Entry.copy()` を使用する例です。

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
    val map = mutableMapOf(1 to 1, 2 to 2, 3 to 3, 4 to 4)

    val toRemove = map.entries
        .filter { it.key % 2 == 0 }
        .map { it.copy() }

    map.entries.removeAll(toRemove)

    println("map = $map")
    // map = {1=1, 3=3}
}
```

## Kotlin コンパイラープラグイン {id="kotlin-compiler-plugins"}

Kotlin 2.3.20 では、Lombok および `kotlin.plugin.jpa` コンパイラープラグインに重要な更新が行われました。

### `kotlin.plugin.jpa` プラグインにおける JPA サポートの向上 {id="improved-jpa-support-in-the-kotlin-plugin-jpa-plugin"}
<secondary-label ref="compiler"/>

`kotlin.plugin.jpa` プラグインは、従来の [`no-arg`](no-arg-plugin.md) コンパイラープラグインの適用に加え、新しく追加された組み込み JPA プリセットを使用して [`all-open`](all-open-plugin.md) コンパイラープラグインも自動的に適用するようになりました。

以前は、`kotlin("plugin.jpa")` を使用しても JPA プリセットを持つ `no-arg` プラグインのみが有効になっていました。

本リリースでは、`all-open` プラグインが自動的に構成されるように `kotlin.plugin.jpa` プリセットを改善しました。これにより、遅延関連付け（lazy association）がイーガーロード（eager loading）を引き起こして余計なクエリを発行することなく、期待どおりに動作するようになります。

Kotlin 2.3.20 以降:

* `all-open` コンパイラープラグインが JPA プリセットを提供するようになりました。
* Gradle の `org.jetbrains.kotlin.plugin.jpa` プラグインは、JPA プリセットを有効にした `org.jetbrains.kotlin.plugin.all-open` プラグインを自動的に適用します。
* [Maven JPA のセットアップ](kotlin-jpa-plugin.md#maven) では、デフォルトで JPA プリセットを含む `all-open` が有効になります。（IntelliJ IDEA でのサポートは 2026.1 から利用可能です。）
* Maven の依存関係 `org.jetbrains.kotlin:kotlin-maven-noarg` に暗黙的に `org.jetbrains.kotlin:kotlin-maven-allopen` が含まれるようになったため、`<plugin><dependencies>` ブロックに明示的に追加する必要がなくなりました。

その結果、以下のアノテーションが付与された JPA エンティティは追加の構成なしで自動的に `open` として扱われ、引数なしのコンストラクタが生成されます。

* `javax.persistence.Entity`
* `javax.persistence.Embeddable`
* `javax.persistence.MappedSuperclass`
* `jakarta.persistence.Entity`
* `jakarta.persistence.Embeddable`
* `jakarta.persistence.MappedSuperclass`

この変更によりビルド構成が簡素化され、JPA フレームワークで Kotlin を使用する際の初期設定の手間が大幅に軽減されます。

> 近日公開予定の [IntelliJ IDEA 2026.1](https://www.jetbrains.com/idea/whatsnew/) では、プロジェクトで Kotlin をセットアップする際に `kotlin.plugin.jpa` プラグインが自動的に構成されます。IDE はプラグインを追加し、不要になった冗長な `no-arg` コンストラクタ宣言を削除するためのクイックフィックスを提供します。
>
{style="tip"}

### Lombok が Alpha に昇格 {id="compiler-lombok-is-now-alpha"}
<primary-label ref="alpha"/>
<secondary-label ref="compiler"/>

Kotlin 1.5.20 では実験的機能として [Lombok コンパイラープラグイン](lombok.md) が導入され、Kotlin と Java のコードが混在するモジュールで [Java の Lombok 宣言](https://projectlombok.org/) を生成および使用できるようになりました。

2.3.20 では、この機能をプロダクション対応にする計画に伴い、Lombok コンパイラープラグインが [Alpha](components-stability.md#stability-levels-explained) に昇格しました。ただし、現在も開発が進行中です。

## Kotlin/JVM {id="kotlin-jvm"}

Kotlin 2.3.20 では、Java との相互運用性にいくつかの改善が導入されています。コンパイラーが null 許容性（nullability）チェックのために Vert.x の `@Nullable` アノテーションを認識するようになりました。また本リリースでは、Java の `@Unmodifiable` および `@UnmodifiableView` アノテーションのサポートが追加され、アノテーションが付与されたコレクションを Kotlin 側で読み取り専用として扱えるようになりました。

### Vert.x の `@Nullable` アノテーションのサポート {id="support-for-vert-x-nullable-annotation"}
<secondary-label ref="jvm"/>

Kotlin 2.3.20 では、[`io.vertx.codegen.annotations.Nullable`](https://www.javadoc.io/doc/io.vertx/vertx-codegen/3.5.0/io/vertx/codegen/annotations/Nullable.html) アノテーションのサポートが追加されました。コンパイラーはこのアノテーションを認識し、デフォルトで null 許容性の不一致を警告として報告します。

厳格な null 許容性チェックを適用し、これらの警告をエラーに格上げするには、ビルドファイルに以下のコンパイラーオプションを追加します。

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
// build.gradle(.kts)
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xnullability-annotations=@io.vertx.codegen.annotations:strict")
    }
}
```
</tab>
<tab title="Maven" group-key="maven">

```xml
<!-- pom.xml -->
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xnullability-annotations=@io.vertx.codegen.annotations:strict</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```
</tab>
</tabs>

### Java の変更不可コレクションアノテーションのサポート {id="support-for-java-unmodifiable-collection-annotations"}
<secondary-label ref="jvm"/>

Kotlin 2.3.20 では、[`org.jetbrains.annotations.Unmodifiable`](https://javadoc.io/doc/org.jetbrains/annotations/20.1.0/org/jetbrains/annotations/Unmodifiable.html) および [`org.jetbrains.annotations.UnmodifiableView`](https://javadoc.io/doc/org.jetbrains/annotations/24.0.1/org/jetbrains/annotations/UnmodifiableView.html) Java アノテーションのサポートが追加されました。

Kotlin 2.3.20 以降、これらのアノテーションが付いた Java 宣言から返されるコレクションは、Kotlin において読み取り専用（read-only）として扱われます。それらをミュータブル（可変）なコレクション型に代入すると、型の不一致警告が発生します。この警告は Kotlin 2.5.0 でエラーになる予定です。

以下に例を示します。

```java
// Java
public class Java {
    public static @UnmodifiableView List<Object> unmodifiableView() {
        return List.of();
    }

    public static @Unmodifiable List<Object> unmodifiable() {
        return List.of();
    }
}
```

```kotlin
// Kotlin

fun main() {
    // 警告を報告: Java type mismatch
    val mutableView: MutableList<Any> = Java.unmodifiableView()
    val mutableCopy: MutableList<Any> = Java.unmodifiable()
}
```

## Kotlin/Native {id="kotlin-native"}

Kotlin 2.3.20 では、C および Objective-C ライブラリ向けの新しい実験的相互運用モード、クロスコンパイルチェッカー、および Kotlin/Native プロジェクトでコンパイルキャッシュを無効化するための新しい DSL が導入されました。

### クロスコンパイルチェッカー {id="cross-compilation-checker"}
<secondary-label ref="native"/>

Kotlin 2.3.20 では、指定されたターゲットに対してクロスコンパイルがサポートされているかどうかを判断する方法が導入されました。これは、コンパイルタスクのステータスを追跡するサードパーティのプラグインに役立ちます。

一般に Kotlin/Native ではクロスコンパイルが可能であり、サポートされているホストであれば、サポートされているターゲット用の `.klib` アーティファクトを生成できます。しかし、プロジェクトで [cinterop 依存関係](native-c-interop.md) を使用している場合、Apple ターゲット用のアーティファクト生成は依然として制限されます。

新しい `crossCompilationSupported` API は、クロスコンパイルがサポートされているかどうか（ターゲットがホストマネージャーによって有効化されており、かつターゲットのどのコンパイルにも cinterop 依存関係が含まれていないこと）をチェックします。このチェッカーはデフォルトで有効になっています。

サポートされているターゲットとホストの詳細については、[Kotlin/Native のドキュメント](native-target-support.md)を参照してください。

### コンパイルキャッシュを無効化するための新しい DSL {id="new-dsl-for-disabling-compilation-cache"}
<secondary-label ref="native"/>

Kotlin 2.3.20 には、Kotlin/Native プロジェクトでコンパイルキャッシュを無効化するための新しい DSL が付属しています。これは、キャッシュの無効化をより慎重かつ明示的な決定にするためのものです。

キャッシュを無効化すると Kotlin/Native のビルドが大幅に遅くなるため、一時的かつ例外的な場合にのみ使用すべきです。そのため、キャッシュの無効化は特定の Kotlin バージョンに紐付けられるようになり、ドキュメントの役割を果たす理由（reason）の記述が必須となりました。

プロジェクトでコンパイルキャッシュを無効化する必要がある場合は、Gradle ビルドファイルの `binaries {}` ブロックを以下のように更新します。

```kotlin
kotlin {
    listOf(
        iosX64(),
        iosArm64(),
        iosSimulatorArm64()
    ).forEach {
        // バイナリの種類を指定
        it.binaries.framework {
            baseName = "CacheKind"
            isStatic = true

            // 新しい DSL でキャッシュを無効化
            disableNativeCache(
                 version = DisableCacheInKotlinVersion.2_3_0, 
                 reason = "Cache bug",
                 issue = URI("https://youtrack.com/YY-1111")
            )
        }
    }
}
```

* `version` – コンパイルキャッシュを無効化する Kotlin バージョン。
* `reason`（必須） – コンパイルキャッシュを無効化する理由。
* `issue`（任意） – バグトラッカー内の対応する課題への URL。

この新しい DSL は、非推奨となった `kotlin.native.cacheKind` Gradle プロパティを置き換えるものです。`gradle.properties` ファイルからこのプロパティを安全に削除できます。

コンパイル時間を短縮するためのその他のヒントについては、[Kotlin/Native のドキュメント](native-improving-compilation-time.md)を参照してください。

### C または Objective-C ライブラリ向けの新しい相互運用モード {id="native-new-interoperability-mode-for-c-or-objective-c-libraries"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="native"/>

Kotlin Multiplatform (KMP) ライブラリまたはアプリケーションで C または Objective-C ライブラリを使用している場合は、新しい相互運用モードをテストし、その結果を共有してください。

一般に、Kotlin/Native では C および Objective-C ライブラリを Kotlin にインポートできます。しかし KMP ライブラリの場合、現在この機能は古いコンパイラーバージョンとの KMP 互換性の問題による[影響を受けています](native-lib-import-stability.md#stability-of-c-and-objective-c-library-import)。

言い換えると、ある Kotlin バージョンでコンパイルされた KMP ライブラリを公開した場合、C または Objective-C ライブラリのインポートによって、それより前の Kotlin バージョンのプロジェクトでその Kotlin ライブラリを使用できなくなる可能性があります。

この問題やその他の課題に対処するため、Kotlin チームは内部で使用されている相互運用メカニズムの見直しを進めてきました。Kotlin 2.3.20 以降では、コンパイラーオプションを介してこの新しいモードを試すことができます。

#### 有効化する方法 {id="native-new-interoperability-mode-for-c-or-objective-c-libraries-how-to-enable"}

1. Gradle ビルドファイルで、`cinterops {}` ブロックまたは `pod()` 依存関係があるかどうかを確認します。これらが存在する場合、プロジェクトは C または Objective-C ライブラリを使用しています。
2. プロジェクトが `2.3.20` 以降のバージョンを使用していることを確認します。
3. 同じビルドファイル内で、cinterop ツールの呼び出しに `-Xccall-mode` コンパイラーオプションを追加します。

   ```kotlin
   kotlin {
       targets.withType<org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget>().configureEach {
           compilations.configureEach {
               cinterops.configureEach {
                   extraOpts += listOf("-Xccall-mode", "direct")
               }
           }
       }
   }
   ```

4. 通常通りにユニットテストやアプリケーションを実行して、プロジェクトをビルドおよびテストします。Gradle が失敗後もタスクの実行を継続できるように `--continue` オプションを使用することもできます。これにより、一度により多くの問題を検出できます。

> 新しい相互運用モードはまだ[実験的（Experimental）](components-stability.md#stability-levels-explained)であるため、このモードでコンパイルされたライブラリは**まだ公開しないでください**。
>
{style="warning"}

#### 結果の報告 {id="native-new-interoperability-mode-for-c-or-objective-c-libraries-report-your-results"}

新しい相互運用モードは、ほとんどのケースでそのまま置き換えて使用できる（ドロップインの代替となる）ことが意図されています。最終的にはデフォルトで有効にする予定です。しかし、それを実現するためには可能な限り正常に動作することを確認し、幅広いプロジェクトでテストする必要があります。理由は以下のとおりです。

* 一部の C および Objective-C の宣言は、新しいモードではまだサポートされていません（主に互換性の問題によるものです）。この実環境への影響をより深く理解し、それに応じて今後のステップの優先順位を決めたいと考えています。
* バグや考慮漏れが存在する可能性があります。相互作用する多数の機能を持つ単一言語のテストでさえ困難ですが、独自の機能群を持つ言語間の相互作用のテストはさらに困難を極めます。

実際のプロジェクトを検証し、課題となるケースを特定するためにご協力ください。問題が発生したかどうかに関わらず、[YouTrack](https://youtrack.jetbrains.com/issue/KT-83218) のコメントにて結果を共有してください。

## Kotlin/Wasm {id="kotlin-wasm"}

Kotlin 2.3.20 では、文字列操作のパフォーマンス、コンパイル時間、およびメモリ使用量が改善されました。また、Kotlin のオブジェクトやクラスを JavaScript の関数のように呼び出せる実験的な `@nativeInvoke` アノテーションのサポートも追加されました。

### 文字列パフォーマンスの向上 {id="improved-string-performance"}
<secondary-label ref="wasm"/>

Kotlin/Wasm は、`kotlin.String` 値に対する操作に JS String 組み込み（builtins）を使用するようになりました。これにより Kotlin/Wasm は、プロポーザルをサポートするブラウザおよび Wasm ランタイムにおける JavaScript エンジンの文字列最適化を活用できるようになります。この最適化は、連結（concatenation）、文字列補間（interpolation）、`StringBuilder.append()`、数値から文字列への変換などの操作に適用されます。

これにより、以下が実現しました。

* 対象となるベンチマークにおいて、文字列補間が最大 4.6 倍高速化。
* [KotlinConf アプリケーション](https://github.com/JetBrains/kotlinconf-app) のビルドにおいて、Wasm バイナリが約 5% 縮小。
* すべての Wasm ベンチマーク全体で中央値約 1% の改善。
* append 処理が多いワークロードにおいて、`StringBuilder.append()` および `kotlin.String` インスタンスの連結が少なくとも 20% 高速化。

### コンパイル時間の短縮とメモリの最適化 {id="improved-compilation-time-and-memory-optimizations"}
<secondary-label ref="wasm"/>

Kotlin 2.3.20 では、特に大規模なプロジェクトにおいて、コンパイル中のメモリ消費量を大幅に削減するコンパイラーの最適化が追加されました。これらの最適化により、インクリメンタルビルドのパフォーマンスも向上します。

私たちのテストでは、クリーンビルド時間で 65% の改善、インクリメンタルビルド時間で 21% の改善が確認されました。

### `@nativeInvoke` アノテーションのサポート {id="support-for-nativeinvoke-annotation"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="wasm"/>

Kotlin 2.3.20 では、`wasmJs` ターゲット向けに `@nativeInvoke` アノテーションのサポートが導入されました。このアノテーションを使用すると、Kotlin のオブジェクトやクラスをあたかも JavaScript の関数であるかのように扱うことができます。これは、`external` 宣言（クラスまたはインターフェース）のメンバ関数を JavaScript オブジェクトの「invoke 演算子」としてマークするために設計されています。

関数にアノテーションを付与すると、Kotlin 内でのその関数へのすべての呼び出しが、JavaScript オブジェクト自体の直接呼び出しへと変換されます。

```kotlin
import kotlin.js.nativeInvoke

@OptIn(ExperimentalWasmJsInterop::class)
external class JsAction {
    @nativeInvoke
    operator fun invoke(data: String)
}

fun main() {
    val action = JsAction() 
    action("Run task")
}
```

これは、Kotlin/Wasm と JavaScript 間の安定した相互運用性が設計されるまでの一時的なソリューションです。将来のリリースで変更または削除される可能性があり、使用時にはコンパイラーが警告を出力します。

Kotlin/Wasm と JavaScript の相互運用性の詳細については、[JavaScript との相互運用](wasm-js-interop.md)を参照してください。

## Kotlin/JS {id="kotlin-js"}

Kotlin 2.3.20 では、TypeScript から Kotlin インターフェースを実装できるようになり、SWC コンパイルプラットフォームの実験的サポートが導入されました。

### JavaScript/TypeScript からの Kotlin インターフェースの実装 {id="implementing-kotlin-interfaces-from-javascript-typescript"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="js"/>

Kotlin 2.3.20 では、JavaScript/TypeScript 側で Kotlin インターフェースを実装することに関する制限が撤廃されました。以前は、Kotlin インターフェースを TypeScript インターフェースとして TypeScript にエクスポートすることしかできず、TypeScript からそれらを実装することは禁止されていました。

現在は、以下のように任意の Kotlin インターフェースを実装できます。

```kotlin
// Kotlin
@JsExport
interface DataProcessor {
    suspend fun process(): String
}

@JsExport
fun registerProcessor(processor: DataProcessor) { ... }
```

```TypeScript
// TypeScript
import { DataProcessor, registerProcessor } from "my-kmp-library"

class JsonProcessor implements DataProcessor {
    readonly [DataProcessor.Symbol] = true

    async process(): Promise<string> {
        return "processed JSON data"
    }
}

registerProcessor(new JsonProcessor())
```

また、TypeScript から Kotlin のデフォルト実装を再利用することも可能です。TypeScript にはインターフェース内のデフォルト実装という概念がありませんが、`DefaultImpls` オブジェクトに委譲することでこれを回避できます。

```kotlin
// Kotlin
@JsExport
interface Logger {
    fun log(): String = "[INFO] Default log entry"
    val prefix: String get() = "LOG"
}
```

```TypeScript
// TypeScript
import { Logger, acceptLogger } from "my-kmp-library"

class ConsoleLogger implements Logger {
    readonly [Logger.Symbol] = true

    // メソッドのデフォルト実装に委譲
    log(): string {
        return Logger.DefaultImpls.log(this);
    }

    // プロパティのデフォルト実装に委譲
    get prefix(): string {
        return Logger.DefaultImpls.prefix.get(this);
    }
}

acceptLogger(new ConsoleLogger())
```

#### 有効化する方法 {id="how-to-enable-implementing-interfaces-from-typescript"}

ビルドファイルに新しいコンパイラーオプションを追加します。

```kotlin
kotlin { 
    js {
        // ...
        generateTypeScriptDefinitions()
        compilerOptions {
            freeCompilerArgs.add("-Xenable-implementing-interfaces-from-typescript")
        }
    }
}
```

詳細については、[`@JsExport` アノテーション](js-to-kotlin-interop.md#jsexport-annotation)を参照してください。

### SWC コンパイルプラットフォームのサポート {id="support-for-swc-compilation-platform"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="js"/>

Kotlin 2.3.20 以降、Kotlin/JS は [SWC](https://swc.rs/) コンパイルプラットフォームをサポートします。これにより、新しいバージョンの JavaScript/TypeScript コードを、より古く互換性の高い JavaScript コードへとトランスパイルすることができます。

コード変換を外部ツールに委任することで、Kotlin/JS コンパイラーが生成するバリアントの数を減らし、コンパイラーの近代化を加速させて、最新の JavaScript 機能のサポートのみに集中できるようになります。現在、サポートされている最新の ECMAScript バージョンは依然として `es2015` です。

さらに、トランスパイル作業を委任することで、[インライン JavaScript](js-interop.md#inline-javascript) 機能を改善できます。現在、これは ES5 構文のみをサポートしています（これは 2.4.0 で変更される予定です）。下位バージョンをターゲットとしながら新しい構文をサポートすることは困難です。なぜなら、コンパイラーがインライン化された JS ブロック自体の内部にある JS コードをトランスパイルする必要があるためです。SWC を使用すれば最新の JS 構文を追加できるようになり、ツールがエンドユーザーのバージョンに必要な構文へとコードをトランスパイルしてくれます。

SWC への移行により、Kotlin Gradle プラグイン内で [browserslist](https://browsersl.ist/) ベースの DSL を実装する機会も得られます。これにより、特定の JS バージョンではなく、ターゲットとするブラウザや環境を宣言できるようになります。

#### 有効化する方法 {id="how-to-enable-swc-compilation"}

`gradle.properties` ファイルに以下のオプションを追加します。

```properties
kotlin.js.delegated.transpilation=true
```

将来の Kotlin リリースで SWC によるトランスパイルを安定化させる予定です。デフォルトになった後は、複数の JS ターゲットをコンパイルする機能が Kotlin/JS コンパイラーからトランスパイラーへと完全に委譲されます。

SWC プラットフォームの詳細については、公式の[ドキュメント](https://swc.rs/docs/getting-started)を参照してください。

## Gradle {id="gradle"}

Kotlin 2.3.20 は Gradle の新バージョンと互換性があり、Kotlin Gradle プラグインにおける Kotlin/JVM コンパイルの変更が含まれています。

### Gradle 9.3.0 との互換性 {id="compatibility-with-gradle-9-3-0"}
<secondary-label ref="gradle"/>

Kotlin 2.3.20 は、Gradle 7.6.3 から 9.3.0 までと完全な互換性があります。最新の Gradle リリースまでのバージョンも使用できます。ただし、その場合は非推奨の警告が表示されたり、一部の新しい Gradle 機能が動作しなかったりする可能性があることに注意してください。

### KGP におけるバイナリ互換性検証の改善 {id="improvements-to-binary-compatibility-validation-in-kgp"}
<secondary-label ref="gradle"/>

Kotlin 2.2.0 では、[Kotlin Gradle プラグインにおけるバイナリ互換性検証](gradle-binary-compatibility-validation.md) のサポートが初めて導入されました。Kotlin 2.3.20 では、2 つの改善が追加されています。

まず、バイナリ互換性検証の Gradle タスク名に "Legacy" が含まれなくなりました。古い命名規則が Kotlin 開発者を混乱させていたため、この変更を行いました。

| 以前の名前         | 新しい名前               |
|--------------------|--------------------------|
| `checkLegacyAbi`   | `checkKotlinAbi`         |
| `updateLegacyAbi`  | `updateKotlinAbi`        |
| `dumpLegacyAbi`    | `internalDumpKotlinAbi`  |

新しい名前への移行を円滑にするため、Kotlin 2.3.20 でも古いタスク名は引き続き存在します。

次に、プロジェクトでバイナリ互換性検証を有効にしている場合、Gradle で `check` タスクを実行すると `checkKotlinAbi` タスクが自動的に実行されるようになりました。以前は、`check` タスクがすべての検証タスクを実行するはずであるにもかかわらず、Gradle は `checkKotlinAbi` タスクを実行していませんでした。これにより、Gradle プロジェクトで一貫性のない動作が発生していました。

### Kotlin/JVM コンパイルでデフォルトで Build Tools API を使用 {id="kotlin-jvm-compilation-uses-build-tools-api-by-default"}
<primary-label ref="experimental-general"/>
<secondary-label ref="gradle"/>

Kotlin 2.3.20 では、Kotlin Gradle プラグインにおける Kotlin/JVM コンパイルでデフォルトで [Build Tools API](build-tools-api.md) (BTA) が使用されます。この内部コンパイルインフラストラクチャの変更により、Kotlin コンパイラーに対するビルドツールサポートの迅速な開発が可能になります。

何らかの問題に気づいた場合は、[課題トラッカー](https://youtrack.jetbrains.com/newIssue?project=KT&summary=Kotlin+Gradle+plugin+BTA+migration+issue&description=Describe+the+problem+you+encountered+here.&c=tag+kgp-bta-migration)でフィードバックを共有してください。

## Maven {id="maven"}

Kotlin 2.3.20 では、Maven プロジェクトのセットアップを容易にする重要な変更が導入されています。

### Kotlin プロジェクトのセットアップの簡素化 {id="maven-simplified-setup-for-kotlin-projects"}
<secondary-label ref="maven"/>

Kotlin 2.3.20 では、Maven プロジェクトにおける Kotlin のセットアップが容易になりました。Kotlin でソースルートおよび Kotlin 標準ライブラリの自動構成がサポートされるようになりました。

この新しい構成により、Maven ビルドシステムを使用して新しい Kotlin プロジェクトを作成する場合や、既存の Java Maven プロジェクトに Kotlin を導入する場合に、POM ビルドファイル内でソースルートパスを手動で指定したり `kotlin-stdlib` 依存関係を追加したりする必要がなくなります。

#### 有効化する方法 {id="maven-simplified-setup-for-kotlin-projects-how-to-enable"}

`pom.xml` ファイル内の Kotlin Maven プラグインの `<build><plugins>` セクションに `<extensions>true</extensions>` を追加します。

```xml
<build>
    <plugins>
         <plugin>
             <groupId>org.jetbrains.kotlin</groupId>
             <artifactId>kotlin-maven-plugin</artifactId>
             <version>%kotlinVersion%</version>
             <extensions>true</extensions> <!-- この拡張を追加 -->
         </plugin>
    </plugins>
</build>
```

ここでの `<extensions>` オプションの新しい機能は以下のとおりです。

* `src/main/kotlin` および `src/test/kotlin` ディレクトリが既に存在しているもののプラグイン構成で指定されていない場合に、それらをソースルートとして登録します。
* `kotlin-stdlib` 依存関係がまだ明示的に定義されていない場合に自動で追加します。

また、Kotlin 標準ライブラリの自動追加を無効化（オプトアウト）することもできます。その場合は、`<properties>` セクションに以下を追加します。

```xml
<project>
    <properties>
        <!-- プロパティ経由でスマートデフォルトを無効化 -->
        <kotlin.smart.defaults.enabled>false</kotlin.smart.defaults.enabled>         
    </properties>
</project>
```

このプロパティは、標準ライブラリの自動追加だけでなく、ソースルートパスの登録も無効化することに注意してください。その他の `<extensions>` 機能には影響しません。

Kotlin Maven プロジェクトの構成に関する詳細については、[Maven プロジェクトの構成](maven-configure-project.md)を参照してください。

## Build Tools API {id="build-tools-api"}

Kotlin 2.3.20 では、Build Tools API (BTA) を使用して独自のビルドシステムを Kotlin コンパイラーと統合したい開発者向けに、さらなる変更が導入されています。

### ビルド操作の改善 {id="improvements-to-build-operations"}
<secondary-label ref="bta"/>

本リリースでは、BTA によるビルドツールのビルド操作（build operations）の管理方法が改善されました。ビルド操作により、ビルドツールが Kotlin コンパイラーと対話できるようになります。各ビルド操作は [`BuildOperation`](https://github.com/JetBrains/kotlin/blob/v2.3.20/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/BuildOperation.kt#L25) インターフェースの実装です。

[`CancellableBuildOperation`](https://github.com/JetBrains/kotlin/blob/v2.3.20/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/BuildOperation.kt#L94) インターフェースを実装したビルド操作は、[`cancel()`](https://github.com/JetBrains/kotlin/blob/v2.3.20/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/BuildOperation.kt#L108) 関数を使用してキャンセルできるようになりました。

`cancel()` 関数は「ベストエフォート（best effort）」ベースで動作します。つまり、操作が確実にキャンセルされることが保証されているわけではありません。

例:

```kotlin
val operation = toolchains.jvm.jvmCompilationOperationBuilder(sources, destination) {}

toolchains.createBuildSession().use {
    try {
        it.executeOperation(operation.build())
    } catch (e: OperationCancelledException) {
        println("Build operation has been cancelled.")
    }
}

// ...

// 別のスレッドから:
operation.cancel()
```

さらに、ビルド操作が開始された後は変更できないように作成できるようになり、より堅牢になりました。これを行うには、ビルドツールでビルダーパターンを使用する必要があります。

1. ミュータブルなビルダーを使用してオブジェクトを構成します。
2. [`build()`](https://github.com/JetBrains/kotlin/blob/v2.3.20/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/jvm/operations/JvmCompilationOperation.kt#L59) 関数を呼び出して、オブジェクトのイミュータブルなインスタンスを作成します。

例:

```kotlin
fun prepareBuildOperation(toolchains: KotlinToolchains, sources: List<Path>, destination: Path): JvmCompilationOperation {
    val builder = toolchains.jvm.jvmCompilationOperationBuilder(sources, destination)

    // ビルダーを使用して操作を構成
    builder.compilerArguments[CommonToolArguments.VERBOSE] = true
    builder[COMPILER_ARGUMENTS_LOG_LEVEL] = CompilerArgumentsLogLevel.ERROR

    // イミュータブルな操作を返す
    return builder.build()
}
```

### ビルドツール間での一貫したメトリクス収集 {id="consistent-metric-collection-across-build-tools"}
<secondary-label ref="bta"/>

Kotlin 2.3.20 より前は、ビルドメトリクスのインフラストラクチャは Gradle を中心としていたため、メトリクス名などの一部のインフラストラクチャに影響を与えていました。さらに、異なる[コンパイラー実行戦略](compiler-execution-strategy.md)間ですべてのメトリクスが利用できるわけではありませんでした。

Kotlin 2.3.20 では、BTA が JVM 向けのビルドツールに依存しないメトリクス収集を提供します。また、BTA はコンパイラーの実行戦略に関係なく、一貫したメトリクスセットを導入します。特定のコンパイルアプローチやコンパイラー実行戦略に固有のメトリクスは、適用可能な場合にのみ報告されます。たとえば、インクリメンタルコンパイルのメトリクスはインクリメンタルビルドの場合にのみ利用可能であり、デーモン固有のメトリクスは Kotlin デーモンを使用している場合にのみ利用可能です。

ビルドツールは、ビルド操作に対して [`BuildMetricsCollector`](https://github.com/JetBrains/kotlin/blob/v2.3.20/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/trackers/BuildMetricsCollector.kt#L16) オブジェクトを構成し、ユーザーにビルドパフォーマンスに関する知見を提供するビルドメトリクスを取得できるようになりました。

```kotlin
val operation =
    kotlinToolchains.jvm.jvmCompilationOperationBuilder(sources, outputDirectory)
operation[BuildOperation.METRICS_COLLECTOR] = object : BuildMetricsCollector {
    override fun collectMetric(
        name: String,
        type: BuildMetricsCollector.ValueType,
        value: Long
    ) {
        // ...
    }
}
```

### ビルドツールによるコンパイラープラグインの構成の容易化 {id="easier-configuration-of-compiler-plugins-by-build-tools"}
<secondary-label ref="bta"/>

Kotlin 2.3.20 では、ビルドツールがコンパイラープラグインを構成するための新しくよりシンプルな方法が BTA から提供されます。このアプローチにより、ビルドツールはその構成をユーザーに直接伝播させることができます。

実験的なコンパイラーオプションを使用してコマンドライン経由でコンパイラープラグインを構成する代わりに、ビルドツールは `kotlin.buildtools.api.arguments.CommonCompilerArguments.COMPILER_PLUGINS` オプションを使用して、コンパイラープラグイン構成を表すオブジェクトのリストを設定できます。

```kotlin
import org.jetbrains.kotlin.buildtools.api.KotlinToolchains
import org.jetbrains.kotlin.buildtools.api.arguments.CompilerPlugin
import org.jetbrains.kotlin.buildtools.api.arguments.CompilerPluginOption
import org.jetbrains.kotlin.buildtools.api.arguments.CommonCompilerArguments.Companion.COMPILER_PLUGINS
import org.jetbrains.kotlin.buildtools.api.arguments.CompilerPlugin
import org.jetbrains.kotlin.buildtools.api.arguments.CompilerPluginOption
import org.jetbrains.kotlin.buildtools.api.jvm.JvmPlatformToolchain
import org.jetbrains.kotlin.buildtools.api.jvm.JvmPlatformToolchain.Companion.jvm
import org.jetbrains.kotlin.buildtools.api.jvm.operations.JvmCompilationOperation
import java.nio.file.Path

...

val toolchains: KotlinToolchains = ...
val jvmToolchain: JvmPlatformToolchain = toolchains.jvm
val operation: JvmCompilationOperation.Builder = jvmToolchain.jvmCompilationOperationBuilder(...)
val noArgPluginClasspath: List<Path> = ...
operation.compilerArguments[COMPILER_PLUGINS] = listOf(
    CompilerPlugin(
        pluginId = "org.jetbrains.kotlin.noarg",
        classpath = noArgPluginClasspath,
        rawArguments = listOf(CompilerPluginOption("annotation", "GenerateNoArgsConstructor")),
        orderingRequirements = emptySet(),
    )
)
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="サンプルコード"}

## 互換性を損なう変更と非推奨事項 {id="breaking-changes-and-deprecations"}

このセクションでは、重要な互換性を損なう変更（breaking changes）および非推奨事項を取り上げます。Kotlin 2.3.0 および 2.3.20 における非推奨事項の詳細については、[互換性ガイド](compatibility-guide-23.md)を参照してください。

* Kotlin 2.3.20 では、Kotlin/Wasm は後から `_initialize()` 関数を呼び出す外部 JavaScript に依存するのではなく、Wasm モジュールのインスタンス化の一環としてモジュールの初期化を実行するようになりました。この変更により Kotlin/Wasm の独立性が高まり、[ES モジュール統合プロポーザル](https://github.com/WebAssembly/esm-integration) への準備が整います。

  [`@EagerInitialization`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-eager-initialization/) アノテーションを使用している場合、モジュールの初期化が完了する前に関連コードが実行されると失敗する可能性があります。真に必要な場合を除き、`@EagerInitialization` アノテーションの使用は避けることをお勧めします。
* 実験的機能であったコンテキストレシーバー（context receivers）はサポートされなくなり、[コンテキストパラメータ（context parameters）](context-parameters.md) に置き換えられました。
* 本リリースは、[Intel チップ搭載 Apple ターゲットの非推奨化サイクル](whatsnew2220.md#deprecation-of-x86-64-apple-targets)の次のステップへと進みます。Kotlin 2.3.20 以降、`macosX64`、`tvosX64`、および `watchosX64` ターゲットが非推奨となります。次回の Kotlin リリースでこれらのターゲットのサポートを完全に削除する予定です。

  多くのサードパーティライブラリが依然として `iosX64` ターゲットに依存しているため、当面はこれをサポート Tier 3 として維持します。これは、CI テストが保証されず、異なるコンパイラーリリース間でのソースおよびバイナリの互換性が提供されない可能性があることを意味します。サポート Tier の詳細については、[Kotlin/Native ターゲットのサポート](native-target-support.md)を参照してください。
* Kotlin 2.3.20 では、Kotlin Multiplatform におけるより厳格な依存関係マッチングにより、共通（common）ソースセットとプラットフォームソースセットの間で依存関係の解決結果が異なる場合に、メタデータのコンパイルが失敗することがあります。詳細および回避策については、[YouTrack](https://youtrack.jetbrains.com/issue/KT-84533#tldr-workaround) の課題を参照してください。

## ドキュメントの更新 {id="documentation-updates"}

Kotlin エコシステムにおいて、以下のドキュメント変更を行いました。

* [Kotlin ロードマップ](roadmap.md) – 言語およびエコシステムの進化に関する Kotlin の最新の優先事項リストをご確認ください。
* [AGP 9 へのアップグレード](https://kotlinlang.org/docs/multiplatform/multiplatform-project-agp-9-migration.html) – Android アプリを含むマルチプラットフォームプロジェクトを AGP 9 に移行するためのアドバイスをご覧ください。
* [KMP アプリ向け CI の構成](https://kotlinlang.org/docs/multiplatform/kmp-ci-tutorial.html) – チュートリアルに従って、マルチプラットフォームプロジェクトにおける継続的インテグレーション用の GitHub Actions を構成します。
* [Compose UI プレビュー](https://kotlinlang.org/docs/multiplatform/compose-previews.html) – エミュレーターを実行せずに IDE でコンポーザブルをプレビューする方法を学びます。
* [Web リソースの処理](https://kotlinlang.org/docs/multiplatform/compose-web-resources.html) – Compose Multiplatform で Web リソースを処理する方法についての情報をご確認ください。
* [ビューポートのセットアップ](https://kotlinlang.org/docs/multiplatform/compose-css-styles.html) – Compose Multiplatform for Web を使用して HTML キャンバス上に UI をレンダリングするための `ComposeViewport()` 関数の使用方法を学びます。
* [カスタムコンパイラープラグイン](custom-compiler-plugins.md) – コンパイラープラグインの仕組みと、ユースケースに適合するものが見つからない場合の対処方法について学びます。
* [アプリケーション構造](https://ktor.io/docs/server-application-structure.html) – Ktor Server アプリに最適なアプリケーション構造を選択します。
* [HTTP リクエストのライフサイクル](https://ktor.io/docs/server-http-request-lifecycle.html) – HTTP リクエストのライフサイクルを使用して、クライアントが切断したときに Ktor でのリクエスト処理をキャンセルする方法を学びます。
* [依存性の注入（DI）](https://ktor.io/docs/server-dependency-injection.html) – 更新されたガイダンスと実践的な例を通じて、Ktor Server での依存性の注入の構成方法を学びます。
* [Exposed の Spring Boot 統合](https://www.jetbrains.com/help/exposed/spring-boot-integration.html#requirements) – Spring Boot 3 および 4 で Exposed を使用する方法を学びます。