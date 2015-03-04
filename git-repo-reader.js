var app = angular.module('gitRepoReader', ['angularFileUpload'])

app.controller('GitRepoReaderCtrl', ['$scope', '$upload', function ($scope, $upload) {
  $scope.gitDirectory = false;
  $scope.baseDirectory = '';
  $scope.headFile = '';
  $scope.headFileContent = '';

  $scope.readDirectory = function () {
    if (!$scope.files) {
      return;
    }
    $scope.gitDirectory = false;
    var head = filter($scope.files, '.git/HEAD');
    if (head.length > 0) {
      $scope.gitDirectory = true;
      $scope.headFile = head[0];
      var selectedGitDirectory = $scope.headFile.webkitRelativePath;
      $scope.baseDirectory = selectedGitDirectory.substring(0, selectedGitDirectory.indexOf('.git/HEAD'));
    }
  };

  $scope.$watch('baseDirectory', function (newValue, oldValue) {
    if (newValue !== oldValue) {
      var fileReader = new FileReader();
      fileReader.onload = function (onLoadEvent) {
        $scope.$apply(function () {
          $scope.headFileContent = onLoadEvent.target.result;
        });
      };
      fileReader.readAsText($scope.headFile);
    }
  });

  $scope.$watch('headFileContent', function (newValue, oldValue) {
    if (newValue !== oldValue) {
      console.log($scope.headFileContent);
    }
  });
  function filter(dirFiles, filterCriteria) {
    return dirFiles.filter(function (dirFile) {
      return dirFile.webkitRelativePath.indexOf(filterCriteria) > -1;
    });
  }
}]);