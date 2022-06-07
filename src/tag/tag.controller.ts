import { Controller, Get } from '@nestjs/common';

@Controller('tags')
export class TagController {
  @Get()
  findAll(): string[] {
    return ['tag1', 'tag2', 'tag3'];
  }
}
