[//]: # (title: iOS 整合方法)

您可以將 Kotlin Multiplatform 共享模組整合到您的 iOS 應用程式中。為此，您需要從共享模組產生一個 [iOS 架構](https://developer.apple.com/library/archive/documentation/MacOSX/Conceptual/BPFrameworks/Concepts/WhatAreFrameworks.html)，然後將其作為相依性新增至 iOS 專案中：

![iOS integration scheme](ios-integration-scheme.svg)

可以將此架構作為本機或遠端相依性使用。如果您希望完全控制整個程式碼庫，並在通用程式碼變更時立即更新最終應用程式，請選擇本機整合。

如果您希望將最終應用程式的程式碼庫與通用程式碼庫明確分離，請設定遠端整合。在這種情況下，共享程式碼將像一般的第三方相依性一樣整合到最終應用程式中。

## 本機整合

在本機設定中，有兩種主要的整合選項。您可以使用透過特殊指令碼進行的直接整合，這會使 Kotlin 組建變為 iOS 組建的一部分。如果您的 Kotlin Multiplatform 專案中有 Pod 相依性，請採用 CocoaPods 整合方式。

### 直接整合

您可以透過在 Xcode 專案中新增特殊指令碼，直接從 Kotlin Multiplatform 專案連接 iOS 架構。該指令碼會整合到專案組建設定的組建階段中。

如果您 **不** 在 Kotlin Multiplatform 專案中匯入 CocoaPods 相依性，則此整合方法適用於您。

如果您使用 [Kotlin Multiplatform IDE 外掛程式](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)，則預設會套用直接整合。

若要了解更多資訊，請參閱 [直接整合](multiplatform-direct-integration.md)。

### 搭配本機套件的 SwiftPM 整合

您的 KMP iOS 架構可以透過 [Swift Package Manager](https://docs.swift.org/swiftpm/documentation/packagemanagerdocs/) 相依於本機 Swift 套件。

如果符合以下情況，則此整合方法適用於您：

* 您使用了包含使用 Swift 套件的 iOS 專案的 Monorepo 設定。
* 您在 Kotlin Multiplatform 專案中沒有不可替代的 CocoaPods 相依性。

若要了解如何將本機 Swift 套件相依性新增至您的專案，請參閱 [將 Swift 套件新增為相依性](multiplatform-spm-import.md#importing-local-swift-packages)。

### 搭配本機 podspec 的 CocoaPods 整合

您可以透過 [CocoaPods](https://cocoapods.org/)（Swift 和 Objective-C 專案的流行相依管理器）連接來自 Kotlin Multiplatform 專案的 iOS 架構。

如果符合以下情況，則此整合方法適用於您：

* 您使用了包含使用 CocoaPods 的 iOS 專案的 Monorepo 設定。
* 您在 Kotlin Multiplatform 專案中匯入了 CocoaPods 相依性。

若要了解如何透過本機 CocoaPods 相依性設定工作流程，請參閱 [CocoaPods 總覽與設定](multiplatform-cocoapods-overview.md)。

## 遠端整合

對於遠端整合，您的專案可能會使用 Swift Package Manager (SwiftPM) 或 CocoaPods 相依管理器來連接來自 Kotlin Multiplatform 專案的 iOS 架構。

### 搭配 XCFrameworks 的 SwiftPM

您既可以從 Kotlin Multiplatform 專案匯出 XCFramework，也可以將遠端 Swift 套件作為相依性匯入至 KMP 專案中：
* 關於如何從您的 XCFramework 製作並分發 Swift 套件的說明，請參閱 [Swift 套件匯出設定](multiplatform-spm-export.md)。
* 若要了解如何將 Swift 套件新增為相依性，請參閱 [Swift PM 匯入文件](multiplatform-spm-import.md)。

### 搭配 XCFrameworks 的 CocoaPods 整合

您可以使用 Kotlin CocoaPods Gradle 外掛程式組建 XCFrameworks，然後透過 CocoaPods 將專案的共享部分與行動應用程式分開分發。

若要了解更多資訊，請參閱 [組建最終原生二進位檔案](multiplatform-build-native-binaries.md#build-xcframeworks)。