USE [Corporerm]
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


/* funcao retorna o autorizador da Gesta da CNC, conforme o centro de custo informado. */

CREATE FUNCTION [dbo].[Fluig_Autorizadores]  

( @CENTROCUSTO AS VARCHAR(17)) 

RETURNS varchar(17) 
AS

    BEGIN  
		
		DECLARE @Retorno AS VARCHAR(17)
	
		-- Atribuido valor na variável autorizador, para preenchimento do formulário  (SUBSTRING(@CENTROCUSTO,0,11)
    	if  (SUBSTRING(@CENTROCUSTO,0,12) = ('12.01.02.01'))
    		SELECT @Retorno = 'Pool:Group:w_SG' -- COMO SG - SIMONEGUIMARAES
    		
    	else if (@CENTROCUSTO = ('20.01.02.08.70080'))
    		SELECT @Retorno = 'Pool:Group:w_VPF' -- COMO VPF - LEANDROPINTO		
    	
    	else if (SUBSTRING(@CENTROCUSTO,0,9) = ('20.01.01'))
			SELECT @Retorno =  'Pool:Group:w_VPF' -- COMO VPF - LEANDROPINTO
    		
    	else if (SUBSTRING(@CENTROCUSTO,0,3) = ('12') OR SUBSTRING(@CENTROCUSTO,0,3) = ('13') 
			OR SUBSTRING(@CENTROCUSTO,0,3) = ('14') OR 	SUBSTRING(@CENTROCUSTO,0,3) = ('15') 
			OR SUBSTRING(@CENTROCUSTO,0,3) = ('16'))
    		SELECT @Retorno =  'Pool:Group:w_GP' -- COMO GP - LenouraSchmidt
    	
    	else if (SUBSTRING(@CENTROCUSTO,0,3) = ('11') OR SUBSTRING(@CENTROCUSTO,0,3) = ('18') 
			OR SUBSTRING(@CENTROCUSTO,0,3) = ('50') OR SUBSTRING(@CENTROCUSTO,0,3) = ('90') 
			OR SUBSTRING(@CENTROCUSTO,0,3) = ('99'))
    		SELECT @Retorno =  'Pool:Group:w_VPF' --// COMO VPF - LEANDROPINTO
    	
    	else
    		SELECT @Retorno =  'Pool:Group:w_SG' -- // COMO SG - SIMONEGUIMARAES
    	
		RETURN @Retorno 


    END

GO


