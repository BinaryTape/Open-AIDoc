[//]: # (title: 將你的程式庫發佈至 npm – 教學)

<tldr>
<p>手動或使用 GitHub Actions，透過 <a href="https://npm-publish.petuska.dev/latest/">npm-publish Gradle 外掛程式</a>將你的 Kotlin Multiplatform 程式庫發佈至 npm。</p>
</tldr>

若要發佈你的程式庫，你將需要：

1. 準備憑據，包括 [npm 帳戶](https://docs.npmjs.com/creating-a-new-npm-user-account) 以及 [存取權杖](https://docs.npmjs.com/creating-and-viewing-access-tokens)。
2. 在你的 Kotlin Multiplatform 專案中配置發佈外掛程式。
3. 為發佈外掛程式提供憑據，或為持續整合設定 Trusted Publisher。
4. 手動或使用 CI 執行發佈任務。

在本教學中，我們使用 GitHub 代管專案，並透過 GitHub Actions 執行 CI。

## 範例程式庫 {id="sample-library"}

你可以使用[範例程式庫專案](https://github.com/Kotlin/kotlin-multiplatform-web-library)跟隨本教學並查看可正常運作的配置。

如果你重複使用該程式碼，請務必將**所有範例值替換**為專屬於你專案的數值。

## 準備帳戶與憑據 {id="prepare-accounts-and-credentials"}

若要發佈至 npm，你需要[登入 npm 入口網站](https://www.npmjs.com/login)。

在本教學中，你將需要一個組織以及一個存取權杖來配置手動發佈。

### 建立簡易組織 {id="create-a-simple-organization"}

在本教學中，我們將程式庫發佈在一個 npm 組織下，以避免命名衝突。

若要建立新組織，請遵循 [npm 文件](https://docs.npmjs.com/creating-an-organization)。

### 產生存取權杖 {id="generate-an-access-token"}

若要手動發佈至 npm，你需要一個允許在你新建立的組織下發佈軟件包的存取權杖。
若要產生此權杖，請遵循 [npm 指南](https://docs.npmjs.com/creating-and-viewing-access-tokens)。

針對本教學，請使用簡化的安全配置：
* 啟用 **Bypass two-factor authentication (2FA)** 選項。
* 將權杖的一般權限與組織權限皆設定為 **Read and write**。

## 配置程式庫專案 {id="configure-the-library-project"}

如果你使用[範例專案](https://github.com/Kotlin/kotlin-multiplatform-web-library)，請在發佈前更新預設名稱。
這包括：

* 程式庫模組的名稱。
* 在 `settings.gradle.kts` 檔案中設定的專案名稱。

設定好名稱後，請遵循以下步驟設定發佈。

### 設定發佈外掛程式 {id="set-up-the-publishing-plugin"}

本教學使用官方的 [npm-publish 外掛程式](https://github.com/Kotlin/npm-publish)來協助發佈至 npm。
若要進一步了解該外掛程式與可用的配置選項，請參閱[外掛程式的文件](https://npm-publish.petuska.dev)。

將外掛程式新增至你的 Kotlin Multiplatform 專案：

1. 開啟你的程式庫模組的 `build.gradle.kts` 檔案。

2. 在 `plugins {}` 區塊中新增以下內容：

    ```kotlin
    // <module directory>/build.gradle.kts
    
    plugins {
        kotlin("npm-publish") version "%npmPublishPlugin%"
    }
    ```
    
    > 若要查看外掛程式的最新可用版本，請查看 [Releases](https://github.com/Kotlin/npm-publish/releases) 頁面。
    > 
    {style="note"}

3. 新增以下配置。
   請務必根據你的程式庫自訂這些值。
   唯一必要的參數為 `organization`、`authToken`、`packageName` 以及 `version`。
   其餘部分作為擴充範例提供：

    ```kotlin
    // <module directory>/build.gradle.kts
    npmPublish {
        organization = "organization_name_without_the_@_sign"
        
        registries {
            npmjs {
                // 當你執行發佈軟件包的指令時，
                // 將作為此環境變數傳入你的 npm 權杖
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

    > 若要進行此配置，你也可以使用 [Gradle 屬性](https://docs.gradle.org/current/userguide/build_environment.html)。
    > 
    {style="tip"}

`npmPublish {}` 區塊中的重要設定如下：

* `organization` 參數與 `registries {}` 區塊指定了身分驗證詳細資訊。
  在此案例中，我們使用主要 npm registry，以及在執行發佈任務時應存放權杖的 `NPM_TOKEN` 變數名稱。
* `packageName` 與 `version` 參數定義了必要的軟件包選項：
  * 可以省略 `version` 參數，以使用你模組的版本作為預設值。
  * 可以省略 `packageName` 參數，以使用你模組的名稱作為預設值。
* `packageJson {}` 區塊包含各種元資料。

## 手動發佈 {id="publish-manually"}

當你仍在嘗試專案結構，或希望自行實作發佈自動化時，手動發佈會非常有用。

現在你可以從本機電腦將程式庫發佈至 npm。
若要執行此操作，請執行以下指令，並將先前產生的存取權杖貼在 `YOUR_ACCESS_TOKEN` 位置：

```bash
NPM_TOKEN=YOUR_ACCESS_TOKEN ./gradlew :shared:publishJsPackageToNpmjsRegistry
```

程式庫發佈完成後，你應該能夠在 npm registry 中看到它。
開啟你的 npm 組織頁面並檢查 **Packages** 分頁
（而非個人 **Packages** 頁面）。

![在 npm 上發佈的程式庫](published-on-npm.png){width=700}

### 疑難排解 {id="troubleshooting"}

手動發佈時常出現的幾個問題：

* 隨時注意 `build.gradle.kts` 配置中的 `version` 欄位：
  如果軟件包已使用相同或更早的版本發佈過，npm 的發佈將會失敗。
* 為作用域套件（organization-scoped package）產生權杖時，請確保同時設定了一般**與**組織權限。

## 使用持續整合 (CI) 發佈 {id="publish-using-continuous-integration-ci"}

npm 的 Trusted Publishers 機制可讓你使用 OpenID Connect 快速設定 CI。
這種方法完全避免了產生與維護權杖的麻煩。

在本範例中，我們將使用 [GitHub Actions](https://docs.github.com/en/actions) 設定一個工作流程。

### 建立 GitHub Actions 工作流程檔案 {id="create-a-github-actions-workflow-file"}

建立一個配置 GitHub action 的 `.github/workflows/publish.yml` 檔案：

```yaml
# .github/workflows/publish.yml

name: Publish

on:
  release:
    types: [released, prereleased]

permissions:
  id-token: write  # GitHub Actions 與 npm 信任發佈整合時為必要項
  contents: read

jobs:
  publish:
    name: Release build and publish
    runs-on: ubuntu-latest
    steps:
      # 檢出觸發分支
      - name: Check out code
        uses: actions/checkout@v4

      # 設定 JDK 以執行 Gradle 任務
      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          distribution: 'zulu'
          java-version: 21

      # 為程式庫模組執行發佈 Gradle 任務
      - name: Publish to npm
        run: ./gradlew :shared:publishJsPackageToNpmjsRegistry
```

一旦你將此檔案提交並推送到代管你專案的 GitHub 存儲庫，每當你在該存儲庫中建立 GitHub release 時，此工作流程就會執行。

> 你也可以將工作流程配置為[在推送標籤時觸發](https://stackoverflow.com/a/61892639)。
> 
{style="tip"}

### 將 GitHub Actions 設定為你的 Trusted Publisher {id="set-up-github-actions-as-your-trusted-publisher"}

現在你已經發佈了工作流程，可以使用 GitHub Action 為你的 npm 軟件包新增 [Trusted Publisher](https://docs.npmjs.com/trusted-publishers)：

1. 開啟[已發佈的軟件包](#手動發佈)頁面。
2. 開啟 **Settings** 分頁並找到 **Trusted Publisher** 區段。
3. 在 **Select your publisher** 下方，點擊 **GitHub Actions** 按鈕。
4. 填寫表單：
   * 你的 GitHub 名稱（或組織）
   * 存儲庫名稱
   * 工作流程檔案名稱（在本教學中，我們使用了 [publish.yml](#建立-github-actions-工作流程檔案)）。
5. 點擊 **Setup connection** 按鈕。

![針對 GitHub Actions 的 npm Trusted Publisher 設定](npm-trusted-publisher-github.png)

> [npm 不會驗證提供的座標資訊](https://docs.npmjs.com/trusted-publishers#troubleshooting)，因此請確保輸入的詳細資料正確無誤。
> 
{style="warning"}

建立好的連線隨後會列在軟件包設定的 **Trusted Publishers** 區段中，這表示具有指定座標資訊的工作流程現在已獲得授權可發佈至 npm。

### 在 GitHub 上建立 Release {id="create-a-release-on-github"}

設定好工作流程與 Trusted Publisher 連線後，你現在可以透過[建立 GitHub release](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository#creating-a-release) 來觸發發佈：

1. 將 `build.gradle.kts` 配置中的軟件包版本設定為你想要發佈的版本。

   > 如果版本號已被使用或低於已發佈的版本，npm 將不允許發佈。
   > 
   {style="note"}

2. 前往你的 GitHub 存儲庫。
3. 在右側邊欄中，點擊 **Releases**。
4. 點擊 **Draft a new release** 按鈕（如果之前未曾為此存儲庫建立過 release，則點擊 **Create a new release** 按鈕）。
5. 建立或選取一個 Git 標籤（如果可能，請與模組版本相符，以保持不同系統間編號的一致性）。
6. 設定 release 標題（將 release 命名為與標籤相同的名稱會很方便）。
   
   為了掌握所有內容，你可能會希望標籤中的版本與你在 `build.gradle.kts` 檔案中指定的程式庫版本號相同。

   ![在 GitHub 上建立 release](create-release-and-tag-for-npm.png){width=700}

7. 點擊 **Publish release** 按鈕。

若要檢查 Action 是否已被觸發，請點擊 GitHub 存儲庫頁面頂端的 **Actions** 分頁。
你應該會看到新發佈的 release 觸發了發佈工作流程的執行。
點擊該工作流程以查看發佈任務的日誌。

工作流程執行完成後，新版本的軟件包應會列在 npm registry 中的軟件包頁面上。

![透過 CI/CD 在 npm 上發佈的程式庫](published-second-version-on-npm.png){width=700}

## 後續步驟 {id="what-s-next"}

* [為你的 README 新增 shield.io 徽章](https://shields.io/badges/npm-version)
* [使用 Dokka 產生 API 文件](https://kotl.in/dokka)
* [使用 Renovate 自動化相依性更新](https://docs.renovatebot.com/)
* [在 Kotlin Slack 中與社群分享你的程式庫](https://kotlinlang.slack.com/)
  （若要註冊，請造訪 https://kotl.in/slack）