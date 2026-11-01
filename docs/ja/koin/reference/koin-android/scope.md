---
title: Android スコープ
---

# Android スコープ

Android スコープは、あるコンポーネント（Activity、Fragment、Service、または ViewModel）が存在する間インスタンスを生存させ、そのコンポーネントと共にクローズします。このページでは、Android スコープ API（スコープアーキタイプ、`ScopeActivity`、`ScopeFragment`、`AndroidScopeComponent`、Retained スコープ、および Service スコープ）について説明します。スコープの概要、`scoped`、一般的なリンクやクローズについては、[Scopes](/docs/reference/koin-core/scopes) で解説されています。

## スコープのライフタイム {id="scope-lifetimes"}

| スコープ | 開始（オープン） | 終了（クローズ） | 画面回転時の維持 |
|-------|--------|--------|-------------------|
| `activityScope` | Activity 内での初回アクセス | Activity の `ON_DESTROY` | なし |
| `activityRetainedScope` | Activity 内での初回アクセス | Activity の終了（ViewModel により保持） | あり |
| `fragmentScope` | Fragment 内での初回アクセス | Fragment の `ON_DESTROY` | なし |
| Service scope | `Service.onCreate()` | `Service.onDestroy()` | 該当なし |
| `viewModelScope` | ViewModel の生成 | ViewModel の破棄（cleared） | あり |

`single` はアプリと同じ期間生存するため、これらすべてにとって最も外側のレベルとなります。

## スコープ定義の宣言 {id="declaring-scoped-definitions"}

Android には、コンポーネントタイプごとに1つのスコープアーキタイプが存在します。アーキタイプとは、スコープを持つすべての Activity（または Fragment）が使用できるスコープ宣言のことであり、クラスごとに個別のスコープを記述する必要がなくなります。

**Compiler Plugin DSL**
```kotlin
import org.koin.androidx.scope.dsl.activityRetainedScope
import org.koin.androidx.scope.dsl.activityScope
import org.koin.androidx.scope.dsl.fragmentScope

val screenModule = module {
    activityScope {
        scoped<ScreenNavigator>()
    }
    activityRetainedScope {
        scoped<FormState>()
    }
    fragmentScope {
        scoped<DetailPresenter>()
    }
}
```

**Annotations**
```kotlin
import org.koin.android.annotation.ActivityRetainedScope
import org.koin.android.annotation.ActivityScope
import org.koin.android.annotation.FragmentScope

@ActivityScope
class ScreenNavigator(private val activity: Activity)

@ActivityRetainedScope
class FormState

@FragmentScope
class DetailPresenter(private val repository: UserRepository)
```

**Constructor / Classic DSL**
```kotlin
import org.koin.androidx.scope.dsl.activityRetainedScope
import org.koin.androidx.scope.dsl.activityScope
import org.koin.androidx.scope.dsl.fragmentScope

val screenModule = module {
    activityScope {
        scopedOf(::ScreenNavigator)
    }
    activityRetainedScope {
        scopedOf(::FormState)
    }
    fragmentScope {
        scopedOf(::DetailPresenter)
    }
}
```

定義を特定の Activity クラスに制限したい場合は、代わりに型ベースのスコープを宣言します（DSL では `scope<UserActivity> { }`、アノテーションでは `@Scope(UserActivity::class)` と `@Scoped` を使用）。Koin は最初に型ベースのスコープを検索し、次にアーキタイプを検索します。型ベースのスコープについては、[Scopes](/docs/reference/koin-core/scopes) で解説されています。

## Activity スコープ {id="activity-scope"}

`ScopeActivity` を継承するか、`AndroidScopeComponent` を実装して `activityScope()` でスコープを作成します。

```kotlin
import org.koin.androidx.scope.ScopeActivity

class UserActivity : ScopeActivity() {

    private val navigator: ScreenNavigator by inject()
}
```

```kotlin
import org.koin.android.scope.AndroidScopeComponent
import org.koin.androidx.scope.activityScope

class UserActivity : AppCompatActivity(), AndroidScopeComponent {

    override val scope: Scope by activityScope()

    private val navigator: ScreenNavigator by inject()
}
```

スコープを使用すると、Activity 内の `inject()`、`get()`、および `viewModel()` は、まず Activity スコープから解決され、次にルートスコープから解決されます。スコープは Activity の `ON_DESTROY` ライフサイクルイベントでクローズされるため、`onDestroy()` のコードが実行される時点ですでにクローズされています。

Activity はそのスコープのソース（生成元）です。スコープ定義内で `Activity` や `Context` を要求すると、現在の Activity を受け取ることができます。

```kotlin
@ActivityScope
class ScreenNavigator(private val activity: Activity) {
    fun openSettings() = activity.startActivity(Intent(activity, SettingsActivity::class.java))
}
```

`activityScope()`（`org.koin.androidx.scope` 内のデリゲート）と `activityScope { }`（`org.koin.androidx.scope.dsl` 内のモジュール DSL）は同じ名前を共有しています。コンパイラが誤った方を選択した場合は、import 文を確認してください。

### Retained Activity スコープ {id="retained-activity-scope"}

`activityRetainedScope()` は、構成変更（configuration changes）をまたいで同じスコープを保持します。Koin はこれを Activity の ViewModel に保持し、その ViewModel がクリアされたとき、つまり Activity が終了したときにクローズします。

```kotlin
import org.koin.androidx.scope.RetainedScopeActivity

class FormActivity : RetainedScopeActivity() {

    private val formState: FormState by inject()
}
```

または、`AndroidScopeComponent` を使用する場合は `override val scope: Scope by activityRetainedScope()` とします。

Retained スコープ内の定義は、Activity インスタンスよりも長く生存します。そのため、Activity やその View、Fragment への参照を保持してはなりません。Retained スコープにはソースがないため、そこでの `Context` は `Application` に解決されます。

## Fragment スコープ {id="fragment-scope"}

`ScopeFragment` を継承するか、`fragmentScope()` を使用して `AndroidScopeComponent` を実装します。

```kotlin
import org.koin.androidx.scope.ScopeFragment

class DetailFragment : ScopeFragment() {

    private val presenter: DetailPresenter by inject()

    // 親 Activity スコープから解決される
    private val navigator: ScreenNavigator by inject()
}
```

```kotlin
import org.koin.androidx.scope.fragmentScope

class DetailFragment : Fragment(), AndroidScopeComponent {

    override val scope: Scope by fragmentScope()
}
```

Fragment スコープはホスト Activity のスコープにリンクされているため、Activity スコープのインスタンスを参照できます。これは、ホスト Activity がスコープを持っている場合（`ScopeActivity` または `AndroidScopeComponent`）にのみ機能します。それ以外の場合、リンクはスキップされ、Koin によってログが出力されます。意図的にリンクをスキップするには、`fragmentScope(useParentActivityScope = false)` を渡します。

:::warning
Fragment スコープは View のライフサイクルではなく、Fragment のライフサイクル（`ON_DESTROY`）に従います。View やバインディングを保持するスコープインスタンスは、`onDestroyView()` の後も Fragment が破棄されるまでそれを保持し続けます。View への参照は `onDestroyView()` で解放してください。
:::

## Service スコープ {id="service-scope"}

`ScopeService` を継承します。そのスコープは `onCreate()` でオープンされ、`onDestroy()` でクローズされます。Service アーキタイプは存在しないため、Service クラス用の型ベースのスコープを宣言します。

**Compiler Plugin DSL**
```kotlin
val playerModule = module {
    scope<MusicService> {
        scoped<PlaybackSession>()
    }
}
```

**Annotations**
```kotlin
@Scope(MusicService::class)
@Scoped
class PlaybackSession
```

**Constructor / Classic DSL**
```kotlin
val playerModule = module {
    scope<MusicService> {
        scopedOf(::PlaybackSession)
    }
}
```

```kotlin
import org.koin.android.scope.ScopeService

class MusicService : ScopeService() {

    private val session: PlaybackSession by inject()

    override fun onBind(intent: Intent?): IBinder? = null
}
```

Service で `ScopeService` を継承できない場合は、`override val scope: Scope by serviceScope()` で `AndroidScopeComponent` を実装し、`onDestroy()` で `destroyServiceScope()` を呼び出します。

## ViewModel スコープ {id="viewmodel-scope"}

ViewModel スコープは、特定の ViewModel とまったく同じ期間だけ生存するインスタンスを保持します。それらは `viewModelScope { }` または `@ViewModelScope` で宣言します。その後、Koin が各 ViewModel ごとにスコープを作成できるように `viewModelScopeFactory()` オプションを有効にするか、`ScopeViewModel` を継承します。

```kotlin
import org.koin.core.option.viewModelScopeFactory

startKoin {
    androidContext(this@MainApplication)
    options(viewModelScopeFactory())
    modules(appModule)
}
```

宣言、オプション、および `ScopeViewModel` については [Scopes](/docs/reference/koin-core/scopes) で解説されています。Android では、通常どおり `by viewModel()` を使用して ViewModel を取得します（[Android ViewModel](/docs/reference/koin-android/viewmodel) を参照）。

`activityScope` 内で `scoped` を使用して ViewModel を宣言しないでください。そうすると `ViewModelStore` によって管理されないプレーンなオブジェクトとなり、画面回転のたびに再作成されてしまいます。ViewModel は `viewModel` で宣言し、`by viewModel()` で取得してください。

## スコープがクローズする前のクリーンアップ {id="cleaning-up-before-the-scope-closes"}

`AndroidScopeComponent` で `onCloseScope()` をオーバーライドします。Koin は Activity または Fragment スコープをクローズする直前、スコープインスタンスがまだ利用可能な状態のときにこれを呼び出します。

```kotlin
class UserActivity : ScopeActivity() {

    override fun onCloseScope() {
        get<ScreenNavigator>().clear()
    }
}
```

`onCloseScope()` は Retained スコープや Service スコープでは呼び出されません。単一の定義に紐づくクリーンアップを行うには、その定義で `onClose { }` を使用します（[Definitions](/docs/reference/koin-core/definitions#release-callback) を参照）。

## 制限事項 {id="limits"}

- スコープが必要: スコープ定義を注入するクラスは、スコープ（`ScopeActivity`、`ScopeFragment`、`ScopeService`、または `AndroidScopeComponent`）を持つ必要があります。これがない場合、`inject()` はルートスコープから解決しようとし、`NoDefinitionFoundException` で失敗します。
- メインスレッド: Activity および Fragment のスコープはメインスレッドから作成してください（プロパティデリゲートは `onCreate()` 内またはそれ以降に読み取られます）。
- カスタムスコープ: `getKoin().createScope()` を使用して自身で作成したスコープは、どのライフサイクルにも紐づきません。ご自身でクローズしてください。

:::tip
実際のユーザーセッションにおけるスコープのライフタイムやリークしたインスタンスを確認するには、[Production Monitoring](/docs/tooling/production-monitoring) を参照してください。
:::

## 関連情報 {id="related"}

- [Scopes](/docs/reference/koin-core/scopes): スコープの概念、リンク、`@Scope`、および ViewModel スコープ。
- [Android ViewModel](/docs/reference/koin-android/viewmodel): Activity および Fragment スコープを持つ ViewModel。
- [Android Entry Points](/docs/reference/koin-android/entry-points): Android コンポーネントでの注入。
- [Fragment Factory](/docs/reference/koin-android/fragment-factory): Activity スコープからの Fragment の作成。
- [Android Best Practices](/docs/reference/koin-android/best-practices): Context および Activity のリーク防止。