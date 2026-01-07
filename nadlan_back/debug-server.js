import express from 'express';
import cors from 'cors';
import { validateRegister } from './middleware/validation.js';

const app = express();
const PORT = 3002; // Separate port for debugging

// Middleware
app.use(cors());
app.use(express.json());

// Add logging for all requests
app.use((req, res, next) => {
    console.log(`\n=== ${new Date().toISOString()} ===`);
    console.log(`${req.method} ${req.url}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    next();
});

// Test route for checking
app.get('/test', (req, res) => {
    console.log('GET /test - request processed');
    res.json({ message: 'Test server is working!', timestamp: new Date() });
});

// Registration route with detailed logging
app.post('/api/auth/register', (req, res) => {
    console.log('\n🔥 POST /api/auth/register - request received');

    try {
        console.log('📝 Request data:', JSON.stringify(req.body, null, 2));

        // Check required fields
        const { firstName, lastName, email, password, role } = req.body;

        console.log('🔍 Checking required fields:');
        console.log('- firstName:', firstName, typeof firstName);
        console.log('- lastName:', lastName, typeof lastName);
        console.log('- email:', email, typeof email);
        console.log('- phone:', req.body.phone ? req.body.phone : 'NOT PROVIDED', typeof req.body.phone);
        console.log('- password:', password ? '[HIDDEN]' : 'NOT PROVIDED');
        console.log('- role:', role, typeof role);

        if (!firstName) {
            console.log('❌ Error: firstName is missing');
            return res.status(400).json({ error: 'firstName is required' });
        }

        if (!lastName) {
            console.log('❌ Error: lastName is missing');
            return res.status(400).json({ error: 'lastName is required' });
        }

        if (!email) {
            console.log('❌ Error: email is missing');
            return res.status(400).json({ error: 'email is required' });
        }

        if (!password) {
            console.log('❌ Error: password is missing');
            return res.status(400).json({ error: 'password is required' });
        }

        // Check role
        const allowedRoles = ['user', 'agent'];
        if (role && !allowedRoles.includes(role)) {
            console.log(`❌ Error: invalid role "${role}". Allowed:`, allowedRoles);
            return res.status(400).json({ error: `Invalid role. Allowed: ${allowedRoles.join(', ')}` });
        }

        // Check password
        if (password.length < 6) {
            console.log('❌ Error: password is too short');
            return res.status(400).json({ error: 'Password must contain at least 6 characters' });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/;
        if (!passwordRegex.test(password)) {
            console.log('❌ Error: password does not meet requirements');
            return res.status(400).json({ error: 'Password must contain uppercase letter, lowercase letter, digit and special character' });
        }

        console.log('✅ All checks passed successfully');

        // Simulate successful registration
        const mockUser = {
            id: Date.now(),
            firstName,
            lastName,
            email,
            role: role || 'user',
            createdAt: new Date()
        };

        console.log('✅ User created:', JSON.stringify(mockUser, null, 2));

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: mockUser,
                tokens: {
                    accessToken: 'mock-access-token',
                    refreshToken: 'mock-refresh-token'
                }
            }
        });

    } catch (error) {
        console.error('💥 Error in registration handler:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Error handler
app.use((error, req, res, next) => {
    console.error('💥 Global error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Debug server running on port ${PORT}`);
    console.log(`📡 Test: http://localhost:${PORT}/test`);
    console.log(`🔧 Registration: http://localhost:${PORT}/api/auth/register`);
});