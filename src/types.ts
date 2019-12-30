export interface User {
  id: string;
  dateCreated: Date;
  dateUpdated: Date;
  email: string;

  cursor?: string;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}
