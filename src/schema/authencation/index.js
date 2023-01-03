import * as fs from 'fs';
import path from 'path';

const rootPath = './src/schema/authencation';

const schemaFiles = [
    'type.graphql',
    'query.graphql',
    'mutation.graphql',
];

let schema = '';
for (const schemaFile of schemaFiles) {
    const data = fs.readFileSync(path.join(rootPath, schemaFile));
    schema += "\n" + data.toString();
};

export default schema;