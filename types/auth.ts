export interface IAuthUserPayload {
  email: string;
  password: string;
  options: {
    data: {
      full_name: string;
      name: string;
      nickname: string;
      nij?: string;
      birthdate: string;
      gender: string;
      church_id: number;
      phone: string;
    };
  };
}
