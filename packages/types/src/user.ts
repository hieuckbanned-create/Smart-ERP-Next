export interface User {
  id: string;
  email: string;
  name: string | null;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateUserInput = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>;
