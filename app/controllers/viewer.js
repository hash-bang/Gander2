app.controller('viewerController', function($scope, $rootScope) {
	$scope.viewerActive = false;
	$scope.viewerFile = {};

	$scope.$on('changeFile', function(e, file) {
		$scope.openFile(file);
	});
	$scope.openFile = function(file) {
		$scope.viewerFile = file;
		$scope.viewerActive = true;
		$('#iviewer')
			.iviewer({
				src: '/api/file' + $scope.viewerFile.path,
				zoom: 'fit',
				onFinishLoad: function() {
					$('#iviewer')
						.iviewer('update')
						.iviewer('fit');
				}
			});
	};

	$scope.closeFile = function() {
		$scope.viewerActive = false;
	};
});
