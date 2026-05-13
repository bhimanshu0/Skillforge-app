import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { MainLayoutComponent } from './shared/layout/main-layout/main-layout';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login').then(m => m.LoginComponent),
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/auth/signup/signup').then(m => m.SignupComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/auth/forgot-password/forgot-password').then(m => m.ForgotPasswordComponent),
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent) },
      { path: 'catalog', loadComponent: () => import('./pages/catalog/catalog').then(m => m.CatalogComponent) },
      { path: 'modules', loadComponent: () => import('./pages/modules/modules').then(m => m.ModulesComponent) },
      { path: 'enrollment', loadComponent: () => import('./pages/enrollment/enrollment').then(m => m.EnrollmentComponent) },
      { path: 'assessments', loadComponent: () => import('./pages/assessments/assessments').then(m => m.AssessmentsComponent) },
      { path: 'competency', loadComponent: () => import('./pages/competency/competency').then(m => m.CompetencyComponent) },
      { path: 'compliance', loadComponent: () => import('./pages/compliance/compliance').then(m => m.ComplianceComponent), canActivate: [roleGuard('Manager', 'HR', 'Admin')] },
      { path: 'reports', loadComponent: () => import('./pages/reports/reports').then(m => m.ReportsComponent), canActivate: [roleGuard('Manager', 'HR', 'Admin')] },
      { path: 'notifications', loadComponent: () => import('./pages/notifications/notifications').then(m => m.NotificationsComponent) },
      { path: 'iam', loadComponent: () => import('./pages/iam/iam').then(m => m.IamComponent), canActivate: [roleGuard('Admin')] },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
