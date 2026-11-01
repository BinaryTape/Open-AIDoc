---
title: 适用于 SDK 与库的 Koin
---

# 适用于 SDK 与库的 Koin

Koin Embedded 允许 SDK 和库开发者在不同的软件包名称下打包重定位版本的 Koin。这样一来，您的库在内部使用的 Koin 就不会与应用程序中其他任何地方使用的 Koin 发生冲突。本页面面向库作者。对于常规应用程序，请使用标准 Koin。

获取重定位的 Koin 有两种方式：自助方式（使用预构建构件或重定位脚本），或者 [Koin Embedded LTS](#koin-embedded-lts)（由 Kotzilla 作为[企业支持](/docs/support/#enterprise-support-by-kotzilla)的一部分，为您构建、签名、托管和维护专用版本）。

## 冲突问题 {id="the-conflict-problem"}

内部使用 Koin 的库会将 `org.koin.*` 作为其依赖图的一部分进行发布。这会带来两种冲突风险，而第二种往往会被忽略。

### 情况 1：与宿主应用程序冲突 {id="case-1-conflict-with-the-host-application"}

接入您 SDK 的应用程序也在使用 Koin，并且拥有其自身的发布计划：

```kotlin
// 您的 SDK 使用 Koin 3.5.6
implementation("io.insert-koin:koin-core:3.5.6")

// 使用者应用使用 Koin 4.2.2
implementation("io.insert-koin:koin-core:4.2.2")
// 冲突：Gradle 为两者解析同一个版本
```

这会导致的问题：

- **所有人共用一个版本**：Gradle 会为整个应用程序选择单一的 `org.koin` 版本，因此双方中总有一方运行在从未测试过的版本上。
- **运行时故障**：版本之间的 API 变更会在运行时发生中断错误。
- **强制升级**：您的 SDK 会强制其使用者升级 Koin，或者阻碍其升级。

### 情况 2：与其他 SDK 冲突 {id="case-2-conflict-with-other-sdks"}

您的 SDK 很少是应用程序中唯一的 SDK。如果另一个供应商的 SDK 也嵌入了 Koin，双方就会发生冲突，而且谁都无法控制对方的发布周期：

```kotlin
// 应用集成了两个 SDK，两者内部均使用 Koin
implementation("com.vendor-a:analytics-sdk:2.1.0")  // 嵌入了 Koin 3.5.6
implementation("com.vendor-b:payments-sdk:5.0.0")   // 嵌入了 Koin 4.2.2
// 同样的冲突，且链条中的任何一方都无法修复它
```

这就是为什么共享重定位命名空间还不够的原因。脱离 `org.koin.*` 并迁移到每个嵌入者共享的命名空间，只会转移冲突的发生地：重定位到相同目标的两个 SDK 依然会像以前一样发生冲突。您需要一个专属于您自己的命名空间。

## 软件包重定位 {id="package-relocation"}

重定位会将 Koin 的软件包重写到不同的命名空间中，并将其重新构建为一个独立的构件：

```kotlin
// 重定位前
import org.koin.core.module.dsl.singleOf
import org.koin.core.context.startKoin

// 重定位后
import acme.koin.core.module.dsl.singleOf
import acme.koin.core.context.startKoin
```

两个命名空间代表两组不同的类，因此它们可以并存而不会产生解析冲突：

```kotlin
// 您的 SDK 打包了自身重定位后的 Koin
implementation("io.insert-koin:acme-koin-core:3.5.6")

// 使用者应用使用标准 Koin
implementation("io.insert-koin:koin-core:4.2.2")
// 无冲突：两个独立的软件包
```

:::warning
请勿在常规应用程序开发中使用嵌入式 Koin。它专为需要避免依赖冲突的库作者（支付、分析或身份验证 SDK、共享内部库、第三方集成）而设计。
:::

## 预构建的嵌入式版本 {id="prebuilt-embedded-version"}

Kotzilla 维护了重定位到共享命名空间 `embedded.koin.*` 的预构建构件：`embedded-koin-core` 和 `embedded-koin-android`。访问权限按需提供：请联系 [Koin 团队](mailto:koin@kotzilla.io)。

:::warning
这些构件处于 Beta 阶段，并使用共享命名空间。它们仅供评估使用，不适用于已发布的 SDK。每个使用者都重定位到相同的 `embedded.koin.*` 命名空间，因此在一个应用程序中基于它们构建的两个 SDK 会像在 `org.koin.*` 上一样发生冲突（参见[情况 2](#case-2-conflict-with-other-sdks)）。可以使用它们来尝试重定位，或用于您能端到端控制的内部构建。若要向第三方交付 SDK，请使用[重定位脚本](#custom-relocation)自行重定位，或使用 [Koin Embedded LTS](#koin-embedded-lts)。
:::

## 自定义重定位 {id="custom-relocation"}

若要获得完全专属于您自己的命名空间，请使用重定位脚本自行重新构建 Koin。

:::warning
这些脚本是一项处于 Beta 阶段的计划，按原样提供，不提供维护保证。脚本下游的所有事务均由您自行承担：构建、验证、发布，以及在未来的每个 Koin 版本（包含安全修复）发布时重新构建。
:::

### 使用重定位脚本 {id="using-the-relocation-scripts"}

[koin-relocate](https://github.com/InsertKoinIO/koin-relocate) 项目提供了使用自定义软件包名称重新构建 Koin 的脚本。重定位由前缀驱动，该前缀同时应用于软件包和模块名称：

```
RELOCATION_PREFIX=acme   ->   org.koin.*  变为  acme.koin.*
                              koin-core   变为  acme-koin-core
```

步骤：

1. 克隆重定位脚本仓库：

   ```bash
   git clone https://github.com/InsertKoinIO/koin-relocate.git
   cd koin-relocate
   ```

2. 编辑 `relocate.properties` 以配置构建：

   ```properties
   RELOCATION_PREFIX=acme
   TARGET_KOIN_VERSION=3.5.6
   KOIN_MODULES=core/koin-core;android/koin-android
   BUILD_DIR=./build
   ```

   - `RELOCATION_PREFIX`：应用于软件包和模块名称的前缀。
   - `TARGET_KOIN_VERSION`：用于构建的 Koin 版本标签。
   - `KOIN_MODULES`：需要重定位的 Koin 模块。
   - `BUILD_DIR`：复制构建出的构件的目标目录。

3. 运行重定位。它会从源代码克隆并重新构建 Koin，并且需要 JDK 17 环境：

   ```bash
   ./relocate.sh
   ```

4. 从 `BUILD_DIR` 收集 `aar` 和 `jar` 构件。所有重定位后的模块也会安装到您的本地 Maven 仓库中，以便您在测试时立即可用。

5. 将它们发布到您自己的 Maven 仓库中，以供您的 SDK 构建使用。

有关详细说明，请参阅 [koin-relocate 仓库](https://github.com/InsertKoinIO/koin-relocate)。

### 自行托管涉及的工作 {id="what-self-hosting-involves"}

脚本可以帮助您完成第一次构建。但将重定位后的 Koin 作为交付 SDK 的依赖项来运行，是一项长期的投入。在投入之前，请了解其全貌：

- **Koin 的构建结构**：重定位会从源代码重新构建 Koin。您将继承其多模块 Gradle 设置、版本目录以及工具链要求，并且需要一个在 CI 中保持可复现的 JDK 17 环境。
- **远不止 package 语句**：在 Kotlin 源代码中重写 `org.koin` 是最简单的部分。资源以及诸如 `META-INF/services` 条目之类的声明式服务文件也包含完全限定名称。重写遗漏的任何内容都会在运行时失败，而不是在编译时。
- **Android 与多平台构件**：`koin-android` 会生成带有独立 Manifest 和使用者规则的 `aar` 构件。在 Kotlin Multiplatform 中，每个目标都会发布带有自身元数据的独立构件，并且重定位后的坐标必须在所有目标之间保持一致。
- **发布与签名**：脚本会在 `io.insert-koin` 组下生成带有前缀模块名称的构件，并安装到您的本地 Maven 仓库中。将其发布到您控制的仓库中即可满足内部使用。而公开发布则意味着需要承担使用者所期望的 POM 元数据、组所有权和签名，因为重定位后的 Koin 现在已成为您供应链的一部分。
- **验证等效性**：重定位后的构建必须与原版表现完全一致。Koin 自身的测试套件是针对 `org.koin` 运行的，因此对于您的 SDK 所使用的那部分 Koin，您需要自行确保解析、作用域界定和生命周期行为在重写后依然正常。
- **在每个 Koin 补丁上重复此过程**：您想要的每个上游版本（包括每个安全修复）都意味着需要重新运行重定位、重新构建、验证、签名并发布。一次性的重定位只是一个快照，从您创建它的那一天起就会逐渐过时。

这些都不能作为不自行托管的理由。但它们是让您深思熟虑后再作决定的理由，而不是在收到第三次安全公告时才发现其代价。

### Koin Annotations 与编译器插件 {id="koin-annotations-and-the-compiler-plugin"}

:::warning
重定位构建不支持 Koin Annotations 和 Koin 编译器插件。
:::

两者生成的代码都会直接引用 `org.koin`。这些代码是在编译时在您的项目中生成的，而此时重定位已经发生，因此它针对的是您重定位构建中不再提供的标准 Koin 软件包。脚本不会重定位生成的代码。

在重定位构建中，请使用 Constructor 或 Classic DSL（`module { }`、`single`、`factory`、`singleOf`、`factoryOf`）来声明您的模块。

## 自助方式的局限性 {id="limits-of-the-self-service-paths"}

除了 Beta 状态和共享命名空间的限制外，自助方式还存在以下局限：

- **不支持注解**：无法使用 Koin Annotations 和编译器插件。
- **支持模块有限**：并非所有 Koin 模块都能完全无误地重定位。
- **构建复杂性**：重定位意味着需要维护构建、验证和发布流水线。
- **维护成本**：Koin 的每一次更新（包括安全修复），都需要您自行重新重定位并发布。

最后一点永远无法避免，而这正是 Koin Embedded LTS 为您代劳之处。

## Koin Embedded LTS {id="koin-embedded-lts"}

Koin Embedded LTS 为您提供专属于您自己的 Koin LTS 版本，无冲突，且获得至少 18 个月的维护支持。它是 [Kotzilla 企业支持](/docs/support/#enterprise-support-by-kotzilla)的一部分。Kotzilla 会为您构建、签名、托管和维护专属的重定位 Koin，无需您自行运行脚本。

### 专属版本 {id="your-own-version"}

您将获得一个专供您使用、无其他人共享的专用命名空间。Kotzilla 从维护中的 Koin LTS 分支切出构建，将其重定位到您的命名空间，进行签名，并托管在面向您组织的私有仓库中。您只需添加一个 Maven 仓库，并依赖于您自己的重定位模块即可。

您无需运行重定位脚本、维护构建流水线或发布构件。

### 无冲突 {id="conflict-free"}

由于命名空间为您独享，因此对于宿主应用程序以及与您的 SDK 一同发布的任何其他 SDK 而言，无论它们运行哪个 Koin 版本、无论它们是否嵌入了 Koin，您的嵌入式 Koin 都是完全不可见的。两种自助方式都无法做到这一点：预构建构件在其所有用户之间共享同一个命名空间，而自行重定位的命名空间也仅在您持续打补丁期间保持隔离。

### 18 个月的维护支持 {id="18-months-of-maintenance"}

您的构建基于维护中的 LTS 分支，即[面向 Kotlin 1.x 的 Koin 3.5.6 或面向 Kotlin 2.x 的 Koin 4.2.x](/docs/support/#available-lts-lines)，自指定之日起享有至少 18 个月的维护支持。在您的订阅有效期内，针对您所发布的版本，支持将持续有效。

该分支上的每个补丁（包括安全向后移植）都会重新构建并发布到您的命名空间中。您只需接入自己构件的新版本，无需重新执行重定位。

### 范围 {id="scope"}

Koin Embedded LTS 涵盖 `koin-core` 和 `koin-android`。

入门指导包括将您迁移至 LTS 补丁级别。如果您目前使用的是该分支的较早版本，该迁移将作为初始设置的一部分进行，无需您先行完成。

:::note
Embedded LTS 仅从 LTS 分支进行构建。重定位任意 Koin 版本是一次性的：此类构件处于任何受维护的分支之外，因此没有可供重新构建的上游修复流。这就变成了无人打补丁的构件，而将未打补丁的 DI 框架编译进广泛分发的 SDK 中，正是本方案旨在防止的问题。只要您的订阅处于有效状态，LTS 分支就始终会有下一个补丁可供重定位。
:::

请参阅 kotzilla.io 上的 [Koin Embedded LTS](https://kotzilla.io/koin-lts)。

## SDK 开发实践 {id="sdk-development-practices"}

当 Koin 在您的 SDK 内部运行时：

- **保持 Koin 仅在内部使用**：它是您 SDK 的实现细节。
- **不要公开 Koin 类型**：避免将 `KoinComponent`、`Module` 以及其他 Koin 类型暴露在 SDK 的公共 API 中。
- **使用隔离实例**：使用 `koinApplication` 为您的 SDK 启动独立的 Koin 实例，绝不要使用全局的 `startKoin`。请参阅[上下文隔离](/docs/reference/koin-core/context-isolation)。
- **固定版本**：依赖精确的重定位版本，绝不要使用版本范围。
- **记录该依赖项**：在您的 SDK 文档中说明其内部使用了 Koin。

Koin 作为内部细节：

```kotlin
class PaymentSDK private constructor(context: Context) {

    companion object {
        private var instance: PaymentSDK? = null

        fun initialize(context: Context): PaymentSDK {
            return instance ?: PaymentSDK(context).also { instance = it }
        }
    }

    private val koinApp = koinApplication {
        androidContext(context)
        modules(paymentModule)
    }

    private val paymentService: PaymentService = koinApp.koin.get()

    fun processPayment(amount: Double): PaymentResult {
        return paymentService.process(amount)
    }
}
```

避免在公共 API 中公开 Koin：

```kotlin
// 不要这样做：KoinComponent 和 get() 会泄漏到公共 API 中
class PaymentSDK : KoinComponent {
    fun getPaymentService(): PaymentService = get()
}
```

在您的 SDK 文档中，声明该内部依赖项：

```markdown
## Dependencies

This SDK uses Koin internally (embedded version) for dependency injection.
The embedded version is isolated and will not conflict with Koin usage
in your application.

Internal dependency: `io.insert-koin:acme-koin-core:3.5.6`
Package namespace: `acme.koin.*`
```

## 将 SDK 迁移到重定位的 Koin {id="moving-an-sdk-to-a-relocated-koin"}

1. **替换依赖项**：将 `io.insert-koin:koin-core` 替换为您的重定位坐标，例如 `io.insert-koin:acme-koin-core`。
2. **更新导入语句**：将 `import org.koin` 替换为 `import acme.koin`。
3. **使用 DSL 替换注解**：如果您的 SDK 使用了 Koin Annotations 或编译器插件，请使用 Constructor 或 Classic DSL 重写这些声明。请参阅 [Koin Annotations 与编译器插件](#koin-annotations-and-the-compiler-plugin)。
4. **在真实的部署环境中进行测试**：在同样使用标准 Koin 的应用程序中进行测试，如果您的 SDK 会遇到其他嵌入 Koin 的 SDK，也要与其并存进行测试。

回滚过程正好相反：恢复标准的 `koin-*` 坐标和 `org.koin` 导入语句即可。

## 故障排除 {id="troubleshooting"}

### 无法解析重定位构件 {id="the-relocated-artifact-can-t-be-resolved"}

```
Could not find io.insert-koin:acme-koin-core:3.5.6
```

检查重定位构件是否已发布，以及发布该构件的仓库是否已在消费端构建中声明：

```kotlin
repositories {
    maven("https://maven.acme.com/releases")  // 无论您发布到何处
}
```

### 运行时出现 ClassNotFoundException {id="classnotfoundexception-at-runtime"}

检查您是否在所有地方都使用了重定位后的软件包名称：

```kotlin
// 错误
import org.koin.core.context.startKoin

// 正确
import acme.koin.core.context.startKoin
```

如果缺失的类仅在资源或 `META-INF/services` 条目中被引用，说明重定位遗漏了非源代码引用。请检查这些文件是否也包含重定位后的名称。

### 依然存在版本冲突 {id="version-conflicts-remain"}

请勿在同一个模块中混用标准 Koin 与重定位后的 Koin：

```kotlin
// 不要混用
implementation("io.insert-koin:koin-core:3.5.6")       // 标准
implementation("io.insert-koin:acme-koin-core:3.5.6")  // 重定位

// 仅使用您重定位后的构建
implementation("io.insert-koin:acme-koin-core:3.5.6")
```

### 与另一个嵌入 Koin 的 SDK 发生冲突 {id="conflict-with-another-sdk-that-embeds-koin"}

双方都重定位到了相同的命名空间，极大概率是双方都使用了预构建的 `embedded.koin.*` 构件。其中一方需要拥有专属的命名空间：自行对其进行重定位，或使用 [Koin Embedded LTS](#koin-embedded-lts)。

## 反馈 {id="feedback"}

对于自助方式（预构建构件和重定位脚本）：

- **问题反馈**：[koin-relocate GitHub issues](https://github.com/InsertKoinIO/koin-relocate/issues)
- **答疑讨论**：[Kotlin Slack #koin](https://kotlinlang.slack.com/messages/koin/)
- **电子邮件**：[koin@kotzilla.io](mailto:koin@kotzilla.io)

## 相关内容 {id="related"}

- [版本、路线图与支持](/docs/support/)：LTS 分支以及 Kotzilla 企业支持。
- [上下文隔离](/docs/reference/koin-core/context-isolation)：在库内部运行私有 Koin 实例。
- [启动 Koin](/docs/reference/koin-core/starting-koin)：`startKoin` 与 `koinApplication`。
- [koin-relocate](https://github.com/InsertKoinIO/koin-relocate)：重定位脚本及其文档。
- [Koin Embedded LTS](https://kotzilla.io/koin-lts)：专属于您的、受维护且无冲突的 Koin。