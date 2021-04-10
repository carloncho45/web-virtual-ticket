const functions = require("firebase-functions");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const admin = require('firebase-admin');
admin.initializeApp();
// const language = require('@google-cloud/language');
//  const client = new language.LanguageServiceClient();
const express = require('express');
const app = express();

// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
//
const authenticate = async (req, res, next) => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
        res.status(403).send('Unauthorized');
        return;
    }
    const idToken = req.headers.authorization.split('Bearer ')[1];
    try {
        const decodedIdToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedIdToken;
        next();
        return;
    } catch(e) {
        res.status(403).send('Unauthorized!');
        return;
    }
};

app.use(authenticate);

// GET /api/messages?category={category}
// Get all messages, optionally specifying a category to filter on
app.get('/test-connection', async (req, res) => {
    const hour = new Date().getTime()
    // London is UTC + 1hr;
    res.status(200).json({"date": hour});
});

/*exports.scheduledFunction = functions.pubsub.schedule('00 12 * * *').onRun((context) => {
    console.log('This will be run every 1 minutes!!!!!!!');
    return null;
});*/
// Expose the API as a function


exports.app = functions.https.onRequest(app);

// Helper function to categorize a sentiment score as positive, negative, or neutral
const categorizeScore = (score) => {
    if (score > 0.25) {
        return 'positive';
    } else if (score < -0.25) {
        return 'negative';
    }
    return 'neutral';
};
