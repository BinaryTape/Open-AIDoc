---
title: ようこそ
---

# ようこそ

Koin は Kotlin 向けの依存性注入（Dependency Injection）フレームワークです。モジュール内でクラスの構築方法を宣言すると、Koin が実行時にインスタンスを生成して依存関係を結びつけます。また、オプションの Koin Compiler Plugin を使用すれば、ビルド時に依存関係グラフ全体をチェックできます。Android、Compose、Kotlin Multiplatform、Ktor、およびあらゆる Kotlin/JVM アプリケーションで動作します。

このページはドキュメントの全体マップです。以下の各セクションでは、どのような疑問に答えているか、そしてどこから読み始めるべきかを紹介しています。

```kotlin
class UserRepository(private val api: ApiService)

val appModule = module {
    single<ApiService>()
    single<UserRepository>()
}

fun main() {
    startKoin { modules(appModule) }
}
```

## やりたいことから探す {id="i-want-to"}

- まず依存性注入を理解したい: [依存性注入とは？](/docs/intro/what-is-dependency-injection)
- 5分でKoinの仕組みを理解したい: [コアコンセプト](/docs/intro/core-concepts)
- DSLとアノテーションのどちらを使うか選びたい: [スタイルの選択](/docs/intro/choosing-your-style)
- GradleビルドにKoinを追加したい: [Gradleのセットアップ](/docs/setup/gradle)
- Composable内でViewModelを注入したい: [ComposeでのViewModel](/docs/reference/koin-compose/compose-viewmodel)
- Activity、Fragment、Serviceで注入したい: [Androidのエントリーポイント](/docs/reference/koin-android/entry-points)
- Retrofit、Room、OkHttpを連携させたい: [Androidライブラリの統合](/docs/reference/koin-android/binding-patterns)
- AndroidとiOS間でモジュールを共有したい: [KMPの共有パターン](/docs/reference/koin-core/kmp-shared-modules)
- IDなどの実行時値を定義に渡したい: [注入パラメータ](/docs/reference/koin-core/injection-parameters)
- Koinの設定をテストしたい: [Koin設定の検証](/docs/reference/koin-test/verify) および [コンパイル時の安全性](/docs/reference/koin-compiler/compile-safety)
- 「No definition found」エラーを修正したい: [トラブルシューティング](/docs/reference/koin-core/troubleshooting)
- Hiltから移行したい: [Hiltからの移行](/docs/reference/koin-android/hilt-migration)
- アノテーションをKSPからCompiler Pluginに移行したい: [KSPからの移行](/docs/migration/from-ksp-to-compiler-plugin)
- 本番環境でのKoinの動作を確認したい: [本番環境でのモニタリング](/docs/tooling/production-monitoring)

## 各セクションの案内 {id="where-to-go"}

### はじめに {id="get-started"}

Koinとは何か、どのように動作するのか、どのスタイルを使うべきか？

- [Koinとは何か？](/docs/intro/what-is-koin): Koinの概要と仕組み（ランタイムおよびコンパイル時）。
- [コアコンセプト](/docs/intro/core-concepts): 定義、モジュール、コンテナ、注入、スコープ。
- [スタイルの選択](/docs/intro/choosing-your-style): アノテーションまたはDSL（Compiler Plugin、Constructor DSL、Classic DSL）。
- [Koin Compiler Plugin](/docs/intro/koin-compiler-plugin): ビルド時にプラグインが行う処理。

### セットアップ {id="setup"}

ビルド設定に何を追加すればよいか？

- [セットアップ](/docs/setup): 各プラットフォーム向けの導入手順。
- [Gradleのセットアップ](/docs/setup/gradle): BOMと各Koinアーティファクト。
- [Compiler Pluginのセットアップ](/docs/setup/compiler-plugin): Gradleプラグインの導入と設定。

### チュートリアル {id="tutorials"}

Koinを使った最初のアプリをステップバイステップで構築するには？

- [Kotlin](/docs/quickstart/kotlin): 純粋なKotlinアプリケーション。
- [Android - ViewModel](/docs/quickstart/android-viewmodel) および [Android - Jetpack Compose](/docs/quickstart/android-compose)。
- [Compose Multiplatform](/docs/quickstart/cmp): AndroidとiOSでの共通UI。
- [Ktor](/docs/quickstart/ktor): サーバーアプリケーション。

### コア機能 {id="core"}

任意のプラットフォームで依存関係を宣言、整理、取得するには？

- [Koinの起動](/docs/reference/koin-core/starting-koin): `startKoin`、ロギング、プロパティ。
- [モジュール](/docs/reference/koin-core/modules) および [定義](/docs/reference/koin-core/definitions): Koinが生成するコンポーネントの宣言。
- [スコープ](/docs/reference/koin-core/scopes): ライフサイクルに紐づくインスタンス。
- [トラブルシューティング](/docs/reference/koin-core/troubleshooting): エラーとその対処法。

### プラットフォーム {id="platforms"}

特定のプラットフォームやフレームワークでKoinを使用するには？

- Android: [AndroidでKoinを起動する](/docs/reference/koin-android/start)、[Android ViewModel](/docs/reference/koin-android/viewmodel)、[マルチモジュールAndroidアプリ](/docs/reference/koin-android/multi-module)。
- Compose: [Koin for Compose](/docs/reference/koin-compose/compose)、[ComposeでのViewModel](/docs/reference/koin-compose/compose-viewmodel)、[Navigation 3](/docs/reference/koin-compose/navigation3)。
- Kotlin Multiplatform: [KMPのセットアップ](/docs/reference/koin-core/kmp-setup)、[共有パターン](/docs/reference/koin-core/kmp-shared-modules)。
- Ktor: [Koin for Ktor](/docs/reference/koin-ktor/ktor)、[リクエストスコープ](/docs/reference/koin-ktor/ktor-scopes)。

### テスト {id="testing"}

Koinを使用するコードのテストや、Koin設定自体のテストを行うには？

- [テストでの注入](/docs/reference/koin-test/testing): `KoinTest`、定義のテスト用フェイクへの置き換え。
- [Koin設定の検証](/docs/reference/koin-test/verify): 単体テストでのモジュールのチェック。
- [Android計装テスト](/docs/reference/koin-android/instrumented-testing) および [Composableのテスト](/docs/reference/koin-compose/compose-testing)。

### 本番運用とツール {id="production-tooling"}

Koinアプリの作成、検証、実行を支援するツールは？

- [ツール](/docs/tooling): Koin関連ツールの概要。
- [IDEプラグイン](/docs/tooling/ide-plugin): Android StudioおよびIntelliJ IDEAでのコードジャンプとチェック。
- [Monitor](/docs/tooling/monitor) および [本番環境でのモニタリング](/docs/tooling/production-monitoring): 実行時におけるKoinの動作の可視化。

### 移行 {id="migration"}

他のフレームワークや古いKoin環境から移行するには？

- [Koin vs Hilt](/docs/intro/koin-vs-hilt): 両フレームワークの比較。
- [Hiltからの移行](/docs/reference/koin-android/hilt-migration): ステップバイステップの移行ガイド。
- [JSR-330互換性](/docs/reference/koin-android/jsr330): `javax.inject` の `@Inject` や `@Singleton` をそのまま維持。
- [KSPからの移行](/docs/migration/from-ksp-to-compiler-plugin): アノテーションをCompiler Pluginへ移行。

### リファレンス {id="reference"}

すべてのキーワード、アノテーション、設定オプションの一覧は？

- [DSLリファレンス](/docs/reference/koin-core/dsl): すべてのDSLキーワード。
- [アノテーションリファレンス](/docs/reference/koin-annotations/annotations-inventory): すべてのアノテーションとそのパラメータ。
- [Compiler Pluginオプション](/docs/reference/koin-annotations/options): プラグインのすべてのGradleオプション。

### サポート {id="support"}

どのバージョンを使うべきか、何が変更されたか、どこでサポートを受けられるか？

- [リリース](/docs/support/releases): バージョン、変更点、アップグレードに関する注意事項。
- [APIの安定性](/docs/support/api-stability): 安定版（stable）、実験的（experimental）、内部用（internal）の意味。
- [サポート](/docs/support): ロードマップ、コミュニティ、サポートオプション。

## 関連情報 {id="related"}

- [Koinとは何か？](/docs/intro/what-is-koin): Koinを初めて使う方向けの推奨ガイド。
- [コアコンセプト](/docs/intro/core-concepts): 他のすべてのページの基礎となる設計思想。
- [セットアップ](/docs/setup): 使用するプラットフォームへのKoinのインストール。