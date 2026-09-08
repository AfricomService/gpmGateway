import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { OtExterneFormService, OtExterneFormGroup } from './ot-externe-form.service';
import { IOtExterne } from '../ot-externe.model';
import { OtExterneService } from '../service/ot-externe.service';
import { StatutOtExterne } from 'app/entities/enumerations/statut-ot-externe.model';

import { AffaireService } from 'app/entities/projectService/affaire/service/affaire.service';
import { IAffaire } from 'app/entities/projectService/affaire/affaire.model';
import { ClientService } from 'app/entities/projectService/client/service/client.service';
import { IClient } from 'app/entities/projectService/client/client.model';
import { BonCommandeService } from 'app/entities/financeService/bon-commande/service/bon-commande.service';
import { IBonCommande } from 'app/entities/financeService/bon-commande/bon-commande.model';

type ModeCreation = 'MODELE' | 'LIBRE';
type AccordionPanel = 'global' | 'mode' | 'modele';

@Component({
  selector: 'jhi-ot-externe-update',
  templateUrl: './ot-externe-update.component.html',
  styleUrls: ['./ot-externe-update.component.scss'],
})
export class OtExterneUpdateComponent implements OnInit {
  isSaving = false;
  otExterne: IOtExterne | null = null;
  statutOtExterneValues = Object.keys(StatutOtExterne);

  affaires: IAffaire[] = [];
  clients: IClient[] = [];
  bonCommandes: IBonCommande[] = [];

  modeCreation: ModeCreation = 'MODELE';

  // ================================
  // Accordéon (état purement visuel — même pattern que bon-commande-update)
  // ================================
  openPanels: Set<AccordionPanel> = new Set(['global', 'mode']);

  editForm: OtExterneFormGroup = this.otExterneFormService.createOtExterneFormGroup();

  constructor(
    protected otExterneService: OtExterneService,
    protected otExterneFormService: OtExterneFormService,
    protected activatedRoute: ActivatedRoute,
    protected affaireService: AffaireService,
    protected clientService: ClientService,
    protected bonCommandeService: BonCommandeService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ otExterne }) => {
      this.otExterne = otExterne;
      if (otExterne) {
        this.updateForm(otExterne);
      }
    });

    this.loadAffaires();
    this.loadClients();
    this.loadBonCommandes();
  }

  // ================================
  // Accordéon
  // ================================
  togglePanel(panel: AccordionPanel): void {
    if (this.openPanels.has(panel)) {
      this.openPanels.delete(panel);
    } else {
      this.openPanels.add(panel);
    }
  }

  isPanelOpen(panel: AccordionPanel): boolean {
    return this.openPanels.has(panel);
  }

  selectModeCreation(mode: ModeCreation): void {
    this.modeCreation = mode;
    if (mode === 'LIBRE') {
      this.editForm.patchValue({ modeleOtId: null });
    }
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const otExterne = this.otExterneFormService.getOtExterne(this.editForm);
    if (otExterne.id !== null) {
      this.subscribeToSaveResponse(this.otExterneService.update(otExterne));
    } else {
      this.subscribeToSaveResponse(this.otExterneService.create(otExterne));
    }
  }

  protected loadAffaires(): void {
    this.affaireService.query().subscribe(res => (this.affaires = res.body ?? []));
  }

  protected loadClients(): void {
    this.clientService.query().subscribe(res => (this.clients = res.body ?? []));
  }

  protected loadBonCommandes(): void {
    this.bonCommandeService.query().subscribe(res => (this.bonCommandes = res.body ?? []));
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IOtExterne>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(otExterne: IOtExterne): void {
    this.otExterne = otExterne;
    this.otExterneFormService.resetForm(this.editForm, otExterne);
    // Si l'OT a déjà un modèle associé (via un futur champ modeleOtId), on force le mode "MODELE"
    this.modeCreation = (otExterne as any).modeleOtId ? 'MODELE' : this.modeCreation;
  }
}
