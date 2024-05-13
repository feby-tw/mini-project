import "reflect-metadata";
import express, { json, Express } from "express";
import cors from "cors";
import path from "path";

import { Routes } from "./interfaces/routes.interface";
import { ErrorMiddleware } from "./middlewares/error.middleware";

import { Scheduler } from "@/services/scheduler"
import Container from "typedi";

export default class App {
    private app: Express;
    private port: string | number;

    constructor(routes: Routes[]) {
        this.app = express();
        this.port = process.env.API_PORT || 8080;
        this.initializeMiddleware();
        this.initializeRoutes(routes);
        this.initializeScheduler();
        this.initializeErrorHandling();
    }

    private initializeMiddleware(): void {
        this.app.use(cors());
        this.app.use(json());
        this.app.use("/images", express.static(path.join(__dirname, "public")))
    }

    public initializeScheduler(): void {
        const scheduler = Container.get(Scheduler);
        scheduler.startCronJob();
    }

    private initializeRoutes(routes: Routes[]) {
        routes.forEach((route) => {
            this.app.use("/", route.router);
        });
    }

    private initializeErrorHandling() {
        this.app.use(ErrorMiddleware);
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log(`Server running on port ${this.port}`);
        });
    }
}