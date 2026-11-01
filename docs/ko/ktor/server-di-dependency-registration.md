[//]: # (title: 의존성 등록)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<b>필요한 의존성</b>: <code>io.ktor:ktor-server-di</code>
</p>
<var name="example_name" value="server-di"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

Ktor의 [의존성 주입(DI)](server-dependency-injection.md) 컨테이너는 애플리케이션이 의존하는 객체를 생성하는 방법을 알아야 합니다. 이 과정을 의존성 등록이라고 합니다.

### 기본 의존성 등록 {id="basic-dependency-registration"}

기본 의존성 등록은 코드 내에서 이루어지며, 일반적으로 `dependencies {}` 블록을 사용하여 `Application` 모듈 내에서 수행됩니다.

[람다](#lambda-registration), [함수 참조](#function-reference), [클래스 참조](#class-reference) 또는 [생성자 참조](#constructor-reference)를 제공하여 의존성을 등록할 수 있습니다.

#### 람다 사용하기 {id="lambda-registration"}

인스턴스가 생성되는 방식을 완전히 제어하고 싶을 때 람다를 사용합니다.

```kotlin
dependencies {
    provide<GreetingService> { GreetingServiceImpl() }
}
```
이렇게 하면 `GreetingService`의 제공자(provider)가 등록됩니다. `GreetingService`가 요청될 때마다 인스턴스를 생성하기 위해 람다가 실행됩니다.

#### 생성자 참조 사용하기 {id="constructor-reference"}

클래스를 생성자를 통해 생성할 수 있고 모든 생성자 매개변수가 DI 컨테이너에 이미 등록되어 있다면 생성자 참조를 사용할 수 있습니다.

```kotlin
dependencies {
    provide<GreetingService>(::GreetingServiceImpl)
}
```
이는 애플리케이션에 `GreetingServiceImpl`의 생성자를 사용하도록 지시하며, 매개변수는 DI가 자동으로 해결하도록 합니다.

#### 클래스 참조 사용하기 {id="class-reference"}

인터페이스에 바인딩하지 않고 구체 클래스를 등록할 수 있습니다.

```kotlin
dependencies {
    provide(BankServiceImpl::class)
}
```
이 경우 의존성은 해당 `BankServiceImpl` 타입을 통해 해결됩니다.
구현 타입이 직접 주입되고 추상화가 필요하지 않을 때 유용합니다.

#### 함수 참조 사용하기 {id="function-reference"}

인스턴스를 생성하고 반환하는 함수를 등록할 수 있습니다.

```kotlin
dependencies {
    provide(::createBankTeller)
}
```

DI 컨테이너는 함수 매개변수를 해결하고 반환 값을 의존성 인스턴스로 사용합니다.

#### 팩토리 람다 사용하기 {id="factory-lambda-registration"}

함수 자체를 의존성으로 등록할 수 있습니다.

```kotlin
dependencies {
    provide<() -> GreetingService> {
        { GreetingServiceImpl() }
    }
}
```

이렇게 하면 주입받은 후 수동으로 호출하여 새 인스턴스를 생성할 수 있는 함수가 등록됩니다.

### 이름 지정 의존성 등록 {id="named-registration"}

동일한 타입의 여러 제공자를 구별하기 위해 등록 시 의존성에 이름을 지정할 수 있습니다.

단일 타입에 대해 둘 이상의 구현 또는 인스턴스를 등록하고, 의존성을 해결할 때 이들 중에서 명시적으로 선택해야 하는 경우에 유용합니다.

의존성에 이름을 지정하려면 `provide()` 함수의 첫 번째 인수로 이름을 전달합니다.

```kotlin
dependencies {
    provide("default") { GreetingServiceImpl() }
    provide("alternative") { AlternativeGreetingServiceImpl() }
}
```

이름이 지정된 의존성은 [`@Named` 어노테이션을 사용하여 명시적으로 해결](server-di-dependency-resolution.md#resolve-named)해야 합니다.

### 설정을 통한 의존성 등록 {id="configuration-based-dependency-registration"}

설정 파일에서 클래스패스(classpath) 참조를 사용하여 선언적으로 의존성을 구성할 수 있습니다. 객체를 반환하는 함수나 생성자 매개변수를 해결할 수 있는 클래스를 지정할 수 있습니다.

설정 파일의 `ktor.application.dependencies` 그룹 아래에 의존성을 나열합니다.

<Tabs>
<TabItem title="application.yaml">

```yaml
ktor:
  application:
    dependencies:
      - com.example.RepositoriesKt.provideDatabase
      - com.example.UserRepository
```

</TabItem>
</Tabs>

Ktor는 DI 컨테이너를 사용하여 함수 및 생성자 매개변수를 자동으로 해결합니다.