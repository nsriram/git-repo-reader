var REF = 'ref: ';

var app = angular.module('gitRepoReader', ['angularFileUpload'])

app.controller('GitRepoReaderCtrl', ['$scope', '$upload', function ($scope, $upload) {
  $scope.gitDirectory = false;
  $scope.baseDirectory = '';
  $scope.gitHead = '';
  $scope.headFileRef = '';
  $scope.headCommitHash = '';

  $scope.readDirectory = function () {
    if (!$scope.files) {
      return;
    }
    $scope.gitDirectory = false;
    var head = filter('.git/HEAD');
    if (head.length > 0) {
      $scope.gitDirectory = true;
      $scope.gitHead = head[0];
      var rootDir = $scope.gitHead.webkitRelativePath;
      $scope.baseDirectory = rootDir.substring(0, rootDir.indexOf('.git/HEAD'));
    }
  };

  $scope.$watch('baseDirectory', function (newValue, oldValue) {
    if (newValue !== oldValue) {
      var fileReader = new FileReader();
      fileReader.onload = function (onLoadEvent) {
        var content = onLoadEvent.target.result;
        var contentLines = content.split('\n');
        var refHead = contentLines[0];
        var masterIndex = refHead.indexOf(REF);
        if (masterIndex > -1) {
          var master = refHead.substring(masterIndex + REF.length);
          var refHeadMaster = $scope.baseDirectory + '.git/' + master;
          var refHeadMasterFile = filter(refHeadMaster);
          $scope.$apply(function () {
            $scope.headFileRef = refHeadMasterFile[0];
          });
        }
      };
      fileReader.readAsText($scope.gitHead);
    }
  });

  $scope.$watch('headFileRef', function (newValue, oldValue) {
    if (newValue !== oldValue) {
      var fileReader = new FileReader();
      fileReader.onload = function (onLoadEvent) {
        $scope.$apply(function () {
          $scope.headCommitHash = onLoadEvent.target.result;
        });
      };
      fileReader.readAsText($scope.headFileRef);
    }
  });

  function filter(filterCriteria) {
    return $scope.files.filter(function (dirFile) {
      return dirFile.webkitRelativePath.indexOf(filterCriteria) > -1;
    });
  }
}]);