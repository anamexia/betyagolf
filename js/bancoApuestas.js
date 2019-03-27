function bancoApuesta(Origen) {
	var currentPage = $('.ui-page-active').attr('id');
	if (currentPage != 'indAps' && currentPage != 'indApsDet')
		window.sessionStorage.setItem('ApsLastPage', currentPage);
	if ($('#popIndiAdd > ul').find('li').length > 2) {
		$('#indiAdd').show();
	}
	else $('#indiAdd').hide();
	var results;
	db.transaction(function(transaction) {
		if (Origen)
			doQuery(transaction, 'SELECT * FROM Jugadores Where Early != "YES"', [],function(transaction, result) {
			results = result;
			//if (Origen>=2) $('#indApsDet div[data-role="navbar"]').addClass('hidden');
			//else stakeParejas();
			console.log('Jugadores', Origen);
			generarApuestas(results);
			window.sessionStorage.setItem('Start', Origen);
		});

		else doQuery(transaction, 'SELECT * FROM User', [],function(transaction, result) {
			results = result;
			console.log('User');
			$('#indApsDet div[data-role="navbar"]').addClass('hidden');
			generarApuestas(results);
		});

	},errorHandler,nullHandler);
}

function generarApuestas(result) {
	db.transaction(function(transaction){
	  if (result != null && result.rows != null) {
	  	var idCount = 1;
	  	$('#dbStakeInd').html('');
	  	$('#listAps').empty();
		var resultArray = [];
		for (var i = 0; i < result.rows.length; i++) {
			resultArray.push(result.rows.item(i))
		}
		doQuery(transaction, 'SELECT * FROM BancoApuestasI',[],
		function(transaction, result){
			 if (result != null && result.rows != null) {
			 	for (var j = 0; j < resultArray.length; j++) {
		$('#listAps').append('<li data-icon="custom"><a class="ui-nodisc-icon" onclick="apFrom('+resultArray[j].UserId+')">'+resultArray[j].FirstName+' '+resultArray[j].LastName+'</a></li>');

		  for (var k = j; k < resultArray.length; k++) {
		  	if (k > j) {
				var rowA = resultArray[j];
				var rowB = resultArray[k];
				var nameA = rowA.FirstName+' '+rowA.LastName;
				var nameB = rowB.FirstName+' '+rowB.LastName;
				var valueA = 50;
				var valueB = 100;
				var valueM = 100;
				var existApuesta = false;
				var existSliding = false;
				var slidingRow;
				var slidingName = '';
				var casados = '';
				for (var l = 0; l < result.rows.length; l++) {
					if (rowA.UserId == result.rows.item(l).playerA) {
						if (rowB.UserId == result.rows.item(l).playerB) {
							window.console.log('Apuesta '+rowA.UserId+' VS '+rowB.UserId+' existe en bandoApuestasI!');
							existApuesta = true;
							if (result.rows.item(l).sliding == "YES") {
								slidingRow = result.rows.item(l);
								existSliding = true;
								window.console.log(' Sliding para  '+slidingRow.playerS+' con ventaja de '+slidingRow.ventaja);
								if (slidingRow.playerS == rowA.UserId) {
									slidingName = nameA;
								} else{
									slidingName = nameB;
								}
								if (slidingRow.casado=="YES") {
									casados = 'checked="checked"';
								}
							}
							valueA = result.rows.item(l).rondaA;
							valueB = result.rows.item(l).rondaB;
							valueM = result.rows.item(l).match;
						}
					}
				}

				var playing = window.sessionStorage.getItem('Start');
				if (playing>=2) {
					if (!existApuesta) {
						idCount++;
						continue;
					}
				}

				//Creamos el div contenedor para la apuesta.
				var apInd = '<div class="apuestasDiv" title="ckStInd" id="stkInd'+(idCount)+'" playerA="'+rowA.UserId+'" playerB="'+rowB.UserId+'">';

					//Si la apuesta no existe, se envuelve en un div el boton de borrar apuesta, a la izquierda se agrega el texto *NEW* y a la derecha el boton borrar.
					if (!existApuesta) {
						apInd +='<div style="width: 100%; overflow: hidden;"><div style="float:left; color:red;"><b>*NEW*</b></div> <div style="float:right;"><a onClick="borrarBaInd('+(idCount)+')" class="ui-btn ui-icon-delete ui-btn-icon-notext ui-corner-all ui-nodisc-icon ui-alt-icon BYGsimple"></a></div></div>';
					}

					//Si la apuesta existe, solo se agrega el boton borrar alineado a la derecha.
					else{
						apInd += '<div align="right"><a onClick="borrarBaInd('+(idCount)+')" class="ui-btn ui-icon-delete ui-btn-icon-notext ui-corner-all ui-nodisc-icon ui-alt-icon BYGsimple"></a></div>';
					}

					//Se adjunta el texto VS de esta apuesta.
					apInd += '<div data-controltype="textblock"><p style="text-align: center;"><b>'+nameA+' <span class="vsApInd">vs.</span> '+nameB+'</b></p> </div>';

					//Si existe y usa sliding, se adjunta la informacion del sliding.
					if (existSliding) {
						apInd += '<div align="center" id="sli'+(idCount)+'"><b>Sliding&nbsp&nbsp&nbsp</b><input type="checkbox" data-on-text="YES" data-corners="false" data-off-text="NO" data-role="flipswitch" stkid="'+idCount+'" id="aSliding" checked=""><div id="slidy'+idCount+'" class="ui-grid-a"><b>Ventaja para</b><div class="ui-block-a" style="width:75%"><select id="slidSelect" data-mini="true" disabled><option value="'+slidingRow.playerS+'" selected>'+slidingName+'</option></select></div><div class="ui-block-b" style="width:25%"><input data-mini="true" value="'+slidingRow.ventaja+'" placeholder="sliding" type="number"></div><div class="ui-block-a" style="width:100%"><div style="width:40%"><input type="checkbox" id="casado'+(idCount)+'" data-mini="true" '+casados+'><label for="casado'+(idCount)+'">Casados?</label></div></div></div></div>';
					} 

					//Si no existe, se agrega el flipswitch para activar o quitar sliding en la apuesta.
					else{
						apInd += '<div align="center" id="sli'+(idCount)+'"><b>Sliding&nbsp&nbsp&nbsp</b><input type="checkbox" data-on-text="YES" data-corners="false" data-off-text="NO" data-role="flipswitch" stkid="'+idCount+'" id="sliding"></div>';
					}

					//Se adjunta un div tipo grid para agregar los spinbox de stakes de apuestas. contiene 2 bloques a y b, y el tercer stake se deja afuera de los bloques para terminar alineado al centro.
					//Despues del grid, se agrega una linea <hr> y se agrega el </div> que cierra el contenedor de esta apuesta.
					apInd += '<div style="bottom:0px; padding:1px;background-color:#65C77F;"><div style="background:white;margin:10px;"><table style="width: 100%"><tbody><tr><td><b>Ronda 1</b><input data-role="spinbox" data-type="vertical" name="stkInd" id="rA'+(idCount)+'" value="'+valueA+'" min="0" max="10000" step="25" data-mini="true"/></td><td><b>Ronda 2</b><input data-role="spinbox" data-type="vertical" name="stkInd" id="rA'+(idCount)+'" value="'+valueB+'" min="0" max="10000" step="25" data-mini="true"/></td><td><b>Match</b><input data-role="spinbox" data-type="vertical" name="stkInd" id="m'+(idCount)+'" value="'+valueM+'" min="0" max="10000" step="25" data-mini="true"/></td></tr></tbody></table></div></div>';

				window.console.log('\nA '+rowA.UserId+' B '+rowB.UserId);
				//Si la apuesta existe, se hace append que une la apuesta al final de la lista.
				//Nota: el .trigger("create") se usa para forzar el style jQuery de objetos dinamicos tal como el flipswitch y el spinbox, si no se hace, cargarian objetos simples como checkbox y textbox.
				if (existApuesta) {
					window.console.log('Ya existe, append');
					$('#dbStakeInd').append(apInd);
					//.trigger("create");
				}

				//Si no existe la apuesta, hace prepend que une al inicio de la lista.
				else{
					window.console.log('Nueva apuesta, prepend');
					$('#dbStakeInd').prepend(apInd);
					//.trigger("create");
				}
				idCount++;
		  	}
		  }
		}
		$('#dbStakeInd').trigger("create");
		slidingChange();
		activeSlidingChange();
		//$('#apsNext').attr('onClick', 'continuarBancoApuestas()');
		if ( $('#listAps').hasClass('ui-listview')) {
			$('#listAps').listview('refresh');
		}
		else {
			$('#listAps').trigger('create');
		}
		$("body").pagecontainer("change", "#indAps");
		}
		});
	  }
	},errorHandler, nullHandler);
}

function continuarBancoApuestas(){
	vex.dialog.confirm({
    message: '<div style="font-size:large;text-align: center;border-bottom: 1px solid #203744;"><b>Confirmar Apuestas</b></div><p style="font-size:medium;">¿Esta seguro que desea continuar?</p><br>',
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
        if (value) {
        	if (!$('#indApsDet div[data-role="navbar"]').hasClass('hidden')) {
        		checkStakes();
        	};
			$('input[type="checkbox"]#sliding').off();
			$('input[type="checkbox"]#aSliding').off();
			bancoIndividual();
			var playing = window.sessionStorage.getItem('Start');
			//Aqui va la comprobacion para los 3 accesos al banco de apuestas
			// si playing undefined a 5, si existe, checa si es 1 o 2.
			if (playing) {
				if (playing==1) $("body").pagecontainer("change", "#page10");
				if (playing>=2) {
					regenerateApuestas();
				}
			} else {
				var lastPage = window.sessionStorage.getItem('ApsLastPage');
				$("body").pagecontainer("change", "#"+lastPage);
				$('#indApsDet div[data-role="navbar"]').removeClass('hidden');
			}
		}
    }
	});
}

function regenerateApuestas(checkChange) {db.transaction(function(transaction) {
	var playing = 3;
	window.sessionStorage.setItem('Start', 3);
	window.console.log('Se borran las presiones pasadas');
	doQuery(transaction, 'DELETE FROM presionIndividual', false, nullHandler);
	doQuery(transaction, 'DELETE FROM stepIndividual', false, nullHandler);
	transaction.executeSql('DELETE FROM presionParejas', [], nullHandler,nullHandler);
	transaction.executeSql('DELETE FROM stepParejas', [], nullHandler,nullHandler);
	if(checkChange) doQuery(transaction, 'UPDATE stakeParejas SET ventager = ?', ["NONE"], nullHandler);
	var temp = window.sessionStorage.getItem("Ronda");
	if (playing==2 || (temp)) {
		window.sessionStorage.setItem("edit", true);
		removeHiddenA();
		removeHiddenB();
		var hoyoStart = window.sessionStorage.getItem("Hoyos");
		window.console.log('Hoyos despues de presiones',hoyoStart);
		if (hoyoStart==10){
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
	} else{
		presionParejas();
		presionIndividual();
	}
	/*setTimeout(function(){saldoTotal();window.location.href="#saldoApuestas";console.log('Para no hacer esto?')}, 1000);*/
},nullHandler,nullHandler);}

function bancoIndividual() {
	db.transaction(function(transaction){
	var mySelection = $("div[title='ckStInd']");
	if(mySelection.length > 0){
		mySelection.each(function() {
			var arrayStakes = [];
			$(this).find(':input[name^="stkInd"]').each(function() {
				arrayStakes.push(parseFloat(this.value));
			});
			var idA = parseInt($(this).attr('playerA'));
			var idB = parseInt($(this).attr('playerB'));
			var sliCheck = $(this).find('[id*="liding"]').is(':checked');
			var sliding = "NO";
			var playerS = 0;
			var ventaja = 0;
			var casado = "NO";
			if (sliCheck) {
				sliding = "YES";
				var slider = $(this).find('[id^="slidy"]');
				playerS = slider.find('select').val();
				ventaja = slider.find('input').val();
				var checkCasado = slider.find('[id^="casado"]').is(':checked');
				if (checkCasado){
					window.console.log('Casados!');
					casado = "YES";
				}
			}
			doQuery(transaction, 'SELECT bancoApInId FROM BancoApuestasI WHERE playerA = ? AND playerB = ?',[idA,idB],function(transaction, result) {
				window.console.log('playerA '+idA+' vs playerB '+idB+'\nStakes: '+arrayStakes);
				window.console.log('Sliding = '+sliding+' PlayerS = '+playerS+' Ventaja = '+ventaja+' casados = '+casado);
				window.console.log(result.rows.length);
				if (result.rows.length==1) {
					window.console.log('Existe');
					doQuery(transaction, 'UPDATE BancoApuestasI SET sliding = ?, playerS = ?, ventaja = ?, rondaA = ?, rondaB = ?, match = ?, casado = ? WHERE playerA= ? AND playerB = ?', [sliding, playerS, ventaja, arrayStakes[0], arrayStakes[1], arrayStakes[2], casado,idA, idB], nullHandler);
				} else{
					window.console.log('No existe');
					doQuery(transaction, 'INSERT INTO BancoApuestasI (playerA, playerB, sliding, playerS, ventaja, rondaA, rondaB, match, casado) VALUES (?,?,?,?,?,?,?,?,?)', [idA,idB, sliding,playerS,ventaja,arrayStakes[0],arrayStakes[1],arrayStakes[2], casado], nullHandler);
				};
			});
		});
	}
	},errorHandler, nullHandler);
}

function borrarBaInd (id) {
var divy = $('#stkInd'+id+'');
var p1 = divy.attr('playerA');
var p2 = divy.attr('playerB');
var name1 = "";
var name2 = "";
var id1;
var id2;
var value = 0;
db.transaction(function(transaction){
	doQuery(transaction, 'SELECT * FROM User', [],
	 function(transaction, result) {
	  if (result != null && result.rows != null) {
		for (var i = 0; i < result.rows.length; i++) {
		  var row = result.rows.item(i);
		  if (row.UserId == p1) {
		  	name1 = row.FirstName+' '+row.LastName;
		  	id1 = row.UserId;
		  }
		  if (row.UserId == p2) {
		  	name2 = row.FirstName+' '+row.LastName;
		  	id2 = row.UserId;
		  }
		}
		vex.dialog.confirm({
    message: '<div style="font-size:large;text-align: center;border-bottom: 1px solid #203744;"><b>Borrar Apuesta</b></div><p style="font-size:medium;">Borrar apuesta de<br>'+name1+' VS '+name2+'?</p><br>',
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
        if (value) {
			window.console.log('Borra apuesta id '+id);
			window.console.log(id1 +' '+ id2);
			$('#stkInd'+id).hide('slow');
			deleteBaApuesta(id1,id2);
			setTimeout(function(){$('#stkInd'+id).remove();}, 2000);
			var playing = window.sessionStorage.getItem('Start');
			if (playing) {
				$('#popIndiAdd').find('ul > li:first').after('<li id="li'+id+'" data-icon="false"><a onClick="agregarApuesta('+id+','+id1+','+id2+', true)">'+name1+' VS '+name2+'</a></li>');
				$('#indiAdd').show();
				$('#popIndiAdd > ul').listview( "refresh" );
			}
		}
    }
	});
	  }
	 });
	},errorHandler, nullHandler);
}

function deleteBaApuesta (pl1, pl2) {
	db.transaction(function(transaction){
		doQuery(transaction, 'DELETE FROM BancoApuestasI WHERE playerA = ? AND playerB = ?',[pl1, pl2],nullHandler);
	},errorHandler, nullHandler);
}