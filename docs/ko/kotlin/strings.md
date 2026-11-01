[//]: # (title: 문자열)
[//]: # (description: 문자열 리터럴, 문자열 템플릿, 여러 줄 문자열, 일반적인 텍스트 연산 등 Kotlin에서 문자열을 다루는 방법을 알아봅니다.)

[`String`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/) 타입은 [문자](characters.md)의 시퀀스를 나타냅니다. 단어, 문장, 메시지 또는 구조화된 텍스트와 같은 텍스트 값에 사용할 수 있습니다.

`String` 타입은 불변(immutable)입니다. `String` 객체를 생성한 후에는 해당 객체의 수명 동안 내용이 그대로 유지됩니다. 문자열을 수정하는 것처럼 보이는 모든 연산은 실제로는 새로운 문자열을 생성합니다.

## 문자열 선언 {id="declare-strings"}

`String` 리터럴을 선언하려면 값을 큰따옴표(`""`)로 묶습니다. `String` 타입을 명시적으로 지정하거나 Kotlin이 값으로부터 타입을 추론하도록 할 수 있습니다.

```kotlin
val name: String = "Kotlin"
val message = "Hello, world!" // Kotlin이 String으로 추론함
```

큰따옴표로 묶인 문자열 리터럴은 `\n` 또는 `\t`와 같은 [이스케이프 시퀀스(escape sequences)](characters.md#escape-sequences)를 지원합니다.

```kotlin
val message = "Hello,\nworld!"
val quote = "Kotlin says, \"Hi\"."
```

### 여러 줄 문자열 {id="multiline-strings"}

여러 줄로 구성된 텍스트를 저장하거나 이스케이프하고 싶지 않은 따옴표가 포함된 경우, 삼중 따옴표(`""" """`)로 묶인 여러 줄 문자열(multiline string)을 사용하세요.

```kotlin
val text = """
Hello,
Kotlin
"""

val quote = """Kotlin says, "Hi"."""
```

> 여러 줄 문자열은 이스케이프 시퀀스를 지원하지 않습니다.
> Kotlin은 이러한 문자를 일반 텍스트로 처리합니다.
>
{style="note"}

여러 줄 문자열은 소스 코드에 작성된 줄 바꿈과 들여쓰기를 그대로 보존합니다.
이 동작은 런타임 값이 파일의 텍스트 레이아웃과 일치하기를 원할 때 유용합니다.

다음 예제에서 각 줄 앞의 공백은 결과 문자열의 일부가 됩니다.

```kotlin
val text = """
    Hello,
    Kotlin
"""
```

공통으로 들어간 선행 들여쓰기를 제거하려면 [`trimIndent()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/trim-indent.html) 함수를 사용하세요. 이 함수는 비어 있지 않은 줄들의 공통 최소 들여쓰기를 감지하여 제거합니다.

```kotlin
fun main() {
//sampleStart
    val text = """
        Hello,
        Kotlin
    """.trimIndent()
    
    println(text)
//sampleEnd
}
```
{kotlin-runnable="true"}

들여쓰기 제거를 더 명시적으로 제어하려면 [`trimMargin()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/trim-margin.html) 함수를 사용하세요. 이 함수는 각 줄의 마진 접두사(margin prefix)와 그 앞의 모든 것을 제거합니다.

```kotlin
fun main() {
//sampleStart
    val text = """
        |Hello,
        |Kotlin
    """.trimMargin()
    
    println(text)
//sampleEnd
}
```
{kotlin-runnable="true"}

기본적으로 `trimMargin()` 함수는 파이프 기호(`|`)를 마진 접두사로 사용하지만, 다른 문자를 매개변수로 전달할 수도 있습니다. 예: `trimMargin(">")`.

> `trimIndent()` 또는 `trimMargin()`과 같은 함수로 문자열을 처리할 때, 결과 문자열은 플랫폼에 관계없이 줄 바꿈 구분자로 개행 문자(`\n`)만을 사용합니다.
>
{style="note"}

## 문자열 템플릿 {id="string-templates"}

문자열 템플릿(String templates)을 사용하면 `String` 리터럴 내에 변수와 표현식을 직접 삽입할 수 있습니다.
이 과정을 _문자열 보간(interpolation)_이라고 합니다. 일반 문자열과 여러 줄 문자열 모두에서 문자열 템플릿을 사용할 수 있습니다.

문자열에 변수를 삽입하려면 `$` 기호를 사용합니다.

```kotlin
fun main() { 
//sampleStart
    val name = "Kotlin"
    println("Hello, $name") 
    // Hello, Kotlin
//sampleEnd
}
```
{kotlin-runnable="true"}

문자열에 표현식을 삽입하거나 변수를 다른 텍스트 바로 옆에 붙여 사용하려면 `${}`를 사용합니다.

```kotlin
fun main() {
//sampleStart
    val text = "abc"
    println("The length of $text is ${text.length}")
    // The length of abc is 3
      
    val language = "Kotlin"
    println("${language}Lang")
    // KotlinLang
//sampleEnd
}
```
{kotlin-runnable="true"}

> `+` 연산자로 문자열을 결합할 수도 있습니다. 하지만 문자열 템플릿이 대개 읽기 더 쉽고 더 관용적(idiomatic)입니다.
>
{style="tip"}

템플릿 표현식 내부에는 이스케이프 없이 큰따옴표로 묶인 문자열을 포함할 수도 있습니다.

```kotlin
// 큰따옴표 문자열
val test = "${"test".uppercase()}"

// 여러 줄 문자열
val result = """
Result: ${"OK".lowercase()}
"""
```

### 문자열 템플릿의 널 가능 값 {id="nullable-values-in-string-templates"}

보간된 표현식이나 변수가 `null`로 평가되면, Kotlin 컴파일러는 결과 문자열에 `null`이라는 텍스트를 삽입합니다. `null`을 다른 값으로 대체하려면 [엘비스 연산자(Elvis operator)](null-safety.md#elvis-operator)(`?:`)를 사용하세요.

```kotlin 
fun main(){
//sampleStart
    val text: String? = null
  
    println("Hello, $text")
    // Hello, null

    println("Hello, ${text ?: "Kotlin"}")
    // Hello, Kotlin
//sampleEnd
}
```
{kotlin-runnable="true"}

### 멀티 달러 문자열 보간 {id="multi-dollar-string-interpolation"}

일반적인 문자열 템플릿에서는 단일 달러 기호(`$`)로 보간이 시작됩니다. 문자열에 리터럴 달러 기호를 포함해야 하는 경우, **멀티 달러 문자열 보간(multi-dollar string interpolation)**을 사용하세요.

멀티 달러 문자열 보간을 사용하면 보간을 트리거하는 데 필요한 연속된 달러 기호의 개수를 지정할 수 있습니다. 해당 개수보다 적은 달러 기호는 일반 리터럴 문자로 취급됩니다.

예를 들어, 문자열 리터럴 앞에 `$$`를 사용하면 연속된 두 개의 달러 기호가 있어야만 보간이 시작됩니다.

```kotlin
val KClass<*>.jsonSchema : String
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

> 단일 달러 문자열 보간을 사용하는 경우, 멀티 달러 문자열 보간은 기존 코드에 영향을 주지 않습니다.
> 계속 단일 `$`를 사용할 수 있으며 필요한 경우에만 여러 개의 달러 기호를 적용하면 됩니다.
>
{style="tip"}

## 기본적인 문자열 연산 {id="basic-string-operations"}

Kotlin은 문자열 작업을 위한 다양한 연산을 제공합니다. 이 섹션에서는 가장 일반적으로 사용되는 몇 가지 연산을 소개합니다.

> 사용 가능한 모든 함수에 대한 자세한 내용은
> [API 레퍼런스](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/)를 참조하세요.
>
{style="tip"}

### 문자열 길이 가져오기 {id="get-string-length"}

문자열의 문자 수를 가져오려면 [`length`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/length.html) 프로퍼티를 사용합니다.

```kotlin 
fun main (){
//sampleStart
    val language = "Kotlin"
    println(language.length)
    // 6
//sampleEnd
}
```
{kotlin-runnable="true"}

### 문자에 접근하기 {id="access-characters"}

인덱싱 연산자(`[]`)를 사용하여 문자열 내의 개별 문자에 접근할 수 있습니다.

```kotlin 
fun main (){
//sampleStart
    val language = "Kotlin"
    
    println(language[0])
    // K
    println(language[5])
    // n
//sampleEnd
}
```
{kotlin-runnable="true"}

> 문자열 인덱스는 0부터 시작합니다.
> 유효한 범위를 벗어난 인덱스에 접근하려고 하면 Kotlin에서 예외가 발생합니다.
>
{style="tip"}

문자열의 문자들을 순회(iterate)할 수도 있습니다.

```kotlin
fun main(){
//sampleStart
    for (char in "Kotlin") {
      println(char)
    }
//sampleEnd    
}
```
{kotlin-runnable="true"}

### 문자열의 일부분 추출하기 {id="extract-parts-of-a-string"}

문자열의 일부분을 추출하려면 다음 함수 중 하나를 사용하세요.

* [`substring()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/substring.html): 원본 텍스트의 선택된 부분을 새 문자열로 반환합니다.
* [`subSequence()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/sub-sequence.html): 원본 텍스트의 선택된 부분을 `CharSequence`로 반환합니다.

예를 들면 다음과 같습니다.

```kotlin
fun main() {
//sampleStart    
    val text = "Kotlin"
    println(text.substring(1))
    // otlin
    println(text.substring(1, 5))
    // otli
    println(text.subSequence(1, 5))
    // otli
//sampleEnd
}
```
{kotlin-runnable="true"}

`String` 타입은 불변이므로 이러한 함수는 원본 문자열을 수정하지 않습니다.

### 문자열 비교하기 {id="compare-strings"}

`==` 연산자를 사용하여 두 문자열의 내용이 같은지 확인할 수 있습니다.

```kotlin
fun main(){
//sampleStart
    println("kotlin" == "kotlin")
    // true
  
    println("kotlin" == "Kotlin")
    // false
//sampleEnd    
}
```
{kotlin-runnable="true"}

[`compareTo()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/compare-to.html) 함수를 사용하여 사전순(문자 단위)으로 문자열을 비교할 수도 있습니다. 이 함수는 처음으로 일치하지 않는 문자 쌍을 찾을 때까지 두 문자열을 검색하고 다음을 반환합니다.

* 두 문자열이 같으면 `0`.
* 수신 객체(receiver)가 인자보다 작으면 `0`보다 작은 값.
* 수신 객체가 인자보다 크면 `0`보다 큰 값.

```kotlin
fun main() {
//sampleStart    
    println("abc".compareTo("abd") < 0)
    // true
    
    println("abc".compareTo("ABC") > 0)
    // true
    
    // 대소문자 차이를 무시하려면 true를 전달
    println("abc".compareTo("ABC", ignoreCase = true) == 0)
    // true
//sampleEnd  
}
```
{kotlin-runnable="true"}

### 문자열 내용 다루기 {id="work-with-string-content"}

문자열의 내용을 변경하고 싶다면 [`.trim()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/trim.html), [`.replace()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/replace.html), [`.uppercase()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/uppercase.html), [`.lowercase()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/lowercase.html)와 같은 함수를 사용하여 수정된 복사본을 생성하세요.

```kotlin
fun main() {
//sampleStart
    val text = "  Hello, Kotlin  "

    println(text.trim())
    // Hello, Kotlin

    println(text.replace("Kotlin", "world"))
    //   Hello, world  

    println(text.uppercase())
    //   HELLO, KOTLIN  

    println(text.lowercase())
    //   hello, kotlin  
//sampleEnd    
}
```
{kotlin-runnable="true"}

또한 [`contains()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/contains.html), [`startsWith()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/starts-with.html), [`endsWith()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/ends-with.html) 함수를 사용하여 문자열 내용을 검사할 수 있습니다.

```kotlin
fun main() { 
//sampleStart
    val domain = "kotlinlang.org"
    
    // 문자열에 "."이 포함되어 있는지 확인
    println(domain.contains("."))
    // true
    
    // 문자열이 "kotlin"으로 시작하는지 확인
    println(domain.startsWith("kotlin"))
    // true
    
    // 문자열이 ".org"로 끝나는지 확인
    println(domain.endsWith(".org"))
    // true
//sampleEnd
}
 ```
{kotlin-runnable="true"}

### 문자열 분할하기 {id="split-strings"}

[`split()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/split.html) 함수를 사용하여 구분자를 기준으로 문자열을 여러 부분으로 나눌 수 있습니다.

```kotlin
fun main() { 
//sampleStart
    val numbers = "one, two, three"
    println(numbers.split(", "))
    // [one, two, three]
//sampleEnd
}
```
{kotlin-runnable="true"}

문자열을 개별 줄로 분할하려면 [`lines()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/lines.html) 함수를 사용하세요.

```kotlin
fun main() { 
//sampleStart
    val numbers = "one\ntwo\nthree"
    println(numbers.lines())
    // [one, two, three]
//sampleEnd
}
```
{kotlin-runnable="true"}

### 문자열 구성 및 포맷팅 {id="build-and-format-strings"}

> Kotlin의 대부분의 포맷팅 작업에는 [문자열 템플릿](#string-templates)을 사용하세요.
>
{style="tip"}

`+` 연산자로 문자열을 연결하면 Kotlin은 각 연산마다 새로운 `String` 객체를 생성합니다. 그러나 이러한 방식은 루프 내부이거나 여러 조각을 합칠 때 비효율적일 수 있습니다. 이러한 문제를 피하려면 `buildString()` 함수나 `StringBuilder`를 사용할 수 있습니다. 이들은 모든 조각을 단일 가변 버퍼에 수집하고 마지막에 단 하나의 문자열만 생성합니다.

추가할 내용을 결정하는 로직이 복잡할 때는 [`buildString()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/build-string.html) 함수를 사용하세요. 예를 들어 서로 다른 조각을 추가하는 여러 조건문이 있는 경우입니다. `buildString()`을 사용하면 버퍼를 직접 다룰 필요가 없습니다. 이 함수가 내부적으로 `StringBuilder`를 생성하고, 블록을 실행한 후, 결과 문자열을 반환합니다.

```kotlin
fun main() {
//sampleStart

    val hasErrors = true
    val hasWarnings = true
    val isComplete = false
    
    // buildString이 빈 버퍼를 생성함
    val status = buildString {
        // 버퍼에 "Errors found" 추가
        if (hasErrors) append("Errors found")
        if (hasWarnings) {
            // 버퍼가 비어 있지 않으므로 "; " 추가
            if (isNotEmpty()) append("; ")
            // "Warnings found" 추가
            append("Warnings found")
        }
        // isComplete = false이므로 아무것도 추가하지 않음
        if (isComplete) {
            if (isNotEmpty()) append("; ")
            append("Completed")
        }
        // 버퍼가 비어 있지 않으므로 대체 텍스트(fallback)를 건너뜀
        if (isEmpty()) append("OK")
    }
    
    println(status)
    // Errors found; Warnings found
//sampleEnd
}
```
{kotlin-runnable="true"}

버퍼를 명시적인 값으로 다뤄야 할 때는 [`StringBuilder`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/-string-builder/)를 사용하세요. 예를 들어 기존 텍스트를 수정해야 하는 경우입니다.

```kotlin
fun main() {
//sampleStart
    val text = "Hello, Kotlin"
    val builder = StringBuilder(text)

    builder.replace(7, 13, "world")
    println(builder.toString()) 
    // Hello, world
//sampleEnd
}
```
{kotlin-runnable="true"}

JVM에서는 [`String.format()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/format.html) 함수를 사용하여 문자열을 포맷팅할 수도 있습니다.

```kotlin
val text = String.format("Hello, %s", "Kotlin") 
```  

> JVM에서 포맷터 스타일의 지정자(specifier)가 특별히 필요한 경우에만 `String.format()` 함수를 사용하세요.
> 포맷 지정자에 대한 자세한 내용은 [Java Formatter 클래스 문서](https://docs.oracle.com/javase/8/docs/api/java/util/Formatter.html#summary)를 참조하세요.
>
{style="note"}

## 문자열 변환 {id="string-conversion"}

숫자, `Boolean` 값 또는 입력받은 식별자와 같은 다른 타입의 값을 표현하기 위해 문자열을 사용하는 경우가 많습니다.
Kotlin은 값을 문자열로 변환하고 문자열을 다른 타입으로 파싱하는 함수들을 제공합니다.

값의 문자열 표현을 반환하려면 [`toString()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/to-string.html) 함수를 사용하세요.

```kotlin
val number = 10
val text = number.toString()
```

문자열 템플릿과 문자열 연결에서 Kotlin은 값을 자동으로 문자열로 변환합니다.

문자열을 다른 타입으로 변환하려면 해당하는 파싱 함수를 사용하세요.

* 정수 값: [`toByte()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-byte.html), [`toShort()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-short.html), [`toInt()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-int.html), [`toLong()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-long.html)
* 부동 소수점 값: [`toDouble()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-double.html), [`toFloat()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-float.html)
* 불리언: [`toBoolean()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-boolean.html), [`toBooleanStrict()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-boolean-strict.html)

문자열이 올바른 형식인 경우 이 함수들은 요청된 타입의 값을 반환합니다.
입력값이 유효하지 않을 가능성이 있다면 `OrNull` 변형을 사용하세요. 이 함수들은 예외를 던지는 대신 `null`을 반환하므로 사용자 입력이나 완전히 제어할 수 없는 데이터를 다룰 때 안전합니다.

```kotlin
val toInt = "10".toInt() // 10

// 1000000000000은 Int의 최댓값을 초과함
val toIntInvalid = "1000000000000".toIntOrNull()

val toBoolean = "true".toBooleanStrict() // true
val toBooleanInvalid = "yes".toBooleanStrictOrNull() // null
```