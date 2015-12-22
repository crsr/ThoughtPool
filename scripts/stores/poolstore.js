var Reflux = require('reflux');
var $ = require('jquery');
var PoolActions = require('../actions/poolactions');

var PoolStore = Reflux.createStore({
	listenables: [PoolActions],
	sourceUrl: '/api/comments/',
	poolObject: {poollist: [], postSuccess: false, searchPool: {}, myPoolList: []},

	init: function(){
		this.loadPools();
	},

	getInitialState: function() {
        return this.poolObject;
    },

	loadPools: function (searchPool){
		$.ajax({
			url: this.sourceUrl,
			dataType: 'json',
			cache: false,
			success: function(serverData){
				this.poolObject.poollist = serverData.reverse();
				if(searchPool){
					this.poolObject.searchPool = searchPool; 
					this.searchRenderer(searchPool);
				}
				this.trigger(this.poolObject);
			}.bind(this),
			error: function(){
				console.error(this.sourceUrl, status);
			}.bind(this)
		})
	},

	loadMyPools: function (){
		$.ajax({
			url: '/api/mycomments',
			dataType: 'json',
			cache: false,
			success: function(serverData){
				this.poolObject.myPoolList = serverData.reverse();
				this.trigger(this.poolObject);
			}.bind(this),
			error: function(){
				console.error(this.sourceUrl, status);
			}.bind(this)
		})
	},

	createPool: function(pool){
		$.ajax({
		  url: this.sourceUrl,
		  dataType: 'json',
		  type: 'POST',
		  data: pool,
		  cache: false,
		  success: function(serverData) {
		  	this.poolObject.poollist.push(serverData);
		  	this.poolObject.poollist = this.poolObject.poollist.reverse();
			this.poolObject.postSuccess = true;
			this.trigger(this.poolObject);
		  }.bind(this),
		  error: function(xhr, status, err) {
		    console.error(this.sourceUrl, status, err.toString());
		  }.bind(this)
		});
	},

	deletePool: function(poolId){
		$.ajax({
		  url: this.sourceUrl,
		  dataType: 'json',
		  type: 'DELETE',
		  data: {id: poolId},
		  cache: false,
		  success: function(serverData) {
			this.loadPools();
			this.loadMyPools();
		  }.bind(this),
		  error: function(xhr, status, err) {
		    console.error(this.sourceUrl, status, err.toString());
		  }.bind(this)
		});
	},

	getPath: function(encodedRoute){
		return google.maps.geometry.encoding.decodePath(encodedRoute);
	},

	getPolyline: function(path){
		var polyline = new google.maps.Polyline({
		        path: path,
		    });
		return polyline;
	},

	fallsOnRoute: function(placeLatLng, pathPolyline){
		return google.maps.geometry.poly.isLocationOnEdge(placeLatLng, pathPolyline, 0.005);
	},

	searchPoolList: function(searchPool){
		var allPool = this.poolObject.poollist;
		var exactPool = [];
		var partialPool = [];
		var lessPartialPool = [];

		var searchPolyline = this.getPolyline(this.getPath(searchPool.encodedRoute));
		var searchOrigin = searchPool.origin;
		var searchDestination = searchPool.destination;

		for(var i = 0; i<allPool.length; i++){

			var pool = allPool[i];
			var path = this.getPath(pool.encodedRoute);
			var polyline = this.getPolyline(path);

			var sourceFallsOnRoute = this.fallsOnRoute(searchOrigin, polyline);
			var destinationFallsOnRoute = this.fallsOnRoute(searchDestination, polyline);

			
			if (sourceFallsOnRoute && destinationFallsOnRoute){
				exactPool = exactPool.concat([pool]);
			}
			else
			{
				if (sourceFallsOnRoute || destinationFallsOnRoute){
					var poolStart = path[0];
					var poolEnd = path[path.length - 1];

					var poolStartFallsOnRoute = this.fallsOnRoute(poolStart, searchPolyline);
					var poolEndFallsOnRoute = this.fallsOnRoute(poolEnd, searchPolyline);

					if (poolStartFallsOnRoute && poolEndFallsOnRoute){
						partialPool = partialPool.concat([pool]);
					}
					else{
						lessPartialPool = lessPartialPool.concat([pool])
					}
				}
			}
		}

		var poollistFiltered = exactPool.concat(partialPool);
		return poollistFiltered;
	},

	searchRenderer: function(pool){
		this.poolObject.poollist = this.searchPoolList(pool);
	},

	sendEmail: function(pool){
		var filteredPoolList = this.searchPoolList(pool);
		var notifications = [];
			
		if(filteredPoolList.length > 0){

			for(var i=0; i<filteredPoolList.length; i++){

				var emailPoolList = filteredPoolList[i];
				var notification = {
					email : emailPoolList.email,
					subject: "Thola - Route Match",
					from: "prabhur@thoughtworks.com",
					html: '<div style="padding: 30px; width: 350px; height: 300px; background:#fecb00"><h3>Route Match from Thola</h3><h2>' + emailPoolList.name + '<h2><h4>From: ' + emailPoolList.originAddress + '</h4><h4>To: ' + emailPoolList.destinationAddress + '</h4><a href="https://thola.herokuapp.com/search" style="background:#46afcd; padding: 10px; text-decoration: none">GO</a></div>'
				};
				notifications.push(notification);
			}

			$.ajax({
				  url: '/notify',
				  dataType: 'json',
				  type: 'POST',
				  data: {notifications: notifications},
				  cache: false,
				  success: function(res) {
				  	console.log("Notified Successfully");
				  }.bind(this),
				  error: function(xhr, status, err) {
				    console.error(this.sourceUrl, status, err.toString());
				  }.bind(this)
			});
		}
	}
});
module.exports = PoolStore;