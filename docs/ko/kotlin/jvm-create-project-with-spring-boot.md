[//]: # (title: Kotlin으로 Spring Boot 프로젝트 생성하기)

<web-summary>IntelliJ IDEA를 사용하여 Kotlin으로 Spring Boot 애플리케이션을 생성합니다.</web-summary>

이 튜토리얼의 첫 번째 파트에서는 IntelliJ IDEA의 Project Wizard를 사용하여 Gradle 기반의 Spring Boot 프로젝트를 생성하는 방법을 살펴봅니다.

> 이 튜토리얼에서 빌드 시스템으로 Gradle을 반드시 사용해야 하는 것은 아닙니다. Maven을 사용하는 경우에도 동일한 단계를 따를 수 있습니다.
> 
{style="note"}

## 시작하기 전에 {id="before-you-start"}

최신 버전의 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/)를 다운로드하여 설치하고 Ultimate 구독을 사용하세요.

> Ultimate 구독 없이 IntelliJ IDEA를 사용하거나 다른 IDE를 사용하는 경우, [웹 기반 프로젝트 생성기](https://start.spring.io/#!language=kotlin&type=gradle-project-kotlin)를 사용하여 Spring Boot 프로젝트를 생성할 수 있습니다.
> 
{style="tip"}

## Spring Boot 프로젝트 생성하기 {id="create-a-spring-boot-project"}

IntelliJ IDEA의 Project Wizard를 사용하여 Kotlin 기반의 새로운 Spring Boot 프로젝트를 생성합니다.

1. IntelliJ IDEA에서 **File** | **New** | **Project**를 선택합니다. 
2. 왼쪽 패널의 **Generators** 섹션에서 **Spring Boot**를 선택합니다.
3. **New Project** 창에서 다음 필드와 옵션을 지정합니다.
   
   * **Name**: demo
   * **Language**: Kotlin
   * **Type**: Gradle - Kotlin

     > 이 옵션은 빌드 시스템과 DSL을 지정합니다.
     >
     {style="tip"}

   * **Package name**: com.example.demo
   * **JDK**: Java JDK
     
     > 이 튜토리얼에서는 **Amazon Corretto 버전 23**을 사용합니다.
     > JDK가 설치되어 있지 않다면 드롭다운 목록에서 다운로드할 수 있습니다.
     >
     {style="note"}
   
   * **Java**: 17
   
     > Java 17이 설치되어 있지 않다면 JDK 드롭다운 목록에서 다운로드할 수 있습니다.
     >
     {style="tip"}

   ![Spring Boot 프로젝트 생성](create-spring-boot-project.png){width=700}

4. 모든 필드가 올바르게 지정되었는지 확인한 후 **Next**를 클릭합니다.

5. 이 튜토리얼에 필요한 다음 의존성(Dependencies)을 선택합니다.

   * **Web | Spring Web**
   * **SQL | Spring Data JDBC**
   * **SQL | H2 Database**

   ![Spring Boot 프로젝트 설정](set-up-spring-boot-project.png){width=700}

6. **Create**를 클릭하여 프로젝트를 생성하고 설정합니다.

   > IDE가 새 프로젝트를 생성하고 엽니다. 프로젝트 의존성을 다운로드하고 가져오는 데 다소 시간이 걸릴 수 있습니다.
   >
   {style="tip"} 

7. 완료되면 **Project 뷰**에서 다음과 같은 구조를 확인할 수 있습니다.

   ![Spring Boot 프로젝트 뷰 설정](spring-boot-project-view.png){width=400}

   생성된 Gradle 프로젝트는 Maven의 표준 디렉터리 레이아웃을 따릅니다.
   * `main/kotlin` 폴더 아래에는 애플리케이션에 속한 패키지와 클래스들이 있습니다.
   * 애플리케이션의 진입점(Entry point)은 `DemoApplication.kt` 파일의 `main()` 메서드입니다.

## 프로젝트 Gradle 빌드 파일 살펴보기 {initial-collapse-state="collapsed" collapsible="true" id="explore-the-project-gradle-build-file"}

`build.gradle.kts` 파일을 엽니다. 이 파일은 Gradle Kotlin 빌드 스크립트로, 애플리케이션에 필요한 의존성 목록을 포함하고 있습니다.

이 Gradle 파일은 Spring Boot의 표준적인 형태이지만, [`kotlin-spring` Gradle 플러그인](kotlin-spring-plugin.md)(`kotlin("plugin.spring")`)을 포함하여 필요한 Kotlin 의존성들도 포함하고 있습니다.

각 부분과 의존성에 대한 설명이 포함된 전체 스크립트는 다음과 같습니다.

```kotlin
// build.gradle.kts
plugins {
    kotlin("jvm") version "%springBootSupportedKotlinVersion%" // 사용할 Kotlin 버전
    kotlin("plugin.spring") version "%springBootSupportedKotlinVersion%" // Kotlin Spring 플러그인
    id("org.springframework.boot") version "%springBootVersion%"
    id("io.spring.dependency-management") version "1.1.7"
}

group = "com.example"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(17)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-h2console")
    implementation("org.springframework.boot:spring-boot-starter-data-jdbc")
    implementation("org.springframework.boot:spring-boot-starter-webmvc")
    implementation("org.jetbrains.kotlin:kotlin-reflect") // Spring과 함께 작업하는 데 필요한 Kotlin 리플렉션 라이브러리
    implementation("tools.jackson.module:jackson-module-kotlin") // JSON 처리를 위한 Kotlin용 Jackson 확장
    runtimeOnly("com.h2database:h2")
    testImplementation("org.springframework.boot:spring-boot-starter-data-jdbc-test")
    testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

kotlin {
    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict", "-Xannotation-default-target=param-property") // `-Xjsr305=strict`는 JSR-305 어노테이션에 대해 엄격 모드를 활성화합니다
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
}
```

보시다시피 Gradle 빌드 파일에는 몇 가지 Kotlin 관련 아티팩트가 추가되어 있습니다.

1. `plugins` 블록에는 두 개의 Kotlin 아티팩트가 있습니다.

   * `kotlin("jvm")` 플러그인은 프로젝트에서 사용할 Kotlin 버전을 정의합니다.
   * Kotlin Spring 컴파일러 플러그인인 `kotlin("plugin.spring")`은 Spring Framework 기능과 호환되도록 Kotlin 클래스에 `open` 변경자(modifier)를 추가합니다.

2. `dependencies` 블록에는 몇 가지 Kotlin 관련 모듈이 나열되어 있습니다.

   * `tools.jackson.module:jackson-module-kotlin` 모듈은 Kotlin 클래스 및 데이터 클래스의 직렬화 및 역직렬화 지원을 추가합니다.
   * `org.jetbrains.kotlin:kotlin-reflect`는 [리플렉션 기능](reflection.md)을 온전히 지원하는 Kotlin 리플렉션 라이브러리입니다.

3. dependencies 섹션 뒤에는 `kotlin` 플러그인 설정 블록이 있습니다.
   여기서 컴파일러에 추가 인수를 전달하여 다양한 언어 기능을 활성화하거나 비활성화할 수 있습니다.

Kotlin 컴파일러 옵션에 대한 자세한 내용은 [](gradle-compiler-options.md)에서 확인하세요.

## 생성된 Spring Boot 애플리케이션 살펴보기 {id="explore-the-generated-spring-boot-application"}

`DemoApplication.kt` 파일을 엽니다.

```kotlin
// DemoApplication.kt
package com.example.demo

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class DemoApplication

fun main(args: Array<String>) {
    runApplication<DemoApplication>(*args)
}
```

<deflist collapsible="true">
   <def title="클래스 선언 – class DemoApplication">
      <p>패키지 선언과 import 구문 바로 다음에 첫 번째 클래스 선언인 <code>class DemoApplication</code>을 볼 수 있습니다.</p>
      <p>Kotlin에서는 클래스에 멤버(프로퍼티나 함수)가 전혀 포함되어 있지 않다면 클래스 본문(<code>{}</code>)을 완전히 생략할 수 있습니다.</p>
   </def>
   <def title="@SpringBootApplication 어노테이션">
      <p><a href="https://docs.spring.io/spring-boot/reference/using/using-the-springbootapplication-annotation.html#using.using-the-springbootapplication-annotation"><code>@SpringBootApplication 어노테이션</code></a>은 Spring Boot 애플리케이션에서 제공하는 편의용 어노테이션입니다.
      이 어노테이션은 Spring Boot의 <a href="https://docs.spring.io/spring-boot/reference/using/auto-configuration.html#using.auto-configuration">자동 구성(auto-configuration)</a>, <a href="https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/annotation/ComponentScan.html">컴포넌트 스캔(component scan)</a>을 활성화하고, "애플리케이션 클래스"에 추가적인 구성을 정의할 수 있도록 해줍니다.
      </p>
   </def>
   <def title="프로그램 진입점 – main()">
      <p><a href="basic-syntax.md#program-entry-point"><code>main()</code></a> 함수는 애플리케이션의 진입점(Entry point)입니다.</p>
      <p>이 함수는 <code>DemoApplication</code> 클래스 외부에 <a href="functions.md#function-scope">최상위 함수(Top-level function)</a>로 선언되어 있습니다. <code>main()</code> 함수는 Spring의 <code>runApplication(&#42;args)</code> 함수를 호출하여 Spring Framework로 애플리케이션을 시작합니다.</p>
   </def>
   <def title="가변 인자 – args: Array&lt;String&gt;">
      <p><code>runApplication()</code> 함수의 선언부를 확인해보면, 해당 함수의 파라미터가 <a href="functions.md#variable-number-of-arguments-varargs"><code>vararg</code> 변경자</a>로 표시되어 있는 것을 볼 수 있습니다: <code>vararg args: String</code>.
        이는 함수에 가변적인 개수의 String 인자를 전달할 수 있음을 의미합니다.
      </p>
   </def>
   <def title="스프레드 연산자 – (*args)">
      <p><code>args</code>는 <code>main()</code> 함수의 파라미터로, String 배열로 선언되어 있습니다.
        문자열 배열이 있고 그 내용을 함수에 전달하고자 하므로, 스프레드 연산자(배열 앞에 별표 기호 <code>&#42;</code> 붙이기)를 사용합니다.
      </p>
   </def>
</deflist>

## 컨트롤러 생성하기 {id="create-a-controller"}

이제 애플리케이션을 실행할 준비가 되었지만, 먼저 로직을 추가해 보겠습니다.

Spring 애플리케이션에서는 웹 요청을 처리하기 위해 컨트롤러를 사용합니다.
동일한 패키지 내에서 `DemoApplication.kt` 파일 옆에 `MessageController.kt` 파일을 생성하고 다음과 같이 `MessageController` 클래스를 작성합니다.

```kotlin
// MessageController.kt
package com.example.demo

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
class MessageController {
    @GetMapping("/")
    fun index(@RequestParam("name") name: String) = "Hello, $name!"
}
```

<deflist collapsible="true">
   <def title="@RestController 어노테이션">
      <p>Spring에게 <code>MessageController</code>가 REST 컨트롤러임을 알려주어야 하므로, <code>@RestController</code> 어노테이션을 지정해야 합니다.</p>
      <p>이 어노테이션을 지정하면 이 클래스가 <code>DemoApplication</code> 클래스와 동일한 패키지에 있으므로 컴포넌트 스캔에 의해 탐색됩니다.</p>
   </def>
   <def title="@GetMapping 어노테이션">
      <p><code>@GetMapping</code>은 HTTP GET 호출에 해당하는 엔드포인트를 구현하는 REST 컨트롤러의 함수를 나타냅니다.</p>
      <code-block lang="kotlin">
      @GetMapping("/")
      fun index(@RequestParam("name") name: String) = "Hello, $name!"
      </code-block>
   </def>
   <def title="@RequestParam 어노테이션">
      <p>함수 파라미터인 <code>name</code>에는 <code>@RequestParam</code> 어노테이션이 붙어 있습니다. 이 어노테이션은 메서드 파라미터가 웹 요청 파라미터에 바인딩되어야 함을 나타냅니다.</p>
      <p>따라서 루트 경로로 애플리케이션에 접근하면서 <code>/?name=&lt;your-value&gt;</code>와 같이 "name"이라는 요청 파라미터를 제공하면, 해당 파라미터 값이 <code>index()</code> 함수를 호출하기 위한 인자로 사용됩니다.</p>
   </def>
   <def title="단일 표현식 함수 – index()">
      <p><code>index()</code> 함수는 하나의 문장만을 포함하므로 <a href="functions.md#single-expression-functions">단일 표현식 함수(Single-expression function)</a>로 선언할 수 있습니다.</p>
      <p>즉, 중괄호를 생략하고 등호 <code>=</code> 뒤에 본문을 지정할 수 있습니다.</p>
   </def>
   <def title="함수 반환 타입 추론">
      <p><code>index()</code> 함수는 반환 타입을 명시적으로 선언하지 않습니다. 대신 컴파일러가 등호 <code>=</code> 우측에 있는 표현식의 결과를 보고 반환 타입을 추론합니다.</p>
      <p><code>Hello, $name!</code> 표현식의 타입이 <code>String</code>이므로, 함수의 반환 타입 역시 <code>String</code>이 됩니다.</p>
   </def>
   <def title="문자열 템플릿 – $name">
      <p><code>Hello, $name!</code> 표현식은 Kotlin에서 <a href="strings.md#string-templates"><i>문자열 템플릿(String template)</i></a>이라고 부릅니다.</p>
      <p>문자열 템플릿은 표현식이 내장된 문자열 리터럴입니다.</p>
      <p>이는 문자열 연결(concatenation) 연산을 편리하게 대체할 수 있는 방법입니다.</p>
   </def>
</deflist>

## 애플리케이션 실행하기 {id="run-the-application"}

이제 Spring 애플리케이션을 실행할 준비가 되었습니다.

1. `DemoApplication.kt` 파일에서 `main()` 메서드 옆의 거터(gutter)에 있는 녹색 **Run** 아이콘을 클릭합니다.

    ![Spring Boot 애플리케이션 실행](run-spring-boot-application.png){width=700}
    
    > 터미널에서 `./gradlew bootRun` 명령어를 실행할 수도 있습니다.
    >
    {style="tip"}

    이렇게 하면 로컬 컴퓨터에서 서버가 시작됩니다.

2. 애플리케이션이 시작되면 다음 URL을 엽니다.

    ```text
    http://localhost:8080?name=John
    ```

    응답으로 "Hello, John!"이 출력되는 것을 확인할 수 있습니다.

    ![Spring 애플리케이션 응답](spring-application-response.png){width=700}

## 다음 단계 {id="next-step"}

튜토리얼의 다음 파트에서는 Kotlin 데이터 클래스와 이를 애플리케이션에서 활용하는 방법에 대해 알아봅니다.

<list id="tour-nav">
  <li>
    <a as="button" href="jvm-spring-boot-add-data-class.md" mode="classic" icon="arrow-right" icon-position="right">다음 단계</a>
  </li>
</list>