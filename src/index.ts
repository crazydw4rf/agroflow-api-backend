import express from "express";
import type { User } from "@/entity";

const app = express();

const user1: Partial<User> = {
  role: "ADMIN",
};

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
