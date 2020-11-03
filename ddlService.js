const {getIndices} = require("./metaService");
const {executeSQL} = require('./dmlService');

exports.ensureTables = async (ddlData) => {
    const actual = await executeSQL("select tablename, tableowner from pg_catalog.pg_tables where schemaname = 'public'");
    for (const table of Object.keys(ddlData)) {
        if (actual.filter(t => t.tablename === table).length === 1) {
            console.log(`Table ${table} already exists`);
        } else {
            console.log(`Start creating table "${table}"`);
            const ddlColumns = ddlData[table].columns.map(col => `${col.name} ${col.type} ${!col.nullable ? 'NOT NULL' : ''}`).join(' ,');
            // console.log(ddlColumns);
            await executeSQL(`CREATE TABLE public.${table} (
                ${ddlColumns}
            )`);
            // console.log(`Table ${table} created`);
        }
        const ddlIndices = ddlData[table].indices;
        const actualIndices = await getIndices(table);
        const indicesToCreate = ddlIndices.filter(ddlIndex => !(actualIndices.map(actualIndex => actualIndex.indexname).includes(ddlIndex.name)));
        // console.log('--- indicesToCreate ---')
        // console.log(indicesToCreate);
        for (const itc of indicesToCreate) {
            // CREATE UNIQUE INDEX sitemaps_bank_loc_key ON public.sitemaps USING btree (bank, loc)
            const terms = [];
            terms.push('create');
            itc.unique && terms.push('unique');
            terms.push('index');
            terms.push(`${itc.name} on public.${table}`);
            terms.push(`using ${itc.type || 'btree'}`);
            terms.push(`(${itc.columns.join(',')})`);
            const indexDefinition = terms.join(' ');
            console.log(indexDefinition);
            await executeSQL(indexDefinition);
            console.log(`index ${itc.name} created`);
        }
    }
    return {};
}
