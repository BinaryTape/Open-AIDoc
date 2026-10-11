[//]: # (title: 다형성 클래스 직렬화)

다형성(Polymorphism)을 사용하면 공통 인터페이스나 기본 클래스를 통해 서로 다른 타입의 객체를 다룰 수 있습니다.
Kotlin 직렬화는 서브타입 다형성을 지원하여 공통으로 선언된 슈퍼타입(supertype)을 통해 다양한 타입을 직렬화할 수 있도록 합니다.

Kotlin에서 인터페이스와 상속이 작동하는 방식에 대한 개요는 [인터페이스](interfaces.md) 및 [상속](inheritance.md)을 참조하세요.

Kotlin 직렬화는 기본적으로 _정적(static)_입니다.
변수의 선언된 타입인 직렬화 대상 값의 _정적 타입(static type)_을 사용하여 인코딩할 프로퍼티를 결정합니다.

즉, 런타임에 값이 서브클래스의 인스턴스이더라도 해당 정적 타입에 정의된 프로퍼티만 직렬화됩니다.

다음은 다형성 클래스 계층 구조를 사용하는 예제입니다:

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
open class Project(val name: String)

class OwnedProject(name: String, val owner: String) : Project(name)

fun main() {
    // Project를 선언된 정적 타입으로 사용합니다
    val data: Project = OwnedProject("kotlinx.coroutines", "kotlin")

    // 정적 타입에 정의된 프로퍼티만 직렬화합니다
    println(Json.encodeToString(data))
    // {"name":"kotlinx.coroutines"}
}
//sampleEnd
```
{kotlin-runnable="true"}

이 예제에서는 런타임 값이 `OwnedProject` 서브클래스임에도 불구하고, 선언된 `Project` 정적 타입의 프로퍼티만 직렬화됩니다.

다형성 클래스 계층 구조에서 값을 직렬화하기 위해 Kotlin 직렬화는 두 가지 접근 방식을 제공합니다:

* [닫힌 다형성(Closed polymorphism)](#serialize-closed-polymorphic-classes): `sealed` 기본 클래스나 인터페이스를 통해 컴파일 타임에 모든 서브클래스가 알려지도록 보장합니다.
* [열린 다형성(Open polymorphism)](#serialize-open-polymorphic-classes): `open` 또는 `abstract` 기본 클래스에 대해 서브클래스를 명시적으로 지정합니다.

## 닫힌 다형성 클래스 직렬화 {id="serialize-closed-polymorphic-classes"}

컴파일 타임에 가능한 모든 서브클래스가 알려지는 것이 보장될 때, 해당 클래스 계층 구조는 닫힌 다형성을 사용한다고 간주됩니다.

이러한 보장을 제공하려면 기본 타입으로 [`sealed class` 또는 `sealed interface`를 사용](sealed-classes.md)하세요.
기본 타입을 `@Serializable`로 표시하고, 모든 서브클래스도 `@Serializable`로 표시합니다:

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// sealed 클래스를 기본 타입으로 정의합니다
@Serializable
sealed class Project {
    abstract val name: String
}

// 서브클래스를 직렬화 가능하도록 표시합니다
@Serializable
class OwnedProject(override val name: String, val owner: String) : Project()

// 기본 타입을 정적 타입으로 사용하여 데이터를 직렬화합니다
fun main() {
    // 기본 타입을 정적 타입으로 사용합니다
    val data: Project = OwnedProject("kotlinx.coroutines", "kotlin")

    // 직렬화된 서브클래스를 식별하기 위해 type 프로퍼티가 추가됩니다
    println(Json.encodeToString(data))
    // {"type":"OwnedProject","name":"kotlinx.coroutines","owner":"kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true"}

기본적으로 JSON 출력의 `type` 프로퍼티는 클래스 식별자(class discriminator) 역할을 하여 직렬화된 서브클래스를 식별합니다.
이 프로퍼티는 직렬화 중에 기본 클래스를 정적 타입으로 사용하는 경우에만 포함됩니다.

> 클래스 식별자에 다른 키 이름을 사용하도록 JSON을 구성할 수도 있습니다.
> 자세한 내용은 [다형성을 위한 클래스 식별자 지정](serialization-json-configuration.md#specify-class-discriminator-for-polymorphism) 섹션을 참조하세요.
>
{style="tip"}

다음은 서브클래스가 정적 타입이어서 `type` 프로퍼티가 생략되는 예제입니다:

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
sealed class Project {
    abstract val name: String
}

@Serializable
class OwnedProject(override val name: String, val owner: String) : Project()

fun main() {
    // 추론된 정적 타입은 OwnedProject입니다
    val data = OwnedProject("kotlinx.coroutines", "kotlin")
    
    // 정적 타입이 OwnedProject이므로 type 프로퍼티가 생략됩니다
    println(Json.encodeToString(data))
    // {"name":"kotlinx.coroutines","owner":"kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true"}

객체를 직렬화할 때 출력에 `type` 프로퍼티가 포함되도록 기본 타입을 명시적으로 지정할 수 있습니다.
이렇게 하려면 기본 타입을 `encodeToString()` 함수의 타입 인자로 전달하세요:

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다
import kotlinx.serialization.*
import kotlinx.serialization.json.*

@Serializable
sealed class Project {
    abstract val name: String
}

@Serializable
class OwnedProject(override val name: String, val owner: String) : Project()

//sampleStart
fun main() {
    // 추론된 정적 타입은 OwnedProject입니다
    val data = OwnedProject("kotlinx.coroutines", "kotlin")

    // 다형성을 활용하기 위해 기본 타입을 명시적으로 지정합니다
    println(Json.encodeToString<Project>(data))
    // {"type":"OwnedProject","name":"kotlinx.coroutines","owner":"kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true"}

## 서브클래스에 커스텀 직렬화 이름 정의 {id="define-custom-serial-names-for-subclasses"}

기본적으로 Kotlin 직렬화는 닫힌 다형성 및 열린 다형성 계층 구조 모두에서 다형성 서브클래스의 클래스 식별자 값으로 정규화된 클래스 이름(fully qualified class name)을 사용합니다.
이 값은 클래스를 리팩터링하면 변경될 수 있습니다.

클래스 식별자 값을 안정적으로 유지하려면 [`@SerialName`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serial-name/) 어노테이션을 사용하여 커스텀 직렬화 이름을 정의하세요.

> 각 직렬화 가능 클래스는 고유한 `@SerialName`을 가져야 합니다.
> 별도의 다형성 계층 구조에 걸쳐 있더라도 서로 다른 클래스에 동일한 이름을 재사용하지 마세요.
> 
> 동일한 계층 구조 내에서 같은 이름을 재사용하면 인코딩 또는 디코딩 함수에서 `IllegalStateException`이 발생합니다.
> 서로 다른 계층 구조에서 같은 이름을 재사용하면 감지하기 어려운 직렬화 문제가 발생할 수 있습니다.
>
{style="warning"}

소스 코드에 의존하지 않는 서브클래스의 고유한 식별자를 정의하려면 `@SerialName`을 사용하세요:

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
sealed class Project {
    abstract val name: String
}

// 서브클래스에 커스텀 직렬화 이름을 할당합니다
@Serializable
@SerialName("owned")
class OwnedProject(override val name: String, val owner: String) : Project()

fun main() {
    val data: Project = OwnedProject("kotlinx.coroutines", "kotlin")
    println(Json.encodeToString(data))
    // {"type":"owned","name":"kotlinx.coroutines","owner":"kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true"}

## 뒷받침하는 필드가 있는 기본 클래스 프로퍼티 {id="base-class-properties-with-backing-fields"}

다형성 클래스 계층 구조에서 기본 클래스는 서브클래스 프로퍼티와 함께 직렬화되는 뒷받침하는 필드(backing field)가 있는 프로퍼티를 정의할 수 있습니다. 예를 들면 다음과 같습니다:

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
sealed class Project {
    abstract val name: String
    var status = "open"
}
            
@Serializable   
@SerialName("owned")
class OwnedProject(override val name: String, val owner: String) : Project()

fun main() {
    // 기본값을 인코딩하도록 Json 인스턴스를 구성합니다
    val json = Json { encodeDefaults = true }

    val data: Project = OwnedProject("kotlinx.coroutines", "kotlin")
    // 기본 클래스 프로퍼티를 서브클래스 프로퍼티와 함께 직렬화합니다
    println(json.encodeToString(data))
    // {"type":"owned","status":"open","name":"kotlinx.coroutines","owner":"kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true"}

## 다형성 클래스 계층 구조에서 object 직렬화 {id="serialize-objects-in-polymorphic-class-hierarchies"}

다형성 클래스 계층 구조는 `object`를 서브클래스로 가질 수 있습니다.
직렬화 중에 `object`는 프로퍼티가 없는 클래스와 유사하게 처리되며, 기본적으로 해당 클래스 이름이 `type` 프로퍼티의 값으로 사용됩니다.

이러한 객체를 직렬화에 포함하려면 `@Serializable`을 추가하세요:

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// sealed 기본 클래스를 정의합니다
@Serializable
sealed class Response

// object 서브클래스를 정의합니다
@Serializable
object EmptyResponse : Response()

// Response를 확장하는 클래스를 정의합니다
@Serializable   
class TextResponse(val text: String) : Response()

// 서로 다른 서브클래스를 포함하는 리스트를 직렬화합니다
fun main() {
    val list = listOf(EmptyResponse, TextResponse("OK"))
    println(Json.encodeToString(list))
    // [{"type":"EmptyResponse"},{"type":"TextResponse","text":"OK"}]
}
//sampleEnd
```
{kotlin-runnable="true"}

## 열린 다형성 클래스 직렬화 {id="serialize-open-polymorphic-classes"}

Kotlin 직렬화는 `open` 및 `abstract` 클래스와 인터페이스에 대해 열린 다형성을 지원합니다.
이 모델에서는 서브클래스를 코드베이스 어디에서나(심지어 다른 모듈에서도) 정의할 수 있습니다.
컴파일러가 컴파일 타임에 모든 서브클래스를 확인할 수 없으므로, 서브클래스를 명시적으로 지정해야 합니다.

컴파일 타임에 모든 서브클래스를 알 수 없는 경우 열린 다형성을 사용하세요.
런타임에 모든 서브클래스를 등록하려면 [`SerializersModule`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/-serializers-module/) 클래스에 기본 타입과 모든 서브클래스를 지정해야 합니다:

1. [`SerializersModule()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/-serializers-module.html) 빌더 함수를 사용하여 `SerializersModule`을 생성합니다.
2. `SerializersModule` 내부에서 [`polymorphic()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/polymorphic.html) 함수를 사용하여 기본 타입을 지정합니다.
3. `polymorphic()` 블록 내부에서 [`subclass()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/subclass.html) 함수를 사용하여 각 서브클래스를 _등록(register)_합니다.
   서브클래스를 등록하면 기본 타입과 연결된 서브클래스 세트에 추가되어 다형성 직렬화 및 역직렬화에 사용할 수 있게 됩니다.

4. `serializersModule` 프로퍼티를 사용하여 `SerializersModule`을 `Json` 인스턴스에 추가합니다.
5. 선택 사항으로, 정규화된 클래스 이름을 사용하는 대신 `@SerialName` 어노테이션을 사용하여 서브클래스에 안정적인 식별자를 정의합니다.

`type` 프로퍼티를 포함하려면 기본 타입을 정적 타입으로 사용하세요. 예를 들면 다음과 같습니다:

```kotlin 
// 직렬화 라이브러리의 선언들을 임포트합니다
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.*

//sampleStart
// SerializersModule을 정의합니다
val module = SerializersModule {

    // Project를 기본 타입으로 지정합니다
    polymorphic(Project::class) {

        // OwnedProject를 Project의 서브클래스로 등록합니다
        subclass(OwnedProject::class)
    }
}

// SerializersModule을 Json 인스턴스에 추가합니다
val format = Json { serializersModule = module }

// 직렬화 중 정적 타입으로 사용되는 기본 타입을 정의합니다
@Serializable
abstract class Project {
    abstract val name: String
}

// Project의 직렬화 가능한 서브클래스를 정의합니다
@Serializable
@SerialName("owned")
class OwnedProject(override val name: String, val owner: String) : Project()

fun main() {
    // 다형성을 활용하기 위해 Project를 정적 타입으로 사용합니다
    val data: Project = OwnedProject("kotlinx.coroutines", "kotlin")

    println(format.encodeToString(data))
    // {"type":"owned","name":"kotlinx.coroutines","owner":"kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true"}

이 구성은 [닫힌 다형성 클래스 직렬화](#serialize-closed-polymorphic-classes) 섹션의 예제와 동일한 JSON 구조를 생성하지만, `open` 및 `abstract` 클래스를 지원합니다.

> 이 예제는 `serializer()` 함수의 제약으로 인해 JVM에서만 작동합니다.
> Kotlin/JS 및 Kotlin/Native에서는 명시적 직렬화기(serializer)를 사용해야 합니다: `format.encodeToString(PolymorphicSerializer(Project::class), data)`.
> 
> 이 이슈에 대한 진행 상황은 [GitHub](https://github.com/Kotlin/kotlinx.serialization/issues/1077)에서 확인할 수 있습니다.
>
{style="note"}

### 열린 다형성 계층 구조에서 인터페이스 직렬화 {id="serialize-interfaces-in-open-polymorphic-hierarchies"}

인터페이스에는 `@Serializable` 어노테이션을 지정할 수 없습니다. Kotlin 직렬화는 인터페이스를 다형성으로 취급하며, 기본적으로 [`PolymorphicSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-polymorphic-serializer/)를 직렬화기로 사용합니다.

열린 다형성 직렬화에서 인터페이스를 기본 타입으로 사용하려면, 해당 인터페이스를 구현하는 클래스에 `@Serializable`을 표시하고 `SerializersModule`에 등록하세요:

```kotlin 
// 직렬화 라이브러리의 선언들을 임포트합니다
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.*

//sampleStart
// SerializersModule을 정의합니다
val module = SerializersModule {
    polymorphic(Project::class) {
        subclass(OwnedProject::class)
    }
}

val format = Json { serializersModule = module }

// 다형성 직렬화를 위한 인터페이스를 정의합니다
interface Project {
    val name: String
}

// OwnedProject가 Project 인터페이스를 구현합니다
@Serializable
@SerialName("owned")
class OwnedProject(override val name: String, val owner: String) : Project

fun main() {
    // 직렬화에 인터페이스를 사용합니다
    val data: Project = OwnedProject("kotlinx.coroutines", "kotlin")
    println(format.encodeToString(data))
    // {"type":"owned","name":"kotlinx.coroutines","owner":"kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true"}

> Kotlin/JS 및 Kotlin/Native에서는 플랫폼의 제한된 리플렉션 기능으로 인해
> `format.encodeToString(PolymorphicSerializer(Project::class), data)`와 같이 직렬화기를 명시적으로 지정해야 합니다.
>
{style="note"}

직렬화 가능 클래스의 프로퍼티로 인터페이스를 사용할 수도 있습니다.
이 경우에도 Kotlin 직렬화는 해당 프로퍼티에 `PolymorphicSerializer`를 적용합니다:

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.*

val module = SerializersModule {
    polymorphic(Project::class) {
        subclass(OwnedProject::class)
    }
}

val format = Json { serializersModule = module }

//sampleStart
interface Project {
    val name: String
}

@Serializable
@SerialName("owned")
class OwnedProject(override val name: String, val owner: String) : Project

// 인터페이스 프로퍼티를 가진 직렬화 가능 클래스를 정의합니다
@Serializable
class Data(val project: Project)

fun main() {
    val data = Data(OwnedProject("kotlinx.coroutines", "kotlin"))
    println(format.encodeToString(data))
    // {"project":{"type":"owned","name":"kotlinx.coroutines","owner":"kotlin"}}
}
//sampleEnd
```
{kotlin-runnable="true"}

### 다형성 계층 구조의 기본 타입 선택 {id="select-the-base-type-of-a-polymorphic-hierarchy"}

Kotlin 직렬화는 완전히 정적입니다. 다형성 계층 구조의 기본 타입을 컴파일 타임에 결정합니다.
명시적으로 구성하기만 하면 `Any`를 포함한 모든 기본 타입을 선택할 수 있습니다.

방법은 다음과 같습니다:

1. `SerializersModule`에 기본 타입과 그 서브클래스들을 지정합니다.
2. 기본 타입에 자체 직렬화기가 없는 경우, [`encodeToString()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/encode-to-string.html) 함수를 호출할 때 해당 타입에 대한 `PolymorphicSerializer`를 전달합니다.

예제는 다음과 같습니다:

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.*

//sampleStart
val module = SerializersModule {
    // Any 기본 타입에 대해 OwnedProject를 등록합니다
    polymorphic(Any::class) {
        subclass(OwnedProject::class)
    }
}

val format = Json { serializersModule = module }

@Serializable
abstract class Project {
    abstract val name: String
}

@Serializable
@SerialName("owned")
class OwnedProject(override val name: String, val owner: String) : Project()

fun main() {
    // Any를 정적 타입으로 사용합니다
    val data: Any = OwnedProject("kotlinx.coroutines", "kotlin")

    // Any 기본 타입에 대한 PolymorphicSerializer를 지정합니다
    println(format.encodeToString(PolymorphicSerializer(Any::class), data))
    // {"type":"owned","name":"kotlinx.coroutines","owner":"kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true"}

`PolymorphicSerializer`를 제공하지 않으면 다음과 같은 예외가 발생합니다:

```text
Exception in thread "main" kotlinx.serialization.SerializationException: Serializer for class 'Any' is not found.
Please ensure that class is marked as '@Serializable' and that the serialization compiler plugin is applied.
```

동일한 서브클래스에 대해 여러 기본 타입을 사용할 수도 있으며, 단 서브클래스를 각 기본 타입에 명시적으로 등록해야 합니다.

각 기본 타입마다 `subclass()` 호출을 반복하지 않으려면, 서브클래스를 등록하는 헬퍼 함수를 정의하고 이를 각 `polymorphic()` 블록에서 사용할 수 있습니다.

다음은 `Project`와 `BaseProject`를 모두 기본 타입으로 사용하는 예제입니다:

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.*

//sampleStart
val module = SerializersModule {
    // 서브클래스를 등록하는 헬퍼 함수를 정의합니다
    fun PolymorphicModuleBuilder<Project>.registerProjectSubclasses() {
        subclass(OwnedProject::class)
    }

    // 각 기본 타입 Project와 BaseProject에 동일한 서브클래스를 등록합니다
    polymorphic(BaseProject::class) { registerProjectSubclasses() }
    polymorphic(Project::class) { registerProjectSubclasses() }
}
//sampleEnd

val format = Json { serializersModule = module }

interface BaseProject {
    val name: String
}

interface Project : BaseProject

@Serializable
@SerialName("owned")
class OwnedProject(override val name: String, val owner: String) : Project

@Serializable
class Data(
    val project: Project,
    val baseProject: BaseProject
)

fun main() {
    val project = OwnedProject("kotlinx.coroutines", "kotlin")
    val data = Data(project, project)
    println(format.encodeToString(data))
    // {"project":{"type":"owned","name":"kotlinx.coroutines","owner":"kotlin"},"baseProject":{"type":"owned","name":"kotlinx.coroutines","owner":"kotlin"}}
}
```
{kotlin-runnable="true"}

### 다형성 방식으로 프로퍼티 직렬화 {id="serialize-properties-polymorphically"}

인터페이스와 추상 클래스는 기본적으로 다형성 직렬화를 사용합니다.

`Any`와 같이 직렬화할 수 없는 타입의 프로퍼티를 직렬화하거나, 프로퍼티의 타입이 `open` 클래스인 경우 프로퍼티에 [`@Polymorphic`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-polymorphic/) 어노테이션을 지정하세요.

이렇게 하면 해당 프로퍼티에 `PolymorphicSerializer`가 적용됩니다.

예제는 다음과 같습니다:

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.*

val module = SerializersModule {
    polymorphic(Any::class) {
        subclass(OwnedProject::class)
    }
}

val format = Json { serializersModule = module }

interface Project {
    val name: String
}

@Serializable
@SerialName("owned")
class OwnedProject(override val name: String, val owner: String) : Project

//sampleStart
@Serializable
class Data(
    // 프로퍼티에 PolymorphicSerializer를 적용합니다
    @Polymorphic
    val project: Any 
)

fun main() {
    val data = Data(OwnedProject("kotlinx.coroutines", "kotlin"))
    println(format.encodeToString(data))
    // {"project":{"type":"owned","name":"kotlinx.coroutines","owner":"kotlin"}}
}
//sampleEnd
```
{kotlin-runnable="true"}

### 열린 클래스를 다형성 방식으로 직렬화 {id="serialize-open-classes-polymorphically"}

`open` 클래스를 다형성 방식으로 직렬화하려면 `@Serializable`과 `@Polymorphic`을 모두 어노테이션으로 지정하세요:

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.*

val module = SerializersModule {
    polymorphic(Project::class) {
        subclass(OwnedProject::class)
    }
}

val format = Json { serializersModule = module }

//sampleStart
// open 클래스에 PolymorphicSerializer를 적용합니다
@Serializable
@Polymorphic
open class Project

@Serializable
@SerialName("owned")
class OwnedProject(val name: String, val owner: String) : Project()

@Serializable
class Data(val project: Project)

fun main() {
    val project = OwnedProject("kotlinx.coroutines", "kotlin")

    val data = Data(project)
    println(format.encodeToString(data))
    // {"project":{"type":"owned","name":"kotlinx.coroutines","owner":"kotlin"}}
}
//sampleEnd
```
{kotlin-runnable="true"}

### sealed 클래스 또는 인터페이스의 구현 등록 {id="register-implementations-of-a-sealed-class-or-interface"}
<primary-label ref="experimental-opt-in"/>

계층 구조의 루트가 `interface`이고 다양한 하위 계층 구조가 sealed 클래스로 표현되는 경우처럼, 동일한 계층 구조에서 열린 다형성과 닫힌 다형성을 결합할 수 있습니다.
각 sealed 서브클래스를 개별적으로 등록하는 대신, [`subclassesOfSealed()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/-polymorphic-module-builder/subclasses-of-sealed.html) 함수를 사용하여 sealed 클래스나 인터페이스의 모든 구현을 등록할 수 있습니다.

이 함수는 서브클래스 자체가 sealed 직렬화 가능 클래스인 경우 재귀적으로 서브클래스를 등록합니다.
해당 sealed 클래스나 인터페이스의 모든 서브클래스는 구체(concrete) 클래스이거나 sealed 클래스여야 합니다. 그렇지 않으면 `IllegalArgumentException`이 발생합니다.

예제는 다음과 같습니다:

```kotlin
@file:OptIn(ExperimentalSerializationApi::class)

// 직렬화 라이브러리의 선언들을 임포트합니다
import kotlinx.serialization.* 
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.*

interface Base

@Serializable
sealed interface Sub: Base

@Serializable
class Sub1(val data: String): Sub

val module1 = SerializersModule {
    polymorphic(Base::class) {
        subclassesOfSealed(Sub.serializer())
    }
}

val format1 = Json { serializersModule = module1 }

val module2 = SerializersModule {
    polymorphic(Base::class) {
        // 동일한 sealed 타입을 지정하기 위해 subclassesOfSealed()의 reified 버전을 사용합니다
        subclassesOfSealed<Sub>()
    }
}

val format2 = Json { serializersModule = module2 }

fun main() {
    val data: Base = Sub1("kotlin")
    println(format1.encodeToString(data))
    // {"type":"Sub1","data":"kotlin"}

    println(format2.encodeToString(data))
    // {"type":"Sub1","data":"kotlin"}
}
```
<!--{kotlin-runnable="true"} -->

### 다형성 계층 구조에서 제네릭 서브타입 직렬화 {id="serialize-generic-subtypes-in-a-polymorphic-hierarchy"}

Kotlin 직렬화는 런타임에 제네릭 타입 파라미터의 구체적인 타입을 자동으로 확인할 수 없습니다.
따라서 명시적인 구성 없이는 해당 파라미터에 맞는 직렬화기를 선택할 수 없습니다.

제네릭 다형성 서브타입에 이러한 구성을 제공하려면 명시적인 직렬화기와 함께 서브타입을 `SerializersModule`에 등록하세요.
`PolymorphicSerializer(Any::class)`가 가장 넓은 범위를 갖지만, 제네릭 값이 가질 수 있는 구체적인 타입을 알고 있다면 보다 구체적인 직렬화기를 사용할 수 있습니다.

> 기본 타입이 해당 타입 인자에 대한 직렬화기를 제공하는 경우 컴파일러 플러그인이 서브타입 직렬화기를 추론할 수 있으므로,
> sealed 기본 타입은 이 구성이 필요하지 않습니다.
> 
{style="note"}

예제는 다음과 같습니다:

```kotlin 
// 직렬화 라이브러리의 선언들을 임포트합니다
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.*

//sampleStart
@Serializable
abstract class Response<out T>

// 제네릭 다형성 서브타입을 정의합니다
@Serializable
@SerialName("OkResponse")
data class OkResponse<out T>(val data: T) : Response<T>()

@Serializable
abstract class Project {
    abstract val name: String
}

// 제네릭 값으로 사용되는 서브타입을 정의합니다
@Serializable
@SerialName("OwnedProject")
data class OwnedProject(override val name: String, val owner: String) : Project()

// 제네릭 서브타입을 포함하는 다형성 계층 구조를 위한 직렬화기를 정의합니다
val responseModule = SerializersModule {
    polymorphic(Response::class) {
        // 제네릭 서브타입을
        // PolymorphicSerializer를 지정하는 직렬화기와 함께 등록합니다
        subclass(OkResponse.serializer(PolymorphicSerializer(Any::class)))
    }
    polymorphic(Any::class) {
        // 제네릭 값으로 사용되는 서브타입을 등록합니다
        subclass(OwnedProject::class)
    }
    polymorphic(Project::class) {
        // 정적 기본 타입에 대해 동일한 서브타입을 등록합니다
        subclass(OwnedProject::class)
    }
}

// 등록된 직렬화기를 사용하여 Json 인스턴스를 생성합니다
val format = Json { serializersModule = responseModule }

fun main() {
    // 구체적인 서브타입을 갖는 제네릭 다형성 타입을 사용합니다
    val data: Response<Project> = OkResponse(OwnedProject("kotlinx.serialization", "kotlin"))

    val jsonString = format.encodeToString(data)
    println(jsonString)
    // {"type":"OkResponse","data":{"type":"OwnedProject","name":"kotlinx.serialization","owner":"kotlin"}}
   
    val deserializedData = format.decodeFromString<Response<Project>>(jsonString)
    println(deserializedData)
    // OkResponse(data=OwnedProject(name=kotlinx.serialization, owner=kotlin))
}
//sampleEnd
```
{kotlin-runnable="true"}

이 예제에서 `PolymorphicSerializer(Any::class)`는 제네릭 서브타입 `OkResponse`가 `Any`의 서브타입으로 다형성 등록된 모든 값과 함께 직렬화될 수 있도록 합니다.

### 여러 `SerializersModule` 인스턴스 병합 {id="merge-multiple-serializersmodule-instances"}

애플리케이션이 커지고 여러 소스 코드 모듈로 분할됨에 따라, 단일 `SerializersModule` 내에서 모든 클래스 계층 구조를 관리하는 것이 어려워질 수 있습니다.

[`plus`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/plus.html) 연산자를 사용하여 여러 `SerializersModule` 인스턴스를 병합할 수 있으며,
이를 통해 동일한 `Json` 포맷 인스턴스에서 함께 사용할 수 있습니다.

예제는 다음과 같습니다:

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.*

@Serializable
abstract class Response<out T>

@Serializable
data class OkResponse<out T>(val data: T) : Response<T>()

val responseModule = SerializersModule {
    polymorphic(Response::class) {
        subclass(OkResponse.serializer(PolymorphicSerializer(Any::class)))
    }
}

@Serializable
abstract class Project {
   abstract val name: String
}

@Serializable
data class OwnedProject(override val name: String, val owner: String) : Project()

val projectModule = SerializersModule {
    fun PolymorphicModuleBuilder<Project>.registerProjectSubclasses() {
        subclass(OwnedProject::class)
    }
    polymorphic(Any::class) { registerProjectSubclasses() }
    polymorphic(Project::class) { registerProjectSubclasses() }
}
//sampleStart
// 두 계층 구조의 SerializersModule 인스턴스를 병합합니다
val format = Json { serializersModule = projectModule + responseModule }
//sampleEnd

fun main() {
    val data: Response<Project> = OkResponse(OwnedProject("kotlinx.serialization", "kotlin"))
    val string = format.encodeToString(data)
    println(string)
    // {"type":"OkResponse","data":{"type":"OwnedProject","name":"kotlinx.serialization","owner":"kotlin"}}

    println(format.decodeFromString<Response<Project>>(string))
    // OkResponse(data=OwnedProject(name=kotlinx.serialization, owner=kotlin))
}
```
{kotlin-runnable="true"}

`SerializersModule` 블록 내부에서 모듈을 병합하려면 [`include()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/-serializers-module-builder/include.html) 함수를 사용하세요:

```kotlin
// include()를 사용하여 여러 SerializersModule 인스턴스를 병합합니다
val combinedModule = SerializersModule {
    include(projectModule)
    include(responseModule)
}
```

> 라이브러리나 공유 모듈의 `SerializersModule`을 외부에 노출하면, 소비자가 이를 자신의 `SerializersModule`과 병합할 수 있습니다.
> 
{style="tip"}

### 기본 역직렬화기로 알 수 없는 다형성 서브타입 역직렬화 {id="deserialize-unknown-polymorphic-subtypes-with-a-default-deserializer"}

다형성 데이터를 역직렬화할 때 Kotlin 직렬화는 `type` 프로퍼티로부터 서브타입을 확인합니다.
서브타입이 등록되어 있지 않으면 역직렬화가 실패하고 `SerializationException`이 발생합니다.

등록되지 않았거나 알 수 없는 다형성 서브타입을 처리하기 위해 기본 역직렬화기(default deserializer)를 정의할 수 있습니다.

`Project`가 기본 타입이고 `OwnedProject`가 등록된 서브타입이며 `BasicProject`가 알 수 없는 프로젝트 서브타입을 나타내는 다음 예제를 살펴보겠습니다:

```kotlin
@Serializable
abstract class Project {
    abstract val name: String
}

// 알 수 없는 프로젝트 타입을 나타냅니다
@Serializable
data class BasicProject(override val name: String, val type: String): Project()

@Serializable
@SerialName("OwnedProject")
data class OwnedProject(override val name: String, val owner: String) : Project()
```

`Project`의 알 수 없는 다형성 서브타입을 처리하려면 기본 타입에 대한 기본 역직렬화기를 구성하세요.
`polymorphic()` 블록 내부에서 [`defaultDeserializer()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/-polymorphic-module-builder/default-deserializer.html) 함수를 사용하여 등록되지 않은 이러한 서브타입을 위한 대체 방식을 정의합니다:

```kotlin
val module = SerializersModule {
    polymorphic(Project::class) {
        subclass(OwnedProject::class)
        defaultDeserializer { BasicProject.serializer() }
    }
}
```

이 `SerializersModule` 구성을 사용하여 등록된 서브타입과 등록되지 않은 서브타입을 모두 역직렬화할 수 있습니다:

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.*

@Serializable
abstract class Project {
    abstract val name: String
}

// 알 수 없는 프로젝트 타입을 나타냅니다
@Serializable
data class BasicProject(override val name: String, val type: String): Project()

@Serializable
@SerialName("OwnedProject")
data class OwnedProject(override val name: String, val owner: String) : Project()

// 알 수 없는 Project 서브타입에 대한 기본 역직렬화기를 등록합니다
val module = SerializersModule {
    polymorphic(Project::class) {
        subclass(OwnedProject::class)
        defaultDeserializer { BasicProject.serializer() }
    }
}

//sampleStart
val format = Json { serializersModule = module }

fun main() {
    // 알려진 Project 서브타입과 알 수 없는 Project 서브타입을 모두 역직렬화합니다
    println(format.decodeFromString<List<Project>>("""
        [
            {"type":"unknown","name":"example"},
            {"type":"OwnedProject","name":"kotlinx.serialization","owner":"kotlin"} 
        ]
    """))
    // [BasicProject(name=example, type=unknown), OwnedProject(name=kotlinx.serialization, owner=kotlin)]
}
//sampleEnd
```
{kotlin-runnable="true"}

이 예제에서 역직렬화는 서브타입을 구분하기 위해 `type` 필드에 의존하지 않고, 대신 플러그인이 생성한 `BasicProject`의 직렬화기를 사용합니다.
이 방식은 알 수 없는 서브타입이 이미 알려진 구조를 따른다고 가정합니다.

JSON의 경우, 알 수 없는 서브타입에 추가 프로퍼티가 포함되어 있지만 기본 역직렬화기가 기대하는 구조와 일치할 때 [알 수 없는 키를 무시하도록](serialization-json-configuration.md#ignore-unknown-keys) 포맷을 구성할 수도 있습니다.
알 수 없는 입력의 구조가 다양하다면 [커스텀 직렬화기](serialization-create-and-use-serializers.md#create-custom-serializers)를 대신 사용하세요.

> 역직렬화 중 JSON 입력을 보다 유연하게 처리하는 방법은 [JSON 구조 수정](serialization-transform-json.md#modify-json-structure)을 참조하세요.
>
{style="tip"}

### 기본 직렬화기로 다형성 타입 직렬화 {id="serialize-polymorphic-types-with-a-default-serializer"}

모든 구체 서브타입을 등록하지 않고도 다형성 기본 타입의 값을 직렬화할 수 있습니다.
전체 타입 계층 구조에 접근할 수 없거나 계층 구조가 자주 변경되는 경우 이 방식을 사용하세요.

방법은 다음과 같습니다:

1. `SerializersModule` 블록에서 [`polymorphicDefaultSerializer()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/-serializers-module-builder/polymorphic-default-serializer.html) 함수를 사용합니다.
2. `polymorphicDefaultSerializer()`에 런타임 값에 대한 [`SerializationStrategy`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serialization-strategy/)를 반환하는 람다를 지정합니다.

두 개의 비공개(private) 클래스인 `CatImpl`과 `DogImpl`이 있는 예제를 살펴보겠습니다.
이들의 가시성을 높이지 않으려면, 공개 인터페이스를 통해 런타임 타입을 기반으로 직렬화기를 선택하는 기본 직렬화기를 `Animal`에 등록하세요:

```kotlin
interface Animal

interface Cat : Animal {
    val catType: String
}

interface Dog : Animal {
    val dogType: String
}

private class CatImpl : Cat {
    override val catType: String = "Tabby"
}

private class DogImpl : Dog {
    override val dogType: String = "Husky"
}

object AnimalProvider {
    fun createCat(): Cat = CatImpl()
    fun createDog(): Dog = DogImpl()
}

// 알 수 없는 Animal 서브타입에 대한 기본 직렬화기를 등록합니다
val module = SerializersModule {
    polymorphicDefaultSerializer(Animal::class) { instance ->
        @Suppress("UNCHECKED_CAST")
        // when 블록을 사용하여 적절한 직렬화기를 결정합니다
        when (instance) {
            is Cat -> CatSerializer as SerializationStrategy<Animal>
            is Dog -> DogSerializer as SerializationStrategy<Animal>
            else -> null
        }
    }
}
```

`Cat`과 `Dog`에 대한 직렬화기를 정의한 다음, `serializersModule` 프로퍼티를 통해 이 `SerializersModule`을 사용하는 `Json` 인스턴스를 생성하여 `Animal` 값의 다형성 직렬화를 활성화합니다:

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.modules.*

interface Animal

interface Cat : Animal {
    val catType: String
}

interface Dog : Animal {
    val dogType: String
}

private class CatImpl : Cat {
    override val catType: String = "Tabby"
}

private class DogImpl : Dog {
    override val dogType: String = "Husky"
}

object AnimalProvider {
    fun createCat(): Cat = CatImpl()
    fun createDog(): Dog = DogImpl()
}

// 알 수 없는 Animal 서브타입에 대한 기본 직렬화기를 등록합니다
val module = SerializersModule {
    polymorphicDefaultSerializer(Animal::class) { instance ->
        @Suppress("UNCHECKED_CAST")
        // 런타임 값을 기반으로 when 블록을 사용하여 적절한 직렬화기를 결정합니다
        when (instance) {
            is Cat -> CatSerializer as SerializationStrategy<Animal>
            is Dog -> DogSerializer as SerializationStrategy<Animal>
            else -> null
        }
    }
}

//sampleStart
// 커스텀 직렬화기를 정의합니다
object CatSerializer : SerializationStrategy<Cat> {
    override val descriptor = buildClassSerialDescriptor("Cat") {
        element<String>("catType")
    }

    override fun serialize(encoder: Encoder, value: Cat) {
        encoder.encodeStructure(descriptor) {
            encodeStringElement(descriptor, 0, value.catType)
        }
    }
}

object DogSerializer : SerializationStrategy<Dog> {
    override val descriptor = buildClassSerialDescriptor("Dog") {
        element<String>("dogType")
    }

    override fun serialize(encoder: Encoder, value: Dog) {
        encoder.encodeStructure(descriptor) {
            encodeStringElement(descriptor, 0, value.dogType)
        }
    }
}

val format = Json { serializersModule = module }

fun main() {
    // Cat 인스턴스를 직렬화합니다
    println(format.encodeToString<Animal>(AnimalProvider.createCat()))
    // {"type":"Cat","catType":"Tabby"}
}
//sampleEnd
```
{kotlin-runnable="true"}

## 다음 단계 {id="what-s-next"}

* [직렬화기 생성 및 사용](serialization-create-and-use-serializers.md)에서 생성된 직렬화기를 가져오고, 커스텀 직렬화기를 생성하며, 직렬화기를 적용하는 방법을 알아보세요.