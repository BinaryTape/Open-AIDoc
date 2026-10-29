# Kotlin Multiplatform アプリケーション向けに TeamCity を設定する

<web-summary>Kotlin Multiplatform (KMP) 向けに TeamCity Cloud またはオンプレミス（On-Premises）プロジェクトを設定する方法を学びます。
このチュートリアルでは、オンザフライでの YAML 設定編集と直感的なビジュアルエディターをサポートする TeamCity パイプラインを使用します。</web-summary>

この記事では、KMP アプリケーションをビルド、テスト、デプロイするために [TeamCity](https://www.jetbrains.com/teamcity/?source=google&medium=cpc&campaign=EMEA_en_DE_TeamCity_Branded&term=jetbrains%20teamcity&content=771411250243&gad_source=1&gad_campaignid=12704027475&gbraid=0AAAAADloJzi5LQxd_2GSPDer8jKk00xHY&gclid=CjwKCAjwyMnNBhBNEiwA-Kcgu9u9Gprgz8eDZs4p-aG14ZSEn3A3JARU_VXxZaEFPMrxGydCbvNJdxoCmToQAvD_BwE) を設定する方法を説明します。
TeamCity は主要なすべての VCS プロバイダー（GitHub、GitLab、Bitbucket、Azure DevOps、Perforce など）をサポートしており、
ローカルエージェントとクラウドエージェントの両方を使用した高度にスケーラブルなハイブリッドワークフローを可能にします。また、高可用性のためのマルチノードセットアップ、高度なユーザー管理、課題トラッカーの統合、AI アシスタントなどの強力な機能が含まれています。

TeamCity の[無料トライアル](https://www.jetbrains.com/teamcity/download/)を入手してください：
主要なビルドツールや SDK が事前設定された JetBrains ホスト型エージェントを備えた Cloud バージョンを選択するか、最大限の制御が可能で無料の無期限 Professional ライセンスが付属する TeamCity オンプレミスを選択してください。

このチュートリアルは、[JetCaster KMP サンプル](https://github.com/kotlin-hands-on/jetcaster-kmp-migration/)に基づいています。

## 新しいプロジェクトの作成 {id="create-a-new-project"}

すべての TeamCity ワークフローはプロジェクトから始まります。プロジェクトは、実際の CI/CD ルーチンを実行するビルド構成（build configurations）やパイプライン（pipelines）などのエンティティを所有し、クラウドエージェントの起動に使用されるクラウドプロファイルを保存し、子オブジェクトとパラメータを共有するなどの役割を担います。

> 詳細は以下の TeamCity ドキュメントの記事を参照してください：
> * [プロジェクト管理者ガイド](https://www.jetbrains.com/help/teamcity/project-administrator-guide.html#Steps%2C+Configurations+and+Projects)
> * [プロジェクトの作成と編集](https://www.jetbrains.com/help/teamcity/creating-and-editing-projects.html#Create+New+Projects+in+Kotlin+DSL)
>
{style="tip"}

1. サイドナビゲーションバーのプラスボタンをクリックして、新しいプロジェクトを開始します。
2. プロジェクト名を指定し、必要に応じて説明を入力します。
3. **Create** をクリックすると、TeamCity から実際のビルドタスクを実行するオブジェクトのタイプ（ビルド構成またはパイプライン）を選択するよう求められます。

   <img src="teamcity-kmp-projectselector.png" width="500" alt="ビルド構成またはパイプラインを選択"/>

   <deflist type="medium">
   <def title="ビルド構成 (Build configuration)">
   TeamCity の全機能をサポートし、設定を Kotlin DSL コードとして保存でき、比類のないカスタマイズ性を提供します。ただし、より多くの経験と手動設定が必要になる場合があります。

   詳細はこちら：[ビルド構成の作成と編集](https://www.jetbrains.com/help/teamcity/creating-and-editing-build-configurations.html)
   </def>
   <def title="パイプライン (Pipeline)">
   ビジュアルエディターによる直感的なデザイン、編集可能な YAML 設定、簡単にアクセスできる設定を提供します。
   パイプラインは、経験の浅いユーザーやシンプルなワークフロー向けに設計されています。
   TeamCity 2025.11 で導入されたパイプラインは、現在、ビルド構成で利用可能な機能の一部が不足しています。

   詳細はこちら：[パイプラインの作成と編集](https://www.jetbrains.com/help/teamcity/create-and-edit-pipelines.html)
   </def>
   </deflist>

   このチュートリアルでは、設定がより簡単で、サンプルプロジェクトのビルドとテストに必要なすべての機能をサポートしているパイプラインを選択してください。

4. **Connect new repository** を選択し、将来のプロジェクトで再利用できる GitHub への永続的な接続を作成する場合は **GitHub** を、特定のレポジトリ（サンプルアプリの JetCaster または独自のフォーク）への限定的な接続を作成する場合は **Any Git URL** を選択します。

5. TeamCity がリポジトリへのアクセスを確認した後、ブランチに関する情報を取得し、基本的なパイプラインの動作を指定するよう求められます。

   <img src="teamcity-kmp-pipelinesettings.png" width="450" alt="基本的なパイプライン設定"/>

   デフォルト設定のままにして、パイプラインがすべてのリポジトリブランチを追跡し、`main` をデフォルトブランチとして使用し、リポジトリに変更がコミットされるたびに新しい実行を自動的にトリガーするようにします。

## パイプラインジョブの追加 {id="add-pipeline-jobs"}

パイプラインの準備ができると、TeamCity はその設定ページに移動します。
左上隅のトグルを使用して、ビジュアルエディターとコードエディターを切り替えることができます。

<img src="teamcity-kmp-clientarea.png" width="450" alt="メインクライアント領域"/>

TeamCity のパイプラインはジョブ（jobs）で構成されており、ジョブは連続して実行されるビルドステップ（build steps）の集合です。ビルドステップは、特定のアクションセットをカプセル化した TeamCity ルーチンの最小単位です。

TeamCity UI でジョブのタイルをクリックして設定を編集するか、ジョブの下にある暗い領域をクリックしてグローバルなパイプライン設定を変更します。

### 共通のパイプライン設定 {id="common-pipeline-settings"}

このチュートリアルでは、グローバルなパイプラインオプションを設定する必要はありません。
以下のような、パイプライン内のすべてのジョブに影響する設定の詳細については、[こちらの記事](https://www.jetbrains.com/help/teamcity/pipeline-settings.html)を参照してください：

* **Auto-run pipelines** — リモートリポジトリに新しい変更がコミットされたとき（デフォルトで有効）、リポジトリに対してプルリクエストがオープンされたとき、または設定されたスケジュールに基づいてパイプラインが自動的に実行されるように設定できます。
* **Repository** — 異なる VCS ホスティングプロバイダーからの複数のリポジトリをチェックアウトして処理できます。
* **Integrations** — 外部の NPM および Docker レジストリを接続できます。パブリックな Docker Hub イメージ内でビルドステップを実行する予定がある場合、パイプラインの実行頻度が Docker Hub の匿名プル制限を超えるほど高くない限り、対応する統合を設定する必要はありません。

### エージェント設定 {id="agent-settings"}

ビルドタスクは、ベアメタルまたはクラウドマシンにインストールされたビルドエージェント（build agents）によって処理されます。
これらのマシンには、指定されたビルドタスクに必要なすべてのツールがインストールされている必要があります。
たとえば、このパイプラインの Job 2 には Android SDK が必要であり、Job 3 は Xcode を使用して iOS バージョンのアプリをビルドします。

* TeamCity Cloud は、[幅広いビルドツールを備えた](https://www.jetbrains.com/help/teamcity/cloud/jetbrains-hosted-agents.html#Agent+Software) JetBrains ホスト型エージェントを使用します。
  このチュートリアルでは、追加のエージェントを接続する必要はありません。
* TeamCity オンプレミスを使用している場合は、すべてのジョブが少なくとも 1 つのエージェントで実行できることを確認する必要があります。
  詳細については、こちらの記事を参照してください：[TeamCity エージェントのインストールと起動](https://www.jetbrains.com/help/teamcity/install-and-start-teamcity-agents.html)

このチュートリアルでは、ジョブが必要なツールがインストールされているエージェントにのみ割り当てられることを保証するために、エージェント要件を指定します。

### 共有テストの実行 {id="run-shared-tests"}

YAML パイプラインエディターに切り替え、以下のマークアップを貼り付けて最初のジョブを設定します。

```yaml
jobs:
  Job1:
    name: Run tests
    steps:
      - type: gradle
        use-gradle-wrapper: true
        name: Gradle test
        jdk-home: '%\env.JDK_17_0%'
        tasks: jvmTest
    files-publication:
      - path: '**/build/reports/tests/**/*'
        share-with-jobs: false
        publish-artifact: true
    allow-reuse: false
```

このジョブは、Java 17 を使用して `jvmTest` Gradle タスクを実行します。パスが `.../build/reports/tests/...` に一致するすべてのファイルを収集し、それらを `test-reports` フォルダにまとめ、このフォルダをアーティファクトとして公開します。

また、**Optimizations | Parallel tests** ジョブオプションを有効にして、テストスイートをより小さなバッチに分割し、各バッチを別々のビルドエージェントで処理することもできます。
これにより、全体の実行時間を大幅に短縮できますが、より多くのリソースを使用します。
並列テストを有効にするには、以下に示すように `parallelism` 設定を含めるようにパイプライン YAML を変更します。

```yaml
    ...
    allow-reuse: false
    parallelism: 3
```

**Allow reuse** 最適化オプションは、パイプライン設定やソースコードに変更がない場合に、TeamCity がタスク의 再実行をスキップするかどうかを指定します。

詳細については、[ジョブ設定](https://www.jetbrains.com/help/teamcity/job-settings.html)および [Gradle ビルドステップ](https://www.jetbrains.com/help/teamcity/gradle.html)を参照してください。

### Android デバッグパッケージのビルド {id="build-the-android-debug-package"}

パイプライン YAML を次のように変更します。

```yaml
jobs:
  Job1:
    name: Run tests
    ...
    Job2:
      name: Build Android
      steps:
        - type: gradle
          jdk-home: '%\env.JDK_17_0%'
          tasks: ':mobile:assembleDebug'
          use-gradle-wrapper: true
      files-publication:
        - path: mobile/build/outputs/apk/debug/*.apk
          share-with-jobs: false
          publish-artifact: true
      runs-on:
        self-hosted:
          - requirement: exists
            name: Android home
            parameter: env.ANDROID_HOME
      dependencies:
        - Job1
```

* `requirement` ブロックにより、このジョブは Android SDK がインストールされているエージェントにのみ割り当てられます。
* `dependencies` セクションにより、このジョブは `Job1` が正常に終了した後にのみ開始されます。

### iOS シミュレーターアプリケーションのビルド {id="build-the-ios-simulator-application"}

最後のステップとして、パイプライン YAML に以下のマークアップを追加します。

```yaml
jobs:
  Job1:
    ...
  Job2:
    ...
  Job3:
    name: Build iOS
    steps:
      - type: script
        script-content: |-
          xcodebuild build \
            -project JetcasterMigration/JetcasterMigration.xcodeproj \
            -configuration Debug \
            -scheme JetcasterMigration \
            -sdk iphonesimulator \
            -derivedDataPath ./build \
            -verbose
    files-publication:
      - path: build/Build/Products/Debug-iphonesimulator/**/*
        share-with-jobs: false
        publish-artifact: true
    dependencies:
      - Job1
```

最初の 2 つのジョブとは異なり、**Build iOS** は汎用的な [コマンドラインビルドステップ](https://www.jetbrains.com/help/teamcity/command-line.html) を使用します。これにより、コマンドを実行したり、エージェントマシンにインストールされている任意のツールとやり取りしたりできます。

`dependencies` セクションは `Job1` への依存関係を指定しています。これは、**Build Android** と **Build iOS** の両方のジョブを並列に実行できるものの、`Job1` のテストルーチンが完了した後にのみ開始されることを意味します。

> ビルド構成を使用する場合、スクリプト（Script）ビルドステップを専用の [Xcode Project ステップ](https://www.jetbrains.com/help/teamcity/xcode-project.html) に置き換えることができます。
>
{style="tip"}

## パイプラインの実行 {id="run-the-pipeline"}

右上隅の **Save and Run** をクリックしてワークフローを開始します。
ジョブが終了すると、そのジョブが公開したアーティファクトがビルドログの横にある **Artifacts** タブで利用可能になります。

<img src="teamcity-kmp-artifacts.png" alt="TeamCity アーティファクト" width="450"/>

`Job1` では **Tests** タブも表示され、テスト結果を確認できます。

<img src="teamcity-kmp-tests.png" alt="TeamCity テスト" width="450"/>

## 次のステップ {id="what-s-next"}

このサンプルをさらに変更して、より多くのメリットを得ることができます。

* **VCS 接続を使用したパイプラインの追加**
 
  [プロジェクトに新しいパイプラインを追加](#create-a-new-project)する際、**Any Git URL** の代わりに **GitHub** を選択します。
  このアプローチでは、将来の GitHub ベースのプロジェクトで VCS アクセスの設定をスキップできるだけでなく、追加のパイプライン機能も利用できるようになります。

    * TeamCity は[実行ステータス](https://www.jetbrains.com/help/teamcity/create-and-edit-pipelines.html#Publish+Run+Statuses+to+VCS)（成功、失敗、または実行中）を GitHub に直接投稿できます。
    * [**On new changes** トリガー](https://www.jetbrains.com/help/teamcity/pipeline-settings.html#On+New+Changes) および [**Repository** エントリ](https://www.jetbrains.com/help/teamcity/pipeline-settings.html#Repository) には **Pull requests** トグルが含まれ、
      まだ安定したブランチにコミットされていない変更を追跡してビルドできるようになります。

* **高度なビルド構成の探索**

  パイプラインから[ビルド構成](https://www.jetbrains.com/help/teamcity/configuring-general-settings.html)に切り替えると、高度な機能にアクセスできます。

    * [ビルドチェーン](https://www.jetbrains.com/help/teamcity/build-chain.html)および[複合構成](https://www.jetbrains.com/help/teamcity/composite-build-configuration.html)を使用して、ワークフローの特定の部分を実行します。
      たとえば、**Build Android** をトリガーせずに **Test → Build iOS** を実行したり、テスト構成のみを実行したりできます。
    * JetBrains が作成した幅広いビルドステップ、コミュニティのレシピ、および [GitHub リリース](https://blog.jetbrains.com/teamcity/2025/09/teamcity-github-releases-plugin/)のようなバンドルされていないステップを活用できます。
    * [エージェントを Kubernetes クラスターにデプロイ](https://www.jetbrains.com/help/teamcity/setting-up-teamcity-for-kubernetes.html)したり、[外部エグゼキューター](https://www.jetbrains.com/help/teamcity/kubernetes-executor.html)として使用したりできます。
    * [課題トラッカー](https://www.jetbrains.com/help/teamcity/integrating-teamcity-with-issue-tracker.html)や[秘密情報（Secret）保管庫](https://www.jetbrains.com/help/teamcity/hashicorp-vault.html)との統合を設定できます。