[//]: # (title: Lombokコンパイラプラグイン)
<primary-label ref="alpha"/>

Kotlin Lombokコンパイラプラグインを使用すると、同じJava/Kotlin混合モジュール内のKotlinコードからJavaのLombok宣言を生成および使用できるようになります。
別のモジュールからそのような宣言を呼び出す場合は、そのモジュールのコンパイルにこのプラグインを使用する必要はありません。

Lombokコンパイラプラグインは[Lombok](https://projectlombok.org/)を置き換えるものではありませんが、Java/Kotlin混合モジュールでLombokが動作するのを助けます。
そのため、このプラグインを使用する場合でも、通常通りLombokを設定する必要があります。
[Lombokコンパイラプラグインの設定方法](#using-the-lombok-configuration-file)の詳細については、こちらを参照してください。

## サポートされているアノテーション {id="supported-annotations"}

このプラグインは以下のアノテーションをサポートしています。
* `@Getter`, `@Setter`
* `@Builder`, `@SuperBuilder`
* `@NoArgsConstructor`, `@RequiredArgsConstructor`, および `@AllArgsConstructor`
* `@Data`
* `@With`
* `@Value`

このプラグインの開発は継続中です。詳細な現在の状態については、[LombokコンパイラプラグインのREADME](https://github.com/JetBrains/kotlin/tree/master/plugins/lombok)をご覧ください。

現在、`@Tolerate`アノテーションをサポートする予定はありません。ただし、YouTrackの[@Tolerateの課題](https://youtrack.jetbrains.com/issue/KT-53564/Kotlin-Lombok-Support-Tolerate)に投票していただければ、検討する可能性があります。

> Kotlinコード内でLombokアノテーションを使用した場合、Kotlinコンパイラはそれらを無視します。
>
{style="note"}

## Gradle {id="gradle"}

`build.gradle(.kts)`ファイルに`kotlin-plugin-lombok` Gradleプラグインを適用します。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("plugin.lombok") version "%kotlinVersion%"
    id("io.freefair.lombok") version "%lombokVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.kotlin.plugin.lombok' version '%kotlinVersion%'
    id 'io.freefair.lombok' version '%lombokVersion%'
}
```

</tab>
</tabs>

[Lombokコンパイラプラグインの使用例を含むテストプロジェクト](https://github.com/kotlin-hands-on/kotlin-lombok-examples/tree/master/kotlin_lombok_gradle/nokapt)をご覧ください。

### Lombok設定ファイルの使用 {id="using-the-lombok-configuration-file"}

[Lombok設定ファイル](https://projectlombok.org/features/configuration)である`lombok.config`を使用する場合、プラグインがそれを見つけられるように、ファイルのパスを設定する必要があります。
パスはモジュールのディレクトリからの相対パスである必要があります。
例えば、`build.gradle(.kts)`ファイルに以下のコードを追加します。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlinLombok {
    lombokConfigurationFile(file("lombok.config"))
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlinLombok {
    lombokConfigurationFile file("lombok.config")
}
```

</tab>
</tabs>

[Lombokコンパイラプラグインと`lombok.config`の使用例を含むテストプロジェクト](https://github.com/kotlin-hands-on/kotlin-lombok-examples/tree/master/kotlin_lombok_gradle/withconfig)をご覧ください。

## Maven {id="maven"}

Lombokコンパイラプラグインを使用するには、`compilerPlugins`セクションに`lombok`プラグインを、`dependencies`セクションに`kotlin-maven-lombok`依存関係を追加します。
[Lombok設定ファイル](https://projectlombok.org/features/configuration)である`lombok.config`を使用する場合は、`pluginOptions`でプラグインにそのパスを指定します。`pom.xml`ファイルに以下の行を追加してください。

```xml
<plugin>
    <groupId>org.jetbrains.kotlin</groupId>
    <artifactId>kotlin-maven-plugin</artifactId>
    <version>${kotlin.version}</version>
    <configuration>
        <compilerPlugins>
            <plugin>lombok</plugin>
        </compilerPlugins>
        <pluginOptions>
            <option>lombok:config=${project.basedir}/lombok.config</option>
        </pluginOptions>
    </configuration>
    <dependencies>
        <dependency>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-lombok</artifactId>
            <version>${kotlin.version}</version>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.20</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>
</plugin>
```

[Lombokコンパイラプラグインと`lombok.config`の使用例を含むテストプロジェクトの例](https://github.com/kotlin-hands-on/kotlin-lombok-examples/tree/master/kotlin_lombok_maven/nokapt)をご覧ください。

## kaptとの併用 {id="using-with-kapt"}

デフォルトでは、[kapt](kapt.md)コンパイラプラグインはすべてのアノテーションプロセッサを実行し、javacによるアノテーション処理を無効にします。
kaptと共に[Lombok](https://projectlombok.org/)を実行するには、javacのアノテーションプロセッサが動作し続けるようにkaptを設定します。

Gradleを使用している場合は、`build.gradle(.kts)`ファイルに以下のオプションを追加します。

```groovy
kapt {
    keepJavacAnnotationProcessors = true
}
```

Mavenでは、以下の設定を使用してJavaコンパイラでLombokを起動します。

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.5.1</version>
    <configuration>
        <source>1.8</source>
        <target>1.8</target>
        <annotationProcessorPaths>
            <annotationProcessorPath>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
                <version>${lombok.version}</version>
            </annotationProcessorPath>
        </annotationProcessorPaths>
    </configuration>
</plugin>    
```

アノテーションプロセッサがLombokによって生成されたコードに依存していない場合、Lombokコンパイラプラグインは[kapt](kapt.md)と正しく動作します。

kaptとLombokコンパイラプラグインの使用例については、以下のテストプロジェクトをご覧ください。
* [Gradle](https://github.com/JetBrains/kotlin/tree/master/libraries/tools/kotlin-gradle-plugin-integration-tests/src/test/resources/testProject/lombokProject/yeskapt)を使用する場合。
* [Maven](https://github.com/kotlin-hands-on/kotlin-lombok-examples/tree/master/kotlin_lombok_maven/yeskapt)を使用する場合。

## コマンドラインコンパイラ {id="command-line-compiler"}

LombokコンパイラプラグインのJARは、Kotlinコンパイラのバイナリ配布物に含まれています。`kotlinc`の`Xplugin`オプションを使用して、JARファイルへのパスを指定することでプラグインをアタッチできます。

```bash
-Xplugin=$KOTLIN_HOME/lib/lombok-compiler-plugin.jar
```

`lombok.config`ファイルを使用したい場合は、`<PATH_TO_CONFIG_FILE>`を`lombok.config`へのパスに置き換えてください。

```bash
# プラグインオプションの形式は "-P plugin:<plugin id>:<key>=<value>" です。 
# オプションは繰り返すことができます。

-P plugin:org.jetbrains.kotlin.lombok:config=<PATH_TO_CONFIG_FILE>
```
