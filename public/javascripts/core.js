var app = angular.module('plannitTodo', ['ui.router', 'flock.bootstrap.material', 'ui.sortable']);

// Create an array of tasks
app.factory('tasks', ['$http', function($http) {
  var o = {
    tasks: []
  };

  o.getAll = function() {
    return $http.get('/tasks').success(function(data) {
      angular.copy(data, o.tasks);
    });
  };

  o.create = function(task) {
    return $http.post('/tasks', task).success(function(data) {
      o.tasks.push(data);
    });
  };

  o.complete = function(task) {
    return $http.put('/tasks/' + task._id + '/complete')
      .success(function(data) {
        task.complete = (task.complete ? false : true);
      });
  };

  o.delete = function(task) {
    return $http.delete('/tasks/' + task._id);
  };

  o.deleteSubtask = function(task, subtask) {
    console.log(subtask)
    return $http.delete('/tasks/' + task._id + '/subtasks/' + subtask._id);
  };

  o.get = function(id) {
    return $http.get('/tasks/' + id).then(function(res) {
      return res.data;
    });
  };

  o.addSubtask = function(id, subtask) {
    return $http.post('/tasks/' + id + '/subtasks', subtask);
  };

  o.completeSubtask = function(task, subtask) {
    return $http.put('/tasks/' + task._id + '/subtasks/'+ subtask._id + '/complete')
      .success(function(data) {
        subtask.complete = (subtask.complete ? false : true);
      });
  };

  return o;
}])

// Main controller for the app
app.controller('MainController', [
  '$scope',
  '$state',
  'tasks',
  function($scope, $state, tasks) {
    $scope.tasks = tasks.tasks;
    $scope.$state = $state;

    $scope.addTask = function() {
      // Check if it's empty
      if(!$scope.title || $scope.title === '') { return; }
      if(!$scope.description || $scope.description === '') { return; }
      // Add the task
      tasks.create({
        title: $scope.title,
        description: $scope.description,
        complete: false,
        viewSubtasks: false
      });
      // Clear forms
      $scope.title = '';
      $scope.description = '';
    };

    $scope.toggleComplete = function(task) {
      tasks.complete(task);
    };

    $scope.deleteTask = function(task, index) {
      tasks.delete(task);
      $scope.tasks.splice(index, 1);
    };

    $scope.toggleSubtasks = function(task) {
      task.viewSubtasks = !task.viewSubtasks;
      // To reset the visibility clause
      angular.forEach($scope.tasks, function(t) {
        if (!(t === task)) {
          t.viewSubtasks = false;
        }
      });
    }
  }
]);

app.controller('TasksController', [
  '$scope',
  'tasks',
  'task',
  function($scope, tasks, task) {
    $scope.task = task;

    $scope.addSubtask = function(){
      if($scope.title === '') { return; }
      tasks.addSubtask(task._id, {
        title: $scope.title,
        priority: $scope.priority,
        complete: false
      }).then(function(subtask) {
        console.log(subtask.priority)
        $scope.task.subtasks.push(subtask.data);
      });
      $scope.title = '';
    };

    $scope.toggleComplete = function(subtask) {
      tasks.completeSubtask(task, subtask);
    };

    $scope.removeSubtask = function(task, subtask, index) {
      tasks.deleteSubtask(task, subtask);
      $scope.task.subtasks.splice(index, 1);
    }
  }
]);

app.config([
  '$stateProvider',
  '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {

    $stateProvider
      .state('home', {
        url: '/home',
        templateUrl: 'templates/home.html',
        controller: 'MainController',
        resolve: {
          taskPromise: ['tasks', function(tasks) {
            return tasks.getAll();
          }]
        }
      })

      .state('home.subtasks', {
        url: '/tasks{id}',
        templateUrl: 'templates/subtasks.html',
        controller: 'TasksController',
        resolve: {
          task: ['$stateParams', 'tasks', function($stateParams, tasks) {
            return tasks.get($stateParams.id);
          }]
        }
      })

      .state('tasks', {
        url: '/tasks/{id}',
        templateUrl: 'templates/tasks.html',
        controller: 'TasksController',
        resolve: {
          task: ['$stateParams', 'tasks', function($stateParams, tasks) {
            return tasks.get($stateParams.id);
          }]
        }
      });

    $urlRouterProvider.otherwise('home');
  }
]);
