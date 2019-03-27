/**
 * Controlls panel open and close events
 *
 * @method     touchPanel
 */
function touchPanel() {
    if ($('#openPanel').hasClass('ui-icon-bars')) {
        $('#openPanel').removeClass('ui-icon-bars').addClass('ui-icon-arrow-l');
        $('#logPanelD').velocity({
            translateX: "101%"
        }, {
            duration: "fast"
        });
        $('.ui-disabler').addClass('ui-disabling');
        $('body').addClass('disBody');
    } else {
        $('#openPanel').removeClass('ui-icon-arrow-l').addClass('ui-icon-bars');
        $('#logPanelD').velocity("reverse");
        $('.ui-disabler').removeClass('ui-disabling');
        $('body').removeClass('disBody');
    }
}

function hidePanel() {
    $('#floating').velocity({ opacity: 0 }, function() {
        $('#floating').addClass('hidden');
        $('#logPanelD').addClass('hidden');
    });
}

function showPanel() {
    $('#floating').velocity({ opacity: 1 }, function() {
        $("#floating").removeClass('hidden');
        $('#logPanelD').removeClass('hidden');
        $('#logList').removeClass('hidden');
    });
}

function panelHandicap() {
    $('#page14').find('.ui-btn-left').addClass('hidden');
    $("body").pagecontainer("change", "#page14");
}

function panelTarjeta() {
    $("body").pagecontainer("change", "#page16");
}

function panelPresiones() {
    $('.mainLoader').removeClass('hidden');
    $('body').spin('ball');
    tablePresiones();
}

function panelApuestas() {
    window.sessionStorage.setItem('menu', true);
    $('input').off();
    $("#tbHoyos").off();
    cambioStakePareja();
}

function panelSaldos() {
    saldoTotal();
    $("body").pagecontainer("change", "#saldoApuestas");
}

function panelInitialize() {
    $(document).on('pagecontainerbeforehide', function(event, ui) {
        console.log('HIDING', $('#logPanel').visible(true), (ui.prevPage.attr('id') != 'page11'));
        if ((($('#logPanel').visible(true)) && (ui.prevPage.attr('id') != 'page11')) && (!$("#logPanelD").hasClass('hidden')))
            touchPanel();
    });

    $(document).on('pageshow', '[data-role="page"]', function(evt, data) {
        console.log('Appear!');
        data.prevPage.find('.ui-content, .ui-footer').removeClass('faded-in');
        $(this).find('.ui-content, .ui-footer').addClass('faded-in');

        var idPage = $('.ui-page-active').attr('id');
        //console.log(idPage);
        $('#logList').find('li').removeClass('hidden');
        var saldo = window.sessionStorage.getItem("Saldos");
        if (!saldo) $('#logList').find('li:nth-child(4)').addClass('hidden');
        switch (idPage) {
            case 'page16':
                $('#logList').find('li:first-child').addClass('hidden');
                break;
            case 'presns':
                $('#logList').find('li:nth-child(2)').addClass('hidden');
                break;
            case 'indAps':
                $('#logList').find('li:nth-child(3)').addClass('hidden');
                break;
            case 'indApsDet':
                $('#logList').find('li:nth-child(3)').addClass('hidden');
                break;
            case 'chStkP':
                $('#logList').find('li:nth-child(3)').addClass('hidden');
                break;
            case 'saldoApuestas':
                $('#logList').find('li:nth-child(4)').addClass('hidden');
                break;
            case 'saldoApuestas2':
                $('#logList').find('li:nth-child(4)').addClass('hidden');
                break;
            case 'page14':
                $('#logList').find('li:nth-child(5)').addClass('hidden');
                break;
            default:
                break;
        }
    });

    if ($('#logList').hasClass('ui-listview')) $('#logList').listview('refresh');
    else $('#logList').trigger('create');

    $('#logList').addClass('hidden');

    $('.ui-disabler').on('touchstart mousedown', function(e) {
        e.stopImmediatePropagation();
        touchPanel();
    });

    $('#logList').on('click', 'li', function() {
        var index = $(this).index();
        var aPage = $('.ui-page-active').attr('id');
        console.log('Active Page? ', aPage, 'index', index);
        switch (index) {
            case 0:
                if (aPage != 'page16') panelTarjeta();
                else touchPanel();
                break;
            case 1:
                if (aPage != 'presns') panelPresiones();
                else touchPanel();
                break;
            case 2:
                if ((aPage != 'indAps' || aPage != 'indApsDet') || aPage != 'chStkP') panelApuestas();
                else touchPanel();
                break;
            case 3:
                if (aPage != 'saldoApuestas' || aPage != 'saldoApuestas2') panelSaldos();
                else touchPanel();
                break;
            case 4:
                if (aPage != 'page14') panelHandicap();
                else touchPanel();
                break;
            default:
                break;
        }
    });

    $('#openPanel').on('click', function(event) {
        touchPanel();
    });

    $(document).on("swipeleft swiperight", "#logPanelD", function(e) {         touchPanel();     });
}
