# Real-Time Chat Application

A full-stack **real-time chat application** built using **Spring Boot (Backend)** and **React (Frontend)** that enables users to communicate instantly through WebSockets. The system is designed with a scalable architecture and supports real-time messaging between multiple connected users.

---

## Features

* Real-time messaging using WebSockets
* Responsive React user interface
* Spring Boot backend with REST APIs
* Instant message broadcasting
* Scalable client-server communication
* Dockerized setup for easy deployment
* Simple and clean UI for chat interaction

---

## Tech Stack

### Backend

**Spring Boot**
Used to build the backend application and handle API requests.

**Spring WebSocket**
Enables real-time bidirectional communication between client and server.

**STOMP Protocol**
Provides a messaging structure on top of WebSockets for message routing.

**Maven**
Used for dependency management and building the backend project.

**Docker**
Containerizes the backend application for consistent deployment.

---

### Frontend

**React.js**
Used to build a dynamic and responsive user interface.

**JavaScript (ES6)**
Handles frontend logic and WebSocket interactions.

**SockJS & STOMP Client**
Used to establish a WebSocket connection with the Spring Boot server.

**HTML / CSS / TAILWIND**
Provides layout and styling for the chat interface.

---

### DevOps

**Docker**
Used to containerize both frontend and backend services.

---

## System Architecture

```
React Client
     |
     | WebSocket (STOMP)
     |
Spring Boot WebSocket Server
     |
Message Broadcasting
     |
Connected Clients
```

The React frontend connects to the Spring Boot WebSocket endpoint.
Messages sent by any client are processed by the backend and broadcast to all subscribed clients in real time.

---

## Project Structure

```
chat-app
│
├── backend
└── frontend
```

---

## Installation

### Clone the Repository

```
git clone https://github.com/your-username/chat-app.git
cd chat-app
```

---

### Run Backend

```
cd chat-app-backend
mvn spring-boot:run
```

Backend will start on:

```
http://localhost:8080
```

---

### Run Frontend

```
cd frontend-chat
npm install
npm start
```

Frontend will run on:

```
http://localhost:5173
```

---

---

## WebSocket Endpoint

```
ws://localhost:8080/chat
```

Clients connect using **STOMP over WebSocket** and subscribe to messaging topics for real-time updates.

---

## Future Improvements

* User authentication using JWT
* Private chat rooms
* Message storage using a database
* Typing indicators
* Media and file sharing

---

## Author

Adarsh Raj
