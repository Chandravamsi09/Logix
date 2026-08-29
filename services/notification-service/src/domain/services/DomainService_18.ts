import { IDomainRepository_alerting_18 } from '../repositories/DomainRepository_18';
import { CreateDomainDTO_alerting_18, UpdateDomainDTO_alerting_18, QueryDomainFilterDTO_alerting_18 } from '../dto/DomainDTO_18';
import { NotFoundException, ConflictException, Logger } from '@nexus/common';

export class DomainService_alerting_18 {
  private readonly logger = new Logger(`DomainService_${svc.domain}_${secPad}`);

  constructor(private readonly repo: IDomainRepository_alerting_18) {}

  async create(dto: CreateDomainDTO_alerting_18) {
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

  async update(id: string, dto: UpdateDomainDTO_alerting_18) {
    const entity = await this.getById(id);
    return this.repo.update(entity.id, dto as any);
  }

  async search(filter: QueryDomainFilterDTO_alerting_18) {
    return this.repo.query(filter);
  }

  async remove(id: string) {
    const entity = await this.getById(id);
    return this.repo.delete(entity.id);
  }
}
