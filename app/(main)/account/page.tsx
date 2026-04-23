"use client";

import React, { useEffect } from "react";

import { useSnapshot } from "valtio";

import userStore from "@/store/user";

const AccountPage = () => {
  const { user } = useSnapshot(userStore);

  useEffect(() => {
    console.log(user);
  }, [user]);
  return <div>AccountPage</div>;
};

export default AccountPage;
