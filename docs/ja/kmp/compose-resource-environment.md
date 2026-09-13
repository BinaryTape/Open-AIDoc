# ローカルリソース環境の管理

言語やテーマの変更など、ユーザーがエクスペリエンスをカスタマイズできるアプリ内設定の管理が必要になる場合があります。
アプリケーションのリソース環境を動的に更新するために、アプリケーションで使用される以下のリソース関連の設定を構成できます：

* [ロケール（言語と地域）](#locale)
* [テーマ](#theme)
* [解像度密度（Density）](#density)

## ロケール {id="locale"}

各プラットフォームで、言語や地域などのロケール設定の処理方法は異なります。共通のパブリック API が実装されるまでの暫定的な回避策として、共有コード内に共通のエントリポイントを定義する必要があります。その後、プラットフォーム固有の API を使用して、各プラットフォームに対応する宣言を提供します：

* **Android**: [`context.resources.configuration.locale`](https://developer.android.com/reference/android/content/res/Configuration#setLocale(java.util.Locale))
* **iOS**: [`NSLocale.preferredLanguages`](https://developer.apple.com/documentation/foundation/nslocale/preferredlanguages)
* **desktop**: [`Locale.getDefault()`](https://developer.android.com/reference/java/util/Locale#getDefault(java.util.Locale.Category))
* **web**: [`window.navigator.languages`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/languages)

1. 共通（common）ソースセットで、`expect` キーワードを使用して期待される `LocalAppLocale` オブジェクトを定義します。
   ロケールは、`es`、`es-ES`、`zh-Hans` などの BCP 47 言語タグとして指定されます。システムロケールを使用するには、`customAppLocale` を `null` に設定します：

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

2. Android ソースセットで、`context.resources.configuration.locale` を使用する `actual` 実装を追加します：

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

3. iOS ソースセットで、`NSLocale.preferredLanguages` を変更する `actual` 実装を追加します：
 
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

4. デスクトップ（desktop）ソースセットで、JVM のデフォルトロケールを更新するために `Locale.getDefault()` を使用する `actual` 実装を追加します：

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

5. Web プラットフォームでは、カスタムロケールロジックを導入するために、`window.navigator.languages` プロパティの読み取り専用制限をバイパスします：

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

    次に、ブラウザの `index.html` で、アプリケーションスクリプトを読み込む前に以下のコードを記述します：

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

## テーマ {id="theme"}

Compose Multiplatform は、`isSystemInDarkTheme()` を介して現在のテーマを定義します。テーマの処理はプラットフォームによって異なります：

* Android は、以下のビット演算を介してテーマを定義します：
    ```kotlin
        Resources.getConfiguration().uiMode and Configuration.UI_MODE_NIGHT_MASK
    ```
* iOS、デスクトップ、および Web プラットフォームは `LocalSystemTheme.current` を使用します。

共通のパブリック API が実装されるまでの暫定的な回避策として、`expect-actual` メカニズムを使用してプラットフォーム固有のテーマカスタマイズを管理することで、この違いに対処できます：

1. 共通コードで、`expect` キーワードを使用して期待される `LocalAppTheme` オブジェクトを定義します：
 
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

2. Android コードで、`LocalConfiguration` API を使用する `actual` 実装を追加します：

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

3. iOS、デスクトップ、および Web プラットフォームでは、`LocalSystemTheme` を直接変更できます：

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

## 解像度密度 (Density)

アプリケーションの解像度密度（`Density`）を変更するには、すべてのプラットフォームでサポートされている共通の `LocalDensity` API を使用できます：

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

## 次のステップ {id="what-s-next"}

* [リソース修飾子（Qualifiers）](compose-multiplatform-resources-setup.md#qualifiers)の詳細を確認する。
* [リソースをローカライズする](compose-localize-strings.md)方法を学ぶ。