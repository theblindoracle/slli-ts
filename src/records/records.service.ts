import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Record } from './records.entity';
import { RecordDTO } from './records.dto';

@Injectable()
export class RecordsService {
  constructor(
    @InjectRepository(Record)
    private readonly recordsRepositoy: Repository<Record>,
  ) {}

  create(record: RecordDTO) {
    return this.recordsRepositoy.save(record);
  }

  update(id: number, record: RecordDTO) {
    return this.recordsRepositoy.update(id, record);
  }

  findAll(): Promise<Record[]> {
    return this.recordsRepositoy.find();
  }

  findById(id: number): Promise<Record | null> {
    return this.recordsRepositoy.findOneBy({ id });
  }

  findBy(options: FindOptionsWhere<Record>) {
    return this.recordsRepositoy.findBy(options);
  }

  remove(id: number) {
    return this.recordsRepositoy.delete(id);
  }
}
