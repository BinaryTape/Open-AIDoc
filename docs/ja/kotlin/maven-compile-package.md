[//]: # (title: Mavenアプリケーションのパッケージング)

KotlinアプリケーションをMavenでパッケージ化するには、標準のJARファイル、またはすべての依存関係を含む自己完結型（fat）JARファイルを作成できます。アプリケーションをパッケージ化することで、Java Runtime Environment (JRE) がインストールされている任意のマシンで配布および実行できるようになります。

## JARファイルの作成 {id="create-jar-files"}

モジュールのコードのみを含む小さなJARファイルを作成するには、Mavenの`pom.xml`ファイルの`<build><plugins>`の下に以下を含めます。ここで`main.class`はプロパティとして定義され、メインのKotlinまたはJavaクラスを指します。

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-jar-plugin</artifactId>
    <version>3.5.0</version>
    <configuration>
        <archive>
            <manifest>
                <addClasspath>true</addClasspath>
                <mainClass>${main.class}</mainClass>
            </manifest>
        </archive>
    </configuration>
</plugin>
```

## 自己完結型JARファイルの作成 {id="create-self-contained-jar-files"}

モジュールのコードとその依存関係を含む、自己完結型のJARファイルを作成するには、Mavenの`pom.xml`ファイルの`<build><plugins>`の下に以下を含めます。ここで`main.class`はプロパティとして定義され、メインのKotlinまたはJavaクラスを指します。

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-assembly-plugin</artifactId>
    <version>3.8.0</version>
    <executions>
        <execution>
            <id>make-assembly</id>
            <phase>package</phase>
            <goals> <goal>single</goal> </goals>
            <configuration>
                <archive>
                    <manifest>
                        <mainClass>${main.class}</mainClass>
                    </manifest>
                </archive>
                <descriptorRefs>
                    <descriptorRef>jar-with-dependencies</descriptorRef>
                </descriptorRefs>
            </configuration>
        </execution>
    </executions>
</plugin>
```

この自己完結型JARファイルは、JREに直接渡してアプリケーションを実行できます：

``` bash
java -jar target/mymodule-0.0.1-SNAPSHOT-jar-with-dependencies.jar
```
