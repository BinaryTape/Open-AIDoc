[//]: # (title: 문자)
[//]: # (description: 구문, 유니코드 지원, 이스케이프 시퀀스, 문자에 대한 일반적인 연산을 포함하여 Kotlin에서 Char 타입을 사용하는 방법을 알아봅니다.)

[`Char`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-char/) 타입은 단일 문자를 UTF-16 코드 유닛으로 나타냅니다.

문자, 숫자, 문장 부호 또는 공백과 같은 개별 문자 값에는 `Char`를 사용하세요. 여러 문자로 이루어진 문자열에는 [`String`](strings.md)을 사용합니다.

> `Char`는 숫자 타입이 아니지만, 각 문자에는 접근할 수 있는 숫자 형태의 유니코드 값이 있습니다.
> 자세한 내용은 [](#character-conversion)을 참고하세요.
> 
{style="tip"}

## 구문 {id="syntax"}

문자를 선언하려면 값을 작은따옴표(`' '`)로 감쌉니다. `Char` 타입을 명시적으로 지정하거나 Kotlin이 값으로부터 타입을 추론하도록 할 수 있습니다.

```kotlin
val letter: Char = 'a'

// 값이 작은따옴표로 작성되었기 때문에 Kotlin이 Char로 추론합니다
val digit = '1'
val symbol = '!'
val space = ' '
val separator = ':'
```

문자 리터럴에는 정확히 하나의 문자만 포함되어야 합니다. 그렇지 않으면 Kotlin 컴파일러가 오류를 보고합니다.

```kotlin
val invalid = 'AB' // 오류
val invalidEmpty = '' // 오류
```
{validate="false"}

### Nullable 값 {id="nullable-values"}

null 허용 값을 저장하려면 `Char?`를 사용하세요.

```kotlin
val maybeAbsent: Char? = null
```

> JVM에서 nullable `Char` 값은 필요할 때 박싱(boxing)됩니다. 이는
> [숫자 타입](numbers.md#boxing-and-caching-numbers-on-the-jvm)에도 동일하게 적용됩니다.
>
{style="note"}

## 유니코드 지원 {id="unicode-support"}

Kotlin은 `Char` 값을 UTF-16 코드 유닛으로 나타냅니다. 이는 단일 `Char`가 하나의 완전한 유니코드 문자가 아니라 하나의 UTF-16 코드 유닛을 저장한다는 것을 의미합니다.

### 기본 다국어 평면 (BMP) {id="basic-multilingual-plane"}

단일 `Char`는 `\u0000`부터 `\uFFFF`까지의 범위에 해당하는 값을 저장할 수 있습니다.
이 범위는 거의 모든 현대 언어의 문자와 수많은 기호가 포함된 기본 다국어 평면(BMP, Basic Multilingual Plane)을 포괄합니다.

유니코드 값으로 문자를 지정하려면 `\u` 뒤에 [유니코드 표](https://www.unicode.org/charts/)의 4자리 16진수 값을 붙여 사용합니다.

```kotlin
val unicodeNumber = '\u0031' // '1'과 동일
```

### 보충 문자 (Supplementary characters) {id="supplementary-characters"}

이모지나 일부 역사적 문자처럼 BMP 범위를 벗어나는 유니코드 문자는 단일 `Char`로 나타낼 수 없습니다. UTF-16에서는 이러한 문자를 _서로게이트 쌍(surrogate pair)_으로 인코딩하며, 두 개의 `Char` 값이 합쳐져 `String` 내에서 하나의 유니코드 문자를 나타냅니다.

```kotlin
fun main() {
//sampleStart
    val emoji = "🥦"
    
    println(emoji.length) // 2
    println(emoji[0])     // 첫 번째 서로게이트
    println(emoji[1])     // 두 번째 서로게이트
//sampleEnd
}
```

> 32비트 기호를 개별적으로 다루려면 `Int` 값으로 저장되는 유니코드 코드 포인트(code point)를 사용하세요.
>
{style="tip"}

## 이스케이프 시퀀스 {id="escape-sequences"}

소스 코드에 직접 작성하기 어렵거나 특별한 의미를 지닌 특수 문자에는 이스케이프 시퀀스(escape sequence)를 사용하세요.

모든 이스케이프 시퀀스는 백슬래시(`\`)로 시작합니다.

| **지원되는 시퀀스** | **설명**               | 
|----------------------|------------------------|
| `\t`                 | 탭 (Tab)               | 
| `\b`                 | 백스페이스 (Backspace)  | 
| `\n`                 | 줄바꿈 (LF)            | 
| `\r`                 | 캐리지 리턴 (CR)       | 
| `\'`                 | 작은따옴표             | 
| `\"`                 | 큰따옴표               | 
| `\\`                 | 백슬래시               | 
| `\$`                 | 달러 기호              | 

예시:

```kotlin
val newLine = '\n'
val dollar = '\$'
val backslash = '\\'
```

## 연산 {id="operations"}

`Char`는 비교, 검사, 대소문자 변환, 명시적 숫자 변환을 지원합니다.

### 문자 비교 {id="character-comparison"}

`Char` 값을 비교하려면 `==`, `!=`, `<`, `>`, `<=`, `>=`와 같은 표준 [비교 연산자](keyword-reference.md#operators-and-special-symbols)를 사용하세요.

Kotlin은 문자의 유니코드 숫자 값을 기준으로 `Char` 값을 비교하며 `Boolean` 값을 반환합니다.

```kotlin
val before = 'a' < 'b' // true
val after = 'c' > 'd' // false
val different = 'A' == 'a' // false 
val equal = 'A' == 'A' // true
```

### 문자 처리 {id="character-processing"}

Kotlin은 문자 값을 검사하고 대소문자를 변환하는 함수들을 제공합니다.
예시:

```kotlin
fun main() {
//sampleStart
    val myChar = 'A'
    // 문자가 숫자인지 확인합니다
    println(myChar.isDigit()) // false
    // 문자가 대문자인지 확인합니다
    println(myChar.isUpperCase()) // true
    // 소문자 변환 값을 반환합니다
    println(myChar.lowercaseChar()) // 'a'
//sampleEnd
}
```
{kotlin-runnable="true"}

> 사용할 수 있는 함수에 대한 자세한 내용은 
> [API 레퍼런스](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-char/)에서 확인하세요.
>
{style="note"}

### 문자 산술 연산 {id="character-arithmetic"}

정수를 더하거나 빼서 다른 문자 값을 만들 수 있습니다.

```kotlin
fun main() {
//sampleStart
    val a = 'a'

    println(a + 1)  // b
    println(a + 2)  // c
    println(a - 32) // A
//sampleEnd
}
```
{kotlin-runnable="true"}

> 이러한 연산은 특정 언어의 알파벳 규칙이 아니라 유니코드 값을 따릅니다.
>
{style="note"}

가변 변수(mutable variable)에는 증가(`++`) 및 감소(`--`) 연산자를 전위(prefix) 및 후위(postfix) 형태로 사용할 수도 있습니다.

```kotlin
fun main() {
//sampleStart
    var a = 'A'
    
    a += 10
    println(a)   // 'K'
    
    println(++a) // 'L'  전위 증가
    println(a++) // 'L'  후위 증가
    println(a)   // 'M'
    
    println(--a) // 'L'  전위 감소
    println(a--) // 'L'  후위 감소
    println(a)   // 'K'
//sampleEnd
}
```
{kotlin-runnable="true"}

### 문자 변환 {id="character-conversion"}

`Char`를 숫자 타입으로 변환하려면 명시적 변환을 사용하세요.

* 문자의 유니코드 숫자 값을 얻으려면 `.code`를 사용합니다.

  ```kotlin
  fun main() { 
  //sampleStart
      val letter = 'A'
      println(letter.code) // 65
  //sampleEnd
  }
  ```
  {kotlin-runnable="true"}

* 문자가 10진수 숫자를 나타내는 경우 `digitToInt()`를 사용합니다.
  ```kotlin
  fun main() { 
  //sampleStart
      val digit = '7'
      println(digit.digitToInt()) // 7
  //sampleEnd
  }
  ```
  {kotlin-runnable="true"}

  > 문자가 유효한 숫자가 아닐 수도 있는 경우에는 `digitToIntOrNull()`을 사용하세요.
  >
  {style="tip"}