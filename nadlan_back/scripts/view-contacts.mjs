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

async function viewContacts() {
    try {
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error('MONGODB_URI not found in .env file');
        }

        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(mongoURI);
        console.log('✅ MongoDB connected\n');

        // Get properties with contacts
        const properties = await Property.find({
            'contacts.0': { $exists: true }
        })
            .populate('contacts.user', 'firstName lastName email phone')
            .limit(5)
            .select('title contacts');

        if (properties.length === 0) {
            console.log('❌ No properties with contacts found');
            process.exit(0);
        }

        console.log(`📋 Found ${properties.length} properties with contacts:\n`);

        properties.forEach((property, index) => {
            console.log(`${index + 1}. "${property.title}"`);
            console.log(`   ID: ${property._id}`);
            console.log(`   Contacts (${property.contacts.length}):`);

            property.contacts.forEach((contact, cIndex) => {
                const user = contact.user;
                console.log(`      ${cIndex + 1}. Type: ${contact.type}`);
                console.log(`         User: ${user?.firstName} ${user?.lastName} (${user?.email})`);
                console.log(`         Message: ${contact.message || 'No message'}`);
                console.log(`         Status: ${contact.status}`);
                console.log(`         Date: ${contact.contactedAt.toLocaleString('en-US')}`);
            });
            console.log('');
        });

        // Overall statistics
        const totalProperties = await Property.countDocuments({ 'contacts.0': { $exists: true } });
        const allContacts = await Property.aggregate([
            { $match: { 'contacts.0': { $exists: true } } },
            { $project: { contactsCount: { $size: '$contacts' } } },
            { $group: { _id: null, total: { $sum: '$contactsCount' } } }
        ]);

        console.log('📊 Overall statistics:');
        console.log(`   Properties with contacts: ${totalProperties}`);
        console.log(`   Total contacts: ${allContacts[0]?.total || 0}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n👋 Disconnecting from MongoDB');
    }
}

viewContacts();
