[//]: # (title: Maven 애플리케이션 패키징)

Maven으로 Kotlin 애플리케이션을 패키징하려면, 표준 JAR 파일 또는 모든 의존성을 포함하는 독립형(self-contained, fat) JAR 파일을 생성할 수 있습니다. 애플리케이션을 패키징하면 Java 런타임 환경(JRE)이 설치된 모든 머신에서 이를 배포하고 실행할 수 있습니다.

## JAR 파일 생성 {id="create-jar-files"}

모듈의 코드만 포함된 작은 JAR 파일을 생성하려면 Maven `pom.xml` 파일의 `<build><plugins>` 아래에 다음 내용을 포함하세요. 여기서 `main.class`는 속성으로 정의되며 메인 Kotlin 또는 Java 클래스를 가리킵니다.

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

## 독립형 JAR 파일 생성 {id="create-self-contained-jar-files"}

모듈의 코드와 의존성을 모두 포함하는 독립형(self-contained) JAR 파일을 생성하려면 Maven `pom.xml` 파일의 `<build><plugins>` 아래에 다음 내용을 포함하세요. 여기서 `main.class`는 속성으로 정의되며 메인 Kotlin 또는 Java 클래스를 가리킵니다.

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

이 독립형 JAR 파일은 JRE에 직접 전달하여 애플리케이션을 실행할 수 있습니다.

``` bash
java -jar target/mymodule-0.0.1-SNAPSHOT-jar-with-dependencies.jar
```
