[//]: # (title: Kotlin 2.3.20 の新機能)

<show-structure depth="1"/>

<web-summary>新機能、Kotlin Multiplatform、JVM、Native、JS、Wasm のアップデート、および Gradle と Maven のビルドツールサポートを網羅した Kotlin 2.3.20 のリリースノートをご覧ください。</web-summary>

_[リリース日: 2026年3月16日](releases.md#release-history)_

<tldr>
    <p>バグ修正リリース 2.3.21 の詳細については、<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.21">変更ログ</a> を参照してください。</p>
</tldr>

Kotlin 2.3.20 がリリースされました！主なハイライトは以下の通りです：

* **Gradle**: [Gradle 9.3.0 との互換性](#compatibility-with-gradle-9-3-0) および [Kotlin/JVM コンパイルでデフォルトで BTA を使用](#kotlin-jvm-compilation-uses-build-tools-api-by-default)
* **Maven**: [Kotlin プロジェクトのセットアップの簡略化](#simplified-setup-for-kotlin-projects)
* **Kotlin コンパイラプラグイン**: [Lombok が Alpha に](#lombok-is-now-alpha) および [`kotlin.plugin.jpa` プラグインにおける JPA サポートの改善](#improved-jpa-support-in-the-kotlin-plugin-jpa-plugin)
* **言語**: [名前ベースの分解宣言のサポート](#name-based-destructuring)
* **標準ライブラリ**: [`Map.Entry` の不変コピーを作成するための新しい API](#new-api-for-creating-immutable-copies-of-map-entry)
* **Kotlin/Native**: [C および Objective-C ライブラリ向けの新しい相互運用モード](#new-interoperability-mode-for-c-or-objective-c-libraries)

> Kotlin のリリースサイクルに関する情報は、[Kotlin のリリースプロセス](releases.md) を参照してください。
>
{style="tip"}

## Kotlin 2.3.20 へのアップデート

最新バージョンの Kotlin は、最新バージョンの [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) および [Android Studio](https://developer.android.com/studio) に含まれています。

新しい Kotlin バージョンにアップデートするには、IDE が最新バージョンに更新されていることを確認し、ビルドスクリプトで [Kotlin のバージョンを 2.3.20 に変更](releases.md#update-to-a-new-kotlin-version)してください。

## 新機能 {id=new-stable-features}
<primary-label ref="stable"/>

本リリースでは、以下の機能が [Stable（安定版）](components-stability.md#stability-levels-explained) になりました：

<snippet id="simplified-setup-for-kotlin-projects-content">

<var name="id1" value="simplified-setup-for-kotlin-projects"/>

<var name="id2" value="simplified-setup-for-kotlin-projects-how-to-enable"/>

### Kotlin プロジェクトのセットアップの簡略化 {id="%id1%"}
<secondary-label ref="maven"/>

Kotlin 2.3.20 では、Maven プロジェクトでの Kotlin のセットアップが容易になりました。Kotlin がソースルートと Kotlin 標準ライブラリの自動設定をサポートするようになりました。

この新しい設定により、Maven ビルドシステムで新しい Kotlin プロジェクトを作成したり、既存の Java Maven プロジェクトに Kotlin を導入したりする際に、POM ビルドファイルでソースルートのパスを手動で指定したり、`kotlin-stdlib` 依存関係を追加したりする必要がなくなります。

#### 有効にする方法 {id="%id2%"}

`pom.xml` ファイルの Kotlin Maven プラグインの `<build><plugins>` セクションに `<extensions>true</extensions>` を追加します：

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

ここでの `<extensions>` オプションの新しい機能は以下の通りです：

* `src/main/kotlin` および `src/test/kotlin` ディレクトリが既に存在し、プラグイン設定で指定されていない場合に、これらをソースルートとして登録します。
* `kotlin-stdlib` の依存関係が明示的に定義されていない場合に、これを追加します。

Kotlin 標準ライブラリの自動追加をオプトアウトすることも可能です。その場合は、`<properties>` セクションに以下を追加してください：

```xml
<project>
    <properties>
        <!-- プロパティ経由でスマートデフォルトを無効化 -->
        <kotlin.smart.defaults.enabled>false</kotlin.smart.defaults.enabled>         
    </properties>
</project>
```

このプロパティは、標準ライブラリの自動追加だけでなく、ソースルートパスの登録も無効にすることに注意してください。
その他の `<extensions>` 機能は影響を受けません。

Kotlin Maven プロジェクトの設定に関する詳細は、[Maven プロジェクトの設定](maven-configure-project.md) を参照してください。

</snippet>

## 新機能 {id=new-experimental-features}
<primary-label ref="experimental-exp"/>

本リリースでは、以下のプレタイトル（Stable 未満）の機能が利用可能です。
これには、[Beta](components-stability.md#stability-levels-explained)、[Alpha](components-stability.md#stability-levels-explained)、および [Experimental（実験的）](components-stability.md#stability-levels-explained) ステータスの機能が含まれます：

* [コンパイラ: Lombok が Alpha に](#lombok-is-now-alpha)
* [言語: 名前ベースの分解](#name-based-destructuring)
* [標準ライブラリ: Map.Entry の不変コピーを作成するための新しい API](#new-api-for-creating-immutable-copies-of-map-entry)
* [Kotlin/Native: C または Objective-C ライブラリ向けの新しい相互運用モード](#new-interoperability-mode-for-c-or-objective-c-libraries)

<snippet id="lombok-is-now-alpha-content">

<var name="id3" value="lombok-is-now-alpha"/>

### Lombok が Alpha になりました {id="%id3%"}
<primary-label ref="alpha"/>
<secondary-label ref="compiler"/>

Kotlin 1.5.20 で導入された実験的な [Lombok コンパイラプラグイン](lombok.md)は、Kotlin と Java のコードが混在するモジュールで [Java の Lombok 宣言](https://projectlombok.org/)を生成し、使用することを可能にします。

2.3.20 では、この機能をプロダクション環境で利用可能にする計画があるため、Lombok コンパイラプラグインが [Alpha](components-stability.md#stability-levels-explained) に昇格しました。ただし、現在も開発中であることに変わりはありません。

</snippet>

<snippet id="name-based-destructuring-content">

<var name="id4" value="name-based-destructuring"/>

<var name="id5" value="name-based-destructuring-how-to-enable"/>

### 名前ベースの分解 {id="%id4%"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="language"/>

Kotlin 2.3.20 では、位置ベースの `componentN()` 関数に依存するのではなく、変数をプロパティ名に一致させる *名前ベースの分解宣言（name-based destructuring declarations）* が導入されました。

これまでの [分解宣言](destructuring-declarations.md) は、位置ベースの分解を使用していました：

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

この例では、分解が `componentN()` 関数の順序に依存しているため、`email` は `username` の値を受け取り、`username` は `email` の値を受け取ってしまいます。

Kotlin 2.3.20 以降では、各変数が名前によってプロパティを参照する名前ベースの分解を使用できます：

```kotlin
fun main() {
    val user = User("alice", "alice@example.com")

    // 明示的な形式の名前ベースの分解を使用
    (val mail = email, val name = username) = user

    println(name)
    // alice

    println(mail)
    // alice@example.com
}
```

名前ベースの分解は [実験的（Experimental）](components-stability.md#stability-levels-explained) です。
コンパイラが分解宣言をどのように解釈するかは、`-Xname-based-destructuring` コンパイラオプションで制御できます。

以下のモードがあります：

* `only-syntax`: 既存の分解宣言の挙動を変えることなく、名前ベースの分解の明示的な形式を有効にします。
* `name-mismatch`: データクラスにおける位置ベースの分解で、変数名がプロパティ名と一致しない場合に警告を報告します。
* `complete`: 丸括弧を用いた短縮形式の名前ベースの分解を有効にし、角括弧構文による位置ベースの分解も引き続きサポートします。

`complete` モードを使用すると、丸括弧を用いた短縮形式の分解構文は、位置に依存するのではなく、変数をプロパティ名に一致させます：

```kotlin
val (email, username) = user
```
#### 有効にする方法 {id="%id5%"}

プロジェクトで名前ベースの分解を使用するには、ビルド設定ファイルにコンパイラオプションを追加してください：

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

名前ベースの分解をオプトインすると、角括弧を使用した位置ベースの分解のための新しい構文も導入されます：

```kotlin
// 明示的な位置ベースの分解を使用
val [username, email] = user
```

将来的には、デフォルトで名前ベースの一致を使用した分解宣言へと徐々に移行しつつ、新しい角括弧構文によって位置ベースの分解を維持する予定です。

詳細については、この機能の [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0438-name-based-destructuring.md) を参照してください。

[YouTrack](https://youtrack.jetbrains.com/issue/KT-19627) でのフィードバックをお待ちしております。

</snippet>

<snippet id="new-api-for-creating-immutable-copies-of-map-entry-content">

<var name="id6" value="new-api-for-creating-immutable-copies-of-map-entry"/>

### Map.Entry の不変コピーを作成するための新しい API {id="%id6%"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin 2.3.20 では、[`Map.Entry`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-map/-entry/) の不変コピーを作成するための `Map.Entry.copy()` 拡張関数が導入されました。
この関数を使用すると、[`Map.entries`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-map/entries.html) から取得したエントリを、マップを変更した後に再利用するために、あらかじめコピーしておくことができます。

`Map.Entry.copy()` は [実験的（Experimental）](components-stability.md#stability-levels-explained) です。
オプトインするには、`@OptIn(ExperimentalStdlibApi::class)` アノテーションまたはコンパイラオプションを使用してください：

```bash
-opt-in=kotlin.ExperimentalStdlibApi
```

以下は、`Map.Entry.copy()` を使用してミュータブルなマップからエントリを削除する例です：

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

一般的に、Kotlin/Native では C および Objective-C ライブラリを Kotlin にインポートできます。
しかし、KMP ライブラリの場合、この機能は現在、古いコンパイラバージョンとの KMP 互換性の問題により [影響を受けています](native-lib-import-stability.md#stability-of-c-and-objective-c-library-import)。

言い換えれば、ある Kotlin バージョンでコンパイルされた KMP ライブラリを公開した場合、C または Objective-C ライブラリをインポートしていると、それより前の Kotlin バージョンのプロジェクトでその Kotlin ライブラリを使用できなくなる可能性があります。

この問題やその他の課題に対処するため、Kotlin チームは内部で使用されている相互運用メカニズムを刷新してきました。
Kotlin 2.3.20 以降、コンパイラオプションを通じて新しいモードを試すことができます。

#### 有効にする方法 {id="%id8%"}

1. Gradle ビルドファイルで、`cinterops {}` ブロックまたは `pod()` 依存関係があるかどうかを確認してください。
   これらが存在する場合、プロジェクトは C または Objective-C ライブラリを使用しています。

2. プロジェクトで `2.3.20` 以降のバージョンが使用されていることを確認します。
3. 同じビルドファイルで、cinterop ツールの呼び出しに `-Xccall-mode` コンパイラオプションを追加します：

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

4. 通常どおりユニットテストやアプリを実行して、プロジェクトをビルドおよびテストします。
   また、`--continue` オプションを使用すると、失敗後も Gradle がタスクの実行を継続できるため、より多くの問題を一度に見つけやすくなります。

> この新しい相互運用モードでコンパイルされたライブラリを、まだ公開**しないでください**。この機能はまだ [実験的（Experimental）](components-stability.md#stability-levels-explained) です。
>
{style="warning"}

#### 結果の報告 {id="%id9%"}

新しい相互運用モードは、ほとんどのケースでそのまま置き換えられることを意図しています。
最終的にはこれをデフォルトで有効にする予定です。しかし、それを実現するためには、可能な限り正常に動作することを確認し、幅広いプロジェクトでテストする必要があります。理由は以下の通りです：

* 一部の C および Objective-C 宣言は、新しいモードではまだサポートされていません（主に互換性の問題によります）。これによる現実世界への影響をより深く理解し、今後のステップの優先順位を決定したいと考えています。
* バグや考慮不足の点があるかもしれません。多数の機能が相互に作用する言語のテストは困難であり、独自の機能セットを持つ言語間の相互作用のテストはさらに困難です。

現実世界のプロジェクトを調査し、困難なケースを特定するためにご協力ください。
問題が発生したかどうかにかかわらず、結果を [YouTrack](https://youtrack.jetbrains.com/issue/KT-83218) のコメントで共有してください。

</snippet>

## 言語

Kotlin 2.3.20 では、位置に依存するのではなく、変数をプロパティ名に一致させる名前ベースの分解宣言が追加されました。
また、コンテキストパラメータ（context parameters）を持つ宣言のオーバーロード解決に関する変更も導入されました。

### コンテキストパラメータのオーバーロード解決の変更
<secondary-label ref="language"/>

Kotlin 2.3.20 では、コンテキストパラメータを持つ宣言のオーバーロード解決に関する変更が導入されました。

以前は、オーバーロード解決において、コンテキストパラメータを持つ宣言を、持たない宣言よりも具体的であると扱っていました。

Kotlin 2.3.20 からはこのルールが適用されなくなり、オーバーロードの選択がより均一になります。
その結果、以前は解決できていた呼び出しが曖昧（ambiguous）になり、オーバーロードがコンテキストパラメータのみで異なる場合にコンパイルエラーが発生するようになります。
このような場合、コンパイラは潜在的な曖昧さについて警告を報告します。

例を示します：

```kotlin
class Logger {
    fun info(msg: String) = println("INFO: $msg")
}

fun saveUser(id: Int) {
    println("Saving user $id (no logger)")
}

// 警告を報告：Contextual declaration is shadowed
context(logger: Logger)
fun saveUser(id: Int) {
    logger.info("Saving user $id")
}

fun main() {
    val logger = Logger()

    context(logger) {
        // 2.3.20 では曖昧さによるエラーを報告
        saveUser(1)
    }
}
```

さらに、Kotlin 2.3.20 では、解決およびコード補完時の過剰なオーバーロード候補を減らすために、`kotlin.context` のオーバーロードの数を 22 から 6 に削減しました。

<include from="whatsnew2320.md" element-id="name-based-destructuring-content">
<var name="id4" value="language-name-based-destructuring"/>
<var name="id5" value="language-name-based-destructuring-how-to-enable"/>
</include>

## 標準ライブラリ

Kotlin 2.3.20 には、標準ライブラリの新しい実験的機能が含まれています。

<include from="whatsnew2320.md" element-id="new-api-for-creating-immutable-copies-of-map-entry-content">
<var name="id6" value="standard-library-new-api-for-creating-immutable-copies-of-map-entry"/>
</include>

## Kotlin コンパイラプラグイン

Kotlin 2.3.20 では、Lombok および `kotlin.plugin.jpa` コンパイラプラグインに重要なアップデートが行われました。

### kotlin.plugin.jpa プラグインにおける JPA サポートの改善
<secondary-label ref="compiler"/>

`kotlin.plugin.jpa` プラグインは、既存の [`no-arg`](no-arg-plugin.md) コンパイラプラグインの適用に加え、新しく追加された組み込みの JPA プリセットを使用して [`all-open`](all-open-plugin.md) コンパイラプラグインを自動的に適用するようになりました。

以前は、`kotlin("plugin.jpa")` を使用すると、JPA プリセットを伴う `no-arg` プラグインのみが有効になっていました。

本リリースでは、`all-open` プラグインが自動的に設定されるよう、`kotlin.plugin.jpa` プリセットを改善しました。これにより、遅延関連（lazy associations）が期待どおりに機能し、先行読み込み（eager loading）による余分なクエリの発生を防ぐことができます。

Kotlin 2.3.20 以降：

* `all-open` コンパイラプラグインが JPA プリセットを提供するようになりました。
* Gradle の `org.jetbrains.kotlin.plugin.jpa` プラグインは、JPA プリセットを有効にした状態で `org.jetbrains.kotlin.plugin.all-open` プラグインを自動的に適用します。
* [Maven JPA セットアップ](no-arg-plugin.md#jpa-support) では、デフォルトで JPA プリセットを伴う `all-open` が有効になります。（IntelliJ IDEA でのサポートは 2026.1 から利用可能です。）
* Maven 依存関係の `org.jetbrains.kotlin:kotlin-maven-noarg` に `org.jetbrains.kotlin:kotlin-maven-allopen` が暗黙的に含まれるようになったため、`<plugin><dependencies>` ブロックに明示的に追加する必要がなくなりました。

その結果、以下のいずれかのアノテーションが付与された JPA エンティティは、追加設定なしで自動的に `open` として扱われ、引数なしのコンストラクタが生成されます：

* `javax.persistence.Entity`
* `javax.persistence.Embeddable`
* `javax.persistence.MappedSuperclass`
* `jakarta.persistence.Entity`
* `jakarta.persistence.Embeddable`
* `jakarta.persistence.MappedSuperclass`

この変更により、ビルド設定が簡素化され、JPA フレームワークで Kotlin を使用する際の初期体験が向上します。

> 近日公開予定の [IntelliJ IDEA 2026.1](https://www.jetbrains.com/idea/whatsnew/) では、プロジェクトで Kotlin をセットアップする際に `kotlin.plugin.jpa` プラグインが自動的に設定されます。IDE はプラグインを追加し、冗長な引数なしコンストラクタ宣言を削除するためのクイックフィックスを提供します。
>
{style="tip"}

<include from="whatsnew2320.md" element-id="lombok-is-now-alpha-content">
<var name="id3" value="compiler-lombok-is-now-alpha"/>
</include>

## Kotlin/JVM

Kotlin 2.3.20 では、Java との相互運用性にいくつかの改善が導入されました。コンパイラが null 性チェックのために Vert.x の `@Nullable` アノテーションを認識するようになりました。
また、Java の `@Unmodifiable` および `@UnmodifiableView` アノテーションのサポートが追加され、アノテーションが付与されたコレクションを Kotlin で読み取り専用として扱えるようになりました。

### Vert.x @Nullable アノテーションのサポート
<secondary-label ref="jvm"/>

Kotlin 2.3.20 では、[`io.vertx.codegen.annotations.Nullable`](https://www.javadoc.io/doc/io.vertx/vertx-codegen/3.5.0/io/vertx/codegen/annotations/Nullable.html) アノテーションのサポートが追加されました。
コンパイラはこのアノテーションを認識し、デフォルトで null 性の不一致を警告として報告します。

厳密な null 性チェックを強制し、これらの警告をエラーにアップグレードするには、ビルドファイルに以下のコンパイラオプションを追加してください：

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

### Java 不変コレクションアノテーションのサポート
<secondary-label ref="jvm"/>

Kotlin 2.3.20 では、Java の [`org.jetbrains.annotations.Unmodifiable`](https://javadoc.io/doc/org.jetbrains/annotations/20.1.0/org/jetbrains/annotations/Unmodifiable.html) および [`org.jetbrains.annotations.UnmodifiableView`](https://javadoc.io/doc/org.jetbrains/annotations/24.0.1/org/jetbrains/annotations/UnmodifiableView.html) アノテーションのサポートが追加されました。

Kotlin 2.3.20 以降、これらのアノテーションが付けられた Java 宣言から返されるコレクションは、Kotlin で読み取り専用として扱われます。これらをミュータブルなコレクション型に代入すると、型の不一致警告が発生します。この警告は Kotlin 2.5.0 でエラーになる予定です。

例を示します：

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
    // 警告を報告：Java type mismatch
    val mutableView: MutableList<Any> = Java.unmodifiableView()
    val mutableCopy: MutableList<Any> = Java.unmodifiable()
}
```

## Kotlin/Native

Kotlin 2.3.20 では、C および Objective-C ライブラリ向けの新しい実験的相互運用モード、クロスコンパイルチェッカー、および Kotlin/Native プロジェクトでコンパイルキャッシュを無効にするための新しい DSL が導入されました。

### クロスコンパイルチェッカー
<secondary-label ref="native"/>

Kotlin 2.3.20 では、特定のターゲットに対してクロスコンパイルがサポートされているかどうかを判断する方法が導入されました。
これは、コンパイルタスクのステータスを追跡するサードパーティ製プラグインにとって有用です。

一般的に、Kotlin/Native はクロスコンパイルを許可しており、サポートされている任意のホストが、サポートされているターゲット向けの `.klib` アーティファクトを生成できます。
しかし、プロジェクトで [cinterop 依存関係](native-c-interop.md) を使用している場合、Apple ターゲット向けのアーティファクト生成は依然として制限されています。

新しい `crossCompilationSupported` API は、クロスコンパイルがサポートされているかどうかをチェックします。具体的には、ターゲットがホストマネージャーによって有効にされており、かつターゲットのコンパイルに cinterop 依存関係が含まれていないことを確認します。
このチェッカーはデフォルトで有効です。

サポートされているターゲットとホストの詳細については、[Kotlin/Native ドキュメント](native-target-support.md) を参照してください。

### コンパイルキャッシュを無効化するための新しい DSL
<secondary-label ref="native"/>

Kotlin 2.3.20 には、Kotlin/Native プロジェクトでコンパイルキャッシュを無効化するための新しい DSL が追加されました。
これは、キャッシュの無効化という決定をより慎重かつ明示的なものにすることを目的としています。

キャッシュを無効にすると Kotlin/Native のビルドが大幅に遅くなるため、これは一時的かつ例外的なケースでのみ使用されるべきです。
そのため、キャッシュの無効化は特定の Kotlin バージョンに関連付けられ、ドキュメントとしての役割を果たす理由（reason）を含めることが必須となりました。

プロジェクトでコンパイルキャッシュを無効にする必要がある場合は、Gradle ビルドファイルの `binaries {}` ブロックを以下のように更新してください：

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
                 reason = "キャッシュのバグ",
                 issue = URI("https://youtrack.com/YY-1111")
            )
        }
    }
}
```

* `version` – コンパイルキャッシュを無効にする対象の Kotlin バージョン。
* `reason` (必須) – コンパイルキャッシュを無効にする理由。
* `issue` (任意) – 対応するバグトラッカーの課題 URL。

新しい DSL は、非推奨となった `kotlin.native.cacheKind` Gradle プロパティを置き換えるものです。`gradle.properties` ファイルからこのプロパティを安全に削除できます。

コンパイル時間の改善に関するその他のヒントについては、[Kotlin/Native ドキュメント](native-improving-compilation-time.md) を参照してください。

<include from="whatsnew2320.md" element-id="new-interoperability-mode-for-c-or-objective-c-libraries-content">
<var name="id7" value="native-new-interoperability-mode-for-c-or-objective-c-libraries"/>
<var name="id8" value="native-new-interoperability-mode-for-c-or-objective-c-libraries-how-to-enable"/>
<var name="id9" value="native-new-interoperability-mode-for-c-or-objective-c-libraries-report-your-results"/>
</include>

## Kotlin/Wasm

Kotlin 2.3.20 では、文字列操作のパフォーマンス、コンパイル時間、およびメモリ使用量が改善されました。
また、Kotlin のオブジェクトやクラスを JavaScript の関数のように呼び出すことができる、実験的な `@nativeInvoke` アノテーションのサポートが追加されました。

### 文字列パフォーマンスの向上
<secondary-label ref="wasm"/>

Kotlin/Wasm は、`kotlin.String` 値の操作に JS String built-ins を使用するようになりました。
これにより、Kotlin/Wasm はブラウザや提案をサポートする Wasm ランタイムにおいて、JavaScript エンジンの文字列最適化の恩恵を受けることができます。
この最適化は、連結、補完、`StringBuilder.append()`、および数値から文字列への変換などの操作に適用されます。

これにより、以下のような結果が得られました：

* ターゲットを絞ったベンチマークにおいて、文字列補完が最大 4.6 倍高速化。
* [KotlinConf アプリケーション](https://github.com/JetBrains/kotlinconf-app) のビルドにおいて、Wasm バイナリが約 5% 縮小。
* すべての Wasm ベンチマーク全体で中央値が約 1% 改善。
* 追加操作の多いワークロードにおいて、`StringBuilder.append()` および `kotlin.String` インスタンスの連結が少なくとも 20% 高速化。

### コンパイル時間とメモリ最適化の改善
<secondary-label ref="wasm"/>

Kotlin 2.3.20 では、特に大規模なプロジェクトにおいて、コンパイル中のメモリ消費を大幅に削減するコンパイラ最適化が追加されました。
これらの最適化は、インクリメンタルビルドのパフォーマンスも向上させます。

テストでは、クリーンビルドの時間が 65% 改善され、インクリメンタルビルドの時間が 21% 改善されることが確認されました。

### @nativeInvoke アノテーションのサポート
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="wasm"/>

Kotlin 2.3.20 では、`wasmJs` ターゲットに対する `@nativeInvoke` アノテーションのサポートが導入されました。
このアノテーションを使用すると、Kotlin のオブジェクトやクラスを JavaScript の関数であるかのように扱うことができます。
これは、`external` 宣言（クラスまたはインターフェース）のメンバー関数を、JavaScript オブジェクトの「invoke 演算子」としてマークするように設計されています。

関数にアノテーションを付けると、Kotlin でのその関数の呼び出しはすべて、JavaScript オブジェクト自体の直接呼び出しに翻訳されます：

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

これは、Kotlin/Wasm と JavaScript 間の安定した相互運用性が設計されるまでの一時的な解決策です。
将来のリリースで変更または削除される可能性があり、使用時にはコンパイラが警告を報告します。

JavaScript との Kotlin/Wasm 相互運用性に関する詳細は、[JavaScript との相互運用性](wasm-js-interop.md) を参照してください。

## Kotlin/JS

Kotlin 2.3.20 では、TypeScript から Kotlin インターフェースを実装できるようになり、SWC コンパイルプラットフォームの実験的サポートも導入されました。

### JavaScript/TypeScript からの Kotlin インターフェースの実装
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="js"/>

Kotlin 2.3.20 では、JavaScript/TypeScript 側で Kotlin インターフェースを実装できないという制限が解除されました。以前は、Kotlin インターフェースを TypeScript インターフェースとして TypeScript にエクスポートすることしかできず、TypeScript からそれらを実装することは禁止されていました。

現在は、以下のように任意の Kotlin インターフェースを実装できます：

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

TypeScript から Kotlin のデフォルト実装（default implementations）を再利用することも可能です。
TypeScript にはインターフェース内のデフォルト実装という概念はありませんが、`DefaultImpls` オブジェクトに委譲することでこれを実現できます：

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

    // デフォルトのメソッド実装に委譲
    log(): string {
        return Logger.DefaultImpls.log(this);
    }

    // デフォルトのプロパティ実装に委譲
    get prefix(): string {
        return Logger.DefaultImpls.prefix.get(this);
    }
}

acceptLogger(new ConsoleLogger())
```

#### 有効にする方法 {id="how-to-enable-implementing-interfaces-from-typescript"}

ビルドファイルに新しいコンパイラオプションを追加してください：

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

詳細については、[`@JsExport` アノテーション](js-to-kotlin-interop.md#jsexport-annotation) を参照してください。

### SWC コンパイルプラットフォームのサポート
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="js"/>

Kotlin 2.3.20 以降、Kotlin/JS は [SWC](https://swc.rs/) コンパイルプラットフォームをサポートします。
これは、新しいバージョンの JavaScript/TypeScript コードを、より古く互換性の高い JavaScript コードにトランスパイルするのに役立ちます。

コード変換を外部ツールに委譲することで、Kotlin/JS コンパイラが生成するバリアントの数を減らし、最新の JavaScript機能のサポートのみに集中してコンパイラの近代化を加速させることができます。
現在、サポートされている最新の ECMAScript バージョンは依然として `es2015` です。

さらに、トランスパイル作業を委譲することで、[インライン JavaScript（inlined JavaScript）](js-interop.md#inline-javascript) 機能を改善できます。
現在は ES5 構文のみをサポートしていますが、これは 2.4.0 で変更される予定です。
下位バージョンをターゲットにしながら新しい構文をサポートすることは、コンパイラがインライン JS ブロック内の JS コード自体をトランスパイルする必要があるため、困難でした。SWC を使用すれば、モダンな JS 構文を追加でき、ツールがエンドユーザーのバージョンに必要な構文へとトランスパイルしてくれます。

SWC への移行により、Kotlin Gradle プラグイン内で [browserlist](https://browsersl.ist/) ベースの DSL を実装する機会も得られます。
これにより、特定の JS バージョンではなく、ターゲットとするブラウザや環境を宣言できるようになります。

#### 有効にする方法 {id="how-to-enable-swc-compilation"}

`gradle.properties` ファイルに以下のオプションを追加してください：

```properties
kotlin.js.delegated.transpilation=true
```

将来の Kotlin リリースで、SWC によるトランスパイルを安定化させる予定です。
これがデフォルトになった後は、複数の JS ターゲットをコンパイルする機能は Kotlin/JS コンパイラからトランスパイラへと完全に委譲されます。

SWC プラットフォームの詳細については、公式の [ドキュメント](https://swc.rs/docs/getting-started) を参照してください。

## Gradle

Kotlin 2.3.20 は Gradle の新バージョンと互換性があり、Kotlin Gradle プラグインにおける Kotlin/JVM コンパイルの変更が含まれています。

### Gradle 9.3.0 との互換性
<secondary-label ref="gradle"/>

Kotlin 2.3.20 は、Gradle 7.6.3 から 9.3.0 と完全な互換性があります。最新の Gradle リリースまでのバージョンも使用できますが、
その場合は非推奨の警告が表示されたり、一部の新しい Gradle 機能が動作しなかったりする可能性があることに注意してください。

### KGP におけるバイナリ互換性検証の改善
<secondary-label ref="gradle"/>

Kotlin 2.2.0 で、[Kotlin Gradle プラグインにおけるバイナリ互換性検証（binary compatibility validation）](gradle-binary-compatibility-validation.md) のサポートが初めて導入されました。Kotlin 2.3.20 では 2 つの改善が行われています。

第一に、バイナリ互換性検証の Gradle タスクの名前に "Legacy" が含まれなくなりました。
以前の命名規則は Kotlin 開発者を混乱させていたため、変更を行いました：

| 旧名称             | 新名称                   |
|--------------------|--------------------------|
| `checkLegacyAbi`   | `checkKotlinAbi`         |
| `updateLegacyAbi`  | `updateKotlinAbi`        |
| `dumpLegacyAbi`    | `internalDumpKotlinAbi`  |

新名称への移行を容易にするため、Kotlin 2.3.20 では旧名称のタスクも引き続き存在します。

第二に、プロジェクトでバイナリ互換性検証を有効にしている場合、`check` タスクを実行すると Gradle が `checkKotlinAbi` タスクを自動的に実行するようになりました。
以前は、`check` タスクがすべての検証タスクを実行するはずであるにもかかわらず、Gradle は `checkKotlinAbi` タスクを実行していませんでした。これにより Gradle プロジェクトにおける動作の不整合が生じていました。

### Kotlin/JVM コンパイルで Build tools API をデフォルトで使用
<primary-label ref="experimental-general"/>
<secondary-label ref="gradle"/>

Kotlin 2.3.20 では、Kotlin Gradle プラグインにおける Kotlin/JVM コンパイルが、デフォルトで [Build tools API](build-tools-api.md) (BTA) を使用するようになりました。この内部コンパイルインフラストラクチャの変更により、Kotlin コンパイラに対するビルドツールサポートのより迅速な開発が可能になります。

問題に気付いた場合は、[課題トラッカー](https://youtrack.jetbrains.com/newIssue?project=KT&summary=Kotlin+Gradle+plugin+BTA+migration+issue&description=Describe+the+problem+you+encountered+here.&c=tag+kgp-bta-migration) でフィードバックを共有してください。

## Maven

Kotlin 2.3.20 では、Maven プロジェクトのセットアップを容易にするための重要な変更が行われました。

<include from="whatsnew2320.md" element-id="simplified-setup-for-kotlin-projects-content">
<var name="id1" value="maven-simplified-setup-for-kotlin-projects"/>
<var name="id2" value="maven-simplified-setup-for-kotlin-projects-how-to-enable"/>
</include>

## Build tools API

Kotlin 2.3.20 では、ビルドツール API (BTA) を使用して、自身のビルドシステムを Kotlin コンパイラと統合したい開発者のための変更がさらに導入されました。

### ビルド操作の改善
<secondary-label ref="bta"/>

本リリースでは、BTA によるビルドツールのビルド操作の管理方法が改善されました。
ビルド操作（build operations）により、ビルドツールは Kotlin コンパイラと対話できます。
各ビルド操作は [`BuildOperation`](https://github.com/JetBrains/kotlin/blob/v2.3.20/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/BuildOperation.kt#L25) インターフェースの実装です。

[`CancellableBuildOperation`](https://github.com/JetBrains/kotlin/blob/v2.3.20/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/BuildOperation.kt#L94) インターフェースを実装しているビルド操作は、[`cancel()`](https://github.com/JetBrains/kotlin/blob/v2.3.20/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/BuildOperation.kt#L108) 関数でキャンセルできるようになりました。

`cancel()` 関数は「ベストエフォート」ベースで動作します。つまり、操作が確実にキャンセルされることが保証されているわけではありません。

例を示します：

```kotlin
val operation = toolchains.jvm.jvmCompilationOperationBuilder(sources, destination) {}

toolchains.createBuildSession().use {
    try {
        it.executeOperation(operation.build())
    } catch (e: OperationCancelledException) {
        println("ビルド操作がキャンセルされました。")
    }
}

// ...

// 別のスレッドから：
operation.cancel()
```

さらに、開始後に変更できないようにビルド操作を作成できるようになったため、ビルド操作の堅牢性が向上しました。これを実現するために、ビルドツールはビルダーパターンを使用する必要があります：

1. ミュータブルなビルダーを使用してオブジェクトを設定します。
2. [`build()`](https://github.com/JetBrains/kotlin/blob/v2.3.20/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/jvm/operations/JvmCompilationOperation.kt#L59) 関数を呼び出して、オブジェクトのイミュータブル（不変）なインスタンスを作成します。

例を示します：

```kotlin
fun prepareBuildOperation(toolchains: KotlinToolchains, sources: List<Path>, destination: Path): JvmCompilationOperation {
    val builder = toolchains.jvm.jvmCompilationOperationBuilder(sources, destination)

    // ビルダーを使用して操作を設定
    builder.compilerArguments[CommonToolArguments.VERBOSE] = true
    builder[COMPILER_ARGUMENTS_LOG_LEVEL] = CompilerArgumentsLogLevel.ERROR

    // 不変な操作を返す
    return builder.build()
}
```

### ビルドツール間での一貫したメトリクス収集
<secondary-label ref="bta"/>

Kotlin 2.3.20 以前は、ビルドメトリクスのインフラストラクチャは Gradle 中心であったため、メトリクス名などの一部にその影響が及んでいました。
また、[コンパイラ実行戦略（compiler execution strategies）](compiler-execution-strategy.md) によっては利用できないメトリクスもありました。

Kotlin 2.3.20 では、BTA が JVM 向けのビルドツールに依存しないメトリクス収集を提供します。
また BTA は、コンパイラ実行戦略に関係なく、一貫したメトリクスのセットを導入します。
特定のコンパイル手法やコンパイラ実行戦略に固有のメトリクスは、適用可能な場合にのみ報告されます。
例えば、インクリメンタルビルドのメトリクスはインクリメンタルビルドの場合のみ利用可能であり、デーモン固有のメトリクスは Kotlin デーモンを使用している場合のみ利用可能です。

ビルドツールは、ビルド操作に対して [`BuildMetricsCollector`](https://github.com/JetBrains/kotlin/blob/v2.3.20/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/trackers/BuildMetricsCollector.kt#L16) オブジェクトを設定し、ビルドパフォーマンスに関する洞察をユーザーに提供するビルドメトリクスをキャプチャできるようになりました。

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

### ビルドツールによるコンパイラプラグインの設定の容易化
<secondary-label ref="bta"/>

Kotlin 2.3.20 では、BTA がビルドツール向けに、コンパイラプラグインを設定するための新しくシンプルな方法を提供します。
このアプローチにより、ビルドツールは設定をユーザーに直接伝搬させることができます。

実験的なコンパイラオプションを使用してコマンドライン経由でコンパイラプラグインを設定する代わりに、
ビルドツールは `kotlin.buildtools.api.arguments.CommonCompilerArguments.COMPILER_PLUGINS` オプションを使用して、コンパイラプラグイン設定を表すオブジェクトのリストを設定できます：

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

## 重大な変更と非推奨

このセクションでは、重要な重大な変更（Breaking changes）と非推奨事項をハイライトします。Kotlin 2.3.0 および 2.3.20 における非推奨事項の詳細については、[互換性ガイド](compatibility-guide-23.md) を参照してください。

* Kotlin 2.3.20 では、Kotlin/Wasm のモジュール初期化が、後で `_initialize()` 関数を呼び出す外部 JavaScript に依存するのではなく、Wasm モジュールのインスタンス化の一部として実行されるようになりました。
  この変更により、Kotlin/Wasm の独立性が高まり、[ES モジュール統合の提案](https://github.com/WebAssembly/esm-integration) に向けた準備が整います。

  [`@EagerInitialization`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-eager-initialization/) アノテーションを使用している場合、モジュール初期化が完了する前に関連コードが実行されると失敗する可能性があります。本当に必要な場合を除き、`@EagerInitialization` アノテーションの使用を避けることをお勧めします。
* 実験的なコンテキストレシーバー（context receivers）はサポートを終了し、[コンテキストパラメータ（context parameters）](context-parameters.md) に置き換えられました。
* 本リリースでは、[Intel チップベース of Apple ターゲットの非推奨サイクル](whatsnew2220.md#deprecation-of-x86-64-apple-targets) が次の段階に進みます。Kotlin 2.3.20 以降、`macosX64`、`tvosX64`、および `watchosX64` ターゲットを非推奨にします。次の Kotlin リリースで、これらのターゲットのサポートを完全に削除する予定です。

  多くのサードパーティライブラリが依然として `iosX64` ターゲットに依存しているため、当面の間、これはサポートティア 3 として維持します。これは、CI テストが保証されず、異なるコンパイラリリース間でのソースおよびバイナリ互換性が提供されない可能性があることを意味します。サポートティアの詳細については、[Kotlin/Native ターゲットサポート](native-target-support.md) を参照してください。
* Kotlin 2.3.20 では、Kotlin Multiplatform における依存関係マッチングが厳格化されたため、共通ソースセットとプラットフォームソースセットの間で依存関係の解決が異なる場合に、メタデータコンパイルが失敗することがあります。詳細と回避策については、[YouTrack の課題](https://youtrack.jetbrains.com/issue/KT-84533#tldr-workaround) を参照してください。

## ドキュメントのアップデート

Kotlin エコシステムにおいて、以下のドキュメントの変更を行いました：

* [Kotlin ロードマップ](roadmap.md) – 言語とエコシステムの進化に関する Kotlin の最新の優先事項を確認してください。
* [AGP 9 へのアップグレード](https://kotlinlang.org/docs/multiplatform/multiplatform-project-agp-9-migration.html) – Android アプリを含むマルチプラットフォームプロジェクトを AGP 9 に移行するためのアドバイスをご覧ください。
* [KMP アプリの CI 設定](https://kotlinlang.org/docs/multiplatform/kmp-ci-tutorial.html) – マルチプラットフォームプロジェクトにおける継続的インテグレーションのために GitHub Actions を設定するチュートリアルに従ってください。
* [Compose UI プレビュー](https://kotlinlang.org/docs/multiplatform/compose-previews.html) – エミュレーターを実行せずに IDE 内でコンポーザブルをプレビューする方法を学びます。
* [Web リソースの取り扱い](https://kotlinlang.org/docs/multiplatform/compose-web-resources.html) – Compose Multiplatform における Web リソースの取り扱いに関する情報を確認してください。
* [ビューポートの設定](https://kotlinlang.org/docs/multiplatform/compose-css-styles.html) – Compose Multiplatform for Web を使用して HTML キャンバス上に UI をレンダリングするために `ComposeViewport()` 関数を使用する方法を学びます。
* [カスタムコンパイラプラグイン](custom-compiler-plugins.md) – コンパイラプラグインの仕組みと、ユースケースに合うものが見つからない場合に何ができるかを学びます。
* [アプリケーション構造](https://ktor.io/docs/server-application-structure.html) – Ktor Server アプリに最適なアプリケーション構造を選択してください。
* [HTTP リクエストのライフサイクル](https://ktor.io/docs/server-http-request-lifecycle.html) – HTTP リクエストのライフサイクルを使用して、クライアントが切断したときに Ktor でのリクエスト処理をキャンセルする方法を学びます。
* [依存関係の注入](https://ktor.io/docs/server-dependency-injection.html) – 更新されたガイダンスと実践的な例を使用して、Ktor Server で依存関係の注入を設定する方法を学びます。
* [Exposed の Spring Boot 統合](https://www.jetbrains.com/help/exposed/spring-boot-integration.html#requirements) – Spring Boot 3 および 4 で Exposed を使用する方法を学びます。