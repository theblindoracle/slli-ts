import { Injectable } from '@nestjs/common';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Session } from './session.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SessionDTO } from './session.dtos';
@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  save(dto: SessionDTO) {
    return this.sessionRepository.save(dto);
  }
  findAll() {
    return this.sessionRepository.find();
  }

  findBy(options: FindOptionsWhere<Session>) {
    return this.sessionRepository.findBy(options);
  }
  findOneBy(options: FindOptionsWhere<Session>) {
    return this.sessionRepository.findOneBy(options);
  }

  remove(id: number) {
    return this.sessionRepository.delete(id);
  }
}
