import { AppUserModel } from '@models/user';
import { TransactionTableModel } from '@models/transaction';
import { AccountTableModel } from '@models/account';

const createAppUser = (appUserInfo) => {
    return new Promise(async (resolve, reject) => {
        const transactionTable = await TransactionTableModel.create({
            transactions: []
        }).catch((error) => {
            reject(error);
        });

        const accountTable = await AccountTableModel.create({
            accounts: []
        }).catch((error) => {
            reject(error);
        });

        const appUser = await AppUserModel.create({
            ...appUserInfo,
            transactionTable: transactionTable._id,
            accountTable: accountTable._id,
        }).catch((error) => {
            reject(error);
        });

        // console.log(appUser);
        // console.log(ledgerTable);
        // console.log(accountTable);

        // await AppUserModel.deleteOne({ _id: appUser._id });
        // await TransactionTableModel.deleteOne({ _id: ledgerTable._id });
        // await AccountTableModel.deleteOne({ _id: accountTable._id });

        resolve();
    });
}

export { createAppUser };