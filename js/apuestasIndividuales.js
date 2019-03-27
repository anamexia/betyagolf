function apFrom(id) {
    $(window).off("orientationchange");
    $(window).on("orientationchange", function(event) {
        var headerH = $('#indApsDet').find('[data-role="header"]').outerHeight() - 1;
        $('#apNavBar').css('top', headerH + 'px');
    });
    $("#dbStakeInd > div").velocity({ opacity: 0 }, { display: "none", duration: 0 });
    $("#dbStakePair > div").velocity({ opacity: 0 }, { display: "none", duration: 0 });
    var elements = "[playerA='" + id + "'],[playerB='" + id + "']";
    var elements2 = "[playerA1='" + id + "'],[playerA2='" + id + "'],[playerB1='" + id + "'],[playerB2='" + id + "']";
    $("#dbStakeInd > div").filter(elements).velocity({ opacity: 1 }, { display: "block", duration: 0 });
    console.log($("#dbStakePair > div"));
    console.log($("#dbStakePair > div").filter(elements2));
    $("#dbStakePair > div").filter(elements2).velocity({ opacity: 1 }, { display: "block", duration: 0 });
    db.transaction(function(transaction) {
        doQuery(transaction, 'SELECT * FROM User WHERE UserId=?', [id],
            function(transaction, result) {
                if (result != null && result.rows != null) {
                    var name = result.rows.item(0).FirstName + ' ' + result.rows.item(0).LastName;
                    $('#indApsDet [data-role="header"]').find('h3 b').html(name);
                    $("body").pagecontainer("change", "#indApsDet", { transition: "slide" });
                    $('#apIndNav').trigger("click");
                }
            });
    }, errorHandler, nullHandler);
}

function slidingChange() {
    var activated = false;
    $('input[type="checkbox"]#sliding').on('change', function(e) {
        var id = $(this).attr('stkid');
        window.console.log(id);
        if ($(this).is(':checked') && !activated) {
            window.console.log('checked');
            activated = true;
            var divy = $('#stkInd' + id),
                p1 = divy.attr('playerA'),
                p2 = divy.attr('playerB'),
                name1 = "",
                name2 = "",
                id1, id2,
                han1 = 0,
                han2 = 0,
                value = 0;
            db.transaction(function(transaction) {
                doQuery(transaction, 'SELECT * FROM User', [],
                    function(transaction, result) {
                        if (result != null && result.rows != null) {
                            doQuery(transaction, 'SELECT * FROM BancoApuestasI', [],
                                function(transaction, results) {
                                    if (results != null && results.rows != null) {
                                        var checkVal = false,
                                            idS1 = '',
                                            idS2 = '';
                                        for (var i = 0; i < result.rows.length; i++) {
                                            var row = result.rows.item(i);
                                            if (row.UserId == p1) {
                                                name1 = row.FirstName + ' ' + row.LastName;
                                                id1 = row.UserId;
                                                han1 = row.Handicap;
                                            }
                                            if (row.UserId == p2) {
                                                name2 = row.FirstName + ' ' + row.LastName;
                                                id2 = row.UserId;
                                                han2 = row.Handicap;
                                            }
                                        }
                                        if (han1 > han2) {
                                            idS1 = 'selected';
                                        } else {
                                            idS2 = 'selected';
                                        }
                                        value = han1 - han2;
                                        value = Math.abs(value);
                                        window.console.log('append ' + value);
                                        $('#sli' + id).append('<div id="slidy' + id + '" class="ui-grid-a"><b>Dar ventaja a quien?</b><div class="ui-block-a" style="width:75%"><select id="slidSelect" data-mini="true"><option value="' + id1 + '" ' + idS1 + '>' + name1 + '</option><option value="' + id2 + '" ' + idS2 + '>' + name2 + '</option> </select></div><div class="ui-block-b" style="width:25%"><input data-mini="true" value="' + value + '" type="number"></div><div class="ui-block-a" style="width:100%"><div style="width:40%"><input type="checkbox" id="casado' + id + '" data-mini="true"><label for="casado' + id + '">Casados?</label></div></div></div>').trigger("create");
                                    }
                                });

                        }
                    });
            }, errorHandler, nullHandler);

        } else {
            window.console.log('Unchecked');
            $('#slidy' + id).remove();
            activated = false;
        }
    });
}

function activeSlidingChange() {
    $('input[type="checkbox"]#aSliding').on('change', function(e) {
        //window.console.log($(this).attr('stkid'));
        if (!$(this).is(':checked')) {
            $(this).prop('checked', true).flipswitch("refresh");
            var id = $(this).attr('stkid');
            window.console.log(id);
            vex.dialog.confirm({
                message: '<div style="font-size:large;text-align: center;border-bottom: 1px solid #203744;"><b>APUESTAS</b></div><p style="font-size:medium;">Esta seguro que quiere deshabilitar Sliding?<br>Se borrara toda la informacion previa!</p>',
                buttons: [
                    $.extend({}, vex.dialog.buttons.YES, {
                        className: 'redButton',
                        text: 'DESHABILITAR',
                        click: function($vexContent, event) {
                            $vexContent.data().vex.value = true;
                            vex.close($vexContent.data().vex.id);
                        }
                    }),
                    $.extend({}, vex.dialog.buttons.NO, {
                        className: 'simpleCancel',
                        text: 'Cancelar',
                        click: function($vexContent, event) {
                            vex.close($vexContent.data().vex.id);
                        }
                    })
                ],
                callback: function(value) {
                    window.console.log('Choice', value ? 'Continue' : 'Cancel');
                    if (value) {
                        borrarSliding(id);
                    }
                }
            });
        }
    });
}

function borrarSliding(id) {
    window.console.log('Se borra Sliding');
    $('#stkInd' + id).find('#sli' + id).html('<b>Sliding&nbsp&nbsp&nbsp</b><input type="checkbox" data-on-text="YES" data-off-text="NO" data-role="flipswitch" stkid="' + id + '" id="sliding">').trigger('create');
    $('input[type="checkbox"]#sliding').off();
    slidingChange();
    var divy = $('#stkInd' + id);
    var p1 = divy.attr('playerA');
    var p2 = divy.attr('playerB');
    db.transaction(function(transaction) {
        doQuery(transaction, 'UPDATE BancoApuestasI SET sliding = ?, playerS = ?, ventaja = ?, casado = ? WHERE playerA = ? and playerB = ?', ["NO", 0, 0, "NO", p1, p2], nullHandler);
    }, errorHandler, nullHandler);
}

function agregarApuesta(id, idA, idB) {
    db.transaction(function(transaction) {
        doQuery(transaction, 'SELECT * FROM User', [],
            function(transaction, result) {
                if (result != null && result.rows != null) {
                    var nameA = '';
                    var nameB = '';
                    for (var i = 0; i < result.rows.length; i++) {
                        var row = result.rows.item(i);
                        if (row.UserId == idA) {
                            nameA = row.FirstName + ' ' + row.LastName;
                        }
                        if (row.UserId == idB) {
                            nameB = row.FirstName + ' ' + row.LastName;
                        }
                    }
                    doQuery(transaction, 'SELECT * FROM BancoApuestasI', [],
                        function(transaction, result) {
                            if (result != null && result.rows != null) {
                                var valueA = 50,
                                    valueB = 100,
                                    valueM = 100,
                                    existApuesta = false,
                                    existSliding = false,
                                    slidingRow,
                                    slidingName = '',
                                    casados = '';
                                for (var l = 0; l < result.rows.length; l++) {
                                    if (idA == result.rows.item(l).playerA) {
                                        if (idB == result.rows.item(l).playerB) {
                                            window.console.log('Apuesta ' + idA + ' VS ' + idB + ' existe en bandoApuestasI!');
                                            existApuesta = true;
                                            if (result.rows.item(l).sliding == "YES") {
                                                slidingRow = result.rows.item(l);
                                                existSliding = true;
                                                window.console.log(' Sliding para  ' + slidingRow.playerS + ' con ventaja de ' + slidingRow.ventaja);
                                                if (slidingRow.playerS == idA) {
                                                    slidingName = nameA;
                                                } else {
                                                    slidingName = nameB;
                                                }
                                                if (slidingRow.casado == "YES") {
                                                    casados = 'checked="checked"';
                                                }
                                            }
                                            valueA = result.rows.item(l).rondaA;
                                            valueB = result.rows.item(l).rondaB;
                                            valueM = result.rows.item(l).match;
                                        }
                                    }
                                }
                                var apInd = '<div class="apuestasDiv" title="ckStInd" id="stkInd' + id + '" playerA="' + idA + '" playerB="' + idB + '">';
                                //var clickHandler = 'borrarBaInd';
                                if (!existApuesta) {
                                    apInd += '<div style="width: 100%; overflow: hidden;"><div style="float:left; color:red;"><b>*NEW*</b></div> <div style="float:right;"><a onClick="borrarBaInd(' + id + ')" class="ui-btn ui-icon-delete ui-btn-icon-notext ui-corner-all ui-nodisc-icon ui-alt-icon BYGsimple"></a></div></div>';
                                } else {
                                    apInd += '<div align="right"><a onClick="borrarBaInd(' + id + ')" class="ui-btn ui-icon-delete ui-btn-icon-notext ui-corner-all ui-nodisc-icon ui-alt-icon BYGsimple"></a></div>';
                                }

                                apInd += '<div data-controltype="textblock"><p style="text-align: center;"><b>' + nameA + ' VS ' + nameB + '</b></p> </div>';

                                if (existSliding) {
                                    apInd += '<div align="center" id="sli' + id + '"><b>Sliding&nbsp&nbsp&nbsp</b><input type="checkbox" data-on-text="YES" data-corners="false" data-off-text="NO" data-role="flipswitch" stkid="' + id + '" id="aSliding" checked=""><div id="slidy' + id + '" class="ui-grid-a"><b>Ventaja para</b><div class="ui-block-a" style="width:75%"><select id="slidSelect" data-mini="true" disabled><option value="' + slidingRow.playerS + '" selected>' + slidingName + '</option></select></div><div class="ui-block-b" style="width:25%"><input data-mini="true" value="' + slidingRow.ventaja + '" placeholder="sliding" type="number"></div><div class="ui-block-a" style="width:100%"><div style="width:40%"><input type="checkbox" id="casado' + id + '" data-mini="true" ' + casados + '><label for="casado' + id + '">Casados?</label></div></div></div></div>';
                                } else {
                                    apInd += '<div align="center" id="sli' + id + '"><b>Sliding&nbsp&nbsp&nbsp</b><input type="checkbox" data-on-text="YES" data-corners="false" data-off-text="NO" data-role="flipswitch" stkid="' + id + '" id="sliding"></div>';
                                }

                                apInd += '<div style="bottom:0px; padding:1px;background-color:#65C77F;"><div style="background:white;margin:10px;"><table style="width: 100%"><tbody><tr><td><b>Ronda 1</b><input type="text" data-role="spinbox" data-type="vertical" name="stkInd" id="rA' + id + '" value="' + valueA + '" min="0" max="10000" step="25" data-mini="true"/></td><td><b>Ronda 2</b><input type="text" data-role="spinbox" data-type="vertical" name="stkInd" id="rA' + id + '" value="' + valueB + '" min="0" max="10000" step="25" data-mini="true"/></td><td><b>Match</b><input type="text" data-role="spinbox" data-type="vertical" name="stkInd" id="m' + id + '" value="' + valueM + '" min="0" max="10000" step="25" data-mini="true"/></td></tr></tbody></table></div></div>';

                                window.console.log('\nA ' + idA + ' B ' + idB);
                                $('#dbStakeInd').prepend(apInd);
                                $('#dbStakeInd').trigger("create");
                                $("#dbStakeInd > div").show();
                                $('input[type="checkbox"]#sliding').off();
                                $('input[type="checkbox"]#aSliding').off();
                                slidingChange();
                                activeSlidingChange();
                                $('#li' + id).remove();
                                $('#popIndiAdd > ul').listview("refresh");
                                if ($('#popIndiAdd > ul').find('li').length == 2) {
                                    $('#indiAdd').hide();
                                }
                                $("#popIndiAdd").popup("close");
                            }
                        });
                }
            });

    }, errorHandler, nullHandler);
}

function presionIndividual(limite) {
    db.transaction(function(transaction) {
        var Hoyos = window.sessionStorage.getItem("Hoyos");
        var rondaNumber = window.sessionStorage.getItem("Ronda");
        var limitPresion = 2;
        if (limite != undefined) {
            limitPresion = limite;
        }
        if (rondaNumber == null) {
            rondaNumber = 1;
            doQuery(transaction, 'DROP TABLE IF EXISTS presionIndividual', false, nullHandler);
            doQuery(transaction, 'CREATE TABLE IF NOT EXISTS presionIndividual(IdPresionI INTEGER NOT NULL PRIMARY KEY, playerA INTEGER NOT NULL, playerB INTEGER NOT NULL, Ronda INTEGER NOT NULL, Nivel INTEGER NOT NULL, Presion INTEGER NOT NULL)', [], nullHandler);
            doQuery(transaction, 'DROP TABLE IF EXISTS stepIndividual', false, nullHandler);
            doQuery(transaction, 'CREATE TABLE IF NOT EXISTS stepIndividual(stepId INTEGER NOT NULL PRIMARY KEY, playerA INTEGER NOT NULL, playerB INTEGER NOT NULL, Ronda INTEGER NOT NULL, Ventaja INTEGER NOT NULL, Steping INTEGER NOT NULL)', false, nullHandler);
        }
        window.console.log('Empieza en hoyo ' + Hoyos + '\nRonda ' + rondaNumber);


        //var campBlock = {};
        var inicio = parseInt(Hoyos),
            fin = inicio + 8;
        var campStart = inicio==1?1:2;
        early = 'YES';
        doQuery(transaction, 'SELECT * FROM jugadores WHERE Early != ?', [early],
            function(transaction, results) {
                if (results != null && results.rows != null) {

                    var allPlayers = {};

                    for (var i = 0; i < results.rows.length; i++) {
                        var row = results.rows.item(i);
                        allPlayers[row.UserId] = row;
                    }

                    console.log('allPlayers', allPlayers);
                    doQuery(transaction, 'SELECT * FROM BancoApuestasI ORDER BY playerA ASC, playerB ASC', [], function(transaction, result) {
                        doQuery(transaction, 'SELECT * FROM Scores WHERE Hoyo BETWEEN ? AND ? ORDER BY Hoyo ASC', [Hoyos, fin], function(transaction, resultScores) {
                            if (result != null && result.rows != null) {
                                console.log(result);
                                var slidingArray = [];
                                for (var m = 0; m < result.rows.length; m++) {
                                    var row = result.rows.item(m);
                                    slidingArray.push(result.rows.item(m));
                                    if (allPlayers.hasOwnProperty(row.playerA) && allPlayers.hasOwnProperty(row.playerB)) {
                                        var prA = allPlayers[row.playerA],
                                            prB = allPlayers[row.playerB];
                                        console.log("Bet Exists", row, allPlayers[row.playerA], allPlayers[row.playerB]);
                                        var scoreA = [];
                                        var scoreB = [];
                                        for (var k = 0; k < resultScores.rows.length; k++) {
                                            var id = resultScores.rows.item(k).IdJugador;
                                            if (id == row.playerA) {
                                                scoreA.push(resultScores.rows.item(k).ScoreHoyo);
                                            }
                                            if (id == row.playerB) {
                                                scoreB.push(resultScores.rows.item(k).ScoreHoyo);
                                            }
                                        }
                                        window.console.log('scoreA ' + scoreA + '\nscoreB ' + scoreB);

                                        var checkSlide = false;
                                        var playerS = 0;
                                        var sliVentaja = 0;
                                        if (row.sliding == "YES") {
                                            checkSlide = true;
                                            playerS = row.playerS;
                                            sliVentaja = row.ventaja;
                                        }

                                        window.console.log('sliding? ' + checkSlide + ' playerS = ' + playerS + ' ventaja = ' + sliVentaja);
                                        var ventajaStep = 0,
                                            p1Start = prA.tStart,
                                            p2Start = prB.tStart;
                                        if (checkSlide) {
                                            window.console.log('Se aplica ventaja por sliding!');
                                            if (prA.UserId == playerS) {
                                                window.console.log('Ventaja para A\n');
                                                ventajaStep = ajustarScoreI(rondaNumber, sliVentaja, campBlock[campStart], p1Start, scoreA);
                                            } else {
                                                window.console.log('Ventaja para B\n');
                                                ventajaStep = -ajustarScoreI(rondaNumber, sliVentaja, campBlock[campStart], p2Start, scoreB);
                                            }
                                        } else {
                                            if (prA.Handicap < prB.Handicap) {
                                                window.console.log('Ventaja para B\n');
                                                ventajaStep = -ajustarScoreI(rondaNumber, prB.Handicap - prA.Handicap, campBlock[campStart], p2Start, scoreB);
                                            }
                                            if (prA.Handicap > prB.Handicap) {
                                                window.console.log('Ventaja para A\n');
                                                ventajaStep = ajustarScoreI(rondaNumber, prA.Handicap - prB.Handicap, campBlock[campStart], p1Start, scoreA);
                                            }
                                        }

                                        window.console.log('A ' + scoreA + '\nB ' + scoreB);

                                        window.console.log('Comparar para presion!');

                                        var arrayPresion = [];
                                        arrayPresion.push(0);
                                        window.console.log('arrayPresion = ' + arrayPresion);
                                        var stepPresion = [];
                                        for (var n = 0; n < scoreA.length; n++) {
                                            var presion = 0;
                                            var a1 = scoreA[n];
                                            var b1 = scoreB[n];

                                            if (a1 < b1) {
                                                presion++;
                                            }
                                            if (a1 > b1) {
                                                presion--;
                                            }
                                            for (var o = 0; o < arrayPresion.length; o++) {
                                                arrayPresion[o] += presion;
                                            }
                                            window.console.log('presion ' + presion);
                                            window.console.log(arrayPresion);
                                            var checkPresion = Math.abs(arrayPresion[arrayPresion.length - 1]);
                                            stepPresion.push(arrayPresion.join(','));
                                            if (checkPresion >= limitPresion) {
                                                arrayPresion.push(0);
                                            }
                                        }
                                        window.console.log('Final ' + arrayPresion);
                                        var stepper = stepPresion.join('|');
                                        //stepIBuilder(transaction, prA.UserId, prB.UserId, rondaNumber, ventajaStep, stepper);
                                        console.log("stepIndividual", prA.UserId, prB.UserId, rondaNumber, ventajaStep, stepper);
                                        doQuery(transaction, 'INSERT INTO stepIndividual(playerA, playerB, Ronda, Ventaja, Steping) VALUES (?, ?, ?, ?, ?)', [prA.UserId, prB.UserId, rondaNumber, ventajaStep, stepper], nullHandler);

                                        //console.log('StepPresion', stepPresion);
                                        window.console.log('\nA = ' + prA.UserId + '\nB = ' + prB.UserId);
                                        if (rondaNumber == 1) {
                                            if (arrayPresion[0] == 0) {
                                                window.console.log('Entra Carry!');
                                                doQuery(transaction, 'UPDATE BancoApuestasI SET carry = ? WHERE playerA = ? and playerB = ?', ["YES", prA.UserId, prB.UserId], nullHandler);
                                            } else
                                                doQuery(transaction, 'UPDATE BancoApuestasI SET carry = ? WHERE playerA = ? and playerB = ?', ["NO", prA.UserId, prB.UserId], nullHandler);
                                        }
                                        for (var p = 0; p < arrayPresion.length; p++) {
                                            var nivelPresion = p + 1;
                                            var presionPos = arrayPresion[p];
                                            var presionInv = -(arrayPresion[p]);
                                            window.console.log('presionPos ' + presionPos + '\npresionInv ' + presionInv);
                                            doQuery(transaction, 'INSERT INTO presionIndividual(playerA, playerB, Ronda, Nivel, Presion) VALUES (?, ?, ?, ?, ?)', [prA.UserId, prB.UserId, rondaNumber, nivelPresion, presionPos], nullHandler);
                                            doQuery(transaction, 'INSERT INTO presionIndividual(playerA, playerB, Ronda, Nivel, Presion) VALUES (?, ?, ?, ?, ?)', [prB.UserId, prA.UserId, rondaNumber, nivelPresion, presionInv], nullHandler);
                                        }
                                    }
                                };
                                var checkEdit = window.sessionStorage.getItem("edit");
                                window.console.log('Edit?', checkEdit);
                                if (checkEdit) {
                                    window.console.log('\nEdit completo!\n');
                                    window.sessionStorage.setItem("Ronda", 2);
                                    window.sessionStorage.removeItem("edit");
                                    var temp = window.sessionStorage.getItem("Hoyos");
                                    window.console.log('Hoyos', temp);
                                    if (temp == 10) {
                                        window.sessionStorage.setItem("Hoyos", 1);
                                        presionParejas();
                                        presionIndividual();
                                    } else {
                                        window.sessionStorage.setItem("Hoyos", 10);
                                        presionParejas();
                                        presionIndividual();
                                    }
                                } else {
                                    $('#disNext').removeClass('ui-state-disabled');
                                    var playing = window.sessionStorage.getItem('Start');
                                    var saldo = window.sessionStorage.getItem("Saldos");
                                    if (playing == 2 || saldo == 'true') {
                                        saldoTotal();
                                        $("body").pagecontainer("change", "#saldoApuestas");
                                    } else if (playing == 3) {
                                        $("body").pagecontainer("change", "#page16");
                                    }
                                    window.sessionStorage.setItem('menu', false);
                                }
                            }
                        });
                    });
                }
            });
    }, errorHandler, nullHandler);
}

function guardarApuestas() {
    db.transaction(function(transaction) {
        doQuery(transaction, 'SELECT * FROM slidingChange', [], function(transaction, result) {
            var arraySliders = [];
            for (var i = 0; i < result.rows.length; i++) {
                arraySliders.push(result.rows.item(i));
            };
            doQuery(transaction, 'SELECT * FROM BancoApuestasI', [],
                function(transaction, results) {
                    for (var j = 0; j < results.rows.length; j++) {
                        var count = 0;
                        while (count < arraySliders.length) {
                            var row = arraySliders[count];
                            if (row.A == results.rows.item(j).playerA) {
                                if (row.B == results.rows.item(j).playerB) {
                                    window.console.log('Apuesta ' + row.A + ' VS ' + row.B + ' existe en bandoApuestasI!');
                                    doQuery(transaction, 'UPDATE BancoApuestasI SET ventaja = ? WHERE playerA = ? AND playerB = ?', [row.sliding, row.A, row.B], nullHandler);
                                }
                            }
                            count++;
                        }
                    }
                });
        });
    }, errorHandler, nullHandler);
}

function ajustarScoreI(rondaNumber, ventaja, campo, index, score) {
    var ajuste = ventaja;
    console.log('Ventaja en tee', index);
    window.console.log(campo[index].arrayVentaja);
    var arrayVentajasort = campo[index].arrayVentaja.slice();
    arrayVentajasort.sort(function(a, b) {
        return a - b
    });
    window.console.log(arrayVentajasort);
    window.console.log('\n');
    if (rondaNumber == 1) {
        ajuste = Math.ceil(ajuste / 2);
    } else {
        ajuste = Math.floor(ajuste / 2);
    }
    window.console.log('ventaja de ' + ajuste);
    var step = ajuste;
    //ventajaStep = ajuste;
    var vIndex = 0,
        sIndex = 0;
    while (ajuste > 0) {
        if (vIndex >= 9) {
            vIndex = 0;
        }
        sIndex = campo[index].arrayVentaja.indexOf(arrayVentajasort[vIndex++]);
        score[sIndex] = score[sIndex] - 1;
        if (score[sIndex] < 0) {
            score[sIndex] = 0;
        }
        ajuste--;
    }
    return step;
}
