function displayFields(form,customHTML){
	
	var activity = getValue('WKNumState');
	var inicioPadrao = 0;
	var ajustarSolicitacao = 180;
	//var inicioProcesso = 2;
	
	log.info("displayFields WKNumState "+activity);
	
	if ((activity != inicioPadrao) && (activity != ajustarSolicitacao)) {
		
		var habilitar = false; // Informe True para Habilitar ou False para Desabilitar os campos
	    var mapaForm = new java.util.HashMap();
	    mapaForm = form.getCardData();
	    var it = mapaForm.keySet().iterator();

	    while (it.hasNext()) { // Laço de repetição para habilitar/desabilitar os campos
	        var key = it.next();
	        form.setEnabled(key, habilitar);
	    }
		
	}

	
}
