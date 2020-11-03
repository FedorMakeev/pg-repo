const mockExecuteSQL = jest.fn();
jest.mock('./dmlService', () => {
    return {
        executeSQL: mockExecuteSQL
    }
})
const {getColumns, getIndices} = require('./metaService');

describe('Meta service', () => {
    it('Get columns', async () => {
        const table = 'someTable';
        await getColumns(table);
        expect(mockExecuteSQL).toHaveBeenCalledWith({
            text: "select * from information_schema.columns where table_schema = 'public' and table_name = $1",
            values: [table]
        });
    })

    it('Get indices', async () => {
        const table = 'someTable';
        await getIndices(table);
        expect(mockExecuteSQL).toHaveBeenCalledWith({
                text: "select indexname, indexdef from pg_indexes where tablename = $1",
                values: [table]
            }
        )
    })
})