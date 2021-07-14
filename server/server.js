// Import express framework and middleware
const express = require('express')
const path = require('path');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');

// Require environment configuration
require("dotenv").config()

// Import routes
// const usersRoutes = require('./routes/users');
// const contactsRoutes = require('./routes/contacts');

// Create express app
const app = express();

// Implement middleware
app.use(cors());
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set app route values
// app.use('/users', usersRoutes);
// app.use('/contacts', contactsRoutes);

// Serve frontend from express
if(process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/build')));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

// Catch errors
app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
        status: err.status || 'an error occurred',
        message: err.message
    });
});

// Start express app
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log('server is up and listening on port ${PORT}');
});

module.exports = app;