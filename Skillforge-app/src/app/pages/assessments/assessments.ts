// src/app/pages/assessments/assessments.ts

import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { AuthService } from '../../core/services/auth.service';
import { AssessmentService } from '../../core/services/assessment.service';
import { CourseService } from '../../core/services/course.service';
import {
  Assessment,
  AssessmentFilter,
  AssessmentResult,
  Course,
} from '../../core/models';

@Component({
  selector: 'app-assessments',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './assessments.html',
})
export class AssessmentsComponent implements OnInit {
  readonly auth    = inject(AuthService);
  private svc      = inject(AssessmentService);
  private courseSvc = inject(CourseService);
  private fb       = inject(FormBuilder);

  // ── Role helpers ──────────────────────────────────────────────────────────
  get canManage() { return this.auth.hasRole('Trainer'); }
  get canAccess() { return this.auth.hasRole('Trainer', 'Admin'); }
  // ── Data ──────────────────────────────────────────────────────────────────
  assessments  = signal<Assessment[]>([]);
  courses      = signal<Course[]>([]);
  loading      = signal(true);
  toast        = signal('');
  toastType    = signal<'success' | 'error'>('success');

  // ── Filter state ──────────────────────────────────────────────────────────
  filterCourseId = signal<number | null>(null);
  filterType     = signal('');
  filterFrom     = signal('');
  filterTo       = signal('');

  filteredAssessments = computed(() => {
    let list = this.assessments();
    const cid  = this.filterCourseId();
    const type = this.filterType();
    const from = this.filterFrom();
    const to   = this.filterTo();
    if (cid)  list = list.filter(a => a.courseId === cid);
    if (type) list = list.filter(a => a.type === type);
    if (from) list = list.filter(a => a.scheduledDate && a.scheduledDate >= from);
    if (to)   list = list.filter(a => a.scheduledDate && a.scheduledDate <= to);
    return list;
  });

  // ── Create modal ──────────────────────────────────────────────────────────
  showCreateModal  = signal(false);
  createLoading    = signal(false);

  createForm = this.fb.group({
    courseId:      [null as number | null, [Validators.required]],
    type:          ['Quiz', [Validators.required]],
    maxScore:      [100,    [Validators.required, Validators.min(1), Validators.max(100)]],
    scheduledDate: [''],
  });

  // ── View modal ────────────────────────────────────────────────────────────
  showViewModal   = signal(false);
  selectedAssessment = signal<Assessment | null>(null);
  viewResults     = signal<AssessmentResult[]>([]);
  viewLoading     = signal(false);

  // ── Edit modal ────────────────────────────────────────────────────────────
  showEditModal   = signal(false);
  editLoading     = signal(false);

  editForm = this.fb.group({
    type:          ['Quiz', [Validators.required]],
    maxScore:      [100,    [Validators.required, Validators.min(1), Validators.max(100)]],
    scheduledDate: [''],
  });

  // ── Results modal ─────────────────────────────────────────────────────────
  showResultsModal  = signal(false);
  resultsAssessment = signal<Assessment | null>(null);
  results           = signal<AssessmentResult[]>([]);
  resultsLoading    = signal(false);

  // Submit result form
  showSubmitResult = signal(false);
  submitResultLoading = signal(false);
  submitResultForm = this.fb.group({
    employeeId: [null as number | null, [Validators.required, Validators.min(1)]],
    score:      [0,  [Validators.required, Validators.min(0), Validators.max(100)]],
  });

  // Edit result inline
  editingResult   = signal<AssessmentResult | null>(null);
  editResultScore = signal(0);
  editResultLoading = signal(false);

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit() {
  if (!this.canAccess) return;
  this.loadCourses();
  this.loadAssessments();
}

  loadCourses() {
    const trainerId = this.auth.hasRole('Trainer') ? (this.auth.userId() ?? undefined) : undefined;
    this.courseSvc.getAll(trainerId).subscribe({
      next: data => this.courses.set(data),
      error: () => {}
    });
  }
  loadAssessments() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: data => { this.assessments.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.showToast('Failed to load assessments.', 'error'); }
    });
  }

  // ── Filter ────────────────────────────────────────────────────────────────
  resetFilters() {
    this.filterCourseId.set(null);
    this.filterType.set('');
    this.filterFrom.set('');
    this.filterTo.set('');
  }

  // ── Create ────────────────────────────────────────────────────────────────
  openCreate() { this.showCreateModal.set(true); }
  closeCreate() {
    this.showCreateModal.set(false);
    this.createForm.reset({ type: 'Quiz', maxScore: 100 });
  }

  submitCreate() {
    if (this.createForm.invalid) { this.createForm.markAllAsTouched(); return; }
    this.createLoading.set(true);
    const { courseId, type, maxScore, scheduledDate } = this.createForm.value as any;
    this.svc.create({ courseId, type, maxScore, scheduledDate: scheduledDate || undefined }).subscribe({
      next: () => {
        this.closeCreate();
        this.showToast('Assessment created successfully!', 'success');
        this.createLoading.set(false);
        this.silentRefresh();
      },
      error: err => {
        this.showToast(err?.error?.message ?? 'Failed to create assessment.', 'error');
        this.createLoading.set(false);
      }
    });
  }

  // ── View ──────────────────────────────────────────────────────────────────
  openView(a: Assessment) {
    this.selectedAssessment.set(a);
    this.showViewModal.set(true);
    this.viewLoading.set(true);
    this.svc.getById(a.assessmentId!).subscribe({
      next: full => { this.selectedAssessment.set(full); this.viewLoading.set(false); },
      error: () => this.viewLoading.set(false)
    });
  }
  closeView() { this.showViewModal.set(false); this.selectedAssessment.set(null); }

  // ── Edit ──────────────────────────────────────────────────────────────────
  openEdit(a: Assessment) {
    this.selectedAssessment.set(a);
    this.editForm.patchValue({
      type:          a.type ?? 'Quiz',
      maxScore:      a.maxScore ?? 100,
      scheduledDate: a.scheduledDate ? a.scheduledDate.substring(0, 10) : '',
    });
    this.showEditModal.set(true);
  }
  closeEdit() { this.showEditModal.set(false); this.selectedAssessment.set(null); }

  submitEdit() {
    if (this.editForm.invalid) { this.editForm.markAllAsTouched(); return; }
    const a = this.selectedAssessment();
    if (!a?.assessmentId) return;
    this.editLoading.set(true);
    const { type, maxScore, scheduledDate } = this.editForm.value as any;
    this.svc.update(a.assessmentId, { type, maxScore, scheduledDate: scheduledDate || undefined }).subscribe({
      next: () => {
        this.assessments.update(list =>
          list.map(item => item.assessmentId === a.assessmentId ? { ...item, type, maxScore, scheduledDate } : item)
        );
        this.closeEdit();
        this.editLoading.set(false);
        this.showToast('Assessment updated successfully!', 'success');
      },
      error: err => {
        this.showToast(err?.error?.message ?? 'Failed to update assessment.', 'error');
        this.editLoading.set(false);
      }
    });
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  confirmDelete(a: Assessment) {
    if (!confirm(`Delete assessment for "${a.courseName}" (${a.type})? This cannot be undone.`)) return;
    this.svc.delete(a.assessmentId!).subscribe({
      next: () => {
        this.assessments.update(list => list.filter(item => item.assessmentId !== a.assessmentId));
        this.showToast('Assessment deleted.', 'success');
      },
      error: err => this.showToast(err?.error?.message ?? 'Failed to delete.', 'error')
    });
  }

  // ── Results modal ─────────────────────────────────────────────────────────
  openResults(a: Assessment) {
    this.resultsAssessment.set(a);
    this.showResultsModal.set(true);
    this.loadResults(a.assessmentId!);
  }
  closeResults() {
    this.showResultsModal.set(false);
    this.resultsAssessment.set(null);
    this.results.set([]);
    this.showSubmitResult.set(false);
    this.editingResult.set(null);
    this.submitResultForm.reset({ score: 0 });
  }

  loadResults(assessmentId: number) {
    this.resultsLoading.set(true);
    this.svc.getResults(assessmentId).subscribe({
      next: data => { this.results.set(data); this.resultsLoading.set(false); },
      error: () => { this.results.set([]); this.resultsLoading.set(false); }
    });
  }

  // Submit new result
  submitResult() {
    if (this.submitResultForm.invalid) { this.submitResultForm.markAllAsTouched(); return; }
    const a = this.resultsAssessment();
    if (!a?.assessmentId) return;
    this.submitResultLoading.set(true);
    const { employeeId, score } = this.submitResultForm.value as any;
    this.svc.submitResult({ assessmentId: a.assessmentId, employeeId, score }).subscribe({
      next: () => {
        this.showToast('Result submitted!', 'success');
        this.submitResultLoading.set(false);
        this.showSubmitResult.set(false);
        this.submitResultForm.reset({ score: 0 });
        this.loadResults(a.assessmentId!);
      },
      error: err => {
        this.showToast(err?.error?.message ?? 'Failed to submit result.', 'error');
        this.submitResultLoading.set(false);
      }
    });
  }

  // Edit result inline
  startEditResult(r: AssessmentResult) {
    this.editingResult.set(r);
    this.editResultScore.set(r.score);
  }
  cancelEditResult() { this.editingResult.set(null); }

  saveEditResult() {
    const r = this.editingResult();
    const a = this.resultsAssessment();
    if (!r || !a) return;
    this.editResultLoading.set(true);
    this.svc.updateResult(r.assessmentID, r.employeeID, { score: this.editResultScore() }).subscribe({
      next: () => {
        this.results.update(list =>
          list.map(item =>
            item.employeeID === r.employeeID
              ? { ...item, score: this.editResultScore(), status: this.editResultScore() >= (a.maxScore! * 0.5) ? 'Pass' : 'Fail' }
              : item
          )
        );
        this.editingResult.set(null);
        this.editResultLoading.set(false);
        this.showToast('Result updated!', 'success');
      },
      error: err => {
        this.showToast(err?.error?.message ?? 'Failed to update result.', 'error');
        this.editResultLoading.set(false);
      }
    });
  }

  deleteResult(r: AssessmentResult) {
    if (!confirm(`Delete result for employee #${r.employeeID}?`)) return;
    const a = this.resultsAssessment();
    if (!a) return;
    this.svc.deleteResult(r.assessmentID, r.employeeID).subscribe({
      next: () => {
        this.results.update(list => list.filter(item => item.employeeID !== r.employeeID));
        this.showToast('Result deleted.', 'success');
      },
      error: err => this.showToast(err?.error?.message ?? 'Failed to delete result.', 'error')
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  getCourseName(courseId: number): string {
    return this.courses().find(c => c.courseID === courseId)?.title ?? `Course #${courseId}`;
  }

  scorePercent(score: number, maxScore: number): number {
    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  }

  private silentRefresh() {
    this.svc.getAll().subscribe({ next: data => this.assessments.set(data), error: () => {} });
  }

  showToast(msg: string, type: 'success' | 'error') {
    this.toast.set(msg);
    this.toastType.set(type);
    setTimeout(() => this.toast.set(''), 3500);
  }
}
