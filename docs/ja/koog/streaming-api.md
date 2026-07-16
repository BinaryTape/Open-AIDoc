# ストリーミングAPI

Koogの**ストリーミングAPI**を使用すると、**LLMの出力を逐次的に（インクリメンタルに）** Kotlinでは `Flow<StreamFrame>`、Javaでは `Flow.Publisher<StreamFrame>` として取得できます。
レスポンス全体が完了するのを待つ代わりに、コードで以下のことが可能になります：

- アシスタントのテキストが到着するたびにレンダリングする
- **ツール呼び出し（tool calls）**をライブで検出し、それに基づいて動作する
- ストリームが**いつ、なぜ終了したか**を把握する

ストリームは、以下の2つのカテゴリに分類される**型付きフレーム**を運びます：

=== "Kotlin"

    **デルタフレーム（Delta frames）**（増加分/部分的なコンテンツ）：

    - `StreamFrame.TextDelta(text: String, index: Int?)` — 逐次的なアシスタントテキスト
    - `StreamFrame.ReasoningDelta(text: String?, summary: String?, index: Int?)` — 逐次的な推論テキストおよび要約
    - `StreamFrame.ToolCallDelta(id: String?, name: String?, content: String?, index: Int?)` — 部分的なツールの呼び出し

    **コンプリートフレーム（Complete frames）**（完全なコンテンツ）：

    - `StreamFrame.TextComplete(text: String, index: Int?)` — 完全なアシスタントテキスト
    - `StreamFrame.ReasoningComplete(text: List<String>, summary: List<String>?, encrypted: String?, index: Int?)` — オプションの要約および暗号化されたコンテンツを含む完全な推論
    - `StreamFrame.ToolCallComplete(id: String?, name: String, content: String, index: Int?)` — 完全なツール呼び出し

    **終了マーカー（End marker）**：

    - `StreamFrame.End(finishReason: String?, metaInfo: ResponseMetaInfo)` — レスポンスのメタ情報を含むストリーム終了マーカー

=== "Java"

    **デルタフレーム（Delta frames）**（増加分/部分的なコンテンツ）：

    - `StreamFrame.TextDelta` — 逐次的なアシスタントテキスト。フィールド：`getText()`, `getIndex()`。
    - `StreamFrame.ReasoningDelta` — 逐次的な推論テキストおよび要約。フィールド：`getText()`, `getSummary()`, `getIndex()`。
    - `StreamFrame.ToolCallDelta` — 部分的なツールの呼び出し。フィールド：`getId()`, `getName()`, `getContent()`, `getIndex()`。

    **コンプリートフレーム（Complete frames）**（完全なコンテンツ）：

    - `StreamFrame.TextComplete` — 完全なアシスタントテキスト。フィールド：`getText()`, `getIndex()`。
    - `StreamFrame.ReasoningComplete` — オプションの要約および暗号化されたコンテンツを含む完全な推論。フィールド：`getText()`（`List<String>` を返す）, `getSummary()`（`List<String>` を返す）, `getEncrypted()`, `getIndex()`。
    - `StreamFrame.ToolCallComplete` — 完全なツール呼び出し。フィールド：`getId()`, `getName()`, `getContent()`, `getIndex()`。また、JSONパース用に `getContentJson()` と `getContentJsonResult()` も提供されています。

    **終了マーカー（End marker）**：

    - `StreamFrame.End` — ストリーム終了マーカー。フィールド：`getFinishReason()`, `getMetaInfo()`。

プレーンテキストの抽出、フレームの `Message.Response` オブジェクトへの変換、および**分割されたツール呼び出しを安全に結合する**ためのヘルパーが提供されています。

## APIの概要

ストリーミングを使用すると、以下のことが可能になります：

- データが到着するたびに処理する（UIの応答性が向上します）
- 構造化された情報をオンザフライで解析する（Markdown/JSONなど）
- オブジェクトが完成した時点で出力する
- リアルタイムでツールを起動する
- モデルの推論にリアルタイムでアクセスする（サポートされているモデルの場合）

**フレーム**自体を操作することも、フレームから派生した**プレーンテキスト**を操作することもできます。

### デルタフレーム vs コンプリートフレーム

ストリーミングAPIでは、2種類のフレームを区別します：

- **デルタフレーム** (`DeltaFrame`) — チャンクとして到着する、インクリメンタル（逐次的）または部分的なコンテンツです。コンテンツがストリーミングされる際にリアルタイムで表示するのに適しています。例：`TextDelta`、`ReasoningDelta`、`ToolCallDelta`。

- **コンプリートフレーム** (`CompleteFrame`) — そのコンテンツタイプのすべてのデルタが受信された後に出力される完全なコンテンツです。最終的な処理や `Message.Response` オブジェクトへの変換に役立ちます。例：`TextComplete`、`ReasoningComplete`、`ToolCallComplete`。

通常、UIの更新にはデルタフレームを使用し、最終的な構造化データの抽出にはコンプリートフレームを使用します。

---
## 使い方

### フレームを直接操作する

これは最も一般的なアプローチであり、各フレームの種類に反応します。

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.dsl.builder.strategy
    import ai.koog.agents.core.dsl.builder.node
    import ai.koog.prompt.streaming.StreamFrame
    val strategy = strategy<String, String>("strategy_name") {
        val node by node<Unit, Unit> {
    -->
    <!--- SUFFIX
       }
    }
    -->
    ```kotlin
    llm.writeSession {
        appendPrompt { user("Tell me a joke, then call a tool with JSON args.") }
    
        val stream = requestLLMStreaming() // Flow<StreamFrame>
    
        stream.collect { frame ->
            when (frame) {
                is StreamFrame.TextDelta -> print(frame.text)
                is StreamFrame.ReasoningDelta -> print("[Reasoning] text=${frame.text} summary=${frame.summary}")
                is StreamFrame.ToolCallComplete -> {
                    println("
🔧 Tool call: ${frame.name} args=${frame.content}")
                    // オプションで遅延パースが可能：
                    // val json = frame.contentJson
                }
                is StreamFrame.End -> println("
[END] reason=${frame.finishReason}")
                else -> {} // 他のフレームタイプ（TextComplete, ToolCallDeltaなど）を処理
            }
        }
    }
    ```
    <!--- KNIT example-streaming-api-01.kt -->

=== "Java"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.entity.AIAgentNode;
    import ai.koog.prompt.streaming.StreamFrame;
    import java.util.concurrent.Flow;
    class exampleStreamingApiJava01 {
        public static void main(String[] args) {
            var node = AIAgentNode.builder("streamNode")
                .withInput(String.class)
                .withOutput(Void.class)
                .withAction((input, ctx) -> {
    -->
    <!--- SUFFIX
                return null;
            })
            .build();
        }
    }
    -->
    ```java
    ctx.getLlm().writeSession(session -> {
        session.appendPrompt(prompt -> {
            prompt.user("Tell me a joke, then call a tool with JSON args.");
            return null;
        });

        Flow.Publisher<StreamFrame> stream = session.requestLLMStreaming();

        stream.subscribe(new Flow.Subscriber<>() {
            @Override
            public void onSubscribe(Flow.Subscription subscription) {
                subscription.request(Long.MAX_VALUE);
            }

            @Override
            public void onNext(StreamFrame frame) {
                if (frame instanceof StreamFrame.TextDelta delta) {
                    System.out.print(delta.getText());
                } else if (frame instanceof StreamFrame.ReasoningDelta reasoning) {
                    System.out.print("[Reasoning] text=" + reasoning.getText()
                        + " summary=" + reasoning.getSummary());
                } else if (frame instanceof StreamFrame.ToolCallComplete toolCall) {
                    System.out.println("
Tool call: " + toolCall.getName()
                        + " args=" + toolCall.getContent());
                } else if (frame instanceof StreamFrame.End end) {
                    System.out.println("
[END] reason=" + end.getFinishReason());
                }
                // 他のフレームタイプ（TextComplete, ToolCallDeltaなど）を処理
            }

            @Override
            public void onError(Throwable throwable) {
                System.err.println("Stream error: " + throwable.getMessage());
            }

            @Override
            public void onComplete() {
            }
        });

        return null;
    });
    ```
    <!--- KNIT exampleStreamingApiJava01.java -->

生の文字列ストリームを直接操作して出力を解析することも可能であることに注意してください。
このアプローチにより、解析プロセスをより柔軟に制御できます。

以下は、出力構造のMarkdown定義を使用した生の文字列ストリームの例です：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.dsl.builder.strategy
    import ai.koog.agents.core.dsl.builder.node
    import ai.koog.prompt.structure.markdown.MarkdownStructureDefinition
    val strategy = strategy<String, String>("strategy_name") {
        val node by node<Unit, Unit> {
    -->
    <!--- SUFFIX
       }
    }
    -->
    ```kotlin
    fun markdownBookDefinition(): MarkdownStructureDefinition {
        return MarkdownStructureDefinition("name", schema = { /*...*/ })
    }

    val mdDefinition = markdownBookDefinition()

    llm.writeSession {
        val stream = requestLLMStreaming(mdDefinition)
        // 生の文字列チャンクに直接アクセスする
        stream.collect { chunk ->
            // テキストの各チャンクが到着するたびに処理する
            println("Received chunk: $chunk") // チャンクを結合したものは、mdDefinitionスキーマに従ったテキスト構造になります
        }
    }
    ```
    <!--- KNIT example-streaming-api-02.kt -->

=== "Java"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.entity.AIAgentNode;
    import ai.koog.prompt.streaming.StreamFrame;
    import ai.koog.prompt.structure.StructureDefinition;
    import java.util.concurrent.Flow;
    class exampleStreamingApiJava02 {
        static StructureDefinition markdownBookDefinition() { return null; }
        public static void main(String[] args) {
            var node = AIAgentNode.builder("streamNode")
                .withInput(String.class)
                .withOutput(Void.class)
                .withAction((input, ctx) -> {
    -->
    <!--- SUFFIX
                return null;
            })
            .build();
        }
    }
    -->
    ```java
    StructureDefinition mdDefinition = markdownBookDefinition();

    ctx.getLlm().writeSession(session -> {
        session.appendPrompt(prompt -> {
            prompt.user(input);
        });

        Flow.Publisher<StreamFrame> stream = session.requestLLMStreaming(mdDefinition);

        // 生のフレームに直接アクセスする
        stream.subscribe(new Flow.Subscriber<>() {
            @Override
            public void onSubscribe(Flow.Subscription subscription) {
                subscription.request(Long.MAX_VALUE);
            }

            @Override
            public void onNext(StreamFrame frame) {
                // 各フレームが到着するたびに処理する
                System.out.println("Received frame: " + frame);
            }

            @Override
            public void onError(Throwable throwable) {
                System.err.println("Stream error: " + throwable.getMessage());
            }

            @Override
            public void onComplete() {
            }
        });

        return null;
    });
    ```
    <!--- KNIT exampleStreamingApiJava02.java -->

### 推論フレームの操作

推論をサポートするモデル（Claude Sonnet 4.5やGPT-o1など）は、ストリーミング中に推論フレームを出力します。推論プロセスとその要約の両方にアクセスできます：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.dsl.builder.strategy
    import ai.koog.agents.core.dsl.builder.node
    import ai.koog.prompt.streaming.StreamFrame

    val strategy = strategy<String, String>("strategy_name") {
        val node by node<Unit, Unit> {
    -->
    <!--- SUFFIX
       }
    }
    -->
    ```kotlin
    llm.writeSession {
        appendPrompt { user("Solve this complex problem: ...") }

        val stream = requestLLMStreaming()
        val reasoningSteps = mutableListOf<String>()
        val summarySteps = mutableListOf<String>()

        stream.collect { frame ->
            when (frame) {
                is StreamFrame.ReasoningDelta -> {
                    frame.text?.let { 
                        reasoningSteps.add(it)
                        print(frame.text) // 到着した推論を表示
                    }
                    frame.summary?.let {
                        summarySteps.add(it)
                        print(frame.summary) // 到着した推論の要約を表示
                    }
                }
                is StreamFrame.ReasoningComplete -> {
                    // 完全な推論にアクセス
                    println("
Complete reasoning: ${frame.text.joinToString("")}")
                    println("Summary: ${frame.summary?.joinToString("") ?: "N/A"}")
                }
                is StreamFrame.TextDelta -> print(frame.text)
                is StreamFrame.End -> println("
[END]")
                else -> {}
            }
        }
    }
    ```
    <!--- KNIT example-streaming-api-reasoning-01.kt -->

=== "Java"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.entity.AIAgentNode;
    import ai.koog.prompt.streaming.StreamFrame;
    import java.util.ArrayList;
    import java.util.List;
    import java.util.concurrent.Flow;
    import java.util.stream.Collectors;
    class exampleStreamingApiReasoningJava01 {
        public static void main(String[] args) {
            var node = AIAgentNode.builder("reasoningNode")
                .withInput(String.class)
                .withOutput(Void.class)
                .withAction((input, ctx) -> {
    -->
    <!--- SUFFIX
                return null;
            })
            .build();
        }
    }
    -->
    ```java
    ctx.getLlm().writeSession(session -> {
        session.appendPrompt(prompt -> {
            prompt.user("Solve this complex problem: ...");
            return null;
        });

        Flow.Publisher<StreamFrame> stream = session.requestLLMStreaming();
        `List<String>` reasoningSteps = new ArrayList<>();
        `List<String>` summarySteps = new ArrayList<>();

        stream.subscribe(new Flow.Subscriber<StreamFrame>() {
            @Override
            public void onSubscribe(Flow.Subscription subscription) {
                subscription.request(Long.MAX_VALUE);
            }

            @Override
            public void onNext(StreamFrame frame) {
                if (frame instanceof StreamFrame.ReasoningDelta reasoning) {
                    if (reasoning.getText() != null) {
                        reasoningSteps.add(reasoning.getText());
                        System.out.print(reasoning.getText());
                    }
                    if (reasoning.getSummary() != null) {
                        summarySteps.add(reasoning.getSummary());
                        System.out.print(reasoning.getSummary());
                    }
                } else if (frame instanceof StreamFrame.ReasoningComplete complete) {
                    // 完全な推論にアクセス
                    System.out.println("
Complete reasoning: "
                        + String.join("", complete.getText()));
                    System.out.println("Summary: "
                        + (complete.getSummary() != null
                            ? String.join("", complete.getSummary()) : "N/A"));
                } else if (frame instanceof StreamFrame.TextDelta delta) {
                    System.out.print(delta.getText());
                } else if (frame instanceof StreamFrame.End) {
                    System.out.println("
[END]");
                }
            }

            @Override
            public void onError(Throwable throwable) { }

            @Override
            public void onComplete() { }
        });

        return null;
    });
    ```
    <!--- KNIT exampleStreamingApiReasoningJava01.java -->

### 生のテキストストリーム（派生）の操作

`Flow<String>` を期待する既存のストリーミングパーサーがある場合は、`filterTextOnly()` を介してテキストチャンクを派生させるか、`collectText()` でそれらを収集します。

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.dsl.builder.strategy
    import ai.koog.agents.core.dsl.builder.node
    import ai.koog.prompt.streaming.filterTextOnly
    import ai.koog.prompt.streaming.collectText
    val strategy = strategy<String, String>("strategy_name") {
        val node by node<Unit, Unit> {
    -->
    <!--- SUFFIX
       }
    }
    -->
    ```kotlin
    llm.writeSession {
        val frames = requestLLMStreaming()

        // テキストチャンクが来るたびにストリーム出力：
        frames.filterTextOnly().collect { chunk -> print(chunk) }

        // または、Endの後にすべてのテキストを1つのStringにまとめる：
        val fullText = frames.collectText()
        println("
---
$fullText")
    }
    ```
    <!--- KNIT example-streaming-api-03.kt -->

=== "Java"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.entity.AIAgentNode;
    import ai.koog.prompt.streaming.StreamFrame;
    import java.util.concurrent.Flow;
    class exampleStreamingApiJava03 {
        public static void main(String[] args) {
            var node = AIAgentNode.builder("streamNode")
                .withInput(String.class)
                .withOutput(Void.class)
                .withAction((input, ctx) -> {
    -->
    <!--- SUFFIX
                return null;
            })
            .build();
        }
    }
    -->
    ```java
    ctx.getLlm().writeSession(session -> {
        Flow.Publisher<StreamFrame> frames = session.requestLLMStreaming();

        // テキストチャンクが来るたびにストリーム出力（filterTextOnlyに相当）：
        StringBuilder fullText = new StringBuilder();
        frames.subscribe(new Flow.Subscriber<>() {
            @Override
            public void onSubscribe(Flow.Subscription subscription) {
                subscription.request(Long.MAX_VALUE);
            }

            @Override
            public void onNext(StreamFrame frame) {
                if (frame instanceof StreamFrame.TextDelta delta) {
                    System.out.print(delta.getText());
                    fullText.append(delta.getText());
                }
            }

            @Override
            public void onError(Throwable throwable) { }

            @Override
            public void onComplete() {
                // fullTextにすべてのテキストが含まれる（collectTextに相当）
                System.out.println("
---
" + fullText);
            }
        });

        return null;
    });
    ```
    <!--- KNIT exampleStreamingApiJava03.java -->

### イベントハンドラーでのストリームイベントのリスニング

[エージェントイベントハンドラー](features/agent-event-handlers.md)でストリームイベントをリスニングできます。

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.dsl.builder.strategy
    import ai.koog.agents.core.dsl.builder.node
    import ai.koog.agents.core.agent.GraphAIAgent
    import ai.koog.agents.features.eventHandler.feature.handleEvents
    import ai.koog.prompt.streaming.StreamFrame
    import ai.koog.prompt.structure.markdown.MarkdownStructureDefinition
    fun GraphAIAgent.FeatureContext.installStreamingApi() {
    -->
    <!--- SUFFIX
    }
    -->
    ```kotlin
    handleEvents {
        onToolCallStarting { context ->
            println("
🔧 Using ${context.toolName} with ${context.toolArgs}... ")
        }

        onLLMStreamingFrameReceived { context ->
            when (val frame = context.streamFrame) {
                is StreamFrame.TextDelta -> print(frame.text)
                is StreamFrame.ReasoningDelta -> print("[Reasoning] text=${frame.text} summary=${frame.summary}")
                else -> {} // 必要に応じて他のフレームタイプを処理
            }
        }

        onLLMStreamingFailed { context ->
            println("❌ Error: ${context.error}")
        }

        onLLMStreamingCompleted {
            println("🏁 Done")
        }
    }
    ```
    <!--- KNIT example-streaming-api-04.kt -->

=== "Java"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent;
    import ai.koog.agents.features.eventHandler.feature.EventHandler;
    import ai.koog.prompt.streaming.StreamFrame;
    import ai.koog.prompt.executor.model.PromptExecutor;
    import ai.koog.prompt.executor.ollama.client.OllamaModels;
    class exampleStreamingApiJava04 {
        public static void main(String[] args) {
            AIAgent.builder()
                .promptExecutor(PromptExecutor.builder().ollama().build())
                .llmModel(OllamaModels.Meta.LLAMA_3_2)
    -->
    <!--- SUFFIX
            .build();
        }
    }
    -->
    ```java
    .install(EventHandler.Feature, config -> {
        config.onToolCallStarting(ctx -> {
            System.out.println("
Using " + ctx.getToolName() + " with " + ctx.getToolArgs() + "... ");
        });

        config.onLLMStreamingFrameReceived(ctx -> {
            StreamFrame frame = ctx.getStreamFrame();
            if (frame instanceof StreamFrame.TextDelta delta) {
                System.out.print(delta.getText());
            } else if (frame instanceof StreamFrame.ReasoningDelta reasoning) {
                System.out.print("[Reasoning] text=" + reasoning.getText()
                    + " summary=" + reasoning.getSummary());
            }
        });

        config.onLLMStreamingFailed(ctx -> {
            System.out.println("Error: " + ctx.getError());
        });

        config.onLLMStreamingCompleted(ctx -> {
            System.out.println("Done");
        });
    })
    ```
    <!--- KNIT exampleStreamingApiJava04.java -->

### フレームから `Message.Response` への変換

収集されたフレームのリストを標準のメッセージオブジェクトに変換できます：

- `toAssistantMessageOrNull()` — テキストフレームから `Message.Assistant` を抽出します
- `toReasoningMessageOrNull()` — 推論フレームから `Message.Reasoning` を抽出します
- `toToolCallMessages()` — ツール呼び出しフレームから `Message.Tool.Call` を抽出します
- `toMessageResponses()` — すべてのコンプリートフレームを対応する `Message.Response` オブジェクトに変換します

## 例

### ストリーミング中の構造化データ（Markdownの例）

生の文字列ストリームを操作することも可能ですが、通常は[構造化データ](structured-output.md)を操作する方が便利です。

構造化データのアプローチには、以下の主要なコンポーネントが含まれます：

1. **MarkdownStructureDefinition**: Markdown形式の構造化データのスキーマと例を定義するためのクラス。
2. **markdownStreamingParser**: Markdownチャンクのストリームを処理してイベントを発生させるパーサーを作成するための関数。

以下のセクションでは、構造化データのストリーム処理に関連するステップバイステップの手順とコードサンプルを提供します。

#### 1. データ構造の定義

まず、構造化データを表すデータクラスを定義します：

=== "Kotlin"

    <!--- INCLUDE
    import kotlinx.serialization.Serializable
    -->
    ```kotlin
    @Serializable
    data class Book(
        val title: String,
        val author: String,
        val description: String
    )
    ```
    <!--- KNIT example-streaming-api-05.kt -->

=== "Java"

    <!--- INCLUDE
    class exampleStreamingApiJava05 {
        public static void main(String[] args) {
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```java
    // TODO Javaではまだサポートされていません
    ```
    <!--- KNIT exampleStreamingApiJava05.java -->

#### 2. Markdown構造の定義

`MarkdownStructureDefinition` クラスを使用して、Markdown内でデータがどのように構造化されるかを指定する定義を作成します：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.markdown.markdown
    import ai.koog.prompt.structure.markdown.MarkdownStructureDefinition
    -->
    ```kotlin
    fun markdownBookDefinition(): MarkdownStructureDefinition {
        return MarkdownStructureDefinition("bookList", schema = {
            markdown {
                header(1, "title")
                bulleted {
                    item("author")
                    item("description")
                }
            }
        }, examples = {
            markdown {
                header(1, "The Great Gatsby")
                bulleted {
                    item("F. Scott Fitzgerald")
                    item("A novel set in the Jazz Age that tells the story of Jay Gatsby's unrequited love for Daisy Buchanan.")
                }
            }
        })
    }
    ```
    <!--- KNIT example-streaming-api-06.kt -->

=== "Java"

    <!--- INCLUDE
    class exampleStreamingApiJava06 {
        public static void main(String[] args) {
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```java
    // TODO Javaではまだサポートされていません
    ```
    <!--- KNIT exampleStreamingApiJava06.java -->

#### 3. データ構造用のパーサーの作成

`markdownStreamingParser` は、さまざまなMarkdown要素に対していくつかのハンドラーを提供します：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.example.exampleStreamingApi05.Book
    import ai.koog.prompt.structure.markdown.markdownStreamingParser
    import kotlinx.coroutines.flow.Flow
    import kotlinx.coroutines.flow.flow
    fun parseMarkdownStreamToBooks(markdownStream: Flow<String>): Flow<Book> {
        return flow {
    -->
    <!--- SUFFIX
       }
    }
    -->
    ```kotlin
    markdownStreamingParser {
        // レベル1の見出しを処理（レベルの範囲は1から6）
        onHeader(1) { headerText -> }
        // 箇条書きを処理
        onBullet { bulletText -> }
        // コードブロックを処理
        onCodeBlock { codeBlockContent -> }
        // 正規表現パターンに一致する行を処理
        onLineMatching(Regex("pattern")) { line -> }
        // ストリームの終了を処理
        onFinishStream { remainingText -> }
    }
    ```
    <!--- KNIT example-streaming-api-07.kt -->

=== "Java"

    <!--- INCLUDE
    class exampleStreamingApiJava07 {
        public static void main(String[] args) {
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```java
    // TODO Javaではまだサポートされていません
    ```
    <!--- KNIT exampleStreamingApiJava07.java -->

定義されたハンドラーを使用して、`markdownStreamingParser` 関数でMarkdownストリームを解析し、データオブジェクトを出力する関数を実装できます。

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.example.exampleStreamingApi05.Book
    import ai.koog.prompt.structure.markdown.markdownStreamingParser
    import ai.koog.prompt.streaming.StreamFrame
    import ai.koog.prompt.streaming.filterTextOnly
    import kotlinx.coroutines.flow.Flow
    import kotlinx.coroutines.flow.flow
    -->
    ```kotlin
    fun parseMarkdownStreamToBooks(markdownStream: Flow<StreamFrame>): Flow<Book> {
       return flow {
          markdownStreamingParser {
             var currentBookTitle = ""
             val bulletPoints = mutableListOf<String>()

             // レスポンスストリーム内でMarkdownの見出しを受信したイベントを処理
             onHeader(1) { headerText ->
                // 前の書籍がある場合は、それを送信
                if (currentBookTitle.isNotEmpty() && bulletPoints.isNotEmpty()) {
                   val author = bulletPoints.getOrNull(0) ?: ""
                   val description = bulletPoints.getOrNull(1) ?: ""
                   emit(Book(currentBookTitle, author, description))
                }

                currentBookTitle = headerText
                bulletPoints.clear()
             }

             // レスポンスストリーム内でMarkdownの箇条書きリストを受信したイベントを処理
             onBullet { bulletText ->
                bulletPoints.add(bulletText)
             }

             // レスポンスストリームの終了を処理
             onFinishStream {
                // 最後の書籍があれば送信
                if (currentBookTitle.isNotEmpty() && bulletPoints.isNotEmpty()) {
                   val author = bulletPoints.getOrNull(0) ?: ""
                   val description = bulletPoints.getOrNull(1) ?: ""
                   emit(Book(currentBookTitle, author, description))
                }
             }
          }.parseStream(markdownStream.filterTextOnly())
       }
    }
    ```
    <!--- KNIT example-streaming-api-08.kt -->

=== "Java"

    <!--- INCLUDE
    class exampleStreamingApiJava08 {
        public static void main(String[] args) {
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```java
    // TODO Javaではまだサポートされていません
    ```
    <!--- KNIT exampleStreamingApiJava08.java -->

#### 4. エージェント戦略でパーサーを使用する

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.dsl.builder.forwardTo
    import ai.koog.agents.core.dsl.builder.strategy
    import ai.koog.agents.core.dsl.builder.node
    import ai.koog.agents.example.exampleStreamingApi05.Book
    import ai.koog.agents.example.exampleStreamingApi06.markdownBookDefinition
    import ai.koog.agents.example.exampleStreamingApi08.parseMarkdownStreamToBooks
    -->
    ```kotlin
    val agentStrategy = strategy<String, List<Book>>("library-assistant") {
       // 出力ストリームの解析を含むノードを記述
       val getMdOutput by node<String, List<Book>> { booksDescription ->
          val books = mutableListOf<Book>()
          val mdDefinition = markdownBookDefinition()

          llm.writeSession {
             appendPrompt { user(booksDescription) }
             // 定義 `mdDefinition` の形式でレスポンスストリームを開始
             val markdownStream = requestLLMStreaming(mdDefinition)
             // レスポンスストリームの結果を使用してパーサーを呼び出し、結果に対してアクションを実行
             parseMarkdownStreamToBooks(markdownStream).collect { book ->
                books.add(book)
                println("Parsed Book: ${book.title} by ${book.author}")
             }
          }

          books
       }
       // ノードにアクセス可能であることを確認しつつ、エージェントのグラフを記述
       edge(nodeStart forwardTo getMdOutput)
       edge(getMdOutput forwardTo nodeFinish)
    }
    ```
    <!--- KNIT example-streaming-api-09.kt -->

=== "Java"

    <!--- INCLUDE
    class exampleStreamingApiJava09 {
        public static void main(String[] args) {
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```java
    // TODO Javaではまだサポートされていません
    ```
    <!--- KNIT exampleStreamingApiJava09.java -->

### 高度な使用法：ツールを使用したストリーミング

ストリーミングAPIをツールと組み合わせて使用し、データが到着するたびに処理することもできます。
以下のセクションでは、ツールを定義し、それをストリーミングデータで使用する方法について、簡単なステップバイステップガイドを提供します。

### 1. データ構造用のツールを定義する

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.tools.SimpleTool
    import ai.koog.agents.core.tools.ToolDescriptor
    import ai.koog.agents.example.exampleStreamingApi05.Book
    import ai.koog.serialization.typeToken
    import kotlinx.serialization.Serializable
    -->
    ```kotlin
    @Serializable
    data class Book(
       val title: String,
       val author: String,
       val description: String
    )
    
    class BookTool(): SimpleTool<Book>(
        argsType = typeToken<Book>(),
        name = NAME,
        description = "A tool to parse book information from Markdown"
    ) {
    
        companion object { const val NAME = "book" }
    
        override suspend fun execute(args: Book): String {
            println("${args.title} by ${args.author}:
 ${args.description}")
            return "Done"
        }
    }
    ```
    <!--- KNIT example-streaming-api-10.kt -->

=== "Java"

    <!--- INCLUDE
    import ai.koog.agents.core.tools.reflect.ToolSet;
    import ai.koog.agents.core.tools.annotations.Tool;
    import ai.koog.agents.core.tools.annotations.LLMDescription;
    -->
    ```java
    class BookTool implements ToolSet {
        @Tool
        @LLMDescription("A tool to parse book information from Markdown")
        public String book(
            @LLMDescription("Title of the book") String title,
            @LLMDescription("Author of the book") String author,
            @LLMDescription("Description of the book") String description
        ) {
            System.out.println(title + " by " + author + ":
 " + description);
            return "Done";
        }
    }
    ```
    <!--- KNIT exampleStreamingApiJava10.java -->

### 2. ストリーミングデータでツールを使用する

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.dsl.builder.forwardTo
    import ai.koog.agents.core.dsl.builder.strategy
    import ai.koog.agents.core.dsl.builder.node
    import ai.koog.agents.example.exampleStreamingApi06.markdownBookDefinition
    import ai.koog.agents.example.exampleStreamingApi08.parseMarkdownStreamToBooks
    import ai.koog.agents.example.exampleStreamingApi10.BookTool
    import ai.koog.agents.core.agent.session.callToolRaw
    -->
    ```kotlin
    val agentStrategy = strategy<String, Unit>("library-assistant") {
       val getMdOutput by node<String, Unit> { input ->
          val mdDefinition = markdownBookDefinition()

          llm.writeSession {
             appendPrompt { user(input) }
             val markdownStream = requestLLMStreaming(mdDefinition)

             parseMarkdownStreamToBooks(markdownStream).collect { book ->
                callToolRaw(BookTool.NAME, book)
                /* その他の可能なオプション：
                    callTool(BookTool::class, book)
                    callTool<BookTool>(book)
                    findTool(BookTool::class).execute(book)
                */
             }

             // 並列ツール呼び出しも可能
             parseMarkdownStreamToBooks(markdownStream).toParallelToolCallsRaw(toolClass=BookTool::class).collect {
                println("Tool call result: $it")
             }
          }
       }

       edge(nodeStart forwardTo getMdOutput)
       edge(getMdOutput forwardTo nodeFinish)
     }
    ```
    <!--- KNIT example-streaming-api-11.kt -->

=== "Java"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.entity.AIAgentGraphStrategy;
    import ai.koog.agents.core.agent.entity.AIAgentNode;
    import ai.koog.prompt.streaming.StreamFrame;
    import ai.koog.prompt.structure.StructureDefinition;
    import java.util.concurrent.Flow;
    class exampleStreamingApiJava11 {
        static StructureDefinition markdownBookDefinition() { return null; }
        public static void main(String[] args) {
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```java
    var strategy = AIAgentGraphStrategy.builder("library-assistant")
        .withInput(String.class)
        .withOutput(Void.class);

    var getMdOutput = AIAgentNode.builder("getMdOutput")
        .withInput(String.class)
        .withOutput(Void.class)
        .withAction((input, ctx) -> {
            StructureDefinition mdDefinition = markdownBookDefinition();

            ctx.getLlm().writeSession(session -> {
                session.appendPrompt(prompt -> {
                    prompt.user(input);
                    return null;
                });

                Flow.Publisher<StreamFrame> markdownStream = session.requestLLMStreaming(mdDefinition);

                // ストリーミングされたフレームを処理し、ToolCallCompleteフレームでツールを起動する
                markdownStream.subscribe(new Flow.Subscriber<StreamFrame>() {
                    @Override
                    public void onSubscribe(Flow.Subscription subscription) {
                        subscription.request(Long.MAX_VALUE);
                    }

                    @Override
                    public void onNext(StreamFrame frame) {
                        if (frame instanceof StreamFrame.ToolCallComplete toolCall) {
                            System.out.println("Tool call: " + toolCall.getName()
                                + " args=" + toolCall.getContent());
                        }
                    }

                    @Override
                    public void onError(Throwable throwable) { }

                    @Override
                    public void onComplete() { }
                });

                return null;
            });

            return null;
        })
        .build();

    strategy.edge(strategy.nodeStart, getMdOutput);
    strategy.edge(getMdOutput, strategy.nodeFinish);
    ```
    <!--- KNIT exampleStreamingApiJava11.java -->

### 3. エージェント設定にツールを登録する

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent
    import ai.koog.agents.core.tools.ToolRegistry
    import ai.koog.agents.example.exampleStreamingApi10.BookTool
    import ai.koog.prompt.executor.clients.openai.OpenAIModels
    import ai.koog.prompt.executor.llms.all.simpleOpenAIExecutor

    -->
    ```kotlin
    val toolRegistry = ToolRegistry {
        tool(BookTool())
    }

    val runner = AIAgent(
        promptExecutor = simpleOpenAIExecutor("OPENAI_API_KEY"),
        llmModel = OpenAIModels.Chat.GPT4o,
        toolRegistry = toolRegistry
    )
    ```
    <!--- KNIT example-streaming-api-12.kt -->

=== "Java"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent;
    import ai.koog.agents.core.tools.ToolRegistry;
    import ai.koog.agents.core.tools.reflect.ToolSet;
    import ai.koog.agents.core.tools.annotations.Tool;
    import ai.koog.agents.core.tools.annotations.LLMDescription;
    import ai.koog.prompt.executor.clients.openai.OpenAIModels;
    import ai.koog.prompt.executor.model.PromptExecutor;
    class exampleStreamingApiJava12 {
        static class BookTool implements ToolSet {
            @Tool
            @LLMDescription("A tool to parse book information")
            public String book(String title, String author, String description) { return "Done"; }
        }
        public static void main(String[] args) {
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```java
    ToolRegistry toolRegistry = ToolRegistry.builder()
        .tools(new BookTool())
        .build();

    AIAgent<String, String> runner = AIAgent.<String, String>builder()
        .promptExecutor(PromptExecutor.builder().openAI("OPENAI_API_KEY").build())
        .llmModel(OpenAIModels.Chat.GPT4o)
        .toolRegistry(toolRegistry)
        .build();
    ```
    <!--- KNIT exampleStreamingApiJava12.java -->

## ベストプラクティス

1. **明確な構造を定義する**: データに対して、明確で曖昧さのないMarkdown構造を作成します。

2. **適切な例を提供する**: LLMをガイドするために、`MarkdownStructureDefinition` に包括的な例を含めます。

3. **不完全なデータを処理する**: ストリームからデータを解析する際は、常にnullや空の値をチェックしてください。

4. **リソースをクリーンアップする**: `onFinishStream` ハンドラーを使用して、リソースをクリーンアップし、残りのデータを処理します。

5. **エラーを処理する**: 不正な形式のMarkdownや予期しないデータに対して、適切なエラー処理を実装します。

6. **テスト**: 部分的なチャンクや不正な形式の入力を含む、さまざまな入力シナリオでパーサーをテストします。

7. **並列処理**: 独立したデータ項目の場合、パフォーマンスを向上させるために並列ツール呼び出しの使用を検討してください。