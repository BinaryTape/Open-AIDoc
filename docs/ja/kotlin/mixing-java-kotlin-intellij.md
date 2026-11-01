[//]: # (title: Java プロジェクトへの Kotlin の追加 – チュートリアル)

<web-summary>既存の Java プロジェクトに Kotlin を統合します − Maven または Gradle ビルドファイルの設定、ソースファイルの整理、IntelliJ IDEA での Java コードから Kotlin への変換を行います。</web-summary>

Kotlin は Java と完全に相互運用できるため、すべてを書き直すことなく、既存の Java プロジェクトに段階的に導入できます。

このチュートリアルでは、以下の方法を学びます。

* Java と Kotlin の両方のコードをコンパイルするように Maven または Gradle ビルドツールを設定する。
* プロジェクトディレクトリ内で Java と Kotlin のソースファイルを整理する。
* IntelliJ IDEA を使用して Java ファイルを Kotlin に変換する。

> このチュートリアルでは、任意の既存 Java プロジェクトを使用することも、Maven と Gradle の両方のビルドファイルがあらかじめ設定されている公開の[サンプルプロジェクト](https://github.com/kotlin-hands-on/kotlin-junit-sample/tree/main/complete)をクローンして使用することもできます。
> 
> また、用意されている [スキル](https://github.com/Kotlin/kotlin-agent-skills/blob/main/skills/kotlin-tooling-java-to-kotlin/SKILL.md) を使用して、お好みの AI エージェントに変換を任せることも可能です。
> ただし、AI の処理結果は完全に予測可能ではないことに留意してください。
>
{style="tip"}

## プロジェクトの設定 {id="project-configuration"}

Java プロジェクトに Kotlin を追加するには、使用しているビルドツールに応じて、Kotlin と Java の両方を使用するようにプロジェクトを設定する必要があります。

このプロジェクト設定により、Kotlin と Java の両方のコードが適切にコンパイルされ、互いにシームレスに参照できるようになります。

### Maven {id="maven"}

> **IntelliJ IDEA 2025.3** 以降では、Maven ベースの Java プロジェクトに最初の Kotlin ファイルを追加すると、  
> IDE が自動的に `pom.xml` ファイルを更新し、Kotlin Maven プラグインと標準依存関係を追加します。  
> バージョンやビルドフェーズをカスタマイズしたい場合は、引き続き手動で設定することも可能です。
>
{style="note"}

Maven プロジェクトで Kotlin と Java を一緒に使用するには、Kotlin Maven プラグインを適用し、`pom.xml` ファイルに Kotlin の依存関係を追加します。

1. `<properties>` セクションに、Kotlin のバージョンプロパティを追加します。

    ```xml
    <properties>
        <kotlin.version>%kotlinVersion%</kotlin.version>
    </properties>
    ```

2. `<dependencies>` セクションに必要な依存関係を追加します。

    ```xml
    <dependencies>
        <!-- テストランタイム用の JUnit Jupiter エンジンを追加 -->
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-engine</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-params</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    ```

3. `<build><plugins>` セクションに、Kotlin プラグインを追加します。

    ```xml
    <build>
        <pluginManagement><!-- Maven のデフォルト使用を避けるためにプラグインのバージョンを固定（親 pom ファイルに移動可能） -->
                <!-- Kotlin extensions を使用する場合、maven-compiler-plugin は不要 -->
            </plugins>
            <!-- メインソースおよびテストソースに対して Kotlin Maven プラグインを有効化 -->
            <plugin>
                <groupId>org.jetbrains.kotlin</groupId>
                <artifactId>kotlin-maven-plugin</artifactId>
                <version>${kotlin.version}</version>
                <extensions>true</extensions>
            </plugin>
        </plugins>
    </build>
    ```

   Kotlin Maven プラグインで `<extensions>true</extensions>` を有効にすると、以下のメリットがあります。

   * `kotlin-stdlib` の依存関係がプロジェクトに自動的に追加される。
   * Kotlin を先にコンパイルし、その後に Java をコンパイルするように実行フェーズが設定される。
   * Java コードから Kotlin コードを参照したり、その逆を行ったりできるようになる。
   * JVM ターゲットバージョンが Java コンパイラのバージョンと自動的に揃えられる。

   extensions を有効にした Kotlin Maven プラグインを使用する場合、`<build><pluginManagement>` セクションに個別の `maven-compiler-plugin` を記述する必要はありません。

4. IDE で Maven プロジェクトを再読み込み（リロード）します。
5. テストを実行して設定を検証します。

    ```bash
    ./mvnw clean test
    ```

### Gradle {id="gradle"}

Gradle プロジェクトで Kotlin と Java を一緒に使用するには、Kotlin JVM プラグインを適用し、`build.gradle.kts` ファイルに Kotlin の依存関係を追加します。

1. `plugins {}` ブロックに、Kotlin JVM プラグインを追加します。

    ```kotlin
    plugins {
        // その他のプラグイン
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

3. `dependencies {}` ブロックに、Kotlin のテストユーティリティを提供し JUnit と統合する `kotlin("test")` ライブラリを追加します。

    ```kotlin
    dependencies {
        // その他の依存関係
    
        testImplementation(kotlin("test"))
        // その他のテスト依存関係
    }
    ```

4. IDE で Gradle プロジェクトを再読み込み（リロード）します。
5. テストを実行して設定を検証します。

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

これらのディレクトリは手動で作成することも、最初の Kotlin ファイルを追加したときに IntelliJ IDEA に自動作成させることもできます。

Kotlin プラグインは `src/main/java` と `src/test/java` ディレクトリの両方を自動的に認識するため、`.kt` ファイルと `.java` ファイルを同じディレクトリに配置できます。

## Java ファイルを Kotlin に変換する {id="convert-java-files-to-kotlin"}

Kotlin プラグインには、Java ファイルを自動的に Kotlin に変換する Java to Kotlin コンバーター（_J2K_）も同梱されています。
ファイルに対して J2K を使用するには、ファイルのコンテキストメニューまたは IntelliJ IDEA の **Code** メニューで **Convert Java File to Kotlin File** をクリックします。

![Java を Kotlin に変換](convert-java-to-kotlin.png){width=500}

このコンバーターは完全無欠というわけではありませんが、Java から Kotlin への大半のボイラープレートコードの変換において非常に優れた処理を行います。
ただし、変換後に手動での微調整が必要になる場合もあります。

## コンパイラープラグインを調べる {initial-collapse-state="collapsed" collapsible="true" id="explore-compiler-plugins"}

[Spring](https://spring.io/) や Java Persistence API (JPA) を使用する、より複雑なプロジェクトがある場合は、Kotlin の言語機能をフレームワークの要件に自動的に適応させ、ボイラープレートを削減する Kotlin コンパイラープラグインを使用できます。

* **[`all-open`](all-open-plugin.md)** プラグイン：特定のアノテーションが付けられたクラスとそのメンバーを自動的に `open` にします。これは、クラスが final でないことを要求する Spring のようなフレームワークで特に役立ちます。

  Spring の場合、`all-open` のラッパーである専用の [`kotlin-spring`](kotlin-spring-plugin.md) プラグインを使用できます。Spring のアノテーションが自動的に指定されます。
* **[`no-arg`](no-arg-plugin.md)** プラグイン：特定のアノテーションが付けられたクラスに対して、追加の引数なしコンストラクタ（zero-argument constructor）を生成します。これにより、デフォルトコンストラクタを持たないクラスでも JPA がインスタンス化できるようになります。

  JPA の場合、`no-arg` と `all-open` の両方をラップした [`kotlin-jpa`](kotlin-jpa-plugin.md) プラグインを使用できます。JPA のアノテーションが自動的に指定されるため、エンティティが `open` になり、引数なしコンストラクタが追加されます。
* **[`power-assert`](power-assert.md)** プラグイン：アサーションに対してコンテキスト情報を含む詳細な失敗メッセージを提供することで、デバッグ体験を向上させます。中間値を表示し、テストが失敗した理由を理解しやすくします。

## 次のステップ {id="next-step"}

Java プロジェクトで Kotlin を使い始める最も簡単な方法は、まず Kotlin のテストを追加することです。

[Java プロジェクトに最初の Kotlin テストを追加する](jvm-test-using-junit.md)

### 関連項目 {id="see-also"}

* [Kotlin と Java の相互運用性の詳細](java-to-kotlin-interop.md)
* [Maven ビルド設定リファレンス](maven.md)