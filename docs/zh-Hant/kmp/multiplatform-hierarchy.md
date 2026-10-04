[//]: # (title: 原始碼集階層)

Kotlin Multiplatform 專案支援階層式原始碼集結構。
這意味著你可以編排中繼原始碼集的階層結構，以便在部分（而非全部）[支援的目標](multiplatform-dsl-reference.md#targets)之間共用通用程式碼。使用中繼原始碼集有助於：

* 為特定目標提供專屬 API。例如，程式庫可以在中繼原始碼集中為 Kotlin/Native 目標新增原生專屬 API，而不會提供給 Kotlin/JVM 目標。
* 在特定目標中使用專屬 API。例如，你可以從 Kotlin Multiplatform 程式庫為構成中繼原始碼集的特定目標所提供的豐富 API 中獲益。
* 在專案中使用平台相依的庫。例如，你可以從中繼 iOS 原始碼集存取 iOS 專屬的相依性。

Kotlin 工具鏈可確保每個原始碼集只能存取該原始碼集編譯至的所有目標均適用的 API。這可以避免諸如使用 Windows 專屬 API 後再將其編譯至 macOS，進而導致連結錯誤或執行階段未定義行為的情況。

設定原始碼集階層的建議方式是使用[預設階層範本](#default-hierarchy-template)。
該範本涵蓋了最常見的使用案例。如果你有更進階的專案需求，也可以進行[手動配置](#manual-configuration)。
這是一種更底層的方法：彈性更高，但需要花費更多心力並具備更多知識。

## 預設階層範本 {id="default-hierarchy-template"}

Kotlin Gradle 外掛程式內建了預設的[階層範本](#see-the-full-hierarchy-template)。
它包含針對某些常見使用案例的預定義中繼原始碼集。
外掛程式會根據專案中指定的目標自動設定這些原始碼集。

請參考包含共用程式碼之專案模組中的以下 `build.gradle(.kts)` 檔案：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    android()
    iosArm64()
    iosSimulatorArm64()
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    android()
    iosArm64()
    iosSimulatorArm64()
}
```

</TabItem>
</Tabs>

當你在程式碼中宣告 `android`、`iosArm64` 與 `iosSimulatorArm64` 目標時，Kotlin Gradle 外掛程式會從範本中尋找合適的共用原始碼集並為你建立它們。產生的階層結構如下所示：

![使用預設階層範本的範例](default-hierarchy-example.svg)

彩色標示的原始碼集是在專案中實際建立並存在的，而預設範本中灰色的原始碼集則會被忽略。例如，Kotlin Gradle 外掛程式並未建立 `watchos` 原始碼集，因為專案中沒有 watchOS 目標。

如果你新增了 watchOS 目標（例如 `watchosArm64`），則會建立 `watchos` 原始碼集，並且 `apple`、`native` 和 `common` 原始碼集中的程式碼也會編譯至 `watchosArm64`。

Kotlin Gradle 外掛程式為預設階層範本中的所有原始碼集提供了型別安全且靜態的存取子，因此相較於[手動配置](#manual-configuration)，你可以直接參照它們，而不需要使用 `by getting` 或 `by creating` 建構。

如果你嘗試在共用模組的 `build.gradle(.kts)` 檔案中存取原始碼集，但尚未宣告對應的目標，將會看到一則警告：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    android()
    iosArm64()
    iosSimulatorArm64()

    sourceSets {
        iosMain.dependencies {
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
        }
        // Warning: accessing source set without declaring the target
        linuxX64Main { }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    android()
    iosArm64()
    iosSimulatorArm64()

    sourceSets {
        iosMain {
            dependencies {
                implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%'
            }
        }
        // Warning: accessing source set without declaring the target
        linuxX64Main { }
    }
}
```

</TabItem>
</Tabs>

> 在此範例中，`apple` 與 `native` 原始碼集僅編譯至 `iosArm64` 和 `iosSimulatorArm64` 目標。
> 儘管有名稱上的差異，但它們可以存取完整的 iOS API。
> 對於像 `native` 這樣的原始碼集來說，這可能不符合直覺，因為你可能會預期只有在所有原生目標上均可用的 API 才能在此原始碼集中存取。此行為在未來可能會有所變更。
>
{style="note"}

### 額外配置 {id="additional-configuration"}

你可能需要對預設階層範本進行調整。如果你先前曾透過呼叫 `dependsOn` [手動](#manual-configuration)引入中繼原始碼，這會取消預設階層範本的使用，並導致以下警告：

```none
The Default Kotlin Hierarchy Template was not applied to '<project-name>':
Explicit .dependsOn() edges were configured for the following source sets:
[<... names of the source sets with manually configured dependsOn-edges...>]

Consider removing dependsOn-calls or disabling the default template by adding
    'kotlin.mpp.applyDefaultHierarchyTemplate=false'
to your gradle.properties

Learn more about hierarchy templates: https://kotl.in/hierarchy-template
```

若要解決此問題，請透過以下其中一種方式來配置你的專案：

* [將手動配置替換為預設階層範本](#replacing-a-manual-configuration)
* [在預設階層範本中建立額外的原始碼集](#creating-additional-source-sets)
* [修改由預設階層範本建立的原始碼集](#modifying-source-sets)

#### 將手動配置替換為預設階層範本 {id="replacing-a-manual-configuration"}

**案例**：你所有的中繼原始碼集目前都已涵蓋在預設階層範本中。

**解決方案**：在共用模組的 `build.gradle(.kts)` 檔案中，移除所有手動的 `dependsOn()` 呼叫以及帶有 `by creating` 建構的原始碼集。若要查看所有預設原始碼集的清單，請參閱[完整階層範本](#see-the-full-hierarchy-template)。

#### 建立額外的原始碼集 {id="creating-additional-source-sets"}

**案例**：你想要新增預設階層範本尚未提供的原始碼集，例如在 macOS 與 JVM 目標之間的原始碼集。

**解決方案**：

1. 在共用模組的 `build.gradle(.kts)` 檔案中，透過明確呼叫 `applyDefaultHierarchyTemplate()` 重新套用範本。
2. 使用 `dependsOn()` [手動](#manual-configuration)配置額外的原始碼集：

    <Tabs group="build-script">
    <TabItem title="Kotlin" group-key="kotlin">

    ```kotlin
    kotlin {
        jvm()
        macosArm64()
        iosArm64()
        iosSimulatorArm64()
    
        // 再次套用預設階層。例如，它將建立 iosMain 原始碼集：
        applyDefaultHierarchyTemplate()
    
        sourceSets {
            // 建立額外的 jvmAndMacos 原始碼集：
            val jvmAndMacos by creating {
                dependsOn(commonMain.get())
            }
    
            macosArm64Main.get().dependsOn(jvmAndMacos)
            jvmMain.get().dependsOn(jvmAndMacos)
        }
    }
    ```

    </TabItem>
    <TabItem title="Groovy" group-key="groovy">

    ```groovy
    kotlin {
        jvm()
        macosArm64()
        iosArm64()
        iosSimulatorArm64()
    
        // 再次套用預設階層。例如，它將建立 iosMain 原始碼集：
        applyDefaultHierarchyTemplate()
    
        sourceSets {
            // 建立額外的 jvmAndMacos 原始碼集：
            jvmAndMacos {
                dependsOn(commonMain.get())
            }
            macosArm64Main {
                dependsOn(jvmAndMacos.get())
            }
            jvmMain {
                dependsOn(jvmAndMacos.get())
            }
        } 
    }
    ```

    </TabItem>
    </Tabs>

#### 修改原始碼集 {id="modifying-source-sets"}

**案例**：你已經擁有與範本所產生名稱完全相同的原始碼集，但它們在專案中是由不同的目標集合所共用。例如，`nativeMain` 原始碼集僅在桌面專屬目標之間共用：`linuxX64`、`mingwX64` 與 `macosArm64`。

**解決方案**：目前無法修改範本原始碼集之間預設的 `dependsOn` 關聯。此外，原始碼集（例如 `nativeMain`）的實作與語意在所有專案中保持一致也是很重要的。

不過，你仍然可以採取以下其中一種做法：

* 為你的需求尋找其他原始碼集，無論是在預設階層範本中還是在手動建立的原始碼集中。
* 透過在 `gradle.properties` 檔案中新增 `kotlin.mpp.applyDefaultHierarchyTemplate=false` 來完全停用範本，並手動配置所有原始碼集。

> 我們目前正在開發用於建立自訂階層範本的 API。這對於階層配置與預設範本有顯著差異的專案將非常有用。
>
> 該 API 尚未就緒，但如果你想嘗試，可以參考 `applyHierarchyTemplate {}` 區塊以及 `KotlinHierarchyTemplate.default` 的宣告作為範例。
> 請記住，此 API 仍在開發中，可能尚未經過完整測試，並且在後續版本中可能會有所變更。
>
{style="tip"}

#### 檢視完整階層範本 {initial-collapse-state="collapsed" collapsible="true" id="see-the-full-hierarchy-template"}

當你宣告專案編譯所針對的目標時，外掛程式會根據指定的目標從範本中挑選共用原始碼集，並在專案中建立它們。

![預設階層範本](full-template-hierarchy.svg)

> 此範例僅展示專案的正式程式碼部分，省略了 `Main` 後綴（例如，使用 `common` 而非 `commonMain`）。然而，`*Test` 原始碼的情況也完全相同。
>
{style="tip"}

## 手動配置 {id="manual-configuration"}

你可以在原始碼集結構中手動引入中繼原始碼。
它將保存多個目標的共用程式碼。

例如，若你想在原生 Linux、Windows 和 macOS 目標（`linuxX64`、`mingwX64` 和 `macosArm64`）之間共用程式碼，請依下列步驟操作：

1. 在共用模組的 `build.gradle(.kts)` 檔案中新增中繼原始碼集 `myDesktopMain`，該原始碼集將保存這些目標的共用邏輯。
2. 使用 `dependsOn` 關聯設定原始碼集階層。將 `commonMain` 與 `myDesktopMain` 連接，然後將 `myDesktopMain` 與各個目標原始碼集連接：

    <Tabs group="build-script">
    <TabItem title="Kotlin" group-key="kotlin">
    
    ```kotlin
    kotlin {
        linuxX64()
        mingwX64()
        macosArm64()
    
        sourceSets {
            val myDesktopMain by creating {
                dependsOn(commonMain.get())
            }
    
            linuxX64Main.get().dependsOn(myDesktopMain)
            mingwX64Main.get().dependsOn(myDesktopMain)
            macosArm64Main.get().dependsOn(myDesktopMain)
        }
    }
    ```
    
    </TabItem>
    <TabItem title="Groovy" group-key="groovy">
    
    ```groovy
    kotlin {
        linuxX64()
        mingwX64()
        macosArm64()
    
        sourceSets {
            myDesktopMain {
                dependsOn(commonMain.get())
            }
            linuxX64Main {
                dependsOn(myDesktopMain)
            }
            mingwX64Main {
                dependsOn(myDesktopMain)
            }
            macosArm64Main {
                dependsOn(myDesktopMain)
            }
        }
    }
    ```
    
    </TabItem>
    </Tabs>

產生的階層結構將如下所示：

![手動配置的階層結構](manual-hierarchical-structure.svg)

你可以針對以下目標組合建立共用原始碼集：

* JVM 或 Android + Web + Native
* JVM 或 Android + Native
* Web + Native
* JVM 或 Android + Web
* Native

Kotlin 目前不支援在以下組合中共用原始碼集：

* 多個 JVM 目標
* JVM + Android 目標
* 多個 JS 目標

如果你需要從共用原生原始碼集存取平台專屬的 API，IntelliJ IDEA 會協助你偵測可在共用原生程式碼中使用的通用宣告。
對於其他情況，請使用 Kotlin 的[預期宣告與實際宣告](multiplatform-expect-actual.md)機制。