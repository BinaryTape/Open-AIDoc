---
title: "@Monitor"
---

# @Monitor

`@Monitor` は、クラスまたは関数をトレーシング対象としてマークします。ビルド時に、Koin Compiler Plugin が監視対象の各関数を Kotzilla SDK のトレース呼び出しでラップするため、その実行時間やエラーが Kotzilla プラットフォームに表示されるようになります。このページでは、Kotzilla SDK の有無によってこのアノテーションがどのように動作するかを説明します。なお、[Koin Compiler Plugin](/docs/setup/compiler-plugin) がセットアップ済みであることを前提としています。

## Kotzilla なしの組み込みモニタリング {id="built-in-monitoring-without-kotzilla"}

Koin でランタイムの動作を確認するための組み込みの方法はロガーです。モジュールのロードやインスタンスの作成をコンソールまたは Logcat に出力します。[Logging](/docs/reference/koin-core/starting-koin#logging) を参照してください。

`@Monitor` は単体では何も追加しません。コンパイル時のクラスパスに Kotzilla SDK がない場合、Compiler Plugin は監視対象の関数を変更せずそのままにし、コンパイルごとに1つの警告を出力します。

```
KOIN-M001: @Monitor: Kotzilla SDK not found on classpath - monitoring disabled
```

コードはアノテーションが存在しないかのようにコンパイルおよび実行されます。共有コードに `@Monitor` を残したまま、トレースしたいビルドにのみ SDK を追加することができます。

## クラスまたは関数へのアノテーション付与 {id="annotating-a-class-or-a-function"}

`@Monitor` は、他の Koin アノテーションと同様に `org.koin.core.annotation` に含まれています。クラスに付与してそのすべての public 関数をトレースするか、単一の関数に付与します。

```kotlin
import org.koin.core.annotation.Monitor

@Monitor
class UserService(private val userRepository: UserRepository) {

    fun findUser(id: String): User? = userRepository.findById(id)

    suspend fun createUser(userData: UserData): User = userRepository.save(userData)

    private fun audit(user: User) { ... } // private: トレース対象外
}

class SyncService(private val api: ApiService) {

    @Monitor
    suspend fun sync() { ... }
}
```

このアノテーションは、アノテーションまたは任意の DSL 形式（Compiler Plugin、Constructor DSL、Classic DSL）など、クラスを宣言するスタイルに関係なく同様に機能します。ViewModel も監視可能です。

```kotlin
@Monitor
class DetailViewModel(private val repository: Repository) : ViewModel() {
    fun loadData(id: String): StateFlow<Data> = repository.getData(id)
}
```

## Compiler Plugin が生成するもの {id="what-the-compiler-plugin-generates"}

クラスパスに Kotzilla SDK がある場合、Compiler Plugin は監視対象の各関数の本体（body）を書き換えます。`UserService` クラスの `findUser` は、あたかも次のように記述したかのようにコンパイルされます。

```kotlin
fun findUser(id: String): User? =
    KotzillaCore.getDefaultInstance().trace("UserService.findUser") {
        userRepository.findById(id)
    }
```

ルール：

- **ラベル**: `ClassName.functionName`、またはトップレベル関数の場合は関数名。
- **suspend 関数**: `trace` の代わりに `suspendTrace` でラップされます。
- **クラスレベルの `@Monitor`**: public 関数のみがトレースされます。private、protected、internal 関数、コンストラクタ、デフォルトのプロパティアクセサはトレースされません。
- **プロキシ不要、`allOpen` 不要**: 関数本体がその場で書き換えられます。クラスは final のままであり、Koin は通常どおりインスタンスを生成します。

ビルド中、プラグインは監視対象の各クラスをレポートします。

```
@Monitor: UserService - tracing enabled (2 functions)
```

このメッセージはデフォルトでは警告（warning）です。ビルドで `allWarningsAsErrors` を使用している場合は、`koinCompiler { }` ブロックで `logSeverity = "info"` を設定してください。[Compiler Plugin Options](/docs/reference/koin-annotations/options) を参照してください。

## Kotzilla SDK を使用する場合 {id="with-the-kotzilla-sdk"}

`@Monitor` は Kotzilla SDK を2つのタイミングで必要とします。

- **ビルド時**: クラス `io.kotzilla.sdk.KotzillaCore` がコンパイル時のクラスパス上に存在する必要があります。`io.kotzilla:kotzilla-sdk` 依存関係が `io.kotzilla:kotzilla-core` を通じてこれを取り込みます。
- **ランタイム時**: トレースが記録されて送信されるように、Koin 設定内で SDK を起動しておく必要があります。

どちらも [Production Monitoring](/docs/tooling/production-monitoring) で説明されている標準的な Kotzilla セットアップの一部です。SDK が実行されると、監視対象の関数への各呼び出しがその実行時間とともに記録され、例外がスローされた場合はそのエラーも記録されます。これらは Kotzilla コンソールで確認できます。

:::warning
生成されたコードは `KotzillaCore.getDefaultInstance()` を呼び出します。監視対象の関数が実行される前に、アプリの起動時に Kotzilla SDK を開始してください。
:::

## Koin Annotations (KSP) を使用する場合 {id="with-koin-annotations-ksp"}

KSP プロセッサ（`koin-ksp-compiler`、Koin Annotations 2.2.0 以降）では、`@Monitor` の動作が異なります。KSP は関数本体を書き換えることができないため、各 public 関数をトレース呼び出しでオーバーライドする `<ClassName>Proxy` という名前のサブクラスを生成し、Koin の定義はこのプロキシを使用します。これに伴い2つの影響が生じます。

- **open クラス**: 監視対象のクラスは open である必要があります。`annotation("org.koin.core.annotation.Monitor")` を指定して `allOpen` Gradle プラグインを設定してください。
- **定義のみ**: Koin の定義であるクラスのみがプロキシされます。

Compiler Plugin はこの仕組みを置き換えるものです。[Migrating from KSP to the Compiler Plugin](/docs/migration/from-ksp-to-compiler-plugin) を参照してください。

## 制限事項 {id="limits"}

- **推移的なトレースの非サポート**: アノテーションが付与されたクラスまたは関数のみがトレースされます。監視対象クラスに注入された依存関係は、それらにも `@Monitor` が付与されていない限りトレースされません。
- **ローカルデータの非対応**: Kotzilla SDK がなければ何も記録されません。ローカルでのデバッグには [Koin logger](/docs/reference/koin-core/starting-koin#logging) を使用してください。
- **オーバーヘッド**: 監視対象の呼び出しはすべてトレース呼び出しを経由します。すべてのクラスではなく、測定したい関数にアノテーションを付与してください。

## 関連情報 {id="related"}

- [Production Monitoring](/docs/tooling/production-monitoring): トレースを記録する Kotzilla SDK のセットアップ。
- [Production & Tooling](/docs/tooling): ニーズに応じたツールの選択。
- [Starting Koin](/docs/reference/koin-core/starting-koin#logging): ローカルデバッグ用の Koin ロガー。
- [Compiler Plugin Options](/docs/reference/koin-annotations/options): `logSeverity` およびその他のプラグイン設定。
- [Annotations Reference](/docs/reference/koin-annotations/annotations-inventory): すべての Koin アノテーション。