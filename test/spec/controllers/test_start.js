
describe('Testsuite: Startpage admin', function () {

	var MainCtrl;
	var scope;
	var q;
	var deferred;

	var RESTFactory;
	var Helper;
	var mdDialog;

	beforeEach(module('adminApp'));
	beforeEach(module('ngAnimate'));
	beforeEach(module('ngRoute'));
	beforeEach(module('ngCookies'));

	beforeEach(function () {
		RESTFactory = {
			User_Login: function (email, pwd) {
				deferred = q.defer();
				return deferred.promise;
			},
			User_Register: function (data) {
				deferred = q.defer();
				return deferred.promise;
			}
		};
		mdDialog = {
			show: function () {

			},
			hide: function () {

			}
		}

	});

	describe('Login Testsuite', function () {

		var login_response;


		beforeEach(inject(function ($controller, $rootScope, $q) {
			q = $q;
			scope = $rootScope.$new();
			MainCtrl = $controller('Ctrl_Login', {
				$scope: scope,
				RESTFactory: RESTFactory,
				$mdDialog: mdDialog
			});

			//RESPONSE STUFF			
			login_response = { 'data': { 'token': '1234567890', 'id': 1 } };

			//SCOPE STUFF
			scope.testing = true;
			scope.login_email = "admin@ecruise.me";
			scope.login_password = 'ecruiseAdmin123!!!';

		}));


		it('Check if Login in RESTFactory was called', function () {

			spyOn(RESTFactory, 'User_Login').and.callThrough();

			scope.Login();

			expect(RESTFactory.User_Login).toHaveBeenCalled();

		});

		it('Check if loggedIN is set to true', function () {

			scope.Login();

			deferred.resolve(login_response);
			scope.$root.$digest();

			expect(scope.loggedIN).toBe(true);

		});

		it('Check if customerID is set to 1', function () {

			scope.Login();

			deferred.resolve(login_response);
			scope.$root.$digest();

			expect(parseInt(scope.customerID)).toBe(1);

		});

		it('Check if token ist set to 1234567890', function () {

			scope.Login();

			deferred.resolve(login_response);
			scope.$root.$digest();

			expect(scope.token).toBe('1234567890');

		});

		it('Close mdDialog called', function () {

			spyOn(scope, 'closeDialog').and.callThrough();

			scope.Login();

			expect(scope.closeDialog).toHaveBeenCalled();

		});


		it('Check if password is cleared', function () {

			scope.Login();

			deferred.reject({});
			scope.$root.$digest();

			expect(scope.login_password).toBe("");

		});

	});


	describe('Main Testsuite', function () {

		beforeEach(inject(function ($controller, $rootScope, $q) {

			q = $q;
			scope = $rootScope.$new();
			MainCtrl = $controller('Ctrl_Main', {
				$scope: scope,
				$mdDialog: mdDialog
			});

		}));

		afterEach(function () {
			scope.Logout();
		})

		it('Check if loggedIN is set true after previous tests, where the login was set true', function () {

			expect(scope.loggedIN).toBe(true);

		});

		it('Check if Login clears values', function () {

			scope.Logout();

			expect(scope.loggedIN).toBe(false);

		});

		it('Check if $mdDialog.show is called when showLogin is called', function () {

			spyOn(mdDialog, 'show').and.callThrough();

			scope.showLogin();

			expect(mdDialog.show).toHaveBeenCalled();

		});

	});

});
