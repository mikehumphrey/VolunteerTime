
'use server';

import { db } from './firebase';
import { collection, doc, getDoc, setDoc, updateDoc, getDocs, writeBatch, query } from 'firebase/firestore';
import { Volunteer, StoreItem, Transaction, volunteers as mockVolunteers, storeItems as mockStoreItems } from './data';

// Volunteer Management
export async function getVolunteers(): Promise<Volunteer[]> {
  try {
    const volunteersCol = collection(db, 'volunteers');
    const volunteerSnapshot = await getDocs(volunteersCol);
    const volunteerList = volunteerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Volunteer));
    return volunteerList;
  } catch (error) {
    console.error("Error fetching volunteers: ", error);
    return [];
  }
}

export async function getVolunteerById(id: string): Promise<Volunteer | null> {
  try {
    const volunteerRef = doc(db, 'volunteers', id);
    const volunteerSnap = await getDoc(volunteerRef);
    if (volunteerSnap.exists()) {
      return { id: volunteerSnap.id, ...volunteerSnap.data() } as Volunteer;
    } else {
      console.log('No such volunteer!');
      return null;
    }
  } catch (error) {
    console.error("Error fetching volunteer by ID: ", error);
    return null;
  }
}

export async function createVolunteer(volunteer: Volunteer): Promise<void> {
    try {
        const volunteerRef = doc(db, 'volunteers', volunteer.id);
        await setDoc(volunteerRef, {
            name: volunteer.name,
            email: volunteer.email,
            avatar: volunteer.avatar,
            hours: volunteer.hours,
            isAdmin: volunteer.isAdmin || false,
            privacySettings: volunteer.privacySettings || { showPhone: true, showSocial: true },
            phone: volunteer.phone || "",
            twitter: volunteer.twitter || "",
            facebook: volunteer.facebook || "",
            instagram: volunteer.instagram || "",
        });
    } catch (error) {
        console.error("Error creating volunteer: ", error);
    }
}


export async function updateVolunteer(id: string, data: Partial<Volunteer>): Promise<void> {
  try {
    const volunteerRef = doc(db, 'volunteers', id);
    await updateDoc(volunteerRef, data);
  } catch (error) {
    console.error("Error updating volunteer: ", error);
  }
}


// Store and Transaction Management
export async function getStoreItems(): Promise<StoreItem[]> {
  try {
    const itemsCol = collection(db, 'storeItems');
    const itemSnapshot = await getDocs(itemsCol);
    return itemSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StoreItem));
  } catch (error) {
    console.error("Error fetching store items: ", error);
    return [];
  }
}

export async function addStoreItem(item: Omit<StoreItem, 'id'>): Promise<void> {
    try {
      const id = item.name.toLowerCase().replace(/\s+/g, '-');
      const itemRef = doc(db, 'storeItems', id);
      await setDoc(itemRef, item);
    } catch (error) {
      console.error("Error adding store item: ", error);
    }
}

export async function getTransactions(): Promise<Transaction[]> {
    try {
        const transactionsCol = collection(db, 'transactions');
        const transactionSnapshot = await getDocs(transactionsCol);
        const transactionList = transactionSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                date: data.date.toDate(), // Convert Firestore Timestamp to JS Date
            } as Transaction;
        });
        return transactionList;
    } catch (error) {
        console.error("Error fetching transactions: ", error);
        return [];
    }
}

export async function addTransaction(volunteerId: string, itemId: string, hoursDeducted: number, newVolunteerHours: number): Promise<void> {
    try {
        const batch = writeBatch(db);

        // 1. Create a new transaction document
        const newTransactionRef = doc(collection(db, 'transactions'));
        batch.set(newTransactionRef, {
            volunteerId,
            itemId,
            hoursDeducted,
            date: new Date(),
        });

        // 2. Update the volunteer's hours
        const volunteerRef = doc(db, 'volunteers', volunteerId);
        batch.update(volunteerRef, { hours: newVolunteerHours });

        // Commit the batch
        await batch.commit();

    } catch (error) {
        console.error("Error processing transaction: ", error);
        throw error;
    }
}


// Seeding Utility
export async function seedDatabase() {
    console.log("Starting database seed...");
    const batch = writeBatch(db);

    // Seed Volunteers
    console.log("Seeding volunteers...");
    const volunteersCol = collection(db, 'volunteers');
    const existingVolunteers = await getDocs(query(volunteersCol));
    if (existingVolunteers.empty) {
        mockVolunteers.forEach(v => {
            // A real app would use a better way to generate UIDs.
            // For this seed, we'll use a hash of the email.
            const pseudoId = v.email.replace(/[^a-zA-Z0-9]/g, '');
            const docRef = doc(db, 'volunteers', pseudoId);
            batch.set(docRef, {
                ...v,
                id: pseudoId,
            });
        });
        console.log(`${mockVolunteers.length} volunteers queued for seeding.`);
    } else {
        console.log("Volunteers collection is not empty, skipping seed.");
    }


    // Seed Store Items
    console.log("Seeding store items...");
    const itemsCol = collection(db, 'storeItems');
    const existingItems = await getDocs(query(itemsCol));

    if (existingItems.empty) {
        mockStoreItems.forEach(item => {
            const docRef = doc(db, 'storeItems', item.id);
            batch.set(docRef, item);
        });
        console.log(`${mockStoreItems.length} store items queued for seeding.`);
    } else {
         console.log("Store items collection is not empty, skipping seed.");
    }


    try {
        await batch.commit();
        console.log("Database seeded successfully!");
        return { success: true, message: "Database seeded successfully!" };
    } catch (error) {
        console.error("Error seeding database:", error);
        return { success: false, message: `Error seeding database: ${error}` };
    }
}
