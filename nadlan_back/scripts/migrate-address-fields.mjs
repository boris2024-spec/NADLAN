/**
 * Migration to split address field into street and houseNumber
 * Run: node scripts/migrate-address-fields.mjs
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nadlan';

async function migrateAddressFields() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const Property = mongoose.model('Property', new mongoose.Schema({}, { strict: false }));

        // Find all properties
        const properties = await Property.find({});
        console.log(`\n📊 Found properties: ${properties.length}`);

        let updated = 0;
        let skipped = 0;

        for (const property of properties) {
            // Skip if street already exists
            if (property.location && property.location.street) {
                skipped++;
                continue;
            }

            // Skip if no address
            if (!property.location || !property.location.address) {
                skipped++;
                continue;
            }

            const address = property.location.address.trim();
            const parts = address.split(/\s+/);

            // Simple splitting logic:
            // If the last part looks like a house number (number or number + Hebrew letter)
            if (parts.length > 1) {
                const lastPart = parts[parts.length - 1];

                // Check if the last part is a house number
                if (/^\d+[א-ת]?$/.test(lastPart)) {
                    property.location.street = parts.slice(0, -1).join(' ');
                    property.location.houseNumber = lastPart;
                } else {
                    // If it doesn't look like a number, consider entire address as street
                    property.location.street = address;
                    property.location.houseNumber = '';
                }
            } else {
                // If address is one word, consider it as street
                property.location.street = address;
                property.location.houseNumber = '';
            }

            await property.save();
            updated++;

            if (updated % 10 === 0) {
                console.log(`✅ Processed: ${updated}`);
            }
        }

        console.log('\n📈 Migration statistics:');
        console.log(`   Total properties: ${properties.length}`);
        console.log(`   Updated: ${updated}`);
        console.log(`   Skipped: ${skipped}`);
        console.log('\n✅ Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration error:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
    }
}

// Run migration
migrateAddressFields();
