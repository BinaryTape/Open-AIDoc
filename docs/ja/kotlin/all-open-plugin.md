[//]: # (title: All-openコンパイラープラグイン)

Kotlinでは、クラスとそのメンバーはデフォルトで`final`です。これは、サブクラス化やランタイムプロキシに依存し、クラスが`open`であることを要求するフレームワークやライブラリで問題を引き起こす可能性があります。

`all-open`コンパイラープラグインは、`open`キーワードを明示的に記述することなく、コンパイル時にクラスとそのメンバーを`open`にします。
アノテーションを作成し、プラグインのオプションに追加した上で、`open`にしたいクラスにそのアノテーションを付与するだけです。

```kotlin
@YourAnnotation
class MyService {
    // このクラスとそのすべてのメンバーはopenになります
    fun doWork() { /* ... */ }
}
```

クラスまたはそのスーパークラスのいずれかに設定されたアノテーションが付与されている場合、そのクラスとそのメンバーは`open`になります。

> Kotlinを使用したSpringアプリケーションでは、[`kotlin-spring`コンパイラープラグイン](kotlin-spring-plugin.md)を使用できます。
> これにより、Springのアノテーションが付与されたクラスとそのメンバーが`open`になります。
>
{style="note"}

## アノテーションの宣言 {id="declare-an-annotation"}

`all-open`プラグインは、その設定に登録したアノテーションでマークされたクラスのみを処理します。
そのため、プラグインを有効にする前に、`open`にしたいクラスをマークするためのアノテーションを宣言してください。
例えば、`AllOpenMarker`です。

```kotlin
package com.example

annotation class AllOpenMarker
```

## プラグインの適用 {id="apply-the-plugin"}

### Gradle {id="gradle"}

プラグインを有効にするには、`build.gradle(.kts)`ファイルの`plugins {}`ブロックに追加します。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
// build.gradle.kts
plugins {
    kotlin("jvm") version "%kotlinVersion%"
    kotlin("plugin.allopen") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
// build.gradle
plugins {
    id "org.jetbrains.kotlin.jvm" version "%kotlinVersion%"
    id "org.jetbrains.kotlin.plugin.allopen" version "%kotlinVersion%"
}
```

</tab>
</tabs>

次に、先ほど宣言したアノテーション（例: `com.example.AllOpenMarker`）、またはクラスを`open`にするアノテーションのリストを指定します。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
allOpen {
    annotation("com.example.AllOpenMarker")
    // 複数のアノテーションを指定することもできます:
    // annotations("com.example.AllOpenMarker", "com.anotherPackage.OtherAnnotation")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
allOpen {
    annotation("com.example.AllOpenMarker")
    // 複数のアノテーションを指定することもできます:
    // annotations("com.example.AllOpenMarker", "com.anotherPackage.OtherAnnotation")
}
```

</tab>
</tabs>

### Maven {id="maven"}

`pom.xml`ファイルにプラグインを追加します。

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
            <plugin>all-open</plugin>
        </compilerPlugins>

        <pluginOptions>
            <!-- 複数のアノテーションを指定する場合は行を追加します -->
            <option>all-open:annotation=com.example.AllOpenMarker</option>
            <option>all-open:annotation=com.anotherPackage.OtherAnnotation</option>
        </pluginOptions>
    </configuration>

    <dependencies>
        <dependency>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-allopen</artifactId>
            <version>${kotlin.version}</version>
        </dependency>
    </dependencies>
</plugin>
```

## `all-open`プラグインの使用 {id="use-the-all-open-plugin"}

クラスまたはそのスーパークラスのいずれかに作成した`com.example.AllOpenMarker`アノテーションが付与されている場合、そのクラスとすべてのメンバーが`open`になります。

```kotlin
package com.example

@AllOpenMarker
class TestClass {
    // このクラスとそのすべてのメンバーはopenになります
}
```

このプラグインはメタアノテーションにも対応しています。別のアノテーションを`@AllOpenMarker`でマークすると、そのアノテーションが付与されたすべてのクラスとメンバーも`open`になります。

```kotlin
package com.example

// 事前に作成したアノテーションでマークされたアノテーション
@AllOpenMarker
annotation class AnotherAllOpenMarker

@AllOpenMarker
class NewClass {
    // このクラスとそのすべてのメンバーはopenになります
}

@AnotherAllOpenMarker
class AnotherClass {
    // このクラスとそのすべてのメンバーも同様にopenになります
}
```

<!--
## コマンドラインコンパイラー {id="command-line-compiler"}

`all-open`コンパイラープラグインのJARは、Kotlinコンパイラーのバイナリ配布に含まれています。`-Xplugin` kotlincオプションを使用してJARファイルへのパスを指定することで、プラグインをアタッチできます。

```bash
-Xplugin=$KOTLIN_HOME/lib/allopen-compiler-plugin.jar
```

`annotation`プラグインオプションを使用して`all-open`アノテーションを直接指定するか、_プリセット_を有効にすることができます。

```bash
# プラグインオプションの形式は次のとおりです: "-P plugin:<プラグインID>:<キー>=<値>"。
# オプションは繰り返して指定できます。

-P plugin:org.jetbrains.kotlin.allopen:annotation=com.my.Annotation
-P plugin:org.jetbrains.kotlin.allopen:preset=spring
```

`all-open`プラグインで使用可能なプリセットは、`spring`、`micronaut`、および`quarkus`です。
-->

## 次のステップ {id="what-s-next"}

* Springアプリケーションの場合は、Springアノテーションが付与されたクラスを`open`にする設定済みラッパーである[`kotlin-spring`プラグイン](kotlin-spring-plugin.md)を使用してください。
* JPAエンティティの場合は、エンティティを`open`にし、引数なしのコンストラクタ（zero-argument constructor）を生成する[`kotlin-jpa`プラグイン](kotlin-jpa-plugin.md)を使用してください。
* [`all-open`コンパイラープラグイン](https://github.com/JetBrains/kotlin/tree/master/plugins/allopen)のソースコードを確認してください。