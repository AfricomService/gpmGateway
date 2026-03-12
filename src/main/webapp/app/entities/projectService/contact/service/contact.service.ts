import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IContact, NewContact } from '../contact.model';

export type PartialUpdateContact = Partial<IContact> & Pick<IContact, 'id'>;

type RestOf<T extends IContact | NewContact> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type RestContact = RestOf<IContact>;

export type NewRestContact = RestOf<NewContact>;

export type PartialUpdateRestContact = RestOf<PartialUpdateContact>;

export type EntityResponseType = HttpResponse<IContact>;
export type EntityArrayResponseType = HttpResponse<IContact[]>;

@Injectable({ providedIn: 'root' })
export class ContactService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/contacts', 'projectservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(contact: NewContact): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(contact);
    return this.http
      .post<RestContact>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(contact: IContact): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(contact);
    return this.http
      .put<RestContact>(`${this.resourceUrl}/${this.getContactIdentifier(contact)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(contact: PartialUpdateContact): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(contact);
    return this.http
      .patch<RestContact>(`${this.resourceUrl}/${this.getContactIdentifier(contact)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestContact>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestContact[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getContactIdentifier(contact: Pick<IContact, 'id'>): number {
    return contact.id;
  }

  compareContact(o1: Pick<IContact, 'id'> | null, o2: Pick<IContact, 'id'> | null): boolean {
    return o1 && o2 ? this.getContactIdentifier(o1) === this.getContactIdentifier(o2) : o1 === o2;
  }

  addContactToCollectionIfMissing<Type extends Pick<IContact, 'id'>>(
    contactCollection: Type[],
    ...contactsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const contacts: Type[] = contactsToCheck.filter(isPresent);
    if (contacts.length > 0) {
      const contactCollectionIdentifiers = contactCollection.map(contactItem => this.getContactIdentifier(contactItem)!);
      const contactsToAdd = contacts.filter(contactItem => {
        const contactIdentifier = this.getContactIdentifier(contactItem);
        if (contactCollectionIdentifiers.includes(contactIdentifier)) {
          return false;
        }
        contactCollectionIdentifiers.push(contactIdentifier);
        return true;
      });
      return [...contactsToAdd, ...contactCollection];
    }
    return contactCollection;
  }

  protected convertDateFromClient<T extends IContact | NewContact | PartialUpdateContact>(contact: T): RestOf<T> {
    return {
      ...contact,
      createdAt: contact.createdAt?.toJSON() ?? null,
      updatedAt: contact.updatedAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restContact: RestContact): IContact {
    return {
      ...restContact,
      createdAt: restContact.createdAt ? dayjs(restContact.createdAt) : undefined,
      updatedAt: restContact.updatedAt ? dayjs(restContact.updatedAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestContact>): HttpResponse<IContact> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestContact[]>): HttpResponse<IContact[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
