[//]: # (title: 표준 입력 읽기)

표준 입력에서 데이터를 읽으려면 `readln()` 함수를 사용하세요. 이 함수는 한 줄 전체를 문자열로 읽습니다:

```kotlin
// 사용자 입력을 읽어 변수에 저장합니다. 예: Hi there!
val myInput = readln()

println(myInput)
// Hi there!

// 변수에 저장하지 않고 사용자 입력을 읽어 출력합니다. 예: Hi, Kotlin!
println(readln())
// Hi, Kotlin!
```

여러 줄의 입력을 하나의 문자열로 읽을 수도 있습니다.
여러 줄을 결합하려면 [`joinToString()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.sequences/join-to-string.html) 함수를 사용하세요:

```kotlin
val input = generateSequence(::readlnOrNull)
  .joinToString("
")
```

> 예외를 발생시키지 않고 파일 끝(EOF)까지 입력을 읽으려면 `readln()` 대신 [`readlnOrNull()`](#handle-standard-input-safely)을 사용하세요.
> 
{style="note"}

문자열 이외의 데이터 타입을 사용하려면 `.toInt()`, `.toLong()`, `.toDouble()`, `.toFloat()`, 또는 `.toBoolean()`과 같은 변환 함수를 사용하여 입력을 변환할 수 있습니다.
여러 개의 서로 다른 데이터 타입 입력을 읽어 각각 변수에 저장할 수 있습니다:

```kotlin
// 입력을 문자열에서 정수 값으로 변환합니다. 예: 12
val myNumber = readln().toInt()
println(myNumber)
// 12

// 입력을 문자열에서 double 값으로 변환합니다. 예: 345 
val myDouble = readln().toDouble()
println(myDouble)
// 345.0

// 입력을 문자열에서 불리언 값으로 변환합니다. 예: true
val myBoolean = readln().toBoolean()
println(myBoolean)
// true
```

이 변환 함수들은 사용자가 대상 데이터 타입의 유효한 표현을 입력한다고 가정합니다. 예를 들어, 함수는 문자열 입력에 숫자가 올 것을 기대하므로 "hello"를 `.toInt()`를 사용하여 정수로 변환하려고 하면 예외가 발생합니다.

구분자(delimiter)로 구분된 여러 입력 요소를 읽으려면 구분자를 지정하여 `.split()` 함수를 사용하세요. 다음 코드 예제는 표준 입력으로부터 데이터를 읽고, 구분자를 기준으로 입력을 요소 리스트로 분리한 후, 리스트의 각 요소를 특정 타입으로 변환합니다:

```kotlin
// 요소들이 공백으로 구분되어 있다고 가정하고 입력을 읽어 정수로 변환합니다. 예: 1 2 3 
val numbers = readln().split(' ').map { it.toInt() }
println(numbers)
//[1, 2, 3] 

// 요소들이 쉼표로 구분되어 있다고 가정하고 입력을 읽어 double로 변환합니다. 예: 4,5,6
val doubles = readln().split(',').map { it.toDouble() }
println(doubles)
//[4.0, 5.0, 6.0]
```

> Kotlin/JVM에서 사용자 입력을 읽는 또 다른 방법은 [Java Scanner를 사용한 표준 입력](standard-input.md)을 참고하세요.
>
{style="note"}

## 안전하게 표준 입력 처리하기

`.toIntOrNull()` 함수를 사용하여 사용자 입력을 문자열에서 정수로 안전하게 변환할 수 있습니다. 이 함수는 변환에 성공하면 정수를 반환합니다. 하지만 입력이 정수의 유효한 표현이 아닌 경우 `null`을 반환합니다:

```kotlin
// 입력이 유효하지 않으면 null을 반환합니다. 예: Hello!
val wrongInt = readln().toIntOrNull()
println(wrongInt)
// null

// 유효한 입력을 문자열에서 정수로 변환합니다. 예: 13
val correctInt = readln().toIntOrNull()
println(correctInt)
// 13
```

`readlnOrNull()` 함수 또한 사용자 입력을 안전하게 처리하는 데 유용합니다. `readlnOrNull()` 함수는 표준 입력에서 데이터를 읽으며, 입력의 끝(EOF)에 도달하면 `null`을 반환합니다. 반면 `readln()`은 그러한 경우 예외를 발생시킵니다.