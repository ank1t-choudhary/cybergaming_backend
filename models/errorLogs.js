const mongoose = require("mongoose");

const errorLogsSchema = new mongoose.Schema({
	time: Date,
	file: String,
	line: String,
	info: mongoose.Schema.Types.Mixed,
	type: String,
});

const errorLogs = mongoose.model("error-logs", errorLogsSchema);

module.exports = errorLogs;
