[//]: # (title: 從 kapt 遷移至 KSP)

<web-summary>了解如何將 Kotlin 專案中的註解處理器從 kapt 遷移至 KSP。</web-summary>

本指南說明如何將註解處理器從 [Kotlin 註解處理工具 (kapt)](kapt.md) 遷移至 [Kotlin 符號處理 (KSP)](ksp-overview.md)。您的專案可以充分利用 Kotlin 的語言特性並提升建置效能。

kapt 讓您可以在 Kotlin 中使用 Java 註解處理器。它會將 Kotlin 原始碼轉換為 Java「虛設常式」(stubs)，然後在這些虛設常式上執行註解處理器。然而，這個過程開銷龐大，會大幅增加建置時間，並且在轉換過程中遺失某些 Kotlin 特有的特性。

相較之下，KSP 是專為 Kotlin 設計的 kapt 替代方案。KSP 藉由直接分析 Kotlin 原始碼並公開諸如可 null 性等 Kotlin 特有資訊，進而減少建置時間。

## 開始之前 {id="before-you-start"}

檢查專案中的處理器是否支援 KSP。請參閱[支援的庫](ksp-overview.md#supported-libraries)清單，或查閱相關文件。

> KSP 與 kapt 可以並行執行，因此您可以分階段遷移專案，一次遷移一個程式庫或模組。
>
{style="note"}

## 將 KSP 外掛程式新增至您的專案 {id="add-the-ksp-plugin-to-your-project"}

將 KSP 外掛程式新增至專案層級 `build.gradle(.kts)` 檔案中的 `plugins {}` 區塊：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
// build.gradle.kts

plugins {
    id("com.google.devtools.ksp") version "%kspVersion%" apply false
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
// build.gradle

plugins {
    id 'com.google.devtools.ksp' version '%kspVersion%' apply false
}
```

</tab>
</tabs>

> 若要尋找最新版本的 KSP，請查看 GitHub 的 [Releases](https://github.com/google/ksp/releases)。
>
{style="tip"}

## 在模組中將 kapt 替換為 KSP {id="replace-kapt-with-ksp-in-your-modules"}

找到使用您要遷移的處理器的模組。在該模組的 `build.gradle(.kts)` 檔案中：

1. 將 KSP 外掛程式新增至 `plugins {}` 區塊：

    <tabs group="build-script">
    <tab title="Kotlin" group-key="kotlin">

    ```kotlin
    // build.gradle.kts

    plugins {
        id("com.google.devtools.ksp")
    }
    ```

    </tab>
    <tab title="Groovy" group-key="groovy">

    ```groovy
    // build.gradle

    plugins {
        id 'com.google.devtools.ksp'
    }
    ```

    </tab>
    </tabs>

2. 在 `dependencies {}` 區塊中，將 `kapt` 替換為 `ksp`：

    <tabs group="build-script">
    <tab title="Kotlin" group-key="kotlin">

    ```kotlin
    // build.gradle.kts

    dependencies {
        implementation("com.google.dagger:dagger:2.48")

        // 替換 kapt("com.google.dagger:dagger-compiler:2.48")
        ksp("com.google.dagger:dagger-compiler:2.48")
    }
    ```

    </tab>
    <tab title="Groovy" group-key="groovy">

    ```groovy
    // build.gradle

    dependencies {
        implementation 'com.google.dagger:dagger:2.48'

        // 替換 kapt 'com.google.dagger:dagger-compiler:2.48'
        ksp 'com.google.dagger:dagger-compiler:2.48'
    }
    ```

    </tab>
    </tabs>

對於大多數程式庫而言，這項替換已足夠。請查閱各程式庫的文件，以確認是否需要進行任何額外的變更。

## 移除 kapt 外掛程式 {id="remove-the-kapt-plugin"}

將所有處理器遷移至 KSP 後，您可以安全地從所有 `build.gradle(.kts)` 檔案中移除 kapt 外掛程式：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
// build.gradle.kts

plugins {
    // 移除 kapt 外掛程式宣告：
    id("org.jetbrains.kotlin.kapt")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
// build.gradle

plugins {
    // 移除 kapt 外掛程式宣告：
    id 'org.jetbrains.kotlin.kapt'
}
```

</tab>
</tabs>

刪除任何殘留的 kapt 配置（若有的話，例如 `kapt {}` 區塊）。

## 請參閱 {id="see-also"}

* 了解如何使用 KSP API [建立您自己的處理器](ksp-quickstart.md#create-your-own-processor)。
* 在 [Java 註解處理至 KSP 參考](ksp-reference.md)中尋找與 Java 註解處理 API 對應的 KSP 對等項。
* 在 [Kotlin 符號處理 API](ksp-overview.md) 概覽中了解 KSP 在編譯期間的運作方式。
* 探索 KSP 存儲庫中的[範例專案](https://github.com/google/ksp/tree/main/examples)。