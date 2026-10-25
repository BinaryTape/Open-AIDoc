[//]: # (title: No-arg コンパイラープラグイン)

`no-arg` コンパイラープラグインは、特定のアノテーションが付与されたクラスに対して引数なしコンストラクター（zero-argument constructor）を生成します。

生成されたコンストラクターには `HIDDEN` レベルの `@Deprecated` アノテーションが付与されるため、Javaからは呼び出せますが、Kotlinからは呼び出せません。
フレームワークはリフレクションを通じてそれを呼び出すことができます。

例えばこれにより、Java Persistence API (JPA) などのフレームワークが、引数なしコンストラクターを宣言していないKotlinクラスをインスタンス化できるようになります。

> KotlinでJPAエンティティを扱う場合は、[`kotlin-jpa` コンパイラープラグイン](kotlin-jpa-plugin.md)を使用できます。
> このプラグインは、`@Entity`、`@Embeddable`、`@MappedSuperclass` などのJPAアノテーションを自動的に指定します。
>
{style="note"}

## アノテーションの宣言 {id="declare-an-annotation"}

`no-arg` プラグインは、その設定で登録したアノテーションが付与されているクラスのみを処理します。
そのためプラグインを有効にする前に、引数なしコンストラクターが必要なクラスをマークするためのアノテーションを宣言してください。
例えば、`NoArgAnnotation` のようになります。

```kotlin
package com.example

annotation class NoArgAnnotation
```

## プラグインの適用 {id="apply-the-plugin"}

### Gradle {id="gradle"}

`build.gradle(.kts)` ファイルの `plugins {}` ブロックに `no-arg` プラグインを追加します。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("jvm") version "%kotlinVersion%"  // 使用するKotlinのバージョン
    kotlin("plugin.noarg") version "%kotlinVersion%" // Kotlin no-arg プラグイン
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id "org.jetbrains.kotlin.jvm" version "%kotlinVersion%"
    id "org.jetbrains.kotlin.plugin.noarg" version "%kotlinVersion%"
}
```

</tab>
</tabs>

次に、アノテーションが付与されたクラスに対して引数なしコンストラクターを生成するために、先ほど宣言したアノテーション（例えば `com.example.NoArgAnnotation`）を指定します。

```groovy
noArg {
    annotation("com.example.NoArgAnnotation")
}
```

生成されたコンストラクターからクラスの初期化ロジックを実行させたい場合は、`invokeInitializers` オプションを有効にします。このオプションはデフォルトで無効になっています。

```groovy
noArg {
    invokeInitializers = true
}
```

### Maven {id="maven"}

`pom.xml` ファイルにプラグインを追加します。

```xml
<properties>
    <kotlin.version>%kotlinVersion%</kotlin.version>
</properties>

<plugin>
    <artifactId>kotlin-maven-plugin</artifactId>
    <groupId>org.jetbrains.kotlin</groupId>
    <version>${kotlin.version}</version>

    <configuration>
        <compilerPlugins>
            <plugin>no-arg</plugin>
        </compilerPlugins>

        <pluginOptions>
            <option>no-arg:annotation=com.example.NoArgAnnotation</option>
            <!-- 生成されたコンストラクターでインスタンス初期化子を呼び出す -->
            <!-- <option>no-arg:invokeInitializers=true</option> -->
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

## `no-arg` プラグインの使用 {id="use-the-no-arg-plugin"}

プラグインが適用されると、登録されたアノテーションが付与されたクラスにはコンパイル時に引数なしコンストラクターが生成されます。手動でコンストラクターを宣言する必要はありません。

```kotlin
package com.example

// no-arg プラグインはこのクラスに対して引数なしコンストラクターを生成します
@NoArgAnnotation
class MyEntity(val id: Int)
```

<!--
## コマンドラインコンパイラー {id="command-line-compiler"}

コンパイラープラグインのクラスパスにプラグインのJARファイルを追加し、アノテーションまたはプリセットを指定します。

```bash
-Xplugin=$KOTLIN_HOME/lib/noarg-compiler-plugin.jar
-P plugin:org.jetbrains.kotlin.noarg:annotation=com.my.Annotation
-P plugin:org.jetbrains.kotlin.noarg:preset=jpa
```
-->

## 次のステップ {id="what-s-next"}

* JPAエンティティには、[`kotlin-jpa` プラグイン](kotlin-jpa-plugin.md)を使用してください。このプラグインは、`@Entity`、`@Embeddable`、`@MappedSuperclass` などのJPAアノテーションを使って `no-arg` および `all-open` プラグインを設定します。
* [`no-arg` コンパイラープラグイン](https://github.com/JetBrains/kotlin/tree/master/plugins/noarg)のソースコードを確認してください。