USE [Corporerm_homolog]
GO

/****** Object:  View [dbo].[_Fluig_PRODUTO]    Script Date: 16/06/2020 18:20:25 ******/
SET ANSI_NULLS OFF
GO

SET QUOTED_IDENTIFIER OFF
GO



CREATE VIEW [dbo].[_Fluig_PRODUTO] AS

SELECT CODIGOPRD+' - '+NOMEFANTASIA AS COD_NOME, NOMEFANTASIA FROM TPRD WHERE INATIVO=0 AND ULTIMONIVEL=1

GO

