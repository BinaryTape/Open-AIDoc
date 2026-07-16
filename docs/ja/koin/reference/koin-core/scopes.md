---
title: スコープ
---

# スコープ

スコープは、依存関係のライフサイクルを制御します。このガイドでは、スコープの定義、作成、および管理方法について説明します。

## スコープを理解する

| スコープの種類 | ライフサイクル | 例 |
|------------|-----------|---------|
| **Single** (シングルトン) | アプリの全期間 | Database, ApiClient |
| **Factory** | リクエストごと | Presenter, Use Case |
| **Scoped** | スコープごと | Activity 紐付け, セッション紐付け |

## スコープを使用するタイミング

以下の場合にスコープを使用してください：
- ファクトリより長く、シングルトンより短い期間存続するインスタンスが必要な場合
- 特定のコンテキスト（Activity, Fragment, セッション）内で状態を共有する場合
- コンテキスト終了時に自動的にクリーンアップを行いたい場合

## スコープ定義の宣言

### DSL

```kotlin
val appModule = module {
    // MyActivity 用のスコープ
    scope<MyActivity> {
        scoped<Presenter>()
        scoped<Navigator>()
    }

    // 名前付きスコープ
    scope(named("session")) {
        scoped<SessionData>()
        scoped<UserPreferences>()
    }
}
```

### アノテーション

| アノテーション | DSL での同等表現 | 目的 |
|------------|----------------|---------|
| `@Scope` | `scope<T> { }` | クラスがどのスコープに属するかを指定する |
| `@Scoped` | `scoped<T>()` | スコープ付きバインディングを定義する |

スコープ付きクラスには、`@Scoped` と `@Scope` の両方が必要です：

```kotlin
@Scope(MyActivityScope::class)
@Scoped
class Presenter(private val repository: UserRepository)

@Scope(MyActivityScope::class)
@Scoped
class Navigator
```

あるいは、一般的な Android スコープ用のスコープアーキタイプアノテーションを使用します（`@Scoped` は不要です）：

```kotlin
// ViewModel スコープ
@ViewModelScope
class UserCache

// Activity スコープ
@ActivityScope
class ActivityPresenter

@ActivityRetainedScope
class RetainedPresenter

// Fragment スコープ
@FragmentScope
class FragmentPresenter
```

## スコープの作成と使用

### 手動でのスコープ管理

```kotlin
// スコープの作成
val myScope = getKoin().createScope("my_scope_id", named("session"))

// スコープからインスタンスを取得
val sessionData: SessionData = myScope.get()
val prefs: UserPreferences = myScope.get()

// 終了時に閉じる
myScope.close()
```

### Android Activity スコープ

```kotlin
class MyActivity : AppCompatActivity(), AndroidScopeComponent {
    // Activity のライフサイクルに基づいてスコープを自動的に作成および破棄
    override val scope: Scope by activityScope()

    // スコープ付きインスタンス - Activity インスタンスごとに作成される
    private val presenter: Presenter by inject()

    override fun onDestroy() {
        super.onDestroy()
        // スコープは自動的に閉じられる
    }
}
```

### Android Fragment スコープ

```kotlin
class MyFragment : Fragment(), AndroidScopeComponent {
    // Fragment のライフサイクルに基づいてスコープを自動的に作成および破棄
    override val scope: Scope by fragmentScope()

    private val presenter: Presenter by inject()
}
```

## スコープの種類

### 型ベースのスコープ

```kotlin
scope<MyActivity> {
    scoped<ActivityPresenter>()
}
```

スコープは `MyActivity` 型によって識別されます。このスコープは `MyActivity` によってのみトリガーされますが、`activityScope` は汎用的なものです。

### 名前付きスコープ

```kotlin
scope(named("user_session")) {
    scoped<SessionManager>()
}
```

スコープが特定の型に紐付けられていない場合に使用します。

### 限定子ベースのスコープ

```kotlin
scope(named<MyQualifier>()) {
    scoped<ScopedService>()
}
```

## スコープアーキタイプ

Koin は、一般的な Android スコープパターンのための専用 DSL を提供しています。これらのアーキタイプ（Archetypes）により、ViewModel、Activity、Fragment のスコープ定義が簡素化されます。

### ViewModel スコープ

ViewModel のライフサイクルにスコープされた依存関係を定義します：

```kotlin
val appModule = module {
    viewModelScope {
        scoped<UserCache>()
        scoped<UserRepository>()
        viewModel<UserViewModel>()
    }
}
```

ViewModel は、そのスコープ付き依存関係に自動的にアクセスできるようになります：

```kotlin
class UserViewModel(
    private val cache: UserCache,      // この ViewModel にスコープされる
    private val repository: UserRepository
) : ViewModel()
```

### Activity スコープ

Activity のライフサイクルにスコープされた依存関係を定義します：

```kotlin
val appModule = module {
    activityScope {
        scoped<ActivityPresenter>()
        scoped<ActivityNavigator>()
    }
}
```

### Fragment スコープ

Fragment のライフサイクルにスコープされた依存関係を定義します：

```kotlin
val appModule = module {
    fragmentScope {
        scoped<FragmentPresenter>()
    }
}
```

### 比較

| アーキタイプ | DSL | アノテーション | ライフサイクル |
|-----------|-----|------------|-----------|
| ViewModel | `viewModelScope { }` | `@ViewModelScope` | ViewModel がクリアされた時 |
| Activity | `activityScope { }` | `@ActivityScope` | Activity が破棄された時 |
| Activity Retained | `activityRetainedScope { }` | `@ActivityRetainedScope` | Activity が終了した時 |
| Fragment | `fragmentScope { }` | `@FragmentScope` | Fragment が破棄された時 |

:::info
スコープアーキタイプは Koin 4.0 以降で利用可能です。これらは、一般的な Android コンポーネントに対して `scope<T> { }` を手動で定義するよりもクリーンな構文を提供します。
:::

## スコープのリンク

親スコープの定義にアクセスするためにスコープをリンクします：

```kotlin
val appModule = module {
    // Activity スコープ
    scope<MainActivity> {
        scoped<ActivityData>()
    }

    // Activity にリンクされた Fragment スコープ
    scope<UserFragment> {
        scoped<FragmentPresenter>()
    }
}
```

```kotlin
class UserFragment : Fragment(), AndroidScopeComponent {
    override val scope: Scope by fragmentScope()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // 親の Activity スコープにリンクする
        scope.linkTo((requireActivity() as AndroidScopeComponent).scope)

        // これで Fragment と Activity 両方のスコープ付きインスタンスにアクセスできるようになる
        val fragmentPresenter: FragmentPresenter by inject()
        val activityData: ActivityData by inject()  // リンクされたスコープから
    }
}
```

## スコープのソース

自身のスコープを認識している依存関係をインジェクトします：

```kotlin
class Presenter(
    val scope: Scope  // Koin によってインジェクトされる
) {
    fun clearScope() {
        scope.close()
    }
}

scope<MyActivity> {
    scoped { Presenter(get()) }  // スコープがインジェクトされる
}
```

## スコープインスタンス ID

各スコープインスタンスには一意の ID があります：

```kotlin
// 明示的な ID で作成
val scope1 = getKoin().createScope("scope_1", named("session"))
val scope2 = getKoin().createScope("scope_2", named("session"))

// 同じスコープ型だが、異なるインスタンス
scope1.get<SessionData>() !== scope2.get<SessionData>()
```

## スコープ付きインスタンスへのアクセス

### スコープ内から

```kotlin
class MyActivity : AppCompatActivity(), AndroidScopeComponent {
    override val scope: Scope by activityScope()

    // スコープ付きインスタンスを直接インジェクトする
    private val presenter: Presenter by inject()
}
```

### スコープ外から

```kotlin
// スコープを取得または作成
val myScope = getKoin().getOrCreateScope("my_id", named("session"))

// インスタンスを取得
val session: SessionData = myScope.get()
```

### Compose 内で

```kotlin
@Composable
fun MyScreen() {
    // Composable のライフサイクルに紐付けられたスコープを作成
    val scope = rememberKoinScope(named("screen_scope"))

    // スコープ付きインスタンスを取得
    val presenter: ScreenPresenter = scope.get()
}
```

## スコープのライフサイクル

### スコープを閉じる

スコープが閉じると：
1. すべてのスコープ付きインスタンスが解放されます
2. `onClose` コールバックが呼び出されます
3. スコープは使用不能になります

```kotlin
val scope = getKoin().createScope("my_scope", named("session"))

// スコープを使用
val data: SessionData = scope.get()

// 終了時に閉じる
scope.close()  // SessionData インスタンスが解放される

// これは例外をスローします
// scope.get<SessionData>()  // エラー：スコープは閉じられています
```

### onClose コールバック

```kotlin
scope(named("session")) {
    scoped {
        SessionData()
    } onClose {
        it?.cleanup()  // スコープが閉じられるときに呼び出される
    }
}
```

## 一般的なパターン

### セッションスコープ

```kotlin
val appModule = module {
    scope(named("user_session")) {
        scoped { SessionManager() }
        scoped { UserPreferences(get()) }
        scoped { CartRepository(get()) }
    }
}

// ログイン
fun onLogin(userId: String) {
    val sessionScope = getKoin().createScope(userId, named("user_session"))
    // セッションインスタンスが利用可能になる
}

// ログアウト
fun onLogout(userId: String) {
    getKoin().getScopeOrNull(userId)?.close()
    // セッションインスタンスが解放される
}
```

### 機能スコープ

```kotlin
val appModule = module {
    scope(named("checkout")) {
        scoped { CheckoutNavigator() }
        scoped { CheckoutPresenter(get()) }
    }
}

class CheckoutActivity : AppCompatActivity(), AndroidScopeComponent {
    override val scope: Scope by lazy {
        getKoin().createScope("checkout_${hashCode()}", named("checkout"))
    }

    override fun onDestroy() {
        super.onDestroy()
        scope.close()
    }
}
```

## ベストプラクティス

1. **シングルトンの使用は控えめに** - 本当にアプリ全体で必要な依存関係にのみ使用してください。
2. **共有状態のスコープ化** - 複数のコンポーネントが同じインスタンスを必要とする場合に使用します。
3. **スコープを明示的に閉じる** - ガベージコレクションに依存しないでください。
4. **スコープの目的を絞る** - 1つのスコープにすべてを詰め込まないでください。
5. **Android スコープコンポーネントを使用する** - ライフサイクルの自動管理のため。

## 次のステップ

- **[Koin for Android](/docs/reference/koin-android/scope)** - Android 特有のスコープ
- **[Koin for Compose](/docs/reference/koin-compose/compose-modules)** - Compose でのスコープ
- **[ベストプラクティス](/docs/reference/koin-core/scopes)** - スコープのパターン