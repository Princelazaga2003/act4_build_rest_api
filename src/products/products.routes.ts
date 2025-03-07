import express, { Request, Response } from "express";
import { UnitProduct } from "./product.interface";
import { StatusCodes } from "http-status-codes";
import * as database from "./products.database";

export const productRouter = express.Router();

productRouter.get("/products", async (req: Request, res: Response) => {
    try {
        const allProducts: UnitProduct[] = await database.findAll();
        if (!allProducts || allProducts.length === 0) {
            res.status(StatusCodes.NOT_FOUND).json({ error: "No products found!" });
            return;
        }
        res.status(StatusCodes.OK).json({ total: allProducts.length, allProducts });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message });
    }
});

productRouter.get("/product/:id", async (req: Request, res: Response) => {
    try {
        const product: UnitProduct | null = await database.findOne(req.params.id);
        if (!product) {
            res.status(StatusCodes.NOT_FOUND).json({ error: "Product does not exist" });
            return;
        }
        res.status(StatusCodes.OK).json({ product });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message });
    }
});

productRouter.post("/product", async (req: Request, res: Response) => {
    try {
        const { name, price, quantity, image } = req.body;
        if (!name || !price || !quantity || !image) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide all the required parameters." });
            return;
        }
        const newProduct = await database.create({ ...req.body });
        if (!newProduct) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to create product." });
            return;
        }
        res.status(StatusCodes.CREATED).json({ newProduct });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message });
    }
});

productRouter.put("/product/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const newProductData = req.body;

        const existingProduct: UnitProduct | null = await database.findOne(id);
        if (!existingProduct) {
            res.status(StatusCodes.NOT_FOUND).json({ error: "Product does not exist." });
            return;
        }

        const updatedProduct = await database.update(id, newProductData);
        res.status(StatusCodes.OK).json({ msg: "Product updated successfully", updatedProduct });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message });
    }
});

productRouter.delete("/product/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const existingProduct: UnitProduct | null = await database.findOne(id);

        if (!existingProduct) {
            res.status(StatusCodes.NOT_FOUND).json({ error: `No product found with ID ${id}` });
            return;
        }

        await database.remove(id);
        res.status(StatusCodes.OK).json({ msg: "Product deleted successfully." });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message });
    }
});
