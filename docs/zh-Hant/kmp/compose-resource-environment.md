# 管理本機資源環境

您可能需要管理應用程式內的設定，以允許使用者自訂體驗，例如變更語言或佈景主題。
若要動態更新應用程式的資源環境，您可以配置應用程式使用的以下資源相關設定：

* [地區設定（語言和地區）](#locale)
* [佈景主題](#theme)
* [解析度密度](#density)

## 地區設定 (Locale) {id="locale"}

每個平台處理語言和地區等地區設定的方式都有所不同。在通用公用 API 實作之前，作為臨時因應措施，您需要在共用程式碼中定義一個通用進入點。接著，使用各平台特有的 API 為每個平台提供對應的宣告：

* **Android**：[`context.resources.configuration.locale`](https://developer.android.com/reference/android/content/res/Configuration#setLocale(java.util.Locale))
* **iOS**：[`NSLocale.preferredLanguages`](https://developer.apple.com/documentation/foundation/nslocale/preferredlanguages)
* **桌面端 (desktop)**：[`Locale.getDefault()`](https://developer.android.com/reference/java/util/Locale#getDefault(java.util.Locale.Category))
* **Web**：[`window.navigator.languages`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/languages)

1. 在通用原始碼集 (common source set) 中，使用 `expect` 關鍵字定義預期的 `LocalAppLocale` 物件。
   地區設定是以 BCP 47 語言標籤指定的，例如 `es`、`es-ES` 或 `zh-Hans`。
   將 `customAppLocale` 設定為 `null` 即可使用系統地區設定：

    ```kotlin
    var customAppLocale by mutableStateOf<String?>(null)
    expect object LocalAppLocale {
        val current: String @Composable get
        @Composable infix fun provides(value: String?): ProvidedValue<*>
    }
    
    @Composable
    fun AppEnvironment(content: @Composable () -> Unit) {
        CompositionLocalProvider(
            LocalAppLocale provides customAppLocale,
        ) {
            key(customAppLocale) {
                content()
            }
        }
    }
    ```

2. 在 Android 原始碼集中，新增使用 `context.resources.configuration.locale` 的 `actual` 實作：

    ```kotlin
    actual object LocalAppLocale {
        private var default: Locale? = null
        actual val current: String
            @Composable get() = Locale.getDefault().toString()
    
        @Composable
        actual infix fun provides(value: String?): ProvidedValue<*> {
            val configuration = LocalConfiguration.current
    
            if (default == null) {
                default = Locale.getDefault()
            }
    
            val new = when(value) {
                null -> default!!
                else -> Locale(value)
            }
            Locale.setDefault(new)
            configuration.setLocale(new)
            val resources = LocalContext.current.resources
    
            resources.updateConfiguration(configuration, resources.displayMetrics)
            return LocalConfiguration.provides(configuration)
        }
    }
    ```

3. 在 iOS 原始碼集中，新增修改 `NSLocale.preferredLanguages` 的 `actual` 實作：
 
    ```kotlin
    actual object LocalAppLocale {
        private const val LANG_KEY = "AppleLanguages"
        private val default = NSLocale.preferredLanguages.first() as String
        private val LocalAppLocale = staticCompositionLocalOf { default }
        actual val current: String
            @Composable get() = LocalAppLocale.current
    
        @Composable
        actual infix fun provides(value: String?): ProvidedValue<*> {
            val new = value ?: default
            if (value == null) {
                NSUserDefaults.standardUserDefaults.removeObjectForKey(LANG_KEY)
            } else {
                NSUserDefaults.standardUserDefaults.setObject(arrayListOf(new), LANG_KEY)
            }
            return LocalAppLocale.provides(new)
        }
    }
    ```

4. 在桌面端原始碼集中，新增使用 `Locale.getDefault()` 更新 JVM 預設地區設定的 `actual` 實作：

    ```kotlin
    actual object LocalAppLocale {
        private var default: Locale? = null
        private val LocalAppLocale = staticCompositionLocalOf { Locale.getDefault().toString() }
        actual val current: String
            @Composable get() = LocalAppLocale.current
    
        @Composable
        actual infix fun provides(value: String?): ProvidedValue<*> {
            if (default == null) {
                default = Locale.getDefault()
            }
            val new = when(value) {
                null -> default!!
                else -> Locale(value)
            }
            Locale.setDefault(new)
            return LocalAppLocale.provides(new.toString())
        }
    }
    ```

5. 對於 Web 平台，繞過 `window.navigator.languages` 屬性的唯讀限制以引入自訂地區設定邏輯：

    ```kotlin
    actual object LocalAppLocale {
        private val LocalAppLocale = staticCompositionLocalOf { Locale.current }
        actual val current: String
            @Composable get() = LocalAppLocale.current.toString()
    
        @Composable
        actual infix fun provides(value: String?): ProvidedValue<*> {
            updateCustomLocale(value?.replace('_', '-'))
            return LocalAppLocale.provides(Locale.current)
        }
    }
    
    @OptIn(ExperimentalWasmJsInterop::class)
    private fun updateCustomLocale(value: String?) {
        js(
            """
            if (window.__customLocale !== value) {
                window.__customLocale = value;
                window.dispatchEvent(new Event("languagechange"));
            }
            """
        )
    }
    ```

    接著，在瀏覽器的 `index.html` 中，於載入應用程式指令碼之前放入以下程式碼：

    ```html    
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            ...
            <script>
                var currentLanguagesImplementation = Object.getOwnPropertyDescriptor(Navigator.prototype, "languages");
                var newLanguagesImplementation = Object.assign({}, currentLanguagesImplementation, {
                    get: function () {
                        if (window.__customLocale) {
                            return [window.__customLocale];
                        } else {
                            return currentLanguagesImplementation.get.apply(this);
                        }
                    }
                });
        
                Object.defineProperty(Navigator.prototype, "languages", newLanguagesImplementation)
            </script>
            <script src="skiko.js"></script>
            ...
        </head>
        <body></body>
        <script src="webApp.js"></script>
    </html>
    ```  

## 佈景主題 {id="theme"}

Compose Multiplatform 透過 `isSystemInDarkTheme()` 定義目前的佈景主題。
各平台處理佈景主題的方式各不相同：

* Android 透過以下位元運算定義佈景主題：
    ```kotlin
        Resources.getConfiguration().uiMode and Configuration.UI_MODE_NIGHT_MASK
    ```
* iOS、桌面端和 Web 平台使用 `LocalSystemTheme.current`。

作為臨時因應措施，在通用公用 API 實作之前，您可以利用 `expect-actual` 機制解決此差異，以管理特定平台的佈景主題自訂：

1. 在通用程式碼中，使用 `expect` 關鍵字定義預期的 `LocalAppTheme` 物件：
 
    ```kotlin
    var customAppThemeIsDark by mutableStateOf<Boolean?>(null)
    expect object LocalAppTheme {
        val current: Boolean @Composable get
        @Composable infix fun provides(value: Boolean?): ProvidedValue<*>
    }
    
    @Composable
    fun AppEnvironment(content: @Composable () -> Unit) {
        CompositionLocalProvider(
            LocalAppTheme provides customAppThemeIsDark,
        ) {
            key(customAppThemeIsDark) {
                content()
            }
        }
    }
    ```

2. 在 Android 程式碼中，新增使用 `LocalConfiguration` API 的 actual 實作：

   ```kotlin
    actual object LocalAppTheme {
        actual val current: Boolean
            @Composable get() = (LocalConfiguration.current.uiMode and UI_MODE_NIGHT_MASK) == UI_MODE_NIGHT_YES
    
        @Composable
        actual infix fun provides(value: Boolean?): ProvidedValue<*> {
            val new = if (value == null) {
                LocalConfiguration.current
            } else {
                Configuration(LocalConfiguration.current).apply {
                    uiMode = when (value) {
                        true -> (uiMode and UI_MODE_NIGHT_MASK.inv()) or UI_MODE_NIGHT_YES
                        false -> (uiMode and UI_MODE_NIGHT_MASK.inv()) or UI_MODE_NIGHT_NO
                    }
                }
            }
            return LocalConfiguration.provides(new)
        }
    }
    ```

3. 在 iOS、桌面端與 Web 平台上，您可以直接變更 `LocalSystemTheme`：

    ```kotlin
    @OptIn(InternalComposeUiApi::class)
    actual object LocalAppTheme {
        actual val current: Boolean
            @Composable get() = LocalSystemTheme.current == SystemTheme.Dark
    
        @Composable
        actual infix fun provides(value: Boolean?): ProvidedValue<*> {
            val new = when(value) {
                true -> SystemTheme.Dark
                false -> SystemTheme.Light
                null -> LocalSystemTheme.current
            }
    
            return LocalSystemTheme.provides(new)
        }
    }
    ```

## 密度 (Density)

若要變更應用程式的解析度 `Density`，您可以使用所有平台均支援的通用 `LocalDensity` API：

```kotlin
var customAppDensity by mutableStateOf<Density?>(null)
object LocalAppDensity {
    val current: Density
        @Composable get() = LocalDensity.current

    @Composable
    infix fun provides(value: Density?): ProvidedValue<*> {
        val new = value ?: LocalDensity.current
        return LocalDensity.provides(new)
    }
}

@Composable
fun AppEnvironment(content: @Composable () -> Unit) {
    CompositionLocalProvider(
        LocalAppDensity provides customAppDensity,
    ) {
        key(customAppDensity) {
            content()
        }
    }
}
```

## 後續步驟 {id="what-s-next"}

* 深入了解 [資源限定詞 (resource qualifiers)](compose-multiplatform-resources-setup.md#qualifiers) 的詳細資訊。
* 了解如何 [在地化資源 (localize resources)](compose-localize-strings.md)。