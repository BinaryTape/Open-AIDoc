<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: 协程与通道 – 教程)

在本教程中，您将学习如何在 IntelliJ IDEA 中使用协程来执行网络请求，而无需阻塞底层线程或使用回调。

> 无需具备协程方面的先验知识，但希望您熟悉基本的 Kotlin 语法。
>
{style="tip"}

您将学习：

* 为什么以及如何使用挂起函数来执行网络请求。
* 如何使用协程并发地发送请求。
* 如何使用通道在不同协程之间共享信息。

对于网络请求，您将需要 [Retrofit](https://square.github.io/retrofit/) 库，但本教程中显示的方法对于任何其他支持协程的库都同样适用。

> 您可以在[项目仓库](http://github.com/kotlin-hands-on/intro-coroutines)的 `solutions` 分支中找到所有任务的解决方案。
>
{style="tip"}

## 开始之前

1. 下载并安装最新版本的 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/index.html)。
2. 在欢迎界面上选择 **Get from VCS** 或选择 **File | New | Project from Version Control** 来克隆[项目模板](http://github.com/kotlin-hands-on/intro-coroutines)。

   您也可以通过命令行进行克隆：

   ```Bash
   git clone https://github.com/kotlin-hands-on/intro-coroutines
   ```

### 生成 GitHub 开发者令牌

您将在项目中使用 GitHub API。要获得访问权限，请提供您的 GitHub 帐户名以及密码或令牌。如果您启用了双重身份验证，仅需令牌即可。

生成一个新的 GitHub 令牌，以便在[您的帐户](https://github.com/settings/tokens/new)中使用 GitHub API：

1. 指定令牌的名称，例如 `coroutines-tutorial`：

   ![生成新的 GitHub 令牌](generating-token.png){width=700}

2. 不要选择任何作用域。点击页面底部的 **Generate token**。
3. 复制生成的令牌。

### 运行代码

该程序会加载给定组织（默认名为 “kotlin”）下所有仓库的贡献者。稍后您将添加逻辑，按贡献次数对用户进行排序。

1. 打开 `src/contributors/main.kt` 文件并运行 `main()` 函数。您将看到以下窗口：

   ![第一个窗口](initial-window.png){width=500}

   如果字体太小，可以通过更改 `main()` 函数中 `setDefaultFontSize(18f)` 的值进行调整。

2. 在相应字段中提供您的 GitHub 用户名和令牌（或密码）。
3. 确保在 _Variant_ 下拉菜单中选择了 _BLOCKING_ 选项。
4. 点击 _Load contributors_。UI 应该会冻结一段时间，然后显示贡献者列表。
5. 打开程序输出以确保数据已加载。每次成功请求后都会记录贡献者列表。

有多种方法可以实现此逻辑：使用[阻塞请求](#blocking-requests)或[回调](#callbacks)。您将把这些解决方案与使用[协程](#coroutines)的解决方案进行比较，并了解如何使用[通道](#channels)在不同协程之间共享信息。

## 阻塞请求

您将使用 [Retrofit](https://square.github.io/retrofit/) 库向 GitHub 执行 HTTP 请求。它允许请求给定组织下的仓库列表以及每个仓库的贡献者列表：

```kotlin
interface GitHubService {
    @GET("orgs/{org}/repos?per_page=100")
    fun getOrgReposCall(
        @Path("org") org: String
    ): Call<List<Repo>>

    @GET("repos/{owner}/{repo}/contributors?per_page=100")
    fun getRepoContributorsCall(
        @Path("owner") owner: String,
        @Path("repo") repo: String
    ): Call<List<User>>
}
```

`loadContributorsBlocking()` 函数使用此 API 来获取给定组织的贡献者列表。

1. 打开 `src/tasks/Request1Blocking.kt` 查看其实现：

    ```kotlin
    fun loadContributorsBlocking(
        service: GitHubService,
        req: RequestData
    ): `List<User>` {
        val repos = service
            .getOrgReposCall(req.org)   // #1
            .execute()                  // #2
            .also { logRepos(req, it) } // #3
            .body() ?: emptyList()      // #4
    
        return repos.flatMap { repo ->
            service
                .getRepoContributorsCall(req.org, repo.name) // #1
                .execute()                                   // #2
                .also { logUsers(repo, it) }                 // #3
                .bodyList()                                  // #4
        }.aggregate()
    }
    ```

    * 首先，您获取给定组织下的仓库列表，并将其存储在 `repos` 列表中。然后对于每个仓库，请求贡献者列表，并将所有列表合并为一个最终的贡献者列表。
    * `getOrgReposCall()` 和 `getRepoContributorsCall()` 都返回 `*Call` 类的实例 (`#1`)。此时，尚未发送任何请求。
    * 然后调用 `*Call.execute()` 来执行请求 (`#2`)。`execute()` 是一个同步调用，会阻塞底层线程。
    * 当您收到响应时，通过调用特定的 `logRepos()` 和 `logUsers()` 函数来记录结果 (`#3`)。如果 HTTP 响应包含错误，该错误将在此处记录。
    * 最后，获取响应体，其中包含您需要的数据。在本教程中，如果发生错误，您将使用空列表作为结果，并记录相应的错误 (`#4`)。

2. 为了避免重复调用 `.body() ?: emptyList()`，声明了一个扩展函数 `bodyList()`：

    ```kotlin
    fun <T> Response<List<T>>.bodyList(): `List<T>` {
        return body() ?: emptyList()
    }
    ```  

3. 再次运行程序并查看 IntelliJ IDEA 中的系统输出。它应该类似于：

    ```text
    1770 [AWT-EventQueue-0] INFO  Contributors - kotlin: loaded 40 repos
    2025 [AWT-EventQueue-0] INFO  Contributors - kotlin-examples: loaded 23 contributors
    2229 [AWT-EventQueue-0] INFO  Contributors - kotlin-koans: loaded 45 contributors
    ...
    ```

    * 每行开头的第一个项目是程序启动以来经过的毫秒数，然后是方括号内的线程名称。您可以查看加载请求是从哪个线程调用的。
    * 每行的最后一项是实际消息：加载了多少个仓库或贡献者。

    此日志输出证明所有结果都是从主线程记录的。当您使用 _BLOCKING_ 选项运行代码时，窗口会冻结，在加载完成之前不会响应输入。所有的请求都执行在调用 `loadContributorsBlocking()` 的同一个线程中，即主 UI 线程（在 Swing 中，它是 AWT 事件分发线程）。这个主线程变得阻塞，这就是 UI 冻结的原因：

    ![被阻塞的主线程](blocking.png){width=700}
    
    在贡献者列表加载完成后，结果会更新。

4. 在 `src/contributors/Contributors.kt` 中，找到负责选择贡献者加载方式的 `loadContributors()` 函数，并查看 `loadContributorsBlocking()` 是如何被调用的：

    ```kotlin
    when (getSelectedVariant()) {
        BLOCKING -> { // Blocking UI thread
            val users = loadContributorsBlocking(service, req)
            updateResults(users, startTime)
        }
    }
    ```

    * `updateResults()` 调用紧跟在 `loadContributorsBlocking()` 调用之后。
    * `updateResults()` 会更新 UI，因此必须始终从 UI 线程调用。
    * 由于 `loadContributorsBlocking()` 也是从 UI 线程调用的，因此 UI 线程被阻塞，UI 冻结。

### 任务 1

第一个任务帮助您熟悉任务领域。目前，每个贡献者的名字都会重复多次，参与过的每个项目都会出现一次。实现 `aggregate()` 函数来合并用户，使每个贡献者仅添加一次。`User.contributions` 属性应包含给定用户在 _所有_ 项目中的贡献总数。结果列表应根据贡献次数按降序排序。

打开 `src/tasks/Aggregation.kt` 并实现 `List<User>.aggregate()` 函数。用户应按其贡献总数进行排序。

相应的测试文件 `test/tasks/AggregationKtTest.kt` 显示了预期结果的示例。

> 您可以使用 [IntelliJ IDEA 快捷键](https://www.jetbrains.com/help/idea/create-tests.html#test-code-navigation) `Ctrl+Shift+T` / `Standard ⌘ T` 在源代码和测试类之间自动跳转。
>
{style="tip"}

完成此任务后，“kotlin”组织的结果列表应类似于：

![“kotlin”组织的列表](aggregate.png){width=500}

#### 任务 1 的解决方案 {initial-collapse-state="collapsed" collapsible="true"}

1. 要按登录名对用户进行分组，请使用 [`groupBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/group-by.html)，它会返回一个从登录名到该用户在不同仓库中所有出现情况的映射。
2. 对于每个映射条目，计算每个用户的贡献总数，并根据给定名称和贡献总数创建一个 `User` 类的新实例。
3. 将生成的列表按降序排序：

    ```kotlin
    fun List<User>.aggregate(): `List<User>` =
        groupBy { it.login }
            .map { (login, group) -> User(login, group.sumOf { it.contributions }) }
            .sortedByDescending { it.contributions }
    ```

另一种替代方案是使用 [`groupingBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/grouping-by.html) 函数而不是 `groupBy()`。

## 回调

之前的解决方案可以工作，但它会阻塞线程并因此冻结 UI。避免这种情况的一种传统方法是使用 _回调_。

您可以将应在操作完成后立即调用的代码提取到单独的回调（通常是 lambda 表达式）中，并将该 lambda 传递给调用者，以便稍后调用，而不是直接调用。

为了使 UI 保持响应，您可以将整个计算移动到单独的线程，或者切换到使用回调而不是阻塞调用的 Retrofit API。

### 使用后台线程

1. 打开 `src/tasks/Request2Background.kt` 查看其实现。首先，整个计算被移动到不同的线程。`thread()` 函数会启动一个新线程：

    ```kotlin
    thread {
        loadContributorsBlocking(service, req)
    }
    ```

    现在所有的加载都已经移动到了一个单独的线程，主线程就空闲了，可以处理其他任务：

    ![被释放的主线程](background.png){width=700}

2. `loadContributorsBackground()` 函数的签名发生了变化。它将 `updateResults()` 回调作为最后一个实参，以便在所有加载完成后调用它：

    ```kotlin
    fun loadContributorsBackground(
        service: GitHubService, req: RequestData,
        updateResults: (List<User>) -> Unit
    )
    ```

3. 现在调用 `loadContributorsBackground()` 时，`updateResults()` 调用位于回调中，而不是像之前那样紧随其后：

    ```kotlin
    loadContributorsBackground(service, req) { users ->
        SwingUtilities.invokeLater {
            updateResults(users, startTime)
        }
    }
    ```

    通过调用 `SwingUtilities.invokeLater`，您可以确保更新结果的 `updateResults()` 调用发生在主 UI 线程（AWT 事件分发线程）上。

然而，如果您尝试通过 `BACKGROUND` 选项加载贡献者，您会发现列表已更新但 UI 没有任何变化。

### 任务 2

修复 `src/tasks/Request2Background.kt` 中的 `loadContributorsBackground()` 函数，使结果列表显示在 UI 中。

#### 任务 2 的解决方案 {initial-collapse-state="collapsed" collapsible="true"}

如果您尝试加载贡献者，您可以在日志中看到贡献者已加载，但结果并未显示。要修复此问题，请对生成的用户列表调用 `updateResults()`：

```kotlin
thread {
    updateResults(loadContributorsBlocking(service, req))
}
```

确保显式调用回调中传递的逻辑。否则，什么都不会发生。

### 使用 Retrofit 回调 API

在之前的解决方案中，整个加载逻辑被移动到了后台线程，但这仍然不是资源的最佳利用方式。所有的加载请求都是按顺序进行的，线程在等待加载结果时被阻塞，而它本可以处理其他任务。具体来说，该线程可以开始加载另一个请求，以便更早地接收整个结果。

处理每个仓库的数据随后应分为两部分：加载和处理生成的响应。第二部分 _处理_ 应该提取到回调中。

这样，在接收到前一个仓库的结果（并调用相应的回调）之前，就可以开始加载每个仓库：

![使用回调 API](callbacks.png){width=700}

Retrofit 回调 API 可以帮助实现这一点。`Call.enqueue()` 函数会启动一个 HTTP 请求并接受一个回调作为实参。在此回调中，您需要指定每个请求后需要执行的操作。

打开 `src/tasks/Request3Callbacks.kt` 查看使用此 API 的 `loadContributorsCallbacks()` 实现：

```kotlin
fun loadContributorsCallbacks(
    service: GitHubService, req: RequestData,
    updateResults: (List<User>) -> Unit
) {
    service.getOrgReposCall(req.org).onResponse { responseRepos ->  // #1
        logRepos(req, responseRepos)
        val repos = responseRepos.bodyList()

        val allUsers = mutableListOf<User>()
        for (repo in repos) {
            service.getRepoContributorsCall(req.org, repo.name)
                .onResponse { responseUsers ->  // #2
                    logUsers(repo, responseUsers)
                    val users = responseUsers.bodyList()
                    allUsers += users
                }
            }
        }
        // TODO: Why doesn't this code work? How to fix that?
        updateResults(allUsers.aggregate())
    }
```

* 为方便起见，此代码片段使用了同一文件中声明的 `onResponse()` 扩展函数。它接受一个 lambda 表达式作为实参，而不是对象表达式。
* 处理响应的逻辑被提取到回调中：相应的 lambda 表达式分别从第 `#1` 行和第 `#2` 行开始。

然而，提供的解决方案并不奏效。如果您运行程序并通过选择 _CALLBACKS_ 选项加载贡献者，您会发现什么都没有显示。但是，来自 `Request3CallbacksKtTest` 的测试会立即返回其成功通过的结果。

思考一下为什么给定的代码没有按预期工作并尝试修复它，或者查看下面的解决方案。

### 任务 3 (可选)

重写 `src/tasks/Request3Callbacks.kt` 文件中的代码，以便显示加载的贡献者列表。

#### 任务 3 的第一次尝试方案 {initial-collapse-state="collapsed" collapsible="true"}

在当前的解决方案中，许多请求是并发启动的，这缩短了总加载时间。然而，结果并未加载。这是因为 `updateResults()` 回调在所有加载请求启动后立即被调用，而此时 `allUsers` 列表尚未填充数据。

您可以尝试通过如下更改来修复此问题：

```kotlin
val allUsers = mutableListOf<User>()
for ((index, repo) in repos.withIndex()) {   // #1
    service.getRepoContributorsCall(req.org, repo.name)
        .onResponse { responseUsers ->
            logUsers(repo, responseUsers)
            val users = responseUsers.bodyList()
            allUsers += users
            if (index == repos.lastIndex) {    // #2
                updateResults(allUsers.aggregate())
            }
        }
}
```

* 首先，您使用索引迭代仓库列表 (`#1`)。
* 然后，在每个回调中，检查它是否是最后一次迭代 (`#2`)。
* 如果是这种情况，则更新结果。

然而，这段代码也未能实现我们的目标。尝试自己寻找答案，或查看下面的解决方案。

#### 任务 3 的第二次尝试方案 {initial-collapse-state="collapsed" collapsible="true"}

由于加载请求是并发启动的，因此无法保证最后一个请求的结果会最后返回。结果可以以任何顺序返回。

因此，如果您将当前索引与 `lastIndex` 比较作为完成条件，您可能会面临丢失某些仓库结果的风险。

如果处理最后一个仓库的请求比之前的某些请求返回得更快（这很可能发生），那么耗时较长的请求的所有结果都将丢失。

解决此问题的一种方法是引入一个索引并检查是否所有的仓库都已处理完毕：

```kotlin
val allUsers = Collections.synchronizedList(mutableListOf<User>())
val numberOfProcessed = AtomicInteger()
for (repo in repos) {
    service.getRepoContributorsCall(req.org, repo.name)
        .onResponse { responseUsers ->
            logUsers(repo, responseUsers)
            val users = responseUsers.bodyList()
            allUsers += users
            if (numberOfProcessed.incrementAndGet() == repos.size) {
                updateResults(allUsers.aggregate())
            }
        }
}
```

这段代码使用了同步版本的列表和 `AtomicInteger()`，因为通常情况下，无法保证处理 `getRepoContributors()` 请求的不同回调始终从同一个线程调用。

#### 任务 3 的第三次尝试方案 {initial-collapse-state="collapsed" collapsible="true"}

一个更好的解决方案是使用 `CountDownLatch` 类。它存储一个由仓库数量初始化的计数器。处理每个仓库后，该计数器都会递减。然后它会一直等待，直到门闩计数减为零，然后再更新结果：

```kotlin
val countDownLatch = CountDownLatch(repos.size)
for (repo in repos) {
    service.getRepoContributorsCall(req.org, repo.name)
        .onResponse { responseUsers ->
            // 处理仓库
            countDownLatch.countDown()
        }
}
countDownLatch.await()
updateResults(allUsers.aggregate())
```

然后从主线程更新结果。这比将逻辑委托给子线程更直接。

在回顾了这三次尝试方案后，您可以看到，编写正确的回调代码并非易事且容易出错，尤其是在涉及多个底层线程和同步时。

> 作为额外的练习，您可以使用 RxJava 库通过响应式方法实现相同的逻辑。所有必要的依赖项以及使用 RxJava 的解决方案都可以在单独的 `rx` 分支中找到。您也可以完成本教程并实现或检查建议的 Rx 版本以进行对比。
>
{style="tip"}

## 挂起函数

您可以使用挂起函数实现相同的逻辑。不返回 `Call<List<Repo>>`，而是将 API 调用定义为[挂起函数](composing-suspending-functions.md)，如下所示：

```kotlin
interface GitHubService {
    @GET("orgs/{org}/repos?per_page=100")
    suspend fun getOrgRepos(
        @Path("org") org: String
    ): List<Repo>
}
```

* `getOrgRepos()` 被定义为 `suspend` 函数。当您使用挂起函数执行请求时，底层线程不会被阻塞。关于其工作原理的更多细节将在后面的章节中介绍。
* `getOrgRepos()` 直接返回结果，而不是返回 `Call`。如果结果不成功，则会抛出异常。

或者，Retrofit 允许返回包装在 `Response` 中的结果。在这种情况下，会提供结果体，并且可以手动检查错误。本教程使用返回 `Response` 的版本。

在 `src/contributors/GitHubService.kt` 中，将以下声明添加到 `GitHubService` 接口中：

```kotlin
interface GitHubService {
    // getOrgReposCall 和 getRepoContributorsCall 声明

    @GET("orgs/{org}/repos?per_page=100")
    suspend fun getOrgRepos(
        @Path("org") org: String
    ): Response<List<Repo>>

    @GET("repos/{owner}/{repo}/contributors?per_page=100")
    suspend fun getRepoContributors(
        @Path("owner") owner: String,
        @Path("repo") repo: String
    ): Response<List<User>>
}
```

### 任务 4

您的任务是更改加载贡献者的函数代码，以便利用两个新的挂起函数 `getOrgRepos()` 和 `getRepoContributors()`。新的 `loadContributorsSuspend()` 函数被标记为 `suspend` 以使用新的 API。

> 挂起函数不能在任何地方调用。从 `loadContributorsBlocking()` 调用挂起函数将导致错误，消息为 "Suspend function 'getOrgRepos' should be called only from a coroutine or another suspend function"（挂起函数 'getOrgRepos' 只能从协程或其他挂起函数中调用）。
>
{style="note"}

1. 将 `src/tasks/Request1Blocking.kt` 中定义的 `loadContributorsBlocking()` 实现复制到 `src/tasks/Request4Suspend.kt` 中定义的 `loadContributorsSuspend()` 中。
2. 修改代码，以便使用新的挂起函数来替代返回 `Call` 的函数。
3. 通过选择 _SUSPEND_ 选项运行程序，并确保在执行 GitHub 请求时 UI 仍能响应。

#### 任务 4 的解决方案 {initial-collapse-state="collapsed" collapsible="true"}

将 `.getOrgReposCall(req.org).execute()` 替换为 `.getOrgRepos(req.org)`，并对第二个 "contributors" 请求重复同样的替换：

```kotlin
suspend fun loadContributorsSuspend(service: GitHubService, req: RequestData): `List<User>` {
    val repos = service
        .getOrgRepos(req.org)
        .also { logRepos(req, it) }
        .bodyList()

    return repos.flatMap { repo ->
        service.getRepoContributors(req.org, repo.name)
            .also { logUsers(repo, it) }
            .bodyList()
    }.aggregate()
}
```

* `loadContributorsSuspend()` 应定义为 `suspend` 函数。
* 您不再需要调用之前返回 `Response` 的 `execute`，因为现在 API 函数直接返回 `Response`。请注意，此细节特定于 Retrofit 库。对于其他库，API 会有所不同，但概念是相同的。

## 协程

带有挂起函数的代码看起来与 “阻塞” 版本类似。与阻塞版本的主要区别在于，协程不是阻塞线程，而是被挂起：

```text
block -> suspend
thread -> coroutine
```

> 协程通常被称为轻量级线程，因为您可以在协程上运行代码，类似于在线程上运行代码。以前会阻塞的操作（必须避免的操作）现在可以改为挂起协程。
>
{style="note"}

### 启动新协程

如果您查看 `src/contributors/Contributors.kt` 中如何使用 `loadContributorsSuspend()`，您可以看到它是在 `launch` 内部被调用的。`launch` 是一个库函数，它接受一个 lambda 表达式作为实参：

```kotlin
launch {
    val users = loadContributorsSuspend(req)
    updateResults(users, startTime)
}
```

在这里，`launch` 启动了一个新的计算，负责加载数据并显示结果。该计算是可挂起的——在执行网络请求时，它会被挂起并释放底层线程。当网络请求返回结果时，计算将恢复。

这种可挂起的计算被称为 _协程_。因此，在这种情况下，`launch` _启动了一个新的协程_，负责加载数据并显示结果。

协程运行在线程之上，并且可以被挂起。当协程被挂起时，相应的计算会暂停，从线程中移除并存储在内存中。同时，线程可以自由地处理其他任务：

![挂起协程](suspension-process.gif){width=700}

当计算准备好继续时，它会被返回到某个线程（不一定是同一个线程）。

在 `loadContributorsSuspend()` 示例中，每个 “contributors” 请求现在都使用挂起机制等待结果。首先发送新请求。然后，在等待响应时，由 `launch` 函数启动的整个 “load contributors” 协程将被挂起。

协程只有在收到相应响应后才会恢复：

![挂起请求](suspend-requests.png){width=700}

在等待接收响应时，线程可以自由处理其他任务。尽管所有的请求都在主 UI 线程上进行，UI 仍能保持响应：

1. 使用 _SUSPEND_ 选项运行程序。日志确认所有请求都已发送到主 UI 线程：

    ```text
    2538 [AWT-EventQueue-0 @coroutine#1] INFO  Contributors - kotlin: loaded 30 repos
    2729 [AWT-EventQueue-0 @coroutine#1] INFO  Contributors - ts2kt: loaded 11 contributors
    3029 [AWT-EventQueue-0 @coroutine#1] INFO  Contributors - kotlin-koans: loaded 45 contributors
    ...
    11252 [AWT-EventQueue-0 @coroutine#1] INFO  Contributors - kotlin-coroutines-workshop: loaded 1 contributors
    ```

2. 日志可以向您显示相应代码运行在哪个协程上。要启用它，请打开 **Run | Edit configurations** 并添加 `-Dkotlinx.coroutines.debug` VM 选项：

   ![编辑运行配置](run-configuration.png){width=500}

   当以此选项运行 `main()` 时，协程名称将附加到线程名称中。您还可以修改运行所有 Kotlin 文件的模板并默认启用此选项。

现在所有的代码都运行在一个协程上，即上面提到的 “load contributors” 协程，表示为 `@coroutine#1`。在等待结果时，您不应重复使用该线程发送其他请求，因为代码是按顺序编写的。只有在收到前一个结果时才会发送新请求。

挂起函数公平地对待线程，不会为了 “等待” 而阻塞它。然而，这还没有带来任何并发。

## 并发

Kotlin 协程比线程消耗的资源少得多。每当您想异步启动新的计算时，都可以创建一个新协程。

要启动新协程，请使用主要 _协程构建器_ 之一：`launch`、`async` 或 `runBlocking`。不同的库可以定义额外的协程构建器。

`async` 启动一个新协程并返回一个 `Deferred` 对象。`Deferred` 代表一个在其他名称下广为人知的概念，如 `Future` 或 `Promise`。它存储了一个计算，但它 _推迟_ 了您获得最终结果的时刻；它 _承诺_ 在未来的某个时间提供结果。

`async` 和 `launch` 之间的主要区别在于，`launch` 用于启动不期望返回特定结果的计算。`launch` 返回一个代表该协程的 `Job`。可以通过调用 `Job.join()` 来等待它完成。

`Deferred` 是一个扩展了 `Job` 的泛型类型。`async` 调用可以返回 `Deferred<Int>` 或 `Deferred<CustomType>`，具体取决于 lambda 表达式返回的内容（lambda 内部的最后一个表达式即为结果）。

要获取协程的结果，可以对 `Deferred` 实例调用 `await()`。在等待结果时，调用 `await()` 的协程将被挂起：

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking {
    val deferred: Deferred<Int> = async {
        loadData()
    }
    println("waiting...")
    println(deferred.await())
}

suspend fun loadData(): Int {
    println("loading...")
    delay(1000L)
    println("loaded!")
    return 42
}
```

`runBlocking` 被用作常规函数与挂起函数之间、或者阻塞世界与非阻塞世界之间的桥梁。它充当启动顶级主协程的适配器。它主要旨在用于 `main()` 函数和测试。

> 观看[此视频](https://www.youtube.com/watch?v=zEZc5AmHQhk)以更好地理解协程。
>
{style="tip"}

如果有一个 Deferred 对象列表，您可以调用 `awaitAll()` 来等待它们所有人的结果：

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking {
    val deferreds: List<Deferred<Int>> = (1..3).map {
        async {
            delay(1000L * it)
            println("Loading $it")
            it
        }
    }
    val sum = deferreds.awaitAll().sum()
    println("$sum")
}
```

当每个 “contributors” 请求都在新协程中启动时，所有请求都是异步启动的。可以在收到前一个请求的结果之前发送新请求：

![并发协程](concurrency.png){width=700}

总加载时间与 _CALLBACKS_ 版本大致相同，但它不需要任何回调。更重要的是，`async` 显式强调了代码中哪些部分是并发运行的。

### 任务 5

在 `Request5Concurrent.kt` 文件中，利用之前的 `loadContributorsSuspend()` 函数实现 `loadContributorsConcurrent()` 函数。

#### 任务 5 的提示 {initial-collapse-state="collapsed" collapsible="true"}

您只能在协程作用域内启动新协程。将内容从 `loadContributorsSuspend()` 复制到 `coroutineScope` 调用中，以便您可以在那里调用 `async` 函数：

```kotlin
suspend fun loadContributorsConcurrent(
    service: GitHubService,
    req: RequestData
): `List<User>` = coroutineScope {
    // ...
}
```

根据以下方案构建您的解决方案：

```kotlin
val deferreds: List<Deferred<List<User>>> = repos.map { repo ->
    async {
        // 为每个仓库加载贡献者
    }
}
deferreds.awaitAll() // List<List<User>>
```

#### 任务 5 的解决方案 {initial-collapse-state="collapsed" collapsible="true"}

用 `async` 包装每个 “contributors” 请求，以创建与仓库数量相同的协程。`async` 返回 `Deferred<List<User>>`。这没有问题，因为创建新协程并不非常消耗资源，所以您可以根据需要创建任意多个。

1. 您不能再使用 `flatMap`，因为 `map` 的结果现在是 `Deferred` 对象列表，而不是列表的列表。`awaitAll()` 返回 `List<List<User>>`，因此调用 `flatten().aggregate()` 来获取结果：

    ```kotlin
    suspend fun loadContributorsConcurrent(
        service: GitHubService, 
        req: RequestData
    ): `List<User>` = coroutineScope {
        val repos = service
            .getOrgRepos(req.org)
            .also { logRepos(req, it) }
            .bodyList()
    
        val deferreds: List<Deferred<List<User>>> = repos.map { repo ->
            async {
                service.getRepoContributors(req.org, repo.name)
                    .also { logUsers(repo, it) }
                    .bodyList()
            }
        }
        deferreds.awaitAll().flatten().aggregate()
    }
    ```

2. 运行代码并检查日志。所有的协程仍然运行在主 UI 线程上，因为尚未采用多线程，但您已经可以看到并发运行协程的好处。
3. 要将此代码更改为在公共线程池的不同线程上运行 “contributors” 协程，请将 `Dispatchers.Default` 指定为 `async` 函数的上下文实参：

    ```kotlin
    async(Dispatchers.Default) { }
    ```

    * `CoroutineDispatcher` 决定了相应协程应该运行在哪个或哪些线程上。如果您不指定一个，`async` 将使用外部作用域的调度器。
    * `Dispatchers.Default` 代表 JVM 上的共享线程池。该池提供了并行执行的手段。它由与可用 CPU 核心数一样多的线程组成，但如果只有一个核心，它仍然会有两个线程。

4. 修改 `loadContributorsConcurrent()` 函数中的代码，在公共线程池的不同线程上启动新协程。此外，在发送请求之前添加额外的日志记录：

    ```kotlin
    async(Dispatchers.Default) {
        log("starting loading for ${repo.name}")
        service.getRepoContributors(req.org, repo.name)
            .also { logUsers(repo, it) }
            .bodyList()
    }
    ```

5. 再次运行程序。在日志中，您可以看到每个协程可以从线程池中的一个线程开始，并在另一个线程上恢复：

    ```text
    1946 [DefaultDispatcher-worker-2 @coroutine#4] INFO  Contributors - starting loading for kotlin-koans
    1946 [DefaultDispatcher-worker-3 @coroutine#5] INFO  Contributors - starting loading for dokka
    1946 [DefaultDispatcher-worker-1 @coroutine#3] INFO  Contributors - starting loading for ts2kt
    ...
    2178 [DefaultDispatcher-worker-1 @coroutine#4] INFO  Contributors - kotlin-koans: loaded 45 contributors
    2569 [DefaultDispatcher-worker-1 @coroutine#5] INFO  Contributors - dokka: loaded 36 contributors
    2821 [DefaultDispatcher-worker-2 @coroutine#3] INFO  Contributors - ts2kt: loaded 11 contributors
    ```

   例如，在此日志摘录中，`coroutine#4` 从 `worker-2` 线程启动，并在 `worker-1` 线程继续。

在 `src/contributors/Contributors.kt` 中，检查 _CONCURRENT_ 选项的实现：

1. 要仅在主 UI 线程上运行协程，请将 `Dispatchers.Main` 指定为实参：

    ```kotlin
    launch(Dispatchers.Main) {
        updateResults()
    }
    ```

    * 如果您在主线程繁忙时启动一个新协程，协程将被挂起并调度在该线程上执行。只有当线程变为空闲时，协程才会恢复。
    * 最佳实践是使用外部作用域的调度器，而不是在每个端点上显式指定。如果您定义 `loadContributorsConcurrent()` 时不传递 `Dispatchers.Default` 作为实参，您可以在任何上下文中调用此函数：使用 `Default` 调度器、使用主 UI 线程或使用自定义调度器。
    * 正如您稍后将看到的，当从测试中调用 `loadContributorsConcurrent()` 时，您可以在带有 `TestDispatcher` 的上下文中调用它，这简化了测试。这使得该解决方案更加灵活。

2. 要在调用方指定调度器，请对项目应用以下更改，同时让 `loadContributorsConcurrent` 在继承的上下文中启动协程：

    ```kotlin
    launch(Dispatchers.Default) {
        val users = loadContributorsConcurrent(service, req)
        withContext(Dispatchers.Main) {
            updateResults(users, startTime)
        }
    }
    ```

    * `updateResults()` 应在主 UI 线程上调用，因此您在 `Dispatchers.Main` 的上下文下调用它。
    * `withContext()` 使用指定的协程上下文调用给定代码，挂起直到完成，并返回结果。一种另一种但更冗长的表达方式是启动一个新协程并显式等待（通过挂起）其完成：`launch(context) { ... }.join()`。

3. 运行代码并确保协程是在线程池的线程上执行的。

## 结构化并发

* _协程作用域_ 负责不同协程之间的结构和父子关系。新协程通常需要在作用域内启动。
* _协程上下文_ 存储了用于运行给定协程的额外技术信息，例如协程自定义名称或指定协程应调度在哪些线程上的调度器。

当使用 `launch`、`async` 或 `runBlocking` 启动新协程时，它们会自动创建相应的作用域。所有这些函数都接受一个带有接收者的 lambda 表达式作为实参，而 `CoroutineScope` 是隐式的接收者类型：

```kotlin
launch { /* this: CoroutineScope */ }
```

* 新协程只能在作用域内启动。
* `launch` 和 `async` 被声明为 `CoroutineScope` 的扩展，因此在调用它们时必须始终传递隐式或显式接收者。
* 由 `runBlocking` 启动的协程是唯一的例外，因为 `runBlocking` 被定义为顶级函数。但因为它会阻塞当前线程，它主要旨在作为桥接函数用于 `main()` 函数和测试中。

在 `runBlocking`、`launch` 或 `async` 内部的新协程会自动在作用域内启动：

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking { /* this: CoroutineScope */
    launch { /* ... */ }
    // 等同于：   
    this.launch { /* ... */ }
}
```

当您在 `runBlocking` 内部调用 `launch` 时，它是作为 `CoroutineScope` 类型的隐式接收者的扩展调用的。或者，您可以显式编写 `this.launch`。

嵌套协程（在本例中由 `launch` 启动）可以被视为外部协程（由 `runBlocking` 启动）的子协程。这种 “父子” 关系通过作用域运作；子协程是从与父协程相对应的作用域中启动的。

可以使用 `coroutineScope` 函数在不启动新协程的情况下创建新作用域。要在无法访问外部作用域的 `suspend` 函数内部以结构化方式启动新协程，您可以创建一个新的协程作用域，它会自动成为调用该 `suspend` 函数的外部作用域的子项。`loadContributorsConcurrent()` 是一个很好的例子。

您还可以使用 `GlobalScope.async` 或 `GlobalScope.launch` 从全局作用域启动新协程。这将创建一个顶层的 “独立” 协程。

协程结构背后的机制被称为 _结构化并发_。与全局作用域相比，它具有以下优势：

* 作用域通常对子协程负责，子协程的寿命与作用域的寿命相关联。
* 如果出现问题或用户改变主意决定撤销操作，作用域可以自动取消子协程。
* 作用域会自动等待所有子协程完成。因此，如果作用域对应于一个协程，则在在其作用域内启动的所有协程完成之前，父协程不会完成。

使用 `GlobalScope.async` 时，没有将多个协程绑定到较小作用域的结构。从全局作用域启动的协程都是独立的——它们的寿命仅受整个应用程序寿命的限制。可以存储对从全局作用域启动的协程的引用并等待其完成或显式取消它，但这不会像结构化并发那样自动发生。

### 取消加载贡献者

创建两个版本的加载贡献者列表函数。比较当您尝试取消父协程时这两个版本的行为。第一个版本将使用 `coroutineScope` 启动所有子协程，而第二个版本将使用 `GlobalScope`。

1. 在 `Request5Concurrent.kt` 中，为 `loadContributorsConcurrent()` 函数添加 3 秒的延迟： 

   ```kotlin
   suspend fun loadContributorsConcurrent(
       service: GitHubService, 
       req: RequestData
   ): `List<User>` = coroutineScope {
       // ...
       async {
           log("starting loading for ${repo.name}")
           delay(3000)
           // 加载仓库贡献者
       }
       // ...
   }
   ```
   
   延迟会影响所有发送请求的协程，以便在协程启动后、请求发送前有足够的时间取消加载。

2. 创建第二个版本的加载函数：将 `loadContributorsConcurrent()` 的实现复制到 `Request5NotCancellable.kt` 中的 `loadContributorsNotCancellable()`，然后移除新 `coroutineScope` 的创建。
3. `async` 调用现在无法解析，因此请使用 `GlobalScope.async` 启动它们：

    ```kotlin
    suspend fun loadContributorsNotCancellable(
        service: GitHubService,
        req: RequestData
    ): `List<User>` {   // #1
        // ...
        GlobalScope.async {   // #2
            log("starting loading for ${repo.name}")
            // 加载仓库贡献者
        }
        // ...
        return deferreds.awaitAll().flatten().aggregate()  // #3
    }
    ```

    * 函数现在直接返回结果，而不是作为 lambda 内部的最后一个表达式（第 `#1` 行和第 `#3` 行）。
    * 所有的 “contributors” 协程都是在 `GlobalScope` 内部启动的，而不是作为协程作用域的子项（第 `#2` 行）。

4. 运行程序并选择 _CONCURRENT_ 选项来加载贡献者。
5. 等待所有的 “contributors” 协程启动，然后点击 _Cancel_。日志显示没有新结果，这意味着所有的请求确实都被取消了：

    ```text
    2896 [AWT-EventQueue-0 @coroutine#1] INFO  Contributors - kotlin: loaded 40 repos
    2901 [DefaultDispatcher-worker-2 @coroutine#4] INFO  Contributors - starting loading for kotlin-koans
    ...
    2909 [DefaultDispatcher-worker-5 @coroutine#36] INFO  Contributors - starting loading for mpp-example
    /* 点击 'cancel' */
    /* 没有请求被发送 */
    ```

6. 重复步骤 5，但这次选择 `NOT_CANCELLABLE` 选项：

    ```text
    2570 [AWT-EventQueue-0 @coroutine#1] INFO  Contributors - kotlin: loaded 30 repos
    2579 [DefaultDispatcher-worker-1 @coroutine#4] INFO  Contributors - starting loading for kotlin-koans
    ...
    2586 [DefaultDispatcher-worker-6 @coroutine#36] INFO  Contributors - starting loading for mpp-example
    /* 点击 'cancel' */
    /* 但所有的请求仍然被发送： */
    6402 [DefaultDispatcher-worker-5 @coroutine#4] INFO  Contributors - kotlin-koans: loaded 45 contributors
    ...
    9555 [DefaultDispatcher-worker-8 @coroutine#36] INFO  Contributors - mpp-example: loaded 8 contributors
    ```

    在这种情况下，没有协程被取消，所有的请求仍然被发送。

7. 检查 “contributors” 程序中是如何触发取消的。当点击 _Cancel_ 按钮时，主 “loading” 协程被显式取消，子协程自动被取消：

    ```kotlin
    interface Contributors {
    
        fun loadContributors() {
            // ...
            when (getSelectedVariant()) {
                CONCURRENT -> {
                    launch {
                        val users = loadContributorsConcurrent(service, req)
                        updateResults(users, startTime)
                    }.setUpCancellation()      // #1
                }
            }
        }
    
        private fun Job.setUpCancellation() {
            val loadingJob = this              // #2
    
            // 如果点击了 'cancel' 按钮，取消加载作业：
            val listener = ActionListener {
                loadingJob.cancel()            // #3
                updateLoadingStatus(CANCELED)
            }
            // 为 'cancel' 按钮添加监听器：
            addCancelListener(listener)
    
            // 在加载作业完成后，
            // 更新状态并移除监听器
        }
    }   
    ```

`launch` 函数返回一个 `Job` 实例。`Job` 存储了对加载所有数据并更新结果的 “loading coroutine” 的引用。您可以对其调用 `setUpCancellation()` 扩展函数（第 `#1` 行），传递一个 `Job` 实例作为接收者。

另一种表达方式是显式编写：

```kotlin
val job = launch { }
job.setUpCancellation()
```

* 为了可读性，您可以使用新的 `loadingJob` 变量（第 `#2` 行）在函数内部引用 `setUpCancellation()` 函数的接收者。
* 然后您可以向 _Cancel_ 按钮添加一个监听器，以便在点击它时取消 `loadingJob`（第 `#3` 行）。

通过结构化并发，您只需取消父协程，取消操作就会自动传播到所有子协程。

### 使用外部作用域的上下文

当您在给定作用域内启动新协程时，更容易确保它们都使用相同的上下文运行。如果需要，替换上下文也容易得多。

现在是时候了解如何使用外部作用域的调度器了。由 `coroutineScope` 或协程构建器创建的新作用域总是从外部作用域继承上下文。在这种情况下，外部作用域是调用 `suspend loadContributorsConcurrent()` 函数的作用域：

```kotlin
launch(Dispatchers.Default) {  // 外部作用域
    val users = loadContributorsConcurrent(service, req)
    // ...
}
```

所有的嵌套协程都会自动使用继承的上下文启动。调度器是此上下文的一部分。这就是为什么所有由 `async` 启动的协程都使用默认调度器的上下文启动的原因：

```kotlin
suspend fun loadContributorsConcurrent(
    service: GitHubService, req: RequestData
): `List<User>` = coroutineScope {
    // 此作用域从外部作用域继承上下文
    // ...
    async {   // 使用继承的上下文启动嵌套协程
        // ...
    }
    // ...
}
```

通过结构化并发，您可以在创建顶级协程时指定主要上下文元素（如调度器）一次。所有的嵌套协程随后继承该上下文，并仅在需要时进行修改。

> 当您为 UI 应用程序（例如 Android 应用程序）编写协程代码时，通常做法是默认为顶级协程使用 `CoroutineDispatchers.Main`，然后在需要于不同线程运行代码时显式放入不同的调度器。
>
{style="tip"}

## 显示进度

尽管某些仓库的信息加载得很快，但用户只有在加载完所有数据后才能看到结果列表。在此之前，加载图标一直运行显示进度，但没有关于当前状态或已加载哪些贡献者的信息。

您可以更早地显示中间结果，并在加载完每个仓库的数据后显示所有贡献者：

![加载数据](loading.gif){width=500}

要实现此功能，在 `src/tasks/Request6Progress.kt` 中，您需要将更新 UI 的逻辑作为回调传递，以便在每个中间状态时调用它：

```kotlin
suspend fun loadContributorsProgress(
    service: GitHubService,
    req: RequestData,
    updateResults: suspend (List<User>, completed: Boolean) -> Unit
) {
    // 加载数据
    // 在中间状态调用 `updateResults()`
}
```

在 `Contributors.kt` 的调用处，传递了回调以从 _PROGRESS_ 选项的 `Main` 线程更新结果：

```kotlin
launch(Dispatchers.Default) {
    loadContributorsProgress(service, req) { users, completed ->
        withContext(Dispatchers.Main) {
            updateResults(users, startTime, completed)
        }
    }
}
```

* `updateResults()` 形参在 `loadContributorsProgress()` 中被声明为 `suspend`。在相应的 lambda 实参内部调用 `withContext`（一个 `suspend` 函数）是必要的。
* `updateResults()` 回调接受一个额外的布尔参数作为实参，用于指定加载是否已完成以及结果是否为最终结果。

### 任务 6

在 `Request6Progress.kt` 文件中实现显示中间进度的 `loadContributorsProgress()` 函数。基于 `Request4Suspend.kt` 中的 `loadContributorsSuspend()` 函数。

* 使用不带并发的简单版本；您将在下一节添加它。
* 中间贡献者列表应以 “聚合” 状态显示，而不仅仅是为每个仓库加载的用户列表。
* 当加载每个新仓库的数据时，应增加每个用户的贡献总数。

#### 任务 6 的解决方案 {initial-collapse-state="collapsed" collapsible="true"}

为了以 “聚合” 状态存储已加载贡献者的中间列表，定义一个存储用户列表的 `allUsers` 变量，然后在加载完每个新仓库的贡献者后更新它：

```kotlin
suspend fun loadContributorsProgress(
    service: GitHubService,
    req: RequestData,
    updateResults: suspend (List<User>, completed: Boolean) -> Unit
) {
    val repos = service
        .getOrgRepos(req.org)
        .also { logRepos(req, it) }
        .bodyList()

    var allUsers = emptyList<User>()
    for ((index, repo) in repos.withIndex()) {
        val users = service.getRepoContributors(req.org, repo.name)
            .also { logUsers(repo, it) }
            .bodyList()

        allUsers = (allUsers + users).aggregate()
        updateResults(allUsers, index == repos.lastIndex)
    }
}
```

#### 连续 vs 并发

每次请求完成后都会调用 `updateResults()` 回调：

![请求进度](progress.png){width=700}

这段代码不包含并发。它是顺序执行的，因此不需要同步。

最佳方案是并发地发送请求，并在获得每个仓库的响应后更新中间结果：

![并发请求](progress-and-concurrency.png){width=700}

要增加并发，请使用 _通道_。

## 通道

编写带有共享可变状态的代码相当困难且容易出错（例如使用回调的解决方案）。一种更简单的方法是通过通信而不是使用公共可变状态来共享信息。协程之间可以通过 _通道_ 进行通信。

通道是允许在协程之间传递数据的通信原语。一个协程可以向通道 _发送 (send)_ 某些信息，而另一个可以从通道 _接收 (receive)_ 该信息：

![使用通道](using-channel.png)

发送（生产）信息的协程通常被称为生产者，接收（消费）信息的协程被称为消费者。一个或多个协程可以向同一个通道发送信息，一个或多个协程可以从中接收数据：

![多个协程使用通道](using-channel-many-coroutines.png)

当许多协程从同一个通道接收信息时，每个元素只能由其中一个消费者处理一次。一旦元素被处理，它就会立即从通道中移除。

您可以将通道想象成类似于元素集合，或者更确切地说，类似于队列，元素从一端添加并从另一端接收。但是，有一个重要的区别：与集合不同（即使是它们的同步版本），通道可以 _挂起_ `send()` 和 `receive()` 操作。当通道为空或已满时会发生这种情况。如果通道大小有上限，通道可能会满。

`Channel` 由三个不同的接口表示：`SendChannel`、`ReceiveChannel` 和 `Channel`，后者扩展了前两个。您通常创建一个通道并将其作为 `SendChannel` 实例提供给生产者，以便只有它们可以向通道发送信息。
您将通道作为 `ReceiveChannel` 实例提供给消费者，以便只有它们可以接收。`send` 和 `receive` 方法都被声明为 `suspend`：

```kotlin
interface SendChannel<in E> {
    suspend fun send(element: E)
    fun close(): Boolean
}

interface ReceiveChannel<out E> {
    suspend fun receive(): E
}

interface Channel<E> : SendChannel<E>, ReceiveChannel<E>
```

生产者可以关闭通道以指示不再有元素到来。

库中定义了多种类型的通道。它们的区别在于内部可以存储多少个元素，以及 `send()` 调用是否可以被挂起。
对于所有的通道类型，`receive()` 调用表现相似：如果通道不为空，它就接收一个元素；否则，它将被挂起。

<deflist collapsible="true">
   <def title="无限制 (Unlimited) 通道" id="unlimited-channel">
       <p>无限制通道是队列最接近的模拟：生产者可以将元素发送到此通道，它将无限增长。<code>send()</code> 调用永远不会被挂起。如果程序耗尽内存，您将收到 <code>OutOfMemoryException</code>。无限制通道与队列的区别在于，当消费者尝试从空通道接收时，它会被挂起，直到发送了新元素。</p>
       <img src="unlimited-channel.png" alt="Unlimited channel" width="500"/>
   </def>
   <def title="缓冲 (Buffered) 通道" id="buffered-channel">
       <p>缓冲通道的大小由指定的数字约束。生产者可以向此通道发送元素，直到达到大小限制。所有的元素都存储在内部。当通道满时，下一次 <code>send()</code> 调用将被挂起，直到腾出更多空间。</p>
       <img src="buffered-channel.png" alt="Buffered channel" width="500"/>
   </def>
   <def title="会合 (Rendezvous) 通道" id="rendezvous-channel">
       <p>“会合 (Rendezvous)”通道是一个没有缓冲区的通道，等同于大小为零的缓冲通道。其中一个函数 (<code>send()</code> 或 <code>receive()</code>) 始终被挂起，直到另一个被调用。</p>
       <p>如果调用了 <code>send()</code> 函数且没有准备好处理该元素的被挂起的 <code>receive()</code> 调用，则 <code>send()</code> 将被挂起。类似地，如果调用了 <code>receive()</code> 函数且通道为空，或者换句话说，没有准备好发送元素的被挂起的 <code>send()</code> 调用，则 <code>receive()</code> 调用将被挂起。</p>
       <p>“会合”名称（“在约定时间和地点见面”）指的是 <code>send()</code> 和 <code>receive()</code> 应该 “按时见面” 的事实。</p>
       <img src="rendezvous-channel.png" alt="Rendezvous channel" width="500"/>
   </def>
   <def title="合并 (Conflated) 通道" id="conflated-channel">
       <p>发送到合并通道的新元素将覆盖之前发送的元素，因此接收者始终只能获得最新的元素。<code>send()</code> 调用永远不会被挂起。</p>
       <img src="conflated-channel.gif" alt="Conflated channel" width="500"/>
   </def>
</deflist>

创建通道时，请指定其类型或缓冲区大小（如果需要缓冲通道）：

```kotlin
val rendezvousChannel = Channel<String>()
val bufferedChannel = Channel<String>(10)
val conflatedChannel = Channel<String>(CONFLATED)
val unlimitedChannel = Channel<String>(UNLIMITED)
```

默认情况下，会创建一个 “会合” 通道。

在接下来的任务中，您将创建一个 “会合” 通道、两个生产者协程和一个消费者协程：

```kotlin
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.*

fun main() = runBlocking<Unit> {
    val channel = Channel<String>()
    launch {
        channel.send("A1")
        channel.send("A2")
        log("A done")
    }
    launch {
        channel.send("B1")
        log("B done")
    }
    launch {
        repeat(3) {
            val x = channel.receive()
            log(x)
        }
    }
}

fun log(message: Any?) {
    println("[${Thread.currentThread().name}] $message")
}
```

> 观看[此视频](https://www.youtube.com/watch?v=HpWQUoVURWQ)以更好地理解通道。
>
{style="tip"}

### 任务 7

在 `src/tasks/Request7Channels.kt` 中，实现 `loadContributorsChannels()` 函数，并发请求所有 GitHub 贡献者并同时显示中间进度。

使用之前的函数，`Request5Concurrent.kt` 中的 `loadContributorsConcurrent()` 和 `Request6Progress.kt` 中的 `loadContributorsProgress()`。

#### 任务 7 的提示 {initial-collapse-state="collapsed" collapsible="true"}

并发接收不同仓库贡献者列表的不同协程可以将所有接收到的结果发送到同一个通道：

```kotlin
val channel = Channel<List<User>>()
for (repo in repos) {
    launch {
        val users = TODO()
        // ...
        channel.send(users)
    }
}
```

然后可以逐一接收并处理来自此通道的元素：

```kotlin
repeat(repos.size) {
    val users = channel.receive()
    // ...
}
```

由于 `receive()` 调用是顺序执行的，因此不需要额外的同步。

#### 任务 7 的解决方案 {initial-collapse-state="collapsed" collapsible="true"}

与 `loadContributorsProgress()` 函数一样，您可以创建一个 `allUsers` 变量来存储 “所有贡献者” 列表的中间状态。
从通道接收到的每个新列表都将添加到所有用户列表中。您对结果进行聚合，并使用 `updateResults` 回调更新状态：

```kotlin
suspend fun loadContributorsChannels(
    service: GitHubService,
    req: RequestData,
    updateResults: suspend (List<User>, completed: Boolean) -> Unit
) = coroutineScope {

    val repos = service
        .getOrgRepos(req.org)
        .also { logRepos(req, it) }
        .bodyList()

    val channel = Channel<List<User>>()
    for (repo in repos) {
        launch {
            val users = service.getRepoContributors(req.org, repo.name)
                .also { logUsers(repo, it) }
                .bodyList()
            channel.send(users)
        }
    }
    var allUsers = emptyList<User>()
    repeat(repos.size) {
        val users = channel.receive()
        allUsers = (allUsers + users).aggregate()
        updateResults(allUsers, it == repos.lastIndex)
    }
}
```

* 不同仓库的结果一准备好就添加到通道中。起初，当所有请求都已发送但未收到数据时，`receive()` 调用会被挂起。在这种情况下，整个 “load contributors” 协程会被挂起。
* 然后，当用户列表发送到通道时，“load contributors” 协程恢复，`receive()` 调用返回此列表，并立即更新结果。

您现在可以运行程序并选择 _CHANNELS_ 选项来加载贡献者并查看结果。

尽管协程和通道都不能完全消除并发带来的复杂性，但当您需要理解发生了什么时，它们会让生活变得更轻松。

## 测试协程

现在让我们测试所有的解决方案，以检查并发协程方案是否比 `suspend` 函数方案更快，并检查通道方案是否比简单的 “进度” 方案更快。

在接下来的任务中，您将比较解决方案的总运行时间。您将模拟 GitHub 服务，并使此服务在给定的超时后返回结果：

```text
repos 请求 - 在 1000 毫秒延迟内返回答案
repo-1 - 1000 毫秒延迟
repo-2 - 1200 毫秒延迟
repo-3 - 800 毫秒延迟
```

使用 `suspend` 函数的顺序解决方案应花费约 4000 毫秒（4000 = 1000 + (1000 + 1200 + 800)）。
并发解决方案应花费约 2200 毫秒（2200 = 1000 + max(1000, 1200, 800)）。

对于显示进度的解决方案，您还可以检查带有时间戳的中间结果。

相应的测试数据在 `test/contributors/testData.kt` 中定义，文件 `Request4SuspendKtTest`、`Request7ChannelsKtTest` 等包含使用模拟服务调用的直接测试。

然而，这里有两个问题：

* 这些测试运行时间太长。每个测试大约需要 2 到 4 秒，您每次都需要等待结果。效率不是很高。
* 您不能依赖解决方案运行的精确时间，因为它运行代码还需要额外的准备时间。您可以添加一个常量，但时间会因机器而异。模拟服务的延迟应高于此常量，这样您才能看到差异。如果常量是 0.5 秒，将延迟设为 0.1 秒就不够了。

一个更好的方法是使用特殊框架在多次运行相同代码时测试计时（这会进一步增加总时间），但这学习和设置起来很复杂。

为了解决这些问题并确保提供测试延迟的解决方案表现符合预期（一个比另一个快），请在特殊的测试调度器中使用 _虚拟 (virtual)_ 时间。此调度器会跟踪自启动以来经过的虚拟时间，并立即实时运行所有内容。当您在此调度器上运行协程时，`delay` 将立即返回并推进虚拟时间。

使用此机制的测试运行速度很快，但您仍然可以检查在虚拟时间的不同时刻发生了什么。总运行时间大幅减少：

![总运行时间对比](time-comparison.png){width=700}

要使用虚拟时间，请将 `runBlocking` 调用替换为 `runTest`。`runTest` 接受一个 `TestScope` 的扩展 lambda 表达式作为实参。
当您在此特殊作用域内的 `suspend` 函数中调用 `delay` 时，`delay` 将增加虚拟时间，而不是实时延迟：

```kotlin
@Test
fun testDelayInSuspend() = runTest {
    val realStartTime = System.currentTimeMillis() 
    val virtualStartTime = currentTime
        
    foo()
    println("${System.currentTimeMillis() - realStartTime} ms") // ~ 6 毫秒
    println("${currentTime - virtualStartTime} ms")             // 1000 毫秒
}

suspend fun foo() {
    delay(1000)    // 立即推进而不延迟
    println("foo") // 调用 foo() 时立即执行
}
```

您可以使用 `TestScope` 的 `currentTime` 属性检查当前的虚拟时间。

在此示例中，实际运行时间为几毫秒，而虚拟时间等于延迟实参，即 1000 毫秒。

要在子协程中获得 “虚拟” `delay` 的全部效果，请使用 `TestDispatcher` 启动所有子协程。否则，它将不起作用。除非您提供不同的调度器，否则此调度器会自动从另一个 `TestScope` 继承：

```kotlin
@Test
fun testDelayInLaunch() = runTest {
    val realStartTime = System.currentTimeMillis()
    val virtualStartTime = currentTime

    bar()

    println("${System.currentTimeMillis() - realStartTime} ms") // ~ 11 毫秒
    println("${currentTime - virtualStartTime} ms")             // 1000 毫秒
}

suspend fun bar() = coroutineScope {
    launch {
        delay(1000)    // 立即推进而不延迟
        println("bar") // 调用 bar() 时立即执行
    }
}
```

如果在上面的示例中调用 `launch` 时使用了 `Dispatchers.Default` 上下文，则测试将失败。您将收到一个异常，指出作业尚未完成。

只有在 `loadContributorsConcurrent()` 使用继承的上下文启动子协程（而不使用 `Dispatchers.Default` 调度器修改上下文）时，您才能以此方式测试它。

您可以在 _调用_ 函数时而不是在 _定义_ 函数时指定调度器等上下文元素，这提供了更多的灵活性并简化了测试。

> 支持虚拟时间的测试 API 属于[实验性功能 (Experimental)](components-stability.md)，将来可能会发生变化。
>
{style="warning"}

默认情况下，如果您使用实验性测试 API，编译器会显示警告。要抑制这些警告，请使用 `@OptIn(ExperimentalCoroutinesApi::class)` 注解测试函数或包含测试的整个类。
添加编译器实参以指示编译器您正在使用实验性 API：

```kotlin
compileTestKotlin {
    kotlinOptions {
        freeCompilerArgs += "-Xuse-experimental=kotlin.Experimental"
    }
}
```

在本教程对应的项目中，编译器实参已添加到 Gradle 脚本中。

### 任务 8

重构 `tests/tasks/` 中的以下测试，以使用虚拟时间代替实时时间：

* `Request4SuspendKtTest.kt`
* `Request5ConcurrentKtTest.kt`
* `Request6ProgressKtTest.kt`
* `Request7ChannelsKtTest.kt`

比较应用重构前后的总运行时间。

#### 任务 8 的提示 {initial-collapse-state="collapsed" collapsible="true"}

1. 将 `runBlocking` 调用替换为 `runTest`，并将 `System.currentTimeMillis()` 替换为 `currentTime`：

    ```kotlin
    @Test
    fun test() = runTest {
        val startTime = currentTime
        // 操作
        val totalTime = currentTime - startTime
        // 测试结果
    }
    ```

2. 取消注释检查精确虚拟时间的断言。
3. 不要忘记添加 `@UseExperimental(ExperimentalCoroutinesApi::class)`。

#### 任务 8 的解决方案 {initial-collapse-state="collapsed" collapsible="true"}

以下是并发和通道情况的解决方案：

```kotlin
fun testConcurrent() = runTest {
    val startTime = currentTime
    val result = loadContributorsConcurrent(MockGithubService, testRequestData)
    Assert.assertEquals("Wrong result for 'loadContributorsConcurrent'", expectedConcurrentResults.users, result)
    val totalTime = currentTime - startTime

    Assert.assertEquals(
        "The calls run concurrently, so the total virtual time should be 2200 ms: " +
                "1000 for repos request plus max(1000, 1200, 800) = 1200 for concurrent contributors requests)",
        expectedConcurrentResults.timeFromStart, totalTime
    )
}
```

首先检查结果是否在预期的虚拟时间准确可用，然后检查结果本身：

```kotlin
fun testChannels() = runTest {
    val startTime = currentTime
    var index = 0
    loadContributorsChannels(MockGithubService, testRequestData) { users, _ ->
        val expected = concurrentProgressResults[index++]
        val time = currentTime - startTime
        Assert.assertEquals(
            "Expected intermediate results after ${expected.timeFromStart} ms:",
            expected.timeFromStart, time
        )
        Assert.assertEquals("Wrong intermediate results after $time:", expected.users, users)
    }
}
```

使用通道的最后一个版本的第一个中间结果比进度版本更早可用，您可以在使用虚拟时间的测试中看到差异。

> 其余 “suspend” 和 “progress” 任务的测试非常相似——您可以在项目的 `solutions` 分支中找到它们。
>
{style="tip"}

## 下一步

* 观看 KotlinConf 上的 [Asynchronous Programming with Kotlin](https://kotlinconf.com/workshops/) 工作坊。
* 了解更多关于使用[虚拟时间和实验性测试包](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-test/)的信息。