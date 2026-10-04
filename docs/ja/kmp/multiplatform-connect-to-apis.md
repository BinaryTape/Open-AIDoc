[//]: # (title: プラットフォーム固有のAPIを使用する)

この記事では、マルチプラットフォームアプリケーションやライブラリを開発する際に、プラットフォーム固有のAPIを使用する方法について学びます。

<video src="https://www.youtube.com/v/bSNumV04y_w" title="Using Platform-Specific APIs in KMP Apps"/>

## Kotlin Multiplatformライブラリ {id="kotlin-multiplatform-libraries"}

プラットフォーム固有のAPIを使用するコードを書く前に、代わりにマルチプラットフォームライブラリを使用できないか確認してください。
この種のライブラリは、プラットフォームごとに異なる実装を持つ共通のKotlin APIを提供します。

ネットワーク処理、ロギング、アナリティクスなどの実装や、デバイス機能へのアクセスなどに利用できる多くのライブラリがすでに存在しています。Kotlin Multiplatformライブラリの検索プラットフォームである [klibs.io](https://klibs.io) でライブラリを探してみてください。

## expectedおよびactualの関数とプロパティ {id="expected-and-actual-functions-and-properties"}

Kotlinは、共通ロジックを開発しながらプラットフォーム固有のAPIにアクセスするための言語メカニズムである、[expected/actual宣言（期待宣言と実宣言）](multiplatform-expect-actual.md)を提供しています。

このメカニズムでは、マルチプラットフォームモジュールの共通ソースセット（common source set）でexpected宣言を定義し、各プラットフォームのソースセットでそのexpected宣言に対応するactual宣言を提供する必要があります。コンパイラは、共通ソースセットで `expect` キーワードが付与されたすべての宣言に対して、対象となるすべてのプラットフォームソースセットに対応する `actual` キーワード付きの宣言が存在することを保証します。

これは、関数、クラス、インターフェース、列挙型（enum）、プロパティ、アノテーションなど、ほとんどのKotlin宣言で機能します。このセクションでは、expectedおよびactualの関数とプロパティの使用に焦点を当てます。

![expectedおよびactualの関数とプロパティの使用](expect-functions-properties.svg){width=700}

この例では、共通ソースセットで期待される `platform()` 関数（expected宣言）が定義され、プラットフォームソースセットで実際の実装（actual宣言）が提供されています。
特定のプラットフォーム向けにコードを生成する際、Kotlinコンパイラはexpected宣言とactual宣言をマージします。
その結果、ターゲットプラットフォーム向けの実装を持つ `platform()` 関数が生成されます。

生成されるプラットフォームコード内で*1つの宣言*にマージされるためには、expected宣言とactual宣言が同じパッケージで定義されている必要があります。
これにより、共通コード内のexpected `platform()` 関数の呼び出しは、正しいactual実装に対応するようになります。

expectedおよびactual関数と同様に、expectedおよびactualプロパティを使用することで、プラットフォームごとに異なる値を使用できます。expectedおよびactualの関数やプロパティは、シンプルなユースケースに最も役立ちます。

### 例: UUIDの生成 {id="example-generate-a-uuid"}

Kotlin Multiplatformを使用してiOSおよびAndroidアプリケーションを開発しており、汎用一意識別子（UUID: universally unique identifier）を生成する仕組みが必要だと仮定しましょう。

これを行うには、Kotlin Multiplatformモジュールの共通ソースセットで、`expect` キーワードを使用してexpected関数 `randomUUID()` を宣言します。
`expect` 宣言には実装コードを**含めないでください**。

```kotlin
// common ソースセット内:
expect fun randomUUID(): String
```

各プラットフォーム固有のソースセット（iOSおよびAndroid）で、共通モジュールで期待（expect）されている `randomUUID()` 関数のactual実装を提供します。これらの実際の実装には `actual` キーワードを使用します。

![expectedおよびactual宣言によるUUIDの生成](expect-generate-uuid.svg){width=700}

以下のスニペットは、AndroidとiOSの実装を示しています。プラットフォーム固有のコードでは `actual` キーワードを使用し、関数名を共通コードと同じにします。

```kotlin
// Android ソースセット内:
import java.util.*

actual fun randomUUID() = UUID.randomUUID().toString()
```

```kotlin
// iOS ソースセット内:
import platform.Foundation.NSUUID

actual fun randomUUID(): String = NSUUID().UUIDString()
```

Androidの実装ではAndroidで利用可能なAPIを使用し、iOSの実装ではiOSで利用可能なAPIを使用します。Kotlin/NativeコードからはiOSのAPIにアクセスできます。

Android向けのプラットフォームコードを生成する際、Kotlinコンパイラはexpected宣言とactual宣言を自動的にマージし、実際のAndroid固有実装を持つ単一の `randomUUID()` 関数を生成します。iOSに対しても同様の処理が実行されます。

### expect/actual宣言に関する詳細 {id="further-reading-on-expect-actual-declarations"}

* `expect`/`actual` 宣言が実際に動作する様子を確認するには、各ターゲットのプラットフォーム名を返す関数を含む [基本的なKMPアプリの例](quickstart.md#create-a-project) をご覧ください。
* `expect`/`actual` メカニズムの詳細については、[Expected and actual declarations](multiplatform-expect-actual.md)（期待宣言と実宣言）を参照してください。

## 共通コードでのインターフェース {id="interfaces-in-common-code"}

[Kotlinの継承メカニズム](https://kotlinlang.org/docs/inheritance.html)により、より柔軟なコード共有が可能になります。
例えば、プラットフォームに依存しない抽象的な宣言を持つインターフェースを共通コードで定義し、プラットフォームソースセットでそのインターフェースの実装を提供することができます。

![インターフェースの使用](expect-interfaces.svg){width=700}

プラットフォーム名は、プラットフォームに関係なく `String` として保持されます。

```kotlin
// commonMain ソースセット内:
interface Platform {
    val name: String
}
```

その後、Android APIの呼び出しで宣言をオーバーライドして、その `String` に値を割り当てることができます。

```kotlin
// androidMain ソースセット内:
import android.os.Build

class AndroidPlatform : Platform {
    override val name: String = "Android ${Build.VERSION.SDK_INT}"
}
```

あるいはiOSのシステムコールを呼び出します。

```kotlin
// iosMain ソースセット内:
import platform.UIKit.UIDevice

class IOSPlatform : Platform {
    override val name: String = UIDevice.currentDevice.systemName() + " " + UIDevice.currentDevice.systemVersion
}
```

共通インターフェースを使用する際に適切なプラットフォーム実装を注入するには、次のいずれかの方法を選択できます。

* [expectedおよびactual関数の使用](#expected-and-actual-functions)
* [異なるエントリポイント経由での実装の提供](#different-entry-points)
* [依存性注入（DI）フレームワークの使用](#dependency-injection-framework)

### expectedおよびactual関数 {id="expected-and-actual-functions"}

共通インターフェースを [expect/actual宣言](#expected-and-actual-functions-and-properties) と組み合わせることができます。  
このインターフェースの値を返す `expect` 関数を定義し、そのインターフェースを実装するプラットフォーム固有のクラスを返す `actual` 関数を定義します。

```kotlin
// commonMain ソースセット内:
interface Platform

expect fun platform(): Platform
```

```kotlin
// androidMain ソースセット内:
class AndroidPlatform : Platform

actual fun platform() = AndroidPlatform()
```

```kotlin
// iosMain ソースセット内:
class IOSPlatform : Platform

actual fun platform() = IOSPlatform()
```

共通コードでの `platform()` 関数の呼び出しは、`Platform` 型のオブジェクトを扱います。
コンパイラがexpected宣言とactual宣言をマージすると、`platform()` の呼び出しはAndroidでは `AndroidPlatform` クラスのインスタンスを、iOSでは `IOSPlatform` クラスのインスタンスを返します。

> これは、Kotlin Multiplatform IDEウィザード（[Web版](https://kmp.jetbrains.com/)も利用可能）で生成されるプロジェクトで使用されているアプローチです。
> [KMP クイックスタート](quickstart.md#create-a-project)を実行してシンプルなプロジェクトを作成し、実装が実際に動作する様子を確認してください。
> 
{style="tip"}

### 異なるエントリポイント {id="different-entry-points"}

エントリポイントを制御できる場合は、expectedおよびactual宣言を使用せずに、各プラットフォームアーティファクトの実装を構築できます。これを行うには、共有Kotlin Multiplatformモジュールでプラットフォーム実装を定義し、プラットフォームモジュール側でそれらをインスタンス化します。

```kotlin
// 共有Kotlin Multiplatformモジュール
// commonMain ソースセット内:
interface Platform

fun application(p: Platform) {
    // アプリケーションロジック
}
```

```kotlin
// androidMain ソースセット内:
class AndroidPlatform : Platform
```

```kotlin
// iosMain ソースセット内:
class IOSPlatform : Platform
```

```kotlin
// androidApp プラットフォームモジュール内:
import android.app.Application
import mysharedpackage.*

class MyApp : Application() {
    override fun onCreate() {
        super.onCreate()
        application(AndroidPlatform())
    }
}
```

```Swift
// iOSアプリのSwiftコード内:
import shared

@main
struct iOSApp : App {
    init() {
        application(IOSPlatform())
    }
}
```

Androidでは `AndroidPlatform` のインスタンスを作成して `application()` 関数に渡し、iOSでも同様に `IOSPlatform` のインスタンスを作成して渡します。これらのエントリポイントはアプリケーション自体のエントリポイントである必要はありませんが、ここから共有モジュールの特定の機能を呼び出すことができます。

expected/actual関数を使用したり、エントリポイントを通じて直接適切な実装を提供したりする方法は、シンプルなシナリオではうまく機能します。
ただし、プロジェクトで依存性注入（DI）フレームワークを使用している場合は、一貫性を確保するためにシンプルなケースでもそれを使用することをお勧めします。

### 依存性注入フレームワーク {id="dependency-injection-framework"}

モダンなアプリケーションでは、依存性注入（DI: Dependency Injection）フレームワークを使用して、使用する実装を実行時に動的に決定し、疎結合なアーキテクチャを構築できます。
Kotlin Multiplatformをサポートする任意のDIフレームワークを使用すれば、プラットフォームに応じて実行時に異なる依存関係をコンポーネントに注入できます。

例えば、[Koin](https://insert-koin.io/) はKotlin Multiplatformをサポートする依存性注入フレームワークです。Koinを使用して `Platform` の例を実装すると、次のようになります。

```kotlin
// common ソースセット内:
import org.koin.dsl.module

interface Platform

expect val platformModule: Module
```

```kotlin
// androidMain ソースセット内:
class AndroidPlatform : Platform

actual val platformModule: Module = module {
    single<Platform> {
        AndroidPlatform()
    }
}
```

```kotlin
// iosMain ソースセット内:
class IOSPlatform : Platform

actual val platformModule = module {
    single<Platform> { IOSPlatform() }
}
```

ここでは、Koin DSLを使用して注入用のコンポーネントを定義するモジュールを作成しています。共通コードで `expect` キーワードを使用してモジュールを宣言し、各プラットフォームで `actual` キーワードを使用してプラットフォーム固有の実装を提供します。フレームワークが実行時に適切な実装の選択を行います。

DIフレームワークを使用する場合、すべての依存関係はそのフレームワークを通じて注入します。プラットフォームの依存関係を処理する場合も同じロジックが適用されます。すでにプロジェクトにDIを導入している場合は、expected/actual関数を手動で使用するのではなく、引き続きDIを使用することをお勧めします。これにより、依存関係を注入する2つの異なるアプローチが混在するのを防ぐことができます。

また、共通インターフェースを常にKotlinで実装する必要はありません。別の*プラットフォームモジュール*で、Swiftなどの他の言語を使って実装することも可能です。このアプローチを選択した場合は、DIフレームワークを使用してiOSプラットフォームモジュールから実装を提供します。

![依存性注入フレームワークの使用](expect-di-framework.svg){width=700}

このアプローチは、プラットフォームモジュール内に実装を配置する場合にのみ機能します。Kotlin Multiplatformモジュールが自己完結できず、別のモジュールで共通インターフェースを実装する必要があるため、あまり拡張性が高くありません。

<!-- If you're interested in having this functionality expanded to a shared module, please vote for this issue in Youtrack and describe your use case. -->