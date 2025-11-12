# Stage 1: Build the application using Maven
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Create a slim final image with only the JRE and the application JAR
FROM openjdk:17-jdk-slim
WORKDIR /app
# Copy the built JAR from the 'build' stage
COPY --from=build /app/target/*.jar app.jar
EXPOSE 2020
ENTRYPOINT ["java","-jar","app.jar"]# Stage 1: Build the Spring Boot JAR using Maven
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run the built application
FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 2025
ENTRYPOINT ["java", "-jar", "app.jar"]
