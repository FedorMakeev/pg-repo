const {executeSQL} = require("./dmlService");

/**
 * Get all columns in given table
 * @param table - table name
 * @returns {Promise<unknown>}
 */
exports.getColumns = async (table) => {
    return executeSQL({
        text: "select * from information_schema.columns where table_schema = 'public' and table_name = $1",
        values: [table]
    })
}

/**
 * Get all indices in given table
 * @param table - table name
 * @returns {Promise<unknown>}
 */
exports.getIndices = async (table) => {
    return executeSQL({
        text: "select indexname, indexdef from pg_indexes where tablename = $1",
        values: [table]
    })
}