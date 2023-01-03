import { generateToken } from '@utils/common';
import { createAppUser } from '@utils/authencation';

const Mutation = {
  async userSignUp(_, { input }, { AppUserModel }, info) {
    const { name, password, email } = input;

    let response = { status: "-1" };

    let appUserByName = await AppUserModel.findOne({ name }).exec();
    let appUserByEmail = await AppUserModel.findOne({ email }).exec();

    if (appUserByName) {
      response = { status: "0-0" };
    } else if (appUserByEmail) {
      response = { status: "0-1" };
    } else {
      const token = generateToken();
      const appUserInfo = {
        name,
        password,
        email,
        token,
      }
      await createAppUser(appUserInfo)
        .then(() => {
          response = {
            status: "1",
            token: token,
            appUser: appUserInfo
          };
        })
    }

    // console.log(response);

    return response;
  },
};

export default Mutation;