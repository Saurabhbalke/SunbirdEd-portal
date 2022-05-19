import { TestBed } from '@angular/core/testing';
import { AuthGuard } from './auth-gard.service';
import { Router, ActivatedRoute, RouterStateSnapshot } from '@angular/router';
import { ConfigService, ResourceService, ToasterService, BrowserCacheTtlService } from '@sunbird/shared';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LearnerService, UserService, PermissionService, CoreModule } from '@sunbird/core';
import { configureTestSuite } from '@sunbird/test-util';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';

// NEW xdescribe
xdescribe('AuthGardService', () => {
    // const authGuard: AuthGuard;
    const router = {
        navigate: jasmine.createSpy('navigate')
    };
    const snapshot = {
        state: jasmine.createSpy('url')
    };
    const activeroutesnapshot = {
        route: jasmine.createSpy('')
    };
    let resourceService;
    configureTestSuite();
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [AuthGuard, PermissionService, ToasterService, UserService, ResourceService, ConfigService, LearnerService,
                BrowserCacheTtlService,
                { provide: Router, useValue: router },
                { provide: RouterStateSnapshot, useValue: snapshot },
                {
                    provide: ActivatedRoute, useValue: {
                        snapshot: {
                            url: [
                                {
                                    path: 'workspace',
                                }
                            ],
                        },
                    }
                }],
            imports: [HttpClientTestingModule, CoreModule,
                        TranslateModule.forRoot({
                          loader: {
                            provide: TranslateLoader,
                            useClass: TranslateFakeLoader
                          }
                        })]
        });
        resourceService = TestBed.inject(ResourceService);
        resourceService.messages = {imsg: {m0035: 'Navigating to home'}};
    });
    it('be able to hit route when user is logged in', () => {
        const authservice:any = TestBed.inject(AuthGuard);
        const snapshotroute = {
            url: [
                {
                    path: 'workspace',
                }
            ],
            data: {}
        };
        const result = authservice.canActivate(snapshotroute, RouterStateSnapshot);
        expect(result).toBeTruthy();
    });

    it('canLoad should return false if user not logged in', () => {
        const userService:any = TestBed.inject(UserService);
        const authservice:any = TestBed.inject(AuthGuard);
        spyOnProperty(userService, 'loggedIn', 'get').and.returnValue(false);
        expect(authservice.canLoad()).toBeFalsy();
    });

    it('canLoad should return true if user is logged in', () => {
        const userService:any = TestBed.inject(UserService);
        const authservice:any = TestBed.inject(AuthGuard);
        spyOnProperty(userService, 'loggedIn', 'get').and.returnValue(true);
        expect(authservice.canLoad()).toBeTruthy();
    });
    it('should navigate to home', () => {
        const userService:any = TestBed.inject(UserService);
        const authservice:any = TestBed.inject(AuthGuard);
        const toasterService:any = TestBed.inject(ToasterService);
        spyOnProperty(userService, 'loggedIn', 'get').and.returnValue(true);
        spyOn(toasterService, 'warning').and.returnValue(true);
        authservice.navigateToHome({
            next() { },
            complete() { },
        });
        expect(router.navigate).toHaveBeenCalled();
        expect(toasterService.warning).toHaveBeenCalled();
    });
    it('should return true if user has rootOrgAdmin role', () => {
        const userService:any = TestBed.inject(UserService);
        const authservice:any = TestBed.inject(AuthGuard);
        userService['_userData$'].next({ err: null, userProfile: {} as any });
        spyOnProperty(userService, 'userProfile', 'get').and.returnValue({rootOrgAdmin: true});
        authservice.getPermission('rootOrgAdmin').subscribe((data) => {
            expect(data).toBeTruthy();
        });
    });
    it('should navigate to home if role is rootOrgAdmin and user dosnt have rootOrgAdmin role', () => {
        const userService:any = TestBed.inject(UserService);
        const authservice:any = TestBed.inject(AuthGuard);
        const toasterService:any = TestBed.inject(ToasterService);
        spyOnProperty(userService, 'loggedIn', 'get').and.returnValue(true);
        spyOn(toasterService, 'warning').and.returnValue(true);
        userService['_userData$'].next({ err: null, userProfile: {} as any});
        spyOnProperty(userService, 'userProfile', 'get').and.returnValue({rootOrgAdmin: false});
        authservice.getPermission('rootOrgAdmin').subscribe((data) => {
            expect(data).toBeFalsy();
            expect(router.navigate).toHaveBeenCalled();
            expect(toasterService.warning).toHaveBeenCalled();
        });
    });
    it('should navigate to home if permission is not fetched or error occurred while fetching permission', () => {
        const permissionService = TestBed.inject(PermissionService);
        const authservice:any = TestBed.inject(AuthGuard);
        const toasterService:any = TestBed.inject(ToasterService);
        spyOn(toasterService, 'warning').and.returnValue(true);
        permissionService['permissionAvailable$'].next('error');
        authservice.getPermission('creator').subscribe((data) => {
            expect(data).toBeFalsy();
            expect(router.navigate).toHaveBeenCalled();
            expect(toasterService.warning).toHaveBeenCalled();
        });
    });
    it('should navigate to home if passed role is not configured in config service', () => {
        const permissionService = TestBed.inject(PermissionService);
        const authservice:any = TestBed.inject(AuthGuard);
        const toasterService:any = TestBed.inject(ToasterService);
        spyOn(toasterService, 'warning').and.returnValue(true);
        permissionService['permissionAvailable$'].next('success');
        authservice.getPermission('unknown_role').subscribe((data) => {
            expect(data).toBeFalsy();
            expect(router.navigate).toHaveBeenCalled();
            expect(toasterService.warning).toHaveBeenCalled();
        });
    });
    it('should navigate to home if user dosnt have proper role', () => {
        const permissionService = TestBed.inject(PermissionService);
        const authservice:any = TestBed.inject(AuthGuard);
        const toasterService:any = TestBed.inject(ToasterService);
        spyOn(toasterService, 'warning').and.returnValue(true);
        permissionService['permissionAvailable$'].next('success');
        authservice.getPermission('announcement').subscribe((data) => {
            expect(data).toBeFalsy();
            expect(router.navigate).toHaveBeenCalled();
            expect(toasterService.warning).toHaveBeenCalled();
        });
    });
    it('should return true if user has propper role', () => {
        const permissionService = TestBed.inject(PermissionService);
        const authservice:any = TestBed.inject(AuthGuard);
        const toasterService:any = TestBed.inject(ToasterService);
        spyOn(toasterService, 'warning').and.returnValue(true);
        permissionService['permissionAvailable$'].next('success');
        spyOn(permissionService, 'checkRolesPermissions').and.returnValue(true);
        authservice.getPermission('announcement').subscribe((data) => {
            expect(data).toBeTruthy();
        });
    });
});
