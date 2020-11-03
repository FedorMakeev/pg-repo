const {getColumns, getIndices} = require("./metaService");
require('dotenv').config();

const {executeSQL} = require("./dmlService");
const {ensureTables} = require("./ddlService")

const getTables = async () => {
    return executeSQL("select tablename,tableowner\n" +
        "from pg_catalog.pg_tables\n" +
        "where schemaname = 'public'");
}

describe('Service creates required tables', () => {
    it('Creates table with requested columns and indices', async (ok) => {
        const ddlData = {
            test_table: {
                columns: [
                    {
                        name: 'id',
                        type: 'integer',
                        nullable: true
                    },
                    {
                        name: 'value',
                        type: 'text'
                    }
                ],
                indices: [
                    {
                        name: 'test_table_idx_01',
                        columns: ['id', 'value'],
                        unique: true,
                        type: 'btree'
                    },
                    {
                        name: 'test_table_idx_02',
                        columns: ['id'],
                        type: 'hash'
                    }
                ]
            }
        }

        await executeSQL('drop table "test_table"').catch(() => 'Who cares');

        const actual = await getTables();
        // check there is no such table at all
        for (const table of Object.keys(ddlData)) {
            expect(actual.filter(a => a.tablename === table).length).toBe(0);
        }
        await ensureTables(ddlData);

        const postActual = await getTables();
        // all required tables are in place
        for (const table of Object.keys(ddlData)) {
            expect(postActual.filter(a => a.tablename === table).length).toBe(1);
            // check columns created correctly
            const actualColumns = await getColumns(table);
            const ddlColumns = ddlData[table].columns;
            expect(actualColumns.length).toBe(ddlColumns.length);
            for (const dc of ddlColumns) {
                const actualColumn = actualColumns.filter(ac => ac.column_name === dc.name)[0];
                expect(actualColumn).toBeDefined();
                expect(actualColumn.data_type).toEqual(dc.type);
                expect(actualColumn.is_nullable).toEqual(!!dc.nullable ? 'YES' : 'NO');
            }

            const actualIndices = await getIndices(table);
            const ddlIndices = ddlData[table].indices;

            console.log("actualIndices");
            console.log(actualIndices);
            // console.log(ddlIndices);

            expect(actualIndices.length).toBe(ddlIndices.length);

        }
        ok();
    })
})