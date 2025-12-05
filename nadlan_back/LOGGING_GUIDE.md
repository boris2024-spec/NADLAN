# Logging System Guide

## Overview

The logging system uses **morgan** for HTTP requests and **winston** for general application logging.

## Log Structure

Logs are divided into three streams:

### 1. HTTP Requests (`logs/http.log`)
- All HTTP requests are logged via morgan
- Format: combined (Apache combined log format)
- Automatic rotation when reaching 5MB
- Up to 5 files are kept

### 2. Application Errors (`logs/errors.log`)
- All errors of level error and above
- Includes stack trace
- Automatic rotation when reaching 5MB
- Up to 5 files are kept

### 3. Security (`logs/security.log`)
- CORS events (allowed/blocked requests)
- Server start/stop events
- Automatic rotation when reaching 5MB
- Up to 5 files are kept

## Usage in Code

### Importing Loggers

```javascript
import { httpLogger, errorLogger, securityLogger } from './utils/logger.js';
```

### Usage Examples

#### HTTP Logging
```javascript
httpLogger.info('User logged in successfully');
httpLogger.warn('Rate limit approaching');
```

#### Errors
```javascript
errorLogger.error('Database connection failed', {
    error: err.message,
    stack: err.stack
});
```

#### Security
```javascript
securityLogger.info('Authentication attempt from IP: ' + ip);
securityLogger.warn('Suspicious activity detected');
```

## Log Format

```
2025-11-15 14:30:45 [INFO]: Server started on port 3000
2025-11-15 14:30:50 [ERROR]: Database connection failed
```

## Configuration

All settings are located in `utils/logger.js`:

- **File size**: `maxsize: 5242880` (5MB)
- **Number of files**: `maxFiles: 5`
- **Timestamp format**: `YYYY-MM-DD HH:mm:ss`

## Log Rotation

Winston automatically creates new files when:
- The current file reaches 5MB
- No more than 5 files are kept for each type
- Old files are automatically deleted

## Console Output

All logs are also output to the console with color highlighting for easier development.
