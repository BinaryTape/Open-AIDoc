# エンベデディング (Embeddings)

`embeddings` モジュールは、テキストやコードのエンベデディング（埋め込み）を生成および比較する機能を提供します。エンベデディングは、意味的な内容を捉えたベクトル表現であり、効率的な類似性の比較を可能にします。

## 概要 {id="overview"}

このモジュールは、主に次の 2 つのコンポーネントで構成されています。

1. **embeddings-base**: エンベデディングのためのコアインターフェースとデータ構造。
2. **embeddings-llm**: ローカルでのエンベデディング生成のために Ollama を使用した実装。

## はじめに {id="getting-started"}

以下のセクションでは、エンベデディングを使用する基本的な例を以下の方法で紹介します。

- Ollama を介したローカルのエンベデディングモデル
- OpenAI エンベデディングモデルの使用

### ローカルエンベデディング {id="local-embeddings"}

ローカルモデルでエンベデディング機能を使用するには、システムに Ollama がインストールされ、実行されている必要があります。
インストールと実行の手順については、[公式の Ollama GitHub リポジトリ](https://github.com/ollama/ollama)を参照してください。

<!--- INCLUDE
import ai.koog.embeddings.local.LLMEmbedder
import ai.koog.prompt.executor.ollama.client.OllamaModels
import ai.koog.prompt.executor.ollama.client.OllamaClient
import kotlinx.coroutines.runBlocking
-->
```kotlin
fun main() {
    runBlocking {
        // OllamaClient インスタンスを作成
        val client = OllamaClient()
        // エンベッダー (embedder) を作成
        val embedder = LLMEmbedder(client, OllamaModels.Embeddings.NOMIC_EMBED_TEXT)
        // エンベデディングを作成
        val embedding = embedder.embed("This is the text to embed")
        // 出力にエンベデディングを表示
        println(embedding)
    }
}
```
<!--- KNIT example-embeddings-01.kt -->

Ollama のエンベデディングモデルを使用するには、以下の前提条件を満たしていることを確認してください。

- [Ollama](https://ollama.com/download) がインストールされ、実行されていること
- 以下のコマンドを使用して、ローカルマシンにエンベデディングモデルをダウンロードしていること：
    ```bash
    ollama pull <ollama-model-id>
    ```
    <!--- KNIT example-embeddings-01.txt -->

    `<ollama-model-id>` は、特定のモデルの Ollama 識別子に置き換えてください。利用可能なエンベデディングモデルとその識別子の詳細については、[Ollama モデルの概要](#ollama-models-overview)を参照してください。

### Ollama モデルの概要 {id="ollama-models-overview"}

以下の表は、利用可能な Ollama エンベデディングモデルの概要を示しています。

| モデル ID          | Ollama ID         | パラメータ | 次元数 | コンテキスト長 | パフォーマンス                                                           | トレードオフ                                                          |
|-------------------|-------------------|------------|------------|----------------|-----------------------------------------------------------------------|--------------------------------------------------------------------|
| NOMIC_EMBED_TEXT  | nomic-embed-text  | 137M       | 768        | 8192           | セマンティック検索やテキスト類似性タスク向けの高品質なエンベデディング | 品質と効率のバランスが良い                            |
| ALL_MINILM        | all-minilm        | 33M        | 384        | 512            | 一般的なテキストエンベデディングにおいて、優れた品質と高速な推論を実現          | モデルサイズが小さくコンテキスト長は短いが、非常に効率的 |
| MULTILINGUAL_E5   | zylonai/multilingual-e5-large   | 300M       | 768        | 512            | 100以上の言語で強力なパフォーマンスを発揮                              | モデルサイズは大きいが、優れた多言語対応能力を提供 |
| BGE_LARGE         | bge-large         | 335M       | 1024       | 512            | 英語のテキスト検索とセマンティック検索に最適              | モデルサイズは大きいが、高品質なエンベデディングを提供             |
| MXBAI_EMBED_LARGE | mxbai-embed-large | -          | -          | -              | テキストデータの高次元エンベデディング                           | 高次元エンベデディングの作成用に設計                  |

これらのモデルの詳細については、Ollama の [Embedding Models](https://ollama.com/blog/embedding-models) ブログ記事を参照してください。

### モデルの選択 {id="choosing-a-model"}

要件に応じて、どの Ollama エンベデディングモデルを選択すべきかについての一般的なヒントを以下に示します。

- 一般的なテキストエンベデディングには、`NOMIC_EMBED_TEXT` を使用します。
- 多言語サポートが必要な場合は、`MULTILINGUAL_E5` を使用します。
- （パフォーマンスを犠牲にしても）最高の品質を求める場合は、`BGE_LARGE` を使用します。
- （多少の品質を犠牲にしても）最高の効率を求める場合は、`ALL_MINILM` を使用します。
- 高次元エンベデディングが必要な場合は、`MXBAI_EMBED_LARGE` を使用します。

## OpenAI エンベデディング {id="openai-embeddings"}

OpenAI エンベデディングモデルを使用してエンベデディングを作成するには、以下の例に示すように `OpenAILLMClient` インスタンスの `embed` メソッドを使用します。

<!--- INCLUDE
import ai.koog.embeddings.local.LLMEmbedder
import ai.koog.prompt.executor.clients.openai.OpenAILLMClient
import ai.koog.prompt.executor.clients.openai.OpenAIModels
-->
```kotlin
suspend fun openAIEmbed(text: String) {
    // OPENAI_KEY 環境変数から OpenAI API トークンを取得
    val token = System.getenv("OPENAI_KEY") ?: error("Environment variable OPENAI_KEY is not set")
    // OpenAILLMClient インスタンスを作成
    val client = OpenAILLMClient(token)
    // エンベッダーを作成
    val embedder = LLMEmbedder(client, OpenAIModels.Embeddings.TextEmbeddingAda002)
    // エンベデディングを作成
    val embedding = embedder.embed(text)
    // 出力にエンベデディングを表示
    println(embedding)
}
```
<!--- KNIT example-embeddings-02.kt -->

## AWS Bedrock エンベデディング {id="aws-bedrock-embeddings"}

AWS Bedrock エンベデディングモデルを使用してエンベデディングを作成するには、`BedrockLLMClient` インスタンスと選択したモデルの `embed` メソッドを使用します。例：

<!--- INCLUDE
import ai.koog.embeddings.local.LLMEmbedder
import ai.koog.prompt.executor.clients.bedrock.BedrockClientSettings
import ai.koog.prompt.executor.clients.bedrock.BedrockLLMClient
import ai.koog.prompt.executor.clients.bedrock.BedrockModels
import aws.sdk.kotlin.runtime.auth.credentials.StaticCredentialsProvider
-->
```kotlin
suspend fun bedrockEmbed(text: String) {
    // 環境変数/設定から AWS 認証情報を取得
    val awsAccessKeyId = System.getenv("AWS_ACCESS_KEY_ID") ?: error("AWS_ACCESS_KEY_ID not set")
    val awsSecretAccessKey = System.getenv("AWS_SECRET_ACCESS_KEY") ?: error("AWS_SECRET_ACCESS_KEY not set")
    // (オプション) 一時的な認証情報のための AWS_SESSION_TOKEN
    val awsSessionToken = System.getenv("AWS_SESSION_TOKEN")
    // BedrockLLMClient インスタンスを作成
    val client = BedrockLLMClient(
        identityProvider = StaticCredentialsProvider {
            this.accessKeyId = awsAccessKeyId
            this.secretAccessKey = awsSecretAccessKey
            awsSessionToken?.let { this.sessionToken = it }
        },
        settings = BedrockClientSettings()
    )
    // エンベッダーを作成
    val embedder = LLMEmbedder(client, BedrockModels.Embeddings.AmazonTitanEmbedText)
    // エンベデディングを作成
    val embedding = embedder.embed(text)
    // 出力にエンベデディングを表示
    println(embedding)
}
```
<!--- KNIT example-embeddings-03.kt -->

### サポートされている AWS Bedrock エンベデディングモデル {id="supported-aws-bedrock-embedding-models"}

| プロバイダー | モデル名                   | モデル ID                       | 入力 | 出力    | 次元数 | コンテキスト長 | 備考                                                                                                 |
|----------|------------------------------|--------------------------------|-------|-----------|------------|----------------|-------------------------------------------------------------------------------------------------------|
| Amazon   | Titan Embeddings G1 - Text   | `amazon.titan-embed-text-v1`   | テキスト | エンベデディング | 1,536      | 8192           | 25以上の言語に対応。検索、セマンティック類似性、クラスタリングに最適化。検索のために長いドキュメントを分割することを推奨。 |
| Amazon   | Titan Text Embeddings V2     | `amazon.titan-embed-text-v2:0` | テキスト | エンベデディング | 1,024      | 8192           | 高精度、柔軟な次元数、多言語対応（100以上）。次元数を小さくすることでストレージを節約でき、正規化された出力を提供。 |
| Cohere   | Cohere Embed English v3      | `cohere.embed-english-v3`      | テキスト | エンベデディング | 1,024      | 8192           | 検索、取得、およびテキストのニュアンス理解のための SOTA（最先端）な英語テキストエンベデディング。                   |
| Cohere   | Cohere Embed Multilingual v3 | `cohere.embed-multilingual-v3` | テキスト | エンベデディング | 1,024      | 8192           | 多言語エンベデディング。言語を跨いだ検索とセマンティック理解において SOTA。                 |

> 最新のモデルサポートについては、[AWS Bedrock でサポートされているモデルのドキュメント](https://docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html)を参照してください。

## 例 {id="examples"}

以下の例は、エンベデディングを使用してコードをテキストや他のコードスニペットと比較する方法を示しています。

### コードとテキストの比較 {id="code-to-text-comparison"}

コードスニペットを自然言語の説明と比較して、意味的な一致を見つけます：

<!--- INCLUDE
import ai.koog.embeddings.base.Embedder
-->
```kotlin
suspend fun compareCodeToText(embedder: Embedder) { // Embedder 型
    // コードスニペット
    val code = """
        fun factorial(n: Int): Int {
            return if (n <= 1) 1 else n * factorial(n - 1)
        }
    """.trimIndent()

    // テキストによる説明
    val description1 = "A recursive function that calculates the factorial of a number"
    val description2 = "A function that sorts an array of integers"

    // エンベデディングを生成
    val codeEmbedding = embedder.embed(code)
    val desc1Embedding = embedder.embed(description1)
    val desc2Embedding = embedder.embed(description2)

    // 差分を計算（値が小さいほど類似度が高い）
    val diff1 = embedder.diff(codeEmbedding, desc1Embedding)
    val diff2 = embedder.diff(codeEmbedding, desc2Embedding)

    println("Difference between code and description 1: $diff1")
    println("Difference between code and description 2: $diff2")

    // コードは description2 よりも description1 により類似しているはずです
    if (diff1 < diff2) {
        println("The code is more similar to: '$description1'")
    } else {
        println("The code is more similar to: '$description2'")
    }
}
```
<!--- KNIT example-embeddings-04.kt -->

### コード間の比較 {id="code-to-code-comparison"}

構文の違いに関係なく、コードスニペットを比較して意味的な類似性を見つけます：

<!--- INCLUDE
import ai.koog.embeddings.base.Embedder
-->
```kotlin
suspend fun compareCodeToCode(embedder: Embedder) { // Embedder 型
    // 異なる言語による同じアルゴリズムの 2 つの実装
    val kotlinCode = """
        fun fibonacci(n: Int): Int {
            return if (n <= 1) n else fibonacci(n - 1) + fibonacci(n - 2)
        }
    """.trimIndent()

    val pythonCode = """
        def fibonacci(n):
            if n <= 1:
                return n
            else:
                return fibonacci(n-1) + fibonacci(n-2)
    """.trimIndent()

    val javaCode = """
        public static int bubbleSort(int[] arr) {
            int n = arr.length;
            for (int i = 0; i < n-1; i++) {
                for (int j = 0; j < n-i-1; j++) {
                    if (arr[j] > arr[j+1]) {
                        int temp = arr[j];
                        arr[j] = arr[j+1];
                        arr[j+1] = temp;
                    }
                }
            }
            return arr;
        }
    """.trimIndent()

    // エンベデディングを生成
    val kotlinEmbedding = embedder.embed(kotlinCode)
    val pythonEmbedding = embedder.embed(pythonCode)
    val javaEmbedding = embedder.embed(javaCode)

    // 差分を計算
    val diffKotlinPython = embedder.diff(kotlinEmbedding, pythonEmbedding)
    val diffKotlinJava = embedder.diff(kotlinEmbedding, javaEmbedding)

    println("Difference between Kotlin and Python implementations: $diffKotlinPython")
    println("Difference between Kotlin and Java implementations: $diffKotlinJava")

    // Kotlin と Python の実装の方が類似しているはずです
    if (diffKotlinPython < diffKotlinJava) {
        println("The Kotlin code is more similar to the Python code")
    } else {
        println("The Kotlin code is more similar to the Java code")
    }
}
```
<!--- KNIT example-embeddings-05.kt -->

## API ドキュメント {id="api-documentation"}

エンベデディングに関連する完全な API リファレンスについては、以下のモジュールのリファレンスドキュメントを参照してください。

- [embeddings-base](api:embeddings-base::ai.koog.embeddings.base): テキストおよびコードのエンベデディングを表現および比較するためのコアインターフェースとデータ構造を提供します。
- [embeddings-llm](api:embeddings-llm::): ローカルのエンベデディングモデルを操作するための実装が含まれています。