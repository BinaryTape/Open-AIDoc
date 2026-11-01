[//]: # (title: 배포)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="deployment-ktor-plugin"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

이 문서에서는 Ktor 애플리케이션을 배포하는 방법에 대해 전반적으로 살펴봅니다.

> 서버 Ktor 애플리케이션의 배포 프로세스를 간소화하기 위해 다음과 같은 기능을 제공하는 Gradle용 [Ktor](https://github.com/ktorio/ktor-build-plugins) 플러그인을 사용할 수 있습니다:
> - Fat JAR 빌드.
> - 애플리케이션 도커라이징(Dockerizing).

## Ktor 배포 세부 사항 {id="ktor-specifics"}
서버 Ktor 애플리케이션의 배포 프로세스는 다음과 같은 세부 사항에 따라 달라집니다:
* 애플리케이션을 독립 실행형(self-contained) 패키지로 배포할지, 아니면 서블릿 컨테이너 내부에 배포할지 여부.
* 서버를 생성하고 구성하는 데 어떤 방식을 사용하는지 여부.

### 독립 실행형 앱 vs 서블릿 컨테이너 {id="self-contained-vs-servlet"}

Ktor를 사용하면 애플리케이션 내에서 직접 원하는 네트워크 [엔진](server-engines.md)(예: Netty, Jetty, Tomcat)으로 서버를 생성하고 시작할 수 있습니다. 이 경우 엔진은 애플리케이션의 일부가 되며, 애플리케이션이 엔진 설정, 연결 및 SSL 옵션에 대한 제어권을 갖습니다. 애플리케이션을 배포하려면 fat JAR 또는 실행 가능한 JVM 애플리케이션으로 [패키징](#packaging)할 수 있습니다.

위의 접근 방식과 달리, 서블릿 컨테이너는 애플리케이션의 수명 주기와 연결 설정을 직접 제어해야 합니다. Ktor는 애플리케이션에 대한 제어권을 서블릿 컨테이너에 위임하는 특수한 `ServletApplicationEngine` 엔진을 제공합니다. 서블릿 컨테이너 내부에 배포하려면 [WAR 아카이브](server-war.md)를 생성해야 합니다.

### 구성: 코드 vs 구성 파일 {id="code-vs-config"}

배포를 위한 독립 실행형 Ktor 애플리케이션 구성은 [서버 생성 및 구성](server-create-and-configure.topic) 시 사용한 접근 방식(코드 내에서 구성하거나 [구성 파일](server-configuration-file.topic)을 사용하는 방식)에 따라 달라질 수 있습니다. 예를 들어, [호스팅 제공업체](#publishing)에서 수신 요청을 처리하기 위한 포트를 지정하도록 요구할 수 있습니다. 이 경우 코드 또는 `application.conf`/`application.yaml`에서 포트를 [구성](server-configuration-file.topic)해야 합니다.

## 패키징 {id="packaging"}

애플리케이션을 배포하기 전에 다음 방법 중 하나로 패키징해야 합니다:

* **Fat JAR**

  Fat JAR는 모든 코드 의존성을 포함하는 실행 가능한 JAR입니다. Fat JAR를 지원하는 모든 [클라우드 서비스](#publishing)에 배포할 수 있습니다. GraalVM용 네이티브 바이너리를 생성해야 하는 경우에도 fat JAR가 필요합니다. Fat JAR를 생성하려면 Gradle용 [Ktor](server-fatjar.md) 플러그인이나 Maven용 [Assembly](maven-assembly-plugin.md) 플러그인을 사용할 수 있습니다.

* **실행 가능한 JVM 애플리케이션**

   실행 가능한 JVM 애플리케이션은 코드 의존성과 생성된 시작 스크립트를 포함하는 패키징된 애플리케이션입니다. Gradle의 경우 [Application](server-packaging.md) 플러그인을 사용하여 애플리케이션을 생성할 수 있습니다. 

* **WAR**

   [WAR 아카이브](server-war.md)를 사용하면 Tomcat이나 Jetty와 같은 서블릿 컨테이너 내부에 애플리케이션을 배포할 수 있습니다.

* **GraalVM**

   Ktor 서버 애플리케이션은 다양한 플랫폼용 네이티브 이미지를 만들기 위해 [GraalVM](graalvm.md)을 활용할 수 있습니다.

## 컨테이너화 {id="containerizing"}

애플리케이션을 패키징한 후(예: 실행 가능한 JVM 애플리케이션 또는 fat JAR), 이 애플리케이션으로 [Docker 이미지](docker.md)를 준비할 수 있습니다. 그런 다음 이 이미지를 사용하여 Kubernetes, Swarm 또는 필요한 클라우드 서비스 컨테이너 인스턴스에서 애플리케이션을 실행할 수 있습니다.

## 게시 {id="publishing"}

아래 튜토리얼에서는 특정 클라우드 제공업체에 Ktor 애플리케이션을 배포하는 방법을 안내합니다:
* [Google App Engine](google-app-engine.md)
* [Heroku](heroku.md)
* [Dokku](dokku.md)
* [AWS Elastic Beanstalk](elastic-beanstalk.md)

## SSL {id="ssl"}

Ktor 서버가 리버스 프록시(예: Nginx 또는 Apache) 뒤에 위치하거나 서블릿 컨테이너(Tomcat 또는 Jetty) 내부에서 실행되는 경우, SSL 설정은 리버스 프록시 또는 서블릿 컨테이너에서 관리됩니다. 필요한 경우 Java KeyStore를 사용하여 Ktor가 [SSL을 직접 제공](server-ssl.md)하도록 구성할 수 있습니다.

> Ktor 애플리케이션이 서블릿 컨테이너 내부에 배포된 경우에는 SSL 설정이 적용되지 않는다는 점에 유의하세요.