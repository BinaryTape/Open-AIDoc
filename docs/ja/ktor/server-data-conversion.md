[//]: # (title: データ変換)

<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-data-conversion"/>
<var name="package_name" value="io.ktor.server.plugins.dataconversion"/>
<var name="plugin_name" value="DataConversion"/>
<var name="example_name" value="data-conversion"/>

<tldr>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="KtorはKotlin/Nativeをサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。">Nativeサーバー</Links>のサポート</b>: ✅
</p>
</tldr>

<link-summary>
Ktorサーバーの %plugin_name% プラグインを使用すると、値のリストをシリアライズおよびデシリアライズするためのカスタムコンバーターを追加できます。
</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-utils/io.ktor.util.converters/-data-conversion/index.html) プラグインを使用すると、値のリストをシリアライズ（serialize）およびデシリアライズ（deserialize）できます。デフォルトでは、Ktorは [DefaultConversionService](https://api.ktor.io/ktor-utils/io.ktor.util.converters/-default-conversion-service/index.html) を通じてプリミティブ型と列挙型（enum）を処理します。`%plugin_name%` プラグインをインストールして構成することで、このサービスを拡張して追加の型を処理できるようになります。

## 依存関係の追加 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code> を使用するには、ビルドスクリプトに <code>%artifact_name%</code> アーティファクトを含める必要があります。
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"></code-block>
    </TabItem>
</Tabs>

## %plugin_name% のインストール {id="install_plugin"}

<p>
    アプリケーションに <code>%plugin_name%</code> プラグインを<a href="#install">インストール</a>するには、指定された <Links href="/ktor/server-modules" summary="モジュールを使用すると、ルートをグループ化してアプリケーションを構造化できます。">モジュール</Links>内の <code>install</code> 関数に渡します。
    以下のコードスニペットは、<code>%plugin_name%</code> をインストールする方法を示しています。
</p>
<list>
    <li>
        ... <code>embeddedServer</code> 関数の呼び出し内。
    </li>
    <li>
        ... <code>Application</code> クラスの拡張関数である、明示的に定義された <code>module</code> 内。
    </li>
</list>
<Tabs>
    <TabItem title="embeddedServer">
        <code-block lang="kotlin" code="            import io.ktor.server.engine.*&#10;            import io.ktor.server.netty.*&#10;            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;&#10;            fun main() {&#10;                embeddedServer(Netty, port = 8080) {&#10;                    install(%plugin_name%)&#10;                    // ...&#10;                }.start(wait = true)&#10;            }"></code-block>
    </TabItem>
    <TabItem title="module">
        <code-block lang="kotlin" code="            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;            // ...&#10;            fun Application.module() {&#10;                install(%plugin_name%)&#10;                // ...&#10;            }"></code-block>
    </TabItem>
</Tabs>

## コンバーターの追加 {id="add-converters"}

`%plugin_name%` の構成内で型変換を定義できます。指定した型に対して `convert<T>` メソッドを提供し、利用可能な関数を使用して値のリストをシリアライズおよびデシリアライズします。

* 値のリストをデシリアライズするには、`decode()` 関数を使用します。これは、URL内の繰り返される値を表す文字列のリストを受け取り、デコードされた値を返します。

  ```kotlin
  decode { values -> // コンバーター: (values: List<String>) -> Any?
    // 値をデシリアライズする
  }
  ```

* 値をシリアライズするには、`encode()` 関数を使用します。この関数は任意の値を受け取り、それを表す文字列のリストを返します。

  ```kotlin
     encode { value -> // コンバーター: (value: Any?) -> List<String>
       // 値をシリアライズする
      }
  ```

## サービスへのアクセス

{id="service"}

現在のコンテキストから `%plugin_name%` サービスにアクセスできます。

```kotlin
val dataConversion = application.conversionService
```

その後、コンバーターサービスを使用してコールバック関数を呼び出すことができます。

* `fromValues(values: List<String>, type: TypeInfo)` コールバック関数は、文字列のリストとしての `values` と、値を変換する先の `TypeInfo` を受け取り、デコードされた値を返します。
* `toValues(value: Any?)` コールバック関数は、任意の値を受け取り、それを表す文字列のリストを返します。

## 例

次の例では、`LocalDate` 型のコンバーターが定義され、値をシリアライズおよびデシリアライズするように構成されています。`encode` 関数が呼び出されると、サービスは `SimpleDateFormat` を使用して値を変換し、フォーマットされた値を含むリストを返します。
`decode` 関数が呼び出されると、サービスは日付を `LocalDate` としてフォーマットして返します。

```kotlin
    install(DataConversion) {
        convert<LocalDate> { // this: DelegatingConversionService
            val formatter = DateTimeFormatterBuilder()
                .appendValue(ChronoField.YEAR, 4, 4, SignStyle.NEVER)
                .appendValue(ChronoField.MONTH_OF_YEAR, 2)
                .appendValue(ChronoField.DAY_OF_MONTH, 2)
                .toFormatter(Locale.ROOT)

            decode { values -> // コンバーター: (values: List<String>) -> Any?
                LocalDate.from(formatter.parse(values.single()))
            }

            encode { value -> // コンバーター: (value: Any?) -> List<String>
                listOf(SimpleDateFormat.getInstance().format(value))
            }
        }
    }
```

その後、変換サービスを手動で呼び出して、エンコードおよびデコードされた値を取得できます。

```kotlin
val encodedDate = application.conversionService.toValues(call.parameters["date"])
val decodedDate = application.conversionService.fromValues(encodedDate, typeInfo<LocalDate>())
```

完全な例については、[%example_name%](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%) を参照してください。