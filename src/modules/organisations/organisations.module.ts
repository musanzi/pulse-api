import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganisationsController } from './controllers/organisations.controller';
import { Organisation } from './entities/organisation.entity';
import { OrganisationMember } from './entities/organisation-member.entity';
import { CommandHandlers } from './commands/handlers';
import { QueryHandlers } from './queries/handlers';

@Module({
  imports: [TypeOrmModule.forFeature([Organisation, OrganisationMember])],
  controllers: [OrganisationsController],
  providers: [...CommandHandlers, ...QueryHandlers]
})
export class OrganisationsModule {}
