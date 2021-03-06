describe('Fetch', function() {
    function scriptIsPresent(url) {
        var scripts = Array.prototype.slice.call(document.scripts);
        for (var i = 0; i < scripts.length; i++) {
            if (url.indexOf(scripts[i].src) >= 0)
                return true;
        }

        return false;
    }

  function stylesheetIsPresent(url) {
    var stylesheets = Array.prototype.slice.call(document.styleSheets);
    for (var i = 0; i < stylesheets.length; i++) {
      if (stylesheets[i].href.indexOf(url) >= 0)
        return true;
    }

    return false;
  }

  afterEach(function () {
    nautilus.resetConfig();
  });

    describe('asynchronous queue load', function() {
        context('testing one asynchronous request', function() {
            it('should execute callback on success and the scripts on head end', function(done) {
                expect(window.dep0).to.be.equal(undefined);
                nautilus('fixtures/dep0.js', function() {
                    expect(window.dep0).to.be.equal("dep0");
                    done();
                });
            });
        });
        context('testing three asynchronous requests', function() {
            it('should execute callback on success and have 3 scripts on head end', function(done) {
                nautilus.config({
                    paths: {
                        'dep1': 'fixtures/dep1.js',
                        'dep2': 'fixtures/dep2.js',
                    }
                });

                expect(window.dep1).to.be.equal(undefined);
                expect(window.dep2).to.be.equal(undefined);
                expect(window.dep3).to.be.equal(undefined);
                nautilus(['dep1', 'dep2', 'fixtures/dep3.js'], function() {
                    expect(window.dep1).to.be.equal("dep1");
                    expect(window.dep2).to.be.equal("dep2");
                    expect(window.dep3).to.be.equal("dep3");
                    expect(scriptIsPresent('fixtures/dep1.js')).to.be.equal(true);
                    expect(scriptIsPresent('fixtures/dep2.js')).to.be.equal(true);
                    expect(scriptIsPresent('fixtures/dep3.js')).to.be.equal(true);
                    done();
                });
            });
        });
    });
    describe('synchronous queue load', function() {
        context('testing one synchronous request in order', function() {
            it('should execute callback on success and the scripts on head end', function(done) {
                window.dep0 = undefined;
                window.dep1 = undefined;
                expect(window.dep0).to.be.equal(undefined);
                nautilus(['fixtures/dep0.js'], ['fixtures/subdep0.js'], function() {
                    expect(window.dep0).to.be.equal("dep0");
                    expect(window.subdep0).to.be.equal("dep0");
                    done();
                });
            });
        });
    });

  describe('origins config parameter', function () {
    context('test each origin for relative URLs', function () {
      it('should try to load relative URLs using each origin', function (done) {
        nautilus.config({
          paths: {
            'dep0': '/dep0.js',
            'dep1': '/dep1.js',
          },
          origins: [
            'fail',
            'fixtures'
          ]
        });
        window.dep0 = undefined;
        window.dep1 = undefined;
        nautilus(['dep0'], ['dep1'], function () {
          expect(window.dep0).to.be.equal("dep0");
          expect(window.dep1).to.be.equal("dep1");
          expect(scriptIsPresent('fixtures/dep0.js')).to.be.equal(true);
          expect(scriptIsPresent('fixtures/dep1.js')).to.be.equal(true);
          done();
        });
      });
    });
  });

  describe('multiple URLs for same script', function() {
    context('try to load with fallbacks', function() {
      it('should load script in last try', function(done) {
        window.dep0 = undefined;
        nautilus.config({
          paths: {
            dep0: [
              'nope/dep0.js',
              'not/here/dep0.js',
              'fixtures/dep0.js',
            ],
          },
        });
        nautilus(['dep0'], function() {
          expect(window.dep0).to.be.equal("dep0");
          expect(scriptIsPresent('fixtures/dep0.js')).to.be.equal(true);
          done();
        });
      });
    });
  });

  describe('multiple URLs for same script and origins', function() {
    context('try to load with fallbacks', function() {
      it('should load script in last try', function(done) {
        window.dep0 = undefined;
        nautilus.config({
          origins: ['randomplace', 'fixtures'],
          paths: {
            dep0: [
              '/nope/dep0.js',
              '/not/here/dep0.js',
              '/dep0.js',
            ],
          }
        });
        nautilus(['dep0'], function() {
          expect(window.dep0).to.be.equal("dep0");
          expect(scriptIsPresent('fixtures/dep0.js')).to.be.equal(true);
          done();
        });
      });
    });
  });

  describe('stylesheets', function() {
    context('try to load CSS', function() {
      it('should load CSS', function(done) {
        nautilus(['fixtures/style0.css'], function() {
          expect(window.getComputedStyle(document.body).content).to.be.equal('style0');
          expect(stylesheetIsPresent('fixtures/style0.css')).to.be.equal(true);
          done();
        });
      });
    });
  });
});
