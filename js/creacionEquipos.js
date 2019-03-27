function confirmActivos() {
    ChangeHandicap();
    if (!$('#logList').hasClass('hidden')) {
        regenerateApuestas(true);
        //$("body").pagecontainer("change", "#page16");
    } else
        vex.dialog.confirm({
            message: '<div style="font-size:large;text-align: center;border-bottom: 1px solid #203744;"><b>GUARDAR JUGADORES</b></div><p style="font-size:medium;">A partir de aqui ya no podra hacer cambio de jugadores.</p><br>',
            buttons: [
                $.extend({}, vex.dialog.buttons.YES, {
                    className: 'okButton',
                    text: 'CONTINUAR',
                    click: function($vexContent, event) {
                        $vexContent.data().vex.value = true;
                        vex.close($vexContent.data().vex.id);
                    }
                }),
                $.extend({}, vex.dialog.buttons.NO, {
                    className: 'simpleCancel',
                    text: 'Regresar',
                    click: function($vexContent, event) {
                        vex.close($vexContent.data().vex.id);
                    }
                })
            ],
            callback: function(value) {
                window.console.log('Choice', value ? 'Continue' : 'Cancel');
                if (value) {
                    hidePanel();
                    //hockeyapp.forceCrash();
                    //mixPanelTrack('Create Game');
                    var numeroJugadores = window.sessionStorage.getItem("numJum");
                    if (numeroJugadores == 2) {
                        RandomCheck();
                        $('#page8').find('.ui-btn-left, [data-role="content"] p').addClass('hidden');
                    } else {
                        if (numeroJugadores < 6 || numeroJugadores > 10) {
                            $(".BYGsgt").addClass('byg-disabled').on('click touchstart', function(e) {
                                e.preventDefault();
                                console.log('Nope');
                                //poner aqui aviso drop.js de que solo se puede con 6 - 10 jugadores
                            });

                        }
                        $("body").pagecontainer("change", "#page7");
                    }
                }
            }
        });
}

function Temprano(type) {
    if (type == 4) {
        db.transaction(function(tx) {
            tx.executeSql('SELECT * FROM jugadores Where Early != ?', ['YES'],
                function(tx, result) {
                    if (result != null && result.rows != null) {
                        for (var i = 0; i < result.rows.length; i++) {
                            var row = result.rows.item(i);
                            tx.executeSql('UPDATE jugadores SET Early = ? Where UserId= ?', ['SOLO', row.UserId]);
                        }
                        window.localStorage.setItem("Yoyo", 2);
                        RandomTeam(true, function() {
                            ListDBSangTeam();
                            $("body").pagecontainer("change", "#page8");
                        });
                    }
                }, errorHandler);
        }, errorHandler, nullHandler);
    } else {
        window.sessionStorage.setItem("Early", type);
        ListDBporEquipos();
        $("body").pagecontainer("change", "#Solos");
    }
}

function ListDBporEquipos() {
    db.transaction(function(transaction) {
        transaction.executeSql('SELECT * FROM jugadores Where Early != ?', ['YES'],
            function(transaction, result) {
                if (result != null && result.rows != null) {
                    if (result.rows.length >= 1) { $('#dbSolo tbody').html(''); }
                    for (var i = 0; i < result.rows.length; i++) {
                        var row = result.rows.item(i);
                        var checkedSolo = row.Early != 'SOLO' ? 'checked="checked"' : '';
                        $('#dbSolo tbody').append('<tr id="' + row.UserId + '" name="dbSolos"><td>' + row.FirstName + ' ' + row.LastName + '</td><td><input id="uSolo' + row.UserId + '" name="cSolos" value=' + row.UserId + ' type="checkbox" data-role="none" class="BYGcheckbox" ' + checkedSolo + '><label for="uSolo' + row.UserId + '"></label></td></tr>');
                    }
                    $("#dbSolo").trigger("create");
                }
            }, errorHandler);
    }, errorHandler, nullHandler);
    return;
}

//input:not(:checked)
function JugadoresSolo() {
    var tempranos = $("input[name='cSolos']:not(:checked)");
    var equipos = $("input[name='cSolos']:checked");
    window.console.log(tempranos.length, equipos.length);
    db.transaction(function(tx) {
        if (equipos.length > 0) {
            equipos.each(function() {
                window.console.log($(this).val());
                tx.executeSql('UPDATE jugadores SET Early = ? Where UserId= ?', ['NO', $(this).val()]);
            });
        }
        if (tempranos.length > 0) {
            tempranos.each(function() {
                window.console.log($(this).val());
                tx.executeSql('UPDATE jugadores SET Early = ? Where UserId= ?', ['SOLO', $(this).val()]);
            });
        }
    }, errorHandler, function() {
        var thingy = window.sessionStorage.getItem("Early");
        window.console.log(thingy);
        if (thingy == 1) {
            RandomCheck();
        }
        if (thingy == 2) {
            HandicapCheck();
        }
        if (thingy == 3) {
            window.console.log('Armados');
            ArmadosCheck();
        }
    });
}

/*
    Shuffle recibe array con jugadores y regresa otro array con un orden aleatorio
*/
function shuffle(items) {
    var array = [];
    array = items;
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    if (Math.floor(Math.random() * 4) == 2) {
        return shuffle(array);
    } else {
        return array;
    }
}
/*
    RamdomPair se hace despues de RandomTeam y es el que se encarga de asignar pareja a los jugadores
*/
function RandomPair() {
    db.transaction(function(transaction) {
        var maxCapacity = 0;
        transaction.executeSql('SELECT * FROM jugadores', [],
            function(transaction, result) {
                if (result != null && result.rows != null) {
                    maxCapacity = (Math.ceil(result.rows.length / 5.0) * 5) / 5;
                }
            }, nullHandler, errorHandler);

        var nEarly = 'NO';
        var numPair = 1;

        transaction.executeSql('SELECT * FROM jugadores, equipos WHERE jugadores.UserId = equipos.jugadorId AND jugadores.Early = ? ORDER BY equipos.numEquipo ASC', [nEarly],
            function(transaction, result) {
                if (result != null && result.rows != null) {
                    var lonely = 0;
                    if (result.rows.length == 0) {
                        if (maxCapacity != 0) {
                            ListDBRandomTeam();
                            $("body").pagecontainer("change", "#page8");
                            return;
                        }
                    }
                    for (var j = 1; j <= maxCapacity; j++) {
                        var resultArray = [];
                        for (var k = 0; k < result.rows.length; k++) {
                            var row = result.rows.item(k);
                            if (row.numEquipo == j) {
                                resultArray.push(row);
                            }
                            var shuffledArray = shuffle(resultArray);
                        }
                        var len = shuffledArray.length;
                        if (len <= 3) {
                            if (maxCapacity == 1) {
                                for (var i = 0; i < len; i++) {
                                    var row = shuffledArray[i];
                                    transaction.executeSql('UPDATE equipos SET numPareja = ? Where jugadorId = ?', [numPair, row.UserId], nullHandler, errorHandler);
                                    numPair++;
                                }
                            } else {
                                for (var i = 0; i < len; i++) {
                                    var row = shuffledArray[i];
                                    transaction.executeSql('UPDATE equipos SET numPareja = ? Where jugadorId = ?', [numPair, row.UserId], nullHandler, errorHandler);
                                    if (i == 0 && lonely == 1) {
                                        if (len == 2) {
                                            lonely = 0;
                                        } else {
                                            numPair++;
                                            lonely = 0;
                                        }
                                    }
                                }
                                if (len == 1) {
                                    lonely = 1;
                                } else {
                                    numPair++;
                                }
                            }
                        } else {
                            if (lonely == 1 && len == 5) {
                                var count = 0;
                                for (var i = 0; i < len; i++) {
                                    if (count == 3) {
                                        numPair++;
                                    }
                                    var row = shuffledArray[i];
                                    transaction.executeSql('UPDATE equipos SET numPareja = ? Where jugadorId = ?', [numPair, row.UserId], nullHandler, errorHandler);
                                    count++;
                                    if (i == 0) {
                                        numPair++;
                                    }
                                }
                            } else {
                                var count = 0;
                                for (var i = 0; i < len; i++) {
                                    if (count == 2) {
                                        numPair++;
                                    }
                                    var row = shuffledArray[i];
                                    transaction.executeSql('UPDATE equipos SET numPareja = ? Where jugadorId = ?', [numPair, row.UserId], nullHandler, errorHandler);
                                    count++;
                                }
                                numPair++;
                            }
                        }
                    }
                    ListDBRandomTeam();
                    $("body").pagecontainer("change", "#page8");
                } else {
                    if (maxCapacity != 0) {
                        ListDBRandomTeam();
                        $("body").pagecontainer("change", "#page8");
                    }
                }
            }, nullHandler, errorHandler);
    }, errorHandler, nullHandler);
}

/*
    RandomCheck checa si hay 3 o menos jugadores, de ser asi, los cambia a jugadores solitarios. Early = SOLO
*/

function RandomCheck() {
    db.transaction(function(transaction) {
        var nEarly = 'NO';
        transaction.executeSql('SELECT * FROM jugadores WHERE Early = ?', [nEarly],
            function(transaction, result) {
                if (result != null && result.rows != null) {
                    if (result.rows.length <= 3) {
                        for (var i = 0; i < result.rows.length; i++) {
                            var row = result.rows.item(i);
                            var Solo = 'SOLO';
                            transaction.executeSql('UPDATE jugadores SET Early = ? Where UserId= ?', [Solo, row.UserId]);
                        }
                    }
                    RandomTeam();
                }
            }, nullHandler, errorHandler);
    }, errorHandler, nullHandler);
}

/*
    RandomTeam es la que se encarga de agregar a los jugadores dentro de equipos de manera aleatoria
*/

function RandomTeam(checkSangriento, callback) {
    db.transaction(function(transaction) {
        transaction.executeSql('DROP TABLE IF EXISTS equipos');
        transaction.executeSql('CREATE TABLE IF NOT EXISTS equipos(EquipoId INTEGER NOT NULL PRIMARY KEY, jugadorId INTEGER NOT NULL, numEquipo INTEGER NOT NULL, numPareja INTEGER NOT NULL)', [], nullHandler, errorHandler);

        var nEarly = 'NO';
        var count = 0;
        var yesCapacity = 0;
        var totalPlayers = 0;
        transaction.executeSql('SELECT * FROM jugadores', [],
            function(transaction, result) {
                if (result != null && result.rows != null) {
                    yesCapacity = (Math.ceil(result.rows.length / 5.0) * 5) / 5;
                    totalPlayers = result.rows.length;
                }
            }, nullHandler, errorHandler);

        transaction.executeSql('SELECT * FROM jugadores WHERE Early = ?', [nEarly],
            function(transaction, result) {
                if (result != null && result.rows != null) {
                    var numTeamsT = 1;
                    var numPairT = 0;
                    var resultArray = [];
                    for (var i = 0; i < result.rows.length; i++) {
                        resultArray.push(result.rows.item(i));
                    }
                    var shuffledArray = shuffle(resultArray);
                    var len = result.rows.length;
                    if (len <= 3) {} else {
                        numTeamsT = yesCapacity;
                        for (var i = 0; i < len; i++) {
                            var row = shuffledArray[i];
                            if (i == 0) {
                                if (totalPlayers - len == 1) {
                                    transaction.executeSql('INSERT INTO equipos (jugadorId, numEquipo, numPareja) VALUES (?, ?, ?)', [row.UserId, 1, numPairT], nullHandler, errorHandler);
                                    count++;
                                    i += 1;
                                    row = shuffledArray[i];
                                }
                            }
                            if (numTeamsT < 1) {
                                numTeamsT = yesCapacity;
                            }
                            transaction.executeSql('INSERT INTO equipos (jugadorId, numEquipo, numPareja) VALUES (?, ?, ?)', [row.UserId, numTeamsT, numPairT], nullHandler, errorHandler);
                            count++;
                            numTeamsT--;
                        }
                    }
                }
            }, nullHandler, errorHandler);
        var topsArray = [];
        var sEarly = 'SOLO';
        transaction.executeSql('SELECT * FROM jugadores WHERE Early = ?', [sEarly],
            function(transaction, result) {
                if (result != null && result.rows != null) {
                    var numTeamsT = 1;
                    var numPairT = 0;
                    var resultArray = [];
                    for (var i = 0; i < result.rows.length; i++) {
                        resultArray.push(result.rows.item(i));
                    }
                    var shuffledArray = shuffle(resultArray);
                    var len = result.rows.length;
                    for (var w = 0; w < yesCapacity; w++) {
                        topsArray.push(0);
                    }
                    var herm = count;
                    var soly = totalPlayers - 1;
                    var fnumTeams = yesCapacity;
                    if (count <= 3) {
                        topsArray[0] = count;
                    } else {
                        if (herm == soly) {
                            fnumTeams = 1;
                            while (herm > 0) {
                                if (fnumTeams > yesCapacity) {
                                    fnumTeams = 1;
                                }
                                var rar = topsArray[fnumTeams - 1];
                                topsArray[fnumTeams - 1] = rar + 1;
                                fnumTeams++;
                                herm--;
                            }
                        } else {
                            while (herm > 0) {
                                if (fnumTeams < 1) {
                                    fnumTeams = yesCapacity;
                                }
                                var rar = topsArray[fnumTeams - 1];
                                topsArray[fnumTeams - 1] = rar + 1;
                                fnumTeams--;
                                herm--;
                            }
                        }
                    }
                    window.console.log('tops ' + topsArray);
                    numTeamsT = yesCapacity;
                    var min = topsArray[0];
                    for (var m = 0; m < topsArray.length; m++) {
                        if (topsArray[m] < min) {
                            min = topsArray[m];
                        }
                    }
                    window.console.log('min ' + min);
                    for (var i = 0; i < len; i++) {
                        var row = shuffledArray[i];
                        if (numTeamsT < 1) {
                            numTeamsT = yesCapacity;
                        }
                        window.console.log('esta iteracion ' + topsArray[numTeamsT - 1]);
                        if (topsArray[numTeamsT - 1] > min) {
                            var temp = topsArray[numTeamsT - 1];
                            while (temp > min) {
                                numTeamsT -= 1;
                                if (numTeamsT < 1) {
                                    numTeamsT = yesCapacity;
                                }
                                temp = topsArray[numTeamsT - 1];
                            }
                            window.console.log('temp ' + temp + '\nmin ' + min);
                        }
                        window.console.log('iteracion antes de entrar ' + topsArray[numTeamsT - 1]);
                        /* var space = topsArray[numTeamsT-1];
                        if(space == 5){
                            while(space == 5){
                                numTeamsT+=1;
                                if(numTeamsT>yesCapacity){
                                    numTeamsT=1;
                                }
                                space = topsArray[numTeamsT-1];
                            }
                        } */
                        transaction.executeSql('INSERT INTO equipos (jugadorId, numEquipo, numPareja) VALUES (?, ?, ?)', [row.UserId, numTeamsT, numPairT], nullHandler, errorHandler);
                        var temp = topsArray[numTeamsT - 1];
                        topsArray[numTeamsT - 1] = temp + 1;
                        numTeamsT--;
                        window.console.log(topsArray);
                        min = topsArray[0];
                        for (var n = 0; n < topsArray.length; n++) {
                            if (topsArray[n] < min) {
                                min = topsArray[n];
                            }
                        }
                    }
                }
            }, nullHandler, errorHandler);

        var yEarly = 'YES';
        transaction.executeSql('SELECT * FROM jugadores WHERE Early = ?', [yEarly],
            function(transaction, result) {
                if (result != null && result.rows != null) {
                    var numTeamsT = 1;
                    var numPairT = 0;
                    var resultArray = [];
                    for (var i = 0; i < result.rows.length; i++) {
                        resultArray.push(result.rows.item(i));
                    }
                    var shuffledArray = shuffle(resultArray);
                    var len = result.rows.length;
                    if (len <= 2 && count <= 3) {
                        for (var i = 0; i < len; i++) {
                            var row = shuffledArray[i];
                            transaction.executeSql('INSERT INTO equipos (jugadorId, numEquipo, numPareja) VALUES (?, ?, ?)', [row.UserId, numTeamsT, numPairT], nullHandler, errorHandler);
                        }
                    } else {
                        window.console.log('length tops ' + topsArray.length);
                        if (topsArray.length == 0) {
                            for (var w = 0; w < yesCapacity; w++) {
                                topsArray.push(0);
                            }
                            var herm = totalPlayers - len;
                            var soly = totalPlayers - 1;
                            var fnumTeams = yesCapacity;
                            if (count <= 3) {
                                topsArray[0] = count;
                            } else {
                                if (herm == soly) {
                                    fnumTeams = 1;
                                    while (herm > 0) {
                                        if (fnumTeams > yesCapacity) {
                                            fnumTeams = 1;
                                        }
                                        var rar = topsArray[fnumTeams - 1];
                                        topsArray[fnumTeams - 1] = rar + 1;
                                        fnumTeams++;
                                        herm--;
                                    }
                                } else {
                                    while (herm > 0) {
                                        if (fnumTeams < 1) {
                                            fnumTeams = yesCapacity;
                                        }
                                        var rar = topsArray[fnumTeams - 1];
                                        topsArray[fnumTeams - 1] = rar + 1;
                                        fnumTeams--;
                                        herm--;
                                    }
                                }
                            }
                        }
                        window.console.log('tops ' + topsArray);
                        numTeamsT = yesCapacity;
                        var min = topsArray[0];
                        for (var m = 0; m < topsArray.length; m++) {
                            if (topsArray[m] < min) {
                                min = topsArray[m];
                            }
                        }
                        window.console.log('min ' + min);
                        for (var i = 0; i < len; i++) {
                            var row = shuffledArray[i];
                            if (numTeamsT < 1) {
                                numTeamsT = yesCapacity;
                            }
                            window.console.log('esta iteracion ' + topsArray[numTeamsT - 1]);
                            if (topsArray[numTeamsT - 1] > min) {
                                var temp = topsArray[numTeamsT - 1];
                                while (temp > min) {
                                    numTeamsT -= 1;
                                    if (numTeamsT < 1) {
                                        numTeamsT = yesCapacity;
                                    }
                                    temp = topsArray[numTeamsT - 1];
                                }
                                window.console.log('temp ' + temp + '\nmin ' + min);
                            }
                            window.console.log('iteracion antes de entrar ' + topsArray[numTeamsT - 1]);
                            /* var space = topsArray[numTeamsT-1];
                            if(space == 5){
                                while(space == 5){
                                    numTeamsT+=1;
                                    if(numTeamsT>yesCapacity){
                                        numTeamsT=1;
                                    }
                                    space = topsArray[numTeamsT-1];
                                }
                            } */
                            transaction.executeSql('INSERT INTO equipos (jugadorId, numEquipo, numPareja) VALUES (?, ?, ?)', [row.UserId, numTeamsT, numPairT], nullHandler, errorHandler);
                            var temp = topsArray[numTeamsT - 1];
                            topsArray[numTeamsT - 1] = temp + 1;
                            numTeamsT--;
                            window.console.log(topsArray);
                            min = topsArray[0];
                            for (var n = 0; n < topsArray.length; n++) {
                                if (topsArray[n] < min) {
                                    min = topsArray[n];
                                }
                            }
                        }
                    }
                    if (checkSangriento) {
                        callback();
                    } else {
                        RandomPair();
                    }
                }
            }, nullHandler, errorHandler);
    }, errorHandler, nullHandler);
}

function ListDBSangTeam() {
    $('#dbRandTeam').html('');
    db.transaction(function(transaction) {
        transaction.executeSql('SELECT * FROM jugadores, equipos WHERE jugadores.UserId = equipos.jugadorId ORDER BY equipos.numEquipo ASC, equipos.numPareja ASC', [],
            function(transaction, result) {
                if (result != null && result.rows != null) {
                    var teamy = 0;
                    var parCheck = -1;
                    var txtTeams = '';
                    for (var i = 0; i < result.rows.length; i++) {
                        var row = result.rows.item(i);
                        if (row.numEquipo != teamy) {
                            parCheck = -1;
                            if (teamy != 0) txtTeams += '</tbody></table><br>';
                            teamy = row.numEquipo;
                            txtTeams += '<table data-role="table" data-mode="none"><thead class="ui-body-b"><th colspan=3>Equipo ' + teamy + '</th></thead><tbody>';
                        }
                        txtTeams += '<tr><td>' + row.FirstName + ' ' + row.LastName + '</td><td>' + row.Handicap + '</td></tr>';
                    }
                    $('#dbRandTeam').append(txtTeams).trigger('create');
                }
            }, errorHandler);
    }, errorHandler, nullHandler);
    return;
}

/*
    ListDBRandomTeam despliega a los jugadores en equipos y parejas
*/

function ListDBRandomTeam() {
    $('#dbRandTeam').html('');
    db.transaction(function(transaction) {
        transaction.executeSql('SELECT * FROM jugadores, equipos WHERE jugadores.UserId = equipos.jugadorId ORDER BY equipos.numEquipo ASC, equipos.numPareja ASC', [],
            function(transaction, result) {
                if (result != null && result.rows != null) {
                    var teamy = 0;
                    var parCheck = -1;
                    var txtTeams = '';
                    for (var i = 0; i < result.rows.length; i++) {
                        var row = result.rows.item(i);
                        if (row.numEquipo != teamy) {
                            parCheck = -1;
                            if (teamy != 0) txtTeams += '</tbody></table><br>';
                            teamy = row.numEquipo;
                            txtTeams += '<table data-role="table" data-mode="none"><thead class="ui-body-b"><th colspan=3>Equipo ' + teamy + '</th></thead><tbody>';
                        }
                        var parNum = row.numPareja;
                        if (parNum == 0) {
                            parNum = row.Early == 'SOLO' ? 'Solo' : 'Early';
                            txtTeams += '<tr><th>' + parNum + '</th><td>' + row.FirstName + ' ' + row.LastName + '</td><td>' + row.Handicap + '</td></tr>';
                        } else {
                            if (parNum != parCheck) {
                                parCheck = parNum;
                                var count = 0;
                                var index = 0;
                                while (index < result.rows.length) {
                                    var temp = result.rows.item(index++);
                                    if ((temp.numPareja == parNum) && (temp.numEquipo == teamy)) count++;
                                }
                                parNum = String.fromCharCode(64 + parNum);
                                //<input type="radio" name="rPar-'+parCheck+'" value="Value"/>
                                txtTeams += '<tr><th rowspan=' + count + '>Pareja ' + parNum + '</th><td>' + row.FirstName + ' ' + row.LastName + '</td><td>' + row.Handicap + '</td></tr>'; //style="paddingTop:10px"
                                //<input type="radio" name="rPar-'+parNum+'" value="Value"/>
                            } else { txtTeams += '<tr><td>' + row.FirstName + ' ' + row.LastName + '</td><td>' + row.Handicap + '</td></tr>'; };
                        }
                    }
                    $('#dbRandTeam').append(txtTeams).trigger('create');
                }
            }, errorHandler);
    }, errorHandler, nullHandler);
    return;
}

/*
    HandicapTeam se hace despues de HandicapPair y es el que asigna equipos a los jugadores
*/

function HandicapTeam() {
    db.transaction(function(transaction) {
        var maxCapacity = 0;
        var totalPlayers = 0;
        var count = 0;
        transaction.executeSql('SELECT * FROM jugadores', [],
            function(transaction, result) {
                if (result != null && result.rows != null) {
                    maxCapacity = (Math.ceil(result.rows.length / 5.0) * 5) / 5;
                    totalPlayers = result.rows.length;
                }
            }, nullHandler, errorHandler);

        var nEarly = 'NO';
        transaction.executeSql('SELECT * FROM jugadores, equipos WHERE jugadores.UserId = equipos.jugadorId AND jugadores.Early = ? ORDER BY equipos.numPareja DESC, jugadores.Handicap DESC', [nEarly],
            function(transaction, result) {
                if (result != null && result.rows != null) {
                    var numTeam = maxCapacity;
                    var len = result.rows.length;
                    var pairs = len / 2;
                    var countP = 0;
                    var i = 0;
                    if (pairs <= 1.5) {
                        var triads = pairs;
                        numTeam = 1;
                        while (triads > 0) {
                            var row = result.rows.item(i);
                            transaction.executeSql('UPDATE equipos SET numEquipo = ? Where jugadorId = ?', [numTeam, row.UserId], nullHandler, errorHandler);
                            count++;
                            triads -= .5;
                            i++;
                        }
                    } else {
                        if (totalPlayers - len == 1 || (totalPlayers - (len * 2)) > 0) {
                            numTeam = 1;
                            i = len - 1;
                            while ((pairs - countP) > 0) {
                                var top = Math.round((pairs / maxCapacity) * 2) / 2;
                                if ((pairs - countP) >= top) {
                                    var rim = top;
                                    while (rim > 0) {
                                        var row = result.rows.item(i);
                                        transaction.executeSql('UPDATE equipos SET numEquipo = ? Where jugadorId = ?', [numTeam, row.UserId], nullHandler, errorHandler);
                                        count++;
                                        i--;
                                        countP += .5;
                                        rim -= .5;
                                    }
                                    numTeam++;
                                } else {
                                    var rem = pairs - countP;
                                    while (rem > 0) {
                                        var row = result.rows.item(i);
                                        transaction.executeSql('UPDATE equipos SET numEquipo = ? Where jugadorId = ?', [numTeam, row.UserId], nullHandler, errorHandler);
                                        count++;
                                        i--;
                                        countP += .5;
                                        rem -= .5;
                                    }
                                    numTeam++;
                                }
                                window.console.log('se agrega a numTeam= ' + numTeam + ' y countp= ' + countP);
                            }
                        } else {
                            while ((pairs - countP) > 0) {
                                var top = Math.round((Math.ceil(pairs) / maxCapacity) * 2) / 2;
                                if (maxCapacity > 2) {
                                    if (top == 2.5) {
                                        if (numTeam < maxCapacity) {
                                            top = 2;
                                        }
                                    }
                                    if (top == 1.5) {
                                        if (numTeam == maxCapacity) {
                                            top = 2;
                                        }
                                    }
                                }
                                window.console.log('top ' + top);
                                if ((pairs - countP) >= top) {
                                    var rim = top;
                                    while (rim > 0) {
                                        var row = result.rows.item(i);
                                        transaction.executeSql('UPDATE equipos SET numEquipo = ? Where jugadorId = ?', [numTeam, row.UserId], nullHandler, errorHandler);
                                        count++;
                                        i++;
                                        countP += .5;
                                        rim -= .5;
                                        window.console.log('se agrega a numTeam= ' + numTeam + ' y countp= ' + countP);
                                    }
                                    numTeam--;
                                } else {
                                    var rem = pairs - countP;
                                    while (rem > 0) {
                                        var row = result.rows.item(i);
                                        transaction.executeSql('UPDATE equipos SET numEquipo = ? Where jugadorId = ?', [numTeam, row.UserId], nullHandler, errorHandler);
                                        count++;
                                        i++;
                                        countP += .5;
                                        rem -= .5;
                                        window.console.log('se agrega a numTeam= ' + numTeam + ' y countp= ' + countP);
                                    }
                                    numTeam--;
                                }
                            }
                        }
                    }
                }
            }, nullHandler, errorHandler);

        var topsArray = [];
        var sEarly = 'SOLO';
        transaction.executeSql('SELECT * FROM jugadores WHERE Early = ?', [sEarly],
            function(transaction, result) {
                if (result != null && result.rows != null) {
                    if (result.rows.length == 0) {} else {
                        window.console.log('count ' + count);
                        var numTeam = 1;
                        var resultArray = [];
                        for (var i = 0; i < result.rows.length; i++) {
                            resultArray.push(result.rows.item(i));
                        }
                        var shuffledArray = shuffle(resultArray);
                        var len = result.rows.length;
                        for (var w = 0; w < maxCapacity; w++) {
                            topsArray.push(0);
                        }
                        var herm = count;
                        var soly = totalPlayers - 1;
                        var fnumTeams = maxCapacity;
                        if (count <= 3) {
                            topsArray[0] = count;
                        } else {
                            if (herm == soly) {
                                fnumTeams = 1;
                                while (herm > 0) {
                                    if (fnumTeams > maxCapacity) {
                                        fnumTeams = 1;
                                    }
                                    var rar = topsArray[fnumTeams - 1];
                                    topsArray[fnumTeams - 1] = rar + 1;
                                    fnumTeams++;
                                    herm--;
                                }
                            } else {
                                while (herm > 0) {
                                    if (fnumTeams < 1) {
                                        fnumTeams = maxCapacity;
                                    }
                                    var rar = topsArray[fnumTeams - 1];
                                    topsArray[fnumTeams - 1] = rar + 1;
                                    fnumTeams--;
                                    herm--;
                                }
                            }
                        }
                        window.console.log('tops ' + topsArray);
                        numTeam = maxCapacity;
                        var min = topsArray[maxCapacity - 1];
                        for (var m = 0; m < topsArray.length; m++) {
                            if (topsArray[m] < min) {
                                min = topsArray[m];
                            }
                        }
                        window.console.log('min ' + min);
                        for (var i = 0; i < len; i++) {
                            var row = shuffledArray[i];
                            if (numTeam < 1) {
                                numTeam = maxCapacity;
                            }
                            window.console.log('esta iteracion ' + topsArray[numTeam - 1]);
                            if (topsArray[numTeam - 1] > min) {
                                var temp = topsArray[numTeam - 1];
                                while (temp > min) {
                                    numTeam -= 1;
                                    if (numTeam < 1) {
                                        numTeam = maxCapacity;
                                    }
                                    temp = topsArray[numTeam - 1];
                                }
                                window.console.log('temp ' + temp + '\nmin ' + min);
                            }
                            if (count <= 3 && len <= 2) {
                                numTeam = 1;
                            }
                            window.console.log('iteracion antes de entrar ' + topsArray[numTeam - 1]);
                            transaction.executeSql('UPDATE equipos SET numEquipo = ? Where jugadorId = ?', [numTeam, row.UserId], nullHandler, errorHandler);
                            var temp = topsArray[numTeam - 1];
                            topsArray[numTeam - 1] = temp + 1;
                            numTeam--;
                            window.console.log(topsArray);
                            min = topsArray[maxCapacity - 1];
                            for (var n = 0; n < topsArray.length; n++) {
                                if (topsArray[n] < min) {
                                    min = topsArray[n];
                                }
                            }
                        }
                    }
                }
            }, nullHandler, errorHandler);

        var yEarly = 'YES';
        transaction.executeSql('SELECT * FROM jugadores, equipos WHERE jugadores.UserId = equipos.jugadorId AND jugadores.Early = ? ORDER BY equipos.numPareja DESC', [yEarly],
            function(transaction, result) {
                if (result != null && result.rows != null) {
                    if (result.rows.length == 0) {
                        ListDBHandicapTeam();
                        $("body").pagecontainer("change", "#page9");
                        return;
                    } else {
                        var numTeam = maxCapacity;
                        var resultArray = [];
                        for (var i = 0; i < result.rows.length; i++) {
                            resultArray.push(result.rows.item(i));
                        }
                        var shuffledArray = shuffle(resultArray);
                        var len = result.rows.length;
                        if (topsArray.length == 0) {
                            for (var w = 0; w < maxCapacity; w++) {
                                topsArray.push(0);
                            }
                            var herm = count;
                            var soly = totalPlayers - 1;
                            var fnumTeams = maxCapacity;
                            if (count <= 3) {
                                topsArray[0] = count;
                            } else {
                                if (herm == soly) {
                                    fnumTeams = 1;
                                    while (herm > 0) {
                                        if (fnumTeams > maxCapacity) {
                                            fnumTeams = 1;
                                        }
                                        var rar = topsArray[fnumTeams - 1];
                                        topsArray[fnumTeams - 1] = rar + 1;
                                        fnumTeams++;
                                        herm--;
                                    }
                                } else {
                                    while (herm > 0) {
                                        if (fnumTeams < 1) {
                                            fnumTeams = maxCapacity;
                                        }
                                        var rar = topsArray[fnumTeams - 1];
                                        topsArray[fnumTeams - 1] = rar + 1;
                                        fnumTeams--;
                                        herm--;
                                    }
                                }
                            }
                        }
                        window.console.log('tops ' + topsArray);
                        numTeam = maxCapacity;
                        var min = topsArray[maxCapacity - 1];
                        for (var m = 0; m < topsArray.length; m++) {
                            if (topsArray[m] < min) {
                                min = topsArray[m];
                            }
                        }
                        window.console.log('min ' + min);
                        for (var i = 0; i < result.rows.length; i++) {
                            var row = shuffledArray[i];
                            if (numTeam < 1) {
                                numTeam = maxCapacity;
                            }
                            window.console.log('esta iteracion ' + topsArray[numTeam - 1]);
                            if (topsArray[numTeam - 1] > min) {
                                var temp = topsArray[numTeam - 1];
                                while (temp > min) {
                                    numTeam -= 1;
                                    if (numTeam < 1) {
                                        numTeam = maxCapacity;
                                    }
                                    temp = topsArray[numTeam - 1];
                                }
                                window.console.log('temp ' + temp + '\nmin ' + min);
                            }
                            /*if(topsArray[numTeam-1]==min){
                                if(numTeam==1){
                                    numTeam=maxCapacity;
                                }
                            }*/
                            if (count <= 3 && len <= 2) {
                                numTeam = 1;
                            }
                            window.console.log('iteracion antes de entrar ' + topsArray[numTeam - 1] + ' en team ' + numTeam);
                            transaction.executeSql('UPDATE equipos SET numEquipo = ? Where jugadorId = ?', [numTeam, row.UserId], nullHandler, errorHandler);
                            var temp = topsArray[numTeam - 1];
                            topsArray[numTeam - 1] = temp + 1;
                            numTeam--;
                            window.console.log(topsArray);
                            min = topsArray[maxCapacity - 1];
                            for (var n = 0; n < topsArray.length; n++) {
                                if (topsArray[n] < min) {
                                    min = topsArray[n];
                                }
                            }
                        }
                    }
                    ListDBHandicapTeam();
                    $("body").pagecontainer("change", "#page9");
                } else {
                    if (maxCapacity != 0) {
                        ListDBHandicapTeam();
                        $("body").pagecontainer("change", "#page9");
                    }
                }
            }, nullHandler, errorHandler);

    }, errorHandler, nullHandler);
}

/*
    HandicapCheck checa si hay 3 o menos jugadores, de ser asi, los cambia a jugadores solitarios. Early = SOLO
*/

function HandicapCheck() {
    db.transaction(function(transaction) {
        var nEarly = 'NO';
        transaction.executeSql('SELECT * FROM jugadores WHERE Early = ?', [nEarly],
            function(transaction, result) {
                if (result != null && result.rows != null) {
                    if (result.rows.length <= 3) {
                        for (var i = 0; i < result.rows.length; i++) {
                            var row = result.rows.item(i);
                            var Solo = 'SOLO';
                            transaction.executeSql('UPDATE jugadores SET Early = ? Where UserId= ?', [Solo, row.UserId]);
                        }
                    }
                    HandicapPair();
                }
            }, nullHandler, errorHandler);
    }, errorHandler, nullHandler);
}

/*
    HandicapPair le asiga parejas a los jugadores dependiendo de su handicap.
*/

function HandicapPair() {
    db.transaction(function(transaction) {
        transaction.executeSql('DROP TABLE IF EXISTS equipos');
        transaction.executeSql('CREATE TABLE IF NOT EXISTS equipos(EquipoId INTEGER NOT NULL PRIMARY KEY, jugadorId INTEGER NOT NULL, numEquipo INTEGER NOT NULL, numPareja INTEGER NOT NULL)', [], nullHandler, errorHandler);

        var nEarly = 'NO';
        var count = 0;
        var maxCapacity = 0;
        var totalPlayers = 0;
        transaction.executeSql('SELECT * FROM jugadores', [],
            function(transaction, result) {
                if (result != null && result.rows != null) {
                    maxCapacity = (Math.ceil(result.rows.length / 5.0) * 5) / 5;
                    totalPlayers = result.rows.length;
                }
            }, nullHandler, errorHandler);

        transaction.executeSql('SELECT * FROM jugadores WHERE Early = ? ORDER BY Handicap ASC', [nEarly],
            function(transaction, result) {
                if (result != null && result.rows != null) {
                    var numTeamsT = 0;
                    var numPairT = 1;
                    var resultArray = [];
                    for (var i = 0; i < result.rows.length; i++) {
                        var row = result.rows.item(i);
                        if (result.rows.length < 4) {
                            window.console.log('THIS CANNOT BE!');
                        } else {
                            resultArray.push(row.UserId);
                        }

                    }
                    window.console.log('Array de Ids ordenado ' + resultArray);
                    while (resultArray.length > 0) {
                        if (resultArray.length == 1) {
                            window.console.log('Solo hay un jugador restante sin pareja');
                            var player = resultArray.pop();
                            var pairLast = Math.floor(Math.random() * (numPairT - 2 + 1)) + 1;
                            //var pairLast = numPairT-1;
                            window.console.log('Se agrega el ultimo jugador a pareja ' + pairLast);
                            transaction.executeSql('INSERT INTO equipos (jugadorId, numEquipo, numPareja) VALUES (?, ?, ?)', [player, numTeamsT, pairLast], nullHandler, errorHandler);
                            window.console.log(resultArray);
                            count++;
                        } else {
                            var player1 = resultArray.shift();
                            var player2 = resultArray.pop();
                            window.console.log('Id ' + player1 + ' y id ' + player2 + ' salen del array');
                            transaction.executeSql('INSERT INTO equipos (jugadorId, numEquipo, numPareja) VALUES (?, ?, ?)', [player1, numTeamsT, numPairT], nullHandler, errorHandler);
                            transaction.executeSql('INSERT INTO equipos (jugadorId, numEquipo, numPareja) VALUES (?, ?, ?)', [player2, numTeamsT, numPairT], nullHandler, errorHandler);
                            window.console.log(resultArray);
                            count += 2;
                            numPairT++;
                        }
                    }
                }
            }, nullHandler, errorHandler);

        var sEarly = 'SOLO';
        transaction.executeSql('SELECT * FROM jugadores WHERE Early = ?', [sEarly],
            function(transaction, result) {
                if (result != null && result.rows != null) {
                    var numTeamsT = 0;
                    var numPairT = 0;
                    window.console.log(result.rows.length);
                    for (var i = 0; i < result.rows.length; i++) {
                        transaction.executeSql('INSERT INTO equipos (jugadorId, numEquipo, numPareja) VALUES (?, ?, ?)', [result.rows.item(i).UserId, numTeamsT, numPairT], nullHandler, errorHandler);
                    }
                }
            }, nullHandler, errorHandler);

        var yEarly = 'YES';
        transaction.executeSql('SELECT * FROM jugadores WHERE Early = ?', [yEarly],
            function(transaction, result) {
                if (result != null && result.rows != null) {
                    var numTeamsT = 0;
                    var numPairT = 0;
                    for (var i = 0; i < result.rows.length; i++) {
                        transaction.executeSql('INSERT INTO equipos (jugadorId, numEquipo, numPareja) VALUES (?, ?, ?)', [result.rows.item(i).UserId, numTeamsT, numPairT], nullHandler, errorHandler);
                    }
                    $('#page9 div[data-role="content"]').find('p:first-child b').html('HANDICAP');
                    HandicapTeam();
                }
            }, nullHandler, errorHandler);
    }, errorHandler, nullHandler);
}

/*
    ListDBHandicapTeam despliega a los jugadores en equipos y parejas
*/

function ListDBHandicapTeam() {
    $('#dbHandTeam').html('');
    db.transaction(function(transaction) {
        transaction.executeSql('SELECT * FROM jugadores, equipos WHERE jugadores.UserId = equipos.jugadorId ORDER BY equipos.numEquipo ASC, equipos.numPareja ASC, jugadores.Handicap ASC', [],
            function(transaction, result) {
                if (result != null && result.rows != null) {
                    var teamy = 0;
                    var parCheck = -1;
                    var txtTeams = '';
                    for (var i = 0; i < result.rows.length; i++) {
                        var row = result.rows.item(i);
                        if (row.numEquipo != teamy) {
                            parCheck = -1;
                            if (teamy != 0) txtTeams += '</tbody></table><br>';
                            teamy = row.numEquipo;
                            txtTeams += '<table data-role="table" data-mode="none"><thead class="ui-body-b"><th colspan=3>Equipo ' + teamy + '</th></thead><tbody>';
                        }
                        var parNum = row.numPareja;
                        if (parNum == 0) {
                            parNum = row.Early == 'SOLO' ? 'Solo' : 'Early';
                            txtTeams += '<tr><th>' + parNum + '</th><td>' + row.FirstName + ' ' + row.LastName + '</td><td>' + row.Handicap + '</td></tr>';
                        } else {
                            if (parNum != parCheck) {
                                parCheck = parNum;
                                var count = 0;
                                var index = 0;
                                while (index < result.rows.length) {
                                    var temp = result.rows.item(index++);
                                    if ((temp.numPareja == parNum) && (temp.numEquipo == teamy)) count++;
                                }
                                parNum = String.fromCharCode(64 + parNum);
                                txtTeams += '<tr><th rowspan=' + count + '>Pareja ' + parNum + '</th><td>' + row.FirstName + ' ' + row.LastName + '</td><td>' + row.Handicap + '</td></tr>';
                            } else { txtTeams += '<tr><td>' + row.FirstName + ' ' + row.LastName + '</td><td>' + row.Handicap + '</td></tr>'; };
                        }
                    }
                    $('#dbHandTeam').append(txtTeams).trigger('create');
                }
            }, errorHandler);
    }, errorHandler, nullHandler);
    return;
}

function ArmadosCheck() {
    db.transaction(function(transaction) {
        var nEarly = 'NO';
        transaction.executeSql('SELECT * FROM jugadores WHERE Early = ?', [nEarly],
            function(transaction, result) {
                if (result != null && result.rows != null) {
                    if (result.rows.length <= 3) {
                        for (var i = 0; i < result.rows.length; i++) {
                            var row = result.rows.item(i);
                            var Solo = 'SOLO';
                            transaction.executeSql('UPDATE jugadores SET Early = ? Where UserId= ?', [Solo, row.UserId]);
                        }
                        HandicapPair();
                    } else if (result.rows.length == 6) {
                        $('#armCont').removeClass('hidden');
                        crearArmados(true);
                    } else {
                        if (!$('#armCont').hasClass('hidden')) $('#armCont').addClass('hidden');
                        crearArmados(false);
                    }
                }
            }, nullHandler, errorHandler);
    }, errorHandler, nullHandler);
}

function crearArmados(checkTri) {
    db.transaction(function(transaction) {
        transaction.executeSql('SELECT * FROM JUGADORES WHERE Early = ?', ['NO'], function(transaction, result) {
            var options = '';
            var parCount = 1;
            var count = 1;
            for (var i = 0; i < result.rows.length; i++) {
                var row = result.rows.item(i);
                options += '<option value=' + row.UserId + '>' + row.FirstName + ' ' + row.LastName + '</option>';
            };
            //window.console.log(options);
            $('#dbArmTeam').html('');
            if (checkTri) {
                window.console.log('Triparejas!');
                pairs = '<table data-role="table" data-mode="none"><tbody><tr><th rowspan=' + 3 + '>Pareja ' + String.fromCharCode(64 + parCount) + '</th>';
                pairs += '<td><select pair="' + parCount + '" name="' + count++ + '" data-mini="true"><option value="0">Selecciona Jugador</option>' + options + '</select></td></tr><tr><td><select pair="' + parCount + '" name="' + count++ + '" data-mini="true"><option value="0">Selecciona Jugador</option>' + options + '</select></td></tr><tr><td><select pair="' + parCount + '" name="' + count++ + '" data-mini="true"><option value="0">Selecciona Jugador</option>' + options + '</select></td></tr></tbody></table><br>';
                $('#dbArmTeam').append(pairs).trigger('create');
                parCount++;
                pairs = '<table data-role="table" data-mode="none"><tbody><tr><th rowspan=' + 3 + '>Pareja ' + String.fromCharCode(64 + parCount) + '</th>';
                pairs += '<td><select pair="' + parCount + '" name="' + count++ + '" data-mini="true"><option value="0">Selecciona Jugador</option>' + options + '</select></td></tr><tr><td><select pair="' + parCount + '" name="' + count++ + '" data-mini="true"><option value="0">Selecciona Jugador</option>' + options + '</select></td></tr><tr><td><select pair="' + parCount + '" name="' + count++ + '" data-mini="true"><option value="0">Selecciona Jugador</option>' + options + '</select></td></tr></tbody></table><br>';
                $('#dbArmTeam').append(pairs).trigger('create');
            } else {
                var line = '<hr style="height:1px; background-color:#ccc; border:0; margin-top:12px; margin-bottom:12px;">';
                var pairs = '';
                var totalPairs = result.rows.length / 2;
                if (result.rows.length % 2 == 0) {
                    window.console.log('Par');
                    while (totalPairs > 0) {
                        var sLine = '';
                        if (totalPairs != result.rows.length / 2) {
                            sLine = line;
                        }
                        /*pairs='<div class="ui-block-a" style="width:100%" data-controltype="textblock">'+sLine+'<p style="text-align:center;" data-mce-style="text-align:center;"><b>Pareja '+String.fromCharCode(64 + parCount)+'</b></p></div>';
                        pairs+='<div class="ui-block-a" style="width:45%"><select pair="'+parCount+'" name="'+count+++'" data-mini="true"><option value="0">Selecciona Jugador</option>'+options+'</select></div><div class="ui-block-b" style="width:10%"><b> y </b></div><div class="ui-block-c" style="width:45%"><select pair="'+parCount+'" name="'+count+++'" data-mini="true"><option value="0">Selecciona Jugador</option>'+options+'</select></div>';*/
                        pairs = '<table data-role="table" data-mode="none"><tbody><tr><th rowspan=' + 2 + '>Pareja ' + String.fromCharCode(64 + parCount) + '</th>';
                        pairs += '<td><select pair="' + parCount + '" name="' + count++ + '" data-mini="true"><option value="0">Selecciona Jugador</option>' + options + '</select></td></tr><tr><td><select pair="' + parCount + '" name="' + count++ + '" data-mini="true"><option value="0">Selecciona Jugador</option>' + options + '</select></td></tr></tbody></table><br>';
                        $('#dbArmTeam').append(pairs).trigger('create');
                        parCount++;
                        totalPairs--;
                        //window.console.log('Total parejas = '+totalPairs);
                    }

                } else {
                    window.console.log('Impar');
                    while (totalPairs > 1.5) {
                        var sLine = '';
                        if (totalPairs != result.rows.length / 2) {
                            sLine = line;
                        }
                        pairs = '<table data-role="table" data-mode="none"><tbody><tr><th rowspan=' + 2 + '>Pareja ' + String.fromCharCode(64 + parCount) + '</th>';
                        pairs += '<td><select pair="' + parCount + '" name="' + count++ + '" data-mini="true"><option value="0">Selecciona Jugador</option>' + options + '</select></td></tr><tr><td><select pair="' + parCount + '" name="' + count++ + '" data-mini="true"><option value="0">Selecciona Jugador</option>' + options + '</select></td></tr></tbody></table><br>';
                        $('#dbArmTeam').append(pairs).trigger('create');
                        parCount++;
                        totalPairs--;
                        //window.console.log('Total parejas = '+totalPairs);
                    }
                    /*pairs='<div class="ui-block-a" style="width:100%" data-controltype="textblock">'+line+'<p><b>Pareja '+String.fromCharCode(64 + parCount)+' (Tripareja)</b></p></div>';
                    pairs+='<div class="ui-block-a" style="width:45%"><select pair="'+parCount+'" name="'+count+++'" data-mini="true"><option value="0">Selecciona Jugador</option>'+options+'</select></div><div class="ui-block-b" style="width:10%"></div><div class="ui-block-c" style="width:45%"><select pair="'+parCount+'" name="'+count+++'" data-mini="true"  data-mini="true"><option value="0">Selecciona Jugador</option>'+options+'</select></div><div><select pair="'+parCount+'" name="'+count+++'" data-inline="true" data-mini="true"><option value="0">Selecciona Jugador</option>'+options+'</select></div>';*/
                    pairs = '<table data-role="table" data-mode="none"><tbody><tr><th rowspan=' + 3 + '>Pareja ' + String.fromCharCode(64 + parCount) + '</th>';
                    pairs += '<td><select pair="' + parCount + '" name="' + count++ + '" data-mini="true"><option value="0">Selecciona Jugador</option>' + options + '</select></td></tr><tr><td><select pair="' + parCount + '" name="' + count++ + '" data-mini="true"><option value="0">Selecciona Jugador</option>' + options + '</select></td></tr><tr><td><select pair="' + parCount + '" name="' + count++ + '" data-mini="true"><option value="0">Selecciona Jugador</option>' + options + '</select></td></tr></tbody></table><br>';
                    $('#dbArmTeam').append(pairs).trigger('create');
                }
            }
            $('#dbArmTeam').trigger('create');
            $('#page9 div[data-role="content"]').find('p:first-child b').html('MANUAL');
            armSelect();
            $("body").pagecontainer("change", "#eqArm");
        }, errorHandler);
    }, errorHandler, nullHandler);
}

function armSelect() {
    var arrayChosen = [];
    var arraySelected = [];
    $('#dbArmTeam').find('select').on('change', function(e) {
        var check = $(this).val();
        var id = $(this).attr('name');
        window.console.log('id = ' + id + ' option = ' + check);
        var index = arrayChosen.indexOf(id);
        if (check != 0) {
            if (index == -1) {
                arrayChosen.push(id);
                arraySelected.push(check);
                //window.console.log('Arrays '+arrayChosen+' '+arraySelected);
                $('#dbArmTeam').find('select').each(function() {
                    $(this).find('option[value=' + check + ']').attr('disabled', true);
                });
            } else {
                $('#dbArmTeam').find('select').each(function() {
                    $(this).find('option[value=' + arraySelected[index] + ']').removeAttr('disabled');
                    $(this).find('option[value=' + check + ']').attr('disabled', true);
                });
                arraySelected[index] = check;
            }
        } else {
            if (index == -1) {} else {
                $('#dbArmTeam').find('select').each(function() {
                    $(this).find('option[value=' + arraySelected[index] + ']').removeAttr('disabled');
                });
                arraySelected[index] = check;
            }
        }
    });
}

function ArmadosPair() {
    db.transaction(function(transaction) {
        transaction.executeSql('DROP TABLE IF EXISTS equipos');
        transaction.executeSql('CREATE TABLE IF NOT EXISTS equipos(EquipoId INTEGER NOT NULL PRIMARY KEY, jugadorId INTEGER NOT NULL, numEquipo INTEGER NOT NULL, numPareja INTEGER NOT NULL)', [], nullHandler, errorHandler);
        var missing = false;
        var pairs = $('#dbArmTeam').find('select').last().attr('pair');
        window.console.log('Pairs ' + pairs);
        for (var i = 1; i <= pairs; i++) {
            var numTeamsT = 0;
            var numPairT = i;
            $('#dbArmTeam').find('select[pair="' + i + '"]').each(function() {
                var id = $(this).find(':selected').val();
                if (id == 0) {
                    if (!missing) {
                        vex.dialog.alert('Favor de seleccionar a todos los jugadores');
                        missing = true;
                        return;
                    }
                }
                window.console.log('Pareja ' + i + ' id ' + id);
                transaction.executeSql('INSERT INTO equipos (jugadorId, numEquipo, numPareja) VALUES (?, ?, ?)', [id, numTeamsT, numPairT], nullHandler, errorHandler);
            });
        };

        var sEarly = 'SOLO';
        transaction.executeSql('SELECT * FROM jugadores WHERE Early = ?', [sEarly],
            function(transaction, result) {
                if (result != null && result.rows != null) {
                    var numTeamsT = 0;
                    var numPairT = 0;
                    for (var i = 0; i < result.rows.length; i++) {
                        transaction.executeSql('INSERT INTO equipos (jugadorId, numEquipo, numPareja) VALUES (?, ?, ?)', [result.rows.item(i).UserId, numTeamsT, numPairT], nullHandler, errorHandler);
                    }
                }
            }, nullHandler, errorHandler);

        var yEarly = 'YES';
        transaction.executeSql('SELECT * FROM jugadores WHERE Early = ?', [yEarly],
            function(transaction, result) {
                if (result != null && result.rows != null) {
                    var numTeamsT = 0;
                    var numPairT = 0;
                    for (var i = 0; i < result.rows.length; i++) {
                        transaction.executeSql('INSERT INTO equipos (jugadorId, numEquipo, numPareja) VALUES (?, ?, ?)', [result.rows.item(i).UserId, numTeamsT, numPairT], nullHandler, errorHandler);
                    }
                    if (!missing) {
                        HandicapTeam();
                    }
                }
            }, nullHandler, errorHandler);
    }, errorHandler, nullHandler);
}

function pairIndCheck() {
    db.transaction(function(transaction) {
        transaction.executeSql('SELECT * FROM jugadores WHERE Early != ?', ['YES'],
            function(transaction, result) {
                if (result != null && result.rows != null) {
                    if (result.rows.length == 3) {
                        vex.dialog.confirm({
                            message: '<div style="font-size:large;text-align: center;border-bottom: 1px solid #203744;"><b>YOYO</b></div><p style="font-size:medium;">¿Desea jugar YOYO?</p><br>',
                            buttons: [
                                $.extend({}, vex.dialog.buttons.YES, {
                                    className: 'okButton',
                                    text: 'Si',
                                    click: function($vexContent, event) {
                                        $vexContent.data().vex.value = true;
                                        vex.close($vexContent.data().vex.id);
                                    }
                                }),
                                $.extend({}, vex.dialog.buttons.NO, {
                                    text: 'No',
                                    click: function($vexContent, event) {
                                        vex.close($vexContent.data().vex.id);
                                    }
                                })
                            ],
                            callback: function(value) {
                                window.console.log('Choice', value ? 'YOYO' : 'Normal');
                                if (value) {
                                    window.localStorage.setItem("Yoyo", 1);
                                    parejasApuesta(1);
                                    return;
                                } else {
                                    parejasApuesta(0);
                                    return;
                                }
                            }
                        });
                    } else {
                        var Yoyo = window.localStorage.getItem("Yoyo");
                        if(Yoyo == 2) parejasApuesta(2);
                        else parejasApuesta(0);
                        return;
                    }
                }
            }, errorHandler);
    }, errorHandler, nullHandler);
}
