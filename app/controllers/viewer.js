app.controller('viewerController', function($scope, $rootScope) {
	$scope.viewerActive = false;
	$scope.viewerFile = {};
	$scope.mode = 'files';

	$scope.$on('changeFocus', function(e, file, method) {
		$scope.openFile(file, method);
	});

	/**
	* Set the focus of the viewer
	* @param object file The file object to display
	* @param string method The method to employ, ENUM: 'toggle', 'set'(to only set if already open), true(to force open), false(to force closed)
	*/
	$scope.openFile = function(file, method) {
		if (_.isObject(file))
			$scope.viewerFile = file;

		if (!method || method == 'toggle') {
			method = 'toggle';
			$scope.viewerActive = !$scope.viewerActive;
		} else if (method == 'set') {
			if (!$scope.viewerActive)
				return;
		} else {
			$scope.viewerActive = method;
		}

		if (!$scope.viewerFile || !$scope.viewerFile.path)
			return;

		if ($('#iviewer').hasClass('iviewer_cursor')) {
			$('#iviewer')
				.iviewer('loadImage', '/api/file' + $scope.viewerFile.path);
		} else {
			$('#iviewer')
				.iviewer({
					src: '/api/file' + $scope.viewerFile.path,
					zoom: 'fit',
					onFinishLoad: function() {
						$('#iviewer')
							.iviewer('update')
							.iviewer('fit');
					},
					onZoom: function(e) {
						if ($scope.mode == 'files')
							return false;
					}
				})
				.on('mousewheel', function(e) {
					if ($scope.mode == 'files') {
						$rootScope.$apply(function() {
							$rootScope.$broadcast('changeActive', e.deltaY < 0 ? 'next' : 'previous');
						});
					}
				});
		}
	};

	$scope.closeFile = function() {
		$scope.viewerActive = false;
	};
});
