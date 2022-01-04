// import express from 'express';
const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt  = require('bcrypt');
const { pool } = require('../db/dbConnect');
const { getToken } = require('../util');

// function from express that handles requests to URL's
const router = express.Router();

// Bcrypt takes 2 to the power of saltrounds and applies that to the iterations in processing data. 10 is recommended.
const saltRounds = 10;

const userInfoValidation = (action) => {
	switch (action) {
		case 'signin':
			return [
				body('email', 'Incorrect Email').exists().isEmail(),
				body('password', 'Incorrect password').exists().isLength({ min: 8 }),
			];

		case 'register':
			return [
				body('firstName', 'First Name missing').exists().isLength({ min: 2 }),

				body('lastName', 'Last Name missing').exists().isLength({ min: 2 }),

				body('email', 'Invalid Email').exists().isEmail(),
				// Check if email is a duplicate in the library
				body('email').custom(async (email) => {
					const queryForEmail = {
						text: 'SELECT email FROM USERS WHERE email = $1',
						values: [email],
					};
					const queryRes = await pool.query(queryForEmail);
					if (queryRes.rows.length > 0) {
						throw new Error('Email already in use');
					}
					return true;
				}),
				body('password', 'Must be 8 minimum characters')
					.exists()
					.isLength({ min: 8 }),

				body('passwordConfirmation', 'Must be 8 minimum characters')
					.exists()
					.isLength({ min: 8 })
					.custom((passwordConfirmation, { req }) => {
						if (passwordConfirmation !== req.body.password) {
							throw new Error('Confirmation does not match Password');
						}
						return true;
					}),
			];
		default:
			break;
	}
};
// middleware functions
router.post('/register', userInfoValidation('register'), async (req, res) => {
	const errors = validationResult(req);
	console.log('errros', errors);
	if (!errors.isEmpty()) {
		return res.status(401).send(errors.array());
	}
	const { firstName, lastName, email, password } = req.body;

	// Hashing password with bcrypt

	const pwHash = await bcrypt.hash(password, saltRounds);

	//Query to store user in database
	const createUserQuery = {
		text: 'INSERT INTO users(firstName, lastName, email, passwordhash) VALUES($1, $2, $3, $4) RETURNING id, firstName, lastName, email',
		values: [firstName, lastName, email, pwHash],
	};

	const queryRes = await pool
		.query(createUserQuery)
		.catch(() =>
			res
				.status(401)
				.send([
					{ param: 'registrationError', msg: 'Failed to register user.' },
				]),
		);

	const newUser = queryRes.rows[0];
	/*
    console.log(queryRes);
    console.log(pwHash); */

	res.send({ ...newUser, token: getToken(newUser) });
});

router.post('/signin', userInfoValidation('signin'), async (req, res) => {
	//input validation
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(401).send(errors.array());
	}
	// check if email is in db
	const { email, password } = req.body;
	const queryForUser = {
		text: 'SELECT * FROM USERS WHERE email = $1',
		values: [email],
	};

	const queryRes = await pool.query(queryForUser);
	const listOfUsers = queryRes.rows;
	if (listOfUsers.length === 0) {
		return res
			.status(401)
			.send([{ param: 'userNotFound', msg: 'Incorrect email/password' }]);
	}
	// check if passwords matches password saved in database
	const possibleUser = listOfUsers[0];
	const checkPasswordMatch = await bcrypt.compare(
		password,
		possibleUser.passwordhash,
	);
	if (!checkPasswordMatch) {
		return res
			.status(401)
			.send([{ param: 'userNotFound', msg: 'Incorrect email/password' }]);
	}

	//destructering so pashword hash isnt sent to frontend
	const { passwordhash, ...userWithoutHash } = possibleUser;
	res.send({ ...userWithoutHash, token: getToken(userWithoutHash) });
});

module.exports = router;
