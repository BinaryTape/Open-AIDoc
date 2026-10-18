<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: 코루틴과 채널 − 튜토리얼)

> 추후 업데이트를 통해 이 튜토리얼이 개정될 예정입니다. 그동안 코루틴을 시작하기 위한 최신 가이드는 [코루틴 기초](coroutines-basics.md)를 참고하세요.
> 
{style="note"}

이 튜토리얼에서는 IntelliJ IDEA에서 코루틴을 사용하여 기반 스레드(underlying thread)를 차단(block)하거나 콜백을 사용하지 않고 네트워크 요청을 수행하는 방법을 배웁니다.

> 코루틴에 대한 사전 지식은 필요하지 않지만, 기본적인 Kotlin 문법에는 익숙해야 합니다.
>
{style="tip"}

다음을 배우게 됩니다:

* 네트워크 요청을 수행하기 위해 일시 중단 함수(suspending function)를 사용하는 이유와 방법.
* 코루틴을 사용하여 요청을 동시(concurrently)에 전송하는 방법.
* 채널(channel)을 사용하여 서로 다른 코루틴 간에 정보를 공유하는 방법.

네트워크 요청에는 [Retrofit](https://lysine.dev/retrofit/) 라이브러리를 사용하지만, 이 튜토리얼에서 보여주는 접근 방식은 코루틴을 지원하는 다른 라이브러리에서도 유사하게 작동합니다.

> 모든 작업에 대한 해결책은 [프로젝트 저장소](http://github.com/kotlin-hands-on/intro-coroutines)의 `solutions` 브랜치에서 찾을 수 있습니다.
>
{style="tip"}

## 시작하기 전에 {id="before-you-start"}

1. 최신 버전의 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/index.html)를 다운로드하여 설치합니다.
2. 시작 화면에서 **Get from VCS**를 선택하거나 **File | New | Project from Version Control**을 선택하여 [프로젝트 템플릿](http://github.com/kotlin-hands-on/intro-coroutines)을 클론합니다.

   명령줄에서도 클론할 수 있습니다:

   ```Bash
   git clone https://github.com/kotlin-hands-on/intro-coroutines
   ```

### GitHub 개발자 토큰 생성 {id="generate-a-github-developer-token"}

프로젝트에서 GitHub API를 사용합니다. 액세스 권한을 얻으려면 GitHub 계정 이름과 비밀번호 또는 토큰을 제공해야 합니다. 2단계 인증(2FA)이 활성화되어 있다면 토큰만으로 충분합니다.

[내 계정](https://github.com/settings/tokens/new)에서 GitHub API를 사용할 새 GitHub 토큰을 생성합니다:

1. 토큰의 이름(예: `coroutines-tutorial`)을 지정합니다:

   ![새 GitHub 토큰 생성](generating-token.png){width=700}

2. 어떤 스코프(scope)도 선택하지 마세요. 페이지 하단의 **Generate token**을 클릭합니다.
3. 생성된 토큰을 복사합니다.

### 코드 실행 {id="run-the-code"}

이 프로그램은 주어진 조직(기본값은 "kotlin") 아래의 모든 저장소에 대한 기여자(contributor) 목록을 로드합니다. 나중에 기여 횟수에 따라 사용자를 정렬하는 로직을 추가할 것입니다.

1. `src/contributors/main.kt` 파일을 열고 `main()` 함수를 실행합니다. 다음과 같은 창이 표시됩니다:

   ![초기 창](initial-window.png){width=500}

   글꼴이 너무 작으면 `main()` 함수의 `setDefaultFontSize(18f)` 값을 변경하여 조절하세요.

2. 해당 필드에 GitHub 사용자 이름과 토큰(또는 비밀번호)을 입력합니다.
3. _Variant_ 드롭다운 메뉴에서 _BLOCKING_ 옵션이 선택되어 있는지 확인합니다.
4. _Load contributors_를 클릭합니다. UI가 잠시 멈췄다가 기여자 목록이 표시됩니다.
5. 프로그램 출력을 열어 데이터가 로드되었는지 확인합니다. 요청이 성공할 때마다 기여자 목록이 로그에 기록됩니다.

이 로직을 구현하는 방법에는 여러 가지가 있습니다: [블로킹 요청](#blocking-requests)을 사용하거나 [콜백](#callbacks)을 사용할 수 있습니다. 이러한 해결책들을 [코루틴](#coroutines)을 사용하는 방식과 비교해보고, 서로 다른 코루틴 간에 정보를 공유하기 위해 [채널](#channels)을 어떻게 사용할 수 있는지 알아봅니다.

## 블로킹 요청 {id="blocking-requests"}

GitHub에 HTTP 요청을 보내기 위해 [Retrofit](https://lysine.dev/retrofit/) 라이브러리를 사용합니다. 이를 통해 주어진 조직 아래의 저장소 목록과 각 저장소의 기여자 목록을 요청할 수 있습니다:

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

이 API는 `loadContributorsBlocking()` 함수에서 주어진 조직의 기여자 목록을 가져오는 데 사용됩니다.

1. `src/tasks/Request1Blocking.kt`를 열어 구현을 확인합니다:

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

    * 먼저 주어진 조직 아래의 저장소 목록을 가져와 `repos` 리스트에 저장합니다. 그런 다음 각 저장소에 대해 기여자 목록을 요청하고, 모든 목록을 하나의 최종 기여자 목록으로 병합합니다.
    * `getOrgReposCall()`과 `getRepoContributorsCall()`은 모두 `*Call` 클래스의 인스턴스를 반환합니다(`#1`). 이 시점에서는 요청이 전송되지 않습니다.
    * 그런 다음 요청을 수행하기 위해 `*Call.execute()`가 호출됩니다(`#2`). `execute()`는 기본 스레드를 차단하는 동기식 호출입니다.
    * 응답을 받으면 특정 `logRepos()` 및 `logUsers()` 함수를 호출하여 결과를 로그에 기록합니다(`#3`). HTTP 응답에 오류가 포함된 경우 해당 오류가 여기에 기록됩니다.
    * 마지막으로 필요한 데이터가 포함된 응답의 body를 가져옵니다. 이 튜토리얼에서는 오류가 발생할 경우 빈 리스트를 결과로 사용하고 해당 오류를 로그에 기록합니다(`#4`).

2. `.body() ?: emptyList()`의 반복을 피하기 위해 확장 함수 `bodyList()`가 선언되어 있습니다:

    ```kotlin
    fun <T> Response<List<T>>.bodyList(): List<T> {
        return body() ?: emptyList()
    }
    ```  

3. 프로그램을 다시 실행하고 IntelliJ IDEA의 시스템 출력을 살펴봅니다. 다음과 같은 내용이 나타납니다:

    ```text
    1770 [AWT-EventQueue-0] INFO  Contributors - kotlin: loaded 40 repos
    2025 [AWT-EventQueue-0] INFO  Contributors - kotlin-examples: loaded 23 contributors
    2229 [AWT-EventQueue-0] INFO  Contributors - kotlin-koans: loaded 45 contributors
    ...
    ```

    * 각 줄의 첫 번째 항목은 프로그램이 시작된 후 경과된 밀리초이며, 그 다음은 대괄호 안의 스레드 이름입니다. 로딩 요청이 어떤 스레드에서 호출되는지 확인할 수 있습니다.
    * 각 줄의 마지막 항목은 실제 메시지로, 로드된 저장소 또는 기여자의 수입니다.

    이 로그 출력은 모든 결과가 메인 스레드에서 기록되었음을 보여줍니다. _BLOCKING_ 옵션으로 코드를 실행하면 창이 멈추고(freeze) 로딩이 완료될 때까지 사용자 입력에 반응하지 않습니다. 모든 요청은 `loadContributorsBlocking()`이 호출된 스레드와 동일한 스레드, 즉 메인 UI 스레드(Swing의 경우 AWT 이벤트 디스패칭 스레드)에서 실행됩니다. 이 메인 스레드가 블로킹되기 때문에 UI가 멈추는 것입니다:

    ![블로킹된 메인 스레드](blocking.png){width=700}
    
    기여자 목록이 로드된 후에 결과가 업데이트됩니다.

4. `src/contributors/Contributors.kt`에서 기여자를 로드하는 방식을 선택하는 `loadContributors()` 함수를 찾고, `loadContributorsBlocking()`이 어떻게 호출되는지 확인합니다:

    ```kotlin
    when (getSelectedVariant()) {
        BLOCKING -> { // UI 스레드 블로킹
            val users = loadContributorsBlocking(service, req)
            updateResults(users, startTime)
        }
    }
    ```

    * `updateResults()` 호출은 `loadContributorsBlocking()` 호출 바로 다음에 위치합니다.
    * `updateResults()`는 UI를 업데이트하므로 항상 UI 스레드에서 호출되어야 합니다.
    * `loadContributorsBlocking()` 역시 UI 스레드에서 호출되므로 UI 스레드가 차단되어 UI가 멈추게 됩니다.

### 과제 1 {id="task-1"}

첫 번째 과제는 문제 도메인에 익숙해지는 데 도움이 됩니다. 현재는 각 기여자의 이름이 참여한 프로젝트마다 한 번씩 여러 번 반복됩니다. 사용자를 결합하여 각 기여자가 한 번만 추가되도록 `aggregate()` 함수를 구현하세요. `User.contributions` 프로퍼티는 해당 사용자가 _모든_ 프로젝트에 기여한 총 기여 횟수를 포함해야 합니다. 결과 리스트는 기여 횟수에 따라 내림차순으로 정렬되어야 합니다.

`src/tasks/Aggregation.kt`를 열고 `List<User>.aggregate()` 함수를 구현하세요. 사용자는 총 기여 횟수를 기준으로 정렬되어야 합니다.

해당 테스트 파일인 `test/tasks/AggregationKtTest.kt`에서 기대되는 결과의 예를 확인할 수 있습니다.

> [IntelliJ IDEA 단축키](https://www.jetbrains.com/help/idea/create-tests.html#test-code-navigation) `Ctrl+Shift+T` / `⇧ ⌘ T`를 사용하여 소스 코드와 테스트 클래스 사이를 자동으로 이동할 수 있습니다.
>
{style="tip"}

이 과제를 구현한 후 "kotlin" 조직에 대한 결과 목록은 다음과 유사해야 합니다:

![ "kotlin" 조직의 목록](aggregate.png){width=500}

#### 과제 1 해결 방법 {initial-collapse-state="collapsed" collapsible="true" id="solution-for-task-1"}

1. 로그인(아이디)별로 사용자를 그룹화하려면 [`groupBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/group-by.html)를 사용합니다. 이는 로그인에서부터 서로 다른 저장소에서 해당 로그인을 가진 사용자의 모든 발생(occurrence)으로 매핑되는 맵을 반환합니다.
2. 각 맵 엔트리에 대해 각 사용자의 총 기여 횟수를 계산하고, 주어진 이름과 총 기여 횟수를 사용하여 `User` 클래스의 새 인스턴스를 생성합니다.
3. 결과 리스트를 내림차순으로 정렬합니다:

    ```kotlin
    fun List<User>.aggregate(): List<User> =
        groupBy { it.login }
            .map { (login, group) -> User(login, group.sumOf { it.contributions }) }
            .sortedByDescending { it.contributions }
    ```

`groupBy()` 대신 [`groupingBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/grouping-by.html) 함수를 사용하는 대안도 있습니다.

## 콜백 {id="callbacks"}

이전 솔루션은 작동하지만 스레드를 차단하므로 UI를 멈추게 합니다. 이를 방지하는 전통적인 접근 방식은 _콜백(callback)_을 사용하는 것입니다.

작업이 완료된 직후에 호출되어야 하는 코드를 직접 호출하는 대신, 별도의 콜백(주로 람다)으로 추출하여 나중에 호출되도록 호출자에게 해당 람다를 전달할 수 있습니다.

UI의 반응성을 유지하기 위해 전체 계산을 별도의 스레드로 이동하거나, 블로킹 호출 대신 콜백을 사용하는 Retrofit API로 전환할 수 있습니다.

### 백그라운드 스레드 사용 {id="use-a-background-thread"}

1. `src/tasks/Request2Background.kt`를 열어 구현을 확인합니다. 먼저 전체 계산이 다른 스레드로 이동됩니다. `thread()` 함수는 새 스레드를 시작합니다:

    ```kotlin
    thread {
        loadContributorsBlocking(service, req)
    }
    ```

    이제 모든 로딩이 별도의 스레드로 이동되었으므로 메인 스레드는 자유로워져 다른 작업을 처리할 수 있습니다:

    ![자유로워진 메인 스레드](background.png){width=700}

2. `loadContributorsBackground()` 함수의 시그니처가 변경됩니다. 모든 로딩이 완료된 후 호출할 수 있도록 마지막 인수로 `updateResults()` 콜백을 받습니다:

    ```kotlin
    fun loadContributorsBackground(
        service: GitHubService, req: RequestData,
        updateResults: (List<User>) -> Unit
    )
    ```

3. 이제 `loadContributorsBackground()`가 호출될 때 `updateResults()` 호출은 이전처럼 즉시 실행되지 않고 콜백 내부에서 실행됩니다:

    ```kotlin
    loadContributorsBackground(service, req) { users ->
        SwingUtilities.invokeLater {
            updateResults(users, startTime)
        }
    }
    ```

    `SwingUtilities.invokeLater`를 호출함으로써 결과를 업데이트하는 `updateResults()` 호출이 메인 UI 스레드(AWT 이벤트 디스패칭 스레드)에서 실행되도록 보장합니다.

하지만 `BACKGROUND` 옵션으로 기여자를 로드하려고 하면 목록은 업데이트되지만 UI에는 아무것도 변경되지 않는 것을 확인할 수 있습니다.

### 과제 2 {id="task-2"}

결과 목록이 UI에 표시되도록 `src/tasks/Request2Background.kt`의 `loadContributorsBackground()` 함수를 수정하세요.

#### 과제 2 해결 방법 {initial-collapse-state="collapsed" collapsible="true" id="solution-for-task-2"}

기여자를 로드하려고 하면 로그에는 기여자가 로드된 것으로 나타나지만 결과는 표시되지 않습니다. 이를 수정하려면 결과 사용자 목록에 대해 `updateResults()`를 호출하세요:

```kotlin
thread {
    updateResults(loadContributorsBlocking(service, req))
}
```

콜백으로 전달된 로직을 명시적으로 호출해야 합니다. 그렇지 않으면 아무 일도 일어나지 않습니다.

### Retrofit 콜백 API 사용 {id="use-the-retrofit-callback-api"}

이전 해결책에서는 전체 로딩 로직을 백그라운드 스레드로 이동했지만, 여전히 자원을 최적으로 활용하지는 못합니다. 모든 로딩 요청이 순차적으로 진행되며, 스레드가 다른 작업을 처리할 수 있음에도 로딩 결과를 기다리는 동안 차단됩니다. 구체적으로 말하자면, 전체 결과를 더 일찍 받기 위해 스레드가 다른 요청의 로딩을 시작할 수도 있었습니다.

따라서 각 저장소의 데이터를 처리하는 작업은 로딩과 결과 응답 처리라는 두 부분으로 나누어야 합니다. 두 번째 _처리_ 부분은 콜백으로 추출해야 합니다.

그러면 이전 저장소에 대한 결과를 수신하기 전에(그리고 해당 콜백이 호출되기 전에) 각 저장소에 대한 로딩을 시작할 수 있습니다:

![콜백 API 사용](callbacks.png){width=700}

Retrofit 콜백 API가 이를 달성하는 데 도움이 될 수 있습니다. `Call.enqueue()` 함수는 HTTP 요청을 시작하고 콜백을 인수로 받습니다. 이 콜백에서 각 요청 후에 수행해야 할 작업을 지정합니다.

`src/tasks/Request3Callbacks.kt`를 열고 이 API를 사용하는 `loadContributorsCallbacks()`의 구현을 확인합니다:

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
        // TODO: 왜 이 코드가 작동하지 않을까요? 어떻게 수정해야 할까요?
        updateResults(allUsers.aggregate())
    }
```

* 편의를 위해 이 코드 조각은 동일한 파일에 선언된 `onResponse()` 확장 함수를 사용합니다. 이 함수는 객체 표현식 대신 람다를 인수로 받습니다.
* 응답을 처리하는 로직은 콜백으로 추출됩니다. 해당 람다는 `#1`과 `#2` 라인에서 시작합니다.

하지만 제공된 솔루션은 작동하지 않습니다. 프로그램을 실행하고 _CALLBACKS_ 옵션을 선택하여 기여자를 로드하면 아무것도 표시되지 않는 것을 볼 수 있습니다. 그러나 `Request3CallbacksKtTest`의 테스트는 즉시 성공적으로 통과했다는 결과를 반환합니다.

주어진 코드가 왜 예상대로 작동하지 않는지 생각해보고 수정해 보거나, 아래의 해결책을 확인하세요.

### 과제 3 (선택 사항) {id="task-3-optional"}

로드된 기여자 목록이 표시되도록 `src/tasks/Request3Callbacks.kt` 파일의 코드를 다시 작성하세요.

#### 과제 3에 대한 첫 번째 시도 {initial-collapse-state="collapsed" collapsible="true" id="the-first-attempted-solution-for-task-3"}

현재 솔루션에서는 많은 요청이 동시에 시작되어 전체 로딩 시간이 줄어듭니다. 그러나 결과가 로드되지 않습니다. 이는 `allUsers` 리스트가 데이터로 채워지기 전, 모든 로딩 요청이 시작된 직후에 `updateResults()` 콜백이 호출되기 때문입니다.

다음과 같이 변경하여 수정을 시도해 볼 수 있습니다:

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

* 먼저 인덱스와 함께 저장소 목록을 순회합니다(`#1`).
* 그런 다음 각 콜백에서 마지막 반복인지 확인합니다(`#2`).
* 마지막 반복인 경우 결과를 업데이트합니다.

그러나 이 코드 역시 우리의 목표를 달성하지 못합니다. 스스로 답을 찾아보거나 아래 해결책을 확인하세요.

#### 과제 3에 대한 두 번째 시도 {initial-collapse-state="collapsed" collapsible="true" id="the-second-attempted-solution-for-task-3"}

로딩 요청이 동시에 시작되기 때문에 마지막 요청의 결과가 마지막에 도착한다는 보장이 없습니다. 결과는 어떤 순서로든 올 수 있습니다.

따라서 완료 조건으로 현재 인덱스를 `lastIndex`와 비교하면 일부 저장소의 결과를 잃어버릴 위험이 있습니다.

마지막 저장소를 처리하는 요청이 이전 요청보다 빠르게 반환되면(충분히 발생할 수 있는 일입니다), 더 많은 시간이 걸리는 요청의 모든 결과가 손실됩니다.

이를 해결하는 한 가지 방법은 카운터를 도입하여 모든 저장소가 이미 처리되었는지 확인하는 것입니다:

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

이 코드는 동기화된 버전의 리스트와 `AtomicInteger()`를 사용합니다. 일반적으로 `getRepoContributors()` 요청을 처리하는 서로 다른 콜백이 항상 동일한 스레드에서 호출된다는 보장이 없기 때문입니다.

#### 과제 3에 대한 세 번째 시도 {initial-collapse-state="collapsed" collapsible="true" id="the-third-attempted-solution-for-task-3"}

더 나은 솔루션은 `CountDownLatch` 클래스를 사용하는 것입니다. 이 클래스는 저장소 수로 초기화된 카운터를 저장합니다. 이 카운터는 각 저장소를 처리한 후 감소합니다. 그런 다음 래치 카운트가 0으로 내려갈 때까지 기다린 후 결과를 업데이트합니다:

```kotlin
val countDownLatch = CountDownLatch(repos.size)
for (repo in repos) {
    service.getRepoContributorsCall(req.org, repo.name)
        .onResponse { responseUsers ->
            // 저장소 처리
            countDownLatch.countDown()
        }
}
countDownLatch.await()
updateResults(allUsers.aggregate())
```

그런 다음 메인 스레드에서 결과가 업데이트됩니다. 이는 자식 스레드에 로직을 위임하는 것보다 더 직접적입니다.

이 세 번의 시도를 검토해 보면 알 수 있듯이, 콜백을 사용하여 올바른 코드를 작성하는 것은 결코 간단하지 않으며 오류가 발생하기 쉽습니다. 특히 여러 기본 스레드와 동기화가 발생하는 경우에는 더욱 그렇습니다.

> 추가 연습으로 RxJava 라이브러리를 사용한 리액티브 접근 방식으로 동일한 로직을 구현해 볼 수 있습니다. RxJava를 사용하는 데 필요한 모든 의존성과 솔루션은 별도의 `rx` 브랜치에서 찾을 수 있습니다. 또한 이 튜토리얼을 완료한 후 적절한 비교를 위해 제안된 Rx 버전을 구현하거나 확인해 볼 수도 있습니다.
>
{style="tip"}

## 일시 중단 함수 {id="suspending-functions"}

일시 중단 함수(suspending functions)를 사용하여 동일한 로직을 구현할 수 있습니다. `Call<List<Repo>>`를 반환하는 대신 다음과 같이 API 호출을 [일시 중단 함수](composing-suspending-functions.md)로 정의합니다:

```kotlin
interface GitHubService {
    @GET("orgs/{org}/repos?per_page=100")
    suspend fun getOrgRepos(
        @Path("org") org: String
    ): List<Repo>
}
```

* `getOrgRepos()`는 `suspend` 함수로 정의됩니다. 일시 중단 함수를 사용하여 요청을 수행하면 기본 스레드가 차단되지 않습니다. 이것이 어떻게 작동하는지에 대한 자세한 내용은 이후 섹션에서 다룹니다.
* `getOrgRepos()`는 `Call`을 반환하는 대신 결과를 직접 반환합니다. 결과가 실패하면 예외가 발생합니다.

또는 Retrofit을 사용하면 결과를 `Response`로 감싸서 반환할 수도 있습니다. 이 경우 결과 body가 제공되며 오류를 수동으로 확인할 수 있습니다. 이 튜토리얼에서는 `Response`를 반환하는 버전을 사용합니다.

`src/contributors/GitHubService.kt`에서 `GitHubService` 인터페이스에 다음 선언을 추가합니다:

```kotlin
interface GitHubService {
    // getOrgReposCall 및 getRepoContributorsCall 선언

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

### 과제 4 {id="task-4"}

여러분의 과제는 두 개의 새로운 일시 중단 함수 `getOrgRepos()`와 `getRepoContributors()`를 사용하도록 기여자를 로드하는 함수의 코드를 변경하는 것입니다. 새로운 `loadContributorsSuspend()` 함수는 새 API를 사용하기 위해 `suspend`로 표시됩니다.

> 일시 중단 함수는 아무 곳에서나 호출할 수 없습니다. `loadContributorsBlocking()`에서 일시 중단 함수를 호출하면 "Suspend function 'getOrgRepos' should be called only from a coroutine or another suspend function"이라는 오류 메시지가 나타납니다.
>
{style="note"}

1. `src/tasks/Request1Blocking.kt`에 정의된 `loadContributorsBlocking()`의 구현을 `src/tasks/Request4Suspend.kt`에 정의된 `loadContributorsSuspend()`로 복사합니다.
2. `Call`을 반환하는 함수 대신 새로운 일시 중단 함수가 사용되도록 코드를 수정합니다.
3. _SUSPEND_ 옵션을 선택하여 프로그램을 실행하고 GitHub 요청이 수행되는 동안에도 UI가 반응성을 유지하는지 확인합니다.

#### 과제 4 해결 방법 {initial-collapse-state="collapsed" collapsible="true" id="solution-for-task-4"}

`.getOrgReposCall(req.org).execute()`를 `.getOrgRepos(req.org)`로 대체하고, 두 번째 "contributors" 요청에 대해서도 동일한 대체를 반복합니다:

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

* `loadContributorsSuspend()`는 `suspend` 함수로 정의되어야 합니다.
* 이제 API 함수가 `Response`를 직접 반환하므로, 이전에 `Response`를 반환했던 `execute`를 더 이상 호출할 필요가 없습니다. 이 세부 사항은 Retrofit 라이브러리에 국한된 것임을 참고하세요. 다른 라이브러리에서는 API가 다르겠지만 개념은 동일합니다.

## 코루틴 {id="coroutines"}

일시 중단 함수를 사용한 코드는 "블로킹" 버전과 유사해 보입니다. 블로킹 버전과의 가장 큰 차이점은 스레드를 차단하는 대신 코루틴이 일시 중단(suspend)된다는 점입니다:

```text
block -> suspend
thread -> coroutine
```

> 코루틴은 스레드에서 코드를 실행하는 것과 유사하게 코루틴에서 코드를 실행할 수 있기 때문에 흔히 경량 스레드(lightweight thread)라고 불립니다. 이전에 차단(blocking)을 유발했던(따라서 피해야 했던) 작업들이 이제는 대신 코루틴을 일시 중단시킬 수 있습니다.
>
{style="note"}

### 새 코루틴 시작 {id="starting-a-new-coroutine"}

`src/contributors/Contributors.kt`에서 `loadContributorsSuspend()`가 어떻게 사용되는지 살펴보면, `launch` 내부에서 호출되는 것을 볼 수 있습니다. `launch`는 람다를 인수로 받는 라이브러리 함수입니다:

```kotlin
launch {
    val users = loadContributorsSuspend(req)
    updateResults(users, startTime)
}
```

여기서 `launch`는 데이터 로드 및 결과 표시를 담당하는 새로운 연산을 시작합니다. 이 연산은 일시 중단 가능(suspendable)합니다. 즉, 네트워크 요청을 수행할 때 일시 중단되고 기본 스레드를 해제합니다. 네트워크 요청이 결과를 반환하면 연산이 재개(resume)됩니다.

이러한 일시 중단 가능한 연산을 _코루틴(coroutine)_이라고 합니다. 따라서 이 경우 `launch`는 데이터 로드와 결과 표시를 담당하는 _새로운 코루틴을 시작_합니다.

코루틴은 스레드 위에서 실행되며 일시 중단될 수 있습니다. 코루틴이 일시 중단되면 해당 연산은 일시 정지(pause)되어 스레드에서 제거되고 메모리에 저장됩니다. 그동안 스레드는 자유로워져 다른 작업을 처리할 수 있습니다:

![코루틴 일시 중단](suspension-process.gif){width=700}

연산이 계속 진행될 준비가 되면, 스레드(반드시 이전과 동일한 스레드일 필요는 없음)로 돌아옵니다.

`loadContributorsSuspend()` 예제에서 각 "contributors" 요청은 이제 일시 중단 메커니즘을 사용하여 결과를 기다립니다. 먼저 새 요청이 전송됩니다. 그런 다음 응답을 기다리는 동안 `launch` 함수에 의해 시작된 전체 "load contributors" 코루틴이 일시 중단됩니다.

코루틴은 해당 응답을 수신한 후에만 재개됩니다:

![요청 일시 중단](suspend-requests.png){width=700}

응답 수신을 기다리는 동안 스레드는 자유로워져 다른 작업을 처리할 수 있습니다. 메인 UI 스레드에서 모든 요청이 이루어짐에도 불구하고 UI는 반응성을 유지합니다:

1. _SUSPEND_ 옵션을 사용하여 프로그램을 실행합니다. 로그를 통해 모든 요청이 메인 UI 스레드에서 전송되었음을 확인할 수 있습니다:

    ```text
    2538 [AWT-EventQueue-0 @coroutine#1] INFO  Contributors - kotlin: loaded 30 repos
    2729 [AWT-EventQueue-0 @coroutine#1] INFO  Contributors - ts2kt: loaded 11 contributors
    3029 [AWT-EventQueue-0 @coroutine#1] INFO  Contributors - kotlin-koans: loaded 45 contributors
    ...
    11252 [AWT-EventQueue-0 @coroutine#1] INFO  Contributors - kotlin-coroutines-workshop: loaded 1 contributors
    ```

2. 로그를 통해 해당 코드가 어느 코루틴에서 실행 중인지 확인할 수 있습니다. 이를 활성화하려면 **Run | Edit configurations**를 열고 `-Dkotlinx.coroutines.debug` VM 옵션을 추가하세요:

   ![실행 구성 편집](run-configuration.png){width=500}

   이 옵션을 사용하여 `main()`을 실행하면 스레드 이름에 코루틴 이름이 붙습니다. 모든 Kotlin 파일을 실행하기 위한 템플릿을 수정하여 이 옵션을 기본적으로 활성화할 수도 있습니다.

이제 모든 코드는 `@coroutine#1`로 표시된 위에서 언급한 하나의 코루틴("load contributors" 코루틴)에서 실행됩니다. 코드가 순차적으로 작성되어 있기 때문에 결과를 기다리는 동안 스레드를 다른 요청을 보내는 데 재사용해서는 안 됩니다. 새 요청은 이전 결과를 수신한 후에만 전송됩니다.

일시 중단 함수는 스레드를 공평하게 대우하며 "대기"를 위해 스레드를 차단하지 않습니다. 그러나 이것만으로는 아직 동시성(concurrency)이 도입되지 않았습니다.

## 동시성 {id="concurrency"}

Kotlin 코루틴은 스레드보다 훨씬 적은 자원을 소모합니다.
새로운 연산을 비동기식으로 시작하고 싶을 때마다 새 스레드 대신 새 코루틴을 생성할 수 있습니다.

새 코루틴을 시작하려면 주요 _코루틴 빌더(coroutine builders)_ 중 하나인 `launch`, `async`, 또는 `runBlocking`을 사용합니다. 라이브러리에 따라 추가적인 코루틴 빌더를 정의할 수도 있습니다.

`async`는 새 코루틴을 시작하고 `Deferred` 객체를 반환합니다. `Deferred`는 `Future` 또는 `Promise`와 같은 다른 이름으로 알려진 개념을 나타냅니다. 이것은 연산을 저장하지만 최종 결과를 얻는 시점을 _지연(defers)_시키며, _미래(future)_의 어느 시점에 결과를 제공할 것을 _약속(promises)_합니다.

`async`와 `launch`의 주요 차이점은 `launch`가 특정 결과를 반환할 것으로 기대되지 않는 연산을 시작하는 데 사용된다는 것입니다. `launch`는 코루틴을 나타내는 `Job`을 반환합니다. `Job.join()`을 호출하여 완료될 때까지 대기할 수 있습니다.

`Deferred`는 `Job`을 확장하는 제네릭 타입입니다. `async` 호출은 람다가 무엇을 반환하느냐에 따라 `Deferred<Int>` 또는 `Deferred<CustomType>`을 반환할 수 있습니다(람다 내부의 마지막 표현식이 결과가 됨).

코루틴의 결과를 가져오려면 `Deferred` 인스턴스에서 `await()`를 호출하면 됩니다. 결과를 기다리는 동안 이 `await()`가 호출된 코루틴은 일시 중단됩니다:

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

`runBlocking`은 일반 함수와 일시 중단 함수 사이, 또는 블로킹 세계와 넌블로킹 세계 사이의 다리 역할을 합니다. 최상위 메인 코루틴을 시작하기 위한 어댑터로 작동합니다. 주로 `main()` 함수와 테스트에서 사용하도록 설계되었습니다.

> 코루틴을 더 잘 이해하려면 [이 동영상](https://www.youtube.com/watch?v=zEZc5AmHQhk)을 시청하세요.
>
{style="tip"}

지연 객체(deferred object)들의 리스트가 있다면 `awaitAll()`을 호출하여 모든 객체의 결과를 기다릴 수 있습니다:

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

각 "contributors" 요청이 새 코루틴에서 시작되면 모든 요청이 비동기적으로 시작됩니다. 이전 요청의 결과를 받기 전에 새 요청을 보낼 수 있습니다:

![동시 실행 코루틴](concurrency.png){width=700}

전체 로딩 시간은 _CALLBACKS_ 버전과 거의 동일하지만, 콜백이 전혀 필요하지 않습니다. 게다가 `async`는 코드에서 어느 부분이 동시에 실행되는지를 명시적으로 강조해 줍니다.

### 과제 5 {id="task-5"}

`Request5Concurrent.kt` 파일에서 이전의 `loadContributorsSuspend()` 함수를 활용하여 `loadContributorsConcurrent()` 함수를 구현하세요.

#### 과제 5를 위한 힌트 {initial-collapse-state="collapsed" collapsible="true" id="tip-for-task-5"}

새 코루틴은 코루틴 스코프 내부에서만 시작할 수 있습니다. `async` 함수를 호출할 수 있도록 `loadContributorsSuspend()`의 내용을 `coroutineScope` 호출 내부로 복사하세요:

```kotlin
suspend fun loadContributorsConcurrent(
    service: GitHubService,
    req: RequestData
): List<User> = coroutineScope {
    // ...
}
```

다음 구조를 기반으로 해결책을 작성하세요:

```kotlin
val deferreds: List<Deferred<List<User>>> = repos.map { repo ->
    async {
        // 각 저장소에 대한 기여자 로드
    }
}
deferreds.awaitAll() // List<List<User>>
```

#### 과제 5 해결 방법 {initial-collapse-state="collapsed" collapsible="true" id="solution-for-task-5"}

각 "contributors" 요청을 `async`로 감싸서 저장소 수만큼의 코루틴을 생성합니다. `async`는 `Deferred<List<User>>`를 반환합니다. 새 코루틴을 생성하는 것은 자원을 많이 소모하지 않으므로 필요한 만큼 생성해도 문제가 되지 않습니다.

1. `map` 결과가 이제 리스트의 리스트가 아니라 `Deferred` 객체의 리스트이므로 더 이상 `flatMap`을 사용할 수 없습니다. `awaitAll()`은 `List<List<User>>`를 반환하므로 `flatten().aggregate()`를 호출하여 결과를 얻습니다:

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

2. 코드를 실행하고 로그를 확인합니다. 아직 멀티스레딩이 적용되지 않았기 때문에 모든 코루틴이 여전히 메인 UI 스레드에서 실행되지만, 코루틴을 동시에 실행함으로써 얻는 이점을 이미 확인할 수 있습니다.
3. 공통 스레드 풀의 다른 스레드에서 "contributors" 코루틴을 실행하도록 이 코드를 변경하려면 `async` 함수의 컨텍스트 인수로 `Dispatchers.Default`를 지정합니다:

    ```kotlin
    async(Dispatchers.Default) { }
    ```

    * `CoroutineDispatcher`는 해당 코루틴이 어떤 스레드 또는 스레드들에서 실행되어야 하는지 결정합니다. 인수로 지정하지 않으면 `async`는 외부 스코프의 디스패처를 사용합니다.
    * `Dispatchers.Default`는 JVM의 공유 스레드 풀을 나타냅니다. 이 풀은 병렬 실행을 위한 수단을 제공합니다. 사용 가능한 CPU 코어 수만큼의 스레드로 구성되지만 코어가 하나뿐인 경우에도 2개의 스레드를 갖습니다.

4. 공통 스레드 풀의 다른 스레드에서 새 코루틴을 시작하도록 `loadContributorsConcurrent()` 함수의 코드를 수정합니다. 또한 요청을 보내기 전에 추가 로깅을 추가합니다:

    ```kotlin
    async(Dispatchers.Default) {
        log("starting loading for ${repo.name}")
        service.getRepoContributors(req.org, repo.name)
            .also { logUsers(repo, it) }
            .bodyList()
    }
    ```

5. 프로그램을 다시 실행합니다. 로그에서 각 코루틴이 스레드 풀의 한 스레드에서 시작되고 다른 스레드에서 재개될 수 있음을 확인할 수 있습니다:

    ```text
    1946 [DefaultDispatcher-worker-2 @coroutine#4] INFO  Contributors - starting loading for kotlin-koans
    1946 [DefaultDispatcher-worker-3 @coroutine#5] INFO  Contributors - starting loading for dokka
    1946 [DefaultDispatcher-worker-1 @coroutine#3] INFO  Contributors - starting loading for ts2kt
    ...
    2178 [DefaultDispatcher-worker-1 @coroutine#4] INFO  Contributors - kotlin-koans: loaded 45 contributors
    2569 [DefaultDispatcher-worker-1 @coroutine#5] INFO  Contributors - dokka: loaded 36 contributors
    2821 [DefaultDispatcher-worker-2 @coroutine#3] INFO  Contributors - ts2kt: loaded 11 contributors
    ```

   예를 들어, 이 로그 발췌문에서 `coroutine#4`는 `worker-2` 스레드에서 시작되어 `worker-1` 스레드에서 계속되었습니다.

`src/contributors/Contributors.kt`에서 _CONCURRENT_ 옵션의 구현을 확인합니다:

1. 메인 UI 스레드에서만 코루틴을 실행하려면 `Dispatchers.Main`을 인수로 지정합니다:

    ```kotlin
    launch(Dispatchers.Main) {
        updateResults()
    }
    ```

    * 메인 스레드에서 새 코루틴을 시작할 때 메인 스레드가 바쁘면 코루틴은 일시 중단되고 이 스레드에서 실행되도록 스케줄링됩니다. 코루틴은 스레드가 한가해질 때만 재개됩니다.
    * 각 엔드포인트에서 디스패처를 명시적으로 지정하기보다는 외부 스코프의 디스패처를 사용하는 것이 좋은 관행으로 간주됩니다. `loadContributorsConcurrent()`를 `Dispatchers.Default`를 인수로 전달하지 않고 정의하면, `Default` 디스패처, 메인 UI 스레드, 또는 커스텀 디스패처 등 어떤 컨텍스트에서든 이 함수를 호출할 수 있습니다.
    * 나중에 살펴보겠지만 테스트에서 `loadContributorsConcurrent()`를 호출할 때 `TestDispatcher`가 있는 컨텍스트에서 호출할 수 있어 테스트가 단순해집니다. 이를 통해 이 솔루션은 훨씬 더 유연해집니다.

2. `loadContributorsConcurrent`가 상속된 컨텍스트에서 코루틴을 시작할 수 있도록 유지하면서 호출자 측에서 디스패처를 지정하려면 프로젝트에 다음과 같은 변경 사항을 적용합니다:

    ```kotlin
    launch(Dispatchers.Default) {
        val users = loadContributorsConcurrent(service, req)
        withContext(Dispatchers.Main) {
            updateResults(users, startTime)
        }
    }
    ```

    * `updateResults()`는 메인 UI 스레드에서 호출되어야 하므로 `Dispatchers.Main` 컨텍스트로 호출합니다.
    * `withContext()`는 지정된 코루틴 컨텍스트로 주어진 코드를 호출하고, 완료될 때까지 일시 중단되며 결과를 반환합니다. 이를 표현하는 또 다른 방법(더 장황하긴 하지만)은 새 코루틴을 시작하고 완료될 때까지 명시적으로 대기(일시 중단)하는 것입니다: `launch(context) { ... }.join()`.

3. 코드를 실행하고 코루틴이 스레드 풀의 스레드에서 실행되는지 확인합니다.

## 구조화된 동시성 {id="structured-concurrency"}

* _코루틴 스코프(coroutine scope)_는 서로 다른 코루틴 간의 구조 및 부모-자식 관계를 담당합니다. 새 코루틴은 대개 스코프 내부에서 시작되어야 합니다.
* _코루틴 컨텍스트(coroutine context)_는 사용자 정의 코루틴 이름이나 코루틴이 스케줄링되어야 하는 스레드를 지정하는 디스패처와 같이 주어진 코루틴을 실행하는 데 사용되는 추가적인 기술 정보를 저장합니다.

`launch`, `async`, 또는 `runBlocking`을 사용하여 새 코루틴을 시작하면 해당하는 스코프가 자동으로 생성됩니다. 이 모든 함수는 수신 객체가 있는 람다(lambda with receiver)를 인수로 받으며, `CoroutineScope`가 암시적 수신 객체 타입입니다:

```kotlin
launch { /* this: CoroutineScope */ }
```

* 새 코루틴은 스코프 내부에서만 시작할 수 있습니다.
* `launch`와 `async`는 `CoroutineScope`의 확장 함수로 선언되어 있으므로, 이를 호출할 때는 항상 암시적 또는 명시적 수신 객체를 전달해야 합니다.
* `runBlocking`에 의해 시작된 코루틴만 예외인데, `runBlocking`은 최상위 함수로 정의되어 있기 때문입니다. 그러나 현재 스레드를 차단하므로 가교(bridge) 함수로서 주로 `main()` 함수와 테스트에서 사용하도록 의도되었습니다.

`runBlocking`, `launch`, 또는 `async` 내부의 새 코루틴은 스코프 내부에서 자동으로 시작됩니다:

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking { /* this: CoroutineScope */
    launch { /* ... */ }
    // 다음과 동일:   
    this.launch { /* ... */ }
}
```

`runBlocking` 내부에서 `launch`를 호출하면 `CoroutineScope` 타입의 암시적 수신 객체에 대한 확장 함수로 호출됩니다. 또는 명시적으로 `this.launch`를 작성할 수도 있습니다.

중첩된 코루틴(이 예제에서는 `launch`로 시작됨)은 외부 코루틴(`runBlocking`으로 시작됨)의 자식으로 간주될 수 있습니다. 이 "부모-자식" 관계는 스코프를 통해 작동하며, 자식 코루틴은 부모 코루틴에 해당하는 스코프에서 시작됩니다.

`coroutineScope` 함수를 사용하면 새 코루틴을 시작하지 않고도 새 스코프를 생성할 수 있습니다. 외부 스코프에 대한 접근 권한 없이 `suspend` 함수 내부에서 구조화된 방식으로 새 코루틴을 시작하려면, 이 `suspend` 함수가 호출된 외부 스코프의 자식이 되는 새 코루틴 스코프를 자동으로 생성할 수 있습니다. `loadContributorsConcurrent()`가 좋은 예입니다.

`GlobalScope.async` 또는 `GlobalScope.launch`를 사용하여 전역 스코프에서 새 코루틴을 시작할 수도 있습니다. 이렇게 하면 최상위 "독립적인" 코루틴이 생성됩니다.

코루틴의 구조 뒤에 있는 메커니즘을 _구조화된 동시성(structured concurrency)_이라고 합니다. 이는 글로벌 스코프에 비해 다음과 같은 이점을 제공합니다:

* 스코프는 일반적으로 자식 코루틴들을 책임지며, 자식 코루틴의 수명은 스코프의 수명에 연결됩니다.
* 스코프는 문제가 발생하거나 사용자가 마음을 바꿔 작업을 취소하기로 결정한 경우 자식 코루틴을 자동으로 취소할 수 있습니다.
* 스코프는 모든 자식 코루틴의 완료를 자동으로 기다립니다. 따라서 스코프가 특정 코루틴에 해당하는 경우, 부모 코루틴은 해당 스코프에서 실행된 모든 코루틴이 완료될 때까지 완료되지 않습니다.

`GlobalScope.async`를 사용할 때는 여러 코루틴을 더 작은 스코프로 묶는 구조가 없습니다. 전역 스코프에서 시작된 코루틴은 모두 독립적이며, 이들의 수명은 전체 애플리케이션의 수명에 의해서만 제한됩니다. 전역 스코프에서 시작된 코루틴에 대한 참조를 저장하고 완료를 기다리거나 명시적으로 취소하는 것은 가능하지만, 구조화된 동시성처럼 자동으로 이루어지지는 않습니다.

### 기여자 로딩 취소 {id="canceling-the-loading-of-contributors"}

기여자 목록을 로드하는 함수의 두 가지 버전을 만들어 봅니다. 부모 코루틴을 취소하려고 할 때 두 버전이 어떻게 작동하는지 비교해 보세요. 첫 번째 버전은 모든 자식 코루틴을 시작하기 위해 `coroutineScope`를 사용하고, 두 번째 버전은 `GlobalScope`를 사용합니다.

1. `Request5Concurrent.kt`에서 `loadContributorsConcurrent()` 함수에 3초 지연을 추가합니다: 

   ```kotlin
   suspend fun loadContributorsConcurrent(
       service: GitHubService, 
       req: RequestData
   ): List<User> = coroutineScope {
       // ...
       async {
           log("starting loading for ${repo.name}")
           delay(3000)
           // 저장소 기여자 로드
       }
       // ...
   }
   ```
   
   이 지연은 요청을 보내는 모든 코루틴에 영향을 미치므로, 코루틴이 시작된 후 요청이 전송되기 전에 로딩을 취소할 수 있는 충분한 시간이 확보됩니다.

2. 로딩 함수의 두 번째 버전을 만듭니다: `loadContributorsConcurrent()`의 구현을 `Request5NotCancellable.kt`의 `loadContributorsNotCancellable()`에 복사한 다음 새 `coroutineScope` 생성을 제거합니다.
3. 이제 `async` 호출을 해석할 수 없으므로 `GlobalScope.async`를 사용하여 시작합니다:

    ```kotlin
    suspend fun loadContributorsNotCancellable(
        service: GitHubService,
        req: RequestData
    ): List<User> {   // #1
        // ...
        GlobalScope.async {   // #2
            log("starting loading for ${repo.name}")
            // 저장소 기여자 로드
        }
        // ...
        return deferreds.awaitAll().flatten().aggregate()  // #3
    }
    ```

    * 이 함수는 이제 람다 내부의 마지막 표현식이 아니라 결과를 직접 반환합니다(라인 `#1` 및 `#3`).
    * 모든 "contributors" 코루틴은 코루틴 스코프의 자식이 아니라 `GlobalScope` 내부에서 시작됩니다(라인 `#2`).

4. 프로그램을 실행하고 기여자를 로드하기 위해 _CONCURRENT_ 옵션을 선택합니다.
5. 모든 "contributors" 코루틴이 시작될 때까지 기다린 다음 _Cancel_을 클릭합니다. 로그에 새로운 결과가 표시되지 않으며, 이는 모든 요청이 실제로 취소되었음을 의미합니다:

    ```text
    2896 [AWT-EventQueue-0 @coroutine#1] INFO  Contributors - kotlin: loaded 40 repos
    2901 [DefaultDispatcher-worker-2 @coroutine#4] INFO  Contributors - starting loading for kotlin-koans
    ...
    2909 [DefaultDispatcher-worker-5 @coroutine#36] INFO  Contributors - starting loading for mpp-example
    /* 'cancel' 클릭 */
    /* 어떤 요청도 전송되지 않음 */
    ```

6. 5단계를 반복하되, 이번에는 `NOT_CANCELLABLE` 옵션을 선택합니다:

    ```text
    2570 [AWT-EventQueue-0 @coroutine#1] INFO  Contributors - kotlin: loaded 30 repos
    2579 [DefaultDispatcher-worker-1 @coroutine#4] INFO  Contributors - starting loading for kotlin-koans
    ...
    2586 [DefaultDispatcher-worker-6 @coroutine#36] INFO  Contributors - starting loading for mpp-example
    /* 'cancel' 클릭 */
    /* 그러나 모든 요청이 여전히 전송됨: */
    6402 [DefaultDispatcher-worker-5 @coroutine#4] INFO  Contributors - kotlin-koans: loaded 45 contributors
    ...
    9555 [DefaultDispatcher-worker-8 @coroutine#36] INFO  Contributors - mpp-example: loaded 8 contributors
    ```

    이 경우에는 어떤 코루틴도 취소되지 않으며 모든 요청이 여전히 전송됩니다.

7. "contributors" 프로그램에서 취소가 어떻게 트리거되는지 확인합니다. _Cancel_ 버튼을 클릭하면 메인 "로딩" 코루틴이 명시적으로 취소되고 자식 코루틴은 자동으로 취소됩니다:

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
    
            // 'cancel' 버튼이 클릭되면 로딩 잡 취소:
            val listener = ActionListener {
                loadingJob.cancel()            // #3
                updateLoadingStatus(CANCELED)
            }
            // 'cancel' 버튼에 리스너 추가:
            addCancelListener(listener)
    
            // 로딩 잡이 완료된 후
            // 상태를 업데이트하고 리스너 제거
        }
    }   
    ```

`launch` 함수는 `Job` 인스턴스를 반환합니다. `Job`은 모든 데이터를 로드하고 결과를 업데이트하는 "로딩 코루틴"에 대한 참조를 저장합니다. 여기에 `Job` 인스턴스를 수신 객체로 전달하여 `setUpCancellation()` 확장 함수를 호출할 수 있습니다(라인 `#1`).

이를 표현하는 또 다른 방법은 명시적으로 다음과 같이 작성하는 것입니다:

```kotlin
val job = launch { }
job.setUpCancellation()
```

* 가독성을 위해 함수 내부에서 `setUpCancellation()` 함수 수신 객체를 새로운 `loadingJob` 변수로 참조할 수 있습니다(라인 `#2`).
* 그런 다음 클릭 시 `loadingJob`이 취소되도록 _Cancel_ 버튼에 리스너를 추가할 수 있습니다(라인 `#3`).

구조화된 동시성을 사용하면 부모 코루틴만 취소하면 되며, 이는 모든 자식 코루틴으로 취소를 자동으로 전파합니다.

### 외부 스코프의 컨텍스트 사용 {id="using-the-outer-scope-s-context"}

주어진 스코프 내에서 새 코루틴을 시작하면 모든 코루틴이 동일한 컨텍스트에서 실행되도록 보장하기가 훨씬 쉽습니다. 또한 필요한 경우 컨텍스트를 교체하기도 훨씬 수월합니다.

이제 외부 스코프의 디스패처를 사용하는 방식이 어떻게 작동하는지 알아볼 차례입니다. `coroutineScope` 또는 코루틴 빌더에 의해 생성된 새 스코프는 항상 외부 스코프에서 컨텍스트를 상속받습니다. 이 경우 외부 스코프는 `suspend loadContributorsConcurrent()` 함수가 호출된 스코프입니다:

```kotlin
launch(Dispatchers.Default) {  // 외부 스코프
    val users = loadContributorsConcurrent(service, req)
    // ...
}
```

모든 중첩된 코루틴은 상속된 컨텍스트로 자동 시작됩니다. 디스패처는 이 컨텍스트의 일부입니다. 그렇기 때문에 `async`로 시작된 모든 코루틴은 기본 디스패처의 컨텍스트로 시작됩니다:

```kotlin
suspend fun loadContributorsConcurrent(
    service: GitHubService, req: RequestData
): List<User> = coroutineScope {
    // 이 스코프는 외부 스코프에서 컨텍스트를 상속받음
    // ...
    async {   // 상속된 컨텍스트로 시작된 중첩 코루틴
        // ...
    }
    // ...
}
```

구조화된 동시성을 사용하면 최상위 코루틴을 생성할 때 주요 컨텍스트 요소(예: 디스패처)를 한 번만 지정할 수 있습니다. 그러면 모든 중첩된 코루틴이 컨텍스트를 상속받고 필요한 경우에만 수정합니다.

> 안드로이드와 같은 UI 애플리케이션용 코루틴 코드를 작성할 때는 최상위 코루틴에 기본적으로 `CoroutineDispatchers.Main`을 사용하고, 다른 스레드에서 코드를 실행해야 할 때 명시적으로 다른 디스패처를 지정하는 것이 일반적인 관행입니다.
>
{style="tip"}

## 진행 상황 표시 {id="showing-progress"}

일부 저장소의 정보가 상당히 빨리 로드됨에도 불구하고 사용자는 모든 데이터가 로드된 후에만 결과 목록을 보게 됩니다. 그때까지는 로더 아이콘이 진행 상황을 표시하며 돌아가지만, 현재 상태나 어떤 기여자가 이미 로드되었는지에 대한 정보는 없습니다.

중간 결과를 더 일찍 표시하고 각 저장소의 데이터를 로드한 후 모든 기여자를 표시할 수 있습니다:

![데이터 로딩](loading.gif){width=500}

이 기능을 구현하려면 `src/tasks/Request6Progress.kt`에서 UI를 업데이트하는 로직을 콜백으로 전달하여 각 중간 상태마다 호출되도록 해야 합니다:

```kotlin
suspend fun loadContributorsProgress(
    service: GitHubService,
    req: RequestData,
    updateResults: suspend (List<User>, completed: Boolean) -> Unit
) {
    // 데이터 로딩
    // 중간 상태에서 `updateResults()` 호출
}
```

`Contributors.kt`의 호출 측에서는 _PROGRESS_ 옵션을 위해 `Main` 스레드에서 결과를 업데이트하는 콜백이 전달됩니다:

```kotlin
launch(Dispatchers.Default) {
    loadContributorsProgress(service, req) { users, completed ->
        withContext(Dispatchers.Main) {
            updateResults(users, startTime, completed)
        }
    }
}
```

* `updateResults()` 매개변수는 `loadContributorsProgress()`에서 `suspend`로 선언됩니다. 해당 람다 인수 내부에서 `suspend` 함수인 `withContext`를 호출해야 하기 때문입니다.
* `updateResults()` 콜백은 로딩이 완료되었는지와 결과가 최종적인지 여부를 지정하는 추가적인 Boolean 매개변수를 인수로 받습니다.

### 과제 6 {id="task-6"}

`Request6Progress.kt` 파일에서 중간 진행 상황을 보여주는 `loadContributorsProgress()` 함수를 구현하세요. `Request4Suspend.kt`의 `loadContributorsSuspend()` 함수를 기반으로 작성합니다.

* 동시성이 없는 간단한 버전을 사용하세요. 동시성은 다음 섹션에서 추가할 예정입니다.
* 중간 기여자 목록은 각 저장소마다 로드된 사용자 목록만 보여주는 것이 아니라 "집계된(aggregated)" 상태로 표시되어야 합니다.
* 각 새 저장소의 데이터가 로드될 때마다 각 사용자의 총 기여 횟수가 증가해야 합니다.

#### 과제 6 해결 방법 {initial-collapse-state="collapsed" collapsible="true" id="solution-for-task-6"}

로드된 기여자의 중간 목록을 "집계된" 상태로 저장하려면 사용자 목록을 저장하는 `allUsers` 변수를 정의하고, 각 새 저장소의 기여자가 로드된 후 이를 업데이트합니다:

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

#### 순차 실행 vs 동시 실행 {id="consecutive-vs-concurrent"}

각 요청이 완료된 후 `updateResults()` 콜백이 호출됩니다:

![요청 진행 상황](progress.png){width=700}

이 코드에는 동시성이 포함되어 있지 않습니다. 순차적이므로 동기화가 필요하지 않습니다.

가장 좋은 옵션은 요청을 동시에 보내고 각 저장소에 대한 응답을 받은 후 중간 결과를 업데이트하는 것입니다:

![동시 요청](progress-and-concurrency.png){width=700}

동시성을 추가하려면 _채널(channels)_을 사용합니다.

## 채널 {id="channels"}

공유 가변 상태(shared mutable state)를 다루는 코드를 작성하는 것은 꽤 어렵고 오류가 발생하기 쉽습니다(콜백을 사용한 솔루션에서 보았듯이). 더 간단한 방법은 공통 가변 상태를 사용하는 대신 통신을 통해 정보를 공유하는 것입니다. 코루틴은 _채널_을 통해 서로 통신할 수 있습니다.

채널은 코루틴 간에 데이터를 전달할 수 있게 해주는 통신 기본 요소(communication primitive)입니다. 한 코루틴이 채널로 정보를 _전송(send)_하면, 다른 코루틴이 그 채널로부터 정보를 _수신(receive)_할 수 있습니다:

![채널 사용](using-channel.png)

정보를 전송(생산)하는 코루틴을 생산자(producer)라고 부르고, 정보를 수신(소비)하는 코루틴을 소비자(consumer)라고 부릅니다. 하나 또는 여러 코루틴이 동일한 채널로 정보를 보낼 수 있으며, 하나 또는 여러 코루틴이 그 채널에서 데이터를 수신할 수 있습니다:

![여러 코루틴과 채널 사용](using-channel-many-coroutines.png)

여러 코루틴이 동일한 채널에서 정보를 수신할 때, 각 요소는 소비자 중 하나에 의해서만 한 번 처리됩니다. 요소가 처리되면 채널에서 즉시 제거됩니다.

채널은 요소들의 컬렉션, 더 정확히는 한쪽 끝에서 요소가 추가되고 다른 쪽 끝에서 수신되는 큐(queue)와 유사하다고 생각할 수 있습니다. 그러나 중요한 차이점이 있습니다. 컬렉션(동기화된 버전 포함)과 달리 채널은 `send()` 및 `receive()` 작업을 _일시 중단(suspend)_할 수 있습니다. 이는 채널이 비어 있거나 가득 찼을 때 발생합니다. 채널 크기에 상한이 있는 경우 채널이 가득 찰 수 있습니다.

`Channel`은 `SendChannel`, `ReceiveChannel`, 그리고 앞의 두 인터페이스를 확장하는 `Channel`이라는 세 가지 인터페이스로 표현됩니다. 보통 채널을 생성한 후 생산자에게는 `SendChannel` 인스턴스로 전달하여 오직 채널로 정보를 보낼 수만 있게 합니다. 소비자에게는 `ReceiveChannel` 인스턴스로 전달하여 오직 수신만 할 수 있게 합니다. `send`와 `receive` 메서드는 모두 `suspend`로 선언되어 있습니다:

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

생산자는 채널을 닫아 더 이상 요소가 오지 않음을 알릴 수 있습니다.

라이브러리에는 여러 유형의 채널이 정의되어 있습니다. 이들은 내부적으로 저장할 수 있는 요소의 수와 `send()` 호출이 일시 중단될 수 있는지 여부에서 차이가 납니다. 모든 채널 유형에 대해 `receive()` 호출은 유사하게 동작합니다. 채널이 비어 있지 않으면 요소를 수신하고, 그렇지 않으면 일시 중단됩니다.

<deflist collapsible="true">
   <def title="무제한 채널 (Unlimited channel)" id="unlimited-channel">
       <p>무제한 채널은 큐와 가장 유사합니다. 생산자가 이 채널로 요소를 보낼 수 있으며 채널은 무기한으로 계속 커집니다. <code>send()</code> 호출은 결코 일시 중단되지 않습니다. 프로그램에 메모리가 부족해지면 <code>OutOfMemoryException</code>이 발생합니다. 무제한 채널과 큐의 차이점은 소비자가 빈 채널에서 요소를 수신하려고 시도하면 새 요소가 전송될 때까지 일시 중단된다는 점입니다.</p>
       <img src="unlimited-channel.png" alt="무제한 채널" width="500"/>
   </def>
   <def title="버퍼 채널 (Buffered channel)" id="buffered-channel">
       <p>버퍼 채널의 크기는 지정된 숫자로 제한됩니다. 생산자는 크기 제한에 도달할 때까지 이 채널로 요소를 보낼 수 있습니다. 모든 요소는 내부에 저장됩니다. 채널이 가득 차면 빈 공간이 생길 때까지 다음 <code>send()</code> 호출이 일시 중단됩니다.</p>
       <img src="buffered-channel.png" alt="버퍼 채널" width="500"/>
   </def>
   <def title="랑데부 채널 (Rendezvous channel)" id="rendezvous-channel">
       <p>"랑데부(Rendezvous)" 채널은 버퍼가 없는 채널로, 크기가 0인 버퍼 채널과 동일합니다. 함수 중 하나(<code>send()</code> 또는 <code>receive()</code>)는 다른 함수가 호출될 때까지 항상 일시 중단됩니다.</p>
       <p><code>send()</code> 함수가 호출되었는데 요소를 처리할 준비가 된 일시 중단된 <code>receive()</code> 호출이 없다면 <code>send()</code>가 일시 중단됩니다. 마찬가지로 <code>receive()</code> 함수가 호출되었는데 채널이 비어 있다면(즉, 요소를 보낼 준비가 된 일시 중단된 <code>send()</code> 호출이 없다면) <code>receive()</code> 호출이 일시 중단됩니다.</p>
       <p>"랑데부(rendezvous)"라는 이름("약속된 시간과 장소에서의 만남")은 <code>send()</code>와 <code>receive()</code>가 "제시간에 만나야 한다"는 사실을 나타냅니다.</p>
       <img src="rendezvous-channel.png" alt="랑데부 채널" width="500"/>
   </def>
   <def title="합류 채널 (Conflated channel)" id="conflated-channel">
       <p>합류(conflated) 채널로 전송된 새 요소는 이전에 전송된 요소를 덮어쓰므로 수신자는 항상 최신 요소만 받게 됩니다. <code>send()</code> 호출은 결코 일시 중단되지 않습니다.</p>
       <img src="conflated-channel.gif" alt="합류 채널" width="500"/>
   </def>
</deflist>

채널을 생성할 때 해당 유형이나 버퍼 크기(버퍼 채널이 필요한 경우)를 지정합니다:

```kotlin
val rendezvousChannel = Channel<String>()
val bufferedChannel = Channel<String>(10)
val conflatedChannel = Channel<String>(CONFLATED)
val unlimitedChannel = Channel<String>(UNLIMITED)
```

기본적으로는 "랑데부" 채널이 생성됩니다.

다음 과제에서는 "랑데부" 채널 하나와 두 개의 생산자 코루틴, 그리고 하나의 소비자 코루틴을 생성합니다:

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

> 채널을 더 잘 이해하려면 [이 동영상](https://www.youtube.com/watch?v=HpWQUoVURWQ)을 시청하세요.
>
{style="tip"}

### 과제 7 {id="task-7"}

`src/tasks/Request7Channels.kt`에서 모든 GitHub 기여자를 동시에 요청하는 동시에 중간 진행 상황을 보여주는 함수 `loadContributorsChannels()`를 구현하세요.

`Request5Concurrent.kt`의 `loadContributorsConcurrent()`와 `Request6Progress.kt`의 `loadContributorsProgress()` 함수를 활용하세요.

#### 과제 7을 위한 힌트 {initial-collapse-state="collapsed" collapsible="true" id="tip-for-task-7"}

서로 다른 저장소에 대한 기여자 목록을 동시에 수신하는 여러 코루틴이 수신된 모든 결과를 동일한 채널로 보낼 수 있습니다:

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

그런 다음 이 채널의 요소들을 하나씩 받아 처리할 수 있습니다:

```kotlin
repeat(repos.size) {
    val users = channel.receive()
    // ...
}
```

`receive()` 호출이 순차적이므로 추가적인 동기화가 필요하지 않습니다.

#### 과제 7 해결 방법 {initial-collapse-state="collapsed" collapsible="true" id="solution-for-task-7"}

`loadContributorsProgress()` 함수와 마찬가지로 "전체 기여자" 목록의 중간 상태를 저장할 `allUsers` 변수를 생성할 수 있습니다.
채널에서 수신된 각각의 새 목록이 전체 사용자 목록에 추가됩니다. 결과를 집계하고 `updateResults` 콜백을 사용하여 상태를 업데이트합니다:

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

* 서로 다른 저장소에 대한 결과는 준비되는 즉시 채널에 추가됩니다. 처음에는 모든 요청이 전송되고 데이터가 수신되지 않았으므로 `receive()` 호출이 일시 중단됩니다. 이 경우 전체 "load contributors" 코루틴이 일시 중단됩니다.
* 그런 다음 사용자 목록이 채널로 전송되면 "load contributors" 코루틴이 재개되고, `receive()` 호출이 이 목록을 반환하며, 결과가 즉시 업데이트됩니다.

이제 프로그램을 실행하고 _CHANNELS_ 옵션을 선택하여 기여자를 로드하고 결과를 확인할 수 있습니다.

코루틴이나 채널이 동시성으로 인한 복잡성을 완전히 없애주지는 않지만, 무슨 일이 일어나고 있는지 파악해야 할 때 삶을 훨씬 수월하게 만들어 줍니다.

## 코루틴 테스트 {id="testing-coroutines"}

이제 모든 솔루션을 테스트하여 동시성 코루틴을 사용한 솔루션이 `suspend` 함수를 사용한 솔루션보다 빠른지, 그리고 채널을 사용한 솔루션이 단순한 "진행 상황(progress)" 표시 솔루션보다 빠른지 확인해 보겠습니다.

다음 과제에서는 솔루션들의 총 실행 시간을 비교합니다. GitHub 서비스를 모의(mock)하고 이 서비스가 주어진 타임아웃 후에 결과를 반환하도록 설정합니다:

```text
repos 요청 - 1000ms 지연 후 응답 반환
repo-1 - 1000ms 지연
repo-2 - 1200ms 지연
repo-3 - 800ms 지연
```

`suspend` 함수를 사용한 순차적 솔루션은 약 4000ms가 걸려야 합니다(4000 = 1000 + (1000 + 1200 + 800)). 동시성 솔루션은 약 2200ms가 걸려야 합니다(2200 = 1000 + max(1000, 1200, 800)).

진행 상황을 보여주는 솔루션의 경우 타임스탬프와 함께 중간 결과를 확인할 수도 있습니다.

해당 테스트 데이터는 `test/contributors/testData.kt`에 정의되어 있으며, `Request4SuspendKtTest`, `Request7ChannelsKtTest` 등의 파일에는 mock 서비스 호출을 사용하는 직관적인 테스트가 포함되어 있습니다.

그러나 여기에는 두 가지 문제가 있습니다:

* 이러한 테스트는 실행하는 데 너무 오래 걸립니다. 각 테스트는 약 2~4초가 걸리며, 매번 결과를 기다려야 합니다. 이는 그다지 효율적이지 않습니다.
* 코드를 준비하고 실행하는 데 여전히 추가 시간이 소요되므로 솔루션이 실행되는 정확한 시간에 의존할 수 없습니다. 상수를 추가할 수도 있지만, 그렇게 하면 컴퓨터마다 시간이 달라집니다. 차이를 확인하려면 mock 서비스 지연 시간이 이 상수보다 커야 합니다. 상수가 0.5초라면 지연 시간을 0.1초로 설정하는 것으로는 충분하지 않습니다.

더 나은 방법은 동일한 코드를 여러 번 실행하면서 타이밍을 테스트하는 특수 프레임워크를 사용하는 것이지만(이로 인해 총 시간이 더욱 증가함), 이는 배우고 설정하기가 복잡합니다.

이러한 문제를 해결하고 제공된 테스트 지연 시간을 가진 솔루션들이 예상대로 하나가 다른 것보다 빠르게 동작하는지 확인하기 위해 특수 테스트 디스패처와 함께 _가상 시간(virtual time)_을 사용합니다. 이 디스패처는 시작부터 경과된 가상 시간을 추적하고 실제 시간(real time)에서는 모든 것을 즉시 실행합니다. 이 디스패처에서 코루틴을 실행하면 `delay`는 즉시 반환되고 가상 시간을 앞당깁니다.

이 메커니즘을 사용하는 테스트는 빠르게 실행되지만 가상 시간의 다양한 시점에 어떤 일이 일어나는지 확인할 수 있습니다. 총 실행 시간이 대폭 감소합니다:

![총 실행 시간 비교](time-comparison.png){width=700}

가상 시간을 사용하려면 `runBlocking` 호출을 `runTest`로 바꿉니다. `runTest`는 `TestScope`에 대한 확장 람다를 인수로 받습니다.
이 특수 스코프 내부의 `suspend` 함수에서 `delay`를 호출하면 `delay`는 실제 시간에서 지연하는 대신 가상 시간을 증가시킵니다:

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
    delay(1000)    // 지연 없이 자동으로 시간을 진행시킴
    println("foo") // foo()가 호출될 때 즉시 실행됨
}
```

`TestScope`의 `currentTime` 프로퍼티를 사용하여 현재 가상 시간을 확인할 수 있습니다.

이 예제에서 실제 실행 시간은 수 밀리초에 불과하지만, 가상 시간은 delay 인수와 동일한 1000밀리초입니다.

자식 코루틴에서 "가상" `delay`의 효과를 온전히 얻으려면 모든 자식 코루틴을 `TestDispatcher`로 시작해야 합니다. 그렇지 않으면 작동하지 않습니다. 다른 디스패처를 제공하지 않는 한 이 디스패처는 다른 `TestScope`에서 자동으로 상속됩니다:

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
        delay(1000)    // 지연 없이 자동으로 시간을 진행시킴
        println("bar") // bar()가 호출될 때 즉시 실행됨
    }
}
```

위의 예제에서 `launch`가 `Dispatchers.Default` 컨텍스트로 호출되면 테스트가 실패합니다. 작업이 아직 완료되지 않았다는 예외가 발생합니다.

`loadContributorsConcurrent()` 함수가 `Dispatchers.Default` 디스패처를 사용하여 컨텍스트를 수정하지 않고 상속된 컨텍스트로 자식 코루틴을 시작하는 경우에만 이런 방식으로 테스트할 수 있습니다.

함수를 _정의_할 때가 아니라 _호출_할 때 디스패처와 같은 컨텍스트 요소를 지정할 수 있으므로 유연성이 높아지고 테스트가 더 쉬워집니다.

> 가상 시간을 지원하는 테스트 API는 [실험적(Experimental)](components-stability.md)이며 향후 변경될 수 있습니다.
>
{style="warning"}

기본적으로 실험적 테스트 API를 사용하면 컴파일러에서 경고를 표시합니다. 이 경고를 억제하려면 테스트 함수나 테스트를 포함하는 전체 클래스에 `@OptIn(ExperimentalCoroutinesApi::class)` 애너테이션을 추가하세요. 컴파일러에 실험적 API를 사용하고 있음을 알리는 컴파일러 인수를 추가합니다:

```kotlin
compileTestKotlin {
    kotlinOptions {
        freeCompilerArgs += "-Xuse-experimental=kotlin.Experimental"
    }
}
```

이 튜토리얼에 해당하는 프로젝트에서는 컴파일러 인수가 이미 Gradle 스크립트에 추가되어 있습니다.

### 과제 8 {id="task-8"}

실제 시간 대신 가상 시간을 사용하도록 `tests/tasks/`의 다음 테스트들을 리팩터링하세요:

* `Request4SuspendKtTest.kt`
* `Request5ConcurrentKtTest.kt`
* `Request6ProgressKtTest.kt`
* `Request7ChannelsKtTest.kt`

리팩터링을 적용하기 전과 후의 총 실행 시간을 비교해 보세요.

#### 과제 8을 위한 힌트 {initial-collapse-state="collapsed" collapsible="true" id="tip-for-task-8"}

1. `runBlocking` 호출을 `runTest`로 교체하고, `System.currentTimeMillis()`를 `currentTime`으로 교체합니다:

    ```kotlin
    @Test
    fun test() = runTest {
        val startTime = currentTime
        // 동작
        val totalTime = currentTime - startTime
        // 결과 테스트
    }
    ```

2. 정확한 가상 시간을 확인하는 어설션(assertion)의 주석 처리를 해제합니다.
3. `@UseExperimental(ExperimentalCoroutinesApi::class)`를 추가하는 것을 잊지 마세요.

#### 과제 8 해결 방법 {initial-collapse-state="collapsed" collapsible="true" id="solution-for-task-8"}

동시성 및 채널 케이스에 대한 해결책은 다음과 같습니다:

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

먼저 예상된 가상 시간에 정확히 결과를 사용할 수 있는지 확인한 다음 결과 자체를 확인합니다:

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

채널을 사용한 마지막 버전의 첫 번째 중간 결과는 진행 상황(progress) 버전보다 일찍 사용할 수 있게 되며, 가상 시간을 사용하는 테스트에서 그 차이를 확인할 수 있습니다.

> 나머지 "suspend" 및 "progress" 과제에 대한 테스트도 매우 유사하며, 프로젝트의 `solutions` 브랜치에서 찾을 수 있습니다.
>
{style="tip"}

## 다음 단계 {id="what-s-next"}

* KotlinConf의 [Asynchronous Programming with Kotlin](https://kotlinconf.com/workshops/) 워크숍을 확인해 보세요.
* [가상 시간 및 실험적 테스트 패키지](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-test/) 사용에 대해 자세히 알아보세요.