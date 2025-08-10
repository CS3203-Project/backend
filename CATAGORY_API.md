# Categories API Documentation

## Overview
This API provides endpoints for managing categories in the application. Categories are used to organize services hierarchically and can have parent-child relationships for better organization.

## Base URL
```
http://localhost:3000/api/categories
```

## Endpoints

### 1. Create a Category
**POST** `/api/categories`

Creates a new category. ~~Requires authentication~~ **Public for testing**.

#### Request Body:
```json
{
  "name": "Web Development",
  "slug": "web-development",
  "description": "Professional web development and programming services",
  "parentId": "cuid_parent_category_id"
}
```

#### Response (201):
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": "cuid_category_id",
    "name": "Web Development",
    "slug": "web-development",
    "description": "Professional web development and programming services",
    "parentId": "cuid_parent_category_id",
    "parent": {
      "id": "cuid_parent_category_id",
      "name": "Technology",
      "slug": "technology"
    },
    "children": [],
    "_count": {
      "services": 0
    }
  }
}
```

### 2. Get All Categories
**GET** `/api/categories`

Retrieves all categories with optional filtering.

#### Query Parameters:
- `parentId` (optional): Filter by parent category ID (use `null` for root categories)
- `includeChildren` (optional): Include children categories (`true` or `false`, default: `true`)
- `includeParent` (optional): Include parent category info (`true` or `false`, default: `true`)
- `includeServices` (optional): Include services count (`true` or `false`, default: `false`)

#### Example:
```
GET /api/categories?parentId=cuid_parent_id&includeChildren=true&includeServices=true
```

#### Response (200):
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [
    {
      "id": "cuid_category_id",
      "name": "Web Development",
      "slug": "web-development",
      "description": "Professional web development services",
      "parentId": "cuid_parent_category_id",
      "parent": {
        "id": "cuid_parent_category_id",
        "name": "Technology",
        "slug": "technology"
      },
      "children": [
        {
          "id": "cuid_child_category_id",
          "name": "Frontend Development",
          "slug": "frontend-development",
          "description": "Frontend web development services"
        }
      ],
      "_count": {
        "services": 5
      }
    }
  ]
}
```

### 3. Get Root Categories
**GET** `/api/categories/roots`

Retrieves all root categories (categories with no parent).

#### Query Parameters:
- `includeChildren` (optional): Include children categories (`true` or `false`, default: `true`)

#### Example:
```
GET /api/categories/roots?includeChildren=true
```

#### Response (200):
```json
{
  "success": true,
  "message": "Root categories retrieved successfully",
  "data": [
    {
      "id": "cuid_category_id",
      "name": "Technology",
      "slug": "technology",
      "description": "Technology related services",
      "parentId": null,
      "children": [
        {
          "id": "cuid_child_category_id",
          "name": "Web Development",
          "slug": "web-development",
          "description": "Web development services"
        }
      ],
      "_count": {
        "services": 15
      }
    }
  ]
}
```

### 4. Search Categories
**GET** `/api/categories/search`

Search categories by name or description.

#### Query Parameters:
- `q` (required): Search term
- `includeChildren` (optional): Include children categories (`true` or `false`, default: `true`)
- `includeParent` (optional): Include parent category info (`true` or `false`, default: `true`)

#### Example:
```
GET /api/categories/search?q=web&includeChildren=true
```

#### Response (200):
```json
{
  "success": true,
  "message": "Search completed successfully",
  "data": [
    {
      "id": "cuid_category_id",
      "name": "Web Development",
      "slug": "web-development",
      "description": "Professional web development services",
      "parentId": "cuid_parent_category_id",
      "parent": {
        "id": "cuid_parent_category_id",
        "name": "Technology",
        "slug": "technology"
      },
      "children": [],
      "_count": {
        "services": 8
      }
    }
  ],
  "searchTerm": "web"
}
```

### 5. Get Category by ID
**GET** `/api/categories/id/:id`

Retrieves a specific category by its ID.

#### Query Parameters:
- `includeChildren` (optional): Include children categories (`true` or `false`, default: `true`)
- `includeParent` (optional): Include parent category info (`true` or `false`, default: `true`)
- `includeServices` (optional): Include associated services (`true` or `false`, default: `false`)

#### Example:
```
GET /api/categories/id/cuid_category_id?includeServices=true
```

#### Response (200):
```json
{
  "success": true,
  "message": "Category retrieved successfully",
  "data": {
    "id": "cuid_category_id",
    "name": "Web Development",
    "slug": "web-development",
    "description": "Professional web development services",
    "parentId": "cuid_parent_category_id",
    "parent": {
      "id": "cuid_parent_category_id",
      "name": "Technology",
      "slug": "technology",
      "description": "Technology related services"
    },
    "children": [
      {
        "id": "cuid_child_category_id",
        "name": "Frontend Development",
        "slug": "frontend-development",
        "description": "Frontend web development services"
      }
    ],
    "services": [
      {
        "id": "cuid_service_id",
        "title": "React Development Service",
        "description": "Professional React development",
        "price": 99.99,
        "currency": "USD",
        "isActive": true
      }
    ],
    "_count": {
      "services": 8
    }
  }
}
```

### 6. Get Category by Slug
**GET** `/api/categories/slug/:slug`

Retrieves a specific category by its slug.

#### Query Parameters:
- `includeChildren` (optional): Include children categories (`true` or `false`, default: `true`)
- `includeParent` (optional): Include parent category info (`true` or `false`, default: `true`)
- `includeServices` (optional): Include associated services (`true` or `false`, default: `false`)

#### Example:
```
GET /api/categories/slug/web-development?includeChildren=true
```

#### Response (200):
```json
{
  "success": true,
  "message": "Category retrieved successfully",
  "data": {
    "id": "cuid_category_id",
    "name": "Web Development",
    "slug": "web-development",
    "description": "Professional web development services",
    "parentId": "cuid_parent_category_id",
    "parent": {
      "id": "cuid_parent_category_id",
      "name": "Technology",
      "slug": "technology",
      "description": "Technology related services"
    },
    "children": [
      {
        "id": "cuid_child_category_id",
        "name": "Frontend Development",
        "slug": "frontend-development",
        "description": "Frontend web development services"
      }
    ],
    "_count": {
      "services": 8
    }
  }
}
```

### 7. Get Category Hierarchy
**GET** `/api/categories/:id/hierarchy`

Gets the full hierarchy tree starting from a specific category (up to 3 levels up and down).

#### Example:
```
GET /api/categories/cuid_category_id/hierarchy
```

#### Response (200):
```json
{
  "success": true,
  "message": "Category hierarchy retrieved successfully",
  "data": {
    "id": "cuid_category_id",
    "name": "Web Development",
    "slug": "web-development",
    "description": "Professional web development services",
    "parentId": "cuid_parent_category_id",
    "parent": {
      "id": "cuid_parent_category_id",
      "name": "Technology",
      "slug": "technology",
      "parent": {
        "id": "cuid_grandparent_id",
        "name": "Services",
        "slug": "services",
        "parent": null
      }
    },
    "children": [
      {
        "id": "cuid_child_category_id",
        "name": "Frontend Development",
        "slug": "frontend-development",
        "children": [
          {
            "id": "cuid_grandchild_id",
            "name": "React Development",
            "slug": "react-development",
            "children": []
          }
        ]
      }
    ]
  }
}
```

### 8. Update Category
**PUT** `/api/categories/:id`

Updates an existing category. Requires authentication.

#### Request Body (all fields optional):
```json
{
  "name": "Updated Web Development",
  "slug": "updated-web-development",
  "description": "Updated description for web development services",
  "parentId": "new_parent_category_id"
}
```

#### Response (200):
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "id": "cuid_category_id",
    "name": "Updated Web Development",
    "slug": "updated-web-development",
    "description": "Updated description for web development services",
    "parentId": "new_parent_category_id",
    "parent": {
      "id": "new_parent_category_id",
      "name": "Technology",
      "slug": "technology"
    },
    "children": [],
    "_count": {
      "services": 8
    }
  }
}
```

### 9. Delete Category
**DELETE** `/api/categories/:id`

Deletes a category. Requires authentication.

#### Query Parameters:
- `force` (optional): Force delete even if category has children or services (`true` or `false`, default: `false`)

#### Example:
```
DELETE /api/categories/cuid_category_id?force=true
```

#### Response (200):
```json
{
  "success": true,
  "message": "Category deleted successfully",
  "data": {
    "id": "cuid_category_id",
    "name": "Web Development",
    "slug": "web-development",
    "description": "Professional web development services",
    "parentId": "cuid_parent_category_id"
  }
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
      "field": "slug",
      "message": "Slug is required"
    }
  ]
}
```

### Duplicate Slug Error (400):
```json
{
  "success": false,
  "message": "Category with this slug already exists"
}
```

### Not Found Error (404):
```json
{
  "success": false,
  "message": "Category not found"
}
```

### Circular Reference Error (400):
```json
{
  "success": false,
  "message": "Cannot create circular reference in category hierarchy"
}
```

### Delete Restriction Error (400):
```json
{
  "success": false,
  "message": "Cannot delete category with child categories. Use force option or delete children first."
}
```

### Server Error (500):
```json
{
  "success": false,
  "message": "Failed to create category: Parent category not found"
}
```

## Field Validations

### Required Fields (for creation):
- `slug`: Must be unique, 2-100 characters, lowercase letters, numbers, and hyphens only

### Optional Fields:
- `name`: 2-100 characters
- `description`: 10-500 characters  
- `parentId`: Must be a valid category ID or null

### Slug Format Rules:
- Must be lowercase
- Can contain letters (a-z), numbers (0-9), and hyphens (-)
- Cannot start or end with a hyphen
- Must be unique across all categories

Examples of valid slugs:
- `web-development`
- `mobile-apps`
- `digital-marketing`
- `graphic-design`

## Hierarchy Rules

1. **No Circular References**: A category cannot be its own ancestor
2. **Parent Validation**: Parent category must exist before assigning children
3. **Depth Limit**: Recommended maximum depth of 4-5 levels for performance
4. **Deletion Rules**: 
   - Cannot delete categories with children unless `force=true`
   - Cannot delete categories with associated services unless `force=true`
   - When force deleting, children become root categories

## Testing with curl

### Create a root category:
```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token" \
  -d '{
    "name": "Technology",
    "slug": "technology",
    "description": "Technology related services"
  }'
```

### Create a subcategory:
```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token" \
  -d '{
    "name": "Web Development",
    "slug": "web-development", 
    "description": "Web development services",
    "parentId": "your_parent_category_id"
  }'
```

### Get all root categories:
```bash
curl http://localhost:3000/api/categories/roots
```

### Search categories:
```bash
curl "http://localhost:3000/api/categories/search?q=web"
```

### Get category by slug:
```bash
curl http://localhost:3000/api/categories/slug/web-development
```

### Update a category:
```bash
curl -X PUT http://localhost:3000/api/categories/your_category_id \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token" \
  -d '{
    "name": "Updated Category Name",
    "description": "Updated description"
  }'
```

### Delete a category:
```bash
curl -X DELETE http://localhost:3000/api/categories/your_category_id \
  -H "Authorization: Bearer your_jwt_token"
```

## Common Use Cases

### 1. Building a Category Tree for UI:
```bash
# Get all root categories with their children
curl http://localhost:3000/api/categories/roots?includeChildren=true
```

### 2. Category Navigation Breadcrumbs:
```bash
# Get full hierarchy for a category
curl http://localhost:3000/api/categories/your_category_id/hierarchy
```

### 3. Service Filtering by Category:
```bash
# Get category with service count
curl "http://localhost:3000/api/categories/id/your_category_id?includeServices=false"
```

### 4. Admin Category Management:
```bash
# Get all categories with full details
curl "http://localhost:3000/api/categories?includeChildren=true&includeServices=true"
```
