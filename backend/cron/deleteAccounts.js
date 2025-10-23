const cron = require('node-cron');
const Admin = require('../models/Admin');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

const models = [Admin, Teacher, Student];

cron.schedule('0 0 * * *', async () => { // will check for deletion everyday at midnight
  try {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    for (const Model of models) {
      const result = await Model.deleteMany({
        deleteRequestedAt: { $lt: cutoff }
      });
      console.log(`Deleted ${result.deletedCount} ${Model.collection.collectionName} accounts`);
    }

  } catch (err) {
    console.error('Error deleting accounts:', err);
  }
});
