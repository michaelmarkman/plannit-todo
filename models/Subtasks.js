var mongoose = require('mongoose');

var SubtaskSchema = new mongoose.Schema({
  title: String,
  complete: {type: Boolean, default: false},
  priority: Number,
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' }
});

SubtaskSchema.methods.toggleComplete = function(cb) {
  this.complete = (this.complete ? false : true);
  this.save(cb);
};

SubtaskSchema.methods.deleteSubtask = function(cb) {
  this.remove(function(err) {
    if (err) throw err;

    console.log('Subtask successfully deleted!');
  });
};

mongoose.model('Subtask', SubtaskSchema);
