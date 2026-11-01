[//]: # (title: 設定 DI 外掛程式)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:ktor-server-di</code>
</p>
<var name="example_name" value="server-di"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

你可以在應用程式配置檔案中設定[相依注入 (DI) 外掛程式](server-dependency-injection.md)。這些設定會在全域影響相依性解析的行為，並套用至所有已註冊的相依性。

### 相依鍵對應 {id="dependency-key-mapping"}

`ktor.di.keyMapping` 屬性定義了在解析期間相依鍵如何被一般化與配對。這決定了在解析請求的型別時，哪些已註冊的相依性會被視為相容。

```yaml
ktor:
  di:
    keyMapping: Supertypes * Nullables * OutTypeArgumentsSupertypes * RawTypes
```

上述範例符合 DI 外掛程式所使用的預設鍵對應。

#### 可用的鍵對應選項 {id="available-key-mapping-options"}

<deflist>
<def>
<title><code>Default</code></title>
使用預設組合：
<code-block code="Supertypes * Nullables * OutTypeArgumentsSupertypes * RawTypes"/>
</def>
<def>
<title><code>Supertypes</code></title>
允許使用相依性的任何超型別（supertype）來解析相依性。
</def>
<def>
<title><code>Nullables</code></title>
允許配對型別的可為空（nullable）與不可為空變體。
</def>
<def>
<title><code>OutTypeArgumentsSupertypes</code></title>
允許 <code>out</code> 型別參數上的共變性。
</def>
<def>
<title><code>RawTypes</code></title>
允許在不考慮型別引數的情況下解析泛型型別。
</def>
<def>
<title><code>Unnamed</code></title>
配對時忽略相依性名稱（<code>@Named</code>）。
</def>
</deflist>

#### 組合鍵對應選項 {id="combine-key-mapping-options"}

你可以使用集合運算子 `*`（交集）、`+`（聯集）和 `()`（分組）來組合鍵對應選項。

在以下範例中，註冊為 `List<String>` 的相依性可以被解析為 `Collection<String>`（`Supertypes`）、`List` 或 `List?`（`RawTypes` 與 `Nullables`）：

```yaml
ktor:
  di:
    keyMapping: Supertypes + (Nullables * RawTypes)
```

它不會被解析為 `Collection?`，因為該運算式中未包含此組合。

### 衝突解決策略 {id="conflict-resolution-policy"}

`ktor.di.conflictPolicy` 屬性控制當同一個相依鍵註冊了多個提供者時，DI 容器的行為方式：

```yaml
ktor:
  di:
    conflictPolicy: Default
```

#### 可用的策略 {id="available-policies"}

<deflist>
<def>
<title><code>Default</code></title>
當宣告衝突的相依性時擲回例外。
</def>
<def>
<title><code>OverridePrevious</code></title>
使用新提供的相依性覆寫先前的相依性。
</def>
<def>
<title><code>IgnoreConflicts</code></title>
在測試環境中，DI 外掛程式預設使用 <code>IgnoreConflicts</code>。這允許測試程式碼覆寫正式環境的相依性而不會觸發錯誤。
</def>
</deflist>