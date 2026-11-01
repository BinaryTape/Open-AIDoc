[//]: # (title: DIプラグインの設定)

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

アプリケーション設定ファイルで[依存性注入（DI）プラグイン](server-dependency-injection.md)を設定できます。これらの設定は依存関係解決の動作にグローバルに影響し、登録されているすべての依存関係に適用されます。

### 依存関係キーのマッピング {id="dependency-key-mapping"}

`ktor.di.keyMapping` プロパティは、依存関係の解決時にキーをどのように一般化し、マッチングするかを定義します。これにより、要求された型を解決する際に、どの登録済み依存関係が互換性があるとみなされるかが決定されます。

```yaml
ktor:
  di:
    keyMapping: Supertypes * Nullables * OutTypeArgumentsSupertypes * RawTypes
```

上記の例は、DIプラグインで使用されるデフォルトのキーマッピングに一致します。

#### 利用可能なキーマッピングオプション {id="available-key-mapping-options"}

<deflist>
<def>
<title><code>Default</code></title>
デフォルトの組み合わせを使用します:
<code-block code="Supertypes * Nullables * OutTypeArgumentsSupertypes * RawTypes"/>
</def>
<def>
<title><code>Supertypes</code></title>
任意のスーパータイプを使用して依存関係を解決できるようにします。
</def>
<def>
<title><code>Nullables</code></title>
型のNullable（null許容）およびNon-Nullableのバリアントをマッチングできるようにします。
</def>
<def>
<title><code>OutTypeArgumentsSupertypes</code></title>
<code>out</code> 型引数での共変性を許可します。
</def>
<def>
<title><code>RawTypes</code></title>
型引数を考慮せずにジェネリック型を解決できるようにします。
</def>
<def>
<title><code>Unnamed</code></title>
マッチング時に依存関係の名前（<code>@Named</code>）を無視します。
</def>
</deflist>

#### キーマッピングオプションの組み合わせ {id="combine-key-mapping-options"}

集合演算子 `*`（積集合）、`+`（和集合）、および `()`（グループ化）を使用して、キーマッピングオプションを組み合わせることができます。

以下の例では、`List<String>` として登録された依存関係を、`Collection<String>`（`Supertypes`）、`List` または `List?`（`RawTypes` および `Nullables`）として解決できます。

```yaml
ktor:
  di:
    keyMapping: Supertypes + (Nullables * RawTypes)
```

その組み合わせが式に含まれていないため、`Collection?` としては解決されません。

### 競合解決ポリシー {id="conflict-resolution-policy"}

`ktor.di.conflictPolicy` プロパティは、同じ依存関係キーに対して複数のプロバイダーが登録された場合のDIコンテナの動作を制御します。

```yaml
ktor:
  di:
    conflictPolicy: Default
```

#### 利用可能なポリシー {id="available-policies"}

<deflist>
<def>
<title><code>Default</code></title>
競合する依存関係が宣言された場合に例外をスローします。
</def>
<def>
<title><code>OverridePrevious</code></title>
新しく提供された依存関係で以前の依存関係を上書きします。
</def>
<def>
<title><code>IgnoreConflicts</code></title>
テスト環境では、DIプラグインはデフォルトで <code>IgnoreConflicts</code> を使用します。これにより、テストコードでエラーを発生させることなく本番環境の依存関係を上書きできます。
</def>
</deflist>