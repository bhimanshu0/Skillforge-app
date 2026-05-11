import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';
import { SpinnerComponent } from '../../shared/components/spinner/spinner';
import { ComplianceService } from '../../core/services/compliance.service';
import { AuthService } from '../../core/services/auth.service';
import { ComplianceSummary, AuditLogItem } from '../../core/models';

@Component({
  selector: 'app-compliance',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, SpinnerComponent],
  templateUrl: './compliance.html',
})
export class ComplianceComponent implements OnInit {
  private svc = inject(ComplianceService);
  readonly auth = inject(AuthService);

  summary = signal<ComplianceSummary | null>(null);
  auditLogs = signal<AuditLogItem[]>([]);

  complianceLoading = signal(false);
  auditLoading = signal(false);
  refreshLoading = signal(false);

  toast = signal('');
  toastType = signal<'success' | 'error'>('success');

  get isHR() { return this.auth.hasRole('HR'); }
  get isAdminOrHR() { return this.auth.hasRole('Admin', 'HR'); }

  ngOnInit() {
    if (this.isHR) this.loadSummary();
    if (this.isAdminOrHR) this.loadAuditLogs();
  }

  loadSummary() {
    this.complianceLoading.set(true);
    this.svc.getComplianceSummary().subscribe({
      next: data => { this.summary.set(data); this.complianceLoading.set(false); },
      error: () => { this.complianceLoading.set(false); }
    });
  }

  loadAuditLogs() {
    this.auditLoading.set(true);
    this.svc.getAuditLogs().subscribe({
      next: logs => { this.auditLogs.set(logs); this.auditLoading.set(false); },
      error: () => { this.auditLoading.set(false); }
    });
  }

  runComplianceCheck() {
    this.refreshLoading.set(true);
    this.svc.runComplianceCheck().subscribe({
      next: msg => {
        this.showToast(msg || 'Compliance records refreshed.', 'success');
        this.refreshLoading.set(false);
        this.loadSummary();
      },
      error: err => {
        this.showToast(err?.error?.message ?? 'Compliance check failed.', 'error');
        this.refreshLoading.set(false);
      }
    });
  }

  complianceStatus(status: boolean) { return status ? 'Compliant' : 'Non-Compliant'; }

  showToast(msg: string, type: 'success' | 'error') {
    this.toast.set(msg);
    this.toastType.set(type);
    setTimeout(() => this.toast.set(''), 4000);
  }
}
