import { inject, injectable } from "inversify";
import type { Logger } from "winston";

import type { Project } from "@/entity";
import { type ProjectCreateDto, type ProjectUpdateDto, zProjectCreate, zProjectUpdate } from "@/models";
import { type IProjectRepository, ProjectRepository } from "@/repository";
import { LoggingService } from "@/services/logger";
import { AppError, ErrorCause } from "@/types/errors";
import type { Result } from "@/types/helper";
import { Err, Ok } from "@/utils";

export interface IProjectUsecase {
  newProject(dto: ProjectCreateDto): Promise<Result<Project>>;
  updateProject(dto: ProjectUpdateDto): Promise<Result<Project>>;
  deleteProject(id: string): Promise<Result<boolean>>;
  getProjectById(id: string): Promise<Result<Project>>;
  getAllProjects(userId: string): Promise<Result<Project[]>>;
}

@injectable("Singleton")
export class ProjectUsecase implements IProjectUsecase {
  private _logger: Logger;

  constructor(
    @inject(ProjectRepository) private readonly _projectRepo: IProjectRepository,
    @inject(LoggingService) private readonly _loggerInstance: LoggingService,
  ) {
    this._logger = this._loggerInstance.withLabel("ProjectUsecase");
  }

  async newProject(dto: ProjectCreateDto): Promise<Result<Project>> {
    this._logger.debug("creating new project", dto);

    const { success, error, data } = zProjectCreate.safeParse(dto);
    if (!success) {
      this._logger.warn("validation error", error);
      return Err(AppError.new("invalid project data", ErrorCause.VALIDATION_ERROR));
    }

    const [project, err] = await this._projectRepo.create(data);
    if (err) {
      return Err(err);
    }

    return Ok(project);
  }

  async updateProject(dto: ProjectUpdateDto): Promise<Result<Project>> {
    this._logger.debug("updating project", dto);

    // FIXME: pindah logika validasi payload ke class router
    const { success, error, data } = zProjectUpdate.safeParse(dto);
    if (!success) {
      this._logger.warn("validation error", error);
      return Err(AppError.new("invalid project data", ErrorCause.VALIDATION_ERROR));
    }

    const [project, err] = await this._projectRepo.update(data);
    if (err) {
      return Err(err);
    }

    return Ok(project);
  }

  async getProjectById(id: string): Promise<Result<Project>> {
    throw new Error("Method not implemented.");
  }

  async getAllProjects(userId: string): Promise<Result<Project[]>> {
    throw new Error("Method not implemented.");
  }

  async deleteProject(id: string): Promise<Result<boolean>> {
    const [ok, err] = await this._projectRepo.delete(id);
    if (!ok || err) {
      return Err(err);
    }

    return Ok(true);
  }
}
