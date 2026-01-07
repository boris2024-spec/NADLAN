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

// Test data for seeding
const sampleProperties = [
    {
        title: "Modern Apartment in Tel Aviv Center",
        description: "Beautiful 3-room apartment with sea view. Fully furnished with modern renovation. All infrastructure nearby, beach 5 minutes walk.",
        propertyType: "apartment",
        transactionType: "sale",
        price: {
            amount: 2500000,
            currency: "ILS"
        },
        location: {
            address: "Dizengoff 100",
            city: "Tel Aviv",
            district: "Center",
            coordinates: {
                latitude: 32.0853,
                longitude: 34.7818
            }
        },
        details: {
            area: 95,
            rooms: 3,
            bedrooms: 2,
            bathrooms: 2,
            floor: 5,
            totalFloors: 8,
            buildYear: 2018,
            condition: "excellent"
        },
        features: {
            hasParking: true,
            hasElevator: true,
            hasBalcony: true,
            hasAirConditioning: true,
            hasSecurity: true
        },
        status: "active",
        priority: "featured"
    },
    {
        title: "Cozy Studio in Jerusalem",
        description: "Small but very cozy studio in a quiet Jerusalem neighborhood. Perfect for students or young couple. Great location, near university.",
        propertyType: "studio",
        transactionType: "rent",
        price: {
            amount: 3500,
            currency: "ILS",
            period: "month"
        },
        location: {
            address: "Jaffa 45",
            city: "Jerusalem",
            district: "Center",
            coordinates: {
                latitude: 31.7683,
                longitude: 35.2137
            }
        },
        details: {
            area: 35,
            rooms: 1,
            bedrooms: 0,
            bathrooms: 1,
            floor: 2,
            totalFloors: 4,
            buildYear: 2015,
            condition: "good"
        },
        features: {
            hasElevator: false,
            hasBalcony: false,
            hasAirConditioning: true,
            isFurnished: true
        },
        status: "active",
        priority: "standard"
    },
    {
        title: "Luxury Villa in Herzliya",
        description: "Exclusive villa with pool and garden. 5 bedrooms, large living room, modern kitchen. Premium location, sea view, gated community.",
        propertyType: "villa",
        transactionType: "sale",
        price: {
            amount: 8500000,
            currency: "ILS"
        },
        location: {
            address: "Herzl 12",
            city: "Herzliya",
            district: "Herzliya Pituach",
            coordinates: {
                latitude: 32.1667,
                longitude: 34.8000
            }
        },
        details: {
            area: 350,
            rooms: 7,
            bedrooms: 5,
            bathrooms: 4,
            floor: 0,
            totalFloors: 2,
            buildYear: 2020,
            condition: "new"
        },
        features: {
            hasParking: true,
            hasGarden: true,
            hasPool: true,
            hasAirConditioning: true,
            hasSecurity: true,
            isFurnished: false
        },
        status: "active",
        priority: "premium"
    },
    {
        title: "Penthouse with Terrace in Haifa",
        description: "Stunning penthouse on top floor with huge terrace and panoramic bay view. 4 rooms, designer renovation, all included.",
        propertyType: "penthouse",
        transactionType: "sale",
        price: {
            amount: 4200000,
            currency: "ILS"
        },
        location: {
            address: "Hanassi 88",
            city: "Haifa",
            district: "Carmel",
            coordinates: {
                latitude: 32.7940,
                longitude: 34.9896
            }
        },
        details: {
            area: 180,
            rooms: 4,
            bedrooms: 3,
            bathrooms: 3,
            floor: 10,
            totalFloors: 10,
            buildYear: 2019,
            condition: "excellent"
        },
        features: {
            hasParking: true,
            hasElevator: true,
            hasTerrace: true,
            hasAirConditioning: true,
            hasSecurity: true,
            hasStorage: true
        },
        status: "active",
        priority: "premium"
    },
    {
        title: "Office in Tel Aviv Business Center",
        description: "Modern office space in prestigious business center. 120 sq.m., open space layout, 2 meeting rooms, excellent transport accessibility.",
        propertyType: "office",
        transactionType: "rent",
        price: {
            amount: 15000,
            currency: "ILS",
            period: "month"
        },
        location: {
            address: "Rothschild 22",
            city: "Tel Aviv",
            district: "Center",
            coordinates: {
                latitude: 32.0634,
                longitude: 34.7719
            }
        },
        details: {
            area: 120,
            rooms: 4,
            bathrooms: 2,
            floor: 7,
            totalFloors: 15,
            buildYear: 2017,
            condition: "excellent"
        },
        features: {
            hasParking: true,
            hasElevator: true,
            hasAirConditioning: true,
            hasSecurity: true,
            isAccessible: true
        },
        status: "active",
        priority: "featured"
    }
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error('MONGODB_URI not found in .env file');
        }

        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(mongoURI);
        console.log('✅ MongoDB connected');

        // Find first agent/administrator
        const agent = await User.findOne({ role: { $in: ['agent', 'admin'] } });

        if (!agent) {
            console.log('❌ User with agent or admin role not found');
            console.log('💡 Please create a user with agent or admin role first');
            process.exit(1);
        }

        console.log(`✅ Agent found: ${agent.firstName} ${agent.lastName} (${agent.email})`);

        // Clear existing test data (optional)
        const shouldClear = process.argv.includes('--clear');
        if (shouldClear) {
            console.log('🗑️  Deleting existing properties...');
            await Property.deleteMany({});
            console.log('✅ Existing properties deleted');
        }

        // Add agent to all properties
        const propertiesWithAgent = sampleProperties.map(prop => ({
            ...prop,
            agent: agent._id,
            owner: agent._id
        }));

        // Seed data
        console.log('🔄 Loading test data...');
        const insertedProperties = await Property.insertMany(propertiesWithAgent);

        console.log(`✅ Successfully loaded ${insertedProperties.length} properties:`);
        insertedProperties.forEach((prop, index) => {
            console.log(`   ${index + 1}. ${prop.title} (${prop.propertyType}, ${prop.transactionType})`);
        });

        // Statistics
        const stats = await Property.countDocuments();
        console.log(`\n📊 Total properties in database: ${stats}`);

    } catch (error) {
        console.error('❌ Error loading data:', error.message);
        console.error(error);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Disconnecting from MongoDB');
    }
}

// Run script
seedDatabase();
