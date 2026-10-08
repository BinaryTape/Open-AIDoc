[//]: # (title: オプトイン要求)

Kotlin標準ライブラリは、特定のAPI要素の使用に対して明示的な同意を要求し、それを与えるためのメカニズムを提供しています。
このメカニズムにより、ライブラリの作者は、APIが実験的な状態で将来変更される可能性がある場合など、オプトインが必要な特定の条件についてユーザーに通知できます。

ユーザーを保護するため、コンパイラはこれらの条件について警告を発し、APIを使用する前にオプトインすることを要求します。

## APIへのオプトイン {id="opt-in-to-api"}

ライブラリの作者がライブラリのAPIにある宣言を **[オプトインが必要](#require-opt-in-to-use-api)** としてマークしている場合、コード内でそれを使用する前に明示的な同意を与える必要があります。
オプトインにはいくつかの方法があります。状況に最も適したアプローチを選択することをお勧めします。

### ローカルでのオプトイン {id="opt-in-locally"}

コード内で特定のAPI要素を使用する際に、その要素に対してのみオプトインするには、実験的なAPIマーカーへの参照を指定した [`@OptIn`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-opt-in/) アノテーションを使用します。例えば、オプトインが必要な `DateProvider` クラスを使用したいとします。

```kotlin
// ライブラリ側のコード
@RequiresOptIn(message = "This API is experimental. It could change in the future without notice.")
@Retention(AnnotationRetention.BINARY)
@Target(AnnotationTarget.CLASS, AnnotationTarget.FUNCTION)
annotation class MyDateTime

@MyDateTime
// オプトインが必要なクラス
class DateProvider
```

自分のコードで `DateProvider` クラスを使用する関数を宣言する前に、`MyDateTime` アノテーションクラスへの参照を含む `@OptIn` アノテーションを追加します。

```kotlin
// クライアント側のコード
@OptIn(MyDateTime::class)

// DateProviderを使用
fun getDate(): Date {
    val dateProvider: DateProvider
    // ...
}
```

このアプローチでは、`getDate()` 関数がコードの他の場所で呼び出されたり、別の開発者によって使用されたりしても、オプトインは必要ないことに注意してください。

```kotlin
// クライアント側のコード
@OptIn(MyDateTime::class)

// DateProviderを使用
fun getDate(): Date {
    val dateProvider: DateProvider
    // ...
}

fun displayDate() {
    // OK: オプトインは不要
    println(getDate()) 
}
```

オプトインの要求は伝播されないため、他のユーザーが知らないうちに実験的なAPIを使用してしまう可能性があります。これを避けるには、オプトイン要求を伝播させる方が安全です。

#### オプトイン要求の伝播 {id="propagate-opt-in-requirements"}

ライブラリ内など、サードパーティによる使用を想定したコードでAPIを使用する場合、そのオプトイン要求を自身のAPIにも伝播させることができます。これを行うには、ライブラリで使用されているものと同じ **[オプトイン要求アノテーション](#create-opt-in-requirement-annotations)** で自身の宣言をマークします。

例えば、`DateProvider` クラスを使用する関数を宣言する前に、`@MyDateTime` アノテーションを追加します。

```kotlin
// クライアント側のコード
@MyDateTime
fun getDate(): Date {
    // OK: この関数もオプトインが必要になる
    val dateProvider: DateProvider
    // ...
}

fun displayDate() {
    println(getDate())
    // エラー: getDate() はオプトインが必要
}
```

この例からわかるように、アノテーションが付けられた関数は `@MyDateTime` APIの一部であるかのように見えます。
この伝播により、`getDate()` 関数のユーザーに対してもオプトイン要求が引き継がれます。

API要素のシグネチャにオプトインが必要な型が含まれている場合、そのシグネチャ自体もオプトインを要求する必要があります。そうでない場合、API要素自体はオプトインを要求していないのに、そのシグネチャにオプトインが必要な型が含まれていると、それを使用しようとした際にエラーが発生します。

```kotlin
// クライアント側のコード
@MyDateTime
fun getDate(dateProvider: DateProvider = DateProvider()): Date

@MyDateTime
fun displayDate() {
    // OK: この関数もオプトインが必要になる
    println(getDate())
}
```

同様に、シグネチャにオプトインが必要な型を含む宣言に対して `@OptIn` を適用した場合でも、オプトイン要求は依然として伝播します。

```kotlin
// クライアント側のコード
@OptIn(MyDateTime::class)
// シグネチャに DateProvider が含まれているため、オプトインが伝播する
fun getDate(dateProvider: DateProvider = DateProvider()): Date

fun displayDate() {
    println(getDate())
    // エラー: getDate() はオプトインが必要
}
```

オプトイン要求を伝播させる際、API要素が安定（stable）になりオプトイン要求がなくなったとしても、そのオプトイン要求を依然として持っている他のAPI要素は実験的なままになることを理解しておくことが重要です。例えば、ライブラリの作者が `getDate()` 関数が安定したためにオプトイン要求を削除したとします。

```kotlin
// ライブラリ側のコード
// オプトイン要求なし
fun getDate(): Date {
    val dateProvider: DateProvider
    // ...
}
```

オプトインアノテーションを削除せずに `displayDate()` 関数を使用し続けると、オプトインが不要になった後でも、その関数は実験的なままとなります。

```kotlin
// クライアント側のコード

// まだ実験的！
@MyDateTime 
fun displayDate() {
    // 安定したライブラリ関数を使用
    println(getDate())
}
```

#### 複数のAPIへのオプトイン {id="opt-in-to-multiple-apis"}

複数のAPIに対してオプトインするには、宣言をそれらすべてのオプトイン要求アノテーションでマークします。例：

```kotlin
@ExperimentalCoroutinesApi
@FlowPreview
```

または、代わりに `@OptIn` を使用します。

```kotlin
@OptIn(ExperimentalCoroutinesApi::class, FlowPreview::class)
```

### ファイル単位のオプトイン {id="opt-in-a-file"}

ファイル内のすべての関数およびクラスに対してオプトインが必要なAPIを使用するには、ファイルの先頭（パッケージ指定およびインポートの前）にファイルレベルのアノテーション `@file:OptIn` を追加します。

 ```kotlin
 // クライアント側のコード
 @file:OptIn(MyDateTime::class)
 ```

### モジュール単位のオプトイン {id="opt-in-a-module"}

> `-opt-in` コンパイラオプションは Kotlin 1.6.0 以降で利用可能です。それより前の Kotlin バージョンでは、`-Xopt-in` を使用してください。
>
{style="note"}

オプトインが必要なAPIの使用箇所すべてにアノテーションを付けたくない場合は、モジュール全体でそれらに対してオプトインすることができます。
モジュール内でAPIの使用をオプトインするには、引数 `-opt-in` を指定してコンパイルし、使用するAPIのオプトイン要求アノテーションの完全修飾名を指定します： `-opt-in=org.mylibrary.OptInAnnotation`。
この引数を指定してコンパイルすることは、モジュール内のすべての宣言に `@OptIn(OptInAnnotation::class)` アノテーションが付いているのと同じ効果があります。

Gradleでモジュールをビルドする場合は、以下のように引数を追加できます。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

tasks.named<KotlinCompilationTask<*>>("compileKotlin").configure {
    compilerOptions.optIn.add("org.mylibrary.OptInAnnotation")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

tasks.named('compileKotlin', KotlinCompilationTask) {
    compilerOptions {
        optIn.add('org.mylibrary.OptInAnnotation')
    }
}
```

</tab>
</tabs>

Gradleモジュールがマルチプラットフォームモジュールの場合は、`optIn` メソッドを使用します。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    compilerOptions {
        optIn.add("org.mylibrary.OptInAnnotation")
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    compilerOptions {
        optIn.add('org.mylibrary.OptInAnnotation')
    }
}
```

</tab>
</tabs>

Mavenの場合は、以下を使用します。

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <version>${kotlin.version}</version>
            <executions>...</executions>
            <configuration>
                <args>
                    <arg>-opt-in=org.mylibrary.OptInAnnotation</arg>                    
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

モジュールレベルで複数のAPIに対してオプトインするには、モジュールで使用されている各オプトイン要求マーカーに対して、上述の引数を1つずつ追加します。

### クラスやインターフェースの継承におけるオプトイン {id="opt-in-to-inherit-from-a-class-or-interface"}

ライブラリの作者がAPIを提供しつつも、ユーザーがそれを拡張（継承）する前に明示的なオプトインを要求したい場合があります。
例えば、ライブラリのAPIは使用に関しては安定していても、将来的に新しい抽象関数が追加される可能性があるため、継承に関しては安定していないといったケースです。
ライブラリ作者は、[open](inheritance.md) クラスや [抽象クラス](classes.md#abstract-classes)、および [関数型ではないインターフェース](interfaces.md) に [`@SubclassOptInRequired`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-subclass-opt-in-required/) アノテーションを付けることで、これを強制できます。

このようなAPI要素を使用し、自身のコードでそれを拡張するためにオプトインするには、アノテーションクラスへの参照を指定した `@SubclassOptInRequired` アノテーションを使用します。例えば、オプトインが必要な `CoreLibraryApi` インターフェースを使用したいとします。

```kotlin
// ライブラリ側のコード
@RequiresOptIn(
 level = RequiresOptIn.Level.WARNING,
 message = "Interfaces in this library are experimental"
)
annotation class UnstableApi()

@SubclassOptInRequired(UnstableApi::class)
// 拡張するためにオプトインが必要なインターフェース
interface CoreLibraryApi 
```

自身のコードで、`CoreLibraryApi` インターフェースを継承する新しいインターフェースを作成する前に、`UnstableApi` アノテーションクラスへの参照を含む `@SubclassOptInRequired` アノテーションを追加します。

```kotlin
// クライアント側のコード
@SubclassOptInRequired(UnstableApi::class)
interface SomeImplementation : CoreLibraryApi
```

クラスに `@SubclassOptInRequired` アノテーションを使用した場合、オプトイン要求は [内部クラスや入れ子のクラス](nested-classes.md) には伝播されないことに注意してください。

```kotlin
// ライブラリ側のコード
@RequiresOptIn
annotation class ExperimentalFeature

@SubclassOptInRequired(ExperimentalFeature::class)
open class FileSystem {
    open class File
}

// クライアント側のコード

// オプトインが必要
class NetworkFileSystem : FileSystem()

// 入れ子のクラス
// オプトインは不要
class TextFile : FileSystem.File()
```

あるいは、`@OptIn` アノテーションを使用してオプトインすることもできます。また、実験的マーカーアノテーションを使用して、自身のコード内でのそのクラスの使用箇所すべてに要求をさらに伝播させることもできます。

```kotlin
// クライアント側のコード
// @OptIn アノテーションを使用する場合
@OptInRequired(UnstableApi::class)
interface SomeImplementation : CoreLibraryApi

// アノテーションクラスを参照するアノテーションを使用する場合
// オプトイン要求をさらに伝播させる
@UnstableApi
interface SomeImplementation : CoreLibraryApi
```

## API利用にオプトインを要求する {id="require-opt-in-to-use-api"}

ライブラリのユーザーがAPIを使用できるようになる前に、オプトインを要求することができます。さらに、オプトイン要求を削除することを決定するまで、APIを使用するための特別な条件についてユーザーに通知することもできます。

### オプトイン要求アノテーションの作成 {id="create-opt-in-requirement-annotations"}

モジュールのAPIの使用にオプトインを要求するには、**オプトイン要求アノテーション**として使用するアノテーションクラスを作成します。
このクラスには [`@RequiresOptIn`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-requires-opt-in/) アノテーションを付ける必要があります。

```kotlin
@RequiresOptIn
@Retention(AnnotationRetention.BINARY)
@Target(AnnotationTarget.CLASS, AnnotationTarget.FUNCTION)
annotation class MyDateTime
```

オプトイン要求アノテーションは、いくつかの要件を満たす必要があります。以下を持つ必要があります：

* `BINARY` または `RUNTIME` の [リテンション（保持期間）](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.annotation/-retention/)。
* [ターゲット](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.annotation/-target/) として `EXPRESSION`、`FILE`、`TYPE`、または `TYPE_PARAMETER` を含まない。
* パラメータを持たない。

オプトイン要求には、2つの深刻度 [レベル](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-requires-opt-in/-level/) のいずれかを設定できます：

* `RequiresOptIn.Level.ERROR`: オプトインが必須です。そうしないと、マークされたAPIを使用するコードはコンパイルされません。これがデフォルトのレベルです。
* `RequiresOptIn.Level.WARNING`: オプトインは必須ではありませんが、推奨されます。オプトインがない場合、コンパイラは警告を発します。

希望するレベルを設定するには、`@RequiresOptIn` アノテーションの `level` パラメータを指定します。

さらに、APIユーザーへの `message` を提供することもできます。コンパイラは、オプトインなしでAPIを使用しようとするユーザーに対してこのメッセージを表示します。

```kotlin
@RequiresOptIn(level = RequiresOptIn.Level.WARNING, message = "This API is experimental. It can be incompatibly changed in the future.")
@Retention(AnnotationRetention.BINARY)
@Target(AnnotationTarget.CLASS, AnnotationTarget.FUNCTION)
annotation class ExperimentalDateTime
```

オプトインが必要な独立した機能を複数公開する場合は、それぞれに対してアノテーションを宣言してください。
これにより、クライアントは明示的に受け入れた機能のみを使用できるようになるため、APIの使用がより安全になります。
これは、機能ごとに独立してオプトイン要求を削除できることも意味し、APIの保守が容易になります。

### API要素のマーク {id="mark-api-elements"}

API要素にオプトインを要求するには、その宣言にオプトイン要求アノテーションを付けます。

```kotlin
@MyDateTime
class DateProvider

@MyDateTime
fun getTime(): Time {}
```

一部の言語要素については、オプトイン要求アノテーションを適用できないことに注意してください。

* プロパティのバッキングフィールドやゲッターにアノテーションを付けることはできません。プロパティ自体にのみ可能です。
* ローカル変数や値パラメータにアノテーションを付けることはできません。

## API拡張にオプトインを要求する {id="require-opt-in-to-extend-api"}

APIのどの特定の部分が使用可能で拡張可能であるかについて、よりきめ細かな制御を行いたい場合があります。例えば、使用に関しては安定しているが、以下のようなAPIがある場合です：

* 継続的な進化により、**実装に関しては不安定**な場合。例えば、デフォルト実装のない新しい抽象関数を追加する予定があるインターフェース群など。
* 個々の関数が協調して動作する必要があるなど、**実装が繊細（デリケート）または壊れやすい**場合。
* 外部の実装に対して、将来的に後方互換性のない方法で**コントラクト（契約）が弱められる可能性がある**場合。例えば、以前は `null` 値を考慮していなかったコードにおいて、入力パラメータ `T` を null 許容バージョンの `T?` に変更する場合など。

このような場合、ユーザーがAPIをさらに拡張する前にオプトインを要求することができます。ユーザーは、APIを継承したり抽象関数を実装したりすることで、APIを拡張できます。[`@SubclassOptInRequired`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-subclass-opt-in-required/) アノテーションを使用することで、[open](inheritance.md) クラスや [抽象クラス](classes.md#abstract-classes)、および [関数型ではないインターフェース](interfaces.md) に対してこのオプトイン要求を強制できます。

API要素にオプトイン要求を追加するには、アノテーションクラスへの参照を指定した [`@SubclassOptInRequired`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-subclass-opt-in-required/) アノテーションを使用します。

```kotlin
@RequiresOptIn(
 level = RequiresOptIn.Level.WARNING,
 message = "Interfaces in this library are experimental"
)
annotation class UnstableApi()

@SubclassOptInRequired(UnstableApi::class)
// 拡張するためにオプトインが必要なインターフェース
interface CoreLibraryApi 
```

`@SubclassOptInRequired` アノテーションを使用してオプトインを要求した場合、その要求は [内部クラスや入れ子のクラス](nested-classes.md) には伝播されないことに注意してください。

APIで `@SubclassOptInRequired` アノテーションを使用する方法の実際の例については、`kotlinx.coroutines` ライブラリの [`SharedFlow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-shared-flow/) インターフェースを確認してください。

## 安定版前APIのオプトイン要求 {id="opt-in-requirements-for-pre-stable-apis"}

まだ安定していない機能に対してオプトイン要求を使用する場合は、クライアントコードを壊さないように、APIの卒業（安定版への移行）を慎重に扱ってください。

安定版前のAPIが卒業し、安定した状態でリリースされたら、宣言からオプトイン要求アノテーションを削除します。これにより、クライアントは制限なしに使用できるようになります。ただし、既存のクライアントコードとの互換性を保つために、アノテーションクラス自体はモジュール内に残しておく必要があります。

APIユーザーに対して、コードからアノテーションを削除して再コンパイルすることでモジュールを更新するよう促すには、アノテーションを [`@Deprecated`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-deprecated/) としてマークし、非推奨メッセージで説明を提供します。

```kotlin
@Deprecated("This opt-in requirement is not used anymore. Remove its usages from your code.")
@RequiresOptIn
annotation class ExperimentalDateTime
```
