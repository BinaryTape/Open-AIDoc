[//]: # (title: 處理 Web 資源)

在這裡，您可以找到有關使用瀏覽器特性和 `preload` API 預載資源、快取 Web 資源以及自動字型備援的資訊。
  
## Web 目標的資源預載

字型和圖片等 Web 資源是使用 [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) 非同步載入的。在初始載入期間或網路連線較慢時，資源擷取可能會導致視覺瑕疵，例如 [FOUT](https://fonts.google.com/knowledge/glossary/fout) 或顯示預留位置而非圖片。

此問題的一個典型範例是 `Text()` 組件包含自訂字型的文字，但包含必要字符 (glyph) 的字型仍在載入中。在這種情況下，使用者可能會暫時看到預設字型的文字，甚至是看到空白方框和問號而非字元。同樣地，對於圖片或可繪製資源 (drawable)，使用者在資源完全載入前可能會觀察到預留位置，例如空白或黑色方框。

為了防止視覺瑕疵，您可以使用內建的瀏覽器特性來預載資源、使用 Compose Multiplatform 預載 API，或是結合兩者。

### 使用瀏覽器特性預載資源

在現代瀏覽器中，您可以使用帶有 [`rel="preload"` 屬性](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload) 的 `<link>` 標籤來預載資源。此屬性會指示瀏覽器在應用程式啟動前優先下載並快取字型和圖片等資源，確保這些資源能及早可用。

例如，要在瀏覽器中啟用字型預載：

1. 組建應用程式的 Web 發行版本：

    ```console
       ./gradlew :shared:wasmJsBrowserDistribution
    ```

2. 在產生的 `dist` 目錄中找到所需的資源並儲存路徑。
3. 開啟 `wasmJsMain/resources/index.html` 檔案並在 `<head>` 元素中新增一個 `<link>` 標籤。
4. 將 `href` 屬性設定為資源路徑：

```html
<link rel="preload" href="./composeResources/username.shared.generated.resources/font/FiraMono-Regular.ttf" as="fetch" type="font/ttf" crossorigin/>
```

### 使用 Compose Multiplatform 預載 API
<primary-label ref="Experimental"/>

即使您已在瀏覽器中預載資源，它們仍是以原始位元組的形式快取，仍需要轉換為適合渲染的格式，例如 `FontResource` 和 `DrawableResource`。當應用程式首次請求資源時，轉換是非同步進行的，這可能再次導致閃爍。為了進一步優化體驗，Compose Multiplatform 資源針對高階資源表示形式擁有自己的內部快取，這些資源也可以被預載。

Compose Multiplatform 1.8.0 引入了用於在 Web 目標上預載字型和圖片資源的實驗性 API：`preloadFont()`、`preloadImageBitmap()` 和 `preloadImageVector()`。

當渲染過程中遇到未解決的字元時，系統會[自動下載](#automatic-font-fallback)包含缺失字元的備援字型，因此開箱即支援表情符號 (emoji) 等特殊字元。

如果您想控制使用哪種備援字型，而不是依賴自動字型，請使用 `FontFamily.Resolver.preload()` 方法手動指定。Web 目標支援 TTF、OTF、TTC、變體字型 (variable) 以及 WOFF/WOFF2 字型格式。

以下範例展示了如何使用向量圖片的預載：

```kotlin
@OptIn(ExperimentalComposeUiApi::class, ExperimentalResourceApi::class)
@Composable
fun App() {
    val icon by preloadImageVector(Res.drawable.heavy_vector_icon)

    if (icon != null) {
        MainScreen()
    } else {
        Box(modifier = Modifier.fillMaxSize()) {
            CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
        }
    }
}

@Composable
fun MainScreen() {
    // 圖片從快取中載入
    Image(painter = painterResource(Res.drawable.heavy_vector_icon), contentDescription = null)
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="val icon by preloadImageVector(Res.drawable.heavy_vector_icon)"}

## 自動字型備援
<primary-label ref="Experimental"/>

預設情況下，應用程式已載入字型未涵蓋的字元會顯示為替代字符 (□，即所謂的「[tofu](https://fonts.google.com/knowledge/glossary/tofu)」)。

[//]: # (TODO update version for stable release)

從 1.12.0-beta01 版本開始，Compose Multiplatform 會在渲染期間監控未解決的字元，並根據需求下載必要的 Noto 字型子集。Noto 這個名稱是「no tofu」的縮寫，因為這些字型旨在消除 tofu 字符。

一旦字型可用，受影響的文字將會重新組合 (recomposed)。請注意，在下載過程中，tofu 可能會短暫出現。

對於 CJK（中文、日文和韓文）字元，系統會根據瀏覽器的語言設定自動選擇正確的字型變體。

## 快取 Web 資源
<primary-label ref="Experimental"/>

Compose Multiplatform 使用 [Web Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache) 來快取成功的回應，並避免瀏覽器預設快取機制通常會執行的冗餘 HTTP 重新驗證。

快取在每次應用程式啟動和頁面重新整理時都會全域清除。在此階段重設快取可確保資源一致性，因為在多個工作階段中重複使用快取可能會導致資源過時或不相容，進而導致應用程式當機或邏輯不一致。

為了防止對同一資源進行冗餘的並行擷取，實作中使用了資源特定鎖定。每個請求都由每個資源的互斥鎖 (mutex) 保護，在允許對不同資源進行平行請求的同時，對相同路徑的重複請求進行序列化處理。這種設計最小化了不必要的網路流量，並消除了快取填充期間的競爭條件。

## 接續步驟

* 閱讀更多關於 [設定資源](compose-multiplatform-resources-setup.md) 以及 [在應用程式中使用資源](compose-multiplatform-resources-usage.md) 的資訊。
* 了解如何管理應用程式的 [資源環境](compose-resource-environment.md)，例如應用程式內的主題和語言。