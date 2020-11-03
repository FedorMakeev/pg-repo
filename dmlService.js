const {Pool} = require('pg')

const pool = new Pool();

/**
 * Execute random SQL and returns a ResultSet. Manage connection at the same time.
 * @param query - query object {text: 'select * from', values: [1,2,3]}
 * @param errorMessage - error text message for logs
 * @returns {Promise<unknown>}
 */
exports.executeSQL = async (query, errorMessage = `Can't get result set by query`) => {
    return new Promise(async (resolve, reject) => {
        const connection = await pool.connect()
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
 * Simple wrapper for pool.connect()
 * @returns {Promise<*>}
 */
exports.getConnection = async () => {
    return pool.connect();
}