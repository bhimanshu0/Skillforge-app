import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-assessments',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent],
  templateUrl: './assessments.html',
})
export class AssessmentsComponent {
  readonly auth = inject(AuthService);
  get canCreate() { return this.auth.hasRole('Trainer', 'Admin'); }

  assessments = [
    { course: 'Secure Coding 101', type: 'Quiz', maxScore: 50, date: 'Mar 04' },
    { course: 'Azure Fundamentals', type: 'Exam', maxScore: 100, date: 'Mar 09' },
  ];

  certifications = [
    { employee: 'I. Khan', course: 'Secure Coding 101', issued: 'Jan 12', expiry: 'Jan 12, 2027', status: 'Active' },
    { employee: 'A. Das', course: 'First Aid Basics', issued: 'Feb 01', expiry: 'Feb 01, 2026', status: 'Expiring' },
  ];
}
