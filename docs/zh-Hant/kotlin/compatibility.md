<!--- TOC -->

* [相容性](#compatibility)
* [公開 API 類型](#public-api-types)
  * [實驗性 API](#experimental-api)
  * [Flow 預覽 API](#flow-preview-api)
  * [過時 API](#obsolete-api)
  * [內部 API](#internal-api)
  * [穩定 API](#stable-api)
  * [棄用週期](#deprecation-cycle)
* [使用附帶註解的 API](#using-annotated-api)
  * [以程式編寫方式](#programmatically)
  * [Gradle](#gradle)
  * [Maven](#maven)

<!--- END -->

## 相容性 {id="compatibility"}
本文件說明 `kotlinx.coroutines` 程式庫自 1.0.0 版本起的相容性政策，以及相容性特定註解的語意。

## 公開 API 類型 {id="public-api-types"}
`kotlinx.coroutines` 公開 API 分為五種：穩定 (stable)、實驗性 (experimental)、過時 (obsolete)、內部 (internal) 和已棄用 (deprecated)。 
除了穩定 API 之外，所有公開 API 都會標記相應的註解。

### 實驗性 API {id="experimental-api"}
實驗性 API 會標記 [@ExperimentalCoroutinesApi][ExperimentalCoroutinesApi] 註解。
當 API 的設計存在潛在的未決問題，且最終可能導致 API 的語意變更或被棄用時，該 API 會被標記為實驗性。

預設情況下，大多數新 API 都會被標記為實驗性，若未出現新問題，則會在後續的其中一個主要版本中變為穩定。
否則，若要在不更改 ABI 的情況下修正語意，或者 API 將進入棄用週期。 

在以下情況使用實驗性 API 可能具備風險：
* 你正在編寫一個依賴於 `kotlinx.coroutines` 的程式庫，並希望在穩定的程式庫 API 中使用實驗性協同程式 API。當你的程式庫終端使用者更新其 `kotlinx.coroutines` 版本，而其中的實驗性 API 語意略有不同時，可能會導致非預期的後果。
* 你希望圍繞實驗性 API 構建應用程式的核心基礎結構。 

### Flow 預覽 API {id="flow-preview-api"}
所有與 [Flow] 相關的 API 都會標記 [@FlowPreview][FlowPreview] 註解。
此註解表示 Flow API 處於預覽狀態。
我們不保證預覽功能在各版本之間的相容性，包括二進制、原始碼和語意相容性。

在以下情況使用預覽 API 可能具備風險：
* 你正在編寫程式庫／架構，並希望在穩定版本或穩定 API 中使用 [Flow] API。
* 你希望在應用程式的核心基礎結構中使用 [Flow]。
* 你希望將 [Flow] 作為「隨寫即忘」的解決方案，且無法負擔 `kotlinx.coroutines` 更新時產生的額外維護成本。

### 過時 API {id="obsolete-api"}
過時 API 會標記 [@ObsoleteCoroutinesApi][ObsoleteCoroutinesApi] 註解。
過時 API 與實驗性 API 類似，但已知存在嚴重的設計缺陷以及潛在的替代方案，只是替代方案尚未實作。

此 API 的語意不會改變，但一旦替代方案準備就緒，它就會進入棄用週期。

### 內部 API {id="internal-api"}
內部 API 會標記 [@InternalCoroutinesApi][InternalCoroutinesApi] 或屬於 `kotlinx.coroutines.internal` 套件的一部分。
此 API 不保證穩定性，可以在未來的版本中更改和／或移除。 
如果你無法避免使用內部 API，請回報至 [問題追蹤器](https://github.com/Kotlin/kotlinx.coroutines/issues/new)。

### 穩定 API {id="stable-api"}
穩定 API 保證保留其 ABI 和文件記載的語意。如果在某些時間點發現了無法修復的設計缺陷，此 API 將進入棄用週期，並盡可能長時間地保持二進制相容性。

### 棄用週期 {id="deprecation-cycle"}
當某些 API 被棄用時，它會經歷多個階段，且各階段之間至少間隔一個主要版本。
* 功能被棄用並伴隨編譯警告。大多數情況下，會提供適當的替代方案（以及相應的 `replaceWith` 宣告），以便在 IntelliJ IDEA 的協助下自動遷移已棄用的用法。
* 棄用級別提升至 `error` 或 `hidden`。雖然該 API 仍存在於 ABI 中，但已無法針對已棄用的 API 編譯新程式碼。
* API 被完全移除。雖然我們盡最大努力不這樣做，且目前沒有移除任何 API 的計畫，但為了應對不可預見的問題（如資安漏洞），我們仍保留此選項。

## 使用附帶註解的 API {id="using-annotated-api"}
所有 API 註解均為 [kotlin.Experimental](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-experimental/)。
這樣做是為了針對使用實驗性或過時 API 產生編譯警告。
警告可以針對特定的呼叫點以程式編寫方式停用，也可以針對整個模組全域停用。

### 以程式編寫方式 {id="programmatically"}
對於特定的呼叫點，可以使用 [OptIn](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-opt-in/) 註解來停用警告：
```kotlin
@OptIn(ExperimentalCoroutinesApi::class) // 停用關於實驗性協同程式 API 的警告 
fun experimentalApiUsage() {
    someKotlinxCoroutinesExperimentalMethod()
}
``` 

### Gradle {id="gradle"}
對於 Gradle 專案，可以透過在 `build.gradle` 檔案中傳遞編譯器旗標來停用警告：

```groovy
tasks.withType(org.jetbrains.kotlin.gradle.tasks.AbstractKotlinCompile).all {
    kotlinOptions.freeCompilerArgs += ["-Xuse-experimental=kotlinx.coroutines.ExperimentalCoroutinesApi"]
}

```

### Maven {id="maven"}
對於 Maven 專案，可以透過在 `pom.xml` 檔案中傳遞編譯器旗標來停用警告：
```xml
<plugin>
    <artifactId>kotlin-maven-plugin</artifactId>
    <groupId>org.jetbrains.kotlin</groupId>
    ... 您的配置 ...
    <configuration>
        <args>
            <arg>-Xuse-experimental=kotlinx.coroutines.ExperimentalCoroutinesApi</arg>
        </args>
    </configuration>
</plugin>
```

<!--- MODULE kotlinx-coroutines-core -->
<!--- INDEX kotlinx.coroutines.flow -->

[Flow]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-flow/index.html

<!--- INDEX kotlinx.coroutines -->

[ExperimentalCoroutinesApi]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-experimental-coroutines-api/index.html
[FlowPreview]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-flow-preview/index.html
[ObsoleteCoroutinesApi]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-obsolete-coroutines-api/index.html
[InternalCoroutinesApi]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-internal-coroutines-api/index.html

<!--- END -->