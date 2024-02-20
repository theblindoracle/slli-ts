import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Record } from './records.entity';
import { RecordDTO } from './records.dto';

@Injectable()
export class RecordsService {
  constructor(
    @InjectRepository(Record)
    private readonly recordsRepository: Repository<Record>,
  ) {}

  create(record: RecordDTO) {
    return this.recordsRepository.save(record);
  }

  update(id: number, record: RecordDTO) {
    return this.recordsRepository.update(id, record);
  }

  findAll(): Promise<Record[]> {
    return this.recordsRepository.find();
  }

  findById(id: number): Promise<Record | null> {
    return this.recordsRepository.findOneBy({ id });
  }

  findBy(options: FindOptionsWhere<Record>) {
    return this.recordsRepository.findBy(options);
  }

  remove(id: number) {
    return this.recordsRepository.delete(id);
  }
}
