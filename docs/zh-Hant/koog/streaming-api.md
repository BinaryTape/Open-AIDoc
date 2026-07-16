# 串流 API (Streaming API)

Koog 的 **串流 API (Streaming API)** 讓您能在 Kotlin 中以 `Flow<StreamFrame>` 或在 Java 中以 `Flow.Publisher<StreamFrame>` 的形式 **增量地** 取用 **LLM 輸出**。
無須等待完整回應，您的程式碼可以：

- 在助手文字到達時立即渲染，
- 即時偵測 **工具呼叫 (tool call)** 並執行相應操作，
- 了解串流何時 **結束** 以及結束的原因。

該串流攜帶組織為兩個類別的 **具型別框架 (typed frame)**：

=== "Kotlin"

    **增量框架 (Delta frames)**（增量式／部分內容）：

    - `StreamFrame.TextDelta(text: String, index: Int?)` — 增量式的助手文字
    - `StreamFrame.ReasoningDelta(text: String?, summary: String?, index: Int?)` — 增量式的推理文字與摘要
    - `StreamFrame.ToolCallDelta(id: String?, name: String?, content: String?, index: Int?)` — 部分工具調用

    **完整框架 (Complete frames)**（完整內容）：

    - `StreamFrame.TextComplete(text: String, index: Int?)` — 完整的助手文字
    - `StreamFrame.ReasoningComplete(text: List<String>, summary: List<String>?, encrypted: String?, index: Int?)` — 包含選用摘要與加密內容的完整推理
    - `StreamFrame.ToolCallComplete(id: String?, name: String, content: String, index: Int?)` — 完整的工具調用

    **結束標記 (End marker)**：

    - `StreamFrame.End(finishReason: String?, metaInfo: ResponseMetaInfo)` — 包含回應元資料的串流結束標記

=== "Java"

    **增量框架 (Delta frames)**（增量式／部分內容）：

    - `StreamFrame.TextDelta` — 增量式的助手文字。欄位：`getText()`、`getIndex()`。
    - `StreamFrame.ReasoningDelta` — 增量式的推理文字與摘要。欄位：`getText()`、`getSummary()`、`getIndex()`。
    - `StreamFrame.ToolCallDelta` — 部分工具調用。欄位：`getId()`、`getName()`、`getContent()`、`getIndex()`。

    **完整框架 (Complete frames)**（完整內容）：

    - `StreamFrame.TextComplete` — 完整的助手文字。欄位：`getText()`、`getIndex()`。
    - `StreamFrame.ReasoningComplete` — 包含選用摘要與加密內容的完整推理。欄位：`getText()`（回傳 `List<String>`）、`getSummary()`（回傳 `List<String>`）、`getEncrypted()`、`getIndex()`。
    - `StreamFrame.ToolCallComplete` — 完整的工具調用。欄位：`getId()`、`getName()`、`getContent()`、`getIndex()`。此外也提供用於 JSON 剖析的 `getContentJson()` 和 `getContentJsonResult()`。

    **結束標記 (End marker)**：

    - `StreamFrame.End` — 串流結束標記。欄位：`getFinishReason()`、`getMetaInfo()`。

系統提供了幫助程式 (helper) 來提取純文字、將框架轉換為 `Message.Response` 物件，以及安全地 **合併區塊化的工具呼叫**。

## API 概覽

透過串流，您可以：

- 在資料到達時立即處理（提高 UI 回應性）
- 即時剖析結構化資訊（Markdown / JSON 等）
- 在物件完成時立即發送
- 即時觸發工具
- 即時存取模型推理過程（適用於受支援的模型）

您可以直接對 **框架 (frame)** 進行操作，也可以處理從框架衍生的 **純文字**。

### 增量框架 vs 完整框架 (Delta vs Complete Frames)

串流 API 區分了兩種框架類型：

- **增量框架 (Delta frames)** (`DeltaFrame`) — 以區塊形式到達的增量／部分內容。這些非常適合在內容串流進入時進行即時顯示。例如：`TextDelta`、`ReasoningDelta`、`ToolCallDelta`。

- **完整框架 (Complete frames)** (`CompleteFrame`) — 在該內容類型的所有增量框架接收完畢後發送的完整內容。這些對於最終處理以及轉換為 `Message.Response` 物件非常有用。例如：`TextComplete`、`ReasoningComplete`、`ToolCallComplete`。

通常，您會使用增量框架來更新 UI，並使用完整框架來提取最終的結構化資料。

---
## 用法

### 直接處理框架

這是最通用的方法：針對每種框架類型做出反應。

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
                    // 選用：延遲剖析：
                    // val json = frame.contentJson
                }
                is StreamFrame.End -> println("
[END] reason=${frame.finishReason}")
                else -> {} // 處理其他框架類型 (TextComplete, ToolCallDelta 等)
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
                // 處理其他框架類型 (TextComplete, ToolCallDelta 等)
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

值得注意的是，您可以透過直接處理原始字串串流來剖析輸出。
這種方法在剖析過程中提供了更多的靈活性和控制權。

以下是帶有輸出結構之 Markdown 定義的原始字串串流：

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
        // 直接存取原始字串區塊
        stream.collect { chunk ->
            // 在每個文字區塊到達時進行處理
            println("Received chunk: $chunk") // 這些區塊組合後將成為符合 mdDefinition 架構的結構化文字
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

        // 直接存取原始框架
        stream.subscribe(new Flow.Subscriber<>() {
            @Override
            public void onSubscribe(Flow.Subscription subscription) {
                subscription.request(Long.MAX_VALUE);
            }

            @Override
            public void onNext(StreamFrame frame) {
                // 在每個框架到達時進行處理
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

### 處理推理框架

支援推理 (reasoning) 的模型（例如 Claude Sonnet 4.5 或 GPT-o1）會在串流過程中發送推理框架。您可以同時存取推理過程及其摘要：

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
                        print(frame.text) // 在推理內容到達時立即顯示
                    }
                    frame.summary?.let {
                        summarySteps.add(it)
                        print(frame.summary) // 在推理摘要到達時立即顯示
                    }
                }
                is StreamFrame.ReasoningComplete -> {
                    // 存取完整推理內容
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
                    // 存取完整推理內容
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

### 處理原始文字串流（衍生）

如果您現有的串流剖析器預期接收 `Flow<String>`，
請透過 `filterTextOnly()` 衍生文字區塊，或使用 `collectText()` 進行收集。

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

        // 在文字區塊進入時進行串流：
        frames.filterTextOnly().collect { chunk -> print(chunk) }

        // 或者，在結束後將所有文字收集到一個字串中：
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

        // 在文字區塊進入時進行串流（相當於 filterTextOnly）：
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
                // fullText 現在包含所有文字（相當於 collectText）
                System.out.println("
---
" + fullText);
            }
        });

        return null;
    });
    ```
    <!--- KNIT exampleStreamingApiJava03.java -->

### 在事件處理常式中監聽串流事件

您可以在 [代理事件處理常式 (agent event handlers)](features/agent-event-handlers.md) 中監聽串流事件。

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
                else -> {} // 視需要處理其他框架類型
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

### 將框架轉換為 `Message.Response`

您可以將收集到的框架列表轉換為標準訊息物件：

- `toAssistantMessageOrNull()` — 從文字框架提取 `Message.Assistant`
- `toReasoningMessageOrNull()` — 從推理框架提取 `Message.Reasoning`
- `toToolCallMessages()` — 從工具呼叫框架提取 `Message.Tool.Call`
- `toMessageResponses()` — 將所有完整框架轉換為其對應的 `Message.Response` 物件

## 範例

### 串流時的結構化資料（Markdown 範例）

雖然可以直接處理原始字串串流，
但處理 [結構化資料 (structured data)](structured-output.md) 通常更為方便。

結構化資料方法包含以下關鍵組件：

1. **MarkdownStructureDefinition**：一個幫助您以 Markdown 格式定義結構化資料的架構與範例的類別。
2. **markdownStreamingParser**：一個用於建立剖析器的函式，該剖析器處理 Markdown 區塊串流並發送事件。

以下章節提供了處理結構化資料串流的逐步說明與程式碼範例。

#### 1. 定義您的資料結構

首先，定義一個資料類別來代表您的結構化資料：

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
    // TODO Java 尚不支援
    ```
    <!--- KNIT exampleStreamingApiJava05.java -->

#### 2. 定義 Markdown 結構

使用 `MarkdownStructureDefinition` 類別建立定義，指定您的資料應如何在 Markdown 中結構化：

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
    // TODO Java 尚不支援
    ```
    <!--- KNIT exampleStreamingApiJava06.java -->

#### 3. 為您的資料結構建立剖析器

`markdownStreamingParser` 為不同的 Markdown 元素提供了多個處理常式：

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
        // 處理第 1 級標題 (級別範圍從 1 到 6)
        onHeader(1) { headerText -> }
        // 處理項目符號
        onBullet { bulletText -> }
        // 處理程式碼區塊
        onCodeBlock { codeBlockContent -> }
        // 處理符合正規表示式模式的行
        onLineMatching(Regex("pattern")) { line -> }
        // 處理串流結束
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
    // TODO Java 尚不支援
    ```
    <!--- KNIT exampleStreamingApiJava07.java -->

使用定義好的處理常式，您可以實作一個函式，透過 `markdownStreamingParser` 函式剖析 Markdown 串流並發送您的資料物件。

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

             // 處理在回應串流中接收到 Markdown 標題的事件
             onHeader(1) { headerText ->
                // 如果存在前一本書，則發送它
                if (currentBookTitle.isNotEmpty() && bulletPoints.isNotEmpty()) {
                   val author = bulletPoints.getOrNull(0) ?: ""
                   val description = bulletPoints.getOrNull(1) ?: ""
                   emit(Book(currentBookTitle, author, description))
                }

                currentBookTitle = headerText
                bulletPoints.clear()
             }

             // 處理在回應串流中接收到 Markdown 項目符號清單的事件
             onBullet { bulletText ->
                bulletPoints.add(bulletText)
             }

             // 處理回應串流的結束
             onFinishStream {
                // 發送最後一本書（如果存在）
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
    // TODO Java 尚不支援
    ```
    <!--- KNIT exampleStreamingApiJava08.java -->

#### 4. 在您的代理策略中使用剖析器

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
       // 描述包含輸出串流剖析的節點
       val getMdOutput by node<String, List<Book>> { booksDescription ->
          val books = mutableListOf<Book>()
          val mdDefinition = markdownBookDefinition()

          llm.writeSession {
             appendPrompt { user(booksDescription) }
             // 以 `mdDefinition` 定義的形式啟動回應串流
             val markdownStream = requestLLMStreaming(mdDefinition)
             // 使用回應串流的結果呼叫剖析器，並對結果執行操作
             parseMarkdownStreamToBooks(markdownStream).collect { book ->
                books.add(book)
                println("Parsed Book: ${book.title} by ${book.author}")
             }
          }

          books
       }
       // 描述代理的圖形，確保節點可存取
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
    // TODO Java 尚不支援
    ```
    <!--- KNIT exampleStreamingApiJava09.java -->

### 進階用法：搭配工具進行串流

您也可以將串流 API 與工具結合使用，以便在資料到達時立即處理。
以下章節提供了關於如何定義工具並將其用於串流資料的簡要逐步指南。

### 1. 為您的資料結構定義工具

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

### 2. 在串流資料中使用工具

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
                /* 其他可能的選項：
                    callTool(BookTool::class, book)
                    callTool<BookTool>(book)
                    findTool(BookTool::class).execute(book)
                */
             }

             // 我們可以進行並行工具呼叫
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

                // 處理串流框架，並在 ToolCallComplete 框架上呼叫工具
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

### 3. 在代理配置中註冊工具

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

## 最佳實務

1. **定義清晰的結構**：為您的資料建立清晰且無歧義的 Markdown 結構。

2. **提供優質範例**：在 `MarkdownStructureDefinition` 中包含詳盡的範例，以引導 LLM。

3. **處理不完整的資料**：從串流剖析資料時，務必檢查是否存在 null 或空值。

4. **清理資源**：使用 `onFinishStream` 處理常式來清理資源並處理任何剩餘的資料。

5. **處理錯誤**：針對格式錯誤的 Markdown 或非預期的資料實作適當的錯誤處理。

6. **測試**：使用各種輸入情境測試您的剖析器，包括部分區塊和格式錯誤的輸入。

7. **並行處理**：對於獨立的資料項目，請考慮使用並行工具呼叫以獲得更好的效能。