import { proxy } from "valtio";

import { IUser } from "@/types/user";

const userStore = proxy({
  user: null as IUser | null,
  setUser: (user: IUser | null) => {
    userStore.user = user;
  },
});

export default userStore;
