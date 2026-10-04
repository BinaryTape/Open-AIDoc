[//]: # (title: 在平台之間共享程式碼)

透過 Kotlin Multiplatform，你可以使用 Kotlin 提供的機制來共享程式碼： 
 
* [在專案使用的所有平台之間共享程式碼](#share-code-on-all-platforms)。用於共享適用於所有平台的通用商務邏輯。     
* [在專案包含的部分（而非所有）平台之間共享程式碼](#share-code-on-similar-platforms)。你可以藉助階層結構在相似的平台中重複使用程式碼。

如果你需要從共享程式碼存取平台專屬的 API，請使用 Kotlin 的[預期宣告與實際宣告 (expected and actual declarations)](multiplatform-expect-actual.md) 機制。

## 在所有平台上共享程式碼 {id="share-code-on-all-platforms"}

如果你有適用於所有平台的通用商務邏輯，則不需要為每個平台編寫相同的程式碼——只需在通用原始碼集 (common source set) 中共享即可。

![在所有平台間共享的程式碼](flat-structure.svg)

原始碼集的一些相依性是預設設定的。你不需要手動指定任何 `dependsOn` 關聯：
* 適用於所有相依於通用原始碼集的平台專屬原始碼集，例如 `jvmMain`、`macosArm64Main` 等。 
* 位於特定目標的 `main` 和 `test` 原始碼集之間，例如 `androidMain` 與 `androidUnitTest`。

如果你需要從共享程式碼存取平台專屬的 API，請使用 Kotlin 的[預期宣告與實際宣告](multiplatform-expect-actual.md)機制。

## 在相似平台上共享程式碼 {id="share-code-on-similar-platforms"}

你經常需要建立多個可能重複使用大量通用邏輯和第三方 API 的原生目標。

例如，在一個以 iOS 為目標的典型多平台專案中，有兩個 iOS 相關的目標：一個用於 iOS ARM64 裝置，另一個用於 x64 模擬器。它們擁有各自獨立的平台專屬原始碼集，但實際上裝置和模擬器很少需要不同的程式碼，且它們的相依性大致相同。因此可以在它們之間共享 iOS 專屬的程式碼。

顯然，在這種設定下，若能為這兩個 iOS 目標提供一個共享原始碼集會更為理想，其中的 Kotlin/Native 程式碼仍可直接呼叫 iOS 裝置和模擬器通用的任何 API。

在這種情況下，你可以透過以下其中一種方式，在專案中使用[階層結構](multiplatform-hierarchy.md)跨原生目標共享程式碼：

* [使用預設階層範本](multiplatform-hierarchy.md#default-hierarchy-template)
* [手動設定階層結構](multiplatform-hierarchy.md#manual-configuration)

進一步了解[在程式庫中共享程式碼](#share-code-in-libraries)以及[連接平台專屬程式庫](#connect-platform-specific-libraries)。

## 在程式庫中共享程式碼 {id="share-code-in-libraries"}

得益於階層式專案結構，程式庫也可以為目標子集提供通用 API。當[程式庫發佈](multiplatform-publish-lib-setup.md)時，其中介原始碼集的 API 會連同專案結構的資訊一起嵌入到程式庫產物中。當你使用該程式庫時，專案中的中介原始碼集僅能存取該程式庫中對每個原始碼集目標可用的 API。

例如，請查看來自 `kotlinx.coroutines` 存儲庫的以下原始碼集階層：

![程式庫階層結構](lib-hierarchical-structure.svg)

`concurrent` 原始碼集宣告了 `runBlocking` 函式，並針對 JVM 和原生目標進行編譯。一旦 `kotlinx.coroutines` 程式庫更新並以階層式專案結構發佈，你就可以相依於它，並從 JVM 與原生目標之間共享的原始碼集中呼叫 `runBlocking`，因為它符合該程式庫 `concurrent` 原始碼集的「目標簽章 (targets signature)」。

## 連接平台專屬程式庫 {id="connect-platform-specific-libraries"}

為了在不受限於平台專屬相依性的情況下共享更多原生程式碼，請使用[平台程式庫](https://kotlinlang.org/docs/native-platform-libs.html)，如 Foundation、UIKit 和 POSIX。這些程式庫隨 Kotlin/Native 一起提供，且預設在共享原始碼集中可用。

此外，如果你在專案中使用 [Kotlin CocoaPods Gradle](multiplatform-cocoapods-overview.md) 外掛程式，你可以使用透過 [`cinterop` 機制](https://kotlinlang.org/docs/native-c-interop.html)引入的第三方原生程式庫。

## 接續閱讀 {id="what-s-next"}

* [閱讀關於 Kotlin 的預期宣告與實際宣告機制](multiplatform-expect-actual.md)
* [進一步了解階層式專案結構](multiplatform-hierarchy.md)
* [設定多平台程式庫的發佈](multiplatform-publish-lib-setup.md)
* [查看我們關於多平台專案中原始碼檔案命名的建議](https://kotlinlang.org/docs/coding-conventions.html#source-file-names)