---
title: リリースとアップグレードガイド
---

# リリースとアップグレードガイド

このページでは、アップグレードの計画や互換性の確認ができるよう、Koinの主要なリリースを一覧で掲載しています。各バージョンは以下の共通の構成になっています。

- **Kotlin**: KoinがビルドされているKotlinのバージョン。
- **新機能 (New)**: 新機能および機能改善。
- **実験的機能 (Experimental)**: `@KoinExperimentalAPI`が付与された、今後変更される可能性があるAPI。
- **非推奨 (Deprecated)**: 削除予定としてマークされたAPIと、その代替手段。
- **破壊的変更 (Breaking)**: アップグレード時にコードの修正が必要となる変更。
- **バグ修正 (Bug fixes)**、**改善 (Improvements)**、**ライブラリの更新 (Library updates)**: 該当するリリースに存在する場合に記載。

実験的機能および非推奨の定義については、[API Stability](/docs/support/api-stability)を参照してください。

## バージョン一覧 {id="versions"}

| バージョン | Kotlin | ステータス | 主な変更点 |
|---------|--------|--------|--------------|
| [4.2.2](#422) | 2.3.20 | Stable | リゾルバーのリグレッション修正、ViewModelとスコープの修正、tvOS対応、R8/ProGuardルール |
| [4.2.1](#421) | 2.3.20 | 以前の安定版 | スコープ解決の修正、ABIの復元、パフォーマンスの向上 |
| [4.2.0](#420) | 2.3.20 | 以前の安定版 | `@KoinApplication`と`@Configuration`、Ktor 3.4 DIブリッジ、Navigation 3、Daggerブリッジ |
| [4.1.1](#411) | 2.1.21 | 以前の安定版 | Navigationの改善、リゾルバーのパフォーマンス向上 |
| [4.1.0](#410) | 2.1.20 | 以前の安定版 | スコープアーキタイプ、機能オプション、Ktor KMP |
| [4.0.4](#404) | 2.0.21 | 以前の安定版 | 安定版ViewModel API、UUID生成 |
| [3.5.6](#356) | 1.9.22 | LTS | Kotlin 1.x向け長期サポートライン、分離されたコンテキスト |
| [3.4.3](#343) | 1.8.21 | レガシー | Verification API、ExtensionManager |

現在のバージョン: Koin 4.2.2、およびKoin Compiler Plugin 1.2.1（[Koin Compiler Plugin](#koin-compiler-plugin)を参照）。

:::note
Kotlin 1.xプロジェクト向けのKoin 3.5.6と、Kotlin 2.xプロジェクト向けのKoin 4.2.xという2つのLTSラインが並行して保守されています。プロジェクトのKotlinベースラインに合わせて選択してください。サポートポリシーについては、[長期サポート (LTS)](/docs/support/#long-term-support-lts)を参照してください。
:::

## 4.2.2 {id="4-2-2"}

Kotlin `2.3.20`。

4.2.xラインのメンテナンスリリース: 4.2.0での`CoreResolverV2`の書き直しによって導入されたリゾルバーのリグレッションの修正、ViewModelとスコープの修正、Ktorリクエストスコープの修正、tvOSのサポート、およびR8/ProGuardルール。

:::warning
4.2.0または4.2.1でリゾルバーの問題が発生した場合は、4.2.2にアップグレードしてください。
:::

### 新機能 {id="new"}

`koin-core-viewmodel`
- tvOSターゲット（`tvosArm64`、`tvosX64`、`tvosSimulatorArm64`）に対応し、tvOSでViewModelを使用できるようになりました。

`koin-android` / `koin-core-viewmodel`
- コンシューマー向けのR8/ProGuardルールがAARに含まれるようになり、新しいR8/ProGuardガイドが追加されました。

### バグ修正 {id="bug-fixes"}

`koin-core`
- #2370、#2408の修正: スタックされたパラメータ（`parametersOf`）が、修飾子付きの`get(named(...))`リクエストをシャドウしてしまうことがありました。修飾子付きの検索はレジストリのみを読み取り、パラメータスタックは読み取らないようになりました。
- #2379の修正: ルートスコープで定義された非`single`のファクトリを子スコープから解決した場合に、スコープ付き依存関係がリクエスト元のスコープではなく`_root_`に対して解決されていました。リンクされたスコープ解決では、リクエスト元のスコープに対してファクトリを実行するようになりました。
- #2299の修正: `viewModelScopeFactory()`で作成されたスコープが元のスコープにリンクされておらず、親で宣言された依存関係を解決できませんでした。作成されたスコープは親にリンクされるようになりました（親がルートの場合を除く）。
- #2348の修正: `String`以外の値を持つ環境プロパティまたはシステムプロパティを読み込むと、チェックなしのマップキャストにより`ClassCastException`がスローされていました。`String`以外の値は`Any`として保持されるようになりました。
- #2044、#2417の修正: 適切なextrasなしで`SavedStateHandle`を解決しようとした場合や、`viewModelScopeFactory()`オプションなしで`viewModelScope { }`を使用した場合に、対処方法がわかりやすいエラーメッセージが表示されるようになりました。

`koin-ktor`
- #2410の修正: 並行リクエストによってリクエストスコープIDが衝突する可能性がありました。IDは起動時に一度シードされる単調増加カウンターから生成されるようになりました（@lfavreli-betclicによるコントリビューション）。

### 改善 {id="improvements"}

`koin-core`
- `bind()`と`binds()`において、バインディングごとに対象の型リストを再割り当てするのではなく、セカンダリの型をO(1)で追加するようになりました。これにより、定義が多数のバインディングを宣言している場合の二次関数的なコストが解消されました。

### ドキュメント {id="documentation"}

- [Navigation 3リファレンス](/docs/reference/koin-compose/navigation3)に、型付けされた`entryProvider`でKoinを使用するためのガイダンスを追加（#2336）。

## 4.2.1 {id="4-2-1"}

Kotlin `2.3.20`。

4.2.0に対するパッチリリース: スコープ解決の修正、ABIの復元、および診断機能の向上。

### 新機能

`koin-core`
- スコープ解決のエラーメッセージがより明確になりました。

### バグ修正

`koin-core`
- #2387の修正: `CoreResolverV2`において、リンクされたスコープでスタックされたパラメータの検索が失われていた問題を修正しました。
- `runOnKoinStarted`のABI互換性を復元しました。リグレッションを防ぐため、CIでAPIチェックが実行されるようになりました。
- クローズされたスコープにおける並行処理の修正（volatileフラグ）（@inemtsevによるコントリビューション）。
- スコープ付き`ViewModel`および`SavedStateHandle` ViewModelのテストを追加しました。

## 4.2.0 {id="4-2-0"}

Kotlin `2.3.20`。すべてのライブラリバージョンは[libs.versions.toml](https://github.com/InsertKoinIO/koin/blob/4.2.0/projects/gradle/libs.versions.toml)に記載されています。

### 新機能

`koin-core`
- 新しい`CoreResolverV2`: スタックされたパラメータへのアクセス高速化、子スコープおよびViewModelスコープ解決の改善、スコープごとの`ThreadLocal`読み込みの最適化。
- `KoinApplication.withConfiguration<T>()`拡張関数: `KoinApplication`を、[Koin Compiler Plugin](#koin-compiler-plugin)によって`@KoinApplication`クラスから検出されたモジュールと接続します。
- `koinConfiguration<T>()` DSL: アノテーション付きクラスから`KoinConfiguration`を構築するためのCompiler Pluginのエントリポイント。
- スコープ解決とスレッドセーフに関するパフォーマンスの最適化。

`koin-android`
- `koinActivityInject`: 現在の`Activity`スコープから依存関係を取得します。

`koin-androidx-startup`
- `onKoinStartup { }`: AndroidX Startupの`Initializer` APIを介してKoinを起動します。
- `KoinConfiguration`型および`KoinStartup`の更新（`KoinInitializer`は実験的ステータスのままです）。

`koin-ktor`: Ktor 3.4の統合
- 公式のKtor 3.4 DI API上に構築された、新しいKoinとKtorのDIブリッジ。
- `KoinDependencyMap`: KoinがKtor DIを介してインスタンスを直接解決します。
- `KoinKtorApplication`: KtorからKoin、およびKoinからKtorへの連携を行う明示的なオプションを備えたDSLブリッジ。
- モジュールの宣言には、`Application.koinModule`および`Application.koinModules`拡張関数の使用が推奨されるようになりました。

`koin-compose-navigation3`（新規モジュール）
- Jetpack Navigation 3（stable 1.0.0）のサポート。
- ジェネリックな`EntryProvider`: メタデータパラメータ（アニメーションなど）をナビゲーションエントリに渡します。
- Compose Navigation 2向けのナビゲーションスコープヘルパー。

`koin-dagger-bridge`（新規モジュール）
- Dagger側からKoinコンポーネントをインジェクトし、DaggerからKoinへの段階的な移行を可能にします。

`koin-core-annotations`（Compiler Pluginで使用）
- `@KoinApplication`: クラスをKoinアプリケーションのエントリポイントとしてマークします。その後`startKoin<MyApp>()`によって、検出されたすべての`@Configuration`モジュールがアセンブルされます。
- `@Configuration("name")`: `@Module`クラスを設定（例: `prod`、`test`、`default`）ごとにグループ化します。同じ設定ラベルを持つモジュール同士は、お互いの定義を参照できます。
- `@PropertyValue("key")`: `@Property`インジェクションのデフォルト値。
- `@ScopeId(name = "...")`および`@ScopeId(MyScope::class)`: 名前付きKoinスコープから値をインジェクトします。
- `@Monitor`: アノテーションが付けられた関数をKotzilla SDKのトレーシング（実行時間）でラップします。詳細は[@Monitor](/docs/tooling/monitor)を参照してください。
- `@Provided`がセーフティグラフ全体で認識されるようになりました: 外部から提供される型のコンパイル時検証をスキップします。

### 実験的機能 {id="experimental"}

`koin-core`
- `@KoinApplication(modules = [...])`: 明示的な`modules`配列により、エントリポイントで自動検出をバイパスし、固定のモジュールリストを使用できます。

`koin-androidx-startup`
- `koin-androidx-startup` API全体が実験的機能のままとなります。`KoinInitializer`には`@KoinExperimentalAPI`がマークされています。

### 非推奨 {id="deprecated"}

`koin-android` / `koin-android-annotation`
- `org.koin.android.annotation.KoinViewModel`は非推奨となりました。`org.koin.core.annotation.KoinViewModel`を使用してください。

`koin-ktor`
- `koin-ktor3`アーティファクトは`koin-ktor`に統合されました（4.1.0で非推奨となり、4.2.0で完全に統合）。

### 破壊的変更 {id="breaking"}

`koin-android`
- Koinが使用するAndroidXライブラリに合わせるため、Min SDKが21から23に引き上げられました。

`koin-compose-navigation3`
- Min APIレベルは23です。

`koin-core`
- `Module.getAll(...)`は結果をソートしなくなりました。インスタンスは宣言順で返されます。特定の順序に依存している場合は、明示的にソートしてください。

## Koin Compiler Plugin {id="koin-compiler-plugin"}

現在のバージョン: `1.2.1`。Koin `4.2.0`以降およびKotlin K2コンパイラ（`2.3.20`、`2.4.0`、`2.4.10`、`2.4.20`で検証済み）が必要です。

Koin Compiler Pluginは、ネイティブのKotlinコンパイラプラグインです。KSPベースのKoin Annotationsプロセッサを置き換え、KSPステップを必要とせずにKotlinコンパイルの一部として動作します。インストール方法とGradleオプションについては、[Compiler Plugin Setup](/docs/setup/compiler-plugin)および[Compiler Plugin Options](/docs/reference/koin-annotations/options)を参照してください。検証内容については、[Compile-Time Safety](/docs/reference/koin-compiler/compile-safety)に記載されています。JVM、JS、Wasm、iOS、macOS、watchOS、tvOS、Linux、Windowsなど、すべてのKotlin Multiplatformターゲットをサポートしています。

`koin-ksp-compiler`からの移行については、[Migrating from KSP to the Compiler Plugin](/docs/migration/from-ksp-to-compiler-plugin)を参照してください。

### 1.2.1 {id="1-2-1"}

Kotlin 2.4.20のサポートに加え、実際のKMPアプリで発見された2つの不具合が修正されました。

- **Kotlin 2.4.20**: 1.2.0では、Kotlin 2.4.20を使用しているプロジェクトがIR生成中に`NoSuchMethodError`で失敗していました（#89、#99）。Kotlin 2.4.20でプラグインが使用していた4つのコンパイラAPIが削除またはシグネチャ変更されていましたが、その4つすべてが修正されました。
- **KLIBの修正**: `@Configuration`モジュールが依存関係を経由して中継された際に、wasmJs、JS、Kotlin/Nativeのビルドが`componentscan_*`ヒントにおいて`Different declarations with the same signatures were detected`というエラーで失敗していました。JVMとAndroidは影響を受けませんでした。
- **修飾子の修正**: モジュールをまたいで読み取られた際に、1つの型に対する2つの`@Named`プロバイダが1つにまとめられ、誤った`KOIN-D001`エラーが発生していました。誤ったD001エラーのために`compileSafety`を無効にしていた場合は、有効にして再度確認してください。
- **厳密なKotlinバージョンチェック**: 正確なバージョンがチェックされている場合のみ、検証済みとしてカウントされるようになりました。未検証のバージョンは警告を出して続行し、ビルドをブロックすることはありません。

詳細は[1.2.1 リリースノート](https://github.com/InsertKoinIO/koin-compiler-plugin/releases/tag/1.2.1)を参照してください。

### 1.2.0 {id="1-2-0"}

コンパイル時の安全性がKoin DSL全体に適用されるようになり、モジュール間の`includes`によって定義が隠蔽されることがなくなりました。

- **Constructor DSLの検証**: `singleOf(::T)`、`factoryOf(::T)`、`scopedOf(::T)`、`viewModelOf(::T)`、および`Scope.new(::T)`に対して、`single<T>()`と同様の依存関係の欠落チェックおよび修飾子チェックが行われるようになりました。ここでチェックされていなかった依存関係の欠落に依存していたコードは、コンパイルエラーになるようになります。これは不具合ではなく、チェック範囲の網羅によるものです。
- **新しいエントリポイント**: `KoinApplication.withConfiguration<T>()`およびKtorの`install(Koin) { modules(...) }`。
- **モジュールリスト**: `startKoin { modules(myList) }`が`listOf`、`+`、`.toList()`、および`List<Module>`を返す関数を解決するようになりました。実行時に分岐するリストは未解決のままとなり、`KOIN-W003`がその呼び出し箇所を指摘します。
- **モジュール関数**: `fun myModule(): Module = module { ... }`がトップレベルの`val`と同様に追跡されるようになりました。
- **モジュール間の修正**: 2つ以上`implementation`を挟んだ先にある定義が、`@Module(includes)`（#82）、`@Configuration`自動検出、およびDSLの`includes(...)`を通して参照できない問題を修正しました。複数の`binds(...)`が認識されるようになり、`@Module(includes)`が修飾子のみが異なるプロバイダを統合してしまうことがなくなりました（#94）。
- **手書きのラムダ**: `single { X(get()) }`はコンストラクタから推測するのではなく、独自の`get()`呼び出しを通して検証されるようになりました。これにより、誤った`KOIN-D004`の循環参照エラーが解消されます。

詳細は[1.2.0 リリースノート](https://github.com/InsertKoinIO/koin-compiler-plugin/releases/tag/1.2.0)を参照してください。

### 1.1.0 {id="1-1-0"}

フルグラフ検証のみとなりました。各Koinエントリポイント（`startKoin`、`koinApplication`、`@KoinApplication`）での1回のフルグラフチェックが採用され、モジュールごとの検証は廃止されました。これにより、モジュール間における誤検知が解消されます。その代償として、自身のコンパイル内に独自のエントリポイントを持たないリーフモジュールやライブラリモジュールは、周囲に実際のグラフが組み立てられるまで、コンパイル時安全性の診断を受けられなくなります。

詳細は[1.1.0 リリースノート](https://github.com/InsertKoinIO/koin-compiler-plugin/releases/tag/1.1.0)を参照してください。

## 4.1.1 {id="4-1-1"}

Kotlin `2.1.21`。

### 新機能

`koin-compose-viewmodel-navigation`
- `sharedKoinViewModel`に、Compose Navigation用のオプションパラメータ`navGraphRoute`が追加されました。

`koin-core`
- コアリゾルバーの最適化: 単一スコープ内で解決する際の不要なフラット化を排除しました。
- スコープのデバッグ時にリンクされたスコープIDが表示されるようになりました。

### ライブラリの更新 {id="library-updates"}

- Kotlin: 2.1.21（2.1.20から更新）
- Ktor: 3.2.3（3.1.3から更新）
- JetBrains Compose: 1.8.2（1.8.0から更新）
- AndroidX: Fragment 1.8.9、WorkManager 2.10.3、Lifecycle 2.9.3、Navigation 2.9.3
- テスト: Robolectric 4.15.1、Benchmark 0.4.14
- ビルド: Binary Validator 0.18.1、NMCP 1.1.0

### バグ修正

`koin-core`
- 互換性エラーの原因となっていたロガーの制約を元に戻しました。
- `LocalKoinApplication`と`LocalKoinScope`のコンテキスト処理を改善し、Composeのスコープ解決を修正しました。

`koin-build`
- Maven Centralへの公開に関する問題を修正しました。

## 4.1.0 {id="4-1-0"}

Kotlin `2.1.20`。

### 新機能

`koin-core`
- Koin設定をラップするための`KoinConfiguration` API。
- スコープアーキタイプ: スコープのカテゴリを表す専用のスコープ型修飾子。インスタンスをスコープカテゴリ（アーキタイプ）に対して解決できるようになりました。
- 機能オプション: Koin内部の新しい動作を有効にする機能フラグ。Koin設定の`options`ブロックでオプションを有効化します:
```kotlin
startKoin {
    options(
        // 新機能を有効化
        viewModelScopeFactory()
    )
}
```
- 外部システムまたはリソースからの解決を可能にする`ResolutionExtension`を備えた新しい`CoreResolver`（Ktor DIの連携に使用）。

`koin-android`
- ライブラリのアップグレード（`androidx.appcompat:appcompat:1.7.0`、`androidx.activity:activity-ktx:1.10.1`）に伴い、Min SDKが14から21に引き上げられました。
- ActivityまたはFragment用のスコープを宣言するためのモジュールDSL拡張機能`activityScope`、`activityRetainedScope`、`fragmentScope`。
- `activityScope()`、`activityRetainedScope()`、`fragmentScope()`関数でスコープアーキタイプが使用されるようになりました。

`koin-androidx-compose`
- Koin Compose Multiplatform、Compose 1.8、Lifecycle 2.9に適合。

`koin-compose`
- Compose 1.8およびLifecycle 2.9に適合。
- Android StudioおよびIntelliJ IDEAでプレビューを並行レンダリングするための`KoinApplicationPreview`。

`koin-compose-viewmodel`
- 親ActivityをViewModelホストとして使用するための`koinActivityViewModel`。

`koin-ktor`
- マルチプラットフォーム対応: 本モジュールがKotlin Multiplatform向けにビルドされるようになりました。マルチプラットフォームプロジェクトから`koin-ktor`を使用できます。
- 従来の`koin-ktor3`モジュールが`koin-ktor`に統合されました。
- Ktorモジュール内で直接Koinモジュールを宣言するための`Application.koinModule { }`および`Application.koinModules()`:
```kotlin
fun Application.customerDataModule() {
    koinModule {
        singleOf(::CustomerRepositoryImpl) bind CustomerRepository::class
    }
}
```
- `Module.requestScope`: `scope<RequestScope>`を手動で宣言することなく、Ktorリクエストスコープ内に定義を宣言できます。リクエストスコープはコンストラクタ内で`ApplicationCall`をインジェクトすることも可能です。

`koin-core-coroutines`
- `ModuleConfiguration`: 後から検証できるよう、モジュール設定を1つの構造体に集約します。
```kotlin
val m1 = module {
    single { Simple.ComponentA() }
}
val lm1 = lazyModule {
    single { Simple.ComponentB(get()) }
}
val conf = moduleConfiguration {
    modules(m1)
    lazyModules(lm1)
}
```
- Koin設定は`ModuleConfiguration`からモジュールを読み込むことができます:
```kotlin
startKoin {
    moduleConfiguration {
        modules(m1)
        lazyModules(lm1)
    }
}

// または以下のように記述することも可能
val conf = moduleConfiguration {
    modules(m1)
    lazyModules(lm1)
}

startKoin {
    moduleConfiguration(conf)
}
```

`koin-test-coroutines`
- コルーチン関連のテストAPI向けに、新しい`koin-test-coroutines`モジュールを追加。
- Verify APIで通常モジュールと遅延モジュールを混在させた`moduleConfiguration`をチェックできるようになりました:
```kotlin
val conf = moduleConfiguration {
    modules(m1)
    lazyModules(lm1)
}

conf.verify()

// Androidの型が必要な場合 (koin-android-test)
conf.verify(extraTypes = androidTypes)
```

`koin-core-annotations`
- `@InjectedParam`および`@Provided`により、プロパティをインジェクトされたパラメータまたは動的に提供されるものとしてマークします。現時点では`Verify` APIによって使用されます。

### 実験的機能

`koin-core`
- Wasm: Kotlin 2.1.20のUUID生成を使用します。

`koin-core-viewmodel`
- ViewModelスコープアーキタイプにスコープされたコンポーネントを宣言するためのモジュールDSL拡張機能`viewModelScope`。
- ViewModelクラスに紐づくスコープを作成する`viewModelScope()`関数。スコープを閉じるために`ViewModelScopeAutoCloseable`（`AutoCloseable` API）を使用するため、ViewModelスコープを手動で閉じる必要がなくなりました。
- `ScopeViewModel`クラスの更新: スコープの作成とクローズを処理する、すぐに使えるViewModelスコープ対応クラス。
- `viewModelScopeFactory`オプションによる、ViewModelのスコープからのコンストラクタインジェクション:
```kotlin
startKoin {
    options(
        // 新しいViewModelスコープ作成を有効化
        viewModelScopeFactory()
    )
}

// MyScopeViewModelのスコープからSessionがインジェクトされます
class MyScopeViewModel(val session: Session) : ViewModel()

module {
    viewModelOf(::MyScopeViewModel)
    viewModelScope {
        scopedOf(::Session)
    }
}
```

`koin-compose`
- `KoinMultiplatformApplication`関数: Compose Multiplatform向けのエントリポイント。

`koin-core-viewmodel-navigation`
- ナビゲーションの`NavBackStackEntry`からViewModelインスタンスを再利用するための`sharedViewModel`拡張関数。

`koin-test`
- `Verify` APIが、nullable、lazy、およびリストパラメータをチェックするようになりました。Verify呼び出し内で宣言する代わりに、プロパティに`@InjectedParam`または`@Provided`を付与して、インジェクトされるパラメータまたは動的に提供されるものとして宣言できます。
```kotlin
// Verifyで検出されるようになります
class ComponentB(val a: ComponentA? = null)
class ComponentBParam(@InjectedParam val a: ComponentA)
class ComponentBProvided(@Provided val a: ComponentA)
```

### 非推奨

`koin-android`
- `ScopeViewModel`は非推奨となりました。`koin-core-viewmodel`の`ScopeViewModel`クラスを使用してください。

`koin-compose`
- `KoinContext`は非推奨となり、削除可能です: Koinコンテキストは現在のデフォルトコンテキスト上で準備されるようになりました。

`koin-androidx-compose`
- `KoinAndroidContext`は非推奨となり、削除可能です: Koinコンテキストは現在のデフォルトコンテキスト上で準備されるようになりました。

`koin-androidx-compose-navigation`
- Lifecycleライブラリの更新に伴い、`koinNavViewModel`は不要になりました。`koinViewModel`に置き換えてください。

`koin-core-viewmodel-navigation`
- Lifecycleライブラリの更新に伴い、`koinNavViewModel`は不要になりました。`koinViewModel`に置き換えてください。

`koin-ktor`
- `Application.koin`は非推奨となり、`Application.koinModules`および`Application.koinModule`の使用が推奨されます。

### 破壊的変更

`koin-android`
- 古い状態対応のViewModel APIが削除されました:
  - `stateViewModel()`、`getStateViewModel()`: `viewModel()`を使用してください。
  - `getSharedStateViewModel()`、`sharedStateViewModel()`: `viewModel()`、または共有インスタンスには`activityViewModel()`を使用してください。

`koin-compose`
- 古いCompose API関数が削除されました:
  - `inject()`: `koinInject()`を使用してください。
  - `getViewModel()`: `koinViewModel()`を使用してください。
  - `rememberKoinInject()`: `koinInject()`に統合されました。
- `rememberKoinApplication`には`@KoinInternalApi`がマークされました。

## 4.0.4 {id="4-0-4"}

Kotlin `2.0.21`。

すべてのライブラリバージョンは[libs.versions.toml](https://github.com/InsertKoinIO/koin/blob/4.0.4/projects/gradle/libs.versions.toml)に記載されています。

### 新機能

`koin-core`
- `KoinPlatformTools.generateId()`がKotlinの`kotlin.uuid` APIを使用するようになり、すべてのプラットフォームで実際のUUIDを生成するようになりました。

`koin-viewmodel`
- Koin 4.0では、GoogleとJetBrainsのKMP API間で共有されるViewModel DSLおよびAPIが導入されました。重複を避けるため、ViewModel APIは`koin-core-viewmodel`および`koin-core-viewmodel-navigation`に配置されるようになりました。
- ViewModel DSLのインポートは`org.koin.core.module.dsl.*`です。

`koin-core-coroutines`: API全体が安定版になりました
- すべての`lazyModules`
- `awaitAllStartJobs`、`onKoinStarted`、`isAllStartedJobsDone`
- `waitAllStartJobs`、`runOnKoinStarted`
- `KoinApplication.coroutinesEngine`
- `Module.includes(lazy)`
- `lazyModule()`
- `KoinPlatformCoroutinesTools`

### 実験的機能

`koin-test`
- `ParameterTypeInjection`: `Verify` API用の動的パラメータインジェクションを宣言します。

`koin-androidx-startup`
- `androidx.startup.Initializer` APIを介してAndroidX StartupでKoinを起動します。`koin-androidx-startup` API全体が実験的機能です。

`koin-compose`
- `rememberKoinModules`: `@Composable`を使用してKoinモジュールをロードおよびアンロードします。
- `rememberKoinScope`: `@Composable`を使用してKoinスコープをロードおよびアンロードします。
- `KoinScope`: すべての子コンポーザブルに対してKoinスコープをロードします。

### 非推奨

`koin-test`
- `checkModules` API全体。`Verify` APIへ移行してください。

`koin-android`
- `koin-core`内の共有DSLへの移行に伴い、Android ViewModel DSLは非推奨となりました。
- 状態対応ViewModel APIのエラーレベルへの引き上げ:
  - `stateViewModel()`、`getStateViewModel()`: `viewModel()`を使用してください。
  - `getSharedStateViewModel()`、`sharedStateViewModel()`: `viewModel()`、または共有インスタンスには`activityViewModel()`を使用してください。

`koin-compose`
- 古いCompose API関数のエラーレベルへの引き上げ:
  - `inject()`: `koinInject()`を使用してください。
  - `getViewModel()`: `koinViewModel()`を使用してください。
  - `rememberKoinInject()`: `koinInject()`を使用してください。

`koin-compose-viewmodel`
- `koin-core`内の共有DSLへの移行に伴い、ViewModel DSLは非推奨となりました。
- `koinNavViewModel`は非推奨となり、`koinViewModel`の使用が推奨されます。

### 破壊的変更

前回のマイルストーンで非推奨となった以下のAPIが削除されました。`@KoinReflectAPI`が付与されたすべてのAPIも削除されています。

`koin-core`
- `ApplicationAlreadyStartedException`の名前が`KoinApplicationAlreadyStartedException`に変更されました。
- `KoinScopeComponent.closeScope()`が削除されました（内部で使用されなくなりました）。
- `InstanceContext`が内部の`ResolutionContext`に置き換わりました。
- `KoinPlatformTimeTools`、`Timer`、`measureDuration`が削除されました。Kotlin Time APIを使用してください。
- `KoinContextHandler`が削除され、`GlobalContext`が推奨されます。

`koin-android`
- `Fragment.createScope()`が削除されました。
- 新しい内部構造に合わせて、ViewModelファクトリAPI（主に内部用）が刷新されました。

`koin-compose`
- `StableParametersDefinition`が削除されました（内部で使用されなくなりました）。
- 遅延ViewModel API（古い`viewModel()`）が削除されました。
- `rememberStableParametersDefinition()`が削除されました（内部で使用されなくなりました）。

## 3.5.6 {id="3-5-6"}

Kotlin `1.9.22`。

すべてのライブラリバージョンは[libs.versions.toml](https://github.com/InsertKoinIO/koin/blob/3.5.6/projects/gradle/libs.versions.toml)に記載されています。

### 新機能

`koin-core`
- `KoinContext`に新しい関数が追加されました:
  - `fun loadKoinModules(module: Module, createEagerInstances: Boolean = false)`
  - `fun loadKoinModules(modules: List<Module>, createEagerInstances: Boolean = false)`
- `koinApplication()`に複数のシグネチャが追加されました:
  - `koinApplication(createEagerInstances: Boolean = true, appDeclaration: KoinAppDeclaration? = null)`
  - `koinApplication(appDeclaration: KoinAppDeclaration?)`
  - `koinApplication(createEagerInstances: Boolean)`
- 宣言スタイルを拡張する`KoinAppDeclaration`。
- JSでTime APIを使用するための`KoinPlatformTimeTools`。
- iOS: `synchronized` APIがTouchlab Lockable APIを使用するようになりました。

`koin-androidx-compose`
- Android環境から現在のKoinコンテキストにバインドするための`KoinAndroidContext`。

`koin-compose`
- 現在のデフォルトコンテキストで開始するための`KoinContext`。

`koin-ktor`
- Ktorインスタンス用に分離されたコンテキストを使用するようになりました（デフォルトコンテキストの代わりに`Application.getKoin()`を使用）。
- Koin Ktorプラグインに新しいモニタリング機能を追加。
- インスタンスをKtorリクエストにスコープするための`RequestScope`。

### 実験的機能

`koin-android`
- `ViewModelScope`: ViewModelスコープ向けの実験的API。

`koin-core-coroutines`
- バックグラウンドでモジュールをロードするための新しいAPI。

### 非推奨

`koin-android`
- `getLazyViewModelForClass()`: 処理が複雑でデフォルトのグローバルコンテキストを呼び出します。ActivityおよびFragment APIを使用してください。
- `resolveViewModelCompat()`は非推奨となり、`resolveViewModel()`の使用が推奨されます。

`koin-compose`
- `get()`および`inject()`は非推奨となり、`koinInject()`の使用が推奨されます。
- `getViewModel()`は非推奨となり、`koinViewModel()`の使用が推奨されます。
- `rememberKoinInject()`は非推奨となり、`koinInject()`の使用が推奨されます。

### 破壊的変更

`koin-core`
- `Koin.loadModules(modules: List<Module>, allowOverride: Boolean = true)`が`Koin.loadModules(modules: List<Module>, allowOverride: Boolean = true, createEagerInstances: Boolean = false)`に置き換わりました。
- `KoinExtension.koin`プロパティが`KoinExtension.onRegister()`関数に置き換わりました。
- iOS: `internal fun globalContextByMemoryModel(): KoinContext`が`MutableGlobalContext`を使用するようになりました。

`koin-compose`
- `KoinApplication(moduleList: () -> List<Module>, content: @Composable () -> Unit)`が削除され、`KoinContext`および`KoinAndroidContext`の使用が推奨されます。

## 3.4.3 {id="3-4-3"}

Kotlin `1.8.21`。

### 新機能

`koin-core`
- Koin用の拡張エンジンを作成するための`ExtensionManager` API（`ExtensionManager`および`KoinExtension`）。
- パラメータAPI: `parameterArrayOf`および`parameterSetOf`。

`koin-test`
- モジュールに対して`verify()`を実行するための`Verification` API。

`koin-android`
- ViewModelインジェクションの内部構造を刷新。
- `AndroidScopeComponent.onCloseScope()`コールバック。

`koin-android-test`
- モジュールに対して`androidVerify()`を実行するための`Verification` API。

`koin-androidx-compose`
- `get()`。
- `getViewModel()`。
- スコープ`KoinActivityScope`および`KoinFragmentScope`。

`koin-androidx-compose-navigation`（新規モジュール）
- `koinNavViewModel()`。

`koin-compose`（Compose向け新規マルチプラットフォームAPI）
- `koinInject`および`rememberKoinInject`。
- `KoinApplication`。

### 実験的機能

`koin-compose`
- `rememberKoinModules`。
- `KoinScope`および`rememberKoinScope`。

### 非推奨

`koin-compose`
- 遅延関数を避けるため、`inject()`は非推奨となり`get()`の使用が推奨されます。
- 遅延関数を避けるため、`viewModel()`は非推奨となり`getViewModel()`の使用が推奨されます。

### 破壊的変更

`koin-android`
- `LifecycleScopeDelegate`が削除されました。

`koin-androidx-compose`
- `getStateViewModel`が削除され、`koinViewModel`の使用が推奨されます。

## 関連リンク {id="related"}

- [API Stability](/docs/support/api-stability): 実験的機能（experimental）、非推奨（deprecated）、および内部API（internal）の定義について。
- [Versions, Roadmap & Support](/docs/support/): リリースサイクルとLTSラインについて。
- [Compiler Plugin Setup](/docs/setup/compiler-plugin): Koin Compiler Pluginのインストールおよびアップグレード。
- [Migrating from KSP to the Compiler Plugin](/docs/migration/from-ksp-to-compiler-plugin): KSPプロセッサからの移行。
- [Gradle Setup](/docs/setup/gradle): KoinアーティファクトとBOMについて。