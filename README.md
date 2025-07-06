# Multiple Backend API Server

A Node.js/Express.js API server that provides multiple utility endpoints including Instagram caption extraction and URL expansion services.

## Tech Stack

-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Language**: TypeScript
-   **HTTP Client**: Axios
-   **HTML Parser**: Cheerio
-   **Logging**: Winston with Logtail integration
-   **Security**: Helmet, CORS, Rate Limiting
-   **Bot Detection**: isbot
-   **Development**: Nodemon, ts-node

## Project Structure

```
├── src/
│   ├── index.ts                    # Main application entry point
│   ├── controllers/                # Request handlers
│   │   ├── instaCaptionExtractor.ts # Instagram caption extraction logic
│   │   └── urlExpander.ts          # URL expansion logic
│   ├── middlewares/                # Custom middleware
│   │   ├── botDetector.ts          # Bot detection and blocking
│   │   ├── errorHandler.ts         # Global error handling
│   │   └── rateLimiter.ts          # Rate limiting configuration
│   ├── routes/                     # API route definitions
│   │   └── index.ts                # Main router
│   ├── types/                      # TypeScript type definitions
│   │   └── index.ts                # Custom interfaces
│   └── utils/                      # Utility functions
│       └── logger.ts               # Winston logger configuration
├── package.json                    # Dependencies and scripts
└── tsconfig.json                   # TypeScript configuration
```

## API Endpoints

### Base URL

```
http://localhost:3000
```

### Available Endpoints

#### 1. Health Check

-   **GET** `/`
-   **Description**: Server health check
-   **Response**: Welcome message

#### 2. Instagram Caption Extractor

-   **POST** `/api/caption`
-   **Description**: Extracts caption from Instagram post URLs
-   **Request Body**:
    ```json
    {
        "url": "https://instagram.com/p/[post-id]"
    }
    ```
-   **Response**:
    ```json
    {
        "message": "Caption extracted successfully",
        "caption": "Extracted caption text"
    }
    ```

#### 3. URL Expander

-   **POST** `/api/url`
-   **Description**: Expands shortened URLs to their original form
-   **Request Body**:
    ```json
    {
        "url": "https://short.url/abc123"
    }
    ```
-   **Response**:
    ```json
    {
        "message": "URL expanded successfully",
        "expandedUrl": "https://original-long-url.com/full-path"
    }
    ```

## Features

-   **Security**: Helmet for security headers, CORS protection, rate limiting
-   **Bot Protection**: Automatic bot detection and blocking (allows Postman for testing)
-   **Error Handling**: Global error handling with proper HTTP status codes
-   **Logging**: Structured logging with Winston and Logtail integration
-   **Compression**: Response compression for better performance
-   **TypeScript**: Full TypeScript support with type definitions

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
WHITELISTED_DOMAINS=your-allowed-domains
LOGTAIL_TOKEN=your-logtail-token
```

## Installation & Usage

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## Middleware Stack

1. **Helmet** - Security headers
2. **Rate Limiter** - Request rate limiting
3. **Bot Detector** - Bot traffic filtering
4. **Body Parser** - JSON/URL-encoded parsing (50MB limit)
5. **CORS** - Cross-origin resource sharing
6. **Compression** - Response compression
7. **Error Handler** - Global error handling

## Error Handling

The API includes comprehensive error handling:

-   Input validation errors (400)
-   Not found errors (404)
-   Server errors (500)
-   Bot blocking (403)
-   Rate limit exceeded (429)

All errors are logged and return structured JSON responses.
