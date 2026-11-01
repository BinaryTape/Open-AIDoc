---
title: 本番環境とツール
---

# 本番環境とツール

このページでは、Koin プロジェクトの各ステージと、それをカバーするツールを対応付けて紹介します。Koin 自体はビルド時、開発、およびテストをカバーしています。本番環境向けには、Kotzilla（Koin を開発している企業）がオプションのモニタリングプラットフォームを提供しています。

Koin に同梱されているものを除き、Koin のすべての機能はこのページにあるツールがなくても動作します。ニーズに合わせて選択してください。

## ニーズに応じたツールの選択 {id="which-tool-for-which-need"}

| ステージ | ニーズ | ツール | Koin に同梱 |
|-------|------|------|-----------------|
| ビルド時 | 依存関係の不足や誤った qualifier によるビルドの失敗 | Koin Compiler Plugin を利用した [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety) | はい |
| 開発 | Koin が何を生成し解決しているかを確認 | `printLogger()` やプラットフォームロガーによる [Logging](/docs/reference/koin-core/starting-koin#logging) | はい |
| 開発 | 定義とインジェクションポイント間のナビゲーション、エディタ内での問題の確認 | Android Studio および IntelliJ IDEA 向けの [IDE Plugin](/docs/tooling/ide-plugin) | いいえ（Kotzilla による無料プラグイン） |
| 開発 | AI コーディングエージェントによる Koin コードのセットアップ、作成、移行、診断 | Claude Code、Cursor、Codex、Copilot 向けの [Koin Skills](/docs/tooling/ai-agents) | いいえ（Koin チームによる無料スキル） |
| テスト | アプリを実行せずにモジュール設定を検証 | `verify()` による [Verifying Modules](/docs/reference/koin-test/verify) | はい |
| テスト | 定義をフェイクやモックに置き換え | `KoinTest` による [Testing](/docs/reference/koin-test/testing) | はい |
| 本番環境 | 選択した関数の実行時間をトレース | Kotzilla SDK を利用した [@Monitor](/docs/tooling/monitor) | アノテーションは「はい」（トレースには SDK が必要） |
| 本番環境 | 実際のユーザーセッションから起動時間、メインスレッドおよびバックグラウンドのパフォーマンス問題やクラッシュを確認 | Kotzilla プラットフォームによる [Production Monitoring](/docs/tooling/production-monitoring) | いいえ（Kotzilla のサービス） |

## ビルド時 {id="build-time"}

Koin Compiler Plugin は、コンパイル時に依存関係グラフをチェックします。定義の欠落、qualifier の欠落、または未知のスコープがある場合、実行時にクラッシュする代わりに `KOIN-Dxxx` 診断によってビルドが失敗します。これは防御の第一線となります。検証される内容やセットアップ方法については、[Compile-Time Safety](/docs/reference/koin-compiler/compile-safety) を参照してください。

## 開発 {id="development"}

Koin ロガーは、モジュールのロードとインスタンスの生成を出力します。`printLogger(Level.DEBUG)` やプラットフォームロガー（`androidLogger()`、SLF4J）を使用して有効にできます。これはコンソールや Logcat に未加工のテキストを出力するため、モニタリングツールではなくデバッグ支援用です。詳細は [Logging](/docs/reference/koin-core/starting-koin#logging) を参照してください。

[IDE Plugin](/docs/tooling/ide-plugin) は、ナビゲーション、モジュールと定義のツリービュー、エディタ内での設定チェック機能を追加します。

[Koin skills](/docs/tooling/ai-agents) は、セットアップ、定義、他の DI フレームワークからの移行、Koin エラーの診断など、Koin のルールを AI コーディングエージェントに提供します。

## テスト {id="tests"}

`verify()` は、通常の JUnit テストからモジュール内のすべての定義がビルド可能であることをチェックします。Compiler Plugin を使用している場合、コンパイル時の安全性（Compile-time safety）によって `verify()` がチェックする内容の大部分はすでにカバーされています。詳細は [Verifying Modules](/docs/reference/koin-test/verify) および [Testing](/docs/reference/koin-test/testing) を参照してください。

## 本番環境 {id="production"}

コンパイル時の安全性チェックやテストは設定エラーを検出します。しかし、起動時の解決にどれくらい時間がかかるか、どの依存関係がメインスレッドをブロックしているか、どのクラッシュが Koin の解決に起因しているかなど、実際のデバイス上でグラフがどのように動作するかまではわかりません。

Koin 自体には本番環境向けのモニタリング機能はありません。Koin コンテナに組み込まれる Kotzilla SDK を通じて、Kotzilla プラットフォームがこのニーズをカバーします。詳細は [Production Monitoring](/docs/tooling/production-monitoring) を参照してください。[@Monitor](/docs/tooling/monitor) アノテーションを使用すると、独自の関数にもこの機能を拡張できます。

## 関連情報 {id="related"}

- [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety): Compiler Plugin がビルド時にチェックする内容
- [Starting Koin](/docs/reference/koin-core/starting-koin#logging): Koin ロガーの有効化と設定
- [Verifying Modules](/docs/reference/koin-test/verify): テストからの設定チェック
- [IDE Plugin](/docs/tooling/ide-plugin): Android Studio および IntelliJ IDEA におけるナビゲーションとチェック機能
- [Production Monitoring](/docs/tooling/production-monitoring): Koin アプリ向けの Kotzilla プラットフォーム