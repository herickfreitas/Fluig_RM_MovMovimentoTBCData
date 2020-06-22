USE [Corporerm_homolog]
GO

/****** Object:  View [dbo].[_Fluig_GED_TMOV]    Script Date: 16/06/2020 18:20:50 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO



CREATE VIEW [dbo].[_Fluig_GED_TMOV]

AS

SELECT SUBSTRING(CHAVERM,3,10) AS IDMOV , * FROM HCINTEGRACAOGED where DATASERVER='MovMovimentoData'
GO

