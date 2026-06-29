FROM eclipse-temurin:17-jdk

EXPOSE 7777

ADD target/gpm-gateway-0.0.1-SNAPSHOT.jar application.jar

ENTRYPOINT ["java", "-jar", "/application.jar"]
