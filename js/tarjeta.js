function tarjetaActivos(comienzo, fillCard) {
	db.transaction(function(transaction) {
	var campName = "";
	var IdActive = 0;
	var pares = '';
	transaction.executeSql('SELECT * FROM CampoTee WHERE active = 1', [], function(transaction, result){
		if (result != null && result.rows != null) {
		  for (var i = 0; i < result.rows.length; i++) {
			campName = result.rows.item(i).color.charAt(0).toUpperCase() + result.rows.item(i).color.slice(1);
			IdActive = result.rows.item(i).idTee;
			window.console.log('nombre '+ campName+' Id '+ IdActive);
			}
		}
	var temp = comienzo;
	var rondaUno = 1;
	var rondaDos = 2;
	if (temp>1){
		rondaUno = 2;
		rondaDos = 1;
	}

	var classA = 'class="hiddenA"';
	var classB = 'class="hiddenB"';
	transaction.executeSql('SELECT * FROM CampoPar WHERE teeId = ? ORDER BY Hoyo ASC', [IdActive],
	 function(transaction, result) {
	  if (result != null && result.rows != null) {
	  	$('#tarJug').html('');
	  	var tarjeta = '<thead class="ui-body-b"><tr><th>Jugadores</th><th class="hiddenA">Hoyo 1</th><th class="hiddenA">Hoyo 2</th><th class="hiddenA">Hoyo 3</th><th class="hiddenA">Hoyo 4</th><th class="hiddenA">Hoyo 5</th><th class="hiddenA">Hoyo 6</th><th class="hiddenA">Hoyo 7</th><th class="hiddenA">Hoyo 8</th><th class="hiddenA">Hoyo 9</th><th class="hiddenA">Ronda '+rondaUno+'</th><th class="hiddenB">Hoyo 10</th><th class="hiddenB">Hoyo 11</th><th class="hiddenB">Hoyo 12</th><th class="hiddenB">Hoyo 13</th><th class="hiddenB">Hoyo 14</th><th class="hiddenB">Hoyo 15</th><th class="hiddenB">Hoyo 16</th><th class="hiddenB">Hoyo 17</th><th class="hiddenB">Hoyo 18</th><th class="hiddenB">Ronda '+rondaDos+'</th></tr>';
	  	var classer = classA;
	  	pares += '<tr><td>'+campName+'</td>';
	  	for (var i = 0; i <result.rows.length; i++) {
		 	var row = result.rows.item(i);
			pares += '<td '+classer+'>Par '+row.Par+'</td>';
			if(i==8){
				pares += '<td '+classer+'></td>';
				classer = classB;
			}

		}
		pares += '<td class="hiddenB"></td></tr>';
		$('#tarJug').append(tarjeta+'</thead>');
	  }

	   transaction.executeSql('SELECT * FROM jugadores, equipos WHERE jugadores.UserId = equipos.jugadorId ORDER BY equipos.numEquipo ASC, equipos.numPareja ASC', [],
	 function(transaction, result) {
	  if (result != null && result.rows != null) {
	  	var playersTarjeta = '<tbody>'+pares;
		for (var i = 0; i < result.rows.length; i++) {
			classer = classA;
		 var row = result.rows.item(i);
		 //playersTarjeta += '<tr>';
		 playersTarjeta += '<tr><td style="vertical-align: middle">'+row.FirstName+' '+row.LastName+'</td>';
		for(j=1;j<=18;j++){
			playersTarjeta += '<td '+classer+'><input name="hoyos'+row.UserId+'" id="'+j+'" type="tel" style="width:91%"/></td>';
			if(j==9){
				playersTarjeta += '<td '+classer+'><span id="nueve'+row.UserId+'"><b>0</b></span></td>';
				classer = classB;
			}
		}
			playersTarjeta += '<td class="hiddenB"><span id="diocho'+row.UserId+'"><b>0</b></span></td></tr>';

	}
		//$('#tarPla').html(tarPlayers).trigger('create');
		$('#tarJug').append(playersTarjeta+'</tbody>').trigger('create');
		window.sessionStorage.setItem("Hoyos", temp);
		if (temp==1){
			addHiddenB();
			removeHiddenA();
		} else{
			addHiddenA();
			removeHiddenB();
		}

		//$('input').off();
		//$("#tbHoyos input:visible[name^='hoyos']").off();
		tarChecks();
		if (fillCard)
			refillCard();
	  }
	 },errorHandler);
	 },errorHandler);


	}, errorHandler);
	},errorHandler,nullHandler);

 return;
}

function addHiddenA() {
	$('#tbHoyos').find('.hiddenA').addClass('hidden');
}

function removeHiddenA() {
	$('#tbHoyos').find('.hiddenA').removeClass('hidden');
}
function addHiddenB() {
	$('#tbHoyos').find('.hiddenB').addClass('hidden');
}

function removeHiddenB() {
	$('#tbHoyos').find('.hiddenB').removeClass('hidden');
}

function tarChecks() {
	$( window ).on( "orientationchange", function( event ) {
		$('#tbHoyos').find('.fht-fixed-body').css('width', '100%');
	//$('#tarJug').css('width', '100%');
	});

	//var checkFixer = false;
	$(document).one('pageshow', '#page11', function(e){
		// console.log('Fixer', checkFixer);
		// if (!checkFixer) {
		// 	checkFixer = true;
			setTimeout(function(){
			var x = '';
			$('#tarJug').fixedHeaderTable({ footer: false, cloneHeadToFoot: false, fixedColumn: true, fixedColumns: 1, create: function() {
			x = $('.fht-table').css('padding').replace('px', '');
			//console.log(x);
			setTimeout(function(){ changeHeight('#tbHoyos',x); }, 0);
			$('#tbHoyos').find('.fht-table-wrapper > .fht-fixed-body > .fht-thead').remove();
			$('#tarJug').css('margin-top', '');
			$('#tarJug').find('thead tr th:not(:first)').css({
				padding: '5px'/*,
				border: '1px solid black'*/
			});
			var checkIOS = false;
			if (typeof device !== 'undefined') {
			    var devicePlatform = device.platform;
				if (devicePlatform == 'iOS') {
					checkIOS = true;
					$('#tbHoyos').perfectScrollbar();
					$('.ps-scrollbar-y-rail').css('display', 'none');
					/*var $table = $('#tarJug');
					$table.floatThead({
						zIndex:0,
					    scrollContainer: function($table){
					    	var parenting = $('#tarJug').parent().parent();
					    	console.log(parenting);
					        return $('.tbWrapper');
					    }
					});*/
				}
			}
			if (!checkIOS) {
				//var $table = $('#tarJug');
				//$table.floatThead({zIndex:0});
				/*$table.floatThead({
					zIndex:0,
				    scrollContainer: function($table){
				    	var parenting = $('#tarJug').parent().parent();
				    	console.log(parenting);
				        return $('.tbWrapper');
				    }
				});*/

			}
			tarIns();
			} });
			},5);
		// }
		// else{
		// 	$('#page11').off('click, focus', 'input', tarIns());
		// }
	$(document).on('pageshow', '#page11', function(e){
		tarIns()
		//$('#page11').off('click, focus', 'input', tarIns());
	});
	});

	$(document).on('pageshow', '#page16', function(e){
		$('#tarFinal').find('tbody tr:first td:nth-child(2)').velocity('scroll',{duration: 400, offset: -120, container: $('#tarFinal').parent('.fht-tbody'), axis: "x"});
		$( window ).on( "orientationchange", function( event ) {
		$('#tbFinal').find('.fht-table-wrapper, .fht-fixed-body').css('width', '100%');
		//$('#tarFinal').css('width', '100%');
		});
	});
}

function changeHeight (elem ,x) {

	/*
	.fht-table, .fht-table thead, .fht-table tfoot, .fht-table tbody, .fht-table tr, .fht-table th, .fht-table td
	*/
	//console.log('Esto es X!',x);
	/*$(elem).find('.fht-table, .fht-table thead, .fht-table tfoot, .fht-table tbody, .fht-table tr, .fht-table th, .fht-table td').css({
		'padding-top': x*1,
		'padding-right': x*1,
		'padding-left': x*1
	});*/
	var thHeight = $(elem).find('.fht-fixed-column .fht-thead th').css('height').replace('px', '');
	$(elem).find('.fht-table-wrapper .fht-default').css({
		'height':''
	});
	$(elem).find('.fht-thead td, .fht-thead tr, .fht-thead th').css({
		'padding': x*1 + .5
	});
	$(elem).find('.fht-table td').css({
		'padding': '4.5px'
	});
	$(elem).find('.fht-fixed-body .fht-tbody, .fht-fixed-column .fht-tbody').css({
		height: '100%',
		'margin-right': '-1px'
	});
	$(elem).find('.fht-fixed-column .fht-tbody').css({
		height: '',
		'padding': ''
	});
	$(elem).find('.fht-fixed-column .fht-thead th').css({
		color: '#fff',
		'text-shadow': ' 0 1px 0 #111',
		border: '1px solid black',
		'border-right': 'none',
		height: thHeight*1 - 3
	});
}

function tarIns(){
	setTimeout(function() { 
		console.log('First Focus');
	var tempNum = $('#tarJug').find(':input:visible');
	console.log(tempNum.eq(0));
	tempNum.eq(0).focus();	}, 100);
	$('#page11').off("focus", 'input');
	$('#page11 input').off('input');
	$("#page11 #tbHoyos input:visible[name^='hoyos']").off('input');

	hidePanel();

/*	$(document).on('blur', 'input, textarea', function() {
		setTimeout(function() {
			var scrollTop = $(window).scrollTop();
		     $(window).scrollTop(scrollTop);
		}, 0);
	});*/
	var tarEdit = window.sessionStorage.getItem("edit");
	var modifier = 9;
	if(tarEdit) modifier*=2;
	var endModifier = modifier - 3;
	console.log('modificadores', modifier, endModifier);
	/*var firstBlur = true;
	$('#page11 input').one('blur', function(event) {
		if (firstBlur) $(event.target).focus();
	});*/
	/*$('#tbHoyos').attr('winAlt', $(window).outerHeight());
	$('#page11 input').on('blur', function(event) {
		setTimeout(function(){
			console.log($(':focus').length==0);
			if ($(':focus').length==0) {
				console.log('Blur');
				keyboardHideHandler();
			};
	    },500);
	});*/
	$('#page11').on("focus", 'input', function(ev) {
		//keyboardShowHandler();
		//$('#tarJug').parent('.fht-tbody').stop();
		var indexNum = $('#tarJug').find(':input:visible');
		var checkType = indexNum.eq(indexNum.index(this)+1).is( "input" );
		var checkIndex = indexNum.index(this);
			while(checkIndex>modifier) checkIndex-=modifier;
			//console.log(checkIndex);
			if (checkIndex > endModifier && checkIndex < modifier) {
				/*$('#tarJug').parent('.fht-tbody').animate({
				scrollLeft: $('#tarJug').parent('.fht-tbody').scrollLeft() + $(window).width(),
				}, 800);*/
				$('#tarJug').find('tbody tr:first td:last').velocity('scroll',{duration: 400, offset: 100, container: $('#tarJug').parent(), axis: "x"});
				/*$(checkIndex).velocity('scroll',{duration: 400, offset: 9999, container: $('#tarJug').parent('.fht-tbody'), axis: "x"});*/
			} else{
				if (checkType) {
					var checkVisible = indexNum.eq(indexNum.index(this)+1).visible( false, false );
					//console.log('siguiente visible?', checkVisible);
					if (!checkVisible){
						console.log('scroll!?');
						$(this).velocity('scroll',{duration: 400, offset: -120, container: $('#tarJug').parent(), axis: "x"});

						/*$('#tarJug').parent('.fht-tbody').animate({
						scrollLeft: $('#tarJug').parent('.fht-tbody').scrollLeft() + 100
						}, 400);*/
					}
				}
			}
	});
	window.console.log('tarIns activado!');
	$('#page11 input').on('input', function(e){
		this.value = this.value.replace(/\D/g,'');
	});
	var ignoreInput = false;
	$("#page11 #tbHoyos input:visible[name^='hoyos']").on('input', function(){
		if (ignoreInput) {
			if ($(this).val().length==2){
				var valued = $(this).val();
				if (valued<20){
					valued = valued.slice(0,2);
				} else{
					valued = valued.slice(0,1);
				}
				$(this).val(valued);
			}
			if($(this).val().length>2){
				var valued = $(this).val();
				valued = valued.slice(0,2);
				$(this).val(valued);
			}
			return;
		} else{
		var tarEdit = window.sessionStorage.getItem("edit");
		modifier = 9;
		if(tarEdit) modifier*=2;
		var indexNum = $('#tarJug').find(':input:visible');
		window.console.log(indexNum.index(this),$(this).val());
		//$('#tarJug').parent('.fht-tbody').stop();
		var modularScroll = false;
		var checkType = indexNum.eq(indexNum.index(this)+1).is( "input" );
		var nextIndex = (indexNum.index(this)+1);
		if (checkType && nextIndex % modifier == 0) {
			console.log('siguiente input modular!', nextIndex, modifier);
			modularScroll = true;
		}
		if(($(this).val().length == 1 && $(this).val()!=1) || $(this).val().length>=2){
				if(modularScroll){
					console.log('modular');
					/*$('body').animate({
					scrollTop: $('body').scrollTop() + 50
				}, {duration: 300, queue: false});
					$('#tarJug').parent('.fht-tbody').animate({
					scrollLeft: $(indexNum.eq(indexNum.index(this)+1)).offset().left
				}, {duration: 300, queue: false});
					setTimeout(function(){ indexNum.eq(nextIndex).focus(); }, 300);*/
					$('#tarJug').find('tbody tr:first td:last').velocity('stop', true);
					ignoreInput = true;
					//indexNum.eq(indexNum.index(this)).blur();
					$('#tarJug').find('tbody tr:first td:first').velocity('scroll',{duration: 300, offset: -1000, container: $('#tarJug').parent(), axis: "x", complete: function() {
						ignoreInput = false;
						console.log('done?');
						indexNum.eq(nextIndex).focus();
						$('#tarJug').find('tbody tr:first td:last').velocity('stop', true);
						indexNum.eq(nextIndex).velocity("scroll", { container: $("#tbHoyos"), offset: -50 } );
						/*var check = $(':focus').attr('id')==indexNum.eq(nextIndex).attr('id');
						console.log('Same input?', check);
						if (!check) indexNum.eq(nextIndex).focus();*/
					}});
					/*indexNum.eq(nextIndex).velocity('scroll',{duration: 300, container: $('#tarJug').parent().parent(), axis: "x", queue: false, complete: function() {
						console.log('done?');
						indexNum.eq(nextIndex).focus();
						ignoreInput = false;
					}});*/
					//.velocity('scroll',{duration: 300, offset: 0, container: $('body'), queue: false})
				}
				else{
					//console.log('this should happen', indexNum.eq(nextIndex).attr('id'));
					indexNum.eq(nextIndex).focus();
					//console.log($(':focus').attr('id'));
					/*var check = $(':focus').attr('id')==indexNum.eq(nextIndex).attr('id');
					console.log('Same input?', check);
					if (!check) indexNum.eq(nextIndex).focus();*/
				}
		}

		db.transaction(function(transaction) {
		   transaction.executeSql('SELECT * FROM jugadores', [],
			 function(transaction, result) {
			  if (result != null && result.rows != null) {
				for (var i = 0; i < result.rows.length; i++) {
					var row = result.rows.item(i);
					var mySelection = $("input[name='hoyos"+row.UserId+"']");
					if(mySelection.length > 0){
						//var sum = 0;
						var sum9 = 0;
						var sum18 = 0;
						mySelection.each(function() {
							if($(this).val() !== ""){
								if ($(this).val().length==2){
									var valued = $(this).val();
									if (valued<20){
										valued = valued.slice(0,2);
									} else{
										valued = valued.slice(0,1);
									}
									$(this).val(valued);
								}
								if($(this).val().length>2){
									var valued = $(this).val();
									valued = valued.slice(0,2);
									$(this).val(valued);
								}
								if(parseFloat($(this).attr('id'))<=9){
									sum9 += parseFloat($(this).val());
									//sum += parseFloat($(this).val());
								}
								else{
									sum18 += parseFloat($(this).val());
									//sum += parseFloat($(this).val());
								}
							}
						});
					}
					$('#nueve'+row.UserId+'').html('<b>'+sum9+'</b>');
					$('#diocho'+row.UserId+'').html('<b>'+sum18+'</b>');
					/* $('#total'+row.UserId+'').html('<p style="text-align: center;"><b>'+sum+'</b></p>'); */
				}
			  }
			 },errorHandler);
		},errorHandler,nullHandler);
		return;
		}
	});
}

function tarjetaReview(){
	 db.transaction(function(transaction) {
	 	doQuery(transaction, 'SELECT * FROM jugadores, equipos WHERE jugadores.UserId = equipos.jugadorId ORDER BY equipos.numEquipo ASC, equipos.numPareja ASC', [],
		function(transaction, result) {
				var temp = window.sessionStorage.getItem("Hoyos");
				var rondaNumber = window.sessionStorage.getItem("Ronda");
				window.console.log('ronda = '+rondaNumber);
				if(rondaNumber == null){
				window.sessionStorage.removeItem("Error");
				window.console.log('primera ronda puede borrar tabla score');
				transaction.executeSql('DROP TABLE IF EXISTS Scores');
				transaction.executeSql('CREATE TABLE IF NOT EXISTS Scores(ScoreId INTEGER NOT NULL PRIMARY KEY, IdJugador INTEGER NOT NULL, Hoyo INTEGER NOT NULL, ScoreHoyo INTEGER NOT NULL)',[],nullHandler,errorHandler);
				window.console.log('Primera Ronda!');
				rondaNumber = 1;
				}
				else{
					var errorCheck = window.sessionStorage.getItem("Error");
					var checkEdit = window.sessionStorage.getItem("edit");
					window.console.log('se checa si es la primera vez '+ errorCheck+' '+checkEdit);
					if(errorCheck!=null || checkEdit){
						var hiddenInputs = $("input:hidden[name^='hoyos']").length;
						window.console.log('Hidden? '+hiddenInputs);
						if (hiddenInputs>0){
							var ultimo = parseFloat(temp)+8;
							window.console.log('Se Borra informacion Previa');
							transaction.executeSql('DELETE FROM Scores WHERE Hoyo BETWEEN ? AND ?', [temp,ultimo], nullHandler,errorHandler);
						} else{
							transaction.executeSql('DELETE FROM Scores',[],nullHandler,errorHandler);
						}
						window.sessionStorage.removeItem("Error");
					}
				}
				var inicio = temp-1;
				var fin = temp+8;
				var numbHoyo = temp;
		  if (result != null && result.rows != null) {
			var message = "";
			var message2 = "";
			var what = 0;
			for (var i = 0; i < result.rows.length; i++) {
				what = i;
				var row = result.rows.item(i);
				var EarlyCheck = 'YES';
				var earlyJ = false;
				if(row.Early == EarlyCheck){
					earlyJ = true;
				}
				var checkSelection = $("input:visible[name='hoyos"+row.UserId+"']");
				var arrayt = [];
				checkSelection.each(function(){
					if(parseFloat($(this).attr('id'))>=temp){
						if(parseFloat($(this).attr('id'))<=fin){
							if($(this).val() == ""){
								arrayt.push(0);
							}
						}
					}
				});
				if(arrayt.length==9){
					if(rondaNumber==2){
						if(earlyJ!=true){
							vex.dialog.confirm({
								message: '<div style="font-size:large;text-align: center;border-bottom: 1px solid #203744;"><b>'+row.FirstName+' '+row.LastName+'</b></div><p style="font-size:medium;">Va a jugar los 18 hoyos?</p>',
								buttons:[
								$.extend({}, vex.dialog.buttons.YES, {
								className: 'okButton',
								text: 'SI',
								click: function($vexContent, event) {
								$vexContent.data().vex.value = true;
								vex.close($vexContent.data().vex.id);
								}}),
								$.extend({}, vex.dialog.buttons.NO, {
								className: 'simpleCancel',
								text: 'No',
								click: function($vexContent, event) {
								vex.close($vexContent.data().vex.id);
								}})
								],
								callback: function(value) {
									window.console.log('Choice', value ? 'Continue' : 'Cancel');
									if (value) {
										window.console.log('tendra que llenar los espacios');
										vex.dialog.alert('Favor de llenar el score de <br>'+row.FirstName+' '+row.LastName);
									} else {
										window.console.log('se ignoran los espacios de 10 en adelante.');
										earlyJ = true;
										updateEarly(row.UserId);
									}
								}
							});
							return;
						}
					}
				}
				var mySelection = $("input:visible[name='hoyos"+row.UserId+"']");
				if(mySelection.length > 0){
					var sum = 0;
					var sum9 = 0;
					var sum18 = 0;
					var errorRep = window.sessionStorage.getItem("Error");
					mySelection.each(function() {
						if($(this).val() == ""){
							if(!earlyJ){
								window.sessionStorage.setItem("Error", 1);
								errorRep = window.sessionStorage.getItem("Error");
								window.console.log('error?'+ errorRep);
								message += 'Hoyo '+$(this).attr('id')+' de '+row.FirstName+' '+row.LastName+'<br>';
								return false;
							}
						}
						else{
							if(parseFloat($(this).val()) <0){
								if(message2 != ""){
									window.sessionStorage.setItem("Error", 1);
									errorRep = window.sessionStorage.getItem("Error");
									window.console.log('error?'+ errorRep);
									return false;
								}
								else{
								window.sessionStorage.setItem("Error", 1);
								errorRep = window.sessionStorage.getItem("Error");
								window.console.log('error?'+ errorRep);
								message2 += 'ERROR: No puede haber valores negativos'+'<br>'+'Favor de Corregir Hoyo '+$(this).attr('id')+' de '+row.FirstName+' '+row.LastName;
								return false;
								}
							}
							if(parseFloat($(this).attr('id'))<=9){
									sum9 += parseFloat($(this).val());
									sum += parseFloat($(this).val());
							}
							else{
									sum18 += parseFloat($(this).val());
									sum += parseFloat($(this).val());
							}
						}
						var score = 0;
							if($(this).val() != ""){
								score = parseFloat($(this).val());
							}
							doQuery(transaction, 'INSERT INTO Scores (IdJugador, Hoyo, ScoreHoyo) VALUES (?, ?, ?)', [row.UserId, parseFloat($(this).attr('id')), score], nullHandler);

					});
					window.console.log(row.FirstName+' '+row.LastName+' \nTotal: '+sum);
				}
			}
			if(message2 != ""){
				message = "";
				vex.dialog.alert(message2);
				//return;
			}
			if(message != ""){
				message = "Favor de llenar"+'<br>'+ message;
				vex.dialog.alert(message);
				//return;
			}
		  }
		  /* $('input').off();
		  $("#tbHoyos").off(); */
		  if (message != "" || message2 != "") {
		  	window.console.log('Hubo Error');
		  	return;
		  }
		  ListDBTarjeta();
		  var saldo = window.sessionStorage.getItem("Saldos");
		  if (saldo !== 'true')
		  	$("body").pagecontainer("change", "#page16");
		  $('#disNext').addClass('ui-state-disabled');
		});
	},errorHandler,nullHandler);
}

function updateEarly(user) {db.transaction(function(transaction) {
	transaction.executeSql('UPDATE jugadores SET Early = ? Where UserId= ?', ['YES',user]);
	tarjetaReview();
},errorHandler,nullHandler);}

 function ListDBTarjeta(restorer){
	db.transaction(function(transaction) {
		doQuery(transaction, 'SELECT * FROM jugadores, equipos WHERE jugadores.UserId = equipos.jugadorId ORDER BY equipos.numEquipo ASC, equipos.numPareja ASC', [],
		function(transaction, result) {
		if (result != null && result.rows != null) {
			var temp = window.sessionStorage.getItem("Hoyos"), rondaNumber = window.sessionStorage.getItem("Ronda"), arrayRows = [];
			var dateGame = new Date();
			var ronder = rondaNumber==2?2:1;
			if (restorer && (rondaNumber==2)) {
				temp = temp==1?10:1;
				window.sessionStorage.setItem("Hoyos", temp);
			}
			if (!restorer) {
				console.log('Se inserta hoyo', temp, 'Ronda', ronder);
				doQuery(transaction, 'INSERT INTO restoreGame (ronda, hoyoInicio, fecha) VALUES (?, ?, ?)',[ronder, temp, dateGame.getTime()], nullHandler);
			};
			for (var i = 0; i < result.rows.length; i++) {
				arrayRows.push(result.rows.item(i));
			}
			$('#tarFinal').html('');
			var tarString = '', numbHoyo = temp, inicio = temp-1, fin = temp+8, limiteRonda, checkRonda = false;
			if(rondaNumber == null){
				limiteRonda = 9;
			tarString +='<thead class="ui-body-b"><tr><th>Jugadores</th><th>Hoyo '+(numbHoyo++)+'</th><th>Hoyo '+(numbHoyo++)+'</th><th>Hoyo '+(numbHoyo++)+'</th><th>Hoyo '+(numbHoyo++)+'</th><th>Hoyo '+(numbHoyo++)+'</th><th>Hoyo '+(numbHoyo++)+'</th><th>Hoyo '+(numbHoyo++)+'</th><th>Hoyo '+(numbHoyo++)+'</th><th>Hoyo '+(numbHoyo++)+'</th><th>Ronda 1</th></tr></thead><tbody>';
			}
			else{
				var rond1 = 1, rond2 = 2;
				if (temp==1){
					rond1 = 2;
					rond2 = 1;
				}
				limiteRonda = 18;
				checkRonda = true;
				tarString += '<thead class="ui-body-b"><tr><th>Jugadores</th><th>Hoyo 1</th><th>Hoyo 2</th><th>Hoyo 3</th><th>Hoyo 4</th><th>Hoyo 5</th><th>Hoyo 6</th><th>Hoyo 7</th><th>Hoyo 8</th><th>Hoyo 9</th><th>Ronda '+rond1+'</th><th>Hoyo 10</th><th>Hoyo 11</th><th>Hoyo 12</th><th>Hoyo 13</th><th>Hoyo 14</th><th>Hoyo 15</th><th>Hoyo 16</th><th>Hoyo 17</th><th>Hoyo 18</th><th>Ronda '+rond2+'</th><th>Total</th></tr></thead><tbody>';
			}
			doQuery(transaction, 'SELECT * FROM Scores ORDER BY IdJugador ASC, Hoyo ASC', [],
	function(transaction, result) {
	for (var index = 0; index < arrayRows.length; index++) {
		var sum9 = 0, sum18 = 0, name = arrayRows[index].FirstName+' '+arrayRows[index].LastName, county = 0, rowCount = 0;
		tarString += '<tr><td><b>'+name+'</b></td>';
		while (county < limiteRonda && rowCount < result.rows.length) {
			var row = result.rows.item(rowCount);
			if(arrayRows[index].UserId == row.IdJugador){
				var hScore = row.ScoreHoyo;
				if(county<=8){
					sum9 += hScore;
				}
				if(county>8){
					sum18 += hScore;
				}
				tarString += '<td><b>'+hScore+'</b></td>';
				if(county==8){
					tarString += '<td><b>'+sum9+'</b></td>';
				}
				county++;
			}
			rowCount++;
		}
		if (checkRonda) {
			tarString += '<td><b>'+sum18+'</b></td><td><b>'+(sum9+sum18)+'</b></td>';
		}
		tarString += '</tr>';
	}
	$('#tarFinal').append(tarString+'</tbody>');
	$('#tarFinal').fixedHeaderTable('destroy');
	//var checkFixerRes = false;
	$(document).one('pageshow', '#page16', function(e, data){
		// var previous = data.prevPage.attr('id');
		// console.log('FixerRes', checkFixerRes, previous);

		// if ((previous == 'page11') || (previous == 'page1')) {
		// 	checkFixerRes = true;
			setTimeout(function(){
				$('#tarFinal').fixedHeaderTable({ footer: false, cloneHeadToFoot: false, fixedColumn: true, fixedColumns: 1, create: function() {
					setTimeout(function(){ changeHeight('#tbFinal',5); }, 10);
				}
				});
				$('#tbFinal').find('.fht-table-wrapper > .fht-fixed-body > .fht-thead').remove();
				$('#tarFinal').css('margin-top', '');
				$('#tarFinal').find('thead tr th:not(:first)').css({
				padding: '5px'/*,
				border: '1px solid black'*/
				});
			},1);
		// }
		// if (checkFixerRes) {
		// 	$('#tarFinal').parent('.fht-tbody').stop();
		// 	$('#tarFinal').parent('.fht-tbody').animate({
		// 		scrollLeft: 0,
		// 		}, 400);
		// };
	});
	showPanel();
	$("#globalAps").addClass('hidden');
	var hiddenInputs = $("input:hidden[name^='hoyos']").length;
	window.console.log('HIDDEN? '+hiddenInputs);
	var checkEdit = window.sessionStorage.getItem("edit");
	window.console.log('Edit?',checkEdit);
	//alert('To presionParejas, presionIndividual');
	if (!checkEdit){
		presionParejas();
		presionIndividual();
	} else{
		window.console.log('\nEdit completo!\n');
		var tempOut = window.sessionStorage.getItem("Hoyos");
		window.console.log('Hoyos',tempOut);
		if (tempOut==10){
			window.sessionStorage.setItem("Hoyos", 1);
			window.sessionStorage.removeItem("Ronda");
			presionParejas();
			presionIndividual();
		} else{
			window.sessionStorage.setItem("Hoyos", 10);
			window.sessionStorage.removeItem("Ronda");
			presionParejas();
			presionIndividual();
		}
	}
	});
		}
		});
	},errorHandler,nullHandler);
}

function refillCard() { db.transaction(function(transaction) {
	console.log('Empezamos');
	transaction.executeSql('SELECT * FROM Scores ORDER BY IdJugador ASC, Hoyo ASC', [],
	function(transaction, result) {
		for (var i = 0; i < result.rows.length; i++) {
			var row = result.rows.item(i);
			console.log('Refill', row.IdJugador, row.Hoyo);
			$("input[id="+row.Hoyo+"][name='hoyos"+row.IdJugador+"']").val(row.ScoreHoyo);
		}
	},errorHandler);
},errorHandler,nullHandler); }

function deletePresion() {
	//$('#page16').scrollTop( 0 );
	window.console.log('Back!');
	$('#backRev').addClass('hidden');
	db.transaction(function(transaction) {
		var rondaNumber = window.sessionStorage.getItem("Ronda");
		window.console.log('ronda = '+rondaNumber);
		if(rondaNumber == null){
		transaction.executeSql('DELETE FROM presionIndividual WHERE Ronda = ?', [1], nullHandler,errorHandler);
		transaction.executeSql('DELETE FROM presionParejas WHERE Ronda = ?', [1], nullHandler,nullHandler);
		transaction.executeSql('DELETE FROM stepIndividual WHERE Ronda = ?', [1], nullHandler,nullHandler);
		transaction.executeSql('DELETE FROM stepParejas WHERE Ronda = ?', [1], nullHandler,nullHandler);
		}
		else{
			window.sessionStorage.setItem("edit", true);
			removeHiddenA();
			removeHiddenB();
			transaction.executeSql('DELETE FROM presionIndividual', [], nullHandler,errorHandler);
			transaction.executeSql('DELETE FROM presionParejas', [], nullHandler,nullHandler);
			transaction.executeSql('DELETE FROM stepIndividual', [], nullHandler,nullHandler);
			transaction.executeSql('DELETE FROM stepParejas', [], nullHandler,nullHandler);
		}
	},nullHandler,nullHandler);
}

function finDeJuego(){ db.transaction(function(transaction) {
	//$('#page16').scrollTop( 0 );
	var temp = window.sessionStorage.getItem("Hoyos");
	var rondaNumber = window.sessionStorage.getItem("Ronda");
	if(rondaNumber==2){
		vex.dialog.confirm({
			message: '<div style="font-size:large;text-align: center;border-bottom: 1px solid #203744;"><b>ULTIMOS CAMBIOS</b></div><p style="font-size:medium;">Deseas hacer cambio de apuestas?</p>',
			buttons:[
			$.extend({}, vex.dialog.buttons.YES, {
			className: 'okButton',
			text: 'SI',
			click: function($vexContent, event) {
			$vexContent.data().vex.value = true;
			vex.close($vexContent.data().vex.id);
			}}),
			$.extend({}, vex.dialog.buttons.NO, {
			className: 'simpleCancel',
			text: 'No',
			click: function($vexContent, event) {
			vex.close($vexContent.data().vex.id);
			}})
			],
			callback: function(value) {
				window.console.log('Choice', value ? 'Continue' : 'Cancel');
				if (value) {
					$('input').off();
					$("#tbHoyos").off();
					cambioStakePareja();
				}
				else{
					saldoTotal();
					$("body").pagecontainer("change", "#saldoApuestas");
				}
			}
		});
	}
	else{
		window.sessionStorage.setItem("Ronda", 2);
		if (temp==10){
			removeHiddenA();
			addHiddenB();
			window.sessionStorage.setItem("Hoyos", 1);
		} else{
			removeHiddenB();
			addHiddenA();
			window.sessionStorage.setItem("Hoyos", 10);
		}
		$('#disNext').addClass('ui-state-disabled');
		$('#backRev').removeClass('hidden');
		$("body").pagecontainer("change", "#page11");
	}
},errorHandler,nullHandler); }

function backReview() {
	$("body").pagecontainer("change", "#page16");
	showPanel();
	var temp = window.sessionStorage.getItem("Hoyos");
	window.sessionStorage.removeItem("Ronda");
	if (temp==10){
		removeHiddenA();
		addHiddenB();
		window.sessionStorage.setItem("Hoyos", 1);
	} else{
		removeHiddenB();
		addHiddenA();
		window.sessionStorage.setItem("Hoyos", 10);
	}
	$('#disNext').removeClass('ui-state-disabled');
	$('#backRev').addClass('hidden');
}

function SalirJuego(){
	vex.dialog.confirm({
		message: '<div style="font-size:large;text-align: center;border-bottom: 1px solid #203744;"><b>FIN DEL JUEGO</b></div><p style="font-size:medium;">Desea regresar a la pantalla principal?</p>',
		buttons:[
		$.extend({}, vex.dialog.buttons.YES, {
		className: 'okButton',
		text: 'OK',
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
			if (value) {
				window.console.log('Salio del juego completamente');
				guardarApuestas();
				DiferIndice();
				/*$('#floating').velocity({ opacity: 0 }, function() {
					$('#floating').addClass('hidden');
				});*/
			}
		}
	});
}