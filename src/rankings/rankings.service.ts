import { Injectable } from '@nestjs/common';
import { Ranking } from './rankings.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RankingDTO } from './rankings.dto';

@Injectable()
export class RankingsService {
  constructor(
    @InjectRepository(Ranking)
    private readonly recordsRepository: Repository<Ranking>,
  ) { }

  create(record: RankingDTO) {
    return this.recordsRepository.save(record);
  }

  update(id: number, record: RankingDTO) {
    return this.recordsRepository.update(id, record);
  }

  findAll(): Promise<Ranking[]> {
    return this.recordsRepository.find();
  }

  findById(id: number): Promise<Ranking | null> {
    return this.recordsRepository.findOneBy({ id });
  }

  findBy(options: FindOptionsWhere<Ranking>) {
    return this.recordsRepository.findBy(options);
  }

  remove(id: number) {
    return this.recordsRepository.delete(id);
  }
}
