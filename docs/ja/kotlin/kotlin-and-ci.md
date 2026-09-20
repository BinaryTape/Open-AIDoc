[//]: # (title: Kotlin と TeamCity による継続的インテグレーション)

このページでは、Kotlin アプリケーションをビルドするために [TeamCity](https://www.jetbrains.com/teamcity/) を設定する方法について説明します。
TeamCity のインストールや基本セットアップについては、[TeamCity のドキュメント](https://www.jetbrains.com/teamcity/documentation/) を参照してください。

Kotlin は Gradle や Maven などの標準的なビルドツールと直接統合されているため、TeamCity で Kotlin のビルドを設定する際も他のプロジェクトと同じワークフローで行えます。もし代わりに IntelliJ IDEA のビルドシステムを使用してプロジェクトをコンパイルする場合は、TeamCity が専用のランナーを提供しています。

## Gradle と Maven {id="gradle-and-maven"}

Gradle または Maven でビルドする場合、ビルド設定ファイル（`build.gradle.kts` または `pom.xml`）で Kotlin の依存関係とコンパイラプラグインがすでに宣言されています。TeamCity 側で Kotlin 固有の追加設定を行う必要はありません。

Gradle の場合、ビルド設定に Gradle ビルドステップを追加し、**Step name** と実行したい **Gradle tasks** を指定します。
<img src="teamcity-gradle.png" alt="Gradle Build Step" width="700" border-effect="line"/>

同様に Maven の場合は、Maven ビルドステップを追加し、**Step name** と実行したい **Goals** を指定します。

## IntelliJ IDEA ビルドシステム {id="intellij-idea-build-system"}

IntelliJ IDEA プロジェクトファイルを使用してプロジェクトをビルドする場合、TeamCity 内の Kotlin バージョンは IDE プロジェクトで設定されているバージョンと一致している必要があります。
TeamCity のレシピ（recipe）を使用すると、Kotlin コンパイラのダウンロードと設定を自動化できます。レシピはメタランナー（meta-runner）の発展形であり、同じ目的を持ちながら、YAML のサポートや [JetBrains Marketplace](https://plugins.jetbrains.com/teamcity_recipe) での簡単な共有といった追加の利点を提供します。

1. レシピをダウンロードしてインポートします。
   * [GitHub](https://github.com/JetBrains/Kotlin.TeamCity) から Kotlin メタランナーファイルをダウンロードします。
   * 新しいレシピとして TeamCity にインポートします。詳細については、[Working with recipes](https://www.jetbrains.com/help/teamcity/working-with-meta-runner.html) を参照してください。
  <img src="teamcity-add-recipe.png" alt="TeamCity recipe" width="700" border-effect="line"/>

2. Kotlin コンパイラ取得ステップを追加します。
   * インポートしたランナーを使用してビルドステップを追加します。
   * **Step name** と必要な **Kotlin Version** を指定します。
  <img src="teamcity-step-name.png" alt="Setup Kotlin Compiler" width="700" border-effect="line"/>

  >ビルドを実行する前に、ビルド設定で `system.path.macro.KOTLIN.BUNDLED` をシステムパラメータとして追加してください。
  >任意のプレースホルダー値を設定でき、ランナーはビルド時に解決されたコンパイラパスでそれを上書きします。
  >
  > {style="note"}

3. コンパイルステップを追加します。
   コンパイラ取得ステップの後に IntelliJ IDEA Project ランナーステップを追加して、プロジェクトをコンパイルし、ビルドアーティファクトを生成します。
  <img src="teamcity-intellij-step.png" alt="IntelliJ IDEA Project runner" width="500" border-effect="line"/>

## その他の CI サーバー {id="other-ci-servers"}

TeamCity 以外の CI システムを使用している場合は、パイプラインスクリプト内で標準の Gradle または Maven コマンドを直接実行してください。

## 次のステップ {id="what-s-next"}

* Kotlin Multiplatform アプリケーションのビルド、テスト、デプロイを行うために、[Kotlin Multiplatform アプリケーション向けに TeamCity を設定する方法](https://kotlinlang.org/docs/multiplatform/configure-teamcity-for-kmp.html) を学びます。
* チュートリアルに従って、ホストされた macOS エージェント上で [Kotlin Multiplatform プロジェクト用の iOS 配信パイプラインを設定](https://kotlinlang.org/docs/multiplatform/ios-ci-cd-teamcity.html) し、TestFlight へのデプロイを自動化します。
* [プロジェクト設定をバージョン管理に保存](https://www.jetbrains.com/help/teamcity/storing-project-settings-in-version-control.html) し、Kotlin DSL を使用してパイプラインをコードとして管理する方法について学びます。