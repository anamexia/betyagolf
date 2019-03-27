function saldoYoyo() {
	db.transaction(function(transaction) {
		window.console.log('\nYoyo\n');

		transaction.executeSql('SELECT * FROM jugadores, parejasApuesta WHERE jugadores.UserId = parejasApuesta.IdJugador ORDER BY parejasApuesta.pareja ASC', [],
	function(transaction, result) {
	if (result != null && result.rows != null) {
		for (var i = 0; i < result.rows.length; i++) {
			var row = result.rows.item(i);
			arrayResult.push(row);
		}
		maxPair = result.rows.item(result.rows.length-1).pareja;
		var pj1 = 0;
	  	var pS = 0;

	  	var arrayParA = [];
		var p1 = [];

	  	for (var i = 1; i <= maxPair; i++) {
	  		p1.push(i);
	  		for (var k = 0; k < result.rows.length; k++) {
				if (result.rows.item(k).pareja == i) {
					arrayParA.push(result.rows.item(k).UserId);
				}
			}
	  	}

	var arrayPresionP1 = [];
	var arrayPresionP2 = [];
	var arrayPresionPMatch = [];

	window.console.log('MaxPair es '+maxPair);

		transaction.executeSql('SELECT * FROM presionParejas WHERE PairA BETWEEN 1 AND 3 ORDER BY PairA ASC, PairB ASC', [],
		function(transaction, result) {
		if (result != null && result.rows != null) {
			while(pj1<p1.length){
			window.console.log('\nCAMBIO DE PAIR\n');
			var presion1 = 0;
			var presion2 = 0;
			var presionMatch = 0;
			var tempPair = 0;
			var firstCheck = true;
			for (var j = 0; j < result.rows.length; j++) {
				if (result.rows.item(j).PairA == p1[pj1]) {
					var presionCheck = result.rows.item(j);
					if (firstCheck == true) {
						if (presionCheck.PairA > presionCheck.PairB) {
							continue;
						}
						tempPair = presionCheck.PairB;
						window.console.log('First pareja '+p1[pj1]+' vs pareja '+tempPair);
						firstCheck = false;
					}
					else if(presionCheck.PairB != tempPair){
						if (presionCheck.PairA > presionCheck.PairB) {
							continue;
						}
						window.console.log('uno '+presion1+' dos '+presion2+' match '+presionMatch);
						arrayPresionP1.push(presion1);
						arrayPresionP2.push(presion2);
						if (presionMatch>0) {
						window.console.log('Gana!');
						arrayPresionPMatch.push(1);
						}
						else{
							if(presionMatch<0){
							arrayPresionPMatch.push(-1);
							}
							else{
							arrayPresionPMatch.push(0);
							}
						}
						presion1 = 0;
						presion2 = 0;
						presionMatch = 0;
						tempPair = presionCheck.PairB;
						window.console.log('pareja '+p1[pj1]+' vs pareja '+tempPair);
					}
					if (presionCheck.Presion>0) {
						if (presionCheck.Nivel == 1) {
							presionMatch += presionCheck.Presion;
						}
						presionCheck.Ronda==1?presion1++:presion2++;
					}
					if (presionCheck.Presion<0) {
						if (presionCheck.Nivel == 1) {
							presionMatch += presionCheck.Presion;
						}
						presionCheck.Ronda==1?presion1--:presion2--;
					}
				}
				if (j == result.rows.length-1) {
					window.console.log('uno '+presion1+' dos '+presion2+' match '+presionMatch);
					arrayPresionP1.push(presion1);
					arrayPresionP2.push(presion2);
					if (presionMatch>0) {
					window.console.log('Gana!');
					arrayPresionPMatch.push(1);
					}
					else{
						if(presionMatch<0){
						arrayPresionPMatch.push(-1);
						}
						else{
						arrayPresionPMatch.push(0);
						}
					}
				}
			}
			pj1++;
			}
			window.console.log('\nParejaA = '+p1);
  				window.console.log('pair1 = '+ arrayParA);
			window.console.log('presion Ronda1 '+arrayPresionP1+'\nPresion Ronda2 '+arrayPresionP2+'\nPresion Match '+arrayPresionPMatch);

			transaction.executeSql('SELECT * FROM stakeParejas ORDER BY PairA ASC, PairB ASC',[],
			function(transaction, result) {
			if (result != null && result.rows != null) {
				pj1 = 0;
				var costoNumber = 0;
				var costosParejaArray = new Array(p1.length+1).join('0').split('').map(parseFloat);

				while(pj1<p1.length){

				var firstTime = true;
				var tempCheck = 0;
				for (var k = 0; k < result.rows.length; k++) {
					var costoPresionP1 = 0;
					var costoPresionP2 = 0;
					var costoPresionPMatch = 0;
					if (result.rows.item(k).PairA == p1[pj1]) {
						var costos = result.rows.item(k);
						if (firstTime == true) {
							tempCheck = costos.PairB;
							window.console.log('pareja '+p1[pj1]+' vs pareja '+tempCheck+'\nApuestan '+costos.Ronda1+'/'+costos.Ronda2+'/'+costos.Match);
							costoA=costos.Ronda1;
							costoB=costos.Ronda2;
							costoM=costos.Match;
							if (costos.carry=="YES") {
								window.console.log('Hay carry');
								costoB=costoA+costoB+costoM;
								costoM=0;
								window.console.log('Cambio de stake a '+costoA+'/'+costoB+'/'+costoM);
							}
							firstTime = false;
						}
						if(costos.PairB != tempCheck){
							tempCheck = costos.PairB;
							window.console.log('pareja '+p1[pj1]+' vs pareja '+tempCheck+'\nApuestan '+costos.Ronda1+'/'+costos.Ronda2+'/'+costos.Match);
							costoA=costos.Ronda1;
							costoB=costos.Ronda2;
							costoM=costos.Match;
							if (costos.carry=="YES") {
								window.console.log('Hay carry');
								costoB=costoA+costoB+costoM;
								costoM=0;
								window.console.log('Cambio de stake a '+costoA+'/'+costoB+'/'+costoM);
							}
							costoNumber++;
						}
						costoPresionP1 = arrayPresionP1[costoNumber] * costoA;
						costoPresionP2 = arrayPresionP2[costoNumber] * costoB;
						costoPresionPMatch = arrayPresionPMatch[costoNumber] * costoM;
						window.console.log(' r1 '+ costoPresionP1+' r2 '+ costoPresionP2+' m '+costoPresionPMatch);
						costosParejaArray[pj1] += costoPresionP1+costoPresionP2+costoPresionPMatch;
						costosParejaArray[p1.indexOf(tempCheck)] += -(costoPresionP1+costoPresionP2+costoPresionPMatch);
						var costoIndividual = costoPresionP1+costoPresionP2+costoPresionPMatch;
						//costoIndividual = costoIndividual/2;
						//while(pS<p1.length){
							var integrantesA = [];
							var integrantesB = [];
							for (var o = 0; o < arrayResult.length; o++) {
								if (arrayResult[o].pareja == p1[pj1]) {
									integrantesA.push(arrayResult[o].FirstName.charAt(0)+'.'+arrayResult[o].LastName);
								}
								if (arrayResult[o].pareja == tempCheck) {
									integrantesB.push(arrayResult[o].FirstName.charAt(0)+'.'+arrayResult[o].LastName);
								}
							}
							var checkYoyo = false;
							var textYoyo = '';
							if (p1[pj1]==1 || (p1[pj1]==2 || p1[pj1]==3)) {
								checkYoyo = true;
							};
							for (var l = 0; l < arrayResult.length; l++) {
								var player = arrayResult[l];
								if (player.pareja == p1[pj1]) {
									if (checkYoyo){
										textYoyo = ' x2';
										checkYoyo=false;
									}
									else{
										if (costoIndividual>=0) {
										$('#sdoInd'+player.UserId+' div:first-child').after('<div class="ui-block-a"><b>'+integrantesA[0]+' '+integrantesA[1]+'<br>vs<br>'+integrantesB[0]+' '+integrantesB[1]+'</b><hr style="width:50%"/></div><div class="ui-block-b"><b style="color:green;">$'+costoIndividual+''+textYoyo+'</b></div>');
									}
									if (costoIndividual<0) {
										$('#sdoInd'+player.UserId+' div:first-child').after('<div class="ui-block-a"><b>'+integrantesA[0]+' '+integrantesA[1]+'<br>vs<br>'+integrantesB[0]+' '+integrantesB[1]+'</b><hr style="width:50%"/></div><div class="ui-block-b"><b style="color:red;">-$'+(-costoIndividual)+''+textYoyo+'</b></div>');
									}
									}
								}
								if (player.pareja == tempCheck) {
									if (costoIndividual>=0) {
										$('#sdoInd'+player.UserId+' div:first-child').after('<div class="ui-block-a"><b>'+integrantesB[0]+' '+integrantesB[1]+'<br>vs<br>'+integrantesA[0]+' '+integrantesA[1]+'</b><hr style="width:50%"/></div><div class="ui-block-b"><b style="color:red;">-$'+costoIndividual+'</b></div>');
									}
									if (costoIndividual<0) {
										$('#sdoInd'+player.UserId+' div:first-child').after('<div class="ui-block-a"><b>'+integrantesB[0]+' '+integrantesB[1]+'<br>vs<br>'+integrantesA[0]+' '+integrantesA[1]+'</b><hr style="width:50%"/></div><div class="ui-block-b"><b style="color:green;">$'+(-costoIndividual)+'</b></div>');
									}
								}
							}
						//	pS++;
						//}
						pS = 0;

					}

				}
				costoNumber++;
				pj1++;
			}
			window.console.log(costosParejaArray);
			pj1 = 0;
			while(pj1<p1.length){
				for (var l = 0; l < arrayResult.length; l++) {
				var player = arrayResult[l];
				if (player.pareja == p1[pj1]) {
					var pIndex = arrayIDs.indexOf(player.UserId);
					//window.console.log(pIndex);
					saldosArrayInd[pIndex] += costosParejaArray[pj1];
					//window.console.log(costosArrayInd);
				}
				}
				pj1++;
			}
			}
			},errorHandler);
		}
		},errorHandler);
	}
	},errorHandler);
	},errorHandler,saldoIndividuales);
}

function saldoParejas() {
	db.transaction(function(transaction) {
		window.console.log('Parejas!');
		transaction.executeSql('SELECT * FROM jugadores, parejasApuesta WHERE jugadores.UserId = parejasApuesta.IdJugador ORDER BY parejasApuesta.pareja ASC', [],
	function(transaction, result) {
	if (result != null && result.rows != null) {
		for (var i = 0; i < result.rows.length; i++) {
			var row = result.rows.item(i);
			arrayResult.push(row);
		}
		maxPair = result.rows.item(result.rows.length-1).pareja;
		var pj1 = 0;
	  	var pS = 0;

	  	var arrayParA = [];

		var p1 = [];

	  	for (var i = 1; i <= maxPair; i++) {
	  		p1.push(i);
	  		for (var k = 0; k < result.rows.length; k++) {
				if (result.rows.item(k).pareja == i) {
					arrayParA.push(result.rows.item(k).UserId);

				}
			}
	  	}

	var arrayPresionP1 = [];
	var arrayPresionP2 = [];
	var arrayPresionPMatch = [];

	window.console.log('MaxPair es '+maxPair);

		transaction.executeSql('SELECT * FROM presionParejas ORDER BY PairA ASC, PairB ASC', [],
		function(transaction, result) {
		if (result != null && result.rows != null) {
			while(pj1<p1.length){
			window.console.log('\nCAMBIO DE PAIR\n');
			var presion1 = 0;
			var presion2 = 0;
			var presionMatch = 0;
			var tempPair = 0;
			var firstCheck = true;
			for (var j = 0; j < result.rows.length; j++) {
				if (result.rows.item(j).PairA == p1[pj1]) {
					var presionCheck = result.rows.item(j);
					if (firstCheck == true) {
						if (presionCheck.PairA > presionCheck.PairB) {
							continue;
						}
						tempPair = presionCheck.PairB;
						window.console.log('pareja '+p1[pj1]+' vs pareja '+tempPair);
						firstCheck = false;
					}
					if(presionCheck.PairB != tempPair){
						if (presionCheck.PairA > presionCheck.PairB) {
							continue;
						}
						window.console.log('uno '+presion1+' dos '+presion2+' match '+presionMatch);
						arrayPresionP1.push(presion1);
						arrayPresionP2.push(presion2);
						if (presionMatch>0) {
						window.console.log('Gana!');
						arrayPresionPMatch.push(1);
						}
						else{
							if(presionMatch<0){
							arrayPresionPMatch.push(-1);
							}
							else{
							arrayPresionPMatch.push(0);
							}
						}
						presion1 = 0;
						presion2 = 0;
						presionMatch = 0;
						tempPair = presionCheck.PairB;
						window.console.log('pareja '+p1[pj1]+' vs pareja '+tempPair);
					}

				if (presionCheck.Presion>0) {
						if (presionCheck.Nivel == 1) {
							presionMatch += presionCheck.Presion;
						}
						presionCheck.Ronda==1?presion1++:presion2++;
					}
					if (presionCheck.Presion<0) {
						if (presionCheck.Nivel == 1) {
							presionMatch += presionCheck.Presion;
						}
						presionCheck.Ronda==1?presion1--:presion2--;
					}
				}
				if (j == result.rows.length-1) {
					//if(presion1 == 0 && (presion2 == 0 && presionMatch == 0)) continue;
					window.console.log('uno '+presion1+' dos '+presion2+' match '+presionMatch);
					arrayPresionP1.push(presion1);
					arrayPresionP2.push(presion2);
					if (presionMatch>0) {
					window.console.log('Gana!');
					arrayPresionPMatch.push(1);
					}
					else{
						if(presionMatch<0){
						arrayPresionPMatch.push(-1);
						}
						else{
						arrayPresionPMatch.push(0);
						}
					}
				}
			}
			pj1++;
			}
			window.console.log('\nParejaA = '+p1);
  				window.console.log('pair1 = '+ arrayParA);
			window.console.log('presion Ronda1 '+arrayPresionP1+'\nPresion Ronda2 '+arrayPresionP2+'\nPresion Match '+arrayPresionPMatch);

			transaction.executeSql('SELECT * FROM stakeParejas ORDER BY PairA ASC, PairB ASC',[],
			function(transaction, result) {
			if (result != null && result.rows != null) {
				pj1 = 0;
				var costoNumber = 0;
				var costosParejaArray = new Array(p1.length+1).join('0').split('').map(parseFloat);

				while(pj1<p1.length){

				var firstTime = true;
				var tempCheck = 0;
				for (var k = 0; k < result.rows.length; k++) {
					var costoPresionP1 = 0;
					var costoPresionP2 = 0;
					var costoPresionPMatch = 0;
					if (result.rows.item(k).PairA == p1[pj1]) {
						var costos = result.rows.item(k);
						if (firstTime == true) {
							tempCheck = costos.PairB;
							window.console.log('pareja '+p1[pj1]+' vs pareja '+tempCheck+'\nApuestan '+costos.Ronda1+'/'+costos.Ronda2+'/'+costos.Match);
							costoA=costos.Ronda1;
							costoB=costos.Ronda2;
							costoM=costos.Match;
							if (costos.carry=="YES") {
								window.console.log('Hay carry');
								costoB=costoA+costoB+costoM;
								costoM=0;
								window.console.log('Cambio de stake a '+costoA+'/'+costoB+'/'+costoM);
							}
							firstTime = false;
						}
						if(costos.PairB != tempCheck){
							tempCheck = costos.PairB;
							window.console.log('pareja '+p1[pj1]+' vs pareja '+tempCheck+'\nApuestan '+costos.Ronda1+'/'+costos.Ronda2+'/'+costos.Match);
							costoA=costos.Ronda1;
							costoB=costos.Ronda2;
							costoM=costos.Match;
							if (costos.carry=="YES") {
								window.console.log('Hay carry');
								costoB=costoA+costoB+costoM;
								costoM=0;
								window.console.log('Cambio de stake a '+costoA+'/'+costoB+'/'+costoM);
							}
							costoNumber++;
						}
						costoPresionP1 = arrayPresionP1[costoNumber] * costoA;
						costoPresionP2 = arrayPresionP2[costoNumber] * costoB;
						costoPresionPMatch = arrayPresionPMatch[costoNumber] * costoM;
						window.console.log(' r1 '+ costoPresionP1+' r2 '+ costoPresionP2+' m '+costoPresionPMatch);
						costosParejaArray[pj1] += costoPresionP1+costoPresionP2+costoPresionPMatch;
						costosParejaArray[p1.indexOf(tempCheck)] += -(costoPresionP1+costoPresionP2+costoPresionPMatch);
						var costoIndividual = costoPresionP1+costoPresionP2+costoPresionPMatch;
						//costoIndividual = costoIndividual/2;
						//while(pS<p1.length){
							var integrantesA = [];
							var integrantesB = [];
							for (var o = 0; o < arrayResult.length; o++) {
								if (arrayResult[o].pareja == p1[pj1]) {
									integrantesA.push(arrayResult[o].FirstName.charAt(0)+'.'+arrayResult[o].LastName);
								}
								if (arrayResult[o].pareja == tempCheck) {
									integrantesB.push(arrayResult[o].FirstName.charAt(0)+'.'+arrayResult[o].LastName);
								}
							}
							for (var l = 0; l < arrayResult.length; l++) {
								var player = arrayResult[l];
								if (player.pareja == p1[pj1]) {
									if (costoIndividual>=0) {
										$('#sdoInd'+player.UserId).append('<div class="ui-block-a"><b>'+integrantesA[0]+' '+integrantesA[1]+'<br>vs<br>'+integrantesB[0]+' '+integrantesB[1]+'</b><hr style="width:50%"/></div><div class="ui-block-b"><b style="color:green;">$'+costoIndividual+'</b></div>');
									}
									if (costoIndividual<0) {
										$('#sdoInd'+player.UserId).append('<div class="ui-block-a"><b>'+integrantesA[0]+' '+integrantesA[1]+'<br>vs<br>'+integrantesB[0]+' '+integrantesB[1]+'</b><hr style="width:50%"/></div><div class="ui-block-b"><b style="color:red;">-$'+(-costoIndividual)+'</b></div>');
									}
								}
								if (player.pareja == tempCheck) {
									if (costoIndividual>=0) {
										$('#sdoInd'+player.UserId).append('<div class="ui-block-a"><b>'+integrantesB[0]+' '+integrantesB[1]+'<br>vs<br>'+integrantesA[0]+' '+integrantesA[1]+'</b><hr style="width:50%"/></div><div class="ui-block-b"><b style="color:red;">-$'+costoIndividual+'</b></div>');
									}
									if (costoIndividual<0) {
										$('#sdoInd'+player.UserId).append('<div class="ui-block-a"><b>'+integrantesB[0]+' '+integrantesB[1]+'<br>vs<br>'+integrantesA[0]+' '+integrantesA[1]+'</b><hr style="width:50%"/></div><div class="ui-block-b"><b style="color:green;">$'+(-costoIndividual)+'</b></div>');
									}
								}
							}
						//	pS++;
						//}
						pS = 0;

					}

				}
				costoNumber++;
				pj1++;
			}
			window.console.log(costosParejaArray);
			pj1 = 0;
			while(pj1<p1.length){
				for (var l = 0; l < arrayResult.length; l++) {
				var player = arrayResult[l];
				if (player.pareja == p1[pj1]) {
					var pIndex = arrayIDs.indexOf(player.UserId);
					saldosArrayInd[pIndex] += costosParejaArray[pj1];
				}
				}
				pj1++;
			}
			}
			},errorHandler);
		}
		},errorHandler);
	}
	},errorHandler);
	},errorHandler,saldoIndividuales);
}

function saldoIndividuales() {
	db.transaction(function(transaction) {
		window.console.log('Individuales!');
		var arrayPresionI1 = [];
		var arrayPresionI2 = [];
		var arrayPresionIMatch = [];
		transaction.executeSql('SELECT * FROM presionIndividual ORDER BY playerA ASC, playerB ASC', [],
		function(transaction, result) {
			var pj1 = 0;
			while(pj1<arrayIDs.length){
			window.console.log('\nCAMBIO DE PLAYERS\n');
			var presion1 = 0;
			var presion2 = 0;
			var presionMatch = 0;
			var tempPlayer = 0;
			var firstCheck = true;
			for (var m = 0; m < result.rows.length; m++) {
				if (result.rows.item(m).playerA == arrayIDs[pj1]) {
					var presionCheck = result.rows.item(m);
					if (firstCheck == true) {
						if (presionCheck.playerA > presionCheck.playerB) {
							continue;
						}
						tempPlayer = presionCheck.playerB;
						window.console.log('player '+arrayIDs[pj1]+' vs player '+tempPlayer);
						firstCheck = false;
					}
					if(presionCheck.playerB != tempPlayer){
						if (presionCheck.playerA > presionCheck.playerB) {
							continue;
						}
						window.console.log('uno '+presion1+' dos '+presion2+' match '+presionMatch);
						arrayPresionI1.push(presion1);
						arrayPresionI2.push(presion2);
						if (presionMatch>0) {
						window.console.log('Gana!');
						arrayPresionIMatch.push(1);
						}
						else{
							if(presionMatch<0){
							arrayPresionIMatch.push(-1);
							}
							else{
							arrayPresionIMatch.push(0);
							}
						}
						presion1 = 0;
						presion2 = 0;
						presionMatch = 0;
						tempPlayer = presionCheck.playerB;
						window.console.log('player '+arrayIDs[pj1]+' vs player '+tempPlayer);
					}

					if (presionCheck.Presion>0) {
						if (presionCheck.Nivel == 1) {
							presionMatch += presionCheck.Presion;
						}
						presionCheck.Ronda==1?presion1++:presion2++;
					}
					if (presionCheck.Presion<0) {
						if (presionCheck.Nivel == 1) {
							presionMatch += presionCheck.Presion;
						}
						presionCheck.Ronda==1?presion1--:presion2--;
					}
				}
				if (m == result.rows.length-1) {
					window.console.log('uno '+presion1+' dos '+presion2+' match '+presionMatch);
					arrayPresionI1.push(presion1);
					arrayPresionI2.push(presion2);
					if (presionMatch>0) {
						window.console.log('Gana!');
						arrayPresionIMatch.push(1);
					}
					else{
						if(presionMatch<0){
						arrayPresionIMatch.push(-1);
						}
						else{
							arrayPresionIMatch.push(0);
						}
					}
				}
			}
			pj1++;
			}
			window.console.log('\nPlayers = '+arrayIDs);
			window.console.log('presion Ronda1 '+arrayPresionI1+'\nPresion Ronda2 '+arrayPresionI2+'\nPresion Match '+arrayPresionIMatch);
			transaction.executeSql('SELECT * FROM BancoApuestasI ORDER BY playerA ASC, playerB ASC',[],
			function(transaction, result) {
				pj1 = 0;
				var costoNumber = 0;

				while(pj1<arrayIDs.length){

				var firstTime = true;
				var tempCheck = 0;
				for (var n = 0; n < result.rows.length; n++) {
					var costoPresionI1 = 0;
					var costoPresionI2 = 0;
					var costoPresionIMatch = 0;
					if (result.rows.item(n).playerA == arrayIDs[pj1]) {
						var costos = result.rows.item(n);
						var costoA=0;
						var costoB=0;
						var costoM=0;
						if (firstTime == true) {
							if(arrayIDs.indexOf(costos.playerB) == -1) continue;
							tempCheck = costos.playerB;
							window.console.log('playerA '+arrayIDs[pj1]+' vs playerB '+tempCheck+'\nApuestan '+costos.rondaA+'/'+costos.rondaB+'/'+costos.match);
							costoA=costos.rondaA;
							costoB=costos.rondaB;
							costoM=costos.match;
							if (costos.carry=="YES") {
								window.console.log('Hay carry');
								costoB=costoA+costoB+costoM;
								costoM=0;
								window.console.log('Cambio de stake a '+costoA+'/'+costoB+'/'+costoM);
							}
							firstTime = false;
						}
						if(costos.playerB != tempCheck){
							if(arrayIDs.indexOf(costos.playerB) == -1) continue;
							tempCheck = costos.playerB;
							window.console.log('playerA '+arrayIDs[pj1]+' vs playerB '+tempCheck+'\nApuestan '+costos.rondaA+'/'+costos.rondaB+'/'+costos.match);
							costoA=costos.rondaA;
							costoB=costos.rondaB;
							costoM=costos.match;
							if (costos.carry=="YES") {
								window.console.log('Hay carry');
								costoB=costoA+costoB+costoM;
								costoM=0;
								window.console.log('Cambio de stake a '+costoA+'/'+costoB+'/'+costoM);
							}
							costoNumber++;
						}
						costoPresionI1 = arrayPresionI1[costoNumber] * costoA;
						costoPresionI2 = arrayPresionI2[costoNumber] * costoB;
						costoPresionIMatch = arrayPresionIMatch[costoNumber] * costoM;
						if(costos.sliding=="YES"){
							window.console.log('Checka cambio de ventaja por sliding');
							if (costos.casado=="YES"){
								window.console.log('Casados! no hay cambio de sliding');
							} else{
							if (costos.playerS == arrayIDs[pj1]) {
								if (arrayPresionIMatch[costoNumber]==1) {
									window.console.log('Disminuye ventaja');
									slideUpdate(costos.playerA, costos.playerB,costos.ventaja-1);
								}
								if (arrayPresionIMatch[costoNumber]==-1) {
									window.console.log('Incrementa ventaja');
									slideUpdate(costos.playerA, costos.playerB,costos.ventaja+1);
								}
							} else{
								if (arrayPresionIMatch[costoNumber]==1) {
									window.console.log('Incrementa ventaja');
									slideUpdate(costos.playerA, costos.playerB,costos.ventaja+1);
								}
								if (arrayPresionIMatch[costoNumber]==-1) {
									window.console.log('Disminuye ventaja');
									slideUpdate(costos.playerA, costos.playerB,costos.ventaja-1);
								}
							}
						}
						}
						window.console.log(' r1 '+ costoPresionI1+' r2 '+ costoPresionI2+' m '+costoPresionIMatch);
						saldosArrayInd[pj1] += costoPresionI1+costoPresionI2+costoPresionIMatch;
						saldosArrayInd[arrayIDs.indexOf(tempCheck)] += -(costoPresionI1+costoPresionI2+costoPresionIMatch);

						var costoIndividual2 = costoPresionI1+costoPresionI2+costoPresionIMatch;
						arrayAll[pj1].FirstName+' '+arrayAll[pj1].LastName
						var jugadorA = arrayAll[pj1];
						var jugadorB = arrayAll[arrayIDs.indexOf(tempCheck)];
						if (costoIndividual2>=0) {
							$('#sdoInd'+jugadorA.UserId).append('<div class="ui-block-a"><b>'+jugadorB.FirstName+' '+jugadorB.LastName+'</b></div><div class="ui-block-b"><b style="color:green;">$'+costoIndividual2+'</b></div>');
							$('#sdoInd'+jugadorB.UserId).append('<div class="ui-block-a"><b>'+jugadorA.FirstName+' '+jugadorA.LastName+'</b></div><div class="ui-block-b"><b style="color:red;">-$'+costoIndividual2+'</b></div>');
						}
						if (costoIndividual2<0) {
							$('#sdoInd'+jugadorA.UserId).append('<div class="ui-block-a"><b>'+jugadorB.FirstName+' '+jugadorB.LastName+'</b></div><div class="ui-block-b"><b style="color:red;">-$'+(-costoIndividual2)+'</b></div>');
							$('#sdoInd'+jugadorB.UserId).append('<div class="ui-block-a"><b>'+jugadorA.FirstName+' '+jugadorA.LastName+'</b></div><div class="ui-block-b"><b style="color:green;">$'+(-costoIndividual2)+'</b></div>');
						}
					}
				}
				costoNumber++;
				pj1++;
			}
			},errorHandler);
		},errorHandler);
	},errorHandler,mostrarTotal);
}

function mostrarTotal() {
	window.console.log(saldosArrayInd);
	var index = 0;
	$("#saldoGana").html('');
	$("#saldoPierde").html('');
	var positivoTotal = 0;
	var negativoTotal = 0;
	while(index<saldosArrayInd.length){
		var player = arrayAll[index];
		var saldo = player.FirstName+' '+player.LastName;
		//AQUI DEBES CAMBIAR TOTAL EN TABLE CON EL ESTILO VERDE CON BLANCO.
		if (saldosArrayInd[index]>=0) {
			positivoTotal += saldosArrayInd[index];
				saldo += '\n<div style="color:green;"><b>$'+saldosArrayInd[index]+'</b></div><br>';
				$("#saldoGana").append(saldo);
				$('#sdoInd'+player.UserId).append('<div style="background-color:#65C77F;display: inline-table;width:100%;margin-top:10px;"><div style="background:white;margin:10px;"><table style="width: 100%"><tbody><tr><td style="width:50%"><b stye="font-size:x-large;">TOTAL</b></td><td style="border-left:1px solid gray;display:inline-grid"><b style="color:green;">$'+saldosArrayInd[index]+'</b></td></tr></tbody></table></div></div>');
		}
		if (saldosArrayInd[index]<0) {
			negativoTotal += saldosArrayInd[index];
				saldo += '\n<div style="color:red;"><b>-$'+(-saldosArrayInd[index])+'</b></div><br>';
				$("#saldoPierde").append(saldo);
				$('#sdoInd'+player.UserId).append('<div style="background-color:#65C77F;display: inline-table;width:100%;margin-top:10px;"><div style="background:white;margin:10px;"><table style="width: 100%"><tbody><tr><td style="width:50%"><b stye="font-size:x-large;">TOTAL</b></td><td style="border-left:1px solid gray;display:inline-grid"><b style="color:red;">-$'+(-saldosArrayInd[index])+'</b></td></tr></tbody></table></div></div>');
		}
		index++;
	}
	window.console.log('Saldos Totales: ',positivoTotal, negativoTotal);
	$("#saldoTotales").html('<div style="background:white;margin:10px;margin-bottom:25px;"><table style="width: 100%"><thead><tr><th style="font-size:large;border-bottom:1px solid gray;" colspan="2">Total</th></tr></thead><tbody><tr><td style="width:50%"><b style="color:green;font-size:x-large;">$'+positivoTotal+'</b></td><td style="border-left:1px solid gray;display:inline-grid"><b style="color:red;font-size:x-large;">-$'+(-negativoTotal)+'</b></td></tr></tbody></table></div>');
	selectSaldoInd();
}

/******************************************************************************/

var arrayAll = [];
var saldosArrayInd = [];
var arrayIDs = [];
var arrayResult = [];

function saldoTotal(){
	window.sessionStorage.setItem("Saldos", true);
db.transaction(function(transaction) {
	transaction.executeSql('CREATE TABLE IF NOT EXISTS slidingChange(slideID INTEGER NOT NULL PRIMARY KEY, A INTEGER NOT NULL, B INTEGER NOT NULL, sliding INTEGER NOT NULL)',[],nullHandler,errorHandler);
	arrayAll = [];
	saldosArrayInd = [];
	arrayResult = []; //Para parejas
	arrayIDs = [];
	var countNumPareja = 0;
	var Yoyo = window.localStorage.getItem("Yoyo");
	transaction.executeSql('SELECT * FROM jugadores, equipos WHERE jugadores.UserId = equipos.jugadorId AND jugadores.Early != ? ORDER BY jugadores.UserId ASC', ['YES'],
	function(transaction, result) {
		$("#saldoIndividual").html('');
		$('#selectIndividual').find('option').remove().end().append('<option value="0">Selecciona Persona</option>').val('');
		//$("select#selectIndividual").selectedIndex = 0;
		$('select#selectIndividual').val(0).change();
	for (var i = 0; i < result.rows.length; i++) {
		var row = result.rows.item(i);
	 	arrayAll.push(row);
	 	arrayIDs.push(row.UserId);
		saldosArrayInd.push(0);
		window.console.log(row.FirstName+' '+row.LastName+' '+row.UserId);
		if (row.numPareja !== 0) {
			countNumPareja++;
		};
		$('#selectIndividual').append('<option value='+row.UserId+'>'+row.FirstName+' '+row.LastName+'</option>');
		$('#saldoIndividual').append('<div title="saldoInd" id="sdoInd'+row.UserId+'" player="'+row.UserId+'" class="ui-grid-a center" style="position:relative;padding-top:10px;"><div class="vsInd">vs</div></div>');
	}
	$('#selectIndividual').selectmenu();
	console.log('Count Jugadores en pareja',countNumPareja);

	if (Yoyo==1)saldoYoyo();
	else{
		if (countNumPareja>=4 || Yoyo == 2)saldoParejas();
		else{saldoIndividuales();}
	}

	},errorHandler);
 },errorHandler,nullHandler);
}

function selectSaldoInd () {
	$('select#selectIndividual').off();
	$('#saldoIndividual > div').velocity({ opacity: 0 }, { display: "none" , duration: 0 });
	$('select#selectIndividual').on('change', function(e) {
		$('#selectIndividual').selectmenu("refresh");
		var check = $("#selectIndividual").val();
		$("#saldoIndividual > div").velocity({ opacity: 0 }, { display: "none" , duration: 0 });
		if (check != 0) {
			var elements = "[id=selectIndividual]";
			elements += ",[player='"+check+"']";
			$("#saldoIndividual > div").filter(elements).velocity({ opacity: 1 }, { display: "block" });
		}
		else{
			$("#saldoIndividual > div").velocity({ opacity: 0 }, { display: "none" });
		}
	});
}


function slideUpdate(userA, userB, newSlide) {
	db.transaction(function(transaction) {
		transaction.executeSql('SELECT 1 FROM slidingChange WHERE A = ? and B = ?', [userA, userB],function(transaction, result) {
			window.console.log('Check exist slider?',result.rows.length);
			window.console.log('A',userA,'B',userB,'ventaja',newSlide);
			if (result.rows.length==1) {
				window.console.log('Se actualiza registro de sliding');
				transaction.executeSql('UPDATE slidingChange SET sliding = ? WHERE A = ? AND B = ?', [newSlide, userA, userB], nullHandler,errorHandler);
			} else{
				window.console.log('Se registra cambio de sliding');
				transaction.executeSql('INSERT INTO slidingChange (A, B, sliding) VALUES (?, ?, ?)',[userA, userB, newSlide],nullHandler,errorHandler);
			}
		},errorHandler);
	},errorHandler,nullHandler);
}