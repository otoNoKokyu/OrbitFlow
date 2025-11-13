export enum RoleEnum {
    GUEST = 'GUEST',
    DEV = 'DEV',
    MANAGER = 'MANAGER',
    LEAD = 'LEAD',
    PRODUCT_OWNER = 'PRODUCT_OWNER',
    QA = 'QA',
    ADMIN = 'ADMIN',
    PLATFORM_ADMIN = 'SUPER_ADMIN'
  }
export const RoleHierarchy: Record<RoleEnum, number> = {
  [RoleEnum.GUEST]: 1,
  [RoleEnum.DEV]: 2,
  [RoleEnum.MANAGER]: 4,
  [RoleEnum.LEAD]: 3,
  [RoleEnum.PRODUCT_OWNER]: 5,
  [RoleEnum.QA]: 2,
  [RoleEnum.ADMIN]: 7,
  [RoleEnum.PLATFORM_ADMIN]: 8,
};
export enum EligbleInviteRole {
  Inviter =  RoleEnum.ADMIN
}
