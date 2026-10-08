[//]: # (title: 封裝您的 Maven 應用程式)

若要使用 Maven 封裝您的 Kotlin 應用程式，您可以建立一個標準的 JAR 檔案，或是建立一個包含所有相依性的自我包含 (fat) JAR 檔案。封裝您的應用程式可讓您在任何安裝了 Java 執行環境 (JRE) 的電腦上發行並執行它。

## 建立 JAR 檔案 {id="create-jar-files"}

若要建立一個僅包含模組程式碼的小型 JAR 檔案，請在 Maven `pom.xml` 檔案的 `<build><plugins>` 下包含以下內容，其中 `main.class` 定義為屬性並指向 Kotlin 或 Java 的主要類別：

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

## 建立自我包含的 JAR 檔案 {id="create-self-contained-jar-files"}

若要建立一個包含模組程式碼及其相依性的自我包含 JAR 檔案，請在 Maven `pom.xml` 檔案的 `<build><plugins>` 下包含以下內容，其中 `main.class` 定義為屬性並指向 Kotlin 或 Java 的主要類別：

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

此自我包含的 JAR 檔案可以直接傳遞給 JRE 來執行您的應用程式：

``` bash
java -jar target/mymodule-0.0.1-SNAPSHOT-jar-with-dependencies.jar
```
