

# Web Banking App
======================

## Overview

This is a web banking application built using React, TypeScript, and Express.js. The application allows users to manage their accounts, view transactions, and send money to other users.

## Features

* User authentication and authorization
* Account management (view balance, view transactions, send money)
* Transaction history
* Real-time updates using WebSockets

## Getting Started

### Prerequisites

* Node.js (version 14 or higher)
* npm (version 6 or higher)
* Docker (optional)

### Installation

1. Clone the repository: `git clone https://github.com/Resized/web-banking-app.git`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open your browser and navigate to `http://localhost:5173`

### Docker

1. Build the Docker image: `docker build -t web-banking-app .`
2. Run the Docker container: `docker run -p 5173:5173 web-banking-app`
3. Open your browser and navigate to `http://localhost:5173`

## Configuration

### Environment Variables

* `NODE_ENV`: Set to `development` or `production`
* `SECRET_ACCESS_TOKEN`: Set to a secret key for JWT authentication
* `SECRET_REFRESH_TOKEN`: Set to a secret key for JWT refresh tokens
* `URI`: Set to the MongoDB connection string

### MongoDB

* Create a new MongoDB database and collection for the application
* Update the `URI` environment variable to point to your MongoDB instance

## API Documentation

### Authentication

* `POST /api/auth/login`: Login with username and password
* `POST /api/auth/register`: Register a new user
* `POST /api/auth/verify-email`: Verify email
* `GET /api/auth/refresh-token`: Refresh access token
* `POST /api/auth/reset-password`: Reset user password
* `PATCH /api/auth/reset-password/confirm`: Confirm user password
* `DELETE /api/auth/logout`: Logout the user

### Balance

* `GET /api/balance`: View the current user's balance

### Transactions

* `POST /api/transactions`: Post a new transactions
* `GET /api/transactions`: Get a list of user's transactions

## Contributing

Contributions are welcome! Please submit a pull request with your changes and a brief description of what you've changed.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

* [React](https://reactjs.org/)
* [TypeScript](https://www.typescriptlang.org/)
* [Express.js](https://expressjs.com/)
* [MongoDB](https://www.mongodb.com/)
* [Docker](https://www.docker.com/)
