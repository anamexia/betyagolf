var db, dbold;
var shortName = 'BetyaGolfDB';
var version = '1.0';
var displayName = 'BetyaGolfDB';
var maxSize = 65535;
var config;
requirejs(["config"], function (e) {
    config = e;
});
/*---------- HANDLERS ----------*/
$(function() { $("#logPanelD").enhanceWithin(); });
$.support.cors = true;

function errorHandler(transaction, error) {
    console.log(transaction, error);
    if (error) alert('Error: ' + error.message + '\ncode: ' + error.code);
    else alert('Error: ' + transaction.message + '\ncode: ' + transaction.code);
}

function successCallBack() {}

function nullHandler() {};

function restartApp() {
    vex.dialog.confirm({
        message: '<div style="font-size:large;text-align: center;border-bottom: 1px solid #203744;"><b>REINICIAR</b></div><p style="font-size:medium;">Deseas crear un juego nuevo?</p><br>',
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
            if (value) borrarJuegoActivo(true);
        }
    });
}

function onBodyLoad() {

    /*document.addEventListener("deviceready", onDeviceReady, false);
    if (!window.openDatabase) {
        alert('Databases are not supported in this browser.');
        return;
    }*/
    console.log('Load', config);
    initializeLoginSync();

    if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
        document.addEventListener("deviceready", onDeviceReady, false);
    } else {
        initializeDB();
        initializeMixPanel();
        setTimeout(swipeLogo, 1000);
    }

    $(function() { FastClick.attach(document.body); });

    panelInitialize();

    document.addEventListener("backbutton", function() {
        if ($('body').find('.vex.vex-theme-plain').length != 0) {
            vex.close();
        } else {
            if ($('.ui-page-active').find('[data-role="header"]').find('a.ui-btn-left').length != 0)
                $('.ui-page-active').find('[data-role="header"]').find('a.ui-btn-left').trigger('click');
            else
                navigator.notification.confirm(
                    'Estas seguro que quieres salir?',
                    onConfirmQuit,
                    'Exit',
                    'Si, No');
        }


        function onConfirmQuit(button) {
            if (button == "1") {
                navigator.app.exitApp();
            }
        }
    });

    checkSubmit();
    /* ListDBValues();
    ListDBHandicap(); */
    //$('#selectCampo').selectmenu("refresh");
}

function initializeDB() {
    if (typeof window.sqlitePlugin === "object") {
        //alert("sqlite");
        db = window.sqlitePlugin.openDatabase({ name: 'byg.db', iosDatabaseLocation: 'default' });
        //dbold = window.openDatabase(shortName, version, displayName, maxSize);
    } else {
        //alert("websql");
        db = window.openDatabase(shortName, version, displayName, maxSize);
    }
    db.transaction(function(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS User(UserId INTEGER NOT NULL PRIMARY KEY, FirstName TEXT NOT NULL, LastName TEXT NOT NULL,Handicap INTEGER NOT NULL, Indice INTEGER NOT NULL)', [], nullHandler, errorHandler);
        tx.executeSql('CREATE TABLE IF NOT EXISTS Banco(bancoId INTEGER NOT NULL PRIMARY KEY, UserId INTEGER NOT NULL, Puntuacion INTEGER NOT NULL, Diferencial INTEGER NOT NULL, Fecha DATE)', [], nullHandler, errorHandler);
        //tx.executeSql('DROP TABLE IF EXISTS BancoApuestasI');
        tx.executeSql('CREATE TABLE IF NOT EXISTS BancoApuestasI(bancoApInId INTEGER NOT NULL PRIMARY KEY, playerA INTEGER NOT NULL, playerB INTEGER NOT NULL, sliding TEXT NOT NULL, playerS INTEGER NOT NULL, ventaja INTEGER NOT NULL, rondaA INTEGER NOT NULL, rondaB INTEGER NOT NULL, match INTEGER NOT NULL, casado TEXT DEFAULT ' + "NO" + ', carry TEXT DEFAULT ' + "NO" + ')', [], nullHandler, errorHandler);
        tx.executeSql('SELECT bancoApInId FROM BancoApuestasI WHERE playerA > playerB', [], function(transaction, result) {
            for (var i = 0; i < result.rows.length; i++) {
                var idier = result.rows.item(i).bancoApInId
                console.log(idier);
                transaction.executeSql('DELETE FROM BancoApuestasI WHERE bancoApInId = ?', [idier], nullHandler, errorHandler);
            };
        }, errorHandler);

        tx.executeSql('UPDATE BancoApuestasI SET carry = ?', ['NO']);
        tx.executeSql('CREATE TABLE IF NOT EXISTS Campos(campoId INTEGER NOT NULL PRIMARY KEY, name TEXT NOT NULL, sbsId INTEGER NOT NULL)', [], nullHandler, errorHandler);
        tx.executeSql('CREATE TABLE IF NOT EXISTS CampoTee(idTee INTEGER NOT NULL PRIMARY KEY, idCampo INTEGER NOT NULL, color TEXT NOT NULL, active INTEGER NOT NULL, rating INTEGER NOT NULL, slope INTEGER NOT NULL)', [], nullHandler, errorHandler);
        tx.executeSql('CREATE TABLE IF NOT EXISTS CampoPar(CampoParId INTEGER NOT NULL PRIMARY KEY, teeId INTEGER NOT NULL, Hoyo INTEGER NOT NULL, Par INTEGER NOT NULL, Ventaja INTEGER NOT NULL)', [], nullHandler, errorHandler);
        tx.executeSql('SELECT * FROM Campos', [],
            function(transaction, result) {
                if (result.rows.length < 1) {
                    mainTour.start();
                    $(document).one('pageshow', '#page2', function() {
                        mainTour.show('addCampo');
                    });

                    $(document).one('pageshow', '#campos', function() {
                        mainTour.show('geoCampo');
                    });
                }
            }, errorHandler);
        tx.executeSql('CREATE TABLE IF NOT EXISTS restoreGame(restoreId INTEGER NOT NULL PRIMARY KEY, ronda INTEGER NOT NULL, hoyoInicio INTEGER NOT NULL, fecha DATE)', [], nullHandler, errorHandler);
        $('#page1').find('.ui-content, .ui-footer').addClass('faded-in');
    }, errorHandler, /*successCallBack*/ function() {
        //setTimeout(function(){restaurarJuego();}, 1500);
        //storeRegister();
        //exportToNewDB();
    });
}

/*function exportToNewDB() {
    dbold.transaction(function(tx) {
        tx.executeSql("SELECT count(name) FROM sqlite_master WHERE type=?", ['table'], function(tx, result) {
            console.log('Count tables!', result.rows.item(0)['count(name)']);
            alert(result.rows.item(0)['count(name)']);
            if (result.rows.item(0)['count(name)'] > 1) {
                cordova.plugins.sqlitePorter.exportDbToSql(dbold, {
                    successFn: function(sql, count) {
                        cordova.plugins.sqlitePorter.importSqlToDb(db, sql, {
                            successFn: function() {
                                alert('Import Complete');
                            }
                        });
                    }
                });
            }
        }, nullHandler);
    }, errorHandler, nullHandler);
}*/

function swipeLogo() {
    if (betyaCheck()) {
        checkTemporal();
        $('.mainView').velocity("fadeOut", { duration: 300, delay: 600 });
    } else {
        var vHeight = $(window).outerHeight();
        vHeight = ((vHeight / 2) - 25) - (vHeight * .05);
        console.log(vHeight);
        $('.mainImage').velocity({ translateY: vHeight + "px" }, {
            delay: 600,
            complete: function(elements) { $('.mainView').velocity("fadeOut", { duration: 300 }); }
        });
    }
    restaurarJuego();
}

//Cambios necesarios, cambiar Floatheader aqui para que se transforme cada que se hace pequeño
function onDeviceReady() {
    initializeDB();
    var devicePlatform = device.platform;
    if (devicePlatform == 'iOS') {
        //hockeyapp.start(null, null, "5ef1e6ed29174908a54660464842dd5a");
        $('#tbHoyos').attr('winAlt', $(window).outerHeight());
        touchPanel();
        touchPanel();
        //cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        window.addEventListener('native.keyboardshow', keyboardShowHandler);
        window.addEventListener('native.keyboardhide', keyboardHideHandler);
    }
    else{
        //hockeyapp.start(null, null, "241037b783d746c58d6dd48dbf136a33");
    }
    storeRegister();
    //window.mixpanelanalytics.setUp("e9d1408ec8a4b7656c16e4717af5c23e");
    //initializeMixPanel();
    swipeLogo();

    function keyboardShowHandler(e) {
        var idPage = $('.ui-page-active').attr('id');
        if (idPage == 'page11') {
            cordova.plugins.Keyboard.disableScroll(true);
            /*setTimeout(function(){
                cordova.plugins.Keyboard.disableScroll(false);
            },1000);*/
            /*$('#tbHoyos').css({
                height: 'calc('+$('#tbHoyos').css('height')+' - '+e.keyboardHeight+'px)',
                overflow: 'auto'
            });*/
            if (!$('#tbHoyos').attr('altH')) $('#tbHoyos').attr('altH', $('#tbHoyos').css('height'));
            var bottom = $('#tbHoyos').position().top + $('#tbHoyos').outerHeight(true);
            var ven = $('#tbHoyos').attr('winAlt');
            var teclado = /*e.keyboardHeight*/ 250;
            console.log('on', bottom, ven);
            var diff = ven - bottom;
            console.log(diff, teclado);
            if (diff < teclado) {
                teclado -= diff;
                teclado += 10;
                $('#tbHoyos').css({
                    height: 'calc(' + $('#tbHoyos').attr('altH') + ' - ' + teclado + 'px)',
                    'overflow-y': 'auto'
                });
                /*$('#tbHoyos').perfectScrollbar();
                $('.ps-scrollbar-y-rail').css('display', 'none');*/
                $('#tarJug').parent('.fht-tbody').css({
                    'overflow-y': 'auto'
                });
                $('#tarJug').css({
                    'overflow-y': 'auto'
                });
                $('#tbHoyos').find('.fht-table-wrapper .fht-default, .fht-fixed-body').css({
                    'overflow-y': 'auto'
                });
            }
            $table.floatThead('reflow');
        };
    }


    function keyboardHideHandler(e) {
        var idPage = $('.ui-page-active').attr('id');
        if (idPage == 'page11') {
            setTimeout(function() {
                if (!cordova.plugins.Keyboard.isVisible) {
                    cordova.plugins.Keyboard.disableScroll(false);
                    $('#tbHoyos').css({
                        height: /*$('#tbHoyos').attr('altH')*/ ''
                    });
                };
            }, 1000);
        };
    }

    /*
$('#page11').on('native.keyboardshow', function(e) {
        /*$('#page11').css({
            'min-heigth': '0px',
            height: 'calc(100% - '+e.keyboardHeight+')'
        });
        //e.keyboardHeight
        alert('Show')
        cordova.plugins.Keyboard.disableScroll(true);
    });

    $('#page11').on('native.keyboardhide', function(event) {
        cordova.plugins.Keyboard.disableScroll(false);
    });
    */
    //cordova.plugins.Keyboard.disableScroll(true);
    getAppVersion(function(version) {
        $('#dispVersion').html('v' + version);
    });

    setTimeout(function() { navigator.splashscreen.hide(); }, 100);

    document.addEventListener("resume", function() {
        /*var start = window.localStorage.getItem("test");
        var end = new Date().getTime();
        var time = end - start;
        alert(start.toDateString()+'\nTime elapsed: '+time);*/
    }, false);
    document.addEventListener("pause", function() {
        /*var daty = new Date().getTime();
        //window.console.log('Fecha '+daty.toDateString()+' Hora '+daty.toTimeString());
        window.localStorage.setItem("test",daty);*/
    }, false);
}

/*---------- FIN HANDLERS ----------*/

/*---------- EXTRAS ----------*/

/*El espacio de EXTRAS es un area para funciones de prueba para cosas nuevas.*/

function vexy() {
    /*vex.dialog.buttons.YES.text = 'Continuar';
    vex.dialog.buttons.NO.text = 'Regresar';*/
    var dialog;
    dialog = vex.dialog.confirm({
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
            value ? vex.dialog.alert('Success!') : vex.dialog.alert('Curses!');
        }
    });

    var text = dialog.find('.vex-dialog-message p').html();
    console.log(text);
    setTimeout(function() {
        dialog.find('.vex-dialog-message p').html('This Thingy');
    }, 2000);
}

function onTeclado() {
    if (!$('#tbHoyos').attr('altH')) $('#tbHoyos').attr('altH', $('#tbHoyos').css('height'));
    var bottom = $('#tbHoyos').position().top + $('#tbHoyos').outerHeight(true);
    var ven = $(window).outerHeight();
    var teclado = 300;
    console.log('on', bottom, ven);
    var diff = ven - bottom;
    console.log(diff, teclado);
    if (diff < teclado) {
        teclado -= diff;
        teclado += 10;
        $('#tbHoyos').css({
            height: 'calc(' + $('#tbHoyos').attr('altH') + ' - ' + teclado + 'px)',
            overflow: 'auto'
        });
    }
}

function offTeclado() {
    console.log('off', $('#tbHoyos').attr('altH'));
    $('#tbHoyos').css({
        height: $('#tbHoyos').attr('altH')
    });
}

/*---------- FIN EXTRAS ----------*/

/*ListDBValues manda a llamar a la tabla User que es la que guarda la informacion general de cada jugador existente. Despliega el nombre del usuario junto con dos checkboxes para decir que juega y si se va temprano, al final hay td adicional que maneja el editar dicho jugador.*/
function ListDBValues() {
    db.transaction(function(transaction) {
        transaction.executeSql('SELECT * FROM User', [],
            function(transaction, result) {
                if (result != null && result.rows != null) {
                    if (result.rows.length >= 1) { $('#lbUsers tbody').html(''); }
                    for (var i = 0; i < result.rows.length; i++) {
                        var row = result.rows.item(i);
                        $('#lbUsers tbody').append('<tr id="' + row.UserId + '" name="dbUsers"><td>' + row.FirstName + ' ' + row.LastName + '</td><td><input id="uJuega' + row.UserId + '" name="cJugaran" value=' + row.UserId + ' type="checkbox" data-role="none" class="BYGcheckbox"><label for="uJuega' + row.UserId + '"></label></td><td><input id="uEarly' + row.UserId + '" name="cEarly" value=' + row.UserId + ' type="checkbox" data-role="none" class="BYGcheckbox"><label for="uEarly' + row.UserId + '"></label></td><td data-transition="slide" onClick="editUsr(' + row.UserId + ')"></td></tr>');
                    }
                    $("#lbUsers").trigger("create");
                }
            }, nullHandler, errorHandler);
    }, errorHandler, nullHandler);
    return;
}

/*editUsr recibe un id de jugador y llena la pagina de ajustes de jugador con la informacion de dicho usuario. cambia elementos de la pagina para que esta tenga boton de borrar jugador y la funcion del boton CONTINUAR que en vez de agregar un jugador, lo edita.*/
function editUsr(id) {
    window.console.log(id);
    $("#aJug").attr('onClick', 'editarJugador(' + id + ')');
    $("#nJug").addClass('hidden');
    $("#delJug").removeClass('hidden').attr('onClick', 'editDelete(' + id + ')');
    $.mobile.defaultPageTransition = "slide";
    db.transaction(function(transaction) {
        transaction.executeSql('SELECT * FROM User', [],
            function(transaction, result) {
                for (var i = 0; i < result.rows.length; i++) {
                    var row = result.rows.item(i);
                    if (row.UserId == id) {
                        $('#txFirstName').val(row.FirstName);
                        $('#txLastName').val(row.LastName);
                        $('#txHandicap').val(row.Handicap);
                        $("#uJuega" + id).is(":checked") ? $("#edJuega").prop('checked', true) : $("#edJuega").prop('checked', false);
                        $("#uEarly" + id).is(":checked") ? $("#edEarly").prop('checked', true) : $("#edEarly").prop('checked', false);
                        //window.location.href = "#page3";
                        $("body").pagecontainer("change", "#page3");
                    }
                }
            }, errorHandler);
    }, errorHandler, nullHandler);
}

/*ClearFieldsNJ se usa para reiniciar los campos de la pagina de ajustes de jugador.*/
function ClearFieldsNJ() {
    $('#txFirstName').val('');
    $('#txLastName').val('');
    $('#txHandicap').val('');
    $('#txFirstName').next().addClass('ui-input-clear-hidden');
    $('#txLastName').next().addClass('ui-input-clear-hidden');
    $('#txHandicap').next().addClass('ui-input-clear-hidden');
    $("#edJuega").prop('checked', false);
    $("#edEarly").prop('checked', false);
}

/*editBack se manda a llamar en el boton de REGRESAR en ajustes de jugador. Este regresa a su version default la pagina de ajustes de jugador (agregar jugador en vez de editar).*/
function editBack() {
    $("#aJug").attr('onClick', 'AddValueToDB()');
    $("#nJug").removeClass('hidden');
    $("#delJug").addClass('hidden');
    $.mobile.defaultPageTransition = "fade";
}

function AddValueToDB(btnId) {
    db.transaction(function(transaction) {
        if ($('#txFirstName').val() == '') {
            alert('Ponga un Nombre');
            return;
        }
        if ($('#txLastName').val() == '') {
            alert('Ponga un Apellido');
            return;
        }
        if ($('#txHandicap').val() == '') {
            alert('Handicap Invalido! Rango de 0 - 36');
            return;
        }
        if ($('#txHandicap').val() < 0 || $('#txHandicap').val() > 36) {
            alert('Handicap Invalido! Rango de 0 - 36');
            return;
        }
        alertify.log("Se agrego a " + $('#txFirstName').val() + " " + $('#txLastName').val() + " al juego.", "", 2000);
        transaction.executeSql('INSERT INTO User(FirstName, LastName, Handicap, Indice) VALUES (?,?,?,?)', [$('#txFirstName').val(), $('#txLastName').val(), $('#txHandicap').val(), 0], nullHandler, errorHandler);

        transaction.executeSql('SELECT * FROM User', [],
            function(transaction, result) {
                for (var i = 0; i < result.rows.length; i++) {
                    var row = result.rows.item(i);
                    if (row.FirstName == $('#txFirstName').val() && row.LastName == $('#txLastName').val()) {
                        var checkJuega = $("#edJuega").is(":checked") ? 'checked="checked"' : '';
                        var checkEarly = $("#edEarly").is(":checked") ? 'checked="checked"' : '';
                        $('#lbUsers tbody').append('<tr id="' + row.UserId + '" name="dbUsers"><td>' + row.FirstName + ' ' + row.LastName + '</td><td><input id="uJuega' + row.UserId + '" name="cJugaran" value=' + row.UserId + ' type="checkbox" data-role="none" class="BYGcheckbox" ' + checkJuega + '><label for="uJuega' + row.UserId + '"></label></td><td><input id="uEarly' + row.UserId + '" name="cEarly" value=' + row.UserId + ' type="checkbox" data-role="none" class="BYGcheckbox"><label for="uEarly' + row.UserId + '" ' + checkEarly + '></label></td><td onClick="editUsr(' + row.UserId + ')"></td></tr>');
                        $("#lbUsers").trigger("create");
                        ClearFieldsNJ();
                        console.log(btnId);
                        btnId == 'nJug' ? 0 : $("body").pagecontainer("change", "#page5");
                    }
                }
            }, errorHandler);
    });
}

function editDelete(id) {
    db.transaction(function(transaction) {
        transaction.executeSql('SELECT * FROM User WHERE UserId = ?', [id],
            function(transaction, result) {
                var row = result.rows.item(0);
                var name = row.FirstName + ' ' + row.LastName;;
                vex.dialog.confirm({
                    message: '<div style="font-size:large;text-align: center;border-bottom: 1px solid #203744;"><b>JUGADORES</b></div><p style="font-size:medium;">Estas seguro que deseas borrar a<br>' + name + '?</p>',
                    buttons: [
                        $.extend({}, vex.dialog.buttons.YES, {
                            className: 'redButton',
                            text: 'BORRAR',
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
                            window.console.log('Borra id ' + id);
                            $('#lbUsers tbody').find('#' + id + '[name="dbUsers"]').remove().trigger('create');
                            deleteUser(id);
                            $("body").pagecontainer("change", "#page5");
                            ClearFieldsNJ();
                            editBack();
                        }
                    }
                });
            }, errorHandler);
    }, errorHandler, nullHandler);
}

function deleteUser(id) {
    db.transaction(function(transaction) {
        transaction.executeSql('DELETE FROM User WHERE UserId = ? ', [id], nullHandler, errorHandler);
        transaction.executeSql('DELETE FROM Banco WHERE UserId = ? ', [id], nullHandler, errorHandler);
        transaction.executeSql('DELETE FROM BancoApuestasI WHERE playerA = ? OR playerB = ?', [id, id], nullHandler, errorHandler);
    }, errorHandler, nullHandler);
}

function editarJugador(id) {
    db.transaction(function(transaction) {
        if ($('#txFirstName').val() == '') {
            alert('Ponga un Nombre');
            return;
        }
        if ($('#txLastName').val() == '') {
            alert('Ponga un Apellido');
            return;
        }
        if ($('#txHandicap').val() == '') {
            alert('Handicap Invalido! Rango de 0 - 36');
            return;
        }
        if ($('#txHandicap').val() < 0 || $('#txHandicap').val() > 36) {
            alert('Handicap Invalido! Rango de 0 - 36');
            return;
        }
        $("#edJuega").is(":checked") ? $("#uJuega" + id).prop('checked', true) : $("#uJuega" + id).prop('checked', false);
        $("#edEarly").is(":checked") ? $("#uEarly" + id).prop('checked', true) : $("#uEarly" + id).prop('checked', false);
        alertify.log("Se actualizo a " + $('#txFirstName').val() + " " + $('#txLastName').val() + ".", "", 2000);
        transaction.executeSql('UPDATE User SET FirstName = ?, LastName = ?, Handicap = ? Where UserId= ?', [$('#txFirstName').val(), $('#txLastName').val(), $('#txHandicap').val(), id]);
        $('#lbUsers tbody').find('#' + id + '[name="dbUsers"] > td:first-child').html($('#txFirstName').val() + ' ' + $('#txLastName').val());
        $("body").pagecontainer("change", "#page5");
        ClearFieldsNJ();
        editBack();
    }, errorHandler, nullHandler);
}

function JugadoresActivos() {
    var activos = $("input[name='cJugaran'][type='checkbox']:checked");
    db.transaction(function(transaction) {
        transaction.executeSql('DROP TABLE IF EXISTS jugadores');
        transaction.executeSql('CREATE TABLE IF NOT EXISTS jugadores(UserId INTEGER NOT NULL PRIMARY KEY, FirstName TEXT NOT NULL, LastName TEXT NOT NULL, Handicap INTEGER NOT NULL, Indice INTEGER NOT NULL, Early TEXT NOT NULL, tStart INTEGER NOT NULL)', [], nullHandler, errorHandler);
        if (activos.length > 1) {
            transaction.executeSql('SELECT idTee FROM CampoTee WHERE active = 1', [], function(transaction, results) {
                var teeStart = results.rows.item(0).idTee;
                console.log(teeStart);
                transaction.executeSql('SELECT * FROM User', [], function(transaction, result) {
                    activos.each(function() {
                        for (var i = 0; i < result.rows.length; i++) {
                            var row = result.rows.item(i);
                            if ($(this).val() == row.UserId) {
                                var early = "NO";
                                if ($('#uEarly' + $(this).val()).is(':checked')) {
                                    window.console.log('early yes!');
                                    early = "YES";
                                }
                                transaction.executeSql('INSERT INTO jugadores (UserId,FirstName,LastName,Handicap,Indice,Early,tStart) VALUES (?,?,?,?,?,?,?)', [row.UserId, row.FirstName, row.LastName, row.Handicap, row.Indice, early, teeStart], nullHandler, errorHandler);
                            }
                        };
                    });
                    window.sessionStorage.setItem("numJum", activos.length);
                    HandiCampo();
                    ListDBJugadores();
                    $.mobile.defaultPageTransition = "fade";
                    $("body").pagecontainer("change", "#page14");
                }, errorHandler);
            }, errorHandler);
        } else {
            vex.dialog.alert('No hay suficientes jugadores seleccionados');
            return;
        }
    }, errorHandler, nullHandler);
}

function HandiCampo() {
    db.transaction(function(transaction) {
        var slope = 0;
        transaction.executeSql('SELECT * FROM CampoTee WHERE active = 1', [], function(transaction, result) {
            if (result != null && result.rows != null) {
                slope = result.rows.item(0).slope;
            }
        }, errorHandler);
        transaction.executeSql('SELECT * FROM jugadores', [], function(transaction, result) {
            if (result != null && result.rows != null) {
                for (i = 0; i < result.rows.length; i++) {
                    var row = result.rows.item(i);
                    var handicap = row.Handicap;
                    if (handicap == 0) {
                        window.console.log('Indice ' + row.Indice);
                        handicap = Math.round((row.Indice * slope) / 113);
                        window.console.log('Handicap despues de calcular ' + handicap);
                        transaction.executeSql('UPDATE jugadores SET Handicap = ? Where UserId= ?', [handicap, row.UserId]);
                    } else { window.console.log('No hubo cambio de handicap'); }
                }
            }
        }, errorHandler);
    }, errorHandler, nullHandler);
}

/*function checkEdits() {
    $("#edUsr input[type='number']").keypress(function(e) {
        if (e.which < 48 || e.which > 57){
        e.preventDefault();
        }
    });

    $("input[name='hand']").on('input', function(e) {
        if($(this).val().length > 2){
            var value = $(this).val();
            value = value.slice(0,2);
            $(this).val(value);
        }
        if ($(this).val()>36){
            $(this).val(36);
        }
    });
}*/

function ListDBIndices() {
    $('#lbIndice tbody').html('');
    db.transaction(function(transaction) {
        transaction.executeSql('SELECT * FROM User', [],
            function(transaction, result) {
                if (result != null && result.rows != null) {
                    for (var i = 0; i < result.rows.length; i++) {
                        var row = result.rows.item(i);
                        $('#lbIndice tbody').append('<tr><td>' + row.FirstName + ' ' + row.LastName + '</td><td>' + row.Indice + '</td></tr>');
                    }
                }
            }, errorHandler);
    }, errorHandler, nullHandler);
    return;
}

function ListDBJugadores() {
    $('#dbActivos tbody').html('');
    db.transaction(function(transaction) {
        //'SELECT C.* FROM CampoTee AS C LEFT OUTER JOIN CampoTee AS AC ON AC.active = 1'
        transaction.executeSql('SELECT * FROM CampoTee WHERE idCampo = (SELECT idCampo FROM CampoTee WHERE active = 1)', [], function(transaction, results) {
            //console.log(results);
            var options = '';
            for (var i = 0; i < results.rows.length; i++) {
                var el = results.rows.item(i);
                if (el.active == 1) options = '<option value="' + el.idTee + '">' + el.color.charAt(0).toUpperCase() + el.color.slice(1) + '</option>' + options;
                else options += '<option value="' + el.idTee + '">' + el.color.charAt(0).toUpperCase() + el.color.slice(1) + '</option>';
            };
            console.log(options);
            transaction.executeSql('SELECT * FROM jugadores', [],
                function(transaction, result) {
                    var checkSalidas = window.localStorage.getItem("salidasPro") == "true" ? true : false;
                    var disableIt = '';
                    if (!checkSalidas) disableIt = 'byg-disabled';
                    for (var i = 0; i < result.rows.length; i++) {
                        var row = result.rows.item(i);
                        $('#dbActivos tbody').append('<tr id="tbActive' + row.UserId + '" name="dbActive" user="' + row.UserId + '"><td>' + row.FirstName + ' ' + row.LastName + '</td><td><input name="txActive" type="number" placeholder="' + row.Handicap + '"></td><td><div class=".salidaDisabler"></div><select data-mini="true" class="salidasSelect ' + disableIt + '">' + options + '</select></td></tr>');
                    }
                    $('#dbActivos tbody').trigger('create');
                    if (!checkSalidas)
                        $('select.salidasSelect').parent().on('touchstart mousedown', function(event) {
                            buySalidas();
                        });
                    $("input[name='txActive']").keypress(function(e) {
                        if (e.which < 48 || e.which > 57) {
                            e.preventDefault();
                        }
                    });
                }, errorHandler);
        }, errorHandler);
    }, errorHandler, nullHandler);
    return;
}

function buySalidas() {
    vex.dialog.confirm({
        message: '<div style="font-size:large;text-align: center;border-bottom: 1px solid #203744;"><b>Salidas Pro</b></div><p style="font-size:medium;">Para poder escoger tee de salida por persona necesitas tener Salidas Pro. ¿Deseas comprarlo?</p><br>',
        buttons: [$.extend({}, vex.dialog.buttons.YES, {
            className: "okButton",
            text: "CONTINUAR",
            click: function(e, t) {
                e.data().vex.value = !0, vex.close(e.data().vex.id)
            }
        }), $.extend({}, vex.dialog.buttons.NO, {
            className: "simpleCancel",
            text: "Regresar",
            click: function(e, t) {
                vex.close(e.data().vex.id)
            }
        })],
        callback: function(e) {
            window.console.log("Choice", e ? "Continue" : "Cancel"), e && show("bygSalidas")
        }
    })
}

function ChangeHandicap() {
    var chHandicap = $("tr[name='dbActive']");
    //var chHandicap = $("input[name='txActive']");
    //var check = $("#selectIndividual").val();
    db.transaction(function(tx) {
        if (chHandicap.length > 0) {
            chHandicap.each(function() {
                var idUsr = $(this).attr('user');
                var inputHcp = $(this).find('input[name="txActive"]');
                if (inputHcp.val() != '') {
                    console.log('input', inputHcp.val());
                    if (inputHcp.val() >= 0 && inputHcp.val() <= 36) {
                        inputHcp.attr('placeholder', inputHcp.val());
                        //$('#tbActive'+idUsr).find('p').html($(this).val());
                        tx.executeSql('UPDATE jugadores SET Handicap = ? Where UserId= ?', [inputHcp.val(), idUsr]);
                        tx.executeSql('UPDATE User SET Handicap = ? Where UserId= ?', [inputHcp.val(), idUsr]);
                    }
                    inputHcp.val('');
                }
                var selectTee = $(this).find('select');
                console.log('select', selectTee.val());
                tx.executeSql('UPDATE jugadores SET tStart = ? Where UserId= ?', [selectTee.val(), idUsr]);
            });
        }
        //cancelEditActive();
    }, errorHandler, nullHandler);
}

function DiferIndice() {
    db.transaction(function(transaction) {
        var IdActive = 0;
        var slopeC;
        var ratingC;
        transaction.executeSql('SELECT * FROM CampoTee WHERE active = 1', [], function(transaction, result) {
            if (result != null && result.rows != null) {
                for (var i = 0; i < result.rows.length; i++) {
                    slopeC = result.rows.item(i).slope;
                    ratingC = result.rows.item(i).rating;
                    IdActive = result.rows.item(i).idTee;
                    window.console.log('Id ' + IdActive + ' Slope ' + slopeC + ' Rating ' + ratingC);
                }
            }
            if ((slopeC == 'undefined') || (ratingC == 'undefined')) {
                borrarJuegoActivo(true);
                return;
            } else {
                var arrayPars = [];
                transaction.executeSql('SELECT * FROM CampoPar WHERE teeId = ? ORDER BY Hoyo ASC', [IdActive],
                    function(transaction, result) {
                        if (result != null && result.rows != null) {
                            for (var i = 0; i < result.rows.length; i++) {
                                var row = result.rows.item(i);
                                arrayPars.push(row.Par);
                            }
                            window.console.log('Array Pars ' + arrayPars);
                        }
                    }, errorHandler);

                transaction.executeSql('SELECT * FROM jugadores', [],
                    function(transaction, result) {
                        if (result != null && result.rows != null) {
                            var arrayIDs = [];
                            var arrayHandicaps = [];
                            var allIn = result.rows.length;
                            for (var i = 0; i < result.rows.length; i++) {
                                var row = result.rows.item(i);
                                if (row.Early != 'YES') {
                                    arrayIDs.push(result.rows.item(i).UserId);
                                    arrayHandicaps.push(result.rows.item(i).Handicap);
                                    window.console.log(arrayIDs);
                                    var county = 0;
                                    transaction.executeSql('SELECT * FROM Scores WHERE IdJugador = ? ORDER BY Hoyo ASC', [row.UserId],
                                        function(transaction, result) {
                                            var ajusteSum = 0;
                                            var playerId = arrayIDs[county];
                                            var handicap = arrayHandicaps[county];
                                            county++;
                                            window.console.log('my ID is ' + playerId + ' With handicap ' + handicap);
                                            var maxHits = 0;
                                            if (handicap <= 9) {
                                                maxHits = 2;
                                            }
                                            if (handicap >= 10) {
                                                if (handicap <= 19) {
                                                    maxHits = 7;
                                                }
                                            }
                                            if (handicap >= 20) {
                                                if (handicap <= 29) {
                                                    maxHits = 8;
                                                }
                                            }
                                            if (handicap >= 30) {
                                                if (handicap <= 39) {
                                                    maxHits = 9;
                                                }
                                            }
                                            if (handicap >= 40) {
                                                if (handicap <= 49) {
                                                    maxHits = 10;
                                                }
                                            }
                                            window.console.log('maxHits = ' + maxHits);
                                            for (j = 0; j < 18; j++) {
                                                var parHoyo = arrayPars[j];
                                                var hScore = result.rows.item(j).ScoreHoyo;
                                                window.console.log('score de ' + result.rows.item(j).Hoyo + ' es ' + hScore + ' par ' + parHoyo);
                                                if (maxHits == 2) {
                                                    var check = parHoyo + 2;
                                                    if (hScore > check) {
                                                        hScore = check;
                                                    }
                                                } else {
                                                    if (hScore > maxHits) {
                                                        hScore = maxHits;
                                                    }
                                                }
                                                ajusteSum += hScore;
                                                window.console.log('score ' + hScore);
                                                window.console.log('suma ' + ajusteSum);
                                            }
                                            var diferIn = ((ajusteSum - ratingC) * 113) / slopeC;
                                            diferIn = (Math.round(diferIn * 10) / 10);
                                            var d = new Date();
                                            var daty = new Date(d.getTime());
                                            window.console.log('Fecha ' + daty.toDateString() + ' Hora ' + daty.toTimeString());
                                            window.console.log('Insert a banco ' + playerId + ' ' + ajusteSum + ' ' + diferIn + ' ' + d.getTime());
                                            transaction.executeSql('INSERT INTO Banco (UserId, Puntuacion, Diferencial, Fecha) VALUES (?, ?, ?, ?)', [playerId, ajusteSum, diferIn, d.getTime()], nullHandler, errorHandler);
                                            allIn--;
                                            if (allIn == 0) {
                                                window.console.log('allIn LLEGO a 0!');
                                                borrarJuegoActivo(true);
                                                //reloader();
                                            }
                                        }, errorHandler);
                                }
                            }
                        }
                    }, errorHandler);
            }
        }, errorHandler);
    }, errorHandler, nullHandler);
}

function borrarJuegoActivo(endGame) {
    db.transaction(function(transaction) {
        transaction.executeSql('DROP TABLE IF EXISTS jugadores');
        transaction.executeSql('DROP TABLE IF EXISTS equipos');
        transaction.executeSql('DROP TABLE IF EXISTS parejasApuesta');
        transaction.executeSql('DROP TABLE IF EXISTS presionParejas');
        transaction.executeSql('DROP TABLE IF EXISTS stakeIndividual');
        transaction.executeSql('DROP TABLE IF EXISTS stakeParejas');
        transaction.executeSql('DROP TABLE IF EXISTS presionIndividual');
        transaction.executeSql('DROP TABLE IF EXISTS stepIndividual');
        transaction.executeSql('DROP TABLE IF EXISTS stepParejas');
        transaction.executeSql('DROP TABLE IF EXISTS Scores');
        transaction.executeSql('DROP TABLE IF EXISTS slidingChange');
        transaction.executeSql('DELETE FROM restoreGame');
        localStorage.removeItem("Yoyo");
        window.sessionStorage.clear();
        window.console.log('Se borraron las tablas del juego');
        if (endGame) {
            reloader();
        }
    }, errorHandler, nullHandler);
}

function reloader() {
    $("body").pagecontainer("change", "#page1");
    window.location.reload();
}

function deleteBankLimit() {
    db.transaction(function(transaction) {
        transaction.executeSql('SELECT UserId FROM Banco GROUP BY UserId', [], function(transaction, result) {
            for (var i = 0; i < result.rows.length; i++) {
                var row = result.rows.item(i);
                transaction.executeSql('DELETE FROM Banco WHERE UserId = ? AND bancoId NOT IN (SELECT bancoId FROM Banco WHERE UserId = ? ORDER BY Fecha DESC LIMIT 20)', [row.UserId, row.UserId], nullHandler, errorHandler);
            }
            console.log('Se Borraron tarjetas mas viejas');
        }, errorHandler);
    }, errorHandler, nullHandler);
}

function IndiceHandicap() {
    db.transaction(function(transaction) {
        transaction.executeSql('SELECT * FROM User', [],
            function(transaction, result) {
                if (result != null && result.rows != null) {
                    var arrayIDs = [];
                    var arrayNames = [];
                    var arrayHandicaps = [];
                    var allIn = result.rows.length;
                    window.console.log('hay ' + allIn + ' jugadores en banco');
                    var changes = "";
                    for (var i = 0; i < result.rows.length; i++) {
                        var row = result.rows.item(i);
                        arrayIDs.push(result.rows.item(i).UserId);
                        arrayNames.push(result.rows.item(i).FirstName + ' ' + result.rows.item(i).LastName);
                        arrayHandicaps.push(result.rows.item(i).Indice);
                        var county = 0;
                        transaction.executeSql('SELECT * FROM Banco WHERE UserId = ? ORDER BY Diferencial ASC', [row.UserId],
                            function(transaction, results) {
                                if (results != null && results.rows != null) {
                                    var len = results.rows.length;
                                    var sumInd = 0;
                                    var playerId = arrayIDs[county];
                                    var playerName = arrayNames[county];
                                    var handicap = arrayHandicaps[county];
                                    county++;
                                    window.console.log('my ID is ' + playerId + ' Name ' + playerName + ' and my handicap is ' + handicap);
                                    var maxCards = 0;
                                    if (len >= 5) {
                                        if (len <= 6) maxCards = 1;
                                    }
                                    if (len >= 7) {
                                        if (len <= 8) maxCards = 2;
                                    }
                                    if (len >= 9) {
                                        if (len <= 10) maxCards = 3;
                                    }
                                    if (len >= 11) {
                                        if (len <= 12) maxCards = 4;
                                    }
                                    if (len >= 13) {
                                        if (len <= 14) maxCards = 5;
                                    }
                                    if (len >= 15) {
                                        if (len <= 16) maxCards = 6;
                                    }
                                    if (len >= 17) {
                                        if (len <= 20) maxCards = len - 10;
                                    }
                                    if (len > 20) maxCards = 10;
                                    window.console.log('Hay ' + len + ' entradas en el banco por lo que maxCards = ' + maxCards);
                                    if (maxCards > 0) {
                                        var arrayBest = [];
                                        for (j = 0; j < maxCards; j++) {
                                            arrayBest.push(results.rows.item(j).Diferencial);
                                            sumInd += results.rows.item(j).Diferencial;
                                            window.console.log('el diferencial es = ' + results.rows.item(j).Diferencial);
                                        }
                                        window.console.log('arrayBest ' + arrayBest);
                                        window.console.log('sumInd ' + sumInd);
                                        var promedio = sumInd / maxCards;
                                        promedio = (promedio * 0.96);
                                        promedio = (Math.round(promedio * 10) / 10);

                                        if (promedio != handicap) {
                                            changes += playerName + '<br>';
                                            window.console.log('Nuevo handicap ' + promedio + ' para ' + playerName);
                                            transaction.executeSql('UPDATE User SET Indice = ? Where UserId= ?', [promedio, playerId], nullHandler, errorHandler);
                                            //transaction.executeSql('UPDATE User SET Indice = ?, Handicap = ? Where UserId= ?', [promedio, 0, playerId], nullHandler,errorHandler);
                                        }
                                    } else {
                                        window.console.log('no hay suficientes tarjetas! para  ' + playerName);
                                    }
                                    allIn--;
                                    if (allIn == 0) {
                                        //ListDBValues();
                                        deleteBankLimit();
                                        borrarJuegoActivo();
                                        if (changes != "") {
                                            changes = "Hubo cambio de Indice para: " + '<br>' + changes;
                                            vex.dialog.alert(changes);
                                        }
                                        window.console.log('allIn LLEGO a 0!');
                                        //alert('A Jugadores');
                                        //$("body").pagecontainer("change", "#page5");
                                    }
                                }
                            }, errorHandler);
                    }
                }
            }, errorHandler);
    }, errorHandler, nullHandler);
    //ListDBValues();
}

function restaurarJuego() {
    db.transaction(function(transaction) {
        loadCampBlock();
        transaction.executeSql('SELECT * FROM restoreGame', [], function(transaction, result) {
            if (result.rows.length > 0) {
                var row = result.rows.item(result.rows.length - 1);
                var daty = new Date(row.fecha);
                /*var dateGame = new Date(1457473758314);
                dateGame = dateGame.toTimeString()+" "+ pad(dateGame.getDate())+"/"+pad(dateGame.getMonth()+1)+"/"+dateGame.getFullYear();*/
                function pad(n) {
                    return n < 10 ? "0" + n : n;
                }
                var dater = pad(daty.getDate()) + "/" + pad(daty.getMonth() + 1) + "/" + daty.getFullYear();
                if (parseInt(row.fecha) < 1457474416627) {
                    //console.log('OLD GAME', dateGame, '\n',dater);
                    return;
                }
                console.log(dater);

                vex.dialog.confirm({
                    message: '<div style="font-size:large;text-align: center;border-bottom: 1px solid #203744;"><b>RESTAURAR JUEGO</b></div><p style="font-size:medium;text-align:center;">Tienes un juego inconcluso con fecha: ' + dater + '</p><p style="font-size:medium;text-align:center;">¿Deseas continuarlo?</p>',
                    buttons: [
                        $.extend({}, vex.dialog.buttons.YES, {
                            className: 'okButton',
                            text: 'SI',
                            click: function($vexContent, event) {
                                $vexContent.data().vex.value = true;
                                vex.close($vexContent.data().vex.id);
                            }
                        }),
                        $.extend({}, vex.dialog.buttons.NO, {
                            className: 'simpleCancel',
                            text: 'NO',
                            click: function($vexContent, event) {
                                vex.close($vexContent.data().vex.id);
                            }
                        })
                    ],
                    callback: function(value) {
                        window.console.log('Choice', value ? 'Continue' : 'Cancel');
                        if (value) {
                            ListDBJugadores();
                            var comenzar = row.hoyoInicio;
                            window.sessionStorage.setItem("menu", false);
                            if (row.ronda == 2) {
                                window.sessionStorage.setItem("edit", true);
                                window.sessionStorage.setItem("Ronda", 2);
                                comenzar = row.hoyoInicio == 1 ? 10 : 1;
                            };
                            console.log('Juego Comienza en', comenzar);
                            tarjetaActivos(comenzar, true);
                            ListDBTarjeta(true);
                            //$("body").pagecontainer("change", "#page11");
                            $("body").pagecontainer("change", "#page16");
                            $('#disNext').addClass('ui-state-disabled');
                        }
                    }
                });
            }
        }, errorHandler);
    }, errorHandler, nullHandler);
}

function doQuery(tx, query, values, successHandler) {
    //alert('doQuery' +  query);
    var params = [];
    if (values) params = values;
    tx.executeSql(query, params, successHandler, errorHandling);

    function errorHandling(transaction, error) {
        alert('Error : ' + error.message + '\n' + query);
    }
}

// function exportData() {
//     var dbFolderPath = "";
//     if (device.platform == "Android") {
//         dbFolderPath = cordova.file.applicationStorageDirectory + "databases/";
//     } else if (device.platform == "iOS") {
//         dbFolderPath = cordova.file.applicationStorageDirectory + "Library/LocalDatabase/";
//     }
//     alert("Prueba Export");

//     window.resolveLocalFileSystemURL(dbFolderPath, function(dbFolderEntry) {
//         var dbFilePath = dbFolderPath + "byg.db";

//         window.resolveLocalFileSystemURL(dbFilePath, function(dbFileEntry) {
//             alert(dbFileEntry.name);
//             console.log(dbFileEntry);


//             window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
//                 console.log(fileSystem.root.toURL());
//              // dbFileEntry.copyTo(cordova.file.dataDirectory, "copybyg.db", function() {
//              //  alert("Success copy");
//              // }, fileCopyFail);
//             },fileCopyFail);

//         });
//     });
//     /*window.resolveLocalFileSystemURL(basePath, function(fileEntry){
//         window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
//                 var copyToPath = fileSystem.root.toURL()+fileDestPath;
//                 fileEntry.copyTo(copyToPath, 'newFileName.txt', function(){
//                     alert("file copy success");                        
//                     },fileCopyFail);
//             },fileCopyFail);
//     },fileCopyFail);*/

// }

// function fileCopyFail(error) {
//     alert(error);
// }
