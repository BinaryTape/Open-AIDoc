[//]: # (title: 添加多平台库的依赖项)

每个程序都需要一组库才能正常运行。
Kotlin 多平台项目可以依赖支持多个目标平台的跨平台库、平台特定库以及其他多平台项目。

如果你具备开发 Android 应用的经验，添加多平台依赖项与在常规 Android 项目中添加 Gradle 依赖项非常相似。
主要区别在于，你需要将依赖项添加到特定的源集（source set），而不是整个模块中。

本页介绍了在多平台项目中管理依赖项的通用方法。
关于特定平台的详细信息，请参阅[添加 Android 依赖项](multiplatform-android-dependencies.md)和[添加 iOS 依赖项](multiplatform-ios-dependencies.md)。

## 依赖项类型 {id="dependency-types"}

在 Kotlin 多平台项目中，你可以使用两种类型的依赖项：

* _多平台依赖项_。这些是支持多个目标并可在通用源集中使用的多平台库。

  许多现代 Android 库已提供多平台支持，例如 [Koin](https://insert-koin.io/)、[Coil](https://coil-kt.github.io/coil/) 和 [SQLDelight](https://sqldelight.github.io/sqldelight/latest/)。
  
  你可以在 [klibs.io](https://klibs.io/) 上查找更多多平台库，这是一个已发布的 Kotlin 多平台库目录。

* _原生依赖项_。这些是来自相应生态系统的平台特定库。
  在原生项目中，你通常通过特定于平台的工具来管理这些库，例如用于 Android 的 Gradle 和用于 iOS 的 Swift Package Manager。

  在处理多平台项目模块时，通常仍需要原生依赖项来使用平台 API，例如安全存储、系统调用等。
  在构建脚本中，你可以在原生源集（例如 `androidMain` 和 `iosMain`）的配置中指定原生依赖项。

对于这两种依赖项类型，你都可以使用本地和外部仓库。

## Gradle 版本目录 {id="gradle-version-catalogs"}

使用 Gradle 时，建议使用[版本目录 (version catalogs)](https://docs.gradle.org/current/userguide/version_catalogs.html)来管理依赖项。

通过版本目录，你可以在目录中定义构件名称与版本，然后在构建脚本文件中引用该定义。

例如，这是一个基本的目录文件：

```toml
# libs.versions.toml，默认目录文件
[versions]
my-library = "1.0"

[libraries]
my-library = {module = "com.example:my-library", version.ref = "my-library"}
```

以下是使用该目录添加依赖项的示例：

```kotlin
// build.gradle.kts
dependencies {
    // 'libs' 是目录文件名的第一部分
    // 'my.library' 是不包含命名空间的构件名称，
    // 并且用点代替了短横线
    implementation(libs.my.library)
}
```

## 对 Kotlin 核心库的依赖 {id="dependencies-on-core-kotlin-libraries"}

### 标准库 {id="standard-library"}

Kotlin 多平台项目中的每个源集都会自动依赖 Kotlin 标准库 (`kotlin-stdlib`)。
标准库的版本与所应用的 [Kotlin Multiplatform Gradle 插件](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#id-and-version)版本相同。

对于平台特定的源集，Gradle 会自动使用该库对应的平台特定变体，而通用的标准库则会添加到其余源集中。
对于 JVM 目标，Kotlin Gradle 插件会根据 Gradle 构建脚本中的 `compilerOptions.jvmTarget` [编译器选项](https://kotlinlang.org/docs/gradle-compiler-options.html)选择合适的 JVM 标准库。

了解如何[更改默认的 `kotlin-stdlib` 依赖解析](https://kotlinlang.org/docs/gradle-configure-project.html#dependency-on-the-standard-library)。

### 测试库 {id="testing-libraries"}

对于多平台测试，可以使用 [`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) API。
由于它是一个多平台库，你可以通过仅为 `commonTest` 源集指定单个依赖项，来为所有测试源集添加测试依赖：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        // 使 kotlin.test 类在所有测试源集中可用
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
        // 使 kotlin.test 类在所有测试源集中可用
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

### `kotlinx` 库 {id="kotlinx-libraries"}

kotlinx 库是由 JetBrains 的 Kotlin 核心团队维护的多平台库（主要示例包括 [kotlinx.serialization](https://github.com/kotlin/kotlinx.serialization) 和 [kotlinx.coroutines](https://github.com/Kotlin/kotlinx.coroutines)）。

与任何其他多平台库一样，若要添加依赖项，只需在对应的源集中引用库构件即可。

> `kotlinx` 库有时需要更复杂的配置，例如针对 Web 目标。
> 请参阅相应库的文档以获取完整的说明。
{style="note"}

## 对 Kotlin 多平台库的依赖 {id="dependencies-on-kotlin-multiplatform-libraries"}

你可以添加对已支持 Kotlin 多平台的库的依赖，例如 [SQLDelight](https://github.com/cashapp/sqldelight)。
此类库的作者通常会提供将其依赖项添加到项目中的指南。

<a as="button" href="https://klibs.io/" mode="classic" icon="arrow-right" icon-position="right">在 klibs.io 上寻找 Kotlin 多平台库</a>

### Gradle 版本目录示例 {id="sample-gradle-version-catalog"}

使用 Gradle 时，建议使用[版本目录](#gradle-版本目录)。
以下版本目录定义了下文示例中使用的所有库：

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

### 适用于所有源集的共享库 {id="library-shared-for-all-source-sets"}

如果你希望从所有源集访问该库，或者使用它编写共享代码，只需将其添加到通用源集（common source set）即可。
Kotlin Multiplatform Gradle 插件会自动为其他已声明的源集解析相应的平台特定构件。

> 通用源集不能依赖于平台特定的构件：
> 通用代码需要能够针对每个已声明的目标进行编译。
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
            // 对 ktor-client 平台特定部分的依赖项
            // 将在构建时解析
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
              // 对 ktor-client 平台特定部分的依赖项
              // 将在构建时解析
            }
        }
    }
}
```

</TabItem>
</Tabs>

> 你还可以在顶层 `dependencies {}` 块中配置通用库。
> 请参阅[在顶层配置依赖项](multiplatform-dsl-reference.md#configure-dependencies-at-the-top-level)。
> 
{style="tip"}

### 在特定源集中使用的库 {id="libraries-to-be-used-in-specific-source-sets"}

如果你只想在特定源集中使用某个多平台库，可以仅将其添加到这些源集中。
这样，该库的声明就仅在这些源集中可用。

在这种情况下，请使用通用库名称，而不是平台特定的名称：
Kotlin Multiplatform Gradle 插件会自动解析这些引用。
库的文档通常会说明具体名称。

以下示例展示了针对平台特定的 SQLDelight 使用 `native-driver` 而非 `native-driver-iosx64`：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        commonMain.dependencies {
            // kotlinx.coroutines 在所有源集中可用
            implementation(libs.kotlinx.coroutinesCore)
        }
        androidMain.dependencies {
            // 放置 Android 特定依赖项的位置
        }
        iosMain.dependencies {
            // SQLDelight 在 iOS 源集中可用，
            // 但在 Android 或通用源集中不可用
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
                // kotlinx.coroutines 在所有源集中可用
                implementation(libs.kotlinx.coroutinesCore)
            }
        }
        androidMain {
            dependencies {
                // 放置 Android 特定依赖项的位置
            }
        }
        iosMain {
            dependencies {
                // SQLDelight 在 iOS 源集中可用，
                // 但在 Android 或通用源集中不可用
                implementation(sqldelight.nativeDriver)
            }
        }
    }
}
```

</TabItem>
</Tabs>

## 对另一个多平台项目的依赖 {id="dependency-on-another-multiplatform-project"}

一个多平台项目可以依赖另一个多平台项目。
若要进行此设置，请将 Gradle 项目依赖项添加到需要它的源集中。
如果你希望在所有源集中使用该项目依赖项，请将其添加到通用源集中。
在这种情况下，编译器会自动向其他源集提供该项目的平台特定构件。

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
            // :some-other-multiplatform-module 的平台特定声明
            // 将被自动解析
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
                // :some-other-multiplatform-module 的平台特定声明
                // 将被自动解析
            }
        }
    }
}
```

</TabItem>
</Tabs>

## 后续步骤 {id="what-s-next"}

查看有关在多平台项目中添加依赖项的其他资源，以详细了解：

* [添加 Android 依赖项](multiplatform-android-dependencies.md)
* [添加 iOS 依赖项](multiplatform-ios-dependencies.md)
* 在示例项目中使用 [Android 和 iOS 库](multiplatform-samples.md)。

## 获取帮助 {id="get-help"}

* **Kotlin Slack**。获取[邀请](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)并加入 [#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU) 频道。
* **Kotlin 问题跟踪器**。[报告新问题](https://youtrack.jetbrains.com/newIssue?project=KT)。