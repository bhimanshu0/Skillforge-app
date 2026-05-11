import { Component, inject, OnInit, signal } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-iam',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './iam.html',
})
export class IamComponent implements OnInit {
  private svc = inject(UserService);
  users = signal<User[]>([]);
  loading = signal(true);
  search = signal('');
  toast = signal('');
  toastType = signal<'success' | 'error'>('success');

  selectedUser = signal<User | null>(null);
  showEditModal = signal(false);
  editStatus = signal('true');
  updateLoading = signal(false);

  rolePermissions = [
    { role: 'Employee', cap: 'Enroll, attend, take assessments' },
    { role: 'Trainer', cap: 'Create courses, manage assessments' },
    { role: 'Manager', cap: 'Assign training, view team progress' },
    { role: 'HR', cap: 'Compliance, audits, reports' },
    { role: 'Admin', cap: 'Configure catalogs, users, workflows' },
  ];

  ngOnInit() {
    this.svc.getAll().subscribe({
      next: data => { this.users.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  get filtered() {
    const q = this.search().toLowerCase();
    return q ? this.users().filter(u => u.userName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) : this.users();
  }

  openEdit(user: User) {
    this.selectedUser.set(user);
    this.editStatus.set(user.status ? 'true' : 'false');
    this.showEditModal.set(true);
  }

  closeEdit() {
    this.showEditModal.set(false);
    this.selectedUser.set(null);
  }

  submitUpdate() {
    const user = this.selectedUser();
    if (!user) return;
    this.updateLoading.set(true);
    const newStatus = this.editStatus() === 'true';
    this.svc.updateStatus(user.userID, newStatus).subscribe({
      next: () => {
        this.users.update(list =>
          list.map(u => u.userID === user.userID ? { ...u, status: newStatus } : u)
        );
        this.closeEdit();
        this.updateLoading.set(false);
        this.showToast('User status updated successfully!', 'success');
      },
      error: err => {
        const msg = err?.error?.message ?? 'Failed to update user status.';
        this.showToast(msg, 'error');
        this.updateLoading.set(false);
      }
    });
  }

  deleteUser(id: number, name: string) {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    this.svc.delete(id).subscribe({
      next: () => {
        this.users.update(list => list.filter(u => u.userID !== id));
        this.showToast('User deleted successfully.', 'success');
      },
      error: err => {
        this.showToast(err?.error ?? 'Delete failed.', 'error');
      }
    });
  }

  showToast(msg: string, type: 'success' | 'error') {
    this.toast.set(msg);
    this.toastType.set(type);
    setTimeout(() => this.toast.set(''), 3000);
  }
}
