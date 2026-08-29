import { IDomainRepository_alerting_16 } from '../repositories/DomainRepository_16';
import { CreateDomainDTO_alerting_16, UpdateDomainDTO_alerting_16, QueryDomainFilterDTO_alerting_16 } from '../dto/DomainDTO_16';
import { NotFoundException, ConflictException, Logger } from '@nexus/common';

export class DomainService_alerting_16 {
  private readonly logger = new Logger(`DomainService_${svc.domain}_${secPad}`);

  constructor(private readonly repo: IDomainRepository_alerting_16) {}

  async create(dto: CreateDomainDTO_alerting_16) {
    const existing = await this.repo.findByCode(dto.code, dto.tenantId);
    if (existing) {
      throw new ConflictException(`Entity with code '${dto.code}' already exists.`);
    }

    const entity = await this.repo.create(dto);
    this.logger.info(`Created entity ${entity.id} in section ${secPad}`);
    return entity;
  }

  async getById(id: string) {
    const entity = await this.repo.findById(id);
    if (!entity) {
      throw new NotFoundException(`DomainEntity_${svc.domain}_${secPad}`, id);
    }
    return entity;
  }

  async update(id: string, dto: UpdateDomainDTO_alerting_16) {
    const entity = await this.getById(id);
    return this.repo.update(entity.id, dto as any);
  }

  async search(filter: QueryDomainFilterDTO_alerting_16) {
    return this.repo.query(filter);
  }

  async remove(id: string) {
    const entity = await this.getById(id);
    return this.repo.delete(entity.id);
  }
}
