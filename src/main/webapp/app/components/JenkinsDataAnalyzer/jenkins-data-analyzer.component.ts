import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { Input } from '@angular/core';

import { UtilService } from '../../Util/services/util.service';
import { Logger } from 'angular2-logger/core';
import { IJenkinsData } from 'jenkins-api-ts-typings';

/**
 * Root component for statistics subcomponents
 */
@Component({
    selector: 'jenkins-data-analyzer',
    templateUrl: 'app/components/JenkinsDataAnalyzer/templates/jenkinsdataanalyzer.template.html',
    providers: [ Logger ],
    entryComponents: [],
})
export class JenkinsDataAnalyzerComponent implements OnInit {
    
    @Input('utilService')
    utilService: UtilService;
    @Input('jenkinsData')
    jenkinsData: IJenkinsData;
    @Input('dataAvailable')
    dataAvailable: boolean;
    
    constructor(private LOGGER:Logger) {}
    
    ngOnInit() {}
    
    analyze(data:IJenkinsData) {}
}