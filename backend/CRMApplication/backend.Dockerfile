# =========================
# 1️⃣ Build stage using Maven
# =========================
FROM maven:3.9.6-eclipse-temurin-17 AS build

# Set working directory
WORKDIR /app

# Copy pom.xml and download dependencies first (for better caching)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy the rest of the project files
COPY src ./src

# Build the application (skip tests to speed up)
RUN mvn clean package -DskipTests

# =========================
# 2️⃣ Runtime stage using JDK
# =========================
FROM eclipse-temurin:17-jdk

# Set working directory inside container
WORKDIR /app

# Copy built JAR from previous stage
COPY --from=build /app/target/*.jar app.jar

# Expose backend port (change if your Spring Boot app uses a different port)
EXPOSE 8080

# Run the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
