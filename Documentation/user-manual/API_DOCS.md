# API Documentation

## Overview
NeoCRM provides a comprehensive REST API that enables seamless integration with external systems, custom applications, and third-party services.

## Authentication

### API Keys
- **Key Management**
  - Key generation
  - Permissions
  - Expiration
  - Rotation

- **Authentication Methods**
  - Bearer tokens
  - API key header
  - OAuth 2.0
  - JWT tokens

### Security
- **Best Practices**
  - HTTPS only
  - Key encryption
  - IP whitelisting
  - Rate limiting

## API Endpoints

### Contacts
- **GET /api/contacts**
  - List contacts
  - Filter options
  - Pagination
  - Sort parameters

- **POST /api/contacts**
  - Create contact
  - Required fields
  - Optional fields
  - Validation rules

- **PUT /api/contacts/{id}**
  - Update contact
  - Partial updates
  - Field validation
  - Response codes

- **DELETE /api/contacts/{id}**
  - Remove contact
  - Soft delete
  - Cascade options
  - Confirmation

### Leads
- **GET /api/leads**
  - List leads
  - Status filter
  - Source filter
  - Date range

- **POST /api/leads**
  - Create lead
  - Auto-assignment
  - Duplicate check
  - Notifications

### Tasks
- **GET /api/tasks**
  - List tasks
  - Status filter
  - Priority filter
  - Assignment filter

- **POST /api/tasks**
  - Create task
  - Assignments
  - Due dates
  - Reminders

## Data Formats

### Request Format
```json
{
  "data": {
    "type": "contacts",
    "attributes": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    }
  }
}
```

### Response Format
```json
{
  "data": {
    "id": "123",
    "type": "contacts",
    "attributes": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-15T12:00:00Z"
    }
  }
}
```

## Rate Limiting

### Limits
- **Standard Tier**
  - 1000 requests/hour
  - Burst limit: 100/minute
  - Concurrent calls: 10
  - Response headers

- **Enterprise Tier**
  - Custom limits
  - Higher bursts
  - Priority queue
  - SLA guarantees

### Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Webhooks

### Configuration
- **Event Types**
  - Contact created
  - Lead converted
  - Task completed
  - Custom events

- **Delivery**
  - Retry policy
  - Timeout settings
  - Success criteria
  - Error handling

### Security
- **Webhook Auth**
  - Signing secret
  - HMAC validation
  - IP validation
  - TLS required

## Best Practices

### Integration
1. **Error Handling**
   - Status codes
   - Error messages
   - Retry logic
   - Logging

2. **Performance**
   - Batch operations
   - Pagination
   - Caching
   - Compression

### Development
1. **Testing**
   - Sandbox environment
   - Test data
   - Mock responses
   - Integration tests

2. **Monitoring**
   - API metrics
   - Error rates
   - Response times
   - Usage patterns

## Support

### Resources
- API reference
- Code samples
- SDKs
- Postman collection

### Help Channels
- Developer forum
- Support tickets
- API status page
- Documentation updates 