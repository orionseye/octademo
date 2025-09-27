$(function() {
	/**********************************************************************
	 Checkin/Checkout DATES visualization
	 The variables for accessing date stuff is already declared in index.js
	**********************************************************************/
	
	$( "span.dayInCloned" ).html( $("span.theIn" ).text() );
	$( "span.dayOutCloned" ).html( $("span.theOut" ).text() );

    /* initial Rate total
	 * (.rp_wrapper + *) makes the targeted element for .closest() generic, so that even if there is no parent, it will still work. https://stackoverflow.com/a/7018385/801018
	 */
	var ttal = $( ".configurator_box" ).closest('.rp_wrapper + *').prev().find(".total_estimate p span.ttal"); // cache the target element
	$( "#room_total" ).html( ttal.text()+',00' );
	
    // display nights of stay, according to what was selected
	$( "span.conf_t_nights" ).text(Number(nights));
	
	
	/**********************************************************************
	 Calculations
	**********************************************************************/

   //https://stackoverflow.com/a/20727186/801018
   $('.extraserv, #adultsBox, #childrenBox').change(function(){ // on any of these checkboxes or selects change..
	   
		var roominitial = $( ".configurator_box" ).closest('.rp_wrapper + *').prev().find(".total_estimate p span.ttal").text(); // cache the initial room rate
		var total = parseInt(roominitial, 10); // make sure it's an integer
	   //console.log(typeof total);
		
		var n_adults = parseInt($('#adultsBox').val());
		var n_children = parseInt($('#childrenBox').val());
		var pers_total = n_adults+n_children;
		
       $( "span.pers_total" ).text(Number(pers_total)); // update total persons
		
       $('.extraserv:checked').each(function(){
            total+=parseFloat($(this).val()*pers_total); // multiply checkbox value * total persons
       });
	   
       $('#room_total').text(total+',00'); // update the total
	   //console.log(total);
    });

	
});//doc ready


	/**********************************************************************
	 Wallet processing >> MUST be outside doc ready
	**********************************************************************/
	
	function addRpRoomtoWallet() {
	const data_wallet_room = $( ".configurator_box" ).closest('.Xcard').find('span.wallet-room').text(); // catch the room Name
	const data_wallet_rpname = $( ".configurator_box" ).closest('.rp_wrapper + *').prev().find('p.accom_rp_name').text(); // catch rateplan Name
	const data_wallet_id = $( ".configurator_box" ).closest('.rp_wrapper + *').prev().find('p.accom_rp_name').data("wallet-id"); // catch rateplan id
	const data_wallet_price = parseInt($('#room_total').text(), 10);
	const data_wallet_checkinout = $( ".configurator_box" ).find('.sumRoomTotal span.dayInCloned').text() + ' to ' + $( ".configurator_box" ).find('.sumRoomTotal span.dayOutCloned').text();
	const data_wallet_pers_total = $( ".configurator_box" ).find('.sumRoomTotal span.pers_total').text();
	
	//console.log();
	const data_wallet_row = '<div class="dterm m-0 p-0 fs-7 d-block">Golden Ipsum City Hotel</div><div class="m-0 p-0 fs-8 d-block">'+data_wallet_room+'</div><div class="m-0 p-0 fs-8 d-block">Rateplan: '+data_wallet_rpname+'</div><div class="m-0 p-0 fs-9 d-block">'+data_wallet_checkinout+'</div><div class="m-0 p-0 fs-9 d-block">Persons: '+data_wallet_pers_total+'</div>';
	
	cartLS.add({id: data_wallet_id, name: data_wallet_row, price: data_wallet_price, type: '<i class=\"ph ph-building fs-5\"></i>', day: day, month: month, date: searchParams.get('date')}); // date is not displayed in cart, butneeded for sorting
	$( ".mainWalletBtn" ).click(); //open wallet, animate click to button (top page)
	$( ".configurator_box" ).remove(); //remove configurator
	}