var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');

var Task = mongoose.model('Task');
var Subtask = mongoose.model('Subtask');

// Get all of the tasks, and populate the subtasks array for each task with the actual objects (vs their id's by default)
router.get('/tasks', function(req, res, next) {
  Task.find({}).populate('subtasks').exec(function(err, tasks) {
    // console.log(tasks);
    res.json(tasks);
  });
});

// Creating a new task
router.post('/tasks', function(req, res, next) {
  var task = new Task(req.body);

  task.save(function(err, post){
    if (err) {
      return next(err);
    }
    res.json(task);
  });
});

// Param will handle querying for the actual task object based on the pased id. Basically a helper for the other routes
router.param('task', function(req, res, next, id) {
  var query = Task.findById(id);

  query.exec(function (err, task){
    if (err) {
      return next(err);
    }
    if (!task) {
      return next(new Error('can\'t find task'));
    }
    req.task = task;
    return next();
  });
});

// Get a tasks subtasks
router.get('/tasks/:task', function(req, res) {
  req.task.populate('subtasks', function(err, task) {
    if (err) {
      return next(err);
    }
    res.json(req.task);
  });
});

// Mark a task as complete
router.put('/tasks/:task/complete', function(req, res, next) {
  req.task.toggleComplete(function(err, task) {
    if (err) {
      return next(err);
    }
    res.json(task);
  });
});

// Delete a task
router.delete('/tasks/:task', function(req, res, next) {
  req.task.deleteTask(function(err, task) {
    if (err) {
      return next(err);
    }
    res.json(task);
  });
});


// Create a new subtask
router.post('/tasks/:task/subtasks', function(req, res, next) {
  // Make the new subtask object
  var subtask = new Subtask(req.body);
  console.log(subtask);
  // Link it to its parent task
  subtask.task = req.task;
  console.log(req.task);
  subtask.save(function(err, subtask) {
    if (err) {
      console.log(err);
      return next(err);
    }
    // Push the newly created subtask in to its parent task's subtask array
    req.task.subtasks.push(subtask);
    console.log("pushing");
    req.task.save(function(err, task) {
      if (err) {
        return next(err);
      }
      console.log("saving task");
      console.log(subtask)
      res.json(subtask);
    });
  });
});

// Param will handle querying for the actual subtask object based on the pased id. Basically a helper for the other routes
router.param('subtask', function(req, res, next, id) {
  var query = Subtask.findById(id);

  query.exec(function (err, subtask) {
    if (err) {
      return next(err);
    }
    if (!subtask) {
      return next(new Error('can\'t find subtask'));
    }
    req.subtask = subtask;
    return next();
  });
});

// Marks a subtask as complete
router.put('/tasks/:task/subtasks/:subtask/complete', function(req, res, next) {
  req.subtask.toggleComplete(function(err, subtask) {
    if (err) {
      return next(err);
    }
    res.json(subtask);
  });
});

// Marks a subtask as complete
router.delete('/tasks/:task/subtasks/:subtask', function(req, res, next) {
  req.subtask.deleteSubtask(function(err, subtask) {
    if (err) {
      return next(err);
    }
    res.json(subtask);
  });
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
