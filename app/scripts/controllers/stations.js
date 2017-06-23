'use strict';

application.controller('Ctrl_Stations', function ($rootScope, $scope, RESTFactory, Helper, $mdDialog, $q) {

	$scope.testing = false;

	var stations_all = {};

	var markers = [];

	var marker_Address;

	var heatmap_shown = false;
	var heatmap;

	var map = new google.maps.Map(document.getElementById('map_stations'), {
		zoom: 15,
		center: new google.maps.LatLng(49.488813, 8.465976),
		mapTypeId: 'roadmap'
	});

	var icons = {
		station_available: {
			icon: "images/icons/station_available.png"
		},
		station_occupied: {
			icon: "images/icons/station_occupied.png"
		}
	};

    /**
	 * Funktion um neuen Marker auf der Karte zu setzen
	 * @method AddMarker
	 * @param {} id
	 * @param {} title
	 * @param {} content
	 * @param {} image_string
	 * @param {} lat
	 * @param {} lon
	 * @return 
	 */
	function AddMarker(id, title, content, image_string, lat, lon) {

		var img = {
			url: 'images/icons/station_available.png',
			scaledSize: new google.maps.Size(60, 87),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(30, 87)
		};

		img.url = icons[image_string].icon;

		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(lat, lon),
			map: map,
			icon: img,
			optimized: false,
			id: id
		});

		marker.addListener('click', function (event) {

			new Load_Details(this.id);

			var new_alert = $mdDialog.alert({
				title: title,
				textContent: content,
				clickOutsideToClose: true,
				ok: 'OK'
			});

			$mdDialog
				.show(new_alert)
				.finally(function () {
					new_alert = undefined;
				});
		});

		markers.push(marker);
	}

    /**
	 * Funktion um Marker auf der Karte zu löschen
	 * @method Delete_Markers
	 * @return 
	 */
	function Delete_Markers() {

		for (var i = 0; i < markers.length; i++) {
			markers[i].setMap(null);
		}

		markers = [];

	}

    /**
	 * Hilfsfunktion für Update mit ID
	 * @method Update_ID
	 * @param {} id
	 * @return 
	 */
	function Update_ID(id) {
		new Update("ID", id);
	}

    /**
	 * Funktion um Daten der Stationen aus der Rest-Schnittstelle zu holen und sie anzuzeigen
	 * @method Update
	 * @param {} type
	 * @param {} value
	 * @return 
	 */
	function Update(type, value) {

		stations_all = {};
		$scope.stations = stations_all;

		$scope.station_selected = "false";
		$scope.editDisabled = "true";
		$scope.view = "info";
		new Delete_Markers();

		var prom = {};
		if (type === "ID") {
			prom = RESTFactory.Charging_Stations_Get_Charging_StationID(value);
		} else {
			prom = RESTFactory.Charging_Stations_Get();
		}

		prom.then(function (response) {
			var data = [];
			if (type === "ID") {
				data.push(response.data);
			} else {
				data = response.data;
			}
			data.forEach(function (data_use, index) {

				var station = {};
				var ID_STR = data_use.chargingStationId;

				station.stationID = data_use.chargingStationId;
				station.slots = data_use.slots;
				station.slotsOccupied = data_use.slotsOccupied;
				station.lat = data_use.latitude;
				station.lon = data_use.longitude;
				station.address = {};

				station.address.street = "Error";

				stations_all[ID_STR] = station;
				$scope.stations = stations_all;
				if ($scope.testing === false) {
					$scope.$apply();
				}

				var diff = station.slots - station.slotsOccupied;
				var title = "Ladestation " + ID_STR;
				var content = diff + " von " + station.slots + " Slots frei";

				if (diff === 0) {
					new AddMarker(ID_STR, title, content, "station_occupied", station.lat, station.lon);
				} else {
					new AddMarker(ID_STR, title, content, "station_available", station.lat, station.lon);
				}


				//GET CUSTOMER
				RESTFactory.Get_Address(station.lat, station.lon).then(function (address) {

					station.address = address;

					stations_all[ID_STR] = station;
					$scope.stations = stations_all;
					if ($scope.testing === false) {
						$scope.$apply();
					}

				});

			});

		});

	}

    /**
	 * Funktion um Details einer Ladestation aus der Rest-Schnittstelle zu holen und diese anzuzeigen
	 * @method Load_Details
	 * @param {} id
	 * @return 
	 */
	function Load_Details(id) {

		new DisabledEditMode();

		function Load_1() {
			
			RESTFactory.Charging_Stations_Get_Charging_StationID(id).then(function (response) {

				$scope.station_selected = "true";

				var data_use = response.data;

				var station = {};

				station.stationID = data_use.chargingStationId;
				station.slots = data_use.slots;
				station.slotsOccupied = data_use.slotsOccupied;
				station.lat = data_use.latitude;
				station.lon = data_use.longitude;

				$scope.currentStation = station;
				if ($scope.testing === false) {
					$scope.$apply();
				}

				map.panTo(new google.maps.LatLng(station.lat, station.lon));

				function Load_2() {

					RESTFactory.Get_Address(station.lat, station.lon).then(function (address) {

						station.address = address;

						$scope.currentStation = station;
						if ($scope.testing === false) {
							$scope.$apply();
						}

					});
				}
				
				setTimeout(Load_2, 100);

			}, function (response) {
				$scope.station_selected = "false";
				if ($scope.testing === false) {
					$scope.$apply();
				}
			});

		}

		setTimeout(Load_1, 100);



	}



    /**
	 * Funktion um Modus in dem Daten geändert werden können einzuschalten
	 * @method EnableEditMode
	 * @return 
	 */
	function EnableEditMode() {
		$scope.editDisabled = false;
	}

    /**
	 * Funktion um Modus in dem Daten geändert werden können auszuschalten
	 * @method DisabledEditMode
	 * @return 
	 */
	function DisabledEditMode() {
		$scope.editDisabled = true;
	}


    /**
	 * Funktion um geänderte Daten zu speichern
	 * @method Safe_New
	 * @return 
	 */
	function Safe_New() {

		if ($scope.new_station.hasPosition === false) {
			alert("Bitte Position auf Karte markieren");
			return;
		}

		var station = {};

		station.slots = $scope.new_station.slots;
		station.slotsOccupied = $scope.new_station.slotsOccupied;
		station.latitude = $scope.new_station.lat;
		station.longitude = $scope.new_station.lon;

		RESTFactory.Charging_Stations_Post(station).then(function (response) {
			alert("Ladestation erfolgreich hinzugefügt");
			new Hide_AddStation();
			setTimeout(Update, 1000);
		}, function (response) {
			alert("Ladestation konnte nicht hinzugefügt werden");
			new Hide_AddStation();
			setTimeout(Update, 1000);
		});

	}

    /**
	 * Funktion um abbrechen zu können
	 * @method Dismiss_New
	 * @return 
	 */
	function Dismiss_New() {

		new Hide_AddStation();

	}



    /**
	 * Funktion um Neue Ladestation hinzufügen anzuzeigen
	 * @method Show_AddStation
	 * @return 
	 */
	function Show_AddStation() {

		$scope.view = "add";

		var new_station = {};

		new_station.slots = 0;
		new_station.slotsOccupied = 0;
		new_station.lat = -190;
		new_station.lon = -190;
		new_station.address_state = "false";
		new_station.hasPosition = false;


		$scope.new_station = new_station;

        /**
		 * Funktion um Karte in Fenster Neue Ladestation hinzufügen anzuzeigen
		 * @method Init_Map
		 * @return 
		 */
		function Init_Map() {

			var input = document.getElementById('search_input');
			var searchBox = new google.maps.places.SearchBox(input);

			var map2 = new google.maps.Map(document.getElementById('map_station_new'), {
				zoom: 15,
				center: new google.maps.LatLng(49.488813, 8.465976),
				mapTypeId: 'roadmap'
			});

			map2.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

			map2.addListener('bounds_changed', function () {
				searchBox.setBounds(map2.getBounds());
			});

			searchBox.addListener('places_changed', function () {

				var places = searchBox.getPlaces();

				if (places.length === 0) {
					return;
				}

				var place = places[0].geometry.location;

				var lat = place.lat();
				var lon = place.lng();

				new PositionSelected(map2, lat, lon);

			});


			map2.addListener("click", function (event) {

				var lat = event.latLng.lat();
				var lon = event.latLng.lng();

				new PositionSelected(map2, lat, lon);

			});

		}

		setTimeout(Init_Map, 2000);

	}

    /**
		 * Funktion um Position auf der Karte für Neue Ladestation hinzufügen auswählen zu können
		 * @method PositionSelected
		 * @param {} map2
		 * @param {} lat
		 * @param {} lon
		 * @return 
		 */
	function PositionSelected(map2, lat, lon) {

		map2.panTo(new google.maps.LatLng(lat, lon));

		$scope.new_station.lat = lat;
		$scope.new_station.lon = lon;
		$scope.new_station.hasPosition = true;

		RESTFactory.Get_Address(lat, lon).then(function (address) {
			$scope.new_station.address_state = "true";
			$scope.new_station.address = address;
			if ($scope.testing === false) {
				$scope.$apply();
			}

			if (marker_Address !== undefined) {
				marker_Address.setMap(null);
			}

			marker_Address = new google.maps.Marker({
				position: new google.maps.LatLng(lat, lon),
				map: map2,
				title: "Aktuelle Position"
			});

		}, function (response) {
			$scope.new_station.address_state = "false";
		});

	}

    /**
	 * Funktion um Neue Ladestation hinzufügen zu verstecken
	 * @method Hide_AddStation
	 * @return 
	 */
	function Hide_AddStation() {
		$scope.new_station = {};
		$scope.view = "info";
		$scope.station_selected = "false";
		if ($scope.testing === false) {
			$scope.$apply();
		}
	}

    /**
	 * Funktion um Heatmap anzuzeigen
	 * @method Show_Heatmap
	 * @return 
	 */
	/*
	function Show_Heatmap() {

		for (var i = 0; i < markers.length; i++) {
			markers[i].setMap(null);
		}

		heatmap_shown = true;

		var heatmap_data = [];
		var promises = [];
		var stations = {};


		//GET ALL CHARGING STATIONS
		RESTFactory.Charging_Stations_Get().then(function (response) {

			var data = response.data;

			if (data.length === undefined || data.length < 1) {
				new Hide_Heatmap();
			} else {
				
				data.forEach(function (data_use, index) {

					var station = {};

					var ID_STR = data_use.chargingStationId;

					station.stationID = data_use.chargingStationId;
					station.lat = data_use.latitude;
					station.lon = data_use.longitude;
					station.weight = 0;

					stations[ID_STR] = station;

				});

				RESTFactory.Car_Charging_Stations_Get().then(function (response) {

					var data = response.data;

					if (data.length !== undefined && data.length > 0) {

						data.forEach(function (data_use, index) {

							var ID_STR = data_use.chargingStationId;

							stations[ID_STR].weight++;

						});

					}


					for (var key in stations) {

						var station = stations[key];

						var lat = station.lat;
						var lon = station.lon;
						var weight = station.weight;
						var heat = {};

						heat.location = new google.maps.LatLng(lat, lon);
						heat.weight = weight;

						heatmap_data.push(heat);

					}

					heatmap = new google.maps.visualization.HeatmapLayer({
						data: heatmap_data
					});

					heatmap.setMap(map);

					var gradient = [
						'rgba(0, 0, 255, 0)',
						'rgba(0, 0, 255, 1)',
						'rgba(0, 127, 255, 1)',
						'rgba(0, 127, 127, 1)',
						'rgba(0, 127, 0, 1)',
						'rgba(0, 255, 0, 1)',
						'rgba(127, 255, 0, 1)',
						'rgba(127, 127, 0, 1)',
						'rgba(127, 0, 0, 1)',
						'rgba(255, 0, 0, 1)'
					];

					heatmap.set('gradient', gradient);

					heatmap.set('radius', 50);

				}, function (response) {
					new Hide_Heatmap();
				});

			}


		}, function (response) {
			new Hide_Heatmap();
		});


	}
*/
    /**
	 * Funktion um Heatmap zu verstecken 
	 * @method Hide_Heatmap
	 * @return 
	 */
	function Hide_Heatmap() {
		for (var i = 0; i < markers.length; i++) {
			markers[i].setMap(map);
		}

		heatmap_shown = false;

		if (heatmap !== undefined) {
			heatmap.setMap(null);
		}
	}



    /**
	 * Funktion um Modus in dem Daten geändert werden können einzuschalten
	 * @method EnableEditMode
	 * @return 
	 */
	$scope.EnableEditMode = function () {
		new EnableEditMode();
	};

    /**
	 * Funktion um Details zu laden
	 * @method Load_Details
	 * @param {} id
	 * @return 
	 */
	$scope.Load_Details = function (id) {
		new Load_Details(id);
	};

    /**
	 * Funktion um zu speichern
	 * @method Safe_New
	 * @return 
	 */
	$scope.Safe_New = function () {
		new Safe_New();
	};

    /**
	 * Funktion um abbrechen zu können
	 * @method Dismiss_New
	 * @return 
	 */
	$scope.Dismiss_New = function () {
		new Dismiss_New();
	};

    /**
	 * Funktion um neue Ladestation hinzufügen anzuzeigen
	 * @method Show_AddStation
	 * @return 
	 */
	$scope.Show_AddStation = function () {
		new Show_AddStation();
	};

    /**
	 * Funktion um neue Ladestation hinzufügen zu verbergen
	 * @method Hide_AddStation
	 * @return 
	 */
	$scope.Hide_AddStation = function () {
		new Hide_AddStation();
	};

    /**
	 * Funktion um nach eingegeben im Suchfeld Wörtern zu suchen
	 * @method Enter_Search
	 * @return 
	 */
	$scope.Enter_Search = function () {

		var search = $scope.searchQuery;

		if (search === undefined || search.length === 0) {
			new Update("ALL", undefined);
		} else {
			new Update_ID(search);
		}

	};

    /**
	 * Funktion um Die Heatmap anzeigen und verbergen zu können
	 * @method ToggleHeatmap
	 * @return 
	 */
	$scope.ToggleHeatmap = function () {
		
		if (heatmap_shown === true) {
			new Hide_Heatmap();
		} else {
			new Show_Heatmap();
		}
	};


	function Show_Heatmap() {

		heatmap_shown = true;
		
		var config = {};
		config.time = {};
		config.time.start = new Date();
		config.time.end = new Date();
		config.minProc = 0;
		config.maxProc = 100;
		config.minLoadTime = 0;

		$scope.config = config;

		$scope.closeDialog = function () {
			$mdDialog.hide();
		};

		$mdDialog.show({
			clickOutsideToClose: false,
			scope: $scope,
			preserveScope: true,
			template:
			'<md-dialog class="booking-dialog">' +
			'	<md-dialog-content>' +

			'		<md-toolbar class="md-hue-2">' +
			'			<div class="md-toolbar-tools">' +
			'				<h2 class="md-flex">Visualisierung konfigurieren</h2>' +
			'			</div>' +
			'		</md-toolbar>' +

			'		<form name="formName">' +	
			'		<md-content flex layout-padding>' +
			'			<md-input-container>' +
			'				<md-checkbox ng-model="config.timeBorder" class="md-primary">Zeitlich begrenzt</md-checkbox>' +
			'			</md-input-container>' +
			'			<br/>' +
			'			<md-input-container>' +
			'				<md-checkbox ng-model="config.minBorder" class="md-primary">Prozentual begrenzt</md-checkbox>' +
			'			</md-input-container>' +
			'			<br/>' +
			'			<md-input-container>' +
			'				<md-checkbox ng-model="config.loadTimeBorder" class="md-primary">Ladezeit begrenzt</md-checkbox>' +
			'			</md-input-container>' +
			'		</md-content>' +

			'		<md-content flex layout-padding >' +
			'			<span ng-switch="config.timeBorder">' +
			'				<md-input-container ng-switch-when="true">' +
			'					<input type="date" placeholder="Startdatum" class="md-input" value="{{config.time.start}}" >' +
			'				</md-input-container>' +
			'				<md-input-container ng-switch-when="true">' +
			'					<input type="date" placeholder="Enddatum" class="md-input" value="{{config.time.end}}">' +
			'				</md-input-container>' +
			'			<span' +

			'			<span ng-switch="config.minBorder">' +
			'				<md-input-container ng-switch-when="true">' +
			'					<input type="number" placeholder="Untergrenze" class="md-input" ng-model="config.minProc">' +
			'				</md-input-container>' +
			'				<md-input-container ng-switch-when="true">' +
			'					<input type="number" placeholder="Obergrenze" class="md-input" ng-model="config.maxProc">' +
			'				</md-input-container>' +
			'			<span' +

			'			<span ng-switch="config.loadTimeBorder">' +
			'				<md-input-container ng-switch-when="true">' +
			'					<input type="number" placeholder="Untergrenze" class="md-input" ng-model="config.minLoadTime">' +
			'				</md-input-container>' +
			'			<span' +

			'		</md-content>' +
			
			'		<md-content flex layout-padding>' +
			'			<md-button class="md-raised md-primary button-to-right" ng-click="Apply()" > Anwenden </md-button>' +
			'			<md-button class="md-raised md-hue-1 button-to-right" ng-click="closeDialog()" > Verwerfen </md-button>' +
			'		</md-content>' +
			'		</form>' +

			'	</md-dialog-content>' +
			'</md-dialog>',

			controller: function DialogController($scope, $mdDialog, RESTFactory, Helper) {

				$scope.Apply = function () {

					for (var i = 0; i < markers.length; i++) {
						markers[i].setMap(null);
					}

					var stations = {};
					var char_stations = {};
					var heatmap_data = [];

					new Load_Stations();
					
					var config;

					function Load_Stations() {

						config = $scope.config;
						
						RESTFactory.Charging_Stations_Get().then(function (response) {
							
							var data = response.data;

							data.forEach(function (data_use, index) {
								
								var station = {};

								var stationID = data_use.chargingStationId;
								station.stationID = stationID;
								station.lat = data_use.latitude;
								station.lon = data_use.longitude;
								station.weight = 0;

								stations[stationID] = station;
								
							});

							new Load_Extras();

						}, function (response) {

						});					

					}

					function Load_Extras() {

						RESTFactory.Car_Charging_Stations_Get().then(function (response) {
							
							var data = response.data;

							data.forEach(function (data_use, index) {
								
								var char_station = {};
								char_station.active = true;
								char_station.start = Helper.Get_Zeit_Server(data_use.chargeStart);
								char_station.end = Helper.Get_Zeit_Server(data_use.chargeEnd);
								char_station.chargingStationID = data_use.chargingStationId;
								char_station.carID = data_use.carId;
								char_station.carChargingStationID = data_use.carChargingStationId;
								char_station.loadTime = (char_station.end.value - char_station.start.value);
								
								if (config.loadTimeBorder === true) {
									if (char_station.end.state === true && char_station.start.state === true) {
										char_stations[char_station.carChargingStationID] = char_station;
									}
								} else {
									char_stations[char_station.carChargingStationID] = char_station;
								}


							});

							new ApplyFilters();

						}, function (response) {
							
						});

					}

					function ApplyFilters() {

						if (config.timeBorder === true) {

							var startTimest = new Date(config.time.start);
							startTimest.setHours(0);
							startTimest.setMinutes(0);
							startTimest.setSeconds(0);
							startTimest.setMilliseconds(0);
							var endTimest = new Date(config.time.end);
							endTimest.setHours(23);
							endTimest.setMinutes(59);
							endTimest.setMilliseconds(999);
							endTimest.setSeconds(59);

							startTimest = startTimest.getTime();
							endTimest = endTimest.getTime();

							for (var char_stationID in char_stations) {
									
								if (char_stations[char_stationID].start.value >= startTimest && char_stations[char_stationID].end.value <= endTimest) {
									char_stations[char_stationID].active = true;
								} else {
									char_stations[char_stationID].active = false;
								}

							}

						}

						if (config.loadTimeBorder === true) {

							var minLen = config.minLoadTime;

							if (minLen < 0) {
								minLen = 0;
							} else if (minLen > 100) {
								minLen = 100;
							}
							
							for (var char_stationID in char_stations) {

								//console.log(char_stations[char_stationID].loadTime);

								if (char_stations[char_stationID].loadTime >= minLen) {
									char_stations[char_stationID].active = true;
								} else {
									char_stations[char_stationID].active = false;
								}

							}						

						}

						new Draw();

					}

					function Draw() {

						for (var char_stationID in char_stations) {

							for (var stationID in stations) {
								
								if (stations[stationID].stationID === char_stations[char_stationID].chargingStationID) {
									if (char_stations[char_stationID].active === true) {
										stations[stationID].weight++;
									}
								}

							}

						}

						var maxHeat = 0;
						var totalHeat = 0;

						var prep_data = [];

						for (var key in stations) {

							var station = stations[key];

							var lat = station.lat;
							var lon = station.lon;
							var weight = station.weight;
							var heat = {};

							if (weight > maxHeat) {
								maxHeat = weight;
							}

							totalHeat += weight;

							heat.location = new google.maps.LatLng(lat, lon);
							heat.weight = weight;

							prep_data.push(heat);

						}

						if (config.minBorder === true) {

							var minProc = config.minProc;
							var maxProc = config.maxProc;

							if (minProc < 0) {
								minProc = 0;
							} else if (minProc > 100) {
								minProc = 100;
							}
							
							if (maxProc < minProc) {
								maxProc = minProc + 1;
							}

							if (maxProc < 0) {
								maxProc = 0;
							} else if (maxProc > 100) {
								maxProc = 100;
							}

							for (var i = prep_data.length - 1; i >= 0; i--) {
								
								if (prep_data[i].weight >= totalHeat / 100 * minProc && prep_data[i].weight <= totalHeat / 100 * maxProc) {
									prep_data[i].weight = prep_data[i].weight - totalHeat / 100 * minProc + 1;
									heatmap_data.push(prep_data[i]);
								}

							}

						} else {

							for (var i = prep_data.length - 1; i >= 0; i--) {
								heatmap_data.push(prep_data[i]);
							}							

						}

						heatmap = new google.maps.visualization.HeatmapLayer({
							data: heatmap_data
						});

						heatmap.setMap(map);

						var gradient = [
							'rgba(0, 0, 255, 0)'
						];

						var g = 0;
						var r = 0;
						var b = 255;

						var step = 25;

						for (var i = 0; i < 510; i+=step) {
							
							var rgba = "rgba(" + r + "," + g + "," + b + ",1)";
							gradient.push(rgba);

							if (i > 127 && i < 382) {
								if (i < 255) {
									g += step;
								} else {
									if (i > 0) {
										g -= step;
										if (g < 0) {
											g = 0;
										}
									}
								}
							}

							if (i < 255) {
								b -= step;
								if (b < 0) {
									b = 0;
								}
							}
							
							if (i > 255) {
								r+=step;
							}

						}


						heatmap.set('gradient', gradient);

						heatmap.set('radius', 50);


						$scope.closeDialog();

					}
				}

			}

		});



	}	


    /**
	 * Initfunktion der Seite Stations
     * Initialisiert die karte mit Ihren Steuerungselementen
	 * @method Init
	 * @return 
	 */
	function Init() {

		var input = document.getElementById('toggle_heatmap');
		map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
		new Update("ALL", undefined);

	}

	new Init();

});
