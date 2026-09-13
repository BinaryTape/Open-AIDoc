[//]: # (title: 定义文件)

Kotlin/Native 允许您使用 C 和 Objective-C 库，让您能够在 Kotlin 中使用它们的功能。
一个名为 `cinterop` 的特殊工具可以处理 C 或 Objective-C 库并生成相应的 Kotlin 绑定，
以便像往常一样在您的 Kotlin 代码中使用该库的方法。

为了生成这些绑定，每个库都需要一个定义文件，通常与库同名。
这是一个描述如何使用该库的属性文件。请参阅完整的[可用属性列表](#属性)。

以下是项目开发中的一般工作流程：

1. 创建一个 `.def` 文件，描述绑定中要包含的内容。
2. 在 Kotlin 代码中使用生成的绑定。
3. 运行 Kotlin/Native 编译器以生成最终的可执行文件。

## 创建并配置定义文件 {id="create-and-configure-a-definition-file"}

让我们为一个 C 库创建一个定义文件并生成绑定：

1. 在您的 IDE 中，选择 `src` 文件夹，并通过 **File | New | Directory** 创建一个新目录。
2. 将新目录命名为 `nativeInterop/cinterop`。
   
   这是 `.def` 文件位置的默认约定，但如果您使用其他位置，可以在 `build.gradle.kts` 文件中进行覆盖。
3. 选择该新子文件夹，并通过 **File | New | File** 创建一个 `png.def` 文件。
4. 添加必要的属性：

   ```none
   headers = png.h
   headerFilter = png.h
   package = png
   
   compilerOpts.linux = -I/usr/include -I/usr/include/x86_64-linux-gnu
   linkerOpts.osx = -L/opt/local/lib -L/usr/local/opt/png/lib -lpng
   linkerOpts.linux = -L/usr/lib/x86_64-linux-gnu -lpng
   ```

   * `headers` 是要为其生成 Kotlin 存根的头文件列表。您可以在此条目中添加多个文件，
     每个文件之间用空格分隔。在本例中，只有 `png.h`。引用的文件需要位于
     指定的路径上（在本例中为 `/usr/include/png`）。
   * `headerFilter` 显示具体包含的内容。在 C 语言中，当一个文件通过 `#include` 指令引用
     另一个文件时，所有的头文件也会被包含。有时这并非必要，您可以
     [使用 glob 模式](https://en.wikipedia.org/wiki/Glob_(programming))添加此参数来进行调整。

     如果您不想将外部依赖项（如系统 `stdint.h` 头文件）提取到
     互操作库中，可以使用 `headerFilter`。此外，它对于库大小优化以及修复系统与
     提供的 Kotlin/Native 编译环境之间潜在的冲突也很有用。

   * 如果需要修改特定平台的行为，您可以使用 `compilerOpts.osx` 或
     `compilerOpts.linux` 之类的格式为选项提供特定于平台的值。在本例中，它们是 macOS
     （`.osx` 后缀）和 Linux（`.linux` 后缀）。也可以使用不带后缀的参数
     （例如 `linkerOpts=`），这些参数将应用于所有平台。

5. 要生成绑定，请点击通知中的 **Sync Now** 来同步 Gradle 文件。

   ![同步 Gradle 文件](gradle-sync.png)

生成绑定后，IDE 可以将它们用作原生库的代理视图。

> 您还可以通过在命令行中使用 [cinterop 工具](#使用命令行生成绑定)来配置绑定生成。
> 
{style="tip"}

## 属性 {id="properties"}

以下是您可以在定义文件中使用的完整属性列表，用于调整生成的二进制文件的内容。
有关更多信息，请参阅下文的相应章节。

| **属性**                                                                        | **描述**                                                                                                                                                                                                          |
|-------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`headers`](#导入头文件)                                                        | 要包含在绑定中的库头文件列表。                                                                                                                                                       |
| [`modules`](#导入模块)                                                        | 要包含在绑定中的 Objective-C 库的 Clang 模块列表。                                                                                                                                    |
| `language`                                                                          | 指定语言。默认使用 C；如有必要，请更改为 `Objective-C`。                                                                                                                                      |
| [`compilerOpts`](#传递编译器和链接器选项)                                 | `cinterop` 工具传递给 C 编译器的编译器选项。                                                                                                                                                        |
| [`linkerOpts`](#传递编译器和链接器选项)                                   | `cinterop` 工具传递给链接器的链接器选项。                                                                                                                                                              |
| [`excludedFunctions`](#忽略特定函数)                                   | 应该忽略的空格分隔的函数名称列表。                                                                                                                                                         |                                              
| [`staticLibraries`](#包含静态库)                                      | [实验性](components-stability.md#stability-levels-explained)。将静态库包含到 `.klib` 中。                                                                                                              |
| [`libraryPaths`](#包含静态库)                                         | [实验性](components-stability.md#stability-levels-explained)。`cinterop` 工具在其中搜索要包含在 `.klib` 中的库的空格分隔的目录列表。                                    |
| [`package`](#设置包名)                                                  | 生成的 Kotlin API 的包前缀。                                                                                                                                                                             |
| [`headerFilter`](#通过-glob-筛选头文件)                                          | 通过 glob 筛选头文件，并在导入库时仅包含它们。                                                                                                                                                |
| [`excludeFilter`](#排除头文件)                                                 | 导入库时排除特定的头文件，优先级高于 `headerFilter`。                                                                                                                               |
| [`strictEnums`](#配置枚举生成)                                        | 应该作为 [Kotlin 枚举](enum-classes.md)生成的空格分隔的枚举列表。                                                                                                                             |
| [`nonStrictEnums`](#配置枚举生成)                                     | 应该作为整数值生成的空格分隔的枚举列表。                                                                                                                                             |
| [`noStringConversion`](#设置字符串转换)                                   | 空格分隔的函数列表，这些函数的 `const char*` 形参不应自动转换为 Kotlin `String`。                                                                                                     |
| `allowedOverloadsForCFunctions`                                                     | 默认情况下，假定 C 函数具有唯一的名称。如果多个函数同名，则仅选取一个。但是，您可以通过在 `allowedOverloadsForCFunctions` 中指定这些函数来更改此行为。 |
| [`disableDesignatedInitializerChecks`](#允许调用非指定初始化器) | 禁用编译器检查，该检查不允许将非指定的 Objective-C 初始化器作为 `super()` 构造函数调用。                                                                                              |
| [`foreignExceptionMode`](#处理-objective-c-异常)                            | 将来自 Objective-C 代码的异常包装为 `ForeignException` 类型的 Kotlin 异常。                                                                                                                          |
| [`userSetupHint`](#帮助解决链接器错误)                                      | 添加自定义消息，例如帮助用户解决链接器错误。                                                                                                                                                 |

<!-- | `excludedMacros`                                                                    |                                                                                                                                                                                                                          |
| `objcClassesIncludingCategories`                                                    |                                                                                                                                                                                                                          | -->

除了属性列表之外，您还可以在定义文件中包含[自定义声明](#添加自定义声明)。

### 导入头文件 {id="import-headers"}

如果 C 库没有 Clang 模块，而是由一组头文件组成，请使用 `headers` 属性指定应导入的头文件：

```none
headers = curl/curl.h
```

#### 通过 glob 筛选头文件 {id="filter-headers-by-globs"}

您可以使用 `.def` 文件中的筛选属性通过 glob 筛选头文件。要包含头文件中的声明，
请使用 `headerFilter` 属性。如果头文件与任何 glob 匹配，其声明就会包含在绑定中。

Glob 应用于相对于相应 include 路径元素的头文件路径，
例如 `time.h` 或 `curl/curl.h`。因此，如果库通常使用 `#include <SomeLibrary/Header.h>` 包含，
您可能可以使用以下筛选器来筛选头文件：

```none
headerFilter = SomeLibrary/**
```

如果未提供 `headerFilter`，则包含所有头文件。但是，我们鼓励您使用 `headerFilter`
并尽可能精确地指定 glob。在这种情况下，生成的库仅包含必要的声明。
这有助于避免在升级开发环境中的 Kotlin 或工具时出现各种问题。

#### 排除头文件 {id="exclude-headers"}

要排除特定的头文件，请使用 `excludeFilter` 属性。这对于删除冗余或有问题的
头文件并优化编译很有帮助，因为指定头文件中的声明不会包含在绑定中：

```none
excludeFilter = SomeLibrary/time.h
```

> 如果同一个头文件既被 `headerFilter` 包含，又被 `excludeFilter` 排除，则指定的头文件
> 将不会包含在绑定中。
>
{style="note"}

### 导入模块 {id="import-modules"}

如果 Objective-C 库具有 Clang 模块，请使用 `modules` 属性指定要导入的模块：

```none
modules = UIKit
```

### 设置包名 {id="set-the-package-name"}

使用 `package` 属性为生成的 Kotlin API 指定包前缀：

```none
package = png
```

如果未指定此属性，编译器将在根包中生成声明。

> `kotlin` 和 `kotlinx.cinterop` 名称已被保留，不能用作包前缀。
>
{style="note"}

### 传递编译器和链接器选项 {id="pass-compiler-and-linker-options"}

使用 `compilerOpts` 属性向 C 编译器传递选项，该编译器在后台用于分析头文件。
要向链接器（用于链接最终的可执行文件）传递选项，请使用 `linkerOpts`。例如：

```none
compilerOpts = -DFOO=bar
linkerOpts = -lpng
```

您还可以指定仅适用于特定目标的特定于目标的选项：

```none
compilerOpts = -DBAR=bar
compilerOpts.linux_x64 = -DFOO=foo1
compilerOpts.macos_x64 = -DFOO=foo2
```

通过此配置，在 Linux 上使用 `-DBAR=bar -DFOO=foo1` 分析头文件，在 macOS 上
使用 `-DBAR=bar -DFOO=foo2` 分析。请注意，任何定义文件选项都可以同时具有通用部分和特定于平台的部分。

### 忽略特定函数 {id="ignore-specific-functions"}

使用 `excludedFunctions` 属性指定应忽略的函数名称列表。如果头文件中声明的
函数不能保证是可调用的，并且很难或不可能自动确定这一点，则此属性非常有用。
您还可以使用此属性来解决互操作本身中的错误。

### 包含静态库 {id="include-a-static-library"}

<primary-label ref="experimental-general"/>

有时，随产品附带静态库比假设用户环境中已有该库更为方便。
要将静态库包含到 `.klib` 中，请使用 `staticLibrary` 和 `libraryPaths` 属性：

```none
headers = foo.h
staticLibraries = libfoo.a
libraryPaths = /opt/local/lib /usr/local/opt/curl/lib
```

给定上述代码片段时，`cinterop` 工具会在 `/opt/local/lib` 和 `/usr/local/opt/curl/lib` 中搜索 `libfoo.a`，
如果找到，则将库二进制文件包含在 `klib` 中。

在程序中使用这样的 `klib` 时，库会自动链接。

### 配置枚举生成 {id="configure-enums-generation"}

使用 `strictEnums` 属性将枚举生成为 Kotlin 枚举，或使用 `nonStrictEnums` 将其生成为整数值。
如果枚举未包含在这些列表中的任何一个中，则根据启发式方法生成它。

### 设置字符串转换 {id="set-up-string-conversion"}

使用 `noStringConversion` 属性禁用将 `const char*` 函数形参自动转换为 Kotlin `String`。

### 允许调用非指定初始化器 {id="allow-calling-a-non-designated-initializer"}

默认情况下，Kotlin/Native 编译器不允许将非指定的 Objective-C 初始化器作为 `super()`
构造函数调用。如果库中未正确标记指定的 Objective-C 初始化器，此行为可能会带来不便。
要禁用这些编译器检查，请使用 `disableDesignatedInitializerChecks` 属性。

### 处理 Objective-C 异常 {id="handle-objective-c-exceptions"}

默认情况下，如果 Objective-C 异常达到 Objective-C 与 Kotlin 互操作边界并进入
Kotlin 代码，程序将会崩溃。

要将 Objective-C 异常传播到 Kotlin，请通过 `foreignExceptionMode = objc-wrap` 属性启用包装。
在这种情况下，Objective-C 异常会被转换为获得 `ForeignException` 类型的 Kotlin 异常。

### 帮助解决链接器错误 {id="help-resolve-linker-errors"}

当 Kotlin 库依赖于 C 或 Objective-C 库时（例如使用
[CocoaPods 集成](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-overview.html)），可能会发生链接器错误。如果依赖库未在本地计算机上安装或未在项目构建脚本中显式配置，
则会出现 "Framework not found" 错误。

如果您是库作者，您可以通过自定义消息帮助您的用户解决链接器错误。
为此，请在 `.def` 文件中添加 `userSetupHint=message` 属性，或将 `-Xuser-setup-hint` 编译器选项
传递给 `cinterop`。

### 添加自定义声明 {id="add-custom-declarations"}

有时需要在生成绑定之前向库中添加自定义 C 声明（例如用于[宏](native-c-interop.md#macros)）。
无需为这些声明创建额外的头文件，您可以直接将它们包含在 `.def` 文件的末尾，
放在仅包含分隔符序列 `---` 的分隔行之后：

```none
headers = errno.h
---

static inline int getErrno() {
    return errno;
}
```

请注意，`.def` 文件的这一部分被视为头文件的一部分，因此带有主体的函数应声明为 `static`。
这些声明在包含 `headers` 列表中的文件之后进行解析。

## 使用命令行生成绑定 {id="generate-bindings-using-command-line"}

除了定义文件之外，您还可以通过在 `cinterop` 调用中将相应属性作为选项传递来指定绑定中包含的内容。

以下是生成 `png.klib` 编译库的命令示例：

```bash
cinterop -def png.def -compiler-option -I/usr/local/include -o png
```

请注意，生成的绑定通常是特定于平台的，因此如果您正在针对多个目标进行开发，
则需要重新生成绑定。

* 对于未包含在 sysroot 搜索路径中的主机库，可能需要头文件。
* 对于具有配置脚本的典型 UNIX 库，`compilerOpts` 可能包含带有 `--cflags` 选项的
  配置脚本的输出（可能没有确切路径）。
* 带有 `--libs` 的配置脚本输出可以传递给 `linkerOpts` 属性。

## 下一步 {id="what-s-next"}

* [C 互操作性绑定](native-c-interop.md#bindings)
* [与 Swift/Objective-C 的互操作性](native-objc-interop.md)