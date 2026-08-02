[//]: # (title: 使用平台特定 API)

在這篇文章中，你將學習在開發多平台應用程式和程式庫時，如何使用平台特定 API。

<video src="https://www.youtube.com/v/bSNumV04y_w" title="在 KMP 應用程式中使用平台特定 API"/>

## Kotlin 多平台程式庫

在編寫使用平台特定 API 的程式碼之前，請先檢查是否可以使用多平台程式庫代替。
這類程式庫提供一個通用的 Kotlin API，並針對不同平台有不同的實作。

目前已有許多程式庫可用於實作網路、記錄（logging）和分析，以及存取裝置功能等。你可以在 [klibs.io](https://klibs.io) 上瀏覽程式庫，這是 Kotlin Multiplatform 程式庫的搜尋平台。

## expect 和 actual 函式與屬性

Kotlin 提供了一種語言機制，用於在開發通用邏輯時存取平台特定 API：
[expect 和 actual 宣告](multiplatform-expect-actual.md)。

透過此機制，多平台模組的通用原始碼集會定義一個 expect 宣告，而每個平台原始碼集都必須提供與該 expect 宣告相對應的 actual 宣告。編譯器會確保通用原始碼集中每個標記為 `expect` 關鍵字的宣告，在所有目標平台原始碼集中都有對應標記為 `actual` 關鍵字的宣告。

這適用於大多數 Kotlin 宣告，例如函式、類別、介面、列舉、屬性和註解。本節重點在於使用 expect 和 actual 函式與屬性。

![使用 expect 和 actual 函式與屬性](expect-functions-properties.svg){width=700}

在此範例中，你將在通用原始碼集中定義一個預期的 `platform()` 函式，並在平台原始碼集中提供實際的實作。在為特定平台產生程式碼時，Kotlin 編譯器會合併 expect 和 actual 宣告。它會產生一個具有實際實作的 `platform()` 函式。expect 和 actual 宣告應定義在同一個套件中，並在產生的平台程式碼中合併為 *一個宣告*。在產生的平台程式碼中對 expect `platform()` 函式的任何調用，都將呼叫正確的 actual 實作。

### 範例：產生 UUID

假設你正在使用 Kotlin Multiplatform 開發 iOS 和 Android 應用程式，且想要產生通用唯一識別碼 (UUID)。

為此，請在 Kotlin Multiplatform 模組的通用原始碼集中，使用 `expect` 關鍵字宣告預期函式 `randomUUID()`。**不要** 包含任何實作程式碼。

```kotlin
// 在通用原始碼集中：
expect fun randomUUID(): String
```

在每個平台特定原始碼集（iOS 和 Android）中，為通用模組中預期的 `randomUUID()` 函式提供實際實作。使用 `actual` 關鍵字標記這些實際實作。

![使用 expect 和 actual 宣告產生 UUID](expect-generate-uuid.svg){width=700}

以下程式碼片段顯示了 Android 和 iOS 的實作。平台特定程式碼使用 `actual` 關鍵字以及相同的函式名稱：

```kotlin
// 在 android 原始碼集中：
import java.util.*

actual fun randomUUID() = UUID.randomUUID().toString()
```

```kotlin
// 在 iOS 原始碼集中：
import platform.Foundation.NSUUID

actual fun randomUUID(): String = NSUUID().UUIDString()
```

Android 實作使用 Android 上的可用 API，而 iOS 實作則使用 iOS 上的可用 API。你可以從 Kotlin/Native 程式碼存取 iOS API。

在產生 Android 的平台程式碼時，Kotlin 編譯器會自動合併 expect 和 actual 宣告，並產生一個帶有實際 Android 特定實作的單一 `randomUUID()` 函式。iOS 的處理過程也是如此。

為了簡單起見，此範例及後續範例使用簡化的原始碼集名稱 "common"、"ios" 和 "android"。
通常，這代表 `commonMain`、`iosMain` 和 `androidMain`，類似的邏輯也可以定義在測試原始碼集 `commonTest`、`iosTest` 和 `androidTest` 中。

與 expect 和 actual 函式類似，expect 和 actual 屬性允許你在不同平台上使用不同的值。expect 和 actual 函式與屬性對於簡單的案例最為實用。

## 通用程式碼中的介面

如果平台特定邏輯過於龐大且複雜，你可以透過在通用程式碼中定義一個介面來代表它，然後在平台原始碼集中提供不同的實作，以此簡化程式碼。

![使用介面](expect-interfaces.svg){width=700}

平台原始碼集中的實作會使用其對應的相依性：

```kotlin
// 在 commonMain 原始碼集中：
interface Platform {
    val name: String
}
```

```kotlin
// 在 androidMain 原始碼集中：
import android.os.Build

class AndroidPlatform : Platform {
    override val name: String = "Android ${Build.VERSION.SDK_INT}"
}
```

```kotlin
// 在 iosMain 原始碼集中：
import platform.UIKit.UIDevice

class IOSPlatform : Platform {
    override val name: String = UIDevice.currentDevice.systemName() + " " + UIDevice.currentDevice.systemVersion
}
```

當你需要通用介面來注入適當的平台實作時，你可以選擇以下其中一個選項，下文將詳細說明：

* [使用 expect 和 actual 函式](#expected-and-actual-functions)
* [透過不同的入口點提供實作](#different-entry-points)
* [使用相依注入架構](#dependency-injection-framework)

### expect 和 actual 函式

定義一個回傳此介面值的 expect 函式，然後定義回傳其子類別的 actual 函式：

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

當你在通用程式碼中呼叫 `platform()` 函式時，它可以處理 `Platform` 型別的物件。
當你在 Android 上執行此通用程式碼時，`platform()` 呼叫會回傳 `AndroidPlatform` 類別的執行個體。
當你在 iOS 上執行時，`platform()` 會回傳 `IOSPlatform` 類別的執行個體。

### 不同的入口點

如果你可以控制入口點，則可以在不使用 expect 和 actual 宣告的情況下，建構每個平台產物的實作。為此，請在共享的 Kotlin Multiplatform 模組中定義平台實作，但在平台模組中具現化它們：

```kotlin
// 共享 Kotlin Multiplatform 模組
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
// 在 iosApp 平台模組中 (使用 Swift)：
import shared

@main
struct iOSApp : App {
    init() {
        application(IOSPlatform())
    }
}
```

在 Android 上，你應建立 `AndroidPlatform` 的執行個體並將其傳遞給 `application()` 函式；而在 iOS 上，你也應同樣建立並傳遞 `IOSPlatform` 的執行個體。這些入口點不需要是應用程式的進入點，但這是你可以呼叫共享模組特定功能的地方。

使用 expect 和 actual 函式或直接透過入口點提供正確的實作，對於簡單的案例非常有效。然而，如果你在專案中使用了相依注入架構，我們建議在簡單的情況下也使用它，以確保一致性。

### 相依注入架構

現代應用程式通常使用相依注入 (DI) 架構來建立鬆散耦合的架構。DI 架構允許根據目前的環境將相依性注入到組件中。

任何支援 Kotlin Multiplatform 的 DI 架構都可以協助你為不同平台注入不同的相依性。

例如，[Koin](https://insert-koin.io/) 是一個支援 Kotlin Multiplatform 的相依注入架構：

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

在這裡，Koin DSL 建立了定義待注入組件的模組。你在通用程式碼中使用 `expect` 關鍵字宣告一個模組，然後為每個平台使用 `actual` 關鍵字提供平台特定的實作。該架構負責在執行時選擇正確的實作。

當你使用 DI 架構時，你會透過此架構注入所有相依性。處理平台相依性的邏輯也是如此。如果你的專案中已經有了 DI，我們建議繼續使用它，而不是手動使用 expect 和 actual 函式。這樣，你可以避免混合使用兩種不同的相依性注入方式。

你不一定非得總是在 Kotlin 中實作通用介面。你也可以在另一個語言（如 Swift）的 不同 *平台模組* 中實作它。如果你選擇這種方式，則應使用 DI 架構從 iOS 平台模組提供實作：

![使用相依注入架構](expect-di-framework.svg){width=700}

這種方法僅在你將實作放在平台模組中時才有效。它的擴展性並非很好，因為你的 Kotlin Multiplatform 模組無法自給自足，你需要並在不同的模組中實作通用介面。

<!-- 如果你對將此功能擴展到共享模組感興趣，請在 Youtrack 中為此問題投票並描述你的使用案例。 -->

## 下一步

如需更多關於 expect/actual 機制的範例和資訊，請參閱 [expect 和 actual 宣告](multiplatform-expect-actual.md)。