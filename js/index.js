var content_loaded = false;
var page_loaded = true;
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
	if(state == 'fail'){
		content_loaded = false;
		return false;
	}
	return true;
};
function refreshHTML(){
	$('.content').html('<div class="refresh">Brak połączenia z internetem.<br /><br /><a href="#" onclick="refresh()" class="btn btn-primary" data-loading-text="SPRAWDZAM POŁĄCZENIE..." data-error-text="SPRÓBUJ PONOWNIE">ODŚWIEŻ</a></div>');
	$('.refresh').css({
		"margin-top": 20-($('.refresh').height() / 2)
	});
};
function loadingHTML(){
	$('.content > div').fadeOut("fast",function(){
		$('.content').html('<div class="loading"></div>');
	});
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
	loadingHTML();
	
	var interval = setInterval(function(){
		if(gotConnection()){
			var	c	= $('.content').attr('data-controller'),
				cc	= $('.content').attr('data-category'),
				p	= $('.content').attr('data-page'),
				s	= 'fv34rver54gsadv54ygaerfgg3ygdszrg3uyhysezrg3uyyhseryh7yhysehyj4';
			$.ajax({
				url: 'http://www.tvregionalna24.pl/app/app.php',
				type: 'GET',
				async: false,
				cache: false,
				data: {controller:c, category:cc, page:p, secret:s},
				dataType: 'json'
			}).done(function(response){
				if(c == 'articles' || c == 'companies' || c == 'ads')
					content_loaded = true;
				switch(response.type){
					case 'success':
						$('.content').html('<div class="response">' + response.message + '</div>');
						break;
					case 'info':
						$('.content').html('<div class="response">' + response.message + '</div>');
						break;
					case 'error':
						$('.content').html(response.message);
						$('.refresh').css({
							"margin-top": 20-($('.refresh').height() / 2)
						});
						break;
				}
			}).fail(function(){
				refreshHTML();
			}).always(function(){
				clearInterval(interval);
			});
		} else {
			refreshHTML();
		}
	}, 500);
};
function loadPage(){
	page_loaded = false;
	$('#page').addClass('relative').append('<div class="loading-page"></div>');
	var interval = setInterval(function(){
		if(gotConnection()){
			var	c	= $('.content').attr('data-controller'),
				cc	= $('.content').attr('data-category'),
				p	= $('.content').attr('data-page'),
				s	= 'fv34rver54gsadv54ygaerfgg3ygdszrg3uyhysezrg3uyyhseryh7yhysehyj4';
			$.ajax({
				url: 'http://www.tvregionalna24.pl/app/app.php',
				type: 'GET',
				async: false,
				cache: false,
				data: {controller:c, category:cc, page:p, secret:s},
				dataType: 'json'
			}).done(function(response){
				if(c == 'articles' || c == 'companies' || c == 'ads')
					content_loaded = true;
				switch(response.type){
					case 'success':
						$('.response').append(response.message);
						break;
					case 'info':
						$('.response').append(response.message);
						break;
					case 'error':
						$('.response').append('<div class="alert alert-danger">Nie udało się załadować zawartości.</div>');
						break;
				}
			}).fail(function(){
				refreshHTML();
			}).always(function(){
				clearInterval(interval);
				$('#page').removeClass('relative');
				$('.loading-page').remove();
				page_loaded = true;
			});
		} else {
			refreshHTML();
		}
	}, 500);
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
		//document.addEventListener("backbutton", function (e) {
            //e.preventDefault();
        //}, false );
    }
};
$(document).ready(function(){
	if(gotConnection()){
		loadContent();
	} else {
		refreshHTML();
	}
	
	$(window).on('hashchange', function() {
		var h = window.location.hash.substr(1);
		if(typeof h != 'undefined' && h != '' && h != 'menu'){
			$('.content').attr({
				'data-controller':h,
				'data-category':''
			});
			if(h.indexOf('/') >= 0){
				var s = h.split("/");
				$('.content').attr({
					'data-controller':s[0],
					'data-category':s[1]
				});
			}
			loadContent();
		}
	});
	
	$(window).scroll(function(){
		var	c	= $('.content').attr('data-controller');
		if((c == 'articles' || c == 'companies' || c == 'ads') && content_loaded && ($(window).scrollTop() == ($(document).height() - $(window).height())) && page_loaded){
			var p = parseInt($('.content').attr('data-page')) + 1;
			$('.content').attr('data-page', p);
			loadPage();
		}
	});
});