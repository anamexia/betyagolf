var campBlock = { "1": {}, "2": {} };

function checkPro() {
    var e = window.localStorage.getItem("betyaPro");
    e = "true" == e ? !0 : !1, e ? dlCampos() : vex.dialog.confirm({
        message: '<div style="font-size:large;text-align: center;border-bottom: 1px solid #203744;"><b>Campos Pro</b></div><p style="font-size:medium;">Para poder tener más de un campo necesitas tener Campos Pro. ¿Deseas comprarlo?</p><br>',
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
            window.console.log("Choice", e ? "Continue" : "Cancel"), e && show("bygPro")
        }
    })
}

function cargarCampos() {
    mainTour.hide(), db.transaction(function(e) {
        e.executeSql("SELECT * FROM Campos", [], function(e, t) {
            for (var a = [], o = 0; o < t.rows.length; o++) a.push(t.rows.item(o));
            e.executeSql("SELECT * FROM CampoTee", [], function(e, t) {
                for (var o = "", n = 0; n < a.length; n++) {
                    for (var l = '<div sbs="' + a[n].sbsId + '" data-role="collapsible" data-iconpos="right"><h2 data-position="inline" style="text-transform: capitalize">' + a[n].name + '<span style="float:right;" class="button-span"><a href="#" data-role="button" data-inline="true" data-icon="gear" data-iconpos="notext" sbs="' + a[n].campoId + '" class="splitButton"></a></span></h2><ul data-role="listview" data-theme="b">', i = 0; i < t.rows.length; i++) {
                        var r = t.rows.item(i);
                        r.idCampo == a[n].campoId && (l += '<li><a campoAct="' + r.idTee + '">' + r.color.charAt(0).toUpperCase() + r.color.slice(1) + "</a></li>")
                    }
                    o += l + "</ul></div>"
                }
                $("#campList").html(o).trigger("create"), $("#campList").off("click"), $("#campList").on("click", function(e, t) {
                    var a = $(e.target).attr("campoAct");
                    console.log(a), a && campoActivo(a)
                }), $(".splitButton").off("click"), $(".splitButton").on("click", function(e, t) {
                    var a = $(this).attr("sbs");
                    return console.log(a), editarCampos(a), !1
                }), $("body").pagecontainer("change", "#page2"), $("#floating").velocity({
                    opacity: 1
                }, function() {
                    $("#floating").removeClass("hidden")
                })
            }, errorHandler)
        }, errorHandler)
    }, errorHandler, nullHandler)
}

function editarCampos(e) {
    db.transaction(function(t) {
        t.executeSql("UPDATE CampoTee SET active = ?", [0]), t.executeSql("SELECT * FROM Campos WHERE campoId = ?", [e], function(t, a) {
            var o = a.rows.item(0).name,
                n = a.rows.item(0).campoId;
            var campPro = window.localStorage.getItem("betyaPro");
            var delDisable = campPro == "true" ? '' : 'ui-disabled';
            console.log(o, n), t.executeSql("SELECT * FROM CampoTee WHERE idCampo = ?", [e], function(t, a) {
                for (var l = [], i = 0; i < a.rows.length; i++) l.push(a.rows.item(i));
                t.executeSql("SELECT * FROM CampoPar ORDER BY teeId ASC, Hoyo ASC", [], function(t, a) {
                    var i = '<p style="text-align:center;"><b>' + o + '</b></p><div data-role="collapsibleset" data-collapsed-icon="false">';
                    $(l).each(function(e, t) {
                        i += '<div data-role="collapsible" tee="' + t.idTee + '"><h2 data-position="inline" style="text-transform: capitalize">' + t.color + '<span style="float:right;" class="button-span"><a href="#" data-role="button" data-inline="true" data-icon="delete" data-iconpos="notext" teeDel="' + t.idTee + '" class="delButton"></a></span></h2><ul data-role="listview">';
                        var o = "undefined" == t.rating ? "" : parseFloat(t.rating, 10),
                            n = "undefined" == t.slope ? "" : parseInt(t.slope, 10);
                        i += '<li><table><tbody><tr><td style="padding-left: 10%;padding-right:10%;width:50%"><label><b>Rating</b></label><input type="text" class="number" name="edRating" placeholder="' + o + '" value="' + o + '"></td><td style="padding-left: 10%;padding-right:10%;width:50%"><label><b>Slope</b></label><input type="number" name="edSlope" placeholder="' + n + '" value="' + n + '"></td></tr></tbody></table></li>';
                        for (var l = 0; l < a.rows.length; l++) {
                            var r = a.rows.item(l);
                            if (r.teeId == t.idTee) {
                                var d = "undefined" == r.Par ? "" : parseInt(r.Par, 10),
                                    c = "undefined" == r.Ventaja ? "" : parseInt(r.Ventaja, 10);
                                i += '<li><p style="text-align:center;font-size:large;"><b>Hoyo ' + r.Hoyo + '</b></p><table hoyo="' + r.Hoyo + '"><tbody><tr><td style="padding-left: 10%;padding-right: 10%;width:50%"><label>Par</label><input type="number" name="edPar" placeholder="' + d + '" value="' + d + '"></td><td style="padding-left: 10%;padding-right: 10%;width:50%"><label>Handicap</label><input type="number" name="edHcp" placeholder="' + c + '" value="' + c + '"></td></tr></tbody></table></li>'
                            }
                        }
                        i += "</ul></div>"
                    }), i += '</div><br><div data-role="controlgroup" data-type="horizontal" id="teeGroup" class="center"><input type="text" id="addTee" placeholder="Nuevo Tee" value="" data-wrapper-class="controlgroup-textinput ui-btn"><a data-role="button" style="width:25%" camperID="' + n + '" fromPage="edCamps" onClick="addTee(this)">Agregar</a></div><br><a data-role="button" onClick="confirmDelete(' + e + ')" class="BYGbutton redbtn ' + delDisable + '">BORRAR</a>', $("#editCampInfo").html(i), $("#editCampInfo").hasClass("ui-collapsible-set") ? $("#editCampInfo").collapsibleset("refresh") : $("#editCampInfo").trigger("create"), $("#editCampInfo input").off(), $('#editCampInfo input[type="number"]').on("keypress", function(e) {
                        (e.which < 48 || e.which > 57) && e.preventDefault(), "edSlope" == $(this).attr("name") ? $(this).val().length > 2 && e.preventDefault() : $(this).val().length > 1 && e.preventDefault()
                    }), $(".number").off(), $(".number").on("keypress", function(e) {
                        46 == e.which && -1 == $(this).val().indexOf(".") || !(e.which < 48 || e.which > 57) || 0 == e.which || 8 == e.which || e.preventDefault();
                        var t = $(this).val();
                        console.log(t), -1 == t.indexOf(".") && t.length > 2 && 46 != e.which && e.preventDefault(), -1 != t.indexOf(".") && t.substring(t.indexOf(".")).length > 2 && 0 != e.which && 8 != e.which && e.preventDefault()
                    }), $(".delButton").off("click"), $(".delButton").on("click", function(e, t) {
                        var a = $(this).attr("teeDel");
                        return checkDelTee(a), !1
                    }), $("body").pagecontainer("change", "#edCamps")
                }, errorHandler)
            }, errorHandler)
        }, errorHandler)
    }, errorHandler, nullHandler)
}

function addTee(e) {
    var t = $(e),
        a = t.attr("camperID"),
        o = t.attr("fromPage");
    console.log(a, o);
    var n = $("#" + o + " #addTee").val();
    console.log(n), "" == n ? vex.dialog.alert("Agrega un color de Tee") : "custom" == a ? teeAppend(n, a) : db.transaction(function(e) {
        e.executeSql("INSERT INTO CampoTee (idCampo, color, active, rating, slope) VALUES (?, ?, ?, ?, ?)", [a, n, 0, "undefined", "undefined"], function(e, t) {
            for (var a = t.insertId, o = 1; 18 >= o; o++) e.executeSql("INSERT INTO CampoPar (teeId, Hoyo, Par, Ventaja) VALUES (?, ?, ?, ?)", [a, o, "undefined", "undefined"], nullHandler, errorHandler);
            teeAppend(n, a)
        }, errorHandler)
    }, errorHandler, nullHandler), $("#addTee").val("")
}

function teeAppend(e, t) {
    var a = t,
        o = "#editCampInfo",
        n = !0;
    if ("custom" == t) {
        var l = $("#newCustomCamp").find("div[tee]").length;
        a = "new" + l, o = "#newCustomCamp", n = !1
    }
    for (var i = '<div data-role="collapsible" tee="' + a + '" nameTee="' + e + '"><h2 data-position="inline" style="text-transform: capitalize">' + e + '<span style="float:right;" class="button-span"><a href="#" data-role="button" data-inline="true" data-icon="delete" data-iconpos="notext" teeDel="' + a + '" class="delButton"></a></span></h2><ul data-role="listview"><li><table><tbody><tr><td style="padding-left: 10%;padding-right:10%;width:50%"><label><b>Rating</b></label><input type="text" class="number" name="edRating"></td><td style="padding-left: 10%;padding-right:10%;width:50%"><label><b>Slope</b></label><input type="number" name="edSlope"></td></tr></tbody></table></li>', r = 1; 18 >= r; r++) i += '<li><p style="text-align:center;font-size:large;"><b>Hoyo ' + r + '</b></p><table hoyo="' + r + '"><tbody><tr><td style="padding-left: 10%;padding-right: 10%;width:50%"><label>Par</label><input type="number" name="edPar"></td><td style="padding-left: 10%;padding-right: 10%;width:50%"><label>Handicap</label><input type="number" name="edHcp"></td></tr></tbody></table></li>';
    i += "</ul></div>", $(o).find('[data-role="collapsibleset"]').append(i).trigger("create").collapsibleset("refresh"), n ? ($("#editCampInfo input").off(), $('#editCampInfo input[type="number"]').on("keypress", function(e) {
        (e.which < 48 || e.which > 57) && e.preventDefault(), "edSlope" == $(this).attr("name") ? $(this).val().length > 2 && e.preventDefault() : $(this).val().length > 1 && e.preventDefault()
    })) : $('#customCamp input[type="number"]').on("keypress", function(e) {
        (e.which < 48 || e.which > 57) && e.preventDefault(), "edSlope" == $(this).attr("name") ? $(this).val().length > 2 && e.preventDefault() : $(this).val().length > 1 && e.preventDefault()
    }), $(".number").off(), $(".number").on("keypress", function(e) {
        46 == e.which && -1 == $(this).val().indexOf(".") || !(e.which < 48 || e.which > 57) || 0 == e.which || 8 == e.which || e.preventDefault();
        var t = $(this).val();
        console.log(t), -1 == t.indexOf(".") && t.length > 2 && 46 != e.which && e.preventDefault(), -1 != t.indexOf(".") && t.substring(t.indexOf(".")).length > 2 && 0 != e.which && 8 != e.which && e.preventDefault()
    }), $(".delButton").off("click"), $(".delButton").on("click", function(e, t) {
        var a = $(this).attr("teeDel");
        return checkDelTee(a), !1
    })
}

function checkDelTee(e) {
    console.log(e), vex.dialog.confirm({
        message: '<div style="font-size:large;text-align: center;border-bottom: 1px solid #203744;"><b>BORRAR</b></div><p style="text-align:center;font-size:medium;"><b>¿Estas seguro que deseas borrar este Tee?</b></p>',
        buttons: [$.extend({}, vex.dialog.buttons.YES, {
            className: "redButton",
            text: "BORRAR",
            click: function(e, t) {
                e.data().vex.value = !0, vex.close(e.data().vex.id)
            }
        }), $.extend({}, vex.dialog.buttons.NO, {
            className: "simpleCancel",
            text: "Cancelar",
            click: function(e, t) {
                vex.close(e.data().vex.id)
            }
        })],
        callback: function(t) {
            window.console.log("Choice", t ? "Continue" : "Cancel"), t && ($('div[tee="' + e + '"]').remove(), deleteTee(e))
        }
    })
}

function deleteTee(e) {
    db.transaction(function(t) {
        t.executeSql("DELETE FROM CampoTee WHERE idTee = ?", [e], nullHandler, errorHandler), t.executeSql("DELETE FROM CampoPar WHERE teeId = ?", [e], nullHandler, errorHandler)
    }, errorHandler, nullHandler)
}

function confirmUpdate() {
    vex.dialog.confirm({
        message: '<div style="font-size:large;text-align: center;border-bottom: 1px solid #203744;"><b>ACTUALIZAR</b></div><p style="text-align:center;font-size:medium;"><b>¿Estas seguro que deseas guardar los cambios al campo?</b></p>',
        buttons: [$.extend({}, vex.dialog.buttons.YES, {
            className: "okButton",
            text: "GUARDAR",
            click: function(e, t) {
                e.data().vex.value = !0, vex.close(e.data().vex.id)
            }
        }), $.extend({}, vex.dialog.buttons.NO, {
            className: "simpleCancel",
            text: "Cancelar",
            click: function(e, t) {
                vex.close(e.data().vex.id)
            }
        })],
        callback: function(e) {
            window.console.log("Choice", e ? "Continue" : "Cancel"), e && updateCampo()
        }
    })
}

function customCampo() {
    db.transaction(function(e) {
        var t = window.localStorage.getItem("betyaPro");
        if (t = "true" == t ? !0 : !1) {
            var a = $("#ccName").val();
            "" == a ? vex.dialog.alert("Agrega un nombre de Campo") : e.executeSql("INSERT INTO Campos (name, sbsId) VALUES (?, ?)", [a, "custom"], function(e, t) {
                var a = t.insertId,
                    o = $("#newCustomCamp").find("div[tee]");
                o.each(function(t, o) {
                    var n = $(o),
                        l = n.attr("nameTee"),
                        i = n.find('[name="edRating"]').val(),
                        r = n.find('[name="edSlope"]').val();
                    console.log(l, i, r), i = 0 == i ? "undefined" : i, r = 0 == r ? "undefined" : r, e.executeSql("INSERT INTO CampoTee (idCampo, color, active, rating, slope) VALUES (?, ?, ?, ?, ?)", [a, l, 0, i, r], function(e, t) {
                        for (var a = t.insertId, o = !0, l = 1; o;) {
                            var i = n.find('[hoyo="' + l + '"]');
                            if (!(i.length > 0)) {
                                o = !1;
                                break
                            }
                            var r = i.find('[name="edPar"]').val(),
                                d = i.find('[name="edHcp"]').val();
                            console.log("Hoyo", l, r, d), r = 0 == r ? "undefined" : r, d = 0 == d ? "undefined" : d, e.executeSql("INSERT INTO CampoPar (teeId, Hoyo, Par, Ventaja) VALUES (?, ?, ?, ?)", [a, l, r, d], nullHandler, errorHandler), l++
                        }
                    }, errorHandler)
                }), vex.dialog.confirm({
                    message: '<div style="font-size:large;text-align: center;border-bottom: 1px solid #203744;"><b>Campo Agregado</b></div><p style="text-align:center;font-size:medium;"><b>Se agrego exitosamente el nuevo campo!</b></p>',
                    buttons: [$.extend({}, vex.dialog.buttons.YES, {
                        className: "okButton",
                        text: "OK",
                        click: function(e, t) {
                            e.data().vex.value = !0, vex.close(e.data().vex.id)
                        }
                    })],
                    callback: function(e) {
                        $("#ccName").val(""), $("#newCustomCamp").find('[data-role="collapsibleset"]').empty().trigger("create").collapsibleset("refresh"), cargarCampos()
                    }
                })
            }, errorHandler)
        } else vex.dialog.confirm({
            message: '<div style="font-size:large;text-align: center;border-bottom: 1px solid #203744;"><b>Campos Pro</b></div><p style="font-size:medium;">Para poder tener campos custom necesitas tener Campos Pro. ¿Deseas comprarlo?</p><br>',
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
                window.console.log("Choice", e ? "Continue" : "Cancel"), e && (vex.close($vexContent.data().vex.id), show("bygPro"))
            }
        })
    }, errorHandler, nullHandler)
}

function updateCampo() {
    db.transaction(function(e) {
        var t = $("#editCampInfo").find("div[tee]");
        t.each(function(t, a) {
            var o = $(a),
                n = o.attr("tee"),
                l = o.find('[name="edRating"]').val(),
                i = o.find('[name="edSlope"]').val();
            console.log(n, l, i), l = 0 == l ? "undefined" : l, i = 0 == i ? "undefined" : i, e.executeSql("UPDATE CampoTee SET rating = ?, slope = ? Where idTee = ?", [l, i, n]);
            for (var r = !0, d = 1; r;) {
                var c = o.find('[hoyo="' + d + '"]');
                if (!(c.length > 0)) {
                    r = !1;
                    break
                }
                var s = c.find('[name="edPar"]').val(),
                    u = c.find('[name="edHcp"]').val();
                console.log("Hoyo", d, s, u), s = 0 == s ? "undefined" : s, u = 0 == u ? "undefined" : u, e.executeSql("UPDATE CampoPar SET Par = ?, Ventaja = ? Where teeId = ? and Hoyo = ?", [s, u, n, d]), d++
            }
        }), cargarCampos()
    }, errorHandler, nullHandler)
}

function confirmDelete(e) {
    vex.dialog.confirm({
        message: '<div style="font-size:large;text-align: center;border-bottom: 1px solid #203744;"><b>BORRAR</b></div><p style="text-align:center;font-size:medium;"><b>¿Estas seguro que deseas borrar el campo?</b></p>',
        buttons: [$.extend({}, vex.dialog.buttons.YES, {
            className: "redButton",
            text: "BORRAR",
            click: function(e, t) {
                e.data().vex.value = !0, vex.close(e.data().vex.id)
            }
        }), $.extend({}, vex.dialog.buttons.NO, {
            className: "simpleCancel",
            text: "Cancelar",
            click: function(e, t) {
                vex.close(e.data().vex.id)
            }
        })],
        callback: function(t) {
            window.console.log("Choice", t ? "Continue" : "Cancel"), t && deleteCampo(e)
        }
    })
}

function deleteCampo(e, t) {
    db.transaction(function(a) {
        a.executeSql("DELETE FROM Campos WHERE campoId = ?", [e], nullHandler, errorHandler), a.executeSql("SELECT * FROM CampoTee WHERE idCampo = ?", [e], function(a, o) {
            for (var n = 0; n < o.rows.length; n++) a.executeSql("DELETE FROM CampoPar WHERE teeId = ?", [o.rows.item(n).idTee], nullHandler, errorHandler);
            a.executeSql("DELETE FROM CampoTee WHERE idCampo = ?", [e], nullHandler, errorHandler), t || checkTemporal()
        }, errorHandler)
    }, errorHandler, nullHandler)
}

function dlCampos() {
    if (mainTour.hide(), $(".addCampo").hasClass("byg-disabled")) return void vex.dialog.confirm({
        message: '<div style="font-size:large;text-align: center;border-bottom: 1px solid #203744;"><b>Campos Pro</b></div><p style="font-size:medium;">Para poder tener más de un campo necesitas tener Campos Pro. ¿Deseas comprarlo?</p><br>',
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
            window.console.log("Choice", e ? "Continue" : "Cancel"), e && show("bygPro")
        }
    });
    $("#loc ul").html(""), $("#activeLoc").addClass("ui-btn-active"), $("#locButton").removeClass("hidden"), $("#locText").addClass("hidden"), $("#searchCamp").html(""), $("#srNameText").addClass("hidden");
    var e = $("#srName form").find("a");
    $(e).hasClass("ui-input-clear-hidden") || $(e).trigger("click"), $("#namButton").addClass("hidden"), $("#locButton").attr({
        onClick: "loadByLoc(1)",
        nLink: 1
    }), namCamp(), vex.dialog.confirm({
        message: '<div style="font-size:large;text-align: center;border-bottom: 1px solid #203744;"><b>GPS</b></div><p style="text-align:center;font-size:medium;">¿Deseas permitir acceso a tu localizacion para encontrar los campos mas cercanos a ti?</p>',
        buttons: [$.extend({}, vex.dialog.buttons.YES, {
            className: "okButton",
            text: "ACEPTAR",
            click: function(e, t) {
                e.data().vex.value = !0, vex.close(e.data().vex.id)
            }
        }), $.extend({}, vex.dialog.buttons.NO, {
            className: "redButton",
            text: "NO",
            click: function(e, t) {
                vex.close(e.data().vex.id)
            }
        })],
        callback: function(e) {
            window.console.log("Choice", e ? "Continue" : "Cancel"), e ? checkLocationPermission() : ($("#activeLoc").addClass("ui-disabled"), $("body").pagecontainer("change", "#campos"), $("#activeSrName").trigger("click"))
        }
    })
}

function checkCustom() {}

function checkLocationPermission() {
    cordova.plugins.diagnostic.getLocationAuthorizationStatus(function(status) {
        if (status == "GRANTED") {
            $("#activeLoc").removeClass("ui-disabled"), loadByLoc(1);
        } else {
            cordova.plugins.diagnostic.requestLocationAuthorization(function(status) {
                if (status == "GRANTED") {
                    $("#activeLoc").removeClass("ui-disabled"), loadByLoc(1);
                } else {
                    $("#activeLoc").addClass("ui-disabled"), $("body").pagecontainer("change", "#campos"), $("#activeSrName").trigger("click");
                }
            }, function(error) {
                console.error(error);
            });
        }
    }, function() {
        alert("No se pudo verificar el acceso a tu localización, autoriza la aplicación desde configuración");
    });
}

function loadByLoc(e) {
    $('.mainLoader').removeClass('hidden'), $('body').spin('ball'), $("#locButton").addClass("ui-disabled"), navigator.geolocation.getCurrentPosition(function(t) {
        camposByLoc(t.coords.latitude, t.coords.longitude, e)
    }, function(e) {
        $('.mainLoader').addClass('hidden'), $('body').spin(false), alert("code: " + e.code + "\nmessage: " + e.message + "\n")
    }, {
        timeout: 1e4,
        enableHighAccuracy: !0
    })
}

function camposByLoc(e, t, a) {
    $.ajax({
        type: "GET",
        url: "https://api.swingbyswing.com/v2/courses/search_by_location?",
        data: {
            lat: e,
            lng: t,
            radius: 100,
            active_only: "yes",
            hole_count: 18,
            order_by: "distance_from_me_kilometers",
            from: a,
            limit: 5,
            access_token: "9be5f0a2-5212-4e6e-9f1d-ec87ed3b0d09"
        },
        crossDomain: !0,
        error: function(e, t, a) {
            $('.mainLoader').addClass('hidden'), $('body').spin(false), alert(t + "\n" + a), console.log(t, a)
        },
        success: function(e) {
            console.log("Data con client!\n", e);
            var t = e.courses,
                a = e.linked.course_distances;
            if (t.length > 0) {
                var o = "";
                $(t).each(function(e, t) {
                    var n = !1;
                    $("#campList > div").each(function(e, a) {
                        $(a).attr("sbs") == t.id && (n = !0)
                    }), console.log(n, t.id, t.location.lat, t.location.lng), n || (o += '<li><a onClick="campConfirm(' + t.id + ')"><p style="font-weight:bold;font-size:large;width:80%;white-space:normal;">' + t.name + '</p><p class="ui-li-aside">' + a[e].distance_from_me_kilometers + " KM</p></a></li>")
                }), $("#loc ul").append(o), $("#loc ul").hasClass("ui-listview") ? $("#loc ul").listview("refresh") : $("#loc ul").trigger("create");
                var n = $("#locButton").attr("nLink");
                n = parseInt(n, 10) + 5, console.log(n), $("#locButton").attr({
                    onClick: "loadByLoc(" + n + ")",
                    nLink: n
                })
            } else $("#locButton").addClass("hidden"), $("#locText").removeClass("hidden");
            $('.mainLoader').addClass('hidden'), $('body').spin(false), $("#locButton").removeClass("ui-disabled");
            var l = $(".ui-page-active").attr("id");
            "campos" != l && ($("#activeLoc").trigger("click"), $("body").pagecontainer("change", "#campos"))
        }
    })
}

function namCamp() {
    $("#searchCamp").off("filterablebeforefilter"), $("#searchCamp").on("filterablebeforefilter", function(e, t) {
        var a = $(this),
            o = $(t.input),
            n = o.val();
        n && n.length > 2 ? ($('.mainLoader').removeClass('hidden'), $('body').spin('ball'), a.html(""), a.listview("refresh"), $("#srNameText").addClass("hidden"), $("#namButton").attr({
            onClick: "camposByname(" + o.val() + ", 1)",
            nLink: 1
        }), $("#namButton").removeClass("hidden"), camposByname(o.val(), 0)) : (a.html(""), $("#namButton").addClass("hidden"))
    })
}

function camposByname(e, t) {
    $.ajax({
        type: "GET",
        url: "https://api.swingbyswing.com/v2/courses/search_by_term?",
        data: {
            name: e,
            active_only: "yes",
            hole_count: 18,
            from: t,
            limit: 5,
            access_token: "9be5f0a2-5212-4e6e-9f1d-ec87ed3b0d09"
        },
        crossDomain: !0,
        success: function(t) {
            console.log(e, "Data con client!\n", t);
            var a = t.courses;
            if (a.length > 0) {
                var o = "";
                $(a).each(function(e, t) {
                    var a = !1;
                    $("#campList > div").each(function(e, o) {
                        var n = $(o).attr("sbs");
                        n == t.id && (a = !0)
                    }), a || (o += '<li><a onClick="campConfirm(' + t.id + ')"><p style="font-weight:bold;font-size:large;width:80%;white-space:normal;">' + t.name + "</p></a></li>")
                }), $("#searchCamp").append(o), $("#searchCamp").hasClass("ui-listview") ? $("#searchCamp").listview("refresh") : $("#searchCamp").trigger("create");
                var n = $("#namButton").attr("nLink");
                $("#searchCamp").find('li').removeClass('ui-screen-hidden');
                n = parseInt(n, 10) + 5, console.log(n), $("#namButton").attr({
                    onClick: 'camposByname("' + e + '", ' + n + ")",
                    nLink: n
                })
            } else $("#namButton").addClass("hidden"), $("#srNameText").removeClass("hidden");
            $('.mainLoader').addClass('hidden'), $('body').spin(false);
        }
    })
}

function campConfirm(e) {
    $.ajax({
        type: "GET",
        url: "https://api.swingbyswing.com/v2/courses/" + e,
        data: {
            access_token: "9be5f0a2-5212-4e6e-9f1d-ec87ed3b0d09"
        },
        crossDomain: !0,
        success: function(e) {
            console.log("Data con client!\n", e);
            var t = e.course;
            console.log(t.country, t.city), vex.dialog.confirm({
                message: '<div style="font-size:large;text-align: center;border-bottom: 1px solid #203744;"><b>AGREGAR CAMPO</b></div><p style="text-align:center;font-size:medium;"><b>' + t.name + '</b></p><p style="font-size:medium;">Ciudad: ' + t.city + "<br>Pais: " + t.country + '</p><p style="text-align:center;font-size:medium;color:#2AB573"><b>NOTA:</b> La librería de campos es extensa y puede que algunos no estén al día. Verifica la información con una tarjeta oficial del campo.</p>',
                buttons: [$.extend({}, vex.dialog.buttons.YES, {
                    className: "okButton",
                    text: "AGREGAR",
                    click: function(e, t) {
                        e.data().vex.value = !0, vex.close(e.data().vex.id)
                    }
                }), $.extend({}, vex.dialog.buttons.NO, {
                    className: "simpleCancel",
                    text: "Cancelar",
                    click: function(e, t) {
                        vex.close(e.data().vex.id)
                    }
                })],
                callback: function(e) {
                    console.log("Choice", e ? "Continue" : "Cancel"), e && checkCamPro(t)
                }
            })
        }
    })
}

function checkTemporal() {
    db.transaction(function(transaction) {
        transaction.executeSql("SELECT * FROM Campos", [], function(transaction, result) {
            var a = window.localStorage.getItem("betyaPro");
            if (a = "true" == a ? !0 : !1) $("#addCustom").removeClass("byg-disabled"), $(".addCampo").removeClass("byg-disabled");
            else if (result.rows.length >= 1) {
                for (var checkExit = !0, n = 1; n < result.rows.length; n++) deleteCampo(result.rows.item(n).campoId, checkExit);
                $(".addCampo").addClass("byg-disabled"), $("#addCustom").addClass("byg-disabled")
            }
            cargarCampos()
        }, errorHandler)
    }, errorHandler, nullHandler)
}

function checkCamPro(t) {
    var campPro = window.localStorage.getItem("betyaPro");
    if (campPro == "true") agregarDlCampo(t);
    else vex.dialog.confirm({
        message: '<div style="font-size:large;text-align: center;border-bottom: 1px solid #203744;"><b>Alerta</b></div><p style="text-align:center;font-size:medium;"><b>Una vez que descargues un campo no podrás cambiarlo a menos que compres Campos Pro</b></p><p style="text-align:center;font-size:medium;"><b>¿Deseas continuar?</b></p>',
        buttons: [$.extend({}, vex.dialog.buttons.YES, {
            className: "okButton",
            text: "AGREGAR",
            click: function(e, t) {
                e.data().vex.value = !0, vex.close(e.data().vex.id)
            }
        }), $.extend({}, vex.dialog.buttons.NO, {
            className: "simpleCancel",
            text: "Cancelar",
            click: function(e, t) {
                vex.close(e.data().vex.id)
            }
        })],
        callback: function(e) {
            e && agregarDlCampo(t)
        }
    })
}

function agregarDlCampo(e) {
    db.transaction(function(t) {
        var a = e;
        console.log(a.name, a.id), t.executeSql("INSERT INTO Campos (name, sbsId) VALUES (?, ?)", [a.name, a.id], function(e, t) {
            var o = t.insertId,
                n = a.holes;
            $(a.tee_types).each(function(t, a) {
                if (void 0 == a.tee_color_type) return !0;
                var l = a.tee_color_type,
                    i = a.rating || "undefined",
                    r = a.slope || "undefined";
                console.log(i, r, l), e.executeSql("INSERT INTO CampoTee (idCampo, color, active, rating, slope) VALUES (?, ?, ?, ?, ?)", [o, l, 0, i, r], function(e, t) {
                    var a = t.insertId;
                    for (key in n) {
                        var o = n[key];
                        console.log("Hoyo", o.hole_num);
                        var i = $(o.tee_boxes);
                        i.each(function(t, n) {
                            if (void 0 == n.tee_color_type) return !0;
                            if (l == n.tee_color_type) {
                                var i = n.par || "undefined",
                                    r = n.hcp || "undefined";
                                console.log(n.tee_color_type, n.par, n.hcp), e.executeSql("INSERT INTO CampoPar (teeId, Hoyo, Par, Ventaja) VALUES (?, ?, ?, ?)", [a, o.hole_num, i, r], nullHandler, errorHandler)
                            }
                        })
                    }
                }, errorHandler)
            }), vex.dialog.confirm({
                message: '<div style="font-size:large;text-align: center;border-bottom: 1px solid #203744;"><b>Campo Agregado</b></div><p style="text-align:center;font-size:medium;"><b>Se agrego exitosamente el nuevo campo!</b></p>',
                buttons: [$.extend({}, vex.dialog.buttons.YES, {
                    className: "okButton",
                    text: "CONTINUAR",
                    click: function(e, t) {
                        e.data().vex.value = !0, vex.close(e.data().vex.id)
                    }
                })],
                callback: function(e) {
                    checkTemporal()
                }
            })
        }, errorHandler)
    }, errorHandler, nullHandler)
}

function campoActivo(editable) {
    var editable = editable;
    db.transaction(function(t) {
        t.executeSql("UPDATE CampoTee SET active = ?", [0]), t.executeSql("SELECT * FROM CampoPar WHERE teeId = ?", [editable], function(t, a) {
            for (var o = 0; o < a.rows.length; o++) {
                var n = a.rows.item(o);
                for (key in n)
                    if ("undefined" == n[key]) return void vex.dialog.confirm({
                        message: '<div style="font-size:large;text-align: center;border-bottom: 1px solid #203744;"><b>Campo</b></div><p style="text-align:center;font-size:medium;"><b>El campo seleccionado tiene informacion incompleta</b></p><p style="text-align:center;font-size:medium;"><b>¿Desea editarlo para poder utilizarlo?</b></p>',
                        buttons: [$.extend({}, vex.dialog.buttons.YES, {
                            className: "okButton",
                            text: "EDITAR",
                            click: function(e, t) {
                                e.data().vex.value = !0, vex.close(e.data().vex.id)
                            }
                        }), $.extend({}, vex.dialog.buttons.NO, {
                            className: "simpleCancel",
                            text: "Cancelar",
                            click: function(e, t) {
                                vex.close(e.data().vex.id)
                            }
                        })],
                        callback: function(e) {
                            e && editarCampos(editable)
                        }
                    })
            }
            ListDBValues(), t.executeSql("UPDATE CampoTee SET active = ? Where idTee = ?", [1, editable], nullHandler, errorHandler), $("body").pagecontainer("change", "#page5"), IndiceHandicap(), loadCampBlock();
        }, nullHandler, errorHandler)
    }, errorHandler, nullHandler)
}

function loadCampBlock() {
    db.transaction(function(tx) {
        tx.executeSql('SELECT * FROM CampoTee, CampoPar WHERE CampoTee.idCampo = (SELECT idCampo FROM CampoTee WHERE active = 1) AND CampoTee.idTee = CampoPar.teeId ORDER BY CampoTee.idTee, CampoPar.Hoyo', [], function(tx, result) {
            if (result != null && result.rows != null) {
                console.log(result);
                //var inicio = parseInt(Hoyos);
                //var fin = inicio+8;
                campBlock = { "1": {}, "2": {} };
                for (var l = 0; l < result.rows.length; l++) {
                    var row = result.rows.item(l);
                    if (row.Hoyo <= 9) {
                        //if (row.Hoyo<=fin){
                        //console.log('IS THIS', campBlock["1"].hasOwnProperty(row.idTee));
                        //console.log(campBlock[row.idTee].hasOwnProperty('arrayVentaja'));
                        if (!campBlock["1"].hasOwnProperty(row.idTee)) campBlock["1"][row.idTee] = { arrayVentaja: [] };
                        campBlock["1"][row.idTee].arrayVentaja.push(row.Ventaja);
                        //}
                    } else {
                        if (!campBlock["2"].hasOwnProperty(row.idTee)) campBlock["2"][row.idTee] = { arrayVentaja: [] };
                        campBlock["2"][row.idTee].arrayVentaja.push(row.Ventaja);
                    }
                }
                window.console.log('campBlock', campBlock);
            }
        }, errorHandler);
    }, errorHandler, nullHandler);
}
