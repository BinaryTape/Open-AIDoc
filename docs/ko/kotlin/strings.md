[//]: # (title: 문자열)

Kotlin의 문자열은 [`String`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/) 타입으로 표현됩니다.

> JVM에서 UTF-16 인코딩의 `String` 타입 객체는 문자당 약 2바이트를 사용합니다.
> 
{style="note"}

일반적으로 문자열 값은 큰따옴표(`"`)로 둘러싸인 문자들의 시퀀스입니다.

```kotlin
val str = "abcd 123"
```

문자열의 요소는 문자들이며, 인덱싱 연산 `s[i]`를 통해 접근할 수 있습니다.
`for` 루프를 사용하여 이 문자들을 반복(iterate)할 수 있습니다.

```kotlin
fun main() {
    val str = "abcd" 
//sampleStart
    for (c in str) {
        println(c)
    }
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

문자열은 불변(immutable)입니다. 문자열을 한 번 초기화하면 그 값을 변경하거나 새로운 값을 할당할 수 없습니다.
문자열을 변환하는 모든 연산은 원래 문자열을 수정하지 않고 새로운 `String` 객체에 그 결과를 반환합니다.

```kotlin
fun main() {
//sampleStart
    val str = "abcd"
   
    // 새로운 String 객체를 생성하고 출력합니다
    println(str.uppercase())
    // ABCD
   
    // 원래 문자열은 그대로 유지됩니다
    println(str) 
    // abcd
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

문자열을 연결하려면 `+` 연산자를 사용하세요. 표현식의 첫 번째 요소가 문자열인 경우, 다른 타입의 값과 문자열을 연결할 때도 이 연산자를 사용할 수 있습니다.

```kotlin
fun main() {
//sampleStart
    val s = "abc" + 1
    println(s + "def")
    // abc1def    
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

> 대부분의 경우 문자열 연결보다는 [문자열 템플릿](#string-templates)이나 [여러 줄 문자열](#multiline-strings)을 사용하는 것이 좋습니다.
> 
{style="note"}

## 문자열 리터럴 (String literals)

Kotlin에는 두 가지 유형의 문자열 리터럴이 있습니다.

* [이스케이프된 문자열(Escaped strings)](#escaped-strings)
* [여러 줄 문자열(Multiline strings)](#multiline-strings)

### 이스케이프된 문자열

_이스케이프된 문자열_은 이스케이프 문자를 포함할 수 있습니다.  
다음은 이스케이프된 문자열의 예입니다.

```kotlin
val s = "Hello, world!
"
```

이스케이프는 일반적인 방식인 백슬래시(`\`)를 사용하여 수행됩니다.  
지원되는 이스케이프 시퀀스 목록은 [문자(Characters)](characters.md) 페이지를 참조하세요.

### 여러 줄 문자열

_여러 줄 문자열_은 줄바꿈과 임의의 텍스트를 포함할 수 있습니다. 삼중 따옴표(`"""`)로 구분되며, 이스케이프를 지원하지 않고 줄바꿈이나 다른 모든 문자를 포함할 수 있습니다.

```kotlin
val text = """
    for (c in "foo")
        print(c)
    """
```

여러 줄 문자열에서 앞부분의 공백을 제거하려면 [`trimMargin()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/trim-margin.html) 함수를 사용하세요.

```kotlin
val text = """
    |Tell me and I forget.
    |Teach me and I remember.
    |Involve me and I learn.
    |(Benjamin Franklin)
    """.trimMargin()
```

기본적으로 파이프 기호 `|`가 여백 접두사로 사용되지만, `trimMargin(">")`과 같이 다른 문자를 선택하여 파라미터로 전달할 수 있습니다.

## 문자열 템플릿 (String templates)

문자열 리터럴은 _템플릿 표현식_을 포함할 수 있습니다. 이는 평가된 후 결과가 문자열에 결합되는 코드 조각입니다. 템플릿 표현식이 처리될 때, Kotlin은 표현식의 결과를 문자열로 변환하기 위해 자동으로 결과 객체의 `.toString()` 함수를 호출합니다. 템플릿 표현식은 달러 기호(`$`)로 시작하며 변수 이름으로 구성되거나:

```kotlin
fun main() {
//sampleStart
    val i = 10
    println("i = $i") 
    // i = 10
    
    val letters = listOf("a","b","c","d","e")
    println("Letters: $letters") 
    // Letters: [a, b, c, d, e]

//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

또는 중괄호 안의 표현식으로 구성됩니다.

```kotlin
fun main() {
//sampleStart
    val s = "abc"
    println("$s.length is ${s.length}") 
    // abc.length is 3
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

여러 줄 문자열과 이스케이프된 문자열 모두에서 템플릿을 사용할 수 있습니다. 그러나 여러 줄 문자열은 백슬래시 이스케이프를 지원하지 않습니다. 여러 줄 문자열 내에서 [식별자(identifier)](https://kotlinlang.org/grammar/#identifiers)의 시작 부분에 허용되는 기호 앞에 달러 기호(`$`)를 넣으려면 다음 구문을 사용하세요.

```kotlin
val price = """
${'$'}9.99
"""
```

> 문자열에서 `${'$'}` 시퀀스를 피하기 위해 실험적인(Experimental) [멀티 달러 문자열 보간(multi-dollar string interpolation) 기능](#multi-dollar-string-interpolation)을 사용할 수 있습니다.
>
{style="note"}

### 멀티 달러 문자열 보간 (Multi-dollar string interpolation)

멀티 달러 문자열 보간을 사용하면 보간을 트리거하는 데 필요한 연속된 달러 기호의 개수를 지정할 수 있습니다. 보간(Interpolation)은 변수나 표현식을 문자열에 직접 삽입하는 과정입니다.

단일 행 문자열의 경우 리터럴을 [이스케이프](#escaped-strings)할 수 있지만, Kotlin의 여러 줄 문자열은 백슬래시 이스케이프를 지원하지 않습니다. 달러 기호(`$`)를 리터럴 문자로 포함하려면 문자열 보간을 방지하기 위해 `${'$'}` 구조를 사용해야 합니다.
이 방식은 특히 문자열에 여러 개의 달러 기호가 포함된 경우 코드의 가독성을 떨어뜨릴 수 있습니다.

멀티 달러 문자열 보간은 단일 행 및 여러 줄 문자열 모두에서 달러 기호를 리터럴 문자로 취급할 수 있게 하여 이 과정을 단순화합니다.
예를 들면 다음과 같습니다.

```kotlin
val `KClass<*>`.jsonSchema : String
    get() = $$"""
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "$id": "https://example.com/product.schema.json",
      "$dynamicAnchor": "meta",
      "title": "$${simpleName ?: qualifiedName ?: "unknown"}",
      "type": "object"
    }
    """
```

여기서 `$$` 접두사는 문자열 보간을 트리거하기 위해 두 개의 연속된 달러 기호가 필요함을 지정합니다.
단일 달러 기호는 리터럴 문자로 남습니다.

보간을 트리거하는 달러 기호의 개수를 조정할 수 있습니다.
예를 들어, 세 개의 연속된 달러 기호(`$$$`)를 사용하면 `$`와 `$$`는 리터럴로 남겨두고 `$$$`를 통해 보간을 활성화할 수 있습니다.

```kotlin
val productName = "carrot"
val requestedData =
    $$"""{
      "currency": "$",
      "enteredAmount": "42.45 $",
      "$serviceField": "none",
      "product": "$$productName"
    }
    """

println(requestedData)
//{
//    "currency": "$",
//    "enteredAmount": "42.45 $",
//    "$serviceField": "none",
//    "product": "carrot"
//}
```

여기서 `$$` 접두사는 문자열이 이스케이프를 위한 `${'$'}` 구조 없이도 `$`와 `$`를 포함할 수 있게 합니다.

멀티 달러 문자열 보간은 단일 달러 문자열 보간을 사용하는 기존 코드에 영향을 주지 않습니다.
이전처럼 단일 `$`를 계속 사용할 수 있으며, 문자열에서 리터럴 달러 기호를 처리해야 할 때 멀티 달러 기호를 적용하면 됩니다.

## 문자열 포매팅 (String formatting)

> `String.format()` 함수를 사용한 문자열 포매팅은 Kotlin/JVM에서만 사용할 수 있습니다.
>
{style="note"}

특정 요구 사항에 맞춰 문자열의 형식을 맞추려면 [`String.format()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/format.html) 함수를 사용하세요.

`String.format()` 함수는 포맷 문자열과 하나 이상의 인자를 받습니다. 포맷 문자열에는 주어진 인자에 대한 하나의 플레이스홀더(`%`로 표시됨)와 그 뒤에 오는 포맷 지정자(format specifiers)가 포함됩니다.
포맷 지정자는 해당 인자에 대한 포매팅 지침으로, 플래그(flags), 너비(width), 정밀도(precision), 변환 타입(conversion type)으로 구성됩니다. 이러한 포맷 지정자들이 모여 출력 형식을 결정합니다. 일반적인 포맷 지정자로는 정수용 `%d`, 부동 소수점용 `%f`, 문자열용 `%s` 등이 있습니다. 또한 `argument_index$` 구문을 사용하여 포맷 문자열 내에서 동일한 인자를 서로 다른 형식으로 여러 번 참조할 수 있습니다.

> 포맷 지정자에 대한 자세한 내용과 전체 목록은 [Java의 Class Formatter 문서](https://docs.oracle.com/javase/8/docs/api/java/util/Formatter.html#summary)를 참조하세요.
>
{style="note"}

예제를 살펴보겠습니다.

```kotlin
fun main() { 
//sampleStart
    // 정수 포맷을 지정하여, 길이가 7자가 되도록 앞에 0을 추가합니다
    val integerNumber = String.format("%07d", 31416)
    println(integerNumber)
    // 0031416

    // 부동 소수점 수를 + 부호와 소수점 이하 4자리까지 표시되도록 포맷을 지정합니다
    val floatNumber = String.format("%+.4f", 3.141592)
    println(floatNumber)
    // +3.1416

    // 두 문자열을 대문자로 포맷하며, 각각 하나의 플레이스홀더를 차지합니다
    val helloString = String.format("%S %S", "hello", "world")
    println(helloString)
    // HELLO WORLD
    
    // 음수를 괄호로 감싸도록 포맷한 후, argument_index를 사용하여 동일한 숫자를 다른 형식(괄호 없이)으로 반복합니다
    val negativeNumberInParentheses = String.format("%(d means %1\$d", -31416)
    println(negativeNumberInParentheses)
    //(31416) means -31416
//sampleEnd    
}
```
{interpolate-variables="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

`String.format()` 함수는 문자열 템플릿과 유사한 기능을 제공합니다. 그러나 `String.format()` 함수는 더 많은 포매팅 옵션을 사용할 수 있기 때문에 활용도가 더 높습니다.

또한 포맷 문자열을 변수에서 할당할 수 있습니다. 이는 사용자 로케일에 따라 포맷 문자열이 변경되는 로컬라이제이션(localization) 사례 등에서 유용할 수 있습니다.

`String.format()` 함수를 사용할 때는 인자의 개수나 위치가 해당 플레이스홀더와 일치하지 않기 쉬우므로 주의해야 합니다.