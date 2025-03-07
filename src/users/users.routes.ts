import express, { Request, Response } from "express";
import { UnitUser } from "./users.interface";
import { StatusCodes } from "http-status-codes";
import * as database from "./user.database";

export const userRouter = express.Router();

userRouter.get("/users", async (req: Request, res: Response): Promise<void> => {
  try {
    const allUsers: UnitUser[] = await database.findAll();
    if (!allUsers || allUsers.length === 0) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "No users found." });
      return;
    }
    res.status(StatusCodes.OK).json({ total_users: allUsers.length, allUsers });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message });
  }
});

userRouter.get("/user/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const user: UnitUser | null = await database.findOne(req.params.id);
    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "User not found!" });
      return;
    }
    res.status(StatusCodes.OK).json({ user });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message });
  }
});

userRouter.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide all required fields." });
      return;
    }

    const existingUser = await database.findByEmail(email);
    if (existingUser) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: "This email is already registered." });
      return;
    }

    const newUser = await database.create(req.body);
    if (!newUser) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to create user." });
      return;
    }

    res.status(StatusCodes.CREATED).json({ newUser });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message });
  }
});

userRouter.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide email and password." });
      return;
    }

    const user = await database.findByEmail(email);
    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "No user found with the given email." });
      return;
    }

    const isPasswordValid = await database.comparePassword(email, password);
    if (!isPasswordValid) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: "Incorrect password!" });
      return;
    }

    res.status(StatusCodes.OK).json({ user });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message });
  }
});

userRouter.put("/user/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const existingUser = await database.findOne(id);
    if (!existingUser) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "User not found!" });
      return;
    }

    const updatedUser = await database.update(id, updatedData);
    if (!updatedUser) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to update user." });
      return;
    }

    res.status(StatusCodes.OK).json({ msg: "User updated successfully.", updatedUser });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message });
  }
});

userRouter.delete("/user/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await database.findOne(id);
    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ error: `User with ID ${id} does not exist.` });
      return;
    }

    await database.remove(id);
    res.status(StatusCodes.OK).json({ msg: "User deleted successfully." });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message });
  }
});