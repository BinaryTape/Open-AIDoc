[//]: # (title: Kotlin/Native 内存管理)

Kotlin/Native 使用一种与 JVM、Go 以及其他主流技术类似的现代内存管理器，包括以下特性：

* 对象存储在共享堆中，可以从任何线程访问。
* 定期进行跟踪式垃圾回收，以回收从“根”（如局部变量和全局变量）不可达的对象。

## 垃圾回收器 {id="garbage-collector"}

Kotlin/Native 的垃圾回收器 (GC) 算法在不断演进。目前，它作为一个并发标记清除 (CMS) 回收器运行，不将堆分为分代。

GC 在一个单独的线程上执行，并根据内存压力启发式或定时器启动。此外，也可以[手动调用](#enable-garbage-collection-manually)。

GC 在多个线程上并行处理标记队列，包括应用线程、GC 线程以及可选的标记线程。应用线程和至少一个 GC 线程会参与标记过程。默认情况下，标记阶段与应用线程并发运行，这减少了 GC 暂停时间。您可以通过 [GC 日志](#monitor-gc-performance)监控 GC 性能。

> 您可以使用 `kotlin.native.binary.gcMarkSingleThreaded=true` 编译器选项禁用标记阶段的并行化。
> 然而，这可能会增加大型堆上的垃圾回收器暂停时间。
>
{style="tip"}

标记阶段完成后，GC 会处理弱引用，并将指向未标记对象的引用点置空。默认情况下，弱引用是并发处理的，以减少 GC 暂停时间。

如果您在使用 CMS 时遇到问题，可以切换回并行标记并发清除 (PMCS) 设置。为此，请在您的 `gradle.properties` 文件中设置以下[二进制选项](native-binary-options.md)：

```none
kotlin.native.binary.gc=pmcs
```

### 手动启用垃圾回收 {id="enable-garbage-collection-manually"}

要强制启动垃圾回收器，请调用 `kotlin.native.internal.GC.collect()`。此方法会触发一次新的回收并等待其完成。

### 监控 GC 性能 {id="monitor-gc-performance"}

要监控 GC 性能，您可以查看其日志并诊断问题。要启用日志记录，请在 Gradle 构建脚本中设置以下编译器选项：

```none
-Xruntime-logs=gc=info
```

目前，日志仅打印到 `stderr`。

在 Apple 平台上，您可以利用 Xcode Instruments 工具包来调试 iOS 应用性能。垃圾回收器会通过 Instruments 中可用的迹点 (signpost) 报告暂停。迹点允许在您的应用中进行自定义日志记录，使您可以检查 GC 暂停是否与应用卡死相对应。

要在您的应用中跟踪与 GC 相关的暂停：

1. 要启用该功能，请在您的 `gradle.properties` 文件中设置以下编译器选项：
  
   ```none
   kotlin.native.binary.enableSafepointSignposts=true
   ```

2. 打开 Xcode，转到 **Product** | **Profile** 或按 <shortcut>Cmd + I</shortcut>。此操作将编译您的应用并启动 Instruments。
3. 在模板选择中，选择 **os_signpost**。
4. 将 `org.kotlinlang.native.runtime` 指定为 **subsystem**，将 `safepoint` 指定为 **category** 来进行配置。
5. 点击红色录制按钮运行您的应用并开始录制迹点事件：

   ![将 GC 暂停作为迹点进行跟踪](native-gc-signposts.png){width=700}

   在这里，最低图表上的每个蓝色块代表一个单独的迹点事件，即一次 GC 暂停。

### 禁用垃圾回收 {id="disable-garbage-collection"}

建议保持启用 GC。但在某些情况下您可以禁用它，例如出于测试目的，或者如果您遇到了问题且程序是短期的。为此，请在您的 `gradle.properties` 文件中设置以下二进制选项：

```none
kotlin.native.binary.gc=noop
```

> 启用此选项后，GC 不会回收 Kotlin 对象，因此只要程序运行，内存消耗就会持续上升。请注意不要耗尽系统内存。
>
{style="warning"}

## 内存消耗 {id="memory-consumption"}

Kotlin/Native 使用自己的[内存分配器](https://github.com/JetBrains/kotlin/blob/master/kotlin-native/runtime/src/alloc/custom/README.md)。它将系统内存划分为页，允许按连续顺序进行独立清除。每次分配都成为页内的一个内存块，并且页会跟踪块的大小。不同的页类型针对各种分配大小进行了优化。内存块的连续安排确保了对所有已分配块的高效遍历。

当一个线程分配内存时，它会根据分配大小搜索合适的页。线程为不同的尺寸类别维护一组页。通常，给定尺寸的当前页可以容纳该分配。如果不行，线程会从共享分配空间请求另一个页。该页可能已经可用、需要清除，或者必须先创建。

Kotlin/Native 内存分配器带有针对内存分配突然激增的保护机制。它能防止赋值器 (mutator) 开始快速分配大量垃圾而 GC 线程无法跟上的情况，避免内存使用无限增长。在这种情况下，GC 会强制进入停止所有线程 (stop-the-world) 阶段，直到遍历完成。

您可以自行监控内存消耗、检查内存泄漏并调整内存消耗。

### 监控内存消耗 {id="monitor-memory-consumption"}

要调试内存问题，您可以检查内存管理器指标。此外，还可以在 Apple 平台上跟踪 Kotlin 的内存消耗。

#### 检查内存泄漏 {id="check-for-memory-leaks"}

要访问内存管理器指标，请调用 `kotlin.native.internal.GC.lastGCInfo()`。此方法返回最后一次运行垃圾回收器的统计信息。这些统计信息可用于：

* 使用全局变量时调试内存泄漏
* 运行测试时检查泄漏

```kotlin
import kotlin.native.internal.*
import kotlin.test.*

class Resource

val global = mutableListOf<Resource>()

@OptIn(ExperimentalStdlibApi::class)
fun getUsage(): Long {
    GC.collect()
    return GC.lastGCInfo!!.memoryUsageAfter["heap"]!!.totalObjectsSizeBytes
}

fun run() {
    global.add(Resource())
    // 如果移除下一行，测试将失败
    global.clear()
}

@Test
fun test() {
    val before = getUsage()
    // 使用单独的函数来确保清除所有临时对象
    run()
    val after = getUsage()
    assertEquals(before, after)
}
```

#### 在 Apple 平台上跟踪内存消耗 {id="track-memory-consumption-on-apple-platforms"}

在 Apple 平台上调试内存问题时，您可以查看 Kotlin 代码预留了多少内存。Kotlin 的份额贴有标识符标签，可以通过 Xcode Instruments 中的 VM Tracker 等工具进行跟踪。

仅当满足以下*所有*条件时，该功能才可用于默认的 Kotlin/Native 内存分配器：

* **已启用标记 (Tagging)**。内存应标记有有效的标识符。Apple 建议使用 240 到 255 之间的数字；默认值为 246。

  如果您设置了 `kotlin.native.binary.mmapTag=0` Gradle 属性，则禁用标记。

* **使用 mmap 分配**。分配器应使用 `mmap` 系统调用将文件映射到内存中。

  如果您设置了 `kotlin.native.binary.disableMmap=true` Gradle 属性，则默认分配器使用 `malloc` 而不是 `mmap`。

* **已启用分页**。应启用分配的分页（缓冲）。

  如果您设置了 [`kotlin.native.binary.pagedAllocator=false`](#disable-allocator-paging) Gradle 属性，则内存将改为按对象预留。

### 调整内存消耗 {id="adjust-memory-consumption"}

如果您遇到意外的高内存消耗，请尝试以下解决方案：

#### 更新 Kotlin {id="update-kotlin"}

将 Kotlin 更新到最新版本。我们一直在改进内存管理器，因此即使是简单的编译器更新也可能改善内存消耗。

#### 禁用分配器分页 {id="disable-allocator-paging"}
<primary-label ref="experimental-opt-in"/>

您可以禁用分配的分页（缓冲），以便内存分配器按对象预留内存。在某些情况下，这可能有助于您满足严格的内存限制或减少应用启动时的内存消耗。

为此，请在您的 `gradle.properties` 文件中设置以下选项：

```none
kotlin.native.binary.pagedAllocator=false
```

> 禁用分配器分页后，将无法[在 Apple 平台上跟踪内存消耗](#track-memory-consumption-on-apple-platforms)。
> 
{style="note"}

#### 启用 Latin-1 字符串支持 {id="enable-support-for-latin-1-strings"}
<primary-label ref="experimental-opt-in"/>

默认情况下，Kotlin 中的字符串使用 UTF-16 编码存储，其中每个字符由两个字节表示。在某些情况下，这会导致字符串在二进制文件中占用的空间是源代码中的两倍，读取数据占用的内存也是两倍。

要减小应用的二进制文件大小并调整内存消耗，您可以启用对 Latin-1 编码字符串的支持。[Latin-1 (ISO 8859-1)](https://en.wikipedia.org/wiki/ISO/IEC_8859-1) 编码仅用一个字节表示前 256 个 Unicode 字符中的每一个。

要启用它，请在您的 `gradle.properties` 文件中设置以下选项：

```none
kotlin.native.binary.latin1Strings=true
```

通过 Latin-1 支持，只要所有字符都在其范围内，字符串就会以 Latin-1 编码存储。否则，将使用默认的 UTF-16 编码。

> 虽然该功能处于实验性阶段，但 cinterop 扩展函数 [`String.pin`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlinx.cinterop/pin.html)、[`String.usePinned`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlinx.cinterop/use-pinned.html) 和 [`String.refTo`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlinx.cinterop/ref-to.html) 的效率会降低。每次调用它们都可能触发字符串自动转换为 UTF-16。
> 
{style="note"}

如果这些选项都没有帮助，请在 [YouTrack](https://kotl.in/issue) 中创建一个问题。

## 在后台运行单元测试 {id="unit-tests-in-the-background"}

在单元测试中，没有任何机制处理主线程队列，因此除非已将其模拟 (mock)，否则不要使用 `Dispatchers.Main`。可以通过调用 `kotlinx-coroutines-test` 中的 `Dispatchers.setMain` 来完成模拟。

如果您不依赖 `kotlinx.coroutines`，或者由于某种原因 `Dispatchers.setMain` 对您不起作用，请尝试以下实现测试启动器的变通方法：

```kotlin
package testlauncher

import platform.CoreFoundation.*
import kotlin.native.concurrent.*
import kotlin.native.internal.test.*
import kotlin.system.*

fun mainBackground(args: Array<String>) {
    val worker = Worker.start(name = "main-background")
    worker.execute(TransferMode.SAFE, { args.freeze() }) {
        val result = testLauncherEntryPoint(it)
        exitProcess(result)
    }
    CFRunLoopRun()
    error("CFRunLoopRun 永远不应返回")
}
```
{initial-collapse-state="collapsed" collapsible="true"}

然后，使用 `-e testlauncher.mainBackground` 编译器选项编译测试二进制文件。

## 下一步 {id="what-s-next"}

* [从旧版内存管理器迁移](native-migration-guide.md)
* [查看与 Swift/Objective-C ARC 集成的具体细节](native-arc-integration.md)