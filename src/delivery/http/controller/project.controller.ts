import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import type { Logger } from "winston";

import { LoggingService } from "@/services/logger";
import { ProjectUsecase } from "@/usecase";

@injectable("Singleton")
export class ProjectController {
  private _logger: Logger;

  constructor(
    @inject(ProjectUsecase) private readonly _projectUc: ProjectUsecase,
    @inject(LoggingService) private readonly _loggerInstance: LoggingService,
  ) {
    this._logger = this._loggerInstance.withLabel("ProjectController");
  }

  public createNewProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    throw new Error("Method not implemented.");
  };

  public updateProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    throw new Error("Method not implemented.");
  };

  public deleteProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    throw new Error("Method not implemented.");
  };

  public getProjectById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    throw new Error("Method not implemented.");
  };

  public getAllProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    throw new Error("Method not implemented.");
  };
}
