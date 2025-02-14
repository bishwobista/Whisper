const UserRouter = require('express').Router();
const validator = require('validator').default;

const User = require('../models/UserSchema');

const loginUser = async (req, res) => {
	const { email } = req.body;

	if (typeof email !== 'string' || !validator.isEmail(email)) {
		res.status(406).json({
			message: 'Email is invalid',
		});

		return;
	}

	try {
		let findUser = await User.findOne({ email });

		if (!findUser) {
			const newUser = await User.create({ email });

			res.status(200).json({
				id: newUser._id,
			});

			return;
		}

		res.status(200).json({
			id: findUser._id,
		});
	} catch (err) {
		res.status(500).json({
			message: 'An error occured whiles logging in',
		});
	}
};

const getProfile = async (req, res) => {
	try {
		const { email } = req.params;

		// Find the user by email
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		// Send the user profile data as JSON response
		res.status(200).json(user);
	} catch (error) {
		console.error('Error fetching user profile:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};

const updateProfile = async (req, res) => {
	const { username, aboutMe, gender, age, email } = req.body;

	if (typeof email !== 'string' || !validator.isEmail(email)) {
		res.status(406).json({
			message: 'Email is invalid',
		});

		return;
	}

	try {
		// Find the user by email
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		// Update user's profile with provided fields or defaults
		user.username = username || 'Anonymous';
		user.aboutMe = aboutMe || null;
		user.gender = gender || 'Unknown';
		user.age = age || null;

		// Save the updated user profile
		await user.save();

		return res.status(200).json({ message: 'Profile updated successfully' });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Internal server error' });
	}
};

const deleteUser = async (req, res) => {
	const { email } = req.body;

	if (typeof email !== 'string' || !validator.isEmail(email)) {
		res.status(406).json({
			message: 'Email is invalid',
		});

		return;
	}
	try {
		// Find the user by email
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		// Delete the user
		await user.deleteOne();

		return res.status(200).json({ message: 'User deleted successfully' });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Internal server error' });
	}
};

UserRouter.route('/login').post(loginUser);
UserRouter.route('/profile').post(updateProfile);
UserRouter.route('/profile/:email').get(getProfile);
UserRouter.route('/deleteUser').delete(deleteUser);

module.exports = UserRouter;
