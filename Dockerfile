FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
ENV PORT=8080
ENV SPRING_DATASOURCE_URL=jdbc:h2:mem:mediai;DB_CLOSE_DELAY=-1;MODE=MySQL
ENV SPRING_DATASOURCE_USERNAME=sa
ENV SPRING_DATASOURCE_PASSWORD=sa
ENV SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.h2.Driver

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]
