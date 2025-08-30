export type Volunteer = {
  id: number;
  name: string;
  email: string;
  avatar: string;
  hours: number;
};

export const volunteers: Volunteer[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704a', hours: 42 },
  { id: 2, name: 'Bob Williams', email: 'bob@example.com', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704b', hours: 28 },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704c', hours: 55 },
  { id: 4, name: 'Diana Miller', email: 'diana@example.com', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', hours: 19 },
  { id: 5, name: 'Ethan Davis', email: 'ethan@example.com', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704e', hours: 34 },
];

export const currentUser = {
  name: 'Frankie Adams',
  email: 'frankie@example.com',
  phone: '555-123-4567',
  avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704f',
};
