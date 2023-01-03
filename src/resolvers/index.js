import { authencationQuery, authencationMutation } from "./authencation";
import { transactionQuery, transactionMutation } from "./transaction";
import { accountQuery, accountMutation } from "./account";

const Query = {
    ...authencationQuery,
    ...transactionQuery,
    ...accountQuery,
};

const Mutation = {
    ...authencationMutation,
    ...transactionMutation,
    ...accountMutation,
};

export { Query, Mutation };