---
title: Androidのベストプラクティス
---

# Androidのベストプラクティス

このページでは、Koinでリーク、クラッシュ、またはシークレット（機密情報）の露出を引き起こすAndroid特有の間違いと、それらを回避する方法を説明します。本ページは、[Androidスコープ](/docs/reference/koin-android/scope)と[AndroidでのKoinの開始](/docs/reference/koin-android/start)を理解していることを前提としています。一般的なモジュール構成については[モジュール](/docs/reference/koin-core/modules)で、エラーメッセージについては[トラブルシューティング](/docs/reference/koin-core/troubleshooting)で説明しています。

## メモリリークとContextリーク {id="memory-and-context-leaks"}

インスタンスは、自身よりも長寿命な何かがその参照を保持し続けることでリークします。Androidにおいて、その典型的な被害を受けるのがActivityです。`single`はプロセスと同じ期間存続しますが、Activityは次の画面回転までしか存続しません。

### singleに渡されるActivity {id="activity-passed-into-a-single"}

```kotlin
// リークの例: singleが最初のActivityを永続的に保持し続ける
class UserActivity : AppCompatActivity() {
    private val tracker: ScreenTracker by inject { parametersOf(this) }
}

val appModule = module {
    single { params -> ScreenTracker(params.get<Activity>()) }
}
```

`single`は最初の呼び出し時のパラメータを使用して一度だけ作成されます。それ以降の呼び出しでは同じインスタンスが返されるため、最初のActivityが保持されたままになります。代わりに以下のいずれかを使用してください。

- Application context: クラスが必要とするのがリソースやシステムサービスのみである場合は、`Context`を持つ`single`として宣言します。`single`内において、`Context`は`Application`になります。
- Activity scope: クラスがActivityを必要とする場合は、`activityScope { }`内または`@ActivityScope`を付けて宣言します。これはActivityごとに作成され、Activityとともに破棄されます。
- Factory with parameters: 呼び出し元がActivityを渡す場合は`factory`を使用し、Activityのライフタイムを超えて結果を保持しないようにします。

Compiler Pluginは、`Context`、`Activity`、`Application`、`Fragment`、`SavedStateHandle`をプラットフォームから提供される型として扱うため、定義の欠落としてはレポートしません。また、指定された定義内で`Activity`パラメータが安全であるかどうかまでは判別できないため、コードレビューで確認してください。

### シングルトンによって保持されるリスナー {id="listeners-held-by-singletons"}

```kotlin
class UserRepository {
    private val listeners = mutableListOf<UserListener>()

    fun addListener(listener: UserListener) { listeners += listener }
    fun removeListener(listener: UserListener) { listeners -= listener }
}
```

リポジトリは`single`です。ActivityやFragmentが自身をリスナーとして登録したまま削除しない場合、リポジトリがその画面を生かし続けることになります。対応するライフサイクルコールバック（`onStart()`に対しては`onStop()`、`onViewCreated()`に対しては`onDestroyView()`）でリスナーを解除するか、`Flow`を公開して`repeatOnLifecycle`で収集（collect）してください。これにより、自動的に収集がキャンセルされます。

### オーナーよりも長生きするスコープ付きインスタンス {id="scoped-instances-that-outlive-their-owner"}

- Retained scope: `activityRetainedScope`は画面回転を跨いで存続します。そのインスタンスはActivity、View、Fragmentを参照してはなりません。
- Fragment scope: これは`onDestroyView()`の後、`onDestroy()`で閉じられます。FragmentスコープのインスタンスにViewやバインディングを保持しないでください。
- ViewModel: ActivityスコープやFragmentスコープのインスタンスをViewModelに注入しないでください。ViewModelは画面回転を跨いで存続しますが、Activityスコープは存続しません。

これらのルールについては[Androidスコープ](/docs/reference/koin-android/scope)で説明しています。

### 独自に作成するスコープ {id="scopes-you-create-yourself"}

`activityScope()`、`fragmentScope()`、`ScopeActivity`、`ScopeFragment`、`ScopeService`は、ライフサイクルに合わせてスコープを閉じます。`getKoin().createScope()`で作成したスコープにはライフサイクルがありません。手動で閉じないと、その中のすべてのインスタンスがメモリ上に残り続けます。

```kotlin
// ログイン時
val sessionScope = getKoin().createScope<UserSession>(userId)

// ログアウト時
sessionScope.close()
```

## Androidでのデバッグ {id="debugging-on-android"}

調査中は、Logcatのロガーをdebugレベルで有効にしてください。

```kotlin
startKoin {
    androidLogger(Level.DEBUG)
    androidContext(this@MainApplication)
    modules(appModule)
}
```

Logcatで`[Koin]`タグをフィルタリングします。debugレベルでは、Koinは各モジュールのロード、各解決（resolution）とその所要時間、および各スコープのオープン/クローズをログに出力します。リリースビルドでは`Level.ERROR`または`Level.NONE`を使用してください。

Android特有のエラー:

| エラー | 主な原因 |
|-------|-------------|
| `MissingAndroidContextException` | `startKoin`で`androidContext()`が指定されていない |
| `KoinApplication has not been started` | `Application`クラスがマニフェストで宣言されていない、またはContentProviderがその`onCreate()`内で注入を行っている（[Androidエントリーポイント](/docs/reference/koin-android/entry-points#contentprovider)を参照） |
| スコープ型に対する`NoDefinitionFoundException` | ActivityまたはFragmentにスコープがない（`ScopeActivity`、`AndroidScopeComponent`） |
| `ClosedScopeException` | スコープがすでに閉じられている`onDestroy()`内またはそれ以降で、コードがスコープ付きインスタンスを解決しようとしている。クリーンアップは`onCloseScope()`内で行う |
| Workersが "Could not instantiate" で失敗する | デフォルトのWorkManagerイニシャライザがマニフェストに残っている（[WorkManager](/docs/reference/koin-android/workmanager)を参照） |

Compiler Pluginを使用すると、定義の欠落はビルド時にレポートされます（[コンパイル時の安全性](/docs/reference/koin-compiler/compile-safety)を参照）。

:::tip
実際のユーザーセッションにおける解決時間、スコープのライフタイム、Koinエラーを確認するには、[本番環境のモニタリング](/docs/tooling/production-monitoring)を参照してください。
:::

## シークレット（機密情報） {id="secrets"}

APKはアンパック（解凍）が可能です。APK内にコンパイルされたものや`assets/`に保存されたものはすべて読み取ることができます。

- ハードコードされたキー: APIキーをモジュール内に文字列リテラルとして記述しないでください。
- Koin properties: `androidFileProperties()`はAPK内に同梱される`assets/koin.properties`を読み取ります。これは設定用として使用し、シークレットには絶対に使用しないでください。
- `BuildConfig`フィールド: これらもAPK内にコンパイルされます。ソースコード管理からは値を隠せますが、APKからは隠せません。

シークレットは実行時にバックエンドから取得するか、暗号化ストレージにトークンを保持し、値そのものではなくストレージを注入するようにしてください。

```kotlin
class AuthInterceptor(private val tokens: TokenStore) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response =
        chain.proceed(
            chain.request().newBuilder()
                .header("Authorization", "Bearer ${tokens.currentToken()}")
                .build()
        )
}
```

`TokenStore`は暗号化ストレージに支えられた`single`であり、`AuthInterceptor`は`OkHttpClient`の定義に追加されます（[Androidライブラリの統合](/docs/reference/koin-android/binding-patterns)を参照）。

## HiltまたはDaggerからの移行 {id="migrating-from-hilt-or-dagger"}

アノテーションのマッピング、モジュールの移行、段階的な移行については、[Hiltからの移行](/docs/reference/koin-android/hilt-migration)で説明しています。`@Inject`や`jakarta.inject`アノテーションを維持する方法については、[JSR-330アノテーション](/docs/reference/koin-android/jsr330)を参照してください。

## 関連情報 {id="related"}

- [Androidスコープ](/docs/reference/koin-android/scope): Activity、Fragment、retained、ViewModelスコープのライフタイム。
- [AndroidでのKoinの開始](/docs/reference/koin-android/start): `androidContext()`、ロギング、プロパティ。
- [トラブルシューティング](/docs/reference/koin-core/troubleshooting): 解決エラーと循環依存。
- [Lazyモジュール](/docs/reference/koin-core/lazy-modules): アプリ起動時のKoinの処理負荷を軽減。
- [Hiltからの移行](/docs/reference/koin-android/hilt-migration): 既存のHiltアプリをKoinへ移行。