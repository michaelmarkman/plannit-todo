var mongoose = require('mongoose');

var TaskSchema = new mongoose.Schema({
  title: String,
  description: String,
  complete: {type: Boolean, default: false},
  subtasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subtask' }]
});

TaskSchema.methods.toggleComplete = function(cb) {
  this.complete = (this.complete ? false : true);
  this.save(cb);
};

TaskSchema.methods.deleteTask = function(cb) {
  this.remove(function(err) {
    if (err) throw err;

    console.log('Task successfully deleted!');
  });
};

mongoose.model('Task', TaskSchema);
