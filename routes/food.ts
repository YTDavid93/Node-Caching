import express, { Request, Response } from "express";
import  { createClient } from "redis";

// redis connection
const redisClient = createClient();

redisClient.on('error', (err: Error) => {
  console.error('Redis error:', err);
});

const redisReady = redisClient.connect();

const foodFetchRouter = express.Router();

foodFetchRouter.get('/recipe/:fooditem', async (req: Request, res: Response) => {
 try {
  await redisReady;

  const fooditem = req.params.fooditem as string;

  // check the redis store for the recipe
  const cachedRecipe = await redisClient.get(fooditem);

  if (cachedRecipe) {
    console.log('Recipe found in cache');
    return res.json(JSON.parse(cachedRecipe));
  } else {

    const recipe = await fetch(`https://dummyjson.com/recipes/search?q=${fooditem}`); 

    if (!recipe.ok) {
      throw new Error(`HTTP error! status: ${recipe.status}`);
    }

    // Store the recipe in Redis for future requests
    const recipeData = await recipe.json();
    await redisClient.set(fooditem, JSON.stringify(recipeData), { EX: 3600 }); // Cache for 1 hour

    // Parse the JSON response
     return res.json(recipeData);
  }
  
 } catch (error) {
    console.log(error)
     return res.status(500).json({ error: "Failed to fetch recipe" });
 }
});
 

export default foodFetchRouter;
