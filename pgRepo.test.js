const pgRepo = require('./pgRepo');

it('pgRepo ', function () {
    expect(pgRepo.ensureTables).toBeDefined();
    expect(pgRepo.getConnection).toBeDefined();
    expect(pgRepo.executeSQL).toBeDefined();
});
