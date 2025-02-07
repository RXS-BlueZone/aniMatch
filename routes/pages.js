const express = require('express');
const path = require('path');

const router = express.Router();

// Middleware to check authentication
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login'); // Redirect to login if not authenticated
}

// Middleware to check onboarding completion
// Middleware to check onboarding completion
async function isOnboardingComplete(req, res, next) {
    if (req.session.user && req.session.user.genresCompleted) {
        return next(); // Skip if already marked complete in session
    }

    try {
        const userId = req.session.user.id; // Ensure user ID exists in session
        const { data: genres, error } = await supabase
            .from('GENRE_PREFERENCES')
            .select('genre_selected')
            .eq('user_id', userId);

        if (error) {
            console.error('Error checking onboarding:', error.message);
            return res.redirect('/onboarding');
        }

        if (genres && genres.length >= 3) {
            // Mark onboarding as complete in the session
            req.session.user.genresCompleted = true;
            return next();
        }

        res.redirect('/onboarding'); // Redirect to onboarding if incomplete
    } catch (err) {
        console.error('Unexpected error in onboarding check:', err);
        res.redirect('/onboarding');
    }
}


// Route for the login page
router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/index'); // Redirect to homepage if logged in
    }
    res.sendFile(path.join(__dirname, '../public', 'login.html'));
});


// Route for the signup page
router.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'signup.html'));
});

// Route for the homepage (index.html) - Requires authentication and onboarding
router.get('/index', isAuthenticated, isOnboardingComplete, (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Route for the onboarding page - Requires authentication
router.get('/onboarding', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'onboarding.html'));
});

module.exports = router;
