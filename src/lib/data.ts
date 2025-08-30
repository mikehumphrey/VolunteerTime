
export type Volunteer = {
  id: number;
  name: string;
  email: string;
  avatar: string;
  hours: number;
  phone?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  formCompleted?: boolean;
  formUrl?: string;
  isAdmin?: boolean;
  privacySettings?: {
    showPhone: boolean;
    showSocial: boolean;
  }
};

export const volunteers: Volunteer[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704a', hours: 42, phone: '555-0101', twitter: '@alicej', facebook: 'alice.johnson', formCompleted: true, formUrl: 'https://www.offthechainak.org/wordpress/sample-page/volunteer/volunteer-form/', privacySettings: { showPhone: true, showSocial: true } },
  { id: 2, name: 'Bob Williams', email: 'bob@example.com', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704b', hours: 28, phone: '555-0102', instagram: 'bobw', formCompleted: false, privacySettings: { showPhone: false, showSocial: true } },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704c', hours: 55, phone: '555-0103', facebook: 'charlie.brown', formCompleted: true, formUrl: 'https://www.offthechainak.org/wordpress/sample-page/volunteer/volunteer-form/', privacySettings: { showPhone: true, showSocial: false } },
  { id: 4, name: 'Diana Miller', email: 'diana@example.com', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', hours: 19, phone: '555-0104', formCompleted: false, privacySettings: { showPhone: true, showSocial: true } },
  { id: 5, name: 'Ethan Davis', email: 'ethan@example.com', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704e', hours: 34, phone: '555-0105', twitter: '@ethand', instagram: 'ethand', formCompleted: true, formUrl: 'https://www.offthechainak.org/wordpress/sample-page/volunteer/volunteer-form/', privacySettings: { showPhone: true, showSocial: true } },
  {
    id: 6,
    name: 'Michael Humphrey',
    email: 'michaelhumph@gmail.com',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704f',
    hours: 72,
    phone: '555-123-4567',
    twitter: '@mike',
    facebook: 'michael.humphrey',
    instagram: 'mikehumph',
    formCompleted: true,
    formUrl: 'https://www.offthechainak.org/wordpress/sample-page/volunteer/volunteer-form/',
    isAdmin: true,
    privacySettings: {
      showPhone: true,
      showSocial: true,
    }
  },
  {
    id: 7,
    name: 'Off The Chain',
    email: 'offthechainalaska@gmail.com',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXvmkXqYdbZAHqMcoKqcbEtvJFEtaAP18Sqg&s',
    hours: 0,
    phone: '555-555-5555',
    formCompleted: true,
    formUrl: '',
    isAdmin: true,
    privacySettings: {
      showPhone: true,
      showSocial: true,
    }
  }
];

export type StoreItem = {
  id: string;
  name: string;
  cost: number; // in hours
};

export const storeItems: StoreItem[] = [
  { id: 'tshirt', name: 'Branded T-Shirt', cost: 5 },
  { id: 'mug', name: 'Coffee Mug', cost: 3 },
  { id: 'tote', name: 'Tote Bag', cost: 4 },
  { id: 'cap', name: 'Baseball Cap', cost: 4 },
];

export type Transaction = {
  id: string;
  volunteerId: number;
  itemId: string;
  hoursDeducted: number;
  date: Date;
};

export const transactions: Transaction[] = [];

export const appSettings = {
  volunteerFormUrl: "https://www.offthechainak.org/wordpress/sample-page/volunteer/volunteer-form/"
};
