[//]: # (title: ポリモーフィックなクラスのシリアル化)

ポリモーフィズム（多態性）を使用すると、共通のインターフェースや基底クラスを介して異なる型のオブジェクトを扱うことができます。
Kotlin シリアライゼーションはサブタイプポリモーフィズムをサポートしており、共通して宣言されたスーパータイプを介して異なる型をシリアル化できます。

Kotlin におけるインターフェースと継承の仕組みの概要については、[インターフェース](interfaces.md)および[継承](inheritance.md)を参照してください。

Kotlin シリアライゼーションは、デフォルトでは*静的*（static）です。
シリアル化される値の*静的型*（変数の宣言された型）を使用して、エンコードするプロパティを決定します。

これは、実行時における値がサブクラスのインスタンスであっても、その静的型で定義されているプロパティのみがシリアル化されることを意味します。

ポリモーフィックなクラス階層を使用する例を以下に示します：

```kotlin
// シリアライゼーションライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
open class Project(val name: String)

class OwnedProject(name: String, val owner: String) : Project(name)

fun main() {
    // 宣言された静的型として Project を使用
    val data: Project = OwnedProject("kotlinx.coroutines", "kotlin")

    // 静的型で定義されているプロパティのみをシリアル化
    println(Json.encodeToString(data))
    // {"name":"kotlinx.coroutines"}
}
//sampleEnd
```
{kotlin-runnable="true"}

この例では、実行時の値が `OwnedProject` サブクラスであるにもかかわらず、宣言された静的型である `Project` のプロパティのみがシリアル化されます。

ポリモーフィックなクラス階層の値をシリアル化するために、Kotlin シリアライゼーションは2つのアプローチを提供しています：

* [閉じたポリモーフィズム（Closed polymorphism）](#serialize-closed-polymorphic-classes): `sealed` な基底クラスまたはインターフェースにより、コンパイル時にすべてのサブクラスが把握されていることが保証されます。
* [開いたポリモーフィズム（Open polymorphism）](#serialize-open-polymorphic-classes): `open` または `abstract` な基底クラスに対して、サブクラスを明示的に指定します。

## 閉じたポリモーフィッククラスのシリアル化 {id="serialize-closed-polymorphic-classes"}

すべての可能なサブクラスがコンパイル時に把握されていることが保証されている場合、そのクラス階層は閉じたポリモーフィズムを使用していると見なされます。

この保証を提供するには、基底型として [`sealed class` または `sealed interface` を使用](sealed-classes.md)します。
それを `@Serializable` とマークし、すべてのサブクラスも `@Serializable` でマークします：

```kotlin
// シリアライゼーションライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 基底型として sealed class を定義
@Serializable
sealed class Project {
    abstract val name: String
}

// サブクラスをシリアライズ可能としてマーク
@Serializable
class OwnedProject(override val name: String, val owner: String) : Project()

// 基底型を静的型として使用してデータをシリアル化
fun main() {
    // 基底型を静的型として使用
    val data: Project = OwnedProject("kotlinx.coroutines", "kotlin")

    // シリアル化されたサブクラスを識別するために type プロパティが追加される
    println(Json.encodeToString(data))
    // {"type":"OwnedProject","name":"kotlinx.coroutines","owner":"kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true"}

デフォルトでは、JSON 出力内の `type` プロパティがクラス判別子（class discriminator）として機能し、シリアル化されたサブクラスを識別します。
このプロパティは、シリアル化時に基底クラスを静的型として使用した場合にのみ含まれます。

> クラス判別子に別のキー名を使用するように JSON を設定することもできます。
> 詳細については、[ポリモーフィズム用のクラス判別子の指定](serialization-json-configuration.md#specify-class-discriminator-for-polymorphism)セクションを参照してください。
>
{style="tip"}

以下は、サブクラスが静的型であるため、`type` プロパティが省略される例です：

```kotlin
// シリアライゼーションライブラリから宣言をインポート
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
    // 推論される静的型は OwnedProject
    val data = OwnedProject("kotlinx.coroutines", "kotlin")
    
    // 静的型が OwnedProject であるため、type プロパティは省略される
    println(Json.encodeToString(data))
    // {"name":"kotlinx.coroutines","owner":"kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true"}

オブジェクトをシリアル化するときに明示的に基底型を指定して、出力に `type` プロパティが確実に含まれるようにすることができます。
これを行うには、`encodeToString()` 関数に対象の型引数として基底型を渡します：

```kotlin
// シリアライゼーションライブラリから宣言をインポート
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
    // 推論される静的型は OwnedProject
    val data = OwnedProject("kotlinx.coroutines", "kotlin")

    // ポリモーフィズムを利用するために基底型を明示的に指定
    println(Json.encodeToString<Project>(data))
    // {"type":"OwnedProject","name":"kotlinx.coroutines","owner":"kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true"}

## サブクラスのカスタムシリアル名の定義 {id="define-custom-serial-names-for-subclasses"}

デフォルトでは、Kotlin シリアライゼーションは、閉じたポリモーフィック階層と開いたポリモーフィック階層の両方で、ポリモーフィックなサブクラスのクラス判別子の値として完全修飾クラス名（FQCN）を使用します。
この値は、クラスをリファクタリングした場合に変更される可能性があります。

クラス判別子の値を安定させるには、[`@SerialName`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serial-name/) アノテーションを使用してカスタムのシリアル名を定義します。

> 各シリアライズ可能なクラスには、一意の `@SerialName` が必要です。
> 異なるクラス間で、たとえ別々のポリモーフィック階層であっても、同じ名前を再利用しないでください。
> 
> 同じ階層内で同じ名前を再利用すると、エンコードまたはデコード関数が `IllegalStateException` をスローします。
> 別の階層間で同じ名前を再利用すると、気付きにくいシリアライゼーションの問題につながる可能性があります。
>
{style="warning"}

ソースコードに依存しないサブクラスの安定した識別子を定義するには、`@SerialName` を使用します：

```kotlin
// シリアライゼーションライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
sealed class Project {
    abstract val name: String
}

// サブクラスにカスタムシリアル名を割り当てる
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

## バッキングフィールドを持つ基底クラスのプロパティ {id="base-class-properties-with-backing-fields"}

ポリモーフィックなクラス階層では、基底クラスがバッキングフィールドを持つプロパティを定義でき、それらはサブクラスのプロパティと一緒にシリアル化されます。例：

```kotlin
// シリアライゼーションライブラリから宣言をインポート
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
    // デフォルト値をエンコードするように Json インスタンスを設定
    val json = Json { encodeDefaults = true }

    val data: Project = OwnedProject("kotlinx.coroutines", "kotlin")
    // 基底クラスのプロパティをサブクラスのプロパティと一緒にシリアル化
    println(json.encodeToString(data))
    // {"type":"owned","status":"open","name":"kotlinx.coroutines","owner":"kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true"}

## ポリモーフィックなクラス階層内の object のシリアル化 {id="serialize-objects-in-polymorphic-class-hierarchies"}

ポリモーフィックなクラス階層では、`object` をサブクラスとして持つことができます。
シリアル化の間、`object` はプロパティを持たないクラスと同様に扱われ、デフォルトではそのクラス名が `type` プロパティの値として使用されます。

これらの object をシリアライゼーションに含めるには、`@Serializable` アノテーションを付けます：

```kotlin
// シリアライゼーションライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// sealed な基底クラスを定義
@Serializable
sealed class Response

// object のサブクラスを定義
@Serializable
object EmptyResponse : Response()

// Response を拡張するクラスを定義
@Serializable   
class TextResponse(val text: String) : Response()

// 異なるサブクラスを含むリストをシリアル化
fun main() {
    val list = listOf(EmptyResponse, TextResponse("OK"))
    println(Json.encodeToString(list))
    // [{"type":"EmptyResponse"},{"type":"TextResponse","text":"OK"}]
}
//sampleEnd
```
{kotlin-runnable="true"}

## 開いたポリモーフィッククラスのシリアル化 {id="serialize-open-polymorphic-classes"}

Kotlin シリアライゼーションは、`open` および `abstract` なクラスやインターフェースに対する開いたポリモーフィズムをサポートしています。
このモデルでは、サブクラスをコードベース内のどこにでも、別のモジュール内にさえ定義できます。
コンパイラはコンパイル時にすべてのサブクラスを特定できないため、明示的に指定する必要があります。

すべてのサブクラスがコンパイル時に把握されていない場合は、開いたポリモーフィズムを使用します。
実行時にすべてのサブクラスを登録するには、[`SerializersModule`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/-serializers-module/) クラスで基底型とすべてのサブクラスを指定する必要があります：

1. [`SerializersModule()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/-serializers-module.html) ビルダー関数を使用して `SerializersModule` を作成します。
2. `SerializersModule` 内で、[`polymorphic()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/polymorphic.html) 関数を使用して基底型を指定します。
3. `polymorphic()` ブロック内で、[`subclass()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/subclass.html) 関数を使用して各サブクラスを*登録*（register）します。
   サブクラスを登録すると、基底型に関連付けられたサブクラスのセットに追加され、ポリモーフィックなシリアル化およびデシリアル化で利用できるようになります。

4. `serializersModule` プロパティを使用して、`SerializersModule` を `Json` インスタンスに追加します。
5. オプションで、完全修飾クラス名を使用する代わりに、`@SerialName` アノテーションを使用してサブクラスの安定した識別子を定義します。

`type` プロパティを含めるには、基底型を静的型として使用します。例：

```kotlin 
// シリアライゼーションライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.*

//sampleStart
// SerializersModule を定義
val module = SerializersModule {

    // 基底型として Project を指定
    polymorphic(Project::class) {

        // OwnedProject を Project のサブクラスとして登録
        subclass(OwnedProject::class)
    }
}

// SerializersModule を Json インスタンスに追加
val format = Json { serializersModule = module }

// シリアル化中に静的型として使用される基底型を定義
@Serializable
abstract class Project {
    abstract val name: String
}

// Project のシリアライズ可能なサブクラスを定義
@Serializable
@SerialName("owned")
class OwnedProject(override val name: String, val owner: String) : Project()

fun main() {
    // ポリモーフィズムを利用するために Project を静的型として使用
    val data: Project = OwnedProject("kotlinx.coroutines", "kotlin")

    println(format.encodeToString(data))
    // {"type":"owned","name":"kotlinx.coroutines","owner":"kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true"}

この設定により、[閉じたポリモーフィッククラスのシリアル化](#serialize-closed-polymorphic-classes)セクションの例と同じ JSON 構造が生成されますが、`open` クラスおよび `abstract` クラスがサポートされます。

> この例は、`serializer()` 関数の制限により JVM 上でのみ動作します。
> Kotlin/JS および Kotlin/Native では、明示的なシリアライザーを使用してください: `format.encodeToString(PolymorphicSerializer(Project::class), data)`。
> 
> この問題の動向は [GitHub](https://github.com/Kotlin/kotlinx.serialization/issues/1077) で追跡できます。
>
{style="note"}

### 開いたポリモーフィック階層におけるインターフェースのシリアル化 {id="serialize-interfaces-in-open-polymorphic-hierarchies"}

インターフェースに `@Serializable` アノテーションを付けることはできません。Kotlin シリアライゼーションはインターフェースをポリモーフィックなものとして扱い、デフォルトでそのシリアライザーとして [`PolymorphicSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-polymorphic-serializer/) を使用します。

開いたポリモーフィックシリアライゼーションでインターフェースを基底型として使用するには、それを実装するクラスに `@Serializable` とマークし、`SerializersModule` に登録します：

```kotlin 
// シリアライゼーションライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.*

//sampleStart
// SerializersModule を定義
val module = SerializersModule {
    polymorphic(Project::class) {
        subclass(OwnedProject::class)
    }
}

val format = Json { serializersModule = module }

// ポリモーフィックなシリアル化用のインターフェースを定義
interface Project {
    val name: String
}

// OwnedProject は Project インターフェースを実装
@Serializable
@SerialName("owned")
class OwnedProject(override val name: String, val owner: String) : Project

fun main() {
    // シリアル化にインターフェースを使用
    val data: Project = OwnedProject("kotlinx.coroutines", "kotlin")
    println(format.encodeToString(data))
    // {"type":"owned","name":"kotlinx.coroutines","owner":"kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true"}

> Kotlin/JS および Kotlin/Native では、プラットフォームのリフレクション機能が制限されているため、
> `format.encodeToString(PolymorphicSerializer(Project::class), data)` のようにシリアライザーを明示的に指定する必要があります。
>
{style="note"}

インターフェースは、シリアライズ可能なクラスのプロパティとしても使用できます。
この場合も、Kotlin シリアライゼーションはそのプロパティに `PolymorphicSerializer` を適用します：

```kotlin
// シリアライゼーションライブラリから宣言をインポート
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

// インターフェースプロパティを持つシリアライズ可能なクラスを定義
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

### ポリモーフィック階層の基底型の選択 {id="select-the-base-type-of-a-polymorphic-hierarchy"}

Kotlin シリアライゼーションは完全に静的です。ポリモーフィック階層の基底型はコンパイル時に決定されます。
明示的に設定する限り、`Any` を含む任意の基底型を選択できます。

これを行うには：

1. `SerializersModule` で基底型とそのサブクラスを指定します。
2. 基底型に独自のシリアライザーがない場合は、[`encodeToString()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/encode-to-string.html) 関数を呼び出す際にその型用の `PolymorphicSerializer` を渡します。

以下に例を示します：

```kotlin
// シリアライゼーションライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.*

//sampleStart
val module = SerializersModule {
    // Any 基底型に対して OwnedProject を登録
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
    // 静的型として Any を使用
    val data: Any = OwnedProject("kotlinx.coroutines", "kotlin")

    // Any 基底型用の PolymorphicSerializer を指定
    println(format.encodeToString(PolymorphicSerializer(Any::class), data))
    // {"type":"owned","name":"kotlinx.coroutines","owner":"kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true"}

`PolymorphicSerializer` を指定しない場合、次の例外がスローされます：

```text
Exception in thread "main" kotlinx.serialization.SerializationException: Serializer for class 'Any' is not found.
Please ensure that class is marked as '@Serializable' and that the serialization compiler plugin is applied.
```

サブクラスを各基底型に対して明示的に登録する限り、同じサブクラスに対して複数の基底型を使用することもできます。

各基底型に対する `subclass()` の呼び出しの繰り返しを避けるために、サブクラスを登録するヘルパー関数を定義し、それを各 `polymorphic()` ブロックで使用できます。

`Project` と `BaseProject` の両方を基底型として使用する例を以下に示します：

```kotlin
// シリアライゼーションライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.*

//sampleStart
val module = SerializersModule {
    // サブクラスを登録するヘルパー関数を定義
    fun PolymorphicModuleBuilder<Project>.registerProjectSubclasses() {
        subclass(OwnedProject::class)
    }

    // 各基底型 Project および BaseProject に対して同じサブクラスを登録
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

### プロパティのポリモーフィックなシリアル化 {id="serialize-properties-polymorphically"}

インターフェースと抽象クラスは、デフォルトでポリモーフィックなシリアライゼーションを使用します。

`Any` などのシリアライズ不可能な型のプロパティをシリアル化する場合、
またはプロパティの型が `open` クラスである場合は、そのプロパティに [`@Polymorphic`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-polymorphic/) のアノテーションを付けます。

これにより、プロパティに `PolymorphicSerializer` が適用されます。

以下に例を示します：

```kotlin
// シリアライゼーションライブラリから宣言をインポート
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
    // プロパティに PolymorphicSerializer を適用
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

### open クラスのポリモーフィックなシリアル化 {id="serialize-open-classes-polymorphically"}

`open` クラスをポリモーフィックにシリアル化するには、`@Serializable` と `@Polymorphic` の両方のアノテーションを付けます：

```kotlin
// シリアライゼーションライブラリから宣言をインポート
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
// open クラスに PolymorphicSerializer を適用
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

### sealed クラスまたはインターフェースの実装の登録 {id="register-implementations-of-a-sealed-class-or-interface"}
<primary-label ref="experimental-opt-in"/>

同じ階層内で開いたポリモーフィズムと閉じたポリモーフィズムを組み合わせることができます。例えば、階層のルートが `interface` であり、さまざまなサブ階層が sealed クラスとして表現されている場合などです。
各 sealed サブクラスを個別に登録する代わりに、[`subclassesOfSealed()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/-polymorphic-module-builder/subclasses-of-sealed.html) 関数を使用して、sealed クラスまたはインターフェースのすべての実装を登録できます。

この関数は、サブクラス自体が sealed なシリアライズ可能クラスである場合、サブクラスを再帰的にも登録します。
その sealed クラスまたはインターフェースのすべてのサブクラスは、具象クラスであるか sealed であるかのいずれかでなければなりません。そうでない場合は、`IllegalArgumentException` がスローされます。

以下に例を示します：

```kotlin
@file:OptIn(ExperimentalSerializationApi::class)

// シリアライゼーションライブラリから宣言をインポート
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
        // 同じ sealed 型を指定するために subclassesOfSealed() の reified バージョンを使用
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

### ポリモーフィック階層におけるジェネリックサブタイプのシリアル化 {id="serialize-generic-subtypes-in-a-polymorphic-hierarchy"}

Kotlin シリアライゼーションは、実行時にジェネリック型パラメータの具体的な型を自動的に決定することはできません。
そのため、明示的な設定がない限り、そのパラメータに対応するシリアライザーを選択できません。

ジェネリックなポリモーフィックサブタイプに対してこの設定を行うには、明示的なシリアライザーを指定して `SerializersModule` にサブタイプを登録します。
`PolymorphicSerializer(Any::class)` が最も広いスコープを持ちますが、ジェネリックな値が取り得る具体的な型が分かっている場合は、より具体的なシリアライザーを使用できます。

> 基底型がその型引数のシリアライザーを提供している場合、コンパイラプラグインがサブタイプのシリアライザーを推論できるため、
> sealed な基底型にはこの設定は不要です。
> 
{style="note"}

以下に例を示します：

```kotlin 
// シリアライゼーションライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.*

//sampleStart
@Serializable
abstract class Response<out T>

// ジェネリックなポリモーフィックサブタイプを定義
@Serializable
@SerialName("OkResponse")
data class OkResponse<out T>(val data: T) : Response<T>()

@Serializable
abstract class Project {
    abstract val name: String
}

// ジェネリックな値として使用されるサブタイプを定義
@Serializable
@SerialName("OwnedProject")
data class OwnedProject(override val name: String, val owner: String) : Project()

// ジェネリックサブタイプを持つポリモーフィック階層用のシリアライザーを定義
val responseModule = SerializersModule {
    polymorphic(Response::class) {
        // ジェネリックサブタイプを登録
        // PolymorphicSerializer を指定するシリアライザーを使用
        subclass(OkResponse.serializer(PolymorphicSerializer(Any::class)))
    }
    polymorphic(Any::class) {
        // ジェネリックな値として使用されるサブタイプを登録
        subclass(OwnedProject::class)
    }
    polymorphic(Project::class) {
        // 静的な基底型に対して同じサブタイプを登録
        subclass(OwnedProject::class)
    }
}

// 登録されたシリアライザーを使用して Json インスタンスを作成
val format = Json { serializersModule = responseModule }

fun main() {
    // 具体的なサブタイプを持つジェネリックなポリモーフィック型を使用
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

この例では、`PolymorphicSerializer(Any::class)` により、ジェネリックサブタイプ `OkResponse` は `Any` のサブタイプとしてポリモーフィックに登録されている任意の値でシリアル化できるようになります。

### 複数の `SerializersModule` インスタンスのマージ {id="merge-multiple-serializersmodule-instances"}

アプリケーションが成長し複数のソースコードモジュールに分割されるにつれて、単一の `SerializersModule` 内ですべてのクラス階層を管理することが難しくなる場合があります。

[`plus`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/plus.html) 演算子を使用して複数の `SerializersModule` インスタンスをマージし、同じ `Json` フォーマットインスタンスで一緒に使用できるようにすることができます。

以下に例を示します：

```kotlin
// シリアライゼーションライブラリから宣言をインポート
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
// 両方の階層からの SerializersModule インスタンスをマージ
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

`SerializersModule` ブロック内でモジュールをマージするには、[`include()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/-serializers-module-builder/include.html) 関数を使用します：

```kotlin
// include() を使用して複数の SerializersModule インスタンスをマージ
val combinedModule = SerializersModule {
    include(projectModule)
    include(responseModule)
}
```

> ライブラリまたは共有モジュールの `SerializersModule` を公開すれば、利用側でそれらを自身の `SerializersModule` とマージできます。
> 
{style="tip"}

### デフォルトデシリアライザーによる未知のポリモーフィックサブタイプのデシリアル化 {id="deserialize-unknown-polymorphic-subtypes-with-a-default-deserializer"}

ポリモーフィックなデータをデシリアライズする際、Kotlin シリアライゼーションは `type` プロパティからサブタイプを解決します。
サブタイプが登録されていない場合、デシリアライズは `SerializationException` で失敗します。

登録されていない、または未知のポリモーフィックサブタイプを処理するために、デフォルトデシリアライザー（default deserializer）を定義できます。

`Project` が基底型であり、`OwnedProject` が登録されたサブタイプ、そして `BasicProject` が未知のプロジェクトサブタイプを表す次の例を見てみましょう：

```kotlin
@Serializable
abstract class Project {
    abstract val name: String
}

// 未知のプロジェクト型を表す
@Serializable
data class BasicProject(override val name: String, val type: String): Project()

@Serializable
@SerialName("OwnedProject")
data class OwnedProject(override val name: String, val owner: String) : Project()
```

`Project` の未知のポリモーフィックサブタイプを処理するには、基底型に対してデフォルトデシリアライザーを設定します。
`polymorphic()` ブロック内で [`defaultDeserializer()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/-polymorphic-module-builder/default-deserializer.html) 関数を使用して、これらの未登録サブタイプのフォールバックを定義します：

```kotlin
val module = SerializersModule {
    polymorphic(Project::class) {
        subclass(OwnedProject::class)
        defaultDeserializer { BasicProject.serializer() }
    }
}
```

この `SerializersModule` 設定を使用して、登録済みサブタイプと未登録サブタイプの両方をデシリアライズできます：

```kotlin
// シリアライゼーションライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.*

@Serializable
abstract class Project {
    abstract val name: String
}

// 未知のプロジェクト型を表す
@Serializable
data class BasicProject(override val name: String, val type: String): Project()

@Serializable
@SerialName("OwnedProject")
data class OwnedProject(override val name: String, val owner: String) : Project()

// 未知の Project サブタイプ用のデフォルトデシリアライザーを登録
val module = SerializersModule {
    polymorphic(Project::class) {
        subclass(OwnedProject::class)
        defaultDeserializer { BasicProject.serializer() }
    }
}

//sampleStart
val format = Json { serializersModule = module }

fun main() {
    // 既知の Project サブタイプと未知の Project サブタイプの両方をデシリアライズ
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

この例では、デシリアライズはサブタイプを区別するために `type` フィールドに依存せず、代わりに `BasicProject` 用にプラグインが生成したシリアライザーを使用します。
このアプローチは、未知のサブタイプが既知の構造に従っていることを前提としています。

JSON の場合、未知のサブタイプに追加のプロパティが含まれているものの、デフォルトデシリアライザーが期待する構造には一致している場合に、[未知のキーを無視する](serialization-json-configuration.md#ignore-unknown-keys)ようにフォーマットを設定することもできます。
未知の入力の構造が一定でない場合は、代わりに[カスタムシリアライザー](serialization-create-and-use-serializers.md#create-custom-serializers)を使用してください。

> デシリアライズ中の JSON 入力のより柔軟な処理については、[JSON 構造の変更](serialization-transform-json.md#modify-json-structure)を参照してください。
>
{style="tip"}

### デフォルトシリアライザーによるポリモーフィックな型のシリアル化 {id="serialize-polymorphic-types-with-a-default-serializer"}

すべての具象サブタイプを登録することなく、ポリモーフィックな基底型の値をシリアル化できます。
完全な型階層にアクセスできない場合や、型階層が頻繁に変更される場合にこれを使用します。

これを行うには：

1. `SerializersModule` ブロック内で [`polymorphicDefaultSerializer()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/-serializers-module-builder/polymorphic-default-serializer.html) 関数を使用します。
2. `polymorphicDefaultSerializer()` に、実行時の値に対する [`SerializationStrategy`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serialization-strategy/) を返すラムダを指定します。

2つの private クラス `CatImpl` と `DogImpl` を持つ例を見てみましょう。
それらの可視性を引き上げないようにするために、公開インターフェースを介して実行時型に基づいてシリアライザーを選択する、`Animal` 用のデフォルトシリアライザーを登録します：

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

// 未知の Animal サブタイプ用のデフォルトシリアライザーを登録
val module = SerializersModule {
    polymorphicDefaultSerializer(Animal::class) { instance ->
        @Suppress("UNCHECKED_CAST")
        // when ブロックを使用して適切なシリアライザーを決定
        when (instance) {
            is Cat -> CatSerializer as SerializationStrategy<Animal>
            is Dog -> DogSerializer as SerializationStrategy<Animal>
            else -> null
        }
    }
}
```

`Cat` と `Dog` のシリアライザーを定義し、次に `serializersModule` プロパティで `SerializersModule` を使用する `Json` インスタンスを作成して、`Animal` 値のポリモーフィックなシリアル化を有効にします：

```kotlin
// シリアライゼーションライブラリから宣言をインポート
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

// 未知の Animal サブタイプ用のデフォルトシリアライザーを登録
val module = SerializersModule {
    polymorphicDefaultSerializer(Animal::class) { instance ->
        @Suppress("UNCHECKED_CAST")
        // 実行時の値に基づいて when ブロックを使用して適切なシリアライザーを決定
        when (instance) {
            is Cat -> CatSerializer as SerializationStrategy<Animal>
            is Dog -> DogSerializer as SerializationStrategy<Animal>
            else -> null
        }
    }
}

//sampleStart
// カスタムシリアライザーを定義
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
    // Cat のインスタンスをシリアル化
    println(format.encodeToString<Animal>(AnimalProvider.createCat()))
    // {"type":"Cat","catType":"Tabby"}
}
//sampleEnd
```
{kotlin-runnable="true"}

## 次のステップ {id="what-s-next"}

* 生成されたシリアライザーの取得、カスタムシリアライザーの作成、およびシリアライザーの適用方法については、[シリアライザーの作成と使用](serialization-create-and-use-serializers.md)を参照してください。