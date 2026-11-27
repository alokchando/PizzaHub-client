
export type MenuItem = {
  _id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  image?: string;
  status: "pending" | "approved" | "rejected";
  isActive: boolean;
};
