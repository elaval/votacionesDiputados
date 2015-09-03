'use strict';
/* jshint undef: true, unused: true */
/* global angular */

/**
 * @ngdoc service
 * @name simceApp.MyDataService
 * @requires $q
 * @requires d3
 * @requires _
 * @requires $http
 *
 * @description
 * Demo
 *
 */
angular.module('tideApp')
.service('DataService',[ '$rootScope','$q', 'd3', '_', '$http',function( $rootScope, $q, d3,_, $http) {
  var myself = this;
  var dataDiputadosUrl = "./data/diputados.json";
  var dataVotosUrl = "./data/votos.json";

  var totalPorPartido = {
    "Partido Comunista": 6,
    "Partido Socialista":16,
    "Partido Por la Democracia":15,
    "Partido Demócrata Cristiano":21,
    "Partido Radical Social Demócrata":6,
    "Independientes":11,
    "Renovación Nacional":15,
    "Unión Demócrata Independiente":29,
    "Partido Liberal de Chile":1,
    "Alianza":44,
    "NuevaMayoria":64
  }

  var data;

  this.getData = function() {
    // deferred - use of promises to deal with async results
    var deferred = $q.defer();

    if (data) {
      deferred.resolve(data)
    } else {
      $q.all([$http.get(dataVotosUrl), $http.get(dataDiputadosUrl)])
      .then(function(res) {
        var dataVotos = res[0].data;
        var dataDiputados = res[1].data;

        var indexDiputados = [];
        _.each(dataDiputados, function(d) {
          indexDiputados[d.index] = d;
        })

        var grouposPorPartido = _.groupBy(dataDiputados, function(d) {
          return d.group;
        })

        _.each(grouposPorPartido, function(d) {
          d = _.sortBy(d, function(e) {return e.id})
        })

        // Ordena votos de acuerdo a grupos de partidos
        _.each(dataVotos, function(d,count) {
          var votos = d.votos;

          var newVotos = [];

          _.each(grouposPorPartido, function(group,i) {
            _.each(group, function(diputado,j){

              var diputadoClone = _.clone(diputado);

              diputadoClone.voto = votos[diputado.index];
              newVotos.push(diputadoClone);
            })
          })
          d.votos = newVotos;

          // Totalizadores de votos
          d.votoFavor = {};
          d.votoContra = {};
          d.votoAbstencion = {};
          d.votoPareo = {};
          d.votoOtro = {};

          // Inicia totalizadores en cero
          d.votoFavor["total"] = 0;
          d.votoFavor["Renovación Nacional"] = 0;
          d.votoFavor["Unión Demócrata Independiente"] = 0;
          d.votoFavor["Partido Comunista"] = 0;
          d.votoFavor["Partido Socialista"] = 0;
          d.votoFavor["Partido Por la Democracia"] = 0;
          d.votoFavor["Partido Demócrata Cristiano"] = 0;
          d.votoFavor["Partido Radical Social Demócrata"] = 0;


          d.votoContra["total"] = 0;
          d.votoContra["Renovación Nacional"] = 0;
          d.votoContra["Unión Demócrata Independiente"] = 0;
          d.votoContra["Partido Comunista"] = 0;
          d.votoContra["Partido Socialista"] = 0;
          d.votoContra["Partido Por la Democracia"] = 0;
          d.votoContra["Partido Demócrata Cristiano"] = 0;
          d.votoContra["Partido Radical Social Demócrata"] = 0;

          // Actualiza totalizadores de acuerdo al valor del voto
          _.each(newVotos, function(v,i) {
            if (v.voto == "F") {
              d.favor++;
              d.votoFavor["total"] = d.votoFavor["total"] ? d.votoFavor["total"]+1 : 1;
              d.votoFavor[v.partido] = d.votoFavor[v.partido] ? d.votoFavor[v.partido]+1 : 1;
            }
            else if (v.voto == "C") {
              d.contra++;
              d.votoContra["total"] = d.votoContra["total"] ? d.votoContra["total"]+1 : 1;
              d.votoContra[v.partido] = d.votoContra[v.partido] ? d.votoContra[v.partido]+1 : 1;
            } 
            else if (v.voto == "A") {
              d.abstencion++;
              d.votoAbstencion["total"] = d.votoAbstencion["total"] ? d.votoAbstencion["total"]+1 : 1;
              d.votoAbstencion[v.partido] = d.votoAbstencion[v.partido] ? d.votoAbstencion[v.partido]+1 : 1;
            }  
            else if (v.voto == "P") {
              d.pareo++;
              d.votoPareo["total"] = d.votoPareo["total"] ? d.votoPareo["total"]+1 : 1;
              d.votoPareo[v.partido] = d.votoPareo[v.partido] ? d.votoPareo[v.partido]+1 : 1;
            }  
            else {
              d.otro++;
              d.votoOtro["total"] = d.votoOtro["total"] ? d.votoOtro["total"]+1 : 1;
              d.votoOtro[v.partido] = d.votoOtro[v.partido] ? d.votoOtro[v.partido]+1 : 1;
            } 
          })


          d.votoFavor["Alianza"] = d.votoFavor["Renovación Nacional"] + d.votoFavor["Unión Demócrata Independiente"];
          d.votoFavor["NuevaMayoria"] = d.votoFavor["Partido Comunista"] + d.votoFavor["Partido Socialista"] + d.votoFavor["Partido Por la Democracia"] + d.votoFavor["Partido Demócrata Cristiano"] + d.votoFavor["Partido Radical Social Demócrata"];
          d.votoContra["Alianza"] = d.votoContra["Renovación Nacional"] + d.votoContra["Unión Demócrata Independiente"];
          d.votoContra["NuevaMayoria"] = d.votoContra["Partido Comunista"] + d.votoContra["Partido Socialista"] + d.votoContra["Partido Por la Democracia"] + d.votoContra["Partido Demócrata Cristiano"] + d.votoContra["Partido Radical Social Demócrata"];

          d.indiceParticipacion = (d.votoFavor["total"] + d.votoContra["total"])/120;
          d.indiceConsenso = (d.votoFavor["Alianza"]/totalPorPartido["Alianza"])*(d.votoFavor["NuevaMayoria"]/totalPorPartido["NuevaMayoria"])+(d.votoContra["Alianza"]/totalPorPartido["Alianza"])*(d.votoContra["NuevaMayoria"]/totalPorPartido["NuevaMayoria"]);
          d.totalPorPartido = totalPorPartido;
        })

        dataVotos = _.sortBy(dataVotos, function(d) {
          return d.indiceConsenso;
        })

        var grupos = _.groupBy(dataVotos, function(d) {
          var grupo;

          if (d.resultado == "Aprobado") {
            if (d.votoFavor["Alianza"]/totalPorPartido["Alianza"] > 0.25 && d.votoContra["Alianza"]/totalPorPartido["Alianza"] > 0.25) {
              grupo = "aprobado_division_alianza"
            } else if (d.votoFavor["NuevaMayoria"]/totalPorPartido["NuevaMayoria"] > 0.25 && d.votoContra["NuevaMayoria"]/totalPorPartido["NuevaMayoria"] > 0.25) {
              grupo = "aprobado_division_nm"
            } else if (d.votoFavor["Alianza"]/totalPorPartido["Alianza"] > 0.5 && d.votoFavor["NuevaMayoria"]/totalPorPartido["NuevaMayoria"] > 0.5) {
              grupo = "aprobado_transversal"
            } else {
              grupo = "aprobado_division"
            }
          } else {
            if (d.votoFavor["Alianza"]/totalPorPartido["Alianza"] > 0.25 && d.votoContra["Alianza"]/totalPorPartido["Alianza"] > 0.25) {
              grupo = "rechazado_division_alianza"
            } else if (d.votoFavor["NuevaMayoria"]/totalPorPartido["NuevaMayoria"] > 0.25 && d.votoContra["NuevaMayoria"]/totalPorPartido["NuevaMayoria"] > 0.25) {
              grupo = "rechazado_division_nm"
            } else if (d.votoContra["Alianza"]/totalPorPartido["Alianza"] > 0.5 && d.votoContra["NuevaMayoria"]/totalPorPartido["NuevaMayoria"] > 0.5) {
              grupo = "rechazado_transversal"
            } else {
              grupo = "rechazado_division"
            }
          }

          return grupo;
        })

        data = {gruposVotaciones:grupos, diputados:indexDiputados};

        deferred.resolve(data);
      })
      .catch(function(err) {
        deferred.reject(err)
      })
    }

    return deferred.promise;
  }


  this.filter = function(text) {
    // deferred - use of promises to deal with async results
    var deferred = $q.defer();

    myself.getData()
    .then(function(data) {

      var newData = {
        gruposVotaciones : {},
        diputados : data.diputados
      }
      
      _.each(data.gruposVotaciones, function(grupo,key) {
        var filteredGroup = _.filter(grupo, function(d) {

          return text ? (d.materia ? d.materia.toLowerCase().indexOf(text.toLowerCase()) >= 0 : false) : true;
        })
        newData.gruposVotaciones[key] = filteredGroup;
      })


      deferred.resolve(newData)
    })
 
    return deferred.promise;
  }

  // Gets posible values for 'Series Code' attribute
  this.categories = function() {
    // deferred - use of promises to deal with async results
    var deferred = $q.defer();

    myself.getData()
    .then(function(data) {
      // Filter data according to filter options (Ex {'Series Code':'SE.PRM.ENRR.FE'})
      var groups = _.groupBy(data, function(d) {
        return d['Series Code'];
      })

      deferred.resolve(_.keys(groups));
    })
    .catch(function(err) {
      deferred.reject(err)
    })
 
    return deferred.promise;
  }


}])




