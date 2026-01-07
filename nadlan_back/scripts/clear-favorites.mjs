import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/index.js';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function clearUserFavorites() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Show all users
        const users = await User.find({}).select('firstName lastName email favorites');

        console.log('=== Available Users ===\n');
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.fullName} (${user.email}) - ${user.favorites?.length || 0} favorites`);
        });

        rl.question('\nEnter user email to clear favorites (or "all" to clear all): ', async (answer) => {
            try {
                if (answer.toLowerCase() === 'all') {
                    // Clear for all users
                    await User.updateMany({}, { $set: { favorites: [] } });
                    console.log('\n✅ All favorites cleared for all users!');
                } else {
                    // Clear for specific user
                    const user = await User.findOne({ email: answer.trim() });
                    if (!user) {
                        console.log('\n❌ User not found!');
                    } else {
                        const oldCount = user.favorites?.length || 0;
                        user.favorites = [];
                        await user.save();
                        console.log(`\n✅ Cleared ${oldCount} favorites for ${user.fullName}`);
                    }
                }

                mongoose.connection.close();
                rl.close();
                console.log('\nDisconnected from MongoDB');
                process.exit(0);
            } catch (error) {
                console.error('Error:', error);
                mongoose.connection.close();
                rl.close();
                process.exit(1);
            }
        });

    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        rl.close();
        process.exit(1);
    }
}

clearUserFavorites();
