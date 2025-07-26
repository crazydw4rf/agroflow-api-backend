import { Container } from "inversify";

import { UserController } from "@/delivery/http/controller";
import { HTTPRouter } from "@/delivery/http/router";
import { UserRepository } from "@/repository";
import { ConfigService } from "@/services/config";
import { ExpressService } from "@/services/express";
import PrismaService from "@/services/prisma";
import { UserUsecase } from "@/usecase";

const c = new Container();

c.bind(ConfigService).toSelf();
c.bind(ExpressService).toSelf();
c.bind(UserController).toSelf();
c.bind(HTTPRouter).toSelf();
c.bind(UserUsecase).toSelf();
c.bind(PrismaService).toSelf();
c.bind(UserRepository).toSelf();

c.get(ExpressService).listen();
