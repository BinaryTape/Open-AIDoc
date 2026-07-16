[//]: # (title: 設定 DI 外掛程式)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<b>必要的相依性</b>：<code>io.ktor:ktor-server-di</code>
</p>
<var name="example_name" value="server-di"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

您可以在應用程式配置文件中設定 [相依注入 (DI) 外掛程式](server-dependency-injection.md)。這些設定會全域影響相依性解析的行為，並套用於所有註冊的相依性。

### 相依性金鑰對應 (Dependency key mapping)

`ktor.di.keyMapping` 屬性定義了在解析期間如何將相依性金鑰泛化並進行比對。這決定了在解析請求的型別時，哪些註冊的相依性被視為相容。

```yaml
ktor:
  di:
    keyMapping: Supertypes * Nullables * OutTypeArgumentsSupertypes * RawTypes
```

上述範例符合 DI 外掛程式使用的預設金鑰對應。

#### 可用的金鑰對應選項

<deflist>
<def>
<title><code>Default</code></title>
使用預設組合：
<code-block code="Supertypes * Nullables * OutTypeArgumentsSupertypes * RawTypes"></code-block>
</def>
<def>
<title><code>Supertypes</code></title>
允許使用其任何基底型別來解析相依性。
</def>
<def>
<title><code>Nullables</code></title>
允許比對某個型別的可為 null 與不可為 null 變體。
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
比對時忽略相依性名稱 (<code>@Named</code>)。
</def>
</deflist>

#### 組合金鑰對應選項

您可以使用集合運算子 `*`（交集）、`+`（聯集）和 `()`（圓括號分組）來組合金鑰對應選項。

在以下範例中，註冊為 `List<String>` 的相依性可以被解析為 `Collection<String>` (`Supertypes`)、`List` 或 `List?` (`RawTypes` 和 `Nullables`)：

```yaml
ktor:
  di:
    keyMapping: Supertypes + (Nullables * RawTypes)
```

它將無法解析為 `Collection?`，因為該組合未包含在運算式中。

### 衝突解決策略 (Conflict resolution policy)

`ktor.di.conflictPolicy` 屬性控制當針對同一個相依性金鑰註冊了多個提供者時，DI 容器的行為：

```yaml
ktor:
  di:
    conflictPolicy: Default
```

#### 可用的策略

<deflist>
<def>
<title><code>Default</code></title>
當宣告衝突的相依性時拋出例外。
</def>
<def>
<title><code>OverridePrevious</code></title>
使用新提供的相依性覆寫先前的相依性。
</def>
<def>
<title><code>IgnoreConflicts</code></title>
在測試環境中，DI 外掛程式預設使用 <code>IgnoreConflicts</code>。這允許測試程式碼覆寫生產環境相依性而不會觸發錯誤。
</def>
</deflist>