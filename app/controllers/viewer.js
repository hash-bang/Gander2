app.controller('viewerController', function($scope, $rootScope) {
	$scope.viewerActive = false;
	$scope.viewerFile = {};
	$scope.mode = 'files';

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
				},
				onZoom: function() {
					if ($scope.mode == 'files')
						return false;
				}
			})
			.on('mousewheel', function(e) {
				if ($scope.mode == 'files') {
					console.log('PREVENT');
					console.log('WHEEL', e);
				}
			});
	};

	$scope.closeFile = function() {
		$scope.viewerActive = false;
	};
});
