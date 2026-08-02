[//]: # (title: Context 參數)

> Context 參數取代了一項名為 [context receivers](whatsnew1620.md#prototype-of-context-receivers-for-kotlin-jvm) 的舊實驗性功能。
> 您可以在 [Context 參數設計文件](https://github.com/Kotlin/KEEP/blob/master/proposals/context-parameters.md#summary-of-changes-from-the-previous-proposal) 中找到它們的主要差異。
> 若要從 context receivers 遷移到 Context 參數，您可以使用 IntelliJ IDEA 中的輔助支援，如相關的 [部落格文章](https://blog.jetbrains.com/kotlin/2025/04/update-on-context-parameters/) 中所述。
>
{style="tip"}

Context 參數允許函式和屬性宣告在周圍 context 中隱含可用的相依性。

透過 Context 參數，您不需要手動傳遞在多個函式呼叫之間共享且鮮少變動的值，例如服務或相依性。

若要為屬性和函式宣告 Context 參數，請使用 `context` 關鍵字，後跟參數列表，每個參數宣告為 `name: Type`。以下是一個相依於 `UserService` 介面的範例：

```kotlin
// UserService 定義了 context 中所需的相依性 
interface UserService {
    fun log(message: String)
    fun findUserById(id: Int): String
}

// 宣告一個帶有 Context 參數的函式
context(users: UserService)
fun outputMessage(message: String) {
    // 使用來自 context 的 log
    users.log("Log: $message")
}

// 宣告一個帶有 Context 參數的屬性
context(users: UserService)
val firstUser: String
    // 使用來自 context 的 findUserById    
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

當您不需要直接參照參數時，可以使用 `_` 作為 Context 參數名稱。匿名 Context 參數仍可滿足所呼叫函式所需的 Context 參數，但您無法透過名稱存取它。若要明確存取其值，請使用 `contextOf<T>()`：

```kotlin
// 使用 "_" 作為 Context 參數名稱
context(_: UserService)
fun logWelcome() {
    // 匿名參數滿足了 outputMessage() 
    // 所需的 UserService Context 參數
    outputMessage("Welcome!")

    // 明確檢索 UserService 的值
    contextOf<UserService>().log("Hi!")
}
```

## Context 參數解析

Kotlin 在呼叫點透過在目前作用域中搜尋匹配的 context 值來解析 Context 參數。Kotlin 根據其型別進行匹配。
如果同一作用域層級中存在多個相容的值，編譯器會報告歧義（ambiguity）：

```kotlin
// UserService 定義了 context 中所需的相依性
interface UserService {
    fun log(message: String)
}

// 宣告一個帶有 Context 參數的函式
context(users: UserService)
fun outputMessage(message: String) {
    users.log("Log: $message")
}

fun main() {
    // 實作 UserService 
    val serviceA = object : UserService {
        override fun log(message: String) = println("A: $message")
    }

    // 實作 UserService
    val serviceB = object : UserService {
        override fun log(message: String) = println("B: $message")
    }

    // 在呼叫點，serviceA 和 serviceB 都符合預期的 UserService 型別
    context(serviceA, serviceB) {
        // 這會導致歧義錯誤
        outputMessage("This will not compile")
    }
}
```

### 明確傳遞 Context 引數
<primary-label ref="experimental-opt-in"/>

當多載（overload）僅因 Context 參數而異時，如果存在多個相匹配的 context 值，呼叫可能會變得具有歧義。

若要解決歧義，請在呼叫點傳遞一個明確的 Context 引數：

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
    // 選擇具有 EmailSender Context 參數的多載
    sendNotification(emailSender = defaultEmailSender)

    // 選擇具有 SmsSender Context 參數的多載
    sendNotification(smsSender = defaultSmsSender)
}
```

您也可以使用明確 Context 引數來減少某些函式呼叫中的巢狀結構：

* 對於單個呼叫，使用明確 Context 引數使呼叫更易於閱讀。
* 如果多個呼叫使用相同的 Context 引數，請使用 `context()` 函式。

此功能目前處於 [實驗性階段](components-stability.md#stability-levels-explained)。若要啟用（opt in），請將以下編譯器選項新增至您的建置檔案中：

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

Context 參數仍在持續改進中，目前的限制包括：

* 建構函式無法宣告 Context 參數。
* 具有 Context 參數的屬性不能有支援欄位或初始設定式。
* 具有 Context 參數的屬性不能使用委託。

儘管有這些限制，Context 參數仍能透過簡化的相依注入、改進的 DSL 設計和限定作用域的操作來簡化相依性管理。