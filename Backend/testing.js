const mongoose = require("mongoose")


db.connectToDatabase()
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

    db.users.getIndexes()
    .then((indexes) => {
        console.log('Indexes:', indexes);
    })
    .catch((error) => {
        console.error('Error getting indexes:', error);
    });