function createDataset(fields, constraints, sortFields) {
    var newDataset = DatasetBuilder.newDataset();
    log.info("QUERY: " + myQuery);
    var dataSource = "/jdbc/FluigRM";
    var ic = new javax.naming.InitialContext();
    var ds = ic.lookup(dataSource);
    var created = false;
    var myQuery = "SELECT * FROM _Fluig_FILIAL";
    try {
        var conn = ds.getConnection();
        var stmt = conn.createStatement();
        var rs = stmt.executeQuery(myQuery);
        var columnCount = rs.getMetaData().getColumnCount();
        while (rs.next()) {
            if (!created) {
                for (var i = 1; i <= columnCount; i++) {
                    newDataset.addColumn(rs.getMetaData().getColumnName(i));
                }
                created = true;
            }
            var Arr = new Array();
            for (var i = 1; i <= columnCount; i++) {
                var obj = rs.getObject(rs.getMetaData().getColumnName(i));
                if (null != obj) {
                    Arr[i - 1] = rs.getObject(rs.getMetaData().getColumnName(i)).toString();
                } else {
                    Arr[i - 1] = "null";
                }
            }
            newDataset.addRow(Arr);
        }
    } catch (e) {
        log.error("ERRO==============> " + e.message);
    } finally {
        if (stmt != null) {
            stmt.close();
        }
        if (conn != null) {
            conn.close();
        }
    }
    return newDataset;
}

/*
function defineStructure() {

}
function onSync(lastSyncDate) {

}
function createDataset(fields, constraints, sortFields) {

}function onMobileSync(user) {

}
*/