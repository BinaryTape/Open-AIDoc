[//]: # (title: C、Objective-C 與 Swift 程式庫匯入)

Kotlin/Native 提供了 [匯入 C](native-c-interop.md) 與 [Objective-C](native-objc-interop.md) 程式庫的能力。
您也可以採用折衷方案，將純 [Swift 庫](#swift-library-import) 匯入到您的 Kotlin/Native 專案中。

## C 與 Objective-C 程式庫匯入的穩定性 {id="stability-of-c-and-objective-c-library-import"}
<primary-label ref="beta"/>

目前匯入 C 與 Objective-C 程式庫的支援處於 [Beta](components-stability.md#kotlin-native) 階段。

處於 Beta 狀態的主要原因之一是，使用 C 與 Objective-C 程式庫可能會影響您的程式碼與不同版本的 Kotlin、相依性以及 Xcode 的相容性。本指南列出了實務中經常發生的相容性問題、僅在某些情況下發生的問題，以及假設性的潛在問題。

為了簡化起見，我們將 C 與 Objective-C 程式庫（在此稱為「原生庫」）分為：

* [平台庫](#platform-libraries)：Kotlin 預設提供，用於存取各個平台上的「系統」原生庫。
* [第三方庫](#third-party-libraries)：所有其他需要額外配置才能供 Kotlin 使用的原生庫。

這兩種原生庫具有不同的相容性細節。

### 平台庫 {id="platform-libraries"}

[_平台庫_](native-platform-libs.md) 隨 Kotlin/Native 編譯器一起提供。
因此，在專案中使用不同版本的 Kotlin 會導致獲得不同版本的平台庫。
對於 Apple 目標（如 iOS），平台庫是根據特定編譯器版本支援的 Xcode 版本產生的。

Xcode SDK 隨附的原生庫 API 會隨每個 Xcode 版本而改變。
即使這些變更在原生語言中是原始碼與二進位相容的，
由於互通性實作的原因，對於 Kotlin 來說它們也可能變成破壞性的。

因此，更新專案中的 Kotlin 版本可能會為平台庫帶來破壞性變更。
這在以下兩種情況下可能會有影響：

* 平台庫中存在原始碼破壞性變更，影響了您專案中原始碼的編譯。通常這很容易修正。
* 平台庫中存在二進位破壞性變更，影響了您的某些相依性。
  通常沒有簡單的解決方法，您需要等待程式庫開發者在他們端修正此問題，例如透過更新 Kotlin 版本。

  > 此類二進位不相容性表現為連結警告與執行時例外。
  > 如果您偏好在編譯時偵測這些問題，請使用
  > [`-Xpartial-linkage-loglevel=ERROR`](whatsnew19.md#library-linkage-in-kotlin-native) 編譯器選項將警告提升為錯誤。
  >
  {style="note"}

當 JetBrains 團隊更新用於產生平台庫的 Xcode 版本時，會盡合理努力避免平台庫中的破壞性變更。每當可能發生破壞性變更時，團隊都會進行影響分析，並決定忽略特定變更（因為受影響的 API 並不常用），或者套用臨機操作（ad hoc）修正。

平台庫破壞性變更的另一個潛在原因是將原生 API 轉換為 Kotlin 的演算法發生了變化。在這種情況下，JetBrains 團隊也會盡合理努力避免破壞性變更。

#### 從平台庫使用新的 Objective-C 類別 {id="using-new-objective-c-classes-from-platform-libraries"}

Kotlin 編譯器不會阻止您使用在部署目標中不可用的 Objective-C 類別。

例如，如果您的部署目標是 iOS 17.0，而您使用了僅在 iOS 18.0 中出現的類別，編譯器不會向您發出警告，且您的應用程式可能會在 iOS 17.0 的裝置上啟動時當機。
此外，即使執行過程從未觸及這些用法，也會發生此類當機，因此僅使用版本檢查來保護它們是不夠的。

如需更多詳細資訊，請參閱 [強連結 (Strong linking)](native-objc-interop.md#strong-linking)。

### 第三方庫 {id="third-party-libraries"}

除了系統平台庫之外，Kotlin/Native 還允許匯入第三方原生庫。
例如，您可以使用 [CocoaPods 整合](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-overview.html)
或設定 [cinterops 配置](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#cinterops)。

#### 匯入 Xcode 版本不符的程式庫 {id="importing-libraries-with-mismatched-xcode-version"}

匯入第三方原生庫可能會導致與不同 Xcode 版本的相容性問題。

在處理原生庫時，編譯器通常會使用本機安裝的 Xcode 中的標頭檔，因為幾乎所有原生庫標頭檔都會匯入來自 Xcode 的「標準」標頭檔（例如 `stdint.h`）。

這就是為什麼 Xcode 版本會影響原生庫匯入 Kotlin 的原因。這也是為什麼在使用第三方原生庫時，[從非 Mac 主機交叉編譯 Apple 目標](https://kotlinlang.org/docs/multiplatform/multiplatform-publish-lib-setup.html#compilation-for-apple-targets) 仍然是不可能的原因之一。

每個 Kotlin 版本與單一 Xcode 版本的相容性最高。這是建議的版本，並針對對應的 Kotlin 版本進行了最完整的測試。請[在相容性表中](https://kotlinlang.org/docs/multiplatform/multiplatform-compatibility-guide.html#version-compatibility)檢查與特定 Xcode 版本的相容性。

使用較新或較舊的 Xcode 版本通常是可行的，但可能會導致問題，通常會影響第三方原生庫的匯入。

##### Xcode 版本比建議版本新 {id="xcode-version-is-newer-than-recommended"}

使用比建議版本新的 Xcode 版本可能會破壞某些 Kotlin 特性。匯入第三方原生庫受此影響最大。在使用不支援的 Xcode 版本時，它通常完全無法運作。

##### Xcode 版本比建議版本舊 {id="xcode-version-is-older-than-recommended"}

通常，Kotlin 與較舊的 Xcode 版本配合良好。可能會偶爾出現問題，最常導致：

* Kotlin API 引用了不存在的型別，如 [KT-71694](https://youtrack.jetbrains.com/issue/KT-71694) 所示。
* 系統庫中的型別被包含在原生庫的 Kotlin API 中。
  在這種情況下，專案編譯成功，但系統原生型別被加入到您的原生庫套件中。
  例如，您隨後可能會在 IDE 自動補全中意外看到該型別。

如果您的 Kotlin 庫使用較舊的 Xcode 版本成功編譯，除非您[在 Kotlin 庫 API 中使用了第三方庫的型別](#using-native-types-in-library-api)，否則可以安全發佈。

#### 使用傳遞性第三方原生相依性 {id="using-a-transitive-third-party-native-dependency"}

當您專案中的某個 Kotlin 庫匯入第三方原生庫作為其編譯實作的一部分時，您的專案也會獲得該原生庫的存取權限。
這是因為 Kotlin/Native 不區分 `api` 與 `implementation` 相依性類型，因此原生庫最終總是成為 `api` 相依性。

使用此類傳遞性原生相依性容易出現更多相容性問題。
例如，Kotlin 庫開發者所做的變更可能會使原生庫的 Kotlin 表示形式不相容，從而在您更新 Kotlin 庫時導致相容性問題。

因此，請直接為同一個原生庫配置互通性，而不是依賴傳遞相依性。為此，請為該原生庫使用另一個套件名稱，類似於[使用自訂套件名稱](#use-custom-package-name)以防止相容性問題。

#### 在程式庫 API 中使用原生型別 {id="using-native-types-in-library-api"}

如果您發佈 Kotlin 庫，請小心在程式庫 API 中使用原生型別。為了修正相容性與其他問題，預計未來會破壞此類用法，這將影響您的程式庫使用者。

在某些情況下，在程式庫 API 中使用原生型別是必要的，因為這是程式庫用途所要求的，例如，當 Kotlin 庫基本上是為原生庫提供擴充功能時。
如果不是這種情況，請避免或限制在程式庫 API 中使用原生型別。

此建議僅適用於程式庫 API 中原生型別的用法，與應用程式程式碼無關。它也不適用於程式庫實作，例如：

```kotlin
// 請格外小心！程式庫 API 中使用了原生型別：
public fun createUIView(): UIView
public fun handleThirdPartyNativeType(c: ThirdPartyNativeType)

// 像平常一樣小心即可；程式庫 API 中未使用原生型別：
internal fun createUIViewController(): UIViewController
public fun getDate(): String = NSDate().toString()
```

#### 發佈使用第三方庫的程式庫 {id="publishing-a-library-that-uses-third-party-library"}

如果您發佈使用第三方原生庫的 Kotlin 庫，可以採取以下幾項措施來避免相容性問題。

##### 使用自訂套件名稱 {id="use-custom-package-name"}

為第三方原生庫使用自訂套件名稱可能有助於防止相容性問題。

當原生庫匯入 Kotlin 時，它會獲得一個 Kotlin 套件名稱。如果它不是唯一的，程式庫使用者可能會遇到衝突。例如，如果原生庫在使用者專案的其他位置或其他相依性中以相同的套件名稱匯入，則這兩個用法將發生衝突。

在這種情況下，編譯可能會失敗並出現 `Linking globals named '...': symbol multiply defined!` 錯誤。但也可能出現其他錯誤，甚至編譯成功。

要為第三方原生庫使用自訂名稱：

* 透過 CocoaPods 整合匯入原生庫時，在 Gradle 組建腳本的 `pod {}` 區塊中使用 [`packageName`](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-dsl-reference.html#pod-function) 屬性。
* 使用 `cinterops` 配置匯入原生庫時，在配置區塊中使用 [`packageName`](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#cinterops) 屬性。

##### 檢查與舊版 Kotlin 版本的相容性 {id="check-compatibility-with-older-kotlin-versions"}

發佈 Kotlin 庫時，第三方原生庫的使用可能會影響程式庫與其他 Kotlin 版本的相容性，特別是：

* Kotlin Multiplatform 庫不保證向前相容性（即較舊的編譯器可以使用由較新編譯器編譯的程式庫）。

  在實務中，這在某些情況下是可行的；然而，使用原生庫可能會進一步限制向前相容性。

* Kotlin Multiplatform 庫提供回溯相容性（即較新的編譯器可以使用由較舊版本產生的程式庫）。

  在 Kotlin 庫中使用原生庫通常不應影響其回溯相容性。但它增加了更多編譯器錯誤影響相容性的可能性。

##### 避免嵌入靜態庫 {id="avoid-embedding-static-libraries"}

匯入原生庫時，可以使用 `-staticLibrary` 編譯器選項或 `.def` 檔案中的 `staticLibraries` 屬性來包含相關聯的 [靜態庫](native-definition-file.md#include-a-static-library)（`.a` 檔案）。在這種情況下，您的程式庫使用者不需要處理原生相依性與連結器選項。

然而，無法以任何方式配置所包含靜態庫的使用：既不能排除也不能替換（取代）它。因此，使用者將無法解決與其他包含相同靜態庫的 Kotlin 庫之間的潛在衝突，也無法調整其版本。

### 原生庫支援的演進 {id="evolution-of-native-library-support"}

目前，在 Kotlin 專案中使用 C 與 Objective-C 可能會導致相容性問題；本指南列出了其中的一些問題。
為了修正這些問題，未來可能需要進行一些破壞性變更，這本身也會導致相容性問題。

## Swift 程式庫匯入 {id="swift-library-import"}

Kotlin/Native 不支援直接匯入純 Swift 庫。但是，有幾種方法可以解決這個問題。

一種方法是使用手動 Objective-C 橋接。透過這種方法，您需要撰寫自訂的 Objective-C 包裝函式與 `.def` 檔案，並透過 cinterop 使用這些包裝函式。

然而，在大多數情況下，我們建議使用「反向匯入」方法：您在 Kotlin 端定義預期行為，在 Swift 端實作實際功能，然後將其傳回給 Kotlin。

您可以透過以下幾種方式之一來定義預期部分：

* 建立一個介面。基於介面的方法對於多個函式與可測試性具有更好的擴充性。
* 使用 Swift 閉包。它們非常適合快速原型開發，但這種方法有其局限性 —— 例如，它不保留狀態。
* 使用 [Swift 匯出](native-swift-export.md)。您可以直接在 Swift 中實作 Kotlin 介面，並將 Swift 物件傳回給 Kotlin，無需透過 Objective-C 橋接。

請參考這個將 [CryptoKit](https://developer.apple.com/documentation/cryptokit/) Swift 庫反向匯入到 Kotlin 專案中的範例：

<tabs>
<tab title="介面">

1. 在 Kotlin 端，建立一個介面來描述 Kotlin 對 Swift 的預期：

   ```kotlin
   // CryptoProvider.kt
   interface CryptoProvider {
       fun hashMD5(input: String): String
   }
   ```

2. 在 Kotlin 端，從 `MainViewController` 傳遞平台特定的實作，然後在 `App` 可組合項中作為參數接收它，並在需要的地方使用：

   ```kotlin
   // App.kt
   @Composable
   fun App(cryptoProvider: CryptoProvider) {
       // 在 UI 內部的範例用法
       val hashed = cryptoProvider.hashMD5("Hello, world!")
       androidx.compose.material3.Text("Compose: $hashed")
   }
   ```

   ```kotlin
   // MainViewController.kt
   fun MainViewController(cryptoProvider: CryptoProvider) = ComposeUIViewController {
       App(cryptoProvider)
   }
   ```

3. 在 Swift 端，使用純 Swift 庫 CryptoKit 實作 MD5 雜湊功能：

   ```swift
   // iosApp/ContentView.swift
   import CryptoKit
  
   class IosCryptoProvider: CryptoProvider {
       func hashMD5(input: String) -> String {
           guard let data = input.data(using: .utf8) else { return "failed" }
           return Insecure.MD5.hash(data: data).description
       }
   }
   ```

4. 將 Swift 實作傳遞給 Kotlin 組件：

   ```swift
   // iosApp/ContentView.swift
   struct ComposeView: UIViewControllerRepresentable {
       func makeUIViewController(context: Context) -> UIViewController {
           // 將 Swift 實作注入 Kotlin UI 入口點
           MainViewControllerKt.MainViewController(cryptoProvider: IosCryptoProvider())
       }

       func updateUIViewController(_ uiViewController: UIViewController, context: Context) {}
   }
   ```

</tab>
<tab title="Swift 閉包">

1. 在 Kotlin 端，宣告一個函式參數並在需要的地方使用：

    ```kotlin
    // App.kt
    @Composable
    fun App(md5Hasher: (String) -> String) {
        // 在 UI 內部的範例用法
        val hashed = md5Hasher("Hello, world!")
        androidx.compose.material3.Text("Compose: $hashed")
    }
    ```

    ```kotlin
    // MainViewController.kt
    fun MainViewController(md5Hasher: (String) -> String) = ComposeUIViewController {
        App(md5Hasher)
    }
    ```

2. 在 Swift 端，使用 CryptoKit 庫建置 MD5 雜湊器並將其作為閉包傳遞：

    ```swift
    // iosApp/ContentView.swift
    import CryptoKit
    import SwiftUI

    struct ComposeView: UIViewControllerRepresentable {
        func makeUIViewController(context: Context) -> UIViewController {
            MainViewControllerKt.MainViewController(md5Hasher: { input in
                guard let data = input.data(using: .utf8) else { return "failed" }
                return Insecure.MD5.hash(data: data).description
            })
        }

        func updateUIViewController(_ uiViewController: UIViewController, context: Context) {}
    }
    ```

</tab>
<tab title="Swift 匯出">

1. 在 Kotlin 端，宣告一個介面、一個接受該介面的函式，以及一個可供 Swift 實作繼承的 `open` 基底類別：

   ```kotlin
   // CryptoProvider.kt
   interface CryptoProvider {
       fun hashMD5(input: String): String
   }

   fun processHash(provider: CryptoProvider, input: String): String = provider.hashMD5(input)

   open class SwiftBase
   ```

2. 在 Swift 端，繼承導出的 `SwiftBase` 類別，使用純 Swift 的 CryptoKit 庫實作該介面，並將物件傳回給 Kotlin：

   ```swift
   // iosApp/ContentView.swift
   import CryptoKit

   final class IosCryptoProvider: SwiftBase, CryptoProvider {
       func hashMD5(input: String) -> String {
           guard let data = input.data(using: .utf8) else { return "failed" }
           return Insecure.MD5.hash(data: data).description
       }
   }

   let provider = IosCryptoProvider()

   // 呼叫 Kotlin 函式，該函式會反向呼叫 Swift 中的 hashMD5()
   print(processHash(provider: provider, input: "Hello, world!"))
   ```

當 Kotlin 接收到 Swift 物件時，會將其視為一般 Kotlin 介面的實作，直接呼叫 Swift 程式碼。

</tab>
</tabs>

在更複雜的專案中，使用相依注入 (dependency injection) 將 Swift 實作傳回給 Kotlin 會更方便。如需更多資訊，請參閱 [相依注入框架 (Dependency injection framework)](https://kotlinlang.org/docs/multiplatform/multiplatform-connect-to-apis.html#dependency-injection-framework) 或查看 [Koin 框架](https://insert-koin.io/docs/reference/koin-mp/kmp/) 文件。