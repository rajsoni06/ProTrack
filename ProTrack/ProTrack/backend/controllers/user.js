const User = require("../models/user");
const bcrypt = require("bcryptjs");

const getAuthUser = async (req, res) => {
	if (!req.user) {
		return res.status(404).json({ message: `User Not Found` });
	}
	res.status(200).json({
		data: req.user,
	});
};

const updateUser = async (req, res) => {
	let { name, email, oldPassword, newPassword } = req.body;
	if (req.user.email != email) {
		const existingUser = await User.findOne({ email: email });
		if (existingUser) {
			return res.status(400).json({ message: `Email Already Used` });
		}
	}
	const user = await User.findById(req.user.id);
	const passwordEqual = bcrypt.compareSync(oldPassword, user.password);
	if (passwordEqual) {
		newPassword = bcrypt.hashSync(newPassword, 8);
		const userData = await User.findByIdAndUpdate(
			req.user.id,
			{
				name: name,
				email: email,
				password: newPassword,
			},
			{ new: true }
		);
		userData.password = null;
		res.status(200).json({
			message: "success",
			data: userData,
		});
	} else {
		return res.status(400).json({ message: "Password is incorrect" });
	}
};

const getAllUsers = async (req, res) => {
	const allUsers = await User.find({ _id: { $ne: req.user._id } })
		.select("-password")
		.sort({ _id: -1 });
	res.status(200).send({ data: allUsers });
};
const updateBoard = async (req, res) => {
	let { email } = req.body;
	const userData = await User.findByIdAndUpdate(
		req.user.id,
		{ $push: { board: email } },
		{ new: true }
	);
	userData.password = null;
	res.status(200).json({
		message: "success",
		data: userData,
		email: email,
	});
};

module.exports = { getAuthUser, updateUser, getAllUsers, updateBoard };
