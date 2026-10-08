[//]: # (title: No-arg コンパイラプラグイン)

*no-arg* コンパイラプラグインは、特定のアノテーションが付与されたクラスに対して、追加の引数なしコンストラクタ（zero-argument constructor）を生成します。

生成されるコンストラクタはシンセティック（synthetic）であるため、Java や Kotlin から直接呼び出すことはできませんが、リフレクションを使用して呼び出すことができます。

これにより、Kotlin または Java の観点からは引数なしコンストラクタがない場合でも、Java Persistence API (JPA) がクラスをインスタンス化できるようになります（[以下](#jpa-サポート)の `kotlin-jpa` プラグインの説明を参照してください）。

## Kotlin ファイル内での記述 {id="in-your-kotlin-file"}

引数なしコンストラクタが必要なコードをマークするために、新しいアノテーションを追加します：

```kotlin
package com.my

annotation class Annotation
```

## Gradle {id="gradle"}

Gradle の plugins DSL を使用してプラグインを追加します：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("plugin.noarg") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id "org.jetbrains.kotlin.plugin.noarg" version "%kotlinVersion%"
}
```

</tab>
</tabs>

次に、アノテーションが付与されたクラスに対して引数なしコンストラクタの生成をトリガーする、no-arg アノテーションのリストを指定します：

```groovy
noArg {
    annotation("com.my.Annotation")
}
```

シンセティックコンストラクタから初期化ロジックを実行させたい場合は、`invokeInitializers` オプションを有効にします。デフォルトでは無効になっています。

```groovy
noArg {
    invokeInitializers = true
}
```

## Maven {id="maven"}

```xml
<plugin>
    <artifactId>kotlin-maven-plugin</artifactId>
    <groupId>org.jetbrains.kotlin</groupId>
    <version>${kotlin.version}</version>

    <configuration>
        <compilerPlugins>
            <!-- または JPA サポートのための "jpa" -->
            <plugin>no-arg</plugin>
        </compilerPlugins>

        <pluginOptions>
            <option>no-arg:annotation=com.my.Annotation</option>
            <!-- シンセティックコンストラクタでインスタンス初期化子を呼び出す -->
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

## JPA サポート {id="jpa-support"}

`all-open` の上にラップされた `kotlin-spring` プラグインと同様に、`kotlin-jpa` は `no-arg` の上にラップされています。このプラグインは、[`@Entity`](https://docs.oracle.com/javaee/7/api/javax/persistence/Entity.html)、[`@Embeddable`](https://docs.oracle.com/javaee/7/api/javax/persistence/Embeddable.html)、および [`@MappedSuperclass`](https://docs.oracle.com/javaee/7/api/javax/persistence/MappedSuperclass.html) を *no-arg* アノテーションとして自動的に指定します。

Gradle の plugins DSL を使用してプラグインを追加します：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("plugin.jpa") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id "org.jetbrains.kotlin.plugin.jpa" version "%kotlinVersion%"
}
```

</tab>
</tabs>

Maven では、`jpa` プラグインを有効にします：

```xml
<compilerPlugins>
    <plugin>jpa</plugin>
</compilerPlugins>
```

## コマンドラインコンパイラ {id="command-line-compiler"}

コンパイラプラグインのクラスパスにプラグインの JAR ファイルを追加し、アノテーションまたはプリセットを指定します：

```bash
-Xplugin=$KOTLIN_HOME/lib/noarg-compiler-plugin.jar
-P plugin:org.jetbrains.kotlin.noarg:annotation=com.my.Annotation
-P plugin:org.jetbrains.kotlin.noarg:preset=jpa
```
