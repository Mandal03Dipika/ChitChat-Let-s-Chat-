import { config } from "dotenv";
import mongoose from "mongoose";
import { server } from "../library/socket.js";
import User from "../models/userModel.js";

config();

const seedUsers = [
  // Female Users
  {
    email: "emma.thompson@example.com",
    name: "Emma Thompson",
    password: "12345678",
    profilePic: "https://randomuser.me/api/portraits/women/1.jpg",
  },
  {
    email: "olivia.miller@example.com",
    name: "Olivia Miller",
    password: "12345678",
    profilePic: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    email: "sophia.davis@example.com",
    name: "Sophia Davis",
    password: "12345678",
    profilePic: "https://randomuser.me/api/portraits/women/3.jpg",
  },
  {
    email: "ava.wilson@example.com",
    name: "Ava Wilson",
    password: "12345678",
    profilePic: "https://randomuser.me/api/portraits/women/4.jpg",
  },
  {
    email: "isabella.brown@example.com",
    name: "Isabella Brown",
    password: "12345678",
    profilePic: "https://randomuser.me/api/portraits/women/5.jpg",
  },
  {
    email: "mia.johnson@example.com",
    name: "Mia Johnson",
    password: "12345678",
    profilePic: "https://randomuser.me/api/portraits/women/6.jpg",
  },
  {
    email: "charlotte.williams@example.com",
    name: "Charlotte Williams",
    password: "12345678",
    profilePic: "https://randomuser.me/api/portraits/women/7.jpg",
  },
  {
    email: "amelia.garcia@example.com",
    name: "Amelia Garcia",
    password: "12345678",
    profilePic: "https://randomuser.me/api/portraits/women/8.jpg",
  },

  // Male Users
  {
    email: "james.anderson@example.com",
    name: "James Anderson",
    password: "12345678",
    profilePic: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    email: "william.clark@example.com",
    name: "William Clark",
    password: "12345678",
    profilePic: "https://randomuser.me/api/portraits/men/2.jpg",
  },
  {
    email: "benjamin.taylor@example.com",
    name: "Benjamin Taylor",
    password: "12345678",
    profilePic: "https://randomuser.me/api/portraits/men/3.jpg",
  },
  {
    email: "lucas.moore@example.com",
    name: "Lucas Moore",
    password: "12345678",
    profilePic: "https://randomuser.me/api/portraits/men/4.jpg",
  },
  {
    email: "henry.jackson@example.com",
    name: "Henry Jackson",
    password: "12345678",
    profilePic: "https://randomuser.me/api/portraits/men/5.jpg",
  },
  {
    email: "alexander.martin@example.com",
    name: "Alexander Martin",
    password: "12345678",
    profilePic: "https://randomuser.me/api/portraits/men/6.jpg",
  },
  {
    email: "daniel.rodriguez@example.com",
    name: "Daniel Rodriguez",
    password: "12345678",
    profilePic: "https://randomuser.me/api/portraits/men/7.jpg",
  },
];

const PORT = process.env.PORT;
const DB_URL = process.env.DB_URL;
const seedDatabase = async () => {
  try {
    await mongoose
      .connect(DB_URL)
      .then(() => {
        console.log("DB Connected");
        server.listen(PORT, () => {
          console.log(`Server Connected On Port: ${PORT}`);
        });
      })
      .catch((error) => {
        console.log(error.message);
      });
    await User.insertMany(seedUsers);
    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};
seedDatabase();
