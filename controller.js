'use strict';
/* jshint undef: true, unused: true */
/* global angular */




/**
 * @ngdoc controller
 * @name chilecompraApp.controller:CarrerasController
 * @requires $scope
 * @requires chilecompraApp.CarrerasDataService
 *
 * @property {array} colorOptions Array with options for colorAttributes
 * @property {string} colorAttribute Selected color attribute
 * @property {array} data Array with student data for the selected career & semester
 * @property {int} n Number of students in the selected data array
 * @property {int} maxCarreras Maximum number of carreras to be displayed when filtraTopCarreras is true
 * @property {array} semestres Array with the semesters options to be chosen
 * @property {string} selectedSemestre Selected semester for data selection
 * @property {string} psuValido Flag to select only data values with a valid psu score (prom_paa>0)
 * @property {string} loading Flag to show a "loading" message when its value is true
 * @description
 *
 * Controller for Carreras explorer
 *
 */
angular.module('tideApp')
.controller('AppController', ['$scope','$http','$timeout','$interval','$modal','_','d3', 'DataService',function ($scope,$http,$timeout,$interval,$modal,_,d3, dataService) {
	var myself = this;
    this.loading = false;
    this.data = [];

    dataService.getData()
    .then(function(data) {
        myself.gruposVotaciones = data.gruposVotaciones;
        myself.diputados = data.diputados;
    })
    .catch(function(err) {
        console.log(err)
    })

    this.ShowDetails = function(d) {
        console.log(d);

        var modalInstance = $modal.open({
          animation: false,
          templateUrl: 'detalle.html',
          controller: 'ModalInstanceCtrl',
          controllerAs: 'controller',
          size: 'lg',
          resolve: {
            votos: function () {
              return d.votos;
            },

            votacion: function() {
                return d;
            }
          }
        });

        modalInstance.result.then(function (selectedItem) {
          $scope.selected = selectedItem;
        }, function () {
          console.log('Modal dismissed at: ' + new Date());
        });
    }

}]);

angular.module('tideApp')
.controller('ModalInstanceCtrl', function (_,$scope, $modalInstance, votos, votacion) {

    this.gruposVotos = _.groupBy(votos, function(d) {
        return d.partido
    });

    _.each(this.gruposVotos, function(value, key, list) {
        list[key] = _.groupBy(value, function(d) {
            return d.voto;
        })
    })

    this.votacion = votacion;

    this.partidos = [
        "Partido Comunista",
        "Partido Socialista",
        "Partido Por la Democracia",
        "Partido Demócrata Cristiano",
        "Partido Radical Social Demócrata",
        "Partido Liberal de Chile",
        "Independientes",
        "Renovación Nacional",
        "Unión Demócrata Independiente"
    ];


  $scope.ok = function () {
    $modalInstance.dismiss('cancel');
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});

