import { Controller, Get, Render } from "@nestjs/common";

@Controller('/')
export class RootController {
  @Get()
  @Render("home")
  root() {

  }
}
