import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CourseService } from '../../core/services/course.service';
import { NotificationService } from '../../core/services/notification.service';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SharedModule, RouterLink],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit {
  readonly auth = inject(AuthService);
  private courses = inject(CourseService);
  private notifications = inject(NotificationService);

  readonly role = this.auth.userRole;
  readonly userName = this.auth.userName;

  courseCount = signal(0);
  notifCount = signal(0);
  loading = signal(true);

  upcomingEvents = [
    { date: 'Mar 03', course: 'Secure Coding 101', type: 'Live', status: 'Scheduled' },
    { date: 'Mar 06', course: 'First Aid Basics', type: 'Live', status: 'Mandatory' },
    { date: 'Mar 10', course: 'Azure Fundamentals', type: 'Virtual', status: 'Waitlist' },
  ];

  ngOnInit() {
    this.courses.getAll().subscribe({
      next: (data) => { this.courseCount.set(data.length); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
    this.notifications.getAll().subscribe({
      next: (data: any[]) => this.notifCount.set(data.length),
      error: () => {}
    });
  }

  get isEmployee() { return this.role() === 'Employee'; }
  get isTrainer()  { return this.role() === 'Trainer'; }
  get isManager()  { return this.role() === 'Manager'; }
  get isHR()       { return this.role() === 'HR'; }
  get isAdmin()    { return this.role() === 'Admin'; }
}
