// import express from 'express';
const express = require('express');
const { pool } = require('../db/dbConnect');
const { getAuthUser } = require('../util');

const router = express.Router();

//Endpoint
router.get('/', getAuthUser, async (req, res) => {
	const authUser = req.user;

	const findHabitsQuery = {
		text: 'SELECT * FROM habits where userID = $1',
		values: [authUser.id],
	};

	const queryRes = await pool.query(findHabitsQuery).catch((err) => {
		console.log('err', err);
		return res
			.status(401)
			.send([{ param: 'read error', msg: 'Error fetching habits' }]);
	});
	const ALLHabits = queryRes.rows;
	res.send(ALLHabits);
});

router.post('/create', getAuthUser, async (req, res) => {
	const authUser = req.user;
	const { habitName, dates = new Date().toISOString() } = req.body;

	const createHabitsQuery = {
		text: 'INSERT INTO habits (name, userID, dates) VALUES ($1, $2, $3)',
		values: [habitName, authUser.id, dates],
	};

	await pool.query(createHabitsQuery).catch((err) => {
		console.log('err', err);
		return res
			.status(401)
			.send([{ param: 'create error', msg: 'Error creating habit' }]);
	});
	res.status(200).send();
});

router.put('/update/:id', getAuthUser, async (req, res) => {
	const authUser = req.user;
	const { habitName, dates = new Date().toISOString() } = req.body;
	const habitID = req.params.id;

	const updateHabitsQuery = {
		text: 'UPDATE habits SET name = $1, dates = $4 WHERE userID = $2 AND id = $3',
		values: [habitName, authUser.id, habitID, dates],
	};

	await pool.query(updateHabitsQuery).catch(() => {
		return res
			.status(401)
			.send([{ param: 'Update error', msg: 'Error updating habit' }]);
	});
	res.status(200).send();
});

router.delete('/delete/:id', getAuthUser, async (req, res) => {
	const authUser = req.user;
	const habitID = req.params.id;
	console.log('delete');

	const deleteHabitsQuery = {
		text: 'DELETE from habits WHERE id = $1 AND userID = $2',
		values: [habitID, authUser.id],
	};

	await pool.query(deleteHabitsQuery).catch(() => {
		return res
			.status(401)
			.send([{ param: 'Delete error', msg: 'Error deleting habit' }]);
	});
	res.status(200).send();
});

// module.exports = (router);
module.exports = router;

