   $( document ).ready(  function(){

      	$('#list-view-open').click( function(){
      			var listView = $('#list-view');
      			if( listView.css( 'display')  === 'none'){
      				listView.css( 'display', 'block');
      			} else {
					listView.css( 'display', 'none');
      			}

      		});

		var map;
      	if( typeof google != "undefined" ){
      		map = new google.maps.Map(document.getElementById('map-canvas'), {center: new google.maps.LatLng(45.5, -122.67),zoom: 12 });
      	}


      	if( typeof map == 'undefined' ){
      		$('#error-msg').css( 'display', 'block');
      		$('#map-canvas').css( 'display', 'none');
      		return;
      	}

		var markerInfo = [
			{
				latLng : new google.maps.LatLng(45.5428958 , -122.6692628),
				title : "Legacy Emanuel Hospital",
				infoText : 'Legacy Emanuel CHapel<br>2801 N. Gantenbein Ave.. Portland OR 97227<br>(503) 821-7453',
				venueId : "5108188ee4b0b4a2f5643da6",
				keys : [ 'hospital', 'legacy', 'health']
			},
			{
				latLng : new google.maps.LatLng(45.535693, -122.882721),
				title : "Boom Fitness Tanasbourne",
				infoText : 'Best Gym in town<br>2200 NW Amberbrook Dr, Beaverton, OR 97006<br>(503) 531-8400',
				venueId : "4f0b9202e4b0b63c74553653",
				keys : [ 'fitness', 'gym']
			},
			{

				latLng : new google.maps.LatLng( 45.392200,  -122.751127 ),
				title : "Boom Fitness Bridgeport",
				infoText : 'Second best gym in town<br> 18039 SW Lower Boones Ferry Rd, Portland, OR 97224<br>(503) 684-8151',
				venueId : "4ce1f2ee00166ea815534488",
				keys : [ 'fitness', 'gym']
			},
			{

				latLng : new google.maps.LatLng( 45.514858, -122.867721 ),
				title : "Black Rock Coffee",
				infoText : 'local coffee shop<br>765 SW 185th Ave, Beaverton, OR 97006<br>',
				venueId : "4bc0b02a74a9a593e56fd0f6",
				keys : [ 'coffee']
			},
			{

				latLng : new google.maps.LatLng(  45.418901,  -122.564874),
				title : "Kabuki Strength Lab",
				infoText : 'Kyles Playground<br>14350 SE Industrial Way, Clackamas, OR 97015<br>(602) 943-1502',
				venueId : "57f67b0b498e40a49648ec86",
				keys : [ 'italian', 'food']
			},
			{
				latLng : new google.maps.LatLng( 45.512220, -122.971559),
				title : "Planet Pizza",
				infoText : 'Weakest wannabe gym<br>1001 SE Tualatin Valley Hwy, Hillsboro, OR 97123<br>(503) 596-2119',
				venueId : "5474ce9d498ec6af995ca159",
				keys : [ 'Joke']

			}
		];



		var clientId = "JLAZBDFD0CQYD3HWTH0HOWHTI54XWLWYHTL4XTJ3KRULIVCE";
		var clientSecret = "UDZZ5EMTRG2IBCWKAIEXIT4HKLM0AHBNB330Q11LYLYCFXDW";


      	//
      	// start of the knockout init code
      	//
      	function DecoratedMarker( marker_info, mvm ){
      		var self = this;


      		self.mvm = mvm;
      		self.title = marker_info.title;
      		self.venueId = marker_info.venueId;


			self.bubbleText  = ko.observable( marker_info.infoText);

      		self.keys = marker_info.keys;
      		// take the bubbe text and the title and split them into words and add them to the list of keys
      		// so that the search will include that text as well
      		var bubbleParts = self.bubbleText().split( " ");
      		for( var i = 0 ; i < bubbleParts.length; i++ ) self.keys.push( bubbleParts[i].toLowerCase() );
      		var titleParts = self.title.split( " " );
      		for( i = 0; i < titleParts.length; i++ ) self.keys.push( titleParts[i].toLowerCase());


      		self.infowindow = new google.maps.InfoWindow( { content : self.bubbleText() });

      		self.mapMarker = new google.maps.Marker({ position: marker_info.latLng,map: map,title: marker_info.title });


      		// This function is called when one of the markers on the map is clicked
      		google.maps.event.addListener( self.mapMarker , 'click',  function(){
      			self.selected();
      		});

      		// This function is called when one of the list items is clicked from list view
      		self.selected = function(){
      			// close any other bubble, and unselect any other label
      			mvm.closeAll();
      			self.clicked();

      			$('#four-square-view').css( 'display', 'block');

				var foursquareUrl = 'https://api.foursquare.com/v2/venues/' + self.venueId + '?v=20130815&' + 'client_id=' + clientId + '&client_secret=' + clientSecret;
				mvm.fourName( 'waiting');
      			mvm.fourRating( 'waiting');
				 $.ajax( { url : foursquareUrl }).done(
						function ( response) {
							var v = response.response.venue;
							mvm.fourName( v.name);
			      			mvm.fourRating( v.rating);
					}).error( function () {
							mvm.fourName( 'error' );
							mvm.fourRating( 'error');
						}
					);
      		};


      		self.matches = function( q ){
      			// see if query 'q' appears in the keys
      			return $.inArray( q.toLowerCase(), self.keys ) != -1;
      		};



      		/*
				 The states are the following
				1) initial map load. All labels are visible and unselected. All markers are visible and their baloon is up
				2) marker clicked. Only that label will have 'selected' css class and the bubble is visible, also the 4square should be up.
				3) matches a search, same as 2) above but w/o the 4square ( currently is coming off the list view which is odd )
				4) does not match a search result, label and marker are not visible.
      		*/

      		// this var is used to control the css class for the list item
      		self.isHidden = ko.observable( false );

      		self.initialState = function(){
      			self.isHidden( false );
      			self.mapMarker.setVisible( true );
      			self.infowindow.close();
      			$('#four-square-view').css( 'display', 'none');
      		};

      		self.clicked = function(){
      			self.isHidden( false );
      			self.mapMarker.setVisible( true );
      			self.infowindow.open( map,self.mapMarker );
      		};

      		self.matchesSearch = function(){
      			self.isHidden( false );
      			self.mapMarker.setVisible( true );
      			self.infowindow.open( map,self.mapMarker );
      			$('#four-square-view').css( 'display', 'none');
      		};

      		self.doesNotMatch = function(){
      			self.isHidden( true );
      			self.mapMarker.setVisible( false );
      			self.infowindow.close();
      			$('#four-square-view').css( 'display', 'none');
      		};


      	}

      	function MarkerViewModel(){
      		var self = this;

      		var tmpArray = [];
      		for( var i = 0; i < markerInfo.length; i++ ) tmpArray.push( new DecoratedMarker( markerInfo[i], self) );
      		self.markers = ko.observableArray( tmpArray );





      		self.fourName = ko.observable('inital');
      		self.fourRating = ko.observable( 'initial');
      		self.searchQ = ko.observable( '' );


      		self.closeAll = function( ){ for( var i = 0; i < self.markers().length; i++ ) self.markers()[i].initialState(); };
      		self.searchMarkers = function(){

      			var q = self.searchQ();

      			// find a list of markers that match this string
      			var filterList = [];
      			var noMatchList = [];
      			for( var i = 0; i < self.markers().length; i++ ){
      				var m = self.markers()[i];
      				if( m.matches( q ))
      					filterList.push( m );
      				else
      					noMatchList.push( m);
      			}

      			for(  i = 0; i < filterList.length; i++ )filterList[i].matchesSearch();
      			for(  i = 0; i < noMatchList.length; i++ )noMatchList[i].doesNotMatch();


      		};

      		self.selectItem = function( item ){
      			item.selected();
      		};


      		self.clearSearch = function(){
      			self.searchQ("");
      			for(  i = 0; i < self.markers().length; i++ ) self.markers()[i].initialState();
      		};
      	}

        ko.applyBindings( new MarkerViewModel() );

//     var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + markerInfo + '&format=json&callback=wikiCallback';
//   var wikiRequestTimeout = setTimeout(function(){
//       $wikiElem.text("failed to get wikipedia resources");
//   }, 8000);
//
//   $.ajax({
//       url: wikiUrl,
//       dataType: "jsonp",
//       jsonp: "callback",
//       success: function( response ) {
//           var articleList = response[1];
//
//           for (var i = 0; i < articleList.length; i++) {
//               articleStr = articleList[i];
//               var url = 'http://en.wikipedia.org/wiki/' + articleStr;
//               $wikiElem.append('<li><a href="' + url + '">' + articleStr + '</a></li>');
//           };
//
//           clearTimeout(wikiRequestTimeout);
//       }
//   });
//
//   return false;
// };
//
// $('#form-container').submit(loadData);
      });
