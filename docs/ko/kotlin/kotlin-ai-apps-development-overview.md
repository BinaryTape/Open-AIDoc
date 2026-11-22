[//]: # (title: AI 기반 앱 개발을 위한 Kotlin)
<web-summary>Koog, MCP Kotlin SDK, 주요 LLM 제공자, RAG 파이프라인, AI 에이전트, Spring AI, LangChain4j를 활용하여 Kotlin으로 AI 기반 애플리케이션을 구축하는 방법을 알아보세요.</web-summary>

<web-summary>Koog를 활용하여 Kotlin으로 AI 기반 애플리케이션을 구축하는 방법을 알아보세요.</web-summary>

Kotlin은 AI 기반 애플리케이션을 구축하기 위한 현대적이고 실용적인 기반을 제공합니다.  
플랫폼 전반에서 사용할 수 있으며, 이미 널리 사용되는 AI 프레임워크와 원활하게 연동되고, 일반적인 AI 개발 패턴을 지원합니다.

## Koog {id="koog"}

[Koog](https://koog.ai)는 단순한 형태부터 복잡한 형태까지 다양한 AI 에이전트를 구축할 수 있는 JetBrains의 오픈 소스 프레임워크입니다.
멀티플랫폼 지원, Spring Boot 및 Ktor 연동, 관용적인(idiomatic) DSL,
그리고 즉시 프로덕션 환경에서 사용할 수 있는 다양한 기능을 기본으로 제공합니다.

### 단 몇 줄로 간단한 에이전트 만들기 {id="create-a-simple-agent-in-a-few-lines"}

```kotlin
fun main() {
    runBlocking {
        val agent = AIAgent(
            // Anthropic, Google, OpenRouter 또는 기타 다른 제공자 사용
            executor = simpleOpenAIExecutor(System.getenv("OPENAI_API_KEY")),
            systemPrompt = "You are a helpful assistant. Answer user questions concisely.",
            llmModel = OpenAIModels.Chat.GPT4o
        )

        val result = agent.run("Hello! How can you help me?")
        println(result)
    }
}
```

<a href="https://docs.koog.ai/quickstart/" as="button" mode="rock" icon="arrow-right" icon-position="right">Koog 시작하기</a>

### 주요 기능 {id="key-features"}

* **멀티플랫폼 개발 지원**. 멀티플랫폼 지원을 통해 JVM, JavaScript, WebAssembly, Android 및 iOS용 에이전트 애플리케이션 개발이 가능합니다.
* **신뢰성 및 내결함성(Fault-tolerance)**. 기본 내장된 재시도 기능을 통해 개발자는 타임아웃이나 도구 오류와 같은 장애를 손쉽게 처리할 수 있습니다. 에이전트 영속화(Persistence) 기능을 사용하면 단순한 채팅 메시지뿐만 아니라 에이전트의 전체 상태 머신을 복원할 수 있습니다.
* **긴 컨텍스트를 위한 기본 내장 히스토리 압축 기법**. Koog는 별도의 추가 설정 없이 장기 대화를 압축하고 관리할 수 있는 고급 전략을 제공합니다.
* **엔터프라이즈 환경을 지원하는 연동 기능**. Koog는 [Spring Boot](https://spring.io/projects/spring-boot) 및 [Ktor](https://ktor.io)와 같은 널리 사용되는 JVM 프레임워크와 원활하게 연동됩니다.
* **OpenTelemetry 익스포터를 통한 관찰 가능성(Observability)**. Koog는 W&B Weave, Langfuse와 같이 널리 사용되는 관찰 가능성 제공자와의 즉시 사용 가능한 연동 기능을 제공하여 AI 애플리케이션을 모니터링하고 디버깅할 수 있도록 지원합니다.
* **LLM 전환 및 매끄러운 히스토리 적응**. Koog를 사용하면 기존 대화 히스토리를 잃지 않고 언제든지 새로운 도구 세트를 갖춘 다른 LLM으로 전환할 수 있습니다. 또한 OpenAI, Anthropic, Google 등 여러 LLM 제공자 간의 재라우팅도 지원합니다. Ollama와의 연동을 통해 로컬 모델을 사용하여 에이전트를 로컬 환경에서 실행할 수도 있습니다.
* **JVM 및 Kotlin 애플리케이션과의 연동**. Koog는 JVM 및 Kotlin 개발자를 위해 특별히 설계된 관용적이고 타입 안전한 DSL을 제공합니다.
* **Model Context Protocol(MCP) 연동**. Koog를 사용하면 에이전트에서 MCP 도구를 활용할 수 있습니다.
* **지식 검색 및 메모리**. 임베딩, 순위화된 문서 스토리지, 공유 에이전트 메모리를 통해 Koog 자체가 대화 전반에 걸쳐 지식을 능동적으로 유지합니다.
* **스트리밍 기능**. Koog의 스트리밍 지원과 병렬 도구 호출 기능을 통해 응답을 실시간으로 처리할 수 있습니다.

### 시작하기 {id="where-to-start"}

* [개요](https://docs.koog.ai/)에서 Koog의 다양한 기능을 살펴보세요.
* [빠른 시작 가이드](https://docs.koog.ai/quickstart/)를 통해 첫 번째 Koog 에이전트를 만들어 보세요.
* [Koog 릴리스 노트](https://github.com/JetBrains/koog/releases)에서 최신 업데이트를 확인하세요.
* [예제](https://docs.koog.ai/examples/)를 통해 사용법을 배워보세요.

## Model Context Protocol(MCP) Kotlin SDK {id="model-context-protocol-mcp-kotlin-sdk"}

[MCP Kotlin SDK](https://github.com/modelcontextprotocol/kotlin-sdk)는 Model Context Protocol의 Kotlin Multiplatform 구현체입니다. 
이 SDK를 통해 개발자는 Kotlin으로 AI 기반 애플리케이션을 구축하고 JVM, WebAssembly 및 iOS 전반에서 LLM 서비스와 연동할 수 있습니다.

MCP Kotlin SDK를 통해 다음 작업을 수행할 수 있습니다.

* 컨텍스트 처리와 LLM 상호작용을 분리하여 구조화되고 표준화된 방식으로 LLM에 컨텍스트를 제공합니다.
* 기존 서버의 리소스를 사용하는 MCP 클라이언트를 구축합니다.
* 프롬프트, 도구, 리소스를 LLM에 노출하는 MCP 서버를 생성합니다.
* stdio, SSE, WebSocket과 같은 표준 통신 전송 방식을 사용합니다.
* 모든 MCP 프로토콜 메시지 및 라이프사이클 이벤트를 처리합니다.

## 기타 AI 기반 애플리케이션 시나리오 살펴보기 {id="explore-other-ai-powered-application-scenarios"}

원활한 Java 상호 운용성과 Kotlin Multiplatform 덕분에 Kotlin을 기존 AI SDK 및 프레임워크와 결합하고, 백엔드 및 데스크톱/모바일 UI를 구축하며, RAG 및 에이전트 기반 워크플로와 같은 패턴을 채택할 수 있습니다.

> [Kotlin-AI-Examples](https://github.com/Kotlin/Kotlin-AI-Examples) 저장소에서 예제를 살펴보고 직접 실행해 볼 수 있습니다.
> 각 프로젝트는 독립적으로 구성되어 있으므로, Kotlin 기반 AI 애플리케이션을 구축할 때 참고 자료나 템플릿으로 활용할 수 있습니다.

### 주요 모델 제공자 연동 {id="connect-to-major-model-providers"}

Kotlin을 사용하여 OpenAI, Anthropic, Google 등 주요 모델 제공자와 연동할 수 있습니다.

* [OpenAI](https://github.com/openai/openai-java) — OpenAI API용 공식 Java SDK입니다. 응답 및 채팅, 이미지, 오디오를 지원합니다.
* [Anthropic (Claude)](https://github.com/anthropics/anthropic-sdk-java) — Claude Messages API용 공식 Java SDK입니다. Vertex AI 및 Bedrock 연동을 위한 모듈이 포함되어 있습니다.
* [Google AI (Gemini / Vertex AI)](https://github.com/googleapis/java-genai) — 단일 클라이언트로 Gemini API와 Vertex AI 간 전환이 가능한 공식 Java SDK입니다.
* [Azure OpenAI](https://github.com/Azure/azure-sdk-for-java/tree/main/sdk/openai/azure-ai-openai) — Azure OpenAI Service용 공식 Java 클라이언트입니다. 채팅 완성 및 임베딩을 지원합니다.
* [AWS Bedrock](https://github.com/aws/aws-sdk-kotlin) — 파운데이션 모델을 호출하기 위한 공식 SDK입니다. Bedrock 및 Bedrock Runtime을 위한 Kotlin SDK와 Java SDK를 포함합니다.

### RAG 파이프라인 및 에이전트 기반 앱 구축 {id="create-rag-pipelines-and-agent-based-apps"}

* [Spring AI](https://github.com/spring-projects/spring-ai) — 프롬프트, 채팅, 임베딩, 도구 및 함수 호출, 벡터 스토리지를 위한 멀티 제공자 추상화 레이어입니다.
* [LangChain4j](https://docs.langchain4j.dev/tutorials/kotlin/) — 프롬프트, 도구, 검색 증강 생성(RAG, Retrieval-Augmented Generation) 파이프라인, 에이전트를 위한 Kotlin 확장을 제공하는 JVM 툴킷입니다.

## 다음 단계 {id="what-s-next"}

* IntelliJ IDEA에서 Kotlin과 Spring AI를 사용하는 방법을 자세히 알아보려면 [Spring AI를 사용하여 질문에 답변하는 Kotlin 앱 만들기](spring-ai-guide.md) 튜토리얼을 완료해 보세요.
* [Kotlin 커뮤니티](https://kotlinlang.org/community/)에 참여하여 Kotlin으로 AI 애플리케이션을 구축하는 다른 개발자들과 소통해 보세요.
* [Kotlin 개발에 도움이 되는 AI 도구](ai-for-development.md)에 대해 알아보세요.