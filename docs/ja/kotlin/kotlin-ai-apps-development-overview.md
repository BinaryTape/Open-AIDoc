[//]: # (title: AI搭載アプリ開発のためのKotlin)
<web-summary>Koog、MCP Kotlin SDK、主要なLLMプロバイダー、RAGパイプライン、AIエージェント、Spring AI、LangChain4jを使用して、KotlinでAI搭載アプリケーションを構築する方法を学びます。</web-summary>

<web-summary>Koogを使用してKotlinでAI搭載アプリケーションを構築する方法を学びます。</web-summary>

Kotlinは、AI搭載アプリケーションを構築するためのモダンで実用的な基盤を提供します。  
マルチプラットフォームで利用でき、実績のあるAIフレームワークとうまく連携し、一般的なAI開発パターンをサポートします。

## Koog {id="koog"}

[Koog](https://koog.ai) は、シンプルなものから複雑なものまで、AIエージェントを構築するためのJetBrains発のオープンソースフレームワークです。
マルチプラットフォームのサポート、Spring BootおよびKtorとの連携、イディオマティックなDSL、そして本番環境ですぐに使える機能を標準で提供します。

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

<a href="https://docs.koog.ai/quickstart/" as="button" mode="rock" icon="arrow-right" icon-position="right">Get started with Koog</a>

### 主な機能 {id="key-features"}

* **マルチプラットフォーム開発のサポート**。マルチプラットフォームサポートにより、JVM、JavaScript、WebAssembly、Android、iOS向けの自律型（agentic）アプリケーション開発が可能になります。
* **信頼性と耐障害性**。組み込みのリトライ機能により、Koogはタイムアウトやツールのエラーなどの障害への対処を容易にします。エージェントの永続化により、チャットメッセージだけでなくエージェントの完全なステートマシンを復元できます。
* **長いコンテキスト向けの組み込み履歴圧縮技術**。Koogには、追加の設定なしで長時間の会話を圧縮・管理するための高度な戦略が備わっています。
* **エンタープライズ対応の統合**。Koogは、[Spring Boot](https://spring.io/projects/spring-boot) や [Ktor](https://ktor.io) などの人気のあるJVMフレームワークと統合できます。
* **OpenTelemetryエクスポーターによる可観測性**。Koogは、AIアプリケーションの監視やデバッグのために、W&B WeaveやLangfuseなどの人気のある可観測性プロバイダーとの統合をすぐに利用できる形で提供します。
* **LLMの切り替えとシームレスな履歴適応**。Koogを使用すると、既存の会話履歴を失うことなく、任意の時点で新しいツールセットを備えた別のLLMに切り替えることができます。また、OpenAI、Anthropic、Googleなど、複数のLLMプロバイダー間での再ルーティングも可能です。KoogとOllamaの連携により、ローカルモデルを使用してローカルでエージェントを実行することもできます。
* **JVMおよびKotlinアプリケーションとの統合**。Koogは、JVMおよびKotlin開発者向けに特別に設計された、イディオマティックで型安全なDSLを提供します。
* **Model Context Protocol (MCP) の統合**。Koogを使用すると、エージェント内でMCPツールを利用できます。
* **知識の検索とメモリ**。埋め込み（embeddings）、ランク付けされたドキュメントストレージ、共有エージェントメモリにより、Koog自体が会話をまたいで能動的に知識を保持します。
* **ストリーミング機能**。Koogを使用すると、ストリーミングのサポートと並列ツール呼び出しによって、開発者はリアルタイムで応答を処理できます。

### はじめに {id="where-to-start"}

* [概要（Overview）](https://docs.koog.ai/)でKoogの機能を確認する。
* [クイックスタートガイド](https://docs.koog.ai/quickstart/)で最初のエージェントを作成する。
* [Koogリリースノート](https://github.com/JetBrains/koog/releases)で最新の更新情報を確認する。
* [サンプル](https://docs.koog.ai/examples/)から学ぶ。

## Model Context Protocol (MCP) Kotlin SDK {id="model-context-protocol-mcp-kotlin-sdk"}

[MCP Kotlin SDK](https://github.com/modelcontextprotocol/kotlin-sdk) は、Model Context ProtocolのKotlin Multiplatform実装です。 
このSDKを使用することで、開発者はKotlinでAI搭載アプリケーションを構築し、JVM、WebAssembly、iOSにわたるLLMの利用環境と連携させることができます。

MCP Kotlin SDKを使用すると、次のことができます。

* コンテキスト処理をLLMとの対話から分離することで、構造化かつ標準化された方法でコンテキストをLLMに提供する。
* 既存のサーバーからリソースを利用するMCPクライアントを構築する。
* プロンプト、ツール、リソースをLLMに公開するMCPサーバーを作成する。
* stdio、SSE、WebSocketなどの標準的な通信トランスポートを使用する。
* すべてのMCPプロトコルメッセージとライフサイクルイベントを処理する。

## その他のAI搭載アプリケーションのシナリオを探索する {id="explore-other-ai-powered-application-scenarios"}

シームレスなJavaとの相互運用性とKotlin Multiplatformのおかげで、Kotlinを既存のAI SDKやフレームワークと組み合わせたり、バックエンドやデスクトップ/モバイルUIを構築したり、RAGやエージェントベースのワークフローなどのパターンを採用したりできます。

> [Kotlin-AI-Examples](https://github.com/Kotlin/Kotlin-AI-Examples) リポジトリのサンプルを探索して実行できます。
> 各プロジェクトは自己完結しています。KotlinベースのAIアプリケーションを構築するためのリファレンスまたはテンプレートとして各プロジェクトを使用できます。

### 主要なモデルプロバイダーに接続する {id="connect-to-major-model-providers"}

Kotlinを使用して、OpenAI、Anthropic、Googleなどの主要なモデルプロバイダーに接続します。

* [OpenAI](https://github.com/openai/openai-java) — OpenAI APIの公式Java SDK。レスポンス、チャット、画像、音声をカバーしています。
* [Anthropic (Claude)](https://github.com/anthropics/anthropic-sdk-java) — Claude Messages APIの公式Java SDK。Vertex AIおよびBedrock連携用のモジュールを含みます。 
* [Google AI (Gemini / Vertex AI)](https://github.com/googleapis/java-genai) — Gemini APIとVertex AIを切り替えられる単一のクライアントを提供する公式Java SDK。
* [Azure OpenAI](https://github.com/Azure/azure-sdk-for-java/tree/main/sdk/openai/azure-ai-openai) — Azure OpenAI Serviceの公式Javaクライアント。チャット補完と埋め込みをサポートしています。
* [AWS Bedrock](https://github.com/aws/aws-sdk-kotlin) — 基底モデルを呼び出すための公式SDK。BedrockおよびBedrock Runtime用のKotlin SDKとJava SDKが含まれています。

### RAGパイプラインとエージェントベースのアプリを作成する {id="create-rag-pipelines-and-agent-based-apps"}

* [Spring AI](https://github.com/spring-projects/spring-ai) — プロンプト、チャット、埋め込み、ツール、ファンクションコーリング、ベクトルストア向けのマルチプロバイダー抽象化。
* [LangChain4j](https://docs.langchain4j.dev/tutorials/kotlin/) — プロンプト、ツール、検索拡張生成（RAG: Retrieval-Augmented Generation）パイプライン、エージェント向けのKotlin拡張を備えたJVMツールキット。

## 次のステップ {id="what-s-next"}

* [Spring AIを使用して質問に回答するKotlinアプリを作成する](spring-ai-guide.md) チュートリアルを完了して、IntelliJ IDEAでKotlinとSpring AIを使用する方法についてさらに詳しく学ぶ
* [Kotlinコミュニティ](https://kotlinlang.org/community/) に参加して、KotlinでAIアプリケーションを構築している他の開発者とつながる
* [Kotlin開発に役立つAIツール](ai-for-development.md) について学ぶ