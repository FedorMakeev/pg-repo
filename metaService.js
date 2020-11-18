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

/**
 * Get all constraints for given table
 * @param table
 * @returns {Promise<{}>}
 */
exports.getConstraints = async (table) => {
    return executeSQL({
        text: "SELECT con.*\n" +
            "       FROM pg_catalog.pg_constraint con\n" +
            "            INNER JOIN pg_catalog.pg_class rel\n" +
            "                       ON rel.oid = con.conrelid\n" +
            "            INNER JOIN pg_catalog.pg_namespace nsp\n" +
            "                       ON nsp.oid = connamespace\n" +
            "       WHERE nsp.nspname = 'public'\n" +
            "             AND rel.relname = $1;",
        values: [table]
    })
}