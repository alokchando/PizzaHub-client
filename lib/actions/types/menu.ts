export type MenuItem = {
  _id: string;
  vendorId: string;
  itemName: string;
  category: string;
  price: number;
  description?: string;
  image?: string;
  status: "pending" | "approved" | "rejected";
  isActive: boolean;
  createdAt?: string;
};