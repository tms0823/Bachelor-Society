const bcrypt = require('bcryptjs');

module.exports = {
	hash: async (plain) => {
		const salt = await bcrypt.genSalt(10);
		return bcrypt.hash(plain, salt);
	},

	compare: async (plain, hash) => {
		return bcrypt.compare(plain, hash);
	}
};
