const {Pool} = require('pg');
const pools = [];

const isMaster = async (pool) => {
    const connection = await pool.connect()
    const rows = await connection.query('select pg_is_in_recovery()').then(r => r.rows);
    connection.release();
    return rows[0] && rows[0].pg_is_in_recovery === false;
}

let resolver;
const init = new Promise(resolve => {
    resolver = resolve;
});

const master = 'master';
const replica = 'replica';

(async () => {

    if (!!process.env.POSTGRESS_CLUSTER) {
        const hosts = process.env.POSTGRESS_CLUSTER.split(',');
        try {
            for (const host of hosts) {
                const [hostname, port] = host.split(':');

                const currentPool = new Pool({
                    host: hostname,
                    port: port || 6432
                })

                currentPool.pg_repo_mode = (await isMaster(currentPool)) ? master : replica;
                pools.push(currentPool)
            }

            setInterval(async () => {
                console.debug('PG-repo: Start checking pools');
                for (const pool of pools) {
                    pool.pg_repo_mode = (await isMaster(pool)) ? master : replica;
                }
                console.debug('PG-repo: Stop checking pools');
            }, 10_000);

        } catch (e) {
            console.error(e);
            const fallBackPool = new Pool();
            fallBackPool.pg_repo_mode = master;
            pools.unshift(fallBackPool);
        }
    } else {
        const defaultPool = new Pool();
        defaultPool.pg_repo_mode = master;
        pools.unshift(defaultPool);
    }
    resolver();
})()

module.exports.getPool = async (mode = master) => {
    await init;
    const a = pools.filter(p => p.pg_repo_mode === mode);
    if (a.length === 0 && mode !== master) {
        a.unshift(pools.filter(p => p.pg_repo_mode === master)[0]);
    }
    const rnd = Math.round(Math.random() * 100);
    return a[rnd % a.length];
}