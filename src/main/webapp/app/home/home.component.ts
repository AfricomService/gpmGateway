import { Component, isDevMode, OnInit } from '@angular/core';

import { LoginService } from 'app/login/login.service';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';

@Component({
  selector: 'jhi-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  account: Account | null = null;
  isDev = isDevMode();

  constructor(private accountService: AccountService, private loginService: LoginService) {}

  ngOnInit(): void {
    this.accountService.identity().subscribe(account => {
      this.account = account;
      if (!this.isDev && !account) {
        this.login();
      }
    });
    // In production, start authentication automatically
    // if the user is not authenticated.
  }

  login(): void {
    this.loginService.login();
  }
}
