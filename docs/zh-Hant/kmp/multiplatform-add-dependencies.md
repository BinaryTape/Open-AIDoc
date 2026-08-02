[//]: # (title: 新增多平台程式庫的相依性)

每個程式都需要一組程式庫才能成功運作。Kotlin 多平台專案可以依賴適用於所有目標平台的多平台程式庫、平台專屬程式庫，以及其他多平台專案。

若要新增程式庫的相依性，請更新包含共享程式碼之專案目錄中的 `build.gradle(.kts)` 檔案。在 [`dependencies {}`](multiplatform-dsl-reference.md#dependencies) 區塊中設定所需[類型](https://kotlinlang.org/docs/gradle-configure-project.html#dependency-types)（例如：`implementation`）的相依性：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        commonMain.dependencies {
            implementation("com.example:my-library:1.0") // 為所有原始碼集共享的程式庫
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets {
        commonMain {
            dependencies {
                implementation 'com.example:my-library:1.0'
            }
        }
    }
}
```

</TabItem>
</Tabs>

## Kotlin 程式庫的相依性

### 標準程式庫

每個原始碼集都會自動新增對標準程式庫 (`stdlib`) 的相依性。標準程式庫的版本與 `kotlin-multiplatform` 外掛程式的版本相同。

對於平台專屬的原始碼集，會使用相對應的平台專屬程式庫變體，而其餘部分則會新增通用標準程式庫。Kotlin Gradle 外掛程式會根據 Gradle 建置指令碼的 `compilerOptions.jvmTarget` [編譯器選項](https://kotlinlang.org/docs/gradle-compiler-options.html)選擇適當的 JVM 標準程式庫。

了解如何[變更預設行為](https://kotlinlang.org/docs/gradle-configure-project.html#dependency-on-the-standard-library)。

### 測試程式庫

對於多平台測試，可以使用 [`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) API。當您建立多平台專案時，可以透過在 `commonTest` 中使用單一相依性，將測試相依性新增至所有原始碼集：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        commonTest.dependencies {
            implementation(kotlin("test")) // 自動帶入所有平台相依性
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets {
        commonTest {
            dependencies {
                implementation kotlin("test") // 自動帶入所有平台相依性
            }
        }
    }
}
```

</TabItem>
</Tabs>

### kotlinx 程式庫

如果您使用多平台程式庫並需要[依賴共享程式碼](#library-shared-for-all-source-sets)，請僅在共享原始碼集中設定一次相依性。使用程式庫基礎構件名稱，例如 `kotlinx-coroutines-core`：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        commonMain.dependencies {
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets {
        commonMain {
            dependencies {
                implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%'
            }
        }
    }
}
```

</TabItem>
</Tabs>

如果您需要特定平台相依性的 kotlinx 程式庫[相依性](#library-used-in-specific-source-sets)，您仍然可以在對應的平台原始碼集中使用程式庫的基礎構件名稱：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        jvmMain.dependencies {
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets {
        jvmMain {
            dependencies {
                implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%'
            }
        }
    }
}
```

</TabItem>
</Tabs>

## Kotlin 多平台程式庫的相依性

您可以新增已採用 Kotlin 多平台技術之程式庫的相依性，例如 [SQLDelight](https://github.com/cashapp/sqldelight)。這些程式庫的作者通常會提供將其相依性新增至專案的指南。

> 在 [klibs.io](https://klibs.io/) 上尋找可用的 Kotlin 多平台程式庫。
>
{style="tip"}

### 為所有原始碼集共享的程式庫

如果您想在所有原始碼集中使用某個程式庫，可以僅將其新增至通用原始碼集。Kotlin 多平台 Gradle 外掛程式會自動將對應的部分新增至任何其他原始碼集。

> 您不能在通用原始碼集中設定平台專屬程式庫的相依性。
>
{style="warning"}

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        commonMain.dependencies {
            implementation("io.ktor:ktor-client-core:%ktorVersion%")
        }
        androidMain.dependencies {
            // 將自動新增對 ktor-client 平台部分的相依性
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets {
        commonMain {
            dependencies {
                implementation 'io.ktor:ktor-client-core:%ktorVersion%'
            }
        }
        androidMain {
            dependencies {
                // 將自動新增對 ktor-client 平台部分的相依性
            }
        }
    }
}
```

</TabItem>
</Tabs>

> 您也可以在頂層的 `dependencies {}` 區塊中配置通用程式庫。請參閱[在頂層配置相依性](multiplatform-dsl-reference.md#configure-dependencies-at-the-top-level)。
> 
{style="tip"}

### 在特定原始碼集中使用的程式庫

如果您只想在特定的原始碼集中使用多平台程式庫，可以僅將其新增至這些原始碼集。指定的程式庫宣告將僅在這些原始碼集中可用。

> 在這種情況下，請使用通用的程式庫名稱，而非平台專屬的名稱。例如下方範例中的 SQLDelight，請使用 `native-driver`，而非 `native-driver-iosx64`。請在程式庫文件中查找確切的名稱。
>
{style="note"}

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        commonMain.dependencies {
            // kotlinx.coroutines 將在所有原始碼集中可用
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
        }
        androidMain.dependencies {

        }
        iosMain.dependencies {
            // SQLDelight 將僅在 iOS 原始碼集中可用，而不在 Android 或通用原始碼集中可用
            implementation("com.squareup.sqldelight:native-driver:%sqlDelightVersion%")
        }
        wasmJsMain.dependencies {
            
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets {
        commonMain {
            dependencies {
                // kotlinx.coroutines 將在所有原始碼集中可用
                implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%'
            }
        }
        androidMain {
            dependencies {}
        }
        iosMain {
            dependencies {
                // SQLDelight 將僅在 iOS 原始碼集中可用，而不在 Android 或通用原始碼集中可用
                implementation 'com.squareup.sqldelight:native-driver:%sqlDelightVersion%'
            }
        }
        wasmJsMain {
            dependencies {}
        }
    }
}
```

</TabItem>
</Tabs>

## 對另一個多平台專案的相依性

您可以將一個多平台專案作為相依性連接到另一個專案。為此，只需在需要的原始碼集中新增專案相依性即可。如果您想在所有原始碼集中使用該相依性，請將其新增至通用原始碼集。在這種情況下，其他原始碼集將自動獲取其對應的版本。

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        commonMain.dependencies {
            implementation(project(":some-other-multiplatform-module"))
        }
        androidMain.dependencies {
            // 將自動新增 :some-other-multiplatform-module 的平台部分
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets {
        commonMain {
            dependencies {
                implementation project(':some-other-multiplatform-module')
            }
        }
        androidMain {
            dependencies {
                // 將自動新增 :some-other-multiplatform-module 的平台部分
            }
        }
    }
}
```

</TabItem>
</Tabs>

## 下一步？

查看關於在多平台專案中新增相依性的其他資源，並進一步了解：

* [新增 Android 相依性](multiplatform-android-dependencies.md)
* [新增 iOS 相依性](multiplatform-ios-dependencies.md)
* [在針對 iOS、Android、桌面和 Web 的 Compose 多平台專案中新增相依性](compose-multiplatform-modify-project.md#add-a-new-dependency)