[//]: # (title: Gradle と Kotlin/JVM を使ってみる)

このチュートリアルでは、IntelliJ IDEA と Gradle を使用して JVM コンソールアプリケーションを作成する方法を説明します。

始めるには、まず最新バージョンの [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) をダウンロードしてインストールしてください。

## プロジェクトの作成 {id="create-a-project"}

1. IntelliJ IDEA で、**File** | **New** | **Project** を選択します。
2. 左側のパネルで **Kotlin** を選択します。
3. 新しいプロジェクトに名前を付け、必要に応じて場所を変更します。

   > **Create Git repository** チェックボックスを選択すると、新しいプロジェクトをバージョン管理下に置くことができます。これは後からいつでも行うことができます。
   >
   {style="tip"}

   ![コンソールアプリケーションの作成](jvm-new-gradle-project.png){width=700}

4. **Gradle** ビルドシステムを選択します。
5. **JDK** リストから、プロジェクトで使用する [JDK](https://www.oracle.com/java/technologies/downloads/) を選択します。
    * JDK がコンピュータにインストールされているが IDE で定義されていない場合は、**Add JDK** を選択し、JDK のホームディレクトリへのパスを指定します。
    * コンピュータに必要な JDK がない場合は、**Download JDK** を選択します。

6. Gradle 用の **Kotlin** DSL を選択します。
7. **Add sample code** チェックボックスを選択して、サンプルの `"Hello World!"` アプリケーションを含むファイルを作成します。
8. **Create** をクリックします。

これで、Gradle を使用したプロジェクトの作成に成功しました！

#### プロジェクトの Gradle バージョンを指定する {initial-collapse-state="collapsed" collapsible="true" id="specify-a-gradle-version-for-your-project"}

Gradle Wrapper またはローカルにインストールされた Gradle のいずれかを使用して、**Advanced Settings** セクションでプロジェクトの Gradle バージョンを明示的に指定できます。

* **Gradle Wrapper:**
   1. **Gradle distribution** リストから **Wrapper** を選択します。
   2. **Auto-select** チェックボックスをオフにします。
   3. **Gradle version** リストから、使用する Gradle バージョンを選択します。
* **ローカルインストール:**
   1. **Gradle distribution** リストから **Local installation** を選択します。 
   2. **Gradle location** で、ローカルの Gradle バージョンのパスを指定します。

   ![詳細設定](jvm-new-gradle-project-advanced.png){width=700}

## ビルドスクリプトを確認する {id="explore-the-build-script"}

`build.gradle.kts` ファイルを開きます。これは Gradle の Kotlin ビルドスクリプトであり、Kotlin 関連のアーティファクトやアプリケーションに必要なその他の要素が含まれています。

```kotlin
plugins {
    kotlin("jvm") version "%kotlinVersion%" // 使用する Kotlin のバージョン
}

group = "org.example" // 会社名（例：`org.jetbrains.kotlin`）
version = "1.0-SNAPSHOT" // ビルドされたアーティファクトに割り当てるバージョン

repositories { // 依存関係のソース。1️⃣ を参照
    mavenCentral() // Maven Central リポジトリ。2️⃣ を参照
}

dependencies { // 使用したいすべてのライブラリ。3️⃣ を参照
    // リポジトリで見つけた依存関係の名前をコピーします
    testImplementation(kotlin("test")) // Kotlin テストライブラリ
}

kotlin { // 生成された JVM ツールチェーン設定。4️⃣ を参照
    jvmToolchain(25) // プロジェクトのコンパイルに使用する JDK。
}

tasks.test { // テストタスク設定。5️⃣ を参照
    useJUnitPlatform() // テスト用の JUnitPlatform。6️⃣ を参照
}
```

* 1️⃣ [依存関係のソース](https://docs.gradle.org/current/userguide/declaring_repositories.html)の詳細については、こちらをご覧ください。
* 2️⃣ [Maven Central リポジトリ](https://central.sonatype.com/)。これは [Google の Maven リポジトリ](https://maven.google.com/) や会社のプライベートリポジトリにすることもできます。
* 3️⃣ [依存関係の宣言](https://docs.gradle.org/current/userguide/declaring_dependencies.html)の詳細については、こちらをご覧ください。
* 4️⃣ [Java ツールチェーンサポート](gradle-configure-project.md#gradle-java-toolchains-support)の詳細については、こちらをご覧ください。
* 5️⃣ [タスク](https://docs.gradle.org/current/dsl/org.gradle.api.Task.html)の詳細については、こちらをご覧ください。
* 6️⃣ [テスト用の JUnitPlatform](https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/testing/Test.html#useJUnitPlatform)。

ご覧のとおり、Gradle ビルドファイルには Kotlin 固有のアーティファクトがいくつかあります。

1. `plugins {}` ブロックには `kotlin("jvm")` アーティファクトがあります。このプラグインは、プロジェクトで使用される Kotlin のバージョンを定義します。

2. `dependencies {}` ブロックには `testImplementation(kotlin("test"))` があります。 
   [テストライブラリへの依存関係の設定](gradle-configure-project.md#set-dependencies-on-test-libraries)の詳細については、こちらをご覧ください。

## アプリケーションを実行する {id="run-the-application"}

1. **View** | **Tool Windows** | **Gradle** を選択して、Gradle ウィンドウを開きます。

   ![main 関数を含む Main.kt](jvm-gradle-view-build.png){width=450}

2. `Tasks/build` にある **build** Gradle タスクを実行します。**Build** ウィンドウに `BUILD SUCCESSFUL` と表示されます。
   これは、Gradle がアプリケーションのビルドに成功したことを意味します。

3. `src/main/kotlin` で、`Main.kt` ファイルを開きます。
   * `src` ディレクトリには、Kotlin のソースファイルとリソースが含まれています。 
   * `Main.kt` ファイルには、`Hello World!` を出力するサンプルコードが含まれています。

4. エディタの左側（ガター）にある緑色の **Run** アイコンをクリックし、**Run 'MainKt'** を選択してアプリケーションを実行します。

   ![コンソールアプリの実行](jvm-run-app-gradle.png){width=350}

**Run** ツールウィンドウで結果を確認できます。

![Kotlin の実行出力](jvm-output-gradle.png){width=700}

おめでとうございます！初めての Kotlin アプリケーションを実行できました。

## 次のステップ {id="what-s-next"}

以下の詳細について学びましょう：
* [Gradle ビルドファイルのプロパティ](https://docs.gradle.org/current/dsl/org.gradle.api.Project.html#N14E9A)
* [異なるプラットフォームへのターゲット設定とライブラリ依存関係の設定](gradle-configure-project.md)
* [コンパイラオプションとその渡し方](gradle-compiler-options.md)
* [インクリメンタルコンパイル、キャッシュのサポート、ビルドレポート、Kotlin デーモン](gradle-compilation-and-caches.md)