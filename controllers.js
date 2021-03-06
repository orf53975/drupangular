// Create a controller, inject scope and http
// Also inject the GetTasks service (see services.js)
app.controller('TaskList', ['$scope', '$http', 'TaskService', '$location', 'TestService', '$timeout',
    function($scope, $http, TaskService, $location, TestService, $timeout){

    // Call the GetTasks service and the tasks method
    // Then pass the data form this to the scope
    // Addition: created a poller which uses the timeout service to query the feed every 5 seconds
    // Upon querying, it just updates the task list.
    
    //var count = 0;
    var poller = function() {
        $timeout(poller, 5000);
        //count++;
        //count = count;
        //console.log(count);
        TaskService.getTasks(function(data){
            $scope.tasks = data;
        });
    }
    poller();

    // When the newTask form element is submitted, fire this function
    $scope.newTask = function(){

        // Get our data from the form
        var package = {
            'title': { 'value': $scope.title },
            'body': { 'value': $scope.body },
            '_links': { 'type': { 'href': 'http://taskapp:8888/drupal/rest/type/node/task' }}
        }

        // Call the TaskService object with the addTask method
        TaskService.addTask(package)
        .success(function(){
            console.log("Added");

            // Clear the inputs
            $scope.title = '';
            $scope.body = '';

            // Re-call the list of tasks so that it updates
            TaskService.getTasks(function(data){
                $scope.tasks = data;
            });
        })
    }

    $scope.deleteTask = function(id){

        TaskService.deleteTask(id)
        .success(function(){
            TaskService.getTasks(function(data){
                $scope.tasks = data;
            });
            // Redirect to the task list
            $location.path('/');
        })
    }

}]);


// Create a controller to handle viewing the task
// Pass in $routeParams which enables us to get the ID passed
// This is definedby the $routeProvider in app config
app.controller('SingleTask', ['$scope', '$http', '$routeParams', 'TaskService', 
    function($scope, $http, $routeParams, TaskService){

    $http.get('http://taskapp:8888/drupal/tasks/' + $routeParams.id)
    .success(function(data){
        $scope.task = data[0];
    });

    // When update status is clicked, fire this function and pass through the status
    $scope.updateStatus = function(status){
        // Change the status of the task
        // Check if status is true (1). If it is, change to to 0, if it isn't change it to 1
        // http://stackoverflow.com/a/18269305/874691
        status = (status == 1) ? 0 : 1;

        var package = {
            'field_status': { 'value': status },
            '_links': { 'type': { 'href': 'http://taskapp:8888/drupal/rest/type/node/task' }}
        }

        TaskService.updateTaskStatus($routeParams.id, package)
        .success(function(data){
            // Update the status field in the view
            $scope.task.field_status = status;
        });
    }

    $scope.updateRating = function(rating){
        var package = {
            'field_rating': { 'value': rating },
            '_links': { 'type': { 'href': 'http://taskapp:8888/drupal/rest/type/node/task' }}
        }

        TaskService.updateTaskRating($routeParams.id, package)
        .success(function(data){

            $scope.task.field_rating = rating;
        });
    }
}]);







/****


User login actually works, but the app doesn't know about it.
Some how I need to make the browser know that the user has logged in.
If you goto /drupal you'll see user is logged in, but user cannot post a new task
Cannot figure this out.

// Set up controller to handle user login
// Pass in $httpParamSerializer dependency to modify the data string to pass in correct format
app.controller('LoginForm', function($scope, $http, $httpParamSerializer){

    // Set up an object, pass a default field
    // In this case form_id = user_login_form is required by Drupal
    $scope.user = {'form_id':'user_login_form'};

    // When the user clicks login, fire this function
    $scope.userLogin = function(){

        var login_details = $scope.user.name + ":" + $scope.user.pass;
        var auth = btoa(login_details);

        $http({
            method: 'POST',
            url: 'http://taskapp:8888/drupal/user/login', // this is technically the api login endpoint (it gets suffixed with the string that is serialized below)
            data: $httpParamSerializer($scope.user), // as stated above, convert the data to the correct format. drupal login form calls itself, so we're just passing this string to the form page
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        })
        .success(function(data, status, headers, config){
            console.log(auth);
        });
    }
})*****/