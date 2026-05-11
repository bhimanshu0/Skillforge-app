import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-competency',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent],
  templateUrl: './competency.html',
})
export class CompetencyComponent {
  matrix = [
    { name: 'Secure Coding', description: 'OWASP Top 10', level: 'Intermediate', gap: 'Medium' },
    { name: 'Cloud Basics', description: 'Azure fundamentals', level: 'Beginner', gap: 'High' },
    { name: 'First Aid', description: 'Emergency response', level: 'Advanced', gap: 'None' },
  ];
}
