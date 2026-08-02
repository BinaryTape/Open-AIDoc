[//]: # (title: Lincheck 시작하기)
[//]: # (description: 이 퀵스타트 가이드는 Lincheck을 설정하고, 첫 번째 Lincheck 테스트를 작성하며, 테스트 보고서를 해석하는 방법을 안내합니다.)

이 퀵스타트 가이드는 Lincheck을 설정하고, 첫 번째 Lincheck 테스트를 작성하며, 테스트 보고서를 해석하는 방법을 안내합니다.

다음 내용을 배우게 됩니다:
* 새로운 IntelliJ IDEA 프로젝트를 생성하고 Lincheck을 설치합니다.
* 첫 번째 동시성 테스트(concurrent test)를 작성하고 Lincheck으로 실행합니다.
* 동시성 자료 구조를 생성하고 두 가지 테스트 전략을 사용하여 Lincheck으로 테스트합니다.

## 프로젝트 생성

IntelliJ IDEA에서 기존 Kotlin 프로젝트를 열거나
[새 프로젝트를 생성](https://kotlinlang.org/docs/jvm-get-started.html)하세요.

## 의존성 추가

프로젝트에서 Lincheck을 사용하려면 빌드 구성에 해당하는 의존성을 추가하세요:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
// build.gradle.kts
repositories {
    mavenCentral()
}

dependencies {
    testImplementation("org.jetbrains.lincheck:lincheck:%lincheckVersion%")
    testImplementation(kotlin("test"))
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
// build.gradle
repositories {
    mavenCentral()
}

dependencies {
    testImplementation "org.jetbrains.lincheck:lincheck:%lincheckVersion%"
    testImplementation "org.jetbrains.kotlin:kotlin-test"
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<!-- pom.xml -->
<project>
    <dependencies>
         <dependency>
             <groupId>org.jetbrains.lincheck</groupId>
             <artifactId>lincheck</artifactId>
             <version>%lincheckVersion%</version>
             <scope>test</scope>
         </dependency>
         <dependency>
             <groupId>org.jetbrains.kotlin</groupId>
             <artifactId>kotlin-test</artifactId>
             <scope>test</scope>
         </dependency>
    </dependencies>
    ...
</project>
```

</tab>
</tabs>

## 첫 번째 테스트 작성하기

기본적인 동시성 테스트를 위해, 각 스레드에서 실행되어야 할 연산과 기대되는 단언(assertion)을 설명하는 테스트 함수를 만듭니다. Lincheck은 [모델 검사(model checking)](lincheck-testing-strategies.md#model-checking)를 사용하여 프로그램의 가능한 스레드 인터리빙(thread interleavings)을 탐색하고, 잘못된 동작이 발생할 경우 오류 보고서를 제공합니다.

1. `src/test` 디렉토리에 `CounterTest.kt` 파일을 생성합니다.
2. `org.jetbrains.lincheck`, `kotlinx.concurrent`, `kotlin.test` 라이브러리를 임포트합니다: 
    
    ```kotlin
    import org.jetbrains.lincheck.*
    import kotlin.concurrent.*
    import kotlin.test.*
    ```

3. 변수를 생성하고 두 개의 스레드가 해당 변수를 조작하는 테스트를 작성합니다:

    ```kotlin
    class CounterTest {
        @Test // 테스트 함수 선언
        fun test() = Lincheck.runConcurrentTest {
            var counter = 0

            // 카운터를 동시에 증가시킴
            val t1 = thread { counter++ }
            val t2 = thread { counter++ }

            // 스레드가 종료될 때까지 대기
            t1.join()
            t2.join()

            // 두 증가 연산이 모두 적용되었는지 확인
            assertEquals(2, counter)
        }
    }
    ```

4. 테스트를 실행합니다. Lincheck은 잘못된 동작으로 이어진 스레드 인터리빙이 포함된 보고서를 생성합니다:

    > 오류 트레이스(error trace)를 시각화하려면 [Lincheck 플러그인](https://plugins.jetbrains.com/plugin/24171-lincheck)을 설치하세요.
    > 
    {style="note"}
   
    ```text
    | ------------------------------------------------------------------------------- |
    |                   Main Thread                   |   Thread 1    |   Thread 2    |
    | ------------------------------------------------------------------------------- |
    | thread(block = Lambda#2): Thread#1              |               |               |
    | thread(block = Lambda#3): Thread#2              |               |               |
    | switch (reason: waiting for Thread 1 to finish) |               |               |
    |                                                 |               | run()         |
    |                                                 |               |   counter ➜ 0 |
    |                                                 |               |   switch      |
    |                                                 | run()         |               |
    |                                                 |   counter ➜ 0 |               |
    |                                                 |   counter = 1 |               |
    |                                                 |               |   counter = 1 |
    | Thread#1.join()                                 |               |               |
    | Thread#2.join()                                 |               |               |
    | counter.element ➜ 1                             |               |               |
    | assertEquals(2, 1): threw AssertionFailedError  |               |               |
    | ------------------------------------------------------------------------------- |
    ```

    Lincheck은 `inc()` 연산 중 하나가 `counter` 값을 덮어쓰는 스레드 인터리빙을 발견했습니다.
    <deflist collapsible="true">
        <def title="단계별 보고서 설명" default-state="collapsed">
        <list type="decimal">
            <li> 스레드 2에서 JVM이 초기 <code>counter</code> 값을 읽습니다.</li>
            <li> 실행이 스레드 2에서 스레드 1로 전환됩니다.</li>
            <li> 스레드 1에서 JVM이 카운터를 증가시킵니다. <code>inc()</code> 연산의 모든 단계(변수에서 값을 읽고, 값을 증가시키고, 값을 다시 변수에 쓰는 과정)가 중단 없이 수행됩니다.</li>
            <li> 실행이 다시 스레드 2로 전환됩니다.</li>
            <li> 스레드 2에서 JVM은 1단계에서 획득한 값을 증가시키고 그 결과를 <code>counter</code> 변수에 씁니다.</li>
            </list>
            </def>
    </deflist>

## 자료 구조 테스트 작성하기

기본적인 동시성 테스트 외에도, Lincheck은 동시성 자료 구조를 테스트하기 위한 [선언적 접근 방식(declarative approach)](lincheck-how-to-test-data-structures.md)을 지원합니다.

Lincheck에서 자료 구조를 테스트하려면 구조의 동시성 메서드와 테스트 함수만 선언하면 됩니다. Lincheck은 무작위 동시성 시나리오를 생성하고, 지정된 테스트 전략을 사용하여 이를 실행하며, 오류 보고서를 제공합니다.

이 섹션에서는 간단한 카운터를 테스트해 봅니다:

1. `src/test` 디렉토리에 `CounterStructureTest.kt` 파일을 생성합니다.
2. `lincheck.datastructures`와 `kotlin.test` 라이브러리를 임포트합니다:

    ```kotlin
    import org.jetbrains.lincheck.datastructures.*
    import kotlin.test.*
    ```

3. `Counter` 구조를 생성합니다:

    ```kotlin
    class Counter {
        @Volatile
        private var value = 0
    
        fun inc(): Int = ++value
        fun get() = value
    }
    ```
   
4. `CounterStructureTest` 클래스를 생성합니다. 구조의 초기 상태를 설정하고 구조의 동시성 연산을 `@Operation` 어노테이션으로 표시합니다:

    ```kotlin
    class CounterStructureTest {
        // 초기 상태
        private val c = Counter()
    
        // 동시성 연산
        @Operation
        fun inc() = c.inc()
    
        @Operation
        fun get() = c.get()
    }
    ```
   
5. `CounterTest` 클래스에서 `ModelCheckingOptions()`를 사용하는 테스트 함수를 선언합니다:
    
    ```kotlin
    @Test
    fun stressTest() = ModelCheckingOptions().check(this::class)
    ```
   
    > 모델 검사가 어떻게 작동하는지는 [테스트 전략](lincheck-testing-strategies.md#model-checking) 문서에서 자세히 알아보세요.
    > 
    {style=”tip”}

6. 테스트를 실행합니다. Lincheck은 동시성 시나리오와 잘못된 동작으로 이어진 특정 스레드 인터리빙이 포함된 오류 보고서를 생성합니다:
    
    ```text
    | ------------------- |
    | Thread 1 | Thread 2 |
    | ------------------- |
    | inc(): 1 | inc(): 1 |
    | ------------------- |
    ```

    ```text
    | ------------------------ |
    | Thread 1 |   Thread 2    |
    | ------------------------ |
    |          | inc(): 1      |
    |          |   c.inc(): 1  |
    |          |     value ➜ 0 |
    |          |     switch    |
    | inc(): 1 |               |
    |          |     value = 1 |
    |          |     value ➜ 1 |
    |          |   result: 1   |
    | ------------------------ |
    ```

## 다음 단계

Lincheck에서 [동시성 자료 구조를 테스트하기 위한 선언적 접근 방식](lincheck-how-to-test-data-structures.md)에 대해 알아보세요.