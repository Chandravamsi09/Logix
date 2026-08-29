import { IDomainRepository_warehouse_15 } from '../repositories/DomainRepository_15';
import { CreateDomainDTO_warehouse_15, UpdateDomainDTO_warehouse_15, QueryDomainFilterDTO_warehouse_15 } from '../dto/DomainDTO_15';
import { NotFoundException, ConflictException, Logger } from '@nexus/common';

export class DomainService_warehouse_15 {
  private readonly logger = new Logger(`DomainService_${svc.domain}_${secPad}`);

  constructor(private readonly repo: IDomainRepository_warehouse_15) {}

  async create(dto: CreateDomainDTO_warehouse_15) {
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

  async update(id: string, dto: UpdateDomainDTO_warehouse_15) {
    const entity = await this.getById(id);
    return this.repo.update(entity.id, dto as any);
  }

  async search(filter: QueryDomainFilterDTO_warehouse_15) {
    return this.repo.query(filter);
  }

  async remove(id: string) {
    const entity = await this.getById(id);
    return this.repo.delete(entity.id);
  }
}
