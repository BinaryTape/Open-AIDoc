[//]: # (title: Kotlin RPC 入門)

<show-structure for="chapter" depth="2"/>

<web-summary>
この包括的なガイドで、RPCの基礎を学び、RPCとRESTの詳細な比較を確認しましょう。Kotlin RPCを使って最初のアプリケーションを作成する方法を学びます。
</web-summary>

<link-summary>
Kotlin RPCとKtorを使って最初のアプリケーションを作成する方法を学びます。
</link-summary>

<card-summary>
Kotlin RPCとKtorを使って最初のアプリケーションを作成する方法を学びます。
</card-summary>

<tldr>
<var name="example_name" value="tutorial-kotlin-rpc-app"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
<b>使用しているプラグイン</b>: <Links href="server-routing.md" summary="ルーティングはサーバーアプリケーションで受信リクエストを処理するためのコアプラグインです。">Routing</Links>、
<a href="https://kotlinlang.org/api/kotlinx.serialization/">kotlinx.serialization</a>、
<a href="https://kotlin.github.io/kotlinx-rpc/get-started.html">kotlinx.rpc</a>
</p>
</tldr>

Kotlin RPC（Remote Procedure Call: リモートプロシージャコール）は、十分に確立された基盤の上に構築されており、[`kotlinx.rpc`](https://kotlin.github.io/kotlinx-rpc/get-started.html) ライブラリ上で動作します。

`kotlinx.rpc` ライブラリを使用すると、通常のKotlin言語構造を使用して、ネットワーク境界を越えたプロシージャコールを実行できます。そのため、RESTとGoogle RPC（gRPC）の双方に対する代替手段を提供します。

この記事では、Kotlin RPCのコアコンセプトを学び、シンプルなアプリケーションを作成します。その後、自身のプロジェクトでこのライブラリを評価できるようになります。

## 前提条件 {id="prerequisites"}

このチュートリアルでは、Kotlinプログラミングの基礎的な理解があることを前提としています。Kotlinを初めて使用する場合は、[入門資料](https://kotlinlang.org/docs/getting-started.html) を確認することをお勧めします。

最適な体験のために、生産性を高める包括的なサポートとツールを提供する統合開発環境（IDE）として [IntelliJ IDEA Ultimate](https://www.jetbrains.com/idea/download) を使用することをお勧めします。

## RPCとは？ {id="what-is-rpc"}

### ローカルプロシージャコールとリモートプロシージャコール {id="local-vs-remote"}

プロシージャコールは、あらゆるプログラミング言語における基本的な概念です。これらは常に同一プログラム内で実行されるため、技術的には「ローカル」プロシージャコールです。

リモートプロシージャコールとは、別の仮想マシンや実行ファイル内で実装を実行できるように、関数呼び出しとパラメータが何らかの方法でネットワーク経由で転送されることです。戻り値は逆の経路をたどって、呼び出しが行われたマシンへと戻ります。

呼び出しが行われたマシンをクライアント、実装が存在するマシンをサーバーと考えると最も理解しやすいでしょう。ただし、必ずしもこの構成である必要はありません。ピアツーピアアーキテクチャの一部として、RPC呼び出しを双方向で行うことも可能です。このチュートリアルではシンプルにするため、クライアント/サーバー構成を想定します。

### RPCフレームワークの基本要素 {id="rpc-framework-fundamentals"}

どのようなRPCフレームワークであっても、提供しなければならない特定の基本要素があります。これらは従来のITインフラストラクチャ内でリモートプロシージャコールを実装する際には不可欠です。用語や責任範囲の分担は異なる場合がありますが、すべてのRPCフレームワークは以下を提供する必要があります。

1. リモートで呼び出されるプロシージャを宣言する方法。オブジェクト指向プログラミングでは、インターフェースが論理的な選択肢となります。これは、使用している言語が提供するインターフェース構文の場合もあれば、[W3Cで使用されているWeb IDL](https://webidl.spec.whatwg.org/) のような言語中立的な標準規格の場合もあります。
2. パラメータと戻り値に使用される型を指定する手段。これも言語中立的な標準を使用できますが、現在の言語における標準データ型の宣言にアノテーションを付ける方がシンプルな場合もあります。
3. プロシージャの呼び出しをネットワーク経由で送信できる形式に変換し、結果として得られた戻り値をアンパック（展開）するために使用される、_クライアントスタブ_ と呼ばれるヘルパークラス。これらのスタブは、コンパイルプロセス中に生成されるか、実行時に動的に作成されます。
4. ヘルパークラスを管理し、リモートプロシージャコールのライフサイクルを監督する、基盤となる _RPCランタイム_。サーバー側では、継続的にリクエストを処理できるように、このランタイムを何らかのサーバーに組み込む必要があります。
5. 呼び出されるプロシージャの表現、送信されるデータのシリアライズ、およびネットワーク経由での情報変換を行うためのプロトコルを選択（または定義）する必要があります。過去には、ゼロから新しいプロトコルを定義した技術（CORBAのIIOP）もあれば、再利用に重点を置いた技術（SOAPのHTTP POST）もありました。

### マーシャリングとシリアライゼーション {id="marshaling-vs-serialization"}

RPCフレームワークでは、_マーシャリング（marshaling）_ と _アンマーシャリング（unmarshaling）_ という言葉が使われます。これは、ネットワーク経由で送信される情報をパックおよびアンパックするプロセスのことです。これはシリアライゼーションのスーパーセット（上位集合）と考えることができます。マーシャリングでは、オブジェクトをシリアライズするだけでなく、呼び出されるプロシージャや、その呼び出しが行われたコンテキストに関する情報もパッケージ化する必要があります。

RPCのコアコンセプトを理解したところで、サンプルアプリケーションを構築して、これらが `kotlinx.rpc` でどのように適用されるかを見てみましょう。

## Hello, kotlinx.rpc {id="hello-kotlinx-rpc"}

ここでは、ネットワーク経由でピザを注文するためのアプリケーションを作成します。コードをできるだけシンプルに保つため、コンソールベースのクライアントを使用します。

### プロジェクトの作成 {id="create-project"}

まず、クライアントとサーバーの両方の実装を含むプロジェクトを作成します。

より複雑なアプリケーションでは、クライアントとサーバーで個別のモジュールを使用するのがベストプラクティスです。ただし、このチュートリアルではシンプルにするため、両方に単一のモジュールを使用します。

<procedure id="create-project-procedure">

1. [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) を起動します。
2. <p>
       ウェルカム画面で <control>New Project</control> をクリックします。
   </p>
   <p>
       または、メインメニューから <ui-path>File | New | Project</ui-path> を選択します。
   </p>
3. **Name** フィールドに、プロジェクト名として <Path>KotlinRpcPizzaApp</Path> と入力します。

   ![IntelliJ の新規 Kotlin プロジェクトウィンドウ](tutorial_kotlin_rpc_intellij_project.png){style="block" width="706" border-effect="rounded"}
4. その他のデフォルト設定はそのままにして、**Create** をクリックします。

</procedure>

通常はすぐにプロジェクトのビルドファイルを設定しますが、これは技術の理解を深めるものではない実装の詳細であるため、そのステップは最後に行います。

### 共有型の追加 {id="shared-types"}

あらゆるRPCプロジェクトの中心となるのは、リモートで呼び出されるプロシージャを定義するインターフェースと、それらのプロシージャの定義で使用される型です。

マルチモジュールプロジェクトではこれらの型を共有する必要がありますが、この例ではその手順は不要です。

<procedure id="shared-types-procedure">

1. <Path>src/main/kotlin</Path> フォルダに移動し、<Path>model</Path> という名前の新しいサブパッケージを作成します。
2. <Path>model</Path> パッケージ内に、次の実装を含む新しい <Path>PizzaShop.kt</Path> ファイルを作成します。

   ```kotlin
   package com.example.model
   
   import kotlinx.coroutines.flow.Flow
   import kotlinx.serialization.Serializable
   import kotlinx.rpc.annotations.Rpc
   
   @Rpc
   interface PizzaShop {
       suspend fun orderPizza(pizza: Pizza): Receipt
   }
   
   @Serializable
   class Pizza(val name: String)
   
   @Serializable
   class Receipt(val amount: Double)
   ```

   インターフェースには、`kotlinx.rpc` ライブラリの `@Rpc` アノテーションを付加する必要があります。

   ネットワーク経由の情報転送を支援するために [`kotlinx.serialization`](https://github.com/Kotlin/kotlinx.serialization) を使用しているため、パラメータで使用される型には `Serializable` アノテーションを付ける必要があります。

</procedure>

### クライアントの実装 {id="client-implementation"}

<procedure id="client-impl-procedure">

1. <Path>src/main/kotlin</Path> に移動し、新しい <Path>Client.kt</Path> ファイルを作成します。
2. <Path>Client.kt</Path> を開き、次の実装を追加します。

   ```kotlin
   package com.example
   
   import com.example.model.Pizza
   import com.example.model.PizzaShop
   import io.ktor.client.*
   import io.ktor.http.*
   import kotlinx.coroutines.runBlocking
   import kotlinx.rpc.withService
   import kotlinx.rpc.krpc.serialization.json.json
   import kotlinx.rpc.krpc.ktor.client.KtorRpcClient
   import kotlinx.rpc.krpc.ktor.client.installKrpc
   import kotlinx.rpc.krpc.ktor.client.rpc
   import kotlinx.rpc.krpc.ktor.client.rpcConfig
   import kotlinx.rpc.krpc.serialization.json.json
   
   fun main() = runBlocking {
       val ktorClient = HttpClient {
           installKrpc {
               serialization { json() }
           }
       }
   
       val client: KtorRpcClient = ktorClient.rpc {
           url {
               host = "localhost"
               port = 8080
               encodedPath = "pizza"
           }
   
           rpcConfig {
               serialization {
                   json()
               }
           }
       }
   
       val pizzaShop: PizzaShop = client.withService<PizzaShop>()
   
       val receipt = pizzaShop.orderPizza(Pizza("Pepperoni"))
       println("Your pizza cost ${receipt.amount}")
       ktorClient.close()
   }
   ```

</procedure>

上記のコードにより、RPC呼び出しの準備と実行が行われました。

`kotlinx.rpc` ライブラリは、クライアント側でランタイムをホストするために [Ktor クライアント](client-create-new-application.topic) を使用します。ランタイムはKtorに結合されておらず他の選択肢も可能ですが、これによって再利用が促進され、既存のKotlin Multiplatformアプリケーションに `kotlinx.rpc` を簡単に統合できるようになります。

KtorクライアントとKotlin RPCはどちらもコルーチンを中心に構築されているため、`runBlocking {}` ブロックを使用して初期コルーチンを作成し、その中でクライアントの残りの処理を実行します。

```kotlin
fun main() = runBlocking {
}
```

> `runBlocking {}` は本番用コードではなく、スパイク調査やテスト向けに設計されていることに注意してください。
>
{style="tip"}

次に、標準的な方法でKtorクライアントのインスタンスを作成します。`kotlinx.rpc` は情報の転送に [WebSockets](client-websockets.topic) プラグインを使用します。`installKrpc()` 関数を使用してプラグインが読み込まれていることを確認します。

```kotlin
val ktorClient = HttpClient {
    installKrpc {
        serialization { json() }
    }
}
```

Ktorクライアントを作成したら、リモートプロシージャを呼び出すための `KtorRpcClient` オブジェクトを作成します。サーバーの場所と情報の転送に使用するメカニズムを設定します。

```kotlin
    val client: KtorRpcClient = ktorClient.rpc {
        url {
            host = "localhost"
            port = 8080
            encodedPath = "pizza"
        }

        rpcConfig {
            serialization {
                json()
            }
        }
    }
```

この時点で標準のセットアップが完了し、問題のドメイン固有の機能を使用する準備が整いました。クライアントを使用して、`PizzaShop` インターフェースのメソッドを実装するクライアントプロキシオブジェクトを作成できます。

```kotlin
package com.example

import com.example.model.Pizza
import com.example.model.PizzaShop
import io.ktor.client.*
import io.ktor.http.*
import kotlinx.coroutines.runBlocking
import kotlinx.rpc.withService
import kotlinx.rpc.krpc.serialization.json.json
import kotlinx.rpc.krpc.ktor.client.KtorRpcClient
import kotlinx.rpc.krpc.ktor.client.installKrpc
import kotlinx.rpc.krpc.ktor.client.rpc
import kotlinx.rpc.krpc.ktor.client.rpcConfig
import kotlinx.rpc.krpc.serialization.json.json

fun main() = runBlocking {
    val ktorClient = HttpClient {
        installKrpc {
            serialization { json() }
        }
    }

    val client: KtorRpcClient = ktorClient.rpc {
        url {
            host = "localhost"
            port = 8080
            encodedPath = "pizza"
        }

        rpcConfig {
            serialization {
                json()
            }
        }
    }

    val pizzaShop: PizzaShop = client.withService<PizzaShop>()

    /*
    val receipt = pizzaShop.orderPizza(Pizza("Pepperoni"))
    println("Your pizza cost ${receipt.amount}")
    */

    pizzaShop.orderPizza("AB12", Pizza("Pepperoni"))
    pizzaShop.orderPizza("AB12", Pizza("Hawaiian"))
    pizzaShop.orderPizza("AB12", Pizza("Calzone"))

    pizzaShop.orderPizza("CD34", Pizza("Margherita"))
    pizzaShop.orderPizza("CD34", Pizza("Sicilian"))
    pizzaShop.orderPizza("CD34", Pizza("California"))

    pizzaShop.viewOrders("AB12").collect {
        println("AB12 ordered ${it.name}")
    }

    pizzaShop.viewOrders("CD34").collect {
        println("CD34 ordered ${it.name}")
    }

    ktorClient.close()
}

```

その後、リモートプロシージャコールを実行してその結果を使用できます。

```kotlin
val receipt = pizzaShop.orderPizza(Pizza("Pepperoni"))
println("Your pizza cost ${receipt.amount}")
```

この時点で、多くの処理が行われています。呼び出しの詳細とすべてのパラメータがメッセージに変換され、ネットワーク経由で送信され、戻り値が受信されてデコードされます。

最後に、クライアントを閉じます。

```kotlin
ktorClient.close()
```

### サーバーの実装 {id="server-implementation"}

サーバー側の実装は2つの部分に分かれます。まずインターフェースの実装を作成し、次にそれをサーバー内でホストします。

<procedure id="create-interface">

1. <Path>src/main/kotlin</Path> に移動し、新しい <Path>Server.kt</Path> ファイルを作成します。
2. <Path>Server.kt</Path> を開き、次のインターフェースを追加します。

   ```kotlin
   package com.example
   
   import com.example.model.*
   import io.ktor.server.application.*
   
   class PizzaShopImpl : PizzaShop {
       override suspend fun orderPizza(pizza: Pizza): Receipt {
           return Receipt(7.89)
       }
   }
   ```

   これは完全に機能する実装ではありませんが、デモを稼働させるには十分です。

   実装の2番目の部分はKtorをベースに構築します。
3. 同じファイルに次のコードを追加します。

   ```kotlin
   fun main() {
       embeddedServer(Netty, port = 8080) {
           module()
           println("Server running")
       }.start(wait = true)
   }
   
   fun Application.module() {
       install(Krpc)
   
       routing {
           rpc("/pizza") {
               rpcConfig {
                   serialization {
                       json()
                   }
               }
   
               registerService<PizzaShop> { PizzaShopImpl() }
           }
       }
   }
   ```

   詳細は以下のとおりです。

   まず、設定に使用する指定された拡張関数を用いて、Nettyを使用したKtorサーバーのインスタンスを作成します。

   ```kotlin
   embeddedServer(Netty, port = 8080) {
       module()
       println("Server running")
   }.start(wait = true)
   ```

   次に、Ktorの `Application` 型を拡張するセットアップ関数を宣言します。これにより、`kotlinx.rpc` プラグインがインストールされ、1つ以上のルートが宣言されます。

   ```kotlin
   fun Application.module() {
       install(Krpc)
   
       routing {
       }
   }
   ```

   ルーティングセクション内では、Ktor Routing DSLに対する `kotlinx.rpc` の拡張機能を使用してエンドポイントを宣言します。クライアントと同様にURLを指定してシリアライゼーションを設定しますが、この場合、実装はそのURLで受信リクエストをリッスンします。

   ```kotlin
           rpc("/pizza") {
               rpcConfig {
                   serialization {
                       json()
                   }
               }
   
               registerService<PizzaShop> { PizzaShopImpl() }
           }
   ```

   `registerService {}` を使用して、インターフェースの実装をRPCランタイムに提供します。

</procedure>

### 依存関係の追加 {id="add-dependencies"}

これでアプリケーションを実行するために必要なコードはすべて揃いましたが、現時点ではコンパイルすらできません。

[`kotlinx.rpc`](https://kotlin.github.io/kotlinx-rpc/get-started.html) プラグインを備えたKtor Project Generatorを使用することもできますが、ビルドファイルを手動で設定することもできます。

<procedure id="configure-build-files">

1. <Path>gradle/libs.versions.toml</Path> ファイルを開くか作成し、Kotlin、`kotlinx.rpc`、Logbackのバージョン、およびライブラリとプラグインのエイリアスを定義します。

   ```toml
   [versions]
   kotlin = "2.4.20"
   kotlinx-rpc = "0.10.4"
   logback = "1.6.3"
   
   [libraries]
   kotlin-test = { module = "org.jetbrains.kotlin:kotlin-test", version.ref = "kotlin" }
   kotlinx-rpc-krpc-client = { module = "org.jetbrains.kotlinx:kotlinx-rpc-krpc-client", version.ref = "kotlinx-rpc" }
   kotlinx-rpc-krpc-ktor-client = { module = "org.jetbrains.kotlinx:kotlinx-rpc-krpc-ktor-client", version.ref = "kotlinx-rpc" }
   kotlinx-rpc-krpc-ktor-server = { module = "org.jetbrains.kotlinx:kotlinx-rpc-krpc-ktor-server", version.ref = "kotlinx-rpc" }
   kotlinx-rpc-krpc-serialization-json = { module = "org.jetbrains.kotlinx:kotlinx-rpc-krpc-serialization-json", version.ref = "kotlinx-rpc" }
   kotlinx-rpc-krpc-server = { module = "org.jetbrains.kotlinx:kotlinx-rpc-krpc-server", version.ref = "kotlinx-rpc" }
   logback-classic = { module = "ch.qos.logback:logback-classic", version.ref = "logback" }
   
   [plugins]
   kotlin-jvm = { id = "org.jetbrains.kotlin.jvm", version.ref = "kotlin" }
   kotlin-serialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
   kotlinx-rpc = { id = "org.jetbrains.kotlinx.rpc.plugin", version.ref = "kotlinx-rpc" }
   
   ```

   Gradleは、ビルドファイル内の `libs` を通じてこれらのエイリアスを自動的に利用可能にします。
2. <Path>settings.gradle.kts</Path> ファイルを開き、Ktorバージョンカタログをインポートします。

   ```kotlin
   dependencyResolutionManagement {
       repositories {
           mavenCentral()
       }
       versionCatalogs {
           create("ktorLibs").from("io.ktor:ktor-version-catalog:3.6.1")
       }
   }
   ```

   このカタログは、`ktorLibs` を通じてKtorプラグインと依存関係のエイリアスを提供します。カタログ座標のバージョンによって、これらのエイリアスで使用されるKtorのバージョンが決まります。
3. <Path>build.gradle.kts</Path> ファイルに、次のプラグインを追加します。

   ```kotlin
   plugins {
       alias(libs.plugins.kotlin.jvm)
       alias(libs.plugins.kotlin.serialization)
       alias(ktorLibs.plugins.ktor)
       alias(libs.plugins.kotlinx.rpc)
   }
   ```

   * `kotlinx.serialization` プラグインは、KotlinオブジェクトをJSONに変換するためのヘルパー型を生成するために必要です。`kotlinx.serialization` はリフレクションを使用しないことを覚えておいてください。
   * Ktorプラグインは、アプリケーションをすべての依存関係とともにバンドルするファットJAR（fat JAR）をビルドするために使用されます。
   * RPCプラグインは、クライアント側のスタブを生成するために必要です。
4. 次の依存関係を追加します。

   ```kotlin
   dependencies {
       implementation(ktorLibs.client.cio)
       implementation(libs.kotlinx.rpc.krpc.client)
       implementation(libs.kotlinx.rpc.krpc.ktor.client)
       implementation(ktorLibs.server.netty)
       implementation(libs.kotlinx.rpc.krpc.server)
       implementation(libs.kotlinx.rpc.krpc.ktor.server)
       implementation(libs.kotlinx.rpc.krpc.serialization.json)
       implementation(libs.logback.classic)
       testImplementation(libs.kotlin.test)
   }
   ```

   これにより、Ktorのクライアントとサーバー、`kotlinx.rpc` ランタイムのクライアントおよびサーバー部分、そして `kotlinx.rpc` と `kotlinx-serialization` を統合するためのライブラリが追加されます。

   これでプロジェクトを実行し、RPC呼び出しを開始できるようになりました。

</procedure>

### アプリケーションの実行 {id="run-application"}

アプリケーションを実行するには、以下の手順に従います。

<procedure id="run-app-procedure">

1. <Path>Server.kt</Path> ファイルに移動します。
2. IntelliJ IDEAで、`main()` 関数の横にある実行ボタン
   (![IntelliJ IDEA の実行アイコン](intellij_idea_gutter_icon.svg){style="inline" height="16" width="16"})
   をクリックしてアプリケーションを開始します。

   **Run** ツールパネルに出力が表示されるはずです。

   ![IntelliJ IDEA でのサーバー実行出力](tutorial_kotlin_rpc_run_server.png){style="block" width="706" border-effect="line"}
3. <Path>Client.kt</Path> ファイルに移動し、アプリケーションを実行します。コンソールに次の出力が表示されます。

   ```shell
   Your pizza cost 7.89

   Process finished with exit code 0
   ```

</procedure>

## サンプルの拡張 {id="extend-the-example"}

最後に、今後の開発に向けた強固な基盤を確立するために、サンプルアプリケーションの複雑度を高めてみましょう。

<procedure id="extend-server">

1. <Path>PizzaShop.kt</Path> ファイルで、クライアントIDを含めるように `orderPizza` メソッドを拡張し、指定されたクライアントの保留中のすべての注文を返す `viewOrders()` メソッドを追加します。

   ```kotlin
   package com.example.model
   
   import kotlinx.coroutines.flow.Flow
   import kotlinx.serialization.Serializable
   import kotlinx.rpc.annotations.Rpc
   
   @Rpc
   interface PizzaShop {
       suspend fun orderPizza(clientID: String, pizza: Pizza): Receipt
       fun viewOrders(clientID: String): Flow<Pizza>
   }
   ```

   `List` や `Set` ではなく `Flow` を返すことで、コルーチンライブラリの利点を活用できます。これにより、ピザの注文を1つずつクライアントにストリーミングできるようになります。
2. <Path>Server.kt</Path> ファイルに移動し、現在の注文をリストのマップに格納することでこの機能を実装します。

   ```kotlin
   class PizzaShopImpl : PizzaShop {
       private val openOrders = mutableMapOf<String, MutableList<Pizza>>()
   
       override suspend fun orderPizza(clientID: String, pizza: Pizza): Receipt {
           if(openOrders.containsKey(clientID)) {
               openOrders[clientID]?.add(pizza)
           } else {
               openOrders[clientID] = mutableListOf(pizza)
           }
           return Receipt(3.45)
       }
   
       override fun viewOrders(clientID: String): Flow<Pizza> {
           val orders = openOrders[clientID]
           if (orders != null) {
               return flow {
                   for (order in orders) {
                       emit(order)
                       delay(1000)
                   }
               }
           }
           return flow {}
       }
   }
   ```

   サーバーは、接続されたクライアントごとに新しい `PizzaShopImpl` インスタンスを作成します。これにより、クライアントの状態が分離され、クライアント間の競合が回避されます。
   > この実装はスレッドセーフではありません。同じ `PizzaShopImpl` インスタンスが並行呼び出しを受信した場合、同時に `openOrders` が変更されて破損する可能性があります。本番環境のコードでは、スレッドセーフな構造を使用してください。
   > 
   {style="warning"}
3. <Path>Client.kt</Path> ファイルで、2つの異なるクライアントIDを使用して複数の注文を送信します。

   ```kotlin
       val pizzaShop: PizzaShop = client.withService<PizzaShop>()
   
       pizzaShop.orderPizza("AB12", Pizza("Pepperoni"))
       pizzaShop.orderPizza("AB12", Pizza("Hawaiian"))
       pizzaShop.orderPizza("AB12", Pizza("Calzone"))
   
       pizzaShop.orderPizza("CD34", Pizza("Margherita"))
       pizzaShop.orderPizza("CD34", Pizza("Sicilian"))
       pizzaShop.orderPizza("CD34", Pizza("California"))
   ```

   次に、`Coroutines` ライブラリと `collect` メソッドを使用して、結果を反復処理します。

   ```kotlin
       pizzaShop.viewOrders("AB12").collect {
           println("AB12 ordered ${it.name}")
       }
   
       pizzaShop.viewOrders("CD34").collect {
           println("CD34 ordered ${it.name}")
       }
   ```
4. サーバーとクライアントを実行します。クライアントを実行すると、結果が段階的に表示されるのが確認できます。

   ![結果を段階的に表示するクライアント出力](tutorial_kotlin_rpc_run_client.gif){style="block" width="706" border-effect="line"}

</procedure>

動作するサンプルを作成できたので、次にすべてがどのように機能しているかを詳しく見ていきましょう。特に、Kotlin RPCと主要な2つの代替手法であるRESTおよびgRPCとの比較を行います。

## RPC と REST {id="rpc-vs-rest"}

RPCの概念はRESTよりもはるかに古く、[少なくとも1981年にまで遡ります](https://en.wikipedia.org/wiki/Remote_procedure_call)。RESTと比較した場合、RPCベースのアプローチでは統一インターフェース（HTTPリクエストタイプなど）に制約されず、コード内での扱いがはるかにシンプルであり、バイナリメッセージングのおかげでパフォーマンスが向上する可能性があります。

ただし、RESTには大きな3つの利点があります。

1. ブラウザ内のJavaScriptクライアントから直接使用できるため、シングルページアプリケーションの一部として利用できます。RPCフレームワークは生成されたスタブとバイナリメッセージングに依存するため、JavaScriptエコシステムにはうまく適合しません。
2. RESTを使用すると、機能がいつネットワーキングを伴うかが明確になります。これにより、Martin Fowler氏が指摘した [分散オブジェクトアンチパターン](https://martinfowler.com/articles/distributed-objects-microservices.html) を回避しやすくなります。このアンチパターンは、ローカルプロシージャコールをリモート化することによるパフォーマンスと信頼性への影響を考慮せずに、チームがオブジェクト指向設計を複数の部分に分割したときに発生します。
3. REST APIは一連の規約に基づいて構築されているため、作成、文書化、監視、デバッグ、テストが比較的容易です。これをサポートする巨大なツールエコシステムが存在します。

これらのトレードオフを考慮すると、Kotlin RPCは2つのシナリオで最適に使用できます。1つ目は [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/) を使用するKMPクライアント内、2つ目はクラウド内で連携するマイクロサービス間です。[Kotlin/Wasm](https://kotlinlang.org/docs/wasm-overview.html) の今後の進展により、`kotlinx.rpc` をブラウザベースのアプリケーションにもより適用しやすくなる可能性があります。

## Kotlin RPC と Google RPC {id="kotlin-rpc-vs-google-rpc"}

Google RPC（gRPC）は、現在ソフトウェア業界で支配的なRPCテクノロジーです。Protocol Buffers（protobuf）と呼ばれる標準を使用して、言語中立的なインターフェース定義言語（IDL）でデータ構造とメッセージペイロードを定義します。これらのIDL定義は多種多様なプログラミング言語に変換でき、コンパクトで効率的なバイナリ形式を使用してシリアライズされます。QuarkusやMicronautのようなマイクロサービスフレームワークは、すでにgRPCをサポートしています。

Kotlin RPCがgRPCと競合することは困難であり、Kotlinコミュニティにとってもメリットはありません。幸いなことに、競合する予定はありません。代わりに、kotlinx.rpcをgRPCと互換性および相互運用性を持たせることが意図されています。kotlinx.rpcサービスがネットワークプロトコルとしてgRPCを使用したり、kotlinx.rpcクライアントがgRPCサービスを呼び出したりすることが可能になります。`kotlinx.rpc` はデフォルトのオプションとして [独自のkRPCプロトコル](https://kotlin.github.io/kotlinx-rpc/transport.html) を使用しますが（今回のサンプルの場合と同様）、代わりにgRPCを選択することを妨げるものは何もありません。

## 次のステップ {id="next-steps"}

Kotlin RPCはKotlinエコシステムを新たな方向へと拡張し、サービスの作成と利用においてRESTやGraphQLに代わる選択肢を提供します。Ktor、Coroutines、`kotlinx-serialization` など、実績のあるライブラリやフレームワーク上に構築されています。Kotlin MultiplatformやCompose Multiplatformを活用しようとしているチームにとって、分散メッセージングのためのシンプルで効率的なオプションを提供します。

この入門編で興味を持たれた方は、ぜひ [公式 `kotlinx.rpc` ドキュメント](https://kotlin.github.io/kotlinx-rpc/get-started.html) と [サンプル](https://github.com/Kotlin/kotlinx-rpc/tree/main/samples) をチェックしてみてください。

`kotlinx.rpc` ライブラリはまだ初期段階にあるため、ぜひ実際に試してフィードバックを共有してください。バグ報告や機能リクエストは [YouTrack](https://youtrack.jetbrains.com/issues/KRPC) で受け付けており、一般的な議論は [Slack](https://kotlinlang.slack.com/archives/C072YJ3Q91V) で行われています（[アクセスリクエストはこちら](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)）。