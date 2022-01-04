const jwt = require('jsonwebtoken');
const config = require('./config');

const getToken = (userInfo) => {
	return jwt.sign(userInfo, config.JWT_SECRET, { expiresIn: '24h' });
};

//Function to verify JWT
const getAuthUser = (req, res, next) => {
	const token = req.headers.authorization;
	if (token) {
		const onlyToken = token.slice(7, token.length);
		jwt.verify(onlyToken, config.JWT_SECRET, (err, decode) => {
			if (err) {
				return res
					.status(401)
					.send([{ param: 'auth error', msg: 'Invalid token' }]);
			}
			req.user = decode;
			next();
			return;
		});
	} else {
		return res
			.status(401)
			.send([{ param: 'auth error', msg: 'Token not found' }]);
	}
};

module.exports = { getToken, getAuthUser };
