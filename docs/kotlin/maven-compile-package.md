[//]: # (title: 打包您的 Maven 应用程序)

要使用 Maven 打包您的 Kotlin 应用程序，您可以创建一个标准 JAR 文件，或者创建一个包含其所有依赖项的自包含 (fat) JAR 文件。打包应用程序允许您分发它，并在任何安装了 Java 运行时环境 (JRE) 的计算机上运行。

## 创建 JAR 文件 {id="create-jar-files"}

要创建一个仅包含模块代码的小型 JAR 文件，请在 Maven `pom.xml` 文件的 `<build><plugins>` 下包含以下内容，其中 `main.class` 已定义为一个属性并指向 Kotlin 或 Java 的主类：

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

## 创建自包含的 JAR 文件 {id="create-self-contained-jar-files"}

要创建一个包含模块代码及其依赖项的自包含 JAR 文件，请在 Maven `pom.xml` 文件的 `<build><plugins>` 下包含以下内容，其中 `main.class` 已定义为一个属性并指向 Kotlin 或 Java 的主类：

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

此自包含的 JAR 文件可以直接传递给 JRE 来运行您的应用程序：

``` bash
java -jar target/mymodule-0.0.1-SNAPSHOT-jar-with-dependencies.jar
```
