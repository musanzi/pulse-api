export class AddSkillsBatchCommand {
  constructor(
    public readonly userId: string,
    public readonly names: string[]
  ) {}
}
