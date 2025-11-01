import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/index.js';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const googleConfig = {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
};

console.log('Google OAuth Config:', {
    clientID: googleConfig.clientID ? '✓' : '✗',
    clientSecret: googleConfig.clientSecret ? '✓' : '✗',
    callbackURL: googleConfig.callbackURL
});

// Only configure Google Strategy if we have the required credentials
if (googleConfig.clientID && googleConfig.clientSecret) {
    // Configure Google OAuth Strategy
    passport.use(new GoogleStrategy(googleConfig, async (accessToken, refreshToken, profile, done) => {
        try {
            console.log('Google Profile:', profile);

            // Extract user data from Google profile
            const userData = {
                googleId: profile.id,
                email: profile.emails[0].value,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                avatar: profile.photos[0]?.value
            };

            return done(null, userData);
        } catch (error) {
            console.error('Passport Google Strategy Error:', error);
            return done(error, null);
        }
    }));
} else {
    console.warn('⚠️ Google OAuth credentials not found, skipping Google strategy');
}

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user);
});

// Deserialize user from session
passport.deserializeUser((user, done) => {
    done(null, user);
});

export default passport;