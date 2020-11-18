const {getIndices, getColumns, getConstraints} = require("./metaService");
const {executeSQL} = require('./dmlService');

exports.ensureTables = async (ddlData) => {
    const schema = 'public'
    const actual = await executeSQL({
        text: 'select tablename, tableowner from pg_catalog.pg_tables where schemaname = $1',
        values: [schema]
    });
    for (const table of Object.keys(ddlData)) {
        if (actual.filter(t => t.tablename === table).length === 1) {
            console.log(`Table ${table} exists`);
            const actualColumns = await getColumns(table);
            const columnsToCreate = ddlData[table].columns.filter(dc => !(actualColumns.map(ac => ac.column_name).includes(dc.name)));
            if (columnsToCreate.length > 0) {
                for (const ctc of columnsToCreate) {
                    await executeSQL(`alter table ${schema}.${table} add column ${ctc.name} ${ctc.type} ${!ctc.nullable ? 'NOT NULL' : ''}`);
                    console.log(`Added column ${ctc.name} to table ${schema}.${table}`);
                }
            }
        } else {
            console.log(`Start creating table "${table}"`);
            const ddlColumns = ddlData[table].columns.map(col => `${col.name} ${col.type} ${!col.nullable ? 'NOT NULL' : ''}`).join(' ,');
            await executeSQL(`CREATE TABLE ${schema}.${table} (
                ${ddlColumns}
            )`);
            console.log(`Table ${table} created`);
        }
        const ddlIndices = ddlData[table].indices || [];
        if (ddlIndices.length > 0) {
            const actualIndices = await getIndices(table);
            const indicesToCreate = ddlIndices.filter(ddlIndex => !(actualIndices.map(actualIndex => actualIndex.indexname).includes(ddlIndex.name)));
            for (const itc of indicesToCreate) {
                const terms = [];
                terms.push('create');
                itc.unique && terms.push('unique');
                terms.push('index');
                terms.push(`${itc.name} on ${schema}.${table}`);
                terms.push(`using ${itc.type || 'btree'}`);
                terms.push(`(${itc.columns.join(',')})`);
                const indexDefinition = terms.join(' ');
                await executeSQL(indexDefinition);
                console.log(`index ${itc.name} created`);
            }
        }

        const ddlConstraints = ddlData[table].constraints || [];
        if (ddlConstraints.length > 0) {
            const actualConstraints = await getConstraints(table);
            const constraintsToCreate = ddlConstraints.filter(ddlConstraint => !(actualConstraints.map(actualConstraint => actualConstraint.conname).includes(ddlConstraint.name)));
            console.log('constraints to create are');
            console.log(constraintsToCreate)
            for (const ct of constraintsToCreate){
                const sql = `alter table ${schema}.${table} add constraint ${ct.name} ${ct.type} (${ct.columns.join(',')})`;
                await executeSQL(sql);
                console.log(`Constraint ${ct.name} created`);
            }
        }

    }
    return {};
}
