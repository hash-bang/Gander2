app.controller('viewerController', function($scope, $rootScope) {
	$scope.ignoreNextClick = false;
	$scope.viewerActive = false;
	$scope.viewerFile = {};
	$scope.wheelMode = 'files'; // What to do when mouse-wheeling - ENUM: files, zoom

	$scope.$on('changeFocus', function(e, file, method) {
		$scope.openFile(file, method);
	});

	$scope.$on('changeWheelMode', function(e) {
		$scope.wheelMode = $scope.wheelMode == 'files' ? 'zoom' : 'files';
		console.log('WHEELMODE', $scope.wheelMode);
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
					src: $scope.config.viewerSrcPrefix + $scope.viewerFile.path,
					ui_disabled: false,
					zoom: 'fit',
					onFinishLoad: function() {
						$('#iviewer')
							.iviewer('update')
							.iviewer('fit');
					},
					onStopDrag: function() {
						ngApply('viewerController', function($scope) {
							$scope.ignoreNextClick = true; // So we dont also fire the click-closer
						});
					},
					onClick: function() {
						ngApply('viewerController', function($scope) {
							if ($scope.ignoreNextClick) {
								$scope.ignoreNextClick = false;
							} else {
								$scope.closeFile();
							}
						});
					}
				})
				.on('mousewheel', function(e) {
					if ($scope.wheelMode == 'files')
						ngBroadcast('changeActive', e.deltaY < 0 ? 'next' : 'previous');
				});
		}
	};

	$scope.closeFile = function() {
		$scope.viewerActive = false;
	};
});
