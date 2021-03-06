import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/first';

import {ConfigService} from '../../config/services/config.service';
import {ProxyService} from '../../proxy/services/proxy.service';
import {UtilService} from '../../util/services/util.service'
import {Logger} from 'angular2-logger/core';

import {IJenkinsUser} from 'jenkins-api-ts-typings';
import {JenkinsDataRetrieverService} from './JenkinsDataRetrieverService';
import {JenkinsServiceId} from './JenkinsServiceId';

/**
 * Retrieve the jenkins users's details from each user url
 */
export class JenkinsUserService extends JenkinsDataRetrieverService {

    constructor(private config: ConfigService, private proxy: ProxyService, private util: UtilService, private LOGGER: Logger, private userList: Array<IJenkinsUser>) {
        super();
    }

    async execute() {
        if (this.util.isInvalid(this.userList)) {
            this.LOGGER.error("Empty or null user list received");
            this.completedSuccessfully = false;
            this.allItemsRetrievedSuccessfully = false;
            this.complete = true;
            return;
        }

        let i = 0;
        let userPromises: Array<Promise<JSON>> = new Array<Promise<JSON>>();

        for (let user of this.userList) {
            i++;
            this.LOGGER.debug("Retrieving user details for:", user.fullName, "(", i, "/", this.userList.length, ")");
            let userUrl: string = this.getUserApiUrl(user.absoluteUrl, this.config);

            userPromises.push(this.proxy.proxy(userUrl)
                .first()
                .toPromise()
                .catch(() => {
                    this.LOGGER.warn("Error retrieving details for user", user.fullName);
                    this.allItemsRetrievedSuccessfully = false;
                }));
        }

        await Promise.all(userPromises)
            .then(values => {

                for (let userJson of <Array<JSON>> values) {
                    if (this.util.isInvalid(userJson) || !(userJson as JSON).hasOwnProperty("fullName")) {
                        this.LOGGER.warn("No user details found for:", userJson);
                        this.allItemsRetrievedSuccessfully = false;
                        continue;
                    }

                    let user = this.util.getUserByFullName(this.userList, userJson["fullName"]);

                    if (this.util.isInvalid(user)) {
                        this.LOGGER.warn("No user with fullName", userJson["fullName"], "found");
                        this.allItemsRetrievedSuccessfully = false;
                        continue;
                    }

                    user.fromJson(userJson);
                    this.LOGGER.debug("Updated details for user:", user.fullName);
                }

                this.completedSuccessfully = true;
                this.complete = true;
            });

        this.completedSuccessfully = true;
        this.complete = true;
        this.LOGGER.info("User details updated:", this.userList);
    }

    /**
     * Get the users
     */
    getData(): Array<IJenkinsUser> {
        if (this.util.isInvalid(this.userList)) {
            return new Array<IJenkinsUser>();
        }
        
        return this.userList;
    }

    getServiceId() {
        return JenkinsServiceId.Users;
    }

    private getUserApiUrl(userUrl: string, config: ConfigService) {
        if (userUrl === undefined || userUrl === null || userUrl.length === 0) {
            return undefined;
        }
        
        /** Remove trailing slash ('/') from root url, if present, then concatenate the jenkins api suffix */
        return userUrl.replace(/\/$/, "") + '/' + config.apiSuffix;
    }
}