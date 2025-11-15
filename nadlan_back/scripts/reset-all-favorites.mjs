import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/index.js';

dotenv.config();

async function resetAllFavorites() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Получить статистику перед очисткой
        const usersBefore = await User.find({ 'favorites.0': { $exists: true } })
            .select('firstName lastName email favorites');

        console.log('=== Users with favorites before reset ===\n');
        let totalFavorites = 0;
        usersBefore.forEach(user => {
            const count = user.favorites?.length || 0;
            totalFavorites += count;
            console.log(`- ${user.fullName} (${user.email}): ${count} favorites`);
        });

        console.log(`\n📊 Total favorites to clear: ${totalFavorites}`);
        console.log(`👥 Users affected: ${usersBefore.length}\n`);

        // Очистить все избранное у всех пользователей
        console.log('🗑️  Clearing all favorites...');
        const result = await User.updateMany(
            {},
            { $set: { favorites: [] } }
        );

        console.log(`\n✅ Successfully cleared favorites!`);
        console.log(`   Modified documents: ${result.modifiedCount}`);
        console.log(`   Matched documents: ${result.matchedCount}\n`);

        // Проверка после очистки
        const usersAfter = await User.countDocuments({ 'favorites.0': { $exists: true } });
        console.log(`📊 Users with favorites after reset: ${usersAfter}`);

        await mongoose.connection.close();
        console.log('\n✅ Disconnected from MongoDB');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
}

resetAllFavorites();
