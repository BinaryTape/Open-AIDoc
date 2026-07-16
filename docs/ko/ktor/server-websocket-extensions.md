[//]: # (title: WebSocket 확장 API)

Ktor WebSocket API는 자신만의 확장(예: [RFC-7692](https://tools.ietf.org/html/rfc7692))이나 임의의 커스텀 확장을 작성할 수 있도록 지원합니다.

## 확장 설치

확장을 설치하고 설정하기 위해 `extensions`와 `install`이라는 두 가지 메서드를 제공하며, 다음과 같은 방식으로 사용할 수 있습니다.

```kotlin
install(WebSockets) {
    extensions { /* WebSocketExtensionConfig.() -> Unit */
        install(MyWebSocketExtension) { /* MyWebSocketExtensionConfig.() -> Unit */
        /* 선택적 확장 설정. */ 
        }
    }
}
```

확장은 설치된 순서대로 사용됩니다.

## 확장이 협상되었는지 확인

설치된 모든 확장은 협상(negotiation) 과정을 거치며, 성공적으로 협상된 확장들이 요청 중에 사용됩니다.
현재 세션에서 사용 중인 모든 확장의 목록이 담긴 `WebSocketSession.extensions: List<WebSocketExtension<*>>` 프로퍼티를 사용할 수 있습니다.

확장이 사용 중인지 확인하는 두 가지 메서드로 `WebSocketSession.extension`과 `WebSocketSession.extensionOrNull`이 있습니다.

```kotlin
webSocket("/echo") {
    val myExtension = extension(MyWebSocketExtension) // `MyWebSocketExtension`이 협상되지 않은 경우 예외를 발생시킵니다.
    // 또는
    val myExtension = extensionOrNull(MyWebSocketExtension) ?: close() // `MyWebSocketExtension`이 협상되지 않은 경우 세션을 닫습니다.
}
```

## 새로운 확장 작성하기

새로운 확장을 구현하기 위한 두 개의 인터페이스 `WebSocketExtension<ConfigType: Any>`와 `WebSocketExtensionFactory<ConfigType : Any, ExtensionType : WebSocketExtension<ConfigType>>`가 있습니다.
단일 구현으로 클라이언트와 서버 모두에서 작동할 수 있습니다.

다음은 간단한 프레임 로깅(frame logging) 확장을 구현하는 예제입니다.

```kotlin
class FrameLoggerExtension(val logger: Logger) : WebSocketExtension<FrameLogger.Config> {
```

플러그인에는 필드와 메서드의 두 그룹이 있습니다. 첫 번째 그룹은 확장 협상을 위한 것입니다.

```kotlin
    /** 협상을 위해 클라이언트 요청에 보낼 프로토콜 목록 **/
    override val protocols: `List<WebSocketExtensionHeader>` = emptyList()
   
    /** 
      * 이 메서드는 서버에서 호출되며 클라이언트의 `requestedProtocols`를 처리합니다.
      * 결과적으로 서버가 사용하기로 동의한 확장 목록을 반환합니다.
      */
    override fun serverNegotiation(requestedProtocols: List<WebSocketExtensionHeader>): `List<WebSocketExtensionHeader>` {
        logger.log("Server negotiation")
        return emptyList()
    }

    /**
      * 이 메서드는 `serverNegotiation`에서 생성된 프로토콜 목록과 함께 클라이언트에서 호출됩니다. 이러한 확장을 사용할지 여부를 결정합니다. 
      */ 
    override fun clientNegotiation(negotiatedProtocols: List<WebSocketExtensionHeader>): Boolean {
        logger.log("Client negotiation")
        return true
    }

```

두 번째 그룹은 실제 프레임 처리를 담당하는 곳입니다. 메서드는 프레임을 받아 필요한 경우 새로운 처리된 프레임을 생성합니다.

```kotlin
    override fun processOutgoingFrame(frame: Frame): Frame {
        logger.log("Process outgoing frame: $frame")
        return frame
    }

    override fun processIncomingFrame(frame: Frame): Frame {
        logger.log("Process incoming frame: $frame")
        return frame
    }
```

또한 몇 가지 구현 세부 사항이 있습니다. 플러그인은 `Config`와 원본 `factory`에 대한 참조를 가집니다.

```kotlin
    class Config {
        lateinit var logger: Logger
    }

    /**
    * 현재 확장 인스턴스를 생성할 수 있는 팩토리입니다. 
    */
    override val factory: WebSocketExtensionFactory<Config, FrameLogger> = FrameLoggerExtension
```

팩토리는 일반적으로 (일반적인 플러그인과 유사하게) 컴패니언 객체(companion object)에 구현됩니다.

```kotlin
    companion object : WebSocketExtensionFactory<Config, FrameLogger> {
        /* 설치된 확장 인스턴스를 찾기 위한 키 */
        override val key: AttributeKey<FrameLogger> = AttributeKey("frame-logger")

        /** 점유된 rsv 비트 목록.
         * 확장이 비트를 점유하면 다른 설치된 확장에서는 해당 비트를 사용할 수 없습니다. 플러그인 충돌을 방지하기 위해(예: 여러 압축 플러그인이 설치되는 것을 방지) 이 비트들을 사용합니다. RFC를 사용하여 플러그인을 구현하는 경우, rsv 점유 비트는 해당 문서를 참조해야 합니다.
         */
        override val rsv1: Boolean = false
        override val rsv2: Boolean = false
        override val rsv3: Boolean = false

       /** 플러그인 인스턴스를 생성합니다. 각 WebSocket 세션마다 호출됩니다. **/
        override fun install(config: Config.() -> Unit): FrameLogger {
            return FrameLogger(Config().apply(config).logger)
        }
    }
}