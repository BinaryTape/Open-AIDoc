# 管理本地资源环境

您可能需要管理应用内设置，允许用户自定义其体验，例如更改语言或主题。
要动态更新应用程序的资源环境，您可以配置应用程序使用的以下资源相关设置：

* [区域性（语言和地区）](#locale)
* [主题](#theme)
* [分辨率密度](#density)

## 区域性 {id="locale"}

每个平台对语言和地区等区域性设置的处理方式各不相同。作为一种临时解决方法，在实现通用的公共 API 之前，您需要在共享代码中定义一个通用入口点。然后，使用平台特定 API 为每个平台提供相应的声明：

* **Android**：[`context.resources.configuration.locale`](https://developer.android.com/reference/android/content/res/Configuration#setLocale(java.util.Locale))
* **iOS**：[`NSLocale.preferredLanguages`](https://developer.apple.com/documentation/foundation/nslocale/preferredlanguages)
* **桌面**：[`Locale.getDefault()`](https://developer.android.com/reference/java/util/Locale#getDefault(java.util.Locale.Category))
* **Web**：[`window.navigator.languages`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/languages)

1. 在通用源集中，使用 `expect` 关键字定义预期的 `LocalAppLocale` 对象。区域性被指定为 BCP 47 语言标签，例如 `es`、`es-ES` 或 `zh-Hans`。将 `customAppLocale` 设置为 `null` 以使用系统区域性：

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

2. 在 Android 源集中，添加使用 `context.resources.configuration.locale` 的 `actual` 实现：

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

3. 在 iOS 源集中，添加修改 `NSLocale.preferredLanguages` 的 `actual` 实现：
 
    ```kotlin
    @OptIn(InternalComposeUiApi::class)
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

4. 在桌面源集中，添加使用 `Locale.getDefault()` 来更新 JVM 默认区域性的 `actual` 实现：

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

5. 对于 Web 平台，绕过 `window.navigator.languages` 属性的只读限制，引入自定义区域性逻辑：

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

    然后，在浏览器的 `index.html` 中，在加载应用程序脚本之前放入以下代码：

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

## 主题 {id="theme"}

Compose Multiplatform 通过 `isSystemInDarkTheme()` 定义当前主题。各平台对主题的处理方式各不相同：

* Android 通过以下按位运算定义主题： 
    ```kotlin
        Resources.getConfiguration().uiMode and Configuration.UI_MODE_NIGHT_MASK
    ```
* iOS、桌面和 Web 平台使用 `LocalSystemTheme.current`。

作为一种临时解决方法，在实现通用的公共 API 之前，您可以使用 `expect-actual` 机制来应对这种差异，并管理平台特定的主题自定义：

1. 在通用代码中，使用 `expect` 关键字定义预期的 `LocalAppTheme` 对象：
 
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

2. 在 Android 代码中，添加使用 `LocalConfiguration` API 的 `actual` 实现：

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

3. 在 iOS、桌面和 Web 平台上，您可以直接更改 `LocalSystemTheme`：

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

## 分辨率密度

要更改应用程序的分辨率 `Density`，您可以使用所有平台均支持的通用 `LocalDensity` API：

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

## 下一步 {id="what-s-next"}

* 详细了解 [资源限定符](compose-multiplatform-resources-setup.md#qualifiers)。
* 了解如何 [本地化资源](compose-localize-strings.md)。