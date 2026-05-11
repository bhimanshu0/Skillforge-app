import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CourseService } from '../../core/services/course.service';
import { EnrollmentService } from '../../core/services/enrollment.service';
import { Course, CreateCourseRequest } from '../../core/models';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './catalog.html',
})
export class CatalogComponent implements OnInit {
  readonly auth = inject(AuthService);
  private courseService = inject(CourseService);
  private enrollmentService = inject(EnrollmentService);
  private fb = inject(FormBuilder);

  readonly role = this.auth.userRole;
  readonly userId = this.auth.userId;

  courses = signal<Course[]>([]);
  loading = signal(true);
  searchTerm = signal('');
  statusFilter = signal('All');
  toast = signal('');
  toastType = signal<'success' | 'error'>('success');

  showCreateModal = signal(false);
  createLoading = signal(false);

  selectedCourse = signal<Course | null>(null);
  showViewModal = signal(false);
  showEditModal = signal(false);
  editStatus = signal('false');
  updateLoading = signal(false);

  createForm = this.fb.group({
    title:       ['', [Validators.required, Validators.maxLength(20)]],
    description: ['', [Validators.required, Validators.maxLength(50)]],
    duration:    [1,  [Validators.required, Validators.min(1), Validators.max(100)]],
    status:      ['false'],
  });

  get canCreate() { return this.auth.hasRole('Trainer', 'Admin'); }
  get canEnroll() { return this.auth.hasRole('Employee'); }

  filteredCourses = computed(() => {
    let list = this.courses();
    const term = this.searchTerm().toLowerCase();
    if (term) list = list.filter(c => c.title.toLowerCase().includes(term) || c.description?.toLowerCase().includes(term));
    if (this.statusFilter() !== 'All') {
      const active = this.statusFilter() === 'Live';
      list = list.filter(c => c.status === active);
    }
    return list;
  });

  ngOnInit() {
    this.loadCourses();
  }

  get isTrainer() { return this.role() === 'Trainer'; }

  loadCourses() {
    this.loading.set(true);
    // Trainers only see courses they own; other roles see all
    const trainerId = this.isTrainer ? (this.userId() ?? undefined) : undefined;
    this.courseService.getAll(trainerId).subscribe({
      next: data => { this.courses.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openCreate() { this.showCreateModal.set(true); }
  closeCreate() { this.showCreateModal.set(false); this.createForm.reset({ duration: 1, status: 'false' }); }

  submitCreate() {
    if (this.createForm.invalid) { this.createForm.markAllAsTouched(); return; }
    this.createLoading.set(true);
    const tid = this.userId() ?? 0;
    const { title, description, duration, status } = this.createForm.value as any;
    const payload: CreateCourseRequest = { title, description, duration, status: status === 'true', trainerID: tid };

    this.courseService.create(payload).subscribe({
      next: () => {
        this.closeCreate();                        // close ONLY on confirmed success
        this.showToast('Course created successfully!', 'success');
        this.createLoading.set(false);
        this.silentRefresh();                      // fetch real data without spinner
      },
      error: err => {
        const msg = err?.error?.message ?? err?.error?.title ?? 'Failed to create course.';
        this.showToast(msg, 'error');
        this.createLoading.set(false);
      }
    });
  }

  private silentRefresh() {
    const trainerId = this.isTrainer ? (this.userId() ?? undefined) : undefined;
    this.courseService.getAll(trainerId).subscribe({
      next: data => this.courses.set(data),
      error: () => {}
    });
  }

  enroll(courseId: number) {
    const uid = this.userId();
    if (!uid) return;
    this.enrollmentService.enroll(courseId, uid).subscribe({
      next: () => this.showToast('Successfully enrolled!', 'success'),
      error: err => this.showToast(err?.error ?? 'Enrollment failed.', 'error')
    });
  }

  showToast(msg: string, type: 'success' | 'error') {
    this.toast.set(msg); this.toastType.set(type);
    setTimeout(() => this.toast.set(''), 3000);
  }

  openView(course: Course) {
    this.selectedCourse.set(course);
    this.showViewModal.set(true);
  }

  closeView() {
    this.showViewModal.set(false);
    this.selectedCourse.set(null);
  }

  openEdit(course: Course) {
    this.selectedCourse.set(course);
    this.editStatus.set(course.status ? 'true' : 'false');
    this.showEditModal.set(true);
  }

  closeEdit() {
    this.showEditModal.set(false);
    this.selectedCourse.set(null);
  }

  submitUpdate() {
    const course = this.selectedCourse();
    if (!course) return;
    this.updateLoading.set(true);
    const newStatus = this.editStatus() === 'true';
    this.courseService.updateStatus(course.courseID, newStatus).subscribe({
      next: () => {
        this.courses.update(list =>
          list.map(c => c.courseID === course.courseID ? { ...c, status: newStatus } : c)
        );
        this.closeEdit();
        this.updateLoading.set(false);
        this.showToast('Course status updated successfully!', 'success');
      },
      error: err => {
        const msg = err?.error?.message ?? 'Failed to update course status.';
        this.showToast(msg, 'error');
        this.updateLoading.set(false);
      }
    });
  }
}
