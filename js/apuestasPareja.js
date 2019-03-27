function parejasApuesta(checkYo) {
    bancoApuesta(1);
    db.transaction(function(transaction) {
        doQuery(transaction, 'DROP TABLE IF EXISTS parejasApuesta', false, nullHandler);
        doQuery(transaction, 'CREATE TABLE IF NOT EXISTS parejasApuesta(parejasId INTEGER NOT NULL PRIMARY KEY, pareja INTEGER NOT NULL, IdJugador INTEGER NOT NULL)', [], nullHandler);
        var earlyT = 'NO';
        if (checkYo == 1 || checkYo == 2) { earlyT = 'SOLO' };
        doQuery(transaction, 'SELECT * FROM jugadores, equipos WHERE jugadores.UserId = equipos.jugadorId AND Early = ? ORDER BY equipos.numPareja ASC', [earlyT],
            function(transaction, result) {
                if (result != null && result.rows != null) {
                    if (checkYo == 1) {
                        var pareja = 1;
                        var arraySolo = [];
                        for (var i = 0; i < result.rows.length; i++) {
                            doQuery(transaction, 'INSERT INTO parejasApuesta (pareja, IdJugador) VALUES (?, ?)', [pareja, result.rows.item(i).UserId], nullHandler);
                            doQuery(transaction, 'INSERT INTO parejasApuesta (pareja, IdJugador) VALUES (?, ?)', [pareja, result.rows.item(i).UserId], nullHandler);
                            pareja++;
                        }
                        doQuery(transaction, 'INSERT INTO parejasApuesta (pareja, IdJugador) VALUES (?, ?)', [pareja, result.rows.item(1).UserId], nullHandler);
                        doQuery(transaction, 'INSERT INTO parejasApuesta (pareja, IdJugador) VALUES (?, ?)', [pareja++, result.rows.item(2).UserId], nullHandler);
                        doQuery(transaction, 'INSERT INTO parejasApuesta (pareja, IdJugador) VALUES (?, ?)', [pareja, result.rows.item(0).UserId], nullHandler);
                        doQuery(transaction, 'INSERT INTO parejasApuesta (pareja, IdJugador) VALUES (?, ?)', [pareja++, result.rows.item(2).UserId], nullHandler);
                        doQuery(transaction, 'INSERT INTO parejasApuesta (pareja, IdJugador) VALUES (?, ?)', [pareja, result.rows.item(0).UserId], nullHandler);
                        doQuery(transaction, 'INSERT INTO parejasApuesta (pareja, IdJugador) VALUES (?, ?)', [pareja, result.rows.item(1).UserId], nullHandler);
                        //$('#dbParejasApuesta').html('<br><br><p style="text-align: center;font-size:large;color:#203744;"><b>APUESTAS USANDO YOYO</b></p>');
                        /*window.location.href = "#page18";*/
                        stakeParejas();
                        return;
                    } else if (checkYo == 2) {
                        db.transaction(function(transaction) {
                            var nEarly = 'SOLO';
                            var numPair = 1;
                            transaction.executeSql('SELECT * FROM jugadores, equipos WHERE jugadores.UserId = equipos.jugadorId AND jugadores.Early = ? ORDER BY equipos.numEquipo ASC', [nEarly],
                                function(transaction, result) {
                                    if (result != null && result.rows != null) {
                                        var teamPlayers = { one: {}, two: {} };
                                        //console.log('Players', result.rows);
                                        for (var i = 0; i < result.rows.length; i++) {
                                            var row = result.rows.item(i);
                                            //console.log('Row', row);
                                            if (row.numEquipo == 1) teamPlayers.one[row.UserId] = row;
                                            else teamPlayers.two[row.UserId] = row;
                                        }

                                        for (var team in teamPlayers) {
                                            console.log(team);
                                            for (var player in teamPlayers[team]) {
                                                for (var player2 in teamPlayers[team]) {
                                                    if (player >= player2) continue;
                                                    console.log(player, player2, 'Pareja', numPair);
                                                    transaction.executeSql('INSERT INTO parejasApuesta (pareja, IdJugador) VALUES (?, ?)', [numPair, player], nullHandler, errorHandler);
                                                    transaction.executeSql('INSERT INTO parejasApuesta (pareja, IdJugador) VALUES (?, ?)', [numPair, player2], nullHandler, errorHandler);
                                                    numPair++;
                                                }
                                            }
                                        }
                                        //Aqui
                                        stakeParejas();
                                    }
                                }, nullHandler, errorHandler);
                        }, errorHandler, nullHandler);
                    } else if (result.rows.length <= 3) {
                        //bancoApuesta(1);
                        $('#indApsDet div[data-role="navbar"]').addClass('hidden');
                        //window.location.href = "#indAps";
                        return;
                    } else {
                        var pareja = result.rows.item(0).numPareja;
                        var paircheck = pareja;
                        window.console.log('pareja inicial ' + pareja);
                        for (var i = 0; i < result.rows.length; i++) {
                            var count = i;
                            var arrayPair = [];
                            while (count < result.rows.length) {
                                if (result.rows.item(count).numPareja == paircheck) {
                                    arrayPair.push(result.rows.item(count));
                                    window.console.log('arrayPair entro = ' + result.rows.item(count).FirstName + ' ' + result.rows.item(count).LastName);
                                }
                                count++;
                            }
                            paircheck++;
                            if (arrayPair.length <= 2) {
                                window.console.log('Pareja normal');
                                window.console.log('pareja ' + pareja);
                                for (var j = 0; j < arrayPair.length; j++) {
                                    window.console.log('Insert ' + arrayPair[j].FirstName + ' ' + arrayPair[j].LastName + ' Pareja ' + pareja);
                                    doQuery(transaction, 'INSERT INTO parejasApuesta (pareja, IdJugador) VALUES (?, ?)', [pareja, arrayPair[j].UserId], nullHandler);
                                }
                                pareja++;
                            } else {
                                window.console.log('Tripareja!');
                                for (var k = 0; k < arrayPair.length; k++) {
                                    for (var l = k; l < arrayPair.length; l++) {
                                        if (l <= k) {} else {
                                            window.console.log('Insert ' + arrayPair[k].FirstName + ' ' + arrayPair[k].LastName + ' Pareja ' + pareja);
                                            doQuery(transaction, 'INSERT INTO parejasApuesta (pareja, IdJugador) VALUES (?, ?)', [pareja, arrayPair[k].UserId], nullHandler);
                                            window.console.log('Insert ' + arrayPair[l].FirstName + ' ' + arrayPair[l].LastName + ' Pareja ' + pareja);
                                            doQuery(transaction, 'INSERT INTO parejasApuesta (pareja, IdJugador) VALUES (?, ?)', [pareja, arrayPair[l].UserId], nullHandler);
                                            pareja++;
                                        }
                                    }
                                }
                            }
                            window.console.log('\n');
                        }
                        //window.location.href = "#page18";
                        stakeParejas();
                    }
                }
            });
    }, errorHandler, nullHandler);
}

function listDBParejas() {
    db.transaction(function(transaction) {
        doQuery(transaction, 'SELECT * FROM jugadores, parejasApuesta WHERE jugadores.UserId = parejasApuesta.IdJugador ORDER BY parejasApuesta.pareja ASC', [],
            function(transaction, results) {
                if (results != null && results.rows != null) {
                    console.log(results);
                    var idCount = 1;
                    $('#dbStakePair').html('');
                    var resultArray = [];
                    for (var i = 0; i < results.rows.length; i++) {
                        resultArray.push(results.rows.item(i))
                    }
                    doQuery(transaction, 'SELECT * FROM stakeParejas', [],
                        function(transaction, result) {
                            var parCheck = 1;
                            for (var i = 0; i < result.rows.length; i++) {
                                var apuestaRow = result.rows.item(i);
                                console.log(apuestaRow);
                                var valueA = apuestaRow.Ronda1,
                                    valueB = apuestaRow.Ronda2,
                                    valueM = apuestaRow.Match,
                                    pA1 = undefined,
                                    pA2 = undefined,
                                    pB1 = undefined,
                                    pB2 = undefined;

                                for (var j = 0; j < resultArray.length; j++) {
                                    var jug = resultArray[j];
                                    if (jug.pareja == apuestaRow.PairA) {
                                        if (pA1 == undefined) pA1 = jug;
                                        else pA2 = jug;
                                    }
                                    if (jug.pareja == apuestaRow.PairB) {
                                        if (pB1 == undefined) pB1 = jug;
                                        else pB2 = jug;
                                    }
                                }
                                var nameA = pA1.FirstName + ' ' + pA1.LastName + ' <span class="textGreen">' + pA1.Handicap + '</span>',
                                    nameB = pB1.FirstName + ' ' + pB1.LastName + ' <span class="textGreen">' + pB1.Handicap + '</span>',
                                    hcp1 = pA1.Handicap + pA2.Handicap,
                                    hcp2 = pB1.Handicap + pB2.Handicap;
                                nameA += pA1.UserId == pA2.UserId ? '' : ' ' + pA2.FirstName + ' ' + pA2.LastName + ' <span class="textGreen">' + pA2.Handicap + '</span>';
                                nameB += pB1.UserId == pB2.UserId ? '' : ' ' + pB2.FirstName + ' ' + pB2.LastName + ' <span class="textGreen">' + pB2.Handicap + '</span>';
                                console.log(nameA, nameB);
                                //Creamos el div contenedor para la apuesta.
                                var apInd = '<div class="apuestasDiv" title="ckStPr" style="padding-top: 1px" pairA="' + apuestaRow.PairA + '" pairB="' + apuestaRow.PairB + '" playerA1="' + pA1.UserId + '" playerA2="' + pA2.UserId + '" playerB1="' + pB1.UserId + '" playerB2="' + pB2.UserId + '">';

                                //Se adjunta el texto VS de esta apuesta.
                                apInd += '<p style="text-align: center;"><b>' + nameA + '</p><div class="vsParejas">vs.</div><p style="text-align: center;"><b>' + nameB + '</b></p>';

                                // Calcular a quien se le da ventaja
                                var ventNameA,
                                    ventNameB,
                                    ventHcpA,
                                    ventHcpB,
                                    ventDif;
                                if ((pA1.Handicap + pA2.Handicap) > (pB1.Handicap + pB2.Handicap)) {
                                    ventNameA = pA1.FirstName,
                                        ventNameB = pA2.FirstName,
                                        ventHcpA = pA1.Handicap,
                                        ventHcpB = pA2.Handicap;
                                    ventDif = (pA1.Handicap + pA2.Handicap) - (pB1.Handicap + pB2.Handicap);
                                } else {
                                    ventNameA = pB1.FirstName,
                                        ventNameB = pB2.FirstName,
                                        ventHcpA = pB1.Handicap,
                                        ventHcpB = pB2.Handicap;
                                    ventDif = (pB1.Handicap + pB2.Handicap) - (pA1.Handicap + pA2.Handicap);
                                }
                                var atributesA = '',
                                    atributesB = '';
                                if (ventHcpA != ventHcpB) atributesA += 'disabled="disabled" ', atributesB += 'disabled="disabled" ';
                                if (ventHcpA >= ventHcpB || apuestaRow.ventager == 'A') atributesA += 'checked="checked"';
                                if (ventHcpA < ventHcpB || apuestaRow.ventager == 'B') atributesB += 'checked="checked"';

                                var radioButtons =
                                    '<div class="parejasRadioDiv">' +
                                    '<fieldset data-role="controlgroup" data-type="horizontal" data-mini="true" class="center">' +
                                    '<legend>Ventaja de <span class="textGreen">' + ventDif + '</span> para</legend>' +

                                    '<input type="radio" name="rPar-' + parCheck + '" id="idrPar-' + parCheck + 'A" value="A" ' + atributesA + '>' +
                                    '<label for="idrPar-' + parCheck + 'A">' + ventNameA + '</label>' +

                                    '<input type="radio" name="rPar-' + parCheck + '" id="idrPar-' + parCheck + 'B" value="B" ' + atributesB + '>' +
                                    '<label for="idrPar-' + parCheck + 'B">' + ventNameB + '</label>' +

                                    '</fieldset>' +

                                    '<fieldset data-role="controlgroup" data-type="horizontal" data-mini="true" class="center">' +

                                    '<input type="radio" name="typePar-' + parCheck + '" id="idtypePar-' + parCheck + 'A" value="FULL">' +
                                    '<label for="idtypePar-' + parCheck + 'A">Full</label>' +

                                    '<input type="radio" name="typePar-' + parCheck + '" id="idtypePar-' + parCheck + 'B" value="SPLIT" checked="checked">' +
                                    '<label for="idtypePar-' + parCheck + 'B">Split</label>' +

                                    '</fieldset>' +
                                    '</div>';

                                apInd += radioButtons;

                                //se agrega la zona de spinbox donde se escoge la apuesta
                                apInd +=
                                    '<div style="bottom:0px; padding:1px;background-color:#65C77F;">' +
                                    '<div style="background:white;margin:10px;">' +
                                    '<table style="width: 100%">' +
                                    '<tbody><tr><td><b>Ronda 1</b>' +
                                    '<input type="text" data-role="spinbox" data-type="vertical" name="stkPr" value="' + apuestaRow.Ronda1 + '" min="0" max="10000" step="25" data-mini="true"/>' +
                                    '</td><td><b>Ronda 2</b>' +
                                    '<input type="text" data-role="spinbox" data-type="vertical" name="stkPr" value="' + apuestaRow.Ronda2 + '" min="0" max="10000" step="25" data-mini="true"/>' +
                                    '</td><td><b>Match</b>' +
                                    '<input type="text" data-role="spinbox" data-type="vertical" name="stkPr" value="' + apuestaRow.Match + '" min="0" max="10000" step="25" data-mini="true"/>' +
                                    '</td></tr></tbody></table></div></div>';

                                window.console.log('\nA ' + pA1.UserId + ' ' + pA2.UserId + ' B ' + pB1.UserId + ' ' + pB2.UserId);
                                $('#dbStakePair').append(apInd);
                                idCount++, parCheck++;
                            };
                            $('#dbStakePair').trigger("create");

                        });
                }
            });
    }, errorHandler, nullHandler);
}

function checkStakes() {
    db.transaction(function(transaction) {
        var mySelection = $("div[title='ckStPr']");
        if (mySelection.length > 0) {
            mySelection.each(function() {

                var advantage = $(this).find('input[name^="rPar"]:checked').val(),
                    typeAd = $(this).find('input[name^="typePar"]:checked').val();
                console.log(advantage);
                console.log(typeAd);

                var arrayStakes = [];
                $(this).find(':input[name^="stkPr"]').each(function() {
                    arrayStakes.push(parseFloat(this.value));
                });
                var idA = $(this).attr('pairA'),
                    idB = $(this).attr('pairB');

                window.console.log('pairA ' + idA + ' vs pairB ' + idB + '\nStakes: ' + arrayStakes, advantage, typeAd);
                doQuery(transaction, 'UPDATE stakeParejas SET Ronda1 = ?, Ronda2 = ?, Match = ?, ventager = ?, type = ? WHERE PairA = ? AND PairB = ?', [arrayStakes[0], arrayStakes[1], arrayStakes[2], advantage, typeAd, idA, idB], nullHandler);
            });
        }
    }, errorHandler, nullHandler);
}

function stakeParejas() {
    var stakeArray = [50, 100, 100];
    window.console.log('stakeParejas recibio: ' + stakeArray);
    db.transaction(function(transaction) {
        var Yoyo = window.localStorage.getItem("Yoyo");
        window.console.log('Hay Yoyo? ' + Yoyo);
        doQuery(transaction, 'DROP TABLE IF EXISTS stakeParejas', false, nullHandler);
        doQuery(transaction, 'CREATE TABLE IF NOT EXISTS stakeParejas(IdStakeP INTEGER NOT NULL PRIMARY KEY, PairA INTEGER NOT NULL, PairB INTEGER NOT NULL, Ronda1 INTEGER NOT NULL,Ronda2 INTEGER NOT NULL, Match INTEGER NOT NULL, carry TEXT DEFAULT ' + "NO" + ', ventager TEXT DEFAULT ' + "NONE" + ', type TEXT DEFAULT ' + "SPLIT" + ')', [], nullHandler);
        if (Yoyo == 1) {
            doQuery(transaction, 'INSERT INTO stakeParejas (PairA, PairB, Ronda1, Ronda2, Match) VALUES (?, ?, ?, ?, ?)', [1, 4, stakeArray[0], stakeArray[1], stakeArray[2]], nullHandler);
            doQuery(transaction, 'INSERT INTO stakeParejas (PairA, PairB, Ronda1, Ronda2, Match) VALUES (?, ?, ?, ?, ?)', [2, 5, stakeArray[0], stakeArray[1], stakeArray[2]], nullHandler);
            doQuery(transaction, 'INSERT INTO stakeParejas (PairA, PairB, Ronda1, Ronda2, Match) VALUES (?, ?, ?, ?, ?)', [3, 6, stakeArray[0], stakeArray[1], stakeArray[2]], nullHandler);
            listDBParejas();
        } else if (Yoyo == 2) {
            doQuery(transaction, 'SELECT * FROM parejasApuesta AS p, equipos AS e WHERE p.IdJugador == e.jugadorId GROUP BY p.pareja ORDER BY p.pareja ASC, e.numEquipo ASC', [],
                function(transaction, result) {
                    if (result != null && result.rows != null) {
                        var teamPlayers = { one: {}, two: {} };
                        //console.log('Players', result.rows);
                        for (var i = 0; i < result.rows.length; i++) {
                            var row = result.rows.item(i);
                            //console.log('Row', row);
                            if (row.numEquipo == 1) teamPlayers.one[row.pareja] = row;
                            else teamPlayers.two[row.pareja] = row;
                        }

                        for (var pairA in teamPlayers['one']) {
                            for (var pairB in teamPlayers['two']) {
                                console.log('vs Sangriento', pairA, pairB);
                                doQuery(transaction, 'INSERT INTO stakeParejas (PairA, PairB, Ronda1, Ronda2, Match) VALUES (?, ?, ?, ?, ?)', [pairA, pairB, stakeArray[0], stakeArray[1], stakeArray[2]], nullHandler);
                            }
                        }
                        listDBParejas();
                    }
                });
        } else {
            doQuery(transaction, 'SELECT * FROM parejasApuesta ORDER BY pareja ASC', [],
                function(transaction, result) {
                    if (result != null && result.rows != null) {
                        var maxPair = result.rows.item(result.rows.length - 1).pareja;
                        var countPareja = 1;
                        while (countPareja < maxPair) {
                            var nextPareja = countPareja + 1;
                            var pA = [];
                            for (var i = 0; i < result.rows.length; i++) {
                                var row = result.rows.item(i);
                                if (row.pareja == countPareja) {
                                    pA.push(row.IdJugador);
                                };

                            };
                            while (nextPareja <= maxPair) {
                                var checkRepeat = false;
                                for (var j = 0; j < result.rows.length; j++) {
                                    var checkRow = result.rows.item(j);
                                    if (checkRow.pareja <= countPareja) {
                                        window.console.log('salta');
                                        continue;
                                    }
                                    if (checkRow.pareja == nextPareja) {
                                        if (checkRow.IdJugador == pA[0]) {
                                            checkRepeat = true;
                                            window.console.log('Repite');
                                        }
                                        if (checkRow.IdJugador == pA[1]) {
                                            checkRepeat = true;
                                            window.console.log('Repite');
                                        }
                                    }
                                }
                                if (!checkRepeat) {
                                    //alert('Insert Pareja ' + countPareja + ' ' + nextPareja);
                                    window.console.log('Insert parejas ' + countPareja + ' y ' + nextPareja + ' stake ' + stakeArray[0] + '/' + stakeArray[1] + '/' + stakeArray[2]);
                                    doQuery(transaction, 'INSERT INTO stakeParejas (PairA, PairB, Ronda1, Ronda2, Match) VALUES (?, ?, ?, ?, ?)', [countPareja, nextPareja, stakeArray[0], stakeArray[1], stakeArray[2]], nullHandler);
                                }
                                nextPareja++;
                            }
                            countPareja++;
                        }
                        listDBParejas();
                    }
                });
        }
    }, errorHandler, nullHandler);
}

var blockPos = "Entrando";

function presionParejas(limite) {
    db.transaction(function(transaction) {
        var Yoyo = window.localStorage.getItem("Yoyo"),
            limitPresion = 3;
        if (limite != undefined) {
            limitPresion = limite;
        }
        early = 'NO';
        doQuery(transaction, 'SELECT * FROM jugadores WHERE Early = ?', [early], function(transaction, result) {
            blockPos = "Jugadores 307";
            if (result != null && result.rows != null) {
                if (result.rows.length < 4 && (Yoyo != 1 && Yoyo != 2)) {
                    window.console.log('No hay parejas! length = ' + result.rows.length);
                    return;
                } else {
                    var Hoyos = window.sessionStorage.getItem("Hoyos");
                    var rondaNumber = window.sessionStorage.getItem("Ronda");
                    if (rondaNumber == null) {
                        rondaNumber = 1;
                        doQuery(transaction, 'DROP TABLE IF EXISTS presionParejas', false, nullHandler);
                        doQuery(transaction, 'CREATE TABLE IF NOT EXISTS presionParejas(IdPresionP INTEGER NOT NULL PRIMARY KEY, PairA INTEGER NOT NULL, PairB INTEGER NOT NULL, Ronda INTEGER NOT NULL, Nivel INTEGER NOT NULL, Presion INTEGER NOT NULL)', [], nullHandler);
                        doQuery(transaction, 'DROP TABLE IF EXISTS stepParejas', false, nullHandler);
                        doQuery(transaction, 'CREATE TABLE IF NOT EXISTS stepParejas(stepPId INTEGER NOT NULL PRIMARY KEY, PairA INTEGER NOT NULL, PairB INTEGER NOT NULL, Ronda INTEGER NOT NULL, Ventaja INTEGER NOT NULL, Steping INTEGER NOT NULL)', false, nullHandler);
                    }
                    blockPos = "Rondanumber 322";
                    var inicio = parseInt(Hoyos),
                        fin = inicio + 8;
                    var campStart = inicio == 1 ? 1 : 2;
                    window.console.log('Empieza en hoyo ' + Hoyos + '\nRonda ' + rondaNumber);

                    doQuery(transaction, 'SELECT * FROM jugadores, parejasApuesta WHERE jugadores.UserId = parejasApuesta.IdJugador ORDER BY parejasApuesta.pareja ASC', [], function(transaction, result) {
                        blockPos = "jugadores apuestas 328";
                        if (result != null && result.rows != null) {
                            if (result.rows.length < 4) return;
                            var allPlayers = {},
                                firstCheck = true,
                                currentPair = 0;
                            for (var q = 0; q < result.rows.length; q++) {
                                var row = result.rows.item(q);
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
                            console.log("Full Pairs", allPlayers);

                            doQuery(transaction, 'SELECT * FROM Scores WHERE Hoyo BETWEEN ? AND ? ORDER BY Hoyo ASC', [Hoyos, fin], function(transaction, result) {
                                blockPos = "Scores 350";
                                if (result != null && result.rows != null) {
                                    //alert('stakeParejas');
                                    doQuery(transaction, 'SELECT * FROM stakeParejas ORDER BY PairA ASC, PairB ASC', [], function(transaction, resultStake) {
                                        blockPos = "Stakes 354";
                                        console.log(resultStake);
                                        for (var i = 0; i < resultStake.rows.length; i++) {
                                            var row = resultStake.rows.item(i);
                                            var parejaA = allPlayers[row.PairA],
                                                parejaB = allPlayers[row.PairB];

                                            console.log('COMIENZA!!!');
                                            console.log('ParejaA', row.PairA, parejaA, '\nParejaB', row.PairB, parejaB);

                                            var scoreA1 = [],
                                                scoreA2 = [],
                                                scoreB1 = [],
                                                scoreB2 = [];
                                            for (var m = 0; m < result.rows.length; m++) {
                                                var id = result.rows.item(m).IdJugador;
                                                if (id == parejaA.A.UserId) {
                                                    scoreA1.push(result.rows.item(m).ScoreHoyo);
                                                }
                                                if (id == parejaA.B.UserId) {
                                                    scoreA2.push(result.rows.item(m).ScoreHoyo);
                                                }
                                                if (id == parejaB.A.UserId) {
                                                    scoreB1.push(result.rows.item(m).ScoreHoyo);
                                                }
                                                if (id == parejaB.B.UserId) {
                                                    scoreB2.push(result.rows.item(m).ScoreHoyo);
                                                }
                                            }
                                            blockPos = "Before Functions 383";
                                            window.console.log('A1 ' + scoreA1 + '\nA2 ' + scoreA2 + '\nB1 ' + scoreB1 + '\nB2 ' + scoreB2);
                                            var hPairA = parejaA.A.Handicap + parejaA.B.Handicap,
                                                hPairB = parejaB.A.Handicap + parejaB.B.Handicap;
                                            var ventajaStep = 0;
                                            if (hPairA < hPairB) {
                                                window.console.log('Ventaja para pareja B\n');
                                                ventajaStep = -ajustarScoreP(
                                                    rondaNumber, hPairB - hPairA, row.ventager, row.type,
                                                    parejaB.A.Handicap, parejaB.B.Handicap,
                                                    campBlock[campStart], parejaB.A.tStart, parejaB.B.tStart,
                                                    scoreB1, scoreB2
                                                );
                                            }
                                            if (hPairA > hPairB) {
                                                window.console.log('Ventaja para pareja A\n');
                                                ventajaStep = ajustarScoreP(
                                                    rondaNumber, hPairA - hPairB, row.ventager, row.type,
                                                    parejaA.A.Handicap, parejaA.B.Handicap,
                                                    campBlock[campStart], parejaA.A.tStart, parejaA.B.tStart,
                                                    scoreA1, scoreA2
                                                );
                                            }
                                            blockPos = "After Functions 406";

                                            window.console.log('A1 ' + scoreA1 + '\nA2 ' + scoreA2 + '\nB1 ' + scoreB1 + '\nB2 ' + scoreB2);
                                            console.log('Ventaja Step!', ventajaStep);
                                            window.console.log('Comparar para presion!');

                                            var arrayPresion = [];
                                            arrayPresion.push(0);
                                            window.console.log('arrayPresion = ' + arrayPresion);
                                            var stepPresion = [];
                                            for (var n = 0; n < scoreA1.length; n++) {
                                                var presion = 0;
                                                var a1 = scoreA1[n];
                                                var a2 = scoreA2[n];
                                                var b1 = scoreB1[n];
                                                var b2 = scoreB2[n];
                                                var minA = Math.min(a1, a2);
                                                var maxA = Math.max(a1, a2);
                                                var minB = Math.min(b1, b2);
                                                var maxB = Math.max(b1, b2);
                                                if (minA < minB) {
                                                    presion++;
                                                }
                                                if (minA > minB) {
                                                    presion--;
                                                }
                                                if (maxA < maxB) {
                                                    presion++;
                                                }
                                                if (maxA > maxB) {
                                                    presion--;
                                                }
                                                for (var o = 0; o < arrayPresion.length; o++) {
                                                    arrayPresion[o] += presion;
                                                }
                                                console.log('presion ' + presion);
                                                console.log(arrayPresion);
                                                var checkPresion = Math.abs(arrayPresion[arrayPresion.length - 1]);
                                                stepPresion.push(arrayPresion.join(','));
                                                if (checkPresion >= limitPresion) {
                                                    arrayPresion.push(0);
                                                }
                                            }
                                            blockPos = "Before unShifts 449";
                                            console.log(arrayPresion);
                                            var stepper = stepPresion.join('|');
                                            console.log("stepParejas", row.PairA, row.PairB, rondaNumber, ventajaStep, stepper);
                                            //stepPBuilder(transaction, stepper, row.PairA, row.PairB, ventajaStep, rondaNumber);
                                            doQuery(transaction, 'INSERT INTO stepParejas(PairA, PairB, Ronda, Ventaja, Steping) VALUES (?, ?, ?, ?, ?)', [row.PairA, row.PairB, rondaNumber, ventajaStep, stepper], nullHandler);

                                            console.log('OUT\nParejaA = ', row.PairA, '\nParejaB = ', row.PairB);
                                            blockPos = "After unShifts 457";
                                            if (rondaNumber == 1) {
                                                blockPos = "Updates 459";
                                                if (arrayPresion[0] == 0) {
                                                    console.log('Entra Carry!');
                                                    doQuery(transaction, 'UPDATE stakeParejas SET carry = ? WHERE PairA = ? and PairB = ?', ["YES", row.PairA, row.PairB], nullHandler);
                                                } else
                                                    doQuery(transaction, 'UPDATE stakeParejas SET carry = ? WHERE PairA = ? and PairB = ?', ["NO", row.PairA, row.PairB], nullHandler);
                                            }
                                            blockPos = "Inserts 466";
                                            for (var p = 0; p < arrayPresion.length; p++) {
                                                var nivelPresion = p + 1;
                                                var presionPos = arrayPresion[p];
                                                var presionInv = -(arrayPresion[p]);
                                                console.log('presionPos ' + presionPos + '\npresionInv ' + presionInv);
                                                doQuery(transaction, 'INSERT INTO presionParejas(PairA, PairB, Ronda, Nivel, Presion) VALUES (?, ?, ?, ?, ?)', [row.PairA, row.PairB, rondaNumber, nivelPresion, presionPos], nullHandler);
                                                doQuery(transaction, 'INSERT INTO presionParejas(PairA, PairB, Ronda, Nivel, Presion) VALUES (?, ?, ?, ?, ?)', [row.PairB, row.PairA, rondaNumber, nivelPresion, presionInv], nullHandler);
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            }
        });
    }, function() {
        alert("Error en Bloque Presiones Pareja " + blockPos);
    }, nullHandler);
}

function ajustarScoreP(rondaNumber, ventaja, ventager, typeAdjust, handicapA, handicapB, campo, indexA, indexB, scoreA, scoreB) {
    var arrayVentajasort1 = campo[indexA].arrayVentaja.slice(),
        arrayVentajasort2 = campo[indexB].arrayVentaja.slice();
    arrayVentajasort1.sort(function(a, b) {
        return a - b
    });
    arrayVentajasort2.sort(function(a, b) {
        return a - b
    });
    window.console.log(arrayVentajasort1, arrayVentajasort2);
    var ajuste = ventaja;
    if (rondaNumber == 1) {
        ajuste = Math.ceil(ajuste / 2);
    } else {
        ajuste = Math.floor(ajuste / 2);
    }
    console.log('ventaja de ' + ajuste);
    var step = ajuste;
    //ventajaStep = -ajuste;
    console.log('Step Check!', step);
    var vIndex = 0,
        sIndex1 = 0,
        sIndex2 = 0;
    /*,
        ventA = parejaB.A.Handicap,
        ventB = parejaB.B.Handicap;
    if (ventA == ventB) {
        var ventager = Math.floor(Math.random() * 2) + 1
        ventager == 1 ? ventA++ : ventB++;
    }*/
    var count = 0,
        ajuPlayer;
    console.log('Stake Ventager', ventager);
    if (handicapA < handicapB || ventager == "B") {
        window.console.log('Ventaja para 2\n');
        ajuPlayer = 2;
        //ventajaStep < 0 ? ventajaStep -= .2 : ventajaStep += .2;
        step += .2;
    } else if (handicapA >= handicapB || ventager == "A") {
        window.console.log('Ventaja para 1\n');
        ajuPlayer = 1;
        //ventajaStep < 0 ? ventajaStep -= .1 : ventajaStep += .1;
        step += .1;
    }
    console.log('Step Check!', step);
    console.log('Stake Type', typeAdjust);
    while (ajuste > 0) {
        if (vIndex >= 9) {
            vIndex = 0;
        }
        sIndex1 = campo[indexA].arrayVentaja.indexOf(arrayVentajasort1[vIndex]);
        sIndex2 = campo[indexB].arrayVentaja.indexOf(arrayVentajasort2[vIndex++]);
        if (ajuPlayer == 1) {
            scoreA[sIndex1] = scoreA[sIndex1] - 1;
            if (scoreA[sIndex1] < 0) {
                scoreA[sIndex1] = 0;
            }
        }
        if (ajuPlayer == 2) {
            scoreB[sIndex2] = scoreB[sIndex2] - 1;
            if (scoreB[sIndex2] < 0) {
                scoreB[sIndex2] = 0;
            }
        }
        count++;
        if ((count % 9 == 0) && typeAdjust == "SPLIT") {
            if (ajuPlayer == 1) {
                ajuPlayer = 2;
            } else {
                ajuPlayer = 1;
            };
        }
        ajuste--;
    }
    return step;
}

function cambioStakePareja() {
    db.transaction(function(transaction) {
        var Yoyo = window.localStorage.getItem("Yoyo");
        doQuery(transaction, 'SELECT * FROM jugadores WHERE Early = ?', ['NO'],
            function(transaction, result) {
                if ((result.rows.length >= 4) || (Yoyo == 1)) listDBParejas();
                window.console.log('No hay parejas! length = ' + result.rows.length);
                var menuEr = window.sessionStorage.getItem('menu');
                console.log('Menuer?', menuEr);
                menuEr = (menuEr == 'true');
                if (menuEr) bancoApuesta(3);
                else bancoApuesta(2);
            });
    }, errorHandler, nullHandler);
}
