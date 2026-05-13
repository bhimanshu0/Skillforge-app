import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CourseService } from '../../core/services/course.service';
import { ModuleService } from '../../core/services/module.service';
import { Module, Course, CreateModuleRequest, UpdateModuleRequest } from '../../core/models';
import { SharedModule } from '../../shared/shared.module';

/** Validate that a string is a plausible URL. */
function uriValidator(control: AbstractControl): ValidationErrors | null {
  const v: string = control.value ?? '';
  if (!v) return null;
  try { new URL(v); return null; }
  catch { return { invalidUri: true }; }
}

@Component({
  selector: 'app-modules',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './modules.html',
})
export class ModulesComponent implements OnInit {
  readonly auth     = inject(AuthService);
  private moduleSvc = inject(ModuleService);
  private courseSvc = inject(CourseService);
  private fb        = inject(FormBuilder);

  readonly role = this.auth.userRole;

  // Data 
  modules = signal<Module[]>([]);
  courses = signal<Course[]>([]);
  loading = signal(true);

  //  Filters 
  searchTerm   = signal('');
  statusFilter = signal('All');
  courseFilter = signal<number | 'All'>('All');

  // Toast
  toast     = signal('');
  toastType = signal<'success' | 'error'>('success');

  // Create model
  showCreateModal = signal(false);
  createLoading   = signal(false);

  createForm = this.fb.group({
    courseID:   [null as number | null, [Validators.required]],
    title:      ['', [Validators.required, Validators.maxLength(20)]],
    contentURI: ['', [Validators.required, Validators.maxLength(50), uriValidator]],
    duration:   [1,  [Validators.required, Validators.min(0.5), Validators.max(100)]],
  });

  /** True when the selected course is Live — backend only allows modules on Draft courses */
  selectedCourseIsLive = computed(() => {
    const id = this.createForm.get('courseID')?.value;
    if (!id) return false;
    const course = this.courses().find(c => c.courseID === +id);
    return course?.status === true;
  });

  // View model
  selectedModule = signal<Module | null>(null);
  showViewModal  = signal(false);

  // Edit model
  showEditModal = signal(false);
  editLoading   = signal(false);

  editForm = this.fb.group({
    title:      ['', [Validators.required, Validators.maxLength(20)]],
    contentURI: ['', [Validators.required, Validators.maxLength(50), uriValidator]],
    duration:   [1,  [Validators.required, Validators.min(0.5), Validators.max(100)]],
    status:     ['false'],
  });

  // Delete confirm
  showDeleteModal = signal(false);
  deleteLoading   = signal(false);

  // Permissions 
  get canCreate() { return this.auth.hasRole('Trainer', 'Admin'); }
  get canEdit()   { return this.auth.hasRole('Trainer', 'Admin'); }
  get canDelete() { return this.auth.hasRole('Trainer', 'Admin'); }  // ← updated

  // Computed list 
  filteredModules = computed(() => {
    let list = this.modules();
    const term = this.searchTerm().toLowerCase();
    if (term) list = list.filter(m =>
      m.title.toLowerCase().includes(term) ||
      m.contentURI?.toLowerCase().includes(term)
    );
    if (this.statusFilter() !== 'All') {
      const active = this.statusFilter() === 'Active';
      list = list.filter(m => m.status === active);
    }
    if (this.courseFilter() !== 'All') {
      list = list.filter(m => m.courseID === this.courseFilter());
    }
    return list;
  });

  courseTitle(id: number): string {
    return this.courses().find(c => c.courseID === id)?.title ?? `Course #${id}`;
  }

  //  Lifecycle
  ngOnInit() {
    this.loadCourses();
    this.loadModules();
  }

  loadModules() {
    this.loading.set(true);
    this.moduleSvc.getAll().subscribe({
      next: data => { this.modules.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  private silentRefresh() {
    this.moduleSvc.getAll().subscribe({
      next: data => this.modules.set(data),
      error: () => {},
    });
  }

  loadCourses() {
    this.courseSvc.getAll().subscribe({
      next: data => this.courses.set(data),
      error: () => {},
    });
  }

  // Create
  openCreate() { this.showCreateModal.set(true); }

  closeCreate() {
    this.showCreateModal.set(false);
    this.createForm.reset({ duration: 1 });
  }

  submitCreate() {
    if (this.createForm.invalid) { this.createForm.markAllAsTouched(); return; }
    if (this.selectedCourseIsLive()) return;
    this.createLoading.set(true);
    const { courseID, title, contentURI, duration } = this.createForm.value as any;
    const payload: CreateModuleRequest = {
      courseID: +courseID,
      title,
      contentURI,
      duration: +duration,
      status: false,
    };
    this.moduleSvc.create(payload).subscribe({
      next: () => {
        this.closeCreate();
        this.showToast('Module created successfully!', 'success');
        this.createLoading.set(false);
        this.silentRefresh();
      },
      error: err => {
        const msg = err?.error?.message ?? err?.error?.title ?? 'Failed to create module.';
        this.showToast(msg, 'error');
        this.createLoading.set(false);
      },
    });
  }

  // View 
  openView(m: Module) { this.selectedModule.set(m); this.showViewModal.set(true); }
  closeView() { this.showViewModal.set(false); this.selectedModule.set(null); }

  //  Edit 
  openEdit(m: Module) {
    this.selectedModule.set(m);
    this.editForm.patchValue({
      title:      m.title,
      contentURI: m.contentURI,
      duration:   m.duration,
      status:     m.status ? 'true' : 'false',
    });
    this.showEditModal.set(true);
  }

  closeEdit() { this.showEditModal.set(false); this.selectedModule.set(null); }

  submitEdit() {
    if (this.editForm.invalid) { this.editForm.markAllAsTouched(); return; }
    const m = this.selectedModule();
    if (!m) return;
    this.editLoading.set(true);
    const { title, contentURI, duration, status } = this.editForm.value as any;
    const payload: UpdateModuleRequest = {
      title,
      contentURI,
      duration: +duration,
      status: status === 'true',
    };
    this.moduleSvc.update(m.moduleID, payload).subscribe({
      next: () => {
        this.modules.update(list =>
          list.map(x => x.moduleID === m.moduleID ? { ...x, ...payload } : x)
        );
        this.closeEdit();
        this.editLoading.set(false);
        this.showToast('Module updated successfully!', 'success');
      },
      error: err => {
        const msg = err?.error?.message ?? 'Failed to update module.';
        this.showToast(msg, 'error');
        this.editLoading.set(false);
      },
    });
  }

  // Delete 
  openDelete(m: Module) { this.selectedModule.set(m); this.showDeleteModal.set(true); }
  closeDelete() { this.showDeleteModal.set(false); this.selectedModule.set(null); }

  confirmDelete() {
    const m = this.selectedModule();
    if (!m) return;
    this.deleteLoading.set(true);
    this.moduleSvc.delete(m.moduleID).subscribe({
      next: () => {
        this.modules.update(list => list.filter(x => x.moduleID !== m.moduleID));
        this.closeDelete();
        this.deleteLoading.set(false);
        this.showToast('Module deleted.', 'success');
      },
      error: err => {
        const msg = err?.error?.message ?? 'Failed to delete module.';
        this.showToast(msg, 'error');
        this.deleteLoading.set(false);
      },
    });
  }

  //  Toast
  showToast(msg: string, type: 'success' | 'error') {
    this.toast.set(msg); this.toastType.set(type);
    setTimeout(() => this.toast.set(''), 3500);
  }
}