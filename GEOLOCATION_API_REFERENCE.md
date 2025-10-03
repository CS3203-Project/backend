# 📍 Geolocation API Endpoints Reference

This document summarizes all backend API endpoints related to geolocation and location-based service features.

---

## 1. Service Creation & Update

### **POST `/api/services`**
- **Purpose:** Create a new service (supports optional location fields).
- **Body Example:**
  ```json
  {
    "title": "Plumbing Service",
    "description": "Fix leaks and more",
    "latitude": 6.9271,
    "longitude": 79.8612,
    "address": "123 Main St, Colombo",
    "city": "Colombo",
    "state": "Western",
    "country": "Sri Lanka",
    "postalCode": "10000",
    "serviceRadiusKm": 15
    // ...other fields
  }
  ```

### **PUT `/api/services/:id`**
- **Purpose:** Update an existing service, including location fields.

---

## 2. Service Search with Location

### **GET `/api/services/search`**
- **Purpose:** Search for services by keyword and/or location.
- **Query Parameters:**
  - `lat`, `lng` (or `latitude`, `longitude`): User coordinates
  - `radius`: Search radius in km (default: 10)
  - `address`: (optional) Address to geocode and use as search center
  - `keyword`: (optional) Service search keyword
- **Behavior:**
  - If no location is provided, returns all services matching the keyword.
  - Services without location are considered available everywhere.

---

## 3. Geocoding & Reverse Geocoding

### **POST `/api/services/location/geocode`**
- **Purpose:** Convert an address to latitude/longitude and structured address fields.
- **Body:**
  ```json
  { "address": "123 Main St, Colombo" }
  ```
- **Response:**
  ```json
  {
    "latitude": 6.9271,
    "longitude": 79.8612,
    "address": "123 Main St, Colombo",
    "city": "Colombo",
    "state": "Western",
    "country": "Sri Lanka",
    "postalCode": "10000"
  }
  ```

### **POST `/api/services/location/reverse-geocode`**
- **Purpose:** Convert latitude/longitude to a structured address.
- **Body:**
  ```json
  { "lat": 6.9271, "lng": 79.8612 }
  ```
- **Response:** Same as above.

---

## 4. IP-based Location Detection

### **GET `/api/services/location/ip`**
- **Purpose:** Detect approximate user location based on IP address.
- **Response:**
  ```json
  {
    "latitude": 6.9271,
    "longitude": 79.8612,
    "city": "Colombo",
    "country": "Sri Lanka",
    "accuracy": "approximate"
  }
  ```

---

## 5. Other Related Endpoints

### **GET `/api/services/:id`**
- **Purpose:** Fetch a single service, including its location fields.

### **GET `/api/services`**
- **Purpose:** List all services (optionally filtered), including location fields.

---

## Notes

- **Services without location**: Treated as available everywhere and always included in search results.
- **Location fields are optional**: If not provided, the service is not location-restricted.

---

**Keep this section for quick reference when developing or debugging location-based features!**
