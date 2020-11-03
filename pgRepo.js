const {executeSQL, getConnection} = require('./dmlService');
const {ensureTables} = require('./ddlService');

module.exports = {executeSQL, getConnection, ensureTables}
