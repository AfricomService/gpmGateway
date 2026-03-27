import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { AffaireFormService, AffaireFormGroup } from './affaire-form.service';
import { IAffaire } from '../affaire.model';
import { AffaireService } from '../service/affaire.service';
import { IClient } from 'app/entities/projectService/client/client.model';
import { ClientService } from 'app/entities/projectService/client/service/client.service';
import { StatutAffaire } from 'app/entities/enumerations/statut-affaire.model';
import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/user.service';

import { IArticle } from 'app/entities/projectService/article/article.model';
import { ArticleService } from 'app/entities/projectService/article/service/article.service';
import { IMatriceFacturation } from 'app/entities/projectService/matrice-facturation/matrice-facturation.model';
import { MatriceFacturationService } from 'app/entities/projectService/matrice-facturation/service/matrice-facturation.service';
import { AffaireArticleService } from 'app/entities/projectService/affaire-article/service/affaire-article.service';
import { IAffaireArticle } from 'app/entities/projectService/affaire-article/affaire-article.model';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ViewChild, TemplateRef } from '@angular/core';

@Component({
  selector: 'jhi-affaire-update',
  templateUrl: './affaire-update.component.html',
})
export class AffaireUpdateComponent implements OnInit {
  @ViewChild('articleModal') articleModal!: TemplateRef<any>;
  isSaving = false;
  affaire: IAffaire | null = null;
  statutAffaireValues = Object.keys(StatutAffaire);

  clientsSharedCollection: IClient[] = [];
  usersSharedCollection: IUser[] = [];
  selectedResponsable: IUser | null = null;

  allArticles: IArticle[] = [];
  selectedArticles: IArticle[] = [];
  tempSelectedArticles: IArticle[] = [];

  allMatrices: IMatriceFacturation[] = [];
  selectedMatrices: IMatriceFacturation[] = [];

  articleSearchTerm = '';
  matriceSearchTerm = '';

  editForm: AffaireFormGroup = this.affaireFormService.createAffaireFormGroup();

  constructor(
    protected affaireService: AffaireService,
    protected affaireFormService: AffaireFormService,
    protected clientService: ClientService,
    protected userService: UserService,
    protected articleService: ArticleService,
    protected affaireArticleService: AffaireArticleService,
    protected matriceFacturationService: MatriceFacturationService,
    protected activatedRoute: ActivatedRoute,
    protected modalService: NgbModal
  ) {}

  openArticleModal(): void {
    this.tempSelectedArticles = [...this.selectedArticles];
    this.modalService.open(this.articleModal, {
      size: 'lg',
      backdrop: 'static',
      centered: true,
    });
  }

  removeArticle(article: IArticle): void {
    this.selectedArticles = this.selectedArticles.filter(a => a.id !== article.id);
  }

  compareClient = (o1: IClient | null, o2: IClient | null): boolean => this.clientService.compareClient(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ affaire }) => {
      this.affaire = affaire;
      if (affaire) {
        this.updateForm(affaire);
      }

      this.loadRelationshipsOptions();
    });
  }

  toggleTempArticleSelection(article: IArticle): void {
    const index = this.tempSelectedArticles.findIndex(a => a.id === article.id);
    if (index > -1) {
      this.tempSelectedArticles.splice(index, 1);
    } else {
      this.tempSelectedArticles.push(article);
    }
  }

  isTempArticleSelected(article: IArticle): boolean {
    return this.tempSelectedArticles.findIndex(a => a.id === article.id) > -1;
  }

  confirmArticleSelection(modal: any): void {
    this.selectedArticles = [...this.tempSelectedArticles];
    modal.close();
  }

  toggleMatriceSelection(matrice: IMatriceFacturation): void {
    const index = this.selectedMatrices.findIndex(m => m.id === matrice.id);
    if (index > -1) {
      this.selectedMatrices.splice(index, 1);
    } else {
      this.selectedMatrices.push(matrice);
    }
  }

  isMatriceSelected(matrice: IMatriceFacturation): boolean {
    return this.selectedMatrices.findIndex(m => m.id === matrice.id) > -1;
  }

  get filteredArticles(): IArticle[] {
    if (!this.articleSearchTerm) {
      return this.allArticles;
    }
    const term = this.articleSearchTerm.toLowerCase();
    return this.allArticles.filter(
      article => (article.code?.toLowerCase() ?? '').includes(term) || (article.designation?.toLowerCase() ?? '').includes(term)
    );
  }

  get filteredMatrices(): IMatriceFacturation[] {
    if (!this.matriceSearchTerm) {
      return this.allMatrices;
    }
    const term = this.matriceSearchTerm.toLowerCase();
    return this.allMatrices.filter(
      matrice =>
        (matrice.affaire?.designationAffaire?.toLowerCase() ?? '').includes(term) ||
        (matrice.ville?.nom?.toLowerCase() ?? '').includes(term) ||
        (matrice.zone?.nom?.toLowerCase() ?? '').includes(term)
    );
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;

    if (this.selectedResponsable) {
      this.editForm.patchValue({
        responsableProjetId: this.selectedResponsable.id,
        responsableProjetUserLogin: this.selectedResponsable.login,
      });
    }

    const affaire = this.affaireFormService.getAffaire(this.editForm);
    if (affaire.id !== null) {
      this.subscribeToSaveResponse(this.affaireService.update(affaire));
    } else {
      this.subscribeToSaveResponse(this.affaireService.create(affaire));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IAffaire>>): void {
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

  protected updateForm(affaire: IAffaire): void {
    this.affaire = affaire;
    this.affaireFormService.resetForm(this.editForm, affaire);

    if (affaire.responsableProjetId && affaire.responsableProjetUserLogin) {
      this.selectedResponsable = {
        id: affaire.responsableProjetId,
        login: affaire.responsableProjetUserLogin,
      };
    }

    this.clientsSharedCollection = this.clientService.addClientToCollectionIfMissing<IClient>(this.clientsSharedCollection, affaire.client);

    if (affaire.id) {
      this.affaireArticleService.findByAffaireId(affaire.id).subscribe((res: HttpResponse<IAffaireArticle[]>) => {
        const affaireArticles = res.body ?? [];
        this.selectedArticles = affaireArticles.filter(aa => aa.article).map(aa => aa.article as IArticle);
      });

      this.matriceFacturationService.findMatriceByAffaireId(affaire.id).subscribe((res: HttpResponse<IMatriceFacturation[]>) => {
        const matrices = res.body ?? [];
        // We might need to map them back, or directly assign if they are the objects.
        this.selectedMatrices = matrices;
      });
    }
  }

  protected loadRelationshipsOptions(): void {
    this.clientService
      .query()
      .pipe(map((res: HttpResponse<IClient[]>) => res.body ?? []))
      .pipe(map((clients: IClient[]) => this.clientService.addClientToCollectionIfMissing<IClient>(clients, this.affaire?.client)))
      .subscribe((clients: IClient[]) => (this.clientsSharedCollection = clients));

    this.userService
      .query()
      .pipe(map((res: HttpResponse<IUser[]>) => res.body ?? []))
      .subscribe((users: IUser[]) => {
        this.usersSharedCollection = users;
        if (this.selectedResponsable && !this.usersSharedCollection.find(u => u.id === this.selectedResponsable?.id)) {
          this.usersSharedCollection = [this.selectedResponsable, ...this.usersSharedCollection];
        }
      });

    this.articleService
      .query()
      .pipe(map((res: HttpResponse<IArticle[]>) => res.body ?? []))
      .subscribe((articles: IArticle[]) => {
        this.allArticles = articles;
      });

    this.matriceFacturationService
      .query()
      .pipe(map((res: HttpResponse<IMatriceFacturation[]>) => res.body ?? []))
      .subscribe((matrices: IMatriceFacturation[]) => {
        this.allMatrices = matrices;
      });
  }
}
