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
ENTRYPOINT ["java","-jar","app.jar"]