function storeRegister () {
	store.register({
	    id: config.inAppPro,
	    alias: "bygPro",
	    type: store.NON_CONSUMABLE
	});

	store.register({
	    id: config.inAppSalidas,
	    alias: "bygSalidas",
	    type: store.NON_CONSUMABLE
	});

	store.when("product").approved(function(product) {
		if (product.alias == "bygPro") {
			if(window.sessionStorage.getItem("purchase")=='true')
				vex.dialog.alert('Gracias por comprar Campos Pro! Disfruta de campos ilimitados y campos custom');
		    camposApproved();
		}
		if (product.alias == "bygSalidas") {
			if(window.sessionStorage.getItem("purchase")=='true')
				vex.dialog.alert('Gracias por comprar Salidas Pro! Ahora puedes seleccionar tee de salida por persona.');
			salidasApproved();
		}
	    product.finish();
	});

	store.when("product").updated(function(product) {
		if (product.alias == "bygPro") {
			if (product.owned){
				camposApproved();
			}
			else window.localStorage.setItem("betyaPro",false);
		}
		if (product.alias == "bygSalidas") {
			if (product.owned){
				salidasApproved();
			}
			else window.localStorage.setItem("salidasPro",false);
		}
	});

    store.when("product").owned(function(product) {
    	if (product.alias == "bygPro") {
    		camposApproved();
		}
		if (product.alias == "bygSalidas") {
			salidasApproved();
		}
    });

    //var product = store.get("bygPro");

	store.refresh();
}

function camposApproved() {
	window.localStorage.setItem("betyaPro",true);
	$('#addCustom').removeClass('byg-disabled');
	$('.addCampo').removeClass('byg-disabled');
}

function salidasApproved() {
	window.localStorage.setItem("salidasPro",true);
	$('.salidasSelect').removeClass('byg-disabled');
	$('select.salidasSelect').parent().off('touchstart mousedown');
}

function restoreStore(dialog) {
	var dial = $('.vex-content');	
	if (dialog) dial.find('.vex-dialog-message p').html('Restaurando...');
	store.refresh();
	if (dialog) store.once("product").updated(setTimeout(function(){ inAppView(dial); }, 1000));
	//setTimeout(function(){ inAppView(dial); }, 1000);
}

function inAppShow() {
	var dialog;
	dialog = vex.dialog.alert({
	    message: '<div style="font-size:large;text-align: center;border-bottom: 1px solid #203744;"><b>TIENDA</b></div><p style="font-size:medium;">Cargando...</p><br>',
	    showCloseButton: true,
	    onSubmit: function (event) {
			event.preventDefault(),
			event.stopPropagation();
	    },
	    buttons:[
	    $.extend({}, vex.dialog.buttons.YES, {
	    	className: 'okButton',
	    	text: 'Restaurar Compras',
	    	click: function($vexContent, event) {
	    		restoreStore(true);
	            //$vexContent.data().vex.value = true;
	            //vex.close($vexContent.data().vex.id);
	        }})/*,
	    $.extend({}, vex.dialog.buttons.NO, {
	    	className: 'simpleCancel',
	    	text: 'Cancelar',
	    	click: function($vexContent, event) {
	            vex.close($vexContent.data().vex.id);
	        }})*/
	    ],
	    callback: function(value) {
	        store.off(inAppView);
	    }
	});
    inAppView(dialog);
	store.when("product").updated(inAppView(dialog));
}

function inAppView(dialog) {
	console.log(dialog);
	if (dialog) {
		var $el = dialog.find('.vex-dialog-message p');
	    // Get the product from the pool.
		var products = [];
		//store.get("bygPro")
		products.push(store.get("bygPro"),store.get("bygSalidas")/*{title: 'derp', owned: false, alias: 'derpy'}*/);
		var inAppTable = "<table data-role=\"table\" data-mode=\"none\"><thead class=\"ui-body-b\" style=\"background-color:#434F5B\"><tr><th>Producto</th><th>Estado</th></tr></thead><tbody>";
		var inProducts = "";
		//var inProducts = "<tr><th>Campos Pro</th><th style=\"color:blue\">Disponible</th></tr>";
	    $(products).each(function(index, product) {
	    	var text = "";
		    if (!product) {
		    }
		    else if (product.state === store.REGISTERED) {}
		    else if (product.state === store.INVALID) {}
		    else {
		    	text +=  "<tr><th>" + product.title + "</th>";

		        if (product.owned)
		         	text += "<th style=\"color:#2AB573\">Comprado</th>";
		        else
		        	text += "<th><a data-role=\"button\" class=\"inAppBuy\"  alias=\""+product.alias+"\" style=\"background-color:#2AB573;color:white\">Comprar</a></th>";
		        text += "</tr>";
		    }

		    if (text != "") inProducts += text;
	    });
	    if (inProducts != "") {
	    	$el.off('click');
	    	$el.on('click', '.inAppBuy', function(event) {
	    		var product = $(this).attr("alias");
		        show(product);
	    	});

	    	inAppTable += inProducts + "</tbody></table>";
	    	$el.html(inAppTable).trigger('create');
	    	//$el.find('tbody, tbody th').css('border', '1px solid grey');
	    	//$el.find('thead, thead th').css('border', '1px solid black');
	    }
	    
	}
}

// method called when the screen showing your purchase is made visible
function show(alias) {
	//alert(alias);
	var dialog;
	dialog = vex.dialog.confirm({
	    message: '<div style="font-size:large;text-align: center;border-bottom: 1px solid #203744;"><b>In-App</b></div><p style="font-size:medium;">Cargando...</p><br>',
	    buttons:[
	    $.extend({}, vex.dialog.buttons.YES, {
	    	className: 'okButton',
	    	text: 'COMPRAR',
	    	click: function($vexContent, event) {
	            $vexContent.data().vex.value = true;
	            vex.close($vexContent.data().vex.id);
	        }}),
	    $.extend({}, vex.dialog.buttons.NO, {
	    	className: 'simpleCancel',
	    	text: 'Cancelar',
	    	click: function($vexContent, event) {
	            vex.close($vexContent.data().vex.id);
	        }})
	    ],
	    callback: function(value) {
	        window.console.log('Choice', value ? 'Continue' : 'Cancel');
	        value?comprarBYG(alias):'';
	        hide();
	    }
	});
    render(dialog, alias);
    store.when("product").updated(render(dialog, alias));
}

function render(dialog, alias) {
	if (dialog) {
		var $el = dialog.find('.vex-dialog-message p');
	    // Get the product from the pool.
	    var product = store.get(alias);

	    if (!product) {
	        $el.html("");
	    }
	    else if (product.state === store.REGISTERED) {
	        $el.html("Cargando...");
	    }
	    else if (product.state === store.INVALID) {
	        $el.html("");
	    }
	    else {
	    	var description = product.description;
	    	description = description.replace(/\-/g, '<br>-');
	        // Good! Product loaded and valid.
	        $el.html(
	              "<div><b>" 							+ product.title + "</b></div>"
	            + "<div>" 								+ description 	+ "</div><br>"
	            + "<div style=\"text-align:right\">" 	+ product.price + "</div>"
	        );

	        // Is this product owned? Give him a special class.
	        if (product.owned)
	            $el.addClass("owned");
	        else
	            $el.removeClass("owned");

	        // Is an order for this product in progress? Can't be ordered right now?
	        if (product.canPurchase)
	            $el.addClass("can-purchase");
	        else
	            $el.removeClass("can-purchase");
	    }
	}
}

// method called when the view is hidden
function hide() {
    // stop monitoring the product
    store.off(render);
}

function testShop() {
	var dialog;
	dialog = vex.dialog.confirm({
	    message: '<div style="font-size:large;text-align: center;border-bottom: 1px solid #203744;"><b>BETYAGOLF PRO</b></div><p style="font-size:medium;">Cargando...</p><br>',
	    buttons:[
	    $.extend({}, vex.dialog.buttons.YES, {
	    	className: 'okButton',
	    	text: 'CONTINUAR',
	    	click: function($vexContent, event) {
	            $vexContent.data().vex.value = true;
	            vex.close($vexContent.data().vex.id);
	        }}),
	    $.extend({}, vex.dialog.buttons.NO, {
	    	className: 'simpleCancel',
	    	text: 'Regresar',
	    	click: function($vexContent, event) {
	            vex.close($vexContent.data().vex.id);
	        }})
	    ],
	    callback: function(value) {
	        window.console.log('Choice', value ? 'Continue' : 'Cancel');
	        value?vex.dialog.alert('Success!'):'';
	    }
	});

	var text = dialog.find('.vex-dialog-message p').html();
	console.log(dialog);
	setTimeout(function() {
		dialog.find('.vex-dialog-message p').html('<h2>BetyaGolf Pro</h2><br>');
	},2000);
}

function comprarBYG(alias) {
	store.order(alias);
	window.sessionStorage.setItem("purchase",true);
}