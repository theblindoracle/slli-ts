import { Injectable } from '@nestjs/common';
import { Ranking } from './rankings.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RankingDTO } from './rankings.dto';

@Injectable()
export class RankingsService {
  constructor(
    @InjectRepository(Ranking)
    private readonly rankingsRepository: Repository<Ranking>,
  ) { }

  create(record: RankingDTO) {
    return this.rankingsRepository.save(record);
  }

  update(id: number, record: RankingDTO) {
    return this.rankingsRepository.update(id, record);
  }

  findAll(): Promise<Ranking[]> {
    return this.rankingsRepository.find();
  }

  findById(id: number): Promise<Ranking | null> {
    return this.rankingsRepository.findOneBy({ id });
  }

  findBy(options: FindOptionsWhere<Ranking>) {
    return this.rankingsRepository.findBy(options);
  }

  remove(id: number) {
    return this.rankingsRepository.delete(id);
  }
}
