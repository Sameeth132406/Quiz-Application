# Project Report: Quiz Management Application

## 1. Executive Summary
The **Quiz Management Application** is a robust backend system designed to facilitate the creation, management, execution, and evaluation of quizzes and courses. Built using a modern Java Spring Boot stack, the application offers a comprehensive suite of features ranging from user management and role-based access control (RBAC) to complex quiz evaluations, integrity tracking, and analytics.

## 2. Technology Stack
The project is built on a modern, scalable technology stack:
*   **Language:** Java 17
*   **Framework:** Spring Boot 3.5.3
*   **Web Layer:** Spring Web (RESTful APIs)
*   **Persistence Layer:** Spring Data JPA / Hibernate
*   **Database:** MySQL (using `mysql-connector-j`)
*   **Security:** Spring Security & JSON Web Tokens (JWT) for stateless authentication.
*   **API Documentation:** Springdoc OpenAPI (Swagger UI) for interactive API documentation.
*   **Utilities:** Lombok (to reduce boilerplate code like getters, setters, and constructors).

## 3. Architecture & Design Patterns
The application follows a classic monolithic **N-Tier Architecture**:
1.  **Controller Layer (`/controller`)**: Handles incoming HTTP REST requests, maps them to the appropriate services, and returns HTTP responses.
2.  **Service Layer (`/service`)**: Encapsulates the core business logic.
3.  **Repository Layer (`/repository`)**: Interfaces with the database using Spring Data JPA.
4.  **Domain/Model Layer (`/model`)**: Contains the JPA entities representing the database tables.
5.  **Data Transfer Objects (`/dto`)**: Used to transfer data between the client and the server securely without exposing the internal database models.
6.  **Security Layer (`/security`)**: Manages authentication and authorization via custom filters (e.g., `JwtAuthenticationFilter`) and entry points.

## 4. Key Entities and Modules
The application's domain is divided into several interconnected modules:

### 4.1. User & Authentication Module
*   **User (`User.java`)**: The core entity representing a user in the system. Contains credentials and role mapping.
*   **Roles (`Role.java`)**: The system supports highly granular Role-Based Access Control with the following roles: `ADMIN`, `ACADEMIC_ADMIN`, `EDUCATOR`, `TEACHING_ASSISTANT`, `STUDENT`, `PROCTOR`, `ANALYST`, and `GUEST`.
*   **Authentication**: Handled via JWT. The security layer includes `JwtUtil`, `CustomUserDetailsService`, and `JwtAuthenticationFilter`.

### 4.2. Course & Enrollment Module
*   **Course (`Course.java`)**: Represents an academic course or subject under which quizzes are grouped.
*   **Enrollment (`Enrollment.java`)**: Represents the many-to-many relationship mapping a `User` (Student) to a `Course`.

### 4.3. Quiz & Question Module
*   **Quiz (`Quiz.java`)**: The core assessment entity.
*   **Question (`Question.java`)**: Represents individual questions within a quiz.
*   **Enums**: Includes `QuestionType` (e.g., Multiple Choice, True/False) and `Difficulty` levels.

### 4.4. Assessment & Execution Module
*   **QuizAttempt (`QuizAttempt.java`)**: Tracks a specific instance of a user taking a quiz. It monitors the `AttemptStatus`.
*   **Response (`Response.java`)**: Records the specific answers provided by the user for individual questions during a `QuizAttempt`.

### 4.5. Grading & Analytics
*   **Gradebook (`Gradebook.java`)**: Consolidates scores and grades for users across different quizzes and courses.
*   **Analytics (`Analytics.java`)**: Stores aggregated data and metrics to provide insights into student performance, course engagement, or quiz difficulty.

### 4.6. Proctoring & Integrity
*   **IntegrityEvent (`IntegrityEvent.java`)**: A specialized entity used to track potential academic misconduct or notable events during a `QuizAttempt` (e.g., tab switching, browser minimization). It logs the `eventType`, `eventTime`, and `remarks`.

## 5. Security Implementation
The application is secured using **Spring Security** combined with **JWT (JSON Web Tokens)**.
*   **Stateless Sessions**: The server does not store session state. Every request must be authenticated via a Bearer token in the `Authorization` header.
*   **Exception Handling**: Implements `JwtAuthenticationEntryPoint` for handling unauthorized access attempts (401) and `JwtAccessDeniedHandler` for forbidden access (403).

## 6. Project Structure Overview
```text
springapp/src/main/java/com/examly/springapp/
├── config/       # Application configuration classes (e.g., OpenAPI configs)
├── controller/   # REST API Endpoints (e.g., QuizController, AuthController)
├── dto/          # Data Transfer Objects for API requests/responses
├── enums/        # Enumerations (Role, AttemptStatus, Difficulty)
├── exception/    # Custom exception classes and Global Exception Handlers
├── model/        # JPA Entities (User, Quiz, Course, etc.)
├── repository/   # Spring Data JPA interfaces
├── security/     # JWT filters, entry points, and UserDetailsService
└── service/      # Business logic implementation
```

## 7. Conclusion
This project is a well-structured, enterprise-grade Spring Boot application. Its granular role system, modular design, and inclusion of advanced features like Analytics and Integrity Events make it a highly capable backend for modern educational or corporate training platforms.
