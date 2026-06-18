import express, { Express } from "express";
import foodFetchRouter from "../routes/food";

const app: Express = express();
const port = process.env.PORT || 3000;

app.use('/api', foodFetchRouter);

// express connection
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
