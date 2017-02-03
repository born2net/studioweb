/**
 * extend msdb.interfaces_auto with additional functionality
 * requirement: same name as extended class / model + Ext
 */


import {CampaignsModel} from "../imsdb.interfaces_auto";

export class CampaignsModelExt extends CampaignsModel {

    public getCampaignPlaylistModeName(): string {
        if (this.getCampaignPlaylistMode() == 0) {
            return 'sequencer'
        } else {
            return 'scheduler'
        }
    }

}