require('dotenv').config();
const poolService = require('./poolService');

it('Should use correct max value', async (ok) => {
    const pool = await poolService.getPool('master');
    // await pool.connect();
    // const {totalCount, idleCount, } = pool;
    // console.log({totalCount})
    //
    // console.log(pool._pendingQueue.length);
    console.log(pool);
    expect(pool.options.max).toEqual(+process.env.PG_POOL_SIZE);

    ok();
})