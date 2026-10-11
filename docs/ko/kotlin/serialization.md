[//]: # (title: 직렬화(Serialization))

**직렬화(Serialization)**는 애플리케이션에서 사용되는 데이터를 네트워크를 통해 전송하거나 데이터베이스 또는 파일에 저장할 수 있는 형식으로 변환하는 프로세스입니다. 역직렬화(Deserialization)는 외부 데이터를 다시 런타임 객체로 변환하는 반대 프로세스입니다.
이 둘은 서드파티와 데이터를 주고받는 대부분의 애플리케이션에서 필수적입니다.

[JSON](https://www.json.org/json-en.html) 및 [Protocol Buffers](https://protobuf.dev/)와 같은 일부 데이터 직렬화 형식은 특히 널리 사용됩니다.
이러한 형식은 언어 중립적이고 플랫폼 중립적이므로, 최신 언어로 작성된 시스템 간에 데이터를 교환하는 데 사용할 수 있습니다.
Kotlin은 멀티플랫폼 및 다양한 데이터 형식을 지원하는 [`kotlinx.serialization` 라이브러리](#kotlin-serialization-libraries)를 통해 이 기능을 제공합니다.

Kotlin의 직렬화가 처음이라면 [직렬화 시작하기(Get Started with Serialization)](serialization-get-started.md) 튜토리얼부터 시작하는 것을 권장합니다.
이 튜토리얼에서는 프로젝트에 Kotlin 직렬화를 설정하는 과정을 안내하고, 첫 번째 클래스를 직렬화 및 역직렬화하는 방법을 보여줍니다.

<a href="serialization-get-started.md"><img src="get-started-serialization.svg" width="700" alt="Get started with serialization" style="block"/></a>

## Kotlin 직렬화 라이브러리 {id="kotlin-serialization-libraries"}

Kotlin 직렬화는 JVM, JavaScript, Native를 포함한 모든 플랫폼을 지원합니다.
대상 플랫폼에 관계없이 동일한 [의존성 선언](serialization-get-started.md#add-plugins-and-dependencies)을 사용할 수 있습니다.

Kotlin 직렬화는 다양한 직렬화 포맷 라이브러리를 통해 JSON, CBOR, Protocol Buffers 등 여러 직렬화 형식을 지원합니다.
이 라이브러리들은 `kotlinx-serialization-core` 라이브러리를 기반으로 빌드됩니다.
지원되는 직렬화 형식의 전체 목록은 [지원되는 직렬화 형식](#supported-serialization-formats)을 참조하세요.

모든 `kotlinx.serialization` 포맷 라이브러리는 `org.jetbrains.kotlinx:` 그룹의 일부이며, `kotlinx-serialization-`으로 시작하고 직렬화 형식을 반영하는 접미사가 붙는 이름을 가집니다.
예를 들면 다음과 같습니다.

* `org.jetbrains.kotlinx:kotlinx-serialization-json`: JSON 직렬화를 제공합니다.
* `org.jetbrains.kotlinx:kotlinx-serialization-cbor`: CBOR 직렬화를 제공합니다.

`kotlinx.serialization` 라이브러리는 Kotlin과 독립적인 자체 버전 관리를 따릅니다.
최신 릴리스 버전은 [GitHub](https://github.com/Kotlin/kotlinx.serialization/releases)에서 확인할 수 있습니다.

> 사용자 정의 직렬화 형식을 직접 작성하는 경우와 같이 특정 형식 라이브러리를 사용하지 않는 경우에는 `kotlinx-serialization-core` 라이브러리를 의존성으로 사용하세요.
>
{style="tip"}

## 지원되는 직렬화 형식 {id="supported-serialization-formats"}

`kotlinx.serialization` 프로젝트는 다양한 직렬화 형식을 위한 라이브러리를 제공합니다.

| 형식 | 아티팩트 ID | 플랫폼 | 상태 |
|---|---|---|---|
| [JSON](https://www.json.org/json-en.html) | [`kotlinx-serialization-json`](https://github.com/Kotlin/kotlinx.serialization/blob/master/formats/README.md#json) | 지원되는 모든 플랫폼 | 안정(Stable) |
| [HOCON](https://github.com/lightbend/config/blob/master/HOCON.md) | [`kotlinx-serialization-hocon`](https://github.com/Kotlin/kotlinx.serialization/blob/master/formats/README.md#hocon) | JVM 전용 | 실험적(Experimental) |
| [Protocol Buffers](https://protobuf.dev/) | [`kotlinx-serialization-protobuf`](https://github.com/Kotlin/kotlinx.serialization/blob/master/formats/README.md#protobuf) | 지원되는 모든 플랫폼 | 실험적(Experimental) |
| [CBOR](https://cbor.io/) | [`kotlinx-serialization-cbor`](https://github.com/Kotlin/kotlinx.serialization/blob/master/formats/README.md#cbor) | 지원되는 모든 플랫폼 | 실험적(Experimental) |
| [Properties](https://en.wikipedia.org/wiki/.properties) | [`kotlinx-serialization-properties`](https://github.com/Kotlin/kotlinx.serialization/blob/master/formats/README.md#properties) | 지원되는 모든 플랫폼 | 실험적(Experimental) |

JSON 직렬화 라이브러리(`kotlinx-serialization-json`)를 제외한 모든 직렬화 포맷 라이브러리는 [실험적(Experimental)](components-stability.md#stability-levels-explained) 단계입니다. 이들의 API는 언제든지 변경될 수 있습니다.
JSON 직렬화에 대한 자세한 내용은 [JSON 직렬화 개요](serialization-configure-json-serialization.md)를 참조하세요.

[YAML](https://yaml.org/)이나 [Apache Avro](https://avro.apache.org/)와 같은 추가 직렬화 형식을 지원하는 커뮤니티 유지 관리 라이브러리도 있습니다.

대체 형식 및 커스텀 실험적 직렬화 형식에 대한 자세한 내용은 [커스텀 직렬화 형식](serialization-custom-formats.md)에서 확인할 수 있습니다.

## 지원되는 직렬화 타입 {id="supported-serialization-types"}

Kotlin 직렬화는 모든 원시 타입(primitive types)과 `List` 타입과 같은 Kotlin 표준 라이브러리의 대부분의 복합 타입(composite types)을 포함하여 다양한 내장 타입을 지원합니다.
자세한 내용은 [내장 타입 직렬화](serialization-serialize-builtin-types.md)를 참조하세요.

또한, `@Serializable` 어노테이션이 지정된 클래스는 직렬화가 완벽히 지원되므로 클래스 인스턴스를 JSON과 같은 형식으로 상호 변환할 수 있습니다.
자세한 내용은 [클래스 직렬화](serialization-customization-options.md)를 참조하세요.

## 다음 단계 {id="what-s-next"}

* [직렬화 시작하기 튜토리얼](serialization-get-started.md)에서 Kotlin 직렬화의 기본 사항을 알아보세요.
* Kotlin 직렬화가 [원시 타입, 컬렉션 및 기타 내장 타입](serialization-serialize-builtin-types.md)을 어떻게 처리하는지 확인해 보세요.
* [JSON 직렬화 개요](serialization-configure-json-serialization.md)에서 더 복잡한 JSON 직렬화 시나리오를 살펴보세요.
* [클래스 직렬화](serialization-customization-options.md)를 자세히 살펴보고 클래스를 직렬화하고 `@Serializable` 어노테이션의 기본 동작을 수정하는 방법을 알아보세요.
* [직렬화기 생성 및 사용](serialization-create-and-use-serializers.md)에서 생성된 직렬화기(serializer)를 가져오고, 커스텀 직렬화기를 만들고, 직렬화기를 적용하는 방법을 알아보세요.
* [다형성 클래스 직렬화](serialization-polymorphism.md)에서 공유된 기본 타입을 통해 서로 다른 타입을 직렬화하는 방법을 확인해 보세요.
* [커스텀 직렬화 형식](serialization-custom-formats.md)에서 커스텀 형식을 생성하는 방법을 알아보세요.
* [CBOR](serialization-cbor.md) 및 [ProtoBuf](serialization-protobuf.md)와 같은 실험적 직렬화 형식을 살펴보세요.