const mockExecuteSQL = jest.fn();
jest.mock('./dmlService', () => {
    return {
        executeSQL: mockExecuteSQL
    }
})
const {getColumns, getIndices, getConstraints} = require('./metaService');

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

    it('Get constraints', async () => {
        const table = 'someTable';
        await getConstraints(table);
        expect(mockExecuteSQL).toHaveBeenCalledWith({
                text: "SELECT con.*\n" +
                    "       FROM pg_catalog.pg_constraint con\n" +
                    "            INNER JOIN pg_catalog.pg_class rel\n" +
                    "                       ON rel.oid = con.conrelid\n" +
                    "            INNER JOIN pg_catalog.pg_namespace nsp\n" +
                    "                       ON nsp.oid = connamespace\n" +
                    "       WHERE nsp.nspname = 'public'\n" +
                    "             AND rel.relname = $1;",
                values: [table]
            }
        )
    })
})