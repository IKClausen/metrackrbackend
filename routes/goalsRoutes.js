// import express from 'express';
const express = require('express');
const { pool } = require('../db/dbConnect');
const { getAuthUser } = require('../util');

const router = express.Router();

//Endpoint
router.get('/', getAuthUser, async (req, res) => {
	const authUser = req.user;

	const findGoalsQuery = {
		text: 'SELECT * FROM goals where userID = $1',
		values: [authUser.id],
	};

	const queryRes = await pool.query(findGoalsQuery).catch(() => {
		return res
			.status(401)
			.send([{ param: 'read error', msg: 'Error fetching goals' }]);
	});
	const ALLGoals = queryRes.rows;
	res.send(ALLGoals);
});

router.post('/create', getAuthUser, async (req, res) => {
	const authUser = req.user;
	const { goalName } = req.body;

	const createGoalsQuery = {
		text: 'INSERT INTO goals (name, userID) VALUES ($1, $2)',
		values: [goalName, authUser.id],
	};

	await pool.query(createGoalsQuery).catch(() => {
		return res
			.status(401)
			.send([{ param: 'create error', msg: 'Error creating goal' }]);
	});
	res.status(200).send();
});

router.put('/update/:id', getAuthUser, async (req, res) => {
	const authUser = req.user;
	const { goalName } = req.body;
	const goalID = req.params.id;

	const updateGoalsQuery = {
		text: 'UPDATE goals SET name = $1 WHERE userID = $2 AND id = $3',
		values: [goalName, authUser.id, goalID],
	};

	await pool.query(updateGoalsQuery).catch(() => {
		return res
			.status(401)
			.send([{ param: 'Update error', msg: 'Error updating goal' }]);
	});
	res.status(200).send();
});

router.delete('/delete/:id', getAuthUser, async (req, res) => {
	const authUser = req.user;
	const goalID = req.params.id;
	console.log('delete');

	const deleteGoalsQuery = {
		text: 'DELETE from goals WHERE id = $1 AND userID = $2',
		values: [goalID, authUser.id],
	};

	await pool.query(deleteGoalsQuery).catch(() => {
		return res
			.status(401)
			.send([{ param: 'Delete error', msg: 'Error deleting goal' }]);
	});
	res.status(200).send();
});

module.exports = router;
