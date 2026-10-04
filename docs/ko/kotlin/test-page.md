[//]: # (title: 테스트 페이지)

<web-summary>이 페이지는 테스트 목적으로만 제공됩니다.</web-summary>

<no-index/>

<tldr>
   <p>이미지가 포함된 블록입니다(<strong>Compose Multiplatform 시작하기</strong> 튜토리얼에서 발췌).</p>
   <p><img src="icon-1-done.svg" width="20" alt="First step"/> <a href="jvm-create-project-with-spring-boot.md">Kotlin으로 Spring Boot 프로젝트 생성하기</a><br/>
      <img src="icon-2-done.svg" width="20" alt="Second step"/> <a href="jvm-spring-boot-add-data-class.md">Spring Boot 프로젝트에 데이터 클래스 추가하기</a><br/>
      <img src="icon-3.svg" width="20" alt="Third step"/> <strong>Spring Boot 프로젝트에 데이터베이스 지원 추가하기</strong><br/>
      <img src="icon-4-todo.svg" width="20" alt="Fourth step"/> 데이터베이스 접근을 위해 Spring Data CrudRepository 사용하기><br/>
    </p>
</tldr>

## 동기화된 탭 {id="synchronized-tabs"}

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("kapt") version "1.9.23"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id "org.jetbrains.kotlin.kapt" version "1.9.23"
}
```

</tab>
</tabs>

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("plugin.noarg") version "1.9.23"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id "org.jetbrains.kotlin.plugin.noarg" version "1.9.23"
}
```

</tab>
</tabs>

## 섹션 {id="sections"}

### 접힌 섹션 {initial-collapse-state="collapsed" collapsible="true" id="collapsed-section"}

텍스트와 코드 블록:

```kotlin
plugins {
    kotlin("plugin.noarg") version "1.9.23"
}
```

## 코드 블록 {id="codeblocks"}

단순 코드 블록:

```kotlin
    import java.util.*

@Service
class MessageService(val db: MessageRepository) {
    fun findMessages(): List<Message> = db.findAll().toList()

    fun findMessageById(id: String): List<Message> = db.findById(id).toList()

    fun save(message: Message) {
        db.save(message)
    }

    fun <T : Any> Optional<out T>.toList(): List<T> =
        if (isPresent) listOf(get()) else emptyList()
}
```

### 확장 가능한 코드 블록 {id="expandable-codeblock"}

```kotlin
package com.example.demo

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@SpringBootApplication
class DemoApplication

fun main(args: Array<String>) {
    runApplication<DemoApplication>(*args)
}

@RestController
class MessageController {
    @GetMapping("/")
    fun index(@RequestParam("name") name: String) = "Hello, $name!"
}
```
{initial-collapse-state="collapsed" collapsible="true"}

### 실행 가능한 코드 블록 {id="runnable-codeblock"}

```kotlin
data class User(val name: String, val id: Int)

fun main() {
    val user = User("Alex", 1)
    
    //sampleStart
    // 출력을 쉽게 읽을 수 있도록 toString() 함수를 자동으로 사용합니다
    println(user)            
    // User(name=Alex, id=1)
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

## 표 {id="tables"}

### 마크다운 표 {id="markdown-table"}

| 원시 타입 배열                                                                        | Java에서의 해당 타입 |
|---------------------------------------------------------------------------------------|--------------------|
| [`BooleanArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-boolean-array/) | `boolean[]`        |
| [`ByteArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-byte-array/)       | `byte[]`           |
| [`CharArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-char-array/)       | `char[]`           |
| [`DoubleArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-double-array/)   | `double[]`         |
| [`FloatArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-float-array/)     | `float[]`          |
| [`IntArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-int-array/)         | `int[]`            |
| [`LongArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-long-array/)       | `long[]`           |
| [`ShortArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-short-array/)     | `short[]`          |

### XML 표 {id="xml-table"}

<table>
    <tr>
        <td><strong>최종 수정일</strong></td>
        <td><strong>2023년 12월</strong></td>
    </tr>
    <tr>
        <td><strong>다음 업데이트</strong></td>
        <td><strong>2024년 6월</strong></td>
    </tr>
</table>

### 내부에 코드 블록이 있는 XML 표 {id="xml-table-with-codeblocks-inside"}

간단한 표:

<table>
    <tr>
        <td>변경 전</td>
        <td>변경 후</td>
    </tr>
    <tr>
<td>

```kotlin
kotlin {
    targets {
        configure(['windows',
            'linux']) {
        }
    }
}
```

</td>
<td>

```kotlin
kotlin {
    targets {
        configure([findByName('windows'),
            findByName('linux')]) {
        }
    }
}
```

</td>
    </tr>
</table>

더 복잡한 표:

<table>
    <tr>
        <td></td>
        <td>변경 전</td>
        <td>변경 후</td>
    </tr>
    <tr>
        <td rowspan="2"><code>jvmMain</code> 컴파일의 종속성</td>
<td>

```kotlin
jvm<Scope>
```

</td>
<td>

```kotlin
jvmCompilation<Scope>
```

</td>
    </tr>
    <tr>
<td>

```kotlin
dependencies {
    add("jvmImplementation",
        "foo.bar.baz:1.2.3")
}
```

</td>
<td>

```kotlin
dependencies {
    add("jvmCompilationImplementation",
        "foo.bar.baz:1.2.3")
}
```

</td>
    </tr>
    <tr>
        <td><code>jvmMain</code> 소스 세트의 종속성</td>
<td colspan="2">

```kotlin
jvmMain<Scope>
```

</td>
    </tr>
    <tr>
        <td><code>jvmTest</code> 컴파일의 종속성</td>
<td>

```kotlin
jvmTest<Scope>
```

</td>
<td>

```kotlin
jvmTestCompilation<Scope>
```

</td>
    </tr>
    <tr>
        <td><code>jvmTest</code> 소스 세트의 종속성</td>
<td colspan="2">

```kotlin
jvmTest<Scope>
```

</td>
    </tr>
</table>

## 목록 {id="lists"}

### 순서가 있는 목록 {id="ordered-list"}

1. 하나
2. 둘
3. 셋
    1. 3의 1
    2. 3의 2
    3. 3의 3
        1. 3의 1의 1
4. 내부에 코드 블록 포함:

   ```kotlin
   jvmTest<Scope>
   ```

### 순서가 없는 목록 {id="non-ordered-list"}

* 첫 번째 항목
* 두 번째 항목
* 세 번째 항목
    * 하나 더
    * 또 다른 하나
        * 와, 하나 더
* 내부에 코드 블록 포함:

   ```kotlin
   jvmTest<Scope>
   ```

### 정의 목록 {id="definition-list"}

<deflist collapsible="true">
   <def title="접을 수 있는 항목 #1">
      <p><code>CrudRepository</code> 인터페이스의 <code>findById()</code> 함수 반환 타입은 <code>Optional</code> 클래스의 인스턴스입니다. 하지만 일관성을 위해 단일 메시지가 포함된 <code>List</code>를 반환하는 것이 편리할 수 있습니다. 이를 위해서는 <code>Optional</code> 값이 존재하는 경우 해당 값을 언래핑하여 그 값이 포함된 목록을 반환해야 합니다. 이는 <code>Optional</code> 타입에 대한 <a href="extensions.md#extension-functions">확장 함수(extension function)</a>로 구현할 수 있습니다.</p>
      <p>코드의 <code>Optional&lt;out T&gt;.toList()</code>에서 <code>.toList()</code>는 <code>Optional</code>의 확장 함수입니다. 확장 함수를 사용하면 모든 클래스에 함수를 추가로 작성할 수 있으며, 이는 라이브러리 클래스의 기능을 확장하려는 경우 특히 유용합니다.</p>
   </def>
   <def title="접을 수 있는 항목 #2">
      <p><a href="https://docs.spring.io/spring-data/relational/reference/#jdbc.entity-persistence">이 함수는</a> 데이터베이스에 새 객체의 id가 없다는 가정하에 작동합니다. 따라서 삽입(insert)을 수행하려면 id가 <b>null이어야 합니다</b>.</p>
      <p>id가 <i>null</i>이 아닌 경우, <code>CrudRepository</code>는 데이터베이스에 이미 객체가 존재한다고 가정하여 <i>삽입(insert)</i> 작업이 아닌 <i>업데이트(update)</i> 작업을 수행합니다. 삽입 작업 후에는 데이터 저장소에서 <code>id</code>를 생성하여 <code>Message</code> 인스턴스에 다시 할당합니다. 이것이 바로 <code>id</code> 프로퍼티를 <code>var</code> 키워드로 선언해야 하는 이유입니다.</p>
      <p></p>
   </def>
</deflist>

### 일반(Clear) 정의 목록 {id="clear-definition-list"}

<deflist appearance="clear" collapsible="true">
<def title="펼칠 수 있는 항목 #1">

번호가 없는 펼칠 수 있는 항목입니다. 위젯 크롬(chrome)만 테스트할 수 있도록 본문은 일반 텍스트로 되어 있습니다.

</def>
<def title="펼칠 수 있는 항목 #2">

두 번째 펼칠 수 있는 항목입니다. 이를 펼쳐도 형제 요소의 상태가 변경되어서는 안 됩니다.

</def>
<def title="펼칠 수 있는 항목 #3">

번호 없는 목록을 닫는 세 번째 펼칠 수 있는 항목입니다.

</def>
</deflist>

### 번호 매겨진 일반 정의 목록 {id="numbered-clear-definition-list"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="번호 매겨진 항목 #1">

생성된 번호 1로 렌더링된 번호 매겨진 항목에 대한 설명입니다.

</def>
<def title="번호 매겨진 항목 #2">

생성된 번호 2로 렌더링된 번호 매겨진 항목에 대한 설명입니다.

</def>
<def title="번호 매겨진 항목 #3">

생성된 번호 3로 렌더링된 번호 매겨진 항목에 대한 설명입니다.

</def>
<def title="번호 매겨진 항목 #4">

생성된 번호 4로 렌더링된 번호 매겨진 항목에 대한 설명입니다.

</def>
<def title="번호 매겨진 항목 #5">

생성된 번호 5로 렌더링된 번호 매겨진 항목에 대한 설명입니다.

</def>
<def title="번호 매겨진 항목 #6">

생성된 번호 6으로 렌더링된 번호 매겨진 항목에 대한 설명입니다.

</def>
<def title="생성된 번호의 내어쓰기가 유지되는지 확인하기 위해 좁은 뷰포트에서 여러 줄로 줄바꿈되어야 하는 의도적으로 긴 항목 제목">

생성된 번호 7로 렌더링된 번호 매겨진 항목에 대한 설명입니다.

</def>
<def title="번호 매겨진 항목 #8">

생성된 번호 8로 렌더링된 번호 매겨진 항목에 대한 설명입니다.

</def>
<def title="번호 매겨진 항목 #9">

생성된 번호 9로 렌더링된 번호 매겨진 항목에 대한 설명입니다.

</def>
<def title="번호 매겨진 항목 #10">

생성된 번호 10으로 렌더링된 번호 매겨진 항목에 대한 설명입니다.

</def>
<def title="번호 매겨진 항목 #11">

생성된 번호 11로 렌더링된 번호 매겨진 항목에 대한 설명입니다.

</def>
</deflist>

## 연습 문제 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="문자열 템플릿을 사용하여 인사말 출력하기" id="test-page-practice-1">

프로그램이 표준 출력으로 `"Mary is 20 years old"`를 출력하도록 코드를 완성하세요:

```kotlin
fun main() {
    val name = "Mary"
    val age = 20
    // 여기에 코드를 작성하세요
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="test-page-exercise-1"}

```kotlin
fun main() {
    val name = "Mary"
    val age = 20
    println("$name is $age years old")
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="예제 솔루션" id="test-page-solution-1"}

</def>
<def title="두 결과가 일치하는지 확인하기" id="test-page-practice-2">

`if`를 사용하여 두 결과가 같으면 `You win :)`을 출력하고, 그렇지 않으면 `You lose :(`를 출력하세요.

> 이 연습 문제에는 중첩된 힌트도 포함되어 있으므로, 연습 문제 자체가 접히지 않고 내부의 접을 수 있는 목록이 열려야 합니다.
>
{style="tip"}

<deflist collapsible="true">
    <def title="힌트">
        동등성 연산자(<code>==</code>)를 사용하여 결과를 비교하세요.
    </def>
</deflist>

```kotlin
fun main() {
    val firstResult = 3
    val secondResult = 3
    // 여기에 코드를 작성하세요
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="test-page-exercise-2"}

```kotlin
fun main() {
    val firstResult = 3
    val secondResult = 3
    if (firstResult == secondResult)
        println("You win :)")
    else
        println("You lose :(")
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="예제 솔루션" id="test-page-solution-2"}

</def>
<def title="숫자 목록 필터링하기" id="test-page-practice-3">

`filter()`를 사용하여 목록에서 짝수만 출력하세요:

```kotlin
fun main() {
    val numbers = listOf(1, 2, 3, 4, 5)
    println(numbers)
    // 여기에 코드를 작성하세요
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="test-page-exercise-3"}

```kotlin
fun main() {
    val numbers = listOf(1, 2, 3, 4, 5)
    println(numbers)
    println(numbers.filter { it % 2 == 0 })
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="예제 솔루션" id="test-page-solution-3"}

</def>
</deflist>

## 텍스트 요소 {id="text-elements"}

* **굵은 텍스트**
* _기울임꼴 텍스트_
* `인라인 코드`
* [내부 앵커](#lists)
* [내부 링크](roadmap.md)
* [외부 링크](https://jetbrains.com)
* 이모지 ❌✅🆕

## 변수 {id="variables"}
* 변수 사용: 최신 Kotlin 버전은 %kotlinVersion%입니다

## 임베디드 요소 {id="embedded-elements"}

### YouTube 동영상 {id="video-from-youtube"}

<video src="https://www.youtube.com/v/Ol_96CHKqg8" title="What's new in Kotlin 1.9.20"/>

### 이미지 {id="pictures"}

일반 (Markdown):

![테스트 생성](create-test.png){width="700"}

일반 (XML):

<img src="multiplatform-web-wizard.png" alt="멀티플랫폼 웹 마법사" width="400"/>

인라인:

![YouTrack](youtrack-logo.png){width=30}{type="joined"}

확대 가능:

![class diagram](ksp-class-diagram.svg){thumbnail="true" width="700" thumbnail-same-file="true"}

버튼 스타일:

<a href="https://kmp.jetbrains.com">
   <img src="multiplatform-create-project-button.png" alt="프로젝트 생성" style="block"/>
</a>

## 참고 사항 {id="notes"}

경고:

> kapt 컴파일러 플러그인의 K2 지원은 [실험적(Experimental)](components-stability.md) 기능입니다.
> 옵트인(opt-in)이 필요하며(아래 세부 정보 참조), 평가 목적으로만 사용해야 합니다.
>
{style="warning"}

참고:

> Kotlin/Native와 함께 제공되는 네이티브 플랫폼 라이브러리(예: Foundation, UIKit, POSIX)의 경우, 일부
> API에만 `@ExperimentalForeignApi`를 통한 옵트인이 필요합니다. 이러한 경우 옵트인 요구 사항과 함께 경고가 표시됩니다.
>
{style="note"}

팁:

> Kotlin/Native와 함께 제공되는 네이티브 플랫폼 라이브러리(예: Foundation, UIKit, POSIX)의 경우, 일부
> API에만 `@ExperimentalForeignApi`를 통한 옵트인이 필요합니다. 이러한 경우 옵트인 요구 사항과 함께 경고가 표시됩니다.
>
{style="tip"}