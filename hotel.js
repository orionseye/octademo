	const searchParams = new URLSearchParams(window.location.search); // globally available
	const qcurrency = searchParams.get('currency'); // globally available
	const qlang = searchParams.get('lang'); // globally available
	
	const date = new Date(searchParams.get('date'));
	const day = date.getDate();
	const weekday = date.toLocaleString("de-DE", { weekday: "short" });
	const month = date.toLocaleString('de-DE', { month: 'short' }); //use 'default' for EN
	const year = date.getFullYear();
	
	//for checkout date:
	const nights = searchParams.get('nights');                                 //make sure that it's a number, not string >> console.log(typeof nights) >> (in our case it's a string)
	const outdate = new Date( date.setDate(date.getDate() + Number(nights)) ); //that's why we need to convert to a number using 'Number'
	const outday = outdate.getDate();
	const outweekday = outdate.toLocaleString("de-DE", { weekday: "short" });
	const outmonth = outdate.toLocaleString('de-DE', { month: 'short' }); //use 'default' for EN
	const outyear = outdate.getFullYear();
	
$(function() {
	
	/**********************************************************************
	 Checkin/Checkout DATES visualization
	**********************************************************************/
	
	$('.ArrDate p span.Day').append(weekday);//Thu
	$('.ArrDate p span.theIn').append(day+' '+month+' '+year);//24 Oct 2024
	//console.log(date);
	
	$('.DepDate p span.Day').append(outweekday);//Thu
	$('.DepDate p span.theOut').append(outday+' '+outmonth+' '+outyear);//24 Oct 2024
	//console.log(new Date(outdate))
	
	/**********************************************************************
	 Calculate totals (toggle total) based on dates chosen..
	 we need this value later for Ajax configurator_box
	**********************************************************************/
	
	$( ".rp_wrapper" ).each(function() {
		const rate_pp = $( this ).find("span.pers_rate").text(); // cache rate per person
		//console.log(rate_pp);
		const rate_factor = (Number(nights)*2);               // get nights from 'const nights' and multiply by 2 persons (standard)
		const rate_total = parseInt(rate_pp, 10)*rate_factor; // make sure it's an integer and multiply by the result of (nights * 2 persons)
		$( this ).find( ".total_estimate span.ttal" ).text(rate_total);
		$( this ).find( "span.t_nights" ).text(Number(nights));
	});


	/**********************************************************************
	 MISC
	**********************************************************************/
	//a nice Toast message
	if (qcurrency || qlang) {
		$("#toast").removeClass('d-none');
		setTimeout(function(){ $("#toast").addClass('d-none'); }, 5000);
	}
	
});//doc ready