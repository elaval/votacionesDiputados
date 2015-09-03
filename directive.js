
"use strict";
/* jshint undef: true, unused: true */
/* global angular */

angular.module("tide-angular")
.directive("tdLegend",["$compile","_", "d3", "toolTip",function ($compile,_, d3, tooltip) {
  return {
    restrict: "A",
    require: '?ngModel', // get a hold of NgModelController
    transclude: false,
    templateUrl: 'td-color-legend.html',
    scope: {
      colorLegend: "=tdColorLegend"
    }
    //template: "<div style='background-color:red' ng-transclude>Hola</div>",
   };
}]);


/**
 * @ngdoc directive
 * @name tide-angular.directive:tdXyChart
 * @requires underscore._
 * @requires d3service.d3
 * @requires tideLayoutXY
 * @requires linearRegression
 * @requires toolTip
 * @element div
 * 
 * @param {array} tdData Data array used for populating the chart
 * @param {string} tdXattribute Name of the attribute used for the X values in data objects
 * @param {string} tdYattribute Name of the attribute used for the Y values in data objects
 * @param {string} tdIdAttribute Name of the attribute used for the ID of unique entities in teh data set
 * @param {string} tdSizeAttribute Name of the attribute used for defining the size of the bubbles
 * @param {string} tdColorAttribute Name of the attribute used to define the color categories in the chart
 * @param {boolean=} tdSqrScaleX Indicates if shoudl display x axis using a sqr scale
 * @param {function=} tdTooltipMessage Function that should return a text to be displayed in the tooltip, given a data element
 * @param {int=} tdWidth Chart widht (and height)
 * @param {boolean=} tdTrendline Wether a trendline is displayed in the graph (linear regression)
 * @param {int=} tdMaxSize Maximum size of the bubbles (defaults to 5)
 * @param {int=} tdMinSize Minimun size of the bubbles (defaults to 1)
 * @param {array=} tdColorLegend Array that returns the color codes used in the legend each element is an array ["category", "color"]
 * @param {object=} tdSelected Object with the data element of the selected point in the chart
 * @param {object=} tdOptions Options for chart configuration (i.e. options.margin.left)
 * @description
 *
 * Generates a scatered XY Chart
 *
 */
angular.module("tide-angular")
.directive("tdSampleViewer",["$compile","_", "d3", "toolTip", function ($compile,_, d3, tooltip) {
 return {
  restrict: "A",
      require: '?ngModel', // get a hold of NgModelController
      //transclude: false,
      //template: "<div style='background-color:red' ng-transclude></div>",
      scope: {
        data: "=tdData",
        width: "=?tdWidth",
        colorAttribute: "=?tdColorAttribute",
        xAttribute: "=?tdXAttribute",
        showDetails: "=?tdShowDetails"

      },
      
      link: function (scope, element, attrs, ngModel) {
        var heightWidthRatio = 0.5;
        var width = scope.width ? scope.width : 800;
        var height = scope.width ? scope.width*heightWidthRatio : 400;
        var margin = {};
        margin.left = scope.options && scope.options.margin && scope.options.margin.left ? scope.options.margin.left : 20;
        margin.right = 20;
        margin.top = 20;
        margin.bottom = 20;

        // Data attributes
        var colorAttribute = scope.colorAttribute ? scope.colorAttribute : 'Country Code';
        var yAttribute = scope.yAttribute ? scope.yAttribute : 'Country';
        var xAttribute = scope.xAttribute ? scope.xAttribute : '2013 [YR2013]';
        var idAttribute = scope.idAttribute ? scope.idAttribute : 'Country Code';


        var svgMainContainer = d3.select(element[0])
          .append("svg")
          .attr("width", width+margin.left+margin.right)
          .attr("height", height+margin.top+margin.bottom)

        var svgContainer = svgMainContainer
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top+ ")");

        // Define dataPoints tooltip generator
        var toolTip = d3.tip()
        .attr('class', 'd3-tip')
        .html(function(d) { 
          var msg = d.materia;
          msg += "<br>("+d.fecha+")"
          

          return msg; 
        })
        .direction(function(d) {
          return 'e'
        })
        .offset([0, 10])

        svgContainer
        .call(toolTip)

        var colorScale = d3.scale.category20();
        var color = d3.scale.ordinal()
        .domain(["F","C","A","P",null, undefined])
        .range(["blue","red","grey","wite","white","white"])
        var xScale = d3.scale.linear();
        var yScale = d3.scale.ordinal();

        var xAxis = d3.svg.axis()
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .orient("left");

        svgContainer.append("g")
          .attr("class", "x axis");


        svgContainer.append("g")
            .attr("class", "y axis");

        var decimal = d3.format("0.2n")

        //var minichartHeight = 20;
        //var chartwidth = 50;
        var paddingEntrePartidos = 1;
        var paddingEntreCoalicines = 2;
        var paddingEntreGraficos = 3;
        var minichartMargin = 1;
        var minichartWidth = 50;
        var minichartHeight = 20;
        var minichartColumnsWidth = minichartWidth - paddingEntrePartidos*8 - paddingEntreCoalicines*3 - minichartMargin*2;
        var widthScale = d3.scale.linear().range([0,minichartColumnsWidth]).domain([0,120]);



        var resizeSvg = function() {
          width = element.width()-margin.left-margin.right;
          height = width*heightWidthRatio//-margin.top-margin.bottom;
          svgMainContainer.attr("width",element.width())
          svgMainContainer.attr("height",height+margin.top+margin.bottom)
        }


        /*
        * render
        */
        var render = function(data) {
          if (data) {

            // Adjust height accoring to number of data elements
            var chartsPerRow = Math.floor(width / (minichartWidth+paddingEntreGraficos));
            height = (minichartHeight+paddingEntreGraficos)*Math.ceil(data.length/chartsPerRow);
            svgMainContainer.attr("height",height+margin.top+margin.bottom)


            var votacion = svgContainer.selectAll(".votacion")
            .data(data, function(d) {return d.id});

            votacion.exit()
            .remove();

            var newVotacion = votacion.enter()
            .append("g")
              .attr("class", "votacion")
              .on("mouseover", toolTip.show)
              .on('mouseout', toolTip.hide)
              .on('click', function(d) {
                toolTip.hide(d);
                scope.showDetails(d);
              })

            newVotacion
            .append("rect")
              .attr("class", "border")
              .attr("width",minichartWidth)
              .attr("height",minichartHeight)
              .attr("rx",2)
              .attr("fill","#EEEEEE")              
              .attr("stroke","black")
              .attr("stroke-width",0.5)

/*

              <rect x="50" y="20" rx="20" ry="20" width="150" height="150"
  style="fill:red;stroke:black;stroke-width:5;opacity:0.5" />
  */

            votacion
            .attr("transform", function(d,i) {
                return "translate("+posicionMinichart(i)[0]+","+posicionMinichart(i)[1]+")";
            })

            var markerPartido = votacion.selectAll(".markerPartido")
            .data(function(d) {
              return [
                {"partido":"Partido Comunista", datos:d},
                {"partido":"Partido Socialista", datos:d},
                {"partido":"Partido Por la Democracia", datos:d},
                {"partido":"Partido Demócrata Cristiano", datos:d},
                {"partido":"Partido Radical Social Demócrata", datos:d},
                {"partido":"Partido Liberal de Chile", datos:d},
                {"partido":"Independientes", datos:d},
                {"partido":"Renovación Nacional", datos:d},
                {"partido":"Unión Demócrata Independiente", datos:d}
              ]
            })

            markerPartido.enter()
            .append("g")
              .attr("class", "markerPartido")
              .attr("transform", function(d,i) {
                return "translate("+(positionPartido(d.partido))+","+0+")";
              })

            var barFavor = markerPartido
            .append("rect")
              .attr("class", "marker")
              .attr("width", function(d) {
                return widthScale(d.datos.totalPorPartido[d.partido]);
              })
              .attr("height",function(d) {
                var h = d.datos.votoFavor[d.partido]/d.datos.totalPorPartido[d.partido]*(minichartHeight/2-minichartMargin);
                return h ? h : 0;
              })
              .attr("x", function(d,i) {return 0})
              .attr("y", function(d,i) {
                var y =  (minichartHeight/2 - d.datos.votoFavor[d.partido]/d.datos.totalPorPartido[d.partido]*(minichartHeight/2-minichartMargin));
                return y ? y : 0;
              })
              .attr("fill", function(d,i) {return colorScale(d.partido)}) 

            var barContra = markerPartido
            .append("rect")
              .attr("class", "marker")
              .attr("width", function(d) {
                return widthScale(d.datos.totalPorPartido[d.partido]);
              })              
              .attr("height",function(d) {
                var h = d.datos.votoContra[d.partido]/d.datos.totalPorPartido[d.partido]*(minichartHeight/2-minichartMargin);
                return h ? h : 0;
              })
              .attr("x", function(d,i) {return 0})
              .attr("y", function(d,i) {
                return minichartHeight/2;
              })
              .attr("fill", function(d,i) {return colorScale(d.partido)}) 

            var axis = votacion.append("line")
              .attr("x1", minichartMargin)              
              .attr("x2", widthScale(120)+paddingEntrePartidos *8 + paddingEntreCoalicines * 3+minichartMargin)
              .attr("y1", function(d,i) {
                return minichartHeight/2;
              })              
              .attr("y2", function(d,i) {
                return minichartHeight/2;
              })
              .attr("stroke", "grey")               
              .attr("stroke-width", 1) 

          }
        }

        var posicionMinichart = function(i) {
          var chartsPerRow = Math.floor(width / (minichartWidth+paddingEntreGraficos));

          var row = Math.floor(i/chartsPerRow);
          var column = i % chartsPerRow;

          return [column*(minichartWidth+paddingEntreGraficos),row*(minichartHeight+paddingEntreGraficos)];
        }

        var positionPartido = function(partido) {
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

          var pos;


          switch(partido) {
              case "Partido Comunista":
                  pos = 0
                  break;
              case "Partido Socialista":
                  pos = widthScale(totalPorPartido["Partido Comunista"])
                  pos = pos + paddingEntrePartidos *1 + paddingEntreCoalicines * 0;
                  break;
              case "Partido Por la Democracia":
                  pos = widthScale(totalPorPartido["Partido Comunista"]
                    +totalPorPartido["Partido Socialista"]
                    );
                  pos = pos + paddingEntrePartidos *2 + paddingEntreCoalicines * 0;
  
                  break;
              case "Partido Demócrata Cristiano":
                  pos = widthScale(totalPorPartido["Partido Comunista"]
                    +totalPorPartido["Partido Socialista"]
                    +totalPorPartido["Partido Por la Democracia"]
                    );
                  pos = pos + paddingEntrePartidos *3 + paddingEntreCoalicines * 0;                     
                  break;
              case "Partido Radical Social Demócrata":
                  pos = widthScale(totalPorPartido["Partido Comunista"]
                    +totalPorPartido["Partido Socialista"]
                    +totalPorPartido["Partido Por la Democracia"]
                    +totalPorPartido["Partido Demócrata Cristiano"]
                    );
                  pos = pos + paddingEntrePartidos *4 + paddingEntreCoalicines * 0;    
                  break;
              case "Partido Liberal de Chile":
                  pos = widthScale(totalPorPartido["Partido Comunista"]
                    +totalPorPartido["Partido Socialista"]
                    +totalPorPartido["Partido Por la Democracia"]
                    +totalPorPartido["Partido Demócrata Cristiano"]
                    +totalPorPartido["Partido Radical Social Demócrata"]
                    );
                  pos = pos + paddingEntrePartidos *5 + paddingEntreCoalicines * 1;    
                  break;
              case "Independientes":
                  pos = widthScale(totalPorPartido["Partido Comunista"]
                    +totalPorPartido["Partido Socialista"]
                    +totalPorPartido["Partido Por la Democracia"]
                    +totalPorPartido["Partido Demócrata Cristiano"]
                    +totalPorPartido["Partido Radical Social Demócrata"]
                    +totalPorPartido["Partido Liberal de Chile"]
                    );
                  pos = pos + paddingEntrePartidos *6 + paddingEntreCoalicines * 2;                    
                  break;
              case "Renovación Nacional":
                   pos = widthScale(totalPorPartido["Partido Comunista"]
                    +totalPorPartido["Partido Socialista"]
                    +totalPorPartido["Partido Por la Democracia"]
                    +totalPorPartido["Partido Demócrata Cristiano"]
                    +totalPorPartido["Partido Radical Social Demócrata"]
                    +totalPorPartido["Partido Liberal de Chile"]
                    +totalPorPartido["Independientes"]);
                  pos = pos + paddingEntrePartidos *7 + paddingEntreCoalicines * 3;
                   break;                  
              case "Unión Demócrata Independiente":
                   pos = widthScale(totalPorPartido["Partido Comunista"]
                    +totalPorPartido["Partido Socialista"]
                    +totalPorPartido["Partido Por la Democracia"]
                    +totalPorPartido["Partido Demócrata Cristiano"]
                    +totalPorPartido["Partido Radical Social Demócrata"]
                    +totalPorPartido["Partido Liberal de Chile"]
                    +totalPorPartido["Independientes"]
                    +totalPorPartido["Renovación Nacional"]
                  );
                  pos = pos + paddingEntrePartidos *8 + paddingEntreCoalicines * 3;                    
                  break;
              default:
                  pos = 0
          }
          return pos+minichartMargin;
        }


        // Check for changes in data and re-render
        scope.$watch("data", function () {
          render(scope.data);
        });      
  
        // Check for changes in data and re-render
        scope.$watch("xAttribute", function () {
          render(scope.data);
        });      
  
        // Aux function for checking changes in screen dimension
        scope.getElementDimensions = function () {
          return { 'h': element.height(), 'w': element.width() };
        };

        // Check for chaneges in screen dimension, resize SVG and re-render
        scope.$watch(scope.getElementDimensions, function (newValue, oldValue) {
          resizeSvg();
          render(scope.data);
        }, true);

      }
      
      
    };
  }]);

