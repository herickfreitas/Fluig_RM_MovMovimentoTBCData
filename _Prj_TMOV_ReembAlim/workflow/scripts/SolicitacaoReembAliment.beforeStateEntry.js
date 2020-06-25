var SeqProcessamento = 172;


function beforeStateEntry(sequenceId){

	
	log.info("beforeStateEntry "+sequenceId);
	
	//If para sequenciar conforme etapas do processo
    if (sequenceId == SeqProcessamento) {
    	ProcessamentoWorkflow();
    }  
/*
    else
	// De acordo com os estados finais ? passada a a??o a ser realizada no Movimento
    if (sequenceId == SeqCancelaMov)
    	AtualizaMovimento("Cancela");
	else if (sequenceId == SeqConcluiMov)
		AtualizaMovimento("Conclui");
	else if (sequenceId == SeqFaturaMov)
		AtualizaMovimento("Fatura");   
*/
}


function ProcessamentoWorkflow(){
	try { 
		
		log.info("==========[ ProcessamentoWorkflow ENTROU ]==========");
		
		//Recupera o usuário corrente associado a atividade
		var requisitante = getValue("WKUser");		
		log.info("==========[ ProcessamentoWorkflow requisitante ]=========="+requisitante);
		
		// Gravando valores no formulário
		hAPI.setCardValue("solicitante", requisitante);
		
		// Preparacao de filtro para consulta
		var c1 = DatasetFactory.createConstraint("SOLICITANTE", requisitante, requisitante, ConstraintType.MUST);
		var constraints = new Array(c1);
		log.info("==========[ ProcessamentoWorkflow createDataset constraints ]========== " + constraints);
			    
		// coleta dados do dataset, utlizando filtro
		var datasetReturned = DatasetFactory.getDataset("_RM_SOLICITANTE_CHEFIA", null, constraints, null);
		log.info("==========[ ProcessamentoWorkflow createDataset datasetReturned ] ========== " + datasetReturned);	  
			    
		// Gravando valores de retorno
		var retorno = datasetReturned.values;
		log.info("==========[ ProcessamentoWorkflow createDataset dataset ]========== " + retorno);
			
		// Retirando o campo do resultado
		var chefe = datasetReturned.getValue(0, "CHEFIA");
		log.info("==========[ ProcessamentoWorkflow createDataset chefe ]========== " + chefe);
			
		// Gravando retorno		
		hAPI.setCardValue("chefia", chefe);
		
		
	    
		// Coleta do centro de custo seleciondo no formulário
        var ccustoTotal = hAPI.getCardValue("ccusto");
        var ccusto = ccustoTotal.substring(0,18);
        log.info("==========[ ProcessamentoWorkflow ccustoTotal ]=========="+ccustoTotal);
        log.info("==========[ ProcessamentoWorkflow ccusto ]=========="+ccusto);

 
        // Rodando novo dataset para coletar responsável do centro de custo
        var c1 = DatasetFactory.createConstraint("CODCCUSTO", ccusto, ccusto, ConstraintType.MUST);
        var constraints = new Array(c1);
        log.info("==========[ ProcessamentoWorkflow constraints ]========== " + constraints);
        
        // Executando chamada de dataset
        var datasetReturned = DatasetFactory.getDataset("_RM_GESTOR_CENTRO_CUSTO", null, constraints, null);
        
		// Retirando o campo do resultado
		var chefe = datasetReturned.getValue(0, "RESPONSAVEL");
		log.info("==========[ ProcessamentoWorkflow createDataset chefe ]========== " + chefe);        
        
        // Gravando retorno no formulário		
		hAPI.setCardValue("gestorcc", chefe);
		
		}
	
	catch (e)
	{
		log.error(e);
		throw e;
	}
	
}