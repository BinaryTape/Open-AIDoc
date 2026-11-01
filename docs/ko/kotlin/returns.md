[//]: # (title: 반환 및 점프)

Kotlin에는 세 가지 구조적 점프 표현식(structural jump expression)이 있습니다.

* `return`은 기본적으로 가장 가까운 감싸는 함수 또는 [익명 함수](lambdas.md#anonymous-functions)에서 반환합니다.
* `break`는 가장 가까운 감싸는 루프를 종료합니다.
* `continue`는 가장 가까운 감싸는 루프의 다음 단계로 진행합니다.

이 모든 표현식은 더 큰 표현식의 일부로 사용될 수 있습니다.

```kotlin
val s = person.name ?: return
```

이러한 표현식의 타입은 [Nothing 타입](exceptions.md#the-nothing-type)입니다.

## Break 및 continue 레이블 {id="break-and-continue-labels"}

Kotlin의 모든 표현식에는 _레이블(label)_을 붙일 수 있습니다.
레이블은 `abc@` 또는 `fooBar@`와 같이 식별자 뒤에 `@` 기호가 붙는 형태를 가집니다.
표현식에 레이블을 지정하려면 표현식 앞에 레이블을 추가하기만 하면 됩니다.

```kotlin
loop@ for (i in 1..100) {
    // ...
}
```

이제 `break`나 `continue`에 레이블을 지정(qualify)할 수 있습니다.

```kotlin
loop@ for (i in 1..100) {
    for (j in 1..100) {
        if (...) break@loop
    }
}
```

레이블이 지정된 `break`는 해당 레이블이 표시된 루프 바로 다음의 실행 지점으로 점프합니다.
`continue`는 해당 루프의 다음 반복으로 진행합니다.

> 어떤 경우에는 레이블을 명시적으로 정의하지 않고도 `break`와 `continue`를 *비로컬(non-locally)*로 적용할 수 있습니다.
> 이러한 비로컬 사용은 둘러싼 [인라인 함수](inline-functions.md#break-and-continue)에서 사용되는 람다 표현식 내에서 유효합니다.
>
{style="note"}

## 레이블로 반환하기 {id="return-to-labels"}

Kotlin에서는 함수 리터럴, 로컬 함수, 객체 표현식을 사용하여 함수를 중첩할 수 있습니다.
레이블이 지정된 `return`을 사용하면 외부 함수로부터 반환할 수 있습니다.

가장 중요한 사용 사례는 람다 표현식에서 반환하는 것입니다. 람다 표현식에서 반환하려면
람다에 레이블을 지정하고 `return`을 한정합니다.

```kotlin
//sampleStart
fun foo() {
    listOf(1, 2, 3, 4, 5).forEach lit@{
        if (it == 3) return@lit // 람다의 호출자인 forEach 루프로 로컬 반환
        print(it)
    }
    print(" done with explicit label")
}
//sampleEnd

fun main() {
    foo()
}
```
{kotlin-runnable="true"}

이제 람다 표현식에서만 반환됩니다. 이러한 레이블은 람다가 전달된 함수와 이름이 같기 때문에 _암시적 레이블(implicit labels)_을 사용하는 것이 더 편리한 경우가 많습니다.

```kotlin
//sampleStart
fun foo() {
    listOf(1, 2, 3, 4, 5).forEach {
        if (it == 3) return@forEach // 람다의 호출자인 forEach 루프로 로컬 반환
        print(it)
    }
    print(" done with implicit label")
}
//sampleEnd

fun main() {
    foo()
}
```
{kotlin-runnable="true"}

또는 람다 표현식을 [익명 함수](lambdas.md#anonymous-functions)로 대체할 수도 있습니다.
익명 함수의 `return` 문은 익명 함수 자체에서 반환됩니다.

```kotlin
//sampleStart
fun foo() {
    listOf(1, 2, 3, 4, 5).forEach(fun(value: Int) {
        if (value == 3) return  // 익명 함수의 호출자인 forEach 루프로 로컬 반환
        print(value)
    })
    print(" done with anonymous function")
}
//sampleEnd

fun main() {
    foo()
}
```
{kotlin-runnable="true"}

앞의 세 예제에서 로컬 반환(local return)의 사용은 일반 루프에서의 `continue` 사용과 유사하다는 점에 유의하세요.

`break`에 직접적으로 상응하는 것은 없지만, 외부에 `run` 람다를 추가하고 그로부터 비로컬 반환을 수행하여 이를 흉내 낼 수 있습니다.

```kotlin
//sampleStart
fun foo() {
    run loop@{
        listOf(1, 2, 3, 4, 5).forEach {
            if (it == 3) return@loop // run에 전달된 람다로부터의 비로컬 반환
            print(it)
        }
    }
    print(" done with nested loop")
}
//sampleEnd

fun main() {
    foo()
}
```
{kotlin-runnable="true"}

여기서 비로컬 반환이 가능한 이유는 중첩된 `forEach()` 람다가 [인라인 함수](inline-functions.md)로 동작하기 때문입니다.

값을 반환할 때 파서는 레이블이 지정된 반환에 우선순위를 부여합니다.

```kotlin
return@a 1
```

이는 "레이블이 지정된 표현식 `(@a 1)`을 반환"하는 것이 아니라, "`@a` 레이블에서 `1`을 반환"한다는 것을 의미합니다.

> 어떤 경우에는 레이블을 사용하지 않고 람다 표현식에서 반환할 수 있습니다. 이러한 *비로컬(non-local)* 반환은 람다 안에 위치하지만 둘러싼 [인라인 함수](inline-functions.md#returns)를 빠져나갑니다.
>
{style="note"}