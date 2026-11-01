---
title: IDEプラグイン
---

# IDEプラグイン

Android StudioおよびIntelliJ IDEA向けのKoinプラグインは、各定義がどこで宣言され、どこで使用され、何が不足しているかなど、Koinの設定をIDE内に表示します。これはKotzillaによって構築され、JetBrains Marketplaceで無料で提供されています。後述するアプリケーションの課題（Application issues）を除き、Kotzillaプラットフォームは不要です。

## インストール {id="installation"}

プラグインは [JetBrains Marketplace](https://plugins.jetbrains.com/plugin/26131-koin-dependency-injection-official-) からインストールするか、IDE内からインストールします。「Settings」（設定）を開き、「Plugins」（プラグイン）、「Marketplace」の順に進み、「Koin」を検索してインストール後、IDEを再起動してください。

このプラグインには、IntelliJ Platform 2024.2以降をベースとしたIDEが必要です。Android、JVM、およびKotlin Multiplatformプロジェクトで動作します。

## 設定ツリービュー {id="configuration-tree-view"}

このプラグインは、Koin設定のツリービューを追加します：

- **Modules（モジュール）**: テストモジュール、`startKoin` や `koinApplication` 内でインライン宣言されたモジュール、スタートエントリーを含む、宣言されたすべてのモジュール。
- **Definitions（定義）**: 各モジュールのシングルトン、ファクトリ、ViewModel、スコープ定義、および注入されるパラメータ。

入力することでツリー内を検索でき、エントリーを選択するとエディタでその場所が開きます。

このツリーは、Constructor DSLおよびClassic DSL（`singleOf(::T)`、`single { }`）、Ktor DSL、Compose API、Koin Annotations（修飾子やジェネリック型を含む）を読み取ります。

## ナビゲーション {id="navigation"}

ガターアイコン（Gutter icons）により、定義、注入ポイント、パラメータがマークされます。これらから以下の操作が可能です：

- 注入ポイント（`get()`、`by inject()`、`koinViewModel()`、コンストラクタパラメータ）から、それを提供する定義へとジャンプする
- 定義から、それを使用している場所へとジャンプする
- 設定ツリー内でその定義を開く

プラグインは定義の引数の型を読み取り、注入されるパラメータを含め、それが何に依存しているかを検出します。表示するガターアイコンはプラグイン設定で変更できます。

## 設定のチェック {id="configuration-checks"}

プラグインは編集中に設定をチェックし、Koin Insightsビューの「Configuration issues」タブで問題を報告します。これには、定義のない依存関係、誰も宣言していない型の使用、誰も使用していない定義、その他の設定ミスなどが含まれます。

各インスペクションは、IDE設定でオンまたはオフに切り替えることができます。

:::note
これらのチェックはエディタ内で実行されます。これらは高速なフィードバックループを提供するものであり、ビルド時の検証に代わるものではありません。[Koin Compiler Plugin](/docs/intro/koin-compiler-plugin) を使用すると、同じ種類のエラーでビルドを失敗させることができます。詳細は [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety) を参照してください。
:::

## アプリケーションの課題 (Application issues) {id="application-issues"}

アプリがKotzilla SDKを通じてKotzillaプラットフォームにデータを送信している場合、「Application issues」タブには、実際のユーザーセッションで検出された問題（起動の遅延、メインスレッドのブロッキング、バックグラウンドのボトルネック、クラッシュ）がコードの横に表示されます。「Kotzilla Flight Check」タブには、KoinのバージョンとSDKが設定されているかどうかが表示されます。

この機能には、KotzillaアカウントとSDKが必要です。[Production Monitoring](/docs/tooling/production-monitoring) を参照してください。

検出された問題について、プラグインはコンテキスト（影響を受けるコンポーネント、依存関係チェーン、パフォーマンスデータ）を含むプロンプトを生成し、GitHub Copilot、Gemini、Claude Code、JunieなどのAIコーディングアシスタントに貼り付けることができます。

## 制限事項 {id="limits"}

- **活発に開発中**: 機能はリリースごとに変更されます。現在のバージョンと変更履歴については、Marketplaceのページを確認してください。
- **エディタ専用**: プラグインはCIでは実行されません。マージをブロックするチェックを行うには、[Compile-Time Safety](/docs/reference/koin-compiler/compile-safety) または [Verifying Modules](/docs/reference/koin-test/verify) を使用してください。

プラグイン自体のドキュメントは [doc.kotzilla.io](https://doc.kotzilla.io/docs/discover/idePlugin) にあります。

## 関連情報 {id="related"}

- [Production & Tooling](/docs/tooling): ニーズに応じたツールの選択
- [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety): ビルド時に捕捉される同様のエラーについて
- [Verifying Modules](/docs/reference/koin-test/verify): テストから設定をチェックする
- [Troubleshooting](/docs/reference/koin-core/troubleshooting): Koinエラーの読み方と修正方法
- [Production Monitoring](/docs/tooling/production-monitoring): Application issuesタブを支えるデータについて