# 流式传输 API

Koog 的**流式传输 API** 允许您以 Kotlin 中的 `Flow<StreamFrame>` 或 Java 中的 `Flow.Publisher<StreamFrame>` 形式**增量地消耗 LLM 输出**。
您的代码无需等待完整响应，而是可以：

- 在助手文本到达时立即进行渲染，
- 实时检测**工具调用**并对其采取操作，
- 了解流何时**结束**以及结束原因。

该流携带组织为两类的**类型化帧**：

=== "Kotlin"

    **增量帧 (Delta frames)**（增量/部分内容）：

    - `StreamFrame.TextDelta(text: String, index: Int?)` — 增量助手文本
    - `StreamFrame.ReasoningDelta(text: String?, summary: String?, index: Int?)` — 增量推理文本与摘要
    - `StreamFrame.ToolCallDelta(id: String?, name: String?, content: String?, index: Int?)` — 部分工具调用

    **完整帧 (Complete frames)**（完整内容）：

    - `StreamFrame.TextComplete(text: String, index: Int?)` — 完整助手文本
    - `StreamFrame.ReasoningComplete(text: List<String>, summary: List<String>?, encrypted: String?, index: Int?)` — 带有可选摘要和加密内容的完整推理内容
    - `StreamFrame.ToolCallComplete(id: String?, name: String, content: String, index: Int?)` — 完整工具调用

    **结束标记**：

    - `StreamFrame.End(finishReason: String?, metaInfo: ResponseMetaInfo)` — 带有响应元数据的流结束标记

=== "Java"

    **增量帧 (Delta frames)**（增量/部分内容）：

    - `StreamFrame.TextDelta` — 增量助手文本。字段：`getText()`、`getIndex()`。
    - `StreamFrame.ReasoningDelta` — 增量推理文本与摘要。字段：`getText()`、`getSummary()`、`getIndex()`。
    - `StreamFrame.ToolCallDelta` — 部分工具调用。字段：`getId()`、`getName()`、`getContent()`、`getIndex()`。

    **完整帧 (Complete frames)**（完整内容）：

    - `StreamFrame.TextComplete` — 完整助手文本。字段：`getText()`、`getIndex()`。
    - `StreamFrame.ReasoningComplete` — 带有可选摘要和加密内容的完整推理内容。字段：`getText()`（返回 `List<String>`）、`getSummary()`（返回 `List<String>`）、`getEncrypted()`、`getIndex()`。
    - `StreamFrame.ToolCallComplete` — 完整工具调用。字段：`getId()`、`getName()`、`getContent()`、`getIndex()`。还提供用于 JSON 解析的 `getContentJson()` 和 `getContentJsonResult()`。

    **结束标记**：

    - `StreamFrame.End` — 流结束标记。字段：`getFinishReason()`、`getMetaInfo()`。

本库还提供了辅助程序来提取纯文本、将帧转换为 `Message.Response` 对象，以及安全地**合并分块的工具调用**。

## API 概览

通过流式传输，您可以：

- 在数据到达时立即处理（提高 UI 响应性）
- 实时解析结构化信息（Markdown/JSON 等）
- 在对象完成时立即发送
- 实时触发工具
- 实时访问模型推理过程（适用于支持的模型）

您可以直接操作**帧**，也可以操作从帧派生的**纯文本**。

### 增量帧 vs 完整帧

流式传输 API 区分两种类型的帧：

- **增量帧** (`DeltaFrame`) — 以分块形式到达的增量/部分内容。这些帧非常适合在内容流式传输时进行实时显示。例如：`TextDelta`、`ReasoningDelta`、`ToolCallDelta`。

- **完整帧** (`CompleteFrame`) — 在该内容类型的所有增量内容接收完毕后发送的完整内容。这些帧适用于最终处理以及转换为 `Message.Response` 对象。例如：`TextComplete`、`ReasoningComplete`、`ToolCallComplete`。

通常，您会使用增量帧进行 UI 更新，使用完整帧来提取最终的结构化数据。

---
## 用法

### 直接操作帧

这是最通用的方法：针对每种帧类型做出反应。

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
        appendPrompt { user("给我讲个笑话，然后调用一个带有 JSON 参数的工具。") }
    
        val stream = requestLLMStreaming() // Flow<StreamFrame>
    
        stream.collect { frame ->
            when (frame) {
                is StreamFrame.TextDelta -> print(frame.text)
                is StreamFrame.ReasoningDelta -> print("[Reasoning] text=${frame.text} summary=${frame.summary}")
                is StreamFrame.ToolCallComplete -> {
                    println("
🔧 工具调用: ${frame.name} 参数=${frame.content}")
                    // 可选：进行延迟解析：
                    // val json = frame.contentJson
                }
                is StreamFrame.End -> println("
[END] 原因=${frame.finishReason}")
                else -> {} // 处理其他类型的帧（TextComplete、ToolCallDelta 等）
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
            prompt.user("给我讲个笑话，然后调用一个带有 JSON 参数的工具。");
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
工具调用: " + toolCall.getName()
                        + " 参数=" + toolCall.getContent());
                } else if (frame instanceof StreamFrame.End end) {
                    System.out.println("
[END] 原因=" + end.getFinishReason());
                }
                // 处理其他类型的帧（TextComplete、ToolCallDelta 等）
            }

            @Override
            public void onError(Throwable throwable) {
                System.err.println("流错误: " + throwable.getMessage());
            }

            @Override
            public void onComplete() {
            }
        });

        return null;
    });
    ```
    <!--- KNIT exampleStreamingApiJava01.java -->

值得注意的是，您也可以通过直接操作原始字符串流来解析输出。
这种方法在解析过程中为您提供了更大的灵活性和控制力。

以下是带有输出结构 Markdown 定义的原始字符串流：

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
        // 直接访问原始字符串块
        stream.collect { chunk ->
            // 在每个文本块到达时进行处理
            println("收到块: $chunk") // 这些块组合在一起将成为符合 mdDefinition 架构的结构化文本
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

        // 直接访问原始帧
        stream.subscribe(new Flow.Subscriber<>() {
            @Override
            public void onSubscribe(Flow.Subscription subscription) {
                subscription.request(Long.MAX_VALUE);
            }

            @Override
            public void onNext(StreamFrame frame) {
                // 在每一帧到达时进行处理
                System.out.println("收到帧: " + frame);
            }

            @Override
            public void onError(Throwable throwable) {
                System.err.println("流错误: " + throwable.getMessage());
            }

            @Override
            public void onComplete() {
            }
        });

        return null;
    });
    ```
    <!--- KNIT exampleStreamingApiJava02.java -->

### 操作推理帧

支持推理的模型（如 Claude Sonnet 4.5 或 GPT-o1）在流式传输期间会发送推理帧。您可以访问推理过程及其摘要：

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
        appendPrompt { user("解决这个复杂的问题：...") }

        val stream = requestLLMStreaming()
        val reasoningSteps = mutableListOf<String>()
        val summarySteps = mutableListOf<String>()

        stream.collect { frame ->
            when (frame) {
                is StreamFrame.ReasoningDelta -> {
                    frame.text?.let { 
                        reasoningSteps.add(it)
                        print(frame.text) // 在推理内容到达时显示
                    }
                    frame.summary?.let {
                        summarySteps.add(it)
                        print(frame.summary) // 在推理摘要到达时显示
                    }
                }
                is StreamFrame.ReasoningComplete -> {
                    // 访问完整的推理内容
                    println("
完整推理过程: ${frame.text.joinToString("")}")
                    println("摘要: ${frame.summary?.joinToString("") ?: "无"}")
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
            prompt.user("解决这个复杂的问题：...");
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
                    // 访问完整的推理内容
                    System.out.println("
完整推理过程: "
                        + String.join("", complete.getText()));
                    System.out.println("摘要: "
                        + (complete.getSummary() != null
                            ? String.join("", complete.getSummary()) : "无"));
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

### 操作原始文本流（派生）

如果您已有期望 `Flow<String>` 的流式解析器，
可以通过 `filterTextOnly()` 派生文本块，或使用 `collectText()` 收集它们。

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

        // 在文本块到来时进行流式传输：
        frames.filterTextOnly().collect { chunk -> print(chunk) }

        // 或者在结束后将所有文本收集到一个字符串中：
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

        // 在文本块到来时进行流式传输（等效于 filterTextOnly）：
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
                // fullText 现在包含所有文本（等效于 collectText）
                System.out.println("
---
" + fullText);
            }
        });

        return null;
    });
    ```
    <!--- KNIT exampleStreamingApiJava03.java -->

### 在事件处理程序中侦听流事件

您可以在[智能体事件处理程序](features/agent-event-handlers.md)中侦听流事件。

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
🔧 正在使用 ${context.toolName}，参数为 ${context.toolArgs}... ")
        }

        onLLMStreamingFrameReceived { context ->
            when (val frame = context.streamFrame) {
                is StreamFrame.TextDelta -> print(frame.text)
                is StreamFrame.ReasoningDelta -> print("[Reasoning] text=${frame.text} summary=${frame.summary}")
                else -> {} // 根据需要处理其他类型的帧
            }
        }

        onLLMStreamingFailed { context ->
            println("❌ 错误: ${context.error}")
        }

        onLLMStreamingCompleted {
            println("🏁 完成")
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
正在使用 " + ctx.getToolName() + "，参数为 " + ctx.getToolArgs() + "... ");
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
            System.out.println("错误: " + ctx.getError());
        });

        config.onLLMStreamingCompleted(ctx -> {
            System.out.println("完成");
        });
    })
    ```
    <!--- KNIT exampleStreamingApiJava04.java -->

### 将帧转换为 `Message.Response`

您可以将收集到的帧列表转换为标准消息对象：

- `toAssistantMessageOrNull()` — 从文本帧中提取 `Message.Assistant`
- `toReasoningMessageOrNull()` — 从推理帧中提取 `Message.Reasoning`
- `toToolCallMessages()` — 从工具调用帧中提取 `Message.Tool.Call`
- `toMessageResponses()` — 将所有完整帧转换为其对应的 `Message.Response` 对象

## 示例

### 流式传输时的结构化数据（Markdown 示例）

虽然可以操作原始字符串流，但通常操作[结构化数据](structured-output.md)会更方便。

结构化数据方法包含以下核心组件：

1. **MarkdownStructureDefinition**：一个辅助类，用于定义 Markdown 格式结构化数据的架构和示例。
2. **markdownStreamingParser**：一个用于创建解析器的函数，该解析器处理 Markdown 块流并发送事件。

以下各节提供了与处理结构化数据流相关的分步说明和代码示例。

#### 1. 定义数据结构

首先，定义一个数据类来表示您的结构化数据：

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
    // TODO Java 尚不支持
    ```
    <!--- KNIT exampleStreamingApiJava05.java -->

#### 2. 定义 Markdown 结构

使用 `MarkdownStructureDefinition` 类创建一个定义，指定数据在 Markdown 中的结构：

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
                header(1, "了不起的盖茨比")
                bulleted {
                    item("F. Scott Fitzgerald")
                    item("一部背景设定在爵士时代的小说，讲述了杰伊·盖茨比对黛西·布坎南无私爱情的故事。")
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
    // TODO Java 尚不支持
    ```
    <!--- KNIT exampleStreamingApiJava06.java -->

#### 3. 为数据结构创建解析器

`markdownStreamingParser` 为不同的 Markdown 元素提供了多个处理程序：

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
        // 处理 1 级标题（级别范围从 1 到 6）
        onHeader(1) { headerText -> }
        // 处理项目符号
        onBullet { bulletText -> }
        // 处理代码块
        onCodeBlock { codeBlockContent -> }
        // 处理匹配正则表达式模式的行
        onLineMatching(Regex("pattern")) { line -> }
        // 处理流结束
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
    // TODO Java 尚不支持
    ```
    <!--- KNIT exampleStreamingApiJava07.java -->

使用定义好的处理程序，您可以实现一个函数，该函数使用 `markdownStreamingParser` 函数解析 Markdown 流并发送您的数据对象。

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

             // 处理在响应流中接收到 Markdown 标题的事件
             onHeader(1) { headerText ->
                // 如果之前有书籍，则将其发送
                if (currentBookTitle.isNotEmpty() && bulletPoints.isNotEmpty()) {
                   val author = bulletPoints.getOrNull(0) ?: ""
                   val description = bulletPoints.getOrNull(1) ?: ""
                   emit(Book(currentBookTitle, author, description))
                }

                currentBookTitle = headerText
                bulletPoints.clear()
             }

             // 处理在响应流中接收到 Markdown 项目列表的事件
             onBullet { bulletText ->
                bulletPoints.add(bulletText)
             }

             // 处理响应流结束
             onFinishStream {
                // 如果存在最后一本书，则将其发送
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
    // TODO Java 尚不支持
    ```
    <!--- KNIT exampleStreamingApiJava08.java -->

#### 4. 在智能体策略中使用解析器

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
       // 描述包含输出流解析的节点
       val getMdOutput by node<String, List<Book>> { booksDescription ->
          val books = mutableListOf<Book>()
          val mdDefinition = markdownBookDefinition()

          llm.writeSession {
             appendPrompt { user(booksDescription) }
             // 以 'mdDefinition' 定义的形式启动响应流
             val markdownStream = requestLLMStreaming(mdDefinition)
             // 使用响应流的结果调用解析器并对结果执行操作
             parseMarkdownStreamToBooks(markdownStream).collect { book ->
                books.add(book)
                println("已解析的书籍: ${book.title} 作者 ${book.author}")
             }
          }

          books
       }
       // 描述智能体的图，确保节点可访问
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
    // TODO Java 尚不支持
    ```
    <!--- KNIT exampleStreamingApiJava09.java -->

### 高级用法：配合工具进行流式传输

您还可以将流式传输 API 与工具结合使用，在数据到达时对其进行处理。
以下各节提供了有关如何定义工具并在流式传输数据中使用它的简要分步指南。

### 1. 为您的数据结构定义工具

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
        description = "一个用于从 Markdown 中解析书籍信息的工具"
    ) {
    
        companion object { const val NAME = "book" }
    
        override suspend fun execute(args: Book): String {
            println("${args.title} 作者 ${args.author}:
 ${args.description}")
            return "完成"
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
        @LLMDescription("一个用于从 Markdown 中解析书籍信息的工具")
        public String book(
            @LLMDescription("书名") String title,
            @LLMDescription("作者") String author,
            @LLMDescription("描述") String description
        ) {
            System.out.println(title + " 作者 " + author + ":
 " + description);
            return "完成";
        }
    }
    ```
    <!--- KNIT exampleStreamingApiJava10.java -->

### 2. 在流式传输数据中使用该工具

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
                /* 其他可能的选项:
                    callTool(BookTool::class, book)
                    callTool<BookTool>(book)
                    findTool(BookTool::class).execute(book)
                */
             }

             // 我们可以发起并行工具调用
             parseMarkdownStreamToBooks(markdownStream).toParallelToolCallsRaw(toolClass=BookTool::class).collect {
                println("工具调用结果: $it")
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

                // 处理流式帧，并在 ToolCallComplete 帧上触发工具
                markdownStream.subscribe(new Flow.Subscriber<StreamFrame>() {
                    @Override
                    public void onSubscribe(Flow.Subscription subscription) {
                        subscription.request(Long.MAX_VALUE);
                    }

                    @Override
                    public void onNext(StreamFrame frame) {
                        if (frame instanceof StreamFrame.ToolCallComplete toolCall) {
                            System.out.println("工具调用: " + toolCall.getName()
                                + " 参数=" + toolCall.getContent());
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

### 3. 在智能体配置中注册工具

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
            @LLMDescription("一个用于解析书籍信息的工具")
            public String book(String title, String author, String description) { return "完成"; }
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

## 最佳做法

1. **定义清晰的结构**：为您的数据创建清晰且无歧义的 Markdown 结构。

2. **提供良好的示例**：在 `MarkdownStructureDefinition` 中包含详尽的示例以引导 LLM。

3. **处理不完整数据**：在解析来自流的数据时，务必检查 null 或空值。

4. **清理资源**：使用 `onFinishStream` 处理程序来清理资源并处理任何剩余数据。

5. **处理错误**：针对格式错误的 Markdown 或非预期数据实现适当的错误处理。

6. **测试**：在各种输入场景下测试您的解析器，包括部分块和格式错误的输入。

7. **并行处理**：对于独立的数据项，考虑使用并行工具调用以获得更好的性能。