---
title: ViewModel
---

# ViewModel

このページでは、AndroidX ViewModel をサポートするすべてのプラットフォーム（Android、iOS、デスクトップ、Web）において、Koin モジュールで ViewModel を宣言する方法について説明します。この内容は、[定義（definitions）](/docs/reference/koin-core/definitions)を理解していることを前提としています。ViewModel を取得する方法については、各プラットフォームのページを参照してください。Activity または Fragment での `by viewModel()` については [Android ViewModel](/docs/reference/koin-android/viewmodel) を、`koinViewModel()` については [ViewModel in Compose](/docs/reference/koin-compose/compose-viewmodel) を参照してください。

## 依存関係 {id="dependencies"}

宣言 DSL は、マルチプラットフォームアーティファクトである `koin-core-viewmodel` に含まれています。

```kotlin
// build.gradle.kts, commonMain
implementation("io.insert-koin:koin-core-viewmodel")
```

インジェクション API はプラットフォームアーティファクトに含まれています: `io.insert-koin:koin-android`（`koin-core-viewmodel` を内包）および `io.insert-koin:koin-compose-viewmodel` です。バージョンは BOM から提供されます。[Gradle のセットアップ](/docs/setup/gradle)を参照してください。

## ViewModel の宣言 {id="declaring-a-viewmodel"}

**Compiler Plugin DSL**
```kotlin
import org.koin.dsl.module
import org.koin.plugin.module.dsl.viewModel

class UserViewModel(private val repository: UserRepository) : ViewModel()

val appModule = module {
    viewModel<UserViewModel>()
}
```

**アノテーション**
```kotlin
import org.koin.core.annotation.KoinViewModel

@KoinViewModel
class UserViewModel(private val repository: UserRepository) : ViewModel()
```

Compiler Plugin を使用する場合、`@KoinViewModel` は `org.koin.core.annotation` にあり、共通コード（common code）で動作します。以前の KSP プロセッサでは `org.koin.android.annotation.KoinViewModel` を使用していました。

**Constructor / Classic DSL**
```kotlin
import org.koin.dsl.module
import org.koin.core.module.dsl.viewModelOf
import org.koin.core.module.dsl.viewModel

val appModule = module {
    viewModelOf(::UserViewModel)

    // またはコンストラクタ呼び出しを明記する場合
    viewModel { UserViewModel(get()) }
}
```

`viewModel` 定義は、`factory` のようにリクエストごとに新しいインスタンスを作成します。プラットフォームの `ViewModelStore`（Activity、Fragment、ナビゲーションエントリなど）がそのインスタンスを保持するため、Android の構成変更（Configuration Changes）をまたいでも、同じオーナーは同じ ViewModel を取得します。ViewModel を `single` として宣言しないでください。すべての画面で共有されてしまい、破棄（クリア）されなくなります。

## パラメータの受け渡し {id="passing-parameters"}

ViewModel では、アイテム ID など実行時にしかわからない値が必要になることがよくあります。コンストラクタパラメータを注入パラメータ（Injected Parameter）としてマークします。

**Compiler Plugin DSL**
```kotlin
class DetailViewModel(
    @InjectedParam val itemId: String,
    private val repository: DetailRepository,
) : ViewModel()

val appModule = module {
    viewModel<DetailViewModel>()
}
```

**アノテーション**
```kotlin
@KoinViewModel
class DetailViewModel(
    @InjectedParam val itemId: String,
    private val repository: DetailRepository,
) : ViewModel()
```

**Constructor / Classic DSL**
```kotlin
val appModule = module {
    viewModel { params ->
        DetailViewModel(itemId = params.get(), repository = get())
    }
}
```

`viewModelOf(::DetailViewModel)` も動作します。呼び出し元から渡された値から、型に基づいてパラメータを読み取ります。

呼び出し側は、宣言スタイルにかかわらず `parametersOf` を使用して値を渡します。

```kotlin
// Android
val viewModel: DetailViewModel by viewModel { parametersOf("item_123") }

// Compose
val viewModel = koinViewModel<DetailViewModel> { parametersOf("item_123") }
```

パラメータは、ViewModel が作成される際に一度だけ読み取られます。同じオーナーが別の値で再度要求した場合でも、既存のインスタンスが返されます。パラメータの詳細については、[注入パラメータ（Injected Parameters）](/docs/reference/koin-core/injection-parameters)を参照してください。

## SavedStateHandle {id="savedstatehandle"}

コンストラクタに `SavedStateHandle` パラメータを追加します。Koin は宣言なしで、ViewModel の `CreationExtras` から自動的にこれを作成します。

**Compiler Plugin DSL**
```kotlin
class ProfileViewModel(
    private val handle: SavedStateHandle,
    private val repository: UserRepository,
) : ViewModel() {
    val userId: String? = handle["userId"]
}

val appModule = module {
    viewModel<ProfileViewModel>()
}
```

**アノテーション**
```kotlin
@KoinViewModel
class ProfileViewModel(
    private val handle: SavedStateHandle,
    private val repository: UserRepository,
) : ViewModel() {
    val userId: String? = handle["userId"]
}
```

**Constructor / Classic DSL**
```kotlin
val appModule = module {
    viewModelOf(::ProfileViewModel)

    // または: get() が SavedStateHandle を解決します
    viewModel { ProfileViewModel(get(), get()) }
}
```

Android では、ナビゲーション引数や Activity の extras は `SavedStateHandle` 内に保持されます。コンストラクタでのみ注入してください。ViewModel のオーナーが `SavedStateRegistryOwner` を持たない場合、Koin は「Koin could not create a SavedStateHandle: the ViewModel's CreationExtras has no SavedStateRegistryOwner.」というエラーで失敗します。

## ViewModel スコープ {id="viewmodel-scope"}

ViewModel は[スコープ（Scope）](/docs/reference/koin-core/scopes)を所有できます。これは ViewModel と一緒に作成され、ViewModel が破棄（クリア）されるときに解放される依存関係です。これらは `viewModelScope` アーキタイプを使用して宣言します。

**Compiler Plugin DSL**
```kotlin
val appModule = module {
    viewModelScope {
        scoped<UserCache>()
        viewModel<UserViewModel>()
    }
}
```

**アノテーション**
```kotlin
@ViewModelScope
class UserCache

@KoinViewModel
@ViewModelScope
class UserViewModel(private val cache: UserCache) : ViewModel()
```

**Constructor / Classic DSL**
```kotlin
val appModule = module {
    viewModelScope {
        scopedOf(::UserCache)
        viewModelOf(::UserViewModel)
    }
}
```

起動時にこのオプションを有効にしてください。そうしないと、ViewModel にスコープが割り当てられません。

```kotlin
startKoin {
    options(viewModelScopeFactory())
    modules(appModule)
}
```

`viewModelScope` および `viewModelScopeFactory()` を使用するには、`@KoinViewModelScopeApi` と `@KoinExperimentalAPI` へのオプトインが必要です。コンストラクタでスコープ付きの依存関係を受け取る ViewModel は、`viewModelScope { }` の内部で宣言する必要があります。各 ViewModel インスタンスはそれぞれ専用の `UserCache` を取得し、ViewModel が破棄される際にクローズされます。

## 制限事項 {id="limits"}

- **オーナーごとに1つのインスタンス**: そのオーナーに対してすでに ViewModel が存在する場合、注入パラメータは無視されます。2つ目のインスタンスを取得するには、別のキーまたはオーナーを使用してください。
- **`single` ViewModel は不可**: シングルトンの ViewModel は破棄（クリア）されることがなく、その依存関係がメモリリークします。
- **実験的な ViewModel スコープ**: `viewModelScope` は実験的（experimental）とマークされており、変更される可能性があります。

## 関連情報 {id="related"}

- [Android ViewModel](/docs/reference/koin-android/viewmodel): `by viewModel()`、`activityViewModel()`、ナビゲーショングラフの ViewModel。
- [ViewModel in Compose](/docs/reference/koin-compose/compose-viewmodel): `koinViewModel()` およびナビゲーションの ViewModel。
- [Injected Parameters](/docs/reference/koin-core/injection-parameters): `parametersOf` および `@InjectedParam`。
- [Scopes](/docs/reference/koin-core/scopes): スコープアーキタイプとスコープのライフサイクル。
- [Definitions](/docs/reference/koin-core/definitions): その他の定義タイプ。