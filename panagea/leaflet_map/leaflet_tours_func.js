var map = null;

$('#collapseMap').on('shown.bs.collapse', function(e) {
    (function(A) {

        if (!Array.prototype.forEach)
            A.forEach = A.forEach || function(action, that) {
                for (var i = 0, l = this.length; i < l; i++)
                    if (i in this)
                        action.call(that, this[i], i, this);
            };

    })(Array.prototype);



	/***********************************************************************************************
	because we re-initialize the map on each click, we need to remove it before we load it again..
	..otherwise we get an error "Uncaught Error: Map container is already initialized"
	https://stackoverflow.com/a/40826076/801018
	***********************************************************************************************/
	//console.log(map); // should output the object that represents instance of Leaflet
	if (map !== undefined && map !== null) {
	  map.remove(); // should remove the map from UI and clean the inner children of DOM element
	//console.log(map); // nothing should actually happen to the value of map
	}

    // now we initialize a clean map (again)
	map = L.map('map', {
        center: [52.514863, 13.385468],
        minZoom: 2,
        zoom: 13
    });

    L.tileLayer( 'https://api.mapbox.com/styles/v1/revisdevs/ck67lo5v10hvo1imokf0x7ht8/draft/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoicmV2aXNkZXZzIiwiYSI6ImNrNHNremxtbjEweGwzdXA0ZnZlcDZwYW4ifQ.pNA3xlJoTb8fzMwBEU6OgQ', {
     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>',
     id: 'mapbox.streets', 
     accessToken: '',// Your Mapbox Access Token
     subdomains: ['a','b','c']
    }).addTo( map );


    /*
	var myIcon = L.icon({
        iconUrl: 'img/pins/Marker.png',
        iconRetinaUrl: 'img/pins/Marker.png',
        iconSize: [30, 42],
        iconAnchor: [9, 21],
        popupAnchor: [6, -15]
    });
	*/

    var markerClusters = L.markerClusterGroup({
        polygonOptions: {
            opacity: 0,
            fillOpacity: 0
        }
    });

    for (var i = 0; i < markers.length; ++i) {
		var myIcon = L.icon({
			iconUrl: 'img/pins/'+ markers[i].type + '.png',
			iconRetinaUrl: 'img/pins/Marker.png',
			iconSize: [32, 37],
			iconAnchor: [9, 21],
			popupAnchor: [6, -15]
		});
		
		
        var popup =
            '<img src="' + markers[i].tags.image + '" alt=""/>' +
            '<span>' +
            '<span class="infobox_rate">' + markers[i].type + '</span>' +
            //'<em>' + markers[i].type + '</em>' +
            '<p class="fs-7 mb-2 p-0">' + markers[i].tags.name + '</p>' +
            //'<a href="' + markers[i].url_point + '" data-lity data-lity-target="' + markers[i].url_point + '" class="btn_infobox_detail"></a>' +
            //'<form action="http://maps.google.com/maps" method="get" target="_blank"><input name="saddr" value="' + markers[i].get_directions_start_address + '" type="hidden"><input type="hidden" name="daddr" value="' + markers[i].lat + ',' + markers[i].lon + '"><button type="submit" value="Get directions" class="btn_infobox_get_directions">Get directions</button></form>' +
            //'<a href="tel://' + markers[i].phone + '" class="btn_infobox_phone">' + markers[i].phone + '</a>' +
            '</span>';

/***********************************************************************************************************************/
/*
//Anti-Kriegs-Museum
	const wdimg = markers[i].tags.wikidata;
	if ( wdimg.indexOf('Q', 1) ) { //img.indexOf('Q', 1) img.indexOf('Q') === 0

		img = 'https://hub.toolforge.org/hub/' + wdimg + '?property=image';
        popup +='<img src="' + img + '" alt=""/>';
	}
	const imgdirect = markers[i].tags.img_direct;
	if ( imgdirect ) { //img.indexOf('Q', 1) img.indexOf('Q') === 0

        popup +='<img src="' + imgdirect + '" alt=""/>';
	}
	
	const imgfile = markers[i].tags.img_file;
	if ( imgfile ){
		if ( imgfile.indexOf('File') || imgfile.indexOf('Datei') ){ 
			img = imgfile.split(':');
			url = 'https://commons.wikimedia.org/wiki/Special:FilePath/' + img[2];

			popup +='<img src="' + url + '" alt=""/>';
		}
	}
*/
/***********************************************************************************************************************/
			if (markers[i].tags.website || markers[i].tags['contact:website']) {
				const web = markers[i].tags.website || markers[i].tags['contact:website'];
				popup +='<span class="popupadds py-1"><i class="ph ph-globe-simple fs-6 me-1"></i>Website:<a class="ms-1" href="' + web +'" target="_blank" rel="noopener">' + encodeURI(web.split('/')[2]) +'</a></span>';
			}
			
			if (markers[i].tags.phone) {
			popup += '<span class="popupadds py-2"><i class="ph ph-phone fs-6 me-1"></i>Phone: ' + markers[i].tags.phone +'</span>';
			}

			if (markers[i].tags.wikipedia || markers[i].tags['site:wikipedia']) {
				const w = markers[i].tags.wikipedia || markers[i].tags['site:wikipedia'];
				popup +='<span class="popupadds pt-1"><i class="ph ph-link-simple fs-6 me-1"></i>Information:<a class="ms-1" href="https://' + encodeURI(w.split(':')[0]) + '.wikipedia.org/wiki/' + encodeURI(w.split(':')[1]) + '" title="The Free Encyclopaedia" target="_blank" rel="noopener">Wikipedia</a></span>';
			}
			
			if (markers[i].tags.wheelchair) {
			popup += '<span class="popupadds py-2"><i class="ph ph-info fs-6 me-1"></i>Ammenities, facility:<i class="ph ph-wheelchair fs-6 ms-1 text-success" title="Rollstuhlgerecht : JA" style="cursor: pointer"></i></span>';
			}else{
			popup += '<span class="popupadds py-2"><i class="ph ph-info fs-6 me-1"></i>Ammenities, facility:<i class="ph ph-wheelchair fs-6 ms-1 text-danger" title="Rollstuhlgerecht : NEIN" style="cursor: pointer"></i></span>';
			}
			
			if (markers[i].tags.opening_hours) {
			popup += '<span class="popupadds py-2"><i class="ph ph-clock fs-6 me-1"></i><table class="table table-striped table-sm fs-9"><thead><tr><th colspan="2">Opening hours:</th></tr></thead><tbody><tr><td>Mon-Wed,Fri</td><td>09:00-18:00</td></tr><tr><td>Do</td><td>09:00-20:00</td></tr><tr><td>Sat-Sun</td> <td>10:00-18:00</td></tr></tbody></table></span>';
			}
			
		    popup += '<span class="py-2"></span>';


        var m = L.marker([markers[i].lat, markers[i].lon], { id: markers[i].id, icon: myIcon }).bindPopup(popup);

        markerClusters.addLayer(m);
    }

    //deals markers
	for (var i = 0; i < deals.length; ++i) {
		var myIcon = L.icon({
			iconUrl: deals[i].tags.imagesmall,
			iconRetinaUrl: 'img/pins/Marker.png',
			iconSize: [65, 65],
			iconAnchor: [9, 21],
			popupAnchor: [23, -16],
			className: 'mitsakos'
		});
		
		
        var popup =
            '<img class="deals-img" src="' + deals[i].tags.image + '" alt=""/>' +
            '<span>' +
            '<span class="infobox_rate">' + deals[i].type + '</span>' +
            '<p class="dealsname fs-7 mb-2 p-0">' + deals[i].tags.name + '</p>' +
            '</span>';
			
			popup += '<span class="popupadds py-2">' + deals[i].tags.description +'</span>';
			
			popup += '<span class="popupadds py-2"><i class="ph ph-phone fs-6 me-1"></i>Phone: ' + deals[i].tags.phone +'</span>';
			
			popup += '<span class="popupadds py-2"><i class="ph ph-info fs-6 me-1"></i>Ammenities, facility:<i class="ph ph-wheelchair fs-6 ms-1 text-success" title="Wheelchair accessible : Yes" style="cursor: pointer"></i></span>';
			
			popup += '<span class="popupadds py-2"><i class="ph ph-clock fs-6 me-1"></i><table class="table table-striped table-sm fs-9"><thead><tr><th colspan="2">Opening hours:</th></tr></thead><tbody><tr><td>Mon-Fri</td><td>09:00-20:00</td></tr><tr><td>Sat-Sun</td><td>10:00-18:00</td></tr></tbody></table></span>';

			popup += '<span class="popupadds py-2 d-flex justify-content-center"><button type="button" class="btn-deals btn btn-success btn-sm shadow-lg" data-lity data-lity-target="#marker_deals"><i class="ph ph-shopping-cart fs-6 me-2"></i>Online booking</button></span>';
			
		    popup += '<span class="d-none wallet-id" wallet-id="' + deals[i].id + '"></span>';
		    popup += '<span class="d-none adrate">' + deals[i].tags.adrate + '</span>';
		    popup += '<span class="d-none chrate">' + deals[i].tags.chrate + '</span>';
		    popup += '<span class="py-2"></span>';


        var m = L.marker([deals[i].lat, deals[i].lon], { id: deals[i].id, icon: myIcon }).bindPopup(popup);

        markerClusters.addLayer(m);
    }
	
    map.addLayer(markerClusters);

    //Link on the same page
    var classname = document.getElementsByClassName("address");

    var openMarkerPopup = function() {
        var id = this.getAttribute("data-id");
        markerClusters.eachLayer(function(layer) {
            if (layer.options.id && layer.options.id == id) {
                if (!layer._icon) layer.__parent.spiderfy();
                layer.openPopup();
            }
        });
    };

    for (var i = 0; i < classname.length; i++) {
        classname[i].addEventListener('click', openMarkerPopup, false);
    }

	//debug: find lat/lng
	var lat;
	var lng;

	map.on('click', function(e) {
		console.log(e.latlng);  //So you can see if it's working
		lat = e.latlng.lat;
		lng = e.latlng.lng;
	});

});//.on('shown.bs.collapse'


$(function() {
	/**************************************************************************
	button 'Online Buchung' [data-lity] on click
	*************************************************************************/

	$('#map').on('click', 'button.btn-deals', function(){ //delegate the click
		
		$this = $( this );
		$("#marker_deals .fotoX").empty();
		
		var img = $( this ).closest('.leaflet-popup-content').find('img.deals-img').clone(); // [1]
		$("#marker_deals .fotoX").append(img);
	
		//(1) populate each individual service rates & data
		var walletid = $this.closest('.leaflet-popup-content').find("span.wallet-id").attr("wallet-id");
		var headertxt = $this.closest('.leaflet-popup-content').find("p.dealsname").text();
		var adultrate  = parseInt($this.closest('.leaflet-popup-content').find("span.adrate").text(), 10); //make sure it's a number
		var chrate  = parseInt($this.closest('.leaflet-popup-content').find("span.chrate").text(), 10);
		
		$("#htmlDetailDeals #service-header-deals").text(headertxt);            // set #htmlDetailDeals service header
		$("#marker_deals .pricingTable span.adrate").text(adultrate);           // set #htmlDetailDeals pricing table adult rate
		$("#marker_deals .pricingTable span.chrate").text(chrate);              // set #htmlDetailDeals pricing table child rate
		
		$("#htmlDetailDeals #service-header-deals").attr('wallet-id',walletid); // for wallet, set the service id
		$("#marker_deals .bookthis span.data-term").data('term',headertxt);     // for wallet, set the service name
		$("#marker_deals .bookthis .adultsselect").data('price',adultrate);     // for wallet, set the adult rate
		$("#marker_deals .bookthis .childrenselect").data('price',chrate);      // for wallet, set the child rate
		

		//(3) populate the selects options values
		//set option values of each select taken from its attr data-price
		$('#marker_deals .adultsselect, #marker_deals .childrenselect').each(function() {
			let inival = parseInt($( this ).data('price'), 10); // cache the attr data-price + make sure it's an integer
			//console.log(inival);
			
			// find the select's (each) option with .map >> then multiply its own value by initial price (e.g value "1" * inival) >> .. then set it as new value
			$( this ).find('option').map(function() { return $(this).val( $(this).val()*inival ); }); 
		});
	});	

});//doc ready



	/**********************************************************************
	 Wallet processing >> MUST be outside doc ready
	**********************************************************************/
	
	function addMapDealstoWallet() {
		let data_wallet_id = parseInt($( "#htmlDetailDeals" ).find('div#service-header-deals').attr("wallet-id"), 10); // catch Trip id +  make sure it's an integer
		let data_wallet_price = parseInt($('#total_deals').text(), 10); // catch Trip total
		
		let data_wallet_row = '';
		$('#marker_deals .adultsselect, #marker_deals .childrenselect').each(function() {
			
			let val = parseInt($(this).val());
			let dataterm = $( this ).closest('article').find('span.data-term').data('term'); // catch Trip Name
			let dataperson = $( this ).data('person');            // catch person type
			let dataqty = $( this ).children(':selected').text(); // catch person qty
			
			if(val > 0)  {     //get each select greater 0

				data_wallet_row+= '<div class="dterm m-0 p-0 fs-7 d-block">'+dataterm+'</div><div class="me-2 p-0 fs-9 d-inline-block">'+dataperson+' '+dataqty+'</div>';
				
			}
		
		});
			
		//console.log(data_wallet_row);

		/* Mount the stuff to our cart
		 * HINT: date is not displayed in cart, but needed for sorting
		 * HINT: Our data_wallet_row will produce dual entries for 'dataterm' .. we remove duplicates in wallet.min.js line 51
		 * HINT: style=\"font-size:0\  is used as dirty fix, because with d-inline-block in 'dataperson+dataqty' you get stupid vertical space.. font-size:0 will fix that
		 * see https://stackoverflow.com/a/16679004/801018
         */
		const myproduct = {
			id: data_wallet_id,
			name: '<div style=\"font-size:0\">'+data_wallet_row+'</div>',
			price: data_wallet_price, 
			type: '<i class=\"ph ph-ticket text-primary fs-5\"></i>',
			day: day,
			month: month,
			date: searchParams.get('date')
			}
			
		if(cartLS.exists(data_wallet_id)) { // if exists
			cartLS.remove(data_wallet_id)   // remove previous
		    cartLS.add(myproduct)           // add new one
			
		}else{
			
			cartLS.add(myproduct)
		}
		
		$( ".mainWalletBtn, .lity-close" ).click(); //close lity, open wallet, animate click to button (top page)
	}
	