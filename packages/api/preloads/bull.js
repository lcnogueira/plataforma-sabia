const Bull = use('Rocketseat/Bull');
const UpdateTechnologyTotalViewsJob = use('App/Jobs/UpdateTechnologyTotalViews');

Bull.process()
	// Optionally you can start BullBoard:
	.ui(9999); // http://localhost:9999
// You don't need to specify the port, the default number is 9999

// Run the update technology views job every midnight
Bull.add(UpdateTechnologyTotalViewsJob.key, null, {
	repeat: {
		cron: '0 0 * * *',
	},
});
