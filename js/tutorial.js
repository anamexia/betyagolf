var mainTour;

mainTour = new Shepherd.Tour({
  defaults: {
    classes: 'shepherd-theme-arrows BYGshepard',
    scrollTo: true
  }
});

mainTour.addStep('bienvenido', {
	title:'Bienvenido a BetyaGolf!',
  text: 'Aqui puedes iniciar sesion o crear una cuenta nueva<br><br>Si prefieres puedes continuar sin una cuenta por el momento',
  attachTo: {element: '#page1 .comienzo', on: 'top'},
  showCancelLink: true,
  buttons: [
  ]
});

mainTour.addStep('addCampo', {
  text: 'Para empezar a utilizar BetyaGolf, primero debes agregar campos de golf!',
  attachTo: {element: '#page2 .addCampo', on: 'bottom'},
  showCancelLink: true,
  buttons: [
	{
	  text: 'OK',
	  action: mainTour.hide
	}
  ]
});

mainTour.addStep('geoCampo', {
  text: 'Aqui puedes ver campos cercanos a tu localizacion',
  attachTo: {element: '#campos #activeLoc', on: 'bottom'},
  tetherOptions:{
    attachment: 'top left',
    targetAttachment: 'bottom center',
    offset: '0 35px'
	},
  showCancelLink: true,
  buttons: [
	{
	  text: 'OK',
	  action: mainTour.next
	}
  ],
});

mainTour.addStep('nomCampo', {
  text: 'Tambien puedes buscar los campos por nombre',
  attachTo: {element: '#campos #activeSrName', on: 'bottom'},
  showCancelLink: true,
  buttons: [
	{
	  text: 'OK',
	  action: mainTour.next
	}
  ]
});

mainTour.addStep('cusCampo', {
  text: 'En caso de no encontrar el campo que quieres, puedes generar uno con las propiedades que necesites<br><p style="color:#2AB573;">Solo con Campos Pro</p>',
  attachTo: {element: '#campos #activeCustom', on: 'bottom'},
  tetherOptions:{
    attachment: 'top right',
    targetAttachment: 'bottom center',
    offset: '0 -35px'
	},
  showCancelLink: true,
  buttons: [
	{
	  text: 'OK',
	  action: mainTour.hide
	}
  ]
});