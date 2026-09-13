[//]: # (title: C、Objective-C、Swift ライブラリのインポート)

Kotlin/Native は、[C](native-c-interop.md) および [Objective-C](native-objc-interop.md) ライブラリをインポートする機能を提供しています。
また、純粋な [Swift ライブラリ](#swift-library-import)を Kotlin/Native プロジェクトにインポートするための回避策を利用することも可能です。

## C および Objective-C ライブラリインポートの安定性 {id="stability-of-c-and-objective-c-library-import"}
<primary-label ref="beta"/>

C および Objective-C ライブラリのインポートのサポートは、現在[ベータ版](components-stability.md#kotlin-native)です。

ベータ版である主な理由の 1 つは、C および Objective-C ライブラリを使用することが、異なるバージョンの Kotlin、依存関係、および Xcode とのコードの互換性に影響を与える可能性があるためです。このガイドでは、実際に頻繁に発生する互換性の問題、特定のケースでのみ発生する問題、および仮定される潜在的な問題について説明します。

簡単にするために、ここでは C および Objective-C ライブラリ、つまり「ネイティブライブラリ」を以下のように分類します。

* [プラットフォームライブラリ](#platform-libraries): Kotlin が各プラットフォームの「システム」ネイティブライブラリにアクセスするためにデフォルトで提供するもの。
* [サードパーティライブラリ](#third-party-libraries): Kotlin で使用するために追加の設定が必要な、その他のすべてのネイティブライブラリ。

これら 2 種類のネイティブライブラリには、それぞれ異なる互換性の詳細があります。

### プラットフォームライブラリ {id="platform-libraries"}

[プラットフォームライブラリ](native-platform-libs.md)は Kotlin/Native コンパイラに同梱されています。
そのため、プロジェクトで異なるバージョンの Kotlin を使用すると、異なるバージョンのプラットフォームライブラリが使用されることになります。
Apple ターゲット（iOS など）の場合、プラットフォームライブラリは、特定のコンパイラバージョンでサポートされている Xcode バージョンに基づいて生成されます。

Xcode SDK に同梱されているネイティブライブラリの API は、Xcode のバージョンごとに変化します。
そのような変更がネイティブ言語内でソースおよびバイナリ互換であったとしても、相互運用性（interoperability）の実装により、Kotlin にとっては破壊的な変更（breaking change）になる可能性があります。

その結果、プロジェクトの Kotlin バージョンを更新すると、プラットフォームライブラリに破壊的な変更がもたらされる可能性があります。これは以下の 2 つのケースで問題になる可能性があります。

* プロジェクトのソースコードのコンパイルに影響を与える、プラットフォームライブラリのソースの破壊的変更。通常、これは簡単に修正できます。
* 一部の依存関係に影響を与える、プラットフォームライブラリのバイナリの破壊的変更。
  通常、簡単な回避策はなく、ライブラリの開発者が Kotlin バージョンを更新するなどして、自分たちの側でこれを修正するのを待つ必要があります。

  > このようなバイナリの不整合は、リンケージの警告やランタイム例外として現れます。
  > これらをコンパイル時に検出したい場合は、[`-Xpartial-linkage-loglevel=ERROR`](whatsnew19.md#library-linkage-in-kotlin-native) コンパイラオプションを使用して警告をエラーに引き上げてください。
  >
  {style="note"}

JetBrains チームがプラットフォームライブラリの生成に使用する Xcode バージョンを更新する際は、プラットフォームライブラリでの破壊的な変更を避けるために相応の努力を払っています。破壊的な変更が発生する可能性がある場合は常に、チームは影響分析を行い、特定の変更を無視するか（影響を受ける API が一般的でないため）、アドホックな修正を適用するかを決定します。

プラットフォームライブラリでの破壊的な変更のもう 1 つの潜在的な理由は、ネイティブ API を Kotlin に変換するアルゴリズムの変更です。JetBrains チームは、このような場合でも破壊的な変更を避けるために相応の努力を払っています。

#### プラットフォームライブラリの新しい Objective-C クラスの使用 {id="using-new-objective-c-classes-from-platform-libraries"}

Kotlin コンパイラは、デプロイターゲットで利用できない Objective-C クラスの使用を禁止しません。

たとえば、デプロイターゲットが iOS 17.0 で、iOS 18.0 でのみ登場したクラスを使用した場合、コンパイラは警告を出さず、iOS 17.0 のデバイスでの起動時にアプリケーションがクラッシュする可能性があります。
さらに、そのようなクラッシュは、実行がそれらの使用箇所に到達しない場合でも発生するため、バージョンチェックで保護するだけでは不十分です。

詳細は、[ストロングリンキング（Strong linking）](native-objc-interop.md#strong-linking)を参照してください。

### サードパーティライブラリ {id="third-party-libraries"}

システムプラットフォームライブラリの他に、Kotlin/Native ではサードパーティのネイティブライブラリをインポートできます。
たとえば、[CocoaPods 統合](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-overview.html)を使用したり、[cinterops 設定](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#cinterops)をセットアップしたりできます。

#### Xcode バージョンが一致しないライブラリのインポート {id="importing-libraries-with-mismatched-xcode-version"}

サードパーティのネイティブライブラリをインポートすると、異なる Xcode バージョンとの互換性の問題が発生する可能性があります。

ネイティブライブラリを処理するとき、ほぼすべてのネイティブライブラリヘッダーが Xcode に付属する「標準」ヘッダー（たとえば `stdint.h`）をインポートするため、コンパイラは通常、ローカルにインストールされた Xcode のヘッダーファイルを使用します。

そのため、Xcode のバージョンはネイティブライブラリの Kotlin へのインポートに影響を与えます。これは、サードパーティのネイティブライブラリを使用している場合に、[Mac 以外のホストからの Apple ターゲットのクロスコンパイル](https://kotlinlang.org/docs/multiplatform/multiplatform-publish-lib-setup.html#compilation-for-apple-targets)がいまだに不可能である理由の 1 つでもあります。

各 Kotlin バージョンは、特定の 1 つの Xcode バージョンと最も高い互換性があります。これが推奨バージョンであり、対応する Kotlin バージョンに対して最もテストされています。特定の Xcode バージョンとの互換性は、[互換性表](https://kotlinlang.org/docs/multiplatform/multiplatform-compatibility-guide.html#version-compatibility)で確認してください。

推奨より新しい、または古い Xcode バージョンを使用することは多くの場合可能ですが、特にサードパーティのネイティブライブラリのインポートに影響を与える問題が発生する可能性があります。

##### Xcode バージョンが推奨よりも新しい場合 {id="xcode-version-is-newer-than-recommended"}

推奨よりも新しい Xcode バージョンを使用すると、一部の Kotlin 機能が壊れる可能性があります。サードパーティのネイティブライブラリのインポートは、これによって最も影響を受けます。サポートされていないバージョンの Xcode では、まったく動作しないことがよくあります。

##### Xcode バージョンが推奨よりも古い場合 {id="xcode-version-is-older-than-recommended"}

通常、Kotlin は古い Xcode バージョンでもうまく動作します。時折問題が発生することがあり、多くの場合、以下のような結果になります。

* [KT-71694](https://youtrack.jetbrains.com/issue/KT-71694) のように、Kotlin API が存在しない型を参照する。
* システムライブラリの型が、ネイティブライブラリの Kotlin API に含まれてしまう。
  この場合、プロジェクトは正常にコンパイルされますが、システムネイティブ型がネイティブライブラリパッケージに追加されます。
  たとえば、IDE のオートコンプリートにこの型が予期せず表示されることがあります。

Kotlin ライブラリが古い Xcode バージョンで正常にコンパイルされる場合、[Kotlin ライブラリ API でサードパーティライブラリの型を使用している](#using-native-types-in-library-api)場合を除き、公開しても安全です。

#### 推移的なサードパーティネイティブ依存関係の使用 {id="using-a-transitive-third-party-native-dependency"}

プロジェクト内の Kotlin ライブラリが、その実装の一部としてサードパーティのネイティブライブラリをインポートしている場合、プロジェクトもそのネイティブライブラリにアクセスできるようになります。
これは、Kotlin/Native が `api` と `implementation` の依存関係タイプを区別しないため、ネイティブライブラリが常に `api` 依存関係になるためです。

このような推移的な（transitive）ネイティブ依存関係を使用すると、より多くの互換性の問題が発生しやすくなります。
たとえば、Kotlin ライブラリ開発者による変更によってネイティブライブラリの Kotlin 表現が互換性を失い、Kotlin ライブラリを更新したときに互換性の問題が発生する可能性があります。

そのため、推移的な依存関係に頼るのではなく、同じネイティブライブラリとの相互運用を直接設定してください。その際、互換性の問題を回避するために、[カスタムパッケージ名を使用する](#use-custom-package-name)のと同様に、ネイティブライブラリに別のパッケージ名を使用してください。

#### ライブラリ API でのネイティブ型の使用 {id="using-native-types-in-library-api"}

Kotlin ライブラリを公開する場合、ライブラリ API 内のネイティブ型には注意してください。このような使用法は、将来、互換性やその他の問題を修正するために壊れることが予想され、ライブラリのユーザーに影響を与えます。

Kotlin ライブラリが基本的にネイティブライブラリへの拡張機能を提供している場合など、ライブラリの目的上、API でネイティブ型を使用することが必要な場合もあります。そうでない場合は、ライブラリ API でのネイティブ型の使用を避けるか、制限してください。

この推奨事項は、ライブラリ API でのネイティブ型の使用にのみ適用され、アプリケーションコードには関係ありません。また、以下のようなライブラリの実装にも適用されません。

```kotlin
// 十分に注意してください！ネイティブ型がライブラリ API で使用されています:
public fun createUIView(): UIView
public fun handleThirdPartyNativeType(c: ThirdPartyNativeType)

// 通常通りの注意で問題ありません。ネイティブ型はライブラリ API で使用されていません:
internal fun createUIViewController(): UIViewController
public fun getDate(): String = NSDate().toString()
```

#### サードパーティライブラリを使用するライブラリの公開 {id="publishing-a-library-that-uses-third-party-library"}

サードパーティのネイティブライブラリを使用する Kotlin ライブラリを公開する場合、互換性の問題を回避するためにできることがいくつかあります。

##### カスタムパッケージ名の使用 {id="use-custom-package-name"}

サードパーティのネイティブライブラリにカスタムパッケージ名を使用すると、互換性の問題を回避できる場合があります。

ネイティブライブラリが Kotlin にインポートされると、Kotlin のパッケージ名が割り当てられます。これが一意でない場合、ライブラリユーザーは衝突（クラッシュ）に遭遇する可能性があります。たとえば、ネイティブライブラリがユーザーのプロジェクトの他の場所や他の依存関係で同じパッケージ名でインポートされている場合、これら 2 つの使用箇所が衝突します。

そのような場合、コンパイルが `Linking globals named '...': symbol multiply defined!` エラーで失敗する可能性があります。ただし、他のエラーが発生したり、あるいはコンパイルに成功したりすることもあります。

サードパーティのネイティブライブラリにカスタム名を使用するには：

* CocoaPods 統合を介してネイティブライブラリをインポートする場合、Gradle ビルドスクリプトの `pod {}` ブロックで [`packageName`](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-dsl-reference.html#pod-function) プロパティを使用します。
* `cinterops` 設定でネイティブライブラリをインポートする場合、設定ブロックで [`packageName`](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#cinterops) プロパティを使用します。

##### 古い Kotlin バージョンとの互換性の確認 {id="check-compatibility-with-older-kotlin-versions"}

Kotlin ライブラリを公開する場合、サードパーティのネイティブライブラリの使用は、他の Kotlin バージョンとのライブラリ互換性に影響を与える可能性があります。具体的には：

* Kotlin Multiplatform ライブラリは、前方互換性（古いコンパイラが新しいコンパイラでコンパイルされたライブラリを使用できること）を保証しません。

  実際には、いくつかのケースで機能しますが、ネイティブライブラリを使用すると前方互換性がさらに制限される可能性があります。

* Kotlin Multiplatform ライブラリは後方互換性（新しいコンパイラが古いバージョンで生成されたライブラリを使用できること）を提供します。

  Kotlin ライブラリでネイティブライブラリを使用しても、通常はその後方互換性に影響しません。しかし、互換性に影響を与えるコンパイラのバグが発生する可能性が高まります。

##### 静的ライブラリの埋め込みを避ける {id="avoid-embedding-static-libraries"}

ネイティブライブラリをインポートするとき、`-staticLibrary` コンパイラオプションまたは `.def` ファイルの `staticLibraries` プロパティを使用して、関連する[静的ライブラリ](native-definition-file.md#include-a-static-library)（`.a` ファイル）を含めることが可能です。その場合、ライブラリユーザーはネイティブの依存関係やリンカーオプションを扱う必要がありません。

しかし、含まれている静的ライブラリの使用方法を構成（除外や置換など）することは不可能です。そのため、ユーザーは、同じ静的ライブラリを含む他の Kotlin ライブラリとの潜在的な衝突を解決したり、そのバージョンを調整したりすることができなくなります。

### ネイティブライブラリサポートの進化 {id="evolution-of-native-library-support"}

現在、Kotlin プロジェクトで C および Objective-C を使用すると、互換性の問題が発生する可能性があります。その一部はこのガイドに記載されています。これらを修正するために、将来的にいくつかの破壊的な変更が必要になる可能性があり、それ自体が互換性の問題の一因となります。

## Swift ライブラリのインポート {id="swift-library-import"}

Kotlin/Native は、純粋な Swift ライブラリの直接インポートをサポートしていません。しかし、それを回避するためのいくつかのオプションがあります。

1 つの方法は、手動で Objective-C ブリッジを使用することです。このアプローチでは、カスタムの Objective-C ラッパーと `.def` ファイルを作成し、cinterop を介してそれらのラッパーを使用する必要があります。

しかし、ほとんどの場合、**リバースインポート（reverse import）**アプローチを使用することをお勧めします。これは、Kotlin 側で期待される動作を定義し、Swift 側で実際の機能を実装して、それを Kotlin に戻すという方法です。

期待される部分は、次のいずれかの方法で定義できます。

* インターフェースを作成する。インターフェースベースのアプローチは、複数の機能やテストのしやすさにおいて、より拡張性があります。
* Swift のクロージャを使用する。クイックプロトタイプには適していますが、このアプローチには制限があります（たとえば、状態を保持できません）。
* [Swift エクスポート](native-swift-export.md)を使用する。Objective-C のブリッジなしで、Swift で Kotlin インターフェースを直接実装し、その Swift オブジェクトを Kotlin に戻すことができます。

純粋な Swift ライブラリである [CryptoKit](https://developer.apple.com/documentation/cryptokit/) を Kotlin プロジェクトにリバースインポートする例を考えてみましょう。

<tabs>
<tab title="インターフェース">

1. Kotlin 側で、Kotlin が Swift に期待するものを記述するインターフェースを作成します。

   ```kotlin
   // CryptoProvider.kt
   interface CryptoProvider {
       fun hashMD5(input: String): String
   }
   ```

2. Kotlin 側で、`MainViewController` からプラットフォーム固有の実装を渡し、それを `App` コンポーザブルでパラメータとして受け取って、必要な場所で使用します。

   ```kotlin
   // App.kt
   @Composable
   fun App(cryptoProvider: CryptoProvider) {
       // UI 内での使用例
       val hashed = cryptoProvider.hashMD5("Hello, world!")
       androidx.compose.material3.Text("Compose: $hashed")
   }
   ```

   ```kotlin
   // MainViewController.kt
   fun MainViewController(cryptoProvider: CryptoProvider) = ComposeUIViewController {
       App(cryptoProvider)
   }
   ```

3. Swift 側で、純粋な Swift ライブラリである CryptoKit を使用して、MD5 ハッシュ機能を実装します。

   ```swift
   // iosApp/ContentView.swift
   import CryptoKit
  
   class IosCryptoProvider: CryptoProvider {
       func hashMD5(input: String) -> String {
           guard let data = input.data(using: .utf8) else { return "failed" }
           return Insecure.MD5.hash(data: data).description
       }
   }
   ```

4. Swift の実装を Kotlin コンポーネントに渡します。

   ```swift
   // iosApp/ContentView.swift
   struct ComposeView: UIViewControllerRepresentable {
       func makeUIViewController(context: Context) -> UIViewController {
           // Kotlin UI のエントリポイントに Swift の実装を注入する
           MainViewControllerKt.MainViewController(cryptoProvider: IosCryptoProvider())
       }

       func updateUIViewController(_ uiViewController: UIViewController, context: Context) {}
   }
   ```

</tab>
<tab title="Swift のクロージャ">

1. Kotlin 側で、関数パラメータを宣言し、必要な場所で使用します。

    ```kotlin
    // App.kt
    @Composable
    fun App(md5Hasher: (String) -> String) {
        // UI 内での使用例
        val hashed = md5Hasher("Hello, world!")
        androidx.compose.material3.Text("Compose: $hashed")
    }
    ```

    ```kotlin
    // MainViewController.kt
    fun MainViewController(md5Hasher: (String) -> String) = ComposeUIViewController {
        App(md5Hasher)
    }
    ```

2. Swift 側で、CryptoKit ライブラリを使用して MD5 ハッシャーを構築し、それをクロージャとして渡します。

    ```swift
    // iosApp/ContentView.swift
    import CryptoKit
    import SwiftUI

    struct ComposeView: UIViewControllerRepresentable {
        func makeUIViewController(context: Context) -> UIViewController {
            MainViewControllerKt.MainViewController(md5Hasher: { input in
                guard let data = input.data(using: .utf8) else { return "failed" }
                return Insecure.MD5.hash(data: data).description
            })
        }

        func updateUIViewController(_ uiViewController: UIViewController, context: Context) {}
    }
    ```

</tab>
<tab title="Swift エクスポート">

1. Kotlin 側で、インターフェース、それを受け取る関数、および Swift の実装が継承できる `open` なベースクラスを宣言します。

   ```kotlin
   // CryptoProvider.kt
   interface CryptoProvider {
       fun hashMD5(input: String): String
   }

   fun processHash(provider: CryptoProvider, input: String): String = provider.hashMD5(input)

   open class SwiftBase
   ```

2. Swift 側で、エクスポートされた `SwiftBase` クラスを継承し、純粋な Swift ライブラリである CryptoKit を使用してインターフェースを実装し、そのオブジェクトを Kotlin に戻します。

   ```swift
   // iosApp/ContentView.swift
   import CryptoKit

   final class IosCryptoProvider: SwiftBase, CryptoProvider {
       func hashMD5(input: String) -> String {
           guard let data = input.data(using: .utf8) else { return "failed" }
           return Insecure.MD5.hash(data: data).description
       }
   }

   let provider = IosCryptoProvider()

   // Swift の hashMD5() を呼び戻す Kotlin 関数を呼び出す
   print(processHash(provider: provider, input: "Hello, world!"))
   ```

Kotlin が Swift オブジェクトを受け取ると、通常の Kotlin インターフェースの実装として扱い、Swift コードを直接呼び出します。

</tab>
</tabs>

より複雑なプロジェクトでは、依存関係の注入（DI）を使用して Swift の実装を Kotlin に戻すのが便利です。
詳細については、[依存関係注入フレームワーク](https://kotlinlang.org/docs/multiplatform/multiplatform-connect-to-apis.html#dependency-injection-framework)を参照するか、[Koin フレームワーク](https://insert-koin.io/docs/reference/koin-mp/kmp/)のドキュメントを確認してください。