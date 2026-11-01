---
title: KMPプラットフォーム統合
---

# KMPプラットフォーム統合

このページでは、Koinを使用したKotlin Multiplatformアプリにおけるプラットフォーム固有の詳細を扱います。具体的には、共有コードからのAndroid `Context`の利用、SwiftからのKoinの呼び出し、デスクトップおよびWebターゲットについて説明します。プロジェクトが[KMP Setup](/docs/reference/koin-core/kmp-setup)および[KMP Sharing Patterns](/docs/reference/koin-core/kmp-shared-modules)に従っていることを前提としています。

完全なプロジェクト例：[Compose Multiplatformサンプル](https://github.com/InsertKoinIO/koin-getting-started/tree/main/compose)（Compiler Plugin DSL）および[アノテーションサンプル](https://github.com/InsertKoinIO/koin-getting-started/tree/main/compose-annotations)。

## 共有コードでのAndroid Context {id="android-context-in-shared-code"}

共有コード（shared code）では`android.content.Context`を直接使用できませんが、一部の共有クラスはAndroid上でそれを必要とします（ファイルを開いたり、設定を読み込んだりするため）。共通コード（common code）が依存できるプラットフォーム型にラップしてください：

**Compiler Plugin DSL**
```kotlin
// commonMain
interface ContextWrapper {
    fun getContextInfo(): String
}

class FileStore(private val ctx: ContextWrapper)

val storageModule = module {
    single<FileStore>()
}
```

```kotlin
// androidMain
class AndroidContextWrapper(val context: Context) : ContextWrapper {
    override fun getContextInfo() = "Android: ${context.packageName}"
}

actual fun platformModule(): Module = module {
    single<AndroidContextWrapper>() bind ContextWrapper::class
}
```

```kotlin
// iosMain
class IOSContextWrapper : ContextWrapper {
    override fun getContextInfo() = "iOS"
}

actual fun platformModule(): Module = module {
    single<IOSContextWrapper>() bind ContextWrapper::class
}
```

**Annotations**
```kotlin
// commonMain
interface ContextWrapper {
    fun getContextInfo(): String
}

@Singleton
class FileStore(private val ctx: ContextWrapper)
```

```kotlin
// androidMain
@Singleton
class AndroidContextWrapper(val context: Context) : ContextWrapper {
    override fun getContextInfo() = "Android: ${context.packageName}"
}
```

```kotlin
// iosMain
@Singleton
class IOSContextWrapper : ContextWrapper {
    override fun getContextInfo() = "iOS"
}
```

プラットフォームクラスは、`@ComponentScan`を使用した`actual`プラットフォームモジュールによって検出されます（[KMP Sharing Patterns](/docs/reference/koin-core/kmp-shared-modules)を参照）。

**Constructor / Classic DSL**
```kotlin
// commonMain
interface ContextWrapper {
    fun getContextInfo(): String
}

class FileStore(private val ctx: ContextWrapper)

val storageModule = module {
    singleOf(::FileStore)
}
```

```kotlin
// androidMain
actual fun platformModule(): Module = module {
    singleOf(::AndroidContextWrapper) bind ContextWrapper::class
}

// iosMain
actual fun platformModule(): Module = module {
    singleOf(::IOSContextWrapper) bind ContextWrapper::class
}
```

`FileStore`は`commonMain`で一度だけコンパイルされ、プラットフォームラッパーを受け取ります。`Context`に触れるのはAndroid側の定義1つだけであり、起動時に`androidContext()`が設定されると解決されます。共通コード内でプラットフォーム型をチェックするのではなく、Android固有の操作を`ContextWrapper`のメソッドの裏側に隠蔽するようにしてください。

## iOSとSwift {id="ios-and-swift"}

### Swiftからの依存関係の取得 {id="retrieving-dependencies-from-swift"}

Swiftは`get<T>()`のようなKoinのreified関数を呼び出すことができません。Swiftとの境界では、`iosMain`に`KoinComponent`を実装した小さなKotlinヘルパーを作成し、それをSwiftから使用します。これは相互運用のエントリーポイントとして機能し、共有クラスは引き続きコンストラクタ経由で依存関係を受け取ることができます。

```kotlin
// iosMain
class GreetingHelper : KoinComponent {
    private val greeting: Greeting by inject()
    fun greet(): String = greeting.greeting()
}
```

```swift
struct ContentView: View {
    let greet = GreetingHelper().greet()

    var body: some View {
        Text(greet)
    }
}
```

ヘルパーを使用する前にKoinを開始しておく必要があります。[KMP Setup](/docs/reference/koin-core/kmp-setup)のiOSエントリーポイントを参照してください。`KoinComponent`についての詳細は[KoinComponent](/docs/reference/koin-core/koin-component)で解説されています。

### KoinでSwiftのインスタンスを宣言する {id="declaring-a-swift-instance-in-koin"}

SwiftクラスがKotlinのインターフェースを実装しており、Kotlinコード側がそれをKoinから取得したい場合があります。そのような場合は、`Koin.declare()`を使用して実行時にインスタンスを登録します。Swiftは型をObjective-Cのクラスまたはプロトコルとして渡し、この`iosMain`ヘルパーがそれをKotlinの`KClass`に変換します：

```kotlin
// iosMain
@OptIn(BetaInteropApi::class)
fun Koin.declareFromSwift(
    instance: Any,
    bindTo: ObjCObject,
    qualifier: Qualifier? = null,
    allowOverride: Boolean = true
) {
    val kClass: KClass<*> = when (bindTo) {
        is ObjCClass -> getOriginalKotlinClass(bindTo)
        is ObjCProtocol -> getOriginalKotlinClass(bindTo)
        else -> null
    } ?: error("Can't resolve Kotlin KClass from $bindTo")

    declare(
        instance = instance,
        qualifier = qualifier,
        secondaryTypes = listOf(kClass),
        allowOverride = allowOverride
    )
}
```

```swift
koin.declareFromSwift(
    instance: SwiftAnalytics(),
    bindTo: Analytics.self,
    qualifier: nil,
    allowOverride: true
)
```

`getOriginalKotlinClass()`は`kotlin.native`から提供されており、クラス（クラスに対する`.self`）またはプロトコル（プロトコルに対する`.self`）を元のKotlin型へとマッピングします。宣言されたインスタンスはコンパイル時にはチェックされません。Swiftがインスタンスをまだ宣言していない場合、Kotlin側のコンシューマー（呼び出し元）は実行時に失敗します。このヘルパーは[@SarahDelCastilloによる提案](https://github.com/InsertKoinIO/koin/issues/1108#issuecomment-3645990426)に基づいています。

### スレッド {id="threading"}

Koinは現在のKotlin/Nativeメモリモデル（Kotlin 1.7.20以降のデフォルト）で動作します。フリーズや`@SharedImmutable`アノテーションを必要とせず、任意のスレッドから依存関係を解決したりスコープを使用したりできます。

## デスクトップ (JVM) {id="desktop-jvm"}

最初のウィンドウを表示する前に、`main()`でKoinを開始します：

```kotlin
// jvmMain
fun main() = application {
    initKoin {
        printLogger()
        modules(desktopModule)
    }

    Window(onCloseRequest = ::exitApplication) {
        App()
    }
}

val desktopModule = module {
    single<DesktopFileManager>()
}
```

共通の`initKoin`の`config`パラメータにより、デスクトップ専用のモジュールとロガーを追加します。DesktopはJVMターゲットであるため、`fileProperties()`のようなJVM専用の機能が利用可能です（[Starting Koin](/docs/reference/koin-core/starting-koin)を参照）。

## Web (JSおよびWasm) {id="web-js-and-wasm"}

`js`または`wasmJs`ソースセットの`main()`でKoinを開始します：

```kotlin
// jsMain or wasmJsMain
fun main() {
    initKoin {
        modules(webModule)
    }
    // UIを開始
}

val webModule = module {
    single<BrowserStorage>()
}
```

Web向けのCompose Multiplatformでは、代わりにルートのComposableから`KoinApplication`を使用してKoinを開始することもできます（[Koin for Compose](/docs/reference/koin-compose/compose)を参照）。

## 関連情報 {id="related"}

- [KMP Setup](/docs/reference/koin-core/kmp-setup): 依存関係、`initKoin`、エントリーポイント。
- [KMP Sharing Patterns](/docs/reference/koin-core/kmp-shared-modules): プラットフォームモジュールと`expect`/`actual`の定義。
- [KoinComponent](/docs/reference/koin-core/koin-component): Koinが作成しないクラスからの依存関係の取得。
- [Koin for Compose](/docs/reference/koin-compose/compose): Compose Multiplatformの統合。
- [Testing](/docs/reference/koin-test/testing): `commonTest`での共有モジュールのテスト。