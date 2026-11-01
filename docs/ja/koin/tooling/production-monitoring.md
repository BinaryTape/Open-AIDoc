---
title: 本番環境のモニタリング
---

# 本番環境のモニタリング

Kotzillaプラットフォームは、本番環境（プロダクション）におけるKoinアプリを監視します。Kotzilla SDKがKoinコンテナに組み込まれ、実際のユーザーセッションで依存関係がどのように解決されたかを記録し、Kotzillaコンソールがこのデータをパフォーマンスの問題やクラッシュレポートに変換します。KotzillaはKoinを開発している企業です。このプラットフォームは独立したオプションのサービスであり、Koinはこれなしでも完全に動作します。

本番環境にデプロイする前段階では、Koin自体のツールが設定エラーの大半を検知します：[コンパイル時安全性（Compile-Time Safety）](/docs/reference/koin-compiler/compile-safety)、[ロギング](/docs/reference/koin-core/starting-koin#logging)、および[モジュール検証](/docs/reference/koin-test/verify)。このページでは、リリース後に発生することについて説明します。すべてのツールの概要については、[本番環境とツール（Production & Tooling）](/docs/tooling)を参照してください。

## 検知対象 {id="what-it-detects"}

コンソールはセッションデータを「イシュー」としてグループ化します：

| イシュー | 意味 |
|-------|---------------|
| Startup Performance | アプリ初期化時の遅延 |
| Main Thread Performance | 画面をフリーズさせるメインスレッド上での処理。メインスレッドで100ミリ秒以上かかった依存関係の解決がここにレポートされます |
| Background Performance | バックグラウンドスレッドの処理におけるボトルネック |
| Crashes | 実際のユーザーセッションから発生したクラッシュ |

コンソールには、パフォーマンスのボトルネック、クラッシュ、アーキテクチャ上の問題を調査するためのグラフィカルなビューが用意されています。同様のイシューは [IDEプラグイン](/docs/tooling/ide-plugin) にも表示されます。

## 仕組み {id="how-it-works"}

SDKは起動時にKoinコンテナにフックします。それ以降、以下の2種類のデータを記録します。

- **構造（Structure）**: モジュール、定義、バインディングを含む依存関係グラフ。
- **ランタイムの動作（Runtime behavior）**: 解決の所要時間、ライフサイクルイベント、クラッシュ。

クラスにトレース用のコードを追加する必要はありません。データはコンテナから直接取得されます。独自の関数もトレースしたい場合は、[@Monitor](/docs/tooling/monitor) を追加してください。

SDKがサポートするプラットフォーム: Android、およびiOS、JVMデスクトップ、JS、Wasmを含むKotlin Multiplatformターゲット。

## セットアップの概要 {id="setup-overview"}

詳細かつ最新の手順はKotzillaの公式ガイドに記載されています。基本的にはそちらをご利用ください。以下の概要はセットアップ全体の流れを示すためのものです。

1. [Kotzillaコンソール](https://console.kotzilla.io)、[IDEプラグイン](/docs/tooling/ide-plugin)、またはMCPサーバーからアカウントを作成し、アプリを登録します。アプリキーが含まれた `kotzilla.json` ファイルが取得できます。
2. Kotzilla Gradleプラグイン（`io.kotzilla.kotzilla-plugin`）とSDKの依存関係（`io.kotzilla:kotzilla-sdk`）を追加します。
3. `kotzilla.json` をアプリモジュール（Android）または共有モジュール（KMP）に配置します。
4. `startKoin` ブロックの最後で `monitoring()` を呼び出します。

Androidでの例：

```kotlin
import io.kotzilla.generated.monitoring

class MainApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin {
            androidContext(this@MainApplication)
            modules(appModule)
            monitoring()
        }
    }
}
```

`monitoring()` は、`kotzilla.json` をもとにKotzilla Gradleプラグインによってビルド時に生成されます。これはComposable関数内からではなく、プラットフォームのエントリポイントごとに一度だけ呼び出してください。

プラットフォーム別ガイド:

- [Android](https://doc.kotzilla.io/docs/getstartedCustom/setupAndroid)
- [Android Compose](https://doc.kotzilla.io/docs/getstartedCustom/setupAndroidCompose)
- [Kotlin Multiplatform](https://doc.kotzilla.io/docs/getstartedCustom/setupKMP)
- [Compose Multiplatform](https://doc.kotzilla.io/docs/getstartedCustom/setupCMP)
- [SDK for libraries](https://doc.kotzilla.io/docs/getstartedCustom/setupSDKLibrary)

:::note
iOSでは、クラッシュのシンボル化（symbolication）にdSYMのアップロード手順が必要です。詳細はKotlin Multiplatformガイドで説明されています。
:::

## AIアシスタントとの統合 {id="ai-assistant-integration"}

Kotzilla MCPサーバーは、AIコーディングアシスタント（Claude Code、Cursor、Windsurf、Android Studio、その他のMCPクライアント）をKoinの診断機能に接続します。Koinのエラーをアシスタントに貼り付けると、サーバーがそれを分類し、段階的な修正ワークフローを返します。以下を認識できます:

- Koin Compiler Pluginによる **コンパイル時の診断情報**（`KOIN-D001` から `KOIN-M001` まで）。
- `NoBeanDefFoundException`、`InstanceCreationException`、循環依存エラーなどの **ランタイム例外**。

エンドポイントは `https://mcp.kotzilla.io/mcp`（ストリーマブルHTTP）です。Claude Codeでの設定例:

```bash
claude mcp add kotzilla --transport http https://mcp.kotzilla.io/mcp
```

初回利用時にKotzillaアカウントでのサインインが求められます。コンパイルエラーの修正はSDKがなくても機能します。ランタイム動作の分析にはSDKとセッションデータが必要です。

ビルド時にKoinの診断がレポートされると、Koin Compiler PluginはMCPサーバーを示すヒントを1つ出力します。これを無効にするには、`koinCompiler { }` ブロックで `aiAssist = false` を設定してください。

その他のクライアントについては、[MCPサーバーガイド](https://doc.kotzilla.io/docs/fixIssues/koinMcp) を参照してください。

## データとプライバシー {id="data-and-privacy"}

SDKは技術的なセッションデータ（依存関係グラフおよび [仕組み](#how-it-works) に記載されているランタイムデータ）を送信します。MCPサーバーは、エラーテキストとアシスタントからの構造化クエリのみを送信します。ソースファイルがマシン外に送信されることはありません。

ポリシーの全文については、[Kotzillaプライバシーポリシー](https://kotzilla.io/privacy) を参照してください。

## 料金 {id="cost"}

Developerプランは無料で、利用期間の制限はなく、イベント数に一定の上限（クォータ）が設けられています。Enterpriseプランではチームコラボレーション機能が追加されます。最新のプランについては [kotzilla.io](https://kotzilla.io) をご覧ください。

## サポートしていないこと {id="what-it-does-not-do"}

- **ビルド時に設定を検証するわけではありません。** それは [コンパイル時安全性](/docs/reference/koin-compiler/compile-safety) の役割です。
- **テストの代替にはなりません。** リリース前の動作確認には [テスト](/docs/reference/koin-test/testing) を使用してください。
- **Koinによる依存関係の解決方法を変更するわけではありません。** SDKはコンテナを監視するだけであり、定義はそのまま維持されます。
- **デフォルトでは独自コードをトレースしません。** [@Monitor](/docs/tooling/monitor) を追加しない限り、記録されるのはKoinによる解決のみです。

## 関連情報 {id="related"}

- [本番環境とツール](/docs/tooling): 目的に応じたツールの使い分け。
- [@Monitor](/docs/tooling/monitor): Kotzilla SDKで独自の関数をトレースする。
- [IDEプラグイン](/docs/tooling/ide-plugin): コードの隣で本番環境のイシューを確認する。
- [トラブルシューティング](/docs/reference/koin-core/troubleshooting): Koinのエラーの確認と修正。
- [Kotzillaドキュメント](https://doc.kotzilla.io): プラットフォームとSDKの完全なドキュメント。