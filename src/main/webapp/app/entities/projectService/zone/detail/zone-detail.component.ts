import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IZone } from '../zone.model';
import { IVille } from '../../ville/ville.model';
import { VilleService } from '../../ville/service/ville.service';

@Component({
  selector: 'jhi-zone-detail',
  templateUrl: './zone-detail.component.html',
})
export class ZoneDetailComponent implements OnInit {
  zone: IZone | null = null;
  villes: IVille[] = [];

  constructor(protected activatedRoute: ActivatedRoute, protected villeService: VilleService) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ zone }) => {
      this.zone = zone;
      if (zone?.id) {
        this.loadVilles(zone.id);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  protected loadVilles(zoneId: number): void {
    this.villeService.findAllByZoneId(zoneId).subscribe({
      next: res => (this.villes = res.body ?? []),
      error: () => (this.villes = []),
    });
  }
}
