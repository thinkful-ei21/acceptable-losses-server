module.exports = {
	cronJobRebatch: function() {
		Accounts.find()
			.then(accounts => {
				// recreate all cron jobs based on the "reminder", "dueDate" fields
			});
	},
	cronJobCreate: function(account) {
		// create cronjob here
	}
}