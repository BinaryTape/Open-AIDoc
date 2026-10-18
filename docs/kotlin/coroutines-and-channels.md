<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: 协程与通道 − 教程)

> 即将发布的更新将修订本教程。在此期间，有关协程入门的最新指南，请参阅[协程基础](coroutines-basics.md)。
> 
{style="note"}

在本教程中，你将学习如何在 IntelliJ IDEA 中使用协程来执行网络请求，而无需阻塞底层线程或使用回调。

> 无需预先具备协程知识，但希望你熟悉基本的 Kotlin 语法。
>
{style="tip"}

你将学到：

* 为什么以及如何使用挂起函数来执行网络请求。
* 如何使用协程并发发送请求。
* 如何使用通道在不同协程之间共享信息。

对于网络请求，你将需要 [Retrofit](https://lysine.dev/retrofit/) 库，但本教程中展示的方法同样适用于任何其他支持协程的库。

> 你可以在[项目仓库](http://github.com/kotlin-hands-on/intro-coroutines)的 `solutions` 分支中找到所有任务的解决方案。
>
{style="tip"}

## 准备工作 {id="before-you-start"}

1. 下载并安装最新版本的 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/index.html)。
2. 通过在欢迎屏幕上选择 **Get from VCS** 或选择 **File | New | Project from Version Control** 来克隆[项目模板](http://github.com/kotlin-hands-on/intro-coroutines)。

   你也可以从命令行克隆它：

   ```Bash
   git clone https://github.com/kotlin-hands-on/intro-coroutines
   ```

### 生成 GitHub 开发者令牌 {id="generate-a-github-developer-token"}

你将在项目中使用 GitHub API。为了获得访问权限，需提供你的 GitHub 账户名以及密码或令牌。如果启用了双重身份验证，仅凭令牌即可。

生成一个新的 GitHub 令牌，以便在[你的账户](https://github.com/settings/tokens/new)中使用 GitHub API：

1. 指定令牌的名称，例如 `coroutines-tutorial`：

   ![生成新的 GitHub 令牌](generating-token.png){width=700}

2. 不要选择任何 scope。点击页面底部的 **Generate token**。
3. 复制生成的令牌。

### 运行代码 {id="run-the-code"}

该程序会加载给定组织（默认名为 "kotlin"）下所有仓库的贡献者。
随后你将添加逻辑，按贡献次数对用户进行排序。

1. 打开 `src/contributors/main.kt` 文件并运行 `main()` 函数。你将看到以下窗口：

   ![第一个窗口](initial-window.png){width=500}

   如果字体太小，可以通过修改 `main()` 函数中的 `setDefaultFontSize(18f)` 的值来进行调整。

2. 在相应字段中输入你的 GitHub 用户名和令牌（或密码）。
3. 确保在 _Variant_ 下拉菜单中选中了 _BLOCKING_ 选项。
4. 点击 _Load contributors_。UI 界面应该会卡顿一段时间，然后显示贡献者列表。
5. 打开程序输出以确保数据已成功加载。在每次请求成功后都会记录贡献者列表日志。

实现此逻辑有不同的方式：使用[阻塞请求](#blocking-requests)或[回调](#callbacks)。你将把这些解决方案与使用[协程](#coroutines)的方案进行比较，并了解如何使用[通道](#channels)在不同协程之间共享信息。

## 阻塞请求 {id="blocking-requests"}

你将使用 [Retrofit](https://lysine.dev/retrofit/) 库向 GitHub 发起 HTTP 请求。它可以请求给定组织下的仓库列表以及每个仓库的贡献者列表：

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

此 API 由 `loadContributorsBlocking()` 函数使用，以获取给定组织的贡献者列表。

1. 打开 `src/tasks/Request1Blocking.kt` 查看其实现：

    ```kotlin
    fun loadContributorsBlocking(
        service: GitHubService,
        req: RequestData
    ): List<User> {
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

    * 首先，获取给定组织下的仓库列表并将其存储在 `repos` 列表中。然后针对每个仓库请求贡献者列表，并将所有列表合并为一个最终的贡献者列表。
    * `getOrgReposCall()` 和 `getRepoContributorsCall()` 都会返回 `*Call` 类的实例（`#1`）。此时尚未发送任何请求。
    * 接着调用 `*Call.execute()` 来执行请求（`#2`）。`execute()` 是一个同步调用，会阻塞底层线程。
    * 收到响应后，通过调用专用的 `logRepos()` 和 `logUsers()` 函数记录结果日志（`#3`）。如果 HTTP 响应包含错误，该错误将在此处记录。
    * 最后，获取包含所需数据的响应体。对于本教程，在发生错误时将使用空列表作为结果，并记录相应的错误（`#4`）。

2. 为避免重复写 `.body() ?: emptyList()`，声明了一个扩展函数 `bodyList()`：

    ```kotlin
    fun <T> Response<List<T>>.bodyList(): List<T> {
        return body() ?: emptyList()
    }
    ```  

3. 再次运行程序，观察 IntelliJ IDEA 中的系统输出。内容大致如下：

    ```text
    1770 [AWT-EventQueue-0] INFO  Contributors - kotlin: loaded 40 repos
    2025 [AWT-EventQueue-0] INFO  Contributors - kotlin-examples: loaded 23 contributors
    2229 [AWT-EventQueue-0] INFO  Contributors - kotlin-koans: loaded 45 contributors
    ...
    ```

    * 每行的第一项是程序自启动以来经过的毫秒数，紧接着是方括号中的线程名称。你可以从中看出加载请求是从哪个线程调用的。
    * 每行的最后一项是实际消息：加载了多少个仓库或贡献者。

    此日志输出表明所有结果均在主线程中记录。当使用 _BLOCKING_ 选项运行代码时，窗口会冻结并在加载完成之前不响应任何输入。所有请求都与调用 `loadContributorsBlocking()` 所在的线程相同，即主 UI 线程（在 Swing 中为 AWT 事件调度线程）。该主线程被阻塞，这就是 UI 冻结的原因：

    ![被阻塞的主线程](blocking.png){width=700}
    
    加载完贡献者列表后，结果才会更新。

4. 在 `src/contributors/Contributors.kt` 中，找到负责选择贡献者加载方式的 `loadContributors()` 函数，并查看 `loadContributorsBlocking()` 是如何调用的：

    ```kotlin
    when (getSelectedVariant()) {
        BLOCKING -> { // 阻塞 UI 线程
            val users = loadContributorsBlocking(service, req)
            updateResults(users, startTime)
        }
    }
    ```

    * `updateResults()` 调用紧随 `loadContributorsBlocking()` 调用之后。
    * `updateResults()` 会更新 UI，因此必须始终从 UI 线程调用。
    * 由于 `loadContributorsBlocking()` 也是从 UI 线程调用的，UI 线程被阻塞，导致 UI 冻结。

### 任务 1 {id="task-1"}

第一个任务有助于你熟悉业务领域。目前，每个贡献者的名字都会重复多次，每次参与的项目都会重复一次。实现 `aggregate()` 函数将用户合并，使每个贡献者仅添加一次。`User.contributions` 属性应包含该用户在_所有_项目中的贡献总数。结果列表应按贡献次数降序排序。

打开 `src/tasks/Aggregation.kt` 并实现 `List<User>.aggregate()` 函数。用户应按其贡献总数进行排序。

对应的测试文件 `test/tasks/AggregationKtTest.kt` 展示了预期结果的示例。

> 可以使用 [IntelliJ IDEA 快捷键](https://www.jetbrains.com/help/idea/create-tests.html#test-code-navigation) `Ctrl+Shift+T` / `⇧ ⌘ T` 在源代码与测试类之间自动跳转。
>
{style="tip"}

实现此任务后，"kotlin" 组织的结果列表应类似于：

![“kotlin”组织的结果列表](aggregate.png){width=500}

#### 任务 1 的解决方案 {initial-collapse-state="collapsed" collapsible="true" id="solution-for-task-1"}

1. 要按登录名对用户进行分组，请使用 [`groupBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/group-by.html)，它会返回一个从登录名到该用户在不同仓库中出现的所有实例的映射。
2. 对于每个映射条目，计算每个用户的贡献总数，并根据给定的名称和贡献总数创建一个新的 `User` 类实例。
3. 将结果列表按降序排序：

    ```kotlin
    fun List<User>.aggregate(): List<User> =
        groupBy { it.login }
            .map { (login, group) -> User(login, group.sumOf { it.contributions }) }
            .sortedByDescending { it.contributions }
    ```

另一种解决方案是使用 [`groupingBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/grouping-by.html) 函数代替 `groupBy()`。

## 回调 {id="callbacks"}

前面的解决方案有效，但它会阻塞线程并因此冻结 UI。避免这种情况的传统方法是使用_回调（callbacks）_。

你可以不直接调用应在操作完成后立即执行的代码，而是将其提取到一个单独的回调中（通常是 lambda 表达式），并将该 lambda 传递给调用方以便后续调用。

为了使 UI 保持响应，你可以将整个计算移动到单独的线程中，或者切换到使用回调而非阻塞调用的 Retrofit API。

### 使用后台线程 {id="use-a-background-thread"}

1. 打开 `src/tasks/Request2Background.kt` 查看其实现。首先，将整个计算移动到另一个线程。`thread()` 函数会启动一个新线程：

    ```kotlin
    thread {
        loadContributorsBlocking(service, req)
    }
    ```

    现在所有加载工作都已移至单独的线程，主线程得以释放，可以处理其他任务：

    ![释放的主线程](background.png){width=700}

2. `loadContributorsBackground()` 函数的签名发生了变化。它将 `updateResults()` 回调作为最后一个实参接收，以便在所有加载完成后调用它：

    ```kotlin
    fun loadContributorsBackground(
        service: GitHubService, req: RequestData,
        updateResults: (List<User>) -> Unit
    )
    ```

3. 现在调用 `loadContributorsBackground()` 时，`updateResults()` 调用放在回调中，而不是像以前那样紧随其后：

    ```kotlin
    loadContributorsBackground(service, req) { users ->
        SwingUtilities.invokeLater {
            updateResults(users, startTime)
        }
    }
    ```

    通过调用 `SwingUtilities.invokeLater`，可以确保更新结果的 `updateResults()` 调用发生在主 UI 线程（AWT 事件调度线程）上。

但是，如果尝试通过 `BACKGROUND` 选项加载贡献者，你会发现列表已更新，但 UI 上没有任何变化。

### 任务 2 {id="task-2"}

修复 `src/tasks/Request2Background.kt` 中的 `loadContributorsBackground()` 函数，使结果列表显示在 UI 中。

#### 任务 2 的解决方案 {initial-collapse-state="collapsed" collapsible="true" id="solution-for-task-2"}

如果尝试加载贡献者，可以在日志中看到贡献者已加载，但结果没有显示。
要修复此问题，请对获得的用户结果列表调用 `updateResults()`：

```kotlin
thread {
    updateResults(loadContributorsBlocking(service, req))
}
```

请确保显式调用回调中传递的逻辑。否则，什么都不会发生。

### 使用 Retrofit 回调 API {id="use-the-retrofit-callback-api"}

在前面的解决方案中，整个加载逻辑被移到了后台线程，但这仍然不是对资源的最优利用。所有的加载请求都是按顺序进行的，线程在等待加载结果时被阻塞，而它本可以被其他任务占用。具体来说，线程本可以开始加载另一个请求，以便更早接收到完整结果。

处理每个仓库的数据应分为两个部分：加载和处理生成的响应。第二部分_处理_应提取到回调中。

这样，在接收到前一个仓库的结果（并调用相应回调）之前，就可以开始加载下一个仓库：

![使用回调 API](callbacks.png){width=700}

Retrofit 回调 API 可以帮助实现这一点。`Call.enqueue()` 函数启动一个 HTTP 请求并将一个回调作为实参。在此回调中，你需要指定每次请求后需要执行的操作。

打开 `src/tasks/Request3Callbacks.kt` 并查看使用此 API 的 `loadContributorsCallbacks()` 的实现：

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
        // TODO: 为何此代码不起作用？如何修复？
        updateResults(allUsers.aggregate())
    }
```

* 为方便起见，此代码段使用了同一文件中声明的 `onResponse()` 扩展函数。它接受一个 lambda 表达式作为实参，而不是对象表达式。
* 处理响应的逻辑被提取到了回调中：相应的 lambda 从第 `#1` 行和第 `#2` 行开始。

但是，给出的解决方案不起作用。如果运行程序并通过选择 _CALLBACKS_ 选项加载贡献者，你会发现什么都没有显示。然而，`Request3CallbacksKtTest` 中的测试却立即返回成功通过的结果。

思考一下为什么给定的代码没有按预期工作并尝试修复它，或者查看下面的解决方案。

### 任务 3（可选） {id="task-3-optional"}

重写 `src/tasks/Request3Callbacks.kt` 文件中的代码，使加载的贡献者列表得以显示。

#### 任务 3 的第一次尝试方案 {initial-collapse-state="collapsed" collapsible="true" id="the-first-attempted-solution-for-task-3"}

在当前解决方案中，许多请求并发启动，从而缩短了总加载时间。但是，结果并未加载出来。这是因为在所有加载请求刚启动后、`allUsers` 列表尚未填充数据之前，就调用了 `updateResults()` 回调。

你可以尝试通过如下修改来修复此问题：

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

* 首先，通过索引遍历仓库列表（`#1`）。
* 然后，在每个回调中，检查它是否是最后一次迭代（`#2`）。
* 如果是，则更新结果。

然而，这段代码同样未能达成我们的目标。尝试自己找出原因，或查看下面的解决方案。

#### 任务 3 的第二次尝试方案 {initial-collapse-state="collapsed" collapsible="true" id="the-second-attempted-solution-for-task-3"}

由于加载请求是并发启动的，因此无法保证最后一个请求的结果会最后返回。结果可能以任意顺序返回。

因此，如果将当前索引与 `lastIndex` 的比较作为完成条件，可能会面临丢失某些仓库结果的风险。

如果处理最后一个仓库的请求比之前的某些请求返回得更快（这很可能发生），那么耗时较长的请求的所有结果都将丢失。

解决此问题的一种方法是引入一个计数器并检查是否所有仓库均已处理完成：

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

此代码使用了同步版本的列表和 `AtomicInteger()`，因为通常无法保证处理 `getRepoContributors()` 请求的不同回调始终从同一个线程调用。

#### 任务 3 的第三次尝试方案 {initial-collapse-state="collapsed" collapsible="true" id="the-third-attempted-solution-for-task-3"}

更好的解决方案是使用 `CountDownLatch` 类。它存储了一个使用仓库数量初始化的计数器。每处理完一个仓库，该计数器就会递减。然后等待门闩计数减为零，再更新结果：

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

然后从主线程更新结果。这比将逻辑委托给子线程更为直接。

在回顾了这三次方案尝试之后，你可以看到使用回调编写正确的代码并非易事且容易出错，特别是在涉及多个底层线程和同步操作时。

> 作为一项额外练习，你可以使用 RxJava 库通过响应式方法实现相同的逻辑。使用 RxJava 所需的所有依赖项和解决方案都可以在单独的 `rx` 分支中找到。你也可以先完成本教程，然后实现或检查建议的 Rx 版本以进行合理对比。
>
{style="tip"}

## 挂起函数 {id="suspending-functions"}

你可以使用挂起函数实现相同的逻辑。无需返回 `Call<List<Repo>>`，而是将 API 调用定义为[挂起函数](composing-suspending-functions.md)，如下所示：

```kotlin
interface GitHubService {
    @GET("orgs/{org}/repos?per_page=100")
    suspend fun getOrgRepos(
        @Path("org") org: String
    ): List<Repo>
}
```

* `getOrgRepos()` 被定义为 `suspend` 函数。当你使用挂起函数执行请求时，底层线程不会被阻塞。关于其工作原理的更多细节将在后续章节中介绍。
* `getOrgRepos()` 直接返回结果，而不是返回 `Call`。如果结果失败，则会抛出异常。

或者，Retrofit 允许返回包装在 `Response` 中的结果。在这种情况下，会提供结果体，并允许手动检查错误。本教程使用返回 `Response` 的版本。

在 `src/contributors/GitHubService.kt` 中，将以下声明添加到 `GitHubService` 接口中：

```kotlin
interface GitHubService {
    // getOrgReposCall 与 getRepoContributorsCall 声明

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

### 任务 4 {id="task-4"}

你的任务是修改加载贡献者的函数代码，以便利用两个新的挂起函数 `getOrgRepos()` 和 `getRepoContributors()`。新的 `loadContributorsSuspend()` 函数被标记为 `suspend` 以使用新 API。

> 挂起函数不能随意在任何地方调用。从 `loadContributorsBlocking()` 调用挂起函数将导致错误，错误消息为“Suspend function 'getOrgRepos' should be called only from a coroutine or another suspend function”。
>
{style="note"}

1. 将 `src/tasks/Request1Blocking.kt` 中定义的 `loadContributorsBlocking()` 实现复制到 `src/tasks/Request4Suspend.kt` 中定义的 `loadContributorsSuspend()` 中。
2. 修改代码，以便使用新的挂起函数代替返回 `Call` 的函数。
3. 选择 _SUSPEND_ 选项运行程序，并确保在执行 GitHub 请求时 UI 仍然能够响应。

#### 任务 4 的解决方案 {initial-collapse-state="collapsed" collapsible="true" id="solution-for-task-4"}

将 `.getOrgReposCall(req.org).execute()` 替换为 `.getOrgRepos(req.org)`，并对第二个“contributors”请求重复相同的替换：

```kotlin
suspend fun loadContributorsSuspend(service: GitHubService, req: RequestData): List<User> {
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
* 你不再需要调用之前返回 `Response` 的 `execute`，因为现在 API 函数直接返回 `Response`。请注意，这个细节是 Retrofit 库特有的。对于其他库，API 会有所不同，但概念是相同的。

## 协程 {id="coroutines"}

使用挂起函数的代码看起来与“阻塞”版本类似。与阻塞版本的主要区别在于，协程被挂起而不是阻塞线程：

```text
block -> suspend
thread -> coroutine
```

> 协程通常被称为轻量级线程，因为你可以在协程上运行代码，类似于在线程上运行代码。以前会发生阻塞的操作（不得不尽量避免）现在可以改为挂起协程。
>
{style="note"}

### 启动新协程 {id="starting-a-new-coroutine"}

如果查看 `src/contributors/Contributors.kt` 中 `loadContributorsSuspend()` 的使用方式，可以看到它是在 `launch` 内部调用的。`launch` 是一个库函数，它接受一个 lambda 作为实参：

```kotlin
launch {
    val users = loadContributorsSuspend(req)
    updateResults(users, startTime)
}
```

这里的 `launch` 启动了一个负责加载数据和显示结果的新计算。该计算是可挂起的——在执行网络请求时，它会被挂起并释放底层线程。当网络请求返回结果时，计算将恢复。

这种可挂起的计算被称为_协程（coroutine）_。因此在这种情况下，`launch` _启动了一个新的协程_，负责加载数据和显示结果。

协程运行在线程之上，并且可以被挂起。当协程被挂起时，相应的计算会被暂停、从线程中移除并保存在内存中。与此同时，线程得以空闲出来去处理其他任务：

![挂起协程](suspension-process.gif){width=700}

当计算准备好继续执行时，它会被返回到一个线程中（不一定是同一个线程）。

在 `loadContributorsSuspend()` 示例中，每个“contributors”请求现在都使用挂起机制等待结果。首先发送新请求。然后，在等待响应的同时，由 `launch` 函数启动的整个“加载贡献者”协程被挂起。

协程仅在收到相应响应后才会恢复：

![挂起请求](suspend-requests.png){width=700}

在等待接收响应的过程中，线程可以自由地被其他任务占用。尽管所有请求都在主 UI 线程上进行，UI 仍能保持响应：

1. 使用 _SUSPEND_ 选项运行程序。日志确认所有请求都是从主 UI 线程发送的：

    ```text
    2538 [AWT-EventQueue-0 @coroutine#1] INFO  Contributors - kotlin: loaded 30 repos
    2729 [AWT-EventQueue-0 @coroutine#1] INFO  Contributors - ts2kt: loaded 11 contributors
    3029 [AWT-EventQueue-0 @coroutine#1] INFO  Contributors - kotlin-koans: loaded 45 contributors
    ...
    11252 [AWT-EventQueue-0 @coroutine#1] INFO  Contributors - kotlin-coroutines-workshop: loaded 1 contributors
    ```

2. 日志可以向你显示相应代码运行在哪个协程上。要启用此功能，请打开 **Run | Edit configurations** 并添加 `-Dkotlinx.coroutines.debug` 虚拟机选项：

   ![编辑运行配置](run-configuration.png){width=500}

   使用此选项运行 `main()` 时，协程名称将附加到线程名称后。你还可以修改运行所有 Kotlin 文件的模板，默认启用此选项。

现在所有代码都在同一个协程上运行，即上述标记为 `@coroutine#1` 的“加载贡献者”协程。在等待结果时，你不应复用该线程去发送其他请求，因为代码是按顺序编写的。只有在收到前一个结果时，才会发送新请求。

挂起函数对线程十分友好，不会为了“等待”而阻塞它。然而，这尚未引入任何并发性。

## 并发 {id="concurrency"}

Kotlin 协程消耗的资源远少于线程。
每次你想异步启动新的计算时，都可以创建一个新协程。

要启动新协程，请使用主要的_协程构建器（coroutine builder）_之一：`launch`、`async` 或 `runBlocking`。不同的库可以定义额外的协程构建器。

`async` 启动一个新协程并返回一个 `Deferred` 对象。`Deferred` 代表了一个在其他语言或框架中被称为 `Future` 或 `Promise` 的概念。它保存了一个计算，但它_推迟（defers）_了获取最终结果的时刻；它_承诺（promises）_在_将来（future）_的某个时刻给出结果。

`async` 和 `launch` 之间的主要区别在于，`launch` 用于启动不期望返回特定结果的计算。`launch` 返回代表该协程的 `Job`。可以通过调用 `Job.join()` 来等待它完成。

`Deferred` 是一个继承自 `Job` 的泛型类型。`async` 调用可以返回 `Deferred<Int>` 或 `Deferred<CustomType>`，具体取决于 lambda 返回的内容（lambda 内的最后一个表达式即为结果）。

要获取协程的结果，可以在 `Deferred` 实例上调用 `await()`。在等待结果的同时，调用此 `await()` 的协程会被挂起：

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

`runBlocking` 用作常规函数与挂起函数之间，或阻塞世界与非阻塞世界之间的桥梁。它充当启动顶级主协程的适配器。它主要用于 `main()` 函数和测试。

> 观看[此视频](https://www.youtube.com/watch?v=zEZc5AmHQhk)以更好地了解协程。
>
{style="tip"}

如果有一个 Deferred 对象列表，可以调用 `awaitAll()` 来等待它们全部的结果：

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

当每个“contributors”请求都在一个新协程中启动时，所有请求都会异步启动。在收到前一个请求的结果之前，就可以发送新请求：

![并发协程](concurrency.png){width=700}

总加载时间与 _CALLBACKS_ 版本大致相同，但它不需要任何回调。更重要的是，`async` 在代码中明确强调了哪些部分是并发运行的。

### 任务 5 {id="task-5"}

在 `Request5Concurrent.kt` 文件中，利用之前的 `loadContributorsSuspend()` 函数实现 `loadContributorsConcurrent()` 函数。

#### 任务 5 的提示 {initial-collapse-state="collapsed" collapsible="true" id="tip-for-task-5"}

只能在协程作用域内启动新协程。将 `loadContributorsSuspend()` 中的内容复制到 `coroutineScope` 调用中，以便在其中调用 `async` 函数：

```kotlin
suspend fun loadContributorsConcurrent(
    service: GitHubService,
    req: RequestData
): List<User> = coroutineScope {
    // ...
}
```

基于以下方案设计你的解决方案：

```kotlin
val deferreds: List<Deferred<List<User>>> = repos.map { repo ->
    async {
        // 为每个仓库加载贡献者
    }
}
deferreds.awaitAll() // List<List<User>>
```

#### 任务 5 的解决方案 {initial-collapse-state="collapsed" collapsible="true" id="solution-for-task-5"}

用 `async` 包装每个“contributors”请求，以创建与仓库数量相同的协程。`async` 返回 `Deferred<List<User>>`。由于创建新协程占用的资源非常少，因此这不是问题，你可以根据需要创建任意数量的协程。

1. 你不能再使用 `flatMap`，因为 `map` 的结果现在是 `Deferred` 对象的列表，而不是列表的列表。`awaitAll()` 返回 `List<List<User>>`，因此调用 `flatten().aggregate()` 即可获取结果：

    ```kotlin
    suspend fun loadContributorsConcurrent(
        service: GitHubService, 
        req: RequestData
    ): List<User> = coroutineScope {
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

2. 运行代码并查看日志。所有协程仍然在主 UI 线程上运行，因为尚未采用多线程，但你已经可以看到并发运行协程的好处。
3. 若要将此代码改为在公共线程池的不同线程上运行“contributors”协程，请将 `Dispatchers.Default` 指定为 `async` 函数的上下文实参：

    ```kotlin
    async(Dispatchers.Default) { }
    ```

    * `CoroutineDispatcher` 决定相应协程应在哪个或哪些线程上运行。如果未将其指定为实参，`async` 将使用外部作用域中的调度器。
    * `Dispatchers.Default` 表示 JVM 上的共享线程池。此线程池提供了并行执行的方法。它包含的线程数与可用的 CPU 核心数相同，但如果只有一个核心，它仍然会有两个线程。

4. 修改 `loadContributorsConcurrent()` 函数中的代码，以在公共线程池的不同线程上启动新协程。另外，在发送请求之前添加额外的日志记录：

    ```kotlin
    async(Dispatchers.Default) {
        log("starting loading for ${repo.name}")
        service.getRepoContributors(req.org, repo.name)
            .also { logUsers(repo, it) }
            .bodyList()
    }
    ```

5. 再次运行程序。在日志中，你可以看到每个协程都可以在线程池中的一个线程上启动并在另一个线程上恢复：

    ```text
    1946 [DefaultDispatcher-worker-2 @coroutine#4] INFO  Contributors - starting loading for kotlin-koans
    1946 [DefaultDispatcher-worker-3 @coroutine#5] INFO  Contributors - starting loading for dokka
    1946 [DefaultDispatcher-worker-1 @coroutine#3] INFO  Contributors - starting loading for ts2kt
    ...
    2178 [DefaultDispatcher-worker-1 @coroutine#4] INFO  Contributors - kotlin-koans: loaded 45 contributors
    2569 [DefaultDispatcher-worker-1 @coroutine#5] INFO  Contributors - dokka: loaded 36 contributors
    2821 [DefaultDispatcher-worker-2 @coroutine#3] INFO  Contributors - ts2kt: loaded 11 contributors
    ```

   例如，在此日志摘录中，`coroutine#4` 在 `worker-2` 线程上启动并在 `worker-1` 线程上继续执行。

在 `src/contributors/Contributors.kt` 中，检查 _CONCURRENT_ 选项的实现：

1. 要仅在主 UI 线程上运行协程，请将 `Dispatchers.Main` 指定为实参：

    ```kotlin
    launch(Dispatchers.Main) {
        updateResults()
    }
    ```

    * 如果在主线程上启动新协程时主线程正忙，该协程将被挂起并排队等待在该线程上执行。协程仅在线程空闲时才会恢复。
    * 使用外部作用域的调度器而不是在每个端点显式指定它被视为一种良好实践。如果定义 `loadContributorsConcurrent()` 时不传递 `Dispatchers.Default` 作为实参，你就可以在任何上下文中调用此函数：使用 `Default` 调度器、使用主 UI 线程或使用自定义调度器。
    * 正如你稍后将看到的，在测试中调用 `loadContributorsConcurrent()` 时，可以在带有 `TestDispatcher` 的上下文中调用它，这简化了测试。这使得该解决方案更加灵活。

2. 要在调用方指定调度器，请在对项目应用以下更改的同时，让 `loadContributorsConcurrent` 在继承的上下文中启动协程：

    ```kotlin
    launch(Dispatchers.Default) {
        val users = loadContributorsConcurrent(service, req)
        withContext(Dispatchers.Main) {
            updateResults(users, startTime)
        }
    }
    ```

    * `updateResults()` 应在主 UI 线程上调用，因此你在 `Dispatchers.Main` 的上下文中调用它。
    * `withContext()` 使用指定的协程上下文调用给定代码，挂起直到其完成，并返回结果。另一种表达此意图但更繁琐的方式是启动一个新协程并显式等待（通过挂起）直到它完成：`launch(context) { ... }.join()`。

3. 运行代码并确保协程在线程池的线程上执行。

## 结构化并发 {id="structured-concurrency"}

* _协程作用域（coroutine scope）_负责不同协程之间的结构和父子关系。新协程通常需要在作用域内启动。
* _协程上下文（coroutine context）_存储用于运行给定协程的附加技术信息，例如协程自定义名称或指定应调度协程的线程的调度器。

当使用 `launch`、`async` 或 `runBlocking` 启动新协程时，它们会自动创建相应的作用域。所有这些函数都接受一个带接收者的 lambda 作为实参，而 `CoroutineScope` 就是隐式接收者类型：

```kotlin
launch { /* this: CoroutineScope */ }
```

* 新协程只能在作用域内启动。
* `launch` 和 `async` 被声明为 `CoroutineScope` 的扩展函数，因此在调用它们时必须始终传递隐式或显式接收者。
* 由 `runBlocking` 启动的协程是唯一的例外，因为 `runBlocking` 被定义为顶级函数。但因为它会阻塞当前线程，所以它主要用作 `main()` 函数和测试中的桥接函数。

`runBlocking`、`launch` 或 `async` 内部的新协程会自动在作用域内启动：

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking { /* this: CoroutineScope */
    launch { /* ... */ }
    // 等同于：   
    this.launch { /* ... */ }
}
```

当你在 `runBlocking` 内部调用 `launch` 时，它是作为 `CoroutineScope` 类型的隐式接收者的扩展调用的。或者，你也可以显式编写 `this.launch`。

嵌套协程（在此示例中由 `launch` 启动）可以被视为外部协程（由 `runBlocking` 启动）的子协程。这种“父子”关系通过作用域运作；子协程是从与父协程相对应的作用域启动的。

可以使用 `coroutineScope` 函数在不启动新协程的情况下创建新作用域。
要在 `suspend` 函数内部以结构化的方式启动新协程而无需访问外部作用域，你可以创建一个新的协程作用域，该作用域会自动成为调用此 `suspend` 函数的外部作用域的子作用域。`loadContributorsConcurrent()` 就是一个很好的例子。

你还可以使用 `GlobalScope.async` 或 `GlobalScope.launch` 从全局作用域启动新协程。这将创建一个顶层的“独立”协程。

协程结构背后的机制称为_结构化并发（structured concurrency）_。与全局作用域相比，它具有以下优势：

* 作用域通常对其子协程负责，子协程的生命周期依附于作用域的生命周期。
* 如果发生错误或用户改变主意决定撤销操作，作用域可以自动取消子协程。
* 作用域会自动等待所有子协程完成。因此，如果该作用域对应于一个协程，则在该作用域中启动的所有协程完成之前，父协程不会完成。

使用 `GlobalScope.async` 时，不存在将多个协程绑定到较小作用域的结构。从全局作用域启动的协程彼此独立——它们的生命周期仅受整个应用程序生命周期的限制。虽然可以保存对从全局作用域启动的协程的引用，并等待其完成或显式取消它，但这不会像结构化并发那样自动发生。

### 取消加载贡献者 {id="canceling-the-loading-of-contributors"}

创建加载贡献者列表函数的两个版本。比较在尝试取消父协程时两个版本的行为。第一个版本将使用 `coroutineScope` 启动所有子协程，而第二个版本将使用 `GlobalScope`。

1. 在 `Request5Concurrent.kt` 中，为 `loadContributorsConcurrent()` 函数添加 3 秒延迟： 

   ```kotlin
   suspend fun loadContributorsConcurrent(
       service: GitHubService, 
       req: RequestData
   ): List<User> = coroutineScope {
       // ...
       async {
           log("starting loading for ${repo.name}")
           delay(3000)
           // 加载仓库贡献者
       }
       // ...
   }
   ```
   
   该延迟会影响所有发送请求的协程，以便在协程启动之后、请求发送之前有足够的时间取消加载。

2. 创建加载函数的第二个版本：将 `loadContributorsConcurrent()` 的实现复制到 `Request5NotCancellable.kt` 中的 `loadContributorsNotCancellable()`，然后移除新 `coroutineScope` 的创建。
3. 此时 `async` 调用无法解析，因此请使用 `GlobalScope.async` 启动它们：

    ```kotlin
    suspend fun loadContributorsNotCancellable(
        service: GitHubService,
        req: RequestData
    ): List<User> {   // #1
        // ...
        GlobalScope.async {   // #2
            log("starting loading for ${repo.name}")
            // 加载仓库贡献者
        }
        // ...
        return deferreds.awaitAll().flatten().aggregate()  // #3
    }
    ```

    * 该函数现在直接返回结果，而不是作为 lambda 内部的最后一个表达式（第 `#1` 行和第 `#3` 行）。
    * 所有“contributors”协程都是在 `GlobalScope` 内部启动的，而不是作为协程作用域的子协程（第 `#2` 行）。

4. 运行程序并选择 _CONCURRENT_ 选项加载贡献者。
5. 等待所有“contributors”协程启动完毕，然后点击 _Cancel_。日志中没有显示新结果，这意味着所有请求确实已被取消：

    ```text
    2896 [AWT-EventQueue-0 @coroutine#1] INFO  Contributors - kotlin: loaded 40 repos
    2901 [DefaultDispatcher-worker-2 @coroutine#4] INFO  Contributors - starting loading for kotlin-koans
    ...
    2909 [DefaultDispatcher-worker-5 @coroutine#36] INFO  Contributors - starting loading for mpp-example
    /* 点击 'cancel' */
    /* 未发送任何请求 */
    ```

6. 重复步骤 5，但这次选择 `NOT_CANCELLABLE` 选项：

    ```text
    2570 [AWT-EventQueue-0 @coroutine#1] INFO  Contributors - kotlin: loaded 30 repos
    2579 [DefaultDispatcher-worker-1 @coroutine#4] INFO  Contributors - starting loading for kotlin-koans
    ...
    2586 [DefaultDispatcher-worker-6 @coroutine#36] INFO  Contributors - starting loading for mpp-example
    /* 点击 'cancel' */
    /* 但所有请求仍照常发送： */
    6402 [DefaultDispatcher-worker-5 @coroutine#4] INFO  Contributors - kotlin-koans: loaded 45 contributors
    ...
    9555 [DefaultDispatcher-worker-8 @coroutine#36] INFO  Contributors - mpp-example: loaded 8 contributors
    ```

    在这种情况下，没有协程被取消，所有请求仍然被发送。

7. 查看在“contributors”程序中是如何触发取消的。当点击 _Cancel_ 按钮时，主“loading”协程被显式取消，子协程自动被取消：

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
            // 为 'cancel' 按钮添加侦听器：
            addCancelListener(listener)
    
            // 在加载作业完成后
            // 更新状态并移除侦听器
        }
    }   
    ```

`launch` 函数返回一个 `Job` 实例。`Job` 保存了对“loading 协程”的引用，该协程负责加载所有数据并更新结果。你可以在其上调用 `setUpCancellation()` 扩展函数（第 `#1` 行），将 `Job` 实例作为接收者传递。

另一种表达方式是显式编写：

```kotlin
val job = launch { }
job.setUpCancellation()
```

* 为了提高可读性，可以在 `setUpCancellation()` 函数内部使用新的 `loadingJob` 变量来引用该函数的接收者（第 `#2` 行）。
* 然后为 _Cancel_ 按钮添加侦听器，以便在点击它时取消 `loadingJob`（第 `#3` 行）。

借助结构化并发，你只需取消父协程，这会自动将取消操作传播给所有子协程。

### 使用外部作用域的上下文 {id="using-the-outer-scope-s-context"}

在给定作用域内启动新协程时，更容易确保它们都使用相同的上下文运行。如果需要，替换上下文也容易得多。

现在来了解使用外部作用域的调度器是如何工作的。由 `coroutineScope` 或协程构建器创建的新作用域始终继承外部作用域的上下文。在这种情况下，外部作用域就是调用 `suspend loadContributorsConcurrent()` 函数的作用域：

```kotlin
launch(Dispatchers.Default) {  // 外部作用域
    val users = loadContributorsConcurrent(service, req)
    // ...
}
```

所有嵌套协程都会自动以继承的上下文启动。调度器是此上下文的一部分。这就是为什么由 `async` 启动的所有协程都是以默认调度器的上下文启动的原因：

```kotlin
suspend fun loadContributorsConcurrent(
    service: GitHubService, req: RequestData
): List<User> = coroutineScope {
    // 此作用域继承外部作用域的上下文
    // ...
    async {   // 使用继承的上下文启动的嵌套协程
        // ...
    }
    // ...
}
```

借助结构化并发，可以在创建顶级协程时指定主要上下文元素（如调度器）一次。所有嵌套协程随后都会继承该上下文，并且仅在需要时对其进行修改。

> 在为 UI 应用程序（例如 Android 应用）编写协程代码时，常见的做法是为顶层协程默认使用 `CoroutineDispatchers.Main`，然后在需要于不同线程上运行代码时显式设置其他调度器。
>
{style="tip"}

## 显示进度 {id="showing-progress"}

尽管某些仓库的信息加载相当迅速，但用户只有在所有数据加载完毕后才能看到结果列表。在此之前，加载图标一直在转动显示进度，但没有任何关于当前状态或哪些贡献者已经加载完成的信息。

你可以更早地显示中间结果，并在加载完每个仓库的数据后展示所有的贡献者：

![加载数据](loading.gif){width=500}

要在 `src/tasks/Request6Progress.kt` 中实现此功能，你需要将更新 UI 的逻辑作为回调传递，以便在每个中间状态时调用它：

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

在 `Contributors.kt` 的调用方处，传递该回调以针对 _PROGRESS_ 选项从 `Main` 线程更新结果：

```kotlin
launch(Dispatchers.Default) {
    loadContributorsProgress(service, req) { users, completed ->
        withContext(Dispatchers.Main) {
            updateResults(users, startTime, completed)
        }
    }
}
```

* `updateResults()` 形参在 `loadContributorsProgress()` 中被声明为 `suspend`。这是必需的，以便在对应的 lambda 实参内部调用 `withContext`（一个 `suspend` 函数）。
* `updateResults()` 回调接受一个额外的布尔值形参作为实参，用于指定加载是否已完成以及结果是否为最终结果。

### 任务 6 {id="task-6"}

在 `Request6Progress.kt` 文件中，实现展示中间进度的 `loadContributorsProgress()` 函数。将其基于 `Request4Suspend.kt` 中的 `loadContributorsSuspend()` 函数构建。

* 使用无并发的简单版本；你将在下一节中添加并发。
* 中间贡献者列表应以“聚合”状态显示，而不仅仅是为每个仓库加载的用户列表。
* 加载每个新仓库的数据时，每个用户的贡献总数都应增加。

#### 任务 6 的解决方案 {initial-collapse-state="collapsed" collapsible="true" id="solution-for-task-6"}

为了以“聚合”状态存储已加载贡献者的中间列表，定义一个用于存储用户列表的 `allUsers` 变量，并在加载完每个新仓库的贡献者后更新它：

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

#### 串行与并发对比 {id="consecutive-vs-concurrent"}

在每个请求完成后都会调用 `updateResults()` 回调：

![请求进度](progress.png){width=700}

此代码不包含并发。它是顺序执行的，因此不需要同步。

最好的选择是并发发送请求，并在收到每个仓库的响应后更新中间结果：

![并发请求](progress-and-concurrency.png){width=700}

要添加并发，请使用_通道（channels）_。

## 通道 {id="channels"}

编写具有共享可变状态的代码相当困难且容易出错（就像使用回调的解决方案一样）。一种更简单的方法是通过通信而不是使用公共可变状态来共享信息。协程可以通过_通道_相互通信。

通道是允许在协程之间传递数据的通信原语。一个协程可以向通道_发送（send）_一些信息，而另一个协程可以从中_接收（receive）_这些信息：

![使用通道](using-channel.png)

发送（生产）信息的协程通常被称为生产者，接收（消费）信息的协程被称为消费者。一个或多个协程可以向同一个通道发送信息，一个或多个协程也可以从该通道接收数据：

![在多个协程中使用通道](using-channel-many-coroutines.png)

当多个协程从同一个通道接收信息时，每个元素仅由其中一个消费者处理一次。元素一旦被处理，就会立即从通道中移除。

你可以将通道看作类似于元素集合，或者更准确地说是一个队列，元素被添加到一端并从另一端接收。但是，存在一个重要区别：与集合（即使在其同步版本中）不同，通道可以_挂起_ `send()` 和 `receive()` 操作。当通道为空或已满时就会发生这种情况。如果通道大小设有上限，通道可能会变满。

`Channel` 由三个不同的接口表示：`SendChannel`、`ReceiveChannel` 和继承了前两者的 `Channel`。通常创建一个通道并将其作为 `SendChannel` 实例提供给生产者，以便只有它们可以向通道发送信息。将通道作为 `ReceiveChannel` 实例提供给消费者，以便只有它们可以从中接收。`send` 和 `receive` 方法均被声明为 `suspend`：

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

生产者可以关闭通道以表明不再有新元素到来。

库中定义了几种类型的通道。它们在内部可以存储的元素数量以及 `send()` 调用是否可以被挂起方面有所不同。对于所有通道类型，`receive()` 调用的行为都是类似的：如果通道不为空，则接收一个元素；否则被挂起。

<deflist collapsible="true">
   <def title="无限通道（Unlimited channel）" id="unlimited-channel">
       <p>无限通道是与队列最接近的模拟：生产者可以向此通道发送元素，它将无限增长。<code>send()</code> 调用永远不会被挂起。如果程序耗尽内存，你将收到 <code>OutOfMemoryException</code>。无限通道与队列的区别在于，当消费者尝试从空通道接收时，它会被挂起，直到有新元素发送过来。</p>
       <img src="unlimited-channel.png" alt="无限通道" width="500"/>
   </def>
   <def title="缓冲通道（Buffered channel）" id="buffered-channel">
       <p>缓冲通道的大小受指定数字的约束。生产者可以向此通道发送元素，直到达到大小限制。所有元素均在内部存储。当通道已满时，在其上进行的下一次 <code>send()</code> 调用将被挂起，直到有更多空闲空间可用。</p>
       <img src="buffered-channel.png" alt="缓冲通道" width="500"/>
   </def>
   <def title="约会通道（Rendezvous channel）" id="rendezvous-channel">
       <p>“约会（Rendezvous）”通道是一个没有缓冲区的通道，等同于大小为零的缓冲通道。其中一个函数（<code>send()</code> 或 <code>receive()</code>）始终处于挂起状态，直到另一个函数被调用。</p>
       <p>如果调用了 <code>send()</code> 函数且没有挂起的 <code>receive()</code> 调用准备处理该元素，则 <code>send()</code> 会被挂起。同样，如果调用了 <code>receive()</code> 函数且通道为空（换句话说，没有挂起的 <code>send()</code> 调用准备发送该元素），则 <code>receive()</code> 调用会被挂起。</p>
       <p>“约会（rendezvous）”这个名字（意为“在约定的时间和地点会面”）是指 <code>send()</code> 和 <code>receive()</code> 应该“准时相遇”。</p>
       <img src="rendezvous-channel.png" alt="约会通道" width="500"/>
   </def>
   <def title="合并通道（Conflated channel）" id="conflated-channel">
       <p>发送到合并通道的新元素将覆盖先前发送的元素，因此接收者将始终仅获取最新元素。<code>send()</code> 调用永远不会被挂起。</p>
       <img src="conflated-channel.gif" alt="合并通道" width="500"/>
   </def>
</deflist>

创建通道时，需指定其类型或缓冲区大小（如果需要缓冲通道）：

```kotlin
val rendezvousChannel = Channel<String>()
val bufferedChannel = Channel<String>(10)
val conflatedChannel = Channel<String>(CONFLATED)
val unlimitedChannel = Channel<String>(UNLIMITED)
```

默认创建“约会（Rendezvous）”通道。

在接下来的任务中，你将创建一个“约会”通道、两个生产者协程和一个消费者协程：

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

### 任务 7 {id="task-7"}

在 `src/tasks/Request7Channels.kt` 中，实现 `loadContributorsChannels()` 函数，该函数并发请求所有 GitHub 贡献者并同时显示中间进度。

使用之前的函数：`Request5Concurrent.kt` 中的 `loadContributorsConcurrent()` 和 `Request6Progress.kt` 中的 `loadContributorsProgress()`。

#### 任务 7 的提示 {initial-collapse-state="collapsed" collapsible="true" id="tip-for-task-7"}

并发接收不同仓库贡献者列表的不同协程可以将所有接收到的结果发送到同一个通道中：

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

然后可以逐一接收并处理来自该通道的元素：

```kotlin
repeat(repos.size) {
    val users = channel.receive()
    // ...
}
```

由于 `receive()` 调用是顺序执行的，因此不需要额外的同步。

#### 任务 7 的解决方案 {initial-collapse-state="collapsed" collapsible="true" id="solution-for-task-7"}

与 `loadContributorsProgress()` 函数一样，你可以创建一个 `allUsers` 变量来存储“所有贡献者”列表的中间状态。
从通道接收到的每个新列表都会添加到所有用户的列表中。汇总聚合结果并使用 `updateResults` 回调更新状态：

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

* 不同仓库的结果一旦准备好就会被添加到通道中。起初，当所有请求都已发送且尚未收到任何数据时，`receive()` 调用会被挂起。在这种情况下，整个“load contributors”协程都会被挂起。
* 之后，当用户列表发送到通道时，“load contributors”协程恢复，`receive()` 调用返回该列表，结果立即得到更新。

现在可以运行程序并选择 _CHANNELS_ 选项来加载贡献者并查看结果。

虽然协程和通道都不能完全消除并发带来的复杂性，但在你需要弄清楚程序运作过程时，它们能让事情变得轻松很多。

## 测试协程 {id="testing-coroutines"}

现在让我们测试所有解决方案，以验证并发协程方案比使用 `suspend` 函数的方案更快，并验证使用通道的方案比简单的“progress”方案更快。

在接下来的任务中，你将比较这些解决方案的总运行时间。你将模拟（mock）一个 GitHub 服务，并让该服务在指定的超时后返回结果：

```text
repos request - 在 1000 毫秒延迟内返回结果
repo-1 - 1000 毫秒延迟
repo-2 - 1200 毫秒延迟
repo-3 - 800 毫秒延迟
```

使用 `suspend` 函数的顺序解决方案大约需要 4000 毫秒（4000 = 1000 + (1000 + 1200 + 800)）。
并发解决方案大约需要 2200 毫秒（2200 = 1000 + max(1000, 1200, 800)）。

对于显示进度的解决方案，你还可以检查带有时间戳的中间结果。

相应的测试数据定义在 `test/contributors/testData.kt` 中，文件 `Request4SuspendKtTest`、`Request7ChannelsKtTest` 等包含使用模拟服务调用的直接测试。

然而，这里存在两个问题：

* 这些测试运行耗时太长。每次测试大约需要 2 到 4 秒，而且你每次都需要等待结果。效率不高。
* 你无法依赖解决方案运行的准确时间，因为准备和运行代码仍然需要额外的时间。你可以添加一个常量偏移，但这样在不同的机器上时间会有所不同。模拟服务的延迟应该高于这个常量，这样你才能看出差异。如果常量是 0.5 秒，将延迟设为 0.1 秒将远远不够。

更好的方法是使用专门的框架在多次运行相同代码的同时测试时间（这会使总时间进一步增加），但这需要学习和配置，较为复杂。

为了解决这些问题并确保具有指定测试延迟的解决方案表现符合预期（一个比另一个快），请使用带有特殊测试调度器的_虚拟（virtual）_时间。此调度器会跟踪从开始经过的虚拟时间，并在现实世界中以实时方式立即运行所有内容。当在此调度器上运行协程时，`delay` 将立即返回并推进虚拟时间。

使用此机制的测试运行速度很快，但你仍然可以检查虚拟时间中不同时刻发生的情况。总运行时间大幅减少：

![总运行时间对比](time-comparison.png){width=700}

要使用虚拟时间，请将 `runBlocking` 调用替换为 `runTest`。`runTest` 接受一个针对 `TestScope` 的扩展 lambda 作为实参。当在此特殊作用域内的 `suspend` 函数中调用 `delay` 时，`delay` 将增加虚拟时间而不是进行实时延迟：

```kotlin
@Test
fun testDelayInSuspend() = runTest {
    val realStartTime = System.currentTimeMillis() 
    val virtualStartTime = currentTime
        
    foo()
    println("${System.currentTimeMillis() - realStartTime} ms") // ~ 6 ms
    println("${currentTime - virtualStartTime} ms")             // 1000 ms
}

suspend fun foo() {
    delay(1000)    // 自动推进，无延迟
    println("foo") // 在调用 foo() 时立即执行
}
```

你可以使用 `TestScope` 的 `currentTime` 属性检查当前的虚拟时间。

此示例中的实际运行时间为几毫秒，而虚拟时间等于延迟实参，即 1000 毫秒。

要在子协程中获得“虚拟”`delay` 的完整效果，必须使用 `TestDispatcher` 启动所有子协程。否则它将不起作用。除非你提供了不同的调度器，否则此调度器会自动从另一个 `TestScope` 继承：

```kotlin
@Test
fun testDelayInLaunch() = runTest {
    val realStartTime = System.currentTimeMillis()
    val virtualStartTime = currentTime

    bar()

    println("${System.currentTimeMillis() - realStartTime} ms") // ~ 11 ms
    println("${currentTime - virtualStartTime} ms")             // 1000 ms
}

suspend fun bar() = coroutineScope {
    launch {
        delay(1000)    // 自动推进，无延迟
        println("bar") // 在调用 bar() 时立即执行
    }
}
```

如果在上面的示例中调用 `launch` 时附带了 `Dispatchers.Default` 上下文，测试将失败。你将收到一个异常，指出作业尚未完成。

仅当 `loadContributorsConcurrent()` 函数使用继承的上下文启动子协程，且没有使用 `Dispatchers.Default` 调度器对其进行修改时，你才能以此方式测试它。

你可以在_调用_函数时而不是在_定义_函数时指定像调度器这样的上下文元素，这提供了更大的灵活性和更简单的测试方案。

> 支持虚拟时间的测试 API 是[实验性（Experimental）](components-stability.md)的，将来可能会发生变化。
>
{style="warning"}

默认情况下，如果使用实验性测试 API，编译器会显示警告。要抑制这些警告，请使用 `@OptIn(ExperimentalCoroutinesApi::class)` 注解测试函数或包含测试的整个类。添加编译器参数以告知编译器你正在使用实验性 API：

```kotlin
compileTestKotlin {
    kotlinOptions {
        freeCompilerArgs += "-Xuse-experimental=kotlin.Experimental"
    }
}
```

在本教程对应的项目中，该编译器参数已添加到 Gradle 脚本中。

### 任务 8 {id="task-8"}

重构 `tests/tasks/` 中的以下测试，以使用虚拟时间代替真实时间：

* `Request4SuspendKtTest.kt`
* `Request5ConcurrentKtTest.kt`
* `Request6ProgressKtTest.kt`
* `Request7ChannelsKtTest.kt`

比较应用重构前后的总运行时间。

#### 任务 8 的提示 {initial-collapse-state="collapsed" collapsible="true" id="tip-for-task-8"}

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

2. 撤消检查精确虚拟时间的断言注释。
3. 不要忘记添加 `@UseExperimental(ExperimentalCoroutinesApi::class)`。

#### 任务 8 的解决方案 {initial-collapse-state="collapsed" collapsible="true" id="solution-for-task-8"}

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

最后一个通道版本的第一个中间结果比 progress 版本更早可用，并且你可以在使用虚拟时间的测试中看到这种差异。

> 其余“suspend”和“progress”任务的测试非常相似——你可以在项目的 `solutions` 分支中找到它们。
>
{style="tip"}

## 后续步骤 {id="what-s-next"}

* 观看 KotlinConf 上的 [Asynchronous Programming with Kotlin](https://kotlinconf.com/workshops/) 讲座。
* 详细了解有关使用[虚拟时间和实验性测试软件包](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-test/)的内容。