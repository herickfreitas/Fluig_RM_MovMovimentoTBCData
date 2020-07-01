var SeqProcessamento = 172;
var SeqAprovado = 8; // Inserir movimento no RM
var Usuario = 'integracao';
var Senha = '!2018@Minha!';


function beforeStateEntry(sequenceId){

	
	log.info("beforeStateEntry "+sequenceId);
	
	//If para sequenciar conforme etapas do processo
    if (sequenceId == SeqProcessamento) {
    	ProcessamentoWorkflow();
    }
    
    else if (sequenceId == SeqAprovado) {
    	AprovarWorkflow();
    }
	
}


function ProcessamentoWorkflow(){
	try { 
		
		log.info("==========[ ProcessamentoWorkflow ENTROU ]==========");
		
		
		// VERIFICANDO SE TEM ANEXOS - INICIO //
		
        var anexos   = hAPI.listAttachments();
        var temAnexo = false;

        if (anexos.size() > 0) {
            temAnexo = true;
        }

        if (!temAnexo) {
            throw "É preciso anexar o comprovante da despesa para continuar o processo!";
        }
        
		// VERIFICANDO SE TEM ANEXOS - INICIO //		
		
		
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
		
		
		// Atribuido valor na variável autorizador, para preenchimento do formulário
    	if (ccusto.substring(0,11) == ('12.01.02.01'))
    		var autorizador = 'Pool:Group:w_SG'; // COMO SG - SIMONEGUIMARAES
    		
    	else if (ccusto == ('20.01.02.08.70080'))
    		var autorizador = 'Pool:Group:w_VPF'; // COMO VPF - LEANDROPINTO		
    	
    	else if (ccusto.substring(0,8) == ('20.01.01'))
    			var autorizador = 'Pool:Group:w_VPF'; // COMO VPF - LEANDROPINTO
    		
    	else if (ccusto.substring(0,2) == ('12') || ccusto.substring(0,2) == ('13') || ccusto.substring(0,2) == ('14') || 
    			ccusto.substring(0,2) == ('15') || ccusto.substring(0,2) == ('16'))
    		var autorizador = 'Pool:Group:w_GP'; // COMO GP - LenouraSchmidt
    	
    	else if (ccusto.substring(0,2) == ('11') || ccusto.substring(0,2) == ('18') || ccusto.substring(0,2) == ('50') || 
    			ccusto.substring(0,2) == ('90') || ccusto.substring(0,2) == ('99'))
    		var autorizador = 'Pool:Group:w_VPF'; // COMO VPF - LEANDROPINTO
    	
    	else
    		var autorizador = 'Pool:Group:w_SG'; // COMO SG - SIMONEGUIMARAES
    	
    	// Gravando retorno no formulário		
		hAPI.setCardValue("autorizador", autorizador);
		
		
		
		}
	
	catch (e)
	{
		log.error(e);
		throw e;
	}
	}	
	

	function AprovarWorkflow(){ // Inserir movimento no RM
		try { 
			
            // Criar o objeto de Integracao
            var SERVICE_STUB = ServiceManager.getService('wsDataServer');
            log.info("AprovarWorkflow-> SERVICE_STUB: " + SERVICE_STUB);
            
            var SERVICE_HELPER = SERVICE_STUB.getBean();
            log.info("AprovarWorkflow-> SERVICE_HELPER: " + SERVICE_HELPER);
            
            // Criar o obejto da classe principal do Servico
            var wsDataServer = SERVICE_HELPER.instantiate('com.totvs.WsDataServer');
            //log.info("AprovarWorkflow-> wsDataServer: " + wsDataServer);

            // Obter o objeto do WS
            var iWsDataServer = wsDataServer.getRMIwsDataServer();
            log.info("AprovarWorkflow-> iWsDataServer: " + iWsDataServer);
            
            // Configurar a autentica??o
            var authIwsDataServer = SERVICE_STUB.getBasicAuthenticatedClient(iWsDataServer, 'com.totvs.IwsDataServer', Usuario, Senha);
            log.info("AprovarWorkflow -> authIwsDataServer: " + authIwsDataServer);
            
            // Passar os parametros
            var dataServerName = "MovMovimentoTBCData";
            var contexto = "CODCOLIGADA=1;CODUSUARIO=integracao;CODSISTEMA=T";
            // Chamada da função com os dados do movimento
            var XML = GetXml();
            
            var result = authIwsDataServer.saveRecord(dataServerName, XML, contexto);
            //log.info("AprovarWorkflow-> authIwsDataServer.saveRecord: " + result);
            
            if ((result != null) && (result.indexOf("===") != -1)) {
                var msgErro = result.substring(0, result.indexOf("==="));                
                throw msgErro;
            }        

            return result;

		}
		
		catch (e)
		{
            if (e == null)  e = "Erro desconhecido!";  
            var mensagemErro = "Ocorreu um erro ao salvar dados no RM: " + e;  
            throw mensagemErro+"ERRO NO RM "+result;  
		}
	
	}	
	
	
	
	function GetXml() {
		
		log.info("CUSTOM: geraXmlContrato - inicio");
		var XML;
		
		// Coletando informações do form para XML
		var IDFLUIG = getValue('WKNumProces');
		var SOLICITANTE = hAPI.getCardValue("solicitante");
		var CODFILIAL = (hAPI.getCardValue("filial")).substring(0,1);
        var CODCFO = (hAPI.getCardValue("favorecido")).substring(0,5);
        var VLTRANSP = hAPI.getCardValue("valorTransporte").replace(',','.');
        var VLALIMENT = hAPI.getCardValue("valorAlimentacao").replace(',','.');
        var VALORBRUTO = (parseFloat(VLTRANSP)+parseFloat(VLALIMENT));
        var CODCCUSTO = (hAPI.getCardValue("ccusto")).substring(0,17);
        var HOJE = new Date().toISOString().slice(0,19); // Formato ""+DTDESPESAFORMAT+"T22:34:02"
        var HISTORICO = "Solicitação Fluig : "+IDFLUIG+" - "+(hAPI.getCardValue("observacaoMov"));
        var DTDESPESA = hAPI.getCardValue("dataDespesa"); // Formato DD/MM/AAAA
        var DTDESPESAFORMAT = DTDESPESA.substring(6,10)+"-"+DTDESPESA.substring(3,5)+"-"+DTDESPESA.substring(0,2); // Formato AAAA-MM-DD
		
        // Estruturando XML
		XML = "<MovMovimento >" +   
		" <TMOV>	"  + 
		" <CODCOLIGADA>1</CODCOLIGADA>	"  + 
		" <IDMOV>-1</IDMOV>	"  + 
		" <CODFILIAL>"+CODFILIAL+"</CODFILIAL>	"  + 
		" <CODLOC>0"+CODFILIAL+"</CODLOC>	"  + 
		" <CODLOCDESTINO>0"+CODFILIAL+"</CODLOCDESTINO>	"  + 
		" <CODCFO>"+CODCFO+"</CODCFO>	"  + 
		" <NUMEROMOV>0</NUMEROMOV>	"  + 
		" <SERIE>OE</SERIE>	"  + 
		" <CODTMV>1.2.35</CODTMV>	"  + 
		" <TIPO>A</TIPO>	"  + 
		" <STATUS>A</STATUS>	"  + 
		" <MOVIMPRESSO>0</MOVIMPRESSO>	"  + 
		" <DOCIMPRESSO>0</DOCIMPRESSO>	"  + 
		" <FATIMPRESSA>0</FATIMPRESSA>	"  + 
		" <DATAEMISSAO>"+DTDESPESAFORMAT+"T00:00:00</DATAEMISSAO>	"  + 
		" <DATASAIDA>"+HOJE+"</DATASAIDA>	"  + 
		" <COMISSAOREPRES>0.0000</COMISSAOREPRES>	"  + 
		" <CODCPG>29</CODCPG>	"  + 
		" <VALORBRUTO>"+VALORBRUTO+"</VALORBRUTO>	"  + 
		" <VALORLIQUIDO>"+VALORBRUTO+"</VALORLIQUIDO>	"  + 
		" <VALOROUTROS>"+VALORBRUTO+"</VALOROUTROS>	"  + 
		" <PERCENTUALFRETE>0.0000</PERCENTUALFRETE>	"  + 
		" <VALORFRETE>0.0000</VALORFRETE>	"  + 
		" <PERCENTUALSEGURO>0.0000</PERCENTUALSEGURO>	"  + 
		" <VALORSEGURO>0.0000</VALORSEGURO>	"  + 
		" <PERCENTUALDESC>0.0000</PERCENTUALDESC>	"  + 
		" <VALORDESC>0.0000</VALORDESC>	"  + 
		" <PERCENTUALDESP>0.0000</PERCENTUALDESP>	"  + 
		" <VALORDESP>0.0000</VALORDESP>	"  + 
		" <PERCCOMISSAO>0.0000</PERCCOMISSAO>	"  + 
		" <PESOLIQUIDO>0.0000</PESOLIQUIDO>	"  + 
		" <PESOBRUTO>0.0000</PESOBRUTO>	"  + 
		" <CODTB1FLX>01.015</CODTB1FLX>	"  + 
		" <CODTB2FLX>PCR</CODTB2FLX>	"  + 
		" <IDMOVLCTFLUXUS>-1</IDMOVLCTFLUXUS>	"  + 
		" <CODMOEVALORLIQUIDO>R$</CODMOEVALORLIQUIDO>	"  + 
		" <DATAMOVIMENTO>"+DTDESPESAFORMAT+"T00:00:00</DATAMOVIMENTO>	"  + 
		" <NUMEROLCTGERADO>1</NUMEROLCTGERADO>	"  + 
		" <GEROUFATURA>0</GEROUFATURA>	"  + 
		" <NUMEROLCTABERTO>1</NUMEROLCTABERTO>	"  + 
		" <CODCFOAUX>"+CODCFO+"</CODCFOAUX>	"  + 
		" <CODCCUSTO>"+CODCCUSTO+"</CODCCUSTO>	"  + 
		" <PERCCOMISSAOVEN2>0.0000</PERCCOMISSAOVEN2>	"  + 
		" <CODCOLCFO>1</CODCOLCFO>	"  + 
		" <CODUSUARIO>"+SOLICITANTE+"</CODUSUARIO>	"  + 
		" <CODFILIALDESTINO>"+CODFILIAL+"</CODFILIALDESTINO>	"  + 
		" <GERADOPORLOTE>0</GERADOPORLOTE>	"  + 
		" <CODEVENTO>39</CODEVENTO>	"  + 
		" <STATUSEXPORTCONT>1</STATUSEXPORTCONT>	"  + 
		" <CODLOTE>1235</CODLOTE>	"  + 
		" <GEROUCONTATRABALHO>0</GEROUCONTATRABALHO>	"  + 
		" <GERADOPORCONTATRABALHO>0</GERADOPORCONTATRABALHO>	"  + 
		" <HORULTIMAALTERACAO>"+HOJE+"</HORULTIMAALTERACAO>	"  + 
		" <INDUSOOBJ>0.00</INDUSOOBJ>	"  + 
		" <CONTABILIZADOPORTOTAL>0</CONTABILIZADOPORTOTAL>	"  + 
		" <INTEGRADOBONUM>0</INTEGRADOBONUM>	"  + 
		" <FLAGPROCESSADO>0</FLAGPROCESSADO>	"  + 
		" <ABATIMENTOICMS>0.0000</ABATIMENTOICMS>	"  + 
		" <HORARIOEMISSAO>"+HOJE+"</HORARIOEMISSAO>	"  + 
		" <USUARIOCRIACAO>"+SOLICITANTE+"</USUARIOCRIACAO>	"  + 
		" <DATACRIACAO>"+HOJE+"</DATACRIACAO>	"  + 
		" <STSEMAIL>0</STSEMAIL>	"  + 
		" <VALORBRUTOINTERNO>"+VALORBRUTO+"</VALORBRUTOINTERNO>	"  + 
		" <VINCULADOESTOQUEFL>0</VINCULADOESTOQUEFL>	"  + 
		" <VRBASEINSSOUTRAEMPRESA>0.0000</VRBASEINSSOUTRAEMPRESA>	"  + 
		" <VALORDESCCONDICIONAL>0.0000</VALORDESCCONDICIONAL>	"  + 
		" <VALORDESPCONDICIONAL>0.0000</VALORDESPCONDICIONAL>	"  + 
		" <CONTORCAMENTOANTIGO>0</CONTORCAMENTOANTIGO>	"  + 
		" <DATACONTABILIZACAO>"+DTDESPESAFORMAT+"T00:00:00</DATACONTABILIZACAO>	"  + 
		" <INTEGRADOAUTOMACAO>0</INTEGRADOAUTOMACAO>	"  + 
		" <INTEGRAAPLICACAO>T</INTEGRAAPLICACAO>	"  + 
		" <DATALANCAMENTO>"+HOJE+"</DATALANCAMENTO>	"  + 
		" <EXTENPORANEO>0</EXTENPORANEO>	"  + 
		" <RECIBONFESTATUS>0</RECIBONFESTATUS>	"  + 
		" <IDMOVCFO>9843</IDMOVCFO>	"  + 
		" <VALORMERCADORIAS>0.0000</VALORMERCADORIAS>	"  + 
		" <USARATEIOVALORFIN>0</USARATEIOVALORFIN>	"  + 
		" <CODCOLCFOAUX>1</CODCOLCFOAUX>	"  + 
		" <VALORRATEIOLAN>"+VALORBRUTO+"</VALORRATEIOLAN>	"  + 
		" <HISTORICOLONGO>"+HISTORICO+"</HISTORICOLONGO>	"  + 
		" <RATEIOCCUSTODEPTO>"+VALORBRUTO+"</RATEIOCCUSTODEPTO>	"  + 
		" <VALORBRUTOORIG>"+VALORBRUTO+"</VALORBRUTOORIG>	"  + 
		" <VALORLIQUIDOORIG>"+VALORBRUTO+"</VALORLIQUIDOORIG>	"  + 
		" <VALOROUTROSORIG>"+VALORBRUTO+"</VALOROUTROSORIG>	"  + 
		" <VALORRATEIOLANORIG>"+VALORBRUTO+"</VALORRATEIOLANORIG>	"  + 
		" <FLAGCONCLUSAO>0</FLAGCONCLUSAO>	"  + 
		" <STATUSPARADIGMA>N</STATUSPARADIGMA>	"  + 
		" <STATUSINTEGRACAO>N</STATUSINTEGRACAO>	"  + 
		" <RECCREATEDBY>"+SOLICITANTE+"</RECCREATEDBY>	"  + 
		" <RECCREATEDON>"+HOJE+"</RECCREATEDON>	"  + 
		" <RECMODIFIEDBY>"+SOLICITANTE+"</RECMODIFIEDBY>	"  + 
		" <RECMODIFIEDON>"+HOJE+"</RECMODIFIEDON>	"  + 
		" <STATUSMOVINCLUSAOCOLAB>0</STATUSMOVINCLUSAOCOLAB>	"  + 
		" <CODCOLIGADA1>1</CODCOLIGADA1>	"  + 
		" <IDMOVHST>-1</IDMOVHST>	"  + 
		"	  </TMOV>	"  + 
		"	  <TNFE>	"  + 
		" <CODCOLIGADA>1</CODCOLIGADA>	"  + 
		" <IDMOV>-1</IDMOV>	"  + 
		" <VALORSERVICO>0.0000</VALORSERVICO>	"  + 
		" <DEDUCAOSERVICO>0.0000</DEDUCAOSERVICO>	"  + 
		" <ALIQUOTAISS>0.0000</ALIQUOTAISS>	"  + 
		" <ISSRETIDO>0</ISSRETIDO>	"  + 
		" <VALORISS>0.0000</VALORISS>	"  + 
		" <VALORCREDITOIPTU>0.0000</VALORCREDITOIPTU>	"  + 
		" <BASEDECALCULO>0.0000</BASEDECALCULO>	"  + 
		" <EDITADO>0</EDITADO>	"  + 
		" <RECCREATEDBY>"+SOLICITANTE+"</RECCREATEDBY>	"  + 
		" <RECCREATEDON>"+HOJE+"</RECCREATEDON>	"  + 
		" <RECMODIFIEDBY>"+SOLICITANTE+"</RECMODIFIEDBY>	"  + 
		" <RECMODIFIEDON>"+HOJE+"</RECMODIFIEDON>	"  + 
		"	  </TNFE>	"  + 
		"	  <TMOVFISCAL>	"  + 
		" <CODCOLIGADA>1</CODCOLIGADA>	"  + 
		" <IDMOV>-1</IDMOV>	"  + 
		" <CONTRIBUINTECREDENCIADO>0</CONTRIBUINTECREDENCIADO>	"  + 
		" <OPERACAOCONSUMIDORFINAL>0</OPERACAOCONSUMIDORFINAL>	"  + 
		" <OPERACAOPRESENCIAL>0</OPERACAOPRESENCIAL>	"  + 
		" <RECCREATEDBY>"+SOLICITANTE+"</RECCREATEDBY>	"  + 
		" <RECCREATEDON>"+HOJE+"</RECCREATEDON>	"  + 
		" <RECMODIFIEDBY>"+SOLICITANTE+"</RECMODIFIEDBY>	"  + 
		" <RECMODIFIEDON>"+HOJE+"</RECMODIFIEDON>	"  + 
		"	  </TMOVFISCAL>	"  + 
		"	  <TMOVRATCCU>	"  + 
		" <CODCOLIGADA>1</CODCOLIGADA>	"  + 
		" <IDMOV>-1</IDMOV>	"  + 
		" <CODCCUSTO>"+CODCCUSTO+"</CODCCUSTO>	"  + 
		" <VALOR>"+VALORBRUTO+"</VALOR>	"  + 
		" <IDMOVRATCCU>-1</IDMOVRATCCU>	"  + 
		"	  </TMOVRATCCU>	"; 
		
		if (VLTRANSP > 1 ){
			XML = XML + 
			"	  <TITMMOV>	"  + 
			" <CODCOLIGADA>1</CODCOLIGADA>	"  + 
			" <IDMOV>-1</IDMOV>	"  + 
			" <NSEQITMMOV>1</NSEQITMMOV>	"  + 
			" <CODFILIAL>"+CODFILIAL+"</CODFILIAL>	"  + 
			" <NUMEROSEQUENCIAL>1</NUMEROSEQUENCIAL>	"  + 
			" <IDPRD>15236</IDPRD>	"  + 
			" <CODIGOPRD>09.30.0128</CODIGOPRD>	"  + 
			" <NOMEFANTASIA>REEMBOLSO DE DESPESA C/ TRANSPORTE(TAXI/ONIBUS/ETC)</NOMEFANTASIA>	"  + 
			" <CODIGOREDUZIDO>15236</CODIGOREDUZIDO>	"  + 
			" <NUMNOFABRIC>09.30.0127</NUMNOFABRIC>	"  + 
			" <QUANTIDADE>1.0000</QUANTIDADE>	"  + 
			" <PRECOUNITARIO>"+VLTRANSP+"</PRECOUNITARIO>	"  + 
			" <PRECOTABELA>0.0000</PRECOTABELA>	"  + 
			" <DATAEMISSAO>"+DTDESPESAFORMAT+"T00:00:00</DATAEMISSAO>	"  + 
			" <CODTB1FLX>01.015</CODTB1FLX>	"  + 
			" <CODUND>SERV</CODUND>	"  + 
			" <QUANTIDADEARECEBER>1.0000</QUANTIDADEARECEBER>	"  + 
			" <VALORUNITARIO>0.0000</VALORUNITARIO>	"  + 
			" <VALORFINANCEIRO>0.0000</VALORFINANCEIRO>	"  + 
			" <CODCCUSTO>"+CODCCUSTO+"</CODCCUSTO>	"  + 
			" <ALIQORDENACAO>0.0000</ALIQORDENACAO>	"  + 
			" <QUANTIDADEORIGINAL>1.0000</QUANTIDADEORIGINAL>	"  + 
			" <FLAG>0</FLAG>	"  + 
			" <BLOCK>0</BLOCK>	"  + 
			" <FATORCONVUND>0.0000</FATORCONVUND>	"  + 
			" <VLTRANSPITEM>"+VLTRANSP+"</VLTRANSPITEM>	"  + 
			" <VALORTOTALITEM>"+VLTRANSP+"</VALORTOTALITEM>	"  + 
			" <QUANTIDADESEPARADA>0.0000</QUANTIDADESEPARADA>	"  + 
			" <PERCENTCOMISSAO>0.0000</PERCENTCOMISSAO>	"  + 
			" <COMISSAOREPRES>0.0000</COMISSAOREPRES>	"  + 
			" <VALORESCRITURACAO>0.0000</VALORESCRITURACAO>	"  + 
			" <VALORFINPEDIDO>0.0000</VALORFINPEDIDO>	"  + 
			" <VALOROPFRM1>0.0000</VALOROPFRM1>	"  + 
			" <VALOROPFRM2>0.0000</VALOROPFRM2>	"  + 
			" <PRECOEDITADO>1</PRECOEDITADO>	"  + 
			" <QTDEVOLUMEUNITARIO>1</QTDEVOLUMEUNITARIO>	"  + 
			" <PRECOTOTALEDITADO>0</PRECOTOTALEDITADO>	"  + 
			" <VALORDESCCONDICONALITM>0.0000</VALORDESCCONDICONALITM>	"  + 
			" <VALORDESPCONDICIONALITM>0.0000</VALORDESPCONDICIONALITM>	"  + 
			" <DATAORCAMENTO>"+DTDESPESAFORMAT+"T00:00:00</DATAORCAMENTO>	"  + 
			" <CODTBORCAMENTO>3.2.02.01.005</CODTBORCAMENTO>	"  + 
			" <CODCOLTBORCAMENTO>1</CODCOLTBORCAMENTO>	"  + 
			" <VALORUNTORCAMENTO>"+VLTRANSP+"</VALORUNTORCAMENTO>	"  + 
			" <VALSERVICONFE>0.0000</VALSERVICONFE>	"  + 
			" <CODLOC>0"+CODFILIAL+"</CODLOC>	"  + 
			" <VALORBEM>0.0000</VALORBEM>	"  + 
			" <VALORLIQUIDO>"+VLTRANSP+"</VALORLIQUIDO>	"  + 
			" <RATEIOCCUSTODEPTO>"+VLTRANSP+"</RATEIOCCUSTODEPTO>	"  + 
			" <VLTRANSPITEMORIG>"+VLTRANSP+"</VLTRANSPITEMORIG>	"  + 
			" <QUANTIDADETOTAL>1.0000</QUANTIDADETOTAL>	"  + 
			" <PRODUTOSUBSTITUTO>0</PRODUTOSUBSTITUTO>	"  + 
			" <PRECOUNITARIOSELEC>0</PRECOUNITARIOSELEC>	"  + 
			" <INTEGRAAPLICACAO>T</INTEGRAAPLICACAO>	"  + 
			" <RECCREATEDBY>"+SOLICITANTE+"</RECCREATEDBY>	"  + 
			" <RECCREATEDON>"+HOJE+"</RECCREATEDON>	"  + 
			" <RECMODIFIEDBY>"+SOLICITANTE+"</RECMODIFIEDBY>	"  + 
			" <RECMODIFIEDON>"+HOJE+"</RECMODIFIEDON>	"  + 
			" <CODCOLIGADA1>1</CODCOLIGADA1>	"  + 
			" <IDMOVHST>-1</IDMOVHST>	"  + 
			" <NSEQITMMOV1>1</NSEQITMMOV1>	"  + 
			"	  </TITMMOV>	"; 
		}
		
		if (VLALIMENT > 1) {
			XML = XML + 
			"	  <TITMMOV>	"  + 
			" <CODCOLIGADA>1</CODCOLIGADA>	"  + 
			" <IDMOV>-1</IDMOV>	"  + 
			" <NSEQITMMOV>2</NSEQITMMOV>	"  + 
			" <CODFILIAL>"+CODFILIAL+"</CODFILIAL>	"  + 
			" <NUMEROSEQUENCIAL>1</NUMEROSEQUENCIAL>	"  + 
			" <IDPRD>15237</IDPRD>	"  + 
			" <CODIGOPRD>09.30.0128</CODIGOPRD>	"  + 
			" <NOMEFANTASIA>REEMBOLSO DE DESPESA C/ ALIMENTAÇÃO</NOMEFANTASIA>	"  + 
			" <CODIGOREDUZIDO>15237</CODIGOREDUZIDO>	"  + 
			" <NUMNOFABRIC>09.30.0128</NUMNOFABRIC>	"  + 
			" <QUANTIDADE>1.0000</QUANTIDADE>	"  + 
			" <PRECOUNITARIO>"+VLALIMENT+"</PRECOUNITARIO>	"  + 
			" <PRECOTABELA>0.0000</PRECOTABELA>	"  + 
			" <DATAEMISSAO>"+DTDESPESAFORMAT+"T00:00:00</DATAEMISSAO>	"  + 
			" <CODTB1FLX>01.015</CODTB1FLX>	"  + 
			" <CODUND>SERV</CODUND>	"  + 
			" <QUANTIDADEARECEBER>1.0000</QUANTIDADEARECEBER>	"  + 
			" <VALORUNITARIO>0.0000</VALORUNITARIO>	"  + 
			" <VALORFINANCEIRO>0.0000</VALORFINANCEIRO>	"  + 
			" <CODCCUSTO>"+CODCCUSTO+"</CODCCUSTO>	"  + 
			" <ALIQORDENACAO>0.0000</ALIQORDENACAO>	"  + 
			" <QUANTIDADEORIGINAL>1.0000</QUANTIDADEORIGINAL>	"  + 
			" <FLAG>0</FLAG>	"  + 
			" <BLOCK>0</BLOCK>	"  + 
			" <FATORCONVUND>0.0000</FATORCONVUND>	"  + 
			" <VLTRANSPITEM>"+VLALIMENT+"</VLTRANSPITEM>	"  + 
			" <VALORTOTALITEM>"+VLALIMENT+"</VALORTOTALITEM>	"  + 
			" <QUANTIDADESEPARADA>0.0000</QUANTIDADESEPARADA>	"  + 
			" <PERCENTCOMISSAO>0.0000</PERCENTCOMISSAO>	"  + 
			" <COMISSAOREPRES>0.0000</COMISSAOREPRES>	"  + 
			" <VALORESCRITURACAO>0.0000</VALORESCRITURACAO>	"  + 
			" <VALORFINPEDIDO>0.0000</VALORFINPEDIDO>	"  + 
			" <VALOROPFRM1>0.0000</VALOROPFRM1>	"  + 
			" <VALOROPFRM2>0.0000</VALOROPFRM2>	"  + 
			" <PRECOEDITADO>1</PRECOEDITADO>	"  + 
			" <QTDEVOLUMEUNITARIO>1</QTDEVOLUMEUNITARIO>	"  + 
			" <PRECOTOTALEDITADO>0</PRECOTOTALEDITADO>	"  + 
			" <VALORDESCCONDICONALITM>0.0000</VALORDESCCONDICONALITM>	"  + 
			" <VALORDESPCONDICIONALITM>0.0000</VALORDESPCONDICIONALITM>	"  + 
			" <DATAORCAMENTO>"+DTDESPESAFORMAT+"T00:00:00</DATAORCAMENTO>	"  + 
			" <CODTBORCAMENTO>3.2.02.02.009</CODTBORCAMENTO>	"  + 
			" <CODCOLTBORCAMENTO>1</CODCOLTBORCAMENTO>	"  + 
			" <VALORUNTORCAMENTO>"+VLALIMENT+"</VALORUNTORCAMENTO>	"  + 
			" <VALSERVICONFE>0.0000</VALSERVICONFE>	"  + 
			" <CODLOC>0"+CODFILIAL+"</CODLOC>	"  + 
			" <VALORBEM>0.0000</VALORBEM>	"  + 
			" <VALORLIQUIDO>"+VLALIMENT+"</VALORLIQUIDO>	"  + 
			" <RATEIOCCUSTODEPTO>"+VLALIMENT+"</RATEIOCCUSTODEPTO>	"  + 
			" <VLTRANSPITEMORIG>"+VLALIMENT+"</VLTRANSPITEMORIG>	"  + 
			" <QUANTIDADETOTAL>1.0000</QUANTIDADETOTAL>	"  + 
			" <PRODUTOSUBSTITUTO>0</PRODUTOSUBSTITUTO>	"  + 
			" <PRECOUNITARIOSELEC>0</PRECOUNITARIOSELEC>	"  + 
			" <INTEGRAAPLICACAO>T</INTEGRAAPLICACAO>	"  + 
			" <RECCREATEDBY>"+SOLICITANTE+"</RECCREATEDBY>	"  + 
			" <RECCREATEDON>"+HOJE+"</RECCREATEDON>	"  + 
			" <RECMODIFIEDBY>"+SOLICITANTE+"</RECMODIFIEDBY>	"  + 
			" <RECMODIFIEDON>"+HOJE+"</RECMODIFIEDON>	"  + 
			" <CODCOLIGADA1>1</CODCOLIGADA1>	"  + 
			" <IDMOVHST>-1</IDMOVHST>	"  + 
			" <NSEQITMMOV1>2</NSEQITMMOV1>	"  + 
			"	  </TITMMOV>	";
		}
		
		if (VLTRANSP > 1) {
			XML = XML + 
			"	  <TITMMOVRATCCU>	"  + 
			" <CODCOLIGADA>1</CODCOLIGADA>	"  + 
			" <IDMOV>-1</IDMOV>	"  + 
			" <NSEQITMMOV>1</NSEQITMMOV>	"  + 
			" <CODCCUSTO>"+CODCCUSTO+"</CODCCUSTO>	"  + 
			" <VALOR>"+VLTRANSP+"</VALOR>	"  + 
			" <IDMOVRATCCU>-1</IDMOVRATCCU>	"  + 
			"	  </TITMMOVRATCCU>	";
		}
				
		if (VLALIMENT > 1) {
			XML = XML + 
			"	  <TITMMOVRATCCU>	"  + 
			" <CODCOLIGADA>1</CODCOLIGADA>	"  + 
			" <IDMOV>-1</IDMOV>	"  + 
			" <NSEQITMMOV>2</NSEQITMMOV>	"  + 
			" <CODCCUSTO>"+CODCCUSTO+"</CODCCUSTO>	"  + 
			" <VALOR>"+VLALIMENT+"</VALOR>	"  + 
			" <IDMOVRATCCU>-1</IDMOVRATCCU>	"  + 
			"	  </TITMMOVRATCCU>	";
		}
		
		XML = XML +
		"	  <TMOVCOMPL>	"  + 
		" <CODCOLIGADA>1</CODCOLIGADA>	"  + 
		" <IDMOV>-1</IDMOV>	"  + 
		" <RECCREATEDBY>"+SOLICITANTE+"</RECCREATEDBY>	"  + 
		" <RECCREATEDON>"+HOJE+"</RECCREATEDON>	"  + 
		" <RECMODIFIEDBY>"+SOLICITANTE+"</RECMODIFIEDBY>	"  + 
		" <RECMODIFIEDON>"+HOJE+"</RECMODIFIEDON>	"  + 
		" <CNCAUTORIZ>00</CNCAUTORIZ>	"  + 
		" <COMPROVANT>F</COMPROVANT>	"  + 
		" <COMPROVANTE>NAO</COMPROVANTE>	"  + 
		" <BCISS>0.0000</BCISS>	"  + 
		" <VREMP>0.0000</VREMP>	"  + 
		" <MULTAREC>0.0000</MULTAREC>	"  + 
		"	  </TMOVCOMPL>	";
		
		if (VLTRANSP > 1) {
			XML = XML +
			"	  <TITMMOVCOMPL>	"  + 
			" <CODCOLIGADA>1</CODCOLIGADA>	"  + 
			" <IDMOV>-1</IDMOV>	"  + 
			" <NSEQITMMOV>1</NSEQITMMOV>	"  + 
			" <RECCREATEDBY>"+SOLICITANTE+"</RECCREATEDBY>	"  + 
			" <RECCREATEDON>"+HOJE+"</RECCREATEDON>	"  + 
			" <RECMODIFIEDBY>"+SOLICITANTE+"</RECMODIFIEDBY>	"  + 
			" <RECMODIFIEDON>"+HOJE+"</RECMODIFIEDON>	"  + 
			" <SERVICO>0.0000</SERVICO>	"  + 
			"	  </TITMMOVCOMPL>	";
		}
		
		if (VLALIMENT > 1) {
			XML = XML +
			"	  <TITMMOVCOMPL>	"  + 
			" <CODCOLIGADA>1</CODCOLIGADA>	"  + 
			" <IDMOV>-1</IDMOV>	"  + 
			" <NSEQITMMOV>2</NSEQITMMOV>	"  + 
			" <RECCREATEDBY>"+SOLICITANTE+"</RECCREATEDBY>	"  + 
			" <RECCREATEDON>"+HOJE+"</RECCREATEDON>	"  + 
			" <RECMODIFIEDBY>"+SOLICITANTE+"</RECMODIFIEDBY>	"  + 
			" <RECMODIFIEDON>"+HOJE+"</RECMODIFIEDON>	"  + 
			" <SERVICO>0.0000</SERVICO>	"  + 
			"	  </TITMMOVCOMPL>	";
		}
			
		
		XML = XML +
		"	  <TMOVTRANSP>	"  + 
		" <CODCOLIGADA>1</CODCOLIGADA>	"  + 
		" <IDMOV>-1</IDMOV>	"  + 
		" <RETIRAMERCADORIA>0</RETIRAMERCADORIA>	"  + 
		" <TIPOCTE>0</TIPOCTE>	"  + 
		" <TOMADORTIPO>0</TOMADORTIPO>	"  + 
		" <TIPOEMITENTEMDFE>0</TIPOEMITENTEMDFE>	"  + 
		" <LOTACAO>1</LOTACAO>	"  + 
		" <TIPOTRANSPORTADORMDFE>0</TIPOTRANSPORTADORMDFE>	"  + 
		" <TIPOBPE>0</TIPOBPE>	"  + 
		" <RECCREATEDBY>"+SOLICITANTE+"</RECCREATEDBY>	"  + 
		" <RECCREATEDON>"+HOJE+"</RECCREATEDON>	"  + 
		" <RECMODIFIEDBY>"+SOLICITANTE+"</RECMODIFIEDBY>	"  + 
		" <RECMODIFIEDON>"+HOJE+"</RECMODIFIEDON>	"  + 
		"	  </TMOVTRANSP>	"  + 
		"	  <TCTRCMOV>	"  + 
		" <CODCOLIGADA>1</CODCOLIGADA>	"  + 
		" <IDMOV>-1</IDMOV>	"  + 
		" <VALORNOTAS>0.0000</VALORNOTAS>	"  + 
		" <VALORRATEADO>0.0000</VALORRATEADO>	"  + 
		" <QUANTIDADENOTAS>0</QUANTIDADENOTAS>	"  + 
		" <QUANTIDADERATEADAS>0</QUANTIDADERATEADAS>	"  + 
		" <RECCREATEDBY>"+SOLICITANTE+"</RECCREATEDBY>	"  + 
		" <RECCREATEDON>"+HOJE+"</RECCREATEDON>	"  + 
		" <RECMODIFIEDBY>"+SOLICITANTE+"</RECMODIFIEDBY>	"  + 
		" <RECMODIFIEDON>"+HOJE+"</RECMODIFIEDON>	"  + 
		"	  </TCTRCMOV>	"; 
		
		
		if (VLTRANSP > 1) {
			XML = XML +
			"	  <TITMMOVFISCAL>	"  + 
			" <CODCOLIGADA>1</CODCOLIGADA>	"  + 
			" <IDMOV>-1</IDMOV>	"  + 
			" <NSEQITMMOV>1</NSEQITMMOV>	"  + 
			" <QTDECONTRATADA>0.0000</QTDECONTRATADA>	"  + 
			" <VLRTOTTRIB>0.0000</VLRTOTTRIB>	"  + 
			" <AQUISICAOPAA>0</AQUISICAOPAA>	"  + 
			" <RECCREATEDBY>"+SOLICITANTE+"</RECCREATEDBY>	"  + 
			" <RECCREATEDON>"+HOJE+"</RECCREATEDON>	"  + 
			" <RECMODIFIEDBY>"+SOLICITANTE+"</RECMODIFIEDBY>	"  + 
			" <RECMODIFIEDON>"+HOJE+"</RECMODIFIEDON>	"  + 
			"	  </TITMMOVFISCAL>	";
		}
			
		
		if (VLALIMENT > 1) {
			XML = XML +
			"	  <TITMMOVFISCAL>	"  + 
			" <CODCOLIGADA>1</CODCOLIGADA>	"  + 
			" <IDMOV>-1</IDMOV>	"  + 
			" <NSEQITMMOV>2</NSEQITMMOV>	"  + 
			" <QTDECONTRATADA>0.0000</QTDECONTRATADA>	"  + 
			" <VLRTOTTRIB>0.0000</VLRTOTTRIB>	"  + 
			" <AQUISICAOPAA>0</AQUISICAOPAA>	"  + 
			" <RECCREATEDBY>"+SOLICITANTE+"</RECCREATEDBY>	"  + 
			" <RECCREATEDON>"+HOJE+"</RECCREATEDON>	"  + 
			" <RECMODIFIEDBY>"+SOLICITANTE+"</RECMODIFIEDBY>	"  + 
			" <RECMODIFIEDON>"+HOJE+"</RECMODIFIEDON>	"  + 
			"	  </TITMMOVFISCAL>	";
		}
		
		XML = XML + "</MovMovimento>";
		 
		log.info("CUSTOM: geraXML"+XML );
		 
		return XML;
			      
			}  
	
