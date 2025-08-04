# Services API Documentation

## Overview
This API provides endpoints for managing services in the application. Services are offerings provided by service providers and can be booked by users.

## Base URL
```
http://localhost:3000/api/services
```

## Endpoints

### 1. Create a Service
**POST** `/api/services`

Creates a new service.

#### Request Body:
```json
{
  "providerId": "cuid_provider_id",
  "categoryId": "cuid_category_id", 
  "title": "Web Development Service",
  "description": "Professional web development services for modern businesses",
  "price": 99.99,
  "currency": "USD",
  "tags": ["web", "development", "react", "nodejs"],
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "isActive": true,
  "workingTime": [
    "Monday: 9:00 AM - 5:00 PM",
    "Tuesday: 9:00 AM - 5:00 PM",
    "Wednesday: 9:00 AM - 5:00 PM",
    "Thursday: 9:00 AM - 5:00 PM",
    "Friday: 9:00 AM - 5:00 PM"
  ]
}
```

#### Response (201):
```json
{
  "success": true,
  "message": "Service created successfully",
  "data": {
    "id": "cuid_service_id",
    "providerId": "cuid_provider_id",
    "categoryId": "cuid_category_id",
    "title": "Web Development Service",
    "description": "Professional web development services for modern businesses",
    "price": 99.99,
    "currency": "USD",
    "tags": ["web", "development", "react", "nodejs"],
    "images": ["https://example.com/image1.jpg"],
    "isActive": true,
    "workingTime": ["Monday: 9:00 AM - 5:00 PM"],
    "createdAt": "2025-08-04T12:00:00.000Z",
    "updatedAt": "2025-08-04T12:00:00.000Z",
    "provider": {
      "id": "cuid_provider_id",
      "user": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      }
    },
    "category": {
      "id": "cuid_category_id",
      "name": "Web Development"
    }
  }
}
```

### 2. Get All Services
**GET** `/api/services`

Retrieves all services with optional filtering and pagination.

#### Query Parameters:
- `providerId` (optional): Filter by provider ID
- `categoryId` (optional): Filter by category ID  
- `isActive` (optional): Filter by active status (`true` or `false`)
- `skip` (optional): Number of records to skip (default: 0)
- `take` (optional): Number of records to return (default: 10, max: 100)

#### Example:
```
GET /api/services?categoryId=cuid_category_id&isActive=true&skip=0&take=5
```

#### Response (200):
```json
{
  "success": true,
  "message": "Services retrieved successfully",
  "data": [
    {
      "id": "cuid_service_id",
      "title": "Web Development Service",
      "price": 99.99,
      "provider": {
        "user": {
          "firstName": "John",
          "lastName": "Doe"
        }
      },
      "category": {
        "name": "Web Development"
      }
    }
  ],
  "pagination": {
    "skip": 0,
    "take": 10
  }
}
```

### 3. Get Service by ID
**GET** `/api/services/:id`

Retrieves a specific service by its ID.

#### Example:
```
GET /api/services/cuid_service_id
```

#### Response (200):
```json
{
  "success": true,
  "message": "Service retrieved successfully",
  "data": {
    "id": "cuid_service_id",
    "title": "Web Development Service",
    "description": "Professional web development services",
    "price": 99.99,
    "provider": {
      "user": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      }
    },
    "category": {
      "name": "Web Development"
    },
    "reviews": [],
    "schedules": []
  }
}
```

### 4. Update Service
**PUT** `/api/services/:id`

Updates an existing service.

#### Request Body (all fields optional):
```json
{
  "title": "Updated Web Development Service",
  "description": "Updated description",
  "price": 149.99,
  "tags": ["web", "development", "react", "nodejs", "typescript"],
  "isActive": false
}
```

#### Response (200):
```json
{
  "success": true,
  "message": "Service updated successfully",
  "data": {
    // Updated service object
  }
}
```

### 5. Delete Service
**DELETE** `/api/services/:id`

Deletes a service.

#### Example:
```
DELETE /api/services/cuid_service_id
```

#### Response (200):
```json
{
  "success": true,
  "message": "Service deleted successfully"
}
```

## Error Responses

### Validation Error (400):
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "price",
      "message": "Price is required"
    }
  ]
}
```

### Not Found Error (404):
```json
{
  "success": false,
  "message": "Service not found"
}
```

### Server Error (500):
```json
{
  "success": false,
  "message": "Failed to create service: Provider not found"
}
```

## Field Validations

### Required Fields (for creation):
- `providerId`: Must be a valid provider ID
- `categoryId`: Must be a valid category ID  
- `price`: Must be a positive number

### Optional Fields:
- `title`: 3-100 characters
- `description`: 10-1000 characters
- `currency`: 3-character uppercase code (default: "USD")
- `tags`: Array of strings, max 10 items, each 2-30 characters
- `images`: Array of valid URLs, max 5 items
- `isActive`: Boolean (default: true)
- `workingTime`: Array of formatted time slots, max 7 items

### Working Time Format:
```
"Day: HH:MM AM/PM - HH:MM AM/PM"
```
Examples:
- "Monday: 9:00 AM - 5:00 PM"
- "Saturday: 10:00 AM - 2:00 PM"

## Testing with curl

### Create a service:
```bash
curl -X POST http://localhost:3000/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "providerId": "your_provider_id",
    "categoryId": "your_category_id",
    "title": "Test Service",
    "description": "This is a test service description",
    "price": 50.00,
    "tags": ["test", "service"],
    "workingTime": ["Monday: 9:00 AM - 5:00 PM"]
  }'
```

### Get all services:
```bash
curl http://localhost:3000/api/services
```

### Get a specific service:
```bash
curl http://localhost:3000/api/services/your_service_id
```
