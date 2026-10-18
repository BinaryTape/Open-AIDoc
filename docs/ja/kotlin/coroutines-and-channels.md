<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: コルーチンとチャネル − チュートリアル)

> 今後のアップデートでこのチュートリアルは改訂される予定です。それまでの間、コルーチンを始めるための最新のガイドについては、[コルーチンの基礎](coroutines-basics.md)を参照してください。
> 
{style="note"}

このチュートリアルでは、IntelliJ IDEA でコルーチンを使用して、基盤底のプロセッサスレッドをブロックしたりコールバックを使ったりすることなくネットワークリクエストを実行する方法を学びます。

> コルーチンの事前知識は必要ありませんが、基本的な Kotlin の構文に慣れていることが前提となります。
>
{style="tip"}

以下について学習します：

* なぜ、どのようにサスペンド関数（suspending functions）を使用してネットワークリクエストを実行するのか。
* コルーチンを使用してリクエストを並行して送信する方法。
* チャネル（channels）を使用して異なるコルーチン間で情報を共有する方法。

ネットワークリクエストには [Retrofit](https://lysine.dev/retrofit/) ライブラリが必要ですが、このチュートリアルで紹介する手法は、コルーチンをサポートする他のライブラリでも同様に機能します。

> すべてのタスクの解答は、[プロジェクトのリポジトリ](http://github.com/kotlin-hands-on/intro-coroutines)の `solutions` ブランチにあります。
>
{style="tip"}

## 始める前に {id="before-you-start"}

1. 最新バージョンの [IntelliJ IDEA](https://www.jetbrains.com/idea/download/index.html) をダウンロードしてインストールします。
2. ウェルカム画面で **Get from VCS** を選択するか、**File | New | Project from Version Control** を選択して、[プロジェクトテンプレート](http://github.com/kotlin-hands-on/intro-coroutines)をクローンします。

   コマンドラインからクローンすることもできます：

   ```Bash
   git clone https://github.com/kotlin-hands-on/intro-coroutines
   ```

### GitHub 開発者トークンの生成 {id="generate-a-github-developer-token"}

プロジェクトでは GitHub API を使用します。アクセス権を取得するには、GitHub のアカウント名と、パスワードまたはトークンのいずれかを指定します。2要素認証を有効にしている場合は、トークンのみで十分です。

[ご自身のアカウント](https://github.com/settings/tokens/new)で GitHub API を使用するための新しい GitHub トークンを生成します：

1. トークンの名前を指定します（例：`coroutines-tutorial`）：

   ![新しい GitHub トークンの生成](generating-token.png){width=700}

2. スコープ（scopes）は一切選択しないでください。ページ下部の **Generate token** をクリックします。
3. 生成されたトークンをコピーします。

### コードの実行 {id="run-the-code"}

このプログラムは、指定された組織（デフォルトでは "kotlin"）配下にあるすべてのリポジトリのコントリビューターを読み込みます。後ほど、コントリビューション数でユーザーをソートするロジックを追加します。

1. `src/contributors/main.kt` ファイルを開き、`main()` 関数を実行します。次のようなウィンドウが表示されます：

   ![最初のウィンドウ](initial-window.png){width=500}

   フォントが小さすぎる場合は、`main()` 関数の `setDefaultFontSize(18f)` の値を変更して調整してください。

2. 対応するフィールドに GitHub のユーザー名とトークン（またはパスワード）を入力します。
3. _Variant_ ドロップダウンメニューで _BLOCKING_ オプションが選択されていることを確認します。
4. _Load contributors_ をクリックします。UI がしばらくフリーズした後に、コントリビューターのリストが表示されるはずです。
5. プログラムの出力を開き、データが読み込まれたことを確認します。リクエストが成功するたびに、コントリビューターのリストがログ出力されます。

このロジックを実装するには、[ブロッキングリクエスト](#blocking-requests)を使用する方法や、[コールバック](#callbacks)を使用する方法など、いくつかの方法があります。これらの解決策を[コルーチン](#coroutines)を使用するものと比較し、異なるコルーチン間で情報を共有するために[チャネル](#channels)をどのように使用できるかを見ていきます。

## ブロッキングリクエスト {id="blocking-requests"}

GitHub への HTTP リクエストを実行するために [Retrofit](https://lysine.dev/retrofit/) ライブラリを使用します。これにより、指定された組織配下のリポジトリのリストと、各リポジトリのコントリビューターのリストをリクエストできます：

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

この API は、指定された組織のコントリビューターリストを取得するために `loadContributorsBlocking()` 関数によって使用されます。

1. 実装を確認するために `src/tasks/Request1Blocking.kt` を開きます：

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

    * まず、指定された組織配下のリポジトリのリストを取得して `repos` リストに格納します。その後、各リポジトリについてコントリビューターのリストをリクエストし、すべてのリストをマージして最終的なコントリビューターのリストを作成します。
    * `getOrgReposCall()` と `getRepoContributorsCall()` は両方とも `*Call` クラスのインスタンスを返します（`#1`）。この時点では、リクエストは送信されません。
    * その後、リクエストを実行するために `*Call.execute()` が呼び出されます（`#2`）。`execute()` は基盤となるスレッドをブロックする同期呼び出しです。
    * レスポンスを取得すると、専用の `logRepos()` および `logUsers()` 関数を呼び出して結果がログに記録されます（`#3`）。HTTP レスポンスにエラーが含まれている場合、そのエラーはここでログに記録されます。
    * 最後に、必要なデータを含むレスポンスのボディを取得します。このチュートリアルでは、エラーが発生した場合の結果として空のリストを使用し、対応するエラーをログに記録します（`#4`）。

2. `.body() ?: emptyList()` の繰り返しを避けるために、拡張関数 `bodyList()` が宣言されています：

    ```kotlin
    fun <T> Response<List<T>>.bodyList(): List<T> {
        return body() ?: emptyList()
    }
    ```  

3. プログラムを再度実行し、IntelliJ IDEA のシステム出力を確認します。次のようになっているはずです：

    ```text
    1770 [AWT-EventQueue-0] INFO  Contributors - kotlin: loaded 40 repos
    2025 [AWT-EventQueue-0] INFO  Contributors - kotlin-examples: loaded 23 contributors
    2229 [AWT-EventQueue-0] INFO  Contributors - kotlin-koans: loaded 45 contributors
    ...
    ```

    * 各行の最初の項目はプログラム開始からの経過ミリ秒数で、角括弧内はスレッド名です。どこのスレッドからロードリクエストが呼び出されたかを確認できます。
    * 各行の最後の項目は実際のメッセージで、読み込まれたリポジトリやコントリビューターの数を示しています。

    このログ出力は、すべての結果がメインスレッドからログ出力されたことを示しています。_BLOCKING_ オプションでコードを実行すると、読み込みが完了するまでウィンドウがフリーズし、入力に反応しなくなります。すべてのリクエストは `loadContributorsBlocking()` を呼び出したのと同じスレッド、つまりメイン UI スレッド（Swing では AWT イベントディスパッチスレッド）から実行されます。このメインスレッドがブロックされるため、UI がフリーズするのです：

    ![ブロックされたメインスレッド](blocking.png){width=700}
    
    コントリビューターのリストが読み込まれた後、結果が更新されます。

4. `src/contributors/Contributors.kt` で、コントリビューターの読み込み方法を選択する役割を持つ `loadContributors()` 関数を見つけ、`loadContributorsBlocking()` がどのように呼び出されているかを確認します：

    ```kotlin
    when (getSelectedVariant()) {
        BLOCKING -> { // UI スレッドをブロック
            val users = loadContributorsBlocking(service, req)
            updateResults(users, startTime)
        }
    }
    ```

    * `updateResults()` の呼び出しは、`loadContributorsBlocking()` の呼び出しの直後に配置されています。
    * `updateResults()` は UI を更新するため、常に UI スレッドから呼び出されなければなりません。
    * `loadContributorsBlocking()` も UI スレッドから呼び出されるため、UI スレッドがブロックされて UI がフリーズします。

### タスク 1 {id="task-1"}

最初のタスクは、問題領域（ドメイン）に慣れるためのものです。現在、各コントリビューターの名前は、参加したプロジェクトごとに1回ずつ、複数回繰り返されています。各コントリビューターが1回だけ追加されるようにユーザーを結合する `aggregate()` 関数を実装してください。`User.contributions` プロパティには、指定されたユーザーの「すべての」プロジェクトに対するコントリビューションの合計数が含まれる必要があります。結果のリストは、コントリビューション数の降順でソートされている必要があります。

`src/tasks/Aggregation.kt` を開き、`List<User>.aggregate()` 関数を実装してください。ユーザーは総コントリビューション数でソートされる必要があります。

対応するテストファイル `test/tasks/AggregationKtTest.kt` に、期待される結果の例が示されています。

> [IntelliJ IDEA のショートカット](https://www.jetbrains.com/help/idea/create-tests.html#test-code-navigation) `Ctrl+Shift+T` / `⇧ ⌘ T` を使用して、ソースコードとテストクラス間を自動的に行き来できます。
>
{style="tip"}

このタスクを実装した後、"kotlin" 組織の結果リストは次のようになります：

![“kotlin” 組織のリスト](aggregate.png){width=500}

#### タスク 1 の解答 {initial-collapse-state="collapsed" collapsible="true" id="solution-for-task-1"}

1. ユーザーをログイン名でグループ化するには、[`groupBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/group-by.html) を使用します。これにより、ログイン名から、異なるリポジトリにおけるそのログイン名を持つユーザーのすべての出現へのマップが返されます。
2. マップのエントリごとに、各ユーザーのコントリビューションの合計数をカウントし、指定された名前とコントリビューション合計を持つ `User` クラスの新しいインスタンスを作成します。
3. 結果のリストを降順にソートします：

    ```kotlin
    fun List<User>.aggregate(): List<User> =
        groupBy { it.login }
            .map { (login, group) -> User(login, group.sumOf { it.contributions }) }
            .sortedByDescending { it.contributions }
    ```

代替案として、`groupBy()` の代わりに [`groupingBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/grouping-by.html) 関数を使用することもできます。

## コールバック {id="callbacks"}

前の解決策は機能しますが、スレッドをブロックするため UI がフリーズしてしまいます。これを回避するための従来のアプローチは、*コールバック*（callbacks）を使用することです。

操作が完了した直後に呼び出されるべきコードをその場で呼ぶ代わりに、別のコールバック（多くはラムダ式）として抽出し、後で呼び出してもらうためにそのラムダを呼び出し元に渡すことができます。

UI の応答性を保つには、計算全体を別のスレッドに移動するか、ブロッキング呼び出しの代わりにコールバックを使用する Retrofit API に切り替えることができます。

### バックグラウンドスレッドの使用 {id="use-a-background-thread"}

1. `src/tasks/Request2Background.kt` を開き、その実装を確認します。まず、計算全体が別のスレッドに移動されます。`thread()` 関数は新しいスレッドを開始します：

    ```kotlin
    thread {
        loadContributorsBlocking(service, req)
    }
    ```

    読み込み処理全体が別のスレッドに移動されたため、メインスレッドは解放され、他のタスクに使用できるようになります：

    ![解放されたメインスレッド](background.png){width=700}

2. `loadContributorsBackground()` 関数のシグネチャが変更されます。すべての読み込みが完了した後に呼び出すために、最後の引数として `updateResults()` コールバックを受け取ります：

    ```kotlin
    fun loadContributorsBackground(
        service: GitHubService, req: RequestData,
        updateResults: (List<User>) -> Unit
    )
    ```

3. `loadContributorsBackground()` が呼び出されると、`updateResults()` の呼び出しは以前のように直後ではなく、コールバック内で行われるようになります：

    ```kotlin
    loadContributorsBackground(service, req) { users ->
        SwingUtilities.invokeLater {
            updateResults(users, startTime)
        }
    }
    ```

    `SwingUtilities.invokeLater` を呼び出すことで、結果を更新する `updateResults()` の呼び出しがメイン UI スレッド（AWT イベントディスパッチスレッド）で実行されるようになります。

ただし、`BACKGROUND` オプションを使用してコントリビューターを読み込もうとすると、リストは更新されるものの、UI には何も変化がないことがわかります。

### タスク 2 {id="task-2"}

結果のリストが UI に表示されるように、`src/tasks/Request2Background.kt` の `loadContributorsBackground()` 関数を修正してください。

#### タスク 2 の解答 {initial-collapse-state="collapsed" collapsible="true" id="solution-for-task-2"}

コントリビューターを読み込もうとすると、ログ上ではコントリビューターが読み込まれているものの、結果が表示されないことが確認できます。これを修正するには、結果として得られたユーザーのリストに対して `updateResults()` を呼び出します：

```kotlin
thread {
    updateResults(loadContributorsBlocking(service, req))
}
```

コールバックに渡されたロジックを明示的に呼び出していることを確認してください。そうしないと、何も起こりません。

### Retrofit コールバック API の使用 {id="use-the-retrofit-callback-api"}

前の解決策では、読み込みロジック全体がバックグラウンドスレッドに移動されましたが、それでもリソースの最適な使用法とは言えません。すべての読み込みリクエストが順次実行され、読み込み結果を待つ間スレッドがブロックされてしまいます。その間、スレッドは他のタスクに使用できたはずです。具体的には、全体の結果をより早く受け取るために、スレッドは別のリクエストの読み込みを開始できたはずです。

各リポジトリのデータの処理は、読み込みと、結果のレスポンスの処理という2つの部分に分割されるべきです。2番目の「処理」部分はコールバックに抽出する必要があります。

そうすることで、前のリポジトリの結果を受け取る（そして対応するコールバックが呼び出される）前に、各リポジトリの読み込みを開始できます：

![コールバック API の使用](callbacks.png){width=700}

Retrofit のコールバック API がこれを実現するのに役立ちます。`Call.enqueue()` 関数は HTTP リクエストを開始し、引数としてコールバックを受け取ります。このコールバック内で、各リクエストの後に何を行う必要があるかを指定します。

`src/tasks/Request3Callbacks.kt` を開き、この API を使用する `loadContributorsCallbacks()` の実装を確認します：

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

* 便宜上、このコードフラグメントは同じファイルで宣言されている `onResponse()` 拡張関数を使用しています。これはオブジェクト式の代わりにラムダを引数として取ります。
* レスポンスを処理するロジックはコールバックに抽出されています。対応するラムダは `#1` 行目と `#2` 行目から始まります。

しかし、提供された解決策は機能しません。プログラムを実行し、_CALLBACKS_ オプションを選択してコントリビューターを読み込むと、何も表示されないことがわかります。しかし、`Request3CallbacksKtTest` のテストは、即座に成功（パス）したという結果を返します。

なぜ提示されたコードが期待通りに動作しないのかを考え、修正を試みるか、以下の解答を参照してください。

### タスク 3（任意） {id="task-3-optional"}

読み込まれたコントリビューターのリストが表示されるように、`src/tasks/Request3Callbacks.kt` ファイルのコードを書き直してください。

#### タスク 3 の試み 1 {initial-collapse-state="collapsed" collapsible="true" id="the-first-attempted-solution-for-task-3"}

現在の実装では、多くのリクエストが並行して開始されるため、全体の読み込み時間が短縮されます。しかし、結果は読み込まれません。これは、すべての読み込みリクエストが開始された直後、`allUsers` リストにデータが入力される前に `updateResults()` コールバックが呼び出されてしまうためです。

次のような変更でこれを修正しようと試みることができます：

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

* まず、インデックス付きでリポジトリのリストを反復処理します（`#1`）。
* 次に、各コールバックから、それが最後のイテレーションであるかどうかを確認します（`#2`）。
* そして、もしそうであれば、結果が更新されます。

しかし、このコードでも目的を達成することはできません。自分で答えを見つけるか、以下の解決策を参照してください。

#### タスク 3 の試み 2 {initial-collapse-state="collapsed" collapsible="true" id="the-second-attempted-solution-for-task-3"}

読み込みリクエストは並行して開始されるため、最後のリクエストの結果が最後に届くという保証はありません。結果は順不同で届く可能性があります。

したがって、完了条件として現在のインデックスを `lastIndex` と比較すると、一部のリポジトリの結果が失われるリスクがあります。

最後のリポジトリを処理するリクエストが一部の先行するリクエストよりも早く返ってきた場合（これは十分起こり得ます）、より時間がかかるリクエストのすべての結果が失われてしまいます。

これを修正する1つの方法は、インデックスを導入し、すべてのリポジトリがすでに処理されたかどうかを確認することです：

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

このコードでは、同期化されたバージョンのリストと `AtomicInteger()` を使用しています。一般に、`getRepoContributors()` リクエストを処理する異なるコールバックが常に同じスレッドから呼び出されるという保証はないためです。

#### タスク 3 の試み 3 {initial-collapse-state="collapsed" collapsible="true" id="the-third-attempted-solution-for-task-3"}

さらに優れた解決策は、`CountDownLatch` クラスを使用することです。これはリポジトリの数で初期化されたカウンターを保持します。このカウンターは、各リポジトリを処理した後にデクリメントされます。そして、ラッチがゼロにカウントダウンされるまで待機してから、結果を更新します：

```kotlin
val countDownLatch = CountDownLatch(repos.size)
for (repo in repos) {
    service.getRepoContributorsCall(req.org, repo.name)
        .onResponse { responseUsers ->
            // リポジトリの処理
            countDownLatch.countDown()
        }
}
countDownLatch.await()
updateResults(allUsers.aggregate())
```

その後、結果はメインスレッドから更新されます。これは、子スレッドにロジックを委任するよりも直接的です。

これら3つの解決策の試みを確認すると、コールバックを使用して正しいコードを書くことは容易ではなく、特に複数の基礎スレッドと同期が発生する場合にはエラーが発生しやすいことがわかります。

> 追加の演習として、RxJava ライブラリを使用したリアクティブなアプローチで同じロジックを実装することもできます。RxJava を使用するために必要なすべての依存関係と解決策は、別の `rx` ブランチにあります。このチュートリアルを完了した後に、適切な比較のために提案された Rx バージョンを実装または確認することもできます。
>
{style="tip"}

## サスペンド関数 {id="suspending-functions"}

サスペンド関数（suspending functions）を使用して同じロジックを実装できます。`Call<List<Repo>>` を返す代わりに、API 呼び出しを以下のように [サスペンド関数](composing-suspending-functions.md) として定義します：

```kotlin
interface GitHubService {
    @GET("orgs/{org}/repos?per_page=100")
    suspend fun getOrgRepos(
        @Path("org") org: String
    ): List<Repo>
}
```

* `getOrgRepos()` は `suspend` 関数として定義されています。リクエストを実行するためにサスペンド関数を使用する場合、基盤となるスレッドはブロックされません。これがどのように機能するかについての詳細は、後のセクションで説明します。
* `getOrgRepos()` は `Call` を返す代わりに直接結果を返します。結果が失敗した場合は、例外がスローされます。

あるいは、Retrofit では結果を `Response` でラップして返すこともできます。この場合、結果のボディが提供され、手動でエラーをチェックすることが可能です。このチュートリアルでは `Response` を返すバージョンを使用します。

`src/contributors/GitHubService.kt` で、`GitHubService` インターフェースに以下の宣言を追加します：

```kotlin
interface GitHubService {
    // getOrgReposCall & getRepoContributorsCall の宣言

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

### タスク 4 {id="task-4"}

あなたのタスクは、2つの新しいサスペンド関数 `getOrgRepos()` と `getRepoContributors()` を利用するようにコントリビューターを読み込む関数のコードを変更することです。新しい `loadContributorsSuspend()` 関数は、新しい API を使用するために `suspend` としてマークされます。

> サスペンド関数はどこからでも呼び出せるわけではありません。`loadContributorsBlocking()` からサスペンド関数を呼び出すと、"Suspend function 'getOrgRepos' should be called only from a coroutine or another suspend function"（サスペンド関数 'getOrgRepos' は、コルーチンまたは別のサスペンド関数からのみ呼び出される必要があります）というメッセージのエラーが発生します。
>
{style="note"}

1. `src/tasks/Request1Blocking.kt` で定義されている `loadContributorsBlocking()` の実装を、`src/tasks/Request4Suspend.kt` で定義されている `loadContributorsSuspend()` にコピーします。
2. `Call` を返す関数の代わりに、新しいサスペンド関数が使用されるようにコードを変更します。
3. _SUSPEND_ オプションを選択してプログラムを実行し、GitHub リクエストの実行中も UI の応答性が維持されていることを確認します。

#### タスク 4 の解答 {initial-collapse-state="collapsed" collapsible="true" id="solution-for-task-4"}

`.getOrgReposCall(req.org).execute()` を `.getOrgRepos(req.org)` に置き換え、2番目の "contributors" リクエストに対しても同様の置き換えを繰り返します：

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

* `loadContributorsSuspend()` は `suspend` 関数として定義する必要があります。
* API 関数が直接 `Response` を返すようになったため、以前 `Response` を返していた `execute` を呼び出す必要はなくなりました。なお、この詳細は Retrofit ライブラリ特有のものです。他のライブラリでは API が異なる場合がありますが、概念は同じです。

## コルーチン {id="coroutines"}

サスペンド関数を使用したコードは、「ブロッキング」バージョンと似ています。ブロッキングバージョンとの大きな違いは、スレッドをブロックする代わりに、コルーチンが中断（サスペンド）されることです：

```text
block（ブロック） -> suspend（中断/サスペンド）
thread（スレッド） -> coroutine（コルーチン）
```

> スレッド上でコードを実行するのと同様にコルーチン上でコードを実行できるため、コルーチンはしばしば軽量スレッド（lightweight threads）と呼ばれます。以前はブロックしていた（そして回避しなければならなかった）操作が、代わりにコルーチンをサスペンドできるようになります。
>
{style="note"}

### 新しいコルーチンの開始 {id="starting-a-new-coroutine"}

`src/contributors/Contributors.kt` で `loadContributorsSuspend()` がどのように使用されているかを確認すると、`launch` 内で呼び出されていることがわかります。`launch` はラムダを引数として取るライブラリ関数です：

```kotlin
launch {
    val users = loadContributorsSuspend(req)
    updateResults(users, startTime)
}
```

ここで `launch` は、データの読み込みと結果の表示を担当する新しい計算を開始します。この計算はサスペンド可能です。ネットワークリクエストを実行する際、計算はサスペンドされ、基盤となるスレッドを解放します。ネットワークリクエストが結果を返すと、計算が再開（レジューム）されます。

このようなサスペンド可能な計算を *コルーチン* と呼びます。したがって、この場合 `launch` は、データの読み込みと結果の表示を担当する *新しいコルーチンを開始* します。

コルーチンはスレッド上で実行され、サスペンドすることができます。コルーチンがサスペンドされると、対応する計算は一時停止され、スレッドから外されてメモリに格納されます。その間、スレッドは他のタスクに自由に使用できます：

![コルーチンのサスペンド](suspension-process.gif){width=700}

計算を継続する準備ができると、スレッド（必ずしも同じスレッドとは限りません）に戻されます。

`loadContributorsSuspend()` の例では、各 "contributors" リクエストはサスペンドの仕組みを使用して結果を待つようになりました。まず新しいリクエストが送信されます。その後、レスポンスを待つ間、`launch` 関数によって開始された「コントリビューター読み込み」コルーチン全体がサスペンドされます。

コルーチンは、対応するレスポンスを受信した後にのみ再開されます：

![リクエストのサスペンド](suspend-requests.png){width=700}

レスポンスの受信を待っている間、スレッドは他のタスクに自由に使用できます。すべてのリクエストがメイン UI スレッドで行われているにもかかわらず、UI の応答性は維持されます：

1. _SUSPEND_ オプションを使用してプログラムを実行します。ログにより、すべてのリクエストがメイン UI スレッドから送信されていることが確認できます：

    ```text
    2538 [AWT-EventQueue-0 @coroutine#1] INFO  Contributors - kotlin: loaded 30 repos
    2729 [AWT-EventQueue-0 @coroutine#1] INFO  Contributors - ts2kt: loaded 11 contributors
    3029 [AWT-EventQueue-0 @coroutine#1] INFO  Contributors - kotlin-koans: loaded 45 contributors
    ...
    11252 [AWT-EventQueue-0 @coroutine#1] INFO  Contributors - kotlin-coroutines-workshop: loaded 1 contributors
    ```

2. ログには、対応するコードがどのコルーチンで実行されているかを表示できます。これを有効にするには、**Run | Edit configurations** を開き、`-Dkotlinx.coroutines.debug` VM オプションを追加します：

   ![実行構成の編集](run-configuration.png){width=500}

   このオプションを指定して `main()` を実行すると、スレッド名にコルーチン名が付加されます。すべての Kotlin ファイルを実行するためのテンプレートを変更し、このオプションをデフォルトで有効にすることもできます。

現在、すべてのコードは単一のコルーチン、すなわち `@coroutine#1` として示されている上述の「コントリビューター読み込み」コルーチン上で実行されています。コードが順次実行されるように記述されているため、結果を待つ間に別のリクエストを送信するためにスレッドを再利用することはありません。新しいリクエストは、前の結果が受信された後にのみ送信されます。

サスペンド関数はスレッドを公平に扱い、「待機」のためにブロックすることはありません。ただし、これによってコードに並行性（concurrency）がもたらされたわけではありません。

## 並行性（Concurrency） {id="concurrency"}

Kotlin のコルーチンは、スレッドに比べてはるかにリソース消費が少ないです。非同期に新しい計算を開始したいときはいつでも、代わりに新しいコルーチンを作成できます。

新しいコルーチンを開始するには、主要な *コルーチンビルダー* のいずれかを使用します：`launch`、`async`、または `runBlocking` です。異なるライブラリによって、追加のコルーチンビルダーが定義されている場合もあります。

`async` は新しいコルーチンを開始し、`Deferred` オブジェクトを返します。`Deferred` は、`Future` や `Promise` などの別名で知られる概念を表します。これは計算を保持しますが、最終的な結果を得る瞬間を *遅延*（defer）させ、*将来*（future）のある時点で結果を提供することを *約束*（promise）します。

`async` と `launch` の主な違いは、`launch` が特定の結果を返すことを期待しない計算を開始するために使用される点です。`launch` はコルーチンを表す `Job` を返します。`Job.join()` を呼び出すことで、それが完了するまで待機することが可能です。

`Deferred` は `Job` を拡張するジェネリック型です。ラムダが何を返すかに応じて、`async` 呼び出しは `Deferred<Int>` や `Deferred<CustomType>` を返すことができます（ラムダ内の最後の式が結果となります）。

コルーチンの結果を取得するには、`Deferred` インスタンスに対して `await()` を呼び出すことができます。結果を待つ間、この `await()` が呼び出されたコルーチンはサスペンドされます：

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

`runBlocking` は、通常の関数とサスペンド関数、あるいはブロッキングとノンブロッキングの世界の間の架け橋として使用されます。これは、トップレベルのメインコルーチンを開始するためのアダプターとして機能します。主に `main()` 関数やテストで使用されることを意図しています。

> コルーチンの理解を深めるには、[こちらの動画](https://www.youtube.com/watch?v=zEZc5AmHQhk)をご覧ください。
>
{style="tip"}

遅延オブジェクト（deferred objects）のリストがある場合は、`awaitAll()` を呼び出してそれらすべての結果を待つことができます：

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

各 "contributors" リクエストが新しいコルーチンで開始されると、すべてのリクエストが非同期に開始されます。前のリクエストの結果を受信する前に、新しいリクエストを送信できます：

![並行コルーチン](concurrency.png){width=700}

全体の読み込み時間は _CALLBACKS_ バージョンとほぼ同じですが、コールバックを必要としません。さらに、`async` はコード内のどの部分が並行して実行されるかを明確に強調します。

### タスク 5 {id="task-5"}

`Request5Concurrent.kt` ファイルで、以前の `loadContributorsSuspend()` 関数を利用して `loadContributorsConcurrent()` 関数を実装してください。

#### タスク 5 のヒント {initial-collapse-state="collapsed" collapsible="true" id="tip-for-task-5"}

新しいコルーチンは、コルーチンスコープ内でのみ開始できます。`loadContributorsSuspend()` の内容を `coroutineScope` の呼び出し内にコピーし、そこで `async` 関数を呼び出せるようにします：

```kotlin
suspend fun loadContributorsConcurrent(
    service: GitHubService,
    req: RequestData
): List<User> = coroutineScope {
    // ...
}
```

以下の構成に基づいてソリューションを作成してください：

```kotlin
val deferreds: List<Deferred<List<User>>> = repos.map { repo ->
    async {
        // 各リポジトリのコントリビューターを読み込む
    }
}
deferreds.awaitAll() // List<List<User>>
```

#### タスク 5 の解答 {initial-collapse-state="collapsed" collapsible="true" id="solution-for-task-5"}

各 "contributors" リクエストを `async` でラップして、リポジトリと同じ数のコルーチンを作成します。`async` は `Deferred<List<User>>` を返します。新しいコルーチンの作成はリソースをあまり消費しないため、必要なだけ作成しても問題ありません。

1. `map` の結果がリストのリストではなく `Deferred` オブジェクトのリストになったため、`flatMap` は使用できなくなります。`awaitAll()` は `List<List<User>>` を返すため、`flatten().aggregate()` を呼び出して結果を取得します：

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

2. コードを実行してログを確認します。マルチスレッドはまだ採用されていないため、すべてのコルーチンは引き続きメイン UI スレッド上で実行されますが、コルーチンを並行して実行する利点をすでに確認できます。
3. 共有スレッドプールの異なるスレッドで "contributors" コルーチンを実行するようにこのコードを変更するには、`async` 関数のコンテキスト引数として `Dispatchers.Default` を指定します：

    ```kotlin
    async(Dispatchers.Default) { }
    ```

    * `CoroutineDispatcher` は、対応するコルーチンを実行するスレッドを決定します。引数として指定しない場合、`async` は外部スコープのディスパッチャを使用します。
    * `Dispatchers.Default` は、JVM 上の共有スレッドプールを表します。このプールは並列実行の手段を提供します。利用可能な CPU コア数と同じ数のスレッドで構成されますが、コアが1つしかない場合でも2つのスレッドを持ちます。

4. `loadContributorsConcurrent()` 関数のコードを変更して、共有スレッドプールの異なるスレッドで新しいコルーチンを開始するようにします。また、リクエストを送信する前に追加のログ記録を追加します：

    ```kotlin
    async(Dispatchers.Default) {
        log("starting loading for ${repo.name}")
        service.getRepoContributors(req.org, repo.name)
            .also { logUsers(repo, it) }
            .bodyList()
    }
    ```

5. プログラムをもう一度実行します。ログを見ると、各コルーチンがスレッドプールの1つのスレッドで開始され、別のスレッドで再開される可能性があることが確認できます：

    ```text
    1946 [DefaultDispatcher-worker-2 @coroutine#4] INFO  Contributors - starting loading for kotlin-koans
    1946 [DefaultDispatcher-worker-3 @coroutine#5] INFO  Contributors - starting loading for dokka
    1946 [DefaultDispatcher-worker-1 @coroutine#3] INFO  Contributors - starting loading for ts2kt
    ...
    2178 [DefaultDispatcher-worker-1 @coroutine#4] INFO  Contributors - kotlin-koans: loaded 45 contributors
    2569 [DefaultDispatcher-worker-1 @coroutine#5] INFO  Contributors - dokka: loaded 36 contributors
    2821 [DefaultDispatcher-worker-2 @coroutine#3] INFO  Contributors - ts2kt: loaded 11 contributors
    ```

   例えば、このログの抜粋では、`coroutine#4` は `worker-2` スレッドで開始され、`worker-1` スレッドで継続されています。

`src/contributors/Contributors.kt` で、_CONCURRENT_ オプションの実装を確認します：

1. コルーチンをメイン UI スレッドでのみ実行するには、引数として `Dispatchers.Main` を指定します：

    ```kotlin
    launch(Dispatchers.Main) {
        updateResults()
    }
    ```

    * メインスレッド上で新しいコルーチンを開始したときにメインスレッドがビジー状態である場合、コルーチンはサスペンドされ、このスレッドで実行されるようにスケジュールされます。コルーチンは、スレッドが空いたときにのみ再開されます。
    * 各エンドポイントで明示的に指定するのではなく、外部スコープからのディスパッチャを使用することをお勧めします。引数として `Dispatchers.Default` を渡さずに `loadContributorsConcurrent()` を定義すると、任意のコンテキスト（`Default` ディスパッチャ、メイン UI スレッド、またはカスタムディスパッチャなど）でこの関数を呼び出すことができます。
    * 後で見るように、テストから `loadContributorsConcurrent()` を呼び出す場合、`TestDispatcher` を持つコンテキストで呼び出すことができるため、テストが簡素化されます。これにより、このソリューションの柔軟性が大幅に向上します。

2. 呼び出し側でディスパッチャを指定し、`loadContributorsConcurrent` には継承されたコンテキストでコルーチンを開始させるために、プロジェクトに以下の変更を適用します：

    ```kotlin
    launch(Dispatchers.Default) {
        val users = loadContributorsConcurrent(service, req)
        withContext(Dispatchers.Main) {
            updateResults(users, startTime)
        }
    }
    ```

    * `updateResults()` はメイン UI スレッドで呼び出される必要があるため、`Dispatchers.Main` のコンテキストで呼び出します。
    * `withContext()` は、指定されたコルーチンコンテキストで指定されたコードを呼び出し、完了するまでサスペンドして、結果を返します。これを表現するための、より冗長な代替手段としては、新しいコルーチンを開始し、それが完了するまで（サスペンドによって）明示的に待機する方法があります：`launch(context) { ... }.join()`。

3. コードを実行し、コルーチンがスレッドプールのスレッドで実行されていることを確認します。

## 構造化並行性（Structured concurrency） {id="structured-concurrency"}

* *コルーチンスコープ*（coroutine scope）は、異なるコルーチン間の構造および親子関係を担当します。新しいコルーチンは通常、スコープ内で開始する必要があります。
* *コルーチンコンテキスト*（coroutine context）は、コルーチンのカスタム名や、コルーチンをスケジュールするスレッドを指定するディスパッチャなど、特定のコルーチンを実行するために使用される追加の技術的情報を保持します。

`launch`、`async`、または `runBlocking` を使用して新しいコルーチンを開始すると、対応するスコープが自動的に作成されます。これらの関数はすべてレシーバー付きのラムダを引数として受け取り、`CoroutineScope` が暗黙のレシーバー型となります：

```kotlin
launch { /* this: CoroutineScope */ }
```

* 新しいコルーチンはスコープ内でのみ開始できます。
* `launch` と `async` は `CoroutineScope` の拡張として宣言されているため、呼び出すときは常に暗黙的または明示的なレシーバーを渡す必要があります。
* `runBlocking` はトップレベル関数として定義されているため、唯一の例外です。ただし、現在のスレッドをブロックするため、主にブリッジ関数として `main()` 関数やテストで使用されることを意図しています。

`runBlocking`、`launch`、または `async` 内の新しいコルーチンは、自動的にスコープ内で開始されます：

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking { /* this: CoroutineScope */
    launch { /* ... */ }
    // 以下と同じ:   
    this.launch { /* ... */ }
}
```

`runBlocking` 内で `launch` を呼び出すと、`CoroutineScope` 型の暗黙のレシーバーに対する拡張として呼び出されます。あるいは、明示的に `this.launch` と書くこともできます。

ネストされたコルーチン（この例では `launch` によって開始されたもの）は、外側のコルーチン（`runBlocking` によって開始されたもの）の子と見なすことができます。この「親子」関係はスコープを通じて機能します。子コルーチンは、親コルーチンに対応するスコープから開始されます。

`coroutineScope` 関数を使用することで、新しいコルーチンを開始せずに新しいスコープを作成することが可能です。外側のスコープへのアクセス権を持たない `suspend` 関数の内部で、構造化された方法で新しいコルーチンを開始するために、その `suspend` 関数が呼び出された外側のスコープの子となる新しいコルーチンスコープを自動的に作成できます。`loadContributorsConcurrent()` はその好例です。

また、`GlobalScope.async` や `GlobalScope.launch` を使用してグローバルスコープから新しいコルーチンを開始することもできます。これにより、トップレベルの「独立した」コルーチンが作成されます。

コルーチンの構造の背後にある仕組みは、*構造化並行性*（structured concurrency）と呼ばれます。グローバルスコープと比較して、次のような利点があります：

* スコープは通常、子コルーチンに対して責任を持ち、子コルーチンのライフタイムはスコープのライフタイムに関連付けられます。
* 何か問題が発生した場合や、ユーザーが考えを変えて操作を取り消す（キャンセルする）ことにした場合、スコープは子コルーチンを自動的にキャンセルできます。
* スコープは、すべての子コルーチンの完了を自動的に待機します。したがって、スコープがコルーチンに対応している場合、親コルーチンはそのスコープで起動されたすべてのコルーチンが完了するまで完了しません。

`GlobalScope.async` を使用する場合、複数のコルーチンをより小さなスコープにバインドする構造はありません。グローバルスコープから開始されたコルーチンはすべて独立しており、そのライフタイムはアプリケーション全体のライフタイムによってのみ制限されます。グローバルスコープから開始されたコルーチンへの参照を保持し、その完了を待機したり明示的にキャンセルしたりすることは可能ですが、構造化並行性のように自動的には行われません。

### コントリビューターの読み込みのキャンセル {id="canceling-the-loading-of-contributors"}

コントリビューターのリストを読み込む関数の2つのバージョンを作成します。親コルーチンをキャンセルしようとしたときに、両方のバージョンがどのように動作するかを比較します。最初のバージョンではすべての子コルーチンを開始するために `coroutineScope` を使用し、2番目のバージョンでは `GlobalScope` を使用します。

1. `Request5Concurrent.kt` で、`loadContributorsConcurrent()` 関数に3秒の遅延（delay）を追加します：

   ```kotlin
   suspend fun loadContributorsConcurrent(
       service: GitHubService, 
       req: RequestData
   ): List<User> = coroutineScope {
       // ...
       async {
           log("starting loading for ${repo.name}")
           delay(3000)
           // リポジトリのコントリビューターを読み込む
       }
       // ...
   }
   ```
   
   この遅延はリクエストを送信するすべてのコルーチンに影響するため、コルーチンが開始された後、リクエストが送信される前に読み込みをキャンセルする十分な時間が確保されます。

2. 読み込み関数の2番目のバージョンを作成します：`Request5NotCancellable.kt` の `loadContributorsNotCancellable()` に `loadContributorsConcurrent()` の実装をコピーし、新しい `coroutineScope` の作成を削除します。
3. `async` の呼び出しが解決されなくなるため、`GlobalScope.async` を使用して開始します：

    ```kotlin
    suspend fun loadContributorsNotCancellable(
        service: GitHubService,
        req: RequestData
    ): List<User> {   // #1
        // ...
        GlobalScope.async {   // #2
            log("starting loading for ${repo.name}")
            // リポジトリのコントリビューターを読み込む
        }
        // ...
        return deferreds.awaitAll().flatten().aggregate()  // #3
    }
    ```

    * これにより、関数はラムダ内の最後の式としてではなく、直接結果を返すようになります（`#1` 行目と `#3` 行目）。
    * すべての "contributors" コルーチンは、コルーチンスコープの子としてではなく、`GlobalScope` 内で開始されます（`#2` 行目）。

4. プログラムを実行し、_CONCURRENT_ オプションを選択してコントリビューターを読み込みます。
5. すべての "contributors" コルーチンが開始されるまで待ってから、_Cancel_ をクリックします。ログには新しい結果が表示されず、すべてのリクエストが実際にキャンセルされたことが確認できます：

    ```text
    2896 [AWT-EventQueue-0 @coroutine#1] INFO  Contributors - kotlin: loaded 40 repos
    2901 [DefaultDispatcher-worker-2 @coroutine#4] INFO  Contributors - starting loading for kotlin-koans
    ...
    2909 [DefaultDispatcher-worker-5 @coroutine#36] INFO  Contributors - starting loading for mpp-example
    /* 'cancel' をクリック */
    /* リクエストは送信されない */
    ```

6. ステップ5を繰り返しますが、今回は `NOT_CANCELLABLE` オプションを選択します：

    ```text
    2570 [AWT-EventQueue-0 @coroutine#1] INFO  Contributors - kotlin: loaded 30 repos
    2579 [DefaultDispatcher-worker-1 @coroutine#4] INFO  Contributors - starting loading for kotlin-koans
    ...
    2586 [DefaultDispatcher-worker-6 @coroutine#36] INFO  Contributors - starting loading for mpp-example
    /* 'cancel' をクリック */
    /* それでもすべてのリクエストが送信される: */
    6402 [DefaultDispatcher-worker-5 @coroutine#4] INFO  Contributors - kotlin-koans: loaded 45 contributors
    ...
    9555 [DefaultDispatcher-worker-8 @coroutine#36] INFO  Contributors - mpp-example: loaded 8 contributors
    ```

    この場合、コルーチンはキャンセルされず、すべてのリクエストが送信されたままになります。

7. 「コントリビューター」プログラムでキャンセルがどのようにトリガーされるかを確認します。_Cancel_ ボタンがクリックされると、メインの「読み込み」コルーチンが明示的にキャンセルされ、子コルーチンは自動的にキャンセルされます：

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
    
            // 'cancel' ボタンがクリックされた場合、読み込みジョブをキャンセルする:
            val listener = ActionListener {
                loadingJob.cancel()            // #3
                updateLoadingStatus(CANCELED)
            }
            // 'cancel' ボタンにリスナーを追加する:
            addCancelListener(listener)
    
            // 読み込みジョブが完了した後に
            // ステータスを更新し、リスナーを削除する
        }
    }   
    ```

`launch` 関数は `Job` のインスタンスを返します。`Job` は、すべてのデータを読み込んで結果を更新する「読み込みコルーチン」への参照を保持します。その上で `setUpCancellation()` 拡張関数を呼び出し（`#1` 行目）、`Job` のインスタンスをレシーバーとして渡すことができます。

これを表現する別の方法として、次のように明示的に書くこともできます：

```kotlin
val job = launch { }
job.setUpCancellation()
```

* 可読性のために、関数内部で新しい `loadingJob` 変数を使用して `setUpCancellation()` 関数のレシーバーを参照できます（`#2` 行目）。
* 次に、_Cancel_ ボタンにリスナーを追加して、クリックされたときに `loadingJob` がキャンセルされるようにします（`#3` 行目）。

構造化並行性を使用すると、親コルーチンをキャンセルするだけで済み、これが自動的にすべての子コルーチンにキャンセルを伝播させます。

### 外側のスコープのコンテキストの使用 {id="using-the-outer-scope-s-context"}

特定のスコープ内で新しいコルーチンを開始すると、それらすべてが同じコンテキストで実行されるようにすることがはるかに簡単になります。また、必要に応じてコンテキストを置き換えることもはるかに簡単です。

ここで、外部スコープのディスパッチャを使用する仕組みについて学びましょう。`coroutineScope` やコルーチンビルダーによって作成された新しいスコープは、常に外部スコープからコンテキストを継承します。この場合、外部スコープとは `suspend loadContributorsConcurrent()` 関数が呼び出されたスコープです：

```kotlin
launch(Dispatchers.Default) {  // 外部スコープ
    val users = loadContributorsConcurrent(service, req)
    // ...
}
```

ネストされたすべてのコルーチンは、継承されたコンテキストで自動的に開始されます。ディスパッチャはこのコンテキストの一部です。そのため、`async` によって開始されたすべてのコルーチンは、デフォルトディスパッチャのコンテキストで開始されます：

```kotlin
suspend fun loadContributorsConcurrent(
    service: GitHubService, req: RequestData
): List<User> = coroutineScope {
    // このスコープは外部スコープからコンテキストを継承する
    // ...
    async {   // 継承されたコンテキストで開始されるネストされたコルーチン
        // ...
    }
    // ...
}
```

構造化並行性を使用すると、トップレベルのコルーチンを作成するときに、主要なコンテキスト要素（ディスパッチャなど）を一度だけ指定できます。ネストされたすべてのコルーチンはコンテキストを継承し、必要な場合にのみそれを変更します。

> UI アプリケーション（Android など）用のコードをコルーチンで記述する場合、トップコルーチンにはデフォルトで `CoroutineDispatchers.Main` を使用し、別のスレッドでコードを実行する必要がある場合に明示的に別のディスパッチャを指定するのが一般的なプラクティスです。
>
{style="tip"}

## 進捗状況の表示 {id="showing-progress"}

一部のリポジトリの情報はかなり迅速に読み込まれるにもかかわらず、ユーザーにはすべてのデータが読み込まれた後にのみ結果のリストが表示されます。それまではローダーアイコンが回転して進行状況を示しますが、現在の状態やどのコントリビューターがすでに読み込まれているかについての情報はありません。

中間結果をより早く表示し、各リポジトリのデータを読み込んだ後にコントリビューターを順次表示することができます：

![データの読み込み](loading.gif){width=500}

この機能を実装するには、`src/tasks/Request6Progress.kt` で、UI を更新するロジックをコールバックとして渡し、各中間状態で呼び出されるようにする必要があります：

```kotlin
suspend fun loadContributorsProgress(
    service: GitHubService,
    req: RequestData,
    updateResults: suspend (List<User>, completed: Boolean) -> Unit
) {
    // データの読み込み
    // 中間状態で `updateResults()` を呼び出す
}
```

`Contributors.kt` の呼び出し側では、_PROGRESS_ オプションに対して `Main` スレッドから結果を更新するためにコールバックが渡されます：

```kotlin
launch(Dispatchers.Default) {
    loadContributorsProgress(service, req) { users, completed ->
        withContext(Dispatchers.Main) {
            updateResults(users, startTime, completed)
        }
    }
}
```

* `updateResults()` パラメータは `loadContributorsProgress()` 内で `suspend` として宣言されています。対応するラムダ引数内で、サスペンド関数である `withContext` を呼び出す必要があるためです。
* `updateResults()` コールバックは、読み込みが完了して結果が最終的なものかどうかを指定する追加の Boolean パラメータを引数として取ります。

### タスク 6 {id="task-6"}

`Request6Progress.kt` ファイルで、中間の進捗状況を表示する `loadContributorsProgress()` 関数を実装してください。`Request4Suspend.kt` の `loadContributorsSuspend()` 関数をベースにしてください。

* 並行処理のないシンプルなバージョンを使用してください。次のセクションで並行処理を追加します。
* コントリビューターの中間リストは、各リポジトリについて読み込まれたユーザーのリスト単体ではなく、「集約された（aggregated）」状態で表示される必要があります。
* 新しいリポジトリのデータが読み込まれるたびに、各ユーザーの総コントリビューション数が増加していく必要があります。

#### タスク 6 の解答 {initial-collapse-state="collapsed" collapsible="true" id="solution-for-task-6"}

読み込まれたコントリビューターの中間リストを「集約された」状態で保持するために、ユーザーのリストを格納する `allUsers` 変数を定義し、新しいリポジトリのコントリビューターが読み込まれた後にそれを更新します：

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

#### 逐次処理 vs 並行処理 {id="consecutive-vs-concurrent"}

各リクエストが完了した後に `updateResults()` コールバックが呼び出されます：

![リクエストの進行状況](progress.png){width=700}

このコードには並行性が含まれていません。順次実行されるため、同期は必要ありません。

最良の選択肢は、リクエストを並行して送信し、各リポジトリのレスポンスを取得した後に中間結果を更新することです：

![並行リクエスト](progress-and-concurrency.png){width=700}

並行性を追加するには、*チャネル*（channels）を使用します。

## チャネル（Channels） {id="channels"}

共有された可変状態を持つコードを書くことは非常に難しく、エラーが発生しやすくなります（コールバックを使用した解決策のように）。より簡単な方法は、共通の可変状態を使用するのではなく、通信によって情報を共有することです。コルーチンは *チャネル* を介して相互に通信できます。

チャネルは、コルーチン間でデータを渡すことを可能にする通信プリミティブです。1つのコルーチンが情報をチャネルに *送信*（send）し、別のコルーチンがそのチャネルから情報を *受信*（receive）できます：

![チャネルの使用](using-channel.png)

情報を送信（プロデュース）するコルーチンはしばしばプロデューサー（producer）と呼ばれ、情報を受信（コンシューム）するコルーチンはコンシューマー（consumer）と呼ばれます。1つまたは複数のコルーチンが同じチャネルに情報を送信でき、1つまたは複数のコルーチンがそこからデータを受信できます：

![多数のコルーチンでのチャネルの使用](using-channel-many-coroutines.png)

多数のコルーチンが同じチャネルから情報を受信する場合、各要素はいずれか1つのコンシューマーによって一度だけ処理されます。要素が処理されると、直ちにチャネルから削除されます。

チャネルは、要素のコレクション、より正確には一方の端から要素が追加され、もう一方の端から受信されるキューに似ていると考えることができます。ただし、重要な違いがあります。同期されたコレクションであってもコレクションとは異なり、チャネルは `send()` および `receive()` の操作を *サスペンド* できます。これは、チャネルが空または満杯の場合に発生します。チャネルのサイズに上限がある場合、チャネルは満杯になることがあります。

`Channel` は3つの異なるインターフェースによって表されます：`SendChannel`、`ReceiveChannel`、そして後者が最初の2つを拡張する `Channel` です。通常、チャネルを作成し、プロデューサーにはチャネルに情報を送信することしかできないように `SendChannel` インスタンスとして渡します。コンシューマーにはチャネルから受信することしかできないように `ReceiveChannel` インスタンスとして渡します。`send` メソッドと `receive` メソッドは両方とも `suspend` として宣言されています：

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

プロデューサーはチャネルをクローズして、これ以上要素が送られてこないことを示すことができます。

ライブラリではいくつかの種類のチャネルが定義されています。これらは、内部に格納できる要素の数と、`send()` の呼び出しがサスペンドされるかどうかにおいて異なります。すべてのチャネルタイプにおいて、`receive()` の呼び出しは同様に動作します。チャネルが空でなければ要素を受信し、そうでなければサスペンドされます。

<deflist collapsible="true">
   <def title="Unlimited channel（無制限チャネル）" id="unlimited-channel">
       <p>無制限チャネルはキューに最も近い類似物です。プロデューサーはこのチャネルに要素を送信でき、チャネルは無期限に拡大し続けます。<code>send()</code> の呼び出しがサスペンドされることはありません。プログラムがメモリ不足になった場合、<code>OutOfMemoryException</code> が発生します。無制限チャネルとキューの違いは、コンシューマーが空のチャネルから受信しようとすると、新しい要素が送信されるまでサスペンドされる点です。</p>
       <img src="unlimited-channel.png" alt="無制限チャネル" width="500"/>
   </def>
   <def title="Buffered channel（バッファ付きチャネル）" id="buffered-channel">
       <p>バッファ付きチャネルのサイズは、指定された数に制限されます。プロデューサーは、サイズ制限に達するまでこのチャネルに要素を送信できます。すべての要素は内部に格納されます。チャネルが満杯になると、そのチャネルでの次の <code>send()</code> の呼び出しは、空き容量ができるまでサスペンドされます。</p>
       <img src="buffered-channel.png" alt="バッファ付きチャネル" width="500"/>
   </def>
   <def title="Rendezvous channel（ランデブーチャネル）" id="rendezvous-channel">
       <p>「ランデブー」チャネルはバッファを持たないチャネルであり、サイズがゼロのバッファ付きチャネルと同じです。関数（<code>send()</code> または <code>receive()</code>）の一方は、もう一方が呼び出されるまで常にサスペンドされます。</p>
       <p><code>send()</code> 関数が呼び出され、要素を処理する準備ができているサスペンド状態の <code>receive()</code> 呼び出しがない場合、<code>send()</code> はサスペンドされます。同様に、<code>receive()</code> 関数が呼び出され、チャネルが空である（別の言い方をすれば、要素を送信する準備ができているサスペンド状態の <code>send()</code> 呼び出しがない）場合、<code>receive()</code> 呼び出しはサスペンドされます。</p>
       <p>「ランデブー」という名前（「約束の時間と場所での出会い」）は、<code>send()</code> と <code>receive()</code> が「時間通りに出会う」必要があるという事実に由来しています。</p>
       <img src="rendezvous-channel.png" alt="ランデブーチャネル" width="500"/>
   </def>
   <def title="Conflated channel（合流チャネル）" id="conflated-channel">
       <p>合流（conflated）チャネルに送信された新しい要素は、以前に送信された要素を上書きするため、レシーバーは常に最新の要素のみを取得します。<code>send()</code> の呼び出しがサスペンドされることはありません。</p>
       <img src="conflated-channel.gif" alt="合流チャネル" width="500"/>
   </def>
</deflist>

チャネルを作成する際は、そのタイプまたはバッファサイズ（バッファ付きが必要な場合）を指定します：

```kotlin
val rendezvousChannel = Channel<String>()
val bufferedChannel = Channel<String>(10)
val conflatedChannel = Channel<String>(CONFLATED)
val unlimitedChannel = Channel<String>(UNLIMITED)
```

デフォルトでは、「ランデブー」チャネルが作成されます。

次のタスクでは、「ランデブー」チャネル、2つのプロデューサーコルーチン、および1つのコンシューマーコルーチンを作成します：

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

> チャネルの理解を深めるには、[こちらの動画](https://www.youtube.com/watch?v=HpWQUoVURWQ)をご覧ください。
>
{style="tip"}

### タスク 7 {id="task-7"}

`src/tasks/Request7Channels.kt` で、すべての GitHub コントリビューターを並行してリクエストし、同時に中間進捗を表示する関数 `loadContributorsChannels()` を実装してください。

以前の関数、`Request5Concurrent.kt` の `loadContributorsConcurrent()` と `Request6Progress.kt` の `loadContributorsProgress()` を利用してください。

#### タスク 7 のヒント {initial-collapse-state="collapsed" collapsible="true" id="tip-for-task-7"}

異なるリポジトリのコントリビューターリストを並行して受信する異なるコルーチンは、受信したすべての結果を同じチャネルに送信できます：

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

その後、このチャネルからの要素を1つずつ受信して処理できます：

```kotlin
repeat(repos.size) {
    val users = channel.receive()
    // ...
}
```

`receive()` の呼び出しは順次行われるため、追加の同期は必要ありません。

#### タスク 7 の解答 {initial-collapse-state="collapsed" collapsible="true" id="solution-for-task-7"}

`loadContributorsProgress()` 関数と同様に、「全コントリビューター」リストの中間状態を格納する `allUsers` 変数を作成できます。
チャネルから受信した新しいリストはそれぞれ、全ユーザーのリストに追加されます。結果を集約し、`updateResults` コールバックを使用して状態を更新します：

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

* 異なるリポジトリの結果は、準備ができ次第チャネルに追加されます。最初は、すべてのリクエストが送信されデータが受信されていないため、`receive()` 呼び出しはサスペンドされます。この場合、「コントリビューター読み込み」コルーチン全体がサスペンドされます。
* その後、ユーザーのリストがチャネルに送信されると、「コントリビューター読み込み」コルーチンが再開され、`receive()` 呼び出しがこのリストを返し、結果が即座に更新されます。

プログラムを実行し、_CHANNELS_ オプションを選択してコントリビューターを読み込み、結果を確認できるようになりました。

コルーチンもチャネルも、並行性に付随する複雑さを完全に排除するわけではありませんが、何が起きているのかを把握したいときの負担を大幅に軽減してくれます。

## コルーチンのテスト {id="testing-coroutines"}

それでは、すべての解決策をテストして、並行コルーチンを使用した解決策が `suspend` 関数を使用した解決策よりも高速であること、そしてチャネルを使用した解決策が単純な「progress」のものよりも高速であることを確認しましょう。

次のタスクでは、各解決策の合計実行時間を比較します。GitHub サービスをモック化し、指定されたタイムアウト後に結果を返すようにします：

```text
repos リクエスト - 1000 ms の遅延で回答を返す
repo-1 - 1000 ms の遅延
repo-2 - 1200 ms の遅延
repo-3 - 800 ms の遅延
```

`suspend` 関数を使用した逐次的な解決策には、約 4000 ms かかるはずです（4000 = 1000 + (1000 + 1200 + 800)）。並行の解決策には、約 2200 ms かかるはずです（2200 = 1000 + max(1000, 1200, 800)）。

進捗を表示する解決策については、タイムスタンプ付きの中間結果を確認することもできます。

対応するテストデータは `test/contributors/testData.kt` で定義されており、`Request4SuspendKtTest`、`Request7ChannelsKtTest` などのファイルにはモックサービスの呼び出しを使用する率直なテストが含まれています。

しかし、ここには2つの問題があります：

* これらのテストは実行に時間がかかりすぎます。各テストには約2〜4秒かかり、毎回結果を待つ必要があります。これではあまり効率的ではありません。
* コードの準備と実行に余分な時間がかかるため、解決策が実行される正確な時間に頼ることはできません。定数を加えることもできますが、その場合、マシンによって時間が異なってしまいます。違いを確認できるようにするには、モックサービスの遅延をこの定数よりも大きくする必要があります。定数が 0.5 秒の場合、遅延を 0.1 秒に設定しても十分ではありません。

より良い方法は、同じコードを複数回実行しながらタイミングをテストする特別なフレームワークを使用することですが（これにより合計時間はさらに増加します）、それを学習してセットアップするのは複雑です。

これらの問題を解決し、指定されたテスト遅延を伴う解決策が期待通りに動作すること（一方が他方よりも高速であること）を確認するために、特別なテストディスパッチャを備えた *仮想時間*（virtual time）を使用します。このディスパッチャは開始からの経過仮想時間を追跡し、現実時間においてはすべてを即座に実行します。このディスパッチャ上でコルーチンを実行すると、`delay` は即座に戻り、仮想時間を進めます。

このメカニズムを使用するテストは高速に実行されますが、仮想時間の異なる瞬間に何が起こるかを確認することは可能です。合計実行時間は劇的に減少します：

![合計実行時間の比較](time-comparison.png){width=700}

仮想時間を使用するには、`runBlocking` の呼び出しを `runTest` に置き換えます。`runTest` は `TestScope` への拡張ラムダを引数として取ります。この特別なスコープ内の `suspend` 関数で `delay` を呼び出すと、`delay` は現実時間で遅延させる代わりに仮想時間を増加させます：

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
    delay(1000)    // 遅延なしで自動進行
    println("foo") // foo() が呼び出されたときに即時実行
}
```

`TestScope` の `currentTime` プロパティを使用して、現在の仮想時間を確認できます。

この例での実際の実行時間は数ミリ秒ですが、仮想時間は遅延の引数と同じ 1000 ミリ秒になります。

子コルーチンで「仮想」`delay` の完全な効果を得るには、すべての子コルーチンを `TestDispatcher` で開始します。そうしないと機能しません。別のディスパッチャを提供しない限り、このディスパッチャは他の `TestScope` から自動的に継承されます：

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
        delay(1000)    // 遅延なしで自動進行
        println("bar") // bar() が呼び出されたときに即時実行
    }
}
```

上記の例で `launch` が `Dispatchers.Default` のコンテキストで呼び出された場合、テストは失敗します。ジョブがまだ完了していないという例外が発生します。

`loadContributorsConcurrent()` 関数をこの方法でテストできるのは、`Dispatchers.Default` ディスパッチャを使用して変更することなく、継承されたコンテキストで子コルーチンを開始する場合に限られます。

関数の *定義時* ではなく *呼び出し時* にディスパッチャなどのコンテキスト要素を指定できるため、柔軟性が高まり、テストが容易になります。

> 仮想時間をサポートするテスト API は [試験的（Experimental）](components-stability.md) であり、将来変更される可能性があります。
>
{style="warning"}

デフォルトでは、実験的なテスト API を使用するとコンパイラは警告を表示します。これらの警告を抑制するには、テスト関数またはテストを含むクラス全体に `@OptIn(ExperimentalCoroutinesApi::class)` でアノテーションを付けます。実験的な API を使用していることをコンパイラに指示するコンパイラ引数を追加します：

```kotlin
compileTestKotlin {
    kotlinOptions {
        freeCompilerArgs += "-Xuse-experimental=kotlin.Experimental"
    }
}
```

このチュートリアルに対応するプロジェクトでは、コンパイラ引数はすでに Gradle スクリプトに追加されています。

### タスク 8 {id="task-8"}

`tests/tasks/` 内の以下のテストをリファクタリングして、現実時間の代わりに仮想時間を使用するようにしてください：

* `Request4SuspendKtTest.kt`
* `Request5ConcurrentKtTest.kt`
* `Request6ProgressKtTest.kt`
* `Request7ChannelsKtTest.kt`

リファクタリングを適用する前と後で、合計実行時間を比較してください。

#### タスク 8 のヒント {initial-collapse-state="collapsed" collapsible="true" id="tip-for-task-8"}

1. `runBlocking` の呼び出しを `runTest` に置き換え、`System.currentTimeMillis()` を `currentTime` に置き換えます：

    ```kotlin
    @Test
    fun test() = runTest {
        val startTime = currentTime
        // アクション
        val totalTime = currentTime - startTime
        // テスト結果
    }
    ```

2. 正確な仮想時間をチェックするアサーションのコメントを解除します。
3. `@UseExperimental(ExperimentalCoroutinesApi::class)` の追加を忘れないでください。

#### タスク 8 の解答 {initial-collapse-state="collapsed" collapsible="true" id="solution-for-task-8"}

並行およびチャネルのケースの解答は以下の通りです：

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

まず、結果が期待される仮想時間に正確に利用可能になっていることを確認し、次に結果自体を確認します：

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

チャネルを使用した最後のバージョンの中間結果は、progress バージョンよりも早く利用可能になり、仮想時間を使用したテストでその違いを確認できます。

> 残りの「suspend」および「progress」タスクのテストも非常によく似ています。プロジェクトの `solutions` ブランチで確認できます。
>
{style="tip"}

## 次のステップ {id="what-s-next"}

* KotlinConf での [Kotlin による非同期プログラミング（Asynchronous Programming with Kotlin）](https://kotlinconf.com/workshops/) ワークショップをチェックしてください。
* [仮想時間と試験的なテストパッケージの使用](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-test/) についての詳細をご覧ください。