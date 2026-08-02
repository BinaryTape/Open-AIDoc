[//]: # (title: 上下文参数)

> 上下文参数（Context parameters）取代了名为[上下文接收器 (context receivers)](whatsnew1620.md#prototype-of-context-receivers-for-kotlin-jvm)的旧实验性功能。
> 您可以在[上下文参数设计文档](https://github.com/Kotlin/KEEP/blob/master/proposals/context-parameters.md#summary-of-changes-from-the-previous-proposal)中找到它们的主要区别。
> 要从上下文接收器迁移到上下文参数，您可以使用 IntelliJ IDEA 中的辅助支持，详见相关的[博客文章](https://blog.jetbrains.com/kotlin/2025/04/update-on-context-parameters/)。
>
{style="tip"}

上下文参数允许函数／方法和属性声明在周围上下文中隐式可用的依赖项。

使用上下文参数，您无需手动传递那些在函数／方法调用集合中共享且很少更改的值，例如服务或依赖项。

要为属性和函数／方法声明上下文参数，请使用 `context` 关键字，后跟参数列表，每个参数声明为 `name: Type`。以下是一个依赖于 `UserService` 接口的示例：

```kotlin
// UserService 定义了上下文中所需的依赖项 
interface UserService {
    fun log(message: String)
    fun findUserById(id: Int): String
}

// 声明一个带有上下文参数的函数／方法
context(users: UserService)
fun outputMessage(message: String) {
    // 使用来自上下文的 log
    users.log("Log: $message")
}

// 声明一个带有上下文参数的属性
context(users: UserService)
val firstUser: String
    // 使用来自上下文的 findUserById    
    get() = users.findUserById(1)

fun main() {
    val users = object : UserService {
        override fun log(message: String) {
            println(message)
        }

        override fun findUserById(id: Int): String {
            return "User $id"
        }
    }

    context(users) {
        outputMessage("Looking up the first user")
        println(firstUser)
        // User 1
    }
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4"}

当您不需要直接引用参数时，可以使用 `_` 作为上下文参数名称。匿名上下文参数仍可满足被调用函数／方法所需的上下文参数，但您无法通过名称访问它。要显式访问其值，请使用 `contextOf<T>()`：

```kotlin
// 使用 "_" 作为上下文参数名称
context(_: UserService)
fun logWelcome() {
    // 匿名参数满足了 outputMessage() 
    // 所需的 UserService 上下文参数
    outputMessage("Welcome!")

    // 显式检索 UserService 的值
    contextOf<UserService>().log("Hi!")
}
```

## 上下文参数解析

Kotlin 在调用站点通过在当前作用域中搜索匹配的上下文值来解析上下文参数。Kotlin 通过类型来匹配它们。
如果同一作用域级别存在多个兼容的值，编译器将报告歧义：

```kotlin
// UserService 定义了上下文中所需的依赖项
interface UserService {
    fun log(message: String)
}

// 声明一个带有上下文参数的函数／方法
context(users: UserService)
fun outputMessage(message: String) {
    users.log("Log: $message")
}

fun main() {
    // 实现 UserService 
    val serviceA = object : UserService {
        override fun log(message: String) = println("A: $message")
    }

    // 实现 UserService
    val serviceB = object : UserService {
        override fun log(message: String) = println("B: $message")
    }

    // serviceA 和 serviceB 在调用站点都匹配预期的 UserService 类型
    context(serviceA, serviceB) {
        // 这将导致歧义错误
        outputMessage("This will not compile")
    }
}
```

### 显式传递上下文实参
<primary-label ref="experimental-opt-in"/>

当重载仅因上下文参数而异时，如果存在多个匹配的上下文值，则调用可能会产生歧义。

要解决歧义，请在调用站点传递显式上下文实参：

```kotlin
class EmailSender
class SmsSender

context(emailSender: EmailSender)
fun sendNotification() {
    println("Sent email notification")
}

context(smsSender: SmsSender)
fun sendNotification() {
    println("Sent SMS notification")
}

context(defaultEmailSender: EmailSender, defaultSmsSender: SmsSender)
fun notifyUser() {
    // 选择带有 EmailSender 上下文参数的重载
    sendNotification(emailSender = defaultEmailSender)

    // 选择带有 SmsSender 上下文参数的重载
    sendNotification(smsSender = defaultSmsSender)
}
```

您还可以使用显式上下文实参来减少某些函数／方法调用中的嵌套：

* 对于单个调用，使用显式上下文实参使调用更易读。
* 如果多个调用使用相同的上下文实参，请使用 `context()` 函数／方法。

此功能是[实验性功能](components-stability.md#stability-levels-explained)。要启用它，请在您的构建文件中添加以下编译器选项：

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xexplicit-context-arguments")
    }
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xexplicit-context-arguments</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

## 限制

上下文参数正在持续改进中，目前的一些限制包括：

* 构造函数不能声明上下文参数。
* 带有上下文参数的属性不能具有支持字段或初始值设定项。
* 带有上下文参数的属性不能使用委托。

尽管有这些限制，上下文参数仍通过简化的 SQL 注入、改进的 DSL 设计和作用域操作简化了依赖项管理。