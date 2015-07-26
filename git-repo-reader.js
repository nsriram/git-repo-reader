var REF = 'ref: ';

var app = angular.module('gitRepoReader', ['angularFileUpload'])

app.controller('GitRepoReaderCtrl', ['$scope', '$upload', function ($scope, $upload) {
  $scope.gitDirectory = false;
  $scope.baseDirectory = '';
  $scope.gitHead = '';
  $scope.headFileRef = '';
  $scope.headCommitHash = '';
  $scope.commits = [];
  $scope.readDirectory = function () {
    if (!$scope.files) {
      return;
    }
    $scope.headCommitHash = '';
    $scope.gitDirectory = false;
    $scope.commits = [];
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
        var refHead = content.replace(/^\s+|\s+$/g, '');
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
          var ref = onLoadEvent.target.result;
          $scope.headCommitHash = ref.replace(/^\s+|\s+$/g, '');
        });
      };
      fileReader.readAsText($scope.headFileRef);
    }
  });

  $scope.$watch('headCommitHash', function (newValue, oldValue) {
    if (newValue !== oldValue) {
      var objectDir = $scope.headCommitHash.substr(0, 2);
      var objectFile = $scope.headCommitHash.substr(2);
      var headObjectPath = $scope.baseDirectory + '.git/objects/' + objectDir + '/' + objectFile;
      var headObjectFile = filter(headObjectPath);
      var fileReader = new FileReader();
      fileReader.onloadend = function () {
        var inflator = new pako.Inflate();
        inflator.push(fileReader.result, true);
        if (inflator.err) {
          console.log(inflator.msg);
        }
        var output = inflator.result;
        var str = String.fromCharCode.apply(null, output);
        $scope.$apply(function () {
          $scope.commits.push(str);
          var commitDetails = str.split("\n");
          if (commitDetails !== undefined && commitDetails.length > 4) {
            if (commitDetails[1].indexOf('parent ') >= 0) {
              $scope.headCommitHash = commitDetails[1].substr(7);
            }
          }
        });
      };
      fileReader.readAsBinaryString(headObjectFile[0]);
    }
  });

  /**
   *   TODO : Need a function that will read a commit object (recursively if),
   *   and return the files.
   */

  /**
   * Filters the file passed as argument from the list of files uploaded using browse.
   * @param filterCriteria File to be filtered (relative path).
   * @returns {Array|*} Files found for the matching criteria.
   */
  function filter(filterCriteria) {
    return $scope.files.filter(function (dirFile) {
      return dirFile.webkitRelativePath.indexOf(filterCriteria) > -1;
    });
  }
}]);