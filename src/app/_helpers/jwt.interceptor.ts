import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthenticationService } from '@app/_services/authentication.service';
import { getCurrencySymbol } from '@angular/common';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(private authenticationService: AuthenticationService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let currentUser = this.authenticationService.currentUserValue;
    if(currentUser && currentUser.data.csession){
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${currentUser.data.csession}`
        }
      });
    }
    return next.handle(request);
  }
}
