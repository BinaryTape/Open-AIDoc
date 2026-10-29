[//]: # (title: Java와 Kotlin의 Null 가능성(Nullability))

<web-summary>Java의 nullable 구문을 Kotlin으로 마이그레이션하는 방법을 알아봅니다. 이 가이드는 Kotlin의 nullable 타입 지원, Kotlin이 Java의 nullable 어노테이션을 처리하는 방법 등을 다룹니다.</web-summary>

*Null 가능성(Nullability)*은 변수가 `null` 값을 가질 수 있는 능력을 말합니다.
변수에 `null`이 포함되어 있을 때 변수를 역참조(dereference)하려고 시도하면 `NullPointerException`이 발생합니다.
Null 포인터 예외가 발생할 확률을 최소화하기 위해 코드를 작성하는 방법은 여러 가지가 있습니다.

이 가이드는 null일 가능성이 있는 변수를 처리하는 Java와 Kotlin의 접근 방식 차이점을 다룹니다.
이를 통해 Java에서 Kotlin으로 마이그레이션하고 Kotlin다운(authentic) 스타일로 코드를 작성하는 데 도움을 줄 것입니다.

가이드의 첫 번째 부분에서는 가장 중요한 차이점인 Kotlin의 nullable 타입 지원과 Kotlin이 [Java 코드의 타입](#platform-types)을 처리하는 방식을 다룹니다. [함수 호출 결과 확인](#checking-the-result-of-a-function-call)부터 시작되는 두 번째 부분에서는 몇 가지 구체적인 사례를 살펴보며 구체적인 차이점을 설명합니다.

[Kotlin의 null 안전성에 대해 더 알아보기](null-safety.md).

## Nullable 타입 지원 {id="support-for-nullable-types"}

Kotlin과 Java 타입 시스템의 가장 중요한 차이점은 Kotlin의 명시적인 [nullable 타입](null-safety.md) 지원입니다.
이는 어떤 변수가 `null` 값을 가질 수 있는지 표시하는 방법입니다.
변수가 `null`이 될 수 있다면, 해당 변수에서 메서드를 호출하는 것은 `NullPointerException`을 유발할 수 있으므로 안전하지 않습니다.
Kotlin은 컴파일 시점에 이러한 호출을 금지하여 수많은 잠재적 예외를 방지합니다.
런타임에 nullable 타입의 객체와 non-nullable 타입의 객체는 동일하게 처리됩니다.
nullable 타입은 non-nullable 타입을 감싸는 래퍼(wrapper)가 아닙니다. 모든 검사는 컴파일 시점에 수행됩니다.
즉, Kotlin에서 nullable 타입을 사용하는 데 따른 런타임 오버헤드는 거의 없습니다.

> "거의"라고 말한 이유는 [내재적(intrinsic)](https://en.wikipedia.org/wiki/Intrinsic_function) 체크가 생성되기는 하지만, 그 오버헤드가 미미하기 때문입니다.
>
{style="note"}

Java에서는 null 체크를 작성하지 않으면 메서드에서 `NullPointerException`이 발생할 수 있습니다.

```java
// Java
int stringLength(String a) {
    return a.length();
}

void main() {
    stringLength(null); // `NullPointerException` 발생
}
```
{id="get-length-of-null-java"}

이 호출은 다음과 같은 출력을 생성합니다.

```java
java.lang.NullPointerException: Cannot invoke "String.length()" because "a" is null
    at test.java.Nullability.stringLength(Nullability.java:8)
    at test.java.Nullability.main(Nullability.java:12)
    at java.base/java.util.ArrayList.forEach(ArrayList.java:1511)
    at java.base/java.util.ArrayList.forEach(ArrayList.java:1511)
```

Kotlin에서 모든 일반 타입은 명시적으로 nullable로 표시하지 않는 한 기본적으로 non-nullable입니다.
`a`가 `null`이 아닐 것으로 예상한다면, `stringLength()` 함수를 다음과 같이 선언하세요.

```kotlin
// Kotlin
fun stringLength(a: String) = a.length
```
{id="get-length-kotlin"}

매개변수 `a`는 `String` 타입을 가지며, 이는 Kotlin에서 항상 `String` 인스턴스를 포함해야 하고 `null`을 포함할 수 없음을 의미합니다.
Kotlin에서 nullable 타입은 물음표 `?`를 붙여 표시합니다(예: `String?`).
컴파일러가 `stringLength()`의 모든 인자가 `null`이 아니어야 한다는 규칙을 강제하기 때문에, `a`가 `String`인 경우 런타임에 `NullPointerException`이 발생하는 상황은 불가능합니다.

`stringLength(a: String)` 함수에 `null` 값을 전달하려고 시도하면 "Null can not be a value of a non-null type String"이라는 컴파일 오류가 발생합니다.

![함수에 null 전달 시 발생하는 non-nullable 오류](passing-null-to-function.png){width=700}

`null`을 포함한 모든 인자와 함께 이 함수를 사용하려면, 인자 타입 뒤에 물음표를 붙여 `String?`로 사용하고, 함수 본문 안에서 인자 값이 `null`이 아닌지 확인해야 합니다.

```kotlin
// Kotlin
fun stringLength(a: String?): Int = if (a != null) a.length else 0
```
{id="get-length-of-null-kotlin"}

체크를 성공적으로 통과하면, 컴파일러는 해당 체크가 수행된 범위 내에서 변수를 non-nullable 타입인 `String`인 것처럼 처리합니다.

이 체크를 수행하지 않으면 코드는 "Only [safe (?.)](null-safety.md#safe-call-operator) or [non-nullable asserted (!!.) calls](null-safety.md#not-null-assertion-operator) are allowed on a [nullable receiver](extensions.md#nullable-receivers) of type String?"라는 메시지와 함께 컴파일에 실패합니다.

null 체크와 메서드 호출을 하나의 연산으로 결합할 수 있게 해주는 [안전한 호출 연산자 ?. (If-not-null 축약형)](idioms.md#if-not-null-shorthand)를 사용하여 더 짧게 작성할 수 있습니다.

```kotlin
// Kotlin
fun stringLength(a: String?): Int = a?.length ?: 0
```
{id="get-length-of-null-shorter-kotlin"}

## 플랫폼 타입 {id="platform-types"}

Java에서는 변수가 `null`이 될 수 있는지 여부를 보여주는 어노테이션을 사용할 수 있습니다.
이러한 어노테이션은 표준 라이브러리의 일부는 아니지만 별도로 추가할 수 있습니다.
예를 들어, JetBrains 어노테이션인 `@Nullable` 및 `@NotNull`(`org.jetbrains.annotations` 패키지), [JSpecify](https://jspecify.dev/)의 어노테이션(`org.jspecify.annotations`), 또는 Eclipse의 어노테이션(`org.eclipse.jdt.annotation`)을 사용할 수 있습니다.
Kotlin은 [Kotlin 코드에서 Java 코드를 호출할 때](java-interop.md#nullability-annotations) 이러한 어노테이션을 인식하고 어노테이션에 따라 타입을 처리합니다.

Java 코드에 이러한 어노테이션이 없는 경우, Kotlin은 Java 타입을 *플랫폼 타입(platform types)*으로 취급합니다.
하지만 Kotlin은 이러한 타입에 대한 null 가능성 정보를 가지고 있지 않기 때문에 컴파일러는 해당 타입에 대한 모든 연산을 허용합니다.
다음과 같은 이유로 직접 null 체크 수행 여부를 결정해야 합니다.

* Java와 마찬가지로, `null`에 대해 연산을 수행하려고 하면 `NullPointerException`이 발생합니다.
* 컴파일러는 non-nullable 타입의 값에 대해 null 안전 연산을 수행할 때 평소에 보여주던 중복된 null 체크 강조 표시를 하지 않습니다.

[null 안전성 및 플랫폼 타입과 관련하여 Java를 Kotlin에서 호출하는 방법](java-interop.md#null-safety-and-platform-types)에 대해 더 자세히 알아보세요.

## 확실히 null이 아닌 타입 지원 {id="support-for-definitely-non-nullable-types"}

Kotlin에서 `@NotNull`이 인자로 포함된 Java 메서드를 오버라이드하려면 Kotlin의 확실히 null이 아닌 타입(definitely non-nullable types)이 필요합니다.

예를 들어, Java의 이 `load()` 메서드를 살펴보세요.

```java
import org.jetbrains.annotations.*;

public interface Game<T> {
  public T save(T x) {}
  @NotNull
  public T load(@NotNull T x) {}
}
```

Kotlin에서 `load()` 메서드를 성공적으로 오버라이드하려면, `T1`을 확실히 null이 아닌 타입(`T1 & Any`)으로 선언해야 합니다.

```kotlin
interface ArcadeGame<T1> : Game<T1> {
  override fun save(x: T1): T1
  // T1은 확실히 null이 아님(definitely non-nullable)
  override fun load(x: T1 & Any): T1 & Any
}
```

[확실히 null이 아닌 제네릭 타입](generics.md#definitely-non-nullable-types)에 대해 더 자세히 알아보세요.

## 함수 호출 결과 확인 {id="checking-the-result-of-a-function-call"}

null 체크가 필요한 가장 흔한 상황 중 하나는 함수 호출로부터 결과를 얻었을 때입니다.

다음 예제에는 `Order`와 `Customer` 두 클래스가 있습니다. `Order`는 `Customer` 인스턴스에 대한 참조를 가집니다.
`findOrder()` 함수는 `Order` 클래스의 인스턴스를 반환하거나, 주문을 찾을 수 없는 경우 `null`을 반환합니다.
목표는 가져온 주문의 고객 인스턴스를 처리하는 것입니다.

다음은 Java 클래스입니다.

```java
//Java
record Order (Customer customer) {}

record Customer (String name) {}
```

Java에서는 함수를 호출하고 결과에 대해 if-not-null 체크를 수행하여 필요한 프로퍼티의 역참조를 진행합니다.

```java
// Java
Order order = findOrder();

if (order != null) {
    processCustomer(order.getCustomer());
}
```
{id="process-customer-if-not-null-java"}

위의 Java 코드를 Kotlin 코드로 직접 변환하면 다음과 같습니다.

```kotlin
// Kotlin
data class Order(val customer: Customer)

data class Customer(val name: String)

val order = findOrder()

// 직접 변환
if (order != null){
    processCustomer(order.customer)
}
```
{id="process-customer-if-not-null-kotlin"}

[안전한 호출 연산자 `?.` (If-not-null 축약형)](idioms.md#if-not-null-shorthand)를 표준 라이브러리의 [범위 함수(scope functions)](scope-functions.md)와 함께 사용하세요.
보통 `let` 함수가 이 용도로 사용됩니다.

```kotlin
// Kotlin
val order = findOrder()

order?.let {
    processCustomer(it.customer)
}
```
{id="process-customer-with-let-kotlin"}

다음은 같은 코드의 더 짧은 버전입니다.

```kotlin
// Kotlin
findOrder()?.customer?.let(::processCustomer)
```
{id="process-customer-with-let-short-kotlin"}

## null 대신 기본값 사용 {id="default-values-instead-of-null"}

null 체크는 null 체크가 성공했을 때 [기본값을 설정](functions.md#parameters-with-default-values)하는 것과 결합하여 자주 사용됩니다.

null 체크가 포함된 Java 코드입니다.

```java
// Java
Order order = findOrder();
if (order == null) {
    order = new Order(new Customer("Antonio"))
}
```
{id="default-value-instead-of-null-java"}

Kotlin에서 이를 표현하려면 [엘비스 연산자 (If-not-null-else 축약형)](null-safety.md#elvis-operator)를 사용하세요.

```kotlin
// Kotlin
val order = findOrder() ?: Order(Customer("Antonio"))
```
{id="default-value-instead-of-null-kotlin"}

## 값 또는 null을 반환하는 함수 {id="functions-returning-a-value-or-null"}

Java에서는 리스트 요소를 다룰 때 주의해야 합니다. 요소를 사용하려고 시도하기 전에 항상 해당 인덱스에 요소가 존재하는지 확인해야 합니다.

```java
// Java
var numbers = new ArrayList<Integer>();
numbers.add(1);
numbers.add(2);

System.out.println(numbers.get(0));
//numbers.get(5) // 예외 발생!
```
{id="functions-returning-null-java"}

Kotlin 표준 라이브러리는 이름에서 `null` 값을 반환할 가능성이 있는지 알 수 있는 함수들을 자주 제공합니다. 이는 특히 컬렉션 API에서 흔히 볼 수 있습니다.

```kotlin
fun main() {
//sampleStart
    // Kotlin
    // Java와 동일한 코드:
    val numbers = listOf(1, 2)
    
    println(numbers[0])  // 컬렉션이 비어 있으면 IndexOutOfBoundsException이 발생할 수 있음
    //numbers.get(5)     // 예외 발생!

    // 더 많은 기능:
    println(numbers.firstOrNull())
    println(numbers.getOrNull(5)) // null
//sampleEnd
}
```
{kotlin-runnable="true" id="functions-returning-null-kotlin"}

## 집계 연산 {id="aggregate-operations"}

가장 큰 요소를 가져오거나 요소가 없는 경우 `null`을 가져와야 할 때, Java에서는 [Stream API](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/package-summary.html)를 사용합니다.

```java
// Java
var numbers = new ArrayList<Integer>();
var max = numbers.stream().max(Comparator.naturalOrder()).orElse(null);
System.out.println("Max: " + max);
```
{id="aggregate-functions-java"}

Kotlin에서는 [집계 연산(aggregate operations)](collection-aggregate.md)을 사용합니다.

```kotlin
// Kotlin
val numbers = listOf<Int>()
println("Max: ${numbers.maxOrNull()}")
```
{id="aggregate-functions-kotlin"}

[Java와 Kotlin의 컬렉션](java-to-kotlin-collections-guide.md)에 대해 더 자세히 알아보세요.

## 안전한 타입 캐스팅 {id="casting-types-safely"}

안전하게 타입을 캐스팅해야 할 때, Java에서는 `instanceof` 연산자를 사용한 다음 그것이 잘 작동했는지 확인합니다.

```java
// Java
int getStringLength(Object y) {
    return y instanceof String x ? x.length() : -1;
}

void main() {
    System.out.println(getStringLength(1)); // `-1` 출력
}
```
{id="casting-types-java"}

Kotlin에서 예외를 피하려면 실패 시 `null`을 반환하는 [안전한 캐스트 연산자](typecasts.md#unsafe-cast-operator) `as?`를 사용하세요.

```kotlin
// Kotlin
fun main() {
    println(getStringLength(1)) // `-1` 출력
}

fun getStringLength(y: Any): Int {
    val x: String? = y as? String // null
    return x?.length ?: -1 // x가 null이므로 -1 반환
}
```
{kotlin-runnable="true" id="casting-types-kotlin"}

> 위의 Java 예제에서 `getStringLength()` 함수는 기본 타입인 `int` 결과를 반환합니다.
`null`을 반환하게 하려면 [_박싱된(boxed)_ 타입](https://docs.oracle.com/javase/tutorial/java/data/autoboxing.html)인 `Integer`를 사용할 수 있습니다.
그러나 이러한 함수가 음수 값을 반환하도록 만들고 그 값을 확인하는 것이 더 자원 효율적입니다. 어차피 체크는 수행해야 하지만, 이 방식으로는 추가적인 박싱이 수행되지 않기 때문입니다.
>
{style="note"}

Java 코드를 Kotlin으로 마이그레이션할 때, 초기에는 코드의 원래 의미를 유지하기 위해 nullable 타입과 함께 일반 캐스트 연산자 `as`를 사용하고 싶을 수 있습니다. 하지만 더 안전하고 관용적인 접근 방식을 위해 안전한 캐스트 연산자 `as?`를 사용하도록 코드를 조정하는 것을 권장합니다. 예를 들어, 다음과 같은 Java 코드가 있다고 가정해 보겠습니다.

```java
public class UserProfile {
    Object data;

    public static String getUsername(UserProfile profile) {
        if (profile == null) {
            return null;
        }
        return (String) profile.data;
    }
}
```

이를 `as` 연산자를 사용하여 직접 마이그레이션하면 다음과 같습니다.

```kotlin
class UserProfile(var data: Any? = null)

fun getUsername(profile: UserProfile?): String? {
    if (profile == null) {
        return null
    }
    return profile.data as String?
}
```

여기서 `profile.data`는 `as String?`을 사용하여 nullable 문자열로 캐스팅됩니다.

우리는 여기서 한 걸음 더 나아가 `as? String`을 사용하여 안전하게 값을 캐스팅하는 것을 권장합니다. 이 접근 방식은 실패 시 `ClassCastException`을 던지는 대신 `null`을 반환합니다.

```kotlin
class UserProfile(var data: Any? = null)

fun getUsername(profile: UserProfile?): String? =
  profile?.data as? String
```

이 버전은 `if` 식을 [안전한 호출 연산자](null-safety.md#safe-call-operator) `?.`로 대체하여, 캐스팅을 시도하기 전에 데이터 프로퍼티에 안전하게 접근합니다.

## 다음 단계는 무엇인가요? {id="what-s-next"}

* 다른 [Kotlin 관용구(idioms)](idioms.md)를 살펴보세요.
* [Java-to-Kotlin (J2K) 컨버터](mixing-java-kotlin-intellij.md#convert-java-files-to-kotlin)를 사용하여 기존 Java 코드를 Kotlin으로 변환하는 방법을 배워보세요.
* 다른 마이그레이션 가이드를 확인해 보세요:
  * [Java와 Kotlin의 문자열](java-to-kotlin-idioms-strings.md)
  * [Java와 Kotlin의 컬렉션](java-to-kotlin-collections-guide.md)

좋아하는 관용구가 있다면 풀 리퀘스트를 보내 저희와 공유해 주세요!