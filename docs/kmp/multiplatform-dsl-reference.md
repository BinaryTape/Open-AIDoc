[//]: # (title: 多平台 Gradle DSL 参考)

Kotlin 多平台 Gradle 插件是一个用于创建 Kotlin 多平台项目的工具。
在此我们提供了其内容的参考；在为 Kotlin 多平台项目编写 Gradle 构建脚本时，可以将其作为备忘录使用。了解 [Kotlin 多平台项目的概念，以及如何创建和配置它们](multiplatform-discover-project.md)。

## ID 与版本

Kotlin 多平台 Gradle 插件的完全限定名称是 `org.jetbrains.kotlin.multiplatform`。 
如果你使用 Kotlin Gradle DSL，可以使用 `kotlin("multiplatform")` 来应用该插件。
插件版本与 Kotlin 发布版本一致。最新版本为 %kotlinVersion%。

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("multiplatform") version "%kotlinVersion%"
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
}
```

</TabItem>
</Tabs>

## 顶级块

`kotlin {}` 是 Gradle 构建脚本中用于多平台项目配置的顶级块。
在 `kotlin {}` 内部，你可以编写以下块：

| **块**               | **说明**                                                                                                |
|----------------------|---------------------------------------------------------------------------------------------------------|
| _&lt;targetName&gt;_ | 声明项目的特定目标。可用目标的名称列在 [目标](#targets) 部分。                                              |
| `targets`            | 列出项目的所有目标。                                                                                      |
| `sourceSets`         | 配置预定义的[源集](#source-sets)并声明项目的自定义源集。                                                   |
| `compilerOptions`    | 指定通用的扩展级 [编译器选项](#compiler-options)，这些选项将作为所有目标和共享源集的默认值。               |
| `dependencies`       | 配置 [通用依赖项](#configure-dependencies-at-the-top-level)。（实验性）                                     |

## 目标

“目标 (target)”是构建过程的一部分，负责编译、测试和打包针对受支持平台之一的软件片段。Kotlin 为每个平台提供目标，因此你可以指示 Kotlin 为该特定目标编译代码。详细了解 [设置目标](multiplatform-discover-project.md#targets)。

每个目标可以有一个或多个 [编译](#compilations)。除了用于测试和生产目的的默认编译外，你还可以 [创建自定义编译](multiplatform-configure-compilations.md#create-a-custom-compilation)。

多平台项目的目标在 `kotlin {}` 内部对应的块中描述，例如 `jvm`、`android`、`iosArm64`。
可用目标的完整列表如下：

<table>
    
<tr>
<th>目标平台</th>
        <th>目标</th>
        <th>备注</th>
</tr>

    
<tr>
<td>Kotlin/JVM</td>
        <td><code>jvm</code></td>
        <td></td>
</tr>

    
<tr>
<td rowspan="2">Kotlin/Wasm</td>
        <td><code>wasmJs</code></td>
        <td>如果你计划在 JavaScript 运行时中运行项目，请使用此目标。</td>
</tr>

    
<tr>
<td><code>wasmWasi</code></td>
        <td>如果你需要支持 <a href="https://github.com/WebAssembly/WASI">WASI</a> 系统接口，请使用此目标。</td>
</tr>

    
<tr>
<td>Kotlin/JS</td>
        <td><code>js</code></td>
        <td>
            <p>选择执行环境：</p>
            <list>
                <li><code>browser {}</code> 用于在浏览器中运行的应用程序。</li>
                <li><code>nodejs {}</code> 用于在 Node.js 上运行的应用程序。</li>
            </list>
            <p>在 <a href="https://kotlinlang.org/docs/js-project-setup.html#execution-environments">设置 Kotlin/JS 项目</a> 中了解更多信息。</p>
        </td>
</tr>

    
<tr>
<td>Kotlin/Native</td>
        <td></td>
        <td>
            <p>在 <a href="https://kotlinlang.org/docs/native-target-support.html">Kotlin/Native 目标支持</a> 中了解目前支持的 macOS、Linux 和 Windows 宿主机目标。</p>
        </td>
</tr>

    
<tr>
<td>Android 应用程序与库</td>
        <td><code>android</code></td>
        <td>
            <p>手动应用 Android Gradle 插件：<code>com.android.application</code> 或 <code>com.android.kotlin.multiplatform.library</code>。</p>
            <p>每个 Gradle 子项目只能创建一个 Android 目标。</p>
        </td>
</tr>

</table>

> 当前宿主机不支持的目标在构建期间会被忽略，因此不会被发布。
>
{style="note"}

```groovy
kotlin {
    jvm()
    iosArm64()
    macosArm64()
    js().browser()
}
```

目标的配置可以包含两个部分：

* 适用于所有目标的 [通用配置](#common-target-configuration)。
* 目标特定配置。

每个目标可以有一个或多个 [编译](#compilations)。

### 通用目标配置

在任何目标块中，你都可以使用以下声明：

| **名称**             | **说明**                                                                                                                                  | 
|----------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| `platformType`       | 此目标的 Kotlin 平台。可用值：`jvm`、`androidJvm`、`js`、`wasm`、`native`、`common`。                                                       |
| `artifactsTaskName`  | 构建此目标生成的工件的任务名称。                                                                                                          |
| `components`         | 用于设置 Gradle 发布内容的组件。                                                                                                          |
| `compilerOptions`    | 用于该目标的 [编译器选项](#compiler-options)。此声明会覆盖在 [顶级](multiplatform-dsl-reference.md#top-level-blocks) 配置的任何 `compilerOptions {}`。 |

### Web 目标

`js {}` 块描述了 Kotlin/JS 目标的配置，而 `wasmJs {}` 块描述了可与 JavaScript 互操作的 Kotlin/Wasm 目标的配置。根据目标执行环境，它们可以包含以下两个块之一：

| **名称**              | **说明**                     | 
|-----------------------|------------------------------|
| [`browser`](#browser) | 浏览器目标的配置。           |
| [`nodejs`](#node-js)  | Node.js 目标的配置。         |

详细了解 [配置 Kotlin/JS 项目](https://kotlinlang.org/docs/js-project-setup.html)。

一个单独的 `wasmWasi {}` 块描述了支持 WASI 系统接口的 Kotlin/Wasm 目标的配置。在这里，仅 [`nodejs`](#node-js) 执行环境可用：

```kotlin
kotlin {
    wasmWasi {
        nodejs()
        binaries.executable()
    }
}
```

所有 Web 目标（`js`、`wasmJs` 和 `wasmWasi`）也都支持 `binaries.executable()` 调用。它明确指示 Kotlin 编译器生成可执行文件。更多信息请参阅 Kotlin/JS 文档中的 [执行环境](https://kotlinlang.org/docs/js-project-setup.html#execution-environments)。

#### 浏览器

`browser {}` 可以包含以下配置块：

| **名称**       | **说明**                                                            | 
|----------------|---------------------------------------------------------------------|
| `testRuns`     | 测试执行的配置。                                                    |
| `runTask`      | 项目运行的配置。                                                    |
| `webpackTask`  | 使用 [Webpack](https://webpack.js.org/) 进行项目打包的配置。        |
| `distribution` | 输出文件的路径。                                                    |

```kotlin
kotlin {
    js().browser {
        webpackTask { /* ... */ }
        testRuns { /* ... */ }
        distribution {
            directory = File("$projectDir/customdir/")
        }
    }
}
```

#### Node.js

`nodejs {}` 可以包含测试和运行任务的配置：

| **名称**   | **说明**                   | 
|------------|----------------------------|
| `testRuns` | 测试执行的配置。           |
| `runTask`  | 项目运行的配置。           |

```kotlin
kotlin {
    js().nodejs {
        runTask { /* ... */ }
        testRuns { /* ... */ }
    }
}
```

### 原生目标

对于原生目标，可以使用以下特定块：

| **名称**    | **说明**                                          | 
|-------------|---------------------------------------------------|
| `binaries`  | 要生成的 [二进制文件](#binaries) 的配置。         |
| `cinterops` | 与 [C 库互操作](#cinterops) 的配置。              |

#### 二进制文件

二进制文件有以下几种类型：

| **名称**     | **说明**               | 
|--------------|------------------------|
| `executable` | 产品可执行文件。       |
| `test`       | 测试可执行文件。       |
| `sharedLib`  | 动态库。               |
| `staticLib`  | 静态库。               |
| `framework`  | Objective-C 框架。     |

```kotlin
kotlin {
    linuxX64 { // 请替换为你的目标。
        binaries {
            executable {
                // 二进制文件配置。
            }
        }
    }
}
```

对于二进制文件配置，可以使用以下参数：

| **名称**             | **说明**                                                                                                                                                                                                                                              | 
|----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `compilation`        | 构建二进制文件所属的编译。默认情况下，`test` 二进制文件基于 `test` 编译，而其他二进制文件基于 `main` 编译。                                                                                                                                          |
| `linkerOpts`         | 在二进制文件构建期间传递给系统链接器的选项。                                                                                                                                                                                                          |
| `baseName`           | 输出文件的自定义基本名称。最终文件名将通过在此基本名称后添加系统相关的显式前缀和后缀形成。                                                                                                                                                          |
| `entryPoint`         | 可执行二进制文件的入口点函数。默认情况下，它是根软件包中的 `main()`。                                                                                                                                                                                |
| `outputFile`         | 访问输出文件。                                                                                                                                                                                                                                        |
| `linkTask`           | 访问链接任务。                                                                                                                                                                                                                                        |
| `runTask`            | 访问可执行二进制文件的运行任务。对于 `linuxX64`、`macosArm64` 或 `mingwX64` 以外的目标，该值为 `null`。                                                                                                                                            |
| `isStatic`           | 用于 Objective-C 框架。包含静态库而不是动态库。                                                                                                                                                                                                      |
| `disableNativeCache` | <p>禁用编译缓存。由于会增加编译时间，请仅在特殊情况下使用。</p><p>必须包含禁用了缓存的 Kotlin `version` 以及 `reason`（原因）。（可选）可以指定指向问题跟踪器中 `issue` 的 URL。</p> |

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
binaries {
    executable("my_executable", listOf(RELEASE)) {
        // 基于 test 编译构建二进制文件。
        compilation = compilations["test"]

        // 链接器的自定义命令行选项。
        linkerOpts = mutableListOf("-L/lib/search/path", "-L/another/search/path", "-lmylib")

        // 输出文件的基本名称。
        baseName = "foo"

        // 自定义入口点函数。
        entryPoint = "org.example.main"

        // 访问输出文件。
        println("Executable path: ${outputFile.absolutePath}")

        // 访问链接任务。
        linkTask.dependsOn(additionalPreprocessingTask)

        // 访问运行任务。
        // 请注意，对于非宿主机平台，runTask 为 null。
        runTask?.dependsOn(prepareForRun)
    }

    framework("my_framework" listOf(RELEASE)) {
        // 在框架中包含静态库而不是动态库。
        isStatic = true

        // 为此二进制文件禁用编译缓存
        disableNativeCache(
            version = DisableCacheInKotlinVersion.2_3_0,
            reason = "Cache bug",
            issue = URI("https://youtrack.com/YY-1111")
        )
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
binaries {
    executable('my_executable', [RELEASE]) {
        // 基于 test 编译构建二进制文件。
        compilation = compilations.test

        // 链接器的自定义命令行选项。
        linkerOpts = ['-L/lib/search/path', '-L/another/search/path', '-lmylib']

        // 输出文件的基本名称。
        baseName = 'foo'

        // 自定义入口点函数。
        entryPoint = 'org.example.main'

        // 访问输出文件。
        println("Executable path: ${outputFile.absolutePath}")

        // 访问链接任务。
        linkTask.dependsOn(additionalPreprocessingTask)

        // 访问运行任务。
        // 请注意，对于非宿主机平台，runTask 为 null。
        runTask?.dependsOn(prepareForRun)
    }

    framework('my_framework' [RELEASE]) {
        // 在框架中包含静态库而不是动态库。
        isStatic = true

        // 为此二进制文件禁用编译缓存
        disableNativeCache(
            version = DisableCacheInKotlinVersion.2_3_0,
            reason = 'Cache bug',
            issue = URI('https://youtrack.com/YY-1111')
        )
    }
}
```

</TabItem>
</Tabs>

详细了解 [构建原生二进制文件](multiplatform-build-native-binaries.md)。

#### Cinterops

`cinterops` 是与原生库互操作的描述集合。
要提供与库的互操作，请在 `cinterops` 中添加一个条目并定义其参数：

| **名称**         | **说明**                                       | 
|------------------|------------------------------------------------|
| `definitionFile` | 描述原生 API 的 `.def` 文件。                  |
| `packageName`    | 生成的 Kotlin API 的软件包前缀。               |
| `compilerOpts`   | cinterop 工具传递给编译器的选项。              |
| `includeDirs`    | 查找头文件的目录。                             |
| `header`         | 要包含在绑定中的头文件。                       |
| `headers`        | 要包含在绑定中的头文件列表。                   |

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    linuxX64 { // 替换为你需要的目标。
        compilations.getByName("main") {
            val myInterop by cinterops.creating {
                // 描述原生 API 的定义文件。
                // 默认路径为 src/nativeInterop/cinterop/<interop-name>.def
                definitionFile.set(project.file("def-file.def"))

                // 放置生成的 Kotlin API 的软件包。
                packageName("org.sample")

                // 由 cinterop 工具传递给编译器的选项。
                compilerOpts("-Ipath/to/headers")

                // 用于头文件搜索的目录（类似于 -I<path> 编译器选项）。
                includeDirs.allHeaders("path1", "path2")

                // includeDirs.allHeaders 的快捷方式。
                includeDirs("include/directory", "another/directory")

                // 要包含在绑定中的头文件。
                header("path/to/header.h")
                headers("path/to/header1.h", "path/to/header2.h")
            }

            val anotherInterop by cinterops.creating { /* ... */ }
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    linuxX64 { // 替换为你需要的目标。
        compilations.main {
            cinterops {
                myInterop {
                    // 描述原生 API 的定义文件。
                    // 默认路径为 src/nativeInterop/cinterop/<interop-name>.def
                    definitionFile = project.file("def-file.def")

                    // 放置生成的 Kotlin API 的软件包。
                    packageName 'org.sample'

                    // 由 cinterop 工具传递给编译器的选项。
                    compilerOpts '-Ipath/to/headers'

                    // 用于头文件搜索的目录（类似于 -I<path> 编译器选项）。
                    includeDirs.allHeaders("path1", "path2")

                    // includeDirs.allHeaders 的快捷方式。
                    includeDirs("include/directory", "another/directory")

                    // Header 文件要包含在绑定中。
                    header("path/to/header.h")
                    headers("path/to/header1.h", "path/to/header2.h")
                }

                anotherInterop { /* ... */ }
            }
        }
    }
}
```

</TabItem>
</Tabs>

更多 cinterop 属性，请参阅 [定义文件](https://kotlinlang.org/docs/native-definition-file.html#properties)。

### Android 目标

Kotlin 多平台 Gradle 插件有一个特定函数，可帮助你为 Android 目标配置 [构建变体](https://developer.android.com/studio/build/build-variants)：

| **名称**                      | **说明**                                                                                                                                  | 
|-------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| `publishLibraryVariants()`    | 指定要发布的构建变体。详细了解 [发布 Android 库](multiplatform-publish-lib-setup.md#publish-an-android-library)。 |

```kotlin
kotlin {
    android {
        publishLibraryVariants("release")
    }
}
```

详细了解 [Android 编译](multiplatform-configure-compilations.md#compilation-for-android)。

> `kotlin {}` 块内的 `android` 配置不会取代任何 Android 项目的构建配置。
> 欲了解更多关于为 Android 项目编写构建脚本的信息，请参阅 [Android 开发者文档](https://developer.android.com/studio/build)。
>
{style="note"}

## 源集

`sourceSets {}` 块描述项目的源集。源集包含共同参与编译的 Kotlin 源文件，以及它们的资源和依赖项。

多平台项目为其目标包含 [预定义](#predefined-source-sets) 源集；开发者也可以根据需要创建 [自定义](#custom-source-sets) 源集。

### 预定义源集

在创建多平台项目时，会自动设置预定义源集。
可用的预定义源集如下：

| **名称**                                    | **说明**                                                                                                                                                         | 
|---------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `commonMain`                                | 所有平台之间共享的代码和资源。在所有多平台项目中可用。用于项目的所有主 [编译](#compilations)。                                                                   |
| `commonTest`                                | 所有平台之间共享的测试代码和资源。在所有多平台项目中可用。用于项目的所有测试编译。                                                                               |
| _&lt;targetName&gt;&lt;compilationName&gt;_ | 特定于目标的编译源代码。_&lt;targetName&gt;_ 是预定义目标的名称，而 _&lt;compilationName&gt;_ 是该目标的编译名称。例如：`jsTest`、`jvmMain`。 |

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        commonMain { /* ... */ }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets { 
        commonMain { /* ... */ }
    }
}
```

</TabItem>
</Tabs>

详细了解 [源集](multiplatform-discover-project.md#source-sets)。

### 自定义源集

自定义源集由项目开发者手动创建。
要创建自定义源集，请在 `sourceSets` 部分内部添加一个以其名称命名的部分。
如果使用 Kotlin Gradle DSL，请使用 `by creating` 标记自定义源集。

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets { 
        val myMain by creating { /* ... */ } // 创建一个名为 'MyMain' 的新源集
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets { 
        myMain { /* ... */ } // 创建或配置一个名为 'myMain' 的源集 
    }
}
```

</TabItem>
</Tabs>

请注意，新创建的源集并未与其他源集连接。要在项目的编译中使用它，请 [将其与其他源集连接](multiplatform-hierarchy.md#manual-configuration)。

### 源集参数

源集的配置存储在 `sourceSets {}` 对应的块中。源集具有以下参数：

| **名称**           | **说明**                                                                        | 
|--------------------|---------------------------------------------------------------------------------|
| `kotlin.srcDir`    | 源集目录内 Kotlin 源文件的位置。                                                |
| `resources.srcDir` | 源集目录内资源的位置。                                                          |
| `dependsOn`        | [与其他源集的连接](multiplatform-hierarchy.md#manual-configuration)。           |
| `dependencies`     | 源集的 [依赖项](#dependencies)。                                               |
| `languageSettings` | 应用于共享源集的 [语言设置](#language-settings)。                               |

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin { 
    //...
    sourceSets { 
        commonMain {
            kotlin.srcDir("src")
            resources.srcDir("res")

            dependencies {
                /* ... */
            }
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
            kotlin.srcDir('src')
            resources.srcDir('res')

            dependencies {
                /* ... */
            }
        }
    }
}
``` 

</TabItem>
</Tabs>

## 编译

一个目标可以有一个或多个编译，例如，用于生产或测试。在创建目标时会自动添加 [预定义编译](#predefined-compilations)。你还可以额外创建 [自定义编译](#custom-compilations)。

要引用目标的所有或某些特定编译，请使用 `compilations` 对象集合。
从 `compilations` 中，你可以通过名称引用编译。

详细了解 [配置编译](multiplatform-configure-compilations.md)。

### 预定义编译

除了 Android 目标外，系统会为项目的每个目标自动创建预定义编译。
可用的预定义编译如下：

| **名称** | **说明**                     | 
|----------|------------------------------|
| `main`   | 生产源代码的编译。           |
| `test`   | 测试的编译。                 |

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    jvm {
        val main by compilations.getting {
            output // 获取主编译输出
        }

        compilations["test"].runtimeDependencyFiles // 获取测试运行时类路径
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    jvm {
        compilations.main.output // 获取主编译输出
        compilations.test.runtimeDependencyFiles // 获取测试运行时类路径
    }
}
```

</TabItem>
</Tabs>

### 自定义编译

除了预定义编译外，你还可以创建自己的自定义编译。
为此，请在新的编译与 `main` 编译之间建立 [`associateWith`](https://kotlinlang.org/docs/gradle-configure-project.html#associate-compiler-tasks) 关系。如果你使用的是 Kotlin Gradle DSL，请使用 `by creating` 标记自定义编译：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    jvm {
        compilations {
            val main by getting
            val integrationTest by creating {
                // 将 main 及其类路径作为依赖项导入，并建立 internal 可见性
                associateWith(main)
                defaultSourceSet {
                    dependencies {
                        implementation(kotlin("test-junit"))
                        /* ... */
                    }
                }

                // 创建一个测试任务以运行此编译生成的测试
                testRuns.create("integration") {
                    // 配置测试任务
                    setExecutionSourceFrom(integrationTest)
                }
            }
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    jvm {
        compilations.create('integrationTest') {
            def main = compilations.main
            // 将 main 及其类路径作为依赖项导入，并建立 internal 可见性
            associateWith(main)
            defaultSourceSet {
                dependencies {
                    implementation kotlin('test-junit')
                    /* ... */
                }
            }

            // 创建一个测试任务以运行此编译生成的测试
            testRuns.create('integration') {
                // 配置测试任务
                setExecutionSourceFrom(compilations.integrationTest)
            }
        }
    }
}
```

</TabItem>
</Tabs>

通过关联编译，你可以将主编译输出添加为依赖项，并在编译之间建立 `internal` 可见性。

详细了解创建 [自定义编译](multiplatform-configure-compilations.md#create-a-custom-compilation)。

### 编译参数

编译具有以下参数：

| **名称**                 | **说明**                                                                                                                                           | 
|--------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| `defaultSourceSet`       | 编译的默认源集。                                                                                                                                   |
| `kotlinSourceSets`       | 参与编译的源集。                                                                                                                                   |
| `allKotlinSourceSets`    | 参与编译的源集及其通过 `dependsOn()` 建立的连接。                                                                                                  |
| `compilerOptions`        | 应用于编译的编译器选项。有关可用选项的列表，请参阅 [编译器选项](https://kotlinlang.org/docs/gradle-compiler-options.html)。                                                               |
| `compileKotlinTask`      | 用于编译 Kotlin 源代码的 Gradle 任务。                                                                                                             |
| `compileKotlinTaskName`  | `compileKotlinTask` 的名称。                                                                                                                       |
| `compileAllTaskName`     | 用于编译某个编译中所有源代码的 Gradle 任务名称。                                                                                                   |
| `output`                 | 编译输出。                                                                                                                                         |
| `compileDependencyFiles` | 编译的编译时依赖文件（类路径）。对于所有 Kotlin/Native 编译，这会自动包含标准库和平台依赖项。                                                      |
| `runtimeDependencyFiles` | 编译的运行时依赖文件（类路径）。                                                                                                                   |

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    jvm {
        val main by compilations.getting {
            compileTaskProvider.configure {
                compilerOptions {
                    // 为 'main' 编译设置 Kotlin 编译器选项：
                    jvmTarget.set(JvmTarget.JVM_1_8)
                }
            }
        
            compileKotlinTask // 获取 Kotlin 任务 'compileKotlinJvm' 
            output // 获取主编译输出
        }
        
        compilations["test"].runtimeDependencyFiles // 获取测试运行时类路径
    }

    // 配置所有目标的所有编译：
    compilerOptions {
        allWarningsAsErrors.set(true)
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    jvm {
        compilations.main {
            compileTaskProvider.configure {
                compilerOptions {
                    // 设置 'main' 编译的 Kotlin 编译器选项：
                    jvmTarget = JvmTarget.JVM_1_8
                }
            }
        }

        compilations.main.compileKotlinTask // 获取 Kotlin 任务 'compileKotlinJvm' 
        compilations.main.output // 获取主编译输出
        compilations.test.runtimeDependencyFiles // 获取测试运行时类路径
    }

    // 配置所有目标的所有编译：
    compilerOptions {
        allWarningsAsErrors = true
    }
}
```

</TabItem>
</Tabs>

## 编译器选项

你可以在项目中的三个不同级别配置编译器选项：

* **扩展级**，在 `kotlin {}` 块中。
* **目标级**，在目标块中。
* **编译单元级**，通常在特定的编译任务中。

![Kotlin 编译器选项级别](compiler-options-levels.svg){width=700}

较高级别的设置作为其下一级的默认值：

* 在扩展级设置的编译器选项是目标级选项的默认值，包括共享源集，如 `commonMain`、`nativeMain` 和 `commonTest`。
* 在目标级设置的编译器选项是编译单元（任务）级选项的默认值，例如 `compileKotlinJvm` 和 `compileTestKotlinJvm` 任务。

在较低级别所做的配置会覆盖较高级别中的类似设置：

* 任务级编译器选项会覆盖目标级或扩展级中的类似设置。
* 目标级编译器选项会覆盖扩展级中的类似设置。

有关可能的编译器选项列表，请参阅 [所有编译器选项](https://kotlinlang.org/docs/gradle-compiler-options.html#all-compiler-options)。

### 扩展级

要为项目中的所有目标配置编译器选项，请在顶级使用 `compilerOptions {}` 块：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    // 配置所有目标的所有编译
    compilerOptions {
        allWarningsAsErrors.set(true)
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    // 配置所有目标的所有编译：
    compilerOptions {
        allWarningsAsErrors = true
    }
}
```

</TabItem>
</Tabs>

### 目标级

要为项目中的特定目标配置编译器选项，请在目标块内使用 `compilerOptions {}` 块：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    jvm {
        // 配置 JVM 目标的所有编译
        compilerOptions {
            allWarningsAsErrors.set(true)
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    jvm {
        // 配置 JVM 目标的所有编译
        compilerOptions {
            allWarningsAsErrors = true
        }
    }
}
```

</TabItem>
</Tabs>

### 编译单元级

要为特定任务配置编译器选项，请在该任务内使用 `compilerOptions {}` 块：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
task.named<KotlinJvmCompile>("compileKotlinJvm") {
    compilerOptions {
        allWarningsAsErrors.set(true)
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
task.named<KotlinJvmCompile>("compileKotlinJvm") {
    compilerOptions {
        allWarningsAsErrors = true
    }
}
```

</TabItem>
</Tabs>

要为特定编译配置编译器选项，请在该编译的任务提供程序中使用 `compilerOptions {}` 块：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    jvm {
        compilations.named(KotlinCompilation.MAIN_COMPILATION_NAME) {
            compileTaskProvider.configure {
                // 配置 'main' 编译：
                compilerOptions {
                    allWarningsAsErrors.set(true)
                }
            }
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    jvm {
        compilations.named(KotlinCompilation.MAIN_COMPILATION_NAME) {
            compileTaskProvider.configure {
                // 配置 'main' 编译：
                compilerOptions {
                    allWarningsAsErrors = true
                }
            }
        }
    }
}
```

</TabItem>
</Tabs>

### 从 `kotlinOptions {}` 迁移到 `compilerOptions {}` {collapsible="true"}

在 Kotlin 2.2.0 之前，你可以使用 `kotlinOptions {}` 块配置编译器选项。由于 `kotlinOptions {}` 块在 Kotlin 2.2.0 中已被弃用，你需要在构建脚本中改用 `compilerOptions {}` 块。更多信息请参阅 [从 `kotlinOptions{}` 迁移到 `compilerOptions{}`](https://kotlinlang.org/docs/gradle-compiler-options.html#migrate-from-kotlinoptions-to-compileroptions)。

## 依赖项

源集声明中的 `dependencies {}` 块包含了该源集的依赖项。

详细了解 [配置依赖项](https://kotlinlang.org/docs/gradle-configure-project.html)。

共有四种类型的依赖项：

| **名称**         | **说明**                                                                         | 
|------------------|----------------------------------------------------------------------------------|
| `api`            | 在当前模块的 API 中使用的依赖项。                                                |
| `implementation` | 在模块内部使用但不向外暴露的依赖项。                                             |
| `compileOnly`    | 仅用于当前模块编译的依赖项。                                                     |
| `runtimeOnly`    | 运行时可用，但在任何模块编译期间不可见的依赖项。                                 |

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        commonMain {
            dependencies {
                api("com.example:foo-metadata:1.0")
            }
        }
        jvmMain {
            dependencies {
                implementation("com.example:foo-jvm:1.0")
            }
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
                api 'com.example:foo-metadata:1.0'
            }
        }
        jvmMain {
            dependencies {
                implementation 'com.example:foo-jvm:1.0'
            }
        }
    }
}
```

</TabItem>
</Tabs>

此外，源集可以互相依赖并形成层次结构。在这种情况下，使用 [`dependsOn()`](#source-set-parameters) 关系。

### 在顶级配置依赖项
<primary-label ref="Experimental"/>

你可以使用顶级的 `dependencies {}` 块来配置通用依赖项。在此声明的依赖项的行为就像被添加到 `commonMain` 或 `commonTest` 源集中一样。

要使用顶级 `dependencies {}` 块，请在块前添加 `@OptIn(ExperimentalKotlinGradlePluginApi::class)` 注解进行选择性加入：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    @OptIn(ExperimentalKotlinGradlePluginApi::class)
    dependencies {
        implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    dependencies {
        implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%'
    }
}
```

</TabItem>
</Tabs>

在对应目标的 `sourceSets {}` 块中添加平台特定的依赖项。

你可以在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-76446) 中分享你对此功能的反馈。

## 语言设置

源集中的 `languageSettings {}` 块定义了项目分析和编译的某些方面。仅当配置专门应用于共享源集的设置时，才使用 `languageSettings {}` 块。对于所有其他情况，请使用 `compilerOptions {}` 块在扩展或目标级别 [配置编译器选项](#compiler-options)。

提供以下语言设置：

| **名称**                | **说明**                                                                                                                                  | 
|-------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| `languageVersion`       | 提供与指定 Kotlin 版本的源代码兼容性。                                                                                                   |
| `apiVersion`            | 仅允许使用指定版本的 Kotlin 捆绑库中的声明。                                                                                             |
| `enableLanguageFeature` | 启用指定的语言功能。可用值对应于当前处于实验性阶段或曾在某个阶段作为实验性功能引入的语言功能。                                           |
| `optIn`                 | 允许使用指定的 [选择性加入注解](https://kotlinlang.org/docs/opt-in-requirements.html)。                                                   |
| `progressiveMode`       | 启用 [渐进模式](https://kotlinlang.org/docs/whatsnew13.html#progressive-mode)。                                                           |

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets.all {
        languageSettings.apply {
            languageVersion = "%languageVersion%" // 可能的值: "2.0", "2.1", "2.2", "2.3", "2.4", "2.5" (实验性)
            apiVersion = "%apiVersion%" // 可能的值: "2.0", "2.1", "2.2", "2.3", "2.4", "2.5" (实验性)
            enableLanguageFeature("InlineClasses") // 语言功能名称
            optIn("kotlin.ExperimentalUnsignedTypes") // 注解完全限定名
            progressiveMode = true // 默认为 false
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets.all {
        languageSettings {
            languageVersion = '%languageVersion%' // 可能的值: '2.0', '2.1', '2.2', '2.3', '2.4', '2.5' (实验性)
            apiVersion = '%apiVersion%' // 可能的值: '2.0', '2.1', '2.2', '2.3', '2.4', '2.5' (实验性)
            enableLanguageFeature('InlineClasses') // 语言功能名称
            optIn('kotlin.ExperimentalUnsignedTypes') // 注解完全限定名
            progressiveMode = true // 默认为 false
        }
    }
}
```

</TabItem>
</Tabs>