import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Property from '../models/Property.js';
import User from '../models/User.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

async function addTestContacts() {
    try {
        // Connect to MongoDB
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error('MONGODB_URI not found in .env file');
        }

        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(mongoURI);
        console.log('✅ MongoDB connected');

        // Find active properties
        const properties = await Property.find({ status: 'active' }).limit(10);

        if (properties.length === 0) {
            console.log('❌ No active properties found');
            process.exit(1);
        }

        console.log(`✅ Found ${properties.length} active properties`);

        // Find test users
        const users = await User.find({ role: { $in: ['user', 'buyer'] } }).limit(3);

        if (users.length === 0) {
            console.log('⚠️  No users found to add contacts');
            console.log('💡 Creating test user...');

            // Create test user if none exists
            const testUser = new User({
                firstName: 'Test',
                lastName: 'Buyer',
                email: 'test.buyer@example.com',
                password: 'Test123!@#',
                role: 'buyer',
                phone: '+972501234567',
                isEmailVerified: true
            });
            await testUser.save();
            users.push(testUser);
            console.log('✅ Test user created');
        }

        console.log(`✅ Found ${users.length} users`);

        // Contact types
        const contactTypes = ['call', 'email', 'whatsapp', 'viewing'];
        const contactMessages = [
            'Interested in viewing',
            'Would like more information',
            'Can I view this property?',
            'Please contact me',
            'Interested in this listing'
        ];

        let totalContactsAdded = 0;

        // Add contacts to each property
        for (const property of properties) {
            // Add 2-4 contacts per property
            const contactsCount = Math.floor(Math.random() * 3) + 2;

            for (let i = 0; i < contactsCount; i++) {
                const randomUser = users[Math.floor(Math.random() * users.length)];
                const randomType = contactTypes[Math.floor(Math.random() * contactTypes.length)];
                const randomMessage = contactMessages[Math.floor(Math.random() * contactMessages.length)];

                // Create contact with different status
                const statuses = ['pending', 'contacted', 'scheduled', 'completed'];
                const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

                // Add contact directly to array
                property.contacts.push({
                    user: randomUser._id,
                    type: randomType,
                    message: randomMessage,
                    status: randomStatus,
                    contactedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // random date within last 7 days
                });

                totalContactsAdded++;
            }

            // Save property with new contacts
            await property.save();
            console.log(`   ✅ Added ${contactsCount} contacts to "${property.title}"`);
        }

        console.log(`\n📊 Total contacts added: ${totalContactsAdded}`);

        // Show statistics by contact types
        const allProperties = await Property.find({ 'contacts.0': { $exists: true } });
        const contactTypeStats = {};
        const contactStatusStats = {};

        allProperties.forEach(prop => {
            prop.contacts.forEach(contact => {
                contactTypeStats[contact.type] = (contactTypeStats[contact.type] || 0) + 1;
                contactStatusStats[contact.status] = (contactStatusStats[contact.status] || 0) + 1;
            });
        });

        console.log('\n📈 Statistics by contact type:');
        Object.entries(contactTypeStats).forEach(([type, count]) => {
            console.log(`   ${type}: ${count}`);
        });

        console.log('\n📈 Statistics by contact status:');
        Object.entries(contactStatusStats).forEach(([status, count]) => {
            console.log(`   ${status}: ${count}`);
        });

    } catch (error) {
        console.error('❌ Error adding contacts:', error.message);
        console.error(error);
    } finally {
        await mongoose.connection.close();
        console.log('\n👋 Disconnecting from MongoDB');
    }
}

// Run the script
addTestContacts();
