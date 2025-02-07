const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Initialize Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Route to save genres
router.post('/api/save-genres', async (req, res) => {
    const { genres } = req.body;

    if (!req.session.user || !req.session.user.id) {
        return res.status(401).send('Unauthorized: User ID is missing.');
    }

    if (!Array.isArray(genres) || genres.length < 3) {
        return res.status(400).send('Please select at least three genres.');
    }

    try {
        const userId = req.session.user.id;

        // Check if the user already has at least 3 genres
        const { data: existingGenres } = await supabase
            .from('GENRE_PREFERENCES')
            .select('genre_selected')
            .eq('user_id', userId);

        if (existingGenres && existingGenres.length >= 3) {
            return res.status(400).send('You have already selected your genres.');
        }

        // Insert new genres
        const genreEntries = genres.map((genre) => ({
            user_id: userId,
            genre_selected: genre,
        }));

        const { error } = await supabase.from('GENRE_PREFERENCES').insert(genreEntries);

        if (error) {
            console.error('Error inserting genres:', error.message);
            return res.status(500).send('Error saving genres.');
        }

        // Update session to mark onboarding as complete
        req.session.user.genresCompleted = true;

        res.status(200).send('Genres saved successfully.');
    } catch (err) {
        console.error('Unexpected error:', err);
        res.status(500).send('Server error. Please try again later.');
    }
});






module.exports = router;

