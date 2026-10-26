[//]: # (title: Java プロジェクトへの Kotlin の追加 – チュートリアル)

<web-summary>既存の Java プロジェクトに Kotlin を統合する − Maven または Gradle のビルドファイルの設定、ソースファイルの整理、IntelliJ IDEA での Java コードから Kotlin への変換。</web-summary>

Kotlin は Java と完全な相互運用性があるため、すべてを書き直すことなく、既存の Java プロジェクトに段階的に導入できます。

このチュートリアルでは、次の方法を学びます。

* Java と Kotlin の両方のコードをコンパイルするように Maven または Gradle ビルドツールを設定する。
* プロジェクトディレクトリ内で Java および Kotlin のソースファイルを整理する。
* IntelliJ IDEA を使用して Java ファイルを Kotlin に変換する。

> このチュートリアルでは、既存の任意の Java プロジェクトを使用することも、Maven と Gradle の両方のビルドファイルが既にセットアップされている公開 [サンプルプロジェクト](https://github.com/kotlin-hands-on/kotlin-junit-sample/tree/main/complete) をクローンして使用することもできます。
> 
> また、用意されている [スキル](https://github.com/Kotlin/kotlin-agent-skills/blob/main/skills/kotlin-tooling-java-to-kotlin/SKILL.md) を使用して、任意の AI エージェントに変換を任せることもできます。ただし、AI の処理結果は完全に予測可能ではないことに留意してください。
>
{style="tip"}

## プロジェクトの設定 {id="project-configuration"}

Java プロジェクトに Kotlin を追加するには、使用するビルドツールに応じて、Kotlin と Java の両方を使用できるようにプロジェクトを設定する必要があります。

プロジェクトを設定することで、Kotlin と Java の両方のコードが適切にコンパイルされ、互いにシームレスに参照できるようになります。

### Maven {id="maven"}

> **IntelliJ IDEA 2025.3** 以降では、Maven ベースの Java プロジェクトに最初の Kotlin ファイルを追加すると、IDE が `pom.xml` ファイルを自動的に更新し、Kotlin Maven プラグインと標準依存関係を追加します。  
> バージョンやビルドフェーズをカスタマイズしたい場合は、手動で設定することも可能です。
>
{style="note"}

Maven プロジェクトで Kotlin と Java を併用するには、`pom.xml` ファイルに Kotlin Maven プラグインを適用し、Kotlin の依存関係を追加します。

1. `<properties>` セクションに、Kotlin のバージョンプロパティを追加します。

    ```xml
    ```
   {src="jvm-test-tutorial/pom.xml" ignore-vars="false" include-lines="13,17,18"}

2. `<dependencies>` セクションで、`<plugins>` セクションに必要な依存関係を追加します。

    ```xml
    ```
   {src="jvm-test-tutorial/pom.xml" include-lines="32,38-43,45-49,55"}

3. `<build><plugins>` セクションに、Kotlin プラグインを追加します。

    ```xml
    ```
   {src="jvm-test-tutorial/pom.xml" include-lines="57-58,95-96,99-107"}

   Kotlin Maven プラグインで `<extensions>true</extensions>` を有効にすると、以下が行われます。

   * プロジェクトに `kotlin-stdlib` 依存関係が自動的に追加される。
   * 実行フェーズが設定され、Kotlin が先にコンパイルされてから Java がコンパイルされるようになる。
   * Java コードから Kotlin コードを参照したり、その逆も行えるようになる。
   * JVM ターゲットバージョンが Java コンパイラのバージョンと自動的に整合される。

   extensions を有効にした Kotlin Maven プラグインを使用する場合、`<build><pluginManagement>` セクションに個別の `maven-compiler-plugin` を記述する必要はありません。

4. IDE で Maven プロジェクトを再読み込みします。
5. テストを実行して設定を確認します。

    ```bash
    ./mvnw clean test
    ```

### Gradle {id="gradle"}

Gradle プロジェクトで Kotlin と Java を併用するには、`build.gradle.kts` ファイルに Kotlin JVM プラグインを適用し、Kotlin の依存関係を追加します。

1. `plugins {}` ブロックに Kotlin JVM プラグインを追加します。

    ```kotlin
    plugins {
        // Other plugins
        kotlin("jvm") version "%kotlinVersion%"
    }
    ```

2. Java のバージョンに合わせて JVM ツールチェーンのバージョンを設定します。

    ```kotlin
    kotlin {
        jvmToolchain(17)
    }
    ```

   これにより、Kotlin が Java コードと同じ JDK バージョンを使用するようになります。

3. `dependencies {}` ブロックに、Kotlin のテストユーティリティを提供し、JUnit と統合する `kotlin("test")` ライブラリを追加します。

    ```kotlin
    dependencies {
        // Other dependencies
    
        testImplementation(kotlin("test"))
        // Other test dependencies
    }
    ```

4. IDE で Gradle プロジェクトを再読み込みします。
5. テストを実行して設定を確認します。

    ```bash
    ./gradlew clean test
    ```

## プロジェクト構造 {id="project-structure"}

この設定により、同じソースディレクトリ内で Java ファイルと Kotlin ファイルを混在させることができます。

```none
src/
  ├── main/
  │    ├── java/          # Java および Kotlin のプロダクションコード
  │    └── kotlin/        # 追加の Kotlin プロダクションコード（オプション）
  └── test/
       ├── java/          # Java および Kotlin のテストコード
       └── kotlin/        # 追加の Kotlin テストコード（オプション）
```

これらのディレクトリは手動で作成することも、最初の Kotlin ファイルを追加するときに IntelliJ IDEA に自動作成させることもできます。

Kotlin プラグインは `src/main/java` と `src/test/java` の両方のディレクトリを自動的に認識するため、同じディレクトリ内に `.kt` ファイルと `.java` ファイルを共存させることができます。

## Java ファイルを Kotlin に変換する {id="convert-java-files-to-kotlin"}

Kotlin プラグインには、Java ファイルを自動的に Kotlin に変換する Java to Kotlin コンバーター（_J2K_）も同梱されています。
ファイルに対して J2K を使用するには、コンテキストメニューまたは IntelliJ IDEA の **Code** メニューで **Convert Java File to Kotlin File** をクリックします。

![Convert Java to Kotlin](convert-java-to-kotlin.png){width=500}

コンバーターは完全無欠というわけではありませんが、Java から Kotlin へのボイラープレートコードの大部分を適切に変換してくれます。ただし、場合によっては手動での微調整が必要になります。

## コンパイラプラグインを調べる {initial-collapse-state="collapsed" collapsible="true" id="explore-compiler-plugins"}

[Spring](https://spring.io/) や Java Persistence API (JPA) を使用するより複雑なプロジェクトがある場合は、Kotlin の言語機能をフレームワークの要求に自動的に適応させ、ボイラープレートを削減する Kotlin コンパイラプラグインを使用できます。

* **[`all-open`](all-open-plugin.md)** プラグインは、特定のアノテーションが付けられたクラスとそのメンバーを自動的に `open` にします。これは、クラスが `final` でないことを要求する Spring などのフレームワークで特に役立ちます。

  Spring 向けには、`all-open` のラッパーである専用の [`kotlin-spring`](kotlin-spring-plugin.md) プラグインを使用できます。これにより、Spring アノテーションが自動的に指定されます。
* **[`no-arg`](no-arg-plugin.md)** プラグインは、特定のアノテーションが付けられたクラスに対して、追加の引数なしコンストラクタ（zero-argument constructor）を生成します。これにより、JPA がデフォルトコンストラクタを持たないクラスをインスタンス化できるようになります。

  JPA 向けには、`no-arg` と `all-open` の両方をラップする [`kotlin-jpa`](kotlin-jpa-plugin.md) プラグインを使用できます。これにより JPA アノテーションが自動的に指定され、エンティティは `open` になり、引数なしコンストラクタが追加されます。
* **[`power-assert`](power-assert.md)** プラグインは、アサーションに関するコンテキスト情報を含む詳細な失敗メッセージを提供することで、デバッグ体験を向上させます。中間値を表示し、テストが失敗した理由を理解しやすくします。

## 次のステップ {id="next-step"}

Java プロジェクトで Kotlin を使い始める最も簡単な方法は、まず Kotlin のテストを追加することです。

[Java プロジェクトに最初の Kotlin テストを追加する](jvm-test-using-junit.md)

### 関連項目 {id="see-also"}

* [Kotlin と Java の相互運用性の詳細](java-to-kotlin-interop.md)
* [Maven ビルド設定リファレンス](maven.md)