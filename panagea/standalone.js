	const searchParams = new URLSearchParams(window.location.search); // globally available
	
	const date = new Date(searchParams.get('date'));
	const day = date.getDate();
	const weekday = date.toLocaleString("de-DE", { weekday: "short" });
	const month = date.toLocaleString('de-DE', { month: 'short' }); //use 'default' for EN
	const year = date.getFullYear();

	/**********************************************************************
	 Wallet processing >> MUST be outside doc ready
	**********************************************************************/
	
	function addTriptoWallet() {
		let data_wallet_id = parseInt($( "#htmlDetail" ).find('div#service-header').attr("wallet-id"), 10); // catch Trip id +  make sure it's an integer
		let data_wallet_price = parseInt($('#total_5').text(), 10); // catch Trip total
		
		let data_wallet_row = '';
		$('.adultsselect, .childrenselect').each(function() {
			
			let val = parseInt($(this).val());
			let dataterm = $( this ).closest('article').find('span.data-term').data('term'); // catch Trip Name
			let dataperson = $( this ).data('person');            // catch person type
			let dataqty = $( this ).children(':selected').text(); // catch person qty
			
			if(val > 0)  {     //get each select greater 0

				data_wallet_row+= '<div class="dterm m-0 p-0 fs-7 d-block">'+dataterm+'</div><div class="me-2 p-0 fs-9 d-inline-block">'+dataperson+' '+dataqty+'</div>';
				
			}
		
		});
			
		//console.log(data_wallet_row);

		// icons based on experience type
		let data_type = $( "#htmlDetail" ).find('div#service-header').attr("service-type");
		
		if(data_type == 'erleben') {
			
			var dtype = '<i class=\"ph ph-sun fs-5\"></i>';
			
		}else if(data_type == 'erkunden'){
			
			var dtype = '<i class=\"ph ph-bank fs-5\"></i>';
			
		}else{
			
			var dtype = '<i class=\"ph ph-map-pin-line fs-5\"></i>';
		}
		
		
		
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
			type: dtype,
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
	
$(function() {
	/**********************************************************************
	[STEP ONE] Service cards
	**********************************************************************/
	$(".box_grid").each(function(index) {
	   $(this).attr("walletid", "20"+index); //[1]  200,201,202 etc
	});

	/**********************************************************************
	 Tour Detail stuff
	**********************************************************************/

    // remove SAresform sticky position if screen height less than 800
	$('.serviceDetails').scroll(function(){
        if(window.screen.availHeight < 800) {
            $('.SAresform').removeClass( 'sticky-top' );
        }
    });
	
	// DATES visualization
	$( "span.serviceday" ).text(day+' '+month+' '+year); 
	
	/**********************************************************************
	 Calculations
	**********************************************************************/

	//[1] we populate individual id's, rates etc on click (see Ajax complete: function below)
		
	//[2] calculate the total on select change
		$('.SAresform').on('change', '.adultsselect, .childrenselect', function(){ // on any of these selects change..
			
			let total = 0;
			$('.SAresform .adultsselect, .SAresform .childrenselect').each(function() { // keep .SAresform as selector, otherwise it will iterate trough DOM and also find the hidden (to be cloned) selects and will return NaN .. which we don't want
			 total += $(this).val()/1;
			  //console.log(total);	
			});
			$('#total_5').text(total+',00');
			$('#total_deals').text(total+',00'); // for map popup deals
			$('button.addSelected').removeClass( 'pointer-events-none' ); // enable 'book' button
		});
	


	/**************************************************************************
	[STEP TWO] a[data-lity] on click
	*************************************************************************/
$(function() { // must be inside doc ready

    $("a[data-lity]").on('click', function() {

        const $this = $(this);
        const $sliderContainer = $(".fotoX ul.slider-container");
        $sliderContainer.empty();

        const folder = "img/panagea/tours/"; // adjust if needed

        $.getJSON(folder + "images.json", function(data) {
            let src = $this.closest('.box_grid').find('figure img').attr('src');
            let file = src.split('/').pop().split('.jpg')[0]; // Extracts the filename without the extension (tour_a1, tour_b3, etc.), Used as the key to access images in images.json

            if (!data[file] || data[file].length === 0) {
                console.warn("⚠️ No images found in JSON for:", file);
                return;
            }

			// preload first image
			const firstImg = new Image();
			firstImg.src = folder + data[file][0];

			firstImg.onload = function() {

				// (1) Append first image
				$sliderContainer.append("<li class='active'><img src='" + firstImg.src + "' class='loaded'></li>");

				// (2) Append remaining images
				data[file].slice(1).forEach(img => {
					$sliderContainer.append("<li><img src='" + folder + img + "' class='loaded'></li>");
				});

				// (3) Initialize or refresh Swiffy Slider safely
				initSwiffySafe($sliderContainer);

				// (4) OLD "complete" logic from previous script
				//(1) populate each individual service rates & data
				var walletid = $this.closest('.box_grid').attr("walletid");
				var headertxt = $this.closest('.box_grid').find(".wrapper h3 a").text();
				var adultrate  = parseInt($this.closest('.box_grid').find(".wrapper span.adultrate").text(), 10);
				var chrate  = parseInt((adultrate/100)*60, 10);
				var servicetype = $this.closest('.box_grid').find("figure > small").text();

				$("#htmlDetail #service-header").text(headertxt);
				$(".pricingTable span.adrate").text(adultrate);
				$(".pricingTable span.chrate").text(chrate);

				$("#htmlDetail #service-header").attr('wallet-id', walletid);
				$("#htmlDetail #service-header").attr('service-type', servicetype);
				$(".bookthis span.data-term").data('term', headertxt);
				$(".bookthis .adultsselect").data('price', adultrate);
				$(".bookthis .childrenselect").data('price', chrate);

				//(2) attach any extra services found
				var optone = $this.closest('.box_grid').find(".opt-one");
				var opttwo = $this.closest('.box_grid').find(".opt-two");
				var addprefs = $this.closest('.box_grid').find(".add-prefs");

				if(optone.length) {
					$('#optone').clone().appendTo('.stdaloneDetailOptions');
					$('#optone p.clone-title').text(optone.data('test').term);
					$('#optone span.data-term').data('term', optone.data('test').term);
					$('#optone div.clone-adrate').text(optone.data('test').adrate+',00 €');
					$('#optone .adultsselect').data('price', optone.data('test').adrate);
					$('#optone div.clone-chrate').text(optone.data('test').chrate+',00 €');
					$('#optone .childrenselect').data('price', optone.data('test').chrate);
				}

				if(opttwo.length) {
					$('#opttwo').clone().appendTo('.stdaloneDetailOptions');
					$('#opttwo p.clone-title').text(opttwo.data('test').term);
					$('#opttwo span.data-term').data('term', opttwo.data('test').term);
					$('#opttwo div.clone-adrate').text(opttwo.data('test').adrate+',00 €');
					$('#opttwo .adultsselect').data('price', opttwo.data('test').adrate);
					$('#opttwo div.clone-chrate').text(opttwo.data('test').chrate+',00 €');
					$('#opttwo .childrenselect').data('price', opttwo.data('test').chrate);
				}

				if(addprefs.length) {
					$('.clone-preferences').clone().appendTo('.stdaloneDetailOptions');
				}

				//(3) populate the selects options values
				$('.adultsselect, .childrenselect').each(function() {
					let inival = parseInt($(this).data('price'), 10);
					$(this).find('option').map(function() { return $(this).val($(this).val()*inival); });
				});

			};

        }).fail(() => {
            console.error("⚠️ Failed to load images.json from", folder + "images.json");
        });

    });

}); // doc ready

/*
 * Initializes or refreshes the SwiffySlider safely using initSwiffySafe(), 
 * which ensures the SwiffySlider library is defined before initialization.
 */
function initSwiffySafe($container) {
    if (typeof SwiffySlider !== "undefined") {
        if ($container[0].swiffySlider) {
            $container[0].swiffySlider.refresh();
        } else {
            new SwiffySlider($container[0]);
        }
    } else {
        setTimeout(() => initSwiffySafe($container), 50);
    }
}
	
	
/****************************************************************************************
[STEP THREE] 

 [1] before lity opens, we need to set individual css for these modals
     https://github.com/jsor/lity/issues/85
 
 [2] lity needs to be ready, then load content & do stuff 
     https://github.com/jsor/lity/tree/2.x?tab=readme-ov-file#lityready
 
 [3] https://github.com/jsor/lity/tree/2.x?tab=readme-ov-file#lityclose-1
     
 [4] We reset the select choises, so we have fresh calculation base on each new lity load
     We also reset the total counter
****************************************************************************************/
	
	$(document).on('lity:open', function(event, instance) { //[1]
			//$('.lity-container, .lity-content').addClass('w-100 h-100');
			//abandoned for panagea and assigned width 100vw & height 100vh to the containers (see  id="service_5")..as we want different sizes for different lightboxes
	});
	
	$(document).on('lity:ready', function(event, instance) { //[2]

		$('#page').addClass('opacity-0');
		//$('.slider-large').slick('setPosition'); // initialize .slick again
		
	});

	$(document).on('lity:close', function(event, instance) { //[3]
		$('#page').removeClass('opacity-0');
		
		//[4]
		$('.SAresform .cloned-select, .SAresform .clone-preferences').remove();
		$('.adultsselect, .childrenselect').html('<option value="0">0</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option>');
		$('.SAresform #total_5').text('00,00');
		$('.SAresform #total_deals').text('00,00');
	});

});// doc ready


/**********************************************************************

HOW WE DISPLAY INDIVIDUAL SERVICE DETAIL AND DO CALCULATIONS
 
[STEP ONE] Service cards
on page load, we assign to each service card an increment id 
https://stackoverflow.com/a/6996824/801018
which is needed to identify each service id in our wallet(see data_wallet_id)
Then, on Ajax [STEP TWO], we pass this id to .data("wallet-id")


[STEP TWO]  a[data-lity] on click
Before lity opens, we need to (A) load images & (B) process service data

(A)  
 * Handle product image clicks for the lightbox/slider.
 *
 * This click handler applies to all <a> elements with the 'data-lity' attribute.
 * When a product is clicked, it:
 *   1. Clears the slider container (.fotoX ul.slider-container) of previous images.
 *   2. Determines the base filename of the clicked product's image.
 *   3. Loads the corresponding image set from images.json.
 *   4. Preloads the first image and appends it immediately to the slider (with 'loaded' class for fade-in).
 *   5. Appends remaining images to the slider.
 *   6. Initializes or refreshes the SwiffySlider safely using initSwiffySafe(), 
 *      which ensures the SwiffySlider library is defined before initialization.
 *
 * Advantages of this approach:
 *   - Works reliably both locally and on GitHub Pages.
 *   - Supports any number of images per product.
 *   - Ensures smooth fade-in effect for all images.
 *   - Prevents SwiffySlider undefined errors due to script timing issues.
 * 
 * HTML requirement:
 *   - Each product <a> must have a 'data-lity' attribute.
 *   - The slider container must be present in the DOM: .fotoX ul.slider-container

(B) 
we populate individual id's, rates etc to their respective fields
so we can process each service with tis own values
	
	
[STEP THREE] .on('lity:close')
see step  [4] We reset the select choises, so we have fresh calculation base on each new lity load
              We also reset the total counter
**********************************************************************/