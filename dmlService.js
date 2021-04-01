/**
 * Execute random SQL and returns a ResultSet. Manage connection at the same time.
 * @param query - query object {text: 'select * from', values: [1,2,3]}
 * @param errorMessage - error text message for logs
 * @returns {Promise<unknown>}
 */
const {getPool} = require("./poolService");

const _executeSQL = async (query, errorMessage = `Can't get result set by query`) => {
    return new Promise(async (resolve, reject) => {
        const connection = await (await getPool()).connect()
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

exports.executeSQL = async (query, p2, p3) => {
    if (Array.isArray(p2)){
        return _executeSQL({text: query, values: p2}, p3);
    } else {
        return _executeSQL(query, p2);
    }
}

/**
 * Simple wrapper for pool.connect()
 * @returns {Promise<*>}
 */
exports.getConnection = async () => {
    return (await getPool()).connect();
}