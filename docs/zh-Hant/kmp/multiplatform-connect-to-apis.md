[//]: # (title: 使用特定平台 API)

在本文中，你將學習在開發多平台應用程式與程式庫時，如何使用特定平台 API。

<video src="https://www.youtube.com/v/bSNumV04y_w" title="Using Platform-Specific APIs in KMP Apps"/>

## Kotlin Multiplatform 程式庫 {id="kotlin-multiplatform-libraries"}

在撰寫使用特定平台 API 的程式碼之前，請先確認是否可以改用多平台程式庫。
這種類型的程式庫提供通用的 Kotlin API，並針對不同平台具備不同的實作。

目前已有許多現成的程式庫可用於實作網路連線、記錄 (logging) 和分析，以及存取裝置功能等。可在 Kotlin Multiplatform 程式庫搜尋平台 [klibs.io](https://klibs.io) 上瀏覽各類程式庫。

## Expected 與 actual 函式和屬性 {id="expected-and-actual-functions-and-properties"}

Kotlin 提供了一種語言機制，可在開發通用邏輯時存取特定平台 API：
[預期宣告與實際宣告 (expected and actual declarations)](multiplatform-expect-actual.md)。

透過此機制，多平台模組的通用原始碼集 (common source set) 會定義預期宣告 (expected declaration)，而每個平台原始碼集 (platform source set) 都必須提供與該預期宣告對應的實際宣告 (actual declaration)。編譯器會確保通用原始碼集中以 `expect` 關鍵字標記的每個宣告，在所有目標平台原始碼集中都有以 `actual` 關鍵字標記的對應宣告。

這適用於大部分 Kotlin 宣告，例如函式、類別、介面、列舉、屬性和註解。本節著重於使用 expected 與 actual 函式和屬性。

![使用 expected 與 actual 函式和屬性](expect-functions-properties.svg){width=700}

在此範例中，通用原始碼集中定義了一個 expected `platform()` 函式，並在各平台原始碼集中具備 actual 實作。
在為特定平台產生程式碼時，Kotlin 編譯器會合併預期與實際宣告。
產生的結果即為包含目標平台實作的 `platform()` 函式。

預期宣告與實際宣告必須定義在同一個套件中，才能在產生的平台程式碼中合併為*單一宣告*。
如此一來，通用程式碼中對 expected `platform()` 函式的任何呼叫都將對應至正確的 actual 實作。

與 expected 和 actual 函式類似，expected 和 actual 屬性可讓你在不同平台上使用不同的值。Expected 和 actual 函式與屬性在簡易情境中最為實用。

### 範例：產生 UUID {id="example-generate-a-uuid"}

假設你正在使用 Kotlin Multiplatform 開發 iOS 和 Android 應用程式，且需要一種產生通用唯一識別碼 (UUID) 的機制。

為此，請在 Kotlin Multiplatform 模組的通用原始碼集中，使用 `expect` 關鍵字宣告預期函式 `randomUUID()`。
**切勿**在 `expect` 宣告中包含任何實作程式碼。

```kotlin
// 在通用原始碼集中：
expect fun randomUUID(): String
```

在各個特定平台原始碼集（iOS 與 Android）中，提供通用模組中所預期的 `randomUUID()` 函式的實際實作。使用 `actual` 關鍵字來標記這些實際實作。

![使用預期宣告與實際宣告產生 UUID](expect-generate-uuid.svg){width=700}

以下程式碼片段顯示了 Android 和 iOS 的實作。特定平台程式碼使用 `actual` 關鍵字以及相同的函式名稱：

```kotlin
// 在 Android 原始碼集中：
import java.util.*

actual fun randomUUID() = UUID.randomUUID().toString()
```

```kotlin
// 在 iOS 原始碼集中：
import platform.Foundation.NSUUID

actual fun randomUUID(): String = NSUUID().UUIDString()
```

Android 實作使用了 Android 上可用的 API，而 iOS 實作則使用了 iOS 上可用的 API。
你可以從 Kotlin/Native 程式碼中存取 iOS API。

在產生 Android 的最終平台程式碼時，Kotlin 編譯器會自動合併預期與實際宣告，並產生帶有 Android 專屬實際實作的單一 `randomUUID()` 函式。iOS 也會重複相同的處理程序。

### 深入閱讀 `expect`/`actual` 宣告 {id="further-reading-on-expect-actual-declarations"}

* 若要查看 `expect`/`actual` 宣告的實際運作，請參閱[基本 KMP 應用程式範例](quickstart.md#create-a-project)，其中包含一個傳回每個目標平台名稱的函式。
* 若要深入了解 `expect`/`actual` 機制，請參閱[預期宣告與實際宣告](multiplatform-expect-actual.md)。

## 通用程式碼中的介面 {id="interfaces-in-common-code"}

[Kotlin 的繼承機制](https://kotlinlang.org/docs/inheritance.html)能實現更具彈性的程式碼共享。
例如，你可以在通用程式碼中定義一個包含抽象且與平台無關之宣告的介面，然後在各平台原始碼集中提供該介面的實作。

![使用介面](expect-interfaces.svg){width=700}

無論在哪個平台，平台名稱都儲存為 `String`：

```kotlin
// 在 commonMain 原始碼集中：
interface Platform {
    val name: String
}
```

然後，你可以透過覆寫該宣告並呼叫 Android API 來為該 `String` 指派值： 

```kotlin
// 在 androidMain 原始碼集中：
import android.os.Build

class AndroidPlatform : Platform {
    override val name: String = "Android ${Build.VERSION.SDK_INT}"
}
```

或是呼叫 iOS 系統：

```kotlin
// 在 iosMain 原始碼集中：
import platform.UIKit.UIDevice

class IOSPlatform : Platform {
    override val name: String = UIDevice.currentDevice.systemName() + " " + UIDevice.currentDevice.systemVersion
}
```

在使用通用介面時，若要注入適當的平台實作，你可以選擇以下其中一種方式：

* [使用 expected 與 actual 函式](#expected-and-actual-functions)
* [透過不同入口點提供實作](#different-entry-points)
* [使用相依注入架構](#dependency-injection-framework)

### Expected 與 actual 函式 {id="expected-and-actual-functions"}

你可以將通用介面與 [expect/actual 宣告](#expected-and-actual-functions-and-properties)結合使用。  
定義一個傳回此介面之值的 `expect` 函式，然後定義傳回實作該介面之特定平台類別的 `actual` 函式：

```kotlin
// 在 commonMain 原始碼集中：
interface Platform

expect fun platform(): Platform
```

```kotlin
// 在 androidMain 原始碼集中：
class AndroidPlatform : Platform

actual fun platform() = AndroidPlatform()
```

```kotlin
// 在 iosMain 原始碼集中：
class IOSPlatform : Platform

actual fun platform() = IOSPlatform()
```

通用程式碼中對 `platform()` 函式的呼叫適用於 `Platform` 型別的物件。
當編譯器合併預期與實際宣告時，在 Android 上呼叫 `platform()` 會傳回 `AndroidPlatform` 類別的執行個體，而在 iOS 上則會傳回 `IOSPlatform` 類別的執行個體。

> 這是由 Kotlin Multiplatform IDE 精靈（也可[在線上使用](https://kmp.jetbrains.com/)）所產生專案中使用的方法。
> 執行 [KMP 快速入門](quickstart.md#create-a-project)來建立簡易專案，並查看該實作的實際運作方式。
> 
{style="tip"}

### 不同的入口點 {id="different-entry-points"}

如果你能控制入口點，則無需使用預期與實際宣告即可建構各平台產物的實作。為此，請在共享的 Kotlin Multiplatform 模組中定義平台實作，但在各平台模組中將其實例化：

```kotlin
// 共享的 Kotlin Multiplatform 模組
// 在 commonMain 原始碼集中：
interface Platform

fun application(p: Platform) {
    // 應用程式邏輯
}
```

```kotlin
// 在 androidMain 原始碼集中：
class AndroidPlatform : Platform
```

```kotlin
// 在 iosMain 原始碼集中：
class IOSPlatform : Platform
```

```kotlin
// 在 androidApp 平台模組中：
import android.app.Application
import mysharedpackage.*

class MyApp : Application() {
    override fun onCreate() {
        super.onCreate()
        application(AndroidPlatform())
    }
}
```

```Swift
// 在 iOS 應用程式的 Swift 程式碼中：
import shared

@main
struct iOSApp : App {
    init() {
        application(IOSPlatform())
    }
}
```

在 Android 上，你應建立 `AndroidPlatform` 的執行個體並將其傳遞給 `application()` 函式；而在 iOS 上，你也應同樣建立並傳遞 `IOSPlatform` 的執行個體。這些入口點不一定是應用程式的入口點，但你可以在此呼叫共享模組的特定功能。

透過 expected 與 actual 函式或直接透過入口點提供正確的實作，非常適合簡易情境。
但是，如果你在專案中使用了相依注入架構，我們建議在簡易情境中也使用它，以確保一致性。

### 相依注入架構 {id="dependency-injection-framework"}

現代應用程式可以使用相依注入 (DI) 架構來即時決定要使用的實作，並以此方式建立鬆散耦合的架構。
任何支援 Kotlin Multiplatform 的 DI 架構都可以協助你在執行期依據平台將不同的相依性注入至組件中。

例如，[Koin](https://insert-koin.io/) 是一個支援 Kotlin Multiplatform 的相依注入架構。
你可以使用 Koin 來實作 `Platform` 範例，如下所示：

```kotlin
// 在通用原始碼集中：
import org.koin.dsl.module

interface Platform

expect val platformModule: Module
```

```kotlin
// 在 androidMain 原始碼集中：
class AndroidPlatform : Platform

actual val platformModule: Module = module {
    single<Platform> {
        AndroidPlatform()
    }
}
```

```kotlin
// 在 iosMain 原始碼集中：
class IOSPlatform : Platform

actual val platformModule = module {
    single<Platform> { IOSPlatform() }
}
```

在此處，Koin DSL 建立了定義用於注入之組件的模組。你在通用程式碼中使用 `expect` 關鍵字宣告模組，然後使用 `actual` 關鍵字為每個平台提供特定平台的實作。
該架構會在執行期負責選取正確的實作。

當你使用 DI 架構時，所有相依性都會透過此架構進行注入。處理平台相依性時也適用相同的邏輯。如果你的專案中已引入 DI，我們建議繼續使用 DI，而不是手動使用 expected 與 actual 函式。如此一來，你可以避免混用兩種不同的相依性注入方式。

你也不一定非得用 Kotlin 來實作通用介面。你可以在不同的*平台模組*中，使用 Swift 等其他語言來實作。如果你選擇此方法，接著應使用 DI 架構從 iOS 平台模組中提供該實作：

![使用相依注入架構](expect-di-framework.svg){width=700}

此方法僅在將實作放在平台模組中時才有效。由於你的 Kotlin Multiplatform 模組無法自給自足，且你需要在不同的模組中實作通用介面，因此該方法的擴充性並不高。

<!-- 如果你有興趣將此功能擴展到共享模組，請在 YouTrack 中為此問題投票並描述你的使用案例。 -->