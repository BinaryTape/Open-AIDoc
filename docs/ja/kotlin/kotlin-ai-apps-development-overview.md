[//]: # (title: AI 駆動アプリ開発のための Kotlin)
[//]: # (description: Koog、MCP Kotlin SDK、主要な LLM プロバイダー、RAG パイプライン、AI エージェント、Spring AI、LangChain4j を使用して、Kotlin で AI 駆動アプリケーションを構築する方法について学びます。)

<web-summary>Kotlin を使用して AI 駆動のアプリケーションを構築するために、Koog がどのように役立つかを確認しましょう。</web-summary>

Kotlin は、AI 駆動のアプリケーションを構築するためのモダンで実践的な基盤を提供します。  
プラットフォームを問わず使用でき、確立された AI フレームワークと適切に統合され、一般的な AI 開発パターンをサポートします。

## Koog {id="koog"}

[Koog](https://koog.ai) は、シンプルから複雑なものまで、AI エージェントを構築するための JetBrains によるオープンソースフレームワークです。
マルチプラットフォームのサポート、Spring Boot および Ktor との統合、慣用的な DSL、そしてすぐに使用できるプロダクション対応の機能を提供します。

### 数行でシンプルなエージェントを作成する {id="create-a-simple-agent-in-a-few-lines"}

```kotlin
fun main() {
    runBlocking {
        val agent = AIAgent(
            // Anthropic、Google、OpenRouter、またはその他のプロバイダーを使用
            executor = simpleOpenAIExecutor(System.getenv("OPENAI_API_KEY")),
            systemPrompt = "You are a helpful assistant. Answer user questions concisely.",
            llmModel = OpenAIModels.Chat.GPT4o
        )

        val result = agent.run("Hello! How can you help me?")
        println(result)
    }
}
```

<a href="https://docs.koog.ai/quickstart/" as="button" mode="rock" icon="arrow-right" icon-position="right">Koog を使ってみる</a>

### 主な機能 {id="key-features"}

* **マルチプラットフォーム開発のサポート**。マルチプラットフォームのサポートにより、JVM、JavaScript、WebAssembly、Android、および iOS 向けのエイジェンティック（agentic）なアプリケーション開発が可能になります。
* **信頼性とフォールトトレランス**。組み込みのリトライ機能により、タイムアウトやツールエラーなどの失敗を開発者が処理できるようになります。エージェントの永続化により、チャットメッセージだけでなく、エージェントの完全な状態マシンを復元することが可能です。
* **長いコンテキストのための組み込み履歴圧縮技術**。Koog には、追加の設定なしで、長期にわたる会話を圧縮および管理するための高度な戦略が備わっています。
* **エンタープライズ対応の統合**。Koog は、[Spring Boot](https://spring.io/projects/spring-boot) や [Ktor](https://ktor.io) などの人気のある JVM フレームワークと統合します。
* **OpenTelemetry エクスポーターによるオブザーバビリティ**。Koog は、AI アプリケーションの監視とデバッグのために、W&B Weave や Langfuse などの主要なオブザーバビリティプロバイダーとのすぐに使える統合機能を提供します。
* **LLM の切り替えとシームレスな履歴適応**。Koog では、既存の会話履歴を失うことなく、任意の時点で新しいツールセットを持つ別の LLM に切り替えることができます。また、OpenAI、Anthropic、Google など、複数の LLM プロバイダー間の再ルーティングも可能です。Koog と Ollama の統合により、ローカルモデルを使用してローカルでエージェントを実行することもできます。
* **JVM および Kotlin アプリケーションとの統合**。Koog は、JVM および Kotlin 開発者向けに特別に設計された、慣用的で型安全な DSL を提供します。
* **Model Context Protocol (MCP) との統合**。Koog では、エージェントで MCP ツールを使用できます。
* **知識の検索とメモリ**。エンベディング、ランク付けされたドキュメントストレージ、共有エージェントメモリにより、Koog 自体が会話を通じて能動的に知識を保持します。
* **ストリーミング機能**。Koog は、ストリーミングサポートとツールの並列呼び出しにより、開発者がレスポンスをリアルタイムで処理できるようにします。

### どこから始めるか {id="where-to-start"}

* [概要](https://docs.koog.ai/)で Koog の機能を確認する。
* [スタートガイド](https://docs.koog.ai/quickstart/)で最初の Koog エージェントを作成する。
* [Koog リリースノート](https://github.com/JetBrains/koog/releases)で最新のアップデートを確認する。
* [サンプル](https://docs.koog.ai/examples/)から学ぶ。

## Model Context Protocol (MCP) Kotlin SDK {id="model-context-protocol-mcp-kotlin-sdk"}

[MCP Kotlin SDK](https://github.com/modelcontextprotocol/kotlin-sdk) は、Model Context Protocol の Kotlin マルチプラットフォーム実装です。
この SDK を使用すると、開発者は Kotlin で AI 駆動のアプリケーションを構築し、JVM、WebAssembly、iOS にわたる LLM サーフェスと統合できます。

MCP Kotlin SDK を使用すると、以下のことが可能になります。

* コンテキストの処理を LLM の対話から分離することで、構造化および標準化された方法で LLM にコンテキストを提供できます。
* 既存のサーバーのリソースを消費する MCP クライアントを構築できます。
* プロンプト、ツール、リソースを LLM に公開する MCP サーバーを作成できます。
* stdio、SSE、WebSocket などの標準的な通信トランスポートを使用できます。
* すべての MCP プロトコルメッセージとライフサイクルイベントを処理できます。

## その他の AI 駆動アプリケーションシナリオを探索する {id="explore-other-ai-powered-application-scenarios"}

シームレスな Java 相互運用性と Kotlin マルチプラットフォームにより、Kotlin を確立された AI SDK やフレームワークと組み合わせ、バックエンドやデスクトップ/モバイル UI を構築し、RAG やエージェントベースのワークフローなどのパターンを採用できます。

> [Kotlin-AI-Examples](https://github.com/Kotlin/Kotlin-AI-Examples) リポジトリのサンプルを探索して実行できます。各プロジェクトは自己完結しています。各プロジェクトを、Kotlin ベースの AI アプリケーションを構築するためのリファレンスやテンプレートとして使用できます。

### 主要なモデルプロバイダーに接続する {id="connect-to-major-model-providers"}

Kotlin を使用して、OpenAI、Anthropic、Google などの主要なモデルプロバイダーに接続します。

* [OpenAI](https://github.com/openai/openai-java) — OpenAI API 用の公式 Java SDK。レスポンス、チャット、画像、オーディオをカバーしています。
* [Anthropic (Claude)](https://github.com/anthropics/anthropic-sdk-java) — Claude Messages API 用の公式 Java SDK。Vertex AI および Bedrock 統合用のモジュールが含まれています。
* [Google AI (Gemini / Vertex AI)](https://github.com/googleapis/java-genai) — Gemini API と Vertex AI を切り替える単一のクライアントを備えた公式 Java SDK。
* [Azure OpenAI](https://github.com/Azure/azure-sdk-for-java/tree/main/sdk/openai/azure-ai-openai) — Azure OpenAI Service 用の公式 Java クライアント。チャットの補完とエンベディングをサポートしています。
* [AWS Bedrock](https://github.com/aws/aws-sdk-kotlin) — 基盤モデルを呼び出すための公式 SDK。Bedrock および Bedrock Runtime 用の Kotlin SDK と Java SDK が含まれています。

### RAG パイプラインとエージェントベースのアプリを作成する {id="create-rag-pipelines-and-agent-based-apps"}

* [Spring AI](https://github.com/spring-projects/spring-ai) — プロンプト、チャット、エンベディング、ツールと関数の呼び出し、およびベクトルストアのためのマルチプロバイダー抽象化。
* [LangChain4j](https://docs.langchain4j.dev/tutorials/kotlin/) — プロンプト、ツール、検索拡張生成（RAG）パイプライン、およびエージェントのための Kotlin 拡張機能を備えた JVM ツールキット。

## 次のステップ {id="what-s-next"}

* [Spring AI を使用して質問に答える Kotlin アプリを作成する](spring-ai-guide.md)チュートリアルを完了し、IntelliJ IDEA で Kotlin と Spring AI を使用する方法について詳しく学びましょう。
* [Kotlin コミュニティ](https://kotlinlang.org/community/)に参加して、Kotlin で AI アプリケーションを構築している他の開発者とつながりましょう。
* [Kotlin 開発に役立つ AI ツール](ai-for-development.md)について学びましょう。