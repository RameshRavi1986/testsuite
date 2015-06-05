'use strict';

describe('rm.version module', function() {
  beforeEach(module('rm.version'));

  describe('version service', function() {
    it('should return current version', inject(function(version) {
      expect(version).toEqual('0.1');
    }));
  });
});
