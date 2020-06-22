USE [Corporerm_homolog]
GO

/****** Object:  View [dbo].[_Fluig_FILIAL]    Script Date: 16/06/2020 18:22:17 ******/
SET ANSI_NULLS OFF
GO

SET QUOTED_IDENTIFIER OFF
GO




CREATE VIEW [dbo].[_Fluig_FILIAL] AS

SELECT 

	CODFILIAL
,	CONVERT(varchar(1),CODFILIAL)+' - '+NOMEFANTASIA AS NOMEFANTASIA
,	NOME


FROM GFILIAL(NOLOCK) 


GO

