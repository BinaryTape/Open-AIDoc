[//]: # (title: Kotlin-jpa コンパイラプラグイン)

`kotlin-jpa` コンパイラプラグインは、Java Persistence API (JPA) 向けに Kotlin プロジェクトを設定します。
JPA には、Kotlin のデフォルトの挙動と競合する2つの要件があります。

* **引数なしコンストラクタ:** JPA はリフレクションを介してエンティティをインスタンス化します（このプロセスは_ハイドレーション (hydration)_ と呼ばれます）。これには引数なしコンストラクタが必要ですが、Kotlin クラスはデフォルトでは引数なしコンストラクタを宣言しません。
* **非 final (non-final) クラス:** JPA プロバイダは、遅延ロード（lazy loading、例えば `@ManyToOne` や `@OneToOne` の関連付けなど）をサポートするためにエンティティのプロキシサブクラスを作成します。Kotlin のクラスとそのメンバはデフォルトで `final` であるため、これが妨げられます。エンティティが `open` でない場合、遅延ロードは機能しません。

`kotlin-jpa` プラグインはこの両方に対応します。これは、以下を適用する事前構成済みのラッパーです。

* JPA アノテーションが付与されたクラスに対して引数なしコンストラクタを生成する [`no-arg` プラグイン](no-arg-plugin.md)
* JPA アノテーションが付与されたクラスとそのメンバを `open` にする [`all-open` プラグイン](all-open-plugin.md)

生成されたコンストラクタには `HIDDEN` レベルの `@Deprecated` アノテーションが付与されるため、Java からは呼び出せますが、Kotlin からは呼び出せません。JPA はリフレクションを介してこれを呼び出すことができます。

> [start.spring.io](https://start.spring.io/#!language=kotlin) を使用して JPA 依存関係を含めたプロジェクトテンプレートを生成した場合、`kotlin-jpa` プラグインはデフォルトで有効になっています。
>
{style="note"}

## サポートされている JPA アノテーション {id="supported-jpa-annotations"}

JPA アノテーションは、古い `javax.persistence` (Java EE) と新しい `jakarta.persistence` (Jakarta EE 9 以降、Spring Boot 3.x 以降で使用) の2つのパッケージ名前空間に存在します。`kotlin-jpa` プラグインは両方の名前空間を認識し、基盤となる `no-arg` および `all-open` プラグインに対して以下の各アノテーションを自動的に指定します。

* `javax.persistence.Entity` および `jakarta.persistence.Entity`
* `javax.persistence.Embeddable` および `jakarta.persistence.Embeddable`
* `javax.persistence.MappedSuperclass` および `jakarta.persistence.MappedSuperclass`

フレームワークのバージョンに応じた名前空間のアノテーションを使用してください。どちらの名前空間に対してもプラグインを設定する必要はありません。両方がデフォルトで有効になっています。

## プラグインの適用 {id="apply-the-plugin"}

### Gradle {id="gradle"}

`build.gradle(.kts)` ファイルの `plugins {}` ブロックに `kotlin-jpa` プラグインを追加します。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("jvm") version "%kotlinVersion%"  // 使用するKotlinのバージョン
    kotlin("plugin.jpa") version "%kotlinVersion%" // Kotlin JPAプラグイン
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id "org.jetbrains.kotlin.jvm" version "%kotlinVersion%"
    id "org.jetbrains.kotlin.plugin.jpa" version "%kotlinVersion%"
}
```

</tab>
</tabs>

### Maven {id="maven"}

Maven では、`kotlin-jpa` プラグインのサポートは `kotlin-maven-noarg` プラグインによって提供されます。
`pom.xml` ファイルに以下を追加します。

```xml
<properties>
    <kotlin.version>%kotlinVersion%</kotlin.version>
</properties>

<plugin>
    <groupId>org.jetbrains.kotlin</groupId>
    <artifactId>kotlin-maven-plugin</artifactId>
    <version>${kotlin.version}</version>
    <configuration>
        <compilerPlugins>
            <plugin>jpa</plugin>
        </compilerPlugins>
    </configuration>
    <dependencies>
        <dependency>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-noarg</artifactId>
            <version>${kotlin.version}</version>
        </dependency>
    </dependencies>
</plugin>
```

> Kotlin 2.3.20 以降、`kotlin-maven-noarg` には暗黙的に `kotlin-maven-allopen` が含まれているため、`all-open` の依存関係を明示的に追加する必要はなくなりました。
>
{style="note"}

## `kotlin-jpa` プラグインの使用 {id="use-the-kotlin-jpa-plugin"}

プラグインを適用すると、一般的な JPA アノテーションが付与されたクラスは `open` になり、コンパイル時に引数なしコンストラクタが生成されます。`open` キーワードを手動で追加したり、引数なしコンストラクタを手作業で宣言したりすることなく、通常のクラスとしてエンティティを記述できます。

以下の例では `jakarta.persistence` 名前空間を使用しています。フレームワークがまだ Java EE を使用している場合は、代わりに `javax.persistence` から同じアノテーションをインポートしてください。プラグインはどちらも処理できます。

```kotlin
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id

@Entity
class Message(
    var text: String,
) {
    // kotlin-jpaプラグインはこのクラスをopenにし、
    // JPAがインスタンス化に使用する引数なしコンストラクタを生成します
    @Id
    @GeneratedValue
    var id: Long? = null
}
```

## JPA エンティティのベストプラクティス {id="best-practices-for-jpa-entities"}

プラグインを適用することでエンティティが `open` になり、引数なしコンストラクタが提供されますが、いくつかの Kotlin のイディオムは依然として JPA プロバイダによるエンティティ管理方法と競合します。一般的な問題を回避するために、以下のガイドラインに従ってください。

* **`data class` ではなく通常のクラスを使用する:** データクラスはイミュータブル（不変）な `val` プロパティを好む傾向があり、すべてのプロパティから `equals()`、`hashCode()`、`toString()` を導出します。エンティティの場合、これによりプロキシが破損したり、`toString()` や `equals()` が遅延関連付けに対して余計なクエリをトリガーしたりする可能性があります。エンティティは通常のクラスとしてモデル化し（プラグインによって `open` になります）、データクラスは DTO やクエリ結果用として使い分けてください。
* **マッピングされたプロパティは `var` として宣言する:** JPA はエンティティをハイドレーションする際にフィールドを設定するため、マッピングされたプロパティはミュータブル（可変）である必要があります。
* **生成される識別子は null 許容かつミュータブルにする:** `@GeneratedValue` が付いた識別子は、エンティティが永続化されるまで `null` になるため、`var id: Long? = null` のように宣言します。
  
  > Kotlin ではプリミティブ型に `lateinit` を使用できません。
  >
  {style="note"}
  
* **`equals()` と `hashCode()` は識別子と型のみに基づくようにする:** すべてのプロパティには基づかせないでください。これにより、エンティティのライフサイクル全体を通じてそれらが安定した状態に保たれ、遅延フィールドのロードを回避できます。

これらの落とし穴に関する詳細な解説については、ブログ記事「[How to avoid common pitfalls with JPA and Kotlin](https://blog.jetbrains.com/idea/2026/01/how-to-avoid-common-pitfalls-with-jpa-and-kotlin/)」を参照してください。

## JPA アノテーションのないクラスへの適用 {id="cover-classes-without-jpa-annotations"}

`kotlin-jpa` プラグインは、[サポートされている JPA アノテーション](#supported-jpa-annotations)のみを設定します。JPA アノテーションが付与されていない型に対して引数なしコンストラクタを生成したりクラスを `open` にしたりするには、独自のアノテーションを宣言し、基盤となる `no-arg` および `all-open` プラグインに登録します。

1. 独自のアノテーションを宣言します。

   ```kotlin
   package com.example

   annotation class OpenNoArgAnnotation
   ```

2. ビルドファイルで、基盤となるプラグインにアノテーションを登録します。

   <tabs group="build-script">
   <tab title="Gradle (Kotlin)" group-key="kotlin">

   `build.gradle.kts` ファイルで、`kotlin-jpa` プラグインを通じて利用可能な `noArg {}` および `allOpen {}` ブロック内にアノテーションを登録します。

   ```kotlin
   plugins {
       kotlin("jvm") version "%kotlinVersion%"
       kotlin("plugin.jpa") version "%kotlinVersion%"
   }

   noArg {
       annotation("com.example.OpenNoArgAnnotation")
   }

   allOpen {
       annotation("com.example.OpenNoArgAnnotation")
   }
   ```

   </tab>
   <tab title="Gradle (Groovy)" group-key="groovy">

   `build.gradle` ファイルで、`kotlin-jpa` プラグインを通じて利用可能な `noArg {}` および `allOpen {}` ブロック内にアノテーションを登録します。

   ```groovy
   plugins {
       id "org.jetbrains.kotlin.jvm" version "%kotlinVersion%"
       id "org.jetbrains.kotlin.plugin.jpa" version "%kotlinVersion%"
   }

   noArg {
       annotation("com.example.OpenNoArgAnnotation")
   }

   allOpen {
       annotation("com.example.OpenNoArgAnnotation")
   }
   ```

   </tab>
   <tab title="Maven" group-key="maven">

   `pom.xml` ファイルで、`kotlin-maven-plugin` の設定に `no-arg:annotation` および `all-open:annotation` オプションを追加します。

   ```xml
   <properties>
       <kotlin.version>%kotlinVersion%</kotlin.version>
   </properties>

   <plugin>
       <groupId>org.jetbrains.kotlin</groupId>
       <artifactId>kotlin-maven-plugin</artifactId>
       <version>${kotlin.version}</version>
       <configuration>
           <compilerPlugins>
               <plugin>jpa</plugin>
           </compilerPlugins>

           <pluginOptions>
               <!-- アノテーションが複数ある場合は行を追加してください -->
               <option>no-arg:annotation=com.example.OpenNoArgAnnotation</option>
               <option>all-open:annotation=com.example.OpenNoArgAnnotation</option>
           </pluginOptions>
       </configuration>
       <dependencies>
           <dependency>
               <groupId>org.jetbrains.kotlin</groupId>
               <artifactId>kotlin-maven-noarg</artifactId>
               <version>${kotlin.version}</version>
           </dependency>
       </dependencies>
   </plugin>
   ```

   </tab>
   </tabs>

3. JPA アノテーションを持たないクラスにアノテーションを付与します。

   ```kotlin
   package com.example

   import jakarta.persistence.Entity
   import jakarta.persistence.GeneratedValue
   import jakarta.persistence.Id

   // kotlin-jpaプラグインによって自動的にカバーされます
   @Entity
   class Message(
       var text: String,
   ) {
       @Id
       @GeneratedValue
       var id: Long? = null
   }

   // カスタムアノテーションによりクラスがopenになり、
   // 引数なしコンストラクタが生成されます
   @OpenNoArgAnnotation
   class MessageMetadata(
       var author: String,
   )
   ```

詳細については、[`no-arg`](no-arg-plugin.md) および [`all-open`](all-open-plugin.md) を参照してください。

## 次のステップ {id="what-s-next"}

* エンティティマッピングに関する一般的な問題を回避する方法についてのブログ記事「[How to avoid common pitfalls with JPA and Kotlin](https://blog.jetbrains.com/idea/2026/01/how-to-avoid-common-pitfalls-with-jpa-and-kotlin/)」をお読みください。
* クラスを `open` にする必要がある Spring アプリケーションの場合は、[`kotlin-spring` プラグイン](kotlin-spring-plugin.md) を使用してください。このプラグインは、`all-open` プラグインを `@Component`、`@Transactional`、`@Configuration` などの Spring アノテーションで構成します。
* [Spring Boot と Kotlin を使ってみる](jvm-get-started-spring-boot.md) チュートリアルを使用して、最初の Spring Boot アプリケーションを作成しましょう。