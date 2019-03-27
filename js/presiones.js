function tablePresiones() {
    db.transaction(function(transaction) {
        transaction.executeSql('SELECT * FROM jugadores, equipos WHERE jugadores.UserId = equipos.jugadorId and jugadores.Early != ? ORDER BY equipos.numEquipo ASC, equipos.numPareja ASC', ['YES'],
            function(transaction, results) {
                var countPlayers = 0,
                    arrayPlayers = [],
                    arrayId = [],
                    allPlayers = {},
                    tableCreate = '',
                    selectCreate = '<option value="0">Selecciona Persona</option>';
                for (var i = 0; i < results.rows.length; i++) {
                    var row = results.rows.item(i);
                    if (row.numPareja != 0) countPlayers++;
                    arrayPlayers.push(row);
                    arrayId.push(row.UserId);
                    allPlayers[row.UserId] = row;
                    tableCreate += '<div playerId="' + arrayId[i] + '"><table data-role="table" data-mode="none" style="table-layout: fixed"><thead><tr><th>VS</th><th>Ronda 1</th><th>Ronda 2</th></tr></thead><tbody></tbody></table></div>';
                    selectCreate += '<option value="' + arrayId[i] + '">' + row.FirstName + ' ' + row.LastName + '</option>';
                }
                $('#presList').html(tableCreate);
                $('#presSelect').html(selectCreate);
                if ($('#presSelect').hasClass('ui-listview')) {
                    $('#presSelect').listview('refresh');
                } else {
                    $('#presSelect').trigger('create');
                }
                //$("select#presSelect").selectedIndex = 0;
                $('select#presSelect').val(0).change();
                transaction.executeSql('SELECT * FROM presionIndividual ORDER BY playerA ASC, playerB ASC, Ronda ASC, Nivel ASC', [],
                    function(transaction, result) {
                        console.log("Presion Individual", result);
                        for (var i = 0; i < arrayId.length; i++) {
                            var count = 1;
                            var limiter = 0;
                            var tableRows = '';
                            while (count < arrayId.length) {
                                var presR1 = [];
                                var presR2 = [];
                                var versusP = 0;
                                var firstRepeat = true;
                                console.log('Limiter?', limiter, result.rows.length);
                                for (var j = limiter; j < result.rows.length; j++) {
                                    var row = result.rows.item(j);
                                    //console.log(row);
                                    if (row.playerA == arrayId[i]) {
                                        if (firstRepeat) {
                                            versusP = row.playerB;
                                            firstRepeat = false;
                                        }
                                        if (versusP == row.playerB) {
                                            if (row.Ronda == 1) {
                                                presR1.push(row.Presion);
                                            } else {
                                                presR2.push(row.Presion);
                                            }
                                        } else {
                                            limiter = j;
                                            break;
                                        }
                                    }
                                }
                                if (presR2.length == 0) presR2.push('-');
                                var name = arrayPlayers[arrayId.indexOf(versusP)];
                                console.log(name);
                                //console.log(arrayPlayers);
                                console.log(arrayId);
                                console.log(versusP);
                                //<th><span style="float:left;" name="droper">&#9650</span>&#10133 MAS &#10134 Menos                    

                                tableRows += '<tr><th><div style="float:left;" name="droper"><span style="color:green">&#10133</span></div><div>' + name.FirstName + ' ' + name.LastName + '</div></th><td>' + presR1.join(',') + '</td><td>' + presR2.join(',') + '</td></tr><tr><td colspan="3" style="padding:0"><div class="slideTable" style="overflow:auto" sTP="' + arrayId[i] + ',' + versusP + '"></div></td></tr>';
                                count++;
                            }
                            //console.log(tableRows);
                            $('#presList').find('[playerId="' + arrayId[i] + '"] tbody').append(tableRows);
                        }
                        var Yoyo = window.localStorage.getItem("Yoyo");
                        if (countPlayers > 3 || (Yoyo == 1 || Yoyo == 2)) {
                            console.log('Presion Parejas!');
                            transaction.executeSql('SELECT * FROM jugadores AS j, parejasApuesta AS p WHERE j.UserId = p.IdJugador ORDER BY p.IdJugador ASC', [],
                                function(transaction, resultP) {
                                    //console.log(resultP.rows);
                                    transaction.executeSql('SELECT * FROM presionParejas ORDER BY PairA ASC, PairB ASC, Ronda ASC, Nivel ASC', [],
                                        function(transaction, result) {
                                            var tempActive = { 1: false, 2: false, 3: false };
                                            for (var i = 0; i < resultP.rows.length; i++) {
                                                if (Yoyo == 1 && (i % 2) == 1) {
                                                    if (resultP.rows.item(i).pareja < 4) continue;
                                                }
                                                var count = 1,
                                                    limiter = 0,
                                                    tableRows = '',
                                                    active = resultP.rows.item(i),
                                                    tempLimiter = -1
                                                console.log('activo', active);
                                                while (count < resultP.rows.length) {
                                                    var presR1 = [],
                                                        presR2 = [],
                                                        versusP,
                                                        firstRepeat = true;
                                                    console.log('Limiter?', limiter);
                                                    if (limiter == tempLimiter) {
                                                        count++;
                                                        break;
                                                    }
                                                    tempLimiter = limiter;
                                                    for (var j = limiter; j < result.rows.length; j++) {
                                                        var row = result.rows.item(j);
                                                        if (row.PairA == active.pareja) {
                                                            if (firstRepeat) {
                                                                versusP = row.PairB;
                                                                firstRepeat = false;
                                                            }
                                                            if (versusP == row.PairB) {
                                                                if (row.Ronda == 1) {
                                                                    presR1.push(row.Presion);
                                                                } else {
                                                                    presR2.push(row.Presion);
                                                                }
                                                            } else {
                                                                limiter = j;
                                                                break;
                                                            }
                                                        }
                                                    }
                                                    if (presR2.length == 0) presR2.push('-');
                                                    var namesV = '';
                                                    console.log(versusP);
                                                    console.log(resultP);
                                                    for (var k = 0; k < resultP.rows.length; k++) {
                                                        if (resultP.rows.item(k).pareja == versusP) {
                                                            if (namesV == '') namesV += resultP.rows.item(k).FirstName.charAt(0) + '.' + resultP.rows.item(k).LastName;
                                                            else
                                                                namesV += ' ' + resultP.rows.item(k).FirstName.charAt(0) + '.' + resultP.rows.item(k).LastName;
                                                        }
                                                    }
                                                    console.log(namesV);
                                                    tableRows += '<tr><th><div style="float:left;" name="droper"><span style="color:green">&#10133</span></div><div>' + namesV + '</div></th><td>' + presR1.join(',') + '</td><td>' + presR2.join(',') + '</td></tr><tr><td colspan="3" style="padding:0"><div class="slideTable" style="overflow:auto" pairSTP="' + active.pareja + ',' + versusP + '"></div></td></tr>';
                                                    count++;
                                                }
                                                var names = '';
                                                for (var k = 0; k < resultP.rows.length; k++) {
                                                    if (resultP.rows.item(k).pareja == active.pareja) {
                                                        if (names == '') names += resultP.rows.item(k).FirstName.charAt(0) + '.' + resultP.rows.item(k).LastName;
                                                        else
                                                            names += ' ' + resultP.rows.item(k).FirstName.charAt(0) + '.' + resultP.rows.item(k).LastName;
                                                    }
                                                }
                                                console.log(names);
                                                tableRows = '<tr><th colspan="3" class="nameStep" style="background: #434F5B;color:white;">' + names + '</th></tr>' + tableRows + '';
                                                //console.log(tableRows);
                                                console.log('PAREJAS', active.pareja, versusP);
                                                $('#presList').find('[playerId="' + active.UserId + '"] tbody').append(tableRows);
                                            }
                                            fillSlider(true);
                                            $('#presList').trigger('create');
                                            presionesSelect();
                                            $("body").pagecontainer("change", "#presns");
                                            //$.mobile.loading('show');
                                            /*$('.mainLoader').removeClass('hidden');
                                            $.blockUI({ message: null });*/
                                            //window.location.href = "#presns";
                                        }, errorHandler);
                                }, errorHandler);
                        } else {
                            fillSlider(false);
                            $('#presList').trigger('create');
                            presionesSelect();
                            $("body").pagecontainer("change", "#presns");
                            //$.mobile.loading('show');
                            /*$('.mainLoader').removeClass('hidden');
                            $.blockUI({ message: null });*/
                            //window.location.href = "#presns";
                        }
                    }, errorHandler);
            }, errorHandler);
    }, errorHandler, nullHandler);
}

function fillSlider(pairsCheck) {
    db.transaction(function(transaction) {
        //console.log('Filler');
        var fillerStep = '<table data-role="table" data-mode="none" style="border:none !important"><thead><tr><th>Hoyos</th>',
            fillStep = '',
            Hoyos = window.sessionStorage.getItem("Hoyos"),
            rondaNumber = window.sessionStorage.getItem("Ronda");
        if (rondaNumber == 2) Hoyos = Hoyos == 10 ? 1 : 10;
        var arrayVentajaOne = [],
            arrayVentajaTwo = [];
        window.console.log('Empieza en hoyo ' + Hoyos + '\nRonda ' + rondaNumber);
        transaction.executeSql('SELECT * FROM CampoTee, CampoPar WHERE CampoTee.idCampo = (SELECT idCampo FROM CampoTee WHERE active = 1) AND CampoTee.idTee = CampoPar.teeId ORDER BY CampoTee.idTee, CampoPar.Hoyo', [], function(transaction, result) {
            var campStringBlock = {};
            if (result != null && result.rows != null) {
                console.log(result);
                var inicio = parseInt(Hoyos);
                var fin = inicio + 8;
                console.log(inicio, fin);
                for (var l = 0; l < result.rows.length; l++) {
                    var row = result.rows.item(l);
                    //console.log(row.Hoyo, row.Hoyo>=inicio, row.Hoyo<=fin);
                    if (!campStringBlock.hasOwnProperty(row.idTee)) campStringBlock[row.idTee] = { arrayVentajaOne: [], arrayVentajaTwo: [], H1: '', H2: '', V1: '', V2: '', color: (row.color.charAt(0).toUpperCase() + row.color.slice(1)) };
                    if ((row.Hoyo >= inicio) && (row.Hoyo <= fin)) {
                        //console.log('IS THIS', campStringBlock.hasOwnProperty(row.idTee));
                        campStringBlock[row.idTee].arrayVentajaOne.push(row.Ventaja);
                        campStringBlock[row.idTee].V1 += '<th>' + row.Ventaja + '</th>';
                        campStringBlock[row.idTee].H1 += '<th> ' + row.Hoyo + ' </th>';
                    } else {
                        campStringBlock[row.idTee].arrayVentajaTwo.push(row.Ventaja);
                        campStringBlock[row.idTee].V2 += '<th>' + row.Ventaja + '</th>';
                        campStringBlock[row.idTee].H2 += '<th> ' + row.Hoyo + ' </th>';
                    }
                }
                window.console.log(campStringBlock);
            }

            transaction.executeSql('SELECT * FROM jugadores WHERE Early != ?', ['YES'],
                function(transaction, results) {
                    var arrayPlayers = [];
                    var arrayId = [];
                    for (var i = 0; i < results.rows.length; i++) {
                        var row = results.rows.item(i);
                        arrayPlayers.push(row);
                        arrayId.push(row.UserId);
                    }
                    transaction.executeSql('SELECT * FROM stepIndividual ORDER BY playerA ASC, playerB ASC, Ronda ASC', [], function(transaction, result) {
                        var stepArray = [];
                        for (var j = 0; j < result.rows.length; j++) {
                            var row = result.rows.item(j);
                            stepArray.push(row);
                        }
                        transaction.executeSql('SELECT * FROM Scores ORDER BY IdJugador ASC, Hoyo ASC', [], function(transaction, result) {
                            var count = 0;
                            var noSecond = '<td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td>';
                            var scoreString = '';
                            var scoreStringB = '';
                            var ventajaString = '';
                            var ventajaStringInv = '';
                            var lastRound = 0;
                            var pA = 0;
                            var pB = 0;
                            var dot = '<b style="color:red">•</b>';
                            var dotA = '';
                            var dotB = '';
                            while (count < stepArray.length) {
                                if (pA == 0) {
                                    pA = stepArray[count].playerA;
                                    pB = stepArray[count].playerB;
                                } else {
                                    if (pA != stepArray[count].playerA || pB != stepArray[count].playerB) {
                                        console.log('Player A vs Player B', pA, pB);
                                        var filler = fillerStep + fillStep + '</tr></thead><tbody>' + '<tr><th>' + arrayPlayers[arrayId.indexOf(pA)].FirstName + ' <b style="color:red">' + dotA + '</b></th>' + scoreString;
                                        filler += lastRound == 2 ? '</tr>' : (noSecond + '</tr>');
                                        filler += '<tr style="border-bottom:1px solid grey !important"><th>' + arrayPlayers[arrayId.indexOf(pB)].FirstName + ' <b style="color:red">' + dotB + '</b></th>' + scoreStringB;
                                        filler += lastRound == 2 ? '</tr>' : noSecond + '</tr>';
                                        filler += '<tr><th>Presiones</th>' + ventajaString;
                                        filler += lastRound == 2 ? '</tr></tbody></table>' : (noSecond + '</tr></tbody></table>');
                                        var fillerInv = fillerStep + fillStep + '</tr></thead><tbody>' + '<tr><th>' + arrayPlayers[arrayId.indexOf(pB)].FirstName + ' <b style="color:red">' + dotB + '</b></th>' + scoreStringB;
                                        fillerInv += lastRound == 2 ? '</tr>' : (noSecond + '</tr>');
                                        fillerInv += '<tr style="border-bottom:1px solid grey !important"><th>' + arrayPlayers[arrayId.indexOf(pA)].FirstName + ' <b style="color:red">' + dotA + '</b></th>' + scoreString;
                                        fillerInv += lastRound == 2 ? '</tr>' : noSecond + '</tr>';
                                        fillerInv += '<tr><th>Presiones</th>' + ventajaStringInv;
                                        fillerInv += lastRound == 2 ? '</tr></tbody></table>' : (noSecond + '</tr></tbody></table>');
                                        //console.log(filler);
                                        //console.log(fillerInv);
                                        $('#presList').find('div[sTP="' + pA + ',' + pB + '"]').append(filler).trigger('create');
                                        $('#presList').find('div[sTP="' + pB + ',' + pA + '"]').append(fillerInv).trigger('create');
                                        scoreString = '';
                                        scoreStringB = '';
                                        ventajaString = '';
                                        ventajaStringInv = '';
                                        scoreA = [];
                                        scoreB = [];
                                        pA = stepArray[count].playerA;
                                        pB = stepArray[count].playerB;
                                        dotA = '';
                                        dotB = '';
                                        //fillStep = '';
                                    }
                                }
                                lastRound = stepArray[count].Ronda;
                                //console.log(lastRound);
                                var scoreA = [];
                                var scoreB = [];
                                var HoyosT = Hoyos;
                                if (lastRound == 2) HoyosT = Hoyos == 10 ? 1 : 10;
                                var start = parseInt(HoyosT);
                                var end = start + 9;
                                for (var k = 0; k < result.rows.length; k++) {
                                    var rowScore = result.rows.item(k);
                                    if ((rowScore.Hoyo >= start) && (rowScore.Hoyo < end)) {
                                        if (rowScore.IdJugador == stepArray[count].playerA) {
                                            scoreA.push(rowScore.ScoreHoyo);
                                        }
                                        if (rowScore.IdJugador == stepArray[count].playerB) {
                                            scoreB.push(rowScore.ScoreHoyo);
                                        }
                                    }
                                }
                                window.console.log('scoreA ' + scoreA + '\nscoreB ' + scoreB);
                                if (stepArray[count].Ventaja < 0) {
                                    window.console.log('Ventaja para B de ' + (-stepArray[count].Ventaja) + '\n');

                                    console.log('TADAA', campStringBlock[arrayPlayers[arrayId.indexOf(pB)].tStart].arrayVentajaOne);
                                    fillStep = campStringBlock[arrayPlayers[arrayId.indexOf(pB)].tStart].H1 + '' +
                                        campStringBlock[arrayPlayers[arrayId.indexOf(pB)].tStart].H2 + '</tr><tr><th>' +
                                        campStringBlock[arrayPlayers[arrayId.indexOf(pB)].tStart].color + '</th>' +
                                        campStringBlock[arrayPlayers[arrayId.indexOf(pB)].tStart].V1 + '' +
                                        campStringBlock[arrayPlayers[arrayId.indexOf(pB)].tStart].V2;
                                    var arrayVentaja = lastRound == 2 ? campStringBlock[arrayPlayers[arrayId.indexOf(pB)].tStart].arrayVentajaTwo.slice() : campStringBlock[arrayPlayers[arrayId.indexOf(pB)].tStart].arrayVentajaOne.slice();
                                    var arrayVentajasort = arrayVentaja.slice();
                                    arrayVentajasort.sort(function(a, b) {
                                        return a - b
                                    });
                                    window.console.log(arrayVentaja, arrayVentajasort);

                                    var ajuste = -stepArray[count].Ventaja;
                                    var vIndex = 0;
                                    var sIndex = 0;
                                    //dotB = ajuste;
                                    while (ajuste > 0) {
                                        if (vIndex >= arrayVentaja.length) {
                                            vIndex = 0;
                                        }
                                        dotB++;
                                        sIndex = arrayVentaja.indexOf(arrayVentajasort[vIndex++]);
                                        scoreB[sIndex] = scoreB[sIndex] + dot;
                                        ajuste--;
                                    }
                                }
                                if (stepArray[count].Ventaja > 0) {
                                    window.console.log('Ventaja para A de ' + stepArray[count].Ventaja + '\n');

                                    console.log('TADAA', campStringBlock[arrayPlayers[arrayId.indexOf(pA)].tStart].arrayVentajaOne);
                                    fillStep = campStringBlock[arrayPlayers[arrayId.indexOf(pA)].tStart].H1 + '' +
                                        campStringBlock[arrayPlayers[arrayId.indexOf(pA)].tStart].H2 + '</tr><tr><th>' +
                                        campStringBlock[arrayPlayers[arrayId.indexOf(pA)].tStart].color + '</th>' +
                                        campStringBlock[arrayPlayers[arrayId.indexOf(pA)].tStart].V1 + '' +
                                        campStringBlock[arrayPlayers[arrayId.indexOf(pA)].tStart].V2;
                                    var arrayVentaja = lastRound == 2 ? campStringBlock[arrayPlayers[arrayId.indexOf(pA)].tStart].arrayVentajaTwo.slice() : campStringBlock[arrayPlayers[arrayId.indexOf(pA)].tStart].arrayVentajaOne.slice();
                                    var arrayVentajasort = arrayVentaja.slice();
                                    arrayVentajasort.sort(function(a, b) {
                                        return a - b
                                    });
                                    window.console.log(arrayVentaja, arrayVentajasort);

                                    var ajuste = stepArray[count].Ventaja;
                                    var vIndex = 0;
                                    var sIndex = 0;
                                    //dotA = ajuste;
                                    while (ajuste > 0) {
                                        if (vIndex >= arrayVentaja.length) {
                                            vIndex = 0;
                                        }
                                        dotA++;
                                        sIndex = arrayVentaja.indexOf(arrayVentajasort[vIndex++]);
                                        scoreA[sIndex] = scoreA[sIndex] + dot;
                                        ajuste--;
                                    }
                                }
                                window.console.log('scoreA ' + scoreA + '\nscoreB ' + scoreB);
                                var VentArray = stepArray[count].Steping.split('|');
                                var VentArrayInv = [];
                                for (var m = 0; m < VentArray.length; m++) {
                                    var temp = VentArray[m].split(',');
                                    for (var n = 0; n < temp.length; n++) {
                                        temp[n] = -temp[n];
                                    }
                                    VentArrayInv.push(temp.join(','));
                                }
                                window.console.log(VentArray, VentArrayInv);
                                for (var o = 0; o < scoreA.length; o++) {
                                    scoreString += '<td>' + scoreA[o] + '</td>';
                                    scoreStringB += '<td>' + scoreB[o] + '</td>';
                                    ventajaString += '<td>' + VentArray[o] + '</td>';
                                    ventajaStringInv += '<td>' + VentArrayInv[o] + '</td>';
                                }
                                count++;
                                //console.log('FillStep', fillStep)
                            }
                            console.log('lastRound', lastRound);
                            var filler = fillerStep + fillStep + '</tr></thead><tbody>' + '<tr><th>' + arrayPlayers[arrayId.indexOf(pA)].FirstName + ' <b style="color:red">' + dotA + '</b></th>' + scoreString;
                            filler += lastRound == 2 ? '</tr>' : (noSecond + '</tr>');
                            filler += '<tr style="border-bottom:1px solid grey !important"><th>' + arrayPlayers[arrayId.indexOf(pB)].FirstName + ' <b style="color:red">' + dotB + '</b></th>' + scoreStringB;
                            filler += lastRound == 2 ? '</tr>' : noSecond + '</tr>';
                            filler += '<tr><th>Presiones</th>' + ventajaString;
                            filler += lastRound == 2 ? '</tr></tbody></table>' : (noSecond + '</tr></tbody></table>');
                            var fillerInv = fillerStep + fillStep + '</tr></thead><tbody>' + '<tr><th>' + arrayPlayers[arrayId.indexOf(pB)].FirstName + ' <b style="color:red">' + dotB + '</b></th>' + scoreStringB;
                            fillerInv += lastRound == 2 ? '</tr>' : (noSecond + '</tr>');
                            fillerInv += '<tr style="border-bottom:1px solid grey !important"><th>' + arrayPlayers[arrayId.indexOf(pA)].FirstName + ' <b style="color:red">' + dotA + '</b></th>' + scoreString;
                            fillerInv += lastRound == 2 ? '</tr>' : noSecond + '</tr>';
                            fillerInv += '<tr><th>Presiones</th>' + ventajaStringInv;
                            fillerInv += lastRound == 2 ? '</tr></tbody></table>' : (noSecond + '</tr></tbody></table>');
                            //console.log(filler);
                            //console.log(fillerInv);
                            $('#presList').find('div[sTP="' + pA + ',' + pB + '"]').append(filler).trigger('create');
                            $('#presList').find('div[sTP="' + pB + ',' + pA + '"]').append(fillerInv).trigger('create');
                            if (pairsCheck) pairFiller.apply(null, [fillerStep, Hoyos, campStringBlock]);
                            else {
                                /*$.mobile.loading( "hide" );*/
                                $('.mainLoader').addClass('hidden');
                                $('body').spin(false);
                                //$.unblockUI();
                            }
                        }, errorHandler);
                    }, errorHandler);
                }, errorHandler);
        }, errorHandler);
    }, errorHandler, nullHandler);
}

function pairFiller(fillerStep, Hoyos, campStringBlock) {
    db.transaction(function(transaction) {
        console.log('\nSTEP PAREJAS \n');
        var fillStep = fillerStep;
        transaction.executeSql('SELECT * FROM jugadores, parejasApuesta WHERE jugadores.UserId = parejasApuesta.IdJugador ORDER BY parejasApuesta.pareja ASC', [],
            function(transaction, results) {
                var allPlayers = {},
                    firstCheck = true,
                    currentPair = 0;
                for (var q = 0; q < results.rows.length; q++) {
                    var row = results.rows.item(q);
                    if (currentPair != row.pareja) {
                        currentPair = row.pareja;
                        firstCheck = true;
                    }
                    if (firstCheck) {
                        allPlayers[currentPair] = { "A": row, "B": null };
                        firstCheck = false;
                    } else {
                        allPlayers[currentPair].B = row;
                    }
                }
                transaction.executeSql('SELECT * FROM stepParejas AS a, stakeParejas AS b WHERE a.PairA = b.PairA AND a.PairB = b.PairB ORDER BY PairA ASC, PairB ASC, Ronda ASC', [], function(transaction, resultStep) {
                    /**********************************/
                    transaction.executeSql('SELECT * FROM Scores ORDER BY IdJugador ASC, Hoyo ASC', [], function(transaction, result) {
                        var count = 0;
                        var scoreString1 = '',
                            scoreString2 = '',
                            scoreStringB1 = '',
                            scoreStringB2 = '',
                            ventajaString = '',
                            ventajaStringInv = '',
                            lastRound = 0,
                            pA = 0,
                            pB = 0,
                            parejaA, parejaB,
                            dot = '<b style="color:red">•</b>',
                            dotA1 = 0,
                            dotA2 = 0,
                            dotB1 = 0,
                            dotB2 = 0;
                        console.log(resultStep);
                        var stepArray = [];
                        for (var j = 0; j < resultStep.rows.length; j++) {
                            var row = resultStep.rows.item(j);
                            stepArray.push(row);
                            if (pA == 0) {
                                pA = row.PairA,
                                    pB = row.PairB,
                                    parejaA = allPlayers[row.PairA],
                                    parejaB = allPlayers[row.PairB];
                            }
                            if (pA != row.PairA || pB != row.PairB) {
                                var filler, fillerInv;
                                fillerStringP(
                                    fillerStep + fillStep, lastRound,
                                    parejaA.A.FirstName, parejaA.B.FirstName,
                                    parejaB.A.FirstName, parejaB.B.FirstName,
                                    dotA1, dotA2,
                                    dotB1, dotB2,
                                    scoreString1, scoreString2,
                                    scoreStringB1, scoreStringB2,
                                    ventajaString, ventajaStringInv,
                                    function(a, b) {
                                        filler = a, fillerInv = b;
                                    });

                                //console.log(filler);
                                //console.log(fillerInv);
                                console.log('Step', pA, pB);
                                $('#presList').find('div[pairsTP="' + pA + ',' + pB + '"]').append(filler).trigger('create');
                                $('#presList').find('div[pairsTP="' + pB + ',' + pA + '"]').append(fillerInv).trigger('create');
                                scoreString1 = '', scoreString2 = '',
                                    scoreStringB1 = '', scoreStringB2 = '',
                                    ventajaString = '', ventajaStringInv = '',
                                    scoreA1 = [], scoreA2 = [],
                                    scoreB1 = [], scoreB2 = [],
                                    pA = row.PairA, pB = row.PairB,
                                    parejaA = allPlayers[row.PairA], parejaB = allPlayers[row.PairB],
                                    dotA1 = 0, dotA2 = 0,
                                    dotB1 = 0, dotB2 = 0;
                            }
                            lastRound = row.Ronda;
                            //console.log(lastRound);
                            var scoreA1 = [],
                                scoreA2 = [],
                                scoreB1 = [],
                                scoreB2 = [],
                                HoyosT = Hoyos;
                            if (lastRound == 2) HoyosT = Hoyos == 10 ? 1 : 10;
                            var start = parseInt(HoyosT),
                                end = start + 9;
                            for (var k = 0; k < result.rows.length; k++) {
                                var rowScore = result.rows.item(k);
                                if ((rowScore.Hoyo >= start) && (rowScore.Hoyo < end)) {
                                    if (rowScore.IdJugador == parejaA.A.UserId) {
                                        scoreA1.push(rowScore.ScoreHoyo);
                                    }
                                    if (rowScore.IdJugador == parejaA.B.UserId) {
                                        scoreA2.push(rowScore.ScoreHoyo);
                                    }
                                    if (rowScore.IdJugador == parejaB.A.UserId) {
                                        scoreB1.push(rowScore.ScoreHoyo);
                                    }
                                    if (rowScore.IdJugador == parejaB.B.UserId) {
                                        scoreB2.push(rowScore.ScoreHoyo);
                                    }
                                }
                            }
                            window.console.log('A1 ' + scoreA1 + '\nA2 ' + scoreA2 + '\nB1 ' + scoreB1 + '\nB2 ' + scoreB2);
                            var splitter = row.Ventaja.toString().split('.'),
                                stepVentaja = splitter[0],
                                stepPlayer = splitter[1];
                            if (stepVentaja < 0) {
                                window.console.log('Ventaja para B de ' + (-row.Ventaja) + '\n');

                                var dotFiller = fillerDotP(campStringBlock, lastRound,
                                    parejaB.A.tStart, parejaB.B.tStart,
                                    dot, scoreB1, scoreB2, -stepVentaja, stepPlayer, row.ventager, row.type);

                                fillStep = dotFiller.fillStep;
                                dotB1 += dotFiller.dotA,
                                    dotB2 += dotFiller.dotB;
                                console.log('CHECK FILLER', dotFiller, fillStep, dotB1, dotB2);
                            }
                            if (stepVentaja > 0) {
                                window.console.log('Ventaja para A de ' + row.Ventaja + '\n');

                                var dotFiller = fillerDotP(campStringBlock, lastRound,
                                    parejaA.A.tStart, parejaA.B.tStart,
                                    dot, scoreA1, scoreA2,
                                    stepVentaja, stepPlayer, row.ventager, row.type);

                                fillStep = dotFiller.fillStep;
                                dotA1 += dotFiller.dotA,
                                    dotA2 += dotFiller.dotB;
                                console.log('CHECK FILLER', dotFiller, fillStep, dotA1, dotA2);
                            }
                            window.console.log('A1 ' + scoreA1 + '\nA2 ' + scoreA2 + '\nB1 ' + scoreB1 + '\nB2 ' + scoreB2);
                            var VentArray = row.Steping.split('|');
                            var VentArrayInv = [];
                            for (var m = 0; m < VentArray.length; m++) {
                                var temp = VentArray[m].split(',');
                                for (var n = 0; n < temp.length; n++) {
                                    temp[n] = -temp[n];
                                }
                                VentArrayInv.push(temp.join(','));
                            }
                            window.console.log(VentArray, VentArrayInv);
                            for (var o = 0; o < scoreA1.length; o++) {
                                scoreString1 += '<td>' + scoreA1[o] + '</td>';
                                scoreStringB1 += '<td>' + scoreB1[o] + '</td>';
                                scoreString2 += '<td>' + scoreA2[o] + '</td>';
                                scoreStringB2 += '<td>' + scoreB2[o] + '</td>';
                                ventajaString += '<td>' + VentArray[o] + '</td>';
                                ventajaStringInv += '<td>' + VentArrayInv[o] + '</td>';
                            }
                        }

                        console.log('lastRound', lastRound);
                        var filler, fillerInv;
                        fillerStringP(
                            fillerStep + fillStep, lastRound,
                            parejaA.A.FirstName, parejaA.B.FirstName,
                            parejaB.A.FirstName, parejaB.B.FirstName,
                            dotA1, dotA2,
                            dotB1, dotB2,
                            scoreString1, scoreString2,
                            scoreStringB1, scoreStringB2,
                            ventajaString, ventajaStringInv,
                            function(a, b) {
                                filler = a, fillerInv = b;
                            });
                        //console.log(filler);
                        //console.log(fillerInv);
                        console.log('Step', pA, pB);
                        $('#presList').find('div[pairsTP="' + pA + ',' + pB + '"]').append(filler).trigger('create');
                        $('#presList').find('div[pairsTP="' + pB + ',' + pA + '"]').append(fillerInv).trigger('create');
                        /*$.mobile.loading( "hide" );*/
                        $('.mainLoader').addClass('hidden');
                        $('body').spin(false);
                        //$.unblockUI();
                    }, errorHandler);

                    /**********************************/
                }, errorHandler);
            }, errorHandler);
    }, errorHandler, nullHandler);
}

function fillerStringP(filling, round, nameA1, nameA2, nameB1, nameB2, dotA1, dotA2, dotB1, dotB2, scoreA1, scoreA2, scoreB1, scoreB2, ventaja, ventajaInv, callback) {
    dotA1 = dotA1 == 0 ? '' : dotA1;
    dotA2 = dotA2 == 0 ? '' : dotA2;
    dotB1 = dotB1 == 0 ? '' : dotB1;
    dotB2 = dotB2 == 0 ? '' : dotB2;
    var nS = '<td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td>';
    var roundFill = round == 2 ? '</tr>' : (nS + '</tr>');
    var filler = filling + '</tr></thead><tbody>' + '<tr><th>' + nameA1 + ' <b style="color:red">' + dotA1 + '</b></th>' + scoreA1 + roundFill +
        '<tr style="border-bottom:1px solid grey !important"><th>' + nameA2 + ' <b style="color:red">' + dotA2 + '</b></th>' + scoreA2 + roundFill +
        '<tr><th>' + nameB1 + ' <b style="color:red">' + dotB1 + '</b></th>' + scoreB1 + roundFill +
        '<tr style="border-bottom:1px solid grey !important"><th>' + nameB2 + ' <b style="color:red">' + dotB2 + '</b></th>' + scoreB2 + roundFill +
        '<tr><th>Presiones</th>' + ventaja;
    filler += round == 2 ? '</tr></tbody></table>' : (nS + '</tr></tbody></table>');

    var fillerInv = filling + '</tr></thead><tbody>' + '<tr><th>' + nameB1 + ' <b style="color:red">' + dotB1 + '</b></th>' + scoreB1 + roundFill +
        '<tr style="border-bottom:1px solid grey !important"><th>' + nameB2 + ' <b style="color:red">' + dotB2 + '</b></th>' + scoreB2 + roundFill +
        '<tr><th>' + nameA1 + ' <b style="color:red">' + dotA1 + '</b></th>' + scoreA1 + roundFill +
        '<tr style="border-bottom:1px solid grey !important"><th>' + nameA2 + ' <b style="color:red">' + dotA2 + '</b></th>' + scoreA2 + roundFill +
        '<tr><th>Presiones</th>' + ventajaInv;
    fillerInv += round == 2 ? '</tr></tbody></table>' : (nS + '</tr></tbody></table>');

    callback(filler, fillerInv);
}

function fillerDotP(campStringBlock, lastRound, startA, startB, dot, scoreA, scoreB, stepVentaja, stepPlayer, stakeVentager, stakeType) {
    var ventStr = '';
    var dotA = 0,
        dotB = 0;
    if (startA != startB)
        ventStr = '</tr><tr><th>' + campStringBlock[startB].color + '</th>' +
        campStringBlock[startB].V1 + '' + campStringBlock[startB].V2;

    fillStep = campStringBlock[startA].H1 + '' + campStringBlock[startA].H2 + '</tr><tr><th>' + campStringBlock[startA].color + '</th>' + campStringBlock[startA].V1 + '' + campStringBlock[startA].V2 + ventStr + '</tr></thead><tbody>';

    var arrayVentaja1, arrayVentaja2;
    if (lastRound == 2) {
        arrayVentaja1 = campStringBlock[startA].arrayVentajaTwo.slice();
        arrayVentaja2 = campStringBlock[startB].arrayVentajaTwo.slice();
    } else {
        arrayVentaja1 = campStringBlock[startA].arrayVentajaOne.slice();
        arrayVentaja2 = campStringBlock[startB].arrayVentajaOne.slice();
    }

    var arrayVentajasort1 = arrayVentaja1.slice(),
        arrayVentajasort2 = arrayVentaja2.slice();
    arrayVentajasort1.sort(function(a, b) {
        return a - b
    });
    arrayVentajasort2.sort(function(a, b) {
        return a - b
    });
    console.log(arrayVentaja1, arrayVentaja2, arrayVentajasort1, arrayVentajasort2);

    var ajuste = stepVentaja,
        vIndex = 0,
        sIndex = 0,
        ajuCount = 0,
        ajuPlayer = stepPlayer;
    if (stakeVentager == "A" || stakeVentager == "B") ajuPlayer = stakeVentager == "A" ? 1 : 2;
    while (ajuste > 0) {
        if (vIndex >= arrayVentaja1.length) {
            vIndex = 0;
        }
        if (ajuPlayer == 1) {
            sIndex = arrayVentaja1.indexOf(arrayVentajasort1[vIndex++]);
            dotA++;
            scoreA[sIndex] = scoreA[sIndex] + dot;
        }
        if (ajuPlayer == 2) {
            sIndex = arrayVentaja2.indexOf(arrayVentajasort2[vIndex++]);
            dotB++;
            scoreB[sIndex] = scoreB[sIndex] + dot;
        }
        ajuCount++;
        ajuste--;
        if (ajuCount % 9 == 0 && stakeType == "SPLIT") {
            ajuPlayer = ajuPlayer == 1 ? 2 : 1;
        }
    }

    console.log('CHECK INTERNAL', fillStep, dotA, dotB);
    return {
        "fillStep": fillStep,
        "dotA": dotA,
        "dotB": dotB
    };
}

// function stepIBuilder(transaction, playerA, playerB, ronda, ventaja, step) {
//     console.log(playerA, playerB, ronda, ventaja, step)
//     //db.transaction(function(transaction) {
//     doQuery(transaction, 'INSERT INTO stepIndividual(playerA, playerB, Ronda, Ventaja, Steping) VALUES (?, ?, ?, ?, ?)', [playerA, playerB, ronda, ventaja, step], nullHandler);
//     //}, errorHandler, nullHandler);
//     return true;
// }
// //stepPBuilder(stepPresion, row.pairA, row.pairB, ventajaStep, rondaNumber);
// function stepPBuilder(transaction, step, PairA, PairB, ventaja, ronda) {
//     alert(PairA + " " + PairB + " " + ronda + " " + ventaja + " " + step);
//     console.log(PairA, PairB, ronda, ventaja, step);
//     //db.transaction(function(transaction) {
//     doQuery(transaction, 'INSERT INTO stepParejas(PairA, PairB, Ronda, Ventaja, Steping) VALUES (?, ?, ?, ?, ?)', [PairA, PairB, ronda, ventaja, step], nullHandler);
//     //}, errorHandler, nullHandler);
// }

function presionesSelect() {
    /*$('select#presSelect').off();
    $("#presList > div > table").off();*/
    $('#presns [data-role="content"] *').off();
    $('#presList > div').velocity({ opacity: 0 }, { display: "none", duration: 0 });

    $('select#presSelect').on('change', function(e) {
        $('select#presSelect').selectmenu("refresh");
        var check = $("#presSelect").val();
        $('#presList > div').velocity({ opacity: 0 }, { display: "none", duration: 0 });
        if (check != 0) {
            var elements = "[id=presList]";
            elements += ",[playerId='" + check + "']";
            $("#presList > div").filter(elements).velocity({ opacity: 1 }, {
                display: "block",
                complete: function() {
                    $("#presList > [playerId='" + check + "']").find("div[name!=\"droper\"]:first").trigger('click');
                }
            });
        } else {
            $('#presList > div').velocity({ opacity: 0 }, { display: "none" });
        }
    });

    $('#presList').find("td[colspan=3]").find("div").velocity("slideUp", { duration: 0 });

    $("#presList > div > table").on('click', function(event) {
        event.stopPropagation();
        var $target = $(event.target);
        if ($target.hasClass('nameStep')) return;
        //console.log('Clicked');
        if ($target.closest("div").hasClass('slideTable')) {
            /*console.log('slideUp?!');
            $target.closest("div").velocity("slideUp");*/
        } else {
            var changeDrop = $target.closest("tr");
            var newTar = $target.closest("tr").next().find("div[name!=\"droper\"]");
            if (newTar.css('display') == "none") {
                //console.log('slideDown!');

                var allExpanded = $('#presList').find("div.expanded");
                //console.log(allExpanded.closest("tr").prev());
                allExpanded.closest("tr").prev().find('div[name="droper"]').html('<span style="color:green">&#10133</span>');
                allExpanded.velocity("slideUp").removeClass('expanded');

                /*OLD $('#presList').find('div[name="droper"]').removeClass("expanded");
                changeDrop.find('div[name="droper"]').addClass("expanded");*/

                //$('#presList').find("td[colspan=3]").find("div").not(newTar).velocity("slideUp");
                //$('#presList').find('div[name="droper"]').html('<span style="color:green">&#10133</span>');
                changeDrop.find('div[name="droper"]').html('<span style="color:red">&#10134</span>');
                newTar.velocity("slideDown").addClass('expanded');
            } else {
                //console.log('slideUp!');
                if (newTar.hasClass('expanded')) {
                    changeDrop.find('div[name="droper"]').html('<span style="color:green">&#10133</span>');
                    newTar.velocity("slideUp").removeClass('expanded');

                };
            };
        }
    });
}
