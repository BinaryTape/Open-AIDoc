[//]: # (title: 依存関係の登録)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:ktor-server-di</code>
</p>
<var name="example_name" value="server-di"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

Ktorの[依存性注入（DI）](server-dependency-injection.md)コンテナは、アプリケーションが依存するオブジェクトをどのように作成するかを認識している必要があります。このプロセスは依存関係の登録（dependency registration）と呼ばれます。

### 基本的な依存関係の登録 {id="basic-dependency-registration"}

基本的な依存関係の登録はコード内で行われ、通常は `Application` モジュール内で `dependencies {}` ブロックを使用して行います。

[ラムダ](#lambda-registration)、[関数参照](#function-reference)、[クラス参照](#class-reference)、または[コンストラクタ参照](#constructor-reference)を提供することで、依存関係を登録できます。

#### ラムダの使用 {id="lambda-registration"}

インスタンスの作成方法を完全に制御したい場合は、ラムダを使用します。

```kotlin
dependencies {
    provide<GreetingService> { GreetingServiceImpl() }
}
```
これにより、`GreetingService` のプロバイダーが登録されます。`GreetingService` が要求されるたびに、ラムダが実行されてインスタンスが作成されます。

#### コンストラクタ参照の使用 {id="constructor-reference"}

クラスがそのコンストラクタを使用して作成可能であり、すべてのコンストラクタパラメータがすでにDIコンテナに登録されている場合は、コンストラクタ参照を使用できます。

```kotlin
dependencies {
    provide<GreetingService>(::GreetingServiceImpl)
}
```
これにより、アプリケーションは `GreetingServiceImpl` のコンストラクタを使用し、そのパラメータをDIに解決させます。

#### クラス参照の使用 {id="class-reference"}

インターフェースにバインドすることなく、具体的なクラスを登録できます。

```kotlin
dependencies {
    provide(BankServiceImpl::class)
}
```
この場合、依存関係はその `BankServiceImpl` 型によって解決されます。これは、実装型が直接注入され、抽象化が必要ない場合に便利です。

#### 関数参照の使用 {id="function-reference"}

インスタンスを作成して返す関数を登録できます。

```kotlin
dependencies {
    provide(::createBankTeller)
}
```

DIコンテナは関数のパラメータを解決し、その戻り値を依存関係のインスタンスとして使用します。

#### ファクトリラムダの使用 {id="factory-lambda-registration"}

関数自体を依存関係として登録できます。

```kotlin
dependencies {
    provide<() -> GreetingService> {
        { GreetingServiceImpl() }
    }
}
```

これにより、注入して手動で呼び出すことで新しいインスタンスを作成できる関数が登録されます。

### 名前付きの依存関係の登録 {id="named-registration"}

同じ型のプロバイダーが複数ある場合にそれらを区別するため、登録時に依存関係に名前を割り当てることができます。

これは、単一の型に対して複数の実装やインスタンスを登録し、解決時にそれらを明示的に選択する必要がある場合に便利です。

依存関係に名前を割り当てるには、`provide()` 関数の第1引数として名前を渡します。

```kotlin
dependencies {
    provide("default") { GreetingServiceImpl() }
    provide("alternative") { AlternativeGreetingServiceImpl() }
}
```

名前付きの依存関係は、[`@Named` アノテーションを使用して明示的に解決](server-di-dependency-resolution.md#resolve-named)する必要があります。

### 設定ベースの依存関係の登録 {id="configuration-based-dependency-registration"}

設定ファイル内のクラスパス参照を使用して、宣言的に依存関係を設定できます。オブジェクトを返す関数や、解決可能なコンストラクタを持つクラスを指定できます。

設定ファイルの `ktor.application.dependencies` グループ配下に依存関係を記述します。

<Tabs>
<TabItem title="application.yaml">

```yaml
ktor:
  application:
    dependencies:
      - com.example.RepositoriesKt.provideDatabase
      - com.example.UserRepository
```

</TabItem>
</Tabs>

KtorはDIコンテナを使用して、関数やコンストラクタのパラメータを自動的に解決します。