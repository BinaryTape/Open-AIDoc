[//]: # (title: 인터페이스(Interfaces))

Kotlin의 인터페이스는 추상 메서드의 선언뿐만 아니라 메서드의 구현도 포함할 수 있습니다. 추상 클래스와의 차이점은 인터페이스는 상태(state)를 저장할 수 없다는 점입니다. 인터페이스는 프로퍼티를 가질 수 있지만, 이는 추상적이거나 접근자(accessor) 구현을 제공해야 합니다.

인터페이스는 `interface` 키워드를 사용하여 정의합니다.

```kotlin
interface MyInterface {
    fun bar()
    fun foo() {
      // 선택적 본문
    }
}
```

## 인터페이스 구현(Implementing interfaces) {id="implementing-interfaces"}

클래스나 객체는 하나 이상의 인터페이스를 구현할 수 있습니다.

```kotlin
class Child : MyInterface {
    override fun bar() {
        // 본문
    }
}
```

## 인터페이스의 프로퍼티(Properties in interfaces) {id="properties-in-interfaces"}

인터페이스에서 프로퍼티를 선언할 수 있습니다. 인터페이스에 선언된 프로퍼티는 추상적이거나 접근자에 대한 구현을 제공할 수 있습니다. 인터페이스에 선언된 프로퍼티는 뒷받침하는 필드(backing field)를 가질 수 없으므로, 인터페이스에 선언된 접근자는 이를 참조할 수 없습니다.

```kotlin
interface MyInterface {
    val prop: Int // 추상 프로퍼티

    val propertyWithImplementation: String
        get() = "foo"

    fun foo() {
        print(prop)
    }
}

class Child : MyInterface {
    override val prop: Int = 29
}
```

## 인터페이스 상속(Interfaces Inheritance) {id="interfaces-inheritance"}

인터페이스는 다른 인터페이스로부터 파생될 수 있으며, 이는 상위 인터페이스 멤버에 대한 구현을 제공하거나 새로운 함수와 프로퍼티를 선언할 수 있음을 의미합니다. 당연히 이러한 인터페이스를 구현하는 클래스는 누락된 구현만 정의하면 됩니다.

```kotlin
interface Named {
    val name: String
}

interface Person : Named {
    val firstName: String
    val lastName: String
    
    override val name: String get() = "$firstName $lastName"
}

data class Employee(
    // 'name'을 구현할 필요가 없음
    override val firstName: String,
    override val lastName: String,
    val position: Position
) : Person
```

## 오버라이딩 충돌 해결(Resolving overriding conflicts) {id="resolving-overriding-conflicts"}

상위 타입 목록에 여러 타입을 선언하면, 동일한 메서드에 대해 둘 이상의 구현을 상속받을 수 있습니다.

```kotlin
interface A {
    fun foo() { print("A") }
    fun bar()
}

interface B {
    fun foo() { print("B") }
    fun bar() { print("bar") }
}

class C : A {
    override fun bar() { print("bar") }
}

class D : A, B {
    override fun foo() {
        super<A>.foo()
        super<B>.foo()
    }

    override fun bar() {
        super<B>.bar()
    }
}
```

인터페이스 *A*와 *B*는 모두 *foo()*와 *bar()* 함수를 선언하고 있습니다. 두 인터페이스 모두 *foo()*를 구현하고 있지만, *bar()*는 *B*만 구현하고 있습니다 (*A*에서 *bar()*가 추상으로 표시되지 않은 이유는 함수 본문이 없는 경우 인터페이스에서는 이것이 기본이기 때문입니다). 이제 *A*로부터 구체 클래스 *C*를 파생시킨다면, *bar()*를 오버라이드하여 구현을 제공해야 합니다.

하지만 *A*와 *B*로부터 *D*를 파생시킨다면, 여러 인터페이스로부터 상속받은 모든 메서드를 구현해야 하며, *D*가 이를 구체적으로 어떻게 구현할지 지정해야 합니다. 이 규칙은 단일 구현을 상속받은 메서드(*bar()*)와 여러 구현을 상속받은 메서드(*foo()*) 모두에 적용됩니다.

## 인터페이스 함수에 대한 JVM 디폴트 메서드 생성 {id="jvm-default-method-generation-for-interface-functions"}

JVM에서 인터페이스에 선언된 함수는 디폴트 메서드(default method)로 컴파일됩니다.
다음 값과 함께 `-jvm-default` 컴파일러 옵션을 사용하여 이 동작을 제어할 수 있습니다.

* `enable` (기본값): 인터페이스에 디폴트 구현을 생성하고 서브클래스 및 `DefaultImpls` 클래스에 브리지(bridge) 함수를 포함합니다. 이전 Kotlin 버전과의 바이너리 호환성을 유지하려면 이 모드를 사용하세요.
* `no-compatibility`: 인터페이스에 디폴트 구현만 생성합니다. 이 모드는 호환성 브리지와 `DefaultImpls` 클래스를 건너뛰므로 새로운 Kotlin 코드에 적합합니다.
* `disable`: 디폴트 메서드를 생성하지 않고 호환성 브리지와 `DefaultImpls` 클래스만 생성합니다.

`-jvm-default` 컴파일러 옵션을 설정하려면 Gradle Kotlin DSL에서 `jvmDefault` 프로퍼티를 설정하세요.

```kotlin
kotlin {
    compilerOptions {
        jvmDefault = JvmDefaultMode.NO_COMPATIBILITY
    }
}
```
