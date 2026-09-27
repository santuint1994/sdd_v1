export interface NavItem {
  label: string;
  href: string;
  roles: string[];
}

export const sidebarNavigation: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    roles: ['Super Admin', 'HR', 'Manager', 'Employee', 'IT'],
  },
];
