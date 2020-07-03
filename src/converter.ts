export class User {
  first_name!: string;
  last_name!: string;
  email!: string;

  constructor(first_name: string, last_name: string, email: string) {
    this.first_name = first_name;
    this.last_name = last_name;
    this.email = email;
  }

  toString() {
    return `${this.first_name} ${this.last_name}`;
  }
}

// Firestore data converter
export const userConverter: FirebaseFirestore.FirestoreDataConverter<User> = {
  toFirestore: (user: User): FirebaseFirestore.DocumentData => {
    return {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    };
  },
  fromFirestore: (data: FirebaseFirestore.DocumentData): User => {
    return new User(data.first_name, data.last_name, data.email);
  },
};
