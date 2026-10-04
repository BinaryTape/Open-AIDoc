[//]: # (title: 新增多平台程式庫的相依性)

每個程式都需要一組程式庫才能成功運行。
Kotlin Multiplatform 專案可以相依於支援多個目標平台的跨平台程式庫、平台專用程式庫以及其他多平台專案。

如果你有開發 Android 應用程式的經驗，新增多平台相依性類似於在一般的 Android 專案中新增 Gradle 相依性。
主要差別在於你必須將相依性新增至特定的原始碼集，而不是整個模組。

本頁介紹了在多平台專案中管理相依性的整體方法。
有關某些平台的具體細節，請參閱[新增 Android 相依性](multiplatform-android-dependencies.md)與[新增 iOS 相依性](multiplatform-ios-dependencies.md)。

## 相依性類型 {id="dependency-types"}

在 Kotlin Multiplatform 專案中，你可以使用兩種類型的相依性：

* _多平台相依性（Multiplatform dependencies）_。這些是支援多個目標且可用於共用原始碼集的多平台程式庫。

  許多現代 Android 程式庫都已經支援多平台，例如 [Koin](https://insert-koin.io/)、[Coil](https://coil-kt.github.io/coil/) 和 [SQLDelight](https://sqldelight.github.io/sqldelight/latest/)。
  
  可以在 [klibs.io](https://klibs.io/) 上尋找更多多平台程式庫，這是一個已發佈的 Kotlin Multiplatform 程式庫目錄。

* _原生相依性（Native dependencies）_。這些是來自相應生態系統的平台專用程式庫。
  在原生專案中，你通常透過平台專屬工具來管理這些程式庫，例如適用於 Android 的 Gradle 和適用於 iOS 的 Swift Package Manager。

  當你處理多平台專案模組時，通常仍需要原生相依性來使用平台 API，例如安全儲存、系統呼叫等。
  在建置指令碼中，你在原生原始碼集（例如 `androidMain` 和 `iosMain`）的配置中指定原生相依性。

對於這兩種類型的相依性，你都可以使用本機和外部儲存庫。

## Gradle version catalogs {id="gradle-version-catalogs"}

使用 Gradle 時，我們建議使用 [version catalogs](https://docs.gradle.org/current/userguide/version_catalogs.html) 來管理相依性。

透過 version catalogs，你可以在目錄中定義構件名稱和版本，然後在建置指令碼檔案中參照此定義。

例如，這是一個基本的目錄檔案：

```toml
# libs.versions.toml，預設的目錄檔案
[versions]
my-library = "1.0"

[libraries]
my-library = {module = "com.example:my-library", version.ref = "my-library"}
```

這是使用該目錄新增相依性的範例：

```kotlin
// build.gradle.kts
dependencies {
    // 'libs' 是目錄檔案名稱的第一部分
    // 'my.library' 是沒有命名空間的構件名稱，
    // 且以點號代替連字號
    implementation(libs.my.library)
}
```

## 對核心 Kotlin 程式庫的相依性 {id="dependencies-on-core-kotlin-libraries"}

### 標準程式庫 {id="standard-library"}

Kotlin Multiplatform 專案中的每個原始碼集都會自動相依於 Kotlin 標準程式庫 (`kotlin-stdlib`)。
標準程式庫的版本與所套用的 [Kotlin Multiplatform Gradle 外掛程式](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#id-and-version)版本相同。

對於平台專用原始碼集，Gradle 會自動使用該程式庫對應的平台專用變體，而其餘原始碼集則新增共用標準程式庫。
對於 JVM 目標，Kotlin Gradle 外掛程式會根據 Gradle 建置指令碼中的 `compilerOptions.jvmTarget` [編譯器選項](https://kotlinlang.org/docs/gradle-compiler-options.html)選取適當的 JVM 標準程式庫。

了解如何[變更預設的 `kotlin-stdlib` 相依性解析](https://kotlinlang.org/docs/gradle-configure-project.html#dependency-on-the-standard-library)。

### 測試程式庫 {id="testing-libraries"}

對於多平台測試，可以使用 [`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) API。
由於它是一個多平台程式庫，你只需為 `commonTest` 原始碼集指定單一相依性，即可將測試相依性新增至所有原始碼集：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        // 讓 kotlin.test 類別在所有測試原始碼集中可用
        commonTest.dependencies {
            implementation(kotlin("test")) 
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
        // 讓 kotlin.test 類別在所有測試原始碼集中可用
        commonTest {
            dependencies {
                implementation kotlin("test")
            }
        }
    }
}
```

</TabItem>
</Tabs>

### `kotlinx` 程式庫 {id="kotlinx-libraries"}

kotlinx 程式庫是由 JetBrains 的 Kotlin 核心團隊維護的多平台程式庫（主要範例包括 [kotlinx.serialization](https://github.com/kotlin/kotlinx.serialization) 和 [kotlinx.coroutines](https://github.com/Kotlin/kotlinx.coroutines)）。

與任何其他多平台程式庫一樣，若要新增相依性，只需在對應的原始碼集中參照程式庫構件即可。

> `kotlinx` 程式庫有時需要更複雜的設定，例如針對 Web 目標。
> 請參閱該程式庫的文件以獲取完整指引。
{style="note"}

## 對 Kotlin Multiplatform 程式庫的相依性 {id="dependencies-on-kotlin-multiplatform-libraries"}

你可以新增對採用 Kotlin Multiplatform 的程式庫的相依性，例如 [SQLDelight](https://github.com/cashapp/sqldelight)。
這些程式庫的作者通常會提供將其相依性新增至專案的指南。

<a as="button" href="https://klibs.io/" mode="classic" icon="arrow-right" icon-position="right">在 klibs.io 上尋找 Kotlin Multiplatform 程式庫</a>

### Gradle version catalog 範例 {id="sample-gradle-version-catalog"}

使用 Gradle 時，建議使用 [version catalogs](#gradle-version-catalogs)。
以下是定義了下述範例中所使用之所有程式庫的 version catalog：

```toml
[versions]
ktor = "%ktorVersion%"
kotlinx-coroutines = "%coroutinesVersion%"
sqlDelight = "%sqlDelightVersion%"

[libraries]
ktor-clientCore = { module = "io.ktor:ktor-client-core", version.ref = "%ktorVersion%" }
kotlinx-coroutinesCore = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-core", version.ref = "%coroutinesVersion%" }
sqldelight-nativeDriver = { module = "com.squareup.sqldelight:native-driver", version.ref = "%sqlDelightVersion%" }
```

### 所有原始碼集共用的程式庫 {id="library-shared-for-all-source-sets"}

如果你希望從所有原始碼集存取該程式庫，或使用它來編寫共用程式碼，請僅將其新增至共用原始碼集。
Kotlin Multiplatform Gradle 外掛程式會自動為其他已宣告的原始碼集解析對應的平台專用構件。

> 共用原始碼集不能相依於平台專用構件：共用程式碼需要針對每個已宣告的目標進行編譯。
>
{style="warning"}

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        commonMain.dependencies {
            implementation(libs.ktor.clientCore)
        }
        androidMain.dependencies {
            // 對 ktor-client 平台專屬部分的相依性會在建置時進行解析
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
                implementation(libs.ktor.clientCore)
            }
        }
        androidMain {
            dependencies {
              // 對 ktor-client 平台專屬部分的相依性會在建置時進行解析
            }
        }
    }
}
```

</TabItem>
</Tabs>

> 你也可以在頂層的 `dependencies {}` 區塊中設定共用程式庫。
> 請參閱[在頂層設定相依性](multiplatform-dsl-reference.md#configure-dependencies-at-the-top-level)。
> 
{style="tip"}

### 在特定原始碼集中使用的程式庫 {id="libraries-to-be-used-in-specific-source-sets"}

如果你只想在特定原始碼集中使用某個多平台程式庫，可以只將其新增至這些原始碼集中。
這樣該程式庫的宣告就只會在這些原始碼集中可用。

在這種情況下，請使用共用程式庫名稱，而不是平台專用名稱：Kotlin Multiplatform Gradle 外掛程式會自動解析此類參照。
確切的名稱通常會在該程式庫的文件中說明。

以下範例針對平台專屬的 SQLDelight 使用 `native-driver` 而非 `native-driver-iosx64`：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        commonMain.dependencies {
            // kotlinx.coroutines 在所有原始碼集中可用
            implementation(libs.kotlinx.coroutinesCore)
        }
        androidMain.dependencies {
            // 放置 Android 專用相依性的位置
        }
        iosMain.dependencies {
            // SQLDelight 在 iOS 原始碼集中可用，
            // 但在 Android 或共用原始碼集中不可用
            implementation(libs.sqldelight.nativeDriver)
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
                // kotlinx.coroutines 在所有原始碼集中可用
                implementation(libs.kotlinx.coroutinesCore)
            }
        }
        androidMain {
            dependencies {
                // 放置 Android 專用相依性的位置
            }
        }
        iosMain {
            dependencies {
                // SQLDelight 在 iOS 原始碼集中可用，
                // 但在 Android 或共用原始碼集中不可用
                implementation(sqldelight.nativeDriver)
            }
        }
    }
}
```

</TabItem>
</Tabs>

## 對另一個多平台專案的相依性 {id="dependency-on-another-multiplatform-project"}

一個多平台專案可以相依於另一個多平台專案。
若要進行此設定，請將 Gradle 專案相依性新增至需要它的原始碼集。
如果你想在所有原始碼集中使用專案相依性，請將其新增至共用原始碼集。
在這種情況下，編譯器會自動為其他原始碼集提供該專案的平台專用構件。

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
            // :some-other-multiplatform-module 的平台專用宣告
            // 將會自動解析
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
                // :some-other-multiplatform-module 的平台專用宣告
                // 將會自動解析
            }
        }
    }
}
```

</TabItem>
</Tabs>

## 後續步驟 {id="what-s-next"}

查看有關在多平台專案中新增相依性的其他資源，進一步了解：

* [新增 Android 相依性](multiplatform-android-dependencies.md)
* [新增 iOS 相依性](multiplatform-ios-dependencies.md)
* 在範例專案中使用 [Android 和 iOS 程式庫](multiplatform-samples.md)。

## 取得協助 {id="get-help"}

* **Kotlin Slack**。取得[邀請](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)並加入 [#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU) 頻道。
* **Kotlin 問題追蹤器**。[回報新問題](https://youtrack.jetbrains.com/newIssue?project=KT)。