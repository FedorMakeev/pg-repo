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

const {PG_REPO_DEBUG, PG_REPO_POOL_CHECK_INTERVAL} = process.env;
const pgdebug = (text) => PG_REPO_DEBUG && console.log(`PG-repo: ${text}`);
const poolCheckInterval = (!!PG_REPO_POOL_CHECK_INTERVAL && +PG_REPO_POOL_CHECK_INTERVAL > 999) ? +PG_REPO_POOL_CHECK_INTERVAL : 10_000;
pgdebug(JSON.stringify({poolCheckInterval}));

(async () => {

    if (!!process.env.POSTGRESS_CLUSTER) {
        pgdebug('cluster environment');
        const hosts = process.env.POSTGRESS_CLUSTER.split(',');
        try {
            for (const host of hosts) {
                const [hostname, port] = host.split(':');

                const currentPool = new Pool({
                    host: hostname,
                    port: port || 6432
                })

                currentPool.pg_repo_mode = (await isMaster(currentPool)) ? master : replica;
                pgdebug(`pool created ${hostname}:${port} ${currentPool.pg_repo_mode}`);
                pools.push(currentPool)
            }

            setInterval(async () => {
                pgdebug(`start checking ${pools.length} pools`);
                for (const pool of pools) {
                    pool.pg_repo_mode = (await isMaster(pool)) ? master : replica;
                }
                pgdebug('stop checking pools');
            }, poolCheckInterval);

        } catch (e) {
            console.error(e);
            const fallBackPool = new Pool();
            fallBackPool.pg_repo_mode = master;
            pools.unshift(fallBackPool);
        }
    } else {
        pgdebug('single host environment');
        const defaultPool = new Pool();
        defaultPool.pg_repo_mode = master;
        pools.unshift(defaultPool);
    }
    resolver();
})();

module.exports.getPool = async (mode = master) => {
    await init;
    const a = pools.filter(p => p.pg_repo_mode === mode);
    if (a.length === 0 && mode !== master) {
        a.unshift(pools.filter(p => p.pg_repo_mode === master)[0]);
    }
    const rnd = Math.round(Math.random() * 100);
    const pool = a[rnd % a.length];
    pgdebug(`pool requested/found ${mode}/${pool.pg_repo_mode}`);
    return pool;
}