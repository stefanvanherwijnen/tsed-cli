import {Adapter, InjectAdapter} from "@tsed/adapters";
import {$log, PlatformContext} from "@tsed/common";
import {Injectable} from "@tsed/di";
import {deserialize} from "@tsed/json-mapper";
import {AccessToken, AuthorizationCode, DeviceCode} from "@tsed/oidc-provider";
import {Account} from "../models/Account";
import bcrypt from "bcrypt";

@Injectable()
export class Accounts {
  @InjectAdapter("Accounts", Account)
  adapter: Adapter<Account>;

  async $onInit() {
    const accounts = await this.adapter.findAll();

    // We create a default account if the database is empty
    if (!accounts.length) {
      await this.adapter.create(deserialize({
        email: "test@test.com",
        password: await bcrypt.hash('test', 10),
        emailVerified: true
      }, {useAlias: false}));
    }
  }

  async findAccount(id: string) {
    return this.adapter.findById(id);
  }

  async authenticate({username, email, password}: {username?: string; email?: string; password: string}) {
    let user;

    if (username) {
      user = await this.adapter.findOne({username});
    } else if (email) {
      user = await this.adapter.findOne({email});
    }

    if (user && bcrypt.compareSync(password, user.password)) {
      return user;
    }
    return;
  }
}
