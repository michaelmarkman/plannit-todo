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

mongoose.model('Subtask', SubtaskSchema);
