[//]: # (title: 定義檔)

Kotlin/Native 讓你能夠取用 C 與 Objective-C 程式庫，使你能在 Kotlin 中使用它們的功能。
一個名為 cinterop 的特殊工具會處理 C 或 Objective-C 程式庫並產生對應的 Kotlin 繫結，
以便在你的 Kotlin 程式碼中像往常一樣使用該程式庫的方法。

要產生這些繫結，每個程式庫都需要一個定義檔，通常與該程式庫同名。
這是一個屬性檔案，詳細描述了該程式庫應如何被取用。請參閱完整的 [可用屬性列表](#properties)。

以下是處理專案時的一般工作流程：

1. 建立一個 `.def` 檔案，描述繫結中要包含的內容。
2. 在你的 Kotlin 程式碼中使用產生的繫結。
3. 執行 Kotlin/Native 編譯器以產生最終的可執行檔。

## 建立並設定定義檔 {id="create-and-configure-a-definition-file"}

讓我們為一個 C 程式庫建立定義檔並產生繫結：

1. 在你的 IDE 中，選取 `src` 資料夾，並透過 **File | New | Directory** 建立一個新目錄。
2. 將新目錄命名為 `nativeInterop/cinterop`。
   
   這是 `.def` 檔案位置的預設慣例，但如果你使用不同的位置，可以在 `build.gradle.kts` 檔案中進行覆寫。
3. 選取該新子資料夾，並透過 **File | New | File** 建立一個 `png.def` 檔案。
4. 加入必要的屬性：

   ```none
   headers = png.h
   headerFilter = png.h
   package = png
   
   compilerOpts.linux = -I/usr/include -I/usr/include/x86_64-linux-gnu
   linkerOpts.osx = -L/opt/local/lib -L/usr/local/opt/png/lib -lpng
   linkerOpts.linux = -L/usr/lib/x86_64-linux-gnu -lpng
   ```

   * `headers` 是要為其產生 Kotlin 虛設常式的標頭檔列表。你可以在此項目中加入多個檔案，並以空格分隔。在本例中，只有 `png.h`。引用的檔案需要存在於指定的路徑中（在本例中為 `/usr/include/png`）。
   * `headerFilter` 顯示具體包含的內容。在 C 語言中，當一個檔案透過 `#include` 指示詞引用另一個檔案時，所有的標頭也都會被包含進來。有時這並非必要，你可以[使用萬用字元模式 (glob patterns)](https://en.wikipedia.org/wiki/Glob_(programming)) 加入此參數來進行調整。

     如果你不想將外部相依性（例如系統的 `stdint.h` 標頭）提取到 interop 程式庫中，可以使用 `headerFilter`。此外，這對於程式庫大小最佳化，以及修正系統與提供的 Kotlin/Native 編譯環境之間潛在的衝突也很有用。

   * 如果需要修改特定平台的行為，你可以使用 `compilerOpts.osx` 或 `compilerOpts.linux` 之類的格式為選項提供特定平台的設定值。在本例中，分別為 macOS（`.osx` 後綴）和 Linux（`.linux` 後綴）。不帶後綴的參數也是可行的（例如 `linkerOpts=`），並會套用到所有平台。

5. 要產生繫結，請點擊通知中的 **Sync Now** 來同步 Gradle 檔案。

   ![同步 Gradle 檔案](gradle-sync.png)

產生繫結後，IDE 可以將其作為原生程式庫的代理檢視來使用。

> 你也可以在命令列中使用 [cinterop 工具](#generate-bindings-using-command-line) 來設定繫結產生。
> 
{style="tip"}

## 屬性 {id="properties"}

以下是可以在定義檔中使用的屬性完整列表，用以調整產生的二進位檔內容。
如需更多資訊，請參閱下方的對應章節。

| **屬性**                                                                        | **說明**                                                                                                                                                                                                          |
|-------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`headers`](#import-headers)                                                        | 要包含在繫結中的程式庫標頭列表。                                                                                                                                                       |
| [`modules`](#import-modules)                                                        | 要包含在繫結中的 Objective-C 程式庫 Clang 模組列表。                                                                                                                                    |
| `language`                                                                          | 指定語言。預設使用 C；如有必要請更改為 `Objective-C`。                                                                                                                                      |
| [`compilerOpts`](#pass-compiler-and-linker-options)                                 | `cinterop` 工具傳遞給 C 編譯器的編譯器選項。                                                                                                                                                        |
| [`linkerOpts`](#pass-compiler-and-linker-options)                                   | `cinterop` 工具傳遞給連結器的連結器選項。                                                                                                                                                              |
| [`excludedFunctions`](#ignore-specific-functions)                                   | 以空格分隔的應忽略函式名稱列表。                                                                                                                                                         |                                              
| [`staticLibraries`](#include-a-static-library)                                      | [實驗性](components-stability.md#stability-levels-explained)。將靜態程式庫包含到 `.klib` 中。                                                                                                              |
| [`libraryPaths`](#include-a-static-library)                                         | [實驗性](components-stability.md#stability-levels-explained)。以空格分隔的目錄列表，`cinterop` 工具會在這些目錄中搜尋要包含在 `.klib` 中的程式庫。                                    |
| [`package`](#set-the-package-name)                                                  | 產生的 Kotlin API 的套件前綴。                                                                                                                                                                             |
| [`headerFilter`](#filter-headers-by-globs)                                          | 透過萬用字元篩選標頭，並在匯入程式庫時僅包含它們。                                                                                                                                                |
| [`excludeFilter`](#exclude-headers)                                                 | 在匯入程式庫時排除特定的標頭，其優先級高於 `headerFilter`。                                                                                                                               |
| [`strictEnums`](#configure-enums-generation)                                        | 應產生為 [Kotlin 列舉](enum-classes.md) 的以空格分隔的列舉列表。                                                                                                                             |
| [`nonStrictEnums`](#configure-enums-generation)                                     | 應產生為整數值的以空格分隔的列舉列表。                                                                                                                                             |
| [`noStringConversion`](#set-up-string-conversion)                                   | 應停用將 `const char*` 參數自動轉換為 Kotlin `String` 的以空格分隔的函式列表。                                                                                                     |
| `allowedOverloadsForCFunctions`                                                     | 預設情況下，假設 C 函式具有唯一的名稱。如果多個函式具有相同的名稱，則只會挑選一個。不過，你可以透過在 `allowedOverloadsForCFunctions` 中指定這些函式來更改此行為。 |
| [`disableDesignatedInitializerChecks`](#allow-calling-a-non-designated-initializer) | 停用編譯器檢查，該檢查不允許將非指定的 Objective-C 初始設定式作為 `super()` 建構函式呼叫。                                                                                              |
| [`foreignExceptionMode`](#handle-objective-c-exceptions)                            | 將來自 Objective-C 程式碼的例外狀況封裝為具有 `ForeignException` 型別的 Kotlin 例外狀況。                                                                                                                          |
| [`userSetupHint`](#help-resolve-linker-errors)                                      | 加入自訂訊息，例如協助使用者解決連結器錯誤。                                                                                                                                                 |

<!-- | `excludedMacros`                                                                    |                                                                                                                                                                                                                          |
| `objcClassesIncludingCategories`                                                    |                                                                                                                                                                                                                          | -->

除了屬性列表外，你還可以在定義檔中包含 [自訂宣告](#add-custom-declarations)。

### 匯入標頭 {id="import-headers"}

如果 C 程式庫沒有 Clang 模組，而是由一組標頭組成，請使用 `headers` 屬性指定應匯入的標頭：

```none
headers = curl/curl.h
```

#### 透過萬用字元篩選標頭 {id="filter-headers-by-globs"}

你可以使用 `.def` 檔案中的篩選屬性，透過萬用字元來篩選標頭。要包含來自標頭的宣告，請使用 `headerFilter` 屬性。如果標頭符合任何萬用字元，其宣告就會包含在繫結中。

萬用字元會套用於相對於適當包含路徑元素的標頭路徑，例如 `time.h` 或 `curl/curl.h`。因此，如果該程式庫通常透過 `#include <SomeLibrary/Header.h>` 包含，你可能可以使用以下篩選器來篩選標頭：

```none
headerFilter = SomeLibrary/**
```

如果未提供 `headerFilter`，則會包含所有標頭。然而，我們鼓勵你使用 `headerFilter` 並儘可能精確地指定萬用字元。在這種情況下，產生的程式庫僅包含必要的宣告。這有助於在升級 Kotlin 或開發環境中的工具時避免各種問題。

#### 排除標頭 {id="exclude-headers"}

要排除特定的標頭，請使用 `excludeFilter` 屬性。這對於移除冗餘或有問題的標頭並最佳化編譯很有幫助，因為指定標頭中的宣告將不會包含在繫結中：

```none
excludeFilter = SomeLibrary/time.h
```

> 如果同一個標頭既被 `headerFilter` 包含，又被 `excludeFilter` 排除，則該指定標頭將不會包含在繫結中。
>
{style="note"}

### 匯入模組 {id="import-modules"}

如果 Objective-C 程式庫具有 Clang 模組，請使用 `modules` 屬性指定要匯入的模組：

```none
modules = UIKit
```

### 設定套件名稱 {id="set-the-package-name"}

使用 `package` 屬性為產生的 Kotlin API 指定套件前綴：

```none
package = png
```

如果未指定此屬性，編譯器會在根套件中產生宣告。

> `kotlin` 與 `kotlinx.cinterop` 名稱為保留名稱，不能用作套件前綴。
>
{style="note"}

### 傳遞編譯器和連結器選項 {id="pass-compiler-and-linker-options"}

使用 `compilerOpts` 屬性將選項傳遞給 C 編譯器，該編譯器在幕後用於分析標頭。要將選項傳遞給用於連結最終可執行檔的連結器，請使用 `linkerOpts`。例如：

```none
compilerOpts = -DFOO=bar
linkerOpts = -lpng
```

你也可以指定僅套用於特定目標的目標特定選項：

```none
compilerOpts = -DBAR=bar
compilerOpts.linux_x64 = -DFOO=foo1
compilerOpts.macos_x64 = -DFOO=foo2
```

在此組態下，標頭在 Linux 上使用 `-DBAR=bar -DFOO=foo1` 進行分析，在 macOS 上則使用 `-DBAR=bar -DFOO=foo2`。請注意，任何定義檔選項都可以同時具有通用部分和平台特定部分。

### 忽略特定函式 {id="ignore-specific-functions"}

使用 `excludedFunctions` 屬性指定應忽略的函式名稱列表。如果標頭中宣告的函式無法保證可以呼叫，且難以或無法自動判斷時，這會很有用。你也可以使用此屬性來解決 interop 本身的錯誤。

### 包含靜態程式庫 {id="include-a-static-library"}

<primary-label ref="experimental-general"/>

有時將靜態程式庫隨你的產品一起交付會比假設使用者環境中已具備該程式庫更為方便。要將靜態程式庫包含到 `.klib` 中，請使用 `staticLibrary` 和 `libraryPaths` 屬性：

```none
headers = foo.h
staticLibraries = libfoo.a
libraryPaths = /opt/local/lib /usr/local/opt/curl/lib
```

給定上述程式碼片段時，`cinterop` 工具會在 `/opt/local/lib` 和 `/usr/local/opt/curl/lib` 中搜尋 `libfoo.a`，如果找到，則將該程式庫二進位檔包含在 `klib` 中。

在你的程式中使用這樣的 `klib` 時，程式庫會自動連結。

### 設定列舉產生 {id="configure-enums-generation"}

使用 `strictEnums` 屬性將列舉產生為 Kotlin 列舉，或使用 `nonStrictEnums` 將其產生為整數值。如果列舉未包含在這些列表中的任何一個，則會根據啟發式方法產生。

### 設定字串轉換 {id="set-up-string-conversion"}

使用 `noStringConversion` 屬性來停用將 `const char*` 函式參數自動轉換為 Kotlin `String` 的功能。

### 允許呼叫非指定的初始設定式 {id="allow-calling-a-non-designated-initializer"}

預設情況下，Kotlin/Native 編譯器不允許將非指定的 Objective-C 初始設定式作為 `super()` 建構函式呼叫。如果程式庫中未正確標記指定的 Objective-C 初始設定式，此行為可能會帶來不便。要停用這些編譯器檢查，請使用 `disableDesignatedInitializerChecks` 屬性。

### 處理 Objective-C 例外狀況 {id="handle-objective-c-exceptions"}

預設情況下，如果 Objective-C 例外狀況到達 Objective-C 與 Kotlin 的 interop 邊界並進入 Kotlin 程式碼，程式將會崩潰。

要將 Objective-C 例外狀況傳遞到 Kotlin，請透過 `foreignExceptionMode = objc-wrap` 屬性啟用封裝。在這種情況下，Objective-C 例外狀況會被轉換為具有 `ForeignException` 型別的 Kotlin 例外狀況。

### 協助解決連結器錯誤 {id="help-resolve-linker-errors"}

當 Kotlin 程式庫相依於 C 或 Objective-C 程式庫時（例如使用 [CocoaPods 整合](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-overview.html)），可能會發生連結器錯誤。如果相依的程式庫未在本機電腦上安裝，或未在專案組建指令碼中明確設定，則會發生 "Framework not found" 錯誤。

如果你是程式庫作者，你可以透過自訂訊息協助你的使用者解決連結器錯誤。
為此，請在你的 `.def` 檔案中加入 `userSetupHint=message` 屬性，或者將 `-Xuser-setup-hint` 編譯器選項傳遞給 `cinterop`。

### 加入自訂宣告 {id="add-custom-declarations"}

有時需要在產生繫結之前向程式庫加入自訂的 C 宣告（例如為了 [巨集](native-c-interop.md#macros)）。
你不需要為這些宣告建立額外的標頭檔，而是可以直接將它們包含在 `.def` 檔案的末尾，放在僅包含分隔符序列 `---` 的分隔線之後：

```none
headers = errno.h
---

static inline int getErrno() {
    return errno;
}
```

請注意，`.def` 檔案的這一部分被視為標頭檔的一部分，因此帶有主體的函式應宣告為 `static`。宣告會在包含 `headers` 列表中的檔案之後進行解析。

## 使用命令列產生繫結 {id="generate-bindings-using-command-line"}

除了定義檔之外，你還可以透過在 `cinterop` 呼叫中將對應的屬性作為選項傳遞，來指定繫結中要包含的內容。

以下是產生 `png.klib` 編譯程式庫的指令範例：

```bash
cinterop -def png.def -compiler-option -I/usr/local/include -o png
```

請注意，產生的繫結通常是平台特定的，因此如果你正在針對多個目標進行開發，則需要重新產生繫結。

* 對於未包含在 sysroot 搜尋路徑中的主機程式庫，可能需要標頭。
* 對於具有組態指令碼的典型 UNIX 程式庫，`compilerOpts` 可能會包含帶有 `--cflags` 選項的組態指令碼輸出（可能不含精確路徑）。
* 帶有 `--libs` 的組態指令碼輸出可以傳遞給 `linkerOpts` 屬性。

## 下一步 {id="what-s-next"}

* [C 互通性繫結](native-c-interop.md#bindings)
* [與 Swift/Objective-C 的互通性](native-objc-interop.md)