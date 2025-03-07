import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import { userRouter } from "./users/users.routes";
import { productRouter } from "./products/products.routes";

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 7000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

app.use("/", userRouter);
app.use("/", productRouter);  

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
}).on("error", (error) => {
    console.error("Error starting server:", error);
});