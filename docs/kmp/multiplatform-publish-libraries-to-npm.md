[//]: # (title: 将库发布到 npm – 教程)

<tldr>
<p>使用 <a href="https://npm-publish.petuska.dev/latest/">npm-publish Gradle 插件</a>将你的 Kotlin Multiplatform 库手动或通过 GitHub Actions 发布到 npm。</p>
</tldr>

要发布你的库，你需要：

1. 准备凭据，包括 [npm 帐户](https://docs.npmjs.com/creating-a-new-npm-user-account) 和[访问令牌](https://docs.npmjs.com/creating-and-viewing-access-tokens)。
2. 在你的 Kotlin Multiplatform 项目中配置发布插件。
3. 为发布插件提供凭据，或为持续集成设置 Trusted Publisher。
4. 手动或使用 CI 运行发布任务。

在本教程中，我们使用 GitHub 托管项目，并通过 GitHub Actions 运行 CI。

## 示例库 {id="sample-library"}

你可以使用[示例库项目](https://github.com/Kotlin/kotlin-multiplatform-web-library)跟进操作，并查看可正常运行的配置。

如果复用该代码，请务必**将所有示例值替换**为你项目的特定值。

## 准备帐户与凭据 {id="prepare-accounts-and-credentials"}

要发布到 npm，你需要[登录 npm 门户](https://www.npmjs.com/login)。

在本教程中，你需要一个组织和一个访问令牌来配置手动发布。

### 创建一个简易组织 {id="create-a-simple-organization"}

在本教程中，我们在 npm 组织下发布库，以避免命名冲突。

要创建新组织，请遵循 [npm 文档](https://docs.npmjs.com/creating-an-organization)。

### 生成访问令牌 {id="generate-an-access-token"}

要手动发布到 npm，你需要一个允许在刚创建的组织下发布软件包的访问令牌。
要生成此类令牌，请遵循 [npm 指南](https://docs.npmjs.com/creating-and-viewing-access-tokens)。

对于本教程，请使用简化的安全配置：
* 启用 **Bypass two-factor authentication (2FA)** 选项。
* 将令牌的常规权限和组织权限均设置为 **Read and write**。

## 配置库项目 {id="configure-the-library-project"}

如果你使用[示例项目](https://github.com/Kotlin/kotlin-multiplatform-web-library)，
请在发布前更新默认名称。
这包括：

* 库模块的名称。
* 在 `settings.gradle.kts` 文件中设置的项目名称。

名称设置完毕后，请按照以下步骤设置发布。

### 设置发布插件 {id="set-up-the-publishing-plugin"}

本教程使用官方 [npm-publish 插件](https://github.com/Kotlin/npm-publish)来辅助发布到 npm。
要详细了解该插件及可用的配置选项，请参阅[插件文档](https://npm-publish.petuska.dev)。

将该插件添加到你的 Kotlin Multiplatform 项目中：

1. 打开库模块的 `build.gradle.kts` 文件。

2. 在 `plugins {}` 代码块中添加以下内容：

    ```kotlin
    // <module directory>/build.gradle.kts
    
    plugins {
        kotlin("npm-publish") version "%npmPublishPlugin%"
    }
    ```
    
    > 如需获取该插件的最新可用版本，请查看 [Releases](https://github.com/Kotlin/npm-publish/releases) 页面。
    > 
    {style="note"}

3. 添加以下配置。
   请确保根据你的库自定义这些值。
   仅有的必需参数为 `organization`、`authToken`、`packageName` 和 `version`。
   其余部分作为扩展示例提供：

    ```kotlin
    // <module directory>/build.gradle.kts
    npmPublish {
        organization = "organization_name_without_the_@_sign"
        
        registries {
            npmjs {
                // 运行发布软件包的命令时，
                // 你需要将 npm 令牌作为该环境变量传入
                authToken = System.getenv("NPM_TOKEN")
            }
        }
    
        packages {
            named("js") {
                version = "0.0.1"
                packageName = "greetings"
                readme = file("../README.md")
    
                packageJson {
                    license = "Apache 2.0"
                    homepage = "https://github.com/Kotlin/kotlin-multiplatform-web-library#readme"
                    description = "Shared Kotlin/JS Greetings library"
                    keywords = listOf("kotlin", "kotlin-js", "greetings", "shared", "api")
                    author {
                        name = "Kotlin Developer Advocate"
                        url = "https://github.com/kotlin-hands-on/"
                    }
                    contributors = listOf(
                        Person {
                            name = "John Smith"
                            email = "john.smith@example.com"
                            url = "https://github.com/johnsmith"
                        },
                    )
                    repository {
                        type = "git"
                        url = "https://github.com/Kotlin/kotlin-multiplatform-web-library.git"
                    }
                }
            }
        }
    }
    ```

    > 要配置此项，你也可以使用 [Gradle 属性](https://docs.gradle.org/current/userguide/build_environment.html)。
    > 
    {style="tip"}

`npmPublish {}` 块中的重要设置包括：

* `organization` 参数和 `registries {}` 块指定了身份验证详细信息。
  在本例中，我们使用主 npm 注册表，以及在运行发布任务时应持有令牌的 `NPM_TOKEN` 变量名称。
* `packageName` 和 `version` 参数定义了强制性软件包选项：
  * 可以省略 `version` 参数，以使用模块的版本作为默认值。
  * 可以省略 `packageName` 参数，以使用模块的名称作为默认值。
* `packageJson {}` 块包含各种元数据。

## 手动发布 {id="publish-manually"}

在仍在尝试项目结构，或希望自行实现发布自动化时，手动发布会非常有用。

现在你可以从本地计算机将库发布到 npm。
为此，请运行以下命令，将之前生成的访问令牌粘贴到 `YOUR_ACCESS_TOKEN` 的位置：

```bash
NPM_TOKEN=YOUR_ACCESS_TOKEN ./gradlew :shared:publishJsPackageToNpmjsRegistry
```

库发布后，你应该可以在 npm 注册表中看到它。
打开你的 npm 组织页面并检查 **Packages** 标签页
（而不是你个人的 **Packages** 页面）。

![在 npm 上发布的库](published-on-npm.png){width=700}

### 故障排除 {id="troubleshooting"}

手动发布常出现的一些问题：

* 注意 `build.gradle.kts` 配置中的 `version` 字段：
  如果软件包已经以相同或更早的版本发布过，npm 将会导致发布失败。
* 为组织作用域软件包生成令牌时，
  请确保同时设置常规权限**和**组织权限。

## 使用持续集成 (CI) 发布 {id="publish-using-continuous-integration-ci"}

npm 的 Trusted Publishers 机制允许你使用 OpenID Connect 快速设置 CI。
这种方法完全避免了生成和维护令牌。

在此示例中，我们将使用 [GitHub Actions](https://docs.github.com/en/actions) 设置一个工作流。

### 创建 GitHub Actions 工作流文件 {id="create-a-github-actions-workflow-file"}

创建一个 `.github/workflows/publish.yml` 文件来配置 GitHub Action：

```yaml
# .github/workflows/publish.yml

name: Publish

on:
  release:
    types: [released, prereleased]

permissions:
  id-token: write  # GitHub Actions 与 npm 受信任发布集成所必需
  contents: read

jobs:
  publish:
    name: Release build and publish
    runs-on: ubuntu-latest
    steps:
      # 检出触发分支
      - name: Check out code
        uses: actions/checkout@v4

      # 设置用于运行 Gradle 任务的 JDK
      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          distribution: 'zulu'
          java-version: 21

      # 为库模块运行发布的 Gradle 任务
      - name: Publish to npm
        run: ./gradlew :shared:publishJsPackageToNpmjsRegistry
```

将此文件提交并推送到托管项目的 GitHub 仓库后，
每当你在该仓库中创建 GitHub Release 时，该工作流就会运行。

> 你还可以将工作流配置为在[向仓库推送标记 (tag) 时触发](https://stackoverflow.com/a/61892639)。
> 
{style="tip"}

### 将 GitHub Actions 设置为你的 Trusted Publisher {id="set-up-github-actions-as-your-trusted-publisher"}

现在你已发布了工作流，可以使用 GitHub Action 为 npm 软件包添加 [Trusted Publisher](https://docs.npmjs.com/trusted-publishers)：

1. 打开[已发布的软件包](#publish-manually)页面。
2. 打开 **Settings** 标签页并找到 **Trusted Publisher** 部分。
3. 在 **Select your publisher** 下，点击 **GitHub Actions** 按钮。
4. 填写表单：
   * 你的 GitHub 用户名（或组织名）
   * 仓库名称
   * 工作流文件的名称（在本教程中，我们使用了 [publish.yml](#create-a-github-actions-workflow-file)）。
5. 点击 **Setup connection** 按钮。

![适用于 GitHub Actions 的 npm Trusted Publisher 设置](npm-trusted-publisher-github.png)

> [npm 不会验证所提供的坐标信息](https://docs.npmjs.com/trusted-publishers#troubleshooting)，
> 因此请确保准确输入详细信息。
> 
{style="warning"}

创建的连接随后会列在软件包设置的 **Trusted Publishers** 部分中，
这意味着具有指定坐标的工作流现已获得发布到 npm 的授权。

### 在 GitHub 上创建 Release {id="create-a-release-on-github"}

完成工作流和 Trusted Publisher 连接的设置后，你现在可以通过[创建 GitHub Release](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository#creating-a-release) 来触发发布：

1. 在 `build.gradle.kts` 配置中将软件包版本设置为要发布的版本。

   > 如果版本号已被使用或低于已发布的版本，npm 将不允许发布。
   > 
   {style="note"}

2. 转到你的 GitHub 仓库。
3. 在右侧边栏中，点击 **Releases**。
4. 点击 **Draft a new release** 按钮（如果你之前未曾为此仓库创建过 Release，则点击 **Create a new release** 按钮）。
5. 创建或选择一个 Git 标记（如果可能，尽量与模块的版本保持一致，以便在各系统之间保持编号一致）。
6. 设置 Release 标题（将 Release 命名为与标记相同的名称会很方便）。
   
   为了方便追踪所有内容，你可能希望标记中的版本与在 `build.gradle.kts` 文件中指定的库版本号相同。

   ![在 GitHub 上创建 Release](create-release-and-tag-for-npm.png){width=700}

7. 点击 **Publish release** 按钮。

要检查 Action 是否已触发，请点击 GitHub 仓库页面顶部的 **Actions** 标签页。
你应该会看到新发布的 Release 触发了发布工作流的运行。
点击该工作流即可查看发布任务的日志。

工作流运行完成后，新版本的软件包应列在 npm 注册表中的软件包页面上。

![通过 CI/CD 在 npm 上发布的库](published-second-version-on-npm.png){width=700}

## 后续步骤 {id="what-s-next"}

* [向 README 添加 shields.io 徽章](https://shields.io/badges/npm-version)
* [使用 Dokka 生成 API 文档](https://kotl.in/dokka)
* [使用 Renovate 自动更新依赖项](https://docs.renovatebot.com/)
* [在 Kotlin Slack 中与社区分享你的库](https://kotlinlang.slack.com/)
  （如需注册，请访问 https://kotl.in/slack）