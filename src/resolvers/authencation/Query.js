import { generateToken } from '@utils/common';

const Query = {
  async userSignIn(_, { name, password }, { AppUserModel }, info) {
    let response = { status: "-1" };
    const appUser = await AppUserModel.findOne({ name, password }).exec();
    console.log(appUser)

    if (appUser) {
      const token = generateToken();
      await AppUserModel.updateOne({ name }, { token })
        .then(() => {
          response = {
            status: "1",
            token: token,
            appUser: appUser
          };
        });
    } else {
      response = { status: "0" };
    }

    return response;
  },
};

export default Query;