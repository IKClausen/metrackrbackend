//Entry point for all backend code
// import express from 'express';
// const express = require('express');
const express = require('express');
const userRoutes = require('./routes/userRoutes');
const habitsRoutes = require('./routes/habitsRoutes');
const goalsRoutes = require('./routes/goalsRoutes') ;

const app = express();

// Function that parses incoming requests as JSON.
app.use(express.json());

app.use('/user', userRoutes);

app.use('/goals', goalsRoutes);

app.use('/habits', habitsRoutes);

app.listen(5001, () => {
	console.log('app listening at http://localhost:5001');
});
