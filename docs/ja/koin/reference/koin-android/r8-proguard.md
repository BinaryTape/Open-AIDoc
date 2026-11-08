---
title: R8 / ProGuard
---

# R8 / ProGuard

このページでは、コード縮小および難読化（R8 / ProGuard）環境下でのKoinの動作、Koinが自動的に保持（keep）するもの、そしてアプリ側で**開発者自身**が保持する必要があるものについて説明します。

## TL;DR {id="tl-dr"}

- **Koinのコア解決はR8セーフです。** `get<T>()`、`inject<T>()`、および各種 `*Of` ビルダー（`singleOf`、`factoryOf`、`viewModelOf` など）は、依存関係を**コンパイル時**に解決します。これらはreified型（実体化された型）を使用し、Android/JVMでは `Class.getName()` をレジストリのキーとして使用します。**コンストラクタに対する実行時リフレクションは行われない**ため、Koinのために定義やViewModel、またはそれらのコンストラクタをkeepする必要は**ありません**。
- KoinはAndroid AAR（`koin-android`、`koin-core-viewmodel`、`koin-compose-viewmodel`、`koin-androidx-workmanager`、`koin-androidx-startup`）内に `consumer-rules.pro` を同梱しているため、以下のルールは自動的に適用されます。通常、開発者が設定を追加する必要はありません。
- ただし、**他の何か**がリフレクションによってロードするクラスは、依然として保持する必要があります（後述）。

## Koinが自動で保持するもの（同梱されているconsumer rules） {id="what-koin-keeps-for-you-shipped-consumer-rules"}

各AARは、Koinの内部実装に関するR8の警告を抑制します：

```proguard
-dontwarn org.koin.**
```

`koin-androidx-startup` はさらに、マニフェストで参照されるイニシャライザを保持します。これらはいずれもアプリケーションのクラスを保持するものではありません（Koinはそれらを保持する必要がありません）。

## 開発者自身が保持しなければならないもの {id="what-you-must-keep"}

これらはKoinの解決ロジックによるものではなく、プラットフォームやライブラリに起因するものです：

- **`KoinFragmentFactory` によって作成されるFragment** はクラス名によってインスタンス化されます。Fragmentのサブクラスを保持してください（通常は `@Keep`、レイアウト参照、またはAndroidXのルールによってすでに保持されています）。
- **WorkManagerの `ListenableWorker` サブクラス** は、`androidx.work` 独自のconsumer rulesによって保持されます。
- **プロセス破棄（process death）に対応するSaved state。** `SavedStateHandle` はKoinではなく、AndroidXの `CreationExtras` によって提供されます。そこに格納する値は、他の保存された状態と同様にR8による難読化/縮小に耐える必要があります。独自の `@Parcelize` / `Serializable` 状態クラスを保持してください：

```proguard
# 例 — 独自に保存する状態（saved-state）のペイロードを保持する
-keep class com.example.** implements android.os.Parcelable { *; }
```

## ViewModelsとSavedStateHandle (#2044) {id="viewmodels-savedstatehandle-2044"}

断続的に発生する `No definition found for SavedStateHandle` によるクラッシュは、R8がKoinのViewModelリフレクションを除去したことが原因であると誤解されがちです。**しかし、そうではありません**。`viewModelOf(::MyViewModel)` はコンパイル時に解決されるため、ViewModelに `-keep` を指定してもKoinの解決動作は変わりません。

`SavedStateHandle` は、**ViewModelの作成中のみ**利用可能です（ファクトリに渡された `CreationExtras` から生成されます）。遅延解決やコンストラクト後の解決は行わず、**ViewModelのコンストラクタ内で直接**解決してください：

```kotlin
// ✅ 作成中に解決される
class MyViewModel(val handle: SavedStateHandle) : ViewModel()

// ❌ 後から解決される — その時点ではすでにCreationExtrasが存在しない
class MyViewModel(koin: Koin) : ViewModel() {
    val handle by lazy { koin.get<SavedStateHandle>() } // 失敗する
}
```

`viewModelScope { }` 内でViewModelを宣言する場合は、スコープを作成できるように対応するオプションを有効にしてください：

```kotlin
startKoin {
    options(viewModelScopeFactory())
    modules(appModule)
}
```

## Android以外のターゲット（JS / WASM / Native） {id="non-android-targets-js-wasm-native"}

Android/JVMでは、Koinはレジストリのキーとして `Class.getName()` を使用し、これはR8環境下でも安定しています。一方、**Kotlin/JS、WASM、Native** では、KoinはKotlinリフレクションの `qualifiedName` / `simpleName` を使用します。これらのターゲットで積極的な名前の難読化（ミニファイ）を行うと型の同一性に影響を与える可能性があるため、Android以外のターゲットを縮小・最適化する場合は、クラス名に依存するのではなく**名前付き修飾子（named qualifier）**（`named("...")`）を優先して使用してください。