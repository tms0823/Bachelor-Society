# Bachelor Society - Software Requirements Specification

## 1. Introduction

### 1.1 Purpose
This Software Requirement Specification (SRS) document outlines the requirements for developing "Bachelor Society" - a social platform connecting people for housing, roommates, and activities. The primary goal of this application is to facilitate efficient roommate and housing matching, event organization, and community building for students and young professionals.

### 1.2 Scope
The scope of this project includes the design, development, testing, and deployment of the Bachelor Society web application, catering to:
- Users seeking housing and roommates
- Property owners listing accommodations
- Activity organizers creating social events
- Administrators managing the platform

This SRS covers the functional and non-functional requirements for the project, the constraints, assumptions, high-level design, and the development plan.

### 1.3 Definitions, Acronyms, and Abbreviations
JWT: JSON Web Token
RBAC: Role-Based Access Control
EMR: Not applicable (kept for reference)
OTP: One-Time Password

### 1.4 References
- Node.js Documentation
- Express.js Documentation
- MySQL Documentation
- EJS Template Documentation
- Tailwind CSS Documentation

### 1.5 Overview
Section 2 provides an overall description of the product. Section 3 details the functional and non-functional requirements. Section 4 outlines the technology stack. Section 5 presents the development plan.

## 2. Overall Description

### 2.1 Product Perspective
Bachelor Society is a standalone web application built with Node.js, Express, MySQL, and EJS templates. It provides a secure platform for housing and social connections.

### 2.2 Product Features
- Housing Listings: Post and find rental properties
- Roommate Matching: Connect with compatible roommates
- Activity Buddies: Find people for social events
- Messaging System: Direct communication between users
- Photo Uploads: Multiple images for listings
- Secure Authentication: JWT-based login system
- Responsive Design: Works on all devices

### 2.3 User Classes and Characteristics
Users: Individuals seeking housing, roommates, or social activities. Require user-friendly interface.
Providers: Property owners and event organizers who list accommodations and activities.
Administrators: System overseers responsible for user management and platform maintenance.

### 2.4 Operating Environment
Web Application: Accessible on modern web browsers.
Server-Side: Node.js and Express.js.
Database: MySQL database.
Hosting: Standard web hosting or cloud environment.

### 2.5 Constraints
Security: Implement secure authentication and data protection.
Performance: Handle concurrent users efficiently.
Scalability: Support growing user base.
Time & Resource: Project delivery timeline.

### 2.6 Assumptions and Dependencies
Users have stable internet connection.
Third-party services for file uploads and messaging are available.

## 3. System Requirements

### 3.1 Functional Requirements

#### 3.1.1 Authentication & Authorization
FR-1: The system shall support user registration and login with JWT tokens.
FR-2: The system shall provide role-based access for users, providers, and admins.

#### 3.1.2 Housing & Roommate Services
FR-3: Users shall be able to search and view housing listings.
FR-4: Providers shall be able to create and manage housing listings.
FR-5: Users shall be able to post roommate requests.
FR-6: The system shall facilitate messaging between users.

#### 3.1.3 Activity Management
FR-7: Users shall be able to create and join social activities.
FR-8: Providers shall be able to organize events and manage participants.
FR-9: The system shall support photo uploads for listings.

### 3.2 Non-Functional Requirements

#### 3.2.1 Performance Requirements
NFR-1: The system should handle multiple concurrent users.
NFR-2: Page load times shall be reasonable.

#### 3.2.2 Security Requirements
NFR-3: All communication shall occur over HTTPS.
NFR-4: User passwords shall be securely hashed.
NFR-5: The system must protect user data privacy.

#### 3.2.3 Reliability & Availability
NFR-6: The system shall maintain high uptime.
NFR-7: Data backups shall be implemented.

### 3.3 External Interface Requirements

#### 3.3.1 User Interfaces
UI-1: Responsive web interface using EJS templates and Tailwind CSS.
UI-2: Intuitive navigation with role-based dashboards.

#### 3.3.2 Hardware Interfaces
HI-1: Standard server hardware.

#### 3.3.3 Software Interfaces
SI-1: MySQL database connection.
SI-2: File upload utilities.

#### 3.3.4 Communication Interfaces
CI-1: RESTful APIs for client-server communication.

## 4. Technology Stack & Architectural Overview

### 4.1 Technology Components
MySQL: Relational database for storing user data, listings, and messages.
Express.js: Node.js framework for building the RESTful API.
EJS: Template engine for server-side rendering.
Node.js: JavaScript runtime for the back-end application.
Tailwind CSS: Utility-first CSS framework for styling.

### 4.2 High-Level Architecture
Presentation Layer (EJS/Tailwind): Handles user interaction and displays.
Business Logic Layer (Express.js/Node.js): Processes requests and manages data.
Data Layer (MySQL): Stores all persistent application data.

## 5. Conclusion
This SRS outlines the requirements for Bachelor Society, a social platform for housing and community connections. The system will provide a secure, user-friendly environment for finding housing, roommates, and social activities using modern web technologies.
