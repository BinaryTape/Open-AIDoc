[//]: # (title: 调试 Kotlin/Native)

Kotlin/Native 编译器可以生成带有调试信息的二进制文件，还可以创建用于[符号化崩溃报告](#debug-ios-applications)的调试符号文件。

这些调试信息与 [DWARF 2](https://dwarfstd.org/download.html) 规范兼容，因此现代调试器工具（如 LLDB 和 GDB）可以：

* [设置断点](#set-breakpoints)
* [使用逐步执行](#use-stepping)
* [检查变量和类型信息](#inspect-variables)

> 支持 DWARF 2 规范意味着调试器工具会将 Kotlin 识别为 C89，因为在 DWARF 5 规范之前，该规范中没有 Kotlin 语言类型的标识符。
>
{style="note"}

## 生成带有调试信息的二进制文件

在 IntelliJ IDEA、Android Studio 或 Xcode 中进行调试时，会自动生成带有调试信息的二进制文件（除非构建配置另有设置）。

您可以通过以下方式手动启用调试并产出包含调试信息的二进制文件：

* **使用 Gradle 任务**。要获取调试二进制文件，请使用 `linkDebug*` Gradle 任务，例如：

  ```bash
  ./gradlew linkDebugFrameworkNative
  ```

  这些任务根据二进制文件类型（例如 `linkDebugSharedNative`）或您的目标（例如 `linkDebugExecutableMacosArm64`）而有所不同。

* **使用命令行编译器**。在命令行中，使用 `-g` 选项编译您的 Kotlin/Native 二二进制文件：

  ```bash
  kotlinc-native hello.kt -g -o terminator
  ```

然后启动您的调试器工具。例如：

```bash
lldb terminator.kexe
```

调试器输出：

```bash
$ cat - > hello.kt
fun main(args: Array<String>) {
  println("Hello world")
  println("I need your clothes, your boots and your motorcycle")
}
$ dist/bin/konanc -g hello.kt -o terminator
KtFile: hello.kt
$ lldb terminator.kexe
(lldb) target create "terminator.kexe"
Current executable set to 'terminator.kexe' (x86_64).
(lldb) b kfun:main(kotlin.Array<kotlin.String>)
Breakpoint 1: where = terminator.kexe`kfun:main(kotlin.Array<kotlin.String>) + 4 at hello.kt:2, address = 0x00000001000012e4
(lldb) r
Process 28473 launched: '/Users/minamoto/ws/.git-trees/debugger-fixes/terminator.kexe' (x86_64)
Process 28473 stopped
* thread #1, queue = 'com.apple.main-thread', stop reason = breakpoint 1.1
    frame #0: 0x00000001000012e4 terminator.kexe`kfun:main(kotlin.Array<kotlin.String>) at hello.kt:2
   1    fun main(args: Array<String>) {
-> 2      println("Hello world")
   3      println("I need your clothes, your boots and your motorcycle")
   4    }
(lldb) n
Hello world
Process 28473 stopped
* thread #1, queue = 'com.apple.main-thread', stop reason = step over
    frame #0: 0x00000001000012f0 terminator.kexe`kfun:main(kotlin.Array<kotlin.String>) at hello.kt:3
   1    fun main(args: Array<String>) {
   2      println("Hello world")
-> 3      println("I need your clothes, your boots and your motorcycle")
   4    }
(lldb)
```

## 设置断点

现代调试器提供了多种设置断点的方法。以下是各工具的具体说明：

### LLDB

* 按名称设置：

  ```bash
  (lldb) b -n kfun:main(kotlin.Array<kotlin.String>)
  Breakpoint 4: where = terminator.kexe`kfun:main(kotlin.Array<kotlin.String>) + 4 at hello.kt:2, address = 0x00000001000012e4
  ```

  `-n` 是可选的，默认会应用该选项。

* 按位置（文件名、行号）设置：

  ```bash
  (lldb) b -f hello.kt -l 1
  Breakpoint 1: where = terminator.kexe`kfun:main(kotlin.Array<kotlin.String>) + 4 at hello.kt:2, address = 0x00000001000012e4
  ```

* 按地址设置：

  ```bash
  (lldb) b -a 0x00000001000012e4
  Breakpoint 2: address = 0x00000001000012e4
  ```

* 按正则表达式设置。在调试生成的构件（例如名称中带有 `#` 符号的 lambda表达式）时，您可能会发现这很有用：

  ```bash
  (lldb) b -r main\(
  3: regex = 'main\(', locations = 1
    3.1: where = terminator.kexe`kfun:main(kotlin.Array<kotlin.String>) + 4 at hello.kt:2, address = terminator.kexe[0x00000001000012e4], unresolved, hit count = 0
  ```

### GDB

* 按正则表达式设置：

  ```bash
  (gdb) rbreak main(
  Breakpoint 1 at 0x1000109b4
  struct ktype:kotlin.Unit &kfun:main(kotlin.Array<kotlin.String>);
  ```

* **不可以通过名称设置**，因为 `:` 是按位置设置断点时的分隔符：

  ```bash
  (gdb) b kfun:main(kotlin.Array<kotlin.String>)
  No source file named kfun.
  Make breakpoint pending on future shared library load? (y or [n]) y
  Breakpoint 1 (kfun:main(kotlin.Array<kotlin.String>)) pending
  ```

* 按位置设置：

  ```bash
  (gdb) b hello.kt:1
  Breakpoint 2 at 0x100001704: file /Users/minamoto/ws/.git-trees/hello.kt, line 1.
  ```

* 按地址设置：

  ```bash
  (gdb) b *0x100001704
  Note: breakpoint 2 also set at pc 0x100001704.
  Breakpoint 3 at 0x100001704: file /Users/minamoto/ws/.git-trees/hello.kt, line 2.
  ```

## 使用逐步执行

对函数进行逐步执行的操作与 C/C++ 程序基本相同。

## 检查变量

对 `var` 变量的检查对于原始类型和非原始类型都是开箱即用的：

```bash
$ cat -n main.kt
     1  fun main(args: Array<String>) {
     2      var x = 1
     3      var y = 2
     4      var p = Point(x, y)
     5      println("p = $p")
     6  }
     7 
     8  data class Point(val x: Int, val y: Int)

$ lldb ./program.kexe -o 'b main.kt:5' -o
(lldb) target create "./program.kexe"
Current executable set to './program.kexe' (x86_64).
(lldb) b main.kt:5
Breakpoint 1: where = program.kexe`kfun:main(kotlin.Array<kotlin.String>) + 289 at main.kt:5
(lldb) r
Process 4985 stopped
* thread #1, name = 'program.kexe', stop reason = breakpoint 1.1
    frame #0: program.kexe`kfun:main(kotlin.Array<kotlin.String>) at main.kt:5
   2        var x = 1
   3        var y = 2
   4        var p = Point(x, y)
-> 5        println("p = $p")
   6    }
   7   
   8    data class Point(val x: Int, val y: Int)

Process 4985 launched: './program.kexe' (x86_64)
(lldb) fr var
(int) x = 1
(int) y = 2
(ObjHeader *) p = Point(x=1, y=2)

(lldb) v p->x
(int32_t) p->x = 1
```

## 调试 iOS 应用程序

调试 iOS 应用程序有时涉及详细分析崩溃报告。崩溃报告通常需要符号化，即将内存地址转换为可读的源代码位置的过程。

要符号化 Kotlin 代码中的地址（例如，对应于 Kotlin 代码的堆栈跟踪元素），您需要一个特殊的调试符号 (`.dSYM`) 文件。该文件将崩溃报告中的内存地址与源代码中的实际位置（如函数或行号）进行映射。

Kotlin/Native 编译器默认会为 Apple 平台上的发布（优化的）二进制文件生成 `.dSYM` 文件。在 Xcode 中构建时，IDE 会在标准位置查找 `.dSYM` 文件，并自动将其用于符号化。Xcode 会自动检测从 IntelliJ IDEA 模板创建的项目中的 `.dSYM` 文件。

在其他平台上，您可以使用 `-Xadd-light-debug` 编译器选项将调试信息添加到生成的二进制文件中（这会增加文件大小）：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    targets.withType<org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget> {
        binaries.all {
            freeCompilerArgs += "-Xadd-light-debug=enable"
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    targets.withType(org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget) {
        binaries.all {
            freeCompilerArgs += "-Xadd-light-debug=enable"
        }
    }
}
```

</tab>
</tabs>

有关崩溃报告的更多信息，请参阅 [Apple 文档](https://developer.apple.com/documentation/xcode/diagnosing-issues-using-crash-reports-and-device-logs)。

## 已知问题

* Python 绑定的性能。
* 调试器工具中的表达式计算尚不支持，目前没有实现计划。

## 下一步

[了解如何改进 iOS 代码中未处理的 Kotlin 异常的崩溃报告](native-faq.md#how-do-i-get-better-crash-reports-for-ios)