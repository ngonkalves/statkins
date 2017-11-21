import {TestBed} from '@angular/core/testing';

import {JenkinsBasicJobStatisticsService} from './jenkins-basic-job-statistics.service';

import {Logger} from '../../../../node_modules/angular2-logger/core';
import {TestMockModule} from '../../test-mock/test-mock.module';
import {UtilMockService} from '../../test-mock/services/util.mock.service';
import {IJenkinsDataMockService} from '../../test-mock/services/jenkins-data.mock.service';

describe('JenkinsBasicJobStatisticsService', () => {

    let loggerService: Logger = undefined;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TestMockModule],
            providers: [Logger]
        });

        loggerService = TestBed.get(Logger);
    });

    it('should be created', () => {
        let service: JenkinsBasicJobStatisticsService = new JenkinsBasicJobStatisticsService(new UtilMockService(), loggerService, new IJenkinsDataMockService());
        expect(service).toBeTruthy();
    });
});
