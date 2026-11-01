---
title: 版本、路线图与支持
---

# 版本、路线图与支持

本页介绍了 Koin 版本如何编号与发布，以及各个版本所提供的支持。Koin 是一款开源且由社区驱动的框架。构建 Koin 的 Kotzilla 公司还为有需要的团队提供商业化的长期支持（LTS）。

## 发布周期 {id="release-cycle"}

Koin 遵循约 6 个月的发布周期，以与 Kotlin 语言和库的更新保持同步。每个版本都会经历 6 周或更长时间的 beta 阶段以收集反馈。

版本一旦发布，其社区支持阶段至少持续 6 个月。在此阶段，团队会收集反馈并跟踪影响 Koin 的各项更新：Kotlin、Android、Ktor 以及其他库。

有关各版本所做的变更，请参阅[发布版本与升级指南](/docs/support/releases)。

## 版本号 {id="version-numbers"}

Koin 版本遵循 `Major.Minor.Patch`（主版本号.次版本号.修订版本号）规范：

- **Patch**：仅包含修复，以及依赖库的次要更新。
- **Minor**：新功能与弃用项。
- **Major**：具有重大影响的新功能、弃用项和破坏性变更。

预发布后缀（alpha、beta、RC）以及 `@KoinExperimentalAPI` 和 `@Deprecated` 的含义详见 [API 稳定性](/docs/support/api-stability)。

## 社区支持 {id="community-support"}

当前发布版本线面向所有人提供社区支持：

- **GitHub Issues**：在 [github.com/InsertKoinIO/koin](https://github.com/InsertKoinIO/koin) 上提交错误报告和功能请求。
- **文档**：即本站点 [insert-koin.io](https://insert-koin.io)。
- **Slack**：在 [Kotlin Slack #koin](https://kotlinlang.slack.com/messages/koin/) 上参与社区讨论。
- **Stack Overflow**：带有 [koin](https://stackoverflow.com/questions/tagged/koin) 标签的提问。
- **发布说明**：[发布版本](/docs/support/releases)中的升级指南。

## Kotzilla 提供的企业级支持 {id="enterprise-support-by-kotzilla"}

出于法律、业务或技术原因，某些企业无法紧跟 Koin 的发布周期。他们可能还需要企业级支持保障以及明确的开源许可证保证。

Kotzilla 为此提供了两种企业订阅。两者的运作机制相同：您将获得一个私有维护的 Koin 构建版本，并锁定在您掌控的版本上；修复程序将直接分发到该构建中，而不仅仅分发到最新的公共版本中。

- **[Koin LTS](#long-term-support-lts)**：针对必须保持在固定版本的应用程序，提供在 `org.koin.*` 下发布的受维护 Koin 版本线。
- **[Koin Embedded LTS](#koin-embedded-lts)**：面向 SDK 和库供应商。为您量身定制的专属 Koin LTS 版本，已被重定位到专属的独立命名空间中。

专业的 Koin 支持以 LTS 或 Embedded LTS 订阅形式签约，其上不再设立单独的层级。SLA、架构审查和培训等承诺均作为该订阅的[附加服务](#add-on-services)。

### 长期支持（LTS） {id="long-term-support-lts"}

LTS 版本线是指在社区支持阶段结束后，Kotzilla 仍继续维护的 Koin 版本。安全修复和客户报告的问题修复都会反向移植到该版本中并发布给订阅者，因此您可以稳定留在某个版本上，而无需承受已知缺陷的风险。

支持策略如下：

- **最短期限**：每条 LTS 版本线自指定之日起保证至少提供 18 个月的支持。这是底线，而非固定排期。
- **覆盖范围**：只要您的订阅有效，即使超出上述期限，您所运行的版本也将继续获得支持。这 18 个月限制的是指定并维护某条版本线的承诺。您的支持覆盖范围由合同决定，而非本页公布的日期。
- **新版本线**：每个主要的 Kotlin 基线都会指定一条新的 LTS 版本线，提供从上一条版本线升级的指导，确保支持无缝衔接。在迁移过程中，您绝不会处于没有支持的状态。

本页不公布支持终止日期。支持覆盖情况视您的订阅以及所运行的版本而定，并在您的协议中予以说明。

#### 可用的 LTS 版本线 {id="available-lts-lines"}

这两条版本线是并行维护的，而非先后更迭。请选择与您项目的 Kotlin 基线相匹配的一条。您无需从 `3.5.6` 迁出即可获得支持。

| LTS 版本线 | Kotlin 基线 | 适用对象 |
|----------|-----------------|--------------|
| Koin 3.5.6 LTS | Kotlin 1.x | 无法迁移到 Kotlin 2.x 的项目：旧版工具链、长期运行的企业级应用、受限的构建环境 |
| Koin 4.2.x LTS | Kotlin 2.x | 采用 Kotlin 2.x 工具链，希望使用固定且受维护的 Koin 版本而非追踪每个发布版本的项目 |

:::note
LTS 版本线是在特定的补丁级别上指定的，且该补丁级别为最低要求：`3.5.6` 是 Kotlin 1.x 版本线上受支持的最低版本。低于该版本的构建不包含在支持范围内。如果您目前使用的是较早的补丁版本，升级至 LTS 补丁级别是入门流程的一部分。
:::

从 Kotlin 1.x 版本线升级到 Kotlin 2.x 版本线已包含在该方案中。Koin 团队会对此提供指导，且在迁移期间您当前的版本线仍将享受支持保障。

#### 包含内容 {id="what-s-included"}

- **维护与兼容性**：保持与 Android 和 Kotlin 生态系统的功能兼容性，并在您运行的 LTS 版本线上进行维护。
- **支持**：通过 Slack 和专属电子邮件获得优先联系 Koin 团队的权限。
- **法律合规性**：经过审计的 Apache 2.0 许可证，Kotzilla 对您的合规性负责。
- **透明度**：完全开放代码库访问权限，并将社区确认的修复集成到您的版本线中。

### Koin Embedded LTS {id="koin-embedded-lts"}

如果您分发的 SDK 或库内部使用了 Koin，在 `org.koin.*` 下发布会导致与宿主应用程序的 Koin 版本产生冲突，并与该宿主应用中同样内嵌了 Koin 的其他 SDK 产生冲突。

Koin Embedded LTS 解决了这一问题：为您提供专属的 Koin LTS 版本，无冲突风险，且维护至少 18 个月。Kotzilla 将受维护的 [LTS 版本线](#available-lts-lines)重定位到您专有的独立命名空间中，然后为您完成构建、签名、托管和维护。支持范围涵盖 `koin-core` 和 `koin-android`。

此外，还有一种免费的自助方式来获取重定位后的 Koin，但权衡取舍有所不同。[适用于 SDK 与库的 Koin](/docs/support/embedded) 涵盖了这两方面内容：冲突场景、自助方案以及[完整的 Embedded LTS 方案](/docs/support/embedded#koin-embedded-lts)。

### 支持层级 {id="support-tiers"}

| | 社区支持 | Koin LTS | Koin Embedded LTS |
|---|---|---|---|
| 目标受众 | 所有人：应用、开源项目、紧跟当前发布版本的团队 | 必须保持在固定 Koin 版本的企业 | 在自身构件中附带分发 Koin 的 SDK 与库供应商 |
| 交付版本 | 最新公开发布版本 | 指定的 LTS 版本线，私有维护 | 指定的 LTS 版本线，重定位至您的命名空间 |
| 命名空间 | `org.koin.*` | `org.koin.*` | 独立专属的命名空间，例如 `acme.koin.*` |
| 分发 | Maven Central | Kotzilla 仓库，使用客户凭据进行私有访问 | Kotzilla 仓库，面向您组织的私有仓库 |
| 安全补丁 | 仅限当前发布版本线 | 反向移植到您的 LTS 版本线 | 反向移植并重新重定位到您的构建中 |
| 客户问题修复 | 尽力而为，通过公开的 GitHub issues 处理 | 在您的 LTS 构建版本中修复并交付 | 在您的构建版本中修复并交付 |
| Koin 团队直接沟通渠道 | 无，仅限公开 Slack 和 GitHub | 优先访问权限，通过 Slack 和专属电子邮件提供 | 优先访问权限，通过 Slack 和专属电子邮件提供 |
| 升级协助 | 公开迁移指南 | LTS 版本线之间的指导升级 | 提供指导升级，针对目标版本重新生成重定位构建 |

### 附加服务 {id="add-on-services"}

这些服务是在 Koin LTS 或 Koin Embedded LTS 订阅之上签约购买的，并非单独的层级：

- **服务等级协议（SLA）**：合同承诺的响应时间保证。
- **架构审查**：由 Koin 团队对您的 Koin 配置和模块结构进行审查。
- **培训与工作坊**：针对团队开展 Koin 实践培训。

具体条款依合同约定。[联系团队](#contact)了解适用范围。

### 选择支持层级 {id="choosing-a-tier"}

- **社区支持**：您紧跟当前的 Koin 发布版本，公共支持已能满足需求。
- **Koin LTS**：您需要保持在某个固定版本，并需要针对该版本的修复支持。
- **Koin Embedded LTS**：您在自己的构件中重新分发 Koin，不能冒与使用者产生命名空间冲突的风险。

## 联系方式 {id="contact"}

- **Koin LTS 与 Koin Embedded LTS**：[Koin 长期支持（LTS）](https://kotzilla.io/koin-lts)
- **Kotzilla 平台**：[kotzilla.io](https://kotzilla.io)
- **常规咨询**：[koin@kotzilla.io](mailto:koin@kotzilla.io)
- **社区 Slack**：[Kotlin Slack #koin](https://kotlinlang.slack.com/messages/koin/)

## 相关内容 {id="related"}

- [发布版本与升级指南](/docs/support/releases)：各版本变更内容及升级方法。
- [API 稳定性](/docs/support/api-stability)：实验性、已弃用及内部 API，发布类型说明。
- [适用于 SDK 与库的 Koin](/docs/support/embedded)：在 SDK 内部重定位 Koin。
- [生产与工具链](/docs/tooling)：IDE 插件与生产监控。