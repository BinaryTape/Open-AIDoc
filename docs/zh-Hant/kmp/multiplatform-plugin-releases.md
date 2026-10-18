[//]: # (title: Kotlin Multiplatform IDE 外掛程式版本發佈)

[Kotlin Multiplatform IDE 外掛程式](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)
可協助你針對 Android、iOS、桌面和 Web 開發跨平台應用程式。
請確認你使用的是最新版本的外掛程式，以便開發 Kotlin Multiplatform 專案。

該外掛程式與 IntelliJ IDEA 及 Android Studio 相容：
* IntelliJ IDEA 在 macOS 上自 2025.1.1.1 版本起支援此外掛程式，而在 Windows 和 Linux 上則自 2025.2.2 版本起支援。
* Android Studio 在 macOS 上自 Narwhal 2025.1.1 版本起支援此外掛程式，而在 Windows 和 Linux 上則自 Otter 2025.2.1 版本起支援。

有關 Kotlin Multiplatform Gradle 外掛程式的資訊，請參閱其 [DSL 參考](multiplatform-dsl-reference.md)
與[相容性指南](multiplatform-compatibility-guide.md)。

## 更新至最新版本 {id="update-to-the-latest-release"}

一旦有新的 Kotlin Multiplatform 外掛程式版本發佈，你的 IDE 就會提示進行更新。
如果你接受該建議，外掛程式將會更新至最新版本。
你也可以在 **Settings | Plugins** 中檢查外掛程式版本並手動進行更新。

Kotlin Multiplatform IDE 外掛程式會隨每個 IntelliJ IDEA 和 Android Studio 版本進行更新，
其主要版本號會與對應的 IDE 版本保持一致。

以下是在工具鏈穩定之前發佈的主要版本詳細資訊。

## 歷史版本詳情 {collapsible="true" id="previous-release-details"}

下表列出了 Kotlin Multiplatform IDE 外掛程式的歷次發佈： 

<table> 

<tr>
<th>
版本資訊
</th>
<th>
版本亮點
</th>
<th>
相容的 Kotlin 版本
</th>
</tr>

<tr id="0.9">
<td>

**0.9**

發佈日期：2025 年 5 月 19 日

</td>
<td>

Kotlin Multiplatform 外掛程式進行了徹底重構：

* 為受支援的 IDE 整合了 **New Project** 精靈。
* 提供環境預檢功能，協助尋找並解決設定問題，包含 Java、Android、Xcode 和 Gradle。
* 為所有受支援的平台自動產生執行配置（run configuration），並提供 iOS 和 Android 的裝置選擇器。
* 跨語言支援：提供 Swift 與 Kotlin 之間的跨語言導覽與偵錯，以及 Swift 語法高亮顯示和快速文件。
* Compose Multiplatform 支援：Kotlin Multiplatform IDE 外掛程式現已支援 Compose Multiplatform 資源、自動補全以及通用程式碼的 UI 預覽（原有的 [Compose Multiplatform 外掛程式](https://plugins.jetbrains.com/plugin/16541-compose-multiplatform-ide-support)可以安全解除安裝）。
* Compose Hot Reload：即時查看 UI 變更而無需重新啟動應用程式（適用於桌面 JVM 目標）。
    詳細資訊請參閱 [Hot Reload 文件](compose-hot-reload.md)。

已知問題：

* 在 Android Studio 中，Compose 偵錯工具目前無法在 Kotlin 2.1.20 和 2.1.21 下運作。
    此問題將在 Kotlin 2.2.0-RC2 中修復。

</td>
<td>

此外掛程式可搭配[任何 Kotlin 版本](https://kotlinlang.org/docs/releases.html#release-details)使用，
但其大部分功能依賴於 Kotlin 2.1.21。
更新至最新的穩定 Kotlin 版本可確保獲得最佳體驗。

此版本還需要 K2 模式，因此請確保將其啟用：
在 **Settings** | **Languages & Frameworks** | **Kotlin** 中，勾選 **Enable K2 mode**。

</td>
</tr>

<tr>
<td>

**0.8.4**

發佈日期：2024 年 12 月 6 日

</td>
<td>

* 支援 Kotlin 的 [K2 模式](https://kotlinlang.org/docs/k2-compiler-migration-guide.html#support-in-ides)，以提升穩定性與程式碼分析效能。

</td>
<td>

[任何 Kotlin 外掛程式版本](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.8.3**

發佈日期：2024 年 7 月 23 日

</td>
<td>

* 修復了 Xcode 相容性問題。

</td>
<td>

[任何 Kotlin 外掛程式版本](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.8.2**

發佈日期：2024 年 5 月 16 日

</td>
<td>

* 支援 Android Studio Jellyfish 以及新的 Canary 版本 Koala。
* 在共用模組中新增了 `sourceCompatibility` 和 `targetCompatibility` 的宣告。

</td>
<td>

[任何 Kotlin 外掛程式版本](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.8.1**

發佈日期：2023 年 11 月 9 日

</td>
<td>

* 將 Kotlin 更新至 1.9.20。
* 將 Jetpack Compose 更新至 1.5.4。
* 預設啟用 Gradle 建置與組態快取。
* 針對新的 Kotlin 版本重構了組建組態。
* iOS framework 現在預設為靜態（static）。
* 修復了在搭載 Xcode 15 的 iOS 裝置上執行的問題。

</td>
<td>

[任何 Kotlin 外掛程式版本](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.8.0**

發佈日期：2023 年 10 月 5 日

</td>
<td>

* [KT-60169](https://youtrack.jetbrains.com/issue/KT-60169) 遷移至 Gradle 版本目錄（version catalog）。
* [KT-59269](https://youtrack.jetbrains.com/issue/KT-59269) 將 `android` 重新命名為 `androidTarget`。
* [KT-59269](https://youtrack.jetbrains.com/issue/KT-59269) 更新了 Kotlin 和相依性版本。
* [KTIJ-26773](https://youtrack.jetbrains.com/issue/KTIJ-26773) 重構以使用 `-destination` 引數取代 `-sdk` 和 `-arch`。
* [KTIJ-25839](https://youtrack.jetbrains.com/issue/KTIJ-25839) 重構了產生的檔案名稱。
* [KTIJ-27058](https://youtrack.jetbrains.com/issue/KTIJ-27058) 新增了 JVM 目標配置。
* [KTIJ-27160](https://youtrack.jetbrains.com/issue/KTIJ-27160) 支援 Xcode 15.0。
* [KTIJ-27158](https://youtrack.jetbrains.com/issue/KTIJ-27158) 將新模組精靈移至實驗狀態。

</td>
<td>

[任何 Kotlin 外掛程式版本](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.6.0**

發佈日期：2023 年 5 月 24 日

</td>
<td>

* 支援新的 Canary Android Studio Hedgehog。
* 更新了 Multiplatform 專案中的 Kotlin、Gradle 和程式庫版本。
* 在 Multiplatform 專案中套用了新的 [`targetHierarchy.default()`](https://kotlinlang.org/docs/whatsnew1820.html#new-approach-to-source-set-hierarchy)。
* 在 Multiplatform 專案中為平台專屬檔案套用了原始碼集名稱後綴。

</td>
<td>

[任何 Kotlin 外掛程式版本](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.5.3**

發佈日期：2023 年 4 月 12 日

</td>
<td>

* 更新了 Kotlin 和 Compose 版本。
* 修復了 Xcode 專案 scheme 剖析問題。
* 新增了 scheme 產品型別檢查。
* 若存在 `iosApp` scheme，現在預設會選取它。

</td>
<td>

[任何 Kotlin 外掛程式版本](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.5.2**

發佈日期：2023 年 1 月 30 日

</td>
<td>

* [修復了 Kotlin/Native 偵錯工具的問題（Spotlight 索引緩慢）](https://youtrack.jetbrains.com/issue/KT-55988)。
* [修復了多模組專案中的 Kotlin/Native 偵錯工具問題](https://youtrack.jetbrains.com/issue/KT-24450)。
* [針對 Android Studio Giraffe 2022.3.1 Canary 的新組建](https://youtrack.jetbrains.com/issue/KT-55274)。
* [新增了 iOS 應用程式組建的佈建旗標（provisioning flags）](https://youtrack.jetbrains.com/issue/KT-55204)。
* [在產生的 iOS 專案中，為 **Framework Search Paths** 選項新增了繼承的路徑](https://youtrack.jetbrains.com/issue/KT-55402)。

</td>
<td>

[任何 Kotlin 外掛程式版本](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.5.1**

發佈日期：2022 年 11 月 30 日

</td>
<td>

* [修復了新專案產生的問題：刪除多餘的 "app" 目錄](https://youtrack.jetbrains.com/issue/KTIJ-23790)。

</td>
<td>

[Kotlin 1.7.0—*](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.5.0**

發佈日期：2022 年 11 月 22 日

</td>
<td>

* [變更了 iOS framework 發發布的預設選項：現為 **Regular framework**](https://youtrack.jetbrains.com/issue/KT-54086)。
* [將產生的 Android 專案中的 `MyApplicationTheme` 移至獨立檔案](https://youtrack.jetbrains.com/issue/KT-53991)。
* [更新了產生的 Android 專案](https://youtrack.jetbrains.com/issue/KT-54658)。
* [修復了新專案目錄意外被抹除的問題](https://youtrack.jetbrains.com/issue/KTIJ-23707)。

</td>
<td>

[Kotlin 1.7.0—*](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.3.4**

發佈日期：2022 年 9 月 12 日

</td>
<td>

* [將 Android 應用程式遷移至 Jetpack Compose](https://youtrack.jetbrains.com/issue/KT-53162)。
* [移除了過時的 HMPP 旗標](https://youtrack.jetbrains.com/issue/KT-52248)。
* [從 Android 清單中移除了套件名稱](https://youtrack.jetbrains.com/issue/KTIJ-22633)。
* [更新了 Xcode 專案的 `.gitignore`](https://youtrack.jetbrains.com/issue/KT-53703)。
* [更新了精靈專案，以更好地演示 expect/actual](https://youtrack.jetbrains.com/issue/KT-53928)。
* [更新了與 Android Studio Canary 組建的相容性](https://youtrack.jetbrains.com/issue/KTIJ-22063)。
* [將 Android 應用程式的最低 Android SDK 版本更新至 21](https://youtrack.jetbrains.com/issue/KTIJ-22505)。
* [修復了安裝 Xcode 後首次啟動時發生的問題](https://youtrack.jetbrains.com/issue/KTIJ-22645)。
* [修復了 M1 上 Apple 執行配置的問題](https://youtrack.jetbrains.com/issue/KTIJ-21781)。
* [修復了 Windows 作業系統上 `local.properties` 的問題](https://youtrack.jetbrains.com/issue/KTIJ-22037)。
* [修復了 Android Studio Canary 組建上 Kotlin/Native 偵錯工具的問題](https://youtrack.jetbrains.com/issue/KT-53976)。

</td>
<td>

[Kotlin 1.7.0—1.7.*](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.3.3**

發佈日期：2022 年 6 月 9 日

</td>
<td>

* 更新了對 Kotlin IDE 外掛程式 1.7.0 的相依性。

</td>
<td>

[Kotlin 1.7.0—1.7.*](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.3.2**

發佈日期：2022 年 4 月 4 日

</td>
<td>

* 修復了在 Android Studio 2021.2 和 2021.3 上對 iOS 應用程式偵錯時的效能問題。

</td>
<td>

[Kotlin 1.5.0—1.6.*](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.3.1**

發佈日期：2022 年 2 月 15 日

</td>
<td>

* [在 Kotlin Multiplatform Mobile 精靈中啟用了 M1 iOS 模擬器](https://youtrack.jetbrains.com/issue/KT-51105)。
* 改善了索引 XcProjects 的效能：[KT-49777](https://youtrack.jetbrains.com/issue/KT-49777)、[KT-50779](https://youtrack.jetbrains.com/issue/KT-50779)。
* 建置指令碼清理：使用 `kotlin("test")` 取代 `kotlin("test-common")` 和 `kotlin("test-annotations-common")`。
* 擴大了與 [Kotlin 外掛程式版本](https://youtrack.jetbrains.com/issue/KTIJ-20167)的相容範圍。
* [修復了 Windows 主機上 JVM 偵錯的問題](https://youtrack.jetbrains.com/issue/KT-50699)。
* [修復了停用外掛程式後版本無效的問題](https://youtrack.jetbrains.com/issue/KT-50966)。

</td>
<td>

[Kotlin 1.5.0—1.6.*](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.3.0**

發佈日期：2021 年 11 月 16 日

</td>
<td>

* [全新的 Kotlin Multiplatform Library 精靈](https://youtrack.jetbrains.com/issue/KTIJ-19367)。
* 支援新型別的 Kotlin Multiplatform 程式庫發佈：[XCFramework](multiplatform-build-native-binaries.md#build-xcframeworks)。
* 為新的跨平台行動專案啟用了[階層式專案結構](multiplatform-hierarchy.md#manual-configuration)。
* 支援[明確宣告 iOS 目標](https://youtrack.jetbrains.com/issue/KT-46861)。
* [在非 Mac 電腦上啟用了 Kotlin Multiplatform Mobile 外掛程式精靈](https://youtrack.jetbrains.com/issue/KT-48614)。
* [在 Kotlin Multiplatform 模組精靈中支援子資料夾](https://youtrack.jetbrains.com/issue/KT-47923)。
* [支援 Xcode `Assets.xcassets` 檔案](https://youtrack.jetbrains.com/issue/KT-49571)。
* [修復了外掛程式類別載入器（classloader）例外](https://youtrack.jetbrains.com/issue/KT-48103)。
* 更新了 CocoaPods Gradle Plugin 範本。
* Kotlin/Native 偵錯工具型別評估改善。
* 修復了在 Xcode 13 上啟動 iOS 裝置的問題。

</td>
<td>

[Kotlin 1.6.0](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.2.7**

發佈日期：2021 年 8 月 2 日

</td>
<td>

* [為 AppleRunConfiguration 新增了 Xcode 配置選項](https://youtrack.jetbrains.com/issue/KTIJ-19054)。
* [新增了對 Apple M1 模擬器的支援](https://youtrack.jetbrains.com/issue/KT-47618)。
* [在專案精靈中新增了關於 Xcode 整合選項的資訊](https://youtrack.jetbrains.com/issue/KT-47466)。
* [新增了在產生包含 CocoaPods 的專案但未安裝 CocoaPods gem 時的錯誤通知](https://youtrack.jetbrains.com/issue/KT-47329)。
* [在使用 Kotlin 1.5.30 產生的共用模組中，新增了對 Apple M1 模擬器目標的支援](https://youtrack.jetbrains.com/issue/KT-47631)。
* [清理了使用 Kotlin 1.5.20 產生的 Xcode 專案](https://youtrack.jetbrains.com/issue/KT-47465)。
* 修復了在實體 iOS 裝置上啟動 Xcode Release 配置的問題。
* 修復了在 Xcode 12.5 上啟動模擬器的問題。

</td>
<td>

[Kotlin 1.5.10](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.2.6**

發佈日期：2021 年 6 月 10 日

</td>
<td>

* 與 Android Studio Bumblebee Canary 1 相容。
* 支援 [Kotlin 1.5.20](https://kotlinlang.org/docs/whatsnew1520.html)：在專案精靈中為 Kotlin/Native 使用新的 framework 打包任務。

</td>
<td>

[Kotlin 1.5.10](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.2.5**

發佈日期：2021 年 5 月 25 日

</td>
<td>

* [修復了與 Android Studio Arctic Fox 2020.3.1 Beta 1 及更高版本的相容性問題](https://youtrack.jetbrains.com/issue/KT-46834)。

</td>
<td>

[Kotlin 1.5.10](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.2.4**

發佈日期：2021 年 5 月 5 日

</td>
<td>

請搭配 Android Studio 4.2 或 Android Studio 2020.3.1 Canary 8 或更高版本使用此版本的外掛程式。
* 與 [Kotlin 1.5.0](https://kotlinlang.org/docs/whatsnew15.html) 相容。
* [能夠在 Kotlin Multiplatform 模組中使用 CocoaPods 相依性管理器進行 iOS 整合](https://youtrack.jetbrains.com/issue/KT-45946)。

</td>
<td>

[Kotlin 1.5.0](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.2.3**

發佈日期：2021 年 4 月 5 日

</td>
<td>

* [專案精靈：模組命名方面的改善](https://youtrack.jetbrains.com/issues?q=issue%20id:%20KT-43449,%20KT-44060,%20KT-41520,%20KT-45282)。
* [能夠在專案精靈中使用 CocoaPods 相依性管理器進行 iOS 整合](https://youtrack.jetbrains.com/issue/KT-45478)。
* [提高新專案中 gradle.properties 的可讀性](https://youtrack.jetbrains.com/issue/KT-42908)。
* [取消勾選「Add sample tests for Shared Module」時不再產生範例測試](https://youtrack.jetbrains.com/issue/KT-43441)。
* [修復與其他改善](https://youtrack.jetbrains.com/issues?q=Subsystems:%20%7BKMM%20Plugin%7D%20Type:%20Feature,%20Bug%20State:%20-Obsolete,%20-%7BAs%20designed%7D,%20-Answered,%20-Incomplete%20resolved%20date:%202021-03-10%20..%202021-03-25)。

</td>
<td>

[Kotlin 1.4.30](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.2.2**

發佈日期：2021 年 3 月 3 日

</td>
<td>

* [能夠在 Xcode 中開啟與 Xcode 相關的檔案](https://youtrack.jetbrains.com/issue/KT-44970)。
* [能夠在 iOS 執行配置中為 Xcode 專案檔案設定位置](https://youtrack.jetbrains.com/issue/KT-44968)。
* [支援 Android Studio 2020.3.1 Canary 8](https://youtrack.jetbrains.com/issue/KT-45162)。
* [修復與其他改善](https://youtrack.jetbrains.com/issues?q=tag:%20KMM-0.2.2%20)。

</td>
<td>

[Kotlin 1.4.30](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.2.1**

發佈日期：2021 年 2 月 15 日

</td>
<td>

請搭配 Android Studio 4.2 使用此版本的外掛程式。
* 基礎結構改善。
* [修復與其他改善](https://youtrack.jetbrains.com/issues?q=tag:%20KMM-0.2.1%20)。

</td>
<td>

[Kotlin 1.4.30](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.2.0**

發佈日期：2020 年 11 月 23 日

</td>
<td>

* [支援 iPad 裝置](https://youtrack.jetbrains.com/issue/KT-41932)。
* [支援在 Xcode 中設定的自訂 scheme 名稱](https://youtrack.jetbrains.com/issue/KT-41677)。
* [能夠為 iOS 執行配置新增自訂建置步驟](https://youtrack.jetbrains.com/issue/KT-41678)。
* [能夠偵錯自訂的 Kotlin/Native 二進位檔](https://youtrack.jetbrains.com/issue/KT-40954)。
* [簡化了 Kotlin Multiplatform Mobile 精靈產生的程式碼](https://youtrack.jetbrains.com/issue/KT-41712)。
* [移除了對 Kotlin Android Extensions 外掛程式的支援](https://youtrack.jetbrains.com/issue/KT-42121)（該外掛程式已在 Kotlin 1.4.20 中被棄用）。
* [修復了從主機中斷連線後實體裝置配置的儲存問題](https://youtrack.jetbrains.com/issue/KT-42390)。
* 其他修復與改善。

</td>
<td>

[Kotlin 1.4.20](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.1.3**

發佈日期：2020 年 10 月 2 日

</td>
<td>

* 新增了與 iOS 14 和 Xcode 12 的相容性。
* 修復了由 Kotlin Multiplatform Mobile 精靈建立的平台測試中的命名問題。

</td>
<td>

* [Kotlin 1.4.10](https://kotlinlang.org/docs/releases.html#release-details)
* [Kotlin 1.4.20](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.1.2**

發佈日期：2020 年 9 月 29 日

</td>
<td>

 * 修復了與 [Kotlin 1.4.20-M1](https://kotlinlang.org/docs/eap.html#build-details) 的相容性。
 * 預設啟用向 JetBrains 回報錯誤。

</td>
<td>

* [Kotlin 1.4.10](https://kotlinlang.org/docs/releases.html#release-details)
* [Kotlin 1.4.20](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.1.1**

發佈日期：2020 年 9 月 10 日

</td>
<td>

* 修復了與 Android Studio Canary 8 及更高版本的相容性問題。

</td>
<td>

* [Kotlin 1.4.10](https://kotlinlang.org/docs/releases.html#release-details)
* [Kotlin 1.4.20](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.1.0**

發佈日期：2020 年 8 月 31 日

</td>
<td>

* Kotlin Multiplatform Mobile 外掛程式的第一個版本。請在[部落格文章](https://blog.jetbrains.com/kotlin/2020/08/kotlin-multiplatform-mobile-goes-alpha/)中了解更多資訊。

</td>
<td>

* [Kotlin 1.4.0](https://kotlinlang.org/docs/releases.html#release-details)
* [Kotlin 1.4.10](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

</table>