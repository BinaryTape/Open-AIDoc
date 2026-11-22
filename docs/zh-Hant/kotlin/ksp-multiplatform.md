[//]: # (title: KSP 與 Kotlin Multiplatform)

<web-summary>了解如何在 Kotlin Multiplatform 專案中使用 KSP。</web-summary>

本指南說明如何在 Kotlin Multiplatform 專案中使用 Kotlin Symbol Processing (KSP)。
若要快速入門，請參閱[多平台範例專案](https://github.com/google/ksp/tree/main/examples/multiplatform)。
該專案在數個目標中使用了 KSP，且其處理器會產生專案所使用的 `Foo` 類別。

## 將 KSP 新增至多平台專案 {id="add-ksp-to-a-multiplatform-project"}

若要將 KSP 新增至用戶端模組（使用處理器的模組）：

1. 開啟該模組的 `build.gradle(.kts)` 檔案。
2. 將 KSP 外掛程式新增至 `plugins {}` 區塊：

    <tabs group="build-script">
    <tab title="Kotlin" group-key="kotlin">

    ```kotlin
    // build.gradle.kts

    plugins {
        kotlin("multiplatform") version "%kotlinVersion%"
        id("com.google.devtools.ksp") version "%kspVersion%"
    }
    ```

    </tab>
    <tab title="Groovy" group-key="groovy">

    ```groovy
    // build.gradle

    plugins {
        id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
        id 'com.google.devtools.ksp' version '%kspVersion%'
    }
    ```

    </tab>
    </tabs>

3. 為每個需要符號處理的目標新增處理器相依性：

    ```kotlin
    dependencies {
        add("ksp<Target>", <processor>)
    }
    ```

    * `<Target>` 是多平台專案中所使用的目標之一的名稱，首字母大寫。例如，對於 `iosArm64` 目標，請使用 `kspIosArm64` 組態。

      > 若需目標的完整清單，請參閱 [Multiplatform Gradle DSL 參考](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#targets) 與 [Kotlin/Native 支援的目標與主機](native-target-support.md)。
      >
      {style="tip"}

    * `<processor>` 為處理器相依性。它可以是：

      * 包含符號處理器邏輯的專案模組：

        ```kotlin
        add("kspJvm", project(":local-processor"))
        ```

      * 外部處理器，例如 Room：

        ```kotlin
        add("kspJvm", "androidx.room3:room3-compiler:3.0.3")
        ```

<anchor name="avoid-the-ksp-configuration-on-ksp-1-0-1"/>

> 自 KSP 2.3.12 起，通配的 `ksp(...)` 組態會在多平台專案中導致組建錯誤。較早版本會將其回報為已棄用。請明確設定每個目標，以避免在不需要的地方執行處理器。
>
{style="warning"}

### 在單一目標中使用多個處理器 {id="use-multiple-processors-in-a-single-target"}

您可以將多個處理器新增至同一個目標：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
dependencies {
    add("kspAndroid", project(":test-processor"))
    add("kspAndroid", "androidx.room3:room3-compiler:3.0.3")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
dependencies {
    add('kspAndroid', project(':test-processor'))
    add('kspAndroid', 'androidx.room3:room3-compiler:3.0.3')
}
```

</tab>
</tabs>

### 在多個目標中使用相同的處理器 {id="use-the-same-processor-in-multiple-targets"}

您可以將相同的處理器新增至多個目標：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
dependencies {
    add("kspIosX64", project(":test-processor"))
    add("kspIosArm64", project(":test-processor"))
    add("kspIosSimulatorArm64", project(":test-processor"))
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
dependencies {
    add('kspIosX64', project(':test-processor'))
    add('kspIosArm64', project(':test-processor'))
    add('kspIosSimulatorArm64', project(':test-processor'))
}
```

</tab>
</tabs>

如果您有多個 iOS 目標，可以使用迴圈來避免重複程式碼：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
dependencies {
    kotlin.targets.filter { it.name.startsWith("ios") }.forEach { target ->
        add(
            "ksp${target.name.replaceFirstChar { it.uppercaseChar() }}",
            project(":test-processor")
        )
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
dependencies {
    kotlin.targets.findAll { it.name.startsWith('ios') }.each { target ->
        add("ksp${target.name.capitalize()}", project(':test-processor'))
    }
}
```

</tab>
</tabs>

### 為測試編譯設定 KSP {id="configure-ksp-for-test-compilations"}

若要在測試編譯期間執行 KSP，請將處理器新增至對應的測試組態中：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
dependencies {
    add("kspJvmTest", project(":test-processor"))
    add("kspJsTest", project(":test-processor"))
    add("kspIosX64Test", project(":test-processor"))
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
dependencies {
    add('kspJvmTest', project(':test-processor'))
    add('kspJsTest', project(':test-processor'))
    add('kspIosX64Test', project(':test-processor'))
}
```

</tab>
</tabs>

對於 Android 主機與裝置測試，KSP 會根據對應的原始碼集名稱來推導組態名稱：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
dependencies {
    add("kspAndroidHostTest", project(":test-processor"))
    add("kspAndroidDeviceTest", project(":test-processor"))
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
dependencies {
    add('kspAndroidHostTest', project(':test-processor'))
    add('kspAndroidDeviceTest', project(':test-processor'))
}
```

</tab>
</tabs>

## 尋找 KSP 組態名稱 {id="find-ksp-configuration-names"}

KSP 會從 Kotlin Multiplatform 原始碼集推導出組態名稱。若要檢視模組完整的 KSP 組態清單，請執行：

```bash
./gradlew :<your-module-name>:dependencies | grep ksp
```

尋找與您的目標原始碼集相對應的組態名稱。

## 編譯與處理 {id="compilation-and-processing"}

在多平台專案中，Kotlin 會為每個目標建立獨立的[編譯](https://kotlinlang.org/docs/multiplatform/multiplatform-advanced-project-structure.html#compilations)（例如 `main` 和 `test`）。對於每個設定了一或多個處理器的 Kotlin 編譯任務，KSP 都會建立對應的符號處理任務。

該[範例專案](https://github.com/google/ksp/tree/main/examples/multiplatform)定義了六個目標。每個目標都有 `main` 和 `test` 編譯，進而產生以下編譯與符號處理任務：

* **JVM**：`jvmMain` 和 `jvmTest`
* **JS**：`jsMain` 和 `jsTest`
* **LinuxX64**：`linuxX64Main` 和 `linuxX64Test`
* **AndroidNativeX64**：`androidNativeX64Main` 和 `androidNativeX64Test`
* **AndroidNativeArm64**：`androidNativeArm64Main` 和 `androidNativeArm64Test`
* **MingwX64**：`mingwX64Main` 和 `mingwX64Test`

在範例的 `workload/build.gradle.kts` 檔案中，為以下組態宣告了 KSP 相依性：

* `kspJvm` 和 `kspJvmTest`
* `kspJs` 和 `kspJsTest`
* `kspAndroidNativeX64` 和 `kspAndroidNativeX64Test`
* `kspAndroidNativeArm64` 和 `kspAndroidNativeArm64Test`
* `kspLinuxX64`
* `kspMingwX64`

KSP 會為每個宣告了 KSP 相依性的組態建立一個符號處理任務。在此範例中，該專案至少有 12 個 Kotlin 編譯任務與 10 個符號處理任務。其餘編譯沒有對應的 KSP 任務，因為未對它們設定 KSP。

## 相關參考 {id="see-also"}

* KSP 存儲庫中的[多平台範例專案](https://github.com/google/ksp/tree/main/examples/multiplatform)。
* [從命令列執行 KSP](ksp-command-line.md#main-class) 時各平台的入口點清單。