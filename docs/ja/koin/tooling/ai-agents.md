---
title: AIエージェントとKoinスキル
---

# AIエージェントとKoinスキル

Koinスキルは、コーディングエージェントにKoin 4.xおよびKoin Compiler Pluginの使い方（どのスタイルを使用すべきか、定義をどのように宣言・接続するか、他のDIフレームワークからどのように移行するか、Koinのエラーをどのように診断するか）を教えます。これらはGitHub上の[koin-skillsリポジトリ](https://github.com/InsertKoinIO/koin-skills)でKoinチームによってメンテナンスされており、Claude Code向けの`koin`プラグインおよび他のエージェント向けの標準エージェントスキルとして公開されています。このページでは、それらのインストール方法と各スキルの機能について説明します。

## Claude Codeでのインストール {id="install-in-claude-code"}

```
/plugin marketplace add InsertKoinIO/koin-skills
/plugin install koin@koin-skills
```

最初のコマンドはKoinスキルリポジトリをプラグインマーケットプレイスとして追加し、2番目のコマンドはそこから`koin`プラグインをインストールします。後から`/plugin marketplace update koin-skills`で更新できます。

Kotlin、Android、Compose、KMP、またはKtorプロジェクトでタスクが依存性注入に関わる場合、スキルは自動的に読み込まれます。名前を指定して呼び出す必要はありません。

## その他のエージェントでのインストール {id="install-in-other-agents"}

Cursor、Codex、Copilot、Windsurf、Geminiなど、エージェントスキルを読み込めるその他のエージェントの場合は、[skills](https://skills.sh) CLI（Node.js 22以降）を使用します。

```bash
npx skills add InsertKoinIO/koin-skills
```

これにより、[koin-skillsリポジトリ](https://github.com/InsertKoinIO/koin-skills)（完全なURL `https://github.com/InsertKoinIO/koin-skills` も使用可能）からスキルが読み取られ、4つのスキルが一覧表示され、選択したエージェント向けに選択したスキルがインストールされます。プロンプトなしですべてインストールする場合: `npx skills add InsertKoinIO/koin-skills --skill '*' -y`。各[GitHubリリース](https://github.com/InsertKoinIO/koin-skills/releases)には、スキルごとの`.skill`アーカイブと、完全なプラグインとしての`koin-plugin.zip`も添付されています。

## スキルの機能 {id="what-the-skills-do"}

| スキル | 用途 |
|---|---|
| `koin-setup` | 新規または既存のプロジェクトにKoinを追加する、あるいは既存のDIコンテナと併用して追加する |
| `koin` | プロジェクトのスタイルに合わせてKoinコードを作成する：定義、モジュール、エントリーポイント、スコープ、テスト |
| `di-migration` | Hilt、Dagger、Toothpick、Kodein、Metro、Koin 3.x、Koin DSL、またはKoin KSPからモジュール単位で移行する |
| `koin-diagnose` | Koinのエラーやクラッシュを修正し、ランタイム時のアプリの動作を確認する |

これらのスキルは本ドキュメントのルールに従います。[コンストラクタインジェクション](/docs/reference/koin-core/dsl)、Compiler Plugin DSL、またはKoin Annotationsを使用し、新規コードにKoin KSPを使用することはありません。移行は段階的に行われ、最後のバインディングが移行されるまで古いコンテナは動作し続けます。

## Kotzilla MCPサーバー {id="kotzilla-mcp-server"}

各スキルは[Kotzilla](https://kotzilla.io) MCPサーバーを使用して、Koinエラーの診断やランタイム時の定義の動作（ライフタイム、スコープ、起動コスト）を計測できます。これには無料のKotzillaアカウントが必要です。スキルはそれが役立つ場合に提案を行いますが、必須とすることはありません。

Claude Codeでは、`koin`プラグインにサーバーが含まれています。サインインするまで非アクティブな状態を維持します。`/mcp`を実行し、`plugin:koin:kotzilla`を選択してサインインしてください。その他のエージェントでは、エージェントのMCP設定にエンドポイント`https://mcp.kotzilla.io/mcp`（HTTPトランスポート、OAuth）を追加します。

## 制限事項 {id="limits"}

- スキルはKoin 4.2.2以降およびKotlin 2.3.20以降を対象としています。古いバージョンのKoinでは現在のセットアップで動作し、アップグレードを一度提案します。
- スキルはエージェントをガイドするものであり、レビューの代わりにはなりません。マージする前に変更内容を確認してください。
- ランタイムチェック（起動、メモリ、二重生成されたインスタンス）には、アプリ内にKotzilla SDKが必要です。SDKがない場合、スキルは計測結果ではなくコードから考えられる原因を指摘します。

## 関連情報 {id="related"}

- [Compiler Pluginのセットアップ](/docs/setup/compiler-plugin): スキルが依存するビルド時チェック。
- [Koin vs Hilt](/docs/intro/koin-vs-hilt): Hiltから移行する際の変更点。
- [モニタリング](/docs/tooling/monitor): ランタイムチェックを支えるKotzilla SDK。
- [GitHubのKoinスキル](https://github.com/InsertKoinIO/koin-skills): ソース、Issue、リリース。