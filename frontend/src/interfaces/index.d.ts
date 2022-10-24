export interface ICategory {
  id: string;
  title: string;
}

export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  password: string;
  role: "admin" | "user";
  factories: Array<IFactory>;
  refreshToken: string;
  description: string;
}
