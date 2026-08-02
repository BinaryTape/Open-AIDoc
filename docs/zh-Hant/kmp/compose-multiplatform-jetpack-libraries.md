# 多平台 Jetpack 程式庫是如何封裝的

Compose Multiplatform 將 Jetpack Compose 及其相關 AndroidX 程式庫的強大功能帶到了 Android 以外的其他平台。
如 [Android 開發者網站](https://developer.android.com/kotlin/multiplatform)所示，
許多 Jetpack 程式庫（如 `androidx.annotation`）由 Android 團隊以完全多平台的形式發布，
並且可以原封不動地在 KMP 專案中使用。
其他程式庫，例如 Compose 本身、Navigation、Lifecycle 和 ViewModel，則需要額外的支援才能在 common 程式碼中運作。

JetBrains 的 Compose Multiplatform 團隊為這些程式庫產出了適用於 Android 以外平台的構件，
然後將它們與原始 Android 構件一起發布在單個群組 ID 下。
這樣，當您將此類多平台相依性新增到 common 原始碼集時，
應用程式的 Android 發行版本會使用 Android 構件。
同時，其他目標平台的發行版本則使用為相應平台建置的構件。

以下是該流程的概述：

![](androidx-cmp-artifacts.svg)

例如，「iOS 版 Navigation 構件」是指以下多平台構件的集合：
* `org.jetbrains.androidx.navigation.navigation-compose-uikitarm64`
* `org.jetbrains.androidx.navigation.navigation-compose-uikitsimarm64`
* `org.jetbrains.androidx.navigation.navigation-common-iosarm64`
* `org.jetbrains.androidx.navigation.navigation-runtime-iossimulatorarm64`
* 依此類推。

All of these artifacts, together with the artifacts for other platforms and a reference to the original Android library (`androidx.navigation.navigation-compose`),
are published as a group. They are accessible through the unifying 
`org.jetbrains.androidx.navigation.navigation-compose` dependency.
Compose Multiplatform Gradle 外掛程式處理平台特定構件到發行版本的對應。

透過這種方法，由包含該相依性的 Kotlin Multiplatform (KMP) 專案產出的 Android 應用程式會使用原始的 Android Navigation 程式庫。
另一方面，iOS 應用程式則使用由 JetBrains 建置的對應 iOS 程式庫。

## 適用於多平台專案的 Compose 封裝

在基礎 Compose 程式庫中，最基本的 `androidx.compose.runtime` 是完全多平台的。
  （[之前使用的](whats-new-compose-190.md#multiplatform-targets-in-androidx-compose-runtime-runtime)
  `org.jetbrains.compose.runtime` 構件現在作為別名使用。）
此外，Compose Multiplatform 實作了：
   * `androidx.compose.ui` 和 `androidx.compose.foundation` 的多平台版本，
     在 Compose Multiplatform 專案中可以作為 `org.jetbrains.compose.ui` 和 `org.jetbrains.compose.foundation` 使用。
   * `androidx.compose.material3` 和 `androidx.compose.material` 的多平台版本，其封裝方式類似
     (`org.jetbrains.compose.material3` 和 `org.jetbrains.compose.material`)。
     與其他程式庫不同，Material 3 程式庫並未與 Compose Multiplatform 版本耦合。
     因此，您可以提供直接的相依性，而不是使用 `material3` 別名。例如，您可以使用 EAP 版本。
   * Material 3 適應性程式庫作為獨立構件 (`org.jetbrains.compose.material3.adaptive:adaptive*`)

## 其他多平台程式庫

建置 Compose 應用程式所需的一些功能超出了 AndroidX 的範圍，
因此 JetBrains 將其作為隨附於 Compose Multiplatform 的多平台程式庫來實作，例如：

* Compose Multiplatform Gradle 外掛程式，其功能包括：
    * 提供用於設定 Compose Multiplatform 專案的 Gradle DSL。
    * 協助為桌面和 Web 目標平台建立發行包。
    * 支援多平台資源庫，使資源能正確地在每個目標平台中可用。
* `org.jetbrains.compose.components.resources`：提供對[跨平台資源](compose-multiplatform-resources.md)的支援。
* `org.jetbrains.compose.components.uiToolingPreview`：支援在 IntelliJ IDEA 和 Android Studio 中為 common 程式碼提供 Compose UI 預覽。
* `org.jetbrains.compose.components.animatedimage`：支援顯示動畫圖像。
* `org.jetbrains.compose.components.splitpane`：實作了類似於 Swing 的 [JSplitPane](https://docs.oracle.com/javase/8/docs/api/javax/swing/JSplitPane.html) 的功能。