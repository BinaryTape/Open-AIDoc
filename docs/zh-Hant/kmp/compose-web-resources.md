[//]: # (title: 處理 Web 資源)

在這裡您可以找到有關使用瀏覽器功能與 `preload` API 預先載入資源、快取 Web 資源以及自動字型備援的資訊。
  
## 針對 Web 目標預先載入資源 {id="preloading-of-resources-for-web-targets"}

字型和圖片等 Web 資源是使用 [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) 非同步載入的。
在初始載入期間或網路連線較慢時，擷取資源可能會導致視覺瑕疵，
例如 [FOUT](https://fonts.google.com/knowledge/glossary/fout) 或顯示占位符號而非圖片。

此問題的典型範例是當 `Text()` 組建包含自訂字型的文字，但包含所需字符的字型仍在載入時。
在此情況下，使用者可能會暫時看到預設字型的文字，甚至是空白方框和問號而非字元。
同樣地，對於圖片或可繪製資源（drawable），使用者可能會在資源完全載入之前看到如空白或黑色方框等占位符號。

為了防止視覺瑕疵，您可以使用內建的瀏覽器功能來預先載入資源、使用 Compose Multiplatform 預先載入 API，或是兩者結合使用。

### 使用瀏覽器功能預先載入資源 {id="preload-resources-using-browser-features"}

在現代瀏覽器中，您可以使用帶有 [`rel="preload"` 屬性](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload) 的 `<link>` 標籤來預先載入資源。
此屬性指示瀏覽器在應用程式啟動之前，優先下載並快取字型和圖片等資源，確保這些資源能夠提早準備就緒。

例如，若要啟用字型的瀏覽器內預先載入：

1. 組建您應用程式的 Web 發行套件：

    ```console
       ./gradlew :shared:wasmJsBrowserDistribution
    ```

2. 在產生的 `dist` 目錄中找到所需的資源並儲存該路徑。
3. 開啟 `wasmJsMain/resources/index.html` 檔案，並在 `<head>` 元素內加入 `<link>` 標籤。
4. 將 `href` 屬性設定為該資源路徑：

```html
<link rel="preload" href="./composeResources/username.shared.generated.resources/font/FiraMono-Regular.ttf" as="fetch" type="font/ttf" crossorigin/>
```

### 使用 Compose Multiplatform preload API 預先載入資源 {id="preload-resources-using-the-compose-multiplatform-preload-api"}

即使您已在瀏覽器中預先載入資源，它們仍會以原始位元組的形式快取，依舊需要轉換為適合算繪的格式（例如 `FontResource` 和 `DrawableResource`）。
當應用程式首次請求該資源時，轉換是非同步進行的，這可能會再次導致畫面閃爍。
為了進一步最佳化體驗，Compose Multiplatform 資源具有其專屬的內部快取，用於儲存更高層級的資源表示形式，這些形式也可以被預先載入。

Compose Multiplatform 1.8.0 引入了用於在 Web 目標上預先載入字型與圖片資源的 API：`preloadFont()`、`preloadImageBitmap()` 以及 `preloadImageVector()`。

當算繪過程中遇到未解析的字元時，將會[自動下載](#automatic-font-fallback)包含缺失字元的備援字型，因此像表情符號（emoji）這樣的特殊字元皆能開箱即用。

如果您希望控制要使用哪個備援字型，而不是依賴自動機制，可以使用 `FontFamily.Resolver.preload()` 方法手動指定。
Web 目標支援 TTF、OTF、TTC、variable（可變字型）以及 WOFF/WOFF2 字型格式。

以下範例示範如何預先載入向量圖片：

```kotlin
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
    // 該圖示已從快取載入
    Image(painter = painterResource(Res.drawable.heavy_vector_icon), contentDescription = null)
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="val icon by preloadImageVector(Res.drawable.heavy_vector_icon)"}

## 自動字型備援 {id="automatic-font-fallback"}
<primary-label ref="Experimental"/>

預設情況下，應用程式已載入字型未涵蓋的字元會顯示為替換字符（□，被稱為「[tofu](https://fonts.google.com/knowledge/glossary/tofu)」）。

從 1.12.0 版本開始，Compose Multiplatform 會在算繪期間監控未解析的字元，並依需求下載所需的 Noto 字型子集。
Noto 這個名稱是「no tofu」（沒有豆腐塊）的縮寫，因為這些字型的設計初衷就是消除豆腐塊字符。

一旦字型可用，受影響的文字便會重新重組。
請注意，在下載過程中可能會短暫出現豆腐塊。

對於 CJK（中文、日文和韓文）字元，系統會根據瀏覽器的語言設定自動選取正確的字型變體。

## 快取 Web 資源 {id="caching-web-resources"}
<primary-label ref="Experimental"/>

Compose Multiplatform 使用 [Web Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache) 來快取成功的回應，並避免瀏覽器預設快取機制通常會執行的多餘 HTTP 重新驗證。

快取會在每次應用程式啟動與頁面重新整理時進行全域清除。
在此階段重設快取可確保資源的一致性，因為跨多個工作階段重複使用快取可能會導致過時或不相容的資源，進而可能引發應用程式當機或邏輯不一致的情況。

為了防止針對同一資源進行多餘的並行擷取，該實作採用了特定資源鎖。
每個請求都受到針對個別資源的互斥鎖（mutex）保護，允許對不同資源發出平行請求，同時對相同路徑的重複請求進行序列化處理。
此設計能最大程度地減少不必要的網路流量，並消除填入快取期間的競爭條件。

## 後續步驟 {id="what-s-next"}

* 閱讀更多有關[設定資源](compose-multiplatform-resources-setup.md)以及[在您的應用程式中使用它們](compose-multiplatform-resources-usage.md)的內容。
* 了解如何管理應用程式的[資源環境](compose-resource-environment.md)，例如應用程式內的佈景主題與語言。