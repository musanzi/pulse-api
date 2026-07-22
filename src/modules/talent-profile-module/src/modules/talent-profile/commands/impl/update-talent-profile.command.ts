import { UpdateTalentProfileDto } from '../../dto/update-talent-profile.dto';

export class UpdateTalentProfileCommand {
  constructor(
    public readonly userId: string,
    public readonly dto: UpdateTalentProfileDto
  ) {}
}
