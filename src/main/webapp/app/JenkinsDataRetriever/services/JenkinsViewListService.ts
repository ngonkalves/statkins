import { Injectable } from '@angular/core';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/first';

import { ConfigService } from '../../Config/services/config.service';
import { ProxyService } from '../../Proxy/services/proxy.service';
import { UtilService } from '../../Util/services/util.service';
import { Logger } from 'angular2-logger/core';

import { IJenkinsView } from 'jenkins-api-ts-typings';
import { JenkinsView } from 'jenkins-api-ts-typings';

import { IJenkinsService } from './IJenkinsService';
import { JenkinsServiceId } from './JenkinsServiceId';

/**
 * Retrieve the list of jenkins views from the root url. Each view only contains the name and the view url. 
 * This list will be used later to retrieve mode detailed information for each views
 */
@Injectable()
export class JenkinsViewListService implements IJenkinsService {
    readonly jenkinsViewListUrl: string;
    
    private viewList: Array<IJenkinsView>;
    private complete: boolean = false;
    private completedSuccessfully: boolean = false;
    
    constructor(private config: ConfigService, private proxy: ProxyService, private util: UtilService, private LOGGER:Logger, private url: string) {
        this.jenkinsViewListUrl = this.getJenkinsViewJobListUrl(this.url, this.config);
        this.viewList = new Array<IJenkinsView>();
    }
    
    async execute() {
        let viewListResponse:JSON;
        
        this.LOGGER.debug("Retrieving view list from:", this.jenkinsViewListUrl);
        
        await this.proxy.proxy(this.jenkinsViewListUrl)
                .first().toPromise()
                .then(value => viewListResponse = value)
                .catch(error => {
                    this.LOGGER.error("Could not retrieve view list:", error);
                    this.completedSuccessfully = false;
                    this.complete = true;
                });
            
        /* An error occurred, view list unretrievable */
        if (this.util.isInvalid(viewListResponse)) {
            this.viewList = new Array<IJenkinsView>();
            this.completedSuccessfully = false;
            this.complete = true;
            return;
        }
                
        this.LOGGER.debug("Received response:", viewListResponse);
        
        for (let view of viewListResponse["views"]) {
            let jenkinsView:IJenkinsView = new JenkinsView();
            jenkinsView.fromJson(view);
            this.viewList.push(jenkinsView);
        }
        
        this.LOGGER.info("View List (" + this.getData().length, "views found):", this.getData());
        this.completedSuccessfully = true;
        this.complete = true;
    }
    
    /**
     * Get the jobs
     */
    getData():Array<IJenkinsView> {
        return Object.assign([], this.viewList);
    }
    
    getServiceId() {
        return JenkinsServiceId.ViewList;
    }
    
    isComplete(): boolean {
        return this.complete;
    }
    
    isSuccessful(): boolean {
        return this.completedSuccessfully;
    }
    
    private getJenkinsViewJobListUrl(jenkinsUrl: string, config: ConfigService) {
        /** Remove trailing slash ('/') from root url, if present, then concatenate the jenkins api suffix */
        return jenkinsUrl.replace(/\/$/, "") + '/' + config.apiSuffix + '?tree=views[name,url]';
    }
}