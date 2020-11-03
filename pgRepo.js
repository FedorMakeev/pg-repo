const {executeSQL, getConnection} = require('./dmlService');
const {ensureTables} = require('./ddlService');

exports = {executeSQL, getConnection, ensureTables}
