import {AfterViewInit, ChangeDetectorRef, Component, ViewChild} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {BlockLabels, BlockService, IBlockData} from "./block-service";
import {CampaignTimelineChanelPlayersModel} from "../../store/imsdb.interfaces_auto";
import {ColorPickerService} from "ngx-color-picker";
import {Tabs} from "../../comps/tabs/tabs";
import {Tab} from "../../comps/tabs/tab";


@Component({
    selector: 'block-prop-container',
    template: `
        <small class="debug">{{me}}</small>
        <tabs>
            <tab [tabtitle]="'style'">
                <block-prop-common [setBlockData]="m_blockData"></block-prop-common>
            </tab>
            <tab [tabtitle]="m_tabTitle">
                <div [ngSwitch]="m_blockTypeSelected">
                    <div *ngSwitchCase="m_blockLabels.BLOCKCODE_IMAGE">
                        <block-prop-image [external]="false" [setBlockData]="m_blockData"></block-prop-image>
                    </div>
                    <div *ngSwitchCase="m_blockLabels.IMAGE">
                        <block-prop-image [external]="true" [setBlockData]="m_blockData"></block-prop-image>
                    </div>
                    <div *ngSwitchCase="m_blockLabels.BLOCKCODE_VIDEO">
                        <block-prop-video [external]="false" [setBlockData]="m_blockData"></block-prop-video>
                    </div>
                    <div *ngSwitchCase="m_blockLabels.EXTERNAL_VIDEO">
                        <block-prop-video [external]="true" [setBlockData]="m_blockData"></block-prop-video>
                    </div>
                    <div *ngSwitchCase="m_blockLabels.MRSS">
                        <block-prop-mrss [setBlockData]="m_blockData"></block-prop-mrss>
                    </div>
                    <div *ngSwitchCase="m_blockLabels.BLOCKCODE_COLLECTION">
                        <block-prop-collection [setBlockData]="m_blockData"></block-prop-collection>
                    </div>
                    <div *ngSwitchCase="m_blockLabels.RSS">
                        <block-prop-rss [setBlockData]="m_blockData"></block-prop-rss>
                    </div>
                    <div *ngSwitchCase="m_blockLabels.LABEL">
                        <block-prop-label [setBlockData]="m_blockData"></block-prop-label>
                    </div>
                    <div *ngSwitchCase="m_blockLabels.QR">
                        <block-prop-qr [setBlockData]="m_blockData"></block-prop-qr>
                    </div>
                    <div *ngSwitchCase="m_blockLabels.CLOCK">
                        <block-prop-clock [setBlockData]="m_blockData"></block-prop-clock>
                    </div>
                    <div *ngSwitchCase="m_blockLabels.HTML">
                        <block-prop-html [setBlockData]="m_blockData"></block-prop-html>
                    </div>
                    <div *ngSwitchCase="m_blockLabels.FASTERQ">
                        <block-prop-fasterq [setBlockData]="m_blockData"></block-prop-fasterq>
                    </div>
                    <div *ngSwitchCase="m_blockLabels.BLOCKCODE_SCENE">
                        <block-prop-scene [setBlockData]="m_blockData"></block-prop-scene>
                    </div>
                    <div *ngSwitchCase="m_blockLabels.LOCATION">
                        <block-prop-location [setBlockData]="m_blockData"></block-prop-location>
                    </div>
                    <div *ngSwitchCase="m_blockLabels.YOUTUBE">
                        <block-prop-youtube [setBlockData]="m_blockData"></block-prop-youtube>
                    </div>
                    <div *ngSwitchCase="m_blockLabels.BLOCKCODE_JSON">
                        <block-prop-json-player [standAlone]="true" [setBlockData]="m_blockData"></block-prop-json-player>
                    </div>
                    <div *ngSwitchCase="m_blockLabels.BLOCKCODE_WORLD_WEATHER">
                        <block-prop-weather [setBlockData]="m_blockData"></block-prop-weather>
                    </div>
                    <div *ngSwitchCase="m_blockLabels.BLOCKCODE_INSTAGRAM">
                        <block-prop-instagram [setBlockData]="m_blockData"></block-prop-instagram>
                    </div>
                    <div *ngSwitchCase="m_blockLabels.BLOCKCODE_DIGG">
                        <block-prop-digg [setBlockData]="m_blockData"></block-prop-digg>
                    </div>
                    <div *ngSwitchCase="m_blockLabels.BLOCKCODE_CALENDAR">
                        <block-prop-calendar [setBlockData]="m_blockData"></block-prop-calendar>
                    </div>
                    <div *ngSwitchCase="m_blockLabels.BLOCKCODE_TWITTERV3">
                        <block-prop-twitter [setBlockData]="m_blockData"></block-prop-twitter>
                    </div>
                    <div *ngSwitchCase="m_blockLabels.BLOCKCODE_GOOGLE_SHEETS">
                        <block-prop-sheets [setBlockData]="m_blockData"></block-prop-sheets>
                    </div>
                    <div *ngSwitchDefault>
                        <h3>no block prop found, new?</h3>
                        {{m_blockTypeSelected}}
                    </div>
                </div>
            </tab>
            <!-- below are JSON based blocked which bind to scenes -->
            <tab #settings [tabtitle]="'settings'">
                <div [ngSwitch]="m_blockTypeSelected">
                    <div *ngSwitchCase="m_blockLabels.BLOCKCODE_WORLD_WEATHER">
                        <block-prop-weather [jsonMode]="true" [setBlockData]="m_blockData"></block-prop-weather>
                    </div>
                    <div *ngSwitchCase="m_blockLabels.BLOCKCODE_INSTAGRAM">
                        <block-prop-instagram [jsonMode]="true" [setBlockData]="m_blockData"></block-prop-instagram>
                    </div>
                    <div *ngSwitchCase="m_blockLabels.BLOCKCODE_DIGG">
                        <block-prop-digg [jsonMode]="true" [setBlockData]="m_blockData"></block-prop-digg>
                    </div>
                    <div *ngSwitchCase="m_blockLabels.BLOCKCODE_CALENDAR">
                        <block-prop-calendar [jsonMode]="true" [setBlockData]="m_blockData"></block-prop-calendar>
                    </div>
                    <div *ngSwitchCase="m_blockLabels.BLOCKCODE_TWITTERV3">
                        <block-prop-twitter [jsonMode]="true" [setBlockData]="m_blockData"></block-prop-twitter>
                    </div>
                    <div *ngSwitchCase="m_blockLabels.BLOCKCODE_GOOGLE_SHEETS">
                        <block-prop-sheets [jsonMode]="true" [setBlockData]="m_blockData"></block-prop-sheets>
                    </div>
                </div>
            </tab>
        </tabs>
    `,
})
export class BlockPropContainer extends Compbaser implements AfterViewInit {

    m_blockTypeSelected: string = 'none';
    m_blockLabels = BlockLabels;
    m_blockData: IBlockData;
    m_tabTitle: string = 'none';

    constructor(private yp: YellowPepperService, private bs: BlockService, private cpService: ColorPickerService, private cd:ChangeDetectorRef) {
        super();
        // console.log(this.bs.getServiceType());

        this.cancelOnDestroy(
            //
            this.yp.listenBlockChannelSelectedOrChanged()
                .mergeMap((i_campaignTimelineChanelPlayersModel: CampaignTimelineChanelPlayersModel) => {
                    return this.bs.getBlockData(i_campaignTimelineChanelPlayersModel.getCampaignTimelineChanelPlayerId())
                })
                .subscribe((blockData: IBlockData) => {
                    this.m_blockTypeSelected = blockData.blockCode;
                    this.m_tabTitle = blockData.blockAcronym;
                    this.m_blockData = blockData;
                    if (!this.settings) return;
                    // for json based scenes show the settings, unless its the actuall Json Player which we don't
                    if (blockData.playerDataJsonHandle && this.m_blockTypeSelected != '4300') {
                        this.settings.show = true;
                    } else {
                        this.settings.show = false;
                    }
                    this.cd.markForCheck();
                }, (e) => console.error(e))
        )
    }

    @ViewChild('settings')
    settings: Tab;


    ngAfterViewInit() {
    }

    ngOnInit() {
    }

    destroy() {
        console.log('dest container');
    }
}