import authencationSchema from './authencation';
import transactionSchema from './transaction';
import accountSchema from './account';

const schema = `
${authencationSchema}
${transactionSchema}
${accountSchema}
`;

export default schema;