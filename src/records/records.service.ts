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

  async createOrUpdate(recordDTO: RecordDTO) {
    const rec = await this.recordsRepository.findOneBy({
      recordLevel: recordDTO.recordLevel,
      equipmentLevel: recordDTO.equipmentLevel,
      division: recordDTO.division,
      discipline: recordDTO.discipline,
      weightClassID: recordDTO.weightClassID,
      sex: recordDTO.sex,
      // state: recordDTO.state,
    });

    if (rec) {
      rec.weight = recordDTO.weight;
      return this.recordsRepository.save(rec);
    }

    return this.recordsRepository.save(recordDTO);
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
