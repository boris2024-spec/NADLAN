import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/index.js';

dotenv.config();

async function debugFavorites() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find all users and show their favorites
        const users = await User.find({}).select('firstName lastName email favorites');

        console.log('\n=== Users with favorites ===\n');
        for (const user of users) {
            console.log(`${user.fullName} (${user.email}):`);
            console.log(`  Favorites count: ${user.favorites?.length || 0}`);
            console.log(`  Favorites IDs:`, user.favorites);
            console.log('');
        }

        // Optional: clear favorites for specific user
        // Uncomment the following lines and replace email
        /*
        const userEmail = 'your-email@example.com';
        const userToClean = await User.findOne({ email: userEmail });
        if (userToClean) {
            userToClean.favorites = [];
            await userToClean.save();
            console.log(`✅ Favorites cleared for ${userEmail}`);
        }
        */

        mongoose.connection.close();
        console.log('\nDisconnected from MongoDB');

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

debugFavorites();
