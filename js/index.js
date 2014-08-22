function checkConnection() {
	if(typeof navigator.connection == 'undefined' || typeof navigator.connection.type == 'undefined') {
	return 'fail';
	}
	var networkState = navigator.connection.type;
	var states = {};
	states[Connection.UNKNOWN]  = 'Unknown connection';
	states[Connection.ETHERNET] = 'Ethernet connection';
	states[Connection.WIFI]     = 'WiFi connection';
	states[Connection.CELL_2G]  = 'Cell 2G connection';
	states[Connection.CELL_3G]  = 'Cell 3G connection';
	states[Connection.CELL_4G]  = 'Cell 4G connection';
	states[Connection.CELL]     = 'Cell generic connection';
	states[Connection.NONE]     = 'fail';
	return states[networkState];
};
function gotConnection(){
	var state = checkConnection();
	if(state == 'fail'){return false;}
	return true;
};
function refreshHTML(){
	$('.content').html('<div class="refresh">Brak połączenia z internetem.<br /><br /><a href="#" onclick="refresh()" class="btn btn-primary" data-loading-text="SPRAWDZAM POŁĄCZENIE..." data-error-text="SPRÓBUJ PONOWNIE">ODŚWIEŻ</a></div>');
};
function loadingHTML(){
	$('.content').html('<div class="loading"></div>');
};
function refresh(){
	$(".refresh .btn").button('loading');
	if(gotConnection()){
		$(".refresh").fadeOut("fast",function(){
			loadContent();
		});
	} else {
		$(".refresh .btn").button('error');
	}
};
function loadContent(){
	$('.content > div').fadeOut("fast",function(){
		loadingHTML();
		var c = $('.content').attr('data-controller');
		var s = 'fv34rver54gsadv54ygaerfgg3ygdszrg3uyhysezrg3uyyhseryh7yhysehyj4';
		$.ajax({
			url: 'http://www.tvregionalna24.pl/app/app.php',
			type: 'GET',
			async: false,
			cache: false,
			data: {controller:c, secret:s},
			dataType: 'json',
			success: function(response){
				console.log(response);
				
				switch(response.type){
					case 'success':
						
						break;
					case 'error':
						$('.content').html(response.message);
						break;
				}
				/*
				$(".loading").fadeOut("fast",function(){
					$.each(response.items,function(i,item){
						
					});
				});
				*/
			},
			error: function(){
				refreshHTML();
			}
		});
	});
};
var app = {
    initialize:function(){
        this.bindEvents();
    },
    bindEvents:function(){
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady:function(){
        FastClick.attach(document.body);
    }
};
$(document).ready(function(){
	if(gotConnection()){
		loadContent();
	} else {
		refreshHTML();
	}
});