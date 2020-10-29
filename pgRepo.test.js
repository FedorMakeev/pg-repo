jest.setTimeout(100000);
const testRows = [{test: 'Hello'}];
const mockQuery = jest.fn();
const mockRelease = jest.fn();
const mockConnect = jest.fn();

function mockPool() {
    this.connect = mockConnect;
}

jest.mock('pg', () => {
    return {
        Pool: mockPool,
    }
})

const {executeSQL, getConnection} = require("./pgRepo");

beforeEach(() => {
    jest.resetAllMocks();
})

test('Test PG Pool', () => {
    expect(new mockPool()).toBeDefined();
})

/**
 * Happy path:
 * Test that method respond with correct resultset (defined for connection.query())
 * and connection managed correctly (open & closed)
 */
test('Mocked pool: success', async (ok) => {
    mockConnect.mockResolvedValue({query: mockQuery, release: mockRelease});
    mockQuery.mockResolvedValue({rows: testRows})
    const data = await executeSQL({text: 'Test SQL'})
    expect(data).toEqual(testRows);
    expect(mockQuery).toBeCalled();
    // надо подождать пока вызовется release
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(mockRelease).toBeCalled();
    ok();
})

/**
 * Unhappy path: query problems
 * Test that query error leads to correctly rejected Promise
 * and connection is closed correctly
 */
test('Mocked pool: query failed', async (ok) => {
    mockConnect.mockResolvedValue({query: mockQuery, release: mockRelease});
    mockQuery.mockRejectedValue(new Error('Manual query error'));
    executeSQL({text: 'Test SQL'})
        .then(() => ok.fail(new Error('Test should fail')))
        .catch(async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
            expect(mockRelease).toBeCalled();
            ok();
        });
})

/**
 * Unhappy path: connection problems
 * Test that connection error leads to correctly rejected Promise
 */
test('Mocked pool: connection failed', async (ok) => {
    mockConnect.mockRejectedValue(new Error('Manual connection error'));
    executeSQL({text: 'Test SQL'})
        .then(() => ok.fail(new Error('Test should fail')))
        .catch(() => ok());
})

/**
 * Wrapper for pool.connect()
 */
test('Get connection', async (ok) => {
    const mockConnection = {tag: 'randomData'};
    mockConnect.mockResolvedValue(mockConnection);
    expect(await getConnection()).toEqual(mockConnection);
    expect(mockConnect).toBeCalledTimes(1);
    ok();
})