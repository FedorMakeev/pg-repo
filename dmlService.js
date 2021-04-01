/**
 * Execute random SQL and returns a ResultSet. Manage connection at the same time.
 * @param query - query object {text: 'select * from', values: [1,2,3]}
 * @param errorMessage - error text message for logs
 * @returns {Promise<unknown>}
 */
const {getPool} = require("./poolService");

const _executeSQL = async (query, errorMessage = `Can't get result set by query`, mode = 'master') => {
    return new Promise(async (resolve, reject) => {
        const connection = await (await getPool(mode)).connect()
            .then(connection => {
                connection.query(query)
                    .then(resultset => resolve(resultset.rows))
                    .catch(e => {
                        console.log(`${errorMessage} - ${e}`);
                        reject(e);
                    })
                    .finally(() => connection.release());
            })
            .catch(e => reject(e));
    });
}

/**
 * @param query - exact SQL text or object {text, values}
 * @param p2 - if array then - array of values for @param query
 * @param p3 - Error message or server mode master|replica
 * @param p4 - server mode master|replica (ignored if @param p2 is an array)
 * @returns {Promise<unknown>}
 */
exports.executeSQL = async (query, p2, p3, p4) => {
    if (Array.isArray(p2)) {
        return _executeSQL({text: query, values: p2}, p3, p4);
    } else {
        return _executeSQL(query, p2, p3);
    }
}

/**
 * Simple wrapper for pool.connect()
 * @returns {Promise<*>}
 */
exports.getConnection = async () => {
    return (await getPool()).connect();
}