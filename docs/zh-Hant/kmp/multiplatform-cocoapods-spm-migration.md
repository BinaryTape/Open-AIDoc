[//]: # (title: 將 Kotlin Multiplatform 專案從 CocoaPods 切換至 SwiftPM 相依性)
<primary-label ref="Experimental"/>

<tldr>

* 要從 CocoaPods Gradle 外掛程式切換到 SwiftPM，您需要先重新配置您的 Xcode 專案。
* 請查看這些範例專案，它們在 `main` 分支中使用 CocoaPods，而在 `spm-import` 分支中使用 SwiftPM：
  * [Firebase 範例](https://github.com/Kotlin/kmp-with-cocoapods-multitarget-xcode-sample)
  * [Compose Multiplatform 範例](https://github.com/Kotlin/kmp-with-cocoapods-compose-sample/)

</tldr>

如果您有一個包含 CocoaPods 相依性的 KMP 模組，並且想要使用 [SwiftPM 匯入](multiplatform-spm-import.md)切換到 Swift 套件，請按照以下步驟操作：

1. [更新您的建置指令碼以包含 SwiftPM 相依性及對應的配置](#update-your-build-script)
2. [在 SwiftPM 匯入工具的幫助下，重新配置您的 Xcode 專案以使用直接整合](#reconfigure-your-xcode-project)
3. [完全或部分停用 CocoaPods 整合，具體取決於您的專案結構](#remove-the-cocoapods-kmp-integration)

> 您可以使用我們[準備好的技能](https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-cocoapods-spm-migration)，將 CocoaPods 到 SwiftPM 的遷移工作移交給您選擇的 AI 代理。
> 請記住，AI 處理結果並非完全可預測。
>
{style="note"}

## 更新您的建置指令碼

要更新您的建置，請按照 SwiftPM 匯入頁面上的說明操作：

1. [將 Kotlin Multiplatform Gradle 外掛程式版本更改為 **%kotlinEapVersion%**](multiplatform-spm-import.md#set-the-kotlin-multiplatform-gradle-plugin-version)
2. [指定必要的 SwiftPM 相依性，而無需停用 CocoaPods 外掛程式或移除 CocoaPods 相依性](multiplatform-spm-import.md#add-and-use-swiftpm-dependencies)

例如，如果您正在使用 `FirebaseAnalytics` pod：

1. 確保您已[設定 Kotlin Multiplatform Gradle 外掛程式](multiplatform-spm-import.md#set-the-kotlin-multiplatform-gradle-plugin-version)以使用版本 **%kotlinEapVersion%**。
2. 將 `FirebaseAnalytics` Swift 套件添加到 `swiftPMDependencies {}` 區塊中：

   ```kotlin
   // projectDir/sharedLogic/build.gradle.kts
   kotlin {
       swiftPMDependencies {
          swiftPackage(
              url = url("https://github.com/firebase/firebase-ios-sdk.git"),
              version = from("12.5.0"),
              products = listOf(product("FirebaseAnalytics")),
          )
       }

       cocoapods {
           // ...

           pod("FirebaseAnalytics") {
           version = "12.5.0"
           // ...
           }
       }
   }
   ```

3. 執行 **Sync Project with Gradle Files** 操作以從 Swift 套件匯入 API。
4. 更新您的程式碼以使用從 Swift 套件匯入的 API。
   如果 pod 和對應的 Swift 套件提供完全相同的 API，您應該只需要更新 Kotlin 匯入指示詞，例如：

    <compare type="top-bottom">
        <code-block lang="kotlin" code="            import cocoapods.FirebaseAnalytics.FIRAnalytics"></code-block>
        <code-block lang="kotlin" code="            import swiftPMImport.org.example.package.FIRAnalytics"></code-block>
    </compare>

5. 如果您在建置指令碼中使用了 `cocoapods.framework {}` 區塊，請將該配置移至 `binaries.framework {}` 區塊，例如：

   <compare type="left-right">
   <code-block lang="kotlin" code="   kotlin {&#10;       iosArm64()&#10;       iosSimulatorArm64()&#10;       iosX64()&#10;&#10;       cocoapods {&#10;           framework {&#10;               baseName = &quot;Shared&quot;&#10;               isStatic = true&#10;           }&#10;       }&#10;   }"></code-block>
   <code-block lang="kotlin" code="   kotlin {&#10;       listOf(&#10;           iosArm64(),&#10;           iosSimulatorArm64(),&#10;           iosX64(),&#10;       ).forEach { iosTarget -&gt;&#10;           iosTarget.binaries.framework {&#10;               baseName = &quot;Shared&quot;&#10;               isStatic = true&#10;           }&#10;       }&#10;   }"></code-block>
   </compare>

## 重新配置您的 Xcode 專案

如果您正在使用 CocoaPods Gradle 外掛程式 (`kotlin("native.cocoapods")`)，在切換到 SwiftPM 之前，您需要重新配置您的 Xcode 專案以使用[直接整合](multiplatform-direct-integration.md)。SwiftPM 匯入工具可以產生 Shell 指令，對您的 `.xcodeproj` 檔案進行必要的更改。

1. 在 Xcode 中開啟專案（在 IntelliJ IDEA 中，選擇 **File** | **Open Project in Xcode**）。
2. 在 Xcode 中建置專案（**Product** | **Build**）。建置應該會失敗，但建置錯誤中包含必要的指令。
3. 要在 Xcode 中查看建置錯誤，請選擇 **View** | **Navigators** | **Report**，然後在頂部的篩選器中選擇 **Errors Only**。
   該指令如下所示，並包含指向您專案的正確路徑：

   ```text
   XCODEPROJ_PATH='/path/to/project/iosApp/iosApp.xcodeproj' GRADLE_PROJECT_PATH=':kotlin-library' '/path/to/project/gradlew' -p '/path/to/project' ':kotlin-library:integrateEmbedAndSign' ':kotlin-library:integrateLinkagePackage'
   ```

   > 您可以在不開啟 Xcode 的情況下，透過從終端機建置專案來產生相同的指令。
   > 在 `/path/to/project/iosApp` 目錄中執行以下指令：
   > 
   > ```shell
   > xcodebuild -scheme "$(echo -n *.xcworkspace | python3 -c 'import sys, json; from subprocess import check_output; print(list(set(json.loads(check_output(["xcodebuild", "-workspace", sys.stdin.readline(), "-list", "-json"]))["workspace"]["schemes"]) - set(json.loads(check_output(["xcodebuild", "-project", "Pods/Pods.xcodeproj", "-list", "-json"]))["project"]["schemes"]))[0])')" -workspace *.xcworkspace -destination 'generic/platform=iOS Simulator' ARCHS=arm64 | grep -A5 'What went wrong'
   > ```
   {style="note"}

    最後的 `grep` 呼叫會找到特定的錯誤訊息以及您需要執行的指令。

4. 在 `/path/to/project/iosApp` 目錄中，在終端機執行產生的指令。
   它會修改 `iosApp` 專案的 `.xcodeproj` 檔案，以在建置期間觸發 `embedAndSignAppleFrameworkForXcode` 任務，從而在您的 iOS 建置中插入一個 Kotlin Multiplatform 編譯階段。
5. 在 IntelliJ IDEA 中，選擇 **Tools** | **Swift Package Manager** | **Resolve Dependencies** 以解析您在 `build.gradle.kts` 檔案中宣告的 SwiftPM 相依性。

現在 iOS 應用程式已使用 SwiftPM 相依性。您可以停用 CocoaPods 外掛程式並解除整合 pod。

## 移除 CocoaPods KMP 整合

如果您已將所有 CocoaPods 相依性替換為 Swift 套件，現在可以透過在 `/path/to/project/iosApp` 目錄中執行以下指令來解除整合 pod：

```shell
pod deintegrate
```

如果您想繼續對與 SwiftPM 相依性不重疊的相依性使用 CocoaPods，請編輯您的 `Podfile` 以僅移除提及 KMP 模組的那一行，然後執行 `pod install`。例如：

```shell
target 'iosApp' do
    # 這裡 'sharedLogic' 是共用程式碼模組的名稱。
    # 移除此行並再次執行 'pod install'。
    pod 'sharedLogic', :path => '../sharedLogic'
    ...
end
```

最後，從您的 Gradle 組建組態中移除對 CocoaPods 的提及：

1. 從共用程式碼模組的 `build.gradle.kts` 檔案中移除整個 `cocoapods {}` 區塊，因為現在所有相依性都由 SwiftPM 匯入工具管理。
2. If your project does not rely on CocoaPods anymore, remove references to the CocoaPods Gradle plugin from the `plugins {}` block in both the root `build.gradle.kts` file and `build.gradle.kts` in the shared module.