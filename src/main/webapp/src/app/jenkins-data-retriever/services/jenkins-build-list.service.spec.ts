import {TestBed} from '@angular/core/testing';
import {Logger} from '../../../../node_modules/angular2-logger/core';
import {IJenkinsBuild} from 'jenkins-api-ts-typings';
import {JenkinsBuildListService} from './jenkins-build-list.service';

import {TestMockModule} from '../../test-mock/test-mock.module';
import {UtilMockService} from '../../test-mock/services/util.mock.service';
import {JenkinsDataProviderService} from '../../test-mock/services/jenkins-data-provider.service';

describe('JenkinsBuildListService', () => {

    let loggerService: Logger = undefined; 
    let expectedMapSize: number = 3;
    let expectedNumberOfBuilds: number = 36;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [TestMockModule],
            providers: [Logger]
        });

        if (loggerService == undefined || loggerService == null) {
            loggerService = TestBed.get(Logger);
            loggerService.level = 0;
        }
    });

    it('should be created', () => {
        let service: JenkinsBuildListService = new JenkinsBuildListService(new UtilMockService(), loggerService, new Array<any>());

        expect(service).toBeTruthy();
        expect(service.isComplete()).toBeFalsy();
        expect(service.isSuccessful()).toBeFalsy();
    });

    it('getData should return empty when there\'s no jobs in build list', () => {
        let service: JenkinsBuildListService = new JenkinsBuildListService(new UtilMockService(), loggerService, new Array<any>());
        service.execute();

        expect(service.getData().size).toBe(0);
        expect(service.isComplete()).toBeTruthy();
        expect(service.isSuccessful()).toBeFalsy();
    });

    it('getData should return empty for undefined build list', () => {
        let service: JenkinsBuildListService = new JenkinsBuildListService(new UtilMockService(), loggerService, undefined);
        service.execute();

        expect(service.getData().size).toBe(0);
        expect(service.isComplete()).toBeTruthy();
        expect(service.isSuccessful()).toBeFalsy();
    });

    it('getData should return empty for null build list', () => {
        let service: JenkinsBuildListService = new JenkinsBuildListService(new UtilMockService(), loggerService, null);
        service.execute();

        expect(service.getData().size).toBe(0);
        expect(service.isComplete()).toBeTruthy();
        expect(service.isSuccessful()).toBeFalsy();
    });

    it('getData should return correct values for input', () => {
        let utilService = new UtilMockService();
        let service: JenkinsBuildListService = new JenkinsBuildListService(utilService, loggerService, new JenkinsDataProviderService().getData().jobs);
        service.execute();

        expect(service.getData().size).toBe(expectedMapSize);
        expect(utilService.mapToArray(service.getData()).length).toBe(expectedNumberOfBuilds);
        expect(service.isComplete()).toBeTruthy();
        expect(service.isSuccessful()).toBeTruthy();
    });

    it('all builds should have url', () => {
        let utilService = new UtilMockService();
        let service: JenkinsBuildListService = new JenkinsBuildListService(utilService, loggerService, new JenkinsDataProviderService().getData().jobs);
        service.execute();

        utilService.mapToArray(service.getData()).forEach(function(build: IJenkinsBuild) {
            expect(build).toBeDefined("Build was undefined");
            expect(build.url).toBeDefined("Build " + build.id + " had no url");
        });
    });

    it('all builds should have number', () => {
        let utilService = new UtilMockService();
        let service: JenkinsBuildListService = new JenkinsBuildListService(utilService, loggerService, new JenkinsDataProviderService().getData().jobs);
        service.execute();

        utilService.mapToArray(service.getData()).forEach(function(build: IJenkinsBuild) {
            expect(build).toBeDefined("Build was undefined");
            expect(build.number).toBeDefined("Build " + build.url + " had no build number");
        });
    });
});
