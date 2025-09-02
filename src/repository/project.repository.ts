import { inject, injectable } from "inversify";

import type { Project } from "@/entity";
import { Prisma } from "@/generated/prisma/client";
import type { ProjectModel } from "@/models";
import { AppError, ErrorCause } from "@/types/errors";
import type { BaseRepositoryInterface, Result } from "@/types/helper";
import { ProjectModelSym } from "@/types/symbols";
import { Err, Ok } from "@/utils";

export interface IProjectRepository extends BaseRepositoryInterface<Project> {
  getMany(userId: string): Promise<Result<Project[]>>;
}

@injectable("Singleton")
export class ProjectRepository implements IProjectRepository {
  constructor(@inject(ProjectModelSym) private readonly _project: ProjectModel) {}

  async create(data: Project): Promise<Result<Project>> {
    try {
      const project = await this._project.create({
        data: { ...data },
      });

      return Ok(project);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async get(id: string): Promise<Result<Project>> {
    try {
      const project = await this._project.findFirstOrThrow({
        where: { id },
      });
      return Ok(project);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async update(data: Project): Promise<Result<Project>> {
    try {
      const project = await this._project.update({
        where: { id: data.id },
        data: { ...data },
      });

      return Ok(project);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async delete(id: string): Promise<Result<boolean>> {
    try {
      await this._project.delete({
        where: { id },
      });

      return Ok(true);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async getMany(user_id: string): Promise<Result<Project[]>> {
    try {
      const projects = await this._project.findMany({
        where: { user_id },
      });

      if (!projects || projects.length <= 0) {
        return Err(AppError.new("no projects found", ErrorCause.ENTRY_NOT_FOUND));
      }

      return Ok(projects);
    } catch (e) {
      return this.handleError(e);
    }
  }

  private handleError(e: any): Result<any> {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return Err(AppError.new("project already exists", ErrorCause.DUPLICATE_ENTRY));
      } else if (e.code === "P2025") {
        return Err(AppError.new("project not found", ErrorCause.ENTRY_NOT_FOUND));
      }
      return Err(AppError.new(e.message, ErrorCause.DATABASE_ERROR));
    }
    return Err(AppError.new("an unknown error occurred: ".concat(e as string), ErrorCause.UNKNOWN_ERROR));
  }
}
