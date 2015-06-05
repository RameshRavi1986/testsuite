'use strict';

angular.module('rm.version', [
  'rm.version.interpolate-filter',
  'rm.version.version-directive'
])

.value('version', '0.1');
