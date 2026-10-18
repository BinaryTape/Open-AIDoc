<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: 協同程式與通道 − 教學)

> 即將推出的更新將會修訂本教學。在此期間，若要取得最新版的協同程式入門指南，請參閱[協同程式基本概念](coroutines-basics.md)。
> 
{style="note"}

在本教學中，你將學習如何在 IntelliJ IDEA 中使用協同程式來執行網路請求，而無需阻塞底層執行緒或使用回呼。

> 不需要具備協同程式的先備知識，但希望你熟悉基本的 Kotlin 語法。
>
{style="tip"}

你將學到：

* 為什麼以及如何使用掛起函式來執行網路請求。
* 如何使用協同程式並行發送請求。
* 如何使用通道在不同的協同程式之間共享資訊。

對於網路請求，你將需要 [Retrofit](https://lysine.dev/retrofit/) 程式庫，但本教學中展示的方法在任何其他支援協同程式的程式庫中都能以類似方式運作。

> 你可以在[專案存放庫](http://github.com/kotlin-hands-on/intro-coroutines)的 `solutions` 分支中找到所有任務的解決方案。
>
{style="tip"}

## 開始之前 {id="before-you-start"}

1. 下載並安裝最新版本的 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/index.html)。
2. 在歡迎畫面選擇 **Get from VCS**，或選取 **File | New | Project from Version Control** 來複製[專案樣板](http://github.com/kotlin-hands-on/intro-coroutines)。

   你也可以透過命令列進行複製：

   ```Bash
   git clone https://github.com/kotlin-hands-on/intro-coroutines
   ```

### 產生 GitHub 開發者權杖 {id="generate-a-github-developer-token"}

你將在專案中使用 GitHub API。若要取得存取權限，請提供你的 GitHub 帳號名稱以及密碼或權杖。如果你啟用了雙重身份驗證，僅需提供權杖即可。

使用[你的帳號](https://github.com/settings/tokens/new)產生一個新的 GitHub 權杖以使用 GitHub API：

1. 指定權杖的名稱，例如 `coroutines-tutorial`：

   ![產生新的 GitHub 權杖](generating-token.png){width=700}

2. 不要選取任何作用域（scopes）。點擊頁面底部的 **Generate token**。
3. 複製產生的權杖。

### 執行程式碼 {id="run-the-code"}

該程式會載入給定組織（預設為「kotlin」）下所有儲存庫的貢獻者。稍後你將加入邏輯，依使用者的貢獻次數進行排序。

1. 開啟 `src/contributors/main.kt` 檔案並執行 `main()` 函式。你將看到以下視窗：

   ![初始視窗](initial-window.png){width=500}

   如果字體太小，可以在 `main()` 函式中透過更改 `setDefaultFontSize(18f)` 的值來調整。

2. 在相應的欄位中提供你的 GitHub 使用者名稱和權杖（或密碼）。
3. 確保在 _Variant_ 下拉式功能表中選取了 _BLOCKING_ 選項。
4. 點擊 _Load contributors_。UI 應該會凍結一段時間，然後顯示貢獻者清單。
5. 開啟程式輸出以確保資料已載入。在每次成功的請求後，都會記錄貢獻者清單。

實作此邏輯有不同的方式：使用[阻塞請求](#blocking-requests)或[回呼](#callbacks)。你將把這些解決方案與使用[協同程式](#coroutines)的方案進行比較，並了解如何使用[通道](#channels)在不同的協同程式之間共享資訊。

## 阻塞請求 {id="blocking-requests"}

你將使用 [Retrofit](https://lysine.dev/retrofit/) 程式庫向 GitHub 發出 HTTP 請求。它允許請求給定組織下的儲存庫清單以及每個儲存庫的貢獻者清單：

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

`loadContributorsBlocking()` 函式使用此 API 來擷取給定組織的貢獻者清單。

1. 開啟 `src/tasks/Request1Blocking.kt` 查看其實作：

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

    * 首先，取得給定組織下的儲存庫清單並儲存在 `repos` 清單中。然後針對每個儲存庫請求貢獻者清單，並將所有清單合併為最終的貢獻者清單。
    * `getOrgReposCall()` 與 `getRepoContributorsCall()` 都會回傳 `*Call` 類別的執行個體（`#1`）。此時尚未發送任何請求。
    * 接著叫用 `*Call.execute()` 來執行請求（`#2`）。`execute()` 是一個同步呼叫，會阻塞底層執行緒。
    * 當收到回應時，透過呼叫特定的 `logRepos()` 與 `logUsers()` 函式來記錄結果（`#3`）。如果 HTTP 回應包含錯誤，將在此記錄錯誤。
    * 最後，取得包含所需資料的回應主體。在本教學中，如果發生錯誤，將使用空清單作為結果，並記錄相應的錯誤（`#4`）。

2. 為了避免重複撰寫 `.body() ?: emptyList()`，宣告了一個擴充函式 `bodyList()`：

    ```kotlin
    fun <T> Response<List<T>>.bodyList(): List<T> {
        return body() ?: emptyList()
    }
    ```  

3. 再次執行程式並查看 IntelliJ IDEA 中的系統輸出。它應該會顯示類似以下內容：

    ```text
    1770 [AWT-EventQueue-0] INFO  Contributors - kotlin: loaded 40 repos
    2025 [AWT-EventQueue-0] INFO  Contributors - kotlin-examples: loaded 23 contributors
    2229 [AWT-EventQueue-0] INFO  Contributors - kotlin-koans: loaded 45 contributors
    ...
    ```

    * 每行的第一個項目是自程式啟動以來經過的毫秒數，接著是方括號中的執行緒名稱。你可以看出載入請求是從哪個執行緒呼叫的。
    * 每行的最後一個項目是實際訊息：載入了多少個儲存庫或貢獻者。

    此記錄輸出表明所有結果都是從主執行緒記錄的。當你使用 _BLOCKING_ 選項執行程式碼時，視窗會凍結，並且在載入完成前不會對輸入做出回應。所有請求都是從呼叫 `loadContributorsBlocking()` 的同一個執行緒執行的，也就是主 UI 執行緒（在 Swing 中是 AWT 事件分派執行緒）。這個主執行緒被阻塞了，這就是 UI 凍結的原因：

    ![被阻塞的主執行緒](blocking.png){width=700}
    
    貢獻者清單載入完畢後，結果將會更新。

4. 在 `src/contributors/Contributors.kt` 中，找到負責選擇如何載入貢獻者的 `loadContributors()` 函式，並查看 `loadContributorsBlocking()` 是如何被呼叫的：

    ```kotlin
    when (getSelectedVariant()) {
        BLOCKING -> { // Blocking UI thread
            val users = loadContributorsBlocking(service, req)
            updateResults(users, startTime)
        }
    }
    ```

    * `updateResults()` 呼叫緊接在 `loadContributorsBlocking()` 呼叫之後。
    * `updateResults()` 會更新 UI，因此必須始終從 UI 執行緒呼叫。
    * 由於 `loadContributorsBlocking()` 也是從 UI 執行緒呼叫的，UI 執行緒會被阻塞，UI 也隨之凍結。

### 任務 1 {id="task-1"}

第一個任務有助於你熟悉任務領域。目前，每位貢獻者的名字都會重複出現數次，每參與一個專案就會出現一次。實作 `aggregate()` 函式來合併使用者，使得每位貢獻者只被新增一次。`User.contributions` 屬性應包含該使用者在*所有*專案中的貢獻總數。產生的清單應根據貢獻次數降冪排序。

開啟 `src/tasks/Aggregation.kt` 並實作 `List<User>.aggregate()` 函式。使用者應依其貢獻總數排序。

對應的測試檔案 `test/tasks/AggregationKtTest.kt` 顯示了預期結果的範例。

> 你可以使用 [IntelliJ IDEA 快速鍵](https://www.jetbrains.com/help/idea/create-tests.html#test-code-navigation) `Ctrl+Shift+T` / `⇧ ⌘ T` 在原始碼和測試類別之間自動跳轉。
>
{style="tip"}

完成此任務後，「kotlin」組織產生的清單應類似於以下內容：

![「kotlin」組織的清單](aggregate.png){width=500}

#### 任務 1 解決方案 {initial-collapse-state="collapsed" collapsible="true" id="solution-for-task-1"}

1. 若要按登入名稱（login）將使用者分組，請使用 [`groupBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/group-by.html)，它會回傳一個映射（Map），將登入名稱對應到該登入名稱的使用者在不同儲存庫中出現的所有記錄。
2. 對於每個 Map 項目，計算每位使用者的總貢獻次數，並使用給定的名稱和貢獻總數建立 `User` 類別的新執行個體。
3. 將產生的清單按降冪排序：

    ```kotlin
    fun List<User>.aggregate(): List<User> =
        groupBy { it.login }
            .map { (login, group) -> User(login, group.sumOf { it.contributions }) }
            .sortedByDescending { it.contributions }
    ```

另一種替代解決方案是使用 [`groupingBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/grouping-by.html) 函式來取代 `groupBy()`。

## 回呼 {id="callbacks"}

之前的解決方案雖然可行，但它阻塞了執行緒，進而導致 UI 凍結。避免這種情況的傳統做法是使用*回呼（callbacks）*。

你可以不立即呼叫操作完成後應執行的程式碼，而是將其提取到一個單獨的回呼中（通常是 Lambda 運算式），並將該 Lambda 傳遞給呼叫者，以便稍後呼叫。

為了讓 UI 保持回應，你可以將整個運算移至單獨的執行緒，或改用 Retrofit API 中使用回呼而非阻塞呼叫的方式。

### 使用背景執行緒 {id="use-a-background-thread"}

1. 開啟 `src/tasks/Request2Background.kt` 並查看其實作。首先，整個運算被移至不同的執行緒。`thread()` 函式會啟動一個新執行緒：

    ```kotlin
    thread {
        loadContributorsBlocking(service, req)
    }
    ```

    現在所有的載入工作都已移至單獨的執行緒，主執行緒便空閒出來，可以處理其他任務：

    ![釋放的主執行緒](background.png){width=700}

2. `loadContributorsBackground()` 函式的簽章發生了變化。它接受一個 `updateResults()` 回呼作為最後一個引數，以便在所有載入完成後呼叫它：

    ```kotlin
    fun loadContributorsBackground(
        service: GitHubService, req: RequestData,
        updateResults: (List<User>) -> Unit
    )
    ```

3. 現在呼叫 `loadContributorsBackground()` 時，`updateResults()` 的呼叫是在回呼內部進行的，而不是像之前那樣緊接著呼叫：

    ```kotlin
    loadContributorsBackground(service, req) { users ->
        SwingUtilities.invokeLater {
            updateResults(users, startTime)
        }
    }
    ```

    透過呼叫 `SwingUtilities.invokeLater`，你可以確保負責更新結果的 `updateResults()` 呼叫發生在主 UI 執行緒（AWT 事件分派執行緒）上。

然而，如果你嘗試透過 `BACKGROUND` 選項載入貢獻者，你會發現清單已更新，但 UI 上沒有任何變化。

### 任務 2 {id="task-2"}

修正 `src/tasks/Request2Background.kt` 中的 `loadContributorsBackground()` 函式，使產生的清單能顯示在 UI 中。

#### 任務 2 解決方案 {initial-collapse-state="collapsed" collapsible="true" id="solution-for-task-2"}

如果你嘗試載入貢獻者，可以在記錄中看到貢獻者已載入，但未顯示結果。若要解決此問題，請在產生的使用者清單上呼叫 `updateResults()`：

```kotlin
thread {
    updateResults(loadContributorsBlocking(service, req))
}
```

請確保明確呼叫傳入回呼的邏輯。否則什麼事都不會發生。

### 使用 Retrofit 回呼 API {id="use-the-retrofit-callback-api"}

在上一個解決方案中，整個載入邏輯被移至背景執行緒，但這仍然不是資源的最佳利用方式。所有的載入請求都是循序進行的，執行緒在等待載入結果時會被阻塞，而這段時間它原本可以用來處理其他任務。具體來說，執行緒可以開始載入另一個請求，從而更快接收到完整結果。

因此，處理每個儲存庫資料的過程應分為兩部分：載入與處理產生的回應。第二部分*處理*應提取到回呼中。

這樣一來，在收到前一個儲存庫的結果（並呼叫相應的回呼）之前，就可以開始載入下一個儲存庫：

![使用回呼 API](callbacks.png){width=700}

Retrofit 回呼 API 有助於實現這一點。`Call.enqueue()` 函式會發起一個 HTTP 請求，並接受一個回呼作為引數。在此回呼中，你需要指定每個請求完成後需要做的事情。

開啟 `src/tasks/Request3Callbacks.kt` 並查看使用此 API 的 `loadContributorsCallbacks()` 實作：

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

* 為了方便起見，此程式碼片段使用了在同一個檔案中宣告的 `onResponse()` 擴充函式。它接受一個 Lambda 作為引數，而不是物件運算式。
* 處理回應的邏輯被提取到回呼中：對應的 Lambda 從 `#1` 行和 `#2` 行開始。

然而，提供的解決方案無法正常運作。如果你執行程式並透過選取 _CALLBACKS_ 選項來載入貢獻者，你會看到什麼都沒顯示。但是，來自 `Request3CallbacksKtTest` 的測試卻立即回傳成功通過的結果。

思考一下為什麼給定的程式碼沒有按預期運作並嘗試修復它，或者查看下方的解決方案。

### 任務 3（可選） {id="task-3-optional"}

重寫 `src/tasks/Request3Callbacks.kt` 檔案中的程式碼，使載入的貢獻者清單能夠正確顯示。

#### 任務 3 的第一次嘗試解決方案 {initial-collapse-state="collapsed" collapsible="true" id="the-first-attempted-solution-for-task-3"}

在目前的解決方案中，許多請求是並行發起的，這減少了總載入時間。然而，結果並未被載入。這是因為 `updateResults()` 回呼是在所有載入請求剛發起後立即被呼叫的，此時 `allUsers` 清單尚未填入資料。

你可以嘗試使用類似以下的變更來修復它：

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

* 首先，使用索引遍歷儲存庫清單（`#1`）。
* 然後，在每個回呼中檢查是否為最後一次反覆運算（`#2`）。
* 如果是，則更新結果。

然而，這段程式碼也無法達到我們的目標。嘗試自己找出答案，或查看下方的解決方案。

#### 任務 3 的第二次嘗試解決方案 {initial-collapse-state="collapsed" collapsible="true" id="the-second-attempted-solution-for-task-3"}

由於載入請求是並行發起的，因此無法保證最後一個請求的結果會最後到達。結果可能以任何順序返回。

因此，如果你將目前索引與 `lastIndex` 進行比較以作為完成條件，你將面臨遺失某些儲存庫結果的風險。

如果處理最後一個儲存庫的請求比某些先前的請求更快返回（這種情況很可能會發生），那麼所有耗時較長的請求結果都將遺失。

解決此問題的一種方法是引入一個計數器，並檢查是否所有儲存庫都已處理完畢：

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

此程式碼使用了同步版本的清單和 `AtomicInteger()`，因為一般來說，無法保證處理 `getRepoContributors()` 請求的不同回呼一定會從同一個執行緒呼叫。

#### 任務 3 的第三次嘗試解決方案 {initial-collapse-state="collapsed" collapsible="true" id="the-third-attempted-solution-for-task-3"}

更好的解決方案是使用 `CountDownLatch` 類別。它儲存一個以儲存庫數量初始化的計數器。處理每個儲存庫後，該計數器遞減。然後在更新結果之前等待閉鎖計數倒數至零：

```kotlin
val countDownLatch = CountDownLatch(repos.size)
for (repo in repos) {
    service.getRepoContributorsCall(req.org, repo.name)
        .onResponse { responseUsers ->
            // processing repository
            countDownLatch.countDown()
        }
}
countDownLatch.await()
updateResults(allUsers.aggregate())
```

然後從主執行緒更新結果。這比將邏輯委派給子執行緒更直接。

在檢視了這三種解決方案的嘗試後，你可以發現使用回呼撰寫正確的程式碼並非易事且容易出錯，尤其是當涉及多個底層執行緒和同步時。

> 作為額外練習，你可以使用 RxJava 程式庫透過響應式方法實作相同的邏輯。使用 RxJava 所需的所有相依性和解決方案都可以在單獨的 `rx` 分支中找到。你也可以先完成本教學，然後實作或查看建議的 Rx 版本以進行適當的比較。
>
{style="tip"}

## 掛起函式 {id="suspending-functions"}

你可以使用掛起函式實作相同的邏輯。與其回傳 `Call<List<Repo>>`，不如將 API 呼叫定義為[掛起函式](composing-suspending-functions.md)，如下所示：

```kotlin
interface GitHubService {
    @GET("orgs/{org}/repos?per_page=100")
    suspend fun getOrgRepos(
        @Path("org") org: String
    ): List<Repo>
}
```

* `getOrgRepos()` 被定義為一個 `suspend` 函式。當你使用掛起函式執行請求時，底層執行緒不會被阻塞。關於其運作機制的更多細節將在後續小節中介紹。
* `getOrgRepos()` 直接回傳結果，而不是回傳 `Call`。如果結果不成功，則會擲出例外。

或者，Retrofit 允許回傳包裝在 `Response` 中的結果。在這種情況下會提供結果主體，並且可以手動檢查錯誤。本教學使用回傳 `Response` 的版本。

在 `src/contributors/GitHubService.kt` 中，將以下宣告加入到 `GitHubService` 介面：

```kotlin
interface GitHubService {
    // getOrgReposCall & getRepoContributorsCall declarations

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

### 任務 4 {id="task-4"}

你的任務是修改載入貢獻者的函式程式碼，以使用兩個新的掛起函式 `getOrgRepos()` 和 `getRepoContributors()`。新的 `loadContributorsSuspend()` 函式被標記為 `suspend` 以使用新的 API。

> 掛起函式不能隨處呼叫。從 `loadContributorsBlocking()` 呼叫掛起函式會導致錯誤，訊息為「Suspend function 'getOrgRepos' should be called only from a coroutine or another suspend function」。
>
{style="note"}

1. 將 `src/tasks/Request1Blocking.kt` 中定義的 `loadContributorsBlocking()` 實作複製到 `src/tasks/Request4Suspend.kt` 中定義的 `loadContributorsSuspend()` 中。
2. 修改程式碼，以使用新的掛起函式取代回傳 `Call` 的函式。
3. 選取 _SUSPEND_ 選項執行程式，並確保在執行 GitHub 請求時 UI 仍保持回應。

#### 任務 4 解決方案 {initial-collapse-state="collapsed" collapsible="true" id="solution-for-task-4"}

將 `.getOrgReposCall(req.org).execute()` 替換為 `.getOrgRepos(req.org)`，並對第二個「contributors」請求重複相同的替換：

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

* `loadContributorsSuspend()` 應定義為 `suspend` 函式。
* 你不再需要呼叫先前用來回傳 `Response` 的 `execute`，因為現在 API 函式直接回傳 `Response`。請注意，此細節特定於 Retrofit 程式庫。使用其他程式庫時 API 可能有所不同，但概念是相同的。

## 協同程式 {id="coroutines"}

使用掛起函式的程式碼看起來與「阻塞」版本相似。與阻塞版本的主要差別在於，協同程式不會阻塞執行緒，而是被掛起（suspend）：

```text
block -> suspend
thread -> coroutine
```

> 協同程式常被稱為輕量級執行緒，因為你可以在協同程式上執行程式碼，就像在執行緒上執行程式碼一樣。先前會造成阻塞的操作（過去必須加以避免），現在可以改為掛起協同程式。
>
{style="note"}

### 啟動新的協同程式 {id="starting-a-new-coroutine"}

如果你看一下在 `src/contributors/Contributors.kt` 中是如何使用 `loadContributorsSuspend()` 的，你會發現它是在 `launch` 內部被呼叫的。`launch` 是一個接受 Lambda 作為引數的程式庫函式：

```kotlin
launch {
    val users = loadContributorsSuspend(req)
    updateResults(users, startTime)
}
```

在此處，`launch` 啟動了一個負責載入資料並顯示結果的新運算。該運算是可掛起的（suspendable）——在執行網路請求時，它會被掛起並釋放底層執行緒。當網路請求回傳結果時，運算便會恢復。

這種可掛起的運算稱為*協同程式（coroutine）*。因此在這種情況下，`launch` *啟動了一個新的協同程式*，負責載入資料並顯示結果。

協同程式執行在執行緒之上，並且可以被掛起。當協同程式掛起時，相應的運算會暫停、從執行緒中移出並儲存在記憶體中。在此期間，執行緒便可以自由處理其他任務：

![掛起協同程式](suspension-process.gif){width=700}

當運算準備好繼續時，它會返回到某個執行緒中（不一定是同一個執行緒）。

在 `loadContributorsSuspend()` 範例中，每個「contributors」請求現在都使用掛起機制等待結果。首先發送新請求。接著在等待回應時，由 `launch` 函式啟動的整個「載入貢獻者」協同程式都會被掛起。

該協同程式僅在收到相應的回應後才會恢復：

![掛起請求](suspend-requests.png){width=700}

在等待接收回應時，執行緒可以自由處理其他任務。儘管所有請求都在主 UI 執行緒上進行，UI 仍能保持回應：

1. 使用 _SUSPEND_ 選項執行程式。記錄證實所有請求都是從主 UI 執行緒發送的：

    ```text
    2538 [AWT-EventQueue-0 @coroutine#1] INFO  Contributors - kotlin: loaded 30 repos
    2729 [AWT-EventQueue-0 @coroutine#1] INFO  Contributors - ts2kt: loaded 11 contributors
    3029 [AWT-EventQueue-0 @coroutine#1] INFO  Contributors - kotlin-koans: loaded 45 contributors
    ...
    11252 [AWT-EventQueue-0 @coroutine#1] INFO  Contributors - kotlin-coroutines-workshop: loaded 1 contributors
    ```

2. 記錄可以向你顯示對應的程式碼正在哪個協同程式上執行。若要啟用此功能，請開啟 **Run | Edit configurations** 並加入 `-Dkotlinx.coroutines.debug` 虛擬機選項：

   ![編輯執行配置](run-configuration.png){width=500}

   使用此選項執行 `main()` 時，協同程式名稱將附加在執行緒名稱後方。你也可以修改用於執行所有 Kotlin 檔案的範本，預設啟用此選項。

現在所有的程式碼都在一個協同程式上執行，即上述標註為 `@coroutine#1` 的「載入貢獻者」協同程式。在等待結果時，你不應該重複使用該執行緒來發送其他請求，因為程式碼是循序撰寫的。只有在收到前一個結果時，才會發送新請求。

掛起函式公平對待執行緒，不會因為「等待」而阻塞它。然而，這尚未引入任何並行處理。

## 並行 {id="concurrency"}

Kotlin 協同程式所佔用的資源遠比執行緒少。
每次你想要非同步啟動新運算時，都可以改為建立一個新的協同程式。

若要啟動新的協同程式，請使用主要的*協同程式建構器（coroutine builders）*之一：`launch`、`async` 或 `runBlocking`。不同的程式庫可以定義額外的協同程式建構器。

`async` 會啟動一個新的協同程式並回傳一個 `Deferred` 物件。`Deferred` 代表了在其他名稱中所熟知的概念，例如 `Future` 或 `Promise`。它儲存了一項運算，但它*推遲（defers）*了你取得最終結果的時間點；它*承諾（promises）*在*未來（future）*的某個時間點提供結果。

`async` 和 `launch` 的主要區別在於，`launch` 用於啟動不預期回傳特定結果的運算。`launch` 回傳代表該協同程式的 `Job`。可以透過呼叫 `Job.join()` 來等待其完成。

`Deferred` 是一個擴充 `Job` 的泛型型別。`async` 呼叫可以回傳 `Deferred<Int>` 或 `Deferred<CustomType>`，取決於 Lambda 回傳的內容（Lambda 內的最後一個運算式即為結果）。

若要取得協同程式的結果，可以在 `Deferred` 執行個體上呼叫 `await()`。在等待結果時，呼叫此 `await()` 的協同程式會被掛起：

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

`runBlocking` 用作常規函式與掛起函式之間，或阻塞世界與非阻塞世界之間的橋樑。它作為啟動頂層主協同程式的配接器。它主要用於 `main()` 函式和測試中。

> 觀看[此影片](https://www.youtube.com/watch?v=zEZc5AmHQhk)以更深入了解協同程式。
>
{style="tip"}

如果有一個 Deferred 物件清單，可以呼叫 `awaitAll()` 來等待它們所有結果：

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

當每個「contributors」請求都在新的協同程式中啟動時，所有請求都會非同步啟動。在收到前一個請求的結果之前，就可以發送新的請求：

![並行協同程式](concurrency.png){width=700}

總載入時間與 _CALLBACKS_ 版本大致相同，但它不需要任何回呼。更重要的是，`async` 明確強調了程式碼中哪些部分是並行執行的。

### 任務 5 {id="task-5"}

在 `Request5Concurrent.kt` 檔案中，透過使用先前的 `loadContributorsSuspend()` 函式來實作 `loadContributorsConcurrent()` 函式。

#### 任務 5 提示 {initial-collapse-state="collapsed" collapsible="true" id="tip-for-task-5"}

你只能在協同程式作用域內啟動新的協同程式。將內容從 `loadContributorsSuspend()` 複製到 `coroutineScope` 呼叫中，以便可以在那裡呼叫 `async` 函式：

```kotlin
suspend fun loadContributorsConcurrent(
    service: GitHubService,
    req: RequestData
): List<User> = coroutineScope {
    // ...
}
```

將你的解決方案基於以下架構：

```kotlin
val deferreds: List<Deferred<List<User>>> = repos.map { repo ->
    async {
        // load contributors for each repo
    }
}
deferreds.awaitAll() // List<List<User>>
```

#### 任務 5 解決方案 {initial-collapse-state="collapsed" collapsible="true" id="solution-for-task-5"}

使用 `async` 包裝每個「contributors」請求，以建立與儲存庫數量相同的協同程式。`async` 會回傳 `Deferred<List<User>>`。這不是問題，因為建立新的協同程式不會耗費太多資源，所以你可以根據需要建立任意數量的協同程式。

1. 你不能再使用 `flatMap`，因為 `map` 的結果現在是 `Deferred` 物件清單，而不是清單的清單。`awaitAll()` 會回傳 `List<List<User>>`，因此呼叫 `flatten().aggregate()` 來取得結果：

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

2. 執行程式碼並檢查記錄。所有的協同程式仍會在主 UI 執行緒上執行，因為尚未採用多執行緒，但你已經可以看到並行執行協同程式的好處。
3. 若要修改此程式碼，讓「contributors」協同程式在共用執行緒集區的不同執行緒上執行，請指定 `Dispatchers.Default` 作為 `async` 函式的上下文引數：

    ```kotlin
    async(Dispatchers.Default) { }
    ```

    * `CoroutineDispatcher` 決定相應的協同程式應在哪個或哪些執行緒上執行。如果未指定引數，`async` 將使用來自外層作用域的分派器。
    * `Dispatchers.Default` 代表 JVM 上的共享執行緒集區。此集區提供了平行執行的途徑。它包含與可用 CPU 核心數量相同的執行緒，但如果只有一個核心，它仍然會有兩個執行緒。

4. 修改 `loadContributorsConcurrent()` 函式中的程式碼，以在共用執行緒集區的不同執行緒上啟動新協同程式。此外，在發送請求之前加入額外的記錄輸出：

    ```kotlin
    async(Dispatchers.Default) {
        log("starting loading for ${repo.name}")
        service.getRepoContributors(req.org, repo.name)
            .also { logUsers(repo, it) }
            .bodyList()
    }
    ```

5. 再次執行程式。在記錄中，你可以看到每個協同程式都可以在執行緒集區的一個執行緒上啟動，並在另一個執行緒上恢復：

    ```text
    1946 [DefaultDispatcher-worker-2 @coroutine#4] INFO  Contributors - starting loading for kotlin-koans
    1946 [DefaultDispatcher-worker-3 @coroutine#5] INFO  Contributors - starting loading for dokka
    1946 [DefaultDispatcher-worker-1 @coroutine#3] INFO  Contributors - starting loading for ts2kt
    ...
    2178 [DefaultDispatcher-worker-1 @coroutine#4] INFO  Contributors - kotlin-koans: loaded 45 contributors
    2569 [DefaultDispatcher-worker-1 @coroutine#5] INFO  Contributors - dokka: loaded 36 contributors
    2821 [DefaultDispatcher-worker-2 @coroutine#3] INFO  Contributors - ts2kt: loaded 11 contributors
    ```

   例如在此記錄節錄中，`coroutine#4` 在 `worker-2` 執行緒上啟動，並在 `worker-1` 執行緒上繼續執行。

在 `src/contributors/Contributors.kt` 中，檢查 _CONCURRENT_ 選項的實作：

1. 若要僅在主 UI 執行緒上執行協同程式，請指定 `Dispatchers.Main` 作為引數：

    ```kotlin
    launch(Dispatchers.Main) {
        updateResults()
    }
    ```

    * 如果你在主執行緒上啟動新協同程式時主執行緒正忙，該協同程式將會被掛起並排定在此執行緒上執行。只有當執行緒空閒時，協同程式才會恢復。
    * 使用來自外層作用域的分派器，而非在每個端點上明確指定它，被認為是良好的實務做法。如果你在定義 `loadContributorsConcurrent()` 時不傳入 `Dispatchers.Default` 作為引數，你就可以在任何上下文中呼叫此函式：搭配 `Default` 分派器、搭配主 UI 執行緒，或搭配自訂分派器。
    * 正如你稍後將看到的，從測試中呼叫 `loadContributorsConcurrent()` 時，可以在帶有 `TestDispatcher` 的上下文中呼叫它，這簡化了測試工作。這使得此解決方案更具彈性。

2. 若要在呼叫端指定分派器，請對專案套用以下變更，同時讓 `loadContributorsConcurrent` 在繼承的上下文中啟動協同程式：

    ```kotlin
    launch(Dispatchers.Default) {
        val users = loadContributorsConcurrent(service, req)
        withContext(Dispatchers.Main) {
            updateResults(users, startTime)
        }
    }
    ```

    * `updateResults()` 應在主 UI 執行緒上呼叫，因此你在 `Dispatchers.Main` 上下文中呼叫它。
    * `withContext()` 使用指定的協同程式上下文呼叫給定的程式碼，掛起直到完成，並回傳結果。另一種更冗長但也等效的表達方式是啟動一個新的協同程式並明確等待（透過掛起）直到它完成：`launch(context) { ... }.join()`。

3. 執行程式碼並確保協同程式在來自執行緒集區的執行緒上執行。

## 結構化並行 {id="structured-concurrency"}

* *協同程式作用域（coroutine scope）*負責不同協同程式之間的結構以及父子關係。新的協同程式通常需要在作用域內部啟動。
* *協同程式上下文（coroutine context）*儲存了用於執行給定協同程式的額外技術資訊，例如協同程式自訂名稱，或是指定協同程式應排程在哪個執行緒上的分派器。

當使用 `launch`、`async` 或 `runBlocking` 啟動新的協同程式時，它們會自動建立相應的作用域。所有這些函式都接受帶有接收者的 Lambda 作為引數，而 `CoroutineScope` 就是隱式的接收者型別：

```kotlin
launch { /* this: CoroutineScope */ }
```

* 新的協同程式只能在作用域內啟動。
* `launch` 和 `async` 被宣告為 `CoroutineScope` 的擴充函式，因此呼叫它們時必須始終傳遞隱式或顯式的接收者。
* 由 `runBlocking` 啟動的協同程式是唯一的例外，因為 `runBlocking` 被定義為頂層函式。但因為它會阻塞當前執行緒，所以主要用作 `main()` 函式和測試中的橋樑函式。

在 `runBlocking`、`launch` 或 `async` 內部的新協同程式會自動在作用域內啟動：

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking { /* this: CoroutineScope */
    launch { /* ... */ }
    // 等同於：   
    this.launch { /* ... */ }
}
```

當你在 `runBlocking` 內部呼叫 `launch` 時，它是作為 `CoroutineScope` 型別隱式接收者的擴充來呼叫的。或者，你也可以顯式寫成 `this.launch`。

巢狀協同程式（在此範例中由 `launch` 啟動）可視為外層協同程式（由 `runBlocking` 啟動）的子協同程式。這種「父子」關係是透過作用域運作的；子協同程式是從對應於父協同程式的作用域啟動的。

可以使用 `coroutineScope` 函式在不啟動新協同程式的情況下建立新的作用域。
若要在 `suspend` 函式內部以結構化的方式啟動新協同程式，且無需存取外層作用域，你可以建立一個新的協同程式作用域，該作用域會自動成為呼叫該 `suspend` 函式的外層作用域的子作用域。`loadContributorsConcurrent()` 就是一個很好的例子。

你也可以使用 `GlobalScope.async` 或 `GlobalScope.launch` 從全域作用域啟動新的協同程式。這將建立一個頂層的「獨立」協同程式。

協同程式結構背後的機制稱為*結構化並行（structured concurrency）*。相較於全域作用域，它提供了以下好處：

* 作用域通常對子協同程式負責，子協同程式的生命週期與作用域的生命週期綁定。
* 如果出錯或使用者改變心意決定取消操作，作用域可以自動取消子協同程式。
* 作用域會自動等待所有子協同程式完成。因此，如果該作用域對應於一個協同程式，則在其作用域中啟動的所有協同程式完成之前，父協同程式不會完成。

使用 `GlobalScope.async` 時，沒有將多個協同程式綁定到較小作用域的結構。從全域作用域啟動的協同程式全都是獨立的——它們的生命週期僅受限於整個應用程式的生命週期。可以保留從全域作用域啟動的協同程式參照，並等待其完成或明確取消它，但這不會像在結構化並行中那樣自動發生。

### 取消載入貢獻者 {id="canceling-the-loading-of-contributors"}

建立兩個版本的載入貢獻者清單函式。比較嘗試取消父協同程式時這兩個版本的行為。第一個版本將使用 `coroutineScope` 來啟動所有子協同程式，而第二個版本將使用 `GlobalScope`。

1. 在 `Request5Concurrent.kt` 中，為 `loadContributorsConcurrent()` 函式加入 3 秒的延遲： 

   ```kotlin
   suspend fun loadContributorsConcurrent(
       service: GitHubService, 
       req: RequestData
   ): List<User> = coroutineScope {
       // ...
       async {
           log("starting loading for ${repo.name}")
           delay(3000)
           // load repo contributors
       }
       // ...
   }
   ```
   
   延遲會影響所有發送請求的協同程式，這樣在協同程式啟動後但在請求發送之前，就有足夠的時間取消載入。

2. 建立載入函式的第二個版本：將 `loadContributorsConcurrent()` 的實作複製到 `Request5NotCancellable.kt` 中的 `loadContributorsNotCancellable()`，然後移除新 `coroutineScope` 的建立。
3. 現在 `async` 呼叫將無法解析，因此改用 `GlobalScope.async` 來啟動它們：

    ```kotlin
    suspend fun loadContributorsNotCancellable(
        service: GitHubService,
        req: RequestData
    ): List<User> {   // #1
        // ...
        GlobalScope.async {   // #2
            log("starting loading for ${repo.name}")
            // load repo contributors
        }
        // ...
        return deferreds.awaitAll().flatten().aggregate()  // #3
    }
    ```

    * 該函式現在直接回傳結果，而不是作為 Lambda 內的最後一個運算式（`#1` 和 `#3` 行）。
    * 所有「contributors」協同程式都在 `GlobalScope` 內啟動，而不是作為協同程式作用域的子項目（`#2` 行）。

4. 執行程式並選擇 _CONCURRENT_ 選項來載入貢獻者。
5. 等到所有「contributors」協同程式都啟動後，點擊 _Cancel_。記錄沒有顯示新結果，這代表所有請求確實都被取消了：

    ```text
    2896 [AWT-EventQueue-0 @coroutine#1] INFO  Contributors - kotlin: loaded 40 repos
    2901 [DefaultDispatcher-worker-2 @coroutine#4] INFO  Contributors - starting loading for kotlin-koans
    ...
    2909 [DefaultDispatcher-worker-5 @coroutine#36] INFO  Contributors - starting loading for mpp-example
    /* click on 'cancel' */
    /* no requests are sent */
    ```

6. 重複步驟 5，但這次選擇 `NOT_CANCELLABLE` 選項：

    ```text
    2570 [AWT-EventQueue-0 @coroutine#1] INFO  Contributors - kotlin: loaded 30 repos
    2579 [DefaultDispatcher-worker-1 @coroutine#4] INFO  Contributors - starting loading for kotlin-koans
    ...
    2586 [DefaultDispatcher-worker-6 @coroutine#36] INFO  Contributors - starting loading for mpp-example
    /* click on 'cancel' */
    /* but all the requests are still sent: */
    6402 [DefaultDispatcher-worker-5 @coroutine#4] INFO  Contributors - kotlin-koans: loaded 45 contributors
    ...
    9555 [DefaultDispatcher-worker-8 @coroutine#36] INFO  Contributors - mpp-example: loaded 8 contributors
    ```

    在這種情況下，沒有任何協同程式被取消，所有請求仍會被發送。

7. 查看「contributors」程式中是如何觸發取消的。點擊 _Cancel_ 按鈕時，主「載入」協同程式會被明確取消，子協同程式也會自動被取消：

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
    
            // cancel the loading job if the 'cancel' button was clicked:
            val listener = ActionListener {
                loadingJob.cancel()            // #3
                updateLoadingStatus(CANCELED)
            }
            // add a listener to the 'cancel' button:
            addCancelListener(listener)
    
            // update the status and remove the listener
            // after the loading job is completed
        }
    }   
    ```

`launch` 函式回傳一個 `Job` 執行個體。`Job` 儲存了對「載入協同程式」的參照，該協同程式負責載入所有資料並更新結果。你可以在其上呼叫 `setUpCancellation()` 擴充函式（`#1` 行），並將 `Job` 執行個體作為接收者傳遞。

另一種表達方式是顯式撰寫：

```kotlin
val job = launch { }
job.setUpCancellation()
```

* 為了提高可讀性，你可以在 `setUpCancellation()` 函式內部使用新的 `loadingJob` 變數來參照該函式的接收者（`#2` 行）。
* 然後你可以為 _Cancel_ 按鈕新增監聽器，以便在點擊時取消 `loadingJob`（`#3` 行）。

使用結構化並行，你只需要取消父協同程式，這會自動將取消傳播到所有子協同程式。

### 使用外層作用域的上下文 {id="using-the-outer-scope-s-context"}

當你在給定的作用域內啟動新的協同程式時，要確保它們都在相同的上下文中執行會容易得多。如果需要，替換上下文也會容易得多。

現在是了解如何使用外層作用域的分派器的時候了。由 `coroutineScope` 或協同程式建構器建立的新作用域始終會繼承外層作用域的上下文。在這種情況下，外層作用域就是呼叫 `suspend loadContributorsConcurrent()` 函式所在的作用域：

```kotlin
launch(Dispatchers.Default) {  // outer scope
    val users = loadContributorsConcurrent(service, req)
    // ...
}
```

所有巢狀協同程式都會自動以繼承的上下文啟動。分派器是此上下文的一部分。這就是為什麼由 `async` 啟動的所有協同程式都是在預設分派器的上下文中啟動的：

```kotlin
suspend fun loadContributorsConcurrent(
    service: GitHubService, req: RequestData
): List<User> = coroutineScope {
    // this scope inherits the context from the outer scope
    // ...
    async {   // nested coroutine started with the inherited context
        // ...
    }
    // ...
}
```

借助結構化並行，你可以在建立頂層協同程式時一次性指定主要的上下文元素（如分派器）。然後所有巢狀協同程式都會繼承該上下文，並且僅在需要時對其進行修改。

> 為 UI 應用程式（例如 Android 應用程式）撰寫協同程式程式碼時，常見的做法是在頂層協同程式中預設使用 `CoroutineDispatchers.Main`，然後在需要在不同執行緒上執行程式碼時明確指定不同的分派器。
>
{style="tip"}

## 顯示進度 {id="showing-progress"}

儘管某些儲存庫的資訊載入相當迅速，但使用者只有在所有資料都載入完畢後才能看到最終的清單。在此之前，載入圖示一直在運轉以顯示進度，但沒有關於當前狀態或已經載入了哪些貢獻者的資訊。

你可以更早顯示中繼結果，並在載入每個儲存庫的資料後顯示所有的貢獻者：

![載入資料](loading.gif){width=500}

若要實作此功能，在 `src/tasks/Request6Progress.kt` 中，你需要將更新 UI 的邏輯作為回呼傳遞，以便在每個中繼狀態呼叫它：

```kotlin
suspend fun loadContributorsProgress(
    service: GitHubService,
    req: RequestData,
    updateResults: suspend (List<User>, completed: Boolean) -> Unit
) {
    // loading the data
    // calling `updateResults()` on intermediate states
}
```

在 `Contributors.kt` 的呼叫端，會傳遞該回呼以在 _PROGRESS_ 選項下從 `Main` 執行緒更新結果：

```kotlin
launch(Dispatchers.Default) {
    loadContributorsProgress(service, req) { users, completed ->
        withContext(Dispatchers.Main) {
            updateResults(users, startTime, completed)
        }
    }
}
```

* 在 `loadContributorsProgress()` 中，`updateResults()` 參數被宣告為 `suspend`。這是因為需要在對應的 Lambda 引數內部呼叫 `withContext`，而它是一個 `suspend` 函式。
* `updateResults()` 回呼接受一個額外的布林參數作為引數，用以指定載入是否已完成且結果是否為最終結果。

### 任務 6 {id="task-6"}

在 `Request6Progress.kt` 檔案中，實作顯示中繼進度的 `loadContributorsProgress()` 函式。將其基於 `Request4Suspend.kt` 中的 `loadContributorsSuspend()` 函式。

* 使用不含並行處理的簡單版本；稍後你將在下一節中加入並行。
* 中繼貢獻者清單應以「聚合（aggregated）」狀態顯示，而不僅僅是為每個儲存庫載入的使用者清單。
* 當載入每個新儲存庫的資料時，每位使用者的總貢獻次數應該遞增。

#### 任務 6 解決方案 {initial-collapse-state="collapsed" collapsible="true" id="solution-for-task-6"}

若要將載入的貢獻者中繼清單儲存在「聚合」狀態中，請定義一個儲存使用者清單的 `allUsers` 變數，然後在載入每個新儲存庫的貢獻者後對其進行更新：

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

#### 循序 vs 並行 {id="consecutive-vs-concurrent"}

在每個請求完成後，都會呼叫 `updateResults()` 回呼：

![請求進度](progress.png){width=700}

這段程式碼不包含並行處理。它是循序執行的，因此不需要同步。

最佳選項是並行發送請求，並在取得每個儲存庫的回應後更新中繼結果：

![並行請求](progress-and-concurrency.png){width=700}

若要加入並行性，請使用*通道（channels）*。

## 通道 {id="channels"}

撰寫帶有共享可變狀態的程式碼相當困難且容易出錯（就像使用回呼的解決方案一樣）。
更簡單的方法是透過通訊來共享資訊，而不是使用共享的可變狀態。
協同程式可以透過*通道*相互通訊。

通道是允許在協同程式之間傳遞資料的通訊原語。一個協同程式可以向通道*發送（send）*一些資訊，而另一個協同程式可以從中*接收（receive）*該資訊：

![使用通道](using-channel.png)

發送（產生）資訊的協同程式通常稱為生產者（producer），而接收（取用）資訊的協同程式稱為取用者（consumer）。一個或多個協同程式可以向同一個通道發送資訊，一個或多個協同程式也可以從中接收資料：

![在多個協同程式中使用通道](using-channel-many-coroutines.png)

當多個協同程式從同一個通道接收資訊時，每個元素只會由其中一個取用者處理一次。元素一旦被處理，就會立即從通道中移除。

你可以將通道視為類似於元素的集合，更精確地說是一個佇列，元素從一端加入並從另一端接收。但是有一個重要的區別：與集合（即使是其同步版本）不同，通道可以*掛起* `send()` 和 `receive()` 操作。這會在通道為空或已滿時發生。如果通道大小有上限，通道可能會變滿。

`Channel` 由三個不同的介面表示：`SendChannel`、`ReceiveChannel` 和 `Channel`，後者擴充了前兩者。通常你會建立一個通道並將其作為 `SendChannel` 執行個體提供給生產者，以便只有它們可以向通道發送資訊。
你將通道作為 `ReceiveChannel` 執行個體提供給取用者，以便只有它們可以從中接收。`send` 和 `receive` 方法都被宣告為 `suspend`：

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

生產者可以關閉通道以表明不會再有更多元素傳入。

程式庫中定義了幾種型別的通道。它們在內部可儲存多少元素以及 `send()` 呼叫是否可以掛起方面有所不同。
對於所有通道型別，`receive()` 呼叫的行為都是類似的：如果通道非空，它將接收一個元素；否則，它將被掛起。

<deflist collapsible="true">
   <def title="Unlimited 通道" id="unlimited-channel">
       <p>Unlimited 通道是佇列最接近的類比：生產者可以向此通道發送元素，它會無限增長。<code>send()</code> 呼叫永遠不會被掛起。
如果程式耗盡記憶體，你將會遇到 <code>OutOfMemoryException</code>。
Unlimited 通道與佇列的區別在於，當取用者嘗試從空通道接收時，它會被掛起，直到有新元素被發送。</p>
       <img src="unlimited-channel.png" alt="Unlimited channel" width="500"/>
   </def>
   <def title="Buffered 通道" id="buffered-channel">
       <p>Buffered 通道的大小受指定數量的限制。
生產者可以向此通道發送元素，直到達到大小限制為止。所有元素都儲存在內部。
當通道已滿時，對其進行的下一個 <code>send()</code> 呼叫會被掛起，直到有更多可用空間為止。</p>
       <img src="buffered-channel.png" alt="Buffered channel" width="500"/>
   </def>
   <def title="Rendezvous 通道" id="rendezvous-channel">
       <p>「Rendezvous」通道是一個沒有緩衝區的通道，等同於大小為零的 Buffered 通道。
其中一個函式（<code>send()</code> 或 <code>receive()</code>）總是會被掛起，直到另一個函式被呼叫為止。</p>
       <p>如果呼叫了 <code>send()</code> 函式，且沒有已掛起的 <code>receive()</code> 呼叫準備處理該元素，則 <code>send()</code> 會被掛起。同樣地，如果呼叫了 <code>receive()</code> 函式且通道為空，或者換句話說，沒有已掛起的 <code>send()</code> 呼叫準備發送元素，則 <code>receive()</code> 呼叫會被掛起。</p>
       <p>「rendezvous」名稱（意為「在約定時間和地點會面」）指的是 <code>send()</code> 和 <code>receive()</code> 應該「按時相遇」。</p>
       <img src="rendezvous-channel.png" alt="Rendezvous channel" width="500"/>
   </def>
   <def title="Conflated 通道" id="conflated-channel">
       <p>發送到 Conflated 通道的新元素將覆蓋先前發送的元素，因此接收者將始終只能取得最新的元素。<code>send()</code> 呼叫永遠不會被掛起。</p>
       <img src="conflated-channel.gif" alt="Conflated channel" width="500"/>
   </def>
</deflist>

建立通道時，請指定其型別或緩衝區大小（如果需要緩衝通道）：

```kotlin
val rendezvousChannel = Channel<String>()
val bufferedChannel = Channel<String>(10)
val conflatedChannel = Channel<String>(CONFLATED)
val unlimitedChannel = Channel<String>(UNLIMITED)
```

預設情況下會建立「Rendezvous」通道。

在接下來的任務中，你將建立一個「Rendezvous」通道、兩個生產者協同程式和一個取用者協同程式：

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

> 觀看[此影片](https://www.youtube.com/watch?v=HpWQUoVURWQ)以更深入了解通道。
>
{style="tip"}

### 任務 7 {id="task-7"}

在 `src/tasks/Request7Channels.kt` 中，實作 `loadContributorsChannels()` 函式，該函式並行請求所有 GitHub 貢獻者，同時顯示中繼進度。

使用先前的函式，即來自 `Request5Concurrent.kt` 的 `loadContributorsConcurrent()` 和來自 `Request6Progress.kt` 的 `loadContributorsProgress()`。

#### 任務 7 提示 {initial-collapse-state="collapsed" collapsible="true" id="tip-for-task-7"}

並行接收不同儲存庫貢獻者清單的不同協同程式可以將所有接收到的結果發送到同一個通道：

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

然後可以逐一從該通道接收元素並進行處理：

```kotlin
repeat(repos.size) {
    val users = channel.receive()
    // ...
}
```

由於 `receive()` 呼叫是循序進行的，因此不需要額外的同步。

#### 任務 7 解決方案 {initial-collapse-state="collapsed" collapsible="true" id="solution-for-task-7"}

與 `loadContributorsProgress()` 函式一樣，你可以建立一個 `allUsers` 變數來儲存「所有貢獻者」清單的中繼狀態。
從通道接收到的每個新清單都會加入到所有使用者的清單中。你聚合結果並使用 `updateResults` 回呼更新狀態：

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

* 不同儲存庫的結果在準備好後會立即加入到通道中。起初，當所有請求均已發送但尚未收到資料時，`receive()` 呼叫會被掛起。在這種情況下，整個「載入貢獻者」協同程式都會被掛起。
* 隨後，當使用者清單被發送到通道時，「載入貢獻者」協同程式會恢復，`receive()` 呼叫會回傳此清單，並立即更新結果。

現在你可以執行程式並選擇 _CHANNELS_ 選項來載入貢獻者並查看結果。

儘管協同程式和通道都無法完全消除並行帶來的複雜性，但當你需要理解當前狀況時，它們確實讓事情變得更加輕鬆。

## 測試協同程式 {id="testing-coroutines"}

現在讓我們測試所有解決方案，以驗證並行協同程式的方案是否快於使用 `suspend` 函式的方案，並驗證使用通道的方案是否快於簡單的「progress」方案。

在以下任務中，你將比較各解決方案的總執行時間。你將模擬（Mock）GitHub 服務，並使此服務在給定的逾時後回傳結果：

```text
repos 請求 - 在 1000 ms 延遲內回傳答案
repo-1 - 1000 ms 延遲
repo-2 - 1200 ms 延遲
repo-3 - 800 ms 延遲
```

使用 `suspend` 函式的循序解決方案應該耗時約 4000 ms（4000 = 1000 + (1000 + 1200 + 800)）。
並行解決方案應該耗時約 2200 ms（2200 = 1000 + max(1000, 1200, 800)）。

對於顯示進度的解決方案，你還可以檢查帶有時間戳記的中繼結果。

相應的測試資料定義在 `test/contributors/testData.kt` 中，而 `Request4SuspendKtTest`、`Request7ChannelsKtTest` 等檔案包含了使用模擬服務呼叫的直接測試。

然而，這裡存在兩個問題：

* 這些測試執行時間過長。每個測試大約需要 2 到 4 秒，每次都需要等待結果。這不是很有效率。
* 你無法依賴解決方案執行的精確時間，因為準備和執行程式碼仍需要額外的時間。你可以加入一個常數，但隨後時間在不同電腦上會有所不同。模擬服務延遲應高於此常數，以便你能看出差異。如果常數為 0.5 秒，那麼將延遲設為 0.1 秒將是不夠的。

更好的方法是使用專門的架構在多次執行相同程式碼的同時測試時間（這會使總時間進一步增加），但這在學習和設定上都很複雜。

為了解決這些問題並確保帶有指定測試延遲的解決方案能如預期運作（一個快於另一個），可以使用帶有特殊測試分派器的*虛擬*時間。此分派器會追蹤從開始經過的虛擬時間，並在真實時間中立即執行所有內容。當你在這個分派器上執行協同程式時，`delay` 將立即回傳並推進虛擬時間。

使用這種機制的測試執行速度很快，但你仍然可以檢查在虛擬時間的不同時刻發生了什麼。總執行時間大幅縮短：

![總執行時間比較](time-comparison.png){width=700}

若要使用虛擬時間，請將 `runBlocking` 叫用替換為 `runTest`。`runTest` 接受對 `TestScope` 的擴充 Lambda 作為引數。
當你在此特殊作用域內的 `suspend` 函式中呼叫 `delay` 時，`delay` 會增加虛擬時間，而不是在真實時間中進行延遲：

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
    delay(1000)    // auto-advances without delay
    println("foo") // executes eagerly when foo() is called
}
```

你可以使用 `TestScope` 的 `currentTime` 屬性檢查當前的虛擬時間。

在此範例中，實際執行時間為數毫秒，而虛擬時間等於延遲引數，即 1000 毫秒。

若要在子協同程式中獲得「虛擬」`delay` 的完整效果，請使用 `TestDispatcher` 啟動所有子協同程式。否則它將無法運作。除非你提供不同的分派器，否則此分派器會自動從其他 `TestScope` 繼承：

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
        delay(1000)    // auto-advances without delay
        println("bar") // executes eagerly when bar() is called
    }
}
```

如果在上面的範例中於 `Dispatchers.Default` 上下文中呼叫 `launch`，測試將會失敗。你將會收到一個例外，指出該任務尚未完成。

僅當 `loadContributorsConcurrent()` 函式使用繼承的上下文啟動子協同程式，且未透過 `Dispatchers.Default` 分派器對其進行修改時，才能以此方式對其進行測試。

你可以在*呼叫*函式時而非*定義*函式時指定分派器等上下文元素，這樣能帶來更大的彈性並使測試更加容易。

> 支援虛擬時間的測試 API 處於[實驗性階段](components-stability.md)，未來可能會有所改變。
>
{style="warning"}

預設情況下，如果你使用實驗性測試 API，編譯器會顯示警告。若要隱藏這些警告，請使用 `@OptIn(ExperimentalCoroutinesApi::class)` 為測試函式或包含測試的整個類別加上註解。加入編譯器引數，指示編譯器你正在使用實驗性 API：

```kotlin
compileTestKotlin {
    kotlinOptions {
        freeCompilerArgs += "-Xuse-experimental=kotlin.Experimental"
    }
}
```

在本教學對應的專案中，該編譯器引數已新增至 Gradle 指令碼中。

### 任務 8 {id="task-8"}

重構 `tests/tasks/` 中的以下測試以使用虛擬時間代替真實時間：

* `Request4SuspendKtTest.kt`
* `Request5ConcurrentKtTest.kt`
* `Request6ProgressKtTest.kt`
* `Request7ChannelsKtTest.kt`

比較套用重構前後的總執行時間。

#### 任務 8 提示 {initial-collapse-state="collapsed" collapsible="true" id="tip-for-task-8"}

1. 將 `runBlocking` 叫用替換為 `runTest`，並將 `System.currentTimeMillis()` 替換為 `currentTime`：

    ```kotlin
    @Test
    fun test() = runTest {
        val startTime = currentTime
        // action
        val totalTime = currentTime - startTime
        // testing result
    }
    ```

2. 取消註解用於檢查精確虛擬時間的斷言。
3. 別忘了新增 `@UseExperimental(ExperimentalCoroutinesApi::class)`。

#### 任務 8 解決方案 {initial-collapse-state="collapsed" collapsible="true" id="solution-for-task-8"}

以下是並行和通道情況的解決方案：

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

首先，檢查結果是否剛好在預期的虛擬時間可用，然後檢查結果本身：

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

使用通道的最後一個版本，其第一個中繼結果比進度版本更早可用，你可以在使用虛擬時間的測試中看到這種差異。

> 其餘「suspend」和「progress」任務的測試非常相似——你可以在專案的 `solutions` 分支中找到它們。
>
{style="tip"}

## 後續步驟 {id="what-s-next"}

* 參考 KotlinConf 上的 [Asynchronous Programming with Kotlin](https://kotlinconf.com/workshops/) 工作坊。
* 進一步了解如何使用[虛擬時間和實驗性測試套件](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-test/)。