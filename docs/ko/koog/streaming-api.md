# 스트리밍 API (Streaming API)

Koog의 **스트리밍 API(Streaming API)**를 사용하면 Kotlin에서는 `Flow<StreamFrame>`, Java에서는 `Flow.Publisher<StreamFrame>` 형태로 **LLM 출력을 증분식으로(incrementally) 소비**할 수 있습니다.
전체 응답이 올 때까지 기다리는 대신, 코드를 통해 다음과 같은 작업을 수행할 수 있습니다:

- 어시스턴트 텍스트가 도착하는 즉시 렌더링
- **도구 호출(tool calls)**을 실시간으로 감지하고 실행
- 스트림이 **종료**되는 시점과 이유 확인

스트림은 두 가지 카테고리로 분류되는 **타입이 지정된 프레임(typed frames)**을 전달합니다.

=== "Kotlin"

    **델타 프레임 (Delta frames)** (증분/부분 콘텐츠):

    - `StreamFrame.TextDelta(text: String, index: Int?)` — 증분형 어시스턴트 텍스트
    - `StreamFrame.ReasoningDelta(text: String?, summary: String?, index: Int?)` — 증분형 추론 텍스트 및 요약
    - `StreamFrame.ToolCallDelta(id: String?, name: String?, content: String?, index: Int?)` — 부분적 도구 호출

    **컴플리트 프레임 (Complete frames)** (전체 콘텐츠):

    - `StreamFrame.TextComplete(text: String, index: Int?)` — 전체 어시스턴트 텍스트
    - `StreamFrame.ReasoningComplete(text: List<String>, summary: List<String>?, encrypted: String?, index: Int?)` — 선택적 요약 및 암호화된 콘텐츠를 포함한 전체 추론
    - `StreamFrame.ToolCallComplete(id: String?, name: String, content: String, index: Int?)` — 전체 도구 호출

    **종료 마커 (End marker)**:

    - `StreamFrame.End(finishReason: String?, metaInfo: ResponseMetaInfo)` — 응답 메타데이터를 포함한 스트림 종료 마커

=== "Java"

    **델타 프레임 (Delta frames)** (증분/부분 콘텐츠):

    - `StreamFrame.TextDelta` — 증분형 어시스턴트 텍스트. 필드: `getText()`, `getIndex()`.
    - `StreamFrame.ReasoningDelta` — 증분형 추론 텍스트 및 요약. 필드: `getText()`, `getSummary()`, `getIndex()`.
    - `StreamFrame.ToolCallDelta` — 부분적 도구 호출. 필드: `getId()`, `getName()`, `getContent()`, `getIndex()`.

    **컴플리트 프레임 (Complete frames)** (전체 콘텐츠):

    - `StreamFrame.TextComplete` — 전체 어시스턴트 텍스트. 필드: `getText()`, `getIndex()`.
    - `StreamFrame.ReasoningComplete` — 선택적 요약 및 암호화된 콘텐츠를 포함한 전체 추론. 필드: `getText()` (`List<String>` 반환), `getSummary()` (`List<String>` 반환), `getEncrypted()`, `getIndex()`.
    - `StreamFrame.ToolCallComplete` — 전체 도구 호출. 필드: `getId()`, `getName()`, `getContent()`, `getIndex()`. JSON 파싱을 위한 `getContentJson()` 및 `getContentJsonResult()`도 제공합니다.

    **종료 마커 (End marker)**:

    - `StreamFrame.End` — 스트림 종료 마커. 필드: `getFinishReason()`, `getMetaInfo()`.

일반 텍스트를 추출하거나, 프레임을 `Message.Response` 객체로 변환하고, **청크된(chunked) 도구 호출을 안전하게 결합**할 수 있는 헬퍼 함수들이 제공됩니다.

## API 개요 (API overview)

스트리밍을 통해 다음을 수행할 수 있습니다:

- 데이터가 도착하는 대로 처리 (UI 응답성 향상)
- 구조화된 정보를 즉석에서 파싱 (마크다운/JSON 등)
- 객체가 완성되는 대로 내보내기 (emit)
- 실시간으로 도구 실행
- 지원되는 모델의 경우 모델의 추론 과정에 실시간으로 액세스

**프레임** 자체를 직접 조작하거나, 프레임에서 파생된 **일반 텍스트(plain text)**를 조작할 수 있습니다.

### 델타 프레임 vs 컴플리트 프레임 (Delta vs Complete Frames)

스트리밍 API는 두 종류의 프레임을 구분합니다:

- **델타 프레임** (`DeltaFrame`) — 청크(chunk) 단위로 도착하는 증분/부분 콘텐츠입니다. 콘텐츠가 스트리밍될 때 실시간으로 화면에 표시하기에 적합합니다. 예: `TextDelta`, `ReasoningDelta`, `ToolCallDelta`.

- **컴플리트 프레임** (`CompleteFrame`) — 해당 콘텐츠 유형에 대한 모든 델타가 수신된 후 발행되는 전체 콘텐츠입니다. 최종 처리 및 `Message.Response` 객체로의 변환에 유용합니다. 예: `TextComplete`, `ReasoningComplete`, `ToolCallComplete`.

일반적으로 UI 업데이트에는 델타 프레임을 사용하고, 최종 구조화된 데이터를 추출할 때는 컴플리트 프레임을 사용합니다.

---
## 사용법 (Usage)

### 프레임 직접 다루기 (Working with frames directly)

가장 일반적인 접근 방식은 각 프레임 종류에 따라 반응하는 것입니다.

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
                    // 선택적으로 지연 파싱 가능:
                    // val json = frame.contentJson
                }
                is StreamFrame.End -> println("
[END] reason=${frame.finishReason}")
                else -> {} // 다른 프레임 타입 처리 (TextComplete, ToolCallDelta 등)
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
                // 다른 프레임 타입 처리 (TextComplete, ToolCallDelta 등)
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

원시 문자열 스트림(raw string stream)을 직접 다루어 출력을 파싱할 수도 있다는 점에 유의하세요.
이 방식은 파싱 프로세스에 대해 더 많은 유연성과 제어권을 제공합니다.

다음은 출력 구조의 마크다운 정의를 사용하는 원시 문자열 스트림 예시입니다:

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
        // 원시 문자열 청크에 직접 액세스
        stream.collect { chunk ->
            // 텍스트 청크가 도착하는 대로 처리
            println("Received chunk: $chunk") // 전체 청크가 합쳐지면 mdDefinition 스키마를 따르는 구조화된 텍스트가 됩니다.
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

        // 원시 프레임에 직접 액세스
        stream.subscribe(new Flow.Subscriber<>() {
            @Override
            public void onSubscribe(Flow.Subscription subscription) {
                subscription.request(Long.MAX_VALUE);
            }

            @Override
            public void onNext(StreamFrame frame) {
                // 프레임이 도착하는 대로 처리
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

### 추론 프레임 다루기 (Working with reasoning frames)

추론을 지원하는 모델(예: Claude Sonnet 4.5 또는 GPT-o1)은 스트리밍 중에 추론 프레임을 내보냅니다. 추론 과정과 그 요약에 모두 액세스할 수 있습니다:

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
                        print(frame.text) // 도착하는 대로 추론 과정 표시
                    }
                    frame.summary?.let {
                        summarySteps.add(it)
                        print(frame.summary) // 도착하는 대로 추론 요약 표시
                    }
                }
                is StreamFrame.ReasoningComplete -> {
                    // 전체 추론 과정에 액세스
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
                    // 전체 추론 과정에 액세스
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

### 파생된 원시 텍스트 스트림 다루기 (Working with a raw text stream (derived))

`Flow<String>`을 기대하는 기존 스트리밍 파서가 있는 경우, `filterTextOnly()`를 통해 텍스트 청크를 파생시키거나 `collectText()`를 사용해 수집하십시오.

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

        // 텍스트 청크가 오는 대로 스트리밍:
        frames.filterTextOnly().collect { chunk -> print(chunk) }

        // 또는, End 이후에 모든 텍스트를 하나의 String으로 모으기:
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

        // 텍스트 청크가 오는 대로 스트리밍 (filterTextOnly와 동일):
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
                // 이제 fullText에 모든 텍스트가 포함됨 (collectText와 동일)
                System.out.println("
---
" + fullText);
            }
        });

        return null;
    });
    ```
    <!--- KNIT exampleStreamingApiJava03.java -->

### 이벤트 핸들러에서 스트림 이벤트 리스닝하기 (Listening to stream events in event handlers)

[에이전트 이벤트 핸들러](features/agent-event-handlers.md)에서 스트림 이벤트를 리스닝할 수 있습니다.

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
                else -> {} // 필요한 경우 다른 프레임 타입 처리
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

### 프레임을 `Message.Response`로 변환하기 (Converting frames to `Message.Response`)

수집된 프레임 리스트를 표준 메시지 객체로 변환할 수 있습니다:

- `toAssistantMessageOrNull()` — 텍스트 프레임에서 `Message.Assistant`를 추출합니다.
- `toReasoningMessageOrNull()` — 추론 프레임에서 `Message.Reasoning`을 추출합니다.
- `toToolCallMessages()` — 도구 호출 프레임에서 `Message.Tool.Call`을 추출합니다.
- `toMessageResponses()` — 모든 컴플리트 프레임을 해당 `Message.Response` 객체로 변환합니다.

## 예제 (Examples)

### 스트리밍 중 구조화된 데이터 처리 (마크다운 예시) (Structured data while streaming (Markdown example))

원시 문자열 스트림을 직접 다루는 것도 가능하지만, [구조화된 데이터](structured-output.md)를 사용하는 것이 더 편리할 때가 많습니다.

구조화된 데이터 접근 방식은 다음과 같은 주요 구성 요소를 포함합니다:

1. **MarkdownStructureDefinition**: 마크다운 형식의 구조화된 데이터에 대한 스키마와 예시를 정의하는 데 도움을 주는 클래스입니다.
2. **markdownStreamingParser**: 마크다운 청크 스트림을 처리하고 이벤트를 발생시키는 파서를 생성하는 함수입니다.

아래 섹션에서는 구조화된 데이터 스트림을 처리하는 것과 관련된 단계별 지침과 코드 샘플을 제공합니다. 

#### 1. 데이터 구조 정의하기 (Define your data structure)

먼저, 구조화된 데이터를 나타낼 데이터 클래스를 정의합니다:

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
    // TODO 아직 Java에서 지원되지 않음
    ```
    <!--- KNIT exampleStreamingApiJava05.java -->

#### 2. 마크다운 구조 정의하기 (Define the Markdown structure)

`MarkdownStructureDefinition` 클래스를 사용하여 마크다운에서 데이터가 어떻게 구조화되어야 하는지 명시하는 정의를 생성합니다:

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
    // TODO 아직 Java에서 지원되지 않음
    ```
    <!--- KNIT exampleStreamingApiJava06.java -->

#### 3. 데이터 구조를 위한 파서 생성하기 (Create a parser for your data structure)

`markdownStreamingParser`는 다양한 마크다운 요소에 대한 여러 핸들러를 제공합니다:

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
        // 레벨 1 헤더 처리 (레벨 범위는 1~6)
        onHeader(1) { headerText -> }
        // 불렛 포인트 처리
        onBullet { bulletText -> }
        // 코드 블록 처리
        onCodeBlock { codeBlockContent -> }
        // 정규식 패턴과 일치하는 라인 처리
        onLineMatching(Regex("pattern")) { line -> }
        // 스트림 종료 처리
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
    // TODO 아직 Java에서 지원되지 않음
    ```
    <!--- KNIT exampleStreamingApiJava07.java -->

정의된 핸들러를 사용하여 `markdownStreamingParser` 함수로 마크다운 스트림을 파싱하고 데이터 객체를 내보내는 함수를 구현할 수 있습니다.

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

             // 응답 스트림에서 마크다운 헤더를 수신하는 이벤트 처리
             onHeader(1) { headerText ->
                // 이전 도서 정보가 있다면 내보냄
                if (currentBookTitle.isNotEmpty() && bulletPoints.isNotEmpty()) {
                   val author = bulletPoints.getOrNull(0) ?: ""
                   val description = bulletPoints.getOrNull(1) ?: ""
                   emit(Book(currentBookTitle, author, description))
                }

                currentBookTitle = headerText
                bulletPoints.clear()
             }

             // 응답 스트림에서 마크다운 불렛 리스트를 수신하는 이벤트 처리
             onBullet { bulletText ->
                bulletPoints.add(bulletText)
             }

             // 응답 스트림 종료 처리
             onFinishStream {
                // 마지막 도서 정보가 있다면 내보냄
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
    // TODO 아직 Java에서 지원되지 않음
    ```
    <!--- KNIT exampleStreamingApiJava08.java -->

#### 4. 에이전트 전략에서 파서 사용하기 (Use the parser in your agent strategy)

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
       // 출력 스트림 파싱을 포함하는 노드 기술
       val getMdOutput by node<String, List<Book>> { booksDescription ->
          val books = mutableListOf<Book>()
          val mdDefinition = markdownBookDefinition()

          llm.writeSession {
             appendPrompt { user(booksDescription) }
             // `mdDefinition` 정의 형식으로 응답 스트림 시작
             val markdownStream = requestLLMStreaming(mdDefinition)
             // 응답 스트림의 결과로 파서를 호출하고 결과에 따른 작업 수행
             parseMarkdownStreamToBooks(markdownStream).collect { book ->
                books.add(book)
                println("Parsed Book: ${book.title} by ${book.author}")
             }
          }

          books
       }
       // 노드에 접근 가능한지 확인하며 에이전트 그래프 기술
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
    // TODO 아직 Java에서 지원되지 않음
    ```
    <!--- KNIT exampleStreamingApiJava09.java -->

### 고급 사용법: 도구를 사용한 스트리밍 (Advanced usage: Streaming with tools)

스트리밍 API를 도구와 함께 사용하여 데이터가 도착하는 대로 처리할 수도 있습니다. 
다음 섹션에서는 도구를 정의하고 스트리밍 데이터와 함께 사용하는 방법에 대한 간단한 단계별 가이드를 제공합니다.

### 1. 데이터 구조를 위한 도구 정의하기 (Define a tool for your data structure)

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

### 2. 스트리밍 데이터와 함께 도구 사용하기 (Use the tool with streaming data)

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
                /* 기타 가능한 옵션들:
                    callTool(BookTool::class, book)
                    callTool<BookTool>(book)
                    findTool(BookTool::class).execute(book)
                */
             }

             // 병렬 도구 호출 가능
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

                // 스트리밍된 프레임을 처리하고 ToolCallComplete 프레임에서 도구 호출
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

### 3. 에이전트 구성에 도구 등록하기 (Register the tool in your agent configuration)

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

## 권장 사항 (Best practices)

1. **명확한 구조 정의**: 데이터에 대해 명확하고 모호하지 않은 마크다운 구조를 생성합니다.

2. **좋은 예시 제공**: LLM을 가이드할 수 있도록 `MarkdownStructureDefinition`에 포괄적인 예시를 포함합니다.

3. **불완전한 데이터 처리**: 스트림에서 데이터를 파싱할 때 항상 null 또는 빈 값을 확인합니다.

4. **리소스 정리**: `onFinishStream` 핸들러를 사용하여 리소스를 정리하고 남은 데이터를 처리합니다.

5. **오류 처리**: 잘못된 형식의 마크다운이나 예기치 않은 데이터에 대해 적절한 오류 처리를 구현합니다.

6. **테스트**: 부분 청크 및 잘못된 형식의 입력을 포함하여 다양한 입력 시나리오로 파서를 테스트합니다.

7. **병렬 처리**: 독립적인 데이터 항목의 경우, 성능 향상을 위해 병렬 도구 호출 사용을 고려합니다.