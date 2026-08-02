[//]: # (title: プラットフォーム固有の API の使用)

この記事では、マルチプラットフォームのアプリケーションやライブラリを開発する際に、プラットフォーム固有の API を使用する方法について説明します。

<video src="https://www.youtube.com/v/bSNumV04y_w" title="Using Platform-Specific APIs in KMP Apps"/>

## Kotlin マルチプラットフォームライブラリ

プラットフォーム固有の API を使用するコードを書く前に、代わりにマルチプラットフォームライブラリを使用できるかどうかを確認してください。
このタイプのライブラリは、プラットフォームごとに異なる実装を持つ共通の Kotlin API を提供します。

ネットワーク、ロギング、アナリティクスの実装や、デバイス機能へのアクセスなどに使用できるライブラリがすでに多数存在します。Kotlin Multiplatform ライブラリの検索プラットフォームである [klibs.io](https://klibs.io) でライブラリを探してみてください。

## expect と actual による関数とプロパティ

Kotlin は、共通ロジックを開発しながらプラットフォーム固有の API にアクセスするための言語メカニズムとして、[expect および actual 宣言](multiplatform-expect-actual.md)を提供しています。

このメカニズムでは、マルチプラットフォームモジュールの共通（common）ソースセットで期待される宣言（expected declaration）を定義し、各プラットフォームのソースセットでその期待される宣言に対応する実際の宣言（actual declaration）を提供する必要があります。コンパイラは、共通ソースセットで `expect` キーワードが付けられたすべての宣言に対して、ターゲットとなるすべてのプラットフォームソースセットに `actual` キーワードが付けられた対応する宣言が存在することを保証します。

これは、関数、クラス、インターフェース、列挙型、プロパティ、アノテーションなど、ほとんどの Kotlin 宣言で機能します。このセクションでは、`expect` と `actual` を使用した関数とプロパティに焦点を当てます。

![Using expected and actual functions and properties](expect-functions-properties.svg){width=700}

この例では、共通ソースセットで期待される `platform()` 関数を定義し、プラットフォームソースセットで実際の（actual）実装を提供します。特定のプラットフォーム向けにコードを生成する際、Kotlin コンパイラは `expect` 宣言と `actual` 宣言をマージします。これにより、実際の実装を持つ 1 つの `platform()` 関数が生成されます。`expect` 宣言と `actual` 宣言は同じパッケージ内に定義される必要があり、最終的なプラットフォームコードでは _1 つの宣言_ にマージされます。生成されたプラットフォームコード内で `expect` 宣言された `platform()` 関数を呼び出すと、対応する正しい `actual` 実装が呼び出されます。

### 例: UUID の生成

Kotlin Multiplatform を使用して iOS および Android アプリケーションを開発しており、汎用一意識別子（UUID）を生成したいと仮定しましょう。

これを行うには、Kotlin Multiplatform モジュールの共通ソースセットで、`expect` キーワードを使用して期待される関数 `randomUUID()` を宣言します。実装コードは含めないでください。

```kotlin
// 共通（common）ソースセット内:
expect fun randomUUID(): String
```

各プラットフォーム固有のソースセット（iOS および Android）で、共通モジュールで期待される `randomUUID()` 関数の実際の実装を提供します。これらの実際の実装をマークするには、`actual` キーワードを使用します。

![Generating UUID with expected and actual declarations](expect-generate-uuid.svg){width=700}

以下のスニペットは、Android と iOS の実装を示しています。プラットフォーム固有のコードでは、`actual` キーワードを使用し、関数には同じ名前を使用します。

```kotlin
// android ソースセット内:
import java.util.*

actual fun randomUUID() = UUID.randomUUID().toString()
```

```kotlin
// iOS ソースセット内:
import platform.Foundation.NSUUID

actual fun randomUUID(): String = NSUUID().UUIDString()
```

Android の実装では Android で利用可能な API を使用し、iOS の実装では iOS で利用可能な API を使用します。Kotlin/Native コードから iOS の API にアクセスできます。

Android 用の最終的なプラットフォームコードを生成する際、Kotlin コンパイラは自動的に `expect` 宣言と `actual` 宣言をマージし、実際の Android 固有の実装を持つ単一の `randomUUID()` 関数を生成します。iOS に対しても同じプロセスが繰り返されます。

簡略化のため、この例および以降の例では「common」、「ios」、「android」という簡略化されたソースセット名を使用しています。通常、これらは `commonMain`、`iosMain`、`androidMain` を指します。同様のロジックは、テストソースセットである `commonTest`、`iosTest`、`androidTest` でも定義できます。

`expect`/`actual` 関数と同様に、`expect`/`actual` プロパティを使用すると、プラットフォームごとに異なる値を使用できます。`expect`/`actual` の関数とプロパティは、単純なケースで最も役立ちます。

## 共通コード内でのインターフェース

プラットフォーム固有のロジックが非常に大きく複雑な場合は、共通コードでそれを表すインターフェースを定義し、プラットフォームソースセットで異なる実装を提供することで、コードを簡素化できます。

![Using interfaces](expect-interfaces.svg){width=700}

プラットフォームソースセットの実装では、対応する依存関係を使用します。

```kotlin
// commonMain ソースセット内:
interface Platform {
    val name: String
}
```

```kotlin
// androidMain ソースセット内:
import android.os.Build

class AndroidPlatform : Platform {
    override val name: String = "Android ${Build.VERSION.SDK_INT}"
}
```

```kotlin
// iosMain ソースセット内:
import platform.UIKit.UIDevice

class IOSPlatform : Platform {
    override val name: String = UIDevice.currentDevice.systemName() + " " + UIDevice.currentDevice.systemVersion
}
```

共通のインターフェースが必要な場合に適切なプラットフォーム実装を注入するには、次のオプションのいずれかを選択できます。それぞれについて以下で詳しく説明します。

* [`expect` と `actual` による関数を使用する](#expected-and-actual-functions)
* [異なるエントリポイントを介して実装を提供する](#different-entry-points)
* [依存性注入（DI）フレームワークを使用する](#dependency-injection-framework)

### expect と actual による関数

このインターフェースの値を返す `expect` 関数を定義し、次にそのサブクラスを返す `actual` 関数を定義します。

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

共通コードで `platform()` 関数を呼び出すと、`Platform` 型のオブジェクトを扱うことができます。
この共通コードを Android で実行すると、`platform()` の呼び出しは `AndroidPlatform` クラスのインスタンスを返します。
iOS で実行すると、`platform()` は `IOSPlatform` クラスのインスタンスを返します。

### 異なるエントリポイント

エントリポイントを制御できる場合は、`expect`/`actual` 宣言を使用せずに各プラットフォームアーティファクトの実装を構築できます。これを行うには、共有の Kotlin Multiplatform モジュールでプラットフォームの実装を定義し、プラットフォームモジュール側でそれらをインスタンス化します。

```kotlin
// 共有 Kotlin Multiplatform モジュール
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
// iosApp プラットフォームモジュール内 (Swift):
import shared

@main
struct iOSApp : App {
    init() {
        application(IOSPlatform())
    }
}
```

Android では、`AndroidPlatform` のインスタンスを作成して `application()` 関数に渡す必要があります。同様に iOS では、`IOSPlatform` のインスタンスを作成して渡す必要があります。これらのエントリポイントはアプリケーションのエントリポイントである必要はありませんが、ここで共有モジュールの特定の機能を呼び出すことができます。

`expect`/`actual` 関数を使用したり、エントリポイントを通じて直接提供したりして適切な実装を提供する方法は、単純なシナリオではうまく機能します。ただし、プロジェクトで依存性注入（DI）フレームワークを使用している場合は、一貫性を確保するために、単純なケースであっても DI フレームワークを使用することをお勧めします。

### 依存性注入（DI）フレームワーク

現代的なアプリケーションでは、通常、疎結合なアーキテクチャを作成するために依存性注入（DI）フレームワークを使用します。DI フレームワークを使用すると、現在の環境に基づいてコンポーネントに依存関係を注入できます。

Kotlin Multiplatform をサポートする DI フレームワークであれば、プラットフォームごとに異なる依存関係を注入するのに役立ちます。

たとえば、[Koin](https://insert-koin.io/) は Kotlin Multiplatform をサポートする依存性注入フレームワークです。

```kotlin
// 共通（common）ソースセット内:
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

ここでは、Koin DSL が注入用のコンポーネントを定義するモジュールを作成します。共通コードで `expect` キーワードを使用してモジュールを宣言し、次に `actual` キーワードを使用して各プラットフォーム向けの固有の実装を提供します。フレームワークが、実行時に正しい実装を選択することを担当します。

DI フレームワークを使用する場合、すべての依存関係をそのフレームワークを通じて注入します。プラットフォームの依存関係の処理にも同じロジックが適用されます。すでにプロジェクトに DI を導入している場合は、手動で `expect`/`actual` 関数を使用するのではなく、DI を使い続けることをお勧めします。これにより、依存関係を注入する 2 つの異なる方法が混在するのを避けることができます。

また、共通インターフェースを常に Kotlin で実装する必要はありません。別の「プラットフォームモジュール」内で、Swift などの他の言語で実装することもできます。このアプローチを選択した場合は、DI フレームワークを使用して iOS プラットフォームモジュールからその実装を提供する必要があります。

![Using dependency injection framework](expect-di-framework.svg){width=700}

このアプローチは、実装をプラットフォームモジュールに配置する場合にのみ機能します。Kotlin Multiplatform モジュールが自己完結できなくなり、別のモジュールで共通インターフェースを実装する必要があるため、あまりスケーラブルではありません。

<!-- If you're interested in having this functionality expanded to a shared module, please vote for this issue in Youtrack and describe your use case. -->

## 次のステップ

`expect`/`actual` メカニズムの例と詳細については、[expect および actual 宣言](multiplatform-expect-actual.md)を参照してください。