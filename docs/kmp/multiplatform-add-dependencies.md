[//]: # (title: 添加多平台库依赖项)

每个程序的运行都需要一组库。Kotlin Multiplatform 项目可以依赖于适用于所有目标平台的多平台库、特定于平台的库以及其他多平台项目。

要添加库依赖项，请在包含共享代码的项目目录中更新 `build.gradle(.kts)` 文件。在 [`dependencies {}`](multiplatform-dsl-reference.md#dependencies) 块中设置所需 [类型](https://kotlinlang.org/docs/gradle-configure-project.html#dependency-types) 的依赖项（例如 `implementation`）：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        commonMain.dependencies {
            implementation("com.example:my-library:1.0") // 为所有源集共享的库
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

## 依赖 Kotlin 库

### 标准库

每个源集中对标准库 (`stdlib`) 的依赖项会自动添加。标准库的版本与 `kotlin-multiplatform` 插件的版本相同。

对于特定于平台的源集，将使用对应的特定于平台的库变体，而其余源集则添加通用标准库。Kotlin Gradle 插件将根据 Gradle 构建脚本的 `compilerOptions.jvmTarget` [编译器选项](https://kotlinlang.org/docs/gradle-compiler-options.html) 选择合适的 JVM 标准库。

了解如何[更改默认行为](https://kotlinlang.org/docs/gradle-configure-project.html#dependency-on-the-standard-library)。

### 测试库

对于多平台测试，可以使用 [`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) API。创建多平台项目时，可以通过在 `commonTest` 中使用单个依赖项来为所有源集添加测试依赖项：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        commonTest.dependencies {
            implementation(kotlin("test")) // 自动引入所有平台依赖项
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
                implementation kotlin("test") // 自动引入所有平台依赖项
            }
        }
    }
}
```

</TabItem>
</Tabs>

### kotlinx 库

如果你使用多平台库并需要[依赖共享代码](#library-shared-for-all-source-sets)，请仅在共享源集中设置一次依赖项。使用库的基础工件名称，例如 `kotlinx-coroutines-core`：

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

如果你需要为[特定于平台的依赖项](#library-used-in-specific-source-sets)使用 kotlinx 库，仍可以在对应的平台源集中使用库的基础工件名称：

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

## 依赖 Kotlin Multiplatform 库

你可以添加对采用了 Kotlin Multiplatform 技术的库（如 [SQLDelight](https://github.com/cashapp/sqldelight)）的依赖项。这些库的作者通常会提供将依赖项添加到项目中的指南。

> 在 [klibs.io](https://klibs.io/) 上查找可用的 Kotlin Multiplatform 库。
>
{style="tip"}

### 所有源集共享的库

如果你想在所有源集中使用某个库，可以仅将其添加到通用源集中。Kotlin Multiplatform Gradle 插件会自动将对应部分添加到任何其他源集中。

> 你不能在通用源集中设置对特定于平台的库的依赖项。
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
            // 将自动添加对 ktor-client 平台部分的依赖项
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
                // 将自动添加对 ktor-client 平台部分的依赖项
            }
        }
    }
}
```

</TabItem>
</Tabs>

> 你也可以在顶层 `dependencies {}` 块中配置通用库。请参阅[在顶层配置依赖项](multiplatform-dsl-reference.md#configure-dependencies-at-the-top-level)。
> 
{style="tip"}

### 在特定源集中使用的库

如果你想仅在特定源集中使用多平台库，可以专门为这些源集添加。届时，指定的库声明将仅在这些源集中可用。

> 在这种情况下，请使用通用库名称，而不是特定于平台的名称。如以下示例中的 SQLDelight，请使用 `native-driver`，而不是 `native-driver-iosx64`。请在库的文档中查找确切名称。
>
{style="note"}

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        commonMain.dependencies {
            // kotlinx.coroutines 将在所有源集中可用
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
        }
        androidMain.dependencies {

        }
        iosMain.dependencies {
            // SQLDelight 将仅在 iOS 源集中可用，而在 Android 或通用源集中不可用
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
                // kotlinx.coroutines 将在所有源集中可用
                implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%'
            }
        }
        androidMain {
            dependencies {}
        }
        iosMain {
            dependencies {
                // SQLDelight 将仅在 iOS 源集中可用，而在 Android 或通用源集中不可用
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

## 依赖另一个多平台项目

你可以将一个多平台项目作为依赖项连接到另一个项目。为此，只需将项目依赖项添加到需要它的源集中。如果你想在所有源集中使用该依赖项，请将其添加到通用源集中。在这种情况下，其他源集将自动获取其对应的版本。

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
            // 将自动添加 :some-other-multiplatform-module 的平台部分
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
                // 将自动添加 :some-other-multiplatform-module 的平台部分
            }
        }
    }
}
```

</TabItem>
</Tabs>

## 下一步？

查看有关在多平台项目中添加依赖项的其他资源，详细了解：

* [添加 Android 依赖项](multiplatform-android-dependencies.md)
* [添加 iOS 依赖项](multiplatform-ios-dependencies.md)
* [在面向 iOS、Android、桌面和 Web 的 Compose Multiplatform 项目中添加新依赖项](compose-multiplatform-modify-project.md#add-a-new-dependency)