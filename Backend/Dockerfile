## 1. Which base image do you want to use?
FROM maven:3.9.6-eclipse-temurin-21-alpine
## 2. Set the working directory.
WORKDIR /app
## 3. Copy the application's project files into the working directory.
COPY . .
## 4. Document and inform the developer that the application will use the container port: 8080.
RUN mvn clean package 
## 5. Define the command to run when the container starts.
EXPOSE 8080


CMD ["java", "-jar", "target/offline-upi-0.0.1-SNAPSHOT.jar"]